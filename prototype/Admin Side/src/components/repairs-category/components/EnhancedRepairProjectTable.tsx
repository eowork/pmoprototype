import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../../ui/pagination';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../../ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../ui/tooltip';
import { Search, Columns, Download, Eye, Edit, Trash2, ChevronDown, SortAsc, SortDesc, Filter, Lock, ShieldAlert, UserCog, X, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { enhancedRepairsRBACService } from '../services/EnhancedRBACService';
import { ProjectPersonnelDialog } from '../admin/ProjectPersonnelDialog';
import { RepairProject } from '../types/RepairTypes';

interface Column {
  id: string;
  label: string;
  visible: boolean;
  sortable?: boolean;
}

interface EnhancedRepairProjectTableProps {
  projects: RepairProject[];
  userRole: string;
  userEmail?: string;
  userDepartment?: string;
  onProjectSelect: (project: RepairProject) => void;
  onEditProject?: (project: RepairProject) => void;
  onDeleteProject?: (project: RepairProject) => void;
  canEdit?: boolean;
  canDelete?: boolean;
  externalStatusFilter?: string;
  onStatusFilterChange?: (status: string) => void;
}

const DEFAULT_COLUMNS: Column[] = [
  { id: 'title', label: 'Project Title', visible: true, sortable: true },
  { id: 'campus', label: 'Campus', visible: true, sortable: true },
  { id: 'building', label: 'Building', visible: true, sortable: true },
  { id: 'status', label: 'Status', visible: true, sortable: true },
  { id: 'priority', label: 'Priority', visible: true, sortable: true },
  { id: 'repairType', label: 'Repair Type', visible: true, sortable: true },
  { id: 'startDate', label: 'Start Date', visible: true, sortable: true },
  { id: 'endDate', label: 'Target Completion', visible: false, sortable: true },
  { id: 'budget', label: 'Budget', visible: false, sortable: true },
  { id: 'spent', label: 'Spent', visible: false, sortable: true },
  { id: 'contractor', label: 'Contractor', visible: false, sortable: true },
  { id: 'projectManager', label: 'Project Manager', visible: false, sortable: true },
];

export function EnhancedRepairProjectTable({
  projects,
  userRole,
  userEmail = 'user@carsu.edu.ph',
  userDepartment = 'General',
  onProjectSelect,
  onEditProject,
  onDeleteProject,
  canEdit = false,
  canDelete = false,
  externalStatusFilter,
  onStatusFilterChange
}: EnhancedRepairProjectTableProps) {
  const [columns, setColumns] = useState<Column[]>(DEFAULT_COLUMNS);
  const [searchQuery, setSearchQuery] = useState('');
  const [campusFilter, setCampusFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState(externalStatusFilter || 'all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [repairTypeFilter, setRepairTypeFilter] = useState('all');
  
  // Sync external status filter
  React.useEffect(() => {
    if (externalStatusFilter) {
      setStatusFilter(externalStatusFilter);
    }
  }, [externalStatusFilter]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<string>('startDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [personnelDialogOpen, setPersonnelDialogOpen] = useState(false);
  const [selectedProjectForPersonnel, setSelectedProjectForPersonnel] = useState<RepairProject | null>(null);

  // RBAC: Check if user can view a specific project
  const canViewProject = (project: RepairProject) => {
    return enhancedRepairsRBACService.canViewProject(userEmail, userRole, project.id, userDepartment);
  };

  // RBAC: Check project edit access
  const checkProjectEditAccess = (project: RepairProject) => {
    return enhancedRepairsRBACService.canEditProject(userEmail, userRole, project.id);
  };

  // RBAC: Check project delete access
  const checkProjectDeleteAccess = (project: RepairProject) => {
    return enhancedRepairsRBACService.canDeleteProject(userEmail, userRole, project.id);
  };

  // Handle row click - navigate to project detail if user has access
  const handleRowClick = (project: RepairProject, event: React.MouseEvent) => {
    // Don't trigger if clicking on action buttons
    const target = event.target as HTMLElement;
    if (target.closest('button') || target.closest('[role="button"]')) {
      return;
    }

    if (!canViewProject(project)) {
      toast.error('You do not have permission to view this project');
      return;
    }

    onProjectSelect(project);
  };

  // Handle edit click
  const handleEditClick = (project: RepairProject, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (!checkProjectEditAccess(project)) {
      toast.error('You do not have permission to edit this project');
      return;
    }

    if (onEditProject) {
      onEditProject(project);
    }
  };

  // Handle delete click
  const handleDeleteClick = (project: RepairProject, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (!checkProjectDeleteAccess(project)) {
      toast.error('You do not have permission to delete this project');
      return;
    }

    if (onDeleteProject) {
      onDeleteProject(project);
    }
  };

  // Handle personnel management click
  const handlePersonnelClick = (project: RepairProject, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (userRole !== 'Admin') {
      toast.error('Only administrators can manage project personnel');
      return;
    }

    setSelectedProjectForPersonnel(project);
    setPersonnelDialogOpen(true);
  };

  // Filter projects
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = 
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.building.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCampus = campusFilter === 'all' || 
        (campusFilter === 'main' && (project.campus === 'CSU Main' || project.campus === 'Main Campus')) ||
        (campusFilter === 'cabadbaran' && (project.campus === 'CSU CC' || project.campus === 'Cabadbaran Campus'));
      
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter;
      const matchesRepairType = repairTypeFilter === 'all' || project.repairType === repairTypeFilter;
      
      return matchesSearch && matchesCampus && matchesStatus && matchesPriority && matchesRepairType;
    });
  }, [projects, searchQuery, campusFilter, statusFilter, priorityFilter, repairTypeFilter]);

  // Sort projects
  const sortedProjects = useMemo(() => {
    const sorted = [...filteredProjects];
    
    sorted.sort((a, b) => {
      let aValue: any = a[sortBy as keyof RepairProject];
      let bValue: any = b[sortBy as keyof RepairProject];
      
      // Handle special sorting cases
      if (sortBy === 'priority') {
        const priorityOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
        aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
        bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
      }
      
      if (typeof aValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });
    
    return sorted;
  }, [filteredProjects, sortBy, sortOrder]);

  // Paginate projects
  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedProjects.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedProjects, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedProjects.length / itemsPerPage);

  // Toggle column visibility
  const toggleColumn = (columnId: string) => {
    setColumns(columns.map(col => 
      col.id === columnId ? { ...col, visible: !col.visible } : col
    ));
  };

  // Handle sort
  const handleSort = (columnId: string) => {
    if (sortBy === columnId) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(columnId);
      setSortOrder('asc');
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setCampusFilter('all');
    setStatusFilter('all');
    setPriorityFilter('all');
    setRepairTypeFilter('all');
    if (onStatusFilterChange) {
      onStatusFilterChange('all');
    }
    toast.success('All filters cleared');
  };

  const hasActiveFilters = searchQuery || campusFilter !== 'all' || statusFilter !== 'all' || 
    priorityFilter !== 'all' || repairTypeFilter !== 'all';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
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

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Completed': return 'default';
      case 'In Progress': return 'default';
      case 'Pending': return 'secondary';
      case 'Overdue': return 'destructive';
      case 'On Hold': return 'secondary';
      case 'Cancelled': return 'secondary';
      default: return 'secondary';
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'destructive';
      case 'High': return 'default';
      case 'Medium': return 'secondary';
      case 'Low': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters and Controls */}
      <Card className="border border-gray-200 bg-white shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-gray-900">Project List</CardTitle>
              <CardDescription className="text-gray-600">
                {sortedProjects.length} project{sortedProjects.length !== 1 ? 's' : ''} found
                {hasActiveFilters && ' (filtered)'}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {/* Column Selection */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 border-gray-200">
                    <Columns className="h-4 w-4" />
                    Columns
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white">
                  <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {columns.map(column => (
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

              <Button variant="outline" size="sm" className="gap-2 border-gray-200">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search projects by title, building, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 border-gray-200"
              />
            </div>
            
            <div className="flex flex-wrap gap-2 w-full lg:w-auto">
              <Select value={campusFilter} onValueChange={setCampusFilter}>
                <SelectTrigger className="w-full sm:w-[160px] border-gray-200">
                  <SelectValue placeholder="Campus" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Campuses</SelectItem>
                  <SelectItem value="main">CSU Main</SelectItem>
                  <SelectItem value="cabadbaran">CSU CC</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={(value) => {
                setStatusFilter(value);
                if (onStatusFilterChange) onStatusFilterChange(value);
              }}>
                <SelectTrigger className="w-full sm:w-[140px] border-gray-200">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Overdue">Overdue</SelectItem>
                  <SelectItem value="On Hold">On Hold</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full sm:w-[130px] border-gray-200">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={repairTypeFilter} onValueChange={setRepairTypeFilter}>
                <SelectTrigger className="w-full sm:w-[140px] border-gray-200">
                  <SelectValue placeholder="Repair Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Structural">Structural</SelectItem>
                  <SelectItem value="Electrical">Electrical</SelectItem>
                  <SelectItem value="Plumbing">Plumbing</SelectItem>
                  <SelectItem value="HVAC">HVAC</SelectItem>
                  <SelectItem value="Roofing">Roofing</SelectItem>
                  <SelectItem value="Painting">Painting</SelectItem>
                  <SelectItem value="Flooring">Flooring</SelectItem>
                  <SelectItem value="Safety">Safety</SelectItem>
                  <SelectItem value="Security">Security</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="gap-2 text-gray-600 hover:text-gray-900"
                >
                  <X className="h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border border-gray-200 bg-white shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  {columns.filter(col => col.visible).map(column => (
                    <TableHead 
                      key={column.id}
                      className="text-gray-700"
                      onClick={() => column.sortable && handleSort(column.id)}
                      style={{ cursor: column.sortable ? 'pointer' : 'default' }}
                    >
                      <div className="flex items-center gap-2">
                        {column.label}
                        {column.sortable && sortBy === column.id && (
                          sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="text-gray-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedProjects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.filter(col => col.visible).length + 1} className="text-center text-gray-500 py-8">
                      No projects found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedProjects.map(project => {
                    const hasViewAccess = canViewProject(project);
                    const hasEditAccess = checkProjectEditAccess(project);
                    const hasDeleteAccess = checkProjectDeleteAccess(project);

                    return (
                      <TableRow 
                        key={project.id} 
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={(e) => handleRowClick(project, e)}
                      >
                        {columns.find(col => col.id === 'title')?.visible && (
                          <TableCell className="max-w-xs">
                            <div className="flex items-center gap-2">
                              <span className="truncate">{project.title}</span>
                              {!hasViewAccess && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Lock className="h-4 w-4 text-gray-400" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Restricted Access</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          </TableCell>
                        )}
                        {columns.find(col => col.id === 'campus')?.visible && (
                          <TableCell>
                            <Badge variant="outline" className="whitespace-nowrap">
                              {project.campus}
                            </Badge>
                          </TableCell>
                        )}
                        {columns.find(col => col.id === 'building')?.visible && (
                          <TableCell className="max-w-xs truncate">{project.building}</TableCell>
                        )}
                        {columns.find(col => col.id === 'status')?.visible && (
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(project.status)}>
                              {project.status}
                            </Badge>
                          </TableCell>
                        )}
                        {columns.find(col => col.id === 'priority')?.visible && (
                          <TableCell>
                            <Badge variant={getPriorityBadgeVariant(project.priority)}>
                              {project.priority}
                            </Badge>
                          </TableCell>
                        )}
                        {columns.find(col => col.id === 'repairType')?.visible && (
                          <TableCell>{project.repairType}</TableCell>
                        )}
                        {columns.find(col => col.id === 'startDate')?.visible && (
                          <TableCell className="whitespace-nowrap">{formatDate(project.startDate)}</TableCell>
                        )}
                        {columns.find(col => col.id === 'endDate')?.visible && (
                          <TableCell className="whitespace-nowrap">{formatDate(project.endDate)}</TableCell>
                        )}
                        {columns.find(col => col.id === 'budget')?.visible && (
                          <TableCell className="text-right whitespace-nowrap">{formatCurrency(project.budget)}</TableCell>
                        )}
                        {columns.find(col => col.id === 'spent')?.visible && (
                          <TableCell className="text-right whitespace-nowrap">{formatCurrency(project.spent)}</TableCell>
                        )}
                        {columns.find(col => col.id === 'contractor')?.visible && (
                          <TableCell className="max-w-xs truncate">{project.contractor || '-'}</TableCell>
                        )}
                        {columns.find(col => col.id === 'projectManager')?.visible && (
                          <TableCell className="max-w-xs truncate">{project.projectManager}</TableCell>
                        )}
                        <TableCell>
                          <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white">
                              <DropdownMenuItem
                                onClick={(e) => handleRowClick(project, e as any)}
                                disabled={!hasViewAccess}
                                className="gap-2"
                              >
                                <Eye className="h-4 w-4" />
                                View Details
                                {!hasViewAccess && <Lock className="h-3 w-3 text-gray-400 ml-auto" />}
                              </DropdownMenuItem>
                              {canEdit && (
                                <DropdownMenuItem
                                  onClick={(e) => handleEditClick(project, e as any)}
                                  disabled={!hasEditAccess}
                                  className="gap-2"
                                >
                                  <Edit className="h-4 w-4" />
                                  Edit Project
                                  {!hasEditAccess && <Lock className="h-3 w-3 text-gray-400 ml-auto" />}
                                </DropdownMenuItem>
                              )}
                              {userRole === 'Admin' && (
                                <DropdownMenuItem
                                  onClick={(e) => handlePersonnelClick(project, e as any)}
                                  className="gap-2"
                                >
                                  <UserCog className="h-4 w-4" />
                                  Manage Personnel
                                </DropdownMenuItem>
                              )}
                              {canDelete && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={(e) => handleDeleteClick(project, e as any)}
                                    disabled={!hasDeleteAccess}
                                    className="gap-2 text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Delete Project
                                    {!hasDeleteAccess && <Lock className="h-3 w-3 text-gray-400 ml-auto" />}
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedProjects.length)} of {sortedProjects.length} projects
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
                const pageNum = i + 1;
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => setCurrentPage(pageNum)}
                      isActive={currentPage === pageNum}
                      className="cursor-pointer"
                    >
                      {pageNum}
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

      {/* Personnel Management Dialog */}
      <ProjectPersonnelDialog
        open={personnelDialogOpen}
        onOpenChange={setPersonnelDialogOpen}
        project={selectedProjectForPersonnel || { id: '', title: '' }}
        userRole={userRole}
        userEmail={userEmail}
        onUpdate={() => {
          // Refresh project list or handle updates
          toast.success('Personnel assignments updated');
        }}
      />
    </div>
  );
}
