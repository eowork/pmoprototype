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
  Briefcase, MapPin, Plus, Edit, Target, TrendingUp, BarChart3, 
  FileText, Download, CheckCircle, AlertCircle, CalendarDays, 
  List, Grid, Trash2, Eye
} from 'lucide-react';
import { GeneralFilter } from './components/GeneralFilter';
import { SimpleAssessmentStepper } from './components/SimpleAssessmentStepper';
import { AdminOfficeRecordDialog } from './dialogs/AssessmentRecordDialogs';
import { ADMIN_OFFICE_ASSESSMENT_RECORDS } from './data/assessmentRecordsData';
import { toast } from 'sonner@2.0.3';

interface AdminOfficeAssessmentPageProps {
  userRole: string;
  requireAuth: (action: string) => boolean;
  onProjectSelect: (project: any) => void;
  filterData?: any;
  onClearFilters: () => void;
}

// CSU Departments Configuration
const CSU_DEPARTMENTS = [
  { code: 'OTP', name: 'Office of the President', type: 'Executive', campus: 'Main', offices: 3, avgScore: 4.5, status: 'Excellent' },
  { code: 'OVPAA', name: 'Office of the Vice President for Academic Affairs', type: 'Academic', campus: 'Main', offices: 2, avgScore: 4.3, status: 'Good' },
  { code: 'OVPRE', name: 'Office of the Vice President for Research and Extension', type: 'Research', campus: 'Main', offices: 2, avgScore: 4.2, status: 'Good' },
  { code: 'OVPAF', name: 'Office of the Vice President for Administration and Finance', type: 'Administrative', campus: 'Main', offices: 4, avgScore: 3.9, status: 'Needs Improvement' },
  { code: 'REG', name: 'Office of the Registrar', type: 'Academic', campus: 'Both', offices: 6, avgScore: 3.8, status: 'Needs Improvement' },
  { code: 'HRMO', name: 'Human Resource Management Office', type: 'Administrative', campus: 'Main', offices: 3, avgScore: 4.1, status: 'Good' },
  { code: 'ACCT', name: 'Accounting Office', type: 'Administrative', campus: 'Both', offices: 4, avgScore: 4.0, status: 'Good' },
  { code: 'LIB', name: 'Library Services', type: 'Academic', campus: 'Both', offices: 4, avgScore: 4.4, status: 'Excellent' },
  { code: 'ITS', name: 'Information Technology Services', type: 'Technical', campus: 'Both', offices: 5, avgScore: 4.2, status: 'Good' },
  { code: 'GSO', name: 'General Services Office', type: 'Support', campus: 'Both', offices: 3, avgScore: 3.7, status: 'Needs Improvement' },
  { code: 'OSA', name: 'Office of Student Affairs', type: 'Student Services', campus: 'Both', offices: 4, avgScore: 4.3, status: 'Good' },
  { code: 'PPDO', name: 'Planning and Development Office', type: 'Planning', campus: 'Main', offices: 2, avgScore: 4.4, status: 'Excellent' }
];

const ADMIN_OFFICE_DATA = {
  overview: {
    totalOffices: 42,
    assessedOffices: 38,
    avgOverallScore: 4.0,
    completionRate: 90.5,
    priorityActions: 11
  },
  yearFilters: {
    2024: { completed: 38, pending: 4, avgScore: 4.0 },
    2023: { completed: 35, pending: 3, avgScore: 3.9 },
    2022: { completed: 30, pending: 2, avgScore: 3.8 }
  },
  campuses: {
    'CSU Main Campus': {
      totalOffices: 25,
      assessedOffices: 23,
      avgScore: 4.1,
      lastAssessment: '3 hours ago',
      completionRate: 92,
      departments: CSU_DEPARTMENTS.filter(dept => dept.campus === 'Main' || dept.campus === 'Both')
    },
    'CSU Cabadbaran Campus': {
      totalOffices: 17,
      assessedOffices: 15,
      avgScore: 3.9,
      lastAssessment: '1 day ago',
      completionRate: 88,
      departments: CSU_DEPARTMENTS.filter(dept => dept.campus === 'Cabadbaran' || dept.campus === 'Both')
    }
  }
};

