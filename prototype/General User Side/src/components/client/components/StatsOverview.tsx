import React from 'react';
import { Card, CardContent } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { 
  TrendingUp, 
  Building2, 
  Users, 
  Award,
  Calendar,
  DollarSign
} from 'lucide-react';

interface StatsOverviewProps {
  data?: any;
  loading?: boolean;
}

export function StatsOverview({ data, loading = false }: StatsOverviewProps) {
  const mockStats = {
    totalProjects: 127,
    activeProjects: 23,
    completedProjects: 94,
    budgetUtilization: 87.3,
    categories: {
      construction: 45,
      operations: 32,
      repairs: 28,
      research: 22
    },
    recentUpdates: [
      { title: 'New Library Construction', status: 'In Progress', date: '2024-03-15' },
      { title: 'Research Lab Renovation', status: 'Completed', date: '2024-03-10' },
      { title: 'Student Dormitory Project', status: 'Planning', date: '2024-03-08' }
    ]
  };

  const stats = data || mockStats;

  const quickStats = [
    {
      title: "Total Projects",
      value: stats.totalProjects,
      change: "+12%",
      changeType: "positive",
      icon: Building2,
      description: "All registered projects in the system"
    },
    {
      title: "Active Projects", 
      value: stats.activeProjects,
      change: "+5%",
      changeType: "positive",
      icon: TrendingUp,
      description: "Currently ongoing projects"
    },
    {
      title: "Completed Projects",
      value: stats.completedProjects,
      change: "+18%", 
      changeType: "positive",
      icon: Award,
      description: "Successfully completed projects"
    },
    {
      title: "Budget Utilization",
      value: `${stats.budgetUtilization}%`,
      change: "+3.2%",
      changeType: "positive", 
      icon: DollarSign,
      description: "Overall budget efficiency"
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1,2,3,4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${
                  index % 2 === 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                }`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <Badge 
                  variant={stat.changeType === 'positive' ? 'default' : 'secondary'}
                  className={stat.changeType === 'positive' ? 'bg-green-100 text-green-700' : ''}
                >
                  {stat.change}
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
                <p className="font-medium text-gray-700 dark:text-gray-300">{stat.title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{stat.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-4">Projects by Category</h3>
            <div className="space-y-3">
              {Object.entries(stats.categories).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300 capitalize">{category}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          category === 'construction' ? 'bg-emerald-500' :
                          category === 'operations' ? 'bg-amber-500' :
                          category === 'repairs' ? 'bg-blue-500' : 'bg-purple-500'
                        }`}
                        style={{ width: `${(count / Math.max(...Object.values(stats.categories))) * 100}%` }}
                      ></div>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-gray-100 w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-4">Recent Updates</h3>
            <div className="space-y-3">
              {stats.recentUpdates.map((update, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-1" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{update.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          update.status === 'Completed' ? 'text-green-700 border-green-200' :
                          update.status === 'In Progress' ? 'text-blue-700 border-blue-200' :
                          'text-gray-700 border-gray-200'
                        }`}
                      >
                        {update.status}
                      </Badge>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{update.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}