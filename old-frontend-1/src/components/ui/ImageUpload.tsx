'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Button } from './Button';
import { useToast } from '@/contexts/ToastContext';

interface ImageFile {
  file: File;
  preview: string;
  id: string;
}

interface ExistingImage {
  id: string;
  url: string;
  alt?: string;
  isPrimary?: boolean;
  thumbnail?: string;
}

interface ImageUploadProps {
  onImagesChange: (files: File[]) => void;
  onExistingImagesChange?: (images: ExistingImage[]) => void;
  existingImages?: ExistingImage[];
  maxFiles?: number;
  maxSizeInMB?: number;
  acceptedTypes?: string[];
  className?: string;
  disabled?: boolean;
  showPreview?: boolean;
  allowReorder?: boolean;
  allowSetPrimary?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImagesChange,
  onExistingImagesChange,
  existingImages = [],
  maxFiles = 10,
  maxSizeInMB = 5,
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  className = '',
  disabled = false,
  showPreview = true,
  allowReorder = true,
  allowSetPrimary = true,
}) => {
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `File type ${file.type} is not supported. Please use: ${acceptedTypes.join(', ')}`;
    }

    if (file.size > maxSizeInMB * 1024 * 1024) {
      return `File size must be less than ${maxSizeInMB}MB`;
    }

    return null;
  };

  const processFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const totalFiles =
        imageFiles.length + existingImages.length + fileArray.length;

      if (totalFiles > maxFiles) {
        addToast({
          type: 'error',
          title: 'Too Many Files',
          message: `Maximum ${maxFiles} images allowed. You can upload ${maxFiles - imageFiles.length - existingImages.length} more.`,
          duration: 5000,
        });
        return;
      }

      const validFiles: ImageFile[] = [];
      const errors: string[] = [];

      fileArray.forEach((file) => {
        const error = validateFile(file);
        if (error) {
          errors.push(`${file.name}: ${error}`);
        } else {
          const preview = URL.createObjectURL(file);
          validFiles.push({
            file,
            preview,
            id: generateId(),
          });
        }
      });

      if (errors.length > 0) {
        addToast({
          type: 'error',
          title: 'File Validation Errors',
          message: errors.join('\n'),
          duration: 5000,
        });
      }

      if (validFiles.length > 0) {
        const newImageFiles = [...imageFiles, ...validFiles];
        setImageFiles(newImageFiles);
        onImagesChange(newImageFiles.map((img) => img.file));
      }
    },
    [
      imageFiles,
      existingImages.length,
      maxFiles,
      maxSizeInMB,
      acceptedTypes,
      addToast,
      onImagesChange,
    ]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeImage = (id: string) => {
    const newImageFiles = imageFiles.filter((img) => img.id !== id);
    setImageFiles(newImageFiles);
    onImagesChange(newImageFiles.map((img) => img.file));

    // Clean up preview URL
    const removedImage = imageFiles.find((img) => img.id === id);
    if (removedImage) {
      URL.revokeObjectURL(removedImage.preview);
    }
  };

  const removeExistingImage = (id: string) => {
    if (onExistingImagesChange) {
      const newExistingImages = existingImages.filter((img) => img.id !== id);
      onExistingImagesChange(newExistingImages);
    }
  };

  const setPrimaryImage = (id: string, isExisting: boolean = false) => {
    if (isExisting && onExistingImagesChange) {
      const newExistingImages = existingImages.map((img) => ({
        ...img,
        isPrimary: img.id === id,
      }));
      onExistingImagesChange(newExistingImages);
    }
  };

  const openFileDialog = () => {
    if (fileInputRef.current && !disabled) {
      fileInputRef.current.click();
    }
  };

  // Clean up preview URLs on unmount
  React.useEffect(() => {
    return () => {
      imageFiles.forEach((img) => {
        URL.revokeObjectURL(img.preview);
      });
    };
  }, []);

  const totalImages = imageFiles.length + existingImages.length;
  const canAddMore = totalImages < maxFiles && !disabled;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200
          ${
            dragOver
              ? 'border-orange-500 bg-orange-50'
              : 'border-gray-300 hover:border-orange-400'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${!canAddMore ? 'opacity-50' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || !canAddMore}
        />

        <div className="space-y-2">
          <div className="text-4xl">📸</div>
          <div className="text-lg font-medium text-gray-700">
            {canAddMore
              ? 'Upload Images'
              : `Maximum ${maxFiles} images reached`}
          </div>
          <div className="text-sm text-gray-500">
            Drag and drop images here, or click to select files
          </div>
          <div className="text-xs text-gray-400">
            Supported formats:{' '}
            {acceptedTypes
              .map((type) => type.split('/')[1].toUpperCase())
              .join(', ')}
            • Max size: {maxSizeInMB}MB each • Max files: {maxFiles}
          </div>
          {canAddMore && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={(e) => {
                e.stopPropagation();
                openFileDialog();
              }}
            >
              Choose Files
            </Button>
          )}
        </div>
      </div>

      {/* Image Previews */}
      {showPreview && (existingImages.length > 0 || imageFiles.length > 0) && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-700">
            Images ({totalImages}/{maxFiles})
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {/* Existing Images */}
            {existingImages.map((image, index) => (
              <div key={image.id} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={image.thumbnail || image.url}
                    alt={image.alt || `Image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Image Controls */}
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                  <div className="flex space-x-1">
                    {allowSetPrimary && !image.isPrimary && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="text-xs bg-white text-gray-700 hover:bg-gray-100"
                        onClick={() => setPrimaryImage(image.id, true)}
                      >
                        Primary
                      </Button>
                    )}
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="text-xs bg-red-500 text-white hover:bg-red-600"
                      onClick={() => removeExistingImage(image.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>

                {/* Primary Badge */}
                {image.isPrimary && (
                  <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                    Primary
                  </div>
                )}
              </div>
            ))}

            {/* New Images */}
            {imageFiles.map((image, index) => (
              <div key={image.id} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={image.preview}
                    alt={`New image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Image Controls */}
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="text-xs bg-red-500 text-white hover:bg-red-600"
                    onClick={() => removeImage(image.id)}
                  >
                    Remove
                  </Button>
                </div>

                {/* New Badge */}
                <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                  New
                </div>

                {/* Primary Badge for first image */}
                {existingImages.length === 0 && index === 0 && (
                  <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                    Primary
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
