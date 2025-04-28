import React, { useState, useRef } from 'react';
import { FaUpload, FaTrash, FaImage } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';

const ImageUpload = ({ initialImage, onImageChange }) => {
  const { t } = useLanguage();
  const [preview, setPreview] = useState(initialImage || '');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileChange = (e) => {
    handleFile(e.target.files[0]);
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle drop event
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Process the file
  const handleFile = (file) => {
    if (!file) return;

    // Check if the file is an image
    if (!file.type.match('image.*')) {
      alert('Please select an image file (JPEG, PNG, etc.)');
      return;
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File is too large. Maximum size is 5MB.');
      return;
    }

    // Create a preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const imagePreview = e.target.result;
      setPreview(imagePreview);
      
      // Pass the file or data URL to the parent component
      if (onImageChange) {
        // You can pass the file itself or the base64 string depending on your needs
        onImageChange({
          file,
          dataUrl: imagePreview
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Trigger file input click
  const openFileSelector = () => {
    fileInputRef.current.click();
  };

  // Remove current image
  const removeImage = () => {
    setPreview('');
    if (onImageChange) {
      onImageChange(null);
    }
  };

  return (
    <div className="w-full">
      <div 
        className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
          dragActive 
            ? 'border-green-500 bg-green-50' 
            : 'border-gray-300 hover:border-green-500'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileSelector}
        role="button"
        tabIndex={0}
      >
        {preview ? (
          <div className="relative">
            <img 
              src={preview} 
              alt="Product preview" 
              className="max-h-64 mx-auto rounded"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeImage();
              }}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
              aria-label="Remove image"
            >
              <FaTrash size={14} />
            </button>
          </div>
        ) : (
          <div className="py-8">
            <FaImage className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="mb-2 text-sm text-gray-500">
              {dragActive 
                ? t('dropImageHere') 
                : t('dragImageHereOrClick')}
            </p>
            <p className="text-xs text-gray-400">
              {t('supportedFormats')}: JPEG, PNG, GIF (max 5MB)
            </p>
          </div>
        )}
        <input 
          ref={fileInputRef}
          type="file" 
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>
      
      {!preview && (
        <button
          type="button"
          onClick={openFileSelector}
          className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <FaUpload className="mr-2" />
          {t('uploadImage')}
        </button>
      )}
    </div>
  );
};

export default ImageUpload;