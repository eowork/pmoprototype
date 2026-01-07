import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Textarea } from '../../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../ui/tooltip';
import { GalleryItem } from '../../types/ProjectDetailTypes';
import { MEFilter } from '../../types/METypes';
import { formatDate } from '../../utils/analyticsHelpers';
import { getDefaultGalleryData } from '../data/sampleGalleryDocumentsData';
import { ImageWithFallback } from '../../../figma/ImageWithFallback';
import { toast } from 'sonner@2.0.3';
import { Grid3x3, List, Upload, Camera, FileImage, Plus, Trash2, ArrowUpDown, Edit, ZoomIn, ZoomOut, Download as DownloadIcon } from 'lucide-react';

// Container structure for organizing gallery items
interface GalleryContainer {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  items: GalleryItem[];
  maxItems: number;
}

interface GalleryTabProps {
  galleryItems: GalleryItem[];
  filteredGalleryItems: GalleryItem[];
  globalMEFilter: MEFilter;
  onFilterChange: (filter: MEFilter) => void;
  onClearFilter: () => void;
  projectId: string;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  onAddPhoto: (photoData: {
    file: File;
    title: string;
    description: string;
    category: 'progress' | 'completed' | 'planning';
    uploadDate: string;
    containerId?: string;
  }) => void;
  onDeletePhoto: (id: string) => void;
}

