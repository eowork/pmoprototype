import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { UserPlus, Users, Shield, Edit, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { rbacService } from '../services/RBACService';

export interface AssignedPersonnel {
  id: string;
  email: string;
  name: string;
  role: 'Admin' | 'Staff' | 'Editor';
  category: string; // e.g., 'students', 'faculty', 'staff', 'pwd', 'indigenous'
  permissions: {
    canAdd: boolean;
    canEdit: boolean;
    canDelete: boolean;
  };
  assignedBy: string;
  assignedAt: Date;
}

interface PermissionsManagerProps {
  category: string; // students, faculty, staff, pwd, indigenous
  userRole: string;
  currentUserEmail: string;
}

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

  // Load personnel from RBAC service
  useEffect(() => {
    const loadPersonnel = () => {
      const categoryPersonnel = rbacService.getPersonnel(category);
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

    rbacService.addPersonnel(newPersonnel);
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
    toast.success(`${formData.name} assigned to ${category} data management`);
  };

  const handleRemove = (id: string) => {
    if (!isAdmin) {
      toast.error('Only administrators can remove personnel');
      return;
    }

    rbacService.removePersonnel(category, id);
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
    <Card className="border-gray-200 shadow-sm">
      <CardHeader className="bg-gradient-to-r from-emerald-50 to-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Shield className="h-5 w-5 text-emerald-600" />
              Assigned Personnel
            </CardTitle>
            <CardDescription>
              Manage users with data entry permissions for {category}
            </CardDescription>
          </div>
          <Button onClick={() => setShowDialog(true)} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            <UserPlus className="h-4 w-4" />
            Assign Personnel
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Personnel List */}
        {filteredPersonnel.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>No personnel assigned yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPersonnel.map(person => (
              <div key={person.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                      <span className="text-emerald-700">{person.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{person.name}</p>
                      <p className="text-sm text-gray-500">{person.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-13">
                    <Badge className={getRoleBadge(person.role)}>{person.role}</Badge>
                    {person.permissions.canAdd && (
                      <Badge variant="outline" className="text-xs">Add</Badge>
                    )}
                    {person.permissions.canEdit && (
                      <Badge variant="outline" className="text-xs">Edit</Badge>
                    )}
                    {person.permissions.canDelete && (
                      <Badge variant="outline" className="text-xs">Delete</Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(person.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Assignment Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Personnel</DialogTitle>
            <DialogDescription>
              Grant data management permissions for {category}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                placeholder="Enter full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="user@carsu.edu.ph"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={formData.role} onValueChange={(value: 'Staff' | 'Editor') => setFormData({ ...formData, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Staff">Staff</SelectItem>
                  <SelectItem value="Editor">Editor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label>Permissions</Label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.canAdd}
                    onChange={(e) => setFormData({ ...formData, canAdd: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Can add new entries</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.canEdit}
                    onChange={(e) => setFormData({ ...formData, canEdit: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Can edit existing entries</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.canDelete}
                    onChange={(e) => setFormData({ ...formData, canDelete: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Can delete entries</span>
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleAdd} className="bg-emerald-600 hover:bg-emerald-700">
              Assign Personnel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
