import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { 
  Eye, 
  Edit, 
  Trash2, 
  Calendar,
  MapPin,
  Building2,
  Wrench,
  DollarSign,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { RepairProject } from '../types/RepairTypes';
// Note: Using basic date formatting to avoid dependency issues
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  } catch {
    return dateString;
  }
};

interface RepairProjectTableProps {
  projects: RepairProject[];
  onProjectSelect: (project: RepairProject) => void;
  onEditProject?: (project: RepairProject) => void;
  onDeleteProject?: (projectId: string) => void;
  userRole: string;
  loading?: boolean;
  campus: string;
}

export function RepairProjectTable({
  projects,
  onProjectSelect,
  onEditProject,
  onDeleteProject,
  userRole,
  loading = false,
  campus
}: RepairProjectTableProps) {
  const canEdit = userRole === 'Admin' || userRole === 'Staff';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'On Hold':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const formatDateShort = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  const getBudgetUtilization = (spent: number, budget: number) => {
    if (budget === 0) return 0;
    return Math.round((spent / budget) * 100);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (projects.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <Wrench className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Repair Projects Found</h3>
            <p className="text-muted-foreground">
              No repair projects found for {campus}. Try adjusting your filters or add a new repair project.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          {campus} - Repair Projects ({projects.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">Project Details</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => {
                const budgetUtilization = getBudgetUtilization(project.spent, project.budget);
                const isOverdue = project.status === 'Overdue' || 
                  (project.status === 'In Progress' && new Date() > new Date(project.endDate));
                
                return (
                  <TableRow key={project.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{project.title}</div>
                        <div className="text-sm text-muted-foreground line-clamp-2">
                          {project.description}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          Created: {formatDateShort(project.createdAt)}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Building2 className="w-3 h-3" />
                          {project.building}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          {project.location}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {project.campus}
                        </Badge>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Wrench className="w-3 h-3" />
                        <span className="text-sm">{project.repairType}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge className={`text-xs ${getPriorityColor(project.priority)}`}>
                        {project.priority}
                        {project.emergencyRepair && (
                          <AlertTriangle className="w-3 h-3 ml-1" />
                        )}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <Badge className={`text-xs ${getStatusColor(project.status)}`}>
                        {project.status}
                      </Badge>
                      {isOverdue && (
                        <div className="flex items-center gap-1 text-xs text-red-600 mt-1">
                          <AlertTriangle className="w-3 h-3" />
                          Overdue
                        </div>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1 text-xs">
                        <div>Start: {formatDateShort(project.startDate)}</div>
                        <div>End: {formatDateShort(project.endDate)}</div>
                        {project.estimatedDuration && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {project.estimatedDuration} days
                          </div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          {formatCurrency(project.budget)}
                        </div>
                        <div className="text-muted-foreground">
                          Spent: {formatCurrency(project.spent)}
                        </div>
                        <div className={`${budgetUtilization > 90 ? 'text-red-600' : budgetUtilization > 75 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {budgetUtilization}% used
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-2">
                        {project.status === 'In Progress' && project.actualDuration && project.estimatedDuration && (
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ 
                                width: `${Math.min((project.actualDuration / project.estimatedDuration) * 100, 100)}%` 
                              }}
                            ></div>
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground">
                          PM: {project.projectManager}
                        </div>
                        {project.contractor && (
                          <div className="text-xs text-muted-foreground">
                            Contractor: {project.contractor}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onProjectSelect(project)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        
                        {canEdit && onEditProject && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditProject(project)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                        
                        {canEdit && onDeleteProject && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteProject(project.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
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
  );
}