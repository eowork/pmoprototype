import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Label } from '../../ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { toast } from 'sonner@2.0.3';
import { 
  Wrench, 
  Building2, 
  Calendar, 
  Award, 
  MapPin,
  Heart,
  PlayCircle,
  CheckCircle2,
  Clock,
  ChevronRight,
  ChevronLeft,
  Search,
  Filter,
  X,
  Target,
  Plus,
  Edit,
  Trash2,
  Eye,
  List,
  AlertTriangle,
  Settings,
  Shield,
  Zap
} from 'lucide-react';
import { ClientNavbar } from '../components/ClientNavbar';
import { NavigationProps } from '../types';

// ========================================
// TYPE DEFINITIONS
// ========================================

interface RepairsInfrastructurePageProps extends NavigationProps {
  currentSection?: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  category: 'emergency-repairs' | 'preventive-maintenance' | 'facility-upgrades' | 'safety-compliance';
  status: 'Ongoing' | 'Completed' | 'Planned';
  progress: number;
  financialProgress?: number;
  targetProgress?: number;
  location: string;
  startDate: string;
  targetEndDate: string;
  year: number;
  budget?: string;
  phases?: { name: string; completion: number; target: number; }[];
}

// ========================================
// MOCK DATA
// ========================================

const MOCK_PROJECTS: Project[] = [
  {
    id: 'repair-001',
    title: 'Engineering Building HVAC System Emergency Repair',
    description: 'Critical repair of malfunctioning HVAC systems in engineering classrooms affecting student learning environment.',
    category: 'emergency-repairs',
    status: 'Ongoing',
    progress: 78,
    location: 'Engineering Building, Floors 2-4',
    startDate: '2024-11-01',
    targetEndDate: '2024-12-30',
    year: 2024
  },
  {
    id: 'repair-002',
    title: 'Science Building Laboratory Electrical System Upgrade',
    description: 'Comprehensive electrical system modernization for chemistry and physics laboratories.',
    category: 'facility-upgrades',
    status: 'Completed',
    progress: 100,
    location: 'Science Building, Laboratory Wing',
    startDate: '2024-10-15',
    targetEndDate: '2024-11-30',
    year: 2024
  },
  {
    id: 'repair-003',
    title: 'Administration Building Roof Leak Repairs',
    description: 'Emergency roof repair work to prevent water damage in administrative offices.',
    category: 'emergency-repairs',
    status: 'Completed',
    progress: 100,
    location: 'Administration Building, Main Roof',
    startDate: '2024-09-01',
    targetEndDate: '2024-10-15',
    year: 2024
  },
  {
    id: 'repair-004',
    title: 'Library Building Air Conditioning Preventive Maintenance',
    description: 'Scheduled preventive maintenance of library HVAC systems to ensure optimal performance.',
    category: 'preventive-maintenance',
    status: 'Ongoing',
    progress: 65,
    location: 'Library Building, All Floors',
    startDate: '2024-08-01',
    targetEndDate: '2024-12-31',
    year: 2024
  },
  {
    id: 'repair-005',
    title: 'Student Center Fire Safety System Installation',
    description: 'Installation of comprehensive fire safety systems including alarms, sprinklers, and emergency exits.',
    category: 'safety-compliance',
    status: 'Completed',
    progress: 100,
    location: 'Student Center, All Areas',
    startDate: '2024-06-01',
    targetEndDate: '2024-10-31',
    year: 2024
  },
  {
    id: 'repair-006',
    title: 'Dormitory Plumbing System Overhaul',
    description: 'Complete replacement of aging plumbing systems in student dormitories.',
    category: 'facility-upgrades',
    status: 'Planned',
    progress: 15,
    location: 'Student Dormitory Complex',
    startDate: '2025-01-15',
    targetEndDate: '2025-06-30',
    year: 2025
  }
];

