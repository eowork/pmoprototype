import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { useFontSize } from '../../../hooks/useFontSize';
import { useTheme } from '../../../hooks/useTheme';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../ui/tooltip';
import { Type, X, Sun, Moon, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function FloatingAccessibilityButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { fontSize, increaseFontSize, decreaseFontSize, resetFontSize, setFontSize } = useFontSize();
  const { mode: themeMode, setTheme } = useTheme();

  return (
    <TooltipProvider>
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-16 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-4 mb-2 min-w-[280px]"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <Type className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-semibold text-gray-900 dark:text-gray-100">Accessibility</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Font Size Controls */}
              <div className="space-y-3 mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  Adjust text size for better readability
                </p>
                
                <div className="grid grid-cols-4 gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={decreaseFontSize}
                        disabled={fontSize === 'small'}
                        className="h-10 text-gray-700 dark:text-gray-300 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        aria-label="Decrease font size"
                      >
                        <span className="text-sm font-semibold">A-</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Small</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={resetFontSize}
                        className={`h-10 transition-all ${
                          fontSize === 'medium' 
                            ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-600' 
                            : 'text-gray-700 dark:text-gray-300 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-600'
                        }`}
                        aria-label="Reset font size to default"
                      >
                        <span className="text-base font-semibold">A</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Default</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFontSize('large')}
                        className={`h-10 transition-all ${
                          fontSize === 'large' 
                            ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-600' 
                            : 'text-gray-700 dark:text-gray-300 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-600'
                        }`}
                        aria-label="Large font size"
                      >
                        <span className="text-lg font-semibold">A+</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Large</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={increaseFontSize}
                        disabled={fontSize === 'extra-large'}
                        className={`h-10 transition-all ${
                          fontSize === 'extra-large' 
                            ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-600' 
                            : 'text-gray-700 dark:text-gray-300 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed'
                        }`}
                        aria-label="Extra large font size"
                      >
                        <span className="text-xl font-semibold">A++</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Very Large</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                {/* Current Size Indicator */}
                <div className="text-center pt-2 border-t border-gray-100 dark:border-gray-700">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Current: <span className="font-semibold text-gray-700 dark:text-gray-300 capitalize">
                      {fontSize === 'extra-large' ? 'Very Large' : fontSize}
                    </span>
                  </span>
                </div>
              </div>

              {/* Theme Controls */}
              <div className="space-y-3">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  Choose your preferred theme
                </p>
                
                <div className="grid grid-cols-3 gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTheme('light')}
                        className={`h-10 flex flex-col items-center justify-center gap-1 transition-all ${
                          themeMode === 'light'
                            ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-600'
                            : 'text-gray-700 dark:text-gray-300 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-600'
                        }`}
                        aria-label="Light theme"
                      >
                        <Sun className="h-4 w-4" />
                        <span className="text-[10px]">Light</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Light Mode</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTheme('dark')}
                        className={`h-10 flex flex-col items-center justify-center gap-1 transition-all ${
                          themeMode === 'dark'
                            ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-600'
                            : 'text-gray-700 dark:text-gray-300 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-600'
                        }`}
                        aria-label="Dark theme"
                      >
                        <Moon className="h-4 w-4" />
                        <span className="text-[10px]">Dark</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Dark Mode</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTheme('system')}
                        className={`h-10 flex flex-col items-center justify-center gap-1 transition-all ${
                          themeMode === 'system'
                            ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-600'
                            : 'text-gray-700 dark:text-gray-300 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-600'
                        }`}
                        aria-label="System theme"
                      >
                        <Monitor className="h-4 w-4" />
                        <span className="text-[10px]">Auto</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>System Preference</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                {/* Current Theme Indicator */}
                <div className="text-center pt-2 border-t border-gray-100 dark:border-gray-700">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Theme: <span className="font-semibold text-gray-700 dark:text-gray-300 capitalize">
                      {themeMode}
                    </span>
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => setIsOpen(!isOpen)}
              className={`
                h-14 w-14 rounded-full shadow-2xl 
                bg-gradient-to-br from-emerald-600 to-emerald-700
                hover:from-emerald-700 hover:to-emerald-800
                dark:from-emerald-500 dark:to-emerald-600
                dark:hover:from-emerald-600 dark:hover:to-emerald-700
                text-white border-2 border-white dark:border-gray-800
                transition-all duration-300 hover:scale-110
                ${isOpen ? 'rotate-180' : ''}
              `}
              aria-label="Accessibility settings"
            >
              <Type className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Accessibility Settings</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}