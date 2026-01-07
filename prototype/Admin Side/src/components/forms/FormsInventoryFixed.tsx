import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';
import { 
  FileText, Plus, Edit, Trash2, Eye, Download, Search, Filter, 
  Grid3x3, List, Table as TableIcon, Upload, Calendar, Users, Building2,
  FileCheck, Target, BarChart3, ChevronDown, SortAsc, SortDesc, 
  InfoIcon, HelpCircle, ChevronUp, Clock, FolderOpen, X, Settings
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { 
  FormDocument, 
  FormFilter, 
  ViewType, 
  LEGACY_FORM_TYPES, 
  FORM_CATEGORIES,
  DEPARTMENTS,
  OFFICES 
} from './types';

interface FormsInventoryProps {
  userRole: string;
  requireAuth: (action: string) => boolean;
  onNavigate: (page: string) => void;
}

// Enhanced interface for upload tracking
interface UploadFormData {
  title: string;
  category: string;
  formType: string;
  department: string;
  office: string;
  purpose: string;
  instructions: string;
  remarks: string;
  version: string;
  validityPeriod: string;
}

// Mock data with all the legacy forms converted to the new structure
const MOCK_FORMS_DATA: FormDocument[] = [
  {
    id: 'hgdg-16-001',
    title: 'HGDG-16 Sectoral Forms',
    description: 'Sectoral reporting forms for gender and development activities and programs',
    category: 'GAD Reporting',
    formType: 'HGDG-16 Sectoral Forms',
    version: '2024.1',
    lastUpdated: '2024-01-15',
    department: 'Planning and Development Office',
    office: 'Main Office',
    purpose: 'Gender and development program reporting and compliance',
    instructions: 'Complete all sections and submit quarterly to the Planning Office',
    remarks: 'Updated for 2024 compliance requirements. Includes new sectoral indicators.',
    filePath: '/forms/hgdg-16-sectoral-2024.pdf',
    fileName: 'HGDG-16-Sectoral-Forms-2024.pdf',
    fileSize: '2.1 MB',
    downloadCount: 324,
    isActive: true,
    requiredBy: ['GAD Focal Persons', 'Department Heads'],
    relatedForms: ['gad-budget-plan', 'accomplishment-report'],
    validityPeriod: '1 Year',
    uploadedBy: 'Maria Santos',
    uploadedDate: '2024-01-15',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    tags: ['GAD', 'Reporting', 'Quarterly', 'Compliance']
  },
  {
    id: 'pimme-001',
    title: 'PIMME Checklist',
    description: 'Project implementation monitoring and evaluation checklist for systematic project assessment',
    category: 'Project Monitoring',
    formType: 'PIMME Checklist',
    version: '2024.1',
    lastUpdated: '2024-01-10',
    department: 'Project Management Office',
    office: 'Main Office',
    purpose: 'Systematic monitoring and evaluation of project implementation',
    instructions: 'Use for regular project monitoring activities and milestone assessments',
    remarks: 'Enhanced with digital tracking capabilities. Recommended for all project phases.',
    filePath: '/forms/pimme-checklist-2024.pdf',
    fileName: 'PIMME-Checklist-2024.pdf',
    fileSize: '1.8 MB',
    downloadCount: 287,
    isActive: true,
    requiredBy: ['Project Managers', 'PMO Staff'],
    relatedForms: ['project-proposal', 'monitoring-plan'],
    validityPeriod: '2 Years',
    uploadedBy: 'John Dela Cruz',
    uploadedDate: '2024-01-10',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
    tags: ['Project', 'Monitoring', 'Evaluation', 'Checklist']
  },
  {
    id: 'pmo-monthly-001',
    title: 'PMO Monthly Accomplishment Form',
    description: 'Monthly progress reporting form for Project Management Office activities and achievements',
    category: 'Progress Reporting',
    formType: 'PMO Monthly Accomplishment Form',
    version: '2024.1',
    lastUpdated: '2024-01-05',
    department: 'Project Management Office',
    office: 'Main Office',
    purpose: 'Monthly reporting of PMO activities and project accomplishments',
    instructions: 'Complete and submit by the 5th of each month following the reporting period',
    remarks: 'Streamlined format with integrated progress indicators. Mandatory for all PMO staff.',
    filePath: '/forms/pmo-monthly-accomplishment-2024.pdf',
    fileName: 'PMO-Monthly-Accomplishment-2024.pdf',
    fileSize: '1.5 MB',
    downloadCount: 245,
    isActive: true,
    requiredBy: ['PMO Staff', 'Project Coordinators'],
    relatedForms: ['project-status-report', 'quarterly-report'],
    validityPeriod: '1 Year',
    uploadedBy: 'Anna Garcia',
    uploadedDate: '2024-01-05',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
    tags: ['PMO', 'Monthly', 'Accomplishment', 'Progress']
  },
  {
    id: 'eval-plan-001',
    title: 'Evaluation Plan Template',
    description: 'Comprehensive template for project evaluation planning and assessment framework',
    category: 'Evaluation',
    formType: 'Evaluation Plan',
    version: '2023.2',
    lastUpdated: '2023-12-20',
    department: 'Planning and Development Office',
    office: 'Main Office',
    purpose: 'Systematic evaluation planning for projects and programs',
    instructions: 'Customize template according to project scope and evaluation requirements',
    remarks: 'Comprehensive template covering all evaluation phases. Include stakeholder analysis.',
    filePath: '/forms/evaluation-plan-template-2023.pdf',
    fileName: 'Evaluation-Plan-Template-2023.pdf',
    fileSize: '2.3 MB',
    downloadCount: 198,
    isActive: true,
    requiredBy: ['Project Managers', 'Evaluation Team'],
    relatedForms: ['monitoring-plan', 'project-proposal'],
    validityPeriod: '3 Years',
    uploadedBy: 'Robert Cruz',
    uploadedDate: '2023-12-20',
    createdAt: new Date('2023-12-20'),
    updatedAt: new Date('2023-12-20'),
    tags: ['Evaluation', 'Planning', 'Template', 'Assessment']
  },
  {
    id: 'monitor-plan-001',
    title: 'Monitoring Plan Template',
    description: 'Template for project monitoring plans and frameworks with performance indicators',
    category: 'Monitoring',
    formType: 'Monitoring Plan',
    version: '2023.2',
    lastUpdated: '2023-12-18',
    department: 'Project Management Office',
    office: 'Main Office',
    purpose: 'Systematic monitoring plan development for projects',
    instructions: 'Adapt template to specific project monitoring requirements and indicators',
    remarks: 'Flexible template with customizable KPIs. Supports quarterly and annual reporting.',
    filePath: '/forms/monitoring-plan-template-2023.pdf',
    fileName: 'Monitoring-Plan-Template-2023.pdf',
    fileSize: '2.0 MB',
    downloadCount: 123,
    isActive: true,
    requiredBy: ['Project Managers', 'Monitoring Team'],
    relatedForms: ['evaluation-plan', 'pimme-checklist'],
    validityPeriod: '3 Years',
    uploadedBy: 'Lisa Wong',
    uploadedDate: '2023-12-18',
    createdAt: new Date('2023-12-18'),
    updatedAt: new Date('2023-12-18'),
    tags: ['Monitoring', 'Planning', 'Template', 'Indicators']
  },
  {
    id: 'csu-me-001',
    title: 'CSU M&E Plan Framework',
    description: 'Comprehensive monitoring and evaluation plan framework for Caraga State University',
    category: 'M&E Framework',
    formType: 'CSU M&E Plan',
    version: '2023.1',
    lastUpdated: '2023-12-15',
    department: 'Planning and Development Office',
    office: 'Main Office',
    purpose: 'Institutional monitoring and evaluation framework implementation',
    instructions: 'Reference document for all M&E activities within the university',
    remarks: 'Master framework document. Align all departmental M&E plans with this framework.',
    filePath: '/forms/csu-me-plan-framework-2023.pdf',
    fileName: 'CSU-ME-Plan-Framework-2023.pdf',
    fileSize: '3.2 MB',
    downloadCount: 70,
    isActive: true,
    requiredBy: ['All Departments', 'Planning Officers'],
    relatedForms: ['monitoring-plan', 'evaluation-plan'],
    validityPeriod: '5 Years',
    uploadedBy: 'Dr. Patricia Reyes',
    uploadedDate: '2023-12-15',
    createdAt: new Date('2023-12-15'),
    updatedAt: new Date('2023-12-15'),
    tags: ['M&E', 'Framework', 'Institutional', 'CSU']
  }
];

// View type configurations
const VIEW_TYPES: ViewType[] = [
  { value: 'table', label: 'Table', icon: TableIcon },
  { value: 'list', label: 'List', icon: List },
  { value: 'card', label: 'Card', icon: Grid3x3 }
];

export function FormsInventory({ userRole, requireAuth, onNavigate }: FormsInventoryProps) {
  const [forms, setForms] = useState<FormDocument[]>(MOCK_FORMS_DATA || []);
  const [filter, setFilter] = useState<FormFilter>({
    search: '',
    category: 'All Categories',
    formType: 'all',
    department: 'All Departments',
    office: 'All Offices',
    timeRange: 'all',
    sortBy: 'name',
    sortOrder: 'asc',
    isActive: undefined
  });
  const [viewType, setViewType] = useState<'table' | 'list' | 'card'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedForm, setSelectedForm] = useState<FormDocument | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isBatchUploadDialogOpen, setIsBatchUploadDialogOpen] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [batchFiles, setBatchFiles] = useState<File[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [titleSearch, setTitleSearch] = useState('');
  const [remarks, setRemarks] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const batchFileInputRef = useRef<HTMLInputElement>(null);
  
  const [uploadFormData, setUploadFormData] = useState<UploadFormData>({
    title: '',
    category: 'Other',
    formType: 'Other',
    department: 'Planning and Development Office',
    office: 'Main Office',
    purpose: '',
    instructions: '',
    remarks: '',
    version: '1.0',
    validityPeriod: '1 Year'
  });
  
  const [newForm, setNewForm] = useState<Partial<FormDocument>>({
    title: '',
    description: '',
    category: 'Other',
    formType: 'Other',
    version: '1.0',
    department: 'Other',
    office: 'Other',
    purpose: '',
    instructions: '',
    fileName: '',
    fileSize: '',
    isActive: true,
    requiredBy: [],
    relatedForms: [],
    tags: []
  });

  // FIXED: Separate state for edit form to prevent flickering
  const [editForm, setEditForm] = useState<Partial<FormDocument>>({
    title: '',
    description: '',
    category: 'Other',
    formType: 'Other',
    version: '1.0',
    department: 'Other',
    office: 'Other',
    purpose: '',
    instructions: '',
    fileName: '',
    fileSize: '',
    isActive: true,
    requiredBy: [],
    relatedForms: [],
    tags: []
  });

  // Safe array access for constants
  const safeFormCategories = Array.isArray(FORM_CATEGORIES) ? FORM_CATEGORIES : [];
  const safeDepartments = Array.isArray(DEPARTMENTS) ? DEPARTMENTS : [];
  const safeOffices = Array.isArray(OFFICES) ? OFFICES : [];
  const safeLegacyFormTypes = Array.isArray(LEGACY_FORM_TYPES) ? LEGACY_FORM_TYPES : [];

  // Initialize categories state after safe arrays are defined
  useEffect(() => {
    setCategories(safeFormCategories.filter(cat => cat !== 'All Categories'));
  }, [safeFormCategories]);

  // Filtered and sorted forms with proper null checking
  const filteredForms = useMemo(() => {
    try {
      let filtered = Array.isArray(forms) ? [...forms] : [];

      // Apply filters
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        filtered = filtered.filter(form => 
          form?.title?.toLowerCase().includes(searchLower) ||
          form?.description?.toLowerCase().includes(searchLower) ||
          form?.department?.toLowerCase().includes(searchLower) ||
          (Array.isArray(form?.tags) && form.tags.some(tag => tag.toLowerCase().includes(searchLower)))
        );
      }

      if (filter.category && filter.category !== 'All Categories') {
        filtered = filtered.filter(form => form?.category === filter.category);
      }

      if (filter.formType && filter.formType !== 'all') {
        filtered = filtered.filter(form => form?.formType === filter.formType);
      }

      if (filter.department && filter.department !== 'All Departments') {
        filtered = filtered.filter(form => form?.department === filter.department);
      }

      if (filter.office && filter.office !== 'All Offices') {
        filtered = filtered.filter(form => form?.office === filter.office);
      }

      if (filter.isActive !== undefined) {
        filtered = filtered.filter(form => form?.isActive === filter.isActive);
      }

      // Apply time filter
      if (filter.timeRange && filter.timeRange !== 'all') {
        const now = new Date();
        const timeRanges = {
          week: 7 * 24 * 60 * 60 * 1000,
          month: 30 * 24 * 60 * 60 * 1000,
          quarter: 90 * 24 * 60 * 60 * 1000,
          year: 365 * 24 * 60 * 60 * 1000
        };
        
        const rangeMs = timeRanges[filter.timeRange];
        if (rangeMs) {
          const cutoffDate = new Date(now.getTime() - rangeMs);
          filtered = filtered.filter(form => form?.lastUpdated && new Date(form.lastUpdated) >= cutoffDate);
        }
      }

      // Apply sorting
      if (filter.sortBy) {
        filtered = filtered.sort((a, b) => {
          if (!a || !b) return 0;
          
          let aValue: any = a[filter.sortBy as keyof FormDocument];
          let bValue: any = b[filter.sortBy as keyof FormDocument];

          if (filter.sortBy === 'name') {
            aValue = a.title || '';
            bValue = b.title || '';
          } else if (filter.sortBy === 'date') {
            aValue = new Date(a.lastUpdated || 0);
            bValue = new Date(b.lastUpdated || 0);
          } else if (filter.sortBy === 'downloads') {
            aValue = a.downloadCount || 0;
            bValue = b.downloadCount || 0;
          }

          if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = (bValue || '').toLowerCase();
          }

          if (filter.sortOrder === 'desc') {
            return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
          } else {
            return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
          }
        });
      }

      return filtered;
    } catch (error) {
      console.error('Error filtering forms:', error);
      return [];
    }
  }, [forms, filter]);

  // Pagination with null checks
  const totalPages = Math.max(1, Math.ceil((filteredForms?.length || 0) / pageSize));
  const paginatedForms = (filteredForms || []).slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // File upload handlers
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-populate title if not already set
      if (!uploadFormData.title) {
        const fileName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
        setUploadFormData(prev => ({ ...prev, title: fileName }));
      }
      toast.success(`File "${file.name}" selected for upload`);
    }
  };

  const handleBatchFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setBatchFiles(files);
      toast.success(`${files.length} files selected for batch upload`);
    }
  };

  // CRUD Operations
  const handleCreate = () => {
    if (!requireAuth('create forms')) return;

    try {
      const form: FormDocument = {
        ...newForm,
        id: `form-${Date.now()}`,
        uploadedBy: 'Current User',
        uploadedDate: new Date().toISOString().split('T')[0],
        createdAt: new Date(),
        updatedAt: new Date(),
        downloadCount: 0,
        requiredBy: Array.isArray(newForm.requiredBy) ? newForm.requiredBy : [],
        relatedForms: Array.isArray(newForm.relatedForms) ? newForm.relatedForms : [],
        tags: Array.isArray(newForm.tags) ? newForm.tags : []
      } as FormDocument;

      setForms([...forms, form]);
      setIsCreateDialogOpen(false);
      setNewForm({
        title: '',
        description: '',
        category: 'Other',
        formType: 'Other',
        version: '1.0',
        department: 'Other',
        office: 'Other',
        purpose: '',
        instructions: '',
        fileName: '',
        fileSize: '',
        isActive: true,
        requiredBy: [],
        relatedForms: [],
        tags: []
      });
      toast.success('Form added to inventory successfully');
    } catch (error) {
      console.error('Error creating form:', error);
      toast.error('Failed to create form');
    }
  };

  // FIXED: Stabilized edit handler with useCallback to prevent flickering
  const handleEdit = useCallback((form: FormDocument) => {
    if (!requireAuth('edit forms')) return;
    if (!form) return;
    
    // Create a stable copy of form data to prevent reference changes
    const stableFormData = {
      title: form.title || '',
      description: form.description || '',
      category: form.category || 'Other',
      formType: form.formType || 'Other',
      version: form.version || '1.0',
      department: form.department || 'Other',
      office: form.office || 'Other',
      purpose: form.purpose || '',
      instructions: form.instructions || '',
      remarks: form.remarks || '',
      fileName: form.fileName || '',
      fileSize: form.fileSize || '',
      isActive: form.isActive !== undefined ? form.isActive : true,
      requiredBy: Array.isArray(form.requiredBy) ? [...form.requiredBy] : [],
      relatedForms: Array.isArray(form.relatedForms) ? [...form.relatedForms] : [],
      tags: Array.isArray(form.tags) ? [...form.tags] : []
    };
    
    // Set states in a single batch to prevent multiple re-renders
    setSelectedForm(form);
    setEditForm(stableFormData);
    setIsEditDialogOpen(true);
  }, [requireAuth]);

  // FIXED: Stabilized update handler with useCallback
  const handleUpdate = useCallback(() => {
    if (!selectedForm) return;

    try {
      const updatedForms = forms.map(form => 
        form.id === selectedForm.id 
          ? { 
              ...editForm, 
              id: selectedForm.id, 
              updatedAt: new Date(),
              uploadedBy: selectedForm.uploadedBy, // Preserve original uploader
              uploadedDate: selectedForm.uploadedDate, // Preserve original upload date
              createdAt: selectedForm.createdAt, // Preserve creation date
              downloadCount: selectedForm.downloadCount, // Preserve download count
              filePath: selectedForm.filePath, // Preserve file path
              requiredBy: Array.isArray(editForm.requiredBy) ? editForm.requiredBy : [],
              relatedForms: Array.isArray(editForm.relatedForms) ? editForm.relatedForms : [],
              tags: Array.isArray(editForm.tags) ? editForm.tags : []
            } as FormDocument
          : form
      );

      // Batch state updates to prevent flickering
      setForms(updatedForms);
      setIsEditDialogOpen(false);
      setSelectedForm(null);
      // Reset edit form to initial state
      setEditForm({
        title: '',
        description: '',
        category: 'Other',
        formType: 'Other',
        version: '1.0',
        department: 'Other',
        office: 'Other',
        purpose: '',
        instructions: '',
        fileName: '',
        fileSize: '',
        isActive: true,
        requiredBy: [],
        relatedForms: [],
        tags: []
      });
      toast.success('Form updated successfully');
    } catch (error) {
      console.error('Error updating form:', error);
      toast.error('Failed to update form');
    }
  }, [selectedForm, editForm, forms]);

  const handleDelete = (form: FormDocument) => {
    if (!requireAuth('delete forms')) return;
    if (!form) return;
    setSelectedForm(form);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedForm) return;

    try {
      const updatedForms = forms.filter(form => form.id !== selectedForm.id);
      setForms(updatedForms);
      setIsDeleteDialogOpen(false);
      setSelectedForm(null);
      toast.success('Form deleted successfully');
    } catch (error) {
      console.error('Error deleting form:', error);
      toast.error('Failed to delete form');
    }
  };

  const handleView = (form: FormDocument) => {
    if (!form) return;
    setSelectedForm(form);
    setIsViewDialogOpen(true);
  };

  const handleDownload = (form: FormDocument) => {
    if (!form) return;
    try {
      // Mock download functionality
      const updatedForms = forms.map(f => 
        f.id === form.id 
          ? { ...f, downloadCount: (f.downloadCount || 0) + 1 }
          : f
      );
      setForms(updatedForms);
      toast.success(`Downloading ${form.title}`);
    } catch (error) {
      console.error('Error downloading form:', error);
      toast.error('Failed to download form');
    }
  };

  const handleUpload = () => {
    if (!requireAuth('upload forms')) return;
    setIsUploadDialogOpen(true);
  };

  const handleBatchUpload = () => {
    if (!requireAuth('batch upload forms')) return;
    setIsBatchUploadDialogOpen(true);
  };

  const processSingleUpload = () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    try {
      const form: FormDocument = {
        id: `upload-${Date.now()}`,
        title: uploadFormData.title,
        description: uploadFormData.purpose || 'Uploaded form',
        category: uploadFormData.category as any,
        formType: uploadFormData.formType as any,
        version: uploadFormData.version,
        lastUpdated: new Date().toISOString().split('T')[0],
        department: uploadFormData.department,
        office: uploadFormData.office,
        purpose: uploadFormData.purpose,
        instructions: uploadFormData.instructions,
        remarks: uploadFormData.remarks,
        filePath: `/forms/${selectedFile.name}`,
        fileName: selectedFile.name,
        fileSize: `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`,
        downloadCount: 0,
        isActive: true,
        requiredBy: [],
        relatedForms: [],
        validityPeriod: uploadFormData.validityPeriod,
        uploadedBy: 'Current User',
        uploadedDate: new Date().toISOString().split('T')[0],
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['Single Upload', uploadFormData.category]
      };

      setForms([...forms, form]);
      setIsUploadDialogOpen(false);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setUploadFormData({
        title: '',
        category: 'Other',
        formType: 'Other',
        department: 'Planning and Development Office',
        office: 'Main Office',
        purpose: '',
        instructions: '',
        remarks: '',
        version: '1.0',
        validityPeriod: '1 Year'
      });
      toast.success(`Form "${form.title}" uploaded successfully with tracking information`);
    } catch (error) {
      console.error('Error uploading form:', error);
      toast.error('Failed to upload form');
    }
  };

  const processBatchUpload = () => {
    if (batchFiles.length === 0) {
      toast.error('Please select files to upload');
      return;
    }

    try {
      // Mock batch upload processing
      const newForms = batchFiles.map((file, index) => ({
        id: `batch-${Date.now()}-${index}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        description: `Batch uploaded form: ${file.name}`,
        category: uploadFormData.category as any,
        formType: uploadFormData.formType as any,
        version: '1.0',
        lastUpdated: new Date().toISOString().split('T')[0],
        department: uploadFormData.department,
        office: uploadFormData.office,
        purpose: 'Batch uploaded document',
        instructions: 'Please review and update form details',
        remarks: uploadFormData.remarks || `Batch uploaded on ${new Date().toLocaleDateString()}`,
        filePath: `/forms/${file.name}`,
        fileName: file.name,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        downloadCount: 0,
        isActive: true,
        requiredBy: [],
        relatedForms: [],
        validityPeriod: uploadFormData.validityPeriod,
        uploadedBy: 'Current User',
        uploadedDate: new Date().toISOString().split('T')[0],
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['Batch Upload', 'Needs Review', uploadFormData.category]
      }));

      setForms([...forms, ...newForms]);
      setBatchFiles([]);
      if (batchFileInputRef.current) {
        batchFileInputRef.current.value = '';
      }
      setIsBatchUploadDialogOpen(false);
      toast.success(`Successfully uploaded ${newForms.length} forms with tracking information`);
    } catch (error) {
      console.error('Error processing batch upload:', error);
      toast.error('Failed to process batch upload');
    }
  };

  // Category management functions
  const handleCreateCategory = () => {
    if (!newCategory.trim()) {
      toast.error('Please enter a category name');
      return;
    }
    
    if (categories.includes(newCategory.trim())) {
      toast.error('Category already exists');
      return;
    }

    const updatedCategories = [...categories, newCategory.trim()];
    setCategories(updatedCategories);
    setNewCategory('');
    toast.success(`Category "${newCategory.trim()}" created successfully`);
  };

  const handleDeleteCategory = (categoryToDelete: string) => {
    if (!requireAuth('delete categories')) return;
    
    const updatedCategories = categories.filter(cat => cat !== categoryToDelete);
    setCategories(updatedCategories);
    
    // Update filter if the deleted category was selected
    if (filter.category === categoryToDelete) {
      setFilter({ ...filter, category: 'All Categories' });
    }
    
    toast.success(`Category "${categoryToDelete}" deleted successfully`);
  };

  // FIXED: Separate Create Form Dialog Component with stable state management
  const CreateFormDialog = () => (
    <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
      if (!open) {
        setIsCreateDialogOpen(false);
        setNewForm({
          title: '',
          description: '',
          category: 'Other',
          formType: 'Other',
          version: '1.0',
          department: 'Other',
          office: 'Other',
          purpose: '',
          instructions: '',
          fileName: '',
          fileSize: '',
          isActive: true,
          requiredBy: [],
          relatedForms: [],
          tags: []
        });
      }
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Form</DialogTitle>
          <DialogDescription>
            Add a new form to the inventory
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="create-title">Title *</Label>
              <Input
                id="create-title"
                value={newForm.title || ''}
                onChange={(e) => setNewForm({ ...newForm, title: e.target.value })}
                placeholder="Form title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-version">Version</Label>
              <Input
                id="create-version"
                value={newForm.version || ''}
                onChange={(e) => setNewForm({ ...newForm, version: e.target.value })}
                placeholder="1.0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-description">Description *</Label>
            <Textarea
              id="create-description"
              value={newForm.description || ''}
              onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
              placeholder="Brief description of the form"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="create-category">Category</Label>
              <div className="space-y-2">
                <Input
                  id="create-category"
                  value={newForm.category || ''}
                  onChange={(e) => setNewForm({ ...newForm, category: e.target.value })}
                  placeholder="Enter category name..."
                  list="create-categories-list"
                />
                <datalist id="create-categories-list">
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </datalist>
                <div className="flex flex-wrap gap-1">
                  {categories.slice(0, 5).map((category) => (
                    <Button
                      key={category}
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={() => setNewForm({ ...newForm, category: category })}
                      className="text-xs h-6 px-2"
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-formType">Form Type</Label>
              <Input
                id="create-formType"
                value={newForm.formType || ''}
                onChange={(e) => setNewForm({ ...newForm, formType: e.target.value })}
                placeholder="Enter form type..."
                list="create-formtypes-list"
              />
              <datalist id="create-formtypes-list">
                {safeLegacyFormTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </datalist>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="create-department">Department</Label>
              <Input
                id="create-department"
                value={newForm.department || ''}
                onChange={(e) => setNewForm({ ...newForm, department: e.target.value })}
                placeholder="Enter department name..."
                list="create-departments-list"
              />
              <datalist id="create-departments-list">
                {safeDepartments.filter(dept => dept !== 'All Departments').map((department) => (
                  <option key={department} value={department}>{department}</option>
                ))}
              </datalist>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-office">Office</Label>
              <Input
                id="create-office"
                value={newForm.office || ''}
                onChange={(e) => setNewForm({ ...newForm, office: e.target.value })}
                placeholder="Enter office name..."
                list="create-offices-list"
              />
              <datalist id="create-offices-list">
                {safeOffices.filter(office => office !== 'All Offices').map((office) => (
                  <option key={office} value={office}>{office}</option>
                ))}
              </datalist>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-purpose">Purpose</Label>
            <Textarea
              id="create-purpose"
              value={newForm.purpose || ''}
              onChange={(e) => setNewForm({ ...newForm, purpose: e.target.value })}
              placeholder="Purpose and use of this form"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-instructions">Instructions</Label>
            <Textarea
              id="create-instructions"
              value={newForm.instructions || ''}
              onChange={(e) => setNewForm({ ...newForm, instructions: e.target.value })}
              placeholder="Instructions for completing this form"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-remarks">Remarks/Comments</Label>
            <Textarea
              id="create-remarks"
              value={newForm.remarks || ''}
              onChange={(e) => setNewForm({ ...newForm, remarks: e.target.value })}
              placeholder="Additional remarks or comments about this form"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="create-fileName">File Name</Label>
              <Input
                id="create-fileName"
                value={newForm.fileName || ''}
                onChange={(e) => setNewForm({ ...newForm, fileName: e.target.value })}
                placeholder="document.pdf"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-fileSize">File Size</Label>
              <Input
                id="create-fileSize"
                value={newForm.fileSize || ''}
                onChange={(e) => setNewForm({ ...newForm, fileSize: e.target.value })}
                placeholder="2.1 MB"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="create-isActive"
              checked={newForm.isActive || false}
              onCheckedChange={(checked) => setNewForm({ ...newForm, isActive: checked })}
            />
            <Label htmlFor="create-isActive">Active</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate}>Create Form</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // FIXED: Stable edit form change handlers to prevent unnecessary re-renders
  const handleEditFormChange = useCallback((field: string, value: any) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  }, []);

  // FIXED: Stable dialog close handler to prevent flickering
  const handleEditDialogClose = useCallback(() => {
    setIsEditDialogOpen(false);
    setSelectedForm(null);
    setEditForm({
      title: '',
      description: '',
      category: 'Other',
      formType: 'Other',
      version: '1.0',
      department: 'Other',
      office: 'Other',
      purpose: '',
      instructions: '',
      fileName: '',
      fileSize: '',
      isActive: true,
      requiredBy: [],
      relatedForms: [],
      tags: []
    });
  }, []);

  // FIXED: Memoized Edit Form Dialog Component with stable state management
  const EditFormDialog = React.memo(() => {
    // Additional stability - memoize the dialog open state and form data
    const isDialogOpen = isEditDialogOpen;
    const formData = editForm;
    
    return (
    <Dialog open={isDialogOpen} onOpenChange={(open) => {
      if (!open) {
        handleEditDialogClose();
      }
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Form</DialogTitle>
          <DialogDescription>
            Update form information
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={formData.title || ''}
                onChange={(e) => handleEditFormChange('title', e.target.value)}
                placeholder="Form title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-version">Version</Label>
              <Input
                id="edit-version"
                value={formData.version || ''}
                onChange={(e) => handleEditFormChange('version', e.target.value)}
                placeholder="1.0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description *</Label>
            <Textarea
              id="edit-description"
              value={formData.description || ''}
              onChange={(e) => handleEditFormChange('description', e.target.value)}
              placeholder="Brief description of the form"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <div className="space-y-2">
                <Input
                  id="edit-category"
                  value={formData.category || ''}
                  onChange={(e) => handleEditFormChange('category', e.target.value)}
                  placeholder="Enter category name..."
                  list="edit-categories-list"
                />
                <datalist id="edit-categories-list">
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </datalist>
                <div className="flex flex-wrap gap-1">
                  {categories.slice(0, 5).map((category) => (
                    <Button
                      key={category}
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={() => handleEditFormChange('category', category)}
                      className="text-xs h-6 px-2"
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-formType">Form Type</Label>
              <Input
                id="edit-formType"
                value={formData.formType || ''}
                onChange={(e) => handleEditFormChange('formType', e.target.value)}
                placeholder="Enter form type..."
                list="edit-formtypes-list"
              />
              <datalist id="edit-formtypes-list">
                {safeLegacyFormTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </datalist>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-department">Department</Label>
              <Input
                id="edit-department"
                value={formData.department || ''}
                onChange={(e) => handleEditFormChange('department', e.target.value)}
                placeholder="Enter department name..."
                list="edit-departments-list"
              />
              <datalist id="edit-departments-list">
                {safeDepartments.filter(dept => dept !== 'All Departments').map((department) => (
                  <option key={department} value={department}>{department}</option>
                ))}
              </datalist>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-office">Office</Label>
              <Input
                id="edit-office"
                value={formData.office || ''}
                onChange={(e) => handleEditFormChange('office', e.target.value)}
                placeholder="Enter office name..."
                list="edit-offices-list"
              />
              <datalist id="edit-offices-list">
                {safeOffices.filter(office => office !== 'All Offices').map((office) => (
                  <option key={office} value={office}>{office}</option>
                ))}
              </datalist>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-purpose">Purpose</Label>
            <Textarea
              id="edit-purpose"
              value={formData.purpose || ''}
              onChange={(e) => handleEditFormChange('purpose', e.target.value)}
              placeholder="Purpose and use of this form"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-instructions">Instructions</Label>
            <Textarea
              id="edit-instructions"
              value={formData.instructions || ''}
              onChange={(e) => handleEditFormChange('instructions', e.target.value)}
              placeholder="Instructions for completing this form"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-remarks">Remarks/Comments</Label>
            <Textarea
              id="edit-remarks"
              value={formData.remarks || ''}
              onChange={(e) => handleEditFormChange('remarks', e.target.value)}
              placeholder="Additional remarks or comments about this form"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-fileName">File Name</Label>
              <Input
                id="edit-fileName"
                value={formData.fileName || ''}
                onChange={(e) => handleEditFormChange('fileName', e.target.value)}
                placeholder="document.pdf"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-fileSize">File Size</Label>
              <Input
                id="edit-fileSize"
                value={formData.fileSize || ''}
                onChange={(e) => handleEditFormChange('fileSize', e.target.value)}
                placeholder="2.1 MB"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="edit-isActive"
              checked={formData.isActive || false}
              onCheckedChange={(checked) => handleEditFormChange('isActive', checked)}
            />
            <Label htmlFor="edit-isActive">Active</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleEditDialogClose}>Cancel</Button>
          <Button onClick={handleUpdate}>Update Form</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    );
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl shadow-sm">
                <FileCheck className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Forms Inventory</h1>
                <p className="text-slate-600 mt-1">Manage and organize downloadable forms with comprehensive tracking and CRUD functionality</p>
                <div className="flex items-center gap-6 mt-3 text-sm text-slate-500">
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4 text-green-600" />
                    <span>{filteredForms.length} forms available</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FolderOpen className="w-4 h-4 text-purple-600" />
                    <span>{new Set(filteredForms.map(f => f.category)).size} categories</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Building2 className="w-4 h-4 text-orange-600" />
                    <span>{new Set(filteredForms.map(f => f.department)).size} departments</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <FileText className="w-4 h-4 mr-2" />
                Create Form Entry
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        
        {/* Instructions Section - Collapsible */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <HelpCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg text-blue-900">How to Use Forms Inventory</CardTitle>
                  <CardDescription className="text-blue-700">
                    Learn how to download, store, upload, and manage forms effectively
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowInstructions(!showInstructions)}
                className="text-blue-600 hover:text-blue-800"
              >
                {showInstructions ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </div>
          </CardHeader>
          
          {showInstructions && (
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Download className="w-4 h-4 text-green-600" />
                    <h4 className="font-medium text-slate-900">Download Forms</h4>
                  </div>
                  <p className="text-sm text-slate-600">
                    Click on any form's download button to get the latest version. Track download counts automatically.
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Upload className="w-4 h-4 text-blue-600" />
                    <h4 className="font-medium text-slate-900">Upload & Track</h4>
                  </div>
                  <p className="text-sm text-slate-600">
                    Upload single or multiple forms with automatic tracking by department, form type, and timestamp.
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <FileCheck className="w-4 h-4 text-purple-600" />
                    <h4 className="font-medium text-slate-900">Organize & Store</h4>
                  </div>
                  <p className="text-sm text-slate-600">
                    Use filters to organize forms by category, department, or office. Add remarks and comments for better tracking.
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Edit className="w-4 h-4 text-orange-600" />
                    <h4 className="font-medium text-slate-900">Manage Forms</h4>
                  </div>
                  <p className="text-sm text-slate-600">
                    Create, edit, view, or delete forms with full CRUD operations. Set active/inactive status as needed.
                  </p>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Enhanced Filters, Title and Controls */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Title & Details</CardTitle>
                <CardDescription>Filter forms by various criteria, add title information, and manage uploads efficiently</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title Section and Remarks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg border">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Title Section
                </Label>
                <Input
                  placeholder="Enter title or search criteria..."
                  value={titleSearch}
                  onChange={(e) => setTitleSearch(e.target.value)}
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Edit className="w-4 h-4 text-green-600" />
                  Remarks/Comments
                </Label>
                <Textarea
                  placeholder="Add remarks or comments for tracking..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={2}
                  className="bg-white resize-none"
                />
              </div>
            </div>

            {/* Collapsible Filters Section */}
            {showFilters && (
              <div className="space-y-4 border border-slate-200 rounded-lg p-4 bg-slate-50">
                <div className="flex items-center gap-2 mb-3">
                  <Filter className="w-4 h-4 text-blue-600" />
                  <h4 className="font-medium text-slate-900">Advanced Filters</h4>
                </div>

                {/* Filter Row 1 - Enhanced with Office */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Search Forms</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search forms..."
                        value={filter.search || ''}
                        onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                        className="pl-9 bg-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select 
                      value={filter.category} 
                      onValueChange={(value) => setFilter({ ...filter, category: value })}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {safeFormCategories.map((category) => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Select 
                      value={filter.department} 
                      onValueChange={(value) => setFilter({ ...filter, department: value })}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {safeDepartments.map((department) => (
                          <SelectItem key={department} value={department}>{department}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Office</Label>
                    <Select 
                      value={filter.office} 
                      onValueChange={(value) => setFilter({ ...filter, office: value })}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {safeOffices.map((office) => (
                          <SelectItem key={office} value={office}>{office}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Filter Row 2 - Time, Sort, and Status */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Form Type</Label>
                    <Select 
                      value={filter.formType} 
                      onValueChange={(value) => setFilter({ ...filter, formType: value })}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {safeLegacyFormTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Time Range</Label>
                    <Select 
                      value={filter.timeRange} 
                      onValueChange={(value) => setFilter({ ...filter, timeRange: value as any })}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="week">Last Week</SelectItem>
                        <SelectItem value="month">Last Month</SelectItem>
                        <SelectItem value="quarter">Last Quarter</SelectItem>
                        <SelectItem value="year">Last Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Sort By</Label>
                    <Select 
                      value={filter.sortBy} 
                      onValueChange={(value) => setFilter({ ...filter, sortBy: value as any })}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="date">Date Updated</SelectItem>
                        <SelectItem value="downloads">Downloads</SelectItem>
                        <SelectItem value="department">Department</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Sort Order</Label>
                    <Select 
                      value={filter.sortOrder} 
                      onValueChange={(value) => setFilter({ ...filter, sortOrder: value as any })}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">
                          <div className="flex items-center">
                            <SortAsc className="w-4 h-4 mr-2" />
                            Ascending
                          </div>
                        </SelectItem>
                        <SelectItem value="desc">
                          <div className="flex items-center">
                            <SortDesc className="w-4 h-4 mr-2" />
                            Descending
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Category Management Section */}
                <div className="border-t border-slate-200 pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Plus className="w-4 h-4 text-green-600" />
                    <h5 className="font-medium text-slate-900">Category Management</h5>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {categories.map((category) => (
                      <div key={category} className="flex items-center gap-1 bg-white rounded-lg px-2 py-1 border">
                        <span className="text-sm">{category}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCategory(category)}
                          className="h-4 w-4 p-0 text-red-500 hover:text-red-700"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="New category name..."
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="bg-white"
                    />
                    <Button onClick={handleCreateCategory} size="sm">
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>

                {/* Clear Filters Button */}
                <div className="flex justify-end pt-3 border-t border-slate-200">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFilter({
                        search: '',
                        category: 'All Categories',
                        formType: 'all',
                        department: 'All Departments',
                        office: 'All Offices',
                        timeRange: 'all',
                        sortBy: 'name',
                        sortOrder: 'asc',
                        isActive: undefined
                      });
                      setTitleSearch('');
                      setRemarks('');
                    }}
                  >
                    Clear All Filters
                  </Button>
                </div>
              </div>
            )}

            {/* View Type Selector */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700">View:</span>
                {VIEW_TYPES.map((viewTypeOption) => (
                  <Button
                    key={viewTypeOption.value}
                    variant={viewType === viewTypeOption.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewType(viewTypeOption.value)}
                    className="flex items-center gap-1"
                  >
                    <viewTypeOption.icon className="w-4 h-4" />
                    {viewTypeOption.label}
                  </Button>
                ))}
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                Showing {filteredForms.length} of {forms.length} forms
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table Actions Header */}
        <Card className="bg-slate-50 border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Forms Management</h3>
                  <p className="text-sm text-slate-600">Upload, organize, and manage your forms inventory</p>
                </div>
              </div>
              
              {/* Upload Actions - Prominently positioned above table */}
              <div className="flex items-center gap-3">
                <Button 
                  onClick={handleUpload} 
                  variant="outline" 
                  size="sm"
                  className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Single Upload
                </Button>
                <Button 
                  onClick={handleBatchUpload} 
                  variant="outline" 
                  size="sm"
                  className="border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Batch Upload
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Forms Display */}
        <Card className="shadow-sm border-slate-200 bg-white">
          <CardContent className="p-0">
            {viewType === 'table' && (
              <div className="overflow-x-auto">
                <Table className="table-fixed">
                  <TableHeader className="bg-slate-50 border-b-2 border-slate-200">
                    <TableRow className="hover:bg-slate-50">
                      <TableHead className="w-[30%] font-semibold text-slate-800 px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          Form Details
                        </div>
                      </TableHead>
                      <TableHead className="w-[15%] font-semibold text-slate-800 px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Badge className="w-4 h-4 text-purple-600" />
                          Category & Type
                        </div>
                      </TableHead>
                      <TableHead className="w-[18%] font-semibold text-slate-800 px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-orange-600" />
                          Department & Office
                        </div>
                      </TableHead>
                      <TableHead className="w-[12%] font-semibold text-slate-800 px-4 py-4">
                        <div className="flex items-center gap-2">
                          <FolderOpen className="w-4 h-4 text-green-600" />
                          File Info
                        </div>
                      </TableHead>
                      <TableHead className="w-[15%] font-semibold text-slate-800 px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-red-600" />
                          Status & Downloads
                        </div>
                      </TableHead>
                      <TableHead className="w-[10%] font-semibold text-slate-800 px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Settings className="w-4 h-4 text-slate-600" />
                          Actions
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(paginatedForms || []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12">
                          <div className="flex flex-col items-center gap-3">
                            <div className="p-3 bg-slate-100 rounded-full">
                              <FileText className="w-8 h-8 text-slate-400" />
                            </div>
                            <div>
                              <p className="text-slate-600 font-medium">No forms found</p>
                              <p className="text-sm text-slate-500 mt-1">
                                {forms.length === 0 
                                  ? "Upload your first form to get started" 
                                  : "Try adjusting your filters to see more results"
                                }
                              </p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      (paginatedForms || []).map((form, index) => (
                      <TableRow 
                        key={form.id} 
                        className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                          index % 2 === 0 ? 'bg-white' : 'bg-slate-25'
                        }`}
                      >
                        <TableCell className="px-6 py-4 align-top">
                          <div className="space-y-2">
                            <div className="font-semibold text-slate-900 leading-tight">{form.title}</div>
                            <div className="text-sm text-slate-600 leading-relaxed line-clamp-2">{form.description}</div>
                            <div className="flex items-center gap-3 text-xs text-slate-500">
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                                v{form.version}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Updated {form.lastUpdated}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-4 align-top">
                          <div className="space-y-2">
                            <Badge 
                              variant="outline" 
                              className="bg-purple-50 border-purple-200 text-purple-800 font-medium"
                            >
                              {form.category}
                            </Badge>
                            <div className="text-sm text-slate-600 font-medium">{form.formType}</div>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-4 align-top">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Building2 className="w-3 h-3 text-orange-600 flex-shrink-0" />
                              <span className="font-medium text-slate-800 truncate">{form.department}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <FolderOpen className="w-3 h-3 text-green-600 flex-shrink-0" />
                              <span className="truncate">{form.office}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-4 align-top">
                          <div className="space-y-2">
                            <div className="text-sm font-medium text-slate-800 truncate">{form.fileName}</div>
                            <div className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md inline-block">
                              {form.fileSize}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-4 align-top">
                          <div className="space-y-2">
                            <Badge 
                              variant={form.isActive ? "default" : "secondary"} 
                              className={`font-medium ${
                                form.isActive 
                                  ? 'bg-green-100 text-green-800 border-green-200' 
                                  : 'bg-gray-100 text-gray-800 border-gray-200'
                              }`}
                            >
                              {form.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            <div className="flex items-center gap-1 text-xs text-slate-600 bg-blue-50 px-2 py-1 rounded-md">
                              <Download className="w-3 h-3 text-blue-600" />
                              <span className="font-medium">{form.downloadCount} downloads</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-4 align-top">
                          <div className="flex items-center justify-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleView(form)}
                              className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-700"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleEdit(form)}
                              className="h-8 w-8 p-0 hover:bg-orange-100 hover:text-orange-700"
                              title="Edit Form"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDownload(form)} 
                              className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-700"
                              title="Download Form"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDelete(form)} 
                              className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-700"
                              title="Delete Form"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )))}
                  </TableBody>
                </Table>
              </div>
            )}

            {viewType === 'list' && (
              <div className="p-6 space-y-4">
                {(paginatedForms || []).map((form) => (
                  <div key={form.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow bg-white">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-slate-900 line-clamp-1">{form.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{form.description}</p>
                        </div>
                        <Badge variant={form.isActive ? "default" : "secondary"} className="text-xs ml-2 flex-shrink-0">
                          {form.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="text-xs">{form.category}</Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          <span>{form.department}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FolderOpen className="w-3 h-3" />
                          <span>{form.office}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          <span>{form.downloadCount} downloads</span>
                        </div>
                        <div>v{form.version}</div>
                        <div>Updated {form.lastUpdated}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 ml-4">
                      <Button variant="ghost" size="sm" onClick={() => handleView(form)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(form)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDownload(form)} className="text-blue-600 hover:text-blue-800">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(form)} className="text-red-600 hover:text-red-800">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {viewType === 'card' && (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(paginatedForms || []).map((form) => (
                  <Card key={form.id} className="hover:shadow-md transition-shadow h-full flex flex-col">
                    <CardHeader className="pb-3 flex-shrink-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg leading-tight line-clamp-2 mb-2">
                            {form.title}
                          </CardTitle>
                          <CardDescription className="text-sm line-clamp-3">
                            {form.description}
                          </CardDescription>
                        </div>
                        <Badge variant={form.isActive ? "default" : "secondary"} className="text-xs flex-shrink-0">
                          {form.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0 flex-1 flex flex-col justify-between">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant="outline" className="text-xs">{form.category}</Badge>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-muted-foreground text-xs">{form.formType}</span>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              <span className="truncate">{form.department}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FolderOpen className="w-3 h-3" />
                              <span className="truncate">{form.office}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Size: {form.fileSize}</span>
                            <span>v{form.version}</span>
                          </div>
                          
                          <div className="text-xs text-muted-foreground">
                            Updated: {form.lastUpdated}
                          </div>
                        </div>
                        
                        {/* File Details Section */}
                        <div className="bg-slate-50 rounded-lg p-2">
                          <div className="text-xs font-medium text-slate-700 mb-1">File Details</div>
                          <div className="text-xs text-slate-600">
                            <div>Name: {form.fileName}</div>
                            <div>Version: {form.version}</div>
                            {form.remarks && (
                              <div className="mt-1 text-slate-500">
                                Remarks: {form.remarks.length > 50 ? `${form.remarks.substring(0, 50)}...` : form.remarks}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleView(form)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(form)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(form)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <Button size="sm" onClick={() => handleDownload(form)} className="bg-blue-600 hover:bg-blue-700">
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredForms.length)} of {filteredForms.length} forms
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => 
                        page === 1 || 
                        page === totalPages || 
                        Math.abs(page - currentPage) <= 1
                      )
                      .map((page, index, array) => (
                        <React.Fragment key={page}>
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="px-2 text-muted-foreground">...</span>
                          )}
                          <Button
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="w-8 h-8 p-0"
                          >
                            {page}
                          </Button>
                        </React.Fragment>
                      ))
                    }
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* FIXED: Separate Dialog Components */}
      <CreateFormDialog />
      <EditFormDialog />

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedForm?.title}</DialogTitle>
            <DialogDescription>Form details and information</DialogDescription>
          </DialogHeader>
          
          {selectedForm && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Category</Label>
                  <p className="text-sm">{selectedForm.category}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Form Type</Label>
                  <p className="text-sm">{selectedForm.formType}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                <p className="text-sm">{selectedForm.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Department</Label>
                  <p className="text-sm">{selectedForm.department}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Office</Label>
                  <p className="text-sm">{selectedForm.office}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Purpose</Label>
                <p className="text-sm">{selectedForm.purpose}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Instructions</Label>
                <p className="text-sm">{selectedForm.instructions}</p>
              </div>

              {selectedForm.remarks && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Remarks/Comments</Label>
                  <p className="text-sm">{selectedForm.remarks}</p>
                </div>
              )}
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">File Size</Label>
                  <p className="text-sm">{selectedForm.fileSize}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Downloads</Label>
                  <p className="text-sm">{selectedForm.downloadCount}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <Badge variant={selectedForm.isActive ? "default" : "secondary"}>
                    {selectedForm.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
              
              {Array.isArray(selectedForm.tags) && selectedForm.tags.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Tags</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedForm.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={() => selectedForm && handleDownload(selectedForm)}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the form
              "{selectedForm?.title}" from the inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* FIXED: Enhanced Single Upload Dialog with Input Field for Form Type */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-600" />
              Upload Single Form with Tracking
            </DialogTitle>
            <DialogDescription>
              Upload a single form file with comprehensive tracking information including form type, department, office, and timestamp
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* File Upload Section */}
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-2">
                {selectedFile ? `Selected: ${selectedFile.name}` : 'Drag and drop your file here, or click to select'}
              </p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                className="hidden"
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                {selectedFile ? 'Change File' : 'Select File'}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Supported: PDF, DOC, DOCX, XLS, XLSX • Max size: 10MB
              </p>
            </div>

            {/* Form Tracking Information */}
            <div className="space-y-4 border border-slate-200 rounded-lg p-4 bg-slate-50">
              <div className="flex items-center gap-2 mb-3">
                <FileCheck className="w-4 h-4 text-green-600" />
                <h4 className="font-medium">Form Tracking Information</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="upload-title">Title *</Label>
                  <Input
                    id="upload-title"
                    value={uploadFormData.title}
                    onChange={(e) => setUploadFormData({ ...uploadFormData, title: e.target.value })}
                    placeholder="Enter form title..."
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="upload-version">Version</Label>
                  <Input
                    id="upload-version"
                    value={uploadFormData.version}
                    onChange={(e) => setUploadFormData({ ...uploadFormData, version: e.target.value })}
                    placeholder="1.0"
                    className="bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="upload-category">Category *</Label>
                  <div className="space-y-2">
                    <Input
                      id="upload-category"
                      value={uploadFormData.category}
                      onChange={(e) => setUploadFormData({ ...uploadFormData, category: e.target.value })}
                      placeholder="Enter category name..."
                      className="bg-white"
                      list="upload-categories-list"
                    />
                    <datalist id="upload-categories-list">
                      {categories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </datalist>
                    <div className="flex flex-wrap gap-1">
                      {categories.slice(0, 4).map((category) => (
                        <Button
                          key={category}
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={() => setUploadFormData({ ...uploadFormData, category: category })}
                          className="text-xs h-6 px-2"
                        >
                          {category}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="upload-formtype">Form Type *</Label>
                  <Input
                    id="upload-formtype"
                    value={uploadFormData.formType}
                    onChange={(e) => setUploadFormData({ ...uploadFormData, formType: e.target.value })}
                    placeholder="Enter form type..."
                    className="bg-white"
                    list="upload-formtypes-list"
                  />
                  <datalist id="upload-formtypes-list">
                    {safeLegacyFormTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="upload-department">Department *</Label>
                  <Input
                    id="upload-department"
                    value={uploadFormData.department}
                    onChange={(e) => setUploadFormData({ ...uploadFormData, department: e.target.value })}
                    placeholder="Enter department name..."
                    className="bg-white"
                    list="upload-departments-list"
                  />
                  <datalist id="upload-departments-list">
                    {safeDepartments.filter(dept => dept !== 'All Departments').map((department) => (
                      <option key={department} value={department}>{department}</option>
                    ))}
                  </datalist>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="upload-office">Office *</Label>
                  <Input
                    id="upload-office"
                    value={uploadFormData.office}
                    onChange={(e) => setUploadFormData({ ...uploadFormData, office: e.target.value })}
                    placeholder="Enter office name..."
                    className="bg-white"
                    list="upload-offices-list"
                  />
                  <datalist id="upload-offices-list">
                    {safeOffices.filter(office => office !== 'All Offices').map((office) => (
                      <option key={office} value={office}>{office}</option>
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="upload-purpose">Purpose</Label>
                <Textarea
                  id="upload-purpose"
                  value={uploadFormData.purpose}
                  onChange={(e) => setUploadFormData({ ...uploadFormData, purpose: e.target.value })}
                  placeholder="Describe the purpose of this form..."
                  rows={2}
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="upload-instructions">Instructions</Label>
                <Textarea
                  id="upload-instructions"
                  value={uploadFormData.instructions}
                  onChange={(e) => setUploadFormData({ ...uploadFormData, instructions: e.target.value })}
                  placeholder="Instructions for completing this form..."
                  rows={2}
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="upload-remarks">Remarks/Comments</Label>
                <Textarea
                  id="upload-remarks"
                  value={uploadFormData.remarks}
                  onChange={(e) => setUploadFormData({ ...uploadFormData, remarks: e.target.value })}
                  placeholder="Additional remarks or comments..."
                  rows={2}
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="upload-validity">Validity Period</Label>
                <Select 
                  value={uploadFormData.validityPeriod} 
                  onValueChange={(value) => setUploadFormData({ ...uploadFormData, validityPeriod: value })}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6 Months">6 Months</SelectItem>
                    <SelectItem value="1 Year">1 Year</SelectItem>
                    <SelectItem value="2 Years">2 Years</SelectItem>
                    <SelectItem value="3 Years">3 Years</SelectItem>
                    <SelectItem value="5 Years">5 Years</SelectItem>
                    <SelectItem value="Indefinite">Indefinite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tracking Information Preview */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <h5 className="font-medium text-blue-900">Upload Tracking</h5>
              </div>
              <div className="text-sm text-blue-800 space-y-1">
                <div>• Upload timestamp: {new Date().toLocaleString()}</div>
                <div>• Department: {uploadFormData.department}</div>
                <div>• Office: {uploadFormData.office}</div>
                <div>• Form type: {uploadFormData.formType}</div>
                <div>• Category: {uploadFormData.category}</div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsUploadDialogOpen(false);
              setSelectedFile(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
              setUploadFormData({
                title: '',
                category: 'Other',
                formType: 'Other',
                department: 'Planning and Development Office',
                office: 'Main Office',
                purpose: '',
                instructions: '',
                remarks: '',
                version: '1.0',
                validityPeriod: '1 Year'
              });
            }}>
              Cancel
            </Button>
            <Button 
              onClick={processSingleUpload}
              disabled={!selectedFile || !uploadFormData.title || !uploadFormData.category || !uploadFormData.department}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload with Tracking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* FIXED: Enhanced Batch Upload Dialog with Input Field for Form Type */}
      <Dialog open={isBatchUploadDialogOpen} onOpenChange={setIsBatchUploadDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-green-600" />
              Batch Upload Forms with Comprehensive Tracking
            </DialogTitle>
            <DialogDescription>
              Upload multiple forms at once with automatic tracking by form type, department, office, and timestamp. Each file can be individually configured.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* File Selection */}
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-2">
                {batchFiles.length > 0 ? `Selected: ${batchFiles.length} files` : 'Drag and drop multiple files here, or click to select'}
              </p>
              <input
                type="file"
                ref={batchFileInputRef}
                onChange={handleBatchFileSelect}
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                multiple
                className="hidden"
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => batchFileInputRef.current?.click()}
              >
                {batchFiles.length > 0 ? 'Change Files' : 'Select Files'}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Supported: PDF, DOC, DOCX, XLS, XLSX • Max size: 10MB each
              </p>
            </div>

            {/* Selected Files List */}
            {batchFiles.length > 0 && (
              <div className="border border-slate-200 rounded-lg p-4">
                <h4 className="font-medium mb-3">Selected Files ({batchFiles.length})</h4>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {batchFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between text-sm bg-slate-50 p-2 rounded">
                      <span>{file.name}</span>
                      <span className="text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(1)} MB</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Default Settings for Batch Upload */}
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-4 h-4 text-blue-600" />
                <h4 className="font-medium">Default Settings for All Files</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Default Department</Label>
                  <Input
                    value={uploadFormData.department}
                    onChange={(e) => setUploadFormData({ ...uploadFormData, department: e.target.value })}
                    placeholder="Enter department name..."
                    className="bg-white"
                    list="batch-departments-list"
                  />
                  <datalist id="batch-departments-list">
                    {safeDepartments.filter(dept => dept !== 'All Departments').map((department) => (
                      <option key={department} value={department}>{department}</option>
                    ))}
                  </datalist>
                </div>
                <div className="space-y-2">
                  <Label>Default Office</Label>
                  <Input
                    value={uploadFormData.office}
                    onChange={(e) => setUploadFormData({ ...uploadFormData, office: e.target.value })}
                    placeholder="Enter office name..."
                    className="bg-white"
                    list="batch-offices-list"
                  />
                  <datalist id="batch-offices-list">
                    {safeOffices.filter(office => office !== 'All Offices').map((office) => (
                      <option key={office} value={office}>{office}</option>
                    ))}
                  </datalist>
                </div>
                <div className="space-y-2">
                  <Label>Default Category</Label>
                  <Input
                    value={uploadFormData.category}
                    onChange={(e) => setUploadFormData({ ...uploadFormData, category: e.target.value })}
                    placeholder="Enter category name..."
                    className="bg-white"
                    list="batch-categories-list"
                  />
                  <datalist id="batch-categories-list">
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="space-y-2">
                  <Label>Default Form Type</Label>
                  <Input
                    value={uploadFormData.formType}
                    onChange={(e) => setUploadFormData({ ...uploadFormData, formType: e.target.value })}
                    placeholder="Enter form type..."
                    className="bg-white"
                    list="batch-formtypes-list"
                  />
                  <datalist id="batch-formtypes-list">
                    {safeLegacyFormTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </datalist>
                </div>
                <div className="space-y-2">
                  <Label>Default Validity Period</Label>
                  <Select 
                    value={uploadFormData.validityPeriod} 
                    onValueChange={(value) => setUploadFormData({ ...uploadFormData, validityPeriod: value })}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6 Months">6 Months</SelectItem>
                      <SelectItem value="1 Year">1 Year</SelectItem>
                      <SelectItem value="2 Years">2 Years</SelectItem>
                      <SelectItem value="3 Years">3 Years</SelectItem>
                      <SelectItem value="5 Years">5 Years</SelectItem>
                      <SelectItem value="Indefinite">Indefinite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="batch-remarks">Default Remarks</Label>
                  <Textarea
                    id="batch-remarks"
                    value={uploadFormData.remarks}
                    onChange={(e) => setUploadFormData({ ...uploadFormData, remarks: e.target.value })}
                    placeholder="Default remarks for all files..."
                    rows={2}
                    className="bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Batch Upload Preview */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-green-600" />
                <h5 className="font-medium text-green-900">Batch Upload Summary</h5>
              </div>
              <div className="text-sm text-green-800 space-y-1">
                <div>• Files to upload: {batchFiles.length}</div>
                <div>• Default department: {uploadFormData.department}</div>
                <div>• Default office: {uploadFormData.office}</div>
                <div>• Default category: {uploadFormData.category}</div>
                <div>• Default form type: {uploadFormData.formType}</div>
                <div>• Upload timestamp: {new Date().toLocaleString()}</div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsBatchUploadDialogOpen(false);
              setBatchFiles([]);
              if (batchFileInputRef.current) {
                batchFileInputRef.current.value = '';
              }
            }}>
              Cancel
            </Button>
            <Button 
              onClick={processBatchUpload}
              disabled={batchFiles.length === 0 || !uploadFormData.department || !uploadFormData.office}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload {batchFiles.length} Files
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}