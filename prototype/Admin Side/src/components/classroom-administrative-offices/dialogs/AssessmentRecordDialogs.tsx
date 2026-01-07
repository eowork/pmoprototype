import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { ScrollArea } from '../../ui/scroll-area';
import { Separator } from '../../ui/separator';
import { toast } from 'sonner@2.0.3';
import { X, Save, Star } from 'lucide-react';
import { cn } from '../../ui/utils';

// ============================================
// Classroom Assessment Record Dialog
// ============================================
interface ClassroomAssessmentRecord {
  id?: string;
  buildingName: string;
  roomNumber: string;
  subject: string;
  roomType: string;
  college: string;
  semester: string;
  academicYear: string;
  numberOfStudents: number;
  schedule: string;
  dateOfAssessment: string;
  assessor: string;
  position: string;
  
  functionality?: {
    accessibility: number;
    ventilation: number;
    noiseLevel: number;
  };
  utility?: {
    electricity: number;
    lighting: number;
    internetConnectivity: number;
  };
  sanitation?: {
    cleanliness: number;
    wasteDisposal: number;
    odor: number;
    comfortRoomAccess: number;
    pwdFriendlyFacilities: number;
  };
  equipment?: {
    projectorTvMonitor: number;
    speakersMic: number;
  };
  furnitureFixtures?: {
    chairsDesks: number;
    teachersTable: number;
    whiteboardBlackboard: number;
  };
  space?: {
    roomCapacity: number;
    layout: number;
    storage: number;
  };
  disasterPreparedness?: {
    emergencyExits: number;
    earthquakePreparedness: number;
    floodSafety: number;
    safetySignages: number;
  };
  
  overallScore: number;
  overallCondition: string;
  remarks: string;
  recommendingActions: string;
  status?: string;
}

interface ClassroomRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: ClassroomAssessmentRecord | null;
  onSubmit: (data: ClassroomAssessmentRecord) => void;
  colleges: Array<{ code: string; name: string }>;
  mode: 'add' | 'edit' | 'view';
}

