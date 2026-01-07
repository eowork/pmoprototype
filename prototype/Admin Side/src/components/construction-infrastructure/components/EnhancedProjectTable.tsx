import React, { useState } from 'react';
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
import { enhancedRBACService } from '../services/EnhancedRBACService';
import { ProjectPersonnelDialog } from '../admin/ProjectPersonnelDialog';

interface Column {
  id: string;
  label: string;
  visible: boolean;
  sortable?: boolean;
}

interface EnhancedProjectTableProps {
  projects: any[];
  userRole: string;
  userEmail?: string;
  userDepartment?: string;
  onProjectSelect: (project: any) => void;
  onEditProject?: (project: any) => void;
  onDeleteProject?: (project: any) => void;
  canEdit?: boolean;
  canDelete?: boolean;
  externalStatusFilter?: string; // Allow external status filter from pie chart
  onStatusFilterChange?: (status: string) => void; // Callback when status filter changes
}

const DEFAULT_COLUMNS: Column[] = [
  { id: 'projectTitle', label: 'Project Title', visible: true, sortable: true },
  { id: 'fundingSource', label: 'Funding Source', visible: true, sortable: true },
  { id: 'status', label: 'Status', visible: true, sortable: true },
  { id: 'progressAccomplishment', label: 'Progress (%)', visible: true, sortable: true },
  { id: 'dateStarted', label: 'Date Started', visible: true, sortable: true },
  { id: 'targetDateCompletion', label: 'Target Completion', visible: true, sortable: true },
  { id: 'approvedBudget', label: 'Approved Budget', visible: false, sortable: true },
  { id: 'appropriation', label: 'Appropriation', visible: false, sortable: true },
  { id: 'obligation', label: 'Obligation', visible: false, sortable: true },
  { id: 'disbursement', label: 'Disbursement', visible: false, sortable: true },
  { id: 'totalProjectCost', label: 'Total Project Cost', visible: false, sortable: true },
  { id: 'projectDuration', label: 'Duration', visible: false, sortable: false },
  { id: 'category', label: 'Category', visible: false, sortable: true },
];

