import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../ui/utils';

interface SidebarMenuItemProps {
  item: any;
  level: number;
  currentPage: string;
  onPageChange: (page: string) => void;
  userRole: string;
  isLoggedIn: boolean;
  collapsed: boolean;
}

export function SidebarMenuItem({ 
  item, 
  level = 0, 
  currentPage, 
  onPageChange, 
  userRole, 
  isLoggedIn, 
  collapsed 
}: SidebarMenuItemProps) {
  const [isOpen, setIsOpen] = React.useState(
    // Auto-expand if current page is in this item's children
    item.children?.some((child: any) => child.page === currentPage) || false
  );

  // Role-based visibility
  if (item.adminOnly && userRole !== 'Admin') return null;
  if (item.requiresAuth && !isLoggedIn) return null;

  // Skip divider items - they shouldn't be rendered as menu items
  if (item.type === 'divider') return null;

  const hasChildren = item.children && item.children.length > 0;
  const isActive = currentPage === item.page || currentPage === item.id;
  const isParentOfActive = hasChildren && item.children.some((child: any) => 
    child.page === currentPage || child.id === currentPage
  );

  const handleClick = () => {
    if (hasChildren && !collapsed) {
      setIsOpen(!isOpen);
    } else if (!hasChildren) {
      // Use item.page if available, otherwise fall back to item.id
      onPageChange(item.page || item.id);
    } else if (hasChildren && collapsed) {
      // If collapsed and has children, navigate to parent page
      onPageChange(item.page || item.id);
    }
  };

  // Ensure we have a valid icon component
  const IconComponent = item.icon;
  if (!IconComponent) {
    console.warn(`No icon found for sidebar item: ${item.id}`);
    return null;
  }

  return (
    <div className="w-full">
      <button
        onClick={handleClick}
        className={cn(
          "w-full flex items-center justify-between px-4 py-3 text-left sidebar-item rounded-lg mx-1 my-0.5",
          level > 0 && "pl-8 py-2.5 mx-2",
          collapsed && "justify-center px-2 mx-1",
          isActive && "sidebar-item active bg-blue-50 text-blue-900 border-r-3 border-blue-600",
          isParentOfActive && "bg-blue-25",
          "hover:bg-blue-50 hover:text-blue-900 group",
          level === 0 && "font-semibold",
          level > 0 && "font-medium text-gray-700"
        )}
        title={collapsed ? item.label : item.description}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <IconComponent className={cn(
            "flex-shrink-0 transition-colors",
            isActive ? "text-blue-600" : "text-gray-500",
            level === 0 ? "w-5 h-5" : "w-4 h-4",
            collapsed && "w-6 h-6",
            "group-hover:text-blue-600"
          )} />
          {!collapsed && (
            <span className={cn(
              "transition-colors leading-relaxed",
              level === 0 ? "text-sm font-semibold sidebar-primary-text" : "text-sm sidebar-secondary-text",
              isActive && "text-blue-900 font-semibold",
              "truncate group-hover:text-blue-900"
            )}>
              {item.label}
            </span>
          )}
        </div>
        
        {!collapsed && hasChildren && (
          <ChevronDown className={cn(
            "w-4 h-4 transition-all duration-200 flex-shrink-0 sidebar-dropdown-arrow",
            isActive ? "text-blue-600" : "text-gray-400",
            isOpen && "rotate-180 open",
            "group-hover:text-blue-600"
          )} />
        )}
      </button>
      
      {hasChildren && isOpen && !collapsed && (
        <div className="bg-gradient-to-r from-blue-50/30 to-transparent border-l-2 border-blue-100 ml-4 pl-2">
          {item.children.map((child: any) => (
            <SidebarMenuItem
              key={child.id}
              item={child}
              level={level + 1}
              currentPage={currentPage}
              onPageChange={onPageChange}
              userRole={userRole}
              isLoggedIn={isLoggedIn}
              collapsed={collapsed}
            />
          ))}
        </div>
      )}
    </div>
  );
}