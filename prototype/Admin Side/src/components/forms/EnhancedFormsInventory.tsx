/**
 * Enhanced Forms Inventory - User Upload Management
 * Allows users to upload filled forms and properly categorize them
 * Formal, professional interface with comprehensive categorization
 */
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Upload, FileText, Search, Filter, Eye, Download, Edit, Trash2,
  Plus, Building2, Wrench, Users, GraduationCap, Scale, FolderOpen,
  Hammer, CheckCircle, X, Calendar, FileCheck
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface EnhancedFormsInventoryProps {
  userRole: string;
  requireAuth: (action: string) => boolean;
  onNavigate: (page: string) => void;
}

interface UploadedFormDocument {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  uploadedBy: string;
  uploadedDate: string;
  department: string;
  status: 'Submitted' | 'Under Review' | 'Approved' | 'Rejected';
  fileName: string;
  fileSize: string;
  remarks?: string;
  reviewedBy?: string;
  reviewedDate?: string;
}

const CATEGORY_OPTIONS = [
  { value: 'university-operations', label: 'University Operations', icon: Building2, color: 'blue' },
  { value: 'construction-infrastructure', label: 'Construction Infrastructure', icon: Hammer, color: 'orange' },
  { value: 'repairs', label: 'Repairs & Maintenance', icon: Wrench, color: 'emerald' },
  { value: 'gad', label: 'GAD & Parity', icon: Users, color: 'purple' },
  { value: 'classroom-admin', label: 'Classroom & Administrative', icon: GraduationCap, color: 'cyan' },
  { value: 'policies', label: 'Policies & Agreements', icon: Scale, color: 'indigo' },
  { value: 'others', label: 'Other Forms', icon: FolderOpen, color: 'slate' }
];

const SUBCATEGORY_OPTIONS: Record<string, string[]> = {
  'university-operations': ['Higher Education', 'Advanced Education', 'Research', 'Extension'],
  'construction-infrastructure': ['Planning', 'Proposal', 'Quality Control', 'Monitoring'],
  'repairs': ['Requests', 'Maintenance', 'Reporting', 'Inspection'],
  'gad': ['Sectoral', 'Budget', 'Analysis', 'Compliance'],
  'classroom-admin': ['Facilities', 'Planning', 'Assessment', 'Maintenance'],
  'policies': ['Agreements', 'Documentation', 'Templates', 'Compliance'],
  'others': ['Monitoring', 'Reporting', 'Planning', 'Evaluation', 'Framework']
};

// Mock uploaded forms data
const MOCK_UPLOADED_FORMS: UploadedFormDocument[] = [
  {
    id: 'uf-001',
    title: 'Classroom A-101 Assessment Report',
    description: 'Completed assessment for Classroom A-101 including facility conditions',
    category: 'classroom-admin',
    subcategory: 'Assessment',
    uploadedBy: 'Maria Santos',
    uploadedDate: '2024-01-28',
    department: 'Facilities Management',
    status: 'Approved',
    fileName: 'classroom-a101-assessment.pdf',
    fileSize: '1.2 MB',
    remarks: 'Assessment completed thoroughly. Approved for implementation.',
    reviewedBy: 'Admin User',
    reviewedDate: '2024-01-29'
  },
  {
    id: 'uf-002',
    title: 'Main Building Repair Request - Electrical',
    description: 'Repair request for electrical issues in Main Building 2nd Floor',
    category: 'repairs',
    subcategory: 'Requests',
    uploadedBy: 'John Dela Cruz',
    uploadedDate: '2024-01-27',
    department: 'Building Maintenance',
    status: 'Under Review',
    fileName: 'main-building-electrical-repair.pdf',
    fileSize: '856 KB'
  },
  {
    id: 'uf-003',
    title: 'GAD Budget Plan Q1 2024',
    description: 'Quarterly GAD budget allocation and planning document',
    category: 'gad',
    subcategory: 'Budget',
    uploadedBy: 'Elena Rodriguez',
    uploadedDate: '2024-01-26',
    department: 'Planning and Development Office',
    status: 'Approved',
    fileName: 'gad-budget-q1-2024.pdf',
    fileSize: '2.1 MB',
    remarks: 'Budget approved with recommended allocations.',
    reviewedBy: 'Director User',
    reviewedDate: '2024-01-27'
  },
  {
    id: 'uf-004',
    title: 'Research Program Assessment - July 2024',
    description: 'Monthly research program monitoring and assessment',
    category: 'university-operations',
    subcategory: 'Research',
    uploadedBy: 'Dr. Patricia Reyes',
    uploadedDate: '2024-01-25',
    department: 'Research and Extension Office',
    status: 'Submitted',
    fileName: 'research-assessment-jul24.pdf',
    fileSize: '1.8 MB'
  },
  {
    id: 'uf-005',
    title: 'Construction Progress Report - Library Extension',
    description: 'Monthly progress report for library extension project',
    category: 'construction-infrastructure',
    subcategory: 'Monitoring',
    uploadedBy: 'Engr. Robert Cruz',
    uploadedDate: '2024-01-24',
    department: 'Project Management Office',
    status: 'Approved',
    fileName: 'library-extension-progress.pdf',
    fileSize: '3.4 MB',
    remarks: 'Progress on track. Continue monitoring.',
    reviewedBy: 'Admin User',
    reviewedDate: '2024-01-25'
  }
];

