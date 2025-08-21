import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/configs/firebase';

export interface ImageUploadResult {
  downloadURL: string;
  path: string;
}

/**
 * Upload an image to Firebase Storage
 * @param imageUri - Local image URI from ImagePicker
 * @param userId - User ID for organizing uploads
 * @param folder - Storage folder (e.g., 'profile-pictures')
 * @returns Promise with download URL and storage path
 */
export const uploadImage = async (
  imageUri: string,
  userId: string,
  folder: string = 'profile-pictures'
): Promise<ImageUploadResult> => {
  try {
    console.log('🔍 Starting image upload for user:', userId);
    console.log('🔍 Image URI:', imageUri);

    // Create a unique filename
    const timestamp = Date.now();
    const filename = `${userId}_${timestamp}.jpg`;
    const storagePath = `${folder}/${filename}`;
    
    console.log('🔍 Storage path:', storagePath);

    // Create storage reference
    const storageRef = ref(storage, storagePath);

    // Convert image URI to blob
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    console.log('🔍 Blob size:', blob.size, 'bytes');

    // Upload the blob
    console.log('🔍 Starting upload...');
    const snapshot = await uploadBytes(storageRef, blob);
    console.log('🔍 Upload completed:', snapshot.metadata.fullPath);

    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('🔍 Download URL:', downloadURL);

    return {
      downloadURL,
      path: storagePath
    };
  } catch (error) {
    console.error('Image upload error:', error);
    throw new Error('Failed to upload image');
  }
};

/**
 * Delete an image from Firebase Storage
 * @param imagePath - Storage path of the image to delete
 */
export const deleteImage = async (imagePath: string): Promise<void> => {
  try {
    if (!imagePath) {
      console.log('⚠️ No image path provided for deletion, skipping');
      return;
    }
    
    console.log('🗑️ Attempting to delete image at path:', imagePath);
    const storageRef = ref(storage, imagePath);
    console.log('🗑️ Storage reference created for:', storageRef.fullPath);
    
    await deleteObject(storageRef);
    console.log('✅ Image deleted successfully from:', imagePath);
  } catch (error: any) {
    console.error('❌ Image deletion error for path:', imagePath);
    console.error('❌ Error details:', error);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error message:', error.message);
    // Don't throw error for deletion failures - it's not critical
  }
};

/**
 * Upload profile picture and return both download URL and storage path
 * @param imageUri - Local image URI
 * @param userId - User ID
 * @param oldImagePath - Optional: path of old image to delete
 * @returns Object with download URL and storage path
 */
export const uploadProfilePicture = async (
  imageUri: string,
  userId: string,
  oldImagePath?: string
): Promise<ImageUploadResult> => {
  try {
    // Upload new image
    const result = await uploadImage(imageUri, userId, 'profile-pictures');
    
    // Delete old image if provided
    if (oldImagePath) {
      await deleteImage(oldImagePath);
    }
    
    return result;
  } catch (error) {
    console.error('Profile picture upload error:', error);
    throw error;
  }
};