export function EnhancedProjectTable({
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
}: EnhancedProjectTableProps) {
  const [columns, setColumns] = useState<Column[]>(DEFAULT_COLUMNS);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState(externalStatusFilter || 'all');
  
  // Sync external status filter
  React.useEffect(() => {
    if (externalStatusFilter) {
      setStatusFilter(externalStatusFilter);
    }
  }, [externalStatusFilter]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<string>('projectTitle');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [personnelDialogOpen, setPersonnelDialogOpen] = useState(false);
  const [selectedProjectForPersonnel, setSelectedProjectForPersonnel] = useState<any>(null);

  // RBAC: Check if user can view a specific project
  const canViewProject = (project: any) => {
    return enhancedRBACService.canViewProject(userEmail, userRole, project.id, userDepartment);
  };

  // RBAC: Check project edit access
  const checkProjectEditAccess = (project: any) => {
    return enhancedRBACService.canEditProject(userEmail, userRole, project.id);
  };

  // RBAC: Check project delete access
  const checkProjectDeleteAccess = (project: any) => {
    return enhancedRBACService.canDeleteProject(userEmail, userRole, project.id);
  };

  // Handle row click - navigate to project detail if user has access
  const handleRowClick = (project: any, event: React.MouseEvent) => {
    // Don't navigate if clicking on action buttons or interactive elements
    const target = event.target as HTMLElement;
    if (
      target.closest('button') || 
      target.closest('[role="menuitem"]') ||
      target.closest('[role="menu"]') ||
      target.closest('[data-radix-dropdown-menu-content]')
    ) {
      return;
    }

    // Check if user can view this project
    if (canViewProject(project)) {
      onProjectSelect(project);
    } else {
      toast.error('Access Denied', {
        description: 'You are not assigned to this project. Contact an administrator for access.'
      });
    }
  };

  const handleOpenPersonnelDialog = (project: any, event?: React.MouseEvent) => {
    // Prevent event propagation to avoid triggering row click
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    setSelectedProjectForPersonnel(project);
    setPersonnelDialogOpen(true);
  };

  const toggleColumn = (columnId: string, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    setColumns(prevColumns => prevColumns.map(col =>
      col.id === columnId ? { ...col, visible: !col.visible } : col
    ));
  };

  const toggleSort = (columnId: string) => {
    if (sortBy === columnId) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(columnId);
      setSortOrder('asc');
    }
  };

  const getFilteredProjects = () => {
    let filtered = projects.filter(project => {
      const matchesSearch = project.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           project.fundingSource.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || project.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  const filteredProjects = getFilteredProjects();
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProjects = filteredProjects.slice(startIndex, endIndex);

  const visibleColumns = columns.filter(col => col.visible);

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      'Completed': 'bg-emerald-50 text-emerald-700 border-emerald-200/50 hover:bg-emerald-100',
      'Ongoing': 'bg-blue-50 text-blue-700 border-blue-200/50 hover:bg-blue-100',
      'Planning': 'bg-amber-50 text-amber-700 border-amber-200/50 hover:bg-amber-100',
      'On Hold': 'bg-gray-100 text-gray-700 border-gray-200/50 hover:bg-gray-200',
      'Delayed': 'bg-red-50 text-red-700 border-red-200/50 hover:bg-red-100',
      'Suspended': 'bg-orange-50 text-orange-700 border-orange-200/50 hover:bg-orange-100'
    };
    
    return (
      <Badge 
        variant="outline" 
        className={`${statusStyles[status] || 'bg-gray-50 text-gray-700 border-gray-200'} transition-colors font-medium`}
      >
        {status}
      </Badge>
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatValue = (columnId: string, value: any) => {
    if (['approvedBudget', 'appropriation', 'obligation', 'disbursement', 'totalProjectCost'].includes(columnId)) {
      return formatCurrency(value);
    }
    if (columnId === 'progressAccomplishment') {
      return `${value.toFixed(1)}%`;
    }
    if (columnId === 'status') {
      return getStatusBadge(value);
    }
    return value;
  };

  const handleExport = () => {
    toast.success('Exporting project data...');
    // Export functionality would go here
  };

  const categories = Array.from(new Set(projects.map(p => p.category)));
  const statuses = Array.from(new Set(projects.map(p => p.status)));

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="border-b border-gray-100 bg-gray-50/50 pb-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-gray-900">Project List</CardTitle>
              <CardDescription className="mt-1">
                Showing {filteredProjects.length} of {projects.length} projects
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="border-gray-200 hover:bg-gray-50 transition-colors">
                    <Columns className="w-4 h-4 mr-2" />
                    Columns
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56" onCloseAutoFocus={(e) => e.preventDefault()}>
                  <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {columns.map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={column.visible}
                      onSelect={(e) => {
                        e.preventDefault();
                        toggleColumn(column.id);
                      }}
                      onCheckedChange={(checked) => {
                        setColumns(prevColumns => prevColumns.map(col =>
                          col.id === column.id ? { ...col, visible: checked } : col
                        ));
                      }}
                    >
                      {column.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by project title or funding source..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 border-gray-200 bg-white hover:border-gray-300 transition-colors"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px] border-gray-200 bg-white hover:border-gray-300 transition-colors">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative">
              <Select value={statusFilter} onValueChange={(value) => {
                setStatusFilter(value);
                onStatusFilterChange?.(value);
              }}>
                <SelectTrigger className={`w-[180px] border-gray-200 bg-white hover:border-gray-300 transition-colors ${externalStatusFilter && externalStatusFilter !== 'all' ? 'border-primary bg-primary/5' : ''}`}>
                  <div className="flex items-center gap-2">
                    {externalStatusFilter && externalStatusFilter !== 'all' && (
                      <Filter className="w-3.5 h-3.5 text-primary" />
                    )}
                    <SelectValue placeholder="All Status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {statuses.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {externalStatusFilter && externalStatusFilter !== 'all' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStatusFilter('all');
                    onStatusFilterChange?.('all');
                  }}
                  className="absolute -right-10 top-1/2 -translate-y-1/2 h-8 px-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
                  title="Clear filter"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                setItemsPerPage(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[120px] border-gray-200 bg-white hover:border-gray-300 transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 rows</SelectItem>
                <SelectItem value="25">25 rows</SelectItem>
                <SelectItem value="50">50 rows</SelectItem>
                <SelectItem value="100">100 rows</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className={`${visibleColumns.length > 6 ? 'overflow-x-auto' : 'overflow-x-visible'}`}>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/80 border-b border-gray-200">
                {visibleColumns.map((column) => (
                  <TableHead key={column.id} className="text-gray-700 font-medium">
                    {column.sortable ? (
                      <Button
                        variant="ghost"
                        onClick={() => toggleSort(column.id)}
                        className="h-8 px-2 -ml-2 hover:bg-gray-100 transition-colors"
                      >
                        {column.label}
                        {sortBy === column.id && (
                          sortOrder === 'asc' ? 
                            <SortAsc className="ml-2 h-4 w-4 text-primary" /> : 
                            <SortDesc className="ml-2 h-4 w-4 text-primary" />
                        )}
                      </Button>
                    ) : (
                      column.label
                    )}
                  </TableHead>
                ))}
                <TableHead className="text-right text-gray-700 font-medium">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProjects.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={visibleColumns.length + 1}
                    className="text-center py-16 text-gray-500 bg-gray-50/30"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <Filter className="w-12 h-12 text-gray-300" />
                      <div>
                        <p className="font-medium text-gray-700">No projects found</p>
                        <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filter criteria</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedProjects.map((project) => {
                  const hasViewAccess = canViewProject(project);
                  const hasEditAccess = checkProjectEditAccess(project);
                  const hasDeleteAccess = checkProjectDeleteAccess(project);
                  const isRestricted = !hasViewAccess && userRole !== 'Admin' && userRole !== 'Client';
                  
                  return (
                    <TableRow 
                      key={project.id} 
                      onClick={(e) => handleRowClick(project, e)}
                      className={`border-b border-gray-100 transition-colors ${
                        hasViewAccess 
                          ? 'hover:bg-emerald-50/50 cursor-pointer' 
                          : 'hover:bg-gray-50/80 opacity-60'
                      }`}
                      title={hasViewAccess ? 'Click to view project details' : 'Access restricted - not assigned to this project'}
                    >
                      {visibleColumns.map((column) => (
                        <TableCell key={column.id} className="text-gray-700">
                          <div className="flex items-center gap-2">
                            {column.id === 'projectTitle' && isRestricted && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs">Access Restricted</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                            {formatValue(column.id, project[column.id])}
                          </div>
                        </TableCell>
                      ))}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">{
                          isRestricted ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled
                                    className="h-8 w-8 p-0 text-gray-400"
                                  >
                                    <ShieldAlert className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">Not assigned to this project</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <DropdownMenu modal={false}>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-gray-100 transition-colors"
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel className="text-xs font-medium text-gray-500 uppercase">Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onProjectSelect(project);
                                  }}
                                  className="cursor-pointer hover:bg-gray-50"
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  <span>View Details</span>
                                </DropdownMenuItem>
                                {hasEditAccess && onEditProject && (
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onEditProject(project);
                                    }}
                                    className="cursor-pointer text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                                  >
                                    <Edit className="w-4 h-4 mr-2" />
                                    <span>Edit Project</span>
                                  </DropdownMenuItem>
                                )}
                                {(userRole === 'Admin' || (userRole === 'Staff' && hasEditAccess)) && (
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenPersonnelDialog(project, e);
                                    }}
                                    className="cursor-pointer text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                                  >
                                    <UserCog className="w-4 h-4 mr-2" />
                                    <span>Assign Personnel</span>
                                  </DropdownMenuItem>
                                )}
                                {hasDeleteAccess && onDeleteProject && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteProject(project);
                                      }}
                                      className="cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      <span>Delete Project</span>
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-gray-100 py-4 px-6 bg-gray-50/30">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing <span className="font-medium text-gray-900">{startIndex + 1}</span> to <span className="font-medium text-gray-900">{Math.min(endIndex, filteredProjects.length)}</span> of <span className="font-medium text-gray-900">{filteredProjects.length}</span> results
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
          </div>
        )}
      </CardContent>
      {/* Project Personnel Dialog */}
      {selectedProjectForPersonnel && (
        <ProjectPersonnelDialog
          open={personnelDialogOpen}
          onOpenChange={setPersonnelDialogOpen}
          project={{
            id: selectedProjectForPersonnel.id,
            projectTitle: selectedProjectForPersonnel.projectTitle
          }}
          userRole={userRole}
          userEmail={userEmail}
          onUpdate={() => {
            // Force re-render to update access indicators
            setCurrentPage(currentPage);
          }}
        />
      )}
    </Card>
  );
}