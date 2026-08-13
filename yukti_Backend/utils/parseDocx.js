const JSZip = require('jszip');

const MIME_BY_EXT = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  bmp: 'image/bmp',
};

/**
 * Parse a .docx buffer into ordered text + image blocks (document order).
 * Used to build presentation-style concept posts.
 */
async function parseDocx(buffer) {
  const zip = await JSZip.loadAsync(buffer);
  const docXml = await zip.file('word/document.xml')?.async('string');
  if (!docXml) {
    throw new Error('Invalid Word file — document.xml not found');
  }

  const relsXml = await zip.file('word/_rels/document.xml.rels')?.async('string');
  const relMap = {};
  if (relsXml) {
    for (const match of relsXml.matchAll(/Relationship[^>]*Id="([^"]+)"[^>]*Target="([^"]+)"/g)) {
      let target = match[2].replace(/^\.\.\//, '');
      if (!target.startsWith('word/')) {
        target = `word/${target}`;
      }
      relMap[match[1]] = target;
    }
  }

  const items = [];
  const paragraphs = docXml.match(/<w:p[\s>][\s\S]*?<\/w:p>/g) || [];

  for (const para of paragraphs) {
    const text = [...para.matchAll(/<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g)]
      .map((m) => m[1])
      .join('')
      .replace(/\s+/g, ' ')
      .trim();

    if (text) {
      items.push({ type: 'text', content: text });
    }

    const embeds = [...para.matchAll(/r:embed="(rId\d+)"/g)];
    for (const embed of embeds) {
      const target = relMap[embed[1]];
      if (!target) continue;

      const file = zip.file(target);
      if (!file) continue;

      const ext = target.split('.').pop()?.toLowerCase() || 'jpeg';
      const mime = MIME_BY_EXT[ext] || 'image/jpeg';
      const imgBuffer = await file.async('nodebuffer');
      items.push({ type: 'image', buffer: imgBuffer, mime });
    }
  }

  if (!items.length) {
    throw new Error('Word file appears empty');
  }

  const textBlocks = items.filter((i) => i.type === 'text').map((i) => i.content);
  const title = textBlocks[0]?.slice(0, 160) || 'Imported document';
  const description = textBlocks.slice(0, 3).join('\n\n').slice(0, 600);

  return { title, description, items };
}

module.exports = { parseDocx };
