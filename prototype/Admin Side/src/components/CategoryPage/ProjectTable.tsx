import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  AlertCircle, 
  Building2, 
  DollarSign, 
  Calendar,
  Filter,
  Settings,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { Project } from '../../utils/projectData';
import { STATUS_COLORS, SORT_OPTIONS, STATUS_OPTIONS } from '../constants/categoryConstants';
import { toast } from 'sonner@2.0.3';

interface ProjectTableProps {
  projects: Project[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  onProjectSelect: (project: Project) => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
  userRole: string;
  showEnhancedColumns?: boolean;
}

export function ProjectTable({
  projects,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
  onProjectSelect,
  onEditProject,
  onDeleteProject,
  userRole,
  showEnhancedColumns = false
}: ProjectTableProps) {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPowStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'For Approval':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const calculateVariance = (project: Project) => {
    const expectedValue = (project.physicalAccomplishment / 100) * project.totalContractAmount;
    const variance = project.budgetUtilized - expectedValue;
    const variancePercentage = expectedValue > 0 ? (variance / expectedValue) * 100 : 0;
    
    return {
      variance,
      variancePercentage,
      isOverBudget: variance > 0,
      progressValue: expectedValue,
      status: variance > 0 ? 'Over Budget' : variance < 0 ? 'Under Budget' : 'On Track'
    };
  };

  const getVarianceIcon = (variance: number) => {
    if (variance > 0) return <TrendingUp className="w-4 h-4 text-red-500" />;
    if (variance < 0) return <TrendingDown className="w-4 h-4 text-green-500" />;
    return <Minus className="w-4 h-4 text-blue-500" />;
  };

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return 'text-red-600';
    if (variance < 0) return 'text-green-600';
    return 'text-blue-600';
  };

