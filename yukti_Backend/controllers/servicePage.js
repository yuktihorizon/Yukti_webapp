const ServicePage = require('../models/ServicePage');
const { defaultServicePageDocument } = require('../utils/servicePageDefaults');

exports.getServicePage = async (req, res) => {
  try {
    let doc = await ServicePage.findOne({ pageKey: 'main' }).lean();
    if (!doc) {
      const created = await ServicePage.create(defaultServicePageDocument);
      doc = created.toObject();
    }
    const { __v, ...rest } = doc;
    res.json(rest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load service page' });
  }
};

exports.getServicePageAdmin = async (req, res) => {
  try {
    let doc = await ServicePage.findOne({ pageKey: 'main' }).lean();
    if (!doc) {
      const created = await ServicePage.create(defaultServicePageDocument);
      doc = created.toObject();
    }
    const { __v, ...rest } = doc;
    res.json(rest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load service page' });
  }
};

exports.updateServicePage = async (req, res) => {
  try {
    const { capabilityBlocks } = req.body;

    if (!capabilityBlocks || !Array.isArray(capabilityBlocks)) {
      return res.status(400).json({
        error: 'Request body must include capabilityBlocks array',
      });
    }

    const doc = await ServicePage.findOneAndUpdate(
      { pageKey: 'main' },
      { $set: { capabilityBlocks } },
      { new: true, upsert: true }
    ).lean();

    const { __v, ...out } = doc;
    res.json(out);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update service page' });
  }
};
