// Repair Data Manager - Similar to ProjectDataManager for construction
// Provides centralized management for repair project data

export interface RepairProject {
  id: string;
  title: string;
  description: string;
  category: 'emergency-repairs' | 'preventive-maintenance' | 'facility-upgrades' | 'safety-compliance';
  status: 'Ongoing' | 'Completed' | 'Planned' | 'On-Hold';
  progress: number;
  financialProgress?: number;
  targetProgress?: number;
  location: string;
  startDate: string;
  targetEndDate: string;
  year: number;
  budget?: string;
  spent?: string;
  phases?: { name: string; completion: number; target: number; }[];
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  repairType: 'Electrical' | 'Plumbing' | 'HVAC' | 'Structural' | 'Safety' | 'General';
  affectedFacilities: string[];
  contractor?: string;
  projectManager?: string;
  beneficiaries?: number;
  urgencyLevel?: number;
  safetyCompliance?: boolean;
  qualityAssurance?: {
    inspectionsPassed: number;
    totalInspections: number;
    certifications: string[];
  };
  sustainabilityFeatures?: string[];
  energyEfficiencyImpact?: string;
  emergencyRepair?: boolean;
  maintenanceSchedule?: string;
  warrantyCoverage?: string;
  lastInspection?: string;
  gallery?: {
    beforeImages: string[];
    duringImages: string[];
    afterImages: string[];
    documentationImages: string[];
  };
}

export interface RepairUpdate {
  id: string;
  projectId: string;
  date: string;
  title: string;
  description: string;
  progress: number;
  author: string;
  type: 'progress' | 'milestone' | 'issue' | 'completion';
}

export interface RepairDocument {
  id: string;
  projectId: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  category: 'contract' | 'permit' | 'report' | 'inspection' | 'other';
  url?: string;
}

export class RepairDataManager {
  private static instance: RepairDataManager;
  private projects: Map<string, RepairProject> = new Map();
  private updates: Map<string, RepairUpdate[]> = new Map();
  private documents: Map<string, RepairDocument[]> = new Map();

  private constructor() {
    this.initializeData();
  }

  public static getInstance(): RepairDataManager {
    if (!RepairDataManager.instance) {
      RepairDataManager.instance = new RepairDataManager();
    }
    return RepairDataManager.instance;
  }

  private initializeData() {
    // Initialize with sample data
    this.loadSampleProjects();
    this.loadSampleUpdates();
    this.loadSampleDocuments();
  }

  // Project Management
  public getProject(id: string): RepairProject | null {
    return this.projects.get(id) || null;
  }

  public getAllProjects(): RepairProject[] {
    return Array.from(this.projects.values());
  }

  public getProjectsByCategory(category: string): RepairProject[] {
    return this.getAllProjects().filter(project => 
      category === 'overview' || project.category === category
    );
  }

  public addProject(project: RepairProject): void {
    this.projects.set(project.id, project);
  }

  public updateProject(id: string, updates: Partial<RepairProject>): boolean {
    const project = this.projects.get(id);
    if (project) {
      this.projects.set(id, { ...project, ...updates });
      return true;
    }
    return false;
  }

  public deleteProject(id: string): boolean {
    return this.projects.delete(id);
  }

  // Updates Management
  public getProjectUpdates(projectId: string): RepairUpdate[] {
    return this.updates.get(projectId) || [];
  }

  public addUpdate(update: RepairUpdate): void {
    const projectUpdates = this.updates.get(update.projectId) || [];
    projectUpdates.unshift(update); // Add to beginning for chronological order
    this.updates.set(update.projectId, projectUpdates);
  }

  // Documents Management
  public getProjectDocuments(projectId: string): RepairDocument[] {
    return this.documents.get(projectId) || [];
  }

  public addDocument(document: RepairDocument): void {
    const projectDocuments = this.documents.get(document.projectId) || [];
    projectDocuments.push(document);
    this.documents.set(document.projectId, projectDocuments);
  }

