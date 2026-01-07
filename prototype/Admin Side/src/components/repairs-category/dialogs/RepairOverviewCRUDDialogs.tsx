import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { toast } from 'sonner@2.0.3';
import { X } from 'lucide-react';

// ============================================
// Financial Performance Dialog
// ============================================
interface FinancialPerformanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentData: {
    totalBudget: number;
    physicalAccomplishmentValue: number;
    budgetUtilization?: number;
  };
  onSubmit: (data: any) => void;
}

export function FinancialPerformanceDialog({
  open,
  onOpenChange,
  currentData,
  onSubmit
}: FinancialPerformanceDialogProps) {
  const [formData, setFormData] = useState({
    totalBudget: currentData.totalBudget || 0,
    actualSpent: currentData.physicalAccomplishmentValue || 0,
  });

  useEffect(() => {
    if (open) {
      setFormData({
        totalBudget: currentData.totalBudget || 0,
        actualSpent: currentData.physicalAccomplishmentValue || 0,
      });
    }
  }, [currentData.totalBudget, currentData.physicalAccomplishmentValue, open]);

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
  currentData: {
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
  currentData,
  onSubmit
}: PhysicalPerformanceDialogProps) {
  const [formData, setFormData] = useState({
    targetProgress: currentData.targetProgress || 100,
    actualProgress: currentData.actualProgress || 0,
    phasesDone: currentData.phasesDone || 0,
    totalPhases: currentData.totalPhases || 3,
    status: currentData.status || 'On Track'
  });

  useEffect(() => {
    if (open) {
      setFormData({
        targetProgress: currentData.targetProgress || 100,
        actualProgress: currentData.actualProgress || 0,
        phasesDone: currentData.phasesDone || 0,
        totalPhases: currentData.totalPhases || 3,
        status: currentData.status || 'On Track'
      });
    }
  }, [currentData.targetProgress, currentData.actualProgress, currentData.phasesDone, currentData.totalPhases, currentData.status, open]);

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
            Update repair completion and progress metrics
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
            <Label htmlFor="status">Repair Status</Label>
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
// Project Information Dialog (Repair-Specific)
// ============================================
interface ProjectInformationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentData: any;
  onSubmit: (data: any) => void;
}

