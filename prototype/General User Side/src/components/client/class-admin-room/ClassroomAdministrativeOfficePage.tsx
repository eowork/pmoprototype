import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Progress } from "../../ui/progress";
import { Separator } from "../../ui/separator";
import {
  Building2,
  Users,
  CheckSquare,
  BarChart3,
  ClipboardList,
  Target,
  Settings,
  MapPin,
  TrendingUp,
  Eye,
  Shield,
  Award,
  FileText,
  School,
  Star,
  CheckCircle,
  Briefcase,
} from "lucide-react";
import { ClientNavbar } from "../components/ClientNavbar";
import { NavigationProps } from "../types";


interface ClassroomAdministrativeOfficePageProps
  extends NavigationProps {
  currentSection?: string;
}

export default function ClassroomAdministrativeOfficePage({
  onNavigate,
  onSignIn,
  onSignOut,
  onNavigateToDashboard,
  onAuthModalSignIn,
  userRole = "Client",
  userProfile,
  requireAuth,
  currentSection,
  demoMode = false,
}: ClassroomAdministrativeOfficePageProps) {
  const [activeSection, setActiveSection] =
    useState("overview");
  const [isScrolling, setIsScrolling] = useState(false);
  const stickyNavRef = useRef<HTMLDivElement>(null);

  // Navigation sections for Classroom & Administrative Office - Simple and intuitive for general users
  const navigationSections = [
    { id: "overview", label: "Overview", icon: Eye },
    {
      id: "classroom-facilities",
      label: "Classroom Facilities",
      icon: School,
    },
    {
      id: "administrative-offices",
      label: "Administrative Offices",
      icon: Building2,
    },
    {
      id: "improvements",
      label: "Ongoing Improvements",
      icon: Target,
    },
    {
      id: "assessment-standards",
      label: "Quality Standards",
      icon: CheckSquare,
    },
  ];

  const scrollToSection = (
    sectionId: string,
    fromButton = false,
  ) => {
    console.log(
      "🎯 Classroom Admin - Enhanced scrolling to section:",
      sectionId,
      fromButton ? "(from button)" : "(from navigation)",
    );

    // Immediate visual feedback for better UX
    if (fromButton) {
      setActiveSection(sectionId);
    }

    // Enhanced scroll function with enterprise-grade reliability
    const performEnhancedScroll = () => {
      const element = document.getElementById(sectionId);

      if (!element) {
        console.warn(
          "❌ Classroom Admin - Target element not found:",
          sectionId,
        );
        // Fallback: scroll to top and set overview as active
        window.scrollTo({ top: 0, behavior: "smooth" });
        setActiveSection("overview");
        return;
      }

      console.log(
        "✅ Classroom Admin - Target element found:",
        sectionId,
      );

      // Get all sticky navigation elements with more precision
      const clientNavbar =
        document.querySelector(".client-navbar") ||
        document.querySelector('[class*="client-navbar"]');
      const stickyNav =
        document.querySelector("[data-sticky-nav]") ||
        document.querySelector(".sticky.top-16") ||
        document.querySelector('[class*="sticky"]');

      // Dynamic offset calculation with safety margins
      let totalOffset = 30; // Increased base padding for better visual spacing

      if (clientNavbar) {
        const navHeight =
          clientNavbar.getBoundingClientRect().height;
        totalOffset += navHeight;
        console.log(
          "📏 Classroom Admin - Client navbar height:",
          navHeight,
        );
      }

      if (stickyNav && stickyNav !== clientNavbar) {
        const stickyHeight =
          stickyNav.getBoundingClientRect().height;
        totalOffset += stickyHeight;
        console.log(
          "📏 Classroom Admin - Sticky nav height:",
          stickyHeight,
        );
      }

      console.log(
        "📏 Classroom Admin - Total offset calculated:",
        totalOffset,
      );

      // Get element position and calculate scroll target
      const elementRect = element.getBoundingClientRect();
      const elementTop = elementRect.top + window.pageYOffset;
      const targetScrollPosition = elementTop - totalOffset;

      console.log("🎯 Classroom Admin - Scroll calculation:", {
        elementTop,
        totalOffset,
        targetScrollPosition,
        currentScroll: window.pageYOffset,
      });

      // Perform smooth scroll with visual feedback
      setIsScrolling(true);

      window.scrollTo({
        top: Math.max(0, targetScrollPosition), // Ensure we don't scroll to negative position
        behavior: "smooth",
      });

      // Set active section after scroll animation
      setTimeout(() => {
        setActiveSection(sectionId);
        setIsScrolling(false);

        // Add brief highlight effect to target section
        element.classList.add("section-highlight");
        setTimeout(() => {
          element.classList.remove("section-highlight");
        }, 1000);

        console.log(
          "✅ Classroom Admin - Scroll completed to section:",
          sectionId,
        );
      }, 700); // Slightly longer to ensure smooth animation completion
    };

    // Execute scroll with small delay for better UX
    setTimeout(performEnhancedScroll, 50);
  };

  // Handle section visibility detection during scroll
  useEffect(() => {
    const handleScroll = () => {
      if (isScrolling) return; // Don't update active section during programmatic scroll

      const sections = navigationSections.map(
        (section) => section.id,
      );
      const scrollPosition = window.scrollY + 200; // Offset for better detection

      for (let i = sections.length - 1; i >= 0; i--) {
        const element = document.getElementById(sections[i]);
        if (element && element.offsetTop <= scrollPosition) {
          if (activeSection !== sections[i]) {
            setActiveSection(sections[i]);
          }
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });
    return () =>
      window.removeEventListener("scroll", handleScroll);
  }, [activeSection, isScrolling, navigationSections]);

  // Scroll to section on mount if currentSection is provided
  useEffect(() => {
    if (
      currentSection &&
      navigationSections.some(
        (nav) => nav.id === currentSection,
      )
    ) {
      setTimeout(() => {
        scrollToSection(currentSection, true);
      }, 300);
    }
  }, [currentSection]);

  // Enhanced data structure for Classroom & Administrative Office overview
  const facilityOverviewData = {
    statistics: {
      totalSpaces: 192,
      classrooms: 145,
      adminOffices: 47,
      assessmentCompletion: 94.3,
      overallRating: 4.2,
      lastAssessment: "December 2024",
    },
    campuses: [
      {
        name: "Main Campus - Ampayon",
        classrooms: 98,
        adminOffices: 32,
        totalCapacity: 4680,
        utilization: 89.2,
        condition: "Excellent",
        recentUpgrades: 12,
      },
      {
        name: "Cabadbaran Campus",
        classrooms: 47,
        adminOffices: 15,
        totalCapacity: 2240,
        utilization: 76.8,
        condition: "Good",
        recentUpgrades: 8,
      },
    ],
    featuredHighlights: [
      {
        title: "Modern Learning Environments",
        description:
          "State-of-the-art classrooms equipped with digital learning tools and comfortable seating arrangements.",
        icon: School,
        color: "emerald",
        metric: "145 Classrooms",
      },
      {
        title: "Efficient Administrative Spaces",
        description:
          "Well-organized office spaces designed for optimal productivity and student service delivery.",
        icon: Building2,
        color: "blue",
        metric: "47 Office Spaces",
      },
      {
        title: "Continuous Assessment",
        description:
          "Regular evaluation and improvement of facilities to maintain high standards and functionality.",
        icon: CheckSquare,
        color: "purple",
        metric: "94.3% Completion",
      },
      {
        title: "Strategic Planning",
        description:
          "Data-driven prioritization matrix for facility improvements and resource allocation.",
        icon: Target,
        color: "amber",
        metric: "4.2/5.0 Rating",
      },
    ],
  };

  // Simplified Improvements Data - Easy to understand for general users
  const improvementData = {
    overview: {
      activeProjects: 12,
      totalInvestment: "₱3.2 Million",
      expectedBeneficiaries: "2,100+ students, faculty, and staff",
      completionPeriod: "2024-2025"
    },
    currentProjects: [
      {
        title: "Science Laboratory Upgrades",
        campus: "Main Campus",
        description: "Modern equipment and safety improvements for science laboratories",
        timeline: "Ongoing",
        benefit: "Enhanced learning experience for science students"
      },
      {
        title: "Digital Office Systems",
        campus: "Both Campuses",
        description: "Updated computer systems and software for faster student services",
        timeline: "Next 6 months",
        benefit: "Reduced waiting time for student transactions"
      },
      {
        title: "Accessibility Improvements",
        campus: "Cabadbaran Campus",
        description: "Ramps, elevators, and accessible facilities for all students",
        timeline: "In Progress",
        benefit: "Inclusive access for students with disabilities"
      },
      {
        title: "Classroom Comfort Upgrades",
        campus: "Main Campus",
        description: "Better lighting, ventilation, and furniture in classrooms",
        timeline: "Planning Phase",
        benefit: "More comfortable learning environment"
      }
    ]
  };

  const assessmentStandards = [
    {
      category: "Physical Condition",
      description:
        "Structural integrity, cleanliness, and maintenance standards",
      criteria: [
        "Building structure and safety compliance",
        "Cleanliness and hygiene standards",
        "Maintenance and repair status",
        "Accessibility features and compliance",
      ],
      weight: 25,
    },
    {
      category: "Learning Environment",
      description:
        "Factors that contribute to effective teaching and learning",
      criteria: [
        "Lighting and ventilation adequacy",
        "Noise levels and acoustics",
        "Temperature control and comfort",
        "Furniture arrangement and ergonomics",
      ],
      weight: 30,
    },
    {
      category: "Technology Integration",
      description:
        "Digital infrastructure and technological capabilities",
      criteria: [
        "Audio-visual equipment availability",
        "Internet connectivity and speed",
        "Computer and device compatibility",
        "Technical support accessibility",
      ],
      weight: 25,
    },
    {
      category: "Resource Availability",
      description:
        "Essential resources and materials for effective operations",
      criteria: [
        "Educational materials and supplies",
        "Storage and organization systems",
        "Office equipment and tools",
        "Emergency preparedness resources",
      ],
      weight: 20,
    },
  ];



  const formatPercentage = (value: number) =>
    `${value.toFixed(1)}%`;
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Helper functions for priority and status styling
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'High': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'Planning Phase': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Design Phase': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Under Review': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Deferred': return 'bg-slate-100 text-slate-800 border-slate-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <ClientNavbar
        onNavigate={onNavigate}
        onSignIn={onSignIn}
        onSignOut={onSignOut}
        onNavigateToDashboard={onNavigateToDashboard}
        onAuthModalSignIn={onAuthModalSignIn}
        userProfile={userProfile}
        demoMode={demoMode}
      />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-50 via-white to-blue-50 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center space-x-4 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                  Classroom & Administrative Facilities
                </h1>
                <p className="text-xl text-gray-600 mt-2">
                  Excellence in Educational Infrastructure
                  Management
                </p>
              </div>
            </div>

            <p className="text-lg text-gray-700 max-w-4xl mx-auto leading-relaxed">
              Comprehensive assessment and management of
              classroom and administrative facilities at Caraga
              State University, ensuring optimal learning
              environments and efficient workspace utilization
              across all campus locations.
            </p>

            <div className="flex items-center justify-center space-x-8 text-sm text-gray-600 bg-white/60 backdrop-blur-sm rounded-lg p-4 max-w-2xl mx-auto">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>
                  Updated{" "}
                  {
                    facilityOverviewData.statistics
                      .lastAssessment
                  }
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-blue-600" />
                <span>
                  {facilityOverviewData.statistics.totalSpaces}{" "}
                  Total Spaces
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-amber-600" />
                <span>
                  {
                    facilityOverviewData.statistics
                      .overallRating
                  }
                  /5.0 Rating
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Navigation - Centered */}
      <section 
        ref={stickyNavRef}
        data-sticky-nav="classroom-admin"
        className="py-6 px-4 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm sticky top-16 z-30"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-3 justify-center">
            {navigationSections.map((section) => (
              <Button
                key={section.id}
                variant={activeSection === section.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  console.log('🖱️ Classroom Admin - Enhanced navigation button clicked:', section.id);
                  
                  // Immediate visual feedback for responsiveness
                  setActiveSection(section.id);
                  
                  // Execute scroll with proper timing
                  requestAnimationFrame(() => {
                    setTimeout(() => scrollToSection(section.id, true), 16);
                  });
                }}
                className={`transition-all duration-200 ${
                  activeSection === section.id
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                    : 'border-gray-200 hover:bg-emerald-50 hover:border-emerald-200 text-gray-700'
                }`}
              >
                <section.icon className="h-4 w-4 mr-2" />
                {section.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Overview Section */}
        <section id="overview" className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-gray-900">
              Overview & Statistics
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Comprehensive overview of our classroom and
              administrative facility management, showcasing key
              metrics and performance indicators.
            </p>
          </div>

          {/* Key Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-emerald-700 mb-1">
                  {facilityOverviewData.statistics.totalSpaces}
                </div>
                <div className="text-sm text-emerald-600">
                  Total Spaces
                </div>
                <div className="text-xs text-emerald-500 mt-1">
                  {facilityOverviewData.statistics.classrooms}{" "}
                  classrooms,{" "}
                  {facilityOverviewData.statistics.adminOffices}{" "}
                  offices
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-blue-600 rounded-lg flex items-center justify-center">
                  <CheckSquare className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-blue-700 mb-1">
                  {formatPercentage(
                    facilityOverviewData.statistics
                      .assessmentCompletion,
                  )}
                </div>
                <div className="text-sm text-blue-600">
                  Assessment Complete
                </div>
                <div className="text-xs text-blue-500 mt-1">
                  Comprehensive evaluation
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-purple-700 mb-1">
                  {
                    facilityOverviewData.statistics
                      .overallRating
                  }
                </div>
                <div className="text-sm text-purple-600">
                  Overall Rating
                </div>
                <div className="text-xs text-purple-500 mt-1">
                  Out of 5.0
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-amber-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-amber-700 mb-1">
                  89.5%
                </div>
                <div className="text-sm text-amber-600">
                  Utilization Rate
                </div>
                <div className="text-xs text-amber-500 mt-1">
                  Current average
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Campus Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {facilityOverviewData.campuses.map(
              (campus, index) => (
                <Card
                  key={index}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center space-x-2">
                        <MapPin className="h-5 w-5 text-emerald-600" />
                        <span>{campus.name}</span>
                      </span>
                      <Badge
                        variant={
                          campus.condition === "Excellent"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {campus.condition}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="space-y-1">
                        <div className="text-2xl font-bold text-emerald-600">
                          {campus.classrooms}
                        </div>
                        <div className="text-sm text-gray-600">
                          Classrooms
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-2xl font-bold text-blue-600">
                          {campus.adminOffices}
                        </div>
                        <div className="text-sm text-gray-600">
                          Offices
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-2xl font-bold text-purple-600">
                          {campus.totalCapacity.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">
                          Capacity
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Utilization Rate</span>
                        <span className="font-medium">
                          {formatPercentage(campus.utilization)}
                        </span>
                      </div>
                      <Progress
                        value={campus.utilization}
                        className="h-2"
                      />
                    </div>

                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      <span className="font-medium">
                        {campus.recentUpgrades}
                      </span>{" "}
                      recent upgrades completed this year
                    </div>
                  </CardContent>
                </Card>
              ),
            )}
          </div>
        </section>

        {/* Classroom Facilities Section */}
        <section
          id="classroom-facilities"
          className="space-y-8"
        >
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-gray-900">
              Classroom Facilities
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Modern learning environments designed to support effective teaching and enhance student engagement across both CSU Main Campus and CSU Cabadbaran Campus.
            </p>
          </div>

          {/* Campus Classroom Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* CSU Main Campus */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-emerald-600" />
                  <span>CSU Main Campus - Ampayon</span>
                </CardTitle>
                <CardDescription>
                  Primary campus with comprehensive classroom facilities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-emerald-600">98</div>
                    <div className="text-sm text-gray-600">Classrooms</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-blue-600">4,680</div>
                    <div className="text-sm text-gray-600">Total Capacity</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-purple-600">89.2%</div>
                    <div className="text-sm text-gray-600">Utilization</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Facility Types</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span>Lecture Halls</span>
                      <Badge variant="outline">42</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Laboratory Rooms</span>
                      <Badge variant="outline">28</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Seminar Rooms</span>
                      <Badge variant="outline">18</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Computer Labs</span>
                      <Badge variant="outline">10</Badge>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50 p-3 rounded-lg">
                  <span className="text-sm text-emerald-700 font-medium">Status: </span>
                  <span className="text-sm text-emerald-600">Excellent condition with recent technology upgrades</span>
                </div>
              </CardContent>
            </Card>

            {/* CSU Cabadbaran Campus */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <span>CSU Cabadbaran Campus</span>
                </CardTitle>
                <CardDescription>
                  Extension campus serving northern Agusan del Norte
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-emerald-600">47</div>
                    <div className="text-sm text-gray-600">Classrooms</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-blue-600">2,240</div>
                    <div className="text-sm text-gray-600">Total Capacity</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-purple-600">76.8%</div>
                    <div className="text-sm text-gray-600">Utilization</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Facility Types</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span>Lecture Halls</span>
                      <Badge variant="outline">20</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Laboratory Rooms</span>
                      <Badge variant="outline">14</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Seminar Rooms</span>
                      <Badge variant="outline">8</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Computer Labs</span>
                      <Badge variant="outline">5</Badge>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <span className="text-sm text-blue-700 font-medium">Status: </span>
                  <span className="text-sm text-blue-600">Good condition with ongoing improvements</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Common Classroom Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <School className="h-5 w-5 text-emerald-600" />
                <span>Standard Classroom Features</span>
              </CardTitle>
              <CardDescription>
                Essential amenities and technologies available across all classroom facilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                    <Settings className="h-4 w-4 text-emerald-600" />
                    <span>Technology & Equipment</span>
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span>Digital projectors and display systems</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span>High-speed WiFi connectivity</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span>Audio-visual presentation tools</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span>Adequate power outlets for devices</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <span>Safety & Accessibility</span>
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-blue-500" />
                      <span>Emergency exit and safety systems</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-blue-500" />
                      <span>Wheelchair accessible entrances</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-blue-500" />
                      <span>Fire safety equipment and protocols</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-blue-500" />
                      <span>Proper lighting and ventilation</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                    <Award className="h-4 w-4 text-purple-600" />
                    <span>Learning Environment</span>
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-purple-500" />
                      <span>Ergonomic furniture and seating</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-purple-500" />
                      <span>Climate control systems</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-purple-500" />
                      <span>Optimized acoustics design</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-purple-500" />
                      <span>Flexible layout configurations</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Administrative Offices Section */}
        <section
          id="administrative-offices"
          className="space-y-8"
        >
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-gray-900">
              Administrative Offices
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Efficient and well-organized office spaces designed to support university operations and provide excellent service to students, faculty, and staff across both campuses.
            </p>
          </div>

          {/* Campus Administrative Office Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* CSU Main Campus Administrative Offices */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-emerald-600" />
                  <span>CSU Main Campus - Ampayon</span>
                </CardTitle>
                <CardDescription>
                  Central administrative hub with comprehensive office facilities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-emerald-600">32</div>
                    <div className="text-sm text-gray-600">Admin Offices</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-blue-600">180</div>
                    <div className="text-sm text-gray-600">Staff Members</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-purple-600">91.5%</div>
                    <div className="text-sm text-gray-600">Efficiency</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Office Types</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                      <div>
                        <span className="font-medium text-sm">Academic Services</span>
                        <div className="text-xs text-gray-600">Registrar, Student Affairs, Records</div>
                      </div>
                      <Badge variant="outline">12</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <div>
                        <span className="font-medium text-sm">Financial Services</span>
                        <div className="text-xs text-gray-600">Finance, Accounting, Budget</div>
                      </div>
                      <Badge variant="outline">6</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-purple-50 rounded">
                      <div>
                        <span className="font-medium text-sm">Executive Offices</span>
                        <div className="text-xs text-gray-600">President, VPs, Deans</div>
                      </div>
                      <Badge variant="outline">8</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-amber-50 rounded">
                      <div>
                        <span className="font-medium text-sm">Support Services</span>
                        <div className="text-xs text-gray-600">HR, IT, Maintenance</div>
                      </div>
                      <Badge variant="outline">6</Badge>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50 p-3 rounded-lg">
                  <span className="text-sm text-emerald-700 font-medium">Status: </span>
                  <span className="text-sm text-emerald-600">Excellent operational efficiency</span>
                </div>
              </CardContent>
            </Card>

            {/* CSU Cabadbaran Campus Administrative Offices */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <span>CSU Cabadbaran Campus</span>
                </CardTitle>
                <CardDescription>
                  Extension campus administrative services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-emerald-600">15</div>
                    <div className="text-sm text-gray-600">Admin Offices</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-blue-600">78</div>
                    <div className="text-sm text-gray-600">Staff Members</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-purple-600">87.2%</div>
                    <div className="text-sm text-gray-600">Efficiency</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Office Types</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                      <div>
                        <span className="font-medium text-sm">Academic Services</span>
                        <div className="text-xs text-gray-600">Campus Registrar, Student Services</div>
                      </div>
                      <Badge variant="outline">6</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <div>
                        <span className="font-medium text-sm">Financial Services</span>
                        <div className="text-xs text-gray-600">Campus Finance, Cashier</div>
                      </div>
                      <Badge variant="outline">3</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-purple-50 rounded">
                      <div>
                        <span className="font-medium text-sm">Administrative</span>
                        <div className="text-xs text-gray-600">Campus Director, Department Heads</div>
                      </div>
                      <Badge variant="outline">4</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-amber-50 rounded">
                      <div>
                        <span className="font-medium text-sm">Support Services</span>
                        <div className="text-xs text-gray-600">Campus IT, Security</div>
                      </div>
                      <Badge variant="outline">2</Badge>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <span className="text-sm text-blue-700 font-medium">Status: </span>
                  <span className="text-sm text-blue-600">Good operational efficiency</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Common Office Standards */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Briefcase className="h-5 w-5 text-purple-600" />
                <span>Office Standards & Features</span>
              </CardTitle>
              <CardDescription>
                Essential features and standards maintained across all administrative offices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Service Excellence</h4>
                  <p className="text-sm text-gray-600">
                    Dedicated client service areas with comfortable seating and professional consultation spaces.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Settings className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Technology Integration</h4>
                  <p className="text-sm text-gray-600">
                    Modern office equipment, computers, and high-speed internet for efficient operations.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Shield className="h-6 w-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Security & Privacy</h4>
                  <p className="text-sm text-gray-600">
                    Secure document storage and access control systems for sensitive information handling.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Award className="h-6 w-6 text-amber-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Workspace Efficiency</h4>
                  <p className="text-sm text-gray-600">
                    Optimized layouts with ergonomic furniture and adequate storage for productive work environments.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Ongoing Improvements Section */}
        <section
          id="improvements"
          className="space-y-8"
        >
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-gray-900">
              Ongoing Improvements
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Continuous investments in our facilities to provide better learning environments and services for students, faculty, and staff.
            </p>
          </div>

          {/* Simple Overview Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-emerald-700 mb-1">
                  {improvementData.overview.activeProjects}
                </div>
                <div className="text-sm text-emerald-600">
                  Active Projects
                </div>
                <div className="text-xs text-emerald-500 mt-1">
                  Currently in progress
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-blue-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-blue-700 mb-1">
                  {improvementData.overview.totalInvestment}
                </div>
                <div className="text-sm text-blue-600">
                  Total Investment
                </div>
                <div className="text-xs text-blue-500 mt-1">
                  {improvementData.overview.completionPeriod}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-purple-700 mb-1">
                  2,100+
                </div>
                <div className="text-sm text-purple-600">
                  Beneficiaries
                </div>
                <div className="text-xs text-purple-500 mt-1">
                  Students, faculty, staff
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Current Projects - Simplified */}
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900">Current Projects</h3>
              <p className="text-gray-600 mt-2">Key improvements happening across our campuses</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {improvementData.currentProjects.map((project, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                    <CardDescription className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-emerald-600" />
                      <span>{project.campus}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">
                      {project.description}
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="text-sm">
                        <span className="text-gray-600">Timeline: </span>
                        <span className="font-medium text-emerald-600">{project.timeline}</span>
                      </div>
                    </div>

                    <div className="bg-emerald-50 p-3 rounded-lg">
                      <div className="text-sm">
                        <span className="text-emerald-700 font-medium">Benefit: </span>
                        <span className="text-emerald-600">{project.benefit}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Simple Commitment Statement */}
          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <Award className="h-6 w-6 text-emerald-600 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Our Commitment</h4>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Caraga State University continuously invests in improving our facilities to provide the best possible 
                  learning and working environment. We prioritize projects that directly benefit our students and community, 
                  ensuring every improvement contributes to academic excellence and inclusive education.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Quality Standards Section */}
        <section
          id="assessment-standards"
          className="space-y-8"
        >
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-gray-900">
              Quality Standards
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              How we ensure our classrooms and offices meet high standards for safety, comfort, and functionality across all campus locations.
            </p>
          </div>

          {/* Assessment Criteria Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {assessmentStandards.map((standard, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader className="text-center">
                  <div className="w-12 h-12 mx-auto bg-gradient-to-br from-emerald-100 to-blue-100 rounded-lg flex items-center justify-center mb-3">
                    <CheckSquare className="h-6 w-6 text-emerald-600" />
                  </div>
                  <CardTitle className="text-lg">{standard.category}</CardTitle>
                  <Badge variant="outline" className="mx-auto">
                    {standard.weight}% Weight
                  </Badge>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    {standard.description}
                  </p>
                  <div className="space-y-2">
                    <div className="text-xs text-gray-500">Key Focus Areas:</div>
                    <div className="text-sm text-gray-700">
                      {standard.criteria.length} evaluation criteria
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Assessment Process Flow */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ClipboardList className="h-5 w-5 text-green-600" />
                <span>Assessment Process</span>
              </CardTitle>
              <CardDescription>
                Systematic approach to facility evaluation and continuous improvement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 mx-auto bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Planning</h4>
                  <p className="text-sm text-gray-600">
                    Schedule assessments and define evaluation criteria for each facility type
                  </p>
                </div>
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 mx-auto bg-green-100 rounded-lg flex items-center justify-center">
                    <Eye className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Evaluation</h4>
                  <p className="text-sm text-gray-600">
                    Conduct on-site inspections and collect comprehensive data
                  </p>
                </div>
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 mx-auto bg-purple-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Analysis</h4>
                  <p className="text-sm text-gray-600">
                    Analyze data and generate facility condition ratings
                  </p>
                </div>
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 mx-auto bg-amber-100 rounded-lg flex items-center justify-center">
                    <Target className="h-6 w-6 text-amber-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Action</h4>
                  <p className="text-sm text-gray-600">
                    Develop improvement plans and implement priority solutions
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assessment Forms Reference */}
          <Card className="bg-gradient-to-r from-blue-50 to-emerald-50 border-blue-200">
            <CardContent className="text-center p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Assessment Forms & Tools
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Standardized assessment forms and prioritization matrices are used to ensure consistent evaluation across all facilities. These tools help identify priority areas for improvement and resource allocation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <div className="flex items-center space-x-2 text-sm text-blue-600 bg-white/60 backdrop-blur-sm rounded-lg p-3">
                  <FileText className="h-4 w-4" />
                  <span>Classroom Assessment Forms</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-emerald-600 bg-white/60 backdrop-blur-sm rounded-lg p-3">
                  <ClipboardList className="h-4 w-4" />
                  <span>Office Assessment Forms</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-purple-600 bg-white/60 backdrop-blur-sm rounded-lg p-3">
                  <Target className="h-4 w-4" />
                  <span>Prioritization Matrix</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>



        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200">
          <CardContent className="text-center p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Explore More PMO Services
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Discover other aspects of our project management
              operations including construction infrastructure,
              repairs, and academic programs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() =>
                  onNavigate?.(
                    "client-construction-infrastructure",
                  )
                }
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Construction Projects
                <Building2 className="ml-2 h-4 w-4" />
              </Button>
              <Button
                onClick={() => onNavigate?.("client-repairs")}
                variant="outline"
                className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
              >
                Repairs & Maintenance
                <Settings className="ml-2 h-4 w-4" />
              </Button>
              <Button
                onClick={() =>
                  onNavigate?.("client-university-operations")
                }
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                University Operations
                <TrendingUp className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}