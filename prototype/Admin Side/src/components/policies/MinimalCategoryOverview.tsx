import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { 
  FileText, FileSignature, Calendar, AlertTriangle, CheckCircle, 
  TrendingUp, Target, Users, ArrowRight, Clock, BarChart3, 
  RefreshCw, Download, Eye, Plus, Filter, Activity, PieChart
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, Tooltip, Legend, ComposedChart } from 'recharts';

interface MinimalCategoryOverviewProps {
  onProjectSelect: (project: any) => void;
  userRole: string;
  requireAuth: (action: string) => boolean;
  onNavigate: (page: string) => void;
}

// Simplified data focused on validity and outcomes
const SIMPLIFIED_POLICIES_DATA = {
  summary: {
    totalDocuments: 9,
    activeDocuments: 7,
    expiringSoon: 2,
    avgEffectiveness: 87,
    totalBeneficiaries: 2850
  },
  categoryBreakdown: [
    {
      id: 'memorandum-of-agreements',
      name: 'Memorandum of Agreements',
      totalDocs: 6,
      activeDocs: 5,
      expiringSoon: 1,
      avgEffectiveness: 85,
      totalValue: '₱46.5M',
      description: 'Partnership agreements with defined financial outcomes',
      validityHighlights: ['5 Active Partnerships', '1 Renewal Due', '92% Average Success Rate']
    },
    {
      id: 'memorandum-of-understanding',
      name: 'Memorandum of Understanding',
      totalDocs: 3,
      activeDocs: 2,
      expiringSoon: 1,
      avgEffectiveness: 91,
      scope: 'Regional-National',
      description: 'Collaboration frameworks for shared objectives',
      validityHighlights: ['2 Active Collaborations', '1 Assessment Required', '89% Outcome Achievement']
    }
  ],
  recentValidityAlerts: [
    {
      id: 'alert-001',
      title: 'Community Extension Services Partnership',
      type: 'MOA',
      daysRemaining: 197,
      action: 'Renewal Assessment Required',
      priority: 'High',
      impact: '320 beneficiaries affected'
    },
    {
      id: 'alert-002',
      title: 'Technology Transfer & Innovation MOU',
      type: 'MOU',
      daysRemaining: 350,
      action: 'Performance Review Due',
      priority: 'Medium',
      impact: 'National scope collaboration'
    }
  ],
  effectivenessMetrics: {
    outcomes: {
      achieved: 85,
      onTrack: 12,
      atRisk: 3
    },
    renewals: {
      onSchedule: 7,
      assessmentDue: 2,
      overdue: 0
    },
    // Time-based analytics
    monthlyTrends: [
      { month: 'Jan', agreements: 6, effectiveness: 88 },
      { month: 'Feb', agreements: 7, effectiveness: 85 },
      { month: 'Mar', agreements: 8, effectiveness: 87 },
      { month: 'Apr', agreements: 9, effectiveness: 86 },
      { month: 'May', agreements: 9, effectiveness: 89 },
      { month: 'Jun', agreements: 9, effectiveness: 87 }
    ],
    yearlyComparison: [
      { year: '2022', moa: 4, mou: 2, avgEffectiveness: 82 },
      { year: '2023', moa: 5, mou: 3, avgEffectiveness: 85 },
      { year: '2024', moa: 6, mou: 3, avgEffectiveness: 87 }
    ]
  }
};

