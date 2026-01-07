import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Separator } from '../../../ui/separator';
import { Progress } from '../../../ui/progress';
import { 
  Camera, Edit, CheckCircle2, DollarSign, Activity, Plus, Clock, Building
} from 'lucide-react';
import { ImageWithFallback } from '../../../figma/ImageWithFallback';
import { RepairProgressOverviewContainer } from '../shared/RepairProgressOverviewContainer';
import { formatCurrency, formatDate, getStatusColor } from '../../../construction-infrastructure/utils/analyticsHelpers';

interface RepairOverviewTabProps {
  project: any;
  editableProject: any;
  sectionAData: any;
  sectionBData: any;
  financialAllocation: any;
  physicalPerformance: any;
  healthMetrics: any;
  projectObjectives: string[];
  projectKeyFeatures: string[];
  projectBeneficiaries: string;
  galleryItems: any[];
  targetBudget: number;
  actualSpent: number;
  budgetVariance: number;
  budgetVariancePercent: number;
  actualProgress: number;
  targetProgress: number;
  canEdit: boolean;
  canAdd: boolean;
  setActiveTab: (tab: string) => void;
  setIsFinancialDialogOpen: (open: boolean) => void;
  setIsPhysicalDialogOpen: (open: boolean) => void;
  setIsHealthDialogOpen: (open: boolean) => void;
  setIsProjectInfoDialogOpen: (open: boolean) => void;
  setIsAddReportDialogOpen: (open: boolean) => void;
  setIsAddPhaseDialogOpen: (open: boolean) => void;
}

