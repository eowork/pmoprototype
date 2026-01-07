/**
 * Enhanced RBAC Service for Policies Management
 * 
 * Role Permissions:
 * 1. Admin - Full CRUD on all policies, access all pages, assign personnel, grant page permissions
 * 2. Director - Full CRUD on policies, restricted pages (needs Admin grant), assign personnel  
 * 3. Staff/Editor - View and Add only, cannot edit/delete, policies pages only
 * 4. Assigned Personnel - View assigned MOA/MOU only, cannot edit/delete
 * 
 * Features:
 * - Document assignment (for MOA/MOU personnel)
 * - Page permissions (for Directors to access other modules)
 * - LocalStorage persistence
 * - Department-based access control
 */

export interface PolicyPermissions {
  canView: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canApprove: boolean;
  canAssignPersonnel: boolean;
  canManageDocuments: boolean;
  canExportData: boolean;
  canAccessOtherPages: boolean;
  assignedDocuments?: string[]; // Specific document IDs user is assigned to
}

export interface DocumentAssignment {
  documentId: string;
  documentTitle: string;
  documentType: 'MOA' | 'MOU' | 'Policy';
  personnelEmail: string;
  personnelName: string;
  role: string;
  assignedBy: string;
  assignedDate: string;
  permissions: {
    canView: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canViewAttachments: boolean;
  };
  notificationEnabled: boolean;
}

export interface PagePermission {
  userEmail: string;
  userName: string;
  role: string;
  allowedPages: string[]; // Page identifiers that director can access
  assignedBy: string;
  assignedDate: string;
}

/**
 * Role Definitions:
 * - Admin: Full CRUD access to everything, can access all pages
 * - Director: Full CRUD for policies data, restricted page access unless granted by admin
 * - Staff: Can view and add data only, no edit/delete permissions
 * - Assigned Personnel: For MOA/MOU, can view assigned documents but cannot edit/delete
 */
class EnhancedPoliciesRBACService {
  private documentAssignments: Map<string, DocumentAssignment[]> = new Map();
  private pagePermissions: Map<string, PagePermission> = new Map();

  /**
   * Get user permissions based on role and assignments
   */
  getUserPermissions(
    userEmail: string,
    userRole: string,
    category: string = 'policies'
  ): PolicyPermissions {
    const basePermissions: PolicyPermissions = {
      canView: true, // Everyone can view
      canAdd: false,
      canEdit: false,
      canDelete: false,
      canApprove: false,
      canAssignPersonnel: false,
      canManageDocuments: false,
      canExportData: true,
      canAccessOtherPages: false,
      assignedDocuments: []
    };

    // Admin has full permissions
    if (userRole === 'Admin') {
      return {
        canView: true,
        canAdd: true,
        canEdit: true,
        canDelete: true,
        canApprove: true,
        canAssignPersonnel: true,
        canManageDocuments: true,
        canExportData: true,
        canAccessOtherPages: true,
        assignedDocuments: [] // Admin can access all documents
      };
    }

    // Director has full CRUD for policies data but restricted page access
    if (userRole === 'Director') {
      const pagePermission = this.pagePermissions.get(userEmail);
      return {
        canView: true,
        canAdd: true,
        canEdit: true,
        canDelete: true,
        canApprove: true,
        canAssignPersonnel: true,
        canManageDocuments: true,
        canExportData: true,
        canAccessOtherPages: pagePermission ? pagePermission.allowedPages.length > 0 : false,
        assignedDocuments: [] // Director can access all policy documents
      };
    }

    // Staff can view and add only
    if (userRole === 'Staff' || userRole === 'Editor') {
      return {
        canView: true,
        canAdd: true,
        canEdit: false,
        canDelete: false,
        canApprove: false,
        canAssignPersonnel: false,
        canManageDocuments: false,
        canExportData: true,
        canAccessOtherPages: false,
        assignedDocuments: []
      };
    }

    // Assigned Personnel - can view specific assigned documents only
    const assignedDocuments = this.getAssignedDocuments(userEmail);
    if (assignedDocuments.length > 0) {
      return {
        canView: true,
        canAdd: false,
        canEdit: false,
        canDelete: false,
        canApprove: false,
        canAssignPersonnel: false,
        canManageDocuments: false,
        canExportData: true,
        canAccessOtherPages: false,
        assignedDocuments: assignedDocuments.map(a => a.documentId)
      };
    }

    // Client/Guest - read-only
    return basePermissions;
  }

  /**
   * Check if user can view a specific document
   */
  canViewDocument(userEmail: string, userRole: string, documentId: string): boolean {
    // Admin, Director can view all documents
    if (userRole === 'Admin' || userRole === 'Director') {
      return true;
    }

    // Staff can view all documents
    if (userRole === 'Staff' || userRole === 'Editor') {
      return true;
    }

    // Check if user is assigned to this document
    const assignments = this.documentAssignments.get(documentId) || [];
    const isAssigned = assignments.some(a => a.personnelEmail === userEmail);
    
    return isAssigned;
  }

