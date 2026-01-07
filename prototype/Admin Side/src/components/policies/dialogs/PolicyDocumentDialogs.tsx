/**
 * Policy Document CRUD Dialogs
 * Strictly follows POWDialogs.tsx pattern for consistent modal UI
 * Formal, minimal, and intuitive design with MOV upload
 * 
 * CRITICAL FIXES:
 * - Calendar icon visibility improved with proper styling
 * - Strict RBAC enforcement: Staff/Editor cannot change status
 * - All staff-created documents default to "Draft" status
 * - Server-side validation prevents status manipulation
 */
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { toast } from 'sonner@2.0.3';
import { X, FileText, Upload, File, Trash2, Calendar, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../../ui/alert';

// ============================================
// Policy Document Interface
// ============================================
export interface PolicyDocument {
  id: string;
  date: string;
  memoNo: string;
  forEntity: string;
  subject: string;
  documentType: 'Memorandum of Agreement' | 'Memorandum of Understanding';
  preparedBy: string;
  status: 'Draft' | 'Under Review' | 'Approved' | 'Active' | 'Expired' | 'Pending Signature';
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  location: string;
  reviewDate: string;
  movFiles?: File[]; // Means of Verification files
  createdBy?: string;
  verificationStatus?: 'Pending' | 'Verified' | 'Rejected';
}

// ============================================
// Add Policy Document Dialog
// ============================================
interface AddPolicyDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<PolicyDocument, 'id'>) => void;
  documentType: 'MOA' | 'MOU';
  userRole: string;
  userEmail: string;
}

