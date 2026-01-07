import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { GraduationCap, Edit, Grid3X3, List, Table, Building2, Database, Shield } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { 
  OutcomeIndicator, 
  FIXED_OUTCOME_INDICATORS,
  AnalyticsView,
  OrganizationalInfo,
  calculateAverage, 
  calculateVariance
} from './types/QuarterlyAssessment';
import { 
  generateAssessmentDataByYear,
  generateDefaultOrganizationalInfo,
  validateOrganizationalInfo,
  getAvailableYears
} from './utils/quarterlyAssessmentData';
import { AnalyticsDashboard } from './shared/AnalyticsDashboard';
import { DataCollectionViews } from './shared/DataCollectionViews';
import { EditAssessmentModal } from './shared/EditAssessmentModal';
import { PerformanceStats } from './shared/PerformanceStats';
import { FinancialAccomplishmentTab } from './shared/FinancialAccomplishmentTab';
import { PermissionsManager } from './admin/PermissionsManager';
import { universityOperationsRBACService } from './services/RBACService';

type DataCollectionViewMode = 'card' | 'list' | 'table';

interface HigherEducationProgramPageProps {
  category: string;
  onProjectSelect: (project: any) => void;
  userRole: string;
  filterData?: any;
  requireAuth: (action: string) => boolean;
  onClearFilters: () => void;
  userEmail?: string;
}

