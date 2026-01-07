import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Alert, AlertDescription } from '../ui/alert';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Lock, Shield, Info } from 'lucide-react';
import { enhancedRBACService } from '../construction-infrastructure/services/EnhancedRBACService';
import { toast } from 'sonner@2.0.3';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Staff' | 'Client';
  department: string;
}

interface PagePermissionDialogProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  adminEmail: string;
}

// Available pages grouped by main categories
const PAGE_CATEGORIES = {
  'Construction Infrastructure': {
    pages: [
      { id: 'construction-of-infrastructure', label: 'Construction Overview' },
      { id: 'gaa-funded-projects', label: 'GAA-Funded Projects' },
      { id: 'locally-funded-projects', label: 'Locally-Funded Projects' },
      { id: 'special-grants-projects', label: 'Special Grants Projects' },
    ]
  },
  'University Operations': {
    pages: [
      { id: 'university-operations', label: 'University Operations Overview' },
      { id: 'higher-education-program', label: 'Higher Education Program' },
      { id: 'advanced-education-program', label: 'Advanced Education Program' },
      { id: 'research-program', label: 'Research Program' },
      { id: 'technical-advisory-extension-program', label: 'Technical Advisory & Extension' },
    ]
  },
  'Classroom & Administrative Offices': {
    pages: [
      { id: 'classroom-administrative-offices', label: 'Classroom & Admin Overview' },
      { id: 'classroom-csu-main-cc', label: 'Classroom Assessment' },
      { id: 'admin-office-csu-main-cc', label: 'Admin Office Assessment' },
      { id: 'prioritization-matrix', label: 'Prioritization Matrix' },
    ]
  },
  'GAD Parity Report': {
    pages: [
      { id: 'gad-parity-report', label: 'GAD Parity Overview' },
      { id: 'gender-parity-report', label: 'Gender Parity Report' },
      { id: 'gpb-accomplishment', label: 'GPB Accomplishments' },
      { id: 'gad-budget-and-plans', label: 'GAD Budget & Plans' },
    ]
  },
  'Repairs': {
    pages: [
      { id: 'repairs', label: 'Repairs Overview' },
      { id: 'classrooms-csu-cc-bxu', label: 'Classrooms (CSU/CC/BXU)' },
      { id: 'administrative-offices-csu-cc-bxu', label: 'Administrative Offices' },
    ]
  },
  'Knowledge Management': {
    pages: [
      { id: 'policies', label: 'Policies Overview' },
      { id: 'memorandum-of-agreements', label: 'Memorandum of Agreements' },
      { id: 'memorandum-of-understanding', label: 'Memorandum of Understanding' },
      { id: 'forms', label: 'Forms Overview' },
      { id: 'forms-inventory', label: 'Forms Inventory' },
    ]
  }
};

export function PagePermissionDialog({ user, isOpen, onClose, onSave, adminEmail }: PagePermissionDialogProps) {
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      // Load existing permissions
      const existing = enhancedRBACService.getUserPagePermissions(user.email);
      if (existing) {
        setSelectedPages(existing.allowedPages);
      } else {
        // Default to department-based pages
        const deptPages = enhancedRBACService.getAllowedPagesByDepartment(user.department);
        setSelectedPages(deptPages);
      }
    }
  }, [user, isOpen]);

  const handleTogglePage = (pageId: string) => {
    setSelectedPages(prev => 
      prev.includes(pageId) 
        ? prev.filter(id => id !== pageId)
        : [...prev, pageId]
    );
  };

  const handleToggleCategory = (category: string) => {
    const categoryPages = PAGE_CATEGORIES[category as keyof typeof PAGE_CATEGORIES].pages.map(p => p.id);
    const allSelected = categoryPages.every(pageId => selectedPages.includes(pageId));
    
    if (allSelected) {
      // Deselect all pages in category
      setSelectedPages(prev => prev.filter(id => !categoryPages.includes(id)));
    } else {
      // Select all pages in category
      setSelectedPages(prev => [...new Set([...prev, ...categoryPages])]);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const success = enhancedRBACService.assignPagePermissionsToUser(
        user.email,
        user.name,
        user.department,
        user.role,
        selectedPages,
        adminEmail
      );

      if (success) {
        toast.success(`Page permissions updated for ${user.name}`);
        onSave();
        onClose();
      } else {
        toast.error('Failed to update page permissions');
      }
    } catch (error) {
      console.error('Error saving page permissions:', error);
      toast.error('An error occurred while saving permissions');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    const allPages = Object.values(PAGE_CATEGORIES).flatMap(cat => cat.pages.map(p => p.id));
    setSelectedPages(allPages);
  };

  const handleClearAll = () => {
    setSelectedPages([]);
  };

  if (!user) return null;

  const departmentPages = enhancedRBACService.getAllowedPagesByDepartment(user.department);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-600" />
            Assign Page Access Permissions
          </DialogTitle>
          <DialogDescription>
            Configure which pages <strong>{user.name}</strong> can access. By default, users have access based on their department.
          </DialogDescription>
        </DialogHeader>

        {/* User Info */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p><strong>User:</strong> {user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <Badge variant={user.role === 'Admin' ? 'default' : 'secondary'}>
              {user.role}
            </Badge>
          </div>
          <div>
            <p><strong>Department:</strong> {user.department}</p>
            {departmentPages.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Default access: {departmentPages.length} pages
              </p>
            )}
          </div>
        </div>

        {/* Admin Notice */}
        {user.role === 'Admin' && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Note:</strong> Admins have full access to all pages by default. Custom permissions are optional.
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleSelectAll}>
            Select All
          </Button>
          <Button variant="outline" size="sm" onClick={handleClearAll}>
            Clear All
          </Button>
          <div className="flex-1" />
          <div className="text-sm text-muted-foreground">
            {selectedPages.length} pages selected
          </div>
        </div>

        <Separator />

        {/* Page Selection */}
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6">
            {Object.entries(PAGE_CATEGORIES).map(([categoryName, categoryData]) => {
              const categoryPages = categoryData.pages.map(p => p.id);
              const allSelected = categoryPages.every(pageId => selectedPages.includes(pageId));
              const someSelected = categoryPages.some(pageId => selectedPages.includes(pageId));

              return (
                <div key={categoryName} className="space-y-3">
                  {/* Category Header */}
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`category-${categoryName}`}
                      checked={allSelected}
                      onCheckedChange={() => handleToggleCategory(categoryName)}
                      className={someSelected && !allSelected ? 'opacity-50' : ''}
                    />
                    <Label
                      htmlFor={`category-${categoryName}`}
                      className="cursor-pointer flex-1"
                    >
                      {categoryName}
                    </Label>
                    <Badge variant="outline" className="text-xs">
                      {categoryPages.filter(id => selectedPages.includes(id)).length}/{categoryPages.length}
                    </Badge>
                  </div>

                  {/* Individual Pages */}
                  <div className="ml-8 space-y-2">
                    {categoryData.pages.map(page => (
                      <div key={page.id} className="flex items-center gap-2">
                        <Checkbox
                          id={page.id}
                          checked={selectedPages.includes(page.id)}
                          onCheckedChange={() => handleTogglePage(page.id)}
                        />
                        <Label
                          htmlFor={page.id}
                          className="cursor-pointer text-sm flex-1"
                        >
                          {page.label}
                        </Label>
                        {departmentPages.includes(page.id) && (
                          <Badge variant="secondary" className="text-xs">
                            Dept Default
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Permissions'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
