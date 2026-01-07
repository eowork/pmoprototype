import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Separator } from '../../ui/separator';
import { toast } from 'sonner@2.0.3';
import { X, AlertTriangle, Info, ChevronLeft, ChevronRight } from 'lucide-react';

// ============================================
// Prioritization Matrix Item Interface
// ============================================
export interface PrioritizationMatrixItem {
  id: string;
  title: string;
  location: string;
  campus: string;
  college: string;
  category: string;
  assessmentDate: string;
  assessor: string;
  
  criteriaScores: {
    safety_compliance: number;
    functionality_impact: number;
    frequency_of_use: number;
    number_of_beneficiaries: number;
    cost_efficiency: number;
    strategic_importance: number;
    disaster_resilience: number;
  };
  
  weightedScores: {
    safety_compliance: number;
    functionality_impact: number;
    frequency_of_use: number;
    number_of_beneficiaries: number;
    cost_efficiency: number;
    strategic_importance: number;
    disaster_resilience: number;
  };
  
  totalWeightedScore: number;
  priorityLevel: 'High' | 'Medium' | 'Low';
  estimatedCost: number;
  estimatedBeneficiaries: number;
  urgency: string;
  
  description: string;
  justification: string;
  comments?: string;
  
  status: 'Planning' | 'Under Review' | 'Approved' | 'In Progress' | 'Completed' | 'On Hold';
  dateCreated: string;
  lastModified: string;
}

interface MatrixCriterion {
  id: string;
  name: string;
  description: string;
  weight: number;
  ratingGuide: Record<number, string>;
}

// ============================================
// Prioritization Matrix Dialog (4-Step Wizard)
// ============================================
interface PrioritizationMatrixDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: PrioritizationMatrixItem | null;
  onSave: (data: Omit<PrioritizationMatrixItem, 'id' | 'dateCreated' | 'lastModified'>) => void;
  matrixCriteria: MatrixCriterion[];
}

