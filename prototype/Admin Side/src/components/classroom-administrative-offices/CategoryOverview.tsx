import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  School, Building2, ClipboardCheck, Target, TrendingUp, BarChart3, 
  Calendar, Edit, Plus, Eye, FileText, Users, MapPin,
  CheckCircle, AlertTriangle, Star, Info, ArrowUpRight, Activity
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface CategoryOverviewProps {
  onProjectSelect: (project: any) => void;
  userRole: string;
  requireAuth: (action: string) => boolean;
  onNavigate: (page: string) => void;
}

// Consolidated classroom and administrative offices data from all subcategories
const CLASSROOM_ADMIN_OVERVIEW_DATA = {
  summary: {
    totalSpaces: 64,
    assessedSpaces: 54,
    avgAssessmentScore: 86.8,
    priorityActions: 12,
    targetScore: 85.0,
    variance: 1.8,
    lastAssessmentCycle: '2024-01-15'
  },
  subcategoryBreakdown: [
    {
      id: 'classroom-csu-main-cc',
      name: 'Classroom Spaces',
      totalSpaces: 28,
      assessedSpaces: 24,
      avgScore: 87.2,
      targetScore: 85.0,
      variance: 2.2,
      campus: 'CSU Main & CSU CC',
      assessmentResults: {
        spaceUtilization: 85.5,
        facilityCondition: 88.2,
        equipmentStatus: 84.7,
        accessibility: 89.1
      },
      spaceCommitteeRemarks: 'Excellent space utilization with minor equipment upgrades needed',
      priority: 'Medium',
      trends: '+2.1% from last quarter'
    },
    {
      id: 'admin-office-csu-main-cc',
      name: 'Administrative Offices',
      totalSpaces: 22,
      assessedSpaces: 19,
      avgScore: 86.1,
      targetScore: 84.0,
      variance: 2.1,
      campus: 'CSU Main & CSU CC',
      assessmentResults: {
        workflowEfficiency: 87.3,
        spaceAllocation: 85.9,
        technologyIntegration: 88.5,
        ergonomics: 86.7
      },
      spaceCommitteeRemarks: 'Good workflow efficiency with recommended technology upgrades',
      priority: 'Low',
      trends: '+1.8% from last quarter'
    },
    {
      id: 'prioritization-matrix',
      name: 'Prioritization Matrix',
      totalSpaces: 14,
      assessedSpaces: 11,
      avgScore: 87.1,
      targetScore: 86.0,
      variance: 1.1,
      campus: 'Strategic Planning',
      assessmentResults: {
        urgencyAssessment: 89.2,
        impactAnalysis: 87.8,
        resourceAllocation: 85.3,
        strategicAlignment: 88.9
      },
      spaceCommitteeRemarks: 'Well-structured prioritization with clear strategic alignment',
      priority: 'High',
      trends: '+3.2% improvement'
    }
  ],
  campusComparison: {
    mainCampus: {
      totalSpaces: 35,
      assessedSpaces: 30,
      avgScore: 87.0,
      topPerformingArea: 'Technology Integration',
      improvementArea: 'Equipment Status'
    },
    cabadbaranCampus: {
      totalSpaces: 29,
      assessedSpaces: 24,
      avgScore: 86.5,
      topPerformingArea: 'Space Utilization',
      improvementArea: 'Accessibility Features'
    }
  },
  recentAssessments: [
    {
      id: 'assess-001',
      spaceName: 'Conference Room A',
      spaceType: 'Administrative Office',
      campus: 'CSU Main',
      assessmentDate: '2024-01-15',
      score: 89.5,
      status: 'Excellent',
      assessor: 'Space Committee',
      remarks: 'Outstanding facilities with modern equipment'
    },
    {
      id: 'assess-002',
      spaceName: 'Lecture Hall 201',
      spaceType: 'Classroom',
      campus: 'CSU CC',
      assessmentDate: '2024-01-14',
      score: 85.2,
      status: 'Good',
      assessor: 'Facilities Team',
      remarks: 'Good condition, minor ventilation improvements needed'
    },
    {
      id: 'assess-003',
      spaceName: 'Library Study Area',
      spaceType: 'Academic Support',
      campus: 'CSU Main',
      assessmentDate: '2024-01-13',
      score: 92.1,
      status: 'Excellent',
      assessor: 'Space Committee',
      remarks: 'Exemplary space design and utilization'
    }
  ],
  priorityActions: [
    {
      action: 'Equipment Upgrade Initiative',
      affectedSpaces: 8,
      priority: 'High',
      timeline: '30 days',
      budget: 250000,
      description: 'Upgrade aging classroom equipment'
    },
    {
      action: 'Accessibility Enhancement',
      affectedSpaces: 5,
      priority: 'Medium',
      timeline: '45 days',
      budget: 180000,
      description: 'Improve accessibility features across facilities'
    },
    {
      action: 'HVAC System Optimization',
      affectedSpaces: 12,
      priority: 'Medium',
      timeline: '60 days',
      budget: 320000,
      description: 'Optimize ventilation and climate control'
    }
  ]
};

