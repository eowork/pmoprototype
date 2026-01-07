import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Progress } from '../../ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Label } from '../../ui/label';
import { Badge } from '../../ui/badge';
import { Textarea } from '../../ui/textarea';
import { ScrollArea } from '../../ui/scroll-area';
import { Separator } from '../../ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../ui/collapsible';
import { 
  DollarSign, 
  TrendingUp, 
  PieChart, 
  BarChart3, 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc,
  Building2,
  Landmark,
  University,
  BookOpen,
  Calculator,
  CreditCard,
  Plus,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Eye,
  ChevronDown,
  ChevronUp,
  Target,
  Percent,
  Activity,
  BarChart4,
  LineChart,
  Database,
  Table,
  FileText
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart as RechartsLineChart, 
  Line, 
  PieChart as RechartsPieChart, 
  Pie,
  Cell, 
  Legend,
  Area,
  AreaChart
} from 'recharts';
import { toast } from 'sonner@2.0.3';

// Enhanced Financial data types
interface FinancialRecord {
  id: string;
  operationsPrograms: string;
  allotment: number;
  target: number;
  obligation: number;
  utilizationPerTarget: number;
  utilizationPerApprovedBudget: number;
  disbursement: number;
  disbursementRate: number;
  category: string;
  subcategory: string;
  status: 'active' | 'completed' | 'pending' | 'cancelled';
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
  remarks?: string;
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  year: number;
  budgetSource: string;
  department: string;
  projectCode?: string;
  variance?: number;
  performanceIndicator?: string;
}

// Mock financial data generator
const generateFinancialData = (category: string): FinancialRecord[] => {
  const currentYear = new Date().getFullYear();
  
  const programData = [
    { 
      name: 'General Management Services', 
      allotment: 37930786.98, 
      target: 15467169.53,
      department: 'Administration',
      budgetSource: 'Regular Agency Funds'
    },
    { 
      name: 'Support to Operations', 
      allotment: 6663634.59, 
      target: 2170179.65,
      department: 'Operations Support',
      budgetSource: 'Regular Agency Funds'
    },
    { 
      name: 'Higher Education Program', 
      allotment: 30117984.39, 
      target: 16089955.67,
      department: 'Academic Affairs',
      budgetSource: 'Regular Agency Funds'
    },
    { 
      name: 'Advanced Education Program', 
      allotment: 238684.00, 
      target: 110255.00,
      department: 'Graduate School',
      budgetSource: 'Regular Agency Funds'
    },
    { 
      name: 'Research Program', 
      allotment: 585224.00, 
      target: 139364.00,
      department: 'Research Office',
      budgetSource: 'Regular Agency Funds'
    },
    { 
      name: 'Technical Advisory Extension Program', 
      allotment: 718628.04, 
      target: 265485.70,
      department: 'Extension Office',
      budgetSource: 'Regular Agency Funds'
    },
    { 
      name: 'Student Development Program', 
      allotment: 4500000, 
      target: 3800000,
      department: 'Student Affairs',
      budgetSource: 'Internally Generated Funds'
    },
    { 
      name: 'Faculty Development Program', 
      allotment: 3200000, 
      target: 2900000,
      department: 'Human Resources',
      budgetSource: 'Internally Generated Funds'
    }
  ];

  return programData.map((item, index) => {
    const baseObligation = item.target * (0.6 + Math.random() * 0.3);
    const obligation = Math.min(baseObligation, item.allotment * 0.85);
    const disbursement = obligation * (0.5 + Math.random() * 0.4);
    const utilizationPerTarget = (obligation / item.target) * 100;
    const utilizationPerApprovedBudget = (obligation / item.allotment) * 100;
    const disbursementRate = (disbursement / obligation) * 100;
    const quarters: ('Q1' | 'Q2' | 'Q3' | 'Q4')[] = ['Q1', 'Q2', 'Q3', 'Q4'];
    const statusOptions: ('active' | 'completed' | 'pending' | 'cancelled')[] = ['active', 'completed', 'pending'];
    
    return {
      id: `${category}-${index}`,
      operationsPrograms: item.name,
      allotment: item.allotment,
      target: item.target,
      obligation: obligation,
      utilizationPerTarget: Math.round(utilizationPerTarget),
      utilizationPerApprovedBudget: Math.round(utilizationPerApprovedBudget),
      disbursement: disbursement,
      disbursementRate: Math.round(disbursementRate),
      category: category,
      subcategory: category,
      status: statusOptions[Math.floor(Math.random() * statusOptions.length)],
      createdBy: 'System Admin',
      updatedBy: 'Budget Officer',
      createdAt: new Date(),
      updatedAt: new Date(),
      remarks: Math.random() > 0.7 ? 'Budget execution proceeding as planned' : '',
      quarter: quarters[Math.floor(Math.random() * quarters.length)],
      year: currentYear,
      budgetSource: item.budgetSource,
      department: item.department,
      projectCode: `PROJ-${(index + 1).toString().padStart(3, '0')}`,
      variance: (obligation - item.target),
      performanceIndicator: utilizationPerTarget >= 80 ? 'Excellent' : utilizationPerTarget >= 60 ? 'Good' : 'Needs Improvement'
    };
  });
};

