import React, { useState } from 'react';
import { Button } from '../../../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Download, FileText, Table, Calendar, BarChart3 } from 'lucide-react';
import { MEDailyLog, MERollup } from '../../types/METypes';
import { toast } from 'sonner@2.0.3';

interface ExportToolsProps {
  dailyLogs: MEDailyLog[];
  rollups: MERollup[];
  projectId: string;
}

export function ExportTools({ dailyLogs, rollups, projectId }: ExportToolsProps) {
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');
  const [exportType, setExportType] = useState<'daily' | 'rollup' | 'summary'>('daily');
  const [dateRange, setDateRange] = useState<'all' | 'last30' | 'last7'>('all');

  const filterDataByRange = (logs: MEDailyLog[]) => {
    if (dateRange === 'all') return logs;
    
    const now = new Date();
    const daysBack = dateRange === 'last30' ? 30 : 7;
    const cutoffDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
    
    return logs.filter(log => new Date(log.date) >= cutoffDate);
  };

  const generateCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast.error('No data available for export');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header];
        // Handle arrays and objects
        if (Array.isArray(value)) {
          return `"${value.join('; ')}"`;
        } else if (typeof value === 'object' && value !== null) {
          return `"${JSON.stringify(value)}"`;
        } else {
          return `"${value}"`;
        }
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleExport = () => {
    try {
      let data: any[] = [];
      let filename = '';

      switch (exportType) {
        case 'daily':
          const filteredLogs = filterDataByRange(dailyLogs);
          data = filteredLogs.map(log => ({
            Date: log.date,
            'Physical Progress (%)': log.physicalProgress,
            'Financial Progress (%)': log.financialProgress,
            'Accomplishments': log.accomplishments.join('; '),
            'Issues': log.issues.join('; '),
            'Weather': log.weather,
            'Labor Count': log.laborCount,
            'Equipment Status': log.equipmentStatus,
            'Notes': log.notes || '',
            'Created By': log.createdBy
          }));
          filename = `daily-logs-${projectId}-${dateRange}.csv`;
          break;

        case 'rollup':
          data = rollups.map(rollup => ({
            Period: rollup.period,
            'Start Date': rollup.startDate,
            'End Date': rollup.endDate,
            'Avg Physical Progress (%)': rollup.avgPhysicalProgress.toFixed(2),
            'Avg Financial Progress (%)': rollup.avgFinancialProgress.toFixed(2),
            'Total Accomplishments': rollup.totalAccomplishments,
            'Total Issues': rollup.totalIssues,
            'Variance (%)': rollup.variance.toFixed(2),
            'On-Time Performance (%)': rollup.kpis.onTimePerformance,
            'Budget Efficiency (%)': rollup.kpis.budgetEfficiency,
            'Quality Score (%)': rollup.kpis.qualityScore,
            'Generated At': rollup.generatedAt
          }));
          filename = `rollup-reports-${projectId}.csv`;
          break;

        case 'summary':
          // Generate a summary report
          const totalLogs = dailyLogs.length;
          const avgPhysical = totalLogs > 0 ? dailyLogs.reduce((sum, log) => sum + log.physicalProgress, 0) / totalLogs : 0;
          const avgFinancial = totalLogs > 0 ? dailyLogs.reduce((sum, log) => sum + log.financialProgress, 0) / totalLogs : 0;
          const totalAccomplishments = dailyLogs.reduce((sum, log) => sum + log.accomplishments.length, 0);
          const totalIssues = dailyLogs.reduce((sum, log) => sum + log.issues.length, 0);
          
          data = [{
            'Project ID': projectId,
            'Report Generated': new Date().toISOString(),
            'Total Daily Logs': totalLogs,
            'Avg Physical Progress (%)': avgPhysical.toFixed(2),
            'Avg Financial Progress (%)': avgFinancial.toFixed(2),
            'Overall Variance (%)': (avgPhysical - avgFinancial).toFixed(2),
            'Total Accomplishments': totalAccomplishments,
            'Total Issues': totalIssues,
            'Total Rollup Reports': rollups.length,
            'Date Range': `${dailyLogs[0]?.date || 'N/A'} to ${dailyLogs[dailyLogs.length - 1]?.date || 'N/A'}`
          }];
          filename = `project-summary-${projectId}.csv`;
          break;

        default:
          toast.error('Invalid export type selected');
          return;
      }

      if (exportFormat === 'csv') {
        generateCSV(data, filename);
        toast.success(`${exportType.charAt(0).toUpperCase() + exportType.slice(1)} report exported successfully`);
      } else {
        // PDF export would require a PDF library - for now, show a message
        toast.info('PDF export functionality will be available in a future update');
      }

    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data. Please try again.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export M&E Data
        </CardTitle>
        <CardDescription>
          Export monitoring and evaluation data in various formats
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Export Type</label>
            <Select value={exportType} onValueChange={(value: any) => setExportType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Daily Logs
                  </div>
                </SelectItem>
                <SelectItem value="rollup">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Rollup Reports
                  </div>
                </SelectItem>
                <SelectItem value="summary">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Project Summary
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Date Range</label>
            <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Data</SelectItem>
                <SelectItem value="last30">Last 30 Days</SelectItem>
                <SelectItem value="last7">Last 7 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Format</label>
            <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <Table className="h-4 w-4" />
                    CSV Spreadsheet
                  </div>
                </SelectItem>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    PDF Report
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {exportType === 'daily' && `${filterDataByRange(dailyLogs).length} daily logs available`}
            {exportType === 'rollup' && `${rollups.length} rollup reports available`}
            {exportType === 'summary' && 'Complete project summary'}
          </div>
          
          <Button onClick={handleExport} disabled={dailyLogs.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export {exportFormat.toUpperCase()}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}