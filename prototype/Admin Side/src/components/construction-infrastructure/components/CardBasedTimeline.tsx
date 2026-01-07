import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { 
  Calendar as CalendarIcon, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { formatDate } from '../utils/analyticsHelpers';
import { constructionInfrastructureRBACService } from '../services/RBACService';
import { toast } from 'sonner@2.0.3';

interface Project {
  id: string;
  projectTitle: string;
  dateStarted: string;
  targetDateCompletion?: string;
  progressAccomplishment?: number;
  status: string;
  approvedBudget: number;
  disbursement?: number;
}

interface CardBasedTimelineProps {
  projects: Project[];
  userEmail: string;
  userRole: string;
  onProjectClick?: (project: Project) => void;
}

const ITEMS_PER_PAGE = 6;

export function CardBasedTimeline({ projects, userEmail, userRole, onProjectClick }: CardBasedTimelineProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Get unique statuses
  const statuses = useMemo(() => {
    return Array.from(new Set(projects.map(p => p.status))).sort();
  }, [projects]);

  // Check if user can access a project
  const canAccessProject = (project: Project): boolean => {
    if (userRole === 'Admin' || userRole === 'Client') {
      return true;
    }

    const permissions = constructionInfrastructureRBACService.getUserPermissions(
      userEmail,
      userRole,
      'construction-infrastructure'
    );

    return permissions.assignedProjects?.includes(project.id) || false;
  };

  // Calculate project metrics
  const calculateMetrics = (project: Project) => {
    const start = new Date(project.dateStarted);
    const end = project.targetDateCompletion ? new Date(project.targetDateCompletion) : new Date();
    const now = new Date();
    
    const totalDuration = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    const timeProgress = totalDuration > 0 ? Math.max(0, Math.min(100, (elapsed / totalDuration) * 100)) : 0;
    
    const physicalProgress = project.progressAccomplishment || 0;
    const daysRemaining = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const isDelayed = physicalProgress < timeProgress && project.status !== 'Completed';
    const isAhead = physicalProgress > timeProgress + 5;
    
    return {
      timeProgress,
      physicalProgress,
      daysRemaining,
      isDelayed,
      isAhead,
      variance: physicalProgress - timeProgress
    };
  };

  // Filter projects
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = project.projectTitle.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [projects, searchQuery, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProjects.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProjects, currentPage]);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // Handle project click with RBAC check
  const handleProjectClick = (project: Project) => {
    const hasAccess = canAccessProject(project);
    
    if (!hasAccess) {
      toast.error('Access Denied', {
        description: 'You do not have permission to view this project. Contact your administrator if you need access.',
        duration: 4000
      });
      return;
    }

    // Use callback if provided
    if (onProjectClick) {
      onProjectClick(project);
    }
  };

  return (
    <Card className="border border-gray-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-gray-900 flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          Project Timeline
        </CardTitle>
        <CardDescription className="text-gray-600">
          Chronological overview of all projects with progress tracking
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 border-gray-200"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="border-gray-200">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <SelectValue placeholder="All Statuses" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statuses.map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
          <span>
            Showing {paginatedProjects.length > 0 ? ((currentPage - 1) * ITEMS_PER_PAGE) + 1 : 0} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredProjects.length)} of {filteredProjects.length} projects
          </span>
          {(searchQuery || statusFilter !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="h-7 text-xs"
            >
              Clear filters
            </Button>
          )}
        </div>

        {/* Timeline Cards */}
        {paginatedProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Filter className="h-12 w-12 mb-3 text-gray-300" />
            <p>No projects found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedProjects.map((project) => {
              const metrics = calculateMetrics(project);
              const hasAccess = canAccessProject(project);

              return (
                <div
                  key={project.id}
                  onClick={() => handleProjectClick(project)}
                  className={`border rounded-lg p-4 transition-all duration-200 ${
                    hasAccess 
                      ? 'border-gray-200 hover:border-primary hover:shadow-md cursor-pointer bg-white' 
                      : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-75'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {project.projectTitle}
                        </h4>
                        {!hasAccess && (
                          <Lock className="h-3 w-3 text-gray-400 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getStatusColor(project.status)}`}
                        >
                          {project.status}
                        </Badge>
                        {metrics.isDelayed && project.status !== 'Completed' && (
                          <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Delayed
                          </Badge>
                        )}
                        {metrics.isAhead && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Ahead
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Timeline Info */}
                  <div className="mb-3 space-y-1">
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        <span>Started: {formatDate(project.dateStarted)}</span>
                      </div>
                    </div>
                    {project.targetDateCompletion && (
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" />
                          <span>Target: {formatDate(project.targetDateCompletion)}</span>
                        </div>
                        {project.status !== 'Completed' && (
                          <span className={`flex items-center gap-1 ${
                            metrics.daysRemaining < 0 ? 'text-red-600' : metrics.daysRemaining < 30 ? 'text-amber-600' : 'text-gray-600'
                          }`}>
                            <Clock className="h-3 w-3" />
                            {metrics.daysRemaining < 0 
                              ? `${Math.abs(metrics.daysRemaining)}d overdue` 
                              : `${metrics.daysRemaining}d left`}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Progress Section */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-700">Physical Progress</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {metrics.physicalProgress.toFixed(1)}%
                      </span>
                    </div>
                    <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`absolute inset-y-0 left-0 rounded-full transition-all ${
                          project.status === 'Completed' 
                            ? 'bg-emerald-500' 
                            : metrics.isDelayed 
                            ? 'bg-red-500' 
                            : metrics.isAhead
                            ? 'bg-blue-500'
                            : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(metrics.physicalProgress, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Status Footer */}
                  {project.status === 'Completed' && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Completed</span>
                    </div>
                  )}

                  {!hasAccess && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      <Lock className="h-3 w-3" />
                      <span>Restricted Access</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-8"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="h-8 w-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-8"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getStatusColor(status: string): string {
  const colors: { [key: string]: string } = {
    'Completed': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Ongoing': 'bg-blue-50 text-blue-700 border-blue-200',
    'Planning': 'bg-amber-50 text-amber-700 border-amber-200',
    'Delayed': 'bg-red-50 text-red-700 border-red-200',
    'Suspended': 'bg-orange-50 text-orange-700 border-orange-200',
    'On Hold': 'bg-gray-50 text-gray-700 border-gray-200'
  };
  return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200';
}
