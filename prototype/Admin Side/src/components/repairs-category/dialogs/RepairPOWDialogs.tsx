import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Checkbox } from '../../ui/checkbox';
import { toast } from 'sonner@2.0.3';
import { X, FileText } from 'lucide-react';

// ============================================
// POW Item Interface (Repair-Exclusive)
// ============================================
export interface RepairPOWItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  estimatedMaterialCost: number;
  estimatedLaborCost: number;
  estimatedProjectCost: number;
  unitCost: number;
  dateOfEntry: string;
  status?: 'Active' | 'Completed' | 'Pending' | 'Cancelled';
  remarks?: string;
  isUnitCostOverridden?: boolean;
}

// ============================================
// Add Repair POW Item Dialog
// ============================================
interface AddRepairPOWItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<RepairPOWItem, 'id'>) => void;
}

export function AddRepairPOWItemDialog({
  open,
  onOpenChange,
  onSubmit
}: AddRepairPOWItemDialogProps) {
  const [formData, setFormData] = useState({
    description: '',
    quantity: 0,
    unit: '',
    estimatedMaterialCost: 0,
    estimatedLaborCost: 0,
    estimatedProjectCost: 0,
    unitCost: 0,
    dateOfEntry: new Date().toISOString().split('T')[0],
    status: 'Active' as RepairPOWItem['status'],
    remarks: '',
    isUnitCostOverridden: false
  });

  useEffect(() => {
    if (!open) {
      setFormData({
        description: '',
        quantity: 0,
        unit: '',
        estimatedMaterialCost: 0,
        estimatedLaborCost: 0,
        estimatedProjectCost: 0,
        unitCost: 0,
        dateOfEntry: new Date().toISOString().split('T')[0],
        status: 'Active',
        remarks: '',
        isUnitCostOverridden: false
      });
    }
  }, [open]);

  // Auto-calculate values when material/labor costs or quantity change (only if not manually overridden)
  useEffect(() => {
    if (!formData.isUnitCostOverridden) {
      const totalEstimatedCost = formData.estimatedMaterialCost + formData.estimatedLaborCost;
      const calculatedUnitCost = formData.quantity > 0 ? totalEstimatedCost / formData.quantity : 0;
      
      setFormData(prev => ({
        ...prev,
        estimatedProjectCost: totalEstimatedCost,
        unitCost: calculatedUnitCost
      }));
    }
  }, [formData.estimatedMaterialCost, formData.estimatedLaborCost, formData.quantity, formData.isUnitCostOverridden]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description.trim()) {
      toast.error('Please enter a description');
      return;
    }

    if (formData.quantity <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }

    if (!formData.unit.trim()) {
      toast.error('Please enter a unit of measurement');
      return;
    }

    onSubmit(formData);
    onOpenChange(false);
    toast.success('Repair POW item added successfully');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[90vw] lg:max-w-[900px] max-h-[95vh] bg-white border-0 shadow-2xl rounded-lg overflow-hidden [&>button]:hidden">
        <DialogHeader className="bg-gradient-to-r from-emerald-900 via-green-900 to-teal-900 text-white -m-6 px-8 py-6 mb-0 relative">
          <Button
            onClick={() => onOpenChange(false)}
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 h-8 w-8 p-0 text-white hover:bg-white/10 hover:text-white rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
          <DialogTitle className="flex items-center gap-3 text-xl pr-12">
            <div className="p-2 bg-white/10 rounded-lg">
              <FileText className="h-5 w-5" />
            </div>
            Add Repair POW Item
          </DialogTitle>
          <DialogDescription className="text-sm text-emerald-100 mt-2 sr-only">
            Add a new Repair Program of Works item with cost estimates and specifications
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto max-h-[calc(95vh-180px)] p-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="description">Item Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              placeholder="Detailed description of repair work item..."
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                step="0.01"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                required
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit of Measurement *</Label>
              <Input
                id="unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="e.g., square meters, pcs"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfEntry">Date of Entry</Label>
              <Input
                id="dateOfEntry"
                type="date"
                value={formData.dateOfEntry}
                onChange={(e) => setFormData({ ...formData, dateOfEntry: e.target.value })}
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm text-gray-900 mb-3">Cost Estimates</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estimatedMaterialCost">Estimated Material Cost (₱) *</Label>
                <Input
                  id="estimatedMaterialCost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.estimatedMaterialCost}
                  onChange={(e) => setFormData({ ...formData, estimatedMaterialCost: parseFloat(e.target.value) || 0 })}
                  required
                  className="text-right"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedLaborCost">Estimated Labor Cost (₱) *</Label>
                <Input
                  id="estimatedLaborCost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.estimatedLaborCost}
                  onChange={(e) => setFormData({ ...formData, estimatedLaborCost: parseFloat(e.target.value) || 0 })}
                  required
                  className="text-right"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm text-gray-900 mb-3">Calculated Costs (Editable)</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estimatedProjectCost">Estimated Project Cost (₱)</Label>
                <Input
                  id="estimatedProjectCost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.estimatedProjectCost}
                  onChange={(e) => {
                    const newProjectCost = parseFloat(e.target.value) || 0;
                    setFormData({ 
                      ...formData, 
                      estimatedProjectCost: newProjectCost,
                      unitCost: formData.quantity > 0 && !formData.isUnitCostOverridden 
                        ? newProjectCost / formData.quantity 
                        : formData.unitCost
                    });
                  }}
                  className="text-right"
                  placeholder="Auto or manual"
                />
                <p className="text-xs text-gray-500">
                  Auto: Material + Labor | Manual: Edit directly
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="unitCost">Unit Cost (₱)</Label>
                <Input
                  id="unitCost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.unitCost}
                  onChange={(e) => {
                    setFormData({ 
                      ...formData, 
                      unitCost: parseFloat(e.target.value) || 0,
                      isUnitCostOverridden: true
                    });
                  }}
                  className="text-right"
                  placeholder="Auto or manual"
                />
                <p className="text-xs text-gray-500">
                  Auto: Total Cost / Quantity | Manual: Edit directly
                </p>
              </div>
            </div>
            
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mt-3">
              <div className="text-xs text-emerald-900">
                <strong>Note:</strong> Project Cost and Unit Cost can be edited manually or auto-calculated. 
                Auto-calc: Project Cost = Material + Labor, Unit Cost = Project Cost / Quantity
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: RepairPOWItem['status']) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks/Notes</Label>
              <Input
                id="remarks"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                placeholder="Optional notes..."
              />
            </div>
          </div>

          <DialogFooter className="border-t pt-4 mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
              Add Repair POW Item
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Edit Repair POW Item Dialog
// ============================================
interface EditRepairPOWItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  powItem: RepairPOWItem | null;
  onSubmit: (data: RepairPOWItem) => void;
}