export function EnhancedFormsInventory({ userRole, requireAuth, onNavigate }: EnhancedFormsInventoryProps) {
  const [uploadedForms, setUploadedForms] = useState<UploadedFormDocument[]>(MOCK_UPLOADED_FORMS);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState<UploadedFormDocument | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');

  // Upload form state
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    department: '',
    remarks: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Filter forms
  const filteredForms = useMemo(() => {
    return uploadedForms.filter(form => {
      const matchesSearch = 
        form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        form.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        form.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || form.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || form.status === statusFilter;
      const matchesTab = activeTab === 'all' || form.category === activeTab;
      
      return matchesSearch && matchesCategory && matchesStatus && matchesTab;
    });
  }, [uploadedForms, searchTerm, categoryFilter, statusFilter, activeTab]);

  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: uploadedForms.length,
      submitted: uploadedForms.filter(f => f.status === 'Submitted').length,
      underReview: uploadedForms.filter(f => f.status === 'Under Review').length,
      approved: uploadedForms.filter(f => f.status === 'Approved').length,
      rejected: uploadedForms.filter(f => f.status === 'Rejected').length
    };
  }, [uploadedForms]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!uploadData.title) {
        setUploadData(prev => ({ 
          ...prev, 
          title: file.name.replace(/\.[^/.]+$/, '') 
        }));
      }
      toast.success(`File "${file.name}" selected`);
    }
  };

  const handleUpload = () => {
    if (!requireAuth('upload forms')) return;
    
    if (!selectedFile || !uploadData.title || !uploadData.category || !uploadData.subcategory) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newForm: UploadedFormDocument = {
      id: `uf-${Date.now()}`,
      title: uploadData.title,
      description: uploadData.description,
      category: uploadData.category,
      subcategory: uploadData.subcategory,
      uploadedBy: 'Current User',
      uploadedDate: new Date().toISOString().split('T')[0],
      department: uploadData.department || 'Not Specified',
      status: 'Submitted',
      fileName: selectedFile.name,
      fileSize: `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`,
      remarks: uploadData.remarks
    };

    setUploadedForms([newForm, ...uploadedForms]);
    setIsUploadDialogOpen(false);
    setSelectedFile(null);
    setUploadData({
      title: '',
      description: '',
      category: '',
      subcategory: '',
      department: '',
      remarks: ''
    });
    toast.success('Form uploaded successfully and awaiting review');
  };

  const handleView = (form: UploadedFormDocument) => {
    setSelectedForm(form);
    setIsViewDialogOpen(true);
  };

  const handleDownload = (form: UploadedFormDocument) => {
    toast.success(`Downloading: ${form.fileName}`);
    console.log('Downloading form:', form.id);
  };

  const handleDelete = (formId: string) => {
    if (!requireAuth('delete forms')) return;
    
    setUploadedForms(uploadedForms.filter(f => f.id !== formId));
    toast.success('Form deleted successfully');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Submitted': { color: 'bg-blue-50 text-blue-700 border-blue-200', icon: FileCheck },
      'Under Review': { color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Eye },
      'Approved': { color: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle },
      'Rejected': { color: 'bg-red-50 text-red-700 border-red-200', icon: X }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config?.icon || FileCheck;
    
    return (
      <Badge variant="outline" className={config?.color || ''}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const getCategoryIcon = (categoryValue: string) => {
    const category = CATEGORY_OPTIONS.find(c => c.value === categoryValue);
    return category ? category.icon : FolderOpen;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 rounded-xl">
                <Upload className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-gray-900">Forms Inventory</h1>
                <p className="text-gray-600 mt-1">
                  Manage submitted and uploaded forms with comprehensive categorization
                </p>
              </div>
            </div>
            <Button onClick={() => setIsUploadDialogOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Upload Form
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Uploads</p>
                    <p className="text-gray-900">{stats.total}</p>
                  </div>
                  <FileText className="w-8 h-8 text-gray-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-700 mb-1">Submitted</p>
                    <p className="text-blue-900">{stats.submitted}</p>
                  </div>
                  <FileCheck className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-amber-200 bg-amber-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-amber-700 mb-1">Under Review</p>
                    <p className="text-amber-900">{stats.underReview}</p>
                  </div>
                  <Eye className="w-8 h-8 text-amber-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-700 mb-1">Approved</p>
                    <p className="text-green-900">{stats.approved}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-700 mb-1">Rejected</p>
                    <p className="text-red-900">{stats.rejected}</p>
                  </div>
                  <X className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content with Tabs */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div>
                <CardTitle>Uploaded Forms Management</CardTitle>
                <CardDescription>View and manage all submitted forms by category</CardDescription>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[300px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search forms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Submitted">Submitted</SelectItem>
                  <SelectItem value="Under Review">Under Review</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 lg:grid-cols-8 gap-2 bg-gray-100 p-2 mb-6">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="university-operations">Univ Ops</TabsTrigger>
                <TabsTrigger value="construction-infrastructure">COI</TabsTrigger>
                <TabsTrigger value="repairs">Repairs</TabsTrigger>
                <TabsTrigger value="gad">GAD</TabsTrigger>
                <TabsTrigger value="classroom-admin">Classroom</TabsTrigger>
                <TabsTrigger value="policies">Policies</TabsTrigger>
                <TabsTrigger value="others">Others</TabsTrigger>
              </TabsList>

              <div className="space-y-2">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-600">
                    Showing {filteredForms.length} of {uploadedForms.length} forms
                  </p>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Form Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Uploaded By</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredForms.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          No forms found matching your criteria
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredForms.map((form) => {
                        const CategoryIcon = getCategoryIcon(form.category);
                        return (
                          <TableRow key={form.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <CategoryIcon className="w-5 h-5 text-gray-400" />
                                <div>
                                  <p className="text-sm text-gray-900">{form.title}</p>
                                  <p className="text-xs text-gray-500">{form.fileName}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                                  {CATEGORY_OPTIONS.find(c => c.value === form.category)?.label}
                                </Badge>
                                <p className="text-xs text-gray-500">{form.subcategory}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="text-sm text-gray-900">{form.uploadedBy}</p>
                                <p className="text-xs text-gray-500">{form.department}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Calendar className="w-3 h-3" />
                                {form.uploadedDate}
                              </div>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(form.status)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleView(form)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDownload(form)}
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                                {(userRole === 'admin' || userRole === 'director') && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDelete(form.id)}
                                  >
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Filled Form</DialogTitle>
            <DialogDescription>
              Upload your completed form and provide necessary details for categorization
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Form Title *</Label>
              <Input
                value={uploadData.title}
                onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                placeholder="Enter form title"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={uploadData.description}
                onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                placeholder="Brief description of the form content"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category *</Label>
                <Select 
                  value={uploadData.category} 
                  onValueChange={(value) => setUploadData({ ...uploadData, category: value, subcategory: '' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Subcategory *</Label>
                <Select 
                  value={uploadData.subcategory} 
                  onValueChange={(value) => setUploadData({ ...uploadData, subcategory: value })}
                  disabled={!uploadData.category}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {uploadData.category && SUBCATEGORY_OPTIONS[uploadData.category]?.map((sub) => (
                      <SelectItem key={sub} value={sub}>
                        {sub}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Department/Office</Label>
              <Input
                value={uploadData.department}
                onChange={(e) => setUploadData({ ...uploadData, department: e.target.value })}
                placeholder="Your department or office"
              />
            </div>

            <div>
              <Label>Additional Remarks</Label>
              <Textarea
                value={uploadData.remarks}
                onChange={(e) => setUploadData({ ...uploadData, remarks: e.target.value })}
                placeholder="Any additional notes or comments"
                rows={2}
              />
            </div>

            <div>
              <Label>Select File *</Label>
              <div className="mt-2">
                <Input
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                />
                {selectedFile && (
                  <p className="text-sm text-green-600 mt-2">
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpload} className="bg-emerald-600 hover:bg-emerald-700">
              <Upload className="w-4 h-4 mr-2" />
              Upload Form
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Form Details</DialogTitle>
          </DialogHeader>

          {selectedForm && (
            <div className="space-y-4">
              <div>
                <Label className="text-gray-500">Form Title</Label>
                <p className="text-gray-900">{selectedForm.title}</p>
              </div>

              <div>
                <Label className="text-gray-500">Description</Label>
                <p className="text-gray-900">{selectedForm.description || 'No description provided'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">Category</Label>
                  <p className="text-gray-900">
                    {CATEGORY_OPTIONS.find(c => c.value === selectedForm.category)?.label}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-500">Subcategory</Label>
                  <p className="text-gray-900">{selectedForm.subcategory}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">Uploaded By</Label>
                  <p className="text-gray-900">{selectedForm.uploadedBy}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Date</Label>
                  <p className="text-gray-900">{selectedForm.uploadedDate}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">Department</Label>
                  <p className="text-gray-900">{selectedForm.department}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Status</Label>
                  <div className="mt-1">
                    {getStatusBadge(selectedForm.status)}
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-gray-500">File</Label>
                <p className="text-gray-900">{selectedForm.fileName} ({selectedForm.fileSize})</p>
              </div>

              {selectedForm.remarks && (
                <div>
                  <Label className="text-gray-500">Remarks</Label>
                  <p className="text-gray-900">{selectedForm.remarks}</p>
                </div>
              )}

              {selectedForm.reviewedBy && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <Label className="text-gray-500">Review Information</Label>
                  <p className="text-sm text-gray-900 mt-1">
                    Reviewed by {selectedForm.reviewedBy} on {selectedForm.reviewedDate}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            {selectedForm && (
              <Button onClick={() => handleDownload(selectedForm)}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
