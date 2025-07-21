import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../../.env');
dotenv.config({ path: envPath });

// Map REACT_APP_* to VITE_* for compatibility
if (process.env.REACT_APP_CLOUDINARY_CLOUD_NAME && !process.env.VITE_CLOUDINARY_CLOUD_NAME) {
  process.env.VITE_CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
  process.env.VITE_CLOUDINARY_API_KEY = process.env.REACT_APP_CLOUDINARY_API_KEY;
  process.env.VITE_CLOUDINARY_API_SECRET = process.env.REACT_APP_CLOUDINARY_API_SECRET;
}

// Import Cloudinary utilities after setting up environment variables
import { listAllImageNames, getRandomCloudinaryImages } from '../cloudinaryUtils.js';

// This is a simple test file to demonstrate the usage of the Cloudinary utilities
// In a real test environment, you would use a testing framework like Jest

async function testCloudinaryIntegration() {
  try {
    console.log('Testing Cloudinary integration...');
    
    // Test listing all image names
    console.log('\nFetching all image names...');
    const allImages = await listAllImageNames();
    console.log(`Found ${allImages.length} images in Cloudinary`);
    
    if (allImages.length > 0) {
      console.log('First 5 image names:');
      console.log(allImages.slice(0, 5).map((name, i) => `${i + 1}. ${name}`).join('\n'));
      
      // Test getting a random image
      console.log('\nGetting 3 random images:');
      const randomImages = await getRandomCloudinaryImages(3);
      console.log(randomImages);
    }
    
  } catch (error) {
    console.error('Error testing Cloudinary integration:', error);
  }
}

// Run the test
testCloudinaryIntegration();
