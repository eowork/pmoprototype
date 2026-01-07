import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import { Calendar, Filter } from 'lucide-react';
import { YearFilterProps } from '../types';

export function YearFilter({
  selectedYear,
  availableYears,
  onYearChange,
  mode = 'single',
  startYear,
  endYear,
  onRangeChange
}: YearFilterProps) {
  const currentYear = new Date().getFullYear();

  const handleYearSelect = (year: string) => {
    const yearNum = parseInt(year);
    onYearChange(yearNum);
  };

  const handleRangeStart = (year: string) => {
    const yearNum = parseInt(year);
    if (onRangeChange && endYear) {
      onRangeChange(yearNum, endYear);
    }
  };

  const handleRangeEnd = (year: string) => {
    const yearNum = parseInt(year);
    if (onRangeChange && startYear) {
      onRangeChange(startYear, yearNum);
    }
  };

  return (
    <Card className="mb-6 border-slate-200 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-600" />
            <span className="text-sm font-medium text-slate-700">Filter by Year:</span>
          </div>

          {mode === 'single' ? (
            <Select value={selectedYear.toString()} onValueChange={handleYearSelect}>
              <SelectTrigger className="w-32 border-slate-300">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                    {year === currentYear && (
                      <span className="ml-2 text-xs text-green-600">(Current)</span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="flex items-center gap-2">
              <Select value={startYear?.toString() || ''} onValueChange={handleRangeStart}>
                <SelectTrigger className="w-32 border-slate-300">
                  <SelectValue placeholder="From" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-slate-500">to</span>
              <Select value={endYear?.toString() || ''} onValueChange={handleRangeEnd}>
                <SelectTrigger className="w-32 border-slate-300">
                  <SelectValue placeholder="To" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears
                    .filter((year) => !startYear || year >= startYear)
                    .map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Filter className="h-3 w-3" />
            <span>
              {mode === 'single'
                ? `Showing data for ${selectedYear}`
                : `Showing data from ${startYear} to ${endYear}`}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}