export function GalleryTab({
  galleryItems,
  filteredGalleryItems,
  globalMEFilter,
  onFilterChange,
  onClearFilter,
  projectId,
  canAdd,
  canEdit,
  canDelete,
  onAddPhoto,
  onDeletePhoto
}: GalleryTabProps) {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isContainerDialogOpen, setIsContainerDialogOpen] = useState(false);
  const [isFullScreenOpen, setIsFullScreenOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [editingImage, setEditingImage] = useState<GalleryItem | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [containers, setContainers] = useState<GalleryContainer[]>([]);
  const [selectedContainerId, setSelectedContainerId] = useState<string>('');
  const [imageZoom, setImageZoom] = useState(100);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  
  const [uploadForm, setUploadForm] = useState({
    file: null as File | null,
    title: '',
    description: '',
    category: 'progress' as 'progress' | 'completed' | 'planning',
    uploadDate: new Date().toISOString().split('T')[0],
    containerId: ''
  });

  const [editForm, setEditForm] = useState({
    file: null as File | null,
    title: '',
    description: '',
    category: 'progress' as 'progress' | 'completed' | 'planning',
    uploadDate: '',
    containerId: ''
  });

  const [containerForm, setContainerForm] = useState({
    name: '',
    description: ''
  });

  // Initialize with sample containers
  useEffect(() => {
    const sampleContainers: GalleryContainer[] = [
      {
        id: 'container-001',
        name: 'Site Preparation Phase',
        description: 'Initial site preparation and excavation work',
        createdAt: '2024-01-15',
        maxItems: 3,
        items: []
      },
      {
        id: 'container-002',
        name: 'Foundation Work',
        description: 'Foundation laying and concrete pouring',
        createdAt: '2024-02-01',
        maxItems: 3,
        items: []
      },
      {
        id: 'container-003',
        name: 'Structural Framework',
        description: 'Steel framework and building structure',
        createdAt: '2024-03-01',
        maxItems: 3,
        items: []
      },
      {
        id: 'container-004',
        name: 'Roofing and Walls',
        description: 'Roof installation and wall construction',
        createdAt: '2024-04-01',
        maxItems: 3,
        items: []
      },
      {
        id: 'container-005',
        name: 'Interior Work',
        description: 'Interior finishing and installations',
        createdAt: '2024-05-01',
        maxItems: 3,
        items: []
      }
    ];

    // Initialize containers only once
    if (containers.length === 0) {
      // Load sample gallery data and distribute into containers
      if (galleryItems.length === 0) {
        const sampleData = getDefaultGalleryData(projectId);
        
        // Distribute sample data across containers (max 3 per container)
        const containersWithItems = sampleContainers.map((container, containerIndex) => {
          const startIndex = containerIndex * 3;
          const endIndex = Math.min(startIndex + 3, sampleData.length);
          const containerItems = sampleData.slice(startIndex, endIndex).map(item => ({
            ...item,
            containerId: container.id
          }));

          return {
            ...container,
            items: containerItems
          };
        });

        setContainers(containersWithItems);
      } else {
        // If we have galleryItems, distribute them into containers
        const itemsWithContainers = [...galleryItems];
        const containersWithItems = sampleContainers.map((container, containerIndex) => {
          const startIndex = containerIndex * 3;
          const endIndex = Math.min(startIndex + 3, itemsWithContainers.length);
          const containerItems = itemsWithContainers.slice(startIndex, endIndex).map(item => ({
            ...item,
            containerId: container.id
          }));

          return {
            ...container,
            items: containerItems
          };
        });

        setContainers(containersWithItems);
      }
    }
  }, [projectId]);

  // Sync galleryItems from parent with containers
  useEffect(() => {
    if (galleryItems.length > 0 && containers.length > 0) {
      // Update containers with items from galleryItems that have containerId
      setContainers(prev => prev.map(container => {
        const containerItems = galleryItems.filter(item => 
          (item as any).containerId === container.id
        );
        return {
          ...container,
          items: containerItems
        };
      }));
    }
  }, [galleryItems]);

  // Get all items from all containers for display
  const getAllItems = () => {
    // Always use container items for grid view
    return containers.flatMap(container => container.items);
  };

  const displayItems = getAllItems();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      
      setUploadForm(prev => ({ ...prev, file }));
    }
  };

  const handleUploadSubmit = () => {
    if (!uploadForm.file || !uploadForm.title.trim()) {
      toast.error('Please select a file and provide a title');
      return;
    }

    // Check if selected container is full
    if (uploadForm.containerId) {
      const selectedContainer = containers.find(c => c.id === uploadForm.containerId);
      if (selectedContainer && selectedContainer.items.length >= selectedContainer.maxItems) {
        toast.error(`Selected container is full (${selectedContainer.maxItems} images max). Please choose another container or create a new one.`);
        return;
      }
    }

    // If no container selected and we have containers, try to find one with space
    let targetContainerId = uploadForm.containerId;
    if (!targetContainerId && containers.length > 0) {
      const availableContainer = containers.find(c => c.items.length < c.maxItems);
      if (availableContainer) {
        targetContainerId = availableContainer.id;
      } else {
        // All containers full, prompt to create new one
        toast.error('All containers are full (3 images max each). Please create a new container.');
        setIsContainerDialogOpen(true);
        return;
      }
    }

    // Create the new gallery item with containerId
    const newItem: GalleryItem = {
      id: `gallery-${Date.now()}`,
      filename: uploadForm.file.name,
      url: URL.createObjectURL(uploadForm.file),
      title: uploadForm.title,
      description: uploadForm.description,
      uploadDate: uploadForm.uploadDate,
      uploadedBy: 'Current User',
      category: uploadForm.category,
      meRelevant: true,
      containerId: targetContainerId
    };

    // Update containers immediately for grid view
    if (targetContainerId) {
      setContainers(prev => prev.map(container => {
        if (container.id === targetContainerId && container.items.length < container.maxItems) {
          return {
            ...container,
            items: [...container.items, newItem]
          };
        }
        return container;
      }));
    }

    // Call parent handler to update main gallery items list
    onAddPhoto({
      file: uploadForm.file,
      title: uploadForm.title,
      description: uploadForm.description,
      category: uploadForm.category,
      uploadDate: uploadForm.uploadDate,
      containerId: targetContainerId
    });

    // Reset form
    setUploadForm({
      file: null,
      title: '',
      description: '',
      category: 'progress',
      uploadDate: new Date().toISOString().split('T')[0],
      containerId: ''
    });
    setIsUploadDialogOpen(false);
    toast.success('Photo uploaded successfully!');
  };

  const createNewContainer = () => {
    if (!containerForm.name.trim()) {
      toast.error('Please provide a container name');
      return;
    }

    const newContainer: GalleryContainer = {
      id: `container-${Date.now()}`,
      name: containerForm.name,
      description: containerForm.description,
      createdAt: new Date().toISOString().split('T')[0],
      maxItems: 3,
      items: []
    };

    setContainers(prev => [...prev, newContainer]);
    setUploadForm(prev => ({ ...prev, containerId: newContainer.id }));
    
    // Reset container form
    setContainerForm({ name: '', description: '' });
    setIsContainerDialogOpen(false);
    
    toast.success('New container created successfully!');
  };

  const handleImageClick = (item: GalleryItem) => {
    setSelectedImage(item);
    setImageZoom(100);
    setImagePosition({ x: 0, y: 0 });
    setIsFullScreenOpen(true);
  };

  const handleEditPhoto = (item: GalleryItem) => {
    setEditingImage(item);
    setEditForm({
      file: null,
      title: item.title || item.caption || '',
      description: item.description || item.caption || '',
      category: item.category || 'progress',
      uploadDate: item.uploadDate || item.uploadedAt || '',
      containerId: item.containerId || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = () => {
    if (!editingImage) return;
    
    if (!editForm.title.trim()) {
      toast.error('Please provide a title');
      return;
    }

    // Create updated item
    const updatedItem: GalleryItem = {
      ...editingImage,
      title: editForm.title,
      description: editForm.description,
      category: editForm.category,
      uploadDate: editForm.uploadDate,
      containerId: editForm.containerId,
      // If new file selected, create new URL
      ...(editForm.file ? {
        url: URL.createObjectURL(editForm.file),
        filename: editForm.file.name
      } : {})
    };

    // Update in containers
    setContainers(prev => prev.map(container => ({
      ...container,
      items: container.items.map(item => 
        item.id === editingImage.id ? updatedItem : item
      )
    })));

    // Reset form
    setEditForm({
      file: null,
      title: '',
      description: '',
      category: 'progress',
      uploadDate: '',
      containerId: ''
    });
    setEditingImage(null);
    setIsEditDialogOpen(false);
    toast.success('Photo updated successfully!');
  };

  const handleDeletePhoto = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      onDeletePhoto(id);
      
      // Also remove from containers if using sample data
      if (galleryItems.length === 0) {
        setContainers(prev => prev.map(container => ({
          ...container,
          items: container.items.filter(item => item.id !== id)
        })));
      }
    }
  };

  const moveItemToContainer = (itemId: string, targetContainerId: string) => {
    const targetContainer = containers.find(c => c.id === targetContainerId);
    if (!targetContainer) return;

    if (targetContainer.items.length >= targetContainer.maxItems) {
      toast.error(`Target container is full (${targetContainer.maxItems} images max)`);
      return;
    }

    setContainers(prev => {
      const newContainers = [...prev];
      let itemToMove: GalleryItem | null = null;

      // Remove item from current container
      newContainers.forEach(container => {
        const itemIndex = container.items.findIndex(item => item.id === itemId);
        if (itemIndex !== -1) {
          itemToMove = container.items[itemIndex];
          container.items.splice(itemIndex, 1);
        }
      });

      // Add to target container
      if (itemToMove) {
        const targetContainer = newContainers.find(c => c.id === targetContainerId);
        if (targetContainer) {
          targetContainer.items.push({ ...itemToMove, containerId: targetContainerId });
        }
      }

      return newContainers;
    });

    toast.success('Image moved to new container');
  };

  const getContainerById = (containerId: string) => {
    return containers.find(c => c.id === containerId);
  };

  // Keyboard controls for full-screen modal
  useEffect(() => {
    if (!isFullScreenOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case '+':
        case '=':
          e.preventDefault();
          setImageZoom(prev => Math.min(300, prev + 25));
          break;
        case '-':
        case '_':
          e.preventDefault();
          setImageZoom(prev => Math.max(25, prev - 25));
          if (imageZoom <= 50) setImagePosition({ x: 0, y: 0 });
          break;
        case '0':
          e.preventDefault();
          setImageZoom(100);
          setImagePosition({ x: 0, y: 0 });
          break;
        case 'Escape':
          setIsFullScreenOpen(false);
          setImageZoom(100);
          setImagePosition({ x: 0, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullScreenOpen, imageZoom]);

  return (
    <Card className="border border-gray-200 shadow-sm bg-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Project Gallery
          </CardTitle>
          <CardDescription className="text-gray-600">
            Visual documentation organized in containers (max 3 images per container)
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <TooltipProvider>
            <div className="flex items-center gap-1 bg-gray-100 rounded-md p-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="px-2 py-1"
                    aria-label="Grid view"
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Grid View - Photo gallery</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="px-2 py-1"
                    aria-label="List view"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>List View - Detailed list</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>

          {canAdd && (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline"
                      onClick={() => setIsContainerDialogOpen(true)} 
                      size="sm"
                      className="gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      New Container
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Create new image container</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      onClick={() => setIsUploadDialogOpen(true)} 
                      size="sm"
                      className="gap-1"
                      aria-label="Upload photo"
                    >
                      <Camera className="w-4 h-4" />
                      Upload Photo
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Upload new project photo</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Sample data notice */}
        {galleryItems.length === 0 && containers.some(c => c.items.length > 0) && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>Sample Data:</strong> Showing sample gallery images organized in containers. 
              Upload actual project photos to replace this data.
            </p>
          </div>
        )}

        {/* Container-based view */}
        {viewMode === 'grid' ? (
          <div className="space-y-6">
            {containers.map((container) => (
              <div key={container.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{container.name}</h3>
                    <p className="text-sm text-gray-600">{container.description}</p>
                    <p className="text-xs text-gray-500">
                      Created: {formatDate(container.createdAt)} • 
                      Images: {container.items.length}/{container.maxItems}
                    </p>
                  </div>
                  <Badge variant={container.items.length >= container.maxItems ? 'destructive' : 'default'}>
                    {container.items.length}/{container.maxItems}
                  </Badge>
                </div>

                {container.items.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {container.items.map((item) => (
                      <Card key={item.id} className="border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="relative aspect-square">
                          <ImageWithFallback
                            src={item.url}
                            alt={item.caption || item.title || 'Project image'}
                            className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => handleImageClick(item)}
                          />
                          <div className="absolute top-2 right-2 flex flex-col gap-1">
                            <Badge variant="secondary" className="text-xs">
                              {item.category}
                            </Badge>
                            {item.meRelevant && (
                              <Badge variant="default" className="text-xs bg-green-600">
                                M&E Relevant
                              </Badge>
                            )}
                          </div>
                          {(canEdit || canDelete) && (
                            <div className="absolute top-2 left-2 flex gap-1">
                              {canEdit && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="default"
                                        size="sm"
                                        className="opacity-0 hover:opacity-100 transition-opacity text-xs p-1 bg-blue-600 hover:bg-blue-700"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEditPhoto(item);
                                        }}
                                      >
                                        <Edit className="w-3 h-3" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Edit or replace photo</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                              {canDelete && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="opacity-0 hover:opacity-100 transition-opacity text-xs p-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeletePhoto(item.id, item.title || item.caption);
                                  }}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              )}
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      className="opacity-0 hover:opacity-100 transition-opacity text-xs p-1"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        // Show move dialog - simplified to next container for demo
                                        const nextContainer = containers.find(c => c.id !== container.id && c.items.length < c.maxItems);
                                        if (nextContainer) {
                                          moveItemToContainer(item.id, nextContainer.id);
                                        } else {
                                          toast.error('No available containers with space');
                                        }
                                      }}
                                    >
                                      <ArrowUpDown className="w-3 h-3" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Move to another container</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          )}
                        </div>
                        <CardContent className="p-3">
                          <h4 className="font-medium text-sm text-gray-900 truncate mb-1">
                            {item.title || item.caption}
                          </h4>
                          {(item.description || item.caption) && (
                            <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                              {item.description || item.caption}
                            </p>
                          )}
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>
                              {formatDate(item.uploadDate || item.uploadedAt)}
                            </span>
                            <span>{item.uploadedBy || item.photographer}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {/* Add placeholder slots to show remaining capacity */}
                    {Array.from({ length: container.maxItems - container.items.length }, (_, index) => (
                      <Card key={`placeholder-${index}`} className="border-2 border-dashed border-gray-300 overflow-hidden">
                        <div className="aspect-square flex items-center justify-center bg-gray-50">
                          <div className="text-center">
                            <FileImage className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-xs text-gray-500">Empty slot</p>
                            {canAdd && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="mt-2 text-xs"
                                onClick={() => {
                                  setUploadForm(prev => ({ ...prev, containerId: container.id }));
                                  setIsUploadDialogOpen(true);
                                }}
                              >
                                Add Image
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                    <FileImage className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">No images in this container yet</p>
                    {canAdd && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setUploadForm(prev => ({ ...prev, containerId: container.id }));
                          setIsUploadDialogOpen(true);
                        }}
                      >
                        Add First Image
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          // List view - show all items across all containers
          <div className="space-y-4">
            {displayItems.map((item) => {
              const itemContainer = getContainerById(item.containerId || '');
              return (
                <Card key={item.id} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-24 h-24 flex-shrink-0">
                        <ImageWithFallback
                          src={item.url}
                          alt={item.caption || item.title || 'Project image'}
                          className="w-full h-full object-cover rounded cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => handleImageClick(item)}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-1">
                              {item.title || item.caption}
                            </h4>
                            {itemContainer && (
                              <p className="text-xs text-blue-600 mb-1">
                                Container: {itemContainer.name}
                              </p>
                            )}
                            {(item.description || item.caption) && (
                              <p className="text-sm text-gray-600 mb-2">
                                {item.description || item.caption}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>Date: {formatDate(item.uploadDate || item.uploadedAt)}</span>
                              <span>By: {item.uploadedBy || item.photographer}</span>
                              <span>File: {item.filename || 'project_image.jpg'}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {item.category}
                            </Badge>
                            {item.meRelevant && (
                              <Badge variant="default" className="text-xs bg-green-600">
                                M&E
                              </Badge>
                            )}
                            {canEdit && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditPhoto(item)}
                                className="text-xs"
                              >
                                <Edit className="w-3 h-3 mr-1" />
                                Edit
                              </Button>
                            )}
                            {canDelete && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeletePhoto(item.id, item.title || item.caption)}
                                className="text-xs text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Delete
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {displayItems.length === 0 && (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <FileImage className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No photos found</h3>
            <p className="text-gray-500 mb-4">
              No photos have been uploaded for this project yet.
            </p>
            <div className="flex items-center justify-center gap-3">
              {canAdd && (
                <>
                  <Button onClick={() => setIsContainerDialogOpen(true)} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Container
                  </Button>
                  <Button onClick={() => setIsUploadDialogOpen(true)}>
                    <Camera className="w-4 h-4 mr-2" />
                    Upload First Photo
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Photo</DialogTitle>
            <DialogDescription>
              Add a new photo to document project progress
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="photo-file">Photo File</Label>
              <Input
                id="photo-file"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              <p className="text-xs text-gray-500">Maximum file size: 10MB. Supported formats: JPG, PNG, GIF, WebP</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo-container">Container</Label>
              <Select
                value={uploadForm.containerId}
                onValueChange={(value) => setUploadForm(prev => ({ ...prev, containerId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a container (auto-selected if not chosen)" />
                </SelectTrigger>
                <SelectContent>
                  {containers.map((container) => (
                    <SelectItem 
                      key={container.id} 
                      value={container.id}
                      disabled={container.items.length >= container.maxItems}
                    >
                      {container.name} ({container.items.length}/{container.maxItems})
                      {container.items.length >= container.maxItems && ' - Full'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">Each container can hold maximum 3 images</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo-title">Title *</Label>
              <Input
                id="photo-title"
                value={uploadForm.title}
                onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter photo title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo-description">Caption</Label>
              <Textarea
                id="photo-description"
                value={uploadForm.description}
                onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional caption"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="upload-date">Upload Date</Label>
              <Input
                id="upload-date"
                type="date"
                value={uploadForm.uploadDate}
                onChange={(e) => setUploadForm(prev => ({ ...prev, uploadDate: e.target.value }))}
              />
              <p className="text-xs text-gray-500">Auto-filled to today, but editable if needed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo-category">Category</Label>
              <Select
                value={uploadForm.category}
                onValueChange={(value: 'progress' | 'completed' | 'planning') => 
                  setUploadForm(prev => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="progress">Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="planning">Planning</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUploadSubmit}>
              Upload Photo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Container Dialog */}
      <Dialog open={isContainerDialogOpen} onOpenChange={setIsContainerDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Container</DialogTitle>
            <DialogDescription>
              Create a new container to organize project photos (max 3 images per container)
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="container-name">Container Name *</Label>
              <Input
                id="container-name"
                value={containerForm.name}
                onChange={(e) => setContainerForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Foundation Work Phase"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="container-description">Description</Label>
              <Textarea
                id="container-description"
                value={containerForm.description}
                onChange={(e) => setContainerForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of what this container will contain"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsContainerDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createNewContainer}>
              Create Container
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Photo Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Photo</DialogTitle>
            <DialogDescription>
              Update photo details or replace the image file
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-photo-file">Replace Photo File (Optional)</Label>
              <Input
                id="edit-photo-file"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (!file.type.startsWith('image/')) {
                      toast.error('Please select a valid image file');
                      return;
                    }
                    if (file.size > 10 * 1024 * 1024) {
                      toast.error('File size must be less than 10MB');
                      return;
                    }
                    setEditForm(prev => ({ ...prev, file }));
                  }
                }}
                className="cursor-pointer"
              />
              <p className="text-xs text-gray-500">Leave empty to keep current image. Max size: 10MB</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-photo-container">Container</Label>
              <Select
                value={editForm.containerId}
                onValueChange={(value) => setEditForm(prev => ({ ...prev, containerId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a container" />
                </SelectTrigger>
                <SelectContent>
                  {containers.map((container) => (
                    <SelectItem 
                      key={container.id} 
                      value={container.id}
                      disabled={container.id !== editForm.containerId && container.items.length >= container.maxItems}
                    >
                      {container.name} ({container.items.length}/{container.maxItems})
                      {container.id !== editForm.containerId && container.items.length >= container.maxItems && ' - Full'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-photo-title">Title *</Label>
              <Input
                id="edit-photo-title"
                value={editForm.title}
                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter photo title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-photo-description">Caption</Label>
              <Textarea
                id="edit-photo-description"
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional caption"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-upload-date">Upload Date</Label>
              <Input
                id="edit-upload-date"
                type="date"
                value={editForm.uploadDate}
                onChange={(e) => setEditForm(prev => ({ ...prev, uploadDate: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-photo-category">Category</Label>
              <Select
                value={editForm.category}
                onValueChange={(value: 'progress' | 'completed' | 'planning') => 
                  setEditForm(prev => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="progress">Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="planning">Planning</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false);
              setEditingImage(null);
            }}>
              Cancel
            </Button>
            <Button onClick={handleEditSubmit} className="bg-blue-600 hover:bg-blue-700">
              <Edit className="w-4 h-4 mr-2" />
              Update Photo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Full Screen Image Dialog with Zoom and Pan Controls */}
      <Dialog open={isFullScreenOpen} onOpenChange={(open) => {
        setIsFullScreenOpen(open);
        if (!open) {
          setImageZoom(100);
          setImagePosition({ x: 0, y: 0 });
        }
      }}>
        <DialogContent className="max-w-[95vw] w-[95vw] max-h-[95vh] h-[95vh] p-0 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>
              {selectedImage?.title || 'Project Image'}
            </DialogTitle>
            <DialogDescription>
              Full screen view of project image with zoom and pan controls
            </DialogDescription>
          </DialogHeader>
          {selectedImage && (
            <div className="flex flex-col h-full">
              {/* Image Controls Bar */}
              <div className="flex items-center justify-between p-3 bg-gray-900 text-white">
                <div className="flex items-center gap-3">
                  <h3 className="font-medium">{selectedImage.title || selectedImage.caption}</h3>
                  <Badge variant="secondary">{selectedImage.category}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setImageZoom(prev => Math.max(25, prev - 25));
                      if (imageZoom <= 50) setImagePosition({ x: 0, y: 0 });
                    }}
                    disabled={imageZoom <= 25}
                    className="text-white hover:bg-gray-700"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-sm min-w-[60px] text-center">{imageZoom}%</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setImageZoom(prev => Math.min(300, prev + 25))}
                    disabled={imageZoom >= 300}
                    className="text-white hover:bg-gray-700"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setImageZoom(100);
                      setImagePosition({ x: 0, y: 0 });
                    }}
                    className="text-white hover:bg-gray-700"
                  >
                    Reset
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = selectedImage.url;
                      link.download = selectedImage.filename || 'project-image.jpg';
                      link.click();
                    }}
                    className="text-white hover:bg-gray-700"
                  >
                    <DownloadIcon className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>

              {/* Image Container with Pan and Zoom Support */}
              <div 
                className="flex-1 overflow-hidden bg-gray-100 flex items-center justify-center relative"
                style={{ cursor: imageZoom > 100 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
                onMouseDown={(e) => {
                  if (imageZoom > 100) {
                    setIsDragging(true);
                    setDragStart({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y });
                  }
                }}
                onMouseMove={(e) => {
                  if (isDragging && imageZoom > 100) {
                    setImagePosition({
                      x: e.clientX - dragStart.x,
                      y: e.clientY - dragStart.y
                    });
                  }
                }}
                onMouseUp={() => setIsDragging(false)}
                onMouseLeave={() => setIsDragging(false)}
              >
                <img
                  src={selectedImage.url}
                  alt={selectedImage.title || selectedImage.caption}
                  style={{
                    width: `${imageZoom}%`,
                    maxWidth: 'none',
                    height: 'auto',
                    transform: `translate(${imagePosition.x}px, ${imagePosition.y}px)`,
                    transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                    userSelect: 'none',
                    pointerEvents: 'none'
                  }}
                  className="object-contain"
                  draggable={false}
                />
                {imageZoom > 100 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-xs">
                    Click and drag to pan • +/- to zoom • 0 to reset
                  </div>
                )}
                {imageZoom === 100 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-xs">
                    Use +/- keys or buttons to zoom • ESC to close
                  </div>
                )}
              </div>

              {/* Image Details Footer */}
              <div className="p-4 bg-white border-t">
                {selectedImage.description && (
                  <p className="text-gray-600 mb-3">{selectedImage.description}</p>
                )}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-4">
                    <span>Date of Entry: {formatDate(selectedImage.uploadDate || selectedImage.uploadedAt)}</span>
                    <span>Uploaded by: {selectedImage.uploadedBy || selectedImage.photographer}</span>
                    {selectedImage.filename && <span>File: {selectedImage.filename}</span>}
                  </div>
                  {selectedImage.containerId && (
                    <span className="text-blue-600">Container: {getContainerById(selectedImage.containerId)?.name}</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}