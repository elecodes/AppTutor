import { cloudinaryConfig } from "../config/cloudinary";

/**
 * Service to handle file uploads to Cloudinary
 */
const StorageService = {
  /**
   * Upload a file to Cloudinary
   * @param {File} file - The file object to upload
   * @returns {Promise<string>} - The secure url of the uploaded file
   */
  async uploadFile(file) {
    if (!file) throw new Error("File is required");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", cloudinaryConfig.uploadPreset);

    try {
      // Construct the URL dynamically if cloudName is set, otherwise use the config default
      const url = cloudinaryConfig.uploadUrl.replace("YOUR_CLOUD_NAME", cloudinaryConfig.cloudName);
      
      console.log("Uploading to Cloudinary:", url);
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Cloudinary error details:", errorData);
        throw new Error(errorData.error?.message || "Upload failed");
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error("Error uploading file to Cloudinary:", error);
      throw error;
    }
  },

  /**
   * Upload a user avatar
   * @param {string} userId - The user's ID (not strictly needed for Cloudinary unsigned upload, but kept for interface consistency)
   * @param {File} file - The image file
   * @returns {Promise<string>} - The download URL
   */
  async uploadAvatar(userId, file) {
    if (!file.type.startsWith('image/')) {
      throw new Error("Invalid file type. Only images are allowed.");
    }
    // Cloudinary handles naming automatically or via preset, 
    // but we keep the method signature compatible with the previous one.
    return this.uploadFile(file);
  },

  /**
   * Delete a file from storage
   * @param {string} path - The path/public_id to the file
   */
  async deleteFile() {
    // Client-side deletion is restricted in unsigned presets for security.
    // We'll skip this for now or implement a backend endpoint if needed later.
    console.warn("Delete operation skipped: Client-side deletion requires signed signature.");
  }
};

export default StorageService;
