import React, { useState, useMemo } from 'react';
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
  List
} from 'lucide-react';
import { ClientNavbar } from '../components/ClientNavbar';
import { NavigationProps } from '../types';

// ========================================
// TYPE DEFINITIONS
// ========================================

interface ConstructionInfrastructurePageProps extends NavigationProps {
  currentSection?: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  category: 'gaa-funded' | 'locally-funded' | 'special-grants';
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
    id: 'proj-001',
    title: 'Modern Learning Center Complex',
    description: 'State-of-the-art academic building with smart classrooms and laboratories.',
    category: 'gaa-funded',
    status: 'Ongoing',
    progress: 78,
    location: 'Main Campus, Building C',
    startDate: '2024-01-15',
    targetEndDate: '2025-06-30',
    year: 2024
  },
  {
    id: 'proj-002',
    title: 'Digital Library and Learning Hub',
    description: 'Comprehensive library modernization with digital resources.',
    category: 'gaa-funded',
    status: 'Completed',
    progress: 100,
    location: 'Main Campus, Library Building',
    startDate: '2023-08-01',
    targetEndDate: '2024-06-30',
    year: 2024
  },
  {
    id: 'proj-003',
    title: 'Campus Greenway and Sustainability Project',
    description: 'Campus beautification with sustainable landscaping.',
    category: 'locally-funded',
    status: 'Completed',
    progress: 100,
    location: 'Campus-wide',
    startDate: '2024-03-01',
    targetEndDate: '2024-08-31',
    year: 2024
  },
  {
    id: 'proj-004',
    title: 'Innovation and Research Hub',
    description: 'World-class research facility for academic research.',
    category: 'special-grants',
    status: 'Ongoing',
    progress: 65,
    location: 'Research Complex, Building A',
    startDate: '2023-11-01',
    targetEndDate: '2025-08-31',
    year: 2023
  },
  {
    id: 'proj-gymnasium-001',
    title: 'University Gymnasium and Cultural Center',
    description: 'Multi-purpose gymnasium and cultural performance venue serving the university community.',
    category: 'gaa-funded',
    status: 'Ongoing',
    progress: 68.8, // Average of phase accomplishments: (100 + 98.1 + 8.3) / 3 = 68.8%
    financialProgress: 40,
    targetProgress: 75, // Target at this time
    location: 'Athletics Complex, Central Campus',
    startDate: '2023-06-01',
    targetEndDate: '2025-12-31',
    year: 2023,
    budget: '₱178,112,318.02',
    phases: [
      { name: 'Phase 1', completion: 100, target: 100 },
      { name: 'Phase 2', completion: 98.1, target: 100 },
      { name: 'Phase 3', completion: 8.3, target: 45 }
    ]
  },
  {
    id: 'proj-005',
    title: 'Renewable Energy Campus Initiative',
    description: 'Installation of renewable energy infrastructure.',
    category: 'special-grants',
    status: 'Completed',
    progress: 100,
    location: 'Campus-wide',
    startDate: '2023-06-01',
    targetEndDate: '2024-10-31',
    year: 2024
  },
  {
    id: 'proj-006',
    title: 'Student Wellness and Athletic Complex',
    description: 'Modernization of sports facilities and fitness center.',
    category: 'locally-funded',
    status: 'Planned',
    progress: 0,
    location: 'Athletic Complex',
    startDate: '2025-02-01',
    targetEndDate: '2026-01-31',
    year: 2025
  }
];

// ========================================
// MAIN COMPONENT
// ========================================

