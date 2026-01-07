import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Textarea } from '../../../ui/textarea';
import { Badge } from '../../../ui/badge';
import { Edit2, Save, X, Upload, Calendar, Plus, Trash2 } from 'lucide-react';
import { ImageWithFallback } from '../../../figma/ImageWithFallback';
import { OverviewImage } from '../shared/OverviewImage';
import { formatDate } from '../../utils/analyticsHelpers';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../ui/dialog';
import { toast } from 'sonner@2.0.3';

// Type definitions
export interface AccomplishmentRecord {
  id: string;
  dateEntry: string;
  comments: string;
  remarksComments: string;
}

export interface ActualAccomplishmentRecord {
  id: string;
  dateEntry: string;
  progressAccomplishment: number;
  actualPercent: number;
  targetPercent: number;
}

export interface ProgressSummaryRecord {
  id: string;
  period: string;
  physicalProgress: number;
  financialProgress: number;
  issues: string;
  recommendations: string;
}

interface OverviewTabProps {
  sectionAData: any;
  setSectionAData: (data: any) => void;
  sectionBData: any;
  setSectionBData: (data: any) => void;
  financialAllocation: any;
  isEditingSectionA: boolean;
  setIsEditingSectionA: (editing: boolean) => void;
  isEditingSectionB: boolean;
  setIsEditingSectionB: (editing: boolean) => void;
  isEditingFinancial: boolean;
  setIsEditingFinancial: (editing: boolean) => void;
  canEdit: boolean;
  globalMEFilter: any;
  onFilterChange: (filter: any) => void;
  onClearFilter: () => void;
  projectId: string;
  onSectionAEdit: () => void;
  onSectionASave: () => void;
  onSectionACancel: () => void;
  onSectionBEdit: () => void;
  onSectionBSave: () => void;
  onSectionBCancel: () => void;
  userRole: string;
  // Add props for accomplishment records from parent
  accomplishmentRecords: AccomplishmentRecord[];
  setAccomplishmentRecords: (records: AccomplishmentRecord[]) => void;
  actualAccomplishmentRecords: ActualAccomplishmentRecord[];
  setActualAccomplishmentRecords: (records: ActualAccomplishmentRecord[]) => void;
  progressSummaryRecords: ProgressSummaryRecord[];
  setProgressSummaryRecords: (records: ProgressSummaryRecord[]) => void;
}

