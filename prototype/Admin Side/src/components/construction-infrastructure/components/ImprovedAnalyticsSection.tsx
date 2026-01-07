import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { EnhancedStatusDistribution } from './EnhancedStatusDistribution';
import { RevisedIndividualProgress } from './RevisedIndividualProgress';
import { CardBasedTimeline } from './CardBasedTimeline';

interface Project {
  id: string;
  projectTitle: string;
  dateStarted: string;
  targetDateCompletion?: string;
  approvedBudget: number;
  disbursement?: number;
  progressAccomplishment?: number;
  status: string;
  fundingSource: string;
  actualProgress?: number;
  targetProgress?: number;
}

interface ImprovedAnalyticsSectionProps {
  projects: Project[];
  userEmail: string;
  userRole: string;
  onProjectClick?: (project: Project) => void;
  onStatusFilter?: (status: string) => void;
}

export function ImprovedAnalyticsSection({ projects, userEmail, userRole, onProjectClick, onStatusFilter }: ImprovedAnalyticsSectionProps) {
  // Calculate monthly progress trend
  const progressTrendData = useMemo(() => {
    const monthlyData: { [key: string]: { total: number; count: number } } = {};
    
    projects.forEach(project => {
      if (project.dateStarted && project.progressAccomplishment) {
        const date = new Date(project.dateStarted);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { total: 0, count: 0 };
        }
        
        monthlyData[monthKey].total += project.progressAccomplishment;
        monthlyData[monthKey].count += 1;
      }
    });

    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month: formatMonthYear(month),
        avgProgress: data.total / data.count,
        projects: data.count
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6); // Last 6 months
  }, [projects]);

  return (
    <div className="space-y-6">
      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Enhanced Status Distribution */}
        <EnhancedStatusDistribution
          projects={projects}
          onStatusFilter={onStatusFilter}
        />

        {/* Revised Individual Project Progress */}
        <RevisedIndividualProgress
          projects={projects}
          onProjectSelect={onProjectClick}
        />
      </div>

      {/* Card-Based Timeline with RBAC */}
      <CardBasedTimeline
        projects={projects}
        userEmail={userEmail}
        userRole={userRole}
        onProjectClick={onProjectClick}
      />

      {/* Progress Trend Over Time */}
      <Card className="border border-gray-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Average Progress Trend
          </CardTitle>
          <CardDescription className="text-gray-600">
            Monthly average project progress across all projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={progressTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" fontSize={12} stroke="#6b7280" />
              <YAxis 
                label={{ value: 'Avg Progress (%)', angle: -90, position: 'insideLeft' }}
                fontSize={12}
                stroke="#6b7280"
              />
              <RechartsTooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '12px'
                }}
                formatter={(value: any, name: string) => {
                  if (name === 'avgProgress') return [`${value.toFixed(1)}%`, 'Avg Progress'];
                  if (name === 'projects') return [value, 'Projects'];
                  return [value, name];
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="avgProgress" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 5 }}
                activeDot={{ r: 7 }}
                name="Avg Progress"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function
function formatMonthYear(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(date);
}
