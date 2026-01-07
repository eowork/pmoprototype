import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Calendar, CalendarDays, Building, Download, Plus } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { 
  formatCurrency, 
  formatDate, 
  calculateProjectStats
} from '../utils/analyticsHelpers';
import { ProjectFormDialog } from '../ProjectFormDialog';
import { EnhancedProjectTable } from './EnhancedProjectTable';
import { ImprovedAnalyticsSection } from './ImprovedAnalyticsSection';
import { DateRangeFilter, DateRange, filterProjectsByDateRange } from './DateRangeFilter';
import { ConstructionProject } from '../types/ProjectTypes';
import { ProjectPageConfig } from '../config/projectPageConfigs';

interface GenericFundedProjectsPageProps {
  config: ProjectPageConfig;
  onProjectSelect: (project: ConstructionProject) => void;
  userRole: string;
  userEmail?: string;
  userDepartment?: string;
  filterData?: any;
  requireAuth: (action: string) => boolean;
  onClearFilters: () => void;
}

export function GenericFundedProjectsPage({
  config,
  onProjectSelect,
  userRole,
  userEmail = 'user@carsu.edu.ph',
  userDepartment = 'General',
  filterData,
  requireAuth,
  onClearFilters
}: GenericFundedProjectsPageProps) {
  const [projects, setProjects] = useState<ConstructionProject[]>([]);
  const [activeTab, setActiveTab] = useState('analytics');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [editingProject, setEditingProject] = useState<ConstructionProject | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });

  const Icon = config.icon;

  // Handle chart interactions for filtering
  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setActiveTab('projects'); // Switch to project list
    toast.success(`Filtered by status: ${status}`);
  };

  const handleProjectClick = (project: ConstructionProject) => {
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

  // Filter projects by date range
  const filteredProjects = useMemo(() => {
    return filterProjectsByDateRange(projects, dateRange);
  }, [projects, dateRange]);

  // Calculate stats based on filtered projects
  const projectStats = useMemo(() => {
    return calculateProjectStats(filteredProjects);
  }, [filteredProjects]);

  const handleProjectSubmit = (projectData: Partial<ConstructionProject>) => {
    if (!requireAuth('manage projects')) return;

    if (editingProject) {
      const updatedProjects = projects.map(p =>
        p.id === editingProject.id ? { ...p, ...projectData } : p
      );
      setProjects(updatedProjects);
      toast.success('Project updated successfully');
    } else {
      const newProject: ConstructionProject = {
        id: `${config.category}-${Date.now()}`,
        projectTitle: '',
        dateStarted: '',
        fundingSource: config.defaultFundingSource,
        approvedBudget: 0,
        appropriation: 0,
        obligation: 0,
        status: 'Planning',
        remarks: '',
        category: config.category,
        ...projectData
      } as ConstructionProject;
      
      setProjects([...projects, newProject]);
      toast.success('Project added successfully');
    }

    setShowProjectDialog(false);
    setEditingProject(null);
  };

  const handleProjectDelete = (project: ConstructionProject) => {
    if (!requireAuth('delete projects')) return;
    setProjects(prevProjects => prevProjects.filter(p => p.id !== project.id));
    toast.success('Project deleted successfully');
  };

  const handleEditProject = (project: ConstructionProject) => {
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
              <div className="p-3 bg-primary/10 rounded-lg">
                <Icon className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl text-gray-900">{config.title}</h1>
                <p className="text-sm text-gray-600 mt-0.5">{config.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {(userRole === 'Admin' || userRole === 'Staff') && (
                <Button
                  onClick={() => {
                    setEditingProject(null);
                    setShowProjectDialog(true);
                  }}
                  className="gap-2 shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  Add Project
                </Button>
              )}
              <Button variant="outline" className="gap-2 border-gray-200 hover:bg-gray-50">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Date Range Filter */}
        <DateRangeFilter 
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          className="mb-6"
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white border border-gray-200 p-1">
            <TabsTrigger value="analytics" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              Data Analytics
            </TabsTrigger>
            <TabsTrigger value="projects" className="data-[state=active]:bg-primary data-[state=active]:text-white">
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
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Building className="h-4 w-4 text-blue-600" />
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
                    {filteredProjects.filter(p => p.status === 'Delayed' || p.status === 'Suspended').length}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Delayed or suspended
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

            {/* Improved Analytics Section */}
            <ImprovedAnalyticsSection
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
            <EnhancedProjectTable
              projects={filteredProjects}
              userRole={userRole}
              userEmail={userEmail}
              userDepartment={userDepartment}
              onProjectSelect={onProjectSelect}
              onEditProject={handleEditProject}
              onDeleteProject={handleProjectDelete}
              canEdit={userRole === 'Admin' || userRole === 'Staff'}
              canDelete={userRole === 'Admin'}
              externalStatusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Project Form Dialog */}
      <ProjectFormDialog
        open={showProjectDialog}
        onOpenChange={setShowProjectDialog}
        project={editingProject}
        onSubmit={handleProjectSubmit}
      />
    </div>
  );
}
