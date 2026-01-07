import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { toast } from 'sonner@2.0.3';
import { X, Plus } from 'lucide-react';

// ============================================
// Financial Performance Dialog
// ============================================
interface FinancialPerformanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: {
    totalBudget: number;
    actualSpent: number;
    utilization: number;
  };
  onSubmit: (data: any) => void;
}

export function FinancialPerformanceDialog({
  open,
  onOpenChange,
  data,
  onSubmit
}: FinancialPerformanceDialogProps) {
  const [formData, setFormData] = useState({
    totalBudget: data.totalBudget || 0,
    actualSpent: data.actualSpent || 0,
  });

  // Update form data when dialog opens or data changes
  useEffect(() => {
    if (open) {
      setFormData({
        totalBudget: data.totalBudget || 0,
        actualSpent: data.actualSpent || 0,
      });
    }
  }, [data.totalBudget, data.actualSpent, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.actualSpent > formData.totalBudget) {
      toast.error('Actual spent cannot exceed total budget');
      return;
    }

    if (formData.totalBudget <= 0) {
      toast.error('Total budget must be greater than 0');
      return;
    }

    onSubmit(formData);
    toast.success('Financial performance updated successfully');
    onOpenChange(false);
  };

  const utilization = formData.totalBudget > 0 
    ? ((formData.actualSpent / formData.totalBudget) * 100).toFixed(1)
    : '0';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[600px] max-h-[95vh] bg-white border-0 shadow-2xl rounded-lg overflow-hidden [&>button]:hidden">
        <DialogHeader className="bg-gradient-to-r from-emerald-900 via-green-900 to-teal-900 text-white -m-6 px-8 py-6 mb-0 relative">
          <Button
            onClick={() => onOpenChange(false)}
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 h-8 w-8 p-0 text-white hover:bg-white/10 hover:text-white rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
          <DialogTitle className="text-xl pr-12">Edit Financial Performance</DialogTitle>
          <DialogDescription className="text-sm text-emerald-100 mt-2 sr-only">
            Update budget allocation and utilization metrics
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto max-h-[calc(95vh-180px)] p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="totalBudget">Total Budget (₱) *</Label>
            <Input
              id="totalBudget"
              type="number"
              min="0"
              step="0.01"
              value={formData.totalBudget}
              onChange={(e) => setFormData({ ...formData, totalBudget: parseFloat(e.target.value) || 0 })}
              required
              className="text-right"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="actualSpent">Actual Spent (₱) *</Label>
            <Input
              id="actualSpent"
              type="number"
              min="0"
              step="0.01"
              value={formData.actualSpent}
              onChange={(e) => setFormData({ ...formData, actualSpent: parseFloat(e.target.value) || 0 })}
              required
              className="text-right"
            />
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700">Budget Utilization:</span>
              <span className="text-emerald-700">{utilization}%</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-gray-700">Remaining Budget:</span>
              <span className="text-gray-900">
                ₱{(formData.totalBudget - formData.actualSpent).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
              Update Financial Data
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Physical Performance Dialog
// ============================================
interface PhysicalPerformanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: {
    targetProgress: number;
    actualProgress: number;
    phasesDone: number;
    totalPhases: number;
    status: string;
  };
  onSubmit: (data: any) => void;
}

export function PhysicalPerformanceDialog({
  open,
  onOpenChange,
  data,
  onSubmit
}: PhysicalPerformanceDialogProps) {
  const [formData, setFormData] = useState({
    targetProgress: data.targetProgress || 100,
    actualProgress: data.actualProgress || 0,
    phasesDone: data.phasesDone || 0,
    totalPhases: data.totalPhases || 3,
    status: data.status || 'On Track'
  });

  // Update form data when dialog opens or data changes
  useEffect(() => {
    if (open) {
      setFormData({
        targetProgress: data.targetProgress || 100,
        actualProgress: data.actualProgress || 0,
        phasesDone: data.phasesDone || 0,
        totalPhases: data.totalPhases || 3,
        status: data.status || 'On Track'
      });
    }
  }, [data.targetProgress, data.actualProgress, data.phasesDone, data.totalPhases, data.status, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.actualProgress > 100 || formData.targetProgress > 100) {
      toast.error('Progress cannot exceed 100%');
      return;
    }

    if (formData.actualProgress < 0 || formData.targetProgress < 0) {
      toast.error('Progress cannot be negative');
      return;
    }

    if (formData.phasesDone > formData.totalPhases) {
      toast.error('Completed phases cannot exceed total phases');
      return;
    }

    if (formData.totalPhases < 1) {
      toast.error('Total phases must be at least 1');
      return;
    }

    onSubmit(formData);
    toast.success('Physical performance updated successfully');
    onOpenChange(false);
  };

  const variance = formData.actualProgress - formData.targetProgress;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[600px] max-h-[95vh] bg-white border-0 shadow-2xl rounded-lg overflow-hidden [&>button]:hidden">
        <DialogHeader className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-800 text-white -m-6 px-8 py-6 mb-0 relative">
          <Button
            onClick={() => onOpenChange(false)}
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 h-8 w-8 p-0 text-white hover:bg-white/10 hover:text-white rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
          <DialogTitle className="text-xl pr-12">Edit Physical Performance</DialogTitle>
          <DialogDescription className="text-sm text-blue-100 mt-2 sr-only">
            Update project completion and progress metrics
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto max-h-[calc(95vh-180px)] p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetProgress">Target Progress (%) *</Label>
              <Input
                id="targetProgress"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.targetProgress}
                onChange={(e) => setFormData({ ...formData, targetProgress: parseFloat(e.target.value) || 0 })}
                required
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="actualProgress">Actual Progress (%) *</Label>
              <Input
                id="actualProgress"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.actualProgress}
                onChange={(e) => setFormData({ ...formData, actualProgress: parseFloat(e.target.value) || 0 })}
                required
                className="text-right"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phasesDone">Phases Completed *</Label>
              <Input
                id="phasesDone"
                type="number"
                min="0"
                value={formData.phasesDone}
                onChange={(e) => setFormData({ ...formData, phasesDone: parseInt(e.target.value) || 0 })}
                required
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalPhases">Total Phases *</Label>
              <Input
                id="totalPhases"
                type="number"
                min="1"
                value={formData.totalPhases}
                onChange={(e) => setFormData({ ...formData, totalPhases: parseInt(e.target.value) || 3 })}
                required
                className="text-right"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Project Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="On Track">On Track</SelectItem>
                <SelectItem value="Minor Delays">Minor Delays</SelectItem>
                <SelectItem value="Critical Delays">Critical Delays</SelectItem>
                <SelectItem value="Ahead of Schedule">Ahead of Schedule</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700">Progress Variance:</span>
              <span className={variance >= 0 ? 'text-emerald-700' : 'text-red-700'}>
                {variance >= 0 ? '+' : ''}{variance.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-gray-700">Completion Rate:</span>
              <span className="text-gray-900">
                {formData.phasesDone}/{formData.totalPhases} phases
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Update Physical Data
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Project Health Monitor Dialog
// ============================================
interface ProjectHealthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: {
    budgetHealth: { value: string; status: string };
    physicalHealth: { value: string; status: string };
    scheduleHealth: { value: string; status: string };
    qualityHealth: { value: string; status: string };
    targetCompletion: string;
    daysRemaining: number;
  };
  onSubmit: (data: any) => void;
}

