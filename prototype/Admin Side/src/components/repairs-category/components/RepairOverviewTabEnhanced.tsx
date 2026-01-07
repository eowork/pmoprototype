import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { 
  Camera, Edit, TrendingUp, AlertCircle, Target, Activity, CheckCircle2,
  DollarSign, BarChart3, Clock, Award
} from 'lucide-react';
import { ImageWithFallback } from '../../figma/ImageWithFallback';
import { Progress } from '../../ui/progress';
import { Separator } from '../../ui/separator';

interface RepairOverviewTabEnhancedProps {
  project: any;
  sectionAData: any;
  setSectionAData: (data: any) => void;
  sectionBData: any;
  setSectionBData: (data: any) => void;
  financialAllocation: any;
  physicalPerformance: any;
  healthMetrics: any;
  projectObjectives: string[];
  projectKeyFeatures: string[];
  projectBeneficiaries: string;
  accomplishmentRecords: any[];
  actualAccomplishmentRecords: any[];
  progressSummaryRecords: any[];
  galleryItems: any[];
  canEdit: boolean;
  canAdd: boolean;
  formStates: any;
  onSectionAEdit: () => void;
  onSectionASave: () => void;
  onSectionACancel: () => void;
  onSectionBEdit: () => void;
  onSectionBSave: () => void;
  onSectionBCancel: () => void;
  onOpenFinancialDialog: () => void;
  onOpenPhysicalDialog: () => void;
  onOpenHealthDialog: () => void;
  onOpenProjectInfoDialog: () => void;
  onNavigateToGallery: () => void;
}

