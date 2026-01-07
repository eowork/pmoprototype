import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { 
  School, Building, MapPin, Calendar, Users, ClipboardCheck, 
  Search, Filter, Plus, Eye, Edit, Target, TrendingUp, BarChart3, 
  FileText, Clock, ArrowRight, CheckCircle, AlertCircle, Zap,
  CalendarDays, List, Grid, Upload, Download, Trash2, Save, X, ChevronLeft, Check
} from 'lucide-react';
import FormStepper from './components/FormStepper';
import { FormSection, FormField, FormGrid } from './components/FormSection';
import RatingSection from './components/RatingSection';
import { RatingSectionWithRemarks } from './components/RatingSectionWithRemarks';
import { WeightedScoreCard } from './components/WeightedScoreCard';
import { GeneralFilter } from './components/GeneralFilter';
import { toast } from 'sonner@2.0.3';
import { 
  isClassroomAssessmentAdmin, 
  getStatusBadgeStyle, 
  filterRecordsByPermission 
} from '../../utils/pagePermissions';
import {
  ClassroomAssessmentFormData,
  calculateAllCategoryScores,
  calculateOverallWeightedScore,
  getRatingInterpretation,
  getOverallCondition
} from './utils/classroomWeightedScoring';
import { ClassroomAssessmentCRUDDialog } from './dialogs/ClassroomAssessmentCRUDDialog';

interface ClassroomAssessmentPageProps {
  userRole: string;
  requireAuth: (action: string) => boolean;
  onProjectSelect: (project: any) => void;
  filterData?: any;
  onClearFilters: () => void;
  userProfile?: any;
}

// Updated colleges according to CSU structure - INCLUDING CHASS
const CSU_COLLEGES = [
  { code: 'CED', name: 'College of Education', rooms: 22, avgScore: 4.1, priority: 'High', status: 'Needs Attention' },
  { code: 'CMNS', name: 'College of Mathematics and Natural Sciences', rooms: 18, avgScore: 4.3, priority: 'Medium', status: 'Good' },
  { code: 'CAA', name: 'College of Agriculture and Aquaculture', rooms: 20, avgScore: 4.2, priority: 'Medium', status: 'Good' },
  { code: 'COFES', name: 'College of Forestry and Environmental Sciences', rooms: 15, avgScore: 4.0, priority: 'High', status: 'Needs Improvement' },
  { code: 'CCIS', name: 'College of Computing and Information Sciences', rooms: 12, avgScore: 4.4, priority: 'Low', status: 'Excellent' },
  { code: 'CEGS', name: 'College of Engineering and Geosciences', rooms: 16, avgScore: 3.9, priority: 'High', status: 'Needs Improvement' },
  { code: 'CHASS', name: 'College of Humanities, Arts and Social Sciences', rooms: 14, avgScore: 4.2, priority: 'Medium', status: 'Good' },
  { code: 'SOM', name: 'School of Medicine', rooms: 8, avgScore: 4.5, priority: 'Low', status: 'Excellent' }
];

// Enhanced classroom assessment data based on the form structure from images
const CLASSROOM_ASSESSMENT_DATA = {
  overview: {
    totalClassrooms: 125, // Sum of all college rooms (including CHASS)
    assessedClassrooms: 104,
    avgOverallScore: 4.1,
    completionRate: 83.2,
    priorityActions: 15
  },
  yearFilters: {
    2024: { completed: 98, pending: 13, avgScore: 4.1 },
    2023: { completed: 85, pending: 8, avgScore: 4.0 },
    2022: { completed: 72, pending: 5, avgScore: 3.9 }
  },
  campuses: {
    'CSU Main Campus': {
      totalRooms: 65,
      assessedRooms: 60,
      avgScore: 4.2,
      lastAssessment: '2 hours ago',
      completionRate: 92,
      colleges: CSU_COLLEGES.slice(0, 5) // CED, CMNS, CAA, COFES, CCIS for main campus
    },
    'CSU Cabadbaran Campus': {
      totalRooms: 38,
      assessedRooms: 32,
      avgScore: 4.0,
      lastAssessment: '1 day ago',
      completionRate: 84,
      colleges: CSU_COLLEGES.slice(5) // CEGS, CHASS, SOM for Cabadbaran
    }
  },
  // Sample assessment records based on the form structure
  assessmentRecords: [
    {
      id: 'CA-2024-001',
      buildingName: 'Agriculture Building',
      roomNumber: 'Room 101',
      subject: 'General Agriculture',
      roomType: 'Lecture',
      college: 'CAA',
      semester: 'First Semester',
      academicYear: '2023-2024',
      numberOfStudents: 45,
      schedule: 'MWF 8:00-9:00 AM',
      dateOfAssessment: '2024-01-15',
      assessor: 'Dr. Maria Santos',
      position: 'Department Head',
      
      // Assessment scores (1-5 scale from the form)
      functionality: {
        accessibility: 4,
        ventilation: 3,
        noiseLevel: 4
      },
      utility: {
        electricity: 4,
        lighting: 4,
        internetConnectivity: 3
      },
      sanitation: {
        cleanliness: 4,
        wasteDisposal: 4,
        odor: 4,
        comfortRoomAccess: 4,
        pwdFriendlyFacilities: 3
      },
      equipment: {
        projectorTvMonitor: 3,
        speakersMic: 4
      },
      furnitureFixtures: {
        chairsDesks: 4,
        teachersTable: 4,
        whiteboardBlackboard: 4
      },
      space: {
        roomCapacity: 3,
        layout: 4,
        storage: 3
      },
      disasterPreparedness: {
        emergencyExits: 4,
        earthquakePreparedness: 4,
        floodSafety: 4,
        safetySignages: 4
      },
      
      overallScore: 3.7,
      overallCondition: 'Good',
      remarks: 'Room needs improved ventilation and better projector system. Storage space is limited.',
      recommendingActions: 'Install additional windows for natural ventilation. Upgrade projector to newer model. Add storage cabinets.',
      
      // File attachments
      attachments: [
        { name: 'assessment_photos.zip', type: 'images', uploadDate: '2024-01-15', uploadedBy: 'Dr. Maria Santos' },
        { name: 'maintenance_report.pdf', type: 'document', uploadDate: '2024-01-16', uploadedBy: 'Facilities Team' }
      ],
      
      recordStatus: 'Published',
      submittedBy: 'Dr. Maria Santos',
      dateCreated: '2024-01-15',
      lastModified: '2024-01-16'
    },
    {
      id: 'CA-2024-002',
      buildingName: 'Engineering Building',
      roomNumber: 'Lab 205',
      subject: 'Computer Programming',
      roomType: 'Laboratory',
      college: 'CEGS',
      semester: 'First Semester',
      academicYear: '2023-2024',
      numberOfStudents: 30,
      schedule: 'TTH 10:00-12:00 PM',
      dateOfAssessment: '2024-01-14',
      assessor: 'Prof. Juan Dela Cruz',
      position: 'Laboratory Supervisor',
      
      functionality: {
        accessibility: 4,
        ventilation: 2,
        noiseLevel: 3
      },
      utility: {
        electricity: 3,
        lighting: 3,
        internetConnectivity: 4
      },
      sanitation: {
        cleanliness: 3,
        wasteDisposal: 4,
        odor: 3,
        comfortRoomAccess: 4,
        pwdFriendlyFacilities: 2
      },
      equipment: {
        projectorTvMonitor: 2,
        speakersMic: 3
      },
      furnitureFixtures: {
        chairsDesks: 3,
        teachersTable: 4,
        whiteboardBlackboard: 3
      },
      space: {
        roomCapacity: 2,
        layout: 3,
        storage: 2
      },
      disasterPreparedness: {
        emergencyExits: 4,
        earthquakePreparedness: 3,
        floodSafety: 4,
        safetySignages: 3
      },
      
      overallScore: 3.1,
      overallCondition: 'Need Improvement',
      remarks: 'Laboratory requires immediate attention for ventilation and equipment upgrades.',
      recommendingActions: 'Install HVAC system, replace projector, add more storage space, improve accessibility features.',
      
      attachments: [
        { name: 'lab_assessment.pdf', type: 'document', uploadDate: '2024-01-14', uploadedBy: 'Prof. Juan Dela Cruz' }
      ],
      
      recordStatus: 'Draft',
      submittedBy: 'Prof. Juan Dela Cruz',
      dateCreated: '2024-01-14',
      lastModified: '2024-01-14'
    }
  ]
};