export function MinimalCategoryOverview({ 
  onProjectSelect, 
  userRole, 
  requireAuth, 
  onNavigate 
}: MinimalCategoryOverviewProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [timeFilter, setTimeFilter] = useState('all');

  const data = SIMPLIFIED_POLICIES_DATA;

  const handleSubcategoryNavigate = (subcategory: string) => {
    onNavigate(subcategory);
  };

  const handleOverviewNavigate = () => {
    onNavigate('policies-overview');
  };

  const handleRefreshData = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      toast.success('Policy data refreshed');
    }, 1500);
  };

  const handleAddPolicy = () => {
    if (!requireAuth('add policy document')) return;
    toast.info('Policy creation form will open...');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-50 border-red-200';
      case 'Medium': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'Low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Clean Header */}
      <div className="border-b bg-gradient-to-r from-slate-50 to-slate-100">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-800 mb-2">Policies Management</h1>
              <p className="text-slate-600">
                Monitor agreement validity, track outcomes, and manage institutional partnerships
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-sm">
                <CheckCircle className="w-4 h-4 mr-1" />
                {data.summary.activeDocuments} Active
              </Badge>
              <Badge variant="outline" className={data.summary.expiringSoon > 0 ? 'border-amber-300 text-amber-700' : ''}>
                <AlertTriangle className="w-4 h-4 mr-1" />
                {data.summary.expiringSoon} Expiring
              </Badge>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Time filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="current-year">Current Year</SelectItem>
                  <SelectItem value="last-6-months">Last 6 Months</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={handleRefreshData} disabled={refreshing}>
                <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Key Metrics - Focused on Validity & Effectiveness */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card 
            className="border-l-4 border-l-blue-500 cursor-pointer hover:shadow-md transition-shadow" 
            onClick={handleOverviewNavigate}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Agreements</p>
                <p className="text-3xl font-semibold text-slate-800">{data.summary.totalDocuments}</p>
                <p className="text-xs text-slate-500 mt-1">Click for detailed overview</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Avg Effectiveness</p>
                <p className="text-3xl font-semibold text-slate-800">{data.summary.avgEffectiveness}%</p>
                <p className="text-xs text-slate-500 mt-1">Outcome achievement rate</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Beneficiaries</p>
                <p className="text-3xl font-semibold text-slate-800">{data.summary.totalBeneficiaries.toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-1">Direct impact reach</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Renewal Required</p>
                <p className="text-3xl font-semibold text-slate-800">{data.summary.expiringSoon}</p>
                <p className="text-xs text-slate-500 mt-1">Within 6 months</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* MOA and MOU Document Categories - Primary Management Interface (Positioned Above Data Visuals) */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-1 w-8 bg-blue-600 rounded"></div>
            <h2 className="text-lg font-semibold text-slate-800">Agreement Categories</h2>
            <div className="h-1 flex-1 bg-slate-200 rounded"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {data.categoryBreakdown.map((category) => (
            <Card key={category.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      {category.id === 'memorandum-of-agreements' ? (
                        <FileText className="w-5 h-5 text-blue-600" />
                      ) : (
                        <FileSignature className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg text-slate-800">{category.name}</CardTitle>
                      <CardDescription className="text-sm text-slate-600">{category.description}</CardDescription>
                    </div>
                  </div>
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={() => handleSubcategoryNavigate(category.id)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Manage <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Validity Metrics - Enhanced styling */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg border border-green-100">
                    <p className="text-lg font-semibold text-green-700">{category.activeDocs}</p>
                    <p className="text-xs text-green-600">Active</p>
                  </div>
                  <div className="text-center p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <p className="text-lg font-semibold text-amber-700">{category.expiringSoon}</p>
                    <p className="text-xs text-amber-600">Expiring</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-lg font-semibold text-blue-700">{category.avgEffectiveness}%</p>
                    <p className="text-xs text-blue-600">Effective</p>
                  </div>
                </div>

                {/* Key Highlights - Enhanced styling */}
                <div className="space-y-2 mb-4">
                  <h4 className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-500" />
                    Key Outcomes & Validity Status
                  </h4>
                  {category.validityHighlights.map((highlight, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-2 rounded">
                      <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>

                {/* Value/Scope Display - Enhanced */}
                <div className="pt-3 border-t border-slate-200">
                  <div className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-slate-50 p-3 rounded-lg">
                    <span className="text-sm font-medium text-slate-700">
                      {category.id === 'memorandum-of-agreements' ? 'Total Financial Value' : 'Collaboration Scope'}
                    </span>
                    <span className="text-sm font-semibold text-blue-700">
                      {category.totalValue || category.scope}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Data Visualization & Analytics Section - Supporting Analytics (Positioned Below MOA/MOU Containers) */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-1 w-8 bg-slate-400 rounded"></div>
            <h2 className="text-lg font-semibold text-slate-800">Performance Analytics</h2>
            <div className="h-1 flex-1 bg-slate-200 rounded"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Agreements Trend Over Time */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Agreement Growth & Effectiveness
              </CardTitle>
              <CardDescription>Monthly trends showing agreement count and effectiveness</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={data.monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                    <YAxis yAxisId="left" stroke="#64748b" fontSize={12} />
                    <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#f8fafc', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Bar 
                      yAxisId="left"
                      dataKey="agreements" 
                      fill="#3b82f6" 
                      name="Total Agreements"
                      radius={[4, 4, 0, 0]}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="effectiveness" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      name="Effectiveness %"
                      dot={{ fill: '#10b981', strokeWidth: 2 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Year-over-Year Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                Historical Performance Comparison
              </CardTitle>
              <CardDescription>Year-over-year MOA/MOU growth and effectiveness</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.yearlyComparison}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="year" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#f8fafc', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="moa" stackId="a" fill="#3b82f6" name="MOA Count" />
                    <Bar dataKey="mou" stackId="a" fill="#10b981" name="MOU Count" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Validity Alerts - Enhanced with Time Context */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Validity Alerts & Time-Critical Actions
            </CardTitle>
            <CardDescription>Agreements requiring immediate attention based on time sensitivity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentValidityAlerts.map((alert) => (
                <div key={alert.id} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-slate-800">{alert.title}</h4>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs ${getPriorityColor(alert.priority)}`}>
                        {alert.priority}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {alert.type}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500">Days Remaining:</span>
                      <span className="ml-2 font-medium text-slate-700">{alert.daysRemaining}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Action Required:</span>
                      <span className="ml-2 font-medium text-slate-700">{alert.action}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Impact:</span>
                      <span className="ml-2 font-medium text-slate-700">{alert.impact}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-slate-800">Quick Actions</CardTitle>
            <CardDescription>Common policy management tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={handleOverviewNavigate}
              >
                <BarChart3 className="w-6 h-6 text-blue-600" />
                <span>View Overview</span>
                <span className="text-xs text-slate-500">Latest MOA & MOU</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => handleSubcategoryNavigate('memorandum-of-agreements')}
              >
                <FileText className="w-6 h-6 text-green-600" />
                <span>Manage MOA</span>
                <span className="text-xs text-slate-500">{data.categoryBreakdown[0].totalDocs} documents</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => handleSubcategoryNavigate('memorandum-of-understanding')}
              >
                <FileSignature className="w-6 h-6 text-purple-600" />
                <span>Manage MOU</span>
                <span className="text-xs text-slate-500">{data.categoryBreakdown[1].totalDocs} documents</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={handleAddPolicy}
              >
                <Plus className="w-6 h-6 text-indigo-600" />
                <span>Add Document</span>
                <span className="text-xs text-slate-500">Create new policy</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}