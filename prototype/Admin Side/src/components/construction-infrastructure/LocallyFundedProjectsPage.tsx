import React from 'react';
import { GenericFundedProjectsPage } from './components/GenericFundedProjectsPage';
import { projectPageConfigs } from './config/projectPageConfigs';
import { ConstructionProject } from './types/ProjectTypes';

interface LocallyFundedProjectsPageProps {
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
 * Locally-Funded Projects Page
 * This is a lightweight wrapper around the GenericFundedProjectsPage component
 * configured specifically for locally-funded projects.
 */
export function LocallyFundedProjectsPage(props: LocallyFundedProjectsPageProps) {
  return (
    <GenericFundedProjectsPage
      config={projectPageConfigs['locally-funded']}
      {...props}
    />
  );
}