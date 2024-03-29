import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  if (!localFilePath) return null;
  try {
    const fileMetaData = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // console.log(fileMetaData);

    // run code after successful file upload
    fs.unlinkSync(localFilePath);
    return fileMetaData; // practically only url is required in frontend
  } catch (err) {
    fs.unlinkSync(localFilePath); // remove the locally saved file as the upload operation has failed
    return null;
  }
};

export default uploadOnCloudinary;
