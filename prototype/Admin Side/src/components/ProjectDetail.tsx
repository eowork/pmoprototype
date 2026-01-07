import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import { Switch } from './ui/switch';
import { 
  ArrowLeft, 
  Calendar, 
  DollarSign, 
  MapPin, 
  Building, 
  Users, 
  FileText, 
  Camera,
  Edit,
  Plus,
  Trash2,
  Save,
  X,
  Eye,
  BarChart3,
  Activity,
  User,
  Timer,
  Calculator,
  Upload,
  Download,
  Image as ImageIcon,
  FileIcon,
  LayoutGrid,
  List,
  Clock,
  CheckCircle,
  ZoomIn
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart, ComposedChart } from 'recharts';
import { toast } from 'sonner@2.0.3';

interface ProjectDetailProps {
  project: any;
  onBack: () => void;
  onNavigate: (page: string) => void;
  userRole: string;
  requireAuth: (action: string) => boolean;
}

interface ProjectItem {
  id: string;
  description: string;
  progress: number;
  quantity: number;
  unit: string;
  estimatedMaterialCost: number;
  estimatedLaborCost: number;
  estimatedProjectCost: number;
  unitCost: number;
  variance: number;
  startDate: string;
  endDate: string;
  projectDuration: number;
  status: string;
  category: string;
}

interface FinancialAllocation {
  totalBudget: number;
  physicalAccomplishmentValue: number;
  physicalAccomplishmentPercent: number;
  budgetUtilization: number;
  totalEstimatedCost: number;
  remainingBudget: number;
  costVariance: number;
}

interface GalleryItem {
  id: string;
  filename: string;
  url: string;
  remarks: string;
  dateUploaded: string;
  uploadedBy: string;
}

interface DocumentItem {
  id: string;
  filename: string;
  fileType: string;
  fileSize: string;
  url: string;
  remarks: string;
  dateUploaded: string;
  uploadedBy: string;
}

