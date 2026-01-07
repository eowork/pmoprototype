import { useState, useEffect, useCallback } from 'react';
import { 
  MEDailyLog, 
  MEWeeklyRollup, 
  MEMonthlyRollup, 
  MEQuarterlyRollup,
  MERollup, 
  MEMetrics, 
  ProgressVariance,
  MEFilter,
  MEFilterPeriod,
  MEAggregatedData
} from '../types/METypes';

export function useMEData(projectId: string, globalFilter?: MEFilter) {
  const [dailyLogs, setDailyLogs] = useState<MEDailyLog[]>([]);
  const [weeklyRollups, setWeeklyRollups] = useState<MEWeeklyRollup[]>([]);
  const [monthlyRollups, setMonthlyRollups] = useState<MEMonthlyRollup[]>([]);
  const [quarterlyRollups, setQuarterlyRollups] = useState<MEQuarterlyRollup[]>([]);
  const [rollups, setRollups] = useState<MERollup[]>([]); // Legacy support
  const [metrics, setMetrics] = useState<MEMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aggregatedData, setAggregatedData] = useState<MEAggregatedData | null>(null);

  // Mock data for demonstration - replace with actual API calls
  const mockDailyLogs: MEDailyLog[] = [
    {
      id: '1',
      projectId,
      date: '2024-01-15',
      physicalProgress: 25,
      financialProgress: 20,
      accomplishments: ['Foundation work completed', 'Steel reinforcement installed'],
      issues: ['Weather delay', 'Material delivery delayed'],
      weather: 'rainy',
      laborCount: 15,
      equipmentStatus: 'operational',
      notes: 'Good progress despite weather conditions',
      createdBy: 'user1',
      createdAt: '2024-01-15T18:00:00Z',
      updatedAt: '2024-01-15T18:00:00Z'
    },
    {
      id: '2',
      projectId,
      date: '2024-01-16',
      physicalProgress: 28,
      financialProgress: 25,
      accomplishments: ['Concrete pouring started', 'Quality inspection passed'],
      issues: [],
      weather: 'sunny',
      laborCount: 18,
      equipmentStatus: 'operational',
      createdBy: 'user1',
      createdAt: '2024-01-16T18:00:00Z',
      updatedAt: '2024-01-16T18:00:00Z'
    },
    {
      id: '3',
      projectId,
      date: '2024-01-17',
      physicalProgress: 32,
      financialProgress: 30,
      accomplishments: ['Structural framework erected', 'Site safety inspection completed'],
      issues: ['Minor equipment malfunction resolved'],
      weather: 'cloudy',
      laborCount: 20,
      equipmentStatus: 'operational',
      createdBy: 'user1',
      createdAt: '2024-01-17T18:00:00Z',
      updatedAt: '2024-01-17T18:00:00Z'
    },
    {
      id: '4',
      projectId,
      date: '2024-01-22',
      physicalProgress: 38,
      financialProgress: 35,
      accomplishments: ['Electrical wiring phase started', 'Material inventory updated'],
      issues: [],
      weather: 'sunny',
      laborCount: 22,
      equipmentStatus: 'operational',
      createdBy: 'user1',
      createdAt: '2024-01-22T18:00:00Z',
      updatedAt: '2024-01-22T18:00:00Z'
    }
  ];

  // Calculation utilities
  const getWeekNumber = (date: Date): number => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

  const getQuarter = (month: number): number => {
    return Math.floor((month - 1) / 3) + 1;
  };

  // Rollup calculation functions
  const calculateWeeklyRollups = useCallback((logs: MEDailyLog[]): MEWeeklyRollup[] => {
    const weeklyGroups: { [key: string]: MEDailyLog[] } = {};
    
    logs.forEach(log => {
      const date = new Date(log.date);
      const year = date.getFullYear();
      const week = getWeekNumber(date);
      const key = `${year}-W${week}`;
      
      if (!weeklyGroups[key]) {
        weeklyGroups[key] = [];
      }
      weeklyGroups[key].push(log);
    });

    return Object.entries(weeklyGroups).map(([key, groupLogs]) => {
      const [year, weekStr] = key.split('-W');
      const weekNumber = parseInt(weekStr);
      
      // Calculate week start and end dates
      const jan1 = new Date(parseInt(year), 0, 1);
      const startDate = new Date(jan1.getTime() + (weekNumber - 1) * 7 * 24 * 60 * 60 * 1000);
      const endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);
      
      const avgPhysicalProgress = groupLogs.reduce((sum, log) => sum + log.physicalProgress, 0) / groupLogs.length;
      const avgFinancialProgress = groupLogs.reduce((sum, log) => sum + log.financialProgress, 0) / groupLogs.length;
      const totalAccomplishments = groupLogs.reduce((sum, log) => sum + log.accomplishments.length, 0);
      const totalIssues = groupLogs.reduce((sum, log) => sum + log.issues.length, 0);
      const avgLaborCount = groupLogs.reduce((sum, log) => sum + log.laborCount, 0) / groupLogs.length;
      
      // Weather summary
      const weatherSummary = groupLogs.reduce((acc, log) => {
        acc[log.weather] = (acc[log.weather] || 0) + 1;
        return acc;
      }, { sunny: 0, cloudy: 0, rainy: 0, stormy: 0 });

      return {
        id: `weekly-${key}`,
        projectId,
        weekNumber,
        year: parseInt(year),
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        avgPhysicalProgress,
        avgFinancialProgress,
        totalAccomplishments,
        totalIssues,
        avgLaborCount,
        operationalDays: groupLogs.length,
        weatherSummary,
        variance: avgPhysicalProgress - avgFinancialProgress,
        kpis: {
          onTimePerformance: Math.min(100, avgPhysicalProgress + 10),
          budgetEfficiency: Math.min(100, avgFinancialProgress + 15),
          qualityScore: Math.min(100, 85 + Math.random() * 15),
          productivityIndex: avgLaborCount > 0 ? (avgPhysicalProgress / avgLaborCount) * 10 : 0
        },
        dailyLogIds: groupLogs.map(log => log.id),
        generatedAt: new Date().toISOString()
      };
    });
  }, [projectId]);

  const calculateMonthlyRollups = useCallback((weeklyRollups: MEWeeklyRollup[]): MEMonthlyRollup[] => {
    const monthlyGroups: { [key: string]: MEWeeklyRollup[] } = {};
    
    weeklyRollups.forEach(rollup => {
      const date = new Date(rollup.startDate);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const key = `${year}-${month.toString().padStart(2, '0')}`;
      
      if (!monthlyGroups[key]) {
        monthlyGroups[key] = [];
      }
      monthlyGroups[key].push(rollup);
    });

    return Object.entries(monthlyGroups).map(([key, groupRollups]) => {
      const [year, monthStr] = key.split('-');
      const month = parseInt(monthStr);
      
      const startDate = new Date(parseInt(year), month - 1, 1);
      const endDate = new Date(parseInt(year), month, 0);
      
      const avgPhysicalProgress = groupRollups.reduce((sum, rollup) => sum + rollup.avgPhysicalProgress, 0) / groupRollups.length;
      const avgFinancialProgress = groupRollups.reduce((sum, rollup) => sum + rollup.avgFinancialProgress, 0) / groupRollups.length;
      const totalAccomplishments = groupRollups.reduce((sum, rollup) => sum + rollup.totalAccomplishments, 0);
      const totalIssues = groupRollups.reduce((sum, rollup) => sum + rollup.totalIssues, 0);
      const avgLaborCount = groupRollups.reduce((sum, rollup) => sum + rollup.avgLaborCount, 0) / groupRollups.length;
      const operationalDays = groupRollups.reduce((sum, rollup) => sum + rollup.operationalDays, 0);
      
      // Weather summary aggregation
      const weatherSummary = groupRollups.reduce((acc, rollup) => {
        acc.sunny += rollup.weatherSummary.sunny;
        acc.cloudy += rollup.weatherSummary.cloudy;
        acc.rainy += rollup.weatherSummary.rainy;
        acc.stormy += rollup.weatherSummary.stormy;
        return acc;
      }, { sunny: 0, cloudy: 0, rainy: 0, stormy: 0 });

      return {
        id: `monthly-${key}`,
        projectId,
        month,
        year: parseInt(year),
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        avgPhysicalProgress,
        avgFinancialProgress,
        totalAccomplishments,
        totalIssues,
        avgLaborCount,
        operationalDays,
        weatherSummary,
        variance: avgPhysicalProgress - avgFinancialProgress,
        kpis: {
          onTimePerformance: groupRollups.reduce((sum, rollup) => sum + rollup.kpis.onTimePerformance, 0) / groupRollups.length,
          budgetEfficiency: groupRollups.reduce((sum, rollup) => sum + rollup.kpis.budgetEfficiency, 0) / groupRollups.length,
          qualityScore: groupRollups.reduce((sum, rollup) => sum + rollup.kpis.qualityScore, 0) / groupRollups.length,
          productivityIndex: groupRollups.reduce((sum, rollup) => sum + rollup.kpis.productivityIndex, 0) / groupRollups.length,
          resourceUtilization: Math.min(100, (operationalDays / (endDate.getDate())) * 100)
        },
        weeklyRollupIds: groupRollups.map(rollup => rollup.id),
        milestones: {
          achieved: Math.floor(avgPhysicalProgress / 25),
          missed: Math.floor(Math.random() * 2),
          upcoming: Math.floor((100 - avgPhysicalProgress) / 25)
        },
        generatedAt: new Date().toISOString()
      };
    });
  }, [projectId]);

  const calculateQuarterlyRollups = useCallback((monthlyRollups: MEMonthlyRollup[]): MEQuarterlyRollup[] => {
    const quarterlyGroups: { [key: string]: MEMonthlyRollup[] } = {};
    
    monthlyRollups.forEach(rollup => {
      const quarter = getQuarter(rollup.month);
      const key = `${rollup.year}-Q${quarter}`;
      
      if (!quarterlyGroups[key]) {
        quarterlyGroups[key] = [];
      }
      quarterlyGroups[key].push(rollup);
    });

    return Object.entries(quarterlyGroups).map(([key, groupRollups]) => {
      const [year, quarterStr] = key.split('-Q');
      const quarter = parseInt(quarterStr);
      
      const startMonth = (quarter - 1) * 3;
      const startDate = new Date(parseInt(year), startMonth, 1);
      const endDate = new Date(parseInt(year), startMonth + 3, 0);
      
      const avgPhysicalProgress = groupRollups.reduce((sum, rollup) => sum + rollup.avgPhysicalProgress, 0) / groupRollups.length;
      const avgFinancialProgress = groupRollups.reduce((sum, rollup) => sum + rollup.avgFinancialProgress, 0) / groupRollups.length;
      const totalAccomplishments = groupRollups.reduce((sum, rollup) => sum + rollup.totalAccomplishments, 0);
      const totalIssues = groupRollups.reduce((sum, rollup) => sum + rollup.totalIssues, 0);
      const avgLaborCount = groupRollups.reduce((sum, rollup) => sum + rollup.avgLaborCount, 0) / groupRollups.length;
      const operationalDays = groupRollups.reduce((sum, rollup) => sum + rollup.operationalDays, 0);
      
      // Weather summary aggregation
      const weatherSummary = groupRollups.reduce((acc, rollup) => {
        acc.sunny += rollup.weatherSummary.sunny;
        acc.cloudy += rollup.weatherSummary.cloudy;
        acc.rainy += rollup.weatherSummary.rainy;
        acc.stormy += rollup.weatherSummary.stormy;
        return acc;
      }, { sunny: 0, cloudy: 0, rainy: 0, stormy: 0 });

      // Budget analysis (mock data - replace with actual calculations)
      const totalBudget = 1000000; // Replace with actual project budget
      const utilizationRate = avgFinancialProgress / 100;
      
      return {
        id: `quarterly-${key}`,
        projectId,
        quarter,
        year: parseInt(year),
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        avgPhysicalProgress,
        avgFinancialProgress,
        totalAccomplishments,
        totalIssues,
        avgLaborCount,
        operationalDays,
        weatherSummary,
        variance: avgPhysicalProgress - avgFinancialProgress,
        kpis: {
          onTimePerformance: groupRollups.reduce((sum, rollup) => sum + rollup.kpis.onTimePerformance, 0) / groupRollups.length,
          budgetEfficiency: groupRollups.reduce((sum, rollup) => sum + rollup.kpis.budgetEfficiency, 0) / groupRollups.length,
          qualityScore: groupRollups.reduce((sum, rollup) => sum + rollup.kpis.qualityScore, 0) / groupRollups.length,
          productivityIndex: groupRollups.reduce((sum, rollup) => sum + rollup.kpis.productivityIndex, 0) / groupRollups.length,
          resourceUtilization: groupRollups.reduce((sum, rollup) => sum + (rollup.kpis.resourceUtilization || 0), 0) / groupRollups.length,
          overallProjectHealth: Math.min(100, (avgPhysicalProgress + avgFinancialProgress) / 2)
        },
        monthlyRollupIds: groupRollups.map(rollup => rollup.id),
        milestones: {
          achieved: groupRollups.reduce((sum, rollup) => sum + rollup.milestones.achieved, 0),
          missed: groupRollups.reduce((sum, rollup) => sum + rollup.milestones.missed, 0),
          upcoming: groupRollups.reduce((sum, rollup) => sum + rollup.milestones.upcoming, 0)
        },
        budgetAnalysis: {
          allocatedBudget: totalBudget,
          utilizedBudget: totalBudget * utilizationRate,
          remainingBudget: totalBudget * (1 - utilizationRate),
          burnRate: totalBudget * utilizationRate / operationalDays
        },
        riskAssessment: {
          lowRisk: Math.max(0, 100 - totalIssues * 10),
          mediumRisk: Math.min(50, totalIssues * 5),
          highRisk: Math.min(30, totalIssues * 3),
          criticalRisk: Math.min(20, Math.max(0, totalIssues - 5))
        },
        generatedAt: new Date().toISOString()
      };
    });
  }, [projectId]);

  // Filter data based on global filter
  const applyFilter = useCallback((filter?: MEFilter): MEAggregatedData | null => {
    if (!filter) return null;

    const { period, dateRange } = filter;
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);

    let filteredData: any[] = [];
    let summary: MEAggregatedData['summary'];

    switch (period) {
      case 'daily':
        filteredData = dailyLogs.filter(log => {
          const logDate = new Date(log.date);
          return logDate >= startDate && logDate <= endDate;
        });
        
        summary = {
          totalEntries: filteredData.length,
          avgPhysicalProgress: filteredData.reduce((sum, log) => sum + log.physicalProgress, 0) / (filteredData.length || 1),
          avgFinancialProgress: filteredData.reduce((sum, log) => sum + log.financialProgress, 0) / (filteredData.length || 1),
          totalAccomplishments: filteredData.reduce((sum, log) => sum + log.accomplishments.length, 0),
          totalIssues: filteredData.reduce((sum, log) => sum + log.issues.length, 0),
          overallVariance: 0,
          periodLabel: `${filteredData.length} days of data`
        };
        break;

      case 'weekly':
        filteredData = weeklyRollups.filter(rollup => {
          const rollupStart = new Date(rollup.startDate);
          const rollupEnd = new Date(rollup.endDate);
          return rollupStart >= startDate && rollupEnd <= endDate;
        });
        
        summary = {
          totalEntries: filteredData.length,
          avgPhysicalProgress: filteredData.reduce((sum, rollup) => sum + rollup.avgPhysicalProgress, 0) / (filteredData.length || 1),
          avgFinancialProgress: filteredData.reduce((sum, rollup) => sum + rollup.avgFinancialProgress, 0) / (filteredData.length || 1),
          totalAccomplishments: filteredData.reduce((sum, rollup) => sum + rollup.totalAccomplishments, 0),
          totalIssues: filteredData.reduce((sum, rollup) => sum + rollup.totalIssues, 0),
          overallVariance: filteredData.reduce((sum, rollup) => sum + rollup.variance, 0) / (filteredData.length || 1),
          periodLabel: `${filteredData.length} weeks of data`
        };
        break;

      case 'monthly':
        filteredData = monthlyRollups.filter(rollup => {
          const rollupStart = new Date(rollup.startDate);
          const rollupEnd = new Date(rollup.endDate);
          return rollupStart >= startDate && rollupEnd <= endDate;
        });
        
        summary = {
          totalEntries: filteredData.length,
          avgPhysicalProgress: filteredData.reduce((sum, rollup) => sum + rollup.avgPhysicalProgress, 0) / (filteredData.length || 1),
          avgFinancialProgress: filteredData.reduce((sum, rollup) => sum + rollup.avgFinancialProgress, 0) / (filteredData.length || 1),
          totalAccomplishments: filteredData.reduce((sum, rollup) => sum + rollup.totalAccomplishments, 0),
          totalIssues: filteredData.reduce((sum, rollup) => sum + rollup.totalIssues, 0),
          overallVariance: filteredData.reduce((sum, rollup) => sum + rollup.variance, 0) / (filteredData.length || 1),
          periodLabel: `${filteredData.length} months of data`
        };
        break;

      case 'quarterly':
        filteredData = quarterlyRollups.filter(rollup => {
          const rollupStart = new Date(rollup.startDate);
          const rollupEnd = new Date(rollup.endDate);
          return rollupStart >= startDate && rollupEnd <= endDate;
        });
        
        summary = {
          totalEntries: filteredData.length,
          avgPhysicalProgress: filteredData.reduce((sum, rollup) => sum + rollup.avgPhysicalProgress, 0) / (filteredData.length || 1),
          avgFinancialProgress: filteredData.reduce((sum, rollup) => sum + rollup.avgFinancialProgress, 0) / (filteredData.length || 1),
          totalAccomplishments: filteredData.reduce((sum, rollup) => sum + rollup.totalAccomplishments, 0),
          totalIssues: filteredData.reduce((sum, rollup) => sum + rollup.totalIssues, 0),
          overallVariance: filteredData.reduce((sum, rollup) => sum + rollup.variance, 0) / (filteredData.length || 1),
          periodLabel: `${filteredData.length} quarters of data`
        };
        break;

      default:
        return null;
    }

    summary.overallVariance = summary.avgPhysicalProgress - summary.avgFinancialProgress;

    return {
      period,
      data: filteredData,
      summary
    };
  }, [dailyLogs, weeklyRollups, monthlyRollups, quarterlyRollups]);

  const fetchMEData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Set daily logs (base data)
      setDailyLogs(mockDailyLogs);
      
      // Calculate rollups
      const weeklyData = calculateWeeklyRollups(mockDailyLogs);
      const monthlyData = calculateMonthlyRollups(weeklyData);
      const quarterlyData = calculateQuarterlyRollups(monthlyData);
      
      setWeeklyRollups(weeklyData);
      setMonthlyRollups(monthlyData);
      setQuarterlyRollups(quarterlyData);

      // Legacy rollups for backward compatibility
      const legacyRollups: MERollup[] = [
        ...weeklyData.map(w => ({
          id: w.id,
          projectId: w.projectId,
          period: 'weekly' as const,
          startDate: w.startDate,
          endDate: w.endDate,
          avgPhysicalProgress: w.avgPhysicalProgress,
          avgFinancialProgress: w.avgFinancialProgress,
          totalAccomplishments: w.totalAccomplishments,
          totalIssues: w.totalIssues,
          variance: w.variance,
          kpis: {
            onTimePerformance: w.kpis.onTimePerformance,
            budgetEfficiency: w.kpis.budgetEfficiency,
            qualityScore: w.kpis.qualityScore
          },
          generatedAt: w.generatedAt
        })),
        ...monthlyData.map(m => ({
          id: m.id,
          projectId: m.projectId,
          period: 'monthly' as const,
          startDate: m.startDate,
          endDate: m.endDate,
          avgPhysicalProgress: m.avgPhysicalProgress,
          avgFinancialProgress: m.avgFinancialProgress,
          totalAccomplishments: m.totalAccomplishments,
          totalIssues: m.totalIssues,
          variance: m.variance,
          kpis: {
            onTimePerformance: m.kpis.onTimePerformance,
            budgetEfficiency: m.kpis.budgetEfficiency,
            qualityScore: m.kpis.qualityScore
          },
          generatedAt: m.generatedAt
        })),
        ...quarterlyData.map(q => ({
          id: q.id,
          projectId: q.projectId,
          period: 'quarterly' as const,
          startDate: q.startDate,
          endDate: q.endDate,
          avgPhysicalProgress: q.avgPhysicalProgress,
          avgFinancialProgress: q.avgFinancialProgress,
          totalAccomplishments: q.totalAccomplishments,
          totalIssues: q.totalIssues,
          variance: q.variance,
          kpis: {
            onTimePerformance: q.kpis.onTimePerformance,
            budgetEfficiency: q.kpis.budgetEfficiency,
            qualityScore: q.kpis.qualityScore
          },
          generatedAt: q.generatedAt
        }))
      ];
      
      setRollups(legacyRollups);
      
      // Calculate metrics
      const totalLogs = mockDailyLogs.length;
      const avgDailyProgress = mockDailyLogs.reduce((sum, log) => sum + log.physicalProgress, 0) / totalLogs;
      const latestLog = mockDailyLogs[mockDailyLogs.length - 1];
      const previousLog = mockDailyLogs[mockDailyLogs.length - 2];
      
      setMetrics({
        totalLogs,
        avgDailyProgress,
        currentVariance: -4,
        lastUpdated: latestLog?.updatedAt || '',
        trendDirection: latestLog && previousLog 
          ? (latestLog.physicalProgress > previousLog.physicalProgress ? 'up' : 'down')
          : 'stable'
      });

      // Apply global filter if provided
      if (globalFilter) {
        const filtered = applyFilter(globalFilter);
        setAggregatedData(filtered);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch M&E data');
    } finally {
      setLoading(false);
    }
  }, [projectId, globalFilter, calculateWeeklyRollups, calculateMonthlyRollups, calculateQuarterlyRollups, applyFilter]);

  // Apply filter when globalFilter changes
  useEffect(() => {
    if (globalFilter && !loading) {
      const filtered = applyFilter(globalFilter);
      setAggregatedData(filtered);
    } else if (!globalFilter) {
      setAggregatedData(null);
    }
  }, [globalFilter, applyFilter, loading]);

  const addDailyLog = useCallback(async (logEntry: Omit<MEDailyLog, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newLog: MEDailyLog = {
        ...logEntry,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setDailyLogs(prev => {
        const updated = [...prev, newLog].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        // Recalculate rollups
        const weeklyData = calculateWeeklyRollups(updated);
        const monthlyData = calculateMonthlyRollups(weeklyData);
        const quarterlyData = calculateQuarterlyRollups(monthlyData);
        
        setWeeklyRollups(weeklyData);
        setMonthlyRollups(monthlyData);
        setQuarterlyRollups(quarterlyData);
        
        return updated;
      });
      
      return { success: true, data: newLog };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to add log entry' };
    }
  }, [calculateWeeklyRollups, calculateMonthlyRollups, calculateQuarterlyRollups]);

  const updateDailyLog = useCallback(async (logId: string, updates: Partial<MEDailyLog>) => {
    try {
      setDailyLogs(prev => {
        const updated = prev.map(log => 
          log.id === logId 
            ? { ...log, ...updates, updatedAt: new Date().toISOString() }
            : log
        );
        
        // Recalculate rollups
        const weeklyData = calculateWeeklyRollups(updated);
        const monthlyData = calculateMonthlyRollups(weeklyData);
        const quarterlyData = calculateQuarterlyRollups(monthlyData);
        
        setWeeklyRollups(weeklyData);
        setMonthlyRollups(monthlyData);
        setQuarterlyRollups(quarterlyData);
        
        return updated;
      });
      
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update log entry' };
    }
  }, [calculateWeeklyRollups, calculateMonthlyRollups, calculateQuarterlyRollups]);

  const deleteDailyLog = useCallback(async (logId: string) => {
    try {
      setDailyLogs(prev => {
        const updated = prev.filter(log => log.id !== logId);
        
        // Recalculate rollups
        const weeklyData = calculateWeeklyRollups(updated);
        const monthlyData = calculateMonthlyRollups(weeklyData);
        const quarterlyData = calculateQuarterlyRollups(monthlyData);
        
        setWeeklyRollups(weeklyData);
        setMonthlyRollups(monthlyData);
        setQuarterlyRollups(quarterlyData);
        
        return updated;
      });
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to delete log entry' };
    }
  }, [calculateWeeklyRollups, calculateMonthlyRollups, calculateQuarterlyRollups]);

  const generateRollup = useCallback(async (period: 'weekly' | 'monthly' | 'quarterly', startDate: string, endDate: string) => {
    try {
      // This is already handled automatically by the calculation functions
      // Return the appropriate rollup data based on period
      let rollupData;
      
      switch (period) {
        case 'weekly':
          rollupData = weeklyRollups.find(w => w.startDate <= startDate && w.endDate >= endDate);
          break;
        case 'monthly':
          rollupData = monthlyRollups.find(m => m.startDate <= startDate && m.endDate >= endDate);
          break;
        case 'quarterly':
          rollupData = quarterlyRollups.find(q => q.startDate <= startDate && q.endDate >= endDate);
          break;
      }

      if (rollupData) {
        return { success: true, data: rollupData };
      } else {
        throw new Error(`No ${period} rollup found for the specified period`);
      }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to generate rollup' };
    }
  }, [weeklyRollups, monthlyRollups, quarterlyRollups]);

  const getProgressVariance = useCallback((): ProgressVariance[] => {
    return rollups.map(rollup => ({
      period: `${rollup.period} (${rollup.startDate} - ${rollup.endDate})`,
      plannedProgress: rollup.avgFinancialProgress,
      actualProgress: rollup.avgPhysicalProgress,
      variance: rollup.variance,
      status: rollup.variance >= 0 ? 'ahead' : rollup.variance > -5 ? 'on-track' : 'behind'
    }));
  }, [rollups]);

  useEffect(() => {
    if (projectId) {
      fetchMEData();
    }
  }, [projectId, fetchMEData]);

  return {
    // Raw data
    dailyLogs,
    weeklyRollups,
    monthlyRollups,
    quarterlyRollups,
    rollups, // Legacy support
    metrics,
    
    // Filtered/aggregated data
    aggregatedData,
    
    // State
    loading,
    error,
    
    // Actions
    addDailyLog,
    updateDailyLog,
    deleteDailyLog,
    generateRollup,
    getProgressVariance,
    refresh: fetchMEData,
    
    // Filter utilities
    applyFilter
  };
}