export interface ConstructionProjectDetailProps {
  project: any;
  onBack: () => void;
  onNavigate: (page: string) => void;
  userRole: string;
  requireAuth: (action: string) => boolean;
}

export * from './METypes';
export * from './DocumentTypes';
export * from './GalleryTypes';
export * from './TeamTypes';
export * from './ProjectTypes';