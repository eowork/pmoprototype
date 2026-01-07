// Utility functions for analytics and formatting

export function formatCurrency(amount: number | null | undefined, compact: boolean = false): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₱0.00';
  }
  
  if (compact && amount >= 1000000) {
    return '₱' + (amount / 1000000).toFixed(1) + 'M';
  }
  
  if (compact && amount >= 1000) {
    return '₱' + (amount / 1000).toFixed(1) + 'K';
  }
  
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'Not specified';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  } catch (error) {
    console.warn('Error formatting date:', dateString, error);
    return 'Invalid date';
  }
}

export function formatPercentage(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0.0%';
  }
  
  return `${value.toFixed(1)}%`;
}

export function getStatusColor(status: string | undefined): string {
  if (!status) return 'bg-gray-100 text-gray-800';
  
  switch (status.toLowerCase()) {
    case 'completed':
    case 'done':
    case 'finished':
      return 'bg-green-100 text-green-800';
    case 'in progress':
    case 'ongoing':
    case 'active':
      return 'bg-blue-100 text-blue-800';
    case 'planning':
    case 'planned':
    case 'scheduled':
      return 'bg-yellow-100 text-yellow-800';
    case 'on hold':
    case 'paused':
    case 'suspended':
      return 'bg-orange-100 text-orange-800';
    case 'cancelled':
    case 'terminated':
    case 'stopped':
      return 'bg-red-100 text-red-800';
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'pending':
    case 'reviewing':
      return 'bg-yellow-100 text-yellow-800';
    case 'rejected':
    case 'declined':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function calculateProgress(current: number, target: number): number {
  if (target === 0) return 0;
  const progress = (current / target) * 100;
  return Math.min(Math.max(progress, 0), 100); // Clamp between 0 and 100
}

export function calculateVariance(actual: number, target: number): {
  variance: number;
  type: 'positive' | 'negative' | 'neutral';
  percentage: number;
} {
  if (target === 0) {
    return { variance: 0, type: 'neutral', percentage: 0 };
  }
  
  const variance = actual - target;
  const percentage = (variance / target) * 100;
  
  return {
    variance,
    type: variance > 0 ? 'positive' : variance < 0 ? 'negative' : 'neutral',
    percentage: Math.abs(percentage)
  };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function generateId(prefix: string = ''): string {
  const timestamp = Date.now().toString(36);
  const randomString = Math.random().toString(36).substring(2, 15);
  return `${prefix}${prefix ? '-' : ''}${timestamp}-${randomString}`;
}

export function isDateInRange(date: string, startDate: string, endDate: string): boolean {
  try {
    const targetDate = new Date(date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Set time to start/end of day for accurate comparison
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    
    return targetDate >= start && targetDate <= end;
  } catch (error) {
    console.warn('Error checking date range:', error);
    return false;
  }
}

export function getQuarter(date: string): string {
  try {
    const d = new Date(date);
    const month = d.getMonth();
    const year = d.getFullYear();
    const quarter = Math.floor(month / 3) + 1;
    return `Q${quarter} ${year}`;
  } catch (error) {
    console.warn('Error getting quarter:', error);
    return 'Unknown';
  }
}

export function getMonthYear(date: string): string {
  try {
    const d = new Date(date);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long'
    }).format(d);
  } catch (error) {
    console.warn('Error getting month/year:', error);
    return 'Unknown';
  }
}

export function aggregateByPeriod(
  data: any[], 
  dateField: string, 
  valueField: string, 
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly'
): { period: string; value: number; count: number }[] {
  const aggregated = new Map<string, { value: number; count: number }>();
  
  data.forEach(item => {
    try {
      const date = item[dateField];
      if (!date) return;
      
      let periodKey: string;
      switch (period) {
        case 'daily':
          periodKey = formatDate(date);
          break;
        case 'weekly':
          const d = new Date(date);
          const startOfWeek = new Date(d.setDate(d.getDate() - d.getDay()));
          periodKey = `Week of ${formatDate(startOfWeek.toISOString())}`;
          break;
        case 'monthly':
          periodKey = getMonthYear(date);
          break;
        case 'quarterly':
          periodKey = getQuarter(date);
          break;
        default:
          periodKey = formatDate(date);
      }
      
      const value = Number(item[valueField]) || 0;
      const existing = aggregated.get(periodKey) || { value: 0, count: 0 };
      
      aggregated.set(periodKey, {
        value: existing.value + value,
        count: existing.count + 1
      });
    } catch (error) {
      console.warn('Error aggregating item:', item, error);
    }
  });
  
  return Array.from(aggregated.entries()).map(([period, data]) => ({
    period,
    value: data.value,
    count: data.count
  })).sort((a, b) => a.period.localeCompare(b.period));
}

export function calculateTrendPercentage(current: number, previous: number): {
  percentage: number;
  trend: 'up' | 'down' | 'stable';
} {
  if (previous === 0) {
    return { percentage: 0, trend: 'stable' };
  }
  
  const percentage = ((current - previous) / previous) * 100;
  
  return {
    percentage: Math.abs(percentage),
    trend: percentage > 0.1 ? 'up' : percentage < -0.1 ? 'down' : 'stable'
  };
}

// Additional functions for GAA-FundedProjectsPage
export function prepareAnalyticsData(projects: any[]) {
  // Status distribution for pie chart
  const statusCounts: { [key: string]: number } = {};
  const statusColors: { [key: string]: string } = {
    'Ongoing': '#3b82f6',
    'Completed': '#10b981',
    'Delayed': '#ef4444',
    'Suspended': '#f59e0b',
    'Planning': '#8b5cf6',
    'On Hold': '#f97316'
  };

  projects.forEach(project => {
    const status = project.status || 'Unknown';
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });

  const statusDistribution = Object.entries(statusCounts).map(([name, value]) => ({
    name,
    value,
    color: statusColors[name] || '#6b7280'
  }));

  // Timeline data for area chart
  const timelineData = projects
    .filter(project => project.dateStarted)
    .map(project => ({
      projectId: project.id,
      projectTitle: project.projectTitle,
      startDate: new Date(project.dateStarted).getTime(),
      targetDate: project.targetDateCompletion ? new Date(project.targetDateCompletion).getTime() : new Date().getTime()
    }))
    .sort((a, b) => a.startDate - b.startDate);

  return {
    statusDistribution,
    timelineData
  };
}

export function calculateProjectStats(projects: any[]) {
  const totalProjects = projects.length;
  const ongoingProjects = projects.filter(p => p.status === 'Ongoing' || p.status === 'In Progress').length;
  const completedProjects = projects.filter(p => p.status === 'Completed').length;
  
  const totalBudget = projects.reduce((sum, project) => sum + (project.approvedBudget || 0), 0);
  const totalDisbursed = projects.reduce((sum, project) => sum + (project.disbursement || 0), 0);
  
  const completionRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;

  return {
    totalProjects,
    ongoingProjects,
    completedProjects,
    totalBudget,
    totalDisbursed,
    completionRate
  };
}

export function filterProjects(projects: any[], searchTerm: string, statusFilter: string, fundingFilter: string) {
  return projects.filter(project => {
    // Search filter
    const matchesSearch = !searchTerm || 
      project.projectTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.remarks?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.fundingSource?.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;

    // Funding filter
    const matchesFunding = fundingFilter === 'all' || project.fundingSource === fundingFilter;

    return matchesSearch && matchesStatus && matchesFunding;
  });
}

export function sortProjects(projects: any[], sortBy: string, sortOrder: 'asc' | 'desc') {
  return [...projects].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    // Handle different data types
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    // Handle dates
    if (sortBy.includes('Date') || sortBy.includes('date')) {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    // Handle numbers
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }

    // Handle strings
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
}