export interface ClassroomData {
  id: string;
  buildingName: string;
  roomNumber: string;
  capacity: number;
  type: 'Lecture Hall' | 'Laboratory' | 'Seminar Room' | 'Computer Lab';
  condition: 'Excellent' | 'Good' | 'Fair' | 'Needs Attention';
  lastAssessment: string;
  utilization: number;
  features: string[];
}

export interface AdministrativeOfficeData {
  id: string;
  department: string;
  location: string;
  staffCount: number;
  officeType: 'Academic' | 'Financial' | 'HR' | 'Executive' | 'Support';
  condition: 'Excellent' | 'Good' | 'Fair' | 'Needs Attention';
  lastAssessment: string;
  efficiency: number;
  services: string[];
}

export interface AssessmentCriteria {
  category: string;
  weight: number;
  criteria: string[];
  description: string;
}

// Sample classroom data
export const sampleClassroomData: ClassroomData[] = [
  {
    id: 'ENG-101',
    buildingName: 'Engineering Building',
    roomNumber: '101',
    capacity: 45,
    type: 'Lecture Hall',
    condition: 'Excellent',
    lastAssessment: '2024-12-01',
    utilization: 89,
    features: ['Projector', 'Air Conditioning', 'Smart Board', 'WiFi']
  },
  {
    id: 'ENG-LAB-01',
    buildingName: 'Engineering Building',
    roomNumber: 'Lab 01',
    capacity: 30,
    type: 'Laboratory',
    condition: 'Good',
    lastAssessment: '2024-11-28',
    utilization: 76,
    features: ['Lab Equipment', 'Safety Systems', 'Ventilation', 'Power Outlets']
  },
  {
    id: 'EDU-201',
    buildingName: 'Education Building',
    roomNumber: '201',
    capacity: 40,
    type: 'Seminar Room',
    condition: 'Excellent',
    lastAssessment: '2024-12-05',
    utilization: 82,
    features: ['Interactive Whiteboard', 'Group Tables', 'Sound System', 'Natural Lighting']
  },
  {
    id: 'BUS-COMP-01',
    buildingName: 'Business Building',
    roomNumber: 'Computer Lab 01',
    capacity: 35,
    type: 'Computer Lab',
    condition: 'Good',
    lastAssessment: '2024-11-30',
    utilization: 94,
    features: ['35 Computers', 'High-Speed Internet', 'Projector', 'UPS Systems']
  }
];

// Sample administrative office data
export const sampleAdministrativeOfficeData: AdministrativeOfficeData[] = [
  {
    id: 'REG-001',
    department: 'Registrar Office',
    location: 'Administration Building - Ground Floor',
    staffCount: 12,
    officeType: 'Academic',
    condition: 'Excellent',
    lastAssessment: '2024-12-10',
    efficiency: 95,
    services: ['Student Records', 'Enrollment', 'Transcripts', 'Certifications']
  },
  {
    id: 'FIN-001',
    department: 'Finance Office',
    location: 'Administration Building - 2nd Floor',
    staffCount: 18,
    officeType: 'Financial',
    condition: 'Good',
    lastAssessment: '2024-12-08',
    efficiency: 87,
    services: ['Budget Management', 'Payroll', 'Financial Reports', 'Procurement']
  },
  {
    id: 'HR-001',
    department: 'Human Resources',
    location: 'Administration Building - 3rd Floor',
    staffCount: 14,
    officeType: 'HR',
    condition: 'Excellent',
    lastAssessment: '2024-12-12',
    efficiency: 93,
    services: ['Employee Records', 'Benefits', 'Training', 'Recruitment']
  },
  {
    id: 'SA-001',
    department: 'Student Affairs',
    location: 'Student Center - Ground Floor',
    staffCount: 16,
    officeType: 'Academic',
    condition: 'Good',
    lastAssessment: '2024-12-06',
    efficiency: 81,
    services: ['Student Services', 'Counseling', 'Activities', 'Discipline']
  }
];

// Assessment criteria configuration
export const assessmentCriteriaData: AssessmentCriteria[] = [
  {
    category: 'Physical Condition',
    weight: 25,
    description: 'Structural integrity, cleanliness, and maintenance standards',
    criteria: [
      'Building structure and safety compliance',
      'Cleanliness and hygiene standards', 
      'Maintenance and repair status',
      'Accessibility features and compliance'
    ]
  },
  {
    category: 'Learning Environment',
    weight: 30,
    description: 'Factors that contribute to effective teaching and learning',
    criteria: [
      'Lighting and ventilation adequacy',
      'Noise levels and acoustics',
      'Temperature control and comfort',
      'Furniture arrangement and ergonomics'
    ]
  },
  {
    category: 'Technology Integration',
    weight: 25,
    description: 'Digital infrastructure and technological capabilities',
    criteria: [
      'Audio-visual equipment availability',
      'Internet connectivity and speed',
      'Computer and device compatibility',
      'Technical support accessibility'
    ]
  },
  {
    category: 'Resource Availability',
    weight: 20,
    description: 'Essential resources and materials for effective operations',
    criteria: [
      'Educational materials and supplies',
      'Storage and organization systems',
      'Office equipment and tools',
      'Emergency preparedness resources'
    ]
  }
];

// Statistics and overview data
export const overviewStatistics = {
  totalSpaces: 192,
  classrooms: 145,
  adminOffices: 47,
  assessmentCompletion: 94.3,
  overallRating: 4.2,
  lastAssessment: 'December 2024',
  utilizationRate: 89.5,
  excellentCondition: 102,
  goodCondition: 64,
  fairCondition: 21,
  needsAttention: 5
};

// Campus breakdown data
export const campusBreakdownData = [
  {
    name: 'Main Campus - Ampayon',
    classrooms: 98,
    adminOffices: 32,
    totalCapacity: 4680,
    utilization: 89.2,
    condition: 'Excellent',
    recentUpgrades: 12
  },
  {
    name: 'Cabadbaran Campus',
    classrooms: 47,
    adminOffices: 15,
    totalCapacity: 2240,
    utilization: 76.8,
    condition: 'Good',
    recentUpgrades: 8
  }
];