export default function RepairsPageRestored({
  onNavigate = () => {},
  onSignIn = () => {},
  onSignOut = () => {},
  onNavigateToDashboard = () => {},
  userRole = 'Client',
  userProfile = null,
  requireAuth = () => false,
  onAuthModalSignIn = async () => ({ success: false }),
  demoMode = false,
  currentSection = 'overview'
}: RepairsInfrastructurePageProps) {

  // ========================================
  // STATE MANAGEMENT
  // ========================================

  const [activeSection, setActiveSection] = useState('overview');
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  
  // Filters and search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');
  
  // Pagination and view
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [viewMode, setViewMode] = useState<'card' | 'list' | 'table'>('card');

  // Check if user can edit
  const canEdit = useMemo(() => {
    return userProfile?.role === 'Admin' || userProfile?.role === 'Staff';
  }, [userProfile]);

  // ========================================
  // COMPUTED VALUES
  // ========================================

  // Status counts
  const statusCounts = useMemo(() => {
    return {
      total: projects.length,
      ongoing: projects.filter(p => p.status === 'Ongoing').length,
      completed: projects.filter(p => p.status === 'Completed').length,
      planned: projects.filter(p => p.status === 'Planned').length
    };
  }, [projects]);

  // Available years
  const availableYears = useMemo(() => {
    const years = [...new Set(projects.map(p => p.year))].sort((a, b) => b - a);
    return years;
  }, [projects]);

  // Globally filtered projects
  const globallyFilteredProjects = useMemo(() => {
    let filtered = [...projects];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    // Year filter
    if (yearFilter !== 'all') {
      filtered = filtered.filter(p => p.year === parseInt(yearFilter));
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.location.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [projects, statusFilter, yearFilter, searchQuery]);

  // Projects by category
  const projectsByCategory = useMemo(() => {
    return {
      'overview': globallyFilteredProjects,
      'emergency-repairs': globallyFilteredProjects.filter(p => p.category === 'emergency-repairs'),
      'preventive-maintenance': globallyFilteredProjects.filter(p => p.category === 'preventive-maintenance'),
      'facility-upgrades': globallyFilteredProjects.filter(p => p.category === 'facility-upgrades'),
      'safety-compliance': globallyFilteredProjects.filter(p => p.category === 'safety-compliance')
    };
  }, [globallyFilteredProjects]);

  // Paginated projects
  const getCurrentSectionProjects = () => {
    const sectionProjects = projectsByCategory[activeSection as keyof typeof projectsByCategory] || [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sectionProjects.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    const sectionProjects = projectsByCategory[activeSection as keyof typeof projectsByCategory] || [];
    return Math.ceil(sectionProjects.length / itemsPerPage);
  };

  // ========================================
  // EVENT HANDLERS
  // ========================================

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setStatusFilter('all');
    setYearFilter('all');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleStatusCardClick = (status: string) => {
    if (statusFilter === status) {
      // If already selected, clear the filter
      setStatusFilter('all');
    } else {
      // Set the new filter
      setStatusFilter(status);
    }
    setCurrentPage(1); // Reset to first page
  };

  const handleProjectClick = (projectId: string) => {
    console.log('🎯 Navigating to repair project detail:', projectId);
    onNavigate?.('client-repair-project-detail', projectId);
  };

  const handleAddProject = () => {
    if (!canEdit) {
      toast.error('Admin access required to add projects');
      return;
    }
    
    const newProject: Project = {
      id: '',
      title: '',
      description: '',
      category: 'emergency-repairs',
      status: 'Planned',
      progress: 0,
      location: '',
      startDate: '',
      targetEndDate: '',
      year: new Date().getFullYear()
    };
    
    setEditingProject(newProject);
    setIsEditing(false);
    setShowAddModal(true);
  };

  const handleEditProject = (projectId: string) => {
    if (!canEdit) {
      toast.error('Admin access required to edit projects');
      return;
    }
    
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setEditingProject(project);
      setIsEditing(true);
      setShowAddModal(true);
    }
  };

  const handleSaveProject = (projectData: Project) => {
    if (isEditing) {
      setProjects(projects.map(p => 
        p.id === projectData.id ? projectData : p
      ));
      toast.success('Repair project updated successfully');
    } else {
      const newProject = {
        ...projectData,
        id: `repair-${Date.now()}`
      };
      setProjects([...projects, newProject]);
      toast.success('Repair project added successfully');
    }
    
    setShowAddModal(false);
    setEditingProject(null);
    setIsEditing(false);
  };

  const handleDeleteProject = (projectId: string) => {
    if (!canEdit) {
      toast.error('Admin access required to delete projects');
      return;
    }
    
    setProjectToDelete(projectId);
    setShowDeleteModal(true);
  };

  const confirmDeleteProject = () => {
    if (projectToDelete) {
      setProjects(projects.filter(p => p.id !== projectToDelete));
      toast.success('Repair project deleted successfully');
      setProjectToDelete(null);
    }
    setShowDeleteModal(false);
  };

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'Ongoing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Planned': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return <CheckCircle2 className="h-3 w-3" />;
      case 'Ongoing': return <PlayCircle className="h-3 w-3" />;
      case 'Planned': return <Clock className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const getSectionTitle = (section: string) => {
    switch (section) {
      case 'overview': return 'Overview';
      case 'emergency-repairs': return 'Emergency Repairs';
      case 'preventive-maintenance': return 'Preventive Maintenance';
      case 'facility-upgrades': return 'Facility Upgrades';
      case 'safety-compliance': return 'Safety & Compliance';
      default: return 'Repair Projects';
    }
  };

  const getSectionIcon = (section: string) => {
    switch (section) {
      case 'overview': return Target;
      case 'emergency-repairs': return AlertTriangle;
      case 'preventive-maintenance': return Settings;
      case 'facility-upgrades': return Zap;
      case 'safety-compliance': return Shield;
      default: return Wrench;
    }
  };

  // ========================================
  // RENDER: Project Content Views
  // ========================================

  const renderProjectContent = () => {
    const currentProjects = getCurrentSectionProjects();

    if (currentProjects.length === 0) {
      return (
        <div className="p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Wrench className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-lg text-gray-900 mb-2">No Repair Projects Found</h3>
          <p className="text-sm text-gray-600 mb-4">
            No repair projects match your current filters.
          </p>
          {canEdit && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleAddProject()}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Project
            </Button>
          )}
        </div>
      );
    }

    switch (viewMode) {
      case 'card':
        return renderCardView(currentProjects);
      case 'list':
        return renderListView(currentProjects);
      case 'table':
        return renderTableView(currentProjects);
      default:
        return renderCardView(currentProjects);
    }
  };

  const renderCardView = (projects: Project[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      {projects.map((project) => (
        <div 
          key={project.id}
          className="bg-gradient-to-br from-gray-50 via-white to-gray-50 border border-gray-300 rounded-xl p-6 hover:shadow-xl hover:border-red-400 hover:from-red-50 hover:to-red-25 cursor-pointer transition-all duration-300 group shadow-md backdrop-blur-sm"
          onClick={() => handleProjectClick(project.id)}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-base text-gray-900 group-hover:text-red-700 transition-colors line-clamp-1">
                  {project.title}
                </h3>
                {canEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditProject(project.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto text-gray-400 hover:text-red-600"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <Badge className={`${getStatusColor(project.status)} border flex items-center gap-1.5 text-xs w-fit px-2 py-1`}>
                {getStatusIcon(project.status)}
                {project.status}
              </Badge>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">Timeline</span>
              <span className="text-red-600">{project.progress}%</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
              <Calendar className="h-3 w-3" />
              <span>
                {new Date(project.startDate).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric' 
                })}
              </span>
              <span>→</span>
              <span>
                {new Date(project.targetEndDate).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric' 
                })}
              </span>
            </div>
            <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-red-500 to-red-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${project.progress}%` }}
              />
            </div>
            
            {/* Target vs Actual Variance Display */}
            {project.targetProgress && (
              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-500">Target: {project.targetProgress}%</span>
                  <span className={`${
                    project.progress >= project.targetProgress 
                      ? 'text-red-600' 
                      : project.progress < project.targetProgress - 10 
                        ? 'text-red-600' 
                        : 'text-amber-600'
                  }`}>
                    {project.progress >= project.targetProgress ? '+' : ''}{(project.progress - project.targetProgress).toFixed(1)}%
                  </span>
                </div>
                <div className="bg-gray-200 rounded-full h-1 overflow-hidden">
                  <div 
                    className="bg-gray-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${project.targetProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700 line-clamp-2">{project.location}</span>
            </div>
            <div className="flex items-start gap-2">
              <Building2 className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700 line-clamp-3">{project.description}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-4">
            <div className="text-xs text-gray-500">
              {project.year}
            </div>
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-red-600 hover:text-red-700 hover:bg-red-50 group-hover:bg-red-100 transition-colors p-2"
            >
              View Details
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderListView = (projects: Project[]) => (
    <div className="space-y-3 p-6">
      {projects.map((project) => (
        <div 
          key={project.id}
          className="bg-gradient-to-r from-gray-100 via-gray-50 to-white hover:from-red-50 hover:to-red-25 cursor-pointer transition-all duration-300 border-l-4 border-l-gray-300 hover:border-l-red-500 border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md"
          onClick={() => handleProjectClick(project.id)}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-base text-gray-900">{project.title}</h3>
                <Badge className={`${getStatusColor(project.status)} border flex items-center gap-1 text-xs px-2 py-1`}>
                  {getStatusIcon(project.status)}
                  {project.status}
                </Badge>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-red-500" />
                  {project.location}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-red-500" />
                  {new Date(project.targetEndDate).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-red-700">{project.progress}%</div>
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-red-500 to-red-600 h-full rounded-full"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
              {canEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditProject(project.id);
                  }}
                  className="p-1 h-auto text-gray-400 hover:text-red-600"
                >
                  <Edit className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderTableView = (projects: Project[]) => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="text-left">Project</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-center">Timeline</TableHead>
            <TableHead className="text-center">Progress</TableHead>
            <TableHead className="text-left">Location</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow 
              key={project.id} 
              className="bg-gradient-to-r from-gray-100 via-gray-50 to-white hover:from-red-50 hover:to-red-25 cursor-pointer transition-all duration-300 border-l-4 border-l-gray-300 hover:border-l-red-500 border-t border-b border-r border-gray-200 shadow-sm hover:shadow-md"
              onClick={() => handleProjectClick(project.id)}
            >
              <TableCell className="max-w-64">
                <div>
                  <div className="text-sm text-gray-900 truncate">{project.title}</div>
                  <div className="text-xs text-gray-500 truncate">{project.description}</div>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <Badge className={`${getStatusColor(project.status)} border flex items-center gap-1 text-xs w-fit mx-auto px-2 py-1`}>
                  {getStatusIcon(project.status)}
                  {project.status}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <div className="text-xs text-gray-600">
                  <div>
                    {new Date(project.startDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric'
                    })}
                    {' - '}
                    {new Date(project.targetEndDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric' 
                    })}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-red-500 to-red-600 h-full rounded-full"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-red-600 w-8">{project.progress}%</span>
                </div>
              </TableCell>
              <TableCell className="text-left">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate max-w-32">{project.location}</span>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-1">
                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditProject(project.id);
                      }}
                      className="p-1 h-auto text-gray-400 hover:text-red-600"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleProjectClick(project.id)}
                    className="p-1 h-auto text-gray-400 hover:text-red-600"
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  // ========================================
  // RENDER: Section Content
  // ========================================

  const renderSectionContent = () => {
    const Icon = getSectionIcon(activeSection);
    const currentProjects = getCurrentSectionProjects();
    const totalPages = getTotalPages();
    const sectionProjects = projectsByCategory[activeSection as keyof typeof projectsByCategory] || [];

    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN - 3/12 - Section Info & Filters */}
        <div className="lg:col-span-3">
          <div className="bg-white border-2 border-gray-100 rounded-2xl shadow-xl p-8 space-y-8 sticky top-32 backdrop-blur-sm bg-white/95">
            {/* Section Header */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <Icon className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl text-gray-900 mb-3">
                {getSectionTitle(activeSection)}
              </h2>
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 inline-block">
                <p className="text-sm text-red-700">
                  {sectionProjects.length} {sectionProjects.length === 1 ? 'Project' : 'Projects'}
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-gray-500">Filter Options</span>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <Filter className="h-4 w-4 text-red-600" />
                  </div>
                  <h3 className="text-base text-gray-900">Filters</h3>
                </div>
                {(statusFilter !== 'all' || yearFilter !== 'all' || searchQuery !== '') && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleResetFilters}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 h-auto rounded-lg"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>

              {/* Search */}
              <div className="space-y-3">
                <Label htmlFor="search" className="text-sm text-gray-700 flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Search Projects
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by title or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 text-sm border-gray-300 focus:border-red-500 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="space-y-3">
                <Label htmlFor="status" className="text-sm text-gray-700 flex items-center gap-2">
                  <PlayCircle className="h-4 w-4" />
                  Project Status
                </Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="status" className="text-sm border-gray-300 focus:border-red-500 focus:ring-red-500">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Ongoing">Ongoing</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Planned">Planned</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Year Filter */}
              {availableYears.length > 1 && (
                <div className="space-y-3">
                  <Label htmlFor="year" className="text-sm text-gray-700 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Project Year
                  </Label>
                  <Select value={yearFilter} onValueChange={setYearFilter}>
                    <SelectTrigger id="year" className="text-sm border-gray-300 focus:border-red-500 focus:ring-red-500">
                      <SelectValue placeholder="All Years" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      {availableYears.map(year => (
                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Add Project Button */}
              {canEdit && (
                <div className="pt-4 border-t border-gray-200">
                  <Button 
                    onClick={handleAddProject}
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Repair Project
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - 9/12 - Projects Display */}
        <div className="lg:col-span-9">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
            {/* Header with View Mode Controls */}
            <div className="bg-gradient-to-r from-red-50 to-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl text-gray-900 mb-1">
                    {getSectionTitle(activeSection)} Projects
                  </h2>
                  <p className="text-sm text-gray-600">
                    {sectionProjects.length} total projects
                  </p>
                </div>
                
                {/* View Mode Controls */}
                <div className="flex items-center gap-2">
                  <div className="bg-gray-100 rounded-lg p-1 flex">
                    <Button
                      variant={viewMode === 'card' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('card')}
                      className={`${viewMode === 'card' ? 'bg-red-600 text-white' : 'text-gray-600 hover:text-red-600'}`}
                    >
                      <Building2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className={`${viewMode === 'list' ? 'bg-red-600 text-white' : 'text-gray-600 hover:text-red-600'}`}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'table' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('table')}
                      className={`${viewMode === 'table' ? 'bg-red-600 text-white' : 'text-gray-600 hover:text-red-600'}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="min-h-96">
              {renderProjectContent()}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sectionProjects.length)} of {sectionProjects.length} projects
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="border-red-300 text-red-700 hover:bg-red-50"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={page === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className={page === currentPage 
                            ? "bg-red-600 text-white border-red-600" 
                            : "border-red-300 text-red-700 hover:bg-red-50"
                          }
                        >
                          {page}
                        </Button>
                      ))}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="border-red-300 text-red-700 hover:bg-red-50"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ProjectForm component for add/edit modal
  const ProjectForm = ({ project, onSave, onCancel }: {
    project: Project | null;
    onSave: (project: Project) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState<Project>(
      project || {
        id: '',
        title: '',
        description: '',
        category: 'emergency-repairs',
        status: 'Planned',
        progress: 0,
        location: '',
        startDate: '',
        targetEndDate: '',
        year: new Date().getFullYear()
      }
    );

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title">Project Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="emergency-repairs">Emergency Repairs</SelectItem>
                <SelectItem value="preventive-maintenance">Preventive Maintenance</SelectItem>
                <SelectItem value="facility-upgrades">Facility Upgrades</SelectItem>
                <SelectItem value="safety-compliance">Safety & Compliance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Planned">Planned</SelectItem>
                <SelectItem value="Ongoing">Ongoing</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="progress">Progress (%)</Label>
            <Input
              id="progress"
              type="number"
              min="0"
              max="100"
              value={formData.progress}
              onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div>
            <Label htmlFor="year">Year</Label>
            <Input
              id="year"
              type="number"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || new Date().getFullYear() })}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="targetEndDate">Target End Date</Label>
            <Input
              id="targetEndDate"
              type="date"
              value={formData.targetEndDate}
              onChange={(e) => setFormData({ ...formData, targetEndDate: e.target.value })}
              required
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="bg-red-600 hover:bg-red-700">
            {isEditing ? 'Update Project' : 'Add Project'}
          </Button>
        </DialogFooter>
      </form>
    );
  };

  // ========================================
  // MAIN RENDER
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
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-red-50 via-white to-red-50 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Wrench className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl bg-gradient-to-r from-red-600 via-red-700 to-red-600 bg-clip-text text-transparent mb-4">
              Facility Repairs & Maintenance
            </h1>
            <h2 className="text-2xl md:text-3xl text-gray-700 mb-6">
              Ensuring Safe and Functional Learning Environments
            </h2>
            <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Monitoring and evaluation of facility repair and maintenance projects across the university.
            </p>
          </div>

          {/* Status Tracker Cards - Interactive Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div 
              onClick={() => handleStatusCardClick('all')}
              className={`bg-white border rounded-xl p-6 shadow-sm cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                statusFilter === 'all' ? 'border-gray-500 bg-gray-50 ring-2 ring-gray-300' : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600">Total Projects</span>
                <Wrench className={`h-5 w-5 ${statusFilter === 'all' ? 'text-gray-700' : 'text-gray-600'}`} />
              </div>
              <div className={`text-3xl mb-1 ${statusFilter === 'all' ? 'text-gray-900 font-semibold' : 'text-gray-900'}`}>{statusCounts.total}</div>
              <div className="text-xs text-gray-500">All repair projects</div>
              {statusFilter === 'all' && (
                <div className="mt-3 text-xs text-gray-600 flex items-center gap-1">
                  <Filter className="h-3 w-3" />
                  Showing all
                </div>
              )}
            </div>

            <div 
              onClick={() => handleStatusCardClick('Ongoing')}
              className={`bg-white border rounded-xl p-6 shadow-sm cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                statusFilter === 'Ongoing' ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-300' : 'border-gray-200 hover:border-blue-400'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600">Ongoing</span>
                <PlayCircle className={`h-5 w-5 ${statusFilter === 'Ongoing' ? 'text-blue-700' : 'text-blue-600'}`} />
              </div>
              <div className={`text-3xl mb-1 ${statusFilter === 'Ongoing' ? 'text-blue-700 font-semibold' : 'text-blue-600'}`}>{statusCounts.ongoing}</div>
              <div className="text-xs text-gray-500">Currently in progress</div>
              {statusFilter === 'Ongoing' && (
                <div className="mt-3 text-xs text-blue-700 flex items-center gap-1">
                  <Filter className="h-3 w-3" />
                  Active filter
                </div>
              )}
            </div>

            <div 
              onClick={() => handleStatusCardClick('Completed')}
              className={`bg-white border rounded-xl p-6 shadow-sm cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                statusFilter === 'Completed' ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-300' : 'border-gray-200 hover:border-emerald-400'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600">Completed</span>
                <CheckCircle2 className={`h-5 w-5 ${statusFilter === 'Completed' ? 'text-emerald-700' : 'text-emerald-600'}`} />
              </div>
              <div className={`text-3xl mb-1 ${statusFilter === 'Completed' ? 'text-emerald-700 font-semibold' : 'text-emerald-600'}`}>{statusCounts.completed}</div>
              <div className="text-xs text-gray-500">Successfully finished</div>
              {statusFilter === 'Completed' && (
                <div className="mt-3 text-xs text-emerald-700 flex items-center gap-1">
                  <Filter className="h-3 w-3" />
                  Active filter
                </div>
              )}
            </div>

            <div 
              onClick={() => handleStatusCardClick('Planned')}
              className={`bg-white border rounded-xl p-6 shadow-sm cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                statusFilter === 'Planned' ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-300' : 'border-gray-200 hover:border-amber-400'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600">Planned</span>
                <Clock className={`h-5 w-5 ${statusFilter === 'Planned' ? 'text-amber-700' : 'text-amber-600'}`} />
              </div>
              <div className={`text-3xl mb-1 ${statusFilter === 'Planned' ? 'text-amber-700 font-semibold' : 'text-amber-600'}`}>{statusCounts.planned}</div>
              <div className="text-xs text-gray-500">Scheduled projects</div>
              {statusFilter === 'Planned' && (
                <div className="mt-3 text-xs text-amber-700 flex items-center gap-1">
                  <Filter className="h-3 w-4" />
                  Active filter
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Section Navigation - Centered */}
      <div className="border-b border-gray-200 bg-white sticky top-16 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center py-6">
            <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-xl border border-gray-200">
              {[
                { id: 'overview', label: 'Overview', icon: Target },
                { id: 'emergency-repairs', label: 'Emergency Repairs', icon: AlertTriangle },
                { id: 'preventive-maintenance', label: 'Preventive Maintenance', icon: Settings },
                { id: 'facility-upgrades', label: 'Facility Upgrades', icon: Zap },
                { id: 'safety-compliance', label: 'Safety & Compliance', icon: Shield }
              ].map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <Button
                    key={section.id}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleSectionChange(section.id)}
                    className={`flex items-center gap-2 whitespace-nowrap transition-all duration-200 ${
                      isActive 
                        ? 'bg-red-600 text-white hover:bg-red-700 shadow-md' 
                        : 'text-gray-600 hover:text-red-600 hover:bg-white hover:shadow-sm'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {section.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {renderSectionContent()}
        </div>
      </div>

      {/* Add/Edit Project Modal */}
      <Dialog open={showAddModal || isEditing} onOpenChange={(open) => {
        if (!open) {
          setShowAddModal(false);
          setIsEditing(false);
          setEditingProject(null);
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Repair Project' : 'Add New Repair Project'}
            </DialogTitle>
          </DialogHeader>
          <ProjectForm 
            project={editingProject}
            onSave={handleSaveProject}
            onCancel={() => {
              setShowAddModal(false);
              setIsEditing(false);
              setEditingProject(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Repair Project</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 mb-4">
            Are you sure you want to delete this repair project? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteProject}>
              Delete Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}