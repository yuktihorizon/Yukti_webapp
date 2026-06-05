const Blog = require('../models/Blog');
const cloudinary = require('../config/cloudinary');

async function uploadToCloudinary(file) {
  const b64 = file.buffer.toString('base64');
  const dataUri = `data:${file.mimetype};base64,${b64}`;
  const result = await cloudinary.uploader.upload(dataUri, { folder: 'yukti/blog' });
  return result.secure_url;
}

exports.getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.status(200).json(blogs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
};

exports.createBlog = async (req, res) => {
  const { title, description, category, content, shortTitle, detailTitle, coverText } = req.body;

  if (!title) return res.status(400).json({ error: 'Title is required' });
  if (!category || !['Images', 'Articles', 'Presentations'].includes(category)) {
    return res.status(400).json({ error: 'Valid category is required (Images, Articles, Presentations)' });
  }

  try {
    let imageUrl = '';
    const coverFile = req.files?.image?.[0] || req.files?.file?.[0];
    if (coverFile) {
      imageUrl = await uploadToCloudinary(coverFile);
    }
    if (!imageUrl) return res.status(400).json({ error: 'Cover image is required' });

    const blogData = { title, description, category, image: imageUrl };

    if (category === 'Articles') {
      blogData.content = content ? JSON.parse(content) : [];
    }

    if (category === 'Images') {
      blogData.shortTitle = shortTitle || '';
      blogData.detailTitle = detailTitle || '';
      const galleryFiles = req.files?.images || [];
      const galleryUrls = [];
      for (const file of galleryFiles) {
        const url = await uploadToCloudinary(file);
        galleryUrls.push(url);
      }
      blogData.images = [imageUrl, ...galleryUrls];
    }

    if (category === 'Presentations') {
      blogData.coverText = coverText || '';
      blogData.detailTitle = detailTitle || '';
      const slideFiles = req.files?.slides || [];
      const slideUrls = [];
      for (const file of slideFiles) {
        const url = await uploadToCloudinary(file);
        slideUrls.push(url);
      }
      blogData.slides = slideUrls;
    }

    const blog = await Blog.create(blogData);
    res.status(201).json(blog);
  } catch (err) {
    console.error('Blog create error:', err);
    res.status(500).json({ error: 'Failed to create blog' });
  }
};

exports.updateBlog = async (req, res) => {
  const { title, description, category, content, shortTitle, detailTitle, coverText, existingImages, existingSlides } = req.body;

  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: 'Blog not found' });

    const update = {};
    if (title) update.title = title;
    if (description !== undefined) update.description = description;
    if (category) update.category = category;

    const coverFile = req.files?.image?.[0] || req.files?.file?.[0];
    if (coverFile) {
      update.image = await uploadToCloudinary(coverFile);
    }

    const cat = category || blog.category;

    if (cat === 'Articles') {
      update.content = content ? JSON.parse(content) : blog.content;
    }

    if (cat === 'Images') {
      if (shortTitle !== undefined) update.shortTitle = shortTitle;
      if (detailTitle !== undefined) update.detailTitle = detailTitle;

      let kept = existingImages ? JSON.parse(existingImages) : blog.images || [];
      const galleryFiles = req.files?.images || [];
      for (const file of galleryFiles) {
        const url = await uploadToCloudinary(file);
        kept.push(url);
      }
      update.images = kept;
    }

    if (cat === 'Presentations') {
      if (coverText !== undefined) update.coverText = coverText;
      if (detailTitle !== undefined) update.detailTitle = detailTitle;

      let kept = existingSlides ? JSON.parse(existingSlides) : blog.slides || [];
      const slideFiles = req.files?.slides || [];
      for (const file of slideFiles) {
        const url = await uploadToCloudinary(file);
        kept.push(url);
      }
      update.slides = kept;
    }

    const updated = await Blog.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(updated);
  } catch (err) {
    console.error('Blog update error:', err);
    res.status(500).json({ error: 'Failed to update blog' });
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    res.json({ message: 'Blog deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete blog' });
  }
};
