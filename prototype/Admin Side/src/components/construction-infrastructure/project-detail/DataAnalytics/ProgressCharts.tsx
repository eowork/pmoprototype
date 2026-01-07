import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../ui/card';
import { Skeleton } from '../../../ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';
import { MEDailyLog, MERollup, MEFilter } from '../../types/METypes';

interface ProgressChartsProps {
  dailyLogs: MEDailyLog[];
  rollups: MERollup[];
  projectId: string;
  globalFilter?: MEFilter;
}

export function ProgressCharts({ dailyLogs, rollups, projectId, globalFilter }: ProgressChartsProps) {
  const [chartContainerReady, setChartContainerReady] = useState(false);
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 300 });
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeTimeoutRef = useRef<NodeJS.Timeout>();

  // Stable container initialization
  useEffect(() => {
    const initContainer = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        setContainerDimensions({ width: width || 400, height: 300 });
        setChartContainerReady(true);
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(initContainer, 100);
    return () => clearTimeout(timer);
  }, []);

  // Debounced resize handler
  const handleResize = useCallback(() => {
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }
    
    resizeTimeoutRef.current = setTimeout(() => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        setContainerDimensions(prev => ({ ...prev, width: width || prev.width }));
      }
    }, 150);
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [handleResize]);

  // Memoized and stabilized data processing
  const chartData = useMemo(() => {
    const processedData = {
      dailyProgressData: [],
      rollupData: [],
      kpiTrendData: [],
      hasData: false
    };

    if (!dailyLogs || !Array.isArray(dailyLogs)) {
      return processedData;
    }

    try {
      // Process daily progress data
      processedData.dailyProgressData = dailyLogs.map((log, index) => ({
        id: `daily-${log.id || index}`,
        date: new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        physical: Math.max(0, Math.min(100, log.physicalProgress || 0)),
        financial: Math.max(0, Math.min(100, log.financialProgress || 0)),
        variance: (log.physicalProgress || 0) - (log.financialProgress || 0)
      }));

      // Process rollup data
      if (rollups && Array.isArray(rollups)) {
        processedData.rollupData = rollups.map((rollup, index) => ({
          id: `rollup-${rollup.id || index}`,
          period: rollup.period || `Period ${index + 1}`,
          avgPhysical: Math.max(0, Math.min(100, rollup.avgPhysicalProgress || 0)),
          avgFinancial: Math.max(0, Math.min(100, rollup.avgFinancialProgress || 0)),
          variance: rollup.variance || 0,
          accomplishments: rollup.totalAccomplishments || 0,
          issues: rollup.totalIssues || 0
        }));

        // Process KPI data
        processedData.kpiTrendData = rollups.map((rollup, index) => ({
          id: `kpi-${rollup.id || index}`,
          period: rollup.period || `Period ${index + 1}`,
          onTime: Math.max(0, Math.min(100, rollup.kpis?.onTimePerformance || 0)),
          budgetEfficiency: Math.max(0, Math.min(100, rollup.kpis?.budgetEfficiency || 0)),
          quality: Math.max(0, Math.min(100, rollup.kpis?.qualityScore || 0))
        }));
      }

      processedData.hasData = processedData.dailyProgressData.length > 0;
    } catch (error) {
      console.warn('Error processing chart data:', error);
    }

    return processedData;
  }, [dailyLogs, rollups]);

  // Stable chart key to prevent remounting
  const chartKey = useMemo(() => `${projectId}-${chartData.hasData}`, [projectId, chartData.hasData]);

  if (!chartContainerReady) {
    return (
      <div ref={containerRef} className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <Card key={`skeleton-${i}`}>
            <CardHeader>
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!chartData.hasData) {
    return (
      <div ref={containerRef} className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card className="md:col-span-2">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <span className="text-gray-400 text-2xl">📊</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
            <p className="text-gray-600">Charts will appear when monitoring data is available.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
      {/* Daily Progress Trend - Stable mounting */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Progress Trend</CardTitle>
          <CardDescription>
            Physical vs Financial progress over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ width: '100%', height: '300px', minHeight: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData.dailyProgressData} key={`daily-${chartKey}`}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="physical" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Physical Progress (%)"
                  dot={{ r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="financial" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Financial Progress (%)"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Progress Variance - Stable mounting */}
      <Card>
        <CardHeader>
          <CardTitle>Progress Variance Analysis</CardTitle>
          <CardDescription>
            Difference between physical and financial progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ width: '100%', height: '300px', minHeight: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.dailyProgressData} key={`variance-${chartKey}`}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="variance" 
                  stroke="#f59e0b" 
                  fill="#fef3c7"
                  name="Variance (%)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Period Summary - Conditional but stable */}
      {chartData.rollupData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Period Summary</CardTitle>
            <CardDescription>
              Average progress by reporting period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: '300px', minHeight: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.rollupData} key={`period-${chartKey}`}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="avgPhysical" fill="#3b82f6" name="Avg Physical %" />
                  <Bar dataKey="avgFinancial" fill="#10b981" name="Avg Financial %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Trends - Conditional but stable */}
      {chartData.kpiTrendData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>KPI Performance Trends</CardTitle>
            <CardDescription>
              Key performance indicators over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: '300px', minHeight: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.kpiTrendData} key={`kpi-${chartKey}`}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="onTime" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="On-Time Performance (%)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="budgetEfficiency" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Budget Efficiency (%)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="quality" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    name="Quality Score (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}