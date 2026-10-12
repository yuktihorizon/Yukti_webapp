const fs = require('fs');
const path = require('path');
const Catalogue = require('../models/Catalogue');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');
const { prepareCoverBuffer } = require('../utils/compressCatalogue');
const {
  savePdfFile,
  savePdfFromPath,
  deletePdf,
  openPdfStream,
  getPdfInfo,
} = require('../utils/catalogueStorage');

const CATALOGUE_DIR = path.join(__dirname, '../uploads/catalogues');

const uploadBuffer = (buffer, options) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (result) resolve(result);
      else reject(error || new Error('Cloudinary upload failed'));
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });

const ensureCatalogueDir = () => {
  fs.mkdirSync(CATALOGUE_DIR, { recursive: true });
};

const safeFileName = (name = 'catalogue.pdf') =>
  name.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/-+/g, '-').slice(0, 80) || 'catalogue.pdf';

const saveOriginalPdf = async (file) => {
  ensureCatalogueDir();
  const filename = `${Date.now()}-${safeFileName(file.originalname)}`;
  const filePath = path.join(CATALOGUE_DIR, filename);
  await fs.promises.writeFile(filePath, file.buffer);
  return filePath;
};

const removeLocalPdf = async (filePath) => {
  if (!filePath) return;
  await fs.promises.unlink(filePath).catch(() => {});
};

const publicPdfUrl = (req, id) => {
  const forwarded = (req.headers['x-forwarded-proto'] || '').split(',')[0].trim();
  const proto = forwarded || req.protocol || 'https';
  const host = req.get('host');
  const envBase = (process.env.BACKEND_PUBLIC_URL || '').replace(/\/$/, '');
  const base = envBase || `${proto}://${host}`;
  return `${base.replace(/\/$/, '')}/api/catalogues/${id}/file`;
};

const toCatalogueJson = (req, doc) => {
  const item = doc.toObject ? doc.toObject() : { ...doc };
  item.pdfUrl = publicPdfUrl(req, item._id);
  return item;
};

const uploadCover = async (file) => {
  const prepared = await prepareCoverBuffer(file);
  if (!prepared) return null;
  return uploadBuffer(prepared.buffer, {
    folder: 'yukti/catalogues/covers',
    resource_type: 'image',
  });
};

const destroyAsset = async (publicId, resourceType = 'raw') => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (err) {
    console.warn('Cloudinary destroy failed:', err.message);
  }
};

const isPdfFile = (file) => {
  if (!file) return false;
  const name = (file.originalname || '').toLowerCase();
  return file.mimetype === 'application/pdf' || name.endsWith('.pdf');
};

exports.getPublishedCatalogues = async (req, res) => {
  try {
    const catalogues = await Catalogue.find({ published: true }).sort({ createdAt: -1 });
    res.json(catalogues.map((item) => toCatalogueJson(req, item)));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch catalogues' });
  }
};

exports.getAllCatalogues = async (req, res) => {
  try {
    const catalogues = await Catalogue.find().sort({ createdAt: -1 });
    res.json(catalogues.map((item) => toCatalogueJson(req, item)));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch catalogues' });
  }
};

const sendPdfHeaders = (res, fileName) => {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${safeFileName(fileName)}"`);
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('X-Content-Type-Options', 'nosniff');
};

