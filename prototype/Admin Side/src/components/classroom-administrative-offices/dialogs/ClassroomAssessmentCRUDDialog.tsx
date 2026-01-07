import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Badge } from '../../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { ScrollArea } from '../../ui/scroll-area';
import { Separator } from '../../ui/separator';
import { 
  Save, X, Eye, Edit2, Trash2, CheckCircle, AlertCircle,
  Building, Calendar, User, FileText, TrendingUp
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { FormSection, FormField, FormGrid } from '../components/FormSection';
import { 
  ClassroomAssessmentFormData,
  calculateAllCategoryScores,
  calculateOverallWeightedScore,
  getRatingInterpretation,
  getOverallCondition
} from '../utils/classroomWeightedScoring';

interface ClassroomAssessmentCRUDDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit' | 'view';
  record?: any;
  onSave: (data: any) => void;
  onDelete?: (id: string) => void;
  colleges: any[];
  campuses: string[];
  isAdmin?: boolean;
}

export function ClassroomAssessmentCRUDDialog({
  open,
  onOpenChange,
  mode,
  record,
  onSave,
  onDelete,
  colleges,
  campuses,
  isAdmin = false
}: ClassroomAssessmentCRUDDialogProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(mode === 'create' || mode === 'edit');
  
  // Helper function to convert old record format to new format
  const convertOldRecordToNewFormat = (oldRecord: any): ClassroomAssessmentFormData => {
    // If record already has the new format, return it
    if (oldRecord?.accessibility?.pwdFriendlyFacilities?.rating !== undefined) {
      return oldRecord;
    }
    
    // Convert old format to new format
    return {
      buildingName: oldRecord?.buildingName || '',
      roomNumber: oldRecord?.roomNumber || '',
      subject: oldRecord?.subject || '',
      roomType: oldRecord?.roomType || 'Lecture',
      customRoomType: oldRecord?.customRoomType || '',
      college: oldRecord?.college || 'CED',
      campus: oldRecord?.campus || 'CSU Main Campus',
      semester: oldRecord?.semester || 'First Semester',
      academicYear: oldRecord?.academicYear || '2023-2024',
      numberOfStudents: oldRecord?.numberOfStudents?.toString() || '',
      schedule: oldRecord?.schedule || '',
      dateOfAssessment: oldRecord?.dateOfAssessment || '',
      assessor: oldRecord?.assessor || '',
      position: oldRecord?.position || '',
      
      accessibility: {
        pwdFriendlyFacilities: { 
          rating: oldRecord?.sanitation?.pwdFriendlyFacilities || 1, 
          remarks: '' 
        },
        roomAccessibility: { 
          rating: oldRecord?.functionality?.accessibility || 1, 
          remarks: '' 
        },
        directionalSignages: { rating: 1, remarks: '' },
        pathways: { rating: 1, remarks: '' }
      },
      functionality: {
        flexibility: { rating: 1, remarks: '' },
        ventilation: { 
          rating: oldRecord?.functionality?.ventilation || 1, 
          remarks: '' 
        },
        noiseLevel: { 
          rating: oldRecord?.functionality?.noiseLevel || 1, 
          remarks: '' 
        }
      },
      utility: {
        electricity: { 
          rating: oldRecord?.utility?.electricity || 1, 
          remarks: '' 
        },
        lighting: { 
          rating: oldRecord?.utility?.lighting || 1, 
          remarks: '' 
        },
        internetConnectivity: { 
          rating: oldRecord?.utility?.internetConnectivity || 1, 
          remarks: '' 
        }
      },
      sanitation: {
        cleanliness: { 
          rating: oldRecord?.sanitation?.cleanliness || 1, 
          remarks: '' 
        },
        wasteDisposal: { 
          rating: oldRecord?.sanitation?.wasteDisposal || 1, 
          remarks: '' 
        },
        odor: { 
          rating: oldRecord?.sanitation?.odor || 1, 
          remarks: '' 
        },
        comfortRoomAccess: { 
          rating: oldRecord?.sanitation?.comfortRoomAccess || 1, 
          remarks: '' 
        }
      },
      equipment: {
        projectorTvMonitorSpeakersMic: { 
          rating: oldRecord?.equipment?.projectorTvMonitor || oldRecord?.equipment?.speakersMic || 1, 
          remarks: '' 
        }
      },
      furnitureFixtures: {
        chairsDesks: { 
          rating: oldRecord?.furnitureFixtures?.chairsDesks || 1, 
          remarks: '' 
        },
        neutralDesk: { rating: 1, remarks: '' },
        teachersTablePodium: { 
          rating: oldRecord?.furnitureFixtures?.teachersTable || 1, 
          remarks: '' 
        },
        whiteboardBlackboard: { 
          rating: oldRecord?.furnitureFixtures?.whiteboardBlackboard || 1, 
          remarks: '' 
        }
      },
      space: {
        roomCapacity: { 
          rating: oldRecord?.space?.roomCapacity || 1, 
          remarks: '' 
        },
        layout: { 
          rating: oldRecord?.space?.layout || 1, 
          remarks: '' 
        },
        storage: { 
          rating: oldRecord?.space?.storage || 1, 
          remarks: '' 
        }
      },
      disasterPreparedness: {
        emergencyExitsFireSafety: { 
          rating: oldRecord?.disasterPreparedness?.emergencyExits || 1, 
          remarks: '' 
        },
        earthquakePreparedness: { 
          rating: oldRecord?.disasterPreparedness?.earthquakePreparedness || 1, 
          remarks: '' 
        },
        floodSafety: { 
          rating: oldRecord?.disasterPreparedness?.floodSafety || 1, 
          remarks: '' 
        },
        safetySignages: { 
          rating: oldRecord?.disasterPreparedness?.safetySignages || 1, 
          remarks: '' 
        }
      },
      inclusivity: {
        privacyInComfortRooms: { rating: 1, remarks: '' },
        genderNeutralRestrooms: { rating: 1, remarks: '' },
        safeSpaces: { rating: 1, remarks: '' },
        classroomAssignmentSpecialNeeds: { rating: 1, remarks: '' }
      },
      
      remarks: oldRecord?.remarks || '',
      recommendingActions: oldRecord?.recommendingActions || ''
    };
  };
  
  const [formData, setFormData] = useState<ClassroomAssessmentFormData>({
    buildingName: '',
    roomNumber: '',
    subject: '',
    roomType: 'Lecture',
    customRoomType: '',
    college: 'CED',
    campus: 'CSU Main Campus',
    semester: 'First Semester',
    academicYear: '2023-2024',
    numberOfStudents: '',
    schedule: '',
    dateOfAssessment: '',
    assessor: '',
    position: '',
    
    accessibility: {
      pwdFriendlyFacilities: { rating: 1, remarks: '' },
      roomAccessibility: { rating: 1, remarks: '' },
      directionalSignages: { rating: 1, remarks: '' },
      pathways: { rating: 1, remarks: '' }
    },
    functionality: {
      flexibility: { rating: 1, remarks: '' },
      ventilation: { rating: 1, remarks: '' },
      noiseLevel: { rating: 1, remarks: '' }
    },
    utility: {
      electricity: { rating: 1, remarks: '' },
      lighting: { rating: 1, remarks: '' },
      internetConnectivity: { rating: 1, remarks: '' }
    },
    sanitation: {
      cleanliness: { rating: 1, remarks: '' },
      wasteDisposal: { rating: 1, remarks: '' },
      odor: { rating: 1, remarks: '' },
      comfortRoomAccess: { rating: 1, remarks: '' }
    },
    equipment: {
      projectorTvMonitorSpeakersMic: { rating: 1, remarks: '' }
    },
    furnitureFixtures: {
      chairsDesks: { rating: 1, remarks: '' },
      neutralDesk: { rating: 1, remarks: '' },
      teachersTablePodium: { rating: 1, remarks: '' },
      whiteboardBlackboard: { rating: 1, remarks: '' }
    },
    space: {
      roomCapacity: { rating: 1, remarks: '' },
      layout: { rating: 1, remarks: '' },
      storage: { rating: 1, remarks: '' }
    },
    disasterPreparedness: {
      emergencyExitsFireSafety: { rating: 1, remarks: '' },
      earthquakePreparedness: { rating: 1, remarks: '' },
      floodSafety: { rating: 1, remarks: '' },
      safetySignages: { rating: 1, remarks: '' }
    },
    inclusivity: {
      privacyInComfortRooms: { rating: 1, remarks: '' },
      genderNeutralRestrooms: { rating: 1, remarks: '' },
      safeSpaces: { rating: 1, remarks: '' },
      classroomAssignmentSpecialNeeds: { rating: 1, remarks: '' }
    },
    
    remarks: '',
    recommendingActions: ''
  });

  useEffect(() => {
    if (record && mode !== 'create') {
      const convertedRecord = convertOldRecordToNewFormat(record);
      setFormData(convertedRecord);
    }
  }, [record, mode]);

  useEffect(() => {
    setIsEditing(mode === 'create' || mode === 'edit');
  }, [mode]);

  const handleSave = () => {
    // Calculate scores
    const categoryScores = calculateAllCategoryScores(formData);
    const overallWeightedScore = calculateOverallWeightedScore(categoryScores);
    const ratingInterpretation = getRatingInterpretation(overallWeightedScore);
    const overallCondition = getOverallCondition(overallWeightedScore);

    const finalData = {
      ...formData,
      roomType: formData.roomType === 'Others' ? formData.customRoomType : formData.roomType,
      categoryScores,
      overallWeightedScore,
      ratingInterpretation,
      overallScore: overallWeightedScore,
      overallCondition
    };

    onSave(finalData);
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (onDelete && record?.id) {
      if (window.confirm('Are you sure you want to delete this assessment record?')) {
        onDelete(record.id);
        onOpenChange(false);
      }
    }
  };

  const renderRatingInput = (categoryKey: string, itemKey: string, label: string, description: string) => {
    const category = formData[categoryKey as keyof ClassroomAssessmentFormData] as any;
    const item = category[itemKey];
    
    return (
      <div className="space-y-3 p-4 border border-slate-200 rounded-lg bg-slate-50">
        <div>
          <Label className="text-sm text-slate-900">{label}</Label>
          <p className="text-xs text-slate-600 mt-1">{description}</p>
        </div>
        
        {isEditing ? (
          <>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      [categoryKey]: {
                        ...prev[categoryKey as keyof typeof prev],
                        [itemKey]: { ...item, rating }
                      }
                    }));
                  }}
                  className={`flex-1 h-10 rounded-md border-2 transition-all ${
                    item.rating === rating
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-slate-300 bg-white text-slate-700 hover:border-blue-400'
                  }`}
                >
                  {rating}
                </button>
              ))}
            </div>
            <Textarea
              value={item.remarks}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  [categoryKey]: {
                    ...prev[categoryKey as keyof typeof prev],
                    [itemKey]: { ...item, remarks: e.target.value }
                  }
                }));
              }}
              placeholder="Enter remarks/observations..."
              rows={2}
              className="text-sm"
            />
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-base">
                Rating: {item.rating}/5
              </Badge>
            </div>
            {item.remarks && (
              <p className="text-sm text-slate-700 bg-white p-3 rounded border border-slate-200">
                {item.remarks}
              </p>
            )}
          </>
        )}
      </div>
    );
  };

  const categoryScores = calculateAllCategoryScores(formData);
  const overallWeightedScore = calculateOverallWeightedScore(categoryScores);
  const overallCondition = getOverallCondition(overallWeightedScore);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[90vw] lg:max-w-[900px] max-h-[95vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                {mode === 'view' ? (
                  <Eye className="w-5 h-5 text-blue-600" />
                ) : mode === 'edit' ? (
                  <Edit2 className="w-5 h-5 text-blue-600" />
                ) : (
                  <FileText className="w-5 h-5 text-blue-600" />
                )}
              </div>
              <div>
                <DialogTitle className="text-xl text-slate-900">
                  {mode === 'create' ? 'New Classroom Assessment' : 
                   mode === 'edit' ? 'Edit Assessment Record' : 
                   'View Assessment Record'}
                </DialogTitle>
                {record?.id && (
                  <p className="text-sm text-slate-600 mt-1">ID: {record.id}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {mode === 'view' && isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
              {isEditing && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (mode === 'view') {
                        setIsEditing(false);
                      } else {
                        onOpenChange(false);
                      }
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </>
              )}
              {mode === 'view' && isAdmin && onDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <div className="px-6 pt-4 border-b border-slate-200">
            <TabsList className="grid w-full grid-cols-4 bg-slate-100">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="assessment">Assessment</TabsTrigger>
              <TabsTrigger value="scores">Scores</TabsTrigger>
              <TabsTrigger value="remarks">Remarks</TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="h-[calc(90vh-180px)]">
            <div className="p-6">
              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-0 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      Classroom Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormGrid columns={3}>
                      <FormField label="Building Name" required>
                        {isEditing ? (
                          <Input
                            value={formData.buildingName}
                            onChange={(e) => setFormData(prev => ({ ...prev, buildingName: e.target.value }))}
                            className="h-11"
                          />
                        ) : (
                          <p className="text-sm text-slate-900 p-2">{formData.buildingName || 'N/A'}</p>
                        )}
                      </FormField>

                      <FormField label="Room Number" required>
                        {isEditing ? (
                          <Input
                            value={formData.roomNumber}
                            onChange={(e) => setFormData(prev => ({ ...prev, roomNumber: e.target.value }))}
                            className="h-11"
                          />
                        ) : (
                          <p className="text-sm text-slate-900 p-2">{formData.roomNumber || 'N/A'}</p>
                        )}
                      </FormField>

                      <FormField label="Subject" required>
                        {isEditing ? (
                          <Input
                            value={formData.subject}
                            onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                            className="h-11"
                          />
                        ) : (
                          <p className="text-sm text-slate-900 p-2">{formData.subject || 'N/A'}</p>
                        )}
                      </FormField>
                    </FormGrid>

                    <Separator />

                    <div className="space-y-3">
                      <Label>Room Type</Label>
                      {isEditing ? (
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-3">
                            {['Lecture', 'Laboratory', 'Seminar Room', 'Others'].map((type) => (
                              <label key={type} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="radio"
                                  value={type}
                                  checked={formData.roomType === type}
                                  onChange={(e) => setFormData(prev => ({ ...prev, roomType: e.target.value }))}
                                  className="w-4 h-4 text-blue-600"
                                />
                                <span className="text-sm text-slate-700">{type}</span>
                              </label>
                            ))}
                          </div>
                          {formData.roomType === 'Others' && (
                            <Input
                              value={formData.customRoomType}
                              onChange={(e) => setFormData(prev => ({ ...prev, customRoomType: e.target.value }))}
                              placeholder="Specify room type"
                              className="h-11"
                            />
                          )}
                        </div>
                      ) : (
                        <Badge variant="outline">
                          {formData.roomType === 'Others' ? formData.customRoomType : formData.roomType}
                        </Badge>
                      )}
                    </div>

                    <Separator />

                    <FormGrid columns={3}>
                      <FormField label="Campus" required>
                        {isEditing ? (
                          <Select value={formData.campus} onValueChange={(value) => setFormData(prev => ({ ...prev, campus: value }))}>
                            <SelectTrigger className="h-11">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {campuses.map((campus) => (
                                <SelectItem key={campus} value={campus}>{campus}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="text-sm text-slate-900 p-2">{formData.campus}</p>
                        )}
                      </FormField>

                      <FormField label="College" required>
                        {isEditing ? (
                          <Select value={formData.college} onValueChange={(value) => setFormData(prev => ({ ...prev, college: value }))}>
                            <SelectTrigger className="h-11">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {colleges.map((college) => (
                                <SelectItem key={college.code} value={college.code}>
                                  {college.code} - {college.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="text-sm text-slate-900 p-2">{formData.college}</p>
                        )}
                      </FormField>

                      <FormField label="Academic Year" required>
                        {isEditing ? (
                          <Input
                            value={formData.academicYear}
                            onChange={(e) => setFormData(prev => ({ ...prev, academicYear: e.target.value }))}
                            placeholder="e.g., 2023-2024"
                            className="h-11"
                          />
                        ) : (
                          <p className="text-sm text-slate-900 p-2">{formData.academicYear}</p>
                        )}
                      </FormField>
                    </FormGrid>

                    <Separator />

                    <FormGrid columns={2}>
                      <FormField label="Semester" required>
                        {isEditing ? (
                          <Select value={formData.semester} onValueChange={(value) => setFormData(prev => ({ ...prev, semester: value }))}>
                            <SelectTrigger className="h-11">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="First Semester">First Semester</SelectItem>
                              <SelectItem value="Second Semester">Second Semester</SelectItem>
                              <SelectItem value="Summer">Summer</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="text-sm text-slate-900 p-2">{formData.semester}</p>
                        )}
                      </FormField>

                      <FormField label="Number of Students">
                        {isEditing ? (
                          <Input
                            type="number"
                            value={formData.numberOfStudents}
                            onChange={(e) => setFormData(prev => ({ ...prev, numberOfStudents: e.target.value }))}
                            className="h-11"
                          />
                        ) : (
                          <p className="text-sm text-slate-900 p-2">{formData.numberOfStudents || 'N/A'}</p>
                        )}
                      </FormField>
                    </FormGrid>

                    <FormField label="Schedule">
                      {isEditing ? (
                        <Input
                          value={formData.schedule}
                          onChange={(e) => setFormData(prev => ({ ...prev, schedule: e.target.value }))}
                          placeholder="e.g., MWF 10:00-12:00 PM"
                          className="h-11"
                        />
                      ) : (
                        <p className="text-sm text-slate-900 p-2">{formData.schedule || 'N/A'}</p>
                      )}
                    </FormField>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Assessment Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormGrid columns={3}>
                      <FormField label="Date of Assessment" required>
                        {isEditing ? (
                          <Input
                            type="date"
                            value={formData.dateOfAssessment}
                            onChange={(e) => setFormData(prev => ({ ...prev, dateOfAssessment: e.target.value }))}
                            className="h-11"
                          />
                        ) : (
                          <p className="text-sm text-slate-900 p-2">{formData.dateOfAssessment || 'N/A'}</p>
                        )}
                      </FormField>

                      <FormField label="Assessed By" required>
                        {isEditing ? (
                          <Input
                            value={formData.assessor}
                            onChange={(e) => setFormData(prev => ({ ...prev, assessor: e.target.value }))}
                            className="h-11"
                          />
                        ) : (
                          <p className="text-sm text-slate-900 p-2">{formData.assessor || 'N/A'}</p>
                        )}
                      </FormField>

                      <FormField label="Position" required>
                        {isEditing ? (
                          <Input
                            value={formData.position}
                            onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                            className="h-11"
                          />
                        ) : (
                          <p className="text-sm text-slate-900 p-2">{formData.position || 'N/A'}</p>
                        )}
                      </FormField>
                    </FormGrid>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Assessment Tab */}
              <TabsContent value="assessment" className="mt-0 space-y-6">
                {/* Accessibility */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">1. Accessibility (15%)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {renderRatingInput('accessibility', 'pwdFriendlyFacilities', 'PWD-Friendly Facilities', 'Presence of ramps, wide entry, elevator access')}
                    {renderRatingInput('accessibility', 'roomAccessibility', 'Room Accessibility', 'Space is easy to access for students and faculty')}
                    {renderRatingInput('accessibility', 'directionalSignages', 'Directional Signages', 'Clear and visible room labels, directional signs')}
                    {renderRatingInput('accessibility', 'pathways', 'Pathways', 'Corridors, aisles, and entrances free of obstructions')}
                  </CardContent>
                </Card>

                {/* Functionality */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">2. Functionality (15%)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {renderRatingInput('functionality', 'flexibility', 'Flexibility', 'Furniture and room layout adaptable for various teaching activities')}
                    {renderRatingInput('functionality', 'ventilation', 'Ventilation and Temperature', 'Functioning ventilation with proper temperature control')}
                    {renderRatingInput('functionality', 'noiseLevel', 'Noise Level', 'Minimal external noise and vibrations')}
                  </CardContent>
                </Card>

                {/* Utility */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">3. Utility (10%)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {renderRatingInput('utility', 'electricity', 'Electricity', 'Sufficient and working outlets and switches, safe wiring setup')}
                    {renderRatingInput('utility', 'lighting', 'Lighting', 'Adequate natural/artificial lighting')}
                    {renderRatingInput('utility', 'internetConnectivity', 'Internet Connectivity', 'Reliable Wi-Fi coverage and mobile data reception')}
                  </CardContent>
                </Card>

                {/* Sanitation */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">4. Sanitation (10%)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {renderRatingInput('sanitation', 'cleanliness', 'Cleanliness', 'Floors, walls, windows clean and well-maintained')}
                    {renderRatingInput('sanitation', 'wasteDisposal', 'Waste Disposal', 'Availability of trash bins')}
                    {renderRatingInput('sanitation', 'odor', 'Odor', 'Room free from foul odor')}
                    {renderRatingInput('sanitation', 'comfortRoomAccess', 'Comfort Room Access', 'Accessible restrooms within reasonable distance')}
                  </CardContent>
                </Card>

                {/* Equipment */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">5. Equipment (10%)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {renderRatingInput('equipment', 'projectorTvMonitorSpeakersMic', 'Projector / TV / Monitor / Speakers / Mic', 'Available and functional for classroom instruction')}
                  </CardContent>
                </Card>

                {/* Furniture & Fixtures */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">6. Furniture and Fixtures (10%)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {renderRatingInput('furnitureFixtures', 'chairsDesks', 'Student Chairs and Desks', 'Sufficient, comfortable, and undamaged')}
                    {renderRatingInput('furnitureFixtures', 'neutralDesk', 'Neutral Desk / Armchair', 'Inclusive seating options available')}
                    {renderRatingInput('furnitureFixtures', 'teachersTablePodium', 'Teachers Table / Podium', 'Available and in good condition')}
                    {renderRatingInput('furnitureFixtures', 'whiteboardBlackboard', 'Whiteboard / Blackboard', 'Usable, clean, with markers/chalk')}
                  </CardContent>
                </Card>

                {/* Space */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">7. Space (15%)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {renderRatingInput('space', 'roomCapacity', 'Room Capacity', 'Adequate for class size / avoids overcrowding')}
                    {renderRatingInput('space', 'layout', 'Layout', 'Allows free movement and visibility')}
                    {renderRatingInput('space', 'storage', 'Storage', 'Adequate space for materials')}
                  </CardContent>
                </Card>

                {/* Disaster Preparedness */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">8. Disaster Preparedness (10%)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {renderRatingInput('disasterPreparedness', 'emergencyExitsFireSafety', 'Emergency Exits & Fire Safety', 'Fire extinguishers, alarms, clearly marked accessible exits')}
                    {renderRatingInput('disasterPreparedness', 'earthquakePreparedness', 'Earthquake Preparedness', 'No falling hazards, secure fixtures, safe layout')}
                    {renderRatingInput('disasterPreparedness', 'floodSafety', 'Flood Safety', 'Elevated location, electrical outlets positioned safely')}
                    {renderRatingInput('disasterPreparedness', 'safetySignages', 'Safety Signages', 'Visible safety instructions and emergency contact information')}
                  </CardContent>
                </Card>

                {/* Inclusivity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">9. Inclusivity (5%)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {renderRatingInput('inclusivity', 'privacyInComfortRooms', 'Privacy in Comfort Rooms', 'Working locks, partitions that ensure safety and dignity')}
                    {renderRatingInput('inclusivity', 'genderNeutralRestrooms', 'Gender-Neutral Restrooms', 'Availability or at least clear policies for safe CR access')}
                    {renderRatingInput('inclusivity', 'safeSpaces', 'Safe Spaces', 'Seating arrangements promote equality')}
                    {renderRatingInput('inclusivity', 'classroomAssignmentSpecialNeeds', 'Classroom Assignment for Special Needs', 'Ground-floor, ramp-accessible locations for pregnant, lactating, or disabled students')}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Scores Tab */}
              <TabsContent value="scores" className="mt-0 space-y-6">
                <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <CardContent className="p-8">
                    <div className="text-center space-y-4">
                      <h4 className="text-2xl">Overall Assessment Score</h4>
                      <div className="text-6xl">{overallWeightedScore.toFixed(2)}</div>
                      <div className="text-xl bg-white/20 inline-block px-6 py-2 rounded-full">
                        {getRatingInterpretation(overallWeightedScore)}
                      </div>
                      <p className="text-sm text-blue-100">Weighted Average Score (Out of 100%)</p>
                      <div className="text-base bg-white/10 inline-block px-4 py-1 rounded mt-2">
                        Condition: {overallCondition}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categoryScores.map((category, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <h4 className="text-sm text-slate-900">{category.name}</h4>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl text-blue-600">{category.weightedScore.toFixed(2)}</span>
                            <span className="text-sm text-slate-600">/ {category.weight}%</span>
                          </div>
                          <div className="text-xs text-slate-600">
                            Category Score: {category.categoryScore.toFixed(1)}%
                          </div>
                          <div className="text-xs text-slate-600">
                            Rating: {category.totalRating} / {category.maxPossibleScore}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Remarks Tab */}
              <TabsContent value="remarks" className="mt-0 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">General Observations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <Textarea
                        value={formData.remarks}
                        onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                        placeholder="Enter general observations about the classroom..."
                        rows={6}
                      />
                    ) : (
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">
                        {formData.remarks || 'No remarks provided'}
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Recommending Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <Textarea
                        value={formData.recommendingActions}
                        onChange={(e) => setFormData(prev => ({ ...prev, recommendingActions: e.target.value }))}
                        placeholder="Enter recommended actions for improvement..."
                        rows={6}
                      />
                    ) : (
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">
                        {formData.recommendingActions || 'No recommendations provided'}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}