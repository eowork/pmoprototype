import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Badge } from '../../ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../ui/alert-dialog';
import { Upload, Download, Trash2, File, FileText, Image, Archive, Plus, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { FileAttachmentManagerProps, FileAttachment } from '../types';

export function FileAttachmentManager({
  files,
  onUpload,
  onDelete,
  onDownload,
  category,
  year,
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  allowedTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.png', '.jpg', '.jpeg', '.zip'],
  maxFiles = 20
}: FileAttachmentManagerProps) {
  const [dragActive, setDragActive] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadDescription, setUploadDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ show: boolean; file: FileAttachment | null }>({
    show: false,
    file: null
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get file icon based on type
  const getFileIcon = (fileType: string) => {
    if (fileType.includes('image')) return <Image className="h-4 w-4" />;
    if (fileType.includes('pdf')) return <FileText className="h-4 w-4" />;
    if (fileType.includes('zip') || fileType.includes('archive')) return <Archive className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Validate file
  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize) {
      return `File size exceeds ${formatFileSize(maxFileSize)} limit`;
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
      return `File type not allowed. Supported types: ${allowedTypes.join(', ')}`;
    }

    // Check max files limit
    if (files.length >= maxFiles) {
      return `Maximum ${maxFiles} files allowed`;
    }

    return null;
  };

  // Handle file selection
  const handleFileSelect = (newFiles: FileList | null) => {
    if (!newFiles) return;

    const validFiles: File[] = [];
    const errors: string[] = [];

    Array.from(newFiles).forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      toast.error(`Upload errors:\n${errors.join('\n')}`);
    }

    if (validFiles.length > 0) {
      setSelectedFiles(validFiles);
      setShowUploadDialog(true);
    }
  };

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  // Handle upload confirmation
  const handleUploadConfirm = () => {
    if (selectedFiles.length > 0) {
      onUpload(selectedFiles, uploadDescription.trim() || undefined);
      setSelectedFiles([]);
      setUploadDescription('');
      setShowUploadDialog(false);
      toast.success(`${selectedFiles.length} file(s) uploaded successfully`);
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (deleteConfirmation.file) {
      onDelete(deleteConfirmation.file.id);
      setDeleteConfirmation({ show: false, file: null });
      toast.success('File deleted successfully');
    }
  };

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-900">
            File Attachments
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {files.length}/{maxFiles} files
            </Badge>
            <Button
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="bg-slate-900 hover:bg-slate-800"
              disabled={files.length >= maxFiles}
            >
              <Plus className="h-4 w-4 mr-2" />
              Upload Files
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
          } ${files.length >= maxFiles ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => files.length < maxFiles && fileInputRef.current?.click()}
        >
          <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm text-slate-600 mb-1">
            {files.length >= maxFiles
              ? `Maximum ${maxFiles} files reached`
              : 'Drop files here or click to browse'}
          </p>
          <p className="text-xs text-slate-500">
            Supported: {allowedTypes.join(', ')} • Max size: {formatFileSize(maxFileSize)}
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={allowedTypes.join(',')}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={files.length >= maxFiles}
        />

        {/* Files Table */}
        {files.length > 0 && (
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-semibold text-slate-900">File</TableHead>
                  <TableHead className="font-semibold text-slate-900">Size</TableHead>
                  <TableHead className="font-semibold text-slate-900">Uploaded</TableHead>
                  <TableHead className="font-semibold text-slate-900">Uploader</TableHead>
                  <TableHead className="text-center font-semibold text-slate-900">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.map((file) => (
                  <TableRow key={file.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="text-slate-500">
                          {getFileIcon(file.fileType)}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{file.originalName}</div>
                          {file.description && (
                            <div className="text-xs text-slate-500 mt-1">{file.description}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-700">
                      {formatFileSize(file.fileSize)}
                    </TableCell>
                    <TableCell className="text-slate-700">
                      {new Date(file.uploadDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-slate-700">{file.uploader}</TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDownload(file)}
                          className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-700"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirmation({ show: true, file })}
                          className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {files.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <File className="h-12 w-12 mx-auto mb-2 text-slate-300" />
            <p>No files uploaded yet</p>
            <p className="text-sm">Upload supporting documents and attachments here</p>
          </div>
        )}
      </CardContent>

      {/* Upload Confirmation Dialog */}
      <AlertDialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Upload Files</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to upload {selectedFiles.length} file(s). Add an optional description:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            <div className="max-h-32 overflow-auto space-y-1">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  {getFileIcon(file.type)}
                  <span className="flex-1 truncate">{file.name}</span>
                  <span className="text-slate-500">{formatFileSize(file.size)}</span>
                </div>
              ))}
            </div>
            <Input
              placeholder="Optional description..."
              value={uploadDescription}
              onChange={(e) => setUploadDescription(e.target.value)}
              maxLength={200}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setSelectedFiles([]);
              setUploadDescription('');
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleUploadConfirm}>
              Upload {selectedFiles.length} File(s)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmation.show} onOpenChange={(open) => 
        setDeleteConfirmation({ show: open, file: deleteConfirmation.file })
      }>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete File</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteConfirmation.file?.originalName}"? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              Delete File
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}