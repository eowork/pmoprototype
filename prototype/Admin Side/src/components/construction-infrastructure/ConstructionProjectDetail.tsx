import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
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
  AlertCircle, Target, Activity, Award, Edit, Plus, Trash2, Save, X, Home
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { ImageWithFallback } from '../figma/ImageWithFallback';

// Type imports
import { ConstructionProjectDetailProps } from './types';
import { MEFilter } from './types/METypes';
import { 
  ProjectItem, GalleryItem, DocumentItem, TeamMember, 
  SectionAData, SectionBData, FinancialAllocation,
  FormStates, DialogFormData, SelectedItems
} from './types/ProjectDetailTypes';

// Component imports
import { MEDashboard } from './project-detail/DataAnalytics/MEDashboard';
import { GlobalMEFilter } from './project-detail/shared/GlobalMEFilter';
import { ProgressOverviewContainer } from './project-detail/shared/ProgressOverviewContainer';
import { OverviewTab } from './project-detail/tabs/OverviewTab';
import { GalleryTab } from './project-detail/tabs/GalleryTab';
import { DocumentsTab } from './project-detail/tabs/DocumentsTab';
import { TeamTab } from './project-detail/tabs/TeamTab';
import { IndividualPOWTabEnhanced } from './project-detail/tabs/IndividualPOWTabEnhanced';
import { TimelineTabEnhanced } from './project-detail/tabs/TimelineTabEnhanced';
import { DataAnalyticsTab } from './project-detail/tabs/DataAnalyticsTab';
import { 
  FinancialPerformanceDialog, 
  PhysicalPerformanceDialog, 
  ProjectHealthDialog,
  ProjectInformationDialog,
  AddFinancialReportDialog,
  AddPhaseDialog
} from './dialogs/OverviewCRUDDialogs';
import { 
  AddMilestoneDialog, 
  EditMilestoneDialog,
  TimelineMilestone 
} from './dialogs/TimelineDialogs';

// Hook and utility imports
import { useMEData } from './hooks/useMEData';
import { formatCurrency, formatDate, getStatusColor } from './utils/analyticsHelpers';
import { 
  getFilteredProjectItems, getFilteredGalleryItems, 
  getFilteredDocumentItems, getFilteredTeamMembers,
  checkPermissions, getDefaultFormData
} from './utils/projectDetailHelpers';

// Data imports
import { 
  getMockProjectItems, getMockGalleryItems, 
  getMockDocumentItems, getMockTeamMembers 
} from './data/projectDetailMockData';

// Import new project list data with error handling
import { ProjectListItem } from './utils/projectListAggregation';

// Safely import JSON data with fallback
let mockProjectListData: ProjectListItem[] = [];
try {
  const importedData = require('./data/mock_project_list.json');
  if (Array.isArray(importedData)) {
    mockProjectListData = importedData as ProjectListItem[];
  } else if (importedData.default && Array.isArray(importedData.default)) {
    mockProjectListData = importedData.default as ProjectListItem[];
  }
} catch (error) {
  mockProjectListData = [];
}

// Create fallback data if import failed
if (mockProjectListData.length === 0) {
  mockProjectListData = [
    {
      idNo: "GAA-2024-001",
      description: "Construction of New Academic Building - Phase 1",
      unit: "lot",
      estimatedMaterialCost: 2500000,
      estimatedLaborCost: 1800000,
      estimatedProjectCost: 4300000,
      unitCost: 4300000,
      dateOfEntryOfRecord: "2024-01-15"
    }
  ];
}

/**
 * Construction Project Detail Page - Redesigned
 * 
 * Enhanced version with formal, minimal, and aesthetic design
 * Features:
 * 1. Overview Tab - Gallery, Progress Overview, Project Information, Financial/Physical Accomplishment
 * 2. Timeline Tab - NEW: Milestone timeline and project schedule
 * 3. Individual POW Tab - Program of works detailed breakdown
 * 4. Data Analytics Tab - M&E Dashboard
 * 5. Gallery Tab - Photo gallery
 * 6. Documents Tab - Document management
 */
