import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { toast } from 'sonner@2.0.3';
import { X, Plus, Edit } from 'lucide-react';

interface Insight {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  status: 'active' | 'resolved' | 'in-progress';
  createdAt: string;
  createdBy: string;
}

interface AssessmentInsightDialogsProps {
  isAddOpen: boolean;
  isEditOpen: boolean;
  selectedInsight: Insight | null;
  onAddOpenChange: (open: boolean) => void;
  onEditOpenChange: (open: boolean) => void;
  onAdd: (data: Omit<Insight, 'id' | 'createdAt' | 'createdBy'>) => void;
  onEdit: (id: string, data: Omit<Insight, 'id' | 'createdAt' | 'createdBy'>) => void;
  requireAuth: (action: string) => boolean;
}

export function AssessmentInsightDialogs({
  isAddOpen,
  isEditOpen,
  selectedInsight,
  onAddOpenChange,
  onEditOpenChange,
  onAdd,
  onEdit,
  requireAuth
}: AssessmentInsightDialogsProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'medium' as 'low' | 'medium' | 'high',
    status: 'active' as 'active' | 'resolved' | 'in-progress'
  });

  // Update form when editing
  useEffect(() => {
    if (isEditOpen && selectedInsight) {
      setFormData({
        title: selectedInsight.title,
        description: selectedInsight.description,
        severity: selectedInsight.severity,
        status: selectedInsight.status
      });
    }
  }, [isEditOpen, selectedInsight]);

  // Reset form when adding
  useEffect(() => {
    if (isAddOpen) {
      setFormData({
        title: '',
        description: '',
        severity: 'medium',
        status: 'active'
      });
    }
  }, [isAddOpen]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!requireAuth('add insight')) return;
    
    if (!formData.title || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    onAdd(formData);
    onAddOpenChange(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!requireAuth('edit insight')) return;
    
    if (!selectedInsight || !formData.title || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    onEdit(selectedInsight.id, formData);
    onEditOpenChange(false);
  };

  return (
    <>
      {/* Add Insight Dialog */}
      <Dialog open={isAddOpen} onOpenChange={onAddOpenChange}>
        <DialogContent className="w-[95vw] max-w-[600px] max-h-[95vh] bg-white border-0 shadow-2xl rounded-lg overflow-hidden [&>button]:hidden">
          <DialogHeader className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white -m-6 px-8 py-6 mb-0 relative">
            <Button
              onClick={() => onAddOpenChange(false)}
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 h-8 w-8 p-0 text-white hover:bg-white/10 hover:text-white rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
            <DialogTitle className="text-xl pr-12">Add Assessment Insight</DialogTitle>
            <DialogDescription className="text-sm text-blue-100 mt-2 sr-only">
              Add a new insight from facility assessments
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="flex-1 overflow-y-auto max-h-[calc(95vh-180px)] p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="add-title">Title *</Label>
              <Input
                id="add-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter insight title"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-severity">Severity *</Label>
                <Select 
                  value={formData.severity} 
                  onValueChange={(value: any) => setFormData({ ...formData, severity: value })}
                >
                  <SelectTrigger id="add-severity">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
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
                placeholder="Enter detailed description"
                rows={4}
                required
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onAddOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Insight
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Insight Dialog */}
      <Dialog open={isEditOpen} onOpenChange={onEditOpenChange}>
        <DialogContent className="w-[95vw] max-w-[600px] max-h-[95vh] bg-white border-0 shadow-2xl rounded-lg overflow-hidden [&>button]:hidden">
          <DialogHeader className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white -m-6 px-8 py-6 mb-0 relative">
            <Button
              onClick={() => onEditOpenChange(false)}
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 h-8 w-8 p-0 text-white hover:bg-white/10 hover:text-white rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
            <DialogTitle className="text-xl pr-12">Edit Assessment Insight</DialogTitle>
            <DialogDescription className="text-sm text-blue-100 mt-2 sr-only">
              Update insight details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto max-h-[calc(95vh-180px)] p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter insight title"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-severity">Severity *</Label>
                <Select 
                  value={formData.severity} 
                  onValueChange={(value: any) => setFormData({ ...formData, severity: value })}
                >
                  <SelectTrigger id="edit-severity">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
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
                placeholder="Enter detailed description"
                rows={4}
                required
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onEditOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <Edit className="h-4 w-4 mr-2" />
                Update Insight
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