export function HigherEducationProgramPage({
  category,
  onProjectSelect,
  userRole,
  filterData,
  requireAuth,
  onClearFilters,
  userEmail = 'user@carsu.edu.ph'
}: HigherEducationProgramPageProps) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [assessmentData, setAssessmentData] = useState<OutcomeIndicator[]>([]);
  const [organizationalInfo, setOrganizationalInfo] = useState<OrganizationalInfo>(generateDefaultOrganizationalInfo());
  const [activeTab, setActiveTab] = useState('data-analytics');
  const [analyticsView, setAnalyticsView] = useState<AnalyticsView>('all');
  const [dataCollectionViewMode, setDataCollectionViewMode] = useState<DataCollectionViewMode>('card');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isOrgEditDialogOpen, setIsOrgEditDialogOpen] = useState(false);
  const [selectedIndicator, setSelectedIndicator] = useState<OutcomeIndicator | null>(null);
  const [formData, setFormData] = useState<Partial<OutcomeIndicator>>({});
  const [orgFormData, setOrgFormData] = useState<Partial<OrganizationalInfo>>({});
  const [highlightedParticular, setHighlightedParticular] = useState<string>('');

  // RBAC permissions check
  const userPermissions = universityOperationsRBACService.getUserPermissions(userEmail, userRole, category);
  const canPerformCRUD = universityOperationsRBACService.canPerformCRUD(userEmail, userRole, category);

  // Load data when year changes
  useEffect(() => {
    const data = generateAssessmentDataByYear(selectedYear);
    setAssessmentData(data);
  }, [selectedYear]);

  // Calculate comprehensive analytics from assessment data
  const overallStats = {
    totalIndicators: assessmentData.length,
    onTarget: assessmentData.filter(item => {
      const avgActual = calculateAverage(item.physicalAccomplishment);
      const avgTarget = calculateAverage(item.physicalTarget);
      return avgActual >= avgTarget;
    }).length,
    belowTarget: assessmentData.filter(item => {
      const avgActual = calculateAverage(item.physicalAccomplishment);
      const avgTarget = calculateAverage(item.physicalTarget);
      return avgActual < avgTarget;
    }).length,
    averageAchievement: assessmentData.length > 0 
      ? assessmentData.reduce((sum, item) => sum + calculateAverage(item.physicalAccomplishment), 0) / assessmentData.length 
      : 0
  };

  // RBAC-based permissions
  const canEdit = canPerformCRUD && (userPermissions.canEdit || userPermissions.canAdd);
  const canDelete = canPerformCRUD && userPermissions.canDelete;

  // Handle analytics card click to redirect to Target vs Actual
  const handleAnalyticsCardClick = (particular: string) => {
    setActiveTab('target-vs-actual');
    if (particular !== 'all') {
      setHighlightedParticular(particular);
      toast.success(`Navigated to Target vs Actual for: ${particular}`);
    } else {
      setHighlightedParticular('');
      toast.success('Navigated to Target vs Actual tab');
    }
  };

  // Handle Performance Stats redirection
  const handleRedirectToDataCollection = () => {
    setActiveTab('target-vs-actual');
    setHighlightedParticular('');
    toast.success('Redirected to Target vs Actual for detailed review');
  };

  // Enhanced validation
  const validateQuarterlyDataWithEmptyRemarks = (data: Partial<OutcomeIndicator>): string[] => {
    const errors: string[] = [];
    
    if (!data.uacsCode?.trim()) {
      errors.push('UACS Code is required');
    }
    
    if (!data.physicalTarget) {
      errors.push('Physical Target data is required');
    } else {
      ['quarter1', 'quarter2', 'quarter3', 'quarter4'].forEach(quarter => {
        const value = data.physicalTarget[quarter as keyof typeof data.physicalTarget];
        if (value !== null && (typeof value !== 'number' || value < 0 || value > 100)) {
          errors.push(`Invalid ${quarter} target value (must be 0-100% or null)`);
        }
      });
    }
    
    if (!data.physicalAccomplishment) {
      errors.push('Physical Accomplishment data is required');
    } else {
      ['quarter1', 'quarter2', 'quarter3', 'quarter4'].forEach(quarter => {
        const value = data.physicalAccomplishment[quarter as keyof typeof data.physicalAccomplishment];
        if (value !== null && (typeof value !== 'number' || value < 0 || value > 100)) {
          errors.push(`Invalid ${quarter} accomplishment value (must be 0-100% or null)`);
        }
      });
    }
    
    return errors;
  };

  const handleEditIndicator = () => {
    // Check RBAC permissions
    if (!canEdit) {
      toast.error('You do not have permission to edit assessment records');
      return;
    }
    
    if (!requireAuth('edit assessment records') || !selectedIndicator) return;
    
    const errors = validateQuarterlyDataWithEmptyRemarks(formData);
    if (errors.length > 0) {
      toast.error('Please fix the following errors: ' + errors.join(', '));
      return;
    }

    const updatedIndicator: OutcomeIndicator = {
      ...selectedIndicator,
      uacsCode: formData.uacsCode || selectedIndicator.uacsCode,
      physicalTarget: formData.physicalTarget || selectedIndicator.physicalTarget,
      physicalAccomplishment: formData.physicalAccomplishment || selectedIndicator.physicalAccomplishment,
      accomplishmentScore: formData.accomplishmentScore || selectedIndicator.accomplishmentScore,
      varianceAsOf: formData.varianceAsOf || selectedIndicator.varianceAsOf,
      variance: typeof formData.variance === 'number' ? formData.variance : selectedIndicator.variance,
      remarks: formData.remarks !== undefined ? formData.remarks : selectedIndicator.remarks,
      updatedAt: new Date(),
      status: userRole === 'Admin' ? 'approved' : 'pending', // Staff submissions need approval
      updatedBy: userEmail
    };
    
    setAssessmentData(prevData => prevData.map(item => 
      item.id === selectedIndicator.id ? updatedIndicator : item
    ));
    setIsEditDialogOpen(false);
    setSelectedIndicator(null);
    setFormData({});
    
    if (userRole === 'Admin') {
      toast.success('Assessment record updated and published successfully');
    } else {
      toast.success('Assessment record updated. Pending admin approval.');
    }
  };

  const handleDeleteIndicator = (indicator: OutcomeIndicator) => {
    // Check RBAC permissions
    if (!canDelete) {
      toast.error('You do not have permission to delete assessment records');
      return;
    }
    
    if (!requireAuth('delete assessment records')) return;
    
    if (confirm(`Are you sure you want to delete "${indicator.particular}"? This action cannot be undone.`)) {
      setAssessmentData(prevData => prevData.filter(item => item.id !== indicator.id));
      toast.success('Assessment record deleted successfully');
    }
  };

  const handleEditOrganizationalInfo = () => {
    // Check RBAC permissions
    if (!canEdit) {
      toast.error('You do not have permission to edit organizational information');
      return;
    }
    
    if (!requireAuth('edit organizational information')) return;
    
    const errors = validateOrganizationalInfo(orgFormData);
    if (errors.length > 0) {
      toast.error('Please fix the following errors: ' + errors.join(', '));
      return;
    }

    const updatedOrgInfo: OrganizationalInfo = {
      ...organizationalInfo,
      ...orgFormData,
      updatedAt: new Date()
    };
    
    setOrganizationalInfo(updatedOrgInfo);
    setIsOrgEditDialogOpen(false);
    setOrgFormData({});
    toast.success('Organizational information updated successfully');
  };

  const openEditDialog = (indicator: OutcomeIndicator) => {
    setSelectedIndicator(indicator);
    setFormData({
      uacsCode: indicator.uacsCode,
      physicalTarget: { ...indicator.physicalTarget },
      physicalAccomplishment: { ...indicator.physicalAccomplishment },
      accomplishmentScore: { ...indicator.accomplishmentScore },
      varianceAsOf: indicator.varianceAsOf,
      variance: indicator.variance,
      remarks: indicator.remarks
    });
    setIsEditDialogOpen(true);
  };

  const openOrgEditDialog = () => {
    setOrgFormData({
      department: organizationalInfo.department,
      agencyEntity: organizationalInfo.agencyEntity,
      operatingUnit: organizationalInfo.operatingUnit,
      organizationCode: organizationalInfo.organizationCode
    });
    setIsOrgEditDialogOpen(true);
  };

  const updateQuarterlyValue = (type: 'physicalTarget' | 'physicalAccomplishment', quarter: string, value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    setFormData(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [quarter]: numValue
      }
    }));
  };

  const updateAccomplishmentScore = (quarter: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      accomplishmentScore: {
        ...prev.accomplishmentScore,
        [quarter]: value
      }
    }));
  };

  return (
    <div className="h-full overflow-auto admin-page-bg">
      <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-6">
        {/* Header Section */}
        <div className="admin-card">
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <GraduationCap className="h-7 w-7 text-blue-600" />
              </div>
              <div className="flex-1">
                <h1 className="text-gray-900 text-2xl mb-1">Higher Education Program</h1>
                <p className="text-base text-gray-600 leading-relaxed">
                  Quarterly assessment and performance monitoring system
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-100">
                <span className="text-sm text-gray-600">Assessment Year:</span>
                <span className="text-lg text-blue-600">{selectedYear}</span>
              </div>
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger className="w-32 border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableYears().map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Performance Statistics */}
        <PerformanceStats 
          stats={overallStats} 
          onRedirectToDataCollection={handleRedirectToDataCollection}
        />

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="admin-card p-1">
            <TabsList className="bg-transparent border-0 p-0 w-full h-auto">
              <div className={`grid gap-1 w-full ${userRole === 'Admin' ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1 sm:grid-cols-3'}`}>
                <TabsTrigger 
                  value="data-analytics" 
                  className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200 border border-transparent py-2.5 text-sm"
                >
                  Data Analytics
                </TabsTrigger>
                <TabsTrigger 
                  value="target-vs-actual" 
                  className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700 data-[state=active]:border-green-200 border border-transparent py-2.5 text-sm"
                >
                  Target vs Actual
                </TabsTrigger>
                <TabsTrigger 
                  value="financial-accomplishment" 
                  className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 data-[state=active]:border-purple-200 border border-transparent py-2.5 text-sm"
                >
                  Financial
                </TabsTrigger>
                {userRole === 'Admin' && (
                  <TabsTrigger 
                    value="permissions" 
                    className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 data-[state=active]:border-emerald-200 border border-transparent py-2.5 text-sm"
                  >
                    <Shield className="h-4 w-4 mr-1.5 inline" />
                    Permissions
                  </TabsTrigger>
                )}
              </div>
            </TabsList>
          </div>

          {/* Data Analytics Tab */}
          <TabsContent value="data-analytics" className="space-y-6">
            <Card className="admin-card border-0">
              <CardHeader className="border-b border-gray-200 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Database className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-gray-900 text-lg">Analytics Dashboard</CardTitle>
                    <CardDescription className="text-sm mt-1">
                      Comprehensive data visualization and insights from assessment data
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <Select value={analyticsView} onValueChange={(value: AnalyticsView) => setAnalyticsView(value)}>
                    <SelectTrigger className="w-full sm:w-48 border-slate-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Data</SelectItem>
                      <SelectItem value="target">Targets Only</SelectItem>
                      <SelectItem value="accomplishment">Accomplishments</SelectItem>
                      <SelectItem value="variance">Variance Analysis</SelectItem>
                    </SelectContent>
                  </Select>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1 text-sm">
                    {analyticsView === 'all' ? 'All Data' : analyticsView.charAt(0).toUpperCase() + analyticsView.slice(1)}
                  </Badge>
                </div>
                <AnalyticsDashboard 
                  assessmentData={assessmentData}
                  FIXED_OUTCOME_INDICATORS={FIXED_OUTCOME_INDICATORS}
                  overallStats={overallStats}
                  onAnalyticsCardClick={handleAnalyticsCardClick}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Target vs Actual Tab */}
          <TabsContent value="target-vs-actual" className="space-y-6">
            {/* Organizational Information */}
            <Card className="admin-card border-0">
              <CardHeader className="border-b border-gray-200 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <Building2 className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-gray-900 text-lg">Organizational Information</CardTitle>
                      <CardDescription className="text-sm mt-1">
                        Department and entity details for assessment reporting
                      </CardDescription>
                    </div>
                  </div>
                  {canEdit && (
                    <Button 
                      onClick={openOrgEditDialog} 
                      variant="outline" 
                      size="sm" 
                      className="border-gray-200 hover:bg-gray-50 h-9"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      <span className="text-sm">Edit</span>
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Office', value: organizationalInfo.department },
                    { label: 'Agency/Entity', value: organizationalInfo.agencyEntity },
                    { label: 'Operating Unit', value: organizationalInfo.operatingUnit },
                    { label: 'Organization Code', value: organizationalInfo.organizationCode }
                  ].map((item, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <Label className="text-sm text-gray-600">{item.label}</Label>
                      <p className="text-base text-gray-900 mt-1.5 truncate" title={item.value}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Outcome Objective */}
            <Card className="admin-card border-0 bg-gradient-to-br from-blue-50/50 to-white">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-base text-blue-900 leading-relaxed">
                    <strong>Outcome Objective:</strong> "Relevant and quality tertiary education ensured to achieve inclusive growth and access of rural but deserving students to quality tertiary education increased"
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Data Collection Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-gray-900 text-xl">Outcome Indicators - {selectedYear}</h2>
                <p className="text-sm text-gray-600 mt-1">Standardized indicators with quarterly performance data</p>
              </div>
              <div className="flex items-center gap-1 border border-gray-200 rounded-md p-1 bg-white">
                <Button
                  variant={dataCollectionViewMode === 'card' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setDataCollectionViewMode('card')}
                  className="h-8 w-8 p-0"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={dataCollectionViewMode === 'list' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setDataCollectionViewMode('list')}
                  className="h-8 w-8 p-0"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={dataCollectionViewMode === 'table' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setDataCollectionViewMode('table')}
                  className="h-8 w-8 p-0"
                >
                  <Table className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Data Collection Views */}
            <DataCollectionViews
              assessmentData={assessmentData}
              FIXED_OUTCOME_INDICATORS={FIXED_OUTCOME_INDICATORS}
              viewMode={dataCollectionViewMode}
              canEdit={canEdit}
              canDelete={canDelete}
              onEdit={openEditDialog}
              onDelete={handleDeleteIndicator}
              showCriteria={false}
              highlightedParticular={highlightedParticular}
            />
          </TabsContent>

          {/* Financial Accomplishment Tab */}
          <TabsContent value="financial-accomplishment" className="space-y-6">
            <FinancialAccomplishmentTab
              selectedYear={selectedYear}
              userRole={userRole}
              canEdit={canEdit}
              requireAuth={requireAuth}
            />
          </TabsContent>

          {/* Permissions Management Tab - Admin Only */}
          {userRole === 'Admin' && (
            <TabsContent value="permissions" className="space-y-6">
              <PermissionsManager
                category={category}
                userRole={userRole}
                currentUserEmail={userEmail}
              />
              <Card className="admin-card border-0 bg-blue-50/50">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-blue-100 rounded-lg">
                      <Shield className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-base text-gray-900 mb-2">Access Control Information</h4>
                      <p className="text-sm text-gray-600 leading-relaxed mb-3">
                        Only assigned personnel can add, edit, or delete assessment data in the Target vs Actual tab. 
                        Staff submissions require admin approval before being published.
                      </p>
                      <div className="text-sm text-gray-700 space-y-1">
                        <p>• <strong>Staff/Editor:</strong> Can submit data as "Pending" status</p>
                        <p>• <strong>Admin:</strong> Can approve and publish all submissions</p>
                        <p>• <strong>Client:</strong> Can view approved data only</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        {/* Enhanced Edit Assessment Dialog */}
        <EditAssessmentModal
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          selectedIndicator={selectedIndicator}
          formData={formData}
          onSave={handleEditIndicator}
          onFieldChange={(field, value) => setFormData(prev => ({ ...prev, [field]: value }))}
          onQuarterlyValueChange={updateQuarterlyValue}
          onAccomplishmentScoreChange={updateAccomplishmentScore}
        />

        {/* Enhanced Organizational Info Dialog with responsive design */}
        <Dialog open={isOrgEditDialogOpen} onOpenChange={setIsOrgEditDialogOpen}>
          <DialogContent className="max-w-[95vw] sm:max-w-2xl bg-white border-0 shadow-xl">
            <DialogHeader className="bg-gradient-to-r from-green-800 to-emerald-800 text-white -m-6 p-4 sm:p-6 mb-0">
              <DialogTitle className="flex items-center gap-3 text-base sm:text-lg">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Building2 className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <span>Organizational Information Management</span>
              </DialogTitle>
              <DialogDescription className="text-green-100 mt-2 text-sm sm:text-base">
                Update organizational details for the Higher Education Program
              </DialogDescription>
            </DialogHeader>
            
            <div className="p-4 sm:p-6 space-y-4">
              <div>
                <Label htmlFor="department" className="text-sm font-semibold text-slate-700 mb-2 block">Department</Label>
                <Input
                  id="department"
                  value={orgFormData.department || ''}
                  onChange={(e) => setOrgFormData(prev => ({ ...prev, department: e.target.value }))}
                  placeholder="Enter department name"
                  className="border-slate-300 bg-white"
                />
              </div>

              <div>
                <Label htmlFor="agencyEntity" className="text-sm font-semibold text-slate-700 mb-2 block">Agency/Entity</Label>
                <Input
                  id="agencyEntity"
                  value={orgFormData.agencyEntity || ''}
                  onChange={(e) => setOrgFormData(prev => ({ ...prev, agencyEntity: e.target.value }))}
                  placeholder="Enter agency or entity name"
                  className="border-slate-300 bg-white"
                />
              </div>

              <div>
                <Label htmlFor="operatingUnit" className="text-sm font-semibold text-slate-700 mb-2 block">Operating Unit</Label>
                <Input
                  id="operatingUnit"
                  value={orgFormData.operatingUnit || ''}
                  onChange={(e) => setOrgFormData(prev => ({ ...prev, operatingUnit: e.target.value }))}
                  placeholder="Enter operating unit name"
                  className="border-slate-300 bg-white"
                />
              </div>

              <div>
                <Label htmlFor="organizationCode" className="text-sm font-semibold text-slate-700 mb-2 block">Organization Code</Label>
                <Input
                  id="organizationCode"
                  value={orgFormData.organizationCode || ''}
                  onChange={(e) => setOrgFormData(prev => ({ ...prev, organizationCode: e.target.value }))}
                  placeholder="Enter organization code"
                  className="border-slate-300 bg-white"
                />
              </div>
            </div>

            <DialogFooter className="bg-slate-100 border-t border-slate-300 -m-6 mt-0 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between w-full gap-3 sm:gap-0">
                <Button variant="outline" onClick={() => setIsOrgEditDialogOpen(false)} className="border-slate-300 order-2 sm:order-1">
                  Cancel
                </Button>
                <Button onClick={handleEditOrganizationalInfo} className="bg-green-600 hover:bg-green-700 order-1 sm:order-2">
                  <Building2 className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}