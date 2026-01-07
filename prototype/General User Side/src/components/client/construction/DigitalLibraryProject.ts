// Digital Library and Learning Hub - Project Data
// Project ID: proj-002

export const DIGITAL_LIBRARY_PROJECT = {
  id: 'proj-002',
  title: 'Digital Library and Learning Hub',
  description: 'Comprehensive library modernization with digital resources, collaborative learning spaces, and advanced information management systems to support research and academic excellence.',
  category: 'gaa-funded' as const,
  status: 'Completed' as const,
  progress: 100,
  budget: '₱95,750,000.00',
  budgetAmount: 95750000,
  contractor: 'Metropolitan Construction Group / TechnoLib Solutions',
  location: 'Main Campus, Library Building Complex',
  startDate: '2023-08-01',
  targetEndDate: '2024-06-30',
  beneficiaries: 4200,
  
  overview: {
    summary: 'The Digital Library and Learning Hub transformation project successfully modernized the university\'s library facilities, creating a 21st-century learning environment that combines traditional library services with cutting-edge digital resources and collaborative learning spaces.',
    objectives: [
      'Modernize library infrastructure with digital resources and smart systems',
      'Create flexible learning and research spaces for students and faculty',
      'Establish comprehensive digital collections and databases',
      'Provide advanced technology for research and collaborative work',
      'Enhance accessibility and user experience through modern design'
    ],
    scope: 'Complete renovation and modernization of the 3-story library building including digital resource centers, collaborative study areas, quiet zones, multimedia rooms, administrative offices, and technology infrastructure.',
    keyFeatures: [
      'Digital resource center with 150+ computer workstations and tablets',
      'Collaborative learning pods with interactive whiteboards and AV systems',
      'Quiet study zones with individual carrels and group study rooms',
      'Multimedia production studio for student and faculty projects',
      'Automated book retrieval system and RFID inventory management',
      'Climate-controlled special collections and archives area',
      'Café and informal learning spaces',
      'Comprehensive WiFi coverage and charging stations throughout'
    ]
  },
  
  financialAllocation: [
    {
      category: 'Renovation & Civil Works',
      target: 45000000,
      actual: 45000000,
      variance: 0,
      variancePercentage: 0
    },
    {
      category: 'Technology Infrastructure',
      target: 25000000,
      actual: 25000000,
      variance: 0,
      variancePercentage: 0
    },
    {
      category: 'Digital Collections & Software',
      target: 15000000,
      actual: 15000000,
      variance: 0,
      variancePercentage: 0
    },
    {
      category: 'Furniture & Equipment',
      target: 7500000,
      actual: 7500000,
      variance: 0,
      variancePercentage: 0
    },
    {
      category: 'Professional Services',
      target: 3250000,
      actual: 3250000,
      variance: 0,
      variancePercentage: 0
    }
  ],
  
  physicalAccomplishment: [
    {
      phase: 'Phase 1: Structural Renovation',
      description: 'Building renovation, HVAC upgrade, and infrastructure preparation',
      target: 100,
      actual: 100,
      variance: 0,
      status: 'Completed' as const,
      contractor: 'Metropolitan Construction Group',
      startDate: '2023-08-01',
      endDate: '2023-12-31'
    },
    {
      phase: 'Phase 2: Technology Installation',
      description: 'IT infrastructure, network systems, and digital equipment installation',
      target: 100,
      actual: 100,
      variance: 0,
      status: 'Completed' as const,
      contractor: 'TechnoLib Solutions',
      startDate: '2024-01-01',
      endDate: '2024-04-30'
    },
    {
      phase: 'Phase 3: Collections & Operations',
      description: 'Digital collections setup, staff training, and operational readiness',
      target: 100,
      actual: 100,
      variance: 0,
      status: 'Completed' as const,
      contractor: 'TechnoLib Solutions',
      startDate: '2024-05-01',
      endDate: '2024-06-30'
    }
  ],
  
  varianceData: {
    cumulativeWeeklyAccomplishment: 100,
    variance: 0,
    targetWeeklyProgress: 100,
    actualWeeklyProgress: 100,
    remarks: 'Project completed successfully on time and within budget. All objectives achieved.'
  },
  
  gallery: [
    {
      id: 'lib-before',
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
      caption: 'Before renovation: Traditional library layout with outdated facilities',
      category: 'Before' as const,
      date: '2023-07-15',
      uploadedDate: '2023-07-15',
      status: 'active' as const
    },
    {
      id: 'lib-renovation',
      url: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=800',
      caption: 'Mid-renovation: Structural improvements and technology infrastructure installation',
      category: 'In Progress' as const,
      date: '2023-11-15',
      uploadedDate: '2023-11-15',
      status: 'active' as const
    },
    {
      id: 'lib-digital-center',
      url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800',
      caption: 'Digital resource center with modern computer workstations and study areas',
      category: 'Completed' as const,
      date: '2024-06-20',
      uploadedDate: '2024-06-20',
      status: 'featured' as const
    },
    {
      id: 'lib-collaborative',
      url: 'https://images.unsplash.com/photo-1555116505-38ab61800975?w=800',
      caption: 'Collaborative learning pods with interactive technology and comfortable seating',
      category: 'Completed' as const,
      date: '2024-06-25',
      uploadedDate: '2024-06-25',
      status: 'featured' as const
    }
  ],
  
  documents: [
    {
      id: 'lib-doc-001',
      name: 'Digital Library Master Plan',
      type: 'Plan' as const,
      url: '#',
      uploadedDate: '2023-06-15',
      fileSize: '14.3 MB',
      status: 'active' as const
    },
    {
      id: 'lib-doc-002',
      name: 'Technology Infrastructure Specifications',
      type: 'Plan' as const,
      url: '#',
      uploadedDate: '2023-07-20',
      fileSize: '9.8 MB',
      status: 'active' as const
    },
    {
      id: 'lib-doc-003',
      name: 'Project Completion Report',
      type: 'Report' as const,
      url: '#',
      uploadedDate: '2024-06-30',
      fileSize: '7.2 MB',
      status: 'active' as const
    },
    {
      id: 'lib-doc-004',
      name: 'Digital Collections Acquisition Report',
      type: 'Report' as const,
      url: '#',
      uploadedDate: '2024-07-15',
      fileSize: '4.6 MB',
      status: 'active' as const
    }
  ],
  
  team: [
    {
      id: 'lib-team-001',
      name: 'Dr. Carmen Santos-Rivera',
      role: 'Project Director',
      position: 'University Librarian',
      department: 'Library Services',
      email: 'c.santos@carsu.edu.ph',
      phone: '+63 917 345 6789',
      status: 'active' as const,
      type: 'staff' as const,
      responsibility: 'Overall project direction and library operations integration'
    },
    {
      id: 'lib-team-002',
      name: 'Engr. Rafael Mendoza',
      role: 'Construction Manager',
      position: 'Senior Engineer',
      department: 'Physical Plant',
      email: 'r.mendoza@carsu.edu.ph',
      phone: '+63 918 456 7890',
      status: 'active' as const,
      type: 'staff' as const,
      responsibility: 'Renovation coordination and infrastructure management'
    }
  ],
  
  timeline: [
    {
      id: 'lib-timeline-001',
      title: 'Digital Library Project Launch',
      description: 'Official project commencement with library closure for renovation',
      date: '2023-08-01',
      status: 'completed' as const,
      type: 'monthly' as const,
      phase: 'Project Initiation',
      contractor: 'Metropolitan Construction Group',
      remarks: 'Temporary library services established in alternate location',
      createdBy: 'Carmen Santos-Rivera',
      createdAt: '2023-08-01T08:00:00Z'
    },
    {
      id: 'lib-timeline-002',
      title: 'Renovation Phase Completion',
      description: 'Structural renovation and infrastructure upgrades completed successfully',
      date: '2023-12-31',
      status: 'completed' as const,
      type: 'monthly' as const,
      phase: 'Phase 1',
      contractor: 'Metropolitan Construction Group',
      remarks: 'All renovation work completed on schedule with minimal issues',
      createdBy: 'Rafael Mendoza',
      createdAt: '2023-12-31T16:00:00Z'
    },
    {
      id: 'lib-timeline-003',
      title: 'Technology Infrastructure Complete',
      description: 'All technology systems installed and tested successfully',
      date: '2024-04-30',
      status: 'completed' as const,
      type: 'monthly' as const,
      phase: 'Phase 2',
      contractor: 'TechnoLib Solutions',
      remarks: 'Technology installation completed with comprehensive testing',
      createdBy: 'Carmen Santos-Rivera',
      createdAt: '2024-04-30T17:00:00Z'
    },
    {
      id: 'lib-timeline-004',
      title: 'Digital Library Grand Opening',
      description: 'Official reopening of the modernized Digital Library and Learning Hub',
      date: '2024-06-30',
      status: 'completed' as const,
      type: 'monthly' as const,
      phase: 'Project Completion',
      contractor: 'TechnoLib Solutions',
      remarks: 'Successful project completion with grand opening ceremony',
      createdBy: 'Carmen Santos-Rivera',
      createdAt: '2024-06-30T10:00:00Z'
    }
  ],
  
  year: 2024,
  lastUpdated: '2024-06-30T18:00:00Z'
};

export type DigitalLibraryProjectType = typeof DIGITAL_LIBRARY_PROJECT;