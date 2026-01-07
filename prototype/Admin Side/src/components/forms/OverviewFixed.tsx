import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { 
  Download, FileCheck, FileText, Calendar, Search, Target, BarChart3, 
  Eye, Upload, Filter, TrendingUp, PieChart, CheckCircle, Users, Building2,
  ArrowUpRight, Activity, Clock, ArrowRight, Edit
} from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { toast } from 'sonner@2.0.3';
import { UNIVERSITY_FORMS, FORM_CATEGORIES } from '../constants/sidebarConfig';

interface FormsOverviewProps {
  userRole: string;
  onNavigate: (page: string) => void;
  requireAuth: (action: string) => boolean;
}

// Enhanced forms data with analytics
const FORMS_OVERVIEW_DATA = {
  overview: {
    totalForms: 6,
    availableForms: 6,
    totalDownloads: 1247,
    monthlyDownloads: 156,
    completionRate: 100.0,
    lastUpdated: '2024-01-15',
    totalDepartments: 4,
    activeUsers: 89
  },

  formsList: [
    {
      id: 'hgdg-16',
      title: 'HGDG-16 Sectoral Forms',
      category: 'GAD Reporting',
      downloads: 324,
      fileSize: '2.1 MB',
      status: 'active',
      lastUpdated: '2024-01-15',
      uploadedDate: '2024-01-15',
      department: 'Planning and Development Office',
      uploadedBy: 'Maria Santos',
      description: 'Sectoral reporting forms for gender and development activities'
    },
    {
      id: 'pimme-checklist',
      title: 'PIMME Checklist',
      category: 'Project Monitoring',
      downloads: 287,
      fileSize: '1.8 MB',
      status: 'active',
      lastUpdated: '2024-01-10',
      uploadedDate: '2024-01-10',
      department: 'Project Management Office',
      uploadedBy: 'John Dela Cruz',
      description: 'Project implementation monitoring and evaluation checklist'
    },
    {
      id: 'pmo-monthly',
      title: 'PMO Monthly Accomplishment Form',
      category: 'Progress Reporting',
      downloads: 245,
      fileSize: '1.5 MB',
      status: 'active',  
      lastUpdated: '2024-01-05',
      uploadedDate: '2024-01-05',
      department: 'Project Management Office',
      uploadedBy: 'Anna Garcia',
      description: 'Monthly progress reporting forms for PMO activities'
    },
    {
      id: 'evaluation-plan',
      title: 'Evaluation Plan Template',
      category: 'Evaluation',
      downloads: 198,
      fileSize: '2.3 MB',
      status: 'active',
      lastUpdated: '2023-12-20',
      uploadedDate: '2023-12-20',
      department: 'Planning and Development Office',
      uploadedBy: 'Robert Cruz',
      description: 'Template for project evaluation planning'
    },
    {
      id: 'monitoring-plan',
      title: 'Monitoring Plan Template',
      category: 'Monitoring',
      downloads: 123,
      fileSize: '2.0 MB',
      status: 'active',
      lastUpdated: '2023-12-18',
      uploadedDate: '2023-12-18',
      department: 'Project Management Office',
      uploadedBy: 'Lisa Wong',
      description: 'Template for project monitoring plans'
    },
    {
      id: 'csu-me-plan',
      title: 'CSU M&E Plan Framework',
      category: 'M&E Framework',
      downloads: 70,
      fileSize: '3.2 MB',
      status: 'active',
      lastUpdated: '2023-12-15',
      uploadedDate: '2023-12-15',
      department: 'Planning and Development Office',
      uploadedBy: 'Dr. Patricia Reyes',
      description: 'Comprehensive M&E plan framework for CSU'
    },
    {
      id: 'procurement-form',
      title: 'Procurement Request Form',
      category: 'Administrative',
      downloads: 89,
      fileSize: '1.2 MB',
      status: 'active',
      lastUpdated: '2024-01-12',
      uploadedDate: '2024-01-12',
      department: 'Finance Office',
      uploadedBy: 'Carlos Martinez',
      description: 'Standard procurement request form for university operations'
    },
    {
      id: 'budget-proposal',
      title: 'Budget Proposal Template',
      category: 'Financial',
      downloads: 156,
      fileSize: '2.8 MB',
      status: 'active',
      lastUpdated: '2024-01-08',
      uploadedDate: '2024-01-08',
      department: 'Planning and Development Office',
      uploadedBy: 'Elena Rodriguez',
      description: 'Template for project budget proposals and financial planning'
    }
  ],

  recentChanges: [
    {
      id: 'change-1',
      type: 'upload',
      formTitle: 'HGDG-16 Sectoral Forms',
      action: 'Updated',
      timestamp: '2024-01-15 14:30',
      user: 'Maria Santos',
      department: 'Planning and Development Office'
    },
    {
      id: 'change-2',
      type: 'upload',
      formTitle: 'Procurement Request Form',
      action: 'New Upload',
      timestamp: '2024-01-12 09:15',
      user: 'Carlos Martinez',
      department: 'Finance Office'
    },
    {
      id: 'change-3',
      type: 'update',
      formTitle: 'PIMME Checklist',
      action: 'Details Updated',
      timestamp: '2024-01-10 16:45',
      user: 'John Dela Cruz',
      department: 'Project Management Office'
    },
    {
      id: 'change-4',
      type: 'upload',
      formTitle: 'Budget Proposal Template',
      action: 'New Upload',
      timestamp: '2024-01-08 11:20',
      user: 'Elena Rodriguez',
      department: 'Planning and Development Office'
    },
    {
      id: 'change-5',
      type: 'update',
      formTitle: 'PMO Monthly Accomplishment Form',
      action: 'Version Updated',
      timestamp: '2024-01-05 13:00',
      user: 'Anna Garcia',
      department: 'Project Management Office'
    }
  ]
};

