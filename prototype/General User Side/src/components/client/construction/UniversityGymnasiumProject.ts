// University Gymnasium and Cultural Center - Comprehensive Project Data
// This file contains all project information for the University Gymnasium and Cultural Center

import gymWeek1 from 'figma:asset/c59bcdf2557be77ed81807e58c75066d4c0464c5.png';
import gymWeek3 from 'figma:asset/b1091e1636a70ccb5bbf78e73cf42f7cee56e002.png';
import gymWeek10 from 'figma:asset/d249dcd24a438a15d7467b8f7b91ec50226dcc0d.png';

export const UNIVERSITY_GYMNASIUM_PROJECT = {
  id: 'proj-gymnasium-001',
  title: 'University Gymnasium and Cultural Center',
  description: 'Multi-purpose gymnasium and cultural performance venue serving the university community with state-of-the-art facilities for sports, cultural events, and community gatherings.',
  category: 'gaa-funded' as const,
  status: 'Ongoing' as const,
  progress: 68.8, // Average of phase accomplishments: (100 + 98.1 + 8.3) / 3 = 68.8%
  budget: '₱178,112,318.02',
  budgetAmount: 178112318.02,
  contractor: 'Giovanni Construction / BN Builders and Supplies, INC',
  location: 'Athletics Complex, Central Campus',
  startDate: '2023-06-01',
  targetEndDate: '2025-12-31',
  beneficiaries: 5000,
  
  overview: {
    summary: 'The University Gymnasium and Cultural Center is a landmark infrastructure project designed to provide world-class facilities for sports, cultural performances, and community events. This multi-purpose venue will serve as the centerpiece of student life, hosting athletic competitions, cultural festivals, graduations, and other significant university events. The project integrates modern architectural design with functional excellence to create an inspiring space for the CSU community.',
    objectives: [
      'Provide a modern, multi-purpose venue for sports competitions, cultural events, and ceremonies',
      'Accommodate 3,000+ spectators with comfortable seating and excellent sightlines',
      'Create flexible performance spaces for cultural shows, concerts, and theatrical productions',
      'Establish a landmark facility that represents CSU excellence and community pride',
      'Support student development through enhanced athletic and cultural programs'
    ],
    scope: 'Construction of a 5,000 square meter multi-purpose gymnasium and cultural center featuring a main competition hall with retractable seating for 3,000 spectators, cultural performance stage with professional lighting and sound systems, auxiliary training rooms, locker facilities, administrative offices, and supporting amenities. The project includes complete MEP systems, accessibility features, and landscaping.',
    keyFeatures: [
      'Main competition hall with NBA-standard basketball court and multi-sport capability',
      'Retractable spectator seating system accommodating 3,000+ attendees',
      'Professional cultural performance stage with advanced lighting and audio systems',
      'High-efficiency HVAC system with zone control for comfort and energy savings',
      'Universal accessibility with ramps, elevators, and designated seating areas',
      'Modern locker rooms and athlete facilities with premium amenities',
      'Administrative offices and meeting rooms for sports programs',
      'Outdoor plaza and landscaped areas for community gatherings'
    ]
  },
  
  // Financial Allocation with variance tracking
  financialAllocation: [
    {
      category: 'Civil Works & Structural',
      target: 95000000,
      actual: 71250000, // 75% of target
      variance: -23750000,
      variancePercentage: -25.00
    },
    {
      category: 'MEP Systems',
      target: 38000000,
      actual: 11400000, // 30% of target
      variance: -26600000,
      variancePercentage: -70.00
    },
    {
      category: 'Specialized Equipment',
      target: 28000000,
      actual: 5600000, // 20% of target
      variance: -22400000,
      variancePercentage: -80.00
    },
    {
      category: 'Architectural Finishes',
      target: 12112318.02,
      actual: 8479023, // 70% of target
      variance: -3633295.02,
      variancePercentage: -30.00
    },
    {
      category: 'Professional Fees & Contingency',
      target: 5000000,
      actual: 3500000, // 70% of target
      variance: -1500000,
      variancePercentage: -30.00
    }
  ],
  
  // Physical Accomplishment by Phase with contractor details
  physicalAccomplishment: [
    {
      phase: 'Phase 1: Foundation & Structural Framework',
      description: 'Site preparation, foundation work, column erection, and structural steel framework installation',
      target: 100,
      actual: 100,
      variance: 0,
      status: 'Completed' as const,
      contractor: 'Giovanni Construction',
      startDate: '2023-06-01',
      endDate: '2024-03-31'
    },
    {
      phase: 'Phase 2: Building Envelope & Roof System',
      description: 'Exterior walls, roofing installation, windows, doors, and weather protection systems',
      target: 100,
      actual: 98.1,
      variance: -1.9,
      status: 'Behind' as const,
      contractor: 'Giovanni Construction',
      startDate: '2024-04-01',
      endDate: '2024-09-30'
    },
    {
      phase: 'Phase 3: MEP, Interiors & Specialized Systems',
      description: 'Mechanical, Electrical, Plumbing systems, interior fit-out, specialized sports equipment, and cultural performance systems',
      target: 45,
      actual: 8.3,
      variance: -36.7,
      status: 'Behind' as const,
      contractor: 'BN Builders and Supplies, INC',
      startDate: '2024-10-01',
      endDate: '2025-12-31'
    }
  ],
  
  // Variance Tracking
  varianceData: {
    cumulativeWeeklyAccomplishment: 8.31,
    variance: -0.91,
    targetWeeklyProgress: 9.22,
    actualWeeklyProgress: 8.31,
    remarks: 'Slight delay in MEP installation due to equipment delivery schedules. Recovery plan in place with additional manpower allocation.'
  },
  
  // Gallery with Weekly Photo Documentation
  gallery: [
    {
      id: 'gym-week-1',
      url: gymWeek1,
      caption: 'Week 1: Site preparation and foundation work - Initial excavation and ground leveling completed',
      category: 'In Progress' as const,
      date: '2023-06-08',
      uploadedDate: '2023-06-08',
      status: 'active' as const,
      week: 1,
      month: 'June',
      year: 2023,
      quarter: 'Q2',
      photographer: 'CSU PMO Documentation Team',
      tags: ['foundation', 'site-preparation', 'phase-1']
    },
    {
      id: 'gym-week-3',
      url: gymWeek3,
      caption: 'Week 3: Foundation reinforcement - Concrete foundation poured, structural columns taking shape',
      category: 'In Progress' as const,
      date: '2023-06-22',
      uploadedDate: '2023-06-22',
      status: 'active' as const,
      week: 3,
      month: 'June',
      year: 2023,
      quarter: 'Q2',
      photographer: 'CSU PMO Documentation Team',
      tags: ['foundation', 'concrete', 'phase-1']
    },
    {
      id: 'gym-week-10',
      url: gymWeek10,
      caption: 'Week 10: Structural framework completion - Main building structure and second floor slab installation in progress',
      category: 'In Progress' as const,
      date: '2023-08-10',
      uploadedDate: '2023-08-10',
      status: 'featured' as const,
      week: 10,
      month: 'August',
      year: 2023,
      quarter: 'Q3',
      photographer: 'CSU PMO Documentation Team',
      tags: ['structural-work', 'progress', 'phase-1']
    },
    {
      id: 'gym-month-4',
      url: gymWeek1,
      caption: 'Month 4: Phase 1 nearing completion - Structural framework 95% complete, ready for roof system',
      category: 'In Progress' as const,
      date: '2023-10-01',
      uploadedDate: '2023-10-01',
      status: 'active' as const,
      week: 17,
      month: 'October',
      year: 2023,
      quarter: 'Q4',
      photographer: 'CSU PMO Documentation Team',
      tags: ['milestone', 'phase-1-completion']
    },
    {
      id: 'gym-phase-2-start',
      url: gymWeek3,
      caption: 'Phase 2 Kickoff: Building envelope work begins - Exterior wall installation and roof framing',
      category: 'In Progress' as const,
      date: '2024-04-15',
      uploadedDate: '2024-04-15',
      status: 'active' as const,
      week: 46,
      month: 'April',
      year: 2024,
      quarter: 'Q2',
      photographer: 'CSU PMO Documentation Team',
      tags: ['phase-2', 'building-envelope']
    },
    {
      id: 'gym-current-progress',
      url: gymWeek10,
      caption: 'Current Progress: Phase 2 at 98.1% - Windows installed, roof system complete, MEP rough-in underway',
      category: 'In Progress' as const,
      date: '2024-10-01',
      uploadedDate: '2024-10-01',
      status: 'featured' as const,
      week: 70,
      month: 'October',
      year: 2024,
      quarter: 'Q4',
      photographer: 'CSU PMO Documentation Team',
      tags: ['current', 'phase-2', 'mep-installation']
    }
  ],
  
  // Documents with categorization
  documents: [
    {
      id: 'gym-doc-001',
      name: 'Project Proposal and Detailed Design',
      type: 'Proposal' as const,
      url: '#',
      uploadedDate: '2023-03-15',
      fileSize: '15.8 MB',
      status: 'active' as const,
      category: 'Planning',
      description: 'Comprehensive project proposal including architectural designs, structural plans, and budget estimates'
    },
    {
      id: 'gym-doc-002',
      name: 'Environmental Compliance Certificate',
      type: 'Certification' as const,
      url: '#',
      uploadedDate: '2023-04-20',
      fileSize: '2.3 MB',
      status: 'active' as const,
      category: 'Permits',
      description: 'Environmental impact assessment clearance from DENR'
    },
    {
      id: 'gym-doc-003',
      name: 'Building Permit and Zoning Clearance',
      type: 'Certification' as const,
      url: '#',
      uploadedDate: '2023-05-10',
      fileSize: '1.8 MB',
      status: 'active' as const,
      category: 'Permits',
      description: 'Official building permit and local zoning clearance documents'
    },
    {
      id: 'gym-doc-004',
      name: 'Phase 1 Progress Report - Q3 2023',
      type: 'Report' as const,
      url: '#',
      uploadedDate: '2023-09-30',
      fileSize: '4.2 MB',
      status: 'active' as const,
      category: 'Progress Reports',
      description: 'Quarterly progress report covering foundation and structural work'
    },
    {
      id: 'gym-doc-005',
      name: 'Phase 1 Completion Certificate',
      type: 'Certification' as const,
      url: '#',
      uploadedDate: '2024-03-31',
      fileSize: '1.5 MB',
      status: 'active' as const,
      category: 'Milestones',
      description: 'Official completion and inspection certificate for Phase 1 work'
    },
    {
      id: 'gym-doc-006',
      name: 'Structural Engineering Plans - Revised',
      type: 'Plan' as const,
      url: '#',
      uploadedDate: '2024-05-15',
      fileSize: '22.4 MB',
      status: 'active' as const,
      category: 'Technical',
      description: 'Updated structural plans incorporating field modifications'
    },
    {
      id: 'gym-doc-007',
      name: 'MEP Systems Design Specifications',
      type: 'Plan' as const,
      url: '#',
      uploadedDate: '2024-06-01',
      fileSize: '18.7 MB',
      status: 'active' as const,
      category: 'Technical',
      description: 'Mechanical, Electrical, and Plumbing systems detailed specifications'
    },
    {
      id: 'gym-doc-008',
      name: 'Phase 2 Progress Report - September 2024',
      type: 'Report' as const,
      url: '#',
      uploadedDate: '2024-09-30',
      fileSize: '5.1 MB',
      status: 'active' as const,
      category: 'Progress Reports',
      description: 'Monthly progress report showing 98.1% Phase 2 completion'
    },
    {
      id: 'gym-doc-009',
      name: 'Current Project Status - October 2024',
      type: 'Report' as const,
      url: '#',
      uploadedDate: '2024-10-06',
      fileSize: '3.8 MB',
      status: 'active' as const,
      category: 'Progress Reports',
      description: 'Latest project status update with variance analysis and recovery plans'
    }
  ],
  
  // Team Members
  team: [
    {
      id: 'gym-team-001',
      name: 'Engr. Roberto M. Santos',
      role: 'Project Manager',
      position: 'Senior Project Manager',
      department: 'Project Management Office',
      email: 'r.santos@carsu.edu.ph',
      phone: '+63 917 123 4567',
      status: 'active' as const,
      type: 'staff' as const,
      responsibility: 'Overall project coordination, budget management, and stakeholder communication'
    },
    {
      id: 'gym-team-002',
      name: 'Arch. Maria Elena Cruz',
      role: 'Lead Architect',
      position: 'Principal Architect',
      department: 'Physical Planning & Development',
      email: 'me.cruz@carsu.edu.ph',
      phone: '+63 918 234 5678',
      status: 'active' as const,
      type: 'staff' as const,
      responsibility: 'Architectural design supervision and quality assurance'
    },
    {
      id: 'gym-team-003',
      name: 'Engr. Giovanni Ramirez',
      role: 'Contractor Representative - Phases 1 & 2',
      position: 'Project Engineer',
      department: 'Construction Management',
      email: 'g.ramirez@giovannicons.com',
      phone: '+63 919 345 6789',
      status: 'active' as const,
      type: 'contractor' as const,
      contractorCompany: 'Giovanni Construction',
      responsibility: 'On-site construction management for foundation, structural, and building envelope work'
    },
    {
      id: 'gym-team-004',
      name: 'Engr. Benjamin Navarro',
      role: 'Contractor Representative - Phase 3',
      position: 'MEP Engineer',
      department: 'MEP Systems',
      email: 'b.navarro@bnbuilders.com',
      phone: '+63 920 456 7890',
      status: 'active' as const,
      type: 'contractor' as const,
      contractorCompany: 'BN Builders and Supplies, INC',
      responsibility: 'MEP systems installation, interior fit-out, and specialized equipment integration'
    },
    {
      id: 'gym-team-005',
      name: 'Engr. Patricia Fernandez',
      role: 'Structural Engineer',
      position: 'Senior Structural Engineer',
      department: 'Engineering Services',
      email: 'p.fernandez@carsu.edu.ph',
      phone: '+63 921 567 8901',
      status: 'active' as const,
      type: 'staff' as const,
      responsibility: 'Structural design verification and construction monitoring'
    },
    {
      id: 'gym-team-006',
      name: 'Mr. Carlos Delgado',
      role: 'Safety Officer',
      position: 'Safety & Health Officer',
      department: 'Safety Management',
      email: 'c.delgado@carsu.edu.ph',
      phone: '+63 922 678 9012',
      status: 'active' as const,
      type: 'staff' as const,
      responsibility: 'Site safety compliance, worker safety training, and accident prevention'
    }
  ],
  
  // Enhanced Timeline with comprehensive entries
  timeline: [
    {
      id: 'gym-timeline-001',
      title: 'Project Kickoff and Site Mobilization',
      description: 'Official project kickoff ceremony with groundbreaking attended by university officials, contractors, and stakeholders. Site mobilization completed with temporary facilities and safety protocols established.',
      date: '2023-06-01',
      status: 'completed' as const,
      type: 'monthly' as const,
      phase: 'Project Initiation',
      contractor: 'Giovanni Construction',
      remarks: 'Successful kickoff with full stakeholder participation. All safety protocols in place.',
      createdBy: 'Roberto M. Santos',
      createdAt: '2023-06-01T09:00:00Z'
    },
    {
      id: 'gym-timeline-002',
      title: 'Week 1 - Site Preparation Complete',
      description: 'Initial site clearing, excavation, and ground leveling completed. Temporary access roads and material storage areas established.',
      date: '2023-06-08',
      status: 'completed' as const,
      type: 'weekly' as const,
      phase: 'Phase 1',
      contractor: 'Giovanni Construction',
      remarks: 'On schedule. Weather conditions favorable.',
      createdBy: 'Giovanni Ramirez',
      createdAt: '2023-06-08T16:00:00Z'
    },
    {
      id: 'gym-timeline-003',
      title: 'Week 3 - Foundation Reinforcement',
      description: 'Foundation reinforcement steel work completed. First concrete pour for foundation slabs executed successfully with quality tests showing excellent results.',
      date: '2023-06-22',
      status: 'completed' as const,
      type: 'weekly' as const,
      phase: 'Phase 1',
      contractor: 'Giovanni Construction',
      remarks: 'Concrete strength tests exceeded specifications. No rework required.',
      createdBy: 'Giovanni Ramirez',
      createdAt: '2023-06-22T17:00:00Z'
    },
    {
      id: 'gym-timeline-004',
      title: 'Month 2 - Structural Columns Erected',
      description: 'All ground floor columns erected and cured. Formwork for first floor slab prepared. Structural inspection passed without issues.',
      date: '2023-08-01',
      status: 'completed' as const,
      type: 'monthly' as const,
      phase: 'Phase 1',
      contractor: 'Giovanni Construction',
      remarks: 'Ahead of schedule by 3 days. Structural integrity confirmed by independent inspector.',
      createdBy: 'Patricia Fernandez',
      createdAt: '2023-08-01T10:00:00Z'
    },
    {
      id: 'gym-timeline-005',
      title: 'Week 10 - Second Floor Framework',
      description: 'Second floor structural framework installation in progress. Steel beams positioned for main competition hall spanning system. MEP rough-in coordination completed.',
      date: '2023-08-10',
      status: 'completed' as const,
      type: 'weekly' as const,
      phase: 'Phase 1',
      contractor: 'Giovanni Construction',
      remarks: 'Complex beam installation executed successfully. No safety incidents.',
      createdBy: 'Giovanni Ramirez',
      createdAt: '2023-08-10T18:00:00Z'
    },
    {
      id: 'gym-timeline-006',
      title: 'Q3 2023 Review - 75% Phase 1 Complete',
      description: 'Quarterly review meeting conducted. Phase 1 at 75% completion. Structural work proceeding as planned. No major issues identified.',
      date: '2023-09-30',
      status: 'completed' as const,
      type: 'quarterly' as const,
      phase: 'Phase 1',
      contractor: 'Giovanni Construction',
      remarks: 'Project on track. Budget utilization at 71% against 75% progress - favorable variance.',
      createdBy: 'Roberto M. Santos',
      createdAt: '2023-09-30T14:00:00Z'
    },
    {
      id: 'gym-timeline-007',
      title: 'Phase 1 Completion Certificate Issued',
      description: 'Phase 1 foundation and structural work officially completed and certified. All structural tests passed. Building inspector approved for Phase 2 commencement.',
      date: '2024-03-31',
      status: 'completed' as const,
      type: 'monthly' as const,
      phase: 'Phase 1',
      contractor: 'Giovanni Construction',
      remarks: 'Phase 1 completed at 100%. Zero punch list items. Excellent quality achieved.',
      createdBy: 'Roberto M. Santos',
      createdAt: '2024-03-31T16:00:00Z'
    },
    {
      id: 'gym-timeline-008',
      title: 'Phase 2 Kickoff - Building Envelope',
      description: 'Phase 2 commenced with building envelope work. Roof system installation beginning. Exterior wall panels fabrication in progress.',
      date: '2024-04-01',
      status: 'completed' as const,
      type: 'monthly' as const,
      phase: 'Phase 2',
      contractor: 'Giovanni Construction',
      remarks: 'Smooth transition from Phase 1. All materials pre-ordered and on-site.',
      createdBy: 'Giovanni Ramirez',
      createdAt: '2024-04-01T09:00:00Z'
    },
    {
      id: 'gym-timeline-009',
      title: 'Mid-Phase 2 Progress Review',
      description: 'Phase 2 at 65% completion. Roof system 90% complete. Window installations ongoing. Minor delays due to custom panel delivery.',
      date: '2024-07-15',
      status: 'completed' as const,
      type: 'monthly' as const,
      phase: 'Phase 2',
      contractor: 'Giovanni Construction',
      remarks: '2-week delay in custom panel delivery. Recovery plan implemented with overtime work.',
      createdBy: 'Roberto M. Santos',
      createdAt: '2024-07-15T11:00:00Z'
    },
    {
      id: 'gym-timeline-010',
      title: 'September 2024 - Phase 2 at 98.1%',
      description: 'Phase 2 nearing completion at 98.1%. All windows installed. Roof waterproofing complete. Final exterior finishing in progress. MEP rough-in coordination completed.',
      date: '2024-09-30',
      status: 'completed' as const,
      type: 'monthly' as const,
      phase: 'Phase 2',
      contractor: 'Giovanni Construction',
      remarks: 'Slight delay (1.9%) due to weather interruptions. Building envelope watertight and ready for MEP.',
      createdBy: 'Giovanni Ramirez',
      createdAt: '2024-09-30T17:00:00Z'
    },
    {
      id: 'gym-timeline-011',
      title: 'Phase 3 Commencement - MEP Installation',
      description: 'Phase 3 commenced with MEP systems installation by BN Builders. HVAC ductwork installation beginning. Electrical conduit rough-in in progress. Plumbing systems coordination completed.',
      date: '2024-10-01',
      status: 'ongoing' as const,
      type: 'monthly' as const,
      phase: 'Phase 3',
      contractor: 'BN Builders and Supplies, INC',
      remarks: 'Phase 3 started on schedule. MEP coordination excellent. Target: 45% by December 2024.',
      createdBy: 'Benjamin Navarro',
      createdAt: '2024-10-01T08:00:00Z'
    },
    {
      id: 'gym-timeline-012',
      title: 'Daily Progress - Week 1 of Phase 3',
      description: 'Day 5 of Phase 3. HVAC main trunk lines installed. Electrical main distribution panels positioned. Plumbing rough-in 15% complete. Interior partition layout marked.',
      date: '2024-10-05',
      status: 'ongoing' as const,
      type: 'daily' as const,
      phase: 'Phase 3',
      contractor: 'BN Builders and Supplies, INC',
      remarks: 'Work proceeding as planned. Current progress: 8.3%. On track for weekly target of 9.22%.',
      createdBy: 'Benjamin Navarro',
      createdAt: '2024-10-05T18:00:00Z'
    },
    {
      id: 'gym-timeline-013',
      title: 'Current Status - Phase 3 Progress Update',
      description: 'Weekly progress review. Phase 3 at 8.3% against target of 9.22%. Cumulative weekly accomplishment: 8.31%. Variance: -0.91%. Equipment delivery schedules being expedited.',
      date: '2024-10-06',
      status: 'ongoing' as const,
      type: 'weekly' as const,
      phase: 'Phase 3',
      contractor: 'BN Builders and Supplies, INC',
      remarks: 'Minor delay due to specialized equipment delivery. Recovery plan: additional crew allocation next week.',
      createdBy: 'Roberto M. Santos',
      createdAt: '2024-10-06T10:00:00Z'
    },
    {
      id: 'gym-timeline-014',
      title: 'Upcoming: Mid-Phase 3 Review (Planned)',
      description: 'Scheduled mid-phase review meeting. Target: Phase 3 at 22.5% completion. Review MEP installation quality, interior fit-out progress, and specialized equipment integration status.',
      date: '2024-11-15',
      status: 'planned' as const,
      type: 'monthly' as const,
      phase: 'Phase 3',
      contractor: 'BN Builders and Supplies, INC',
      remarks: 'Scheduled review with all stakeholders. Agenda: progress verification, quality checks, schedule recovery.',
      createdBy: 'Roberto M. Santos',
      createdAt: '2024-10-06T10:30:00Z'
    },
    {
      id: 'gym-timeline-015',
      title: 'Upcoming: Q4 2024 Progress Review (Planned)',
      description: 'Quarterly progress review scheduled. Target: Phase 3 at 35-40% completion. Evaluate overall project status, budget performance, and 2025 completion readiness.',
      date: '2024-12-30',
      status: 'planned' as const,
      type: 'quarterly' as const,
      phase: 'Phase 3',
      contractor: 'BN Builders and Supplies, INC',
      remarks: 'Critical review before year-end. Focus: 2025 completion strategy and resource planning.',
      createdBy: 'Roberto M. Santos',
      createdAt: '2024-10-06T10:35:00Z'
    }
  ],
  
  year: 2024,
  lastUpdated: '2024-10-06T10:00:00Z'
};

// Export type for TypeScript
export type UniversityGymnasiumProjectType = typeof UNIVERSITY_GYMNASIUM_PROJECT;
