import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuCheckboxItem, DropdownMenuLabel } from '../../ui/dropdown-menu';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../../ui/pagination';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../ui/tooltip';
import { Alert, AlertDescription } from '../../ui/alert';
import { Search, Columns, Download, Eye, Edit, Trash2, ChevronDown, SortAsc, SortDesc, Filter, UserCog, MoreHorizontal, Lock, ShieldAlert, Info, Shield } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { RepairProject } from '../types/RepairTypes';
import { ProjectPersonnelDialog } from '../admin/ProjectPersonnelDialog';
import { enhancedRepairsRBACService } from '../services/EnhancedRBACService';

interface Column {
  id: string;
  label: string;
  visible: boolean;
  sortable?: boolean;
}

interface EnhancedProjectTableProps {
  projects: RepairProject[];
  userRole: string;
  userEmail?: string;
  onProjectClick: (project: RepairProject) => void;
  onEdit?: (project: RepairProject) => void;
  requireAuth: (action: string) => boolean;
  campusFilter: 'all' | 'main' | 'cabadbaran';
  externalStatusFilter?: string;
  onStatusFilterChange?: (status: string) => void;
}

const DEFAULT_COLUMNS: Column[] = [
  { id: 'projectTitle', label: 'Project Title', visible: true, sortable: true },
  { id: 'campus', label: 'Campus', visible: true, sortable: true },
  { id: 'repairType', label: 'Repair Type', visible: true, sortable: true },
  { id: 'status', label: 'Status', visible: true, sortable: true },
  { id: 'priority', label: 'Priority', visible: true, sortable: true },
  { id: 'approvedBudget', label: 'Budget', visible: true, sortable: true },
  { id: 'dateStarted', label: 'Date Started', visible: true, sortable: true },
  { id: 'physicalProgress', label: 'Progress (%)', visible: false, sortable: true },
  { id: 'targetDateCompletion', label: 'Target Completion', visible: false, sortable: true },
  { id: 'utilizedBudget', label: 'Utilized Budget', visible: false, sortable: true },
  { id: 'building', label: 'Building', visible: false, sortable: true },
  { id: 'location', label: 'Location', visible: false, sortable: false },
];

