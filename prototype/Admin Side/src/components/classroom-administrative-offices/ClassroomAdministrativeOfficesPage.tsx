import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { 
  School, Users2, ClipboardCheck, Building, Target, TrendingUp, 
  Calendar, Edit, Plus, Eye, FileText, BarChart3, Filter, Search 
} from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { toast } from 'sonner@2.0.3';

interface ClassroomAdministrativeOfficesPageProps {
  category: string;
  onProjectSelect: (project: any) => void;
  userRole: string;
  filterData?: any;
  requireAuth: (action: string) => boolean;
  onClearFilters: () => void;
}

// Sample data for Classroom and Administrative Offices
const CLASSROOM_ADMIN_DATA = {
  overview: {
    totalSpaces: 64,
    assessedSpaces: 54,
    avgAssessmentScore: 86.8,
    priorityActions: 12
  },
  subcategories: [
    {
      id: 'classroom-csu-main-cc',
      name: 'Classroom (CSU Main & CSU CC)',
      totalSpaces: 28,
      assessedSpaces: 24,
      avgScore: 87.2,
      status: 'active',
      assessmentResults: {
        spaceUtilization: 85.5,
        facilityCondition: 88.2,
        equipmentStatus: 84.7,
        accessibility: 89.1
      },
      spaceCommitteeRemarks: 'Excellent space utilization with minor equipment upgrades needed',
      recentAssessments: [
        {
          id: 'ca-001',
          roomNumber: 'Room 101-A',
          campus: 'CSU Main',
          assessmentDate: '2024-01-15',
          score: 88.5,
          priority: 'Medium',
          remarks: 'Good condition, needs minor maintenance'
        },
        {
          id: 'ca-002', 
          roomNumber: 'Room 205-B',
          campus: 'CSU CC',
          assessmentDate: '2024-01-14',
          score: 92.0,
          priority: 'Low',
          remarks: 'Excellent condition and utilization'
        }
      ]
    },
    {
      id: 'admin-office-csu-main-cc',
      name: 'Administrative Office (CSU Main & CSU CC)',
      totalSpaces: 22,
      assessedSpaces: 19,
      avgScore: 86.1,
      status: 'active',
      assessmentResults: {
        workflowEfficiency: 87.3,
        spaceAllocation: 85.9,
        technologyIntegration: 88.5,
        ergonomics: 86.7
      },
      spaceCommitteeRemarks: 'Good workflow efficiency with recommended technology upgrades',
      recentAssessments: [
        {
          id: 'ao-001',
          officeName: 'Registrar Office',
          campus: 'CSU Main',
          assessmentDate: '2024-01-13',
          score: 89.2,
          priority: 'Low',
          remarks: 'Well-organized space with good workflow'
        },
        {
          id: 'ao-002',
          officeName: 'Finance Office',
          campus: 'CSU CC',
          assessmentDate: '2024-01-12',
          score: 84.5,
          priority: 'Medium',
          remarks: 'Needs ergonomic improvements'
        }
      ]
    },
    {
      id: 'prioritization-matrix',
      name: 'Prioritization Matrix',
      totalSpaces: 14,
      assessedSpaces: 11,
      avgScore: 87.1,
      status: 'active',
      assessmentResults: {
        urgencyAssessment: 89.2,
        impactAnalysis: 87.8,
        resourceAllocation: 85.3,
        strategicAlignment: 88.9
      },
      spaceCommitteeRemarks: 'Well-structured prioritization with clear strategic alignment',
      recentAssessments: [
        {
          id: 'pm-001',
          itemName: 'Library Expansion Priority',
          assessmentDate: '2024-01-11',
          score: 91.5,
          priority: 'High',
          remarks: 'Critical infrastructure need identified'
        },
        {
          id: 'pm-002',
          itemName: 'IT Lab Upgrade Priority',
          assessmentDate: '2024-01-10',
          score: 85.8,
          priority: 'Medium',
          remarks: 'Technology refresh required'
        }
      ]
    }
  ]
};

