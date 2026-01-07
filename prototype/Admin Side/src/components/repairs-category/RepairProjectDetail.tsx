import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { 
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage
} from '../ui/breadcrumb';
import { 
  ArrowLeft, Calendar, DollarSign, MapPin, Building, Users, FileText, 
  Camera, Eye, BarChart3, User, Filter, Clock, CheckCircle2, TrendingUp,
  AlertCircle, Target, Activity, Award, Edit, Plus, Trash2, Save, X, Home,
  Wrench, Building2
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { ImageWithFallback } from '../figma/ImageWithFallback';

// Type imports
import { RepairProject } from './types/RepairTypes';
import { MEFilter } from '../construction-infrastructure/types/METypes';
import { 
  GalleryItem, DocumentItem, TeamMember,
  SectionAData, SectionBData, FinancialAllocation
} from '../construction-infrastructure/types/ProjectDetailTypes';

// Component imports - Using EXCLUSIVE Repair Category Tabs and Components
import { RepairGalleryTab } from './project-detail/tabs/RepairGalleryTab';
import { RepairDocumentsTab } from './project-detail/tabs/RepairDocumentsTab';
import { RepairTeamTab } from './project-detail/tabs/RepairTeamTab';
import { RepairDataAnalyticsTab } from './project-detail/tabs/RepairDataAnalyticsTab';
import { RepairIndividualPOWTab } from './project-detail/tabs/RepairIndividualPOWTab';
import { RepairTimelineTab } from './project-detail/tabs/RepairTimelineTab';
import { RepairOverviewTab } from './project-detail/tabs/RepairOverviewTab';
import { RepairGlobalMEFilter } from './project-detail/shared/RepairGlobalMEFilter';
import { RepairProgressOverviewContainer } from './project-detail/shared/RepairProgressOverviewContainer';

// Repair-specific CRUD Dialogs
import { 
  FinancialPerformanceDialog, 
  PhysicalPerformanceDialog, 
  ProjectHealthDialog,
  ProjectInformationDialog,
  AddFinancialReportDialog,
  AddPhaseDialog
} from './dialogs/RepairOverviewCRUDDialogs';

// Utility imports
import { formatCurrency, formatDate, getStatusColor } from '../construction-infrastructure/utils/analyticsHelpers';
import { 
  getFilteredGalleryItems, 
  getFilteredDocumentItems, 
  getFilteredTeamMembers,
  checkPermissions
} from '../construction-infrastructure/utils/projectDetailHelpers';

// Import Enhanced RBAC Service
import { enhancedRepairsRBACService } from './services/EnhancedRBACService';
import { RepairAssignedPersonnelManager } from './admin/RepairAssignedPersonnelManager';

// Enhanced RepairProjectDetail interface with RBAC support
interface RepairProjectDetailProps {
  project: RepairProject;
  onBack: () => void;
  onNavigate: (page: string) => void;
  userRole: string;
  requireAuth: (action: string) => boolean;
  onEdit?: (project: RepairProject) => void;
  onDelete?: (projectId: string) => void;
  userEmail?: string;
  userDepartment?: string;
}

// Mock data for Repair POW items
const getMockRepairPOWItems = () => [
  {
    idNo: "REP-POW-001",
    description: "Initial Site Assessment and Planning",
    qty: 1,
    unit: "lot",
    estimatedMaterialCost: 5000,
    estimatedLaborCost: 10000,
    estimatedProjectCost: 15000,
    unitCost: 15000,
    dateOfEntryOfRecord: "2024-01-15"
  },
  {
    idNo: "REP-POW-002", 
    description: "Electrical System Repair and Upgrade",
    qty: 3,
    unit: "units",
    estimatedMaterialCost: 45000,
    estimatedLaborCost: 30000,
    estimatedProjectCost: 75000,
    unitCost: 25000,
    dateOfEntryOfRecord: "2024-01-16"
  },
  {
    idNo: "REP-POW-003",
    description: "Plumbing System Installation and Repair", 
    qty: 2,
    unit: "systems",
    estimatedMaterialCost: 35000,
    estimatedLaborCost: 25000,
    estimatedProjectCost: 60000,
    unitCost: 30000,
    dateOfEntryOfRecord: "2024-01-17"
  },
  {
    idNo: "REP-POW-004",
    description: "HVAC System Maintenance and Repair",
    qty: 1,
    unit: "unit",
    estimatedMaterialCost: 85000,
    estimatedLaborCost: 65000,
    estimatedProjectCost: 150000,
    unitCost: 150000,
    dateOfEntryOfRecord: "2024-01-18"
  },
  {
    idNo: "REP-POW-005",
    description: "Flooring Replacement and Repair",
    qty: 150,
    unit: "sqm",
    estimatedMaterialCost: 120000,
    estimatedLaborCost: 80000,
    estimatedProjectCost: 200000,
    unitCost: 1333,
    dateOfEntryOfRecord: "2024-01-19"
  }
];

const getMockRepairGalleryItems = (): GalleryItem[] => [
  {
    id: 'rep-img-1',
    title: 'Before Repair - Initial Assessment',
    caption: 'Initial condition assessment',
    description: 'Documented condition before repair work began',
    url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600',
    filename: 'before-repair-001.jpg',
    category: 'before',
    uploadDate: '2024-01-15',
    uploadedAt: '2024-01-15',
    uploadedBy: 'Site Inspector',
    photographer: 'Site Inspector',
    containerId: 'before-photos',
    dateCaptured: '2024-01-15',
    meRelevant: true,
    tags: ['before', 'assessment', 'documentation'],
    location: 'Project Site',
    rating: 5
  },
  {
    id: 'rep-img-2',
    title: 'During Repair - Work in Progress',
    caption: 'Active repair work',
    description: 'Progress documentation during repair execution',
    url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=600',
    filename: 'during-repair-001.jpg',
    category: 'progress',
    uploadDate: '2024-01-20',
    uploadedAt: '2024-01-20',
    uploadedBy: 'Project Manager',
    photographer: 'Project Manager',
    containerId: 'progress-photos',
    dateCaptured: '2024-01-20',
    meRelevant: true,
    tags: ['progress', 'work-in-progress', 'documentation'],
    location: 'Project Site',
    rating: 5
  },
  {
    id: 'rep-img-3',
    title: 'After Repair - Completed Work',
    caption: 'Final completion status',
    description: 'Completed repair work ready for use',
    url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600',
    filename: 'after-repair-001.jpg',
    category: 'completed',
    uploadDate: '2024-01-25',
    uploadedAt: '2024-01-25',
    uploadedBy: 'Quality Inspector',
    photographer: 'Quality Inspector',
    containerId: 'completion-photos',
    dateCaptured: '2024-01-25',
    meRelevant: true,
    tags: ['completed', 'final', 'documentation'],
    location: 'Project Site',
    rating: 5
  }
];

const getMockRepairDocuments = (): DocumentItem[] => [
  {
    id: 'rep-doc-1',
    name: 'Repair Work Order',
    filename: 'work-order-001.pdf',
    type: 'work_order',
    fileType: 'work_order',
    category: 'official',
    documentCategory: 'official',
    size: '2.1 MB',
    fileSize: '2.1 MB',
    dateOfEntry: '2024-01-10',
    uploadedAt: '2024-01-10',
    dateUploaded: '2024-01-10',
    uploadedBy: 'Project Manager',
    relatedPeriod: 'Current',
    description: 'Official work order for repair project',
    remarks: 'Approved work order with specifications',
    url: '/documents/work-order-001.pdf',
    containerId: 'official-documents',
    meRelevant: true
  },
  {
    id: 'rep-doc-2',
    name: 'Budget Allocation Report',
    filename: 'budget-report-001.xlsx',
    type: 'report',
    fileType: 'report',
    category: 'financial',
    documentCategory: 'financial',
    size: '1.8 MB',
    fileSize: '1.8 MB',
    dateOfEntry: '2024-01-12',
    uploadedAt: '2024-01-12',
    dateUploaded: '2024-01-12',
    uploadedBy: 'Finance Officer',
    relatedPeriod: 'Current',
    description: 'Detailed budget allocation and expenditure report',
    remarks: 'Financial tracking and cost analysis',
    url: '/documents/budget-report-001.xlsx',
    containerId: 'financial-documents',
    meRelevant: true
  },
  {
    id: 'rep-doc-3',
    name: 'Quality Inspection Report',
    filename: 'inspection-report-001.pdf',
    type: 'inspection',
    fileType: 'inspection',
    category: 'quality',
    documentCategory: 'quality',
    size: '3.2 MB',
    fileSize: '3.2 MB',
    dateOfEntry: '2024-01-25',
    uploadedAt: '2024-01-25',
    dateUploaded: '2024-01-25',
    uploadedBy: 'Quality Inspector',
    relatedPeriod: 'Current',
    description: 'Final quality inspection and compliance report',
    remarks: 'Passed all quality standards and requirements',
    url: '/documents/inspection-report-001.pdf',
    containerId: 'quality-documents',
    meRelevant: true
  }
];

const getMockRepairTeamMembers = (): TeamMember[] => [
  {
    id: 'rep-team-1',
    name: 'Engr. Maria Santos',
    role: 'Project Manager',
    department: 'Facilities Management',
    email: 'maria.santos@csu.edu.ph',
    phone: '+63 912 345 6789',
    expertise: 'Project Management, Repair Supervision',
    assignedDate: '2024-01-10',
    status: 'active',
    avatar: '/avatars/maria-santos.jpg',
    responsibilities: ['Overall project coordination', 'Budget management', 'Timeline oversight'],
    workingHours: '8:00 AM - 5:00 PM',
    location: 'Main Campus',
    isActive: true
  },
  {
    id: 'rep-team-2',
    name: 'Juan Dela Cruz',
    role: 'Site Supervisor',
    department: 'Maintenance',
    email: 'juan.delacruz@csu.edu.ph',
    phone: '+63 912 345 6790',
    expertise: 'Site Supervision, Safety Management',
    assignedDate: '2024-01-12',
    status: 'active',
    avatar: '/avatars/juan-delacruz.jpg',
    responsibilities: ['On-site supervision', 'Safety compliance', 'Work quality control'],
    workingHours: '7:00 AM - 4:00 PM',
    location: 'Project Site',
    isActive: true
  },
  {
    id: 'rep-team-3',
    name: 'Ana Rodriguez',
    role: 'Quality Inspector',
    department: 'Quality Assurance',
    email: 'ana.rodriguez@csu.edu.ph',
    phone: '+63 912 345 6791',
    expertise: 'Quality Control, Standards Compliance',
    assignedDate: '2024-01-15',
    status: 'active',
    avatar: '/avatars/ana-rodriguez.jpg',
    responsibilities: ['Quality inspections', 'Compliance verification', 'Final approval'],
    workingHours: '8:00 AM - 5:00 PM',
    location: 'Main Campus',
    isActive: true
  }
];

/**
 * Repair Project Detail Page - Redesigned
 * 
 * Enhanced version mirroring Construction Infrastructure design with formal, minimal, and aesthetic design
 * Features:
 * 1. Overview Tab - Gallery, Progress Overview, Project Information, Financial/Physical Accomplishment
 * 2. Timeline Tab - Milestone timeline and repair schedule
 * 3. Individual POW Tab - Program of works detailed breakdown
 * 4. Data Analytics Tab - M&E Dashboard
 * 5. Gallery Tab - Photo gallery (before, during, after)
 * 6. Documents Tab - Document management
 * 7. Team Tab - Team member management
 */
export function RepairProjectDetail({ 
  project, 
  onBack, 
  onNavigate, 
  userRole, 
  requireAuth,
  onEdit,
  onDelete,
  userEmail = 'user@carsu.edu.ph',
  userDepartment = 'General'
}: RepairProjectDetailProps) {
  
  // ============================================
  // RBAC IMPLEMENTATION
  // ============================================
  
  // Get user permissions for this project
  const userPermissions = enhancedRepairsRBACService.getUserPermissions(
    userEmail,
    userRole,
    userDepartment,
    'repairs'
  );
  
  // Check if user can edit this specific project
  const canEditThisProject = userRole === 'Admin' || 
    enhancedRepairsRBACService.canEditProject(userEmail, userRole, project.id);
  
  // Check if user can delete this specific project
  const canDeleteThisProject = userRole === 'Admin' ||
    enhancedRepairsRBACService.canDeleteProject(userEmail, userRole, project.id);
  
  // Check if user can manage documents
  const canManageDocuments = userRole === 'Admin' || userPermissions.canManageDocuments;
  
  // Check if user can assign personnel
  const canAssignPersonnel = userRole === 'Admin' || userPermissions.canAssignStaff;
  
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('table');
  
  // Global M&E Filter State
  const [globalMEFilter, setGlobalMEFilter] = useState<MEFilter>({
    period: 'daily',
    dateRange: {
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    }
  });
  
  // Editable project state
  const [editableProject, setEditableProject] = useState(project);
  
  // Section A and B states - customized for repair projects
  const [sectionAData, setSectionAData] = useState<SectionAData>({
    projectDescription: project.description || '',
    idealInfrastructureImage: '',
    accomplishmentAsOf: project.status || '',
    dateEntry: project.createdAt || '',
    comments: project.notes || '',
    remarks: project.notes || ''
  });
  
  const [sectionBData, setSectionBData] = useState<SectionBData>({
    actualAccomplishmentAsOf: project.status || '',
    actualDateEntry: project.updatedAt || '',
    progressAccomplishmentPercent: project.status === 'Completed' ? 100 : project.status === 'In Progress' ? 75 : 30,
    projectStatusActual: project.status === 'Completed' ? 100 : project.status === 'In Progress' ? 75 : 30,
    projectStatusTarget: 100,
    dateStarted: project.startDate || '2024-01-15',
    targetDateCompletion: project.endDate || '2024-03-15',
    originalContractDuration: project.estimatedDuration?.toString() || '60',
    contractorName: project.contractor || 'Repair Services Inc.'
  });

  // Physical Performance Tracking
  const [physicalPerformance, setPhysicalPerformance] = useState({
    phasesDone: 1,
    totalPhases: 3,
    physicalStatus: 'On Track' as 'On Track' | 'Minor Delays' | 'Critical Delays'
  });
  
  // Form states
  const [formStates, setFormStates] = useState({
    isEditingOverview: false,
    isEditingSectionA: false,
    isEditingSectionB: false,
    isEditingFinancial: false,
    isProjectItemDialogOpen: false,
    isGalleryDialogOpen: false,
    isDocumentDialogOpen: false,
    isTeamDialogOpen: false,
    isFullScreenImageOpen: false
  });

  // Additional state for new dialogs
  const [isFinancialDialogOpen, setIsFinancialDialogOpen] = useState(false);
  const [isPhysicalDialogOpen, setIsPhysicalDialogOpen] = useState(false);
  const [isHealthDialogOpen, setIsHealthDialogOpen] = useState(false);
  const [isProjectInfoDialogOpen, setIsProjectInfoDialogOpen] = useState(false);
  const [isAddReportDialogOpen, setIsAddReportDialogOpen] = useState(false);
  const [isAddPhaseDialogOpen, setIsAddPhaseDialogOpen] = useState(false);

  // Health metrics state
  const [healthMetrics, setHealthMetrics] = useState({
    budgetHealth: { value: '60%', status: 'On Track' },
    physicalHealth: { value: '75%', status: 'On Track' },
    scheduleHealth: { value: 'Active', status: 'Normal' },
    qualityHealth: { value: 'Good', status: 'Standards Met' },
    targetCompletion: project.endDate || '2024-03-15',
    daysRemaining: 45
  });

  // Financial reports and phases state
  const [financialReports, setFinancialReports] = useState<any[]>([]);
  const [projectPhases, setProjectPhases] = useState<any[]>([]);
  
  // Data states
  const [projectItems, setProjectItems] = useState<any[]>([]);
  const [financialAllocation, setFinancialAllocation] = useState<FinancialAllocation>({
    totalBudget: project.budget || 750000,
    physicalAccomplishmentValue: project.spent || 450000,
    physicalAccomplishmentPercent: project.budget > 0 ? ((project.spent || 450000) / (project.budget || 750000)) * 100 : 60,
    budgetUtilization: project.budget > 0 ? ((project.spent || 450000) / (project.budget || 750000)) * 100 : 60,
    totalEstimatedCost: project.budget || 750000,
    remainingBudget: (project.budget || 750000) - (project.spent || 450000),
    costVariance: 0
  });
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [documentItems, setDocumentItems] = useState<DocumentItem[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  
  // POW Items state
  const [powItems, setPowItems] = useState<any[]>([]);

  // Accomplishment records state
  const [accomplishmentRecords, setAccomplishmentRecords] = useState<any[]>([
    {
      id: '1',
      dateEntry: '2024-01-15',
      comments: 'Initial assessment completed. Identified critical repair areas.',
      remarksComments: 'Repair work planned according to priority levels.'
    },
    {
      id: '2', 
      dateEntry: '2024-02-10',
      comments: 'Primary repairs underway. Electrical system work in progress.',
      remarksComments: 'Work progressing as scheduled.'
    }
  ]);

  const [actualAccomplishmentRecords, setActualAccomplishmentRecords] = useState<any[]>([
    {
      id: '1',
      dateEntry: '2024-01-15',
      progressAccomplishment: 15,
      actualPercent: 15,
      targetPercent: 12
    },
    {
      id: '2',
      dateEntry: '2024-02-10', 
      progressAccomplishment: 60,
      actualPercent: 60,
      targetPercent: 50
    }
  ]);

  const [progressSummaryRecords, setProgressSummaryRecords] = useState<any[]>([
    {
      id: '1',
      period: 'Week 1-2',
      physicalProgress: 15,
      financialProgress: 18,
      issues: 'Minor material delivery delays',
      recommendations: 'Coordinate with suppliers'
    },
    {
      id: '2',
      period: 'Week 3-4',
      physicalProgress: 60,
      financialProgress: 58,
      issues: 'None',
      recommendations: 'Continue current pace'
    }
  ]);

  // Project objectives and key features state
  const [projectObjectives, setProjectObjectives] = useState<string[]>([
    'Restore full functionality of all building systems',
    'Ensure compliance with safety and quality standards',
    'Minimize disruption to ongoing university operations',
    'Implement energy-efficient and sustainable repair solutions',
    'Extend the lifespan of existing infrastructure'
  ]);

  const [projectKeyFeatures, setProjectKeyFeatures] = useState<string[]>([
    'Comprehensive electrical system upgrade and repair',
    'Plumbing system modernization with water-efficient fixtures',
    'HVAC system maintenance and optimization',
    'Structural integrity assessment and reinforcement',
    'Interior finishing restoration and improvement',
    'Safety system installation and upgrades',
    'Energy-efficient lighting and climate control',
    'Accessibility improvements and compliance updates'
  ]);

  const [projectBeneficiaries, setProjectBeneficiaries] = useState<string>('All building occupants and university community');

  // Selected items and form data
  const [selectedItems, setSelectedItems] = useState({
    projectItem: null,
    image: null,
    teamMember: null
  });

  // Permissions - Updated to use RBAC Service
  // Staff can only edit projects they are assigned to
  const canEdit = canEditThisProject;
  const canAdd = userPermissions.canAdd;
  const canDelete = canDeleteThisProject;

  // Initialize data
  useEffect(() => {
    loadProjectData();
  }, [project.id]);

  const loadProjectData = () => {
    try {
      setProjectItems(getMockRepairPOWItems());
      setGalleryItems(getMockRepairGalleryItems());
      setDocumentItems(getMockRepairDocuments());
      setTeamMembers(getMockRepairTeamMembers());
      setPowItems(getMockRepairPOWItems());
    } catch (error) {
      console.error('Error loading repair project data:', error);
      toast.error('Failed to load project data');
    }
  };

  // Global filter handlers
  const handleGlobalFilterChange = (filter: MEFilter) => {
    setGlobalMEFilter(filter);
    toast.success(`Filter updated: ${filter.period} view`);
  };

  const handleClearGlobalFilter = () => {
    setGlobalMEFilter({
      period: 'daily',
      dateRange: {
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      }
    });
    toast.success('Global filter cleared');
  };

  const handleExportData = (format: 'csv' | 'excel' | 'pdf') => {
    toast.success(`Exporting data as ${format.toUpperCase()}`);
  };

  // CRUD Handlers
  const handleFinancialUpdate = (data: any) => {
    try {
      const newBudgetUtilization = data.totalBudget > 0 
        ? (data.actualSpent / data.totalBudget) * 100 
        : 0;
      
      const updatedAllocation = {
        ...financialAllocation,
        totalBudget: data.totalBudget,
        physicalAccomplishmentValue: data.actualSpent,
        physicalAccomplishmentPercent: newBudgetUtilization,
        budgetUtilization: newBudgetUtilization,
        totalEstimatedCost: data.totalBudget,
        remainingBudget: data.totalBudget - data.actualSpent,
        costVariance: data.totalBudget - data.actualSpent
      };
      
      setFinancialAllocation(updatedAllocation);
    } catch (error) {
      console.error('Error updating financial data:', error);
      toast.error('Failed to update financial performance');
    }
  };

  const handlePhysicalUpdate = (data: any) => {
    try {
      const updatedSectionB = {
        ...sectionBData,
        projectStatusTarget: data.targetProgress,
        projectStatusActual: data.actualProgress,
        progressAccomplishmentPercent: data.actualProgress
      };
      
      const updatedPerformance = {
        phasesDone: data.phasesDone || 1,
        totalPhases: data.totalPhases || 3,
        physicalStatus: data.status || 'On Track'
      };
      
      setSectionBData(updatedSectionB);
      setPhysicalPerformance(updatedPerformance);
    } catch (error) {
      console.error('Error updating physical data:', error);
      toast.error('Failed to update physical performance');
    }
  };

  const handleHealthUpdate = (data: any) => {
    try {
      setHealthMetrics(data);
    } catch (error) {
      console.error('Error updating health metrics:', error);
      toast.error('Failed to update project health metrics');
    }
  };

  const handleProjectInfoUpdate = (data: any) => {
    setEditableProject(prev => ({
      ...prev,
      title: data.projectName,
      location: data.location,
      repairType: data.repairType,
      contractor: data.contractor,
      status: data.projectStatus,
      description: data.description,
      budget: data.totalBudget
    }));
    
    setSectionAData(prev => ({
      ...prev,
      projectDescription: data.description
    }));
    
    setSectionBData(prev => ({
      ...prev,
      contractorName: data.contractor,
      originalContractDuration: data.contractDuration,
      dateStarted: data.startDate,
      targetDateCompletion: data.targetEndDate
    }));
    
    if (data.totalBudget) {
      setFinancialAllocation(prev => ({
        ...prev,
        totalBudget: data.totalBudget,
        totalEstimatedCost: data.totalBudget,
        remainingBudget: data.totalBudget - prev.physicalAccomplishmentValue
      }));
    }
    
    if (data.objectives) {
      setProjectObjectives(data.objectives);
    }
    
    if (data.keyFeatures) {
      setProjectKeyFeatures(data.keyFeatures);
    }
    
    if (data.beneficiaries) {
      setProjectBeneficiaries(data.beneficiaries);
    }
    
    toast.success('Project information updated successfully');
  };

  const handleAddFinancialReport = (data: any) => {
    const newReport = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date().toISOString()
    };
    setFinancialReports(prev => [newReport, ...prev]);
  };

  const handleAddPhase = (data: any) => {
    const newPhase = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date().toISOString()
    };
    setProjectPhases(prev => [newPhase, ...prev]);
  };

  // Section A and B handlers
  const handleSectionAEdit = () => {
    setFormStates(prev => ({ ...prev, isEditingSectionA: true }));
  };

  const handleSectionASave = () => {
    setFormStates(prev => ({ ...prev, isEditingSectionA: false }));
    toast.success('Section A saved successfully');
  };

  const handleSectionACancel = () => {
    setFormStates(prev => ({ ...prev, isEditingSectionA: false }));
  };

  const handleSectionBEdit = () => {
    setFormStates(prev => ({ ...prev, isEditingSectionB: true }));
  };

  const handleSectionBSave = () => {
    setFormStates(prev => ({ ...prev, isEditingSectionB: false }));
    toast.success('Section B saved successfully');
  };

  const handleSectionBCancel = () => {
    setFormStates(prev => ({ ...prev, isEditingSectionB: false }));
  };

  // Get filtered data
  const filteredProjectItems = useMemo(() => {
    try {
      if (!Array.isArray(projectItems)) return [];
      if (!globalMEFilter) return projectItems;
      
      return projectItems.filter(item => {
        try {
          if (!item.dateOfEntryOfRecord) return false;
          
          const itemDate = new Date(item.dateOfEntryOfRecord);
          const startDate = new Date(globalMEFilter.dateRange.startDate);
          const endDate = new Date(globalMEFilter.dateRange.endDate);
          
          return itemDate >= startDate && itemDate <= endDate;
        } catch (error) {
          return false;
        }
      });
    } catch (error) {
      console.error('Error filtering project items:', error);
      return [];
    }
  }, [projectItems, globalMEFilter]);

  const filteredGalleryItems = getFilteredGalleryItems(galleryItems, globalMEFilter);
  const filteredDocumentItems = getFilteredDocumentItems(documentItems, globalMEFilter);
  const filteredTeamMembers = getFilteredTeamMembers(teamMembers, globalMEFilter);

  // Calculate metrics
  const targetBudget = financialAllocation.totalBudget;
  const actualSpent = financialAllocation.physicalAccomplishmentValue;
  const budgetVariance = targetBudget - actualSpent;
  const budgetVariancePercent = ((budgetVariance / targetBudget) * 100);
  
  const targetProgress = sectionBData.projectStatusTarget || 100;
  const actualProgress = sectionBData.projectStatusActual || sectionBData.progressAccomplishmentPercent || 0;
  const progressVariance = actualProgress - (targetProgress * (actualProgress / 100));

  // Dynamic hero section stats
  const heroStats = useMemo(() => {
    const utilizationPercent = targetBudget > 0 ? ((actualSpent / targetBudget) * 100) : 0;
    const activeTeam = teamMembers.filter(m => m.isActive !== false).length;
    
    return {
      budget: {
        label: 'Total Budget',
        value: formatCurrency(targetBudget),
        icon: DollarSign,
        color: 'emerald',
        badge: 'Budget',
        subText: `${utilizationPercent.toFixed(1)}% utilized`
      },
      progress: {
        label: 'Repair Progress',
        value: `${actualProgress.toFixed(1)}%`,
        icon: TrendingUp,
        color: 'blue',
        badge: 'Progress',
        subText: actualProgress >= targetProgress ? 'On Track' : 'Behind Schedule'
      },
      team: {
        label: 'Team Members',
        value: `${teamMembers.length} Members`,
        icon: Users,
        color: 'amber',
        badge: 'Team',
        subText: `${activeTeam} Active`
      },
      documents: {
        label: 'Project Documents',
        value: `${documentItems.length} Files`,
        icon: FileText,
        color: 'purple',
        badge: 'Files',
        subText: `${galleryItems.length} Photos`
      }
    };
  }, [targetBudget, actualSpent, actualProgress, targetProgress, teamMembers, documentItems, galleryItems]);

  // Determine category name for breadcrumb
  const getCategoryName = () => {
    const category = project.category || '';
    if (category.toLowerCase().includes('classroom')) return 'Classrooms';
    if (category.toLowerCase().includes('administrative')) return 'Administrative Offices';
    if (category.toLowerCase().includes('main')) return 'Main Campus';
    if (category.toLowerCase().includes('cabadbaran')) return 'Cabadbaran Campus';
    return 'Repairs Overview';
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Hero Section - Formal, Minimal & Intuitive Design */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-6 py-5">
          {/* Breadcrumb Navigation - Streamlined */}
          <div className="mb-4">
            <Breadcrumb>
              <BreadcrumbList className="text-xs">
                <BreadcrumbItem>
                  <BreadcrumbLink
                    onClick={() => onNavigate('dashboard')}
                    className="flex items-center gap-1 text-gray-500 hover:text-emerald-700 cursor-pointer transition-colors"
                  >
                    <Home className="w-3 h-3" />
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-gray-300" />
                <BreadcrumbItem>
                  <BreadcrumbLink
                    onClick={() => onNavigate('repairs')}
                    className="text-gray-500 hover:text-emerald-700 cursor-pointer transition-colors"
                  >
                    Repairs Category
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-gray-300" />
                <BreadcrumbItem>
                  <BreadcrumbLink
                    onClick={onBack}
                    className="text-gray-500 hover:text-emerald-700 cursor-pointer transition-colors"
                  >
                    {getCategoryName()}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-gray-300" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-gray-800 max-w-md truncate">
                    {editableProject.title || project.title}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Project Title & Metadata - Formal Design */}
          <div className="mb-5">
            <h1 className="text-xl text-gray-900 mb-2.5 leading-tight">
              {editableProject.title || project.title}
            </h1>
            
            {/* Metadata Row - Clean & Minimal */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-gray-600">
              <div className="flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-emerald-600" />
                <span>{project.repairType || 'General Repair'}</span>
              </div>
              <span className="text-gray-300">•</span>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>{editableProject.location || project.location || 'Main Campus'}</span>
              </div>
              <span className="text-gray-300">•</span>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>Started: {formatDate(project.startDate || '2024-01-15')}</span>
              </div>
              <Badge className={`${getStatusColor(editableProject.status || project.status)} text-xs px-2 py-0.5`}>
                {editableProject.status || project.status}
              </Badge>
            </div>
          </div>

          {/* Key Metrics - Formal & Minimal Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {Object.entries(heroStats).map(([key, stat]) => {
              const IconComponent = stat.icon;
              const colorConfig = {
                emerald: {
                  iconBg: 'bg-emerald-50',
                  iconColor: 'text-emerald-600',
                  border: 'border-gray-200 hover:border-emerald-300'
                },
                blue: {
                  iconBg: 'bg-blue-50',
                  iconColor: 'text-blue-600',
                  border: 'border-gray-200 hover:border-blue-300'
                },
                amber: {
                  iconBg: 'bg-amber-50',
                  iconColor: 'text-amber-600',
                  border: 'border-gray-200 hover:border-amber-300'
                },
                purple: {
                  iconBg: 'bg-purple-50',
                  iconColor: 'text-purple-600',
                  border: 'border-gray-200 hover:border-purple-300'
                }
              };
              
              const config = colorConfig[stat.color as keyof typeof colorConfig];
              
              return (
                <div 
                  key={key}
                  className={`bg-white border ${config.border} rounded-lg p-3.5 transition-all duration-200 cursor-default`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`${config.iconBg} ${config.iconColor} p-2 rounded-lg shrink-0`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-600 mb-0.5">{stat.label}</p>
                      <p className="text-gray-900 truncate">{stat.value}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{stat.subText}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        {/* Global M&E Filter - Placed before tabs */}
        <div className="mb-6">
          <RepairGlobalMEFilter
            projectId={project.id}
            currentFilter={globalMEFilter}
            onFilterChange={handleGlobalFilterChange}
            onClearFilter={handleClearGlobalFilter}
            onExport={handleExportData}
          />
        </div>

        {/* Tab Navigation - Minimal & Clean */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7 bg-white border border-gray-200 p-1 mb-6 shadow-sm">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              <Eye className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="timeline"
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              <Clock className="w-4 h-4 mr-2" />
              Timeline
            </TabsTrigger>
            <TabsTrigger 
              value="individual-pow" 
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Individual POW
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              <Activity className="w-4 h-4 mr-2" />
              Data Analytics
            </TabsTrigger>
            <TabsTrigger 
              value="gallery" 
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              <Camera className="w-4 h-4 mr-2" />
              Gallery
            </TabsTrigger>
            <TabsTrigger 
              value="documents" 
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              <FileText className="w-4 h-4 mr-2" />
              Documents
            </TabsTrigger>
            <TabsTrigger 
              value="team" 
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              <Users className="w-4 h-4 mr-2" />
              Team
            </TabsTrigger>
          </TabsList>

          {/* ====================
              OVERVIEW TAB - REPAIR-SPECIFIC
              ==================== */}
          <TabsContent value="overview" className="space-y-6 mt-0">
            <RepairOverviewTab
              project={project}
              editableProject={editableProject}
              sectionAData={sectionAData}
              sectionBData={sectionBData}
              financialAllocation={financialAllocation}
              physicalPerformance={physicalPerformance}
              healthMetrics={healthMetrics}
              projectObjectives={projectObjectives}
              projectKeyFeatures={projectKeyFeatures}
              projectBeneficiaries={projectBeneficiaries}
              galleryItems={galleryItems}
              targetBudget={targetBudget}
              actualSpent={actualSpent}
              budgetVariance={budgetVariance}
              budgetVariancePercent={budgetVariancePercent}
              actualProgress={actualProgress}
              targetProgress={targetProgress}
              canEdit={canEdit}
              canAdd={canAdd}
              setActiveTab={setActiveTab}
              setIsFinancialDialogOpen={setIsFinancialDialogOpen}
              setIsPhysicalDialogOpen={setIsPhysicalDialogOpen}
              setIsHealthDialogOpen={setIsHealthDialogOpen}
              setIsProjectInfoDialogOpen={setIsProjectInfoDialogOpen}
              setIsAddReportDialogOpen={setIsAddReportDialogOpen}
              setIsAddPhaseDialogOpen={setIsAddPhaseDialogOpen}
            />
          </TabsContent>

          {/* ====================
              TIMELINE TAB
              ==================== */}
          <TabsContent value="timeline" className="space-y-6 mt-0">
            <RepairTimelineTab
              projectId={project.id}
              canAdd={canAdd}
              canEdit={canEdit}
              canDelete={canDelete}
            />
          </TabsContent>

          {/* ====================
              INDIVIDUAL POW TAB
              ==================== */}
          <TabsContent value="individual-pow" className="space-y-6 mt-0">
            <RepairIndividualPOWTab
              projectItems={filteredProjectItems}
              globalMEFilter={globalMEFilter}
              canAdd={canAdd}
              canEdit={canEdit}
              canDelete={canDelete}
              onPOWUpdate={(items) => setPowItems(items)}
            />
          </TabsContent>

          {/* ====================
              DATA ANALYTICS TAB
              ==================== */}
          <TabsContent value="analytics" className="space-y-6 mt-0">
            <RepairDataAnalyticsTab
              projectId={project.id}
              globalMEFilter={globalMEFilter}
              projectItems={filteredProjectItems}
              canAdd={canAdd}
              canEdit={canEdit}
            />
          </TabsContent>

          {/* ====================
              GALLERY TAB
              ==================== */}
          <TabsContent value="gallery" className="space-y-6 mt-0">
            <RepairGalleryTab
              galleryItems={filteredGalleryItems}
              canAdd={canAdd}
              canEdit={canEdit}
              canDelete={canDelete}
              onGalleryUpdate={(items) => setGalleryItems(items)}
            />
          </TabsContent>

          {/* ====================
              DOCUMENTS TAB
              ==================== */}
          <TabsContent value="documents" className="space-y-6 mt-0">
            <RepairDocumentsTab
              documentItems={filteredDocumentItems}
              canAdd={canAdd}
              canEdit={canEdit}
              canDelete={canDelete}
              onDocumentUpdate={(items) => setDocumentItems(items)}
            />
          </TabsContent>

          {/* ====================
              TEAM TAB - With RBAC Integration
              ==================== */}
          <TabsContent value="team" className="space-y-6 mt-0">
            <RepairTeamTab
              projectId={project.id}
              projectTitle={project.title}
              teamMembers={filteredTeamMembers}
              filteredTeamMembers={filteredTeamMembers}
              globalMEFilter={globalMEFilter}
              onFilterChange={handleGlobalFilterChange}
              onClearFilter={handleClearGlobalFilter}
              canAdd={canAdd}
              canEdit={canEdit}
              canDelete={canDelete}
              currentUserEmail={userEmail}
              currentUserRole={userRole}
              onAddTeamMember={(memberData) => {
                console.log('Adding team member:', memberData);
                toast.success('Team member added successfully');
              }}
              onEditTeamMember={(member) => {
                console.log('Editing team member:', member);
                toast.success('Team member updated successfully');
              }}
              onDeleteTeamMember={(id) => {
                console.log('Deleting team member:', id);
                toast.success('Team member removed successfully');
              }}
              onTeamUpdate={(members) => setTeamMembers(members)}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* CRUD Dialogs */}
      <FinancialPerformanceDialog
        open={isFinancialDialogOpen}
        onOpenChange={setIsFinancialDialogOpen}
        currentData={financialAllocation}
        onSubmit={handleFinancialUpdate}
      />

      <PhysicalPerformanceDialog
        open={isPhysicalDialogOpen}
        onOpenChange={setIsPhysicalDialogOpen}
        currentData={{
          targetProgress: sectionBData.projectStatusTarget,
          actualProgress: sectionBData.projectStatusActual,
          phasesDone: physicalPerformance.phasesDone,
          totalPhases: physicalPerformance.totalPhases,
          status: physicalPerformance.physicalStatus
        }}
        onSubmit={handlePhysicalUpdate}
      />

      <ProjectHealthDialog
        open={isHealthDialogOpen}
        onOpenChange={setIsHealthDialogOpen}
        currentData={healthMetrics}
        onSubmit={handleHealthUpdate}
      />

      <ProjectInformationDialog
        open={isProjectInfoDialogOpen}
        onOpenChange={setIsProjectInfoDialogOpen}
        currentData={{
          projectName: editableProject.title || '',
          location: editableProject.location || '',
          repairType: editableProject.repairType || '',
          contractor: sectionBData.contractorName || '',
          projectStatus: editableProject.status || '',
          description: sectionAData.projectDescription || '',
          totalBudget: financialAllocation.totalBudget,
          contractDuration: sectionBData.originalContractDuration || '',
          startDate: sectionBData.dateStarted || '',
          targetEndDate: sectionBData.targetDateCompletion || '',
          objectives: projectObjectives,
          keyFeatures: projectKeyFeatures,
          beneficiaries: projectBeneficiaries
        }}
        onSubmit={handleProjectInfoUpdate}
      />

      <AddFinancialReportDialog
        open={isAddReportDialogOpen}
        onOpenChange={setIsAddReportDialogOpen}
        onSubmit={handleAddFinancialReport}
      />

      <AddPhaseDialog
        open={isAddPhaseDialogOpen}
        onOpenChange={setIsAddPhaseDialogOpen}
        onSubmit={handleAddPhase}
      />
    </div>
  );
}