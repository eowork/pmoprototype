import React from 'react';
import { Button } from '../../ui/button';
import { useFontSize } from '../../../hooks/useFontSize';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../ui/tooltip';

export function FontSizeControls() {
  const { fontSize, increaseFontSize, decreaseFontSize, resetFontSize } = useFontSize();

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-lg border border-gray-200">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={decreaseFontSize}
              disabled={fontSize === 'small'}
              className="h-7 px-2 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Decrease font size"
            >
              <span className="text-xs font-semibold">A-</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Decrease font size</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFontSize}
              className={`h-7 px-2 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 transition-colors ${
                fontSize === 'medium' ? 'bg-emerald-100 text-emerald-700' : ''
              }`}
              aria-label="Reset font size to default"
            >
              <span className="text-sm font-semibold">A</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Default font size</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={increaseFontSize}
              disabled={fontSize === 'large'}
              className="h-7 px-2 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Increase font size"
            >
              <span className="text-base font-semibold">A+</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Increase font size</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
