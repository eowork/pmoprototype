import React from 'react';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { cn } from '../../ui/utils';

interface RatingSectionProps {
  title?: string;
  label?: string;
  description?: string;
  value: number;
  onChange: (value: number) => void;
  labels?: string[];
  className?: string;
  showRemarks?: boolean;
  remarksValue?: string;
  onRemarksChange?: (value: string) => void;
}

// Alternative interface for backward compatibility
interface RatingSectionCriteriaProps {
  title: string;
  description?: string;
  criteria: Array<{
    key: string;
    label: string;
    description?: string;
    value: number;
  }>;
  onRatingChange: (key: string, value: number) => void;
  className?: string;
}

// Component that handles both usage patterns
export function RatingSection(props: RatingSectionProps | RatingSectionCriteriaProps) {
  const getRatingLabel = (rating: number, customLabels?: string[]) => {
    if (customLabels && customLabels.length >= 5) {
      return customLabels[rating - 1] || '';
    }
    
    switch (rating) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return '';
    }
  };

  const getRatingColor = (rating: number, currentValue: number) => {
    if (currentValue !== rating) return 'outline';
    
    switch (rating) {
      case 1: return 'destructive';
      case 2: return 'outline';
      case 3: return 'secondary';
      case 4: return 'default';
      case 5: return 'default';
      default: return 'outline';
    }
  };

  // Check if this is the criteria-based usage
  if ('criteria' in props) {
    return (
      <div className={cn("space-y-6", props.className)}>
        <div className="border-b border-slate-200 pb-4">
          <h3 className="font-semibold text-slate-900">{props.title}</h3>
          {props.description && (
            <p className="text-sm text-slate-600 mt-2">{props.description}</p>
          )}
        </div>

        <div className="space-y-8">
          {props.criteria.map((criterion) => (
            <div key={criterion.key} className="bg-slate-50 rounded-lg p-6 space-y-4">
              <div>
                <Label className="font-medium text-slate-900">
                  {criterion.label}
                </Label>
                {criterion.description && (
                  <p className="text-sm text-slate-600 mt-1">{criterion.description}</p>
                )}
              </div>

              {/* Rating Scale */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Poor</span>
                  <span>Fair</span>
                  <span>Good</span>
                  <span>Very Good</span>
                  <span>Excellent</span>
                </div>
                
                <div className="grid grid-cols-5 gap-3">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Button
                      key={rating}
                      type="button"
                      variant={getRatingColor(rating, criterion.value)}
                      size="lg"
                      onClick={() => props.onRatingChange(criterion.key, rating)}
                      className={cn(
                        "h-16 flex flex-col items-center justify-center space-y-1 relative",
                        criterion.value === rating && "ring-2 ring-blue-500 ring-offset-2"
                      )}
                    >
                      <span className="text-xl font-semibold">{rating}</span>
                      <span className="text-xs">{getRatingLabel(rating)}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Selected Rating Display */}
              <div className="text-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  Selected: {criterion.value} - {getRatingLabel(criterion.value)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Simple single rating usage with optional remarks
  const displayTitle = props.title || props.label;
  
  return (
    <div className={cn("bg-slate-50 rounded-lg p-6 space-y-4", props.className)}>
      <div>
        <Label className="font-medium text-slate-900">
          {displayTitle}
        </Label>
        {props.description && (
          <p className="text-sm text-slate-600 mt-1">{props.description}</p>
        )}
      </div>

      {/* Rating Scale */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500">
          {props.labels ? (
            props.labels.map((label, index) => (
              <span key={index} className="text-center flex-1">{label}</span>
            ))
          ) : (
            <>
              <span>Poor</span>
              <span>Fair</span>
              <span>Good</span>
              <span>Very Good</span>
              <span>Excellent</span>
            </>
          )}
        </div>
        
        <div className="grid grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map((rating) => (
            <Button
              key={rating}
              type="button"
              variant={getRatingColor(rating, props.value)}
              size="lg"
              onClick={() => props.onChange(rating)}
              className={cn(
                "h-16 flex flex-col items-center justify-center space-y-1 relative transition-all duration-200",
                props.value === rating && "ring-2 ring-blue-500 ring-offset-2 scale-105"
              )}
            >
              <span className="text-xl font-semibold">{rating}</span>
              <span className="text-xs">{getRatingLabel(rating, props.labels)}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Selected Rating Display */}
      <div className="text-center">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          Selected: {props.value} - {getRatingLabel(props.value, props.labels)}
        </span>
      </div>

      {/* Remarks Field (Optional) */}
      {props.showRemarks && (
        <div className="pt-2">
          <Label className="text-sm text-slate-700 mb-2">Remarks / Observations</Label>
          <Textarea
            value={props.remarksValue || ''}
            onChange={(e) => props.onRemarksChange?.(e.target.value)}
            placeholder="Optional remarks or specific observations..."
            rows={3}
            className="mt-2"
          />
        </div>
      )}
    </div>
  );
}

export default RatingSection;