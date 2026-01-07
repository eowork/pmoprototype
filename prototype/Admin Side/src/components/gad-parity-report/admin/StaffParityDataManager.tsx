import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Badge } from '../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Briefcase, TrendingUp, BarChart3, Database, Calendar, ChevronLeft, ChevronRight, Edit, Trash2, Plus, CheckCircle, XCircle, Clock, Shield, AlertCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { mockStaffParityData } from '../data/mockGenderParityData';
import { StaffParityData, DataStatus, StaffCategory } from '../types/GenderParityTypes';
import { PermissionsManager } from './PermissionsManager';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../ui/alert-dialog';
import { rbacService } from '../services/RBACService';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface StaffParityDataManagerProps {
  userRole: string;
  userEmail: string;
  userName: string;
}

const ADMINISTRATIVE_DEPARTMENTS = [
  'Executive Management',
  'Finance & Admin',
  'Human Resources',
  'Planning & Development',
  'Quality Assurance',
  'Registrar Office'
];

const SUPPORT_DEPARTMENTS = [
  'Academic Support',
  'Student Services',
  'Library Services',
  'ICT Support',
  'Facilities Management',
  'Security Services'
];

export function StaffParityDataManager({ userRole, userEmail, userName }: StaffParityDataManagerProps) {
  const [data, setData] = useState<StaffParityData[]>(mockStaffParityData);
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<StaffParityData | null>(null);
  const [selectedYear, setSelectedYear] = useState('2023-2024');
  const [activeTab, setActiveTab] = useState('analytics');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedItemForReview, setSelectedItemForReview] = useState<StaffParityData | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [formData, setFormData] = useState({
    academicYear: '2023-2024',
    department: '',
    staffCategory: 'administrative' as StaffCategory,
    totalStaff: 0,
    maleCount: 0,
    femaleCount: 0,
    genderBalance: 'Balanced' as 'Good' | 'Balanced' | 'Improving' | 'Needs Attention'
  });

  const isAdmin = userRole === 'Admin';
  const itemsPerPage = 10;

  const permissions = rbacService.getUserPermissions(userEmail, userRole, 'staff');
  const canAccessDataCollection = isAdmin || rbacService.canPerformCRUD(userEmail, userRole, 'staff');

  const academicYears = ['2023-2024', '2022-2023', '2021-2022', '2020-2021', '2019-2020'];

  const approvedData = data.filter(item => item.academicYear === selectedYear && item.status === 'approved');

  const dataCollectionItems = data.filter(item => {
    if (item.academicYear !== selectedYear) return false;
    if (statusFilter === 'all') return true;
    return item.status === statusFilter;
  });

  const totalPages = Math.ceil(dataCollectionItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = dataCollectionItems.slice(startIndex, endIndex);

  const pendingCount = data.filter(item => item.status === 'pending').length;

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
    if (!permissions.canAdd) {
      toast.error('You do not have permission to add data');
      return;
    }
    
    setEditingItem(null);
    setFormData({
      academicYear: selectedYear,
      department: '',
      staffCategory: 'administrative',
      totalStaff: 0,
      maleCount: 0,
      femaleCount: 0,
      genderBalance: 'Balanced'
    });
    setShowDialog(true);
  };

  const handleEdit = (item: StaffParityData) => {
    if (!permissions.canEdit) {
      toast.error('You do not have permission to edit data');
      return;
    }

    if (!isAdmin && item.status === 'approved') {
      toast.error('Cannot edit approved data. Please contact an administrator');
      return;
    }
    
    setEditingItem(item);
    setFormData({
      academicYear: item.academicYear,
      department: item.department,
      staffCategory: item.staffCategory,
      totalStaff: item.totalStaff,
      maleCount: item.maleCount,
      femaleCount: item.femaleCount,
      genderBalance: item.genderBalance
    });
    setShowDialog(true);
  };

  const handleDelete = (item: StaffParityData) => {
    if (!permissions.canDelete) {
      toast.error('You do not have permission to delete data');
      return;
    }

    if (!isAdmin && item.status === 'approved') {
      toast.error('Cannot delete approved data. Please contact an administrator');
      return;
    }

    setData(data.filter(d => d.id !== item.id));
    toast.success('Staff parity data deleted successfully');
    
    const newFilteredData = data.filter(d => d.id !== item.id && d.academicYear === selectedYear);
    const newTotalPages = Math.ceil(newFilteredData.length / itemsPerPage);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    }
  };

  const handleSave = () => {
    if (!formData.department || formData.totalStaff <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.maleCount + formData.femaleCount !== formData.totalStaff) {
      toast.error('Male and female counts must equal total staff');
      return;
    }

    const status: DataStatus = 'pending';
    const now = new Date();
    const percentages = calculatePercentages(formData.maleCount, formData.femaleCount, formData.totalStaff);

    if (editingItem) {
      const updatedItem: StaffParityData = {
        ...editingItem,
        ...formData,
        ...percentages,
        status,
        submittedBy: userEmail,
        reviewedBy: undefined,
        reviewedAt: undefined,
        updatedAt: now
      };

      setData(data.map(item => item.id === editingItem.id ? updatedItem : item));
      toast.success('Changes submitted for review. Awaiting admin approval');
    } else {
      const newItem: StaffParityData = {
        id: `staff-${Date.now()}`,
        ...formData,
        ...percentages,
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

  const handleReviewItem = (item: StaffParityData) => {
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
    const approvedItem: StaffParityData = {
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
    const rejectedItem: StaffParityData = {
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

  const radarData = approvedData.map(item => ({
    department: item.department.length > 15 ? item.department.substring(0, 15) + '...' : item.department,
    malePercentage: item.malePercentage,
    femalePercentage: item.femalePercentage
  }));

  const calculateInsights = () => {
    if (approvedData.length === 0) return null;

    const totalMale = approvedData.reduce((sum, item) => sum + item.maleCount, 0);
    const totalFemale = approvedData.reduce((sum, item) => sum + item.femaleCount, 0);
    const totalStaff = totalMale + totalFemale;

    const avgMalePercentage = approvedData.reduce((sum, item) => sum + item.malePercentage, 0) / approvedData.length;
    const avgFemalePercentage = approvedData.reduce((sum, item) => sum + item.femalePercentage, 0) / approvedData.length;

    const balanced = approvedData.filter(item => item.genderBalance === 'Balanced' || item.genderBalance === 'Good');
    const needsAttention = approvedData.filter(item => item.genderBalance === 'Needs Attention');

    return {
      totalStaff,
      totalMale,
      totalFemale,
      avgMalePercentage: avgMalePercentage.toFixed(1),
      avgFemalePercentage: avgFemalePercentage.toFixed(1),
      balancedCount: balanced.length,
      needsAttentionCount: needsAttention.length,
      totalDepartments: approvedData.length
    };
  };

  const insights = calculateInsights();

  const getDataStatusBadge = (status: DataStatus) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 flex items-center gap-1"><CheckCircle className="h-3 w-3" />Approved</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-700 border-amber-200 flex items-center gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700 border-red-200 flex items-center gap-1"><XCircle className="h-3 w-3" />Rejected</Badge>;
    }
  };

  const getBalanceBadge = (balance: string) => {
    const variants: Record<string, string> = {
      'Good': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'Balanced': 'bg-blue-100 text-blue-700 border-blue-200',
      'Improving': 'bg-amber-100 text-amber-700 border-amber-200',
      'Needs Attention': 'bg-red-100 text-red-700 border-red-200'
    };
    return variants[balance] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const allDepartments = formData.staffCategory === 'administrative' ? ADMINISTRATIVE_DEPARTMENTS : SUPPORT_DEPARTMENTS;

  return (
    <div className="space-y-6">
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
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-3' : (canAccessDataCollection ? 'grid-cols-2' : 'grid-cols-1')} bg-white border border-gray-200 p-1 rounded-lg`}>
          <TabsTrigger value="analytics" className="flex items-center gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white rounded-md transition-all">
            <BarChart3 className="h-4 w-4" /><span>Data Analytics</span>
          </TabsTrigger>
          {canAccessDataCollection && (
            <TabsTrigger value="collection" className="flex items-center gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white rounded-md transition-all">
              <Database className="h-4 w-4" /><span>Data Collection</span>
              {pendingCount > 0 && isAdmin && <Badge className="ml-2 bg-amber-500 text-white">{pendingCount}</Badge>}
            </TabsTrigger>
          )}
          {isAdmin && (
            <TabsTrigger value="settings" className="flex items-center gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white rounded-md transition-all">
              <Shield className="h-4 w-4" /><span>Settings</span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="analytics" className="space-y-6 mt-6">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-white border-b border-gray-200">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Briefcase className="h-5 w-5 text-emerald-600" />
                Staff Gender Distribution
              </CardTitle>
              <CardDescription>Approved gender parity by department ({selectedYear})</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {approvedData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e5e7eb" strokeWidth={1} />
                    <PolarAngleAxis dataKey="department" tick={{ fill: '#374151', fontSize: 11, fontWeight: 500 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 11 }} tickFormatter={(value) => `${value}%`} />
                    <Radar name="Female %" dataKey="femalePercentage" stroke="#a855f7" fill="#a855f7" fillOpacity={0.6} strokeWidth={2} />
                    <Radar name="Male %" dataKey="malePercentage" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} strokeWidth={2} />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                    <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px' }} formatter={(value: any) => `${value}%`} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[400px] flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Briefcase className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No approved data available for {selectedYear}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {insights && (
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-white border-b border-gray-200">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                  Key Insights for {selectedYear}
                </CardTitle>
                <CardDescription>Critical metrics from approved staff data</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-indigo-50 to-white rounded-lg p-5 border border-indigo-100">
                    <h4 className="font-semibold text-gray-900 mb-3">Total Staff</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between"><span className="text-sm text-gray-600">Total</span><span className="font-semibold text-indigo-600">{insights.totalStaff}</span></div>
                      <div className="flex justify-between"><span className="text-sm text-gray-600">Male</span><span className="font-semibold text-indigo-600">{insights.totalMale}</span></div>
                      <div className="flex justify-between"><span className="text-sm text-gray-600">Female</span><span className="font-semibold text-purple-600">{insights.totalFemale}</span></div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-white rounded-lg p-5 border border-purple-100">
                    <h4 className="font-semibold text-gray-900 mb-3">Average Distribution</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between"><span className="text-sm text-gray-600">Male Avg</span><span className="font-semibold text-indigo-600">{insights.avgMalePercentage}%</span></div>
                      <div className="flex justify-between"><span className="text-sm text-gray-600">Female Avg</span><span className="font-semibold text-purple-600">{insights.avgFemalePercentage}%</span></div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-white rounded-lg p-5 border border-emerald-100">
                    <h4 className="font-semibold text-gray-900 mb-3">Gender Balance</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between"><span className="text-sm text-gray-600">Balanced</span><span className="font-semibold text-emerald-600">{insights.balancedCount}</span></div>
                      <div className="flex justify-between"><span className="text-sm text-gray-600">Needs Attention</span><span className="font-semibold text-rose-600">{insights.needsAttentionCount}</span></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {canAccessDataCollection && (
          <TabsContent value="collection" className="space-y-6 mt-6">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-white border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                      <Database className="h-5 w-5 text-emerald-600" />
                      Staff Data Collection
                    </CardTitle>
                    <CardDescription>
                      Manage staff gender distribution data for {selectedYear}
                      {dataCollectionItems.length > 0 && ` (${dataCollectionItems.length} ${dataCollectionItems.length === 1 ? 'record' : 'records'})`}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <Select value={statusFilter} onValueChange={(value: any) => { setStatusFilter(value); setCurrentPage(1); }}>
                      <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    {permissions.canAdd && (
                      <Button onClick={handleAdd} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                        <Plus className="h-4 w-4" />Add Data
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
                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700 bg-purple-50/50">Department</th>
                        <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700 bg-purple-50/50">Category</th>
                        <th className="text-right py-4 px-4 text-sm font-semibold text-gray-700 bg-purple-50/50">Total Staff</th>
                        <th className="text-right py-4 px-4 text-sm font-semibold text-gray-700 bg-purple-50/50">Male %</th>
                        <th className="text-right py-4 px-4 text-sm font-semibold text-gray-700 bg-purple-50/50">Female %</th>
                        <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700 bg-purple-50/50">Balance</th>
                        <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700 bg-purple-50/50">Status</th>
                        <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700 bg-purple-50/50">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedData.length > 0 ? (
                        paginatedData.map((item, index) => (
                          <tr key={item.id} className={`hover:bg-purple-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                            <td className="py-4 px-4 font-medium text-gray-900">{item.department}</td>
                            <td className="text-center py-4 px-4"><Badge variant="outline">{item.staffCategory === 'administrative' ? 'Administrative' : 'Support'}</Badge></td>
                            <td className="text-right py-4 px-4 text-gray-900">{item.totalStaff}</td>
                            <td className="text-right py-4 px-4"><Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">{item.malePercentage}%</Badge></td>
                            <td className="text-right py-4 px-4"><Badge className="bg-purple-100 text-purple-700 border-purple-200">{item.femalePercentage}%</Badge></td>
                            <td className="text-center py-4 px-4"><Badge className={getBalanceBadge(item.genderBalance)}>{item.genderBalance}</Badge></td>
                            <td className="text-center py-4 px-4"><div className="flex justify-center">{getDataStatusBadge(item.status)}</div></td>
                            <td className="text-center py-4 px-4">
                              <div className="flex items-center justify-center gap-2">
                                {item.status === 'pending' && isAdmin && (
                                  <Button variant="ghost" size="sm" onClick={() => handleReviewItem(item)} className="h-8 w-8 p-0 hover:bg-emerald-100" title="Review submission">
                                    <AlertCircle className="h-4 w-4 text-emerald-600" />
                                  </Button>
                                )}
                                {permissions.canEdit && (item.status !== 'approved' || isAdmin) && (
                                  <Button variant="ghost" size="sm" onClick={() => handleEdit(item)} className="h-8 w-8 p-0 hover:bg-purple-100">
                                    <Edit className="h-4 w-4 text-purple-600" />
                                  </Button>
                                )}
                                {permissions.canDelete && (item.status !== 'approved' || isAdmin) && (
                                  <Button variant="ghost" size="sm" onClick={() => handleDelete(item)} className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="py-16 text-center">
                            <div className="flex flex-col items-center justify-center text-gray-500">
                              <Database className="h-16 w-16 mb-4 text-gray-300" />
                              <p className="font-medium">No data available for {selectedYear}</p>
                              {permissions.canAdd && <p className="text-sm mt-2">Click "Add Data" to create new entries</p>}
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-purple-100">
                    <div className="text-sm text-gray-600">Showing {startIndex + 1} to {Math.min(endIndex, dataCollectionItems.length)} of {dataCollectionItems.length} entries</div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="gap-1">
                        <ChevronLeft className="h-4 w-4" />Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(page => (
                          <Button key={page} variant={currentPage === page ? "default" : "outline"} size="sm" onClick={() => setCurrentPage(page)} className={currentPage === page ? "bg-purple-600 hover:bg-purple-700" : ""}>
                            {page}
                          </Button>
                        ))}
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="gap-1">
                        Next<ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {isAdmin && (
          <TabsContent value="settings" className="space-y-6 mt-6">
            <PermissionsManager category="staff" userRole={userRole} currentUserEmail={userEmail} />
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-white border-b border-gray-200">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Shield className="h-5 w-5 text-emerald-600" />Approval Workflow Settings
                </CardTitle>
                <CardDescription>Configure how data submissions and edits are handled</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Require approval for new entries</p>
                      <p className="text-sm text-gray-500 mt-1">All submissions must be reviewed before publishing</p>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200"><CheckCircle className="h-3 w-3 mr-1" />Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Require approval for edits</p>
                      <p className="text-sm text-gray-500 mt-1">All data modifications must be approved by admin</p>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200"><CheckCircle className="h-3 w-3 mr-1" />Enabled</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl">{editingItem ? 'Edit' : 'Add'} Staff Parity Data</DialogTitle>
            <DialogDescription>
              Enter staff population counts and gender distribution for {selectedYear}.
              <span className="block mt-2 text-amber-600">Note: All submissions require admin approval before publishing.</span>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="staffCategory" className="text-sm font-medium">Staff Category</Label>
              <Select value={formData.staffCategory} onValueChange={(value: StaffCategory) => setFormData({ ...formData, staffCategory: value, department: '' })}>
                <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="administrative">Administrative</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department" className="text-sm font-medium">Department</Label>
              <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                <SelectTrigger className="h-11"><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  {allDepartments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalStaff" className="text-sm font-medium">Total Staff Count</Label>
              <Input id="totalStaff" type="number" min="0" value={formData.totalStaff} onChange={(e) => setFormData({ ...formData, totalStaff: Number(e.target.value) })} className="h-11" />
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="h-5 w-5 text-indigo-600" />
                <h4 className="font-semibold text-gray-900">Gender Distribution</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maleCount" className="text-sm">Male Count</Label>
                  <Input id="maleCount" type="number" min="0" value={formData.maleCount} onChange={(e) => setFormData({ ...formData, maleCount: Number(e.target.value) })} className="h-11" />
                  {formData.totalStaff > 0 && <p className="text-xs text-gray-500">{Math.round((formData.maleCount / formData.totalStaff) * 100)}%</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="femaleCount" className="text-sm">Female Count</Label>
                  <Input id="femaleCount" type="number" min="0" value={formData.femaleCount} onChange={(e) => setFormData({ ...formData, femaleCount: Number(e.target.value) })} className="h-11" />
                  {formData.totalStaff > 0 && <p className="text-xs text-gray-500">{Math.round((formData.femaleCount / formData.totalStaff) * 100)}%</p>}
                </div>
              </div>
              {formData.maleCount + formData.femaleCount !== formData.totalStaff && formData.totalStaff > 0 && (
                <p className="text-sm text-red-600 mt-2">Male + Female must equal Total Staff ({formData.totalStaff})</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="genderBalance" className="text-sm font-medium">Gender Balance Assessment</Label>
              <Select value={formData.genderBalance} onValueChange={(value: any) => setFormData({ ...formData, genderBalance: value })}>
                <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Balanced">Balanced</SelectItem>
                  <SelectItem value="Improving">Improving</SelectItem>
                  <SelectItem value="Needs Attention">Needs Attention</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">Submit for Review</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />Review Submission
            </AlertDialogTitle>
            <AlertDialogDescription>Review the submitted data before approving or rejecting</AlertDialogDescription>
          </AlertDialogHeader>
          {selectedItemForReview && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm text-gray-500">Department</Label>
                  <p className="font-medium">{selectedItemForReview.department}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-gray-500">Category</Label>
                  <Badge variant="outline">{selectedItemForReview.staffCategory === 'administrative' ? 'Administrative' : 'Support'}</Badge>
                </div>
              </div>
              <div className="border-t pt-4">
                <Label className="text-sm text-gray-500 mb-2 block">Staff Distribution</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Total</span>
                    <span className="text-2xl font-bold text-gray-900 mt-1">{selectedItemForReview.totalStaff}</span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-indigo-50 rounded-lg">
                    <span className="text-sm text-gray-600">Male</span>
                    <span className="text-2xl font-bold text-indigo-600 mt-1">{selectedItemForReview.maleCount}</span>
                    <Badge className="mt-2 bg-indigo-100 text-indigo-700 border-indigo-200">{selectedItemForReview.malePercentage}%</Badge>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-purple-50 rounded-lg">
                    <span className="text-sm text-gray-600">Female</span>
                    <span className="text-2xl font-bold text-purple-600 mt-1">{selectedItemForReview.femaleCount}</span>
                    <Badge className="mt-2 bg-purple-100 text-purple-700 border-purple-200">{selectedItemForReview.femalePercentage}%</Badge>
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
            <Button variant="outline" onClick={handleReject} className="text-red-600 hover:text-red-700 hover:bg-red-50">
              <XCircle className="h-4 w-4 mr-2" />Reject
            </Button>
            <Button onClick={handleApprove} className="bg-emerald-600 hover:bg-emerald-700">
              <CheckCircle className="h-4 w-4 mr-2" />Approve & Publish
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
