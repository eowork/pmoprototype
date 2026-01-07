import React from 'react';
import { Card, CardContent } from '../../ui/card';
import { BarChart3, MousePointer } from 'lucide-react';
import { formatPercentage } from '../types/QuarterlyAssessment';

interface PerformanceStatsProps {
  stats: {
    totalIndicators: number;
    onTarget: number;
    belowTarget: number;
    averageAchievement: number;
  };
  className?: string;
  onRedirectToDataCollection?: () => void;
}

export function PerformanceStats({ stats, className = "", onRedirectToDataCollection }: PerformanceStatsProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${className}`}>
      <Card 
        className="bg-gradient-to-br from-white to-purple-50 border border-purple-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        onClick={onRedirectToDataCollection}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium mb-1">Average Achievement Rate</p>
              <p className="text-2xl font-bold text-purple-600">{formatPercentage(stats.averageAchievement)}</p>
              <p className="text-xs text-purple-500 mt-1">Overall performance indicator</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              <MousePointer className="h-4 w-4 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card 
        className="bg-gradient-to-br from-white to-blue-50 border border-blue-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        onClick={onRedirectToDataCollection}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium mb-1">Data Collection Records</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalIndicators}</p>
              <p className="text-xs text-blue-500 mt-1">Click to view detailed collection</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <MousePointer className="h-4 w-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}