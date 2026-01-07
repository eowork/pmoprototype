import React, { useState } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Calendar as CalendarIcon, X, Filter } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import { Calendar } from '../../ui/calendar';
import { formatDate } from '../utils/analyticsHelpers';

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

export interface DateFilterPreset {
  label: string;
  value: string;
  range: DateRange;
}

interface DateRangeFilterProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  className?: string;
}

export function DateRangeFilter({ dateRange, onDateRangeChange, className = '' }: DateRangeFilterProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>('all');

  // Generate preset date ranges
  const getPresets = (): DateFilterPreset[] => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    return [
      {
        label: 'All Time',
        value: 'all',
        range: { from: undefined, to: undefined }
      },
      {
        label: 'This Month',
        value: 'this-month',
        range: {
          from: new Date(currentYear, currentMonth, 1),
          to: new Date(currentYear, currentMonth + 1, 0)
        }
      },
      {
        label: 'Last 3 Months',
        value: 'last-3-months',
        range: {
          from: new Date(currentYear, currentMonth - 3, 1),
          to: now
        }
      },
      {
        label: 'Last 6 Months',
        value: 'last-6-months',
        range: {
          from: new Date(currentYear, currentMonth - 6, 1),
          to: now
        }
      },
      {
        label: 'This Year',
        value: 'this-year',
        range: {
          from: new Date(currentYear, 0, 1),
          to: new Date(currentYear, 11, 31)
        }
      },
      {
        label: 'Last Year',
        value: 'last-year',
        range: {
          from: new Date(currentYear - 1, 0, 1),
          to: new Date(currentYear - 1, 11, 31)
        }
      },
      {
        label: '2024',
        value: '2024',
        range: {
          from: new Date(2024, 0, 1),
          to: new Date(2024, 11, 31)
        }
      },
      {
        label: '2023',
        value: '2023',
        range: {
          from: new Date(2023, 0, 1),
          to: new Date(2023, 11, 31)
        }
      }
    ];
  };

  const presets = getPresets();

  const handlePresetChange = (value: string) => {
    setSelectedPreset(value);
    const preset = presets.find(p => p.value === value);
    if (preset) {
      onDateRangeChange(preset.range);
    }
  };

  const handleClear = () => {
    setSelectedPreset('all');
    onDateRangeChange({ from: undefined, to: undefined });
  };

  const handleCustomDateChange = (field: 'from' | 'to', date: Date | undefined) => {
    setSelectedPreset('custom');
    onDateRangeChange({
      ...dateRange,
      [field]: date
    });
  };

  const isFiltered = dateRange.from !== undefined || dateRange.to !== undefined;

  return (
    <Card className={`border border-gray-200 bg-white p-4 ${className}`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-2 min-w-[120px]">
          <Filter className="h-4 w-4 text-gray-600" />
          <Label className="text-sm font-medium text-gray-700">Date Filter</Label>
        </div>

        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Preset Selector */}
          <Select value={selectedPreset} onValueChange={handlePresetChange}>
            <SelectTrigger className="w-[180px] border-gray-200 bg-white">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              {presets.map(preset => (
                <SelectItem key={preset.value} value={preset.value}>
                  {preset.label}
                </SelectItem>
              ))}
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>

          {/* Custom Date Pickers */}
          {selectedPreset === 'custom' && (
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className={`w-[140px] justify-start text-left border-gray-200 ${
                      dateRange.from ? 'text-gray-900' : 'text-gray-500'
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? formatDate(dateRange.from.toISOString()) : 'From date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.from}
                    onSelect={(date) => handleCustomDateChange('from', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <span className="text-gray-500">to</span>

              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className={`w-[140px] justify-start text-left border-gray-200 ${
                      dateRange.to ? 'text-gray-900' : 'text-gray-500'
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.to ? formatDate(dateRange.to.toISOString()) : 'To date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.to}
                    onSelect={(date) => handleCustomDateChange('to', date)}
                    initialFocus
                    disabled={(date) => dateRange.from ? date < dateRange.from : false}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Active Filter Display */}
          {isFiltered && selectedPreset !== 'custom' && (
            <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-md">
              <CalendarIcon className="h-3 w-3 text-primary" />
              <span className="text-xs text-primary font-medium">
                {presets.find(p => p.value === selectedPreset)?.label}
              </span>
            </div>
          )}

          {/* Clear Button */}
          {isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-8 px-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {/* Summary */}
        {dateRange.from && dateRange.to && (
          <div className="text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-md">
            {formatDate(dateRange.from.toISOString())} - {formatDate(dateRange.to.toISOString())}
          </div>
        )}
      </div>
    </Card>
  );
}

// Helper function to filter projects by date range
export function filterProjectsByDateRange<T extends { dateStarted: string }>(
  projects: T[],
  dateRange: DateRange
): T[] {
  if (!dateRange.from && !dateRange.to) {
    return projects;
  }

  return projects.filter(project => {
    const projectDate = new Date(project.dateStarted);
    
    if (dateRange.from && projectDate < dateRange.from) {
      return false;
    }
    
    if (dateRange.to && projectDate > dateRange.to) {
      return false;
    }
    
    return true;
  });
}
