import axios from "axios";
import { CLOUDINARY_NAME, UPLOAD_PRESET } from "../config/cloudinaryConfig";

export const uploadToCloudinary = async (imageUri: string) => {
  const data = new FormData();

  data.append("file", {
    uri: imageUri,
    type: "image/jpeg",
    name: "upload.jpg",
  } as any);

  data.append("upload_preset", UPLOAD_PRESET);

  const res = await axios.post(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_NAME}/image/upload`,
    data,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  return res.data.secure_url;
};
