import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Separator } from '../ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../ui/pagination';
import { 
  Building, Target, TrendingUp, Building2, MapPin, Award, 
  BarChart3, Users, Calendar, FileText, ChevronRight, ChevronDown,
  CheckCircle, Activity, PieChart, LineChart as LineChartIcon, Filter,
  ArrowUpRight, Clock, Package, Ruler, Home,
  Plus, Edit, Trash2, Save, X, Search, Download, Eye,
  FolderOpen, Construction, MoreHorizontal, Grid, List, Table2,
  SortAsc, SortDesc, LayoutGrid, Shield, Lock, ShieldAlert, Info,
  Bell, Megaphone, Star, ExternalLink, AlertCircle
} from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { toast } from 'sonner@2.0.3';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart as RechartsLineChart, Line, Area, AreaChart, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { EnhancedProjectTable } from './components/EnhancedProjectTable';
import { constructionInfrastructureRBACService } from './services/RBACService';
import { enhancedRBACService } from './services/EnhancedRBACService';

// Mock staff data - In production, this would come from User Management
const AVAILABLE_STAFF = [
  { email: 'john.doe@carsu.edu.ph', name: 'John Doe', department: 'Engineering', role: 'Staff' },
  { email: 'jane.smith@carsu.edu.ph', name: 'Jane Smith', department: 'Infrastructure', role: 'Staff' },
  { email: 'pedro.reyes@carsu.edu.ph', name: 'Pedro Reyes', department: 'Project Management', role: 'Editor' },
  { email: 'ana.garcia@carsu.edu.ph', name: 'Ana Garcia', department: 'Planning', role: 'Staff' },
  { email: 'maria.santos@carsu.edu.ph', name: 'Maria Santos', department: 'Monitoring & Evaluation', role: 'Editor' },
];

interface CategoryOverviewProps {
  userRole: string;
  requireAuth: (action: string) => boolean;
  onNavigate: (page: string) => void;
  onProjectSelect: (project: any) => void;
  userEmail?: string;
  userDepartment?: string;
}

// Comprehensive Physical Accomplishment-focused Construction Infrastructure Data
const CONSTRUCTION_INFRASTRUCTURE_DATA = {
  overview: {
    totalProjects: 81,
    completedProjects: 68,
    ongoingProjects: 13,
    physicalAccomplishment: 89.2,
    targetPhysical: 85.0,
    lastUpdated: 'December 2024',
    assessmentCycle: 'Q4 2024',
    totalBeneficiaries: 25600,
    completedUnits: 156,
    totalUnits: 175,
    infrastructureTypes: 8,
    safetyCompliance: 96.5
  },

  // Comprehensive time-series data for advanced filtering
  timeSeriesData: {
    weekly: [
      { period: 'Week 1', physical: 87.1, completed: 65, units: 152, target: 85.0 },
      { period: 'Week 2', physical: 87.8, completed: 66, units: 153, target: 85.5 },
      { period: 'Week 3', physical: 88.5, completed: 67, units: 154, target: 86.0 },
      { period: 'Week 4', physical: 89.2, completed: 68, units: 156, target: 86.5 }
    ],
    monthly: [
      { period: 'Sep 2024', physical: 84.3, completed: 58, units: 142, target: 82.0 },
      { period: 'Oct 2024', physical: 86.1, completed: 62, units: 148, target: 83.0 },
      { period: 'Nov 2024', physical: 87.9, completed: 65, units: 152, target: 84.0 },
      { period: 'Dec 2024', physical: 89.2, completed: 68, units: 156, target: 85.0 }
    ],
    quarterly: [
      { period: 'Q1 2024', physical: 78.2, completed: 45, units: 125, target: 75.0 },
      { period: 'Q2 2024', physical: 81.5, completed: 52, units: 135, target: 78.0 },
      { period: 'Q3 2024', physical: 84.8, completed: 58, units: 145, target: 81.0 },
      { period: 'Q4 2024', physical: 89.2, completed: 68, units: 156, target: 85.0 }
    ],
    yearly: [
      { period: '2022', physical: 68.5, completed: 28, units: 85, target: 65.0 },
      { period: '2023', physical: 76.8, completed: 38, units: 102, target: 72.0 },
      { period: '2024', physical: 89.2, completed: 68, units: 156, target: 85.0 }
    ]
  },

  // Physical accomplishment trends by category
  categoryTrends: [
    { period: 'Jan', gaa: 76.2, local: 78.5, special: 82.1 },
    { period: 'Feb', gaa: 78.1, local: 80.2, special: 84.3 },
    { period: 'Mar', gaa: 79.8, local: 82.1, special: 86.2 },
    { period: 'Apr', gaa: 81.2, local: 83.8, special: 87.9 },
    { period: 'May', gaa: 82.9, local: 85.2, special: 89.4 },
    { period: 'Jun', gaa: 84.1, local: 86.8, special: 90.8 },
    { period: 'Jul', gaa: 85.3, local: 88.1, special: 92.1 },
    { period: 'Aug', gaa: 86.2, local: 89.5, special: 93.2 },
    { period: 'Sep', gaa: 86.8, local: 90.2, special: 94.1 },
    { period: 'Oct', gaa: 87.1, local: 91.1, special: 94.5 },
    { period: 'Nov', gaa: 87.4, local: 91.8, special: 94.8 },
    { period: 'Dec', gaa: 87.4, local: 92.1, special: 94.8 }
  ],

  categories: [
    {
      id: 'gaa-funded-projects',
      name: 'GAA-Funded Projects',
      shortName: 'National Government',
      icon: Building2,
      totalProjects: 28,
      completedProjects: 21,
      physicalProgress: 87.4,
      target: 85.0,
      status: 'On Track',
      objective: 'Major infrastructure development through national government allocation',
      beneficiaries: 12500,
      completedUnits: 56,
      totalUnits: 64,
      infrastructureTypes: ['Buildings', 'Roads', 'Utilities', 'Facilities'],
      metrics: {
        scheduleCompliance: 85.7,
        safetyRecord: 96.2,
        beneficiaryImpact: 94.1
      }
    },
    {
      id: 'locally-funded-projects',
      name: 'Locally-Funded Projects',
      shortName: 'Local Government',
      icon: MapPin,
      totalProjects: 35,
      completedProjects: 31,
      physicalProgress: 92.1,
      target: 88.0,
      status: 'Exceeding Target',
      objective: 'Community-based infrastructure improvement through local funding',
      beneficiaries: 8900,
      completedUnits: 68,
      totalUnits: 74,
      infrastructureTypes: ['Classrooms', 'Offices', 'Sports Facilities', 'Labs'],
      metrics: {
        scheduleCompliance: 91.2,
        safetyRecord: 97.1,
        beneficiaryImpact: 96.8
      }
    },
    {
      id: 'special-grants-projects',
      name: 'Special Grants Projects',
      shortName: 'Partnerships & IGP',
      icon: Award,
      totalProjects: 18,
      completedProjects: 16,
      physicalProgress: 94.8,
      target: 90.0,
      status: 'Exceeding Target',
      objective: 'Strategic partnerships and income-generating infrastructure projects',
      beneficiaries: 4200,
      completedUnits: 32,
      totalUnits: 37,
      infrastructureTypes: ['Commercial', 'Research', 'Innovation', 'Services'],
      metrics: {
        scheduleCompliance: 93.4,
        safetyRecord: 98.1,
        beneficiaryImpact: 92.5
      }
    }
  ],

  insights: {
    achievements: [
      'Special Grants Projects achieving 94.8% physical progress, exceeding 90% target by 4.8%',
      'Locally-Funded Projects demonstrating exceptional completion rate of 88.6%',
      'Safety compliance maintaining 96.5% average, exceeding industry standards',
      'Infrastructure unit completion rate of 89.1% with 156 units delivered successfully',
      'Beneficiary impact reaching 25,600+ individuals across all construction projects'
    ],
    improvements: [
      'Enhance project scheduling systems for GAA-Funded Projects to improve timeline adherence',
      'Implement advanced material tracking systems for better resource efficiency',
      'Strengthen quality assurance protocols for ongoing construction phases',
      'Expand contractor training programs to maintain high performance standards',
      'Optimize procurement processes to reduce project initiation delays',
      'Develop integrated monitoring systems for real-time progress tracking'
    ],
    recommendations: [
      'Develop integrated project management platform for real-time progress monitoring',
      'Establish standardized quality benchmarks across all infrastructure categories',
      'Create comprehensive safety protocol framework for enhanced compliance',
      'Implement predictive analytics for proactive project risk management',
      'Expand multi-year infrastructure planning to improve strategic alignment',
      'Strengthen community engagement protocols for sustainable infrastructure development'
    ]
  }
};

