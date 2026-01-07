import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { 
  ClipboardCheck, School, Briefcase, BarChart3, Building2,
  Calendar, Target, CheckCircle, AlertTriangle, 
  Eye, Edit, Plus, Trash2, ChevronRight, TrendingUp,
  FileText, Download, Upload, Award
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, Legend, Label, LabelList
} from 'recharts';
import { AssessmentInsightDialogs } from './dialogs/AssessmentInsightDialogs';
import { RecommendationDialogs } from './dialogs/RecommendationDialogs';
import { ActionItemDialogs } from './dialogs/ActionItemDialogs';

interface OverviewProps {
  userRole: string;
  requireAuth: (action: string) => boolean;
  onNavigate: (page: string) => void;
  userEmail?: string;
}

// Year-specific data
const YEAR_DATA = {
  '2024': {
    classrooms: { total: 125, assessed: 104, avgScore: 4.1, completionRate: 83.2, priority: 15 },
    adminOffices: { total: 42, assessed: 38, avgScore: 4.0, completionRate: 90.5, priority: 11 },
    quarterlyTrends: [
      { quarter: 'Q1', classrooms: 78, adminOffices: 32, avgScore: 3.9, completion: 65 },
      { quarter: 'Q2', classrooms: 89, adminOffices: 35, avgScore: 4.0, completion: 74 },
      { quarter: 'Q3', classrooms: 96, adminOffices: 37, avgScore: 4.05, completion: 80 },
      { quarter: 'Q4', classrooms: 104, adminOffices: 38, avgScore: 4.05, completion: 85 }
    ],
    scoreTrends: [
      { month: 'Sep', classroom: 4.0, adminOffice: 3.8 },
      { month: 'Oct', classroom: 4.05, adminOffice: 3.9 },
      { month: 'Nov', classroom: 4.08, adminOffice: 3.95 },
      { month: 'Dec', classroom: 4.1, adminOffice: 4.0 }
    ],
    statusDistribution: [
      { name: 'Excellent', value: 45, color: '#10b981' },
      { name: 'Good', value: 68, color: '#3b82f6' },
      { name: 'Fair', value: 24, color: '#f59e0b' },
      { name: 'Needs Improvement', value: 5, color: '#ef4444' }
    ]
  },
  '2023': {
    classrooms: { total: 125, assessed: 85, avgScore: 4.0, completionRate: 68.0, priority: 18 },
    adminOffices: { total: 42, assessed: 35, avgScore: 3.9, completionRate: 83.3, priority: 13 },
    quarterlyTrends: [
      { quarter: 'Q1', classrooms: 65, adminOffices: 28, avgScore: 3.8, completion: 58 },
      { quarter: 'Q2', classrooms: 72, adminOffices: 31, avgScore: 3.9, completion: 65 },
      { quarter: 'Q3', classrooms: 78, adminOffices: 33, avgScore: 3.95, completion: 70 },
      { quarter: 'Q4', classrooms: 85, adminOffices: 35, avgScore: 4.0, completion: 72 }
    ],
    scoreTrends: [
      { month: 'Sep', classroom: 3.8, adminOffice: 3.7 },
      { month: 'Oct', classroom: 3.85, adminOffice: 3.8 },
      { month: 'Nov', classroom: 3.9, adminOffice: 3.85 },
      { month: 'Dec', classroom: 4.0, adminOffice: 3.9 }
    ],
    statusDistribution: [
      { name: 'Excellent', value: 38, color: '#10b981' },
      { name: 'Good', value: 55, color: '#3b82f6' },
      { name: 'Fair', value: 22, color: '#f59e0b' },
      { name: 'Needs Improvement', value: 5, color: '#ef4444' }
    ]
  },
  '2022': {
    classrooms: { total: 125, assessed: 72, avgScore: 3.9, completionRate: 57.6, priority: 20 },
    adminOffices: { total: 42, assessed: 30, avgScore: 3.8, completionRate: 71.4, priority: 15 },
    quarterlyTrends: [
      { quarter: 'Q1', classrooms: 55, adminOffices: 22, avgScore: 3.7, completion: 48 },
      { quarter: 'Q2', classrooms: 62, adminOffices: 25, avgScore: 3.8, completion: 54 },
      { quarter: 'Q3', classrooms: 67, adminOffices: 28, avgScore: 3.85, completion: 59 },
      { quarter: 'Q4', classrooms: 72, adminOffices: 30, avgScore: 3.9, completion: 61 }
    ],
    scoreTrends: [
      { month: 'Sep', classroom: 3.7, adminOffice: 3.6 },
      { month: 'Oct', classroom: 3.75, adminOffice: 3.7 },
      { month: 'Nov', classroom: 3.8, adminOffice: 3.75 },
      { month: 'Dec', classroom: 3.9, adminOffice: 3.8 }
    ],
    statusDistribution: [
      { name: 'Excellent', value: 30, color: '#10b981' },
      { name: 'Good', value: 48, color: '#3b82f6' },
      { name: 'Fair', value: 18, color: '#f59e0b' },
      { name: 'Needs Improvement', value: 6, color: '#ef4444' }
    ]
  }
};