exports.streamCataloguePdf = async (req, res) => {
  try {
    const catalogue = await Catalogue.findById(req.params.id);
    if (!catalogue) return res.status(404).json({ error: 'Catalogue not found' });

    if (catalogue.filePath && fs.existsSync(catalogue.filePath)) {
      sendPdfHeaders(res, catalogue.fileName);
      const stat = fs.statSync(catalogue.filePath);
      res.setHeader('Content-Length', stat.size);
      return fs.createReadStream(catalogue.filePath).pipe(res);
    }

    if (catalogue.gridFsId) {
      const download = openPdfStream(catalogue.gridFsId);
      if (!download) return res.status(404).json({ error: 'PDF file is missing' });
      sendPdfHeaders(res, catalogue.fileName);
      const info = await getPdfInfo(catalogue.gridFsId);
      if (info?.length) res.setHeader('Content-Length', info.length);
      download.on('error', (err) => {
        console.error(err);
        if (!res.headersSent) res.status(404).json({ error: 'PDF file is missing' });
      });
      return download.pipe(res);
    }

    return res.status(404).json({ error: 'PDF file is missing' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to open catalogue' });
  }
};

exports.createCatalogue = async (req, res) => {
  const title = (req.body.title || '').trim();
  const description = (req.body.description || '').trim();
  const published = req.body.published !== 'false';
  const pdfFile = req.files?.pdf?.[0];
  const coverFile = req.files?.cover?.[0];

  if (!title) return res.status(400).json({ error: 'Title is required' });
  if (!pdfFile) return res.status(400).json({ error: 'A PDF file is required' });
  if (!isPdfFile(pdfFile)) return res.status(400).json({ error: 'Only PDF files are allowed' });

  try {
    const [filePath, gridFsId] = await Promise.all([
      saveOriginalPdf(pdfFile),
      savePdfFile(pdfFile),
    ]);
    let coverUrl = '';
    let coverPublicId = '';

    if (coverFile) {
      const coverUpload = await uploadCover(coverFile);
      coverUrl = coverUpload.secure_url;
      coverPublicId = coverUpload.public_id;
    }

    const catalogue = await Catalogue.create({
      title,
      description,
      pdfUrl: 'pending',
      filePath,
      gridFsId,
      coverUrl,
      coverPublicId,
      fileName: pdfFile.originalname,
      fileSize: pdfFile.size,
      published,
    });
    catalogue.pdfUrl = publicPdfUrl(req, catalogue._id);
    await catalogue.save();

    res.status(201).json(toCatalogueJson(req, catalogue));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Failed to upload catalogue' });
  }
};

exports.updateCatalogue = async (req, res) => {
  try {
    const catalogue = await Catalogue.findById(req.params.id);
    if (!catalogue) return res.status(404).json({ error: 'Catalogue not found' });

    const title = (req.body.title || '').trim();
    const description = (req.body.description || '').trim();
    const pdfFile = req.files?.pdf?.[0];
    const coverFile = req.files?.cover?.[0];

    if (title) catalogue.title = title;
    if (req.body.description !== undefined) catalogue.description = description;
    if (req.body.published !== undefined) {
      catalogue.published = req.body.published !== 'false';
    }

    if (pdfFile) {
      if (!isPdfFile(pdfFile)) {
        return res.status(400).json({ error: 'Only PDF files are allowed' });
      }
      const [filePath, gridFsId] = await Promise.all([
        saveOriginalPdf(pdfFile),
        savePdfFile(pdfFile),
      ]);
      await Promise.all([removeLocalPdf(catalogue.filePath), deletePdf(catalogue.gridFsId)]);
      catalogue.filePath = filePath;
      catalogue.gridFsId = gridFsId;
      catalogue.fileName = pdfFile.originalname;
      catalogue.fileSize = pdfFile.size;
      catalogue.pdfUrl = publicPdfUrl(req, catalogue._id);
    }

    if (coverFile) {
      const coverUpload = await uploadCover(coverFile);
      await destroyAsset(catalogue.coverPublicId, 'image');
      catalogue.coverUrl = coverUpload.secure_url;
      catalogue.coverPublicId = coverUpload.public_id;
    }

    await catalogue.save();
    res.json(toCatalogueJson(req, catalogue));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Failed to update catalogue' });
  }
};

exports.deleteCatalogue = async (req, res) => {
  try {
    const catalogue = await Catalogue.findByIdAndDelete(req.params.id);
    if (!catalogue) return res.status(404).json({ error: 'Catalogue not found' });

    await Promise.all([
      removeLocalPdf(catalogue.filePath),
      deletePdf(catalogue.gridFsId),
      destroyAsset(catalogue.coverPublicId, 'image'),
    ]);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete catalogue' });
  }
};