export function FormsOverview({ userRole, onNavigate, requireAuth }: FormsOverviewProps) {
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedTimeRange, setSelectedTimeRange] = useState('6months');
  const [data] = useState(FORMS_OVERVIEW_DATA);

  // Get recent uploads sorted by date
  const recentUploads = data.formsList
    .sort((a, b) => new Date(b.uploadedDate).getTime() - new Date(a.uploadedDate).getTime())
    .slice(0, 6);

  // Filter recent changes by time range
  const filteredRecentChanges = data.recentChanges.filter(change => {
    const changeDate = new Date(change.timestamp);
    const now = new Date();
    
    switch (selectedTimeRange) {
      case 'week':
        return (now.getTime() - changeDate.getTime()) <= (7 * 24 * 60 * 60 * 1000);
      case 'month':
        return (now.getTime() - changeDate.getTime()) <= (30 * 24 * 60 * 60 * 1000);
      case '3months':
        return (now.getTime() - changeDate.getTime()) <= (90 * 24 * 60 * 60 * 1000);
      case '6months':
        return (now.getTime() - changeDate.getTime()) <= (180 * 24 * 60 * 60 * 1000);
      case 'year':
        return (now.getTime() - changeDate.getTime()) <= (365 * 24 * 60 * 60 * 1000);
      default:
        return true;
    }
  });

  const handleFormClick = (formId: string) => {
    // Navigate to inventory page with pre-filtered form
    console.log('Form clicked:', formId);
    onNavigate('forms-inventory');
    toast.info('Redirecting to Forms Inventory');
  };

  const handleCategoryClick = (categoryName: string) => {
    onNavigate('forms-inventory');
    toast.info(`Viewing ${categoryName} forms in inventory`);
  };

  const handleViewInventory = () => {
    onNavigate('forms-inventory');
  };

  const handleViewAllRecentUploads = () => {
    onNavigate('forms-inventory');
    toast.info('Viewing all forms in inventory');
  };

  const handleDownloadForm = (formId: string) => {
    if (requireAuth('download forms')) {
      console.log('Downloading form:', formId);
      setTimeout(() => {
        toast.success('Form downloaded successfully');
      }, 1000);
    }
  };

  // Filter forms based on selected category
  const filteredForms = selectedCategory === 'All Categories' 
    ? (data.formsList || [])
    : (data.formsList || []).filter(form => form.category === selectedCategory);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Clean Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col gap-6">
            {/* Main Header Row */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Download className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">Downloadable Forms</h1>
                  <p className="text-slate-600 mt-1">Official forms, templates, and documentation for PMO operations</p>
                  <div className="flex items-center gap-6 mt-3 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Updated {data.overview.lastUpdated}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>{data.overview.totalForms} Forms Available</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-purple-600" />
                      <span>{data.overview.activeUsers} Active Users</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Building2 className="w-4 h-4 text-orange-600" />
                      <span>{data.overview.totalDepartments} Departments</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-3">
                <Badge variant="secondary" className="px-3 py-1 bg-green-50 text-green-700 border-green-200 text-center">
                  <Target className="w-4 h-4 mr-1" />
                  {data.overview.completionRate}% Available
                </Badge>
                <Button variant="outline" size="sm" onClick={handleViewInventory}>
                  <Eye className="w-4 h-4 mr-2" />
                  View Inventory
                </Button>
              </div>
            </div>

            {/* Filter Section with Time Range */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Filter className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Form Categories & Time Filter</h3>
                    <p className="text-sm text-slate-600">Filter forms by category and time range for better organization</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-700">Category:</span>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-48 bg-white border-blue-200 focus:ring-blue-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(FORM_CATEGORIES || []).map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-700">Time:</span>
                    <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                      <SelectTrigger className="w-32 bg-white border-blue-200 focus:ring-blue-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="week">Past Week</SelectItem>
                        <SelectItem value="month">Past Month</SelectItem>
                        <SelectItem value="3months">3 Months</SelectItem>
                        <SelectItem value="6months">6 Months</SelectItem>
                        <SelectItem value="year">Past Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <span className="text-sm text-slate-500">
                    ({filteredForms.length} forms)
                  </span>
                </div>
              </div>

              {/* Category Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4 pt-4 border-t border-blue-200">
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-700">
                    {data.overview.totalDownloads.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-600">Total Downloads</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-green-700">
                    {data.overview.monthlyDownloads}
                  </div>
                  <div className="text-xs text-slate-600">This Month</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-purple-700">
                    {data.overview.availableForms}
                  </div>
                  <div className="text-xs text-slate-600">Active Forms</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-orange-700">
                    {data.overview.completionRate}%
                  </div>
                  <div className="text-xs text-slate-600">Availability</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-emerald-700">
                    {recentUploads.length}
                  </div>
                  <div className="text-xs text-slate-600">Recent Uploads</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Recent Uploads and Recent Changes */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* Recent Uploads Section - Replaces Data Visuals */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Upload className="w-5 h-5 text-blue-600" />
                  Recent Uploads
                </CardTitle>
                <CardDescription>Latest forms uploaded to the system with quick access and download options</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleViewAllRecentUploads}>
                <ArrowRight className="w-4 h-4 mr-1" />
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentUploads.map((form) => (
                <Card 
                  key={form.id} 
                  className="border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer"
                  onClick={() => handleFormClick(form.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 p-2 bg-slate-100 rounded-lg">
                        <FileText className="w-4 h-4 text-slate-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 text-sm leading-tight mb-1">
                          {form.title}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
                          <span>{form.fileSize}</span>
                          <span>•</span>
                          <span>{form.downloads} downloads</span>
                        </div>
                        <Badge 
                          variant="outline" 
                          className="text-xs bg-green-50 text-green-700 border-green-200 mb-2"
                        >
                          {form.category}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="mt-3 space-y-2">
                      <p className="text-xs text-slate-600 line-clamp-2">
                        {form.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          <span className="truncate">{form.department}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{form.lastUpdated}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <div className="text-xs text-slate-500">
                          by {form.uploadedBy}
                        </div>
                        <Button 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadForm(form.id);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-xs px-3 py-1"
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Changes Section - Made Functional and Intuitive */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-600" />
                  Recent Changes
                </CardTitle>
                <CardDescription>
                  Track recent form uploads, updates, and modifications filtered by time range
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                Showing {filteredRecentChanges.length} changes in {selectedTimeRange === '6months' ? '6 months' : selectedTimeRange}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredRecentChanges.length > 0 ? (
                filteredRecentChanges.map((change) => (
                  <div 
                    key={change.id} 
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    onClick={() => handleFormClick(change.formTitle)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        change.type === 'upload' 
                          ? 'bg-blue-100 text-blue-600' 
                          : 'bg-orange-100 text-orange-600'
                      }`}>
                        {change.type === 'upload' ? (
                          <Upload className="w-4 h-4" />
                        ) : (
                          <Edit className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 text-sm">
                          {change.formTitle}
                        </div>
                        <div className="text-xs text-slate-600 flex items-center gap-3">
                          <span className={
                            change.type === 'upload' 
                              ? 'text-blue-600 font-medium' 
                              : 'text-orange-600 font-medium'
                          }>
                            {change.action}
                          </span>
                          <span>•</span>
                          <span>{change.user}</span>
                          <span>•</span>
                          <span>{change.department}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="w-3 h-3" />
                      <span>{change.timestamp}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Activity className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                  <p>No changes found in the selected time range</p>
                  <p className="text-sm">Try selecting a different time period</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Section - Navigate to Inventory */}
        <Card className="bg-blue-50 border border-blue-200">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Need more control?</h3>
                <p className="text-sm text-slate-600">
                  Visit the inventory page for advanced filtering, sorting, batch uploads, and full CRUD operations.
                </p>
              </div>
              <Button onClick={handleViewInventory} className="bg-blue-600 hover:bg-blue-700">
                <ArrowUpRight className="w-4 h-4 mr-2" />
                Go to Inventory
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}