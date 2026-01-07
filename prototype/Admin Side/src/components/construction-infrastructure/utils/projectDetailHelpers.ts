import { toast } from 'sonner@2.0.3';
import { MEFilter } from '../types/METypes';
import { ProjectItem, GalleryItem, DocumentItem, TeamMember } from '../types/ProjectDetailTypes';
import { formatDate } from './analyticsHelpers';

// Project Item Helpers
export const calculateProjectItemCosts = (formData: Partial<ProjectItem>) => {
  const materialCost = formData.estimatedMaterialCost || 0;
  const laborCost = formData.estimatedLaborCost || 0;
  const projectCost = materialCost + laborCost;
  const unitCost = projectCost / (formData.quantity || 1);
  const duration = formData.startDate && formData.endDate 
    ? Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24))
    : formData.projectDuration || 0;

  return {
    estimatedProjectCost: projectCost,
    unitCost,
    projectDuration: duration
  };
};

export const createProjectItemData = (formData: Partial<ProjectItem>): ProjectItem => {
  const costs = calculateProjectItemCosts(formData);
  
  return {
    id: formData.id!,
    description: formData.description!,
    progress: formData.progress || 0,
    quantity: formData.quantity || 0,
    unit: formData.unit || '',
    estimatedMaterialCost: formData.estimatedMaterialCost || 0,
    estimatedLaborCost: formData.estimatedLaborCost || 0,
    estimatedProjectCost: costs.estimatedProjectCost,
    unitCost: costs.unitCost,
    variance: formData.variance || 0,
    startDate: formData.startDate || '',
    endDate: formData.endDate || '',
    projectDuration: costs.projectDuration,
    status: formData.status || 'Pending',
    category: formData.category || '',
    lastUpdated: new Date().toISOString().split('T')[0]
  };
};

// Gallery Helpers
export const createGalleryItem = (formData: any): GalleryItem => {
  return {
    id: `G${Date.now()}`,
    filename: formData.file.name,
    url: URL.createObjectURL(formData.file),
    title: formData.title,
    description: formData.description,
    uploadDate: new Date().toISOString().split('T')[0],
    uploadedBy: 'Current User',
    category: formData.category,
    meRelevant: true,
    associatedPeriod: `${new Date().getFullYear()}-W${Math.ceil(new Date().getDate() / 7)}`
  };
};

// Document Helpers
export const createDocumentItem = (formData: any): DocumentItem => {
  return {
    id: `D${Date.now()}`,
    filename: formData.file.name,
    fileType: formData.file.name.split('.').pop()?.toUpperCase() || 'FILE',
    fileSize: `${(formData.file.size / 1024).toFixed(1)} KB`,
    url: URL.createObjectURL(formData.file),
    remarks: formData.remarks,
    dateUploaded: new Date().toISOString().split('T')[0],
    uploadedBy: 'Current User',
    documentCategory: 'other',
    relatedPeriod: `${new Date().getFullYear()}-Q${Math.ceil((new Date().getMonth() + 1) / 3)}`
  };
};

// Team Helpers
export const createTeamMember = (formData: any, selectedMember?: TeamMember): TeamMember => {
  return {
    id: selectedMember ? selectedMember.id : `T${Date.now()}`,
    name: formData.name,
    role: formData.role,
    department: formData.department,
    avatar: formData.avatar || undefined,
    assignmentPeriod: `${new Date().getFullYear()}-Q${Math.ceil((new Date().getMonth() + 1) / 3)} - TBD`,
    isActive: true
  };
};

// Filtering Helpers
export const getFilteredProjectItems = (
  projectItems: ProjectItem[], 
  globalMEFilter?: MEFilter
): ProjectItem[] => {
  if (!globalMEFilter) return projectItems;
  
  const { startDate, endDate } = globalMEFilter.dateRange;
  
  return projectItems.filter(item => {
    // Filter based on item dates and M&E entries
    const itemStartDate = new Date(item.startDate);
    const itemEndDate = new Date(item.endDate);
    const filterStart = new Date(startDate);
    const filterEnd = new Date(endDate);
    
    // Check if item overlaps with filter period
    const overlaps = itemStartDate <= filterEnd && itemEndDate >= filterStart;
    
    // Also check M&E log entries
    const hasRelevantMEEntries = item.meLogEntries?.some(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= filterStart && entryDate <= filterEnd;
    });
    
    return overlaps || hasRelevantMEEntries;
  });
};

