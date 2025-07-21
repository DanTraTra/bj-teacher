import { v2 as cloudinary } from 'cloudinary';
import type { UploadApiResponse } from 'cloudinary';

// Type for Cloudinary search results
interface CloudinarySearchResponse {
  resources: CloudinaryResource[];
  // Add other fields from the response as needed
}

// Get environment variables with fallbacks
const cloudinaryConfig = {
  cloud_name: process.env.VITE_CLOUDINARY_CLOUD_NAME || 
             process.env.REACT_APP_CLOUDINARY_CLOUD_NAME ||
             import.meta.env?.VITE_CLOUDINARY_CLOUD_NAME ||
             import.meta.env?.REACT_APP_CLOUDINARY_CLOUD_NAME,
  
  api_key: process.env.VITE_CLOUDINARY_API_KEY || 
          process.env.REACT_APP_CLOUDINARY_API_KEY ||
          import.meta.env?.VITE_CLOUDINARY_API_KEY ||
          import.meta.env?.REACT_APP_CLOUDINARY_API_KEY,
  
  api_secret: process.env.VITE_CLOUDINARY_API_SECRET || 
             process.env.REACT_APP_CLOUDINARY_API_SECRET ||
             import.meta.env?.VITE_CLOUDINARY_API_SECRET ||
             import.meta.env?.REACT_APP_CLOUDINARY_API_SECRET,
  
  secure: true
};

// Validate configuration
if (!cloudinaryConfig.cloud_name || !cloudinaryConfig.api_key || !cloudinaryConfig.api_secret) {
  console.error('Missing required Cloudinary configuration. Please check your environment variables.');
  console.log('Current Cloudinary Config:', {
    cloud_name: cloudinaryConfig.cloud_name ? '***' : 'MISSING',
    api_key: cloudinaryConfig.api_key ? '***' : 'MISSING',
    api_secret: cloudinaryConfig.api_secret ? '***' : 'MISSING'
  });
  throw new Error('Missing required Cloudinary configuration');
}

// Configure Cloudinary
cloudinary.config(cloudinaryConfig);

interface CloudinaryResource {
  public_id: string;
  format: string;
  // Add other properties you might need
}

/**
 * Fetches all image names from Cloudinary
 * @param folder Optional folder to search in
 * @returns Promise with an array of image names
 */
export async function listAllImageNames(folder?: string): Promise<string[]> {
  try {
    const result = await cloudinary.search
      .expression(folder ? `folder:${folder}` : 'resource_type:image')
      .with_field('context')
      .max_results(500) // Maximum number of results per request
      .execute() as unknown as CloudinarySearchResponse;

    // Extract just the public IDs (image names) from the results
    const imageNames = result.resources.map((resource: CloudinaryResource) => resource.public_id);
    return imageNames;
  } catch (error) {
    console.error('Error fetching image names from Cloudinary:', error);
    throw error;
  }
}

/**
 * Gets the Cloudinary URL for an image
 * @param publicId The public ID of the image
 * @param options Additional transformation options
 * @returns The complete Cloudinary URL
 */
export function getImageUrl(publicId: string, options: Record<string, any> = {}): string {
  return cloudinary.url(publicId, {
    secure: true,
    ...options
  });
}

// For backward compatibility with existing imports
export async function getRandomCloudinaryImages(count: number = 1): Promise<string[]> {
  const allImages = await listAllImageNames();
  const shuffled = [...allImages].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export default {
  listAllImageNames,
  getImageUrl,
  getRandomCloudinaryImages
};