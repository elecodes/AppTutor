import React, { useState, useRef } from 'react';
import StorageService from '../../services/StorageService';
import UserService from '../../services/UserService';

const AvatarUpload = ({ user, userProfile, onUploadComplete }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(userProfile?.photoURL || user?.photoURL || null);
  const fileInputRef = useRef(null);

  // Update preview if userProfile changes (e.g. on initial load)
  React.useEffect(() => {
    if (userProfile?.photoURL) {
      setPreview(userProfile.photoURL);
    }
  }, [userProfile]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Basic validation
    // Strict validation for image types
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!file.type.startsWith('image/') || !validImageTypes.includes(file.type)) {
      alert('Solo se permiten archivos de imagen (JPEG, PNG, GIF, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no debe superar los 5MB.');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files[0];
    if (!file) return;

    setUploading(true);
    try {
      // 1. Upload to Storage
      const downloadURL = await StorageService.uploadAvatar(user.uid, file);

      // 2. Update User Profile in Firestore & Auth
      // Note: Updating Auth profile requires a different method usually, 
      // but UserService.createUserProfile handles Firestore data.
      // We might need to update the Auth object too if we want it to reflect immediately in the app context.
      
      await UserService.updateUserProgress(user.uid, { photoURL: downloadURL });
      
      if (onUploadComplete) {
        onUploadComplete(downloadURL);
      }
      
      alert('¡Foto de perfil actualizada!');
    } catch (error) {
      console.error("Error uploading avatar:", error);
      alert('Hubo un error al subir la imagen.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
      <div className="relative w-32 h-32">
        {preview ? (
          <img 
            src={preview} 
            alt="Profile Preview" 
            className="w-full h-full rounded-full object-cover border-4 border-indigo-100"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-indigo-100 flex items-center justify-center text-indigo-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        
        <label 
          htmlFor="avatar-upload" 
          className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full cursor-pointer hover:bg-indigo-700 transition-colors shadow-md"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        </label>
        
        <input 
          id="avatar-upload" 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleFileSelect}
        />
      </div>

      {fileInputRef.current?.files?.length > 0 && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          className={`px-4 py-2 rounded-md text-white font-medium transition-all ${
            uploading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg'
          }`}
        >
          {uploading ? 'Subiendo...' : 'Guardar Foto'}
        </button>
      )}
    </div>
  );
};

export default AvatarUpload;
