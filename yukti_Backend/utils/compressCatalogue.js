const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const sharp = require('sharp');
const { PDFDocument } = require('pdf-lib');

const CLOUDINARY_SAFE_BYTES = Math.floor(9.5 * 1024 * 1024);
const COVER_SAFE_BYTES = 1.5 * 1024 * 1024;

function whichGs() {
  const names = ['gs', '/opt/homebrew/bin/gs', '/usr/local/bin/gs', '/usr/bin/gs'];
  for (const name of names) {
    try {
      if (name === 'gs') {
        const { execSync } = require('child_process');
        execSync('command -v gs', { stdio: 'ignore' });
        return 'gs';
      }
      if (fs.existsSync(name)) return name;
    } catch {
      /* try next */
    }
  }
  return null;
}

function runGs(bin, inputPath, outputPath, preset) {
  return new Promise((resolve, reject) => {
    const proc = spawn(bin, [
      '-sDEVICE=pdfwrite',
      '-dCompatibilityLevel=1.4',
      `-dPDFSETTINGS=/${preset}`,
      '-dNOPAUSE',
      '-dQUIET',
      '-dBATCH',
      `-sOutputFile=${outputPath}`,
      inputPath,
    ]);
    proc.on('error', reject);
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Ghostscript exited with ${code}`));
    });
  });
}

async function compressWithGhostscript(buffer) {
  const bin = whichGs();
  if (!bin) return null;

  const dir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'yukti-pdf-'));
  const inputPath = path.join(dir, 'in.pdf');
  await fs.promises.writeFile(inputPath, buffer);

  try {
    for (const preset of ['ebook', 'screen']) {
      const outputPath = path.join(dir, `${preset}.pdf`);
      await runGs(bin, inputPath, outputPath, preset);
      const out = await fs.promises.readFile(outputPath);
      if (out.length > 1000 && out.length < buffer.length) {
        buffer = out;
      }
      if (buffer.length <= CLOUDINARY_SAFE_BYTES) return buffer;
    }
    return buffer;
  } catch {
    return null;
  } finally {
    await fs.promises.rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

function presetsFor(pageCount) {
  if (pageCount > 50) {
    return [
      { scale: 0.9, quality: 52 },
      { scale: 0.7, quality: 42 },
    ];
  }
  if (pageCount > 25) {
    return [
      { scale: 1.1, quality: 62 },
      { scale: 0.85, quality: 50 },
    ];
  }
  return [
    { scale: 1.25, quality: 70 },
    { scale: 1.0, quality: 58 },
    { scale: 0.85, quality: 48 },
  ];
}

async function compressWithRasterize(buffer) {
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const probe = await pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
    disableWorker: true,
    useSystemFonts: true,
    verbosity: 0,
  }).promise;
  const pageCount = probe.numPages;
  if (typeof probe.cleanup === 'function') probe.cleanup();

  let best = buffer;
  for (const preset of presetsFor(pageCount)) {
    const next = await rasterizePdf(pdfjsLib, buffer, preset);
    if (next.length < best.length) best = next;
    if (best.length <= CLOUDINARY_SAFE_BYTES) return best;
  }
  return best;
}

async function rasterizePdf(pdfjsLib, inputBuffer, { scale, quality }) {
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(inputBuffer),
    disableWorker: true,
    useSystemFonts: true,
    verbosity: 0,
  });
  const pdf = await loadingTask.promise;
  const out = await PDFDocument.create();

  for (let i = 1; i <= pdf.numPages; i += 1) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });
    const width = Math.max(1, Math.ceil(viewport.width));
    const height = Math.max(1, Math.ceil(viewport.height));
    const canvasAndContext = pdf.canvasFactory.create(width, height);

    await page.render({
      canvas: canvasAndContext.canvas,
      canvasContext: canvasAndContext.context,
      viewport,
    }).promise;

    const raw = canvasAndContext.canvas.toBuffer('image/png');
    const jpeg = await sharp(raw)
      .jpeg({ quality, mozjpeg: true, chromaSubsampling: '4:2:0' })
      .toBuffer();

    const image = await out.embedJpg(jpeg);
    const outPage = out.addPage([image.width, image.height]);
    outPage.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });

    pdf.canvasFactory.destroy(canvasAndContext);
  }

  if (typeof pdf.cleanup === 'function') pdf.cleanup();
  return Buffer.from(await out.save({ useObjectStreams: true }));
}

async function preparePdfBuffer(buffer) {
  if (!buffer || buffer.length <= CLOUDINARY_SAFE_BYTES) {
    return { buffer, compressed: false };
  }

  const fromGs = await compressWithGhostscript(buffer);
  if (fromGs && fromGs.length <= CLOUDINARY_SAFE_BYTES) {
    return { buffer: fromGs, compressed: true };
  }

  const source = fromGs && fromGs.length < buffer.length ? fromGs : buffer;
  const rasterized = await compressWithRasterize(source);
  const chosen = rasterized.length < source.length ? rasterized : source;

  if (chosen.length > CLOUDINARY_SAFE_BYTES) {
    throw new Error(
      'This PDF is still too large after compression. Please try a lighter file (under 10 MB after compression).'
    );
  }

  return { buffer: chosen, compressed: true };
}

async function prepareCoverBuffer(file) {
  if (!file?.buffer) return null;

  let image = sharp(file.buffer).rotate();
  const meta = await image.metadata();
  if (!meta.width) {
    return { buffer: file.buffer, mimetype: file.mimetype };
  }

  image = image.resize(1600, 1600, { fit: 'inside', withoutEnlargement: true });
  let quality = 78;
  let buffer = await image.jpeg({ quality, mozjpeg: true }).toBuffer();

  while (buffer.length > COVER_SAFE_BYTES && quality > 45) {
    quality -= 12;
    buffer = await sharp(file.buffer)
      .rotate()
      .resize(1400, 1400, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();
  }

  return { buffer, mimetype: 'image/jpeg' };
}

module.exports = {
  CLOUDINARY_SAFE_BYTES,
  preparePdfBuffer,
  prepareCoverBuffer,
};
