import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Badge } from '../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '../../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../ui/select';
import { Plus, Edit, Trash2, GraduationCap, TrendingUp, BarChart3, Database, Calendar, ChevronLeft, ChevronRight, CheckCircle, XCircle, Clock, Shield, AlertCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { mockStudentParityData, mockGenderParityMetrics } from '../data/mockGenderParityData';
import { StudentParityData, DataStatus } from '../types/GenderParityTypes';
import { PermissionsManager } from './PermissionsManager';
import { EditApprovalDialog, EditHistory } from './EditApprovalDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../ui/alert-dialog';
import { rbacService } from '../services/RBACService';
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

interface StudentParityDataManagerProps {
  userRole: string;
  userEmail: string;
  userName: string;
}

export function StudentParityDataManager({ userRole, userEmail, userName }: StudentParityDataManagerProps) {
  const [data, setData] = useState<StudentParityData[]>(mockStudentParityData);
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<StudentParityData | null>(null);
  const [selectedYear, setSelectedYear] = useState('2023-2024');
  const [activeTab, setActiveTab] = useState('analytics');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedItemForReview, setSelectedItemForReview] = useState<StudentParityData | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [formData, setFormData] = useState({
    academicYear: '2023-2024',
    program: '',
    admissionTotal: 0,
    admissionMale: 0,
    admissionFemale: 0,
    graduationTotal: 0,
    graduationMale: 0,
    graduationFemale: 0
  });

  const isAdmin = userRole === 'Admin';
  const itemsPerPage = 10;

  // Get user permissions from RBAC service
  const permissions = rbacService.getUserPermissions(userEmail, userRole, 'students');

  // Check if user can access data collection at all
  const canAccessDataCollection = isAdmin || rbacService.canPerformCRUD(userEmail, userRole, 'students');

  // Academic years
  const academicYears = ['2023-2024', '2022-2023', '2021-2022', '2020-2021', '2019-2020'];

  // Filter data by year and status - Analytics only shows APPROVED data
  const approvedData = data.filter(item => 
    item.academicYear === selectedYear && item.status === 'approved'
  );

  // Data collection shows data based on status filter
  const dataCollectionItems = data.filter(item => {
    if (item.academicYear !== selectedYear) return false;
    if (statusFilter === 'all') return true;
    return item.status === statusFilter;
  });

  // Pagination
  const totalPages = Math.ceil(dataCollectionItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = dataCollectionItems.slice(startIndex, endIndex);

  // Pending count for badge
  const pendingCount = data.filter(item => item.status === 'pending').length;

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    setCurrentPage(1);
  };

  const handleAdd = () => {
    if (!permissions.canAdd) {
      toast.error('You do not have permission to add data');
      return;
    }
    
    setEditingItem(null);
    setFormData({
      academicYear: selectedYear,
      program: '',
      admissionTotal: 0,
      admissionMale: 0,
      admissionFemale: 0,
      graduationTotal: 0,
      graduationMale: 0,
      graduationFemale: 0
    });
    setShowDialog(true);
  };

  const handleEdit = (item: StudentParityData) => {
    if (!permissions.canEdit) {
      toast.error('You do not have permission to edit data');
      return;
    }

    // Staff cannot edit approved data, only pending or their own
    if (!isAdmin && item.status === 'approved') {
      toast.error('Cannot edit approved data. Please contact an administrator');
      return;
    }
    
    setEditingItem(item);
    setFormData({
      academicYear: item.academicYear,
      program: item.program,
      admissionMale: item.admissionMale,
      admissionFemale: item.admissionFemale,
      graduationMale: item.graduationMale,
      graduationFemale: item.graduationFemale
    });
    setShowDialog(true);
  };

  const handleDelete = (item: StudentParityData) => {
    if (!permissions.canDelete) {
      toast.error('You do not have permission to delete data');
      return;
    }

    // Staff cannot delete approved data
    if (!isAdmin && item.status === 'approved') {
      toast.error('Cannot delete approved data. Please contact an administrator');
      return;
    }

    setData(data.filter(d => d.id !== item.id));
    toast.success('Student parity data deleted successfully');
    
    // Adjust pagination
    const newFilteredData = data.filter(d => d.id !== item.id && d.academicYear === selectedYear);
    const newTotalPages = Math.ceil(newFilteredData.length / itemsPerPage);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    }
  };

  const handleSave = () => {
    // Validation
    if (!formData.program) {
      toast.error('Please enter a program name');
      return;
    }

    if (formData.admissionTotal <= 0) {
      toast.error('Admission total must be greater than 0');
      return;
    }

    if (formData.admissionMale + formData.admissionFemale !== formData.admissionTotal) {
      toast.error('Admission male + female must equal total');
      return;
    }

    if (formData.graduationTotal <= 0) {
      toast.error('Graduation total must be greater than 0');
      return;
    }

    if (formData.graduationMale + formData.graduationFemale !== formData.graduationTotal) {
      toast.error('Graduation male + female must equal total');
      return;
    }

    // Calculate percentages
    const admissionMalePercent = Math.round((formData.admissionMale / formData.admissionTotal) * 100);
    const admissionFemalePercent = Math.round((formData.admissionFemale / formData.admissionTotal) * 100);
    const graduationMalePercent = Math.round((formData.graduationMale / formData.graduationTotal) * 100);
    const graduationFemalePercent = Math.round((formData.graduationFemale / formData.graduationTotal) * 100);

    // ALL submissions start as pending (including admin)
    const status: DataStatus = 'pending';
    const now = new Date();

    if (editingItem) {
      // Editing existing item
      const updatedItem: StudentParityData = {
        ...editingItem,
        program: formData.program,
        academicYear: formData.academicYear,
        admissionMale: admissionMalePercent,
        admissionFemale: admissionFemalePercent,
        graduationMale: graduationMalePercent,
        graduationFemale: graduationFemalePercent,
        status,
        submittedBy: userEmail,
        reviewedBy: undefined,
        reviewedAt: undefined,
        updatedAt: now
      };

      setData(data.map(item => item.id === editingItem.id ? updatedItem : item));
      toast.success('Changes submitted for review. Awaiting admin approval');
    } else {
      // Adding new item
      const newItem: StudentParityData = {
        id: `student-${Date.now()}`,
        program: formData.program,
        academicYear: formData.academicYear,
        admissionMale: admissionMalePercent,
        admissionFemale: admissionFemalePercent,
        graduationMale: graduationMalePercent,
        graduationFemale: graduationFemalePercent,
        status,
        submittedBy: userEmail,
        reviewedBy: undefined,
        reviewedAt: undefined,
        createdAt: now,
        updatedAt: now
      };

      setData([...data, newItem]);
      toast.success('Data submitted for review. Awaiting admin approval');
    }

    setShowDialog(false);
  };

  const handleReviewItem = (item: StudentParityData) => {
    if (!isAdmin) {
      toast.error('Only administrators can review submissions');
      return;
    }
    setSelectedItemForReview(item);
    setShowReviewDialog(true);
  };

  const handleApprove = () => {
    if (!selectedItemForReview || !isAdmin) return;

    const now = new Date();
    const approvedItem: StudentParityData = {
      ...selectedItemForReview,
      status: 'approved',
      reviewedBy: userEmail,
      reviewedAt: now,
      updatedAt: now
    };

    setData(data.map(item => item.id === selectedItemForReview.id ? approvedItem : item));
    toast.success('Data approved and published to analytics');
    setShowReviewDialog(false);
    setSelectedItemForReview(null);
  };

  const handleReject = () => {
    if (!selectedItemForReview || !isAdmin) return;

    const now = new Date();
    const rejectedItem: StudentParityData = {
      ...selectedItemForReview,
      status: 'rejected',
      reviewedBy: userEmail,
      reviewedAt: now,
      updatedAt: now
    };

    setData(data.map(item => item.id === selectedItemForReview.id ? rejectedItem : item));
    toast.success('Data rejected');
    setShowReviewDialog(false);
    setSelectedItemForReview(null);
  };

  // Analytics data (only approved)
  const admissionRadarData = approvedData.map(item => ({
    program: item.program,
    malePercentage: item.admissionMale,
    femalePercentage: item.admissionFemale
  }));

  const graduationRadarData = approvedData.map(item => ({
    program: item.program,
    malePercentage: item.graduationMale,
    femalePercentage: item.graduationFemale
  }));

  // Calculate insights (only from approved data)
  const calculateInsights = () => {
    if (approvedData.length === 0) return null;

    const totalAdmissionMale = approvedData.reduce((sum, item) => sum + item.admissionMale, 0);
    const totalAdmissionFemale = approvedData.reduce((sum, item) => sum + item.admissionFemale, 0);
    const avgAdmissionMale = totalAdmissionMale / approvedData.length;
    const avgAdmissionFemale = totalAdmissionFemale / approvedData.length;

    const totalGraduationMale = approvedData.reduce((sum, item) => sum + item.graduationMale, 0);
    const totalGraduationFemale = approvedData.reduce((sum, item) => sum + item.graduationFemale, 0);
    const avgGraduationMale = totalGraduationMale / approvedData.length;
    const avgGraduationFemale = totalGraduationFemale / approvedData.length;

    // Find most balanced program
    const balanceScores = approvedData.map(item => ({
      program: item.program,
      admissionBalance: Math.abs(50 - item.admissionMale),
      graduationBalance: Math.abs(50 - item.graduationMale)
    }));
    const mostBalanced = balanceScores.reduce((min, curr) => 
      (curr.admissionBalance + curr.graduationBalance) < (min.admissionBalance + min.graduationBalance) ? curr : min
    );

    // Find programs needing attention
    const needsAttention = approvedData.filter(item => 
      Math.abs(item.admissionMale - 50) > 30 || Math.abs(item.graduationMale - 50) > 30
    );

    return {
      avgAdmissionMale: avgAdmissionMale.toFixed(1),
      avgAdmissionFemale: avgAdmissionFemale.toFixed(1),
      avgGraduationMale: avgGraduationMale.toFixed(1),
      avgGraduationFemale: avgGraduationFemale.toFixed(1),
      mostBalanced: mostBalanced.program,
      needsAttentionCount: needsAttention.length,
      totalPrograms: approvedData.length
    };
  };

  const insights = calculateInsights();

  const getStatusBadge = (value: number, target: number) => {
    if (value >= target) {
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
    return 'bg-amber-100 text-amber-700 border-amber-200';
  };

  const getDataStatusBadge = (status: DataStatus) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Approved
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-amber-100 text-amber-700 border-amber-200 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        );
    }
  };

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

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-3' : (canAccessDataCollection ? 'grid-cols-2' : 'grid-cols-1')} bg-white border border-gray-200 p-1 rounded-lg`}>
          <TabsTrigger 
            value="analytics"
            className="flex items-center gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white rounded-md transition-all"
          >
            <BarChart3 className="h-4 w-4" />
            <span>Data Analytics</span>
          </TabsTrigger>
          {canAccessDataCollection && (
            <TabsTrigger 
              value="collection"
              className="flex items-center gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white rounded-md transition-all"
            >
              <Database className="h-4 w-4" />
              <span>Data Collection</span>
              {pendingCount > 0 && isAdmin && (
                <Badge className="ml-2 bg-amber-500 text-white">{pendingCount}</Badge>
              )}
            </TabsTrigger>
          )}
          {isAdmin && (
            <TabsTrigger 
              value="settings"
              className="flex items-center gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white rounded-md transition-all"
            >
              <Shield className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
          )}
        </TabsList>

        {/* Data Analytics Tab - Only shows APPROVED data */}
        <TabsContent value="analytics" className="space-y-6 mt-6">
          {/* Radar Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-white border-b border-gray-200">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <GraduationCap className="h-5 w-5 text-emerald-600" />
                  Admission Gender Parity
                </CardTitle>
                <CardDescription>Approved gender distribution by program ({selectedYear})</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {approvedData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={admissionRadarData}>
                      <PolarGrid stroke="#e5e7eb" strokeWidth={1} />
                      <PolarAngleAxis 
                        dataKey="program" 
                        tick={{ fill: '#374151', fontSize: 12, fontWeight: 500 }}
                        tickFormatter={(value) => {
                          return value.length > 12 ? value.substring(0, 12) + '...' : value;
                        }}
                      />
                      <PolarRadiusAxis 
                        angle={90} 
                        domain={[0, 100]} 
                        tick={{ fill: '#6b7280', fontSize: 11 }}
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
                      <GraduationCap className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>No approved data available for {selectedYear}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-white border-b border-gray-200">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <GraduationCap className="h-5 w-5 text-emerald-600" />
                  Graduation Gender Parity
                </CardTitle>
                <CardDescription>Approved gender distribution by program ({selectedYear})</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {approvedData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={graduationRadarData}>
                      <PolarGrid stroke="#e5e7eb" strokeWidth={1} />
                      <PolarAngleAxis 
                        dataKey="program" 
                        tick={{ fill: '#374151', fontSize: 12, fontWeight: 500 }}
                        tickFormatter={(value) => {
                          return value.length > 12 ? value.substring(0, 12) + '...' : value;
                        }}
                      />
                      <PolarRadiusAxis 
                        angle={90} 
                        domain={[0, 100]} 
                        tick={{ fill: '#6b7280', fontSize: 11 }}
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
                      <GraduationCap className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>No approved data available for {selectedYear}</p>
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
              <CardDescription>Critical metrics from approved student gender parity data</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {insights ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Average Admission Distribution */}
                  <div className="bg-gradient-to-br from-indigo-50 to-white rounded-lg p-5 border border-indigo-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-indigo-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900">Average Admission</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Male Average</span>
                        <span className="font-semibold text-indigo-600">{insights.avgAdmissionMale}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Female Average</span>
                        <span className="font-semibold text-purple-600">{insights.avgAdmissionFemale}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Average Graduation Distribution */}
                  <div className="bg-gradient-to-br from-purple-50 to-white rounded-lg p-5 border border-purple-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <GraduationCap className="h-5 w-5 text-purple-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900">Average Graduation</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Male Average</span>
                        <span className="font-semibold text-indigo-600">{insights.avgGraduationMale}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Female Average</span>
                        <span className="font-semibold text-purple-600">{insights.avgGraduationFemale}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Most Balanced Program */}
                  <div className="bg-gradient-to-br from-emerald-50 to-white rounded-lg p-5 border border-emerald-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <BarChart3 className="h-5 w-5 text-emerald-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900">Most Balanced</h4>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Program with best gender parity:</p>
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                        {insights.mostBalanced}
                      </Badge>
                    </div>
                  </div>

                  {/* Programs Overview */}
                  <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg p-5 border border-blue-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Database className="h-5 w-5 text-blue-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900">Programs Analyzed</h4>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-blue-600">{insights.totalPrograms}</span>
                      <span className="text-sm text-gray-600">approved programs</span>
                    </div>
                  </div>

                  {/* Parity Index */}
                  <div className="bg-gradient-to-br from-amber-50 to-white rounded-lg p-5 border border-amber-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-amber-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900">Parity Index</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Admission</span>
                        <Badge className={getStatusBadge(mockGenderParityMetrics.admissionParityIndex, mockGenderParityMetrics.targetParityIndex)}>
                          {mockGenderParityMetrics.admissionParityIndex.toFixed(2)}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Graduation</span>
                        <Badge className={getStatusBadge(mockGenderParityMetrics.graduationParityIndex, mockGenderParityMetrics.targetParityIndex)}>
                          {mockGenderParityMetrics.graduationParityIndex.toFixed(2)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Programs Needing Attention */}
                  <div className="bg-gradient-to-br from-rose-50 to-white rounded-lg p-5 border border-rose-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-rose-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900">Needs Attention</h4>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-rose-600">{insights.needsAttentionCount}</span>
                      <span className="text-sm text-gray-600">programs with significant disparity</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <TrendingUp className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No approved insights available for {selectedYear}</p>
                  <p className="text-sm mt-2">Submit and approve data to view analytics</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Collection Tab - Shows all data with status */}
        {canAccessDataCollection && (
          <TabsContent value="collection" className="space-y-6 mt-6">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-white border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                      <Database className="h-5 w-5 text-emerald-600" />
                      Student Data Collection
                    </CardTitle>
                    <CardDescription>
                      Manage student gender distribution data for {selectedYear}
                      {dataCollectionItems.length > 0 && ` (${dataCollectionItems.length} ${dataCollectionItems.length === 1 ? 'record' : 'records'})`}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Status Filter */}
                    <Select value={statusFilter} onValueChange={(value: any) => {
                      setStatusFilter(value);
                      setCurrentPage(1);
                    }}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {permissions.canAdd && (
                      <Button onClick={handleAdd} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                        <Plus className="h-4 w-4" />
                        Add Data
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {!canAccessDataCollection ? (
                  <div className="text-center py-12 text-gray-500">
                    <Shield className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium">Access Restricted</p>
                    <p className="text-sm mt-2">You do not have permission to access data collection.</p>
                    <p className="text-sm">Please contact an administrator.</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b-2 border-purple-200">
                            <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700 bg-purple-50/50">Program</th>
                            <th className="text-right py-4 px-4 text-sm font-semibold text-gray-700 bg-purple-50/50">Admission Male %</th>
                            <th className="text-right py-4 px-4 text-sm font-semibold text-gray-700 bg-purple-50/50">Admission Female %</th>
                            <th className="text-right py-4 px-4 text-sm font-semibold text-gray-700 bg-purple-50/50">Graduation Male %</th>
                            <th className="text-right py-4 px-4 text-sm font-semibold text-gray-700 bg-purple-50/50">Graduation Female %</th>
                            <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700 bg-purple-50/50">Status</th>
                            <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700 bg-purple-50/50">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {paginatedData.length > 0 ? (
                            paginatedData.map((item, index) => (
                              <tr key={item.id} className={`hover:bg-purple-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                                <td className="py-4 px-4 font-medium text-gray-900">{item.program}</td>
                                <td className="text-right py-4 px-4">
                                  <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">
                                    {item.admissionMale}%
                                  </Badge>
                                </td>
                                <td className="text-right py-4 px-4">
                                  <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                                    {item.admissionFemale}%
                                  </Badge>
                                </td>
                                <td className="text-right py-4 px-4">
                                  <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">
                                    {item.graduationMale}%
                                  </Badge>
                                </td>
                                <td className="text-right py-4 px-4">
                                  <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                                    {item.graduationFemale}%
                                  </Badge>
                                </td>
                                <td className="text-center py-4 px-4">
                                  <div className="flex justify-center">
                                    {getDataStatusBadge(item.status)}
                                  </div>
                                </td>
                                <td className="text-center py-4 px-4">
                                  <div className="flex items-center justify-center gap-2">
                                    {item.status === 'pending' && isAdmin && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleReviewItem(item)}
                                        className="h-8 w-8 p-0 hover:bg-emerald-100"
                                        title="Review submission"
                                      >
                                        <AlertCircle className="h-4 w-4 text-emerald-600" />
                                      </Button>
                                    )}
                                    {permissions.canEdit && (item.status !== 'approved' || isAdmin) && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEdit(item)}
                                        className="h-8 w-8 p-0 hover:bg-purple-100"
                                      >
                                        <Edit className="h-4 w-4 text-purple-600" />
                                      </Button>
                                    )}
                                    {permissions.canDelete && (item.status !== 'approved' || isAdmin) && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(item)}
                                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={7} className="py-16 text-center">
                                <div className="flex flex-col items-center justify-center text-gray-500">
                                  <Database className="h-16 w-16 mb-4 text-gray-300" />
                                  <p className="font-medium">No data available for {selectedYear}</p>
                                  {permissions.canAdd && (
                                    <p className="text-sm mt-2">Click "Add Data" to create new entries</p>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-purple-100">
                        <div className="text-sm text-gray-600">
                          Showing {startIndex + 1} to {Math.min(endIndex, dataCollectionItems.length)} of {dataCollectionItems.length} entries
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
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
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="gap-1"
                          >
                            Next
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Settings Tab - Admin Only */}
        {isAdmin && (
          <TabsContent value="settings" className="space-y-6 mt-6">
            <PermissionsManager 
              category="students"
              userRole={userRole}
              currentUserEmail={userEmail}
            />
            
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-white border-b border-gray-200">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Shield className="h-5 w-5 text-emerald-600" />
                  Approval Workflow Settings
                </CardTitle>
                <CardDescription>
                  Configure how data submissions and edits are handled
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Require approval for new entries</p>
                      <p className="text-sm text-gray-500 mt-1">Staff submissions must be reviewed before publishing</p>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Enabled
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Require approval for edits</p>
                      <p className="text-sm text-gray-500 mt-1">All data modifications must be approved by admin</p>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Enabled
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Track edit history</p>
                      <p className="text-sm text-gray-500 mt-1">Maintain complete audit trail of all changes</p>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Enabled
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl">{editingItem ? 'Edit' : 'Add'} Student Parity Data</DialogTitle>
            <DialogDescription>
              Enter student population counts for admissions and graduations for {selectedYear}.
              <span className="block mt-2 text-amber-600">Note: All submissions require admin approval before publishing.</span>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="program" className="text-sm font-medium">Program / College</Label>
              <Input
                id="program"
                value={formData.program}
                onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                placeholder="e.g., Engineering, Education, Agriculture"
                className="h-11"
              />
            </div>
            
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="h-5 w-5 text-indigo-600" />
                <h4 className="font-semibold text-gray-900">Admission Data</h4>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admissionTotal" className="text-sm">Total Admitted Students</Label>
                  <Input
                    id="admissionTotal"
                    type="number"
                    min="0"
                    value={formData.admissionTotal}
                    onChange={(e) => setFormData({ ...formData, admissionTotal: Number(e.target.value) })}
                    className="h-11"
                    placeholder="Enter total number"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="admissionMale" className="text-sm">Male Count</Label>
                    <Input
                      id="admissionMale"
                      type="number"
                      min="0"
                      value={formData.admissionMale}
                      onChange={(e) => setFormData({ ...formData, admissionMale: Number(e.target.value) })}
                      className="h-11"
                    />
                    {formData.admissionTotal > 0 && (
                      <p className="text-xs text-gray-500">
                        {Math.round((formData.admissionMale / formData.admissionTotal) * 100)}%
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admissionFemale" className="text-sm">Female Count</Label>
                    <Input
                      id="admissionFemale"
                      type="number"
                      min="0"
                      value={formData.admissionFemale}
                      onChange={(e) => setFormData({ ...formData, admissionFemale: Number(e.target.value) })}
                      className="h-11"
                    />
                    {formData.admissionTotal > 0 && (
                      <p className="text-xs text-gray-500">
                        {Math.round((formData.admissionFemale / formData.admissionTotal) * 100)}%
                      </p>
                    )}
                  </div>
                </div>
                {formData.admissionMale + formData.admissionFemale !== formData.admissionTotal && formData.admissionTotal > 0 && (
                  <p className="text-sm text-red-600">Male + Female must equal Total ({formData.admissionTotal})</p>
                )}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="h-5 w-5 text-purple-600" />
                <h4 className="font-semibold text-gray-900">Graduation Data</h4>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="graduationTotal" className="text-sm">Total Graduates</Label>
                  <Input
                    id="graduationTotal"
                    type="number"
                    min="0"
                    value={formData.graduationTotal}
                    onChange={(e) => setFormData({ ...formData, graduationTotal: Number(e.target.value) })}
                    className="h-11"
                    placeholder="Enter total number"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="graduationMale" className="text-sm">Male Count</Label>
                    <Input
                      id="graduationMale"
                      type="number"
                      min="0"
                      value={formData.graduationMale}
                      onChange={(e) => setFormData({ ...formData, graduationMale: Number(e.target.value) })}
                      className="h-11"
                    />
                    {formData.graduationTotal > 0 && (
                      <p className="text-xs text-gray-500">
                        {Math.round((formData.graduationMale / formData.graduationTotal) * 100)}%
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="graduationFemale" className="text-sm">Female Count</Label>
                    <Input
                      id="graduationFemale"
                      type="number"
                      min="0"
                      value={formData.graduationFemale}
                      onChange={(e) => setFormData({ ...formData, graduationFemale: Number(e.target.value) })}
                      className="h-11"
                    />
                    {formData.graduationTotal > 0 && (
                      <p className="text-xs text-gray-500">
                        {Math.round((formData.graduationFemale / formData.graduationTotal) * 100)}%
                      </p>
                    )}
                  </div>
                </div>
                {formData.graduationMale + formData.graduationFemale !== formData.graduationTotal && formData.graduationTotal > 0 && (
                  <p className="text-sm text-red-600">Male + Female must equal Total ({formData.graduationTotal})</p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">
              Submit for Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <AlertDialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              Review Submission
            </AlertDialogTitle>
            <AlertDialogDescription>
              Review the submitted data before approving or rejecting
            </AlertDialogDescription>
          </AlertDialogHeader>
          {selectedItemForReview && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm text-gray-500">Program</Label>
                  <p className="font-medium">{selectedItemForReview.program}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-gray-500">Academic Year</Label>
                  <p className="font-medium">{selectedItemForReview.academicYear}</p>
                </div>
              </div>
              <div className="border-t pt-4">
                <Label className="text-sm text-gray-500 mb-2 block">Admission Distribution</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                    <span className="text-sm">Male</span>
                    <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">
                      {selectedItemForReview.admissionMale}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="text-sm">Female</span>
                    <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                      {selectedItemForReview.admissionFemale}%
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="border-t pt-4">
                <Label className="text-sm text-gray-500 mb-2 block">Graduation Distribution</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                    <span className="text-sm">Male</span>
                    <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">
                      {selectedItemForReview.graduationMale}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="text-sm">Female</span>
                    <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                      {selectedItemForReview.graduationFemale}%
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="border-t pt-4">
                <Label className="text-sm text-gray-500">Submitted By</Label>
                <p className="text-sm mt-1">{selectedItemForReview.submittedBy || 'Unknown'}</p>
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="outline"
              onClick={handleReject}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button onClick={handleApprove} className="bg-emerald-600 hover:bg-emerald-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve & Publish
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
