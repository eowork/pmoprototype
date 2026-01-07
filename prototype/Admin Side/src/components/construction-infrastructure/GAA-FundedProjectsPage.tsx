import React from 'react';
import { GenericFundedProjectsPage } from './components/GenericFundedProjectsPage';
import { projectPageConfigs } from './config/projectPageConfigs';
import { ConstructionProject } from './types/ProjectTypes';

interface GAA_FundedProjectsPageProps {
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
 * GAA-Funded Projects Page
 * This is a lightweight wrapper around the GenericFundedProjectsPage component
 * configured specifically for GAA-funded projects.
 */
export function GAA_FundedProjectsPage(props: GAA_FundedProjectsPageProps) {
  return (
    <GenericFundedProjectsPage
      config={projectPageConfigs['gaa-funded']}
      {...props}
    />
  );
}