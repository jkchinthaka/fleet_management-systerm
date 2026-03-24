import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

// Configure on import — reads env vars CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload a base64-encoded image to Cloudinary.
 * @param {string} base64Data - full data URI or raw base64 string
 * @param {string} folder - Cloudinary folder name (e.g. 'refuel_receipts')
 * @returns {{ url: string, public_id: string }}
 */
export async function uploadImage(base64Data, folder = 'fleet') {
  if (!base64Data) return null;

  // Validate the base64 string has expected structure
  const isDataUri = base64Data.startsWith('data:');
  if (!isDataUri && !/^[A-Za-z0-9+/=]+$/.test(base64Data.slice(0, 100))) {
    throw new ApiError(400, 'Invalid image data');
  }

  const result = await cloudinary.uploader.upload(base64Data, {
    folder,
    resource_type: 'image',
    transformation: [{ quality: 'auto', fetch_format: 'auto' }]
  });

  return { url: result.secure_url, public_id: result.public_id };
}

/**
 * Delete an image from Cloudinary by public_id.
 */
export async function deleteImage(publicId) {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId);
}
