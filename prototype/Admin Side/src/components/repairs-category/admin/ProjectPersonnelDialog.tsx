import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Checkbox } from '../../ui/checkbox';
import { ScrollArea } from '../../ui/scroll-area';
import { Alert, AlertDescription } from '../../ui/alert';
import { UserPlus, Trash2, Shield, Eye, Edit2, Upload, CheckCircle, Users, ShieldCheck, Info, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { enhancedRepairsRBACService, ProjectAssignment } from '../services/EnhancedRBACService';

interface ProjectPersonnelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: {
    id: string;
    projectTitle?: string;
    title?: string;
  };
  userRole: string;
  userEmail: string;
  onUpdate?: () => void;
}

// Mock staff data - In production, this would come from User Management
const AVAILABLE_STAFF = [
  { email: 'john.doe@carsu.edu.ph', name: 'John Doe', department: 'Facilities', role: 'Staff' },
  { email: 'jane.smith@carsu.edu.ph', name: 'Jane Smith', department: 'Maintenance', role: 'Staff' },
  { email: 'pedro.reyes@carsu.edu.ph', name: 'Pedro Reyes', department: 'Property Management', role: 'Editor' },
  { email: 'ana.garcia@carsu.edu.ph', name: 'Ana Garcia', department: 'Planning', role: 'Staff' },
  { email: 'maria.santos@carsu.edu.ph', name: 'Maria Santos', department: 'Monitoring & Evaluation', role: 'Editor' },
  { email: 'rafael.santos@carsu.edu.ph', name: 'Rafael Santos', department: 'Facilities Management', role: 'Staff' },
];

