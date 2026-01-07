import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Separator } from '../ui/separator';
import { Input } from '../ui/input';
import { 
  BarChart3, Target, AlertTriangle, CheckCircle, Calculator,
  Calendar, MapPin, Filter, Plus, Eye, Edit, Trash2,
  CalendarDays, TrendingUp, Building2, FileText, List, Grid, Download, Search, Check
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { GeneralFilter } from './components/GeneralFilter';
import { 
  PrioritizationMatrixDialog, 
  DeleteConfirmationDialog,
  PrioritizationMatrixItem
} from './dialogs/PrioritizationMatrixDialogs';
import { 
  isPrioritizationMatrixAdmin, 
  getStatusBadgeStyle, 
  filterRecordsByPermission 
} from '../../utils/pagePermissions';

interface PrioritizationMatrixPageProps {
  userRole: string;
  requireAuth: (action: string) => boolean;
  onProjectSelect: (project: any) => void;
  filterData?: any;
  onClearFilters: () => void;
  userProfile?: any;
}

// Matrix criteria
const MATRIX_CRITERIA = [
  {
    id: 'safety_compliance',
    name: 'Safety & Compliance',
    description: 'Risk to life, safety hazards or legal compliance issues',
    weight: 25,
    ratingGuide: {
      1: 'No safety risk or compliance issue',
      2: 'Minor safety concern but no compliance issue',
      3: 'Moderate safety concern or potential minor compliance issue',
      4: 'Serious safety risk or clear compliance issue (non-urgent)',
      5: 'Imminent danger or non-compliance with safety laws'
    }
  },
  {
    id: 'functionality_impact',
    name: 'Functionality Impact',
    description: 'Extent the repair affects ability to hold classes or activities',
    weight: 20,
    ratingGuide: {
      1: 'Very minor inconvenience, does not affect teaching',
      2: 'Slight disruption but alternative arrangements possible',
      3: 'Moderate disruption, requires temporary workaround',
      4: 'Severe disruption, class/space partly unusable',
      5: 'Classroom completely unusable'
    }
  },
  {
    id: 'frequency_of_use',
    name: 'Frequency of Use',
    description: 'How often the space is used in a week/semester',
    weight: 15,
    ratingGuide: {
      1: 'Used less than once a month',
      2: 'Used once or twice a month',
      3: 'Used weekly',
      4: 'Used several times a week',
      5: 'Used daily with high occupancy'
    }
  },
  {
    id: 'number_of_beneficiaries',
    name: 'Number of Beneficiaries',
    description: 'Estimated students/faculty affected',
    weight: 15,
    ratingGuide: {
      1: 'Fewer than 30 people affected',
      2: '31-60 people affected',
      3: '61-150 people affected',
      4: '151-300 people affected',
      5: 'More than 300 people affected'
    }
  },
  {
    id: 'cost_efficiency',
    name: 'Cost Efficiency',
    description: 'Relative repair cost vs. benefit',
    weight: 10,
    ratingGuide: {
      1: 'Very high cost, very low benefit',
      2: 'High cost, low benefit',
      3: 'Moderate cost-benefit balance',
      4: 'Low cost, high benefit',
      5: 'Very low cost, very high benefit'
    }
  },
  {
    id: 'strategic_importance',
    name: 'Strategic Importance',
    description: 'Alignment with university mission or accreditation needs',
    weight: 10,
    ratingGuide: {
      1: 'No relevance to mission or accreditation',
      2: 'Minor contribution to goals',
      3: 'Moderate contribution or indirect relevance',
      4: 'Significant contribution to goals or accreditation',
      5: 'Critical for mission success or accreditation compliance'
    }
  },
  {
    id: 'disaster_resilience',
    name: 'Disaster Resilience',
    description: 'Enhances readiness against natural disasters',
    weight: 5,
    ratingGuide: {
      1: 'No impact on resilience',
      2: 'Minimal improvement to resilience',
      3: 'Moderate improvement to resilience',
      4: 'Significant improvement to resilience and structural safety',
      5: 'Strongly improves preparedness and structural safety'
    }
  }
];

// CSU Colleges
const CSU_COLLEGES = [
  { code: 'CED', name: 'College of Education' },
  { code: 'CMNS', name: 'College of Mathematics and Natural Sciences' },
  { code: 'CAA', name: 'College of Agriculture and Aquaculture' },
  { code: 'COFES', name: 'College of Forestry and Environmental Sciences' },
  { code: 'CCIS', name: 'College of Computing and Information Sciences' },
  { code: 'CEGS', name: 'College of Engineering and Geosciences' },
  { code: 'CHASS', name: 'College of Humanities, Arts and Social Sciences' },
  { code: 'SOM', name: 'School of Medicine' }
];

// Initial sample data
const INITIAL_MATRIX_ITEMS: PrioritizationMatrixItem[] = [
  {
    id: 'PM-2024-001',
    title: 'COE Laboratory Equipment Upgrade',
    location: 'Engineering Building, Room 301',
    campus: 'CSU Main Campus',
    college: 'CEGS',
    category: 'Equipment',
    assessmentDate: '2024-01-15',
    assessor: 'Facilities Management Team',
    criteriaScores: {
      safety_compliance: 4,
      functionality_impact: 5,
      frequency_of_use: 5,
      number_of_beneficiaries: 4,
      cost_efficiency: 3,
      strategic_importance: 4,
      disaster_resilience: 2
    },
    weightedScores: {
      safety_compliance: 1.00,
      functionality_impact: 1.00,
      frequency_of_use: 0.75,
      number_of_beneficiaries: 0.60,
      cost_efficiency: 0.30,
      strategic_importance: 0.40,
      disaster_resilience: 0.10
    },
    totalWeightedScore: 4.15,
    priorityLevel: 'High',
    estimatedCost: 2500000,
    estimatedBeneficiaries: 280,
    urgency: 'Within 30 days',
    description: 'Critical laboratory equipment needs immediate replacement due to safety concerns.',
    justification: 'Equipment poses safety risks and completely prevents laboratory classes from functioning.',
    comments: 'Urgent action needed to maintain educational quality and safety standards.',
    status: 'Approved',
    recordStatus: 'Published',
    submittedBy: 'Facilities Management Team',
    dateCreated: '2024-01-15',
    lastModified: '2024-01-16'
  },
  {
    id: 'PM-2024-002',
    title: 'CED Classroom Ventilation System',
    location: 'Education Building, Rooms 201-205',
    campus: 'CSU Cabadbaran Campus',
    college: 'CED',
    category: 'Infrastructure',
    assessmentDate: '2024-01-14',
    assessor: 'Campus Facilities Team',
    criteriaScores: {
      safety_compliance: 3,
      functionality_impact: 4,
      frequency_of_use: 5,
      number_of_beneficiaries: 5,
      cost_efficiency: 2,
      strategic_importance: 3,
      disaster_resilience: 3
    },
    weightedScores: {
      safety_compliance: 0.75,
      functionality_impact: 0.80,
      frequency_of_use: 0.75,
      number_of_beneficiaries: 0.75,
      cost_efficiency: 0.20,
      strategic_importance: 0.30,
      disaster_resilience: 0.15
    },
    totalWeightedScore: 3.70,
    priorityLevel: 'High',
    estimatedCost: 1800000,
    estimatedBeneficiaries: 350,
    urgency: 'Within 60 days',
    description: 'Poor ventilation system affecting air quality and comfort in heavily used classrooms.',
    justification: 'High usage rooms with large number of students affected by poor air circulation.',
    comments: 'Critical for student health and learning environment quality.',
    status: 'Under Review',
    recordStatus: 'Published',
    submittedBy: 'Campus Facilities Team',
    dateCreated: '2024-01-14',
    lastModified: '2024-01-14'
  },
  {
    id: 'PM-2024-003',
    title: 'CAFES Storage Space Expansion',
    location: 'Agriculture Building, Ground Floor',
    campus: 'CSU Main Campus',
    college: 'CAA',
    category: 'Space',
    assessmentDate: '2024-01-13',
    assessor: 'Agricultural Department Head',
    criteriaScores: {
      safety_compliance: 2,
      functionality_impact: 3,
      frequency_of_use: 4,
      number_of_beneficiaries: 3,
      cost_efficiency: 4,
      strategic_importance: 3,
      disaster_resilience: 2
    },
    weightedScores: {
      safety_compliance: 0.50,
      functionality_impact: 0.60,
      frequency_of_use: 0.60,
      number_of_beneficiaries: 0.45,
      cost_efficiency: 0.40,
      strategic_importance: 0.30,
      disaster_resilience: 0.10
    },
    totalWeightedScore: 2.95,
    priorityLevel: 'Medium',
    estimatedCost: 800000,
    estimatedBeneficiaries: 120,
    urgency: 'Within 90 days',
    description: 'Additional storage space needed for agricultural equipment and materials.',
    justification: 'Current storage insufficient but alternative arrangements possible temporarily.',
    comments: 'Can be scheduled for next budget allocation period.',
    status: 'Planning',
    recordStatus: 'Draft',
    submittedBy: 'Agricultural Department Head',
    dateCreated: '2024-01-13',
    lastModified: '2024-01-13'
  }
];

export function PrioritizationMatrixPage({ 
  userRole, 
  requireAuth, 
  onProjectSelect, 
  filterData, 
  onClearFilters,
  userProfile 
}: PrioritizationMatrixPageProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCampus, setSelectedCampus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCollege, setSelectedCollege] = useState('all');
  const [selectedYear, setSelectedYear] = useState('2024');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('priority');
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('list');
  
  // CRUD states
  const [matrixItems, setMatrixItems] = useState<PrioritizationMatrixItem[]>(INITIAL_MATRIX_ITEMS);
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<PrioritizationMatrixItem | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<PrioritizationMatrixItem | null>(null);
  
  // Check if current user is page admin
  const isPageAdmin = isPrioritizationMatrixAdmin(userProfile);

  // Calculate overview statistics
  const overviewStats = {
    totalItems: matrixItems.length,
    assessedItems: matrixItems.filter(item => item.status !== 'Planning').length,
    highPriority: matrixItems.filter(item => item.priorityLevel === 'High').length,
    mediumPriority: matrixItems.filter(item => item.priorityLevel === 'Medium').length,
    lowPriority: matrixItems.filter(item => item.priorityLevel === 'Low').length,
    avgPriorityScore: matrixItems.length > 0 
      ? (matrixItems.reduce((sum, item) => sum + item.totalWeightedScore, 0) / matrixItems.length).toFixed(2)
      : '0.00'
  };

  // CRUD Handlers
  const handleNewItem = () => {
    if (!requireAuth('create prioritization item')) return;
    setEditingItem(null);
    setShowDialog(true);
  };

  const handleEditItem = (item: PrioritizationMatrixItem) => {
    if (!requireAuth('edit prioritization item')) return;
    setEditingItem(item);
    setShowDialog(true);
  };

  const handleDeleteClick = (item: PrioritizationMatrixItem) => {
    if (!requireAuth('delete prioritization item')) return;
    setItemToDelete(item);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      setMatrixItems(prev => prev.filter(item => item.id !== itemToDelete.id));
      toast.success('Prioritization item deleted successfully');
      setItemToDelete(null);
    }
  };

  const handleSaveItem = (itemData: Omit<PrioritizationMatrixItem, 'id' | 'dateCreated' | 'lastModified'>) => {
    if (editingItem) {
      // Update existing record
      // CRITICAL: Only admins can change recordStatus to Published
      // Non-admins editing a draft keeps it as draft, editing published keeps it published
      const updatedStatus = isPageAdmin ? editingItem.recordStatus : 
                           (editingItem.recordStatus === 'Draft' ? 'Draft' : 'Published');
      
      setMatrixItems(prev => prev.map(item => 
        item.id === editingItem.id 
          ? { 
              ...itemData, 
              id: editingItem.id, 
              recordStatus: updatedStatus, // Controlled status update
              submittedBy: editingItem.submittedBy,
              dateCreated: editingItem.dateCreated, 
              lastModified: new Date().toISOString().split('T')[0] 
            } as PrioritizationMatrixItem
          : item
      ));
      toast.success('Prioritization item updated successfully');
    } else {
      // Create new record - ALWAYS as Draft regardless of user type
      const newItem: PrioritizationMatrixItem = {
        ...itemData,
        id: `PM-${new Date().getFullYear()}-${String(matrixItems.length + 1).padStart(3, '0')}`,
        recordStatus: 'Draft', // ALWAYS Draft on creation
        submittedBy: userProfile?.name || itemData.assessor || 'Unknown',
        dateCreated: new Date().toISOString().split('T')[0],
        lastModified: new Date().toISOString().split('T')[0]
      };
      setMatrixItems(prev => [...prev, newItem]);
      toast.success('Prioritization item saved as Draft. Awaiting admin approval.');
    }
  };

  const handleApproveRecord = (itemId: string) => {
    if (!isPageAdmin) {
      toast.error('Only authorized admins can approve records');
      return;
    }
    
    setMatrixItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, recordStatus: 'Published', lastModified: new Date().toISOString().split('T')[0] }
        : item
    ));
    toast.success('Prioritization item approved and published');
  };

  // Apply permission-based filtering first
  const permissionFilteredItems = filterRecordsByPermission(
    matrixItems,
    userProfile,
    isPageAdmin
  );

  // Then apply search and filter criteria
  const filteredItems = permissionFilteredItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.college.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCampus = selectedCampus === 'all' || item.campus === selectedCampus;
    const matchesPriority = selectedPriority === 'all' || item.priorityLevel === selectedPriority;
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesCollege = selectedCollege === 'all' || item.college === selectedCollege;
    
    return matchesSearch && matchesCampus && matchesPriority && matchesCategory && matchesCollege;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
        return (priorityOrder[b.priorityLevel as keyof typeof priorityOrder] || 0) - 
               (priorityOrder[a.priorityLevel as keyof typeof priorityOrder] || 0);
      case 'score':
        return b.totalWeightedScore - a.totalWeightedScore;
      case 'cost':
        return b.estimatedCost - a.estimatedCost;
      case 'beneficiaries':
        return b.estimatedBeneficiaries - a.estimatedBeneficiaries;
      default:
        return 0;
    }
  });

  const handleClearAllFilters = () => {
    setSelectedYear('2024');
    setSelectedCampus('all');
    setSelectedPriority('all');
    setSelectedCategory('all');
    setSelectedCollege('all');
    setSearchTerm('');
    toast.info('All filters cleared');
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'High': 'bg-red-100 text-red-700 border-red-200',
      'Medium': 'bg-amber-100 text-amber-700 border-amber-200',
      'Low': 'bg-green-100 text-green-700 border-green-200'
    };
    return colors[priority as keyof typeof colors] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const getScoreColor = (score: number) => {
    if (score >= 4.0) return 'text-red-600';
    if (score >= 3.0) return 'text-amber-600';
    if (score >= 2.0) return 'text-blue-600';
    return 'text-green-600';
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      'Planning': 'bg-slate-100 text-slate-700',
      'Under Review': 'bg-blue-100 text-blue-700',
      'Approved': 'bg-emerald-100 text-emerald-700',
      'In Progress': 'bg-amber-100 text-amber-700',
      'Completed': 'bg-green-100 text-green-700',
      'On Hold': 'bg-red-100 text-red-700'
    };
    return styles[status as keyof typeof styles] || 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Synced with other assessment pages */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h1 className="text-gray-900">
                  Repair Prioritization Matrix
                </h1>
                <p className="text-slate-600 mt-1">
                  Strategic prioritization system for resource allocation decisions
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Year Filter */}
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-lg border border-amber-200">
                <CalendarDays className="w-5 h-5 text-amber-600" />
                <span className="text-sm text-amber-800">Academic Year:</span>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-[100px] h-9 border-amber-300 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2022">2022</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={handleNewItem} className="bg-amber-600 hover:bg-amber-700">
                <Plus className="w-4 h-4 mr-2" />
                New Assessment
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Main Tabs - With Amber Theme Highlighting */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white border border-slate-200 p-1">
            <TabsTrigger 
              value="overview"
              className="data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700 data-[state=active]:shadow-sm"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="criteria"
              className="data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700 data-[state=active]:shadow-sm"
            >
              Prioritization Matrix
            </TabsTrigger>
            <TabsTrigger 
              value="assessment-rating"
              className="data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700 data-[state=active]:shadow-sm"
            >
              Assessment Rating
            </TabsTrigger>
            <TabsTrigger 
              value="priority-items"
              className="data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700 data-[state=active]:shadow-sm"
            >
              Priority Items
            </TabsTrigger>
          </TabsList>

          {/* General Filter - Applied to Priority Items tab only */}
          {activeTab === 'priority-items' && (
            <GeneralFilter
              selectedYear={selectedYear}
              onYearChange={setSelectedYear}
              selectedCampus={selectedCampus}
              onCampusChange={setSelectedCampus}
              selectedCollege={selectedCollege}
              onCollegeChange={setSelectedCollege}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onClearFilters={handleClearAllFilters}
              colleges={CSU_COLLEGES}
              showCollegeFilter={true}
              defaultOpen={true}
            />
          )}

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics - Clean Minimal Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-slate-200 bg-white shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-red-50 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <p className="text-xs text-gray-600">High Priority</p>
                  </div>
                  <p className="text-2xl text-red-600">{overviewStats.highPriority}</p>
                  <p className="text-xs text-slate-500 mt-1">Immediate action</p>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-amber-50 rounded-lg">
                      <Target className="h-5 w-5 text-amber-600" />
                    </div>
                    <p className="text-xs text-gray-600">Medium Priority</p>
                  </div>
                  <p className="text-2xl text-amber-600">{overviewStats.mediumPriority}</p>
                  <p className="text-xs text-slate-500 mt-1">Planned actions</p>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-xs text-gray-600">Low Priority</p>
                  </div>
                  <p className="text-2xl text-green-600">{overviewStats.lowPriority}</p>
                  <p className="text-xs text-slate-500 mt-1">Future planning</p>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Calculator className="h-5 w-5 text-blue-600" />
                    </div>
                    <p className="text-xs text-gray-600">Avg Score</p>
                  </div>
                  <p className={`text-2xl ${getScoreColor(parseFloat(overviewStats.avgPriorityScore))}`}>
                    {overviewStats.avgPriorityScore}/5
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Weighted average</p>
                </CardContent>
              </Card>
            </div>

            {/* Priority Distribution Analysis */}
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900">Priority Distribution Analysis</CardTitle>
                <CardDescription>Resource allocation guidance based on weighted scoring system</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-red-500 rounded"></div>
                      <div>
                        <p className="text-red-900">High Priority (Score: 3.5-5.0)</p>
                        <p className="text-sm text-red-600">Immediate action required within 30-60 days</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl text-red-600">{overviewStats.highPriority}</p>
                      <p className="text-sm text-red-600">
                        {overviewStats.totalItems > 0 ? Math.round((overviewStats.highPriority / overviewStats.totalItems) * 100) : 0}%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-amber-500 rounded"></div>
                      <div>
                        <p className="text-amber-900">Medium Priority (Score: 2.5-3.4)</p>
                        <p className="text-sm text-amber-600">Action needed within 90-120 days</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl text-amber-600">{overviewStats.mediumPriority}</p>
                      <p className="text-sm text-amber-600">
                        {overviewStats.totalItems > 0 ? Math.round((overviewStats.mediumPriority / overviewStats.totalItems) * 100) : 0}%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <div>
                        <p className="text-green-900">Low Priority (Score: 1.0-2.4)</p>
                        <p className="text-sm text-green-600">Can be scheduled for next budget cycle</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl text-green-600">{overviewStats.lowPriority}</p>
                      <p className="text-sm text-green-600">
                        {overviewStats.totalItems > 0 ? Math.round((overviewStats.lowPriority / overviewStats.totalItems) * 100) : 0}%
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Priority Items */}
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-gray-900">Top Priority Items</CardTitle>
                    <CardDescription>Items requiring immediate attention based on weighted criteria</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab('priority-items')}>
                    <Eye className="w-4 h-4 mr-2" />
                    View All Items
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  {sortedItems.slice(0, 5).map((item, index) => (
                    <div 
                      key={item.id} 
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200"
                      onClick={() => handleEditItem(item)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm text-amber-700">{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="text-gray-900">{item.title}</h4>
                          <p className="text-sm text-slate-600">{item.campus} • {item.location}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-xs text-slate-500">Cost: ₱{(item.estimatedCost / 1000000).toFixed(1)}M</span>
                            <span className="text-xs text-slate-500">Beneficiaries: {item.estimatedBeneficiaries}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className={`text-lg ${getScoreColor(item.totalWeightedScore)}`}>
                            {item.totalWeightedScore.toFixed(2)}/5
                          </p>
                          <p className="text-xs text-slate-500">Priority Score</p>
                        </div>
                        <Badge className={getPriorityColor(item.priorityLevel)}>
                          {item.priorityLevel}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  
                  {sortedItems.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      <FileText className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                      <p>No priority items yet</p>
                      <p className="text-sm mt-1">Create your first assessment to get started</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PRIORITIZATION MATRIX TAB */}
          <TabsContent value="criteria" className="space-y-6">
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900">Assessment Criteria Matrix</CardTitle>
                <CardDescription>
                  Standardized weighted scoring system for systematic evaluation of repair priorities
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {MATRIX_CRITERIA.map((criterion, index) => (
                    <Card key={criterion.id} className="border-slate-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-amber-100 rounded flex items-center justify-center flex-shrink-0">
                              <span className="text-sm text-amber-700">{index + 1}</span>
                            </div>
                            <div>
                              <CardTitle className="text-base text-gray-900">{criterion.name}</CardTitle>
                              <CardDescription className="text-sm mt-1">{criterion.description}</CardDescription>
                            </div>
                          </div>
                          <Badge variant="outline" className="ml-2 flex-shrink-0">Weight: {criterion.weight}%</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                          {Object.entries(criterion.ratingGuide).map(([rating, description]) => (
                            <div key={rating} className="border border-slate-200 rounded p-3 bg-slate-50">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs mb-2 ${
                                parseInt(rating) === 5 ? 'bg-red-500' :
                                parseInt(rating) === 4 ? 'bg-amber-500' :
                                parseInt(rating) === 3 ? 'bg-blue-500' :
                                parseInt(rating) === 2 ? 'bg-green-500' : 'bg-slate-500'
                              }`}>
                                {rating}
                              </div>
                              <p className="text-xs text-slate-700 leading-tight">{description}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <Separator className="my-6" />
                
                <div className="text-center text-sm text-slate-600">
                  Total Weight: <span className="text-gray-900">100%</span> • 
                  Scoring Range: <span className="text-gray-900">1-5 Scale</span> • 
                  Criteria Count: <span className="text-gray-900">{MATRIX_CRITERIA.length}</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ASSESSMENT RATING TAB - Form-based UI like ClassroomAssessmentPage */}
          <TabsContent value="assessment-rating" className="space-y-6">
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900">Assessment Rating Form</CardTitle>
                <CardDescription>
                  Rate repair needs using the 7-criteria weighted scoring system
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-amber-600" />
                  </div>
                  <h3 className="text-lg text-gray-900 mb-2">Start New Assessment Rating</h3>
                  <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
                    Click the button below to begin rating a repair project using the prioritization matrix criteria
                  </p>
                  <Button onClick={handleNewItem} className="bg-amber-600 hover:bg-amber-700">
                    <Plus className="w-4 h-4 mr-2" />
                    New Assessment Rating
                  </Button>
                </div>

                <Separator className="my-8" />

                {/* Recent Ratings */}
                <div>
                  <h3 className="text-base text-gray-900 mb-4">Recent Assessment Ratings</h3>
                  <div className="space-y-3">
                    {sortedItems.slice(0, 3).map((item) => (
                      <div 
                        key={item.id}
                        className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={() => handleEditItem(item)}
                      >
                        <div className="flex-1">
                          <h4 className="text-sm text-gray-900">{item.title}</h4>
                          <p className="text-xs text-slate-600 mt-1">{item.location} • {item.campus}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <Badge variant="outline" className="text-xs">{item.college}</Badge>
                            <Badge variant="outline" className="text-xs">{item.category}</Badge>
                            <span className="text-xs text-slate-500">Rated by: {item.assessor}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-center">
                            <p className={`text-lg ${getScoreColor(item.totalWeightedScore)}`}>
                              {item.totalWeightedScore.toFixed(2)}
                            </p>
                            <p className="text-xs text-slate-500">Score</p>
                          </div>
                          <Badge className={getPriorityColor(item.priorityLevel)}>
                            {item.priorityLevel}
                          </Badge>
                        </div>
                      </div>
                    ))}

                    {sortedItems.length === 0 && (
                      <div className="text-center py-8 text-slate-500 border border-dashed border-slate-300 rounded-lg">
                        <p className="text-sm">No assessment ratings yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PRIORITY ITEMS TAB - Table-based Database View */}
          <TabsContent value="priority-items" className="space-y-6">
            {/* Summary Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-slate-200 bg-white shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-amber-50 rounded-lg">
                      <FileText className="h-4 w-4 text-amber-600" />
                    </div>
                    <p className="text-xs text-gray-600">Total Items</p>
                  </div>
                  <p className="text-2xl text-gray-900">{overviewStats.totalItems}</p>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-red-50 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    </div>
                    <p className="text-xs text-gray-600">High Priority</p>
                  </div>
                  <p className="text-2xl text-red-600">{overviewStats.highPriority}</p>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-amber-50 rounded-lg">
                      <Target className="h-4 w-4 text-amber-600" />
                    </div>
                    <p className="text-xs text-gray-600">Medium Priority</p>
                  </div>
                  <p className="text-2xl text-amber-600">{overviewStats.mediumPriority}</p>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <p className="text-xs text-gray-600">Low Priority</p>
                  </div>
                  <p className="text-2xl text-green-600">{overviewStats.lowPriority}</p>
                </CardContent>
              </Card>
            </div>

            {/* Additional Filters */}
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-600 flex items-center gap-1.5">
                      <Filter className="h-3 w-3" />
                      Priority Level
                    </label>
                    <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-600 flex items-center gap-1.5">
                      <Building2 className="h-3 w-3" />
                      Category
                    </label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                        <SelectItem value="Equipment">Equipment</SelectItem>
                        <SelectItem value="Space">Space/Facility</SelectItem>
                        <SelectItem value="Safety">Safety & Security</SelectItem>
                        <SelectItem value="Technology">Technology</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-600 flex items-center gap-1.5">
                      <TrendingUp className="h-3 w-3" />
                      Sort By
                    </label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="priority">Priority Level</SelectItem>
                        <SelectItem value="score">Priority Score</SelectItem>
                        <SelectItem value="cost">Estimated Cost</SelectItem>
                        <SelectItem value="beneficiaries">Beneficiaries</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Priority Items Table */}
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-gray-900">Priority Items Database</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item Details</TableHead>
                        <TableHead>Campus/College</TableHead>
                        <TableHead>Priority Score</TableHead>
                        <TableHead>Priority Level</TableHead>
                        <TableHead>Cost</TableHead>
                        <TableHead>Beneficiaries</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Record Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <p className="text-gray-900">{item.title}</p>
                              <p className="text-sm text-slate-600">{item.location}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm">{item.campus === 'CSU Main Campus' ? 'Main' : 'CC'}</p>
                              <Badge variant="outline" className="mt-1">{item.college}</Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`${getScoreColor(item.totalWeightedScore)}`}>
                              {item.totalWeightedScore.toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge className={getPriorityColor(item.priorityLevel)}>
                              {item.priorityLevel}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">₱{(item.estimatedCost / 1000000).toFixed(2)}M</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{item.estimatedBeneficiaries}</span>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusBadge(item.status)}>
                              {item.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditItem(item)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {(userRole === 'Admin' || userRole === 'Staff') && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditItem(item)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                              {userRole === 'Admin' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteClick(item)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {sortedItems.length === 0 && (
                    <div className="p-12 text-center">
                      <BarChart3 className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-600">No prioritization items found</p>
                      <p className="text-sm text-slate-500 mt-1">Try adjusting your filters or create a new assessment</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <PrioritizationMatrixDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        editingItem={editingItem}
        onSave={handleSaveItem}
        matrixCriteria={MATRIX_CRITERIA}
      />

      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteConfirm}
        itemTitle={itemToDelete?.title || ''}
      />
    </div>
  );
}