export function EditRepairPOWItemDialog({
  open,
  onOpenChange,
  powItem,
  onSubmit
}: EditRepairPOWItemDialogProps) {
  const [formData, setFormData] = useState({
    description: '',
    quantity: 0,
    unit: '',
    estimatedMaterialCost: 0,
    estimatedLaborCost: 0,
    estimatedProjectCost: 0,
    unitCost: 0,
    dateOfEntry: new Date().toISOString().split('T')[0],
    status: 'Active' as RepairPOWItem['status'],
    remarks: '',
    isUnitCostOverridden: false
  });

  useEffect(() => {
    if (powItem && open) {
      setFormData({
        description: powItem.description,
        quantity: powItem.quantity,
        unit: powItem.unit,
        estimatedMaterialCost: powItem.estimatedMaterialCost,
        estimatedLaborCost: powItem.estimatedLaborCost,
        estimatedProjectCost: powItem.estimatedProjectCost,
        unitCost: powItem.unitCost,
        dateOfEntry: powItem.dateOfEntry,
        status: powItem.status || 'Active',
        remarks: powItem.remarks || '',
        isUnitCostOverridden: powItem.isUnitCostOverridden || false
      });
    }
  }, [powItem, open]);

  // Auto-calculate values
  useEffect(() => {
    const totalEstimatedCost = formData.estimatedMaterialCost + formData.estimatedLaborCost;
    const calculatedUnitCost = formData.quantity > 0 ? totalEstimatedCost / formData.quantity : 0;
    
    setFormData(prev => ({
      ...prev,
      estimatedProjectCost: totalEstimatedCost,
      unitCost: prev.isUnitCostOverridden ? prev.unitCost : calculatedUnitCost
    }));
  }, [formData.estimatedMaterialCost, formData.estimatedLaborCost, formData.quantity, formData.isUnitCostOverridden]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!powItem) return;

    if (!formData.description.trim()) {
      toast.error('Please enter a description');
      return;
    }

    if (formData.quantity <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }

    if (!formData.unit.trim()) {
      toast.error('Please enter a unit of measurement');
      return;
    }

    onSubmit({
      ...powItem,
      ...formData
    });
    onOpenChange(false);
    toast.success('Repair POW item updated successfully');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[90vw] lg:max-w-[900px] max-h-[95vh] bg-white border-0 shadow-2xl rounded-lg overflow-hidden [&>button]:hidden">
        <DialogHeader className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-800 text-white -m-6 px-8 py-6 mb-0 relative">
          <Button
            onClick={() => onOpenChange(false)}
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 h-8 w-8 p-0 text-white hover:bg-white/10 hover:text-white rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
          <DialogTitle className="flex items-center gap-3 text-xl pr-12">
            <div className="p-2 bg-white/10 rounded-lg">
              <FileText className="h-5 w-5" />
            </div>
            Edit Repair POW Item
          </DialogTitle>
          <DialogDescription className="text-sm text-blue-100 mt-2 sr-only">
            Update Repair Program of Works item details, cost estimates, and specifications
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto max-h-[calc(95vh-180px)] p-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="description">Item Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              placeholder="Detailed description of repair work item..."
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                step="0.01"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                required
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit of Measurement *</Label>
              <Input
                id="unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="e.g., square meters, pcs"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfEntry">Date of Entry</Label>
              <Input
                id="dateOfEntry"
                type="date"
                value={formData.dateOfEntry}
                onChange={(e) => setFormData({ ...formData, dateOfEntry: e.target.value })}
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm text-gray-900 mb-3">Cost Estimates</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estimatedMaterialCost">Estimated Material Cost (₱) *</Label>
                <Input
                  id="estimatedMaterialCost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.estimatedMaterialCost}
                  onChange={(e) => setFormData({ ...formData, estimatedMaterialCost: parseFloat(e.target.value) || 0 })}
                  required
                  className="text-right"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedLaborCost">Estimated Labor Cost (₱) *</Label>
                <Input
                  id="estimatedLaborCost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.estimatedLaborCost}
                  onChange={(e) => setFormData({ ...formData, estimatedLaborCost: parseFloat(e.target.value) || 0 })}
                  required
                  className="text-right"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm text-gray-900 mb-3">Calculated Costs (Editable)</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estimatedProjectCost">Estimated Project Cost (₱)</Label>
                <Input
                  id="estimatedProjectCost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.estimatedProjectCost}
                  onChange={(e) => {
                    const newProjectCost = parseFloat(e.target.value) || 0;
                    setFormData({ 
                      ...formData, 
                      estimatedProjectCost: newProjectCost,
                      unitCost: formData.quantity > 0 && !formData.isUnitCostOverridden 
                        ? newProjectCost / formData.quantity 
                        : formData.unitCost
                    });
                  }}
                  className="text-right"
                  placeholder="Auto or manual"
                />
                <p className="text-xs text-gray-500">
                  Auto: Material + Labor | Manual: Edit directly
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="unitCost">Unit Cost (₱)</Label>
                <Input
                  id="unitCost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.unitCost}
                  onChange={(e) => {
                    setFormData({ 
                      ...formData, 
                      unitCost: parseFloat(e.target.value) || 0,
                      isUnitCostOverridden: true
                    });
                  }}
                  className="text-right"
                  placeholder="Auto or manual"
                />
                <p className="text-xs text-gray-500">
                  Auto: Total Cost / Quantity | Manual: Edit directly
                </p>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
              <div className="text-xs text-blue-900">
                <strong>Note:</strong> Project Cost and Unit Cost can be edited manually or auto-calculated. 
                Auto-calc: Project Cost = Material + Labor, Unit Cost = Project Cost / Quantity
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: RepairPOWItem['status']) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks/Notes</Label>
              <Input
                id="remarks"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                placeholder="Optional notes..."
              />
            </div>
          </div>

          <DialogFooter className="border-t pt-4 mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Update Repair POW Item
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
