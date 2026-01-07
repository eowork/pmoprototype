import React from 'react';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { cn } from '../../ui/utils';

interface RatingCriterionWithRemarks {
  key: string;
  label: string;
  description?: string;
  value: number;
  remarks?: string;
}

interface RatingSectionWithRemarksProps {
  title: string;
  description?: string;
  criteria: RatingCriterionWithRemarks[];
  onRatingChange: (key: string, value: number) => void;
  onRemarksChange: (key: string, value: string) => void;
  className?: string;
}

export function RatingSectionWithRemarks({
  title,
  description,
  criteria,
  onRatingChange,
  onRemarksChange,
  className
}: RatingSectionWithRemarksProps) {
  const getRatingLabel = (rating: number) => {
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

  return (
    <div className={cn("space-y-6", className)}>
      <div className="border-b border-slate-200 pb-4">
        <h3 className="text-base text-slate-900">{title}</h3>
        {description && (
          <p className="text-sm text-slate-600 mt-2">{description}</p>
        )}
      </div>

      <div className="space-y-6">
        {criteria.map((criterion) => (
          <div key={criterion.key} className="bg-slate-50 rounded-lg p-5 space-y-4 border border-slate-200">
            <div>
              <Label className="text-sm text-slate-900">
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
              
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Button
                    key={rating}
                    type="button"
                    variant={getRatingColor(rating, criterion.value)}
                    size="lg"
                    onClick={() => onRatingChange(criterion.key, rating)}
                    className={cn(
                      "h-14 flex flex-col items-center justify-center space-y-1 relative transition-all duration-200",
                      criterion.value === rating && "ring-2 ring-blue-500 ring-offset-2 scale-105"
                    )}
                  >
                    <span className="text-lg">{rating}</span>
                    <span className="text-xs">{getRatingLabel(rating)}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Selected Rating Display */}
            <div className="text-center">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                Selected: {criterion.value} - {getRatingLabel(criterion.value)}
              </span>
            </div>

            {/* Remarks Field */}
            <div className="pt-2">
              <Label className="text-sm text-slate-700 mb-2">Remarks / Observations</Label>
              <Textarea
                value={criterion.remarks || ''}
                onChange={(e) => onRemarksChange(criterion.key, e.target.value)}
                placeholder="Enter specific observations or remarks for this criterion..."
                rows={2}
                className="mt-2 text-sm"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RatingSectionWithRemarks;
