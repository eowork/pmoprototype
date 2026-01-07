import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Progress } from '../../ui/progress';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Edit, Search, Filter, SortAsc, SortDesc } from 'lucide-react';

// Generic imports that work for both assessment types
const QUARTERS = [
  { id: 'quarter1', label: '1st Quarter', shortLabel: 'Q1' },
  { id: 'quarter2', label: '2nd Quarter', shortLabel: 'Q2' },
  { id: 'quarter3', label: '3rd Quarter', shortLabel: 'Q3' },
  { id: 'quarter4', label: '4th Quarter', shortLabel: 'Q4' }
] as const;

const formatPercentage = (value: number | null): string => {
  if (value === null || value === undefined || value === 0) return '--';
  return `${value.toFixed(2)}%`;
};

const formatQuarterDisplay = (value: number | null): string => {
  if (value === null || value === undefined || value === 0) return '--';
  return `${value.toFixed(2)}%`;
};

const formatAccomplishmentScore = (score: string): string => {
  if (!score || score.trim() === '') return '--';
  return score;
};

const formatVariance = (variance: number): string => {
  const sign = variance >= 0 ? '+' : '';
  return `${sign}${variance.toFixed(2)}%`;
};

const getVarianceColor = (variance: number): string => {
  if (variance >= 0) return 'text-green-600';
  if (variance >= -5) return 'text-yellow-600';
  return 'text-red-600';
};

const calculateAverage = (quarters: any): number => {
  const validQuarters = [quarters.quarter1, quarters.quarter2, quarters.quarter3, quarters.quarter4]
    .filter((q): q is number => q !== null && q !== undefined && q > 0);
  if (validQuarters.length === 0) return 0;
  return validQuarters.reduce((sum, q) => sum + q, 0) / validQuarters.length;
};

// Calculate quarterly variance for each quarter
const calculateQuarterlyVariance = (target: number | null, actual: number | null): number => {
  if (target === null || actual === null) return 0;
  return actual - target;
};

interface DataCollectionViewsProps {
  assessmentData: any[];
  FIXED_OUTCOME_INDICATORS: any;
  viewMode: 'card' | 'list' | 'table';
  canEdit: boolean;
  canDelete: boolean; // This is deprecated for standardized particulars
  onEdit: (indicator: any) => void;
  onDelete: (indicator: any) => void; // This is deprecated for standardized particulars
  showCriteria?: boolean;
  highlightedParticular?: string;
}