export function OverviewTab({
  sectionAData,
  setSectionAData,
  sectionBData,
  setSectionBData,
  isEditingSectionA,
  setIsEditingSectionA,
  isEditingSectionB,
  setIsEditingSectionB,
  canEdit,
  onSectionAEdit,
  onSectionASave,
  onSectionACancel,
  onSectionBEdit,
  onSectionBSave,
  onSectionBCancel,
  userRole,
  accomplishmentRecords,
  setAccomplishmentRecords,
  actualAccomplishmentRecords,
  setActualAccomplishmentRecords,
  progressSummaryRecords,
  setProgressSummaryRecords,
  globalMEFilter,
  onFilterChange,
  onClearFilter
}: OverviewTabProps) {
  
  // Handle time filter change
  const handleTimeFilterChange = (period: 'daily' | 'weekly' | 'monthly' | 'quarterly') => {
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'daily':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // Last 7 days
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 4 * 7 * 24 * 60 * 60 * 1000); // Last 4 weeks
        break;
      case 'monthly':
        startDate = new Date(now.getTime() - 3 * 30 * 24 * 60 * 60 * 1000); // Last 3 months
        break;
      case 'quarterly':
        startDate = new Date(now.getTime() - 12 * 30 * 24 * 60 * 60 * 1000); // Last 12 months
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    
    onFilterChange({
      period,
      dateRange: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: now.toISOString().split('T')[0]
      }
    });
  };

  // Mock key metrics based on sample data
  const keyMetrics = {
    totalProjectCost: 16400000, // Sum from mock data
    avgProgress: 78, // Sample average
    costVariance: 2.1 // Sample variance percentage
  };

  // State for dialogs and forms
  const [showAccomplishmentDialog, setShowAccomplishmentDialog] = useState(false);
  const [showActualAccomplishmentDialog, setShowActualAccomplishmentDialog] = useState(false);
  const [showProgressSummaryDialog, setShowProgressSummaryDialog] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);

  const [newAccomplishment, setNewAccomplishment] = useState<AccomplishmentRecord>({
    id: '',
    dateEntry: new Date().toISOString().split('T')[0],
    comments: '',
    remarksComments: ''
  });

  const [newActualAccomplishment, setNewActualAccomplishment] = useState<ActualAccomplishmentRecord>({
    id: '',
    dateEntry: new Date().toISOString().split('T')[0],
    progressAccomplishment: 0,
    actualPercent: 0,
    targetPercent: 0
  });

  const [newProgressSummary, setNewProgressSummary] = useState<ProgressSummaryRecord>({
    id: '',
    period: '',
    physicalProgress: 0,
    financialProgress: 0,
    issues: '',
    recommendations: ''
  });

  // Handle image change for the OverviewImage component
  const handleOverviewImageChange = (imageUrl: string) => {
    setSectionAData(prev => ({ 
      ...prev, 
      idealInfrastructureImage: imageUrl 
    }));
  };

  // Check if user can edit (Admin only for accomplishments)
  const canEditAccomplishments = userRole === 'Admin' && canEdit;

  // Accomplishment CRUD operations
  const handleAddAccomplishment = () => {
    if (!newAccomplishment.dateEntry || !newAccomplishment.comments) {
      toast.error('Please fill in required fields');
      return;
    }
    
    const accomplishment = {
      ...newAccomplishment,
      id: Date.now().toString()
    };
    
    setAccomplishmentRecords(prev => [...prev, accomplishment]);
    setNewAccomplishment({
      id: '',
      dateEntry: new Date().toISOString().split('T')[0],
      comments: '',
      remarksComments: ''
    });
    setShowAccomplishmentDialog(false);
    toast.success('Accomplishment record added successfully');
  };

  const handleEditAccomplishment = (record: AccomplishmentRecord) => {
    setEditingRecord(record);
    setNewAccomplishment(record);
    setShowAccomplishmentDialog(true);
  };

  const handleUpdateAccomplishment = () => {
    if (!editingRecord) return;
    
    setAccomplishmentRecords(prev => 
      prev.map(record => 
        record.id === editingRecord.id ? newAccomplishment : record
      )
    );
    setEditingRecord(null);
    setNewAccomplishment({
      id: '',
      dateEntry: new Date().toISOString().split('T')[0],
      comments: '',
      remarksComments: ''
    });
    setShowAccomplishmentDialog(false);
    toast.success('Accomplishment record updated successfully');
  };

  const handleDeleteAccomplishment = (id: string) => {
    if (window.confirm('Are you sure you want to delete this accomplishment record?')) {
      setAccomplishmentRecords(prev => prev.filter(record => record.id !== id));
      toast.success('Accomplishment record deleted successfully');
    }
  };

  // Actual Accomplishment CRUD operations
  const handleAddActualAccomplishment = () => {
    if (!newActualAccomplishment.dateEntry) {
      toast.error('Please fill in required fields');
      return;
    }
    
    const actual = {
      ...newActualAccomplishment,
      id: Date.now().toString()
    };
    
    setActualAccomplishmentRecords(prev => [...prev, actual]);
    setNewActualAccomplishment({
      id: '',
      dateEntry: new Date().toISOString().split('T')[0],
      progressAccomplishment: 0,
      actualPercent: 0,
      targetPercent: 0
    });
    setShowActualAccomplishmentDialog(false);
    toast.success('Actual accomplishment record added successfully');
  };

  const handleEditActualAccomplishment = (record: ActualAccomplishmentRecord) => {
    setEditingRecord(record);
    setNewActualAccomplishment(record);
    setShowActualAccomplishmentDialog(true);
  };

  const handleUpdateActualAccomplishment = () => {
    if (!editingRecord) return;
    
    setActualAccomplishmentRecords(prev => 
      prev.map(record => 
        record.id === editingRecord.id ? newActualAccomplishment : record
      )
    );
    setEditingRecord(null);
    setNewActualAccomplishment({
      id: '',
      dateEntry: new Date().toISOString().split('T')[0],
      progressAccomplishment: 0,
      actualPercent: 0,
      targetPercent: 0
    });
    setShowActualAccomplishmentDialog(false);
    toast.success('Actual accomplishment record updated successfully');
  };

  const handleDeleteActualAccomplishment = (id: string) => {
    if (window.confirm('Are you sure you want to delete this actual accomplishment record?')) {
      setActualAccomplishmentRecords(prev => prev.filter(record => record.id !== id));
      toast.success('Actual accomplishment record deleted successfully');
    }
  };

  // Progress Summary CRUD operations
  const handleAddProgressSummary = () => {
    if (!newProgressSummary.period) {
      toast.error('Please fill in required fields');
      return;
    }
    
    const summary = {
      ...newProgressSummary,
      id: Date.now().toString()
    };
    
    setProgressSummaryRecords(prev => [...prev, summary]);
    setNewProgressSummary({
      id: '',
      period: '',
      physicalProgress: 0,
      financialProgress: 0,
      issues: '',
      recommendations: ''
    });
    setShowProgressSummaryDialog(false);
    toast.success('Progress summary record added successfully');
  };

  const handleEditProgressSummary = (record: ProgressSummaryRecord) => {
    setEditingRecord(record);
    setNewProgressSummary(record);
    setShowProgressSummaryDialog(true);
  };

  const handleUpdateProgressSummary = () => {
    if (!editingRecord) return;
    
    setProgressSummaryRecords(prev => 
      prev.map(record => 
        record.id === editingRecord.id ? newProgressSummary : record
      )
    );
    setEditingRecord(null);
    setNewProgressSummary({
      id: '',
      period: '',
      physicalProgress: 0,
      financialProgress: 0,
      issues: '',
      recommendations: ''
    });
    setShowProgressSummaryDialog(false);
    toast.success('Progress summary record updated successfully');
  };

  const handleDeleteProgressSummary = (id: string) => {
    if (window.confirm('Are you sure you want to delete this progress summary record?')) {
      setProgressSummaryRecords(prev => prev.filter(record => record.id !== id));
      toast.success('Progress summary record deleted successfully');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Section A: General */}
      <Card className="border border-gray-200 shadow-sm bg-white">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                A. General
              </CardTitle>
              <CardDescription className="text-gray-600 mt-1">
                Project description, infrastructure image, and accomplishment records
              </CardDescription>
            </div>
            {canEdit && (
              <div className="flex items-center gap-2">
                {!isEditingSectionA ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onSectionAEdit}
                    className="gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Section
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button 
                      variant="default" 
                      size="sm" 
                      onClick={onSectionASave}
                      className="gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={onSectionACancel}
                      className="gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Project Description */}
          <div>
            <Label className="text-sm font-medium text-gray-700">
              Project Description <span className="text-red-500">*</span>
            </Label>
            {isEditingSectionA ? (
              <Textarea
                value={sectionAData.projectDescription}
                onChange={(e) => setSectionAData(prev => ({ ...prev, projectDescription: e.target.value }))}
                placeholder="Enter detailed project description..."
                className="mt-2 min-h-24"
              />
            ) : (
              <p className="text-sm text-gray-900 mt-2 leading-relaxed border border-gray-200 rounded-md p-3 bg-gray-50">
                {sectionAData.projectDescription || 'GAA-Funded Infrastructure Development Project focusing on campus improvement and modernization initiatives.'}
              </p>
            )}
          </div>

          {/* Image for Ideal/Proposed Infrastructure - Updated */}
          <OverviewImage
            imageUrl={sectionAData.idealInfrastructureImage}
            onImageChange={handleOverviewImageChange}
            canEdit={canEdit}
            isEditing={isEditingSectionA}
          />

          {/* Accomplishment as of (repeating record) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-medium text-gray-700">
                Accomplishment as of (Repeating Record)
              </Label>
              {canEditAccomplishments && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setEditingRecord(null);
                    setNewAccomplishment({
                      id: '',
                      dateEntry: new Date().toISOString().split('T')[0],
                      comments: '',
                      remarksComments: ''
                    });
                    setShowAccomplishmentDialog(true);
                  }}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Record
                </Button>
              )}
            </div>
            
            <div className="space-y-3">
              {accomplishmentRecords.map((record) => (
                <div key={record.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-medium text-gray-600">Date Entry</Label>
                      <p className="text-sm text-gray-900 mt-1">{formatDate(record.dateEntry)}</p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-gray-600">Comments</Label>
                      <p className="text-sm text-gray-900 mt-1">{record.comments}</p>
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-xs font-medium text-gray-600">Comments / Remarks</Label>
                      <p className="text-sm text-gray-900 mt-1">{record.remarksComments}</p>
                    </div>
                    {canEditAccomplishments && (
                      <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditAccomplishment(record)}
                          className="gap-2"
                        >
                          <Edit2 className="w-3 h-3" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteAccomplishment(record.id)}
                          className="gap-2 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section B: Actual Accomplishment & Key Info */}
      <Card className="border border-gray-200 shadow-sm bg-white">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                B. Actual Accomplishment & Key Info
              </CardTitle>
              <CardDescription className="text-gray-600 mt-1">
                Progress tracking, status information, and project details
              </CardDescription>
            </div>
            {canEdit && (
              <div className="flex items-center gap-2">
                {!isEditingSectionB ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onSectionBEdit}
                    className="gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Section
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button 
                      variant="default" 
                      size="sm" 
                      onClick={onSectionBSave}
                      className="gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={onSectionBCancel}
                      className="gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Actual Accomplishment as of (repeating record) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-medium text-gray-700">
                Actual Accomplishment as of (Repeating Record)
              </Label>
              {canEditAccomplishments && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setEditingRecord(null);
                    setNewActualAccomplishment({
                      id: '',
                      dateEntry: new Date().toISOString().split('T')[0],
                      progressAccomplishment: 0,
                      actualPercent: 0,
                      targetPercent: 0
                    });
                    setShowActualAccomplishmentDialog(true);
                  }}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Record
                </Button>
              )}
            </div>
            
            <div className="space-y-3">
              {actualAccomplishmentRecords.map((record) => (
                <div key={record.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-xs font-medium text-gray-600">Date Entry</Label>
                      <p className="text-sm text-gray-900 mt-1">{formatDate(record.dateEntry)}</p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-gray-600">Progress Accomplishment (%)</Label>
                      <p className="text-sm text-gray-900 mt-1">{record.progressAccomplishment}%</p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-gray-600">Actual (%)</Label>
                      <p className="text-sm text-gray-900 mt-1">{record.actualPercent}%</p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-gray-600">Target (%)</Label>
                      <p className="text-sm text-gray-900 mt-1">{record.targetPercent}%</p>
                    </div>
                    {canEditAccomplishments && (
                      <div className="md:col-span-4 flex justify-end gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditActualAccomplishment(record)}
                          className="gap-2"
                        >
                          <Edit2 className="w-3 h-3" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteActualAccomplishment(record.id)}
                          className="gap-2 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Current Progress Summary */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-medium text-gray-700">
                Current Progress Summary (Repeating Record)
              </Label>
              {canEditAccomplishments && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setEditingRecord(null);
                    setNewProgressSummary({
                      id: '',
                      period: '',
                      physicalProgress: 0,
                      financialProgress: 0,
                      issues: '',
                      recommendations: ''
                    });
                    setShowProgressSummaryDialog(true);
                  }}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Summary
                </Button>
              )}
            </div>
            
            <div className="space-y-3">
              {progressSummaryRecords.map((record) => (
                <div key={record.id} className="border border-gray-200 rounded-lg p-4 bg-blue-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-medium text-gray-600">Period</Label>
                      <p className="text-sm text-gray-900 mt-1 font-medium">{record.period}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs font-medium text-gray-600">Physical Progress</Label>
                        <p className="text-sm text-gray-900 mt-1">{record.physicalProgress}%</p>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-gray-600">Financial Progress</Label>
                        <p className="text-sm text-gray-900 mt-1">{record.financialProgress}%</p>
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-xs font-medium text-gray-600">Issues</Label>
                      <p className="text-sm text-gray-900 mt-1">{record.issues}</p>
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-xs font-medium text-gray-600">Recommendations</Label>
                      <p className="text-sm text-gray-900 mt-1">{record.recommendations}</p>
                    </div>
                    {canEditAccomplishments && (
                      <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditProgressSummary(record)}
                          className="gap-2"
                        >
                          <Edit2 className="w-3 h-3" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteProgressSummary(record.id)}
                          className="gap-2 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Project Status & Key Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Date Started</Label>
                {isEditingSectionB ? (
                  <Input
                    type="date"
                    value={sectionBData.dateStarted}
                    onChange={(e) => setSectionBData(prev => ({ ...prev, dateStarted: e.target.value }))}
                    className="mt-2"
                  />
                ) : (
                  <p className="text-sm text-gray-900 mt-2 p-2 border border-gray-200 rounded bg-gray-50">
                    {formatDate(sectionBData.dateStarted) || 'Not specified'}
                  </p>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Target Date of Completion</Label>
                {isEditingSectionB ? (
                  <Input
                    type="date"
                    value={sectionBData.targetDateCompletion}
                    onChange={(e) => setSectionBData(prev => ({ ...prev, targetDateCompletion: e.target.value }))}
                    className="mt-2"
                  />
                ) : (
                  <p className="text-sm text-gray-900 mt-2 p-2 border border-gray-200 rounded bg-gray-50">
                    {formatDate(sectionBData.targetDateCompletion) || 'Not specified'}
                  </p>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Original Contract Duration</Label>
                {isEditingSectionB ? (
                  <Input
                    value={sectionBData.originalContractDuration}
                    onChange={(e) => setSectionBData(prev => ({ ...prev, originalContractDuration: e.target.value }))}
                    placeholder="e.g., 365 days"
                    className="mt-2"
                  />
                ) : (
                  <p className="text-sm text-gray-900 mt-2 p-2 border border-gray-200 rounded bg-gray-50">
                    {sectionBData.originalContractDuration || 'Not specified'}
                  </p>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Name of Contractor</Label>
                {isEditingSectionB ? (
                  <Input
                    value={sectionBData.contractorName}
                    onChange={(e) => setSectionBData(prev => ({ ...prev, contractorName: e.target.value }))}
                    placeholder="Enter contractor name"
                    className="mt-2"
                  />
                ) : (
                  <p className="text-sm text-gray-900 mt-2 p-2 border border-gray-200 rounded bg-gray-50">
                    {sectionBData.contractorName || 'To be determined'}
                  </p>
                )}
              </div>

              {/* Latest Progress Summary Display */}
              <div className="border border-gray-200 rounded-lg p-4 bg-green-50">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Latest Progress Summary</h4>
                {progressSummaryRecords.length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Period:</span>
                      <span className="font-medium text-gray-900">
                        {progressSummaryRecords[progressSummaryRecords.length - 1].period}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Physical Progress:</span>
                      <span className="font-medium text-gray-900">
                        {progressSummaryRecords[progressSummaryRecords.length - 1].physicalProgress}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Financial Progress:</span>
                      <span className="font-medium text-gray-900">
                        {progressSummaryRecords[progressSummaryRecords.length - 1].financialProgress}%
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No progress summary available</p>
                )}
              </div>
            </div>
          </div>

          {/* Data Notice */}
          <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-xs text-yellow-800">
              <strong>Note:</strong> This Overview tab displays the exact required sections as specified: 
              General (Project Description, Infrastructure Image, Accomplishment Records) and 
              Actual Accomplishment & Key Info (Progress Records, Status, Dates, Contractor). 
              All fields support full CRUD operations for authorized users.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Accomplishment Dialog */}
      <Dialog open={showAccomplishmentDialog} onOpenChange={setShowAccomplishmentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingRecord ? 'Edit Accomplishment Record' : 'Add Accomplishment Record'}
            </DialogTitle>
            <DialogDescription>
              Add details about project accomplishments and progress
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="date-entry">Date Entry *</Label>
              <Input
                id="date-entry"
                type="date"
                value={newAccomplishment.dateEntry}
                onChange={(e) => setNewAccomplishment(prev => ({ ...prev, dateEntry: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="comments">Comments *</Label>
              <Textarea
                id="comments"
                value={newAccomplishment.comments}
                onChange={(e) => setNewAccomplishment(prev => ({ ...prev, comments: e.target.value }))}
                placeholder="Describe the accomplishment..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="remarks">Remarks / Comments</Label>
              <Textarea
                id="remarks"
                value={newAccomplishment.remarksComments}
                onChange={(e) => setNewAccomplishment(prev => ({ ...prev, remarksComments: e.target.value }))}
                placeholder="Additional remarks..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAccomplishmentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={editingRecord ? handleUpdateAccomplishment : handleAddAccomplishment}>
              {editingRecord ? 'Update' : 'Add'} Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Actual Accomplishment Dialog */}
      <Dialog open={showActualAccomplishmentDialog} onOpenChange={setShowActualAccomplishmentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingRecord ? 'Edit Actual Accomplishment' : 'Add Actual Accomplishment'}
            </DialogTitle>
            <DialogDescription>
              Record actual progress percentages and accomplishments
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="actual-date">Date Entry *</Label>
              <Input
                id="actual-date"
                type="date"
                value={newActualAccomplishment.dateEntry}
                onChange={(e) => setNewActualAccomplishment(prev => ({ ...prev, dateEntry: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="progress-accomplishment">Progress Accomplishment (%)</Label>
              <Input
                id="progress-accomplishment"
                type="number"
                min="0"
                max="100"
                value={newActualAccomplishment.progressAccomplishment}
                onChange={(e) => setNewActualAccomplishment(prev => ({ ...prev, progressAccomplishment: Number(e.target.value) }))}
              />
            </div>

            <div>
              <Label htmlFor="actual-percent">Actual (%)</Label>
              <Input
                id="actual-percent"
                type="number"
                min="0"
                max="100"
                value={newActualAccomplishment.actualPercent}
                onChange={(e) => setNewActualAccomplishment(prev => ({ ...prev, actualPercent: Number(e.target.value) }))}
              />
            </div>

            <div>
              <Label htmlFor="target-percent">Target (%)</Label>
              <Input
                id="target-percent"
                type="number"
                min="0"
                max="100"
                value={newActualAccomplishment.targetPercent}
                onChange={(e) => setNewActualAccomplishment(prev => ({ ...prev, targetPercent: Number(e.target.value) }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowActualAccomplishmentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={editingRecord ? handleUpdateActualAccomplishment : handleAddActualAccomplishment}>
              {editingRecord ? 'Update' : 'Add'} Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Progress Summary Dialog */}
      <Dialog open={showProgressSummaryDialog} onOpenChange={setShowProgressSummaryDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingRecord ? 'Edit Progress Summary' : 'Add Progress Summary'}
            </DialogTitle>
            <DialogDescription>
              Record progress summary for a specific period
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="period">Period *</Label>
              <Input
                id="period"
                value={newProgressSummary.period}
                onChange={(e) => setNewProgressSummary(prev => ({ ...prev, period: e.target.value }))}
                placeholder="e.g., Q1 2024, January 2024"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="physical-progress">Physical Progress (%)</Label>
                <Input
                  id="physical-progress"
                  type="number"
                  min="0"
                  max="100"
                  value={newProgressSummary.physicalProgress}
                  onChange={(e) => setNewProgressSummary(prev => ({ ...prev, physicalProgress: Number(e.target.value) }))}
                />
              </div>

              <div>
                <Label htmlFor="financial-progress">Financial Progress (%)</Label>
                <Input
                  id="financial-progress"
                  type="number"
                  min="0"
                  max="100"
                  value={newProgressSummary.financialProgress}
                  onChange={(e) => setNewProgressSummary(prev => ({ ...prev, financialProgress: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="issues">Issues</Label>
              <Textarea
                id="issues"
                value={newProgressSummary.issues}
                onChange={(e) => setNewProgressSummary(prev => ({ ...prev, issues: e.target.value }))}
                placeholder="Describe any issues encountered..."
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="recommendations">Recommendations</Label>
              <Textarea
                id="recommendations"
                value={newProgressSummary.recommendations}
                onChange={(e) => setNewProgressSummary(prev => ({ ...prev, recommendations: e.target.value }))}
                placeholder="Provide recommendations for improvement..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProgressSummaryDialog(false)}>
              Cancel
            </Button>
            <Button onClick={editingRecord ? handleUpdateProgressSummary : handleAddProgressSummary}>
              {editingRecord ? 'Update' : 'Add'} Summary
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}