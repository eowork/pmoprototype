import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../ui/tabs';
import { Skeleton } from '../../../ui/skeleton';
import { Plus, TrendingUp, TrendingDown, Minus, Download } from 'lucide-react';
import { useMEData } from '../../hooks/useMEData';
import { MELogEntryDialog } from './MELogEntryDialog';
import { ProgressCharts } from './ProgressCharts';
import { VarianceAnalysis } from './VarianceAnalysis';
import { ExportTools } from './ExportTools';
import { MEFilter } from '../../types/METypes';

interface MEDashboardProps {
  projectId: string;
  userRole: string;
  requireAuth: (action: string) => boolean;
  globalFilter: MEFilter;
}

export function MEDashboard({ projectId, userRole, requireAuth, globalFilter }: MEDashboardProps) {
  const { dailyLogs, rollups, metrics, loading, error, addDailyLog, generateRollup, getProgressVariance } = useMEData(projectId, globalFilter);
  const [showLogDialog, setShowLogDialog] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'weekly' | 'monthly' | 'quarterly'>('weekly');

  const canEdit = userRole === 'Admin' || userRole === 'Staff';

  // Filter analytics data based on global filter
  const filteredAnalytics = useMemo(() => {
    if (!globalFilter || !dailyLogs) return { filteredLogs: dailyLogs, filteredMetrics: metrics };

    const startDate = new Date(globalFilter.dateRange.startDate);
    const endDate = new Date(globalFilter.dateRange.endDate);

    const filteredLogs = dailyLogs.filter(log => {
      const logDate = new Date(log.date);
      return logDate >= startDate && logDate <= endDate;
    });

    // Recalculate metrics based on filtered logs
    const recalculatedMetrics = filteredLogs.length > 0 ? {
      totalLogs: filteredLogs.length,
      avgDailyProgress: filteredLogs.reduce((sum, log) => sum + log.physicalProgress, 0) / filteredLogs.length,
      currentVariance: metrics?.currentVariance || 0,
      lastUpdated: new Date().toISOString(),
      trendDirection: 'stable' as const
    } : metrics;

    return { filteredLogs, filteredMetrics: recalculatedMetrics };
  }, [dailyLogs, metrics, globalFilter]);

  const handleAddLog = () => {
    if (!requireAuth('add monitoring data')) return;
    setShowLogDialog(true);
  };

  const handleGenerateRollup = async () => {
    if (!requireAuth('generate reports')) return;
    
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - (selectedPeriod === 'weekly' ? 7 : selectedPeriod === 'monthly' ? 30 : 90) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    await generateRollup(selectedPeriod, startDate, endDate);
  };

  const progressVariance = getProgressVariance();

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={`loading-${i}`}>
              <CardHeader className="animate-pulse">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-8 w-1/2" />
              </CardHeader>
            </Card>
          ))}
        </div>
        <div className="mt-6">
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">Error loading M&E data: {error}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Data Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Analytics synced with canonical project data • Filtered by: {globalFilter.period} view
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Button onClick={handleAddLog} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Daily Log
            </Button>
          )}
          <ExportTools 
            dailyLogs={filteredAnalytics.filteredLogs} 
            rollups={rollups} 
            projectId={projectId}
          />
        </div>
      </div>

      {/* Global Filter Status */}
      <Card className="border border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-sm font-medium text-blue-900">Active Filter:</span>
                <span className="ml-2 text-sm text-blue-800 capitalize">{globalFilter.period} View</span>
              </div>
              <div>
                <span className="text-sm font-medium text-blue-900">Date Range:</span>
                <span className="ml-2 text-sm text-blue-800">
                  {globalFilter.dateRange.startDate} to {globalFilter.dateRange.endDate}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-blue-900">Data Points:</span>
                <span className="ml-2 text-sm text-blue-800">{filteredAnalytics.filteredLogs?.length || 0} logs</span>
              </div>
            </div>
            <Badge variant="secondary">Real-time Sync</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics - Updated with filtered data */}
      {filteredAnalytics.filteredMetrics && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Logs (Filtered)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredAnalytics.filteredMetrics.totalLogs}</div>
              <p className="text-xs text-muted-foreground">
                Last updated {new Date(filteredAnalytics.filteredMetrics.lastUpdated).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Daily Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredAnalytics.filteredMetrics.avgDailyProgress.toFixed(1)}%</div>
              <div className="flex items-center gap-1">
                {filteredAnalytics.filteredMetrics.trendDirection === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
                {filteredAnalytics.filteredMetrics.trendDirection === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
                {filteredAnalytics.filteredMetrics.trendDirection === 'stable' && <Minus className="h-3 w-3 text-yellow-500" />}
                <span className="text-xs text-muted-foreground">
                  {filteredAnalytics.filteredMetrics.trendDirection}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Current Variance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredAnalytics.filteredMetrics.currentVariance > 0 ? '+' : ''}{filteredAnalytics.filteredMetrics.currentVariance.toFixed(1)}%
              </div>
              <Badge variant={filteredAnalytics.filteredMetrics.currentVariance >= 0 ? 'default' : 'destructive'}>
                {filteredAnalytics.filteredMetrics.currentVariance >= 0 ? 'Ahead' : 'Behind'} Schedule
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Report Generation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <select 
                  value={selectedPeriod} 
                  onChange={(e) => setSelectedPeriod(e.target.value as any)}
                  className="w-full px-3 py-1 border rounded text-sm"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                </select>
                <Button 
                  size="sm" 
                  onClick={handleGenerateRollup}
                  disabled={!canEdit}
                  className="w-full"
                >
                  Generate {selectedPeriod} Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs - Enhanced with filtered data */}
      <Tabs defaultValue="charts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="charts">Progress Charts</TabsTrigger>
          <TabsTrigger value="variance">Variance Analysis</TabsTrigger>
          <TabsTrigger value="logs">Daily Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="charts" className="space-y-4">
          <ProgressCharts 
            dailyLogs={filteredAnalytics.filteredLogs} 
            rollups={rollups} 
            projectId={projectId}
            globalFilter={globalFilter}
          />
        </TabsContent>

        <TabsContent value="variance" className="space-y-4">
          <VarianceAnalysis 
            progressVariance={progressVariance}
            rollups={rollups}
            globalFilter={globalFilter}
          />
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Daily Logs</CardTitle>
                  <CardDescription>
                    Latest monitoring entries and accomplishments (filtered by global settings)
                  </CardDescription>
                </div>
                <Badge variant="secondary">
                  {filteredAnalytics.filteredLogs?.length || 0} entries
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredAnalytics.filteredLogs?.slice(-5).reverse().map((log) => (
                  <div key={log.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{new Date(log.date).toLocaleDateString()}</h4>
                      <div className="flex gap-2">
                        <Badge variant="outline">
                          Physical: {log.physicalProgress}%
                        </Badge>
                        <Badge variant="outline">
                          Financial: {log.financialProgress}%
                        </Badge>
                      </div>
                    </div>
                    
                    {log.accomplishments.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-green-700">Accomplishments:</h5>
                        <ul className="text-sm text-muted-foreground list-disc list-inside">
                          {log.accomplishments.map((acc, i) => (
                            <li key={i}>{acc}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {log.issues.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-red-700">Issues:</h5>
                        <ul className="text-sm text-muted-foreground list-disc list-inside">
                          {log.issues.map((issue, i) => (
                            <li key={i}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )) || (
                  <div className="text-center py-8 text-gray-500">
                    No logs found for the current filter period.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Log Entry Dialog */}
      {showLogDialog && (
        <MELogEntryDialog
          projectId={projectId}
          onClose={() => setShowLogDialog(false)}
          onSubmit={addDailyLog}
        />
      )}

      {/* Data Source Notice */}
      <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-md">
        <p className="text-xs text-green-800">
          <strong>Data Analytics:</strong> Charts and analytics are now synchronized with the canonical project data 
          from the Project List tab and update in real-time when global filters are applied. 
          All analytics reflect current values for Approved Budget, Appropriation, Obligation, Disbursement, Status, and Dates.
        </p>
      </div>
    </div>
  );
}