import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { toast } from 'sonner@2.0.3';
import { X, Plus, Edit } from 'lucide-react';

interface ActionItem {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  createdBy: string;
}

interface ActionItemDialogsProps {
  isAddOpen: boolean;
  isEditOpen: boolean;
  selectedActionItem: ActionItem | null;
  onAddOpenChange: (open: boolean) => void;
  onEditOpenChange: (open: boolean) => void;
  onAdd: (data: Omit<ActionItem, 'id' | 'createdAt' | 'createdBy'>) => void;
  onEdit: (id: string, data: Omit<ActionItem, 'id' | 'createdAt' | 'createdBy'>) => void;
  requireAuth: (action: string) => boolean;
}

export function ActionItemDialogs({
  isAddOpen,
  isEditOpen,
  selectedActionItem,
  onAddOpenChange,
  onEditOpenChange,
  onAdd,
  onEdit,
  requireAuth
}: ActionItemDialogsProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    dueDate: '',
    status: 'pending' as 'pending' | 'in-progress' | 'completed',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  // Update form when editing
  useEffect(() => {
    if (isEditOpen && selectedActionItem) {
      setFormData({
        title: selectedActionItem.title,
        description: selectedActionItem.description,
        assignedTo: selectedActionItem.assignedTo,
        dueDate: selectedActionItem.dueDate,
        status: selectedActionItem.status,
        priority: selectedActionItem.priority
      });
    }
  }, [isEditOpen, selectedActionItem]);

  // Reset form when adding
  useEffect(() => {
    if (isAddOpen) {
      setFormData({
        title: '',
        description: '',
        assignedTo: '',
        dueDate: '',
        status: 'pending',
        priority: 'medium'
      });
    }
  }, [isAddOpen]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!requireAuth('add action item')) return;
    
    if (!formData.title || !formData.description || !formData.assignedTo || !formData.dueDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    onAdd(formData);
    onAddOpenChange(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!requireAuth('edit action item')) return;
    
    if (!selectedActionItem || !formData.title || !formData.description || !formData.assignedTo || !formData.dueDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    onEdit(selectedActionItem.id, formData);
    onEditOpenChange(false);
  };

  return (
    <>
      {/* Add Action Item Dialog */}
      <Dialog open={isAddOpen} onOpenChange={onAddOpenChange}>
        <DialogContent className="w-[95vw] max-w-[650px] max-h-[95vh] bg-white border-0 shadow-2xl rounded-lg overflow-hidden [&>button]:hidden">
          <DialogHeader className="bg-gradient-to-r from-amber-900 via-amber-800 to-orange-900 text-white -m-6 px-8 py-6 mb-0 relative">
            <Button
              onClick={() => onAddOpenChange(false)}
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 h-8 w-8 p-0 text-white hover:bg-white/10 hover:text-white rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
            <DialogTitle className="text-xl pr-12">Add Action Item</DialogTitle>
            <DialogDescription className="text-sm text-amber-100 mt-2 sr-only">
              Add a new action item or task
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="flex-1 overflow-y-auto max-h-[calc(95vh-180px)] p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="add-title">Action Title *</Label>
              <Input
                id="add-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter action item title"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-assigned">Assigned To *</Label>
                <Input
                  id="add-assigned"
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  placeholder="Team or person name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-due">Due Date *</Label>
                <Input
                  id="add-due"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-status">Status *</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger id="add-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-priority">Priority *</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger id="add-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-description">Description *</Label>
              <Textarea
                id="add-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter detailed description of the action item"
                rows={4}
                required
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="text-sm text-gray-700">
                <p className="mb-1">Assigned to: <span className="text-amber-700">{formData.assignedTo || 'Not specified'}</span></p>
                <p>Due: <span className="text-amber-700">{formData.dueDate ? new Date(formData.dueDate).toLocaleDateString() : 'Not set'}</span></p>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onAddOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-amber-600 hover:bg-amber-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Action Item
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Action Item Dialog */}
      <Dialog open={isEditOpen} onOpenChange={onEditOpenChange}>
        <DialogContent className="w-[95vw] max-w-[650px] max-h-[95vh] bg-white border-0 shadow-2xl rounded-lg overflow-hidden [&>button]:hidden">
          <DialogHeader className="bg-gradient-to-r from-amber-900 via-amber-800 to-orange-900 text-white -m-6 px-8 py-6 mb-0 relative">
            <Button
              onClick={() => onEditOpenChange(false)}
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 h-8 w-8 p-0 text-white hover:bg-white/10 hover:text-white rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
            <DialogTitle className="text-xl pr-12">Edit Action Item</DialogTitle>
            <DialogDescription className="text-sm text-amber-100 mt-2 sr-only">
              Update action item details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto max-h-[calc(95vh-180px)] p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Action Title *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter action item title"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-assigned">Assigned To *</Label>
                <Input
                  id="edit-assigned"
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  placeholder="Team or person name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-due">Due Date *</Label>
                <Input
                  id="edit-due"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status *</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-priority">Priority *</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger id="edit-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description *</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter detailed description of the action item"
                rows={4}
                required
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="text-sm text-gray-700">
                <p className="mb-1">Assigned to: <span className="text-amber-700">{formData.assignedTo || 'Not specified'}</span></p>
                <p>Due: <span className="text-amber-700">{formData.dueDate ? new Date(formData.dueDate).toLocaleDateString() : 'Not set'}</span></p>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onEditOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-amber-600 hover:bg-amber-700">
                <Edit className="h-4 w-4 mr-2" />
                Update Action Item
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
