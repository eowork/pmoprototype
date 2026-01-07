import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Save } from 'lucide-react';
import { Project } from '../../utils/projectData';
import { POW_STATUS_OPTIONS, STATUS_OPTIONS } from '../constants/categoryConstants';

interface ProjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  formData: Partial<Project>;
  setFormData: (data: Partial<Project>) => void;
  formErrors: {[key: string]: string};
  onSubmit: () => void;
  isSubmitting: boolean;
  categoryTitle: string;
}

export function ProjectFormDialog({
  open,
  onOpenChange,
  mode,
  formData,
  setFormData,
  formErrors,
  onSubmit,
  isSubmitting,
  categoryTitle
}: ProjectFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create New Project' : 'Edit Project'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? `Enter the details for the new ${categoryTitle.toLowerCase()} project.`
              : 'Update the project details.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="projectName">Project Name *</Label>
            <Input
              id="projectName"
              value={formData.projectName || ''}
              onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
              placeholder="Enter project name"
              className={formErrors.projectName ? 'border-red-500' : ''}
            />
            {formErrors.projectName && (
              <p className="text-xs text-red-500">{formErrors.projectName}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="totalContractAmount">Total Contract Amount *</Label>
            <Input
              id="totalContractAmount"
              type="number"
              value={formData.totalContractAmount || ''}
              onChange={(e) => setFormData({ ...formData, totalContractAmount: Number(e.target.value) })}
              placeholder="Enter amount in PHP"
              className={formErrors.totalContractAmount ? 'border-red-500' : ''}
            />
            {formErrors.totalContractAmount && (
              <p className="text-xs text-red-500">{formErrors.totalContractAmount}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contractor">Contractor *</Label>
            <Input
              id="contractor"
              value={formData.contractor || ''}
              onChange={(e) => setFormData({ ...formData, contractor: e.target.value })}
              placeholder="Enter contractor name"
              className={formErrors.contractor ? 'border-red-500' : ''}
            />
            {formErrors.contractor && (
              <p className="text-xs text-red-500">{formErrors.contractor}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={formData.location || ''}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Enter location"
              className={formErrors.location ? 'border-red-500' : ''}
            />
            {formErrors.location && (
              <p className="text-xs text-red-500">{formErrors.location}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date *</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate || ''}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className={formErrors.startDate ? 'border-red-500' : ''}
            />
            {formErrors.startDate && (
              <p className="text-xs text-red-500">{formErrors.startDate}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate || ''}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="physicalAccomplishment">Physical Accomplishment (%) *</Label>
            <Input
              id="physicalAccomplishment"
              type="number"
              min="0"
              max="100"
              value={formData.physicalAccomplishment || ''}
              onChange={(e) => setFormData({ ...formData, physicalAccomplishment: Number(e.target.value) })}
              placeholder="0-100"
              className={formErrors.physicalAccomplishment ? 'border-red-500' : ''}
            />
            {formErrors.physicalAccomplishment && (
              <p className="text-xs text-red-500">{formErrors.physicalAccomplishment}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="powStatus">POW Status</Label>
            <Select
              value={formData.powStatus || 'Pending'}
              onValueChange={(value) => setFormData({ ...formData, powStatus: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {POW_STATUS_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Project Status</Label>
            <Select
              value={formData.status || 'Planning'}
              onValueChange={(value) => setFormData({ ...formData, status: value as Project['status'] })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.slice(1).map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter project description"
              rows={3}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={onSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                {mode === 'create' ? 'Creating...' : 'Updating...'}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {mode === 'create' ? 'Create Project' : 'Update Project'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}