import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  Filter, 
  X, 
  FolderOpen, 
  Calendar, 
  DollarSign,
  MapPin,
  Briefcase
} from 'lucide-react';

interface SidebarContextCardsProps {
  selectedProject?: any;
  currentPage: string;
  onNavigate: (page: string) => void;
  filterData?: { type: string; filters: any } | null;
  collapsed: boolean;
}

// SIMPLIFIED: Minimal context cards implementation
// This component is now optional and only used in specific contexts
export function SidebarContextCards({
  selectedProject,
  currentPage,
  onNavigate,
  filterData,
  collapsed
}: SidebarContextCardsProps) {
  // Return null if collapsed or no relevant context
  if (collapsed || (!selectedProject && !filterData && currentPage === 'overview')) {
    return null;
  }

  return (
    <div className="space-y-2">
      {/* Selected Project Context - Minimal */}
      {selectedProject && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              <FolderOpen className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-blue-900 truncate">
                  {selectedProject.projectName}
                </p>
                <p className="text-xs text-blue-800">
                  {selectedProject.physicalAccomplishment?.toFixed(1) || 0}% complete
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter Status - Minimal */}
      {filterData && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-medium text-amber-900 truncate">
                {filterData.filters.title || 'Filtered view'}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Section - Minimal */}
      {currentPage !== 'overview' && (
        <div className="text-xs text-muted-foreground px-1">
          Current: {currentPage.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </div>
      )}
    </div>
  );
}