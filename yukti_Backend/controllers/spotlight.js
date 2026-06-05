const Spotlight = require('../models/Spotlight');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        folder: folder || 'spotlights'
      },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

exports.createSpotlight = async (req, res) => {
    const { name, media, description } = req.body;

    if (!name || !req.files || !req.files.image) {
      return res.status(400).json({ error: 'Name and image are required' });
    }
  
    try {
      const imageUpload = await uploadToCloudinary(
        req.files.image[0].buffer,
        'spotlight/images'
      );

      let mediaUrl = null;
  
      if (req.files.media && req.files.media[0]) {
        const mediaUpload = await uploadToCloudinary(
          req.files.media[0].buffer,
          'spotlight/media'
        );
        mediaUrl = mediaUpload.secure_url;
      } else if (media && typeof media === 'string') {
        mediaUrl = media; 
      }
  
      const newSpotlight = new Spotlight({
        name,
        imageUrl: imageUpload.secure_url,
        mediaUrl,
        description
      });
  
      await newSpotlight.save();
      res.status(201).json(newSpotlight);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to create spotlight' });
    }
  };  

exports.getSpotlights = async (req, res) => {
  try {
    const spotlights = await Spotlight.find().sort({ createdAt: -1 });
    res.status(200).json(spotlights);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch spotlights' });
  }
};

exports.deleteSpotlight = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Spotlight.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Spotlight not found' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete spotlight' });
  }
};
