// Project Data Manager - Centralized project data access
// This file manages all construction infrastructure project data

import { UNIVERSITY_GYMNASIUM_PROJECT } from './UniversityGymnasiumProject';
import { MODERN_LEARNING_CENTER_PROJECT } from './ModernLearningCenterProject';
import { DIGITAL_LIBRARY_PROJECT } from './DigitalLibraryProject';
import { INNOVATION_RESEARCH_HUB_PROJECT } from './InnovationResearchHubProject';

// Project lookup map for easy access
export const PROJECT_DATA_MAP = {
  'proj-001': MODERN_LEARNING_CENTER_PROJECT,
  'proj-002': DIGITAL_LIBRARY_PROJECT,
  'proj-003': {
    // Campus Greenway - Simple completed project
    id: 'proj-003',
    title: 'Campus Greenway and Sustainability Project',
    description: 'Campus beautification with sustainable landscaping and eco-friendly infrastructure.',
    category: 'locally-funded' as const,
    status: 'Completed' as const,
    progress: 100,
    budget: '₱35,200,000.00',
    budgetAmount: 35200000,
    contractor: 'EcoScape Solutions / GreenTech Builders',
    location: 'Campus-wide Implementation',
    startDate: '2024-03-01',
    targetEndDate: '2024-08-31',
    beneficiaries: 8000,
    overview: {
      summary: 'A comprehensive campus beautification and sustainability initiative that enhanced the university environment through landscaping, renewable energy installations, and eco-friendly infrastructure.',
      objectives: [
        'Create beautiful and sustainable campus environments',
        'Install renewable energy systems for reduced carbon footprint',
        'Develop green spaces for student recreation and learning',
        'Implement sustainable water management systems',
        'Establish outdoor learning and gathering spaces'
      ],
      scope: 'Campus-wide landscaping, installation of solar systems, rainwater harvesting, outdoor furniture, walking paths, and recreational areas.',
      keyFeatures: [
        'Native plant landscaping across 15 hectares',
        'Solar lighting systems for pathways and common areas',
        'Rainwater harvesting systems for irrigation',
        'Outdoor study areas with weather-resistant furniture',
        'Jogging and walking trails throughout campus',
        'Sustainable waste management stations'
      ]
    },
    financialAllocation: [
      { category: 'Landscaping & Hardscaping', target: 20000000, actual: 20000000, variance: 0, variancePercentage: 0 },
      { category: 'Solar Systems', target: 8000000, actual: 8000000, variance: 0, variancePercentage: 0 },
      { category: 'Water Management', target: 4200000, actual: 4200000, variance: 0, variancePercentage: 0 },
      { category: 'Furniture & Amenities', target: 2000000, actual: 2000000, variance: 0, variancePercentage: 0 },
      { category: 'Professional Services', target: 1000000, actual: 1000000, variance: 0, variancePercentage: 0 }
    ],
    physicalAccomplishment: [
      {
        phase: 'Phase 1: Site Preparation & Planning',
        description: 'Site analysis, design completion, and preparation work',
        target: 100, actual: 100, variance: 0, status: 'Completed' as const,
        contractor: 'EcoScape Solutions', startDate: '2024-03-01', endDate: '2024-04-15'
      },
      {
        phase: 'Phase 2: Landscaping & Infrastructure',
        description: 'Landscaping installation and infrastructure development',
        target: 100, actual: 100, variance: 0, status: 'Completed' as const,
        contractor: 'EcoScape Solutions', startDate: '2024-04-16', endDate: '2024-07-31'
      },
      {
        phase: 'Phase 3: Systems & Final Installation',
        description: 'Solar systems, furniture installation, and final touches',
        target: 100, actual: 100, variance: 0, status: 'Completed' as const,
        contractor: 'GreenTech Builders', startDate: '2024-08-01', endDate: '2024-08-31'
      }
    ],
    varianceData: {
      cumulativeWeeklyAccomplishment: 100, variance: 0, targetWeeklyProgress: 100, actualWeeklyProgress: 100,
      remarks: 'Project completed successfully on time and within budget with excellent quality.'
    },
    gallery: [
      {
        id: 'greenway-before', url: 'https://images.unsplash.com/photo-1541976590-713941681591?w=800',
        caption: 'Before: Campus areas needing beautification and sustainability improvements',
        category: 'Before' as const, date: '2024-02-15', uploadedDate: '2024-02-15', status: 'active' as const
      },
      {
        id: 'greenway-progress', url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800',
        caption: 'During construction: Landscaping and infrastructure installation',
        category: 'In Progress' as const, date: '2024-06-15', uploadedDate: '2024-06-15', status: 'active' as const
      },
      {
        id: 'greenway-complete', url: 'https://images.unsplash.com/photo-1519985176271-adb1088fa94c?w=800',
        caption: 'Completed: Beautiful green spaces with sustainable features',
        category: 'Completed' as const, date: '2024-08-31', uploadedDate: '2024-08-31', status: 'featured' as const
      }
    ],
    documents: [
      {
        id: 'greenway-doc-001', name: 'Sustainability Master Plan', type: 'Plan' as const, url: '#',
        uploadedDate: '2024-01-15', fileSize: '12.3 MB', status: 'active' as const
      },
      {
        id: 'greenway-doc-002', name: 'Project Completion Report', type: 'Report' as const, url: '#',
        uploadedDate: '2024-08-31', fileSize: '6.8 MB', status: 'active' as const
      }
    ],
    team: [
      {
        id: 'greenway-team-001', name: 'Dr. Green Valdez', role: 'Sustainability Director',
        position: 'Environmental Officer', department: 'Campus Development',
        email: 'g.valdez@carsu.edu.ph', phone: '+63 917 555 0123',
        status: 'active' as const, type: 'staff' as const,
        responsibility: 'Environmental planning and sustainability oversight'
      }
    ],
    timeline: [
      {
        id: 'greenway-timeline-001', title: 'Project Launch',
        description: 'Campus Greenway project officially launched with sustainability goals',
        date: '2024-03-01', status: 'completed' as const, type: 'monthly' as const,
        phase: 'Project Initiation', contractor: 'EcoScape Solutions',
        remarks: 'Strong community support for sustainability initiative',
        createdBy: 'Green Valdez', createdAt: '2024-03-01T08:00:00Z'
      },
      {
        id: 'greenway-timeline-002', title: 'Project Completion',
        description: 'Campus Greenway successfully completed with excellent results',
        date: '2024-08-31', status: 'completed' as const, type: 'monthly' as const,
        phase: 'Project Completion', contractor: 'GreenTech Builders',
        remarks: 'Project exceeded expectations with outstanding environmental impact',
        createdBy: 'Green Valdez', createdAt: '2024-08-31T16:00:00Z'
      }
    ],
    year: 2024, lastUpdated: '2024-08-31T18:00:00Z'
  },
  'proj-004': INNOVATION_RESEARCH_HUB_PROJECT,
  'proj-gymnasium-001': UNIVERSITY_GYMNASIUM_PROJECT,
  'proj-005': {
    // Renewable Energy Campus Initiative - Simple completed project
    id: 'proj-005',
    title: 'Renewable Energy Campus Initiative',
    description: 'Installation of renewable energy infrastructure including solar panels, wind systems, and energy storage solutions.',
    category: 'special-grants' as const,
    status: 'Completed' as const,
    progress: 100,
    budget: '₱45,800,000.00',
    budgetAmount: 45800000,
    contractor: 'SolarMax Philippines / WindPower Solutions',
    location: 'Campus-wide Installation',
    startDate: '2023-06-01',
    targetEndDate: '2024-10-31',
    beneficiaries: 12000,
    overview: {
      summary: 'A comprehensive renewable energy project that established CSU as a leader in sustainable campus operations through solar, wind, and energy storage installations.',
      objectives: [
        'Achieve 60% renewable energy for campus electricity needs',
        'Reduce carbon footprint and environmental impact',
        'Create educational opportunities for renewable energy studies',
        'Establish energy independence and cost savings',
        'Demonstrate sustainable technology leadership'
      ],
      scope: 'Installation of solar panel arrays, wind turbines, battery storage systems, smart grid integration, and monitoring systems.',
      keyFeatures: [
        '2.5 MW solar panel installation on building rooftops and ground mounts',
        '500 kW wind turbine systems in strategic campus locations',
        '1 MW battery storage system for energy management',
        'Smart grid integration with monitoring and control systems',
        'Educational display panels showing real-time energy production',
        'Electric vehicle charging stations powered by renewable energy'
      ]
    },
    financialAllocation: [
      { category: 'Solar Panel Systems', target: 25000000, actual: 25000000, variance: 0, variancePercentage: 0 },
      { category: 'Wind Energy Systems', target: 12000000, actual: 12000000, variance: 0, variancePercentage: 0 },
      { category: 'Energy Storage & Grid', target: 6000000, actual: 6000000, variance: 0, variancePercentage: 0 },
      { category: 'Installation & Integration', target: 2300000, actual: 2300000, variance: 0, variancePercentage: 0 },
      { category: 'Monitoring & Controls', target: 500000, actual: 500000, variance: 0, variancePercentage: 0 }
    ],
    physicalAccomplishment: [
      {
        phase: 'Phase 1: Solar Installation',
        description: 'Solar panel installation and grid connection',
        target: 100, actual: 100, variance: 0, status: 'Completed' as const,
        contractor: 'SolarMax Philippines', startDate: '2023-06-01', endDate: '2024-02-29'
      },
      {
        phase: 'Phase 2: Wind & Storage Systems',
        description: 'Wind turbines and battery storage installation',
        target: 100, actual: 100, variance: 0, status: 'Completed' as const,
        contractor: 'WindPower Solutions', startDate: '2024-03-01', endDate: '2024-08-31'
      },
      {
        phase: 'Phase 3: Integration & Testing',
        description: 'System integration, testing, and commissioning',
        target: 100, actual: 100, variance: 0, status: 'Completed' as const,
        contractor: 'SolarMax Philippines', startDate: '2024-09-01', endDate: '2024-10-31'
      }
    ],
    varianceData: {
      cumulativeWeeklyAccomplishment: 100, variance: 0, targetWeeklyProgress: 100, actualWeeklyProgress: 100,
      remarks: 'Project delivered exceptional results exceeding energy production targets by 15%.'
    },
    gallery: [
      {
        id: 'renewable-solar', url: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800',
        caption: 'Solar panel installation across campus buildings and ground-mounted arrays',
        category: 'Completed' as const, date: '2024-02-28', uploadedDate: '2024-02-28', status: 'featured' as const
      },
      {
        id: 'renewable-wind', url: 'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=800',
        caption: 'Wind turbine installation providing clean energy generation',
        category: 'Completed' as const, date: '2024-08-15', uploadedDate: '2024-08-15', status: 'featured' as const
      },
      {
        id: 'renewable-monitoring', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
        caption: 'Energy monitoring and control center with real-time displays',
        category: 'Completed' as const, date: '2024-10-31', uploadedDate: '2024-10-31', status: 'active' as const
      }
    ],
    documents: [
      {
        id: 'renewable-doc-001', name: 'Renewable Energy Master Plan', type: 'Plan' as const, url: '#',
        uploadedDate: '2023-04-15', fileSize: '16.7 MB', status: 'active' as const
      },
      {
        id: 'renewable-doc-002', name: 'System Performance Report', type: 'Report' as const, url: '#',
        uploadedDate: '2024-10-31', fileSize: '8.4 MB', status: 'active' as const
      }
    ],
    team: [
      {
        id: 'renewable-team-001', name: 'Engr. Solar Bautista', role: 'Energy Systems Manager',
        position: 'Senior Engineer', department: 'Facilities Management',
        email: 's.bautista@carsu.edu.ph', phone: '+63 917 666 0123',
        status: 'active' as const, type: 'staff' as const,
        responsibility: 'Renewable energy systems oversight and maintenance'
      }
    ],
    timeline: [
      {
        id: 'renewable-timeline-001', title: 'Renewable Energy Initiative Launch',
        description: 'Campus renewable energy project commenced with ambitious sustainability goals',
        date: '2023-06-01', status: 'completed' as const, type: 'monthly' as const,
        phase: 'Project Initiation', contractor: 'SolarMax Philippines',
        remarks: 'Project launched with strong commitment to carbon neutrality',
        createdBy: 'Solar Bautista', createdAt: '2023-06-01T08:00:00Z'
      },
      {
        id: 'renewable-timeline-002', title: 'Project Completion & Commissioning',
        description: 'Renewable energy systems fully operational and exceeding performance targets',
        date: '2024-10-31', status: 'completed' as const, type: 'monthly' as const,
        phase: 'Project Completion', contractor: 'SolarMax Philippines',
        remarks: 'Outstanding success - systems producing 115% of projected energy',
        createdBy: 'Solar Bautista', createdAt: '2024-10-31T16:00:00Z'
      }
    ],
    year: 2024, lastUpdated: '2024-10-31T18:00:00Z'
  },
  'proj-006': {
    // Student Wellness and Athletic Complex - Planned project
    id: 'proj-006',
    title: 'Student Wellness and Athletic Complex',
    description: 'Modernization of sports facilities and fitness center to support student health, wellness, and athletic programs.',
    category: 'locally-funded' as const,
    status: 'Planned' as const,
    progress: 0,
    budget: '₱92,300,000.00',
    budgetAmount: 92300000,
    contractor: 'Athletic Facilities Group / Wellness Design Corp.',
    location: 'Athletic Complex - West Campus',
    startDate: '2025-02-01',
    targetEndDate: '2026-01-31',
    beneficiaries: 6500,
    overview: {
      summary: 'A comprehensive athletic and wellness facility upgrade designed to provide modern fitness and sports facilities for students, faculty, and staff while supporting competitive athletics programs.',
      objectives: [
        'Modernize existing athletic facilities with state-of-the-art equipment',
        'Create comprehensive wellness and fitness programs for campus community',
        'Support competitive sports teams with professional-grade facilities',
        'Promote healthy lifestyle choices and physical fitness',
        'Establish community partnerships for wellness programs'
      ],
      scope: 'Renovation and expansion of existing athletic facilities including gymnasium updates, new fitness center, swimming pool renovation, outdoor sports courts, and wellness program spaces.',
      keyFeatures: [
        'Modern fitness center with cardio and strength training equipment',
        'Renovated swimming pool with competitive lanes and recreational areas',
        'Updated basketball and volleyball courts with professional-grade flooring',
        'Outdoor tennis and badminton courts with proper lighting',
        'Wellness center with program rooms and health assessment facilities',
        'Locker rooms and changing facilities with modern amenities'
      ]
    },
    financialAllocation: [
      { category: 'Facility Renovation', target: 45000000, actual: 0, variance: -45000000, variancePercentage: -100 },
      { category: 'Equipment & Furnishing', target: 25000000, actual: 0, variance: -25000000, variancePercentage: -100 },
      { category: 'Pool & Aquatic Systems', target: 15000000, actual: 0, variance: -15000000, variancePercentage: -100 },
      { category: 'Outdoor Courts & Landscaping', target: 5000000, actual: 0, variance: -5000000, variancePercentage: -100 },
      { category: 'Design & Professional Services', target: 2300000, actual: 0, variance: -2300000, variancePercentage: -100 }
    ],
    physicalAccomplishment: [
      {
        phase: 'Phase 1: Design & Planning',
        description: 'Architectural design, engineering plans, and permit acquisition',
        target: 0, actual: 0, variance: 0, status: 'Planned' as const,
        contractor: 'Athletic Facilities Group', startDate: '2025-02-01', endDate: '2025-05-31'
      },
      {
        phase: 'Phase 2: Renovation & Construction',
        description: 'Main renovation work and facility upgrades',
        target: 0, actual: 0, variance: 0, status: 'Planned' as const,
        contractor: 'Athletic Facilities Group', startDate: '2025-06-01', endDate: '2025-11-30'
      },
      {
        phase: 'Phase 3: Equipment & Commissioning',
        description: 'Equipment installation and facility commissioning',
        target: 0, actual: 0, variance: 0, status: 'Planned' as const,
        contractor: 'Wellness Design Corp.', startDate: '2025-12-01', endDate: '2026-01-31'
      }
    ],
    varianceData: {
      cumulativeWeeklyAccomplishment: 0, variance: 0, targetWeeklyProgress: 0, actualWeeklyProgress: 0,
      remarks: 'Project in planning phase. Construction scheduled to begin February 2025.'
    },
    gallery: [
      {
        id: 'wellness-design', url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
        caption: 'Conceptual design rendering of the modernized athletic complex',
        category: 'Documentation' as const, date: '2024-09-15', uploadedDate: '2024-09-15', status: 'active' as const
      }
    ],
    documents: [
      {
        id: 'wellness-doc-001', name: 'Athletic Complex Master Plan', type: 'Plan' as const, url: '#',
        uploadedDate: '2024-08-20', fileSize: '14.2 MB', status: 'active' as const
      }
    ],
    team: [
      {
        id: 'wellness-team-001', name: 'Coach Maria Santos', role: 'Athletic Director',
        position: 'Director of Athletics', department: 'Student Affairs',
        email: 'm.santos@carsu.edu.ph', phone: '+63 917 777 0123',
        status: 'active' as const, type: 'staff' as const,
        responsibility: 'Athletic program coordination and facility planning'
      }
    ],
    timeline: [
      {
        id: 'wellness-timeline-001', title: 'Project Planning Phase',
        description: 'Athletic complex modernization project planning and design phase initiated',
        date: '2024-12-15', status: 'planned' as const, type: 'monthly' as const,
        phase: 'Project Planning', contractor: 'Athletic Facilities Group',
        remarks: 'Planning phase to begin December 2024',
        createdBy: 'Maria Santos', createdAt: '2024-10-06T10:00:00Z'
      }
    ],
    year: 2025, lastUpdated: '2024-10-06T10:00:00Z'
  }
};

