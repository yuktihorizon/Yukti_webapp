const Category = require('../models/Category');
const { MAIN_CATEGORIES } = require('../constants/mainCategories');

exports.createCategory = async (req, res) => {
  try {
    const { name, mainCategory } = req.body;
    const normalizedName = typeof name === 'string' ? name.trim() : '';
    if (!normalizedName) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const resolvedMainCategory = mainCategory?.trim() || 'Consumer Products';
    if (!MAIN_CATEGORIES.includes(resolvedMainCategory)) {
      return res.status(400).json({ error: `Invalid main category. Must be one of: ${MAIN_CATEGORIES.join(', ')}` });
    }

    const slug = normalizedName.toLowerCase().replace(/\s+/g, '-');

    const existing = await Category.findOne({ slug });
    if (existing) {
      return res.status(400).json({ error: 'Category already exists' });
    }

    const category = new Category({ name: normalizedName, slug, mainCategory: resolvedMainCategory });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create category' });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const { mainCategory } = req.query;
    const query = mainCategory ? { mainCategory: mainCategory.trim() } : {};
    const categories = await Category.find(query).sort('name');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

exports.getMainCategories = async (_req, res) => {
  try {
    res.json(MAIN_CATEGORIES);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch main categories' });
  }
};
