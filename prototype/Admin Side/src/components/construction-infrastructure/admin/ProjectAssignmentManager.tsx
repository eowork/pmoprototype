import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Checkbox } from '../../ui/checkbox';
import { Shield, UserPlus, Trash2, Edit, AlertCircle, Users } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { constructionInfrastructureRBACService, ProjectAssignment } from '../services/RBACService';

interface ProjectAssignmentManagerProps {
  projectId: string;
  projectTitle: string;
  userRole: string;
  userEmail: string;
  onUpdate?: () => void;
}

const MOCK_STAFF = [
  { email: 'staff1@carsu.edu.ph', name: 'Juan Dela Cruz', department: 'Engineering' },
  { email: 'staff2@carsu.edu.ph', name: 'Maria Santos', department: 'Infrastructure' },
  { email: 'staff3@carsu.edu.ph', name: 'Pedro Reyes', department: 'Project Management' },
  { email: 'staff4@carsu.edu.ph', name: 'Ana Garcia', department: 'Planning' },
];

export function ProjectAssignmentManager({
  projectId,
  projectTitle,
  userRole,
  userEmail,
  onUpdate
}: ProjectAssignmentManagerProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [permissions, setPermissions] = useState({
    canEdit: true,
    canDelete: false,
    canViewDocuments: true,
    canUploadDocuments: true
  });

  const [assignments, setAssignments] = useState<ProjectAssignment[]>(
    constructionInfrastructureRBACService.getProjectStaff(projectId)
  );

  const canManageAssignments = userRole === 'Admin';

  const handleAssignStaff = () => {
    if (!selectedStaff) {
      toast.error('Please select a staff member');
      return;
    }

    const staff = MOCK_STAFF.find(s => s.email === selectedStaff);
    if (!staff) return;

    const success = constructionInfrastructureRBACService.assignStaffToProject(
      projectId,
      projectTitle,
      staff.email,
      staff.name,
      userEmail,
      permissions
    );

    if (success) {
      setAssignments(constructionInfrastructureRBACService.getProjectStaff(projectId));
      setIsAddDialogOpen(false);
      setSelectedStaff('');
      setPermissions({
        canEdit: true,
        canDelete: false,
        canViewDocuments: true,
        canUploadDocuments: true
      });
      toast.success(`${staff.name} assigned to project successfully`);
      onUpdate?.();
    }
  };

  const handleRemoveStaff = (staffEmail: string) => {
    const staff = assignments.find(a => a.staffEmail === staffEmail);
    if (!staff) return;

    constructionInfrastructureRBACService.removeStaffFromProject(projectId, staffEmail);
    setAssignments(constructionInfrastructureRBACService.getProjectStaff(projectId));
    toast.success(`${staff.staffName} removed from project`);
    onUpdate?.();
  };

  const getAlreadyAssignedEmails = () => {
    return assignments.map(a => a.staffEmail);
  };

  const availableStaff = MOCK_STAFF.filter(
    s => !getAlreadyAssignedEmails().includes(s.email)
  );

  if (!canManageAssignments) {
    return (
      <Card className="admin-card border-0">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-blue-100 rounded-lg">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-base text-gray-900 mb-2">Access Control Information</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Only administrators can manage staff assignments for projects.
                Contact your administrator for access permissions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="admin-card border-0">
      <CardHeader className="border-b border-gray-200 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-gray-900 text-lg">Project Staff Assignments</CardTitle>
              <CardDescription className="text-sm mt-1">
                Manage staff access and permissions for this project
              </CardDescription>
            </div>
          </div>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Assign Staff
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {assignments.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-sm text-gray-600 mb-4">No staff assigned to this project</p>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              variant="outline"
              className="border-gray-200"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Assign First Staff Member
            </Button>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Staff Member</TableHead>
                  <TableHead>Assigned Date</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((assignment) => (
                  <TableRow key={assignment.staffEmail} className="hover:bg-gray-50">
                    <TableCell>
                      <div>
                        <div className="text-sm text-gray-900">{assignment.staffName}</div>
                        <div className="text-xs text-gray-500">{assignment.staffEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600">
                        {new Date(assignment.assignedDate).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {assignment.permissions.canEdit && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                            Edit
                          </Badge>
                        )}
                        {assignment.permissions.canDelete && (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                            Delete
                          </Badge>
                        )}
                        {assignment.permissions.canUploadDocuments && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                            Upload
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveStaff(assignment.staffEmail)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Assign Staff Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Assign Staff to Project</DialogTitle>
            <DialogDescription>
              Select a staff member and configure their permissions for this project
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="staff">Staff Member</Label>
              <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                <SelectTrigger>
                  <SelectValue placeholder="Select staff member..." />
                </SelectTrigger>
                <SelectContent>
                  {availableStaff.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      All staff members are already assigned
                    </div>
                  ) : (
                    availableStaff.map((staff) => (
                      <SelectItem key={staff.email} value={staff.email}>
                        <div className="flex flex-col">
                          <span>{staff.name}</span>
                          <span className="text-xs text-gray-500">{staff.department}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3 border border-gray-200 rounded-lg p-4 bg-gray-50">
              <Label className="text-base">Project Permissions</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="canEdit"
                    checked={permissions.canEdit}
                    onCheckedChange={(checked) =>
                      setPermissions({ ...permissions, canEdit: !!checked })
                    }
                  />
                  <label htmlFor="canEdit" className="text-sm text-gray-700 cursor-pointer">
                    Can edit project data and progress
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="canDelete"
                    checked={permissions.canDelete}
                    onCheckedChange={(checked) =>
                      setPermissions({ ...permissions, canDelete: !!checked })
                    }
                  />
                  <label htmlFor="canDelete" className="text-sm text-gray-700 cursor-pointer">
                    Can delete project records
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="canViewDocuments"
                    checked={permissions.canViewDocuments}
                    onCheckedChange={(checked) =>
                      setPermissions({ ...permissions, canViewDocuments: !!checked })
                    }
                  />
                  <label htmlFor="canViewDocuments" className="text-sm text-gray-700 cursor-pointer">
                    Can view project documents
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="canUploadDocuments"
                    checked={permissions.canUploadDocuments}
                    onCheckedChange={(checked) =>
                      setPermissions({ ...permissions, canUploadDocuments: !!checked })
                    }
                  />
                  <label htmlFor="canUploadDocuments" className="text-sm text-gray-700 cursor-pointer">
                    Can upload and manage documents
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-amber-800">
                    <strong>Note:</strong> Assigned staff will only be able to access and modify this specific project
                    based on the permissions granted. Admins always have full access to all projects.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAssignStaff}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!selectedStaff}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Assign Staff
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