export function ClassroomRecordDialog({
  open,
  onOpenChange,
  record,
  onSubmit,
  colleges,
  mode
}: ClassroomRecordDialogProps) {
  const [formData, setFormData] = useState<ClassroomAssessmentRecord>({
    buildingName: '',
    roomNumber: '',
    subject: '',
    roomType: 'Lecture',
    college: colleges[0]?.code || 'CED',
    semester: 'First Semester',
    academicYear: '2023-2024',
    numberOfStudents: 0,
    schedule: '',
    dateOfAssessment: new Date().toISOString().split('T')[0],
    assessor: '',
    position: '',
    overallScore: 0,
    overallCondition: 'Good',
    remarks: '',
    recommendingActions: '',
    functionality: { accessibility: 4, ventilation: 4, noiseLevel: 4 },
    utility: { electricity: 4, lighting: 4, internetConnectivity: 4 },
    sanitation: { cleanliness: 4, wasteDisposal: 4, odor: 4, comfortRoomAccess: 4, pwdFriendlyFacilities: 4 },
    equipment: { projectorTvMonitor: 4, speakersMic: 4 },
    furnitureFixtures: { chairsDesks: 4, teachersTable: 4, whiteboardBlackboard: 4 },
    space: { roomCapacity: 4, layout: 4, storage: 4 },
    disasterPreparedness: { emergencyExits: 4, earthquakePreparedness: 4, floodSafety: 4, safetySignages: 4 }
  });

  useEffect(() => {
    if (open && record) {
      setFormData(record);
    } else if (open && !record) {
      setFormData({
        buildingName: '',
        roomNumber: '',
        subject: '',
        roomType: 'Lecture',
        college: colleges[0]?.code || 'CED',
        semester: 'First Semester',
        academicYear: '2023-2024',
        numberOfStudents: 0,
        schedule: '',
        dateOfAssessment: new Date().toISOString().split('T')[0],
        assessor: '',
        position: '',
        overallScore: 0,
        overallCondition: 'Good',
        remarks: '',
        recommendingActions: '',
        functionality: { accessibility: 4, ventilation: 4, noiseLevel: 4 },
        utility: { electricity: 4, lighting: 4, internetConnectivity: 4 },
        sanitation: { cleanliness: 4, wasteDisposal: 4, odor: 4, comfortRoomAccess: 4, pwdFriendlyFacilities: 4 },
        equipment: { projectorTvMonitor: 4, speakersMic: 4 },
        furnitureFixtures: { chairsDesks: 4, teachersTable: 4, whiteboardBlackboard: 4 },
        space: { roomCapacity: 4, layout: 4, storage: 4 },
        disasterPreparedness: { emergencyExits: 4, earthquakePreparedness: 4, floodSafety: 4, safetySignages: 4 }
      });
    }
  }, [open, record, colleges]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.buildingName.trim()) {
      toast.error('Please enter a building name');
      return;
    }

    if (!formData.roomNumber.trim()) {
      toast.error('Please enter a room number');
      return;
    }

    onSubmit(formData);
    toast.success(mode === 'add' ? 'Assessment record created successfully' : 'Assessment record updated successfully');
    onOpenChange(false);
  };

  const renderRating = (value: number, onChange: (val: number) => void, disabled: boolean = false) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            disabled={disabled}
            onClick={() => onChange(rating)}
            className={cn(
              "w-7 h-7 rounded flex items-center justify-center transition-all",
              value >= rating 
                ? "bg-amber-400 text-white hover:bg-amber-500" 
                : "bg-slate-100 text-slate-400 hover:bg-slate-200",
              disabled && "cursor-not-allowed opacity-50"
            )}
          >
            <Star className={cn("w-3.5 h-3.5", value >= rating && "fill-current")} />
          </button>
        ))}
        <span className="ml-2 text-sm text-slate-600">{value}/5</span>
      </div>
    );
  };

  const isViewMode = mode === 'view';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[900px] max-h-[95vh] bg-white border-0 shadow-2xl rounded-lg overflow-hidden [&>button]:hidden">
        <DialogHeader className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-900 text-white -m-6 px-8 py-6 mb-0 relative">
          <Button
            onClick={() => onOpenChange(false)}
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 h-8 w-8 p-0 text-white hover:bg-white/10 hover:text-white rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
          <DialogTitle className="text-xl pr-12">
            {mode === 'add' ? 'New Classroom Assessment' : mode === 'edit' ? 'Edit Assessment Record' : 'View Assessment Record'}
          </DialogTitle>
          <DialogDescription className="text-sm text-blue-100 mt-2 sr-only">
            {mode === 'view' ? 'View detailed information' : 'Fill in the assessment details'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1 max-h-[calc(95vh-180px)] px-6 pt-6">
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-base text-slate-900 border-b border-slate-200 pb-2">Basic Information</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="buildingName">Building Name *</Label>
                    <Input
                      id="buildingName"
                      value={formData.buildingName}
                      onChange={(e) => setFormData({ ...formData, buildingName: e.target.value })}
                      disabled={isViewMode}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="roomNumber">Room Number *</Label>
                    <Input
                      id="roomNumber"
                      value={formData.roomNumber}
                      onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                      disabled={isViewMode}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      disabled={isViewMode}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="roomType">Room Type</Label>
                    <Select value={formData.roomType} onValueChange={(value) => setFormData({ ...formData, roomType: value })} disabled={isViewMode}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Lecture">Lecture</SelectItem>
                        <SelectItem value="Laboratory">Laboratory</SelectItem>
                        <SelectItem value="Seminar Room">Seminar Room</SelectItem>
                        <SelectItem value="Others">Others</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="college">College *</Label>
                    <Select value={formData.college} onValueChange={(value) => setFormData({ ...formData, college: value })} disabled={isViewMode}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {colleges.map((college) => (
                          <SelectItem key={college.code} value={college.code}>
                            {college.code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="semester">Semester</Label>
                    <Select value={formData.semester} onValueChange={(value) => setFormData({ ...formData, semester: value })} disabled={isViewMode}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="First Semester">First Semester</SelectItem>
                        <SelectItem value="Second Semester">Second Semester</SelectItem>
                        <SelectItem value="Summer">Summer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="academicYear">Academic Year</Label>
                    <Input
                      id="academicYear"
                      value={formData.academicYear}
                      onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                      disabled={isViewMode}
                      placeholder="e.g., 2023-2024"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="numberOfStudents">Number of Students</Label>
                    <Input
                      id="numberOfStudents"
                      type="number"
                      value={formData.numberOfStudents}
                      onChange={(e) => setFormData({ ...formData, numberOfStudents: parseInt(e.target.value) || 0 })}
                      disabled={isViewMode}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="schedule">Schedule</Label>
                    <Input
                      id="schedule"
                      value={formData.schedule}
                      onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                      disabled={isViewMode}
                      placeholder="e.g., MWF 8:00-9:00 AM"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfAssessment">Date of Assessment</Label>
                    <Input
                      id="dateOfAssessment"
                      type="date"
                      value={formData.dateOfAssessment}
                      onChange={(e) => setFormData({ ...formData, dateOfAssessment: e.target.value })}
                      disabled={isViewMode}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assessor">Assessor</Label>
                    <Input
                      id="assessor"
                      value={formData.assessor}
                      onChange={(e) => setFormData({ ...formData, assessor: e.target.value })}
                      disabled={isViewMode}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <Input
                      id="position"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      disabled={isViewMode}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Assessment Ratings */}
              <div className="space-y-4">
                <h3 className="text-base text-slate-900 border-b border-slate-200 pb-2">Assessment Criteria (1-5 Scale)</h3>
                
                {/* Functionality */}
                <div className="space-y-3">
                  <h4 className="text-sm text-slate-700">Functionality</h4>
                  <div className="space-y-2 pl-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Accessibility</Label>
                      {renderRating(
                        formData.functionality?.accessibility || 4,
                        (val) => setFormData({ ...formData, functionality: { ...formData.functionality!, accessibility: val } }),
                        isViewMode
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Ventilation</Label>
                      {renderRating(
                        formData.functionality?.ventilation || 4,
                        (val) => setFormData({ ...formData, functionality: { ...formData.functionality!, ventilation: val } }),
                        isViewMode
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Noise Level</Label>
                      {renderRating(
                        formData.functionality?.noiseLevel || 4,
                        (val) => setFormData({ ...formData, functionality: { ...formData.functionality!, noiseLevel: val } }),
                        isViewMode
                      )}
                    </div>
                  </div>
                </div>

                {/* Utility */}
                <div className="space-y-3">
                  <h4 className="text-sm text-slate-700">Utility</h4>
                  <div className="space-y-2 pl-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Electricity</Label>
                      {renderRating(
                        formData.utility?.electricity || 4,
                        (val) => setFormData({ ...formData, utility: { ...formData.utility!, electricity: val } }),
                        isViewMode
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Lighting</Label>
                      {renderRating(
                        formData.utility?.lighting || 4,
                        (val) => setFormData({ ...formData, utility: { ...formData.utility!, lighting: val } }),
                        isViewMode
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Internet Connectivity</Label>
                      {renderRating(
                        formData.utility?.internetConnectivity || 4,
                        (val) => setFormData({ ...formData, utility: { ...formData.utility!, internetConnectivity: val } }),
                        isViewMode
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Overall Assessment */}
              <div className="space-y-4">
                <h3 className="text-base text-slate-900 border-b border-slate-200 pb-2">Overall Assessment</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="overallScore">Overall Score (Out of 5)</Label>
                    <Input
                      id="overallScore"
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={formData.overallScore}
                      onChange={(e) => setFormData({ ...formData, overallScore: parseFloat(e.target.value) || 0 })}
                      disabled={isViewMode}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="overallCondition">Overall Condition</Label>
                    <Select value={formData.overallCondition} onValueChange={(value) => setFormData({ ...formData, overallCondition: value })} disabled={isViewMode}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Excellent">Excellent</SelectItem>
                        <SelectItem value="Good">Good</SelectItem>
                        <SelectItem value="Need Improvement">Need Improvement</SelectItem>
                        <SelectItem value="Unusable">Unusable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="remarks">Remarks</Label>
                  <Textarea
                    id="remarks"
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    disabled={isViewMode}
                    rows={3}
                    placeholder="Enter observations or comments"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recommendingActions">Recommending Actions</Label>
                  <Textarea
                    id="recommendingActions"
                    value={formData.recommendingActions}
                    onChange={(e) => setFormData({ ...formData, recommendingActions: e.target.value })}
                    disabled={isViewMode}
                    rows={3}
                    placeholder="Enter recommended improvements or actions"
                  />
                </div>
              </div>
            </div>
          </ScrollArea>

          {!isViewMode && (
            <DialogFooter className="border-t border-slate-200 px-6 py-4 mt-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                {mode === 'add' ? 'Create Record' : 'Save Changes'}
              </Button>
            </DialogFooter>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Administrative Office Assessment Record Dialog
// ============================================
interface AdminOfficeAssessmentRecord {
  id?: string;
  officeName: string;
  department: string;
  buildingName: string;
  officeLocation: string;
  officeType: string;
  campus: string;
  staffCount: number;
  clientCapacity: number;
  dateOfAssessment: string;
  assessor: string;
  position: string;
  
  functionality?: any;
  utility?: any;
  sanitation?: any;
  equipmentTechnology?: any;
  furnitureFixtures?: any;
  spaceLayout?: any;
  safetySecurity?: any;
  
  overallScore: number;
  overallCondition: string;
  remarks: string;
  recommendingActions: string;
  status?: string;
}

interface AdminOfficeRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: AdminOfficeAssessmentRecord | null;
  onSubmit: (data: AdminOfficeAssessmentRecord) => void;
  departments: Array<{ code: string; name: string }>;
  mode: 'add' | 'edit' | 'view';
}

export function AdminOfficeRecordDialog({
  open,
  onOpenChange,
  record,
  onSubmit,
  departments,
  mode
}: AdminOfficeRecordDialogProps) {
  const [formData, setFormData] = useState<AdminOfficeAssessmentRecord>({
    officeName: '',
    department: departments[0]?.code || 'REG',
    buildingName: '',
    officeLocation: '',
    officeType: 'Service Office',
    campus: 'CSU Main Campus',
    staffCount: 0,
    clientCapacity: 0,
    dateOfAssessment: new Date().toISOString().split('T')[0],
    assessor: '',
    position: '',
    overallScore: 0,
    overallCondition: 'Good',
    remarks: '',
    recommendingActions: ''
  });

  useEffect(() => {
    if (open && record) {
      setFormData(record);
    } else if (open && !record) {
      setFormData({
        officeName: '',
        department: departments[0]?.code || 'REG',
        buildingName: '',
        officeLocation: '',
        officeType: 'Service Office',
        campus: 'CSU Main Campus',
        staffCount: 0,
        clientCapacity: 0,
        dateOfAssessment: new Date().toISOString().split('T')[0],
        assessor: '',
        position: '',
        overallScore: 0,
        overallCondition: 'Good',
        remarks: '',
        recommendingActions: ''
      });
    }
  }, [open, record, departments]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.officeName.trim()) {
      toast.error('Please enter an office name');
      return;
    }

    onSubmit(formData);
    toast.success(mode === 'add' ? 'Assessment record created successfully' : 'Assessment record updated successfully');
    onOpenChange(false);
  };

  const isViewMode = mode === 'view';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[900px] max-h-[95vh] bg-white border-0 shadow-2xl rounded-lg overflow-hidden [&>button]:hidden">
        <DialogHeader className="bg-gradient-to-r from-emerald-900 via-green-900 to-teal-900 text-white -m-6 px-8 py-6 mb-0 relative">
          <Button
            onClick={() => onOpenChange(false)}
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 h-8 w-8 p-0 text-white hover:bg-white/10 hover:text-white rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
          <DialogTitle className="text-xl pr-12">
            {mode === 'add' ? 'New Office Assessment' : mode === 'edit' ? 'Edit Assessment Record' : 'View Assessment Record'}
          </DialogTitle>
          <DialogDescription className="text-sm text-emerald-100 mt-2 sr-only">
            {mode === 'view' ? 'View detailed information' : 'Fill in the assessment details'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1 max-h-[calc(95vh-180px)] px-6 pt-6">
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-base text-slate-900 border-b border-slate-200 pb-2">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="officeName">Office Name *</Label>
                    <Input
                      id="officeName"
                      value={formData.officeName}
                      onChange={(e) => setFormData({ ...formData, officeName: e.target.value })}
                      disabled={isViewMode}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
                    <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })} disabled={isViewMode}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.code} value={dept.code}>
                            {dept.code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="buildingName">Building Name</Label>
                    <Input
                      id="buildingName"
                      value={formData.buildingName}
                      onChange={(e) => setFormData({ ...formData, buildingName: e.target.value })}
                      disabled={isViewMode}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="officeLocation">Office Location</Label>
                    <Input
                      id="officeLocation"
                      value={formData.officeLocation}
                      onChange={(e) => setFormData({ ...formData, officeLocation: e.target.value })}
                      disabled={isViewMode}
                      placeholder="e.g., Ground Floor, Room 101"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="officeType">Office Type</Label>
                    <Select value={formData.officeType} onValueChange={(value) => setFormData({ ...formData, officeType: value })} disabled={isViewMode}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Service Office">Service Office</SelectItem>
                        <SelectItem value="Administrative Office">Administrative Office</SelectItem>
                        <SelectItem value="Executive Office">Executive Office</SelectItem>
                        <SelectItem value="Support Office">Support Office</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="campus">Campus</Label>
                    <Select value={formData.campus} onValueChange={(value) => setFormData({ ...formData, campus: value })} disabled={isViewMode}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CSU Main Campus">CSU Main Campus</SelectItem>
                        <SelectItem value="CSU Cabadbaran Campus">CSU Cabadbaran Campus</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="staffCount">Staff Count</Label>
                    <Input
                      id="staffCount"
                      type="number"
                      value={formData.staffCount}
                      onChange={(e) => setFormData({ ...formData, staffCount: parseInt(e.target.value) || 0 })}
                      disabled={isViewMode}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientCapacity">Client Capacity</Label>
                    <Input
                      id="clientCapacity"
                      type="number"
                      value={formData.clientCapacity}
                      onChange={(e) => setFormData({ ...formData, clientCapacity: parseInt(e.target.value) || 0 })}
                      disabled={isViewMode}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfAssessment">Date of Assessment</Label>
                    <Input
                      id="dateOfAssessment"
                      type="date"
                      value={formData.dateOfAssessment}
                      onChange={(e) => setFormData({ ...formData, dateOfAssessment: e.target.value })}
                      disabled={isViewMode}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assessor">Assessor</Label>
                    <Input
                      id="assessor"
                      value={formData.assessor}
                      onChange={(e) => setFormData({ ...formData, assessor: e.target.value })}
                      disabled={isViewMode}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Overall Assessment */}
              <div className="space-y-4">
                <h3 className="text-base text-slate-900 border-b border-slate-200 pb-2">Overall Assessment</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="overallScore">Overall Score (Out of 5)</Label>
                    <Input
                      id="overallScore"
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={formData.overallScore}
                      onChange={(e) => setFormData({ ...formData, overallScore: parseFloat(e.target.value) || 0 })}
                      disabled={isViewMode}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="overallCondition">Overall Condition</Label>
                    <Select value={formData.overallCondition} onValueChange={(value) => setFormData({ ...formData, overallCondition: value })} disabled={isViewMode}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Excellent">Excellent</SelectItem>
                        <SelectItem value="Good">Good</SelectItem>
                        <SelectItem value="Need Improvement">Need Improvement</SelectItem>
                        <SelectItem value="Poor">Poor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="remarks">Remarks</Label>
                  <Textarea
                    id="remarks"
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    disabled={isViewMode}
                    rows={3}
                    placeholder="Enter observations or comments"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recommendingActions">Recommending Actions</Label>
                  <Textarea
                    id="recommendingActions"
                    value={formData.recommendingActions}
                    onChange={(e) => setFormData({ ...formData, recommendingActions: e.target.value })}
                    disabled={isViewMode}
                    rows={3}
                    placeholder="Enter recommended improvements or actions"
                  />
                </div>
              </div>
            </div>
          </ScrollArea>

          {!isViewMode && (
            <DialogFooter className="border-t border-slate-200 px-6 py-4 mt-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                <Save className="w-4 h-4 mr-2" />
                {mode === 'add' ? 'Create Record' : 'Save Changes'}
              </Button>
            </DialogFooter>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