  /**
   * Check if user can edit a specific document
   */
  canEditDocument(userEmail: string, userRole: string, documentId: string): boolean {
    // Admin and Director can edit all documents
    if (userRole === 'Admin' || userRole === 'Director') {
      return true;
    }

    // Staff cannot edit
    if (userRole === 'Staff' || userRole === 'Editor') {
      return false;
    }

    // Check assignment permissions
    const assignments = this.documentAssignments.get(documentId) || [];
    const userAssignment = assignments.find(a => a.personnelEmail === userEmail);
    
    return userAssignment?.permissions.canEdit || false;
  }

  /**
   * Check if user can delete a specific document
   */
  canDeleteDocument(userEmail: string, userRole: string, documentId: string): boolean {
    // Only Admin and Director can delete
    if (userRole === 'Admin' || userRole === 'Director') {
      return true;
    }

    return false;
  }

  /**
   * Assign personnel to a document (for MOA/MOU)
   */
  assignPersonnelToDocument(
    documentId: string,
    documentTitle: string,
    documentType: 'MOA' | 'MOU' | 'Policy',
    personnelEmail: string,
    personnelName: string,
    assignedBy: string,
    notificationEnabled: boolean = true
  ): boolean {
    const assignment: DocumentAssignment = {
      documentId,
      documentTitle,
      documentType,
      personnelEmail,
      personnelName,
      role: 'Assigned Personnel',
      assignedBy,
      assignedDate: new Date().toISOString(),
      permissions: {
        canView: true,
        canEdit: false,
        canDelete: false,
        canViewAttachments: true
      },
      notificationEnabled
    };

    const existing = this.documentAssignments.get(documentId) || [];
    
    // Check if already assigned
    const alreadyAssigned = existing.find(a => a.personnelEmail === personnelEmail);
    if (alreadyAssigned) {
      // Update assignment
      const updated = existing.map(a => 
        a.personnelEmail === personnelEmail ? assignment : a
      );
      this.documentAssignments.set(documentId, updated);
    } else {
      this.documentAssignments.set(documentId, [...existing, assignment]);
    }

    // Store in localStorage for persistence
    this.persistAssignments();

    return true;
  }

  /**
   * Remove personnel assignment from document
   */
  removePersonnelFromDocument(documentId: string, personnelEmail: string): boolean {
    const assignments = this.documentAssignments.get(documentId) || [];
    const filtered = assignments.filter(a => a.personnelEmail !== personnelEmail);
    this.documentAssignments.set(documentId, filtered);
    this.persistAssignments();
    return true;
  }

  /**
   * Get all personnel assigned to a document
   */
  getDocumentPersonnel(documentId: string): DocumentAssignment[] {
    return this.documentAssignments.get(documentId) || [];
  }

  /**
   * Get all documents assigned to a personnel
   */
  getAssignedDocuments(personnelEmail: string): DocumentAssignment[] {
    const allAssignments: DocumentAssignment[] = [];
    
    this.documentAssignments.forEach((assignments) => {
      const userAssignments = assignments.filter(a => a.personnelEmail === personnelEmail);
      allAssignments.push(...userAssignments);
    });

    return allAssignments;
  }

  /**
   * Assign page-level permissions to Director (Admin only)
   */
  assignPagePermissionsToDirector(
    userEmail: string,
    userName: string,
    role: string,
    allowedPages: string[],
    assignedBy: string
  ): boolean {
    // Only allow this for Director role
    if (role !== 'Director') {
      return false;
    }

    const permission: PagePermission = {
      userEmail,
      userName,
      role,
      allowedPages,
      assignedBy,
      assignedDate: new Date().toISOString()
    };

    this.pagePermissions.set(userEmail, permission);
    this.persistPagePermissions();
    return true;
  }

  /**
   * Get page permissions for a user
   */
  getUserPagePermissions(userEmail: string): PagePermission | undefined {
    return this.pagePermissions.get(userEmail);
  }

  /**
   * Check if user can access a specific page
   */
  canAccessPage(userEmail: string, userRole: string, pageId: string): boolean {
    // Admin can access everything
    if (userRole === 'Admin') {
      return true;
    }

    // Check if Director has page permission
    if (userRole === 'Director') {
      const pagePermission = this.pagePermissions.get(userEmail);
      if (pagePermission && pagePermission.allowedPages.length > 0) {
        return pagePermission.allowedPages.includes(pageId);
      }
      // Default: Director can only access policies pages
      return pageId.startsWith('policies') || pageId.includes('memorandum');
    }

    // Staff can only access policies pages
    if (userRole === 'Staff' || userRole === 'Editor') {
      return pageId.startsWith('policies') || pageId.includes('memorandum');
    }

    // Assigned personnel can only access policies pages with assigned documents
    const assignedDocs = this.getAssignedDocuments(userEmail);
    if (assignedDocs.length > 0) {
      return pageId.startsWith('policies') || pageId.includes('memorandum');
    }

    return false;
  }

