export interface GalleryAsset {
  id: string;
  projectId: string;
  filename: string;
  originalName: string;
  type: 'image' | 'video' | 'document';
  mimeType: string;
  url: string;
  thumbnailUrl?: string;
  size: number;
  dimensions?: {
    width: number;
    height: number;
  };
  altText: string;
  category: 'progress' | 'equipment' | 'materials' | 'safety' | 'completed' | 'other';
  tags: string[];
  captureDate?: string; // when photo was taken
  uploadDate: string;
  uploadedBy: string;
  order: number; // for sorting/ordering
  location?: {
    latitude: number;
    longitude: number;
    description: string;
  };
  metadata: {
    camera?: string;
    settings?: any;
    description?: string;
  };
  status: 'uploading' | 'processing' | 'ready' | 'error';
}

export interface GalleryCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  assetCount: number;
}

export interface GalleryUpload {
  files: File[];
  category: string;
  tags: string[];
  altText?: string;
  captureDate?: string;
  location?: string;
}

export interface GalleryFilter {
  category?: string;
  tags?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  uploadedBy?: string;
  type?: 'image' | 'video' | 'document';
}