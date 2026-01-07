import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { RepairProject, REPAIR_TYPES, REPAIR_PRIORITIES, REPAIR_STATUSES, CAMPUS_OPTIONS } from './types/RepairTypes';
import { toast } from 'sonner@2.0.3';
import { X, Wrench, DollarSign, Calendar, TrendingUp, MessageSquare, MapPin, AlertTriangle, Building2, User } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

interface RepairProjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: RepairProject | null;
  onSubmit: (project: Partial<RepairProject>) => void;
}

export function RepairProjectFormDialog({ 
  open, 
  onOpenChange, 
  project, 
  onSubmit 
}: RepairProjectFormDialogProps) {
  const [formData, setFormData] = useState<Partial<RepairProject>>({});

  useEffect(() => {
    if (open) {
      if (project) {
        setFormData(project);
      } else {
        setFormData({
          campus: 'Main Campus',
          repairType: 'Structural',
          priority: 'Medium',
          status: 'Pending',
          budget: 0,
          spent: 0,
          emergencyRepair: false,
          startDate: new Date().toISOString().split('T')[0],
          endDate: '',
          building: '',
          location: '',
          title: '',
          description: '',
          projectManager: '',
          assignedTeam: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }
  }, [project, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title?.trim()) {
      toast.error('Project title is required');
      return;
    }

    if (!formData.building?.trim()) {
      toast.error('Building is required');
      return;
    }

    if (!formData.location?.trim()) {
      toast.error('Location is required');
      return;
    }

    if (!formData.description?.trim()) {
      toast.error('Description is required');
      return;
    }

    if (!formData.startDate) {
      toast.error('Start date is required');
      return;
    }

    if (!formData.endDate) {
      toast.error('End date is required');
      return;
    }

    if (!formData.projectManager?.trim()) {
      toast.error('Project manager is required');
      return;
    }

    if (!formData.budget || formData.budget <= 0) {
      toast.error('Budget must be greater than 0');
      return;
    }

    // Update timestamps
    const submitData = {
      ...formData,
      updatedAt: new Date().toISOString(),
    };

    onSubmit(submitData);
    toast.success(project ? 'Repair project updated successfully' : 'Repair project added successfully');
    onOpenChange(false);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[90vw] lg:max-w-[85vw] xl:max-w-[80vw] 2xl:max-w-[75vw] max-h-[95vh] bg-white border-0 shadow-2xl rounded-lg overflow-hidden [&>button]:hidden">
        {/* Enhanced Formal Header */}
        <DialogHeader className="bg-gradient-to-r from-amber-900 via-orange-900 to-yellow-900 text-white -m-6 px-8 py-6 mb-0 relative">
          <Button
            onClick={() => onOpenChange(false)}
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 h-8 w-8 p-0 text-white hover:bg-white/10 hover:text-white rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
          <DialogTitle className="text-xl pr-12">
            {project ? 'Edit Repair Project Information' : 'Add New Repair Project'}
          </DialogTitle>
          <DialogDescription className="text-sm text-amber-100 mt-2">
            {project 
              ? 'Update the repair project details, financial information, and progress metrics below.' 
              : 'Enter comprehensive details for the new repair project including budget, timeline, and status information.'
            }
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Form Content */}
        <ScrollArea className="max-h-[calc(95vh-250px)] px-6 pb-4">
          <form onSubmit={handleSubmit} className="space-y-8 pt-6">
            {/* Basic Information Section */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
                <div className="p-1.5 bg-amber-50 rounded">
                  <Wrench className="w-4 h-4 text-amber-600" />
                </div>
                <h3 className="text-gray-900">Basic Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="title" className="text-sm text-gray-700">
                    Project Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={formData.title || ''}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter project title"
                    className="bg-white border-gray-200"
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description" className="text-sm text-gray-700">
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter detailed description of the repair project"
                    className="bg-white border-gray-200 min-h-[100px]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="campus" className="text-sm text-gray-700">
                    Campus <span className="text-red-500">*</span>
                  </Label>
                  <Select 
                    value={formData.campus} 
                    onValueChange={(value) => handleInputChange('campus', value)}
                  >
                    <SelectTrigger className="bg-white border-gray-200">
                      <SelectValue placeholder="Select campus" />
                    </SelectTrigger>
                    <SelectContent>
                      {CAMPUS_OPTIONS.map((campus) => (
                        <SelectItem key={campus} value={campus}>{campus}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="building" className="text-sm text-gray-700">
                    Building <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="building"
                    value={formData.building || ''}
                    onChange={(e) => handleInputChange('building', e.target.value)}
                    placeholder="Enter building name"
                    className="bg-white border-gray-200"
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="location" className="text-sm text-gray-700">
                    Specific Location <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="location"
                    value={formData.location || ''}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="e.g., 3rd Floor, Room 301"
                    className="bg-white border-gray-200"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Classification Section */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
                <div className="p-1.5 bg-blue-50 rounded">
                  <AlertTriangle className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="text-gray-900">Classification & Priority</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="repairType" className="text-sm text-gray-700">
                    Repair Type <span className="text-red-500">*</span>
                  </Label>
                  <Select 
                    value={formData.repairType} 
                    onValueChange={(value: any) => handleInputChange('repairType', value)}
                  >
                    <SelectTrigger className="bg-white border-gray-200">
                      <SelectValue placeholder="Select repair type" />
                    </SelectTrigger>
                    <SelectContent>
                      {REPAIR_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority" className="text-sm text-gray-700">
                    Priority Level <span className="text-red-500">*</span>
                  </Label>
                  <Select 
                    value={formData.priority} 
                    onValueChange={(value: any) => handleInputChange('priority', value)}
                  >
                    <SelectTrigger className="bg-white border-gray-200">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {REPAIR_PRIORITIES.map((priority) => (
                        <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm text-gray-700">
                    Status <span className="text-red-500">*</span>
                  </Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value: any) => handleInputChange('status', value)}
                  >
                    <SelectTrigger className="bg-white border-gray-200">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {REPAIR_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <Checkbox 
                  id="emergencyRepair"
                  checked={formData.emergencyRepair || false}
                  onCheckedChange={(checked) => handleInputChange('emergencyRepair', checked)}
                />
                <Label htmlFor="emergencyRepair" className="text-sm text-gray-700 cursor-pointer">
                  Mark as Emergency Repair
                </Label>
              </div>
            </div>

            {/* Timeline Section */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
                <div className="p-1.5 bg-purple-50 rounded">
                  <Calendar className="w-4 h-4 text-purple-600" />
                </div>
                <h3 className="text-gray-900">Timeline & Duration</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-sm text-gray-700">
                    Start Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate?.split('T')[0] || ''}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className="bg-white border-gray-200"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-sm text-gray-700">
                    Target Completion Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate?.split('T')[0] || ''}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className="bg-white border-gray-200"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedDuration" className="text-sm text-gray-700">
                    Estimated Duration (days)
                  </Label>
                  <Input
                    id="estimatedDuration"
                    type="number"
                    value={formData.estimatedDuration || ''}
                    onChange={(e) => handleInputChange('estimatedDuration', parseInt(e.target.value))}
                    placeholder="e.g., 30"
                    className="bg-white border-gray-200"
                    min="1"
                  />
                </div>

                {formData.status === 'Completed' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="completedAt" className="text-sm text-gray-700">
                        Completion Date
                      </Label>
                      <Input
                        id="completedAt"
                        type="date"
                        value={formData.completedAt?.split('T')[0] || ''}
                        onChange={(e) => handleInputChange('completedAt', e.target.value)}
                        className="bg-white border-gray-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="actualDuration" className="text-sm text-gray-700">
                        Actual Duration (days)
                      </Label>
                      <Input
                        id="actualDuration"
                        type="number"
                        value={formData.actualDuration || ''}
                        onChange={(e) => handleInputChange('actualDuration', parseInt(e.target.value))}
                        placeholder="e.g., 28"
                        className="bg-white border-gray-200"
                        min="1"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Financial Information Section */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
                <div className="p-1.5 bg-green-50 rounded">
                  <DollarSign className="w-4 h-4 text-green-600" />
                </div>
                <h3 className="text-gray-900">Financial Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="budget" className="text-sm text-gray-700">
                    Approved Budget (₱) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="budget"
                    type="number"
                    value={formData.budget || ''}
                    onChange={(e) => handleInputChange('budget', parseFloat(e.target.value))}
                    placeholder="0.00"
                    className="bg-white border-gray-200"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="spent" className="text-sm text-gray-700">
                    Amount Spent (₱)
                  </Label>
                  <Input
                    id="spent"
                    type="number"
                    value={formData.spent || ''}
                    onChange={(e) => handleInputChange('spent', parseFloat(e.target.value))}
                    placeholder="0.00"
                    className="bg-white border-gray-200"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contractor" className="text-sm text-gray-700">
                    Contractor
                  </Label>
                  <Input
                    id="contractor"
                    value={formData.contractor || ''}
                    onChange={(e) => handleInputChange('contractor', e.target.value)}
                    placeholder="Enter contractor name"
                    className="bg-white border-gray-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="warrantyPeriod" className="text-sm text-gray-700">
                    Warranty Period (months)
                  </Label>
                  <Input
                    id="warrantyPeriod"
                    type="number"
                    value={formData.warrantyPeriod || ''}
                    onChange={(e) => handleInputChange('warrantyPeriod', parseInt(e.target.value))}
                    placeholder="e.g., 12"
                    className="bg-white border-gray-200"
                    min="0"
                  />
                </div>
              </div>

              {/* Budget Utilization Display */}
              {formData.budget && formData.budget > 0 && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-700">Budget Utilization</span>
                    <span className="text-blue-700">
                      {((formData.spent || 0) / formData.budget * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-blue-100 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(((formData.spent || 0) / formData.budget * 100), 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 mt-2">
                    <span>Spent: ₱{(formData.spent || 0).toLocaleString()}</span>
                    <span>Budget: ₱{formData.budget.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Personnel Section */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
                <div className="p-1.5 bg-indigo-50 rounded">
                  <User className="w-4 h-4 text-indigo-600" />
                </div>
                <h3 className="text-gray-900">Personnel Assignment</h3>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="projectManager" className="text-sm text-gray-700">
                  Project Manager <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="projectManager"
                  value={formData.projectManager || ''}
                  onChange={(e) => handleInputChange('projectManager', e.target.value)}
                  placeholder="Enter project manager name"
                  className="bg-white border-gray-200"
                  required
                />
              </div>
            </div>

            {/* Additional Notes Section */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
                <div className="p-1.5 bg-gray-50 rounded">
                  <MessageSquare className="w-4 h-4 text-gray-600" />
                </div>
                <h3 className="text-gray-900">Additional Information</h3>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm text-gray-700">
                  Notes / Remarks
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ''}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Add any additional notes or remarks about this repair project"
                  className="bg-white border-gray-200 min-h-[80px]"
                />
              </div>
            </div>
          </form>
        </ScrollArea>

        {/* Fixed Footer with Actions */}
        <DialogFooter className="bg-gray-50 border-t border-gray-200 -mx-6 -mb-6 px-8 py-4 mt-6">
          <div className="flex items-center justify-between w-full gap-3">
            <p className="text-xs text-gray-500 italic">
              <span className="text-red-500">*</span> Required fields
            </p>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-gray-200 hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
              >
                {project ? 'Update Project' : 'Add Project'}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
