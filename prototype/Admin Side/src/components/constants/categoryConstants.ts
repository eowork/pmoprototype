export const CATEGORY_NAMES: Record<string, string> = {
  'construction': 'Construction Projects',
  'repairs': 'Repair Projects',
  'research': 'Research Projects',
  'extension': 'Extension Programs',
  'policies': 'Institutional Policies',
  'forms': 'Downloadable Forms',
  'gad': 'Gender & Development'
};

export const STATUS_COLORS = {
  'Planning': 'bg-blue-100 text-blue-800',
  'Ongoing': 'bg-orange-100 text-orange-800',
  'Completed': 'bg-green-100 text-green-800',
  'On Hold': 'bg-yellow-100 text-yellow-800',
  'Cancelled': 'bg-red-100 text-red-800'
};

export const CHART_COLORS = {
  'Planning': '#3b82f6',
  'Ongoing': '#f59e0b',
  'Completed': '#10b981',
  'On Hold': '#eab308',
  'Cancelled': '#ef4444'
};

export const SORT_OPTIONS = [
  { value: 'projectName', label: 'Name' },
  { value: 'totalContractAmount', label: 'Budget' },
  { value: 'physicalAccomplishment', label: 'Progress' },
  { value: 'startDate', label: 'Date' }
];

export const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'Planning', label: 'Planning' },
  { value: 'Ongoing', label: 'Ongoing' },
  { value: 'Completed', label: 'Completed' },
  { value: 'On Hold', label: 'On Hold' },
  { value: 'Cancelled', label: 'Cancelled' }
];

export const POW_STATUS_OPTIONS = [
  { value: 'Pending', label: 'Pending' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Rejected', label: 'Rejected' }
];