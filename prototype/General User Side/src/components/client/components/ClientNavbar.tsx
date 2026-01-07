import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { Button } from "../../ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "../../ui/sheet";
import { Badge } from "../../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import {
  Building2,
  GraduationCap,
  Wrench,
  Users,
  Download,
  Menu,
  LogIn,
  Home,
  ChevronDown,
  X,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { ClientAuthModal } from "./ClientAuthModal";
import { toast } from "sonner@2.0.3";
import { UserProfile } from "../../../hooks/useAppState";
import { NavigationCategory, NavigationProps } from "../types";

interface ClientNavbarProps
  extends Omit<NavigationProps, "userProfile"> {
  userProfile?: UserProfile | null;
}

export function ClientNavbar({
  onNavigate,
  onSignIn,
  onSignOut,
  onNavigateToDashboard,
  onAuthModalSignIn,
  userProfile,
  demoMode = false,
}: ClientNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<
    string | null
  >(null);
  const navRef = useRef<HTMLElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Navigation categories configuration - Separated About Us and University Operations
  const navigationCategories: NavigationCategory[] = [
    {
      id: "about-us",
      title: "About Us",
      icon: Users,
      description:
        "PMO information, personnel, and organizational details",
      sections: [
        {
          category: "About Us",
          page: "client-about-us",
          icon: Users,
          subsections: [
            {
              title: "Personnel & Organization Chart",
              section: "personnel-org-chart",
            },
            {
              title: "Office Objectives",
              section: "office-objectives",
            },
            {
              title: "Contact Information",
              section: "contact",
            },
          ],
        },
      ],
    },
    {
      id: "university-operations",
      title: "University Operations",
      icon: GraduationCap,
      description:
        "Academic programs, research, and extension services",
      sections: [
        {
          category: "University Operations",
          page: "client-university-operations",
          icon: GraduationCap,
          subsections: [
            {
              title: "Higher Education Programs",
              section: "higher-education",
            },
            {
              title: "Advanced Education Programs",
              section: "advanced-education",
            },
            {
              title: "Research Programs",
              section: "research-programs",
            },
            {
              title: "Extension Services",
              section: "extension-services",
            },
          ],
        },
      ],
    },
    {
      id: "infrastructure-facilities",
      title: "Infrastructure & Facilities",
      icon: Building2,
      description:
        "Construction projects, facilities assessment, and repairs",
      sections: [
        {
          category: "Construction of Infrastructure",
          page: "client-construction-infrastructure",
          icon: Building2,
          subsections: [
            {
              title: "Overview",
              section: "overview",
            },
            {
              title: "GAA Funded Projects",
              section: "gaa-funded",
            },
            {
              title: "Locally Funded Projects",
              section: "locally-funded",
            },
            {
              title: "Special Grants & Partnerships",
              section: "special-grants",
            },
          ],
        },
        {
          category: "Repairs",
          page: "client-repairs",
          icon: Wrench,
          subsections: [
            {
              title: "Overview",
              section: "overview",
            },
            {
              title: "Classroom Facilities",
              section: "classroom-facilities",
            },
            {
              title: "Administrative Offices",
              section: "administrative-offices",
            },
          ],
        },
      ],
    },
    {
      id: "reports-resources",
      title: "Reports & Resources",
      icon: Download,
      description:
        "Gender parity reports, policies, forms, and resources",
      sections: [
        {
          category: "GAD Parity & Knowledge Management",
          page: "client-gad-parity",
          icon: Users,
          subsections: [
            {
              title: "Overview",
              section: "overview",
            },
            {
              title: "Gender Parity Analysis",
              section: "gender-parity",
            },
            {
              title: "Knowledge Resources",
              section: "knowledge-resources",
            },
            {
              title: "Accomplishments",
              section: "accomplishments",
            },
          ],
        },
        {
          category: "Downloadable Forms",
          page: "client-forms",
          icon: Download,
          subsections: [
            {
              title: "Forms Catalog",
              section: "forms-catalog",
            },
            {
              title: "Categories",
              section: "categories",
            },
          ],
        },
        {
          category: "Policies & Agreements",
          page: "client-policies",
          icon: Download,
          subsections: [
            {
              title: "Overview",
              section: "overview",
            },
            {
              title: "MOA Documents",
              section: "memorandum-agreements",
            },
            {
              title: "MOU Documents",
              section: "memorandum-understanding",
            },
          ],
        },
        {
          category: "Classroom & Administrative Office",
          page: "client-class-admin-room",
          icon: Building2,
          subsections: [
            {
              title: "Overview",
              section: "overview",
            },
            {
              title: "Classroom Facilities Assessment",
              section: "classroom-facilities-assessment",
            },
            {
              title: "Administrative Facilities Assessment",
              section: "administrative-facilities-assessment",
            },
            {
              title: "Prioritization Assessment Form",
              section: "prioritization-assessment-form",
            },
            {
              title: "Reports and Insights",
              section: "reports-insights",
            },
          ],
        },
        {
          category: "Others",
          page: "client-others",
          icon: Download,
          subsections: [
            { title: "Resources", section: "resources" },
          ],
        },
      ],
    },
  ];

  // Enhanced navigation handlers with immediate dropdown closure and smooth transitions
  const handleNavigation = (page: string, section?: string) => {
    console.log("🚀 ClientNavbar - Navigation triggered:", {
      page,
      section,
    });

    // Immediate UI feedback - close dropdowns and mobile menu instantly
    setActiveDropdown(null);
    setMobileMenuOpen(false);

    // Clear any existing timeout to prevent conflicts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Use requestAnimationFrame for smooth navigation
    requestAnimationFrame(() => {
      // Always pass both page and section to the navigation handler
      // Let the useAppState handle the proper routing logic
      if (section) {
        console.log("📍 Navigating with section:", {
          page,
          section,
        });
        onNavigate?.(page, section);
      } else {
        console.log("📍 Navigating to page:", page);
        onNavigate?.(page);
      }
    });
  };

  // Optimized dropdown management with better performance
  const handleDropdownEnter = useCallback(
    (categoryId: string) => {
      // Clear any existing timeout immediately
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      // Use requestAnimationFrame for smooth dropdown opening
      requestAnimationFrame(() => {
        setActiveDropdown(categoryId);
      });
    },
    [],
  );

  const handleDropdownLeave = useCallback(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    // Set a shorter timeout for more responsive dropdown closing
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
      timeoutRef.current = null;
    }, 100); // Reduced from 150ms to 100ms for better responsiveness
  }, []);

  // Authentication handler
  const handleSignInClick = () => {
    if (onAuthModalSignIn) {
      setShowAuthModal(true);
    } else if (onSignIn) {
      onSignIn();
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        navRef.current &&
        !navRef.current.contains(event.target as Node)
      ) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <nav ref={navRef} className="client-navbar">
        <div className="client-navbar-container">
          {/* Logo Section */}
          <div className="client-navbar-logo">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleNavigation("home");
              }}
              className="client-navbar-logo-content"
            >
              <div className="client-navbar-icon">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div className="client-navbar-text">
                <div className="client-navbar-title">
                  CSU PMO
                </div>
                <div className="client-navbar-subtitle">
                  Monitoring & Evaluation
                </div>
              </div>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="client-navbar-desktop">
            {/* Home Button */}
            <Button
              variant="ghost"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleNavigation("home");
              }}
              className="text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-2 text-sm font-medium transition-colors h-9"
            >
              <Home className="mr-2 h-4 w-4" />
              Home
            </Button>

            {/* Category Navigation with Custom Dropdowns */}
            {navigationCategories.map((category) => (
              <div
                key={category.id}
                className="client-navbar-dropdown"
                onMouseEnter={() =>
                  handleDropdownEnter(category.id)
                }
                onMouseLeave={handleDropdownLeave}
              >
                <button
                  className={`client-navbar-trigger ${activeDropdown === category.id ? "active" : ""}`}
                >
                  <category.icon className="h-4 w-4" />
                  <span>{category.title}</span>
                  <ChevronDown className="h-3 w-3 opacity-60" />
                </button>

                {/* Enhanced Dropdown Content */}
                <div
                  className={`client-navbar-dropdown-content ${activeDropdown === category.id ? "show" : ""}`}
                >
                  <div className="p-4">
                    {" "}
                    {/* Reduced padding from p-6 to p-4 */}
                    {/* Compact Category Header */}
                    <div className="mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                      {" "}
                      {/* Reduced margins */}
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 flex items-center text-base">
                        {" "}
                        {/* Reduced text size */}
                        <div className="w-6 h-6 bg-emerald-100 rounded-md flex items-center justify-center mr-2">
                          {" "}
                          {/* Smaller icon container */}
                          <category.icon className="h-3 w-3 text-emerald-600" />
                        </div>
                        <span className="truncate">
                          {category.title}
                        </span>{" "}
                        {/* Added truncate for overflow */}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed ml-8 line-clamp-2">
                        {" "}
                        {/* Smaller text and line clamp */}
                        {category.description}
                      </p>
                    </div>
                    {/* Compact Section Links */}
                    <div className="space-y-3">
                      {" "}
                      {/* Reduced spacing */}
                      {category.sections.map(
                        (section, sectionIndex) => (
                          <div
                            key={sectionIndex}
                            className="space-y-2" /* Reduced spacing */
                          >
                            {/* Compact Section Header - Clickable */}
                            <div
                              className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer group"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleNavigation(section.page);
                              }}
                            >
                              {" "}
                              {/* Made entire header clickable */}
                              <div className="font-medium text-gray-900 dark:text-gray-100 flex items-center text-xs group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                                {" "}
                                {/* Added hover effect */}
                                <div className="w-4 h-4 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-600 flex items-center justify-center mr-2 group-hover:border-emerald-300 dark:group-hover:border-emerald-500 transition-colors">
                                  {" "}
                                  {/* Added hover effect */}
                                  <section.icon className="h-2 w-2 text-emerald-600" />
                                </div>
                                <span className="truncate max-w-[120px]">
                                  {section.category}
                                </span>{" "}
                                {/* Truncate with max width */}
                              </div>
                              <div className="text-xs text-emerald-600 group-hover:text-emerald-700 font-medium px-1.5 py-0.5 rounded hover:bg-emerald-50 transition-colors whitespace-nowrap">
                                {" "}
                                {/* Changed to div, keeping visual consistency */}
                                View All →
                              </div>
                            </div>

                            {/* Compact Section Subsections */}
                            <div className="ml-3 space-y-0.5">
                              {" "}
                              {/* Reduced margins and spacing */}
                              {section.subsections.map(
                                (
                                  subsection,
                                  subsectionIndex,
                                ) => (
                                  <button
                                    key={subsectionIndex}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleNavigation(
                                        section.page,
                                        subsection.section,
                                      );
                                    }}
                                    className="w-full text-left px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-700 dark:hover:text-emerald-400 rounded-md transition-all duration-150 border border-transparent hover:border-emerald-200 dark:hover:border-emerald-600 flex items-center" /* Smaller padding and text */
                                  >
                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 mr-2 flex-shrink-0"></div>{" "}
                                    {/* Smaller dot */}
                                    <span className="font-medium truncate">
                                      {subsection.title}
                                    </span>{" "}
                                    {/* Added truncate */}
                                  </button>
                                ),
                              )}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {userProfile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <div className="w-8 h-8 bg-emerald-600 dark:bg-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {userProfile.name?.[0] ||
                        userProfile.email[0].toUpperCase()}
                    </div>
                    <div className="hidden sm:flex sm:flex-col sm:items-start">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {userProfile.name || "User"}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {userProfile.role || "Client"}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56"
                >
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {userProfile.name || "User"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {userProfile.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onNavigate?.("dashboard")}
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onNavigate?.("profile")}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Profile Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={onSignOut}
                    className="text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={handleSignInClick}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
              >
                <LogIn className="mr-1.5 h-4 w-4" />
                Sign In
              </Button>
            )}

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <Sheet
                open={mobileMenuOpen}
                onOpenChange={setMobileMenuOpen}
              >
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                  >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">
                      Open mobile menu
                    </span>
                  </Button>
                </SheetTrigger>

                <SheetContent
                  side="right"
                  className="client-mobile-sheet p-0 bg-white dark:bg-gray-900"
                >
                  {/* Mobile Header */}
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-emerald-50 to-amber-50 dark:from-emerald-950/50 dark:to-amber-950/50">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-amber-600 rounded-lg flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h2 className="font-bold text-gray-900 dark:text-gray-100">
                          CSU PMO
                        </h2>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Monitoring & Evaluation
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Navigation */}
                  <div className="p-6 space-y-6 max-h-[calc(100vh-120px)] overflow-y-auto">
                    {/* Home Button */}
                    <Button
                      variant="ghost"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleNavigation("home");
                      }}
                      className="w-full justify-start text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 p-3 h-auto"
                    >
                      <Home className="mr-3 h-5 w-5" />
                      <span className="font-medium">Home</span>
                    </Button>

                    {/* Mobile Categories */}
                    {navigationCategories.map((category) => (
                      <div
                        key={category.id}
                        className="space-y-3"
                      >
                        {/* Main Category Header */}
                        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <category.icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                            {category.title}
                          </h3>
                        </div>

                        {/* Section Links */}
                        <div className="space-y-2">
                          {category.sections.map(
                            (section, sectionIndex) => (
                              <div
                                key={sectionIndex}
                                className="space-y-2"
                              >
                                {/* Section Header */}
                                <Button
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleNavigation(
                                      section.page,
                                    );
                                  }}
                                  className="w-full justify-start text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 font-medium p-3 h-auto border border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-600"
                                >
                                  <section.icon className="mr-3 h-5 w-5" />
                                  <div className="text-left flex-1">
                                    <div className="font-medium">
                                      {section.category}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                      {
                                        section.subsections
                                          .length
                                      }{" "}
                                      sections
                                    </div>
                                  </div>
                                </Button>

                                {/* Subsection Links */}
                                <div className="ml-8 space-y-1">
                                  {section.subsections.map(
                                    (
                                      subsection,
                                      subsectionIndex,
                                    ) => (
                                      <Button
                                        key={subsectionIndex}
                                        variant="ghost"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          handleNavigation(
                                            section.page,
                                            subsection.section,
                                          );
                                        }}
                                        className="w-full justify-start text-sm text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-50 dark:hover:bg-gray-800 p-2 h-auto"
                                      >
                                        <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 mr-3 flex-shrink-0"></div>
                                        <span className="text-left">
                                          {subsection.title}
                                        </span>
                                      </Button>
                                    ),
                                  )}
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>

      {/* Authentication Modal - Compact center-aligned popup */}
      {showAuthModal && (
        <ClientAuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            setShowAuthModal(false);
            toast.success("Successfully signed in!", {
              duration: 2000,
            });
          }}
          onSignIn={onAuthModalSignIn}
          demoMode={demoMode}
        />
      )}
    </>
  );
}