export function ProjectDetail({ project, onBack, onNavigate, userRole, requireAuth }: ProjectDetailProps) {
  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('table');
  
  // Data states
  const [projectItems, setProjectItems] = useState<ProjectItem[]>([]);
  const [financialAllocation, setFinancialAllocation] = useState<FinancialAllocation>({
    totalBudget: 237877,
    physicalAccomplishmentValue: 117382,
    physicalAccomplishmentPercent: 40.8,
    budgetUtilization: 76.0,
    totalEstimatedCost: 6450000,
    remainingBudget: 69090,
    costVariance: 101404
  });
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [documentItems, setDocumentItems] = useState<DocumentItem[]>([]);
  
  // Dialog states
  const [isEditingFinancial, setIsEditingFinancial] = useState(false);
  const [isEditingTimeline, setIsEditingTimeline] = useState(false);
  const [isProjectItemDialogOpen, setIsProjectItemDialogOpen] = useState(false);
  const [isGalleryDialogOpen, setIsGalleryDialogOpen] = useState(false);
  const [isDocumentDialogOpen, setIsDocumentDialogOpen] = useState(false);
  const [isFullScreenImageOpen, setIsFullScreenImageOpen] = useState(false);
  
  // Form states
  const [selectedItem, setSelectedItem] = useState<ProjectItem | null>(null);
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [formData, setFormData] = useState<Partial<ProjectItem>>({});
  const [financialFormData, setFinancialFormData] = useState<Partial<FinancialAllocation>>({});
  const [galleryFormData, setGalleryFormData] = useState({ file: null as File | null, remarks: '' });
  const [documentFormData, setDocumentFormData] = useState({ file: null as File | null, remarks: '' });
  
  // Permissions
  const canEdit = userRole === 'Admin';
  const canAdd = userRole === 'Admin' || userRole === 'Staff';
  const canDelete = userRole === 'Admin';

  // Initialize data
  useEffect(() => {
    loadProjectData();
  }, [project.id]);

  const loadProjectData = () => {
    // Sample project items with complete attributes
    setProjectItems([
      {
        id: 'P001',
        description: 'Site preparation and excavation work including final clearing and soil preparation for the main building foundation',
        progress: 100,
        quantity: 500,
        unit: 'sq.m',
        estimatedMaterialCost: 150000,
        estimatedLaborCost: 200000,
        estimatedProjectCost: 350000,
        unitCost: 700,
        variance: -5.2,
        startDate: '2024-03-01',
        endDate: '2024-03-15',
        projectDuration: 15,
        status: 'Completed',
        category: 'Foundation'
      },
      {
        id: 'P002',
        description: 'Foundation and concrete work for main building including excavation, reinforcement, and concrete pouring as per specifications',
        progress: 85,
        quantity: 200,
        unit: 'cu.m',
        estimatedMaterialCost: 800000,
        estimatedLaborCost: 400000,
        estimatedProjectCost: 1200000,
        unitCost: 6000,
        variance: -3.8,
        startDate: '2024-03-15',
        endDate: '2024-04-15',
        projectDuration: 30,
        status: 'In Progress',
        category: 'Structure'
      },
      {
        id: 'P003',
        description: 'Steel framework installation and structural steel works for the main building superstructure including connections and reinforcement',
        progress: 45,
        quantity: 50,
        unit: 'tons',
        estimatedMaterialCost: 2000000,
        estimatedLaborCost: 800000,
        estimatedProjectCost: 2800000,
        unitCost: 56000,
        variance: -1.2,
        startDate: '2024-04-01',
        endDate: '2024-04-25',
        projectDuration: 25,
        status: 'In Progress',
        category: 'Framework'
      },
      {
        id: 'P004',
        description: 'Electrical and mechanical systems installation including HVAC, lighting, and power distribution systems',
        progress: 0,
        quantity: 1,
        unit: 'lot',
        estimatedMaterialCost: 1500000,
        estimatedLaborCost: 600000,
        estimatedProjectCost: 2100000,
        unitCost: 2100000,
        variance: 0.6,
        startDate: '2024-04-25',
        endDate: '2024-05-15',
        projectDuration: 20,
        status: 'Pending',
        category: 'MEP'
      }
    ]);

    // Sample gallery items
    setGalleryItems([
      {
        id: 'G001',
        filename: 'site_preparation_01.jpg',
        url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800',
        remarks: 'Initial site clearing and preparation phase',
        dateUploaded: '2024-03-01',
        uploadedBy: 'Elena Vasquez'
      },
      {
        id: 'G002',
        filename: 'foundation_work_01.jpg',
        url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800',
        remarks: 'Foundation concrete pouring in progress',
        dateUploaded: '2024-03-15',
        uploadedBy: 'Maria Santos'
      }
    ]);

    // Sample document items
    setDocumentItems([
      {
        id: 'D001',
        filename: 'Project_Blueprint_v2.pdf',
        fileType: 'PDF',
        fileSize: '2.3 MB',
        url: '#',
        remarks: 'Official project blueprint and technical specifications',
        dateUploaded: '2024-02-28',
        uploadedBy: 'Elena Vasquez'
      },
      {
        id: 'D002',
        filename: 'Safety_Protocols.docx',
        fileType: 'DOCX',
        fileSize: '156 KB',
        url: '#',
        remarks: 'Safety guidelines and protocols for construction site',
        dateUploaded: '2024-03-01',
        uploadedBy: 'Safety Officer'
      }
    ]);
  };

  // CRUD Operations
  const handleProjectItemSave = () => {
    if (!formData.id || !formData.description) {
      toast.error('Please fill in required fields');
      return;
    }

    // Calculate derived values
    const materialCost = formData.estimatedMaterialCost || 0;
    const laborCost = formData.estimatedLaborCost || 0;
    const projectCost = materialCost + laborCost;
    const unitCost = projectCost / (formData.quantity || 1);
    const duration = formData.startDate && formData.endDate 
      ? Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24))
      : formData.projectDuration || 0;

    const itemData: ProjectItem = {
      id: formData.id!,
      description: formData.description!,
      progress: formData.progress || 0,
      quantity: formData.quantity || 0,
      unit: formData.unit || '',
      estimatedMaterialCost: materialCost,
      estimatedLaborCost: laborCost,
      estimatedProjectCost: projectCost,
      unitCost: unitCost,
      variance: formData.variance || 0,
      startDate: formData.startDate || '',
      endDate: formData.endDate || '',
      projectDuration: duration,
      status: formData.status || 'Pending',
      category: formData.category || ''
    };

    if (selectedItem) {
      // Update existing item
      setProjectItems(prev => prev.map(item => 
        item.id === selectedItem.id ? itemData : item
      ));
      toast.success('Project item updated successfully');
    } else {
      // Check if ID already exists
      if (projectItems.some(item => item.id === formData.id)) {
        toast.error('Project ID already exists. Please use a different ID.');
        return;
      }
      
      // Add new item
      setProjectItems(prev => [...prev, itemData]);
      toast.success('Project item added successfully');
    }

    setIsProjectItemDialogOpen(false);
    setSelectedItem(null);
    setFormData({});
  };

  const handleProjectItemDelete = (id: string) => {
    if (!canDelete) {
      toast.error('Insufficient permissions to delete items');
      return;
    }

    if (confirm('Are you sure you want to delete this item?')) {
      setProjectItems(prev => prev.filter(item => item.id !== id));
      toast.success('Project item deleted successfully');
    }
  };

  const handleFinancialEdit = () => {
    if (!canEdit) {
      toast.error('Insufficient permissions to edit financial data');
      return;
    }

    setFinancialFormData(financialAllocation);
    setIsEditingFinancial(true);
  };

  const handleFinancialSave = () => {
    if (!financialFormData.totalBudget || !financialFormData.physicalAccomplishmentValue) {
      toast.error('Please fill in required fields');
      return;
    }

    const updatedFinancial: FinancialAllocation = {
      totalBudget: financialFormData.totalBudget!,
      physicalAccomplishmentValue: financialFormData.physicalAccomplishmentValue!,
      physicalAccomplishmentPercent: ((financialFormData.physicalAccomplishmentValue! / financialFormData.totalBudget!) * 100),
      budgetUtilization: financialFormData.budgetUtilization || 76.0,
      totalEstimatedCost: financialFormData.totalEstimatedCost || 6450000,
      remainingBudget: financialFormData.totalBudget! - financialFormData.physicalAccomplishmentValue!,
      costVariance: financialFormData.costVariance || 101404
    };

    setFinancialAllocation(updatedFinancial);
    setIsEditingFinancial(false);
    setFinancialFormData({});
    toast.success('Financial allocation updated successfully');
  };

  const handleGalleryUpload = () => {
    if (!galleryFormData.file || !galleryFormData.remarks) {
      toast.error('Please select a file and add remarks');
      return;
    }

    if (!canAdd) {
      toast.error('Insufficient permissions to upload photos');
      return;
    }

    const newItem: GalleryItem = {
      id: `G${Date.now()}`,
      filename: galleryFormData.file.name,
      url: URL.createObjectURL(galleryFormData.file),
      remarks: galleryFormData.remarks,
      dateUploaded: new Date().toISOString().split('T')[0],
      uploadedBy: 'Current User'
    };

    setGalleryItems(prev => [...prev, newItem]);
    setGalleryFormData({ file: null, remarks: '' });
    setIsGalleryDialogOpen(false);
    toast.success('Photo uploaded successfully');
  };

  const handleDocumentUpload = () => {
    if (!documentFormData.file || !documentFormData.remarks) {
      toast.error('Please select a file and add remarks');
      return;
    }

    if (!canAdd) {
      toast.error('Insufficient permissions to upload documents');
      return;
    }

    const newItem: DocumentItem = {
      id: `D${Date.now()}`,
      filename: documentFormData.file.name,
      fileType: documentFormData.file.name.split('.').pop()?.toUpperCase() || 'FILE',
      fileSize: `${(documentFormData.file.size / 1024).toFixed(1)} KB`,
      url: URL.createObjectURL(documentFormData.file),
      remarks: documentFormData.remarks,
      dateUploaded: new Date().toISOString().split('T')[0],
      uploadedBy: 'Current User'
    };

    setDocumentItems(prev => [...prev, newItem]);
    setDocumentFormData({ file: null, remarks: '' });
    setIsDocumentDialogOpen(false);
    toast.success('Document uploaded successfully');
  };

  const handleGalleryDelete = (id: string) => {
    if (!canDelete) {
      toast.error('Insufficient permissions to delete photos');
      return;
    }

    if (confirm('Are you sure you want to delete this photo?')) {
      setGalleryItems(prev => prev.filter(item => item.id !== id));
      toast.success('Photo deleted successfully');
    }
  };

  const handleDocumentDelete = (id: string) => {
    if (!canDelete) {
      toast.error('Insufficient permissions to delete documents');
      return;
    }

    if (confirm('Are you sure you want to delete this document?')) {
      setDocumentItems(prev => prev.filter(item => item.id !== id));
      toast.success('Document deleted successfully');
    }
  };

  // Utility functions
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return 'text-green-600';
    if (variance < -5) return 'text-red-600';
    return 'text-yellow-600';
  };

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short', 
      day: 'numeric'
    });
  };

  return (
    <div className="h-full overflow-auto bg-gray-50">
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1>{project.projectName}</h1>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Ongoing
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">
              {project.description || 'Dry wall partitioning for additional classroom and office spaces'}
            </p>
          </div>
        </div>

        {/* Enhanced Header Cards - Formal Design */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building className="w-6 h-6 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-wide text-blue-600 mb-1">Category</p>
                  <h3 className="text-blue-900 mb-1">Construction</h3>
                  <p className="text-xs text-blue-700">Project Type</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-green-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-wide text-green-600 mb-1">Location</p>
                  <h3 className="text-green-900 mb-1">{project.location || 'New CEGS Building'}</h3>
                  <p className="text-xs text-green-700">Project Site</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-purple-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-wide text-purple-600 mb-1">Contractor</p>
                  <h3 className="text-purple-900 mb-1">{project.contractor || 'Partition Pro Builders'}</h3>
                  <p className="text-xs text-purple-700">Implementation Partner</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-wide text-orange-600 mb-1">Duration</p>
                  <h3 className="text-orange-900 mb-1">Sep 1, 2024 - Jan 15, 2025</h3>
                  <p className="text-xs text-orange-700">Project Timeline</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 bg-white">
            <TabsTrigger value="overview" className="gap-2">
              <Eye className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="project-list" className="gap-2">
              <FileText className="w-4 h-4" />
              Project List
              <Badge variant="secondary" className="ml-1">{projectItems.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="gallery" className="gap-2">
              <Camera className="w-4 h-4" />
              Gallery  
              <Badge variant="secondary" className="ml-1">{galleryItems.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="documents" className="gap-2">
              <FileText className="w-4 h-4" />
              Documents
              <Badge variant="secondary" className="ml-1">{documentItems.length}</Badge>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Financial Allocation */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Calculator className="w-5 h-5" />
                        Financial Allocation
                      </CardTitle>
                      <CardDescription>
                        Comprehensive budget breakdown and allocation analysis
                      </CardDescription>
                    </div>
                    {canEdit && (
                      <Button variant="outline" size="sm" onClick={handleFinancialEdit}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Financial Metrics Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Total Budget</p>
                        <p className="font-semibold">{formatCurrency(financialAllocation.totalBudget)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Total Estimated Cost</p>
                        <p className="font-semibold text-purple-600">{formatCurrency(financialAllocation.totalEstimatedCost)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Physical Accomplishment (Value)</p>
                        <p className="font-semibold text-green-600">{formatCurrency(financialAllocation.physicalAccomplishmentValue)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Budget Utilization</p>
                        <p className="font-semibold">{financialAllocation.budgetUtilization.toFixed(1)}%</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Physical Accomplishment (%)</p>
                        <p className="font-semibold text-blue-600">{financialAllocation.physicalAccomplishmentPercent.toFixed(1)}%</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Cost Variance</p>
                        <p className="font-semibold text-red-600">{formatCurrency(financialAllocation.costVariance)} over</p>
                      </div>
                      <div className="space-y-1 col-span-2">
                        <p className="text-sm text-muted-foreground">Remaining Budget</p>
                        <p className="font-semibold text-orange-600">{formatCurrency(financialAllocation.remainingBudget)}</p>
                      </div>
                    </div>

                    {/* Budget Utilization Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Budget Utilization Progress</span>
                        <span>{financialAllocation.budgetUtilization.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-black h-3 rounded-full transition-all duration-300" 
                          style={{ width: `${financialAllocation.budgetUtilization}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Quick Statistics */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-green-100 rounded-lg">
                        <div className="font-bold text-green-800">
                          {projectItems.filter(item => item.status === 'Completed').length}
                        </div>
                        <p className="text-xs text-green-700">Completed</p>
                      </div>
                      <div className="text-center p-3 bg-blue-100 rounded-lg">
                        <div className="font-bold text-blue-800">
                          {projectItems.filter(item => item.status === 'In Progress').length}
                        </div>
                        <p className="text-xs text-blue-700">In Progress</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="text-center">
                      <div className="font-bold">25.0%</div>
                      <p className="text-sm text-muted-foreground">Completion Rate</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Financial Summary */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Financial Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center p-4 bg-green-100 rounded-lg">
                      <div className="font-bold text-green-800">
                        {financialAllocation.physicalAccomplishmentPercent.toFixed(1)}%
                      </div>
                      <p className="text-sm text-green-700">Physical Accomplishments</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Monetary Value</p>
                        <p className="font-bold">{formatCurrency(financialAllocation.physicalAccomplishmentValue)}</p>
                      </div>
                      
                      <Separator />
                      
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Budget Utilization</p>
                        <p className="font-semibold">{financialAllocation.budgetUtilization.toFixed(1)}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Team Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Team Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3 p-2">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs">EV</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm">Elena Vasquez</p>
                        <p className="text-xs text-muted-foreground">Project Manager</p>
                      </div>
                      <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                    </div>
                    <div className="flex items-center gap-3 p-2">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs">MS</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm">Maria Santos</p>
                        <p className="text-xs text-muted-foreground">Civil Engineer</p>
                      </div>
                      <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                    </div>
                    <div className="flex items-center gap-3 p-2">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs">JC</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm">Juan Dela Cruz</p>
                        <p className="text-xs text-muted-foreground">Civil Engineer</p>
                      </div>
                      <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                    </div>
                    
                    <Separator />
                    
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      View All Team Members
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Project Timeline & Remaining Days - Full Width */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Project Timeline & Remaining Days
                  </CardTitle>
                  <CardDescription>
                    Individual project schedules and remaining time for ongoing projects
                  </CardDescription>
                </div>
                {canEdit && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsEditingTimeline(true)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Overall Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Overall Progress</span>
                    <span>76%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-black h-3 rounded-full" style={{ width: '76%' }} />
                  </div>
                </div>

                {/* Timeline Info */}
                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div className="text-center">
                    <p className="text-sm">Project Start</p>
                    <p className="text-sm text-muted-foreground">01/09/2024</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm">Target End</p>
                    <p className="text-sm text-muted-foreground">15/01/2025</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm">Status</p>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">Ongoing</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Individual Project Timeline Status */}
            <Card>
              <CardHeader>
                <CardTitle>Individual Project Timeline Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {projectItems.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{item.id}</span>
                          <Badge variant="secondary" className={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        <div className="font-semibold">{item.progress}%</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Start:</span>
                        <p className="font-medium">{formatDate(item.startDate)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">End:</span>
                        <p className="font-medium">{formatDate(item.endDate)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Duration:</span>
                        <p className="font-medium">{item.projectDuration} days</p>
                      </div>
                    </div>

                    <Progress value={item.progress} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Project Status Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Project Status Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-100 rounded-lg">
                    <div className="font-bold text-green-800">
                      {projectItems.filter(item => item.status === 'Completed').length}
                    </div>
                    <p className="text-sm text-green-700">Completed</p>
                  </div>
                  <div className="text-center p-4 bg-blue-100 rounded-lg">
                    <div className="font-bold text-blue-800">
                      {projectItems.filter(item => item.status === 'In Progress').length}
                    </div>
                    <p className="text-sm text-blue-700">In Progress</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-100 rounded-lg">
                    <div className="font-bold text-yellow-800">
                      {projectItems.filter(item => item.status === 'Pending').length}
                    </div>
                    <p className="text-sm text-yellow-700">Pending</p>
                  </div>
                  <div className="text-center p-4 bg-gray-100 rounded-lg">
                    <div className="font-bold text-gray-800">{projectItems.length}</div>
                    <p className="text-sm text-gray-700">Total Items</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Budget vs Physical Accomplishment */}
              <Card>
                <CardHeader>
                  <CardTitle>Budget vs Physical Accomplishment</CardTitle>
                  <CardDescription>
                    Comparing total budget allocation with physical accomplishment value
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <ComposedChart data={[
                      { name: 'Mar 2024', budget: 1000, physical: 900 },
                      { name: 'Apr 2024', budget: 5000, physical: 4200 },
                      { name: 'May 2024', budget: 12000, physical: 11200 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`₱${value}`, 'Amount']} />
                      <Bar dataKey="budget" fill="var(--chart-1)" name="Budget" />
                      <Line type="monotone" dataKey="physical" stroke="var(--chart-2)" strokeWidth={3} name="Physical" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Cost Breakdown Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Cost Breakdown Analysis</CardTitle>
                  <CardDescription>
                    Material vs Labor costs across project items
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={projectItems.map(item => ({
                      name: item.id,
                      material: item.estimatedMaterialCost,
                      labor: item.estimatedLaborCost
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => `₱${(value/1000)}K`} />
                      <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Cost']} />
                      <Legend />
                      <Bar dataKey="material" fill="var(--chart-3)" name="Material" />
                      <Bar dataKey="labor" fill="var(--chart-4)" name="Labor" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Project Variance Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Variance Analysis</CardTitle>
                  <CardDescription>
                    Budget variance across individual project items
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={projectItems.map(item => ({
                      name: item.id,
                      variance: item.variance
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value}%`, 'Variance']} />
                      <Bar dataKey="variance" fill="var(--chart-5)" name="Variance %" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Progress Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Progress Timeline</CardTitle>
                  <CardDescription>
                    Project items progress tracking over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={projectItems.map(item => ({
                      name: item.id,
                      progress: item.progress
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip formatter={(value) => [`${value}%`, 'Progress']} />
                      <Line 
                        type="monotone" 
                        dataKey="progress" 
                        stroke="var(--chart-1)" 
                        strokeWidth={3}
                        dot={{ fill: 'var(--chart-1)', r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Comprehensive Financial Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Comprehensive Financial Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-4">
                  <div className="text-center p-4 bg-blue-100 rounded-lg">
                    <div className="font-bold text-blue-800">{formatCurrency(financialAllocation.totalBudget)}</div>
                    <p className="text-xs text-blue-700">Total Budget</p>
                  </div>
                  <div className="text-center p-4 bg-green-100 rounded-lg">
                    <div className="font-bold text-green-800">{formatCurrency(financialAllocation.physicalAccomplishmentValue)}</div>
                    <p className="text-xs text-green-700">Physical Value</p>
                  </div>
                  <div className="text-center p-4 bg-purple-100 rounded-lg">
                    <div className="font-bold text-purple-800">{formatCurrency(financialAllocation.totalEstimatedCost)}</div>
                    <p className="text-xs text-purple-700">Estimated Cost</p>
                  </div>
                  <div className="text-center p-4 bg-orange-100 rounded-lg">
                    <div className="font-bold text-orange-800">{formatCurrency(financialAllocation.remainingBudget)}</div>
                    <p className="text-xs text-orange-700">Remaining Budget</p>
                  </div>
                  <div className="text-center p-4 bg-red-100 rounded-lg">
                    <div className="font-bold text-red-800">{formatCurrency(financialAllocation.costVariance)}</div>
                    <p className="text-xs text-red-700">Cost Variance</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enhanced Project List Tab */}
          <TabsContent value="project-list" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Project Items</CardTitle>
                    <CardDescription>
                      Manage project items with comprehensive details • 1-{projectItems.length} of {projectItems.length} items
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <LayoutGrid className="w-4 h-4" />
                      <Switch 
                        checked={viewMode === 'table'} 
                        onCheckedChange={(checked) => setViewMode(checked ? 'table' : 'card')}
                      />
                      <List className="w-4 h-4" />
                      <span>{viewMode === 'card' ? 'Card View' : 'List View'}</span>
                    </div>
                    {canAdd && (
                      <Button 
                        onClick={() => {
                          setSelectedItem(null);
                          setFormData({});
                          setIsProjectItemDialogOpen(true);
                        }}
                        className="gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Item
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {viewMode === 'card' ? (
                  // Card View
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {projectItems.map((item) => (
                      <Card key={item.id} className="relative">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{item.id}</h4>
                              <Badge variant="secondary" className={getStatusColor(item.status)}>
                                {item.status}
                              </Badge>
                            </div>
                            <div className="flex gap-1">
                              {canEdit && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {
                                    setSelectedItem(item);
                                    setFormData(item);
                                    setIsProjectItemDialogOpen(true);
                                  }}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              )}
                              {canDelete && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleProjectItemDelete(item.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                          
                          <div className="space-y-2 mb-3">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>{item.progress}%</span>
                            </div>
                            <Progress value={item.progress} className="h-2" />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div><span className="text-muted-foreground">Quantity:</span> {item.quantity} {item.unit}</div>
                            <div><span className="text-muted-foreground">Duration:</span> {item.projectDuration} days</div>
                            <div><span className="text-muted-foreground">Material:</span> {formatCurrency(item.estimatedMaterialCost)}</div>
                            <div><span className="text-muted-foreground">Labor:</span> {formatCurrency(item.estimatedLaborCost)}</div>
                            <div><span className="text-muted-foreground">Total:</span> {formatCurrency(item.estimatedProjectCost)}</div>
                            <div><span className="text-muted-foreground">Variance:</span> 
                              <span className={getVarianceColor(item.variance)}> {item.variance > 0 ? '+' : ''}{item.variance}%</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  // Table View
                  <div className="space-y-4">
                    {/* Search and Filter */}
                    <div className="flex items-center justify-between">
                      <Input 
                        placeholder="Search by enumeration, description, or responsible person..."
                        className="max-w-md"
                      />
                      <Select defaultValue="all-status">
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all-status">All Status</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Project Items Table */}
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">#</TableHead>
                            <TableHead className="min-w-96">Description</TableHead>
                            <TableHead className="text-center w-20">Progress %</TableHead>
                            <TableHead className="text-center w-20">Duration</TableHead>
                            <TableHead className="text-center w-20">Quantity</TableHead>
                            <TableHead className="text-center w-16">Unit</TableHead>
                            <TableHead className="text-right w-32">Material Cost</TableHead>
                            <TableHead className="text-right w-32">Labor Cost</TableHead>
                            <TableHead className="text-right w-32">Project Cost</TableHead>
                            <TableHead className="text-right w-32">Unit Cost</TableHead>
                            <TableHead className="text-center w-20">Variance</TableHead>
                            <TableHead className="text-center w-24">Timeline</TableHead>
                            <TableHead className="text-center w-32">Remaining</TableHead>
                            <TableHead className="text-center w-20">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {projectItems.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-semibold">{item.id}</TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{item.description}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="secondary" className={getStatusColor(item.status)}>
                                      {item.status}
                                    </Badge>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="space-y-1">
                                  <div className="flex justify-center">
                                    <span className="font-medium">{item.progress}%</span>
                                  </div>
                                  <Progress value={item.progress} className="h-1 w-16 mx-auto" />
                                </div>
                              </TableCell>
                              <TableCell className="text-center">{item.projectDuration} days</TableCell>
                              <TableCell className="text-center">{item.quantity}</TableCell>
                              <TableCell className="text-center">{item.unit}</TableCell>
                              <TableCell className="text-right">{formatCurrency(item.estimatedMaterialCost)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(item.estimatedLaborCost)}</TableCell>
                              <TableCell className="text-right font-medium">{formatCurrency(item.estimatedProjectCost)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(item.unitCost)}</TableCell>
                              <TableCell className="text-center">
                                <span className={getVarianceColor(item.variance)}>
                                  {item.variance > 0 ? '+' : ''}{item.variance}
                                </span>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="text-sm">
                                  <p>{formatDate(item.startDate).replace(', 2024', '')}</p>
                                  <p className="text-muted-foreground">{formatDate(item.endDate).replace(', 2024', '')}</p>
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <span className={item.status === 'Completed' ? 'text-green-600' : 'text-red-600'}>
                                  {item.status === 'Completed' ? '✓ Done' : `${Math.abs(item.variance * 100)} days over`}
                                </span>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex justify-center gap-1">
                                  {canEdit && (
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => {
                                        setSelectedItem(item);
                                        setFormData(item);
                                        setIsProjectItemDialogOpen(true);
                                      }}
                                    >
                                      <Edit className="w-3 h-3" />
                                    </Button>
                                  )}
                                  {canDelete && (
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => handleProjectItemDelete(item.id)}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Project Summary */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Project Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-4 gap-4">
                          <div className="text-center p-4 bg-blue-100 rounded-lg">
                            <div className="font-bold text-blue-800">
                              {formatCurrency(projectItems.reduce((sum, item) => sum + item.estimatedMaterialCost, 0))}
                            </div>
                            <p className="text-sm text-blue-700">Material Costs</p>
                          </div>
                          <div className="text-center p-4 bg-green-100 rounded-lg">
                            <div className="font-bold text-green-800">
                              {formatCurrency(projectItems.reduce((sum, item) => sum + item.estimatedLaborCost, 0))}
                            </div>
                            <p className="text-sm text-green-700">Labor Costs</p>
                          </div>
                          <div className="text-center p-4 bg-purple-100 rounded-lg">
                            <div className="font-bold text-purple-800">
                              {formatCurrency(projectItems.reduce((sum, item) => sum + item.estimatedProjectCost, 0))}
                            </div>
                            <p className="text-sm text-purple-700">Total Cost</p>
                          </div>
                          <div className="text-center p-4 bg-orange-100 rounded-lg">
                            <div className="font-bold text-orange-800">
                              {((projectItems.reduce((sum, item) => sum + item.variance, 0) / projectItems.length) || 0).toFixed(1)}%
                            </div>
                            <p className="text-sm text-orange-700">Avg Variance</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Camera className="w-5 h-5" />
                      Project Gallery
                    </CardTitle>
                    <CardDescription>Project photos and visual documentation</CardDescription>
                  </div>
                  {canAdd && (
                    <Button onClick={() => setIsGalleryDialogOpen(true)} className="gap-2">
                      <Upload className="w-4 h-4" />
                      Add Photo
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {galleryItems.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {galleryItems.map((item) => (
                      <Card key={item.id} className="overflow-hidden group cursor-pointer">
                        <div 
                          className="aspect-video relative"
                          onClick={() => {
                            setSelectedImage(item);
                            setIsFullScreenImageOpen(true);
                          }}
                        >
                          <img 
                            src={item.url} 
                            alt={item.filename}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          {canDelete && (
                            <Button
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleGalleryDelete(item.id);
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                        <CardContent className="p-3">
                          <h4 className="text-sm truncate">{item.filename}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{item.remarks}</p>
                          <div className="flex justify-between text-xs text-muted-foreground mt-2">
                            <span>{formatDate(item.dateUploaded)}</span>
                            <span>{item.uploadedBy}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="mb-2">No photos yet</h3>
                    <p className="text-muted-foreground mb-4">Start documenting your project progress</p>
                    {canAdd && (
                      <Button onClick={() => setIsGalleryDialogOpen(true)}>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload First Photo
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Project Documents
                    </CardTitle>
                    <CardDescription>Important files and documentation</CardDescription>
                  </div>
                  {canAdd && (
                    <Button onClick={() => setIsDocumentDialogOpen(true)} className="gap-2">
                      <Upload className="w-4 h-4" />
                      Add Document
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {documentItems.length > 0 ? (
                  <div className="space-y-3">
                    {documentItems.map((item) => (
                      <Card key={item.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <div className="p-2 bg-blue-100 rounded-md">
                              <FileIcon className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium truncate">{item.filename}</h4>
                                  <p className="text-sm text-muted-foreground mt-1">{item.remarks}</p>
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                                    <span>{item.fileType}</span>
                                    <span>{item.fileSize}</span>
                                    <span>{formatDate(item.dateUploaded)}</span>
                                    <span>by {item.uploadedBy}</span>
                                  </div>
                                </div>
                                <div className="flex gap-1 ml-2">
                                  <Button variant="outline" size="sm">
                                    <Download className="w-4 h-4" />
                                  </Button>
                                  {canDelete && (
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleDocumentDelete(item.id)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="mb-2">No documents yet</h3>
                    <p className="text-muted-foreground mb-4">Upload project files and documentation</p>
                    {canAdd && (
                      <Button onClick={() => setIsDocumentDialogOpen(true)}>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload First Document
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* DIALOGS */}

        {/* Financial Edit Dialog */}
        <Dialog open={isEditingFinancial} onOpenChange={setIsEditingFinancial}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Financial Allocation</DialogTitle>
              <DialogDescription>Update budget allocation and financial data</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="total-budget">Total Budget</Label>
                <Input
                  id="total-budget"
                  type="number"
                  value={financialFormData.totalBudget || ''}
                  onChange={(e) => setFinancialFormData({...financialFormData, totalBudget: Number(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="physical-value">Physical Accomplishment Value</Label>
                <Input
                  id="physical-value"
                  type="number"
                  value={financialFormData.physicalAccomplishmentValue || ''}
                  onChange={(e) => setFinancialFormData({...financialFormData, physicalAccomplishmentValue: Number(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget-util">Budget Utilization (%)</Label>
                <Input
                  id="budget-util"
                  type="number"
                  value={financialFormData.budgetUtilization || ''}
                  onChange={(e) => setFinancialFormData({...financialFormData, budgetUtilization: Number(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimated-cost">Total Estimated Cost</Label>
                <Input
                  id="estimated-cost"
                  type="number"
                  value={financialFormData.totalEstimatedCost || ''}
                  onChange={(e) => setFinancialFormData({...financialFormData, totalEstimatedCost: Number(e.target.value)})}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="cost-variance">Cost Variance</Label>
                <Input
                  id="cost-variance"
                  type="number"
                  value={financialFormData.costVariance || ''}
                  onChange={(e) => setFinancialFormData({...financialFormData, costVariance: Number(e.target.value)})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditingFinancial(false)}>Cancel</Button>
              <Button onClick={handleFinancialSave}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Project Item Dialog */}
        <Dialog open={isProjectItemDialogOpen} onOpenChange={setIsProjectItemDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedItem ? 'Edit' : 'Add'} Project Item</DialogTitle>
              <DialogDescription>
                {selectedItem ? 'Update' : 'Create'} project item with complete specifications
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="item-id">Project ID</Label>
                  <Input
                    id="item-id"
                    value={formData.id || ''}
                    onChange={(e) => setFormData({...formData, id: e.target.value})}
                    placeholder="P005"
                    disabled={!!selectedItem}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="item-description">Description</Label>
                  <Textarea
                    id="item-description"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Project description"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="item-quantity">Quantity</Label>
                    <Input
                      id="item-quantity"
                      type="number"
                      value={formData.quantity || ''}
                      onChange={(e) => setFormData({...formData, quantity: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="item-unit">Unit</Label>
                    <Select 
                      value={formData.unit || ''} 
                      onValueChange={(value) => setFormData({...formData, unit: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sq.m">sq.m</SelectItem>
                        <SelectItem value="cu.m">cu.m</SelectItem>
                        <SelectItem value="tons">tons</SelectItem>
                        <SelectItem value="lot">lot</SelectItem>
                        <SelectItem value="pcs">pcs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="item-category">Category</Label>
                  <Select 
                    value={formData.category || ''} 
                    onValueChange={(value) => setFormData({...formData, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Foundation">Foundation</SelectItem>
                      <SelectItem value="Structure">Structure</SelectItem>
                      <SelectItem value="Framework">Framework</SelectItem>
                      <SelectItem value="MEP">MEP</SelectItem>
                      <SelectItem value="Finishing">Finishing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="material-cost">Estimated Material Cost</Label>
                    <Input
                      id="material-cost"
                      type="number"
                      value={formData.estimatedMaterialCost || ''}
                      onChange={(e) => setFormData({...formData, estimatedMaterialCost: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="labor-cost">Estimated Labor Cost</Label>
                    <Input
                      id="labor-cost"
                      type="number"
                      value={formData.estimatedLaborCost || ''}
                      onChange={(e) => setFormData({...formData, estimatedLaborCost: Number(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="variance">Variance (%)</Label>
                    <Input
                      id="variance"
                      type="number"
                      step="0.1"
                      value={formData.variance || ''}
                      onChange={(e) => setFormData({...formData, variance: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="progress">Progress (%)</Label>
                    <Input
                      id="progress"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.progress || ''}
                      onChange={(e) => setFormData({...formData, progress: Number(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={formData.startDate || ''}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-date">End Date</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={formData.endDate || ''}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status || ''} 
                    onValueChange={(value) => setFormData({...formData, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsProjectItemDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleProjectItemSave}>
                {selectedItem ? 'Update' : 'Create'} Item
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Gallery Upload Dialog */}
        <Dialog open={isGalleryDialogOpen} onOpenChange={setIsGalleryDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Photo</DialogTitle>
              <DialogDescription>Add a new photo to the project gallery</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="photo-file">Photo</Label>
                <Input
                  id="photo-file"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setGalleryFormData({...galleryFormData, file: e.target.files?.[0] || null})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="photo-remarks">Remarks</Label>
                <Textarea
                  id="photo-remarks"
                  value={galleryFormData.remarks}
                  onChange={(e) => setGalleryFormData({...galleryFormData, remarks: e.target.value})}
                  placeholder="Describe what this photo shows..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsGalleryDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleGalleryUpload}>Upload Photo</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Document Upload Dialog */}
        <Dialog open={isDocumentDialogOpen} onOpenChange={setIsDocumentDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
              <DialogDescription>Add a new document to the project files</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="doc-file">Document</Label>
                <Input
                  id="doc-file"
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                  onChange={(e) => setDocumentFormData({...documentFormData, file: e.target.files?.[0] || null})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doc-remarks">Remarks</Label>
                <Textarea
                  id="doc-remarks"
                  value={documentFormData.remarks}
                  onChange={(e) => setDocumentFormData({...documentFormData, remarks: e.target.value})}
                  placeholder="Describe the document and its purpose..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDocumentDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleDocumentUpload}>Upload Document</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Full Screen Image Dialog */}
        <Dialog open={isFullScreenImageOpen} onOpenChange={setIsFullScreenImageOpen}>
          <DialogContent className="max-w-6xl w-full h-[90vh] p-0">
            <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
              {selectedImage && (
                <>
                  <img
                    src={selectedImage.url}
                    alt={selectedImage.filename}
                    className="w-full h-full object-contain"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsFullScreenImageOpen(false)}
                    className="absolute top-4 right-4 text-white hover:bg-white/20"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
                    <h3 className="mb-2">{selectedImage.filename}</h3>
                    <p className="text-gray-200 text-sm mb-2">{selectedImage.remarks}</p>
                    <div className="flex justify-between text-xs text-gray-300">
                      <span>Uploaded: {formatDate(selectedImage.dateUploaded)}</span>
                      <span>By: {selectedImage.uploadedBy}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}