export function RepairOverviewTab({
  project,
  editableProject,
  sectionAData,
  sectionBData,
  financialAllocation,
  physicalPerformance,
  healthMetrics,
  projectObjectives,
  projectKeyFeatures,
  projectBeneficiaries,
  galleryItems,
  targetBudget,
  actualSpent,
  budgetVariance,
  budgetVariancePercent,
  actualProgress,
  targetProgress,
  canEdit,
  canAdd,
  setActiveTab,
  setIsFinancialDialogOpen,
  setIsPhysicalDialogOpen,
  setIsHealthDialogOpen,
  setIsProjectInfoDialogOpen,
  setIsAddReportDialogOpen,
  setIsAddPhaseDialogOpen
}: RepairOverviewTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT COLUMN: Latest Repair Gallery */}
        <Card className="border-gray-200 shadow-sm bg-white flex flex-col">
          <CardHeader className="border-b border-gray-100 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-600">
                <Camera className="w-5 h-5" />
                <CardTitle className="text-emerald-600">Project Gallery</CardTitle>
              </div>
              {canEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab('gallery')}
                  className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 h-7 text-xs"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Manage
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-5 flex-1 flex flex-col">
            <div className="flex-1 flex flex-col gap-3">
              {/* Main/Featured Image */}
              <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-200 bg-gray-100 group">
                <div className="absolute top-3 left-3 z-10">
                  <Badge className="bg-emerald-600 text-white border-0 text-xs">
                    In Progress
                  </Badge>
                </div>
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600"
                  alt="Current repair progress: Electrical system upgrade at 75% completion"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3">
                  <p className="text-white text-sm font-medium">
                    Current repair progress: Electrical system upgrade at 75% completion
                  </p>
                  <p className="text-white/80 text-xs mt-0.5">October 1, 2024</p>
                </div>
              </div>

              {/* Thumbnail Grid - 1 image visible */}
              <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-200 bg-gray-100 group cursor-pointer" onClick={() => setActiveTab('gallery')}>
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300"
                  alt="Repair work completion status"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all" />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <p className="text-white text-xs">Repair work completion - facility restoration in progress</p>
                </div>
              </div>
            </div>

            {/* View All Button */}
            <Button 
              variant="outline" 
              className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50 mt-3 h-9"
              onClick={() => setActiveTab('gallery')}
            >
              <Camera className="w-4 h-4 mr-2" />
              View All Photos ({galleryItems.length})
            </Button>
          </CardContent>
        </Card>

        {/* RIGHT COLUMN: Progress Overview Container - Redesigned */}
        <RepairProgressOverviewContainer
          financialPercentage={financialAllocation.physicalAccomplishmentPercent}
          targetBudget={targetBudget}
          actualSpent={actualSpent}
          budgetVariance={budgetVariance}
          budgetVariancePercent={budgetVariancePercent}
          physicalPercentage={actualProgress}
          targetProgress={targetProgress}
          actualProgress={actualProgress}
          phasesDone={physicalPerformance.phasesDone}
          totalPhases={physicalPerformance.totalPhases}
          physicalStatus={physicalPerformance.physicalStatus}
          dateStarted={sectionBData.dateStarted}
          targetDateCompletion={sectionBData.targetDateCompletion}
          originalContractDuration={sectionBData.originalContractDuration}
          canEdit={canEdit}
          onEditFinancial={() => setIsFinancialDialogOpen(true)}
          onEditPhysical={() => setIsPhysicalDialogOpen(true)}
          onEditTimeline={() => setIsHealthDialogOpen(true)}
        />
      </div>

      {/* Project Information - Full Width */}
      <Card className="border-gray-200 shadow-sm bg-white">
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-600">
                <Building className="w-5 h-5" />
                <CardTitle className="text-emerald-600">Project Information</CardTitle>
              </div>
              <CardDescription>Comprehensive project details, objectives, and key features</CardDescription>
            </div>
            {canEdit && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsProjectInfoDialogOpen(true)}
                className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit Details
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* Description */}
          <p className="text-sm text-gray-700 leading-relaxed mb-6">
            {sectionAData.projectDescription || "This repair project addresses critical infrastructure maintenance and improvement needs to ensure the facility's continued operational excellence. The scope encompasses comprehensive repair work across multiple systems including electrical, plumbing, structural reinforcement, and aesthetic improvements. The project aims to restore full functionality while implementing modern standards and energy-efficient solutions."}
          </p>

          {/* Key Details Grid */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div>
              <p className="text-xs text-gray-600 mb-1">Total Budget</p>
              <p className="text-sm text-gray-900">{formatCurrency(targetBudget)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Funding Source</p>
              <p className="text-sm text-gray-900">{project.fundingSource || 'University Maintenance Fund'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Project Status</p>
              <Badge className={getStatusColor(editableProject.status || project.status)}>
                {editableProject.status || project.status}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Contractor</p>
              <p className="text-sm text-gray-900">{sectionBData.contractorName || 'Repair Services Inc.'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Contract Duration</p>
              <p className="text-sm text-gray-900">{sectionBData.originalContractDuration || '60 days'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Location</p>
              <p className="text-sm text-gray-900">{project.location || 'Main Campus'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Beneficiaries</p>
              <p className="text-sm text-gray-900">{projectBeneficiaries || 'All building occupants and university community'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Start Date</p>
              <p className="text-sm text-gray-900">{formatDate(sectionBData.dateStarted || '2024-01-15')}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Target End Date</p>
              <p className="text-sm text-gray-900">{formatDate(sectionBData.targetDateCompletion || '2024-03-15')}</p>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Project Objectives */}
          <div className="mb-6">
            <h4 className="text-sm text-gray-900 mb-3">Project Objectives</h4>
            <div className="space-y-2">
              {projectObjectives.map((objective, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">{objective}</p>
                </div>
              ))}
            </div>
          </div>

          <Separator className="my-6" />

          {/* Key Features */}
          <div>
            <h4 className="text-sm text-gray-900 mb-3">Key Features</h4>
            <div className="grid grid-cols-2 gap-3">
              {projectKeyFeatures.map((feature, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">{feature}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Accomplishment - Two Column Grid Layout */}
      <Card className="border-gray-200 shadow-sm bg-white">
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-600">
                <DollarSign className="w-5 h-5" />
                <CardTitle className="text-emerald-600">Financial Accomplishment</CardTitle>
              </div>
              <CardDescription>Detailed budget utilization and variance tracking by reporting period</CardDescription>
            </div>
            {canAdd && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsAddReportDialogOpen(true)}
                className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Report
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Log Entry 1 - Q4 2024 */}
            <div className="border-l-4 border-emerald-600 pl-4 py-3 bg-emerald-50 rounded-r-lg group hover:shadow-md transition-all relative">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm text-gray-900">Q4 2024 Financial Report</p>
                  <p className="text-xs text-gray-600">As of December 31, 2024</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-600 text-white border-0 text-xs">Active</Badge>
                  {canEdit && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-emerald-600 hover:text-white">
                        <Edit className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2 mt-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Target Budget</span>
                  <span className="text-sm text-gray-900">{formatCurrency(targetBudget)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Actual Spent</span>
                  <span className="text-sm text-gray-900">{formatCurrency(actualSpent)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Variance</span>
                  <span className={`text-sm ${budgetVariance >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                    {budgetVariance >= 0 ? '+' : ''}{formatCurrency(budgetVariance)}
                  </span>
                </div>
              </div>
              <Progress value={financialAllocation.physicalAccomplishmentPercent} className="h-2 mt-3" />
              <p className="text-xs text-gray-600 mt-2">Utilization: {financialAllocation.physicalAccomplishmentPercent.toFixed(1)}%</p>
            </div>

            {/* Log Entry 2 - Q3 2024 */}
            <div className="border-l-4 border-blue-400 pl-4 py-3 bg-blue-50 rounded-r-lg">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm text-gray-900">Q3 2024 Financial Report</p>
                  <p className="text-xs text-gray-600">As of September 30, 2024</p>
                </div>
                <Badge variant="outline" className="text-xs">Historical</Badge>
              </div>
              <div className="space-y-2 mt-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Target Budget</span>
                  <span className="text-sm text-gray-900">{formatCurrency(650000)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Actual Spent</span>
                  <span className="text-sm text-gray-900">{formatCurrency(380000)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Variance</span>
                  <span className="text-sm text-emerald-700">+{formatCurrency(270000)}</span>
                </div>
              </div>
              <Progress value={58.5} className="h-2 mt-3" />
              <p className="text-xs text-gray-600 mt-2">Utilization: 58.5%</p>
            </div>

            {/* Log Entry 3 - Q2 2024 */}
            <div className="border-l-4 border-gray-300 pl-4 py-3 bg-gray-50 rounded-r-lg">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm text-gray-900">Q2 2024 Financial Report</p>
                  <p className="text-xs text-gray-600">As of June 30, 2024</p>
                </div>
                <Badge variant="outline" className="text-xs">Historical</Badge>
              </div>
              <div className="space-y-2 mt-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Target Budget</span>
                  <span className="text-sm text-gray-900">{formatCurrency(500000)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Actual Spent</span>
                  <span className="text-sm text-gray-900">{formatCurrency(325000)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Variance</span>
                  <span className="text-sm text-emerald-700">+{formatCurrency(175000)}</span>
                </div>
              </div>
              <Progress value={65.0} className="h-2 mt-3" />
              <p className="text-xs text-gray-600 mt-2">Utilization: 65.0%</p>
            </div>

            {/* Log Entry 4 - Q1 2024 */}
            <div className="border-l-4 border-purple-400 pl-4 py-3 bg-purple-50 rounded-r-lg">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm text-gray-900">Q1 2024 Financial Report</p>
                  <p className="text-xs text-gray-600">As of March 31, 2024</p>
                </div>
                <Badge variant="outline" className="text-xs">Historical</Badge>
              </div>
              <div className="space-y-2 mt-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Target Budget</span>
                  <span className="text-sm text-gray-900">{formatCurrency(400000)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Actual Spent</span>
                  <span className="text-sm text-gray-900">{formatCurrency(280000)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Variance</span>
                  <span className="text-sm text-emerald-700">+{formatCurrency(120000)}</span>
                </div>
              </div>
              <Progress value={70.0} className="h-2 mt-3" />
              <p className="text-xs text-gray-600 mt-2">Utilization: 70.0%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Physical Accomplishment by Phase - Two Column Grid Layout */}
      <Card className="border-gray-200 shadow-sm bg-white">
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-blue-600">
                <Activity className="w-5 h-5" />
                <CardTitle className="text-blue-600">Physical Accomplishment by Phase</CardTitle>
              </div>
              <CardDescription>Progress tracking across project phases with target vs actual comparison</CardDescription>
            </div>
            {canAdd && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsAddPhaseDialogOpen(true)}
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Phase
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Phase 1 - Completed */}
            <div className="border-l-4 border-emerald-600 pl-4 py-3 bg-emerald-50 rounded-r-lg group hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Phase 1: Assessment & Planning</p>
                  <p className="text-xs text-gray-600 mt-1">Initial assessment and repair planning complete</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-600 text-white border-0 text-xs whitespace-nowrap">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Complete
                  </Badge>
                  {canEdit && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-emerald-600 hover:text-white">
                        <Edit className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2 mt-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Target Progress</span>
                  <span className="text-sm text-gray-900">100%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Actual Progress</span>
                  <span className="text-sm text-emerald-700">100%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Variance</span>
                  <span className="text-sm text-emerald-700">On Target</span>
                </div>
              </div>
              <Progress value={100} className="h-2 mt-3" />
              <p className="text-xs text-gray-500 mt-2">Target: Jan 20, 2024 | Actual: Jan 18, 2024 (2 days ahead)</p>
            </div>

            {/* Phase 2 - In Progress */}
            <div className="border-l-4 border-blue-600 pl-4 py-3 bg-blue-50 rounded-r-lg group hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Phase 2: Primary Repairs</p>
                  <p className="text-xs text-gray-600 mt-1">Core repair work and system upgrades ongoing</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-600 text-white border-0 text-xs whitespace-nowrap">
                    <Clock className="w-3 h-3 mr-1" />
                    In Progress
                  </Badge>
                  {canEdit && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-blue-600 hover:text-white">
                        <Edit className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2 mt-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Target Progress</span>
                  <span className="text-sm text-gray-900">100%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Actual Progress</span>
                  <span className="text-sm text-blue-700">75.0%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Variance</span>
                  <span className="text-sm text-amber-700">-25.0%</span>
                </div>
              </div>
              <Progress value={75.0} className="h-2 mt-3" />
              <p className="text-xs text-gray-500 mt-2">Target: Feb 28, 2024 | Actual: Feb 25, 2024 (3 days ahead)</p>
            </div>

            {/* Phase 3 - Pending */}
            <div className="border-l-4 border-gray-300 pl-4 py-3 bg-gray-50 rounded-r-lg">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Phase 3: Final Inspection</p>
                  <p className="text-xs text-gray-600 mt-1">Quality inspection and finishing work</p>
                </div>
                <Badge variant="outline" className="text-xs whitespace-nowrap">
                  Pending
                </Badge>
              </div>
              <div className="space-y-2 mt-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Target Progress</span>
                  <span className="text-sm text-gray-900">0%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Actual Progress</span>
                  <span className="text-sm text-gray-700">0%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Variance</span>
                  <span className="text-sm text-gray-700">Not Started</span>
                </div>
              </div>
              <Progress value={0} className="h-2 mt-3" />
              <p className="text-xs text-gray-500 mt-2">Target: Mar 15, 2024 | Actual: Pending</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
