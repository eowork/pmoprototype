import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Checkbox } from '../../ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { UserPlus, Users, Shield, Edit, Trash2, Search, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { universityOperationsRBACService } from '../services/RBACService';

export interface AssignedPersonnel {
  id: string;
  email: string;
  name: string;
  role: 'Admin' | 'Staff' | 'Editor';
  category: string;
  permissions: {
    canAdd: boolean;
    canEdit: boolean;
    canDelete: boolean;
  };
  assignedBy: string;
  assignedAt: Date;
}

interface PermissionsManagerProps {
  category: string;
  userRole: string;
  currentUserEmail: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  'higher-education-program': 'Higher Education Program',
  'advanced-education-program': 'Advanced Education Program',
  'research-program': 'Research Program',
  'technical-advisory-extension-program': 'Technical Advisory & Extension Program'
};

export function PermissionsManager({ category, userRole, currentUserEmail }: PermissionsManagerProps) {
  const [personnel, setPersonnel] = useState<AssignedPersonnel[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'Staff' as 'Staff' | 'Editor',
    canAdd: true,
    canEdit: true,
    canDelete: false
  });

  const isAdmin = userRole === 'Admin';
  const categoryLabel = CATEGORY_LABELS[category] || category;

  // Load personnel from RBAC service
  useEffect(() => {
    const loadPersonnel = () => {
      const categoryPersonnel = universityOperationsRBACService.getPersonnel(category);
      setPersonnel(categoryPersonnel);
    };
    loadPersonnel();
  }, [category]);

  const filteredPersonnel = personnel.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = () => {
    if (!isAdmin) {
      toast.error('Only administrators can assign personnel');
      return;
    }

    if (!formData.email || !formData.name) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Check if personnel already assigned
    if (personnel.some(p => p.email === formData.email)) {
      toast.error('This person is already assigned to this category');
      return;
    }

    const newPersonnel: AssignedPersonnel = {
      id: `${category}-p${Date.now()}`,
      email: formData.email,
      name: formData.name,
      role: formData.role,
      category,
      permissions: {
        canAdd: formData.canAdd,
        canEdit: formData.canEdit,
        canDelete: formData.canDelete
      },
      assignedBy: currentUserEmail,
      assignedAt: new Date()
    };

    universityOperationsRBACService.addPersonnel(newPersonnel);
    setPersonnel([...personnel, newPersonnel]);
    setShowDialog(false);
    setFormData({
      email: '',
      name: '',
      role: 'Staff',
      canAdd: true,
      canEdit: true,
      canDelete: false
    });
    toast.success(`${formData.name} assigned to ${categoryLabel} data management`);
  };

  const handleRemove = (id: string) => {
    if (!isAdmin) {
      toast.error('Only administrators can remove personnel');
      return;
    }

    universityOperationsRBACService.removePersonnel(category, id);
    setPersonnel(personnel.filter(p => p.id !== id));
    toast.success('Personnel removed successfully');
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, string> = {
      'Admin': 'bg-purple-100 text-purple-700 border-purple-200',
      'Staff': 'bg-blue-100 text-blue-700 border-blue-200',
      'Editor': 'bg-emerald-100 text-emerald-700 border-emerald-200'
    };
    return variants[role] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <Card className="admin-card border-0">
      <CardHeader className="border-b border-gray-200 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2.5 text-gray-900 text-lg">
              <Shield className="h-5 w-5 text-emerald-600" />
              Assigned Personnel
            </CardTitle>
            <CardDescription className="text-sm mt-1">
              Manage users with data entry permissions for {categoryLabel}
            </CardDescription>
          </div>
          <Button onClick={() => setShowDialog(true)} className="gap-2 bg-emerald-600 hover:bg-emerald-700 h-9">
            <UserPlus className="h-4 w-4" />
            <span className="text-sm">Assign Personnel</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* Search */}
        <div className="mb-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-gray-200"
            />
          </div>
        </div>

        {/* Personnel List */}
        {filteredPersonnel.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 mb-2">No personnel assigned</p>
            <p className="text-sm text-gray-500">Assign personnel to enable data collection for this category</p>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-gray-700">Name</TableHead>
                  <TableHead className="text-gray-700">Email</TableHead>
                  <TableHead className="text-gray-700">Role</TableHead>
                  <TableHead className="text-gray-700 text-center">Add</TableHead>
                  <TableHead className="text-gray-700 text-center">Edit</TableHead>
                  <TableHead className="text-gray-700 text-center">Delete</TableHead>
                  <TableHead className="text-gray-700 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPersonnel.map((person) => (
                  <TableRow key={person.id} className="hover:bg-gray-50">
                    <TableCell className="text-gray-900">{person.name}</TableCell>
                    <TableCell className="text-gray-600 text-sm">{person.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getRoleBadge(person.role)}>
                        {person.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {person.permissions.canAdd ? (
                        <CheckCircle className="h-4 w-4 text-emerald-600 mx-auto" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-300 mx-auto" />
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {person.permissions.canEdit ? (
                        <CheckCircle className="h-4 w-4 text-emerald-600 mx-auto" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-300 mx-auto" />
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {person.permissions.canDelete ? (
                        <CheckCircle className="h-4 w-4 text-emerald-600 mx-auto" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-300 mx-auto" />
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(person.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Add Personnel Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Assign Personnel</DialogTitle>
            <DialogDescription className="text-sm">
              Grant data management permissions for {categoryLabel}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Enter full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border-gray-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@carsu.edu.ph"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="border-gray-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={(value: 'Staff' | 'Editor') => setFormData({ ...formData, role: value })}>
                <SelectTrigger className="border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Staff">Staff</SelectItem>
                  <SelectItem value="Editor">Editor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3 pt-2">
              <Label className="text-base">Permissions</Label>
              <div className="space-y-2.5">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="canAdd"
                    checked={formData.canAdd}
                    onCheckedChange={(checked) => setFormData({ ...formData, canAdd: checked as boolean })}
                  />
                  <Label htmlFor="canAdd" className="text-sm cursor-pointer">
                    Can add new entries
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="canEdit"
                    checked={formData.canEdit}
                    onCheckedChange={(checked) => setFormData({ ...formData, canEdit: checked as boolean })}
                  />
                  <Label htmlFor="canEdit" className="text-sm cursor-pointer">
                    Can edit existing entries
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="canDelete"
                    checked={formData.canDelete}
                    onCheckedChange={(checked) => setFormData({ ...formData, canDelete: checked as boolean })}
                  />
                  <Label htmlFor="canDelete" className="text-sm cursor-pointer">
                    Can delete entries
                  </Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)} className="text-sm">
              Cancel
            </Button>
            <Button onClick={handleAdd} className="bg-emerald-600 hover:bg-emerald-700 text-sm">
              Assign Personnel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