export function ProjectInformationDialog({
  open,
  onOpenChange,
  currentData,
  onSubmit
}: ProjectInformationDialogProps) {
  const [formData, setFormData] = useState({
    projectName: currentData.projectName || '',
    location: currentData.location || '',
    repairType: currentData.repairType || '',
    contractor: currentData.contractor || '',
    projectStatus: currentData.projectStatus || 'In Progress',
    description: currentData.description || '',
    totalBudget: currentData.totalBudget || 0,
    contractDuration: currentData.contractDuration || '',
    startDate: currentData.startDate || '',
    targetEndDate: currentData.targetEndDate || '',
    objectives: currentData.objectives || [],
    keyFeatures: currentData.keyFeatures || [],
    beneficiaries: currentData.beneficiaries || ''
  });

  useEffect(() => {
    if (open && currentData) {
      setFormData({
        projectName: currentData.projectName || '',
        location: currentData.location || '',
        repairType: currentData.repairType || '',
        contractor: currentData.contractor || '',
        projectStatus: currentData.projectStatus || 'In Progress',
        description: currentData.description || '',
        totalBudget: currentData.totalBudget || 0,
        contractDuration: currentData.contractDuration || '',
        startDate: currentData.startDate || '',
        targetEndDate: currentData.targetEndDate || '',
        objectives: currentData.objectives || [],
        keyFeatures: currentData.keyFeatures || [],
        beneficiaries: currentData.beneficiaries || ''
      });
    }
  }, [currentData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.projectName.trim()) {
      toast.error('Please enter a project name');
      return;
    }

    onSubmit(formData);
    toast.success('Project information updated successfully');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[90vw] lg:max-w-[900px] max-h-[95vh] bg-white border-0 shadow-2xl rounded-lg overflow-hidden [&>button]:hidden">
        <DialogHeader className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-800 text-white -m-6 px-8 py-6 mb-0 relative">
          <Button
            onClick={() => onOpenChange(false)}
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 h-8 w-8 p-0 text-white hover:bg-white/10 hover:text-white rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
          <DialogTitle className="text-xl pr-12">Edit Repair Project Information</DialogTitle>
          <DialogDescription className="text-sm text-purple-100 mt-2 sr-only">
            Update repair project details, budget, and timeline
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto max-h-[calc(95vh-180px)] p-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="projectName">Repair Project Name *</Label>
            <Input
              id="projectName"
              value={formData.projectName}
              onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="repairType">Repair Type *</Label>
              <Input
                id="repairType"
                value={formData.repairType}
                onChange={(e) => setFormData({ ...formData, repairType: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contractor">Contractor *</Label>
              <Input
                id="contractor"
                value={formData.contractor}
                onChange={(e) => setFormData({ ...formData, contractor: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectStatus">Repair Status</Label>
              <Select
                value={formData.projectStatus}
                onValueChange={(value) => setFormData({ ...formData, projectStatus: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="On Hold">On Hold</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="contractDuration">Contract Duration (days)</Label>
              <Input
                id="contractDuration"
                value={formData.contractDuration}
                onChange={(e) => setFormData({ ...formData, contractDuration: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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

          <DialogFooter className="border-t pt-4 mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
              Update Project Information
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Project Health Dialog
// ============================================
interface ProjectHealthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentData: any;
  onSubmit: (data: any) => void;
}

export function ProjectHealthDialog({
  open,
  onOpenChange,
  currentData,
  onSubmit
}: ProjectHealthDialogProps) {
  const [formData, setFormData] = useState({
    budgetHealth: currentData.budgetHealth || { value: '60%', status: 'On Track' },
    physicalHealth: currentData.physicalHealth || { value: '75%', status: 'On Track' },
    scheduleHealth: currentData.scheduleHealth || { value: 'Active', status: 'Normal' },
    qualityHealth: currentData.qualityHealth || { value: 'Good', status: 'Standards Met' },
    targetCompletion: currentData.targetCompletion || '',
    daysRemaining: currentData.daysRemaining || 0
  });

  useEffect(() => {
    if (open && currentData) {
      setFormData({
        budgetHealth: currentData.budgetHealth || { value: '60%', status: 'On Track' },
        physicalHealth: currentData.physicalHealth || { value: '75%', status: 'On Track' },
        scheduleHealth: currentData.scheduleHealth || { value: 'Active', status: 'Normal' },
        qualityHealth: currentData.qualityHealth || { value: 'Good', status: 'Standards Met' },
        targetCompletion: currentData.targetCompletion || '',
        daysRemaining: currentData.daysRemaining || 0
      });
    }
  }, [currentData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    toast.success('Project health metrics updated successfully');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[700px] max-h-[95vh] bg-white border-0 shadow-2xl rounded-lg overflow-hidden [&>button]:hidden">
        <DialogHeader className="bg-gradient-to-r from-amber-900 via-orange-900 to-amber-800 text-white -m-6 px-8 py-6 mb-0 relative">
          <Button
            onClick={() => onOpenChange(false)}
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 h-8 w-8 p-0 text-white hover:bg-white/10 hover:text-white rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
          <DialogTitle className="text-xl pr-12">Edit Project Health Metrics</DialogTitle>
          <DialogDescription className="text-sm text-amber-100 mt-2 sr-only">
            Update project health indicators and status
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto max-h-[calc(95vh-180px)] p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budgetHealthValue">Budget Health Value</Label>
              <Input
                id="budgetHealthValue"
                value={formData.budgetHealth.value}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  budgetHealth: { ...formData.budgetHealth, value: e.target.value }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budgetHealthStatus">Budget Health Status</Label>
              <Input
                id="budgetHealthStatus"
                value={formData.budgetHealth.status}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  budgetHealth: { ...formData.budgetHealth, status: e.target.value }
                })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="physicalHealthValue">Physical Health Value</Label>
              <Input
                id="physicalHealthValue"
                value={formData.physicalHealth.value}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  physicalHealth: { ...formData.physicalHealth, value: e.target.value }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="physicalHealthStatus">Physical Health Status</Label>
              <Input
                id="physicalHealthStatus"
                value={formData.physicalHealth.status}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  physicalHealth: { ...formData.physicalHealth, status: e.target.value }
                })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduleHealthValue">Schedule Health Value</Label>
              <Input
                id="scheduleHealthValue"
                value={formData.scheduleHealth.value}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  scheduleHealth: { ...formData.scheduleHealth, value: e.target.value }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduleHealthStatus">Schedule Health Status</Label>
              <Input
                id="scheduleHealthStatus"
                value={formData.scheduleHealth.status}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  scheduleHealth: { ...formData.scheduleHealth, status: e.target.value }
                })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="qualityHealthValue">Quality Health Value</Label>
              <Input
                id="qualityHealthValue"
                value={formData.qualityHealth.value}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  qualityHealth: { ...formData.qualityHealth, value: e.target.value }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qualityHealthStatus">Quality Health Status</Label>
              <Input
                id="qualityHealthStatus"
                value={formData.qualityHealth.status}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  qualityHealth: { ...formData.qualityHealth, status: e.target.value }
                })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetCompletion">Target Completion</Label>
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
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-amber-600 hover:bg-amber-700">
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
    amount: 0,
    description: ''
  });

  useEffect(() => {
    if (!open) {
      setFormData({
        reportTitle: '',
        reportDate: new Date().toISOString().split('T')[0],
        amount: 0,
        description: ''
      });
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.reportTitle.trim()) {
      toast.error('Please enter a report title');
      return;
    }

    onSubmit(formData);
    toast.success('Financial report added successfully');
    onOpenChange(false);
  };

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
          <DialogTitle className="text-xl pr-12">Add Financial Report</DialogTitle>
          <DialogDescription className="text-sm text-emerald-100 mt-2 sr-only">
            Create a new financial report entry
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto max-h-[calc(95vh-180px)] p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reportTitle">Report Title *</Label>
            <Input
              id="reportTitle"
              value={formData.reportTitle}
              onChange={(e) => setFormData({ ...formData, reportTitle: e.target.value })}
              required
            />
          </div>

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
            <Label htmlFor="amount">Amount (₱)</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              className="text-right"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
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
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    description: '',
    status: 'Pending'
  });

  useEffect(() => {
    if (!open) {
      setFormData({
        phaseName: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        description: '',
        status: 'Pending'
      });
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.phaseName.trim()) {
      toast.error('Please enter a phase name');
      return;
    }

    onSubmit(formData);
    toast.success('Phase added successfully');
    onOpenChange(false);
  };

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
          <DialogTitle className="text-xl pr-12">Add Project Phase</DialogTitle>
          <DialogDescription className="text-sm text-blue-100 mt-2 sr-only">
            Create a new project phase
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto max-h-[calc(95vh-180px)] p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phaseName">Phase Name *</Label>
            <Input
              id="phaseName"
              value={formData.phaseName}
              onChange={(e) => setFormData({ ...formData, phaseName: e.target.value })}
              required
            />
          </div>

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
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
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
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
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
