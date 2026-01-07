import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Badge } from '../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Accessibility, TrendingUp, BarChart3, Database, Calendar, ChevronLeft, ChevronRight, Edit, Trash2, Plus, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { mockPWDParityData } from '../data/mockGenderParityData';
import { PWDParityData } from '../types/GenderParityTypes';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../ui/alert-dialog';

interface PWDParityDataManagerProps {
  userRole: string;
  requireAuth: (action: string) => boolean;
}

const PWD_POPULATION_CATEGORIES = [
  'Students',
  'Faculty',
  'Staff',
  'Visiting Scholars',
  'Community Members',
  'Alumni Network'
];

const PWD_SUPPORT_SERVICES = [
  'Accessibility Support',
  'Scholarship Programs',
  'Career Placement',
  'Counseling Services',
  'Assistive Technology',
  'Academic Accommodations'
];

export function PWDParityDataManager({ userRole, requireAuth }: PWDParityDataManagerProps) {
  const [data, setData] = useState<PWDParityData[]>(mockPWDParityData);
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<PWDParityData | null>(null);
  const [selectedYear, setSelectedYear] = useState('2023-2024');
  const [activeTab, setActiveTab] = useState('analytics');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | null>(null);
  const [selectedItem, setSelectedItem] = useState<PWDParityData | null>(null);
  const [formData, setFormData] = useState({
    academicYear: '2023-2024',
    pwdCategory: 'population' as 'population' | 'support',
    subcategory: '',
    totalBeneficiaries: 0,
    maleCount: 0,
    femaleCount: 0
  });

  const canEdit = userRole === 'Admin' || userRole === 'Staff';
  const isAdmin = userRole === 'Admin';
  const itemsPerPage = 10;

  // Generate list of academic years
  const academicYears = ['2023-2024', '2022-2023', '2021-2022', '2020-2021', '2019-2020'];

  // Filter data by selected year and approval status (only approved data for analytics)
  const approvedData = data.filter(item => item.academicYear === selectedYear && item.status === 'approved');
  
  // Filter for data collection view
  const filteredData = data.filter(item => {
    const yearMatch = item.academicYear === selectedYear;
    const statusMatch = statusFilter === 'all' || item.status === statusFilter;
    return yearMatch && statusMatch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Reset to page 1 when year changes
  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    setCurrentPage(1);
  };

  const calculatePercentages = (male: number, female: number, total: number) => {
    if (total === 0) return { malePercentage: 0, femalePercentage: 0 };
    return {
      malePercentage: Math.round((male / total) * 100),
      femalePercentage: Math.round((female / total) * 100)
    };
  };

  const handleAdd = () => {
    if (!requireAuth('add PWD parity data')) return;
    setEditingItem(null);
    setFormData({ 
      academicYear: selectedYear, 
      pwdCategory: 'population',
      subcategory: '',
      totalBeneficiaries: 0, 
      maleCount: 0, 
      femaleCount: 0
    });
    setShowDialog(true);
  };

  const handleEdit = (item: PWDParityData) => {
    if (!requireAuth('edit PWD parity data')) return;
    setEditingItem(item);
    setFormData({ 
      academicYear: item.academicYear, 
      pwdCategory: item.pwdCategory,
      subcategory: item.subcategory,
      totalBeneficiaries: item.totalBeneficiaries, 
      maleCount: item.maleCount, 
      femaleCount: item.femaleCount
    });
    setShowDialog(true);
  };

  const handleDelete = (id: string) => {
    if (!requireAuth('delete PWD parity data')) return;
    setData(data.filter(item => item.id !== id));
    toast.success('PWD parity data deleted successfully');
    
    // Adjust current page if necessary
    const newFilteredData = data.filter(item => item.id !== id && item.academicYear === selectedYear);
    const newTotalPages = Math.ceil(newFilteredData.length / itemsPerPage);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    }
  };

  const handleSave = () => {
    if (!formData.subcategory || formData.totalBeneficiaries === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.maleCount + formData.femaleCount !== formData.totalBeneficiaries) {
      toast.error('Male and Female counts must equal Total Beneficiaries');
      return;
    }

    const percentages = calculatePercentages(formData.maleCount, formData.femaleCount, formData.totalBeneficiaries);
    const status = isAdmin ? 'approved' : 'pending';

    if (editingItem) {
      setData(data.map(item => 
        item.id === editingItem.id 
          ? { 
              ...item, 
              ...formData, 
              ...percentages,
              status: isAdmin ? item.status : status, // Admin can maintain status, Staff sets to pending
              updatedAt: new Date() 
            }
          : item
      ));
      toast.success(`PWD parity data updated${!isAdmin ? ' and submitted for review' : ' successfully'}`);
    } else {
      const newItem: PWDParityData = {
        id: `pwd-${Date.now()}`,
        ...formData,
        ...percentages,
        status,
        submittedBy: 'current-user@carsu.edu.ph',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setData([...data, newItem]);
      toast.success(`PWD parity data added${!isAdmin ? ' and submitted for review' : ' successfully'}`);
    }
    setShowDialog(false);
  };

  const handleApprovalRequest = (item: PWDParityData, action: 'approve' | 'reject') => {
    if (!isAdmin) {
      toast.error('Only administrators can approve or reject submissions');
      return;
    }
    setSelectedItem(item);
    setApprovalAction(action);
    setShowApprovalDialog(true);
  };

  const confirmApproval = () => {
    if (!selectedItem || !approvalAction) return;

    const newStatus = approvalAction === 'approve' ? 'approved' : 'rejected';
    setData(data.map(item =>
      item.id === selectedItem.id
        ? {
            ...item,
            status: newStatus,
            reviewedBy: 'admin@carsu.edu.ph',
            reviewedAt: new Date()
          }
        : item
    ));

    toast.success(`Data ${approvalAction}d successfully`);
    setShowApprovalDialog(false);
    setSelectedItem(null);
    setApprovalAction(null);
  };

  // Prepare radar chart data - PWD Population Distribution
  const populationData = PWD_POPULATION_CATEGORIES.map(category => {
    const catItems = approvedData.filter(item => item.pwdCategory === 'population' && item.subcategory === category);
    const totalMale = catItems.reduce((sum, item) => sum + item.maleCount, 0);
    const totalFemale = catItems.reduce((sum, item) => sum + item.femaleCount, 0);
    const total = totalMale + totalFemale;
    return {
      category: category.length > 15 ? category.substring(0, 13) + '...' : category,
      malePercentage: total > 0 ? Math.round((totalMale / total) * 100) : 0,
      femalePercentage: total > 0 ? Math.round((totalFemale / total) * 100) : 0,
      total
    };
  }).filter(item => item.total > 0);

  // Prepare radar chart data - PWD Support Services
  const supportServicesData = PWD_SUPPORT_SERVICES.map(service => {
    const serviceItems = approvedData.filter(item => item.pwdCategory === 'support' && item.subcategory === service);
    const totalMale = serviceItems.reduce((sum, item) => sum + item.maleCount, 0);
    const totalFemale = serviceItems.reduce((sum, item) => sum + item.femaleCount, 0);
    const total = totalMale + totalFemale;
    return {
      service: service.length > 15 ? service.substring(0, 13) + '...' : service,
      malePercentage: total > 0 ? Math.round((totalMale / total) * 100) : 0,
      femalePercentage: total > 0 ? Math.round((totalFemale / total) * 100) : 0,
      total
    };
  }).filter(item => item.total > 0);

  // Calculate key insights
  const calculateInsights = () => {
    if (approvedData.length === 0) return null;

    const totalBeneficiaries = approvedData.reduce((sum, item) => sum + item.totalBeneficiaries, 0);
    const totalMale = approvedData.reduce((sum, item) => sum + item.maleCount, 0);
    const totalFemale = approvedData.reduce((sum, item) => sum + item.femaleCount, 0);
    const avgMalePercentage = (totalMale / totalBeneficiaries) * 100;
    const avgFemalePercentage = (totalFemale / totalBeneficiaries) * 100;

    const populationCount = approvedData.filter(item => item.pwdCategory === 'population').reduce((sum, item) => sum + item.totalBeneficiaries, 0);
    const supportServicesCount = approvedData.filter(item => item.pwdCategory === 'support').reduce((sum, item) => sum + item.totalBeneficiaries, 0);

    const uniquePopulationCategories = new Set(approvedData.filter(item => item.pwdCategory === 'population').map(item => item.subcategory)).size;
    const uniqueSupportServices = new Set(approvedData.filter(item => item.pwdCategory === 'support').map(item => item.subcategory)).size;

    return {
      totalRecords: approvedData.length,
      totalBeneficiaries,
      avgMalePercentage: avgMalePercentage.toFixed(1),
      avgFemalePercentage: avgFemalePercentage.toFixed(1),
      populationCount,
      supportServicesCount,
      uniquePopulationCategories,
      uniqueSupportServices
    };
  };

  const insights = calculateInsights();

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { className: string; icon: React.ReactNode }> = {
      'pending': { 
        className: 'bg-amber-100 text-amber-700 border-amber-300',
        icon: <Clock className="h-3 w-3" />
      },
      'approved': { 
        className: 'bg-emerald-100 text-emerald-700 border-emerald-300',
        icon: <CheckCircle className="h-3 w-3" />
      },
      'rejected': { 
        className: 'bg-red-100 text-red-700 border-red-300',
        icon: <XCircle className="h-3 w-3" />
      }
    };
    const variant = variants[status] || variants['pending'];
    return (
      <Badge className={`${variant.className} flex items-center gap-1`}>
        {variant.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const subcategoryOptions = formData.pwdCategory === 'population' ? PWD_POPULATION_CATEGORIES : PWD_SUPPORT_SERVICES;

  return (
    <div className="space-y-6">
      {/* Year Filter */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-emerald-600" />
              <Label>Academic Year Filter</Label>
            </div>
            <Select value={selectedYear} onValueChange={handleYearChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {academicYears.map(year => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs: Data Analytics and Data Collection */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-white border border-gray-200 p-1 rounded-lg">
          <TabsTrigger 
            value="analytics"
            className="flex items-center gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white rounded-md transition-all"
          >
            <BarChart3 className="h-4 w-4" />
            <span>Data Analytics</span>
          </TabsTrigger>
          <TabsTrigger 
            value="collection"
            className="flex items-center gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white rounded-md transition-all"
          >
            <Database className="h-4 w-4" />
            <span>Data Collection</span>
          </TabsTrigger>
        </TabsList>

        {/* Data Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6 mt-6">
          {/* Radar Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-white border-b border-gray-200">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Accessibility className="h-5 w-5 text-emerald-600" />
                  PWD Population Distribution
                </CardTitle>
                <CardDescription>Gender distribution across PWD categories ({selectedYear})</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {populationData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={populationData}>
                      <PolarGrid stroke="#e5e7eb" strokeWidth={1} />
                      <PolarAngleAxis 
                        dataKey="category" 
                        tick={{ fill: '#374151', fontSize: 11, fontWeight: 500 }}
                      />
                      <PolarRadiusAxis 
                        angle={90} 
                        domain={[0, 100]} 
                        tick={{ fill: '#6b7280', fontSize: 10 }}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <Radar
                        name="Female %"
                        dataKey="femalePercentage"
                        stroke="#a855f7"
                        fill="#a855f7"
                        fillOpacity={0.6}
                        strokeWidth={2}
                      />
                      <Radar
                        name="Male %"
                        dataKey="malePercentage"
                        stroke="#6366f1"
                        fill="#6366f1"
                        fillOpacity={0.4}
                        strokeWidth={2}
                      />
                      <Legend 
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconType="circle"
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '12px'
                        }}
                        formatter={(value: any) => `${value}%`}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[400px] flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <Accessibility className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>No population data available for {selectedYear}</p>
                      <p className="text-sm mt-2">Approved data will appear here</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-white border-b border-gray-200">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Accessibility className="h-5 w-5 text-emerald-600" />
                  PWD Support Services
                </CardTitle>
                <CardDescription>Gender distribution across support services ({selectedYear})</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {supportServicesData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={supportServicesData}>
                      <PolarGrid stroke="#e5e7eb" strokeWidth={1} />
                      <PolarAngleAxis 
                        dataKey="service" 
                        tick={{ fill: '#374151', fontSize: 11, fontWeight: 500 }}
                      />
                      <PolarRadiusAxis 
                        angle={90} 
                        domain={[0, 100]} 
                        tick={{ fill: '#6b7280', fontSize: 10 }}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <Radar
                        name="Female %"
                        dataKey="femalePercentage"
                        stroke="#a855f7"
                        fill="#a855f7"
                        fillOpacity={0.6}
                        strokeWidth={2}
                      />
                      <Radar
                        name="Male %"
                        dataKey="malePercentage"
                        stroke="#6366f1"
                        fill="#6366f1"
                        fillOpacity={0.4}
                        strokeWidth={2}
                      />
                      <Legend 
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconType="circle"
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '12px'
                        }}
                        formatter={(value: any) => `${value}%`}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[400px] flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <Accessibility className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>No support services data available for {selectedYear}</p>
                      <p className="text-sm mt-2">Approved data will appear here</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Key Insights */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-white border-b border-gray-200">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
                Key Insights for {selectedYear}
              </CardTitle>
              <CardDescription>Critical metrics from approved PWD gender parity data</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {insights ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-indigo-50 to-white rounded-lg p-5 border border-indigo-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <Accessibility className="h-5 w-5 text-indigo-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900">Total Beneficiaries</h4>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-indigo-600">{insights.totalBeneficiaries}</span>
                      <span className="text-sm text-gray-600">individuals</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-white rounded-lg p-5 border border-purple-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-purple-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900">Gender Distribution</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Male</span>
                        <span className="font-semibold text-indigo-600">{insights.avgMalePercentage}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Female</span>
                        <span className="font-semibold text-purple-600">{insights.avgFemalePercentage}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg p-5 border border-blue-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Database className="h-5 w-5 text-blue-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900">Population</h4>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-blue-600">{insights.populationCount}</span>
                      <span className="text-sm text-gray-600">individuals</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-50 to-white rounded-lg p-5 border border-emerald-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <BarChart3 className="h-5 w-5 text-emerald-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900">Support Services</h4>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-emerald-600">{insights.supportServicesCount}</span>
                      <span className="text-sm text-gray-600">beneficiaries</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <TrendingUp className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No insights available for {selectedYear}</p>
                  <p className="text-sm mt-2">Approved data will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Collection Tab */}
        <TabsContent value="collection" className="space-y-6 mt-6">
          <Card className="border-purple-100 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-white border-b border-purple-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2 text-purple-900">
                    <Database className="h-5 w-5 text-purple-600" />
                    Comprehensive PWD Distribution
                  </CardTitle>
                  <CardDescription>
                    Complete gender representation across all PWD categories and services
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <Select value={statusFilter} onValueChange={(value: any) => {
                      setStatusFilter(value);
                      setCurrentPage(1);
                    }}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  {canEdit && (
                    <Button onClick={handleAdd} className="gap-2 bg-purple-600 hover:bg-purple-700">
                      <Plus className="h-4 w-4" />
                      Add Data
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-purple-200">
                      <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700 bg-purple-50/50">Category / Service</th>
                      <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700 bg-purple-50/50">Type</th>
                      <th className="text-right py-4 px-4 text-sm font-semibold text-gray-700 bg-purple-50/50">Total Beneficiaries</th>
                      <th className="text-right py-4 px-4 text-sm font-semibold text-gray-700 bg-purple-50/50">Male %</th>
                      <th className="text-right py-4 px-4 text-sm font-semibold text-gray-700 bg-purple-50/50">Female %</th>
                      {isAdmin && <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700 bg-purple-50/50">Status</th>}
                      {canEdit && <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700 bg-purple-50/50">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedData.length > 0 ? (
                      paginatedData.map((pwd, index) => (
                        <tr key={pwd.id} className={`hover:bg-purple-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                          <td className="py-4 px-4 font-medium text-gray-900">{pwd.subcategory}</td>
                          <td className="text-center py-4 px-4">
                            <Badge className={pwd.pwdCategory === 'population' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-green-100 text-green-700 border-green-200'}>
                              {pwd.pwdCategory === 'population' ? 'Population' : 'Support Service'}
                            </Badge>
                          </td>
                          <td className="text-right py-4 px-4 text-gray-900">{pwd.totalBeneficiaries}</td>
                          <td className="text-right py-4 px-4">
                            <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">
                              {pwd.malePercentage}%
                            </Badge>
                          </td>
                          <td className="text-right py-4 px-4">
                            <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                              {pwd.femalePercentage}%
                            </Badge>
                          </td>
                          {isAdmin && (
                            <td className="text-center py-4 px-4">
                              {getStatusBadge(pwd.status)}
                            </td>
                          )}
                          {canEdit && (
                            <td className="text-center py-4 px-4">
                              <div className="flex items-center justify-center gap-2">
                                {isAdmin && pwd.status === 'pending' && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleApprovalRequest(pwd, 'approve')}
                                      className="h-8 w-8 p-0 hover:bg-emerald-100 text-emerald-600"
                                      title="Approve"
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleApprovalRequest(pwd, 'reject')}
                                      className="h-8 w-8 p-0 hover:bg-red-100 text-red-600"
                                      title="Reject"
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(pwd)}
                                  className="h-8 w-8 p-0 hover:bg-purple-100"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(pwd.id)}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={isAdmin ? 7 : 6} className="py-12 text-center text-gray-500">
                          <Database className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                          <p>No PWD data available for {selectedYear}</p>
                          <p className="text-sm mt-2">Click &quot;Add Data&quot; to get started</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-purple-100">
                  <div className="text-sm text-gray-600">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} records
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(page => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className={currentPage === page ? "bg-purple-600 hover:bg-purple-700" : ""}
                        >
                          {page}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="gap-1"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="text-xl">{editingItem ? 'Edit' : 'Add'} PWD Parity Data</DialogTitle>
            <DialogDescription>
              Enter gender distribution data for PWD population or support services.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="academicYear" className="text-sm font-medium">Academic Year</Label>
                <Input 
                  id="academicYear" 
                  value={formData.academicYear} 
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })} 
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pwdCategory" className="text-sm font-medium">Category Type</Label>
                <Select 
                  value={formData.pwdCategory} 
                  onValueChange={(value: 'population' | 'support') => setFormData({ ...formData, pwdCategory: value, subcategory: '' })}
                >
                  <SelectTrigger id="pwdCategory" className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="population">Population</SelectItem>
                    <SelectItem value="support">Support Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subcategory" className="text-sm font-medium">
                {formData.pwdCategory === 'population' ? 'Population Category' : 'Support Service Type'}
              </Label>
              <Select 
                value={formData.subcategory} 
                onValueChange={(value) => setFormData({ ...formData, subcategory: value })}
              >
                <SelectTrigger id="subcategory" className="h-10">
                  <SelectValue placeholder={`Select ${formData.pwdCategory === 'population' ? 'category' : 'service'}`} />
                </SelectTrigger>
                <SelectContent>
                  {subcategoryOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalBeneficiaries" className="text-sm font-medium">Total Beneficiaries</Label>
                <Input 
                  id="totalBeneficiaries" 
                  type="number" 
                  min="0" 
                  value={formData.totalBeneficiaries} 
                  onChange={(e) => setFormData({ ...formData, totalBeneficiaries: Number(e.target.value) })} 
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maleCount" className="text-sm font-medium">Male Count</Label>
                <Input 
                  id="maleCount" 
                  type="number" 
                  min="0" 
                  value={formData.maleCount} 
                  onChange={(e) => setFormData({ ...formData, maleCount: Number(e.target.value) })} 
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="femaleCount" className="text-sm font-medium">Female Count</Label>
                <Input 
                  id="femaleCount" 
                  type="number" 
                  min="0" 
                  value={formData.femaleCount} 
                  onChange={(e) => setFormData({ ...formData, femaleCount: Number(e.target.value) })} 
                  className="h-10"
                />
              </div>
            </div>
            {formData.totalBeneficiaries > 0 && formData.maleCount + formData.femaleCount === formData.totalBeneficiaries && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Male Percentage:</span>
                    <span className="font-semibold text-indigo-600">
                      {Math.round((formData.maleCount / formData.totalBeneficiaries) * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Female Percentage:</span>
                    <span className="font-semibold text-purple-600">
                      {Math.round((formData.femaleCount / formData.totalBeneficiaries) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            )}
            {!isAdmin && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> Your submission will be pending until reviewed by an administrator.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
              {editingItem ? 'Update' : isAdmin ? 'Add' : 'Submit for Review'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approval Dialog */}
      <AlertDialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {approvalAction === 'approve' ? 'Approve' : 'Reject'} Submission
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {approvalAction} this PWD parity data submission? 
              {approvalAction === 'approve' && ' This data will be published to the analytics dashboard.'}
              {approvalAction === 'reject' && ' The submitter will be notified of the rejection.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmApproval}
              className={approvalAction === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {approvalAction === 'approve' ? 'Approve' : 'Reject'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
