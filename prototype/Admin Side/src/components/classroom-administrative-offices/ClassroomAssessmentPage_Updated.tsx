import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { 
  School, MapPin, Plus, Edit, Target, TrendingUp, BarChart3, 
  FileText, Download, CheckCircle, AlertCircle, CalendarDays, 
  List, Grid, Trash2, Eye
} from 'lucide-react';
import { GeneralFilter } from './components/GeneralFilter';
import { SimpleAssessmentStepper } from './components/SimpleAssessmentStepper';
import { ClassroomRecordDialog } from './dialogs/AssessmentRecordDialogs';
import { CLASSROOM_ASSESSMENT_RECORDS } from './data/assessmentRecordsData';
import { toast } from 'sonner@2.0.3';

interface ClassroomAssessmentPageProps {
  userRole: string;
  requireAuth: (action: string) => boolean;
  onProjectSelect: (project: any) => void;
  filterData?: any;
  onClearFilters: () => void;
}

// CSU Colleges Configuration
const CSU_COLLEGES = [
  { code: 'CED', name: 'College of Education', rooms: 22, avgScore: 4.1, status: 'Needs Attention' },
  { code: 'CMNS', name: 'College of Mathematics and Natural Sciences', rooms: 18, avgScore: 4.3, status: 'Good' },
  { code: 'CAA', name: 'College of Agriculture and Aquaculture', rooms: 20, avgScore: 4.2, status: 'Good' },
  { code: 'COFES', name: 'College of Forestry and Environmental Sciences', rooms: 15, avgScore: 4.0, status: 'Needs Improvement' },
  { code: 'CCIS', name: 'College of Computing and Information Sciences', rooms: 12, avgScore: 4.4, status: 'Excellent' },
  { code: 'CEGS', name: 'College of Engineering and Geosciences', rooms: 16, avgScore: 3.9, status: 'Needs Improvement' },
  { code: 'CHASS', name: 'College of Humanities, Arts and Social Sciences', rooms: 14, avgScore: 4.2, status: 'Good' },
  { code: 'SOM', name: 'School of Medicine', rooms: 8, avgScore: 4.5, status: 'Excellent' }
];

const CLASSROOM_ASSESSMENT_DATA = {
  overview: {
    totalClassrooms: 125,
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
      colleges: CSU_COLLEGES.slice(0, 5)
    },
    'CSU Cabadbaran Campus': {
      totalRooms: 38,
      assessedRooms: 32,
      avgScore: 4.0,
      lastAssessment: '1 day ago',
      completionRate: 84,
      colleges: CSU_COLLEGES.slice(5)
    }
  }
};

