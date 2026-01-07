import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { toast } from 'sonner@2.0.3';
import { X, Plus, Edit } from 'lucide-react';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  category: 'classroom' | 'administrative' | 'general';
  implementationCost: number;
  timeline: string;
  createdAt: string;
  createdBy: string;
}

interface RecommendationDialogsProps {
  isAddOpen: boolean;
  isEditOpen: boolean;
  selectedRecommendation: Recommendation | null;
  onAddOpenChange: (open: boolean) => void;
  onEditOpenChange: (open: boolean) => void;
  onAdd: (data: Omit<Recommendation, 'id' | 'createdAt' | 'createdBy'>) => void;
  onEdit: (id: string, data: Omit<Recommendation, 'id' | 'createdAt' | 'createdBy'>) => void;
  requireAuth: (action: string) => boolean;
}

export function RecommendationDialogs({
  isAddOpen,
  isEditOpen,
  selectedRecommendation,
  onAddOpenChange,
  onEditOpenChange,
  onAdd,
  onEdit,
  requireAuth
}: RecommendationDialogsProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    category: 'general' as 'classroom' | 'administrative' | 'general',
    implementationCost: 0,
    timeline: ''
  });

  // Update form when editing
  useEffect(() => {
    if (isEditOpen && selectedRecommendation) {
      setFormData({
        title: selectedRecommendation.title,
        description: selectedRecommendation.description,
        priority: selectedRecommendation.priority,
        category: selectedRecommendation.category,
        implementationCost: selectedRecommendation.implementationCost,
        timeline: selectedRecommendation.timeline
      });
    }
  }, [isEditOpen, selectedRecommendation]);

  // Reset form when adding
  useEffect(() => {
    if (isAddOpen) {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        category: 'general',
        implementationCost: 0,
        timeline: ''
      });
    }
  }, [isAddOpen]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!requireAuth('add recommendation')) return;
    
    if (!formData.title || !formData.description || !formData.timeline) {
      toast.error('Please fill in all required fields');
      return;
    }

    onAdd(formData);
    onAddOpenChange(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!requireAuth('edit recommendation')) return;
    
    if (!selectedRecommendation || !formData.title || !formData.description || !formData.timeline) {
      toast.error('Please fill in all required fields');
      return;
    }

    onEdit(selectedRecommendation.id, formData);
    onEditOpenChange(false);
  };

  return (
    <>
      {/* Add Recommendation Dialog */}
      <Dialog open={isAddOpen} onOpenChange={onAddOpenChange}>
        <DialogContent className="w-[95vw] max-w-[650px] max-h-[95vh] bg-white border-0 shadow-2xl rounded-lg overflow-hidden [&>button]:hidden">
          <DialogHeader className="bg-gradient-to-r from-emerald-900 via-green-900 to-teal-900 text-white -m-6 px-8 py-6 mb-0 relative">
            <Button
              onClick={() => onAddOpenChange(false)}
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 h-8 w-8 p-0 text-white hover:bg-white/10 hover:text-white rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
            <DialogTitle className="text-xl pr-12">Add Improvement Recommendation</DialogTitle>
            <DialogDescription className="text-sm text-emerald-100 mt-2 sr-only">
              Add a new recommendation for facility improvements
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="flex-1 overflow-y-auto max-h-[calc(95vh-180px)] p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="add-title">Recommendation Title *</Label>
              <Input
                id="add-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter recommendation title"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
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

              <div className="space-y-2">
                <Label htmlFor="add-category">Category *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger id="add-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="classroom">Classroom</SelectItem>
                    <SelectItem value="administrative">Administrative</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-timeline">Timeline *</Label>
                <Input
                  id="add-timeline"
                  value={formData.timeline}
                  onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                  placeholder="e.g., 3 months"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-cost">Implementation Cost (₱) *</Label>
              <Input
                id="add-cost"
                type="number"
                min="0"
                step="0.01"
                value={formData.implementationCost}
                onChange={(e) => setFormData({ ...formData, implementationCost: parseFloat(e.target.value) || 0 })}
                placeholder="Enter estimated cost"
                className="text-right"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-description">Description *</Label>
              <Textarea
                id="add-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter detailed description of the recommendation"
                rows={4}
                required
              />
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
              <div className="text-sm text-gray-700">
                <p className="mb-1">Estimated Cost: <span className="text-emerald-700">₱{formData.implementationCost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span></p>
                <p>Timeline: <span className="text-emerald-700">{formData.timeline || 'Not specified'}</span></p>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onAddOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Recommendation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Recommendation Dialog */}
      <Dialog open={isEditOpen} onOpenChange={onEditOpenChange}>
        <DialogContent className="w-[95vw] max-w-[650px] max-h-[95vh] bg-white border-0 shadow-2xl rounded-lg overflow-hidden [&>button]:hidden">
          <DialogHeader className="bg-gradient-to-r from-emerald-900 via-green-900 to-teal-900 text-white -m-6 px-8 py-6 mb-0 relative">
            <Button
              onClick={() => onEditOpenChange(false)}
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 h-8 w-8 p-0 text-white hover:bg-white/10 hover:text-white rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
            <DialogTitle className="text-xl pr-12">Edit Improvement Recommendation</DialogTitle>
            <DialogDescription className="text-sm text-emerald-100 mt-2 sr-only">
              Update recommendation details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto max-h-[calc(95vh-180px)] p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Recommendation Title *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter recommendation title"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
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

              <div className="space-y-2">
                <Label htmlFor="edit-category">Category *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger id="edit-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="classroom">Classroom</SelectItem>
                    <SelectItem value="administrative">Administrative</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-timeline">Timeline *</Label>
                <Input
                  id="edit-timeline"
                  value={formData.timeline}
                  onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                  placeholder="e.g., 3 months"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-cost">Implementation Cost (₱) *</Label>
              <Input
                id="edit-cost"
                type="number"
                min="0"
                step="0.01"
                value={formData.implementationCost}
                onChange={(e) => setFormData({ ...formData, implementationCost: parseFloat(e.target.value) || 0 })}
                placeholder="Enter estimated cost"
                className="text-right"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description *</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter detailed description of the recommendation"
                rows={4}
                required
              />
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
              <div className="text-sm text-gray-700">
                <p className="mb-1">Estimated Cost: <span className="text-emerald-700">₱{formData.implementationCost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span></p>
                <p>Timeline: <span className="text-emerald-700">{formData.timeline || 'Not specified'}</span></p>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onEditOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                <Edit className="h-4 w-4 mr-2" />
                Update Recommendation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
