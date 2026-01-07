import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Separator } from '../../ui/separator';
import { Progress } from '../../ui/progress';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../ui/breadcrumb';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { toast } from 'sonner@2.0.3';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  TrendingUp, 
  CheckCircle,
  Clock,
  Users,
  FileText,
  Download,
  Image as ImageIcon,
  BarChart3,
  Target,
  PlayCircle,
  CheckCircle2,
  Eye,
  Mail,
  Phone,
  ArrowLeft,
  Edit,
  Filter,
  Save,
  X,
  Plus,
  Trash2,
  Paperclip,
  Upload,
  AlertCircle,
  TrendingDown,
  Briefcase,
  UserCheck,
  CalendarDays,
  ExternalLink
} from 'lucide-react';
import { ClientNavbar } from '../components/ClientNavbar';
import { NavigationProps } from '../types';
import { getProjectById } from './ProjectDataManager';

// ========================================
// TYPE DEFINITIONS
// ========================================

interface ProjectDetailPageRestoredProps extends NavigationProps {
  projectId?: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  position: string;
  department: string;
  email?: string;
  phone?: string;
  status: 'active' | 'inactive' | 'on-leave';
  type: 'staff' | 'contractor';
  responsibility?: string;
  contractorCompany?: string;
}

interface ProjectDocument {
  id: string;
  name: string;
  type: 'Proposal' | 'Report' | 'Plan' | 'Certification' | 'Other';
  url: string;
  uploadedDate: string;
  fileSize?: string;
  status: 'active' | 'archived' | 'draft';
}

interface GalleryImage {
  id: string;
  url: string;
  caption: string;
  category: 'Before' | 'In Progress' | 'Completed' | 'Documentation';
  date: string;
  uploadedDate: string;
  status: 'active' | 'archived' | 'featured';
}

interface FinancialAllocation {
  category: string;
  target: number;
  actual: number;
  variance: number;
  variancePercentage: number;
}

interface PhysicalAccomplishment {
  phase: string;
  description: string;
  target: number;
  actual: number;
  variance: number;
  status: string;
}

interface TimelineEntry {
  id: string;
  title: string;
  description: string;
  date: string;
  status: 'completed' | 'ongoing' | 'planned' | 'delayed';
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  phase?: string;
  contractor?: string;
  remarks?: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  contractor: string;
  location: string;
  budget: string;
  budgetAmount?: number;
  progress: number;
  status: string;
  startDate: string;
  targetEndDate: string;
  beneficiaries: number;
  overview: {
    summary: string;
    objectives: string[];
    keyFeatures: string[];
    scope?: string;
  };
  financialAllocation: FinancialAllocation[];
  physicalAccomplishment: PhysicalAccomplishment[];
  gallery: GalleryImage[];
  documents: ProjectDocument[];
  team: TeamMember[];
  timeline: TimelineEntry[];
  year?: number;
  lastUpdated?: string;
  category?: string;
  varianceData?: any;
}