export function RepairOverviewTabEnhanced({
  project,
  sectionAData,
  sectionBData,
  financialAllocation,
  physicalPerformance,
  healthMetrics,
  projectObjectives,
  projectKeyFeatures,
  projectBeneficiaries,
  galleryItems,
  canEdit,
  onOpenFinancialDialog,
  onOpenPhysicalDialog,
  onOpenHealthDialog,
  onOpenProjectInfoDialog,
  onNavigateToGallery
}: RepairOverviewTabEnhancedProps) {

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  // Get the latest gallery image
  const latestImage = galleryItems && galleryItems.length > 0 ? galleryItems[0] : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* LEFT COLUMN: Latest Repair Gallery */}
      <Card className="border-gray-200 shadow-sm bg-white flex flex-col">
        <CardHeader className="border-b border-gray-100 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-600">
              <Camera className="w-5 h-5" />
              <CardTitle className="text-emerald-600">Repair Gallery</CardTitle>
            </div>
            {canEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onNavigateToGallery}
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
                  {project.status || 'In Progress'}
                </Badge>
              </div>
              <ImageWithFallback
                src={latestImage?.url || "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600"}
                alt={latestImage?.title || "Repair project progress"}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3">
                <p className="text-white text-sm font-medium">
                  {latestImage?.description || "Current repair progress"}
                </p>
                <p className="text-white/80 text-xs mt-0.5">
                  {latestImage ? formatDate(latestImage.uploadDate) : formatDate(new Date().toISOString())}
                </p>
              </div>
            </div>

            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-3 gap-2">
              {galleryItems.slice(0, 3).map((img, idx) => (
                <div key={img.id} className="relative aspect-video rounded overflow-hidden border border-gray-200 bg-gray-50">
                  <ImageWithFallback
                    src={img.url}
                    alt={img.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              {galleryItems.length === 0 && (
                <>
                  <div className="aspect-video rounded bg-gray-100 border border-gray-200"></div>
                  <div className="aspect-video rounded bg-gray-100 border border-gray-200"></div>
                  <div className="aspect-video rounded bg-gray-100 border border-gray-200"></div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* RIGHT COLUMN: Progress Overview */}
      <Card className="border-gray-200 shadow-sm bg-white">
        <CardHeader className="border-b border-gray-100 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-600">
              <Activity className="w-5 h-5" />
              <CardTitle className="text-emerald-600">Progress Overview</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          {/* Financial Progress */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span className="text-sm text-gray-700">Financial Progress</span>
              </div>
              <span className="text-sm text-gray-900">
                {financialAllocation.budgetUtilization?.toFixed(1) || 0}%
              </span>
            </div>
            <Progress value={financialAllocation.budgetUtilization || 0} className="h-2 bg-gray-100" />
            <div className="flex items-center justify-between mt-1.5 text-xs text-gray-600">
              <span>{formatCurrency(financialAllocation.physicalAccomplishmentValue || 0)} spent</span>
              <span>{formatCurrency(financialAllocation.totalBudget || 0)} total</span>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Physical Progress */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-700">Physical Progress</span>
              </div>
              <span className="text-sm text-gray-900">
                {sectionBData.projectStatusActual?.toFixed(1) || 0}%
              </span>
            </div>
            <Progress value={sectionBData.projectStatusActual || 0} className="h-2 bg-gray-100" />
            <div className="flex items-center justify-between mt-1.5 text-xs text-gray-600">
              <span>Actual: {sectionBData.projectStatusActual?.toFixed(1) || 0}%</span>
              <span>Target: {sectionBData.projectStatusTarget || 100}%</span>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Repair Schedule */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Start Date</span>
              <span className="text-gray-900">{formatDate(sectionBData.dateStarted || '')}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Target Completion</span>
              <span className="text-gray-900">{formatDate(sectionBData.targetDateCompletion || '')}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Duration</span>
              <span className="text-gray-900">{sectionBData.originalContractDuration || 0} days</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Contractor</span>
              <span className="text-gray-900">{sectionBData.contractorName || 'N/A'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Information Card */}
      <Card className="border-gray-200 shadow-sm bg-white lg:col-span-2">
        <CardHeader className="border-b border-gray-100 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-600">
              <BarChart3 className="w-5 h-5" />
              <CardTitle className="text-emerald-600">Repair Information</CardTitle>
            </div>
            {canEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onOpenProjectInfoDialog}
                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 h-7 text-xs"
              >
                <Edit className="w-3 h-3 mr-1" />
                Edit Details
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Description */}
            <div className="md:col-span-2">
              <h4 className="text-sm text-gray-700 mb-2">Description</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {sectionAData.projectDescription || 'No description available'}
              </p>
            </div>

            {/* Objectives */}
            <div>
              <h4 className="text-sm text-gray-700 mb-2">Repair Objectives</h4>
              <ul className="space-y-1.5">
                {projectObjectives.map((objective, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{objective}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Key Features */}
            <div>
              <h4 className="text-sm text-gray-700 mb-2">Key Features</h4>
              <ul className="space-y-1.5">
                {projectKeyFeatures.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Beneficiaries */}
            <div className="md:col-span-2">
              <h4 className="text-sm text-gray-700 mb-2">Beneficiaries</h4>
              <p className="text-sm text-gray-600">{projectBeneficiaries}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Performance Card */}
      <Card className="border-gray-200 shadow-sm bg-white">
        <CardHeader className="border-b border-gray-100 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-600">
              <DollarSign className="w-5 h-5" />
              <CardTitle className="text-emerald-600">Financial Performance</CardTitle>
            </div>
            {canEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onOpenFinancialDialog}
                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 h-7 text-xs"
              >
                <Edit className="w-3 h-3 mr-1" />
                Update
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Budget</span>
              <span className="text-sm text-gray-900">{formatCurrency(financialAllocation.totalBudget || 0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Amount Spent</span>
              <span className="text-sm text-gray-900">{formatCurrency(financialAllocation.physicalAccomplishmentValue || 0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Remaining Budget</span>
              <span className="text-sm text-emerald-600">{formatCurrency(financialAllocation.remainingBudget || 0)}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Budget Utilization</span>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                {financialAllocation.budgetUtilization?.toFixed(1) || 0}%
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Physical Performance Card */}
      <Card className="border-gray-200 shadow-sm bg-white">
        <CardHeader className="border-b border-gray-100 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-600">
              <TrendingUp className="w-5 h-5" />
              <CardTitle className="text-blue-600">Physical Performance</CardTitle>
            </div>
            {canEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onOpenPhysicalDialog}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-7 text-xs"
              >
                <Edit className="w-3 h-3 mr-1" />
                Update
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Actual Progress</span>
              <span className="text-sm text-gray-900">{sectionBData.projectStatusActual?.toFixed(1) || 0}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Target Progress</span>
              <span className="text-sm text-gray-900">{sectionBData.projectStatusTarget || 100}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Phases Completed</span>
              <span className="text-sm text-gray-900">{physicalPerformance.phasesDone || 1} of {physicalPerformance.totalPhases || 3}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status</span>
              <Badge 
                variant="outline" 
                className={
                  physicalPerformance.physicalStatus === 'On Track' 
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : physicalPerformance.physicalStatus === 'Minor Delays'
                    ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                }
              >
                {physicalPerformance.physicalStatus || 'On Track'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Health Card */}
      <Card className="border-gray-200 shadow-sm bg-white lg:col-span-2">
        <CardHeader className="border-b border-gray-100 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-600">
              <Activity className="w-5 h-5" />
              <CardTitle className="text-amber-600">Project Health</CardTitle>
            </div>
            {canEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onOpenHealthDialog}
                className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 h-7 text-xs"
              >
                <Edit className="w-3 h-3 mr-1" />
                Update
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Budget Health */}
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span className="text-xs text-emerald-700">Budget Health</span>
              </div>
              <p className="text-emerald-900 mb-1">{healthMetrics.budgetHealth.value}</p>
              <p className="text-xs text-emerald-600">{healthMetrics.budgetHealth.status}</p>
            </div>

            {/* Physical Health */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-blue-700">Physical Health</span>
              </div>
              <p className="text-blue-900 mb-1">{healthMetrics.physicalHealth.value}</p>
              <p className="text-xs text-blue-600">{healthMetrics.physicalHealth.status}</p>
            </div>

            {/* Schedule Health */}
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-purple-600" />
                <span className="text-xs text-purple-700">Schedule Health</span>
              </div>
              <p className="text-purple-900 mb-1">{healthMetrics.scheduleHealth.value}</p>
              <p className="text-xs text-purple-600">{healthMetrics.scheduleHealth.status}</p>
            </div>

            {/* Quality Health */}
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-amber-600" />
                <span className="text-xs text-amber-700">Quality Health</span>
              </div>
              <p className="text-amber-900 mb-1">{healthMetrics.qualityHealth.value}</p>
              <p className="text-xs text-amber-600">{healthMetrics.qualityHealth.status}</p>
            </div>
          </div>

          {/* Timeline Info */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-600 mb-1">Target Completion</p>
                <p className="text-sm text-gray-900">{formatDate(healthMetrics.targetCompletion)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Days Remaining</p>
                <p className="text-sm text-gray-900">{healthMetrics.daysRemaining} days</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
