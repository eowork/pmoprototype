import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Calendar, CalendarDays, Building, Download, Plus } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { RepairProject } from '../types/RepairTypes';
import { RepairProjectFormDialog } from '../RepairProjectFormDialog';
import { EnhancedRepairProjectTable } from './EnhancedRepairProjectTable';
import { ImprovedRepairAnalyticsSection } from './ImprovedRepairAnalyticsSection';
import { RepairDateRangeFilter, RepairDateRange, filterRepairProjectsByDateRange } from './RepairDateRangeFilter';
import { enhancedRepairsRBACService } from '../services/EnhancedRBACService';

interface RepairPageConfig {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  category: string;
  sampleProjects: RepairProject[];
}

interface GenericRepairProjectsPageProps {
  config: RepairPageConfig;
  onProjectSelect: (project: RepairProject) => void;
  userRole: string;
  userEmail?: string;
  userDepartment?: string;
  filterData?: any;
  requireAuth: (action: string) => boolean;
  onClearFilters: () => void;
}

export function GenericRepairProjectsPage({
  config,
  onProjectSelect,
  userRole,
  userEmail = 'user@carsu.edu.ph',
  userDepartment = 'General',
  filterData,
  requireAuth,
  onClearFilters
}: GenericRepairProjectsPageProps) {
  const [projects, setProjects] = useState<RepairProject[]>([]);
  const [activeTab, setActiveTab] = useState('analytics');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [editingProject, setEditingProject] = useState<RepairProject | null>(null);
  const [dateRange, setDateRange] = useState<RepairDateRange>({ from: undefined, to: undefined });

  const Icon = config.icon;

  // ============================================
  // RBAC IMPLEMENTATION
  // ============================================
  
  // Get user permissions
  const userPermissions = enhancedRepairsRBACService.getUserPermissions(
    userEmail,
    userRole,
    userDepartment,
    config.category
  );

  // Get projects assigned to this user (for Staff)
  const assignedProjectIds = userPermissions.assignedProjects || [];

  // Filter projects based on RBAC
  // Admin and Client can see all projects
  // Staff can only see projects they are assigned to
  const visibleProjects = useMemo(() => {
    if (userRole === 'Admin' || userRole === 'Client') {
      return projects;
    }
    
    // Staff can only see their assigned projects
    if (assignedProjectIds.length > 0) {
      return projects.filter(p => assignedProjectIds.includes(p.id));
    }
    
    // If staff has no assignments, show empty list
    return [];
  }, [projects, userRole, assignedProjectIds]);

  // Handle chart interactions for filtering
  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setActiveTab('projects'); // Switch to project list
    toast.success(`Filtered by status: ${status}`);
  };

  const handleProjectClick = (project: RepairProject) => {
    onProjectSelect(project);
  };

  // Enhanced status filter syncing
  useEffect(() => {
    if (filterData && filterData.status) {
      setStatusFilter(filterData.status);
      setActiveTab('projects');
    }
  }, [filterData]);

  // Initialize with sample data
  useEffect(() => {
    setProjects(config.sampleProjects);
  }, [config.sampleProjects]);

  // Filter visible projects by date range
  const filteredProjects = useMemo(() => {
    return filterRepairProjectsByDateRange(visibleProjects, dateRange);
  }, [visibleProjects, dateRange]);

  // Calculate stats based on filtered projects
  const projectStats = useMemo(() => {
    const totalProjects = filteredProjects.length;
    const completedProjects = filteredProjects.filter(p => p.status === 'Completed').length;
    const ongoingProjects = filteredProjects.filter(p => p.status === 'In Progress').length;
    const atRiskProjects = filteredProjects.filter(p => p.status === 'Overdue' || p.status === 'On Hold').length;
    const completionRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;

    return {
      totalProjects,
      completedProjects,
      ongoingProjects,
      atRiskProjects,
      completionRate
    };
  }, [filteredProjects]);

  const handleProjectSubmit = (projectData: Partial<RepairProject>) => {
    if (!requireAuth('manage projects')) return;

    if (editingProject) {
      // Check if user can edit this specific project
      const canEdit = userRole === 'Admin' || 
        enhancedRepairsRBACService.canEditProject(userEmail, userRole, editingProject.id);
      
      if (!canEdit) {
        toast.error('You do not have permission to edit this project');
        return;
      }

      const updatedProjects = projects.map(p =>
        p.id === editingProject.id ? { ...p, ...projectData, updatedAt: new Date().toISOString() } : p
      );
      setProjects(updatedProjects);
      toast.success('Repair project updated successfully');
    } else {
      // Check if user can add projects
      if (!userPermissions.canAdd) {
        toast.error('You do not have permission to create projects');
        return;
      }

      const newProject: RepairProject = {
        id: `${config.category}-${Date.now()}`,
        title: '',
        description: '',
        campus: 'CSU Main',
        building: '',
        location: '',
        repairType: 'Other',
        priority: 'Medium',
        status: 'Pending',
        startDate: '',
        endDate: '',
        budget: 0,
        spent: 0,
        projectManager: '',
        emergencyRepair: false,
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...projectData
      } as RepairProject;
      
      setProjects([...projects, newProject]);
      toast.success('Repair project added successfully');
    }

    setShowProjectDialog(false);
    setEditingProject(null);
  };

  const handleProjectDelete = (project: RepairProject) => {
    if (!requireAuth('delete projects')) return;
    
    // Check if user can delete this specific project
    const canDelete = userRole === 'Admin' || 
      enhancedRepairsRBACService.canDeleteProject(userEmail, userRole, project.id);
    
    if (!canDelete) {
      toast.error('You do not have permission to delete this project');
      return;
    }

    setProjects(prevProjects => prevProjects.filter(p => p.id !== project.id));
    toast.success('Repair project deleted successfully');
  };

  const handleEditProject = (project: RepairProject) => {
    // Check if user can edit this specific project
    const canEdit = userRole === 'Admin' || 
      enhancedRepairsRBACService.canEditProject(userEmail, userRole, project.id);
    
    if (!canEdit) {
      toast.error('You do not have permission to edit this project');
      return;
    }

    setEditingProject(project);
    setShowProjectDialog(true);
  };

  return (
    <div className="min-h-screen bg-gray-50/30">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white shadow-sm">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-lg">
                <Icon className="h-7 w-7 text-amber-600" />
              </div>
              <div>
                <h1 className="text-2xl text-gray-900">{config.title}</h1>
                <p className="text-sm text-gray-600 mt-0.5">{config.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {userPermissions.canAdd && (
                <Button
                  onClick={() => {
                    setEditingProject(null);
                    setShowProjectDialog(true);
                  }}
                  className="gap-2 shadow-sm bg-amber-600 hover:bg-amber-700"
                >
                  <Plus className="h-4 w-4" />
                  Add Project
                </Button>
              )}
              {userPermissions.canExportData && (
                <Button variant="outline" className="gap-2 border-gray-200 hover:bg-gray-50">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Date Range Filter */}
        <RepairDateRangeFilter 
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          className="mb-6"
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white border border-gray-200 p-1">
            <TabsTrigger value="analytics" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              Data Analytics
            </TabsTrigger>
            <TabsTrigger value="projects" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              Project List
            </TabsTrigger>
          </TabsList>

          {/* Data Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6 mt-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm text-gray-600">Total Projects</CardTitle>
                  <div className="p-2 bg-amber-50 rounded-lg">
                    <Building className="h-4 w-4 text-amber-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl text-gray-900">{projectStats.totalProjects}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    {projectStats.ongoingProjects} ongoing
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm text-gray-600">Completed Projects</CardTitle>
                  <div className="p-2 bg-emerald-50 rounded-lg">
                    <Building className="h-4 w-4 text-emerald-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl text-gray-900">
                    {projectStats.completedProjects}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Successfully completed
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm text-gray-600">Projects at Risk</CardTitle>
                  <div className="p-2 bg-red-50 rounded-lg">
                    <CalendarDays className="h-4 w-4 text-red-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl text-gray-900">
                    {projectStats.atRiskProjects}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Overdue or on hold
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm text-gray-600">Completion Rate</CardTitle>
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Calendar className="h-4 w-4 text-purple-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl text-gray-900">{projectStats.completionRate}%</div>
                  <p className="text-xs text-gray-500 mt-1">
                    Projects completed
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Improved Analytics Section with Campus Separation */}
            <ImprovedRepairAnalyticsSection
              projects={filteredProjects}
              userEmail={userEmail}
              userRole={userRole}
              onProjectClick={handleProjectClick}
              onStatusFilter={handleStatusFilter}
            />
          </TabsContent>

          {/* Project List Tab */}
          <TabsContent value="projects" className="space-y-6 mt-6">
            {/* Enhanced Project Table with RBAC and Column Selection */}
            <EnhancedRepairProjectTable
              projects={filteredProjects}
              userRole={userRole}
              userEmail={userEmail}
              userDepartment={userDepartment}
              onProjectSelect={onProjectSelect}
              onEditProject={handleEditProject}
              onDeleteProject={handleProjectDelete}
              canEdit={userPermissions.canEdit}
              canDelete={userPermissions.canDelete}
              externalStatusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Project Form Dialog */}
      <RepairProjectFormDialog
        open={showProjectDialog}
        onOpenChange={setShowProjectDialog}
        project={editingProject}
        onSubmit={handleProjectSubmit}
      />
    </div>
  );
}
