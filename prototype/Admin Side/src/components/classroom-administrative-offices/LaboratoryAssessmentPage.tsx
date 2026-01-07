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
  CalendarDays, List, Grid, Upload, Download, Trash2, Save, X, ChevronLeft, Check, Beaker
} from 'lucide-react';
import FormStepper from './components/FormStepper';
import { FormSection, FormField, FormGrid } from './components/FormSection';
import RatingSection from './components/RatingSection';
import { RatingSectionWithRemarks } from './components/RatingSectionWithRemarks';
import { WeightedScoreCard } from './components/WeightedScoreCard';
import { GeneralFilter } from './components/GeneralFilter';
import { toast } from 'sonner@2.0.3';
import { 
  isLaboratoryAssessmentAdmin, 
  getStatusBadgeStyle, 
  filterRecordsByPermission 
} from '../../utils/pagePermissions';
import { 
  calculateAllCategoryScores, 
  calculateOverallWeightedScore, 
  getRatingInterpretation, 
  getOverallCondition 
} from './utils/weightedScoring';
import { LaboratoryAssessmentCRUDDialog } from './dialogs/LaboratoryAssessmentCRUDDialog';

interface LaboratoryAssessmentPageProps {
  userRole: string;
  requireAuth: (action: string) => boolean;
  onProjectSelect: (project: any) => void;
  filterData?: any;
  onClearFilters: () => void;
  userProfile?: any;
}

// Updated colleges according to CSU structure
const CSU_COLLEGES = [
  { code: 'CED', name: 'College of Education', labs: 18, avgScore: 4.2, priority: 'Medium', status: 'Good' },
  { code: 'CMNS', name: 'College of Mathematics and Natural Sciences', labs: 22, avgScore: 4.4, priority: 'Medium', status: 'Excellent' },
  { code: 'CAA', name: 'College of Agriculture and Aquaculture', labs: 16, avgScore: 4.1, priority: 'High', status: 'Good' },
  { code: 'COFES', name: 'College of Forestry and Environmental Sciences', labs: 12, avgScore: 4.0, priority: 'High', status: 'Needs Improvement' },
  { code: 'CCIS', name: 'College of Computing and Information Sciences', labs: 10, avgScore: 4.5, priority: 'Low', status: 'Excellent' },
  { code: 'CEGS', name: 'College of Engineering and Geosciences', labs: 14, avgScore: 4.3, priority: 'Medium', status: 'Good' },
  { code: 'CHASS', name: 'College of Humanities, Arts and Social Sciences', labs: 8, avgScore: 4.1, priority: 'Medium', status: 'Good' },
  { code: 'SOM', name: 'School of Medicine', labs: 4, avgScore: 4.6, priority: 'Low', status: 'Excellent' }
];

// Laboratory assessment data
const LABORATORY_ASSESSMENT_DATA = {
  overview: {
    totalLaboratories: 104,
    assessedLaboratories: 89,
    avgOverallScore: 4.2,
    completionRate: 85.6,
    priorityActions: 18
  },
  yearFilters: {
    2024: { completed: 89, pending: 15, avgScore: 4.2 },
    2023: { completed: 78, pending: 12, avgScore: 4.1 },
    2022: { completed: 68, pending: 10, avgScore: 4.0 }
  },
  campuses: {
    'CSU Main Campus': {
      totalLabs: 67,
      assessedLabs: 60,
      avgScore: 4.3,
      lastAssessment: '2 hours ago',
      completionRate: 90,
      colleges: [
        { code: 'CED', name: 'College of Education', labs: 12, avgScore: 4.2 },
        { code: 'CMNS', name: 'College of Mathematics and Natural Sciences', labs: 15, avgScore: 4.4 },
        { code: 'CCIS', name: 'College of Computing and Information Sciences', labs: 8, avgScore: 4.5 },
        { code: 'CEGS', name: 'College of Engineering and Geosciences', labs: 10, avgScore: 4.3 },
        { code: 'SOM', name: 'School of Medicine', labs: 4, avgScore: 4.6 }
      ]
    },
    'CSU Cabadbaran Campus': {
      totalLabs: 37,
      assessedLabs: 29,
      avgScore: 4.0,
      lastAssessment: '1 day ago',
      completionRate: 78,
      colleges: [
        { code: 'CAA', name: 'College of Agriculture and Aquaculture', labs: 16, avgScore: 4.1 },
        { code: 'COFES', name: 'College of Forestry and Environmental Sciences', labs: 12, avgScore: 4.0 },
        { code: 'CHASS', name: 'College of Humanities, Arts and Social Sciences', labs: 8, avgScore: 4.1 }
      ]
    }
  },
  assessmentRecords: [
    {
      id: 'LA-2024-001',
      buildingName: 'Science Building',
      laboratoryNumber: 'Chem Lab 301',
      subject: 'Organic Chemistry',
      labType: 'Laboratory',
      college: 'CMNS',
      campus: 'CSU Main Campus',
      semester: 'First Semester',
      academicYear: '2023-2024',
      numberOfStudents: 35,
      schedule: 'MWF 10:00-12:00 PM',
      dateOfAssessment: '2024-01-15',
      assessor: 'Dr. Juan Dela Cruz',
      position: 'Laboratory Supervisor',
      overallScore: 88.5,
      overallCondition: 'Excellent',
      remarks: 'Well-maintained chemistry laboratory with excellent safety features.',
      recommendingActions: 'Add additional storage cabinets. Update computer workstations.',
      recordStatus: 'Published',
      submittedBy: 'Dr. Juan Dela Cruz',
      dateCreated: '2024-01-15',
      lastModified: '2024-01-16'
    },
    {
      id: 'LA-2024-002',
      buildingName: 'Engineering Building',
      laboratoryNumber: 'Computer Lab 405',
      subject: 'Computer Programming',
      labType: 'Laboratory',
      college: 'CCIS',
      campus: 'CSU Main Campus',
      semester: 'First Semester',
      academicYear: '2023-2024',
      numberOfStudents: 40,
      schedule: 'TTH 1:00-3:00 PM',
      dateOfAssessment: '2024-01-14',
      assessor: 'Prof. Maria Santos',
      position: 'Lab Coordinator',
      overallScore: 76.3,
      overallCondition: 'Good',
      remarks: 'Computer laboratory needs improved ventilation.',
      recommendingActions: 'Install HVAC system. Upgrade workstations.',
      recordStatus: 'Draft',
      submittedBy: 'Prof. Maria Santos',
      dateCreated: '2024-01-14',
      lastModified: '2024-01-14'
    }
  ]
};

