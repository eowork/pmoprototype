/**
 * Progress Overview Container - Client UI Match
 * 
 * Matches the exact design from the client reference image:
 * - Financial Performance (left card) with circular progress
 * - Physical Performance (right card) with circular progress  
 * - Project Health Monitor (middle section)
 * - Days Remaining display
 * - Financial Efficiency and Project Velocity cards
 * - Formal, simple, and intuitive design
 */

import React from 'react';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Progress } from '../../../ui/progress';
import { Edit, BarChart3, Calendar, TrendingUp } from 'lucide-react';

interface ProgressOverviewProps {
  // Financial data
  financialPercentage: number;
  targetBudget: number;
  actualSpent: number;
  budgetVariance: number;
  budgetVariancePercent: number;
  
  // Physical data
  physicalPercentage: number;
  targetProgress: number;
  actualProgress: number;
  phasesDone: number;
  totalPhases: number;
  physicalStatus: 'On Track' | 'Minor Delays' | 'Critical Delays';
  
  // Timeline data
  dateStarted?: string;
  targetDateCompletion?: string;
  originalContractDuration?: string;
  
  // Permissions
  canEdit: boolean;
  
  // Handlers
  onEditFinancial?: () => void;
  onEditPhysical?: () => void;
  onEditTimeline?: () => void;
}