export function DataCollectionViews({ 
  assessmentData, 
  FIXED_OUTCOME_INDICATORS, 
  viewMode, 
  canEdit, 
  canDelete, // Keeping for backward compatibility but not using
  onEdit, 
  onDelete, // Keeping for backward compatibility but not using
  showCriteria = false,
  highlightedParticular
}: DataCollectionViewsProps) {
  
  // Enhanced filtering and sorting state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'particular' | 'target' | 'actual' | 'variance'>('particular');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterVariance, setFilterVariance] = useState<'all' | 'positive' | 'negative'>('all');

  // Enhanced filtering and sorting logic
  const filteredAndSortedData = useMemo(() => {
    let filtered = assessmentData.filter(indicator => {
      const particular = FIXED_OUTCOME_INDICATORS[indicator.id.toUpperCase().replace(/-/g, '_') as keyof typeof FIXED_OUTCOME_INDICATORS]?.shortName || indicator.particular;
      const matchesSearch = particular.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           indicator.uacsCode.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesVarianceFilter = true;
      if (filterVariance !== 'all') {
        const variance = indicator.variance;
        matchesVarianceFilter = filterVariance === 'positive' ? variance >= 0 : variance < 0;
      }

      return matchesSearch && matchesVarianceFilter;
    });

    // Sort the filtered data
    filtered.sort((a, b) => {
      let valueA, valueB;
      
      switch (sortBy) {
        case 'particular':
          valueA = FIXED_OUTCOME_INDICATORS[a.id.toUpperCase().replace(/-/g, '_') as keyof typeof FIXED_OUTCOME_INDICATORS]?.shortName || a.particular;
          valueB = FIXED_OUTCOME_INDICATORS[b.id.toUpperCase().replace(/-/g, '_') as keyof typeof FIXED_OUTCOME_INDICATORS]?.shortName || b.particular;
          break;
        case 'target':
          valueA = calculateAverage(a.physicalTarget);
          valueB = calculateAverage(b.physicalTarget);
          break;
        case 'actual':
          valueA = calculateAverage(a.physicalAccomplishment);
          valueB = calculateAverage(b.physicalAccomplishment);
          break;
        case 'variance':
          valueA = a.variance;
          valueB = b.variance;
          break;
        default:
          return 0;
      }

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortOrder === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
      } else {
        return sortOrder === 'asc' ? (valueA - valueB) : (valueB - valueA);
      }
    });

    return filtered;
  }, [assessmentData, searchTerm, sortBy, sortOrder, filterVariance, FIXED_OUTCOME_INDICATORS]);

  // Enhanced filtering controls
  const renderFilterControls = () => (
    <div className="mb-6 space-y-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by particular or UACS code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-slate-300"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="particular">Particular</SelectItem>
              <SelectItem value="target">Target</SelectItem>
              <SelectItem value="actual">Actual</SelectItem>
              <SelectItem value="variance">Variance</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3"
          >
            {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
          </Button>
          
          <Select value={filterVariance} onValueChange={(value: any) => setFilterVariance(value)}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Variance</SelectItem>
              <SelectItem value="positive">Positive (+)</SelectItem>
              <SelectItem value="negative">Negative (-)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-sm text-slate-600">
        <span>Showing {filteredAndSortedData.length} of {assessmentData.length} indicators</span>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span>Enhanced filtering active</span>
        </div>
      </div>
    </div>
  );
  
  const renderCardView = (indicator: any) => {
    const avgTarget = calculateAverage(indicator.physicalTarget);
    const avgActual = calculateAverage(indicator.physicalAccomplishment);
    const variance = indicator.variance;
    const particular = FIXED_OUTCOME_INDICATORS[indicator.id.toUpperCase().replace(/-/g, '_') as keyof typeof FIXED_OUTCOME_INDICATORS]?.shortName || indicator.particular;
    const isHighlighted = highlightedParticular && particular.toLowerCase().includes(highlightedParticular.toLowerCase());

    return (
      <Card 
        key={indicator.id} 
        className={`hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-slate-50 border h-full shadow-sm ${
          isHighlighted ? 'border-blue-400 ring-2 ring-blue-200' : 'border-slate-300'
        }`}
      >
        <div className={`pb-3 border-b p-4 ${
          isHighlighted ? 'bg-gradient-to-r from-blue-50 to-indigo-100 border-blue-200' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className={`text-lg leading-tight mb-2 font-semibold ${
                isHighlighted ? 'text-blue-900' : 'text-gray-900'
              }`}>
                {particular}
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                {indicator.particular}
                {/* Special handling for the first particular with enumerated criteria */}
                {showCriteria && indicator.id === 'graduate-faculty-research' && (
                  <span className="mt-3 bg-amber-50 p-3 rounded-lg border border-amber-200 block">
                    <span className="font-medium mb-2 text-amber-800 block">Criteria:</span>
                    <ul className="list-disc list-inside space-y-1 ml-2 text-xs text-amber-700">
                      <li>pursuing advanced research degree (Ph.D) or</li>
                      <li>actively pursuing within the last three (3) years (investigative research, basic, and applied scientific research, policy research, social science research) or</li>
                      <li>producing technologies for commercialization or livelihood improvement or</li>
                      <li>whose research work resulted in an extension program</li>
                    </ul>
                  </span>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              {canEdit && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onEdit(indicator)}
                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className="space-y-6 p-6">
          {/* Progress Overview */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-slate-700">Overall Achievement</span>
              <span className="font-semibold text-gray-900">{avgActual > 0 ? formatPercentage(avgActual) : 'No Data'}</span>
            </div>
            <Progress value={avgActual} className="h-3" />
            <div className="flex justify-between text-xs text-slate-600">
              <span>Target: <span className="font-semibold text-blue-600">{formatPercentage(avgTarget)}</span></span>
              <span className={`font-semibold ${getVarianceColor(variance)}`}>
                {avgActual > 0 ? formatVariance(variance) : 'No Data'}
              </span>
            </div>
          </div>

          {/* Enhanced Quarterly Data Table */}
          <div className="overflow-x-auto bg-white rounded-lg border border-slate-200 shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Quarter</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700">Target (%)</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700">Actual (%)</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700">Score</th>
                </tr>
              </thead>
              <tbody>
                {QUARTERS.map((quarter) => {
                  const target = indicator.physicalTarget[quarter.id as keyof typeof indicator.physicalTarget];
                  const actual = indicator.physicalAccomplishment[quarter.id as keyof typeof indicator.physicalAccomplishment];
                  const score = indicator.accomplishmentScore[quarter.id as keyof typeof indicator.accomplishmentScore];
                  
                  return (
                    <tr key={quarter.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-medium text-gray-900">{quarter.label}</td>
                      <td className="text-center py-3 px-4 text-blue-600 font-semibold">{formatQuarterDisplay(target)}</td>
                      <td className="text-center py-3 px-4">
                        {actual !== null ? (
                          <span className={`font-semibold ${actual >= (target || 0) ? 'text-green-600' : 'text-red-600'}`}>
                            {formatQuarterDisplay(actual)}
                          </span>
                        ) : (
                          <span className="text-slate-400">--</span>
                        )}
                      </td>
                      <td className="text-center py-3 px-4 text-slate-600 font-medium bg-slate-50">
                        {formatAccomplishmentScore(score)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Additional Information */}
          <div className="pt-4 border-t border-slate-200 bg-slate-50 rounded-lg p-4">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 font-medium">UACS Code:</span>
                <span className="font-mono text-slate-800 bg-white px-3 py-1 rounded border border-slate-200">{indicator.uacsCode}</span>
              </div>
              {indicator.remarks && (
                <div className="mt-3">
                  <span className="text-sm text-slate-600 font-medium block mb-2">Remarks:</span>
                  <p className="text-sm text-slate-800 bg-white p-3 rounded-md border border-slate-200 leading-relaxed">
                    {indicator.remarks}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  const renderListView = (indicator: any) => {
    const avgTarget = calculateAverage(indicator.physicalTarget);
    const avgActual = calculateAverage(indicator.physicalAccomplishment);
    const variance = indicator.variance;
    const particular = FIXED_OUTCOME_INDICATORS[indicator.id.toUpperCase().replace(/-/g, '_') as keyof typeof FIXED_OUTCOME_INDICATORS]?.shortName || indicator.particular;
    const isHighlighted = highlightedParticular && particular.toLowerCase().includes(highlightedParticular.toLowerCase());

    return (
      <div 
        key={indicator.id} 
        className={`bg-gradient-to-r from-white to-slate-50 border rounded-lg p-6 hover:shadow-md transition-shadow shadow-sm ${
          isHighlighted ? 'border-blue-400 ring-2 ring-blue-200' : 'border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className={`font-semibold text-lg mb-3 ${
              isHighlighted ? 'text-blue-900' : 'text-gray-900'
            }`}>
              {particular}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <span className="text-blue-700 font-medium">Target: </span>
                <span className="font-semibold text-blue-800">{formatPercentage(avgTarget)}</span>
              </div>
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <span className="text-green-700 font-medium">Actual: </span>
                <span className="font-semibold text-green-800">{avgActual > 0 ? formatPercentage(avgActual) : 'No Data'}</span>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                <span className="text-purple-700 font-medium">UACS: </span>
                <span className="font-mono text-purple-800">{indicator.uacsCode}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 ml-4">
            {canEdit && (
              <Button variant="outline" size="sm" onClick={() => onEdit(indicator)} className="hover:bg-blue-50 border-blue-200">
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderTableView = () => {
    return (
      <Card className="bg-white border border-slate-300 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-50 to-gray-100 border-b border-slate-300">
                <tr>
                  <th className="text-left px-6 py-4 font-semibold text-slate-700">Indicator</th>
                  <th className="text-center px-6 py-4 font-semibold text-slate-700">Target</th>
                  <th className="text-center px-6 py-4 font-semibold text-slate-700">Actual</th>
                  <th className="text-center px-6 py-4 font-semibold text-slate-700">UACS Code</th>
                  {canEdit && (
                    <th className="text-center px-6 py-4 font-semibold text-slate-700">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedData.map((indicator, index) => {
                  const avgTarget = calculateAverage(indicator.physicalTarget);
                  const avgActual = calculateAverage(indicator.physicalAccomplishment);
                  const variance = indicator.variance;
                  const particular = FIXED_OUTCOME_INDICATORS[indicator.id.toUpperCase().replace(/-/g, '_') as keyof typeof FIXED_OUTCOME_INDICATORS]?.shortName || indicator.particular;
                  const isHighlighted = highlightedParticular && particular.toLowerCase().includes(highlightedParticular.toLowerCase());

                  return (
                    <tr 
                      key={indicator.id} 
                      className={`border-b border-slate-200 hover:bg-slate-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-slate-25'
                      } ${isHighlighted ? 'bg-blue-50 border-blue-200' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className={`font-semibold ${isHighlighted ? 'text-blue-900' : 'text-gray-900'}`}>
                            {particular}
                          </div>
                          <div className="text-sm text-slate-600 mt-1">{indicator.particular}</div>
                        </div>
                      </td>
                      <td className="text-center px-6 py-4">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-semibold">
                          {formatPercentage(avgTarget)}
                        </span>
                      </td>
                      <td className="text-center px-6 py-4">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded font-semibold">
                          {avgActual > 0 ? formatPercentage(avgActual) : 'No Data'}
                        </span>
                      </td>
                      <td className="text-center px-6 py-4">
                        <span className="font-mono text-sm bg-slate-100 px-2 py-1 rounded border border-slate-200">
                          {indicator.uacsCode}
                        </span>
                      </td>
                      {canEdit && (
                        <td className="text-center px-6 py-4">
                          <div className="flex justify-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => onEdit(indicator)} className="hover:bg-blue-100">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Filter Controls */}
      {renderFilterControls()}

      {/* Content based on view mode */}
      {viewMode === 'card' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAndSortedData.map(indicator => renderCardView(indicator))}
        </div>
      )}

      {viewMode === 'list' && (
        <div className="space-y-4">
          {filteredAndSortedData.map(indicator => renderListView(indicator))}
        </div>
      )}

      {viewMode === 'table' && renderTableView()}

      {/* No results message */}
      {filteredAndSortedData.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          <Search className="h-12 w-12 mx-auto mb-4 text-slate-400" />
          <p className="text-lg font-medium">No indicators found</p>
          <p className="text-sm">Try adjusting your search terms or filters</p>
        </div>
      )}
    </div>
  );
}