const cloudinary = require('cloudinary').v2;
require("dotenv").config();

cloudinary.config({
  cloud_name: 'dwrdo2jc3',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

module.exports = cloudinary;