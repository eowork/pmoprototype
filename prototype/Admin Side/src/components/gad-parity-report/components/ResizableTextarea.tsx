import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Textarea } from '../../ui/textarea';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Save, Edit, Check, X, Maximize2, Minimize2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { ResizableTextareaProps } from '../types';

export function ResizableTextarea({
  value,
  onChange,
  onSave,
  placeholder = 'Enter your analysis or remarks...',
  minHeight = 120,
  maxHeight = 400,
  autoSave = true,
  autoSaveDelay = 2000,
  maxLength = 5000,
  required = false
}: ResizableTextareaProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const [hasChanges, setHasChanges] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate word count
  useEffect(() => {
    const words = localValue.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [localValue]);

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      const newHeight = Math.max(minHeight, Math.min(maxHeight, textarea.scrollHeight));
      textarea.style.height = `${newHeight}px`;
    }
  }, [minHeight, maxHeight]);

  // Handle value changes
  const handleValueChange = (newValue: string) => {
    if (newValue.length <= maxLength) {
      setLocalValue(newValue);
      setHasChanges(newValue !== value);
      onChange(newValue);

      // Clear existing auto-save timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      // Set new auto-save timeout if enabled and there are changes
      if (autoSave && onSave && newValue !== value) {
        autoSaveTimeoutRef.current = setTimeout(() => {
          handleSave(newValue);
        }, autoSaveDelay);
      }
    }
  };

  // Handle manual save
  const handleSave = async (valueToSave?: string) => {
    const saveValue = valueToSave || localValue;
    
    if (!onSave || saveValue === value) return;

    try {
      setIsSaving(true);
      await onSave(saveValue);
      setHasChanges(false);
      setIsEditing(false);
      toast.success('Analysis saved successfully');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save analysis');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel editing
  const handleCancel = () => {
    setLocalValue(value);
    setHasChanges(false);
    setIsEditing(false);
    
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
  };

  // Start editing
  const startEditing = () => {
    setIsEditing(true);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        adjustTextareaHeight();
      }
    }, 0);
  };

  // Toggle expanded mode
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    setTimeout(adjustTextareaHeight, 0);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // Sync external value changes
  useEffect(() => {
    if (value !== localValue && !isEditing) {
      setLocalValue(value);
      setHasChanges(false);
    }
  }, [value, localValue, isEditing]);

  // Adjust height when content or expanded state changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [localValue, isExpanded, adjustTextareaHeight]);

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-900">
            General Analysis & Remarks
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasChanges && (
              <Badge variant="outline" className="text-xs border-orange-300 text-orange-700 bg-orange-50">
                Unsaved Changes
              </Badge>
            )}
            {isSaving && (
              <Badge variant="outline" className="text-xs border-blue-300 text-blue-700 bg-blue-50">
                Saving...
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleExpanded}
              className="h-8 w-8 p-0"
              title={isExpanded ? 'Minimize' : 'Expand'}
            >
              {isExpanded ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={localValue}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder={placeholder}
            className={`resize-none transition-all duration-200 border-slate-300 focus:border-slate-400 focus:ring-slate-400 ${
              isEditing ? 'bg-white' : 'bg-slate-50'
            } ${isExpanded ? 'fixed inset-4 z-50 rounded-lg shadow-2xl' : ''}`}
            style={{
              minHeight: isExpanded ? '60vh' : minHeight,
              maxHeight: isExpanded ? '80vh' : maxHeight
            }}
            readOnly={!isEditing}
            required={required}
            maxLength={maxLength}
            onFocus={startEditing}
          />
          
          {isExpanded && (
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={toggleExpanded} />
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span>{wordCount} words</span>
            <span>{localValue.length}/{maxLength} characters</span>
            {autoSave && (
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                Auto-save enabled
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={startEditing}
                className="border-slate-300 hover:bg-slate-50"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  className="hover:bg-slate-100"
                  disabled={isSaving}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleSave()}
                  disabled={!hasChanges || isSaving}
                  className="bg-slate-900 hover:bg-slate-800"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Saving
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        {localValue && !isEditing && (
          <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="prose prose-sm max-w-none text-slate-700">
              {localValue.split('\n').map((line, index) => (
                <p key={index} className="mb-2 last:mb-0">
                  {line || '\u00A0'}
                </p>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}