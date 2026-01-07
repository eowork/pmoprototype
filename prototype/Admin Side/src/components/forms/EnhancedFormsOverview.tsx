/**
 * Enhanced Forms Overview with Tabbed Interface
 * Professional, formal design with category-based tabs
 * Consolidates all downloadable forms with proper navigation
 */
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { 
  Download, FileText, Search, CheckCircle, 
  Building2, Wrench, Users, BookOpen, FileCheck, 
  FolderOpen, ArrowRight, FileDown, Clock, Eye,
  Hammer, GraduationCap, Scale
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface EnhancedFormsOverviewProps {
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

export function EnhancedFormsOverview({ userRole, onNavigate, requireAuth }: EnhancedFormsOverviewProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate total forms count
  const totalForms = Object.values(FORM_CATEGORIES_DATA).reduce(
    (sum, category) => sum + category.forms.length, 
    0
  );

  // Get all forms for overview tab
  const allForms = Object.values(FORM_CATEGORIES_DATA).flatMap(category => 
    category.forms.map(form => ({
      ...form,
      categoryInfo: {
        title: category.title,
        icon: category.icon,
        color: category.color
      }
    }))
  );

  // Filter forms based on search
  const filteredForms = allForms.filter(form =>
    form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  // Render form card
  const renderFormCard = (form: any, showCategory: boolean = false) => (
    <Card key={form.id} className="border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all">
      <CardContent className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-gray-900 mb-1">{form.title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">{form.description}</p>
            
            {showCategory && (
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {form.category}
                </Badge>
                <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                  {form.subcategory}
                </Badge>
              </div>
            )}
            
            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
              <div className="flex items-center gap-3">
                <span>{form.fileSize}</span>
                <span>•</span>
                <span>{form.downloads} downloads</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{form.lastUpdated}</span>
              </div>
            </div>
            
            <Button 
              size="sm" 
              onClick={() => handleDownloadForm(form.id, form.title)}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Form
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                <FileDown className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-gray-900">Downloadable Forms</h1>
                <p className="text-gray-600 mt-1">
                  Official forms, templates, and documentation organized by category
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={handleViewInventory}>
              <Eye className="w-4 h-4 mr-2" />
              View Inventory
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Forms</p>
                    <p className="text-gray-900">{totalForms}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Categories</p>
                    <p className="text-gray-900">{Object.keys(FORM_CATEGORIES_DATA).length}</p>
                  </div>
                  <FolderOpen className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">All Available</p>
                    <p className="text-gray-900">100%</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Updated</p>
                    <p className="text-gray-900">2024</p>
                  </div>
                  <FileCheck className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Tabbed Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 lg:grid-cols-8 gap-2 bg-white p-2 rounded-lg border">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="university-operations" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              University Ops
            </TabsTrigger>
            <TabsTrigger value="construction-infrastructure" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              COI
            </TabsTrigger>
            <TabsTrigger value="repairs" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
              Repairs
            </TabsTrigger>
            <TabsTrigger value="gad" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              GAD
            </TabsTrigger>
            <TabsTrigger value="classroom-admin" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
              Classroom
            </TabsTrigger>
            <TabsTrigger value="policies" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              Policies
            </TabsTrigger>
            <TabsTrigger value="others" className="data-[state=active]:bg-gray-600 data-[state=active]:text-white">
              Others
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab - Consolidated View */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Forms Overview</CardTitle>
                    <CardDescription>Browse all available forms across all categories</CardDescription>
                  </div>
                  <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search forms..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Category Navigation Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {Object.values(FORM_CATEGORIES_DATA).map((category) => {
                    const Icon = category.icon;
                    const colorClasses = {
                      blue: 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100',
                      orange: 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100',
                      emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100',
                      purple: 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100',
                      cyan: 'bg-cyan-50 text-cyan-600 border-cyan-200 hover:bg-cyan-100',
                      indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100',
                      slate: 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100',
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
                              <h3 className="text-gray-900 mb-1">{category.title}</h3>
                              <p className="text-xs text-gray-600 leading-relaxed mb-3">
                                {category.description}
                              </p>
                              <div className="flex items-center justify-between">
                                <Badge variant="secondary">
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

                {/* All Forms Grid */}
                <div className="space-y-4">
                  <h3 className="text-gray-900">
                    All Available Forms ({filteredForms.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredForms.map((form) => renderFormCard(form, true))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Category-Specific Tabs */}
          {Object.entries(FORM_CATEGORIES_DATA).map(([key, category]) => {
            const Icon = category.icon;
            return (
              <TabsContent key={key} value={key} className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`p-3 bg-${category.color}-50 rounded-xl`}>
                        <Icon className={`w-8 h-8 text-${category.color}-600`} />
                      </div>
                      <div>
                        <CardTitle>{category.title}</CardTitle>
                        <CardDescription>{category.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
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