export function AdminOfficeAssessmentPage({ 
  userRole, 
  requireAuth, 
  onProjectSelect, 
  filterData, 
  onClearFilters 
}: AdminOfficeAssessmentPageProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCampus, setSelectedCampus] = useState('all');
  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('list');
  
  // CRUD states
  const [assessmentRecords, setAssessmentRecords] = useState(ADMIN_OFFICE_ASSESSMENT_RECORDS);
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
        id: `AO-${new Date().getFullYear()}-${String(assessmentRecords.length + 1).padStart(3, '0')}`,
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
    setSelectedDepartment('all');
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
      'Poor': 'text-red-600 bg-red-50'
    };
    return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-50';
  };

  const currentYearData = ADMIN_OFFICE_DATA.yearFilters[selectedYear as keyof typeof ADMIN_OFFICE_DATA.yearFilters];

  const filteredRecords = assessmentRecords.filter(record => {
    const matchesSearch = record.officeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.officeType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCampus = selectedCampus === 'all' || record.campus === selectedCampus;
    const matchesDepartment = selectedDepartment === 'all' || record.department === selectedDepartment;
    
    return matchesSearch && matchesCampus && matchesDepartment;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-gray-900">Administrative Office Assessment</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Comprehensive evaluation of administrative office spaces and working conditions
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-lg border border-emerald-200">
                <CalendarDays className="w-5 h-5 text-emerald-600" />
                <span className="text-sm text-emerald-800">Academic Year:</span>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-[100px] border-emerald-300 bg-white h-9">
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
                <Button onClick={handleNewAssessment} className="bg-emerald-600 hover:bg-emerald-700">
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
              className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="department-analysis"
              className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm"
            >
              Department Analysis
            </TabsTrigger>
            <TabsTrigger 
              value="forms"
              className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm"
            >
              Assessment Forms
            </TabsTrigger>
            <TabsTrigger 
              value="assessment-records"
              className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm"
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
            selectedCollege={selectedDepartment}
            onCollegeChange={setSelectedDepartment}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onClearFilters={handleClearAllFilters}
            colleges={CSU_DEPARTMENTS.map(dept => ({ code: dept.code, name: dept.name }))}
            showCollegeFilter={true}
          />

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Campus Performance */}
            <div className="space-y-4">
              <h2 className="text-gray-900">Campus Performance</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {Object.entries(ADMIN_OFFICE_DATA.campuses).map(([campusName, campusData]) => (
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
                          <div className="text-center p-3 bg-emerald-50 rounded-lg">
                            <p className="text-lg text-emerald-600">{campusData.assessedOffices}</p>
                            <p className="text-xs text-emerald-600">Assessed Offices</p>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <p className="text-lg text-gray-600">{campusData.totalOffices}</p>
                            <p className="text-xs text-gray-600">Total Offices</p>
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
                        <p className="text-sm text-gray-600 mb-1">Total Offices</p>
                        <p className="text-3xl text-emerald-600">{ADMIN_OFFICE_DATA.overview.totalOffices}</p>
                        <p className="text-xs text-gray-500 mt-1">Both campuses</p>
                      </div>
                      <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
                        <Briefcase className="w-6 h-6 text-emerald-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Assessed</p>
                        <p className="text-3xl text-blue-600">{currentYearData.completed}</p>
                        <p className="text-xs text-gray-500 mt-1">{ADMIN_OFFICE_DATA.overview.completionRate}% complete</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-blue-600" />
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
                        <p className="text-3xl text-amber-600">{ADMIN_OFFICE_DATA.overview.priorityActions}</p>
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
                  <div className="p-4 border border-slate-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50/50 transition-all cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-emerald-50 rounded-lg">
                        <FileText className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm text-gray-900 mb-1">Office Assessment Form</h4>
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

          {/* Department Analysis Tab */}
          <TabsContent value="department-analysis" className="space-y-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-slate-900">Department Performance Analysis</h2>
                  <p className="text-sm text-slate-600 mt-1">Comprehensive assessment of administrative office efficiency and conditions</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-lg border border-emerald-200">
                  <BarChart3 className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm text-emerald-800">Department Analytics</span>
                </div>
              </div>
              
              <Card className="bg-white shadow-sm border border-slate-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-slate-900">Administrative Units Overview</CardTitle>
                  <CardDescription>Performance metrics across university departments and offices</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {CSU_DEPARTMENTS.map((department) => {
                      const deptRecords = filteredRecords.filter(record => record.department === department.code);
                      const avgScore = deptRecords.length > 0 
                        ? deptRecords.reduce((sum, record) => sum + record.overallScore, 0) / deptRecords.length
                        : department.avgScore;
                      
                      return (
                        <div 
                          key={department.code} 
                          className="p-4 border border-slate-200 rounded-lg hover:shadow-md hover:border-emerald-400 hover:bg-emerald-50/30 transition-all cursor-pointer group"
                          onClick={() => {
                            setSelectedDepartment(department.code);
                            setActiveTab('assessment-records');
                          }}
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="px-2.5 py-1 bg-slate-100 group-hover:bg-emerald-100 rounded-md transition-colors">
                                <span className="text-xs text-slate-700 group-hover:text-emerald-700">{department.code}</span>
                              </div>
                              <Badge variant="outline" className={`text-xs ${getStatusColor(department.status)}`}>
                                {avgScore >= 4.5 ? 'A' : avgScore >= 4.0 ? 'B' : avgScore >= 3.5 ? 'C' : 'D'}
                              </Badge>
                            </div>
                            <div>
                              <div className={`text-2xl ${getRatingColor(avgScore)}`}>
                                {avgScore.toFixed(1)}
                              </div>
                              <p className="text-xs text-slate-500 mt-1">{deptRecords.length || department.offices} assessments</p>
                            </div>
                            <Progress value={(avgScore / 5) * 100} className="h-1.5" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Assessment Forms Tab with Simple Stepper */}
          <TabsContent value="forms" className="space-y-6">
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">Office Assessment Form</CardTitle>
                <CardDescription>
                  Comprehensive evaluation system for administrative office spaces
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Simple Assessment Stepper */}
                  <div className="lg:col-span-1">
                    <SimpleAssessmentStepper
                      steps={[
                        { id: 1, title: 'Basic Information', description: 'Office identification' },
                        { id: 2, title: 'Office Details', description: 'Staff and capacity info' },
                        { id: 3, title: 'Functionality', description: 'Accessibility factors' },
                        { id: 4, title: 'Infrastructure', description: 'Utilities and equipment' },
                        { id: 5, title: 'Space & Layout', description: 'Office configuration' },
                        { id: 6, title: 'Safety & Security', description: 'Safety measures' },
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
                        <Button onClick={handleNewAssessment} className="bg-emerald-600 hover:bg-emerald-700">
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
                        <Button onClick={handleNewAssessment} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
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
                        <TableHead>Office Name</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Location</TableHead>
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
                              <p className="text-gray-900">{record.officeName}</p>
                              <p className="text-sm text-gray-600">{record.officeType}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{record.department}</Badge>
                          </TableCell>
                          <TableCell>{record.officeLocation}</TableCell>
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
                          <CardTitle className="text-base">{record.officeName}</CardTitle>
                          <CardDescription>{record.officeType}</CardDescription>
                        </div>
                        <Badge variant="outline">{record.department}</Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-900">{record.officeLocation}</p>
                        <p className="text-xs text-gray-500">{record.campus}</p>
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
      <AdminOfficeRecordDialog
        open={showRecordDialog}
        onOpenChange={setShowRecordDialog}
        record={selectedRecord}
        onSubmit={handleSaveRecord}
        departments={CSU_DEPARTMENTS}
        mode={dialogMode}
      />
    </div>
  );
}