export function PrioritizationMatrixDialog({
  open,
  onOpenChange,
  editingItem,
  onSave,
  matrixCriteria
}: PrioritizationMatrixDialogProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Omit<PrioritizationMatrixItem, 'id' | 'dateCreated' | 'lastModified'>>({
    title: '',
    location: '',
    campus: 'CSU Main Campus',
    college: 'CED',
    category: 'Infrastructure',
    assessmentDate: new Date().toISOString().split('T')[0],
    assessor: '',
    
    criteriaScores: {
      safety_compliance: 1,
      functionality_impact: 1,
      frequency_of_use: 1,
      number_of_beneficiaries: 1,
      cost_efficiency: 1,
      strategic_importance: 1,
      disaster_resilience: 1
    },
    
    weightedScores: {
      safety_compliance: 0,
      functionality_impact: 0,
      frequency_of_use: 0,
      number_of_beneficiaries: 0,
      cost_efficiency: 0,
      strategic_importance: 0,
      disaster_resilience: 0
    },
    
    totalWeightedScore: 0,
    priorityLevel: 'Low',
    estimatedCost: 0,
    estimatedBeneficiaries: 0,
    urgency: 'Within 90 days',
    
    description: '',
    justification: '',
    comments: '',
    
    status: 'Planning'
  });

  useEffect(() => {
    if (open && editingItem) {
      setFormData(editingItem);
      setCurrentStep(1);
    } else if (!open) {
      setCurrentStep(1);
      setFormData({
        title: '',
        location: '',
        campus: 'CSU Main Campus',
        college: 'CED',
        category: 'Infrastructure',
        assessmentDate: new Date().toISOString().split('T')[0],
        assessor: '',
        criteriaScores: {
          safety_compliance: 1,
          functionality_impact: 1,
          frequency_of_use: 1,
          number_of_beneficiaries: 1,
          cost_efficiency: 1,
          strategic_importance: 1,
          disaster_resilience: 1
        },
        weightedScores: {
          safety_compliance: 0,
          functionality_impact: 0,
          frequency_of_use: 0,
          number_of_beneficiaries: 0,
          cost_efficiency: 0,
          strategic_importance: 0,
          disaster_resilience: 0
        },
        totalWeightedScore: 0,
        priorityLevel: 'Low',
        estimatedCost: 0,
        estimatedBeneficiaries: 0,
        urgency: 'Within 90 days',
        description: '',
        justification: '',
        comments: '',
        status: 'Planning'
      });
    }
  }, [open, editingItem]);

  // Auto-calculate weighted scores and priority level
  useEffect(() => {
    const scores = formData.criteriaScores;
    const newWeightedScores: any = {};
    let total = 0;

    matrixCriteria.forEach(criterion => {
      const score = scores[criterion.id as keyof typeof scores] || 1;
      const weighted = (score / 5) * (criterion.weight / 100) * 5;
      newWeightedScores[criterion.id] = parseFloat(weighted.toFixed(2));
      total += weighted;
    });

    const totalWeightedScore = parseFloat(total.toFixed(2));
    let priorityLevel: 'High' | 'Medium' | 'Low' = 'Low';
    
    if (totalWeightedScore >= 3.5) {
      priorityLevel = 'High';
    } else if (totalWeightedScore >= 2.5) {
      priorityLevel = 'Medium';
    }

    setFormData(prev => ({
      ...prev,
      weightedScores: newWeightedScores,
      totalWeightedScore,
      priorityLevel
    }));
  }, [formData.criteriaScores, matrixCriteria]);

  const handleSubmit = () => {
    if (!formData.title || !formData.location || !formData.assessor) {
      toast.error('Please fill in all required fields');
      return;
    }

    onSave(formData);
    onOpenChange(false);
  };

  const goToNextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {[1, 2, 3, 4].map(step => (
        <React.Fragment key={step}>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm transition-colors ${
            currentStep === step 
              ? 'bg-amber-600 text-white'
              : currentStep > step
              ? 'bg-emerald-500 text-white'
              : 'bg-slate-200 text-slate-600'
          }`}>
            {step}
          </div>
          {step < 4 && (
            <div className={`h-0.5 w-12 transition-colors ${
              currentStep > step ? 'bg-emerald-500' : 'bg-slate-200'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-gray-900">
            {editingItem ? 'Edit' : 'New'} Prioritization Assessment
          </DialogTitle>
          <DialogDescription>
            Rate repair needs using the 7-criteria weighted scoring system
          </DialogDescription>
        </DialogHeader>

        {renderStepIndicator()}

        <div className="space-y-4">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-base text-gray-900">Step 1: Basic Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="title">Project/Repair Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., COE Laboratory Equipment Upgrade"
                  />
                </div>

                <div>
                  <Label htmlFor="campus">Campus *</Label>
                  <Select value={formData.campus} onValueChange={(value) => setFormData({ ...formData, campus: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CSU Main Campus">CSU Main Campus</SelectItem>
                      <SelectItem value="CSU Cabadbaran Campus">CSU Cabadbaran Campus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="college">College/Department *</Label>
                  <Select value={formData.college} onValueChange={(value) => setFormData({ ...formData, college: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CED">CED</SelectItem>
                      <SelectItem value="CMNS">CMNS</SelectItem>
                      <SelectItem value="CAA">CAA</SelectItem>
                      <SelectItem value="COFES">COFES</SelectItem>
                      <SelectItem value="CCIS">CCIS</SelectItem>
                      <SelectItem value="CEGS">CEGS</SelectItem>
                      <SelectItem value="CHASS">CHASS</SelectItem>
                      <SelectItem value="SOM">SOM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2">
                  <Label htmlFor="location">Location/Room *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Engineering Building, Room 301"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                      <SelectItem value="Equipment">Equipment</SelectItem>
                      <SelectItem value="Space">Space/Facility</SelectItem>
                      <SelectItem value="Safety">Safety & Security</SelectItem>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="assessmentDate">Assessment Date *</Label>
                  <Input
                    id="assessmentDate"
                    type="date"
                    value={formData.assessmentDate}
                    onChange={(e) => setFormData({ ...formData, assessmentDate: e.target.value })}
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="assessor">Assessor Name *</Label>
                  <Input
                    id="assessor"
                    value={formData.assessor}
                    onChange={(e) => setFormData({ ...formData, assessor: e.target.value })}
                    placeholder="e.g., Facilities Management Team"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Criteria Rating */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-base text-gray-900">Step 2: Assessment Criteria (Rate 1-5)</h3>
              <p className="text-sm text-slate-600">Rate each criterion based on the guidelines below</p>

              <div className="space-y-4">
                {matrixCriteria.map((criterion) => (
                  <Card key={criterion.id} className="border-slate-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-sm text-gray-900">{criterion.name}</CardTitle>
                          <CardDescription className="text-xs mt-1">{criterion.description}</CardDescription>
                        </div>
                        <Badge variant="outline" className="ml-2">Weight: {criterion.weight}%</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Label className="text-sm min-w-16">Rating:</Label>
                          <Select 
                            value={formData.criteriaScores[criterion.id as keyof typeof formData.criteriaScores]?.toString()} 
                            onValueChange={(value) => setFormData({
                              ...formData,
                              criteriaScores: {
                                ...formData.criteriaScores,
                                [criterion.id]: parseInt(value)
                              }
                            })}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[1, 2, 3, 4, 5].map(rating => (
                                <SelectItem key={rating} value={rating.toString()}>
                                  {rating} - {rating === 5 ? 'Highest' : rating === 1 ? 'Lowest' : 'Moderate'}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <span className="text-sm text-slate-600">
                            Weighted: {formData.weightedScores[criterion.id as keyof typeof formData.weightedScores]?.toFixed(2) || '0.00'}
                          </span>
                        </div>
                        
                        <div className="bg-slate-50 rounded p-3 space-y-1">
                          <p className="text-xs text-slate-500 mb-2">Rating Guide:</p>
                          {Object.entries(criterion.ratingGuide).map(([rating, desc]) => (
                            <div key={rating} className="flex items-start gap-2 text-xs">
                              <span className={`min-w-5 h-5 rounded-full flex items-center justify-center text-white ${
                                parseInt(rating) === 5 ? 'bg-red-500' :
                                parseInt(rating) === 4 ? 'bg-amber-500' :
                                parseInt(rating) === 3 ? 'bg-blue-500' :
                                parseInt(rating) === 2 ? 'bg-green-500' : 'bg-slate-500'
                              }`}>
                                {rating}
                              </span>
                              <span className="text-slate-700">{desc}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <p className="text-3xl text-amber-700">{formData.totalWeightedScore.toFixed(2)}</p>
                        <p className="text-sm text-amber-700 mt-1">Total Weighted Score</p>
                        <p className="text-xs text-amber-600 mt-0.5">Out of 5.0</p>
                      </div>
                      <Separator orientation="vertical" className="h-16" />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-700">High Priority:</span>
                          <span className="text-slate-600">Score ≥ 3.5</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-700">Medium Priority:</span>
                          <span className="text-slate-600">Score 2.5 - 3.4</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-700">Low Priority:</span>
                          <span className="text-slate-600">Score &lt; 2.5</span>
                        </div>
                      </div>
                    </div>
                    <Badge className={
                      formData.priorityLevel === 'High' ? 'bg-red-100 text-red-700 border-red-200' :
                      formData.priorityLevel === 'Medium' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                      'bg-green-100 text-green-700 border-green-200'
                    }>
                      {formData.priorityLevel} Priority
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 3: Additional Details */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-base text-gray-900">Step 3: Additional Details</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="estimatedCost">Estimated Cost (₱) *</Label>
                  <Input
                    id="estimatedCost"
                    type="number"
                    value={formData.estimatedCost}
                    onChange={(e) => setFormData({ ...formData, estimatedCost: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="estimatedBeneficiaries">Estimated Beneficiaries *</Label>
                  <Input
                    id="estimatedBeneficiaries"
                    type="number"
                    value={formData.estimatedBeneficiaries}
                    onChange={(e) => setFormData({ ...formData, estimatedBeneficiaries: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label htmlFor="urgency">Urgency Timeline *</Label>
                  <Select value={formData.urgency} onValueChange={(value) => setFormData({ ...formData, urgency: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Within 30 days">Within 30 days</SelectItem>
                      <SelectItem value="Within 60 days">Within 60 days</SelectItem>
                      <SelectItem value="Within 90 days">Within 90 days</SelectItem>
                      <SelectItem value="Within 120 days">Within 120 days</SelectItem>
                      <SelectItem value="Next budget cycle">Next budget cycle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Planning">Planning</SelectItem>
                      <SelectItem value="Under Review">Under Review</SelectItem>
                      <SelectItem value="Approved">Approved</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="On Hold">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the repair need or project"
                    rows={3}
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="justification">Justification *</Label>
                  <Textarea
                    id="justification"
                    value={formData.justification}
                    onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                    placeholder="Explain why this repair should be prioritized"
                    rows={3}
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="comments">Additional Comments (Optional)</Label>
                  <Textarea
                    id="comments"
                    value={formData.comments}
                    onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                    placeholder="Any additional notes or comments"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review & Submit */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-base text-gray-900">Step 4: Review & Submit</h3>
              
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-base text-gray-900">Assessment Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-slate-600">Title:</p>
                      <p className="text-gray-900">{formData.title}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Campus:</p>
                      <p className="text-gray-900">{formData.campus}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Location:</p>
                      <p className="text-gray-900">{formData.location}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">College:</p>
                      <p className="text-gray-900">{formData.college}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Category:</p>
                      <p className="text-gray-900">{formData.category}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Assessor:</p>
                      <p className="text-gray-900">{formData.assessor}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="bg-amber-50 rounded p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl text-amber-700">{formData.totalWeightedScore.toFixed(2)}/5.0</p>
                        <p className="text-sm text-amber-600 mt-1">Total Weighted Score</p>
                      </div>
                      <Badge className={
                        formData.priorityLevel === 'High' ? 'bg-red-100 text-red-700 border-red-200' :
                        formData.priorityLevel === 'Medium' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                        'bg-green-100 text-green-700 border-green-200'
                      }>
                        {formData.priorityLevel} Priority
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-slate-600">Estimated Cost:</p>
                      <p className="text-gray-900">₱{formData.estimatedCost.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Beneficiaries:</p>
                      <p className="text-gray-900">{formData.estimatedBeneficiaries}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Urgency:</p>
                      <p className="text-gray-900">{formData.urgency}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Status:</p>
                      <p className="text-gray-900">{formData.status}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div className="flex gap-2">
            {currentStep > 1 && (
              <Button variant="outline" onClick={goToPreviousStep}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            {currentStep < 4 ? (
              <Button onClick={goToNextStep} className="bg-amber-600 hover:bg-amber-700">
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-700">
                {editingItem ? 'Update' : 'Create'} Assessment
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Delete Confirmation Dialog
// ============================================
interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  itemTitle: string;
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  itemTitle
}: DeleteConfirmationDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-gray-900">Delete Assessment</DialogTitle>
              <DialogDescription>
                This action cannot be undone
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-slate-700">
            Are you sure you want to delete "<span className="text-gray-900">{itemTitle}</span>"?
          </p>
          <p className="text-sm text-slate-600 mt-2">
            All assessment data will be permanently removed from the system.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            Delete Assessment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