export function ProgressOverviewContainer({
  financialPercentage,
  targetBudget,
  actualSpent,
  budgetVariance,
  budgetVariancePercent,
  physicalPercentage,
  targetProgress,
  actualProgress,
  phasesDone,
  totalPhases,
  physicalStatus,
  dateStarted,
  targetDateCompletion,
  originalContractDuration,
  canEdit,
  onEditFinancial,
  onEditPhysical,
  onEditTimeline
}: ProgressOverviewProps) {
  
  // Format currency
  const formatCurrency = (value: number): string => {
    if (value >= 1000000000) {
      return `₱${(value / 1000000000).toFixed(1)}B`;
    }
    if (value >= 1000000) {
      return `₱${(value / 1000000).toFixed(1)}M`;
    }
    return `₱${value.toLocaleString()}`;
  };

  // Calculate days remaining
  const calculateDaysRemaining = (): number => {
    if (!targetDateCompletion) return 0;
    
    const target = new Date(targetDateCompletion);
    const now = new Date();
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const daysRemaining = calculateDaysRemaining();

  // Calculate project health metrics
  const budgetHealth = financialPercentage;
  const physicalHealth = physicalPercentage;
  const scheduleStatus = daysRemaining >= 0 ? 'Active' : 'Delayed';
  const qualityStatus = 'Excellent';

  // Calculate overall progress
  const overallProgress = Math.round((budgetHealth + physicalHealth) / 2);

  // Financial efficiency (example calculation)
  const financialEfficiency = actualSpent > 0 
    ? Math.round((actualSpent / targetBudget) * 100) 
    : 0;

  // Project velocity (example: progress vs time elapsed)
  const calculateVelocity = (): number => {
    if (!dateStarted) return 0;
    const start = new Date(dateStarted);
    const now = new Date();
    const elapsed = Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const totalDays = originalContractDuration ? parseInt(originalContractDuration) : 365;
    const timeProgress = totalDays > 0 ? (elapsed / totalDays) * 100 : 0;
    return timeProgress > 0 ? parseFloat((physicalPercentage / timeProgress).toFixed(1)) : 0;
  };

  const projectVelocity = calculateVelocity();

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusMap = {
      'Good': 'bg-emerald-600 text-white',
      'On Track': 'bg-emerald-600 text-white',
      'Minor Delays': 'bg-yellow-600 text-white',
      'Critical Delays': 'bg-red-600 text-white',
      'Needs Improvement': 'bg-amber-600 text-white'
    };
    return statusMap[status as keyof typeof statusMap] || 'bg-gray-600 text-white';
  };

  // Render circular progress with proper SVG viewBox
  const renderCircularProgress = (percentage: number, color: string, label: string) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative w-32 h-32 mx-auto">
        <svg 
          className="w-32 h-32 transform -rotate-90" 
          viewBox="0 0 128 128"
          preserveAspectRatio="xMidYMid meet"
        >
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-gray-200"
          />
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={color}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold text-gray-900">{percentage.toFixed(1)}%</span>
          <span className="text-xs text-gray-600 mt-1">{label}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col">
      {/* Header */}
      <div className="px-5 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-emerald-600" />
          <h3 className="text-emerald-700 font-medium">Progress Overview</h3>
        </div>
      </div>

      <div className="p-5 space-y-3 flex-1">
        {/* Row 1: Financial & Physical Performance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          
          {/* Financial Performance Card */}
          <div className="group relative bg-gradient-to-br from-emerald-50 to-white rounded-lg p-4 border border-emerald-100">
            {canEdit && onEditFinancial && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onEditFinancial}
                className="absolute top-2 right-2 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-emerald-600 hover:text-white"
                title="Edit Financial Performance"
              >
                <Edit className="w-3.5 h-3.5" />
              </Button>
            )}
            
            <h4 className="text-sm font-medium text-emerald-700 mb-3">Financial Performance</h4>
            
            {renderCircularProgress(financialPercentage, 'text-emerald-600', 'Utilized')}
            
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Target Budget</span>
                <span className="font-medium text-gray-900">{formatCurrency(targetBudget)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Actual Spent</span>
                <span className="font-medium text-gray-900">{formatCurrency(actualSpent)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Variance</span>
                <span className={`font-medium ${budgetVariancePercent >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                  {budgetVariancePercent >= 0 ? '+' : ''}{budgetVariancePercent.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="mt-3 flex justify-center">
              <Badge className={getStatusBadge(budgetVariance >= 0 ? 'Good' : 'Needs Improvement')}>
                {budgetVariance >= 0 ? 'Good' : 'Needs Improvement'}
              </Badge>
            </div>
          </div>

          {/* Physical Performance Card */}
          <div className="group relative bg-gradient-to-br from-blue-50 to-white rounded-lg p-4 border border-blue-100">
            {canEdit && onEditPhysical && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onEditPhysical}
                className="absolute top-2 right-2 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-600 hover:text-white"
                title="Edit Physical Performance"
              >
                <Edit className="w-3.5 h-3.5" />
              </Button>
            )}
            
            <h4 className="text-sm font-medium text-blue-700 mb-3">Physical Performance</h4>
            
            {renderCircularProgress(physicalPercentage, 'text-blue-600', 'Complete')}
            
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Target Progress</span>
                <span className="font-medium text-gray-900">{targetProgress.toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Actual Progress</span>
                <span className="font-medium text-gray-900">{actualProgress.toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Phases Done</span>
                <span className="font-medium text-gray-900">{phasesDone}/{totalPhases}</span>
              </div>
            </div>

            <div className="mt-3 flex justify-center">
              <Badge className={getStatusBadge(physicalStatus)}>
                {physicalStatus}
              </Badge>
            </div>
          </div>
        </div>

        {/* Row 2: Project Health Monitor */}
        <div className="group relative bg-white rounded-lg p-4 border border-gray-200">
          {canEdit && onEditTimeline && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onEditTimeline}
              className="absolute top-2 right-2 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-600 hover:text-white"
              title="Edit Project Health"
            >
              <Edit className="w-3.5 h-3.5" />
            </Button>
          )}

          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900">Project Health Monitor</h4>
            <div className="text-right">
              <div className="text-xl font-semibold text-gray-900">{overallProgress}%</div>
              <div className="text-xs text-gray-600">Overall Progress</div>
            </div>
          </div>

          <Progress value={overallProgress} className="h-2.5 mb-4" />

          {/* Health Metrics Grid */}
          <div className="grid grid-cols-4 gap-3 mb-3">
            <div className="text-center">
              <div className="text-xs text-gray-600 mb-1">Budget</div>
              <div className="font-semibold text-gray-900">{Math.round(budgetHealth)}%</div>
              <div className="text-xs text-gray-500 mt-0.5">
                {budgetHealth >= 70 ? 'Monitor' : budgetHealth >= 50 ? 'Review' : 'Action Required'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-600 mb-1">Physical</div>
              <div className="font-semibold text-gray-900">{Math.round(physicalHealth)}%</div>
              <div className="text-xs text-gray-500 mt-0.5">
                {physicalStatus === 'On Track' ? 'On Track' : physicalStatus === 'Minor Delays' ? 'Minor Delays' : 'Critical'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-600 mb-1">Schedule</div>
              <div className="font-semibold text-gray-900">{scheduleStatus}</div>
              <div className="text-xs text-gray-500 mt-0.5">
                {daysRemaining >= 0 ? 'Normal' : 'Delayed'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-600 mb-1">Quality</div>
              <div className="font-semibold text-gray-900">{qualityStatus}</div>
              <div className="text-xs text-gray-500 mt-0.5">Standards Met</div>
            </div>
          </div>

          {/* Timeline Info */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">Target Completion:</span>
              <span className="font-medium text-gray-900">
                {targetDateCompletion ? new Date(targetDateCompletion).toLocaleDateString() : 'Not set'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">Days Remaining:</span>
              <span className={`font-medium ${daysRemaining < 0 ? 'text-red-700' : 'text-gray-900'}`}>
                {daysRemaining < 0 ? '-' : ''}{Math.abs(daysRemaining)} days
              </span>
            </div>
          </div>
        </div>

        {/* Row 3: Financial Efficiency & Project Velocity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          
          {/* Financial Efficiency */}
          <div className="bg-gradient-to-br from-emerald-50 to-white rounded-lg p-4 border border-emerald-100">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700">Financial Efficiency</span>
            </div>
            
            <div className="text-center mb-2">
              <div className="text-2xl font-semibold text-emerald-700">{financialEfficiency.toFixed(1)}%</div>
            </div>
            
            <Progress value={financialEfficiency} className="h-2 mb-2" />
            
            <div className="flex items-center justify-center gap-1 text-xs">
              <TrendingUp className="w-3 h-3 text-amber-600" />
              <span className="text-amber-700 font-medium">
                {financialEfficiency < 60 ? 'Needs Improvement' : financialEfficiency < 80 ? 'Good Progress' : 'Excellent'}
              </span>
            </div>
          </div>

          {/* Project Velocity */}
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg p-4 border border-blue-100">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Project Velocity</span>
            </div>
            
            <div className="text-center mb-2">
              <div className="text-2xl font-semibold text-blue-700">{projectVelocity.toFixed(1)}x</div>
            </div>
            
            <Progress value={Math.min(projectVelocity * 100, 100)} className="h-2 mb-2" />
            
            <div className="flex items-center justify-center gap-1 text-xs">
              <span className={`font-medium ${projectVelocity >= 1 ? 'text-emerald-700' : 'text-amber-700'}`}>
                {projectVelocity >= 1 ? 'On Track' : 'Monitor Closely'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