export function CategoryOverview({ userRole, requireAuth, onNavigate, onProjectSelect, userEmail = 'user@carsu.edu.ph', userDepartment = 'General' }: CategoryOverviewProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeFilter, setTimeFilter] = useState('monthly');
  const [data] = useState(CONSTRUCTION_INFRASTRUCTURE_DATA);
  
  // Enhanced RBAC - Check page access permissions
  const pageId = 'construction-of-infrastructure';
  const hasPageAccess = enhancedRBACService.canAccessPage(userEmail, userRole, userDepartment, pageId);
  
  // RBAC permissions
  const category = 'construction-infrastructure';
  const userPermissions = constructionInfrastructureRBACService.getUserPermissions(userEmail, userRole, category);
  const canPerformCRUD = constructionInfrastructureRBACService.canPerformCRUD(userEmail, userRole, category);
  
  // Projects tab state with full CRUD functionality
  const [projectSearchQuery, setProjectSearchQuery] = useState('');
  const [projectCategoryFilter, setProjectCategoryFilter] = useState('all');
  const [projectStatusFilter, setProjectStatusFilter] = useState('all');
  const [projectViewMode, setProjectViewMode] = useState<'table' | 'list' | 'card'>('table');
  const [projectSortBy, setProjectSortBy] = useState('dateStarted');
  const [projectSortOrder, setProjectSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [editingProject, setEditingProject] = useState(null);
  const [newProjectDialog, setNewProjectDialog] = useState(false);
  const [projectFormData, setProjectFormData] = useState({
    projectTitle: '',
    dateStarted: '',
    projectDuration: '',
    targetDateCompletion: '',
    fundingSource: '',
    approvedBudget: 0,
    appropriation: 0,
    obligation: 0,
    totalLaborCost: 0,
    totalProjectCost: 0,
    disbursement: 0,
    progressAccomplishment: 0,
    status: 'Planning',
    remarks: '',
    category: 'GAA-Funded Projects',
    assignedPersonnel: [] as string[]  // Array of email addresses
  });
  
  // Analytics CRUD state
  const [analyticsCharts, setAnalyticsCharts] = useState([
    { id: 'progress-trends', title: 'Progress Trends', type: 'line', visible: true, dataSource: 'timeSeriesData', config: { xAxis: 'period', yAxis: 'physical', color: '#3b82f6' } },
    { id: 'category-comparison', title: 'Category Comparison', type: 'area', visible: true, dataSource: 'categoryTrends', config: { xAxis: 'period', yAxis: 'gaa', color: '#10b981' } },
    { id: 'target-vs-actual', title: 'Target vs Actual', type: 'bar', visible: true, dataSource: 'timeSeriesData', config: { xAxis: 'period', yAxis: 'physical', color: '#f59e0b' } }
  ]);
  const [newChartDialog, setNewChartDialog] = useState(false);
  const [editingChart, setEditingChart] = useState(null);
  const [newChart, setNewChart] = useState({ 
    title: '', 
    type: 'line', 
    dataSource: 'timeSeriesData',
    xAxis: 'period',
    yAxis: 'physical',
    color: '#3b82f6',
    legend: ['actual', 'target', 'variance'],
    showTarget: true,
    showVariance: true
  });
  
  // Insights CRUD state
  const [insightContainers, setInsightContainers] = useState([
    {
      id: 'achievements',
      title: 'Key Achievements',
      type: 'achievements',
      quarter: 'Q4 2024',
      items: data.insights.achievements,
      isEditable: true
    },
    {
      id: 'improvements',
      title: 'Areas for Improvement',
      type: 'improvements', 
      quarter: 'Q4 2024',
      items: data.insights.improvements,
      isEditable: true
    },
    {
      id: 'recommendations',
      title: 'Strategic Recommendations',
      type: 'recommendations',
      quarter: 'Q4 2024',
      items: data.insights.recommendations,
      isEditable: true
    }
  ]);
  const [editingContainer, setEditingContainer] = useState(null);
  const [newContainerDialog, setNewContainerDialog] = useState(false);
  const [newContainer, setNewContainer] = useState({ title: '', type: 'custom', quarter: 'Q4 2024', items: [] });
  const [newInsightItem, setNewInsightItem] = useState('');
  
  // Timeline search state with dropdown and pagination
  const [timelineSearchQuery, setTimelineSearchQuery] = useState('all');
  const [visibleTimelineProjects, setVisibleTimelineProjects] = useState(0); // Start at page 1 (index 0)
  
  // Budget vs Disbursement search and navigation state
  const [budgetSearchQuery, setBudgetSearchQuery] = useState('all');
  const [currentBudgetProjectIndex, setCurrentBudgetProjectIndex] = useState(0); // Show one project at a time
  
  // Announcements CRUD state
  const [announcements, setAnnouncements] = useState([
    { id: '1', title: 'Project Completion Milestone', content: 'Main Campus Building Renovation Phase 2 has been successfully completed ahead of schedule.', date: 'December 15, 2024' },
    { id: '2', title: 'Budget Allocation Update', content: 'Q1 2025 infrastructure budget has been approved. New projects can now be initiated.', date: 'December 10, 2024' },
    { id: '3', title: 'Safety Inspection Scheduled', content: 'All ongoing projects will undergo safety compliance review on December 20, 2024.', date: 'December 5, 2024' }
  ]);
  const [announcementDialog, setAnnouncementDialog] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null);
  const [announcementFormData, setAnnouncementFormData] = useState({ title: '', content: '', date: '' });
  
  // Project Highlights CRUD state
  const [projectHighlights, setProjectHighlights] = useState([
    { id: 'gaa-001', projectTitle: 'Main Campus Multi-Purpose Building', description: 'State-of-the-art facility enhancing academic and extracurricular activities', progress: 95.8, fundingSource: 'GAA-Funded', projectId: 'gaa-001' },
    { id: 'gaa-002', projectTitle: 'Science and Technology Laboratory Complex', description: 'Advanced research and innovation facility for STEM programs', progress: 78.5, fundingSource: 'GAA-Funded', projectId: 'gaa-002' },
    { id: 'local-001', projectTitle: 'Student Activity Center Phase 3', description: 'Expanding student services and recreational facilities', progress: 68.2, fundingSource: 'Locally-Funded', projectId: 'local-001' }
  ]);
  const [highlightDialog, setHighlightDialog] = useState(false);
  const [editingHighlight, setEditingHighlight] = useState<any>(null);
  const [highlightFormData, setHighlightFormData] = useState({ projectId: '', description: '' });
  
  // KPI CRUD state (excluding quality rating)
  const [kpiMetrics, setKpiMetrics] = useState([
    { label: 'Schedule Adherence', value: 87.8, target: 85.0, trend: 'up' },
    { label: 'Safety Compliance', value: 96.5, target: 95.0, trend: 'up' },
    { label: 'Material Efficiency', value: 89.3, target: 88.0, trend: 'up' },
    { label: 'Contractor Performance', value: 91.7, target: 90.0, trend: 'up' },
    { label: 'Environmental Compliance', value: 93.1, target: 92.0, trend: 'up' }
  ]);
  const [editingKPI, setEditingKPI] = useState(null);
  const [newKPIDialog, setNewKPIDialog] = useState(false);
  const [newKPI, setNewKPI] = useState({ label: '', value: 0, target: 0, trend: 'up' });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Exceeding Target': return 'text-green-700 bg-green-50 border-green-200';
      case 'On Track': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'Needs Attention': return 'text-amber-700 bg-amber-50 border-amber-200';
      default: return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  // Get filtered data based on time period
  const getFilteredData = () => {
    return data.timeSeriesData[timeFilter] || data.timeSeriesData.monthly;
  };

  const getTimeFilterLabel = () => {
    switch (timeFilter) {
      case 'weekly': return 'Weekly Progress';
      case 'monthly': return 'Monthly Progress';
      case 'quarterly': return 'Quarterly Progress';
      case 'yearly': return 'Yearly Progress';
      default: return 'Monthly Progress';
    }
  };

  const handleChartClick = (data: any, chartType: string) => {
    console.log('Chart clicked:', chartType, data);
    
    if (chartType === 'category' && data.payload) {
      const categoryName = data.payload.name;
      const categoryId = data.payload.id;
      if (categoryId) {
        onNavigate(categoryId);
        toast.success(`Exploring ${categoryName} construction details`);
      }
    } else if (chartType === 'trend' && data.payload) {
      const period = data.payload.period;
      toast.info(`Viewing ${period} construction progress details`);
    }
  };

  const handleKPIClick = (kpi: any) => {
    toast.info(`Analyzing ${kpi.label} across all construction projects`);
  };

  // Enhanced aggregated projects data matching GAA-Funded Projects attributes
  const [projectsData, setProjectsData] = useState([
    // GAA-Funded Projects
    {
      id: 'gaa-001',
      projectTitle: 'University Science Complex Phase II',
      dateStarted: '2024-01-15',
      projectDuration: '12 months',
      targetDateCompletion: '2024-12-15',
      fundingSource: 'General Appropriations Act (GAA)',
      approvedBudget: 45000000,
      appropriation: 43500000,
      obligation: 41200000,
      totalLaborCost: 18500000,
      totalProjectCost: 45000000,
      disbursement: 38200000,
      progressAccomplishment: 85.2,
      status: 'Ongoing',
      remarks: 'On track with construction milestones',
      category: 'GAA-Funded Projects'
    },
    {
      id: 'gaa-002', 
      projectTitle: 'Engineering Building Renovation',
      dateStarted: '2024-02-01',
      projectDuration: '10 months',
      targetDateCompletion: '2024-11-30',
      fundingSource: 'General Appropriations Act (GAA)',
      approvedBudget: 28500000,
      appropriation: 28500000,
      obligation: 28500000,
      totalLaborCost: 12800000,
      totalProjectCost: 28500000,
      disbursement: 28500000,
      progressAccomplishment: 100.0,
      status: 'Completed',
      remarks: 'Successfully completed within timeline',
      category: 'GAA-Funded Projects'
    },
    // Locally-Funded Projects
    {
      id: 'local-001',
      projectTitle: 'Student Activity Center',
      dateStarted: '2024-03-10',
      projectDuration: '9 months',
      targetDateCompletion: '2024-12-20',
      fundingSource: 'Local Government Funding',
      approvedBudget: 15200000,
      appropriation: 15200000,
      obligation: 14800000,
      totalLaborCost: 6200000,
      totalProjectCost: 15200000,
      disbursement: 13500000,
      progressAccomplishment: 92.5,
      status: 'Ongoing',
      remarks: 'Ahead of schedule, excellent progress',
      category: 'Locally-Funded Projects'
    },
    {
      id: 'local-002',
      projectTitle: 'Gymnasium Expansion',
      dateStarted: '2024-01-20',
      projectDuration: '8 months',
      targetDateCompletion: '2024-10-15',
      fundingSource: 'Local Government Funding',
      approvedBudget: 22800000,
      appropriation: 22800000,
      obligation: 22800000,
      totalLaborCost: 9500000,
      totalProjectCost: 22800000,
      disbursement: 22800000,
      progressAccomplishment: 100.0,
      status: 'Completed',
      remarks: 'Completed successfully, excellent quality',
      category: 'Locally-Funded Projects'
    },
    // Special Grants Projects
    {
      id: 'special-001',
      projectTitle: 'Innovation and Research Hub',
      dateStarted: '2024-02-15',
      projectDuration: '10 months',
      targetDateCompletion: '2024-12-31',
      fundingSource: 'Special Grants Partnership',
      approvedBudget: 38000000,
      appropriation: 37200000,
      obligation: 36500000,
      totalLaborCost: 15800000,
      totalProjectCost: 38000000,
      disbursement: 34200000,
      progressAccomplishment: 95.8,
      status: 'Ongoing',
      remarks: 'Exceeding targets, high-quality construction',
      category: 'Special Grants Projects'
    },
    {
      id: 'special-002',
      projectTitle: 'Green Energy Learning Center',
      dateStarted: '2024-11-01',
      projectDuration: '10 months',
      targetDateCompletion: '2025-08-30',
      fundingSource: 'Income Generating Project',
      approvedBudget: 25000000,
      appropriation: 24000000,
      obligation: 5200000,
      totalLaborCost: 10500000,
      totalProjectCost: 25000000,
      disbursement: 3800000,
      progressAccomplishment: 15.2,
      status: 'Planning',
      remarks: 'Initial phase, procurement in progress',
      category: 'Special Grants Projects'
    }
  ]);

  const getAllProjects = () => {
    let filtered = projectsData.filter(project => {
      const matchesSearch = project.projectTitle.toLowerCase().includes(projectSearchQuery.toLowerCase()) ||
                           project.fundingSource.toLowerCase().includes(projectSearchQuery.toLowerCase());
      const matchesCategory = projectCategoryFilter === 'all' || project.category === projectCategoryFilter;
      const matchesStatus = projectStatusFilter === 'all' || project.status === projectStatusFilter;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[projectSortBy];
      let bValue = b[projectSortBy];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (projectSortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  // Insights CRUD functions
  const handleAddContainer = () => {
    if (newContainer.title.trim()) {
      const container = {
        ...newContainer,
        id: `custom-${Date.now()}`,
        items: [],
        isEditable: true
      };
      setInsightContainers([...insightContainers, container]);
      setNewContainer({ title: '', type: 'custom', quarter: 'Q4 2024', items: [] });
      setNewContainerDialog(false);
      toast.success('New insights container created');
    }
  };

  const handleDeleteContainer = (containerId: string) => {
    if (!requireAuth('manage insights')) return;
    setInsightContainers(insightContainers.filter(c => c.id !== containerId));
    toast.success('Container deleted');
  };

  const handleEditContainer = (containerId: string) => {
    if (!requireAuth('manage insights')) return;
    
    setEditingContainer(containerId);
    toast.info('Container editing mode enabled');
  };

  const handleSaveContainer = (containerId: string, updatedContainer: any) => {
    if (!requireAuth('manage insights')) return;
    
    setInsightContainers(containers =>
      containers.map(c =>
        c.id === containerId ? { ...c, ...updatedContainer } : c
      )
    );
    setEditingContainer(null);
    toast.success('Container updated successfully');
  };

  const handleAddInsightItem = (containerId: string, item: string) => {
    if (!requireAuth('manage insights')) return;
    
    if (item.trim()) {
      setInsightContainers(containers =>
        containers.map(c =>
          c.id === containerId
            ? { ...c, items: [...c.items, item.trim()] }
            : c
        )
      );
      setNewInsightItem('');
      toast.success('Insight item added');
    }
  };

  const handleDeleteInsightItem = (containerId: string, itemIndex: number) => {
    if (!requireAuth('manage insights')) return;
    
    setInsightContainers(containers =>
      containers.map(c =>
        c.id === containerId
          ? { ...c, items: c.items.filter((_, i) => i !== itemIndex) }
          : c
      )
    );
    toast.success('Insight item removed');
  };

  // Enhanced Analytics CRUD functions - FIXED WITH PROPER ATTRIBUTES
  const handleAddChart = () => {
    if (!requireAuth('manage analytics')) return;
    
    if (newChart.title.trim()) {
      const chartToAdd = {
        id: `chart-${Date.now()}`,
        title: newChart.title,
        type: newChart.type,
        dataSource: newChart.dataSource,
        visible: true,
        config: {
          xAxis: newChart.xAxis || 'period',
          yAxis: newChart.yAxis || 'physical',
          color: newChart.color || '#3b82f6',
          legend: newChart.legend || ['actual', 'target', 'variance'],
          showTarget: newChart.showTarget || true,
          showVariance: newChart.showVariance || true
        }
      };
      setAnalyticsCharts([...analyticsCharts, chartToAdd]);
      setNewChart({ 
        title: '', 
        type: 'line', 
        dataSource: 'timeSeriesData',
        xAxis: 'period',
        yAxis: 'physical',
        color: '#3b82f6',
        legend: ['actual', 'target', 'variance'],
        showTarget: true,
        showVariance: true
      });
      setNewChartDialog(false);
      toast.success('Chart added successfully');
    }
  };

  const handleUpdateChart = (chartId: string, updatedChart: any) => {
    if (!requireAuth('manage analytics')) return;
    
    setAnalyticsCharts(charts =>
      charts.map(c =>
        c.id === chartId ? { ...c, ...updatedChart } : c
      )
    );
    setEditingChart(null);
    toast.success('Chart updated successfully');
  };

  const handleDeleteChart = (chartId: string) => {
    if (!requireAuth('manage analytics')) return;
    
    setAnalyticsCharts(analyticsCharts.filter(c => c.id !== chartId));
    toast.success('Chart removed');
  };

  const handleToggleChart = (chartId: string) => {
    setAnalyticsCharts(charts =>
      charts.map(c =>
        c.id === chartId ? { ...c, visible: !c.visible } : c
      )
    );
    const chart = analyticsCharts.find(c => c.id === chartId);
    toast.info(`Chart ${chart?.visible ? 'hidden' : 'shown'}`);
  };

  // Mock staff data - matches ProjectPersonnelDialog
  const AVAILABLE_STAFF = [
    { email: 'john.doe@carsu.edu.ph', name: 'John Doe', department: 'Engineering', role: 'Staff' },
    { email: 'jane.smith@carsu.edu.ph', name: 'Jane Smith', department: 'Infrastructure', role: 'Staff' },
    { email: 'pedro.reyes@carsu.edu.ph', name: 'Pedro Reyes', department: 'Project Management', role: 'Editor' },
    { email: 'ana.garcia@carsu.edu.ph', name: 'Ana Garcia', department: 'Planning', role: 'Staff' },
    { email: 'maria.santos@carsu.edu.ph', name: 'Maria Santos', department: 'Monitoring & Evaluation', role: 'Editor' },
  ];

  // Project CRUD functions
  const handleAddProject = () => {
    if (!requireAuth('manage projects')) return;
    
    const newProjectId = `project-${Date.now()}`;
    const newProject = {
      id: newProjectId,
      ...projectFormData
    };
    
    // Assign personnel to the new project
    if (projectFormData.assignedPersonnel && projectFormData.assignedPersonnel.length > 0) {
      projectFormData.assignedPersonnel.forEach((staffEmail) => {
        const staff = AVAILABLE_STAFF.find(s => s.email === staffEmail);
        if (staff) {
          constructionInfrastructureRBACService.assignStaffToProject(
            newProjectId,
            projectFormData.projectTitle,
            staff.email,
            staff.name,
            userEmail,
            {
              canEdit: true,
              canDelete: false,
              canViewDocuments: true,
              canUploadDocuments: true
            }
          );
        }
      });
    }
    
    setProjectsData([...projectsData, newProject]);
    toast.success('Project added successfully with personnel assigned');
    setNewProjectDialog(false);
    setProjectFormData({
      projectTitle: '',
      dateStarted: '',
      projectDuration: '',
      targetDateCompletion: '',
      fundingSource: '',
      approvedBudget: 0,
      appropriation: 0,
      obligation: 0,
      totalLaborCost: 0,
      totalProjectCost: 0,
      disbursement: 0,
      progressAccomplishment: 0,
      status: 'Planning',
      remarks: '',
      category: 'GAA-Funded Projects',
      assignedPersonnel: []
    });
  };

  const handleUpdateProject = () => {
    if (!requireAuth('manage projects')) return;
    
    setProjectsData(projects =>
      projects.map(p =>
        p.id === editingProject?.id ? { ...p, ...projectFormData } : p
      )
    );
    toast.success('Project updated successfully');
    setEditingProject(null);
    setNewProjectDialog(false);
  };

  const handleDeleteProject = (projectId: string) => {
    if (!requireAuth('delete projects')) return;
    
    setProjectsData(projects => projects.filter(p => p.id !== projectId));
    toast.success('Project deleted successfully');
  };

  const handleProjectClick = (project: any) => {
    // Navigate to project details page
    onProjectSelect(project);
    toast.info(`Opening project: ${project.projectTitle}`);
  };
  
  // Announcements CRUD Handlers
  const handleAddAnnouncement = () => {
    if (!announcementFormData.title || !announcementFormData.content) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    const newAnnouncement = {
      id: Date.now().toString(),
      title: announcementFormData.title,
      content: announcementFormData.content,
      date: announcementFormData.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    };
    
    setAnnouncements([newAnnouncement, ...announcements]);
    toast.success('Announcement added successfully');
    setAnnouncementDialog(false);
    setAnnouncementFormData({ title: '', content: '', date: '' });
  };
  
  const handleUpdateAnnouncement = () => {
    if (!announcementFormData.title || !announcementFormData.content) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setAnnouncements(announcements.map(a =>
      a.id === editingAnnouncement?.id
        ? { ...a, title: announcementFormData.title, content: announcementFormData.content, date: announcementFormData.date }
        : a
    ));
    toast.success('Announcement updated successfully');
    setAnnouncementDialog(false);
    setEditingAnnouncement(null);
    setAnnouncementFormData({ title: '', content: '', date: '' });
  };
  
  const handleDeleteAnnouncement = (id: string) => {
    setAnnouncements(announcements.filter(a => a.id !== id));
    toast.success('Announcement deleted successfully');
  };
  
  // Project Highlights CRUD Handlers
  const handleAddHighlight = () => {
    if (!highlightFormData.projectId) {
      toast.error('Please select a project');
      return;
    }
    
    const project = projectsData.find(p => p.id === highlightFormData.projectId);
    if (!project) {
      toast.error('Project not found');
      return;
    }
    
    const newHighlight = {
      id: project.id,
      projectTitle: project.projectTitle,
      description: highlightFormData.description || `Featured project: ${project.projectTitle}`,
      progress: project.progressAccomplishment,
      fundingSource: project.fundingSource,
      projectId: project.id
    };
    
    setProjectHighlights([...projectHighlights, newHighlight]);
    toast.success('Project highlight added successfully');
    setHighlightDialog(false);
    setHighlightFormData({ projectId: '', description: '' });
  };
  
  const handleUpdateHighlight = () => {
    if (!highlightFormData.projectId) {
      toast.error('Please select a project');
      return;
    }
    
    const project = projectsData.find(p => p.id === highlightFormData.projectId);
    if (!project) {
      toast.error('Project not found');
      return;
    }
    
    setProjectHighlights(projectHighlights.map(h =>
      h.id === editingHighlight?.id
        ? {
            ...h,
            projectId: project.id,
            projectTitle: project.projectTitle,
            description: highlightFormData.description,
            progress: project.progressAccomplishment,
            fundingSource: project.fundingSource
          }
        : h
    ));
    toast.success('Project highlight updated successfully');
    setHighlightDialog(false);
    setEditingHighlight(null);
    setHighlightFormData({ projectId: '', description: '' });
  };
  
  const handleDeleteHighlight = (id: string) => {
    setProjectHighlights(projectHighlights.filter(h => h.id !== id));
    toast.success('Project highlight deleted successfully');
  };

  // Pagination for projects
  const getPaginatedProjects = () => {
    const allProjects = getAllProjects();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    return {
      projects: allProjects.slice(startIndex, endIndex),
      totalPages: Math.ceil(allProjects.length / itemsPerPage),
      totalItems: allProjects.length
    };
  };

  // Helper functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getProjectStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'Ongoing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Planning': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'On Hold': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  // Access Control Check
  if (!hasPageAccess && userRole !== 'Client') {
    return (
      <div className="h-full overflow-auto admin-page-bg">
        <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-6">
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-100 rounded-lg">
                  <ShieldAlert className="w-6 h-6 text-amber-700" />
                </div>
                <div>
                  <CardTitle className="text-amber-900">Access Restricted</CardTitle>
                  <CardDescription className="text-amber-700">
                    You do not have permission to access Construction of Infrastructure
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Alert className="bg-white border-amber-200">
                <Info className="h-4 w-4 text-amber-600" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700">
                      <strong>Current Access:</strong> Your department ({userDepartment}) does not have access to this page.
                    </p>
                    <p className="text-sm text-gray-700">
                      Only staff assigned to the <strong>Engineering and Construction Office (ECO)</strong> or <strong>Planning and Development Office</strong> can access Construction of Infrastructure.
                    </p>
                    <p className="text-sm text-gray-600 mt-3">
                      Please contact your administrator if you believe this is an error.
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
              <div className="mt-4 flex gap-2">
                <Button
                  onClick={() => onNavigate('overview')}
                  variant="outline"
                  className="gap-2"
                >
                  <Home className="w-4 h-4" />
                  Return to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto admin-page-bg">
      <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-6">
        {/* Header Section */}
        <div className="admin-card">
          <div className="p-6 space-y-5">
            {/* Main Header */}
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                  <Building className="w-7 h-7 text-green-600" />
                </div>
                <div className="flex-1">
                  <h1 className="text-gray-900 text-2xl mb-1">Construction & Infrastructure</h1>
                  <p className="text-base text-gray-600 leading-relaxed">
                    Physical accomplishment monitoring and evaluation dashboard
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Badge
                  variant="secondary"
                  className="px-4 py-1.5 bg-green-50 text-green-700 border-green-200 text-center"
                >
                  <Target className="w-4 h-4 mr-1.5" />
                  {data.overview.physicalAccomplishment}% Accomplished
                </Badge>
                <Button variant="outline" size="sm" className="border-gray-200 hover:bg-gray-50 h-9">
                  <FileText className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </div>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-4 border-t border-gray-100 text-sm text-gray-600">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Updated {data.overview.lastUpdated}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>{data.overview.assessmentCycle}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-purple-600" />
                <span>{data.overview.totalBeneficiaries.toLocaleString()} Beneficiaries</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Home className="w-4 h-4 text-orange-600" />
                <span>{data.overview.completedUnits} Units Completed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Time Filter Section */}
        <div className="admin-card">
          <div className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Filter className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-gray-900 text-base">Time Period Filter</h3>
                  <p className="text-sm text-gray-600">Filter data across all tabs and categories</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-700">Viewing:</span>
                <Select value={timeFilter} onValueChange={setTimeFilter}>
                  <SelectTrigger className="w-36 bg-white border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-gray-500">
                  ({getFilteredData().length} periods)
                </span>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 pt-5 border-t border-gray-200">
              <div className="text-center">
                <div className="text-lg text-green-700">
                  {(getFilteredData().reduce((sum, p) => sum + p.physical, 0) / getFilteredData().length).toFixed(1)}%
                </div>
                <div className="text-xs text-gray-600">Avg Physical Progress</div>
              </div>
              <div className="text-center">
                <div className="text-lg text-blue-700">
                  {getFilteredData()[getFilteredData().length - 1]?.completed || 'N/A'}
                </div>
                <div className="text-xs text-gray-600">Projects Completed</div>
              </div>
              <div className="text-center">
                <div className="text-lg text-purple-700">
                  {getFilteredData()[getFilteredData().length - 1]?.units || 'N/A'}
                </div>
                <div className="text-xs text-gray-600">Units Delivered</div>
              </div>
              <div className="text-center">
                <div className="text-lg text-orange-700">
                  {((getFilteredData().reduce((sum, p) => sum + p.physical, 0) / getFilteredData().length) - 
                    (getFilteredData().reduce((sum, p) => sum + p.target, 0) / getFilteredData().length)).toFixed(1)}%
                </div>
                <div className="text-xs text-gray-600">vs Target</div>
              </div>
            </div>
          </div>
        </div>


        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Tab Navigation */}
          <div className="admin-card p-1">
            <TabsList className="bg-transparent border-0 p-0 w-full grid grid-cols-4 gap-1">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700 data-[state=active]:border-green-200 border border-transparent py-2.5 text-sm"
              >
                <BarChart3 className="w-4 h-4 mr-1.5" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger
                value="projects"
                className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700 data-[state=active]:border-green-200 border border-transparent py-2.5 text-sm"
              >
                <FolderOpen className="w-4 h-4 mr-1.5" />
                Projects
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700 data-[state=active]:border-green-200 border border-transparent py-2.5 text-sm"
              >
                <PieChart className="w-4 h-4 mr-1.5" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="insights" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                <TrendingUp className="w-4 h-4 mr-2" />
                Insights
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Dashboard Overview Tab - Quality Rating Removed */}
          <TabsContent value="overview" className="space-y-8">
            {/* Filter Status Indicator */}
            <Alert>
              <Filter className="h-4 w-4" />
              <AlertDescription>
                Dashboard data filtered for <strong>{getTimeFilterLabel()}</strong> view.
                Focusing on target vs physical accomplishment metrics only.
              </AlertDescription>
            </Alert>

            {/* Summary Cards - Minimal & Formal Design */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="admin-card hover:border-green-300 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <Target className="w-4 h-4 text-green-600" />
                    </div>
                    <p className="text-xs text-slate-600">Physical Progress</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-slate-900">{data.overview.physicalAccomplishment}%</p>
                    <Progress value={data.overview.physicalAccomplishment} className="h-1.5" />
                    <p className="text-xs text-green-600">
                      +{(data.overview.physicalAccomplishment - data.overview.targetPhysical).toFixed(1)}% vs target
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="admin-card hover:border-blue-300 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                    </div>
                    <p className="text-xs text-slate-600">Completed Projects</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-slate-900">{data.overview.completedProjects}</p>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={(data.overview.completedProjects / data.overview.totalProjects) * 100} 
                        className="h-1.5 flex-1" 
                      />
                      <span className="text-xs text-slate-500">
                        {((data.overview.completedProjects / data.overview.totalProjects) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="admin-card hover:border-amber-300 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-amber-50 rounded-lg">
                      <Activity className="w-4 h-4 text-amber-600" />
                    </div>
                    <p className="text-xs text-slate-600">Ongoing Projects</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-slate-900">{data.overview.ongoingProjects}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Construction className="w-3.5 h-3.5" />
                      <span>Active construction</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="admin-card hover:border-purple-300 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <Home className="w-4 h-4 text-purple-600" />
                    </div>
                    <p className="text-xs text-slate-600">Units Delivered</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-slate-900">{data.overview.completedUnits}</p>
                    <p className="text-xs text-slate-600">
                      of {data.overview.totalUnits} planned units
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Infrastructure Project Categories - Minimal & Formal Design */}
            <div className="space-y-5">
              <div className="admin-header rounded-lg p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-slate-900">Project Categories</h2>
                    <p className="text-slate-600 text-sm mt-1">Select a category to filter projects by status</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {data.categories.length} Categories
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.categories.map((category) => (
                  <Card 
                    key={category.id} 
                    className="admin-card hover:shadow-md transition-all duration-200 cursor-pointer group"
                    onClick={() => {
                      // Filter projects tab by this category's projects
                      setActiveTab('projects');
                      setProjectCategoryFilter(category.name);
                      toast.success(`Viewing ${category.name} projects`);
                    }}
                  >
                    <CardContent className="p-5">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="flex-shrink-0 p-2 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
                            <category.icon className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-slate-900 truncate group-hover:text-green-900 transition-colors">
                              {category.name}
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {category.totalProjects} Projects • {category.completedUnits} Units
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-green-600 transition-colors flex-shrink-0 mt-1" />
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="text-center p-2 bg-slate-50 rounded-lg">
                          <div className="text-green-700">{category.completedProjects}</div>
                          <div className="text-xs text-slate-600 mt-0.5">Completed</div>
                        </div>
                        <div className="text-center p-2 bg-slate-50 rounded-lg">
                          <div className="text-blue-700">{category.ongoingProjects}</div>
                          <div className="text-xs text-slate-600 mt-0.5">Ongoing</div>
                        </div>
                        <div className="text-center p-2 bg-slate-50 rounded-lg">
                          <div className="text-slate-700">{category.totalProjects}</div>
                          <div className="text-xs text-slate-600 mt-0.5">Total</div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-600">Progress</span>
                          <span className="text-slate-900">{category.physicalProgress}%</span>
                        </div>
                        <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all"
                            style={{ width: `${category.physicalProgress}%` }}
                          />
                          {/* Target indicator */}
                          <div 
                            className="absolute top-0 h-2 w-0.5 bg-slate-900"
                            style={{ left: `${category.target}%` }}
                            title={`Target: ${category.target}%`}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>Target: {category.target}%</span>
                          <span className={category.physicalProgress >= category.target ? 'text-green-600' : 'text-amber-600'}>
                            {category.physicalProgress >= category.target 
                              ? `+${(category.physicalProgress - category.target).toFixed(1)}%`
                              : `-${(category.target - category.physicalProgress).toFixed(1)}%`
                            }
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Construction Progress Tracking - Quality Rating Removed */}
            <Card className="bg-white shadow-sm border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <LineChartIcon className="w-5 h-5 text-green-600" />
                      {getTimeFilterLabel()} Tracking
                    </CardTitle>
                    <CardDescription>
                      Target accomplishment comparison with advanced time filtering - Physical progress focus only
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-500" />
                    <Select value={timeFilter} onValueChange={setTimeFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={getFilteredData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="period" 
                        stroke="#64748b"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="#64748b"
                        fontSize={12}
                        domain={[60, 100]}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="physical" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        name="Physical Progress"
                        dot={{ fill: '#10b981', strokeWidth: 2, r: 4, cursor: 'pointer' }}
                        onClick={(data) => handleChartClick(data, 'trend')}
                        style={{ cursor: 'pointer' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="target" 
                        stroke="#64748b" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="Target Progress"
                        dot={{ fill: '#64748b', strokeWidth: 2, r: 3, cursor: 'pointer' }}
                        onClick={(data) => handleChartClick(data, 'trend')}
                        style={{ cursor: 'pointer' }}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 text-sm text-slate-600">
                  <p>Viewing {getTimeFilterLabel().toLowerCase()} construction progress for target vs physical accomplishment comparison. Quality rating removed - focus on physical delivery metrics only.</p>
                </div>
              </CardContent>
            </Card>

            {/* KPI Dashboard - Quality Rating Excluded */}
            <Card className="bg-white shadow-sm border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-600" />
                  Key Performance Indicators
                </CardTitle>
                <CardDescription>
                  Critical success metrics focused on physical accomplishment and target achievement
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {kpiMetrics.map((kpi, index) => (
                    <div 
                      key={index} 
                      className="p-4 border border-slate-200 rounded-lg hover:border-green-300 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => handleKPIClick(kpi)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">{kpi.label}</span>
                        <div className={`flex items-center gap-1 ${
                          kpi.trend === 'up' ? 'text-green-600' : 'text-red-500'
                        }`}>
                          {kpi.trend === 'up' ? 
                            <ArrowUpRight className="w-4 h-4" /> : 
                            <TrendingUp className="w-4 h-4 rotate-180" />
                          }
                        </div>
                      </div>
                      <div className="flex items-end gap-2 mb-2">
                        <span className="text-2xl font-bold text-slate-900">{kpi.value}%</span>
                        <span className="text-sm text-slate-500">/ {kpi.target}%</span>
                      </div>
                      <Progress 
                        value={kpi.value} 
                        className="h-2" 
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Projects Tab - Full CRUD Implementation */}
          <TabsContent value="projects" className="space-y-8">
            {/* Filter Status Indicator */}
            <Alert>
              <Filter className="h-4 w-4" />
              <AlertDescription>
                Projects data filtered for <strong>{getTimeFilterLabel()}</strong> view.
                Click any record to navigate to project details page.
              </AlertDescription>
            </Alert>

            <div className="space-y-6">
              {/* Formal Header Section - CSU Style */}
              <div className="admin-header bg-white rounded-lg p-6 border border-slate-200">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="space-y-2">
                    <h2 className="text-slate-900">Construction Infrastructure Projects</h2>
                    <p className="text-slate-600 text-sm">
                      Manage and monitor all construction projects with role-based access control
                    </p>
                    {userRole !== 'Admin' && userRole !== 'Client' && (
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                        <Shield className="w-3.5 h-3.5" />
                        <span>{constructionInfrastructureRBACService.getPermissionLabel(userRole)}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {userRole === 'Admin' && (
                      <>
                        <Badge variant="outline" className="gap-2 py-1.5 px-3">
                          <Shield className="w-3.5 h-3.5 text-green-600" />
                          <span className="text-xs">Per-Project Access Control</span>
                        </Badge>
                        <Button 
                          onClick={() => {
                            setEditingProject(null);
                            setProjectFormData({
                              projectTitle: '',
                              dateStarted: '',
                              projectDuration: '',
                              targetDateCompletion: '',
                              fundingSource: '',
                              approvedBudget: 0,
                              appropriation: 0,
                              obligation: 0,
                              totalLaborCost: 0,
                              totalProjectCost: 0,
                              disbursement: 0,
                              progressAccomplishment: 0,
                              status: 'Planning',
                              remarks: '',
                              category: 'GAA-Funded Projects'
                            });
                            setNewProjectDialog(true);
                          }}
                          className="gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add Project
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>



              {/* Enhanced Project Table with RBAC */}
              <Card className="admin-card">
                <CardHeader className="border-b border-slate-200">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <CardTitle className="text-slate-900">Project Inventory</CardTitle>
                        <CardDescription>
                          {getPaginatedProjects().totalItems} total projects | {getAllProjects().filter(p => p.status === 'Ongoing').length} active
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Filter className="w-4 h-4" />
                        Viewing {getTimeFilterLabel()}
                      </div>
                    </div>
                    
                    {/* Access Status for Staff/Editor */}
                    {(userRole === 'Staff' || userRole === 'Editor') && (
                      <div className="flex flex-wrap items-center gap-3 text-xs pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-1.5 text-green-700 bg-green-50 px-2.5 py-1 rounded-md">
                          <Eye className="w-3.5 h-3.5" />
                          <span>{constructionInfrastructureRBACService.getAssignedProjects(userEmail).length} Accessible</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md">
                          <Lock className="w-3.5 h-3.5" />
                          <span>{getAllProjects().length - constructionInfrastructureRBACService.getAssignedProjects(userEmail).length} Restricted</span>
                        </div>
                        <div className="text-slate-500">•</div>
                        <span className="text-slate-600">
                          Access indicator: <Lock className="w-3 h-3 inline-block text-amber-600 mx-0.5" /> = No access
                        </span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <EnhancedProjectTable
                    projects={getAllProjects()}
                    userRole={userRole}
                    userEmail={userEmail}
                    externalStatusFilter={projectStatusFilter}
                    onStatusFilterChange={(status) => setProjectStatusFilter(status)}
                    onProjectSelect={(project) => {
                      // RBAC Check: Verify if user can access this project
                      const permissions = constructionInfrastructureRBACService.getUserPermissions(
                        userEmail,
                        userRole,
                        'construction-infrastructure'
                      );

                      // Admin can access all projects
                      if (userRole === 'Admin') {
                        onProjectSelect(project);
                        return;
                      }

                      // Client can view all projects (read-only)
                      if (userRole === 'Client') {
                        onProjectSelect(project);
                        return;
                      }

                      // Staff/Editor: Check if assigned to this project
                      if (userRole === 'Staff' || userRole === 'Editor') {
                        const isAssigned = permissions.assignedProjects?.includes(project.id);
                        
                        if (!isAssigned) {
                          toast.error('Access Denied', {
                            description: 'You are not assigned to this project. Contact an administrator for access.'
                          });
                          return;
                        }
                      }

                      // If all checks pass, allow access
                      onProjectSelect(project);
                    }}
                    onEditProject={(project) => {
                      const canEdit = constructionInfrastructureRBACService.canEditProject(
                        userEmail,
                        userRole,
                        project.id
                      );

                      if (!canEdit) {
                        toast.error('Permission Denied', {
                          description: 'You do not have permission to edit this project.'
                        });
                        return;
                      }

                      setEditingProject(project);
                      setProjectFormData(project);
                      setNewProjectDialog(true);
                    }}
                    onDeleteProject={(project) => {
                      const canDelete = constructionInfrastructureRBACService.canDeleteProject(
                        userEmail,
                        userRole,
                        project.id
                      );

                      if (!canDelete) {
                        toast.error('Permission Denied', {
                          description: 'You do not have permission to delete this project.'
                        });
                        return;
                      }

                      handleDeleteProject(project.id);
                    }}
                    canEdit={userRole === 'Admin' || constructionInfrastructureRBACService.getUserPermissions(
                      userEmail,
                      userRole,
                      'construction-infrastructure'
                    ).canEdit}
                    canDelete={userRole === 'Admin'}
                  />
                </CardContent>
              </Card>

              {/* RBAC Information Panel - For Staff Users */}
              {(userRole === 'Staff' || userRole === 'Editor') && (
                <Card className="admin-card border-blue-200 bg-blue-50/30">
                  <CardContent className="p-5">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="space-y-2 flex-1">
                          <p className="text-sm text-blue-900">
                            <strong>Project Access Control</strong>
                          </p>
                          <p className="text-xs text-blue-700 leading-relaxed">
                            You are currently assigned to <strong>{constructionInfrastructureRBACService.getAssignedProjects(userEmail).length} project(s)</strong>.
                            Projects marked with a <Lock className="w-3 h-3 inline-block text-amber-600 mx-0.5" /> lock icon are restricted.
                          </p>
                        </div>
                      </div>
                      
                      <div className="border-t border-blue-200 pt-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="flex items-center gap-2 text-blue-700">
                            <Eye className="w-3.5 h-3.5" />
                            <span>You can view assigned projects</span>
                          </div>
                          <div className="flex items-center gap-2 text-blue-700">
                            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                            <span>Restricted projects cannot be accessed</span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-xs text-blue-600">
                        Need access to more projects? Contact an administrator to request assignment.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Analytics Tab - Comprehensive Data Visualizations */}
          <TabsContent value="analytics" className="space-y-8">
            {/* Filter Status Indicator */}
            <Alert>
              <Filter className="h-4 w-4" />
              <AlertDescription>
                Analytics data filtered for <strong>{getTimeFilterLabel()}</strong> view.
                Real-time project monitoring and performance insights.
              </AlertDescription>
            </Alert>

            {/* Key Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-emerald-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Building className="w-5 h-5 text-green-700" />
                    </div>
                    <Badge className="bg-green-100 text-green-800 border-green-300">
                      Total
                    </Badge>
                  </div>
                  <p className="text-3xl text-green-900 mt-4">
                    {projectsData.length}
                  </p>
                  <p className="text-sm text-green-700 mt-1">Active Projects</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-cyan-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-blue-700" />
                    </div>
                    <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                      Completed
                    </Badge>
                  </div>
                  <p className="text-3xl text-blue-900 mt-4">
                    {projectsData.filter(p => p.status === 'Completed').length}
                  </p>
                  <p className="text-sm text-blue-700 mt-1">Finished Projects</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-orange-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <Activity className="w-5 h-5 text-amber-700" />
                    </div>
                    <Badge className="bg-amber-100 text-amber-800 border-amber-300">
                      In Progress
                    </Badge>
                  </div>
                  <p className="text-3xl text-amber-900 mt-4">
                    {projectsData.filter(p => p.status === 'Ongoing').length}
                  </p>
                  <p className="text-sm text-amber-700 mt-1">Ongoing Projects</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-pink-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-purple-700" />
                    </div>
                    <Badge className="bg-purple-100 text-purple-800 border-purple-300">
                      Average
                    </Badge>
                  </div>
                  <p className="text-3xl text-purple-900 mt-4">
                    {(projectsData.reduce((sum, p) => sum + p.progressAccomplishment, 0) / projectsData.length).toFixed(1)}%
                  </p>
                  <p className="text-sm text-purple-700 mt-1">Progress Rate</p>
                </CardContent>
              </Card>
            </div>

            {/* Physical Target vs Physical Accomplishment - Enhanced 2-column layout for better spacing */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Project Status Distribution - Improved spacing with better proportions */}
              <Card className="bg-white shadow-sm border-0 lg:col-span-5 xl:col-span-4">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-blue-600" />
                    Project Status Distribution
                  </CardTitle>
                  <CardDescription>
                    Click any segment to filter projects by status
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Pie Chart - Larger and better proportioned */}
                  <div className="flex items-center justify-center">
                    <div className="w-full max-w-[280px] aspect-square">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={[
                              { name: 'Completed', value: projectsData.filter(p => p.status === 'Completed').length, fill: '#10b981', status: 'Completed' },
                              { name: 'Ongoing', value: projectsData.filter(p => p.status === 'Ongoing').length, fill: '#f59e0b', status: 'Ongoing' },
                              { name: 'Planning', value: projectsData.filter(p => p.status === 'Planning').length, fill: '#8b5cf6', status: 'Planning' },
                              { name: 'On Hold', value: projectsData.filter(p => p.status === 'On Hold').length, fill: '#ef4444', status: 'On Hold' }
                            ].filter(item => item.value > 0)}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value, percent }) => `${name}\n${value} (${(percent * 100).toFixed(0)}%)`}
                            outerRadius="85%"
                            dataKey="value"
                            onClick={(data) => {
                              if (data && data.status) {
                                setProjectStatusFilter(data.status);
                                setActiveTab('projects');
                                toast.success(`Filtering projects by status: ${data.status}`, {
                                  description: 'Navigated to Project List tab'
                                });
                                // Trigger tab change
                                const tabElement = document.querySelector('[value="projects"]');
                                if (tabElement) {
                                  (tabElement as HTMLElement).click();
                                }
                              }
                            }}
                            cursor="pointer"
                          >
                            {[
                              { name: 'Completed', value: projectsData.filter(p => p.status === 'Completed').length, fill: '#10b981' },
                              { name: 'Ongoing', value: projectsData.filter(p => p.status === 'Ongoing').length, fill: '#f59e0b' },
                              { name: 'Planning', value: projectsData.filter(p => p.status === 'Planning').length, fill: '#8b5cf6' },
                              { name: 'On Hold', value: projectsData.filter(p => p.status === 'On Hold').length, fill: '#ef4444' }
                            ].filter(item => item.value > 0).map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={entry.fill}
                                className="hover:opacity-80 transition-opacity"
                              />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  {/* Status Legend - Improved spacing and readability */}
                  <div className="space-y-3 pt-2">
                    <Separator />
                    <div className="space-y-2.5">
                      {[
                        { name: 'Completed', count: projectsData.filter(p => p.status === 'Completed').length, color: 'bg-green-500', percentage: (projectsData.filter(p => p.status === 'Completed').length / projectsData.length * 100).toFixed(1) },
                        { name: 'Ongoing', count: projectsData.filter(p => p.status === 'Ongoing').length, color: 'bg-amber-500', percentage: (projectsData.filter(p => p.status === 'Ongoing').length / projectsData.length * 100).toFixed(1) },
                        { name: 'Planning', count: projectsData.filter(p => p.status === 'Planning').length, color: 'bg-purple-500', percentage: (projectsData.filter(p => p.status === 'Planning').length / projectsData.length * 100).toFixed(1) },
                        { name: 'On Hold', count: projectsData.filter(p => p.status === 'On Hold').length, color: 'bg-red-500', percentage: (projectsData.filter(p => p.status === 'On Hold').length / projectsData.length * 100).toFixed(1) }
                      ].filter(item => item.count > 0).map((item, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setProjectStatusFilter(item.name);
                            setActiveTab('projects');
                            toast.success(`Viewing ${item.name} projects`);
                          }}
                          className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors group cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full ${item.color} group-hover:scale-110 transition-transform`} />
                            <span className="text-gray-900">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-gray-600">{item.percentage}%</span>
                            <Badge variant="outline" className="bg-gray-50 text-gray-900">
                              {item.count}
                            </Badge>
                          </div>
                        </button>
                      ))}
                    </div>
                    
                    {/* Total Summary */}
                    <div className="pt-2 mt-2 border-t border-gray-200">
                      <div className="flex items-center justify-between p-2">
                        <span className="text-gray-700">Total Projects</span>
                        <Badge className="bg-blue-100 text-blue-900 border-blue-200">
                          {projectsData.length}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Physical Target vs Physical Accomplishment - Per Project Basis */}
              <Card className="bg-white shadow-sm border-0 lg:col-span-7 xl:col-span-8">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-green-600" />
                        Physical Target vs Accomplishment
                      </CardTitle>
                      <CardDescription>
                        Select a project to view detailed progress analysis
                      </CardDescription>
                    </div>
                    <div className="relative w-full sm:w-80">
                      <Select 
                        value={budgetSearchQuery} 
                        onValueChange={(value) => {
                          setBudgetSearchQuery(value);
                          setCurrentBudgetProjectIndex(0); // Reset to first project
                        }}
                      >
                        <SelectTrigger className="border-gray-300">
                          <SelectValue placeholder="Search or select a project..." />
                        </SelectTrigger>
                        <SelectContent className="max-h-80">
                          <SelectItem value="all">All Projects</SelectItem>
                          <div className="border-b my-1" />
                          {projectsData.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.projectTitle}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {(() => {
                      // Filter projects based on search query
                      let filteredProjects = projectsData;
                      
                      if (budgetSearchQuery !== 'all') {
                        // If a specific project is selected, show only that project
                        filteredProjects = projectsData.filter(p => p.id === budgetSearchQuery);
                      }
                      
                      if (filteredProjects.length === 0) {
                        return (
                          <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                              <Target className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-500">Select a project to view progress details</p>
                          </div>
                        );
                      }
                      
                      // Get current project to display (one at a time)
                      const validIndex = Math.min(currentBudgetProjectIndex, filteredProjects.length - 1);
                      const currentProject = filteredProjects[validIndex];
                      
                      return (
                        <>
                          {/* Single Project Progress Analysis */}
                          <div className="space-y-4">
                            {(() => {
                              const project = currentProject;
                              const physicalTarget = 100; // 100% is the target
                              const physicalAccomplishment = project.progressAccomplishment;
                              const variance = physicalAccomplishment - physicalTarget;
                              
                              return (
                                <div 
                                  key={project.id}
                                  className="border border-gray-200 rounded-lg p-5 hover:border-green-300 hover:shadow-md transition-all bg-gradient-to-r from-white to-gray-50"
                                >
                                  {/* Project Header */}
                                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                                    <div className="flex-1">
                                      <h4 className="font-medium text-gray-900 mb-1">{project.projectTitle}</h4>
                                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                          {project.fundingSource}
                                        </Badge>
                                        <Badge 
                                          variant="outline" 
                                          className={`${
                                            project.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' :
                                            project.status === 'Ongoing' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                            project.status === 'Planning' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                            'bg-red-50 text-red-700 border-red-200'
                                          }`}
                                        >
                                          {project.status}
                                        </Badge>
                                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                          {project.category}
                                        </Badge>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xs text-gray-500 mb-1">Physical Progress</p>
                                      <p className={`text-2xl font-semibold ${
                                        physicalAccomplishment >= 90 ? 'text-green-600' :
                                        physicalAccomplishment >= 70 ? 'text-emerald-600' :
                                        physicalAccomplishment >= 50 ? 'text-amber-600' :
                                        'text-blue-600'
                                      }`}>
                                        {physicalAccomplishment.toFixed(1)}%
                                      </p>
                                    </div>
                                  </div>

                                  {/* Progress Metrics */}
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                                      <p className="text-xs text-blue-700 mb-1">Physical Target</p>
                                      <p className="text-2xl font-semibold text-blue-900">{physicalTarget}%</p>
                                      <p className="text-xs text-blue-600 mt-1">Expected Completion</p>
                                    </div>
                                    <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                                      <p className="text-xs text-green-700 mb-1">Physical Accomplishment</p>
                                      <p className="text-2xl font-semibold text-green-900">{physicalAccomplishment}%</p>
                                      <p className="text-xs text-green-600 mt-1">Current Progress</p>
                                    </div>
                                    <div className={`${
                                      variance >= 0 ? 'bg-green-50 border-green-100' :
                                      variance >= -10 ? 'bg-amber-50 border-amber-100' :
                                      'bg-red-50 border-red-100'
                                    } border rounded-lg p-4`}>
                                      <p className={`text-xs mb-1 ${
                                        variance >= 0 ? 'text-green-700' :
                                        variance >= -10 ? 'text-amber-700' :
                                        'text-red-700'
                                      }`}>Variance</p>
                                      <p className={`text-2xl font-semibold ${
                                        variance >= 0 ? 'text-green-900' :
                                        variance >= -10 ? 'text-amber-900' :
                                        'text-red-900'
                                      }`}>
                                        {variance >= 0 ? '+' : ''}{variance.toFixed(1)}%
                                      </p>
                                      <p className={`text-xs mt-1 ${
                                        variance >= 0 ? 'text-green-600' :
                                        variance >= -10 ? 'text-amber-600' :
                                        'text-red-600'
                                      }`}>
                                        {variance >= 0 ? 'Ahead of Target' : 'Below Target'}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Progress Bar Visualization */}
                                  <div className="space-y-3 bg-white border border-gray-200 rounded-lg p-4">
                                    <div className="flex justify-between items-center">
                                      <p className="text-sm font-medium text-gray-700">Physical Progress Visualization</p>
                                      <p className="text-sm text-gray-600">{physicalAccomplishment}% Complete</p>
                                    </div>
                                    <div className="relative h-8 bg-gray-200 rounded-lg overflow-hidden">
                                      {/* Target line marker */}
                                      <div 
                                        className="absolute top-0 bottom-0 w-0.5 bg-blue-600 z-10"
                                        style={{ left: `${physicalTarget}%` }}
                                      />
                                      {/* Accomplishment bar */}
                                      <div 
                                        className={`absolute top-0 left-0 h-full rounded-lg transition-all ${
                                          physicalAccomplishment >= 90 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                                          physicalAccomplishment >= 70 ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' :
                                          physicalAccomplishment >= 50 ? 'bg-gradient-to-r from-amber-500 to-amber-600' :
                                          'bg-gradient-to-r from-blue-500 to-blue-600'
                                        }`}
                                        style={{ width: `${Math.min(physicalAccomplishment, 100)}%` }}
                                      >
                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-white font-medium">
                                          {physicalAccomplishment}%
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                      <span className="text-gray-500">0%</span>
                                      <div className="flex items-center gap-1 text-blue-600">
                                        <div className="w-3 h-0.5 bg-blue-600" />
                                        <span>Target: {physicalTarget}%</span>
                                      </div>
                                      <span className="text-gray-500">100%</span>
                                    </div>
                                  </div>

                                  {/* Comparison Chart */}
                                  <div className="mt-4 h-48 border-t border-gray-200 pt-4">
                                    <p className="text-sm font-medium text-gray-700 mb-3">Target vs Accomplishment Comparison</p>
                                    <ResponsiveContainer width="100%" height="100%">
                                      <BarChart
                                        data={[
                                          {
                                            category: 'Physical Progress',
                                            'Target': physicalTarget,
                                            'Accomplishment': physicalAccomplishment
                                          }
                                        ]}
                                        layout="vertical"
                                        margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
                                      >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                        <XAxis 
                                          type="number" 
                                          domain={[0, 100]}
                                          stroke="#64748b"
                                          fontSize={12}
                                          label={{ value: 'Percentage (%)', position: 'insideBottom', offset: -5, fontSize: 12 }}
                                        />
                                        <YAxis 
                                          type="category"
                                          dataKey="category"
                                          stroke="#64748b"
                                          fontSize={12}
                                          width={110}
                                        />
                                        <Tooltip 
                                          contentStyle={{
                                            backgroundColor: 'white',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px'
                                          }}
                                          formatter={(value: number) => [`${value.toFixed(1)}%`, '']}
                                        />
                                        <Bar dataKey="Target" fill="#3b82f6" name="Physical Target" radius={[0, 4, 4, 0]} />
                                        <Bar dataKey="Accomplishment" fill="#10b981" name="Physical Accomplishment" radius={[0, 4, 4, 0]} />
                                      </BarChart>
                                    </ResponsiveContainer>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>

                          {/* Navigation Controls - Show only when displaying all projects */}
                          {budgetSearchQuery === 'all' && filteredProjects.length > 1 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200">
                              <p className="text-sm text-gray-600">
                                Showing project {validIndex + 1} of {filteredProjects.length}
                              </p>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setCurrentBudgetProjectIndex(Math.max(0, currentBudgetProjectIndex - 1))}
                                  disabled={currentBudgetProjectIndex === 0}
                                  className="border-gray-300"
                                >
                                  <ChevronDown className="w-4 h-4 rotate-90 mr-1" />
                                  Previous Project
                                </Button>
                                <span className="text-sm text-gray-600 px-3">
                                  {validIndex + 1} / {filteredProjects.length}
                                </span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setCurrentBudgetProjectIndex(Math.min(filteredProjects.length - 1, currentBudgetProjectIndex + 1))}
                                  disabled={currentBudgetProjectIndex >= filteredProjects.length - 1}
                                  className="border-gray-300"
                                >
                                  Next Project
                                  <ChevronDown className="w-4 h-4 -rotate-90 ml-1" />
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* Summary Statistics for All Projects */}
                          {budgetSearchQuery === 'all' && (
                            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                              <div className="text-center p-4 bg-green-50 border border-green-100 rounded-lg">
                                <p className="text-xs text-green-700 mb-1">Total Approved Budget (All)</p>
                                <p className="text-xl font-semibold text-green-900">
                                  ₱{(projectsData.reduce((sum, p) => sum + p.approvedBudget, 0) / 1000000).toFixed(2)}M
                                </p>
                              </div>
                              <div className="text-center p-4 bg-blue-50 border border-blue-100 rounded-lg">
                                <p className="text-xs text-blue-700 mb-1">Total Disbursed (All)</p>
                                <p className="text-xl font-semibold text-blue-900">
                                  ₱{(projectsData.reduce((sum, p) => sum + p.disbursement, 0) / 1000000).toFixed(2)}M
                                </p>
                              </div>
                              <div className="text-center p-4 bg-gray-50 border border-gray-100 rounded-lg">
                                <p className="text-xs text-gray-700 mb-1">Average Utilization (All)</p>
                                <p className="text-xl font-semibold text-gray-900">
                                  {(projectsData.reduce((sum, p) => sum + (p.disbursement / p.approvedBudget * 100), 0) / projectsData.length).toFixed(1)}%
                                </p>
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Project Timeline Visualization with Search Dropdown & Pagination */}
            <Card className="bg-white shadow-sm border-0">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-purple-600" />
                      Project Timeline Overview
                    </CardTitle>
                    <CardDescription>
                      Select a project to view timeline progress (3 per page)
                    </CardDescription>
                  </div>
                  <div className="relative w-full sm:w-80">
                    <Select 
                      value={timelineSearchQuery} 
                      onValueChange={(value) => {
                        setTimelineSearchQuery(value);
                        setVisibleTimelineProjects(3); // Reset to page 1
                      }}
                    >
                      <SelectTrigger className="border-gray-300">
                        <SelectValue placeholder="Select project to view timeline..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Projects</SelectItem>
                        {projectsData.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.projectTitle}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(() => {
                    // Filter projects based on dropdown selection
                    const filteredProjects = timelineSearchQuery && timelineSearchQuery !== 'all'
                      ? projectsData.filter(project => project.id === timelineSearchQuery)
                      : projectsData;
                    
                    // Calculate pagination
                    const itemsPerPage = 3;
                    const currentPage = Math.floor(visibleTimelineProjects / itemsPerPage);
                    const startIndex = currentPage * itemsPerPage;
                    const endIndex = startIndex + itemsPerPage;
                    const displayProjects = filteredProjects.slice(startIndex, endIndex);
                    const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
                    
                    return (
                      <>
                        {displayProjects.length === 0 ? (
                          <div className="text-center py-12">
                            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-sm text-gray-600">No project selected</p>
                            <p className="text-xs text-gray-500 mt-1">Please select a project from the dropdown above</p>
                          </div>
                        ) : (
                          <>
                            {displayProjects.map((project, index) => {
                    const startDate = new Date(project.dateStarted);
                    const endDate = new Date(project.targetDateCompletion);
                    const today = new Date();
                    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                    const elapsedDays = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                    const timeProgress = Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));
                    const isCompleted = project.status === 'Completed';
                    const isDelayed = !isCompleted && project.progressAccomplishment < timeProgress;
                    
                    return (
                      <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm text-gray-900">{project.projectTitle}</h4>
                              <Badge 
                                className={
                                  project.status === 'Completed' 
                                    ? 'bg-green-100 text-green-800 border-green-300' 
                                    : project.status === 'Ongoing' 
                                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                                    : project.status === 'Planning'
                                    ? 'bg-purple-100 text-purple-800 border-purple-300'
                                    : 'bg-gray-100 text-gray-800 border-gray-300'
                                }
                              >
                                {project.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-600">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(project.dateStarted).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                              <span>→</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(project.targetDateCompletion).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                              <span className="text-gray-500">({project.projectDuration})</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl text-gray-900">{project.progressAccomplishment.toFixed(1)}%</p>
                            <p className="text-xs text-gray-500">Progress</p>
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs text-gray-600">
                            <span>Physical Progress</span>
                            <span>{project.progressAccomplishment.toFixed(1)}% of 100%</span>
                          </div>
                          <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className={`absolute top-0 left-0 h-full transition-all ${
                                isCompleted 
                                  ? 'bg-green-500' 
                                  : isDelayed 
                                  ? 'bg-red-500'
                                  : 'bg-blue-500'
                              }`}
                              style={{ width: `${project.progressAccomplishment}%` }}
                            />
                          </div>
                          
                          {/* Timeline Progress */}
                          <div className="flex items-center justify-between text-xs text-gray-500 mt-3">
                            <span>Timeline Progress</span>
                            <span>{timeProgress.toFixed(1)}% elapsed</span>
                          </div>
                          <div className="relative h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="absolute top-0 left-0 h-full bg-gray-400 transition-all"
                              style={{ width: `${timeProgress}%` }}
                            />
                          </div>
                          
                          {isDelayed && !isCompleted && (
                            <Alert className="mt-3 border-red-200 bg-red-50">
                              <AlertCircle className="w-4 h-4 text-red-600" />
                              <AlertDescription className="text-xs text-red-700">
                                <strong>Attention:</strong> Project progress is behind schedule ({(timeProgress - project.progressAccomplishment).toFixed(1)}% gap)
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </div>
                    );
                            })}
                            
                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                <div className="text-xs text-gray-600">
                                  Page {currentPage + 1} of {totalPages} • Showing {displayProjects.length} of {filteredProjects.length} projects
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setVisibleTimelineProjects(prev => Math.max(0, prev - 3))}
                                    disabled={currentPage === 0}
                                    className="gap-2"
                                  >
                                    <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                                    Previous
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setVisibleTimelineProjects(prev => prev + 3)}
                                    disabled={currentPage >= totalPages - 1}
                                    className="gap-2"
                                  >
                                    Next
                                    <ChevronRight className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>

            {/* Physical Accomplishment Trend */}
            <Card className="bg-white shadow-sm border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChartIcon className="w-5 h-5 text-green-600" />
                  {getTimeFilterLabel()} Physical Accomplishment Trend
                </CardTitle>
                <CardDescription>
                  Historical performance tracking with time-based filtering
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={getFilteredData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="period" 
                        stroke="#64748b"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="#64748b"
                        fontSize={12}
                        domain={[60, 100]}
                        label={{ value: 'Progress (%)', angle: -90, position: 'insideLeft', fontSize: 12 }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="physical" 
                        stroke="#10b981" 
                        fill="#10b981"
                        fillOpacity={0.6}
                        name="Physical Progress"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="target" 
                        stroke="#64748b" 
                        fill="#64748b"
                        fillOpacity={0.3}
                        name="Target Progress"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab - Fixed Edit Functionality */}
          <TabsContent value="insights" className="space-y-8">
            {/* Filter Status Indicator */}
            <Alert>
              <Filter className="h-4 w-4" />
              <AlertDescription>
                Insights filtered for <strong>{getTimeFilterLabel()}</strong> view.
                Edit buttons are now fully functional for content management.
              </AlertDescription>
            </Alert>

            {/* Announcements and Highlights - Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Latest Announcements Section */}
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-blue-100 rounded-lg border border-blue-200">
                        <Bell className="w-5 h-5 text-blue-700" />
                      </div>
                      <div>
                        <CardTitle className="text-blue-900">Latest Announcements</CardTitle>
                        <CardDescription className="text-blue-700">
                          Recent updates and important notices
                        </CardDescription>
                      </div>
                    </div>
                    {userRole === 'Admin' && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setEditingAnnouncement(null);
                          setAnnouncementFormData({ title: '', content: '', date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) });
                          setAnnouncementDialog(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1.5" />
                        Add
                      </Button>
                    )}
                  </div>
                </CardHeader>
              <CardContent className="space-y-3">
                {announcements.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="w-12 h-12 text-blue-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-600">No announcements yet</p>
                    {userRole === 'Admin' && (
                      <p className="text-xs text-gray-500 mt-1">Click "Add" to create your first announcement</p>
                    )}
                  </div>
                ) : (
                  announcements.map((announcement) => (
                    <div key={announcement.id} className="bg-white rounded-lg p-4 border border-blue-200 hover:shadow-md transition-shadow group">
                      <div className="flex items-start gap-3">
                        <Megaphone className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">
                            <strong>{announcement.title}:</strong> {announcement.content}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{announcement.date}</p>
                        </div>
                        {userRole === 'Admin' && (
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingAnnouncement(announcement);
                                setAnnouncementFormData({
                                  title: announcement.title,
                                  content: announcement.content,
                                  date: announcement.date
                                });
                                setAnnouncementDialog(true);
                              }}
                              className="h-7 w-7 p-0"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this announcement?')) {
                                  handleDeleteAnnouncement(announcement.id);
                                }
                              }}
                              className="h-7 w-7 p-0 hover:text-red-600"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
              </Card>

              {/* Project Highlights Section */}
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-green-100 rounded-lg border border-green-200">
                      <Star className="w-5 h-5 text-green-700" />
                    </div>
                    <div>
                      <CardTitle className="text-green-900">Project Highlights</CardTitle>
                      <CardDescription className="text-green-700">
                        Featured construction projects and achievements
                      </CardDescription>
                    </div>
                  </div>
                  {userRole === 'Admin' && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setEditingHighlight(null);
                        setHighlightFormData({ projectId: '', description: '' });
                        setHighlightDialog(true);
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1.5" />
                      Add
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {projectHighlights.length === 0 ? (
                  <div className="text-center py-12">
                    <Star className="w-12 h-12 text-green-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-600">No project highlights yet</p>
                    {userRole === 'Admin' && (
                      <p className="text-xs text-gray-500 mt-1">Click "Add" to feature your first project</p>
                    )}
                  </div>
                ) : (
                  projectHighlights.map((highlight) => (
                    <div 
                      key={highlight.id}
                      className="bg-white rounded-lg p-4 border border-green-200 hover:shadow-md transition-all cursor-pointer hover:border-green-400 group relative"
                      onClick={() => {
                        if (userRole !== 'Client') {
                          const project = projectsData.find(p => p.id === highlight.projectId);
                          if (project) {
                            onProjectSelect(project);
                          }
                        } else {
                          toast.error('Please log in to view project details', {
                            description: 'Authentication required to access detailed project information'
                          });
                        }
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Building className="w-4 h-4 text-green-600" />
                            <h4 className="text-sm text-gray-900">{highlight.projectTitle}</h4>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">
                            {highlight.description}
                          </p>
                          <div className="flex items-center gap-3 text-xs">
                            <Badge className={highlight.progress >= 90 ? "bg-green-100 text-green-800 border-green-300" : "bg-amber-100 text-amber-800 border-amber-300"}>
                              Progress: {highlight.progress.toFixed(1)}%
                            </Badge>
                            <span className="text-gray-500">{highlight.fundingSource}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          {userRole !== 'Client' && (
                            <ExternalLink className="w-4 h-4 text-green-600 flex-shrink-0" />
                          )}
                          {userRole === 'Admin' && (
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingHighlight(highlight);
                                  setHighlightFormData({
                                    projectId: highlight.projectId,
                                    description: highlight.description
                                  });
                                  setHighlightDialog(true);
                                }}
                                className="h-7 w-7 p-0"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  if (confirm('Are you sure you want to remove this highlight?')) {
                                    handleDeleteHighlight(highlight.id);
                                  }
                                }}
                                className="h-7 w-7 p-0 hover:text-red-600"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
              </Card>
            </div>

            {/* Enhanced Insights Management */}
            <div className="flex items-center justify-between mt-8">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Strategic Insights</h2>
                <p className="text-slate-600">Actionable insights for construction infrastructure management</p>
              </div>
              {(userRole === 'Admin' || userRole === 'Staff') && (
                <Button onClick={() => setNewContainerDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Container
                </Button>
              )}
            </div>

            {/* Two-Column Insights Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {insightContainers.map((container) => (
                <Card key={container.id} className="bg-white shadow-sm border-0">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {container.type === 'achievements' && <CheckCircle className="w-5 h-5 text-green-600" />}
                          {container.type === 'improvements' && <TrendingUp className="w-5 h-5 text-amber-600" />}
                          {container.type === 'recommendations' && <Target className="w-5 h-5 text-blue-600" />}
                          {container.type === 'custom' && <Info className="w-5 h-5 text-purple-600" />}
                          {container.title}
                        </CardTitle>
                        <CardDescription>
                          {container.quarter} assessment insights
                        </CardDescription>
                      </div>
                      {(userRole === 'Admin' || userRole === 'Staff') && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditContainer(container.id)}
                            title="Edit Container"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {container.type === 'custom' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteContainer(container.id)}
                              className="text-red-600 hover:bg-red-50"
                              title="Delete Container"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {editingContainer === container.id ? (
                      <div className="space-y-3">
                        {container.items.map((item, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <Textarea
                              value={item}
                              onChange={(e) => {
                                const updatedItems = [...container.items];
                                updatedItems[index] = e.target.value;
                                setInsightContainers(containers =>
                                  containers.map(c =>
                                    c.id === container.id ? { ...c, items: updatedItems } : c
                                  )
                                );
                              }}
                              className="flex-1 min-h-[80px] resize-y"
                              placeholder="Enter multi-line insight text..."
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteInsightItem(container.id, index)}
                              className="text-red-600 mt-2"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        <div className="flex items-start gap-2">
                          <Textarea
                            placeholder="Add new insight item... (multi-line supported)"
                            value={newInsightItem}
                            onChange={(e) => setNewInsightItem(e.target.value)}
                            className="flex-1 min-h-[80px] resize-y"
                          />
                          <Button
                            size="sm"
                            onClick={() => {
                              handleAddInsightItem(container.id, newInsightItem);
                              setNewInsightItem('');
                            }}
                            className="mt-2"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingContainer(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleSaveContainer(container.id, container)}
                          >
                            Save Changes
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {container.items.map((item, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                            {container.type === 'achievements' && <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />}
                            {container.type === 'improvements' && <ArrowUpRight className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />}
                            {container.type === 'recommendations' && <Target className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />}
                            {container.type === 'custom' && <Info className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />}
                            <div className="text-sm text-slate-700 flex-1">
                              {item.split('\n').map((line, lineIndex) => (
                                <p key={lineIndex} className={lineIndex > 0 ? 'mt-2' : ''}>
                                  {line}
                                </p>
                              ))}
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Enhanced Project CRUD Dialog - Responsive Pattern */}
      <Dialog open={newProjectDialog} onOpenChange={setNewProjectDialog}>
        <DialogContent className="w-[95vw] max-w-[90vw] lg:max-w-[85vw] xl:max-w-[80vw] 2xl:max-w-[75vw] max-h-[95vh] bg-white border-0 shadow-2xl rounded-lg overflow-hidden [&>button]:hidden">
          {/* Enhanced Formal Header with Close Button */}
          <DialogHeader className="bg-gradient-to-r from-green-900 via-emerald-900 to-teal-900 text-white -m-6 px-8 py-6 mb-0 relative">
            <Button
              onClick={() => setNewProjectDialog(false)}
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 h-8 w-8 p-0 text-white hover:bg-white/10 hover:text-white rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
            <DialogTitle className="flex items-center gap-4 text-xl pr-12">
              <div className="p-3 bg-white/10 rounded-xl shadow-lg">
                <Building className="h-6 w-6" />
              </div>
              <div>
                <span className="block">{editingProject ? 'Edit Construction Project' : 'Add New Construction Project'}</span>
                <p className="text-sm font-normal text-green-100 mt-2 leading-relaxed">
                  {editingProject ? 'Update project information with complete financial details' : 'Create a new construction project with GAA-Funded Projects attributes'}
                </p>
              </div>
            </DialogTitle>
            <DialogDescription className="sr-only">
              {editingProject ? 'Edit existing construction project details including budget, timeline, and progress information.' : 'Add new construction project with complete financial details, timeline, and project information.'}
            </DialogDescription>
          </DialogHeader>

          {/* Responsive Content Area with Smart Scrolling */}
          <div className="flex-1 overflow-y-auto max-h-[calc(95vh-200px)]">
            <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Project Title</label>
                <Input
                  placeholder="Enter project title"
                  value={projectFormData.projectTitle}
                  onChange={(e) => setProjectFormData({ ...projectFormData, projectTitle: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Date Started</label>
                <Input
                  type="date"
                  value={projectFormData.dateStarted}
                  onChange={(e) => setProjectFormData({ ...projectFormData, dateStarted: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Project Duration</label>
                <Input
                  placeholder="e.g., 12 months"
                  value={projectFormData.projectDuration}
                  onChange={(e) => setProjectFormData({ ...projectFormData, projectDuration: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Target Date Completion</label>
                <Input
                  type="date"
                  value={projectFormData.targetDateCompletion}
                  onChange={(e) => setProjectFormData({ ...projectFormData, targetDateCompletion: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Funding Source</label>
                <Select value={projectFormData.fundingSource} onValueChange={(value) => setProjectFormData({ ...projectFormData, fundingSource: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General Appropriations Act (GAA)">General Appropriations Act (GAA)</SelectItem>
                    <SelectItem value="Local Government Funding">Local Government Funding</SelectItem>
                    <SelectItem value="Special Grants Partnership">Special Grants Partnership</SelectItem>
                    <SelectItem value="Income Generating Project">Income Generating Project</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select value={projectFormData.category} onValueChange={(value) => setProjectFormData({ ...projectFormData, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GAA-Funded Projects">GAA-Funded Projects</SelectItem>
                    <SelectItem value="Locally-Funded Projects">Locally-Funded Projects</SelectItem>
                    <SelectItem value="Special Grants Projects">Special Grants Projects</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select value={projectFormData.status} onValueChange={(value) => setProjectFormData({ ...projectFormData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Planning">Planning</SelectItem>
                    <SelectItem value="Ongoing">Ongoing</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="On Hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Approved Budget</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={projectFormData.approvedBudget}
                  onChange={(e) => setProjectFormData({ ...projectFormData, approvedBudget: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Appropriation</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={projectFormData.appropriation}
                  onChange={(e) => setProjectFormData({ ...projectFormData, appropriation: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Obligation</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={projectFormData.obligation}
                  onChange={(e) => setProjectFormData({ ...projectFormData, obligation: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Total Labor Cost</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={projectFormData.totalLaborCost}
                  onChange={(e) => setProjectFormData({ ...projectFormData, totalLaborCost: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Total Project Cost</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={projectFormData.totalProjectCost}
                  onChange={(e) => setProjectFormData({ ...projectFormData, totalProjectCost: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Disbursement</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={projectFormData.disbursement}
                  onChange={(e) => setProjectFormData({ ...projectFormData, disbursement: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Progress Accomplishment (%)</label>
                <Input
                  type="number"
                  placeholder="0"
                  min="0"
                  max="100"
                  value={projectFormData.progressAccomplishment}
                  onChange={(e) => setProjectFormData({ ...projectFormData, progressAccomplishment: Number(e.target.value) })}
                />
              </div>
            </div>
            
            <div className="md:col-span-2">
              <label className="text-sm font-medium">Remarks</label>
              <Textarea
                placeholder="Enter project remarks..."
                value={projectFormData.remarks}
                onChange={(e) => setProjectFormData({ ...projectFormData, remarks: e.target.value })}
              />
            </div>

            {/* Personnel Assignment Section - Only for Admin when creating new project */}
            {userRole === 'Admin' && !editingProject && (
              <div className="md:col-span-2 space-y-3">
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-green-50 rounded border border-green-100">
                      <Users className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-900">Assign Personnel (Optional)</label>
                      <p className="text-xs text-gray-500 mt-0.5">Select staff members who will have access to this project</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    {AVAILABLE_STAFF.map((staff) => (
                      <div
                        key={staff.email}
                        className="flex items-start gap-3 p-3 bg-white rounded border border-gray-200 hover:border-green-200 transition-colors"
                      >
                        <Checkbox
                          id={`staff-${staff.email}`}
                          checked={projectFormData.assignedPersonnel?.includes(staff.email) || false}
                          onCheckedChange={(checked) => {
                            const currentAssigned = projectFormData.assignedPersonnel || [];
                            if (checked) {
                              setProjectFormData({
                                ...projectFormData,
                                assignedPersonnel: [...currentAssigned, staff.email]
                              });
                            } else {
                              setProjectFormData({
                                ...projectFormData,
                                assignedPersonnel: currentAssigned.filter(e => e !== staff.email)
                              });
                            }
                          }}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <label
                            htmlFor={`staff-${staff.email}`}
                            className="text-sm text-gray-900 cursor-pointer block"
                          >
                            {staff.name}
                          </label>
                          <p className="text-xs text-gray-500 mt-0.5">{staff.department}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {projectFormData.assignedPersonnel && projectFormData.assignedPersonnel.length > 0 && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-green-700 bg-green-50 px-3 py-2 rounded border border-green-200">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{projectFormData.assignedPersonnel.length} {projectFormData.assignedPersonnel.length === 1 ? 'person' : 'personnel'} will be assigned with default permissions (Edit, View, Upload)</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            </div>
          </div>
          </div>

          <DialogFooter className="border-t border-gray-200 pt-4 px-8 -mb-6 -mx-6 bg-gray-50">
            <Button variant="outline" onClick={() => setNewProjectDialog(false)} className="border-gray-300">
              Cancel
            </Button>
            <Button onClick={editingProject ? handleUpdateProject : handleAddProject} className="bg-green-600 hover:bg-green-700">
              <Save className="w-4 h-4 mr-2" />
              {editingProject ? 'Update Project' : 'Add Project'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enhanced Chart Management Dialog - FIXED WITH PROPER CHART ATTRIBUTES */}
      <Dialog open={newChartDialog} onOpenChange={setNewChartDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingChart ? 'Edit Chart' : 'Add New Analytics Chart'}</DialogTitle>
            <DialogDescription>
              {editingChart ? 'Update chart configuration with x/y variables and legend settings' : 'Create a new data visualization with complete chart configuration including axes and legends'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Chart Title</label>
              <Input
                placeholder="e.g., Physical Progress Analysis"
                value={newChart.title}
                onChange={(e) => setNewChart({ ...newChart, title: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Chart Type</label>
              <Select value={newChart.type} onValueChange={(value) => setNewChart({ ...newChart, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select chart type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">Line Chart</SelectItem>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                  <SelectItem value="area">Area Chart</SelectItem>
                  <SelectItem value="pie">Pie Chart</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Data Source</label>
              <Select value={newChart.dataSource} onValueChange={(value) => setNewChart({ ...newChart, dataSource: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select data source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="timeSeriesData">Time Series Data</SelectItem>
                  <SelectItem value="categoryTrends">Category Trends</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">X-Axis Variable</label>
              <Select value={newChart.xAxis} onValueChange={(value) => setNewChart({ ...newChart, xAxis: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select X variable" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="period">Time Period (Weekly/Monthly/Quarterly/Yearly)</SelectItem>
                  <SelectItem value="category">Project Category</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Y-Axis Variable</label>
              <Select value={newChart.yAxis} onValueChange={(value) => setNewChart({ ...newChart, yAxis: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Y variable" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="physical">Physical Progress (%)</SelectItem>
                  <SelectItem value="target">Target Progress (%)</SelectItem>
                  <SelectItem value="completed">Completed Projects</SelectItem>
                  <SelectItem value="units">Infrastructure Units</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Chart Color</label>
              <Select value={newChart.color} onValueChange={(value) => setNewChart({ ...newChart, color: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="#3b82f6">Blue</SelectItem>
                  <SelectItem value="#10b981">Green</SelectItem>
                  <SelectItem value="#f59e0b">Orange</SelectItem>
                  <SelectItem value="#8b5cf6">Purple</SelectItem>
                  <SelectItem value="#ef4444">Red</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium">Legend Options</label>
              <div className="flex items-center gap-4 mt-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newChart.showTarget}
                    onChange={(e) => setNewChart({ ...newChart, showTarget: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Show Target Line</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newChart.showVariance}
                    onChange={(e) => setNewChart({ ...newChart, showVariance: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Show Variance</span>
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewChartDialog(false)}>Cancel</Button>
            <Button onClick={editingChart ? () => handleUpdateChart(editingChart.id, newChart) : handleAddChart}>
              {editingChart ? 'Update Chart' : 'Add Chart'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Container Dialog */}
      <Dialog open={newContainerDialog} onOpenChange={setNewContainerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Insights Container</DialogTitle>
            <DialogDescription>
              Create a new container for organizing construction insights
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Container Title</label>
              <Input
                placeholder="e.g., Quality Metrics"
                value={newContainer.title}
                onChange={(e) => setNewContainer({ ...newContainer, title: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Container Type</label>
              <Select value={newContainer.type} onValueChange={(value) => setNewContainer({ ...newContainer, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="achievements">Achievements</SelectItem>
                  <SelectItem value="improvements">Improvements</SelectItem>
                  <SelectItem value="recommendations">Recommendations</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewContainerDialog(false)}>Cancel</Button>
            <Button onClick={handleAddContainer}>Add Container</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Announcement CRUD Dialog - Responsive Pattern */}
      <Dialog open={announcementDialog} onOpenChange={setAnnouncementDialog}>
        <DialogContent className="w-[95vw] max-w-[90vw] lg:max-w-[70vw] xl:max-w-[60vw] 2xl:max-w-[50vw] max-h-[95vh] bg-white border-0 shadow-2xl rounded-lg overflow-hidden [&>button]:hidden">
          {/* Enhanced Formal Header with Close Button */}
          <DialogHeader className="bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 text-white -m-6 px-8 py-6 mb-0 relative">
            <Button
              onClick={() => setAnnouncementDialog(false)}
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 h-8 w-8 p-0 text-white hover:bg-white/10 hover:text-white rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
            <DialogTitle className="flex items-center gap-4 text-xl pr-12">
              <div className="p-3 bg-white/10 rounded-xl shadow-lg">
                <Bell className="h-6 w-6" />
              </div>
              <div>
                <span className="block">{editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}</span>
                <p className="text-sm font-normal text-blue-100 mt-2 leading-relaxed">
                  {editingAnnouncement ? 'Update announcement details and information' : 'Add a new announcement for the construction infrastructure module'}
                </p>
              </div>
            </DialogTitle>
            <DialogDescription className="sr-only">
              {editingAnnouncement ? 'Edit existing announcement details including title, content, and date.' : 'Create a new announcement with title, content, and publication date.'}
            </DialogDescription>
          </DialogHeader>

          {/* Responsive Content Area with Smart Scrolling */}
          <div className="flex-1 overflow-y-auto max-h-[calc(95vh-200px)]">
            <div className="p-8">
              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="announcement-title" className="text-sm font-medium text-gray-900">Announcement Title *</Label>
                    <Input
                      id="announcement-title"
                      placeholder="e.g., Project Completion Milestone"
                      value={announcementFormData.title}
                      onChange={(e) => setAnnouncementFormData({ ...announcementFormData, title: e.target.value })}
                      className="mt-2 border-gray-300"
                    />
                  </div>

                  <div>
                    <Label htmlFor="announcement-content" className="text-sm font-medium text-gray-900">Content *</Label>
                    <Textarea
                      id="announcement-content"
                      placeholder="Enter announcement details..."
                      value={announcementFormData.content}
                      onChange={(e) => setAnnouncementFormData({ ...announcementFormData, content: e.target.value })}
                      className="mt-2 border-gray-300 min-h-[120px]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="announcement-date" className="text-sm font-medium text-gray-900">Publication Date</Label>
                    <Input
                      id="announcement-date"
                      type="text"
                      placeholder="e.g., December 15, 2024"
                      value={announcementFormData.date}
                      onChange={(e) => setAnnouncementFormData({ ...announcementFormData, date: e.target.value })}
                      className="mt-2 border-gray-300"
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave blank to use today's date</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-gray-200 pt-4 px-8 -mb-6 -mx-6 bg-gray-50">
            <Button variant="outline" onClick={() => setAnnouncementDialog(false)} className="border-gray-300">
              Cancel
            </Button>
            <Button 
              onClick={editingAnnouncement ? handleUpdateAnnouncement : handleAddAnnouncement} 
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {editingAnnouncement ? 'Update Announcement' : 'Create Announcement'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Project Highlight CRUD Dialog - Responsive Pattern */}
      <Dialog open={highlightDialog} onOpenChange={setHighlightDialog}>
        <DialogContent className="w-[95vw] max-w-[90vw] lg:max-w-[70vw] xl:max-w-[60vw] 2xl:max-w-[50vw] max-h-[95vh] bg-white border-0 shadow-2xl rounded-lg overflow-hidden [&>button]:hidden">
          {/* Enhanced Formal Header with Close Button */}
          <DialogHeader className="bg-gradient-to-r from-green-900 via-emerald-900 to-teal-900 text-white -m-6 px-8 py-6 mb-0 relative">
            <Button
              onClick={() => setHighlightDialog(false)}
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 h-8 w-8 p-0 text-white hover:bg-white/10 hover:text-white rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
            <DialogTitle className="flex items-center gap-4 text-xl pr-12">
              <div className="p-3 bg-white/10 rounded-xl shadow-lg">
                <Star className="h-6 w-6" />
              </div>
              <div>
                <span className="block">{editingHighlight ? 'Edit Project Highlight' : 'Add Project Highlight'}</span>
                <p className="text-sm font-normal text-green-100 mt-2 leading-relaxed">
                  {editingHighlight ? 'Update featured project details' : 'Feature a construction project in the highlights section'}
                </p>
              </div>
            </DialogTitle>
            <DialogDescription className="sr-only">
              {editingHighlight ? 'Edit existing project highlight with project selection and description.' : 'Add a new project highlight by selecting a project and providing a description.'}
            </DialogDescription>
          </DialogHeader>

          {/* Responsive Content Area with Smart Scrolling */}
          <div className="flex-1 overflow-y-auto max-h-[calc(95vh-200px)]">
            <div className="p-8">
              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="highlight-project" className="text-sm font-medium text-gray-900">Select Project *</Label>
                    <Select 
                      value={highlightFormData.projectId} 
                      onValueChange={(value) => setHighlightFormData({ ...highlightFormData, projectId: value })}
                    >
                      <SelectTrigger id="highlight-project" className="mt-2 border-gray-300">
                        <SelectValue placeholder="Choose a project to highlight..." />
                      </SelectTrigger>
                      <SelectContent>
                        {projectsData
                          .filter(p => !projectHighlights.some(h => h.id === p.id) || editingHighlight?.id === p.id)
                          .map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.projectTitle} ({project.fundingSource})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">Only projects not already highlighted are shown</p>
                  </div>

                  <div>
                    <Label htmlFor="highlight-description" className="text-sm font-medium text-gray-900">Description</Label>
                    <Textarea
                      id="highlight-description"
                      placeholder="Enter a brief description of why this project is highlighted..."
                      value={highlightFormData.description}
                      onChange={(e) => setHighlightFormData({ ...highlightFormData, description: e.target.value })}
                      className="mt-2 border-gray-300 min-h-[100px]"
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave blank to use a default description</p>
                  </div>

                  {highlightFormData.projectId && (() => {
                    const selectedProject = projectsData.find(p => p.id === highlightFormData.projectId);
                    return selectedProject ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Info className="w-4 h-4 text-green-600" />
                          <h4 className="text-sm font-medium text-green-900">Project Preview</h4>
                        </div>
                        <div className="text-sm text-gray-700 space-y-1">
                          <p><strong>Title:</strong> {selectedProject.projectTitle}</p>
                          <p><strong>Progress:</strong> {selectedProject.progressAccomplishment.toFixed(1)}%</p>
                          <p><strong>Funding:</strong> {selectedProject.fundingSource}</p>
                          <p><strong>Status:</strong> {selectedProject.status}</p>
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-gray-200 pt-4 px-8 -mb-6 -mx-6 bg-gray-50">
            <Button variant="outline" onClick={() => setHighlightDialog(false)} className="border-gray-300">
              Cancel
            </Button>
            <Button 
              onClick={editingHighlight ? handleUpdateHighlight : handleAddHighlight} 
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {editingHighlight ? 'Update Highlight' : 'Add Highlight'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}