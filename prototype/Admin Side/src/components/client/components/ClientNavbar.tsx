import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '../../ui/navigation-menu';
import { Sheet, SheetContent, SheetTrigger } from '../../ui/sheet';
import { Badge } from '../../ui/badge';
import { 
  Building2, 
  GraduationCap, 
  Wrench, 
  Users, 
  Download, 
  Shield,
  Menu,
  LogIn,
  Home
} from 'lucide-react';

interface ClientNavbarProps {
  onNavigate?: (page: string) => void;
  onSignIn?: () => void;
}

export function ClientNavbar({ onNavigate, onSignIn }: ClientNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationCategories = [
    {
      title: 'About',
      page: 'about-us',
      icon: Users,
      description: 'Learn about PMO personnel, objectives, and contact information',
      subcategories: [
        { title: 'Personnel & Organization', page: 'personnel-org-chart', description: 'Organizational structure and team members' },
        { title: 'Office Objectives', page: 'office-objectives', description: 'PMO mission, vision, and goals' },
        { title: 'Contact Information', page: 'pmo-contact-details', description: 'Get in touch with our team' }
      ]
    },
    {
      title: 'University Operations',
      page: 'university-operations',
      icon: GraduationCap,
      description: 'Academic programs, research, and extension services',
      subcategories: [
        { title: 'Higher Education', page: 'higher-education-program', description: 'Undergraduate and graduate programs' },
        { title: 'Advanced Education', page: 'advanced-education-program', description: 'Post-graduate and specialized programs' },
        { title: 'Research Programs', page: 'research-program', description: 'Research initiatives and projects' },
        { title: 'Extension Services', page: 'technical-advisory-extension-program', description: 'Community outreach and advisory services' }
      ]
    },
    {
      title: 'Construction of Infrastructure & Repairs',
      page: 'construction',
      icon: Building2,
      description: 'Infrastructure development, construction projects, and facility repairs',
      subcategories: [
        { title: 'Construction Projects', page: 'construction-of-infrastructure', description: 'Major infrastructure development projects' },
        { title: 'Classroom & Admin Offices', page: 'classroom-administrative-offices', description: 'Campus facilities assessment and management' },
        { title: 'Repairs & Maintenance', page: 'repairs', description: 'Maintenance and repair operations across campuses' }
      ]
    },
    {
      title: 'GAD Parity',
      page: 'gad-parity',
      icon: Users,
      description: 'Gender equity reporting and data management',
      subcategories: [
        { title: 'Admission Rate Analysis', page: 'gender-parity-admission-rate', description: 'Student admission gender statistics' },
        { title: 'Graduation Rate Analysis', page: 'gender-parity-graduation-rate', description: 'Graduation gender parity analysis' },
        { title: 'GPB Accomplishments', page: 'gpb-accomplishment', description: 'Gender and Development budget performance' },
        { title: 'Budget & Planning', page: 'gad-budget-and-plans', description: 'GAD budget planning and allocation' }
      ]
    },
    {
      title: 'Others',
      page: 'others',
      icon: Download,
      description: 'Policies, forms, and additional resources',
      subcategories: [
        { title: 'Policies & Agreements', page: 'policies', description: 'Governance frameworks and institutional agreements' },
        { title: 'Downloadable Forms', page: 'forms', description: 'Official forms, checklists, and monitoring tools' }
      ]
    }
  ];

  const handleNavigation = (page: string) => {
    setMobileMenuOpen(false);
    onNavigate?.(page);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="flex h-16 items-center px-4 sm:px-6 lg:px-8">
        {/* Logo and Title - Fixed left positioning */}
        <div className="flex items-center flex-shrink-0 mr-8">
          <button 
            onClick={() => handleNavigation('home')}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-amber-600 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-gray-900 leading-tight">CSU PMO</h1>
              <p className="text-xs text-gray-600 leading-tight">Monitoring & Evaluation</p>
            </div>
          </button>
        </div>

        {/* Desktop Navigation - Centered with proper flex distribution */}
        <div className="hidden lg:flex flex-1 justify-center">
          <NavigationMenu>
            <NavigationMenuList className="flex items-center space-x-2">
              <NavigationMenuItem>
                <Button 
                  variant="ghost" 
                  onClick={() => handleNavigation('home')}
                  className="text-gray-700 hover:text-emerald-600 px-4 py-2 transition-colors"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Home
                </Button>
              </NavigationMenuItem>

              {navigationCategories.map((category, index) => (
                <NavigationMenuItem key={index}>
                  <NavigationMenuTrigger className="text-gray-700 hover:text-emerald-600 px-4 py-2 transition-colors data-[state=open]:text-emerald-600">
                    <category.icon className="mr-2 h-4 w-4" />
                    {category.title}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-80 p-6 bg-white border border-gray-200 rounded-lg shadow-lg">
                      <div className="mb-4">
                        <h3 className="font-semibold text-gray-900 mb-2">{category.title}</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">{category.description}</p>
                      </div>
                      <div className="space-y-2">
                        <NavigationMenuLink asChild>
                          <button
                            onClick={() => handleNavigation(category.page)}
                            className="w-full text-left px-4 py-3 text-sm font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors flex items-center justify-between border border-emerald-200 hover:border-emerald-300"
                          >
                            View Overview
                            <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">Main</Badge>
                          </button>
                        </NavigationMenuLink>
                        {category.subcategories.map((sub, subIndex) => (
                          <NavigationMenuLink key={subIndex} asChild>
                            <button
                              onClick={() => handleNavigation(sub.page)}
                              className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                            >
                              <div>
                                <div className="font-medium text-gray-900 mb-1">{sub.title}</div>
                                <div className="text-xs text-gray-500 leading-relaxed">{sub.description}</div>
                              </div>
                            </button>
                          </NavigationMenuLink>
                        ))}
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right Side Actions - Fixed right positioning */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          <Button 
            onClick={onSignIn}
            variant="default" 
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <LogIn className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Sign In</span>
          </Button>

          {/* Mobile Menu */}
          <div className="lg:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100 transition-colors">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open mobile menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-amber-600 rounded-lg flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-900">CSU PMO</h2>
                      <p className="text-xs text-gray-600">Monitoring & Evaluation</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 space-y-6">
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      handleNavigation('home');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full justify-start text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 p-3 h-auto"
                  >
                    <Home className="mr-3 h-5 w-5" />
                    Home
                  </Button>

                  {navigationCategories.map((category, index) => (
                    <div key={index} className="space-y-3">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          handleNavigation(category.page);
                          setMobileMenuOpen(false);
                        }}
                        className="w-full justify-start text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 font-medium p-3 h-auto"
                      >
                        <category.icon className="mr-3 h-5 w-5" />
                        {category.title}
                      </Button>
                      <div className="ml-8 space-y-2">
                        {category.subcategories.map((sub, subIndex) => (
                          <Button
                            key={subIndex}
                            variant="ghost"
                            onClick={() => {
                              handleNavigation(sub.page);
                              setMobileMenuOpen(false);
                            }}
                            className="w-full justify-start text-sm text-gray-600 hover:text-emerald-600 hover:bg-gray-50 p-2 h-auto"
                          >
                            {sub.title}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}