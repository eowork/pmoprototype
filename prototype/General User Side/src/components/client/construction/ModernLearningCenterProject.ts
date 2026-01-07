// Modern Learning Center Complex - Project Data
// Project ID: proj-001

export const MODERN_LEARNING_CENTER_PROJECT = {
  id: 'proj-001',
  title: 'Modern Learning Center Complex',
  description: 'State-of-the-art academic building with smart classrooms, modern laboratories, and advanced teaching facilities designed to enhance the learning experience for students and faculty.',
  category: 'gaa-funded' as const,
  status: 'Ongoing' as const,
  progress: 78,
  budget: '₱125,500,000.00',
  budgetAmount: 125500000,
  contractor: 'Premier Construction Solutions Inc. / Advanced Building Systems',
  location: 'Main Campus, Building C Area',
  startDate: '2024-01-15',
  targetEndDate: '2025-06-30',
  beneficiaries: 3500,
  
  overview: {
    summary: 'The Modern Learning Center Complex represents a significant investment in educational infrastructure, featuring cutting-edge technology integration, sustainable design principles, and flexible learning spaces that adapt to modern pedagogical approaches. This facility will serve as a model for future academic building developments.',
    objectives: [
      'Provide modern, technology-enhanced learning environments for students and faculty',
      'Accommodate 3,500+ students with flexible classroom and laboratory spaces',
      'Establish sustainable building practices with energy-efficient systems',
      'Create collaborative learning spaces that foster innovation and research',
      'Support diverse academic programs with specialized laboratory facilities'
    ],
    scope: 'Construction of a 4-story academic building with 45 smart classrooms, 12 specialized laboratories, faculty offices, student collaboration areas, and supporting facilities. Includes advanced HVAC, IT infrastructure, and sustainable design features.',
    keyFeatures: [
      '45 smart classrooms with interactive display systems and wireless presentation technology',
      '12 specialized laboratories for science, engineering, and computer studies',
      'Central atrium with natural lighting and collaborative learning spaces',
      'Energy-efficient HVAC system with individual room climate control',
      'Rooftop solar panel installation for renewable energy generation',
      'Accessibility features including elevators and universal design elements',
      'Faculty collaboration areas and administrative offices',
      'Outdoor learning gardens and sustainable landscaping'
    ]
  },
  
  financialAllocation: [
    {
      category: 'Civil Works & Structural',
      target: 65000000,
      actual: 50700000,
      variance: -14300000,
      variancePercentage: -22.00
    },
    {
      category: 'MEP Systems',
      target: 28000000,
      actual: 21000000,
      variance: -7000000,
      variancePercentage: -25.00
    },
    {
      category: 'Technology Integration',
      target: 18000000,
      actual: 14040000,
      variance: -3960000,
      variancePercentage: -22.00
    },
    {
      category: 'Interior Finishes',
      target: 10000000,
      actual: 7800000,
      variance: -2200000,
      variancePercentage: -22.00
    },
    {
      category: 'Professional Fees & Contingency',
      target: 4500000,
      actual: 3510000,
      variance: -990000,
      variancePercentage: -22.00
    }
  ],
  
  physicalAccomplishment: [
    {
      phase: 'Phase 1: Foundation & Structural Framework',
      description: 'Site preparation, foundation work, and structural framework completion',
      target: 100,
      actual: 100,
      variance: 0,
      status: 'Completed' as const,
      contractor: 'Premier Construction Solutions Inc.',
      startDate: '2024-01-15',
      endDate: '2024-06-30'
    },
    {
      phase: 'Phase 2: Building Envelope & Utilities',
      description: 'Exterior walls, roofing, windows, and basic utility installation',
      target: 100,
      actual: 85,
      variance: -15,
      status: 'Behind' as const,
      contractor: 'Premier Construction Solutions Inc.',
      startDate: '2024-07-01',
      endDate: '2024-11-30'
    },
    {
      phase: 'Phase 3: Interior Systems & Technology',
      description: 'Interior fit-out, technology installation, and final finishes',
      target: 25,
      actual: 12,
      variance: -13,
      status: 'Behind' as const,
      contractor: 'Advanced Building Systems',
      startDate: '2024-12-01',
      endDate: '2025-06-30'
    }
  ],
  
  varianceData: {
    cumulativeWeeklyAccomplishment: 78,
    variance: -2.5,
    targetWeeklyProgress: 80.5,
    actualWeeklyProgress: 78,
    remarks: 'Minor delays in technology installation due to supply chain issues. Recovery plan includes expedited delivery schedules.'
  },
  
  gallery: [
    {
      id: 'mlc-week-1',
      url: 'https://images.unsplash.com/photo-1541976590-713941681591?w=800',
      caption: 'Week 1: Site preparation and excavation completed for the Modern Learning Center',
      category: 'In Progress' as const,
      date: '2024-01-22',
      uploadedDate: '2024-01-22',
      status: 'active' as const
    },
    {
      id: 'mlc-foundation',
      url: 'https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?w=800',
      caption: 'Foundation work showing reinforcement steel installation and concrete pouring',
      category: 'In Progress' as const,
      date: '2024-03-15',
      uploadedDate: '2024-03-15',
      status: 'featured' as const
    },
    {
      id: 'mlc-structure',
      url: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800',
      caption: 'Structural framework completion - 4-story building taking shape',
      category: 'In Progress' as const,
      date: '2024-06-20',
      uploadedDate: '2024-06-20',
      status: 'active' as const
    },
    {
      id: 'mlc-current',
      url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
      caption: 'Current progress: Exterior walls and windows installation at 85% completion',
      category: 'In Progress' as const,
      date: '2024-10-01',
      uploadedDate: '2024-10-01',
      status: 'featured' as const
    }
  ],
  
  documents: [
    {
      id: 'mlc-doc-001',
      name: 'Academic Building Design Proposal',
      type: 'Proposal' as const,
      url: '#',
      uploadedDate: '2023-10-15',
      fileSize: '18.2 MB',
      status: 'active' as const
    },
    {
      id: 'mlc-doc-002',
      name: 'Environmental Impact Assessment',
      type: 'Certification' as const,
      url: '#',
      uploadedDate: '2023-11-20',
      fileSize: '3.1 MB',
      status: 'active' as const
    },
    {
      id: 'mlc-doc-003',
      name: 'Phase 1 Completion Report',
      type: 'Report' as const,
      url: '#',
      uploadedDate: '2024-06-30',
      fileSize: '5.4 MB',
      status: 'active' as const
    },
    {
      id: 'mlc-doc-004',
      name: 'Technology Integration Specifications',
      type: 'Plan' as const,
      url: '#',
      uploadedDate: '2024-08-15',
      fileSize: '12.7 MB',
      status: 'active' as const
    }
  ],
  
  team: [
    {
      id: 'mlc-team-001',
      name: 'Engr. Maria Teresa Gonzales',
      role: 'Project Manager',
      position: 'Senior Project Manager',
      department: 'Project Management Office',
      email: 'm.gonzales@carsu.edu.ph',
      phone: '+63 917 234 5678',
      status: 'active' as const,
      type: 'staff' as const,
      responsibility: 'Overall project coordination and academic facility requirements'
    },
    {
      id: 'mlc-team-002',
      name: 'Arch. Jose Ricardo Lopez',
      role: 'Lead Architect',
      position: 'Principal Architect',
      department: 'Physical Planning & Development',
      email: 'jr.lopez@carsu.edu.ph',
      phone: '+63 918 345 6789',
      status: 'active' as const,
      type: 'staff' as const,
      responsibility: 'Architectural design and space planning for academic functions'
    }
  ],
  
  timeline: [
    {
      id: 'mlc-timeline-001',
      title: 'Project Commencement',
      description: 'Modern Learning Center project officially launched with groundbreaking ceremony',
      date: '2024-01-15',
      status: 'completed' as const,
      type: 'monthly' as const,
      phase: 'Project Initiation',
      contractor: 'Premier Construction Solutions Inc.',
      remarks: 'Successful project launch with full stakeholder support',
      createdBy: 'Maria Teresa Gonzales',
      createdAt: '2024-01-15T09:00:00Z'
    },
    {
      id: 'mlc-timeline-002',
      title: 'Foundation Completion',
      description: 'All foundation work completed including basement areas and utility provisions',
      date: '2024-03-30',
      status: 'completed' as const,
      type: 'monthly' as const,
      phase: 'Phase 1',
      contractor: 'Premier Construction Solutions Inc.',
      remarks: 'Foundation work completed ahead of schedule with excellent quality',
      createdBy: 'Jose Ricardo Lopez',
      createdAt: '2024-03-30T16:00:00Z'
    },
    {
      id: 'mlc-timeline-003',
      title: 'Current Status - Building Envelope',
      description: 'Building envelope work at 85% completion. Technology infrastructure preparation ongoing',
      date: '2024-10-01',
      status: 'ongoing' as const,
      type: 'weekly' as const,
      phase: 'Phase 2',
      contractor: 'Premier Construction Solutions Inc.',
      remarks: 'Minor delays due to custom window delivery. Recovery plan implemented',
      createdBy: 'Maria Teresa Gonzales',
      createdAt: '2024-10-01T14:00:00Z'
    }
  ],
  
  year: 2024,
  lastUpdated: '2024-10-06T14:00:00Z'
};

export type ModernLearningCenterProjectType = typeof MODERN_LEARNING_CENTER_PROJECT;