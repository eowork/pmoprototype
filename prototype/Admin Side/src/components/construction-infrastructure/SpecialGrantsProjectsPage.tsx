import React from 'react';
import { GenericFundedProjectsPage } from './components/GenericFundedProjectsPage';
import { projectPageConfigs } from './config/projectPageConfigs';
import { ConstructionProject } from './types/ProjectTypes';

interface SpecialGrantsProjectsPageProps {
  category: string;
  onProjectSelect: (project: ConstructionProject) => void;
  userRole: string;
  userEmail?: string;
  userDepartment?: string;
  filterData?: any;
  requireAuth: (action: string) => boolean;
  onClearFilters: () => void;
}

/**
 * Special Grants & Partnerships Projects Page
 * This is a lightweight wrapper around the GenericFundedProjectsPage component
 * configured specifically for special grants, partnerships, and income-generating projects.
 */
export function SpecialGrantsProjectsPage(props: SpecialGrantsProjectsPageProps) {
  return (
    <GenericFundedProjectsPage
      config={projectPageConfigs['special-grants']}
      {...props}
    />
  );
}
