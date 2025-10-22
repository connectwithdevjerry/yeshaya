const cloudinary = require("cloudinary").v2;
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const saveImageToDB = async (media, folder="brand-logo", fileType = "auto") => {
  var result;
  await cloudinary.uploader
    .upload(media, {
      timeout: 60000,
      resource_type: fileType,
      folder,
      overwrite: true,
    })
    .then((res) => {
      console.log({ res });
      result = { ...res };
    })
    .catch((err) => console.log({ err }));
  return result;
};

module.exports = {
  saveImageToDB,
};
