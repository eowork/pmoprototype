import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Textarea } from '../../ui/textarea';
import { Badge } from '../../ui/badge';
import { Edit, Save, X, Eye } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface EditableAnalysisSectionProps {
  title: string;
  content: string;
  onSave: (content: string) => void;
  placeholder?: string;
  userRole: string;
  requireAuth: (action: string) => boolean;
  className?: string;
  minHeight?: number;
  maxLength?: number;
}

export function EditableAnalysisSection({
  title,
  content,
  onSave,
  placeholder = 'Enter your analysis...',
  userRole,
  requireAuth,
  className = '',
  minHeight = 120,
  maxLength = 5000
}: EditableAnalysisSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const [isSaving, setIsSaving] = useState(false);

  const canEdit = userRole !== 'Client' && requireAuth('manage_gad_data');

  const handleEdit = () => {
    if (!canEdit) {
      toast.error('Administrative privileges required to edit this content');
      return;
    }
    setEditContent(content);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!canEdit) return;

    try {
      setIsSaving(true);
      await onSave(editContent.trim());
      setIsEditing(false);
      toast.success('Analysis saved successfully');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save analysis');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditContent(content);
    setIsEditing(false);
  };

  return (
    <Card className={`border-slate-200 shadow-sm ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-900">{title}</CardTitle>
          <div className="flex items-center gap-2">
            {!isEditing && canEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
                className="border-slate-300 hover:bg-slate-50"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
            {!canEdit && (
              <Badge variant="outline" className="text-xs border-blue-300 text-blue-700 bg-blue-50">
                <Eye className="h-3 w-3 mr-1" />
                View Only
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder={placeholder}
              className="resize-none border-slate-300 focus:border-slate-400 focus:ring-slate-400"
              style={{ minHeight: `${minHeight}px` }}
              maxLength={maxLength}
            />
            
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-500">
                {editContent.length}/{maxLength} characters
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="hover:bg-slate-100"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving || editContent.trim() === content}
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
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {content ? (
              <div className="prose prose-sm max-w-none text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-200">
                {content.split('\n').map((line, index) => (
                  <p key={index} className="mb-2 last:mb-0 leading-relaxed">
                    {line || '\u00A0'}
                  </p>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
                <p className="italic">{canEdit ? 'Click "Edit" to add your analysis...' : 'No analysis available yet.'}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}