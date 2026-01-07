import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { 
  Wrench, Building2, Target, TrendingUp, BarChart3, 
  Calendar, Edit, Plus, Eye, FileText,
  CheckCircle, AlertTriangle, Clock, Users, Info, ArrowUpRight, Activity,
  Filter, ChevronRight,
  Home, Building, Shield, Lock, X, FolderOpen, ShieldAlert,
  PieChart, Bell, Megaphone, Star, ExternalLink, Trash2
} from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { toast } from 'sonner@2.0.3';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart as RechartsLineChart, Line, Area, AreaChart, 
  PieChart as RechartsPieChart, Pie, Cell 
} from 'recharts';
import { EnhancedProjectTable } from './components/EnhancedRepairTable';
import { mainCampusRepairsData } from './data/mainCampusRepairsData';
import { cabadbaranCampusRepairsData } from './data/cabadbaranCampusRepairsData';
import { RepairProject } from './types/RepairTypes';
import { Textarea } from '../ui/textarea';
import { ProjectPersonnelDialog } from './admin/ProjectPersonnelDialog';
import { RepairProjectFormDialog } from './RepairProjectFormDialog';
import { enhancedRepairsRBACService } from './services/EnhancedRBACService';

interface CategoryOverviewProps {
  onProjectSelect: (project: any) => void;
  userRole: string;
  requireAuth: (action: string) => boolean;
  onNavigate: (page: string) => void;
  userEmail?: string;
  userDepartment?: string;
}

// Mock staff data - In production, this would come from User Management
const AVAILABLE_STAFF = [
  { email: 'john.doe@carsu.edu.ph', name: 'John Doe', department: 'Facilities', role: 'Staff' },
  { email: 'jane.smith@carsu.edu.ph', name: 'Jane Smith', department: 'Maintenance', role: 'Staff' },
  { email: 'pedro.reyes@carsu.edu.ph', name: 'Pedro Reyes', department: 'Property Management', role: 'Editor' },
  { email: 'ana.garcia@carsu.edu.ph', name: 'Ana Garcia', department: 'Planning', role: 'Staff' },
  { email: 'maria.santos@carsu.edu.ph', name: 'Maria Santos', department: 'Monitoring & Evaluation', role: 'Editor' },
  { email: 'rafael.santos@carsu.edu.ph', name: 'Rafael Santos', department: 'Facilities Management', role: 'Staff' },
];

// Comprehensive Repairs & Maintenance Data
const REPAIRS_OVERVIEW_DATA = {
  overview: {
    totalProjects: 62,
    completedProjects: 52,
    inProgressProjects: 7,
    pendingProjects: 3,
    totalBudget: 13250000,
    utilizedBudget: 11100000,
    physicalProgress: 87.5,
    financialProgress: 83.8,
    averageCompletionTime: 45,
    assessmentCycle: 'Q4 2024',
    lastUpdated: 'December 2024',
    totalBeneficiaries: 2500,
    contractorPartners: 12,
    facilitiesRepaired: 127,
    targetPhysical: 85.0
  },

  // Time-series data for charts
  timeSeriesData: {
    weekly: [
      { period: 'Week 1', physical: 86.1, completed: 63, budget: 13100000, target: 84.0 },
      { period: 'Week 2', physical: 86.5, completed: 64, budget: 13200000, target: 84.5 },
      { period: 'Week 3', physical: 86.9, completed: 64, budget: 13250000, target: 85.0 },
      { period: 'Week 4', physical: 87.3, completed: 65, budget: 13295000, target: 85.0 }
    ],
    monthly: [
      { period: 'Sep', physical: 85.8, completed: 62, budget: 12800000, target: 84.0 },
      { period: 'Oct', physical: 86.2, completed: 63, budget: 12950000, target: 84.5 },
      { period: 'Nov', physical: 86.8, completed: 64, budget: 13100000, target: 85.0 },
      { period: 'Dec', physical: 87.3, completed: 65, budget: 13295000, target: 85.0 }
    ],
    quarterly: [
      { period: 'Q1 2024', physical: 83.3, completed: 59, budget: 11850000, target: 81.0 },
      { period: 'Q2 2024', physical: 85.7, completed: 63, budget: 12650000, target: 84.0 },
      { period: 'Q3 2024', physical: 86.8, completed: 65, budget: 12950000, target: 85.5 },
      { period: 'Q4 2024', physical: 87.3, completed: 65, budget: 13295000, target: 85.0 }
    ],
    yearly: [
      { period: '2022', physical: 78.5, completed: 48, budget: 9200000, target: 75.0 },
      { period: '2023', physical: 82.1, completed: 55, budget: 11500000, target: 80.0 },
      { period: '2024', physical: 87.3, completed: 65, budget: 13295000, target: 85.0 }
    ]
  },

  // Campus breakdown data
  campusData: {
    mainCampus: {
      totalProjects: 48,
      completedProjects: 40,
      inProgressProjects: 5,
      pendingProjects: 3,
      totalBudget: 10200000,
      utilizedBudget: 8650000,
      physicalProgress: 88.2,
      financialProgress: 84.8,
      facilitiesRepaired: 102
    },
    cabadbaranCampus: {
      totalProjects: 29,
      completedProjects: 25,
      inProgressProjects: 3,
      pendingProjects: 1,
      totalBudget: 5550000,
      utilizedBudget: 4645000,
      physicalProgress: 85.8,
      financialProgress: 83.7,
      facilitiesRepaired: 56
    }
  },

  // Category trends
  categoryTrends: [
    { period: 'Jan', classrooms: 87.5, administrative: 80.2 },
    { period: 'Feb', classrooms: 88.1, administrative: 81.0 },
    { period: 'Mar', classrooms: 88.7, administrative: 81.8 },
    { period: 'Apr', classrooms: 89.2, administrative: 82.1 },
    { period: 'May', classrooms: 89.0, administrative: 82.3 },
    { period: 'Jun', classrooms: 88.9, administrative: 82.0 },
    { period: 'Jul', classrooms: 89.1, administrative: 81.5 },
    { period: 'Aug', classrooms: 88.8, administrative: 81.8 },
    { period: 'Sep', classrooms: 88.6, administrative: 82.2 },
    { period: 'Oct', classrooms: 88.9, administrative: 82.5 },
    { period: 'Nov', classrooms: 88.7, administrative: 82.3 },
    { period: 'Dec', classrooms: 88.7, administrative: 82.3 }
  ],

  categories: [
    {
      id: 'classrooms-csu-cc-bxu',
      name: 'Classroom Repairs',
      shortName: 'Classrooms',
      icon: Building2,
      totalProjects: 38,
      completedProjects: 32,
      physicalProgress: 84.2,
      target: 85.0,
      status: 'On Track',
      objective: 'Educational facility maintenance and improvement across CSU campuses',
      beneficiaries: 1850,
      facilities: 85,
      totalBudget: 8500000,
      utilizedBudget: 7140000,
      metrics: {
        scheduleCompliance: 82.5,
        qualityRating: 91.2,
        beneficiaryImpact: 89.6
      }
    },
    {
      id: 'administrative-offices-csu-cc-bxu',
      name: 'Administrative Office Repairs',
      shortName: 'Administrative',
      icon: Users,
      totalProjects: 24,
      completedProjects: 20,
      physicalProgress: 83.3,
      target: 80.0,
      status: 'Exceeding Target',
      objective: 'Administrative facility maintenance and office system improvements',
      beneficiaries: 650,
      facilities: 42,
      totalBudget: 4750000,
      utilizedBudget: 3960000,
      metrics: {
        scheduleCompliance: 87.1,
        qualityRating: 93.5,
        beneficiaryImpact: 85.4
      }
    }
  ],

  insights: {
    achievements: [
      'Administrative Office Repairs achieving 83.3% physical progress, exceeding 80% target by 3.3%',
      'Main Campus maintaining 88.2% completion rate with 102 facilities successfully repaired',
      'Overall physical accomplishment of 87.5%, surpassing 85% target by 2.5%',
      'Beneficiary impact reaching 2,500+ individuals across all repair categories',
      'Total of 127 facilities repaired successfully across both CSU campuses'
    ],
    improvements: [
      'Enhance scheduling systems for Classroom Repairs to improve timeline adherence',
      'Implement preventive maintenance protocols to reduce reactive repair frequency',
      'Strengthen quality assurance processes during repair execution phases',
      'Expand contractor training programs to maintain high-quality repair standards',
      'Optimize procurement procedures to reduce material acquisition delays',
      'Develop integrated facility monitoring systems for proactive maintenance'
    ],
    recommendations: [
      'Establish centralized facility management platform for real-time repair tracking',
      'Create standardized repair quality benchmarks across all facility categories',
      'Implement predictive maintenance analytics to anticipate facility issues',
      'Develop multi-year facility improvement plans for strategic resource allocation',
      'Strengthen stakeholder communication protocols for repair project transparency',
      'Expand preventive maintenance programs to extend facility lifecycle'
    ]
  }
};

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'];