export const CategoryOverview = React.memo(function CategoryOverview({ 
  onProjectSelect, 
  userRole, 
  requireAuth, 
  onNavigate 
}: CategoryOverviewProps) {
  // Initialize state with proper defaults
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const data = CLASSROOM_ADMIN_OVERVIEW_DATA;

  // Ensure component updates properly when mounted or navigation changes
  React.useEffect(() => {
    setIsLoading(true);
    // Simulate loading to force refresh and ensure proper rendering
    const timer = setTimeout(() => {
      setActiveTab('overview');
      setSelectedSubcategory('all');
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [onNavigate, userRole]);

  // Show loading state briefly to ensure proper rendering
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-600">Loading Classroom & Administrative Offices Overview...</span>
        </div>
      </div>
    );
  }

  const handleAssessmentClick = (assessment: any) => {
    onProjectSelect({
      ...assessment,
      category: 'classroom-administrative-offices',
      type: 'assessment'
    });
  };

  const handleSubcategoryNavigate = (subcategory: string) => {
    if (subcategory === 'classroom-csu-main-cc') {
      onNavigate('classroom-csu-main-cc');
    } else if (subcategory === 'admin-office-csu-main-cc') {
      onNavigate('admin-office-csu-main-cc');
    } else if (subcategory === 'prioritization-matrix') {
      onNavigate('prioritization-matrix');
    } else {
      onNavigate('classroom-administrative-offices');
    }
  };

  const handleAddAssessment = () => {
    if (!requireAuth('add assessment')) return;
    toast.info('Assessment form will be opened');
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 80) return 'bg-blue-100 text-blue-800';
    if (score >= 70) return 'bg-amber-100 text-amber-800';
    return 'bg-red-100 text-red-800';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-600';
      case 'Medium': return 'text-amber-600';
      case 'Low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-amber-100 text-amber-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div key={`classroom-admin-overview-${Date.now()}`} className="min-h-screen bg-slate-50">
      {/* Professional Header - Consistent with Construction Infrastructure */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col gap-6">
            {/* Main Header Row */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl shadow-sm">
                  <School className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-3xl text-slate-900">Classroom & Administrative Offices</h1>
                  <p className="text-slate-600 mt-1">Space Assessment & Evaluation Monitoring Dashboard</p>
                  <div className="flex items-center gap-6 mt-3 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-purple-600" />
                      <span>Updated {data.summary.lastAssessmentCycle}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span>Q4 2024 Assessment Cycle</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Activity className="w-4 h-4 text-green-600" />
                      <span>{data.summary.assessedSpaces} Spaces Assessed</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-sm px-3 py-1 bg-purple-100 text-purple-800 border-purple-200">
                    <Building2 className="w-4 h-4 mr-1" />
                    {data.summary.totalSpaces} Total Spaces
                  </Badge>
                  <Badge variant="secondary" className="text-sm px-3 py-1 bg-green-100 text-green-800 border-green-200">
                    <Target className="w-4 h-4 mr-1" />
                    {data.summary.avgAssessmentScore}% Average Score
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleAddAssessment}>
                    <Edit className="w-4 h-4 mr-1" />
                    Manage Assessments
                  </Button>
                  <Button size="sm" onClick={handleAddAssessment}>
                    <Plus className="w-4 h-4 mr-1" />
                    New Assessment
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          {/* Tab Navigation - Consistent with Construction Infrastructure */}
          <div className="bg-white rounded-lg border shadow-sm p-1">
            <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-transparent">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white py-3 px-4 rounded-md transition-all font-medium"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Space Overview
              </TabsTrigger>
              <TabsTrigger 
                value="subcategory-analysis" 
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white py-3 px-4 rounded-md transition-all font-medium"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Space Categories
              </TabsTrigger>
              <TabsTrigger 
                value="assessment-results" 
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white py-3 px-4 rounded-md transition-all font-medium"
              >
                <ClipboardCheck className="w-4 h-4 mr-2" />
                Assessment Results
              </TabsTrigger>
              <TabsTrigger 
                value="action-items" 
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white py-3 px-4 rounded-md transition-all font-medium"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Priority Actions
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Key Metrics Cards - Professional Design matching Construction Infrastructure */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-600 rounded-xl">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-600 mb-1">Total Spaces</p>
                      <p className="text-2xl font-bold text-slate-900">{data.summary.totalSpaces}</p>
                      <p className="text-xs text-slate-500 mt-1">Across all campuses</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-600 rounded-xl">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-600 mb-1">Average Score</p>
                      <p className="text-2xl font-bold text-slate-900">{data.summary.avgAssessmentScore}%</p>
                      <p className="text-xs text-green-600 mt-1">+{data.summary.variance}% above target</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600 rounded-xl">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-600 mb-1">Assessed Spaces</p>
                      <p className="text-2xl font-bold text-slate-900">{data.summary.assessedSpaces}</p>
                      <p className="text-xs text-blue-600 mt-1">{((data.summary.assessedSpaces / data.summary.totalSpaces) * 100).toFixed(1)}% completion</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-600 rounded-xl">
                      <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-600 mb-1">Priority Actions</p>
                      <p className="text-2xl font-bold text-slate-900">{data.summary.priorityActions}</p>
                      <p className="text-xs text-amber-600 mt-1">Active initiatives</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Space Categories Performance Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-semibold text-slate-900">Space Categories Performance</CardTitle>
                  <CardDescription className="text-slate-600">Assessment results across all space categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {data.subcategoryBreakdown.map((subcategory) => (
                      <div key={subcategory.id} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium text-slate-900">{subcategory.name}</span>
                            <p className="text-sm text-slate-500">{subcategory.campus}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`font-bold ${getScoreColor(subcategory.avgScore)}`}>
                              {subcategory.avgScore}%
                            </span>
                            <Badge variant="outline" className={`${getPriorityBadgeColor(subcategory.priority)} border-0`}>
                              {subcategory.priority}
                            </Badge>
                          </div>
                        </div>
                        <Progress value={subcategory.avgScore} className="h-3" />
                        <div className="flex items-center justify-between text-sm text-slate-500">
                          <span>{subcategory.assessedSpaces}/{subcategory.totalSpaces} spaces assessed</span>
                          <span className="font-medium">{subcategory.trends}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-semibold text-slate-900">Recent Assessment Activity</CardTitle>
                  <CardDescription className="text-slate-600">Latest space assessment results and evaluations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.recentAssessments.map((assessment) => (
                      <div 
                        key={assessment.id} 
                        className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:border-purple-200 hover:bg-purple-50/30 transition-all cursor-pointer"
                        onClick={() => handleAssessmentClick(assessment)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                            <ClipboardCheck className="w-6 h-6 text-purple-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-900">{assessment.spaceName}</h4>
                            <p className="text-sm text-slate-500">
                              {assessment.campus} • {assessment.assessmentDate}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <Badge className={`${getScoreBadgeColor(assessment.score)} border-0 mb-1`}>
                            {assessment.score}%
                          </Badge>
                          <p className="text-sm text-slate-500">
                            {assessment.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Campus Comparison */}
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-slate-900">Campus Performance Comparison</CardTitle>
                <CardDescription className="text-slate-600">Assessment metrics comparison between campuses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-slate-700">CSU Main Campus</h4>
                      <Badge variant="outline" className="text-xs">
                        {data.campusComparison.mainCampus.avgScore}% avg
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Total Spaces:</span>
                        <span className="font-medium">{data.campusComparison.mainCampus.totalSpaces}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Assessed:</span>
                        <span className="font-medium">{data.campusComparison.mainCampus.assessedSpaces}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Top Area:</span>
                        <span className="font-medium text-green-600">{data.campusComparison.mainCampus.topPerformingArea}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Improvement:</span>
                        <span className="font-medium text-amber-600">{data.campusComparison.mainCampus.improvementArea}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-slate-700">Cabadbaran Campus</h4>
                      <Badge variant="outline" className="text-xs">
                        {data.campusComparison.cabadbaranCampus.avgScore}% avg
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Total Spaces:</span>
                        <span className="font-medium">{data.campusComparison.cabadbaranCampus.totalSpaces}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Assessed:</span>
                        <span className="font-medium">{data.campusComparison.cabadbaranCampus.assessedSpaces}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Top Area:</span>
                        <span className="font-medium text-green-600">{data.campusComparison.cabadbaranCampus.topPerformingArea}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Improvement:</span>
                        <span className="font-medium text-amber-600">{data.campusComparison.cabadbaranCampus.improvementArea}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subcategory Analysis Tab */}
          <TabsContent value="subcategory-analysis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {data.subcategoryBreakdown.map((subcategory) => (
                <Card key={subcategory.id} className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-slate-900">{subcategory.name}</CardTitle>
                      <Badge className={`text-xs ${getScoreBadgeColor(subcategory.avgScore)} border-0`}>
                        {subcategory.avgScore}%
                      </Badge>
                    </div>
                    <CardDescription className="text-slate-600">{subcategory.campus}</CardDescription>
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

                    <Alert className="p-3">
                      <ClipboardCheck className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        <strong>Space Committee Remarks:</strong><br />
                        {subcategory.spaceCommitteeRemarks}
                      </AlertDescription>
                    </Alert>

                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleSubcategoryNavigate(subcategory.id)}
                    >
                      View Detailed Assessment
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Assessment Results Tab */}
          <TabsContent value="assessment-results" className="space-y-6">
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-slate-900">Assessment Criteria Breakdown</CardTitle>
                <CardDescription className="text-slate-600">Detailed assessment results across all evaluation criteria</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {data.subcategoryBreakdown.map((subcategory) => (
                    <div key={subcategory.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-slate-700">{subcategory.name}</h4>
                        <Badge className={`${getScoreBadgeColor(subcategory.avgScore)}`}>
                          {subcategory.avgScore}% Overall
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(subcategory.assessmentResults).map(([key, value]) => (
                          <div key={key} className="text-center p-3 bg-slate-50 rounded">
                            <p className="text-lg font-bold text-slate-700">{value}%</p>
                            <p className="text-xs text-slate-500 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Priority Actions Tab */}
          <TabsContent value="action-items" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-slate-700">Priority Action Items</CardTitle>
                <CardDescription>Identified improvement initiatives based on assessment results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.priorityActions.map((action, index) => (
                    <div key={index} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-slate-700">{action.action}</h4>
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${getPriorityBadgeColor(action.priority)}`}>
                            {action.priority} Priority
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {action.timeline}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 mb-3">{action.description}</p>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-slate-500">Affected Spaces:</span>
                          <span className="font-medium ml-1">{action.affectedSpaces}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Timeline:</span>
                          <span className="font-medium ml-1">{action.timeline}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Budget:</span>
                          <span className="font-medium ml-1">₱{(action.budget / 1000).toFixed(0)}K</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
});