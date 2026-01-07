import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Badge } from '../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Textarea } from '../../ui/textarea';
import { DollarSign, TrendingUp, BarChart3, Database, Calendar, ChevronLeft, ChevronRight, Edit, Trash2, Plus, CheckCircle, XCircle, Clock, Shield, AlertCircle, Target, Users } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../ui/alert-dialog';
import { rbacService } from '../services/RBACService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { PermissionsManager } from './PermissionsManager';

interface BudgetPlan {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  status: 'planned' | 'ongoing' | 'completed';
  budgetAllocated: number;
  budgetUtilized: number;
  targetBeneficiaries: number;
  actualBeneficiaries: number;
  targetPercentage: number;
  actualPercentage: number;
  startDate: string;
  endDate: string;
  responsible: string;
  year: string;
  dataStatus: 'pending' | 'approved' | 'rejected';
  submittedBy?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface GADBudgetPlansManagerProps {
  userRole: string;
  userEmail: string;
  userName: string;
}

const mockBudgetData: BudgetPlan[] = [
  {
    id: 'budget-1',
    title: 'Gender-Sensitive Training Programs',
    description: 'Comprehensive training programs on gender sensitivity and awareness for all university personnel',
    category: 'Capacity Building',
    priority: 'high',
    status: 'ongoing',
    budgetAllocated: 800000,
    budgetUtilized: 680000,
    targetBeneficiaries: 200,
    actualBeneficiaries: 185,
    targetPercentage: 80,
    actualPercentage: 75,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    responsible: 'GAD Office',
    year: '2024',
    dataStatus: 'approved',
    submittedBy: 'admin@carsu.edu.ph',
    reviewedBy: 'admin@carsu.edu.ph',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: 'budget-2',
    title: 'Women Empowerment Initiatives',
    description: 'Leadership development and entrepreneurship programs for women faculty and staff',
    category: 'Empowerment Programs',
    priority: 'high',
    status: 'ongoing',
    budgetAllocated: 1200000,
    budgetUtilized: 980000,
    targetBeneficiaries: 150,
    actualBeneficiaries: 142,
    targetPercentage: 75,
    actualPercentage: 72,
    startDate: '2024-01-15',
    endDate: '2024-11-30',
    responsible: 'HR Department',
    year: '2024',
    dataStatus: 'approved',
    submittedBy: 'staff@carsu.edu.ph',
    reviewedBy: 'admin@carsu.edu.ph',
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12')
  },
  {
    id: 'budget-3',
    title: 'Gender Research and Studies',
    description: 'Research initiatives focused on gender issues, equality, and development',
    category: 'Research & Development',
    priority: 'medium',
    status: 'ongoing',
    budgetAllocated: 500000,
    budgetUtilized: 380000,
    targetBeneficiaries: 80,
    actualBeneficiaries: 75,
    targetPercentage: 70,
    actualPercentage: 68,
    startDate: '2024-02-01',
    endDate: '2024-12-31',
    responsible: 'Research Office',
    year: '2024',
    dataStatus: 'approved',
    submittedBy: 'staff@carsu.edu.ph',
    reviewedBy: 'admin@carsu.edu.ph',
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25')
  },
  {
    id: 'budget-4',
    title: 'Childcare and Support Services',
    description: 'Enhanced childcare facilities, lactation rooms, and family support services',
    category: 'Support Services',
    priority: 'medium',
    status: 'completed',
    budgetAllocated: 900000,
    budgetUtilized: 850000,
    targetBeneficiaries: 300,
    actualBeneficiaries: 285,
    targetPercentage: 85,
    actualPercentage: 88,
    startDate: '2024-01-01',
    endDate: '2024-06-30',
    responsible: 'Admin Services',
    year: '2024',
    dataStatus: 'approved',
    submittedBy: 'admin@carsu.edu.ph',
    reviewedBy: 'admin@carsu.edu.ph',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05')
  },
  {
    id: 'budget-5',
    title: 'Anti-Harassment Policy Implementation',
    description: 'Implementation and monitoring of anti-harassment policies and complaint mechanisms',
    category: 'Policy Implementation',
    priority: 'high',
    status: 'completed',
    budgetAllocated: 300000,
    budgetUtilized: 285000,
    targetBeneficiaries: 500,
    actualBeneficiaries: 520,
    targetPercentage: 90,
    actualPercentage: 92,
    startDate: '2024-01-01',
    endDate: '2024-05-31',
    responsible: 'Legal Office',
    year: '2024',
    dataStatus: 'approved',
    submittedBy: 'admin@carsu.edu.ph',
    reviewedBy: 'admin@carsu.edu.ph',
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-08')
  },
  {
    id: 'budget-6',
    title: 'Gender Data Collection Systems',
    description: 'Development of systems for collecting and analyzing gender-disaggregated data',
    category: 'Data Management',
    priority: 'medium',
    status: 'ongoing',
    budgetAllocated: 400000,
    budgetUtilized: 320000,
    targetBeneficiaries: 100,
    actualBeneficiaries: 95,
    targetPercentage: 75,
    actualPercentage: 70,
    startDate: '2024-03-01',
    endDate: '2024-12-31',
    responsible: 'IT Department',
    year: '2024',
    dataStatus: 'approved',
    submittedBy: 'staff@carsu.edu.ph',
    reviewedBy: 'admin@carsu.edu.ph',
    createdAt: new Date('2024-02-28'),
    updatedAt: new Date('2024-02-28')
  },
  {
    id: 'budget-7',
    title: 'Gender-Responsive Scholarship Program',
    description: 'Scholarships to promote gender balance in underrepresented fields',
    category: 'Student Support',
    priority: 'high',
    status: 'planned',
    budgetAllocated: 1500000,
    budgetUtilized: 0,
    targetBeneficiaries: 120,
    actualBeneficiaries: 0,
    targetPercentage: 80,
    actualPercentage: 0,
    startDate: '2025-01-01',
    endDate: '2025-06-30',
    responsible: 'Student Affairs',
    year: '2024',
    dataStatus: 'approved',
    submittedBy: 'admin@carsu.edu.ph',
    reviewedBy: 'admin@carsu.edu.ph',
    createdAt: new Date('2024-04-01'),
    updatedAt: new Date('2024-04-01')
  },
  {
    id: 'budget-8',
    title: 'Safe Spaces Enhancement Project',
    description: 'Creation of safe, gender-inclusive spaces across campus facilities',
    category: 'Infrastructure',
    priority: 'medium',
    status: 'ongoing',
    budgetAllocated: 750000,
    budgetUtilized: 580000,
    targetBeneficiaries: 400,
    actualBeneficiaries: 380,
    targetPercentage: 70,
    actualPercentage: 68,
    startDate: '2024-02-15',
    endDate: '2024-10-31',
    responsible: 'Engineering Services',
    year: '2024',
    dataStatus: 'approved',
    submittedBy: 'staff@carsu.edu.ph',
    reviewedBy: 'admin@carsu.edu.ph',
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-10')
  }
];

export function GADBudgetPlansManager({ userRole, userEmail, userName }: GADBudgetPlansManagerProps) {
  const [data, setData] = useState<BudgetPlan[]>(mockBudgetData);
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetPlan | null>(null);
  const [selectedYear, setSelectedYear] = useState('2024');
  const [activeTab, setActiveTab] = useState('analytics');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedItemForReview, setSelectedItemForReview] = useState<BudgetPlan | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    status: 'planned' as 'planned' | 'ongoing' | 'completed',
    budgetAllocated: 0,
    budgetUtilized: 0,
    targetBeneficiaries: 0,
    actualBeneficiaries: 0,
    targetPercentage: 80,
    actualPercentage: 65,
    startDate: '',
    endDate: '',
    responsible: ''
  });

  const isAdmin = userRole === 'Admin';
  const itemsPerPage = 10;

  const permissions = rbacService.getUserPermissions(userEmail, userRole, 'budget');
  const canAccessDataCollection = isAdmin || rbacService.canPerformCRUD(userEmail, userRole, 'budget');

  const academicYears = ['2024', '2023', '2022', '2021', '2020'];

  const approvedData = data.filter(item => item.year === selectedYear && item.dataStatus === 'approved');

  const dataCollectionItems = data.filter(item => {
    if (item.year !== selectedYear) return false;
    if (statusFilter === 'all') return true;
    return item.dataStatus === statusFilter;
  });

  const totalPages = Math.ceil(dataCollectionItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = dataCollectionItems.slice(startIndex, endIndex);

  const pendingCount = data.filter(item => item.dataStatus === 'pending').length;

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
      title: '',
      description: '',
      category: '',
      priority: 'medium',
      status: 'planned',
      budgetAllocated: 0,
      budgetUtilized: 0,
      targetBeneficiaries: 0,
      actualBeneficiaries: 0,
      targetPercentage: 80,
      actualPercentage: 65,
      startDate: '',
      endDate: '',
      responsible: ''
    });
    setShowDialog(true);
  };

  const handleEdit = (item: BudgetPlan) => {
    if (!permissions.canEdit) {
      toast.error('You do not have permission to edit data');
      return;
    }

    if (!isAdmin && item.dataStatus === 'approved') {
      toast.error('Cannot edit approved data. Please contact an administrator');
      return;
    }
    
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      category: item.category,
      priority: item.priority,
      status: item.status,
      budgetAllocated: item.budgetAllocated,
      budgetUtilized: item.budgetUtilized,
      targetBeneficiaries: item.targetBeneficiaries,
      actualBeneficiaries: item.actualBeneficiaries,
      targetPercentage: item.targetPercentage,
      actualPercentage: item.actualPercentage,
      startDate: item.startDate,
      endDate: item.endDate,
      responsible: item.responsible
    });
    setShowDialog(true);
  };

  const handleDelete = (item: BudgetPlan) => {
    if (!permissions.canDelete) {
      toast.error('You do not have permission to delete data');
      return;
    }

    if (!isAdmin && item.dataStatus === 'approved') {
      toast.error('Cannot delete approved data. Please contact an administrator');
      return;
    }

    setData(data.filter(d => d.id !== item.id));
    toast.success('Budget plan deleted successfully');
    
    const newFilteredData = data.filter(d => d.id !== item.id && d.year === selectedYear);
    const newTotalPages = Math.ceil(newFilteredData.length / itemsPerPage);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    }
  };

  const handleSave = () => {
    if (!formData.title || !formData.description || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    const dataStatus: 'pending' | 'approved' | 'rejected' = 'pending';
    const now = new Date();

    if (editingItem) {
      const updatedItem: BudgetPlan = {
        ...editingItem,
        ...formData,
        year: selectedYear,
        dataStatus,
        submittedBy: userEmail,
        reviewedBy: undefined,
        reviewedAt: undefined,
        updatedAt: now
      };

      setData(data.map(item => item.id === editingItem.id ? updatedItem : item));
      toast.success('Changes submitted for review. Awaiting admin approval');
    } else {
      const newItem: BudgetPlan = {
        id: `budget-${Date.now()}`,
        ...formData,
        year: selectedYear,
        dataStatus,
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

  const handleReviewItem = (item: BudgetPlan) => {
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
    const approvedItem: BudgetPlan = {
      ...selectedItemForReview,
      dataStatus: 'approved',
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
    const rejectedItem: BudgetPlan = {
      ...selectedItemForReview,
      dataStatus: 'rejected',
      reviewedBy: userEmail,
      reviewedAt: now,
      updatedAt: now
    };

    setData(data.map(item => item.id === selectedItemForReview.id ? rejectedItem : item));
    toast.success('Data rejected');
    setShowReviewDialog(false);
    setSelectedItemForReview(null);
  };

  const calculateInsights = () => {
    if (approvedData.length === 0) return null;

    const totalAllocated = approvedData.reduce((sum, item) => sum + item.budgetAllocated, 0);
    const totalUtilized = approvedData.reduce((sum, item) => sum + item.budgetUtilized, 0);
    const utilizationRate = totalAllocated > 0 ? (totalUtilized / totalAllocated) * 100 : 0;
    const totalBeneficiaries = approvedData.reduce((sum, item) => sum + item.actualBeneficiaries, 0);
    const completed = approvedData.filter(item => item.status === 'completed').length;
    const ongoing = approvedData.filter(item => item.status === 'ongoing').length;
    const planned = approvedData.filter(item => item.status === 'planned').length;

    return {
      totalPlans: approvedData.length,
      totalAllocated,
      totalUtilized,
      utilizationRate: utilizationRate.toFixed(1),
      totalBeneficiaries,
      completed,
      ongoing,
      planned
    };
  };

  const insights = calculateInsights();

  const statusData = [
    { name: 'Completed', value: approvedData.filter(a => a.status === 'completed').length, color: '#10b981' },
    { name: 'Ongoing', value: approvedData.filter(a => a.status === 'ongoing').length, color: '#f59e0b' },
    { name: 'Planned', value: approvedData.filter(a => a.status === 'planned').length, color: '#6b7280' }
  ];

  const categoryBudgetData = approvedData.reduce((acc, item) => {
    const existing = acc.find(a => a.category === item.category);
    if (existing) {
      existing.allocated += item.budgetAllocated;
      existing.utilized += item.budgetUtilized;
    } else {
      acc.push({ category: item.category, allocated: item.budgetAllocated, utilized: item.budgetUtilized });
    }
    return acc;
  }, [] as Array<{ category: string; allocated: number; utilized: number }>);

  const getDataStatusBadge = (status: 'pending' | 'approved' | 'rejected') => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 flex items-center gap-1"><CheckCircle className="h-3 w-3" />Approved</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-700 border-amber-200 flex items-center gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700 border-red-200 flex items-center gap-1"><XCircle className="h-3 w-3" />Rejected</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, string> = {
      'high': 'bg-red-100 text-red-700 border-red-200',
      'medium': 'bg-amber-100 text-amber-700 border-amber-200',
      'low': 'bg-green-100 text-green-700 border-green-200'
    };
    return variants[priority] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      'completed': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'ongoing': 'bg-blue-100 text-blue-700 border-blue-200',
      'planned': 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return variants[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div className="space-y-6">
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-emerald-600" />
              <Label>Year Filter</Label>
            </div>
            <Select value={selectedYear} onValueChange={handleYearChange}>
              <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {academicYears.map(year => (<SelectItem key={year} value={year}>{year}</SelectItem>))}
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
          {insights && (
            <>
              <Card className="border-gray-200 shadow-sm">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-white border-b border-gray-200">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <Target className="h-5 w-5 text-emerald-600" />
                    GAD Budget Plans Overview for {selectedYear}
                  </CardTitle>
                  <CardDescription>Strategic planning and resource allocation</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-indigo-50 to-white rounded-lg p-5 border border-indigo-100">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-600">Total Plans</h4>
                        <Target className="h-5 w-5 text-indigo-500" />
                      </div>
                      <p className="text-3xl font-bold text-indigo-600">{insights.totalPlans}</p>
                      <p className="text-xs text-gray-500 mt-1">Strategic initiatives</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-white rounded-lg p-5 border border-emerald-100">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-600">Completed</h4>
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                      </div>
                      <p className="text-3xl font-bold text-emerald-600">{insights.completed}</p>
                      <p className="text-xs text-gray-500 mt-1">Successfully finished</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg p-5 border border-blue-100">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-600">Ongoing</h4>
                        <TrendingUp className="h-5 w-5 text-blue-500" />
                      </div>
                      <p className="text-3xl font-bold text-blue-600">{insights.ongoing}</p>
                      <p className="text-xs text-gray-500 mt-1">In progress</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-white rounded-lg p-5 border border-purple-100">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-600">Beneficiaries</h4>
                        <Users className="h-5 w-5 text-purple-500" />
                      </div>
                      <p className="text-3xl font-bold text-purple-600">{insights.totalBeneficiaries.toLocaleString()}</p>
                      <p className="text-xs text-gray-500 mt-1">People served</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-gray-200 shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-emerald-50 to-white border-b border-gray-200">
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                      <BarChart3 className="h-5 w-5 text-emerald-600" />
                      Plan Status Distribution
                    </CardTitle>
                    <CardDescription>Implementation progress overview</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {approvedData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                            {statusData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                          </Pie>
                          <RechartsTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-gray-500">
                        <div className="text-center">
                          <Target className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                          <p>No approved data available for {selectedYear}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-gray-200 shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-emerald-50 to-white border-b border-gray-200">
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                      <Users className="h-5 w-5 text-emerald-600" />
                      Beneficiaries by Category
                    </CardTitle>
                    <CardDescription>Community impact distribution</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={approvedData.slice(0, 6)} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="category" type="category" width={120} style={{ fontSize: '0.75rem' }} />
                        <RechartsTooltip />
                        <Bar dataKey="actualBeneficiaries" fill="#10b981" name="Beneficiaries" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-gray-200 shadow-sm">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-white border-b border-gray-200">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                    Implementation Timeline
                  </CardTitle>
                  <CardDescription>Plans by category with timeline status</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={approvedData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="title" angle={-45} textAnchor="end" height={120} style={{ fontSize: '0.7rem' }} />
                      <YAxis label={{ value: 'Target Beneficiaries', angle: -90, position: 'insideLeft' }} />
                      <RechartsTooltip />
                      <Bar dataKey="targetBeneficiaries" fill="#3b82f6" name="Target Beneficiaries" radius={[4, 4, 0, 0]}>
                        {approvedData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.status === 'completed' ? '#10b981' : entry.status === 'ongoing' ? '#f59e0b' : '#6b7280'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-gray-200 shadow-sm bg-gray-50">
                <CardHeader className="bg-gradient-to-r from-gray-100 to-white border-b border-gray-200">
                  <CardTitle className="flex items-center gap-2 text-gray-700">
                    <DollarSign className="h-5 w-5 text-gray-500" />
                    Financial Summary
                  </CardTitle>
                  <CardDescription className="text-gray-500">Budget allocation overview (secondary metric)</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Total Allocated</p>
                      <p className="text-2xl font-bold text-gray-700">₱{(insights.totalAllocated / 1000000).toFixed(2)}M</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Utilization Rate</p>
                      <p className="text-2xl font-bold text-gray-700">{insights.utilizationRate}%</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Avg per Plan</p>
                      <p className="text-2xl font-bold text-gray-700">₱{((insights.totalAllocated / insights.totalPlans) / 1000).toFixed(0)}K</p>
                    </div>
                  </div>
                  {categoryBudgetData.length > 0 && (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={categoryBudgetData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} style={{ fontSize: '0.7rem' }} />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="allocated" fill="#9ca3af" name="Allocated" />
                        <Bar dataKey="utilized" fill="#6b7280" name="Utilized" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </>
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
                      GAD Budget Data Collection
                    </CardTitle>
                    <CardDescription>
                      Manage GAD budget plan data for {selectedYear}
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
                      <tr className="border-b-2 border-emerald-200">
                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700 bg-emerald-50/50">Title</th>
                        <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700 bg-emerald-50/50">Category</th>
                        <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700 bg-emerald-50/50">Priority</th>
                        <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700 bg-emerald-50/50">Plan Status</th>
                        <th className="text-right py-4 px-4 text-sm font-semibold text-gray-700 bg-emerald-50/50">Utilization</th>
                        <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700 bg-emerald-50/50">Data Status</th>
                        <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700 bg-emerald-50/50">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedData.length > 0 ? (
                        paginatedData.map((item, index) => {
                          const utilizationRate = item.budgetAllocated > 0 
                            ? ((item.budgetUtilized / item.budgetAllocated) * 100).toFixed(1) 
                            : '0.0';
                          return (
                            <tr key={item.id} className={`hover:bg-emerald-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                              <td className="py-4 px-4 font-medium text-gray-900">{item.title}</td>
                              <td className="text-center py-4 px-4"><Badge variant="outline">{item.category}</Badge></td>
                              <td className="text-center py-4 px-4"><Badge className={getPriorityBadge(item.priority)}>{item.priority}</Badge></td>
                              <td className="text-center py-4 px-4"><Badge className={getStatusBadge(item.status)}>{item.status}</Badge></td>
                              <td className="text-right py-4 px-4"><Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">{utilizationRate}%</Badge></td>
                              <td className="text-center py-4 px-4"><div className="flex justify-center">{getDataStatusBadge(item.dataStatus)}</div></td>
                              <td className="text-center py-4 px-4">
                                <div className="flex items-center justify-center gap-2">
                                  {item.dataStatus === 'pending' && isAdmin && (
                                    <Button variant="ghost" size="sm" onClick={() => handleReviewItem(item)} className="h-8 w-8 p-0 hover:bg-emerald-100" title="Review submission">
                                      <AlertCircle className="h-4 w-4 text-emerald-600" />
                                    </Button>
                                  )}
                                  {permissions.canEdit && (item.dataStatus !== 'approved' || isAdmin) && (
                                    <Button variant="ghost" size="sm" onClick={() => handleEdit(item)} className="h-8 w-8 p-0 hover:bg-emerald-100">
                                      <Edit className="h-4 w-4 text-emerald-600" />
                                    </Button>
                                  )}
                                  {permissions.canDelete && (item.dataStatus !== 'approved' || isAdmin) && (
                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(item)} className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-16 text-center">
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
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-emerald-100">
                    <div className="text-sm text-gray-600">Showing {startIndex + 1} to {Math.min(endIndex, dataCollectionItems.length)} of {dataCollectionItems.length} entries</div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="gap-1">
                        <ChevronLeft className="h-4 w-4" />Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(page => (
                          <Button key={page} variant={currentPage === page ? "default" : "outline"} size="sm" onClick={() => setCurrentPage(page)} className={currentPage === page ? "bg-emerald-600 hover:bg-emerald-700" : ""}>
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
            <PermissionsManager category="budget" userRole={userRole} currentUserEmail={userEmail} />
          </TabsContent>
        )}
      </Tabs>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">{editingItem ? 'Edit' : 'Add'} GAD Budget Plan</DialogTitle>
            <DialogDescription>
              Enter GAD budget plan data for {selectedYear}.
              <span className="block mt-2 text-amber-600">Note: All submissions require admin approval before publishing.</span>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">Title</Label>
              <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Enter budget plan title" className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">Description</Label>
              <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe the budget plan" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium">Category</Label>
                <Input id="category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="e.g., Capacity Building" className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority" className="text-sm font-medium">Priority</Label>
                <Select value={formData.priority} onValueChange={(value: any) => setFormData({ ...formData, priority: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium">Plan Status</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="responsible" className="text-sm font-medium">Responsible Office</Label>
                <Input id="responsible" value={formData.responsible} onChange={(e) => setFormData({ ...formData, responsible: e.target.value })} placeholder="e.g., GAD Office" className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budgetAllocated" className="text-sm font-medium">Budget Allocated (PHP)</Label>
                <Input id="budgetAllocated" type="number" value={formData.budgetAllocated} onChange={(e) => setFormData({ ...formData, budgetAllocated: parseFloat(e.target.value) || 0 })} min="0" step="0.01" className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budgetUtilized" className="text-sm font-medium">Budget Utilized (PHP)</Label>
                <Input id="budgetUtilized" type="number" value={formData.budgetUtilized} onChange={(e) => setFormData({ ...formData, budgetUtilized: parseFloat(e.target.value) || 0 })} min="0" step="0.01" className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetBeneficiaries" className="text-sm font-medium">Target Beneficiaries</Label>
                <Input id="targetBeneficiaries" type="number" value={formData.targetBeneficiaries} onChange={(e) => setFormData({ ...formData, targetBeneficiaries: parseInt(e.target.value) || 0 })} min="0" className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="actualBeneficiaries" className="text-sm font-medium">Actual Beneficiaries</Label>
                <Input id="actualBeneficiaries" type="number" value={formData.actualBeneficiaries} onChange={(e) => setFormData({ ...formData, actualBeneficiaries: parseInt(e.target.value) || 0 })} min="0" className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-sm font-medium">Start Date</Label>
                <Input id="startDate" type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-sm font-medium">End Date</Label>
                <Input id="endDate" type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className="h-11" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button type="button" onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">
              {editingItem ? 'Update' : 'Add'} Budget Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Review Submission</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedItemForReview && (
                <div className="space-y-2 mt-4">
                  <p><strong>Title:</strong> {selectedItemForReview.title}</p>
                  <p><strong>Category:</strong> {selectedItemForReview.category}</p>
                  <p><strong>Submitted by:</strong> {selectedItemForReview.submittedBy}</p>
                  <p><strong>Budget Allocated:</strong> ₱{selectedItemForReview.budgetAllocated.toLocaleString()}</p>
                  <p><strong>Budget Utilized:</strong> ₱{selectedItemForReview.budgetUtilized.toLocaleString()}</p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowReviewDialog(false)}>Cancel</AlertDialogCancel>
            <Button variant="destructive" onClick={handleReject}>Reject</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleApprove}>Approve</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
