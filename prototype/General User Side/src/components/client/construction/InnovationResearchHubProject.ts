// Innovation and Research Hub - Project Data
// Project ID: proj-004

export const INNOVATION_RESEARCH_HUB_PROJECT = {
  id: 'proj-004',
  title: 'Innovation and Research Hub',
  description: 'World-class research facility designed to foster innovation, support cutting-edge research programs, and facilitate collaboration between academic departments and industry partners.',
  category: 'special-grants' as const,
  status: 'Ongoing' as const,
  progress: 65,
  budget: '₱185,000,000.00',
  budgetAmount: 185000000,
  contractor: 'Advanced Research Facilities Corp. / ScientificBuild Solutions',
  location: 'Research Complex, Building A - East Campus',
  startDate: '2023-11-01',
  targetEndDate: '2025-08-31',
  beneficiaries: 2800,
  
  overview: {
    summary: 'The Innovation and Research Hub serves as the university\'s flagship research facility, providing state-of-the-art laboratories, collaboration spaces, and specialized equipment to support multidisciplinary research initiatives across science, engineering, and technology fields.',
    objectives: [
      'Establish world-class research laboratories for multidisciplinary studies',
      'Provide advanced equipment and instrumentation for cutting-edge research',
      'Create collaborative spaces for faculty, students, and industry partnerships',
      'Support innovation and technology transfer initiatives',
      'Enhance the university\'s research capacity and international competitiveness'
    ],
    scope: 'Construction of a 5-story research facility with specialized laboratories, clean rooms, equipment areas, collaboration spaces, administrative offices, and supporting infrastructure including advanced HVAC, power systems, and safety features.',
    keyFeatures: [
      '25 specialized research laboratories with modular configurations',
      'Clean room facilities for precision research and manufacturing',
      'High-performance computing center with advanced server infrastructure',
      'Innovation incubators and maker spaces for prototype development',
      'Collaboration areas with video conferencing and presentation technology',
      'Specialized equipment areas with vibration isolation and climate control',
      'Administrative offices and faculty research spaces',
      'Advanced safety systems including emergency response and containment'
    ]
  },
  
  financialAllocation: [
    {
      category: 'Civil Works & Specialized Construction',
      target: 75000000,
      actual: 48750000,
      variance: -26250000,
      variancePercentage: -35.00
    },
    {
      category: 'Advanced MEP & Clean Room Systems',
      target: 45000000,
      actual: 29250000,
      variance: -15750000,
      variancePercentage: -35.00
    },
    {
      category: 'Research Equipment & Instrumentation',
      target: 35000000,
      actual: 22750000,
      variance: -12250000,
      variancePercentage: -35.00
    },
    {
      category: 'IT Infrastructure & Computing',
      target: 20000000,
      actual: 13000000,
      variance: -7000000,
      variancePercentage: -35.00
    },
    {
      category: 'Professional Services & Contingency',
      target: 10000000,
      actual: 6500000,
      variance: -3500000,
      variancePercentage: -35.00
    }
  ],
  
  physicalAccomplishment: [
    {
      phase: 'Phase 1: Foundation & Core Structure',
      description: 'Site preparation, foundation work, and main structural framework',
      target: 100,
      actual: 100,
      variance: 0,
      status: 'Completed' as const,
      contractor: 'Advanced Research Facilities Corp.',
      startDate: '2023-11-01',
      endDate: '2024-05-31'
    },
    {
      phase: 'Phase 2: Building Systems & Clean Rooms',
      description: 'Specialized MEP systems, clean room construction, and advanced infrastructure',
      target: 75,
      actual: 60,
      variance: -15,
      status: 'Behind' as const,
      contractor: 'Advanced Research Facilities Corp.',
      startDate: '2024-06-01',
      endDate: '2024-12-31'
    },
    {
      phase: 'Phase 3: Equipment & Technology Integration',
      description: 'Research equipment installation, IT infrastructure, and operational testing',
      target: 15,
      actual: 5,
      variance: -10,
      status: 'Behind' as const,
      contractor: 'ScientificBuild Solutions',
      startDate: '2025-01-01',
      endDate: '2025-08-31'
    }
  ],
  
  varianceData: {
    cumulativeWeeklyAccomplishment: 65,
    variance: -5.2,
    targetWeeklyProgress: 70.2,
    actualWeeklyProgress: 65,
    remarks: 'Minor delays in specialized equipment delivery and clean room certification. Expedited procurement processes implemented.'
  },
  
  gallery: [
    {
      id: 'irh-groundbreaking',
      url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800',
      caption: 'Groundbreaking ceremony for the Innovation and Research Hub',
      category: 'Documentation' as const,
      date: '2023-11-01',
      uploadedDate: '2023-11-01',
      status: 'active' as const
    },
    {
      id: 'irh-foundation',
      url: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800',
      caption: 'Foundation work completed with specialized vibration isolation systems',
      category: 'In Progress' as const,
      date: '2024-02-15',
      uploadedDate: '2024-02-15',
      status: 'active' as const
    },
    {
      id: 'irh-structure',
      url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
      caption: 'Main structural framework completion with specialized load-bearing systems',
      category: 'In Progress' as const,
      date: '2024-05-20',
      uploadedDate: '2024-05-20',
      status: 'featured' as const
    },
    {
      id: 'irh-cleanroom',
      url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800',
      caption: 'Clean room construction and HVAC installation in progress',
      category: 'In Progress' as const,
      date: '2024-09-15',
      uploadedDate: '2024-09-15',
      status: 'featured' as const
    }
  ],
  
  documents: [
    {
      id: 'irh-doc-001',
      name: 'Research Facility Master Plan',
      type: 'Plan' as const,
      url: '#',
      uploadedDate: '2023-08-20',
      fileSize: '25.4 MB',
      status: 'active' as const
    },
    {
      id: 'irh-doc-002',
      name: 'Specialized Equipment Specifications',
      type: 'Plan' as const,
      url: '#',
      uploadedDate: '2023-09-15',
      fileSize: '18.7 MB',
      status: 'active' as const
    },
    {
      id: 'irh-doc-003',
      name: 'Clean Room Certification Requirements',
      type: 'Certification' as const,
      url: '#',
      uploadedDate: '2024-01-10',
      fileSize: '6.2 MB',
      status: 'active' as const
    },
    {
      id: 'irh-doc-004',
      name: 'Phase 1 Completion Report',
      type: 'Report' as const,
      url: '#',
      uploadedDate: '2024-05-31',
      fileSize: '8.9 MB',
      status: 'active' as const
    },
    {
      id: 'irh-doc-005',
      name: 'Current Progress Assessment',
      type: 'Report' as const,
      url: '#',
      uploadedDate: '2024-09-30',
      fileSize: '5.7 MB',
      status: 'active' as const
    }
  ],
  
  team: [
    {
      id: 'irh-team-001',
      name: 'Dr. Elena Rodriguez-Kim',
      role: 'Research Director',
      position: 'Vice President for Research',
      department: 'Research & Development Office',
      email: 'e.rodriguez@carsu.edu.ph',
      phone: '+63 917 456 7890',
      status: 'active' as const,
      type: 'staff' as const,
      responsibility: 'Research program integration and facility planning'
    },
    {
      id: 'irh-team-002',
      name: 'Engr. Dr. Michael Chen',
      role: 'Technical Director',
      position: 'Senior Research Engineer',
      department: 'Engineering Research Institute',
      email: 'm.chen@carsu.edu.ph',
      phone: '+63 918 567 8901',
      status: 'active' as const,
      type: 'staff' as const,
      responsibility: 'Technical specifications and equipment integration'
    },
    {
      id: 'irh-team-003',
      name: 'Engr. Sofia Reyes',
      role: 'Construction Manager',
      position: 'Project Engineer',
      department: 'Advanced Research Facilities Corp.',
      email: 's.reyes@arfc.com',
      phone: '+63 919 678 9012',
      status: 'active' as const,
      type: 'contractor' as const,
      contractorCompany: 'Advanced Research Facilities Corp.',
      responsibility: 'Specialized construction management and quality control'
    }
  ],
  
  timeline: [
    {
      id: 'irh-timeline-001',
      title: 'Research Hub Project Commencement',
      description: 'Official launch of the Innovation and Research Hub construction project',
      date: '2023-11-01',
      status: 'completed' as const,
      type: 'monthly' as const,
      phase: 'Project Initiation',
      contractor: 'Advanced Research Facilities Corp.',
      remarks: 'Project launched with strong support from research community',
      createdBy: 'Elena Rodriguez-Kim',
      createdAt: '2023-11-01T09:00:00Z'
    },
    {
      id: 'irh-timeline-002',
      title: 'Foundation Work Completion',
      description: 'Specialized foundation with vibration isolation systems completed',
      date: '2024-02-28',
      status: 'completed' as const,
      type: 'monthly' as const,
      phase: 'Phase 1',
      contractor: 'Advanced Research Facilities Corp.',
      remarks: 'Foundation work exceeded specifications for research equipment requirements',
      createdBy: 'Sofia Reyes',
      createdAt: '2024-02-28T16:00:00Z'
    },
    {
      id: 'irh-timeline-003',
      title: 'Structural Framework Complete',
      description: 'Main building structure completed with specialized load-bearing systems',
      date: '2024-05-31',
      status: 'completed' as const,
      type: 'monthly' as const,
      phase: 'Phase 1',
      contractor: 'Advanced Research Facilities Corp.',
      remarks: 'Phase 1 completed successfully with enhanced structural specifications',
      createdBy: 'Michael Chen',
      createdAt: '2024-05-31T17:00:00Z'
    },
    {
      id: 'irh-timeline-004',
      title: 'Clean Room Construction Progress',
      description: 'Clean room facilities at 60% completion with HVAC systems installation',
      date: '2024-10-01',
      status: 'ongoing' as const,
      type: 'weekly' as const,
      phase: 'Phase 2',
      contractor: 'Advanced Research Facilities Corp.',
      remarks: 'Clean room construction proceeding with specialized certification requirements',
      createdBy: 'Sofia Reyes',
      createdAt: '2024-10-01T14:00:00Z'
    }
  ],
  
  year: 2024,
  lastUpdated: '2024-10-06T15:00:00Z'
};

export type InnovationResearchHubProjectType = typeof INNOVATION_RESEARCH_HUB_PROJECT;