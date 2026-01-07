/**
 * Repair Assigned Personnel Manager - Exclusive for Repairs Category
 * 
 * Manages repair project personnel assignments with RBAC controls
 * - Add/Remove personnel
 * - Creator protection (cannot be removed)
 * - Role-based access control
 * 
 * This is a complete copy exclusive to repairs category to maintain independence
 * from construction infrastructure components as per requirements.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Avatar, AvatarFallback } from '../../ui/avatar';
import { Separator } from '../../ui/separator';
import { 
  Users, 
  UserPlus, 
  UserMinus, 
  Shield, 
  Mail, 
  Briefcase,
  Crown,
  AlertCircle,
  CheckCircle2,
  Search
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface PersonnelMember {
  id: string;
  email: string;
  name: string;
  role: 'Project Manager' | 'Engineer' | 'Supervisor' | 'Staff' | 'Observer';
  department: string;
  assignedDate: string;
  isCreator?: boolean;
  status: 'active' | 'inactive';
}

interface RepairAssignedPersonnelManagerProps {
  projectId: string;
  projectTitle: string;
  currentUserEmail: string;
  currentUserRole: string;
  onPersonnelUpdate?: (personnel: PersonnelMember[]) => void;
}

export function RepairAssignedPersonnelManager({
  projectId,
  projectTitle,
  currentUserEmail,
  currentUserRole,
  onPersonnelUpdate
}: RepairAssignedPersonnelManagerProps) {
  const [personnel, setPersonnel] = useState<PersonnelMember[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<PersonnelMember | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [newMember, setNewMember] = useState({
    email: '',
    name: '',
    role: 'Staff' as PersonnelMember['role'],
    department: ''
  });

  // Check if user has permission to manage personnel
  const canManagePersonnel = ['Admin', 'Project Manager', 'Director'].includes(currentUserRole);

  // Initialize with sample data (replace with actual data fetch)
  useEffect(() => {
    const samplePersonnel: PersonnelMember[] = [
      {
        id: 'p-001',
        email: currentUserEmail || 'creator@carsu.edu.ph',
        name: 'Project Creator',
        role: 'Project Manager',
        department: 'Infrastructure Development',
        assignedDate: '2024-01-15',
        isCreator: true,
        status: 'active'
      },
      {
        id: 'p-002',
        email: 'engineer@carsu.edu.ph',
        name: 'John Dela Cruz',
        role: 'Engineer',
        department: 'Engineering Services',
        assignedDate: '2024-01-20',
        status: 'active'
      },
      {
        id: 'p-003',
        email: 'supervisor@carsu.edu.ph',
        name: 'Maria Santos',
        role: 'Supervisor',
        department: 'Project Monitoring',
        assignedDate: '2024-02-01',
        status: 'active'
      }
    ];

    setPersonnel(samplePersonnel);
  }, [projectId, currentUserEmail]);

  const handleAddPersonnel = () => {
    if (!newMember.email || !newMember.name) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Check if email already exists
    if (personnel.some(p => p.email === newMember.email)) {
      toast.error('This person is already assigned to the project');
      return;
    }

    const member: PersonnelMember = {
      id: `p-${Date.now()}`,
      email: newMember.email,
      name: newMember.name,
      role: newMember.role,
      department: newMember.department || 'General',
      assignedDate: new Date().toISOString().split('T')[0],
      status: 'active'
    };

    const updatedPersonnel = [...personnel, member];
    setPersonnel(updatedPersonnel);
    
    if (onPersonnelUpdate) {
      onPersonnelUpdate(updatedPersonnel);
    }

    // Reset form
    setNewMember({
      email: '',
      name: '',
      role: 'Staff',
      department: ''
    });
    
    setIsAddDialogOpen(false);
    toast.success(`${member.name} has been added to the project`);
  };

  const handleRemovePersonnel = () => {
    if (!selectedMember) return;

    // Prevent removing creator
    if (selectedMember.isCreator) {
      toast.error('Cannot remove project creator from the project');
      setIsRemoveDialogOpen(false);
      setSelectedMember(null);
      return;
    }

    const updatedPersonnel = personnel.filter(p => p.id !== selectedMember.id);
    setPersonnel(updatedPersonnel);
    
    if (onPersonnelUpdate) {
      onPersonnelUpdate(updatedPersonnel);
    }

    setIsRemoveDialogOpen(false);
    setSelectedMember(null);
    toast.success(`${selectedMember.name} has been removed from the project`);
  };

  const openRemoveDialog = (member: PersonnelMember) => {
    if (member.isCreator) {
      toast.error('Project creator cannot be removed from the project');
      return;
    }
    setSelectedMember(member);
    setIsRemoveDialogOpen(true);
  };

  const getRoleBadgeColor = (role: PersonnelMember['role']) => {
    const colors = {
      'Project Manager': 'bg-purple-100 text-purple-800 border-purple-200',
      'Engineer': 'bg-blue-100 text-blue-800 border-blue-200',
      'Supervisor': 'bg-green-100 text-green-800 border-green-200',
      'Staff': 'bg-gray-100 text-gray-800 border-gray-200',
      'Observer': 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return colors[role] || colors.Staff;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredPersonnel = personnel.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Assigned Personnel</CardTitle>
              <CardDescription>
                {personnel.length} {personnel.length === 1 ? 'member' : 'members'} assigned to this repair project
              </CardDescription>
            </div>
          </div>
          {canManagePersonnel && (
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Add Member
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Permission Notice */}
        {!canManagePersonnel && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <strong>View Only:</strong> You don't have permission to add or remove personnel. 
              Contact a Project Manager or Admin to manage team members.
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Personnel List */}
        <div className="space-y-3">
          {filteredPersonnel.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No personnel found matching your search</p>
            </div>
          ) : (
            filteredPersonnel.map((member) => (
              <div 
                key={member.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  {/* Avatar */}
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className={member.isCreator ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}>
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900 truncate">{member.name}</h4>
                      {member.isCreator && (
                        <Crown className="w-4 h-4 text-purple-600" title="Project Creator" />
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {member.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        {member.department}
                      </span>
                    </div>
                  </div>

                  {/* Role Badge */}
                  <Badge 
                    variant="outline" 
                    className={`${getRoleBadgeColor(member.role)} border`}
                  >
                    {member.role}
                  </Badge>

                  {/* Status */}
                  <div className="flex items-center gap-1 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-green-600">Active</span>
                  </div>
                </div>

                {/* Remove Button */}
                {canManagePersonnel && !member.isCreator && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openRemoveDialog(member)}
                    className="ml-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <UserMinus className="w-4 h-4" />
                  </Button>
                )}

                {/* Creator Protection */}
                {member.isCreator && (
                  <div className="ml-2 flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
                    <Shield className="w-3 h-3" />
                    Protected
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>

      {/* Add Personnel Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>
              Add a new person to the repair project team
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="member@carsu.edu.ph"
                value={newMember.email}
                onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="Juan Dela Cruz"
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select 
                value={newMember.role} 
                onValueChange={(value: PersonnelMember['role']) => setNewMember({ ...newMember, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Project Manager">Project Manager</SelectItem>
                  <SelectItem value="Engineer">Engineer</SelectItem>
                  <SelectItem value="Supervisor">Supervisor</SelectItem>
                  <SelectItem value="Staff">Staff</SelectItem>
                  <SelectItem value="Observer">Observer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                placeholder="e.g., Engineering Services"
                value={newMember.department}
                onChange={(e) => setNewMember({ ...newMember, department: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPersonnel}>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Personnel Dialog */}
      <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Remove Team Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this member from the repair project?
            </DialogDescription>
          </DialogHeader>

          {selectedMember && (
            <div className="py-4">
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-gray-100 text-gray-700">
                      {getInitials(selectedMember.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium text-gray-900">{selectedMember.name}</h4>
                    <p className="text-sm text-gray-600">{selectedMember.email}</p>
                    <Badge variant="outline" className={`${getRoleBadgeColor(selectedMember.role)} border mt-1`}>
                      {selectedMember.role}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <p className="text-sm text-yellow-800">
                  This member will no longer have access to repair project data and updates.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRemoveDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemovePersonnel}>
              <UserMinus className="w-4 h-4 mr-2" />
              Remove Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
