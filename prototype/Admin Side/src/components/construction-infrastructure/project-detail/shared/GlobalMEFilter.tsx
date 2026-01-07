import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Label } from '../../../ui/label';
import { Input } from '../../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../../ui/collapsible';
import { Filter, X, ChevronDown, ChevronUp, Calendar, Settings } from 'lucide-react';
import { formatDate } from '../../utils/analyticsHelpers';
import { MEFilter } from '../../types/METypes';

interface GlobalMEFilterProps {
  projectId: string;
  currentFilter: MEFilter;
  onFilterChange: (filter: MEFilter) => void;
  onClearFilter: () => void;
  compact?: boolean;
  showExport?: boolean;
  onExport?: (format: 'csv' | 'excel' | 'pdf') => void;
}

// Enhanced filter interface for all required filtering options
interface EnhancedFilter extends MEFilter {
  status?: string;
  fundingSource?: string;
  supplierContractor?: string;
}

export function GlobalMEFilter({
  projectId,
  currentFilter,
  onFilterChange,
  onClearFilter,
  compact = false,
  showExport = false,
  onExport
}: GlobalMEFilterProps) {
  
  const [enhancedFilter, setEnhancedFilter] = useState<EnhancedFilter>({
    period: currentFilter.period || 'daily',
    dateRange: currentFilter.dateRange || {
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    },
    status: 'all',
    fundingSource: 'GAA-Funded',
    supplierContractor: ''
  });

  const [isCollapsed, setIsCollapsed] = useState(true); // Start collapsed for less overwhelming UX

  const handlePeriodChange = (period: 'daily' | 'weekly' | 'monthly' | 'quarterly') => {
    const now = new Date();
    let startDate: Date;
    
    // Calculate appropriate date ranges for each period
    switch (period) {
      case 'daily':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // Last 7 days
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 4 * 7 * 24 * 60 * 60 * 1000); // Last 4 weeks
        break;
      case 'monthly':
        startDate = new Date(now.getTime() - 3 * 30 * 24 * 60 * 60 * 1000); // Last 3 months
        break;
      case 'quarterly':
        startDate = new Date(now.getTime() - 12 * 30 * 24 * 60 * 60 * 1000); // Last 12 months
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    
    const updatedFilter = {
      ...enhancedFilter,
      period,
      dateRange: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: now.toISOString().split('T')[0]
      }
    };
    
    setEnhancedFilter(updatedFilter);
    onFilterChange(updatedFilter);
  };

  const handleAdvancedFilterChange = (key: string, value: string) => {
    const updatedFilter = {
      ...enhancedFilter,
      [key]: value
    };
    
    setEnhancedFilter(updatedFilter);
    onFilterChange(updatedFilter);
  };

  const handleDateRangeChange = (field: 'startDate' | 'endDate', date: Date) => {
    const currentDateRange = enhancedFilter.dateRange || {
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    };
    
    const updatedFilter = {
      ...enhancedFilter,
      dateRange: {
        ...currentDateRange,
        [field]: date.toISOString().split('T')[0]
      }
    };
    
    setEnhancedFilter(updatedFilter);
    onFilterChange(updatedFilter);
  };

  const handleClearAllFilters = () => {
    const clearedFilter = {
      period: 'daily' as const,
      dateRange: {
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      },
      status: 'all',
      fundingSource: 'GAA-Funded',
      supplierContractor: ''
    };
    
    setEnhancedFilter(clearedFilter);
    onClearFilter();
  };

  const hasActiveFilters = (enhancedFilter.status && enhancedFilter.status !== 'all') || 
    enhancedFilter.supplierContractor || 
    (enhancedFilter.fundingSource && enhancedFilter.fundingSource !== 'GAA-Funded');

  if (compact) {
    return (
      <div className="flex items-center gap-3 flex-wrap">
        <Label className="text-sm font-medium text-gray-700">Filter:</Label>
        <div className="flex items-center gap-1 bg-gray-100 rounded-md p-1">
          <Button
            variant={enhancedFilter.period === 'daily' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handlePeriodChange('daily')}
            className="px-3 py-1 text-xs"
          >
            Daily
          </Button>
          <Button
            variant={enhancedFilter.period === 'weekly' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handlePeriodChange('weekly')}
            className="px-3 py-1 text-xs"
          >
            Weekly
          </Button>
          <Button
            variant={enhancedFilter.period === 'monthly' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handlePeriodChange('monthly')}
            className="px-3 py-1 text-xs"
          >
            Monthly
          </Button>
          <Button
            variant={enhancedFilter.period === 'quarterly' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handlePeriodChange('quarterly')}
            className="px-3 py-1 text-xs"
          >
            Quarterly
          </Button>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-xs gap-1"
        >
          <Filter className="w-3 h-3" />
          {hasActiveFilters ? 'Filters Active' : 'More Filters'}
          {hasActiveFilters && <Badge variant="secondary" className="ml-1 text-xs">•</Badge>}
        </Button>
        <Button variant="outline" size="sm" onClick={handleClearAllFilters} className="text-xs">
          Clear All
        </Button>
        {showExport && onExport && (
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={() => onExport('csv')} className="text-xs">
              Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => onExport('excel')} className="text-xs">
              Export Excel
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className="border border-gray-200 shadow-sm bg-white">
      <Collapsible open={!isCollapsed} onOpenChange={(open) => setIsCollapsed(!open)}>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-3 cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Filter className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    Global Project Filter
                    {hasActiveFilters && (
                      <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                        Active
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    {isCollapsed 
                      ? `Current: ${enhancedFilter.period} view from ${enhancedFilter.dateRange ? formatDate(enhancedFilter.dateRange.startDate) : 'N/A'} to ${enhancedFilter.dateRange ? formatDate(enhancedFilter.dateRange.endDate) : 'N/A'}`
                      : 'Filter all tabs by date range, status, funding source, and contractor'
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  Project: {projectId}
                </Badge>
                {isCollapsed ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 pb-4">
            <div className="space-y-6">
              
              {/* Quick Period Selection - Always Visible */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-600" />
                  <Label className="text-sm font-medium text-gray-700">
                    Quick Time Period
                  </Label>
                </div>
                <div className="flex items-center gap-1 bg-gray-100 rounded-md p-1 w-fit">
                  <Button
                    variant={enhancedFilter.period === 'daily' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => handlePeriodChange('daily')}
                    className="px-3 py-2 text-sm"
                  >
                    Daily
                  </Button>
                  <Button
                    variant={enhancedFilter.period === 'weekly' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => handlePeriodChange('weekly')}
                    className="px-3 py-2 text-sm"
                  >
                    Weekly
                  </Button>
                  <Button
                    variant={enhancedFilter.period === 'monthly' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => handlePeriodChange('monthly')}
                    className="px-3 py-2 text-sm"
                  >
                    Monthly
                  </Button>
                  <Button
                    variant={enhancedFilter.period === 'quarterly' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => handlePeriodChange('quarterly')}
                    className="px-3 py-2 text-sm"
                  >
                    Quarterly
                  </Button>
                </div>
              </div>

              {/* Advanced Filters Section */}
              <div className="space-y-4 border-t border-gray-200 pt-4">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-gray-600" />
                  <Label className="text-sm font-medium text-gray-700">
                    Advanced Filters
                  </Label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Status Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Status
                    </Label>
                    <Select 
                      value={enhancedFilter.status || 'all'} 
                      onValueChange={(value) => handleAdvancedFilterChange('status', value === 'all' ? '' : value)}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="On Hold">On Hold</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Funding Source Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Funding Source
                    </Label>
                    <Select 
                      value={enhancedFilter.fundingSource || 'GAA-Funded'} 
                      onValueChange={(value) => handleAdvancedFilterChange('fundingSource', value)}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GAA-Funded">GAA-Funded</SelectItem>
                        <SelectItem value="Locally-Funded">Locally-Funded</SelectItem>
                        <SelectItem value="Special Grants">Special Grants</SelectItem>
                        <SelectItem value="Donor-Funded">Donor-Funded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Supplier/Contractor Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Supplier/Contractor
                    </Label>
                    <Input
                      placeholder="Enter contractor name"
                      value={enhancedFilter.supplierContractor || ''}
                      onChange={(e) => handleAdvancedFilterChange('supplierContractor', e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Date Range Section */}
              <div className="space-y-4 border-t border-gray-200 pt-4">
                <Label className="text-sm font-medium text-gray-700">
                  Custom Date Range
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-600">
                      Start Date
                    </Label>
                    <Input
                      type="date"
                      value={enhancedFilter.dateRange?.startDate || ''}
                      onChange={(e) => handleDateRangeChange('startDate', new Date(e.target.value))}
                      className="h-9 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-gray-600">
                      End Date
                    </Label>
                    <Input
                      type="date"
                      value={enhancedFilter.dateRange?.endDate || ''}
                      onChange={(e) => handleDateRangeChange('endDate', new Date(e.target.value))}
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
              </div>
              
              {/* Actions Bar */}
              <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-4 flex-wrap text-sm">
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-blue-900">Period:</span>
                    <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800 border-blue-200">
                      {enhancedFilter.period} View
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-blue-900">Range:</span>
                    <span className="text-blue-800 text-xs">
                      {enhancedFilter.dateRange ? `${formatDate(enhancedFilter.dateRange.startDate)} - ${formatDate(enhancedFilter.dateRange.endDate)}` : 'N/A'}
                    </span>
                  </div>
                  {enhancedFilter.status && enhancedFilter.status !== 'all' && (
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-blue-900">Status:</span>
                      <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800 border-blue-200">
                        {enhancedFilter.status}
                      </Badge>
                    </div>
                  )}
                  {enhancedFilter.supplierContractor && (
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-blue-900">Contractor:</span>
                      <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800 border-blue-200">
                        {enhancedFilter.supplierContractor}
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleClearAllFilters} className="text-xs gap-1 h-8">
                    <X className="w-3 h-3" />
                    Clear All
                  </Button>
                  {showExport && onExport && (
                    <>
                      <Button variant="outline" size="sm" onClick={() => onExport('csv')} className="text-xs h-8">
                        CSV
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => onExport('excel')} className="text-xs h-8">
                        Excel
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => onExport('pdf')} className="text-xs h-8">
                        PDF
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}