export function ClassroomAssessmentPage({ 
  userRole, 
  requireAuth, 
  onProjectSelect, 
  filterData, 
  onClearFilters,
  userProfile 
}: ClassroomAssessmentPageProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCampus, setSelectedCampus] = useState('all');
  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedCollege, setSelectedCollege] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('list'); // Default to list view
  const [loading, setLoading] = useState(false);
  const [showAssessmentDialog, setShowAssessmentDialog] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [assessmentRecords, setAssessmentRecords] = useState(CLASSROOM_ASSESSMENT_DATA.assessmentRecords);
  
  // Check if current user is page admin
  const isPageAdmin = isClassroomAssessmentAdmin(userProfile);

  const handleNewAssessment = () => {
    if (!requireAuth('create assessment')) return;
    setEditingRecord(null);
    setDialogMode('create');
    setShowAssessmentDialog(true);
  };

  const handleEditRecord = (record: any) => {
    if (!requireAuth('edit assessment')) return;
    setEditingRecord(record);
    setDialogMode('edit');
    setShowAssessmentDialog(true);
  };

  const handleViewRecord = (record: any) => {
    setEditingRecord(record);
    setDialogMode('view');
    setShowAssessmentDialog(true);
  };

  const handleDeleteRecord = (recordId: string) => {
    if (!requireAuth('delete assessment')) return;
    setAssessmentRecords(prev => prev.filter(record => record.id !== recordId));
    toast.success('Assessment record deleted successfully');
  };

  const handleSaveRecord = (recordData: any) => {
    if (editingRecord) {
      // Update existing record
      // CRITICAL: Only admins can change recordStatus to Published
      // Non-admins editing a draft keeps it as draft, editing published keeps it published
      const updatedStatus = isPageAdmin ? editingRecord.recordStatus : 
                           (editingRecord.recordStatus === 'Draft' ? 'Draft' : 'Published');
      
      setAssessmentRecords(prev => prev.map(record => 
        record.id === editingRecord.id ? { 
          ...recordData, 
          id: editingRecord.id, 
          recordStatus: updatedStatus, // Controlled status update
          submittedBy: editingRecord.submittedBy,
          lastModified: new Date().toISOString().split('T')[0] 
        } : record
      ));
      toast.success('Assessment record updated successfully');
    } else {
      // Create new record - ALWAYS as Draft regardless of user type
      const newRecord = {
        ...recordData,
        id: `CA-${new Date().getFullYear()}-${String(assessmentRecords.length + 1).padStart(3, '0')}`,
        dateCreated: new Date().toISOString().split('T')[0],
        lastModified: new Date().toISOString().split('T')[0],
        recordStatus: 'Draft', // ALWAYS Draft on creation
        submittedBy: userProfile?.name || recordData.assessor || 'Unknown'
      };
      setAssessmentRecords(prev => [...prev, newRecord]);
      toast.success('Assessment record saved as Draft. Awaiting admin approval.');
    }
    setShowAssessmentDialog(false);
    setEditingRecord(null);
  };

  const handleApproveRecord = (recordId: string) => {
    if (!isPageAdmin) {
      toast.error('Only authorized admins can approve records');
      return;
    }
    
    setAssessmentRecords(prev => prev.map(record => 
      record.id === recordId 
        ? { ...record, recordStatus: 'Published', lastModified: new Date().toISOString().split('T')[0] }
        : record
    ));
    toast.success('Assessment record approved and published');
  };

  const handleUnpublishRecord = (recordId: string) => {
    if (!isPageAdmin) {
      toast.error('Only authorized admins can unpublish records');
      return;
    }
    
    if (window.confirm('Are you sure you want to unpublish this record? It will be reverted to Draft status.')) {
      setAssessmentRecords(prev => prev.map(record => 
        record.id === recordId 
          ? { ...record, recordStatus: 'Draft', lastModified: new Date().toISOString().split('T')[0] }
          : record
      ));
      toast.success('Assessment record unpublished and reverted to Draft');
    }
  };

  const handleClearAllFilters = () => {
    setSelectedYear('2024');
    setSelectedCampus('all');
    setSelectedCollege('all');
    setSearchTerm('');
    toast.info('All filters cleared');
  };

  const getYearFilterData = () => {
    return CLASSROOM_ASSESSMENT_DATA.yearFilters[selectedYear as keyof typeof CLASSROOM_ASSESSMENT_DATA.yearFilters];
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-emerald-600';
    if (rating >= 4.0) return 'text-blue-600';
    if (rating >= 3.5) return 'text-amber-600';
    return 'text-red-600';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'Excellent': 'text-emerald-600 bg-emerald-50',
      'Good': 'text-blue-600 bg-blue-50',
      'Needs Improvement': 'text-amber-600 bg-amber-50',
      'Needs Attention': 'text-red-600 bg-red-50'
    };
    return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-50';
  };

  const currentYearData = getYearFilterData();

  // Apply permission-based filtering
  const permissionFilteredRecords = filterRecordsByPermission(
    assessmentRecords,
    userProfile,
    isPageAdmin
  );

  const filteredRecords = permissionFilteredRecords.filter(record => {
    const matchesSearch = record.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.college.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCampus = selectedCampus === 'all' || 
                         (selectedCampus === 'CSU Main Campus' && ['CAA', 'CMNS', 'CED', 'COFES', 'CCIS'].includes(record.college)) ||
                         (selectedCampus === 'CSU Cabadbaran Campus' && ['CEGS', 'CHASS', 'SOM'].includes(record.college));
    const matchesCollege = selectedCollege === 'all' || record.college === selectedCollege;
    
    return matchesSearch && matchesCampus && matchesCollege;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <School className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Classroom Assessment Management
                </h1>
                <p className="text-gray-600 mt-1">
                  Comprehensive evaluation of classroom learning environments
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Year Filter */}
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
                <CalendarDays className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Academic Year:</span>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-[100px] border-blue-300 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2022">2022</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={handleNewAssessment} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                New Assessment
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white border border-slate-200 p-1">
            <TabsTrigger 
              value="overview"
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="college-analysis"
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm"
            >
              College Analysis
            </TabsTrigger>
            <TabsTrigger 
              value="forms"
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm"
            >
              Assessment Forms
            </TabsTrigger>
            <TabsTrigger 
              value="assessment-records"
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm"
            >
              Assessment Records
            </TabsTrigger>
          </TabsList>

          {/* General Filter - Applies to all tabs */}
          <GeneralFilter
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
            selectedCampus={selectedCampus}
            onCampusChange={setSelectedCampus}
            selectedCollege={selectedCollege}
            onCollegeChange={setSelectedCollege}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onClearFilters={handleClearAllFilters}
            colleges={CSU_COLLEGES}
            showCollegeFilter={true}
          />

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Campus Performance - On Top */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Campus Performance</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {Object.entries(CLASSROOM_ASSESSMENT_DATA.campuses).map(([campusName, campusData]) => (
                  <Card key={campusName} className="bg-white shadow-sm border border-gray-200">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg text-gray-900">{campusName}</CardTitle>
                            <CardDescription className="text-sm">Last updated: {campusData.lastAssessment}</CardDescription>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-semibold ${getRatingColor(campusData.avgScore)}`}>
                            {campusData.avgScore}/5
                          </p>
                          <p className="text-xs text-gray-500">Avg Score</p>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-4">
                        {/* Progress */}
                        <div>
                          <div className="flex justify-between items-center text-sm mb-2">
                            <span className="text-gray-600">Assessment Progress</span>
                            <span className="font-medium">{campusData.completionRate}%</span>
                          </div>
                          <Progress value={campusData.completionRate} className="h-3" />
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <p className="text-lg font-semibold text-blue-600">{campusData.assessedRooms}</p>
                            <p className="text-xs text-blue-600">Assessed Rooms</p>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <p className="text-lg font-semibold text-gray-600">{campusData.totalRooms}</p>
                            <p className="text-xs text-gray-600">Total Rooms</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Assessment Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-white shadow-sm border border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Total Classrooms</p>
                        <p className="text-3xl font-semibold text-blue-600">{CLASSROOM_ASSESSMENT_DATA.overview.totalClassrooms}</p>
                        <p className="text-xs text-gray-500 mt-1">Both campuses</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                        <School className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Assessed</p>
                        <p className="text-3xl font-semibold text-emerald-600">{currentYearData.completed}</p>
                        <p className="text-xs text-gray-500 mt-1">{CLASSROOM_ASSESSMENT_DATA.overview.completionRate}% complete</p>
                      </div>
                      <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-emerald-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Average Score</p>
                        <p className={`text-3xl font-semibold ${getRatingColor(currentYearData.avgScore)}`}>
                          {currentYearData.avgScore}/5
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Good condition</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                        <Target className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Priority Actions</p>
                        <p className="text-3xl font-semibold text-amber-600">{CLASSROOM_ASSESSMENT_DATA.overview.priorityActions}</p>
                        <p className="text-xs text-gray-500 mt-1">Need attention</p>
                      </div>
                      <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-amber-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Downloadable Forms Section */}
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-gray-900">Assessment Forms & Templates</CardTitle>
                    <CardDescription>Download standard assessment forms or manage form inventory</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = '/forms'}
                    className="gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    View All Forms
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm text-gray-900 mb-1">Classroom Assessment Form</h4>
                        <p className="text-xs text-gray-500 mb-2">Standard evaluation template for classrooms</p>
                        <Button size="sm" variant="outline" className="h-7 text-xs">
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border border-slate-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50/50 transition-all cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-emerald-50 rounded-lg">
                        <FileText className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm text-gray-900 mb-1">Scoring Guidelines</h4>
                        <p className="text-xs text-gray-500 mb-2">Detailed rubric for assessment criteria</p>
                        <Button size="sm" variant="outline" className="h-7 text-xs">
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border border-slate-200 rounded-lg hover:border-purple-300 hover:bg-purple-50/50 transition-all cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-purple-50 rounded-lg">
                        <FileText className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm text-gray-900 mb-1">Assessment Report Template</h4>
                        <p className="text-xs text-gray-500 mb-2">Summary report format for submissions</p>
                        <Button size="sm" variant="outline" className="h-7 text-xs">
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* College Analysis Tab - Enhanced Minimal and Formal Design */}
          <TabsContent value="college-analysis" className="space-y-6">
            <div className="space-y-6">
              {/* Header Section */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">College Performance Analysis</h2>
                  <p className="text-slate-600 mt-1">Systematic evaluation of learning spaces across academic units</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Data Visualization</span>
                </div>
              </div>
              
              {/* Performance Summary Grid - Minimal Design */}
              <Card className="bg-white shadow-sm border border-slate-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-slate-900">College Assessment Overview</CardTitle>
                  <CardDescription>Comparative performance across academic units</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {CSU_COLLEGES.map((college) => {
                      const collegeRecords = filteredRecords.filter(record => record.college === college.code);
                      const avgScore = collegeRecords.length > 0 
                        ? collegeRecords.reduce((sum, record) => sum + record.overallScore, 0) / collegeRecords.length
                        : college.avgScore * 20;
                      
                      return (
                        <div 
                          key={college.code} 
                          className="p-4 border border-slate-200 rounded-lg hover:shadow-md hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer group"
                          onClick={() => {
                            setSelectedCollege(college.code);
                            setActiveTab('assessment-records');
                          }}
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="px-2.5 py-1 bg-slate-100 group-hover:bg-blue-100 rounded-md transition-colors">
                                <span className="text-xs text-slate-700 group-hover:text-blue-700 transition-colors">{college.code}</span>
                              </div>
                              <Badge variant="outline" className={`text-xs ${getStatusColor(
                                avgScore >= 90 ? 'Excellent' :
                                avgScore >= 75 ? 'Good' :
                                avgScore >= 60 ? 'Needs Improvement' : 'Needs Attention'
                              )}`}>
                                {avgScore >= 90 ? 'A' :
                                 avgScore >= 75 ? 'B' :
                                 avgScore >= 60 ? 'C' : 'D'}
                              </Badge>
                            </div>
                            <div>
                              <div className={`text-2xl ${getRatingColor(avgScore / 20)}`}>
                                {(avgScore / 20).toFixed(1)}
                              </div>
                              <p className="text-xs text-slate-500 mt-1">{collegeRecords.length || college.rooms} assessments</p>
                            </div>
                            <Progress value={avgScore} className="h-1.5" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Campus Breakdown - Minimal Design */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {Object.entries(CLASSROOM_ASSESSMENT_DATA.campuses).map(([campusName, campusData]) => (
                  <Card key={campusName} className="bg-white shadow-sm border border-slate-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-slate-500" />
                          <CardTitle className="text-base text-slate-900">{campusName}</CardTitle>
                        </div>
                        <div className="text-xs text-slate-500">
                          {campusData.colleges.length} colleges • {campusData.totalRooms} rooms
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-2">
                        {campusData.colleges.map((college, index) => {
                          const collegeRecords = assessmentRecords.filter(record => 
                            record.college === college.code
                          );
                          
                          const avgScore = collegeRecords.length > 0 
                            ? collegeRecords.reduce((sum, record) => sum + record.overallScore, 0) / collegeRecords.length
                            : college.avgScore * 20;
                          
                          const goodCount = collegeRecords.filter(r => r.overallScore >= 75).length;
                          const needsImpCount = collegeRecords.filter(r => r.overallScore >= 60 && r.overallScore < 75).length;
                          const poorCount = collegeRecords.filter(r => r.overallScore < 60).length;
                          
                          return (
                            <div 
                              key={index} 
                              className="p-2.5 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/30 transition-all cursor-pointer group"
                              onClick={() => {
                                setSelectedCollege(college.code);
                                setActiveTab('assessment-records');
                              }}
                            >
                              <div className="flex items-center justify-between gap-3">
                                {/* Left: College Code */}
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <div className="w-10 h-10 bg-blue-50 group-hover:bg-blue-100 rounded flex items-center justify-center flex-shrink-0 transition-colors">
                                    <span className="text-xs text-blue-600">{college.code}</span>
                                  </div>
                                  <div className="min-w-0">
                                    <h4 className="text-sm text-slate-900 truncate">{college.name}</h4>
                                    <div className="flex items-center gap-3 mt-0.5">
                                      <span className="text-xs text-slate-500">
                                        {collegeRecords.length || college.rooms} assessments
                                      </span>
                                      {collegeRecords.length > 0 && (
                                        <div className="flex items-center gap-1.5 text-xs">
                                          <span className="text-emerald-600">{goodCount}</span>
                                          <span className="text-amber-600">{needsImpCount}</span>
                                          <span className="text-red-600">{poorCount}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Right: Score & Badge */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <div className={`text-lg ${getRatingColor(avgScore / 20)}`}>
                                    {(avgScore / 20).toFixed(1)}
                                  </div>
                                  <Badge variant="outline" className={`text-xs ${getStatusColor(
                                    avgScore >= 90 ? 'Excellent' :
                                    avgScore >= 75 ? 'Good' :
                                    avgScore >= 60 ? 'Needs Improvement' : 'Needs Attention'
                                  )}`}>
                                    {avgScore >= 90 ? 'A' :
                                     avgScore >= 75 ? 'B' :
                                     avgScore >= 60 ? 'C' : 'D'}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Assessment Insights - Minimalistic Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-emerald-50 border border-emerald-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-emerald-800">Performance Strengths</h3>
                    </div>
                    <ul className="space-y-2 text-sm text-emerald-700">
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                        Equipment availability & maintenance
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                        Disaster preparedness measures
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                        Furniture quality standards
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-amber-50 border border-amber-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-amber-800">Improvement Areas</h3>
                    </div>
                    <ul className="space-y-2 text-sm text-amber-700">
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-amber-500 rounded-full"></div>
                        Ventilation system upgrades
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-amber-500 rounded-full"></div>
                        Storage optimization solutions
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-amber-500 rounded-full"></div>
                        Accessibility enhancements
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-red-50 border border-red-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-red-800">Priority Actions</h3>
                    </div>
                    <ul className="space-y-2 text-sm text-red-700">
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                        Internet connectivity upgrades
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                        Enhanced cleaning protocols
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                        Capacity optimization review
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Assessment Forms Tab */}
          <TabsContent value="forms" className="space-y-6">
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">Classroom Assessment Form</CardTitle>
                <CardDescription>
                  Comprehensive evaluation system based on CSU standardized criteria
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ClassroomAssessmentForm
                  onFormSubmit={handleSaveRecord}
                  colleges={CSU_COLLEGES}
                  campuses={Object.keys(CLASSROOM_ASSESSMENT_DATA.campuses)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assessment Records Tab */}
          <TabsContent value="assessment-records" className="space-y-6">
            {/* Search and Filters */}
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by room number, college, or subject..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-gray-300"
                      />
                    </div>
                  </div>
                  
                  <Select value={selectedCampus} onValueChange={setSelectedCampus}>
                    <SelectTrigger className="w-[180px] border-gray-300">
                      <SelectValue placeholder="All Campuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Campuses</SelectItem>
                      <SelectItem value="CSU Main Campus">CSU Main Campus</SelectItem>
                      <SelectItem value="CSU Cabadbaran Campus">CSU Cabadbaran Campus</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={selectedCollege} onValueChange={setSelectedCollege}>
                    <SelectTrigger className="w-[120px] border-gray-300">
                      <SelectValue placeholder="All Colleges" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Colleges</SelectItem>
                      {CSU_COLLEGES.map((college) => (
                        <SelectItem key={college.code} value={college.code}>{college.code}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* View Toggle */}
                  <div className="flex items-center border border-gray-300 rounded-lg p-1">
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="px-3"
                    >
                      <List className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'cards' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('cards')}
                      className="px-3"
                    >
                      <Grid className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Assessment Records Display */}
            {viewMode === 'list' ? (
              <Card className="bg-white shadow-sm border border-gray-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-gray-900">Assessment Records</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                      <Button onClick={handleNewAssessment} size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Record
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Room Details</TableHead>
                        <TableHead>College</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Assessor</TableHead>
                        <TableHead>Overall Score</TableHead>
                        <TableHead>Condition</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{record.buildingName}</p>
                              <p className="text-sm text-gray-600">{record.roomNumber}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{record.college}</Badge>
                          </TableCell>
                          <TableCell>{record.subject}</TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm">{record.assessor}</p>
                              <p className="text-xs text-gray-500">{record.position}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`font-semibold ${getRatingColor(record.overallScore)}`}>
                              {record.overallScore}/5
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(record.overallCondition)}>
                              {record.overallCondition}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusBadgeStyle(record.recordStatus)}>
                              {record.recordStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>{record.dateOfAssessment}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {isPageAdmin && record.recordStatus === 'Draft' && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleApproveRecord(record.id)}
                                  className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                  title="Approve and Publish"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                              )}
                              {isPageAdmin && record.recordStatus === 'Published' && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleUnpublishRecord(record.id)}
                                  className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                  title="Unpublish Record"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              )}
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleViewRecord(record)}
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleEditRecord(record)}
                                title="Edit Record"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              {isPageAdmin && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleDeleteRecord(record.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  title="Delete Record"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecords.map((record) => (
                  <Card key={record.id} className="bg-white shadow-sm border border-gray-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base">{record.buildingName}</CardTitle>
                          <CardDescription>{record.roomNumber}</CardDescription>
                        </div>
                        <Badge variant="outline">{record.college}</Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm font-medium">{record.subject}</p>
                        <p className="text-xs text-gray-500">{record.roomType}</p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Overall Score:</span>
                        <span className={`font-semibold ${getRatingColor(record.overallScore)}`}>
                          {record.overallScore}/5
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(record.overallCondition)}>
                          {record.overallCondition}
                        </Badge>
                        <Badge className={getStatusBadgeStyle(record.recordStatus)}>
                          {record.recordStatus}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-xs text-gray-500">{record.dateOfAssessment}</span>
                        <div className="flex items-center gap-1">
                          {isPageAdmin && record.recordStatus === 'Draft' && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleApproveRecord(record.id)}
                              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                              title="Approve and Publish"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => handleEditRecord(record)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          {isPageAdmin && (
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteRecord(record.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Assessment CRUD Dialog */}
      <ClassroomAssessmentCRUDDialog
        open={showAssessmentDialog}
        onOpenChange={setShowAssessmentDialog}
        mode={dialogMode}
        record={editingRecord}
        onSave={handleSaveRecord}
        onDelete={handleDeleteRecord}
        colleges={CSU_COLLEGES}
        campuses={Object.keys(CLASSROOM_ASSESSMENT_DATA.campuses)}
        isAdmin={isPageAdmin}
      />
    </div>
  );
}

// Classroom Assessment Form Component with Weighted Scoring (11 Steps)
function ClassroomAssessmentForm({ onFormSubmit, colleges, campuses }: {
  onFormSubmit: (data: any) => void;
  colleges: any[];
  campuses: string[];
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [customRoomType, setCustomRoomType] = useState('');
  const [formData, setFormData] = useState<ClassroomAssessmentFormData>({
    // Basic Information
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
    
    // 9 Assessment Categories with Remarks
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

  const formSteps = [
    { id: 1, title: 'Classroom Identification', description: 'Basic classroom information' },
    { id: 2, title: 'Class Details', description: 'Schedule and enrollment information' },
    { id: 3, title: 'Accessibility', description: 'Access features and navigation (15%)' },
    { id: 4, title: 'Functionality', description: 'Environmental factors (15%)' },
    { id: 5, title: 'Utility', description: 'Infrastructure and connectivity (10%)' },
    { id: 6, title: 'Sanitation', description: 'Cleanliness and hygiene (10%)' },
    { id: 7, title: 'Equipment', description: 'Instructional equipment (10%)' },
    { id: 8, title: 'Furniture & Fixtures', description: 'Furniture assessment (10%)' },
    { id: 9, title: 'Space', description: 'Capacity and layout (15%)' },
    { id: 10, title: 'Disaster Preparedness', description: 'Safety measures (10%)' },
    { id: 11, title: 'Inclusivity & Summary', description: 'Final evaluation (5%)' }
  ];

  const totalSteps = formSteps.length;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    // Calculate weighted scores using the utility
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
      overallScore: overallWeightedScore, // For backward compatibility
      overallCondition
    };
    
    onFormSubmit(finalData);
    
    // Reset form
    setCurrentStep(1);
    setCustomRoomType('');
    toast.success('Classroom assessment submitted successfully!');
  };

  const handleRatingChange = (categoryKey: string, itemKey: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      [categoryKey]: {
        ...prev[categoryKey as keyof typeof prev],
        [itemKey]: {
          ...(prev[categoryKey as keyof typeof prev][itemKey as any] || {}),
          rating: value
        }
      }
    }));
  };

  const handleRemarksChange = (categoryKey: string, itemKey: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [categoryKey]: {
        ...prev[categoryKey as keyof typeof prev],
        [itemKey]: {
          ...(prev[categoryKey as keyof typeof prev][itemKey as any] || {}),
          remarks: value
        }
      }
    }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <FormSection 
            title="Classroom Identification" 
            description="Please provide the basic information about the classroom being assessed"
            required
          >
            <FormGrid columns={3}>
              <FormField label="Building Name" required>
                <Input
                  value={formData.buildingName}
                  onChange={(e) => setFormData(prev => ({ ...prev, buildingName: e.target.value }))}
                  placeholder="Enter building name"
                  className="h-11"
                />
              </FormField>
              
              <FormField label="Room Number" required>
                <Input
                  value={formData.roomNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, roomNumber: e.target.value }))}
                  placeholder="Enter room number"
                  className="h-11"
                />
              </FormField>
              
              <FormField label="Subject" required>
                <Input
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Enter subject"
                  className="h-11"
                />
              </FormField>
            </FormGrid>

            <FormSection title="Room Classification" description="Specify the type and purpose of the classroom">
              <div className="space-y-4">
                <FormField label="Room Type" required>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {['Lecture', 'Laboratory', 'Seminar Room', 'Others'].map((type) => (
                        <label key={type} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="radio"
                            value={type}
                            checked={formData.roomType === type}
                            onChange={(e) => setFormData(prev => ({ ...prev, roomType: e.target.value }))}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="text-sm font-medium">{type}</span>
                        </label>
                      ))}
                    </div>
                    {formData.roomType === 'Others' && (
                      <Input
                        value={formData.customRoomType}
                        onChange={(e) => setFormData(prev => ({ ...prev, customRoomType: e.target.value }))}
                        placeholder="Please specify room type"
                        className="h-11"
                      />
                    )}
                  </div>
                </FormField>
              </div>
            </FormSection>

            <FormSection title="Academic Information" description="College and administrative details">
              <FormGrid columns={3}>
                <FormField label="Campus" required>
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
                </FormField>

                <FormField label="College" required>
                  <Select value={formData.college} onValueChange={(value) => setFormData(prev => ({ ...prev, college: value }))}>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colleges.map((college) => (
                        <SelectItem key={college.code} value={college.code}>{college.code} - {college.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                
                <FormField label="Academic Year" required>
                  <Input
                    value={formData.academicYear}
                    onChange={(e) => setFormData(prev => ({ ...prev, academicYear: e.target.value }))}
                    placeholder="e.g., 2023-2024"
                    className="h-11"
                  />
                </FormField>
              </FormGrid>
            </FormSection>
          </FormSection>
        );
        
      case 2:
        return (
          <FormSection 
            title="Class Schedule & Enrollment" 
            description="Provide information about class operations and assessment details"
            required
          >
            <FormSection title="Class Operations" description="Current class enrollment and scheduling information">
              <FormGrid columns={2}>
                <FormField label="Number of Students" required>
                  <Input
                    type="number"
                    value={formData.numberOfStudents}
                    onChange={(e) => setFormData(prev => ({ ...prev, numberOfStudents: e.target.value }))}
                    placeholder="Enter number of students"
                    className="h-11"
                  />
                </FormField>
                
                <FormField label="Class Schedule" required description="Days and time of class sessions">
                  <Input
                    value={formData.schedule}
                    onChange={(e) => setFormData(prev => ({ ...prev, schedule: e.target.value }))}
                    placeholder="e.g., MWF 8:00-9:00 AM"
                    className="h-11"
                  />
                </FormField>
              </FormGrid>

              <FormField label="Semester" required>
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
              </FormField>
            </FormSection>

            <FormSection title="Assessment Information" description="Details about the assessment process">
              <FormGrid columns={2}>
                <FormField label="Date of Assessment" required>
                  <Input
                    type="date"
                    value={formData.dateOfAssessment}
                    onChange={(e) => setFormData(prev => ({ ...prev, dateOfAssessment: e.target.value }))}
                    className="h-11"
                  />
                </FormField>
                
                <FormField label="Assessor Information" required>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      value={formData.assessor}
                      onChange={(e) => setFormData(prev => ({ ...prev, assessor: e.target.value }))}
                      placeholder="Assessor name"
                      className="h-11"
                    />
                    <Input
                      value={formData.position}
                      onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                      placeholder="Position/Title"
                      className="h-11"
                    />
                  </div>
                </FormField>
              </FormGrid>
            </FormSection>
          </FormSection>
        );
        
      case 3:
        const accessibilityScore = calculateAllCategoryScores(formData)[0];
        
        return (
          <div className="space-y-8">
            {/* Accessibility Score Card */}
            <WeightedScoreCard
              categoryName="1. Accessibility"
              totalRating={accessibilityScore?.totalRating || 0}
              maxPossibleScore={accessibilityScore?.maxPossibleScore || 0}
              categoryScore={accessibilityScore?.categoryScore || 0}
              weight={accessibilityScore?.weight || 0}
              weightedScore={accessibilityScore?.weightedScore || 0}
            />
            
            <RatingSectionWithRemarks
              title="1. Accessibility"
              description="Classroom access and navigation features"
              criteria={[
                {
                  key: 'pwdFriendlyFacilities',
                  label: 'PWD-Friendly Facilities',
                  description: 'Presence of ramps, wide entry, elevator access',
                  value: formData.accessibility.pwdFriendlyFacilities.rating,
                  remarks: formData.accessibility.pwdFriendlyFacilities.remarks
                },
                {
                  key: 'roomAccessibility',
                  label: 'Room Accessibility',
                  description: 'Space is easy to access for students and faculty',
                  value: formData.accessibility.roomAccessibility.rating,
                  remarks: formData.accessibility.roomAccessibility.remarks
                },
                {
                  key: 'directionalSignages',
                  label: 'Directional Signages',
                  description: 'Clear and visible room labels, directional signs',
                  value: formData.accessibility.directionalSignages.rating,
                  remarks: formData.accessibility.directionalSignages.remarks
                },
                {
                  key: 'pathways',
                  label: 'Pathways',
                  description: 'Corridors, aisles, and entrances free of obstructions',
                  value: formData.accessibility.pathways.rating,
                  remarks: formData.accessibility.pathways.remarks
                }
              ]}
              onRatingChange={(key, value) => handleRatingChange('accessibility', key, value)}
              onRemarksChange={(key, value) => handleRemarksChange('accessibility', key, value)}
            />
          </div>
        );
        
      case 4:
        const functionalityScore = calculateAllCategoryScores(formData)[1];
        
        return (
          <div className="space-y-8">
            {/* Functionality Score Card */}
            <WeightedScoreCard
              categoryName="2. Functionality"
              totalRating={functionalityScore?.totalRating || 0}
              maxPossibleScore={functionalityScore?.maxPossibleScore || 0}
              categoryScore={functionalityScore?.categoryScore || 0}
              weight={functionalityScore?.weight || 0}
              weightedScore={functionalityScore?.weightedScore || 0}
            />
            
            <RatingSectionWithRemarks
              title="2. Functionality"
              description="Environmental and operational factors"
              criteria={[
                {
                  key: 'flexibility',
                  label: 'Flexibility',
                  description: 'Furniture and room layout adaptable for various teaching activities',
                  value: formData.functionality.flexibility.rating,
                  remarks: formData.functionality.flexibility.remarks
                },
                {
                  key: 'ventilation',
                  label: 'Ventilation and Temperature',
                  description: 'Functioning ventilation with proper temperature control',
                  value: formData.functionality.ventilation.rating,
                  remarks: formData.functionality.ventilation.remarks
                },
                {
                  key: 'noiseLevel',
                  label: 'Noise Level',
                  description: 'Minimal external noise and vibrations',
                  value: formData.functionality.noiseLevel.rating,
                  remarks: formData.functionality.noiseLevel.remarks
                }
              ]}
              onRatingChange={(key, value) => handleRatingChange('functionality', key, value)}
              onRemarksChange={(key, value) => handleRemarksChange('functionality', key, value)}
            />
          </div>
        );
        
      case 5:
        const utilityScore = calculateAllCategoryScores(formData)[2];
        
        return (
          <div className="space-y-8">
            {/* Utility Score Card */}
            <WeightedScoreCard
              categoryName="3. Utility"
              totalRating={utilityScore?.totalRating || 0}
              maxPossibleScore={utilityScore?.maxPossibleScore || 0}
              categoryScore={utilityScore?.categoryScore || 0}
              weight={utilityScore?.weight || 0}
              weightedScore={utilityScore?.weightedScore || 0}
            />
            
            <RatingSectionWithRemarks
              title="3. Utility"
              description="Essential utilities and connectivity"
              criteria={[
                {
                  key: 'electricity',
                  label: 'Electricity',
                  description: 'Sufficient and working outlets and switches, safe wiring setup',
                  value: formData.utility.electricity.rating,
                  remarks: formData.utility.electricity.remarks
                },
                {
                  key: 'lighting',
                  label: 'Lighting',
                  description: 'Adequate natural/artificial lighting',
                  value: formData.utility.lighting.rating,
                  remarks: formData.utility.lighting.remarks
                },
                {
                  key: 'internetConnectivity',
                  label: 'Internet Connectivity',
                  description: 'Reliable Wi-Fi coverage and mobile data reception',
                  value: formData.utility.internetConnectivity.rating,
                  remarks: formData.utility.internetConnectivity.remarks
                }
              ]}
              onRatingChange={(key, value) => handleRatingChange('utility', key, value)}
              onRemarksChange={(key, value) => handleRemarksChange('utility', key, value)}
            />
          </div>
        );
        
      case 6:
        const sanitationScore = calculateAllCategoryScores(formData)[3];
        
        return (
          <div className="space-y-8">
            {/* Sanitation Score Card */}
            <WeightedScoreCard
              categoryName="4. Sanitation"
              totalRating={sanitationScore?.totalRating || 0}
              maxPossibleScore={sanitationScore?.maxPossibleScore || 0}
              categoryScore={sanitationScore?.categoryScore || 0}
              weight={sanitationScore?.weight || 0}
              weightedScore={sanitationScore?.weightedScore || 0}
            />
            
            <RatingSectionWithRemarks
              title="4. Sanitation"
              description="Cleanliness and hygiene standards"
              criteria={[
                {
                  key: 'cleanliness',
                  label: 'Cleanliness',
                  description: 'Floors, walls, windows clean and well-maintained',
                  value: formData.sanitation.cleanliness.rating,
                  remarks: formData.sanitation.cleanliness.remarks
                },
                {
                  key: 'wasteDisposal',
                  label: 'Waste Disposal',
                  description: 'Availability of trash bins',
                  value: formData.sanitation.wasteDisposal.rating,
                  remarks: formData.sanitation.wasteDisposal.remarks
                },
                {
                  key: 'odor',
                  label: 'Odor',
                  description: 'Room free from foul odor',
                  value: formData.sanitation.odor.rating,
                  remarks: formData.sanitation.odor.remarks
                },
                {
                  key: 'comfortRoomAccess',
                  label: 'Comfort Room Access',
                  description: 'Accessible restrooms within reasonable distance',
                  value: formData.sanitation.comfortRoomAccess.rating,
                  remarks: formData.sanitation.comfortRoomAccess.remarks
                }
              ]}
              onRatingChange={(key, value) => handleRatingChange('sanitation', key, value)}
              onRemarksChange={(key, value) => handleRemarksChange('sanitation', key, value)}
            />
          </div>
        );
        
      case 7:
        const equipmentScore = calculateAllCategoryScores(formData)[4];
        
        return (
          <div className="space-y-8">
            {/* Equipment Score Card */}
            <WeightedScoreCard
              categoryName="5. Equipment"
              totalRating={equipmentScore?.totalRating || 0}
              maxPossibleScore={equipmentScore?.maxPossibleScore || 0}
              categoryScore={equipmentScore?.categoryScore || 0}
              weight={equipmentScore?.weight || 0}
              weightedScore={equipmentScore?.weightedScore || 0}
            />
            
            <RatingSectionWithRemarks
              title="5. Equipment"
              description="Instructional equipment and technology"
              criteria={[
                {
                  key: 'projectorTvMonitorSpeakersMic',
                  label: 'Projector / TV / Monitor / Speakers / Microphone',
                  description: 'Available and functional for classroom instruction',
                  value: formData.equipment.projectorTvMonitorSpeakersMic.rating,
                  remarks: formData.equipment.projectorTvMonitorSpeakersMic.remarks
                }
              ]}
              onRatingChange={(key, value) => handleRatingChange('equipment', key, value)}
              onRemarksChange={(key, value) => handleRemarksChange('equipment', key, value)}
            />
          </div>
        );
        
      case 8:
        const furnitureScore = calculateAllCategoryScores(formData)[5];
        
        return (
          <div className="space-y-8">
            {/* Furniture & Fixtures Score Card */}
            <WeightedScoreCard
              categoryName="6. Furniture and Fixtures"
              totalRating={furnitureScore?.totalRating || 0}
              maxPossibleScore={furnitureScore?.maxPossibleScore || 0}
              categoryScore={furnitureScore?.categoryScore || 0}
              weight={furnitureScore?.weight || 0}
              weightedScore={furnitureScore?.weightedScore || 0}
            />
            
            <RatingSectionWithRemarks
              title="6. Furniture and Fixtures"
              description="Classroom furniture and fixtures assessment"
              criteria={[
                {
                  key: 'chairsDesks',
                  label: 'Student Chairs and Desks',
                  description: 'Sufficient, comfortable, and undamaged',
                  value: formData.furnitureFixtures.chairsDesks.rating,
                  remarks: formData.furnitureFixtures.chairsDesks.remarks
                },
                {
                  key: 'neutralDesk',
                  label: 'Neutral Desk / Armchair',
                  description: 'Inclusive seating options available',
                  value: formData.furnitureFixtures.neutralDesk.rating,
                  remarks: formData.furnitureFixtures.neutralDesk.remarks
                },
                {
                  key: 'teachersTablePodium',
                  label: 'Teachers Table / Podium',
                  description: 'Available and in good condition',
                  value: formData.furnitureFixtures.teachersTablePodium.rating,
                  remarks: formData.furnitureFixtures.teachersTablePodium.remarks
                },
                {
                  key: 'whiteboardBlackboard',
                  label: 'Whiteboard / Blackboard',
                  description: 'Usable, clean, with markers/chalk',
                  value: formData.furnitureFixtures.whiteboardBlackboard.rating,
                  remarks: formData.furnitureFixtures.whiteboardBlackboard.remarks
                }
              ]}
              onRatingChange={(key, value) => handleRatingChange('furnitureFixtures', key, value)}
              onRemarksChange={(key, value) => handleRemarksChange('furnitureFixtures', key, value)}
            />
          </div>
        );
        
      case 9:
        const spaceScore = calculateAllCategoryScores(formData)[6];
        
        return (
          <div className="space-y-8">
            {/* Space Score Card */}
            <WeightedScoreCard
              categoryName="7. Space"
              totalRating={spaceScore?.totalRating || 0}
              maxPossibleScore={spaceScore?.maxPossibleScore || 0}
              categoryScore={spaceScore?.categoryScore || 0}
              weight={spaceScore?.weight || 0}
              weightedScore={spaceScore?.weightedScore || 0}
            />
            
            <RatingSectionWithRemarks
              title="7. Space"
              description="Spatial arrangement and capacity"
              criteria={[
                {
                  key: 'roomCapacity',
                  label: 'Room Capacity',
                  description: 'Adequate for class size / avoids overcrowding',
                  value: formData.space.roomCapacity.rating,
                  remarks: formData.space.roomCapacity.remarks
                },
                {
                  key: 'layout',
                  label: 'Layout',
                  description: 'Allows free movement and visibility',
                  value: formData.space.layout.rating,
                  remarks: formData.space.layout.remarks
                },
                {
                  key: 'storage',
                  label: 'Storage',
                  description: 'Adequate space for materials',
                  value: formData.space.storage.rating,
                  remarks: formData.space.storage.remarks
                }
              ]}
              onRatingChange={(key, value) => handleRatingChange('space', key, value)}
              onRemarksChange={(key, value) => handleRemarksChange('space', key, value)}
            />
          </div>
        );
        
      case 10:
        const disasterScore = calculateAllCategoryScores(formData)[7];
        
        return (
          <div className="space-y-8">
            {/* Disaster Preparedness Score Card */}
            <WeightedScoreCard
              categoryName="8. Disaster Preparedness"
              totalRating={disasterScore?.totalRating || 0}
              maxPossibleScore={disasterScore?.maxPossibleScore || 0}
              categoryScore={disasterScore?.categoryScore || 0}
              weight={disasterScore?.weight || 0}
              weightedScore={disasterScore?.weightedScore || 0}
            />
            
            <RatingSectionWithRemarks
              title="8. Disaster Preparedness"
              description="Safety measures and emergency preparedness"
              criteria={[
                {
                  key: 'emergencyExitsFireSafety',
                  label: 'Emergency Exits & Fire Safety',
                  description: 'Fire extinguishers, alarms, clearly marked accessible exits',
                  value: formData.disasterPreparedness.emergencyExitsFireSafety.rating,
                  remarks: formData.disasterPreparedness.emergencyExitsFireSafety.remarks
                },
                {
                  key: 'earthquakePreparedness',
                  label: 'Earthquake Preparedness',
                  description: 'No falling hazards, secure fixtures, safe layout',
                  value: formData.disasterPreparedness.earthquakePreparedness.rating,
                  remarks: formData.disasterPreparedness.earthquakePreparedness.remarks
                },
                {
                  key: 'floodSafety',
                  label: 'Flood Safety',
                  description: 'Elevated location, electrical outlets positioned safely',
                  value: formData.disasterPreparedness.floodSafety.rating,
                  remarks: formData.disasterPreparedness.floodSafety.remarks
                },
                {
                  key: 'safetySignages',
                  label: 'Safety Signages',
                  description: 'Visible safety instructions and emergency contact information',
                  value: formData.disasterPreparedness.safetySignages.rating,
                  remarks: formData.disasterPreparedness.safetySignages.remarks
                }
              ]}
              onRatingChange={(key, value) => handleRatingChange('disasterPreparedness', key, value)}
              onRemarksChange={(key, value) => handleRemarksChange('disasterPreparedness', key, value)}
            />
          </div>
        );
        
      case 11:
        const inclusivityScore = calculateAllCategoryScores(formData)[8];
        const allCategoryScores = calculateAllCategoryScores(formData);
        const overallWeightedScore = calculateOverallWeightedScore(allCategoryScores);
        const ratingInterpretation = getRatingInterpretation(overallWeightedScore);
        const overallCondition = getOverallCondition(overallWeightedScore);
        
        return (
          <div className="space-y-8">
            {/* Inclusivity Score Card */}
            <WeightedScoreCard
              categoryName="9. Inclusivity"
              totalRating={inclusivityScore?.totalRating || 0}
              maxPossibleScore={inclusivityScore?.maxPossibleScore || 0}
              categoryScore={inclusivityScore?.categoryScore || 0}
              weight={inclusivityScore?.weight || 0}
              weightedScore={inclusivityScore?.weightedScore || 0}
            />
            
            <RatingSectionWithRemarks
              title="9. Inclusivity (Gender, Religion and Disability: RA11313, RA 11650)"
              description="Inclusive facilities and accommodations"
              criteria={[
                {
                  key: 'privacyInComfortRooms',
                  label: 'Privacy in Comfort Rooms',
                  description: 'Working locks, partitions that ensure safety and dignity',
                  value: formData.inclusivity.privacyInComfortRooms.rating,
                  remarks: formData.inclusivity.privacyInComfortRooms.remarks
                },
                {
                  key: 'genderNeutralRestrooms',
                  label: 'Gender-Neutral Restrooms / Facilities',
                  description: 'Availability or at least clear policies for safe CR access',
                  value: formData.inclusivity.genderNeutralRestrooms.rating,
                  remarks: formData.inclusivity.genderNeutralRestrooms.remarks
                },
                {
                  key: 'safeSpaces',
                  label: 'Safe Spaces',
                  description: 'Seating arrangements promote equality (not segregated unless necessary)',
                  value: formData.inclusivity.safeSpaces.rating,
                  remarks: formData.inclusivity.safeSpaces.remarks
                },
                {
                  key: 'classroomAssignmentSpecialNeeds',
                  label: 'Classroom Assignment for Students with Special Needs',
                  description: 'Students who are pregnant, lactating, or with disabilities are assigned to ground-floor, ramp-accessible locations',
                  value: formData.inclusivity.classroomAssignmentSpecialNeeds.rating,
                  remarks: formData.inclusivity.classroomAssignmentSpecialNeeds.remarks
                }
              ]}
              onRatingChange={(key, value) => handleRatingChange('inclusivity', key, value)}
              onRemarksChange={(key, value) => handleRemarksChange('inclusivity', key, value)}
            />

            {/* Assessment Summary */}
            <FormSection 
              title="Assessment Summary & Recommendations" 
              description="Review your assessment results and provide final observations"
              className="mt-8"
            >
              {/* Overall Weighted Score Display - Prominent */}
              <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="text-center space-y-4">
                    <h4 className="text-2xl">Overall Classroom Assessment Score</h4>
                    <div className="text-6xl mb-2">{overallWeightedScore.toFixed(2)}</div>
                    <div className="text-xl bg-white/20 inline-block px-6 py-2 rounded-full">
                      {ratingInterpretation}
                    </div>
                    <p className="text-sm text-blue-100">Weighted Average Score (Out of 100%)</p>
                    <div className="text-base bg-white/10 inline-block px-4 py-1 rounded mt-2">
                      Condition: {overallCondition}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* All Categories Weighted Scores in Grid */}
              <div className="mt-8">
                <h4 className="text-lg text-slate-900 mb-4">Category Breakdown</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allCategoryScores.map((category, index) => (
                    <WeightedScoreCard
                      key={index}
                      categoryName={category.name}
                      totalRating={category.totalRating}
                      maxPossibleScore={category.maxPossibleScore}
                      categoryScore={category.categoryScore}
                      weight={category.weight}
                      weightedScore={category.weightedScore}
                    />
                  ))}
                </div>
              </div>

              {/* Final Assessment Section */}
              <FormSection title="Final Evaluation" description="Provide detailed observations and recommended actions" className="mt-8">
                <FormGrid columns={1}>
                  <div>
                    <Label htmlFor="remarks" className="text-base">General Observations/Remarks:</Label>
                    <Textarea
                      id="remarks"
                      value={formData.remarks}
                      onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                      placeholder="Enter general observations about the classroom..."
                      rows={5}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="recommendingActions" className="text-base">Recommending Actions/Improvements:</Label>
                    <Textarea
                      id="recommendingActions"
                      value={formData.recommendingActions}
                      onChange={(e) => setFormData(prev => ({ ...prev, recommendingActions: e.target.value }))}
                      placeholder="Enter recommended actions for improvement..."
                      rows={5}
                      className="mt-2"
                    />
                  </div>
                </FormGrid>
              </FormSection>
            </FormSection>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Form Content - 2 columns on large screens */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-8">
            <div className="min-h-[600px]">
              {renderStepContent()}
            </div>
            
            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="px-6 py-2 h-11"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
            
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setCurrentStep(1);
                    setFormData({
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
                      functionality: { accessibility: 1, ventilation: 1, noiseLevel: 1 },
                      utility: { electricity: 1, lighting: 1, internetConnectivity: 1 },
                      sanitation: { cleanliness: 1, wasteDisposal: 1, odor: 1, comfortRoomAccess: 1, pwdFriendlyFacilities: 1 },
                      equipment: { projectorTvMonitor: 1, speakersMic: 1 },
                      furnitureFixtures: { chairsDesks: 1, teachersTable: 1, whiteboardBlackboard: 1 },
                      space: { roomCapacity: 1, layout: 1, storage: 1 },
                      disasterPreparedness: { emergencyExits: 1, earthquakePreparedness: 1, floodSafety: 1, safetySignages: 1 },
                      overallScore: 0,
                      overallCondition: 'Poor',
                      remarks: '',
                      recommendingActions: ''
                    });
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Reset Form
                </Button>
                
                {currentStep === totalSteps ? (
                  <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 px-8 py-2 h-11">
                    <Save className="w-4 h-4 mr-2" />
                    Submit Assessment
                  </Button>
                ) : (
                  <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700 px-6 py-2 h-11">
                    Next Step
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stepper Sidebar - 1 column on the right */}
      <div className="lg:col-span-1">
        <FormStepper
          steps={formSteps.map(step => ({
            ...step,
            completed: currentStep > step.id
          }))}
          currentStep={currentStep}
          onStepClick={(step) => setCurrentStep(step)}
          variant="sidebar"
          showProgress={true}
          className="sticky top-6"
        />
      </div>
    </div>
  );
}

// Enhanced Assessment Form Dialog Component - Following University Operations Pattern
function AssessmentFormDialog({ open, onOpenChange, record, onSave }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: any;
  onSave: (data: any) => void;
}) {
  const [formData, setFormData] = useState({
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
    
    // All assessment criteria
    functionality: {
      accessibility: 1,
      ventilation: 1,
      noiseLevel: 1
    },
    utility: {
      electricity: 1,
      lighting: 1,
      internetConnectivity: 1
    },
    sanitation: {
      cleanliness: 1,
      wasteDisposal: 1,
      odor: 1,
      comfortRoomAccess: 1,
      pwdFriendlyFacilities: 1
    },
    equipment: {
      projectorTvMonitor: 1,
      speakersMic: 1
    },
    furnitureFixtures: {
      chairsDesks: 1,
      teachersTable: 1,
      whiteboardBlackboard: 1
    },
    space: {
      roomCapacity: 1,
      layout: 1,
      storage: 1
    },
    disasterPreparedness: {
      emergencyExits: 1,
      earthquakePreparedness: 1,
      floodSafety: 1,
      safetySignages: 1
    },
    
    overallScore: 0,
    overallCondition: 'Poor',
    remarks: '',
    recommendingActions: ''
  });

  useEffect(() => {
    if (record) {
      setFormData({
        ...record,
        customRoomType: record.roomType && !['Lecture', 'Laboratory', 'Seminar Room'].includes(record.roomType) ? record.roomType : ''
      });
    } else {
      // Reset form for new records
      setFormData({
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
        functionality: {
          accessibility: 1,
          ventilation: 1,
          noiseLevel: 1
        },
        utility: {
          electricity: 1,
          lighting: 1,
          internetConnectivity: 1
        },
        sanitation: {
          cleanliness: 1,
          wasteDisposal: 1,
          odor: 1,
          comfortRoomAccess: 1,
          pwdFriendlyFacilities: 1
        },
        equipment: {
          projectorTvMonitor: 1,
          speakersMic: 1
        },
        furnitureFixtures: {
          chairsDesks: 1,
          teachersTable: 1,
          whiteboardBlackboard: 1
        },
        space: {
          roomCapacity: 1,
          layout: 1,
          storage: 1
        },
        disasterPreparedness: {
          emergencyExits: 1,
          earthquakePreparedness: 1,
          floodSafety: 1,
          safetySignages: 1
        },
        overallScore: 0,
        overallCondition: 'Poor',
        remarks: '',
        recommendingActions: ''
      });
    }
  }, [record, open]);

  const renderRatingSection = (categoryKey: string, categoryTitle: string, items: any, description?: string) => (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-300 rounded-xl p-6 shadow-sm space-y-5">
      <div className="border-b border-slate-300 pb-4">
        <h4 className="font-semibold text-slate-900 text-base">{categoryTitle}</h4>
        {description && (
          <p className="text-sm text-slate-600 mt-1">{description}</p>
        )}
      </div>
      
      <div className="space-y-6">
        {Object.entries(items).map(([itemKey, initialValue]) => (
          <div key={itemKey} className="space-y-3">
            <Label className="text-sm font-medium text-slate-700 capitalize block">
              {itemKey.replace(/([A-Z])/g, ' $1').trim()}
            </Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <Button
                  key={rating}
                  type="button"
                  variant={(formData as any)[categoryKey]?.[itemKey] === rating ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    [categoryKey]: {
                      ...(prev as any)[categoryKey],
                      [itemKey]: rating
                    }
                  }))}
                  className="w-10 h-10 p-0 font-semibold"
                >
                  {rating}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const calculateOverallScore = () => {
    const allScores = [
      ...Object.values(formData.functionality),
      ...Object.values(formData.utility),
      ...Object.values(formData.sanitation),
      ...Object.values(formData.equipment),
      ...Object.values(formData.furnitureFixtures),
      ...Object.values(formData.space),
      ...Object.values(formData.disasterPreparedness)
    ];
    const totalPoints = allScores.reduce((sum, score) => sum + score, 0);
    const maxPoints = allScores.length * 5;
    return (totalPoints / maxPoints) * 100;
  };

  const handleSave = () => {
    const overallScore = calculateOverallScore();
    let overallCondition = 'Unusable';
    if (overallScore >= 90) overallCondition = 'Excellent';
    else if (overallScore >= 75) overallCondition = 'Good';
    else if (overallScore >= 60) overallCondition = 'Need Improvement';

    onSave({
      ...formData,
      roomType: formData.roomType === 'Others' ? formData.customRoomType : formData.roomType,
      overallScore: parseFloat(overallScore.toFixed(1)),
      overallCondition,
      numberOfStudents: parseInt(formData.numberOfStudents) || 0,
      dateOfAssessment: formData.dateOfAssessment || new Date().toISOString().split('T')[0]
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[90vw] lg:max-w-[85vw] xl:max-w-[80vw] 2xl:max-w-[75vw] max-h-[95vh] bg-white border-0 shadow-2xl rounded-lg overflow-hidden">
        {/* Enhanced Formal Header */}
        <DialogHeader className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white -m-6 px-8 py-6 mb-0 relative">
          <Button
            onClick={() => onOpenChange(false)}
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 h-8 w-8 p-0 text-white hover:bg-white/10 hover:text-white rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
          <DialogTitle className="flex items-center gap-4 text-xl pr-12">
            <div className="p-3 bg-white/10 rounded-xl shadow-lg">
              <School className="h-6 w-6" />
            </div>
            <div>
              <span className="block">Classroom Assessment Management System</span>
              <p className="text-sm font-normal text-blue-100 mt-2 leading-relaxed">
                {record
                  ? `Editing Assessment Record: ${record.buildingName} - ${record.roomNumber}`
                  : "Creating New Classroom Assessment Record"}
              </p>
            </div>
          </DialogTitle>
          <DialogDescription className="sr-only">
            {record
              ? `Edit classroom assessment record for ${record.buildingName} ${record.roomNumber} including basic information, assessment criteria ratings, and recommendations.`
              : "Create a new classroom assessment record by providing classroom information, rating assessment criteria, and adding observations."}
          </DialogDescription>
        </DialogHeader>

        {/* Responsive Content Area with Smart Scrolling */}
        <div className="flex-1 overflow-y-auto max-h-[calc(95vh-200px)]">
          <div className="p-8 space-y-8">
            {/* Basic Information Panel */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-300 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-blue-300">
                <Building className="h-5 w-5 text-blue-600" />
                <h4 className="text-lg font-semibold text-slate-900">Classroom Information</h4>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <Label htmlFor="buildingName" className="text-sm font-semibold text-slate-700 mb-3 block">
                      Building Name
                    </Label>
                    <Input
                      id="buildingName"
                      value={formData.buildingName}
                      onChange={(e) => setFormData(prev => ({ ...prev, buildingName: e.target.value }))}
                      placeholder="Enter building name"
                      className="border-blue-400 bg-white h-11"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="roomNumber" className="text-sm font-semibold text-slate-700 mb-3 block">
                      Room Number
                    </Label>
                    <Input
                      id="roomNumber"
                      value={formData.roomNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, roomNumber: e.target.value }))}
                      placeholder="Enter room number"
                      className="border-blue-400 bg-white h-11"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="subject" className="text-sm font-semibold text-slate-700 mb-3 block">
                      Subject
                    </Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Enter subject"
                      className="border-blue-400 bg-white h-11"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-semibold text-slate-700 mb-3 block">Room Type</Label>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-4">
                        {['Lecture', 'Laboratory', 'Seminar Room', 'Others'].map((type) => (
                          <label key={type} className="flex items-center space-x-2">
                            <input
                              type="radio"
                              value={type}
                              checked={formData.roomType === type || (type === 'Others' && formData.customRoomType)}
                              onChange={(e) => setFormData(prev => ({ ...prev, roomType: e.target.value }))}
                              className="w-4 h-4 text-blue-600"
                            />
                            <span className="text-sm font-medium text-slate-700">{type}</span>
                          </label>
                        ))}
                      </div>
                      {(formData.roomType === 'Others' || formData.customRoomType) && (
                        <Input
                          value={formData.customRoomType}
                          onChange={(e) => setFormData(prev => ({ ...prev, customRoomType: e.target.value, roomType: 'Others' }))}
                          placeholder="Please specify room type"
                          className="border-blue-400 bg-white h-11"
                        />
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="numberOfStudents" className="text-sm font-semibold text-slate-700 mb-3 block">
                        No. of Students
                      </Label>
                      <Input
                        id="numberOfStudents"
                        type="number"
                        value={formData.numberOfStudents}
                        onChange={(e) => setFormData(prev => ({ ...prev, numberOfStudents: e.target.value }))}
                        placeholder="Enter number"
                        className="border-blue-400 bg-white h-11"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="dateOfAssessment" className="text-sm font-semibold text-slate-700 mb-3 block">
                        Assessment Date
                      </Label>
                      <Input
                        id="dateOfAssessment"
                        type="date"
                        value={formData.dateOfAssessment}
                        onChange={(e) => setFormData(prev => ({ ...prev, dateOfAssessment: e.target.value }))}
                        className="border-blue-400 bg-white h-11"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Assessment Criteria Grid */}
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Assessment Criteria Evaluation</h3>
                <p className="text-slate-600">Rate each criterion from 1 (Poor) to 5 (Excellent)</p>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {renderRatingSection('functionality', '1. Functionality', formData.functionality, 'Accessibility, ventilation, and noise level assessment')}
                {renderRatingSection('utility', '2. Utility Systems', formData.utility, 'Electrical, lighting, and connectivity infrastructure')}
                {renderRatingSection('sanitation', '3. Sanitation & Hygiene', formData.sanitation, 'Cleanliness, waste management, and facility access')}
                {renderRatingSection('equipment', '4. Teaching Equipment', formData.equipment, 'Audio-visual and presentation equipment availability')}
                {renderRatingSection('furnitureFixtures', '5. Furniture & Fixtures', formData.furnitureFixtures, 'Seating, desks, and teaching furniture condition')}
                {renderRatingSection('space', '6. Space Management', formData.space, 'Room capacity, layout efficiency, and storage')}
                {renderRatingSection('disasterPreparedness', '7. Safety & Preparedness', formData.disasterPreparedness, 'Emergency exits, safety measures, and signages')}
              </div>
            </div>

            {/* Score Summary */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 border border-green-300 rounded-xl p-6 shadow-sm">
              <div className="text-center space-y-4">
                <h4 className="text-lg font-semibold text-green-900">Assessment Results</h4>
                <div className="flex items-center justify-center space-x-8">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      {calculateOverallScore().toFixed(1)}%
                    </div>
                    <p className="text-sm font-medium text-green-800">Overall Score</p>
                  </div>
                  <div className="text-center">
                    <div className={`text-lg font-semibold px-4 py-2 rounded-full ${(() => {
                      const score = calculateOverallScore();
                      if (score >= 90) return 'bg-green-100 text-green-800';
                      if (score >= 75) return 'bg-blue-100 text-blue-800';
                      if (score >= 60) return 'bg-yellow-100 text-yellow-800';
                      return 'bg-red-100 text-red-800';
                    })()}`}>
                      {(() => {
                        const score = calculateOverallScore();
                        if (score >= 90) return 'Excellent';
                        if (score >= 75) return 'Good';
                        if (score >= 60) return 'Need Improvement';
                        return 'Unusable';
                      })()}
                    </div>
                    <p className="text-sm font-medium text-green-800 mt-2">Condition</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Remarks Section */}
            <div className="bg-gradient-to-br from-purple-50 to-violet-100 border border-purple-300 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-purple-300">
                <FileText className="h-5 w-5 text-purple-600" />
                <h4 className="text-lg font-semibold text-slate-900">Assessment Notes & Recommendations</h4>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="remarks" className="text-sm font-semibold text-slate-700 mb-3 block">
                    Observations & Remarks
                  </Label>
                  <Textarea
                    id="remarks"
                    value={formData.remarks}
                    onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                    placeholder="Enter detailed observations about the classroom condition, including specific issues found, notable strengths, and overall assessment..."
                    rows={6}
                    className="border-purple-400 bg-white resize-none leading-relaxed"
                  />
                </div>

                <div>
                  <Label htmlFor="recommendingActions" className="text-sm font-semibold text-slate-700 mb-3 block">
                    Recommended Actions
                  </Label>
                  <Textarea
                    id="recommendingActions"
                    value={formData.recommendingActions}
                    onChange={(e) => setFormData(prev => ({ ...prev, recommendingActions: e.target.value }))}
                    placeholder="Enter recommended actions for improvement, maintenance requirements, priority repairs, and suggested timeline for implementation..."
                    rows={6}
                    className="border-purple-400 bg-white resize-none leading-relaxed"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Footer */}
        <DialogFooter className="bg-gradient-to-r from-slate-100 via-slate-200 to-slate-300 border-t border-slate-400 -m-6 mt-0 p-6 flex-shrink-0">
          <div className="flex flex-col sm:flex-row justify-between items-center w-full gap-4">
            <div className="text-sm text-slate-600 order-2 sm:order-1">
              <span>
                Last modified: {record?.lastModified 
                  ? new Date(record.lastModified).toLocaleDateString() 
                  : 'Never'}
              </span>
            </div>
            <div className="flex gap-3 order-1 sm:order-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-slate-400 hover:bg-slate-100 px-6 py-2"
              >
                Cancel Changes
              </Button>
              <Button
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 shadow-lg px-8 py-2"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Assessment Record
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}