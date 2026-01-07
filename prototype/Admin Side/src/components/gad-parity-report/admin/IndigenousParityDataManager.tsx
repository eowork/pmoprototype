import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Badge } from '../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Globe, TrendingUp, BarChart3, Database, Calendar, ChevronLeft, ChevronRight, Edit, Trash2, Plus, CheckCircle, XCircle, Clock, Users } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { mockIndigenousParityData } from '../data/mockGenderParityData';
import { IndigenousParityData } from '../types/GenderParityTypes';
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

interface IndigenousParityDataManagerProps {
  userRole: string;
  requireAuth: (action: string) => boolean;
}

const COMMUNITY_CATEGORIES = [
  'Students',
  'Faculty Members',
  'Administrative Staff',
  'Support Staff',
  'Alumni Network',
  'Community Partners'
];

const SUPPORT_PROGRAMS = [
  'Scholarship Programs',
  'Cultural Preservation',
  'Language Programs',
  'Livelihood Training',
  'Health Services',
  'Educational Support'
];

export function IndigenousParityDataManager({ userRole, requireAuth }: IndigenousParityDataManagerProps) {
  const [data, setData] = useState<IndigenousParityData[]>(mockIndigenousParityData);
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<IndigenousParityData | null>(null);
  const [selectedYear, setSelectedYear] = useState('2023-2024');
  const [activeTab, setActiveTab] = useState('analytics');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | null>(null);
  const [selectedItem, setSelectedItem] = useState<IndigenousParityData | null>(null);
  const [formData, setFormData] = useState({
    academicYear: '2023-2024',
    indigenousCategory: 'community' as 'community' | 'program',
    subcategory: '',
    totalParticipants: 0,
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
    if (!requireAuth('add indigenous parity data')) return;
    setEditingItem(null);
    setFormData({ 
      academicYear: selectedYear, 
      indigenousCategory: 'community',
      subcategory: '', 
      totalParticipants: 0, 
      maleCount: 0, 
      femaleCount: 0
    });
    setShowDialog(true);
  };

  const handleEdit = (item: IndigenousParityData) => {
    if (!requireAuth('edit indigenous parity data')) return;
    setEditingItem(item);
    setFormData({ 
      academicYear: item.academicYear, 
      indigenousCategory: item.indigenousCategory,
      subcategory: item.subcategory, 
      totalParticipants: item.totalParticipants, 
      maleCount: item.maleCount, 
      femaleCount: item.femaleCount
    });
    setShowDialog(true);
  };

  const handleDelete = (id: string) => {
    if (!requireAuth('delete indigenous parity data')) return;
    setData(data.filter(item => item.id !== id));
    toast.success('Indigenous parity data deleted successfully');
    
    // Adjust current page if necessary
    const newFilteredData = data.filter(item => item.id !== id && item.academicYear === selectedYear);
    const newTotalPages = Math.ceil(newFilteredData.length / itemsPerPage);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    }
  };

  const handleSave = () => {
    if (!formData.subcategory || formData.totalParticipants === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.maleCount + formData.femaleCount !== formData.totalParticipants) {
      toast.error('Male and Female counts must equal Total Participants');
      return;
    }

    const percentages = calculatePercentages(formData.maleCount, formData.femaleCount, formData.totalParticipants);
    const status = isAdmin ? 'approved' : 'pending';

    if (editingItem) {
      setData(data.map(item => 
        item.id === editingItem.id 
          ? { 
              ...item, 
              ...formData, 
              ...percentages, 
              status: isAdmin ? item.status : status,
              updatedAt: new Date() 
            }
          : item
      ));
      toast.success(`Indigenous parity data updated${!isAdmin ? ' and submitted for review' : ' successfully'}`);
    } else {
      const newItem: IndigenousParityData = {
        id: `indigenous-${Date.now()}`,
        ...formData,
        ...percentages,
        status,
        submittedBy: 'current-user@carsu.edu.ph',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setData([...data, newItem]);
      toast.success(`Indigenous parity data added${!isAdmin ? ' and submitted for review' : ' successfully'}`);
    }
    setShowDialog(false);
  };

  const handleApprovalRequest = (item: IndigenousParityData, action: 'approve' | 'reject') => {
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

  // Prepare radar chart data - Indigenous Community Distribution
  const communityData = Array.from(new Set(approvedData.filter(item => item.indigenousCategory === 'community').map(item => item.subcategory)))
    .map(subcat => {
      const subcatItems = approvedData.filter(item => item.indigenousCategory === 'community' && item.subcategory === subcat);
      const totalMale = subcatItems.reduce((sum, item) => sum + item.maleCount, 0);
      const totalFemale = subcatItems.reduce((sum, item) => sum + item.femaleCount, 0);
      const total = totalMale + totalFemale;
      return {
        category: subcat.length > 20 ? subcat.substring(0, 18) + '...' : subcat,
        malePercentage: total > 0 ? Math.round((totalMale / total) * 100) : 0,
        femalePercentage: total > 0 ? Math.round((totalFemale / total) * 100) : 0,
        total
      };
    }).filter(item => item.total > 0);

  // Prepare radar chart data - Indigenous Support Programs
  const programData = Array.from(new Set(approvedData.filter(item => item.indigenousCategory === 'program').map(item => item.subcategory)))
    .map(subcat => {
      const subcatItems = approvedData.filter(item => item.indigenousCategory === 'program' && item.subcategory === subcat);
      const totalMale = subcatItems.reduce((sum, item) => sum + item.maleCount, 0);
      const totalFemale = subcatItems.reduce((sum, item) => sum + item.femaleCount, 0);
      const total = totalMale + totalFemale;
      return {
        category: subcat.length > 20 ? subcat.substring(0, 18) + '...' : subcat,
        malePercentage: total > 0 ? Math.round((totalMale / total) * 100) : 0,
        femalePercentage: total > 0 ? Math.round((totalFemale / total) * 100) : 0,
        total
      };
    }).filter(item => item.total > 0);

  // Calculate key insights
  const calculateInsights = () => {
    if (approvedData.length === 0) return null;

    const totalParticipants = approvedData.reduce((sum, item) => sum + item.totalParticipants, 0);
    const totalMale = approvedData.reduce((sum, item) => sum + item.maleCount, 0);
    const totalFemale = approvedData.reduce((sum, item) => sum + item.femaleCount, 0);
    const avgMalePercentage = (totalMale / totalParticipants) * 100;
    const avgFemalePercentage = (totalFemale / totalParticipants) * 100;

    const communityCount = approvedData.filter(item => item.indigenousCategory === 'community').reduce((sum, item) => sum + item.totalParticipants, 0);
    const programCount = approvedData.filter(item => item.indigenousCategory === 'program').reduce((sum, item) => sum + item.totalParticipants, 0);

    const uniqueCommunities = new Set(approvedData.filter(item => item.indigenousCategory === 'community').map(item => item.subcategory)).size;
    const uniquePrograms = new Set(approvedData.filter(item => item.indigenousCategory === 'program').map(item => item.subcategory)).size;

    return {
      totalRecords: approvedData.length,
      totalParticipants,
      avgMalePercentage: avgMalePercentage.toFixed(1),
      avgFemalePercentage: avgFemalePercentage.toFixed(1),
      communityCount,
      programCount,
      uniqueCommunities,
      uniquePrograms
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

  const subcategoryOptions = formData.indigenousCategory === 'community' ? COMMUNITY_CATEGORIES : SUPPORT_PROGRAMS;

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
                  <Globe className="h-5 w-5 text-emerald-600" />
                  Indigenous Community Distribution
                </CardTitle>
                <CardDescription>Gender distribution across indigenous communities ({selectedYear})</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {communityData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={communityData}>
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
                        stroke="#10b981"
                        fill="#10b981"
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
                      <Globe className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>No community data available for {selectedYear}</p>
                      <p className="text-sm mt-2">Approved data will appear here</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-white border-b border-gray-200">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                  Indigenous Support Programs
                </CardTitle>
                <CardDescription>Gender distribution across support programs ({selectedYear})</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {programData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={programData}>
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
                        stroke="#10b981"
                        fill="#10b981"
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
                      <TrendingUp className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>No program data available for {selectedYear}</p>
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
              <CardDescription>Critical metrics from approved indigenous people data</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {insights ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-emerald-50 to-white rounded-lg p-5 border border-emerald-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <Globe className="h-5 w-5 text-emerald-600" />
                      </div>
                      <h4>Total Participants</h4>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl text-emerald-600">{insights.totalParticipants}</span>
                      <span className="text-sm text-gray-600">people</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg p-5 border border-blue-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <h4>Gender Distribution</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Male</span>
                        <span className="text-blue-600">{insights.avgMalePercentage}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Female</span>
                        <span className="text-emerald-600">{insights.avgFemalePercentage}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-50 to-white rounded-lg p-5 border border-indigo-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <Database className="h-5 w-5 text-indigo-600" />
                      </div>
                      <h4>Communities</h4>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl text-indigo-600">{insights.communityCount}</span>
                      <span className="text-sm text-gray-600">members</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-white rounded-lg p-5 border border-purple-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <BarChart3 className="h-5 w-5 text-purple-600" />
                      </div>
                      <h4>Support Programs</h4>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl text-purple-600">{insights.programCount}</span>
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
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-white border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <Database className="h-5 w-5 text-emerald-600" />
                    Indigenous People Data Collection
                  </CardTitle>
                  <CardDescription>
                    Comprehensive data for indigenous communities and support programs
                  </CardDescription>
                </div>
                {canEdit && (
                  <Button onClick={handleAdd} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="h-4 w-4" />
                    Add New Record
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {/* Status Filter */}
              {isAdmin && (
                <div className="mb-4 flex items-center gap-2">
                  <Label className="text-sm">Status Filter:</Label>
                  <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Data Table */}
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm text-gray-600">Category Type</th>
                        <th className="px-4 py-3 text-left text-sm text-gray-600">Subcategory</th>
                        <th className="px-4 py-3 text-left text-sm text-gray-600">Total Participants</th>
                        <th className="px-4 py-3 text-left text-sm text-gray-600">Male</th>
                        <th className="px-4 py-3 text-left text-sm text-gray-600">Female</th>
                        <th className="px-4 py-3 text-left text-sm text-gray-600">Gender %</th>
                        <th className="px-4 py-3 text-left text-sm text-gray-600">Status</th>
                        {canEdit && <th className="px-4 py-3 text-left text-sm text-gray-600">Actions</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {paginatedData.length > 0 ? (
                        paginatedData.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <Badge className={item.indigenousCategory === 'community' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}>
                                {item.indigenousCategory === 'community' ? 'Community' : 'Program'}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <div>
                                <div className="text-sm text-gray-900">{item.subcategory}</div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">{item.totalParticipants}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{item.maleCount}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{item.femaleCount}</td>
                            <td className="px-4 py-3">
                              <div className="text-xs space-y-1">
                                <div className="flex items-center gap-1">
                                  <span className="text-blue-600">M:</span>
                                  <span>{item.malePercentage}%</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="text-emerald-600">F:</span>
                                  <span>{item.femalePercentage}%</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {getStatusBadge(item.status)}
                            </td>
                            {canEdit && (
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEdit(item)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  {isAdmin && item.status === 'pending' && (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleApprovalRequest(item, 'approve')}
                                        className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                      >
                                        <CheckCircle className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleApprovalRequest(item, 'reject')}
                                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <XCircle className="h-4 w-4" />
                                      </Button>
                                    </>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(item.id)}
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
                          <td colSpan={canEdit ? 8 : 7} className="px-4 py-12 text-center text-gray-500">
                            <Database className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <p>No data available for {selectedYear}</p>
                            {canEdit && <p className="text-sm mt-2">Click "Add New Record" to get started</p>}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-gray-600">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} entries
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit' : 'Add'} Indigenous People Data</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update' : 'Enter'} information for indigenous community or support program participation
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="academicYear">Academic Year *</Label>
                <Select
                  value={formData.academicYear}
                  onValueChange={(value) => setFormData({ ...formData, academicYear: value })}
                >
                  <SelectTrigger id="academicYear">
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

              <div className="space-y-2">
                <Label htmlFor="indigenousCategory">Category Type *</Label>
                <Select
                  value={formData.indigenousCategory}
                  onValueChange={(value: 'community' | 'program') => {
                    setFormData({ ...formData, indigenousCategory: value, subcategory: '' });
                  }}
                >
                  <SelectTrigger id="indigenousCategory">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="community">Community</SelectItem>
                    <SelectItem value="program">Support Program</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subcategory">
                {formData.indigenousCategory === 'community' ? 'Community Category' : 'Support Program'} *
              </Label>
              <Select
                value={formData.subcategory}
                onValueChange={(value) => setFormData({ ...formData, subcategory: value })}
              >
                <SelectTrigger id="subcategory">
                  <SelectValue placeholder={`Select ${formData.indigenousCategory === 'community' ? 'community category' : 'support program'}`} />
                </SelectTrigger>
                <SelectContent>
                  {subcategoryOptions.map(option => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalParticipants">Total Participants *</Label>
                <Input
                  id="totalParticipants"
                  type="number"
                  min="0"
                  value={formData.totalParticipants}
                  onChange={(e) => setFormData({ ...formData, totalParticipants: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maleCount">Male Count *</Label>
                <Input
                  id="maleCount"
                  type="number"
                  min="0"
                  value={formData.maleCount}
                  onChange={(e) => setFormData({ ...formData, maleCount: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="femaleCount">Female Count *</Label>
                <Input
                  id="femaleCount"
                  type="number"
                  min="0"
                  value={formData.femaleCount}
                  onChange={(e) => setFormData({ ...formData, femaleCount: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            {formData.maleCount + formData.femaleCount !== formData.totalParticipants && formData.totalParticipants > 0 && (
              <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
                ⚠️ Warning: Male + Female counts ({formData.maleCount + formData.femaleCount}) should equal Total Participants ({formData.totalParticipants})
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">
              {editingItem ? 'Update' : 'Add'} Data
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
              Are you sure you want to {approvalAction} this data submission? 
              {approvalAction === 'approve' && ' This will make the data visible in analytics.'}
              {approvalAction === 'reject' && ' The submitter will need to revise and resubmit.'}
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
