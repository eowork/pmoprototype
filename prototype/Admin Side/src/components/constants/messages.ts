// Localization strings for dashboard components
// Keep all user-facing strings here for future internationalization

export const MESSAGES = {
  // Dashboard Headers
  dashboard: {
    title: 'PMO Dashboard',
    subtitle: 'Project Management Office - Monitoring & Evaluation',
    lastUpdated: 'Last updated:',
    dataScope: 'Data Scope',
    encoderMetrics: 'Encoder-level metrics only'
  },

  // Navigation and Actions
  navigation: {
    overview: 'Overview',
    analytics: 'Analytics', 
    performance: 'Performance',
    structure: 'Structure',
    export: 'Export',
    refresh: 'Refresh',
    search: 'Search',
    filter: 'Filter',
    clear: 'Clear',
    viewDetails: 'View Details',
    viewAll: 'View All',
    manage: 'Manage',
    previous: 'Previous',
    next: 'Next'
  },

  // Category Names
  categories: {
    universityOperations: 'University Operations',
    constructionInfrastructure: 'Construction & Infrastructure',
    repairs: 'Repairs & Maintenance',
    governance: 'Governance & Compliance'
  },

  // Status Labels
  status: {
    active: 'Active',
    inactive: 'Inactive',
    pending: 'Pending',
    completed: 'Completed',
    onTrack: 'On Track',
    belowTarget: 'Below Target',
    exceeding: 'Exceeding',
    needsAttention: 'Needs Attention',
    actionRequired: 'Action Required',
    compliant: 'Compliant',
    monitoring: 'Monitoring'
  },

  // Metrics and KPIs
  metrics: {
    totalProjects: 'Total Projects',
    completed: 'Completed',
    accomplishment: 'Accomplishment',
    achievement: 'Achievement',
    progress: 'Progress',
    target: 'Target',
    actual: 'Actual',
    variance: 'Variance',
    trend: 'Trend',
    completionRate: 'Completion Rate',
    timeToEncode: 'Avg. Time to Encode',
    overdueCount: 'Overdue Count',
    updateRate: 'Update Rate',
    dataCompleteness: 'Data Completeness',
    qualityScore: 'Quality Score',
    parityIndex: 'Parity Index'
  },

  // Form Labels
  forms: {
    name: 'Name',
    description: 'Description',
    projects: 'Projects',
    target: 'Target',
    status: 'Status',
    owner: 'Owner',
    period: 'Period',
    value: 'Value',
    formula: 'Formula',
    dataSource: 'Data Source',
    lastUpdated: 'Last Updated',
    save: 'Save',
    cancel: 'Cancel',
    create: 'Create',
    edit: 'Edit',
    delete: 'Delete',
    required: 'Required field'
  },

  // Empty States
  emptyStates: {
    noData: 'No data available',
    noResults: 'No results found',
    noProjects: 'No projects found',
    noPolicies: 'No policies found',
    noReports: 'No reports found',
    tryAdjusting: 'Try adjusting your search terms or filters'
  },

  // Errors and Validation
  errors: {
    loadFailed: 'Failed to load data',
    saveFailed: 'Failed to save changes',
    deleteFailed: 'Failed to delete item',
    validationError: 'Please fix validation errors',
    connectionError: 'Connection error occurred'
  },

  // Success Messages
  success: {
    dataLoaded: 'Data loaded successfully',
    itemSaved: 'Item saved successfully',
    itemDeleted: 'Item deleted successfully',
    exportComplete: 'Export completed successfully'
  },

  // Accessibility
  a11y: {
    expand: 'Expand',
    collapse: 'Collapse',
    sort: 'Sort',
    filter: 'Filter',
    search: 'Search',
    menu: 'Menu',
    close: 'Close',
    open: 'Open'
  },

  // Overview Pages
  overview: {
    academicPrograms: 'Academic Programs',
    projectCategories: 'Project Categories',
    policyCategories: 'Policy Categories',
    campusFacilities: 'Campus Facilities',
    reportCategories: 'Report Categories',
    recentChanges: 'Recent Changes',
    latestChanges: 'Latest Changes',
    methodology: 'Methodology',
    viewMethodology: 'View Methodology'
  }
};

// Helper function to get message
export const getMessage = (path: string): string => {
  const keys = path.split('.');
  let current: any = MESSAGES;
  
  for (const key of keys) {
    if (current[key]) {
      current = current[key];
    } else {
      console.warn(`Message not found for path: ${path}`);
      return path; // Return the path as fallback
    }
  }
  
  return current;
};

// Type definitions for message paths (for better TypeScript support)
export type MessagePath = 
  | 'dashboard.title'
  | 'navigation.overview'
  | 'categories.universityOperations'
  | 'status.active'
  | 'metrics.totalProjects'
  | 'forms.save'
  | 'errors.loadFailed'
  | 'success.dataLoaded';