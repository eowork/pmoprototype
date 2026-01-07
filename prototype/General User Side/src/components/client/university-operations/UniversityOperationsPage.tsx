import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Separator } from '../../ui/separator';
import { Progress } from '../../ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Label } from '../../ui/label';
import { 
  GraduationCap, 
  BookOpen, 
  Beaker, 
  Users, 
  TrendingUp, 
  Calendar,
  Award,
  ArrowRight,
  BarChart3,
  Target,
  CheckCircle,
  Eye,
  Building2,
  FileText,
  Download,
  ExternalLink,
  Activity,
  Zap,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { ClientNavbar } from '../components/ClientNavbar';
import { NavigationProps } from '../types';

interface UniversityOperationsPageProps extends NavigationProps {
  currentSection?: string;
}

export function UniversityOperationsPage({ 
  onNavigate,
  onSignIn,
  onSignOut,
  onNavigateToDashboard,
  onAuthModalSignIn,
  userRole = 'Client',
  userProfile,
  requireAuth,
  currentSection,
  demoMode = false 
}: UniversityOperationsPageProps) {
  
  const [activeSection, setActiveSection] = useState('overview');
  const [yearFilter, setYearFilter] = useState<'all' | '2025' | '2024' | '2023'>('all');

  // Year-specific data function for filtering
  const getYearSpecificData = (year: string) => {
    const yearDataMap: Record<string, any> = {
      '2025': {
        overview: {
          totalPrograms: 72,
          activeResearch: 38,
          enrolledStudents: 13250,
          communityBeneficiaries: 9100,
          overallPerformance: 94.1,
          yearOverYearGrowth: 9.2
        },
        impactSummary: {
          educationalPrograms: {
            totalPrograms: 58,
            successRate: 93.5,
            yearOverYearGrowth: 6.1,
            target: 92.0,
            actual: 93.5
          },
          researchExcellence: {
            activeProjects: 38,
            publications: 142,
            impact: 'Very High',
            target: 35,
            actual: 38
          },
          communityEngagement: {
            extensionPrograms: 20,
            beneficiaries: 9100,
            impactRate: 93.8,
            target: 18,
            actual: 20
          },
          overallExcellence: {
            performanceRating: 94.1,
            improvementRate: 9.2,
            status: 'Exceptional',
            target: 92.0,
            actual: 94.1
          }
        },
        programs: [
          {
            id: 'higher-education',
            title: 'Higher Education Programs',
            icon: GraduationCap,
            color: 'emerald',
            description: 'Comprehensive undergraduate and graduate degree programs fostering academic excellence and professional development.',
            performance: {
              target: 95.0,
              actual: 95.8,
              variance: 0.8,
              trend: 'up',
              programs: 45,
              students: 9150,
              graduationRate: 91.2
            },
            keyIndicators: [
              { label: 'Program Completion Rate', target: 94.0, actual: 95.8, unit: '%' },
              { label: 'Employment Rate of Graduates', target: 88.0, actual: 90.2, unit: '%' },
              { label: 'Student Satisfaction Rating', target: 4.4, actual: 4.6, unit: '/5.0' },
              { label: 'Faculty-Student Ratio', target: 24, actual: 22, unit: ':1' }
            ],
            achievements: [
              'New curriculum frameworks fully implemented',
              'Global industry partnerships established',
              'Student success programs show exceptional results',
              'Quality excellence awards received'
            ]
          },
          {
            id: 'advanced-education',
            title: 'Advanced Education Programs',
            icon: BookOpen,
            color: 'blue',
            description: 'Post-graduate programs and specialized certifications designed for advanced learning and research excellence.',
            performance: {
              target: 91.0,
              actual: 91.8,
              variance: 0.8,
              trend: 'up',
              programs: 14,
              students: 2150,
              researchOutput: 82.5
            },
            keyIndicators: [
              { label: 'Graduate Faculty Research Engagement', target: 88.0, actual: 90.5, unit: '%' },
              { label: 'Research Program Enrollment', target: 78.0, actual: 82.5, unit: '%' },
              { label: 'Program Accreditation Rate', target: 85.0, actual: 87.8, unit: '%' },
              { label: 'Research Publication Index', target: 2.3, actual: 2.6, unit: 'per faculty' }
            ],
            achievements: [
              'Expanded doctoral programs in emerging fields',
              'International research collaborations strengthened',
              'Advanced research facilities established',
              'Professional excellence pathways enhanced'
            ]
          },
          {
            id: 'research-programs',
            title: 'Research Programs',
            icon: Beaker,
            color: 'purple',
            description: 'Innovation-driven research initiatives addressing regional and national development challenges.',
            performance: {
              target: 80.0,
              actual: 81.2,
              variance: 1.2,
              trend: 'up',
              programs: 38,
              researchers: 178,
              publications: 142
            },
            keyIndicators: [
              { label: 'Funded Research Projects', target: 32, actual: 38, unit: 'projects' },
              { label: 'Research Publication Rate', target: 78.0, actual: 81.2, unit: '%' },
              { label: 'Community Impact Projects', target: 18, actual: 21, unit: 'projects' },
              { label: 'Technology Transfer Success', target: 65.0, actual: 69.8, unit: '%' }
            ],
            achievements: [
              'Breakthrough sustainable development research',
              'Climate resilience programs expanded',
              'AI and digital innovation centers launched',
              'Community research networks strengthened'
            ]
          },
          {
            id: 'extension-services',
            title: 'Extension Services',
            icon: Users,
            color: 'amber',
            description: 'Community engagement programs that bridge university knowledge with societal needs and development.',
            performance: {
              target: 92.0,
              actual: 93.8,
              variance: 1.8,
              trend: 'up',
              programs: 20,
              beneficiaries: 9100,
              impactScore: 4.5
            },
            keyIndicators: [
              { label: 'Community Program Reach', target: 8800, actual: 9100, unit: 'beneficiaries' },
              { label: 'Program Effectiveness Rate', target: 90.0, actual: 93.8, unit: '%' },
              { label: 'Livelihood Programs Success', target: 78.0, actual: 82.5, unit: '%' },
              { label: 'Technology Adoption Rate', target: 70.0, actual: 73.8, unit: '%' }
            ],
            achievements: [
              'Digital transformation programs reaching all communities',
              'Modernized agricultural extension services',
              'Comprehensive health and wellness initiatives',
              'Environmental sustainability programs expanded'
            ]
          }
        ]
      },
      '2024': {
        overview: {
          totalPrograms: 67,
          activeResearch: 34,
          enrolledStudents: 12485,
          communityBeneficiaries: 8250,
          overallPerformance: 92.3,
          yearOverYearGrowth: 8.5
        },
        impactSummary: {
          educationalPrograms: {
            totalPrograms: 54,
            successRate: 91.8,
            yearOverYearGrowth: 5.2,
            target: 90.0,
            actual: 91.8
          },
          researchExcellence: {
            activeProjects: 34,
            publications: 124,
            impact: 'High',
            target: 30,
            actual: 34
          },
          communityEngagement: {
            extensionPrograms: 18,
            beneficiaries: 8250,
            impactRate: 92.1,
            target: 15,
            actual: 18
          },
          overallExcellence: {
            performanceRating: 92.3,
            improvementRate: 8.5,
            status: 'Excellent',
            target: 90.0,
            actual: 92.3
          }
        },
        programs: [
          {
            id: 'higher-education',
            title: 'Higher Education Programs',
            icon: GraduationCap,
            color: 'emerald',
            description: 'Comprehensive undergraduate and graduate degree programs fostering academic excellence and professional development.',
            performance: {
              target: 94.0,
              actual: 94.2,
              variance: 0.2,
              trend: 'up',
              programs: 42,
              students: 8520,
              graduationRate: 89.3
            },
            keyIndicators: [
              { label: 'Program Completion Rate', target: 92.0, actual: 94.2, unit: '%' },
              { label: 'Employment Rate of Graduates', target: 85.0, actual: 87.5, unit: '%' },
              { label: 'Student Satisfaction Rating', target: 4.2, actual: 4.4, unit: '/5.0' },
              { label: 'Faculty-Student Ratio', target: 25, actual: 23, unit: ':1' }
            ],
            achievements: [
              'Enhanced academic support services implementation',
              'Industry partnerships strengthened across all colleges',
              'Student retention programs showing positive results',
              'Quality assurance systems fully integrated'
            ]
          },
          {
            id: 'advanced-education',
            title: 'Advanced Education Programs',
            icon: BookOpen,
            color: 'blue',
            description: 'Post-graduate programs and specialized certifications designed for advanced learning and research excellence.',
            performance: {
              target: 89.0,
              actual: 89.7,
              variance: 0.7,
              trend: 'up',
              programs: 12,
              students: 1894,
              researchOutput: 78.2
            },
            keyIndicators: [
              { label: 'Graduate Faculty Research Engagement', target: 85.0, actual: 87.5, unit: '%' },
              { label: 'Research Program Enrollment', target: 75.0, actual: 78.2, unit: '%' },
              { label: 'Program Accreditation Rate', target: 80.0, actual: 83.1, unit: '%' },
              { label: 'Research Publication Index', target: 2.1, actual: 2.4, unit: 'per faculty' }
            ],
            achievements: [
              'New doctoral programs in critical fields launched',
              'International collaboration agreements established',
              'Research mentorship programs expanded',
              'Professional development pathways enhanced'
            ]
          },
          {
            id: 'research-programs',
            title: 'Research Programs',
            icon: Beaker,
            color: 'purple',
            description: 'Innovation-driven research initiatives addressing regional and national development challenges.',
            performance: {
              target: 78.0,
              actual: 78.3,
              variance: 0.3,
              trend: 'stable',
              programs: 34,
              researchers: 156,
              publications: 124
            },
            keyIndicators: [
              { label: 'Funded Research Projects', target: 28, actual: 34, unit: 'projects' },
              { label: 'Research Publication Rate', target: 75.0, actual: 78.3, unit: '%' },
              { label: 'Community Impact Projects', target: 15, actual: 18, unit: 'projects' },
              { label: 'Technology Transfer Success', target: 60.0, actual: 65.2, unit: '%' }
            ],
            achievements: [
              'Sustainable agriculture research breakthroughs',
              'Climate change adaptation studies completed',
              'Digital innovation projects implemented',
              'Community-based research partnerships expanded'
            ]
          },
          {
            id: 'extension-services',
            title: 'Extension Services',
            icon: Users,
            color: 'amber',
            description: 'Community engagement programs that bridge university knowledge with societal needs and development.',
            performance: {
              target: 90.0,
              actual: 92.1,
              variance: 2.1,
              trend: 'up',
              programs: 18,
              beneficiaries: 8250,
              impactScore: 4.3
            },
            keyIndicators: [
              { label: 'Community Program Reach', target: 8000, actual: 8250, unit: 'beneficiaries' },
              { label: 'Program Effectiveness Rate', target: 88.0, actual: 92.1, unit: '%' },
              { label: 'Livelihood Programs Success', target: 75.0, actual: 79.4, unit: '%' },
              { label: 'Technology Adoption Rate', target: 65.0, actual: 68.7, unit: '%' }
            ],
            achievements: [
              'Digital literacy programs reaching remote communities',
              'Agricultural extension services modernized',
              'Health and wellness initiatives expanded',
              'Environmental conservation awareness increased'
            ]
          }
        ]
      },
      '2023': {
        overview: {
          totalPrograms: 62,
          activeResearch: 28,
          enrolledStudents: 11520,
          communityBeneficiaries: 7450,
          overallPerformance: 88.4,
          yearOverYearGrowth: 6.8
        },
        impactSummary: {
          educationalPrograms: {
            totalPrograms: 50,
            successRate: 88.2,
            yearOverYearGrowth: 4.5,
            target: 86.0,
            actual: 88.2
          },
          researchExcellence: {
            activeProjects: 28,
            publications: 102,
            impact: 'Moderate-High',
            target: 25,
            actual: 28
          },
          communityEngagement: {
            extensionPrograms: 16,
            beneficiaries: 7450,
            impactRate: 88.5,
            target: 14,
            actual: 16
          },
          overallExcellence: {
            performanceRating: 88.4,
            improvementRate: 6.8,
            status: 'Very Good',
            target: 86.0,
            actual: 88.4
          }
        },
        programs: [
          {
            id: 'higher-education',
            title: 'Higher Education Programs',
            icon: GraduationCap,
            color: 'emerald',
            description: 'Comprehensive undergraduate and graduate degree programs fostering academic excellence and professional development.',
            performance: {
              target: 90.0,
              actual: 90.5,
              variance: 0.5,
              trend: 'up',
              programs: 39,
              students: 7880,
              graduationRate: 85.2
            },
            keyIndicators: [
              { label: 'Program Completion Rate', target: 88.0, actual: 90.5, unit: '%' },
              { label: 'Employment Rate of Graduates', target: 82.0, actual: 84.2, unit: '%' },
              { label: 'Student Satisfaction Rating', target: 4.0, actual: 4.2, unit: '/5.0' },
              { label: 'Faculty-Student Ratio', target: 27, actual: 25, unit: ':1' }
            ],
            achievements: [
              'Academic support programs initiated',
              'Industry partnerships developed',
              'Retention strategies implemented',
              'Quality standards updated'
            ]
          },
          {
            id: 'advanced-education',
            title: 'Advanced Education Programs',
            icon: BookOpen,
            color: 'blue',
            description: 'Post-graduate programs and specialized certifications designed for advanced learning and research excellence.',
            performance: {
              target: 85.0,
              actual: 86.1,
              variance: 1.1,
              trend: 'up',
              programs: 11,
              students: 1650,
              researchOutput: 72.5
            },
            keyIndicators: [
              { label: 'Graduate Faculty Research Engagement', target: 80.0, actual: 83.2, unit: '%' },
              { label: 'Research Program Enrollment', target: 70.0, actual: 72.5, unit: '%' },
              { label: 'Program Accreditation Rate', target: 75.0, actual: 78.4, unit: '%' },
              { label: 'Research Publication Index', target: 1.9, actual: 2.1, unit: 'per faculty' }
            ],
            achievements: [
              'New master programs launched',
              'Regional partnerships formed',
              'Mentorship initiatives started',
              'Professional pathways developed'
            ]
          },
          {
            id: 'research-programs',
            title: 'Research Programs',
            icon: Beaker,
            color: 'purple',
            description: 'Innovation-driven research initiatives addressing regional and national development challenges.',
            performance: {
              target: 74.0,
              actual: 74.8,
              variance: 0.8,
              trend: 'stable',
              programs: 28,
              researchers: 132,
              publications: 102
            },
            keyIndicators: [
              { label: 'Funded Research Projects', target: 24, actual: 28, unit: 'projects' },
              { label: 'Research Publication Rate', target: 72.0, actual: 74.8, unit: '%' },
              { label: 'Community Impact Projects', target: 12, actual: 15, unit: 'projects' },
              { label: 'Technology Transfer Success', target: 55.0, actual: 58.7, unit: '%' }
            ],
            achievements: [
              'Agriculture research programs launched',
              'Climate studies initiated',
              'Innovation projects started',
              'Community research developed'
            ]
          },
          {
            id: 'extension-services',
            title: 'Extension Services',
            icon: Users,
            color: 'amber',
            description: 'Community engagement programs that bridge university knowledge with societal needs and development.',
            performance: {
              target: 86.0,
              actual: 88.5,
              variance: 2.5,
              trend: 'up',
              programs: 16,
              beneficiaries: 7450,
              impactScore: 4.1
            },
            keyIndicators: [
              { label: 'Community Program Reach', target: 7200, actual: 7450, unit: 'beneficiaries' },
              { label: 'Program Effectiveness Rate', target: 85.0, actual: 88.5, unit: '%' },
              { label: 'Livelihood Programs Success', target: 72.0, actual: 75.8, unit: '%' },
              { label: 'Technology Adoption Rate', target: 60.0, actual: 63.4, unit: '%' }
            ],
            achievements: [
              'Literacy programs expanded',
              'Extension services upgraded',
              'Health programs launched',
              'Conservation initiatives started'
            ]
          }
        ]
      },
    };
    
    return yearDataMap[year] || yearDataMap['2025'];
  };

  // Filtered data based on year selection
  const filteredData = useMemo(() => {
    if (yearFilter === 'all') {
      return getYearSpecificData('2025');
    }
    return getYearSpecificData(yearFilter);
  }, [yearFilter]);

  // Navigation sections for University Operations
  const navigationSections = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'higher-education', label: 'Higher Education', icon: GraduationCap },
    { id: 'advanced-education', label: 'Advanced Education', icon: BookOpen },
    { id: 'research-programs', label: 'Research Programs', icon: Beaker },
    { id: 'extension-services', label: 'Extension Services', icon: Users }
  ];

  const scrollToSection = (sectionId: string, fromButton = false) => {
    console.log('🎯 University Operations - Enhanced scrolling to section:', sectionId, fromButton ? '(from button)' : '(from navigation)');
    
    // Immediate visual feedback for better UX
    if (fromButton) {
      setActiveSection(sectionId);
    }
    
    // Enhanced scroll function with enterprise-grade reliability
    const performEnhancedScroll = () => {
      const element = document.getElementById(sectionId);
      
      if (!element) {
        console.warn('❌ University Operations - Target element not found:', sectionId);
        // Fallback: scroll to top and set overview as active
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setActiveSection('overview');
        return;
      }
      
      console.log('✅ University Operations - Target element found:', sectionId);
      
      // Get all sticky navigation elements with more precision
      const clientNavbar = document.querySelector('.client-navbar') || 
                          document.querySelector('[class*="client-navbar"]');
      const stickyNav = document.querySelector('[data-sticky-nav]') || 
                       document.querySelector('.sticky.top-16') ||
                       document.querySelector('[class*="sticky"]');
      
      // Dynamic offset calculation with safety margins
      let totalOffset = 30; // Increased base padding for better visual spacing
      
      if (clientNavbar) {
        const navHeight = clientNavbar.getBoundingClientRect().height;
        totalOffset += navHeight;
        console.log('📏 University Operations - Client navbar height:', navHeight);
      }
      
      if (stickyNav && stickyNav !== clientNavbar) {
        const stickyHeight = stickyNav.getBoundingClientRect().height;
        totalOffset += stickyHeight;
        console.log('📏 University Operations - Sticky nav height:', stickyHeight);
      }
      
      // Get accurate element position
      const elementRect = element.getBoundingClientRect();
      const elementPosition = elementRect.top + window.pageYOffset;
      const targetPosition = Math.max(0, elementPosition - totalOffset);
      
      console.log('📍 University Operations - Enhanced scroll calculation:', {
        sectionId,
        elementPosition,
        totalOffset,
        targetPosition,
        currentScroll: window.pageYOffset,
        viewportHeight: window.innerHeight
      });
      
      // Perform scroll with enhanced monitoring
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
      
      // Multi-level verification system
      const verifyScrollPosition = (attempt = 1, maxAttempts = 3) => {
        setTimeout(() => {
          const currentScroll = window.pageYOffset;
          const scrollDifference = Math.abs(currentScroll - targetPosition);
          const tolerance = 75; // Increased tolerance for better reliability
          
          console.log(`🔍 University Operations - Scroll verification attempt ${attempt}:`, {
            currentScroll,
            targetPosition,
            difference: scrollDifference,
            tolerance
          });
          
          if (scrollDifference > tolerance && attempt < maxAttempts) {
            console.log(`🔄 University Operations - Adjusting scroll position (attempt ${attempt})...`);
            
            // More aggressive scroll correction
            window.scrollTo({
              top: targetPosition,
              behavior: attempt === maxAttempts - 1 ? 'auto' : 'smooth' // Use instant scroll on final attempt
            });
            
            verifyScrollPosition(attempt + 1, maxAttempts);
          } else {
            console.log(`✅ University Operations - Scroll completed for section: ${sectionId}`);
            
            // Final visual feedback update
            if (!fromButton) {
              setActiveSection(sectionId);
            }
            
            // Add visual highlight effect to target section
            element.classList.add('section-highlight');
            setTimeout(() => {
              element.classList.remove('section-highlight');
            }, 2000);
          }
        }, attempt === 1 ? 800 : 500); // Longer delay for first verification
      };
      
      verifyScrollPosition();
    };
    
    // Multiple-stage execution for maximum reliability
    const executeWithRetry = (stage = 1) => {
      switch (stage) {
        case 1:
          // Stage 1: Immediate execution
          requestAnimationFrame(() => {
            performEnhancedScroll();
          });
          break;
          
        case 2:
          // Stage 2: Delayed execution (fallback)
          setTimeout(() => {
            const element = document.getElementById(sectionId);
            if (element) {
              console.log('🔄 University Operations - Stage 2 fallback scroll execution');
              performEnhancedScroll();
            }
          }, 200);
          break;
          
        case 3:
          // Stage 3: Final fallback with simple scroll
          setTimeout(() => {
            const element = document.getElementById(sectionId);
            if (element) {
              console.log('🔄 University Operations - Stage 3 simple scroll fallback');
              element.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start',
                inline: 'nearest'
              });
              setActiveSection(sectionId);
            }
          }, 500);
          break;
      }
      
      // Schedule next stage if needed
      if (stage < 3) {
        setTimeout(() => executeWithRetry(stage + 1), 100);
      }
    };
    
    executeWithRetry(1);
  };

  // Enhanced scroll detection system with improved accuracy
  useEffect(() => {
    let isScrolling = false;
    let scrollTimeout: NodeJS.Timeout;
    let rafId: number;
    
    const handleScrollDetection = () => {
      // Prevent interference during programmatic scrolling
      if (isScrolling) return;
      
      // Calculate dynamic offset with enhanced precision
      const clientNavbar = document.querySelector('.client-navbar') || 
                          document.querySelector('[class*="client-navbar"]');
      const stickyNav = document.querySelector('[data-sticky-nav]') || 
                       document.querySelector('.sticky.top-16') ||
                       document.querySelector('[class*="sticky"]');
      
      let detectionOffset = 120; // Enhanced base offset for better section detection
      
      if (clientNavbar) {
        detectionOffset += clientNavbar.getBoundingClientRect().height;
      }
      if (stickyNav && stickyNav !== clientNavbar) {
        detectionOffset += stickyNav.getBoundingClientRect().height;
      }
      
      const sections = navigationSections.map(section => section.id);
      const viewportHeight = window.innerHeight;
      const scrollPosition = window.pageYOffset;
      
      // Enhanced section detection algorithm
      let detectedSection = sections[0]; // Default fallback
      let bestMatch = { section: sections[0], score: 0 };
      
      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (!element) continue;
        
        const rect = element.getBoundingClientRect();
        const elementTop = rect.top;
        const elementBottom = rect.bottom;
        const elementHeight = rect.height;
        
        // Multiple detection criteria for better accuracy
        const inViewportTop = elementTop <= detectionOffset;
        const inViewportBottom = elementBottom > detectionOffset;
        const visibleInViewport = elementTop < viewportHeight && elementBottom > 0;
        
        // Calculate visibility score for this section
        let score = 0;
        
        if (inViewportTop && inViewportBottom) {
          // Section header is at the top - highest priority
          score = 1000;
        } else if (visibleInViewport) {
          // Calculate what percentage of section is visible
          const visibleTop = Math.max(0, elementTop);
          const visibleBottom = Math.min(viewportHeight, elementBottom);
          const visibleHeight = Math.max(0, visibleBottom - visibleTop);
          const visibilityRatio = visibleHeight / elementHeight;
          
          score = visibilityRatio * 500;
          
          // Bonus for sections closer to the detection offset
          if (elementTop <= detectionOffset) {
            score += 200;
          }
        }
        
        if (score > bestMatch.score) {
          bestMatch = { section: sectionId, score };
        }
      }
      
      detectedSection = bestMatch.section;
      
      // Update active section if changed
      if (detectedSection !== activeSection) {
        console.log('📍 University Operations - Enhanced section detection:', {
          previousSection: activeSection,
          newSection: detectedSection,
          score: bestMatch.score,
          scrollPosition,
          detectionOffset
        });
        
        setActiveSection(detectedSection);
      }
    };
    
    // Optimized scroll event handler with RAF
    const handleScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      
      rafId = requestAnimationFrame(() => {
        if (scrollTimeout) clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          handleScrollDetection();
          isScrolling = false;
        }, 100); // Increased debounce for stability
      });
    };
    
    // Mark scrolling state during programmatic scrolls
    const markScrollingState = () => {
      isScrolling = true;
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
      }, 1500); // Extended timeout for smooth scroll completion
    };
    
    // Listen for programmatic scroll events
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Custom event for programmatic scrolling
    const handleProgrammaticScroll = () => markScrollingState();
    window.addEventListener('universityops-scroll-start', handleProgrammaticScroll);
    
    // Initial detection
    setTimeout(handleScrollDetection, 100);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('universityops-scroll-start', handleProgrammaticScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [activeSection, navigationSections]);

  // Enhanced navigation effect with enterprise-grade reliability
  useEffect(() => {
    if (currentSection) {
      console.log('🚀 University Operations - Enhanced navigation effect triggered:', currentSection);
      
      // Comprehensive section mapping with aliases
      const sectionMap: { [key: string]: string } = {
        // Direct section mappings
        'overview': 'overview',
        'higher-education': 'higher-education',
        'advanced-education': 'advanced-education', 
        'research-programs': 'research-programs',
        'extension-services': 'extension-services',
        
        // Legacy and alias mappings
        'higher-education-programs': 'higher-education',
        'advanced-education-programs': 'advanced-education',
        'research': 'research-programs',
        'extension': 'extension-services',
        'higher': 'higher-education',
        'advanced': 'advanced-education',
        'research-program': 'research-programs',
        'extension-service': 'extension-services',
        
        // Page-level mappings
        'client-university-operations': 'overview',
        'university-operations': 'overview'
      };
      
      const targetSection = sectionMap[currentSection] || 'overview';
      console.log('🎯 University Operations - Section mapping:', {
        input: currentSection,
        mapped: targetSection,
        available: Object.keys(sectionMap)
      });
      
      // Dispatch custom event to mark programmatic scroll
      window.dispatchEvent(new CustomEvent('universityops-scroll-start'));
      
      // Immediate visual feedback for responsiveness
      setActiveSection(targetSection);
      
      // Multi-stage navigation approach for maximum reliability
      const executeNavigationSequence = async () => {
        // Stage 1: Wait for DOM to be ready
        await new Promise(resolve => {
          if (document.readyState === 'complete') {
            resolve(true);
          } else {
            window.addEventListener('load', () => resolve(true), { once: true });
            // Fallback timeout
            setTimeout(() => resolve(true), 100);
          }
        });
        
        // Stage 2: Initial scroll attempt
        console.log('🚀 University Operations - Stage 1: Initial navigation to:', targetSection);
        scrollToSection(targetSection, false);
        
        // Stage 3: Verification and correction
        setTimeout(() => {
          const element = document.getElementById(targetSection);
          if (element) {
            const rect = element.getBoundingClientRect();
            const isInOptimalPosition = rect.top >= 64 && rect.top <= 200; // Consider navbar height
            
            console.log('🔍 University Operations - Position verification:', {
              section: targetSection,
              elementTop: rect.top,
              isOptimal: isInOptimalPosition,
              windowScroll: window.pageYOffset
            });
            
            if (!isInOptimalPosition) {
              console.log('🔄 University Operations - Position correction needed');
              scrollToSection(targetSection, false);
            }
          }
        }, 1000);
        
        // Stage 4: Final fallback verification
        setTimeout(() => {
          const element = document.getElementById(targetSection);
          if (element) {
            const rect = element.getBoundingClientRect();
            const isVisible = rect.top >= -100 && rect.top <= window.innerHeight;
            
            if (!isVisible) {
              console.log('🔄 University Operations - Final fallback scroll');
              element.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
                inline: 'nearest'
              });
            }
            
            // Ensure active section is correct
            setActiveSection(targetSection);
          }
        }, 2000);
      };
      
      executeNavigationSequence().catch(error => {
        console.error('❌ University Operations - Navigation sequence error:', error);
        // Ultimate fallback
        setActiveSection('overview');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      
    } else {
      // Default to overview if no section specified
      console.log('🏠 University Operations - No section specified, defaulting to overview');
      setActiveSection('overview');
    }
  }, [currentSection]);

  // OLD DATA - Now using getYearSpecificData and filteredData instead
  /* const operationsData = {
    overview: {
      totalPrograms: 67,
      activeResearch: 34,
      enrolledStudents: 12485,
      communityBeneficiaries: 8250,
      overallPerformance: 92.3,
      yearOverYearGrowth: 8.5
    },
    impactSummary: {
      educationalPrograms: {
        totalPrograms: 54,
        successRate: 91.8,
        yearOverYearGrowth: 5.2
      },
      researchExcellence: {
        activeProjects: 34,
        publications: 124,
        impact: 'High'
      },
      communityEngagement: {
        extensionPrograms: 18,
        beneficiaries: 8250,
        impactRate: 92.1
      },
      overallExcellence: {
        performanceRating: 92.3,
        improvementRate: 8.5,
        status: 'Excellent'
      }
    },
    programs: [
      {
        id: 'higher-education',
        title: 'Higher Education Programs',
        icon: GraduationCap,
        color: 'emerald',
        description: 'Comprehensive undergraduate and graduate degree programs fostering academic excellence and professional development.',
        performance: {
          target: 94.0,
          actual: 94.2,
          variance: 0.2,
          trend: 'up',
          programs: 42,
          students: 8520,
          graduationRate: 89.3
        },
        keyIndicators: [
          { label: 'Program Completion Rate', target: 92.0, actual: 94.2, unit: '%' },
          { label: 'Employment Rate of Graduates', target: 85.0, actual: 87.5, unit: '%' },
          { label: 'Student Satisfaction Rating', target: 4.2, actual: 4.4, unit: '/5.0' },
          { label: 'Faculty-Student Ratio', target: 25, actual: 23, unit: ':1' }
        ],
        achievements: [
          'Enhanced academic support services implementation',
          'Industry partnerships strengthened across all colleges',
          'Student retention programs showing positive results',
          'Quality assurance systems fully integrated'
        ]
      },
      {
        id: 'advanced-education',
        title: 'Advanced Education Programs',
        icon: BookOpen,
        color: 'blue',
        description: 'Post-graduate programs and specialized certifications designed for advanced learning and research excellence.',
        performance: {
          target: 89.0,
          actual: 89.7,
          variance: 0.7,
          trend: 'up',
          programs: 12,
          students: 1894,
          researchOutput: 78.2
        },
        keyIndicators: [
          { label: 'Graduate Faculty Research Engagement', target: 85.0, actual: 87.5, unit: '%' },
          { label: 'Research Program Enrollment', target: 75.0, actual: 78.2, unit: '%' },
          { label: 'Program Accreditation Rate', target: 80.0, actual: 83.1, unit: '%' },
          { label: 'Research Publication Index', target: 2.1, actual: 2.4, unit: 'per faculty' }
        ],
        achievements: [
          'New doctoral programs in critical fields launched',
          'International collaboration agreements established',
          'Research mentorship programs expanded',
          'Professional development pathways enhanced'
        ]
      },
      {
        id: 'research-programs',
        title: 'Research Programs',
        icon: Beaker,
        color: 'purple',
        description: 'Innovation-driven research initiatives addressing regional and national development challenges.',
        performance: {
          target: 78.0,
          actual: 78.3,
          variance: 0.3,
          trend: 'stable',
          programs: 34,
          researchers: 156,
          publications: 124
        },
        keyIndicators: [
          { label: 'Funded Research Projects', target: 28, actual: 34, unit: 'projects' },
          { label: 'Research Publication Rate', target: 75.0, actual: 78.3, unit: '%' },
          { label: 'Community Impact Projects', target: 15, actual: 18, unit: 'projects' },
          { label: 'Technology Transfer Success', target: 60.0, actual: 65.2, unit: '%' }
        ],
        achievements: [
          'Sustainable agriculture research breakthroughs',
          'Climate change adaptation studies completed',
          'Digital innovation projects implemented',
          'Community-based research partnerships expanded'
        ]
      },
      {
        id: 'extension-services',
        title: 'Extension Services',
        icon: Users,
        color: 'amber',
        description: 'Community engagement programs that bridge university knowledge with societal needs and development.',
        performance: {
          target: 90.0,
          actual: 92.1,
          variance: 2.1,
          trend: 'up',
          programs: 18,
          beneficiaries: 8250,
          impactScore: 4.3
        },
        keyIndicators: [
          { label: 'Community Program Reach', target: 8000, actual: 8250, unit: 'beneficiaries' },
          { label: 'Program Effectiveness Rate', target: 88.0, actual: 92.1, unit: '%' },
          { label: 'Livelihood Programs Success', target: 75.0, actual: 79.4, unit: '%' },
          { label: 'Technology Adoption Rate', target: 65.0, actual: 68.7, unit: '%' }
        ],
        achievements: [
          'Digital literacy programs reaching remote communities',
          'Agricultural extension services modernized',
          'Health and wellness initiatives expanded',
          'Environmental conservation awareness increased'
        ]
      }
    ]
  }; */

  return (
    <div className="min-h-screen bg-background client-page">
      <ClientNavbar 
        onNavigate={onNavigate} 
        onSignIn={onSignIn}
        onSignOut={onSignOut}
        onNavigateToDashboard={onNavigateToDashboard}
        onAuthModalSignIn={onAuthModalSignIn}
        userProfile={userProfile}
        demoMode={demoMode}
      />

      {/* Sticky Year Indicator - Always visible while scrolling */}
      <div className="sticky top-16 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-700">
                <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                  Viewing Year:
                </span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {yearFilter === 'all' ? '2025 (Latest)' : yearFilter}
                </span>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => {
                  const filterSection = document.querySelector('#year-filter');
                  if (filterSection) {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-md transition-colors"
              >
                <ChevronUp className="h-3.5 w-3.5" />
                <span>Change Year</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-emerald-950/50 dark:via-gray-900 dark:to-blue-950/50 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-600 to-blue-600 dark:from-emerald-500 dark:to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-blue-700 dark:from-emerald-400 dark:via-blue-400 dark:to-blue-500 bg-clip-text text-transparent mb-4">
              University Operations
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 dark:text-gray-300 mb-6">
              Academic Excellence & Research Innovation
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed">
              Discover CSU's comprehensive academic programs, cutting-edge research initiatives, and community-driven extension services that foster excellence and drive regional development.
            </p>
          </div>

          {/* Year Filter */}
          <div className="mt-8">
            <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <Label htmlFor="year-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Filter by Year:
                    </Label>
                  </div>
                  <div className="flex-1 max-w-md">
                    <Select value={yearFilter} onValueChange={(value: any) => setYearFilter(value)}>
                      <SelectTrigger id="year-filter" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Years (Latest Data)</SelectItem>
                        <SelectItem value="2025">2025</SelectItem>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2023">2023</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing data for: <span className="font-medium text-emerald-600 dark:text-emerald-400">{yearFilter === 'all' ? '2025 (Latest)' : yearFilter}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {[
              { 
                label: 'Academic Programs', 
                value: filteredData.overview.totalPrograms, 
                icon: Target,
                description: 'Total active programs',
                trend: '+3 new this year'
              },
              { 
                label: 'Overall Performance', 
                value: `${filteredData.overview.overallPerformance}%`, 
                icon: Activity,
                description: 'Target achievement rate',
                trend: `+${filteredData.overview.yearOverYearGrowth}% YoY`
              },
              { 
                label: 'Student Enrollment', 
                value: filteredData.overview.enrolledStudents.toLocaleString(), 
                icon: GraduationCap,
                description: 'Total enrolled students',
                trend: '+12% increase'
              },
              { 
                label: 'Community Impact', 
                value: filteredData.overview.communityBeneficiaries.toLocaleString(), 
                icon: Users,
                description: 'Beneficiaries reached',
                trend: '+18% growth'
              }
            ].map((stat, index) => (
              <Card key={index} className="border-gray-200 dark:border-gray-700 client-card-hover">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center justify-center">
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700">
                      {stat.trend}
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                    {stat.label}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {stat.description}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* University Operations Impact Summary - Target vs Actual */}
          <div className="mt-12">
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  University Operations Impact Summary
                </CardTitle>
                <CardDescription>
                  Target vs Actual performance across all operations sections for {yearFilter === 'all' ? '2024' : yearFilter}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Higher Education Programs */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-emerald-50/30 dark:bg-emerald-900/10">
                    <div className="flex items-center gap-2 mb-4">
                      <GraduationCap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">Higher Education</div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Programs</div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Target:</span>
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{filteredData.programs[0].performance.target}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-emerald-600 dark:text-emerald-400">Actual:</span>
                          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{filteredData.programs[0].performance.actual}%</span>
                        </div>
                        <Progress 
                          value={(filteredData.programs[0].performance.actual / filteredData.programs[0].performance.target) * 100} 
                          className="h-2 mt-2"
                        />
                      </div>
                      <Separator />
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        <div className="flex justify-between">
                          <span>Total Programs:</span>
                          <span className="font-semibold">{filteredData.programs[0].performance.programs}</span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span>Students:</span>
                          <span className="font-semibold">{filteredData.programs[0].performance.students.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Advanced Education */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-blue-50/30 dark:bg-blue-900/10">
                    <div className="flex items-center gap-2 mb-4">
                      <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">Advanced Education</div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Programs</div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Target:</span>
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{filteredData.programs[1].performance.target}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-blue-600 dark:text-blue-400">Actual:</span>
                          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{filteredData.programs[1].performance.actual}%</span>
                        </div>
                        <Progress 
                          value={(filteredData.programs[1].performance.actual / filteredData.programs[1].performance.target) * 100} 
                          className="h-2 mt-2"
                        />
                      </div>
                      <Separator />
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        <div className="flex justify-between">
                          <span>Total Programs:</span>
                          <span className="font-semibold">{filteredData.programs[1].performance.programs}</span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span>Students:</span>
                          <span className="font-semibold">{filteredData.programs[1].performance.students.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Research Programs */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-purple-50/30 dark:bg-purple-900/10">
                    <div className="flex items-center gap-2 mb-4">
                      <Beaker className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">Research Programs</div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Performance</div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Target:</span>
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{filteredData.programs[2].performance.target}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-purple-600 dark:text-purple-400">Actual:</span>
                          <span className="text-sm font-bold text-purple-600 dark:text-purple-400">{filteredData.programs[2].performance.actual}%</span>
                        </div>
                        <Progress 
                          value={(filteredData.programs[2].performance.actual / filteredData.programs[2].performance.target) * 100} 
                          className="h-2 mt-2"
                        />
                      </div>
                      <Separator />
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        <div className="flex justify-between">
                          <span>Active Projects:</span>
                          <span className="font-semibold">{filteredData.programs[2].performance.programs}</span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span>Publications:</span>
                          <span className="font-semibold">{filteredData.programs[2].performance.publications}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Extension Services */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-amber-50/30 dark:bg-amber-900/10">
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">Extension Services</div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Performance</div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Target:</span>
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{filteredData.programs[3].performance.target}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-amber-600 dark:text-amber-400">Actual:</span>
                          <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{filteredData.programs[3].performance.actual}%</span>
                        </div>
                        <Progress 
                          value={(filteredData.programs[3].performance.actual / filteredData.programs[3].performance.target) * 100} 
                          className="h-2 mt-2"
                        />
                      </div>
                      <Separator />
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        <div className="flex justify-between">
                          <span>Total Programs:</span>
                          <span className="font-semibold">{filteredData.programs[3].performance.programs}</span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span>Beneficiaries:</span>
                          <span className="font-semibold">{filteredData.programs[3].performance.beneficiaries.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Navigation Menu */}
      <section 
        className="py-6 px-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-16 z-30" 
        data-sticky-nav="university-operations"
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-3 justify-center">
            {navigationSections.map((item) => (
              <Button
                key={item.id}
                variant={activeSection === item.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  console.log('🖱️ University Operations - Enhanced navigation button clicked:', item.id);
                  
                  // Dispatch custom event to mark programmatic scroll
                  window.dispatchEvent(new CustomEvent('universityops-scroll-start'));
                  
                  // Immediate visual feedback for responsiveness
                  setActiveSection(item.id);
                  
                  // Enhanced scroll execution with enterprise-grade reliability
                  const executeButtonScroll = () => {
                    // Primary scroll attempt
                    scrollToSection(item.id, true);
                    
                    // Enhanced verification with multiple checks
                    const verificationSequence = [
                      { delay: 800, tolerance: 100, method: 'primary' },
                      { delay: 1500, tolerance: 150, method: 'secondary' },
                      { delay: 2500, tolerance: 200, method: 'fallback' }
                    ];
                    
                    verificationSequence.forEach(({ delay, tolerance, method }) => {
                      setTimeout(() => {
                        const element = document.getElementById(item.id);
                        if (!element) return;
                        
                        const rect = element.getBoundingClientRect();
                        const isInOptimalView = rect.top >= 64 && rect.top <= tolerance;
                        const isVisible = rect.top >= -100 && rect.top <= window.innerHeight;
                        
                        console.log(`🔍 University Operations - ${method} verification for ${item.id}:`, {
                          elementTop: rect.top,
                          isOptimal: isInOptimalView,
                          isVisible,
                          method
                        });
                        
                        if (!isInOptimalView && isVisible) {
                          console.log(`🔄 University Operations - ${method} correction for:`, item.id);
                          
                          if (method === 'fallback') {
                            // Use native scrollIntoView as final fallback
                            element.scrollIntoView({
                              behavior: 'smooth',
                              block: 'start',
                              inline: 'nearest'
                            });
                          } else {
                            // Use our enhanced scroll function
                            scrollToSection(item.id, true);
                          }
                        }
                      }, delay);
                    });
                  };
                  
                  // Execute with proper timing
                  requestAnimationFrame(() => {
                    setTimeout(executeButtonScroll, 16); // Single frame delay for DOM updates
                  });
                }}
                className={`transition-all duration-200 ${
                  activeSection === item.id
                    ? 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white shadow-md'
                    : 'border-gray-200 dark:border-gray-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-200 dark:hover:border-emerald-600 text-gray-700 dark:text-gray-300'
                }`}
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section id="overview" className="py-16 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Overview</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Comprehensive university operations driving academic excellence and community development
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-gray-100">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  Our Mission
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  To deliver excellent academic programs, conduct innovative research, and provide meaningful extension services that contribute to regional development and societal advancement.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-gray-100">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  Key Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <span>67 comprehensive academic programs</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <span>34 active research initiatives</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <span>8,250+ community beneficiaries</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Higher Education Section */}
      <section id="higher-education" className="py-16 px-4 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Higher Education Programs</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">Excellence in undergraduate and graduate education</p>
          </div>

          {/* Performance Overview */}
          <div className="mb-12">
            <Card className="border-emerald-200 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20">
              <CardContent className="p-6">
                <div className="grid md:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Target Performance</div>
                    <div className="text-3xl font-bold text-gray-700 dark:text-gray-300">
                      {filteredData.programs[0].performance.target}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Actual Performance</div>
                    <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                      {filteredData.programs[0].performance.actual}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Performance Variance</div>
                    <div className="flex items-center justify-center gap-2">
                      <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        +{filteredData.programs[0].performance.variance}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Performance Indicators */}
          <div className="mb-12">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Key Performance Indicators</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {filteredData.programs[0].keyIndicators.map((indicator, idx) => (
                <Card key={idx} className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">{indicator.label}</h4>
                      <Badge variant={indicator.actual >= indicator.target ? "default" : "secondary"} className={indicator.actual >= indicator.target ? "bg-emerald-600 dark:bg-emerald-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"}>
                        {indicator.actual >= indicator.target ? "Above Target" : "Below Target"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Target</div>
                        <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                          {indicator.target}{indicator.unit}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Actual</div>
                        <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                          {indicator.actual}{indicator.unit}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Progress 
                        value={(indicator.actual / indicator.target) * 100} 
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Key Achievements */}
          <div className="mb-12">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Recent Achievements</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {filteredData.programs[0].achievements.map((achievement, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-1 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{achievement}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Program Statistics */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Program Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="text-center border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                    {filteredData.programs[0].performance.programs}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Programs</div>
                </CardContent>
              </Card>
              <Card className="text-center border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                    {filteredData.programs[0].performance.students.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Students Enrolled</div>
                </CardContent>
              </Card>
              <Card className="text-center border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                    {filteredData.programs[0].performance.graduationRate}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Graduation Rate</div>
                </CardContent>
              </Card>
              <Card className="text-center border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">5</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Academic Colleges</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Education Section */}
      <section id="advanced-education" className="py-16 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Advanced Education Programs</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">Post-graduate excellence and specialized certifications</p>
          </div>

          {/* Performance Overview */}
          <div className="mb-12">
            <Card className="border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20">
              <CardContent className="p-6">
                <div className="grid md:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Target Performance</div>
                    <div className="text-3xl font-bold text-gray-700 dark:text-gray-300">
                      {filteredData.programs[1].performance.target}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Actual Performance</div>
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {filteredData.programs[1].performance.actual}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Performance Variance</div>
                    <div className="flex items-center justify-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        +{filteredData.programs[1].performance.variance}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Performance Indicators */}
          <div className="mb-12">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Key Performance Indicators</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {filteredData.programs[1].keyIndicators.map((indicator, idx) => (
                <Card key={idx} className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">{indicator.label}</h4>
                      <Badge variant={indicator.actual >= indicator.target ? "default" : "secondary"} className={indicator.actual >= indicator.target ? "bg-blue-600 dark:bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"}>
                        {indicator.actual >= indicator.target ? "Above Target" : "Below Target"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Target</div>
                        <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                          {indicator.target}{indicator.unit}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Actual</div>
                        <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {indicator.actual}{indicator.unit}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Progress 
                        value={(indicator.actual / indicator.target) * 100} 
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Key Achievements */}
          <div className="mb-12">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Recent Achievements</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {filteredData.programs[1].achievements.map((achievement, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{achievement}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Program Statistics */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Program Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="text-center border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                    {filteredData.programs[1].performance.programs}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Programs</div>
                </CardContent>
              </Card>
              <Card className="text-center border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                    {filteredData.programs[1].performance.students.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Students Enrolled</div>
                </CardContent>
              </Card>
              <Card className="text-center border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                    {filteredData.programs[1].performance.researchOutput}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Research Output</div>
                </CardContent>
              </Card>
              <Card className="text-center border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                    {filteredData.programs[1].performance.actual}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Research Programs Section */}
      <section id="research-programs" className="py-16 px-4 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Beaker className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Research Programs</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">Innovation-driven research for societal impact</p>
          </div>

          {/* Performance Overview */}
          <div className="mb-12">
            <Card className="border-purple-200 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20">
              <CardContent className="p-6">
                <div className="grid md:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Target Performance</div>
                    <div className="text-3xl font-bold text-gray-700 dark:text-gray-300">
                      {filteredData.programs[2].performance.target}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Actual Performance</div>
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {filteredData.programs[2].performance.actual}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Performance Variance</div>
                    <div className="flex items-center justify-center gap-2">
                      <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        +{filteredData.programs[2].performance.variance}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Performance Indicators */}
          <div className="mb-12">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Key Performance Indicators</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {filteredData.programs[2].keyIndicators.map((indicator, idx) => (
                <Card key={idx} className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">{indicator.label}</h4>
                      <Badge variant={indicator.actual >= indicator.target ? "default" : "secondary"} className={indicator.actual >= indicator.target ? "bg-purple-600 dark:bg-purple-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"}>
                        {indicator.actual >= indicator.target ? "Above Target" : "Below Target"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Target</div>
                        <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                          {indicator.target}{indicator.unit}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Actual</div>
                        <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                          {indicator.actual}{indicator.unit}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Progress 
                        value={(indicator.actual / indicator.target) * 100} 
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Key Achievements */}
          <div className="mb-12">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Recent Research Achievements</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {filteredData.programs[2].achievements.map((achievement, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-1 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{achievement}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Research Statistics */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Research Impact Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="text-center border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                    {filteredData.programs[2].performance.programs}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Active Programs</div>
                </CardContent>
              </Card>
              <Card className="text-center border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                    {filteredData.programs[2].performance.researchers}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Active Researchers</div>
                </CardContent>
              </Card>
              <Card className="text-center border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                    {filteredData.programs[2].performance.publications}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Publications</div>
                </CardContent>
              </Card>
              <Card className="text-center border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                    {filteredData.programs[2].performance.actual}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Extension Services Section */}
      <section id="extension-services" className="py-16 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Extension Services</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">Bridging university knowledge with community needs</p>
          </div>

          {/* Performance Overview */}
          <div className="mb-12">
            <Card className="border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20">
              <CardContent className="p-6">
                <div className="grid md:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Target Performance</div>
                    <div className="text-3xl font-bold text-gray-700 dark:text-gray-300">
                      {filteredData.programs[3].performance.target}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Actual Performance</div>
                    <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                      {filteredData.programs[3].performance.actual}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Performance Variance</div>
                    <div className="flex items-center justify-center gap-2">
                      <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                        +{filteredData.programs[3].performance.variance}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Performance Indicators */}
          <div className="mb-12">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Key Performance Indicators</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {filteredData.programs[3].keyIndicators.map((indicator, idx) => (
                <Card key={idx} className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">{indicator.label}</h4>
                      <Badge variant={indicator.actual >= indicator.target ? "default" : "secondary"} className={indicator.actual >= indicator.target ? "bg-amber-600 dark:bg-amber-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"}>
                        {indicator.actual >= indicator.target ? "Above Target" : "Below Target"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Target</div>
                        <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                          {indicator.target.toLocaleString()}{indicator.unit}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Actual</div>
                        <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
                          {indicator.actual.toLocaleString()}{indicator.unit}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Progress 
                        value={Math.min((indicator.actual / indicator.target) * 100, 100)} 
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Key Achievements */}
          <div className="mb-12">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Community Impact Achievements</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {filteredData.programs[3].achievements.map((achievement, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-1 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{achievement}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Extension Statistics */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Extension Services Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="text-center border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mb-1">
                    {filteredData.programs[3].performance.programs}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Active Programs</div>
                </CardContent>
              </Card>
              <Card className="text-center border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mb-1">
                    {filteredData.programs[3].performance.beneficiaries.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Community Beneficiaries</div>
                </CardContent>
              </Card>
              <Card className="text-center border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mb-1">
                    {filteredData.programs[3].performance.impactScore}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Impact Score</div>
                </CardContent>
              </Card>
              <Card className="text-center border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mb-1">
                    {filteredData.programs[3].performance.actual}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-950/50 dark:to-blue-950/50 border-emerald-200 dark:border-emerald-700">
            <CardContent className="text-center p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Explore More PMO Operations</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
                Discover other areas of PMO operations including construction projects, facility management, and institutional reporting.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => onNavigate?.('client-construction')}
                  className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white"
                >
                  <Building2 className="mr-2 h-4 w-4" />
                  Construction Projects
                </Button>
                <Button 
                  onClick={() => onNavigate?.('client-about-us')}
                  variant="outline"
                  className="border-emerald-600 dark:border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  About PMO
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}