import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import {
  FileText,
  AlertCircle,
  BarChart3,
  Database,
  X,
} from "lucide-react";
// Generic quarters definition for both assessment types
const QUARTERS = [
  { id: 'quarter1', label: '1st Quarter', shortLabel: 'Q1' },
  { id: 'quarter2', label: '2nd Quarter', shortLabel: 'Q2' },
  { id: 'quarter3', label: '3rd Quarter', shortLabel: 'Q3' },
  { id: 'quarter4', label: '4th Quarter', shortLabel: 'Q4' }
] as const;

interface EditAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIndicator: any;
  formData: any;
  onSave: () => void;
  onFieldChange: (field: string, value: any) => void;
  onQuarterlyValueChange: (
    type: "physicalTarget" | "physicalAccomplishment",
    quarter: string,
    value: string,
  ) => void;
  onAccomplishmentScoreChange: (
    quarter: string,
    value: string,
  ) => void;
}

export function EditAssessmentModal({
  isOpen,
  onClose,
  selectedIndicator,
  formData,
  onSave,
  onFieldChange,
  onQuarterlyValueChange,
  onAccomplishmentScoreChange,
}: EditAssessmentModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[90vw] lg:max-w-[80vw] xl:max-w-[75vw] 2xl:max-w-[70vw] max-h-[95vh] bg-white border-0 shadow-2xl rounded-lg overflow-hidden">
        {/* Enhanced Formal Header with Close Button */}
        <DialogHeader className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white -m-6 px-8 py-6 mb-0 relative">
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 h-8 w-8 p-0 text-white hover:bg-white/10 hover:text-white rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
          <DialogTitle className="flex items-center gap-4 text-xl pr-12">
            <div className="p-3 bg-white/10 rounded-xl shadow-lg">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <span className="block">Assessment Record Management System</span>
              <p className="text-sm font-normal text-blue-100 mt-2 leading-relaxed">
                {selectedIndicator
                  ? `Editing Assessment Record: ${selectedIndicator.particular}`
                  : "Creating New Assessment Record"}
              </p>
            </div>
          </DialogTitle>
          <DialogDescription className="sr-only">
            {selectedIndicator
              ? `Edit assessment record for ${selectedIndicator.particular} including administrative information, quarterly performance data, and accomplishment scores.`
              : "Create a new assessment record by providing administrative information, quarterly performance targets and accomplishments, and accomplishment score ratios."}
          </DialogDescription>
        </DialogHeader>

        {/* Responsive Content Area with Smart Scrolling */}
        <div className="flex-1 overflow-y-auto max-h-[calc(95vh-200px)]">
          <div className="p-8 space-y-8">
            {/* Two-Column Responsive Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              
              {/* Administrative Information Panel */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-300 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-300">
                    <AlertCircle className="h-5 w-5 text-slate-600" />
                    <h4 className="text-lg font-semibold text-slate-900">
                      Administrative Information
                    </h4>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <Label
                        htmlFor="uacsCode"
                        className="text-sm font-semibold text-slate-700 mb-3 block"
                      >
                        UACS Code
                      </Label>
                      <Input
                        id="uacsCode"
                        value={formData.uacsCode || ""}
                        onChange={(e) =>
                          onFieldChange("uacsCode", e.target.value)
                        }
                        placeholder="Enter UACS Code"
                        className="border-slate-400 bg-white h-11"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <Label
                          htmlFor="varianceAsOf"
                          className="text-sm font-semibold text-slate-700 mb-3 block"
                        >
                          Variance Date
                        </Label>
                        <Input
                          id="varianceAsOf"
                          type="date"
                          value={formData.varianceAsOf || ""}
                          onChange={(e) =>
                            onFieldChange("varianceAsOf", e.target.value)
                          }
                          className="border-slate-400 bg-white h-11"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="variance"
                          className="text-sm font-semibold text-slate-700 mb-3 block"
                        >
                          Variance (%)
                        </Label>
                        <Input
                          id="variance"
                          type="number"
                          step="0.01"
                          value={formData.variance ?? ""}
                          onChange={(e) =>
                            onFieldChange(
                              "variance",
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          placeholder="0.00"
                          className="border-slate-400 bg-white h-11"
                        />
                      </div>
                    </div>

                    <div>
                      <Label
                        htmlFor="remarks"
                        className="text-sm font-semibold text-slate-700 mb-3 block"
                      >
                        Assessment Remarks
                      </Label>
                      <Textarea
                        id="remarks"
                        value={formData.remarks || ""}
                        onChange={(e) =>
                          onFieldChange("remarks", e.target.value)
                        }
                        placeholder="Enter detailed remarks, observations, or explanatory notes..."
                        rows={6}
                        className="border-slate-400 bg-white resize-none leading-relaxed"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Data Panel */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-300 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-blue-300">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <h4 className="text-lg font-semibold text-slate-900">
                      Quarterly Performance Data
                    </h4>
                  </div>

                  <div className="space-y-6">
                    {/* Performance Metrics - Enhanced without per-quarter variance fields */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <Label className="text-sm font-semibold text-blue-800 block border-b border-blue-200 pb-2">
                          Physical Target (%)
                        </Label>
                        {QUARTERS.map((quarter) => (
                          <div
                            key={`target-${quarter.id}`}
                            className="space-y-2"
                          >
                            <Label className="text-xs font-medium text-slate-600">
                              {quarter.label}
                            </Label>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              value={
                                formData.physicalTarget?.[
                                  quarter.id as keyof typeof formData.physicalTarget
                                ] ?? ""
                              }
                              onChange={(e) =>
                                onQuarterlyValueChange(
                                  "physicalTarget",
                                  quarter.id,
                                  e.target.value,
                                )
                              }
                              placeholder="0.00"
                              className="border-blue-400 bg-white text-sm h-10"
                            />
                          </div>
                        ))}
                      </div>

                      <div className="space-y-4">
                        <Label className="text-sm font-semibold text-green-800 block border-b border-green-200 pb-2">
                          Physical Accomplishment (%)
                        </Label>
                        {QUARTERS.map((quarter) => (
                          <div
                            key={`accomplishment-${quarter.id}`}
                            className="space-y-2"
                          >
                            <Label className="text-xs font-medium text-slate-600">
                              {quarter.label}
                            </Label>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              value={
                                formData.physicalAccomplishment?.[
                                  quarter.id as keyof typeof formData.physicalAccomplishment
                                ] ?? ""
                              }
                              onChange={(e) =>
                                onQuarterlyValueChange(
                                  "physicalAccomplishment",
                                  quarter.id,
                                  e.target.value,
                                )
                              }
                              placeholder="0.00"
                              className="border-green-400 bg-white text-sm h-10"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Accomplishment Score Section */}
                    <div className="bg-gradient-to-br from-purple-50 to-violet-100 border border-purple-300 rounded-xl p-5 shadow-sm">
                      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-purple-300">
                        <Database className="h-5 w-5 text-purple-600" />
                        <Label className="text-sm font-semibold text-purple-800">
                          Accomplishment Score (Accomplished/Target)
                        </Label>
                      </div>
                      <p className="text-xs text-purple-700 mb-4 bg-purple-100 p-3 rounded-lg">
                        Enter ratio format: e.g., "148/200" or "75/100"
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {QUARTERS.map((quarter) => (
                          <div
                            key={`score-${quarter.id}`}
                            className="space-y-2"
                          >
                            <Label className="text-xs font-medium text-slate-600">
                              {quarter.label}
                            </Label>
                            <Input
                              value={
                                formData.accomplishmentScore?.[
                                  quarter.id as keyof typeof formData.accomplishmentScore
                                ] || ""
                              }
                              onChange={(e) =>
                                onAccomplishmentScoreChange(
                                  quarter.id,
                                  e.target.value,
                                )
                              }
                              placeholder="e.g., 148/200"
                              className="border-purple-400 bg-white text-sm h-10 font-mono"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Formal Footer with Better Spacing */}
        <DialogFooter className="bg-gradient-to-r from-slate-100 via-slate-200 to-slate-300 border-t border-slate-400 -m-6 mt-0 p-6 flex-shrink-0">
          <div className="flex flex-col sm:flex-row justify-between items-center w-full gap-4">
            <div className="text-sm text-slate-600 order-2 sm:order-1">
              <span>
                Last modified: {selectedIndicator?.updatedAt 
                  ? new Date(selectedIndicator.updatedAt).toLocaleDateString() 
                  : 'Never'
                }
              </span>
            </div>
            <div className="flex gap-3 order-1 sm:order-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="border-slate-400 hover:bg-slate-100 px-6 py-2"
              >
                Cancel Changes
              </Button>
              <Button
                onClick={onSave}
                className="bg-blue-600 hover:bg-blue-700 shadow-lg px-8 py-2"
              >
                <Database className="h-4 w-4 mr-2" />
                Save Assessment Record
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}