  // Search and Filter
  public searchProjects(query: string): RepairProject[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllProjects().filter(project =>
      project.title.toLowerCase().includes(lowerQuery) ||
      project.description.toLowerCase().includes(lowerQuery) ||
      project.location.toLowerCase().includes(lowerQuery) ||
      project.repairType.toLowerCase().includes(lowerQuery)
    );
  }

  public filterProjects(filters: {
    status?: string;
    category?: string;
    priority?: string;
    year?: number;
    repairType?: string;
  }): RepairProject[] {
    return this.getAllProjects().filter(project => {
      if (filters.status && filters.status !== 'all' && project.status !== filters.status) return false;
      if (filters.category && filters.category !== 'all' && project.category !== filters.category) return false;
      if (filters.priority && filters.priority !== 'all' && project.priority !== filters.priority) return false;
      if (filters.year && project.year !== filters.year) return false;
      if (filters.repairType && filters.repairType !== 'all' && project.repairType !== filters.repairType) return false;
      return true;
    });
  }

  // Statistics
  public getStatistics() {
    const projects = this.getAllProjects();
    return {
      total: projects.length,
      ongoing: projects.filter(p => p.status === 'Ongoing').length,
      completed: projects.filter(p => p.status === 'Completed').length,
      planned: projects.filter(p => p.status === 'Planned').length,
      onHold: projects.filter(p => p.status === 'On-Hold').length,
      emergency: projects.filter(p => p.emergencyRepair).length,
      critical: projects.filter(p => p.priority === 'Critical').length,
      averageProgress: projects.length > 0 
        ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)
        : 0,
      totalBudget: projects.reduce((sum, p) => {
        const budget = p.budget ? parseFloat(p.budget.replace(/[₱,]/g, '')) : 0;
        return sum + budget;
      }, 0),
      totalSpent: projects.reduce((sum, p) => {
        const spent = p.spent ? parseFloat(p.spent.replace(/[₱,]/g, '')) : 0;
        return sum + spent;
      }, 0)
    };
  }

  private loadSampleProjects() {
    const sampleProjects: RepairProject[] = [
      {
        id: 'repair-001',
        title: 'Engineering Building HVAC System Emergency Repair',
        description: 'Critical repair of malfunctioning HVAC systems in engineering classrooms affecting student learning environment.',
        category: 'emergency-repairs',
        status: 'Ongoing',
        progress: 75,
        financialProgress: 80,
        targetProgress: 85,
        location: 'Engineering Building, Floors 2-4',
        startDate: '2024-11-01',
        targetEndDate: '2024-12-30',
        year: 2024,
        budget: '₱2,500,000',
        spent: '₱2,000,000',
        priority: 'Critical',
        repairType: 'HVAC',
        affectedFacilities: ['ENG 201-210', 'ENG 301-310', 'ENG 401-408'],
        contractor: 'TechCool HVAC Solutions',
        projectManager: 'Engr. Maria Santos',
        beneficiaries: 800,
        urgencyLevel: 9,
        safetyCompliance: true,
        qualityAssurance: {
          inspectionsPassed: 8,
          totalInspections: 10,
          certifications: ['HVAC Safety Compliance', 'Energy Efficiency Rating']
        },
        sustainabilityFeatures: ['Energy-Efficient Units', 'Smart Temperature Control', 'Improved Air Filtration'],
        energyEfficiencyImpact: '30% reduction in energy consumption',
        emergencyRepair: true,
        maintenanceSchedule: 'Quarterly maintenance',
        warrantyCoverage: '5 years comprehensive warranty',
        lastInspection: '2024-11-25',
        phases: [
          { name: 'Assessment & Planning', completion: 100, target: 100 },
          { name: 'Component Replacement', completion: 85, target: 90 },
          { name: 'Testing & Commissioning', completion: 30, target: 75 },
          { name: 'Documentation & Handover', completion: 0, target: 60 }
        ],
        gallery: {
          beforeImages: [
            'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=600&fit=crop'
          ],
          duringImages: [
            'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop'
          ],
          afterImages: [
            'https://images.unsplash.com/photo-1565182999561-18d7dc61c393?w=800&h=600&fit=crop'
          ],
          documentationImages: [
            'https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=600&fit=crop'
          ]
        }
      },
      {
        id: 'repair-002',
        title: 'Science Building Laboratory Electrical System Upgrade',
        description: 'Comprehensive electrical system modernization for chemistry and physics laboratories.',
        category: 'facility-upgrades',
        status: 'Ongoing',
        progress: 60,
        financialProgress: 55,
        targetProgress: 70,
        location: 'Science Building, Laboratory Wing',
        startDate: '2024-10-15',
        targetEndDate: '2025-02-28',
        year: 2024,
        budget: '₱1,800,000',
        spent: '₱990,000',
        priority: 'High',
        repairType: 'Electrical',
        affectedFacilities: ['Chemistry Lab 1-3', 'Physics Lab 1-2', 'Biology Lab'],
        contractor: 'PowerTech Electrical Services',
        projectManager: 'Engr. Roberto Cruz',
        beneficiaries: 600,
        urgencyLevel: 7,
        safetyCompliance: true,
        qualityAssurance: {
          inspectionsPassed: 6,
          totalInspections: 10,
          certifications: ['Electrical Safety Certificate', 'Laboratory Compliance']
        },
        sustainabilityFeatures: ['LED Lighting System', 'Energy Management System'],
        energyEfficiencyImpact: '35% reduction in electricity consumption',
        emergencyRepair: false,
        maintenanceSchedule: 'Monthly inspection',
        warrantyCoverage: '3 years full warranty on all components',
        lastInspection: '2024-11-28'
      },
      {
        id: 'repair-003',
        title: 'Administration Building Roof Leak Repairs',
        description: 'Emergency roof repair work to prevent water damage in administrative offices.',
        category: 'emergency-repairs',
        status: 'Completed',
        progress: 100,
        financialProgress: 100,
        targetProgress: 100,
        location: 'Administration Building, Main Roof',
        startDate: '2024-09-01',
        targetEndDate: '2024-10-15',
        year: 2024,
        budget: '₱850,000',
        spent: '₱820,000',
        priority: 'Critical',
        repairType: 'Structural',
        affectedFacilities: ['President\'s Office', 'Vice President\'s Office', 'Registrar', 'Accounting'],
        contractor: 'RoofMaster Construction',
        projectManager: 'Arch. Lisa Garcia',
        beneficiaries: 150,
        urgencyLevel: 9,
        safetyCompliance: true,
        qualityAssurance: {
          inspectionsPassed: 5,
          totalInspections: 5,
          certifications: ['Structural Safety Certificate', 'Waterproofing Warranty']
        },
        sustainabilityFeatures: ['Weather-resistant materials', 'Improved insulation'],
        energyEfficiencyImpact: '10% improvement in building efficiency',
        emergencyRepair: true,
        maintenanceSchedule: 'Annual inspection',
        warrantyCoverage: '10 years structural warranty',
        lastInspection: '2024-10-20'
      },
      {
        id: 'repair-004',
        title: 'Library Building Air Conditioning Preventive Maintenance',
        description: 'Scheduled preventive maintenance of library HVAC systems to ensure optimal performance.',
        category: 'preventive-maintenance',
        status: 'Completed',
        progress: 100,
        financialProgress: 100,
        targetProgress: 100,
        location: 'Library Building, All Floors',
        startDate: '2024-08-01',
        targetEndDate: '2024-09-30',
        year: 2024,
        budget: '₱650,000',
        spent: '₱620,000',
        priority: 'Medium',
        repairType: 'HVAC',
        affectedFacilities: ['Reading Areas', 'Computer Lab', 'Study Rooms', 'Archives'],
        contractor: 'Cool Air Maintenance Services',
        projectManager: 'Engr. Patricia Lim',
        beneficiaries: 500,
        urgencyLevel: 5,
        safetyCompliance: true,
        qualityAssurance: {
          inspectionsPassed: 3,
          totalInspections: 3,
          certifications: ['HVAC Maintenance Certificate']
        },
        sustainabilityFeatures: ['Filter replacement', 'System optimization'],
        energyEfficiencyImpact: '15% improvement in energy efficiency',
        emergencyRepair: false,
        maintenanceSchedule: 'Bi-annual maintenance',
        warrantyCoverage: '2 years maintenance warranty',
        lastInspection: '2024-09-25'
      },
      {
        id: 'repair-005',
        title: 'Student Center Fire Safety System Installation',
        description: 'Installation of comprehensive fire safety systems including alarms, sprinklers, and emergency exits.',
        category: 'safety-compliance',
        status: 'Ongoing',
        progress: 45,
        financialProgress: 40,
        targetProgress: 60,
        location: 'Student Center, All Areas',
        startDate: '2024-11-15',
        targetEndDate: '2025-03-31',
        year: 2024,
        budget: '₱3,200,000',
        spent: '₱1,280,000',
        priority: 'High',
        repairType: 'Safety',
        affectedFacilities: ['Cafeteria', 'Auditorium', 'Student Lounges', 'Offices'],
        contractor: 'SafeGuard Fire Systems',
        projectManager: 'Engr. Jose Mercado',
        beneficiaries: 1200,
        urgencyLevel: 8,
        safetyCompliance: false, // In progress
        qualityAssurance: {
          inspectionsPassed: 3,
          totalInspections: 8,
          certifications: ['Pending final inspection']
        },
        sustainabilityFeatures: ['Water-efficient sprinkler system', 'Smart detection technology'],
        energyEfficiencyImpact: 'Minimal impact on energy consumption',
        emergencyRepair: false,
        maintenanceSchedule: 'Monthly system checks',
        warrantyCoverage: '5 years comprehensive system warranty',
        lastInspection: '2024-11-20'
      }
    ];

    sampleProjects.forEach(project => {
      this.projects.set(project.id, project);
    });
  }

  private loadSampleUpdates() {
    const sampleUpdates: RepairUpdate[] = [
      {
        id: 'update-001-1',
        projectId: 'repair-001',
        date: '2024-11-25',
        title: 'Safety Inspection Completed',
        description: 'Completed comprehensive safety inspection of new HVAC units. All systems meet safety standards.',
        progress: 75,
        author: 'Engr. Maria Santos',
        type: 'milestone'
      },
      {
        id: 'update-001-2',
        projectId: 'repair-001',
        date: '2024-11-20',
        title: 'Component Installation Progress',
        description: 'Successfully installed new HVAC units on floors 2 and 3. Floor 4 installation in progress.',
        progress: 70,
        author: 'TechCool HVAC Solutions',
        type: 'progress'
      },
      {
        id: 'update-002-1',
        projectId: 'repair-002',
        date: '2024-11-28',
        title: 'Electrical Panel Upgrades Complete',
        description: 'All electrical panels in chemistry and physics labs have been upgraded to modern standards.',
        progress: 60,
        author: 'Engr. Roberto Cruz',
        type: 'milestone'
      }
    ];

    sampleUpdates.forEach(update => {
      const projectUpdates = this.updates.get(update.projectId) || [];
      projectUpdates.push(update);
      this.updates.set(update.projectId, projectUpdates);
    });
  }

  private loadSampleDocuments() {
    const sampleDocuments: RepairDocument[] = [
      {
        id: 'doc-001-1',
        projectId: 'repair-001',
        name: 'HVAC_System_Assessment_Report.pdf',
        type: 'PDF',
        size: '2.4 MB',
        uploadDate: '2024-11-01',
        category: 'report'
      },
      {
        id: 'doc-001-2',
        projectId: 'repair-001',
        name: 'Safety_Compliance_Certificate.pdf',
        type: 'PDF',
        size: '1.8 MB',
        uploadDate: '2024-11-10',
        category: 'inspection'
      },
      {
        id: 'doc-002-1',
        projectId: 'repair-002',
        name: 'Electrical_Safety_Report.pdf',
        type: 'PDF',
        size: '3.1 MB',
        uploadDate: '2024-10-20',
        category: 'inspection'
      }
    ];

    sampleDocuments.forEach(document => {
      const projectDocuments = this.documents.get(document.projectId) || [];
      projectDocuments.push(document);
      this.documents.set(document.projectId, projectDocuments);
    });
  }
}

// Export singleton instance
export const repairDataManager = RepairDataManager.getInstance();