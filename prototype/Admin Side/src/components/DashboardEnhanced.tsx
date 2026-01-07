import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, ComposedChart, Line, AreaChart, Area
} from 'recharts';
import { getAllProjects } from '../utils/projectData';
import { toast } from 'sonner@2.0.3';
import { ArrowRight, Info, TrendingUp, Users, Target, Activity, Settings, Eye, Edit, Trash2, Plus, Building, BookOpen, FileText, Calendar, CheckCircle, BarChart3, PieChart as PieChartIcon, Shield, Clock, Database, Zap, Award, Globe } from 'lucide-react';
import pmoLogo from 'figma:asset/cde42386194a5338b58446ac02ce0c71b82fc191.png';

// Enhanced professional color palette
const DESIGN_COLORS = {
  primary: '#0f172a',
  secondary: '#334155',
  accent: '#1e293b',
  success: '#0d9488',
  warning: '#ea580c',
  error: '#dc2626',
  info: '#0369a1',
  muted: '#64748b',
  background: '#f8fafc',
  surface: '#ffffff',
  border: '#e2e8f0',
  // Enhanced chart colors
  chartPrimary: '#1e40af',
  chartSecondary: '#059669',
  chartTertiary: '#dc2626',
  chartAccent: '#7c3aed',
  chartWarning: '#ea580c',
  chartInfo: '#0284c7',
  chartMuted: '#64748b'
};

// RBAC Configuration
const ROLES = {
  ADMIN: 'Admin',
  STAFF: 'Staff', 
  CLIENT: 'Client'
};

const PERMISSIONS = {
  CREATE_NEWS: [ROLES.ADMIN, ROLES.STAFF],
  UPDATE_NEWS: [ROLES.ADMIN, ROLES.STAFF],
  DELETE_NEWS: [ROLES.ADMIN],
  CREATE_ACTIVITY: [ROLES.ADMIN, ROLES.STAFF],
  UPDATE_ACTIVITY: [ROLES.ADMIN, ROLES.STAFF],
  DELETE_ACTIVITY: [ROLES.ADMIN],
  CREATE_ANNOUNCEMENT: [ROLES.ADMIN, ROLES.STAFF],
  UPDATE_ANNOUNCEMENT: [ROLES.ADMIN, ROLES.STAFF],
  DELETE_ANNOUNCEMENT: [ROLES.ADMIN],
  CREATE_REPORT: [ROLES.ADMIN, ROLES.STAFF],
  UPDATE_REPORT: [ROLES.ADMIN, ROLES.STAFF],
  DELETE_REPORT: [ROLES.ADMIN],
  VIEW_AUDIT: [ROLES.ADMIN]
};

// Enhanced data models
interface AuditLog {
  id: string;
  userId: string;
  userRole: string;
  action: 'create' | 'update' | 'delete';
  resource: string;
  resourceId: string;
  timestamp: string;
  details?: string;
}

interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

interface ActivityItem {
  id: string;
  type: string;
  description: string;
  responsible: string;
  status: 'ongoing' | 'completed' | 'planned';
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  isActive: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

interface ReportItem {
  id: string;
  title: string;
  description: string;
  category: string;
  reportType: 'monthly' | 'quarterly' | 'annual' | 'special';
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

interface CategoryData {
  id: string;
  name: string;
  totalProjects: number;
  completedProjects: number;
  ongoingProjects: number;
  onHoldProjects: number;
  accomplishment: number;
  targetAccomplishment: number;
  variance: number;
  description: string;
  route: string;
  priority: 'high' | 'medium' | 'low';
  icon: React.ReactNode;
  subCategories: string[];
  typicalContents: string[];
}

// Enhanced category data with comprehensive details
const CATEGORIES: CategoryData[] = [
  {
    id: 'university-operations',
    name: 'University Operations',
    totalProjects: 70,
    completedProjects: 59,
    ongoingProjects: 8,
    onHoldProjects: 3,
    accomplishment: 87.2,
    targetAccomplishment: 85.0,
    variance: 2.2,
    description: 'Academic programs and institutional excellence initiatives',
    route: '/university-operations',
    priority: 'high',
    icon: <BookOpen className="h-5 w-5" />,
    subCategories: [
      'Higher Education Program',
      'Advanced Education Program', 
      'Research Program',
      'Technical Advisory & Extension Program'
    ],
    typicalContents: [
      'Academic curriculum development',
      'Faculty development initiatives',
      'Student learning outcomes assessment',
      'Research publications and projects',
      'Community extension programs',
      'Quality assurance processes'
    ]
  },
  {
    id: 'construction-infrastructure',
    name: 'Construction & Infrastructure',
    totalProjects: 81,
    completedProjects: 65,
    ongoingProjects: 12,
    onHoldProjects: 4,
    accomplishment: 85.4,
    targetAccomplishment: 83.0,
    variance: 2.4,
    description: 'Physical development and infrastructure enhancement projects',
    route: '/construction-of-infrastructure',
    priority: 'high',
    icon: <Building className="h-5 w-5" />,
    subCategories: [
      'GAA-Funded Projects',
      'Locally-Funded Projects',
      'Special Grants Projects'
    ],
    typicalContents: [
      'Building construction and renovation',
      'Infrastructure development',
      'Facility maintenance and upgrades',
      'Campus expansion projects',
      'Utility system improvements',
      'Environmental compliance initiatives'
    ]
  },
  {
    id: 'repairs',
    name: 'Repairs & Maintenance',
    totalProjects: 77,
    completedProjects: 63,
    ongoingProjects: 10,
    onHoldProjects: 4,
    accomplishment: 84.9,
    targetAccomplishment: 82.0,
    variance: 2.9,
    description: 'Campus maintenance and facility upkeep operations',
    route: '/repairs',
    priority: 'medium',
    icon: <Settings className="h-5 w-5" />,
    subCategories: [
      'Classrooms (CSU Main & Cabadbaran Campus)',
      'Administrative Offices (CSU Main & Cabadbaran Campus)'
    ],
    typicalContents: [
      'Preventive maintenance schedules',
      'Emergency repair responses',
      'Equipment replacement programs',
      'Safety compliance updates',
      'Energy efficiency improvements',
      'Aesthetic enhancements'
    ]
  },
  {
    id: 'policies',
    name: 'Policies & Governance',
    totalProjects: 12,
    completedProjects: 10,
    ongoingProjects: 2,
    onHoldProjects: 0,
    accomplishment: 96.2,
    targetAccomplishment: 90.0,
    variance: 6.2,
    description: 'Institutional policies and governance framework',
    route: '/policies',
    priority: 'medium',
    icon: <FileText className="h-5 w-5" />,
    subCategories: [
      'Memorandum of Agreements',
      'Memorandum of Understanding'
    ],
    typicalContents: [
      'Institutional policy development',
      'Compliance monitoring frameworks',
      'Partnership agreements',
      'Regulatory compliance documentation',
      'Governance structure guidelines',
      'Strategic planning documents'
    ]
  },
  {
    id: 'gad-parity-report',
    name: 'GAD Parity Report',
    totalProjects: 4,
    completedProjects: 4,
    ongoingProjects: 0,
    onHoldProjects: 0,
    accomplishment: 97.5,
    targetAccomplishment: 95.0,
    variance: 2.5,
    description: 'Gender and development compliance and reporting',
    route: '/gad-parity-report',
    priority: 'high',
    icon: <Users className="h-5 w-5" />,
    subCategories: [
      'Gender Parity Admission Rate',
      'Gender Parity Graduation Rate',
      'GPB Accomplishment',
      'GAD Budget and Plans'
    ],
    typicalContents: [
      'Gender equality assessments',
      'Diversity and inclusion metrics',
      'Women empowerment programs',
      'Gender-responsive budgeting',
      'Anti-discrimination policies',
      'Equal opportunity initiatives'
    ]
  },
  {
    id: 'forms',
    name: 'Downloadable Forms',
    totalProjects: 6,
    completedProjects: 6,
    ongoingProjects: 0,
    onHoldProjects: 0,
    accomplishment: 100.0,
    targetAccomplishment: 100.0,
    variance: 0.0,
    description: 'Official documents and templates for institutional use',
    route: '/forms',
    priority: 'low',
    icon: <FileText className="h-5 w-5" />,
    subCategories: [
      'HGDG-16 Sectoral Forms',
      'PIMME Checklist',
      'PMO Monthly Accomplishment Form',
      'Evaluation Plan',
      'Monitoring Plan',
      'CSU M&E Plan'
    ],
    typicalContents: [
      'Administrative forms and templates',
      'Evaluation and assessment tools',
      'Monitoring and reporting forms',
      'Compliance documentation',
      'Standard operating procedures',
      'Quality assurance checklists'
    ]
  }
];

// Sample data
const INITIAL_NEWS: NewsItem[] = [
  {
    id: '1',
    title: 'PMO Successfully Implements Enhanced MEAL Framework',
    excerpt: 'Comprehensive monitoring, evaluation, accountability, and learning approach now operational across all project categories with improved transparency and stakeholder engagement.',
    category: 'System Enhancement',
    priority: 'high',
    createdAt: '2024-01-15T08:00:00Z',
    createdBy: 'PMO Administrator'
  },
  {
    id: '2',
    title: 'Outstanding University Operations Performance Achievement',
    excerpt: 'Academic programs exceed quarterly targets with 87.2% accomplishment rate, demonstrating excellence in educational delivery and research initiatives.',
    category: 'Performance Update',
    priority: 'medium',
    createdAt: '2024-01-12T10:30:00Z',
    createdBy: 'Performance Analyst'
  }
];

const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: '1',
    type: 'Assessment',
    description: 'Quarterly MEAL framework assessment and compliance review completed across all project categories',
    responsible: 'PMO Assessment Team',
    status: 'completed',
    priority: 'high',
    createdAt: '2024-01-15T09:00:00Z',
    createdBy: 'PMO Coordinator'
  },
  {
    id: '2',
    type: 'Monitoring',
    description: 'Construction project progress monitoring and quality assurance site visits conducted',
    responsible: 'PMO Engineering Division',
    status: 'ongoing',
    priority: 'high',
    createdAt: '2024-01-14T14:30:00Z',
    createdBy: 'Field Coordinator'
  }
];

