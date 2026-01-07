import React from 'react';
import { GraduationCap } from 'lucide-react';
import { RepairProject } from './types/RepairTypes';
import { GenericRepairProjectsPage } from './components/GenericRepairProjectsPage';
import { sampleClassroomRepairs } from './data/classroomRepairsData';

interface ClassroomsRepairsPageProps {
  category: string;
  onProjectSelect: (project: RepairProject) => void;
  userRole: string;
  userEmail?: string;
  userDepartment?: string;
  filterData?: any;
  requireAuth: (action: string) => boolean;
  onClearFilters: () => void;
}

export function ClassroomsRepairsPage(props: ClassroomsRepairsPageProps) {
  const config = {
    icon: GraduationCap,
    title: 'Classroom Repairs & Maintenance',
    subtitle: 'Educational facility maintenance across CSU Main and CSU CC campuses',
    category: 'classrooms',
    sampleProjects: sampleClassroomRepairs
  };

  return <GenericRepairProjectsPage config={config} {...props} />;
}
