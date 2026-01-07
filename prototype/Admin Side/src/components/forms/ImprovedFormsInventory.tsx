/**
 * Improved Forms Inventory - Professional Upload Management
 * Modal UI styled like POWDialogs with enhanced user experience
 * Formal, functional, and intuitive design
 */
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Upload, FileText, Search, Filter, Eye, Download, Edit, Trash2,
  Plus, Building2, Wrench, Users, GraduationCap, Scale, FolderOpen,
  Hammer, CheckCircle, X, Calendar, FileCheck, Clock, Info,
  ArrowUpRight, Package, BarChart3, TrendingUp
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ImprovedFormsInventoryProps {
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

export function ImprovedFormsInventory({ userRole, requireAuth, onNavigate }: ImprovedFormsInventoryProps) {
  const [uploadedForms, setUploadedForms] = useState<UploadedFormDocument[]>(MOCK_UPLOADED_FORMS);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState<UploadedFormDocument | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
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
      
      const matchesStatus = statusFilter === 'all' || form.status === statusFilter;
      const matchesTab = activeTab === 'all' || form.category === activeTab;
      
      return matchesSearch && matchesStatus && matchesTab;
    });
  }, [uploadedForms, searchTerm, statusFilter, activeTab]);

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
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      
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
      'Under Review': { color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
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

  const getCategoryInfo = (categoryValue: string) => {
    return CATEGORY_OPTIONS.find(c => c.value === categoryValue);
  };

  return (
    <div className="h-full overflow-auto admin-page-bg">
      <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-6">
        {/* Header Section */}
        <div className="admin-card">
          <div className="p-7 space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="p-3.5 bg-emerald-50 rounded-lg border border-emerald-100">
                  <Upload className="w-7 h-7 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h1 className="text-gray-900 text-2xl mb-2">Forms Inventory Management</h1>
                  <p className="text-base text-gray-600 leading-relaxed">
                    Manage submitted and uploaded forms with comprehensive categorization and review workflows
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => setIsUploadDialogOpen(true)} 
                className="bg-emerald-600 hover:bg-emerald-700 h-10"
              >
                <Plus className="w-4 h-4 mr-2" />
                Upload Form
              </Button>
            </div>

            <Separator />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card className="border-0 bg-gradient-to-br from-gray-50 to-white">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Forms</p>
                      <p className="text-2xl text-gray-900">{stats.total}</p>
                    </div>
                    <div className="p-2.5 bg-gray-100 rounded-lg">
                      <FileText className="w-5 h-5 text-gray-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-gradient-to-br from-blue-50 to-white">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-700 mb-1">Submitted</p>
                      <p className="text-2xl text-blue-900">{stats.submitted}</p>
                    </div>
                    <div className="p-2.5 bg-blue-100 rounded-lg">
                      <FileCheck className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-gradient-to-br from-amber-50 to-white">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-amber-700 mb-1">Under Review</p>
                      <p className="text-2xl text-amber-900">{stats.underReview}</p>
                    </div>
                    <div className="p-2.5 bg-amber-100 rounded-lg">
                      <Clock className="w-5 h-5 text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-gradient-to-br from-green-50 to-white">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-700 mb-1">Approved</p>
                      <p className="text-2xl text-green-900">{stats.approved}</p>
                    </div>
                    <div className="p-2.5 bg-green-100 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-gradient-to-br from-red-50 to-white">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-red-700 mb-1">Rejected</p>
                      <p className="text-2xl text-red-900">{stats.rejected}</p>
                    </div>
                    <div className="p-2.5 bg-red-100 rounded-lg">
                      <X className="w-5 h-5 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Main Content with Tabs */}
        <Card className="admin-card border-0">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-br from-gray-50 to-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <CardTitle className="text-xl text-gray-900">Uploaded Forms</CardTitle>
                <CardDescription className="text-base mt-1.5">
                  Viewing {filteredForms.length} of {uploadedForms.length} forms
                </CardDescription>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[300px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search forms by title, description, or uploader..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48 h-10">
                  <Filter className="w-4 h-4 mr-2" />
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

          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              {/* Tab Navigation */}
              <div className="border-b border-gray-100 bg-gray-50 px-6 pt-4">
                <TabsList className="bg-transparent border-0 p-0 w-full grid grid-cols-4 lg:grid-cols-8 gap-1">
                  <TabsTrigger 
                    value="all"
                    className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 border-b-2 border-transparent py-2.5 text-sm rounded-t-md"
                  >
                    All
                  </TabsTrigger>
                  {CATEGORY_OPTIONS.map((cat) => (
                    <TabsTrigger 
                      key={cat.value}
                      value={cat.value}
                      className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 border-b-2 border-transparent py-2.5 text-sm rounded-t-md truncate"
                    >
                      {cat.label.split(' ')[0]}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              <div className="p-6">
                {/* Forms Table */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="text-gray-700">Form Title</TableHead>
                        <TableHead className="text-gray-700">Category</TableHead>
                        <TableHead className="text-gray-700">Uploaded By</TableHead>
                        <TableHead className="text-gray-700">Date</TableHead>
                        <TableHead className="text-gray-700">Status</TableHead>
                        <TableHead className="text-right text-gray-700">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredForms.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-12">
                            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 mb-2">No forms found matching your criteria</p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSearchTerm('');
                                setStatusFilter('all');
                                setActiveTab('all');
                              }}
                            >
                              Clear Filters
                            </Button>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredForms.map((form) => {
                          const categoryInfo = getCategoryInfo(form.category);
                          const CategoryIcon = categoryInfo?.icon || FolderOpen;
                          
                          return (
                            <TableRow key={form.id} className="hover:bg-gray-50">
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-blue-50 rounded-lg">
                                    <CategoryIcon className="w-4 h-4 text-blue-600" />
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-900">{form.title}</p>
                                    <p className="text-xs text-gray-500">{form.fileName} • {form.fileSize}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                                    {categoryInfo?.label}
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
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleView(form)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDownload(form)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Download className="w-4 h-4" />
                                  </Button>
                                  {(userRole === 'admin' || userRole === 'director') && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleDelete(form.id)}
                                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="w-4 h-4" />
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
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Upload Dialog - POWDialog Style */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[90vw] lg:max-w-[900px] max-h-[95vh] bg-white border-0 shadow-2xl rounded-lg overflow-hidden [&>button]:hidden">
          <DialogHeader className="bg-gradient-to-r from-emerald-900 via-green-900 to-teal-900 text-white -m-6 px-8 py-6 mb-0 relative">
            <Button
              onClick={() => setIsUploadDialogOpen(false)}
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 h-8 w-8 p-0 text-white hover:bg-white/10 hover:text-white rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
            <DialogTitle className="flex items-center gap-3 text-xl pr-12">
              <div className="p-2 bg-white/10 rounded-lg">
                <Upload className="h-5 w-5" />
              </div>
              Upload Filled Form
            </DialogTitle>
            <DialogDescription className="text-sm text-emerald-100 mt-2">
              Upload your completed form and provide necessary details for proper categorization and review
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto max-h-[calc(95vh-180px)] p-6 space-y-5">
            <Alert className="border-emerald-200 bg-emerald-50">
              <Info className="h-4 w-4 text-emerald-600" />
              <AlertDescription className="text-sm text-emerald-900">
                All uploaded forms will be submitted for review. You'll be notified once your form is reviewed and approved.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="title" className="text-gray-700">Form Title *</Label>
              <Input
                id="title"
                value={uploadData.title}
                onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                placeholder="Enter a descriptive title for your form"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-700">Description</Label>
              <Textarea
                id="description"
                value={uploadData.description}
                onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                placeholder="Brief description of the form content and purpose"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-gray-700">Category *</Label>
                <Select 
                  value={uploadData.category} 
                  onValueChange={(value) => setUploadData({ ...uploadData, category: value, subcategory: '' })}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <SelectItem key={cat.value} value={cat.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            {cat.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subcategory" className="text-gray-700">Subcategory *</Label>
                <Select 
                  value={uploadData.subcategory} 
                  onValueChange={(value) => setUploadData({ ...uploadData, subcategory: value })}
                  disabled={!uploadData.category}
                >
                  <SelectTrigger id="subcategory">
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

            <div className="space-y-2">
              <Label htmlFor="department" className="text-gray-700">Department/Office</Label>
              <Input
                id="department"
                value={uploadData.department}
                onChange={(e) => setUploadData({ ...uploadData, department: e.target.value })}
                placeholder="Your department or office name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks" className="text-gray-700">Additional Remarks</Label>
              <Textarea
                id="remarks"
                value={uploadData.remarks}
                onChange={(e) => setUploadData({ ...uploadData, remarks: e.target.value })}
                placeholder="Any additional notes or comments for reviewers"
                rows={2}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="file" className="text-gray-700">Select File *</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors">
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  className="hidden"
                />
                <label htmlFor="file" className="cursor-pointer">
                  {selectedFile ? (
                    <div className="space-y-2">
                      <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
                      <p className="text-sm text-emerald-600">
                        <strong>{selectedFile.name}</strong>
                      </p>
                      <p className="text-xs text-gray-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <p className="text-xs text-gray-400">Click to change file</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                      <p className="text-sm text-gray-600">
                        <strong>Click to upload</strong> or drag and drop
                      </p>
                      <p className="text-xs text-gray-400">
                        PDF, DOC, DOCX, XLS, XLSX (max 10MB)
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 p-6 bg-gray-50 -m-6 mt-0">
            <div className="flex items-center justify-end gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsUploadDialogOpen(false)}
                className="h-10"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpload} 
                className="bg-emerald-600 hover:bg-emerald-700 h-10"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Form
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" />
              Form Details
            </DialogTitle>
          </DialogHeader>

          {selectedForm && (
            <div className="space-y-5">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-gray-900 mb-1">{selectedForm.title}</h3>
                    <p className="text-sm text-gray-600">{selectedForm.description || 'No description provided'}</p>
                  </div>
                  {getStatusBadge(selectedForm.status)}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Package className="w-3 h-3" />
                  <span>{selectedForm.fileName}</span>
                  <span>•</span>
                  <span>{selectedForm.fileSize}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-500 text-sm">Category</Label>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const cat = getCategoryInfo(selectedForm.category);
                      const Icon = cat?.icon || FolderOpen;
                      return (
                        <>
                          <Icon className="w-4 h-4 text-gray-600" />
                          <p className="text-gray-900">{cat?.label}</p>
                        </>
                      );
                    })()}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-500 text-sm">Subcategory</Label>
                  <p className="text-gray-900">{selectedForm.subcategory}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-500 text-sm">Uploaded By</Label>
                  <p className="text-gray-900">{selectedForm.uploadedBy}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-500 text-sm">Department</Label>
                  <p className="text-gray-900">{selectedForm.department}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-500 text-sm">Upload Date</Label>
                  <div className="flex items-center gap-1 text-gray-900">
                    <Calendar className="w-4 h-4" />
                    {selectedForm.uploadedDate}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-500 text-sm">Status</Label>
                  {getStatusBadge(selectedForm.status)}
                </div>
              </div>

              {selectedForm.remarks && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label className="text-gray-500 text-sm">Remarks</Label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-200">
                      {selectedForm.remarks}
                    </p>
                  </div>
                </>
              )}

              {selectedForm.reviewedBy && (
                <>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-500 text-sm">Reviewed By</Label>
                      <p className="text-gray-900">{selectedForm.reviewedBy}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-500 text-sm">Review Date</Label>
                      <div className="flex items-center gap-1 text-gray-900">
                        <Calendar className="w-4 h-4" />
                        {selectedForm.reviewedDate}
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => setIsViewDialogOpen(false)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => handleDownload(selectedForm)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