  // Enhanced project click handler with proper CRUD support
  const handleProjectClick = (project: Project, action: string = 'view') => {
    console.log('Project action:', action, 'Project:', project.projectName);
    
    switch (action) {
      case 'view':
        toast.info(`Opening project details: ${project.projectName}`);
        onProjectSelect(project);
        break;
      case 'edit':
        if (userRole === 'Client') {
          toast.error('Edit access denied. Staff or Admin privileges required.');
          return;
        }
        toast.info(`Editing project: ${project.projectName}`);
        onEditProject(project);
        break;
      case 'delete':
        if (userRole !== 'Admin') {
          toast.error('Delete access denied. Admin privileges required.');
          return;
        }
        if (window.confirm(`Are you sure you want to delete "${project.projectName}"?`)) {
          toast.info(`Deleting project: ${project.projectName}`);
          onDeleteProject(project);
        }
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Project Database
              </CardTitle>
              <CardDescription>
                {projects.length} projects • {formatCurrency(projects.reduce((sum, p) => sum + p.totalContractAmount, 0))} total budget
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
                className="gap-2"
              >
                <Settings className="w-4 h-4" />
                {viewMode === 'table' ? 'Card' : 'Table'} View
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects, contractors, or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Content */}
      {projects.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-medium mb-2">No projects found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Try adjusting your search criteria or filters.
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setSortBy('projectName');
              }}
            >
              Clear All Filters
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === 'table' ? (
        /* Table View with Variance Column */
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Project Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Contract Amount</TableHead>
                    <TableHead>Physical Accomplishment/Progress</TableHead>
                    <TableHead>Budget Used</TableHead>
                    <TableHead className="text-center">Variance</TableHead>
                    <TableHead>POW Status</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((project) => {
                    const variance = calculateVariance(project);
                    
                    return (
                      <TableRow 
                        key={project.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleProjectClick(project, 'view')}
                      >
                        <TableCell className="font-medium">
                          <div>
                            <p className="font-semibold text-primary hover:underline">
                              {project.projectName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {project.contractor}
                            </p>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-muted-foreground" />
                            {project.location}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div>
                            <p className="font-semibold">{formatCurrency(project.totalContractAmount)}</p>
                            {(project.materialCost || project.laborCost) && (
                              <p className="text-xs text-muted-foreground">
                                {project.materialCost ? `M: ${formatCurrency(project.materialCost)}` : ''}
                                {project.materialCost && project.laborCost ? ' | ' : ''}
                                {project.laborCost ? `L: ${formatCurrency(project.laborCost)}` : ''}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell className="min-w-[140px]">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{project.physicalAccomplishment.toFixed(1)}%</span>
                            </div>
                            <Progress value={project.physicalAccomplishment} className="w-full h-2" />
                            <p className="text-xs text-muted-foreground">
                              Value: {formatCurrency(variance.progressValue)}
                            </p>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div>
                            <p className="font-medium">{formatCurrency(project.budgetUtilized)}</p>
                            <p className="text-xs text-muted-foreground">
                              {((project.budgetUtilized / project.totalContractAmount) * 100).toFixed(1)}% of contract
                            </p>
                          </div>
                        </TableCell>
                        
                        {/* Variance Column */}
                        <TableCell>
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              {getVarianceIcon(variance.variance)}
                              <span className={`font-bold ${getVarianceColor(variance.variance)}`}>
                                {variance.variance >= 0 ? '+' : ''}{formatCurrency(variance.variance)}
                              </span>
                            </div>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getVarianceColor(variance.variance)}`}
                            >
                              {variance.status}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              {variance.variancePercentage >= 0 ? '+' : ''}{variance.variancePercentage.toFixed(1)}%
                            </p>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <Badge variant="outline" className={getPowStatusColor(project.powStatus)}>
                            {project.powStatus}
                          </Badge>
                        </TableCell>
                        
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleProjectClick(project, 'view');
                              }}
                              title="View project details"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            
                            {(userRole === 'Admin' || userRole === 'Staff') && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleProjectClick(project, 'edit');
                                }}
                                title="Edit project"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            )}
                            
                            {userRole === 'Admin' && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleProjectClick(project, 'delete');
                                }}
                                title="Delete project"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Card View */
        <div className="space-y-4">
          {projects.map((project) => {
            const variance = calculateVariance(project);
            
            return (
              <Card 
                key={project.id} 
                className="transition-all duration-200 hover:shadow-md cursor-pointer border-l-4 border-l-primary/20 hover:border-l-primary group"
                onClick={() => handleProjectClick(project, 'view')}
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0 pr-4">
                        <h4 className="text-lg font-semibold text-primary group-hover:text-primary/80 transition-colors mb-2">
                          {project.projectName}
                        </h4>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            {project.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {project.contractor}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(project.startDate)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                          <Badge className={STATUS_COLORS[project.status] || STATUS_COLORS.Planning}>
                            {project.status}
                          </Badge>
                          <Badge variant="outline" className={getPowStatusColor(project.powStatus)}>
                            POW: {project.powStatus}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2 flex-shrink-0">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="gap-2 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProjectClick(project, 'view');
                          }}
                          title="View project details, analytics, and documentation"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </Button>
                        
                        {(userRole === 'Admin' || userRole === 'Staff') && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="gap-2 hover:bg-green-50 hover:text-green-600 hover:border-green-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProjectClick(project, 'edit');
                            }}
                            title="Edit project information"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </Button>
                        )}
                        
                        {userRole === 'Admin' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProjectClick(project, 'delete');
                            }}
                            title="Delete project"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Financial & Progress Information with Variance */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-4 bg-muted/30 rounded-lg">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Contract Amount</p>
                        <p className="text-lg font-bold text-primary">
                          {formatCurrency(project.totalContractAmount)}
                        </p>
                        {(project.materialCost || project.laborCost) && (
                          <div className="text-xs text-muted-foreground space-y-1">
                            {project.materialCost && (
                              <div>Materials: {formatCurrency(project.materialCost)}</div>
                            )}
                            {project.laborCost && (
                              <div>Labor: {formatCurrency(project.laborCost)}</div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Physical Accomplishment/Progress</p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold">{project.physicalAccomplishment.toFixed(1)}%</span>
                          </div>
                          <Progress value={project.physicalAccomplishment} className="w-full" />
                          <p className="text-xs text-muted-foreground">
                            Progress Value: {formatCurrency(variance.progressValue)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Budget Used</p>
                        <p className="text-lg font-bold">
                          {formatCurrency(project.budgetUtilized)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {((project.budgetUtilized / project.totalContractAmount) * 100).toFixed(1)}% of contract
                        </p>
                      </div>
                      
                      {/* Variance Display */}
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Budget Variance</p>
                        <div className="flex items-center gap-2">
                          {getVarianceIcon(variance.variance)}
                          <span className={`text-lg font-bold ${getVarianceColor(variance.variance)}`}>
                            {variance.variance >= 0 ? '+' : ''}{formatCurrency(variance.variance)}
                          </span>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getVarianceColor(variance.variance)}`}
                        >
                          {variance.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          {variance.variancePercentage >= 0 ? '+' : ''}{variance.variancePercentage.toFixed(1)}% variance
                        </p>
                      </div>
                    </div>

                    {/* Progress Notes */}
                    {project.progressNotes && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm font-medium text-blue-900 mb-1">Latest Update:</p>
                        <p className="text-sm text-blue-800">{project.progressNotes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Summary Footer */}
      {projects.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Total Projects</p>
                <p className="font-bold">{projects.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Contract</p>
                <p className="font-bold">{formatCurrency(projects.reduce((sum, p) => sum + p.totalContractAmount, 0))}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Budget Used</p>
                <p className="font-bold">{formatCurrency(projects.reduce((sum, p) => sum + p.budgetUtilized, 0))}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Variance</p>
                <p className={`font-bold ${projects.reduce((sum, p) => {
                  const v = calculateVariance(p);
                  return sum + v.variance;
                }, 0) >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(projects.reduce((sum, p) => {
                    const v = calculateVariance(p);
                    return sum + v.variance;
                  }, 0))}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Progress</p>
                <p className="font-bold">{projects.length > 0 ? (projects.reduce((sum, p) => sum + p.physicalAccomplishment, 0) / projects.length).toFixed(1) : 0}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Projects</p>
                <p className="font-bold">{projects.filter(p => p.status === 'Ongoing').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}