export function ConstructionProjectDetail({ project, onBack, onNavigate, userRole, requireAuth }: ConstructionProjectDetailProps) {
  
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
  
  // M&E Data Hook
  const { aggregatedData } = useMEData(project.id, globalMEFilter);
  
  // Editable project state
  const [editableProject, setEditableProject] = useState(project);
  
  // Section A and B states
  const [sectionAData, setSectionAData] = useState<SectionAData>({
    projectDescription: project.projectDescription || project.description || '',
    idealInfrastructureImage: '',
    accomplishmentAsOf: project.accomplishmentAsOf || '',
    dateEntry: project.dateEntry || '',
    comments: project.comments || '',
    remarks: project.remarks || ''
  });
  
  const [sectionBData, setSectionBData] = useState<SectionBData>({
    actualAccomplishmentAsOf: project.actualAccomplishmentAsOf || '',
    actualDateEntry: project.actualDateEntry || '',
    progressAccomplishmentPercent: project.progressAccomplishment || 0,
    projectStatusActual: project.actualProgress || 0,
    projectStatusTarget: project.targetProgress || 100,
    dateStarted: project.dateStarted || '',
    targetDateCompletion: project.targetDateCompletion || '',
    originalContractDuration: project.originalContractDuration || '',
    contractorName: project.contractorName || project.contractor || ''
  });

  // Physical Performance Tracking - Phases and Status
  const [physicalPerformance, setPhysicalPerformance] = useState({
    phasesDone: 1,
    totalPhases: 3,
    physicalStatus: 'Minor Delays' as 'On Track' | 'Minor Delays' | 'Critical Delays'
  });
  
  // Form states
  const [formStates, setFormStates] = useState<FormStates>({
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
    budgetHealth: { value: '56%', status: 'Review Required' },
    physicalHealth: { value: '69%', status: 'Minor Delays' },
    scheduleHealth: { value: 'Active', status: 'Normal' },
    qualityHealth: { value: 'Excellent', status: 'Standards Met' },
    targetCompletion: '2025-12-31',
    daysRemaining: 75
  });

  // Financial reports and phases state
  const [financialReports, setFinancialReports] = useState<any[]>([]);
  const [projectPhases, setProjectPhases] = useState<any[]>([]);
  
  // Data states
  const [projectItems, setProjectItems] = useState<ProjectListItem[]>([]);
  const [financialAllocation, setFinancialAllocation] = useState<FinancialAllocation>({
    totalBudget: project.approvedBudget || 178112318.02,
    physicalAccomplishmentValue: project.disbursement || 100212015,
    physicalAccomplishmentPercent: project.progressAccomplishment || 56.3,
    budgetUtilization: 76.0,
    totalEstimatedCost: project.totalProjectCost || 178112318.02,
    remainingBudget: (project.approvedBudget || 178112318.02) - (project.disbursement || 100212015),
    costVariance: 14000000
  });
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [documentItems, setDocumentItems] = useState<DocumentItem[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  
  // POW Items state for syncing between IndividualPOW and DataAnalytics tabs
  const [powItems, setPowItems] = useState<any[]>([]);

  // Accomplishment records state - for persistent CRUD operations in Overview tab
  const [accomplishmentRecords, setAccomplishmentRecords] = useState<any[]>([
    {
      id: '1',
      dateEntry: '2024-01-15',
      comments: 'Initial site preparation completed. Cleared vegetation and performed soil testing.',
      remarksComments: 'Soil conditions favorable for construction. No major obstacles encountered.'
    },
    {
      id: '2', 
      dateEntry: '2024-02-10',
      comments: 'Foundation excavation and concrete pouring for main structure.',
      remarksComments: 'Weather conditions were optimal for concrete curing.'
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
      progressAccomplishment: 35,
      actualPercent: 35,
      targetPercent: 30
    }
  ]);

  const [progressSummaryRecords, setProgressSummaryRecords] = useState<any[]>([
    {
      id: '1',
      period: 'Q1 2024',
      physicalProgress: 25,
      financialProgress: 28,
      issues: 'Minor delays due to material delivery',
      recommendations: 'Improve supply chain coordination'
    },
    {
      id: '2',
      period: 'Q2 2024',
      physicalProgress: 58,
      financialProgress: 62,
      issues: 'Weather-related construction delays',
      recommendations: 'Implement weather contingency plans'
    }
  ]);

  // Project objectives and key features state
  const [projectObjectives, setProjectObjectives] = useState<string[]>([
    'Provide a modern, multi-purpose venue for sports competitions, cultural events, and ceremonies',
    'Accommodate 3,000+ spectators with comfortable seating and excellent sightlines',
    'Create flexible performance spaces for cultural shows, concerts, and theatrical productions',
    'Establish a landmark facility that represents CSU excellence and community pride',
    'Support student development through enhanced athletic and cultural programs'
  ]);

  const [projectKeyFeatures, setProjectKeyFeatures] = useState<string[]>([
    'Main competition hall with NBA-standard basketball court and multi-sport capability',
    'Professional cultural performance stage with advanced lighting and audio systems',
    'Universal accessibility with ramps, elevators, and designated seating areas',
    'Administrative offices and meeting rooms for sports programs',
    'Retractable spectator seating system accommodating 3,000+ attendees',
    'High-efficiency HVAC system with zone control for comfort and energy savings',
    'Modern locker rooms and athlete facilities with premium amenities',
    'Outdoor plaza and landscaped areas for community gatherings'
  ]);

  const [projectBeneficiaries, setProjectBeneficiaries] = useState<string>('5,000+ students and staff');

  // Selected items and form data
  const [selectedItems, setSelectedItems] = useState<SelectedItems>({
    projectItem: null,
    image: null,
    teamMember: null
  });
  const [formData, setFormData] = useState<DialogFormData>(getDefaultFormData());

  // Permissions
  const canEdit = checkPermissions(userRole, 'edit');
  const canAdd = checkPermissions(userRole, 'add');
  const canDelete = checkPermissions(userRole, 'delete');

  // Initialize data
  useEffect(() => {
    loadProjectData();
  }, [project.id]);

  const loadProjectData = () => {
    try {
      if (Array.isArray(mockProjectListData) && mockProjectListData.length > 0) {
        setProjectItems(mockProjectListData);
      } else {
        setProjectItems([]);
      }
      
      setGalleryItems(getMockGalleryItems());
      setDocumentItems(getMockDocumentItems());
      setTeamMembers(getMockTeamMembers());
    } catch (error) {
      console.error('Error loading project data:', error);
      setProjectItems([]);
      toast.error('Failed to load project data. Using fallback.');
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
      
      // Log for debugging
      console.log('Financial allocation updated:', {
        previous: financialAllocation,
        updated: updatedAllocation
      });
      
      // Note: Toast is shown in the dialog
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
      
      // Log for debugging
      console.log('Physical performance updated:', {
        sectionBData: updatedSectionB,
        physicalPerformance: updatedPerformance
      });
      
      // Note: Toast is shown in the dialog
    } catch (error) {
      console.error('Error updating physical data:', error);
      toast.error('Failed to update physical performance');
    }
  };

  const handleHealthUpdate = (data: any) => {
    try {
      setHealthMetrics(data);
      
      // Log for debugging
      console.log('Health metrics updated:', {
        previous: healthMetrics,
        updated: data
      });
      
      // Note: Toast is shown in the dialog
    } catch (error) {
      console.error('Error updating health metrics:', error);
      toast.error('Failed to update project health metrics');
    }
  };

  const handleProjectInfoUpdate = (data: any) => {
    setEditableProject(prev => ({
      ...prev,
      projectTitle: data.projectName,
      location: data.location,
      fundingSource: data.fundingSource,
      contractor: data.contractor,
      status: data.projectStatus,
      projectDescription: data.description,
      approvedBudget: data.totalBudget
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
    
    // Update financial allocation if total budget changed
    if (data.totalBudget) {
      setFinancialAllocation(prev => ({
        ...prev,
        totalBudget: data.totalBudget,
        totalEstimatedCost: data.totalBudget,
        remainingBudget: data.totalBudget - prev.physicalAccomplishmentValue
      }));
    }
    
    // Update objectives and key features
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

  // Section A and B handlers for OverviewTab
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

  // Get filtered data for display
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

  // Dynamic hero section stats - Responsive to data changes
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
        label: 'Physical Accomplishment',
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
    const fundingSource = project.fundingSource || project.category || '';
    if (fundingSource.toLowerCase().includes('gaa')) return 'GAA-Funded Projects';
    if (fundingSource.toLowerCase().includes('local')) return 'Locally-Funded Projects';
    if (fundingSource.toLowerCase().includes('grant')) return 'Special Grants Projects';
    return 'Construction Projects';
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
                    onClick={() => onNavigate('construction-of-infrastructure')}
                    className="text-gray-500 hover:text-emerald-700 cursor-pointer transition-colors"
                  >
                    Construction Infrastructure
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
                    {editableProject.projectTitle || project.projectTitle}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Project Title & Metadata - Formal Design */}
          <div className="mb-5">
            <h1 className="text-xl text-gray-900 mb-2.5 leading-tight">
              {editableProject.projectTitle || project.projectTitle}
            </h1>
            
            {/* Metadata Row - Clean & Minimal */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-gray-600">
              <div className="flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-emerald-600" />
                <span>{project.fundingSource || 'GAA'}</span>
              </div>
              <span className="text-gray-300">•</span>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>{editableProject.location || project.location || 'Main Campus'}</span>
              </div>
              <span className="text-gray-300">•</span>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>Started: {formatDate(project.dateStarted)}</span>
              </div>
              <Badge className={`${getStatusColor(editableProject.status || project.status)} text-xs px-2 py-0.5`}>
                {editableProject.status || project.status}
              </Badge>
            </div>
          </div>

          {/* Key Metrics - Formal & Minimal Cards with Better Spacing */}
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
                  className={`bg-white border ${config.border} rounded-lg p-4 transition-all duration-200`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`${config.iconBg} p-2 rounded-lg`}>
                      <IconComponent className={`w-4 h-4 ${config.iconColor}`} />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-lg text-gray-900 mb-1">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.subText}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-6 py-6">
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
              OVERVIEW TAB - REDESIGNED TO MATCH ATTACHED IMAGE
              ==================== */}
          <TabsContent value="overview" className="space-y-6 mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* LEFT COLUMN: Latest Project Gallery */}
              <Card className="border-gray-200 shadow-sm bg-white flex flex-col">
                <CardHeader className="border-b border-gray-100 pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-600">
                      <Camera className="w-5 h-5" />
                      <CardTitle className="text-emerald-600">Project Gallery</CardTitle>
                    </div>
                    {canEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveTab('gallery')}
                        className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 h-7 text-xs"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Manage
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-5 flex-1 flex flex-col">
                  <div className="flex-1 flex flex-col gap-3">
                    {/* Main/Featured Image */}
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-200 bg-gray-100 group">
                      <div className="absolute top-3 left-3 z-10">
                        <Badge className="bg-emerald-600 text-white border-0 text-xs">
                          In Progress
                        </Badge>
                      </div>
                      <ImageWithFallback
                        src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=600"
                        alt="Current progress: Exterior walls and windows installation at 85% completion"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3">
                        <p className="text-white text-sm font-medium">
                          Current progress: Exterior walls and windows installation at 85% completion
                        </p>
                        <p className="text-white/80 text-xs mt-0.5">October 1, 2024</p>
                      </div>
                    </div>

                    {/* Thumbnail Grid - 1 image visible */}
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-200 bg-gray-100 group cursor-pointer" onClick={() => setActiveTab('gallery')}>
                      <ImageWithFallback
                        src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=300"
                        alt="Structural framework completion"
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all" />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                        <p className="text-white text-xs">Structural framework completion - 4-story building taking shape</p>
                      </div>
                    </div>
                  </div>

                  {/* View All Button */}
                  <Button 
                    variant="outline" 
                    className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50 mt-3 h-9"
                    onClick={() => setActiveTab('gallery')}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    View All Photos ({galleryItems.length})
                  </Button>
                </CardContent>
              </Card>

              {/* RIGHT COLUMN: Progress Overview Container - Redesigned */}
              <ProgressOverviewContainer
                financialPercentage={financialAllocation.physicalAccomplishmentPercent}
                targetBudget={targetBudget}
                actualSpent={actualSpent}
                budgetVariance={budgetVariance}
                budgetVariancePercent={budgetVariancePercent}
                physicalPercentage={actualProgress}
                targetProgress={targetProgress}
                actualProgress={actualProgress}
                phasesDone={physicalPerformance.phasesDone}
                totalPhases={physicalPerformance.totalPhases}
                physicalStatus={physicalPerformance.physicalStatus}
                dateStarted={sectionBData.dateStarted}
                targetDateCompletion={sectionBData.targetDateCompletion}
                originalContractDuration={sectionBData.originalContractDuration}
                canEdit={canEdit}
                onEditFinancial={() => setIsFinancialDialogOpen(true)}
                onEditPhysical={() => setIsPhysicalDialogOpen(true)}
                onEditTimeline={() => setIsHealthDialogOpen(true)}
              />
            </div>

            {/* Project Information - Full Width */}
            <Card className="border-gray-200 shadow-sm bg-white">
              <CardHeader className="border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-emerald-600">
                      <Building className="w-5 h-5" />
                      <CardTitle className="text-emerald-600">Project Information</CardTitle>
                    </div>
                    <CardDescription>Comprehensive project details, objectives, and key features</CardDescription>
                  </div>
                  {canEdit && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsProjectInfoDialogOpen(true)}
                      className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit Details
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {/* Description */}
                <p className="text-sm text-gray-700 leading-relaxed mb-6">
                  {sectionAData.projectDescription || "The University Gymnasium and Cultural Center is a landmark infrastructure project designed to provide world-class facilities for sports, cultural performances, and community events. This multi-purpose venue will serve as the centerpiece of student life, hosting athletic competitions, cultural festivals, graduations, and other significant university events. The project integrates modern architectural design with functional excellence to create an inspiring space for the CSU community."}
                </p>

                {/* Key Details Grid */}
                <div className="grid grid-cols-3 gap-6 mb-6">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Total Budget</p>
                    <p className="text-sm text-gray-900">{formatCurrency(targetBudget)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Funding Source</p>
                    <p className="text-sm text-gray-900">{project.fundingSource || 'General Appropriations Act (GAA)'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Project Status</p>
                    <Badge className={getStatusColor(editableProject.status || project.status)}>
                      {editableProject.status || project.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Contractor</p>
                    <p className="text-sm text-gray-900">{sectionBData.contractorName || 'Giovanni Construction / BN Builders and Supplies, INC'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Contract Duration</p>
                    <p className="text-sm text-gray-900">{sectionBData.originalContractDuration || '912 days'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Location</p>
                    <p className="text-sm text-gray-900">{project.location || 'Athletics Complex, Central Campus'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Beneficiaries</p>
                    <p className="text-sm text-gray-900">{projectBeneficiaries || '5,000+ students and staff'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Start Date</p>
                    <p className="text-sm text-gray-900">{formatDate(sectionBData.dateStarted || 'June 1, 2023')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Target End Date</p>
                    <p className="text-sm text-gray-900">{formatDate(sectionBData.targetDateCompletion || 'December 31, 2025')}</p>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Project Objectives */}
                <div className="mb-6">
                  <h4 className="text-sm text-gray-900 mb-3">Project Objectives</h4>
                  <div className="space-y-2">
                    {projectObjectives.map((objective, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-700">{objective}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Key Features */}
                <div>
                  <h4 className="text-sm text-gray-900 mb-3">Key Features</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {projectKeyFeatures.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-700">{feature}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Accomplishment - Two Column Grid Layout */}
            <Card className="border-gray-200 shadow-sm bg-white">
              <CardHeader className="border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-emerald-600">
                      <DollarSign className="w-5 h-5" />
                      <CardTitle className="text-emerald-600">Financial Accomplishment</CardTitle>
                    </div>
                    <CardDescription>Detailed budget utilization and variance tracking by reporting period</CardDescription>
                  </div>
                  {canAdd && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsAddReportDialogOpen(true)}
                      className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Report
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Log Entry 1 - Q4 2024 */}
                  <div className="border-l-4 border-emerald-600 pl-4 py-3 bg-emerald-50 rounded-r-lg group hover:shadow-md transition-all relative">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm text-gray-900">Q4 2024 Financial Report</p>
                        <p className="text-xs text-gray-600">As of December 31, 2024</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-emerald-600 text-white border-0 text-xs">Active</Badge>
                        {canEdit && (
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-emerald-600 hover:text-white">
                              <Edit className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2 mt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Target Budget</span>
                        <span className="text-sm text-gray-900">{formatCurrency(targetBudget)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Actual Spent</span>
                        <span className="text-sm text-gray-900">{formatCurrency(actualSpent)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Variance</span>
                        <span className={`text-sm ${budgetVariance >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                          {budgetVariance >= 0 ? '+' : ''}{formatCurrency(budgetVariance)}
                        </span>
                      </div>
                    </div>
                    <Progress value={financialAllocation.physicalAccomplishmentPercent} className="h-2 mt-3" />
                    <p className="text-xs text-gray-600 mt-2">Utilization: {financialAllocation.physicalAccomplishmentPercent.toFixed(1)}%</p>
                  </div>

                  {/* Log Entry 2 - Q3 2024 */}
                  <div className="border-l-4 border-blue-400 pl-4 py-3 bg-blue-50 rounded-r-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm text-gray-900">Q3 2024 Financial Report</p>
                        <p className="text-xs text-gray-600">As of September 30, 2024</p>
                      </div>
                      <Badge variant="outline" className="text-xs">Historical</Badge>
                    </div>
                    <div className="space-y-2 mt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Target Budget</span>
                        <span className="text-sm text-gray-900">{formatCurrency(133584238)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Actual Spent</span>
                        <span className="text-sm text-gray-900">{formatCurrency(85159012)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Variance</span>
                        <span className="text-sm text-emerald-700">+{formatCurrency(48425226)}</span>
                      </div>
                    </div>
                    <Progress value={63.8} className="h-2 mt-3" />
                    <p className="text-xs text-gray-600 mt-2">Utilization: 63.8%</p>
                  </div>

                  {/* Log Entry 3 - Q2 2024 */}
                  <div className="border-l-4 border-gray-300 pl-4 py-3 bg-gray-50 rounded-r-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm text-gray-900">Q2 2024 Financial Report</p>
                        <p className="text-xs text-gray-600">As of June 30, 2024</p>
                      </div>
                      <Badge variant="outline" className="text-xs">Historical</Badge>
                    </div>
                    <div className="space-y-2 mt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Target Budget</span>
                        <span className="text-sm text-gray-900">{formatCurrency(89056159)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Actual Spent</span>
                        <span className="text-sm text-gray-900">{formatCurrency(67106010)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Variance</span>
                        <span className="text-sm text-emerald-700">+{formatCurrency(21950149)}</span>
                      </div>
                    </div>
                    <Progress value={75.3} className="h-2 mt-3" />
                    <p className="text-xs text-gray-600 mt-2">Utilization: 75.3%</p>
                  </div>

                  {/* Log Entry 4 - Q1 2024 */}
                  <div className="border-l-4 border-purple-400 pl-4 py-3 bg-purple-50 rounded-r-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm text-gray-900">Q1 2024 Financial Report</p>
                        <p className="text-xs text-gray-600">As of March 31, 2024</p>
                      </div>
                      <Badge variant="outline" className="text-xs">Historical</Badge>
                    </div>
                    <div className="space-y-2 mt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Target Budget</span>
                        <span className="text-sm text-gray-900">{formatCurrency(44528080)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Actual Spent</span>
                        <span className="text-sm text-gray-900">{formatCurrency(51053005)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Variance</span>
                        <span className="text-sm text-red-700">-{formatCurrency(6524925)}</span>
                      </div>
                    </div>
                    <Progress value={114.7} className="h-2 mt-3" />
                    <p className="text-xs text-gray-600 mt-2">Utilization: 114.7%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Physical Accomplishment by Phase - Two Column Grid Layout */}
            <Card className="border-gray-200 shadow-sm bg-white">
              <CardHeader className="border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-blue-600">
                      <Activity className="w-5 h-5" />
                      <CardTitle className="text-blue-600">Physical Accomplishment by Phase</CardTitle>
                    </div>
                    <CardDescription>Progress tracking across project phases with target vs actual comparison</CardDescription>
                  </div>
                  {canAdd && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsAddPhaseDialogOpen(true)}
                      className="border-blue-600 text-blue-600 hover:bg-blue-50"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Phase
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Phase 1 - Completed */}
                  <div className="border-l-4 border-emerald-600 pl-4 py-3 bg-emerald-50 rounded-r-lg group hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">Phase 1: Preparatory Work</p>
                        <p className="text-xs text-gray-600 mt-1">Mobilization and site preparation complete</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-emerald-600 text-white border-0 text-xs whitespace-nowrap">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Complete
                        </Badge>
                        {canEdit && (
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-emerald-600 hover:text-white">
                              <Edit className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2 mt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Target Progress</span>
                        <span className="text-sm text-gray-900">100%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Actual Progress</span>
                        <span className="text-sm text-emerald-700">100%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Variance</span>
                        <span className="text-sm text-emerald-700">On Target</span>
                      </div>
                    </div>
                    <Progress value={100} className="h-2 mt-3" />
                    <p className="text-xs text-gray-500 mt-2">Target: Sep 15, 2023 | Actual: Sep 14, 2023 (1 day ahead)</p>
                  </div>

                  {/* Phase 2 - In Progress */}
                  <div className="border-l-4 border-blue-600 pl-4 py-3 bg-blue-50 rounded-r-lg group hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">Phase 2: Building & Roof System</p>
                        <p className="text-xs text-gray-600 mt-1">Framework and roofing installation ongoing</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-600 text-white border-0 text-xs whitespace-nowrap">
                          <Clock className="w-3 h-3 mr-1" />
                          In Progress
                        </Badge>
                        {canEdit && (
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-blue-600 hover:text-white">
                              <Edit className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2 mt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Target Progress</span>
                        <span className="text-sm text-gray-900">100%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Actual Progress</span>
                        <span className="text-sm text-blue-700">98.1%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Variance</span>
                        <span className="text-sm text-amber-700">-1.9%</span>
                      </div>
                    </div>
                    <Progress value={98.1} className="h-2 mt-3" />
                    <p className="text-xs text-gray-500 mt-2">Target: Apr 30, 2024 | Actual: Apr 28, 2024 (2 days ahead)</p>
                  </div>

                  {/* Phase 3 - Not Started */}
                  <div className="border-l-4 border-gray-300 pl-4 py-3 bg-gray-50 rounded-r-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm text-gray-900">Phase 3: Utilities & Finishing</p>
                        <p className="text-xs text-gray-600 mt-1">Final MEPF installation and finishing work</p>
                      </div>
                      <Badge variant="outline" className="text-xs">Pending</Badge>
                    </div>
                    <div className="space-y-2 mt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Target Progress</span>
                        <span className="text-sm text-gray-900">100%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Actual Progress</span>
                        <span className="text-sm text-gray-900">0%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Variance</span>
                        <span className="text-sm text-gray-900">-</span>
                      </div>
                    </div>
                    <Progress value={0} className="h-2 mt-3" />
                    <p className="text-xs text-gray-500 mt-2">Target: Dec 31, 2025 | Estimated Start: Jan 2025</p>
                  </div>

                  {/* Phase 4 - Future */}
                  <div className="border-l-4 border-purple-300 pl-4 py-3 bg-purple-50 rounded-r-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm text-gray-900">Phase 4: Quality Assurance</p>
                        <p className="text-xs text-gray-600 mt-1">Final inspection and project handover</p>
                      </div>
                      <Badge variant="outline" className="text-xs">Scheduled</Badge>
                    </div>
                    <div className="space-y-2 mt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Target Progress</span>
                        <span className="text-sm text-gray-900">100%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Actual Progress</span>
                        <span className="text-sm text-gray-900">0%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Variance</span>
                        <span className="text-sm text-gray-900">-</span>
                      </div>
                    </div>
                    <Progress value={0} className="h-2 mt-3" />
                    <p className="text-xs text-gray-500 mt-2">Target: Jan 31, 2026 | Estimated Start: Dec 2025</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Accomplishment Records Section - Section A & B from OverviewTab */}
            <OverviewTab
              sectionAData={sectionAData}
              setSectionAData={setSectionAData}
              sectionBData={sectionBData}
              setSectionBData={setSectionBData}
              financialAllocation={financialAllocation}
              isEditingSectionA={formStates.isEditingSectionA}
              setIsEditingSectionA={(editing) => setFormStates(prev => ({ ...prev, isEditingSectionA: editing }))}
              isEditingSectionB={formStates.isEditingSectionB}
              setIsEditingSectionB={(editing) => setFormStates(prev => ({ ...prev, isEditingSectionB: editing }))}
              isEditingFinancial={formStates.isEditingFinancial}
              setIsEditingFinancial={(editing) => setFormStates(prev => ({ ...prev, isEditingFinancial: editing }))}
              canEdit={canEdit}
              globalMEFilter={globalMEFilter}
              onFilterChange={handleGlobalFilterChange}
              onClearFilter={handleClearGlobalFilter}
              projectId={project.id}
              onSectionAEdit={handleSectionAEdit}
              onSectionASave={handleSectionASave}
              onSectionACancel={handleSectionACancel}
              onSectionBEdit={handleSectionBEdit}
              onSectionBSave={handleSectionBSave}
              onSectionBCancel={handleSectionBCancel}
              userRole={userRole}
              accomplishmentRecords={accomplishmentRecords}
              setAccomplishmentRecords={setAccomplishmentRecords}
              actualAccomplishmentRecords={actualAccomplishmentRecords}
              setActualAccomplishmentRecords={setActualAccomplishmentRecords}
              progressSummaryRecords={progressSummaryRecords}
              setProgressSummaryRecords={setProgressSummaryRecords}
            />
          </TabsContent>

          {/* ====================
              TIMELINE TAB - ENHANCED WITH CRUD, FILTERS, AND PAGINATION
              ==================== */}
          <TabsContent value="timeline" className="space-y-6 mt-0">
            <TimelineTabEnhanced
              projectId={project.id}
              canAdd={canAdd}
              canEdit={canEdit}
              canDelete={canDelete}
            />
          </TabsContent>

          {/* ====================
              ORIGINAL TIMELINE TAB (HIDDEN - FOR REFERENCE ONLY)
              ==================== */}
          {false && <TabsContent value="timeline-original" className="space-y-6 mt-0">
            <Card className="border-gray-200 shadow-sm bg-white">
              <CardHeader className="border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Project Timeline</CardTitle>
                    <CardDescription>Milestones, schedules, and key dates</CardDescription>
                  </div>
                  <Badge variant="outline">3 Phases</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {/* Timeline Visual */}
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />
                  
                  {/* Timeline items */}
                  <div className="space-y-8">
                    {/* Milestone 1 */}
                    <div className="relative flex gap-6">
                      <div className="flex-shrink-0 w-16 flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-emerald-100 border-4 border-emerald-600 flex items-center justify-center z-10">
                          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                        </div>
                      </div>
                      <div className="flex-1 pb-8">
                        <Card className="border-emerald-200 bg-emerald-50">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="text-sm text-gray-900">Site Preparation & Foundation</h4>
                                <p className="text-xs text-gray-600 mt-1">June 1, 2023 - September 14, 2023</p>
                              </div>
                              <Badge className="bg-emerald-600 text-white">Completed</Badge>
                            </div>
                            <p className="text-xs text-gray-700 mt-3">
                              Site clearing, excavation, foundation work, and structural framework completed ahead of schedule
                            </p>
                            <div className="flex items-center gap-4 mt-3 text-xs">
                              <div className="flex items-center gap-1 text-gray-600">
                                <Calendar className="w-3 h-3" />
                                <span>106 days</span>
                              </div>
                              <div className="flex items-center gap-1 text-emerald-700">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>1 day ahead</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    {/* Milestone 2 */}
                    <div className="relative flex gap-6">
                      <div className="flex-shrink-0 w-16 flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-blue-100 border-4 border-blue-600 flex items-center justify-center z-10">
                          <Activity className="w-8 h-8 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1 pb-8">
                        <Card className="border-blue-200 bg-blue-50">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="text-sm text-gray-900">Structural Framework & Roofing</h4>
                                <p className="text-xs text-gray-600 mt-1">September 15, 2023 - April 28, 2024</p>
                              </div>
                              <Badge className="bg-blue-600 text-white">In Progress 98.1%</Badge>
                            </div>
                            <p className="text-xs text-gray-700 mt-3">
                              Steel framework installation, roof system completion, window installation, and MEP rough-in underway
                            </p>
                            <div className="flex items-center gap-4 mt-3 text-xs">
                              <div className="flex items-center gap-1 text-gray-600">
                                <Calendar className="w-3 h-3" />
                                <span>226 days</span>
                              </div>
                              <div className="flex items-center gap-1 text-blue-700">
                                <Clock className="w-3 h-3" />
                                <span>2 days ahead</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    {/* Milestone 3 */}
                    <div className="relative flex gap-6">
                      <div className="flex-shrink-0 w-16 flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-gray-100 border-4 border-gray-300 flex items-center justify-center z-10">
                          <Target className="w-8 h-8 text-gray-400" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <Card className="border-gray-200 bg-gray-50">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="text-sm text-gray-900">MEPF & Finishing Works</h4>
                                <p className="text-xs text-gray-600 mt-1">January 2025 - December 31, 2025</p>
                              </div>
                              <Badge variant="outline">Pending</Badge>
                            </div>
                            <p className="text-xs text-gray-700 mt-3">
                              Complete mechanical, electrical, plumbing, and fire protection systems; interior finishing; quality assurance
                            </p>
                            <div className="flex items-center gap-4 mt-3 text-xs">
                              <div className="flex items-center gap-1 text-gray-600">
                                <Calendar className="w-3 h-3" />
                                <span>365 days (estimated)</span>
                              </div>
                              <div className="flex items-center gap-1 text-gray-600">
                                <Clock className="w-3 h-3" />
                                <span>Starts in 30 days</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Schedule Summary */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Project Start</p>
                    <p className="text-sm text-gray-900">June 1, 2023</p>
                  </div>
                  <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                    <p className="text-xs text-gray-600 mb-1">Current Phase</p>
                    <p className="text-sm text-emerald-700">Phase 2 (98.1%)</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Target Completion</p>
                    <p className="text-sm text-gray-900">Dec 31, 2025</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>}

          {/* Individual POW Tab - Enhanced with Column Visibility, Filters, and Pagination */}
          <TabsContent value="individual-pow" className="space-y-6 mt-0">
            <IndividualPOWTabEnhanced
              projectId={project.id}
              userRole={userRole}
              canAdd={canAdd}
              canEdit={canEdit}
              canDelete={canDelete}
              powItems={powItems}
              onPowItemsChange={setPowItems}
            />
          </TabsContent>

          {/* Data Analytics Tab - Synced with POW Data */}
          <TabsContent value="analytics" className="space-y-6 mt-0">
            <DataAnalyticsTab
              projectId={project.id}
              userRole={userRole}
              powItems={powItems}
              projectData={project}
            />
          </TabsContent>

          {/* Gallery Tab - Keep Existing */}
          <TabsContent value="gallery" className="space-y-6 mt-0">
            <GalleryTab
              projectId={project.id}
              galleryItems={galleryItems}
              filteredGalleryItems={filteredGalleryItems}
              canAdd={canAdd}
              canDelete={canDelete}
              onAddPhoto={(photoData) => {
                const newItem: GalleryItem = {
                  id: `img-${Date.now()}`,
                  title: photoData.title || 'New Photo',
                  caption: photoData.caption || '',
                  description: photoData.description || '',
                  url: photoData.file ? URL.createObjectURL(photoData.file) : '',
                  filename: photoData.file?.name || 'photo.jpg',
                  category: photoData.category || 'progress',
                  uploadDate: photoData.uploadDate || new Date().toISOString().split('T')[0],
                  uploadedAt: new Date().toISOString(),
                  uploadedBy: 'Current User',
                  photographer: 'Current User',
                  dateCaptured: photoData.uploadDate || new Date().toISOString().split('T')[0],
                  meRelevant: true,
                  tags: ['construction', 'progress'],
                  location: 'Project Site',
                  rating: 5,
                  containerId: photoData.containerId
                };
                setGalleryItems(prev => [...prev, newItem]);
                toast.success('Photo added successfully');
              }}
              onDeletePhoto={(id) => {
                setGalleryItems(prev => prev.filter(item => item.id !== id));
                toast.success('Photo deleted successfully');
              }}
              globalMEFilter={globalMEFilter}
              onFilterChange={handleGlobalFilterChange}
              onClearFilter={handleClearGlobalFilter}
            />
          </TabsContent>

          {/* Documents Tab - Keep Existing */}
          <TabsContent value="documents" className="space-y-6 mt-0">
            <DocumentsTab
              projectId={project.id}
              documentItems={documentItems}
              filteredDocumentItems={filteredDocumentItems}
              canAdd={canAdd}
              canDelete={canDelete}
              onAddDocument={(docData) => {
                const newDoc: DocumentItem = {
                  id: `doc-${Date.now()}`,
                  name: docData.name || 'New Document',
                  filename: docData.filename || 'document.pdf',
                  type: docData.type || 'PDF',
                  fileType: docData.type || 'PDF',
                  category: docData.category || 'General',
                  documentCategory: docData.category || 'General',
                  size: docData.size || '0 MB',
                  fileSize: docData.size || '0 MB',
                  dateOfEntry: new Date().toISOString().split('T')[0],
                  uploadedAt: new Date().toISOString(),
                  dateUploaded: new Date().toISOString().split('T')[0],
                  uploadedBy: 'Admin',
                  url: docData.url || '#',
                  meRelevant: true,
                  tags: ['project'],
                  version: '1.0'
                };
                setDocumentItems(prev => [...prev, newDoc]);
                toast.success('Document added successfully');
              }}
              onDeleteDocument={(id) => {
                setDocumentItems(prev => prev.filter(item => item.id !== id));
                toast.success('Document deleted successfully');
              }}
              globalMEFilter={globalMEFilter}
              onFilterChange={handleGlobalFilterChange}
              onClearFilter={handleClearGlobalFilter}
            />
          </TabsContent>

          {/* Team Tab - Personnel Management */}
          <TabsContent value="team" className="space-y-6 mt-0">
            <TeamTab
              projectId={project.id}
              projectTitle={project.projectTitle}
              teamMembers={teamMembers}
              filteredTeamMembers={filteredTeamMembers}
              canAdd={canAdd}
              canEdit={canEdit}
              canDelete={canDelete}
              currentUserEmail={userRole === 'Client' ? 'user@carsu.edu.ph' : 'admin@carsu.edu.ph'}
              currentUserRole={userRole}
              onAddTeamMember={(memberData) => {
                const newMember: TeamMember = {
                  id: `team-${Date.now()}`,
                  name: memberData.name,
                  role: memberData.role,
                  department: memberData.department,
                  avatar: memberData.avatar,
                  isActive: true
                };
                setTeamMembers(prev => [...prev, newMember]);
                toast.success('Team member added successfully');
              }}
              onEditTeamMember={(updatedMember) => {
                setTeamMembers(prev => prev.map(member => 
                  member.id === updatedMember.id ? updatedMember : member
                ));
                toast.success('Team member updated successfully');
              }}
              onDeleteTeamMember={(id) => {
                setTeamMembers(prev => prev.filter(member => member.id !== id));
                toast.success('Team member removed successfully');
              }}
              globalMEFilter={globalMEFilter}
              onFilterChange={handleGlobalFilterChange}
              onClearFilter={handleClearGlobalFilter}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* CRUD Dialogs */}
      <FinancialPerformanceDialog
        open={isFinancialDialogOpen}
        onOpenChange={setIsFinancialDialogOpen}
        data={{
          totalBudget: financialAllocation.totalBudget,
          actualSpent: financialAllocation.physicalAccomplishmentValue,
          utilization: financialAllocation.physicalAccomplishmentPercent
        }}
        onSubmit={handleFinancialUpdate}
      />

      <PhysicalPerformanceDialog
        open={isPhysicalDialogOpen}
        onOpenChange={setIsPhysicalDialogOpen}
        data={{
          targetProgress: targetProgress,
          actualProgress: actualProgress,
          phasesDone: physicalPerformance.phasesDone,
          totalPhases: physicalPerformance.totalPhases,
          status: physicalPerformance.physicalStatus
        }}
        onSubmit={handlePhysicalUpdate}
      />

      <ProjectHealthDialog
        open={isHealthDialogOpen}
        onOpenChange={setIsHealthDialogOpen}
        data={healthMetrics}
        onSubmit={handleHealthUpdate}
      />

      <ProjectInformationDialog
        open={isProjectInfoDialogOpen}
        onOpenChange={setIsProjectInfoDialogOpen}
        data={{
          projectName: editableProject.projectTitle || project.projectTitle,
          location: editableProject.location || project.location || 'Main Campus',
          fundingSource: project.fundingSource || 'General Appropriations Act (GAA)',
          contractDuration: sectionBData.originalContractDuration || '365 days',
          projectStatus: editableProject.status || project.status,
          contractor: sectionBData.contractorName || project.contractor || '',
          description: sectionAData.projectDescription || project.description || '',
          totalBudget: financialAllocation.totalBudget,
          beneficiaries: projectBeneficiaries,
          startDate: sectionBData.dateStarted,
          targetEndDate: sectionBData.targetDateCompletion,
          objectives: projectObjectives,
          keyFeatures: projectKeyFeatures
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
