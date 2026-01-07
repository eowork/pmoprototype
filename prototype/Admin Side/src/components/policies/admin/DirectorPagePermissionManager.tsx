import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { Badge } from '../../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Checkbox } from '../../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../ui/alert-dialog';
import { Shield, Lock, Unlock, Trash2, Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { enhancedPoliciesRBACService, PagePermission } from '../services/EnhancedRBACService';

interface DirectorPagePermissionManagerProps {
  userEmail: string; // Admin email
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Available directors (mock data - replace with actual data source)
const AVAILABLE_DIRECTORS = [
  { email: 'director@carsu.edu.ph', name: 'Dr. Director Name', department: 'Office of the Director' },
  { email: 'director2@carsu.edu.ph', name: 'Dr. Another Director', department: 'Planning Office' }
];

export function DirectorPagePermissionManager({
  userEmail,
  open,
  onOpenChange
}: DirectorPagePermissionManagerProps) {
  const [pagePermissions, setPagePermissions] = useState<PagePermission[]>(
    enhancedPoliciesRBACService.getAllPagePermissions()
  );
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDirectorEmail, setSelectedDirectorEmail] = useState('');
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  const [removeDirectorEmail, setRemoveDirectorEmail] = useState<string | null>(null);

  const availablePages = enhancedPoliciesRBACService.getAvailablePages();

  // Group pages by category
  const pagesByCategory = availablePages.reduce((acc, page) => {
    if (!acc[page.category]) {
      acc[page.category] = [];
    }
    acc[page.category].push(page);
    return acc;
  }, {} as Record<string, typeof availablePages>);

  const handleAddPermission = () => {
    if (!selectedDirectorEmail) {
      toast.error('Please select a director');
      return;
    }

    if (selectedPages.length === 0) {
      toast.error('Please select at least one page');
      return;
    }

    const director = AVAILABLE_DIRECTORS.find(d => d.email === selectedDirectorEmail);
    if (!director) {
      toast.error('Director not found');
      return;
    }

    const success = enhancedPoliciesRBACService.assignPagePermissionsToDirector(
      selectedDirectorEmail,
      director.name,
      'Director',
      selectedPages,
      userEmail
    );

    if (success) {
      const updated = enhancedPoliciesRBACService.getAllPagePermissions();
      setPagePermissions(updated);
      setIsAddDialogOpen(false);
      setSelectedDirectorEmail('');
      setSelectedPages([]);
      toast.success(`Page permissions granted to ${director.name}`);
    } else {
      toast.error('Failed to assign page permissions');
    }
  };

  const handleRemovePermission = (directorEmail: string) => {
    setRemoveDirectorEmail(directorEmail);
  };

  const confirmRemovePermission = () => {
    if (!removeDirectorEmail) return;

    const permission = pagePermissions.find(p => p.userEmail === removeDirectorEmail);
    if (!permission) return;

    const success = enhancedPoliciesRBACService.removeUserPagePermissions(removeDirectorEmail);

    if (success) {
      const updated = enhancedPoliciesRBACService.getAllPagePermissions();
      setPagePermissions(updated);
      setRemoveDirectorEmail(null);
      toast.success(`Page permissions removed from ${permission.userName}`);
    } else {
      toast.error('Failed to remove page permissions');
    }
  };

  const togglePageSelection = (pageId: string) => {
    setSelectedPages(prev =>
      prev.includes(pageId)
        ? prev.filter(id => id !== pageId)
        : [...prev, pageId]
    );
  };

  const toggleCategorySelection = (category: string) => {
    const categoryPages = pagesByCategory[category].map(p => p.id);
    const allSelected = categoryPages.every(id => selectedPages.includes(id));

    if (allSelected) {
      setSelectedPages(prev => prev.filter(id => !categoryPages.includes(id)));
    } else {
      setSelectedPages(prev => [...new Set([...prev, ...categoryPages])]);
    }
  };

  const availableDirectors = AVAILABLE_DIRECTORS.filter(
    d => !pagePermissions.some(p => p.userEmail === d.email)
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Manage Director Page Permissions
            </DialogTitle>
            <DialogDescription>
              Grant Directors access to specific pages beyond their default policies access
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Director Access Rights</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Directors have <strong>full CRUD access</strong> to all policies data by default</li>
                    <li>They can <strong>only access policies pages</strong> unless granted additional permissions</li>
                    <li>Admin can grant Directors access to other system pages (e.g., Construction, GAD, etc.)</li>
                    <li>Directors maintain full CRUD on policies regardless of additional page access</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Add Permission Button */}
            <div className="flex justify-end">
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Grant Page Access
              </Button>
            </div>

            {/* Page Permissions Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Director Page Permissions ({pagePermissions.length})</CardTitle>
                <CardDescription>
                  Directors with additional page access beyond policies
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pagePermissions.length === 0 ? (
                  <div className="text-center py-12">
                    <Shield className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600">No custom page permissions configured</p>
                    <p className="text-sm text-slate-500 mt-1">All Directors have default policies-only access</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50">
                          <TableHead>Director Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Allowed Pages</TableHead>
                          <TableHead>Assigned Date</TableHead>
                          <TableHead>Assigned By</TableHead>
                          <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pagePermissions.map((permission) => (
                          <TableRow key={permission.userEmail}>
                            <TableCell className="font-medium">{permission.userName}</TableCell>
                            <TableCell className="text-sm text-slate-600">{permission.userEmail}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1 max-w-md">
                                {permission.allowedPages.length === 0 ? (
                                  <Badge variant="outline" className="text-xs">
                                    Policies Only
                                  </Badge>
                                ) : (
                                  permission.allowedPages.map((pageId) => {
                                    const page = availablePages.find(p => p.id === pageId);
                                    return (
                                      <Badge key={pageId} variant="outline" className="text-xs">
                                        {page?.label || pageId}
                                      </Badge>
                                    );
                                  })
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-slate-600">
                              {new Date(permission.assignedDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-sm text-slate-600">{permission.assignedBy}</TableCell>
                            <TableCell className="text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemovePermission(permission.userEmail)}
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
            </Card>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Permission Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Grant Director Page Access</DialogTitle>
            <DialogDescription>
              Select a Director and the pages they can access
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Director</Label>
              <Select value={selectedDirectorEmail} onValueChange={setSelectedDirectorEmail}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose director" />
                </SelectTrigger>
                <SelectContent>
                  {availableDirectors.length === 0 ? (
                    <div className="p-4 text-center text-sm text-slate-500">
                      All directors already have custom permissions
                    </div>
                  ) : (
                    availableDirectors.map((director) => (
                      <SelectItem key={director.email} value={director.email}>
                        <div className="flex items-center justify-between w-full">
                          <span>{director.name}</span>
                          <span className="text-xs text-slate-500 ml-2">({director.department})</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Select Accessible Pages</Label>
              <div className="border rounded-lg p-4 max-h-96 overflow-y-auto space-y-4">
                {Object.entries(pagesByCategory).map(([category, pages]) => {
                  const allSelected = pages.every(p => selectedPages.includes(p.id));
                  const someSelected = pages.some(p => selectedPages.includes(p.id));
                  
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center gap-2 pb-2 border-b">
                        <Checkbox
                          id={`category-${category}`}
                          checked={allSelected}
                          onCheckedChange={() => toggleCategorySelection(category)}
                          className={someSelected && !allSelected ? 'opacity-60' : ''}
                        />
                        <Label
                          htmlFor={`category-${category}`}
                          className="font-medium text-slate-700 cursor-pointer"
                        >
                          {category} ({pages.length})
                        </Label>
                      </div>
                      <div className="pl-6 space-y-2">
                        {pages.map((page) => (
                          <div key={page.id} className="flex items-center gap-2">
                            <Checkbox
                              id={page.id}
                              checked={selectedPages.includes(page.id)}
                              onCheckedChange={() => togglePageSelection(page.id)}
                            />
                            <Label
                              htmlFor={page.id}
                              className="text-sm text-slate-600 cursor-pointer"
                            >
                              {page.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-slate-500">
                Selected: {selectedPages.length} page{selectedPages.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-green-800">
                  Director will have <strong>full CRUD access</strong> to policies and <strong>view access</strong> to selected pages. 
                  They cannot modify data on non-policies pages unless their department permissions allow it.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddPermission}
              disabled={!selectedDirectorEmail || selectedPages.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Unlock className="w-4 h-4 mr-2" />
              Grant Access
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={removeDirectorEmail !== null} onOpenChange={(open) => !open && setRemoveDirectorEmail(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Page Permissions</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove custom page permissions for this Director? 
              They will revert to default policies-only access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemovePermission}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove Permissions
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
