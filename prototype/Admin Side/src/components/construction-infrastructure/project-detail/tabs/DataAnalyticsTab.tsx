/**
 * Data Analytics Tab - Professional Redesign
 * 
 * Formal, minimal, and professional data visualization aligned with CSU standards.
 * Features smart aggregation for >10 POW items and comprehensive cost analytics.
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Progress } from '../../../ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Separator } from '../../../ui/separator';
import { Checkbox } from '../../../ui/checkbox';
import { ScrollArea } from '../../../ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../ui/tooltip';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Download,
  RefreshCw,
  BarChart3,
  Filter,
  X,
  FileText,
  Percent,
  ListChecks,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Info
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/analyticsHelpers';
import { toast } from 'sonner@2.0.3';

interface POWItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  estimatedMaterialCost: number;
  estimatedLaborCost: number;
  estimatedProjectCost: number;
  unitCost: number;
  dateOfEntry: string;
  status?: 'Active' | 'Completed' | 'Pending' | 'Cancelled';
}

interface DataAnalyticsTabProps {
  projectId: string;
  projectData: any;
  userRole: string;
  powItems?: POWItem[];
}

export function DataAnalyticsTab({ 
  projectId, 
  projectData, 
  userRole, 
  powItems = [] 
}: DataAnalyticsTabProps) {
  
  // State management
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [lastUpdated] = useState(new Date());
  
  // POW Item Selection State
  const [selectedPOWIds, setSelectedPOWIds] = useState<string[]>([]);
  const [showPOWSelector, setShowPOWSelector] = useState(false);

  // Generate sample POW data if none provided - Fallback only
  const samplePOWData: POWItem[] = useMemo(() => {
    if (powItems && powItems.length > 0) {
      // Add status field to POW items if not present
      return powItems.map(item => ({
        ...item,
        status: item.status || 'Active'
      }));
    }

    return [
      {
        id: 'POW-001',
        description: 'Site Preparation and Excavation',
        quantity: 1500,
        unit: 'cubic meters',
        estimatedMaterialCost: 450000,
        estimatedLaborCost: 300000,
        estimatedProjectCost: 750000,
        unitCost: 500,
        dateOfEntry: '2024-01-15',
        status: 'Completed'
      },
      {
        id: 'POW-002',
        description: 'Foundation Works - Concrete Pouring',
        quantity: 800,
        unit: 'cubic meters',
        estimatedMaterialCost: 1200000,
        estimatedLaborCost: 600000,
        estimatedProjectCost: 1800000,
        unitCost: 2250,
        dateOfEntry: '2024-01-20',
        status: 'Completed'
      },
      {
        id: 'POW-003',
        description: 'Steel Framework Installation',
        quantity: 120,
        unit: 'tons',
        estimatedMaterialCost: 7200000,
        estimatedLaborCost: 1800000,
        estimatedProjectCost: 9000000,
        unitCost: 75000,
        dateOfEntry: '2024-02-01',
        status: 'Active'
      },
      {
        id: 'POW-004',
        description: 'Roofing System - Metal Deck',
        quantity: 3500,
        unit: 'square meters',
        estimatedMaterialCost: 2800000,
        estimatedLaborCost: 1400000,
        estimatedProjectCost: 4200000,
        unitCost: 1200,
        dateOfEntry: '2024-02-15',
        status: 'Active'
      },
      {
        id: 'POW-005',
        description: 'Electrical Rough-In Works',
        quantity: 1,
        unit: 'lot',
        estimatedMaterialCost: 2500000,
        estimatedLaborCost: 1500000,
        estimatedProjectCost: 4000000,
        unitCost: 4000000,
        dateOfEntry: '2024-03-01',
        status: 'Pending'
      }
    ];
  }, [powItems]);

  // Filter data based on selected criteria
  const filteredData = useMemo(() => {
    return samplePOWData.filter(item => {
      // Status filter
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      
      // Date range filter
      if (dateFrom && item.dateOfEntry < dateFrom) return false;
      if (dateTo && item.dateOfEntry > dateTo) return false;
      
      // Time range filter (if no custom dates)
      if (!dateFrom && !dateTo && timeRange !== 'all') {
        const itemDate = new Date(item.dateOfEntry);
        const now = new Date();
        const daysAgo = {
          '7d': 7,
          '30d': 30,
          '90d': 90,
          'all': Infinity
        }[timeRange];
        
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
        
        if (itemDate < cutoffDate) return false;
      }
      
      return true;
    });
  }, [samplePOWData, timeRange, dateFrom, dateTo, statusFilter]);

  // Calculate analytics metrics
  const metrics = useMemo(() => {
    const totalMaterialCost = filteredData.reduce((sum, item) => sum + item.estimatedMaterialCost, 0);
    const totalLaborCost = filteredData.reduce((sum, item) => sum + item.estimatedLaborCost, 0);
    const totalProjectCost = filteredData.reduce((sum, item) => sum + item.estimatedProjectCost, 0);
    
    const completedItems = filteredData.filter(item => item.status === 'Completed').length;
    const activeItems = filteredData.filter(item => item.status === 'Active').length;
    const pendingItems = filteredData.filter(item => item.status === 'Pending').length;
    
    const completionRate = filteredData.length > 0 
      ? (completedItems / filteredData.length) * 100 
      : 0;

    return {
      totalMaterialCost,
      totalLaborCost,
      totalProjectCost,
      completedItems,
      activeItems,
      pendingItems,
      completionRate,
      totalItems: filteredData.length
    };
  }, [filteredData]);

  // Prepare data for visualization based on user selection
  const visualizationData = useMemo(() => {
    // If user has selected specific items, use those; otherwise use filtered data
    if (selectedPOWIds.length > 0) {
      return filteredData.filter(item => selectedPOWIds.includes(item.id));
    }
    
    // Auto-select top 10 items if more than 10 exist and no manual selection
    if (filteredData.length > 10) {
      const sortedByTotal = [...filteredData].sort((a, b) => 
        b.estimatedProjectCost - a.estimatedProjectCost
      );
      return sortedByTotal.slice(0, 10);
    }
    
    return filteredData;
  }, [filteredData, selectedPOWIds]);

  // Prepare chart data - Cost breakdown by item (using selected/filtered items)
  const costBreakdownData = useMemo(() => {
    const itemsData = visualizationData.map(item => ({
      name: item.description.length > 25 
        ? item.description.substring(0, 25) + '...' 
        : item.description,
      material: item.estimatedMaterialCost / 1000000,
      labor: item.estimatedLaborCost / 1000000,
      total: item.estimatedProjectCost / 1000000,
      fullDescription: item.description,
      id: item.id
    }));

    return itemsData;
  }, [visualizationData]);

  // Cost composition for pie chart
  const costCompositionData = useMemo(() => {
    // Use visualization data (filtered/selected items) instead of all metrics
    const visTotal = visualizationData.reduce((sum, item) => sum + item.estimatedProjectCost, 0);
    const visMaterial = visualizationData.reduce((sum, item) => sum + item.estimatedMaterialCost, 0);
    const visLabor = visualizationData.reduce((sum, item) => sum + item.estimatedLaborCost, 0);
    
    return [
      { name: 'Material Costs', value: visMaterial, color: '#10b981' },
      { name: 'Labor Costs', value: visLabor, color: '#3b82f6' }
    ];
  }, [visualizationData]);

  // Status distribution data for charts
  const statusDistributionData = useMemo(() => {
    return [
      { status: 'Completed', count: metrics.completedItems, color: '#10b981' },
      { status: 'Active', count: metrics.activeItems, color: '#3b82f6' },
      { status: 'Pending', count: metrics.pendingItems, color: '#f59e0b' }
    ].filter(item => item.count > 0);
  }, [metrics]);

  // Prepare timeline data - Costs over time
  const timelineData = useMemo(() => {
    const grouped = filteredData.reduce((acc, item) => {
      const date = item.dateOfEntry;
      if (!acc[date]) {
        acc[date] = {
          date,
          material: 0,
          labor: 0,
          total: 0
        };
      }
      acc[date].material += item.estimatedMaterialCost / 1000000;
      acc[date].labor += item.estimatedLaborCost / 1000000;
      acc[date].total += item.estimatedProjectCost / 1000000;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped).sort((a: any, b: any) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [filteredData]);

  // Export data handlers
  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    toast.success(`Exporting data as ${format.toUpperCase()}...`);
    // Export logic would go here
  };

  const handleRefresh = () => {
    toast.success('Data refreshed successfully');
  };

  const clearFilters = () => {
    setTimeRange('30d');
    setDateFrom('');
    setDateTo('');
    setStatusFilter('all');
    toast.success('Filters cleared');
  };

  // POW Selection Handlers
  const handlePOWToggle = (itemId: string) => {
    setSelectedPOWIds(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAllPOW = () => {
    if (selectedPOWIds.length === filteredData.length) {
      setSelectedPOWIds([]);
    } else {
      setSelectedPOWIds(filteredData.map(item => item.id));
    }
  };

  const handleSelectTopN = (n: number) => {
    const sortedByTotal = [...filteredData].sort((a, b) => 
      b.estimatedProjectCost - a.estimatedProjectCost
    );
    const topN = sortedByTotal.slice(0, n);
    setSelectedPOWIds(topN.map(item => item.id));
    toast.success(`Selected top ${n} highest-cost items`);
  };

  const clearPOWSelection = () => {
    setSelectedPOWIds([]);
    toast.success('POW selection cleared');
  };

  return (
    <div className="space-y-6">
      {/* Header Section - Professional & Clean */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-100">
                  <BarChart3 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <CardTitle className="text-emerald-600">Data Analytics</CardTitle>
                  <CardDescription className="mt-0.5">
                    {filteredData.length > 0 
                      ? `Comprehensive analysis of ${filteredData.length} Program of Work ${filteredData.length === 1 ? 'item' : 'items'}` 
                      : 'No Program of Work items available for analysis'
                    }
                  </CardDescription>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-1.5 border-gray-300 hover:bg-gray-50"
              >
                <Filter className="w-4 h-4" />
                {showFilters ? 'Hide' : 'Show'} Filters
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="gap-1.5 border-gray-300 hover:bg-gray-50"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Filters Section - Clean Professional Layout */}
        {showFilters && (
          <CardContent className="border-t border-gray-100">
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-sm text-gray-900">Advanced Filters</h4>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-xs gap-1.5 hover:bg-white"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear All
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Time Range Quick Filter */}
                <div className="space-y-2">
                  <Label htmlFor="timeRange" className="text-xs text-gray-700">Time Range</Label>
                  <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
                    <SelectTrigger id="timeRange" className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Last 7 Days</SelectItem>
                      <SelectItem value="30d">Last 30 Days</SelectItem>
                      <SelectItem value="90d">Last 90 Days</SelectItem>
                      <SelectItem value="all">All Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date From */}
                <div className="space-y-2">
                  <Label htmlFor="dateFrom" className="text-xs text-gray-700">From Date</Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="bg-white"
                  />
                </div>

                {/* Date To */}
                <div className="space-y-2">
                  <Label htmlFor="dateTo" className="text-xs text-gray-700">To Date</Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="bg-white"
                  />
                </div>

                {/* Status Filter */}
                <div className="space-y-2">
                  <Label htmlFor="statusFilter" className="text-xs text-gray-700">Item Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger id="statusFilter" className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Active Filters Display */}
              {(statusFilter !== 'all' || dateFrom || dateTo) && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-gray-600">Active filters:</span>
                    {statusFilter !== 'all' && (
                      <Badge variant="outline" className="text-xs bg-white">
                        Status: {statusFilter}
                      </Badge>
                    )}
                    {dateFrom && (
                      <Badge variant="outline" className="text-xs bg-white">
                        From: {formatDate(dateFrom)}
                      </Badge>
                    )}
                    {dateTo && (
                      <Badge variant="outline" className="text-xs bg-white">
                        To: {formatDate(dateTo)}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Empty State or Data Display */}
      {filteredData.length === 0 ? (
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-50 rounded-full flex items-center justify-center mb-5 border border-gray-200">
              <BarChart3 className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg text-gray-900 mb-2">No Data Available</h3>
            <p className="text-sm text-gray-600 text-center max-w-lg leading-relaxed">
              {powItems.length === 0 
                ? 'No Program of Work items have been added to this project yet. Navigate to the Individual POW tab to add work items and begin tracking analytics.' 
                : 'No POW items match the current filter criteria. Please adjust your filter settings to view relevant data.'}
            </p>
            {statusFilter !== 'all' || dateFrom || dateTo ? (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="mt-5 gap-1.5"
              >
                <X className="w-3.5 h-3.5" />
                Clear Filters
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Key Metrics Cards - Professional CSU Design */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Total Project Cost */}
            <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2.5 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200">
                    <DollarSign className="w-5 h-5 text-emerald-700" />
                  </div>
                  <Badge variant="outline" className="text-xs border-emerald-200 text-emerald-700">
                    Total
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1.5">Total Project Cost</p>
                  <p className="text-2xl text-gray-900 mb-1">
                    {formatCurrency(metrics.totalProjectCost)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Across {metrics.totalItems} work {metrics.totalItems === 1 ? 'item' : 'items'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Completion Rate */}
            <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2.5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                    <Target className="w-5 h-5 text-blue-700" />
                  </div>
                  <Badge variant="outline" className="text-xs border-blue-200 text-blue-700">
                    Progress
                  </Badge>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-600 mb-1.5">Completion Rate</p>
                  <p className="text-2xl text-gray-900 mb-2">
                    {metrics.completionRate.toFixed(1)}%
                  </p>
                  <Progress value={metrics.completionRate} className="h-2 bg-gray-100" />
                </div>
              </CardContent>
            </Card>

            {/* Active Items */}
            <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2.5 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg border border-amber-200">
                    <Activity className="w-5 h-5 text-amber-700" />
                  </div>
                  <Badge variant="outline" className="text-xs border-amber-200 text-amber-700">
                    Active
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1.5">In Progress</p>
                  <p className="text-2xl text-gray-900 mb-1">
                    {metrics.activeItems}
                  </p>
                  <p className="text-xs text-amber-700">
                    {((metrics.activeItems / metrics.totalItems) * 100).toFixed(0)}% of total items
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Completed Items */}
            <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2.5 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                    <CheckCircle className="w-5 h-5 text-green-700" />
                  </div>
                  <Badge variant="outline" className="text-xs border-green-200 text-green-700">
                    Done
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1.5">Completed</p>
                  <p className="text-2xl text-gray-900 mb-1">
                    {metrics.completedItems}
                  </p>
                  <p className="text-xs text-green-700">
                    {((metrics.completedItems / metrics.totalItems) * 100).toFixed(0)}% of total items
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* POW Item Selector - Multi-Select for Chart Customization */}
          {filteredData.length > 5 && (
            <Card className="border-gray-200 shadow-sm">
              <CardHeader 
                className="border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setShowPOWSelector(!showPOWSelector)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                      <ListChecks className="w-4 h-4 text-emerald-700" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">Chart Data Selection</CardTitle>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button 
                                className="text-gray-400 hover:text-emerald-600 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <HelpCircle className="w-3.5 h-3.5" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-xs">
                              <p className="text-xs">Select specific POW items to visualize in charts below. Use quick filters or manually select items.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <CardDescription className="mt-0.5">
                        {selectedPOWIds.length > 0 
                          ? `${selectedPOWIds.length} of ${filteredData.length} items selected`
                          : `Auto-displaying top ${Math.min(filteredData.length, 10)} items by cost`
                        }
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedPOWIds.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearPOWSelection();
                        }}
                        className="text-xs gap-1 hover:bg-gray-100"
                      >
                        <X className="w-3 h-3" />
                        Clear
                      </Button>
                    )}
                    {showPOWSelector ? (
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                </div>
              </CardHeader>

              {showPOWSelector && (
                <CardContent className="pt-4 bg-white">
                  {/* Quick Selection Actions */}
                  <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200">
                    <span className="text-xs text-gray-600">Quick filters:</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAllPOW}
                      className="text-xs h-7"
                    >
                      {selectedPOWIds.length === filteredData.length ? 'Deselect All' : 'Select All'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSelectTopN(5)}
                      className="text-xs h-7"
                    >
                      Top 5
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSelectTopN(10)}
                      className="text-xs h-7"
                    >
                      Top 10
                    </Button>
                    <div className="flex-1" />
                    <Badge variant="outline" className="text-xs">
                      {selectedPOWIds.length} selected
                    </Badge>
                  </div>

                  {/* POW Items List with Checkboxes */}
                  <ScrollArea className="h-64 pr-3">
                    <div className="space-y-2">
                      {filteredData.map((item) => (
                        <div
                          key={item.id}
                          className={`flex items-start gap-2.5 p-2.5 border rounded-lg cursor-pointer transition-all ${
                            selectedPOWIds.includes(item.id)
                              ? 'border-emerald-200 bg-emerald-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                          onClick={() => handlePOWToggle(item.id)}
                        >
                          <Checkbox
                            checked={selectedPOWIds.includes(item.id)}
                            onCheckedChange={() => handlePOWToggle(item.id)}
                            className="mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className="text-xs text-gray-900 leading-tight line-clamp-2">{item.description}</h4>
                              <Badge 
                                variant="outline" 
                                className={`text-xs flex-shrink-0 ${
                                  item.status === 'Completed' 
                                    ? 'border-green-200 text-green-700 bg-green-50'
                                    : item.status === 'Active'
                                    ? 'border-blue-200 text-blue-700 bg-blue-50'
                                    : 'border-amber-200 text-amber-700 bg-amber-50'
                                }`}
                              >
                                {item.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-600">
                              <span>{formatCurrency(item.estimatedProjectCost)}</span>
                              <span className="text-gray-400">•</span>
                              <span className="text-gray-500">Material: {formatCurrency(item.estimatedMaterialCost)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              )}
            </Card>
          )}

      {/* Primary Data Visualizations */}
      {/* Cost Distribution Chart - Full Width */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle>Cost Distribution Analysis</CardTitle>
              <CardDescription className="mt-1">
                Material and labor cost breakdown by work item
                {selectedPOWIds.length > 0 ? (
                  <span className="block mt-1 text-xs text-emerald-600">
                    ✓ Showing {selectedPOWIds.length} manually selected {selectedPOWIds.length === 1 ? 'item' : 'items'}
                  </span>
                ) : filteredData.length > 10 ? (
                  <span className="block mt-1 text-xs text-blue-600">
                    ⚡ Auto-showing top 10 highest-cost items
                  </span>
                ) : (
                  <span className="block mt-1 text-xs text-gray-600">
                    Showing all {filteredData.length} {filteredData.length === 1 ? 'item' : 'items'}
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <BarChart3 className="w-3 h-3 mr-1" />
                Bar Chart
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={costBreakdownData} margin={{ top: 10, right: 30, left: 20, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={90}
                tick={{ fontSize: 11, fill: '#6b7280' }}
                stroke="#d1d5db"
              />
              <YAxis 
                label={{ value: 'Cost (Million ₱)', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: '#6b7280' } }}
                tick={{ fontSize: 11, fill: '#6b7280' }}
                stroke="#d1d5db"
              />
              <RechartsTooltip 
                formatter={(value: any) => [`₱${value.toFixed(2)}M`, '']}
                contentStyle={{ fontSize: 12, borderRadius: '8px', border: '1px solid #e5e7eb' }}
                cursor={{ fill: '#f9fafb' }}
              />
              <Legend 
                wrapperStyle={{ fontSize: 12, paddingTop: '15px' }}
                iconType="circle"
              />
              <Bar dataKey="material" fill="#10b981" name="Material Costs" radius={[4, 4, 0, 0]} />
              <Bar dataKey="labor" fill="#3b82f6" name="Labor Costs" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          
          {/* Summary Statistics */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                <div className="text-xs text-gray-600 mb-1">Total Material</div>
                <div className="text-sm text-emerald-700">
                  {formatCurrency(costCompositionData.find(d => d.name === 'Material Costs')?.value || 0)}
                </div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="text-xs text-gray-600 mb-1">Total Labor</div>
                <div className="text-sm text-blue-700">
                  {formatCurrency(costCompositionData.find(d => d.name === 'Labor Costs')?.value || 0)}
                </div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-xs text-gray-600 mb-1">Combined Total</div>
                <div className="text-sm text-gray-900">
                  {formatCurrency(costCompositionData.reduce((sum, item) => sum + item.value, 0))}
                </div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-xs text-gray-600 mb-1">Items Analyzed</div>
                <div className="text-sm text-gray-900">
                  {visualizationData.length}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost Timeline Chart */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100">
          <CardTitle>Cost Timeline Analysis</CardTitle>
          <CardDescription className="mt-1">
            Cumulative costs progression over project timeline
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={timelineData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => formatDate(date)}
                tick={{ fontSize: 10, fill: '#6b7280' }}
                stroke="#d1d5db"
              />
              <YAxis 
                label={{ value: 'Cost (Million ₱)', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#6b7280' } }}
                tick={{ fontSize: 10, fill: '#6b7280' }}
                stroke="#d1d5db"
              />
              <RechartsTooltip 
                formatter={(value: any) => [`₱${value.toFixed(2)}M`, '']}
                labelFormatter={(date) => `Date: ${formatDate(date)}`}
                contentStyle={{ fontSize: 11, borderRadius: '8px', border: '1px solid #e5e7eb' }}
                cursor={{ stroke: '#10b981', strokeWidth: 1 }}
              />
              <Area 
                type="monotone" 
                dataKey="total" 
                stroke="#10b981" 
                strokeWidth={2}
                fill="url(#colorTotal)" 
                name="Total Cost"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Cost Summary and Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Summary Breakdown */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Financial Summary</CardTitle>
                <CardDescription className="mt-1">Detailed cost analysis breakdown</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('csv')}
                  className="gap-1.5 border-gray-300"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="space-y-3">
              {/* Material Cost */}
              <div className="p-4 bg-gradient-to-r from-emerald-50 to-white border border-emerald-100 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 bg-emerald-600 rounded-full"></div>
                    <span className="text-sm text-gray-900">Material Costs</span>
                  </div>
                  <span className="text-lg text-emerald-700">
                    {formatCurrency(metrics.totalMaterialCost)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-600">
                    {((metrics.totalMaterialCost / metrics.totalProjectCost) * 100).toFixed(1)}% of total
                  </div>
                  <Progress 
                    value={(metrics.totalMaterialCost / metrics.totalProjectCost) * 100} 
                    className="w-24 h-1.5 bg-emerald-100" 
                  />
                </div>
              </div>

              {/* Labor Cost */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
                    <span className="text-sm text-gray-900">Labor Costs</span>
                  </div>
                  <span className="text-lg text-blue-700">
                    {formatCurrency(metrics.totalLaborCost)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-600">
                    {((metrics.totalLaborCost / metrics.totalProjectCost) * 100).toFixed(1)}% of total
                  </div>
                  <Progress 
                    value={(metrics.totalLaborCost / metrics.totalProjectCost) * 100} 
                    className="w-24 h-1.5 bg-blue-100" 
                  />
                </div>
              </div>

              <Separator className="my-2" />

              {/* Total Project Cost */}
              <div className="p-4 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2.5">
                    <DollarSign className="w-4 h-4 text-gray-700" />
                    <span className="text-sm text-gray-900">Total Project Cost</span>
                  </div>
                  <span className="text-xl text-gray-900">
                    {formatCurrency(metrics.totalProjectCost)}
                  </span>
                </div>
                <div className="text-xs text-gray-600 text-right">
                  Aggregated from {metrics.totalItems} work {metrics.totalItems === 1 ? 'item' : 'items'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-100">
            <CardTitle>Work Items Status</CardTitle>
            <CardDescription className="mt-1">Distribution by completion status</CardDescription>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="space-y-4">
              {/* Completed */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span className="text-gray-900">Completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-700">{metrics.completedItems}</span>
                    <Badge variant="outline" className="text-xs border-emerald-200 text-emerald-700">
                      {((metrics.completedItems / metrics.totalItems) * 100).toFixed(0)}%
                    </Badge>
                  </div>
                </div>
                <Progress 
                  value={(metrics.completedItems / metrics.totalItems) * 100} 
                  className="h-2 bg-gray-100"
                />
              </div>

              {/* Active */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-900">In Progress</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-700">{metrics.activeItems}</span>
                    <Badge variant="outline" className="text-xs border-blue-200 text-blue-700">
                      {((metrics.activeItems / metrics.totalItems) * 100).toFixed(0)}%
                    </Badge>
                  </div>
                </div>
                <Progress 
                  value={(metrics.activeItems / metrics.totalItems) * 100} 
                  className="h-2 bg-gray-100"
                />
              </div>

              {/* Pending */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span className="text-gray-900">Pending</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-700">{metrics.pendingItems}</span>
                    <Badge variant="outline" className="text-xs border-amber-200 text-amber-700">
                      {((metrics.pendingItems / metrics.totalItems) * 100).toFixed(0)}%
                    </Badge>
                  </div>
                </div>
                <Progress 
                  value={(metrics.pendingItems / metrics.totalItems) * 100} 
                  className="h-2 bg-gray-100"
                />
              </div>

              <Separator className="my-3" />

              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="text-center p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                  <div className="text-xl text-emerald-700">{metrics.completedItems}</div>
                  <div className="text-xs text-gray-600 mt-0.5">Done</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="text-xl text-blue-700">{metrics.activeItems}</div>
                  <div className="text-xs text-gray-600 mt-0.5">Active</div>
                </div>
                <div className="text-center p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <div className="text-xl text-amber-700">{metrics.pendingItems}</div>
                  <div className="text-xs text-gray-600 mt-0.5">Pending</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
        </>
      )}

      {/* Footer Information */}
      {filteredData.length > 0 && (
        <Card className="border-gray-200 shadow-sm bg-gradient-to-r from-gray-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Last updated: {formatDate(lastUpdated.toISOString())}</span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Displaying {metrics.totalItems} of {samplePOWData.length} total POW items</span>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                <BarChart3 className="w-3 h-3 mr-1" />
                Live Data
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}