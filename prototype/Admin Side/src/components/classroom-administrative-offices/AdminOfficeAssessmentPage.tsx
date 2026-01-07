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
  Building, Briefcase, MapPin, Calendar, Users, ClipboardCheck, 
  Search, Filter, Plus, Eye, Edit, Target, TrendingUp, BarChart3, 
  Settings, FileText, Clock, ArrowRight, CheckCircle, AlertCircle, Zap,
  CalendarDays, List, Grid, Upload, Download, Trash2, Save, X, ChevronLeft, Check
} from 'lucide-react';
import FormStepper from './components/FormStepper';
import { FormSection, FormField, FormGrid } from './components/FormSection';
import RatingSection from './components/RatingSection';
import { GeneralFilter } from './components/GeneralFilter';
import { toast } from 'sonner@2.0.3';
import { 
  isAdminOfficeAssessmentAdmin, 
  getStatusBadgeStyle, 
  filterRecordsByPermission 
} from '../../utils/pagePermissions';

interface AdminOfficeAssessmentPageProps {
  userRole: string;
  requireAuth: (action: string) => boolean;
  onProjectSelect: (project: any) => void;
  filterData?: any;
  onClearFilters: () => void;
  userProfile?: any;
}

// CSU Departments/Offices structure
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

// Enhanced administrative office assessment data
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
  },
  // Sample assessment records for administrative offices
  assessmentRecords: [
    {
      id: 'AO-2024-001',
      officeName: 'Office of the Registrar',
      department: 'REG',
      buildingName: 'Administration Building',
      officeLocation: 'Ground Floor, Room 101',
      officeType: 'Service Office',
      campus: 'CSU Main Campus',
      staffCount: 8,
      clientCapacity: 15,
      dateOfAssessment: '2024-01-15',
      assessor: 'Dr. Rosa Martinez',
      position: 'Administrative Officer',
      
      // Office-specific assessment scores
      functionality: {
        accessibility: 4,
        ventilation: 3,
        noiseLevel: 4
      },
      utility: {
        electricity: 4,
        lighting: 4,
        internetConnectivity: 4
      },
      sanitation: {
        cleanliness: 4,
        wasteDisposal: 4,
        odorControl: 4,
        restroomAccess: 4,
        pwdFacilities: 3
      },
      equipmentTechnology: {
        computersWorkstations: 3,
        communicationSystems: 4,
        officeEquipment: 3
      },
      furnitureFixtures: {
        desksWorkstations: 4,
        seating: 4,
        storageSolutions: 3,
        receptionArea: 4
      },
      spaceLayout: {
        officeCapacity: 3,
        layoutEfficiency: 4,
        privacy: 4,
        storageSpace: 3
      },
      safetySecurity: {
        emergencyPreparedness: 4,
        securitySystems: 4,
        documentSecurity: 4,
        safetySignage: 4
      },
      
      overallScore: 3.7,
      overallCondition: 'Good',
      remarks: 'Office requires upgraded computer systems and additional storage solutions for better efficiency.',
      recommendingActions: 'Install new computers, add filing cabinets, improve client waiting area with more seating.',
      
      attachments: [
        { name: 'office_assessment_photos.zip', type: 'images', uploadDate: '2024-01-15', uploadedBy: 'Dr. Rosa Martinez' },
        { name: 'equipment_inventory.pdf', type: 'document', uploadDate: '2024-01-16', uploadedBy: 'IT Services' }
      ],
      
      recordStatus: 'Published',
      submittedBy: 'Dr. Rosa Martinez',
      dateCreated: '2024-01-15',
      lastModified: '2024-01-16'
    }
  ]
};

