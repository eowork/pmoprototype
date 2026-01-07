import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { 
  Scale,
  Users, 
  Target,
  DollarSign,
  Download,
  Upload,
  ArrowRight,
  BarChart3,
  TrendingUp,
  CheckCircle,
  Calendar,
  Eye
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { YearFilter } from './components/YearFilter';

interface GADOverviewProps {
  userRole: string;
  userEmail?: string;
  userName?: string;
  onNavigate: (page: string) => void;
  requireAuth: (action: string) => boolean;
}

export function GADOverview({ 
  userRole, 
  userEmail = 'user@carsu.edu.ph',
  userName = 'User',
  onNavigate, 
  requireAuth 
}: GADOverviewProps) {
  const [selectedYear, setSelectedYear] = useState(2024);
  const availableYears = [2020, 2021, 2022, 2023, 2024];
  const canEdit = userRole === 'Admin' || userRole === 'Staff';

  const handleExportData = () => {
    if (!requireAuth('export data')) return;
    toast.success('GAD system data export initiated');
  };

  const handleImportData = () => {
    if (!requireAuth('import data')) return;
    toast.success('GAD system data import dialog opened');
  };

  const categories = [
    {
      id: 'gender-parity-report',
      title: 'Gender Parity Report',
      description: 'Comprehensive gender parity data across students, faculty, staff, PWD, and indigenous populations',
      icon: Users,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
      stats: {
        count: 5,
        label: 'Active Categories',
        detail: 'Students, Faculty, Staff, PWD, Indigenous'
      }
    },
    {
      id: 'gpb-accomplishment',
      title: 'GPB Accomplishments',
      description: 'Gender and Development Plan Budget accomplishments with program implementations',
      icon: Target,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
      stats: {
        count: 8,
        label: 'Total Programs',
        detail: 'Plans and implementations tracking'
      }
    },
    {
      id: 'gad-budget-and-plans',
      title: 'GAD Budget Plans',
      description: 'Strategic budget planning and resource allocation for GAD activities',
      icon: DollarSign,
      iconColor: 'text-green-600',
      iconBg: 'bg-green-50',
      stats: {
        count: '₱1.28M',
        label: 'Total Budget',
        detail: 'Budget allocation and utilization'
      }
    }
  ];

  const systemMetrics = [
    {
      label: 'Total Population',
      value: '2,133',
      icon: Users,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-50'
    },
    {
      label: 'Parity Achievement',
      value: '97.6%',
      icon: TrendingUp,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50'
    },
    {
      label: 'Budget Utilization',
      value: '98.2%',
      icon: CheckCircle,
      iconColor: 'text-green-600',
      iconBg: 'bg-green-50'
    },
    {
      label: 'Active Programs',
      value: '8',
      icon: BarChart3,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50'
    }
  ];

  return (
    <div className="h-full overflow-auto admin-page-bg">
      <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-6">
        {/* Header Section */}
        <div className="admin-card">
          <div className="p-7 space-y-5">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3.5 bg-purple-50 rounded-lg border border-purple-100">
                  <Scale className="h-7 w-7 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h1 className="text-gray-900 mb-2 text-2xl">GAD Parity & Knowledge Management</h1>
                  <p className="text-base text-gray-600 leading-relaxed">
                    Comprehensive gender and development monitoring system
                  </p>
                </div>
              </div>
              {canEdit && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleImportData}
                    className="gap-2 h-9"
                  >
                    <Upload className="h-4 w-4" />
                    <span className="text-sm">Import</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportData}
                    className="gap-2 h-9"
                  >
                    <Download className="h-4 w-4" />
                    <span className="text-sm">Export</span>
                  </Button>
                </div>
              )}
            </div>

            <Separator />

            {/* Year Filter */}
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-500" />
              <YearFilter
                selectedYear={selectedYear}
                availableYears={availableYears}
                onYearChange={setSelectedYear}
              />
            </div>
          </div>
        </div>

        {/* System-Wide Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {systemMetrics.map((metric, index) => (
            <Card key={index} className="admin-card border-0">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 ${metric.iconBg} rounded-lg border border-gray-100`}>
                    <metric.icon className={`h-6 w-6 ${metric.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1 leading-tight">{metric.label}</p>
                    <p className="text-2xl text-gray-900">{metric.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* System Categories */}
        <div className="space-y-6">
          <div className="admin-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-gray-900 text-xl mb-2">System Categories</h2>
                <p className="text-base text-gray-600 leading-relaxed">
                  Explore comprehensive GAD monitoring and evaluation modules
                </p>
              </div>
              <Badge variant="outline" className="text-sm px-3.5 py-1.5 bg-purple-50 border-purple-200 text-purple-700">
                {categories.length} Active
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {categories.map((category, index) => (
              <Card 
                key={category.id} 
                className="admin-card border-0 cursor-pointer group transition-all hover:shadow-lg hover:-translate-y-1 overflow-hidden"
                onClick={() => onNavigate(category.id)}
              >
                <div className={`h-1.5 ${category.iconBg}`} />
                <CardContent className="p-6">
                  <div className="space-y-5">
                    {/* Icon and Title Section */}
                    <div className="flex items-start justify-between gap-3">
                      <div className={`p-3.5 ${category.iconBg} rounded-xl border border-gray-100 group-hover:scale-110 transition-transform duration-300`}>
                        <category.icon className={`h-7 w-7 ${category.iconColor}`} />
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="gap-1.5 opacity-0 group-hover:opacity-100 transition-all h-9 px-3"
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate(category.id);
                        }}
                      >
                        <span className="text-sm">Open</span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Content Section */}
                    <div className="space-y-3">
                      <h3 className="text-gray-900 text-lg leading-tight min-h-[3.5rem] flex items-center">
                        {category.title}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed min-h-[4rem]">
                        {category.description}
                      </p>
                    </div>

                    <Separator />

                    {/* Stats Section */}
                    <div className="space-y-2.5">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl text-gray-900">{category.stats.count}</span>
                        <span className="text-sm text-gray-600">{category.stats.label}</span>
                      </div>
                      <div className={`flex items-center gap-2 text-xs ${category.iconColor} bg-opacity-10 p-2.5 rounded-lg ${category.iconBg}`}>
                        <div className={`h-1.5 w-1.5 rounded-full ${category.iconColor.replace('text-', 'bg-')}`} />
                        <span className="text-gray-700">{category.stats.detail}</span>
                      </div>
                    </div>

                    {/* Hover Action Indicator */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs text-gray-500">Click to view details</span>
                      <ArrowRight className={`h-4 w-4 ${category.iconColor} group-hover:translate-x-1 transition-transform`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Bottom Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Quick Navigation */}
          <Card className="admin-card border-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-gray-900">Quick Navigation</CardTitle>
              <CardDescription className="text-sm mt-1">
                Common tasks and system operations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                size="sm"
                className="w-full justify-start gap-3 h-11"
                onClick={() => onNavigate('gender-parity-report')}
              >
                <Users className="h-5 w-5 text-emerald-600" />
                <span className="text-sm">Gender Parity Data</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="w-full justify-start gap-3 h-11"
                onClick={() => onNavigate('gpb-accomplishment')}
              >
                <Target className="h-5 w-5 text-blue-600" />
                <span className="text-sm">GPB Accomplishments</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="w-full justify-start gap-3 h-11"
                onClick={() => onNavigate('gad-budget-and-plans')}
              >
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="text-sm">Budget Plans</span>
              </Button>
            </CardContent>
          </Card>

          {/* System Information */}
          <Card className="admin-card border-0 bg-gradient-to-br from-purple-50/50 to-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-gray-900">System Information</CardTitle>
              <CardDescription className="text-sm mt-1">
                About this GAD management system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                <p>
                  This system provides unified access to Gender and Development monitoring 
                  and evaluation components at Caraga State University.
                </p>
                <p>
                  Each category includes public-facing analytics for transparency and 
                  administrative tools for authorized personnel.
                </p>
                <Separator />
                <div className="flex items-center gap-2.5 pt-1">
                  <Badge variant="outline" className="text-sm px-3 py-1">
                    Year {selectedYear}
                  </Badge>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-500">Data synchronized</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Collection Notice */}
        {canEdit && (
          <Card className="admin-card border-0 bg-blue-50/50">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-blue-100 rounded-lg">
                  <Eye className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-base text-gray-900 mb-2">Data Collection Access</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    As an authorized user, you have access to data collection and management features. 
                    Navigate to a specific category to begin data entry or review pending submissions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
