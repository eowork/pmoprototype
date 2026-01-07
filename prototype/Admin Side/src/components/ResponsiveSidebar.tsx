import React, { useState, useEffect } from 'react';
import { sidebarConfig, adminSidebarItems } from './constants/sidebarConfig';
import { cn } from './ui/utils';
import { SidebarMenuItem } from './Sidebar/SidebarMenuItem';
import { SidebarHeader } from './Sidebar/SidebarHeader';
import { SidebarUserSection } from './Sidebar/SidebarUserSection';
import { Button } from './ui/button';
import { Menu, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

interface ResponsiveSidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  userRole: string;
  onRoleChange: (role: string) => void;
  userProfile: any;
  onSignOut: () => void;
  onLoginClick: () => void;
  isLoggedIn: boolean;
  requireAuth: (action: string) => boolean;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

// ============================================
// RBAC Utility Functions
// ============================================

/**
 * Check if user has access to a specific page
 * @param pageId - The page identifier to check
 * @param allowedPages - Array of allowed page IDs for the user
 * @returns boolean indicating if user has access
 */
const hasAccessToPage = (pageId: string, allowedPages: string[]): boolean => {
  if (!allowedPages || allowedPages.length === 0) return false;
  if (allowedPages.includes('*')) return true; // Wildcard access (Admin/Client)
  return allowedPages.includes(pageId);
};

/**
 * Check if user has access to a category (parent item with children)
 * User has access if they can access the category itself OR any of its children
 * @param item - The sidebar item (category) to check
 * @param allowedPages - Array of allowed page IDs for the user
 * @returns boolean indicating if user has access to category
 */
const hasAccessToCategory = (item: any, allowedPages: string[]): boolean => {
  if (!allowedPages || allowedPages.length === 0) return false;
  if (allowedPages.includes('*')) return true; // Wildcard access
  
  // Check if user has direct access to category page
  if (allowedPages.includes(item.id)) return true;
  if (item.page && allowedPages.includes(item.page)) return true;
  
  // Check if user has access to any child page
  if (item.children && item.children.length > 0) {
    return item.children.some((child: any) => 
      hasAccessToPage(child.id, allowedPages) || 
      (child.page && hasAccessToPage(child.page, allowedPages))
    );
  }
  
  return false;
};

/**
 * Filter sidebar items based on user permissions
 * @param items - Array of sidebar items to filter
 * @param allowedPages - Array of allowed page IDs for the user
 * @param isLoggedIn - Whether user is logged in
 * @returns Filtered array of sidebar items based on permissions
 */
const filterSidebarItems = (items: any[], allowedPages: string[], isLoggedIn: boolean): any[] => {
  // Non-logged-in users see everything (public transparency)
  if (!isLoggedIn) {
    return items.filter(item => item.type !== 'divider');
  }
  
  // Logged-in users without allowedPages see nothing
  if (!allowedPages || allowedPages.length === 0) {
    return [];
  }
  
  return items
    .filter(item => {
      // Skip dividers
      if (item.type === 'divider') return false;
      
      // For pages without children, check direct access
      if (item.type === 'page' && !item.children) {
        return hasAccessToPage(item.id, allowedPages) || 
               (item.page && hasAccessToPage(item.page, allowedPages));
      }
      
      // For categories or items with children, check category access
      if (item.type === 'category' || item.children) {
        return hasAccessToCategory(item, allowedPages);
      }
      
      // Default: check page access
      return hasAccessToPage(item.id, allowedPages) || 
             (item.page && hasAccessToPage(item.page, allowedPages));
    })
    .map(item => {
      // If item has children, filter them based on permissions
      if (item.children && item.children.length > 0) {
        const filteredChildren = item.children.filter((child: any) => 
          hasAccessToPage(child.id, allowedPages) || 
          (child.page && hasAccessToPage(child.page, allowedPages))
        );
        
        return {
          ...item,
          children: filteredChildren
        };
      }
      return item;
    });
};

// ============================================
// Main Component
// ============================================

function ResponsiveSidebar({ 
  currentPage, 
  onPageChange, 
  userRole, 
  userProfile, 
  onSignOut, 
  onLoginClick, 
  isLoggedIn, 
  collapsed,
  onToggleCollapse
}: ResponsiveSidebarProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      
      // Auto-close mobile menu when switching to desktop
      if (!mobile && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    
    // Initial check
    checkMobile();
    
    // Add resize listener with debounce
    let timeoutId: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkMobile, 100);
    };
    
    window.addEventListener('resize', debouncedResize);
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(timeoutId);
    };
  }, [mobileMenuOpen]);

  const handlePageChange = (page: string) => {
    onPageChange(page);
    
    // Close mobile menu after navigation
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  const handleToggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Sidebar content component (shared between desktop and mobile)
  const SidebarContent = ({ isMobileView = false }: { isMobileView?: boolean }) => {
    // Extract allowedPages from userProfile
    const allowedPages = isLoggedIn && userProfile?.allowedPages ? userProfile.allowedPages : [];
    
    // Filter sidebar items based on RBAC
    const filteredNavigationItems = filterSidebarItems(sidebarConfig, allowedPages, isLoggedIn);
    const filteredAdminItems = filterSidebarItems(adminSidebarItems, allowedPages, isLoggedIn);
    
    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <SidebarHeader 
          collapsed={!isMobileView && collapsed}
          onToggleCollapse={isMobileView ? handleToggleMobileMenu : onToggleCollapse}
        />

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {(!collapsed || isMobileView) && filteredNavigationItems.length > 0 && (
            <div className="px-6 pt-6 pb-3">
              <h2 className="sidebar-section-header">
                NAVIGATION
              </h2>
            </div>
          )}
          
          {filteredNavigationItems.length > 0 && (
            <div className="space-y-0.5 px-3">
              {filteredNavigationItems.map((item) => (
                <SidebarMenuItem 
                  key={item.id}
                  item={item}
                  level={0}
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                  userRole={userRole}
                  isLoggedIn={isLoggedIn}
                  collapsed={!isMobileView && collapsed}
                />
              ))}
            </div>
          )}

          {/* Administration Section */}
          {isLoggedIn && filteredAdminItems.length > 0 && (
            <>
              {(!collapsed || isMobileView) && (
                <div className="px-6 pt-8 pb-3">
                  <h2 className="sidebar-section-header">
                    ADMINISTRATION
                  </h2>
                </div>
              )}
              <div className="space-y-0.5 px-3">
                {filteredAdminItems.map((item) => (
                  <SidebarMenuItem 
                    key={item.id}
                    item={item}
                    level={0}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                    userRole={userRole}
                    isLoggedIn={isLoggedIn}
                    collapsed={!isMobileView && collapsed}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* User Section */}
        <SidebarUserSection
          isLoggedIn={isLoggedIn}
          userProfile={userProfile}
          collapsed={!isMobileView && collapsed}
          onSignOut={onSignOut}
          onLoginClick={onLoginClick}
        />
      </div>
    );
  };

  return (
    <>
      {/* Mobile Burger Menu Button */}
      {isMobile && (
        <div className="fixed top-4 left-4 z-50 lg:hidden mobile-sidebar-trigger">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="bg-white border-gray-200 shadow-lg hover:bg-gray-50 transition-all duration-200"
                onClick={handleToggleMobileMenu}
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </Button>
            </SheetTrigger>
            <SheetContent 
              side="left" 
              className="w-80 p-0 bg-white border-r border-gray-200 shadow-xl"
            >
              <SidebarContent isMobileView={true} />
            </SheetContent>
          </Sheet>
        </div>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <div className={cn(
          "fixed left-0 top-0 h-full bg-white border-r border-gray-200 flex flex-col z-40 shadow-lg transition-all duration-300 sidebar-formal sidebar-shadow",
          collapsed ? "w-16" : "w-80"
        )}>
          <SidebarContent />
        </div>
      )}
    </>
  );
}

// Export as the main component
export function ResponsiveSidebarWithProvider(props: ResponsiveSidebarProps) {
  return <ResponsiveSidebar {...props} />;
}

// For backward compatibility
export { ResponsiveSidebarWithProvider as ResponsiveSidebar };