// Sample insights data for different sections
interface Insight {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  status: 'active' | 'resolved' | 'in-progress';
  createdAt: string;
  createdBy: string;
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  category: 'classroom' | 'administrative' | 'general';
  implementationCost: number;
  timeline: string;
  createdAt: string;
  createdBy: string;
}

interface ActionItem {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  createdBy: string;
}

const INITIAL_INSIGHTS: Insight[] = [
  {
    id: '1',
    title: 'COFES Classrooms Require Immediate Attention',
    description: 'College of Forestry classrooms scored below average. Ventilation and lighting improvements needed.',
    severity: 'high',
    status: 'active',
    createdAt: '2024-12-01',
    createdBy: 'admin@carsu.edu.ph'
  },
  {
    id: '2',
    title: 'Overall Assessment Progress On Track',
    description: 'Currently at 85% completion rate, meeting Q4 2024 targets across both campuses.',
    severity: 'low',
    status: 'resolved',
    createdAt: '2024-12-05',
    createdBy: 'admin@carsu.edu.ph'
  }
];

const INITIAL_RECOMMENDATIONS: Recommendation[] = [
  {
    id: '1',
    title: 'Upgrade Classroom Lighting Systems',
    description: 'Install LED lighting in 15 classrooms to improve visibility and reduce energy costs.',
    priority: 'high',
    category: 'classroom',
    implementationCost: 250000,
    timeline: '2-3 months',
    createdAt: '2024-12-03',
    createdBy: 'staff@carsu.edu.ph'
  },
  {
    id: '2',
    title: 'Registrar Office Space Expansion',
    description: 'Expand office area to accommodate increased student traffic during enrollment.',
    priority: 'medium',
    category: 'administrative',
    implementationCost: 500000,
    timeline: '6 months',
    createdAt: '2024-12-04',
    createdBy: 'admin@carsu.edu.ph'
  }
];

const INITIAL_ACTION_ITEMS: ActionItem[] = [
  {
    id: '1',
    title: 'Complete Pending Classroom Assessments',
    description: 'Assess remaining 21 classrooms before year-end deadline.',
    assignedTo: 'Assessment Team A',
    dueDate: '2024-12-31',
    status: 'in-progress',
    priority: 'high',
    createdAt: '2024-12-01',
    createdBy: 'admin@carsu.edu.ph'
  },
  {
    id: '2',
    title: 'Review and Address Priority Findings',
    description: 'Review all high-priority findings and create action plans.',
    assignedTo: 'Facilities Management',
    dueDate: '2024-12-20',
    status: 'pending',
    priority: 'high',
    createdAt: '2024-12-05',
    createdBy: 'staff@carsu.edu.ph'
  }
];