export function ConstructionInfrastructurePage({ 
  onNavigate, 
  onSignIn, 
  onSignOut,
  onNavigateToDashboard,
  userRole = 'Client', 
  userProfile,
  requireAuth, 
  onAuthModalSignIn, 
  demoMode = false
}: ConstructionInfrastructurePageProps) {

  // ========================================
  // STATE MANAGEMENT
  // ========================================
  
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [activeSection, setActiveSection] = useState<string>('overview');
  
  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // View mode state - LIST as default
  const [viewMode, setViewMode] = useState<'card' | 'list' | 'table'>('list');

  // CRUD state
  const [isEditing, setIsEditing] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

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
      'gaa-funded': globallyFilteredProjects.filter(p => p.category === 'gaa-funded'),
      'locally-funded': globallyFilteredProjects.filter(p => p.category === 'locally-funded'),
      'special-grants': globallyFilteredProjects.filter(p => p.category === 'special-grants')
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
    console.log('🖱️ Project clicked:', projectId);
    if (onNavigate) {
      onNavigate('client-construction-project-detail', projectId);
    } else {
      console.error('❌ onNavigate function not available');
    }
  };

  const handleAddProject = () => {
    if (canEdit) {
      setShowAddModal(true);
    }
  };

  const handleEditProject = (projectId: string) => {
    if (canEdit) {
      const project = projects.find(p => p.id === projectId);
      if (project) {
        setEditingProject(project);
        setIsEditing(true);
      }
    }
  };

  const handleDeleteProject = (projectId: string) => {
    if (canEdit) {
      setProjectToDelete(projectId);
      setShowDeleteModal(true);
    }
  };

  const confirmDeleteProject = () => {
    if (projectToDelete) {
      setProjects(prev => prev.filter(p => p.id !== projectToDelete));
      setProjectToDelete(null);
      setShowDeleteModal(false);
      toast.success('Project deleted successfully');
    }
  };

  const handleSaveProject = (projectData: Partial<Project>) => {
    if (editingProject) {
      // Update existing project
      setProjects(prev => 
        prev.map(p => 
          p.id === editingProject.id 
            ? { ...p, ...projectData, lastUpdated: new Date().toISOString() }
            : p
        )
      );
      toast.success('Project updated successfully');
    } else {
      // Add new project
      const newProject: Project = {
        id: `proj-${Date.now()}`,
        title: projectData.title || '',
        description: projectData.description || '',
        category: projectData.category || 'gaa-funded',
        status: projectData.status || 'Planned',
        progress: projectData.progress || 0,
        location: projectData.location || '',
        startDate: projectData.startDate || new Date().toISOString(),
        targetEndDate: projectData.targetEndDate || new Date().toISOString(),
        year: new Date(projectData.startDate || Date.now()).getFullYear()
      };
      setProjects(prev => [...prev, newProject]);
      toast.success('Project added successfully');
    }
    
    setIsEditing(false);
    setEditingProject(null);
    setShowAddModal(false);
  };

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Ongoing': return <PlayCircle className="h-3 w-3" />;
      case 'Completed': return <CheckCircle2 className="h-3 w-3" />;
      case 'Planned': return <Clock className="h-3 w-3" />;
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

  const getSectionTitle = (section: string) => {
    switch (section) {
      case 'overview': return 'Overview';
      case 'gaa-funded': return 'GAA Funded Projects';
      case 'locally-funded': return 'Locally Funded Projects';
      case 'special-grants': return 'Special Grants & Partnership';
      default: return 'Projects';
    }
  };

  const getSectionIcon = (section: string) => {
    switch (section) {
      case 'overview': return Target;
      case 'gaa-funded': return Award;
      case 'locally-funded': return MapPin;
      case 'special-grants': return Heart;
      default: return Building2;
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
            <Building2 className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-lg text-gray-900 mb-2">No Projects Found</h3>
          <p className="text-sm text-gray-600 mb-4">
            No projects match your current filters.
          </p>
          {canEdit && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleAddProject()}
              className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
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
          className="bg-gradient-to-br from-gray-50 via-white to-gray-50 border border-gray-300 rounded-xl p-6 hover:shadow-xl hover:border-emerald-400 hover:from-emerald-50 hover:to-emerald-25 cursor-pointer transition-all duration-300 group shadow-md backdrop-blur-sm"
          onClick={() => handleProjectClick(project.id)}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-base text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
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
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto text-gray-400 hover:text-emerald-600"
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
              <span className="text-emerald-600">{project.progress}%</span>
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
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full rounded-full transition-all duration-300"
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
                      ? 'text-emerald-600' 
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

          {/* Financial vs Physical Comparison */}
          {project.financialProgress && (
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Financial Progress</span>
                <span className="text-blue-600">{project.financialProgress}%</span>
              </div>
              <div className="bg-gray-200 rounded-full h-2 overflow-hidden mb-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${project.financialProgress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">vs Physical ({project.progress}%)</span>
                <span className={`${
                  project.progress > project.financialProgress 
                    ? 'text-emerald-600' 
                    : 'text-amber-600'
                }`}>
                  {project.progress > project.financialProgress ? 'Ahead' : 'Behind'} by {Math.abs(project.progress - project.financialProgress).toFixed(1)}%
                </span>
              </div>
            </div>
          )}

          {/* Phase Breakdown */}
          {project.phases && project.phases.length > 0 && (
            <div className="bg-amber-50 rounded-lg p-4 mb-4">
              <div className="text-sm text-gray-600 mb-2">Phase Progress</div>
              <div className="space-y-2">
                {project.phases.map((phase, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 truncate flex-1">{phase.name}</span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`${
                        phase.completion >= phase.target 
                          ? 'text-emerald-600' 
                          : phase.completion < phase.target - 10 
                            ? 'text-red-600' 
                            : 'text-amber-600'
                      }`}>
                        {phase.completion}%
                      </span>
                      <div className="w-16 bg-gray-200 rounded-full h-1">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            phase.completion >= phase.target 
                              ? 'bg-emerald-500' 
                              : phase.completion < phase.target - 10 
                                ? 'bg-red-500' 
                                : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.min(phase.completion, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span className="truncate">{project.location}</span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderListView = (projects: Project[]) => (
    <div className="divide-y divide-gray-100">
      {projects.map((project) => (
        <div 
          key={project.id}
          className="p-6 bg-gradient-to-r from-gray-100 via-gray-50 to-white hover:from-emerald-50 hover:to-emerald-25 cursor-pointer transition-all duration-300 group border-l-4 border-l-gray-300 hover:border-l-emerald-500 shadow-md hover:shadow-lg backdrop-blur-sm border-t border-b border-r border-gray-200"
          onClick={() => handleProjectClick(project.id)}
        >
          <div className="flex items-center justify-between gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-base text-gray-900 truncate group-hover:text-emerald-700 transition-colors">
                  {project.title}
                </h3>
                <Badge className={`${getStatusColor(project.status)} border flex items-center gap-1.5 text-xs flex-shrink-0 px-2 py-1`}>
                  {getStatusIcon(project.status)}
                  {project.status}
                </Badge>
                {canEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditProject(project.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto text-gray-400 hover:text-emerald-600"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                )}
              </div>
              
              {/* Timeline Row */}
              <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(project.startDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric' 
                    })}
                    {' → '}
                    {new Date(project.targetEndDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span className="truncate">{project.location}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Progress</span>
                    <span className="text-emerald-600">{project.progress}%</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0 group-hover:text-emerald-500 transition-colors" />
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
              className="bg-gradient-to-r from-gray-100 via-gray-50 to-white hover:from-emerald-50 hover:to-emerald-25 cursor-pointer transition-all duration-300 border-l-4 border-l-gray-300 hover:border-l-emerald-500 border-t border-b border-r border-gray-200 shadow-sm hover:shadow-md"
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
                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full rounded-full"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-emerald-600 w-8">{project.progress}%</span>
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
                      className="p-1 h-auto text-gray-400 hover:text-emerald-600"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleProjectClick(project.id)}
                    className="p-1 h-auto text-gray-400 hover:text-emerald-600"
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
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <Icon className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl text-gray-900 mb-3">
                {getSectionTitle(activeSection)}
              </h2>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2 inline-block">
                <p className="text-sm text-emerald-700">
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
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Filter className="h-4 w-4 text-emerald-600" />
                  </div>
                  <h3 className="text-base text-gray-900">Filters</h3>
                </div>
                {(statusFilter !== 'all' || yearFilter !== 'all' || searchQuery !== '') && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleResetFilters}
                    className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-3 py-1.5 h-auto rounded-lg"
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
                    className="pl-10 text-sm border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
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
                  <SelectTrigger id="status" className="text-sm border-gray-300 focus:border-emerald-500 focus:ring-emerald-500">
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
              <div className="space-y-3">
                <Label htmlFor="year" className="text-sm text-gray-700 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Project Year
                </Label>
                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger id="year" className="text-sm border-gray-300 focus:border-emerald-500 focus:ring-emerald-500">
                    <SelectValue placeholder="All Years" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {availableYears.map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-r from-emerald-50 to-amber-50 border border-emerald-200 rounded-xl p-6">
              <h4 className="text-sm text-gray-700 mb-4 text-center">Section Summary</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-lg text-emerald-600">{sectionProjects.filter(p => p.status === 'Ongoing').length}</div>
                  <div className="text-xs text-gray-600">Ongoing</div>
                </div>
                <div className="text-center">
                  <div className="text-lg text-emerald-600">{sectionProjects.filter(p => p.status === 'Completed').length}</div>
                  <div className="text-xs text-gray-600">Completed</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - 9/12 - Project Display */}
        <div className="lg:col-span-9">
          <div className="bg-white border-2 border-gray-100 shadow-xl rounded-2xl overflow-hidden backdrop-blur-sm bg-white/95">
            {/* Header with View Toggle */}
            <div className="bg-gradient-to-r from-gray-50 to-white border-b-2 border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl text-gray-900 mb-1">Project Portfolio</h3>
                  <p className="text-sm text-gray-600">
                    Displaying {currentProjects.length} of {sectionProjects.length} projects
                  </p>
                </div>
                {canEdit && (
                  <Button 
                    size="sm" 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
                    onClick={() => handleAddProject()}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Project
                  </Button>
                )}
              </div>
              
              {/* View Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 mr-2">View:</span>
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <Button
                    variant={viewMode === 'card' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('card')}
                    className={`px-3 py-1.5 text-xs ${
                      viewMode === 'card' 
                        ? 'bg-emerald-600 text-white shadow-md' 
                        : 'text-gray-600 hover:text-emerald-600'
                    }`}
                  >
                    <Building2 className="h-3 w-3 mr-1" />
                    Cards
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1.5 text-xs ${
                      viewMode === 'list' 
                        ? 'bg-emerald-600 text-white shadow-md' 
                        : 'text-gray-600 hover:text-emerald-600'
                    }`}
                  >
                    <List className="h-3 w-3 mr-1" />
                    List
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                    className={`px-3 py-1.5 text-xs ${
                      viewMode === 'table' 
                        ? 'bg-emerald-600 text-white shadow-md' 
                        : 'text-gray-600 hover:text-emerald-600'
                    }`}
                  >
                    <Filter className="h-3 w-3 mr-1" />
                    Table
                  </Button>
                </div>
              </div>
            </div>

            {/* Project Display */}
            {renderProjectContent()}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sectionProjects.length)} of {sectionProjects.length}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
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
      <section className="bg-gradient-to-br from-emerald-50 via-white to-amber-50 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-600 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Building2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-amber-600 bg-clip-text text-transparent mb-4">
              Construction & Infrastructure
            </h1>
            <h2 className="text-2xl md:text-3xl text-gray-700 mb-6">
              Building Excellence for Academic Success
            </h2>
            <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Monitoring and evaluation of infrastructure development projects across the university.
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
                <Building2 className={`h-5 w-5 ${statusFilter === 'all' ? 'text-gray-700' : 'text-gray-600'}`} />
              </div>
              <div className={`text-3xl mb-1 ${statusFilter === 'all' ? 'text-gray-900 font-semibold' : 'text-gray-900'}`}>{statusCounts.total}</div>
              <div className="text-xs text-gray-500">All infrastructure projects</div>
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
                { id: 'gaa-funded', label: 'GAA Funded', icon: Award },
                { id: 'locally-funded', label: 'Locally Funded', icon: MapPin },
                { id: 'special-grants', label: 'Special Grants', icon: Heart }
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
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md' 
                        : 'text-gray-600 hover:text-emerald-600 hover:bg-white hover:shadow-sm'
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
              {isEditing ? 'Edit Project' : 'Add New Project'}
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
            <DialogTitle>Delete Project</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 mb-4">
            Are you sure you want to delete this project? This action cannot be undone.
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

// ========================================
// PROJECT FORM COMPONENT
// ========================================

interface ProjectFormProps {
  project?: Project | null;
  onSave: (data: Partial<Project>) => void;
  onCancel: () => void;
}

function ProjectForm({ project, onSave, onCancel }: ProjectFormProps) {
  const [formData, setFormData] = useState({
    title: project?.title || '',
    description: project?.description || '',
    category: project?.category || 'gaa-funded',
    status: project?.status || 'Planned',
    progress: project?.progress || 0,
    location: project?.location || '',
    startDate: project?.startDate || new Date().toISOString().split('T')[0],
    targetEndDate: project?.targetEndDate || new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="title">Project Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter project title"
            required
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter project description"
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
              <SelectItem value="gaa-funded">GAA Funded</SelectItem>
              <SelectItem value="locally-funded">Locally Funded</SelectItem>
              <SelectItem value="special-grants">Special Grants</SelectItem>
            </SelectContent>
          </Select>
        </div>

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

        <div className="md:col-span-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Enter project location"
            required
          />
        </div>

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

        <div className="md:col-span-2">
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
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
          {project ? 'Update Project' : 'Add Project'}
        </Button>
      </DialogFooter>
    </form>
  );
}
