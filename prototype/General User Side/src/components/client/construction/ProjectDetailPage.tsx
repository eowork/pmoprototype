import React, { useState, useMemo } from 'react';
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
  Paperclip
} from 'lucide-react';
import { ClientNavbar } from '../components/ClientNavbar';
import { NavigationProps } from '../types';

// ========================================
// TYPE DEFINITIONS
// ========================================

interface ProjectDetailPageProps extends NavigationProps {
  projectId?: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  email?: string;
  phone?: string;
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
  status: 'active' | 'archived' | 'featured';
}

interface TimelineEntry {
  id: string;
  title: string;
  description: string;
  remarks: string;
  attachments: string[];
  date: string;
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  phase?: string;
  contractor?: string;
  createdBy: string;
  createdAt: string;
}

interface FinancialAllocation {
  category: string;
  allocated: number;
  utilized: number;
  remaining: number;
  percentage: number;
}

interface PhysicalAccomplishment {
  phase: string;
  description: string;
  targetCompletion: string;
  actualCompletion: number;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Delayed';
}

interface Project {
  id: string;
  title: string;
  description: string;
  category: 'gaa-funded' | 'locally-funded' | 'special-grants';
  status: 'Ongoing' | 'Completed' | 'Planned';
  progress: number;
  budget: string;
  contractor: string;
  location: string;
  startDate: string;
  targetEndDate: string;
  actualEndDate?: string;
  beneficiaries: number;
  facilities: string[];
  
  overview: {
    summary: string;
    objectives: string[];
    scope: string;
    keyFeatures: string[];
  };
  financialAllocation: FinancialAllocation[];
  physicalAccomplishment: PhysicalAccomplishment[];
  gallery: GalleryImage[];
  documents: ProjectDocument[];
  team: TeamMember[];
  timeline: TimelineEntry[];
  
  year: number;
  lastUpdated: string;
}

// ========================================
// MOCK DATA
// ========================================

import { UNIVERSITY_GYMNASIUM_PROJECT } from './UniversityGymnasiumProject';