export function ClassroomAssessmentPage({ 
  userRole, 
  requireAuth, 
  onProjectSelect, 
  filterData, 
  onClearFilters 
}: ClassroomAssessmentPageProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCampus, setSelectedCampus] = useState('all');
  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedCollege, setSelectedCollege] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('list');
  
  // CRUD states
  const [assessmentRecords, setAssessmentRecords] = useState(CLASSROOM_ASSESSMENT_RECORDS);
  const [showRecordDialog, setShowRecordDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  const canEdit = userRole === 'Admin' || userRole === 'Staff';
  const canDelete = userRole === 'Admin';

  const handleNewAssessment = () => {
    if (!requireAuth('create assessment')) return;
    setSelectedRecord(null);
    setDialogMode('add');
    setShowRecordDialog(true);
  };

  const handleEditRecord = (record: any) => {
    if (!requireAuth('edit assessment')) return;
    setSelectedRecord(record);
    setDialogMode('edit');
    setShowRecordDialog(true);
  };

  const handleViewRecord = (record: any) => {
    setSelectedRecord(record);
    setDialogMode('view');
    setShowRecordDialog(true);
  };

  const handleDeleteRecord = (recordId: string) => {
    if (!requireAuth('delete assessment')) return;
    setAssessmentRecords(prev => prev.filter(record => record.id !== recordId));
    toast.success('Assessment record deleted successfully');
  };

  const handleSaveRecord = (recordData: any) => {
    if (dialogMode === 'add') {
      const newRecord = {
        ...recordData,
        id: `CA-${new Date().getFullYear()}-${String(assessmentRecords.length + 1).padStart(3, '0')}`,
        status: 'Completed'
      };
      setAssessmentRecords(prev => [...prev, newRecord]);
    } else if (dialogMode === 'edit') {
      setAssessmentRecords(prev => prev.map(record => 
        record.id === selectedRecord.id ? { ...recordData, id: selectedRecord.id } : record
      ));
    }
  };

  const handleClearAllFilters = () => {
    setSelectedYear('2024');
    setSelectedCampus('all');
    setSelectedCollege('all');
    setSearchTerm('');
    toast.info('All filters cleared');
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
      'Need Improvement': 'text-amber-600 bg-amber-50',
      'Needs Improvement': 'text-amber-600 bg-amber-50',
      'Needs Attention': 'text-red-600 bg-red-50',
      'Unusable': 'text-red-600 bg-red-50'
    };
    return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-50';
  };

  const currentYearData = CLASSROOM_ASSESSMENT_DATA.yearFilters[selectedYear as keyof typeof CLASSROOM_ASSESSMENT_DATA.yearFilters];

  const filteredRecords = assessmentRecords.filter(record => {
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
                <h1 className="text-gray-900">Classroom Assessment Management</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Comprehensive evaluation of classroom learning environments
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
                <CalendarDays className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-blue-800">Academic Year:</span>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-[100px] border-blue-300 bg-white h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2022">2022</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {canEdit && (
                <Button onClick={handleNewAssessment} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  New Assessment
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Proper Tab Highlighting */}
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
            {/* Campus Performance */}
            <div className="space-y-4">
              <h2 className="text-gray-900">Campus Performance</h2>
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
                            <CardTitle className="text-gray-900">{campusName}</CardTitle>
                            <CardDescription className="text-sm">Last updated: {campusData.lastAssessment}</CardDescription>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg ${getRatingColor(campusData.avgScore)}`}>
                            {campusData.avgScore}/5
                          </p>
                          <p className="text-xs text-gray-500">Avg Score</p>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center text-sm mb-2">
                            <span className="text-gray-600">Assessment Progress</span>
                            <span>{campusData.completionRate}%</span>
                          </div>
                          <Progress value={campusData.completionRate} className="h-3" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <p className="text-lg text-blue-600">{campusData.assessedRooms}</p>
                            <p className="text-xs text-blue-600">Assessed Rooms</p>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <p className="text-lg text-gray-600">{campusData.totalRooms}</p>
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
              <h2 className="text-gray-900">Assessment Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-white shadow-sm border border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Total Classrooms</p>
                        <p className="text-3xl text-blue-600">{CLASSROOM_ASSESSMENT_DATA.overview.totalClassrooms}</p>
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
                        <p className="text-sm text-gray-600 mb-1">Assessed</p>
                        <p className="text-3xl text-emerald-600">{currentYearData.completed}</p>
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
                        <p className="text-sm text-gray-600 mb-1">Average Score</p>
                        <p className={`text-3xl ${getRatingColor(currentYearData.avgScore)}`}>
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
                        <p className="text-sm text-gray-600 mb-1">Priority Actions</p>
                        <p className="text-3xl text-amber-600">{CLASSROOM_ASSESSMENT_DATA.overview.priorityActions}</p>
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

            {/* Downloadable Forms */}
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-gray-900">Assessment Forms & Templates</CardTitle>
                    <CardDescription>Download standard assessment forms or manage form inventory</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
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
                        <p className="text-xs text-gray-500 mb-2">Standard evaluation template</p>
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

          {/* College Analysis Tab */}
          <TabsContent value="college-analysis" className="space-y-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-slate-900">College Performance Analysis</h2>
                  <p className="text-sm text-slate-600 mt-1">Systematic evaluation of learning spaces across academic units</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-800">Data Visualization</span>
                </div>
              </div>
              
              <Card className="bg-white shadow-sm border border-slate-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-slate-900">College Assessment Overview</CardTitle>
                  <CardDescription>Comparative performance across academic units</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {CSU_COLLEGES.map((college) => {
                      const collegeRecords = filteredRecords.filter(record => record.college === college.code);
                      const avgScore = collegeRecords.length > 0 
                        ? collegeRecords.reduce((sum, record) => sum + record.overallScore, 0) / collegeRecords.length
                        : college.avgScore;
                      
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
                                <span className="text-xs text-slate-700 group-hover:text-blue-700">{college.code}</span>
                              </div>
                              <Badge variant="outline" className={`text-xs ${getStatusColor(college.status)}`}>
                                {avgScore >= 4.5 ? 'A' : avgScore >= 4.0 ? 'B' : avgScore >= 3.5 ? 'C' : 'D'}
                              </Badge>
                            </div>
                            <div>
                              <div className={`text-2xl ${getRatingColor(avgScore)}`}>
                                {avgScore.toFixed(1)}
                              </div>
                              <p className="text-xs text-slate-500 mt-1">{collegeRecords.length || college.rooms} assessments</p>
                            </div>
                            <Progress value={(avgScore / 5) * 100} className="h-1.5" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Assessment Insights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-emerald-50 border border-emerald-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-emerald-800">Performance Strengths</h3>
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
                      <h3 className="text-amber-800">Improvement Areas</h3>
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
                      <h3 className="text-red-800">Priority Actions</h3>
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

          {/* Assessment Forms Tab with Simple Stepper */}
          <TabsContent value="forms" className="space-y-6">
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">Classroom Assessment Form</CardTitle>
                <CardDescription>
                  Comprehensive evaluation system based on CSU standardized criteria
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Simple Assessment Stepper */}
                  <div className="lg:col-span-1">
                    <SimpleAssessmentStepper
                      steps={[
                        { id: 1, title: 'Basic Information', description: 'Classroom identification' },
                        { id: 2, title: 'Class Details', description: 'Schedule and enrollment' },
                        { id: 3, title: 'Functionality', description: 'Accessibility factors' },
                        { id: 4, title: 'Infrastructure', description: 'Utilities and sanitation' },
                        { id: 5, title: 'Resources', description: 'Equipment assessment' },
                        { id: 6, title: 'Safety & Space', description: 'Disaster preparedness' },
                        { id: 7, title: 'Final Assessment', description: 'Overall evaluation' }
                      ]}
                      currentStep={1}
                    />
                  </div>

                  {/* Form Content */}
                  <div className="lg:col-span-3">
                    <div className="p-6 border border-slate-200 rounded-lg bg-slate-50">
                      <p className="text-sm text-slate-600 text-center">
                        Assessment form interface will appear here. Use the "+ New Assessment" button above to start a new assessment.
                      </p>
                      <div className="mt-4 flex justify-center">
                        <Button onClick={handleNewAssessment} className="bg-blue-600 hover:bg-blue-700">
                          <Plus className="w-4 h-4 mr-2" />
                          Start New Assessment
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assessment Records Tab with Full CRUD */}
          <TabsContent value="assessment-records" className="space-y-6">
            {viewMode === 'list' ? (
              <Card className="bg-white shadow-sm border border-gray-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-gray-900">Assessment Records</CardTitle>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-gray-300 rounded-lg p-1">
                        <Button
                          variant={viewMode === 'list' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setViewMode('list')}
                          className="px-3 h-8"
                        >
                          <List className="w-4 h-4" />
                        </Button>
                        <Button
                          variant={viewMode === 'cards' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setViewMode('cards')}
                          className="px-3 h-8"
                        >
                          <Grid className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                      {canEdit && (
                        <Button onClick={handleNewAssessment} size="sm" className="bg-blue-600 hover:bg-blue-700">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Record
                        </Button>
                      )}
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
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>
                            <div>
                              <p className="text-gray-900">{record.buildingName}</p>
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
                            <span className={`${getRatingColor(record.overallScore)}`}>
                              {record.overallScore}/5
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(record.overallCondition)}>
                              {record.overallCondition}
                            </Badge>
                          </TableCell>
                          <TableCell>{record.dateOfAssessment}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm" onClick={() => handleViewRecord(record)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              {canEdit && (
                                <Button variant="ghost" size="sm" onClick={() => handleEditRecord(record)}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                              )}
                              {canDelete && (
                                <Button variant="ghost" size="sm" onClick={() => handleDeleteRecord(record.id)}>
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
                        <p className="text-sm text-gray-900">{record.subject}</p>
                        <p className="text-xs text-gray-500">{record.roomType}</p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Overall Score:</span>
                        <span className={`${getRatingColor(record.overallScore)}`}>
                          {record.overallScore}/5
                        </span>
                      </div>
                      
                      <Badge className={getStatusColor(record.overallCondition)}>
                        {record.overallCondition}
                      </Badge>
                      
                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-xs text-gray-500">{record.dateOfAssessment}</span>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleViewRecord(record)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          {canEdit && (
                            <Button variant="ghost" size="sm" onClick={() => handleEditRecord(record)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                          {canDelete && (
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

      {/* CRUD Dialog */}
      <ClassroomRecordDialog
        open={showRecordDialog}
        onOpenChange={setShowRecordDialog}
        record={selectedRecord}
        onSubmit={handleSaveRecord}
        colleges={CSU_COLLEGES}
        mode={dialogMode}
      />
    </div>
  );
}
