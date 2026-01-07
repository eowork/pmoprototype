import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { toast } from 'sonner@2.0.3';
import { X, Calendar } from 'lucide-react';

// ============================================
// Timeline Milestone Interface
// ============================================
export interface TimelineMilestone {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Delayed';
  progress: number;
  durationDays: number;
  varianceDays?: number;
}

// ============================================
// Add Milestone Dialog
// ============================================
interface AddMilestoneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<TimelineMilestone, 'id'>) => void;
}

export function AddMilestoneDialog({
  open,
  onOpenChange,
  onSubmit
}: AddMilestoneDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    actualStartDate: '',
    actualEndDate: '',
    status: 'Pending' as TimelineMilestone['status'],
    progress: 0
  });

  useEffect(() => {
    if (!open) {
      setFormData({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        actualStartDate: '',
        actualEndDate: '',
        status: 'Pending',
        progress: 0
      });
    }
  }, [open]);

  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Please enter a milestone title');
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      toast.error('Please provide both start and end dates');
      return;
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      toast.error('End date cannot be before start date');
      return;
    }

    const durationDays = calculateDays(formData.startDate, formData.endDate);
    let varianceDays = 0;

    if (formData.actualStartDate && formData.actualEndDate) {
      const actualDuration = calculateDays(formData.actualStartDate, formData.actualEndDate);
      varianceDays = durationDays - actualDuration;
    }

    onSubmit({
      ...formData,
      durationDays,
      varianceDays: formData.actualEndDate ? varianceDays : undefined,
      actualStartDate: formData.actualStartDate || undefined,
      actualEndDate: formData.actualEndDate || undefined
    });
    onOpenChange(false);
    toast.success('Milestone added successfully');
  };

  const durationDays = calculateDays(formData.startDate, formData.endDate);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[90vw] lg:max-w-[800px] max-h-[95vh] bg-white border-0 shadow-2xl rounded-lg overflow-hidden [&>button]:hidden">
        <DialogHeader className="bg-gradient-to-r from-emerald-900 via-green-900 to-teal-900 text-white -m-6 px-8 py-6 mb-0 relative">
          <Button
            onClick={() => onOpenChange(false)}
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 h-8 w-8 p-0 text-white hover:bg-white/10 hover:text-white rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
          <DialogTitle className="flex items-center gap-3 text-xl pr-12">
            <div className="p-2 bg-white/10 rounded-lg">
              <Calendar className="h-5 w-5" />
            </div>
            Add Project Milestone
          </DialogTitle>
          <DialogDescription className="text-sm text-emerald-100 mt-2 sr-only">
            Create a new project milestone with schedule and progress tracking
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto max-h-[calc(95vh-180px)] p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Milestone Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Phase 3: Interior Finishing Works"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Detailed description of milestone activities..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: TimelineMilestone['status']) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Delayed">Delayed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="progress">Progress (%)</Label>
              <Input
                id="progress"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: parseFloat(e.target.value) || 0 })}
                className="text-right"
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm text-gray-900 mb-3">Target Schedule</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm text-gray-900 mb-3">Actual Schedule (Optional)</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="actualStartDate">Actual Start Date</Label>
                <Input
                  id="actualStartDate"
                  type="date"
                  value={formData.actualStartDate}
                  onChange={(e) => setFormData({ ...formData, actualStartDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="actualEndDate">Actual End Date</Label>
                <Input
                  id="actualEndDate"
                  type="date"
                  value={formData.actualEndDate}
                  onChange={(e) => setFormData({ ...formData, actualEndDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          {durationDays > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">Estimated Duration:</span>
                <span className="text-emerald-700">{durationDays} days</span>
              </div>
            </div>
          )}

          <DialogFooter className="border-t pt-4 mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
              Add Milestone
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Edit Milestone Dialog
// ============================================
interface EditMilestoneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  milestone: TimelineMilestone | null;
  onSubmit: (data: TimelineMilestone) => void;
}

export function EditMilestoneDialog({
  open,
  onOpenChange,
  milestone,
  onSubmit
}: EditMilestoneDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    actualStartDate: '',
    actualEndDate: '',
    status: 'Pending' as TimelineMilestone['status'],
    progress: 0
  });

  useEffect(() => {
    if (milestone && open) {
      setFormData({
        title: milestone.title,
        description: milestone.description,
        startDate: milestone.startDate,
        endDate: milestone.endDate,
        actualStartDate: milestone.actualStartDate || '',
        actualEndDate: milestone.actualEndDate || '',
        status: milestone.status,
        progress: milestone.progress
      });
    }
  }, [milestone, open]);

  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!milestone) return;

    if (!formData.title.trim()) {
      toast.error('Please enter a milestone title');
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      toast.error('Please provide both start and end dates');
      return;
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      toast.error('End date cannot be before start date');
      return;
    }

    const durationDays = calculateDays(formData.startDate, formData.endDate);
    let varianceDays = 0;

    if (formData.actualStartDate && formData.actualEndDate) {
      const actualDuration = calculateDays(formData.actualStartDate, formData.actualEndDate);
      varianceDays = durationDays - actualDuration;
    }

    onSubmit({
      ...milestone,
      ...formData,
      durationDays,
      varianceDays: formData.actualEndDate ? varianceDays : undefined,
      actualStartDate: formData.actualStartDate || undefined,
      actualEndDate: formData.actualEndDate || undefined
    });
    onOpenChange(false);
    toast.success('Milestone updated successfully');
  };

  const durationDays = calculateDays(formData.startDate, formData.endDate);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[90vw] lg:max-w-[800px] max-h-[95vh] bg-white border-0 shadow-2xl rounded-lg overflow-hidden [&>button]:hidden">
        <DialogHeader className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-800 text-white -m-6 px-8 py-6 mb-0 relative">
          <Button
            onClick={() => onOpenChange(false)}
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 h-8 w-8 p-0 text-white hover:bg-white/10 hover:text-white rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
          <DialogTitle className="flex items-center gap-3 text-xl pr-12">
            <div className="p-2 bg-white/10 rounded-lg">
              <Calendar className="h-5 w-5" />
            </div>
            Edit Milestone
          </DialogTitle>
          <DialogDescription className="text-sm text-blue-100 mt-2 sr-only">
            Update milestone details, schedule, and progress tracking
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto max-h-[calc(95vh-180px)] p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Milestone Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Phase 3: Interior Finishing Works"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Detailed description of milestone activities..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: TimelineMilestone['status']) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Delayed">Delayed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="progress">Progress (%)</Label>
              <Input
                id="progress"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: parseFloat(e.target.value) || 0 })}
                className="text-right"
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm text-gray-900 mb-3">Target Schedule</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm text-gray-900 mb-3">Actual Schedule (Optional)</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="actualStartDate">Actual Start Date</Label>
                <Input
                  id="actualStartDate"
                  type="date"
                  value={formData.actualStartDate}
                  onChange={(e) => setFormData({ ...formData, actualStartDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="actualEndDate">Actual End Date</Label>
                <Input
                  id="actualEndDate"
                  type="date"
                  value={formData.actualEndDate}
                  onChange={(e) => setFormData({ ...formData, actualEndDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          {durationDays > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">Estimated Duration:</span>
                <span className="text-blue-700">{durationDays} days</span>
              </div>
            </div>
          )}

          <DialogFooter className="border-t pt-4 mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Update Milestone
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
