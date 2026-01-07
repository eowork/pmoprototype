import React from 'react';
import { Check, Circle } from 'lucide-react';
import { cn } from '../../ui/utils';
import { Progress } from '../../ui/progress';

interface Step {
  id: number;
  title: string;
  description?: string;
  completed?: boolean;
}

interface SimpleAssessmentStepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  className?: string;
}

export function SimpleAssessmentStepper({ 
  steps, 
  currentStep, 
  onStepClick, 
  className 
}: SimpleAssessmentStepperProps) {
  
  const completionPercentage = Math.round((currentStep / steps.length) * 100);

  return (
    <div className={cn("w-full bg-white border border-slate-200 rounded-lg p-5", className)}>
      {/* Progress Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm text-gray-700">Assessment Progress</h3>
          <span className="text-sm text-blue-600">
            Step {currentStep} of {steps.length}
          </span>
        </div>
        <Progress value={completionPercentage} className="h-2" />
        <p className="text-xs text-gray-500 mt-1.5">{completionPercentage}% Complete</p>
      </div>

      {/* Steps List - Minimal and Clean */}
      <div className="space-y-2.5">
        {steps.map((step) => {
          const isActive = currentStep === step.id;
          const isCompleted = step.completed || currentStep > step.id;
          const isClickable = onStepClick && (isCompleted || isActive || currentStep >= step.id - 1);

          return (
            <div 
              key={step.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-md border transition-all",
                isActive 
                  ? "bg-blue-50 border-blue-200" 
                  : isCompleted 
                  ? "bg-emerald-50 border-emerald-200" 
                  : "bg-white border-slate-200",
                isClickable && "cursor-pointer hover:shadow-sm",
                !isClickable && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => isClickable && onStepClick?.(step.id)}
            >
              {/* Step Indicator */}
              <div className={cn(
                "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center border-2 text-sm transition-all",
                isCompleted
                  ? "bg-emerald-500 border-emerald-500 text-white"
                  : isActive
                  ? "bg-blue-500 border-blue-500 text-white"
                  : "bg-white border-slate-300 text-slate-500"
              )}>
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span>{step.id}</span>
                )}
              </div>

              {/* Step Content */}
              <div className="min-w-0 flex-1">
                <h4 className={cn(
                  "text-sm leading-tight",
                  isActive ? "text-blue-700" : isCompleted ? "text-emerald-700" : "text-gray-700"
                )}>
                  {step.title}
                </h4>
                {step.description && (
                  <p className={cn(
                    "text-xs leading-snug mt-0.5",
                    isActive ? "text-blue-600" : isCompleted ? "text-emerald-600" : "text-gray-500"
                  )}>
                    {step.description}
                  </p>
                )}
              </div>

              {/* Active Indicator */}
              {isActive && (
                <div className="flex-shrink-0">
                  <Circle className="w-2 h-2 fill-blue-500 text-blue-500 animate-pulse" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SimpleAssessmentStepper;
