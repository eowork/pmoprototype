import React, { useState, useEffect, useMemo } from 'react';
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
  Wrench, 
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
  ExternalLink,
  Building2
} from 'lucide-react';
import { ClientNavbar } from '../components/ClientNavbar';
import { NavigationProps } from '../types';

// ========================================
// TYPE DEFINITIONS
// ========================================

interface RepairProjectDetailPageProps extends NavigationProps {
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

interface RepairProject {
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
  repairType?: string;
  priority?: string;
  affectedFacilities?: string[];
  emergencyRepair?: boolean;
  safetyCompliance?: boolean;
  sustainabilityFeatures?: string[];
  energyEfficiencyImpact?: string;
  varianceData?: any;
}

// Mock data for the repair project - exactly matching construction structure
const MOCK_REPAIR_PROJECT: RepairProject = {
  id: 'repair-001',
  title: 'Engineering Building HVAC System Emergency Repair',
  description: 'Critical repair of malfunctioning HVAC systems in engineering classrooms affecting student learning environment. This comprehensive repair project includes replacement of outdated equipment, system optimization, and preventive maintenance protocols.',
  contractor: 'TechCool HVAC Solutions Inc.',
  location: 'Engineering Building, Floors 2-4',
  budget: '₱2,500,000',
  budgetAmount: 2500000,
  progress: 78,
  status: 'Ongoing',
  startDate: '2024-11-01',
  targetEndDate: '2024-12-30',
  beneficiaries: 800,
  year: 2024,
  lastUpdated: '2024-12-01',
  category: 'emergency-repairs',
  repairType: 'HVAC System',
  priority: 'Critical',
  affectedFacilities: ['ENG 201-210', 'ENG 301-310', 'ENG 401-408'],
  emergencyRepair: true,
  safetyCompliance: true,
  sustainabilityFeatures: ['Energy-Efficient Units', 'Smart Temperature Control', 'Improved Air Filtration'],
  energyEfficiencyImpact: '30% reduction in energy consumption',
  overview: {
    summary: 'This emergency repair project addresses critical HVAC system failures in the Engineering Building that have been affecting the learning environment for over 800 students and faculty members. The project involves complete system replacement with modern, energy-efficient units.',
    objectives: [
      'Restore optimal temperature control in all affected classrooms',
      'Implement energy-efficient HVAC systems',
      'Ensure compliance with safety and environmental standards',
      'Minimize disruption to academic activities during repair process'
    ],
    keyFeatures: [
      'Smart temperature control systems',
      'High-efficiency air filtration units',
      'Automated maintenance monitoring',
      'Emergency backup systems'
    ],
    scope: 'Complete HVAC system replacement covering 24 classrooms across floors 2-4 of the Engineering Building, including ductwork, control systems, and air handling units.'
  },
  financialAllocation: [
    {
      category: 'Equipment & Materials',
      target: 1500000,
      actual: 1350000,
      variance: -150000,
      variancePercentage: -10.0
    },
    {
      category: 'Labor & Installation',
      target: 700000,
      actual: 580000,
      variance: -120000,
      variancePercentage: -17.1
    },
    {
      category: 'Testing & Commissioning',
      target: 200000,
      actual: 70000,
      variance: -130000,
      variancePercentage: -65.0
    },
    {
      category: 'Contingency',
      target: 100000,
      actual: 0,
      variance: -100000,
      variancePercentage: -100.0
    }
  ],
  physicalAccomplishment: [
    {
      phase: 'Phase 1: Assessment & Planning',
      description: 'Complete system assessment, planning, and procurement of materials',
      target: 100,
      actual: 100,
      variance: 0,
      status: 'Completed'
    },
    {
      phase: 'Phase 2: Equipment Installation',
      description: 'Installation of new HVAC units and ductwork systems',
      target: 90,
      actual: 85,
      variance: -5,
      status: 'Ongoing'
    },
    {
      phase: 'Phase 3: Testing & Commissioning',
      description: 'System testing, calibration, and final commissioning',
      target: 75,
      actual: 30,
      variance: -45,
      status: 'Behind'
    },
    {
      phase: 'Phase 4: Documentation & Handover',
      description: 'Final documentation, training, and project handover',
      target: 60,
      actual: 15,
      variance: -45,
      status: 'Planned'
    }
  ],
  gallery: [
    {
      id: 'img-1',
      url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop',
      caption: 'Engineering Building HVAC Installation Progress',
      category: 'In Progress',
      date: '2024-11-15',
      uploadedDate: '2024-11-15',
      status: 'featured'
    },
    {
      id: 'img-2',
      url: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=800&h=600&fit=crop',
      caption: 'Old HVAC System Before Replacement',
      category: 'Before',
      date: '2024-11-01',
      uploadedDate: '2024-11-01',
      status: 'active'
    },
    {
      id: 'img-3',
      url: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=600&fit=crop',
      caption: 'New Equipment Installation Process',
      category: 'In Progress',
      date: '2024-11-10',
      uploadedDate: '2024-11-10',
      status: 'active'
    },
    {
      id: 'img-4',
      url: 'https://images.unsplash.com/photo-1565182999561-18d7dc61c393?w=800&h=600&fit=crop',
      caption: 'Completed Installation - Floor 2',
      category: 'Completed',
      date: '2024-11-20',
      uploadedDate: '2024-11-20',
      status: 'active'
    }
  ],
  documents: [
    {
      id: 'doc-1',
      name: 'HVAC_System_Assessment_Report.pdf',
      type: 'Report',
      url: '#',
      uploadedDate: '2024-11-01',
      fileSize: '2.4 MB',
      status: 'active'
    },
    {
      id: 'doc-2',
      name: 'Safety_Compliance_Certificate.pdf',
      type: 'Certification',
      url: '#',
      uploadedDate: '2024-11-10',
      fileSize: '1.8 MB',
      status: 'active'
    },
    {
      id: 'doc-3',
      name: 'Contractor_Agreement.pdf',
      type: 'Proposal',
      url: '#',
      uploadedDate: '2024-10-30',
      fileSize: '3.2 MB',
      status: 'active'
    },
    {
      id: 'doc-4',
      name: 'Energy_Efficiency_Analysis.xlsx',
      type: 'Plan',
      url: '#',
      uploadedDate: '2024-11-15',
      fileSize: '1.1 MB',
      status: 'active'
    }
  ],
  team: [
    {
      id: 'tm-1',
      name: 'Engr. Maria Santos',
      role: 'Project Manager',
      position: 'Senior Engineer',
      department: 'Facilities Management',
      email: 'm.santos@carsu.edu.ph',
      phone: '+63 85 342 5555',
      status: 'active',
      type: 'staff',
      responsibility: 'Overall project coordination and technical oversight'
    },
    {
      id: 'tm-2',
      name: 'John Dela Cruz',
      role: 'Lead Technician',
      position: 'HVAC Specialist',
      department: 'External',
      status: 'active',
      type: 'contractor',
      contractorCompany: 'TechCool HVAC Solutions',
      responsibility: 'Installation and testing of HVAC equipment'
    },
    {
      id: 'tm-3',
      name: 'Dr. Roberto Martinez',
      role: 'Quality Assurance Lead',
      position: 'Engineering Manager',
      department: 'Engineering Services',
      email: 'r.martinez@carsu.edu.ph',
      phone: '+63 85 342 5556',
      status: 'active',
      type: 'staff',
      responsibility: 'Quality control and compliance monitoring'
    },
    {
      id: 'tm-4',
      name: 'Sarah Johnson',
      role: 'Safety Inspector',
      position: 'Safety Officer',
      department: 'External',
      status: 'active',
      type: 'contractor',
      contractorCompany: 'Safety First Inspections',
      responsibility: 'Safety compliance and inspection services'
    }
  ],
  timeline: [
    {
      id: 'tl-1',
      title: 'Phase 2 Equipment Installation Progress Update',
      description: 'Successfully completed installation of new HVAC units on floors 2 and 3. All units are now operational and undergoing initial testing.',
      date: '2024-11-25',
      status: 'completed',
      type: 'weekly',
      phase: 'Phase 2',
      contractor: 'TechCool HVAC Solutions',
      remarks: 'Installation ahead of schedule. Quality checks passed.'
    },
    {
      id: 'tl-2',
      title: 'Safety Inspection and Compliance Check',
      description: 'Conducted comprehensive safety inspection of installed systems. All safety protocols are being followed correctly.',
      date: '2024-11-20',
      status: 'completed',
      type: 'monthly',
      phase: 'Phase 2',
      contractor: 'Safety First Inspections',
      remarks: 'All safety standards met. Certification pending.'
    },
    {
      id: 'tl-3',
      title: 'Equipment Delivery and Staging',
      description: 'Received all major HVAC equipment and staged for installation. Quality inspection completed.',
      date: '2024-11-15',
      status: 'completed',
      type: 'weekly',
      phase: 'Phase 2',
      contractor: 'TechCool HVAC Solutions',
      remarks: 'All equipment in excellent condition.'
    },
    {
      id: 'tl-4',
      title: 'Phase 1 Assessment Completion',
      description: 'Completed comprehensive assessment of existing HVAC systems. Detailed plan for replacement developed.',
      date: '2024-11-10',
      status: 'completed',
      type: 'monthly',
      phase: 'Phase 1',
      contractor: 'TechCool HVAC Solutions',
      remarks: 'Assessment revealed more extensive damage than initially expected.'
    }
  ]
};

export default function RepairProjectDetailPage({
  onNavigate = () => {},
  onSignIn = () => {},
  onSignOut = () => {},
  onNavigateToDashboard = () => {},
  userRole = 'Client',
  userProfile = null,
  requireAuth = () => false,
  onAuthModalSignIn = async () => ({ success: false }),
  demoMode = false,
  projectId
}: RepairProjectDetailPageProps) {

  // ========================================
  // STATE MANAGEMENT - Exactly matching construction page
  // ========================================

  const getProjectData = (id?: string): RepairProject => {
    console.log('🎯 Loading repair project data for ID:', id);
    // In real implementation, this would fetch from RepairDataManager
    return MOCK_REPAIR_PROJECT;
  };

  const [project, setProject] = useState<RepairProject>(() => {
    console.log('📊 Initial repair project state with projectId:', projectId);
    return getProjectData(projectId);
  });
  const [activeTab, setActiveTab] = useState('overview');

  // Update project when projectId changes
  useEffect(() => {
    console.log('🔄 ProjectId changed to:', projectId);
    const newProject = getProjectData(projectId);
    console.log('📊 Loading repair project:', newProject.title);
    setProject(newProject);
  }, [projectId]);

  // Timeline state - exactly matching construction
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

  // Gallery state - exactly matching construction
  const [galleryDateFilter, setGalleryDateFilter] = useState<'all' | 'january' | 'february' | 'march' | 'april' | 'may' | 'june' | 'july' | 'august' | 'september' | 'october' | 'november' | 'december' | 'last-7-days' | 'last-30-days' | 'last-90-days' | 'custom'>('all');
  const [galleryDateRange, setGalleryDateRange] = useState<{ start: string; end: string } | null>(null);
  const [galleryCategoryFilter, setGalleryCategoryFilter] = useState<string>('all');
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  // Documents state - exactly matching construction
  const [documentsDateFilter, setDocumentsDateFilter] = useState<'all' | 'january' | 'february' | 'march' | 'april' | 'may' | 'june' | 'july' | 'august' | 'september' | 'october' | 'november' | 'december' | 'last-7-days' | 'last-30-days' | 'last-90-days' | 'custom'>('all');
  const [documentsDateRange, setDocumentsDateRange] = useState<{ start: string; end: string } | null>(null);
  const [documentsTypeFilter, setDocumentsTypeFilter] = useState<string>('all');

  // CRUD states for editing sections - exactly matching construction
  const [editingProjectInfo, setEditingProjectInfo] = useState(false);
  const [editingFinancial, setEditingFinancial] = useState(false);
  const [editingPhysical, setEditingPhysical] = useState(false);

  // Temporary editing states - exactly matching construction
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

  // Permission check - exactly matching construction
  const canEdit = useMemo(() => {
    return userProfile?.role === 'Admin' || userProfile?.role === 'Staff' || userRole === 'Admin' || userRole === 'Staff';
  }, [userProfile, userRole]);

  // ========================================
  // EVENT HANDLERS - Exactly matching construction structure
  // ========================================

  const handleBackToRepairs = () => {
    onNavigate?.('client-repairs', 'overview');
  };

  // Project Info CRUD
  const handleSaveProjectInfo = () => {
    setProject(prev => ({
      ...prev,
      ...tempProjectInfo
    }));
    setEditingProjectInfo(false);
    toast.success('Repair project information updated successfully');
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

  // Financial CRUD
  const handleSaveFinancialData = () => {
    setProject(prev => ({
      ...prev,
      financialAllocation: tempFinancialData
    }));
    setEditingFinancial(false);
    toast.success('Financial allocation data updated successfully');
  };

  const handleCancelFinancialData = () => {
    setTempFinancialData([...project.financialAllocation]);
    setEditingFinancial(false);
  };

  // Physical CRUD
  const handleSavePhysicalData = () => {
    setProject(prev => ({
      ...prev,
      physicalAccomplishment: tempPhysicalData
    }));
    setEditingPhysical(false);
    toast.success('Physical accomplishment data updated successfully');
  };

  const handleCancelPhysicalData = () => {
    setTempPhysicalData([...project.physicalAccomplishment]);
    setEditingPhysical(false);
  };

  // Timeline CRUD
  const handleAddTimelineEntry = () => {
    if (!newTimelineEntry.title || !newTimelineEntry.description || !newTimelineEntry.date) {
      toast.error('Please fill in all required fields');
      return;
    }

    const timelineEntry: TimelineEntry = {
      id: `tl-${Date.now()}`,
      ...newTimelineEntry
    };

    setProject(prev => ({
      ...prev,
      timeline: [timelineEntry, ...prev.timeline]
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

  const handleEditTimelineEntry = (entry: TimelineEntry) => {
    setEditingTimelineEntry(entry);
  };

  const handleUpdateTimelineEntry = () => {
    if (!editingTimelineEntry) return;

    setProject(prev => ({
      ...prev,
      timeline: prev.timeline.map(entry =>
        entry.id === editingTimelineEntry.id ? editingTimelineEntry : entry
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
  // UTILITY FUNCTIONS - Exactly matching construction
  // ========================================

  // Circular Progress Component - Exactly matching construction
  const CircularProgress = ({ value, label, color = "#dc2626", size = 80 }: { 
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // ========================================
  // RENDER FUNCTIONS - Exactly matching construction structure
  // ========================================

  const renderOverviewTab = () => (
    <div className="space-y-8">
      {/* Two-Column Layout: Gallery and Progress Overview - Fixed Height Matching */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT COLUMN - Photo Gallery (Exactly 3 photos, matching height) */}
        <div className="flex flex-col h-full">
          <Card className="border-red-200 shadow-lg flex-1 flex flex-col">
            <CardHeader className="bg-gradient-to-r from-red-50 to-white">
              <CardTitle className="text-lg text-red-800 flex items-center gap-2">
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
                      <Badge className="bg-red-600 text-white mb-2">
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
                  className="w-full border-red-200 text-red-700 hover:bg-red-50 mt-4"
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
          <Card className="border-red-200 shadow-lg flex-1 flex flex-col">
            <CardHeader className="bg-gradient-to-r from-red-50 to-white">
              <CardTitle className="text-lg text-red-800 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Progress Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 pb-4 h-full flex flex-col">
              {/* Performance Analytics Dashboard - Exactly matching construction */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Financial Performance - Enhanced with CRUD - Exactly matching construction */}
                <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-4 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-red-800">Financial Performance</h4>
                    {canEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingFinancial(!editingFinancial)}
                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-center mb-4">
                    <CircularProgress 
                      value={project.financialAllocation.length > 0 
                        ? (project.financialAllocation.reduce((sum, item) => sum + item.actual, 0) / project.financialAllocation.reduce((sum, item) => sum + item.target, 0)) * 100
                        : 0
                      } 
                      label="Utilized"
                      color="#dc2626"
                      size={85}
                    />
                  </div>

                  {/* Financial Metrics Grid - Exactly matching construction */}
                  <div className="space-y-2 text-xs flex-1">
                    <div className="bg-white/70 rounded-lg p-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Target Budget</span>
                        <span className="font-semibold text-gray-900">
                          ₱{(project.budgetAmount ? project.budgetAmount / 1000000 : 2.5).toFixed(1)}M
                        </span>
                      </div>
                    </div>
                    <div className="bg-white/70 rounded-lg p-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Actual Spent</span>
                        <span className="font-semibold text-red-700">
                          ₱{(project.financialAllocation.reduce((sum, item) => sum + item.actual, 0) / 1000000).toFixed(1)}M
                        </span>
                      </div>
                    </div>
                    <div className="bg-white/70 rounded-lg p-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Variance</span>
                        <span className={`font-semibold ${
                          project.financialAllocation.length > 0 && (project.financialAllocation.reduce((sum, item) => sum + item.actual, 0) / project.financialAllocation.reduce((sum, item) => sum + item.target, 0)) * 100 >= 85 ? 'text-red-600' : 
                          project.financialAllocation.length > 0 && (project.financialAllocation.reduce((sum, item) => sum + item.actual, 0) / project.financialAllocation.reduce((sum, item) => sum + item.target, 0)) * 100 >= 70 ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {project.financialAllocation.length > 0 
                            ? `${((project.financialAllocation.reduce((sum, item) => sum + item.actual, 0) / project.financialAllocation.reduce((sum, item) => sum + item.target, 0)) * 100 - 100).toFixed(1)}%`
                            : '0.0%'
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge - Exactly matching construction */}
                  <div className="mt-3 text-center">
                    <Badge className={`text-xs ${
                      project.financialAllocation.length > 0 && (project.financialAllocation.reduce((sum, item) => sum + item.actual, 0) / project.financialAllocation.reduce((sum, item) => sum + item.target, 0)) * 100 >= 85 ? 'bg-red-600 text-white' : 
                      project.financialAllocation.length > 0 && (project.financialAllocation.reduce((sum, item) => sum + item.actual, 0) / project.financialAllocation.reduce((sum, item) => sum + item.target, 0)) * 100 >= 70 ? 'bg-amber-500 text-white' : 
                      'bg-red-500 text-white'
                    }`}>
                      {project.financialAllocation.length > 0 && (project.financialAllocation.reduce((sum, item) => sum + item.actual, 0) / project.financialAllocation.reduce((sum, item) => sum + item.target, 0)) * 100 >= 85 ? 'Excellent' : 
                       project.financialAllocation.length > 0 && (project.financialAllocation.reduce((sum, item) => sum + item.actual, 0) / project.financialAllocation.reduce((sum, item) => sum + item.target, 0)) * 100 >= 70 ? 'Good' : 'Needs Attention'}
                    </Badge>
                  </div>
                </div>

                {/* Physical Performance - Enhanced with CRUD - Exactly matching construction */}
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
                      value={project.physicalAccomplishment.length > 0 
                        ? project.physicalAccomplishment.reduce((sum, p) => sum + p.actual, 0) / project.physicalAccomplishment.length
                        : 0
                      } 
                      label="Complete"
                      color="#3b82f6"
                      size={85}
                    />
                  </div>

                  {/* Physical Metrics Grid - Exactly matching construction */}
                  <div className="space-y-2 text-xs flex-1">
                    <div className="bg-white/70 rounded-lg p-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Target Progress</span>
                        <span className="font-semibold text-gray-900">
                          {project.physicalAccomplishment.length > 0 
                            ? ((project.physicalAccomplishment.reduce((sum, p) => sum + p.target, 0) / project.physicalAccomplishment.length) || 0).toFixed(1)
                            : '0.0'}%
                        </span>
                      </div>
                    </div>
                    <div className="bg-white/70 rounded-lg p-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Actual Progress</span>
                        <span className="font-semibold text-blue-700">
                          {project.physicalAccomplishment.length > 0 
                            ? (project.physicalAccomplishment.reduce((sum, p) => sum + p.actual, 0) / project.physicalAccomplishment.length).toFixed(1)
                            : '0.0'}%
                        </span>
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

                  {/* Status Badge - Exactly matching construction */}
                  <div className="mt-3 text-center">
                    <Badge className={`text-xs ${
                      project.physicalAccomplishment.length > 0 && (project.physicalAccomplishment.reduce((sum, p) => sum + p.actual, 0) / project.physicalAccomplishment.length) >= 85 ? 'bg-blue-600 text-white' : 
                      project.physicalAccomplishment.length > 0 && (project.physicalAccomplishment.reduce((sum, p) => sum + p.actual, 0) / project.physicalAccomplishment.length) >= 70 ? 'bg-amber-500 text-white' : 
                      'bg-red-500 text-white'
                    }`}>
                      {project.physicalAccomplishment.length > 0 && (project.physicalAccomplishment.reduce((sum, p) => sum + p.actual, 0) / project.physicalAccomplishment.length) >= 85 ? 'On Schedule' : 
                       project.physicalAccomplishment.length > 0 && (project.physicalAccomplishment.reduce((sum, p) => sum + p.actual, 0) / project.physicalAccomplishment.length) >= 70 ? 'Minor Delays' : 'Critical Delays'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Project Health Monitor - Exactly matching construction formal design */}
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
                
                {/* Formal Progress Bar - Exactly matching construction */}
                <div className="relative mb-4">
                  <div className="w-full bg-gray-200 rounded h-2 overflow-hidden">
                    <div 
                      className="h-full bg-gray-600 rounded transition-all duration-500 ease-out"
                      style={{ width: `${Math.min(project.progress, 100)}%` }}
                    />
                  </div>
                  {/* Progress Markers - Exactly matching construction */}
                  <div className="absolute top-0 left-1/4 w-px h-2 bg-gray-400" />
                  <div className="absolute top-0 left-1/2 w-px h-2 bg-gray-400" />
                  <div className="absolute top-0 left-3/4 w-px h-2 bg-gray-400" />
                </div>
                
                {/* Key Performance Indicators - Formal Grid - Exactly matching construction */}
                <div className="grid grid-cols-4 gap-4 text-xs border-t border-gray-200 pt-3">
                  <div className="text-center">
                    <div className="text-gray-600 mb-1 font-medium">Budget</div>
                    <div className="font-bold text-base text-gray-800">
                      {project.financialAllocation.length > 0 
                        ? ((project.financialAllocation.reduce((sum, item) => sum + item.actual, 0) / project.financialAllocation.reduce((sum, item) => sum + item.target, 0)) * 100).toFixed(0)
                        : '0'}%
                    </div>
                    <div className="w-full bg-gray-200 rounded h-1 mt-2">
                      <div 
                        className="h-1 rounded bg-gray-600 transition-all duration-500"
                        style={{ 
                          width: `${Math.min(
                            project.financialAllocation.length > 0 
                              ? (project.financialAllocation.reduce((sum, item) => sum + item.actual, 0) / project.financialAllocation.reduce((sum, item) => sum + item.target, 0)) * 100
                              : 0, 
                            100
                          )}%` 
                        }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {project.financialAllocation.length > 0 && (project.financialAllocation.reduce((sum, item) => sum + item.actual, 0) / project.financialAllocation.reduce((sum, item) => sum + item.target, 0)) * 100 >= 80 ? 'On Track' : 
                       project.financialAllocation.length > 0 && (project.financialAllocation.reduce((sum, item) => sum + item.actual, 0) / project.financialAllocation.reduce((sum, item) => sum + item.target, 0)) * 100 >= 60 ? 'Monitor' : 'Review Required'}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-gray-600 mb-1 font-medium">Physical</div>
                    <div className="font-bold text-base text-gray-800">
                      {project.physicalAccomplishment.length > 0 
                        ? (project.physicalAccomplishment.reduce((sum, p) => sum + p.actual, 0) / project.physicalAccomplishment.length).toFixed(0)
                        : '0'}%
                    </div>
                    <div className="w-full bg-gray-200 rounded h-1 mt-2">
                      <div 
                        className="h-1 rounded bg-gray-600 transition-all duration-500"
                        style={{ 
                          width: `${Math.min(
                            project.physicalAccomplishment.length > 0 
                              ? project.physicalAccomplishment.reduce((sum, p) => sum + p.actual, 0) / project.physicalAccomplishment.length
                              : 0, 
                            100
                          )}%` 
                        }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {project.physicalAccomplishment.length > 0 && (project.physicalAccomplishment.reduce((sum, p) => sum + p.actual, 0) / project.physicalAccomplishment.length) >= 80 ? 'On Schedule' : 
                       project.physicalAccomplishment.length > 0 && (project.physicalAccomplishment.reduce((sum, p) => sum + p.actual, 0) / project.physicalAccomplishment.length) >= 60 ? 'Minor Delays' : 'Attention Needed'}
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
                      {project.progress >= 80 ? 'On Time' : 
                       project.progress >= 60 ? 'Slight Delay' : 'Behind Schedule'}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-gray-600 mb-1 font-medium">Quality</div>
                    <div className="font-bold text-base text-gray-800">
                      {project.safetyCompliance ? 'High' : 'Standard'}
                    </div>
                    <div className="w-full bg-gray-200 rounded h-1 mt-2">
                      <div 
                        className="h-1 rounded bg-gray-600 transition-all duration-500"
                        style={{ width: project.safetyCompliance ? '90%' : '75%' }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {project.safetyCompliance ? 'Compliant' : 'Standard'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Information Grid */}
              <div className="grid grid-cols-1 gap-4 flex-1">
                <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-red-500" />
                    <span className="text-gray-600">Location:</span>
                    <span className="text-gray-900 font-medium">{project.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-red-500" />
                    <span className="text-gray-600">Timeline:</span>
                    <span className="text-gray-900 font-medium">
                      {new Date(project.startDate).toLocaleDateString()} - {new Date(project.targetEndDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Wrench className="h-4 w-4 text-red-500" />
                    <span className="text-gray-600">Type:</span>
                    <span className="text-gray-900 font-medium">{project.repairType}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-gray-600">Priority:</span>
                    <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">
                      {project.priority}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Project Overview Information Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Project Summary */}
        <Card className="border-red-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-red-50 to-white">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-red-800 flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Project Summary
              </CardTitle>
              {canEdit && !editingProjectInfo && (
                <Button
                  onClick={() => {
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
                    setEditingProjectInfo(true);
                  }}
                  variant="outline"
                  size="sm"
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {editingProjectInfo ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-title">Project Title</Label>
                  <Input
                    id="edit-title"
                    value={tempProjectInfo.title}
                    onChange={(e) => setTempProjectInfo(prev => ({ ...prev, title: e.target.value }))}
                    className="border-red-200 focus:border-red-400"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={tempProjectInfo.description}
                    onChange={(e) => setTempProjectInfo(prev => ({ ...prev, description: e.target.value }))}
                    className="border-red-200 focus:border-red-400"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="edit-budget">Budget</Label>
                    <Input
                      id="edit-budget"
                      value={tempProjectInfo.budget}
                      onChange={(e) => setTempProjectInfo(prev => ({ ...prev, budget: e.target.value }))}
                      className="border-red-200 focus:border-red-400"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-beneficiaries">Beneficiaries</Label>
                    <Input
                      id="edit-beneficiaries"
                      type="number"
                      value={tempProjectInfo.beneficiaries}
                      onChange={(e) => setTempProjectInfo(prev => ({ ...prev, beneficiaries: parseInt(e.target.value) || 0 }))}
                      className="border-red-200 focus:border-red-400"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleSaveProjectInfo} className="bg-green-600 hover:bg-green-700">
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
              <div className="space-y-4">
                <div>
                  <Label className="text-sm text-gray-600">Description</Label>
                  <p className="text-sm text-gray-900 mt-1">{project.overview.summary}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Budget</Label>
                  <p className="text-sm text-gray-900 mt-1">{project.budget}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Contractor</Label>
                  <p className="text-sm text-gray-900 mt-1">{project.contractor}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Beneficiaries</Label>
                  <p className="text-sm text-gray-900 mt-1">{project.beneficiaries.toLocaleString()} individuals</p>
                </div>
                {project.affectedFacilities && project.affectedFacilities.length > 0 && (
                  <div>
                    <Label className="text-sm text-gray-600">Affected Facilities</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {project.affectedFacilities.map((facility, index) => (
                        <Badge key={index} variant="outline" className="text-xs border-red-300 text-red-700">
                          {facility}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Key Objectives */}
        <Card className="border-red-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-red-50 to-white">
            <CardTitle className="text-lg text-red-800 flex items-center gap-2">
              <Target className="h-5 w-5" />
              Key Objectives
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {project.overview.objectives.map((objective, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-red-700 font-medium">{index + 1}</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{objective}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Key Features */}
        <Card className="border-red-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-red-50 to-white">
            <CardTitle className="text-lg text-red-800 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Key Features
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {project.overview.keyFeatures.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-red-600 flex-shrink-0 mt-1" />
                  <p className="text-sm text-gray-700 leading-relaxed">{feature}</p>
                </div>
              ))}
            </div>
            {project.sustainabilityFeatures && project.sustainabilityFeatures.length > 0 && (
              <div className="mt-4 pt-4 border-t border-red-100">
                <Label className="text-sm text-gray-600">Sustainability Features</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {project.sustainabilityFeatures.map((feature, index) => (
                    <Badge key={index} variant="outline" className="text-xs border-green-300 text-green-700">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Financial Allocation */}
      <Card className="border-red-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-red-50 to-white border-b border-red-200">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-red-800 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Financial Allocation
            </CardTitle>
            {canEdit && !editingFinancial && (
              <Button
                onClick={() => {
                  setTempFinancialData([...project.financialAllocation]);
                  setEditingFinancial(true);
                }}
                variant="outline"
                size="sm"
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Financial Data
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {editingFinancial ? (
            <div className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700 mb-4">Edit the financial allocation data below:</p>
                <div className="space-y-4">
                  {tempFinancialData.map((item, index) => (
                    <div key={index} className="bg-white border border-red-200 rounded-lg p-4 space-y-3">
                      <Input
                        value={item.category}
                        onChange={(e) => {
                          const updated = [...tempFinancialData];
                          updated[index].category = e.target.value;
                          setTempFinancialData(updated);
                        }}
                        placeholder="Category name"
                        className="border-red-200 focus:border-red-400"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          type="number"
                          value={item.target}
                          onChange={(e) => {
                            const updated = [...tempFinancialData];
                            updated[index].target = parseFloat(e.target.value) || 0;
                            updated[index].variance = updated[index].actual - updated[index].target;
                            updated[index].variancePercentage = updated[index].target > 0 
                              ? (updated[index].variance / updated[index].target) * 100 
                              : 0;
                            setTempFinancialData(updated);
                          }}
                          placeholder="Target amount"
                          className="border-red-200 focus:border-red-400"
                        />
                        <Input
                          type="number"
                          value={item.actual}
                          onChange={(e) => {
                            const updated = [...tempFinancialData];
                            updated[index].actual = parseFloat(e.target.value) || 0;
                            updated[index].variance = updated[index].actual - updated[index].target;
                            updated[index].variancePercentage = updated[index].target > 0 
                              ? (updated[index].variance / updated[index].target) * 100 
                              : 0;
                            setTempFinancialData(updated);
                          }}
                          placeholder="Actual amount"
                          className="border-red-200 focus:border-red-400"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <Button
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
                  Add Category
                </Button>
                <Button onClick={handleSaveFinancialData} className="bg-green-600 hover:bg-green-700">
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
              {project.financialAllocation.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border border-gray-200 rounded-lg">
                  <div>
                    <Label className="text-xs text-gray-500">Category</Label>
                    <p className="text-sm text-gray-900 font-medium">{item.category}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Target</Label>
                    <p className="text-sm text-gray-900">{formatCurrency(item.target)}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Actual</Label>
                    <p className="text-sm text-gray-900">{formatCurrency(item.actual)}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Variance</Label>
                    <p className={`text-sm font-medium ${getVarianceColor(item.variance)}`}>
                      {formatCurrency(item.variance)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Variance %</Label>
                    <p className={`text-sm font-medium ${getVarianceColor(item.variancePercentage)}`}>
                      {item.variancePercentage >= 0 ? '+' : ''}{item.variancePercentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Physical Accomplishment */}
      <Card className="border-red-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-red-50 to-white border-b border-red-200">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-red-800 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Physical Accomplishment
            </CardTitle>
            {canEdit && !editingPhysical && (
              <Button
                onClick={() => {
                  setTempPhysicalData([...project.physicalAccomplishment]);
                  setEditingPhysical(true);
                }}
                variant="outline"
                size="sm"
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Progress
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {editingPhysical ? (
            <div className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700 mb-4">Edit the physical accomplishment data below:</p>
                <div className="space-y-4">
                  {tempPhysicalData.map((phase, index) => (
                    <div key={index} className="bg-white border border-red-200 rounded-lg p-4 space-y-3">
                      <Input
                        value={phase.phase}
                        onChange={(e) => {
                          const updated = [...tempPhysicalData];
                          updated[index].phase = e.target.value;
                          setTempPhysicalData(updated);
                        }}
                        placeholder="Phase name"
                        className="border-red-200 focus:border-red-400"
                      />
                      <Input
                        value={phase.description}
                        onChange={(e) => {
                          const updated = [...tempPhysicalData];
                          updated[index].description = e.target.value;
                          setTempPhysicalData(updated);
                        }}
                        placeholder="Phase description"
                        className="border-red-200 focus:border-red-400"
                      />
                      <div className="grid grid-cols-3 gap-3">
                        <Input
                          type="number"
                          value={phase.target}
                          onChange={(e) => {
                            const updated = [...tempPhysicalData];
                            updated[index].target = parseFloat(e.target.value) || 0;
                            setTempPhysicalData(updated);
                          }}
                          placeholder="Target %"
                          className="border-red-200 focus:border-red-400"
                        />
                        <Input
                          type="number"
                          value={phase.actual}
                          onChange={(e) => {
                            const updated = [...tempPhysicalData];
                            updated[index].actual = parseFloat(e.target.value) || 0;
                            updated[index].variance = updated[index].actual - updated[index].target;
                            setTempPhysicalData(updated);
                          }}
                          placeholder="Actual %"
                          className="border-red-200 focus:border-red-400"
                        />
                        <Select
                          value={phase.status}
                          onValueChange={(value) => {
                            const updated = [...tempPhysicalData];
                            updated[index].status = value;
                            setTempPhysicalData(updated);
                          }}
                        >
                          <SelectTrigger className="border-red-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Planned">Planned</SelectItem>
                            <SelectItem value="Ongoing">Ongoing</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                            <SelectItem value="Behind">Behind</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <Button
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
                    <p className="text-base text-green-600 font-medium">
                      {project.physicalAccomplishment.length > 0 
                        ? (project.physicalAccomplishment.reduce((sum, phase) => sum + phase.actual, 0) / project.physicalAccomplishment.length).toFixed(1)
                        : 0}%
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Completed Phases</Label>
                    <p className="text-base text-gray-900 font-medium">
                      {project.physicalAccomplishment.filter(p => p.status === 'Completed').length} of {project.physicalAccomplishment.length}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Active Contractors</Label>
                    <p className="text-base text-gray-900 font-medium">
                      {project.team.filter(m => m.type === 'contractor').length} Companies
                    </p>
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
              className="bg-red-600 hover:bg-red-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          )}
        </div>

        {/* Enhanced Filter Controls */}
        <Card className="border-red-200">
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
                  Date Filter
                </Label>
                <Select value={timelineDateFilter} onValueChange={setTimelineDateFilter}>
                  <SelectTrigger id="timeline-date-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dates</SelectItem>
                    <SelectItem value="last-7-days">Last 7 Days</SelectItem>
                    <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                    <SelectItem value="last-90-days">Last 90 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Reset Button */}
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setTimelineFilter('all');
                    setTimelineStatusFilter('all');
                    setTimelineDateFilter('all');
                  }}
                  className="w-full border-red-300 text-red-700 hover:bg-red-50"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Reset Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline Entries */}
      <Card className="border-red-200 shadow-lg">
        <CardContent className="pt-6">
          <div className="space-y-6">
            {project.timeline
              .filter(entry => {
                if (timelineFilter !== 'all' && entry.type !== timelineFilter) return false;
                if (timelineStatusFilter !== 'all' && entry.status !== timelineStatusFilter) return false;
                // Add date filtering logic if needed
                return true;
              })
              .map((entry, index) => (
                <div key={entry.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${
                      entry.status === 'completed' ? 'bg-green-500' :
                      entry.status === 'ongoing' ? 'bg-blue-500' :
                      entry.status === 'delayed' ? 'bg-red-500' : 'bg-amber-500'
                    }`} />
                    {index < project.timeline.length - 1 && <div className="w-px h-16 bg-red-200 mt-2" />}
                  </div>
                  <div className="flex-1 min-w-0 pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium text-gray-900">{entry.title}</h4>
                        <Badge className={getStatusBadgeColor(entry.status)}>
                          {entry.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs border-red-300 text-red-700">
                          {entry.type}
                        </Badge>
                      </div>
                      {canEdit && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditTimelineEntry(entry)}
                            className="p-1 h-auto text-gray-400 hover:text-red-600"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowDeleteTimelineModal(entry.id)}
                            className="p-1 h-auto text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{entry.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{new Date(entry.date).toLocaleDateString()}</span>
                      {entry.phase && <span>Phase: {entry.phase}</span>}
                      {entry.contractor && <span>Contractor: {entry.contractor}</span>}
                    </div>
                    {entry.remarks && (
                      <p className="text-xs text-gray-500 mt-1 italic">Remarks: {entry.remarks}</p>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderGalleryTab = () => (
    <div className="space-y-6">
      {/* Gallery Filters */}
      <Card className="border-red-200">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            
            <div>
              <Label htmlFor="gallery-date-filter" className="text-sm text-gray-600 mb-2 block">
                Date Filter
              </Label>
              <Select value={galleryDateFilter} onValueChange={setGalleryDateFilter}>
                <SelectTrigger id="gallery-date-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="last-7-days">Last 7 Days</SelectItem>
                  <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                  <SelectItem value="last-90-days">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setGalleryCategoryFilter('all');
                  setGalleryDateFilter('all');
                }}
                className="w-full border-red-300 text-red-700 hover:bg-red-50"
              >
                <Filter className="h-4 w-4 mr-2" />
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gallery Grid */}
      <Card className="border-red-200 shadow-lg">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {project.gallery
              .filter(image => {
                if (galleryCategoryFilter !== 'all' && image.category !== galleryCategoryFilter) return false;
                // Add date filtering logic if needed
                return true;
              })
              .map((image) => (
                <div 
                  key={image.id}
                  className="group relative cursor-pointer"
                  onClick={() => setSelectedImage(image)}
                >
                  <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={image.url}
                      alt={image.caption}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Badge className="bg-red-600 text-white mb-2 text-xs">
                      {image.category}
                    </Badge>
                    <h4 className="text-white font-medium text-sm mb-1 line-clamp-2">{image.caption}</h4>
                    <p className="text-white/80 text-xs">
                      {new Date(image.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white/80 backdrop-blur-sm rounded-full p-2">
                      <Eye className="h-4 w-4 text-gray-700" />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderDocumentsTab = () => (
    <div className="space-y-6">
      {/* Document Filters */}
      <Card className="border-red-200">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            
            <div>
              <Label htmlFor="documents-date-filter" className="text-sm text-gray-600 mb-2 block">
                Date Filter
              </Label>
              <Select value={documentsDateFilter} onValueChange={setDocumentsDateFilter}>
                <SelectTrigger id="documents-date-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="last-7-days">Last 7 Days</SelectItem>
                  <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                  <SelectItem value="last-90-days">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setDocumentsTypeFilter('all');
                  setDocumentsDateFilter('all');
                }}
                className="w-full border-red-300 text-red-700 hover:bg-red-50"
              >
                <Filter className="h-4 w-4 mr-2" />
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card className="border-red-200 shadow-lg">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {project.documents
              .filter(doc => {
                if (documentsTypeFilter !== 'all' && doc.type !== documentsTypeFilter) return false;
                // Add date filtering logic if needed
                return true;
              })
              .map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{doc.type}</span>
                        <span>{doc.fileSize}</span>
                        <span>Uploaded {new Date(doc.uploadedDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-red-300 text-red-700 text-xs">
                      {doc.status}
                    </Badge>
                    <Button size="sm" variant="outline" className="border-red-300 text-red-700 hover:bg-red-50">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTeamTab = () => (
    <div className="space-y-6">
      <Card className="border-red-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-red-50 to-white border-b border-red-200">
          <CardTitle className="text-lg text-red-800 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Project Team Members
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {project.team.map((member) => (
              <div key={member.id} className="border border-red-200 rounded-lg p-6 hover:bg-red-50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <UserCheck className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-base font-medium text-gray-900">{member.name}</h4>
                      <Badge className={`${member.type === 'staff' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'} text-xs`}>
                        {member.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-red-700 font-medium mb-1">{member.role}</p>
                    <p className="text-sm text-gray-600 mb-1">{member.position}</p>
                    <p className="text-xs text-gray-500 mb-3">{member.department}</p>
                    
                    {member.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <Mail className="h-4 w-4" />
                        <span>{member.email}</span>
                      </div>
                    )}
                    {member.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                        <Phone className="h-4 w-4" />
                        <span>{member.phone}</span>
                      </div>
                    )}
                    
                    {member.responsibility && (
                      <div className="bg-gray-50 rounded-lg p-3 mt-3">
                        <p className="text-xs text-gray-500 mb-1">Responsibility</p>
                        <p className="text-sm text-gray-700">{member.responsibility}</p>
                      </div>
                    )}
                    
                    {member.contractorCompany && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500">Company</p>
                        <p className="text-sm text-gray-700 font-medium">{member.contractorCompany}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ========================================
  // MAIN RENDER - Exactly matching construction structure
  // ========================================

  return (
    <div className="min-h-screen bg-background">
      <ClientNavbar 
        onNavigate={onNavigate}
        onSignIn={onSignIn}
        onSignOut={onSignOut}
        onNavigateToDashboard={onNavigateToDashboard}
        userProfile={userProfile}
        onAuthModalSignIn={onAuthModalSignIn}
        demoMode={demoMode}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb - Exactly matching construction */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink 
                className="text-red-600 hover:text-red-700 cursor-pointer"
                onClick={handleBackToRepairs}
              >
                Facility Repairs
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-gray-900 line-clamp-1">
                {project.title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header - Exactly matching construction */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBackToRepairs}
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Repairs
                </Button>
                {project.emergencyRepair && (
                  <Badge className="bg-red-100 text-red-800 border-red-300">
                    Emergency Repair
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.title}</h1>
              <p className="text-lg text-gray-600 mb-4">{project.description}</p>
              
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 text-red-500 mr-2" />
                  <span className="font-medium">{project.location}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 text-red-500 mr-2" />
                  <span>
                    {new Date(project.startDate).toLocaleDateString()} - {new Date(project.targetEndDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Briefcase className="h-4 w-4 text-red-500 mr-2" />
                  <span>{project.contractor}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 text-red-500 mr-2" />
                  <span>{project.beneficiaries} beneficiaries</span>
                </div>
              </div>
            </div>
          </div>

          {/* Status and Progress Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Status</span>
                <Badge className={getStatusBadgeColor(project.status)}>
                  {project.status}
                </Badge>
              </div>
            </div>
            <div className="bg-white border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Progress</span>
                <span className="text-red-700 font-medium">{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-2" />
            </div>
            <div className="bg-white border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Budget</span>
                <span className="text-gray-900 font-medium">{project.budget}</span>
              </div>
            </div>
            <div className="bg-white border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Last Updated</span>
                <span className="text-gray-900 text-sm">
                  {project.lastUpdated ? new Date(project.lastUpdated).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs - EXACTLY matching construction with red theme */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white border border-red-200 shadow-sm">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-red-50 transition-all"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="timeline" 
              className="data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-red-50 transition-all"
            >
              Timeline
            </TabsTrigger>
            <TabsTrigger 
              value="gallery" 
              className="data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-red-50 transition-all"
            >
              Gallery
            </TabsTrigger>
            <TabsTrigger 
              value="documents" 
              className="data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-red-50 transition-all"
            >
              Documents
            </TabsTrigger>
            <TabsTrigger 
              value="team" 
              className="data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-red-50 transition-all"
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

      {/* Image Full View Modal - Exactly matching construction */}
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
                      ? 'bg-red-100 text-red-800'
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
                className="bg-red-600 hover:bg-red-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Original
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Timeline Add Modal - Exactly matching construction */}
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
            <Button onClick={handleAddTimelineEntry} className="bg-red-600 hover:bg-red-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Timeline Edit Modal - Exactly matching construction */}
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
                  value={editingTimelineEntry.date}
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
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTimelineEntry(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTimelineEntry} className="bg-red-600 hover:bg-red-700">
              <Save className="h-4 w-4 mr-2" />
              Update Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Timeline Delete Modal - Exactly matching construction */}
      <Dialog open={!!showDeleteTimelineModal} onOpenChange={() => setShowDeleteTimelineModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Timeline Entry</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 mb-4">
            Are you sure you want to delete this timeline entry? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteTimelineModal(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => showDeleteTimelineModal && handleDeleteTimelineEntry(showDeleteTimelineModal)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}