export function ProjectHealthDialog({
  open,
  onOpenChange,
  data,
  onSubmit
}: ProjectHealthDialogProps) {
  const [formData, setFormData] = useState({
    budgetValue: data.budgetHealth?.value || '56%',
    budgetStatus: data.budgetHealth?.status || 'Review Required',
    physicalValue: data.physicalHealth?.value || '69%',
    physicalStatus: data.physicalHealth?.status || 'Minor Delays',
    scheduleValue: data.scheduleHealth?.value || 'Active',
    scheduleStatus: data.scheduleHealth?.status || 'Normal',
    qualityValue: data.qualityHealth?.value || 'Excellent',
    qualityStatus: data.qualityHealth?.status || 'Standards Met',
    targetCompletion: data.targetCompletion || '',
    daysRemaining: data.daysRemaining || 0
  });

  // Update form data when dialog opens or data changes
  useEffect(() => {
    if (open) {
      setFormData({
        budgetValue: data.budgetHealth?.value || '56%',
        budgetStatus: data.budgetHealth?.status || 'Review Required',
        physicalValue: data.physicalHealth?.value || '69%',
        physicalStatus: data.physicalHealth?.status || 'Minor Delays',
        scheduleValue: data.scheduleHealth?.value || 'Active',
        scheduleStatus: data.scheduleHealth?.status || 'Normal',
        qualityValue: data.qualityHealth?.value || 'Excellent',
        qualityStatus: data.qualityHealth?.status || 'Standards Met',
        targetCompletion: data.targetCompletion || '',
        daysRemaining: data.daysRemaining || 0
      });
    }
  }, [data.budgetHealth, data.physicalHealth, data.scheduleHealth, data.qualityHealth, data.targetCompletion, data.daysRemaining, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedData = {
      budgetHealth: { value: formData.budgetValue, status: formData.budgetStatus },
      physicalHealth: { value: formData.physicalValue, status: formData.physicalStatus },
      scheduleHealth: { value: formData.scheduleValue, status: formData.scheduleStatus },
      qualityHealth: { value: formData.qualityValue, status: formData.qualityStatus },
      targetCompletion: formData.targetCompletion,
      daysRemaining: formData.daysRemaining
    };
    
    onSubmit(updatedData);
    toast.success('Project health metrics updated successfully');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[90vw] lg:max-w-[800px] max-h-[95vh] bg-white border-0 shadow-2xl rounded-lg overflow-hidden [&>button]:hidden">
        <DialogHeader className="bg-gradient-to-r from-slate-900 via-gray-900 to-slate-800 text-white -m-6 px-8 py-6 mb-0 relative">
          <Button
            onClick={() => onOpenChange(false)}
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 h-8 w-8 p-0 text-white hover:bg-white/10 hover:text-white rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
          <DialogTitle className="text-xl pr-12">Edit Project Health Monitor</DialogTitle>
          <DialogDescription className="text-sm text-gray-200 mt-2 sr-only">
            Update health metrics and project timeline information
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto max-h-[calc(95vh-180px)] p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Budget Health */}
            <div className="space-y-2">
              <Label htmlFor="budgetValue">Budget Value</Label>
              <Input
                id="budgetValue"
                value={formData.budgetValue}
                onChange={(e) => setFormData({ ...formData, budgetValue: e.target.value })}
                placeholder="e.g., 56%"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budgetStatus">Budget Status</Label>
              <Input
                id="budgetStatus"
                value={formData.budgetStatus}
                onChange={(e) => setFormData({ ...formData, budgetStatus: e.target.value })}
                placeholder="e.g., Review Required"
              />
            </div>

            {/* Physical Health */}
            <div className="space-y-2">
              <Label htmlFor="physicalValue">Physical Value</Label>
              <Input
                id="physicalValue"
                value={formData.physicalValue}
                onChange={(e) => setFormData({ ...formData, physicalValue: e.target.value })}
                placeholder="e.g., 69%"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="physicalStatus">Physical Status</Label>
              <Input
                id="physicalStatus"
                value={formData.physicalStatus}
                onChange={(e) => setFormData({ ...formData, physicalStatus: e.target.value })}
                placeholder="e.g., Minor Delays"
              />
            </div>

            {/* Schedule Health */}
            <div className="space-y-2">
              <Label htmlFor="scheduleValue">Schedule Value</Label>
              <Input
                id="scheduleValue"
                value={formData.scheduleValue}
                onChange={(e) => setFormData({ ...formData, scheduleValue: e.target.value })}
                placeholder="e.g., Active"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduleStatus">Schedule Status</Label>
              <Input
                id="scheduleStatus"
                value={formData.scheduleStatus}
                onChange={(e) => setFormData({ ...formData, scheduleStatus: e.target.value })}
                placeholder="e.g., Normal"
              />
            </div>

            {/* Quality Health */}
            <div className="space-y-2">
              <Label htmlFor="qualityValue">Quality Value</Label>
              <Input
                id="qualityValue"
                value={formData.qualityValue}
                onChange={(e) => setFormData({ ...formData, qualityValue: e.target.value })}
                placeholder="e.g., Excellent"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qualityStatus">Quality Status</Label>
              <Input
                id="qualityStatus"
                value={formData.qualityStatus}
                onChange={(e) => setFormData({ ...formData, qualityStatus: e.target.value })}
                placeholder="e.g., Standards Met"
              />
            </div>

            {/* Timeline Info */}
            <div className="space-y-2">
              <Label htmlFor="targetCompletion">Target Completion Date</Label>
              <Input
                id="targetCompletion"
                type="date"
                value={formData.targetCompletion}
                onChange={(e) => setFormData({ ...formData, targetCompletion: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="daysRemaining">Days Remaining</Label>
              <Input
                id="daysRemaining"
                type="number"
                min="0"
                value={formData.daysRemaining}
                onChange={(e) => setFormData({ ...formData, daysRemaining: parseInt(e.target.value) || 0 })}
                className="text-right"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gray-700 hover:bg-gray-800">
              Update Health Metrics
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Add Financial Report Dialog
// ============================================
interface AddFinancialReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
}

export function AddFinancialReportDialog({
  open,
  onOpenChange,
  onSubmit
}: AddFinancialReportDialogProps) {
  const [formData, setFormData] = useState({
    reportTitle: '',
    reportDate: new Date().toISOString().split('T')[0],
    targetBudget: 0,
    actualSpent: 0,
    status: 'Active' as 'Active' | 'Historical',
    remarks: ''
  });

  useEffect(() => {
    if (!open) {
      setFormData({
        reportTitle: '',
        reportDate: new Date().toISOString().split('T')[0],
        targetBudget: 0,
        actualSpent: 0,
        status: 'Active',
        remarks: ''
      });
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.actualSpent > formData.targetBudget) {
      toast.error('Actual spent cannot exceed target budget');
      return;
    }

    if (!formData.reportTitle.trim()) {
      toast.error('Please enter a report title');
      return;
    }

    const variance = formData.targetBudget - formData.actualSpent;
    const utilization = formData.targetBudget > 0 
      ? ((formData.actualSpent / formData.targetBudget) * 100) 
      : 0;

    onSubmit({
      ...formData,
      variance,
      utilization
    });
    onOpenChange(false);
    toast.success('Financial report added successfully');
  };

  const variance = formData.targetBudget - formData.actualSpent;
  const utilization = formData.targetBudget > 0 
    ? ((formData.actualSpent / formData.targetBudget) * 100).toFixed(1)
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[700px] max-h-[95vh] bg-white border-0 shadow-2xl rounded-lg overflow-hidden [&>button]:hidden">
        <DialogHeader className="bg-gradient-to-r from-emerald-900 via-green-900 to-teal-900 text-white -m-6 px-8 py-6 mb-0 relative">
          <Button
            onClick={() => onOpenChange(false)}
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 h-8 w-8 p-0 text-white hover:bg-white/10 hover:text-white rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
          <DialogTitle className="text-xl pr-12">Add Financial Report</DialogTitle>
          <DialogDescription className="text-sm text-emerald-100 mt-2 sr-only">
            Add a new financial accomplishment report with budget details
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto max-h-[calc(95vh-180px)] p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reportTitle">Report Title *</Label>
            <Input
              id="reportTitle"
              value={formData.reportTitle}
              onChange={(e) => setFormData({ ...formData, reportTitle: e.target.value })}
              placeholder="e.g., Q1 2025 Financial Report"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reportDate">Report Date *</Label>
              <Input
                id="reportDate"
                type="date"
                value={formData.reportDate}
                onChange={(e) => setFormData({ ...formData, reportDate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'Active' | 'Historical') => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Historical">Historical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetBudget">Target Budget (₱) *</Label>
              <Input
                id="targetBudget"
                type="number"
                min="0"
                step="0.01"
                value={formData.targetBudget}
                onChange={(e) => setFormData({ ...formData, targetBudget: parseFloat(e.target.value) || 0 })}
                required
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="actualSpent">Actual Spent (₱) *</Label>
              <Input
                id="actualSpent"
                type="number"
                min="0"
                step="0.01"
                value={formData.actualSpent}
                onChange={(e) => setFormData({ ...formData, actualSpent: parseFloat(e.target.value) || 0 })}
                required
                className="text-right"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks/Notes</Label>
            <Textarea
              id="remarks"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              rows={3}
              placeholder="Additional notes or comments..."
            />
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Variance:</span>
                <span className={variance >= 0 ? 'text-emerald-700' : 'text-red-700'}>
                  {variance >= 0 ? '+' : ''}₱{Math.abs(variance).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Utilization:</span>
                <span className="text-emerald-700">{utilization}%</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
              Add Report
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Add Phase Dialog
// ============================================
interface AddPhaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
}

export function AddPhaseDialog({
  open,
  onOpenChange,
  onSubmit
}: AddPhaseDialogProps) {
  const [formData, setFormData] = useState({
    phaseName: '',
    phaseDescription: '',
    targetProgress: 100,
    actualProgress: 0,
    status: 'Pending' as 'Pending' | 'In Progress' | 'Complete' | 'Delayed',
    targetStartDate: '',
    targetEndDate: '',
    actualStartDate: '',
    actualEndDate: '',
    remarks: ''
  });

  useEffect(() => {
    if (!open) {
      setFormData({
        phaseName: '',
        phaseDescription: '',
        targetProgress: 100,
        actualProgress: 0,
        status: 'Pending',
        targetStartDate: '',
        targetEndDate: '',
        actualStartDate: '',
        actualEndDate: '',
        remarks: ''
      });
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.phaseName.trim()) {
      toast.error('Please enter a phase name');
      return;
    }

    if (formData.actualProgress > formData.targetProgress) {
      toast.error('Actual progress cannot exceed target progress');
      return;
    }

    const variance = formData.actualProgress - formData.targetProgress;
    
    onSubmit({
      ...formData,
      variance
    });
    onOpenChange(false);
    toast.success('Phase added successfully');
  };

  const variance = formData.actualProgress - formData.targetProgress;

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
          <DialogTitle className="text-xl pr-12">Add Project Phase</DialogTitle>
          <DialogDescription className="text-sm text-blue-100 mt-2 sr-only">
            Add a new project phase with progress tracking details
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto max-h-[calc(95vh-180px)] p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phaseName">Phase Name *</Label>
            <Input
              id="phaseName"
              value={formData.phaseName}
              onChange={(e) => setFormData({ ...formData, phaseName: e.target.value })}
              placeholder="e.g., Phase 3: Interior Finishing"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phaseDescription">Phase Description</Label>
            <Textarea
              id="phaseDescription"
              value={formData.phaseDescription}
              onChange={(e) => setFormData({ ...formData, phaseDescription: e.target.value })}
              rows={2}
              placeholder="Brief description of phase activities..."
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetProgress">Target Progress (%) *</Label>
              <Input
                id="targetProgress"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.targetProgress}
                onChange={(e) => setFormData({ ...formData, targetProgress: parseFloat(e.target.value) || 0 })}
                required
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="actualProgress">Actual Progress (%) *</Label>
              <Input
                id="actualProgress"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.actualProgress}
                onChange={(e) => setFormData({ ...formData, actualProgress: parseFloat(e.target.value) || 0 })}
                required
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Phase Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'Pending' | 'In Progress' | 'Complete' | 'Delayed') => 
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Complete">Complete</SelectItem>
                  <SelectItem value="Delayed">Delayed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetStartDate">Target Start Date</Label>
              <Input
                id="targetStartDate"
                type="date"
                value={formData.targetStartDate}
                onChange={(e) => setFormData({ ...formData, targetStartDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetEndDate">Target End Date</Label>
              <Input
                id="targetEndDate"
                type="date"
                value={formData.targetEndDate}
                onChange={(e) => setFormData({ ...formData, targetEndDate: e.target.value })}
              />
            </div>
          </div>

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

          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks/Notes</Label>
            <Textarea
              id="remarks"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              rows={3}
              placeholder="Additional notes or comments..."
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700">Progress Variance:</span>
              <span className={variance >= 0 ? 'text-emerald-700' : 'text-red-700'}>
                {variance >= 0 ? '+' : ''}{variance.toFixed(1)}%
              </span>
            </div>
            {variance < 0 && (
              <p className="text-xs text-amber-600 mt-2">⚠️ Phase is behind schedule</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Add Phase
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Project Information Dialog - Comprehensive Edition
// ============================================
interface ProjectInformationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: {
    projectName: string;
    location: string;
    fundingSource: string;
    contractDuration: string;
    projectStatus: string;
    contractor: string;
    description: string;
    totalBudget?: number;
    beneficiaries?: string;
    startDate?: string;
    targetEndDate?: string;
    objectives?: string[];
    keyFeatures?: string[];
  };
  onSubmit: (data: any) => void;
}

export function ProjectInformationDialog({
  open,
  onOpenChange,
  data,
  onSubmit
}: ProjectInformationDialogProps) {
  const [formData, setFormData] = useState({
    projectName: data.projectName || '',
    location: data.location || '',
    fundingSource: data.fundingSource || '',
    contractDuration: data.contractDuration || '',
    projectStatus: data.projectStatus || 'Planning',
    contractor: data.contractor || '',
    description: data.description || '',
    totalBudget: data.totalBudget || 0,
    beneficiaries: data.beneficiaries || '',
    startDate: data.startDate || '',
    targetEndDate: data.targetEndDate || '',
    objectives: data.objectives || ['', '', '', '', ''],
    keyFeatures: data.keyFeatures || ['', '', '', '', '', '', '', '']
  });

  useEffect(() => {
    setFormData({
      projectName: data.projectName || '',
      location: data.location || '',
      fundingSource: data.fundingSource || '',
      contractDuration: data.contractDuration || '',
      projectStatus: data.projectStatus || 'Planning',
      contractor: data.contractor || '',
      description: data.description || '',
      totalBudget: data.totalBudget || 0,
      beneficiaries: data.beneficiaries || '',
      startDate: data.startDate || '',
      targetEndDate: data.targetEndDate || '',
      objectives: data.objectives || ['', '', '', '', ''],
      keyFeatures: data.keyFeatures || ['', '', '', '', '', '', '', '']
    });
  }, [data, open]);

  const handleObjectiveChange = (index: number, value: string) => {
    const newObjectives = [...formData.objectives];
    newObjectives[index] = value;
    setFormData({ ...formData, objectives: newObjectives });
  };

  const handleKeyFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.keyFeatures];
    newFeatures[index] = value;
    setFormData({ ...formData, keyFeatures: newFeatures });
  };

  const addObjective = () => {
    setFormData({ ...formData, objectives: [...formData.objectives, ''] });
  };

  const removeObjective = (index: number) => {
    const newObjectives = formData.objectives.filter((_, i) => i !== index);
    setFormData({ ...formData, objectives: newObjectives });
  };

  const addKeyFeature = () => {
    setFormData({ ...formData, keyFeatures: [...formData.keyFeatures, ''] });
  };

  const removeKeyFeature = (index: number) => {
    const newFeatures = formData.keyFeatures.filter((_, i) => i !== index);
    setFormData({ ...formData, keyFeatures: newFeatures });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out empty objectives and key features
    const cleanedData = {
      ...formData,
      objectives: formData.objectives.filter(obj => obj.trim() !== ''),
      keyFeatures: formData.keyFeatures.filter(feat => feat.trim() !== '')
    };

    onSubmit(cleanedData);
    onOpenChange(false);
    toast.success('Project information updated successfully');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[90vw] lg:max-w-[1000px] max-h-[95vh] bg-white border-0 shadow-2xl rounded-lg overflow-hidden [&>button]:hidden">
        <DialogHeader className="bg-gradient-to-r from-emerald-900 via-green-900 to-teal-900 text-white -m-6 px-8 py-6 mb-0 relative">
          <Button
            onClick={() => onOpenChange(false)}
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 h-8 w-8 p-0 text-white hover:bg-white/10 hover:text-white rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
          <DialogTitle className="text-xl pr-12">Edit Project Information</DialogTitle>
          <DialogDescription className="text-sm text-emerald-100 mt-2 sr-only">
            Update comprehensive project details, objectives, and key features
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto max-h-[calc(95vh-180px)] p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name *</Label>
              <Input
                id="projectName"
                value={formData.projectName}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Project Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                placeholder="Enter detailed project description..."
                required
              />
            </div>
          </div>

          {/* Key Details Grid */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Key Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalBudget">Total Budget (₱) *</Label>
                <Input
                  id="totalBudget"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.totalBudget}
                  onChange={(e) => setFormData({ ...formData, totalBudget: parseFloat(e.target.value) || 0 })}
                  required
                  className="text-right"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fundingSource">Funding Source *</Label>
                <Input
                  id="fundingSource"
                  value={formData.fundingSource}
                  onChange={(e) => setFormData({ ...formData, fundingSource: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectStatus">Project Status *</Label>
                <Select
                  value={formData.projectStatus}
                  onValueChange={(value) => setFormData({ ...formData, projectStatus: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Planning">Planning</SelectItem>
                    <SelectItem value="Ongoing">Ongoing</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Delayed">Delayed</SelectItem>
                    <SelectItem value="Suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contractor">Contractor</Label>
                <Input
                  id="contractor"
                  value={formData.contractor}
                  onChange={(e) => setFormData({ ...formData, contractor: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contractDuration">Contract Duration</Label>
                <Input
                  id="contractDuration"
                  value={formData.contractDuration}
                  onChange={(e) => setFormData({ ...formData, contractDuration: e.target.value })}
                  placeholder="e.g., 365 days"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="beneficiaries">Beneficiaries</Label>
                <Input
                  id="beneficiaries"
                  value={formData.beneficiaries}
                  onChange={(e) => setFormData({ ...formData, beneficiaries: e.target.value })}
                  placeholder="e.g., 5,000+ students and staff"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetEndDate">Target End Date</Label>
                <Input
                  id="targetEndDate"
                  type="date"
                  value={formData.targetEndDate}
                  onChange={(e) => setFormData({ ...formData, targetEndDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Project Objectives */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 border-b pb-2 flex-1">Project Objectives</h3>
              <Button type="button" variant="outline" size="sm" onClick={addObjective} className="ml-2">
                <Plus className="w-3 h-3 mr-1" />
                Add
              </Button>
            </div>
            
            <div className="space-y-3">
              {formData.objectives.map((objective, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="flex-1">
                    <Textarea
                      value={objective}
                      onChange={(e) => handleObjectiveChange(index, e.target.value)}
                      placeholder={`Objective ${index + 1}`}
                      rows={2}
                      className="text-sm"
                    />
                  </div>
                  {formData.objectives.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeObjective(index)}
                      className="mt-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Key Features */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 border-b pb-2 flex-1">Key Features</h3>
              <Button type="button" variant="outline" size="sm" onClick={addKeyFeature} className="ml-2">
                <Plus className="w-3 h-3 mr-1" />
                Add
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {formData.keyFeatures.map((feature, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="flex-1">
                    <Textarea
                      value={feature}
                      onChange={(e) => handleKeyFeatureChange(index, e.target.value)}
                      placeholder={`Key Feature ${index + 1}`}
                      rows={2}
                      className="text-sm"
                    />
                  </div>
                  {formData.keyFeatures.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeKeyFeature(index)}
                      className="mt-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="sticky bottom-0 bg-white pt-4 border-t mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
              Update Project Information
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
