import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { CheckCircle2, AlertCircle, Clock, Pause, FileText } from 'lucide-react';

interface Project {
  id: string;
  status: string;
  approvedBudget: number;
  progressAccomplishment?: number;
}

interface EnhancedStatusDistributionProps {
  projects: Project[];
  onStatusFilter?: (status: string) => void;
}

const STATUS_COLORS: { [key: string]: string } = {
  'Ongoing': '#3b82f6',
  'Completed': '#10b981',
  'Delayed': '#ef4444',
  'Suspended': '#f59e0b',
  'Planning': '#8b5cf6',
  'On Hold': '#f97316'
};

const STATUS_ICONS: { [key: string]: React.ReactNode } = {
  'Ongoing': <Clock className="h-4 w-4" />,
  'Completed': <CheckCircle2 className="h-4 w-4" />,
  'Delayed': <AlertCircle className="h-4 w-4" />,
  'Suspended': <Pause className="h-4 w-4" />,
  'Planning': <FileText className="h-4 w-4" />,
  'On Hold': <Pause className="h-4 w-4" />
};

export function EnhancedStatusDistribution({ projects, onStatusFilter }: EnhancedStatusDistributionProps) {
  // Calculate status distribution with additional metrics
  const statusData = useMemo(() => {
    const statusCounts: { [key: string]: { count: number; budget: number; avgProgress: number } } = {};
    
    projects.forEach(project => {
      const status = project.status || 'Unknown';
      if (!statusCounts[status]) {
        statusCounts[status] = { count: 0, budget: 0, avgProgress: 0 };
      }
      statusCounts[status].count += 1;
      statusCounts[status].budget += project.approvedBudget || 0;
      statusCounts[status].avgProgress += project.progressAccomplishment || 0;
    });

    // Calculate average progress for each status
    Object.keys(statusCounts).forEach(status => {
      if (statusCounts[status].count > 0) {
        statusCounts[status].avgProgress = statusCounts[status].avgProgress / statusCounts[status].count;
      }
    });

    return Object.entries(statusCounts).map(([name, data]) => ({
      name,
      value: data.count,
      budget: data.budget,
      avgProgress: data.avgProgress,
      color: STATUS_COLORS[name] || '#6b7280',
      percentage: (data.count / projects.length) * 100
    })).sort((a, b) => b.value - a.value);
  }, [projects]);

  const totalProjects = projects.length;

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `₱${(amount / 1000000).toFixed(1)}M`;
    }
    return `₱${(amount / 1000).toFixed(0)}K`;
  };

  return (
    <Card className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-gray-900 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          Project Status Distribution
        </CardTitle>
        <CardDescription className="text-gray-600">
          Click any status to filter projects • Current status breakdown
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
            <div className="text-xs text-gray-600 mb-1">Total Projects</div>
            <div className="text-2xl font-semibold text-gray-900">{totalProjects}</div>
          </div>
          <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
            <div className="text-xs text-gray-600 mb-1">Completed</div>
            <div className="text-2xl font-semibold text-gray-900">
              {projects.filter(p => p.status === 'Completed').length}
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
            <div className="text-xs text-gray-600 mb-1">Ongoing</div>
            <div className="text-2xl font-semibold text-gray-900">
              {projects.filter(p => p.status === 'Ongoing').length}
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
            <div className="text-xs text-gray-600 mb-1">Avg Progress</div>
            <div className="text-2xl font-semibold text-gray-900">
              {projects.length > 0 
                ? (projects.reduce((sum, p) => sum + (p.progressAccomplishment || 0), 0) / projects.length).toFixed(1)
                : '0'}%
            </div>
          </div>
        </div>

        {/* Pie Chart - Larger Size */}
        <div className="relative">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={110}
                innerRadius={60}
                paddingAngle={2}
                onClick={(data) => onStatusFilter?.(data.name)}
                style={{ cursor: 'pointer' }}
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '12px'
                }}
                formatter={(value: any, name: string, props: any) => {
                  const data = props.payload;
                  return [
                    <div key="tooltip" className="space-y-1">
                      <div className="font-semibold">{value} projects ({data.percentage.toFixed(1)}%)</div>
                      <div className="text-xs text-gray-600">Budget: {formatCurrency(data.budget)}</div>
                      <div className="text-xs text-gray-600">Avg Progress: {data.avgProgress.toFixed(1)}%</div>
                    </div>,
                    ''
                  ];
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                iconType="circle"
                wrapperStyle={{ paddingTop: '10px' }}
              />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Center Label */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none" style={{ marginTop: '-18px' }}>
            <div className="text-3xl font-bold text-gray-900">{totalProjects}</div>
            <div className="text-xs text-gray-500">Projects</div>
          </div>
        </div>

        {/* Status List with Details */}
        <div className="space-y-2 pt-2 border-t">
          {statusData.map((status) => (
            <div
              key={status.name}
              onClick={() => onStatusFilter?.(status.name)}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border border-gray-100"
            >
              <div className="flex items-center gap-3 flex-1">
                <div 
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${status.color}15` }}
                >
                  <div style={{ color: status.color }}>
                    {STATUS_ICONS[status.name] || <FileText className="h-4 w-4" />}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{status.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {status.value}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {formatCurrency(status.budget)} • {status.avgProgress.toFixed(0)}% avg progress
                  </div>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-sm font-semibold text-gray-900">{status.percentage.toFixed(1)}%</div>
                <div className="text-xs text-gray-500">of total</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