// Financial subcategories
const FINANCIAL_SUBCATEGORIES = [
  {
    id: 'overview',
    label: 'Financial Overview',
    shortLabel: 'Overview',
    icon: Activity,
    description: 'Consolidated financial summary across all categories',
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  {
    id: 'regular-programs',
    label: 'Regular Agency Funds (Programs)',
    shortLabel: 'RAF Programs',
    icon: BookOpen,
    description: 'Regular operational programs and activities',
    color: 'bg-green-100 text-green-800 border-green-200'
  },
  {
    id: 'regular-projects',
    label: 'Regular Agency Funds (Projects)',
    shortLabel: 'RAF Projects',
    icon: Building2,
    description: 'Project-based regular funding allocations',
    color: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  {
    id: 'continuing-appropriations',
    label: 'Regular Agency Funds (Continuing Appropriations)',
    shortLabel: 'RAF Continuing',
    icon: Landmark,
    description: 'Multi-year continuing appropriation funds',
    color: 'bg-orange-100 text-orange-800 border-orange-200'
  },
  {
    id: 'igf-main',
    label: 'Internally Generated Funds (Main Campus)',
    shortLabel: 'IGF Main',
    icon: University,
    description: 'IGF from main campus operations',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200'
  },
  {
    id: 'igf-cabadbaran',
    label: 'Internally Generated Funds (Cabadbaran Campus)',
    shortLabel: 'IGF Cabadbaran',
    icon: University,
    description: 'IGF from Cabadbaran campus operations',
    color: 'bg-pink-100 text-pink-800 border-pink-200'
  }
];

interface FinancialAccomplishmentTabProps {
  selectedYear: number;
  userRole: string;
  canEdit: boolean;
  requireAuth: (action: string) => boolean;
}

export function FinancialAccomplishmentTab({
  selectedYear,
  userRole,
  canEdit,
  requireAuth
}: FinancialAccomplishmentTabProps) {
  const [activeSubcategory, setActiveSubcategory] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<keyof FinancialRecord>('operationsPrograms');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterUtilization, setFilterUtilization] = useState<'all' | 'excellent' | 'good' | 'needs-improvement'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'pending' | 'cancelled'>('all');
  const [filterQuarter, setFilterQuarter] = useState<'all' | 'Q1' | 'Q2' | 'Q3' | 'Q4'>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  
  // Collapsible sections state - default to open for overview sub-tab
  const [showVisualizations, setShowVisualizations] = useState(activeSubcategory === 'overview');
  
  // Update visualizations state when subcategory changes
  React.useEffect(() => {
    if (activeSubcategory === 'overview') {
      setShowVisualizations(true);
    }
  }, [activeSubcategory]);
  
  // CRUD Dialog States
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<FinancialRecord | null>(null);
  const [formData, setFormData] = useState<Partial<FinancialRecord>>({});

  // Generate comprehensive financial data for all subcategories
  const [allFinancialData, setAllFinancialData] = useState<Record<string, FinancialRecord[]>>(() => {
    const data: Record<string, FinancialRecord[]> = {};
    FINANCIAL_SUBCATEGORIES.forEach(subcategory => {
      if (subcategory.id !== 'overview') {
        data[subcategory.id] = generateFinancialData(subcategory.id);
      }
    });
    return data;
  });

  // Current subcategory data
  const currentData = activeSubcategory === 'overview' 
    ? Object.values(allFinancialData).flat()
    : allFinancialData[activeSubcategory] || [];

  // Get unique departments for filtering
  const uniqueDepartments = useMemo(() => {
    const departments = new Set(currentData.map(record => record.department));
    return Array.from(departments).sort();
  }, [currentData]);

  // Enhanced filtering and sorting
  const filteredAndSortedData = useMemo(() => {
    let filtered = currentData.filter(record => {
      const matchesSearch = record.operationsPrograms.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (record.projectCode?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      
      let matchesUtilization = true;
      if (filterUtilization !== 'all') {
        const utilization = record.utilizationPerTarget;
        if (filterUtilization === 'excellent') matchesUtilization = utilization >= 80;
        else if (filterUtilization === 'good') matchesUtilization = utilization >= 60 && utilization < 80;
        else if (filterUtilization === 'needs-improvement') matchesUtilization = utilization < 60;
      }

      const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
      const matchesQuarter = filterQuarter === 'all' || record.quarter === filterQuarter;
      const matchesDepartment = filterDepartment === 'all' || record.department === filterDepartment;

      return matchesSearch && matchesUtilization && matchesStatus && matchesQuarter && matchesDepartment;
    });

    // Sort the filtered data
    filtered.sort((a, b) => {
      let valueA = a[sortBy];
      let valueB = b[sortBy];
      
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortOrder === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
      } else if (typeof valueA === 'number' && typeof valueB === 'number') {
        return sortOrder === 'asc' ? (valueA - valueB) : (valueB - valueA);
      } else {
        return 0;
      }
    });

    return filtered;
  }, [currentData, searchTerm, sortBy, sortOrder, filterUtilization, filterStatus, filterQuarter, filterDepartment]);

  // Calculate overview statistics
  const overviewStats = useMemo(() => {
    const allData = Object.values(allFinancialData).flat();
    
    return {
      totalAllotment: allData.reduce((sum, record) => sum + record.allotment, 0),
      totalTarget: allData.reduce((sum, record) => sum + record.target, 0),
      totalObligation: allData.reduce((sum, record) => sum + record.obligation, 0),
      totalDisbursement: allData.reduce((sum, record) => sum + record.disbursement, 0),
      avgUtilizationTarget: allData.length > 0 ? allData.reduce((sum, record) => sum + record.utilizationPerTarget, 0) / allData.length : 0,
      avgUtilizationBudget: allData.length > 0 ? allData.reduce((sum, record) => sum + record.utilizationPerApprovedBudget, 0) / allData.length : 0,
      avgDisbursementRate: allData.length > 0 ? allData.reduce((sum, record) => sum + record.disbursementRate, 0) / allData.length : 0,
      recordCount: allData.length,
      activeRecords: allData.filter(r => r.status === 'active').length,
      completedRecords: allData.filter(r => r.status === 'completed').length,
      excellentPerformance: allData.filter(r => r.utilizationPerTarget >= 80).length,
      goodPerformance: allData.filter(r => r.utilizationPerTarget >= 60 && r.utilizationPerTarget < 80).length,
      needsImprovement: allData.filter(r => r.utilizationPerTarget < 60).length
    };
  }, [allFinancialData]);

  // Chart data for visualizations
  const chartData = useMemo(() => {
    if (activeSubcategory === 'overview') {
      return FINANCIAL_SUBCATEGORIES.slice(1).map(subcategory => {
        const data = allFinancialData[subcategory.id] || [];
        return {
          name: subcategory.shortLabel,
          fullName: subcategory.label,
          allotment: data.reduce((sum, record) => sum + record.allotment, 0),
          obligation: data.reduce((sum, record) => sum + record.obligation, 0),
          disbursement: data.reduce((sum, record) => sum + record.disbursement, 0),
          utilizationRate: data.length > 0 ? data.reduce((sum, record) => sum + record.utilizationPerTarget, 0) / data.length : 0,
          category: subcategory.id
        };
      });
    } else {
      return filteredAndSortedData.slice(0, 8).map(record => ({
        name: record.operationsPrograms.length > 20 ? record.operationsPrograms.substring(0, 20) + '...' : record.operationsPrograms,
        fullName: record.operationsPrograms,
        allotment: record.allotment,
        target: record.target,
        obligation: record.obligation,
        disbursement: record.disbursement,
        utilizationRate: record.utilizationPerTarget,
        id: record.id
      }));
    }
  }, [activeSubcategory, allFinancialData, filteredAndSortedData]);

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value: number): string => {
    return `${Math.round(value)}%`;
  };

  // Chart colors
  const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

  // Navigation controls
  const renderNavigationControls = () => (
    <div className="mb-6">
      <div className="bg-white border border-slate-200 rounded-lg p-1 shadow-sm overflow-hidden">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900 flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            Financial Management
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            {FINANCIAL_SUBCATEGORIES.find(s => s.id === activeSubcategory)?.description}
          </p>
        </div>
        
        <div className="p-2">
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-2">
            {FINANCIAL_SUBCATEGORIES.map((subcategory) => {
              const IconComponent = subcategory.icon;
              const isActive = activeSubcategory === subcategory.id;
              
              return (
                <Button
                  key={subcategory.id}
                  variant={isActive ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveSubcategory(subcategory.id)}
                  className={`
                    flex flex-col h-auto p-3 relative transition-all duration-200
                    ${isActive 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'text-slate-700 hover:bg-slate-100'
                    }
                  `}
                >
                  <IconComponent className={`h-4 w-4 mb-1 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span className="text-xs font-medium leading-tight text-center">
                    {subcategory.shortLabel}
                  </span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  // Key metrics summary
  const renderKeyMetrics = () => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="border-slate-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Budget</p>
              <p className="font-semibold text-slate-900">
                {formatCurrency(overviewStats.totalAllotment)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Target className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Utilization</p>
              <p className="font-semibold text-slate-900">
                {formatPercentage(overviewStats.avgUtilizationTarget)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Disbursement</p>
              <p className="font-semibold text-slate-900">
                {formatCurrency(overviewStats.totalDisbursement)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <FileText className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Programs</p>
              <p className="font-semibold text-slate-900">
                {overviewStats.recordCount}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Filter controls
  const renderFilterControls = () => (
    <Card className="mb-6 border-slate-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-600" />
            <CardTitle className="text-base">Search & Filter</CardTitle>
          </div>
          <div className="text-sm text-slate-600">
            {filteredAndSortedData.length} of {currentData.length} records
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search programs, departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Select value={sortBy as string} onValueChange={(value) => setSortBy(value as keyof FinancialRecord)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="operationsPrograms">Program</SelectItem>
                <SelectItem value="allotment">Allotment</SelectItem>
                <SelectItem value="obligation">Obligation</SelectItem>
                <SelectItem value="utilizationPerTarget">Utilization</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3"
            >
              {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
            </Button>
          </div>

          <div>
            <Select value={filterUtilization} onValueChange={(value: any) => setFilterUtilization(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Performance</SelectItem>
                <SelectItem value="excellent">Excellent (≥80%)</SelectItem>
                <SelectItem value="good">Good (60-79%)</SelectItem>
                <SelectItem value="needs-improvement">Needs Improvement (&lt;60%)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {uniqueDepartments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {canEdit && activeSubcategory !== 'overview' && (
            <Button
              onClick={() => {
                setFormData({
                  status: 'active',
                  allotment: 0,
                  target: 0,
                  obligation: 0,
                  disbursement: 0,
                  utilizationPerTarget: 0,
                  utilizationPerApprovedBudget: 0,
                  disbursementRate: 0,
                  budgetSource: 'Regular Agency Funds'
                });
                setIsCreateDialogOpen(true);
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Record
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Main data table - prioritized display
  const renderDataTable = () => (
    <Card className="mb-6 border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Table className="h-5 w-5 text-slate-600" />
          Financial Records
          {activeSubcategory !== 'overview' && (
            <span className="text-base font-normal text-slate-600">
              - {FINANCIAL_SUBCATEGORIES.find(s => s.id === activeSubcategory)?.label}
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Comprehensive financial data with key performance indicators
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-96">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b sticky top-0">
                <tr>
                  <th className="text-left p-4 font-medium text-slate-700 min-w-[200px]">
                    Program/Operations
                  </th>
                  <th className="text-right p-4 font-medium text-slate-700 min-w-[120px]">
                    Allotment
                  </th>
                  <th className="text-right p-4 font-medium text-slate-700 min-w-[120px]">
                    Target
                  </th>
                  <th className="text-right p-4 font-medium text-slate-700 min-w-[120px]">
                    Obligation
                  </th>
                  <th className="text-right p-4 font-medium text-slate-700 min-w-[100px]">
                    Utilization
                  </th>
                  <th className="text-right p-4 font-medium text-slate-700 min-w-[120px]">
                    Disbursement
                  </th>
                  <th className="text-right p-4 font-medium text-slate-700 min-w-[80px]">
                    Rate
                  </th>
                  <th className="text-center p-4 font-medium text-slate-700 min-w-[100px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedData.map((record, index) => (
                  <tr 
                    key={record.id} 
                    className={`border-b border-slate-100 hover:bg-slate-50 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-25'}`}
                  >
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-slate-900 leading-tight">
                          {record.operationsPrograms}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {record.department}
                        </p>
                      </div>
                    </td>
                    <td className="p-4 text-right font-mono text-sm">
                      {formatCurrency(record.allotment)}
                    </td>
                    <td className="p-4 text-right font-mono text-sm">
                      {formatCurrency(record.target)}
                    </td>
                    <td className="p-4 text-right font-mono text-sm">
                      {formatCurrency(record.obligation)}
                    </td>
                    <td className="p-4 text-right">
                      <Badge 
                        variant={
                          record.utilizationPerTarget >= 80 ? 'default' : 
                          record.utilizationPerTarget >= 60 ? 'secondary' : 
                          'destructive'
                        }
                      >
                        {formatPercentage(record.utilizationPerTarget)}
                      </Badge>
                    </td>
                    <td className="p-4 text-right font-mono text-sm">
                      {formatCurrency(record.disbursement)}
                    </td>
                    <td className="p-4 text-right">
                      <Badge 
                        variant={
                          record.disbursementRate >= 80 ? 'default' : 
                          record.disbursementRate >= 60 ? 'secondary' : 
                          'destructive'
                        }
                      >
                        {formatPercentage(record.disbursementRate)}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRecord(record);
                            setIsViewDialogOpen(true);
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {canEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedRecord(record);
                              setFormData({
                                operationsPrograms: record.operationsPrograms,
                                allotment: record.allotment,
                                target: record.target,
                                obligation: record.obligation,
                                disbursement: record.disbursement,
                                utilizationPerTarget: record.utilizationPerTarget,
                                utilizationPerApprovedBudget: record.utilizationPerApprovedBudget,
                                disbursementRate: record.disbursementRate,
                                status: record.status,
                                remarks: record.remarks,
                                budgetSource: record.budgetSource,
                                department: record.department
                              });
                              setIsEditDialogOpen(true);
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {userRole === 'Admin' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm(`Delete "${record.operationsPrograms}"?`)) {
                                setAllFinancialData(prev => ({
                                  ...prev,
                                  [activeSubcategory]: prev[activeSubcategory]?.filter(r => r.id !== record.id) || []
                                }));
                                toast.success('Record deleted successfully');
                              }
                            }}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredAndSortedData.length === 0 && (
              <div className="p-8 text-center">
                <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">No records found</p>
                <p className="text-sm text-slate-500 mt-1">
                  Try adjusting your search criteria
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );

  // Enhanced collapsible visualizations section with improved styling
  const renderVisualizations = () => (
    <Collapsible open={showVisualizations} onOpenChange={setShowVisualizations}>
      <Card className="border-slate-200 shadow-sm">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-base text-slate-900">Financial Data Visualizations</CardTitle>
                  <CardDescription className="text-sm">
                    Interactive charts and trends analysis
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {showVisualizations ? 'Expanded' : 'Collapsed'}
                </Badge>
                {showVisualizations ? 
                  <ChevronUp className="h-5 w-5 text-slate-600" /> : 
                  <ChevronDown className="h-5 w-5 text-slate-600" />
                }
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="p-6 bg-gradient-to-b from-slate-50 to-white">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Enhanced Budget Overview Chart */}
              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 bg-blue-50 rounded">
                    <DollarSign className="h-4 w-4 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-slate-900">Budget Overview</h4>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 11 }}
                      stroke="#64748b"
                    />
                    <YAxis 
                      tick={{ fontSize: 11 }}
                      tickFormatter={(value) => `₱${(value / 1000000).toFixed(1)}M`}
                      stroke="#64748b"
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => [formatCurrency(value), name]}
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '12px' }} />
                    <Bar dataKey="allotment" fill="#3b82f6" name="Allotment" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="obligation" fill="#10b981" name="Obligation" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="disbursement" fill="#f59e0b" name="Disbursement" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Enhanced Utilization Trends */}
              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 bg-green-50 rounded">
                    <Percent className="h-4 w-4 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-slate-900">Utilization Trends</h4>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsLineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 11 }}
                      stroke="#64748b"
                    />
                    <YAxis 
                      domain={[0, 100]}
                      tick={{ fontSize: 11 }}
                      tickFormatter={(value) => `${value}%`}
                      stroke="#64748b"
                    />
                    <Tooltip 
                      formatter={(value: number) => [`${value.toFixed(1)}%`, 'Utilization Rate']}
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '12px' }} />
                    <Line 
                      type="monotone" 
                      dataKey="utilizationRate" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 5 }}
                      name="Utilization Rate"
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Enhanced Summary Statistics Section */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg">
                    <Calculator className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm text-blue-700">Total Allotment</div>
                    <div className="font-semibold text-blue-900">
                      {formatCurrency(chartData.reduce((sum, item) => sum + item.allotment, 0))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm text-green-700">Avg Utilization</div>
                    <div className="font-semibold text-green-900">
                      {chartData.length > 0 
                        ? formatPercentage(chartData.reduce((sum, item) => sum + item.utilizationRate, 0) / chartData.length)
                        : '0%'}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg">
                    <PieChart className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-sm text-purple-700">Data Points</div>
                    <div className="font-semibold text-purple-900">{chartData.length}</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );

  // CRUD operations
  const handleCreate = () => {
    if (!requireAuth('create financial records')) return;
    
    if (!formData.operationsPrograms?.trim()) {
      toast.error('Program name is required');
      return;
    }

    const newRecord: FinancialRecord = {
      id: `${activeSubcategory}-${Date.now()}`,
      operationsPrograms: formData.operationsPrograms || '',
      allotment: formData.allotment || 0,
      target: formData.target || 0,
      obligation: formData.obligation || 0,
      utilizationPerTarget: formData.utilizationPerTarget || 0,
      utilizationPerApprovedBudget: formData.utilizationPerApprovedBudget || 0,
      disbursement: formData.disbursement || 0,
      disbursementRate: formData.disbursementRate || 0,
      category: activeSubcategory,
      subcategory: activeSubcategory,
      status: (formData.status as any) || 'active',
      createdBy: userRole,
      updatedBy: userRole,
      createdAt: new Date(),
      updatedAt: new Date(),
      remarks: formData.remarks || '',
      quarter: 'Q1',
      year: selectedYear,
      budgetSource: formData.budgetSource || 'Regular Agency Funds',
      department: formData.department || 'General',
      projectCode: undefined,
      variance: (formData.obligation || 0) - (formData.target || 0),
      performanceIndicator: (formData.utilizationPerTarget || 0) >= 80 ? 'Excellent' : 
                           (formData.utilizationPerTarget || 0) >= 60 ? 'Good' : 'Needs Improvement'
    };

    setAllFinancialData(prev => ({
      ...prev,
      [activeSubcategory]: [...(prev[activeSubcategory] || []), newRecord]
    }));

    setIsCreateDialogOpen(false);
    setFormData({});
    toast.success('Financial record created successfully');
  };

  const handleEdit = () => {
    if (!requireAuth('edit financial records') || !selectedRecord) return;

    const updatedRecord: FinancialRecord = {
      ...selectedRecord,
      operationsPrograms: formData.operationsPrograms || selectedRecord.operationsPrograms,
      allotment: formData.allotment !== undefined ? formData.allotment : selectedRecord.allotment,
      target: formData.target !== undefined ? formData.target : selectedRecord.target,
      obligation: formData.obligation !== undefined ? formData.obligation : selectedRecord.obligation,
      disbursement: formData.disbursement !== undefined ? formData.disbursement : selectedRecord.disbursement,
      utilizationPerTarget: formData.utilizationPerTarget !== undefined ? formData.utilizationPerTarget : selectedRecord.utilizationPerTarget,
      utilizationPerApprovedBudget: formData.utilizationPerApprovedBudget !== undefined ? formData.utilizationPerApprovedBudget : selectedRecord.utilizationPerApprovedBudget,
      disbursementRate: formData.disbursementRate !== undefined ? formData.disbursementRate : selectedRecord.disbursementRate,
      status: (formData.status as any) || selectedRecord.status,
      remarks: formData.remarks !== undefined ? formData.remarks : selectedRecord.remarks,
      budgetSource: formData.budgetSource || selectedRecord.budgetSource,
      department: formData.department || selectedRecord.department,
      updatedBy: userRole,
      updatedAt: new Date(),
      variance: (formData.obligation !== undefined ? formData.obligation : selectedRecord.obligation) - 
                (formData.target !== undefined ? formData.target : selectedRecord.target),
      performanceIndicator: (formData.utilizationPerTarget !== undefined ? formData.utilizationPerTarget : selectedRecord.utilizationPerTarget) >= 80 ? 'Excellent' : 
                           (formData.utilizationPerTarget !== undefined ? formData.utilizationPerTarget : selectedRecord.utilizationPerTarget) >= 60 ? 'Good' : 'Needs Improvement'
    };

    setAllFinancialData(prev => ({
      ...prev,
      [activeSubcategory]: prev[activeSubcategory]?.map(record => 
        record.id === selectedRecord.id ? updatedRecord : record
      ) || []
    }));

    setIsEditDialogOpen(false);
    setSelectedRecord(null);
    setFormData({});
    toast.success('Financial record updated successfully');
  };

  // CRUD Dialogs (simplified for space)
  const renderCRUDDialogs = () => (
    <>
      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Financial Record</DialogTitle>
            <DialogDescription>
              Add a new financial record with details
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Program/Operations Name</Label>
              <Input
                value={formData.operationsPrograms || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, operationsPrograms: e.target.value }))}
                placeholder="Enter program name"
              />
            </div>

            <div>
              <Label>Allotment</Label>
              <Input
                type="number"
                value={formData.allotment || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, allotment: parseFloat(e.target.value) || 0 }))}
              />
            </div>

            <div>
              <Label>Target</Label>
              <Input
                type="number"
                value={formData.target || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, target: parseFloat(e.target.value) || 0 }))}
              />
            </div>

            <div>
              <Label>Obligation</Label>
              <Input
                type="number"
                value={formData.obligation || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, obligation: parseFloat(e.target.value) || 0 }))}
              />
            </div>

            <div>
              <Label>Disbursement</Label>
              <Input
                type="number"
                value={formData.disbursement || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, disbursement: parseFloat(e.target.value) || 0 }))}
              />
            </div>

            <div>
              <Label>% Utilization per Target</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.utilizationPerTarget || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, utilizationPerTarget: parseFloat(e.target.value) || 0 }))}
              />
            </div>

            <div>
              <Label>% Utilization per Budget</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.utilizationPerApprovedBudget || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, utilizationPerApprovedBudget: parseFloat(e.target.value) || 0 }))}
              />
            </div>

            <div>
              <Label>Disbursement Rate (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.disbursementRate || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, disbursementRate: parseFloat(e.target.value) || 0 }))}
              />
            </div>

            <div>
              <Label>Budget Source</Label>
              <Select value={formData.budgetSource || ''} onValueChange={(value) => setFormData(prev => ({ ...prev, budgetSource: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Regular Agency Funds">Regular Agency Funds</SelectItem>
                  <SelectItem value="Internally Generated Funds">Internally Generated Funds</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label>Remarks</Label>
              <Textarea
                value={formData.remarks || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                placeholder="Optional remarks"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>
              Create Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Financial Record</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Program/Operations Name</Label>
              <Input
                value={formData.operationsPrograms || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, operationsPrograms: e.target.value }))}
              />
            </div>

            <div>
              <Label>Allotment</Label>
              <Input
                type="number"
                value={formData.allotment || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, allotment: parseFloat(e.target.value) || 0 }))}
              />
            </div>

            <div>
              <Label>Target</Label>
              <Input
                type="number"
                value={formData.target || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, target: parseFloat(e.target.value) || 0 }))}
              />
            </div>

            <div>
              <Label>% Utilization per Target</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.utilizationPerTarget || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, utilizationPerTarget: parseFloat(e.target.value) || 0 }))}
              />
            </div>

            <div>
              <Label>Disbursement Rate (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.disbursementRate || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, disbursementRate: parseFloat(e.target.value) || 0 }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>
              Update Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Financial Record Details</DialogTitle>
          </DialogHeader>
          
          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-slate-600">Program</Label>
                  <p className="font-medium">{selectedRecord.operationsPrograms}</p>
                </div>
                <div>
                  <Label className="text-sm text-slate-600">Department</Label>
                  <p className="font-medium">{selectedRecord.department}</p>
                </div>
                <div>
                  <Label className="text-sm text-slate-600">Allotment</Label>
                  <p className="font-medium">{formatCurrency(selectedRecord.allotment)}</p>
                </div>
                <div>
                  <Label className="text-sm text-slate-600">Utilization</Label>
                  <p className="font-medium">{formatPercentage(selectedRecord.utilizationPerTarget)}</p>
                </div>
              </div>
              
              {selectedRecord.remarks && (
                <div>
                  <Label className="text-sm text-slate-600">Remarks</Label>
                  <p className="bg-slate-50 p-3 rounded border mt-1">{selectedRecord.remarks}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );

  return (
    <div className="space-y-6">
      {/* Navigation Controls */}
      {renderNavigationControls()}

      {/* Key Metrics Summary */}
      {renderKeyMetrics()}

      {/* Filter Controls */}
      {renderFilterControls()}

      {/* Primary Data Table */}
      {activeSubcategory !== 'overview' && renderDataTable()}

      {/* Collapsible Visualizations */}
      {renderVisualizations()}

      {/* CRUD Dialogs */}
      {renderCRUDDialogs()}
    </div>
  );
}