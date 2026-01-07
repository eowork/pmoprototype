import React, { useState } from 'react';
import { Card, CardContent } from '../../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { Calendar, MapPin, Building2, Search, X, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '../../ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../ui/collapsible';

interface GeneralFilterProps {
  selectedYear: string;
  onYearChange: (year: string) => void;
  selectedCampus: string;
  onCampusChange: (campus: string) => void;
  selectedCollege?: string;
  onCollegeChange?: (college: string) => void;
  searchTerm: string;
  onSearchChange: (search: string) => void;
  onClearFilters: () => void;
  colleges?: Array<{ code: string; name: string }>;
  showCollegeFilter?: boolean;
  campuses?: string[];
  defaultOpen?: boolean;
}

export function GeneralFilter({
  selectedYear,
  onYearChange,
  selectedCampus,
  onCampusChange,
  selectedCollege,
  onCollegeChange,
  searchTerm,
  onSearchChange,
  onClearFilters,
  colleges = [],
  showCollegeFilter = false,
  campuses = ['CSU Main Campus', 'CSU Cabadbaran Campus'],
  defaultOpen = true
}: GeneralFilterProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  const activeFiltersCount = [
    selectedYear !== '2024',
    selectedCampus !== 'all',
    selectedCollege && selectedCollege !== 'all',
    searchTerm !== ''
  ].filter(Boolean).length;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            {/* Filter Header - Always Visible */}
            <div className="flex items-center justify-between">
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 hover:bg-slate-50 -ml-2 px-2"
                >
                  <Filter className="h-4 w-4 text-slate-500" />
                  <h3 className="text-sm text-slate-700">Filters</h3>
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {activeFiltersCount} active
                    </Badge>
                  )}
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                  )}
                </Button>
              </CollapsibleTrigger>
              
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearFilters}
                  className="h-8 text-xs text-slate-600 hover:text-slate-900"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear All
                </Button>
              )}
            </div>

            {/* Filter Controls - Collapsible */}
            <CollapsibleContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Year Filter */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-600 flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    Academic Year
                  </label>
                  <Select value={selectedYear} onValueChange={onYearChange}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2023">2023</SelectItem>
                      <SelectItem value="2022">2022</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Campus Filter */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-600 flex items-center gap-1.5">
                    <MapPin className="h-3 w-3" />
                    Campus
                  </label>
                  <Select value={selectedCampus} onValueChange={onCampusChange}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Campuses</SelectItem>
                      {campuses.map(campus => (
                        <SelectItem key={campus} value={campus}>{campus}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* College Filter (Optional) */}
                {showCollegeFilter && onCollegeChange && (
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-600 flex items-center gap-1.5">
                      <Building2 className="h-3 w-3" />
                      College
                    </label>
                    <Select value={selectedCollege} onValueChange={onCollegeChange}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Colleges</SelectItem>
                        {colleges.map(college => (
                          <SelectItem key={college.code} value={college.code}>
                            {college.code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Search Filter */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-600 flex items-center gap-1.5">
                    <Search className="h-3 w-3" />
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      value={searchTerm}
                      onChange={(e) => onSearchChange(e.target.value)}
                      placeholder="Search..."
                      className="h-9 pl-8 text-sm"
                    />
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </div>
        </CardContent>
      </Card>
    </Collapsible>
  );
}
