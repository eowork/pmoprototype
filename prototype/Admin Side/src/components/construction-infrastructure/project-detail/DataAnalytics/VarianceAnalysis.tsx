import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../ui/card';
import { Badge } from '../../../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/table';
import { Alert, AlertDescription } from '../../../ui/alert';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';
import { ProgressVariance, MERollup } from '../../types/METypes';

interface VarianceAnalysisProps {
  progressVariance: ProgressVariance[];
  rollups: MERollup[];
}

export function VarianceAnalysis({ progressVariance, rollups }: VarianceAnalysisProps) {
  const getVarianceIcon = (variance: number) => {
    if (variance > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (variance < -5) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <CheckCircle className="h-4 w-4 text-blue-500" />;
  };

  const getVarianceBadge = (status: string) => {
    const variants = {
      'ahead': 'default',
      'on-track': 'secondary',
      'behind': 'destructive'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getAlertInfo = () => {
    const behindSchedule = progressVariance.filter(p => p.status === 'behind').length;
    const ahead = progressVariance.filter(p => p.status === 'ahead').length;
    
    if (behindSchedule > 0) {
      return {
        type: 'warning',
        message: `${behindSchedule} period(s) behind schedule. Immediate attention required.`
      };
    } else if (ahead > 0) {
      return {
        type: 'success',
        message: `Project performing well with ${ahead} period(s) ahead of schedule.`
      };
    } else {
      return {
        type: 'info',
        message: 'Project is on track with all periods meeting targets.'
      };
    }
  };

  const alertInfo = getAlertInfo();

  return (
    <div className="space-y-6">
      {/* Summary Alert */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {alertInfo.message}
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {/* Variance Summary Table */}
        <Card>
          <CardHeader>
            <CardTitle>Progress Variance by Period</CardTitle>
            <CardDescription>
              Comparison of planned vs actual progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Planned %</TableHead>
                  <TableHead>Actual %</TableHead>
                  <TableHead>Variance</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {progressVariance.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.period}</TableCell>
                    <TableCell>{item.plannedProgress.toFixed(1)}%</TableCell>
                    <TableCell>{item.actualProgress.toFixed(1)}%</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getVarianceIcon(item.variance)}
                        <span className={item.variance >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {item.variance > 0 ? '+' : ''}{item.variance.toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getVarianceBadge(item.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* KPI Analysis */}
        {rollups.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Performance Indicators</CardTitle>
              <CardDescription>
                Key metrics analysis by period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rollups.map((rollup, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium capitalize">{rollup.period} Period</h4>
                      <Badge variant="outline">
                        {rollup.startDate} - {rollup.endDate}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">On-Time Performance</p>
                        <p className="font-semibold text-lg">{rollup.kpis.onTimePerformance}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Budget Efficiency</p>
                        <p className="font-semibold text-lg">{rollup.kpis.budgetEfficiency}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Quality Score</p>
                        <p className="font-semibold text-lg">{rollup.kpis.qualityScore}%</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t text-sm">
                      <div>
                        <p className="text-muted-foreground">Accomplishments</p>
                        <p className="font-semibold">{rollup.totalAccomplishments} items</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Issues Tracked</p>
                        <p className="font-semibold">{rollup.totalIssues} items</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
          <CardDescription>
            Based on current variance analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {progressVariance.some(p => p.status === 'behind') && (
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800">Address Delays</p>
                  <p className="text-sm text-red-700">
                    Review resource allocation and consider additional manpower or equipment to catch up with schedule.
                  </p>
                </div>
              </div>
            )}
            
            {progressVariance.every(p => p.status !== 'behind') && (
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">On Track</p>
                  <p className="text-sm text-green-700">
                    Project is performing well. Continue current practices and monitor for any potential issues.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium text-blue-800">Continuous Monitoring</p>
                <p className="text-sm text-blue-700">
                  Maintain regular daily logging and weekly reviews to ensure early detection of potential issues.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}