export function LaboratoryAssessmentPage({ 
  userRole, 
  requireAuth, 
  onProjectSelect, 
  filterData, 
  onClearFilters,
  userProfile 
}: LaboratoryAssessmentPageProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCampus, setSelectedCampus] = useState('all');
  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedCollege, setSelectedCollege] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('list');
  const [showAssessmentDialog, setShowAssessmentDialog] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [assessmentRecords, setAssessmentRecords] = useState(LABORATORY_ASSESSMENT_DATA.assessmentRecords);
  
  // Check if current user is page admin
  const isPageAdmin = isLaboratoryAssessmentAdmin(userProfile);

  const handleNewAssessment = () => {
    if (!requireAuth('create assessment')) return;
    setEditingRecord(null);
    setShowAssessmentDialog(true);
  };

  const handleEditRecord = (record: any) => {
    if (!requireAuth('edit assessment')) return;
    setEditingRecord(record);
    setShowAssessmentDialog(true);
  };

  const handleDeleteRecord = (recordId: string) => {
    if (!requireAuth('delete assessment')) return;
    setAssessmentRecords(prev => prev.filter(r => r.id !== recordId));
    toast.success('Assessment record deleted successfully');
  };

  const handleSaveRecord = (data: any) => {
    if (editingRecord) {
      setAssessmentRecords(prev => prev.map(r => 
        r.id === editingRecord.id 
          ? { ...r, ...data, lastModified: new Date().toISOString().split('T')[0] }
          : r
      ));
      toast.success('Assessment record updated successfully');
    } else {
      const newRecord = {
        ...data,
        id: `LA-${new Date().getFullYear()}-${String(assessmentRecords.length + 1).padStart(3, '0')}`,
        recordStatus: 'Draft',
        submittedBy: userProfile?.name || 'Admin',
        dateCreated: new Date().toISOString().split('T')[0],
        lastModified: new Date().toISOString().split('T')[0]
      };
      setAssessmentRecords(prev => [newRecord, ...prev]);
      toast.success('Assessment record created successfully');
    }
    setShowAssessmentDialog(false);
    setEditingRecord(null);
  };

  const handlePublishRecord = (recordId: string) => {
    if (!requireAuth('publish assessment')) return;
    setAssessmentRecords(prev => prev.map(r => 
      r.id === recordId 
        ? { ...r, recordStatus: 'Published', lastModified: new Date().toISOString().split('T')[0] }
        : r
    ));
    toast.success('Assessment record published successfully');
  };

  const handleClearAllFilters = () => {
    setSelectedYear('2024');
    setSelectedCampus('all');
    setSelectedCollege('all');
    setSearchTerm('');
  };

  // Filter logic
  const filteredRecords = assessmentRecords.filter(record => {
    const matchesSearch = !searchTerm || 
      record.buildingName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.laboratoryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCollege = selectedCollege === 'all' || record.college === selectedCollege;
    const matchesYear = record.academicYear.includes(selectedYear);
    const matchesCampus = selectedCampus === 'all' || record.campus === selectedCampus;

    return matchesSearch && matchesCollege && matchesYear && matchesCampus;
  });

  const currentYearData = LABORATORY_ASSESSMENT_DATA.yearFilters[selectedYear as keyof typeof LABORATORY_ASSESSMENT_DATA.yearFilters];

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-emerald-600';
    if (rating >= 3.5) return 'text-blue-600';
    if (rating >= 2.5) return 'text-amber-600';
    return 'text-red-600';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Excellent': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'Good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Needs Improvement': return 'text-amber-600 bg-amber-50 border-amber-200';
      default: return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Beaker className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl text-slate-900">Laboratory Assessment</h1>
                <p className="text-sm text-slate-600 mt-1">
                  Comprehensive evaluation system for laboratory facilities
                </p>
              </div>
            </div>
            
            {isPageAdmin && (
              <Button 
                onClick={handleNewAssessment}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Assessment
              </Button>
            )}
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
            {/* Campus Performance */}
            <div className="space-y-4">
              <h2 className="text-xl text-slate-900">Campus Performance</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {Object.entries(LABORATORY_ASSESSMENT_DATA.campuses).map(([campusName, campusData]) => (
                  <Card key={campusName} className="bg-white shadow-sm border border-slate-200">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-slate-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg text-slate-900">{campusName}</CardTitle>
                            <CardDescription className="text-sm">Last updated: {campusData.lastAssessment}</CardDescription>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg ${getRatingColor(campusData.avgScore)}`}>
                            {campusData.avgScore}/5
                          </p>
                          <p className="text-xs text-slate-500">Avg Score</p>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center text-sm mb-2">
                            <span className="text-slate-600">Assessment Progress</span>
                            <span>{campusData.completionRate}%</span>
                          </div>
                          <Progress value={campusData.completionRate} className="h-3" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <p className="text-lg text-blue-600">{campusData.assessedLabs}</p>
                            <p className="text-xs text-blue-600">Assessed Labs</p>
                          </div>
                          <div className="text-center p-3 bg-slate-50 rounded-lg">
                            <p className="text-lg text-slate-600">{campusData.totalLabs}</p>
                            <p className="text-xs text-slate-600">Total Labs</p>
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
              <h2 className="text-xl text-slate-900">Assessment Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-white shadow-sm border border-slate-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600 mb-1">Total Laboratories</p>
                        <p className="text-3xl text-blue-600">{LABORATORY_ASSESSMENT_DATA.overview.totalLaboratories}</p>
                        <p className="text-xs text-slate-500 mt-1">Both campuses</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Beaker className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border border-slate-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600 mb-1">Assessed</p>
                        <p className="text-3xl text-emerald-600">{currentYearData.completed}</p>
                        <p className="text-xs text-slate-500 mt-1">{LABORATORY_ASSESSMENT_DATA.overview.completionRate}% complete</p>
                      </div>
                      <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-emerald-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border border-slate-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600 mb-1">Average Score</p>
                        <p className={`text-3xl ${getRatingColor(currentYearData.avgScore)}`}>
                          {currentYearData.avgScore}/5
                        </p>
                        <p className="text-xs text-slate-500 mt-1">Good condition</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                        <Target className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border border-slate-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600 mb-1">Priority Actions</p>
                        <p className="text-3xl text-amber-600">{LABORATORY_ASSESSMENT_DATA.overview.priorityActions}</p>
                        <p className="text-xs text-slate-500 mt-1">Need attention</p>
                      </div>
                      <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-amber-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Key Insights */}
            <div className="space-y-4">
              <h2 className="text-xl text-slate-900">Key Insights & Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-green-50 border border-green-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-green-800">Strong Performance</h3>
                    </div>
                    <ul className="space-y-2 text-sm text-green-700">
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                        Safety compliance standards
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                        Equipment maintenance protocols
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                        Laboratory accessibility
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
                        PPE equipment inventory
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-amber-500 rounded-full"></div>
                        Waste management systems
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
                        Emergency equipment checks
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                        Chemical storage compliance
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                        Safety training updates
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* College Analysis Tab */}
          <TabsContent value="college-analysis" className="space-y-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl text-slate-900">College Performance Analysis</h2>
                  <p className="text-slate-600 mt-1">Systematic evaluation of laboratory facilities across academic units</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-800">Data Visualization</span>
                </div>
              </div>
              
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
                              <p className="text-xs text-slate-500 mt-1">{collegeRecords.length || college.labs} assessments</p>
                            </div>
                            <Progress value={avgScore} className="h-1.5" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {Object.entries(LABORATORY_ASSESSMENT_DATA.campuses).map(([campusName, campusData]) => (
                  <Card key={campusName} className="bg-white shadow-sm border border-slate-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-slate-500" />
                          <CardTitle className="text-base text-slate-900">{campusName}</CardTitle>
                        </div>
                        <div className="text-xs text-slate-500">
                          {campusData.colleges.length} colleges • {campusData.totalLabs} labs
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-2">
                        {campusData.colleges.map((college) => {
                          const collegeRecords = assessmentRecords.filter(record => 
                            record.college === college.code
                          );
                          
                          const avgScore = collegeRecords.length > 0 
                            ? collegeRecords.reduce((sum, record) => sum + record.overallScore, 0) / collegeRecords.length
                            : college.avgScore * 20;
                          
                          return (
                            <div key={college.code} className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <p className="text-sm text-slate-900">{college.code}</p>
                                  <p className="text-xs text-slate-600">{college.labs} laboratories</p>
                                </div>
                                <div className={`text-sm ${getRatingColor(avgScore / 20)}`}>
                                  {(avgScore / 20).toFixed(1)}/5
                                </div>
                              </div>
                              <Progress value={avgScore} className="h-1.5" />
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Assessment Forms Tab */}
          <TabsContent value="forms" className="space-y-6">
            <Card className="bg-white shadow-sm border border-slate-200">
              <CardHeader>
                <CardTitle className="text-xl text-slate-900">Laboratory Assessment Form</CardTitle>
                <CardDescription>
                  Comprehensive evaluation system based on CSU standardized criteria
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LaboratoryAssessmentForm
                  onFormSubmit={handleSaveRecord}
                  colleges={CSU_COLLEGES}
                  campuses={Object.keys(LABORATORY_ASSESSMENT_DATA.campuses)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assessment Records Tab */}
          <TabsContent value="assessment-records" className="space-y-6">
            <Card className="bg-white shadow-sm border border-slate-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg text-slate-900">Assessment Records</CardTitle>
                    <CardDescription>{filteredRecords.length} records found</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Building / Laboratory</TableHead>
                      <TableHead>College</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="text-slate-900">{record.id}</TableCell>
                        <TableCell>
                          <div>
                            <p className="text-slate-900">{record.buildingName}</p>
                            <p className="text-sm text-slate-600">{record.laboratoryNumber}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-900">{record.college}</TableCell>
                        <TableCell className="text-slate-900">{record.subject}</TableCell>
                        <TableCell className="text-slate-600">{record.dateOfAssessment}</TableCell>
                        <TableCell>
                          <Badge variant={
                            record.overallScore >= 90 ? 'default' :
                            record.overallScore >= 75 ? 'secondary' : 'destructive'
                          }>
                            {record.overallScore.toFixed(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={record.recordStatus === 'Published' ? 'default' : 'secondary'}>
                            {record.recordStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {isPageAdmin && record.recordStatus === 'Draft' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handlePublishRecord(record.id)}
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
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Assessment Form Dialog */}
      <AssessmentFormDialog
        open={showAssessmentDialog}
        onOpenChange={setShowAssessmentDialog}
        record={editingRecord}
        onSave={handleSaveRecord}
      />
    </div>
  );
}

// Laboratory Assessment Form Component with LEFT content, RIGHT sticky stepper
function LaboratoryAssessmentForm({ onFormSubmit, colleges, campuses }: {
  onFormSubmit: (data: any) => void;
  colleges: any[];
  campuses: string[];
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [customLabType, setCustomLabType] = useState('');
  const [formData, setFormData] = useState({
    buildingName: '',
    laboratoryNumber: '',
    subject: '',
    labType: 'Laboratory',
    customLabType: '',
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
      roomAccessibility: { rating: 1, remarks: '' },
      directionalSignages: { rating: 1, remarks: '' },
      pathways: { rating: 1, remarks: '' }
    },
    functionality: {
      flexibility: { rating: 1, remarks: '' },
      ventilationTemperature: { rating: 1, remarks: '' },
      noiseLevel: { rating: 1, remarks: '' }
    },
    utility: {
      electricity: { rating: 1, remarks: '' },
      lighting: { rating: 1, remarks: '' },
      waterSource: { rating: 1, remarks: '' },
      internetConnectivity: { rating: 1, remarks: '' }
    },
    sanitation: {
      cleanliness: { rating: 1, remarks: '' },
      wasteDisposal: { rating: 1, remarks: '' },
      odor: { rating: 1, remarks: '' },
      comfortRoomAccess: { rating: 1, remarks: '' },
      freeFromPests: { rating: 1, remarks: '' }
    },
    instructionalTools: {
      sopManual: { rating: 1, remarks: '' },
      whiteboardAVEquipment: { rating: 1, remarks: '' }
    },
    laboratoryEquipment: {
      operationalCondition: { rating: 1, remarks: '' },
      safetyCompliance: { rating: 1, remarks: '' },
      ppeAncillary: { rating: 1, remarks: '' },
      wasteDecontamination: { rating: 1, remarks: '' }
    },
    furnitureFixtures: {
      chairsBenchesTables: { rating: 1, remarks: '' },
      storageShelves: { rating: 1, remarks: '' },
      teachersTable: { rating: 1, remarks: '' }
    },
    space: {
      roomCapacity: { rating: 1, remarks: '' },
      layout: { rating: 1, remarks: '' }
    },
    disasterPreparedness: {
      emergencyEquipment: { rating: 1, remarks: '' },
      earthquakePreparedness: { rating: 1, remarks: '' },
      floodSafety: { rating: 1, remarks: '' },
      safetySignages: { rating: 1, remarks: '' },
      securityMeasures: { rating: 1, remarks: '' }
    },
    inclusivity: {
      privacyComfortRooms: { rating: 1, remarks: '' },
      genderNeutral: { rating: 1, remarks: '' },
      safeSpaces: { rating: 1, remarks: '' },
      specialNeeds: { rating: 1, remarks: '' }
    },
    
    categoryScores: [],
    overallWeightedScore: 0,
    ratingInterpretation: '',
    overallScore: 0,
    overallCondition: 'Poor',
    remarks: '',
    recommendingActions: ''
  });

  const formSteps = [
    { id: 1, title: 'Laboratory Identification', description: 'Basic laboratory information' },
    { id: 2, title: 'Class Details', description: 'Schedule and enrollment information' },
    { id: 3, title: 'Accessibility & Functionality', description: 'Access and environmental factors' },
    { id: 4, title: 'Infrastructure', description: 'Utilities and sanitation systems' },
    { id: 5, title: 'Equipment & Safety', description: 'Laboratory equipment and safety compliance' },
    { id: 6, title: 'Resources & Space', description: 'Furniture, fixtures, and spatial assessment' },
    { id: 7, title: 'Assessment Summary', description: 'Overall evaluation and recommendations' }
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
      labType: formData.labType === 'Others' ? formData.customLabType : formData.labType,
      categoryScores,
      overallWeightedScore,
      ratingInterpretation,
      overallScore: overallWeightedScore, // For backward compatibility
      overallCondition
    };
    
    onFormSubmit(finalData);
    
    setCurrentStep(1);
    setCustomLabType('');
    toast.success('Laboratory assessment submitted successfully!');
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
            title="Laboratory Identification" 
            description="Please provide the basic information about the laboratory being assessed"
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
              
              <FormField label="Laboratory Number/Name" required>
                <Input
                  value={formData.laboratoryNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, laboratoryNumber: e.target.value }))}
                  placeholder="Enter laboratory number"
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

            <FormSection title="Laboratory Classification" description="Specify the type and purpose of the laboratory">
              <div className="space-y-4">
                <FormField label="Laboratory Type" required>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {['Laboratory', 'Lecture', 'Seminar Room', 'Others'].map((type) => (
                        <label key={type} className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                          <input
                            type="radio"
                            value={type}
                            checked={formData.labType === type}
                            onChange={(e) => {
                              setFormData(prev => ({ ...prev, labType: e.target.value }));
                              setCustomLabType(e.target.value === 'Others' ? '' : customLabType);
                            }}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="text-sm">{type}</span>
                        </label>
                      ))}
                    </div>
                    {formData.labType === 'Others' && (
                      <Input
                        value={formData.customLabType}
                        onChange={(e) => setFormData(prev => ({ ...prev, customLabType: e.target.value }))}
                        placeholder="Please specify laboratory type"
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
            title="Class Details" 
            description="Enter schedule and enrollment information"
          >
            <FormGrid columns={2}>
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

              <FormField label="Number of Students">
                <Input
                  type="number"
                  value={formData.numberOfStudents}
                  onChange={(e) => setFormData(prev => ({ ...prev, numberOfStudents: e.target.value }))}
                  placeholder="e.g., 35"
                  className="h-11"
                />
              </FormField>
            </FormGrid>

            <FormField label="Schedule (Day and Time)">
              <Input
                value={formData.schedule}
                onChange={(e) => setFormData(prev => ({ ...prev, schedule: e.target.value }))}
                placeholder="e.g., MWF 10:00-12:00 PM"
                className="h-11"
              />
            </FormField>

            <FormSection title="Assessment Information" description="Details about the assessment process">
              <FormGrid columns={3}>
                <FormField label="Date of Assessment" required>
                  <Input
                    type="date"
                    value={formData.dateOfAssessment}
                    onChange={(e) => setFormData(prev => ({ ...prev, dateOfAssessment: e.target.value }))}
                    className="h-11"
                  />
                </FormField>

                <FormField label="Assessed By" required>
                  <Input
                    value={formData.assessor}
                    onChange={(e) => setFormData(prev => ({ ...prev, assessor: e.target.value }))}
                    placeholder="e.g., Dr. Juan Dela Cruz"
                    className="h-11"
                  />
                </FormField>

                <FormField label="Position" required>
                  <Input
                    value={formData.position}
                    onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                    placeholder="e.g., Laboratory Supervisor"
                    className="h-11"
                  />
                </FormField>
              </FormGrid>
            </FormSection>
          </FormSection>
        );
        
      case 3:
        const accessibilityScore = calculateAllCategoryScores(formData)[0];
        const functionalityScore = calculateAllCategoryScores(formData)[1];
        
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
              description="Laboratory access and navigation features"
              criteria={[
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
                  description: 'Furniture and room layout adaptable for various laboratory activities',
                  value: formData.functionality.flexibility.rating,
                  remarks: formData.functionality.flexibility.remarks
                },
                {
                  key: 'ventilationTemperature',
                  label: 'Ventilation and Temperature',
                  description: 'Functioning ventilation with proper temperature control',
                  value: formData.functionality.ventilationTemperature.rating,
                  remarks: formData.functionality.ventilationTemperature.remarks
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
        
      case 4:
        const utilityScore = calculateAllCategoryScores(formData)[2];
        const sanitationScore = calculateAllCategoryScores(formData)[3];
        
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
                  key: 'waterSource',
                  label: 'Water Source',
                  description: 'Sufficient and clean water source with lab grade faucets',
                  value: formData.utility.waterSource.rating,
                  remarks: formData.utility.waterSource.remarks
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
                  description: 'Floors, walls, windows clean',
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
                  description: 'Accessible CRs within reasonable distance',
                  value: formData.sanitation.comfortRoomAccess.rating,
                  remarks: formData.sanitation.comfortRoomAccess.remarks
                },
                {
                  key: 'freeFromPests',
                  label: 'Free from Pests',
                  description: 'Pest control measures are in place',
                  value: formData.sanitation.freeFromPests.rating,
                  remarks: formData.sanitation.freeFromPests.remarks
                }
              ]}
              onRatingChange={(key, value) => handleRatingChange('sanitation', key, value)}
              onRemarksChange={(key, value) => handleRemarksChange('sanitation', key, value)}
            />

            {/* Instructional Tools Score Card */}
            {(() => {
              const instructionalToolsScore = calculateAllCategoryScores(formData)[4];
              return (
                <WeightedScoreCard
                  categoryName="5. Instructional Tools"
                  totalRating={instructionalToolsScore?.totalRating || 0}
                  maxPossibleScore={instructionalToolsScore?.maxPossibleScore || 0}
                  categoryScore={instructionalToolsScore?.categoryScore || 0}
                  weight={instructionalToolsScore?.weight || 0}
                  weightedScore={instructionalToolsScore?.weightedScore || 0}
                />
              );
            })()}
            
            <RatingSectionWithRemarks
              title="5. Instructional Tools and Equipment"
              description="Teaching aids and laboratory equipment"
              criteria={[
                {
                  key: 'sopManual',
                  label: 'Standard Operating Procedures (SOPs)',
                  description: 'Updated SOP Manual available and accessible',
                  value: formData.instructionalTools.sopManual.rating,
                  remarks: formData.instructionalTools.sopManual.remarks
                }
              ]}
              onRatingChange={(key, value) => handleRatingChange('instructionalTools', key, value)}
              onRemarksChange={(key, value) => handleRemarksChange('instructionalTools', key, value)}
            />
            
            {/* Whiteboard/Blackboard and AV Equipment - Combined Item */}
            <div className="p-5 border border-slate-200 rounded-lg bg-slate-50 space-y-4">
              <div>
                <h3 className="text-sm text-slate-900 mb-2">Whiteboards/Blackboards and Audio-visual Equipment</h3>
                <div className="text-xs text-slate-600 space-y-1 mb-4">
                  <p>• TVs/Projectors, microphones, and speakers are available and functional (if applicable)</p>
                  <p>• Whiteboards/Blackboards are usable, clean, and with markers/chalk</p>
                </div>
              </div>
              <RatingSection
                label="Overall Rating"
                description="Rate the overall whiteboards/blackboards and audio-visual equipment"
                value={formData.instructionalTools.whiteboardAVEquipment.rating}
                onChange={(value) => setFormData(prev => ({
                  ...prev,
                  instructionalTools: {
                    ...prev.instructionalTools,
                    whiteboardAVEquipment: { ...prev.instructionalTools.whiteboardAVEquipment, rating: value }
                  }
                }))}
                showRemarks
                remarksValue={formData.instructionalTools.whiteboardAVEquipment.remarks}
                onRemarksChange={(value) => setFormData(prev => ({
                  ...prev,
                  instructionalTools: {
                    ...prev.instructionalTools,
                    whiteboardAVEquipment: { ...prev.instructionalTools.whiteboardAVEquipment, remarks: value }
                  }
                }))}
              />
            </div>
          </div>
        );
        
      case 5:
        const labEquipmentScore = calculateAllCategoryScores(formData)[5];
        
        return (
          <FormSection
            title="6. Laboratory Equipment and Safety"
            description="Evaluate equipment and safety compliance (1-5 scale per subcategory)"
          >
            {/* Laboratory Equipment Score Card */}
            <WeightedScoreCard
              categoryName="6. Laboratory Equipment & Safety"
              totalRating={labEquipmentScore?.totalRating || 0}
              maxPossibleScore={labEquipmentScore?.maxPossibleScore || 0}
              categoryScore={labEquipmentScore?.categoryScore || 0}
              weight={labEquipmentScore?.weight || 0}
              weightedScore={labEquipmentScore?.weightedScore || 0}
            />
            
            <div className="space-y-6">
              {/* Operational Condition and Calibration */}
              <div className="p-5 border border-slate-200 rounded-lg bg-slate-50">
                <h3 className="text-base text-slate-900 mb-3">6.1 Operational Condition and Calibration</h3>
                <div className="text-sm text-slate-600 space-y-1.5 mb-4">
                  <p>• Core lab equipment available, accessible, and fully functional (e.g., microscopes, testing machines, computers, counseling aids, etc.)</p>
                  <p>• Timely equipment calibration and maintenance is in place</p>
                  <p>• Standard Operating Procedures (SOP) manual is available and accessible</p>
                  <p>• Proper record-keeping system in place (e.g., inventory logs, usage records, maintenance logs, disposal records, etc.)</p>
                </div>
                <RatingSection
                  label="Overall Rating"
                  description="Rate the overall operational condition and calibration compliance"
                  value={formData.laboratoryEquipment.operationalCondition.rating}
                  onChange={(value) => setFormData(prev => ({
                    ...prev,
                    laboratoryEquipment: {
                      ...prev.laboratoryEquipment,
                      operationalCondition: { ...prev.laboratoryEquipment.operationalCondition, rating: value }
                    }
                  }))}
                  showRemarks
                  remarksValue={formData.laboratoryEquipment.operationalCondition.remarks}
                  onRemarksChange={(value) => setFormData(prev => ({
                    ...prev,
                    laboratoryEquipment: {
                      ...prev.laboratoryEquipment,
                      operationalCondition: { ...prev.laboratoryEquipment.operationalCondition, remarks: value }
                    }
                  }))}
                />
              </div>

              {/* Safety & Compliance */}
              <div className="p-5 border border-slate-200 rounded-lg bg-slate-50">
                <h3 className="text-base text-slate-900 mb-3">6.2 Safety & Compliance</h3>
                <div className="text-sm text-slate-600 space-y-1.5 mb-4">
                  <p>• Safety shields, fume hoods, exhausts working (if applicable)</p>
                  <p>• Emergency shutoffs accessible and labeled</p>
                  <p>• Electrical safety for heavy equipment (grounding, dedicated circuits)</p>
                  <p>• Hazard signages and/or MSDS/SDS availability (for applicable laboratories)</p>
                  <p>• Proper storage for hazardous materials and/or live specimens/samples</p>
                  <p>• Laboratory rooms are equipped with emergency shower rooms (if applicable)</p>
                  <p>• Floors and lab tables are easy to clean, impervious to chemicals, and non-flammable. Floors are slip-resistant</p>
                </div>
                <RatingSection
                  label="Overall Rating"
                  description="Rate the overall safety and compliance standards"
                  value={formData.laboratoryEquipment.safetyCompliance.rating}
                  onChange={(value) => setFormData(prev => ({
                    ...prev,
                    laboratoryEquipment: {
                      ...prev.laboratoryEquipment,
                      safetyCompliance: { ...prev.laboratoryEquipment.safetyCompliance, rating: value }
                    }
                  }))}
                  showRemarks
                  remarksValue={formData.laboratoryEquipment.safetyCompliance.remarks}
                  onRemarksChange={(value) => setFormData(prev => ({
                    ...prev,
                    laboratoryEquipment: {
                      ...prev.laboratoryEquipment,
                      safetyCompliance: { ...prev.laboratoryEquipment.safetyCompliance, remarks: value }
                    }
                  }))}
                />
              </div>

              {/* PPE & Ancillary Equipment */}
              <div className="p-5 border border-slate-200 rounded-lg bg-slate-50">
                <h3 className="text-base text-slate-900 mb-3">6.3 PPE & Ancillary Equipment</h3>
                <div className="text-sm text-slate-600 space-y-1.5 mb-4">
                  <p>• Availability of complete and appropriate PPE for Science and Engineering laboratories (e.g., safety goggles, gloves, lab coats, helmets, face-masks/shields, etc.)</p>
                  <p>• First aid kit, eyewash station, and fire blanket present and accessible</p>
                </div>
                <RatingSection
                  label="Overall Rating"
                  description="Rate the overall PPE and ancillary equipment availability"
                  value={formData.laboratoryEquipment.ppeAncillary.rating}
                  onChange={(value) => setFormData(prev => ({
                    ...prev,
                    laboratoryEquipment: {
                      ...prev.laboratoryEquipment,
                      ppeAncillary: { ...prev.laboratoryEquipment.ppeAncillary, rating: value }
                    }
                  }))}
                  showRemarks
                  remarksValue={formData.laboratoryEquipment.ppeAncillary.remarks}
                  onRemarksChange={(value) => setFormData(prev => ({
                    ...prev,
                    laboratoryEquipment: {
                      ...prev.laboratoryEquipment,
                      ppeAncillary: { ...prev.laboratoryEquipment.ppeAncillary, remarks: value }
                    }
                  }))}
                />
              </div>

              {/* Waste & Decontamination */}
              <div className="p-5 border border-slate-200 rounded-lg bg-slate-50">
                <h3 className="text-base text-slate-900 mb-3">6.4 Waste & Decontamination</h3>
                <div className="text-sm text-slate-600 space-y-1.5 mb-4">
                  <p>• Proper segregation of waste and hazardous materials in place</p>
                  <p>• Cleaning supplies and/or decontamination/treatment facility and procedures available</p>
                </div>
                <RatingSection
                  label="Overall Rating"
                  description="Rate the overall waste management and decontamination procedures"
                  value={formData.laboratoryEquipment.wasteDecontamination.rating}
                  onChange={(value) => setFormData(prev => ({
                    ...prev,
                    laboratoryEquipment: {
                      ...prev.laboratoryEquipment,
                      wasteDecontamination: { ...prev.laboratoryEquipment.wasteDecontamination, rating: value }
                    }
                  }))}
                  showRemarks
                  remarksValue={formData.laboratoryEquipment.wasteDecontamination.remarks}
                  onRemarksChange={(value) => setFormData(prev => ({
                    ...prev,
                    laboratoryEquipment: {
                      ...prev.laboratoryEquipment,
                      wasteDecontamination: { ...prev.laboratoryEquipment.wasteDecontamination, remarks: value }
                    }
                  }))}
                />
              </div>
            </div>
          </FormSection>
        );
        
      case 6:
        const furnitureScore = calculateAllCategoryScores(formData)[6];
        const spaceScore = calculateAllCategoryScores(formData)[7];
        const disasterScore = calculateAllCategoryScores(formData)[8];
        const inclusivityScore = calculateAllCategoryScores(formData)[9];
        
        return (
          <div className="space-y-8">
            {/* Furniture Score Card */}
            <WeightedScoreCard
              categoryName="7. Furniture and Fixtures"
              totalRating={furnitureScore?.totalRating || 0}
              maxPossibleScore={furnitureScore?.maxPossibleScore || 0}
              categoryScore={furnitureScore?.categoryScore || 0}
              weight={furnitureScore?.weight || 0}
              weightedScore={furnitureScore?.weightedScore || 0}
            />
            
            <RatingSectionWithRemarks
              title="7. Furnitures and Fixtures"
              description="Laboratory furniture and fixtures assessment"
              criteria={[
                {
                  key: 'chairsBenchesTables',
                  label: 'Chairs / Benches / Tables',
                  description: 'Sufficient, comfortable, adequate, and undamaged',
                  value: formData.furnitureFixtures.chairsBenchesTables.rating,
                  remarks: formData.furnitureFixtures.chairsBenchesTables.remarks
                },
                {
                  key: 'storageShelves',
                  label: 'Storage Shelves and Cabinets',
                  description: 'Sufficient, accessible, and in good condition',
                  value: formData.furnitureFixtures.storageShelves.rating,
                  remarks: formData.furnitureFixtures.storageShelves.remarks
                },
                {
                  key: 'teachersTable',
                  label: 'Teachers Table / Podium',
                  description: 'Available and in good condition',
                  value: formData.furnitureFixtures.teachersTable.rating,
                  remarks: formData.furnitureFixtures.teachersTable.remarks
                }
              ]}
              onRatingChange={(key, value) => handleRatingChange('furnitureFixtures', key, value)}
              onRemarksChange={(key, value) => handleRemarksChange('furnitureFixtures', key, value)}
            />

            {/* Space Score Card */}
            <WeightedScoreCard
              categoryName="8. Space"
              totalRating={spaceScore?.totalRating || 0}
              maxPossibleScore={spaceScore?.maxPossibleScore || 0}
              categoryScore={spaceScore?.categoryScore || 0}
              weight={spaceScore?.weight || 0}
              weightedScore={spaceScore?.weightedScore || 0}
            />
            
            <RatingSectionWithRemarks
              title="8. Space"
              description="Spatial arrangement and capacity"
              criteria={[
                {
                  key: 'roomCapacity',
                  label: 'Room Capacity',
                  description: 'Adequate for class size / avoids overcrowding',
                  value: formData.space.roomCapacity.rating,
                  remarks: formData.space.roomCapacity.remarks
                }
              ]}
              onRatingChange={(key, value) => handleRatingChange('space', key, value)}
              onRemarksChange={(key, value) => handleRemarksChange('space', key, value)}
            />
            
            {/* Layout - Combined Item */}
            <div className="p-5 border border-slate-200 rounded-lg bg-slate-50 space-y-4">
              <div>
                <h3 className="text-sm text-slate-900 mb-2">Layout</h3>
                <div className="text-xs text-slate-600 space-y-1 mb-4">
                  <p>• Allows free movement and visibility, with adequate ceiling height</p>
                  <p>• Free from clutter and distracting colors</p>
                </div>
              </div>
              <RatingSection
                label="Overall Rating"
                description="Rate the overall layout of the laboratory"
                value={formData.space.layout.rating}
                onChange={(value) => setFormData(prev => ({
                  ...prev,
                  space: {
                    ...prev.space,
                    layout: { ...prev.space.layout, rating: value }
                  }
                }))}
                showRemarks
                remarksValue={formData.space.layout.remarks}
                onRemarksChange={(value) => setFormData(prev => ({
                  ...prev,
                  space: {
                    ...prev.space,
                    layout: { ...prev.space.layout, remarks: value }
                  }
                }))}
              />
            </div>

            {/* Disaster Preparedness Score Card */}
            <WeightedScoreCard
              categoryName="9. Disaster Preparedness & Security"
              totalRating={disasterScore?.totalRating || 0}
              maxPossibleScore={disasterScore?.maxPossibleScore || 0}
              categoryScore={disasterScore?.categoryScore || 0}
              weight={disasterScore?.weight || 0}
              weightedScore={disasterScore?.weightedScore || 0}
            />
            
            <RatingSectionWithRemarks
              title="9. Disaster Preparedness and Security"
              description="Emergency preparedness and safety measures"
              criteria={[
                {
                  key: 'emergencyEquipment',
                  label: 'Emergency Equipment',
                  description: 'Presence of fire extinguisher / alarms clearly marked, accessible',
                  value: formData.disasterPreparedness.emergencyEquipment.rating,
                  remarks: formData.disasterPreparedness.emergencyEquipment.remarks
                },
                {
                  key: 'earthquakePreparedness',
                  label: 'Earthquake Preparedness',
                  description: 'No falling hazards, safe layout',
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
                },
                {
                  key: 'securityMeasures',
                  label: 'Security Measures',
                  description: 'Laboratory rooms equipped with secure locks and surveillance systems',
                  value: formData.disasterPreparedness.securityMeasures.rating,
                  remarks: formData.disasterPreparedness.securityMeasures.remarks
                }
              ]}
              onRatingChange={(key, value) => handleRatingChange('disasterPreparedness', key, value)}
              onRemarksChange={(key, value) => handleRemarksChange('disasterPreparedness', key, value)}
            />

            {/* Inclusivity Score Card */}
            <WeightedScoreCard
              categoryName="10. Inclusivity"
              totalRating={inclusivityScore?.totalRating || 0}
              maxPossibleScore={inclusivityScore?.maxPossibleScore || 0}
              categoryScore={inclusivityScore?.categoryScore || 0}
              weight={inclusivityScore?.weight || 0}
              weightedScore={inclusivityScore?.weightedScore || 0}
            />
            
            <RatingSectionWithRemarks
              title="10. Inclusivity (Gender, Religion and Disability: RA11313, RA 11650)"
              description="Inclusive facilities and accommodations"
              criteria={[
                {
                  key: 'privacyComfortRooms',
                  label: 'Privacy in Comfort Rooms',
                  description: 'Working locks, partitions that ensure safety and dignity',
                  value: formData.inclusivity.privacyComfortRooms.rating,
                  remarks: formData.inclusivity.privacyComfortRooms.remarks
                },
                {
                  key: 'genderNeutral',
                  label: 'Gender-Neutral Restrooms / Facilities',
                  description: 'Availability or at least clear policies for safe CR access',
                  value: formData.inclusivity.genderNeutral.rating,
                  remarks: formData.inclusivity.genderNeutral.remarks
                },
                {
                  key: 'safeSpaces',
                  label: 'Safe Spaces',
                  description: 'Seating arrangements promote equality (not segregated unless necessary)',
                  value: formData.inclusivity.safeSpaces.rating,
                  remarks: formData.inclusivity.safeSpaces.remarks
                },
                {
                  key: 'specialNeeds',
                  label: 'Laboratory Assignment for Students with Special Needs',
                  description: 'Students who are pregnant, lactating, or with disabilities are assigned to ground-floor, ramp-accessible locations',
                  value: formData.inclusivity.specialNeeds.rating,
                  remarks: formData.inclusivity.specialNeeds.remarks
                }
              ]}
              onRatingChange={(key, value) => handleRatingChange('inclusivity', key, value)}
              onRemarksChange={(key, value) => handleRemarksChange('inclusivity', key, value)}
            />
          </div>
        );
        
      case 7:
        const allCategoryScores = calculateAllCategoryScores(formData);
        const overallWeightedScore = calculateOverallWeightedScore(allCategoryScores);
        const ratingInterpretation = getRatingInterpretation(overallWeightedScore);
        const overallCondition = getOverallCondition(overallWeightedScore);
        
        return (
          <FormSection 
            title="Assessment Summary & Recommendations" 
            description="Review your assessment results and provide final observations"
          >
            {/* Overall Weighted Score Display - Prominent */}
            <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="text-center space-y-4">
                  <h4 className="text-2xl">Overall Laboratory Assessment Score</h4>
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
                    placeholder="Enter general observations about the laboratory..."
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
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Form Content - 2 columns on large screens (LEFT) */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-8">
            <div className="min-h-[600px]">
              {renderStepContent()}
            </div>
            
            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-12 pt-8 border-t border-slate-200">
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
                      laboratoryNumber: '',
                      subject: '',
                      labType: 'Laboratory',
                      customLabType: '',
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
                        roomAccessibility: { rating: 1, remarks: '' },
                        directionalSignages: { rating: 1, remarks: '' },
                        pathways: { rating: 1, remarks: '' }
                      },
                      functionality: {
                        flexibility: { rating: 1, remarks: '' },
                        ventilationTemperature: { rating: 1, remarks: '' },
                        noiseLevel: { rating: 1, remarks: '' }
                      },
                      utility: {
                        electricity: { rating: 1, remarks: '' },
                        lighting: { rating: 1, remarks: '' },
                        waterSource: { rating: 1, remarks: '' },
                        internetConnectivity: { rating: 1, remarks: '' }
                      },
                      sanitation: {
                        cleanliness: { rating: 1, remarks: '' },
                        wasteDisposal: { rating: 1, remarks: '' },
                        odor: { rating: 1, remarks: '' },
                        comfortRoomAccess: { rating: 1, remarks: '' },
                        freeFromPests: { rating: 1, remarks: '' }
                      },
                      instructionalTools: { 
                        sopManual: { rating: 1, remarks: '' },
                        whiteboardAVEquipment: { rating: 1, remarks: '' } 
                      },
                      laboratoryEquipment: {
                        operationalCondition: { rating: 1, remarks: '' },
                        safetyCompliance: { rating: 1, remarks: '' },
                        ppeAncillary: { rating: 1, remarks: '' },
                        wasteDecontamination: { rating: 1, remarks: '' }
                      },
                      furnitureFixtures: {
                        chairsBenchesTables: { rating: 1, remarks: '' },
                        storageShelves: { rating: 1, remarks: '' },
                        teachersTable: { rating: 1, remarks: '' }
                      },
                      space: { 
                        roomCapacity: { rating: 1, remarks: '' },
                        layout: { rating: 1, remarks: '' } 
                      },
                      disasterPreparedness: {
                        emergencyEquipment: { rating: 1, remarks: '' },
                        earthquakePreparedness: { rating: 1, remarks: '' },
                        floodSafety: { rating: 1, remarks: '' },
                        safetySignages: { rating: 1, remarks: '' },
                        securityMeasures: { rating: 1, remarks: '' }
                      },
                      inclusivity: {
                        privacyComfortRooms: { rating: 1, remarks: '' },
                        genderNeutral: { rating: 1, remarks: '' },
                        safeSpaces: { rating: 1, remarks: '' },
                        specialNeeds: { rating: 1, remarks: '' }
                      },
                      categoryScores: [],
                      overallWeightedScore: 0,
                      ratingInterpretation: '',
                      overallScore: 0,
                      overallCondition: 'Poor',
                      remarks: '',
                      recommendingActions: ''
                    });
                  }}
                  className="text-slate-500 hover:text-slate-700"
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

      {/* Stepper Sidebar - 1 column on the right (RIGHT & STICKY) */}
      <div className="lg:col-span-1">
        <div className="lg:sticky lg:top-8">
          <FormStepper 
            steps={formSteps} 
            currentStep={currentStep}
            onStepClick={setCurrentStep}
          />
        </div>
      </div>
    </div>
  );
}

// Assessment Form Dialog
function AssessmentFormDialog({ open, onOpenChange, record, onSave }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: any;
  onSave: (data: any) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-slate-900">
            {record ? 'Edit Laboratory Assessment' : 'New Laboratory Assessment'}
          </DialogTitle>
          <DialogDescription>
            Complete the laboratory assessment form with detailed evaluations
          </DialogDescription>
        </DialogHeader>
        <LaboratoryAssessmentForm
          onFormSubmit={(data) => {
            onSave(data);
            onOpenChange(false);
          }}
          colleges={CSU_COLLEGES}
          campuses={['CSU Main Campus', 'CSU Cabadbaran Campus']}
        />
      </DialogContent>
    </Dialog>
  );
}