export const getFilteredGalleryItems = (
  galleryItems: GalleryItem[], 
  globalMEFilter?: MEFilter
): GalleryItem[] => {
  if (!globalMEFilter) return galleryItems;
  
  const { startDate, endDate } = globalMEFilter.dateRange;
  
  return galleryItems.filter(item => {
    const uploadDate = new Date(item.uploadDate);
    const filterStart = new Date(startDate);
    const filterEnd = new Date(endDate);
    
    return uploadDate >= filterStart && uploadDate <= filterEnd;
  });
};

export const getFilteredDocumentItems = (
  documentItems: DocumentItem[], 
  globalMEFilter?: MEFilter
): DocumentItem[] => {
  if (!globalMEFilter) return documentItems;
  
  const { startDate, endDate } = globalMEFilter.dateRange;
  
  return documentItems.filter(item => {
    const uploadDate = new Date(item.dateUploaded);
    const filterStart = new Date(startDate);
    const filterEnd = new Date(endDate);
    
    // Include documents that are in the time range or M&E relevant
    const inTimeRange = uploadDate >= filterStart && uploadDate <= filterEnd;
    const isMERelevant = item.documentCategory === 'report' || item.documentCategory === 'assessment';
    
    return inTimeRange || (isMERelevant && item.relatedPeriod);
  });
};

export const getFilteredTeamMembers = (
  teamMembers: TeamMember[], 
  globalMEFilter?: MEFilter
): TeamMember[] => {
  if (!globalMEFilter) return teamMembers;
  
  // For team members, we show active members during the filtered period
  // This is a simplified logic - in practice, you'd have more complex assignment tracking
  return teamMembers.filter(member => member.isActive);
};

// Validation Helpers
export const validateProjectItemForm = (formData: Partial<ProjectItem>): string | null => {
  if (!formData.id || !formData.description) {
    return 'Please fill in required fields';
  }
  return null;
};

export const validateGalleryForm = (formData: any): string | null => {
  if (!formData.file || !formData.title) {
    return 'Please select a file and add a title';
  }
  return null;
};

export const validateDocumentForm = (formData: any): string | null => {
  if (!formData.file || !formData.remarks) {
    return 'Please select a file and add remarks';
  }
  return null;
};

export const validateTeamForm = (formData: any): string | null => {
  if (!formData.name || !formData.role || !formData.department) {
    return 'Please fill in all required fields';
  }
  return null;
};

// Permission Helpers
export const checkPermissions = (userRole: string, action: 'edit' | 'add' | 'delete'): boolean => {
  switch (action) {
    case 'edit':
      return userRole === 'Admin';
    case 'add':
      return userRole === 'Admin' || userRole === 'Staff';
    case 'delete':
      return userRole === 'Admin';
    default:
      return false;
  }
};

// Form Reset Helpers
export const getDefaultFormData = () => ({
  projectItem: {},
  financial: {},
  gallery: { 
    file: null, 
    title: '', 
    description: '', 
    category: 'progress' as const 
  },
  document: { 
    file: null, 
    remarks: '' 
  },
  team: { 
    name: '', 
    role: '', 
    department: '', 
    avatar: '' 
  }
});

// Success/Error Message Helpers
export const showSuccessMessage = (action: string, itemType: string) => {
  toast.success(`${itemType} ${action} successfully`);
};

export const showErrorMessage = (message: string) => {
  toast.error(message);
};

export const showPermissionError = (action: string) => {
  toast.error(`Insufficient permissions to ${action}`);
};

// M&E Filter Impact Helpers
export const getFilterImpactMessage = (
  filtered: number, 
  total: number, 
  filter: MEFilter
): string | null => {
  if (filtered === total) return null;
  
  return `Showing ${filtered} of ${total} items based on ${filter.period} filter (${formatDate(filter.dateRange.startDate)} - ${formatDate(filter.dateRange.endDate)})`;
};