export function ProjectPersonnelDialog({
  open,
  onOpenChange,
  project,
  userRole,
  userEmail,
  onUpdate
}: ProjectPersonnelDialogProps) {
  const [selectedStaff, setSelectedStaff] = useState('');
  const [permissions, setPermissions] = useState({
    canEdit: true,
    canDelete: false,
    canViewDocuments: true,
    canUploadDocuments: true
  });

  // Add null check for project
  if (!project) {
    return null;
  }

  const canManage = userRole === 'Admin' || userRole === 'Editor';
  const projectTitle = project.projectTitle || project.title || 'Unknown Project';
  const assignedPersonnel = enhancedRepairsRBACService.getProjectStaff(project.id);
  
  // Filter out already assigned staff
  const availableStaff = AVAILABLE_STAFF.filter(
    staff => !assignedPersonnel.some(a => a.staffEmail === staff.email)
  );

  const handleAssignPersonnel = () => {
    if (!selectedStaff) {
      toast.error('Please select a staff member');
      return;
    }

    const staff = AVAILABLE_STAFF.find(s => s.email === selectedStaff);
    if (!staff) return;

    const success = enhancedRepairsRBACService.assignStaffToProject(
      project.id,
      projectTitle,
      staff.email,
      staff.name,
      userEmail,
      permissions
    );

    if (success) {
      toast.success(`${staff.name} assigned to ${projectTitle}`);
      setSelectedStaff('');
      setPermissions({
        canEdit: true,
        canDelete: false,
        canViewDocuments: true,
        canUploadDocuments: true
      });
      onUpdate?.();
    }
  };

  const handleRemovePersonnel = (staffEmail: string) => {
    const staff = assignedPersonnel.find(a => a.staffEmail === staffEmail);
    if (!staff) return;

    enhancedRepairsRBACService.removeStaffFromProject(project.id, staffEmail);
    toast.success(`${staff.staffName} removed from project`);
    onUpdate?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[90vw] lg:max-w-[85vw] xl:max-w-[80vw] 2xl:max-w-[75vw] max-h-[95vh] bg-white border-0 shadow-2xl rounded-lg overflow-hidden [&>button]:hidden">
        {/* Enhanced Formal Header with Close Button - Amber/Orange theme for Repairs */}
        <DialogHeader className="bg-gradient-to-r from-amber-900 via-orange-900 to-amber-800 text-white -m-6 px-8 py-6 mb-0 relative">
          <Button
            onClick={() => onOpenChange(false)}
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 h-8 w-8 p-0 text-white hover:bg-white/10 hover:text-white rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
          <DialogTitle className="flex items-center gap-4 text-xl pr-12">
            <div className="p-3 bg-white/10 rounded-xl shadow-lg">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <span className="block">Project Personnel Management</span>
              <p className="text-sm font-normal text-amber-100 mt-2 leading-relaxed">
                Manage access control for {projectTitle}
              </p>
            </div>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Manage personnel assignments and access permissions for {projectTitle}. Assign staff members, configure their access rights, and control project visibility.
          </DialogDescription>
        </DialogHeader>

        {/* Responsive Content Area with Smart Scrolling */}
        <div className="flex-1 overflow-y-auto max-h-[calc(95vh-180px)]">
          <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Assigned Personnel List */}
            <div className="space-y-4">
              {/* Access Control Notice */}
              <Alert className="border-amber-200 bg-amber-50">
                <Info className="w-4 h-4 text-amber-600" />
                <AlertDescription className="text-sm text-gray-700">
                  <strong>Access Control:</strong> Only assigned personnel can access this project.
                </AlertDescription>
              </Alert>

              {/* Assigned Personnel List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-600" />
                    <h4 className="text-gray-900">
                      Assigned Personnel
                    </h4>
                    <Badge variant="outline" className="ml-1">
                      {assignedPersonnel.length}
                    </Badge>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg bg-white">
                  <ScrollArea className="h-[400px]">
                {assignedPersonnel.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="p-3 bg-gray-50 rounded-full mb-3">
                      <Shield className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-sm text-gray-600">No personnel assigned yet</p>
                    <p className="text-xs text-gray-500 mt-1 max-w-xs">
                      Use the form below to assign personnel and grant them access to this project
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {assignedPersonnel.map((assignment, index) => (
                      <div
                        key={assignment.staffEmail}
                        className={`p-4 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <p className="text-sm text-gray-900 truncate">
                                {assignment.staffName}
                              </p>
                              <Badge variant="outline" className="text-xs text-gray-600">
                                {assignment.staffEmail.split('@')[0]}
                              </Badge>
                            </div>
                            
                            {/* Permission badges */}
                            <div className="flex flex-wrap gap-1.5">
                              {assignment.permissions.canEdit && (
                                <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-xs">
                                  <Edit2 className="w-3 h-3 mr-1" />
                                  Edit
                                </Badge>
                              )}
                              {assignment.permissions.canViewDocuments && (
                                <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                                  <Eye className="w-3 h-3 mr-1" />
                                  View
                                </Badge>
                              )}
                              {assignment.permissions.canUploadDocuments && (
                                <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                                  <Upload className="w-3 h-3 mr-1" />
                                  Upload
                                </Badge>
                              )}
                              {assignment.permissions.canDelete && (
                                <Badge className="bg-red-50 text-red-700 border-red-200 text-xs">
                                  <Trash2 className="w-3 h-3 mr-1" />
                                  Delete
                                </Badge>
                              )}
                            </div>
                          </div>

                          {canManage && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemovePersonnel(assignment.staffEmail)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                              title="Remove personnel"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                  </ScrollArea>
                </div>
              </div>
            </div>

            {/* Right Column - Add Personnel Section */}
            {canManage && (
              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-amber-50 rounded border border-amber-100">
                      <UserPlus className="w-3.5 h-3.5 text-amber-600" />
                    </div>
                    <h4 className="text-gray-900">
                      Add Personnel
                    </h4>
                  </div>
                </div>

                {availableStaff.length === 0 ? (
                  <Alert className="border-amber-200 bg-amber-50">
                    <CheckCircle className="w-4 h-4 text-amber-600" />
                    <AlertDescription className="text-sm text-gray-700">
                      All available staff members have been assigned to this project.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    {/* Available Staff List - For RBAC Verification */}
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-700">Available Staff Members</Label>
                      <Alert className="border-blue-200 bg-blue-50">
                        <Info className="w-4 h-4 text-blue-600" />
                        <AlertDescription className="text-sm text-gray-700">
                          <strong>{availableStaff.length} staff member{availableStaff.length !== 1 ? 's' : ''} available</strong> for assignment. 
                          Select from the dropdown below to assign personnel to this project.
                        </AlertDescription>
                      </Alert>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm text-gray-700">Select Personnel to Assign</Label>
                      <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                        <SelectTrigger className="border-gray-200">
                          <SelectValue placeholder="Choose a staff member..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availableStaff.map((staff) => (
                            <SelectItem key={staff.email} value={staff.email}>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-900">{staff.name}</span>
                                <Badge variant="outline" className="text-xs text-gray-600">
                                  {staff.department}
                                </Badge>
                                <Badge variant="outline" className="text-xs text-amber-700 bg-amber-50">
                                  {staff.role}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      {/* Staff List for Verification */}
                      <div className="border border-gray-200 rounded-lg bg-gray-50 p-3 max-h-32 overflow-y-auto">
                        <p className="text-xs text-gray-600 mb-2">Personnel pool verification:</p>
                        <div className="space-y-1">
                          {AVAILABLE_STAFF.map((staff) => {
                            const isAssigned = assignedPersonnel.some(a => a.staffEmail === staff.email);
                            return (
                              <div key={staff.email} className="flex items-center justify-between text-xs py-1">
                                <span className={isAssigned ? 'text-gray-400 line-through' : 'text-gray-700'}>
                                  {staff.name} ({staff.email})
                                </span>
                                {isAssigned ? (
                                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                    Assigned
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                    Available
                                  </Badge>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Permissions */}
                    <div className="space-y-3 border border-gray-200 rounded-lg bg-gray-50 p-4">
                      <Label className="text-sm text-gray-900">Access Permissions</Label>
                      
                      <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-start gap-3 p-2.5 bg-white rounded border border-gray-200">
                          <Checkbox
                            id="canEdit"
                            checked={permissions.canEdit}
                            onCheckedChange={(checked) =>
                              setPermissions({ ...permissions, canEdit: checked as boolean })
                            }
                            className="mt-0.5"
                          />
                          <div className="flex-1">
                            <label htmlFor="canEdit" className="text-sm text-gray-900 cursor-pointer flex items-center gap-1.5">
                              <Edit2 className="w-3.5 h-3.5 text-amber-600" />
                              Edit Project
                            </label>
                            <p className="text-xs text-gray-500 mt-0.5">Modify project details</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-2.5 bg-white rounded border border-gray-200">
                          <Checkbox
                            id="canViewDocuments"
                            checked={permissions.canViewDocuments}
                            onCheckedChange={(checked) =>
                              setPermissions({ ...permissions, canViewDocuments: checked as boolean })
                            }
                            className="mt-0.5"
                          />
                          <div className="flex-1">
                            <label htmlFor="canViewDocuments" className="text-sm text-gray-900 cursor-pointer flex items-center gap-1.5">
                              <Eye className="w-3.5 h-3.5 text-blue-600" />
                              View Documents
                            </label>
                            <p className="text-xs text-gray-500 mt-0.5">Access project files</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-2.5 bg-white rounded border border-gray-200">
                          <Checkbox
                            id="canUploadDocuments"
                            checked={permissions.canUploadDocuments}
                            onCheckedChange={(checked) =>
                              setPermissions({ ...permissions, canUploadDocuments: checked as boolean })
                            }
                            className="mt-0.5"
                          />
                          <div className="flex-1">
                            <label htmlFor="canUploadDocuments" className="text-sm text-gray-900 cursor-pointer flex items-center gap-1.5">
                              <Upload className="w-3.5 h-3.5 text-purple-600" />
                              Upload Files
                            </label>
                            <p className="text-xs text-gray-500 mt-0.5">Add project documents</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-2.5 bg-white rounded border border-gray-200">
                          <Checkbox
                            id="canDelete"
                            checked={permissions.canDelete}
                            onCheckedChange={(checked) =>
                              setPermissions({ ...permissions, canDelete: checked as boolean })
                            }
                            className="mt-0.5"
                          />
                          <div className="flex-1">
                            <label htmlFor="canDelete" className="text-sm text-gray-900 cursor-pointer flex items-center gap-1.5">
                              <Trash2 className="w-3.5 h-3.5 text-red-600" />
                              Delete Project
                            </label>
                            <p className="text-xs text-gray-500 mt-0.5">Remove project data</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={handleAssignPersonnel}
                      disabled={!selectedStaff}
                      className="w-full bg-amber-600 hover:bg-amber-700"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Assign Personnel to Project
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        </div>

        <DialogFooter className="border-t border-gray-200 pt-4 px-8 -mb-6 -mx-6 bg-gray-50">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-gray-300">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}