export function AdminOfficeAssessmentPage({ 
  userRole, 
  requireAuth, 
  onProjectSelect, 
  filterData, 
  onClearFilters,
  userProfile 
}: AdminOfficeAssessmentPageProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCampus, setSelectedCampus] = useState('all');
  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('list');
  const [loading, setLoading] = useState(false);
  const [showAssessmentDialog, setShowAssessmentDialog] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [assessmentRecords, setAssessmentRecords] = useState(ADMIN_OFFICE_DATA.assessmentRecords);
  
  // Check if current user is page admin
  const isPageAdmin = isAdminOfficeAssessmentAdmin(userProfile);

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
        id: `AO-${new Date().getFullYear()}-${String(assessmentRecords.length + 1).padStart(3, '0')}`,
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

  const handleClearAllFilters = () => {
    setSelectedYear('2024');
    setSelectedCampus('all');
    setSelectedDepartment('all');
    setSearchTerm('');
    toast.info('All filters cleared');
  };

  const getYearFilterData = () => {
    return ADMIN_OFFICE_DATA.yearFilters[selectedYear as keyof typeof ADMIN_OFFICE_DATA.yearFilters];
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
                <h1 className="text-2xl font-semibold text-gray-900">
                  Administrative Office Assessment
                </h1>
                <p className="text-gray-600 mt-1">
                  Comprehensive evaluation of administrative office spaces and working conditions
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Year Filter */}
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-lg border border-emerald-200">
                <CalendarDays className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-800">Academic Year:</span>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-[100px] border-emerald-300 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2022">2022</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={handleNewAssessment} className="bg-emerald-600 hover:bg-emerald-700">
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
              <h2 className="text-xl font-semibold text-gray-900">Campus Performance</h2>
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
                        <div>
                          <div className="flex justify-between items-center text-sm mb-2">
                            <span className="text-gray-600">Assessment Progress</span>
                            <span className="font-medium">{campusData.completionRate}%</span>
                          </div>
                          <Progress value={campusData.completionRate} className="h-3" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-emerald-50 rounded-lg">
                            <p className="text-lg font-semibold text-emerald-600">{campusData.assessedOffices}</p>
                            <p className="text-xs text-emerald-600">Assessed Offices</p>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <p className="text-lg font-semibold text-gray-600">{campusData.totalOffices}</p>
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
              <h2 className="text-xl font-semibold text-gray-900">Assessment Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-white shadow-sm border border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Total Offices</p>
                        <p className="text-3xl font-semibold text-emerald-600">{ADMIN_OFFICE_DATA.overview.totalOffices}</p>
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
                        <p className="text-sm font-medium text-gray-600 mb-1">Assessed</p>
                        <p className="text-3xl font-semibold text-blue-600">{currentYearData.completed}</p>
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
                        <p className="text-3xl font-semibold text-amber-600">{ADMIN_OFFICE_DATA.overview.priorityActions}</p>
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
                  <div className="p-4 border border-slate-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50/50 transition-all cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-emerald-50 rounded-lg">
                        <FileText className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm text-gray-900 mb-1">Office Assessment Form</h4>
                        <p className="text-xs text-gray-500 mb-2">Standard evaluation template for administrative offices</p>
                        <Button size="sm" variant="outline" className="h-7 text-xs">
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm text-gray-900 mb-1">Scoring Guidelines</h4>
                        <p className="text-xs text-gray-500 mb-2">Detailed rubric for office assessment criteria</p>
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
                        <h4 className="text-sm text-gray-900 mb-1">Office Assessment Report Template</h4>
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

          {/* Department Analysis Tab - Enhanced Minimal and Formal Design */}
          <TabsContent value="department-analysis" className="space-y-6">
            <div className="space-y-6">
              {/* Header Section */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Department Performance Analysis</h2>
                  <p className="text-slate-600 mt-1">Comprehensive assessment of administrative office efficiency and conditions</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-lg border border-emerald-200">
                  <BarChart3 className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-800">Department Analytics</span>
                </div>
              </div>
              
              {/* Performance Summary Grid */}
              <Card className="bg-white shadow-sm border border-slate-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-slate-900">Administrative Units Overview</CardTitle>
                  <CardDescription>Performance metrics across university departments and offices</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {CSU_DEPARTMENTS.map((department) => {
                      const scorePercentage = (department.avgScore / 5) * 100;
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
                                <span className="text-xs text-slate-700 group-hover:text-emerald-700 transition-colors">{department.code}</span>
                              </div>
                              <Badge variant="outline" className={`text-xs ${getStatusColor(department.status)}`}>
                                {department.status === 'Excellent' ? 'A' :
                                 department.status === 'Good' ? 'B' :
                                 department.status === 'Needs Improvement' ? 'C' : 'D'}
                              </Badge>
                            </div>
                            <div>
                              <div className={`text-2xl ${getRatingColor(department.avgScore)}`}>
                                {department.avgScore.toFixed(1)}
                              </div>
                              <p className="text-xs text-slate-500 mt-1">{department.offices} offices</p>
                            </div>
                            <Progress value={scorePercentage} className="h-1.5" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Campus Breakdown - Minimal Design */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {Object.entries(ADMIN_OFFICE_DATA.campuses).map(([campusName, campusData]) => {
                  // Get departments for this campus
                  const campusDepartments = CSU_DEPARTMENTS.filter(dept => 
                    dept.campus === (campusName === 'CSU Main Campus' ? 'Main' : 'Cabadbaran') || 
                    dept.campus === 'Both'
                  );
                  
                  return (
                    <Card key={campusName} className="bg-white shadow-sm border border-slate-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-slate-500" />
                            <CardTitle className="text-base text-slate-900">{campusName}</CardTitle>
                          </div>
                          <div className="text-xs text-slate-500">
                            {campusDepartments.length} departments • {campusData.totalOffices} offices
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="space-y-2">
                          {campusDepartments.map((department) => {
                            const scorePercentage = (department.avgScore / 5) * 100;
                            
                            return (
                              <div 
                                key={department.code}
                                className="p-2.5 border border-slate-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50/30 transition-all cursor-pointer group"
                                onClick={() => {
                                  setSelectedDepartment(department.code);
                                  setActiveTab('assessment-records');
                                }}
                              >
                                <div className="flex items-center justify-between gap-3">
                                  {/* Left: Department Code & Name */}
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <div className="w-10 h-10 bg-emerald-50 group-hover:bg-emerald-100 rounded flex items-center justify-center flex-shrink-0 transition-colors">
                                      <span className="text-xs text-emerald-600">{department.code}</span>
                                    </div>
                                    <div className="min-w-0">
                                      <h4 className="text-sm text-slate-900 truncate">{department.name}</h4>
                                      <div className="flex items-center gap-3 mt-0.5">
                                        <span className="text-xs text-slate-500">{department.offices} offices</span>
                                        <span className="text-xs text-slate-400">{department.type}</span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Right: Score & Badge */}
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <div className={`text-lg ${getRatingColor(department.avgScore)}`}>
                                      {department.avgScore.toFixed(1)}
                                    </div>
                                    <Badge variant="outline" className={`text-xs ${getStatusColor(department.status)}`}>
                                      {department.status === 'Excellent' ? 'A' :
                                       department.status === 'Good' ? 'B' :
                                       department.status === 'Needs Improvement' ? 'C' : 'D'}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Assessment Insights - Focused on Administrative Efficiency */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-blue-50 border border-blue-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-blue-800">Operational Strengths</h3>
                    </div>
                    <ul className="space-y-2 text-sm text-blue-700">
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                        Technology infrastructure readiness
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                        Document security systems
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                        Client service efficiency
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-yellow-50 border border-yellow-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-yellow-800">Enhancement Areas</h3>
                    </div>
                    <ul className="space-y-2 text-sm text-yellow-700">
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-yellow-500 rounded-full"></div>
                        Space utilization optimization
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-yellow-500 rounded-full"></div>
                        Storage solution improvements
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-yellow-500 rounded-full"></div>
                        Environmental comfort upgrades
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-orange-50 border border-orange-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-orange-800">Critical Actions</h3>
                    </div>
                    <ul className="space-y-2 text-sm text-orange-700">
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-orange-500 rounded-full"></div>
                        Equipment modernization initiatives
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-orange-500 rounded-full"></div>
                        Accessibility compliance upgrades
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-orange-500 rounded-full"></div>
                        Capacity planning reviews
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
                <CardTitle className="text-xl text-gray-900">Administrative Office Assessment Form</CardTitle>
                <CardDescription>
                  Comprehensive evaluation system for administrative office spaces and working conditions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminOfficeAssessmentForm
                  onFormSubmit={handleSaveRecord}
                  departments={CSU_DEPARTMENTS}
                  campuses={Object.keys(ADMIN_OFFICE_DATA.campuses)}
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
                        placeholder="Search by office name, department, or type..."
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
                  
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger className="w-[120px] border-gray-300">
                      <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {CSU_DEPARTMENTS.map((department) => (
                        <SelectItem key={department.code} value={department.code}>{department.code}</SelectItem>
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
                      <Button onClick={handleNewAssessment} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
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
                        <TableHead>Office Details</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Type</TableHead>
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
                              <p className="font-medium">{record.officeName}</p>
                              <p className="text-sm text-gray-600">{record.officeLocation}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{record.department}</Badge>
                          </TableCell>
                          <TableCell>{record.officeType}</TableCell>
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
                            <div className="flex items-center gap-2">
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
                          <CardDescription>{record.officeLocation}</CardDescription>
                        </div>
                        <Badge variant="outline">{record.department}</Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm font-medium">{record.officeType}</p>
                        <p className="text-xs text-gray-500">Campus: {record.campus}</p>
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

      {/* Assessment Form Dialog */}
      <AdminOfficeAssessmentDialog
        open={showAssessmentDialog}
        onOpenChange={setShowAssessmentDialog}
        record={editingRecord}
        onSave={handleSaveRecord}
      />
    </div>
  );
}

// Enhanced Administrative Office Assessment Form Component with Stepper
function AdminOfficeAssessmentForm({ onFormSubmit, departments, campuses }: {
  onFormSubmit: (data: any) => void;
  departments: any[];
  campuses: string[];
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Basic Information
    officeName: '',
    officeLocation: '',
    buildingName: '',
    officeType: 'Service Office',
    customOfficeType: '',
    department: 'REG',
    campus: 'CSU Main Campus',
    staffCount: '',
    clientCapacity: '',
    dateOfAssessment: '',
    assessor: '',
    position: '',
    
    // Assessment Criteria (1-5 scale) - Office-specific
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
      odorControl: 1,
      restroomAccess: 1,
      pwdFacilities: 1
    },
    equipmentTechnology: {
      computersWorkstations: 1,
      communicationSystems: 1,
      officeEquipment: 1
    },
    furnitureFixtures: {
      desksWorkstations: 1,
      seating: 1,
      storageSolutions: 1,
      receptionArea: 1
    },
    spaceLayout: {
      officeCapacity: 1,
      layoutEfficiency: 1,
      privacy: 1,
      storageSpace: 1
    },
    safetySecurity: {
      emergencyPreparedness: 1,
      securitySystems: 1,
      documentSecurity: 1,
      safetySignage: 1
    },
    
    // Final Assessment
    overallScore: 0,
    overallCondition: 'Poor',
    remarks: '',
    recommendingActions: ''
  });

  const formSteps = [
    { id: 1, title: 'Office Information', description: 'Office identification and basic details' },
    { id: 2, title: 'Staff & Capacity', description: 'Staffing and service capacity information' },
    { id: 3, title: 'Functionality', description: 'Accessibility and environmental factors' },
    { id: 4, title: 'Infrastructure', description: 'Utilities and sanitation systems' },
    { id: 5, title: 'Technology & Equipment', description: 'Technology infrastructure and office equipment' },
    { id: 6, title: 'Space & Layout', description: 'Office space efficiency and design' },
    { id: 7, title: 'Safety & Security', description: 'Security systems and emergency preparedness' },
    { id: 8, title: 'Final Assessment', description: 'Overall evaluation and recommendations' }
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
    // Calculate overall score
    const allScores = [
      ...Object.values(formData.functionality),
      ...Object.values(formData.utility),
      ...Object.values(formData.sanitation),
      ...Object.values(formData.equipmentTechnology),
      ...Object.values(formData.furnitureFixtures),
      ...Object.values(formData.spaceLayout),
      ...Object.values(formData.safetySecurity)
    ];
    
    const totalPoints = allScores.reduce((sum, score) => sum + score, 0);
    const maxPoints = allScores.length * 5;
    const overallScore = (totalPoints / maxPoints) * 5;
    
    // Determine overall condition
    let overallCondition = 'Unusable';
    if (overallScore >= 4.5) overallCondition = 'Excellent';
    else if (overallScore >= 3.5) overallCondition = 'Good';
    else if (overallScore >= 2.5) overallCondition = 'Need Improvement';
    else overallCondition = 'Unusable';

    const assessmentData = {
      ...formData,
      overallScore: parseFloat(overallScore.toFixed(1)),
      overallCondition,
      staffCount: parseInt(formData.staffCount) || 0,
      clientCapacity: parseInt(formData.clientCapacity) || 0,
      dateOfAssessment: new Date().toISOString().split('T')[0],
      officeType: formData.officeType === 'Others' ? formData.customOfficeType : formData.officeType,
      attachments: []
    };

    onFormSubmit(assessmentData);
    
    // Reset form
    setCurrentStep(1);
    setFormData({
      officeName: '',
      officeLocation: '',
      buildingName: '',
      officeType: 'Service Office',
      customOfficeType: '',
      department: 'REG',
      campus: 'CSU Main Campus',
      staffCount: '',
      clientCapacity: '',
      dateOfAssessment: '',
      assessor: '',
      position: '',
      functionality: { accessibility: 1, ventilation: 1, noiseLevel: 1 },
      utility: { electricity: 1, lighting: 1, internetConnectivity: 1 },
      sanitation: { cleanliness: 1, wasteDisposal: 1, odorControl: 1, restroomAccess: 1, pwdFacilities: 1 },
      equipmentTechnology: { computersWorkstations: 1, communicationSystems: 1, officeEquipment: 1 },
      furnitureFixtures: { desksWorkstations: 1, seating: 1, storageSolutions: 1, receptionArea: 1 },
      spaceLayout: { officeCapacity: 1, layoutEfficiency: 1, privacy: 1, storageSpace: 1 },
      safetySecurity: { emergencyPreparedness: 1, securitySystems: 1, documentSecurity: 1, safetySignage: 1 },
      overallScore: 0,
      overallCondition: 'Poor',
      remarks: '',
      recommendingActions: ''
    });
    
    toast.success('Administrative office assessment submitted successfully!');
  };

  const handleRatingChange = (categoryKey: string, itemKey: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      [categoryKey]: {
        ...prev[categoryKey as keyof typeof prev],
        [itemKey]: value
      }
    }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <FormSection 
            title="Office Identification" 
            description="Please provide the basic information about the office being assessed"
            required
          >
            <FormGrid columns={3}>
              <FormField label="Office Name" required>
                <Input
                  value={formData.officeName}
                  onChange={(e) => setFormData(prev => ({ ...prev, officeName: e.target.value }))}
                  placeholder="Enter office name"
                  className="h-11"
                />
              </FormField>
              
              <FormField label="Building Name" required>
                <Input
                  value={formData.buildingName}
                  onChange={(e) => setFormData(prev => ({ ...prev, buildingName: e.target.value }))}
                  placeholder="Enter building name"
                  className="h-11"
                />
              </FormField>
              
              <FormField label="Office Location" required>
                <Input
                  value={formData.officeLocation}
                  onChange={(e) => setFormData(prev => ({ ...prev, officeLocation: e.target.value }))}
                  placeholder="Enter office location"
                  className="h-11"
                />
              </FormField>
            </FormGrid>

            <FormSection title="Office Classification" description="Specify the type and purpose of the office">
              <div className="space-y-4">
                <FormField label="Office Type" required>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {['Service Office', 'Administrative Office', 'Academic Office', 'Others'].map((type) => (
                        <label key={type} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="radio"
                            value={type}
                            checked={formData.officeType === type}
                            onChange={(e) => setFormData(prev => ({ ...prev, officeType: e.target.value }))}
                            className="w-4 h-4 text-emerald-600"
                          />
                          <span className="text-sm font-medium">{type}</span>
                        </label>
                      ))}
                    </div>
                    {formData.officeType === 'Others' && (
                      <Input
                        value={formData.customOfficeType}
                        onChange={(e) => setFormData(prev => ({ ...prev, customOfficeType: e.target.value }))}
                        placeholder="Please specify office type"
                        className="h-11"
                      />
                    )}
                  </div>
                </FormField>
              </div>
            </FormSection>

            <FormSection title="Administrative Information" description="Department and campus details">
              <FormGrid columns={2}>
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

                <FormField label="Department" required>
                  <Select value={formData.department} onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((department) => (
                        <SelectItem key={department.code} value={department.code}>{department.code} - {department.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </FormGrid>
            </FormSection>
          </FormSection>
        );
        
      case 2:
        return (
          <FormSection 
            title="Staff & Service Capacity" 
            description="Provide information about staffing and service capacity"
            required
          >
            <FormSection title="Office Operations" description="Current staffing and service capacity information">
              <FormGrid columns={2}>
                <FormField label="Number of Staff" required>
                  <Input
                    type="number"
                    value={formData.staffCount}
                    onChange={(e) => setFormData(prev => ({ ...prev, staffCount: e.target.value }))}
                    placeholder="Enter number of staff"
                    className="h-11"
                  />
                </FormField>
                
                <FormField label="Client Capacity" required description="Maximum number of clients that can be served simultaneously">
                  <Input
                    type="number"
                    value={formData.clientCapacity}
                    onChange={(e) => setFormData(prev => ({ ...prev, clientCapacity: e.target.value }))}
                    placeholder="Enter client capacity"
                    className="h-11"
                  />
                </FormField>
              </FormGrid>

              <FormGrid columns={2}>
                <FormField label="Assessor Name" required>
                  <Input
                    value={formData.assessor}
                    onChange={(e) => setFormData(prev => ({ ...prev, assessor: e.target.value }))}
                    placeholder="Enter assessor name"
                    className="h-11"
                  />
                </FormField>
                
                <FormField label="Position/Title" required>
                  <Input
                    value={formData.position}
                    onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                    placeholder="Enter position/title"
                    className="h-11"
                  />
                </FormField>
              </FormGrid>
            </FormSection>
          </FormSection>
        );

      case 3:
        return (
          <FormSection 
            title="Functionality Assessment" 
            description="Evaluate accessibility and environmental factors"
          >
            <RatingSection
              title="Accessibility"
              description="PWD presence of ramps, easy access for staff and clients"
              value={formData.functionality.accessibility}
              onChange={(value) => handleRatingChange('functionality', 'accessibility', value)}
              labels={['Poor', 'Fair', 'Good', 'Very Good', 'Excellent']}
            />
            
            <RatingSection
              title="Ventilation"
              description="Natural/mechanical ventilation working properly"
              value={formData.functionality.ventilation}
              onChange={(value) => handleRatingChange('functionality', 'ventilation', value)}
              labels={['Poor', 'Fair', 'Good', 'Very Good', 'Excellent']}
            />
            
            <RatingSection
              title="Noise Level"
              description="Minimal external noise, conducive to office work"
              value={formData.functionality.noiseLevel}
              onChange={(value) => handleRatingChange('functionality', 'noiseLevel', value)}
              labels={['Very Noisy', 'Noisy', 'Moderate', 'Quiet', 'Very Quiet']}
            />
          </FormSection>
        );

      case 4:
        return (
          <FormSection 
            title="Infrastructure Assessment" 
            description="Evaluate utilities and sanitation systems"
          >
            <div className="space-y-8">
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Utility Systems</h4>
                <div className="space-y-6">
                  <RatingSection
                    title="Electricity"
                    description="Working outlets, switches, safe wiring"
                    value={formData.utility.electricity}
                    onChange={(value) => handleRatingChange('utility', 'electricity', value)}
                    labels={['Poor', 'Fair', 'Good', 'Very Good', 'Excellent']}
                  />
                  
                  <RatingSection
                    title="Lighting"
                    description="Adequate natural/artificial lighting"
                    value={formData.utility.lighting}
                    onChange={(value) => handleRatingChange('utility', 'lighting', value)}
                    labels={['Poor', 'Fair', 'Good', 'Very Good', 'Excellent']}
                  />
                  
                  <RatingSection
                    title="Internet Connectivity"
                    description="Stable internet signal/reception"
                    value={formData.utility.internetConnectivity}
                    onChange={(value) => handleRatingChange('utility', 'internetConnectivity', value)}
                    labels={['No Connection', 'Very Slow', 'Slow', 'Good', 'Excellent']}
                  />
                </div>
              </div>

              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Sanitation</h4>
                <div className="space-y-6">
                  <RatingSection
                    title="Cleanliness"
                    description="Floors, walls, windows clean and well-maintained"
                    value={formData.sanitation.cleanliness}
                    onChange={(value) => handleRatingChange('sanitation', 'cleanliness', value)}
                    labels={['Very Dirty', 'Dirty', 'Clean', 'Very Clean', 'Spotless']}
                  />
                  
                  <RatingSection
                    title="Waste Disposal"
                    description="Availability and proper placement of trash bins"
                    value={formData.sanitation.wasteDisposal}
                    onChange={(value) => handleRatingChange('sanitation', 'wasteDisposal', value)}
                    labels={['No Bins', 'Few Bins', 'Adequate', 'Good', 'Excellent']}
                  />
                  
                  <RatingSection
                    title="Odor Control"
                    description="Office free from foul odors"
                    value={formData.sanitation.odorControl}
                    onChange={(value) => handleRatingChange('sanitation', 'odorControl', value)}
                    labels={['Strong Odor', 'Noticeable', 'Slight', 'Fresh', 'Excellent']}
                  />
                  
                  <RatingSection
                    title="Restroom Access"
                    description="Accessible restrooms within reasonable distance"
                    value={formData.sanitation.restroomAccess}
                    onChange={(value) => handleRatingChange('sanitation', 'restroomAccess', value)}
                    labels={['No Access', 'Very Far', 'Far', 'Near', 'Very Near']}
                  />
                  
                  <RatingSection
                    title="PWD-Friendly Facilities"
                    description="Restroom has grab bars, ramps, wide entry, etc."
                    value={formData.sanitation.pwdFacilities}
                    onChange={(value) => handleRatingChange('sanitation', 'pwdFacilities', value)}
                    labels={['None', 'Few', 'Some', 'Good', 'Excellent']}
                  />
                </div>
              </div>
            </div>
          </FormSection>
        );

      case 5:
        return (
          <FormSection 
            title="Technology & Equipment Assessment" 
            description="Evaluate office technology and equipment"
          >
            <RatingSection
              title="Computers/Workstations"
              description="Available and functional computers for staff"
              value={formData.equipmentTechnology.computersWorkstations}
              onChange={(value) => handleRatingChange('equipmentTechnology', 'computersWorkstations', value)}
              labels={['None', 'Few/Old', 'Adequate', 'Good', 'Excellent']}
            />
            
            <RatingSection
              title="Communication Systems"
              description="Phone systems, intercoms, communication devices"
              value={formData.equipmentTechnology.communicationSystems}
              onChange={(value) => handleRatingChange('equipmentTechnology', 'communicationSystems', value)}
              labels={['None', 'Basic', 'Adequate', 'Good', 'Excellent']}
            />
            
            <RatingSection
              title="Office Equipment"
              description="Printers, scanners, copiers, and other office equipment"
              value={formData.equipmentTechnology.officeEquipment}
              onChange={(value) => handleRatingChange('equipmentTechnology', 'officeEquipment', value)}
              labels={['None', 'Limited', 'Adequate', 'Good', 'Excellent']}
            />
          </FormSection>
        );

      case 6:
        return (
          <FormSection 
            title="Space & Layout Assessment" 
            description="Evaluate office space efficiency and design"
          >
            <RatingSection
              title="Office Capacity"
              description="Adequate space for current number of staff"
              value={formData.spaceLayout.officeCapacity}
              onChange={(value) => handleRatingChange('spaceLayout', 'officeCapacity', value)}
              labels={['Overcrowded', 'Cramped', 'Adequate', 'Spacious', 'Very Spacious']}
            />
            
            <RatingSection
              title="Layout Efficiency"
              description="Efficient workflow and movement within the office"
              value={formData.spaceLayout.layoutEfficiency}
              onChange={(value) => handleRatingChange('spaceLayout', 'layoutEfficiency', value)}
              labels={['Poor', 'Fair', 'Good', 'Very Good', 'Excellent']}
            />
            
            <RatingSection
              title="Privacy"
              description="Adequate privacy for confidential work and meetings"
              value={formData.spaceLayout.privacy}
              onChange={(value) => handleRatingChange('spaceLayout', 'privacy', value)}
              labels={['No Privacy', 'Limited', 'Adequate', 'Good', 'Excellent']}
            />
            
            <RatingSection
              title="Storage Space"
              description="Adequate storage for documents and office supplies"
              value={formData.spaceLayout.storageSpace}
              onChange={(value) => handleRatingChange('spaceLayout', 'storageSpace', value)}
              labels={['No Storage', 'Limited', 'Adequate', 'Good', 'Excellent']}
            />
          </FormSection>
        );

      case 7:
        return (
          <FormSection 
            title="Safety & Security Assessment" 
            description="Evaluate security systems and emergency preparedness"
          >
            <RatingSection
              title="Emergency Preparedness"
              description="Fire extinguishers, alarms, emergency exits clearly marked"
              value={formData.safetySecurity.emergencyPreparedness}
              onChange={(value) => handleRatingChange('safetySecurity', 'emergencyPreparedness', value)}
              labels={['None', 'Basic', 'Adequate', 'Good', 'Excellent']}
            />
            
            <RatingSection
              title="Security Systems"
              description="Locks, security cameras, access control systems"
              value={formData.safetySecurity.securitySystems}
              onChange={(value) => handleRatingChange('safetySecurity', 'securitySystems', value)}
              labels={['None', 'Basic', 'Adequate', 'Good', 'Excellent']}
            />
            
            <RatingSection
              title="Document Security"
              description="Secure storage for confidential documents and files"
              value={formData.safetySecurity.documentSecurity}
              onChange={(value) => handleRatingChange('safetySecurity', 'documentSecurity', value)}
              labels={['Unsecured', 'Basic', 'Adequate', 'Good', 'Excellent']}
            />
            
            <RatingSection
              title="Safety Signage"
              description="Visible safety instructions and emergency contact information"
              value={formData.safetySecurity.safetySignage}
              onChange={(value) => handleRatingChange('safetySecurity', 'safetySignage', value)}
              labels={['None', 'Few', 'Adequate', 'Good', 'Excellent']}
            />
          </FormSection>
        );
        
      case 8:
        return (
          <FormSection 
            title="Assessment Summary & Recommendations" 
            description="Review your assessment results and provide final observations"
          >
            {/* Overall Score Display */}
            <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200">
              <CardContent className="p-8">
                <div className="text-center space-y-4">
                  <h4 className="text-2xl font-semibold text-gray-900">Assessment Results</h4>
                  
                  <div className="flex items-center justify-center space-x-8">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-emerald-600 mb-2">
                        {(() => {
                          const allScores = [
                            ...Object.values(formData.functionality),
                            ...Object.values(formData.utility),
                            ...Object.values(formData.sanitation),
                            ...Object.values(formData.equipmentTechnology),
                            ...Object.values(formData.furnitureFixtures),
                            ...Object.values(formData.spaceLayout),
                            ...Object.values(formData.safetySecurity)
                          ];
                          const totalPoints = allScores.reduce((sum, score) => sum + score, 0);
                          const maxPoints = allScores.length * 5;
                          return ((totalPoints / maxPoints) * 5).toFixed(1);
                        })()}
                      </div>
                      <p className="text-sm font-medium text-gray-600">Overall Score (out of 5)</p>
                    </div>
                    
                    <div className="text-center">
                      <div className={`text-xl font-semibold px-4 py-2 rounded-full ${(() => {
                        const allScores = [
                          ...Object.values(formData.functionality),
                          ...Object.values(formData.utility),
                          ...Object.values(formData.sanitation),
                          ...Object.values(formData.equipmentTechnology),
                          ...Object.values(formData.furnitureFixtures),
                          ...Object.values(formData.spaceLayout),
                          ...Object.values(formData.safetySecurity)
                        ];
                        const totalPoints = allScores.reduce((sum, score) => sum + score, 0);
                        const maxPoints = allScores.length * 5;
                        const score = (totalPoints / maxPoints) * 5;
                        if (score >= 4.5) return 'bg-green-100 text-green-800';
                        if (score >= 3.5) return 'bg-blue-100 text-blue-800';
                        if (score >= 2.5) return 'bg-yellow-100 text-yellow-800';
                        return 'bg-red-100 text-red-800';
                      })()}`}>
                        {(() => {
                          const allScores = [
                            ...Object.values(formData.functionality),
                            ...Object.values(formData.utility),
                            ...Object.values(formData.sanitation),
                            ...Object.values(formData.equipmentTechnology),
                            ...Object.values(formData.furnitureFixtures),
                            ...Object.values(formData.spaceLayout),
                            ...Object.values(formData.safetySecurity)
                          ];
                          const totalPoints = allScores.reduce((sum, score) => sum + score, 0);
                          const maxPoints = allScores.length * 5;
                          const score = (totalPoints / maxPoints) * 5;
                          if (score >= 4.5) return 'Excellent';
                          if (score >= 3.5) return 'Good';
                          if (score >= 2.5) return 'Need Improvement';
                          return 'Unusable';
                        })()}
                      </div>
                      <p className="text-sm font-medium text-gray-600 mt-2">Overall Condition</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Final Assessment Section */}
            <FormSection title="Final Evaluation" description="Provide detailed observations and recommended actions">
              <FormGrid columns={1}>
                <FormField 
                  label="Remarks and Observations" 
                  description="Detailed description of the office's current condition, strengths, and areas of concern"
                >
                  <Textarea
                    value={formData.remarks}
                    onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                    placeholder="Enter detailed observations about the office condition, including specific issues found, notable strengths, and overall assessment..."
                    rows={6}
                    className="resize-none"
                  />
                </FormField>
                
                <FormField 
                  label="Recommended Actions" 
                  description="Specific actions and improvements needed to address identified issues"
                >
                  <Textarea
                    value={formData.recommendingActions}
                    onChange={(e) => setFormData(prev => ({ ...prev, recommendingActions: e.target.value }))}
                    placeholder="Enter recommended actions for improvement, maintenance requirements, priority repairs, and suggested timeline for implementation..."
                    rows={6}
                    className="resize-none"
                  />
                </FormField>
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
                      officeName: '',
                      officeLocation: '',
                      buildingName: '',
                      officeType: 'Service Office',
                      customOfficeType: '',
                      department: 'REG',
                      campus: 'CSU Main Campus',
                      staffCount: '',
                      clientCapacity: '',
                      dateOfAssessment: '',
                      assessor: '',
                      position: '',
                      functionality: { accessibility: 1, ventilation: 1, noiseLevel: 1 },
                      utility: { electricity: 1, lighting: 1, internetConnectivity: 1 },
                      sanitation: { cleanliness: 1, wasteDisposal: 1, odorControl: 1, restroomAccess: 1, pwdFacilities: 1 },
                      equipmentTechnology: { computersWorkstations: 1, communicationSystems: 1, officeEquipment: 1 },
                      furnitureFixtures: { desksWorkstations: 1, seating: 1, storageSolutions: 1, receptionArea: 1 },
                      spaceLayout: { officeCapacity: 1, layoutEfficiency: 1, privacy: 1, storageSpace: 1 },
                      safetySecurity: { emergencyPreparedness: 1, securitySystems: 1, documentSecurity: 1, safetySignage: 1 },
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
                  <Button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-700 px-8 py-2 h-11">
                    <Save className="w-4 h-4 mr-2" />
                    Submit Assessment
                  </Button>
                ) : (
                  <Button onClick={handleNext} className="bg-emerald-600 hover:bg-emerald-700 px-6 py-2 h-11">
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

// Enhanced Administrative Office Assessment Dialog - Full CRUD Implementation
function AdminOfficeAssessmentDialog({ open, onOpenChange, record, onSave }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: any;
  onSave: (data: any) => void;
}) {
  const [formData, setFormData] = useState({
    officeName: '',
    officeLocation: '',
    buildingName: '',
    officeType: 'Service Office',
    customOfficeType: '',
    department: 'REG',
    campus: 'CSU Main Campus',
    staffCount: '',
    clientCapacity: '',
    dateOfAssessment: '',
    assessor: '',
    position: '',
    
    // All assessment criteria - Office specific
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
      odorControl: 1,
      restroomAccess: 1,
      pwdFacilities: 1
    },
    equipmentTechnology: {
      computersWorkstations: 1,
      communicationSystems: 1,
      officeEquipment: 1
    },
    furnitureFixtures: {
      desksWorkstations: 1,
      seating: 1,
      storageSolutions: 1,
      receptionArea: 1
    },
    spaceLayout: {
      officeCapacity: 1,
      layoutEfficiency: 1,
      privacy: 1,
      storageSpace: 1
    },
    safetySecurity: {
      emergencyPreparedness: 1,
      securitySystems: 1,
      documentSecurity: 1,
      safetySignage: 1
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
        customOfficeType: record.officeType && !['Service Office', 'Executive Office', 'Technical Office', 'Support Office'].includes(record.officeType) ? record.officeType : ''
      });
    } else {
      // Reset form for new records
      setFormData({
        officeName: '',
        officeLocation: '',
        buildingName: '',
        officeType: 'Service Office',
        customOfficeType: '',
        department: 'REG',
        campus: 'CSU Main Campus',
        staffCount: '',
        clientCapacity: '',
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
          odorControl: 1,
          restroomAccess: 1,
          pwdFacilities: 1
        },
        equipmentTechnology: {
          computersWorkstations: 1,
          communicationSystems: 1,
          officeEquipment: 1
        },
        furnitureFixtures: {
          desksWorkstations: 1,
          seating: 1,
          storageSolutions: 1,
          receptionArea: 1
        },
        spaceLayout: {
          officeCapacity: 1,
          layoutEfficiency: 1,
          privacy: 1,
          storageSpace: 1
        },
        safetySecurity: {
          emergencyPreparedness: 1,
          securitySystems: 1,
          documentSecurity: 1,
          safetySignage: 1
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
      ...Object.values(formData.equipmentTechnology),
      ...Object.values(formData.furnitureFixtures),
      ...Object.values(formData.spaceLayout),
      ...Object.values(formData.safetySecurity)
    ];
    const totalPoints = allScores.reduce((sum, score) => sum + score, 0);
    const maxPoints = allScores.length * 5;
    return (totalPoints / maxPoints) * 5;
  };

  const handleSave = () => {
    const overallScore = calculateOverallScore();
    let overallCondition = 'Unusable';
    if (overallScore >= 4.5) overallCondition = 'Excellent';
    else if (overallScore >= 3.5) overallCondition = 'Good';
    else if (overallScore >= 2.5) overallCondition = 'Need Improvement';

    onSave({
      ...formData,
      officeType: formData.officeType === 'Others' ? formData.customOfficeType : formData.officeType,
      overallScore: parseFloat(overallScore.toFixed(1)),
      overallCondition,
      staffCount: parseInt(formData.staffCount) || 0,
      clientCapacity: parseInt(formData.clientCapacity) || 0,
      dateOfAssessment: formData.dateOfAssessment || new Date().toISOString().split('T')[0]
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[90vw] lg:max-w-[85vw] xl:max-w-[80vw] 2xl:max-w-[75vw] max-h-[95vh] bg-white border-0 shadow-2xl rounded-lg overflow-hidden">
        {/* Enhanced Formal Header - Emerald Theme */}
        <DialogHeader className="bg-gradient-to-r from-slate-900 via-emerald-900 to-teal-900 text-white -m-6 px-8 py-6 mb-0 relative">
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
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <span className="block">Administrative Office Assessment System</span>
              <p className="text-sm font-normal text-emerald-100 mt-2 leading-relaxed">
                {record
                  ? `Editing Assessment Record: ${record.officeName} - ${record.officeLocation}`
                  : "Creating New Administrative Office Assessment Record"}
              </p>
            </div>
          </DialogTitle>
          <DialogDescription className="sr-only">
            {record
              ? `Edit administrative office assessment record for ${record.officeName} ${record.officeLocation} including basic information, assessment criteria ratings, and recommendations.`
              : "Create a new administrative office assessment record by providing office information, rating assessment criteria, and adding observations."}
          </DialogDescription>
        </DialogHeader>

        {/* Responsive Content Area with Smart Scrolling */}
        <div className="flex-1 overflow-y-auto max-h-[calc(95vh-200px)]">
          <div className="p-8 space-y-8">
            {/* Basic Information Panel */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-100 border border-emerald-300 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-emerald-300">
                <Building className="h-5 w-5 text-emerald-600" />
                <h4 className="text-lg font-semibold text-slate-900">Office Information</h4>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <Label htmlFor="officeName" className="text-sm font-semibold text-slate-700 mb-3 block">
                      Office Name
                    </Label>
                    <Input
                      id="officeName"
                      value={formData.officeName}
                      onChange={(e) => setFormData(prev => ({ ...prev, officeName: e.target.value }))}
                      placeholder="Enter office name"
                      className="border-emerald-400 bg-white h-11"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="officeLocation" className="text-sm font-semibold text-slate-700 mb-3 block">
                      Office Location
                    </Label>
                    <Input
                      id="officeLocation"
                      value={formData.officeLocation}
                      onChange={(e) => setFormData(prev => ({ ...prev, officeLocation: e.target.value }))}
                      placeholder="e.g., Ground Floor, Room 101"
                      className="border-emerald-400 bg-white h-11"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="buildingName" className="text-sm font-semibold text-slate-700 mb-3 block">
                      Building Name
                    </Label>
                    <Input
                      id="buildingName"
                      value={formData.buildingName}
                      onChange={(e) => setFormData(prev => ({ ...prev, buildingName: e.target.value }))}
                      placeholder="Enter building name"
                      className="border-emerald-400 bg-white h-11"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-semibold text-slate-700 mb-3 block">Office Type</Label>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-4">
                        {['Service Office', 'Executive Office', 'Technical Office', 'Support Office', 'Others'].map((type) => (
                          <label key={type} className="flex items-center space-x-2">
                            <input
                              type="radio"
                              value={type}
                              checked={formData.officeType === type || (type === 'Others' && formData.customOfficeType)}
                              onChange={(e) => setFormData(prev => ({ ...prev, officeType: e.target.value }))}
                              className="w-4 h-4 text-emerald-600"
                            />
                            <span className="text-sm font-medium text-slate-700">{type}</span>
                          </label>
                        ))}
                      </div>
                      {(formData.officeType === 'Others' || formData.customOfficeType) && (
                        <Input
                          value={formData.customOfficeType}
                          onChange={(e) => setFormData(prev => ({ ...prev, customOfficeType: e.target.value, officeType: 'Others' }))}
                          placeholder="Please specify office type"
                          className="border-emerald-400 bg-white h-11"
                        />
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="staffCount" className="text-sm font-semibold text-slate-700 mb-3 block">
                        Staff Count
                      </Label>
                      <Input
                        id="staffCount"
                        type="number"
                        value={formData.staffCount}
                        onChange={(e) => setFormData(prev => ({ ...prev, staffCount: e.target.value }))}
                        placeholder="Enter count"
                        className="border-emerald-400 bg-white h-11"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="clientCapacity" className="text-sm font-semibold text-slate-700 mb-3 block">
                        Client Capacity
                      </Label>
                      <Input
                        id="clientCapacity"
                        type="number"
                        value={formData.clientCapacity}
                        onChange={(e) => setFormData(prev => ({ ...prev, clientCapacity: e.target.value }))}
                        placeholder="Enter capacity"
                        className="border-emerald-400 bg-white h-11"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <Label htmlFor="department" className="text-sm font-semibold text-slate-700 mb-3 block">
                      Department
                    </Label>
                    <Select value={formData.department} onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}>
                      <SelectTrigger className="border-emerald-400 bg-white h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CSU_DEPARTMENTS.map((dept) => (
                          <SelectItem key={dept.code} value={dept.code}>{dept.code} - {dept.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="campus" className="text-sm font-semibold text-slate-700 mb-3 block">
                      Campus
                    </Label>
                    <Select value={formData.campus} onValueChange={(value) => setFormData(prev => ({ ...prev, campus: value }))}>
                      <SelectTrigger className="border-emerald-400 bg-white h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CSU Main Campus">CSU Main Campus</SelectItem>
                        <SelectItem value="CSU Cabadbaran Campus">CSU Cabadbaran Campus</SelectItem>
                      </SelectContent>
                    </Select>
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
                      className="border-emerald-400 bg-white h-11"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <Label htmlFor="assessor" className="text-sm font-semibold text-slate-700 mb-3 block">
                      Assessor Name
                    </Label>
                    <Input
                      id="assessor"
                      value={formData.assessor}
                      onChange={(e) => setFormData(prev => ({ ...prev, assessor: e.target.value }))}
                      placeholder="Enter assessor name"
                      className="border-emerald-400 bg-white h-11"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="position" className="text-sm font-semibold text-slate-700 mb-3 block">
                      Position/Title
                    </Label>
                    <Input
                      id="position"
                      value={formData.position}
                      onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                      placeholder="Enter position"
                      className="border-emerald-400 bg-white h-11"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Assessment Criteria Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {renderRatingSection(
                'functionality',
                'Functionality Assessment',
                formData.functionality,
                'Rate accessibility, ventilation, and noise levels (1 = Poor, 5 = Excellent)'
              )}
              
              {renderRatingSection(
                'utility',
                'Utility Systems',
                formData.utility,
                'Rate electricity, lighting, and internet connectivity (1 = Poor, 5 = Excellent)'
              )}
              
              {renderRatingSection(
                'sanitation',
                'Sanitation & Hygiene',
                formData.sanitation,
                'Rate cleanliness and sanitation facilities (1 = Poor, 5 = Excellent)'
              )}
              
              {renderRatingSection(
                'equipmentTechnology',
                'Technology & Equipment',
                formData.equipmentTechnology,
                'Rate computers, communication systems, and office equipment (1 = Poor, 5 = Excellent)'
              )}
              
              {renderRatingSection(
                'furnitureFixtures',
                'Furniture & Fixtures',
                formData.furnitureFixtures,
                'Rate office furniture and fixtures (1 = Poor, 5 = Excellent)'
              )}
              
              {renderRatingSection(
                'spaceLayout',
                'Space & Layout',
                formData.spaceLayout,
                'Rate office capacity, layout, and privacy (1 = Poor, 5 = Excellent)'
              )}
            </div>

            {/* Safety & Security - Full Width */}
            <div>
              {renderRatingSection(
                'safetySecurity',
                'Safety & Security',
                formData.safetySecurity,
                'Rate emergency preparedness, security systems, and document security (1 = Poor, 5 = Excellent)'
              )}
            </div>

            {/* Remarks and Recommendations */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-100 border border-amber-300 rounded-xl p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-amber-300">
                <FileText className="h-5 w-5 text-amber-600" />
                <h4 className="text-lg font-semibold text-slate-900">Assessment Summary</h4>
              </div>

              <div className="space-y-5">
                <div>
                  <Label htmlFor="remarks" className="text-sm font-semibold text-slate-700 mb-3 block">
                    Remarks and Observations
                  </Label>
                  <Textarea
                    id="remarks"
                    value={formData.remarks}
                    onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                    placeholder="Enter detailed observations about the office condition, strengths, and areas of concern..."
                    rows={5}
                    className="resize-none border-amber-400 bg-white"
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
                    placeholder="Enter recommended actions for improvement, maintenance requirements, and suggested timeline..."
                    rows={5}
                    className="resize-none border-amber-400 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Score Preview */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-slate-600">Estimated Overall Score</h4>
                  <p className="text-3xl font-bold text-emerald-700 mt-1">
                    {calculateOverallScore().toFixed(1)}/5.0
                  </p>
                </div>
                <div className={`px-6 py-3 rounded-lg font-semibold ${
                  calculateOverallScore() >= 4.5 ? 'bg-green-100 text-green-800' :
                  calculateOverallScore() >= 3.5 ? 'bg-blue-100 text-blue-800' :
                  calculateOverallScore() >= 2.5 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {calculateOverallScore() >= 4.5 ? 'Excellent' :
                   calculateOverallScore() >= 3.5 ? 'Good' :
                   calculateOverallScore() >= 2.5 ? 'Need Improvement' :
                   'Unusable'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Footer with Action Buttons */}
        <div className="border-t border-slate-200 bg-slate-50 -m-6 mt-0 px-8 py-5 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-slate-600 hover:text-slate-900"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          
          <Button
            onClick={handleSave}
            className="bg-emerald-600 hover:bg-emerald-700 px-8 h-11"
          >
            <Save className="w-4 h-4 mr-2" />
            {record ? 'Update Assessment' : 'Save Assessment'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}