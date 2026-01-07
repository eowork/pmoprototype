import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { ChartBar, TrendingUp, BarChart3, MousePointer, Activity, Grid3X3, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { Progress } from '../../ui/progress';
import { QUARTERS, formatPercentage, formatVariance, getVarianceColor, calculateAverage, calculateVariance } from '../types/QuarterlyAssessment';
import { getLatestQuarterData } from '../utils/quarterlyAssessmentData';

interface AnalyticsDashboardProps {
  assessmentData: any[];
  FIXED_OUTCOME_INDICATORS: any;
  overallStats: {
    onTarget: number;
    belowTarget: number;
  };
  onAnalyticsCardClick?: (particulars: string) => void;
}

export function AnalyticsDashboard({ assessmentData, FIXED_OUTCOME_INDICATORS, overallStats, onAnalyticsCardClick }: AnalyticsDashboardProps) {
  // Create enhanced quarterly trends data with variance tracking for each particular
  const quarterlyTrendsWithVariance = assessmentData.map(indicator => ({
    particular: FIXED_OUTCOME_INDICATORS[indicator.id.toUpperCase().replace(/-/g, '_') as keyof typeof FIXED_OUTCOME_INDICATORS]?.shortName || indicator.particular,
    quarters: QUARTERS.map(quarter => {
      const target = indicator.physicalTarget[quarter.id as keyof typeof indicator.physicalTarget];
      const actual = indicator.physicalAccomplishment[quarter.id as keyof typeof indicator.physicalAccomplishment];
      const variance = actual !== null && target !== null ? actual - target : null;
      
      return {
        quarter: quarter.shortLabel,
        target: target || 0,
        actual: actual || 0,
        variance: variance,
        variancePercentage: target !== null && target > 0 && variance !== null ? ((variance / target) * 100) : 0
      };
    })
  }));

  // Create comprehensive chart data from collected data
  const quarterlyTrendsData = QUARTERS.map(quarter => {
    const quarterData = {
      quarter: quarter.shortLabel,
      targets: 0,
      achievements: 0,
      totalVariance: 0,
      count: 0
    };

    assessmentData.forEach(indicator => {
      const target = indicator.physicalTarget[quarter.id as keyof typeof indicator.physicalTarget];
      const actual = indicator.physicalAccomplishment[quarter.id as keyof typeof indicator.physicalAccomplishment];
      
      if (target !== null) {
        quarterData.targets += target;
        quarterData.count++;
      }
      if (actual !== null) {
        quarterData.achievements += actual;
        if (target !== null) {
          quarterData.totalVariance += (actual - target);
        }
      }
    });

    if (quarterData.count > 0) {
      quarterData.targets = quarterData.targets / quarterData.count;
      quarterData.achievements = quarterData.achievements / quarterData.count;
      quarterData.totalVariance = quarterData.totalVariance / quarterData.count;
    }

    return quarterData;
  });

  // Enhanced indicator comparison data for stacked charts
  const indicatorComparisonData = assessmentData.map(indicator => ({
    name: FIXED_OUTCOME_INDICATORS[indicator.id.toUpperCase().replace(/-/g, '_') as keyof typeof FIXED_OUTCOME_INDICATORS]?.shortName || indicator.particular.substring(0, 30) + '...',
    target: calculateAverage(indicator.physicalTarget),
    actual: calculateAverage(indicator.physicalAccomplishment),
    variance: indicator.variance,
    gap: Math.max(0, calculateAverage(indicator.physicalTarget) - calculateAverage(indicator.physicalAccomplishment))
  }));

  // Enhanced heatmap data for performance gaps analysis with proper empty field handling
  const heatmapData = assessmentData.map(indicator => {
    const particular = FIXED_OUTCOME_INDICATORS[indicator.id.toUpperCase().replace(/-/g, '_') as keyof typeof FIXED_OUTCOME_INDICATORS]?.shortName || indicator.particular;
    
    const calculateQuarterPercentage = (actual: number | null, target: number | null) => {
      if (actual === null || target === null || target === 0) return null;
      return Math.max(0, Math.min(100, (actual / target) * 100));
    };
    
    return {
      particular: particular.substring(0, 25) + (particular.length > 25 ? '...' : ''),
      Q1: calculateQuarterPercentage(indicator.physicalAccomplishment.quarter1, indicator.physicalTarget.quarter1),
      Q2: calculateQuarterPercentage(indicator.physicalAccomplishment.quarter2, indicator.physicalTarget.quarter2),
      Q3: calculateQuarterPercentage(indicator.physicalAccomplishment.quarter3, indicator.physicalTarget.quarter3),
      Q4: calculateQuarterPercentage(indicator.physicalAccomplishment.quarter4, indicator.physicalTarget.quarter4)
    };
  });

  // Radar chart data for comprehensive comparison
  const radarData = QUARTERS.map(quarter => {
    const avgTarget = assessmentData.reduce((sum, indicator) => {
      const target = indicator.physicalTarget[quarter.id as keyof typeof indicator.physicalTarget];
      return sum + (target || 0);
    }, 0) / assessmentData.length;
    
    const avgActual = assessmentData.reduce((sum, indicator) => {
      const actual = indicator.physicalAccomplishment[quarter.id as keyof typeof indicator.physicalAccomplishment];
      return sum + (actual || 0);
    }, 0) / assessmentData.length;

    return {
      quarter: quarter.label,
      target: avgTarget,
      actual: avgActual,
      performance: avgTarget > 0 ? (avgActual / avgTarget) * 100 : 0
    };
  });

  const handleAnalyticsCardClick = (particular: string) => {
    if (onAnalyticsCardClick) {
      onAnalyticsCardClick(particular);
    }
  };

  // Enhanced color schemes for visualizations with null handling
  const getHeatmapColor = (value: number | null) => {
    if (value === null) return '#f3f4f6'; // Light gray for empty fields
    if (value >= 90) return '#10b981'; // Green
    if (value >= 75) return '#f59e0b'; // Yellow
    if (value >= 50) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  const getHeatmapTextColor = (value: number | null) => {
    if (value === null) return '#6b7280'; // Gray text for empty fields
    return '#ffffff'; // White text for filled cells
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Performance Overview with Clickable Cards */}
      <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <ChartBar className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Performance Analytics Overview</h2>
          <p className="text-sm text-slate-600 ml-auto">Click any card to view detailed Target vs Actual data</p>
        </div>
        
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${assessmentData.length > 3 ? '4' : '3'} gap-6`}>
          {assessmentData.map((indicator) => {
            const avgTarget = calculateAverage(indicator.physicalTarget);
            const avgActual = calculateAverage(indicator.physicalAccomplishment);
            const variance = calculateVariance(avgTarget, avgActual);
            const latestData = getLatestQuarterData(indicator);
            const particularsName = FIXED_OUTCOME_INDICATORS[indicator.id.toUpperCase().replace(/-/g, '_') as keyof typeof FIXED_OUTCOME_INDICATORS]?.shortName || indicator.particular;
            
            return (
              <div 
                key={indicator.id} 
                className="bg-white p-4 rounded-lg border border-slate-300 shadow-sm hover:shadow-lg hover:border-blue-400 transition-all cursor-pointer group"
                onClick={() => handleAnalyticsCardClick(particularsName)}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-sm font-medium text-gray-900 leading-tight min-h-[40px]">
                    {particularsName}
                  </h3>
                  <MousePointer className="h-4 w-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Target</span>
                    <span className="font-semibold text-blue-600">{formatPercentage(avgTarget)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Actual</span>
                    <span className="font-semibold text-gray-900">{avgActual > 0 ? formatPercentage(avgActual) : 'No Data'}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Variance</span>
                    <span className={`font-semibold ${getVarianceColor(variance)}`}>
                      {avgActual > 0 ? formatVariance(variance) : 'No Data'}
                    </span>
                  </div>
                  
                  <div className="pt-2">
                    <Progress value={avgActual} className="h-2" />
                  </div>
                  
                  {latestData && (
                    <div className="pt-2 border-t border-gray-200">
                      <div className="text-xs text-gray-500">
                        Latest: {latestData.quarter.toUpperCase()} • {formatPercentage(latestData.actual)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Enhanced Data Visualization with Alternative Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enhanced Quarterly Performance Trends Chart with Clear Labels */}
        <Card className="bg-white border border-slate-300 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Quarterly Performance Trends
            </CardTitle>
            <CardDescription>
              Target vs Actual performance tracking with variance analysis across all {assessmentData.length} indicators
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={quarterlyTrendsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="quarter" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'totalVariance') {
                        return [`${Number(value).toFixed(2)}%`, 'Avg Variance'];
                      }
                      return [`${Number(value).toFixed(1)}%`, name === 'targets' ? 'Avg Target' : 'Avg Achievement'];
                    }} 
                    labelStyle={{ color: '#374151' }}
                    contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #d1d5db' }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="line"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="targets" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    strokeDasharray="5,5"
                    name="Average Target"
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="achievements" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    name="Average Achievement"
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="totalVariance" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    name="Average Variance"
                    dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
              <strong>Legend:</strong> This chart visualizes the quarterly performance trends across all outcome indicators. 
              Dashed line shows targets, solid green line shows achievements, and orange line shows variance patterns.
            </div>
          </CardContent>
        </Card>

        {/* Target vs Actual Hub Card */}
        <Card 
          className="bg-white border border-slate-300 shadow-sm hover:shadow-md hover:border-green-400 transition-all cursor-pointer group"
          onClick={() => handleAnalyticsCardClick('all')}
        >
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Target vs Actual Hub
              <MousePointer className="h-4 w-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
            </CardTitle>
            <CardDescription>
              Navigate directly to detailed Target vs Actual data collection and management
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">Quick Access Features</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• View standardized outcome indicators</li>
                  <li>• Edit quarterly performance data</li>
                  <li>• Track variance across all periods</li>
                  <li>• Manage organizational information</li>
                </ul>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-green-800">Total Records</span>
                  <span className="text-2xl font-bold text-green-600">{assessmentData.length}</span>
                </div>
                <p className="text-sm text-green-600 mt-1">Active indicators available for review</p>
              </div>

              <div className="text-center pt-4 border-t border-slate-200">
                <p className="text-sm font-medium text-slate-600 group-hover:text-blue-600 transition-colors">
                  Click to access Target vs Actual tab →
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alternative Data Visualizations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enhanced Target vs Actual Gap Analysis - Card-Based Approach */}
        <Card className="bg-white border border-slate-300 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b border-purple-200">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              Target vs Actual Gap Analysis
            </CardTitle>
            <CardDescription>
              Clear performance gap visualization across all indicators
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
                {indicatorComparisonData.map((indicator, index) => {
                  const achievementRate = indicator.target > 0 ? (indicator.actual / indicator.target) * 100 : 0;
                  const gapPercentage = indicator.target > 0 ? (indicator.gap / indicator.target) * 100 : 0;
                  const performanceStatus = achievementRate >= 90 ? 'excellent' : achievementRate >= 75 ? 'good' : achievementRate >= 50 ? 'fair' : 'needs-improvement';
                  
                  return (
                    <div key={index} className="bg-slate-50 p-3 rounded-lg border border-slate-200 hover:border-purple-300 transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0 pr-3">
                          <h4 className="font-medium text-slate-900 text-sm leading-tight mb-1" title={indicator.name}>
                            {indicator.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge 
                              className={`text-xs ${
                                performanceStatus === 'excellent' ? 'bg-green-100 text-green-700 border-green-300' :
                                performanceStatus === 'good' ? 'bg-blue-100 text-blue-700 border-blue-300' :
                                performanceStatus === 'fair' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                                'bg-red-100 text-red-700 border-red-300'
                              }`}
                            >
                              {achievementRate.toFixed(1)}% Achievement
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-xs text-slate-600">Gap</div>
                          <div className={`font-semibold text-sm ${gapPercentage > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {gapPercentage > 0 ? '-' : '+'}{Math.abs(gapPercentage).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      
                      {/* Progress Bar Visualization */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-slate-600">
                          <span>Target: {indicator.target.toFixed(1)}%</span>
                          <span>Actual: {indicator.actual.toFixed(1)}%</span>
                        </div>
                        <div className="relative h-6 bg-slate-200 rounded-full overflow-hidden">
                          {/* Target marker */}
                          <div 
                            className="absolute top-0 bottom-0 w-0.5 bg-slate-900 z-10"
                            style={{ left: `${Math.min(100, (indicator.target / Math.max(indicator.target, indicator.actual, 100)) * 100)}%` }}
                            title={`Target: ${indicator.target.toFixed(1)}%`}
                          />
                          {/* Actual achievement bar */}
                          <div 
                            className={`h-full transition-all duration-500 ${
                              achievementRate >= 90 ? 'bg-green-500' :
                              achievementRate >= 75 ? 'bg-blue-500' :
                              achievementRate >= 50 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(100, achievementRate)}%` }}
                          />
                        </div>
                        
                        {/* Metrics Grid */}
                        <div className="grid grid-cols-3 gap-2 pt-1.5 text-xs">
                          <div className="bg-white px-2 py-1 rounded border border-slate-200">
                            <div className="text-slate-500">Target</div>
                            <div className="font-semibold text-blue-700">{indicator.target.toFixed(1)}%</div>
                          </div>
                          <div className="bg-white px-2 py-1 rounded border border-slate-200">
                            <div className="text-slate-500">Actual</div>
                            <div className="font-semibold text-green-700">{indicator.actual.toFixed(1)}%</div>
                          </div>
                          <div className="bg-white px-2 py-1 rounded border border-slate-200">
                            <div className="text-slate-500">Variance</div>
                            <div className={`font-semibold ${indicator.variance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                              {indicator.variance >= 0 ? '+' : ''}{indicator.variance.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
            
            {/* Summary Footer */}
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                  <div className="text-purple-600 text-xs mb-1">Avg Achievement</div>
                  <div className="font-semibold text-purple-900">
                    {(indicatorComparisonData.reduce((sum, d) => sum + d.actual, 0) / indicatorComparisonData.length).toFixed(1)}%
                  </div>
                </div>
                <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                  <div className="text-indigo-600 text-xs mb-1">Total Indicators</div>
                  <div className="font-semibold text-indigo-900">{indicatorComparisonData.length}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quarterly Performance Distribution Chart */}
        <Card className="bg-white border border-slate-300 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-200">
            <CardTitle className="flex items-center gap-2">
              <Grid3X3 className="h-5 w-5 text-orange-600" />
              Quarterly Performance Distribution
            </CardTitle>
            <CardDescription>
              Achievement rate distribution across all indicators per quarter
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Performance Legend */}
              <div className="flex flex-wrap items-center gap-3 text-xs bg-slate-50 p-3 rounded-lg">
                <span className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  Excellent (≥90%)
                </span>
                <span className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  Good (75-89%)
                </span>
                <span className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-orange-500 rounded"></div>
                  Needs Improvement (50-74%)
                </span>
                <span className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  Poor (&lt;50%)
                </span>
                <span className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-gray-200 rounded border border-gray-300"></div>
                  No Data
                </span>
              </div>
              
              {/* Quarterly Performance Bars */}
              <div className="space-y-5">
                {QUARTERS.map(quarter => {
                  const quarterData = heatmapData.map(row => row[quarter.shortLabel as keyof typeof row] as number | null);
                  const validData = quarterData.filter(v => v !== null) as number[];
                  
                  const excellent = validData.filter(v => v >= 90).length;
                  const good = validData.filter(v => v >= 75 && v < 90).length;
                  const needsImprovement = validData.filter(v => v >= 50 && v < 75).length;
                  const poor = validData.filter(v => v < 50).length;
                  const noData = quarterData.filter(v => v === null).length;
                  const total = assessmentData.length;
                  
                  const avgPerformance = validData.length > 0 
                    ? validData.reduce((sum, val) => sum + val, 0) / validData.length 
                    : 0;
                  
                  return (
                    <div key={quarter.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-sm text-slate-700">{quarter.label}</span>
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <span className="bg-blue-50 px-2 py-0.5 rounded">
                            Avg: {avgPerformance.toFixed(1)}%
                          </span>
                          <span className="text-slate-500">
                            {validData.length}/{total} indicators
                          </span>
                        </div>
                      </div>
                      
                      {/* Stacked Progress Bar */}
                      <div className="flex h-8 rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                        {excellent > 0 && (
                          <div 
                            className="bg-green-500 hover:bg-green-600 transition-colors cursor-pointer flex items-center justify-center text-xs text-white font-medium"
                            style={{ width: `${(excellent / total) * 100}%` }}
                            title={`${excellent} indicators (${((excellent / total) * 100).toFixed(1)}%) - Excellent`}
                          >
                            {excellent > 0 && <span className="px-1">{excellent}</span>}
                          </div>
                        )}
                        {good > 0 && (
                          <div 
                            className="bg-yellow-500 hover:bg-yellow-600 transition-colors cursor-pointer flex items-center justify-center text-xs text-white font-medium"
                            style={{ width: `${(good / total) * 100}%` }}
                            title={`${good} indicators (${((good / total) * 100).toFixed(1)}%) - Good`}
                          >
                            {good > 0 && <span className="px-1">{good}</span>}
                          </div>
                        )}
                        {needsImprovement > 0 && (
                          <div 
                            className="bg-orange-500 hover:bg-orange-600 transition-colors cursor-pointer flex items-center justify-center text-xs text-white font-medium"
                            style={{ width: `${(needsImprovement / total) * 100}%` }}
                            title={`${needsImprovement} indicators (${((needsImprovement / total) * 100).toFixed(1)}%) - Needs Improvement`}
                          >
                            {needsImprovement > 0 && <span className="px-1">{needsImprovement}</span>}
                          </div>
                        )}
                        {poor > 0 && (
                          <div 
                            className="bg-red-500 hover:bg-red-600 transition-colors cursor-pointer flex items-center justify-center text-xs text-white font-medium"
                            style={{ width: `${(poor / total) * 100}%` }}
                            title={`${poor} indicators (${((poor / total) * 100).toFixed(1)}%) - Poor`}
                          >
                            {poor > 0 && <span className="px-1">{poor}</span>}
                          </div>
                        )}
                        {noData > 0 && (
                          <div 
                            className="bg-gray-200 hover:bg-gray-300 transition-colors cursor-pointer flex items-center justify-center text-xs text-slate-600 font-medium border-l border-slate-300"
                            style={{ width: `${(noData / total) * 100}%` }}
                            title={`${noData} indicators (${((noData / total) * 100).toFixed(1)}%) - No Data`}
                          >
                            {noData > 0 && <span className="px-1">{noData}</span>}
                          </div>
                        )}
                      </div>
                      
                      {/* Performance Breakdown */}
                      <div className="flex flex-wrap gap-2 text-xs text-slate-600 pl-1">
                        {excellent > 0 && <span className="text-green-600">■ {excellent} excellent</span>}
                        {good > 0 && <span className="text-yellow-600">■ {good} good</span>}
                        {needsImprovement > 0 && <span className="text-orange-600">■ {needsImprovement} needs improvement</span>}
                        {poor > 0 && <span className="text-red-600">■ {poor} poor</span>}
                        {noData > 0 && <span className="text-gray-500">□ {noData} no data</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Summary Statistics */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-200">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200">
                  <div className="text-xs text-blue-600 mb-1">Total Indicators</div>
                  <div className="text-2xl font-bold text-blue-700">{assessmentData.length}</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg border border-green-200">
                  <div className="text-xs text-green-600 mb-1">Overall Avg Performance</div>
                  <div className="text-2xl font-bold text-green-700">
                    {(() => {
                      const allQuartersData = heatmapData.flatMap(row => 
                        [row.Q1, row.Q2, row.Q3, row.Q4].filter(v => v !== null) as number[]
                      );
                      return allQuartersData.length > 0 
                        ? (allQuartersData.reduce((sum, val) => sum + val, 0) / allQuartersData.length).toFixed(1)
                        : 0;
                    })()}%
                  </div>
                </div>
              </div>
              
              {/* Analysis Note */}
              <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                <strong>Analysis:</strong> This distribution shows how indicators perform across each quarter. 
                Hover over bars to see detailed breakdowns. Higher concentrations in green/yellow indicate better overall performance.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Radar Chart for Comprehensive Performance Analysis */}
      <Card className="bg-white border border-slate-300 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-indigo-200">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-indigo-600" />
            Quarterly Performance Radar Analysis
          </CardTitle>
          <CardDescription>
            360-degree view of target vs actual performance across all quarters
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="quarter" />
                <PolarRadiusAxis 
                  angle={45} 
                  domain={[0, 100]}
                  tick={{ fontSize: 12 }}
                />
                <Radar
                  name="Target"
                  dataKey="target"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
                <Radar
                  name="Actual"
                  dataKey="actual"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.3}
                  strokeWidth={3}
                />
                <Legend />
                <Tooltip 
                  formatter={(value, name) => [`${Number(value).toFixed(1)}%`, name]}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
            <strong>Analysis:</strong> The radar chart provides a comprehensive view of performance patterns. 
            Blue area represents targets, green area shows actual achievements. Larger green areas indicate better performance.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}