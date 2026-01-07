/**
 * Repair Timeline Tab - Exclusive for Repairs Category
 * Timeline and milestone management for repair projects
 * 
 * This is a complete exclusive copy for repairs category to maintain independence
 * from construction infrastructure components as per requirements.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Badge } from '../../../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Separator } from '../../../ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../../ui/alert-dialog';
import { 
  Calendar, 
  CheckCircle2, 
  Activity, 
  Target, 
  Clock,
  Plus,
  Edit2,
  Trash2,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { AddRepairMilestoneDialog, EditRepairMilestoneDialog, RepairTimelineMilestone } from '../../dialogs/RepairTimelineDialogs';
import { toast } from 'sonner@2.0.3';

interface RepairTimelineTabProps {
  projectId: string;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export function RepairTimelineTab({ projectId, canAdd, canEdit, canDelete }: RepairTimelineTabProps) {
  const [milestones, setMilestones] = useState<RepairTimelineMilestone[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<RepairTimelineMilestone | null>(null);
  const [deletingMilestone, setDeletingMilestone] = useState<RepairTimelineMilestone | null>(null);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Initialize with sample repair data
  useEffect(() => {
    const sampleMilestones: RepairTimelineMilestone[] = [
      {
        id: 'RMS-001',
        title: 'Initial Assessment & Planning',
        description: 'Comprehensive facility assessment, damage evaluation, and detailed repair planning completed',
        startDate: '2024-01-05',
        endDate: '2024-01-20',
        actualStartDate: '2024-01-05',
        actualEndDate: '2024-01-18',
        status: 'Completed',
        progress: 100,
        durationDays: 16,
        varianceDays: 2
      },
      {
        id: 'RMS-002',
        title: 'HVAC System Repair',
        description: 'Complete overhaul of heating, ventilation, and air conditioning systems including ductwork repairs',
        startDate: '2024-01-21',
        endDate: '2024-03-15',
        actualStartDate: '2024-01-21',
        status: 'In Progress',
        progress: 75.5,
        durationDays: 54,
        varianceDays: 0
      },
      {
        id: 'RMS-003',
        title: 'Electrical System Upgrades',
        description: 'Rewiring, circuit panel replacement, and installation of energy-efficient lighting systems',
        startDate: '2024-03-01',
        endDate: '2024-04-30',
        status: 'Pending',
        progress: 0,
        durationDays: 61
      },
      {
        id: 'RMS-004',
        title: 'Plumbing System Repairs',
        description: 'Pipe replacement, fixture upgrades, and water system optimization',
        startDate: '2024-04-15',
        endDate: '2024-05-31',
        status: 'Pending',
        progress: 0,
        durationDays: 47
      },
      {
        id: 'RMS-005',
        title: 'Final Inspection & Testing',
        description: 'Comprehensive system testing, quality assurance, and final safety inspections',
        startDate: '2024-06-01',
        endDate: '2024-06-15',
        status: 'Pending',
        progress: 0,
        durationDays: 15
      }
    ];
    setMilestones(sampleMilestones);
  }, []);

  // Filter logic
  const filteredMilestones = useMemo(() => {
    return milestones.filter(milestone => {
      // Status filter
      const matchesStatus = statusFilter === 'all' || milestone.status === statusFilter;
      
      // Date filter
      let matchesDate = true;
      if (dateFrom && dateTo) {
        const milestoneStart = new Date(milestone.startDate);
        const milestoneEnd = new Date(milestone.endDate);
        const filterFrom = new Date(dateFrom);
        const filterTo = new Date(dateTo);
        matchesDate = (milestoneStart >= filterFrom && milestoneStart <= filterTo) ||
                     (milestoneEnd >= filterFrom && milestoneEnd <= filterTo) ||
                     (milestoneStart <= filterFrom && milestoneEnd >= filterTo);
      } else if (dateFrom) {
        const milestoneEnd = new Date(milestone.endDate);
        const filterFrom = new Date(dateFrom);
        matchesDate = milestoneEnd >= filterFrom;
      } else if (dateTo) {
        const milestoneStart = new Date(milestone.startDate);
        const filterTo = new Date(dateTo);
        matchesDate = milestoneStart <= filterTo;
      }
      
      return matchesStatus && matchesDate;
    });
  }, [milestones, statusFilter, dateFrom, dateTo]);

  // Pagination
  const totalPages = Math.ceil(filteredMilestones.length / itemsPerPage);
  const paginatedMilestones = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredMilestones.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredMilestones, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, dateFrom, dateTo]);

  // CRUD Handlers
  const handleAddMilestone = (data: Omit<RepairTimelineMilestone, 'id'>) => {
    const newMilestone: RepairTimelineMilestone = {
      ...data,
      id: `RMS-${String(milestones.length + 1).padStart(3, '0')}`
    };
    setMilestones([...milestones, newMilestone]);
  };

  const handleEditMilestone = (data: RepairTimelineMilestone) => {
    setMilestones(milestones.map(m => m.id === data.id ? data : m));
    setEditingMilestone(null);
  };

  const handleDeleteMilestone = () => {
    if (deletingMilestone) {
      setMilestones(milestones.filter(m => m.id !== deletingMilestone.id));
      toast.success(`Milestone "${deletingMilestone.title}" deleted successfully`);
      setDeletingMilestone(null);
    }
  };

  const getStatusIcon = (status: RepairTimelineMilestone['status']) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle2 className="w-8 h-8 text-emerald-600" />;
      case 'In Progress':
        return <Activity className="w-8 h-8 text-blue-600" />;
      case 'Delayed':
        return <Clock className="w-8 h-8 text-red-600" />;
      default:
        return <Target className="w-8 h-8 text-gray-400" />;
    }
  };

  const getStatusColor = (status: RepairTimelineMilestone['status']) => {
    switch (status) {
      case 'Completed':
        return 'border-emerald-200 bg-emerald-50';
      case 'In Progress':
        return 'border-blue-200 bg-blue-50';
      case 'Delayed':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getStatusBadgeColor = (status: RepairTimelineMilestone['status']) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-600 text-white';
      case 'In Progress':
        return 'bg-blue-600 text-white';
      case 'Delayed':
        return 'bg-red-600 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const end = new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${start} - ${end}`;
  };

  // Calculate project timeline summary
  const timelineSummary = useMemo(() => {
    const completed = milestones.filter(m => m.status === 'Completed').length;
    const inProgress = milestones.filter(m => m.status === 'In Progress').length;
    const pending = milestones.filter(m => m.status === 'Pending').length;
    
    const allDates = milestones.map(m => [new Date(m.startDate), new Date(m.endDate)]).flat();
    const projectStart = allDates.length > 0 ? new Date(Math.min(...allDates.map(d => d.getTime()))) : null;
    const projectEnd = allDates.length > 0 ? new Date(Math.max(...allDates.map(d => d.getTime()))) : null;
    
    const currentMilestone = milestones.find(m => m.status === 'In Progress');

    return {
      completed,
      inProgress,
      pending,
      projectStart: projectStart?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      projectEnd: projectEnd?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      currentMilestone: currentMilestone?.title,
      currentProgress: currentMilestone?.progress
    };
  }, [milestones]);

  return (
    <div className="space-y-6">
      <Card className="border-gray-200 shadow-sm bg-white">
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Repair Project Timeline</CardTitle>
              <CardDescription>Milestones, schedules, and key repair phases</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm">
                {filteredMilestones.length} {filteredMilestones.length === 1 ? 'Milestone' : 'Milestones'}
              </Badge>
              {canAdd && (
                <Button
                  onClick={() => setShowAddDialog(true)}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Milestone
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Filters */}
          <div className="mb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-gray-600">Status Filter</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Delayed">Delayed</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
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

            {(statusFilter !== 'all' || dateFrom || dateTo) && (
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStatusFilter('all');
                    setDateFrom('');
                    setDateTo('');
                  }}
                  className="text-xs h-7"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>

          {/* Timeline Visual */}
          {paginatedMilestones.length > 0 ? (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />
              
              {/* Timeline items */}
              <div className="space-y-8">
                {paginatedMilestones.map((milestone, index) => (
                  <div key={milestone.id} className="relative flex gap-6">
                    <div className="flex-shrink-0 w-16 flex flex-col items-center">
                      <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center z-10 ${
                        milestone.status === 'Completed' ? 'bg-emerald-100 border-emerald-600' :
                        milestone.status === 'In Progress' ? 'bg-blue-100 border-blue-600' :
                        milestone.status === 'Delayed' ? 'bg-red-100 border-red-600' :
                        'bg-gray-100 border-gray-300'
                      }`}>
                        {getStatusIcon(milestone.status)}
                      </div>
                    </div>
                    <div className={`flex-1 ${index === paginatedMilestones.length - 1 ? '' : 'pb-8'}`}>
                      <Card className={`${getStatusColor(milestone.status)} border`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="text-sm text-gray-900">{milestone.title}</h4>
                              <p className="text-xs text-gray-600 mt-1">
                                {formatDateRange(milestone.startDate, milestone.endDate)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <Badge className={getStatusBadgeColor(milestone.status)}>
                                {milestone.status} {milestone.progress > 0 && milestone.status !== 'Completed' && `${milestone.progress}%`}
                              </Badge>
                              {(canEdit || canDelete) && (
                                <div className="flex gap-1">
                                  {canEdit && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setEditingMilestone(milestone)}
                                      className="h-7 w-7 p-0 hover:bg-white/50"
                                    >
                                      <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                                    </Button>
                                  )}
                                  {canDelete && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setDeletingMilestone(milestone)}
                                      className="h-7 w-7 p-0 hover:bg-white/50"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 text-red-600" />
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-gray-700 mt-3">
                            {milestone.description}
                          </p>
                          <div className="flex items-center gap-4 mt-3 text-xs">
                            <div className="flex items-center gap-1 text-gray-600">
                              <Calendar className="w-3 h-3" />
                              <span>{milestone.durationDays} days</span>
                            </div>
                            {milestone.varianceDays !== undefined && milestone.varianceDays !== 0 && (
                              <div className={`flex items-center gap-1 ${
                                milestone.varianceDays > 0 ? 'text-emerald-700' : 'text-red-700'
                              }`}>
                                <Clock className="w-3 h-3" />
                                <span>{Math.abs(milestone.varianceDays)} day{Math.abs(milestone.varianceDays) !== 1 ? 's' : ''} {milestone.varianceDays > 0 ? 'ahead' : 'behind'}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No milestones found matching your filters
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
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

          <Separator className="my-6" />

          {/* Schedule Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Project Start</p>
              <p className="text-sm text-gray-900">{timelineSummary.projectStart || 'N/A'}</p>
            </div>
            <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <p className="text-xs text-gray-600 mb-1">Current Phase</p>
              <p className="text-sm text-emerald-700">
                {timelineSummary.currentMilestone 
                  ? `${timelineSummary.currentProgress?.toFixed(1)}%`
                  : 'Not Started'}
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Target Completion</p>
              <p className="text-sm text-gray-900">{timelineSummary.projectEnd || 'N/A'}</p>
            </div>
          </div>

          {/* Status Distribution */}
          <div className="grid grid-cols-4 gap-3 mt-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-600 mb-1">Total</p>
              <p className="text-lg text-gray-900">{milestones.length}</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-600 mb-1">Completed</p>
              <p className="text-lg text-emerald-700">{timelineSummary.completed}</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-600 mb-1">In Progress</p>
              <p className="text-lg text-blue-700">{timelineSummary.inProgress}</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-600 mb-1">Pending</p>
              <p className="text-lg text-gray-600">{timelineSummary.pending}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AddRepairMilestoneDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSubmit={handleAddMilestone}
      />

      <EditRepairMilestoneDialog
        open={!!editingMilestone}
        onOpenChange={(open) => !open && setEditingMilestone(null)}
        milestone={editingMilestone}
        onSubmit={handleEditMilestone}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingMilestone} onOpenChange={(open) => !open && setDeletingMilestone(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete milestone "{deletingMilestone?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMilestone} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
