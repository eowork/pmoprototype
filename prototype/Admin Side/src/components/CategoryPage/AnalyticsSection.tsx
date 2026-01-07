import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import {
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ComposedChart,
  ReferenceLine
} from 'recharts';
import { Project } from '../../utils/projectData';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity,
  Target,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface AnalyticsSectionProps {
  statusData: Array<{name: string, value: number, color: string}>;
  budgetVarianceData: Array<{name: string, budget: number, utilized: number, variance: number, progress: number}>;
  projects?: Project[];
  showVarianceComparison?: boolean;
}

export function AnalyticsSection({ 
  statusData, 
  budgetVarianceData, 
  projects = [], 
  showVarianceComparison = false 
}: AnalyticsSectionProps) {
  
  // Enhanced project table data for visualization
  const projectTableData = projects.map(project => {
    const progressValue = (project.physicalAccomplishment / 100) * project.totalContractAmount;
    const variance = project.budgetUtilized - progressValue;
    
    return {
      name: project.projectName.length > 20 
        ? `${project.projectName.substring(0, 20)}...` 
        : project.projectName,
      fullName: project.projectName,
      // Data that matches the project table columns
      contractAmount: project.totalContractAmount / 1000000, // Convert to millions for readability
      progressPercent: project.physicalAccomplishment,
      progressValue: progressValue / 1000000,
      budgetUsed: project.budgetUtilized / 1000000,
      variance: variance / 1000000,
      variancePercent: progressValue > 0 ? (variance / progressValue) * 100 : 0,
      status: project.status,
      powStatus: project.powStatus,
      isOverBudget: variance > 0,
      location: project.location,
      contractor: project.contractor
    };
  }).sort((a, b) => b.contractAmount - a.contractAmount); // Sort by contract amount for better visibility

  // Key metrics that match what users see in the table
  const tableMetrics = {
    totalVariance: projectTableData.reduce((sum, item) => sum + item.variance, 0),
    overBudgetCount: projectTableData.filter(item => item.isOverBudget).length,
    underBudgetCount: projectTableData.filter(item => !item.isOverBudget && item.variance < 0).length,
    onTrackCount: projectTableData.filter(item => Math.abs(item.variance) < 0.1).length
  };

  const formatCurrency = (value: number) => `₱${Math.abs(value).toFixed(1)}M`;
  const formatPercent = (value: number) => `${value.toFixed(1)}%`;

  if (!showVarianceComparison) {
    // Simple layout for non-infrastructure categories
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Status Distribution</CardTitle>
            <CardDescription>Current status of all projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="grid grid-cols-2 gap-2">
                {statusData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget Utilization</CardTitle>
            <CardDescription>Budget allocation vs actual utilization</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={budgetVarianceData.slice(0, 6)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={11}
                />
                <YAxis fontSize={11} />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    formatCurrency(value), 
                    name === 'budget' ? 'Contract Amount' : 'Budget Used'
                  ]}
                />
                <Bar dataKey="budget" fill="#3b82f6" name="budget" />
                <Bar dataKey="utilized" fill="#10b981" name="utilized" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Enhanced infrastructure analytics that mirror the project table
  return (
    <div className="space-y-6">
      {/* Key Metrics Row - Data from Project Table */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Variance</p>
                <p className={`text-xl font-bold ${tableMetrics.totalVariance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {tableMetrics.totalVariance >= 0 ? '+' : ''}{formatCurrency(tableMetrics.totalVariance)}
                </p>
              </div>
              {tableMetrics.totalVariance >= 0 ? (
                <TrendingUp className="w-6 h-6 text-red-500" />
              ) : (
                <TrendingDown className="w-6 h-6 text-green-500" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Over Budget</p>
                <p className="text-xl font-bold text-red-600">{tableMetrics.overBudgetCount}</p>
              </div>
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Under Budget</p>
                <p className="text-xl font-bold text-green-600">{tableMetrics.underBudgetCount}</p>
              </div>
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">On Track</p>
                <p className="text-xl font-bold text-blue-600">{tableMetrics.onTrackCount}</p>
              </div>
              <Target className="w-6 h-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts - Clear Project Table Data Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Table Budget Overview - Matches Table Columns */}
        <Card>
          <CardHeader>
            <CardTitle>Project Budget Overview</CardTitle>
            <CardDescription>
              Contract Amount, Progress Value, and Budget Used - Direct from Project Table
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={projectTableData.slice(0, 8)} margin={{ bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={10}
                />
                <YAxis fontSize={10} label={{ value: 'Amount (₱M)', angle: -90, position: 'insideLeft' }} />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length > 0) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                          <p className="font-medium text-sm mb-2">{data.fullName}</p>
                          <div className="space-y-1 text-xs">
                            <p><span className="font-medium">Contract Amount:</span> {formatCurrency(data.contractAmount)}</p>
                            <p><span className="font-medium">Progress Value:</span> {formatCurrency(data.progressValue)} ({formatPercent(data.progressPercent)})</p>
                            <p><span className="font-medium">Budget Used:</span> {formatCurrency(data.budgetUsed)}</p>
                            <p className={`font-medium ${data.isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                              <span>Variance:</span> {data.variance >= 0 ? '+' : ''}{formatCurrency(data.variance)}
                            </p>
                            <p><span className="font-medium">Location:</span> {data.location}</p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="contractAmount" fill="#3b82f6" name="Contract Amount" />
                <Bar dataKey="progressValue" fill="#10b981" name="Progress Value" />
                <Bar dataKey="budgetUsed" fill="#f59e0b" name="Budget Used" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Variance Analysis - Shows Exact Table Variance Column Data */}
        <Card>
          <CardHeader>
            <CardTitle>Budget Variance Analysis</CardTitle>
            <CardDescription>
              Exact variance data shown in the project table Variance column
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={projectTableData.slice(0, 8)} margin={{ bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={10}
                />
                <YAxis fontSize={10} label={{ value: 'Variance (₱M)', angle: -90, position: 'insideLeft' }} />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length > 0) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                          <p className="font-medium text-sm mb-2">{data.fullName}</p>
                          <div className="space-y-1 text-xs">
                            <p><span className="font-medium">Progress:</span> {formatPercent(data.progressPercent)}</p>
                            <p><span className="font-medium">Expected Value:</span> {formatCurrency(data.progressValue)}</p>
                            <p><span className="font-medium">Budget Used:</span> {formatCurrency(data.budgetUsed)}</p>
                            <p className={`font-medium ${data.isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                              <span>Variance:</span> {data.variance >= 0 ? '+' : ''}{formatCurrency(data.variance)} ({formatPercent(data.variancePercent)})
                            </p>
                            <p><span className="font-medium">Status:</span> {data.isOverBudget ? 'Over Budget' : 'Under Budget'}</p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine y={0} stroke="#666" strokeDasharray="2 2" />
                <Bar 
                  dataKey="variance" 
                  fill={(entry) => entry?.isOverBudget ? '#ef4444' : '#10b981'}
                  name="Budget Variance"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Project Table Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Progress Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Physical Progress Summary</CardTitle>
            <CardDescription>Progress percentages from the project table</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projectTableData.slice(0, 6).map((project, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="font-medium text-sm truncate">{project.name}</p>
                    <p className="text-xs text-muted-foreground">{project.contractor}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24">
                      <Progress value={project.progressPercent} className="h-2" />
                    </div>
                    <span className="text-sm font-medium min-w-12">
                      {formatPercent(project.progressPercent)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contract Amount vs Progress Value */}
        <Card>
          <CardHeader>
            <CardTitle>Contract vs Progress Value</CardTitle>
            <CardDescription>Financial comparison from project table data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projectTableData.slice(0, 6).map((project, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm truncate">{project.name}</p>
                    <Badge variant={project.isOverBudget ? "destructive" : "secondary"}>
                      {project.isOverBudget ? "Over Budget" : "Under Budget"}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Contract</p>
                      <p className="font-medium">{formatCurrency(project.contractAmount)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Progress Value</p>
                      <p className="font-medium">{formatCurrency(project.progressValue)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Variance</p>
                      <p className={`font-medium ${project.isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                        {project.variance >= 0 ? '+' : ''}{formatCurrency(project.variance)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Project Status Distribution</CardTitle>
          <CardDescription>Status breakdown from the project table</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="flex flex-col justify-center">
              <div className="grid grid-cols-2 gap-3">
                {statusData.map((item, index) => (
                  <Badge key={index} variant="outline" className="justify-center py-2">
                    {item.name}: {item.value}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}