import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import { Target, TrendingUp, TrendingDown, Minus, Search, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatDate } from '../utils/analyticsHelpers';

interface Project {
  id: string;
  projectTitle: string;
  dateStarted: string;
  targetDateCompletion?: string;
  approvedBudget: number;
  disbursement?: number;
  progressAccomplishment?: number;
  status: string;
}

interface RevisedIndividualProgressProps {
  projects: Project[];
  onProjectSelect?: (project: Project) => void;
}

export function RevisedIndividualProgress({ projects, onProjectSelect }: RevisedIndividualProgressProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || '');

  // Filter projects
  const filteredProjects = projects.filter(p =>
    p.projectTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get selected project
  const selectedProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  if (!selectedProject) {
    return (
      <Card className="border border-gray-200 bg-white shadow-sm">
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-gray-500">No projects available</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate time-based target
  const calculateTimeProgress = (start: string, end?: string): number => {
    if (!end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const now = new Date();
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsed = now.getTime() - startDate.getTime();
    if (totalDuration <= 0) return 100;
    return Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
  };

  const timeBasedTarget = calculateTimeProgress(selectedProject.dateStarted, selectedProject.targetDateCompletion);
  const physicalActual = selectedProject.progressAccomplishment || 0;
  const physicalVariance = physicalActual - timeBasedTarget;

  // Calculate financial accomplishment (percentage of budget disbursed)
  const financialTarget = timeBasedTarget; // Expected disbursement based on timeline
  const financialActual = selectedProject.disbursement && selectedProject.approvedBudget 
    ? (selectedProject.disbursement / selectedProject.approvedBudget) * 100 
    : 0;
  const financialVariance = financialActual - financialTarget;

  // Prepare chart data
  const comparisonData = [
    {
      category: 'Physical',
      Target: timeBasedTarget,
      Actual: physicalActual,
      targetFill: '#94a3b8',
      actualFill: physicalActual >= timeBasedTarget ? '#3b82f6' : '#ef4444'
    },
    {
      category: 'Financial',
      Target: financialTarget,
      Actual: financialActual,
      targetFill: '#94a3b8',
      actualFill: financialActual >= financialTarget ? '#10b981' : '#f59e0b'
    }
  ];

  return (
    <Card className="border border-gray-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-gray-900 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Individual Project Progress Analysis
        </CardTitle>
        <CardDescription className="text-gray-600">
          Physical and financial accomplishment comparison
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Project Selector */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 border-gray-200"
            />
          </div>
          
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger className="w-full border-gray-200">
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {filteredProjects.length === 0 ? (
                <div className="px-2 py-6 text-center text-sm text-gray-500">
                  No projects found
                </div>
              ) : (
                filteredProjects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    <div className="flex items-center justify-between gap-2 w-full">
                      <span className="truncate">{project.projectTitle}</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {project.status}
                      </Badge>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Project Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">{selectedProject.projectTitle}</h3>
          <div className="flex items-center gap-3 text-xs text-gray-600">
            <Badge variant="outline" className={getStatusColor(selectedProject.status)}>
              {selectedProject.status}
            </Badge>
            <span>{formatDate(selectedProject.dateStarted)}</span>
            {selectedProject.targetDateCompletion && (
              <>
                <span>→</span>
                <span>{formatDate(selectedProject.targetDateCompletion)}</span>
              </>
            )}
          </div>
        </div>

        {/* Comparison Chart */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-4">Target vs Actual Comparison</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={comparisonData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="category" fontSize={12} stroke="#6b7280" />
              <YAxis domain={[0, 100]} fontSize={12} stroke="#6b7280" label={{ value: '%', angle: -90, position: 'insideLeft' }} />
              <RechartsTooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '12px'
                }}
                formatter={(value: any) => `${value.toFixed(1)}%`}
              />
              <Bar dataKey="Target" radius={[4, 4, 0, 0]}>
                {comparisonData.map((entry, index) => (
                  <Cell key={`target-${index}`} fill={entry.targetFill} />
                ))}
              </Bar>
              <Bar dataKey="Actual" radius={[4, 4, 0, 0]}>
                {comparisonData.map((entry, index) => (
                  <Cell key={`actual-${index}`} fill={entry.actualFill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Physical Accomplishment Details */}
        <div className="space-y-3 border-t pt-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-500" />
              Physical Accomplishment
            </h4>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-600 mb-1">Time-based Target</div>
              <div className="text-xl font-semibold text-gray-900">{timeBasedTarget.toFixed(1)}%</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-xs text-gray-600 mb-1">Actual Progress</div>
              <div className="text-xl font-semibold text-blue-900">{physicalActual.toFixed(1)}%</div>
            </div>
          </div>

          <div className={`rounded-lg p-3 ${
            physicalVariance >= 0 ? 'bg-blue-50 border border-blue-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Variance</span>
              <div className={`flex items-center gap-1 ${
                physicalVariance >= 0 ? 'text-blue-700' : 'text-red-700'
              }`}>
                {physicalVariance >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span className="font-semibold">{physicalVariance > 0 ? '+' : ''}{physicalVariance.toFixed(1)}%</span>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {Math.abs(physicalVariance) < 5 
                ? 'Progress is on track' 
                : physicalVariance >= 0 
                ? 'Progress is ahead of schedule' 
                : 'Progress is behind schedule'}
            </p>
          </div>

          <div>
            <Progress value={physicalActual} className="h-2" />
          </div>
        </div>

        {/* Financial Accomplishment Details */}
        <div className="space-y-3 border-t pt-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-emerald-500" />
              Financial Accomplishment
            </h4>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-600 mb-1">Expected Utilization</div>
              <div className="text-xl font-semibold text-gray-900">{financialTarget.toFixed(1)}%</div>
            </div>
            <div className="bg-emerald-50 rounded-lg p-3">
              <div className="text-xs text-gray-600 mb-1">Actual Utilization</div>
              <div className="text-xl font-semibold text-emerald-900">{financialActual.toFixed(1)}%</div>
            </div>
          </div>

          <div className={`rounded-lg p-3 ${
            financialVariance >= -5 ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Variance</span>
              <div className={`flex items-center gap-1 ${
                financialVariance >= -5 ? 'text-emerald-700' : 'text-amber-700'
              }`}>
                {financialVariance >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : Math.abs(financialVariance) < 5 ? (
                  <Minus className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span className="font-semibold">{financialVariance > 0 ? '+' : ''}{financialVariance.toFixed(1)}%</span>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {Math.abs(financialVariance) < 5 
                ? 'Budget utilization is on track' 
                : financialVariance >= 0 
                ? 'Higher than expected utilization' 
                : 'Lower than expected utilization'}
            </p>
          </div>

          <div>
            <Progress value={financialActual} className="h-2 bg-gray-200" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getStatusColor(status: string): string {
  const colors: { [key: string]: string } = {
    'Completed': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Ongoing': 'bg-blue-50 text-blue-700 border-blue-200',
    'Planning': 'bg-amber-50 text-amber-700 border-amber-200',
    'Delayed': 'bg-red-50 text-red-700 border-red-200',
    'Suspended': 'bg-orange-50 text-orange-700 border-orange-200',
    'On Hold': 'bg-gray-50 text-gray-700 border-gray-200'
  };
  return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200';
}
