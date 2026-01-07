import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '../../ui/tabs';
import { BarChart3, Users, Camera, FileText, FolderOpen, Target } from 'lucide-react';

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userRole: string;
}

const tabs = [
  {
    id: 'overview',
    label: 'Overview',
    icon: Target,
    description: 'Project summary and status'
  },
  {
    id: 'analytics',
    label: 'Data Analytics',
    icon: BarChart3,
    description: 'M&E dashboard and reports'
  },
  {
    id: 'project-list',
    label: 'Project List',
    icon: FolderOpen,
    description: 'All project phases and tasks'
  },
  {
    id: 'gallery',
    label: 'Gallery',
    icon: Camera,
    description: 'Project photos and media'
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: FileText,
    description: 'Project documents and forms'
  },
  {
    id: 'team',
    label: 'Team Members',
    icon: Users,
    description: 'Project team and roles'
  }
];

export function TabNavigation({ activeTab, onTabChange, userRole }: TabNavigationProps) {
  return (
    <div className="border-b bg-background">
      <div className="px-6 py-4">
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-muted/30">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id}
                  className="flex items-center gap-2 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </div>
      
      {/* Tab description */}
      <div className="px-6 pb-4">
        <p className="text-sm text-muted-foreground">
          {tabs.find(tab => tab.id === activeTab)?.description}
        </p>
      </div>
    </div>
  );
}