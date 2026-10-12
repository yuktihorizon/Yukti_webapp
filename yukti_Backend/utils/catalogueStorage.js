const fs = require('fs');
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

const BUCKET = 'catalogues';

function getBucket() {
  if (!mongoose.connection?.db) {
    throw new Error('MongoDB is not connected');
  }
  return new GridFSBucket(mongoose.connection.db, { bucketName: BUCKET });
}

function asObjectId(id) {
  if (!id) return null;
  try {
    return new mongoose.Types.ObjectId(String(id));
  } catch {
    return null;
  }
}

function savePdfBuffer(buffer, filename, contentType = 'application/pdf') {
  const bucket = getBucket();
  const upload = bucket.openUploadStream(filename || 'catalogue.pdf', {
    contentType,
    metadata: { originalName: filename || 'catalogue.pdf' },
  });

  return new Promise((resolve, reject) => {
    upload.on('error', reject);
    upload.on('finish', () => resolve(upload.id.toString()));
    upload.end(buffer);
  });
}

async function savePdfFile(file) {
  return savePdfBuffer(file.buffer, file.originalname, file.mimetype || 'application/pdf');
}

async function savePdfFromPath(filePath, filename) {
  const buffer = await fs.promises.readFile(filePath);
  return savePdfBuffer(buffer, filename);
}

async function deletePdf(id) {
  const objectId = asObjectId(id);
  if (!objectId) return;
  try {
    await getBucket().delete(objectId);
  } catch (err) {
    if (err?.code !== 'ENOENT' && err?.message !== 'File not found') {
      console.warn('GridFS delete failed:', err.message);
    }
  }
}

function openPdfStream(id) {
  const objectId = asObjectId(id);
  if (!objectId) return null;
  return getBucket().openDownloadStream(objectId);
}

async function getPdfInfo(id) {
  const objectId = asObjectId(id);
  if (!objectId) return null;
  return mongoose.connection.db.collection('catalogues.files').findOne({ _id: objectId });
}

module.exports = {
  savePdfFile,
  savePdfFromPath,
  deletePdf,
  openPdfStream,
  getPdfInfo,
};
