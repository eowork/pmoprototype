import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ConstructionProject } from './types/ProjectTypes';
import { toast } from 'sonner@2.0.3';
import { X, FileText, DollarSign, Calendar, TrendingUp, MessageSquare } from 'lucide-react';

interface ProjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: ConstructionProject | null;
  onSubmit: (project: Partial<ConstructionProject>) => void;
}

export function ProjectFormDialog({ 
  open, 
  onOpenChange, 
  project, 
  onSubmit 
}: ProjectFormDialogProps) {
  const [formData, setFormData] = useState<Partial<ConstructionProject>>({});

  useEffect(() => {
    if (open) {
      if (project) {
        setFormData(project);
      } else {
        setFormData({
          fundingSource: 'General Appropriations Act (GAA)',
          status: 'Planning',
          category: 'gaa-funded',
          progressAccomplishment: 0,
          actualProgress: 0,
          targetProgress: 100,
          approvedBudget: 0,
          appropriation: 0,
          obligation: 0,
          disbursement: 0,
        });
      }
    }
  }, [project, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.projectTitle?.trim()) {
      toast.error('Project title is required');
      return;
    }

    if (!formData.dateStarted) {
      toast.error('Start date is required');
      return;
    }

    if (!formData.approvedBudget || formData.approvedBudget <= 0) {
      toast.error('Approved budget must be greater than 0');
      return;
    }

    if (formData.progressAccomplishment && (formData.progressAccomplishment < 0 || formData.progressAccomplishment > 100)) {
      toast.error('Progress accomplishment must be between 0 and 100');
      return;
    }

    onSubmit(formData);
    toast.success(project ? 'Project updated successfully' : 'Project added successfully');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[90vw] lg:max-w-[85vw] xl:max-w-[80vw] 2xl:max-w-[75vw] max-h-[95vh] bg-white border-0 shadow-2xl rounded-lg overflow-hidden [&>button]:hidden">
        {/* Enhanced Formal Header */}
        <DialogHeader className="bg-gradient-to-r from-emerald-900 via-green-900 to-teal-900 text-white -m-6 px-8 py-6 mb-0 relative">
          <Button
            onClick={() => onOpenChange(false)}
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 h-8 w-8 p-0 text-white hover:bg-white/10 hover:text-white rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
          <DialogTitle className="text-xl pr-12">
            {project ? 'Edit Project Information' : 'Add New Construction Project'}
          </DialogTitle>
          <DialogDescription className="text-sm text-emerald-100 mt-2">
            {project 
              ? 'Update the project details, financial information, and progress metrics below.' 
              : 'Enter comprehensive details for the new construction project including budget, timeline, and status information.'
            }
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto max-h-[calc(95vh-180px)]">
          <div className="p-8 space-y-6">
            {/* Basic Project Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <FileText className="w-5 h-5 text-emerald-600" />
                <h3 className="font-medium text-gray-900">Basic Project Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="projectTitle" className="text-sm text-gray-700">
                    Project Title *
                  </Label>
                  <Input
                    id="projectTitle"
                    value={formData.projectTitle || ''}
                    onChange={(e) => setFormData({ ...formData, projectTitle: e.target.value })}
                    required
                    className="border-gray-200"
                    placeholder="Enter the complete project title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateStarted" className="text-sm text-gray-700">
                    Date Started *
                  </Label>
                  <Input
                    id="dateStarted"
                    type="date"
                    value={formData.dateStarted || ''}
                    onChange={(e) => setFormData({ ...formData, dateStarted: e.target.value })}
                    required
                    className="border-gray-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetDateCompletion" className="text-sm text-gray-700">
                    Target Completion Date
                  </Label>
                  <Input
                    id="targetDateCompletion"
                    type="date"
                    value={formData.targetDateCompletion || ''}
                    onChange={(e) => setFormData({ ...formData, targetDateCompletion: e.target.value })}
                    className="border-gray-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projectDuration" className="text-sm text-gray-700">
                    Project Duration
                  </Label>
                  <Input
                    id="projectDuration"
                    value={formData.projectDuration || ''}
                    onChange={(e) => setFormData({ ...formData, projectDuration: e.target.value })}
                    placeholder="e.g., 18 months"
                    className="border-gray-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="originalContractDuration" className="text-sm text-gray-700">
                    Original Contract Duration
                  </Label>
                  <Input
                    id="originalContractDuration"
                    value={formData.originalContractDuration || ''}
                    onChange={(e) => setFormData({ ...formData, originalContractDuration: e.target.value })}
                    placeholder="e.g., 18 months"
                    className="border-gray-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fundingSource" className="text-sm text-gray-700">
                    Funding Source *
                  </Label>
                  <Select
                    value={formData.fundingSource || 'General Appropriations Act (GAA)'}
                    onValueChange={(value) => setFormData({ ...formData, fundingSource: value })}
                  >
                    <SelectTrigger className="border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General Appropriations Act (GAA)">GAA</SelectItem>
                      <SelectItem value="Locally Funded">Locally Funded</SelectItem>
                      <SelectItem value="Special Grants">Special Grants</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm text-gray-700">
                    Project Status *
                  </Label>
                  <Select
                    value={formData.status || 'Planning'}
                    onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                  >
                    <SelectTrigger className="border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Planning">Planning</SelectItem>
                      <SelectItem value="Ongoing">Ongoing</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Delayed">Delayed</SelectItem>
                      <SelectItem value="Suspended">Suspended</SelectItem>
                      <SelectItem value="On Hold">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm text-gray-700">
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Project location"
                    className="border-gray-200"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description" className="text-sm text-gray-700">
                    Project Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    placeholder="Brief project description"
                    className="border-gray-200 resize-none"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="projectDescription" className="text-sm text-gray-700">
                    Detailed Project Description
                  </Label>
                  <Textarea
                    id="projectDescription"
                    value={formData.projectDescription || ''}
                    onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
                    rows={3}
                    placeholder="Comprehensive project description including objectives and scope"
                    className="border-gray-200 resize-none"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="idealProposedImage" className="text-sm text-gray-700">
                    Image of Ideal/Proposed Infrastructure (URL)
                  </Label>
                  <Input
                    id="idealProposedImage"
                    value={formData.idealProposedImage || ''}
                    onChange={(e) => setFormData({ ...formData, idealProposedImage: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="border-gray-200"
                  />
                </div>
              </div>
            </div>

            {/* Financial Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <h3 className="font-medium text-gray-900">Financial Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="approvedBudget" className="text-sm text-gray-700">
                    Approved Budget (₱) *
                  </Label>
                  <Input
                    id="approvedBudget"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.approvedBudget || ''}
                    onChange={(e) => setFormData({ ...formData, approvedBudget: parseFloat(e.target.value) || 0 })}
                    required
                    className="border-gray-200 text-right"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="appropriation" className="text-sm text-gray-700">
                    Appropriation (₱) *
                  </Label>
                  <Input
                    id="appropriation"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.appropriation || ''}
                    onChange={(e) => setFormData({ ...formData, appropriation: parseFloat(e.target.value) || 0 })}
                    required
                    className="border-gray-200 text-right"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="obligation" className="text-sm text-gray-700">
                    Obligation (Contract Cost) (₱) *
                  </Label>
                  <Input
                    id="obligation"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.obligation || ''}
                    onChange={(e) => setFormData({ ...formData, obligation: parseFloat(e.target.value) || 0 })}
                    required
                    className="border-gray-200 text-right"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="disbursement" className="text-sm text-gray-700">
                    Disbursement (₱)
                  </Label>
                  <Input
                    id="disbursement"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.disbursement || ''}
                    onChange={(e) => setFormData({ ...formData, disbursement: parseFloat(e.target.value) || 0 })}
                    className="border-gray-200 text-right"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalLaborCost" className="text-sm text-gray-700">
                    Total Labor Cost (₱)
                  </Label>
                  <Input
                    id="totalLaborCost"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.totalLaborCost || ''}
                    onChange={(e) => setFormData({ ...formData, totalLaborCost: parseFloat(e.target.value) || 0 })}
                    className="border-gray-200 text-right"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalProjectCost" className="text-sm text-gray-700">
                    Total Project Cost (₱)
                  </Label>
                  <Input
                    id="totalProjectCost"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.totalProjectCost || ''}
                    onChange={(e) => setFormData({ ...formData, totalProjectCost: parseFloat(e.target.value) || 0 })}
                    className="border-gray-200 text-right"
                  />
                </div>
              </div>

              {/* Financial Summary */}
              {(formData.approvedBudget || formData.disbursement) && formData.approvedBudget > 0 && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mt-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Budget Utilization:</span>
                      <span className="text-emerald-700 font-medium">
                        {((formData.disbursement || 0) / formData.approvedBudget * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Remaining Budget:</span>
                      <span className="text-gray-900 font-medium">
                        ₱{((formData.approvedBudget || 0) - (formData.disbursement || 0)).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Contractor Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <Calendar className="w-5 h-5 text-emerald-600" />
                <h3 className="font-medium text-gray-900">Contractor Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contractor" className="text-sm text-gray-700">
                    Contractor
                  </Label>
                  <Input
                    id="contractor"
                    value={formData.contractor || ''}
                    onChange={(e) => setFormData({ ...formData, contractor: e.target.value })}
                    placeholder="Contractor company name"
                    className="border-gray-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contractorName" className="text-sm text-gray-700">
                    Contractor's Contact Person
                  </Label>
                  <Input
                    id="contractorName"
                    value={formData.contractorName || ''}
                    onChange={(e) => setFormData({ ...formData, contractorName: e.target.value })}
                    placeholder="Contact person name"
                    className="border-gray-200"
                  />
                </div>
              </div>
            </div>

            {/* Progress Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <h3 className="font-medium text-gray-900">Progress Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="progressAccomplishment" className="text-sm text-gray-700">
                    Progress Accomplishment (%)
                  </Label>
                  <Input
                    id="progressAccomplishment"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.progressAccomplishment || ''}
                    onChange={(e) => setFormData({ ...formData, progressAccomplishment: parseFloat(e.target.value) || 0 })}
                    className="border-gray-200 text-right"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="actualProgress" className="text-sm text-gray-700">
                    Actual Progress (%)
                  </Label>
                  <Input
                    id="actualProgress"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.actualProgress || ''}
                    onChange={(e) => setFormData({ ...formData, actualProgress: parseFloat(e.target.value) || 0 })}
                    className="border-gray-200 text-right"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetProgress" className="text-sm text-gray-700">
                    Target Progress (%)
                  </Label>
                  <Input
                    id="targetProgress"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.targetProgress || ''}
                    onChange={(e) => setFormData({ ...formData, targetProgress: parseFloat(e.target.value) || 0 })}
                    className="border-gray-200 text-right"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projectStatus" className="text-sm text-gray-700">
                    Current Project Status
                  </Label>
                  <Input
                    id="projectStatus"
                    value={formData.projectStatus || ''}
                    onChange={(e) => setFormData({ ...formData, projectStatus: e.target.value })}
                    placeholder="e.g., Foundation work in progress"
                    className="border-gray-200"
                  />
                </div>
              </div>

              {/* Progress Summary */}
              {(formData.actualProgress !== undefined || formData.targetProgress !== undefined) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Progress Variance:</span>
                      <span className={`font-medium ${
                        (formData.actualProgress || 0) >= (formData.targetProgress || 0) 
                          ? 'text-emerald-700' 
                          : 'text-amber-700'
                      }`}>
                        {((formData.actualProgress || 0) - (formData.targetProgress || 0)).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Status:</span>
                      <span className={`font-medium ${
                        (formData.actualProgress || 0) >= (formData.targetProgress || 0) 
                          ? 'text-emerald-700' 
                          : 'text-amber-700'
                      }`}>
                        {(formData.actualProgress || 0) >= (formData.targetProgress || 0) ? 'On Track' : 'Behind Schedule'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Accomplishment Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
                <h3 className="font-medium text-gray-900">Accomplishment Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="accomplishmentAsOf" className="text-sm text-gray-700">
                    Accomplishment as of
                  </Label>
                  <Input
                    id="accomplishmentAsOf"
                    value={formData.accomplishmentAsOf || ''}
                    onChange={(e) => setFormData({ ...formData, accomplishmentAsOf: e.target.value })}
                    placeholder="Brief description of current accomplishment"
                    className="border-gray-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accomplishmentDateEntry" className="text-sm text-gray-700">
                    Accomplishment Date Entry
                  </Label>
                  <Input
                    id="accomplishmentDateEntry"
                    type="date"
                    value={formData.accomplishmentDateEntry || ''}
                    onChange={(e) => setFormData({ ...formData, accomplishmentDateEntry: e.target.value })}
                    className="border-gray-200"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="accomplishmentComments" className="text-sm text-gray-700">
                    Accomplishment Comments
                  </Label>
                  <Textarea
                    id="accomplishmentComments"
                    value={formData.accomplishmentComments || ''}
                    onChange={(e) => setFormData({ ...formData, accomplishmentComments: e.target.value })}
                    rows={3}
                    placeholder="Detailed comments on project accomplishments"
                    className="border-gray-200 resize-none"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="accomplishmentRemarks" className="text-sm text-gray-700">
                    Accomplishment Remarks/Notes
                  </Label>
                  <Textarea
                    id="accomplishmentRemarks"
                    value={formData.accomplishmentRemarks || ''}
                    onChange={(e) => setFormData({ ...formData, accomplishmentRemarks: e.target.value })}
                    rows={2}
                    placeholder="Additional notes and observations"
                    className="border-gray-200 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Actual Status Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <FileText className="w-5 h-5 text-emerald-600" />
                <h3 className="font-medium text-gray-900">Actual Project Status</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="actualAccomplishmentAsOf" className="text-sm text-gray-700">
                    Actual Accomplishment as of
                  </Label>
                  <Input
                    id="actualAccomplishmentAsOf"
                    value={formData.actualAccomplishmentAsOf || ''}
                    onChange={(e) => setFormData({ ...formData, actualAccomplishmentAsOf: e.target.value })}
                    placeholder="Current actual progress description"
                    className="border-gray-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="actualDateEntry" className="text-sm text-gray-700">
                    Actual Date Entry
                  </Label>
                  <Input
                    id="actualDateEntry"
                    type="date"
                    value={formData.actualDateEntry || ''}
                    onChange={(e) => setFormData({ ...formData, actualDateEntry: e.target.value })}
                    className="border-gray-200"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="remarks" className="text-sm text-gray-700">
                    General Remarks
                  </Label>
                  <Textarea
                    id="remarks"
                    value={formData.remarks || ''}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    rows={3}
                    placeholder="General project remarks and notes"
                    className="border-gray-200 resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer with Actions */}
          <DialogFooter className="border-t border-gray-200 pt-4 px-8 pb-6 -mb-6 -mx-6 bg-gray-50">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="border-gray-300"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {project ? 'Update Project Information' : 'Add Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}