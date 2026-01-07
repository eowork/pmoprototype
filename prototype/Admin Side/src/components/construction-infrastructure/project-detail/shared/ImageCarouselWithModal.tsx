import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Dialog, DialogContent, DialogTitle } from '../../../ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../ui/tooltip';
import { ImageWithFallback } from '../../../figma/ImageWithFallback';
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Download,
  X,
  Upload,
  Eye
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface CarouselImage {
  id: string;
  url: string;
  title: string;
  description?: string;
  category?: 'planning' | 'progress' | 'completed';
}

interface ImageCarouselWithModalProps {
  images: CarouselImage[];
  canEdit?: boolean;
  onImageChange?: (imageUrl: string) => void;
  className?: string;
}

export function ImageCarouselWithModal({ 
  images, 
  canEdit = false, 
  onImageChange,
  className = ""
}: ImageCarouselWithModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Keyboard navigation for modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isModalOpen) return;

      switch (event.key) {
        case 'Escape':
          closeModal();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          navigateModal('prev');
          break;
        case 'ArrowRight':
          event.preventDefault();
          navigateModal('next');
          break;
        case '+':
        case '=':
          event.preventDefault();
          handleZoom('in');
          break;
        case '-':
          event.preventDefault();
          handleZoom('out');
          break;
        case 'r':
          event.preventDefault();
          handleRotate();
          break;
        case '0':
          event.preventDefault();
          resetTransform();
          break;
      }
    };

    if (isModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen, modalImageIndex]);

  const navigateCarousel = useCallback((direction: 'prev' | 'next') => {
    if (images.length <= 1) return;
    
    setCurrentIndex(prev => {
      if (direction === 'prev') {
        return prev === 0 ? images.length - 1 : prev - 1;
      } else {
        return prev === images.length - 1 ? 0 : prev + 1;
      }
    });
  }, [images.length]);

  const navigateModal = useCallback((direction: 'prev' | 'next') => {
    if (images.length <= 1) return;
    
    setModalImageIndex(prev => {
      const newIndex = direction === 'prev' 
        ? (prev === 0 ? images.length - 1 : prev - 1)
        : (prev === images.length - 1 ? 0 : prev + 1);
      
      // Reset transform when changing images
      setZoom(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
      
      return newIndex;
    });
  }, [images.length]);

  const openModal = useCallback((index: number) => {
    setModalImageIndex(index);
    setIsModalOpen(true);
    resetTransform();
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    resetTransform();
  }, []);

  const handleZoom = useCallback((direction: 'in' | 'out') => {
    setZoom(prev => {
      const newZoom = direction === 'in' 
        ? Math.min(prev * 1.2, 5) 
        : Math.max(prev / 1.2, 0.5);
      return newZoom;
    });
  }, []);

  const handleRotate = useCallback(() => {
    setRotation(prev => (prev + 90) % 360);
  }, []);

  const resetTransform = useCallback(() => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handleDownload = useCallback(() => {
    const currentImage = images[isModalOpen ? modalImageIndex : currentIndex];
    if (currentImage) {
      // In a real application, this would trigger a download
      toast.success(`Downloading: ${currentImage.title}`);
    }
  }, [images, currentIndex, modalImageIndex, isModalOpen]);

  const handleImageUpload = useCallback(() => {
    // Create a file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          if (onImageChange) {
            onImageChange(result);
          }
          toast.success('Image updated successfully');
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }, [onImageChange]);

  if (!images || images.length === 0) {
    return (
      <Card className={`border-2 border-dashed border-gray-300 ${className}`}>
        <CardContent className="p-8">
          <div className="text-center">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 mb-2">No images available</p>
            {canEdit && (
              <Button variant="outline" onClick={handleImageUpload}>
                Upload Image
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentImage = images[currentIndex];
  const modalImage = images[modalImageIndex];

  return (
    <>
      {/* Carousel Container */}
      <Card className={`overflow-hidden ${className}`}>
        <CardContent className="p-0 relative">
          {/* Main Image Display */}
          <div className="relative aspect-video bg-gray-100">
            <ImageWithFallback
              src={currentImage.url}
              alt={currentImage.title}
              className="w-full h-full object-cover"
            />
            
            {/* Image Overlay Info */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
              <div className="space-y-2">
                <Badge variant="secondary" className="bg-black/70 text-white">
                  {currentImage.category || 'Image'}
                </Badge>
                <div className="bg-black/70 text-white px-3 py-2 rounded-md max-w-xs">
                  <h4 className="font-medium text-sm">{currentImage.title}</h4>
                  {currentImage.description && (
                    <p className="text-xs opacity-90 mt-1">{currentImage.description}</p>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="bg-black/70 text-white hover:bg-black/80 h-8 w-8 p-0"
                        onClick={() => openModal(currentIndex)}
                      >
                        <Maximize2 className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View full screen</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="bg-black/70 text-white hover:bg-black/80 h-8 w-8 p-0"
                        onClick={handleDownload}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Download image</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {canEdit && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="bg-black/70 text-white hover:bg-black/80 h-8 w-8 p-0"
                          onClick={handleImageUpload}
                        >
                          <Upload className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Upload new image</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/70 text-white hover:bg-black/80 h-10 w-10 p-0"
                  onClick={() => navigateCarousel('prev')}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/70 text-white hover:bg-black/80 h-10 w-10 p-0"
                  onClick={() => navigateCarousel('next')}
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </>
            )}

            {/* Position Indicator */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                <div className="bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                  {currentIndex + 1} / {images.length}
                </div>
              </div>
            )}
          </div>

          {/* Thumbnail Navigation */}
          {images.length > 1 && (
            <div className="p-4 bg-gray-50">
              <div className="flex gap-2 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setCurrentIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
                      index === currentIndex 
                        ? 'border-blue-500 shadow-md' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <ImageWithFallback
                      src={image.url}
                      alt={image.title}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Full-Screen Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-screen-lg h-[90vh] p-0 bg-black">
          <DialogTitle className="sr-only">
            Image Viewer - {modalImage?.title}
          </DialogTitle>
          
          {/* Modal Header */}
          <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
            <div className="bg-black/70 text-white px-4 py-2 rounded-md">
              <h3 className="font-medium">{modalImage?.title}</h3>
              {modalImage?.description && (
                <p className="text-sm opacity-90">{modalImage.description}</p>
              )}
            </div>

            {/* Modal Controls */}
            <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="bg-black/70 text-white hover:bg-black/80"
                      onClick={() => handleZoom('out')}
                    >
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Zoom out (-)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="bg-black/70 text-white hover:bg-black/80"
                      onClick={() => handleZoom('in')}
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Zoom in (+)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="bg-black/70 text-white hover:bg-black/80"
                      onClick={handleRotate}
                    >
                      <RotateCw className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Rotate (R)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button
                variant="secondary"
                size="sm"
                className="bg-black/70 text-white hover:bg-black/80"
                onClick={closeModal}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Modal Image */}
          <div className="flex items-center justify-center h-full relative overflow-hidden">
            <div
              className="transition-transform duration-200 cursor-move"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
              }}
            >
              <ImageWithFallback
                src={modalImage?.url}
                alt={modalImage?.title}
                className="max-w-full max-h-full object-contain"
              />
            </div>

            {/* Modal Navigation */}
            {images.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="lg"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/70 text-white hover:bg-black/80"
                  onClick={() => navigateModal('prev')}
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>

                <Button
                  variant="secondary"
                  size="lg"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/70 text-white hover:bg-black/80"
                  onClick={() => navigateModal('next')}
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </>
            )}
          </div>

          {/* Modal Footer */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4">
            {images.length > 1 && (
              <div className="bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                {modalImageIndex + 1} / {images.length}
              </div>
            )}
            <div className="bg-black/70 text-white px-3 py-1 rounded-full text-sm">
              Zoom: {Math.round(zoom * 100)}%
            </div>
            <div className="bg-black/70 text-white px-3 py-1 rounded-full text-sm">
              Use arrow keys, +/-, R, 0 to navigate
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}