const MOCK_PROJECT: Project = {
  id: 'proj-001',
  title: 'Modern Learning Center Complex',
  description: 'State-of-the-art academic building with smart classrooms, laboratories, and collaborative learning spaces.',
  category: 'gaa-funded',
  status: 'Ongoing',
  progress: 78,
  budget: '₱185,000,000',
  contractor: 'Prime Infrastructure Builders Inc.',
  location: 'Main Campus, Building C',
  startDate: '2024-01-15',
  targetEndDate: '2025-06-30',
  beneficiaries: 3200,
  facilities: ['24 Smart Classrooms', '8 Laboratories', '200-seat Auditorium', 'Innovation Hub'],
  overview: {
    summary: 'A comprehensive academic facility designed to accommodate the growing student population and support modern educational methodologies. The complex integrates cutting-edge technology with sustainable design principles to create an optimal learning environment.',
    objectives: [
      'Increase classroom capacity by 40% to accommodate enrollment growth',
      'Provide modern STEM-focused laboratory facilities for hands-on learning',
      'Create collaborative learning environments to foster student innovation',
      'Implement sustainable building practices and energy-efficient systems'
    ],
    scope: 'Construction of a six-story academic complex totaling 15,000 square meters, including smart classrooms, specialized laboratories, auditorium, faculty offices, and student innovation spaces. The project includes full ICT infrastructure, furniture, and equipment installation.',
    keyFeatures: [
      'Smart classroom technology with interactive displays and digital whiteboards',
      'Energy-efficient HVAC and LED lighting systems',
      'Rainwater harvesting and greywater recycling infrastructure',
      'Universal accessibility compliance with ramps and elevators',
      'Seismically resilient structural design meeting latest building codes'
    ]
  },
  gallery: [
    {
      id: 'img-001-1',
      url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop',
      caption: 'Site preparation and foundation work',
      category: 'In Progress',
      date: '2024-01-20',
      status: 'active'
    },
    {
      id: 'img-001-2',
      url: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=800&h=600&fit=crop',
      caption: 'Structural framework completion',
      category: 'In Progress',
      date: '2024-08-15',
      status: 'featured'
    }
  ],
  documents: [
    {
      id: 'doc-001-1',
      name: 'Project Proposal and Feasibility Study',
      type: 'Proposal',
      url: '#',
      uploadedDate: '2023-11-01',
      fileSize: '5.2 MB',
      status: 'active'
    },
    {
      id: 'doc-001-2',
      name: 'Q3 2024 Progress Report',
      type: 'Report',
      url: '#',
      uploadedDate: '2024-09-30',
      fileSize: '2.8 MB',
      status: 'active'
    }
  ],
  team: [
    {
      id: 'team-001-1',
      name: 'Engr. Maria Santos',
      role: 'Project Manager',
      department: 'Project Management Office',
      email: 'm.santos@carsu.edu.ph',
      phone: '+63 916 234 5678'
    },
    {
      id: 'team-001-2',
      name: 'Arch. Juan dela Cruz',
      role: 'Design Architect',
      department: 'Physical Facilities',
      email: 'j.delacruz@carsu.edu.ph'
    }
  ],
  timeline: [
    {
      id: 'timeline-001-1',
      title: 'Project Kickoff Meeting',
      description: 'Initial project planning and team formation meeting. Discussed project scope, timeline, and resource allocation.',
      remarks: 'All stakeholders present. Unanimous agreement on project objectives and timeline.',
      attachments: ['kickoff-presentation.pdf', 'project-charter.pdf'],
      date: '2024-01-15',
      type: 'daily',
      createdBy: 'Engr. Maria Santos',
      createdAt: '2024-01-15T09:00:00Z'
    },
    {
      id: 'timeline-001-2',
      title: 'Site Preparation Completed',
      description: 'Site clearing and foundation preparation activities completed ahead of schedule.',
      remarks: 'Weather conditions were favorable. No environmental concerns identified.',
      attachments: ['site-photos.zip'],
      date: '2024-02-28',
      type: 'weekly',
      createdBy: 'Engr. Maria Santos',
      createdAt: '2024-02-28T16:30:00Z'
    },
    {
      id: 'timeline-001-3',
      title: 'Q2 Progress Review',
      description: 'Quarterly review of project progress and budget utilization. Project is on track with 45% completion.',
      remarks: 'Minor delays in material delivery addressed. Contractor performance satisfactory.',
      attachments: ['q2-report.pdf', 'budget-analysis.xlsx'],
      date: '2024-06-30',
      type: 'quarterly',
      phase: 'Phase 2',
      contractor: 'Prime Infrastructure Builders Inc.',
      createdBy: 'Engr. Maria Santos',
      createdAt: '2024-06-30T17:00:00Z'
    }
  ],
  financialAllocation: [
    {
      category: 'Site Development',
      allocated: 25000000,
      utilized: 23500000,
      remaining: 1500000,
      percentage: 94.0
    },
    {
      category: 'Building Construction',
      allocated: 120000000,
      utilized: 89600000,
      remaining: 30400000,
      percentage: 74.7
    },
    {
      category: 'Equipment & Fixtures',
      allocated: 30000000,
      utilized: 8500000,
      remaining: 21500000,
      percentage: 28.3
    },
    {
      category: 'Contingency',
      allocated: 10000000,
      utilized: 2800000,
      remaining: 7200000,
      percentage: 28.0
    }
  ],
  physicalAccomplishment: [
    {
      phase: 'Phase 1 - Site Preparation',
      description: 'Site clearing, excavation, and foundation work',
      targetCompletion: '2024-03-30',
      actualCompletion: 100,
      status: 'Completed'
    },
    {
      phase: 'Phase 2 - Structural Work',
      description: 'Foundation, columns, beams, and floor slabs',
      targetCompletion: '2024-08-15',
      actualCompletion: 85,
      status: 'In Progress'
    },
    {
      phase: 'Phase 3 - Architectural Work',
      description: 'Walls, roofing, doors, windows, and finishes',
      targetCompletion: '2024-12-30',
      actualCompletion: 35,
      status: 'In Progress'
    },
    {
      phase: 'Phase 4 - MEP Installation',
      description: 'Mechanical, electrical, and plumbing systems',
      targetCompletion: '2025-04-30',
      actualCompletion: 0,
      status: 'Not Started'
    },
    {
      phase: 'Phase 5 - Final Finishes',
      description: 'Interior finishes, landscaping, and final inspections',
      targetCompletion: '2025-06-30',
      actualCompletion: 0,
      status: 'Not Started'
    }
  ],
  year: 2024,
  lastUpdated: '2024-10-06'
};

