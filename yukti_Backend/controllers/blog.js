const Blog = require('../models/Blog');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');
const { parseDocx } = require('../utils/parseDocx');

const uploadBufferToCloudinary = (buffer, mime = 'image/jpeg') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'yukti/blog', resource_type: 'image' },
      (error, result) => {
        if (result) resolve(result.secure_url);
        else reject(error || new Error('Cloudinary upload failed'));
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

async function uploadToCloudinary(file) {
  if (file.buffer) {
    return uploadBufferToCloudinary(file.buffer, file.mimetype);
  }
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

exports.importDocx = async (req, res) => {
  const docxFile = req.file || req.files?.docx?.[0];
  if (!docxFile) {
    return res.status(400).json({ error: 'Word file (.docx) is required' });
  }

  const { title: titleOverride, description: descOverride } = req.body;
  const coverOverride = req.files?.image?.[0];

  try {
    const parsed = await parseDocx(docxFile.buffer);
    const articleBlocks = [];
    let coverUrl = '';

    for (const item of parsed.items) {
      if (item.type === 'text') {
        articleBlocks.push({ type: 'text', content: item.content });
        continue;
      }

      const url = await uploadBufferToCloudinary(item.buffer, item.mime);
      if (!coverUrl) coverUrl = url;
      articleBlocks.push({ type: 'image', content: url });
    }

    if (coverOverride) {
      coverUrl = await uploadToCloudinary(coverOverride);
    }

    if (!coverUrl) {
      return res.status(400).json({
        error: 'This Word file has no images. Upload an optional cover image, or add images inside the document.',
      });
    }

    const title = (titleOverride || parsed.title || 'Imported document').trim();
    const textParagraphs = articleBlocks
      .filter((block) => block.type === 'text')
      .map((block) => block.content);

    const blog = await Blog.create({
      title,
      description: (descOverride || parsed.description || textParagraphs[0] || '').trim(),
      category: 'Articles',
      image: coverUrl,
      content: textParagraphs,
      slideItems: articleBlocks,
    });

    res.status(201).json(blog);
  } catch (err) {
    console.error('DOCX import error:', err);
    res.status(500).json({ error: err.message || 'Failed to import Word document' });
  }
};

exports.createBlog = async (req, res) => {
  const { title, description, category, content, shortTitle, detailTitle, coverText } = req.body;

  if (!category || !['Images', 'Articles', 'Presentations'].includes(category)) {
    return res.status(400).json({ error: 'Valid category is required (Images, Articles, Presentations)' });
  }

  try {
    const docxFile = req.files?.docx?.[0];
    if (docxFile) {
      req.file = docxFile;
      return exports.importDocx(req, res);
    }

    if (!title || !title.trim()) return res.status(400).json({ error: 'Title is required' });

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
