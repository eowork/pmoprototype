import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../ui/dialog';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Textarea } from '../../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { MEDailyLog, MELogEntry } from '../../types/METypes';
import { toast } from 'sonner@2.0.3';

interface MELogEntryDialogProps {
  projectId: string;
  onClose: () => void;
  onSubmit: (logEntry: Omit<MEDailyLog, 'id' | 'createdAt' | 'updatedAt'>) => Promise<{ success: boolean; error?: string; data?: MEDailyLog }>;
  editingLog?: MEDailyLog;
}

export function MELogEntryDialog({ projectId, onClose, onSubmit, editingLog }: MELogEntryDialogProps) {
  const [formData, setFormData] = useState<MELogEntry>({
    date: editingLog?.date || new Date().toISOString().split('T')[0],
    physicalProgress: editingLog?.physicalProgress || 0,
    financialProgress: editingLog?.financialProgress || 0,
    accomplishments: editingLog?.accomplishments.join('\n') || '',
    issues: editingLog?.issues.join('\n') || '',
    weather: editingLog?.weather || 'sunny',
    laborCount: editingLog?.laborCount || 0,
    equipmentStatus: editingLog?.equipmentStatus || 'operational',
    notes: editingLog?.notes || ''
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const accomplishments = formData.accomplishments
        .split('\n')
        .map(item => item.trim())
        .filter(item => item.length > 0);

      const issues = formData.issues
        .split('\n')
        .map(item => item.trim())
        .filter(item => item.length > 0);

      const logEntry: Omit<MEDailyLog, 'id' | 'createdAt' | 'updatedAt'> = {
        projectId,
        date: formData.date,
        physicalProgress: Number(formData.physicalProgress),
        financialProgress: Number(formData.financialProgress),
        accomplishments,
        issues,
        weather: formData.weather as any,
        laborCount: Number(formData.laborCount),
        equipmentStatus: formData.equipmentStatus as any,
        notes: formData.notes,
        createdBy: 'current-user' // Replace with actual user ID
      };

      const result = await onSubmit(logEntry);

      if (result.success) {
        toast.success(editingLog ? 'Log entry updated successfully' : 'Log entry added successfully');
        onClose();
      } else {
        toast.error(result.error || 'Failed to save log entry');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Error submitting log entry:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof MELogEntry, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent 
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        aria-describedby="me-log-dialog-description"
      >
        <DialogHeader>
          <DialogTitle id="me-log-dialog-title">
            {editingLog ? 'Edit Daily Log Entry' : 'Add Daily Log Entry'}
          </DialogTitle>
          <DialogDescription id="me-log-dialog-description">
            Record daily monitoring and evaluation data for the project.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weather">Weather</Label>
              <Select value={formData.weather} onValueChange={(value) => handleInputChange('weather', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select weather" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sunny">Sunny</SelectItem>
                  <SelectItem value="cloudy">Cloudy</SelectItem>
                  <SelectItem value="rainy">Rainy</SelectItem>
                  <SelectItem value="stormy">Stormy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="physicalProgress">Physical Progress (%)</Label>
              <Input
                id="physicalProgress"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.physicalProgress}
                onChange={(e) => handleInputChange('physicalProgress', Number(e.target.value))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="financialProgress">Financial Progress (%)</Label>
              <Input
                id="financialProgress"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.financialProgress}
                onChange={(e) => handleInputChange('financialProgress', Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="laborCount">Labor Count</Label>
              <Input
                id="laborCount"
                type="number"
                min="0"
                value={formData.laborCount}
                onChange={(e) => handleInputChange('laborCount', Number(e.target.value))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="equipmentStatus">Equipment Status</Label>
              <Select value={formData.equipmentStatus} onValueChange={(value) => handleInputChange('equipmentStatus', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="operational">Operational</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="down">Down</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accomplishments">Accomplishments (one per line)</Label>
            <Textarea
              id="accomplishments"
              value={formData.accomplishments}
              onChange={(e) => handleInputChange('accomplishments', e.target.value)}
              placeholder="List daily accomplishments, one per line..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="issues">Issues/Challenges (one per line)</Label>
            <Textarea
              id="issues"
              value={formData.issues}
              onChange={(e) => handleInputChange('issues', e.target.value)}
              placeholder="List any issues or challenges, one per line..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Any additional notes or observations..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : editingLog ? 'Update Entry' : 'Add Entry'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}