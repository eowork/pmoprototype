import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Building2, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Users, 
  Filter, 
  X, 
  ArrowLeft,
  Plus,
  Download,
  RefreshCw,
  BarChart3,
  Activity,
  Target,
  CheckCircle
} from 'lucide-react';
import { ProjectTable } from './CategoryPage/ProjectTable';
import { AnalyticsSection } from './CategoryPage/AnalyticsSection';
import { ProjectFormDialog } from './CategoryPage/ProjectFormDialog';
import { getAllProjects, getProjectsByCategory, Project } from '../utils/projectData';
import { getCategoryDisplayName } from './constants/sidebarConfig';
import { toast } from 'sonner@2.0.3';

interface CategoryPageProps {
  category: string;
  onProjectSelect: (project: Project) => void;
  userRole: string;
  filterData?: { type: string; filters: any } | null;
  requireAuth: (action: string) => boolean;
  onClearFilters: () => void;
}

export function CategoryPage({
  category,
  onProjectSelect,
  userRole,
  filterData,
  requireAuth,
  onClearFilters
}: CategoryPageProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('projectName');
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // ENHANCED: Load projects with proper synchronization
  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      const allProjects = await getAllProjects();
      
      // Filter projects by category with better matching
      const categoryProjects = allProjects.filter(project => {
        // Direct category match
        if (project.category === category) return true;
        
        // Handle legacy category mappings
        const legacyMappings = {
          'construction': ['construction', 'infrastructure'],
          'repairs': ['repairs', 'minor-repairs', 'major-repairs'],
          'fabrication': ['fabrication', 'fabrications'],
          'research-projects': ['research', 'internally-funded-research', 'externally-funded-research'],
        };
        
        const categoryGroup = legacyMappings[category];
        if (categoryGroup && categoryGroup.includes(project.category)) return true;
        
        return false;
      });
      
      setProjects(categoryProjects);
      
      // Sync with overview dashboard - update recent projects
      if (categoryProjects.length > 0) {
        console.log(`Loaded ${categoryProjects.length} projects for category: ${category}`);
      }
      
    } catch (error) {
      console.error('Error loading projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Apply filters from dashboard
  useEffect(() => {
    if (filterData) {
      const { filters } = filterData;
      if (filters.status) {
        setStatusFilter(filters.status);
      }
      if (filters.category && filters.category !== category) {
        // If filter is for different category, clear local filters
        setStatusFilter('all');
        setSearchTerm('');
      }
    }
  }, [filterData, category]);

  // ENHANCED: Manual refresh function
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProjects();
    setRefreshing(false);
    toast.success('Project data refreshed');
  };

  // Filter projects based on search and status
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.contractor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Sort projects
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case 'projectName':
        return a.projectName.localeCompare(b.projectName);
      case 'totalContractAmount':
        return b.totalContractAmount - a.totalContractAmount;
      case 'physicalAccomplishment':
        return b.physicalAccomplishment - a.physicalAccomplishment;
      case 'startDate':
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      case 'status':
        return a.status.localeCompare(b.status);
      default:
        return 0;
    }
  });

  // Calculate category statistics
  const categoryStats = {
    totalProjects: projects.length,
    totalBudget: projects.reduce((sum, p) => sum + p.totalContractAmount, 0),
    totalUtilized: projects.reduce((sum, p) => sum + (p.budgetUtilized || 0), 0),
    averageProgress: projects.length > 0 
      ? projects.reduce((sum, p) => sum + p.physicalAccomplishment, 0) / projects.length 
      : 0,
    completed: projects.filter(p => p.status === 'Completed').length,
    ongoing: projects.filter(p => p.status === 'Ongoing' || p.status === 'In Progress').length,
    planning: projects.filter(p => p.status === 'Planning').length,
  };

  // ACCESS CONTROL: Project management functions
  const handleCreateProject = () => {
    if (!requireAuth('create projects')) {
      return;
    }
    setEditingProject(null);
    setShowProjectForm(true);
  };

  const handleEditProject = (project: Project) => {
    if (!requireAuth('edit projects')) {
      return;
    }
    if (userRole === 'Client') {
      toast.error('Edit access denied. Staff or Admin privileges required.');
      return;
    }
    setEditingProject(project);
    setShowProjectForm(true);
  };

  const handleDeleteProject = async (project: Project) => {
    if (!requireAuth('delete projects')) {
      return;
    }
    if (userRole !== 'Admin') {
      toast.error('Delete access denied. Admin privileges required.');
      return;
    }
    
    try {
      // Simulate delete operation
      setProjects(prev => prev.filter(p => p.id !== project.id));
      toast.success('Project deleted successfully');
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  const handleProjectSave = async (projectData: any) => {
    try {
      if (editingProject) {
        // Update existing project
        setProjects(prev => prev.map(p => 
          p.id === editingProject.id 
            ? { ...p, ...projectData, updatedAt: new Date().toISOString() }
            : p
        ));
        toast.success('Project updated successfully');
      } else {
        // Create new project
        const newProject = {
          ...projectData,
          id: `${category}-${Date.now()}`,
          category,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'current-user',
          lastModifiedBy: 'current-user'
        };
        setProjects(prev => [...prev, newProject]);
        toast.success('Project created successfully');
      }
      setShowProjectForm(false);
      setEditingProject(null);
    } catch (error) {
      toast.error('Failed to save project');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: amount >= 1000000 ? 'compact' : 'standard',
      compactDisplay: 'short'
    }).format(amount);
  };

  const displayName = getCategoryDisplayName(category);

  if (loading) {
    return (
      <div className="h-full overflow-auto">
        <div className="p-4 md:p-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="p-4 md:p-8 space-y-6">
        {/* Enhanced Header */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="space-y-4 flex-1">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.history.back()}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Overview
                </Button>
              </div>
              
              <h1 className="text-2xl md:text-3xl font-bold text-primary">{displayName}</h1>
              <p className="text-muted-foreground">
                Manage and monitor {displayName.toLowerCase()} projects across the university
              </p>
            </div>

            {/* ENHANCED: Category Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-medium text-blue-900">Total Projects</span>
                </div>
                <div className="text-lg font-bold text-blue-600">{categoryStats.totalProjects}</div>
              </div>
              
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-medium text-green-900">Total Budget</span>
                </div>
                <div className="text-lg font-bold text-green-600">{formatCurrency(categoryStats.totalBudget)}</div>
              </div>
              
              <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-orange-600" />
                  <span className="text-xs font-medium text-orange-900">Avg Progress</span>
                </div>
                <div className="text-lg font-bold text-orange-600">{categoryStats.averageProgress.toFixed(1)}%</div>
              </div>
              
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-medium text-purple-900">Completed</span>
                </div>
                <div className="text-lg font-bold text-purple-600">{categoryStats.completed}</div>
              </div>
              
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-yellow-600" />
                  <span className="text-xs font-medium text-yellow-900">Ongoing</span>
                </div>
                <div className="text-lg font-bold text-yellow-600">{categoryStats.ongoing}</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="gap-2 flex-1 md:flex-none"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            {(userRole === 'Admin' || userRole === 'Staff') && (
              <Button onClick={handleCreateProject} className="gap-2 flex-1 md:flex-none">
                <Plus className="w-4 h-4" />
                Add Project
              </Button>
            )}
          </div>
        </div>

        {/* Active Filter Alert */}
        {filterData && (
          <Alert className="border-blue-200 bg-blue-50">
            <Filter className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>
                Active filter: <strong>{filterData.filters.title || `${filterData.filters.status || 'Filtered'} projects`}</strong>
              </span>
              <Button variant="ghost" size="sm" onClick={onClearFilters} className="gap-1">
                <X className="w-4 h-4" />
                Clear
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Enhanced Content Tabs */}
        <Tabs defaultValue="projects" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="projects" className="gap-2">
              <Building2 className="w-4 h-4" />
              Project List ({sortedProjects.length})
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics & Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-4">
            <ProjectTable
              projects={sortedProjects}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              sortBy={sortBy}
              setSortBy={setSortBy}
              onProjectSelect={onProjectSelect}
              onEditProject={handleEditProject}
              onDeleteProject={handleDeleteProject}
              userRole={userRole}
              showEnhancedColumns={true}
            />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <AnalyticsSection
              projects={projects}
              category={category}
              userRole={userRole}
            />
          </TabsContent>
        </Tabs>

        {/* Project Form Dialog */}
        {showProjectForm && (
          <ProjectFormDialog
            project={editingProject}
            category={category}
            isOpen={showProjectForm}
            onClose={() => {
              setShowProjectForm(false);
              setEditingProject(null);
            }}
            onSave={handleProjectSave}
            userRole={userRole}
          />
        )}
      </div>
    </div>
  );
}