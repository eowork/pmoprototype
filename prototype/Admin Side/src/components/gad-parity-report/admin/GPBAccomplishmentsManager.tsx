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
import { Target, TrendingUp, BarChart3, Database, Calendar, ChevronLeft, ChevronRight, Edit, Trash2, Plus, CheckCircle, XCircle, Clock, Shield, AlertCircle, Users, DollarSign } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../ui/alert-dialog';
import { rbacService } from '../services/RBACService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { PermissionsManager } from './PermissionsManager';

interface GPBAccomplishment {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  status: 'Completed' | 'Ongoing' | 'Planned';
  targetBeneficiaries: number;
  actualBeneficiaries: number;
  targetBudget: number;
  actualBudget: number;
  targetPercentage: number;
  actualPercentage: number;
  completionDate: string;
  responsible: string;
  achievementRate: number;
  year: string;
  dataStatus: 'pending' | 'approved' | 'rejected';
  submittedBy?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface GPBAccomplishmentsManagerProps {
  userRole: string;
  userEmail: string;
  userName: string;
}

const mockGPBData: GPBAccomplishment[] = [
  {
    id: 'gpb-1',
    title: 'Gender-Sensitive Budget Training Program',
    description: 'Comprehensive training on gender-responsive budgeting for university staff and faculty members',
    category: 'Capacity Building',
    priority: 'high',
    status: 'Completed',
    targetBeneficiaries: 150,
    actualBeneficiaries: 165,
    targetBudget: 500000,
    actualBudget: 480000,
    targetPercentage: 80,
    actualPercentage: 85,
    completionDate: '2024-06-15',
    responsible: 'GAD Office',
    achievementRate: 110,
    year: '2024',
    dataStatus: 'approved',
    submittedBy: 'admin@carsu.edu.ph',
    reviewedBy: 'admin@carsu.edu.ph',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'gpb-2',
    title: 'Women Leadership Development Program',
    description: 'Mentorship and leadership skills enhancement for female employees and students',
    category: 'Leadership Development',
    priority: 'high',
    status: 'Ongoing',
    targetBeneficiaries: 100,
    actualBeneficiaries: 92,
    targetBudget: 400000,
    actualBudget: 350000,
    targetPercentage: 75,
    actualPercentage: 70,
    completionDate: '2024-12-31',
    responsible: 'HR Department',
    achievementRate: 92,
    year: '2024',
    dataStatus: 'approved',
    submittedBy: 'staff@carsu.edu.ph',
    reviewedBy: 'admin@carsu.edu.ph',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01')
  },
  {
    id: 'gpb-3',
    title: 'Anti-Sexual Harassment Awareness Campaign',
    description: 'University-wide campaign promoting safe spaces and harassment prevention',
    category: 'Policy Implementation',
    priority: 'high',
    status: 'Completed',
    targetBeneficiaries: 500,
    actualBeneficiaries: 520,
    targetBudget: 250000,
    actualBudget: 245000,
    targetPercentage: 90,
    actualPercentage: 95,
    completionDate: '2024-05-30',
    responsible: 'Legal Office',
    achievementRate: 104,
    year: '2024',
    dataStatus: 'approved',
    submittedBy: 'admin@carsu.edu.ph',
    reviewedBy: 'admin@carsu.edu.ph',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: 'gpb-4',
    title: 'Gender-Responsive Research Grants',
    description: 'Research funding supporting gender equality and women empowerment studies',
    category: 'Research Support',
    priority: 'medium',
    status: 'Ongoing',
    targetBeneficiaries: 50,
    actualBeneficiaries: 45,
    targetBudget: 800000,
    actualBudget: 720000,
    targetPercentage: 70,
    actualPercentage: 68,
    completionDate: '2024-11-30',
    responsible: 'Research Office',
    achievementRate: 90,
    year: '2024',
    dataStatus: 'approved',
    submittedBy: 'staff@carsu.edu.ph',
    reviewedBy: 'admin@carsu.edu.ph',
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-01')
  },
  {
    id: 'gpb-5',
    title: 'Childcare Support Services Enhancement',
    description: 'Improved childcare facilities and lactation rooms for working mothers',
    category: 'Work-Life Balance',
    priority: 'medium',
    status: 'Completed',
    targetBeneficiaries: 80,
    actualBeneficiaries: 88,
    targetBudget: 600000,
    actualBudget: 580000,
    targetPercentage: 85,
    actualPercentage: 90,
    completionDate: '2024-07-15',
    responsible: 'Admin Services',
    achievementRate: 110,
    year: '2024',
    dataStatus: 'approved',
    submittedBy: 'admin@carsu.edu.ph',
    reviewedBy: 'admin@carsu.edu.ph',
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-02-15')
  },
  {
    id: 'gpb-6',
    title: 'Gender Data Management System',
    description: 'Development of comprehensive gender-disaggregated data collection system',
    category: 'Data Management',
    priority: 'high',
    status: 'Ongoing',
    targetBeneficiaries: 200,
    actualBeneficiaries: 180,
    targetBudget: 450000,
    actualBudget: 400000,
    targetPercentage: 75,
    actualPercentage: 72,
    completionDate: '2024-10-31',
    responsible: 'IT Department',
    achievementRate: 90,
    year: '2024',
    dataStatus: 'approved',
    submittedBy: 'staff@carsu.edu.ph',
    reviewedBy: 'admin@carsu.edu.ph',
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date('2024-03-15')
  },
  {
    id: 'gpb-7',
    title: 'Gender Equity Scholarship Program',
    description: 'Scholarships promoting gender balance in male-dominated fields',
    category: 'Student Support',
    priority: 'high',
    status: 'Planned',
    targetBeneficiaries: 120,
    actualBeneficiaries: 0,
    targetBudget: 900000,
    actualBudget: 0,
    targetPercentage: 80,
    actualPercentage: 0,
    completionDate: '2025-03-31',
    responsible: 'Student Affairs',
    achievementRate: 0,
    year: '2024',
    dataStatus: 'approved',
    submittedBy: 'admin@carsu.edu.ph',
    reviewedBy: 'admin@carsu.edu.ph',
    createdAt: new Date('2024-04-01'),
    updatedAt: new Date('2024-04-01')
  },
  {
    id: 'gpb-8',
    title: 'Women in STEM Advocacy Program',
    description: 'Promotion of female participation in Science, Technology, Engineering, and Mathematics',
    category: 'Advocacy Programs',
    priority: 'medium',
    status: 'Ongoing',
    targetBeneficiaries: 180,
    actualBeneficiaries: 165,
    targetBudget: 350000,
    actualBudget: 320000,
    targetPercentage: 70,
    actualPercentage: 68,
    completionDate: '2024-09-30',
    responsible: 'College of Engineering',
    achievementRate: 92,
    year: '2024',
    dataStatus: 'approved',
    submittedBy: 'staff@carsu.edu.ph',
    reviewedBy: 'admin@carsu.edu.ph',
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-02-20')
  }
];

export function GPBAccomplishmentsManager({ userRole, userEmail, userName }: GPBAccomplishmentsManagerProps) {
  const [data, setData] = useState<GPBAccomplishment[]>(mockGPBData);
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<GPBAccomplishment | null>(null);
  const [selectedYear, setSelectedYear] = useState('2024');
  const [activeTab, setActiveTab] = useState('analytics');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedItemForReview, setSelectedItemForReview] = useState<GPBAccomplishment | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    status: 'Planned' as 'Completed' | 'Ongoing' | 'Planned',
    targetBeneficiaries: 0,
    actualBeneficiaries: 0,
    targetBudget: 0,
    actualBudget: 0,
    targetPercentage: 80,
    actualPercentage: 70,
    completionDate: '',
    responsible: '',
    achievementRate: 0
  });

  const isAdmin = userRole === 'Admin';
  const itemsPerPage = 10;

  const permissions = rbacService.getUserPermissions(userEmail, userRole, 'gpb');
  const canAccessDataCollection = isAdmin || rbacService.canPerformCRUD(userEmail, userRole, 'gpb');

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
      status: 'Planned',
      targetBeneficiaries: 0,
      actualBeneficiaries: 0,
      targetBudget: 0,
      actualBudget: 0,
      targetPercentage: 80,
      actualPercentage: 70,
      completionDate: '',
      responsible: '',
      achievementRate: 0
    });
    setShowDialog(true);
  };

  const handleEdit = (item: GPBAccomplishment) => {
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
      targetBeneficiaries: item.targetBeneficiaries,
      actualBeneficiaries: item.actualBeneficiaries,
      targetBudget: item.targetBudget,
      actualBudget: item.actualBudget,
      targetPercentage: item.targetPercentage,
      actualPercentage: item.actualPercentage,
      completionDate: item.completionDate,
      responsible: item.responsible,
      achievementRate: item.achievementRate
    });
    setShowDialog(true);
  };

  const handleDelete = (item: GPBAccomplishment) => {
    if (!permissions.canDelete) {
      toast.error('You do not have permission to delete data');
      return;
    }

    if (!isAdmin && item.dataStatus === 'approved') {
      toast.error('Cannot delete approved data. Please contact an administrator');
      return;
    }

    setData(data.filter(d => d.id !== item.id));
    toast.success('GPB accomplishment deleted successfully');
    
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
      const updatedItem: GPBAccomplishment = {
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
      const newItem: GPBAccomplishment = {
        id: `gpb-${Date.now()}`,
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

  const handleReviewItem = (item: GPBAccomplishment) => {
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
    const approvedItem: GPBAccomplishment = {
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
    const rejectedItem: GPBAccomplishment = {
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

    const totalBeneficiaries = approvedData.reduce((sum, item) => sum + item.actualBeneficiaries, 0);
    const totalBudget = approvedData.reduce((sum, item) => sum + item.actualBudget, 0);
    const avgAchievement = approvedData.reduce((sum, item) => sum + item.achievementRate, 0) / approvedData.length;
    const completed = approvedData.filter(item => item.status === 'Completed').length;

    return {
      totalProjects: approvedData.length,
      totalBeneficiaries,
      totalBudget,
      avgAchievement: avgAchievement.toFixed(1),
      completed
    };
  };

  const insights = calculateInsights();

  const statusData = [
    { name: 'Completed', value: approvedData.filter(a => a.status === 'Completed').length, color: '#10b981' },
    { name: 'Ongoing', value: approvedData.filter(a => a.status === 'Ongoing').length, color: '#f59e0b' },
    { name: 'Planned', value: approvedData.filter(a => a.status === 'Planned').length, color: '#6b7280' }
  ];

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
      'Completed': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'Ongoing': 'bg-blue-100 text-blue-700 border-blue-200',
      'Planned': 'bg-gray-100 text-gray-700 border-gray-200'
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
                    GPB Program Overview for {selectedYear}
                  </CardTitle>
                  <CardDescription>Comprehensive accomplishments and impact metrics</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-indigo-50 to-white rounded-lg p-5 border border-indigo-100">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-600">Total Programs</h4>
                        <Target className="h-5 w-5 text-indigo-500" />
                      </div>
                      <p className="text-3xl font-bold text-indigo-600">{insights.totalProjects}</p>
                      <p className="text-xs text-gray-500 mt-1">Active initiatives</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-white rounded-lg p-5 border border-purple-100">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-600">Beneficiaries Reached</h4>
                        <Users className="h-5 w-5 text-purple-500" />
                      </div>
                      <p className="text-3xl font-bold text-purple-600">{insights.totalBeneficiaries.toLocaleString()}</p>
                      <p className="text-xs text-gray-500 mt-1">Community impact</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-white rounded-lg p-5 border border-emerald-100">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-600">Avg Achievement</h4>
                        <TrendingUp className="h-5 w-5 text-emerald-500" />
                      </div>
                      <p className="text-3xl font-bold text-emerald-600">{insights.avgAchievement}%</p>
                      <p className="text-xs text-gray-500 mt-1">Success rate</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg p-5 border border-blue-100">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-600">Completed</h4>
                        <CheckCircle className="h-5 w-5 text-blue-500" />
                      </div>
                      <p className="text-3xl font-bold text-blue-600">{insights.completed}</p>
                      <p className="text-xs text-gray-500 mt-1">Of {insights.totalProjects} programs</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-gray-200 shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-emerald-50 to-white border-b border-gray-200">
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                      <BarChart3 className="h-5 w-5 text-emerald-600" />
                      Program Status Distribution
                    </CardTitle>
                    <CardDescription>Implementation progress tracking</CardDescription>
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
                    <CardDescription>Community reach and engagement</CardDescription>
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
                    Achievement Rates by Program
                  </CardTitle>
                  <CardDescription>Performance analysis across all initiatives</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={approvedData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="title" angle={-45} textAnchor="end" height={120} style={{ fontSize: '0.7rem' }} />
                      <YAxis label={{ value: 'Achievement Rate (%)', angle: -90, position: 'insideLeft' }} />
                      <RechartsTooltip />
                      <Bar dataKey="achievementRate" fill="#10b981" name="Achievement %" radius={[4, 4, 0, 0]}>
                        {approvedData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.achievementRate >= 100 ? '#10b981' : entry.achievementRate >= 80 ? '#f59e0b' : '#ef4444'} />
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
                    Budget Utilization Summary
                  </CardTitle>
                  <CardDescription className="text-gray-500">Financial overview (secondary metric)</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Total Budget</p>
                      <p className="text-2xl font-bold text-gray-700">₱{(insights.totalBudget / 1000000).toFixed(2)}M</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Programs</p>
                      <p className="text-2xl font-bold text-gray-700">{insights.totalProjects}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Avg per Program</p>
                      <p className="text-2xl font-bold text-gray-700">₱{((insights.totalBudget / insights.totalProjects) / 1000).toFixed(0)}K</p>
                    </div>
                  </div>
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
                      GPB Data Collection
                    </CardTitle>
                    <CardDescription>
                      Manage GPB accomplishment data for {selectedYear}
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
                        <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700 bg-emerald-50/50">Program Status</th>
                        <th className="text-right py-4 px-4 text-sm font-semibold text-gray-700 bg-emerald-50/50">Achievement</th>
                        <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700 bg-emerald-50/50">Data Status</th>
                        <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700 bg-emerald-50/50">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedData.length > 0 ? (
                        paginatedData.map((item, index) => (
                          <tr key={item.id} className={`hover:bg-emerald-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                            <td className="py-4 px-4 font-medium text-gray-900">{item.title}</td>
                            <td className="text-center py-4 px-4"><Badge variant="outline">{item.category}</Badge></td>
                            <td className="text-center py-4 px-4"><Badge className={getPriorityBadge(item.priority)}>{item.priority}</Badge></td>
                            <td className="text-center py-4 px-4"><Badge className={getStatusBadge(item.status)}>{item.status}</Badge></td>
                            <td className="text-right py-4 px-4"><Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">{item.achievementRate}%</Badge></td>
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
                        ))
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
            <PermissionsManager category="gpb" userRole={userRole} currentUserEmail={userEmail} />
          </TabsContent>
        )}
      </Tabs>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">{editingItem ? 'Edit' : 'Add'} GPB Accomplishment</DialogTitle>
            <DialogDescription>
              Enter GPB accomplishment data for {selectedYear}.
              <span className="block mt-2 text-amber-600">Note: All submissions require admin approval before publishing.</span>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">Title</Label>
              <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Enter accomplishment title" className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">Description</Label>
              <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe the accomplishment" rows={3} />
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
                <Label htmlFor="status" className="text-sm font-medium">Program Status</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Planned">Planned</SelectItem>
                    <SelectItem value="Ongoing">Ongoing</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="responsible" className="text-sm font-medium">Responsible Office</Label>
                <Input id="responsible" value={formData.responsible} onChange={(e) => setFormData({ ...formData, responsible: e.target.value })} placeholder="e.g., GAD Office" className="h-11" />
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
                <Label htmlFor="targetBudget" className="text-sm font-medium">Target Budget (PHP)</Label>
                <Input id="targetBudget" type="number" value={formData.targetBudget} onChange={(e) => setFormData({ ...formData, targetBudget: parseFloat(e.target.value) || 0 })} min="0" step="0.01" className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="actualBudget" className="text-sm font-medium">Actual Budget (PHP)</Label>
                <Input id="actualBudget" type="number" value={formData.actualBudget} onChange={(e) => setFormData({ ...formData, actualBudget: parseFloat(e.target.value) || 0 })} min="0" step="0.01" className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="completionDate" className="text-sm font-medium">Target Completion Date</Label>
                <Input id="completionDate" type="date" value={formData.completionDate} onChange={(e) => setFormData({ ...formData, completionDate: e.target.value })} className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="achievementRate" className="text-sm font-medium">Achievement Rate (%)</Label>
                <Input id="achievementRate" type="number" value={formData.achievementRate} onChange={(e) => setFormData({ ...formData, achievementRate: parseFloat(e.target.value) || 0 })} min="0" max="100" step="0.1" className="h-11" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button type="button" onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">
              {editingItem ? 'Update' : 'Add'} Accomplishment
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
                  <p><strong>Achievement Rate:</strong> {selectedItemForReview.achievementRate}%</p>
                  <p><strong>Actual Beneficiaries:</strong> {selectedItemForReview.actualBeneficiaries.toLocaleString()}</p>
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