export function ClassroomAdministrativeOfficesPage({
  category,
  onProjectSelect,
  userRole,
  filterData,
  requireAuth,
  onClearFilters
}: ClassroomAdministrativeOfficesPageProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const data = CLASSROOM_ADMIN_DATA;

  const handleAssessmentView = (assessment: any) => {
    onProjectSelect({
      ...assessment,
      category: 'classroom-administrative-offices',
      type: 'assessment'
    });
  };

  const handleAddAssessment = () => {
    if (!requireAuth('add assessment')) return;
    
    toast.info('Assessment form will be opened');
    // In a real app, this would open a form dialog
  };

  const filteredSubcategories = selectedSubcategory === 'all' 
    ? data.subcategories 
    : data.subcategories.filter(sub => sub.id === selectedSubcategory);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between p-6">
          <div>
            <div className="flex items-center gap-3">
              <School className="w-8 h-8 text-purple-600" />
              <div>
                <h1 className="text-2xl font-semibold text-foreground">Classroom & Administrative Offices</h1>
                <p className="text-sm text-muted-foreground">Space assessment and evaluation management</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <Building className="w-3 h-3 mr-1" />
              {data.overview.totalSpaces} Total Spaces
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Calendar className="w-3 h-3 mr-1" />
              Current Assessment Cycle
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-l-4 border-l-purple-600">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Spaces</p>
                      <p className="text-2xl font-bold text-purple-600">{data.overview.totalSpaces}</p>
                    </div>
                    <Building className="w-8 h-8 text-purple-600" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Across CSU Main & CC campuses
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-600">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Assessed Spaces</p>
                      <p className="text-2xl font-bold text-blue-600">{data.overview.assessedSpaces}</p>
                    </div>
                    <ClipboardCheck className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {((data.overview.assessedSpaces / data.overview.totalSpaces) * 100).toFixed(1)}% completion rate
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-600">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Avg Assessment Score</p>
                      <p className="text-2xl font-bold text-green-600">{data.overview.avgAssessmentScore}%</p>
                    </div>
                    <Target className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Above target performance
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-amber-600">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Priority Actions</p>
                      <p className="text-2xl font-bold text-amber-600">{data.overview.priorityActions}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-amber-600" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Improvement initiatives
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Subcategories Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {data.subcategories.map((subcategory) => (
                <Card key={subcategory.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base text-slate-700">{subcategory.name}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {subcategory.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="p-2 bg-slate-50 rounded">
                        <p className="text-lg font-bold text-slate-700">{subcategory.assessedSpaces}</p>
                        <p className="text-xs text-slate-500">Assessed</p>
                      </div>
                      <div className="p-2 bg-slate-50 rounded">
                        <p className="text-lg font-bold text-slate-700">{subcategory.totalSpaces}</p>
                        <p className="text-xs text-slate-500">Total</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Assessment Progress</span>
                        <span className="font-medium">{((subcategory.assessedSpaces / subcategory.totalSpaces) * 100).toFixed(0)}%</span>
                      </div>
                      <Progress value={(subcategory.assessedSpaces / subcategory.totalSpaces) * 100} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Average Score</span>
                        <span className="font-medium text-purple-600">{subcategory.avgScore}%</span>
                      </div>
                    </div>

                    <Alert>
                      <ClipboardCheck className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        {subcategory.spaceCommitteeRemarks}
                      </AlertDescription>
                    </Alert>

                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setActiveTab('assessments')}
                    >
                      View Assessments
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Assessments Tab */}
          <TabsContent value="assessments" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-slate-700">Assessment Management</CardTitle>
                <CardDescription>View and manage space assessments across all categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search assessments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {data.subcategories.map(sub => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleAddAssessment}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Assessment
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Assessment Results */}
            {filteredSubcategories.map((subcategory) => (
              <Card key={subcategory.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base text-slate-700">{subcategory.name}</CardTitle>
                    <Badge variant="outline">
                      {subcategory.recentAssessments.length} assessments
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {subcategory.recentAssessments.map((assessment) => (
                      <div 
                        key={assessment.id} 
                        className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors cursor-pointer"
                        onClick={() => handleAssessmentView(assessment)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-6 h-6 text-purple-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-700">
                              {assessment.roomNumber || assessment.officeName || assessment.itemName}
                            </h4>
                            <p className="text-sm text-slate-500">
                              {assessment.campus && `${assessment.campus} • `}
                              {assessment.assessmentDate}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">{assessment.remarks}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="font-bold text-lg text-purple-600">{assessment.score}%</p>
                            <Badge 
                              variant={assessment.priority === 'High' ? 'destructive' : assessment.priority === 'Medium' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {assessment.priority}
                            </Badge>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-slate-700">Assessment Analytics</CardTitle>
                <CardDescription>Detailed analysis of space assessment results and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                  <p className="text-slate-500">Comprehensive analytics dashboard coming soon...</p>
                  <p className="text-sm text-slate-400 mt-2">
                    Track assessment trends, space utilization metrics, and improvement recommendations
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}