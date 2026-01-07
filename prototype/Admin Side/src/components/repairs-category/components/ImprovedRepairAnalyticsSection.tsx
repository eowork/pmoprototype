import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { TrendingUp, Filter } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { RepairProject } from '../types/RepairTypes';
import { Button } from '../../ui/button';

interface ImprovedRepairAnalyticsSectionProps {
  projects: RepairProject[];
  userEmail: string;
  userRole: string;
  onProjectClick?: (project: RepairProject) => void;
  onStatusFilter?: (status: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  'Completed': '#10b981',
  'In Progress': '#3b82f6',
  'Pending': '#f59e0b',
  'Overdue': '#ef4444',
  'On Hold': '#6b7280',
  'Cancelled': '#6b7280',
};

const PRIORITY_COLORS: Record<string, string> = {
  'Critical': '#ef4444',
  'High': '#f59e0b',
  'Medium': '#3b82f6',
  'Low': '#10b981',
};

export function ImprovedRepairAnalyticsSection({ 
  projects, 
  userEmail, 
  userRole, 
  onProjectClick, 
  onStatusFilter 
}: ImprovedRepairAnalyticsSectionProps) {
  const [campusFilter, setCampusFilter] = useState<string>('all');

  // Filter projects by campus
  const filteredProjects = useMemo(() => {
    if (campusFilter === 'all') return projects;
    return projects.filter(p => {
      if (campusFilter === 'main') return p.campus === 'CSU Main' || p.campus === 'Main Campus';
      if (campusFilter === 'cabadbaran') return p.campus === 'CSU CC' || p.campus === 'Cabadbaran Campus';
      return true;
    });
  }, [projects, campusFilter]);

  // Status Distribution
  const statusDistribution = useMemo(() => {
    const statusMap: Record<string, number> = {};
    filteredProjects.forEach(p => {
      statusMap[p.status] = (statusMap[p.status] || 0) + 1;
    });
    return Object.entries(statusMap).map(([name, value]) => ({
      name,
      value,
      fill: STATUS_COLORS[name] || '#6b7280'
    }));
  }, [filteredProjects]);

  // Priority Distribution
  const priorityDistribution = useMemo(() => {
    const priorityMap: Record<string, number> = {};
    filteredProjects.forEach(p => {
      priorityMap[p.priority] = (priorityMap[p.priority] || 0) + 1;
    });
    return Object.entries(priorityMap).map(([name, value]) => ({
      name,
      value,
      fill: PRIORITY_COLORS[name] || '#6b7280'
    }));
  }, [filteredProjects]);

  // Campus Comparison Data
  const campusComparison = useMemo(() => {
    const mainProjects = projects.filter(p => p.campus === 'CSU Main' || p.campus === 'Main Campus');
    const cabadbaranProjects = projects.filter(p => p.campus === 'CSU CC' || p.campus === 'Cabadbaran Campus');

    return [
      {
        campus: 'CSU Main',
        total: mainProjects.length,
        completed: mainProjects.filter(p => p.status === 'Completed').length,
        inProgress: mainProjects.filter(p => p.status === 'In Progress').length,
        pending: mainProjects.filter(p => p.status === 'Pending').length,
        budget: mainProjects.reduce((sum, p) => sum + p.budget, 0) / 1000,
        spent: mainProjects.reduce((sum, p) => sum + p.spent, 0) / 1000,
      },
      {
        campus: 'CSU CC',
        total: cabadbaranProjects.length,
        completed: cabadbaranProjects.filter(p => p.status === 'Completed').length,
        inProgress: cabadbaranProjects.filter(p => p.status === 'In Progress').length,
        pending: cabadbaranProjects.filter(p => p.status === 'Pending').length,
        budget: cabadbaranProjects.reduce((sum, p) => sum + p.budget, 0) / 1000,
        spent: cabadbaranProjects.reduce((sum, p) => sum + p.spent, 0) / 1000,
      }
    ];
  }, [projects]);

  // Repair Type Distribution
  const repairTypeDistribution = useMemo(() => {
    const typeMap: Record<string, number> = {};
    filteredProjects.forEach(p => {
      typeMap[p.repairType] = (typeMap[p.repairType] || 0) + 1;
    });
    return Object.entries(typeMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [filteredProjects]);

  // Budget Utilization Trend
  const budgetUtilizationData = useMemo(() => {
    const mainProjects = projects.filter(p => p.campus === 'CSU Main' || p.campus === 'Main Campus');
    const cabadbaranProjects = projects.filter(p => p.campus === 'CSU CC' || p.campus === 'Cabadbaran Campus');

    const mainBudget = mainProjects.reduce((sum, p) => sum + p.budget, 0);
    const mainSpent = mainProjects.reduce((sum, p) => sum + p.spent, 0);
    const cabBudget = cabadbaranProjects.reduce((sum, p) => sum + p.budget, 0);
    const cabSpent = cabadbaranProjects.reduce((sum, p) => sum + p.spent, 0);

    return [
      {
        campus: 'CSU Main',
        utilization: mainBudget > 0 ? (mainSpent / mainBudget) * 100 : 0,
      },
      {
        campus: 'CSU CC',
        utilization: cabBudget > 0 ? (cabSpent / cabBudget) * 100 : 0,
      }
    ];
  }, [projects]);

  const handlePieClick = (data: any, type: 'status' | 'priority') => {
    if (type === 'status' && onStatusFilter) {
      onStatusFilter(data.name);
    }
  };

  return (
    <div className="space-y-6">
      {/* Campus Filter */}
      <Card className="border border-gray-200 bg-white shadow-sm">
        <CardContent className="pt-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-600">Filter by Campus:</span>
            </div>
            <Select value={campusFilter} onValueChange={setCampusFilter}>
              <SelectTrigger className="w-[200px] border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Campuses</SelectItem>
                <SelectItem value="main">CSU Main Campus</SelectItem>
                <SelectItem value="cabadbaran">CSU Cabadbaran Campus</SelectItem>
              </SelectContent>
            </Select>
            {campusFilter !== 'all' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCampusFilter('all')}
                className="text-gray-600 hover:text-gray-900"
              >
                Clear Filter
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card className="border border-gray-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900">Status Distribution</CardTitle>
            <CardDescription className="text-gray-600">
              Current status of repair projects (click to filter)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, value }) => `${name}: ${value}`}
                  onClick={(data) => handlePieClick(data, 'status')}
                  style={{ cursor: 'pointer' }}
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px'
                  }} 
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card className="border border-gray-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900">Priority Distribution</CardTitle>
            <CardDescription className="text-gray-600">
              Repair projects by priority level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={priorityDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, value }) => `${name}: ${value}`}
                  onClick={(data) => handlePieClick(data, 'priority')}
                  style={{ cursor: 'pointer' }}
                >
                  {priorityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px'
                  }} 
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Campus Comparison */}
      <Card className="border border-gray-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">Campus Comparison</CardTitle>
          <CardDescription className="text-gray-600">
            Comparative analysis of repair projects across both campuses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={campusComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="campus" fontSize={12} stroke="#6b7280" />
              <YAxis fontSize={12} stroke="#6b7280" />
              <RechartsTooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px'
                }} 
              />
              <Legend />
              <Bar dataKey="completed" fill="#10b981" name="Completed" />
              <Bar dataKey="inProgress" fill="#3b82f6" name="In Progress" />
              <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Secondary Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Repair Type Distribution */}
        <Card className="border border-gray-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900">Repair Type Distribution</CardTitle>
            <CardDescription className="text-gray-600">
              Top repair types by project count
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={repairTypeDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" fontSize={12} stroke="#6b7280" />
                <YAxis dataKey="name" type="category" fontSize={12} stroke="#6b7280" width={100} />
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px'
                  }} 
                />
                <Bar dataKey="value" fill="#f59e0b" name="Projects" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Budget Comparison */}
        <Card className="border border-gray-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900">Budget Analysis by Campus</CardTitle>
            <CardDescription className="text-gray-600">
              Financial breakdown across both campuses (in thousands)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={campusComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="campus" fontSize={12} stroke="#6b7280" />
                <YAxis fontSize={12} stroke="#6b7280" />
                <RechartsTooltip 
                  formatter={(value: any) => `₱${value.toLocaleString()}K`}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px'
                  }} 
                />
                <Legend />
                <Bar dataKey="budget" fill="#3b82f6" name="Total Budget" />
                <Bar dataKey="spent" fill="#10b981" name="Amount Spent" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Budget Utilization by Campus */}
      <Card className="border border-gray-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-amber-600" />
            Budget Utilization Rate
          </CardTitle>
          <CardDescription className="text-gray-600">
            Percentage of budget utilized per campus
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={budgetUtilizationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="campus" fontSize={12} stroke="#6b7280" />
              <YAxis fontSize={12} stroke="#6b7280" label={{ value: 'Utilization (%)', angle: -90, position: 'insideLeft' }} />
              <RechartsTooltip 
                formatter={(value: any) => `${value.toFixed(1)}%`}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px'
                }} 
              />
              <Bar dataKey="utilization" fill="#f59e0b" name="Utilization Rate" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
