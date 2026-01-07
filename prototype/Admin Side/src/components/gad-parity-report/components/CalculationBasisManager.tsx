import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Badge } from '../../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Calculator, Plus, Edit, Trash2, History, Eye, Save, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { CalculationBasisManagerProps, CalculationBasis } from '../types';

export function CalculationBasisManager({
  entries,
  onSave,
  onEdit,
  onDelete,
  category,
  year
}: CalculationBasisManagerProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingEntry, setEditingEntry] = useState<CalculationBasis | null>(null);
  const [viewingEntry, setViewingEntry] = useState<CalculationBasis | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ show: boolean; entry: CalculationBasis | null }>({
    show: false,
    entry: null
  });

  const [formData, setFormData] = useState({
    methodology: '',
    formula: '',
    assumptions: [''],
    dataSource: '',
    notes: ''
  });

  // Reset form
  const resetForm = () => {
    setFormData({
      methodology: '',
      formula: '',
      assumptions: [''],
      dataSource: '',
      notes: ''
    });
  };

  // Handle form submission
  const handleSubmit = () => {
    const trimmedAssumptions = formData.assumptions.filter(a => a.trim() !== '');
    
    if (!formData.methodology.trim() || !formData.formula.trim() || !formData.dataSource.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (trimmedAssumptions.length === 0) {
      toast.error('Please add at least one assumption');
      return;
    }

    const entryData = {
      category,
      year,
      methodology: formData.methodology.trim(),
      formula: formData.formula.trim(),
      assumptions: trimmedAssumptions.map(a => a.trim()),
      dataSource: formData.dataSource.trim(),
      notes: formData.notes.trim() || undefined,
      version: editingEntry ? editingEntry.version + 1 : 1
    };

    if (editingEntry) {
      onEdit(editingEntry.id, entryData);
      toast.success('Calculation basis updated successfully');
    } else {
      onSave(entryData);
      toast.success('Calculation basis added successfully');
    }

    resetForm();
    setShowAddDialog(false);
    setEditingEntry(null);
  };

  // Handle edit
  const handleEdit = (entry: CalculationBasis) => {
    setEditingEntry(entry);
    setFormData({
      methodology: entry.methodology,
      formula: entry.formula,
      assumptions: entry.assumptions.length > 0 ? entry.assumptions : [''],
      dataSource: entry.dataSource,
      notes: entry.notes || ''
    });
    setShowAddDialog(true);
  };

  // Handle assumption changes
  const updateAssumption = (index: number, value: string) => {
    const newAssumptions = [...formData.assumptions];
    newAssumptions[index] = value;
    setFormData({ ...formData, assumptions: newAssumptions });
  };

  const addAssumption = () => {
    setFormData({ ...formData, assumptions: [...formData.assumptions, ''] });
  };

  const removeAssumption = (index: number) => {
    if (formData.assumptions.length > 1) {
      const newAssumptions = formData.assumptions.filter((_, i) => i !== index);
      setFormData({ ...formData, assumptions: newAssumptions });
    }
  };

  // Handle delete
  const handleDeleteConfirm = () => {
    if (deleteConfirmation.entry) {
      onDelete(deleteConfirmation.entry.id);
      setDeleteConfirmation({ show: false, entry: null });
      toast.success('Calculation basis deleted successfully');
    }
  };

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calculator className="h-5 w-5 text-slate-600" />
            <CardTitle className="text-lg font-semibold text-slate-900">
              Basis for Calculations
            </CardTitle>
          </div>
          <Button
            size="sm"
            onClick={() => {
              resetForm();
              setEditingEntry(null);
              setShowAddDialog(true);
            }}
            className="bg-slate-900 hover:bg-slate-800"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Entry
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {entries.length > 0 ? (
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-semibold text-slate-900">Methodology</TableHead>
                  <TableHead className="font-semibold text-slate-900">Formula</TableHead>
                  <TableHead className="font-semibold text-slate-900">Data Source</TableHead>
                  <TableHead className="font-semibold text-slate-900">Version</TableHead>
                  <TableHead className="font-semibold text-slate-900">Last Modified</TableHead>
                  <TableHead className="text-center font-semibold text-slate-900">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div className="font-medium text-slate-900">{entry.methodology}</div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-slate-100 px-2 py-1 rounded font-mono">
                        {entry.formula}
                      </code>
                    </TableCell>
                    <TableCell className="text-slate-700">{entry.dataSource}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        v{entry.version}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-700">
                      <div>
                        <div>{new Date(entry.lastModified).toLocaleDateString()}</div>
                        <div className="text-xs text-slate-500">by {entry.modifiedBy}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewingEntry(entry)}
                          className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-700"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(entry)}
                          className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-700"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirmation({ show: true, entry })}
                          className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <Calculator className="h-12 w-12 mx-auto mb-2 text-slate-300" />
            <p>No calculation methodologies defined yet</p>
            <p className="text-sm">Add calculation basis to document your methodology</p>
          </div>
        )}
      </CardContent>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEntry ? 'Edit Calculation Basis' : 'Add Calculation Basis'}
            </DialogTitle>
            <DialogDescription>
              Define the methodology and assumptions used for parity score calculations.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Methodology Name *
              </label>
              <Input
                placeholder="e.g., Female-to-Male Ratio Calculation"
                value={formData.methodology}
                onChange={(e) => setFormData({ ...formData, methodology: e.target.value })}
                maxLength={100}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Mathematical Formula *
              </label>
              <Input
                placeholder="e.g., (Female Count / Male Count) or (Female % / Male %)"
                value={formData.formula}
                onChange={(e) => setFormData({ ...formData, formula: e.target.value })}
                maxLength={200}
                className="font-mono text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Key Assumptions *
              </label>
              {formData.assumptions.map((assumption, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    placeholder={`Assumption ${index + 1}`}
                    value={assumption}
                    onChange={(e) => updateAssumption(index, e.target.value)}
                    maxLength={200}
                  />
                  {formData.assumptions.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAssumption(index)}
                      className="px-2 hover:bg-red-100 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={addAssumption}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Assumption
              </Button>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Data Source *
              </label>
              <Input
                placeholder="e.g., University Registrar Records, Academic Year 2024"
                value={formData.dataSource}
                onChange={(e) => setFormData({ ...formData, dataSource: e.target.value })}
                maxLength={150}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Additional Notes
              </label>
              <Textarea
                placeholder="Any additional context, limitations, or important notes..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                maxLength={500}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddDialog(false);
                setEditingEntry(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="bg-slate-900 hover:bg-slate-800">
              <Save className="h-4 w-4 mr-2" />
              {editingEntry ? 'Update' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={!!viewingEntry} onOpenChange={() => setViewingEntry(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Calculation Basis Details</DialogTitle>
            <DialogDescription>
              Detailed view of calculation methodology and assumptions
            </DialogDescription>
          </DialogHeader>

          {viewingEntry && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-slate-900 mb-1">Methodology</h4>
                <p className="text-slate-700">{viewingEntry.methodology}</p>
              </div>

              <div>
                <h4 className="font-medium text-slate-900 mb-1">Formula</h4>
                <code className="text-sm bg-slate-100 px-3 py-2 rounded block font-mono">
                  {viewingEntry.formula}
                </code>
              </div>

              <div>
                <h4 className="font-medium text-slate-900 mb-1">Assumptions</h4>
                <ul className="list-disc list-inside space-y-1">
                  {viewingEntry.assumptions.map((assumption, index) => (
                    <li key={index} className="text-slate-700 text-sm">{assumption}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-slate-900 mb-1">Data Source</h4>
                <p className="text-slate-700">{viewingEntry.dataSource}</p>
              </div>

              {viewingEntry.notes && (
                <div>
                  <h4 className="font-medium text-slate-900 mb-1">Notes</h4>
                  <p className="text-slate-700 text-sm">{viewingEntry.notes}</p>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Version {viewingEntry.version}</span>
                  <span>
                    Modified on {new Date(viewingEntry.lastModified).toLocaleDateString()} by {viewingEntry.modifiedBy}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingEntry(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmation.show} onOpenChange={(open) => 
        setDeleteConfirmation({ show: open, entry: deleteConfirmation.entry })
      }>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Calculation Basis</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteConfirmation.entry?.methodology}"? 
              This will remove the calculation methodology and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}