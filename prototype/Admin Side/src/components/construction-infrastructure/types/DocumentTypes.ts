export interface ProjectDocument {
  id: string;
  projectId: string;
  filename: string;
  originalName: string;
  type: string; // MIME type
  size: number;
  url: string;
  uploadDate: string;
  version: number;
  category: 'contract' | 'permit' | 'technical' | 'financial' | 'legal' | 'other';
  metadata: {
    description?: string;
    tags: string[];
    uploadedBy: string;
    checksumMD5?: string;
  };
  extractedText?: string;
  chunks?: DocumentChunk[];
  processedAt?: string;
  status: 'uploading' | 'processing' | 'ready' | 'error';
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  chunkNumber: number;
  content: string;
  startByte: number;
  endByte: number;
}

export interface DocumentUpload {
  file: File;
  category: string;
  description?: string;
  tags: string[];
}

export interface DocumentValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  fileInfo: {
    size: number;
    type: string;
    name: string;
  };
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  version: number;
  filename: string;
  uploadDate: string;
  uploadedBy: string;
  changes?: string;
  url: string;
}