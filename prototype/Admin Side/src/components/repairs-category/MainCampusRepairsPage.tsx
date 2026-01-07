import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Calendar,
  MapPin,
  Building2,
  Wrench,
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { mainCampusRepairsData } from './data/mainCampusRepairsData';
import { RepairProject } from './types/RepairTypes';
import { RepairAnalyticsSection } from './components/RepairAnalyticsSection';
import { RepairProjectTable } from './components/RepairProjectTable';
import { RepairProjectFormDialog } from './RepairProjectFormDialog';

interface MainCampusRepairsPageProps {
  category: string;
  onProjectSelect: (project: RepairProject) => void;
  userRole: string;
  filterData?: any;
  requireAuth: (action: string) => boolean;
  onClearFilters: () => void;
}

export function MainCampusRepairsPage({
  category,
  onProjectSelect,
  userRole,
  filterData,
  requireAuth,
  onClearFilters
}: MainCampusRepairsPageProps) {
  const [projects, setProjects] = useState<RepairProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedBuilding, setSelectedBuilding] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<RepairProject | null>(null);

  const canEdit = userRole === 'Admin' || userRole === 'Staff';

  // Load projects data
  useEffect(() => {
    setLoading(true);
    try {
      // Filter projects for Main Campus only
      const mainCampusProjects = mainCampusRepairsData.filter(
        project => project.campus === 'Main Campus' || project.campus === 'CSU'
      );
      setProjects(mainCampusProjects);
    } catch (error) {
      console.error('Error loading Main Campus repairs data:', error);
      toast.error('Failed to load repairs data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Apply filters to projects
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = searchTerm === '' || 
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.building.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
      const matchesType = filterType === 'all' || project.repairType === filterType;
      const matchesBuilding = selectedBuilding === 'all' || project.building === selectedBuilding;

      return matchesSearch && matchesStatus && matchesType && matchesBuilding;
    });
  }, [projects, searchTerm, filterStatus, filterType, selectedBuilding]);

  // Get unique buildings for filter
  const buildings = useMemo(() => {
    const uniqueBuildings = [...new Set(projects.map(p => p.building))];
    return uniqueBuildings.sort();
  }, [projects]);

  // Get repair types for filter
  const repairTypes = useMemo(() => {
    const uniqueTypes = [...new Set(projects.map(p => p.repairType))];
    return uniqueTypes.sort();
  }, [projects]);

  // Statistics for analytics
  const stats = useMemo(() => {
    const total = filteredProjects.length;
    const completed = filteredProjects.filter(p => p.status === 'Completed').length;
    const inProgress = filteredProjects.filter(p => p.status === 'In Progress').length;
    const pending = filteredProjects.filter(p => p.status === 'Pending').length;
    const overdue = filteredProjects.filter(p => p.status === 'Overdue').length;

    const totalBudget = filteredProjects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const spentBudget = filteredProjects.reduce((sum, p) => sum + (p.spent || 0), 0);

    return {
      total,
      completed,
      inProgress,
      pending,
      overdue,
      totalBudget,
      spentBudget,
      completionRate: total > 0 ? (completed / total) * 100 : 0
    };
  }, [filteredProjects]);

  const handleAddProject = () => {
    if (!requireAuth('add projects')) return;
    setEditingProject(null);
    setIsFormOpen(true);
  };

  const handleEditProject = (project: RepairProject) => {
    if (!requireAuth('edit projects')) return;
    setEditingProject(project);
    setIsFormOpen(true);
  };

  const handleDeleteProject = (projectId: string) => {
    if (!requireAuth('delete projects')) return;
    
    if (window.confirm('Are you sure you want to delete this repair project?')) {
      setProjects(projects.filter(p => p.id !== projectId));
      toast.success('Repair project deleted successfully');
    }
  };

  const handleProjectSave = (projectData: Partial<RepairProject>) => {
    if (editingProject) {
      // Update existing project
      setProjects(projects.map(p => 
        p.id === editingProject.id 
          ? { ...p, ...projectData, campus: 'Main Campus' }
          : p
      ));
      toast.success('Repair project updated successfully');
    } else {
      // Add new project
      const newProject: RepairProject = {
        id: `main-${Date.now()}`,
        campus: 'Main Campus',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...projectData
      } as RepairProject;
      
      setProjects([newProject, ...projects]);
      toast.success('Repair project added successfully');
    }
    setIsFormOpen(false);
    setEditingProject(null);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterType('all');
    setSelectedBuilding('all');
    if (onClearFilters) onClearFilters();
  };

  const handleExportData = () => {
    try {
      const dataStr = JSON.stringify(filteredProjects, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `main-campus-repairs-${new Date().getFullYear()}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully');
    } catch (error) {
      toast.error('Export failed');
    }
  };

  return (
    <div className="h-full overflow-auto bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded text-primary-foreground">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Main Campus Repairs</h1>
              <p className="text-muted-foreground">
                Caraga State University - Main Campus repair and maintenance projects
              </p>
            </div>
          </div>

          {/* Campus Indicator */}
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Campus Location:</span>
            <Badge variant="secondary" className="gap-1">
              <Building2 className="w-3 h-3" />
              Main Campus (CSU)
            </Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Projects</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Wrench className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.completionRate.toFixed(1)}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search projects, buildings, or descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background text-sm"
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Overdue">Overdue</option>
              </select>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background text-sm"
              >
                <option value="all">All Types</option>
                {repairTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              <select
                value={selectedBuilding}
                onChange={(e) => setSelectedBuilding(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background text-sm"
              >
                <option value="all">All Buildings</option>
                {buildings.map(building => (
                  <option key={building} value={building}>{building}</option>
                ))}
              </select>

              {(searchTerm || filterStatus !== 'all' || filterType !== 'all' || selectedBuilding !== 'all') && (
                <Button variant="outline" onClick={clearAllFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportData}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            {canEdit && (
              <Button onClick={handleAddProject}>
                <Plus className="w-4 h-4 mr-2" />
                Add Repair
              </Button>
            )}
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="projects" className="space-y-4">
          <TabsList>
            <TabsTrigger value="projects" className="gap-2">
              <Wrench className="w-4 h-4" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-4">
            <RepairProjectTable
              projects={filteredProjects}
              onProjectSelect={onProjectSelect}
              onEditProject={handleEditProject}
              onDeleteProject={handleDeleteProject}
              userRole={userRole}
              loading={loading}
              campus="Main Campus"
            />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <RepairAnalyticsSection
              projects={filteredProjects}
              stats={stats}
              campus="Main Campus"
            />
          </TabsContent>
        </Tabs>

        {/* Project Form Dialog */}
        {isFormOpen && (
          <RepairProjectFormDialog
            project={editingProject}
            isOpen={isFormOpen}
            onClose={() => {
              setIsFormOpen(false);
              setEditingProject(null);
            }}
            onSave={handleProjectSave}
            defaultCampus="Main Campus"
          />
        )}
      </div>
    </div>
  );
}