export function CategoryOverview({ 
  onProjectSelect, 
  userRole, 
  requireAuth, 
  onNavigate,
  userEmail = 'user@carsu.edu.ph',
  userDepartment = 'General'
}: CategoryOverviewProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [campusFilter, setCampusFilter] = useState<'all' | 'main' | 'cabadbaran'>('all');
  const [timeFilter, setTimeFilter] = useState('monthly');
  
  // RBAC permissions
  const pageId = 'repairs';
  const hasPageAccess = enhancedRepairsRBACService.canAccessPage(userEmail, userRole, userDepartment, pageId);
  const userPermissions = enhancedRepairsRBACService.getUserPermissions(userEmail, userRole, userDepartment, pageId);
  const canPerformCRUD = userPermissions.canAdd || userPermissions.canEdit;
  
  // External status filter for project list from data insights
  const [externalStatusFilter, setExternalStatusFilter] = useState<string>('all');
  
  // Project List Tab States with RBAC
  const [projectSearchQuery, setProjectSearchQuery] = useState('');
  const [projectCategoryFilter, setProjectCategoryFilter] = useState('all');
  const [projectStatusFilter, setProjectStatusFilter] = useState('all');
  const [projectCampusFilter, setProjectCampusFilter] = useState<'all' | 'main' | 'cabadbaran'>('all');
  const [projectViewMode, setProjectViewMode] = useState<'table' | 'list' | 'card'>('table');
  const [projectSortBy, setProjectSortBy] = useState('dateStarted');
  const [projectSortOrder, setProjectSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    'title', 'campus', 'repairType', 'status', 'priority', 'budget', 'progress', 'actions'
  ]);
  
  // CRUD Dialogs State
  const [newProjectDialog, setNewProjectDialog] = useState(false);
  const [editingProject, setEditingProject] = useState<RepairProject | null>(null);
  
  // Insights CRUD State
  const [insightContainers, setInsightContainers] = useState([
    {
      id: 'achievements',
      title: 'Key Achievements',
      type: 'achievements',
      quarter: 'Q4 2024',
      items: REPAIRS_OVERVIEW_DATA.insights.achievements,
      isEditable: true
    },
    {
      id: 'improvements',
      title: 'Areas for Improvement',
      type: 'improvements', 
      quarter: 'Q4 2024',
      items: REPAIRS_OVERVIEW_DATA.insights.improvements,
      isEditable: true
    },
    {
      id: 'recommendations',
      title: 'Strategic Recommendations',
      type: 'recommendations',
      quarter: 'Q4 2024',
      items: REPAIRS_OVERVIEW_DATA.insights.recommendations,
      isEditable: true
    }
  ]);
  const [editingContainer, setEditingContainer] = useState<any>(null);
  const [newInsightItem, setNewInsightItem] = useState('');

  // Announcements CRUD state
  const [announcements, setAnnouncements] = useState([
    { id: '1', title: 'Facility Repair Milestone', content: 'Main Campus classroom repairs completed ahead of schedule with excellent quality ratings.', date: 'December 15, 2024' },
    { id: '2', title: 'Preventive Maintenance Update', content: 'Q1 2025 preventive maintenance schedule has been finalized. All departments notified.', date: 'December 10, 2024' },
    { id: '3', title: 'Safety Inspection Notice', content: 'All ongoing repair projects will undergo safety compliance review on December 20, 2024.', date: 'December 5, 2024' }
  ]);
  const [announcementDialog, setAnnouncementDialog] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null);
  const [announcementFormData, setAnnouncementFormData] = useState({ title: '', content: '', date: '' });
  
  // Project Highlights CRUD state
  const [projectHighlights, setProjectHighlights] = useState([
    { id: 'repair-001', projectTitle: 'Engineering Building HVAC System Repair', description: 'Comprehensive HVAC system upgrade improving energy efficiency and air quality', progress: 95.8, fundingSource: 'Main Campus', projectId: 'repair-001' },
    { id: 'repair-002', projectTitle: 'Library Facility Restoration', description: 'Complete restoration of library reading rooms and study areas', progress: 78.5, fundingSource: 'Main Campus', projectId: 'repair-002' },
    { id: 'repair-003', projectTitle: 'Administrative Office Renovation', description: 'Modernization of administrative workspaces and service areas', progress: 68.2, fundingSource: 'Cabadbaran Campus', projectId: 'repair-003' }
  ]);
  const [highlightDialog, setHighlightDialog] = useState(false);
  const [editingHighlight, setEditingHighlight] = useState<any>(null);
  const [highlightFormData, setHighlightFormData] = useState({ projectId: '', description: '' });

  // Get assigned projects from existing userPermissions (declared above)
  const assignedProjectIds = userPermissions.assignedProjects || [];

  // Get all projects combined with RBAC filtering
  const allProjects = useMemo(() => {
    const combined = [...mainCampusRepairsData, ...cabadbaranCampusRepairsData];
    
    // Apply RBAC filtering: Admin and Client see all, Staff see only assigned
    if (userRole === 'Admin' || userRole === 'Client') {
      return combined;
    }
    
    // Staff can only see their assigned projects
    if (assignedProjectIds.length > 0) {
      return combined.filter(p => assignedProjectIds.includes(p.id));
    }
    
    // If staff has no assignments, show empty list
    return [];
  }, [userRole, assignedProjectIds]);

  // Get filtered and sorted projects
  const getAllProjects = () => {
    let filtered = allProjects.filter(project => {
      const searchLower = projectSearchQuery.toLowerCase();
      const matchesSearch = (project.title?.toLowerCase() || '').includes(searchLower) ||
                           (project.repairType?.toLowerCase() || '').includes(searchLower) ||
                           (project.building?.toLowerCase() || '').includes(searchLower);
      const matchesCategory = projectCategoryFilter === 'all' || project.repairType === projectCategoryFilter;
      const matchesStatus = projectStatusFilter === 'all' || project.status === projectStatusFilter;
      const matchesCampus = projectCampusFilter === 'all' || 
                           (projectCampusFilter === 'main' && project.campus === 'Main Campus') ||
                           (projectCampusFilter === 'cabadbaran' && project.campus === 'Cabadbaran Campus');
      
      return matchesSearch && matchesCategory && matchesStatus && matchesCampus;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[projectSortBy];
      let bValue = b[projectSortBy];
      
      // Handle undefined values
      if (aValue === undefined) aValue = '';
      if (bValue === undefined) bValue = '';
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
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

  // Get filtered campus data
  const getFilteredCampusData = () => {
    if (campusFilter === 'main') {
      return REPAIRS_OVERVIEW_DATA.campusData.mainCampus;
    } else if (campusFilter === 'cabadbaran') {
      return REPAIRS_OVERVIEW_DATA.campusData.cabadbaranCampus;
    } else {
      // Combine both campuses
      const main = REPAIRS_OVERVIEW_DATA.campusData.mainCampus;
      const cab = REPAIRS_OVERVIEW_DATA.campusData.cabadbaranCampus;
      return {
        totalProjects: main.totalProjects + cab.totalProjects,
        completedProjects: main.completedProjects + cab.completedProjects,
        inProgressProjects: main.inProgressProjects + cab.inProgressProjects,
        pendingProjects: main.pendingProjects + cab.pendingProjects,
        totalBudget: main.totalBudget + cab.totalBudget,
        utilizedBudget: main.utilizedBudget + cab.utilizedBudget,
        physicalProgress: ((main.physicalProgress + cab.physicalProgress) / 2),
        financialProgress: ((main.financialProgress + cab.financialProgress) / 2),
        facilitiesRepaired: main.facilitiesRepaired + cab.facilitiesRepaired
      };
    }
  };

  // Get filtered time series data
  const getFilteredData = () => {
    return REPAIRS_OVERVIEW_DATA.timeSeriesData[timeFilter] || REPAIRS_OVERVIEW_DATA.timeSeriesData.monthly;
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

  // Get category distribution for pie chart
  const getCategoryDistribution = () => {
    return REPAIRS_OVERVIEW_DATA.categories.map(cat => ({
      name: cat.shortName,
      value: cat.totalProjects,
      physicalProgress: cat.physicalProgress
    }));
  };

  // Get status distribution with clickable functionality
  const getStatusDistribution = () => {
    const campusData = getFilteredCampusData();
    return [
      { name: 'Completed', value: campusData.completedProjects, color: '#10b981', filterKey: 'Completed' },
      { name: 'In Progress', value: campusData.inProgressProjects, color: '#3b82f6', filterKey: 'In Progress' },
      { name: 'Pending', value: campusData.pendingProjects, color: '#f59e0b', filterKey: 'Pending' }
    ];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Exceeding Target': return 'text-green-700 bg-green-50 border-green-200';
      case 'On Track': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'Needs Attention': return 'text-amber-700 bg-amber-50 border-amber-200';
      default: return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    onNavigate(categoryId);
    toast.success(`Accessing ${categoryId.replace(/-/g, ' ')} projects`);
  };

  const handleProjectClick = (project: RepairProject) => {
    onProjectSelect({
      ...project,
      category: 'repairs',
      type: 'repair'
    });
  };

  // Handle status bar click - navigate to projects tab with filter
  const handleStatusClick = (statusKey: string) => {
    setActiveTab('projects');
    setExternalStatusFilter(statusKey);
    toast.info(`Filtering projects by status: ${statusKey}`);
  };

  // Get campus distribution for pie chart - clickable
  const getCampusDistribution = () => {
    return [
      { 
        name: 'Main Campus', 
        value: REPAIRS_OVERVIEW_DATA.campusData.mainCampus.totalProjects,
        physicalProgress: REPAIRS_OVERVIEW_DATA.campusData.mainCampus.physicalProgress,
        campusKey: 'main'
      },
      { 
        name: 'Cabadbaran Campus', 
        value: REPAIRS_OVERVIEW_DATA.campusData.cabadbaranCampus.totalProjects,
        physicalProgress: REPAIRS_OVERVIEW_DATA.campusData.cabadbaranCampus.physicalProgress,
        campusKey: 'cabadbaran'
      }
    ];
  };

  // Handle campus distribution click - navigate to projects tab with campus filter
  const handleCampusClick = (campusKey: string) => {
    setCampusFilter(campusKey);
    setActiveTab('projects');
    const campusName = campusKey === 'main' ? 'Main Campus' : 'Cabadbaran Campus';
    toast.info(`Filtering projects for ${campusName}`);
  };

  // Get priority distribution for visualization
  const getPriorityDistribution = () => {
    const allProjects = getAllProjects();
    const priorities = { High: 0, Medium: 0, Low: 0 };
    
    allProjects.forEach(project => {
      if (project.priority === 'High' || project.priority === 'Critical') {
        priorities.High++;
      } else if (project.priority === 'Medium' || project.priority === 'Moderate') {
        priorities.Medium++;
      } else if (project.priority === 'Low') {
        priorities.Low++;
      }
    });

    return [
      { name: 'High Priority', value: priorities.High, color: '#ef4444' },
      { name: 'Medium Priority', value: priorities.Medium, color: '#f59e0b' },
      { name: 'Low Priority', value: priorities.Low, color: '#10b981' }
    ];
  };

  // CRUD Handlers
  const handleCreateProject = () => {
    if (!requireAuth('create repair projects')) return;
    
    if (!canPerformCRUD) {
      toast.error('Access denied. You do not have permission to create projects.');
      return;
    }
    
    setEditingProject(null);
    setNewProjectDialog(true);
  };

  const handleEditProject = (project: RepairProject) => {
    if (!requireAuth('edit repair projects')) return;
    
    if (!canPerformCRUD) {
      toast.error('Access denied. You do not have permission to edit projects.');
      return;
    }
    
    setEditingProject(project);
    setNewProjectDialog(false); // Ensure new project dialog is closed
  };



  const handleDeleteProject = (project: RepairProject) => {
    if (!requireAuth('delete repair projects')) return;
    
    if (userRole !== 'Admin') {
      toast.error('Access denied. Only Admins can delete projects.');
      return;
    }
    
    toast.success('Project deleted successfully');
  };

  // Insights CRUD Handlers
  const handleEditInsightContainer = (container: any) => {
    if (!requireAuth('edit insights')) return;
    
    if (!userPermissions.canManageInsights) {
      toast.error('Access denied. You do not have permission to edit insights.');
      return;
    }
    
    setEditingContainer(container);
    setNewInsightItem('');
  };

  const handleAddInsightItem = () => {
    if (!newInsightItem.trim()) {
      toast.error('Please enter insight content');
      return;
    }
    
    setInsightContainers(prev => prev.map(container => {
      if (container.id === editingContainer?.id) {
        return {
          ...container,
          items: [...container.items, newInsightItem.trim()]
        };
      }
      return container;
    }));
    
    setNewInsightItem('');
    toast.success('Insight added successfully');
  };

  const handleRemoveInsightItem = (containerIndex: number, itemIndex: number) => {
    setInsightContainers(prev => prev.map((container, idx) => {
      if (idx === containerIndex) {
        return {
          ...container,
          items: container.items.filter((_, i) => i !== itemIndex)
        };
      }
      return container;
    }));
    
    toast.success('Insight removed successfully');
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
    
    const project = allProjects.find(p => p.id === highlightFormData.projectId);
    if (!project) {
      toast.error('Project not found');
      return;
    }
    
    const newHighlight = {
      id: Date.now().toString(),
      projectId: highlightFormData.projectId,
      projectTitle: project.title || '',
      description: highlightFormData.description,
      progress: project.progress || 0,
      fundingSource: project.campus || ''
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
    
    const project = allProjects.find(p => p.id === highlightFormData.projectId);
    if (!project) {
      toast.error('Project not found');
      return;
    }
    
    setProjectHighlights(projectHighlights.map(h =>
      h.id === editingHighlight?.id
        ? {
            ...h,
            projectId: highlightFormData.projectId,
            projectTitle: project.title || '',
            description: highlightFormData.description,
            progress: project.progress || 0,
            fundingSource: project.campus || ''
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

  const filteredCampusData = getFilteredCampusData();

  // Check if user has RBAC page access
  if (!hasPageAccess) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <Card className="border-red-200">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-red-50 rounded-lg">
                  <ShieldAlert className="w-6 h-6 text-red-600" />
                </div>
                <CardTitle className="text-red-900">Access Restricted</CardTitle>
              </div>
              <CardDescription>
                You do not have permission to access this page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <Lock className="h-4 w-4" />
                <AlertDescription>
                  This page requires specific access permissions. Please contact your administrator if you believe you should have access.
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
        {/* Header Section - Matching COI Design Standards Exactly */}
        <div className="admin-card">
          <div className="p-6 space-y-5">
            {/* Main Header */}
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <Wrench className="w-7 h-7 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h1 className="text-gray-900 text-2xl mb-1">Repairs & Maintenance</h1>
                  <p className="text-base text-gray-600 leading-relaxed">
                    Facility repair and maintenance monitoring dashboard
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Badge
                  variant="secondary"
                  className="px-4 py-1.5 bg-amber-50 text-amber-700 border-amber-200 text-center"
                >
                  <Target className="w-4 h-4 mr-1.5" />
                  {filteredCampusData.physicalProgress.toFixed(1)}% Accomplished
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
                <span>Updated {REPAIRS_OVERVIEW_DATA.overview.lastUpdated}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>{REPAIRS_OVERVIEW_DATA.overview.assessmentCycle}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-purple-600" />
                <span>{REPAIRS_OVERVIEW_DATA.overview.totalBeneficiaries.toLocaleString()} Beneficiaries</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Home className="w-4 h-4 text-orange-600" />
                <span>{filteredCampusData.facilitiesRepaired} Facilities Repaired</span>
              </div>
            </div>
          </div>
        </div>

        {/* Time Period Filter Section - Matching COI */}
        <div className="admin-card">
          <div className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-50 rounded-lg">
                  <Filter className="w-5 h-5 text-amber-600" />
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
                <div className="text-lg text-amber-700">
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
                  ₱{((getFilteredData()[getFilteredData().length - 1]?.budget || 0) / 1000000).toFixed(1)}M
                </div>
                <div className="text-xs text-gray-600">Total Budget</div>
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
          {/* Tab Navigation - Matching COI with proper highlighting */}
          <div className="admin-card p-1">
            <TabsList className="bg-transparent border-0 p-0 w-full grid grid-cols-4 gap-1">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700 data-[state=active]:border data-[state=active]:border-amber-200 border border-transparent py-2.5 text-sm rounded-md transition-all"
              >
                <BarChart3 className="w-4 h-4 mr-1.5" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger
                value="projects"
                className="data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700 data-[state=active]:border data-[state=active]:border-amber-200 border border-transparent py-2.5 text-sm rounded-md transition-all"
              >
                <FolderOpen className="w-4 h-4 mr-1.5" />
                Projects
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700 data-[state=active]:border data-[state=active]:border-amber-200 border border-transparent py-2.5 text-sm rounded-md transition-all"
              >
                <PieChart className="w-4 h-4 mr-1.5" />
                Analytics
              </TabsTrigger>
              <TabsTrigger
                value="insights"
                className="data-[state=active]:bg-amber-600 data-[state=active]:text-white border border-transparent py-2.5 text-sm rounded-md transition-all"
              >
                <TrendingUp className="w-4 h-4 mr-1.5" />
                Insights
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Data Insights Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Filter Status Indicator */}
            <Alert>
              <Filter className="h-4 w-4" />
              <AlertDescription>
                Dashboard data filtered for <strong>{getTimeFilterLabel()}</strong> view. 
                Showing data for <strong>{campusFilter === 'all' ? 'All Campuses' : campusFilter === 'main' ? 'Main Campus' : 'Cabadbaran Campus'}</strong>.
              </AlertDescription>
            </Alert>

            {/* Summary Cards - Minimal & Formal Design */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="admin-card hover:border-amber-300 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-amber-50 rounded-lg">
                      <Target className="w-4 h-4 text-amber-600" />
                    </div>
                    <p className="text-xs text-slate-600">Physical Progress</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-slate-900">{filteredCampusData.physicalProgress.toFixed(1)}%</p>
                    <Progress value={filteredCampusData.physicalProgress} className="h-1.5" />
                    <p className="text-xs text-green-600">
                      +{(filteredCampusData.physicalProgress - REPAIRS_OVERVIEW_DATA.overview.targetPhysical).toFixed(1)}% vs target
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="admin-card hover:border-blue-300 transition-colors cursor-pointer"
                onClick={() => handleStatusClick('Completed')}
              >
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                    </div>
                    <p className="text-xs text-slate-600">Completed Projects</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-slate-900">{filteredCampusData.completedProjects}</p>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={(filteredCampusData.completedProjects / filteredCampusData.totalProjects) * 100} 
                        className="h-1.5 flex-1" 
                      />
                      <span className="text-xs text-slate-500">
                        {((filteredCampusData.completedProjects / filteredCampusData.totalProjects) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-xs text-amber-600 flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3" />
                      Click to filter
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="admin-card hover:border-green-300 transition-colors cursor-pointer"
                onClick={() => handleStatusClick('In Progress')}
              >
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <Activity className="w-4 h-4 text-green-600" />
                    </div>
                    <p className="text-xs text-slate-600">In Progress</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-slate-900">{filteredCampusData.inProgressProjects}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Active repairs</span>
                    </div>
                    <p className="text-xs text-amber-600 flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3" />
                      Click to filter
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="admin-card hover:border-orange-300 transition-colors cursor-pointer"
                onClick={() => handleStatusClick('Pending')}
              >
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-orange-50 rounded-lg">
                      <Clock className="w-4 h-4 text-orange-600" />
                    </div>
                    <p className="text-xs text-slate-600">Pending</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-slate-900">{filteredCampusData.pendingProjects}</p>
                    <p className="text-xs text-slate-600">
                      Awaiting initiation
                    </p>
                    <p className="text-xs text-amber-600 flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3" />
                      Click to filter
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Campus Distribution - Responsive & Clickable */}
              <Card className="admin-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <Building2 className="w-5 h-5 text-purple-600" />
                    Campus Distribution
                  </CardTitle>
                  <CardDescription>
                    Project distribution by campus - Click to filter
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center">
                  <div className="w-full h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={getCampusDistribution()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius="70%"
                          fill="#8884d8"
                          dataKey="value"
                          onClick={(data) => handleCampusClick(data.campusKey)}
                          cursor="pointer"
                        >
                          {getCampusDistribution().map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={index === 0 ? '#f59e0b' : '#fb923c'} 
                              className="hover:opacity-80 transition-opacity"
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '12px'
                          }}
                          formatter={(value: any, name: string, props: any) => {
                            return [
                              `${value} projects (${props.payload.physicalProgress.toFixed(1)}% progress)`,
                              name
                            ];
                          }}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Status Distribution - Clickable */}
              <Card className="admin-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <BarChart3 className="w-5 h-5 text-green-600" />
                    Status Distribution
                  </CardTitle>
                  <CardDescription>
                    Click on bars to filter project list
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getStatusDistribution()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px'
                        }}
                        cursor={{ fill: 'rgba(251, 191, 36, 0.1)' }}
                      />
                      <Bar 
                        dataKey="value" 
                        fill="#3b82f6" 
                        radius={[8, 8, 0, 0]}
                        onClick={(data) => handleStatusClick(data.filterKey)}
                        cursor="pointer"
                      >
                        {getStatusDistribution().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Category Trends */}
              <Card className="admin-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    Category Performance Trends
                  </CardTitle>
                  <CardDescription>
                    Monthly performance by repair category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsLineChart data={REPAIRS_OVERVIEW_DATA.categoryTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="period" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px'
                        }}
                      />
                      <Line type="monotone" dataKey="classrooms" stroke="#3b82f6" strokeWidth={2} name="Classrooms" />
                      <Line type="monotone" dataKey="administrative" stroke="#8b5cf6" strokeWidth={2} name="Administrative" />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Priority Distribution - Additional Essential Data Visual */}
              <Card className="admin-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    Priority Distribution
                  </CardTitle>
                  <CardDescription>
                    Project priority levels analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getPriorityDistribution()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar 
                        dataKey="value" 
                        fill="#3b82f6" 
                        radius={[8, 8, 0, 0]}
                      >
                        {getPriorityDistribution().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Category Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {REPAIRS_OVERVIEW_DATA.categories.map((category, index) => {
                const Icon = category.icon;
                return (
                  <Card 
                    key={category.id} 
                    className="admin-card hover:border-amber-300 transition-all cursor-pointer group"
                    onClick={() => handleCategoryClick(category.id)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg group-hover:scale-110 transition-transform">
                            <Icon className="w-5 h-5 text-amber-600" />
                          </div>
                          <div>
                            <CardTitle className="text-gray-900">{category.name}</CardTitle>
                            <CardDescription className="text-xs">{category.objective}</CardDescription>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-amber-600 transition-colors" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Physical Progress</span>
                        <span className="text-gray-900">{category.physicalProgress.toFixed(1)}%</span>
                      </div>
                      <Progress value={category.physicalProgress} className="h-2" />
                      
                      <Separator />
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Projects</p>
                          <p className="text-gray-900">{category.completedProjects}/{category.totalProjects}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Facilities</p>
                          <p className="text-gray-900">{category.facilities}</p>
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <Badge variant="outline" className={getStatusColor(category.status)}>
                          {category.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Insights Section with CRUD - Improved Spacing */}
            <div className="space-y-6 mt-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-gray-900 text-xl">Strategic Insights & Recommendations</h2>
                {userPermissions.canManageInsights && (
                  <Badge variant="outline" className="text-xs">
                    <Shield className="w-3 h-3 mr-1" />
                    Admin/Editor Access
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {insightContainers.map((container, containerIndex) => (
                  <Card key={container.id} className="admin-card">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <CardTitle className="text-gray-900 text-base">{container.title}</CardTitle>
                        {userPermissions.canManageInsights && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditInsightContainer(container)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <CardDescription className="text-xs">{container.quarter}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <ul className="space-y-4">
                        {container.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start gap-3 text-sm text-gray-700 leading-relaxed">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="flex-1">{item}</span>
                            {userPermissions.canManageInsights && editingContainer?.id === container.id && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 flex-shrink-0"
                                onClick={() => handleRemoveInsightItem(containerIndex, itemIndex)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            )}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab - Comprehensive Data Visualizations */}
          <TabsContent value="analytics" className="space-y-8">
            {/* Filter Status Indicator */}
            <Alert>
              <Filter className="h-4 w-4" />
              <AlertDescription>
                Analytics data filtered for <strong>{getTimeFilterLabel()}</strong> view.
                Real-time repair project monitoring and performance insights.
              </AlertDescription>
            </Alert>

            {/* Key Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-orange-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <Building className="w-5 h-5 text-amber-700" />
                    </div>
                    <Badge className="bg-amber-100 text-amber-800 border-amber-300">
                      Total
                    </Badge>
                  </div>
                  <p className="text-3xl text-amber-900 mt-4">
                    {allProjects.length}
                  </p>
                  <p className="text-sm text-amber-700 mt-1">Active Projects</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-emerald-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-700" />
                    </div>
                    <Badge className="bg-green-100 text-green-800 border-green-300">
                      Completed
                    </Badge>
                  </div>
                  <p className="text-3xl text-green-900 mt-4">
                    {allProjects.filter(p => p.status === 'Completed').length}
                  </p>
                  <p className="text-sm text-green-700 mt-1">Finished Projects</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-cyan-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Activity className="w-5 h-5 text-blue-700" />
                    </div>
                    <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                      In Progress
                    </Badge>
                  </div>
                  <p className="text-3xl text-blue-900 mt-4">
                    {allProjects.filter(p => p.status === 'In Progress').length}
                  </p>
                  <p className="text-sm text-blue-700 mt-1">Ongoing Projects</p>
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
                    {allProjects.length > 0 ? (allProjects.reduce((sum, p) => sum + (p.progress || 0), 0) / allProjects.length).toFixed(1) : '0'}%
                  </p>
                  <p className="text-sm text-purple-700 mt-1">Progress Rate</p>
                </CardContent>
              </Card>
            </div>

            {/* Project Status Distribution and Campus Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Project Status Distribution */}
              <Card className="bg-white shadow-sm border-0 lg:col-span-5 xl:col-span-4">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-amber-600" />
                    Project Status Distribution
                  </CardTitle>
                  <CardDescription>
                    Click any segment to filter projects by status
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Pie Chart */}
                  <div className="flex items-center justify-center">
                    <div className="w-full max-w-[280px] aspect-square">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={getStatusDistribution()}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value, percent }) => `${name}\n${value} (${(percent * 100).toFixed(0)}%)`}
                            outerRadius="85%"
                            dataKey="value"
                            onClick={(data) => {
                              if (data && data.filterKey) {
                                handleStatusClick(data.filterKey);
                              }
                            }}
                            cursor="pointer"
                          >
                            {getStatusDistribution().map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={entry.color}
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
                  
                  {/* Status Legend */}
                  <div className="space-y-3 pt-2">
                    <Separator />
                    <div className="space-y-2.5">
                      {getStatusDistribution().map((item, index) => (
                        <button
                          key={index}
                          onClick={() => handleStatusClick(item.filterKey)}
                          className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors group cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full group-hover:scale-110 transition-transform`} style={{ backgroundColor: item.color }} />
                            <span className="text-gray-900">{item.name}</span>
                          </div>
                          <Badge variant="outline" className="bg-gray-50 text-gray-900">
                            {item.value}
                          </Badge>
                        </button>
                      ))}
                    </div>
                    
                    {/* Total Summary */}
                    <div className="pt-2 mt-2 border-t border-gray-200">
                      <div className="flex items-center justify-between p-2">
                        <span className="text-gray-700">Total Projects</span>
                        <Badge className="bg-amber-100 text-amber-900 border-amber-200">
                          {filteredCampusData.totalProjects}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Campus Distribution */}
              <Card className="bg-white shadow-sm border-0 lg:col-span-7 xl:col-span-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-amber-600" />
                    Campus Distribution
                  </CardTitle>
                  <CardDescription>
                    Click any campus to filter projects by location
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Pie Chart */}
                    <div className="flex items-center justify-center">
                      <div className="w-full max-w-[300px] aspect-square">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={getCampusDistribution()}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, value, percent }) => `${name}\n${value} (${(percent * 100).toFixed(0)}%)`}
                              outerRadius="85%"
                              dataKey="value"
                              onClick={(data) => {
                                if (data && data.campusKey) {
                                  handleCampusClick(data.campusKey);
                                }
                              }}
                              cursor="pointer"
                            >
                              {getCampusDistribution().map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={index === 0 ? '#f59e0b' : '#8b5cf6'}
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

                    {/* Campus Legend */}
                    <div className="space-y-3 pt-2">
                      <Separator />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {getCampusDistribution().map((campus, index) => (
                          <button
                            key={index}
                            onClick={() => handleCampusClick(campus.campusKey)}
                            className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-amber-300 hover:bg-amber-50 transition-colors group cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <div 
                                className={`w-4 h-4 rounded-full group-hover:scale-110 transition-transform`} 
                                style={{ backgroundColor: index === 0 ? '#f59e0b' : '#8b5cf6' }}
                              />
                              <div className="text-left">
                                <p className="text-gray-900 text-sm">{campus.name}</p>
                                <p className="text-xs text-gray-500">{campus.physicalProgress.toFixed(1)}% Progress</p>
                              </div>
                            </div>
                            <Badge variant="outline" className="bg-gray-50 text-gray-900">
                              {campus.value}
                            </Badge>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Progress Trends Chart */}
            <Card className="bg-white shadow-sm border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-amber-600" />
                  {getTimeFilterLabel()}
                </CardTitle>
                <CardDescription>
                  Physical progress trends over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={getFilteredData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="period" 
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        axisLine={{ stroke: '#e2e8f0' }}
                      />
                      <YAxis 
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        axisLine={{ stroke: '#e2e8f0' }}
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
                        stroke="#f59e0b" 
                        fill="#fef3c7" 
                        strokeWidth={2}
                        name="Physical Progress (%)"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="target" 
                        stroke="#10b981" 
                        fill="#d1fae5" 
                        strokeWidth={2}
                        name="Target (%)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-8">
            {/* Filter Status Indicator */}
            <Alert>
              <Filter className="h-4 w-4" />
              <AlertDescription>
                Insights filtered for <strong>{getTimeFilterLabel()}</strong> view.
                Edit buttons are fully functional for content management.
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
              <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-amber-100 rounded-lg border border-amber-200">
                        <Star className="w-5 h-5 text-amber-700" />
                      </div>
                      <div>
                        <CardTitle className="text-amber-900">Project Highlights</CardTitle>
                        <CardDescription className="text-amber-700">
                          Featured repair projects and achievements
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
                        className="bg-amber-600 hover:bg-amber-700"
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
                      <Star className="w-12 h-12 text-amber-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-600">No project highlights yet</p>
                      {userRole === 'Admin' && (
                        <p className="text-xs text-gray-500 mt-1">Click "Add" to feature your first project</p>
                      )}
                    </div>
                  ) : (
                    projectHighlights.map((highlight) => (
                      <div 
                        key={highlight.id}
                        className="bg-white rounded-lg p-4 border border-amber-200 hover:shadow-md transition-all cursor-pointer hover:border-amber-400 group relative"
                        onClick={() => {
                          const project = allProjects.find(p => p.id === highlight.projectId);
                          if (project) {
                            handleProjectClick(project);
                          }
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Wrench className="w-4 h-4 text-amber-600" />
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
                            <ExternalLink className="w-4 h-4 text-amber-600 flex-shrink-0" />
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
                                    if (confirm('Are you sure you want to delete this highlight?')) {
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

            {/* Strategic Insights Section - Matching Overview Tab */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-gray-900 text-lg">Strategic Insights</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Key achievements, improvements, and recommendations for {REPAIRS_OVERVIEW_DATA.overview.assessmentCycle}
                  </p>
                </div>
                {userPermissions.canManageInsights && (
                  <Badge variant="outline" className="text-xs">
                    <Shield className="w-3 h-3 mr-1" />
                    Admin/Editor Access
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {insightContainers.map((container, containerIndex) => (
                  <Card key={container.id} className="admin-card">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <CardTitle className="text-gray-900 text-base">{container.title}</CardTitle>
                        {userPermissions.canManageInsights && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditInsightContainer(container)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <CardDescription className="text-xs">
                        {container.quarter} Assessment Period
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2.5">
                        {container.items.map((item: string, index: number) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                            <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                            <span className="flex-1">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Project List Tab */}
          <TabsContent value="projects" className="space-y-6">
            {/* RBAC Notice */}
            {!canPerformCRUD && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  You are viewing in <strong>read-only mode</strong>. Sign in with Staff/Admin credentials to create or edit projects.
                </AlertDescription>
              </Alert>
            )}

            {/* Enhanced Table with Filters - Matching COI exactly */}
            <EnhancedProjectTable
              projects={allProjects}
              userRole={userRole}
              userEmail={userEmail}
              onProjectClick={handleProjectClick}
              onEdit={handleEditProject}
              requireAuth={requireAuth}
              campusFilter={campusFilter}
              externalStatusFilter={externalStatusFilter}
              onStatusFilterChange={setExternalStatusFilter}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Create/Edit Repair Project Dialog - Using RepairProjectFormDialog */}
      <RepairProjectFormDialog
        open={newProjectDialog || !!editingProject}
        onOpenChange={(open) => {
          if (!open) {
            setNewProjectDialog(false);
            setEditingProject(null);
          }
        }}
        project={editingProject}
        onSubmit={(updatedProject) => {
          if (editingProject) {
            toast.success('Repair project updated successfully');
            setEditingProject(null);
          } else {
            toast.success('Repair project created successfully');
            setNewProjectDialog(false);
          }
        }}
      />

      {/* Edit Insights Dialog - Following OverviewCRUDDialogs Pattern */}
      <Dialog open={!!editingContainer} onOpenChange={(open) => {
        if (!open) setEditingContainer(null);
      }}>
        <DialogContent className="w-[95vw] max-w-[600px] max-h-[95vh] bg-white border-0 shadow-2xl rounded-lg overflow-hidden [&>button]:hidden">
          <DialogHeader className="bg-gradient-to-r from-emerald-900 via-green-900 to-teal-900 text-white -m-6 px-8 py-6 mb-0 relative">
            <Button
              onClick={() => setEditingContainer(null)}
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 h-8 w-8 p-0 text-white hover:bg-white/10 hover:text-white rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
            <DialogTitle className="text-xl pr-12">Edit {editingContainer?.title}</DialogTitle>
            <DialogDescription className="text-sm text-emerald-100 mt-2 sr-only">
              Manage strategic insights for {editingContainer?.quarter}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto max-h-[calc(95vh-180px)] p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newInsightItem">Add New Insight</Label>
              <div className="flex gap-2">
                <Textarea
                  id="newInsightItem"
                  value={newInsightItem}
                  onChange={(e) => setNewInsightItem(e.target.value)}
                  placeholder="Enter insight content..."
                  rows={2}
                />
                <Button
                  type="button"
                  onClick={handleAddInsightItem}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Current Insights ({editingContainer?.items.length || 0})</Label>
              <ul className="space-y-2 max-h-64 overflow-y-auto">
                {editingContainer?.items.map((item: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 p-2 bg-gray-50 rounded text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="flex-1">{item}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => {
                        const containerIndex = insightContainers.findIndex(c => c.id === editingContainer.id);
                        handleRemoveInsightItem(containerIndex, index);
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setEditingContainer(null)}
              >
                Close
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Announcement Dialog */}
      <Dialog open={announcementDialog} onOpenChange={setAnnouncementDialog}>
        <DialogContent className="w-[95vw] max-w-[600px] max-h-[95vh] bg-white border-0 shadow-2xl rounded-lg overflow-hidden [&>button]:hidden">
          <DialogHeader className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-900 text-white -m-6 px-8 py-6 mb-0 relative">
            <Button
              onClick={() => {
                setAnnouncementDialog(false);
                setEditingAnnouncement(null);
                setAnnouncementFormData({ title: '', content: '', date: '' });
              }}
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 h-8 w-8 p-0 text-white hover:bg-white/10 hover:text-white rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
            <DialogTitle className="text-xl pr-12">
              {editingAnnouncement ? 'Edit Announcement' : 'Add New Announcement'}
            </DialogTitle>
            <DialogDescription className="text-sm text-blue-100 mt-2 sr-only">
              {editingAnnouncement ? 'Update announcement details' : 'Create a new announcement'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto max-h-[calc(95vh-180px)] p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="announcementTitle">Title *</Label>
              <Input
                id="announcementTitle"
                placeholder="Enter announcement title..."
                value={announcementFormData.title}
                onChange={(e) => setAnnouncementFormData({ ...announcementFormData, title: e.target.value })}
                className="border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="announcementContent">Content *</Label>
              <Textarea
                id="announcementContent"
                placeholder="Enter announcement content..."
                value={announcementFormData.content}
                onChange={(e) => setAnnouncementFormData({ ...announcementFormData, content: e.target.value })}
                className="border-gray-300 min-h-[120px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="announcementDate">Date</Label>
              <Input
                id="announcementDate"
                type="text"
                placeholder="e.g., December 15, 2024"
                value={announcementFormData.date}
                onChange={(e) => setAnnouncementFormData({ ...announcementFormData, date: e.target.value })}
                className="border-gray-300"
              />
            </div>

            <DialogFooter className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setAnnouncementDialog(false);
                  setEditingAnnouncement(null);
                  setAnnouncementFormData({ title: '', content: '', date: '' });
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={editingAnnouncement ? handleUpdateAnnouncement : handleAddAnnouncement}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {editingAnnouncement ? 'Update' : 'Add'} Announcement
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Project Highlight Dialog */}
      <Dialog open={highlightDialog} onOpenChange={setHighlightDialog}>
        <DialogContent className="w-[95vw] max-w-[600px] max-h-[95vh] bg-white border-0 shadow-2xl rounded-lg overflow-hidden [&>button]:hidden">
          <DialogHeader className="bg-gradient-to-r from-amber-900 via-orange-900 to-amber-900 text-white -m-6 px-8 py-6 mb-0 relative">
            <Button
              onClick={() => {
                setHighlightDialog(false);
                setEditingHighlight(null);
                setHighlightFormData({ projectId: '', description: '' });
              }}
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 h-8 w-8 p-0 text-white hover:bg-white/10 hover:text-white rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
            <DialogTitle className="text-xl pr-12">
              {editingHighlight ? 'Edit Project Highlight' : 'Add Project Highlight'}
            </DialogTitle>
            <DialogDescription className="text-sm text-amber-100 mt-2 sr-only">
              {editingHighlight ? 'Update project highlight details' : 'Feature a repair project'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto max-h-[calc(95vh-180px)] p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="highlightProject">Select Project *</Label>
              <Select
                value={highlightFormData.projectId}
                onValueChange={(value) => setHighlightFormData({ ...highlightFormData, projectId: value })}
              >
                <SelectTrigger className="border-gray-300">
                  <SelectValue placeholder="Choose a project to highlight..." />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  {allProjects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.title} - {project.campus}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="highlightDescription">Description *</Label>
              <Textarea
                id="highlightDescription"
                placeholder="Describe why this project is being highlighted..."
                value={highlightFormData.description}
                onChange={(e) => setHighlightFormData({ ...highlightFormData, description: e.target.value })}
                className="border-gray-300 min-h-[120px]"
              />
            </div>

            <DialogFooter className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setHighlightDialog(false);
                  setEditingHighlight(null);
                  setHighlightFormData({ projectId: '', description: '' });
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={editingHighlight ? handleUpdateHighlight : handleAddHighlight}
                className="bg-amber-600 hover:bg-amber-700"
              >
                {editingHighlight ? 'Update' : 'Add'} Highlight
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}