export function EnhancedProjectTable({
  projects,
  userRole,
  userEmail = 'user@carsu.edu.ph',
  onProjectClick,
  onEdit,
  requireAuth,
  campusFilter,
  externalStatusFilter,
  onStatusFilterChange
}: EnhancedProjectTableProps) {
  const [columns, setColumns] = useState<Column[]>(DEFAULT_COLUMNS);
  const [searchQuery, setSearchQuery] = useState('');
  const [repairTypeFilter, setRepairTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState(externalStatusFilter || 'all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  
  // Sync external status filter
  React.useEffect(() => {
    if (externalStatusFilter && externalStatusFilter !== 'all') {
      setStatusFilter(externalStatusFilter);
      // Clear external filter after applying
      if (onStatusFilterChange) {
        setTimeout(() => onStatusFilterChange('all'), 100);
      }
    }
  }, [externalStatusFilter, onStatusFilterChange]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<string>('projectTitle');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [personnelDialogOpen, setPersonnelDialogOpen] = useState(false);
  const [selectedProjectForPersonnel, setSelectedProjectForPersonnel] = useState<RepairProject | null>(null);

  // RBAC: Check permissions
  const canEdit = ['Admin', 'Staff', 'Editor'].includes(userRole);
  const canDelete = userRole === 'Admin';
  const canManagePersonnel = ['Admin', 'Editor'].includes(userRole);

  // Handle column visibility toggle
  const toggleColumn = (columnId: string) => {
    setColumns(columns.map(col =>
      col.id === columnId ? { ...col, visible: !col.visible } : col
    ));
  };

  // Get unique values for filters
  const uniqueRepairTypes = useMemo(() => {
    const types = new Set(projects.map(p => p.repairType).filter(Boolean));
    return Array.from(types).sort();
  }, [projects]);

  const uniqueStatuses = useMemo(() => {
    const statuses = new Set(projects.map(p => p.status).filter(Boolean));
    return Array.from(statuses).sort();
  }, [projects]);

  const uniquePriorities = useMemo(() => {
    const priorities = new Set(projects.map(p => p.priority).filter(Boolean));
    return Array.from(priorities).sort();
  }, [projects]);

  // Filter and sort projects with RBAC
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects.filter(project => {
      // Get project title (handle both naming conventions)
      const projectTitle = project.projectTitle || project.title || '';
      const building = project.building || '';
      const location = project.location || '';
      
      // RBAC Filter - CRITICAL: Check project-level access
      // Admin and Client can see all projects (public transparency)
      // Staff/Editor can ONLY see projects they are assigned to
      if (userRole !== 'Admin' && userRole !== 'Client') {
        const hasAccess = enhancedRepairsRBACService.canViewProject(
          userEmail, 
          userRole, 
          project.id, 
          'General' // department - can be enhanced later
        );
        
        if (!hasAccess) {
          return false; // Filter out projects user cannot access
        }
      }
      
      // Search filter
      const matchesSearch = searchQuery === '' || 
        projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        building.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.toLowerCase().includes(searchQuery.toLowerCase());

      // Campus filter from props
      let matchesCampus = true;
      if (campusFilter === 'main') {
        matchesCampus = project.campus === 'Main Campus' || project.campus === 'CSU Main' || project.campus === 'CSU';
      } else if (campusFilter === 'cabadbaran') {
        matchesCampus = project.campus === 'Cabadbaran Campus' || project.campus === 'BXU' || project.campus === 'CSU CC';
      }

      // Other filters
      const matchesRepairType = repairTypeFilter === 'all' || project.repairType === repairTypeFilter;
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter;

      return matchesSearch && matchesCampus && matchesRepairType && matchesStatus && matchesPriority;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle missing values
      if (aValue === undefined || aValue === null) aValue = '';
      if (bValue === undefined || bValue === null) bValue = '';

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue?.toString().toLowerCase() || '';
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [projects, searchQuery, campusFilter, repairTypeFilter, statusFilter, priorityFilter, sortBy, sortOrder, userRole, userEmail]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedProjects.length / itemsPerPage);
  const paginatedProjects = filteredAndSortedProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle sort
  const handleSort = (columnId: string) => {
    const column = columns.find(col => col.id === columnId);
    if (!column?.sortable) return;

    if (sortBy === columnId) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(columnId);
      setSortOrder('asc');
    }
  };

  // Handle row click
  const handleRowClick = (project: RepairProject, event: React.MouseEvent) => {
    // Prevent navigation if clicking on action buttons
    if ((event.target as HTMLElement).closest('button')) {
      return;
    }
    onProjectClick(project);
  };

  // Handle personnel assignment
  const handleManagePersonnel = (project: RepairProject, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation(); // Prevent row click
    }
    
    if (!requireAuth('manage project personnel')) return;
    
    if (!canManagePersonnel) {
      toast.error('Access denied. Only Admin/Editor can manage personnel.');
      return;
    }

    setSelectedProjectForPersonnel(project);
    setPersonnelDialogOpen(true);
  };

  const handlePersonnelDialogClose = () => {
    setPersonnelDialogOpen(false);
    setSelectedProjectForPersonnel(null);
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-50 text-green-700 border-green-200';
      case 'In Progress': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'On Hold': return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'Cancelled': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  // Get priority badge color
  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-50 text-red-700 border-red-200';
      case 'High': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Medium': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Low': return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  // Visible columns only
  const visibleColumns = columns.filter(col => col.visible);

  return (
    <Card className="admin-card">
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-gray-900">Repair Projects</CardTitle>
              <CardDescription className="mt-1">
                {filteredAndSortedProjects.length} project{filteredAndSortedProjects.length !== 1 ? 's' : ''} found
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              {/* Column Selection Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Columns className="w-4 h-4" />
                    Columns
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {columns.map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={column.visible}
                      onCheckedChange={() => toggleColumn(column.id)}
                    >
                      {column.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={repairTypeFilter} onValueChange={setRepairTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Repair Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {uniqueRepairTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {uniqueStatuses.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                {uniquePriorities.map(priority => (
                  <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* RBAC Access Information */}
          {userRole !== 'Admin' && userRole !== 'Client' && (
            <Alert className="border-amber-200 bg-amber-50">
              <Shield className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-sm text-gray-700">
                {(() => {
                  const assignedProjects = enhancedRepairsRBACService.getAssignedProjects(userEmail);
                  if (assignedProjects.length === 0) {
                    return (
                      <>
                        <strong>No Project Access:</strong> You have not been assigned to any repair projects yet. 
                        Contact an administrator to request project access.
                      </>
                    );
                  }
                  return (
                    <>
                      <strong>Project-Based Access:</strong> You can only view and edit the {assignedProjects.length} project{assignedProjects.length !== 1 ? 's' : ''} you are assigned to. 
                      Contact an administrator to request access to additional projects.
                    </>
                  );
                })()}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Table Container with Fixed Height - No Vertical Scrollbar on Default View */}
        <div className="relative overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  {visibleColumns.map((column) => (
                    <TableHead 
                      key={column.id}
                      className={column.sortable ? 'cursor-pointer select-none hover:bg-gray-100/50' : ''}
                      onClick={() => column.sortable && handleSort(column.id)}
                    >
                      <div className="flex items-center gap-2">
                        <span>{column.label}</span>
                        {column.sortable && sortBy === column.id && (
                          sortOrder === 'asc' ? 
                            <SortAsc className="w-4 h-4" /> : 
                            <SortDesc className="w-4 h-4" />
                        )}
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedProjects.length > 0 ? (
                  paginatedProjects.map((project) => (
                    <TableRow 
                      key={project.id}
                      className="cursor-pointer hover:bg-gray-50/50 transition-colors"
                      onClick={(e) => handleRowClick(project, e)}
                    >
                      {visibleColumns.map((column) => (
                        <TableCell key={`${project.id}-${column.id}`}>
                          {column.id === 'projectTitle' && (
                            <div>
                              <p className="text-gray-900">{project.projectTitle || project.title || 'Untitled'}</p>
                              {project.building && (
                                <p className="text-xs text-gray-500 mt-0.5">{project.building}</p>
                              )}
                            </div>
                          )}
                          {column.id === 'campus' && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {project.campus || 'N/A'}
                            </Badge>
                          )}
                          {column.id === 'repairType' && (
                            <span className="text-gray-700">{project.repairType || 'Minor Repair'}</span>
                          )}
                          {column.id === 'status' && (
                            <Badge variant="outline" className={getStatusBadgeColor(project.status || 'Pending')}>
                              {project.status || 'Pending'}
                            </Badge>
                          )}
                          {column.id === 'priority' && (
                            <Badge variant="outline" className={getPriorityBadgeColor(project.priority || 'Medium')}>
                              {project.priority || 'Medium'}
                            </Badge>
                          )}
                          {column.id === 'approvedBudget' && (
                            <span className="text-gray-900">
                              ₱{((project.approvedBudget || project.budget || 0)).toLocaleString()}
                            </span>
                          )}
                          {column.id === 'utilizedBudget' && (
                            <span className="text-gray-700">
                              ₱{((project.utilizedBudget || project.spent || 0)).toLocaleString()}
                            </span>
                          )}
                          {column.id === 'physicalProgress' && (
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                                <div
                                  className="bg-green-600 h-2 rounded-full transition-all"
                                  style={{ width: `${project.physicalProgress || 0}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-700 w-12 text-right">
                                {(project.physicalProgress || 0).toFixed(0)}%
                              </span>
                            </div>
                          )}
                          {column.id === 'dateStarted' && (
                            <span className="text-gray-700">{project.dateStarted || project.startDate || 'N/A'}</span>
                          )}
                          {column.id === 'targetDateCompletion' && (
                            <span className="text-gray-700">{project.targetDateCompletion || project.endDate || 'N/A'}</span>
                          )}
                          {column.id === 'building' && (
                            <span className="text-gray-700">{project.building || 'N/A'}</span>
                          )}
                          {column.id === 'location' && (
                            <span className="text-gray-700">{project.location || 'N/A'}</span>
                          )}
                        </TableCell>
                      ))}
                      <TableCell className="text-right">
                        <DropdownMenu modal={false}>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                onProjectClick(project);
                              }}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            
                            {canEdit && (
                              <>
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  if (onEdit) {
                                    onEdit(project);
                                  } else {
                                    toast.info('Edit functionality');
                                  }
                                }}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit Project
                                </DropdownMenuItem>
                                
                                {canManagePersonnel && (
                                  <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation();
                                    handleManagePersonnel(project, e);
                                  }}>
                                    <UserCog className="w-4 h-4 mr-2" />
                                    Assign Personnel
                                  </DropdownMenuItem>
                                )}
                              </>
                            )}

                            {canDelete && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toast.error('Delete functionality');
                                  }}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete Project
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell 
                      colSpan={visibleColumns.length + 1} 
                      className="h-32 text-center text-gray-500"
                    >
                      <div className="flex flex-col items-center gap-3 py-8">
                        {userRole !== 'Admin' && userRole !== 'Client' && enhancedRepairsRBACService.getAssignedProjects(userEmail).length === 0 ? (
                          <>
                            <ShieldAlert className="w-12 h-12 text-amber-400" />
                            <div>
                              <p className="text-gray-900 mb-1">No Project Access</p>
                              <p className="text-sm text-gray-600 max-w-md">
                                You have not been assigned to any repair projects. Contact an administrator to request access.
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            <Filter className="w-8 h-8 text-gray-400" />
                            <p>No projects found matching your filters</p>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Rows per page:</span>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  setItemsPerPage(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-20 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="ml-4">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedProjects.length)} of {filteredAndSortedProjects.length}
              </span>
            </div>

            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }

                  return (
                    <PaginationItem key={i}>
                      <PaginationLink
                        onClick={() => setCurrentPage(pageNumber)}
                        isActive={currentPage === pageNumber}
                        className="cursor-pointer"
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>

      {/* Personnel Assignment Dialog */}
      {selectedProjectForPersonnel && (
        <ProjectPersonnelDialog
          open={personnelDialogOpen}
          onOpenChange={handlePersonnelDialogClose}
          project={selectedProjectForPersonnel}
          userRole={userRole}
          userEmail={userEmail}
          onUpdate={() => {
            // Callback after personnel update - could trigger data refresh if needed
          }}
        />
      )}
    </Card>
  );
}