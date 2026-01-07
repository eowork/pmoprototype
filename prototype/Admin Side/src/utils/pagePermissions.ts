/**
 * Page-Specific RBAC Utilities for Classroom & Administrative Offices
 * 
 * This module provides utilities to check if a user is an administrator
 * for specific subcategory pages, allowing them to approve and publish records.
 */

/**
 * Check if user is an admin for classroom assessment page
 * @param userProfile - The current user's profile with allowedPages
 * @returns boolean indicating if user can approve classroom assessments
 */
export const isClassroomAssessmentAdmin = (userProfile: any): boolean => {
  if (!userProfile) return false;
  
  // Global admins (with wildcard '*' access)
  if (userProfile.allowedPages?.includes('*')) return true;
  
  // Specific classroom assessment admins (must have exact page access)
  if (userProfile.allowedPages?.includes('classroom-csu-main-cc')) {
    // Additional check: only Staff/Admin roles can be page admins
    return ['Admin', 'Staff', 'Director'].includes(userProfile.role);
  }
  
  return false;
};

/**
 * Check if user is an admin for admin office assessment page
 * @param userProfile - The current user's profile with allowedPages
 * @returns boolean indicating if user can approve admin office assessments
 */
export const isAdminOfficeAssessmentAdmin = (userProfile: any): boolean => {
  if (!userProfile) return false;
  
  // Global admins (with wildcard '*' access)
  if (userProfile.allowedPages?.includes('*')) return true;
  
  // Specific admin office assessment admins
  if (userProfile.allowedPages?.includes('admin-office-csu-main-cc')) {
    return ['Admin', 'Staff', 'Director'].includes(userProfile.role);
  }
  
  return false;
};

/**
 * Check if user is an admin for laboratory assessment page
 * @param userProfile - The current user's profile with allowedPages
 * @returns boolean indicating if user can approve laboratory assessments
 */
export const isLaboratoryAssessmentAdmin = (userProfile: any): boolean => {
  if (!userProfile) return false;
  
  // Global admins (with wildcard '*' access)
  if (userProfile.allowedPages?.includes('*')) return true;
  
  // Specific laboratory assessment admins
  if (userProfile.allowedPages?.includes('laboratory-csu-main-cc')) {
    return ['Admin', 'Staff', 'Director'].includes(userProfile.role);
  }
  
  return false;
};

/**
 * Check if user is an admin for prioritization matrix page
 * @param userProfile - The current user's profile with allowedPages
 * @returns boolean indicating if user can approve prioritization matrix records
 */
export const isPrioritizationMatrixAdmin = (userProfile: any): boolean => {
  if (!userProfile) return false;
  
  // Global admins (with wildcard '*' access)
  if (userProfile.allowedPages?.includes('*')) return true;
  
  // Specific prioritization matrix admins
  if (userProfile.allowedPages?.includes('prioritization-matrix')) {
    return ['Admin', 'Staff', 'Director'].includes(userProfile.role);
  }
  
  return false;
};

/**
 * Get the appropriate status badge style
 * @param status - Record status (Draft, Published)
 * @returns className string for badge styling
 */
export const getStatusBadgeStyle = (status: string): string => {
  const styles = {
    'Draft': 'bg-slate-100 text-slate-700 border-slate-200',
    'Published': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  };
  return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-700 border-gray-200';
};

/**
 * Filter assessment records based on user permissions
 * - Non-logged users: See all published records
 * - Logged non-admin users: See all published records + their own drafts
 * - Page admins: See all records (both draft and published)
 * 
 * @param records - Array of assessment records
 * @param userProfile - Current user profile (null if not logged in)
 * @param isPageAdmin - Whether the user is an admin for this specific page
 * @returns Filtered array of records
 */
export const filterRecordsByPermission = (
  records: any[],
  userProfile: any,
  isPageAdmin: boolean
): any[] => {
  // Non-logged users: only published records
  if (!userProfile) {
    return records.filter(record => record.recordStatus === 'Published' || record.status === 'Published');
  }
  
  // Page admins: see everything
  if (isPageAdmin) {
    return records;
  }
  
  // Logged non-admin users: published + own drafts
  return records.filter(record => {
    const status = record.recordStatus || record.status;
    const submitter = record.submittedBy || record.assessor;
    
    return status === 'Published' || 
           (status === 'Draft' && submitter === userProfile.name);
  });
};