const INITIAL_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: '1',
    title: 'System Maintenance Scheduled',
    content: 'Dashboard maintenance scheduled for January 20, 2024 from 2:00 AM to 4:00 AM. All data will remain accessible.',
    category: 'System',
    priority: 'medium',
    isActive: true,
    createdAt: '2024-01-14T08:00:00Z',
    createdBy: 'System Administrator'
  }
];

const INITIAL_REPORTS: ReportItem[] = [
  {
    id: '1',
    title: 'Q4 2023 PMO Performance Report',
    description: 'Comprehensive quarterly assessment covering all project categories and MEAL framework implementation',
    category: 'Performance',
    reportType: 'quarterly',
    status: 'published',
    createdAt: '2024-01-10T08:00:00Z',
    createdBy: 'PMO Director'
  }
];

interface DashboardEnhancedProps {
  userRole: string;
  onChartClick: (dataType: string, filters: any) => void;
  requireAuth: (action: string) => boolean;
  filterData?: { type: string; filters: any } | null;
  onClearFilters: () => void;
  onProjectSelect: (project: any) => void;
  onNavigate: (page: string) => void;
  userProfile?: any;
}

export function DashboardEnhanced({ 
  userRole, 
  onChartClick, 
  requireAuth, 
  filterData, 
  onClearFilters,
  onProjectSelect,
  onNavigate,
  userProfile
}: DashboardEnhancedProps) {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data state
  const [newsItems, setNewsItems] = useState<NewsItem[]>(INITIAL_NEWS);
  const [activities, setActivities] = useState<ActivityItem[]>(INITIAL_ACTIVITIES);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(INITIAL_ANNOUNCEMENTS);
  const [reports, setReports] = useState<ReportItem[]>(INITIAL_REPORTS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  
  // Form state
  const [showNewsForm, setShowNewsForm] = useState(false);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [editingActivity, setEditingActivity] = useState<ActivityItem | null>(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState<AnnouncementItem | null>(null);
  const [editingReport, setEditingReport] = useState<ReportItem | null>(null);
  
  // Delete confirmation state
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    show: boolean;
    type: 'news' | 'activity' | 'announcement' | 'report';
    id: string;
    title: string;
  }>({ show: false, type: 'news', id: '', title: '' });

  const [newsForm, setNewsForm] = useState({
    title: '',
    excerpt: '',
    category: 'General',
    priority: 'medium' as 'high' | 'medium' | 'low'
  });

  const [activityForm, setActivityForm] = useState({
    type: '',
    description: '',
    responsible: '',
    status: 'planned' as 'ongoing' | 'completed' | 'planned',
    priority: 'medium' as 'high' | 'medium' | 'low'
  });

  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    category: 'General',
    priority: 'medium' as 'high' | 'medium' | 'low',
    isActive: true
  });

  const [reportForm, setReportForm] = useState({
    title: '',
    description: '',
    category: 'Performance',
    reportType: 'monthly' as 'monthly' | 'quarterly' | 'annual' | 'special',
    status: 'draft' as 'draft' | 'published' | 'archived'
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Permission checking
  const hasPermission = (action: string): boolean => {
    const permission = PERMISSIONS[action as keyof typeof PERMISSIONS];
    return permission ? permission.includes(userRole) : false;
  };

  // Audit logging
  const logAudit = (action: 'create' | 'update' | 'delete', resource: string, resourceId: string, details?: string) => {
    const auditEntry: AuditLog = {
      id: Date.now().toString(),
      userId: 'current-user-id',
      userRole,
      action,
      resource,
      resourceId,
      timestamp: new Date().toISOString(),
      details
    };
    
    setAuditLogs(prev => [auditEntry, ...prev.slice(0, 99)]);
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      await getAllProjects();
      toast.success('Dashboard data loaded successfully');
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate key metrics
  const calculateMetrics = () => {
    const totalProjects = CATEGORIES.reduce((sum, cat) => sum + cat.totalProjects, 0);
    const totalCompleted = CATEGORIES.reduce((sum, cat) => sum + cat.completedProjects, 0);
    const totalOngoing = CATEGORIES.reduce((sum, cat) => sum + cat.ongoingProjects, 0);
    const totalOnHold = CATEGORIES.reduce((sum, cat) => sum + cat.onHoldProjects, 0);
    const avgAccomplishment = CATEGORIES.reduce((sum, cat) => sum + cat.accomplishment, 0) / CATEGORIES.length;
    const avgVariance = CATEGORIES.reduce((sum, cat) => sum + cat.variance, 0) / CATEGORIES.length;
    
    return {
      totalProjects,
      totalCompleted,
      totalOngoing,
      totalOnHold,
      completionRate: (totalCompleted / totalProjects) * 100,
      avgAccomplishment,
      avgVariance
    };
  };

  // Data preparation for visualizations
  const prepareUniversityOpsData = () => [
    { name: 'Higher Education', target: 85, actual: 88.7, variance: 3.7, projects: 25 },
    { name: 'Advanced Education', target: 80, actual: 82.3, variance: 2.3, projects: 15 },
    { name: 'Research Program', target: 90, actual: 94.2, variance: 4.2, projects: 22 },
    { name: 'Technical Advisory', target: 88, actual: 91.5, variance: 3.5, projects: 8 }
  ];

  const prepareConstructionStatusData = () => [
    { name: 'Completed', value: 65, color: DESIGN_COLORS.chartSecondary, percentage: 80.2 },
    { name: 'Ongoing', value: 12, color: DESIGN_COLORS.chartPrimary, percentage: 14.8 },
    { name: 'On Hold', value: 4, color: DESIGN_COLORS.chartWarning, percentage: 4.9 }
  ];

  const prepareRepairsStatusData = () => [
    { name: 'Completed', value: 63, color: DESIGN_COLORS.chartSecondary, percentage: 81.8 },
    { name: 'Ongoing', value: 10, color: DESIGN_COLORS.chartPrimary, percentage: 13.0 },
    { name: 'On Hold', value: 4, color: DESIGN_COLORS.chartWarning, percentage: 5.2 }
  ];

  // Enhanced trend data for area chart
  const prepareTrendData = () => [
    { month: 'Jul', completion: 78, target: 80, variance: -2 },
    { month: 'Aug', completion: 82, target: 82, variance: 0 },
    { month: 'Sep', completion: 85, target: 83, variance: 2 },
    { month: 'Oct', completion: 87, target: 85, variance: 2 },
    { month: 'Nov', completion: 89, target: 87, variance: 2 },
    { month: 'Dec', completion: 91, target: 89, variance: 2 }
  ];

  // CRUD Operations
  const handleCreateNews = () => {
    if (!hasPermission('CREATE_NEWS')) {
      toast.error('Insufficient permissions');
      return;
    }

    if (!newsForm.title.trim() || !newsForm.excerpt.trim()) {
      toast.error('Title and excerpt are required');
      return;
    }

    const newItem: NewsItem = {
      id: Date.now().toString(),
      title: newsForm.title,
      excerpt: newsForm.excerpt,
      category: newsForm.category,
      priority: newsForm.priority,
      createdAt: new Date().toISOString(),
      createdBy: userRole
    };

    setNewsItems(prev => [newItem, ...prev]);
    logAudit('create', 'news', newItem.id, `Created: ${newItem.title}`);
    
    setNewsForm({ title: '', excerpt: '', category: 'General', priority: 'medium' });
    setShowNewsForm(false);
    toast.success('News item created successfully');
  };

  const handleUpdateNews = () => {
    if (!hasPermission('UPDATE_NEWS') || !editingNews) {
      toast.error('Insufficient permissions');
      return;
    }

    const updatedItem: NewsItem = {
      ...editingNews,
      title: newsForm.title,
      excerpt: newsForm.excerpt,
      category: newsForm.category,
      priority: newsForm.priority,
      updatedAt: new Date().toISOString(),
      updatedBy: userRole
    };

    setNewsItems(prev => prev.map(item => 
      item.id === editingNews.id ? updatedItem : item
    ));
    
    logAudit('update', 'news', editingNews.id, `Updated: ${updatedItem.title}`);
    
    setEditingNews(null);
    setNewsForm({ title: '', excerpt: '', category: 'General', priority: 'medium' });
    setShowNewsForm(false);
    toast.success('News item updated successfully');
  };

  const handleDeleteNews = (id: string) => {
    if (!hasPermission('DELETE_NEWS')) {
      toast.error('Insufficient permissions');
      return;
    }

    const item = newsItems.find(n => n.id === id);
    if (!item) return;

    setDeleteConfirmation({
      show: true,
      type: 'news',
      id,
      title: item.title
    });
  };

  // Enhanced CRUD Operations for Activities
  const handleCreateActivity = () => {
    if (!hasPermission('CREATE_ACTIVITY')) {
      toast.error('Insufficient permissions');
      return;
    }

    if (!activityForm.type.trim() || !activityForm.description.trim()) {
      toast.error('Type and description are required');
      return;
    }

    const newItem: ActivityItem = {
      id: Date.now().toString(),
      type: activityForm.type,
      description: activityForm.description,
      responsible: activityForm.responsible,
      status: activityForm.status,
      priority: activityForm.priority,
      createdAt: new Date().toISOString(),
      createdBy: userRole
    };

    setActivities(prev => [newItem, ...prev]);
    logAudit('create', 'activity', newItem.id, `Created: ${newItem.type}`);
    
    setActivityForm({ 
      type: '', 
      description: '', 
      responsible: '', 
      status: 'planned', 
      priority: 'medium' 
    });
    setShowActivityForm(false);
    toast.success('Activity created successfully');
  };

  const handleUpdateActivity = () => {
    if (!hasPermission('UPDATE_ACTIVITY') || !editingActivity) {
      toast.error('Insufficient permissions');
      return;
    }

    const updatedItem: ActivityItem = {
      ...editingActivity,
      type: activityForm.type,
      description: activityForm.description,
      responsible: activityForm.responsible,
      status: activityForm.status,
      priority: activityForm.priority,
      updatedAt: new Date().toISOString(),
      updatedBy: userRole
    };

    setActivities(prev => prev.map(item => 
      item.id === editingActivity.id ? updatedItem : item
    ));
    
    logAudit('update', 'activity', editingActivity.id, `Updated: ${updatedItem.type}`);
    
    setEditingActivity(null);
    setActivityForm({ type: '', description: '', responsible: '', status: 'planned', priority: 'medium' });
    setShowActivityForm(false);
    toast.success('Activity updated successfully');
  };

  const handleDeleteActivity = (id: string) => {
    if (!hasPermission('DELETE_ACTIVITY')) {
      toast.error('Insufficient permissions');
      return;
    }

    const item = activities.find(a => a.id === id);
    if (!item) return;

    setDeleteConfirmation({
      show: true,
      type: 'activity',
      id,
      title: item.description
    });
  };

  // Enhanced CRUD Operations for Announcements
  const handleCreateAnnouncement = () => {
    if (!hasPermission('CREATE_ANNOUNCEMENT')) {
      toast.error('Insufficient permissions');
      return;
    }

    if (!announcementForm.title.trim() || !announcementForm.content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    const newItem: AnnouncementItem = {
      id: Date.now().toString(),
      title: announcementForm.title,
      content: announcementForm.content,
      category: announcementForm.category,
      priority: announcementForm.priority,
      isActive: announcementForm.isActive,
      createdAt: new Date().toISOString(),
      createdBy: userRole
    };

    setAnnouncements(prev => [newItem, ...prev]);
    logAudit('create', 'announcement', newItem.id, `Created: ${newItem.title}`);
    
    setAnnouncementForm({ 
      title: '', 
      content: '', 
      category: 'General', 
      priority: 'medium', 
      isActive: true 
    });
    setShowAnnouncementForm(false);
    toast.success('Announcement created successfully');
  };

  const handleUpdateAnnouncement = () => {
    if (!hasPermission('UPDATE_ANNOUNCEMENT') || !editingAnnouncement) {
      toast.error('Insufficient permissions');
      return;
    }

    const updatedItem: AnnouncementItem = {
      ...editingAnnouncement,
      title: announcementForm.title,
      content: announcementForm.content,
      category: announcementForm.category,
      priority: announcementForm.priority,
      isActive: announcementForm.isActive,
      updatedAt: new Date().toISOString(),
      updatedBy: userRole
    };

    setAnnouncements(prev => prev.map(item => 
      item.id === editingAnnouncement.id ? updatedItem : item
    ));
    
    logAudit('update', 'announcement', editingAnnouncement.id, `Updated: ${updatedItem.title}`);
    
    setEditingAnnouncement(null);
    setAnnouncementForm({ title: '', content: '', category: 'General', priority: 'medium', isActive: true });
    setShowAnnouncementForm(false);
    toast.success('Announcement updated successfully');
  };

  const handleDeleteAnnouncement = (id: string) => {
    if (!hasPermission('DELETE_ANNOUNCEMENT')) {
      toast.error('Insufficient permissions');
      return;
    }

    const item = announcements.find(a => a.id === id);
    if (!item) return;

    setDeleteConfirmation({
      show: true,
      type: 'announcement',
      id,
      title: item.title
    });
  };

  // Enhanced CRUD Operations for Reports
  const handleCreateReport = () => {
    if (!hasPermission('CREATE_REPORT')) {
      toast.error('Insufficient permissions');
      return;
    }

    if (!reportForm.title.trim() || !reportForm.description.trim()) {
      toast.error('Title and description are required');
      return;
    }

    const newItem: ReportItem = {
      id: Date.now().toString(),
      title: reportForm.title,
      description: reportForm.description,
      category: reportForm.category,
      reportType: reportForm.reportType,
      status: reportForm.status,
      createdAt: new Date().toISOString(),
      createdBy: userRole
    };

    setReports(prev => [newItem, ...prev]);
    logAudit('create', 'report', newItem.id, `Created: ${newItem.title}`);
    
    setReportForm({ 
      title: '', 
      description: '', 
      category: 'Performance', 
      reportType: 'monthly', 
      status: 'draft' 
    });
    setShowReportForm(false);
    toast.success('Report created successfully');
  };

  const handleUpdateReport = () => {
    if (!hasPermission('UPDATE_REPORT') || !editingReport) {
      toast.error('Insufficient permissions');
      return;
    }

    const updatedItem: ReportItem = {
      ...editingReport,
      title: reportForm.title,
      description: reportForm.description,
      category: reportForm.category,
      reportType: reportForm.reportType,
      status: reportForm.status,
      updatedAt: new Date().toISOString(),
      updatedBy: userRole
    };

    setReports(prev => prev.map(item => 
      item.id === editingReport.id ? updatedItem : item
    ));
    
    logAudit('update', 'report', editingReport.id, `Updated: ${updatedItem.title}`);
    
    setEditingReport(null);
    setReportForm({ title: '', description: '', category: 'Performance', reportType: 'monthly', status: 'draft' });
    setShowReportForm(false);
    toast.success('Report updated successfully');
  };

  const handleDeleteReport = (id: string) => {
    if (!hasPermission('DELETE_REPORT')) {
      toast.error('Insufficient permissions');
      return;
    }

    const item = reports.find(r => r.id === id);
    if (!item) return;

    setDeleteConfirmation({
      show: true,
      type: 'report',
      id,
      title: item.title
    });
  };

  const confirmDelete = () => {
    const { type, id, title } = deleteConfirmation;
    
    if (type === 'news') {
      setNewsItems(prev => prev.filter(item => item.id !== id));
      logAudit('delete', 'news', id, `Deleted: ${title}`);
    } else if (type === 'activity') {
      setActivities(prev => prev.filter(item => item.id !== id));
      logAudit('delete', 'activity', id, `Deleted: ${title}`);
    } else if (type === 'announcement') {
      setAnnouncements(prev => prev.filter(item => item.id !== id));
      logAudit('delete', 'announcement', id, `Deleted: ${title}`);
    } else if (type === 'report') {
      setReports(prev => prev.filter(item => item.id !== id));
      logAudit('delete', 'report', id, `Deleted: ${title}`);
    }
    
    setDeleteConfirmation({ show: false, type: 'news', id: '', title: '' });
    toast.success(`${type} deleted successfully`);
  };

  const startEditNews = (item: NewsItem) => {
    setEditingNews(item);
    setNewsForm({
      title: item.title,
      excerpt: item.excerpt,
      category: item.category,
      priority: item.priority
    });
    setShowNewsForm(true);
  };

  const startEditActivity = (item: ActivityItem) => {
    setEditingActivity(item);
    setActivityForm({
      type: item.type,
      description: item.description,
      responsible: item.responsible,
      status: item.status,
      priority: item.priority
    });
    setShowActivityForm(true);
  };

  const startEditAnnouncement = (item: AnnouncementItem) => {
    setEditingAnnouncement(item);
    setAnnouncementForm({
      title: item.title,
      content: item.content,
      category: item.category,
      priority: item.priority,
      isActive: item.isActive
    });
    setShowAnnouncementForm(true);
  };

  const startEditReport = (item: ReportItem) => {
    setEditingReport(item);
    setReportForm({
      title: item.title,
      description: item.description,
      category: item.category,
      reportType: item.reportType,
      status: item.status
    });
    setShowReportForm(true);
  };

  const handleCategoryNavigation = (categoryId: string) => {
    const category = CATEGORIES.find(c => c.id === categoryId);
    if (category) {
      onNavigate(category.route.substring(1));
      toast.success(`Navigating to ${category.name}`);
    }
  };

  const handleAboutUsNavigation = () => {
    onNavigate('about-us');
    toast.info('Navigating to About Us page');
  };

  const handleChartNavigation = (dataType: string, categoryId: string) => {
    handleCategoryNavigation(categoryId);
  };

  // Custom tooltip components
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-medium text-slate-900 mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex justify-between items-center">
                <span style={{ color: entry.color }}>{entry.dataKey}:</span>
                <span className="font-medium ml-2">{entry.value}{entry.dataKey.includes('variance') ? '%' : ''}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-medium text-slate-900 mb-1">{data.name}</p>
          <div className="text-sm">
            <p>Projects: <span className="font-medium">{data.value}</span></p>
            <p>Percentage: <span className="font-medium">{data.percentage}%</span></p>
          </div>
        </div>
      );
    }
    return null;
  };

  const metrics = calculateMetrics();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading PMO Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Minimal Professional Header */}
        <div className="bg-white border-b border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <img 
                  src={pmoLogo}
                  alt="CSU PMO Logo"
                  className="h-12 w-12 rounded object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-medium text-gray-900">Project Management Dashboard</h1>
                <p className="text-sm text-gray-600 mt-1">Caraga State University PMO</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Online</span>
              </div>
              <p className="text-xs text-gray-500">Updated: January 15, 2024</p>
            </div>
          </div>
        </div>

        {/* Simplified Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white border border-gray-200 h-12 mb-8">
            <TabsTrigger value="overview" className="h-10 text-sm data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900">
              <Eye className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="insights" className="h-10 text-sm data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="activity-center" className="h-10 text-sm data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900">
              <Activity className="h-4 w-4 mr-2" />
              Activity
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-8">
            {/* System Introduction */}
            <Card className="border-gray-200">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-medium text-gray-900 mb-3">
                    PMO Monitoring & Evaluation System
                  </h2>
                  <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">
                    A comprehensive project management platform implementing the MEAL (Monitoring, Evaluation, 
                    Accountability & Learning) framework to ensure transparency, efficiency, and continuous 
                    improvement across all institutional operations at Caraga State University.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Eye className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-medium text-gray-900 mb-2">Complete Transparency</h3>
                    <p className="text-sm text-gray-600">Real-time access to project data, progress updates, and performance metrics</p>
                  </div>
                  
                  <div>
                    <div className="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="font-medium text-gray-900 mb-2">Data-Driven Insights</h3>
                    <p className="text-sm text-gray-600">Evidence-based decision making through comprehensive analytics and reporting</p>
                  </div>
                  
                  <div>
                    <div className="h-12 w-12 bg-purple-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="font-medium text-gray-900 mb-2">Stakeholder Engagement</h3>
                    <p className="text-sm text-gray-600">Enhanced collaboration and communication across all university levels</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Projects</p>
                      <p className="text-2xl font-medium text-gray-900">{metrics.totalProjects}</p>
                    </div>
                    <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-6 w-6 text-gray-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Completed</p>
                      <p className="text-2xl font-medium text-green-600">{metrics.totalCompleted}</p>
                    </div>
                    <div className="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">In Progress</p>
                      <p className="text-2xl font-medium text-blue-600">{metrics.totalOngoing}</p>
                    </div>
                    <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Clock className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Completion Rate</p>
                      <p className="text-2xl font-medium text-gray-900">{metrics.completionRate.toFixed(1)}%</p>
                    </div>
                    <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-gray-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Comprehensive System Categories */}
            <Card className="border-gray-200">
              <CardHeader className="pb-6">
                <CardTitle className="text-xl font-medium text-gray-900">System Categories & Capabilities</CardTitle>
                <CardDescription className="text-gray-600">
                  Explore comprehensive project tracking, reporting, and management across all university operations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* University Operations */}
                <div className="border border-gray-100 rounded-lg p-6 hover:border-gray-200 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookOpen className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-medium text-gray-900">University Operations</h3>
                        <Button 
                          onClick={() => handleCategoryNavigation('university-operations')} 
                          variant="outline" 
                          size="sm"
                          className="border-gray-200 hover:bg-gray-50"
                        >
                          <ArrowRight className="h-4 w-4 mr-1" />
                          Explore
                        </Button>
                      </div>
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        Track and manage academic programs, research initiatives, and extension activities. 
                        Access quarterly assessments, performance metrics, and detailed progress reports for 
                        higher education programs, advanced studies, research projects, and community outreach.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="text-xs">Higher Education Programs</Badge>
                        <Badge variant="secondary" className="text-xs">Research Tracking</Badge>
                        <Badge variant="secondary" className="text-xs">Extension Programs</Badge>
                        <Badge variant="secondary" className="text-xs">Performance Analytics</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Construction Infrastructure */}
                <div className="border border-gray-100 rounded-lg p-6 hover:border-gray-200 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-medium text-gray-900">Construction & Infrastructure</h3>
                        <Button 
                          onClick={() => handleCategoryNavigation('construction-infrastructure')} 
                          variant="outline" 
                          size="sm"
                          className="border-gray-200 hover:bg-gray-50"
                        >
                          <ArrowRight className="h-4 w-4 mr-1" />
                          Explore
                        </Button>
                      </div>
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        Monitor major construction projects across both campuses. Access detailed project timelines, 
                        budget tracking, progress photos, and comprehensive documentation for GAA-funded, locally-funded, 
                        and special grants projects with complete transparency and accountability.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="text-xs">GAA-Funded Projects</Badge>
                        <Badge variant="secondary" className="text-xs">Local Funding</Badge>
                        <Badge variant="secondary" className="text-xs">Special Grants</Badge>
                        <Badge variant="secondary" className="text-xs">Progress Tracking</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Repairs & Maintenance */}
                <div className="border border-gray-100 rounded-lg p-6 hover:border-gray-200 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Settings className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-medium text-gray-900">Repairs & Maintenance</h3>
                        <Button 
                          onClick={() => handleCategoryNavigation('repairs')} 
                          variant="outline" 
                          size="sm"
                          className="border-gray-200 hover:bg-gray-50"
                        >
                          <ArrowRight className="h-4 w-4 mr-1" />
                          Explore
                        </Button>
                      </div>
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        Comprehensive facility management for both Main Campus and Cabadbaran Campus. Track classroom 
                        repairs, administrative office maintenance, and infrastructure upkeep with detailed assessments, 
                        prioritization matrices, and resource allocation planning.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="text-xs">Main Campus</Badge>
                        <Badge variant="secondary" className="text-xs">Cabadbaran Campus</Badge>
                        <Badge variant="secondary" className="text-xs">Priority Assessment</Badge>
                        <Badge variant="secondary" className="text-xs">Resource Planning</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Policies & Governance */}
                <div className="border border-gray-100 rounded-lg p-6 hover:border-gray-200 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-medium text-gray-900">Policies & Governance</h3>
                        <Button 
                          onClick={() => handleCategoryNavigation('policies')} 
                          variant="outline" 
                          size="sm"
                          className="border-gray-200 hover:bg-gray-50"
                        >
                          <ArrowRight className="h-4 w-4 mr-1" />
                          Explore
                        </Button>
                      </div>
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        Access and manage institutional agreements, partnerships, and policy documents. Track MOAs 
                        and MOUs with validity monitoring, stakeholder information, and compliance status to ensure 
                        institutional accountability and transparent governance.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="text-xs">MOA Tracking</Badge>
                        <Badge variant="secondary" className="text-xs">MOU Management</Badge>
                        <Badge variant="secondary" className="text-xs">Validity Monitoring</Badge>
                        <Badge variant="secondary" className="text-xs">Compliance</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* GAD & Inclusion */}
                <div className="border border-gray-100 rounded-lg p-6 hover:border-gray-200 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="h-6 w-6 text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-medium text-gray-900">Gender & Development Reports</h3>
                        <Button 
                          onClick={() => handleCategoryNavigation('gad-parity-report')} 
                          variant="outline" 
                          size="sm"
                          className="border-gray-200 hover:bg-gray-50"
                        >
                          <ArrowRight className="h-4 w-4 mr-1" />
                          Explore
                        </Button>
                      </div>
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        Monitor gender parity and inclusive development initiatives. Access admission and graduation 
                        statistics, GAD budget planning, and accomplishment reports to ensure equitable educational 
                        opportunities and institutional diversity commitments.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="text-xs">Gender Parity</Badge>
                        <Badge variant="secondary" className="text-xs">Budget Planning</Badge>
                        <Badge variant="secondary" className="text-xs">Progress Reports</Badge>
                        <Badge variant="secondary" className="text-xs">Compliance</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Forms & Documentation */}
                <div className="border border-gray-100 rounded-lg p-6 hover:border-gray-200 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="h-6 w-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-medium text-gray-900">Forms & Resources</h3>
                        <Button 
                          onClick={() => handleCategoryNavigation('forms')} 
                          variant="outline" 
                          size="sm"
                          className="border-gray-200 hover:bg-gray-50"
                        >
                          <ArrowRight className="h-4 w-4 mr-1" />
                          Explore
                        </Button>
                      </div>
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        Access essential PMO forms, templates, and documentation resources. Download monitoring and 
                        evaluation forms, accomplishment templates, checklists, and planning documents to streamline 
                        project management processes and ensure standardized reporting.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="text-xs">ME Forms</Badge>
                        <Badge variant="secondary" className="text-xs">Templates</Badge>
                        <Badge variant="secondary" className="text-xs">Checklists</Badge>
                        <Badge variant="secondary" className="text-xs">Resources</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Status & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* System Status */}
              <Card className="border-gray-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-medium text-gray-900">System Status</CardTitle>
                  <CardDescription className="text-gray-600">Current system health and operational status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">MEAL Framework</span>
                    </div>
                    <span className="text-sm text-green-600 font-medium">Active</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">Data Synchronization</span>
                    </div>
                    <span className="text-sm text-green-600 font-medium">Up to Date</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">System Performance</span>
                    </div>
                    <span className="text-sm text-green-600 font-medium">Optimal</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">Next Assessment</span>
                    </div>
                    <span className="text-sm text-yellow-600 font-medium">Apr 15, 2024</span>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <div className="text-xs text-gray-500 text-center">
                      Last updated: January 15, 2024
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="border-gray-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-medium text-gray-900">Quick Actions</CardTitle>
                  <CardDescription className="text-gray-600">Frequently used system functions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={() => setActiveTab('insights')} 
                    variant="outline" 
                    className="w-full justify-start border-gray-200 hover:bg-gray-50"
                  >
                    <BarChart3 className="h-4 w-4 mr-3" />
                    View Analytics Dashboard
                  </Button>
                  
                  <Button 
                    onClick={() => handleCategoryNavigation('forms')} 
                    variant="outline" 
                    className="w-full justify-start border-gray-200 hover:bg-gray-50"
                  >
                    <FileText className="h-4 w-4 mr-3" />
                    Download Forms & Templates
                  </Button>
                  
                  <Button 
                    onClick={() => handleAboutUsNavigation()} 
                    variant="outline" 
                    className="w-full justify-start border-gray-200 hover:bg-gray-50"
                  >
                    <Users className="h-4 w-4 mr-3" />
                    Contact PMO Team
                  </Button>
                  
                  <Button 
                    onClick={() => setActiveTab('activity-center')} 
                    variant="outline" 
                    className="w-full justify-start border-gray-200 hover:bg-gray-50"
                  >
                    <Activity className="h-4 w-4 mr-3" />
                    View Recent Activities
                  </Button>
                  
                  {hasPermission('CREATE_NEWS') && (
                    <Button 
                      onClick={() => setShowNewsForm(true)} 
                      variant="outline" 
                      className="w-full justify-start border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      <Plus className="h-4 w-4 mr-3" />
                      Create Announcement
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Getting Started & Help */}
            <Card className="border-gray-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-medium text-gray-900">Getting Started</CardTitle>
                <CardDescription className="text-gray-600">
                  Role-specific guidance and system navigation help
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Eye className="h-4 w-4 text-blue-600" />
                      </div>
                      <h4 className="font-medium text-blue-900">For Viewing</h4>
                    </div>
                    <p className="text-sm text-blue-800 mb-3">
                      Browse project data, view reports, and access public information without authentication.
                    </p>
                    <ul className="space-y-1 text-xs text-blue-700">
                      <li>• View all project categories</li>
                      <li>• Access progress reports</li>
                      <li>• Download public forms</li>
                    </ul>
                  </div>

                  {userProfile?.role === 'Staff' && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <Edit className="h-4 w-4 text-green-600" />
                        </div>
                        <h4 className="font-medium text-green-900">Staff Functions</h4>
                      </div>
                      <p className="text-sm text-green-800 mb-3">
                        Create and update project information, manage announcements, and access staff tools.
                      </p>
                      <ul className="space-y-1 text-xs text-green-700">
                        <li>• Create announcements</li>
                        <li>• Update project data</li>
                        <li>• Access activity center</li>
                      </ul>
                    </div>
                  )}

                  {userProfile?.role === 'Admin' && (
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Shield className="h-4 w-4 text-purple-600" />
                        </div>
                        <h4 className="font-medium text-purple-900">Admin Controls</h4>
                      </div>
                      <p className="text-sm text-purple-800 mb-3">
                        Full system access including user management, system settings, and audit capabilities.
                      </p>
                      <ul className="space-y-1 text-xs text-purple-700">
                        <li>• Manage users & roles</li>
                        <li>• System configuration</li>
                        <li>• Audit logs access</li>
                      </ul>
                    </div>
                  )}

                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Info className="h-4 w-4 text-gray-600" />
                      </div>
                      <h4 className="font-medium text-gray-900">Need Help?</h4>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">
                      Access documentation, contact support, or learn about the MEAL framework.
                    </p>
                    <Button 
                      onClick={() => handleAboutUsNavigation()} 
                      variant="ghost" 
                      size="sm"
                      className="text-xs"
                    >
                      Contact PMO Team →
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Announcements */}
            <Card className="border-gray-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-medium text-gray-900">System Announcements</CardTitle>
                <CardDescription className="text-gray-600">Important notices and updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Info className="h-3 w-3 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-900 mb-1">MEAL Framework Q1 2024 Assessment</h4>
                    <p className="text-sm text-blue-800 mb-2">
                      Quarterly monitoring and evaluation assessment has been completed. All stakeholders can now access updated project status and performance metrics.
                    </p>
                    <p className="text-xs text-blue-600">January 15, 2024</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                  <div className="h-6 w-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-green-900 mb-1">System Maintenance Completed</h4>
                    <p className="text-sm text-green-800 mb-2">
                      Scheduled system maintenance has been successfully completed. All features are now fully operational.
                    </p>
                    <p className="text-xs text-green-600">January 14, 2024</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                  <div className="h-6 w-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Calendar className="h-3 w-3 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-yellow-900 mb-1">Upcoming: Q2 Planning Session</h4>
                    <p className="text-sm text-yellow-800 mb-2">
                      Q2 2024 project planning and resource allocation session scheduled for February 1-3, 2024.
                    </p>
                    <p className="text-xs text-yellow-600">Reminder</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity Summary */}
            <Card className="border-gray-200">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-medium text-gray-900">Recent Activity</CardTitle>
                    <CardDescription className="text-gray-600">Latest project updates and system activity</CardDescription>
                  </div>
                  <Button 
                    onClick={() => setActiveTab('activity-center')} 
                    variant="ghost" 
                    size="sm"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    View All
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 border border-gray-100 rounded-lg">
                    <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">MEAL Framework Assessment</h4>
                        <Badge variant="secondary" className="text-xs">Completed</Badge>
                      </div>
                      <p className="text-sm text-gray-600">Quarterly monitoring and evaluation completed across all categories</p>
                      <p className="text-xs text-gray-500 mt-1">January 15, 2024</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 border border-gray-100 rounded-lg">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Building className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">Infrastructure Progress Update</h4>
                        <Badge variant="secondary" className="text-xs">In Progress</Badge>
                      </div>
                      <p className="text-sm text-gray-600">12 construction projects ongoing with 85.4% completion rate</p>
                      <p className="text-xs text-gray-500 mt-1">January 14, 2024</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 border border-gray-100 rounded-lg">
                    <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FileText className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">System Data Updated</h4>
                        <Badge variant="secondary" className="text-xs">System</Badge>
                      </div>
                      <p className="text-sm text-gray-600">Project data synchronized across all categories</p>
                      <p className="text-xs text-gray-500 mt-1">January 15, 2024</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ENHANCED DATA INSIGHTS TAB */}
          <TabsContent value="insights" className="space-y-6">
            {/* Enhanced Overview Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <Target className="h-6 w-6 text-blue-600 mr-2" />
                    <div className="text-3xl font-semibold text-blue-900">{metrics.totalProjects}</div>
                  </div>
                  <div className="text-sm text-blue-700 font-medium">Total Projects</div>
                  <div className="text-xs text-blue-600 mt-1">System-wide tracking</div>
                </CardContent>
              </Card>
              <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-emerald-50 to-emerald-100 hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <CheckCircle className="h-6 w-6 text-emerald-600 mr-2" />
                    <div className="text-3xl font-semibold text-emerald-900">{metrics.totalCompleted}</div>
                  </div>
                  <div className="text-sm text-emerald-700 font-medium">Completed</div>
                  <div className="text-xs text-emerald-600 mt-1">{metrics.completionRate.toFixed(1)}% completion rate</div>
                </CardContent>
              </Card>
              <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100 hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <Activity className="h-6 w-6 text-orange-600 mr-2" />
                    <div className="text-3xl font-semibold text-orange-900">{metrics.totalOngoing}</div>
                  </div>
                  <div className="text-sm text-orange-700 font-medium">Ongoing</div>
                  <div className="text-xs text-orange-600 mt-1">Active monitoring</div>
                </CardContent>
              </Card>
              <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <TrendingUp className="h-6 w-6 text-purple-600 mr-2" />
                    <div className="text-3xl font-semibold text-purple-900">{metrics.avgAccomplishment.toFixed(1)}%</div>
                  </div>
                  <div className="text-sm text-purple-700 font-medium">Performance</div>
                  <div className="text-xs text-purple-600 mt-1">{metrics.avgVariance > 0 ? '+' : ''}{metrics.avgVariance.toFixed(1)}% variance</div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced University Operations Chart */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="h-6 w-6 text-slate-700" />
                  <div>
                    <CardTitle className="text-xl font-semibold text-slate-900">University Operations: Performance Analysis</CardTitle>
                    <CardDescription className="text-slate-600">
                      Target vs Actual performance with variance indicators across academic program categories
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-80 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4 border border-slate-200">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart 
                      data={prepareUniversityOpsData()}
                      onClick={() => handleChartNavigation('chart', 'university-operations')}
                      className="cursor-pointer"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#475569' }} />
                      <YAxis tick={{ fontSize: 12, fill: '#475569' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="target" fill={DESIGN_COLORS.chartPrimary} name="Target %" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="actual" fill={DESIGN_COLORS.chartSecondary} name="Actual %" radius={[2, 2, 0, 0]} />
                      <Line type="monotone" dataKey="variance" stroke={DESIGN_COLORS.chartWarning} strokeWidth={3} name="Variance %" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Construction & Repairs Pie Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Construction Infrastructure Status */}
              <Card className="shadow-sm border-slate-200">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <PieChartIcon className="h-6 w-6 text-slate-700" />
                    <div>
                      <CardTitle className="text-lg font-semibold text-slate-900">Construction Infrastructure Status</CardTitle>
                      <CardDescription className="text-slate-600">
                        Project status distribution with completion percentages
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-80 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4 border border-slate-200">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart 
                        onClick={() => handleChartNavigation('chart', 'construction-infrastructure')}
                        className="cursor-pointer"
                      >
                        <Pie
                          data={prepareConstructionStatusData()}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, percentage }) => `${name}: ${percentage}%`}
                        >
                          {prepareConstructionStatusData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomPieTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Repairs Status Pie Chart */}
              <Card className="shadow-sm border-slate-200">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <PieChartIcon className="h-6 w-6 text-slate-700" />
                    <div>
                      <CardTitle className="text-lg font-semibold text-slate-900">Repairs & Maintenance Status</CardTitle>
                      <CardDescription className="text-slate-600">
                        Project status distribution with completion percentages
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-80 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4 border border-slate-200">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart 
                        onClick={() => handleChartNavigation('chart', 'repairs')}
                        className="cursor-pointer"
                      >
                        <Pie
                          data={prepareRepairsStatusData()}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, percentage }) => `${name}: ${percentage}%`}
                        >
                          {prepareRepairsStatusData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomPieTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* New Performance Trends Area Chart */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="h-6 w-6 text-slate-700" />
                  <div>
                    <CardTitle className="text-xl font-semibold text-slate-900">Performance Trends</CardTitle>
                    <CardDescription className="text-slate-600">
                      Six-month performance trend analysis showing completion rates vs targets
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-80 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4 border border-slate-200">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={prepareTrendData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#475569' }} />
                      <YAxis tick={{ fontSize: 12, fill: '#475569' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area 
                        type="monotone" 
                        dataKey="completion" 
                        stroke={DESIGN_COLORS.chartSecondary} 
                        fill={DESIGN_COLORS.chartSecondary} 
                        fillOpacity={0.3}
                        name="Completion %"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="target" 
                        stroke={DESIGN_COLORS.chartPrimary} 
                        fill={DESIGN_COLORS.chartPrimary} 
                        fillOpacity={0.2}
                        name="Target %"
                      />
                      <Line type="monotone" dataKey="variance" stroke={DESIGN_COLORS.chartWarning} strokeWidth={2} name="Variance %" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ENHANCED ACTIVITY CENTER TAB */}
          <TabsContent value="activity-center" className="space-y-6">
            {/* Enhanced PMO Activity Management with Full CRUD */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Activity className="h-6 w-6 text-slate-700" />
                    <div>
                      <CardTitle className="text-xl font-semibold text-slate-900">PMO Activity Center</CardTitle>
                      <CardDescription className="text-slate-600">
                        Real-time activity tracking and operational updates with full management capabilities
                      </CardDescription>
                    </div>
                  </div>
                  {hasPermission('CREATE_ACTIVITY') && (
                    <Button 
                      onClick={() => setShowActivityForm(true)} 
                      size="sm" 
                      className="bg-slate-900 hover:bg-slate-800"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Log Activity
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {showActivityForm && (
                  <div className="mb-6 p-6 bg-slate-50 rounded-lg border border-slate-200">
                    <h4 className="font-medium mb-4 text-slate-900">
                      {editingActivity ? 'Edit Activity' : 'Log New Activity'}
                    </h4>
                    <div className="space-y-4">
                      <Select 
                        value={activityForm.type} 
                        onValueChange={(value) => setActivityForm(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger className="border-slate-300">
                          <SelectValue placeholder="Activity type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Assessment">Assessment</SelectItem>
                          <SelectItem value="Monitoring">Monitoring</SelectItem>
                          <SelectItem value="Evaluation">Evaluation</SelectItem>
                          <SelectItem value="Learning">Learning</SelectItem>
                          <SelectItem value="Planning">Planning</SelectItem>
                          <SelectItem value="Training">Training</SelectItem>
                          <SelectItem value="Review">Review</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Textarea
                        placeholder="Activity description"
                        value={activityForm.description}
                        onChange={(e) => setActivityForm(prev => ({ ...prev, description: e.target.value }))}
                        className="border-slate-300"
                        rows={3}
                      />
                      
                      <div className="grid grid-cols-3 gap-4">
                        <Input
                          placeholder="Responsible team"
                          value={activityForm.responsible}
                          onChange={(e) => setActivityForm(prev => ({ ...prev, responsible: e.target.value }))}
                          className="border-slate-300"
                        />
                        
                        <Select 
                          value={activityForm.status} 
                          onValueChange={(value: 'ongoing' | 'completed' | 'planned') => 
                            setActivityForm(prev => ({ ...prev, status: value }))}
                        >
                          <SelectTrigger className="border-slate-300">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="planned">Planned</SelectItem>
                            <SelectItem value="ongoing">Ongoing</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Select 
                          value={activityForm.priority} 
                          onValueChange={(value: 'high' | 'medium' | 'low') => 
                            setActivityForm(prev => ({ ...prev, priority: value }))}
                        >
                          <SelectTrigger className="border-slate-300">
                            <SelectValue placeholder="Priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">High Priority</SelectItem>
                            <SelectItem value="medium">Medium Priority</SelectItem>
                            <SelectItem value="low">Low Priority</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          onClick={editingActivity ? handleUpdateActivity : handleCreateActivity} 
                          size="sm" 
                          className="bg-slate-900 hover:bg-slate-800"
                        >
                          {editingActivity ? 'Update Activity' : 'Save Activity'}
                        </Button>
                        <Button 
                          onClick={() => {
                            setShowActivityForm(false);
                            setEditingActivity(null);
                            setActivityForm({ 
                              type: '', 
                              description: '', 
                              responsible: '', 
                              status: 'planned', 
                              priority: 'medium' 
                            });
                          }} 
                          variant="outline" 
                          size="sm"
                          className="border-slate-300"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-5 border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="text-center min-w-[110px]">
                          <Badge variant={activity.status === 'completed' ? 'default' : 'secondary'} className="mb-1">
                            {activity.type}
                          </Badge>
                          <div className="text-xs text-slate-500">
                            {new Date(activity.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 text-base">{activity.description}</p>
                          <p className="text-sm text-slate-600 mt-1">
                            Responsible: <span className="font-medium">{activity.responsible}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={activity.status === 'completed' ? 'default' : 'secondary'}>
                          {activity.status}
                        </Badge>
                        {hasPermission('UPDATE_ACTIVITY') && (
                          <Button 
                            onClick={() => startEditActivity(activity)} 
                            variant="ghost" 
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {hasPermission('DELETE_ACTIVITY') && (
                          <Button 
                            onClick={() => handleDeleteActivity(activity.id)} 
                            variant="ghost" 
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Enhanced System Announcements with Full CRUD */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Info className="h-6 w-6 text-slate-700" />
                    <div>
                      <CardTitle className="text-xl font-semibold text-slate-900">System Announcements</CardTitle>
                      <CardDescription className="text-slate-600">
                        Important notifications and system-wide announcements with full management
                      </CardDescription>
                    </div>
                  </div>
                  {hasPermission('CREATE_ANNOUNCEMENT') && (
                    <Button 
                      onClick={() => setShowAnnouncementForm(true)} 
                      size="sm" 
                      className="bg-slate-900 hover:bg-slate-800"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Announcement
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {showAnnouncementForm && (
                  <div className="mb-6 p-6 bg-slate-50 rounded-lg border border-slate-200">
                    <h4 className="font-medium mb-4 text-slate-900">
                      {editingAnnouncement ? 'Edit Announcement' : 'Add New Announcement'}
                    </h4>
                    <div className="space-y-4">
                      <Input
                        placeholder="Announcement title"
                        value={announcementForm.title}
                        onChange={(e) => setAnnouncementForm(prev => ({ ...prev, title: e.target.value }))}
                        className="border-slate-300"
                      />
                      <Textarea
                        placeholder="Announcement content"
                        value={announcementForm.content}
                        onChange={(e) => setAnnouncementForm(prev => ({ ...prev, content: e.target.value }))}
                        className="border-slate-300"
                        rows={3}
                      />
                      <div className="grid grid-cols-3 gap-4">
                        <Select 
                          value={announcementForm.category} 
                          onValueChange={(value) => setAnnouncementForm(prev => ({ ...prev, category: value }))}
                        >
                          <SelectTrigger className="border-slate-300">
                            <SelectValue placeholder="Category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="General">General</SelectItem>
                            <SelectItem value="System">System</SelectItem>
                            <SelectItem value="Maintenance">Maintenance</SelectItem>
                            <SelectItem value="Policy">Policy</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select 
                          value={announcementForm.priority} 
                          onValueChange={(value: 'high' | 'medium' | 'low') => 
                            setAnnouncementForm(prev => ({ ...prev, priority: value }))}
                        >
                          <SelectTrigger className="border-slate-300">
                            <SelectValue placeholder="Priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">High Priority</SelectItem>
                            <SelectItem value="medium">Medium Priority</SelectItem>
                            <SelectItem value="low">Low Priority</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="isActive"
                            checked={announcementForm.isActive}
                            onChange={(e) => setAnnouncementForm(prev => ({ ...prev, isActive: e.target.checked }))}
                            className="rounded border-slate-300"
                          />
                          <label htmlFor="isActive" className="text-sm text-slate-700">Active</label>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={editingAnnouncement ? handleUpdateAnnouncement : handleCreateAnnouncement} 
                          size="sm" 
                          className="bg-slate-900 hover:bg-slate-800"
                        >
                          {editingAnnouncement ? 'Update Announcement' : 'Save Announcement'}
                        </Button>
                        <Button 
                          onClick={() => {
                            setShowAnnouncementForm(false);
                            setEditingAnnouncement(null);
                            setAnnouncementForm({ 
                              title: '', 
                              content: '', 
                              category: 'General', 
                              priority: 'medium', 
                              isActive: true 
                            });
                          }} 
                          variant="outline" 
                          size="sm"
                          className="border-slate-300"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-4">
                  {announcements.map((announcement) => (
                    <div key={announcement.id} className="p-5 border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <Badge variant={announcement.priority === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                              {announcement.category}
                            </Badge>
                            <Badge variant={announcement.isActive ? 'default' : 'outline'} className="text-xs">
                              {announcement.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            <span className="text-xs text-slate-500">
                              {new Date(announcement.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <h4 className="font-medium text-slate-900 mb-2 text-base">{announcement.title}</h4>
                          <p className="text-sm text-slate-600 leading-relaxed">{announcement.content}</p>
                        </div>
                        <div className="flex gap-1 ml-4">
                          {hasPermission('UPDATE_ANNOUNCEMENT') && (
                            <Button 
                              onClick={() => startEditAnnouncement(announcement)} 
                              variant="ghost" 
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {hasPermission('DELETE_ANNOUNCEMENT') && (
                            <Button 
                              onClick={() => handleDeleteAnnouncement(announcement.id)} 
                              variant="ghost" 
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Reports Management with Full CRUD */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-6 w-6 text-slate-700" />
                    <div>
                      <CardTitle className="text-xl font-semibold text-slate-900">Report Management</CardTitle>
                      <CardDescription className="text-slate-600">
                        Create and manage PMO performance and assessment reports with full editing capabilities
                      </CardDescription>
                    </div>
                  </div>
                  {hasPermission('CREATE_REPORT') && (
                    <Button 
                      onClick={() => setShowReportForm(true)} 
                      size="sm" 
                      className="bg-slate-900 hover:bg-slate-800"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Report
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {showReportForm && (
                  <div className="mb-6 p-6 bg-slate-50 rounded-lg border border-slate-200">
                    <h4 className="font-medium mb-4 text-slate-900">
                      {editingReport ? 'Edit Report' : 'Create New Report'}
                    </h4>
                    <div className="space-y-4">
                      <Input
                        placeholder="Report title"
                        value={reportForm.title}
                        onChange={(e) => setReportForm(prev => ({ ...prev, title: e.target.value }))}
                        className="border-slate-300"
                      />
                      <Textarea
                        placeholder="Report description"
                        value={reportForm.description}
                        onChange={(e) => setReportForm(prev => ({ ...prev, description: e.target.value }))}
                        className="border-slate-300"
                        rows={3}
                      />
                      <div className="grid grid-cols-3 gap-4">
                        <Select 
                          value={reportForm.category} 
                          onValueChange={(value) => setReportForm(prev => ({ ...prev, category: value }))}
                        >
                          <SelectTrigger className="border-slate-300">
                            <SelectValue placeholder="Category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Performance">Performance</SelectItem>
                            <SelectItem value="Financial">Financial</SelectItem>
                            <SelectItem value="Assessment">Assessment</SelectItem>
                            <SelectItem value="Compliance">Compliance</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select 
                          value={reportForm.reportType} 
                          onValueChange={(value: 'monthly' | 'quarterly' | 'annual' | 'special') => 
                            setReportForm(prev => ({ ...prev, reportType: value }))}
                        >
                          <SelectTrigger className="border-slate-300">
                            <SelectValue placeholder="Report Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                            <SelectItem value="annual">Annual</SelectItem>
                            <SelectItem value="special">Special</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select 
                          value={reportForm.status} 
                          onValueChange={(value: 'draft' | 'published' | 'archived') => 
                            setReportForm(prev => ({ ...prev, status: value }))}
                        >
                          <SelectTrigger className="border-slate-300">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={editingReport ? handleUpdateReport : handleCreateReport} 
                          size="sm" 
                          className="bg-slate-900 hover:bg-slate-800"
                        >
                          {editingReport ? 'Update Report' : 'Create Report'}
                        </Button>
                        <Button 
                          onClick={() => {
                            setShowReportForm(false);
                            setEditingReport(null);
                            setReportForm({ 
                              title: '', 
                              description: '', 
                              category: 'Performance', 
                              reportType: 'monthly', 
                              status: 'draft' 
                            });
                          }} 
                          variant="outline" 
                          size="sm"
                          className="border-slate-300"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={report.id} className="p-5 border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <Badge variant="secondary" className="text-xs">
                              {report.category}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {report.reportType}
                            </Badge>
                            <Badge variant={report.status === 'published' ? 'default' : 'secondary'} className="text-xs">
                              {report.status}
                            </Badge>
                            <span className="text-xs text-slate-500">
                              {new Date(report.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <h4 className="font-medium text-slate-900 mb-2 text-base">{report.title}</h4>
                          <p className="text-sm text-slate-600 leading-relaxed">{report.description}</p>
                        </div>
                        <div className="flex gap-1 ml-4">
                          {hasPermission('UPDATE_REPORT') && (
                            <Button 
                              onClick={() => startEditReport(report)} 
                              variant="ghost" 
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {hasPermission('DELETE_REPORT') && (
                            <Button 
                              onClick={() => handleDeleteReport(report.id)} 
                              variant="ghost" 
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Audit Logs */}
            {hasPermission('VIEW_AUDIT') && (
              <Card className="shadow-sm border-slate-200">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-6 w-6 text-slate-700" />
                    <div>
                      <CardTitle className="text-xl font-semibold text-slate-900">System Audit Logs</CardTitle>
                      <CardDescription className="text-slate-600">
                        Comprehensive activity tracking and change management with full audit trail
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {auditLogs.length === 0 ? (
                      <div className="text-center py-12 text-slate-500">
                        <Calendar className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                        <p className="text-base">No audit logs available</p>
                        <p className="text-sm">System activities will appear here</p>
                      </div>
                    ) : (
                      auditLogs.slice(0, 10).map((log) => (
                        <div key={log.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 text-sm">
                          <div>
                            <span className="font-medium text-slate-900">{log.userRole}</span> 
                            <span className="text-slate-600"> {log.action}d </span>
                            <span className="font-medium text-slate-900">{log.resource}</span>
                            {log.details && <span className="text-slate-600"> - {log.details}</span>}
                          </div>
                          <span className="text-slate-500">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Enhanced Delete Confirmation Dialog */}
        <AlertDialog open={deleteConfirmation.show} onOpenChange={(open) => 
          setDeleteConfirmation(prev => ({ ...prev, show: open }))
        }>
          <AlertDialogContent className="border-slate-200">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-slate-900">Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-600">
                Are you sure you want to delete "{deleteConfirmation.title}"? 
                This action cannot be undone and will be logged for audit purposes.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-slate-300">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}