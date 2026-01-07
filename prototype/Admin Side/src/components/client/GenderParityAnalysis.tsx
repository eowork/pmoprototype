import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  GraduationCap, 
  Users, 
  Briefcase, 
  Accessibility, 
  Globe,
  TrendingUp,
  Award,
  Target,
  BarChart3
} from 'lucide-react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import {
  mockStudentParityData,
  mockFacultyParityData,
  mockStaffParityData,
  mockPWDParityData,
  mockIndigenousParityData,
  mockGenderParityMetrics,
  generateRadarChartData
} from '../gad-parity-report/data/mockGenderParityData';

export function GenderParityAnalysis() {
  const [activeTab, setActiveTab] = useState('overview');

  const admissionRadarData = generateRadarChartData(mockStudentParityData, 'admission');
  const graduationRadarData = generateRadarChartData(mockStudentParityData, 'graduation');

  // Aggregate data for overview
  const totalPopulation = 
    mockStudentParityData.reduce((sum, s) => sum + s.totalAdmissions, 0) +
    mockFacultyParityData.reduce((sum, f) => sum + f.totalFaculty, 0) +
    mockStaffParityData.reduce((sum, s) => sum + s.totalStaff, 0);

  const categoryBreakdown = [
    { 
      category: 'Students', 
      total: mockStudentParityData.reduce((sum, s) => sum + s.totalAdmissions, 0),
      male: mockStudentParityData.reduce((sum, s) => sum + s.maleAdmissions, 0),
      female: mockStudentParityData.reduce((sum, s) => sum + s.femaleAdmissions, 0)
    },
    { 
      category: 'Faculty', 
      total: mockFacultyParityData.reduce((sum, f) => sum + f.totalFaculty, 0),
      male: mockFacultyParityData.reduce((sum, f) => sum + Math.round(f.totalFaculty * f.malePercentage / 100), 0),
      female: mockFacultyParityData.reduce((sum, f) => sum + Math.round(f.totalFaculty * f.femalePercentage / 100), 0)
    },
    { 
      category: 'Staff', 
      total: mockStaffParityData.reduce((sum, s) => sum + s.totalStaff, 0),
      male: mockStaffParityData.reduce((sum, s) => sum + Math.round(s.totalStaff * s.malePercentage / 100), 0),
      female: mockStaffParityData.reduce((sum, s) => sum + Math.round(s.totalStaff * s.femalePercentage / 100), 0)
    },
    { 
      category: 'PWD', 
      total: mockPWDParityData.reduce((sum, p) => sum + p.totalPWD, 0),
      male: mockPWDParityData.reduce((sum, p) => sum + p.maleCount, 0),
      female: mockPWDParityData.reduce((sum, p) => sum + p.femaleCount, 0)
    },
    { 
      category: 'Indigenous', 
      total: mockIndigenousParityData.reduce((sum, i) => sum + i.totalIndigenous, 0),
      male: mockIndigenousParityData.reduce((sum, i) => sum + i.maleCount, 0),
      female: mockIndigenousParityData.reduce((sum, i) => sum + i.femaleCount, 0)
    }
  ];

  const getStatusBadge = (balance: string) => {
    const variants: Record<string, string> = {
      'Good': 'bg-blue-100 text-blue-700 border-blue-200',
      'Balanced': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'Improving': 'bg-amber-100 text-amber-700 border-amber-200',
      'Excellent': 'bg-green-100 text-green-700 border-green-200'
    };
    return variants[balance] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-8 space-y-8">
        {/* Header - Formal and Minimal */}
        <div className="border-b border-gray-200 pb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg border border-emerald-200">
              <BarChart3 className="h-7 w-7 text-emerald-700" />
            </div>
            <div>
              <h1 className="text-gray-900">Gender Parity & Knowledge Management System</h1>
              <p className="text-gray-600 mt-2">
                Public transparency dashboard for gender equity monitoring and analysis
              </p>
            </div>
          </div>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-gray-200 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Users className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Total Population</p>
                  <p className="text-2xl text-gray-900">{totalPopulation.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Parity Index</p>
                  <p className="text-2xl text-gray-900">{mockGenderParityMetrics.admissionParityIndex.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Active Categories</p>
                  <p className="text-2xl text-gray-900">5</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">YoY Improvement</p>
                  <p className="text-2xl text-gray-900">+{mockGenderParityMetrics.yearOverYearImprovement.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs - Minimal Design */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 gap-1 bg-white p-1 rounded-lg border border-gray-200">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white rounded-md transition-all"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="students" 
              className="flex items-center justify-center gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white rounded-md transition-all"
            >
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline">Students</span>
            </TabsTrigger>
            <TabsTrigger 
              value="faculty" 
              className="flex items-center justify-center gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white rounded-md transition-all"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Faculty</span>
            </TabsTrigger>
            <TabsTrigger 
              value="staff" 
              className="flex items-center justify-center gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white rounded-md transition-all"
            >
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">Staff</span>
            </TabsTrigger>
            <TabsTrigger 
              value="pwd" 
              className="flex items-center justify-center gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white rounded-md transition-all"
            >
              <Accessibility className="h-4 w-4" />
              <span className="hidden sm:inline">PWD</span>
            </TabsTrigger>
            <TabsTrigger 
              value="indigenous" 
              className="flex items-center justify-center gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white rounded-md transition-all"
            >
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Indigenous</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6 space-y-6">
            <Card className="border-gray-200 bg-white">
              <CardHeader>
                <CardTitle className="text-gray-900">Gender Distribution Across Categories</CardTitle>
                <CardDescription className="text-gray-600">
                  Comprehensive breakdown of gender representation in all university populations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="category" 
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                      />
                      <YAxis 
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        label={{ 
                          value: 'Population Count', 
                          angle: -90, 
                          position: 'insideLeft',
                          style: { textAnchor: 'middle', fill: '#6b7280', fontSize: 12 }
                        }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Bar dataKey="male" fill="#3b82f6" name="Male" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="female" fill="#ec4899" name="Female" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Category Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {categoryBreakdown.map((cat) => (
                <Card key={cat.category} className="border-gray-200 bg-white">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-2">{cat.category}</div>
                      <div className="text-2xl text-gray-900 mb-3">{cat.total}</div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Male:</span>
                          <span className="text-blue-600">{cat.male}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Female:</span>
                          <span className="text-pink-600">{cat.female}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6 mt-6">
            <Card className="border-gray-200 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <GraduationCap className="h-5 w-5 text-emerald-600" />
                  Student Gender Parity Metrics
                </CardTitle>
                <CardDescription className="text-gray-600">Critical performance insights for student gender parity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm text-gray-700">Metric</th>
                        <th className="text-right py-3 px-4 text-sm text-gray-700">Value</th>
                        <th className="text-right py-3 px-4 text-sm text-gray-700">Target</th>
                        <th className="text-right py-3 px-4 text-sm text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="py-3 px-4">
                          <div>
                            <div className="text-gray-900">Admission Parity Index</div>
                            <div className="text-sm text-gray-600">Average gender balance across admissions</div>
                          </div>
                        </td>
                        <td className="text-right py-3 px-4 text-emerald-600">
                          {mockGenderParityMetrics.admissionParityIndex.toFixed(2)}
                        </td>
                        <td className="text-right py-3 px-4 text-gray-600">
                          ≥ {mockGenderParityMetrics.targetParityIndex.toFixed(2)}
                        </td>
                        <td className="text-right py-3 px-4">
                          <Badge className={getStatusBadge('Good')}>Good</Badge>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">
                          <div>
                            <div className="text-gray-900">Graduation Parity Index</div>
                            <div className="text-sm text-gray-600">Average gender balance across graduations</div>
                          </div>
                        </td>
                        <td className="text-right py-3 px-4 text-emerald-600">
                          {mockGenderParityMetrics.graduationParityIndex.toFixed(2)}
                        </td>
                        <td className="text-right py-3 px-4 text-gray-600">
                          ≥ {mockGenderParityMetrics.targetParityIndex.toFixed(2)}
                        </td>
                        <td className="text-right py-3 px-4">
                          <Badge className={getStatusBadge('Good')}>Good</Badge>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">
                          <div>
                            <div className="text-gray-900">Year-over-Year Improvement</div>
                            <div className="text-sm text-gray-600">Annual progress in gender parity</div>
                          </div>
                        </td>
                        <td className="text-right py-3 px-4 text-green-600">
                          +{mockGenderParityMetrics.yearOverYearImprovement.toFixed(1)}%
                        </td>
                        <td className="text-right py-3 px-4 text-gray-600">
                          ≥ 0%
                        </td>
                        <td className="text-right py-3 px-4">
                          <Badge className={getStatusBadge('Excellent')}>Excellent</Badge>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Radar Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-gray-200 bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    Admission Gender Parity
                  </CardTitle>
                  <CardDescription className="text-gray-600">Gender distribution in student admissions by program</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <RadarChart data={admissionRadarData}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis 
                        dataKey="program" 
                        tick={{ fill: '#374151', fontSize: 11 }}
                      />
                      <PolarRadiusAxis 
                        angle={90} 
                        domain={[0, 100]}
                        tick={{ fill: '#6b7280', fontSize: 10 }}
                      />
                      <Radar
                        name="Female %"
                        dataKey="femalePercentage"
                        stroke="#ec4899"
                        fill="#ec4899"
                        fillOpacity={0.5}
                      />
                      <Radar
                        name="Male %"
                        dataKey="malePercentage"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.3}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-gray-200 bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    Graduation Gender Parity
                  </CardTitle>
                  <CardDescription className="text-gray-600">Gender distribution in graduation rates by program</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <RadarChart data={graduationRadarData}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis 
                        dataKey="program" 
                        tick={{ fill: '#374151', fontSize: 11 }}
                      />
                      <PolarRadiusAxis 
                        angle={90} 
                        domain={[0, 100]}
                        tick={{ fill: '#6b7280', fontSize: 10 }}
                      />
                      <Radar
                        name="Female %"
                        dataKey="femalePercentage"
                        stroke="#ec4899"
                        fill="#ec4899"
                        fillOpacity={0.5}
                      />
                      <Radar
                        name="Male %"
                        dataKey="malePercentage"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.3}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Faculty Tab */}
          <TabsContent value="faculty" className="space-y-6 mt-6">
            <Card className="border-gray-200 bg-white">
              <CardHeader>
                <CardTitle className="text-gray-900">Faculty Gender Distribution</CardTitle>
                <CardDescription className="text-gray-600">Complete gender representation across all colleges and schools</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm text-gray-700">College / School</th>
                        <th className="text-center py-3 px-4 text-sm text-gray-700">Category</th>
                        <th className="text-right py-3 px-4 text-sm text-gray-700">Total Faculty</th>
                        <th className="text-right py-3 px-4 text-sm text-gray-700">Male %</th>
                        <th className="text-right py-3 px-4 text-sm text-gray-700">Female %</th>
                        <th className="text-right py-3 px-4 text-sm text-gray-700">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {mockFacultyParityData.map((faculty) => (
                        <tr key={faculty.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 text-gray-900">
                            {faculty.college}
                          </td>
                          <td className="text-center py-3 px-4">
                            <Badge 
                              className={faculty.category === 'undergraduate' 
                                ? 'bg-blue-100 text-blue-700 border-blue-200' 
                                : 'bg-green-100 text-green-700 border-green-200'
                              }
                            >
                              {faculty.category === 'undergraduate' ? 'Undergraduate' : 'Professional'}
                            </Badge>
                          </td>
                          <td className="text-right py-3 px-4 text-gray-900">{faculty.totalFaculty}</td>
                          <td className="text-right py-3 px-4 text-blue-600">
                            {faculty.malePercentage}%
                          </td>
                          <td className="text-right py-3 px-4 text-pink-600">
                            {faculty.femalePercentage}%
                          </td>
                          <td className="text-right py-3 px-4">
                            <Badge className={getStatusBadge(faculty.genderBalance)}>
                              {faculty.genderBalance}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Staff Tab */}
          <TabsContent value="staff" className="space-y-6 mt-6">
            <Card className="border-gray-200 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Briefcase className="h-5 w-5 text-emerald-600" />
                  Staff Gender Distribution
                </CardTitle>
                <CardDescription className="text-gray-600">Gender parity across university staff positions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm text-gray-700">Department</th>
                        <th className="text-left py-3 px-4 text-sm text-gray-700">Position</th>
                        <th className="text-right py-3 px-4 text-sm text-gray-700">Total</th>
                        <th className="text-right py-3 px-4 text-sm text-gray-700">Male %</th>
                        <th className="text-right py-3 px-4 text-sm text-gray-700">Female %</th>
                        <th className="text-right py-3 px-4 text-sm text-gray-700">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {mockStaffParityData.map((staff) => (
                        <tr key={staff.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 text-gray-900">{staff.department}</td>
                          <td className="py-3 px-4 text-gray-700">{staff.position}</td>
                          <td className="text-right py-3 px-4 text-gray-900">{staff.totalStaff}</td>
                          <td className="text-right py-3 px-4 text-blue-600">
                            {staff.malePercentage}%
                          </td>
                          <td className="text-right py-3 px-4 text-pink-600">
                            {staff.femalePercentage}%
                          </td>
                          <td className="text-right py-3 px-4">
                            <Badge className={getStatusBadge(staff.genderBalance)}>
                              {staff.genderBalance}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PWD Tab */}
          <TabsContent value="pwd" className="space-y-6 mt-6">
            <Card className="border-gray-200 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Accessibility className="h-5 w-5 text-emerald-600" />
                  Persons with Disability (PWD) Gender Distribution
                </CardTitle>
                <CardDescription className="text-gray-600">Gender parity for PWD across university population</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {mockPWDParityData.map((pwd) => (
                    <div key={pwd.id} className="border border-gray-200 rounded-lg p-6 bg-white hover:shadow-sm transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-gray-900 capitalize">{pwd.category}</h3>
                          <p className="text-sm text-gray-600">{pwd.college || pwd.department}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl text-gray-900">{pwd.totalPWD}</div>
                          <div className="text-sm text-gray-600">Total PWD</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-blue-50 rounded-lg p-3">
                          <div className="text-sm text-gray-600">Male</div>
                          <div className="text-xl text-blue-600">
                            {pwd.malePercentage}%
                          </div>
                          <div className="text-xs text-gray-600">({pwd.maleCount} individuals)</div>
                        </div>
                        <div className="bg-pink-50 rounded-lg p-3">
                          <div className="text-sm text-gray-600">Female</div>
                          <div className="text-xl text-pink-600">
                            {pwd.femalePercentage}%
                          </div>
                          <div className="text-xs text-gray-600">({pwd.femaleCount} individuals)</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <div className="text-sm text-gray-700 mb-1">Disability Types</div>
                          <div className="flex flex-wrap gap-2">
                            {pwd.disabilityTypes.map((type, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs border-gray-300">
                                {type}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-700 mb-1">Support Provided</div>
                          <div className="flex flex-wrap gap-2">
                            {pwd.supportProvided.map((support, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                {support}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Indigenous Tab */}
          <TabsContent value="indigenous" className="space-y-6 mt-6">
            <Card className="border-gray-200 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Globe className="h-5 w-5 text-emerald-600" />
                  Indigenous People Gender Distribution
                </CardTitle>
                <CardDescription className="text-gray-600">Gender parity for indigenous communities in the university</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {mockIndigenousParityData.map((indigenous) => (
                    <div key={indigenous.id} className="border border-gray-200 rounded-lg p-6 bg-white hover:shadow-sm transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-gray-900">{indigenous.tribe} Tribe</h3>
                          <p className="text-sm text-gray-600 capitalize">{indigenous.category} - {indigenous.college || indigenous.department}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl text-gray-900">{indigenous.totalIndigenous}</div>
                          <div className="text-sm text-gray-600">Total Members</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-blue-50 rounded-lg p-3">
                          <div className="text-sm text-gray-600">Male</div>
                          <div className="text-xl text-blue-600">
                            {indigenous.malePercentage}%
                          </div>
                          <div className="text-xs text-gray-600">({indigenous.maleCount} individuals)</div>
                        </div>
                        <div className="bg-pink-50 rounded-lg p-3">
                          <div className="text-sm text-gray-600">Female</div>
                          <div className="text-xl text-pink-600">
                            {indigenous.femalePercentage}%
                          </div>
                          <div className="text-xs text-gray-600">({indigenous.femaleCount} individuals)</div>
                        </div>
                      </div>
                      {(indigenous.scholarshipRecipients || indigenous.culturalProgramsParticipation) && (
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                          {indigenous.scholarshipRecipients && (
                            <div>
                              <div className="text-sm text-gray-600">Scholarship Recipients</div>
                              <div className="text-lg text-green-600">
                                {indigenous.scholarshipRecipients}
                              </div>
                            </div>
                          )}
                          {indigenous.culturalProgramsParticipation && (
                            <div>
                              <div className="text-sm text-gray-600">Cultural Program Participation</div>
                              <div className="text-lg text-amber-600">
                                {indigenous.culturalProgramsParticipation}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Information Footer */}
        <Card className="border-gray-200 bg-gradient-to-br from-emerald-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <BarChart3 className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-gray-900 mb-2">About This Dashboard</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  This public transparency dashboard provides comprehensive gender parity analysis across all Caraga State University 
                  populations. The data reflects our institutional commitment to equity, inclusion, and continuous improvement in 
                  gender balance across academic programs, faculty composition, staff positions, and support for underrepresented groups 
                  including persons with disabilities and indigenous communities.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
