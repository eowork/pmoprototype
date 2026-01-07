import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  Building2,
  Wrench,
  Users,
  Calendar
} from 'lucide-react';
import { RepairProject, RepairStats } from '../types/RepairTypes';

interface RepairAnalyticsSectionProps {
  projects: RepairProject[];
  stats: RepairStats;
  campus: string;
}

export function RepairAnalyticsSection({
  projects,
  stats,
  campus
}: RepairAnalyticsSectionProps) {

  // Calculate additional analytics
  const analytics = useMemo(() => {
    const currentDate = new Date();
    
    // Repair type distribution
    const repairTypeStats = projects.reduce((acc, project) => {
      acc[project.repairType] = (acc[project.repairType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Building distribution
    const buildingStats = projects.reduce((acc, project) => {
      acc[project.building] = (acc[project.building] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Priority distribution
    const priorityStats = projects.reduce((acc, project) => {
      acc[project.priority] = (acc[project.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Monthly trend (last 6 months)
    const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().slice(0, 7); // YYYY-MM format
      
      const monthProjects = projects.filter(project => 
        project.createdAt.slice(0, 7) === monthKey
      );

      return {
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        count: monthProjects.length,
        budget: monthProjects.reduce((sum, p) => sum + p.budget, 0)
      };
    }).reverse();

    // Average project duration
    const completedProjects = projects.filter(p => p.status === 'Completed' && p.actualDuration);
    const averageDuration = completedProjects.length > 0 
      ? completedProjects.reduce((sum, p) => sum + (p.actualDuration || 0), 0) / completedProjects.length
      : 0;

    // On-time completion rate
    const onTimeProjects = completedProjects.filter(p => 
      p.actualDuration && p.estimatedDuration && p.actualDuration <= p.estimatedDuration
    );
    const onTimeRate = completedProjects.length > 0 
      ? (onTimeProjects.length / completedProjects.length) * 100 
      : 0;

    // Budget utilization rate
    const budgetUtilization = stats.totalBudget > 0 
      ? (stats.spentBudget / stats.totalBudget) * 100 
      : 0;

    // Emergency repairs count
    const emergencyRepairs = projects.filter(p => p.emergencyRepair).length;

    // Active contractors
    const activeContractors = [...new Set(projects.map(p => p.contractor).filter(Boolean))];

    return {
      repairTypeStats,
      buildingStats,
      priorityStats,
      monthlyTrend,
      averageDuration,
      onTimeRate,
      budgetUtilization,
      emergencyRepairs,
      activeContractors: activeContractors.length
    };
  }, [projects, stats]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold text-green-600">{stats.completionRate.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.completed} of {stats.total} projects
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">On-Time Rate</p>
                <p className="text-2xl font-bold text-blue-600">{analytics.onTimeRate.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Schedule performance
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Budget Utilization</p>
                <p className="text-2xl font-bold text-purple-600">{analytics.budgetUtilization.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(stats.spentBudget)} spent
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Duration</p>
                <p className="text-2xl font-bold text-orange-600">{analytics.averageDuration.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  days per project
                </p>
              </div>
              <Calendar className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Project Status Overview - {campus}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
              <Progress value={(stats.pending / stats.total) * 100} className="mt-2 h-2" />
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
              <Progress value={(stats.inProgress / stats.total) * 100} className="mt-2 h-2" />
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
              <Progress value={(stats.completed / stats.total) * 100} className="mt-2 h-2" />
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
              <div className="text-sm text-muted-foreground">Overdue</div>
              <Progress value={(stats.overdue / stats.total) * 100} className="mt-2 h-2" />
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{analytics.emergencyRepairs}</div>
              <div className="text-sm text-muted-foreground">Emergency</div>
              <Progress value={(analytics.emergencyRepairs / stats.total) * 100} className="mt-2 h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Repair Type Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              Repair Types Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.repairTypeStats)
                .sort(([,a], [,b]) => b - a)
                .map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">{type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{count}</span>
                      <span className="text-xs text-muted-foreground">
                        ({((count / stats.total) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                ))
              }
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Buildings with Most Repairs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.buildingStats)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 8)
                .map(([building, count]) => (
                  <div key={building} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm truncate">{building}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{count}</span>
                      <Badge variant="outline" className="text-xs">
                        {((count / stats.total) * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                ))
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Priority Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Priority Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(analytics.priorityStats)
              .sort(([a], [b]) => {
                const order = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
                return order[a as keyof typeof order] - order[b as keyof typeof order];
              })
              .map(([priority, count]) => {
                const percentage = (count / stats.total) * 100;
                const color = priority === 'Critical' ? 'text-red-600' : 
                             priority === 'High' ? 'text-orange-600' :
                             priority === 'Medium' ? 'text-yellow-600' : 'text-green-600';
                
                return (
                  <div key={priority} className="text-center p-4 border rounded-lg">
                    <div className={`text-2xl font-bold ${color}`}>{count}</div>
                    <div className="text-sm text-muted-foreground">{priority}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {percentage.toFixed(1)}% of total
                    </div>
                  </div>
                );
              })
            }
          </div>
        </CardContent>
      </Card>

      {/* Budget Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Budget Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Budget</span>
                <span className="font-medium">{formatCurrency(stats.totalBudget)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Spent</span>
                <span className="font-medium">{formatCurrency(stats.spentBudget)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Remaining</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(stats.totalBudget - stats.spentBudget)}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground mb-2">Budget Utilization</div>
              <Progress value={analytics.budgetUtilization} className="h-3" />
              <div className="text-xs text-muted-foreground">
                {analytics.budgetUtilization.toFixed(1)}% of budget used
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Average Project Cost</div>
              <div className="text-xl font-bold">
                {formatCurrency(stats.totalBudget / stats.total)}
              </div>
              <div className="text-xs text-muted-foreground">
                per repair project
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resource Utilization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Resource Utilization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{analytics.activeContractors}</div>
              <div className="text-sm text-muted-foreground">Active Contractors</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.inProgress + stats.pending}</div>
              <div className="text-sm text-muted-foreground">Active Projects</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Object.keys(analytics.buildingStats).length}
              </div>
              <div className="text-sm text-muted-foreground">Buildings Served</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {Object.keys(analytics.repairTypeStats).length}
              </div>
              <div className="text-sm text-muted-foreground">Repair Categories</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}