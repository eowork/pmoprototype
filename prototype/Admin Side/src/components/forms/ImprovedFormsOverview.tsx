/**
 * Improved Forms Overview - Formal, Professional Design
 * Matches design consistency with University Operations and COI pages
 * Enhanced UI/UX with better organization and visual hierarchy
 */
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { 
  Download, FileText, Search, CheckCircle, 
  Building2, Wrench, Users, BookOpen, FileCheck, 
  FolderOpen, ArrowRight, FileDown, Clock, Eye,
  Hammer, GraduationCap, Scale, Filter, TrendingUp,
  Package, Calendar, BarChart3
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ImprovedFormsOverviewProps {
  userRole: string;
  onNavigate: (page: string) => void;
  requireAuth: (action: string) => boolean;
}

// Enhanced form categories with detailed information
const FORM_CATEGORIES_DATA = {
  'university-operations': {
    id: 'university-operations',
    title: 'University Operations',
    icon: Building2,
    description: 'Forms for higher education, advanced education, research, and extension programs',
    color: 'blue',
    forms: [
      {
        id: 'higher-ed-assessment',
        title: 'Higher Education Program Assessment Form',
        description: 'Quarterly assessment form for higher education programs',
        category: 'University Operations',
        subcategory: 'Higher Education',
        fileSize: '1.8 MB',
        lastUpdated: '2024-01-20',
        downloads: 156
      },
      {
        id: 'advanced-ed-assessment',
        title: 'Advanced Education Program Assessment Form',
        description: 'Assessment form for graduate and advanced education programs',
        category: 'University Operations',
        subcategory: 'Advanced Education',
        fileSize: '1.9 MB',
        lastUpdated: '2024-01-18',
        downloads: 142
      },
      {
        id: 'research-assessment',
        title: 'Research Program Assessment Form',
        description: 'Research program monitoring and evaluation form',
        category: 'University Operations',
        subcategory: 'Research',
        fileSize: '2.1 MB',
        lastUpdated: '2024-01-15',
        downloads: 189
      },
      {
        id: 'extension-assessment',
        title: 'Technical Advisory & Extension Assessment Form',
        description: 'Extension program assessment and monitoring form',
        category: 'University Operations',
        subcategory: 'Extension',
        fileSize: '1.7 MB',
        lastUpdated: '2024-01-22',
        downloads: 134
      }
    ]
  },
  'construction-infrastructure': {
    id: 'construction-infrastructure',
    title: 'Construction Infrastructure',
    icon: Hammer,
    description: 'Forms related to construction projects, infrastructure development, and facilities',
    color: 'orange',
    forms: [
      {
        id: 'pow-template',
        title: 'Program of Works (POW) Template',
        description: 'Standardized template for construction program of works',
        category: 'Construction Infrastructure',
        subcategory: 'Planning',
        fileSize: '2.3 MB',
        lastUpdated: '2024-01-25',
        downloads: 245
      },
      {
        id: 'project-proposal',
        title: 'Construction Project Proposal Form',
        description: 'Comprehensive project proposal form for construction initiatives',
        category: 'Construction Infrastructure',
        subcategory: 'Proposal',
        fileSize: '2.0 MB',
        lastUpdated: '2024-01-20',
        downloads: 198
      },
      {
        id: 'inspection-checklist',
        title: 'Infrastructure Inspection Checklist',
        description: 'Quality assurance checklist for infrastructure projects',
        category: 'Construction Infrastructure',
        subcategory: 'Quality Control',
        fileSize: '1.5 MB',
        lastUpdated: '2024-01-18',
        downloads: 167
      }
    ]
  },
  'repairs': {
    id: 'repairs',
    title: 'Repairs & Maintenance',
    icon: Wrench,
    description: 'Forms for repair requests, maintenance schedules, and facility upkeep',
    color: 'emerald',
    forms: [
      {
        id: 'repair-request',
        title: 'Facility Repair Request Form',
        description: 'Standard form for submitting facility repair requests',
        category: 'Repairs',
        subcategory: 'Requests',
        fileSize: '1.2 MB',
        lastUpdated: '2024-01-24',
        downloads: 312
      },
      {
        id: 'maintenance-schedule',
        title: 'Preventive Maintenance Schedule Template',
        description: 'Template for planning preventive maintenance activities',
        category: 'Repairs',
        subcategory: 'Maintenance',
        fileSize: '1.6 MB',
        lastUpdated: '2024-01-22',
        downloads: 178
      },
      {
        id: 'repair-completion',
        title: 'Repair Completion Report Form',
        description: 'Documentation form for completed repair work',
        category: 'Repairs',
        subcategory: 'Reporting',
        fileSize: '1.4 MB',
        lastUpdated: '2024-01-20',
        downloads: 156
      }
    ]
  },
  'gad': {
    id: 'gad',
    title: 'GAD & Parity',
    icon: Users,
    description: 'Gender and Development forms, parity reports, and compliance documentation',
    color: 'purple',
    forms: [
      {
        id: 'hgdg-16',
        title: 'HGDG-16 Sectoral Forms',
        description: 'Sectoral reporting forms for gender and development activities',
        category: 'GAD Reporting',
        subcategory: 'Sectoral',
        fileSize: '2.1 MB',
        lastUpdated: '2024-01-15',
        downloads: 324
      },
      {
        id: 'gad-budget',
        title: 'GAD Budget Plan Template',
        description: 'Annual GAD budget planning and allocation form',
        category: 'GAD Reporting',
        subcategory: 'Budget',
        fileSize: '1.9 MB',
        lastUpdated: '2024-01-18',
        downloads: 198
      },
      {
        id: 'parity-report',
        title: 'Gender Parity Report Form',
        description: 'Comprehensive gender parity analysis and reporting',
        category: 'GAD Reporting',
        subcategory: 'Analysis',
        fileSize: '2.2 MB',
        lastUpdated: '2024-01-20',
        downloads: 167
      }
    ]
  },
  'classroom-admin': {
    id: 'classroom-admin',
    title: 'Classroom & Administrative Assessment',
    icon: GraduationCap,
    description: 'Assessment forms for classrooms, administrative offices, and facilities',
    color: 'cyan',
    forms: [
      {
        id: 'classroom-assessment',
        title: 'Classroom Assessment Form',
        description: 'Comprehensive classroom facility assessment',
        category: 'Classroom Assessment',
        subcategory: 'Facilities',
        fileSize: '1.7 MB',
        lastUpdated: '2024-01-22',
        downloads: 234
      },
      {
        id: 'admin-office-assessment',
        title: 'Administrative Office Assessment Form',
        description: 'Assessment form for administrative office facilities',
        category: 'Administrative Assessment',
        subcategory: 'Facilities',
        fileSize: '1.8 MB',
        lastUpdated: '2024-01-20',
        downloads: 189
      },
      {
        id: 'prioritization-matrix',
        title: 'Prioritization Matrix Template',
        description: 'Decision matrix for facility improvement prioritization',
        category: 'Assessment Tools',
        subcategory: 'Planning',
        fileSize: '1.5 MB',
        lastUpdated: '2024-01-18',
        downloads: 145
      }
    ]
  },
  'policies': {
    id: 'policies',
    title: 'Policies & Agreements',
    icon: Scale,
    description: 'MOA, MOU, and institutional policy document templates',
    color: 'indigo',
    forms: [
      {
        id: 'moa-template',
        title: 'Memorandum of Agreement Template',
        description: 'Standard template for creating MOA documents',
        category: 'Policies',
        subcategory: 'Agreements',
        fileSize: '1.6 MB',
        lastUpdated: '2024-01-25',
        downloads: 278
      },
      {
        id: 'mou-template',
        title: 'Memorandum of Understanding Template',
        description: 'Standard template for creating MOU documents',
        category: 'Policies',
        subcategory: 'Agreements',
        fileSize: '1.5 MB',
        lastUpdated: '2024-01-25',
        downloads: 256
      },
      {
        id: 'policy-brief',
        title: 'Policy Brief Template',
        description: 'Template for institutional policy documentation',
        category: 'Policies',
        subcategory: 'Documentation',
        fileSize: '1.4 MB',
        lastUpdated: '2024-01-22',
        downloads: 198
      }
    ]
  },
  'others': {
    id: 'others',
    title: 'Other Forms',
    icon: FolderOpen,
    description: 'General forms, templates, and miscellaneous documentation',
    color: 'slate',
    forms: [
      {
        id: 'pimme-checklist',
        title: 'PIMME Checklist',
        description: 'Project implementation monitoring and evaluation checklist',
        category: 'Project Monitoring',
        subcategory: 'Monitoring',
        fileSize: '1.8 MB',
        lastUpdated: '2024-01-10',
        downloads: 287
      },
      {
        id: 'pmo-monthly',
        title: 'PMO Monthly Accomplishment Form',
        description: 'Monthly progress reporting forms for PMO activities',
        category: 'Progress Reporting',
        subcategory: 'Reporting',
        fileSize: '1.5 MB',
        lastUpdated: '2024-01-05',
        downloads: 245
      },
      {
        id: 'evaluation-plan',
        title: 'Evaluation Plan Template',
        description: 'Template for project evaluation planning',
        category: 'Evaluation',
        subcategory: 'Planning',
        fileSize: '2.3 MB',
        lastUpdated: '2023-12-20',
        downloads: 198
      },
      {
        id: 'monitoring-plan',
        title: 'Monitoring Plan Template',
        description: 'Template for project monitoring plans',
        category: 'Monitoring',
        subcategory: 'Planning',
        fileSize: '2.0 MB',
        lastUpdated: '2023-12-18',
        downloads: 123
      },
      {
        id: 'csu-me-plan',
        title: 'CSU M&E Plan Framework',
        description: 'Comprehensive M&E plan framework for CSU',
        category: 'M&E Framework',
        subcategory: 'Framework',
        fileSize: '3.2 MB',
        lastUpdated: '2023-12-15',
        downloads: 70
      }
    ]
  }
};

export function ImprovedFormsOverview({ userRole, onNavigate, requireAuth }: ImprovedFormsOverviewProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Calculate statistics
  const stats = useMemo(() => {
    const totalForms = Object.values(FORM_CATEGORIES_DATA).reduce(
      (sum, category) => sum + category.forms.length, 
      0
    );
    const totalDownloads = Object.values(FORM_CATEGORIES_DATA).reduce(
      (sum, category) => sum + category.forms.reduce((s, f) => s + f.downloads, 0),
      0
    );
    const avgDownloads = Math.round(totalDownloads / totalForms);
    const categories = Object.keys(FORM_CATEGORIES_DATA).length;
    
    return {
      totalForms,
      totalDownloads,
      avgDownloads,
      categories
    };
  }, []);

  // Get all forms for overview tab
  const allForms = useMemo(() => {
    return Object.values(FORM_CATEGORIES_DATA).flatMap(category => 
      category.forms.map(form => ({
        ...form,
        categoryInfo: {
          id: category.id,
          title: category.title,
          icon: category.icon,
          color: category.color
        }
      }))
    );
  }, []);

  // Filter forms based on search and category
  const filteredForms = useMemo(() => {
    let forms = allForms;
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      forms = forms.filter(form => form.categoryInfo.id === categoryFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
      forms = forms.filter(form =>
        form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        form.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        form.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return forms;
  }, [allForms, searchTerm, categoryFilter]);

  const handleDownloadForm = (formId: string, formTitle: string) => {
    if (requireAuth('download forms')) {
      toast.success(`Downloading: ${formTitle}`);
      console.log('Downloading form:', formId);
    }
  };

  const handleNavigateToCategory = (categoryId: string) => {
    setActiveTab(categoryId);
  };

  const handleViewInventory = () => {
    onNavigate('forms-inventory');
  };

  // Render form card with enhanced design
  const renderFormCard = (form: any, showCategory: boolean = false) => {
    const CategoryIcon = showCategory ? form.categoryInfo.icon : FileText;
    
    return (
      <Card key={form.id} className="border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all group">
        <CardContent className="p-5">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-2.5 bg-blue-50 rounded-lg flex-shrink-0 group-hover:bg-blue-100 transition-colors">
              <CategoryIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-gray-900 mb-1.5 line-clamp-1">{form.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">{form.description}</p>
            </div>
          </div>
          
          {showCategory && (
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                {form.category}
              </Badge>
              {form.subcategory && (
                <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 text-xs">
                  {form.subcategory}
                </Badge>
              )}
            </div>
          )}
          
          <div className="flex items-center justify-between text-xs text-gray-500 mb-4 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Package className="w-3 h-3" />
                <span>{form.fileSize}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Download className="w-3 h-3" />
                <span>{form.downloads}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-gray-400">
              <Calendar className="w-3 h-3" />
              <span>{form.lastUpdated}</span>
            </div>
          </div>
          
          <Button 
            size="sm" 
            onClick={() => handleDownloadForm(form.id, form.title)}
            className="w-full bg-blue-600 hover:bg-blue-700 h-9"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Form
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="h-full overflow-auto admin-page-bg">
      <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-6">
        {/* Header Section */}
        <div className="admin-card">
          <div className="p-7 space-y-5">
            {/* Main Header */}
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="p-3.5 bg-blue-50 rounded-lg border border-blue-100">
                  <FileDown className="w-7 h-7 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h1 className="text-gray-900 text-2xl mb-2">
                    Downloadable Forms & Templates
                  </h1>
                  <p className="text-base text-gray-600 leading-relaxed">
                    Official institutional forms, templates, and documentation organized by category
                  </p>
                </div>
              </div>

              <Button 
                variant="outline" 
                onClick={handleViewInventory}
                className="h-10 border-gray-200 hover:bg-gray-50"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Inventory
              </Button>
            </div>

            <Separator />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <Card className="border-0 bg-gradient-to-br from-blue-50 to-white">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-700 mb-1.5">Total Forms</p>
                      <p className="text-2xl text-blue-900">{stats.totalForms}</p>
                      <p className="text-xs text-blue-600 mt-1">Available documents</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 bg-gradient-to-br from-emerald-50 to-white">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-emerald-700 mb-1.5">Categories</p>
                      <p className="text-2xl text-emerald-900">{stats.categories}</p>
                      <p className="text-xs text-emerald-600 mt-1">Form types</p>
                    </div>
                    <div className="p-3 bg-emerald-100 rounded-lg">
                      <FolderOpen className="w-6 h-6 text-emerald-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 bg-gradient-to-br from-purple-50 to-white">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-700 mb-1.5">Total Downloads</p>
                      <p className="text-2xl text-purple-900">{stats.totalDownloads.toLocaleString()}</p>
                      <p className="text-xs text-purple-600 mt-1">All time</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 bg-gradient-to-br from-orange-50 to-white">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-orange-700 mb-1.5">Avg Downloads</p>
                      <p className="text-2xl text-orange-900">{stats.avgDownloads}</p>
                      <p className="text-xs text-orange-600 mt-1">Per form</p>
                    </div>
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <BarChart3 className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Tab Navigation */}
          <div className="admin-card p-1">
            <TabsList className="bg-transparent border-0 p-0 w-full grid grid-cols-4 lg:grid-cols-8 gap-1">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200 border border-transparent py-2.5 text-sm rounded-md"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="university-operations"
                className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200 border border-transparent py-2.5 text-sm rounded-md"
              >
                Univ Ops
              </TabsTrigger>
              <TabsTrigger
                value="construction-infrastructure"
                className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 data-[state=active]:border-orange-200 border border-transparent py-2.5 text-sm rounded-md"
              >
                COI
              </TabsTrigger>
              <TabsTrigger
                value="repairs"
                className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 data-[state=active]:border-emerald-200 border border-transparent py-2.5 text-sm rounded-md"
              >
                Repairs
              </TabsTrigger>
              <TabsTrigger
                value="gad"
                className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 data-[state=active]:border-purple-200 border border-transparent py-2.5 text-sm rounded-md"
              >
                GAD
              </TabsTrigger>
              <TabsTrigger
                value="classroom-admin"
                className="data-[state=active]:bg-cyan-50 data-[state=active]:text-cyan-700 data-[state=active]:border-cyan-200 border border-transparent py-2.5 text-sm rounded-md"
              >
                Classroom
              </TabsTrigger>
              <TabsTrigger
                value="policies"
                className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:border-indigo-200 border border-transparent py-2.5 text-sm rounded-md"
              >
                Policies
              </TabsTrigger>
              <TabsTrigger
                value="others"
                className="data-[state=active]:bg-slate-50 data-[state=active]:text-slate-700 data-[state=active]:border-slate-200 border border-transparent py-2.5 text-sm rounded-md"
              >
                Others
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab - Consolidated View */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="admin-card border-0">
              <CardHeader className="border-b border-gray-100 bg-gradient-to-br from-gray-50 to-white">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl text-gray-900">All Forms Overview</CardTitle>
                    <CardDescription className="text-base mt-1.5">
                      Browse {filteredForms.length} of {allForms.length} available forms across all categories
                    </CardDescription>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="relative w-72">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search forms..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-10"
                      />
                    </div>
                    
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-48 h-10">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {Object.values(FORM_CATEGORIES_DATA).map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-7">
                {/* Category Navigation Cards */}
                <div className="mb-8">
                  <h3 className="text-gray-900 mb-4">Browse by Category</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.values(FORM_CATEGORIES_DATA).map((category) => {
                      const Icon = category.icon;
                      const colorClasses = {
                        blue: 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 hover:border-blue-300',
                        orange: 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100 hover:border-orange-300',
                        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300',
                        purple: 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100 hover:border-purple-300',
                        cyan: 'bg-cyan-50 text-cyan-600 border-cyan-200 hover:bg-cyan-100 hover:border-cyan-300',
                        indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300',
                        slate: 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300',
                      };
                      
                      return (
                        <Card
                          key={category.id}
                          className={`border-2 cursor-pointer transition-all ${colorClasses[category.color as keyof typeof colorClasses]}`}
                          onClick={() => handleNavigateToCategory(category.id)}
                        >
                          <CardContent className="p-5">
                            <div className="flex items-start gap-3 mb-3">
                              <Icon className="w-6 h-6 flex-shrink-0" />
                              <div className="flex-1">
                                <h3 className="text-gray-900 mb-1.5">{category.title}</h3>
                                <p className="text-xs text-gray-600 leading-relaxed mb-3 line-clamp-2">
                                  {category.description}
                                </p>
                                <div className="flex items-center justify-between">
                                  <Badge variant="secondary" className="text-xs">
                                    {category.forms.length} forms
                                  </Badge>
                                  <ArrowRight className="w-4 h-4" />
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                {/* All Forms Grid */}
                <div className="space-y-4">
                  <Separator />
                  <div className="flex items-center justify-between">
                    <h3 className="text-gray-900">
                      {searchTerm || categoryFilter !== 'all' ? 'Filtered Forms' : 'All Available Forms'} ({filteredForms.length})
                    </h3>
                    {(searchTerm || categoryFilter !== 'all') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSearchTerm('');
                          setCategoryFilter('all');
                        }}
                      >
                        Clear Filters
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredForms.map((form) => renderFormCard(form, true))}
                  </div>
                  
                  {filteredForms.length === 0 && (
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No forms found matching your criteria</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSearchTerm('');
                          setCategoryFilter('all');
                        }}
                        className="mt-4"
                      >
                        Clear Filters
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Category-Specific Tabs */}
          {Object.entries(FORM_CATEGORIES_DATA).map(([key, category]) => {
            const Icon = category.icon;
            const colorClasses = {
              blue: 'from-blue-50 to-white',
              orange: 'from-orange-50 to-white',
              emerald: 'from-emerald-50 to-white',
              purple: 'from-purple-50 to-white',
              cyan: 'from-cyan-50 to-white',
              indigo: 'from-indigo-50 to-white',
              slate: 'from-slate-50 to-white',
            };
            
            return (
              <TabsContent key={key} value={key} className="space-y-6">
                <Card className="admin-card border-0">
                  <CardHeader className={`border-b border-gray-100 bg-gradient-to-br ${colorClasses[category.color as keyof typeof colorClasses]}`}>
                    <div className="flex items-center gap-4">
                      <div className={`p-3 bg-${category.color}-100 rounded-xl`}>
                        <Icon className={`w-7 h-7 text-${category.color}-600`} />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-gray-900">{category.title}</CardTitle>
                        <CardDescription className="text-base mt-1.5">{category.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-7">
                    <div className="mb-4">
                      <p className="text-sm text-gray-600">
                        Showing {category.forms.length} forms in this category
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {category.forms.map((form) => renderFormCard(form))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </div>
  );
}
