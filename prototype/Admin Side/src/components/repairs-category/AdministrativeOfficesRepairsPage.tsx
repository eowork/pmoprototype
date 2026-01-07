import React from 'react';
import { Building2 } from 'lucide-react';
import { RepairProject } from './types/RepairTypes';
import { GenericRepairProjectsPage } from './components/GenericRepairProjectsPage';
import { sampleAdministrativeRepairs } from './data/administrativeOfficesRepairsData';

interface AdministrativeOfficesRepairsPageProps {
  category: string;
  onProjectSelect: (project: RepairProject) => void;
  userRole: string;
  userEmail?: string;
  userDepartment?: string;
  filterData?: any;
  requireAuth: (action: string) => boolean;
  onClearFilters: () => void;
}

export function AdministrativeOfficesRepairsPage(props: AdministrativeOfficesRepairsPageProps) {
  const config = {
    icon: Building2,
    title: 'Administrative Office Repairs',
    subtitle: 'Office facility maintenance across CSU Main and CSU CC campuses',
    category: 'administrative-offices',
    sampleProjects: sampleAdministrativeRepairs
  };

  return <GenericRepairProjectsPage config={config} {...props} />;
}
