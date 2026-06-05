const Category = require('../models/Category');

exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const normalizedName = typeof name === 'string' ? name.trim() : '';
    if (!normalizedName) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    const slug = normalizedName.toLowerCase().replace(/\s+/g, '-');

    const existing = await Category.findOne({ slug });
    if (existing) {
      return res.status(400).json({ error: 'Category already exists' });
    }

    const category = new Category({ name: normalizedName, slug });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create category' });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort('name');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};