export function Overview({ userRole, requireAuth, onNavigate, userEmail = 'user@carsu.edu.ph' }: OverviewProps) {
  const [selectedYear, setSelectedYear] = useState('2024');
  const [activeTab, setActiveTab] = useState('overview');
  
  // CRUD states for different sections
  const [insights, setInsights] = useState<Insight[]>(INITIAL_INSIGHTS);
  const [recommendations, setRecommendations] = useState<Recommendation[]>(INITIAL_RECOMMENDATIONS);
  const [actionItems, setActionItems] = useState<ActionItem[]>(INITIAL_ACTION_ITEMS);
  
  // Dialog states for Insights
  const [isAddInsightOpen, setIsAddInsightOpen] = useState(false);
  const [isEditInsightOpen, setIsEditInsightOpen] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);
  
  // Dialog states for Recommendations
  const [isAddRecommendationOpen, setIsAddRecommendationOpen] = useState(false);
  const [isEditRecommendationOpen, setIsEditRecommendationOpen] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);
  
  // Dialog states for Action Items
  const [isAddActionItemOpen, setIsAddActionItemOpen] = useState(false);
  const [isEditActionItemOpen, setIsEditActionItemOpen] = useState(false);
  const [selectedActionItem, setSelectedActionItem] = useState<ActionItem | null>(null);

  const canEdit = userRole === 'Admin' || userRole === 'Staff';
  const canDelete = userRole === 'Admin';

  // Get year-specific data
  const currentYearData = useMemo(() => {
    return YEAR_DATA[selectedYear as keyof typeof YEAR_DATA];
  }, [selectedYear]);

  // Calculate overall metrics based on selected year
  const overallData = useMemo(() => {
    const data = currentYearData;
    return {
      totalFacilities: data.classrooms.total + data.adminOffices.total,
      totalAssessed: data.classrooms.assessed + data.adminOffices.assessed,
      avgScore: ((data.classrooms.avgScore + data.adminOffices.avgScore) / 2).toFixed(2),
      completionRate: (((data.classrooms.assessed + data.adminOffices.assessed) / 
                        (data.classrooms.total + data.adminOffices.total)) * 100).toFixed(1),
      totalPriorities: data.classrooms.priority + data.adminOffices.priority
    };
  }, [currentYearData]);

  // CRUD Handlers for Insights
  const handleAddInsight = (data: Omit<Insight, 'id' | 'createdAt' | 'createdBy'>) => {
    const newInsight: Insight = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: userEmail
    };
    setInsights([newInsight, ...insights]);
    toast.success('Insight added successfully');
  };

  const handleEditInsight = (id: string, data: Omit<Insight, 'id' | 'createdAt' | 'createdBy'>) => {
    setInsights(insights.map(insight => 
      insight.id === id ? { ...insight, ...data } : insight
    ));
    toast.success('Insight updated successfully');
  };

  const handleDeleteInsight = (id: string) => {
    setInsights(insights.filter(insight => insight.id !== id));
    toast.success('Insight deleted successfully');
  };

  // CRUD Handlers for Recommendations
  const handleAddRecommendation = (data: Omit<Recommendation, 'id' | 'createdAt' | 'createdBy'>) => {
    const newRecommendation: Recommendation = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: userEmail
    };
    setRecommendations([newRecommendation, ...recommendations]);
    toast.success('Recommendation added successfully');
  };

  const handleEditRecommendation = (id: string, data: Omit<Recommendation, 'id' | 'createdAt' | 'createdBy'>) => {
    setRecommendations(recommendations.map(rec => 
      rec.id === id ? { ...rec, ...data } : rec
    ));
    toast.success('Recommendation updated successfully');
  };

  const handleDeleteRecommendation = (id: string) => {
    setRecommendations(recommendations.filter(rec => rec.id !== id));
    toast.success('Recommendation deleted successfully');
  };

  // CRUD Handlers for Action Items
  const handleAddActionItem = (data: Omit<ActionItem, 'id' | 'createdAt' | 'createdBy'>) => {
    const newActionItem: ActionItem = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: userEmail
    };
    setActionItems([newActionItem, ...actionItems]);
    toast.success('Action item added successfully');
  };

  const handleEditActionItem = (id: string, data: Omit<ActionItem, 'id' | 'createdAt' | 'createdBy'>) => {
    setActionItems(actionItems.map(item => 
      item.id === id ? { ...item, ...data } : item
    ));
    toast.success('Action item updated successfully');
  };

  const handleDeleteActionItem = (id: string) => {
    setActionItems(actionItems.filter(item => item.id !== id));
    toast.success('Action item deleted successfully');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'resolved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'in-progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pending':
      case 'active': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleExportData = () => {
    if (!requireAuth('export data')) return;
    toast.success('Exporting assessment data...');
  };

  const handleImportData = () => {
    if (!requireAuth('import data')) return;
    toast.success('Opening import dialog...');
  };

  return (
    <div className="h-full overflow-auto bg-slate-50">
      <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-6">
        
        {/* Minimal Hero Section */}
        <Card className="border-slate-200 bg-white">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 rounded-lg">
                  <ClipboardCheck className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-gray-900">Classroom & Administrative Assessment</h1>
                  <p className="text-sm text-gray-600 mt-0.5">Quality evaluation of educational and administrative facilities</p>
                </div>
              </div>
              
              {canEdit && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleImportData} className="gap-2">
                    <Upload className="h-4 w-4" />
                    Import
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportData} className="gap-2">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </div>
              )}
            </div>

            <Separator className="my-4" />

            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-slate-500" />
              <span className="text-sm text-slate-700">Year:</span>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-28 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs - Synced with Subcategory Pages */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid bg-white border border-slate-200 p-1">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Data Analytics
            </TabsTrigger>
            <TabsTrigger 
              value="insights" 
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm"
            >
              <FileText className="h-4 w-4 mr-2" />
              Insights & Actions
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB - Improved Minimal Design */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics - Clean Minimal Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-slate-200 bg-white">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Building2 className="h-5 w-5 text-blue-600" />
                    </div>
                    <p className="text-xs text-gray-600">Total Facilities</p>
                  </div>
                  <p className="text-2xl text-gray-900">{overallData.totalFacilities}</p>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-emerald-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                    </div>
                    <p className="text-xs text-gray-600">Assessed</p>
                  </div>
                  <p className="text-2xl text-emerald-600">{overallData.totalAssessed}</p>
                  <Progress value={parseFloat(overallData.completionRate)} className="h-1.5 mt-2" />
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <Target className="h-5 w-5 text-purple-600" />
                    </div>
                    <p className="text-xs text-gray-600">Average Score</p>
                  </div>
                  <p className="text-2xl text-purple-600">{overallData.avgScore}/5.0</p>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-amber-50 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                    </div>
                    <p className="text-xs text-gray-600">Priority Actions</p>
                  </div>
                  <p className="text-2xl text-amber-600">{overallData.totalPriorities}</p>
                </CardContent>
              </Card>
            </div>

            {/* Direct Navigation Cards - Minimal & Clean */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Card 
                className="border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                onClick={() => {
                  onNavigate('classroom-csu-main-cc');
                  toast.info('Opening classroom assessment');
                }}
              >
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-blue-50 rounded-lg">
                        <School className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-gray-900">Classroom Assessment</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Educational spaces</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center p-2.5 bg-slate-50 rounded border border-slate-100">
                      <p className="text-lg text-gray-900">{currentYearData.classrooms.total}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Total</p>
                    </div>
                    <div className="text-center p-2.5 bg-emerald-50 rounded border border-emerald-100">
                      <p className="text-lg text-emerald-600">{currentYearData.classrooms.assessed}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Assessed</p>
                    </div>
                    <div className="text-center p-2.5 bg-blue-50 rounded border border-blue-100">
                      <p className="text-lg text-blue-600">{currentYearData.classrooms.avgScore}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Score</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Completion</span>
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                      {currentYearData.classrooms.completionRate.toFixed(1)}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="border-slate-200 bg-white hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
                onClick={() => {
                  onNavigate('admin-office-csu-main-cc');
                  toast.info('Opening administrative office assessment');
                }}
              >
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-50 rounded-lg">
                        <Briefcase className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="text-gray-900">Administrative Offices</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Office spaces</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center p-2.5 bg-slate-50 rounded border border-slate-100">
                      <p className="text-lg text-gray-900">{currentYearData.adminOffices.total}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Total</p>
                    </div>
                    <div className="text-center p-2.5 bg-emerald-50 rounded border border-emerald-100">
                      <p className="text-lg text-emerald-600">{currentYearData.adminOffices.assessed}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Assessed</p>
                    </div>
                    <div className="text-center p-2.5 bg-blue-50 rounded border border-blue-100">
                      <p className="text-lg text-blue-600">{currentYearData.adminOffices.avgScore}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Score</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Completion</span>
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                      {currentYearData.adminOffices.completionRate.toFixed(1)}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* DATA ANALYTICS TAB - With Direct Data Labels */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Quarterly Progress Overview - With Direct Labels */}
            <Card className="border-slate-200 bg-white">
              <CardHeader>
                <CardTitle className="text-gray-900">Quarterly Assessment Progress</CardTitle>
                <CardDescription>Number of facilities assessed throughout {selectedYear}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={currentYearData.quarterlyTrends}>
                    <defs>
                      <linearGradient id="colorClassrooms" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorAdmin" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="quarter" 
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      label={{ value: 'Quarter', position: 'insideBottom', offset: -5, fill: '#475569' }}
                    />
                    <YAxis 
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      label={{ value: 'Number of Facilities', angle: -90, position: 'insideLeft', fill: '#475569' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="classrooms" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      fill="url(#colorClassrooms)" 
                      name="Classrooms"
                    >
                      <LabelList dataKey="classrooms" position="top" fill="#3b82f6" fontSize={11} />
                    </Area>
                    <Area 
                      type="monotone" 
                      dataKey="adminOffices" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      fill="url(#colorAdmin)" 
                      name="Admin Offices"
                    >
                      <LabelList dataKey="adminOffices" position="top" fill="#10b981" fontSize={11} />
                    </Area>
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Score Trends and Status Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quality Score Trends - With Direct Labels */}
              <Card className="border-slate-200 bg-white">
                <CardHeader>
                  <CardTitle className="text-gray-900">Quality Score Trends</CardTitle>
                  <CardDescription>Monthly average scores for {selectedYear}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={currentYearData.scoreTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        label={{ value: 'Month', position: 'insideBottom', offset: -5, fill: '#475569' }}
                      />
                      <YAxis 
                        domain={[3.5, 4.5]} 
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        label={{ value: 'Average Score', angle: -90, position: 'insideLeft', fill: '#475569' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="classroom" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6', r: 4 }}
                        name="Classrooms"
                      >
                        <LabelList dataKey="classroom" position="top" fill="#3b82f6" fontSize={11} />
                      </Line>
                      <Line 
                        type="monotone" 
                        dataKey="adminOffice" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        dot={{ fill: '#10b981', r: 4 }}
                        name="Admin Offices"
                      >
                        <LabelList dataKey="adminOffice" position="top" fill="#10b981" fontSize={11} />
                      </Line>
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Status Distribution Pie Chart */}
              <Card className="border-slate-200 bg-white">
                <CardHeader>
                  <CardTitle className="text-gray-900">Assessment Status Distribution</CardTitle>
                  <CardDescription>Overall quality breakdown for {selectedYear}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={currentYearData.statusDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {currentYearData.statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Summary Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-slate-200 bg-white">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                    </div>
                    <p className="text-sm text-gray-600">Completion Rate</p>
                  </div>
                  <p className="text-2xl text-gray-900">{overallData.completionRate}%</p>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-emerald-50 rounded-lg">
                      <Award className="h-5 w-5 text-emerald-600" />
                    </div>
                    <p className="text-sm text-gray-600">Best Performing</p>
                  </div>
                  <p className="text-xl text-emerald-600">
                    {currentYearData.classrooms.avgScore > currentYearData.adminOffices.avgScore ? 'Classrooms' : 'Admin Offices'}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-amber-50 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                    </div>
                    <p className="text-sm text-gray-600">Needs Attention</p>
                  </div>
                  <p className="text-2xl text-amber-600">{overallData.totalPriorities}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* INSIGHTS & ACTIONS TAB - 2-Column Layout */}
          <TabsContent value="insights" className="space-y-6">
            {/* Assessment Insights - Full Width Section */}
            <Card className="border-slate-200 bg-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-gray-900">Assessment Insights</CardTitle>
                    <CardDescription>Key findings from facility evaluations</CardDescription>
                  </div>
                  {canEdit && (
                    <Button onClick={() => setIsAddInsightOpen(true)} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Insight
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {insights.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600">No insights added yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {insights.map((insight) => (
                      <Card key={insight.id} className="border-slate-200 bg-slate-50">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge className={getSeverityColor(insight.severity)} variant="outline">
                                  {insight.severity.toUpperCase()}
                                </Badge>
                                <Badge className={getStatusColor(insight.status)} variant="outline">
                                  {insight.status}
                                </Badge>
                              </div>
                              {canEdit && (
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => {
                                      setSelectedInsight(insight);
                                      setIsEditInsightOpen(true);
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  {canDelete && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                      onClick={() => handleDeleteInsight(insight.id)}
                                    >
                                      <Trash2 className="h-4 w-4 text-red-600" />
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>
                            <div>
                              <h4 className="text-gray-900 mb-1">{insight.title}</h4>
                              <p className="text-sm text-gray-600">{insight.description}</p>
                            </div>
                            <div className="flex items-center justify-between text-xs text-slate-500">
                              <span>{new Date(insight.createdAt).toLocaleDateString()}</span>
                              <span>{insight.createdBy}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recommendations and Action Items - 2 Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recommendations */}
              <Card className="border-slate-200 bg-white">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">Recommendations</CardTitle>
                      <CardDescription className="text-xs">Improvement suggestions</CardDescription>
                    </div>
                    {canEdit && (
                      <Button onClick={() => setIsAddRecommendationOpen(true)} size="sm" variant="outline">
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {recommendations.length === 0 ? (
                    <div className="text-center py-8">
                      <Award className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-xs text-slate-500">No recommendations yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recommendations.map((rec) => (
                        <Card key={rec.id} className="border-slate-200 bg-slate-50">
                          <CardContent className="p-3">
                            <div className="space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge className={getSeverityColor(rec.priority)} variant="outline" className="text-xs">
                                    {rec.priority.toUpperCase()}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs capitalize">{rec.category}</Badge>
                                </div>
                                {canEdit && (
                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0"
                                      onClick={() => {
                                        setSelectedRecommendation(rec);
                                        setIsEditRecommendationOpen(true);
                                      }}
                                    >
                                      <Edit className="h-3.5 w-3.5" />
                                    </Button>
                                    {canDelete && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0"
                                        onClick={() => handleDeleteRecommendation(rec.id)}
                                      >
                                        <Trash2 className="h-3.5 w-3.5 text-red-600" />
                                      </Button>
                                    )}
                                  </div>
                                )}
                              </div>
                              <h4 className="text-sm text-gray-900">{rec.title}</h4>
                              <p className="text-xs text-gray-600 line-clamp-2">{rec.description}</p>
                              <div className="flex items-center justify-between text-xs text-slate-600">
                                <span>₱{rec.implementationCost.toLocaleString()}</span>
                                <span>{rec.timeline}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Action Items */}
              <Card className="border-slate-200 bg-white">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">Action Items</CardTitle>
                      <CardDescription className="text-xs">Assigned tasks</CardDescription>
                    </div>
                    {canEdit && (
                      <Button onClick={() => setIsAddActionItemOpen(true)} size="sm" variant="outline">
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {actionItems.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-xs text-slate-500">No action items yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {actionItems.map((item) => (
                        <Card key={item.id} className="border-slate-200 bg-slate-50">
                          <CardContent className="p-3">
                            <div className="space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge className={getStatusColor(item.status)} variant="outline" className="text-xs">
                                    {item.status.toUpperCase()}
                                  </Badge>
                                  <Badge className={getSeverityColor(item.priority)} variant="outline" className="text-xs">
                                    {item.priority.toUpperCase()}
                                  </Badge>
                                </div>
                                {canEdit && (
                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0"
                                      onClick={() => {
                                        setSelectedActionItem(item);
                                        setIsEditActionItemOpen(true);
                                      }}
                                    >
                                      <Edit className="h-3.5 w-3.5" />
                                    </Button>
                                    {canDelete && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0"
                                        onClick={() => handleDeleteActionItem(item.id)}
                                      >
                                        <Trash2 className="h-3.5 w-3.5 text-red-600" />
                                      </Button>
                                    )}
                                  </div>
                                )}
                              </div>
                              <h4 className="text-sm text-gray-900">{item.title}</h4>
                              <p className="text-xs text-gray-600 line-clamp-2">{item.description}</p>
                              <div className="flex items-center justify-between text-xs text-slate-600">
                                <span>{item.assignedTo}</span>
                                <span>Due: {new Date(item.dueDate).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* CRUD Dialogs */}
      <AssessmentInsightDialogs
        isAddOpen={isAddInsightOpen}
        isEditOpen={isEditInsightOpen}
        selectedInsight={selectedInsight}
        onAddOpenChange={setIsAddInsightOpen}
        onEditOpenChange={setIsEditInsightOpen}
        onAdd={handleAddInsight}
        onEdit={handleEditInsight}
        requireAuth={requireAuth}
      />

      <RecommendationDialogs
        isAddOpen={isAddRecommendationOpen}
        isEditOpen={isEditRecommendationOpen}
        selectedRecommendation={selectedRecommendation}
        onAddOpenChange={setIsAddRecommendationOpen}
        onEditOpenChange={setIsEditRecommendationOpen}
        onAdd={handleAddRecommendation}
        onEdit={handleEditRecommendation}
        requireAuth={requireAuth}
      />

      <ActionItemDialogs
        isAddOpen={isAddActionItemOpen}
        isEditOpen={isEditActionItemOpen}
        selectedActionItem={selectedActionItem}
        onAddOpenChange={setIsAddActionItemOpen}
        onEditOpenChange={setIsEditActionItemOpen}
        onAdd={handleAddActionItem}
        onEdit={handleEditActionItem}
        requireAuth={requireAuth}
      />
    </div>
  );
}