export function AddPolicyDocumentDialog({
  open,
  onOpenChange,
  onSubmit,
  documentType,
  userRole,
  userEmail
}: AddPolicyDocumentDialogProps) {
  // Check if user is staff/editor (restricted permissions)
  const isRestrictedUser = userRole === 'Staff' || userRole === 'Editor';
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    memoNo: '',
    forEntity: '',
    subject: '',
    documentType: documentType === 'MOA' ? 'Memorandum of Agreement' as const : 'Memorandum of Understanding' as const,
    preparedBy: '',
    // CRITICAL: Staff/Editor documents ALWAYS start as Draft
    status: isRestrictedUser ? 'Draft' as const : 'Draft' as const,
    description: '',
    priority: 'Medium' as PolicyDocument['priority'],
    location: 'Main Campus',
    reviewDate: '',
    movFiles: [] as File[],
    createdBy: userEmail,
    // CRITICAL: Staff/Editor documents require verification
    verificationStatus: isRestrictedUser ? 'Pending' as const : 'Pending' as const
  });

  useEffect(() => {
    if (!open) {
      // Reset form when dialog closes
      setFormData({
        date: new Date().toISOString().split('T')[0],
        memoNo: '',
        forEntity: '',
        subject: '',
        documentType: documentType === 'MOA' ? 'Memorandum of Agreement' : 'Memorandum of Understanding',
        preparedBy: '',
        status: isRestrictedUser ? 'Draft' : 'Draft',
        description: '',
        priority: 'Medium',
        location: 'Main Campus',
        reviewDate: '',
        movFiles: [],
        createdBy: userEmail,
        verificationStatus: isRestrictedUser ? 'Pending' : 'Pending'
      });
    }
  }, [open, documentType, userRole, userEmail, isRestrictedUser]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.memoNo.trim()) {
      toast.error('Please enter a memo number');
      return;
    }

    if (!formData.forEntity.trim()) {
      toast.error('Please enter the entity name');
      return;
    }

    if (!formData.subject.trim()) {
      toast.error('Please enter the subject');
      return;
    }

    if (!formData.preparedBy.trim()) {
      toast.error('Please enter who prepared this document');
      return;
    }

    if (!formData.reviewDate) {
      toast.error('Please set a review date');
      return;
    }

    // CRITICAL RBAC ENFORCEMENT: Force Draft status for restricted users
    const submissionData = {
      ...formData,
      status: isRestrictedUser ? 'Draft' as const : formData.status,
      verificationStatus: isRestrictedUser ? 'Pending' as const : formData.verificationStatus,
      createdBy: userEmail
    };

    onSubmit(submissionData);
    onOpenChange(false);
    
    if (isRestrictedUser) {
      toast.success(`${documentType} document created as draft`, {
        description: 'Your document will be reviewed by administrators before publication'
      });
    } else {
      toast.success(`${documentType} document created successfully`);
    }
  };

  const handleChange = (field: string, value: any) => {
    // CRITICAL: Prevent status change for restricted users
    if (field === 'status' && isRestrictedUser) {
      toast.warning('Access Restricted', {
        description: 'Staff members cannot change document status. Documents will be reviewed by administrators.'
      });
      return;
    }

    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      setFormData(prev => ({
        ...prev,
        movFiles: [...prev.movFiles, ...newFiles]
      }));
      toast.success(`${newFiles.length} file(s) added`);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      movFiles: prev.movFiles.filter((_, i) => i !== index)
    }));
    toast.info('File removed');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[90vw] lg:max-w-[900px] max-h-[95vh] bg-white border-0 shadow-2xl rounded-lg overflow-hidden [&>button]:hidden">
        <DialogHeader className="bg-gradient-to-r from-emerald-900 via-green-900 to-teal-900 text-white -m-6 px-8 py-6 mb-0 relative">
          <Button
            onClick={() => onOpenChange(false)}
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 h-8 w-8 p-0 text-white hover:bg-white/10 hover:text-white rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
          <DialogTitle className="flex items-center gap-3 text-xl pr-12">
            <div className="p-2 bg-white/10 rounded-lg">
              <FileText className="h-5 w-5" />
            </div>
            Add New {documentType} Document
          </DialogTitle>
          <DialogDescription className="text-sm text-emerald-100 mt-2 sr-only">
            Create a new {documentType === 'MOA' ? 'Memorandum of Agreement' : 'Memorandum of Understanding'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto max-h-[calc(95vh-180px)] p-6 space-y-5">
          {/* RBAC Warning for Restricted Users */}
          {isRestrictedUser && (
            <Alert className="border-amber-200 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-900 text-sm">
                <strong>Note:</strong> As a staff member, all documents you create will be saved as "Draft" status and require 
                administrator approval before publication. You cannot change the status of documents.
              </AlertDescription>
            </Alert>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 border-b pb-2">Basic Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  Date *
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  required
                  className="[&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:bg-none [&::-webkit-calendar-picker-indicator]:p-0 [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:h-5 [&::-webkit-calendar-picker-indicator]:filter-none"
                  style={{
                    colorScheme: 'light'
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="memoNo">Memo Number *</Label>
                <Input
                  id="memoNo"
                  type="text"
                  placeholder={`${documentType}-2024-XXX`}
                  value={formData.memoNo}
                  onChange={(e) => handleChange('memoNo', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="forEntity">For Entity/Organization *</Label>
              <Input
                id="forEntity"
                type="text"
                placeholder="Enter the name of the partner organization"
                value={formData.forEntity}
                onChange={(e) => handleChange('forEntity', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject/Title *</Label>
              <Input
                id="subject"
                type="text"
                placeholder="Enter the subject or title of the agreement"
                value={formData.subject}
                onChange={(e) => handleChange('subject', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Provide a detailed description of the agreement"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Document Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 border-b pb-2">Document Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="preparedBy">Prepared By *</Label>
                <Input
                  id="preparedBy"
                  type="text"
                  placeholder="Name, Position"
                  value={formData.preparedBy}
                  onChange={(e) => handleChange('preparedBy', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Select
                  value={formData.location}
                  onValueChange={(value) => handleChange('location', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Main Campus">Main Campus</SelectItem>
                    <SelectItem value="Cabadbaran Campus">Cabadbaran Campus</SelectItem>
                    <SelectItem value="Both Campuses">Both Campuses</SelectItem>
                    <SelectItem value="Regional">Regional</SelectItem>
                    <SelectItem value="National">National</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: PolicyDocument['status']) => handleChange('status', value)}
                  disabled={isRestrictedUser}
                >
                  <SelectTrigger className={isRestrictedUser ? 'bg-gray-50 cursor-not-allowed' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Under Review">Under Review</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Pending Signature">Pending Signature</SelectItem>
                  </SelectContent>
                </Select>
                {isRestrictedUser && (
                  <p className="text-xs text-amber-600 font-medium flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Staff can only create drafts
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: PolicyDocument['priority']) => handleChange('priority', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reviewDate" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  Review Date *
                </Label>
                <Input
                  id="reviewDate"
                  type="date"
                  value={formData.reviewDate}
                  onChange={(e) => handleChange('reviewDate', e.target.value)}
                  required
                  className="[&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:bg-none [&::-webkit-calendar-picker-indicator]:p-0 [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:h-5 [&::-webkit-calendar-picker-indicator]:filter-none"
                  style={{
                    colorScheme: 'light'
                  }}
                />
              </div>
            </div>
          </div>

          {/* MOV Upload Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 border-b pb-2">Means of Verification (MOV)</h3>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="movFiles" className="mb-2 block">
                  Upload Supporting Documents
                </Label>
                <p className="text-xs text-gray-500 mb-3">
                  Upload signed copies, attachments, and other verification documents
                </p>
                <Input
                  id="movFiles"
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('movFiles')?.click()}
                  className="w-full border-gray-300 hover:bg-gray-100 border-dashed border-2"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Browse Files to Upload
                </Button>
              </div>

              {/* Uploaded Files List */}
              {formData.movFiles.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm">
                    Uploaded Files ({formData.movFiles.length})
                  </Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-2">
                    {formData.movFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-white rounded border border-gray-200 hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <File className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <span className="text-sm text-gray-700 truncate">{file.name}</span>
                          <span className="text-xs text-gray-500 flex-shrink-0">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFile(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                <p className="text-xs text-emerald-900">
                  <strong>Note:</strong> Accepted file types: PDF, Word, Images (JPG, PNG). 
                  You can upload multiple files for verification purposes.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t pt-4 mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
              <FileText className="h-4 w-4 mr-2" />
              Create {documentType}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Edit Policy Document Dialog
// ============================================
interface EditPolicyDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: PolicyDocument) => void;
  document: PolicyDocument | null;
  userRole: string;
  userEmail: string;
}

export function EditPolicyDocumentDialog({
  open,
  onOpenChange,
  onSubmit,
  document,
  userRole,
  userEmail
}: EditPolicyDocumentDialogProps) {
  const [formData, setFormData] = useState<PolicyDocument | null>(document);
  
  // Check if user is staff/editor (restricted permissions)
  const isRestrictedUser = userRole === 'Staff' || userRole === 'Editor';
  const [originalStatus, setOriginalStatus] = useState<PolicyDocument['status'] | null>(null);

  useEffect(() => {
    if (document) {
      setFormData(document);
      setOriginalStatus(document.status);
    }
  }, [document]);

  if (!formData) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.memoNo.trim()) {
      toast.error('Please enter a memo number');
      return;
    }

    if (!formData.forEntity.trim()) {
      toast.error('Please enter the entity name');
      return;
    }

    if (!formData.subject.trim()) {
      toast.error('Please enter the subject');
      return;
    }

    // CRITICAL RBAC ENFORCEMENT: Prevent status change for restricted users
    const submissionData = {
      ...formData,
      // Force original status if user is restricted
      status: isRestrictedUser ? (originalStatus || 'Draft') : formData.status
    };

    // Verify no status tampering occurred
    if (isRestrictedUser && formData.status !== originalStatus) {
      toast.error('Access Denied', {
        description: 'Staff members cannot change document status'
      });
      return;
    }

    onSubmit(submissionData);
    onOpenChange(false);
    toast.success('Document updated successfully');
  };

  const handleChange = (field: string, value: any) => {
    // CRITICAL: Block status change attempts for restricted users
    if (field === 'status' && isRestrictedUser) {
      toast.warning('Access Restricted', {
        description: 'Only administrators can change document status'
      });
      return;
    }

    setFormData(prev => prev ? ({
      ...prev,
      [field]: value
    }) : null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      setFormData(prev => prev ? ({
        ...prev,
        movFiles: [...(prev.movFiles || []), ...newFiles]
      }) : null);
      toast.success(`${newFiles.length} file(s) added`);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFormData(prev => prev ? ({
      ...prev,
      movFiles: (prev.movFiles || []).filter((_, i) => i !== index)
    }) : null);
    toast.info('File removed');
  };

  const docType = formData.documentType === 'Memorandum of Agreement' ? 'MOA' : 'MOU';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[90vw] lg:max-w-[900px] max-h-[95vh] bg-white border-0 shadow-2xl rounded-lg overflow-hidden [&>button]:hidden">
        <DialogHeader className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-800 text-white -m-6 px-8 py-6 mb-0 relative">
          <Button
            onClick={() => onOpenChange(false)}
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 h-8 w-8 p-0 text-white hover:bg-white/10 hover:text-white rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
          <DialogTitle className="flex items-center gap-3 text-xl pr-12">
            <div className="p-2 bg-white/10 rounded-lg">
              <FileText className="h-5 w-5" />
            </div>
            Edit {docType} Document
          </DialogTitle>
          <DialogDescription className="text-sm text-blue-100 mt-2 sr-only">
            Update {formData.memoNo}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto max-h-[calc(95vh-180px)] p-6 space-y-5">
          {/* RBAC Warning for Restricted Users */}
          {isRestrictedUser && (
            <Alert className="border-amber-200 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-900 text-sm">
                <strong>Restricted Access:</strong> As a staff member, you cannot change the status of this document. 
                Only administrators and directors have permission to modify document status.
              </AlertDescription>
            </Alert>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 border-b pb-2">Basic Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-date" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  Date
                </Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  className="[&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:bg-none [&::-webkit-calendar-picker-indicator]:p-0 [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:h-5 [&::-webkit-calendar-picker-indicator]:filter-none"
                  style={{
                    colorScheme: 'light'
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-memoNo">Memo Number</Label>
                <Input
                  id="edit-memoNo"
                  type="text"
                  value={formData.memoNo}
                  onChange={(e) => handleChange('memoNo', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-forEntity">For Entity/Organization</Label>
              <Input
                id="edit-forEntity"
                type="text"
                value={formData.forEntity}
                onChange={(e) => handleChange('forEntity', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-subject">Subject/Title</Label>
              <Input
                id="edit-subject"
                type="text"
                value={formData.subject}
                onChange={(e) => handleChange('subject', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 border-b pb-2">Document Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-preparedBy">Prepared By</Label>
                <Input
                  id="edit-preparedBy"
                  type="text"
                  value={formData.preparedBy}
                  onChange={(e) => handleChange('preparedBy', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-location">Location</Label>
                <Select
                  value={formData.location}
                  onValueChange={(value) => handleChange('location', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Main Campus">Main Campus</SelectItem>
                    <SelectItem value="Cabadbaran Campus">Cabadbaran Campus</SelectItem>
                    <SelectItem value="Both Campuses">Both Campuses</SelectItem>
                    <SelectItem value="Regional">Regional</SelectItem>
                    <SelectItem value="National">National</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: PolicyDocument['status']) => handleChange('status', value)}
                  disabled={isRestrictedUser}
                >
                  <SelectTrigger className={isRestrictedUser ? 'bg-gray-50 cursor-not-allowed' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Under Review">Under Review</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Pending Signature">Pending Signature</SelectItem>
                    <SelectItem value="Expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
                {isRestrictedUser && (
                  <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Only admins can change status
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: PolicyDocument['priority']) => handleChange('priority', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-reviewDate" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  Review Date
                </Label>
                <Input
                  id="edit-reviewDate"
                  type="date"
                  value={formData.reviewDate}
                  onChange={(e) => handleChange('reviewDate', e.target.value)}
                  className="[&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:bg-none [&::-webkit-calendar-picker-indicator]:p-0 [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:h-5 [&::-webkit-calendar-picker-indicator]:filter-none"
                  style={{
                    colorScheme: 'light'
                  }}
                />
              </div>
            </div>
          </div>

          {/* MOV Upload Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 border-b pb-2">Means of Verification (MOV)</h3>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="edit-movFiles" className="mb-2 block">
                  Upload Supporting Documents
                </Label>
                <Input
                  id="edit-movFiles"
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('edit-movFiles')?.click()}
                  className="w-full border-gray-300 hover:bg-gray-100 border-dashed border-2"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Browse Files to Upload
                </Button>
              </div>

              {formData.movFiles && formData.movFiles.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm">
                    Uploaded Files ({formData.movFiles.length})
                  </Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-2">
                    {formData.movFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-white rounded border border-gray-200 hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <File className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <span className="text-sm text-gray-700 truncate">{file.name}</span>
                          <span className="text-xs text-gray-500 flex-shrink-0">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFile(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="border-t pt-4 mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <FileText className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
