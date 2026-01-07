import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Badge } from '../../../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../../../ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../../ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../ui/tooltip';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Download, 
  FileText,
  Filter,
  Columns3,
  Search,
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/analyticsHelpers';
import { toast } from 'sonner@2.0.3';
import { AddPOWItemDialog, EditPOWItemDialog, POWItem } from '../../dialogs/POWDialogs';

interface IndividualPOWTabProps {
  projectId: string;
  userRole: string;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  powItems?: POWItem[];
  onPowItemsChange?: (items: POWItem[]) => void;
}

// Column visibility configuration
interface ColumnConfig {
  id: string;
  label: string;
  visible: boolean;
}

export function IndividualPOWTabEnhanced({ 
  projectId, 
  userRole, 
  canAdd, 
  canEdit, 
  canDelete,
  powItems: externalPowItems,
  onPowItemsChange
}: IndividualPOWTabProps) {
  const [powItems, setPowItems] = useState<POWItem[]>(externalPowItems || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<POWItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<POWItem | null>(null);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Column visibility state - Default shows essential columns only to avoid horizontal scrollbar
  const [columns, setColumns] = useState<ColumnConfig[]>([
    { id: 'id', label: 'ID', visible: true },
    { id: 'description', label: 'Description', visible: true },
    { id: 'quantity', label: 'Quantity', visible: true },
    { id: 'unit', label: 'Unit', visible: true },
    { id: 'estimatedMaterialCost', label: 'Material Cost', visible: false },
    { id: 'estimatedLaborCost', label: 'Labor Cost', visible: false },
    { id: 'estimatedProjectCost', label: 'Project Cost', visible: true },
    { id: 'unitCost', label: 'Unit Cost', visible: false },
    { id: 'dateOfEntry', label: 'Date of Entry', visible: false },
    { id: 'status', label: 'Status', visible: true },
    { id: 'remarks', label: 'Remarks', visible: false },
  ]);

  // Generate sample data
  useEffect(() => {
    const sampleData: POWItem[] = [
      {
        id: 'POW-001',
        description: 'Site Preparation and Excavation',
        quantity: 1500,
        unit: 'cubic meters',
        estimatedMaterialCost: 450000,
        estimatedLaborCost: 300000,
        estimatedProjectCost: 750000,
        unitCost: 500,
        dateOfEntry: '2024-01-15',
        status: 'Completed'
      },
      {
        id: 'POW-002',
        description: 'Foundation Works - Concrete Pouring',
        quantity: 800,
        unit: 'cubic meters',
        estimatedMaterialCost: 1200000,
        estimatedLaborCost: 600000,
        estimatedProjectCost: 1800000,
        unitCost: 2250,
        dateOfEntry: '2024-01-20',
        status: 'Completed'
      },
      {
        id: 'POW-003',
        description: 'Steel Framework Installation',
        quantity: 120,
        unit: 'tons',
        estimatedMaterialCost: 7200000,
        estimatedLaborCost: 1800000,
        estimatedProjectCost: 9000000,
        unitCost: 75000,
        dateOfEntry: '2024-02-01',
        status: 'Active'
      },
      {
        id: 'POW-004',
        description: 'Roofing System - Metal Deck Installation',
        quantity: 3500,
        unit: 'square meters',
        estimatedMaterialCost: 2800000,
        estimatedLaborCost: 1400000,
        estimatedProjectCost: 4200000,
        unitCost: 1200,
        dateOfEntry: '2024-02-15',
        status: 'Active'
      },
      {
        id: 'POW-005',
        description: 'Electrical Rough-In Works',
        quantity: 1,
        unit: 'lot',
        estimatedMaterialCost: 2500000,
        estimatedLaborCost: 1500000,
        estimatedProjectCost: 4000000,
        unitCost: 4000000,
        dateOfEntry: '2024-03-01',
        status: 'Pending'
      },
      {
        id: 'POW-006',
        description: 'Plumbing Rough-In Works',
        quantity: 1,
        unit: 'lot',
        estimatedMaterialCost: 1800000,
        estimatedLaborCost: 1200000,
        estimatedProjectCost: 3000000,
        unitCost: 3000000,
        dateOfEntry: '2024-03-01',
        status: 'Pending'
      },
      {
        id: 'POW-007',
        description: 'Interior Partition Walls',
        quantity: 2500,
        unit: 'square meters',
        estimatedMaterialCost: 1500000,
        estimatedLaborCost: 1000000,
        estimatedProjectCost: 2500000,
        unitCost: 1000,
        dateOfEntry: '2024-03-15',
        status: 'Pending'
      }
    ];
    
    // Only set sample data if no external data is provided
    if (!externalPowItems || externalPowItems.length === 0) {
      setPowItems(sampleData);
    }
  }, [externalPowItems]);

  // Sync powItems changes to parent
  useEffect(() => {
    if (onPowItemsChange) {
      onPowItemsChange(powItems);
    }
  }, [powItems, onPowItemsChange]);

  // Filter and search logic
  const filteredAndSearchedItems = useMemo(() => {
    return powItems.filter(item => {
      // Search filter
      const matchesSearch = item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      
      // Date filter
      let matchesDate = true;
      if (dateFrom && dateTo) {
        const itemDate = new Date(item.dateOfEntry);
        const fromDate = new Date(dateFrom);
        const toDate = new Date(dateTo);
        matchesDate = itemDate >= fromDate && itemDate <= toDate;
      } else if (dateFrom) {
        const itemDate = new Date(item.dateOfEntry);
        const fromDate = new Date(dateFrom);
        matchesDate = itemDate >= fromDate;
      } else if (dateTo) {
        const itemDate = new Date(item.dateOfEntry);
        const toDate = new Date(dateTo);
        matchesDate = itemDate <= toDate;
      }
      
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [powItems, searchTerm, statusFilter, dateFrom, dateTo]);

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSearchedItems.length / itemsPerPage);
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSearchedItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSearchedItems, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateFrom, dateTo]);

  // CRUD Handlers
  const handleAddItem = (data: Omit<POWItem, 'id'>) => {
    const newItem: POWItem = {
      ...data,
      id: `POW-${String(powItems.length + 1).padStart(3, '0')}`
    };
    setPowItems([...powItems, newItem]);
  };

  const handleEditItem = (data: POWItem) => {
    setPowItems(powItems.map(item => item.id === data.id ? data : item));
    setEditingItem(null);
  };

  const handleDeleteItem = () => {
    if (deletingItem) {
      setPowItems(powItems.filter(item => item.id !== deletingItem.id));
      toast.success(`POW item ${deletingItem.id} deleted successfully`);
      setDeletingItem(null);
    }
  };

  const handleToggleColumn = (columnId: string) => {
    setColumns(columns.map(col => 
      col.id === columnId ? { ...col, visible: !col.visible } : col
    ));
  };

  const handleExportData = () => {
    const csv = [
      columns.filter(c => c.visible).map(c => c.label).join(','),
      ...filteredAndSearchedItems.map(item => 
        columns.filter(c => c.visible).map(c => {
          const value = item[c.id as keyof POWItem];
          if (typeof value === 'number') {
            return c.id.includes('Cost') ? formatCurrency(value) : value;
          }
          return value || '';
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `POW_Items_${projectId}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('POW data exported successfully');
  };

  const getStatusBadge = (status?: string) => {
    const statusColors = {
      'Active': 'bg-blue-100 text-blue-700 border-blue-200',
      'Completed': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'Pending': 'bg-amber-100 text-amber-700 border-amber-200',
      'Cancelled': 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return statusColors[status as keyof typeof statusColors] || statusColors.Active;
  };

  const totals = useMemo(() => ({
    materialCost: filteredAndSearchedItems.reduce((sum, item) => sum + item.estimatedMaterialCost, 0),
    laborCost: filteredAndSearchedItems.reduce((sum, item) => sum + item.estimatedLaborCost, 0),
    projectCost: filteredAndSearchedItems.reduce((sum, item) => sum + item.estimatedProjectCost, 0)
  }), [filteredAndSearchedItems]);

  return (
    <div className="space-y-6">
      <Card className="border-gray-200 shadow-sm bg-white">
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                Individual Program of Works
              </CardTitle>
              <CardDescription>Detailed breakdown of project work items with cost estimates</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {canAdd && (
                <Button
                  onClick={() => setShowAddDialog(true)}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add POW Item
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleExportData}
                className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Filters and Search */}
          <div className="space-y-4 mb-6">
            {/* Search and Filters Row with Column Dropdown at Rightmost */}
            <div className="flex items-end gap-4">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search by description or ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">Status Filter</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">From Date</Label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">To Date</Label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
              </div>

              {/* Column Visibility - Rightmost Position */}
              <div className="space-y-1">
                <Label className="text-xs text-gray-600">Columns</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="default" className="h-10">
                            <Columns3 className="w-4 h-4 mr-2" />
                            Columns
                            <Badge variant="secondary" className="ml-2 text-[10px] px-1.5 py-0">
                              {columns.filter(c => c.visible).length}/{columns.length}
                            </Badge>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {columns.map(column => (
                            <DropdownMenuCheckboxItem
                              key={column.id}
                              checked={column.visible}
                              onCheckedChange={() => handleToggleColumn(column.id)}
                            >
                              {column.label}
                            </DropdownMenuCheckboxItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Show or hide table columns</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {/* Active Filters Display */}
            {(statusFilter !== 'all' || dateFrom || dateTo || searchTerm) && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Active filters:</span>
                  {statusFilter !== 'all' && (
                    <Badge variant="outline" className="text-xs">
                      Status: {statusFilter}
                    </Badge>
                  )}
                  {(dateFrom || dateTo) && (
                    <Badge variant="outline" className="text-xs">
                      <Calendar className="w-3 h-3 mr-1" />
                      Date Range
                    </Badge>
                  )}
                  {searchTerm && (
                    <Badge variant="outline" className="text-xs">
                      Search: "{searchTerm}"
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  Showing {paginatedItems.length} of {filteredAndSearchedItems.length} items
                </div>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    {columns.filter(c => c.visible).map(column => (
                      <TableHead key={column.id} className="whitespace-nowrap">
                        {column.label}
                      </TableHead>
                    ))}
                    {(canEdit || canDelete) && (
                      <TableHead className="text-center">Actions</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedItems.length > 0 ? (
                    paginatedItems.map((item) => (
                      <TableRow key={item.id} className="hover:bg-gray-50">
                        {columns.find(c => c.id === 'id')?.visible && (
                          <TableCell className="text-sm">{item.id}</TableCell>
                        )}
                        {columns.find(c => c.id === 'description')?.visible && (
                          <TableCell className="max-w-xs">
                            <div className="text-sm text-gray-900 line-clamp-2">{item.description}</div>
                          </TableCell>
                        )}
                        {columns.find(c => c.id === 'quantity')?.visible && (
                          <TableCell className="text-right text-sm">{item.quantity.toLocaleString()}</TableCell>
                        )}
                        {columns.find(c => c.id === 'unit')?.visible && (
                          <TableCell className="text-sm">{item.unit}</TableCell>
                        )}
                        {columns.find(c => c.id === 'estimatedMaterialCost')?.visible && (
                          <TableCell className="text-right text-sm">{formatCurrency(item.estimatedMaterialCost)}</TableCell>
                        )}
                        {columns.find(c => c.id === 'estimatedLaborCost')?.visible && (
                          <TableCell className="text-right text-sm">{formatCurrency(item.estimatedLaborCost)}</TableCell>
                        )}
                        {columns.find(c => c.id === 'estimatedProjectCost')?.visible && (
                          <TableCell className="text-right text-sm">{formatCurrency(item.estimatedProjectCost)}</TableCell>
                        )}
                        {columns.find(c => c.id === 'unitCost')?.visible && (
                          <TableCell className="text-right text-sm">{formatCurrency(item.unitCost)}</TableCell>
                        )}
                        {columns.find(c => c.id === 'dateOfEntry')?.visible && (
                          <TableCell className="text-sm">{formatDate(item.dateOfEntry)}</TableCell>
                        )}
                        {columns.find(c => c.id === 'status')?.visible && (
                          <TableCell>
                            <Badge className={getStatusBadge(item.status)}>
                              {item.status || 'Active'}
                            </Badge>
                          </TableCell>
                        )}
                        {columns.find(c => c.id === 'remarks')?.visible && (
                          <TableCell className="max-w-xs">
                            <div className="text-sm text-gray-600 truncate" title={item.remarks || ''}>
                              {item.remarks || '-'}
                            </div>
                          </TableCell>
                        )}
                        {(canEdit || canDelete) && (
                          <TableCell>
                            <div className="flex items-center justify-center gap-1">
                              {canEdit && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingItem(item)}
                                  className="h-8 w-8 p-0 hover:bg-blue-50"
                                >
                                  <Edit2 className="w-4 h-4 text-blue-600" />
                                </Button>
                              )}
                              {canDelete && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDeletingItem(item)}
                                  className="h-8 w-8 p-0 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.filter(c => c.visible).length + ((canEdit || canDelete) ? 1 : 0)}
                        className="text-center py-12 text-gray-500"
                      >
                        No POW items found matching your filters
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <p className="text-xs text-gray-600 mb-1">Total Material Cost</p>
              <p className="text-lg text-emerald-700">{formatCurrency(totals.materialCost)}</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-xs text-gray-600 mb-1">Total Labor Cost</p>
              <p className="text-lg text-blue-700">{formatCurrency(totals.laborCost)}</p>
            </div>
            <div className="bg-gray-900 text-white rounded-lg p-4">
              <p className="text-xs text-gray-300 mb-1">Total Project Cost</p>
              <p className="text-lg">{formatCurrency(totals.projectCost)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AddPOWItemDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSubmit={handleAddItem}
      />

      <EditPOWItemDialog
        open={!!editingItem}
        onOpenChange={(open) => !open && setEditingItem(null)}
        powItem={editingItem}
        onSubmit={handleEditItem}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingItem} onOpenChange={(open) => !open && setDeletingItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete POW item "{deletingItem?.id}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItem} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
