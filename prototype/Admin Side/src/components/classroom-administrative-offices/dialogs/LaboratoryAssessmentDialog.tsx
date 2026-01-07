import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Badge } from '../../ui/badge';
import { Card, CardContent } from '../../ui/card';
import { Progress } from '../../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { toast } from 'sonner@2.0.3';
import { X, TrendingUp, Award, AlertCircle, FileText } from 'lucide-react';

interface LaboratoryAssessmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: any;
  onUpdate?: (data: any) => void;
  mode: 'view' | 'edit';
}

export function LaboratoryAssessmentDialog({
  open,
  onOpenChange,
  record,
  onUpdate,
  mode
}: LaboratoryAssessmentDialogProps) {
  const [isEditing, setIsEditing] = useState(mode === 'edit');
  const [formData, setFormData] = useState(record || {});

  useEffect(() => {
    if (open && record) {
      setFormData(record);
      setIsEditing(mode === 'edit');
    }
  }, [open, record, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdate) {
      onUpdate(formData);
      toast.success('Assessment record updated successfully');
      onOpenChange(false);
    }
  };

  const getRatingInterpretation = (score: number) => {
    if (score >= 90) return { label: 'Excellent', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
    if (score >= 75) return { label: 'Good', color: 'text-blue-600 bg-blue-50 border-blue-200' };
    if (score >= 60) return { label: 'Needs Improvement', color: 'text-amber-600 bg-amber-50 border-amber-200' };
    return { label: 'Unsatisfactory', color: 'text-red-600 bg-red-50 border-red-200' };
  };

  if (!record) return null;

  const interpretation = getRatingInterpretation(record.overallWeightedScore || record.overallScore || 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[1000px] max-h-[95vh] bg-white border-0 shadow-2xl rounded-lg overflow-hidden [&>button]:hidden">
        <DialogHeader className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-900 text-white -m-6 px-8 py-6 mb-0 relative">
          <Button
            onClick={() => onOpenChange(false)}
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 h-8 w-8 p-0 text-white hover:bg-white/10 hover:text-white rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
          <DialogTitle className="text-xl pr-12">Laboratory Assessment Details</DialogTitle>
          <DialogDescription className="text-sm text-blue-100 mt-2">
            {record.buildingName} - {record.laboratoryNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto max-h-[calc(95vh-180px)] p-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-100">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="scores">Scores & Ratings</TabsTrigger>
              <TabsTrigger value="remarks">Remarks</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6 mt-6">
              {/* Overall Performance Card */}
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg text-slate-900">Overall Assessment</h3>
                    <Badge className={interpretation.color + ' border'}>
                      {interpretation.label}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                      <div className="flex items-center justify-center mb-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="text-3xl text-blue-600 mb-1">
                        {(record.overallWeightedScore || record.overallScore || 0).toFixed(2)}
                      </div>
                      <div className="text-xs text-slate-600">Weighted Score</div>
                    </div>

                    <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                      <div className="flex items-center justify-center mb-2">
                        <Award className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="text-3xl text-emerald-600 mb-1">
                        {record.overallCondition || 'N/A'}
                      </div>
                      <div className="text-xs text-slate-600">Condition</div>
                    </div>

                    <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                      <div className="flex items-center justify-center mb-2">
                        <FileText className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="text-3xl text-purple-600 mb-1">
                        {record.dateOfAssessment || 'N/A'}
                      </div>
                      <div className="text-xs text-slate-600">Date Assessed</div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600">Overall Progress</span>
                      <span className="text-slate-900">{(record.overallWeightedScore || 0).toFixed(1)}%</span>
                    </div>
                    <Progress value={record.overallWeightedScore || 0} className="h-3" />
                  </div>
                </CardContent>
              </Card>

              {/* Basic Information */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h4 className="text-base text-slate-900 border-b pb-2">Laboratory Information</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-slate-600">Building Name</Label>
                      <p className="text-sm text-slate-900 mt-1">{record.buildingName}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-slate-600">Laboratory Number</Label>
                      <p className="text-sm text-slate-900 mt-1">{record.laboratoryNumber}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-slate-600">Subject</Label>
                      <p className="text-sm text-slate-900 mt-1">{record.subject}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-slate-600">Laboratory Type</Label>
                      <p className="text-sm text-slate-900 mt-1">{record.labType}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-slate-600">College</Label>
                      <p className="text-sm text-slate-900 mt-1">{record.college}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-slate-600">Campus</Label>
                      <p className="text-sm text-slate-900 mt-1">{record.campus}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-slate-600">Academic Year</Label>
                      <p className="text-sm text-slate-900 mt-1">{record.academicYear}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-slate-600">Semester</Label>
                      <p className="text-sm text-slate-900 mt-1">{record.semester}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Assessor Information */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h4 className="text-base text-slate-900 border-b pb-2">Assessor Details</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-slate-600">Assessed By</Label>
                      <p className="text-sm text-slate-900 mt-1">{record.assessor}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-slate-600">Position</Label>
                      <p className="text-sm text-slate-900 mt-1">{record.position}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-slate-600">Date of Assessment</Label>
                      <p className="text-sm text-slate-900 mt-1">{record.dateOfAssessment}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-slate-600">Number of Students</Label>
                      <p className="text-sm text-slate-900 mt-1">{record.numberOfStudents || 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Scores Tab */}
            <TabsContent value="scores" className="space-y-4 mt-6">
              {record.categoryScores && record.categoryScores.map((category: any, index: number) => (
                <Card key={index} className="border border-slate-200">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm text-slate-900">{category.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        Weight: {category.weight}%
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div className="text-center p-3 bg-slate-50 rounded">
                        <div className="text-lg text-blue-600">{category.totalRating}</div>
                        <div className="text-xs text-slate-600">Total Rating</div>
                      </div>
                      <div className="text-center p-3 bg-slate-50 rounded">
                        <div className="text-lg text-emerald-600">{category.categoryScore.toFixed(1)}%</div>
                        <div className="text-xs text-slate-600">Category Score</div>
                      </div>
                      <div className="text-center p-3 bg-slate-50 rounded">
                        <div className="text-lg text-purple-600">{category.weightedScore.toFixed(2)}</div>
                        <div className="text-xs text-slate-600">Weighted Score</div>
                      </div>
                    </div>

                    <Progress value={category.categoryScore} className="h-2" />
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Remarks Tab */}
            <TabsContent value="remarks" className="space-y-4 mt-6">
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="generalRemarks">General Remarks / Observations *</Label>
                    <Textarea
                      id="generalRemarks"
                      value={formData.remarks || ''}
                      onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                      placeholder="Enter general observations about the laboratory..."
                      rows={5}
                      className="mt-2"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="recommendingActions">Recommending Actions / Improvements *</Label>
                    <Textarea
                      id="recommendingActions"
                      value={formData.recommendingActions || ''}
                      onChange={(e) => setFormData({ ...formData, recommendingActions: e.target.value })}
                      placeholder="Enter recommended actions for improvement..."
                      rows={5}
                      className="mt-2"
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                      Save Changes
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-5">
                      <Label className="text-sm text-slate-600">General Remarks / Observations</Label>
                      <p className="text-sm text-slate-900 mt-2 whitespace-pre-wrap">
                        {record.remarks || 'No remarks provided'}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-5">
                      <Label className="text-sm text-slate-600">Recommending Actions / Improvements</Label>
                      <p className="text-sm text-slate-900 mt-2 whitespace-pre-wrap">
                        {record.recommendingActions || 'No recommendations provided'}
                      </p>
                    </CardContent>
                  </Card>

                  {mode === 'view' && onUpdate && (
                    <div className="flex justify-end pt-4">
                      <Button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700">
                        Edit Remarks
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {!isEditing && (
          <DialogFooter className="border-t bg-slate-50 -m-6 mt-0 px-8 py-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default LaboratoryAssessmentDialog;
