import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  School, Building2, ClipboardCheck, Target, 
  Microscope, Briefcase, BarChart3, ArrowRight,
  CheckCircle, Calendar, Activity, TrendingUp
} from 'lucide-react';

interface FacilitiesAssessmentOverviewProps {
  onProjectSelect: (project: any) => void;
  userRole: string;
  requireAuth: (action: string) => boolean;
  onNavigate: (page: string) => void;
}

// Consolidated facilities assessment data
const FACILITIES_ASSESSMENT_DATA = {
  summary: {
    totalSpaces: 196,
    assessedSpaces: 154,
    avgAssessmentScore: 87.5,
    priorityActions: 30,
    lastAssessmentCycle: '2024-01-15'
  },
  subcategories: [
    {
      id: 'classroom-csu-main-cc',
      name: 'Classroom Facilities',
      icon: School,
      totalSpaces: 28,
      assessedSpaces: 24,
      avgScore: 87.2,
      campus: 'CSU Main & CSU CC',
      description: 'Comprehensive classroom space assessment and evaluation',
      status: 'Good',
      progress: 85.7
    },
    {
      id: 'laboratory-assessment',
      name: 'Laboratory Facilities',
      icon: Microscope,
      totalSpaces: 104,
      assessedSpaces: 89,
      avgScore: 88.3,
      campus: 'CSU Main & CSU CC',
      description: 'Laboratory safety and equipment assessment',
      status: 'Excellent',
      progress: 85.6
    },
    {
      id: 'admin-office-csu-main-cc',
      name: 'Administrative Offices',
      icon: Briefcase,
      totalSpaces: 22,
      assessedSpaces: 19,
      avgScore: 86.1,
      campus: 'CSU Main & CSU CC',
      description: 'Administrative workspace efficiency evaluation',
      status: 'Good',
      progress: 86.4
    },
    {
      id: 'prioritization-matrix',
      name: 'Prioritization Matrix',
      icon: BarChart3,
      totalSpaces: 14,
      assessedSpaces: 11,
      avgScore: 87.1,
      campus: 'Strategic Planning',
      description: 'Strategic planning and resource allocation',
      status: 'Good',
      progress: 78.6
    }
  ]
};

export const FacilitiesAssessmentOverview = React.memo(function FacilitiesAssessmentOverview({ 
  onProjectSelect, 
  userRole, 
  requireAuth, 
  onNavigate 
}: FacilitiesAssessmentOverviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const data = FACILITIES_ASSESSMENT_DATA;

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-600">Loading Facilities Assessment Overview...</span>
        </div>
      </div>
    );
  }

  const handleSubcategoryNavigate = (subcategoryId: string) => {
    onNavigate(subcategoryId);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl">
              <School className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-slate-900">Facilities Assessment</h1>
              <p className="text-slate-600 mt-1">Comprehensive Space Assessment & Evaluation Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-purple-600" />
              <span>Updated {data.summary.lastAssessmentCycle}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Q4 2024 Assessment Cycle</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-600" />
              <span>{data.summary.assessedSpaces} Facilities Assessed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Tab Navigation */}
          <TabsList className="bg-white border">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Summary Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Total Facilities</p>
                      <p className="text-slate-900">{data.summary.totalSpaces}</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <Building2 className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">Across all categories</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Assessed</p>
                      <p className="text-blue-600">{data.summary.assessedSpaces}</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <ClipboardCheck className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={(data.summary.assessedSpaces / data.summary.totalSpaces) * 100} className="h-2" />
                    <span className="text-xs text-slate-500">
                      {((data.summary.assessedSpaces / data.summary.totalSpaces) * 100).toFixed(1)}%
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Average Score</p>
                      <p className={getScoreColor(data.summary.avgAssessmentScore)}>
                        {data.summary.avgAssessmentScore}%
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <Target className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">Exceeds target benchmark</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Priority Actions</p>
                      <p className="text-amber-600">{data.summary.priorityActions}</p>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-lg">
                      <ClipboardCheck className="w-6 h-6 text-amber-600" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">Improvement initiatives</p>
                </CardContent>
              </Card>
            </div>

            {/* Facility Categories */}
            <div>
              <h2 className="text-slate-900 mb-4">Facility Categories</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.subcategories.map((category) => {
                  const IconComponent = category.icon;
                  
                  return (
                    <Card 
                      key={category.id} 
                      className="hover:shadow-md transition-all cursor-pointer"
                      onClick={() => handleSubcategoryNavigate(category.id)}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-100 rounded-lg">
                              <IconComponent className="w-6 h-6 text-slate-700" />
                            </div>
                            <div>
                              <CardTitle className="text-slate-900">{category.name}</CardTitle>
                              <CardDescription className="text-sm">{category.campus}</CardDescription>
                            </div>
                          </div>
                          <Badge variant="outline">
                            {category.avgScore}%
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-slate-600">{category.description}</p>
                        
                        <div className="grid grid-cols-3 gap-3">
                          <div className="p-3 bg-slate-50 rounded-lg text-center">
                            <p className="text-slate-900">{category.assessedSpaces}</p>
                            <p className="text-xs text-slate-600 mt-1">Assessed</p>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-lg text-center">
                            <p className="text-slate-900">{category.totalSpaces}</p>
                            <p className="text-xs text-slate-600 mt-1">Total</p>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-lg text-center">
                            <p className="text-slate-900">{category.status}</p>
                            <p className="text-xs text-slate-600 mt-1">Status</p>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-600">Completion Rate</span>
                            <span>{category.progress.toFixed(1)}%</span>
                          </div>
                          <Progress value={category.progress} className="h-2" />
                        </div>

                        <div className="flex items-center justify-end pt-2">
                          <Button variant="ghost" size="sm" className="text-slate-700">
                            View Details
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-slate-900">Assessment Analytics</CardTitle>
                <CardDescription>Detailed insights and trends across all facility categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-slate-500">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                  <p>Analytics and detailed reports coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
});
