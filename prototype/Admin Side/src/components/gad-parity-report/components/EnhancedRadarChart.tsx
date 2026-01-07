import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, Legend } from 'recharts';
import { CollegeData } from '../types';

interface EnhancedRadarChartProps {
  data: CollegeData[];
  selectedYear: number;
  title?: string;
  description?: string;
}

export function EnhancedRadarChart({
  data,
  selectedYear,
  title = "Gender Parity Radar Analysis",
  description = "Comprehensive view showing parity scores, male and female distribution across colleges"
}: EnhancedRadarChartProps) {
  // Prepare radar chart data with enhanced information
  const radarData = data.map(college => ({
    college: college.college.split(',')[0].trim(), // Shortened name for better display
    parityScore: Number(college.parityScore.toFixed(2)),
    male: college.male,
    female: college.female,
    totalStudents: college.male + college.female,
    target: 1.0,
    fullName: college.college,
    status: college.status
  }));

  // Custom tooltip with enhanced information
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0]?.payload;
      return (
        <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-lg min-w-[280px]">
          <h4 className="font-semibold text-slate-900 mb-3 text-sm">{data.fullName}</h4>
          <div className="space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <span className="text-blue-600 font-medium">Male:</span>
                <span className="font-semibold text-slate-900">{data.male.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-pink-600 font-medium">Female:</span>
                <span className="font-semibold text-slate-900">{data.female.toLocaleString()}</span>
              </div>
            </div>
            <div className="pt-1 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Total Students:</span>
                <span className="font-semibold text-slate-900">{data.totalStudents.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-purple-600 font-medium">Parity Score:</span>
                <span className="font-bold text-purple-700">{data.parityScore}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Status:</span>
                <Badge className={`text-xs ${getStatusColor(data.status)} border`}>
                  {data.status}
                </Badge>
              </div>
            </div>
            <div className="pt-1 border-t border-slate-200 text-xs text-slate-500">
              <div>Target Parity Score: 1.0 (Equal representation)</div>
              <div>
                Performance: {data.parityScore >= 1.0 ? 
                  (data.parityScore > 1.5 ? 'Significant female advantage' : 'Female advantage') : 
                  'Male advantage'
                }
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Get status color for badges
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Beyond Parity': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Full Parity': return 'bg-green-100 text-green-800 border-green-200';
      case 'Near Full Parity': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Moderate Parity': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Partial Parity': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Significant Gap Remains': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Calculate summary statistics
  const averageParityScore = data.length > 0 ? 
    (data.reduce((sum, college) => sum + college.parityScore, 0) / data.length) : 0;
  const totalStudents = data.reduce((sum, college) => sum + college.male + college.female, 0);
  const totalMale = data.reduce((sum, college) => sum + college.male, 0);
  const totalFemale = data.reduce((sum, college) => sum + college.female, 0);

  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader>
        <div className="space-y-4">
          <div>
            <CardTitle className="text-xl font-semibold text-slate-900 mb-2">{title}</CardTitle>
            <CardDescription className="text-slate-600">{description}</CardDescription>
          </div>
          
          {/* Summary Statistics */}
          <div className="flex flex-wrap gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-slate-600">Average Parity Score:</span>
              <Badge variant="outline" className="font-semibold text-purple-700 border-purple-300">
                {averageParityScore.toFixed(2)}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-600">Total Students:</span>
              <Badge variant="outline" className="font-semibold">
                {totalStudents.toLocaleString()}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-600">Year:</span>
              <Badge variant="outline" className="font-semibold text-blue-700 border-blue-300">
                {selectedYear}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Radar Chart - Left Side - Increased Size */}
          <div className="flex-1 min-h-[500px]">
            <div className="h-[500px] bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} margin={{ top: 30, right: 30, bottom: 30, left: 30 }}>
                  <PolarGrid 
                    stroke="#e2e8f0" 
                    strokeWidth={1}
                    radialLines={true}
                  />
                  <PolarAngleAxis 
                    dataKey="college" 
                    tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
                    className="font-medium"
                  />
                  <PolarRadiusAxis 
                    domain={[0, Math.max(4, Math.max(...radarData.map(d => d.parityScore)) + 0.5)]} 
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    angle={0}
                    orientation="middle"
                  />
                  <Radar
                    name="Parity Score"
                    dataKey="parityScore"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.25}
                    strokeWidth={3}
                    dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                  />
                  <Radar
                    name="Target (1.0)"
                    dataKey="target"
                    stroke="#10b981"
                    fill="transparent"
                    strokeWidth={2}
                    strokeDasharray="8 4"
                    dot={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Legend - Right Side */}
          <div className="w-full lg:w-80 xl:w-96">
            <div className="p-6 bg-white rounded-lg border-2 border-slate-200 shadow-sm h-[500px] overflow-y-auto">
              <h4 className="font-semibold text-slate-900 mb-4 text-lg">Chart Legend & Analysis</h4>
              
              {/* Legend Items */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-1 bg-purple-600 rounded"></div>
                  <span className="text-sm text-slate-700 font-medium">Parity Score (Actual)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-1 bg-green-500 border-dashed border-green-500" style={{ borderStyle: 'dashed', borderWidth: '1px 0' }}></div>
                  <span className="text-sm text-slate-700 font-medium">Target Score (1.0)</span>
                </div>
              </div>

              {/* Parity Scale */}
              <div className="mb-6">
                <h5 className="font-medium text-slate-800 mb-3">Parity Scale Interpretation</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center p-2 bg-red-50 rounded border-l-4 border-red-400">
                    <span className="font-medium">0.0 - 0.5</span>
                    <span className="text-red-700 font-semibold">Significant Gap</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-orange-50 rounded border-l-4 border-orange-400">
                    <span className="font-medium">0.5 - 0.9</span>
                    <span className="text-orange-700 font-semibold">Moderate Gap</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-green-50 rounded border-l-4 border-green-400">
                    <span className="font-medium">0.9 - 1.1</span>
                    <span className="text-green-700 font-semibold">Near Parity</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-purple-50 rounded border-l-4 border-purple-400">
                    <span className="font-medium">1.1+</span>
                    <span className="text-purple-700 font-semibold">Beyond Parity</span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="border-t border-slate-200 pt-4">
                <h5 className="font-medium text-slate-800 mb-3">Quick Statistics</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Colleges Analyzed:</span>
                    <span className="font-semibold text-slate-900">{data.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">At/Above Parity:</span>
                    <span className="font-semibold text-green-700">{data.filter(c => c.parityScore >= 1.0).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Below Parity:</span>
                    <span className="font-semibold text-red-700">{data.filter(c => c.parityScore < 1.0).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Average Score:</span>
                    <span className="font-semibold text-purple-700">{averageParityScore.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Help Text */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-800">
                  💡 <strong>Tip:</strong> Hover over chart points for detailed college information. 
                  A parity score of 1.0 indicates equal gender representation.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Analysis */}
        <div className="mt-4 p-4 bg-white border border-slate-200 rounded-lg">
          <h4 className="font-semibold text-slate-900 mb-3">Quick Analysis</h4>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-slate-600">Gender Distribution:</span>
              <div className="mt-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Male: {totalMale.toLocaleString()} ({((totalMale / totalStudents) * 100).toFixed(1)}%)</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                  <span>Female: {totalFemale.toLocaleString()} ({((totalFemale / totalStudents) * 100).toFixed(1)}%)</span>
                </div>
              </div>
            </div>
            <div>
              <span className="text-slate-600">Performance Status:</span>
              <div className="mt-1">
                <div>{data.filter(c => c.parityScore >= 1.0).length} of {data.length} colleges</div>
                <div className="text-xs text-slate-500">have achieved or exceeded parity</div>
              </div>
            </div>
            <div>
              <span className="text-slate-600">Range Analysis:</span>
              <div className="mt-1">
                <div>Highest: {Math.max(...data.map(c => c.parityScore)).toFixed(2)}</div>
                <div>Lowest: {Math.min(...data.map(c => c.parityScore)).toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}