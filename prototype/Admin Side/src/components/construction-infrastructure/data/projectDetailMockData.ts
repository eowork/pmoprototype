import { ProjectItem, GalleryItem, DocumentItem, TeamMember } from '../types/ProjectDetailTypes';

export const getMockProjectItems = (): ProjectItem[] => [
  {
    id: 'P001',
    description: 'Site preparation and excavation work including final clearing and soil preparation for the main building foundation',
    progress: 100,
    quantity: 500,
    unit: 'sq.m',
    estimatedMaterialCost: 150000,
    estimatedLaborCost: 200000,
    estimatedProjectCost: 350000,
    unitCost: 700,
    variance: -5.2,
    startDate: '2024-03-01',
    endDate: '2024-03-15',
    projectDuration: 15,
    status: 'Completed',
    category: 'Foundation',
    meLogEntries: [
      { date: '2024-03-01', progress: 10, notes: 'Started site preparation' },
      { date: '2024-03-08', progress: 50, notes: 'Halfway through excavation' },
      { date: '2024-03-15', progress: 100, notes: 'Site preparation completed' }
    ],
    lastUpdated: '2024-03-15'
  },
  {
    id: 'P002',
    description: 'Foundation and concrete work for main building including excavation, reinforcement, and concrete pouring as per specifications',
    progress: 85,
    quantity: 200,
    unit: 'cu.m',
    estimatedMaterialCost: 800000,
    estimatedLaborCost: 400000,
    estimatedProjectCost: 1200000,
    unitCost: 6000,
    variance: -3.8,
    startDate: '2024-03-15',
    endDate: '2024-04-15',
    projectDuration: 30,
    status: 'In Progress',
    category: 'Structure',
    meLogEntries: [
      { date: '2024-03-15', progress: 15, notes: 'Foundation work started' },
      { date: '2024-03-29', progress: 60, notes: 'Concrete pouring in progress' },
      { date: '2024-04-10', progress: 85, notes: 'Nearing completion' }
    ],
    lastUpdated: '2024-04-10'
  },
  {
    id: 'P003',
    description: 'Steel framework installation and structural steel works for the main building superstructure including connections and reinforcement',
    progress: 45,
    quantity: 50,
    unit: 'tons',
    estimatedMaterialCost: 2000000,
    estimatedLaborCost: 800000,
    estimatedProjectCost: 2800000,
    unitCost: 56000,
    variance: -1.2,
    startDate: '2024-04-01',
    endDate: '2024-04-25',
    projectDuration: 25,
    status: 'In Progress',
    category: 'Framework',
    meLogEntries: [
      { date: '2024-04-01', progress: 10, notes: 'Steel framework installation began' },
      { date: '2024-04-15', progress: 45, notes: 'Framework 45% complete' }
    ],
    lastUpdated: '2024-04-15'
  }
];

export const getMockGalleryItems = (): GalleryItem[] => [
  {
    id: 'G001',
    filename: 'site_preparation_01.jpg',
    url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800',
    title: 'Site Preparation Phase',
    description: 'Initial site clearing and preparation work',
    uploadDate: '2024-03-01',
    uploadedBy: 'Elena Vasquez',
    category: 'progress',
    associatedPeriod: '2024-W09',
    meRelevant: true
  },
  {
    id: 'G002',
    filename: 'foundation_work_01.jpg',
    url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800',
    title: 'Foundation Construction',
    description: 'Foundation concrete pouring in progress',
    uploadDate: '2024-03-15',
    uploadedBy: 'Maria Santos',
    category: 'progress',
    associatedPeriod: '2024-W11',
    meRelevant: true
  }
];

export const getMockDocumentItems = (): DocumentItem[] => [
  {
    id: 'D001',
    filename: 'Project_Blueprint_v2.pdf',
    fileType: 'PDF',
    fileSize: '2.3 MB',
    url: '#',
    remarks: 'Official project blueprint and technical specifications',
    dateUploaded: '2024-02-28',
    uploadedBy: 'Elena Vasquez',
    documentCategory: 'other',
    relatedPeriod: '2024-Q1'
  },
  {
    id: 'D002',
    filename: 'Weekly_Progress_Report_W11.pdf',
    fileType: 'PDF',
    fileSize: '486 KB',
    url: '#',
    remarks: 'Weekly progress assessment for week 11',
    dateUploaded: '2024-03-15',
    uploadedBy: 'Site Engineer',
    documentCategory: 'report',
    relatedPeriod: '2024-W11'
  },
  {
    id: 'D003',
    filename: 'Safety_Protocols.docx',
    fileType: 'DOCX',
    fileSize: '156 KB',
    url: '#',
    remarks: 'Safety guidelines and protocols for construction site',
    dateUploaded: '2024-03-01',
    uploadedBy: 'Safety Officer',
    documentCategory: 'form',
    relatedPeriod: '2024-Q1'
  }
];

export const getMockTeamMembers = (): TeamMember[] => [
  {
    id: 'T001',
    name: 'Elena Vasquez',
    role: 'Project Manager',
    department: 'Project Management Unit',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b734?w=150',
    assignmentPeriod: '2024-Q1 - 2024-Q4',
    isActive: true
  },
  {
    id: 'T002',
    name: 'Maria Santos',
    role: 'Site Engineer',
    department: 'Engineering Services',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    assignmentPeriod: '2024-Q1 - 2024-Q3',
    isActive: true
  },
  {
    id: 'T003',
    name: 'Carlos Rodriguez',
    role: 'Safety Officer',
    department: 'Safety & Compliance',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    assignmentPeriod: '2024-Q1 - 2024-Q4',
    isActive: true
  }
];