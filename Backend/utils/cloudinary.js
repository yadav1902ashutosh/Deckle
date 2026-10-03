import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configure Cloudinary credentials from environment
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a local file to Cloudinary and cleanup the local temporary file
 * @param {string} localFilePath - Path where multer saved the file temporarily
 * @param {string} folder - Destination folder on Cloudinary (e.g., 'deckle_books')
 * @returns {Promise<object|null>} Cloudinary upload response object or null
 */
export async function uploadOnCloudinary(localFilePath, folder = "deckle_uploads") {
  try {
    if (!localFilePath) return null;

    // Upload to Cloudinary with auto resource type detection
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: folder,
    });

    // File uploaded successfully! Remove local temporary file
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return response;
  } catch (error) {
    // Upload failed: ALWAYS remove the local temp file to avoid disk storage bloat
    if (fs.existsSync(localFilePath)) {
      try {
        fs.unlinkSync(localFilePath);
      } catch (cleanupErr) {
        console.error("Error cleaning up temp file:", cleanupErr.message);
      }
    }
    console.error("Cloudinary upload error:", error.message);
    return null;
  }
}

/**
 * Delete an asset from Cloudinary by its public ID
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<object|null>}
 */
export async function deleteFromCloudinary(publicId) {
  try {
    if (!publicId) return null;
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary deletion error:", error.message);
    return null;
  }
}