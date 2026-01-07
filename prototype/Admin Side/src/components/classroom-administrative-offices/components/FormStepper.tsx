import React from 'react';
import { Check, ChevronRight, ClipboardCheck, Circle } from 'lucide-react';
import { cn } from '../../ui/utils';
import { Progress } from '../../ui/progress';

interface Step {
  id: number;
  title: string;
  description?: string;
  completed?: boolean;
}

interface FormStepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  className?: string;
  variant?: 'horizontal' | 'vertical' | 'compact' | 'sidebar';
  showProgress?: boolean;
}

function FormStepper({ 
  steps, 
  currentStep, 
  onStepClick, 
  className, 
  variant = 'sidebar',
  showProgress = true 
}: FormStepperProps) {
  
  // Improved sidebar variant - formal and minimal
  return (
    <div className={cn("w-full h-fit bg-white border border-slate-200 rounded-lg", className)}>
      {/* Header Section */}
      <div className="p-5 bg-gradient-to-br from-slate-50 to-white border-b border-slate-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-100">
            <ClipboardCheck className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-gray-900">Assessment Progress</h3>
            <p className="text-xs text-gray-500 mt-0.5">Step {currentStep} of {steps.length}</p>
          </div>
        </div>
        
        {showProgress && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Completion</span>
              <span className="text-blue-600">
                {Math.round((currentStep / steps.length) * 100)}%
              </span>
            </div>
            <Progress value={(currentStep / steps.length) * 100} className="h-1.5" />
          </div>
        )}
      </div>

      {/* Steps List */}
      <div className="p-3 space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto">
        {steps.map((step, index) => {
          const isActive = currentStep === step.id;
          const isCompleted = step.completed || currentStep > step.id;
          const isClickable = onStepClick && (isCompleted || isActive || currentStep >= step.id - 1);

          return (
            <div 
              key={step.id}
              className={cn(
                "relative flex items-start gap-3 p-3 rounded-lg transition-all duration-200 border",
                isActive 
                  ? "bg-blue-50 border-blue-200 shadow-sm" 
                  : isCompleted 
                  ? "bg-emerald-50 border-emerald-200" 
                  : "bg-white border-slate-200 hover:border-slate-300",
                isClickable && "cursor-pointer",
                !isClickable && "cursor-default opacity-60"
              )}
              onClick={() => isClickable && onStepClick?.(step.id)}
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className={cn(
                  "absolute left-6 top-[52px] w-0.5 h-6",
                  isCompleted ? "bg-emerald-300" : "bg-slate-200"
                )} />
              )}

              {/* Step Number/Check */}
              <div className={cn(
                "flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center border-2 transition-all z-10",
                isCompleted
                  ? "bg-emerald-500 border-emerald-500 text-white"
                  : isActive
                  ? "bg-blue-500 border-blue-500 text-white"
                  : "bg-white border-slate-300 text-slate-500"
              )}>
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span className="text-sm">{step.id}</span>
                )}
              </div>

              {/* Step Content */}
              <div className="min-w-0 flex-1 pt-0.5">
                <h4 className={cn(
                  "text-sm mb-0.5",
                  isActive ? "text-blue-700" : isCompleted ? "text-emerald-700" : "text-gray-700"
                )}>
                  {step.title}
                </h4>
                {step.description && (
                  <p className={cn(
                    "text-xs leading-relaxed",
                    isActive ? "text-blue-600" : isCompleted ? "text-emerald-600" : "text-gray-500"
                  )}>
                    {step.description}
                  </p>
                )}
              </div>

              {/* Status Badge */}
              {isActive && (
                <div className="flex-shrink-0">
                  <div className="px-2 py-1 bg-blue-100 rounded-md text-blue-700 text-xs flex items-center gap-1">
                    <Circle className="w-2 h-2 fill-current animate-pulse" />
                    Active
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Summary */}
      <div className="p-4 bg-slate-50 border-t border-slate-200">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>Current Step:</span>
          <span className="text-gray-900">{steps.find(s => s.id === currentStep)?.title}</span>
        </div>
      </div>
    </div>
  );
}

// Export as both named and default export for compatibility
export { FormStepper };
export default FormStepper;