// Function to get project data by ID
export function getProjectById(projectId: string) {
  // Clean and normalize the project ID
  const cleanId = projectId?.toLowerCase().replace(/[^a-z0-9-]/g, '');
  
  console.log('🔍 Looking for project with ID:', cleanId);
  console.log('📋 Available project IDs:', Object.keys(PROJECT_DATA_MAP));
  
  // Check if project exists in our data map
  if (cleanId && PROJECT_DATA_MAP[cleanId as keyof typeof PROJECT_DATA_MAP]) {
    const project = PROJECT_DATA_MAP[cleanId as keyof typeof PROJECT_DATA_MAP];
    console.log('✅ Found project:', project.title);
    return project;
  }
  
  // If no match found, fall back to University Gymnasium
  console.warn('⚠️ No matching project found for ID:', cleanId, 'Falling back to University Gymnasium');
  return UNIVERSITY_GYMNASIUM_PROJECT;
}

// Function to get all available projects
export function getAllProjects() {
  return Object.values(PROJECT_DATA_MAP);
}

// Function to check if a project ID exists
export function projectExists(projectId: string): boolean {
  const cleanId = projectId?.toLowerCase().replace(/[^a-z0-9-]/g, '');
  return cleanId ? Object.prototype.hasOwnProperty.call(PROJECT_DATA_MAP, cleanId) : false;
}