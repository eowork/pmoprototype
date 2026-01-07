import React, { useState, useRef } from 'react';
import { Button } from '../../../ui/button';
import { Card, CardContent } from '../../../ui/card';
import { Label } from '../../../ui/label';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import { ImageWithFallback } from '../../../figma/ImageWithFallback';
import { toast } from 'sonner@2.0.3';

interface OverviewImageProps {
  imageUrl?: string;
  onImageChange: (imageUrl: string) => void;
  canEdit: boolean;
  isEditing: boolean;
}

const PLACEHOLDER_IMAGE_URL = "https://images.unsplash.com/photo-1723448917184-434f823d246a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB1bml2ZXJzaXR5JTIwaW5mcmFzdHJ1Y3R1cmUlMjBidWlsZGluZyUyMGNvbnN0cnVjdGlvbnxlbnwxfHx8fDE3NTYxOTM0MjZ8MA&ixlib=rb-4.1.0&q=80&w=800";

export function OverviewImage({ imageUrl, onImageChange, canEdit, isEditing }: OverviewImageProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasCustomImage = Boolean(imageUrl && imageUrl !== PLACEHOLDER_IMAGE_URL);
  const displayImageUrl = imageUrl || PLACEHOLDER_IMAGE_URL;

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    // Simulate upload progress
    setUploadProgress(0);
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 50);

    // Create object URL for immediate preview
    const objectUrl = URL.createObjectURL(file);
    
    // Simulate async upload
    setTimeout(() => {
      clearInterval(progressInterval);
      setUploadProgress(100);
      onImageChange(objectUrl);
      toast.success('Infrastructure image uploaded successfully');
      
      setTimeout(() => setUploadProgress(0), 1000);
    }, 500);
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemoveImage = () => {
    onImageChange('');
    toast.success('Image removed');
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  if (isEditing) {
    return (
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-700">
          Image for Ideal/Proposed Infrastructure
        </Label>
        
        {/* Upload Area */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-2">
            Drag and drop an image, or click to select
          </p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={openFileDialog}
            disabled={uploadProgress > 0}
          >
            {uploadProgress > 0 ? `Uploading ${uploadProgress}%` : 'Choose File'}
          </Button>
          <p className="text-xs text-gray-500 mt-2">
            PNG, JPG, GIF up to 10MB
          </p>
        </div>

        {/* Progress Bar */}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}

        {/* Preview */}
        {displayImageUrl && (
          <Card className="overflow-hidden">
            <CardContent className="p-0 relative">
              <ImageWithFallback
                src={displayImageUrl}
                alt="Infrastructure Preview"
                className="w-full h-48 object-cover"
              />
              {hasCustomImage && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={handleRemoveImage}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
              {!hasCustomImage && (
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <div className="text-white text-center">
                    <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm font-medium">Sample Infrastructure Image</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>
    );
  }

  // Display mode
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-gray-700">
        Image for Ideal/Proposed Infrastructure
      </Label>
      
      <Card className="overflow-hidden">
        <CardContent className="p-0 relative">
          <ImageWithFallback
            src={displayImageUrl}
            alt="Proposed Infrastructure"
            className="w-full h-48 object-cover"
          />
          
          {!hasCustomImage && (
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
              <div className="text-white text-center">
                <ImageIcon className="w-6 h-6 mx-auto mb-1" />
                <p className="text-sm font-medium">Sample Infrastructure</p>
              </div>
            </div>
          )}
          
          {!hasCustomImage && canEdit && (
            <div className="absolute bottom-3 right-3">
              <Button 
                variant="secondary" 
                size="sm"
                className="bg-white bg-opacity-90 hover:bg-opacity-100"
              >
                <Upload className="w-3 h-3 mr-1" />
                Upload
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {!hasCustomImage && (
        <p className="text-xs text-gray-500 text-center">
          Sample image shown. Upload your own infrastructure image to replace.
        </p>
      )}
    </div>
  );
}