export function ProjectDetailPageRestored({
  onNavigate,
  onSignIn,
  onSignOut,
  userRole = 'Client',
  userProfile = null,
  requireAuth = () => false,
  onAuthModalSignIn,
  demoMode = false,
  projectId
}: ProjectDetailPageRestoredProps) {

  // ========================================
  // HELPER FUNCTIONS
  // ========================================

  const getProjectData = (id?: string): Project => {
    console.log('🎯 Loading project data for ID:', id);
    
    // Use the centralized project data manager
    const project = getProjectById(id || '');
    
    return project as Project;
  };
  
  const [project, setProject] = useState<Project>(() => {
    console.log('📊 Initial project state with projectId:', projectId);
    return getProjectData(projectId);
  });
  const [activeTab, setActiveTab] = useState('overview');
  
  // Update project when projectId changes
  useEffect(() => {
    console.log('🔄 ProjectId changed to:', projectId);
    const newProject = getProjectData(projectId);
    console.log('📊 Loading project:', newProject.title);
    setProject(newProject);
  }, [projectId]);
  
  // Timeline state
  const [timelineFilter, setTimelineFilter] = useState<'all' | 'daily' | 'weekly' | 'monthly' | 'quarterly'>('all');
  const [timelineStatusFilter, setTimelineStatusFilter] = useState<'all' | 'completed' | 'ongoing' | 'planned' | 'delayed'>('all');
  const [timelineDateFilter, setTimelineDateFilter] = useState<'all' | 'january' | 'february' | 'march' | 'april' | 'may' | 'june' | 'july' | 'august' | 'september' | 'october' | 'november' | 'december' | 'last-7-days' | 'last-30-days' | 'last-90-days' | 'custom'>('all');
  const [timelineDateRange, setTimelineDateRange] = useState<{ start: string; end: string } | null>(null);
  const [showAddTimelineModal, setShowAddTimelineModal] = useState(false);
  const [editingTimelineEntry, setEditingTimelineEntry] = useState<TimelineEntry | null>(null);
  const [showDeleteTimelineModal, setShowDeleteTimelineModal] = useState<string | null>(null);
  const [newTimelineEntry, setNewTimelineEntry] = useState({
    title: '',
    description: '',
    date: '',
    status: 'planned' as const,
    type: 'daily' as const,
    phase: '',
    contractor: '',
    remarks: ''
  });
  
  // Gallery state
  const [galleryDateFilter, setGalleryDateFilter] = useState<'all' | 'january' | 'february' | 'march' | 'april' | 'may' | 'june' | 'july' | 'august' | 'september' | 'october' | 'november' | 'december' | 'last-7-days' | 'last-30-days' | 'last-90-days' | 'custom'>('all');
  const [galleryDateRange, setGalleryDateRange] = useState<{ start: string; end: string } | null>(null);
  const [galleryCategoryFilter, setGalleryCategoryFilter] = useState<string>('all');
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  
  // Documents state
  const [documentsDateFilter, setDocumentsDateFilter] = useState<'all' | 'january' | 'february' | 'march' | 'april' | 'may' | 'june' | 'july' | 'august' | 'september' | 'october' | 'november' | 'december' | 'last-7-days' | 'last-30-days' | 'last-90-days' | 'custom'>('all');
  const [documentsDateRange, setDocumentsDateRange] = useState<{ start: string; end: string } | null>(null);
  const [documentsTypeFilter, setDocumentsTypeFilter] = useState<string>('all');
  
  // CRUD states for editing sections
  const [editingProjectInfo, setEditingProjectInfo] = useState(false);
  const [editingFinancial, setEditingFinancial] = useState(false);
  const [editingPhysical, setEditingPhysical] = useState(false);
  
  // Temporary editing states - initialized with useMemo to sync with project changes
  const [tempProjectInfo, setTempProjectInfo] = useState(() => ({
    title: project.title,
    description: project.description,
    budget: project.budget,
    contractor: project.contractor,
    location: project.location,
    beneficiaries: project.beneficiaries,
    startDate: project.startDate,
    targetEndDate: project.targetEndDate
  }));
  
  const [tempFinancialData, setTempFinancialData] = useState(() => [...project.financialAllocation]);
  const [tempPhysicalData, setTempPhysicalData] = useState(() => [...project.physicalAccomplishment]);
  
  // Sync temporary states when project changes
  useEffect(() => {
    setTempProjectInfo({
      title: project.title,
      description: project.description,
      budget: project.budget,
      contractor: project.contractor,
      location: project.location,
      beneficiaries: project.beneficiaries,
      startDate: project.startDate,
      targetEndDate: project.targetEndDate
    });
    setTempFinancialData([...project.financialAllocation]);
    setTempPhysicalData([...project.physicalAccomplishment]);
  }, [project]);
  
  // Permission check
  const canEdit = useMemo(() => {
    return userProfile?.role === 'Admin' || userProfile?.role === 'Staff';
  }, [userProfile?.role]);

  // ========================================
  // COMPUTED VALUES
  // ========================================

  const financialUtilization = useMemo(() => {
    const totalTarget = project.financialAllocation.reduce((sum, item) => sum + item.target, 0);
    const totalActual = project.financialAllocation.reduce((sum, item) => sum + item.actual, 0);
    return totalTarget > 0 ? (totalActual / totalTarget) * 100 : 0;
  }, [project.financialAllocation]);

  const avgPhysicalProgress = useMemo(() => {
    const totalProgress = project.physicalAccomplishment.reduce((sum, phase) => sum + phase.actual, 0);
    return project.physicalAccomplishment.length > 0 ? totalProgress / project.physicalAccomplishment.length : 0;
  }, [project.physicalAccomplishment]);

  const filteredTimeline = useMemo(() => {
    let filtered = project.timeline;

    if (timelineFilter !== 'all') {
      filtered = filtered.filter(entry => entry.type === timelineFilter);
    }

    if (timelineStatusFilter !== 'all') {
      filtered = filtered.filter(entry => entry.status === timelineStatusFilter);
    }

    if (timelineDateFilter !== 'all' && timelineDateFilter !== 'custom') {
      const now = new Date();
      let cutoffDate = new Date();
      
      switch (timelineDateFilter) {
        case 'last-7-days':
          cutoffDate.setDate(now.getDate() - 7);
          filtered = filtered.filter(entry => new Date(entry.date) >= cutoffDate);
          break;
        case 'last-30-days':
          cutoffDate.setDate(now.getDate() - 30);
          filtered = filtered.filter(entry => new Date(entry.date) >= cutoffDate);
          break;
        case 'last-90-days':
          cutoffDate.setDate(now.getDate() - 90);
          filtered = filtered.filter(entry => new Date(entry.date) >= cutoffDate);
          break;
        case 'january':
          filtered = filtered.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate.getFullYear() === 2024 && entryDate.getMonth() === 0;
          });
          break;
        case 'february':
          filtered = filtered.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate.getFullYear() === 2024 && entryDate.getMonth() === 1;
          });
          break;
        case 'march':
          filtered = filtered.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate.getFullYear() === 2024 && entryDate.getMonth() === 2;
          });
          break;
        case 'april':
          filtered = filtered.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate.getFullYear() === 2024 && entryDate.getMonth() === 3;
          });
          break;
        case 'may':
          filtered = filtered.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate.getFullYear() === 2024 && entryDate.getMonth() === 4;
          });
          break;
        case 'june':
          filtered = filtered.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate.getFullYear() === 2024 && entryDate.getMonth() === 5;
          });
          break;
        case 'july':
          filtered = filtered.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate.getFullYear() === 2024 && entryDate.getMonth() === 6;
          });
          break;
        case 'august':
          filtered = filtered.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate.getFullYear() === 2024 && entryDate.getMonth() === 7;
          });
          break;
        case 'september':
          filtered = filtered.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate.getFullYear() === 2024 && entryDate.getMonth() === 8;
          });
          break;
        case 'october':
          filtered = filtered.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate.getFullYear() === 2024 && entryDate.getMonth() === 9;
          });
          break;
        case 'november':
          filtered = filtered.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate.getFullYear() === 2024 && entryDate.getMonth() === 10;
          });
          break;
        case 'december':
          filtered = filtered.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate.getFullYear() === 2024 && entryDate.getMonth() === 11;
          });
          break;
      }
    }

    if (timelineDateRange) {
      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.date);
        const startDate = new Date(timelineDateRange.start);
        const endDate = new Date(timelineDateRange.end);
        return entryDate >= startDate && entryDate <= endDate;
      });
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [project.timeline, timelineFilter, timelineStatusFilter, timelineDateFilter, timelineDateRange]);

  const filteredGallery = useMemo(() => {
    let filtered = project.gallery;

    if (galleryCategoryFilter !== 'all') {
      filtered = filtered.filter(image => image.category === galleryCategoryFilter);
    }

    if (galleryDateFilter !== 'all' && galleryDateFilter !== 'custom') {
      const now = new Date();
      let cutoffDate = new Date();
      
      switch (galleryDateFilter) {
        case 'last-7-days':
          cutoffDate.setDate(now.getDate() - 7);
          filtered = filtered.filter(image => new Date(image.date) >= cutoffDate);
          break;
        case 'last-30-days':
          cutoffDate.setDate(now.getDate() - 30);
          filtered = filtered.filter(image => new Date(image.date) >= cutoffDate);
          break;
        case 'last-90-days':
          cutoffDate.setDate(now.getDate() - 90);
          filtered = filtered.filter(image => new Date(image.date) >= cutoffDate);
          break;
        case 'january':
          filtered = filtered.filter(image => {
            const imageDate = new Date(image.date);
            return imageDate.getFullYear() === 2024 && imageDate.getMonth() === 0;
          });
          break;
        case 'february':
          filtered = filtered.filter(image => {
            const imageDate = new Date(image.date);
            return imageDate.getFullYear() === 2024 && imageDate.getMonth() === 1;
          });
          break;
        case 'march':
          filtered = filtered.filter(image => {
            const imageDate = new Date(image.date);
            return imageDate.getFullYear() === 2024 && imageDate.getMonth() === 2;
          });
          break;
        case 'april':
          filtered = filtered.filter(image => {
            const imageDate = new Date(image.date);
            return imageDate.getFullYear() === 2024 && imageDate.getMonth() === 3;
          });
          break;
        case 'may':
          filtered = filtered.filter(image => {
            const imageDate = new Date(image.date);
            return imageDate.getFullYear() === 2024 && imageDate.getMonth() === 4;
          });
          break;
        case 'june':
          filtered = filtered.filter(image => {
            const imageDate = new Date(image.date);
            return imageDate.getFullYear() === 2024 && imageDate.getMonth() === 5;
          });
          break;
        case 'july':
          filtered = filtered.filter(image => {
            const imageDate = new Date(image.date);
            return imageDate.getFullYear() === 2024 && imageDate.getMonth() === 6;
          });
          break;
        case 'august':
          filtered = filtered.filter(image => {
            const imageDate = new Date(image.date);
            return imageDate.getFullYear() === 2024 && imageDate.getMonth() === 7;
          });
          break;
        case 'september':
          filtered = filtered.filter(image => {
            const imageDate = new Date(image.date);
            return imageDate.getFullYear() === 2024 && imageDate.getMonth() === 8;
          });
          break;
        case 'october':
          filtered = filtered.filter(image => {
            const imageDate = new Date(image.date);
            return imageDate.getFullYear() === 2024 && imageDate.getMonth() === 9;
          });
          break;
        case 'november':
          filtered = filtered.filter(image => {
            const imageDate = new Date(image.date);
            return imageDate.getFullYear() === 2024 && imageDate.getMonth() === 10;
          });
          break;
        case 'december':
          filtered = filtered.filter(image => {
            const imageDate = new Date(image.date);
            return imageDate.getFullYear() === 2024 && imageDate.getMonth() === 11;
          });
          break;
      }
    }

    if (galleryDateRange) {
      filtered = filtered.filter(image => {
        const imageDate = new Date(image.date);
        const startDate = new Date(galleryDateRange.start);
        const endDate = new Date(galleryDateRange.end);
        return imageDate >= startDate && imageDate <= endDate;
      });
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [project.gallery, galleryCategoryFilter, galleryDateFilter, galleryDateRange]);

  const filteredDocuments = useMemo(() => {
    let filtered = project.documents;

    if (documentsTypeFilter !== 'all') {
      filtered = filtered.filter(doc => doc.type === documentsTypeFilter);
    }

    if (documentsDateFilter !== 'all' && documentsDateFilter !== 'custom') {
      const now = new Date();
      let cutoffDate = new Date();
      
      switch (documentsDateFilter) {
        case 'last-7-days':
          cutoffDate.setDate(now.getDate() - 7);
          filtered = filtered.filter(doc => new Date(doc.uploadedDate) >= cutoffDate);
          break;
        case 'last-30-days':
          cutoffDate.setDate(now.getDate() - 30);
          filtered = filtered.filter(doc => new Date(doc.uploadedDate) >= cutoffDate);
          break;
        case 'last-90-days':
          cutoffDate.setDate(now.getDate() - 90);
          filtered = filtered.filter(doc => new Date(doc.uploadedDate) >= cutoffDate);
          break;
        case 'january':
          filtered = filtered.filter(doc => {
            const docDate = new Date(doc.uploadedDate);
            return docDate.getFullYear() === 2024 && docDate.getMonth() === 0;
          });
          break;
        case 'february':
          filtered = filtered.filter(doc => {
            const docDate = new Date(doc.uploadedDate);
            return docDate.getFullYear() === 2024 && docDate.getMonth() === 1;
          });
          break;
        case 'march':
          filtered = filtered.filter(doc => {
            const docDate = new Date(doc.uploadedDate);
            return docDate.getFullYear() === 2024 && docDate.getMonth() === 2;
          });
          break;
        case 'april':
          filtered = filtered.filter(doc => {
            const docDate = new Date(doc.uploadedDate);
            return docDate.getFullYear() === 2024 && docDate.getMonth() === 3;
          });
          break;
        case 'may':
          filtered = filtered.filter(doc => {
            const docDate = new Date(doc.uploadedDate);
            return docDate.getFullYear() === 2024 && docDate.getMonth() === 4;
          });
          break;
        case 'june':
          filtered = filtered.filter(doc => {
            const docDate = new Date(doc.uploadedDate);
            return docDate.getFullYear() === 2024 && docDate.getMonth() === 5;
          });
          break;
        case 'july':
          filtered = filtered.filter(doc => {
            const docDate = new Date(doc.uploadedDate);
            return docDate.getFullYear() === 2024 && docDate.getMonth() === 6;
          });
          break;
        case 'august':
          filtered = filtered.filter(doc => {
            const docDate = new Date(doc.uploadedDate);
            return docDate.getFullYear() === 2024 && docDate.getMonth() === 7;
          });
          break;
        case 'september':
          filtered = filtered.filter(doc => {
            const docDate = new Date(doc.uploadedDate);
            return docDate.getFullYear() === 2024 && docDate.getMonth() === 8;
          });
          break;
        case 'october':
          filtered = filtered.filter(doc => {
            const docDate = new Date(doc.uploadedDate);
            return docDate.getFullYear() === 2024 && docDate.getMonth() === 9;
          });
          break;
        case 'november':
          filtered = filtered.filter(doc => {
            const docDate = new Date(doc.uploadedDate);
            return docDate.getFullYear() === 2024 && docDate.getMonth() === 10;
          });
          break;
        case 'december':
          filtered = filtered.filter(doc => {
            const docDate = new Date(doc.uploadedDate);
            return docDate.getFullYear() === 2024 && docDate.getMonth() === 11;
          });
          break;
      }
    }

    if (documentsDateRange) {
      filtered = filtered.filter(doc => {
        const docDate = new Date(doc.uploadedDate);
        const startDate = new Date(documentsDateRange.start);
        const endDate = new Date(documentsDateRange.end);
        return docDate >= startDate && docDate <= endDate;
      });
    }

    return filtered.sort((a, b) => new Date(b.uploadedDate).getTime() - new Date(a.uploadedDate).getTime());
  }, [project.documents, documentsTypeFilter, documentsDateFilter, documentsDateRange]);

  // ========================================
  // EVENT HANDLERS
  // ========================================

  const handleAddTimelineEntry = () => {
    if (!newTimelineEntry.title || !newTimelineEntry.description || !newTimelineEntry.date) {
      toast.error('Please fill in all required fields');
      return;
    }

    const entry: TimelineEntry = {
      id: `timeline-${Date.now()}`,
      ...newTimelineEntry
    };

    setProject(prev => ({
      ...prev,
      timeline: [entry, ...prev.timeline]
    }));

    setNewTimelineEntry({
      title: '',
      description: '',
      date: '',
      status: 'planned',
      type: 'daily',
      phase: '',
      contractor: '',
      remarks: ''
    });

    setShowAddTimelineModal(false);
    toast.success('Timeline entry added successfully');
  };

  const handleEditTimelineEntry = () => {
    if (!editingTimelineEntry) return;

    setProject(prev => ({
      ...prev,
      timeline: prev.timeline.map(entry => 
        entry.id === editingTimelineEntry.id 
          ? editingTimelineEntry 
          : entry
      )
    }));
    
    setEditingTimelineEntry(null);
    toast.success('Timeline entry updated successfully');
  };

  const handleDeleteTimelineEntry = (entryId: string) => {
    setProject(prev => ({
      ...prev,
      timeline: prev.timeline.filter(entry => entry.id !== entryId)
    }));
    
    setShowDeleteTimelineModal(null);
    toast.success('Timeline entry deleted successfully');
  };

  // ========================================
  // CRUD HANDLERS FOR PROJECT SECTIONS
  // ========================================

  const handleSaveProjectInfo = () => {
    setProject(prev => ({
      ...prev,
      title: tempProjectInfo.title,
      description: tempProjectInfo.description,
      budget: tempProjectInfo.budget,
      contractor: tempProjectInfo.contractor,
      location: tempProjectInfo.location,
      beneficiaries: tempProjectInfo.beneficiaries,
      startDate: tempProjectInfo.startDate,
      targetEndDate: tempProjectInfo.targetEndDate
    }));
    
    setEditingProjectInfo(false);
    toast.success('Project information updated successfully');
  };

  const handleCancelProjectInfo = () => {
    setTempProjectInfo({
      title: project.title,
      description: project.description,
      budget: project.budget,
      contractor: project.contractor,
      location: project.location,
      beneficiaries: project.beneficiaries,
      startDate: project.startDate,
      targetEndDate: project.targetEndDate
    });
    setEditingProjectInfo(false);
  };

  const handleSaveFinancialData = () => {
    setProject(prev => ({
      ...prev,
      financialAllocation: [...tempFinancialData]
    }));
    
    setEditingFinancial(false);
    toast.success('Financial data updated successfully');
  };

  const handleCancelFinancialData = () => {
    setTempFinancialData([...project.financialAllocation]);
    setEditingFinancial(false);
  };

  const handleSavePhysicalData = () => {
    setProject(prev => ({
      ...prev,
      physicalAccomplishment: [...tempPhysicalData]
    }));
    
    setEditingPhysical(false);
    toast.success('Physical accomplishment data updated successfully');
  };

  const handleCancelPhysicalData = () => {
    setTempPhysicalData([...project.physicalAccomplishment]);
    setEditingPhysical(false);
  };

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================

  const CircularProgress = ({ value, label, color = "#10b981", size = 80 }: { 
    value: number; 
    label: string; 
    color?: string; 
    size?: number;
  }) => {
    const radius = (size - 8) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = `${circumference} ${circumference}`;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
      <div className="flex flex-col items-center">
        <div className="relative" style={{ width: size, height: size }}>
          <svg
            className="transform -rotate-90"
            width={size}
            height={size}
          >
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#e5e7eb"
              strokeWidth="4"
              fill="transparent"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={color}
              strokeWidth="4"
              fill="transparent"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-300 ease-in-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-semibold" style={{ color }}>{value.toFixed(1)}%</div>
              {label && <div className="text-xs text-gray-500 mt-1">{label}</div>}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed': case 'Completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'ongoing': case 'On Track': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'planned': case 'Ahead': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'delayed': case 'Behind': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Ongoing': return <PlayCircle className="h-3 w-3" />;
      case 'Completed': return <CheckCircle2 className="h-3 w-3" />;
      case 'Planned': return <Clock className="h-3 w-3" />;
      default: return null;
    }
  };

  const getVarianceColor = (variance: number) => {
    if (variance >= 0) return 'text-emerald-600';
    if (variance >= -15) return 'text-amber-600';
    return 'text-red-600';
  };

  const getVarianceBgColor = (variance: number) => {
    if (variance >= 0) return 'bg-emerald-50 border-emerald-200';
    if (variance >= -15) return 'bg-amber-50 border-amber-200';
    return 'bg-red-50 border-red-200';
  };

  // ========================================
  // RENDER FUNCTIONS
  // ========================================

  const renderOverviewTab = () => (
    <div className="space-y-8">
      {/* Two-Column Layout: Gallery and Progress Overview - Fixed Height Matching */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT COLUMN - Photo Gallery (Exactly 3 photos, matching height) */}
        <div className="flex flex-col h-full">
          <Card className="border-emerald-200 shadow-lg flex-1 flex flex-col">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-white">
              <CardTitle className="text-lg text-emerald-800 flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Project Gallery
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 flex-1 flex flex-col">
              {/* Featured Images Grid - Exactly 3 photos with matching heights */}
              <div className="grid grid-cols-1 gap-4 flex-1">
                {/* Main Featured Image - Takes up more space */}
                {project.gallery.filter(img => img.status === 'featured').slice(0, 1).map((image) => (
                  <div key={image.id} className="group relative cursor-pointer flex-1" onClick={() => setSelectedImage(image)}>
                    <div className="h-full rounded-lg overflow-hidden bg-gray-100 min-h-[200px]">
                      <img
                        src={image.url}
                        alt={image.caption}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-lg" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <Badge className="bg-emerald-600 text-white mb-2">
                        {image.category}
                      </Badge>
                      <h4 className="text-white font-medium text-sm mb-1">{image.caption}</h4>
                      <p className="text-white/80 text-xs">
                        {new Date(image.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                    <div className="absolute top-4 right-4">
                      <div className="bg-white/80 backdrop-blur-sm rounded-full p-2">
                        <Eye className="h-4 w-4 text-gray-700" />
                      </div>
                    </div>
                  </div>
                ))}

                {/* Two Secondary Images - Equal heights */}
                <div className="grid grid-cols-2 gap-3 min-h-[120px]">
                  {project.gallery.filter(img => img.status !== 'featured').slice(0, 2).map((image) => (
                    <div key={image.id} className="group relative cursor-pointer" onClick={() => setSelectedImage(image)}>
                      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={image.url}
                          alt={image.caption}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Badge className="bg-white/90 text-gray-800 text-xs mb-1">
                          {image.category}
                        </Badge>
                        <p className="text-white text-xs font-medium truncate">{image.caption}</p>
                      </div>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-white/80 backdrop-blur-sm rounded-full p-1.5">
                          <Eye className="h-3 w-3 text-gray-700" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* View All Gallery Button */}
                <Button
                  variant="outline"
                  onClick={() => setActiveTab('gallery')}
                  className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 mt-4"
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  View All Photos ({project.gallery.length})
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN - Project Progress Overview - Matching height */}
        <div className="flex flex-col h-full">
          {/* Progress Statistics Cards */}
          <Card className="border-emerald-200 shadow-lg flex-1 flex flex-col">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-white">
              <CardTitle className="text-lg text-emerald-800 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Progress Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 pb-4 h-full flex flex-col">
              {/* Performance Analytics Dashboard - Optimized Layout */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Financial Performance - Enhanced with CRUD */}
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-4 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-emerald-800">Financial Performance</h4>
                    {canEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingFinancial(!editingFinancial)}
                        className="h-6 w-6 p-0 text-emerald-600 hover:text-emerald-700"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-center mb-4">
                    <CircularProgress 
                      value={financialUtilization} 
                      label="Utilized"
                      color="#10b981"
                      size={85}
                    />
                  </div>

                  {/* Financial Metrics Grid */}
                  <div className="space-y-2 text-xs flex-1">
                    <div className="bg-white/70 rounded-lg p-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Target Budget</span>
                        <span className="font-semibold text-gray-900">₱{(project.budget / 1000000).toFixed(1)}M</span>
                      </div>
                    </div>
                    <div className="bg-white/70 rounded-lg p-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Actual Spent</span>
                        <span className="font-semibold text-emerald-700">
                          ₱{(project.financialAllocation.reduce((sum, item) => sum + item.actual, 0) / 1000000).toFixed(1)}M
                        </span>
                      </div>
                    </div>
                    <div className="bg-white/70 rounded-lg p-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Variance</span>
                        <span className={`font-semibold ${
                          financialUtilization >= 85 ? 'text-emerald-600' : 
                          financialUtilization >= 70 ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {financialUtilization >= 100 ? '+' : ''}{(financialUtilization - 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="mt-3 text-center">
                    <Badge className={`text-xs ${
                      financialUtilization >= 85 ? 'bg-emerald-600 text-white' : 
                      financialUtilization >= 70 ? 'bg-amber-500 text-white' : 
                      'bg-red-500 text-white'
                    }`}>
                      {financialUtilization >= 85 ? 'Excellent' : 
                       financialUtilization >= 70 ? 'Good' : 'Needs Attention'}
                    </Badge>
                  </div>
                </div>

                {/* Physical Performance - Enhanced with CRUD */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-blue-800">Physical Performance</h4>
                    {canEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingPhysical(!editingPhysical)}
                        className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-center mb-4">
                    <CircularProgress 
                      value={avgPhysicalProgress} 
                      label="Complete"
                      color="#3b82f6"
                      size={85}
                    />
                  </div>

                  {/* Physical Metrics Grid */}
                  <div className="space-y-2 text-xs flex-1">
                    <div className="bg-white/70 rounded-lg p-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Target Progress</span>
                        <span className="font-semibold text-gray-900">
                          {((project.physicalAccomplishment.reduce((sum, p) => sum + p.target, 0) / project.physicalAccomplishment.length) || 0).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="bg-white/70 rounded-lg p-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Actual Progress</span>
                        <span className="font-semibold text-blue-700">{avgPhysicalProgress.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="bg-white/70 rounded-lg p-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Phases Done</span>
                        <span className="font-semibold text-blue-700">
                          {project.physicalAccomplishment.filter(p => p.status === 'Completed').length}/{project.physicalAccomplishment.length}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="mt-3 text-center">
                    <Badge className={`text-xs ${
                      avgPhysicalProgress >= 85 ? 'bg-blue-600 text-white' : 
                      avgPhysicalProgress >= 70 ? 'bg-amber-500 text-white' : 
                      'bg-red-500 text-white'
                    }`}>
                      {avgPhysicalProgress >= 85 ? 'On Schedule' : 
                       avgPhysicalProgress >= 70 ? 'Minor Delays' : 'Critical Delays'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Project Health Monitor - Formal Design */}
              <div className="bg-white border border-gray-300 rounded-lg p-4 mb-4 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      project.progress >= 85 ? 'bg-gray-600' : 
                      project.progress >= 70 ? 'bg-gray-500' : 'bg-gray-400'
                    }`} />
                    <h4 className="text-sm font-semibold text-gray-800">Project Health Monitor</h4>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-800">{project.progress}%</div>
                    <div className="text-xs text-gray-500">Overall Progress</div>
                  </div>
                </div>
                
                {/* Formal Progress Bar */}
                <div className="relative mb-4">
                  <div className="w-full bg-gray-200 rounded h-2 overflow-hidden">
                    <div 
                      className="h-full bg-gray-600 rounded transition-all duration-500 ease-out"
                      style={{ width: `${Math.min(project.progress, 100)}%` }}
                    />
                  </div>
                  {/* Progress Markers */}
                  <div className="absolute top-0 left-1/4 w-px h-2 bg-gray-400" />
                  <div className="absolute top-0 left-1/2 w-px h-2 bg-gray-400" />
                  <div className="absolute top-0 left-3/4 w-px h-2 bg-gray-400" />
                </div>
                
                {/* Key Performance Indicators - Formal Grid */}
                <div className="grid grid-cols-4 gap-4 text-xs border-t border-gray-200 pt-3">
                  <div className="text-center">
                    <div className="text-gray-600 mb-1 font-medium">Budget</div>
                    <div className="font-bold text-base text-gray-800">
                      {financialUtilization.toFixed(0)}%
                    </div>
                    <div className="w-full bg-gray-200 rounded h-1 mt-2">
                      <div 
                        className="h-1 rounded bg-gray-600 transition-all duration-500"
                        style={{ width: `${Math.min(financialUtilization, 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {financialUtilization >= 80 ? 'On Track' : 
                       financialUtilization >= 60 ? 'Monitor' : 'Review Required'}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-gray-600 mb-1 font-medium">Physical</div>
                    <div className="font-bold text-base text-gray-800">
                      {avgPhysicalProgress.toFixed(0)}%
                    </div>
                    <div className="w-full bg-gray-200 rounded h-1 mt-2">
                      <div 
                        className="h-1 rounded bg-gray-600 transition-all duration-500"
                        style={{ width: `${Math.min(avgPhysicalProgress, 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {avgPhysicalProgress >= 80 ? 'On Schedule' : 
                       avgPhysicalProgress >= 60 ? 'Minor Delays' : 'Attention Needed'}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-gray-600 mb-1 font-medium">Schedule</div>
                    <div className="font-bold text-base text-gray-800">
                      {project.status === 'On Track' ? 'On Time' : 
                       project.status === 'Ongoing' ? 'Active' : project.status}
                    </div>
                    <div className="w-full bg-gray-200 rounded h-1 mt-2">
                      <div 
                        className="h-1 rounded bg-gray-600 transition-all duration-500"
                        style={{ width: `${Math.min(project.progress, 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {project.progress >= 80 ? 'Ahead' : 
                       project.progress >= 60 ? 'Normal' : 'Behind'}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-gray-600 mb-1 font-medium">Quality</div>
                    <div className="font-bold text-base text-gray-800">Excellent</div>
                    <div className="w-full bg-gray-200 rounded h-1 mt-2">
                      <div className="h-1 rounded bg-gray-600 transition-all duration-500" style={{ width: '92%' }} />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Standards Met</div>
                  </div>
                </div>
                
                {/* Target Completion Info - Formal Layout */}
                <div className="mt-4 pt-3 border-t border-gray-200 grid grid-cols-2 gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3 text-gray-500" />
                    <div>
                      <span className="text-gray-500">Target Completion:</span>
                      <div className="font-medium text-gray-800">
                        {new Date(project.targetEndDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-gray-500" />
                    <div>
                      <span className="text-gray-500">Days Remaining:</span>
                      <div className="font-medium text-gray-800">
                        {Math.ceil((new Date(project.targetEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Analytics Cards - Enhanced Metrics */}
              <div className="grid grid-cols-2 gap-3">
                {/* Financial Efficiency Card - Enhanced with CRUD */}
                <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white shadow-sm hover:shadow-md transition-all duration-200">
                  <CardContent className="pt-3 pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="bg-emerald-100 p-1.5 rounded-lg">
                        <BarChart3 className="h-4 w-4 text-emerald-600" />
                      </div>
                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingFinancial(!editingFinancial)}
                          className="h-5 w-5 p-0 text-emerald-600 hover:text-emerald-700"
                        >
                          <Edit className="h-2.5 w-2.5" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="text-center">
                      <div className="text-xl font-bold text-emerald-700 mb-1">
                        {((financialUtilization / 100) * project.progress).toFixed(1)}%
                      </div>
                      <p className="text-xs text-gray-600 leading-tight mb-2">Financial Efficiency</p>
                      
                      {/* Mini Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                        <div 
                          className="h-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-500"
                          style={{ width: `${Math.min(((financialUtilization / 100) * project.progress), 100)}%` }}
                        />
                      </div>
                      
                      <div className="flex items-center justify-center gap-1">
                        {financialUtilization >= 85 ? (
                          <TrendingUp className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-500" />
                        )}
                        <span className="text-xs text-gray-500">
                          {financialUtilization >= 85 ? 'Excellent' : 'Needs Improvement'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Project Velocity Card - Enhanced with CRUD */}
                <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white shadow-sm hover:shadow-md transition-all duration-200">
                  <CardContent className="pt-3 pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="bg-blue-100 p-1.5 rounded-lg">
                        <Clock className="h-4 w-4 text-blue-600" />
                      </div>
                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingPhysical(!editingPhysical)}
                          className="h-5 w-5 p-0 text-blue-600 hover:text-blue-700"
                        >
                          <Edit className="h-2.5 w-2.5" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="text-center">
                      <div className="text-xl font-bold text-blue-700 mb-1">
                        {(project.progress / ((Date.now() - new Date(project.startDate).getTime()) / (new Date(project.targetEndDate).getTime() - new Date(project.startDate).getTime()) * 100) || 1).toFixed(1)}x
                      </div>
                      <p className="text-xs text-gray-600 leading-tight mb-2">Project Velocity</p>
                      
                      {/* Mini Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                        <div 
                          className="h-1.5 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500"
                          style={{ width: `${Math.min(project.progress, 100)}%` }}
                        />
                      </div>
                      
                      <div className="flex items-center justify-center gap-1">
                        {project.progress >= 70 ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <AlertCircle className="h-3 w-3 text-amber-500" />
                        )}
                        <span className="text-xs text-gray-500">
                          {project.progress >= 70 ? 'On Track' : 'Monitor Closely'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Project Information Summary - CRUD Enabled */}
      <Card className="border-emerald-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-white">
          <CardTitle className="text-lg text-emerald-800 flex items-center gap-2">
            Project Information
            {canEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingProjectInfo(!editingProjectInfo)}
                className="ml-auto text-emerald-700 hover:text-emerald-800"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {editingProjectInfo ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="project-title">Project Title</Label>
                  <Input
                    id="project-title"
                    value={tempProjectInfo.title}
                    onChange={(e) => setTempProjectInfo(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="project-contractor">Contractor</Label>
                  <Input
                    id="project-contractor"
                    value={tempProjectInfo.contractor}
                    onChange={(e) => setTempProjectInfo(prev => ({ ...prev, contractor: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="project-location">Location</Label>
                  <Input
                    id="project-location"
                    value={tempProjectInfo.location}
                    onChange={(e) => setTempProjectInfo(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="project-budget">Budget</Label>
                  <Input
                    id="project-budget"
                    type="number"
                    value={tempProjectInfo.budget}
                    onChange={(e) => setTempProjectInfo(prev => ({ ...prev, budget: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="project-beneficiaries">Beneficiaries</Label>
                  <Input
                    id="project-beneficiaries"
                    type="number"
                    value={tempProjectInfo.beneficiaries}
                    onChange={(e) => setTempProjectInfo(prev => ({ ...prev, beneficiaries: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="project-start-date">Start Date</Label>
                  <Input
                    id="project-start-date"
                    type="date"
                    value={tempProjectInfo.startDate.split('T')[0]}
                    onChange={(e) => setTempProjectInfo(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="project-end-date">Target End Date</Label>
                  <Input
                    id="project-end-date"
                    type="date"
                    value={tempProjectInfo.targetEndDate.split('T')[0]}
                    onChange={(e) => setTempProjectInfo(prev => ({ ...prev, targetEndDate: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="project-description">Description</Label>
                <Textarea
                  id="project-description"
                  value={tempProjectInfo.description}
                  onChange={(e) => setTempProjectInfo(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveProjectInfo} className="bg-emerald-600 hover:bg-emerald-700">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={handleCancelProjectInfo}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-700 leading-relaxed mb-6">
                {project.overview.summary}
              </p>

              {/* Project Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <div>
                  <Label className="text-xs text-gray-500">Total Budget</Label>
                  <p className="text-sm text-gray-900 font-medium">₱ {project.budget.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Contractor</Label>
                  <p className="text-sm text-gray-900">{project.contractor}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Location</Label>
                  <p className="text-sm text-gray-900">{project.location}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Beneficiaries</Label>
                  <p className="text-sm text-gray-900">{project.beneficiaries.toLocaleString()} students</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Start Date</Label>
                  <p className="text-sm text-gray-900">
                    {new Date(project.startDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Target End Date</Label>
                  <p className="text-sm text-gray-900">
                    {new Date(project.targetEndDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>

              {/* Project Objectives */}
              <div className="mb-6">
                <h4 className="text-base text-gray-900 mb-3">Project Objectives</h4>
                <ul className="space-y-2">
                  {project.overview.objectives.map((objective, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Key Features */}
              <div>
                <h4 className="text-base text-gray-900 mb-3">Key Features</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {project.overview.keyFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm text-gray-700">
                      <Target className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Financial Accomplishment - Enhanced with specific data (SWAPPED TO FIRST POSITION) */}
      <Card className="border-blue-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-white">
          <CardTitle className="text-lg text-blue-800 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Financial Accomplishment
            {canEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingFinancial(!editingFinancial)}
                className="ml-auto text-blue-700 hover:text-blue-800"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {editingFinancial ? (
            <div className="space-y-4">
              <div className="space-y-4">
                {tempFinancialData.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <Label htmlFor={`financial-category-${index}`}>Category</Label>
                        <Input
                          id={`financial-category-${index}`}
                          value={item.category}
                          onChange={(e) => {
                            const newData = [...tempFinancialData];
                            newData[index].category = e.target.value;
                            setTempFinancialData(newData);
                          }}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`financial-target-${index}`}>Target</Label>
                        <Input
                          id={`financial-target-${index}`}
                          type="number"
                          value={item.target}
                          onChange={(e) => {
                            const newData = [...tempFinancialData];
                            const target = parseFloat(e.target.value) || 0;
                            newData[index].target = target;
                            newData[index].variance = newData[index].actual - target;
                            newData[index].variancePercentage = target > 0 ? ((newData[index].actual - target) / target) * 100 : 0;
                            setTempFinancialData(newData);
                          }}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`financial-actual-${index}`}>Actual</Label>
                        <Input
                          id={`financial-actual-${index}`}
                          type="number"
                          value={item.actual}
                          onChange={(e) => {
                            const newData = [...tempFinancialData];
                            const actual = parseFloat(e.target.value) || 0;
                            newData[index].actual = actual;
                            newData[index].variance = actual - newData[index].target;
                            newData[index].variancePercentage = newData[index].target > 0 ? ((actual - newData[index].target) / newData[index].target) * 100 : 0;
                            setTempFinancialData(newData);
                          }}
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            const newData = tempFinancialData.filter((_, i) => i !== index);
                            setTempFinancialData(newData);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      Variance: ₱{item.variance.toLocaleString()} ({item.variancePercentage.toFixed(1)}%)
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    const newItem: FinancialAllocation = {
                      category: 'New Category',
                      target: 0,
                      actual: 0,
                      variance: 0,
                      variancePercentage: 0
                    };
                    setTempFinancialData([...tempFinancialData, newItem]);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
                <Button onClick={handleSaveFinancialData} className="bg-blue-600 hover:bg-blue-700">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={handleCancelFinancialData}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Financial Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <Label className="text-xs text-gray-500">Target Budget</Label>
                    <p className="text-base text-gray-900 font-medium">₱ {project.budget.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Actual Utilization</Label>
                    <p className="text-base text-gray-900 font-medium">
                      ₱ {project.financialAllocation.reduce((sum, item) => sum + item.actual, 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Financial Accomplishment</Label>
                    <p className="text-base text-blue-600 font-medium">
                      {financialUtilization.toFixed(1)}% ({financialUtilization >= 40 ? 'On Track' : 'Below Target'})
                    </p>
                  </div>
                </div>
              </div>

              {/* Financial Breakdown */}
              {project.financialAllocation.map((item, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h5 className="text-sm text-gray-900 font-medium mb-1">{item.category}</h5>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={
                        item.variance >= 0 
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : item.variancePercentage >= -15
                          ? 'bg-amber-100 text-amber-800 border-amber-200'
                          : 'bg-red-100 text-red-800 border-red-200'
                      }>
                        {item.variance >= 0 ? 'On Track' : item.variancePercentage >= -15 ? 'Slight Delay' : 'Behind'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-xs mb-3">
                    <div>
                      <Label className="text-xs text-gray-500">Target</Label>
                      <p className="text-sm text-gray-900 font-medium">₱{item.target.toLocaleString()}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Actual</Label>
                      <p className="text-sm text-gray-900 font-medium">₱{item.actual.toLocaleString()}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Variance</Label>
                      <p className={`text-sm font-medium ${
                        item.variance >= 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {item.variance >= 0 ? '+' : ''}₱{item.variance.toLocaleString()}
                        <span className="ml-1">({item.variancePercentage.toFixed(1)}%)</span>
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        item.variance >= 0 
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                          : item.variancePercentage >= -15
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600'
                          : 'bg-gradient-to-r from-red-500 to-red-600'
                      }`}
                      style={{ width: `${Math.min((item.actual / item.target) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Physical Accomplishment by Phase - Enhanced with contractor details (SWAPPED TO SECOND POSITION) */}
      <Card className="border-green-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-white">
          <CardTitle className="text-lg text-green-800 flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Physical Accomplishment by Phase
            {canEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingPhysical(!editingPhysical)}
                className="ml-auto text-green-700 hover:text-green-800"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {editingPhysical ? (
            <div className="space-y-4">
              <div className="space-y-4">
                {tempPhysicalData.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label htmlFor={`physical-phase-${index}`}>Phase</Label>
                        <Input
                          id={`physical-phase-${index}`}
                          value={item.phase}
                          onChange={(e) => {
                            const newData = [...tempPhysicalData];
                            newData[index].phase = e.target.value;
                            setTempPhysicalData(newData);
                          }}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`physical-status-${index}`}>Status</Label>
                        <Select
                          value={item.status}
                          onValueChange={(value) => {
                            const newData = [...tempPhysicalData];
                            newData[index].status = value;
                            setTempPhysicalData(newData);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Completed">Completed</SelectItem>
                            <SelectItem value="Ongoing">Ongoing</SelectItem>
                            <SelectItem value="Planned">Planned</SelectItem>
                            <SelectItem value="Behind">Behind</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor={`physical-target-${index}`}>Target (%)</Label>
                        <Input
                          id={`physical-target-${index}`}
                          type="number"
                          value={item.target}
                          onChange={(e) => {
                            const newData = [...tempPhysicalData];
                            const target = parseFloat(e.target.value) || 0;
                            newData[index].target = target;
                            newData[index].variance = newData[index].actual - target;
                            setTempPhysicalData(newData);
                          }}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`physical-actual-${index}`}>Actual (%)</Label>
                        <Input
                          id={`physical-actual-${index}`}
                          type="number"
                          value={item.actual}
                          onChange={(e) => {
                            const newData = [...tempPhysicalData];
                            const actual = parseFloat(e.target.value) || 0;
                            newData[index].actual = actual;
                            newData[index].variance = actual - newData[index].target;
                            setTempPhysicalData(newData);
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor={`physical-description-${index}`}>Description</Label>
                      <Textarea
                        id={`physical-description-${index}`}
                        value={item.description}
                        onChange={(e) => {
                          const newData = [...tempPhysicalData];
                          newData[index].description = e.target.value;
                          setTempPhysicalData(newData);
                        }}
                        rows={2}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <div className="text-sm text-gray-600">
                        Variance: {item.variance.toFixed(1)}%
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          const newData = tempPhysicalData.filter((_, i) => i !== index);
                          setTempPhysicalData(newData);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    const newItem: PhysicalAccomplishment = {
                      phase: 'New Phase',
                      description: 'Phase description',
                      target: 0,
                      actual: 0,
                      variance: 0,
                      status: 'Planned'
                    };
                    setTempPhysicalData([...tempPhysicalData, newItem]);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Phase
                </Button>
                <Button onClick={handleSavePhysicalData} className="bg-green-600 hover:bg-green-700">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={handleCancelPhysicalData}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Physical Accomplishment Summary */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <Label className="text-xs text-gray-500">Overall Physical Progress</Label>
                    <p className="text-base text-green-600 font-medium">{avgPhysicalProgress.toFixed(1)}%</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Completed Phases</Label>
                    <p className="text-base text-gray-900 font-medium">
                      {project.physicalAccomplishment.filter(p => p.status === 'Completed').length} of {project.physicalAccomplishment.length}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Active Contractors</Label>
                    <p className="text-base text-gray-900 font-medium">3 Companies</p>
                  </div>
                </div>
              </div>

              {/* Enhanced Phase Details with Contractors */}
              <div className="space-y-4">
                {project.physicalAccomplishment.map((phase, index) => (
                  <div key={index} className={`border rounded-lg p-4 ${
                    phase.status === 'Completed' ? 'bg-emerald-50 border-emerald-200' :
                    phase.status === 'Ongoing' ? 'bg-blue-50 border-blue-200' :
                    phase.status === 'Behind' ? 'bg-red-50 border-red-200' :
                    'bg-amber-50 border-amber-200'
                  }`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h5 className="text-sm text-gray-900 font-medium mb-1">{phase.phase}</h5>
                        <p className="text-xs text-gray-600">{phase.description}</p>
                      </div>
                      <Badge className={getStatusBadgeColor(phase.status)}>
                        {phase.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-xs mb-3">
                      <div>
                        <Label className="text-xs text-gray-500">Target Progress</Label>
                        <p className="text-sm text-gray-900 font-medium">{phase.target}%</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Actual Progress</Label>
                        <p className="text-sm text-gray-900 font-medium">{phase.actual}%</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Variance</Label>
                        <p className={`text-sm font-medium ${getVarianceColor(phase.variance)}`}>
                          {phase.variance >= 0 ? '+' : ''}{phase.variance.toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          phase.status === 'Completed' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' :
                          phase.status === 'Ongoing' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                          phase.status === 'Behind' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                          'bg-gradient-to-r from-amber-500 to-amber-600'
                        }`}
                        style={{ width: `${Math.min(phase.actual, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderTimelineTab = () => (
    <div className="space-y-6">
      {/* Header with Enhanced Filters and Add Button */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg text-gray-900">Project Timeline</h3>
          {canEdit && (
            <Button
              onClick={() => setShowAddTimelineModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          )}
        </div>

        {/* Enhanced Filter Controls */}
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Type Filter */}
              <div>
                <Label htmlFor="timeline-type-filter" className="text-sm text-gray-600 mb-2 block">
                  Timeline Type
                </Label>
                <Select value={timelineFilter} onValueChange={(value: any) => setTimelineFilter(value)}>
                  <SelectTrigger id="timeline-type-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div>
                <Label htmlFor="timeline-status-filter" className="text-sm text-gray-600 mb-2 block">
                  Status
                </Label>
                <Select value={timelineStatusFilter} onValueChange={setTimelineStatusFilter}>
                  <SelectTrigger id="timeline-status-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="delayed">Delayed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Filter */}
              <div>
                <Label htmlFor="timeline-date-filter" className="text-sm text-gray-600 mb-2 block">
                  Date Range
                </Label>
                <Select value={timelineDateFilter} onValueChange={(value: any) => {
                  setTimelineDateFilter(value);
                  if (value !== 'custom') setTimelineDateRange(null);
                }}>
                  <SelectTrigger id="timeline-date-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="january">January 2024</SelectItem>
                    <SelectItem value="february">February 2024</SelectItem>
                    <SelectItem value="march">March 2024</SelectItem>
                    <SelectItem value="april">April 2024</SelectItem>
                    <SelectItem value="may">May 2024</SelectItem>
                    <SelectItem value="june">June 2024</SelectItem>
                    <SelectItem value="july">July 2024</SelectItem>
                    <SelectItem value="august">August 2024</SelectItem>
                    <SelectItem value="september">September 2024</SelectItem>
                    <SelectItem value="october">October 2024</SelectItem>
                    <SelectItem value="november">November 2024</SelectItem>
                    <SelectItem value="december">December 2024</SelectItem>
                    <SelectItem value="last-7-days">Last 7 Days</SelectItem>
                    <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                    <SelectItem value="last-90-days">Last 90 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Results Count */}
              <div className="flex items-end">
                <span className="text-sm text-gray-600">
                  Showing {filteredTimeline.length} of {project.timeline.length} entries
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline Entries */}
      {filteredTimeline.length === 0 ? (
        <Card className="border-gray-200">
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-600">No timeline entries found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTimeline.map((entry) => (
            <Card key={entry.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-base font-medium text-gray-900">{entry.title}</h4>
                      <Badge className={getStatusBadgeColor(entry.status)}>
                        {getStatusIcon(entry.status)}
                        <span className="ml-1">{entry.status}</span>
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {entry.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{entry.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(entry.date).toLocaleDateString()}</span>
                      </div>
                      {entry.phase && (
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          <span>{entry.phase}</span>
                        </div>
                      )}
                      {entry.contractor && (
                        <div className="flex items-center gap-1">
                          <Briefcase className="h-3 w-3" />
                          <span>{entry.contractor}</span>
                        </div>
                      )}
                    </div>
                    {entry.remarks && (
                      <p className="text-xs text-gray-500 mt-2 italic">{entry.remarks}</p>
                    )}
                  </div>
                  {canEdit && (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingTimelineEntry(entry)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDeleteTimelineModal(entry.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderGalleryTab = () => (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg text-gray-900">Project Gallery</h3>
        </div>

        {/* Filter Controls */}
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Date Filter */}
              <div>
                <Label htmlFor="gallery-date-filter" className="text-sm text-gray-600 mb-2 block">
                  Date Range
                </Label>
                <Select value={galleryDateFilter} onValueChange={(value: any) => {
                  setGalleryDateFilter(value);
                  if (value !== 'custom') setGalleryDateRange(null);
                }}>
                  <SelectTrigger id="gallery-date-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="january">January 2024</SelectItem>
                    <SelectItem value="february">February 2024</SelectItem>
                    <SelectItem value="march">March 2024</SelectItem>
                    <SelectItem value="april">April 2024</SelectItem>
                    <SelectItem value="may">May 2024</SelectItem>
                    <SelectItem value="june">June 2024</SelectItem>
                    <SelectItem value="july">July 2024</SelectItem>
                    <SelectItem value="august">August 2024</SelectItem>
                    <SelectItem value="september">September 2024</SelectItem>
                    <SelectItem value="october">October 2024</SelectItem>
                    <SelectItem value="november">November 2024</SelectItem>
                    <SelectItem value="december">December 2024</SelectItem>
                    <SelectItem value="last-7-days">Last 7 Days</SelectItem>
                    <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                    <SelectItem value="last-90-days">Last 90 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category Filter */}
              <div>
                <Label htmlFor="gallery-category-filter" className="text-sm text-gray-600 mb-2 block">
                  Category
                </Label>
                <Select value={galleryCategoryFilter} onValueChange={setGalleryCategoryFilter}>
                  <SelectTrigger id="gallery-category-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Before">Before</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Documentation">Documentation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Results Count */}
              <div className="flex items-end">
                <span className="text-sm text-gray-600">
                  Showing {filteredGallery.length} of {project.gallery.length} images
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gallery Grid with Uniform Containers - FIXED */}
      {filteredGallery.length === 0 ? (
        <Card className="border-gray-200">
          <CardContent className="py-12 text-center">
            <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-600">No images found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGallery.map((image) => (
            <Card key={image.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group border border-gray-200" onClick={() => setSelectedImage(image)}>
              {/* Uniform aspect ratio container - 4:3 Aspect Ratio for Professional Look */}
              <div className="aspect-[4/3] relative bg-gray-100 overflow-hidden">
                <img
                  src={image.url}
                  alt={image.caption}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                />
                {/* Professional overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-white/95 backdrop-blur-sm rounded-full p-3 shadow-lg">
                    <Eye className="h-5 w-5 text-gray-700" />
                  </div>
                </div>
                {/* Professional category badge */}
                <div className="absolute top-3 left-3">
                  <Badge className="bg-white/95 text-gray-800 text-xs font-medium border border-gray-200 shadow-sm">
                    {image.category}
                  </Badge>
                </div>
                {/* Featured badge - more professional */}
                {image.status === 'featured' && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-emerald-600 text-white text-xs font-medium shadow-sm">
                      Featured
                    </Badge>
                  </div>
                )}
                {/* Professional hover info overlay */}
                <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-white/95 backdrop-blur-sm rounded-lg p-2 shadow-lg">
                    <p className="text-xs font-medium text-gray-800 truncate">{image.caption}</p>
                    <p className="text-xs text-gray-600">
                      {new Date(image.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              </div>
              {/* Card content with EXACT HEIGHT - More Professional */}
              <CardContent className="pt-4 pb-4 h-24 flex flex-col justify-between bg-white">
                <h4 className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight">{image.caption}</h4>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-500">
                    {new Date(image.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Eye className="h-3 w-3" />
                    <span>View</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderDocumentsTab = () => (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg text-gray-900">Project Documents</h3>
        </div>

        {/* Filter Controls */}
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Document Type Filter */}
              <div>
                <Label htmlFor="documents-type-filter" className="text-sm text-gray-600 mb-2 block">
                  Document Type
                </Label>
                <Select value={documentsTypeFilter} onValueChange={setDocumentsTypeFilter}>
                  <SelectTrigger id="documents-type-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Proposal">Proposal</SelectItem>
                    <SelectItem value="Report">Report</SelectItem>
                    <SelectItem value="Plan">Plan</SelectItem>
                    <SelectItem value="Certification">Certification</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Filter */}
              <div>
                <Label htmlFor="documents-date-filter" className="text-sm text-gray-600 mb-2 block">
                  Upload Date
                </Label>
                <Select value={documentsDateFilter} onValueChange={(value: any) => {
                  setDocumentsDateFilter(value);
                  if (value !== 'custom') setDocumentsDateRange(null);
                }}>
                  <SelectTrigger id="documents-date-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="january">January 2024</SelectItem>
                    <SelectItem value="february">February 2024</SelectItem>
                    <SelectItem value="march">March 2024</SelectItem>
                    <SelectItem value="april">April 2024</SelectItem>
                    <SelectItem value="may">May 2024</SelectItem>
                    <SelectItem value="june">June 2024</SelectItem>
                    <SelectItem value="july">July 2024</SelectItem>
                    <SelectItem value="august">August 2024</SelectItem>
                    <SelectItem value="september">September 2024</SelectItem>
                    <SelectItem value="october">October 2024</SelectItem>
                    <SelectItem value="november">November 2024</SelectItem>
                    <SelectItem value="december">December 2024</SelectItem>
                    <SelectItem value="last-7-days">Last 7 Days</SelectItem>
                    <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                    <SelectItem value="last-90-days">Last 90 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Results Count */}
              <div className="flex items-end">
                <span className="text-sm text-gray-600">
                  Showing {filteredDocuments.length} of {project.documents.length} documents
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents Grid */}
      {filteredDocuments.length === 0 ? (
        <Card className="border-gray-200">
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-600">No documents found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredDocuments.map((doc) => (
            <Card key={doc.id} className="hover:shadow-lg transition-shadow border border-gray-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-1">{doc.name}</h4>
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <Badge variant="outline" className="text-xs">
                          {doc.type}
                        </Badge>
                        {doc.fileSize && (
                          <span className="flex items-center gap-1">
                            <span>•</span>
                            <span>{doc.fileSize}</span>
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <span>•</span>
                          <span>Uploaded {new Date(doc.uploadedDate).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}</span>
                        </span>
                        <Badge className={`text-xs ${
                          doc.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                          doc.status === 'draft' ? 'bg-amber-100 text-amber-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {doc.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('https://drive.google.com/drive/folders/1JnIc8Bv87LJXM8TT-birE1iy2u_NnrUj', '_blank')}
                    className="text-blue-600 border-blue-200 hover:bg-blue-50 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Document
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderTeamTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg text-gray-900">Project Team</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {project.team.map((member) => (
          <Card key={member.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-medium text-gray-900">{member.name}</h4>
                  <p className="text-sm text-gray-600">{member.role}</p>
                  <p className="text-sm text-gray-500 mb-2">{member.department}</p>
                  
                  {member.email && (
                    <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                      <Mail className="h-3 w-3" />
                      <span>{member.email}</span>
                    </div>
                  )}
                  
                  {member.phone && (
                    <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                      <Phone className="h-3 w-3" />
                      <span>{member.phone}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Badge className={
                      member.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                      member.status === 'inactive' ? 'bg-red-100 text-red-800' :
                      'bg-amber-100 text-amber-800'
                    }>
                      {member.status}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {member.type}
                    </Badge>
                  </div>

                  {member.responsibility && (
                    <p className="text-xs text-gray-600 mt-2 italic">{member.responsibility}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // ========================================
  // MAIN RENDER
  // ========================================

  return (
    <div className="min-h-screen bg-gray-50">
      <ClientNavbar 
        onNavigate={onNavigate}
        onSignIn={onSignIn}
        onSignOut={onSignOut}
        userRole={userRole}
        userProfile={userProfile}
        requireAuth={requireAuth}
        onAuthModalSignIn={onAuthModalSignIn}
        demoMode={demoMode}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink 
                onClick={() => onNavigate?.('client-home')}
                className="cursor-pointer hover:text-emerald-600"
              >
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink 
                onClick={() => onNavigate?.('client-construction-infrastructure', 'overview')}
                className="cursor-pointer hover:text-emerald-600"
              >
                Construction Infrastructure
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbPage className="text-emerald-600">
              {project.title}
            </BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => onNavigate?.('client-construction-infrastructure', 'overview')}
          className="mb-6 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Construction Infrastructure
        </Button>

        {/* Project Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.title}</h1>
              <p className="text-lg text-gray-600">{project.description}</p>
            </div>
            <div className="text-right">
              <Badge className={getStatusBadgeColor(project.status)}>
                {project.status}
              </Badge>
              <p className="text-sm text-gray-500 mt-1">{project.progress}% Complete</p>
            </div>
          </div>
        </div>

        {/* Tabs - Reordered: Overview, Timeline, Gallery, Documents, Team */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white border border-emerald-200 shadow-sm">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-emerald-50 transition-all"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="timeline" 
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-emerald-50 transition-all"
            >
              Timeline
            </TabsTrigger>
            <TabsTrigger 
              value="gallery" 
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-emerald-50 transition-all"
            >
              Gallery
            </TabsTrigger>
            <TabsTrigger 
              value="documents" 
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-emerald-50 transition-all"
            >
              Documents
            </TabsTrigger>
            <TabsTrigger 
              value="team" 
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-emerald-50 transition-all"
            >
              Team
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {renderOverviewTab()}
          </TabsContent>

          <TabsContent value="timeline" className="space-y-6">
            {renderTimelineTab()}
          </TabsContent>

          <TabsContent value="gallery" className="space-y-6">
            {renderGalleryTab()}
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            {renderDocumentsTab()}
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            {renderTeamTab()}
          </TabsContent>
        </Tabs>
      </div>

      {/* Image Full View Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              {selectedImage?.caption}
            </DialogTitle>
          </DialogHeader>
          
          {selectedImage && (
            <div className="space-y-4">
              {/* Full Size Image */}
              <div className="aspect-video w-full rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.caption}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Image Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-xs text-gray-500">Category</Label>
                  <p className="text-gray-900">{selectedImage.category}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Date Taken</Label>
                  <p className="text-gray-900">
                    {new Date(selectedImage.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Upload Date</Label>
                  <p className="text-gray-900">
                    {new Date(selectedImage.uploadedDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Status</Label>
                  <Badge className={
                    selectedImage.status === 'featured' 
                      ? 'bg-emerald-100 text-emerald-800'
                      : selectedImage.status === 'active'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }>
                    {selectedImage.status}
                  </Badge>
                </div>
              </div>
              
              {/* Description */}
              <div>
                <Label className="text-xs text-gray-500">Description</Label>
                <p className="text-sm text-gray-700 mt-1">{selectedImage.caption}</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedImage(null)}>
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
            {selectedImage && (
              <Button 
                onClick={() => window.open(selectedImage.url, '_blank')}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Original
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Timeline Add Modal */}
      <Dialog open={showAddTimelineModal} onOpenChange={setShowAddTimelineModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Timeline Entry</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="timeline-title" className="text-right">
                Title *
              </Label>
              <Input
                id="timeline-title"
                value={newTimelineEntry.title}
                onChange={(e) => setNewTimelineEntry(prev => ({ ...prev, title: e.target.value }))}
                className="col-span-3"
                placeholder="Enter timeline entry title"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="timeline-description" className="text-right">
                Description *
              </Label>
              <Textarea
                id="timeline-description"
                value={newTimelineEntry.description}
                onChange={(e) => setNewTimelineEntry(prev => ({ ...prev, description: e.target.value }))}
                className="col-span-3"
                placeholder="Enter detailed description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="timeline-date" className="text-right">
                Date *
              </Label>
              <Input
                id="timeline-date"
                type="date"
                value={newTimelineEntry.date}
                onChange={(e) => setNewTimelineEntry(prev => ({ ...prev, date: e.target.value }))}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="timeline-status" className="text-right">
                Status
              </Label>
              <Select value={newTimelineEntry.status} onValueChange={(value: any) => setNewTimelineEntry(prev => ({ ...prev, status: value }))}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="delayed">Delayed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="timeline-type" className="text-right">
                Type
              </Label>
              <Select value={newTimelineEntry.type} onValueChange={(value: any) => setNewTimelineEntry(prev => ({ ...prev, type: value }))}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="timeline-phase" className="text-right">
                Phase
              </Label>
              <Input
                id="timeline-phase"
                value={newTimelineEntry.phase}
                onChange={(e) => setNewTimelineEntry(prev => ({ ...prev, phase: e.target.value }))}
                className="col-span-3"
                placeholder="Project phase (optional)"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="timeline-contractor" className="text-right">
                Contractor
              </Label>
              <Input
                id="timeline-contractor"
                value={newTimelineEntry.contractor}
                onChange={(e) => setNewTimelineEntry(prev => ({ ...prev, contractor: e.target.value }))}
                className="col-span-3"
                placeholder="Contractor name (optional)"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="timeline-remarks" className="text-right">
                Remarks
              </Label>
              <Textarea
                id="timeline-remarks"
                value={newTimelineEntry.remarks}
                onChange={(e) => setNewTimelineEntry(prev => ({ ...prev, remarks: e.target.value }))}
                className="col-span-3"
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTimelineModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTimelineEntry} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Timeline Edit Modal */}
      <Dialog open={!!editingTimelineEntry} onOpenChange={() => setEditingTimelineEntry(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Timeline Entry</DialogTitle>
          </DialogHeader>
          
          {editingTimelineEntry && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-timeline-title" className="text-right">
                  Title *
                </Label>
                <Input
                  id="edit-timeline-title"
                  value={editingTimelineEntry.title}
                  onChange={(e) => setEditingTimelineEntry(prev => prev ? ({ ...prev, title: e.target.value }) : null)}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-timeline-description" className="text-right">
                  Description *
                </Label>
                <Textarea
                  id="edit-timeline-description"
                  value={editingTimelineEntry.description}
                  onChange={(e) => setEditingTimelineEntry(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                  className="col-span-3"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-timeline-date" className="text-right">
                  Date *
                </Label>
                <Input
                  id="edit-timeline-date"
                  type="date"
                  value={editingTimelineEntry.date.split('T')[0]}
                  onChange={(e) => setEditingTimelineEntry(prev => prev ? ({ ...prev, date: e.target.value }) : null)}
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-timeline-status" className="text-right">
                  Status
                </Label>
                <Select 
                  value={editingTimelineEntry.status} 
                  onValueChange={(value: any) => setEditingTimelineEntry(prev => prev ? ({ ...prev, status: value }) : null)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="delayed">Delayed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-timeline-type" className="text-right">
                  Type
                </Label>
                <Select 
                  value={editingTimelineEntry.type} 
                  onValueChange={(value: any) => setEditingTimelineEntry(prev => prev ? ({ ...prev, type: value }) : null)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-timeline-remarks" className="text-right">
                  Remarks
                </Label>
                <Textarea
                  id="edit-timeline-remarks"
                  value={editingTimelineEntry.remarks || ''}
                  onChange={(e) => setEditingTimelineEntry(prev => prev ? ({ ...prev, remarks: e.target.value }) : null)}
                  className="col-span-3"
                  rows={2}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTimelineEntry(null)}>
              Cancel
            </Button>
            <Button onClick={handleEditTimelineEntry} className="bg-emerald-600 hover:bg-emerald-700">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Timeline Delete Confirmation Modal */}
      <Dialog open={!!showDeleteTimelineModal} onOpenChange={() => setShowDeleteTimelineModal(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Timeline Entry</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete this timeline entry? This action cannot be undone.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteTimelineModal(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => showDeleteTimelineModal && handleDeleteTimelineEntry(showDeleteTimelineModal)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ProjectDetailPageRestored;