const cloudinary = require("cloudinary").v2;
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const saveImageToDB = (buffer, folder = "brand-logo", fileType = "image", publicId = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      folder,
      resource_type: fileType,
      overwrite: true,
    };
    // For raw files (e.g. PDFs) a public_id ending in the extension makes the
    // delivered URL download with the correct filename + extension.
    if (publicId) options.public_id = publicId;

    cloudinary.uploader
      .upload_stream(options, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      })
      .end(buffer);
  });
};

module.exports = {
  saveImageToDB,
};
