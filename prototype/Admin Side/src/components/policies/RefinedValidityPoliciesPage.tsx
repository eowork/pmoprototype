/**
 * Refined Policies Management - MOA/MOU Page
 * 
 * RBAC Implementation:
 * - Admin: Full CRUD, all pages, assign personnel, grant page permissions
 * - Director: Full CRUD on policies, restricted pages (grantable by Admin), assign personnel
 * - Staff/Editor: View and Add only (no edit/delete)
 * - Assigned Personnel: View assigned documents only
 * 
 * Features:
 * - Column visibility (12 columns, 5 visible by default - NO horizontal scroll)
 * - Personnel assignment for MOA/MOU
 * - Page permission management for Directors
 * - Advanced filtering and search
 * - Consolidated actions dropdown (like COI)
 * - Formal, minimal, aesthetic design
 * 
 * Test Accounts:
 * - Admin: admin@carsu.edu.ph / admin123
 * - Director: director@carsu.edu.ph / director123  
 * - Staff: sofia.villanueva@carsu.edu.ph / staff123
 * - Editor: angela.martinez@carsu.edu.ph / staff123
 * - Assigned Personnel: personnel@carsu.edu.ph / personnel123
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { 
  FileText, FileSignature, Search, Calendar, AlertTriangle, 
  CheckCircle, TrendingUp, Users, Eye, Download, RotateCcw, 
  Plus, Edit2, Trash2, X, Columns, MoreHorizontal, 
  UserCheck, Tags, Filter, Shield, Settings, Lock, FileCheck, Building
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { enhancedPoliciesRBACService, PolicyPermissions } from './services/EnhancedRBACService';
import { PersonnelAssignmentManager } from './admin/PersonnelAssignmentManager';
import { DirectorPagePermissionManager } from './admin/DirectorPagePermissionManager';
import { AddPolicyDocumentDialog, EditPolicyDocumentDialog, PolicyDocument } from './dialogs/PolicyDocumentDialogs';

interface RefinedValidityPoliciesPageProps {
  category: string;
  userRole: string;
  userEmail: string;
  requireAuth: (action: string) => boolean;
  onProjectSelect?: (project: any) => void;
  filterData?: any;
  onClearFilters?: () => void;
}

interface PolicyAgreement {
  id: string;
  date: string;
  memoNo: string;
  forEntity: string;
  subject: string;
  documentType: string;
  preparedBy: string;
  status: 'Draft' | 'Under Review' | 'Approved' | 'Active' | 'Expired' | 'Pending Signature';
  attachedDocuments: {
    hasSignedCopy: boolean;
    hasDPCRAttachment: boolean;
    hasIPCRAttachment: boolean;
    attachmentCount: number;
  };
  tags: string[];
  personnelAssigned: string[];
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  location: string;
  effectivenessScore: number;
  lastModified: string;
  reviewDate: string;
  createdBy?: string; // Track who created the document
  verificationStatus?: 'Pending' | 'Verified' | 'Rejected'; // Verification workflow
  verifiedBy?: string; // Who verified it
  verifiedDate?: string; // When it was verified
}

interface ColumnConfig {
  id: string;
  label: string;
  visible: boolean;
  alwaysVisible?: boolean;
}

// Mock data for MOA
const VALIDITY_MOA_DATA: PolicyAgreement[] = [
  {
    id: 'moa-2024-001',
    date: '2024-01-15',
    memoNo: 'MOA-2024-001',
    forEntity: 'DOST - Department of Science and Technology',
    subject: 'Joint Research and Development Initiative for Technology Transfer',
    documentType: 'Memorandum of Agreement',
    preparedBy: 'Dr. Maria Santos, Research Director',
    status: 'Active',
    attachedDocuments: {
      hasSignedCopy: true,
      hasDPCRAttachment: true,
      hasIPCRAttachment: true,
      attachmentCount: 8
    },
    tags: ['Research Collaboration', 'Technology Transfer', 'Innovation', 'DOST Partnership', 'High Priority'],
    personnelAssigned: ['Dr. Maria Santos', 'Prof. John Cruz', 'Ms. Ana Reyes', 'Dr. Robert Tech'],
    description: 'Joint research development initiative focusing on technology transfer and innovation',
    priority: 'High',
    location: 'Main Campus',
    effectivenessScore: 92,
    lastModified: '2024-01-20',
    reviewDate: '2024-07-15'
  },
  {
    id: 'moa-2024-002',
    date: '2024-02-20',
    memoNo: 'MOA-2024-002',
    forEntity: 'Philippine Manufacturing Association',
    subject: 'Industry Partnership for Skills Development Program',
    documentType: 'Memorandum of Agreement',
    preparedBy: 'Prof. Juan Cruz, Academic Affairs',
    status: 'Under Review',
    attachedDocuments: {
      hasSignedCopy: false,
      hasDPCRAttachment: true,
      hasIPCRAttachment: false,
      attachmentCount: 4
    },
    tags: ['Industry Partnership', 'Skills Development', 'Workforce Training', 'PMA Collaboration'],
    personnelAssigned: ['Prof. Juan Cruz', 'Dr. Skills Manager', 'Ms. Training Coordinator'],
    description: 'Enhanced industry-academic collaboration for workforce development',
    priority: 'High',
    location: 'Cabadbaran Campus',
    effectivenessScore: 88,
    lastModified: '2024-02-25',
    reviewDate: '2024-08-20'
  },
  {
    id: 'moa-2023-015',
    date: '2023-08-10',
    memoNo: 'MOA-2023-015',
    forEntity: 'Local Government Units - CARAGA Region',
    subject: 'Community Development Outreach Program Agreement',
    documentType: 'Memorandum of Agreement',
    preparedBy: 'Dr. Ana Reyes, Extension Director',
    status: 'Expired',
    attachedDocuments: {
      hasSignedCopy: true,
      hasDPCRAttachment: true,
      hasIPCRAttachment: true,
      attachmentCount: 12
    },
    tags: ['Community Development', 'Extension Services', 'LGU Partnership', 'Outreach Program', 'CARAGA Region'],
    personnelAssigned: ['Dr. Ana Reyes', 'Community Coordinator', 'Extension Officer', 'LGU Liaison'],
    description: 'Sustainable community development and extension services initiative',
    priority: 'Medium',
    location: 'Multiple Locations',
    effectivenessScore: 85,
    lastModified: '2024-01-05',
    reviewDate: '2024-02-10'
  }
];

// Mock data for MOU
const VALIDITY_MOU_DATA: PolicyAgreement[] = [
  {
    id: 'mou-2024-003',
    date: '2024-03-01',
    memoNo: 'MOU-2024-003',
    forEntity: 'University of International Studies',
    subject: 'International Academic Exchange Program',
    documentType: 'Memorandum of Understanding',
    preparedBy: 'Dr. Elena Global, International Affairs',
    status: 'Active',
    attachedDocuments: {
      hasSignedCopy: true,
      hasDPCRAttachment: true,
      hasIPCRAttachment: true,
      attachmentCount: 10
    },
    tags: ['International Exchange', 'Academic Collaboration', 'Student Mobility', 'Global Partnership', 'Education'],
    personnelAssigned: ['Dr. Elena Global', 'Exchange Coordinator', 'International Relations Officer', 'Student Affairs Manager'],
    description: 'Enhanced international academic collaboration and student exchange',
    priority: 'High',
    location: 'Main Campus',
    effectivenessScore: 94,
    lastModified: '2024-03-12',
    reviewDate: '2024-09-01'
  },
  {
    id: 'mou-2023-018',
    date: '2023-09-15',
    memoNo: 'MOU-2023-018',
    forEntity: 'CARAGA Academic Libraries Network',
    subject: 'Regional Library Consortium Partnership',
    documentType: 'Memorandum of Understanding',
    preparedBy: 'Dr. Carmen Books, Library Services',
    status: 'Active',
    attachedDocuments: {
      hasSignedCopy: true,
      hasDPCRAttachment: true,
      hasIPCRAttachment: false,
      attachmentCount: 5
    },
    tags: ['Library Consortium', 'Resource Sharing', 'Digital Access', 'Academic Resources', 'CARAGA Network'],
    personnelAssigned: ['Dr. Carmen Books', 'Library Systems Manager', 'Digital Resources Specialist', 'Network Administrator'],
    description: 'Enhanced library resources and digital access collaboration',
    priority: 'Medium',
    location: 'Both Campuses',
    effectivenessScore: 89,
    lastModified: '2024-01-08',
    reviewDate: '2024-03-15'
  },
  {
    id: 'mou-2024-004',
    date: '2024-04-10',
    memoNo: 'MOU-2024-004',
    forEntity: 'Regional Science Consortium',
    subject: 'Collaborative STEM Education Enhancement Initiative',
    documentType: 'Memorandum of Understanding',
    preparedBy: 'Prof. Science Lead, STEM Department',
    status: 'Under Review',
    attachedDocuments: {
      hasSignedCopy: false,
      hasDPCRAttachment: true,
      hasIPCRAttachment: false,
      attachmentCount: 3
    },
    tags: ['STEM Education', 'Regional Collaboration', 'Science Enhancement', 'Academic Partnership'],
    personnelAssigned: ['Prof. Science Lead', 'STEM Coordinator'],
    description: 'Regional STEM education improvement and resource sharing',
    priority: 'High',
    location: 'Regional',
    effectivenessScore: 0,
    lastModified: '2024-04-15',
    reviewDate: '2024-10-10'
  }
];

export function RefinedValidityPoliciesPage({
  category,
  userRole,
  userEmail,
  requireAuth,
  onProjectSelect,
  filterData,
  onClearFilters
}: RefinedValidityPoliciesPageProps) {
  // Get user permissions from RBAC service
  const [permissions, setPermissions] = useState<PolicyPermissions>(
    enhancedPoliciesRBACService.getUserPermissions(userEmail, userRole, category)
  );

  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Column visibility state - Default shows 5 essential columns ONLY (NO horizontal scroll)
  const [columns, setColumns] = useState<ColumnConfig[]>([
    { id: 'date', label: 'Date', visible: true, alwaysVisible: true },
    { id: 'memoNo', label: 'Memo No.', visible: true, alwaysVisible: true },
    { id: 'forEntity', label: 'For Entity', visible: true },
    { id: 'subject', label: 'Subject', visible: true, alwaysVisible: true },
    { id: 'status', label: 'Status', visible: true, alwaysVisible: true },
    { id: 'documentType', label: 'Document Type', visible: false },
    { id: 'preparedBy', label: 'Prepared By', visible: false },
    { id: 'tags', label: 'Tags', visible: false },
    { id: 'personnelAssigned', label: 'Personnel', visible: false },
    { id: 'priority', label: 'Priority', visible: false },
    { id: 'location', label: 'Location', visible: false },
    { id: 'attachments', label: 'Validity & Outcomes', visible: false },
  ]);

  // CRITICAL FIX: Update documentsData when category changes
  const [documentsData, setDocumentsData] = useState<PolicyAgreement[]>(
    category === 'memorandum-of-agreements' ? VALIDITY_MOA_DATA : VALIDITY_MOU_DATA
  );

  // Effect to update data when category changes
  useEffect(() => {
    const newData = category === 'memorandum-of-agreements' ? VALIDITY_MOA_DATA : VALIDITY_MOU_DATA;
    setDocumentsData(newData);
    
    // Update permissions when category changes
    const newPermissions = enhancedPoliciesRBACService.getUserPermissions(userEmail, userRole, category);
    setPermissions(newPermissions);
  }, [category, userEmail, userRole]);

  // CRUD State Management
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<PolicyAgreement | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteDocumentId, setDeleteDocumentId] = useState<string | null>(null);

  // Personnel Assignment Dialog
  const [isPersonnelDialogOpen, setIsPersonnelDialogOpen] = useState(false);
  const [personnelDocumentId, setPersonnelDocumentId] = useState('');
  const [personnelDocumentTitle, setPersonnelDocumentTitle] = useState('');
  const [personnelDocumentType, setPersonnelDocumentType] = useState<'MOA' | 'MOU' | 'Policy'>('MOA');

  // Director Page Permissions Dialog
  const [isPagePermissionsDialogOpen, setIsPagePermissionsDialogOpen] = useState(false);

  const isMOA = category === 'memorandum-of-agreements';
  const documentType = isMOA ? 'MOA' : 'MOU';

  // Column visibility toggle
  const toggleColumn = (columnId: string) => {
    setColumns(columns.map(col =>
      col.id === columnId && !col.alwaysVisible
        ? { ...col, visible: !col.visible }
        : col
    ));
  };

  // Filter documents based on user permissions
  const getAccessibleDocuments = () => {
    if (userRole === 'Admin' || userRole === 'Director' || userRole === 'Staff' || userRole === 'Editor') {
      return documentsData;
    }

    // For assigned personnel, filter to only show assigned documents
    if (permissions.assignedDocuments && permissions.assignedDocuments.length > 0) {
      return documentsData.filter(doc => permissions.assignedDocuments!.includes(doc.id));
    }

    // Default: show all documents (for Client/Guest with read-only)
    return documentsData;
  };

  // Enhanced filter and sort documents
  const filteredDocuments = getAccessibleDocuments().filter(doc => {
    const matchesSearch = searchTerm === '' || 
      doc.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.memoNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.forEntity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.preparedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
      doc.personnelAssigned.some(person => person.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || doc.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  }).sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'date':
        aValue = new Date(a.date).getTime();
        bValue = new Date(b.date).getTime();
        break;
      case 'memoNo':
        aValue = a.memoNo;
        bValue = b.memoNo;
        break;
      case 'subject':
        aValue = a.subject;
        bValue = b.subject;
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      case 'priority':
        aValue = a.priority;
        bValue = b.priority;
        break;
      default:
        aValue = new Date(a.date).getTime();
        bValue = new Date(b.date).getTime();
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-green-700 bg-green-50 border-green-200';
      case 'Approved': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'Under Review': return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'Draft': return 'text-gray-700 bg-gray-50 border-gray-200';
      case 'Expired': return 'text-red-700 bg-red-50 border-red-200';
      case 'Pending Signature': return 'text-purple-700 bg-purple-50 border-purple-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-700 bg-red-50 border-red-200';
      case 'Medium': return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'Low': return 'text-green-700 bg-green-50 border-green-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  // Handle personnel assignment
  const handleAssignPersonnel = (doc: PolicyAgreement) => {
    if (!requireAuth('assign personnel')) return;
    
    setPersonnelDocumentId(doc.id);
    setPersonnelDocumentTitle(doc.subject);
    setPersonnelDocumentType(isMOA ? 'MOA' : 'MOU');
    setIsPersonnelDialogOpen(true);
  };

  // Handle document view
  const handleViewDocument = (doc: PolicyAgreement) => {
    toast.info('Document Details', {
      description: `Viewing ${doc.memoNo}: ${doc.subject}`
    });
    // In a real app, this would navigate to a detail page
  };

  // Handle document edit
  const handleEditDocument = (doc: PolicyAgreement) => {
    if (!permissions.canEdit) {
      toast.error('Access Denied', {
        description: 'You do not have permission to edit documents'
      });
      return;
    }
    
    setSelectedDocument(doc);
    setIsEditDialogOpen(true);
  };

  // Handle document delete
  const handleDeleteDocument = (doc: PolicyAgreement) => {
    if (!permissions.canDelete) {
      toast.error('Access Denied', {
        description: 'You do not have permission to delete documents'
      });
      return;
    }
    
    setDeleteDocumentId(doc.id);
    setIsDeleteDialogOpen(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (deleteDocumentId) {
      setDocumentsData(prev => prev.filter(doc => doc.id !== deleteDocumentId));
      toast.success('Document deleted successfully');
      setIsDeleteDialogOpen(false);
      setDeleteDocumentId(null);
    }
  };

  // Handle create new
  const handleCreateNew = () => {
    if (!permissions.canAdd) {
      toast.error('Access Denied', {
        description: 'You do not have permission to create documents'
      });
      return;
    }
    
    setIsCreateDialogOpen(true);
  };

  // Handle create submit with RBAC enforcement
  const handleCreateSubmit = (data: Omit<PolicyDocument, 'id'>) => {
    // CRITICAL: Server-side RBAC enforcement for status
    const isRestrictedUser = userRole === 'Staff' || userRole === 'Editor';
    
    const newDoc: PolicyAgreement = {
      id: `${isMOA ? 'moa' : 'mou'}-${Date.now()}`,
      ...data,
      // Force Draft status for restricted users
      status: isRestrictedUser ? 'Draft' : data.status,
      tags: [],
      personnelAssigned: [],
      effectivenessScore: 0,
      lastModified: new Date().toISOString().split('T')[0],
      createdBy: userEmail,
      verificationStatus: isRestrictedUser ? 'Pending' : data.verificationStatus
    };

    setDocumentsData(prev => [newDoc, ...prev]);
    
    if (isRestrictedUser) {
      toast.success(`${documentType} document created as draft`, {
        description: 'Document pending administrator review'
      });
    } else {
      toast.success(`${documentType} document created successfully`);
    }
  };

  // Handle edit submit with RBAC enforcement
  const handleEditSubmit = (data: PolicyDocument) => {
    // CRITICAL: Prevent status change for restricted users
    const isRestrictedUser = userRole === 'Staff' || userRole === 'Editor';
    
    setDocumentsData(prev => prev.map(doc => {
      if (doc.id === data.id) {
        // Preserve original status if user is restricted
        const updatedData = isRestrictedUser ? {
          ...data,
          status: doc.status // Keep original status
        } : data;
        
        return {
          ...doc,
          ...updatedData,
          lastModified: new Date().toISOString().split('T')[0]
        };
      }
      return doc;
    }));
    
    toast.success('Document updated successfully');
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setSortBy('date');
    setSortDirection('desc');
  };

  // Get visible columns
  const visibleColumns = columns.filter(col => col.visible);

  // Statistics
  const stats = {
    total: documentsData.length,
    active: documentsData.filter(d => d.status === 'Active').length,
    expired: documentsData.filter(d => d.status === 'Expired').length,
    underReview: documentsData.filter(d => d.status === 'Under Review').length
  };

  return (
    <div className="h-full overflow-auto admin-page-bg">
      <div className="max-w-7xl mx-auto p-8 space-y-6">
        {/* Header - Formal and Minimal Design */}
        <div className="admin-header rounded-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-gray-900">
                {isMOA ? 'Memorandum of Agreements (MOA)' : 'Memorandum of Understanding (MOU)'}
              </h1>
              <p className="text-gray-600 mt-2">
                Institutional {isMOA ? 'Agreements' : 'Understandings'} and Partnership Management
              </p>
            </div>
            <div className="flex items-center gap-3">
              {(userRole === 'Admin') && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsPagePermissionsDialogOpen(true)}
                        className="gap-2 border-gray-300 hover:bg-gray-100"
                      >
                        <Settings className="h-4 w-4" />
                        <span className="hidden sm:inline">Manage Permissions</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Manage Director page permissions</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {permissions.canAdd && (
                <Button
                  onClick={handleCreateNew}
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Plus className="h-4 w-4" />
                  Add {documentType}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Statistics Cards - Minimal Design */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-gray-200 bg-white shadow-sm hover:shadow transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-gray-600">Total {documentType}s</CardTitle>
                <FileText className="h-5 w-5 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-gray-900">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50/50 shadow-sm hover:shadow transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-green-700">Active</CardTitle>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-green-700">{stats.active}</div>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50/50 shadow-sm hover:shadow transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-amber-700">Under Review</CardTitle>
                <FileSignature className="h-5 w-5 text-amber-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-amber-700">{stats.underReview}</div>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50/50 shadow-sm hover:shadow transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-red-700">Expired</CardTitle>
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-red-700">{stats.expired}</div>
            </CardContent>
          </Card>
        </div>

        {/* Table Card - Formal Design */}
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader className="border-b border-gray-200 bg-gray-50/50">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-gray-900">{documentType} Documents</CardTitle>
                  <CardDescription className="text-gray-600 mt-1">
                    {filteredDocuments.length} {filteredDocuments.length === 1 ? 'document' : 'documents'} found
                  </CardDescription>
                </div>
                
                {/* Column Visibility Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 border-gray-300 hover:bg-gray-100">
                      <Columns className="h-4 w-4" />
                      Columns
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="text-xs text-gray-500 uppercase">Toggle Columns</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {columns.map(column => (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        checked={column.visible}
                        onCheckedChange={() => toggleColumn(column.id)}
                        disabled={column.alwaysVisible}
                        className="cursor-pointer"
                      >
                        {column.label}
                        {column.alwaysVisible && (
                          <span className="ml-2 text-xs text-gray-400">(required)</span>
                        )}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Filters - Minimal and Clean */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 border-gray-200 bg-white hover:border-gray-300"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px] border-gray-200 bg-white hover:border-gray-300">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Under Review">Under Review</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Expired">Expired</SelectItem>
                    <SelectItem value="Pending Signature">Pending Signature</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-[140px] border-gray-200 bg-white hover:border-gray-300">
                    <SelectValue placeholder="All Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleResetFilters}
                        className="gap-2 border-gray-300 hover:bg-gray-100"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Reset
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Clear all filters</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* Table with NO horizontal scroll on default view (5 columns max) */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/80 border-b border-gray-200">
                    {visibleColumns.map((column) => (
                      <TableHead key={column.id} className="text-gray-700">
                        {column.label}
                      </TableHead>
                    ))}
                    <TableHead className="text-right text-gray-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={visibleColumns.length + 1}
                        className="text-center py-16 text-gray-500 bg-gray-50/30"
                      >
                        <div className="flex flex-col items-center gap-3">
                          <Filter className="w-12 h-12 text-gray-300" />
                          <div>
                            <p className="font-medium text-gray-700">No documents found</p>
                            <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filter criteria</p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDocuments.map((doc) => {
                      const canViewDoc = permissions.canView;
                      const canEditDoc = permissions.canEdit;
                      const canDeleteDoc = permissions.canDelete;
                      const canAssignPersonnel = userRole === 'Admin' || userRole === 'Director';
                      
                      return (
                        <TableRow
                          key={doc.id}
                          className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                        >
                          {visibleColumns.map((column) => (
                            <TableCell key={column.id} className="text-gray-700">
                              {column.id === 'date' && (
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-gray-400" />
                                  {new Date(doc.date).toLocaleDateString()}
                                </div>
                              )}
                              {column.id === 'memoNo' && (
                                <span className="font-medium text-emerald-700">{doc.memoNo}</span>
                              )}
                              {column.id === 'forEntity' && (
                                <div className="max-w-[200px] truncate" title={doc.forEntity}>
                                  {doc.forEntity}
                                </div>
                              )}
                              {column.id === 'subject' && (
                                <div className="max-w-[300px] truncate font-medium" title={doc.subject}>
                                  {doc.subject}
                                </div>
                              )}
                              {column.id === 'status' && (
                                <Badge className={`${getStatusColor(doc.status)} border`}>
                                  {doc.status}
                                </Badge>
                              )}
                              {column.id === 'documentType' && (
                                <span className="text-sm">{doc.documentType}</span>
                              )}
                              {column.id === 'preparedBy' && (
                                <div className="flex items-center gap-2">
                                  <UserCheck className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm">{doc.preparedBy}</span>
                                </div>
                              )}
                              {column.id === 'tags' && (
                                <div className="flex flex-wrap gap-1 max-w-[200px]">
                                  {doc.tags.slice(0, 2).map((tag, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {doc.tags.length > 2 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{doc.tags.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              )}
                              {column.id === 'personnelAssigned' && (
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm">{doc.personnelAssigned.length}</span>
                                </div>
                              )}
                              {column.id === 'priority' && (
                                <Badge className={`${getPriorityColor(doc.priority)} border`}>
                                  {doc.priority}
                                </Badge>
                              )}
                              {column.id === 'location' && (
                                <div className="flex items-center gap-2">
                                  <Building className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm">{doc.location}</span>
                                </div>
                              )}
                              {column.id === 'attachments' && (
                                <div className="flex items-center gap-2">
                                  <FileCheck className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm">{doc.attachedDocuments.attachmentCount}</span>
                                </div>
                              )}
                            </TableCell>
                          ))}
                          <TableCell className="text-right">
                            {/* Consolidated Actions Dropdown - Like COI */}
                            <DropdownMenu modal={false}>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-gray-100"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel className="text-xs text-gray-500 uppercase">
                                  Actions
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                
                                <DropdownMenuItem
                                  onClick={() => handleViewDocument(doc)}
                                  className="cursor-pointer"
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>

                                {canEditDoc && (
                                  <DropdownMenuItem
                                    onClick={() => handleEditDocument(doc)}
                                    className="cursor-pointer"
                                  >
                                    <Edit2 className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                )}

                                {canAssignPersonnel && (
                                  <DropdownMenuItem
                                    onClick={() => handleAssignPersonnel(doc)}
                                    className="cursor-pointer"
                                  >
                                    <Users className="h-4 w-4 mr-2" />
                                    Assign Personnel
                                  </DropdownMenuItem>
                                )}

                                <DropdownMenuItem className="cursor-pointer">
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </DropdownMenuItem>

                                {canDeleteDoc && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => handleDeleteDocument(doc)}
                                      className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Personnel Assignment Manager */}
        <PersonnelAssignmentManager
          documentId={personnelDocumentId}
          documentTitle={personnelDocumentTitle}
          documentType={personnelDocumentType}
          userEmail={userEmail}
          open={isPersonnelDialogOpen}
          onOpenChange={setIsPersonnelDialogOpen}
        />

        {/* Director Page Permission Manager */}
        <DirectorPagePermissionManager
          userEmail={userEmail}
          open={isPagePermissionsDialogOpen}
          onOpenChange={setIsPagePermissionsDialogOpen}
        />

        {/* Create Document Dialog */}
        <AddPolicyDocumentDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onSubmit={handleCreateSubmit}
          documentType={isMOA ? 'MOA' : 'MOU'}
          userRole={userRole}
          userEmail={userEmail}
        />

        {/* Edit Document Dialog */}
        {selectedDocument && (
          <EditPolicyDocumentDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            onSubmit={handleEditSubmit}
            document={selectedDocument as unknown as PolicyDocument}
            userRole={userRole}
            userEmail={userEmail}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this document? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}