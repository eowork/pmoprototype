import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Badge } from '../../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Switch } from '../../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../ui/alert-dialog';
import { Users, UserPlus, Trash2, Bell, BellOff, Eye, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { enhancedPoliciesRBACService, DocumentAssignment } from '../services/EnhancedRBACService';

interface PersonnelAssignmentManagerProps {
  documentId: string;
  documentTitle: string;
  documentType: 'MOA' | 'MOU' | 'Policy';
  userEmail: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Available personnel for assignment (mock data - replace with actual data source)
const AVAILABLE_PERSONNEL = [
  { email: 'staff1@carsu.edu.ph', name: 'Juan Dela Cruz', department: 'Planning Office' },
  { email: 'staff2@carsu.edu.ph', name: 'Maria Santos', department: 'Research Office' },
  { email: 'staff3@carsu.edu.ph', name: 'Pedro Reyes', department: 'Legal Office' },
  { email: 'staff4@carsu.edu.ph', name: 'Ana Garcia', department: 'Extension Office' },
  { email: 'staff5@carsu.edu.ph', name: 'Roberto Tan', department: 'Academic Affairs' }
];

export function PersonnelAssignmentManager({
  documentId,
  documentTitle,
  documentType,
  userEmail,
  open,
  onOpenChange
}: PersonnelAssignmentManagerProps) {
  const [assignedPersonnel, setAssignedPersonnel] = useState<DocumentAssignment[]>(
    enhancedPoliciesRBACService.getDocumentPersonnel(documentId)
  );
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedPersonnelEmail, setSelectedPersonnelEmail] = useState('');
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [removePersonnelEmail, setRemovePersonnelEmail] = useState<string | null>(null);

  const handleAddPersonnel = () => {
    if (!selectedPersonnelEmail) {
      toast.error('Please select personnel to assign');
      return;
    }

    const personnel = AVAILABLE_PERSONNEL.find(p => p.email === selectedPersonnelEmail);
    if (!personnel) {
      toast.error('Personnel not found');
      return;
    }

    // Check if already assigned
    if (assignedPersonnel.some(a => a.personnelEmail === selectedPersonnelEmail)) {
      toast.error('Personnel already assigned to this document');
      return;
    }

    // Assign personnel
    const success = enhancedPoliciesRBACService.assignPersonnelToDocument(
      documentId,
      documentTitle,
      documentType,
      selectedPersonnelEmail,
      personnel.name,
      userEmail,
      notificationEnabled
    );

    if (success) {
      const updated = enhancedPoliciesRBACService.getDocumentPersonnel(documentId);
      setAssignedPersonnel(updated);
      setIsAddDialogOpen(false);
      setSelectedPersonnelEmail('');
      setNotificationEnabled(true);
      toast.success(`${personnel.name} has been assigned to this ${documentType}`, {
        description: 'Personnel can now view this document'
      });
    } else {
      toast.error('Failed to assign personnel');
    }
  };

  const handleRemovePersonnel = (personnelEmail: string) => {
    setRemovePersonnelEmail(personnelEmail);
  };

  const confirmRemovePersonnel = () => {
    if (!removePersonnelEmail) return;

    const personnel = assignedPersonnel.find(a => a.personnelEmail === removePersonnelEmail);
    if (!personnel) return;

    const success = enhancedPoliciesRBACService.removePersonnelFromDocument(documentId, removePersonnelEmail);

    if (success) {
      const updated = enhancedPoliciesRBACService.getDocumentPersonnel(documentId);
      setAssignedPersonnel(updated);
      setRemovePersonnelEmail(null);
      toast.success(`${personnel.personnelName} has been removed from this ${documentType}`);
    } else {
      toast.error('Failed to remove personnel');
    }
  };

  const availablePersonnelForAssignment = AVAILABLE_PERSONNEL.filter(
    p => !assignedPersonnel.some(a => a.personnelEmail === p.email)
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-gray-900">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <Users className="w-5 h-5 text-emerald-600" />
              </div>
              Manage Assigned Personnel
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Assign personnel who will be notified and have view access to this {documentType}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Document Info - More Prominent */}
            <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-emerald-700 mb-1">Document Reference</p>
                    <p className="font-medium text-gray-900">{documentTitle}</p>
                  </div>
                  <Badge className="bg-emerald-600 text-white border-emerald-700">
                    {documentType}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Clearer Info Box */}
            <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-2">Personnel Access Permissions</p>
                  <ul className="space-y-1.5">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Can <strong>view</strong> document and all attachments</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Receives <strong>notifications</strong> for updates (if enabled)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Cannot</strong> edit or delete this document</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Add Personnel Button */}
            <div className="flex justify-end">
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Assign New Personnel
              </Button>
            </div>

            {/* Assigned Personnel Section - Enhanced Visual Clarity */}
            <Card className="border-gray-200">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                      Currently Assigned Personnel
                      <Badge variant="outline" className="ml-2 bg-emerald-100 text-emerald-700 border-emerald-300">
                        {assignedPersonnel.length} {assignedPersonnel.length === 1 ? 'Person' : 'People'}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-gray-600 mt-1">
                      Personnel with active view access to this document
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {assignedPersonnel.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                      <Users className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-700 font-medium">No Personnel Assigned</p>
                    <p className="text-sm text-gray-500 mt-2">Click "Assign New Personnel" to add team members</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 hover:bg-gray-50">
                          <TableHead className="font-semibold text-gray-700">Personnel Name</TableHead>
                          <TableHead className="font-semibold text-gray-700">Email Address</TableHead>
                          <TableHead className="font-semibold text-gray-700">Assigned Date</TableHead>
                          <TableHead className="font-semibold text-gray-700">Assigned By</TableHead>
                          <TableHead className="font-semibold text-gray-700">Notifications</TableHead>
                          <TableHead className="text-center font-semibold text-gray-700">Access Level</TableHead>
                          <TableHead className="text-center font-semibold text-gray-700">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {assignedPersonnel.map((assignment) => (
                          <TableRow key={assignment.personnelEmail} className="hover:bg-emerald-50/30 transition-colors">
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                  <span className="text-sm font-medium text-emerald-700">
                                    {assignment.personnelName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                  </span>
                                </div>
                                <span className="font-medium text-gray-900">{assignment.personnelName}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">{assignment.personnelEmail}</TableCell>
                            <TableCell className="text-sm text-gray-600">
                              {new Date(assignment.assignedDate).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">{assignment.assignedBy}</TableCell>
                            <TableCell>
                              {assignment.notificationEnabled ? (
                                <Badge className="bg-green-100 text-green-700 border-green-300 gap-1">
                                  <Bell className="w-3 h-3" />
                                  Enabled
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-gray-500 border-gray-300 gap-1">
                                  <BellOff className="w-3 h-3" />
                                  Disabled
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-center">
                                <Badge className="bg-blue-100 text-blue-700 border-blue-300 gap-1">
                                  <Eye className="w-3 h-3" />
                                  View Only
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemovePersonnel(assignment.personnelEmail)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Remove
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="border-gray-300">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Personnel Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-900">
              <UserPlus className="w-5 h-5 text-emerald-600" />
              Assign Personnel to {documentType}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Select personnel to grant view access to this document
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Select Personnel <span className="text-red-500">*</span></Label>
              <Select value={selectedPersonnelEmail} onValueChange={setSelectedPersonnelEmail}>
                <SelectTrigger className="border-gray-200">
                  <SelectValue placeholder="Choose personnel to assign" />
                </SelectTrigger>
                <SelectContent>
                  {availablePersonnelForAssignment.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      All available personnel are already assigned
                    </div>
                  ) : (
                    availablePersonnelForAssignment.map((personnel) => (
                      <SelectItem key={personnel.email} value={personnel.email}>
                        <div className="flex flex-col">
                          <span className="font-medium">{personnel.name}</span>
                          <span className="text-xs text-gray-500">{personnel.department} • {personnel.email}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-emerald-600" />
                <div>
                  <Label htmlFor="notifications" className="cursor-pointer font-medium text-gray-700">
                    Enable Notifications
                  </Label>
                  <p className="text-xs text-gray-500 mt-0.5">Send updates to assigned personnel</p>
                </div>
              </div>
              <Switch
                id="notifications"
                checked={notificationEnabled}
                onCheckedChange={setNotificationEnabled}
              />
            </div>

            <div className="bg-emerald-50 border-l-4 border-emerald-500 rounded-r-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-emerald-900">
                  <p className="font-medium mb-1">Access Summary</p>
                  <p className="text-xs">
                    Personnel will have <strong>view-only</strong> access to this document and its attachments. 
                    They will be notified of important updates if notifications are enabled.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="border-gray-300">
              Cancel
            </Button>
            <Button 
              onClick={handleAddPersonnel}
              disabled={!selectedPersonnelEmail}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Assign Personnel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={removePersonnelEmail !== null} onOpenChange={(open) => !open && setRemovePersonnelEmail(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-gray-900">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Remove Personnel Assignment
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Are you sure you want to remove this personnel from the document? 
              They will no longer have access to view this {documentType} and its attachments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-300">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemovePersonnel}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove Personnel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}