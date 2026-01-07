import React from 'react';
import { Button } from '../ui/button';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '../ui/utils';

interface SidebarButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
  hasChildren: boolean;
  isExpanded: boolean;
  onClick: () => void;
  collapsed: boolean;
  indent?: number;
  description?: string;
}

export function SidebarButton({
  icon: Icon,
  label,
  isActive,
  hasChildren,
  isExpanded,
  onClick,
  collapsed,
  indent = 0,
  description
}: SidebarButtonProps) {
  return (
    <Button
      variant={isActive ? "secondary" : "ghost"}
      className={cn(
        "w-full justify-start transition-all duration-200 h-auto min-h-[40px]",
        collapsed ? "px-2 py-2" : "px-3 py-2",
        isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      )}
      style={{ paddingLeft: collapsed ? undefined : `${12 + indent}px` }}
      onClick={onClick}
      title={collapsed ? `${label}${description ? ` - ${description}` : ''}` : undefined}
    >
      <div className="flex items-center justify-between w-full min-w-0">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {Icon && (
            <Icon className={cn(
              "flex-shrink-0",
              collapsed ? "w-4 h-4" : "w-4 h-4",
              isActive ? "text-sidebar-accent-foreground" : "text-sidebar-foreground"
            )} />
          )}
          {!collapsed && (
            <span className="text-sm font-medium leading-tight break-words hyphens-auto min-w-0 flex-1">
              {label}
            </span>
          )}
        </div>
        
        {hasChildren && !collapsed && (
          <div className="flex-shrink-0 ml-2">
            {isExpanded ? (
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
            )}
          </div>
        )}
      </div>
    </Button>
  );
}