require('dotenv').config();
const fs = require('fs');
const connectDB = require('../config/db');
const Catalogue = require('../models/Catalogue');
const { savePdfFromPath } = require('../utils/catalogueStorage');

(async () => {
  await connectDB();
  const items = await Catalogue.find();
  let uploaded = 0;

  for (const item of items) {
    if (item.gridFsId) {
      console.log('skip', item.title, item.gridFsId);
      continue;
    }
    if (!item.filePath || !fs.existsSync(item.filePath)) {
      console.warn('missing local file', item.title, item.filePath);
      continue;
    }
    item.gridFsId = await savePdfFromPath(item.filePath, item.fileName);
    await item.save();
    uploaded += 1;
    console.log('uploaded', item.title, item.gridFsId);
  }

  console.log(`done. uploaded ${uploaded} of ${items.length}`);
  process.exit(0);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