// ========================================
// MAIN COMPONENT
// ========================================

export function ProjectDetailPage({ 
  onNavigate, 
  onSignIn, 
  onSignOut,
  onNavigateToDashboard,
  userRole = 'Client', 
  userProfile,
  requireAuth, 
  onAuthModalSignIn, 
  demoMode = false,
  projectId
}: ProjectDetailPageProps) {

  // ========================================
  // STATE MANAGEMENT
  // ========================================
  
  const [project, setProject] = useState<Project>(
    projectId === 'proj-002' ? UNIVERSITY_GYMNASIUM_PROJECT : MOCK_PROJECT
  );
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editedProject, setEditedProject] = useState<Project>(project);

  // Section-specific editing states
  const [editingOverview, setEditingOverview] = useState(false);
  const [editingObjectives, setEditingObjectives] = useState(false);
  const [editingScope, setEditingScope] = useState(false);
  const [editingKeyFeatures, setEditingKeyFeatures] = useState(false);
  const [editingProjectInfo, setEditingProjectInfo] = useState(false);
  const [editingFinancialAllocation, setEditingFinancialAllocation] = useState(false);
  const [editingPhysicalAccomplishment, setEditingPhysicalAccomplishment] = useState(false);
  const [editingTeamMember, setEditingTeamMember] = useState<string | null>(null);
  const [editingDocument, setEditingDocument] = useState<string | null>(null);
  const [editingGalleryItem, setEditingGalleryItem] = useState<string | null>(null);
  const [showAddTeamModal, setShowAddTeamModal] = useState(false);
  const [showAddDocumentModal, setShowAddDocumentModal] = useState(false);
  const [showAddImageModal, setShowAddImageModal] = useState(false);
  const [showDeleteTeamModal, setShowDeleteTeamModal] = useState<string | null>(null);
  const [showDeleteDocumentModal, setShowDeleteDocumentModal] = useState<string | null>(null);
  const [showDeleteImageModal, setShowDeleteImageModal] = useState<string | null>(null);

  // Timeline-specific states
  const [showAddTimelineModal, setShowAddTimelineModal] = useState(false);
  const [showTimelineDetailModal, setShowTimelineDetailModal] = useState<string | null>(null);
  const [editingTimelineEntry, setEditingTimelineEntry] = useState<string | null>(null);
  const [showDeleteTimelineModal, setShowDeleteTimelineModal] = useState<string | null>(null);
  const [timelineFilter, setTimelineFilter] = useState<'all' | 'daily' | 'weekly' | 'monthly' | 'quarterly'>('all');
  const [galleryFilter, setGalleryFilter] = useState<'all' | 'recent' | 'older'>('all');
  const [documentFilter, setDocumentFilter] = useState<'all' | 'active' | 'archived' | 'draft'>('all');

  // Check if user can edit
  const canEdit = useMemo(() => {
    return userProfile?.role === 'Admin' || userProfile?.role === 'Staff';
  }, [userProfile]);

  // ========================================
  // EVENT HANDLERS
  // ========================================

  const handleBack = () => {
    if (onNavigate) {
      onNavigate('client-construction-infrastructure', 'overview');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProject(project);
  };

  const handleSave = () => {
    setProject(editedProject);
    setIsEditing(false);
    toast.success('Project updated successfully');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProject(project);
  };

  const handleDelete = () => {
    toast.success('Project deleted successfully');
    setShowDeleteDialog(false);
    handleBack();
  };

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Ongoing': return <PlayCircle className="h-4 w-4" />;
      case 'Completed': return <CheckCircle2 className="h-4 w-4" />;
      case 'Planned': return <Clock className="h-4 w-4" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ongoing': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Planned': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'gaa-funded': return 'GAA Funded';
      case 'locally-funded': return 'Locally Funded';
      case 'special-grants': return 'Special Grants';
      default: return category;
    }
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'Proposal': return <FileText className="h-4 w-4" />;
      case 'Report': return <BarChart3 className="h-4 w-4" />;
      case 'Plan': return <Target className="h-4 w-4" />;
      case 'Certification': return <CheckCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  // ========================================
  // TAB RENDER FUNCTIONS (ENHANCED)
  // ========================================

  const renderOverviewTab = () => (
    <div className="space-y-8">
      {/* Project Summary */}
      <Card className="border-emerald-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-white">
          <CardTitle className="text-lg text-emerald-800">Project Overview</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-sm text-gray-700 leading-relaxed">
            {project.overview.summary}
          </p>
        </CardContent>
      </Card>

      {/* Key Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-emerald-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-white pb-3">
            <CardTitle className="text-base">Project Details</CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-gray-500">Budget</Label>
                <p className="text-sm text-gray-900 font-medium">{project.budget}</p>
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
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-white pb-3">
            <CardTitle className="text-base">Timeline</CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            <div className="space-y-3">
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
              <div>
                <Label className="text-xs text-gray-500">Overall Progress</Label>
                <div className="flex items-center gap-2">
                  <Progress value={project.progress} className="flex-1" />
                  <span className="text-sm text-emerald-600 font-medium">{project.progress}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-white pb-3">
            <CardTitle className="text-base">Facilities</CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            <div className="flex flex-wrap gap-2">
              {project.facilities.map((facility, index) => (
                <Badge key={index} variant="outline" className="border-emerald-300 text-emerald-700 text-xs">
                  {facility}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial and Physical Accomplishment - Highlighted Section */}
      <Card className="border-emerald-300 shadow-xl bg-gradient-to-r from-emerald-50 to-white">
        <CardHeader className="bg-gradient-to-r from-emerald-100 to-emerald-50">
          <CardTitle className="text-lg text-emerald-800 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Financial and Physical Accomplishment
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Financial Progress */}
            <div>
              <h4 className="text-base text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                Financial Progress
              </h4>
              <div className="space-y-4">
                {project.financialAllocation.map((item, index) => (
                  <div key={index} className="border border-emerald-200 rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-sm text-gray-900 font-medium">{item.category}</h5>
                      <span className="text-sm text-emerald-600 font-semibold">{item.percentage.toFixed(1)}%</span>
                    </div>
                    <div className="space-y-2 text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span>Allocated:</span>
                        <span className="font-medium">₱{item.allocated.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Utilized:</span>
                        <span className="font-medium">₱{item.utilized.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Remaining:</span>
                        <span className="font-medium">₱{item.remaining.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Physical Progress */}
            <div>
              <h4 className="text-base text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-emerald-600" />
                Physical Accomplishment
              </h4>
              <div className="space-y-4">
                {project.physicalAccomplishment.map((phase, index) => (
                  <div key={index} className="border border-emerald-200 rounded-lg p-4 bg-white">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h5 className="text-sm text-gray-900 font-medium mb-1">{phase.phase}</h5>
                        <p className="text-xs text-gray-600">{phase.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            phase.status === 'Completed' ? 'border-emerald-300 text-emerald-700 bg-emerald-50' :
                            phase.status === 'In Progress' ? 'border-blue-300 text-blue-700 bg-blue-50' :
                            phase.status === 'Delayed' ? 'border-red-300 text-red-700 bg-red-50' :
                            'border-gray-300 text-gray-700 bg-gray-50'
                          }`}
                        >
                          {phase.status}
                        </Badge>
                        <span className="text-sm text-emerald-600 font-semibold">{phase.actualCompletion}%</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Target: {new Date(phase.targetCompletion).toLocaleDateString()}</span>
                        <span>{phase.actualCompletion}% Complete</span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            phase.status === 'Completed' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' :
                            phase.status === 'In Progress' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                            phase.status === 'Delayed' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                            'bg-gradient-to-r from-gray-400 to-gray-500'
                          }`}
                          style={{ width: `${phase.actualCompletion}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Financial vs Physical Comparison */}
          <div className="mt-8 pt-6 border-t border-emerald-200">
            <h4 className="text-base text-gray-900 mb-4 text-center">Progress Comparison</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <h5 className="text-sm text-gray-600 mb-2">Financial Progress</h5>
                <div className="relative w-20 h-20 mx-auto">
                  <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" fill="none" stroke="#e5e7eb" strokeWidth="2"/>
                    <circle 
                      cx="12" cy="12" r="10" fill="none" 
                      stroke="#10b981" strokeWidth="2"
                      strokeDasharray={`${(project.financialAllocation.reduce((acc, item) => acc + item.utilized, 0) / project.financialAllocation.reduce((acc, item) => acc + item.allocated, 0)) * 62.83} 62.83`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-base text-emerald-600 font-semibold">
                      {((project.financialAllocation.reduce((acc, item) => acc + item.utilized, 0) / project.financialAllocation.reduce((acc, item) => acc + item.allocated, 0)) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <h5 className="text-sm text-gray-600 mb-2">Physical Progress</h5>
                <div className="relative w-20 h-20 mx-auto">
                  <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" fill="none" stroke="#e5e7eb" strokeWidth="2"/>
                    <circle 
                      cx="12" cy="12" r="10" fill="none" 
                      stroke="#3b82f6" strokeWidth="2"
                      strokeDasharray={`${project.progress * 0.6283} 62.83`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-base text-blue-600 font-semibold">{project.progress}%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <div className="flex items-center justify-center gap-2 text-sm">
                <span className="text-gray-600">Variance:</span>
                <span className={`font-semibold ${
                  project.progress > ((project.financialAllocation.reduce((acc, item) => acc + item.utilized, 0) / project.financialAllocation.reduce((acc, item) => acc + item.allocated, 0)) * 100)
                    ? 'text-emerald-600' : 'text-amber-600'
                }`}>
                  {(project.progress - ((project.financialAllocation.reduce((acc, item) => acc + item.utilized, 0) / project.financialAllocation.reduce((acc, item) => acc + item.allocated, 0)) * 100)).toFixed(1)}%
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {project.progress > ((project.financialAllocation.reduce((acc, item) => acc + item.utilized, 0) / project.financialAllocation.reduce((acc, item) => acc + item.allocated, 0)) * 100)
                  ? 'Physical work is ahead of financial utilization'
                  : 'Financial utilization is ahead of physical work'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Objectives */}
      <Card className="border-emerald-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-white">
          <CardTitle className="text-base">Project Objectives</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ul className="space-y-3">
            {project.overview.objectives.map((objective, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">{objective}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Scope of Work */}
      <Card className="border-emerald-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-white">
          <CardTitle className="text-base">Scope of Work</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-sm text-gray-700 leading-relaxed">
            {project.overview.scope}
          </p>
        </CardContent>
      </Card>

      {/* Key Features */}
      <Card className="border-emerald-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-white">
          <CardTitle className="text-base">Key Features</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {project.overview.keyFeatures.map((feature, index) => (
              <div key={index} className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTimelineTab = () => {
    // Filter timeline entries based on selected filter
    const filteredTimeline = timelineFilter === 'all' 
      ? project.timeline 
      : project.timeline.filter(entry => entry.type === timelineFilter);

    return (
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <h3 className="text-lg text-gray-900">Project Timeline</h3>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Time Filter */}
            <div className="flex items-center gap-2">
              <Label htmlFor="timeline-filter" className="text-sm text-gray-600 whitespace-nowrap">
                Filter by:
              </Label>
              <Select value={timelineFilter} onValueChange={(value: any) => setTimelineFilter(value)}>
                <SelectTrigger id="timeline-filter" className="w-40">
                  <SelectValue placeholder="All entries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entries</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {canEdit && (
              <Button
                onClick={() => setShowAddTimelineModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Entry
              </Button>
            )}
          </div>
        </div>

      {filteredTimeline.length === 0 ? (
        <Card className="p-12 border-dashed border-2 border-gray-300">
          <div className="text-center">
            <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg text-gray-900 mb-2">
              {timelineFilter === 'all' ? 'No timeline entries' : `No ${timelineFilter} entries`}
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              {timelineFilter === 'all' 
                ? 'Add timeline entries to track project progress' 
                : `No ${timelineFilter} entries found. Try adjusting the filter or add a new entry.`
              }
            </p>
            {canEdit && (
              <Button
                onClick={() => setShowAddTimelineModal(true)}
                variant="outline"
                className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Entry
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-400 to-gray-300"></div>

          <div className="space-y-6">
            {filteredTimeline.map((entry, index) => (
              <div key={entry.id} className="relative flex items-start gap-6">
                {/* Timeline Dot */}
                <div className="relative z-10 flex-shrink-0">
                  <div className={`w-4 h-4 rounded-full border-2 bg-white ${
                    entry.type === 'daily' ? 'border-emerald-500' :
                    entry.type === 'weekly' ? 'border-blue-500' :
                    entry.type === 'monthly' ? 'border-amber-500' :
                    'border-purple-500'
                  }`}></div>
                </div>

                {/* Timeline Content */}
                <div className="flex-1 min-w-0">
                  <Card className="hover:shadow-lg transition-shadow group">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 
                              className="text-base text-gray-900 cursor-pointer hover:text-emerald-600 transition-colors"
                              onClick={() => setShowTimelineDetailModal(entry.id)}
                            >
                              {entry.title}
                            </h4>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                entry.type === 'daily' ? 'border-emerald-300 text-emerald-700' :
                                entry.type === 'weekly' ? 'border-blue-300 text-blue-700' :
                                entry.type === 'monthly' ? 'border-amber-300 text-amber-700' :
                                'border-purple-300 text-purple-700'
                              }`}
                            >
                              {entry.type}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(entry.date).toLocaleDateString('en-US', { 
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span>{entry.createdBy}</span>
                            </div>
                            {entry.phase && (
                              <div className="flex items-center gap-1">
                                <Building2 className="h-4 w-4" />
                                <span>{entry.phase}</span>
                              </div>
                            )}
                            {entry.contractor && (
                              <div className="flex items-center gap-1">
                                <Target className="h-4 w-4" />
                                <span className="truncate max-w-32">{entry.contractor}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        {canEdit && (
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowTimelineDetailModal(entry.id)}
                              className="text-gray-400 hover:text-emerald-600"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingTimelineEntry(entry.id)}
                              className="text-gray-400 hover:text-emerald-600"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowDeleteTimelineModal(entry.id)}
                              className="text-gray-400 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mb-3">{entry.description}</p>
                      {entry.remarks && (
                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                          <p className="text-sm text-gray-600">{entry.remarks}</p>
                        </div>
                      )}
                      {entry.attachments && entry.attachments.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Paperclip className="h-4 w-4" />
                          <span>{entry.attachments.length} attachment(s)</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    );
  };

  const renderTeamTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg text-gray-900">Project Team</h3>
        {canEdit && (
          <Button
            onClick={() => setShowAddTeamModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Team Member
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {project.team.map((member) => (
          <Card key={member.id} className="hover:shadow-lg transition-shadow group">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="text-base text-gray-900 mb-1">{member.name}</h4>
                  <p className="text-sm text-emerald-600 mb-1">{member.role}</p>
                  <p className="text-sm text-gray-600">{member.department}</p>
                </div>
                {canEdit && (
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingTeamMember(member.id)}
                      className="text-gray-400 hover:text-emerald-600"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDeleteTeamModal(member.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                {member.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <a 
                      href={`mailto:${member.email}`}
                      className="hover:text-emerald-600 transition-colors"
                    >
                      {member.email}
                    </a>
                  </div>
                )}
                {member.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{member.phone}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderGalleryTab = () => {
    const filteredGallery = galleryFilter === 'all' 
      ? project.gallery 
      : galleryFilter === 'recent'
      ? project.gallery.filter(img => new Date(img.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      : project.gallery.filter(img => new Date(img.date) <= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-lg text-gray-900">Project Gallery</h3>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <Label htmlFor="gallery-filter" className="text-sm text-gray-600 whitespace-nowrap">
                Filter by:
              </Label>
              <Select value={galleryFilter} onValueChange={(value: any) => setGalleryFilter(value)}>
                <SelectTrigger id="gallery-filter" className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Images</SelectItem>
                  <SelectItem value="recent">Recent (30 days)</SelectItem>
                  <SelectItem value="older">Older</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {canEdit && (
              <Button
                onClick={() => setShowAddImageModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Image
              </Button>
            )}
          </div>
        </div>

        {filteredGallery.length === 0 ? (
          <Card className="p-12 border-dashed border-2 border-gray-300">
            <div className="text-center">
              <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg text-gray-900 mb-2">No images found</h4>
              <p className="text-sm text-gray-600 mb-4">
                {galleryFilter === 'all' 
                  ? 'Add images to showcase project progress' 
                  : `No ${galleryFilter} images found. Try adjusting the filter or add a new image.`
                }
              </p>
              {canEdit && (
                <Button
                  onClick={() => setShowAddImageModal(true)}
                  variant="outline"
                  className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Image
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGallery.map((image) => (
              <Card key={image.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                  <img
                    src={image.url}
                    alt={image.caption}
                    className="w-full h-48 object-cover"
                  />
                  {canEdit && (
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingGalleryItem(image.id)}
                        className="bg-white/90 text-gray-600 hover:text-emerald-600 h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDeleteImageModal(image.id)}
                        className="bg-white/90 text-gray-600 hover:text-red-600 h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm text-gray-900 flex-1">{image.caption}</h4>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ml-2 ${
                        image.category === 'Completed' ? 'border-emerald-300 text-emerald-700' :
                        image.category === 'In Progress' ? 'border-blue-300 text-blue-700' :
                        image.category === 'Before' ? 'border-gray-300 text-gray-700' :
                        'border-amber-300 text-amber-700'
                      }`}
                    >
                      {image.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(image.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderDocumentsTab = () => {
    const filteredDocuments = documentFilter === 'all' 
      ? project.documents 
      : project.documents.filter(doc => doc.status === documentFilter);

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-lg text-gray-900">Project Documents</h3>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <Label htmlFor="document-filter" className="text-sm text-gray-600 whitespace-nowrap">
                Filter by:
              </Label>
              <Select value={documentFilter} onValueChange={(value: any) => setDocumentFilter(value)}>
                <SelectTrigger id="document-filter" className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Documents</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {canEdit && (
              <Button
                onClick={() => setShowAddDocumentModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Document
              </Button>
            )}
          </div>
        </div>

        {filteredDocuments.length === 0 ? (
          <Card className="p-12 border-dashed border-2 border-gray-300">
            <div className="text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg text-gray-900 mb-2">No documents found</h4>
              <p className="text-sm text-gray-600 mb-4">
                {documentFilter === 'all' 
                  ? 'Add documents to organize project files' 
                  : `No ${documentFilter} documents found. Try adjusting the filter or add a new document.`
                }
              </p>
              {canEdit && (
                <Button
                  onClick={() => setShowAddDocumentModal(true)}
                  variant="outline"
                  className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Document
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredDocuments.map((document) => (
              <Card key={document.id} className="hover:shadow-lg transition-shadow group">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 rounded-lg bg-gray-100">
                        {getDocumentIcon(document.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base text-gray-900 mb-1 truncate">{document.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <Badge 
                            variant="outline" 
                            className="text-xs border-gray-300 text-gray-700"
                          >
                            {document.type}
                          </Badge>
                          {document.fileSize && (
                            <span>{document.fileSize}</span>
                          )}
                          <span>
                            {new Date(document.uploadedDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-emerald-600"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      {canEdit && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingDocument(document.id)}
                            className="text-gray-400 hover:text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowDeleteDocumentModal(document.id)}
                            className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

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
          onClick={handleBack}
          className="mb-6 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Construction Infrastructure
        </Button>

        {/* Project Header */}
        <Card className="mb-8 border-emerald-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-white">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl text-gray-900">{project.title}</h1>
                  <Badge 
                    variant="outline" 
                    className={`${getStatusColor(project.status)} border`}
                  >
                    <div className="flex items-center gap-1">
                      {getStatusIcon(project.status)}
                      <span>{project.status}</span>
                    </div>
                  </Badge>
                  <Badge variant="outline" className="border-emerald-300 text-emerald-700">
                    {getCategoryLabel(project.category)}
                  </Badge>
                </div>
                <p className="text-gray-600 mb-4">{project.description}</p>
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{project.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Started {new Date(project.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{project.beneficiaries.toLocaleString()} beneficiaries</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-2xl text-emerald-600 mb-1">{project.progress}%</div>
                <div className="text-sm text-gray-600 mb-3">Complete</div>
                <Progress value={project.progress} className="w-32" />
              </div>
            </div>
          </CardHeader>
        </Card>

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
    </div>
  );
}

export default ProjectDetailPage;