  /**
   * Remove page permissions from user
   */
  removeUserPagePermissions(userEmail: string): boolean {
    this.pagePermissions.delete(userEmail);
    this.persistPagePermissions();
    return true;
  }

  /**
   * Get all users with custom page permissions
   */
  getAllPagePermissions(): PagePermission[] {
    return Array.from(this.pagePermissions.values());
  }

  /**
   * Persist assignments to localStorage
   */
  private persistAssignments(): void {
    try {
      const data = Array.from(this.documentAssignments.entries());
      localStorage.setItem('csu_pmo_policy_document_assignments', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to persist policy assignments:', error);
    }
  }

  /**
   * Persist page permissions to localStorage
   */
  private persistPagePermissions(): void {
    try {
      const data = Array.from(this.pagePermissions.entries());
      localStorage.setItem('csu_pmo_policy_page_permissions', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to persist page permissions:', error);
    }
  }

  /**
   * Load assignments from localStorage
   */
  loadAssignments(): void {
    try {
      const stored = localStorage.getItem('csu_pmo_policy_document_assignments');
      if (stored) {
        const data = JSON.parse(stored);
        this.documentAssignments = new Map(data);
      }
    } catch (error) {
      console.error('Failed to load policy assignments:', error);
    }
  }

  /**
   * Load page permissions from localStorage
   */
  loadPagePermissions(): void {
    try {
      const stored = localStorage.getItem('csu_pmo_policy_page_permissions');
      if (stored) {
        const data = JSON.parse(stored);
        this.pagePermissions = new Map(data);
      }
    } catch (error) {
      console.error('Failed to load page permissions:', error);
    }
  }

  /**
   * Get permission label for UI display
   */
  getPermissionLabel(userRole: string): string {
    switch (userRole) {
      case 'Admin':
        return 'Full Access - Can manage all policies and access all pages';
      case 'Director':
        return 'Director Access - Full CRUD for policies, restricted page access';
      case 'Staff':
      case 'Editor':
        return 'Staff Access - Can view and add policies only';
      default:
        return 'View Only - Can view assigned documents';
    }
  }

  /**
   * Get available pages for assignment
   */
  getAvailablePages(): Array<{ id: string; label: string; category: string }> {
    return [
      { id: 'construction-infrastructure', label: 'Construction Infrastructure', category: 'Construction' },
      { id: 'gaa-funded-projects', label: 'GAA Funded Projects', category: 'Construction' },
      { id: 'locally-funded-projects', label: 'Locally Funded Projects', category: 'Construction' },
      { id: 'special-grants-projects', label: 'Special Grants Projects', category: 'Construction' },
      { id: 'university-operations', label: 'University Operations', category: 'Operations' },
      { id: 'gad-parity-report', label: 'GAD Parity Report', category: 'GAD' },
      { id: 'repairs', label: 'Repairs', category: 'Facilities' },
      { id: 'fabrication', label: 'Fabrication', category: 'Facilities' },
      { id: 'forms', label: 'Forms', category: 'Documents' }
    ];
  }

  /**
   * Initialize with mock data for demonstration
   */
  initializeMockData(): void {
    // Sample document assignments for MOA/MOU
    this.assignPersonnelToDocument(
      'moa-2024-001',
      'DOST Research Collaboration Agreement',
      'MOA',
      'staff1@carsu.edu.ph',
      'Juan Dela Cruz',
      'admin@carsu.edu.ph',
      true
    );

    this.assignPersonnelToDocument(
      'mou-2024-001',
      'Environmental Protection Initiatives',
      'MOU',
      'staff2@carsu.edu.ph',
      'Maria Santos',
      'admin@carsu.edu.ph',
      true
    );

    // Sample page permissions for Director
    this.assignPagePermissionsToDirector(
      'director@carsu.edu.ph',
      'Dr. Director Name',
      'Director',
      ['construction-infrastructure', 'gaa-funded-projects'],
      'admin@carsu.edu.ph'
    );
  }
}

// Create singleton instance
export const enhancedPoliciesRBACService = new EnhancedPoliciesRBACService();

// Initialize with stored data and mock data
enhancedPoliciesRBACService.loadAssignments();
enhancedPoliciesRBACService.loadPagePermissions();
enhancedPoliciesRBACService.initializeMockData();
