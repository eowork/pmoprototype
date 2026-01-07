import React, { useState, useEffect, useMemo } from 'react';
// Import organizational structure image
import organizationChartImage from 'figma:asset/a008aa8a97f22d80e145918297516c60f7e701fa.png';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
// Import RBAC utilities
import { isAdmin as checkIsAdmin, hasPermission } from '../../../utils/supabase/client';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import { Separator } from '../../ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { toast } from 'sonner@2.0.3';
import {
  Building2,
  Users,
  Target,
  Award,
  Mail,
  Phone,
  MapPin,
  Shield,
  BookOpen,
  Heart,
  CheckCircle,
  TrendingUp,
  Eye,
  Compass,
  Lightbulb,
  ArrowRight,
  ExternalLink,
  Download,
  FileText,
  Calendar,
  Globe,
  Clock,
  ChevronRight,
  Zap,
  Star,
  UserCheck,
  Contact,
  BarChart3,
  Edit,
  Plus,
  Trash2,
  Save,
  X,
  GraduationCap,
  Handshake,
  Briefcase
} from 'lucide-react';
import { ClientNavbar } from '../components/ClientNavbar';
import { NavigationProps, CoreValue, Objective } from '../types';

interface AboutUsPageEnhancedProps extends NavigationProps {
  currentSection?: string;
}

interface ContactInfo {
  id: string;
  type: 'address' | 'phone' | 'email' | 'hours' | 'online';
  label: string;
  value: string;
  icon: any;
}

interface TeamMember {
  id: string;
  name: string;
  position: string;
  department: string;
  email?: string;
  phone?: string;
}

interface ContentSection {
  id: string;
  type: 'hero' | 'card' | 'gallery' | 'header' | 'text' | 'stats';
  title: string;
  subtitle?: string;
  content: string;
  icon?: string;
  color?: string;
  order: number;
  sectionGroup: string;
  isEditable: boolean;
}

interface EditModalState {
  isOpen: boolean;
  editingItem: any;
  editingType: 'csu-info' | 'pmo-info' | 'value' | 'objective' | 'personnel' | 'contact' | 'section';
  isNew: boolean;
}

export function AboutUsPageEnhanced({
  onNavigate,
  onSignIn,
  onSignOut,
  onNavigateToDashboard,
  userRole = 'Client',
  userProfile,
  requireAuth,
  onAuthModalSignIn,
  demoMode = false,
  currentSection
}: AboutUsPageEnhancedProps) {
  const [activeSection, setActiveSection] = useState('overview');
  const [editModal, setEditModal] = useState<EditModalState>({
    isOpen: false,
    editingItem: null,
    editingType: 'section',
    isNew: false
  });

  // RBAC: Check if user is admin with proper permissions
  const isAdmin = useMemo(() => {
    if (!userProfile) return false;
    const user = { user_metadata: userProfile };
    return checkIsAdmin(user);
  }, [userProfile]);

  // Check if user can edit content
  const canEdit = useMemo(() => {
    if (!userProfile) return false;
    const user = { user_metadata: userProfile };
    return hasPermission(user, 'canEdit');
  }, [userProfile]);

  // Enhanced CSU Information with CRUD capabilities
  const [csuInfo, setCsuInfo] = useState({
    name: 'Caraga State University',
    establishedYear: '1983',
    vision: 'A socially-engaged digital, innovation, entrepreneurial university excelling globally in science, engineering, and the arts by 2028',
    mission: 'As a transformative university, CSU is a responsible steward of problem-solvers and value creators who are driven to create a sustainable future for the region, the nation, and beyond.',
    qualityPolicy: 'Caraga State University, as a premier institution of higher learning, endeavors to continually improve its management system in the following key result areas: outcomes-based learning and teaching; responsive research and community engagement, viable resource generation and mobilization; good governance towards effective human capital formation and sustainable development of Caraga Region and beyond.',
    location: 'Ampayon, Butuan City, Agusan del Norte, Philippines',
    website: 'https://www.carsu.edu.ph/'
  });

  // CSU Core Values (aligned with CSU: Competence, Service, Uprightness)
  const [csuCoreValues, setCsuCoreValues] = useState<CoreValue[]>([
    {
      id: 'csu-1',
      title: 'Competence',
      description: 'Excellence in academic and professional standards, continuously developing skills and knowledge to meet global standards.',
      icon: GraduationCap,
      color: 'emerald'
    },
    {
      id: 'csu-2',
      title: 'Service',
      description: 'Dedicated commitment to serving the community, region, and nation through responsive education and transformative engagement.',
      icon: Handshake,
      color: 'amber'
    },
    {
      id: 'csu-3',
      title: 'Uprightness',
      description: 'Unwavering adherence to ethical principles, integrity, honesty, and moral values in all university operations.',
      icon: Shield,
      color: 'blue'
    }
  ]);

  // PMO Information
  const [pmoInfo, setPmoInfo] = useState({
    established: '2018',
    purpose: 'Coordinating, monitoring, and evaluating university development projects in alignment with CSU\'s transformative mission.',
    scope: 'Construction infrastructure, university operations, research programs, GAD initiatives, forms and policies management.',
    vision: 'To be the leading project management office in the Philippines, recognized for excellence in delivering transformative university projects.',
    mission: 'To provide comprehensive project management services ensuring successful university initiatives while maintaining transparency and accountability.'
  });

  // PMO Core Values (operational values for project management)
  const [pmoCoreValues, setPmoCoreValues] = useState<CoreValue[]>([
    {
      id: 'pmo-1',
      title: 'Transparency',
      description: 'Open communication in all project activities, ensuring public access to information and accountability.',
      icon: Shield,
      color: 'blue'
    },
    {
      id: 'pmo-2',
      title: 'Excellence',
      description: 'Commitment to delivering high-quality results that exceed stakeholder expectations through continuous improvement.',
      icon: CheckCircle,
      color: 'emerald'
    },
    {
      id: 'pmo-3',
      title: 'Innovation',
      description: 'Embracing new technologies and methodologies to improve project outcomes and efficiency.',
      icon: Lightbulb,
      color: 'purple'
    },
    {
      id: 'pmo-4',
      title: 'Collaboration',
      description: 'Working together with stakeholders and partners to achieve shared goals and mutual success.',
      icon: Users,
      color: 'orange'
    },
    {
      id: 'pmo-5',
      title: 'Accountability',
      description: 'Taking responsibility for actions, decisions, and delivering on commitments to all stakeholders.',
      icon: UserCheck,
      color: 'amber'
    },
    {
      id: 'pmo-6',
      title: 'Sustainability',
      description: 'Integrating environmental and social sustainability principles in all project planning and execution.',
      icon: Globe,
      color: 'green'
    }
  ]);

  // Consolidated Objectives (Strategic and Performance combined)
  const [objectives, setObjectives] = useState<Objective[]>([
    {
      id: '1',
      category: 'strategic',
      title: 'Mission Alignment',
      description: 'Ensure all projects support CSU\'s transformative mission and sustainable regional development',
      target: '100%'
    },
    {
      id: '2',
      category: 'strategic',
      title: 'Digital Innovation',
      description: 'Implement digital solutions in projects, supporting CSU\'s digital university vision',
      target: '90%'
    },
    {
      id: '3',
      category: 'strategic',
      title: 'Stakeholder Engagement',
      description: 'Foster partnerships with university community, government, and external stakeholders',
      target: '100%'
    },
    {
      id: '4',
      category: 'performance',
      title: 'Project Success Rate',
      description: 'Maintain on-time completion rate through competent project management',
      target: '95%'
    },
    {
      id: '5',
      category: 'performance',
      title: 'Budget Precision',
      description: 'Maintain budget variance within approved allocations',
      target: '±5%'
    },
    {
      id: '6',
      category: 'performance',
      title: 'Quality Standards',
      description: 'Maintain high quality ratings through rigorous monitoring',
      target: '95%'
    }
  ]);

  // Team Members - Updated with actual PMO/GAD organizational structure
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'ROLYN C. DAGUIL, PhD.',
      position: 'University President',
      department: 'Office of the President',
      email: 'president@carsu.edu.ph',
      phone: '+63 85 342 5555'
    },
    {
      id: '2',
      name: 'MICHELLE V. JAPITANA, D.ENG',
      position: 'Vice President for Executive Leadership and Research Director',
      department: 'Office of the Vice President',
      email: 'm.japitana@carsu.edu.ph',
      phone: '+63 85 342 5556'
    },
    {
      id: '3',
      name: 'Engr. Stephanie Albores - Salcedo',
      position: 'Division Chief, Division for Strategic Research and Management',
      department: 'Strategic Research and Management',
      email: 's.salcedo@carsu.edu.ph',
      phone: '+63 85 342 5557'
    },
    {
      id: '4',
      name: 'MARJORIE L. ESCARTIN',
      position: 'Director, Project Management Office',
      department: 'Project Management Office',
      email: 'm.escartin@carsu.edu.ph',
      phone: '+63 85 342 5558'
    },
    {
      id: '5',
      name: 'MEO ANGELO ALCANTARA',
      position: 'Project Management Officer',
      department: 'Project Management Office',
      email: 'm.alcantara@carsu.edu.ph',
      phone: '+63 85 342 5559'
    },
    {
      id: '6',
      name: 'LUTESS C. GALLARDO, MSc',
      position: 'Monitoring and Evaluation Office Coordinator',
      department: 'Monitoring and Evaluation Office',
      email: 'l.gallardo@carsu.edu.ph',
      phone: '+63 85 342 5560'
    },
    {
      id: '7',
      name: 'AR. DERWIN T. GUMBAN, MPA',
      position: 'Head, Land Use and Infrastructure',
      department: 'Land and Infrastructure',
      email: 'd.gumban@carsu.edu.ph',
      phone: '+63 85 342 5561'
    },
    {
      id: '8',
      name: 'ALEXANDER BRYAN O. ESTROBÓ',
      position: 'General Management Officer',
      department: 'University Operations',
      email: 'a.estrobo@carsu.edu.ph',
      phone: '+63 85 342 5562'
    },
    {
      id: '9',
      name: 'NICO LUMINARIAS',
      position: 'Training Coordinator',
      department: 'Gender and Development',
      email: 'n.luminarias@carsu.edu.ph',
      phone: '+63 85 342 5563'
    }
  ]);

  // Essential statistics
  const [teamStats, setTeamStats] = useState([
    { label: 'Projects Managed', value: '142+', icon: Target },
    { label: 'Years of Operation', value: '6+', icon: Calendar },
    { label: 'Success Rate', value: '94.2%', icon: Award }
  ]);

  // Contact Information - PMO and GAD Organizational Contacts
  const [contactInfo, setContactInfo] = useState<ContactInfo[]>([
    {
      id: '1',
      type: 'address',
      label: 'Office Location',
      value: 'Caraga State University\nAmpayon, Butuan City\nAgusan del Norte, Philippines 8600',
      icon: MapPin
    },
    {
      id: '2',
      type: 'phone',
      label: 'Contact Numbers',
      value: 'PMO: +63 85 342 5555\nGAD: +63 85 342 5556',
      icon: Phone
    },
    {
      id: '3',
      type: 'email',
      label: 'Email Addresses',
      value: 'PMO: pmo@carsu.edu.ph\nGAD: gad@carsu.edu.ph',
      icon: Mail
    },
    {
      id: '4',
      type: 'online',
      label: 'Facebook',
      value: 'facebook.com/CarSUOfficial',
      icon: Globe
    },
    {
      id: '5',
      type: 'hours',
      label: 'Office Hours',
      value: 'Monday - Friday\n8:00 AM - 5:00 PM',
      icon: Clock
    }
  ]);

  // OPTIMIZED NAVIGATION STRUCTURE (5 sections instead of 8)
  const navigationSections = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'csu-identity', label: 'CSU Identity', icon: Building2 },
    { id: 'pmo-mission', label: 'PMO Mission', icon: Compass },
    { id: 'personnel', label: 'Personnel', icon: Contact },
    { id: 'contact', label: 'Contact', icon: Target }
  ];

  // CRUD Functions
  const handleEdit = (item: any, type: EditModalState['editingType'], isNew = false) => {
    if (!isAdmin) {
      toast.error('Access denied. Admin privileges required.');
      return;
    }

    setEditModal({
      isOpen: true,
      editingItem: isNew ? getDefaultItem(type) : { ...item },
      editingType: type,
      isNew
    });
  };

  const getDefaultItem = (type: EditModalState['editingType']) => {
    switch (type) {
      case 'value':
        return {
          id: `new-${Date.now()}`,
          title: '',
          description: '',
          icon: Shield,
          color: 'emerald'
        };
      case 'objective':
        return {
          id: `new-${Date.now()}`,
          category: 'strategic',
          title: '',
          description: '',
          target: ''
        };
      case 'personnel':
        return {
          id: `new-${Date.now()}`,
          name: '',
          position: '',
          department: '',
          email: '',
          phone: ''
        };
      case 'contact':
        return {
          id: `new-${Date.now()}`,
          type: 'email',
          label: '',
          value: '',
          icon: Mail
        };
      default:
        return {};
    }
  };

  const handleSave = () => {
    if (!editModal.editingItem) return;

    try {
      switch (editModal.editingType) {
        case 'csu-info':
          setCsuInfo(prev => ({ ...prev, ...editModal.editingItem }));
          break;
        case 'pmo-info':
          setPmoInfo(prev => ({ ...prev, ...editModal.editingItem }));
          break;
        case 'value':
          if (editModal.isNew) {
            if (editModal.editingItem.id.startsWith('csu-')) {
              setCsuCoreValues(prev => [...prev, editModal.editingItem]);
            } else {
              setPmoCoreValues(prev => [...prev, editModal.editingItem]);
            }
          } else {
            if (editModal.editingItem.id.startsWith('csu-')) {
              setCsuCoreValues(prev => prev.map(v => v.id === editModal.editingItem.id ? editModal.editingItem : v));
            } else {
              setPmoCoreValues(prev => prev.map(v => v.id === editModal.editingItem.id ? editModal.editingItem : v));
            }
          }
          break;
        case 'objective':
          if (editModal.isNew) {
            setObjectives(prev => [...prev, editModal.editingItem]);
          } else {
            setObjectives(prev => prev.map(obj => obj.id === editModal.editingItem.id ? editModal.editingItem : obj));
          }
          break;
        case 'personnel':
          if (editModal.isNew) {
            setTeamMembers(prev => [...prev, editModal.editingItem]);
          } else {
            setTeamMembers(prev => prev.map(member => member.id === editModal.editingItem.id ? editModal.editingItem : member));
          }
          break;
        case 'contact':
          if (editModal.isNew) {
            setContactInfo(prev => [...prev, editModal.editingItem]);
          } else {
            setContactInfo(prev => prev.map(contact => contact.id === editModal.editingItem.id ? editModal.editingItem : contact));
          }
          break;
      }

      toast.success(editModal.isNew ? 'Item added successfully!' : 'Item updated successfully!');
      setEditModal({ isOpen: false, editingItem: null, editingType: 'section', isNew: false });
    } catch (error) {
      toast.error('Failed to save changes. Please try again.');
    }
  };

  const handleDelete = (id: string, type: EditModalState['editingType']) => {
    if (!isAdmin) {
      toast.error('Access denied. Admin privileges required.');
      return;
    }

    try {
      switch (type) {
        case 'value':
          if (id.startsWith('csu-')) {
            setCsuCoreValues(prev => prev.filter(v => v.id !== id));
          } else {
            setPmoCoreValues(prev => prev.filter(v => v.id !== id));
          }
          break;
        case 'objective':
          setObjectives(prev => prev.filter(obj => obj.id !== id));
          break;
        case 'personnel':
          setTeamMembers(prev => prev.filter(member => member.id !== id));
          break;
        case 'contact':
          setContactInfo(prev => prev.filter(contact => contact.id !== id));
          break;
      }
      toast.success('Item deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete item. Please try again.');
    }
  };

  const scrollToSection = (sectionId: string, fromButton = false) => {
    console.log('🎯 About Us - Scrolling to section:', sectionId, fromButton ? '(from button)' : '(from navigation)');
    
    // Immediate visual feedback for better UX
    if (fromButton) {
      setActiveSection(sectionId);
    }
    
    // Enhanced scroll function with fixed navigation lock
    const performScroll = () => {
      const element = document.getElementById(sectionId);
      
      if (!element) {
        console.warn('❌ About Us - Target element not found:', sectionId);
        setActiveSection('overview');
        return;
      }
      
      console.log('✅ About Us - Target element found:', sectionId);
      
      // Calculate offset heights
      const clientNavbar = document.querySelector('.client-navbar');
      const stickyNav = document.querySelector('[data-sticky-nav]');
      
      let totalOffset = 20; // Base padding
      
      if (clientNavbar) {
        totalOffset += clientNavbar.getBoundingClientRect().height;
      }
      
      if (stickyNav && stickyNav !== clientNavbar) {
        totalOffset += stickyNav.getBoundingClientRect().height;
      }
      
      // Get element position and calculate target
      const elementRect = element.getBoundingClientRect();
      const elementPosition = elementRect.top + window.pageYOffset;
      const targetPosition = Math.max(0, elementPosition - totalOffset);
      
      console.log('📍 About Us - Scroll calculation:', {
        sectionId,
        targetPosition,
        totalOffset
      });
      
      // Perform smooth scroll
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
      
      // Set visual feedback without locking
      if (!fromButton) {
        setTimeout(() => {
          setActiveSection(sectionId);
        }, 100);
      }
      
      // Add highlight effect
      element.classList.add('section-highlight');
      setTimeout(() => {
        element.classList.remove('section-highlight');
      }, 1500);
    };
    
    // Execute scroll immediately
    requestAnimationFrame(performScroll);
  };

  // Fixed scroll detection system without navigation lock
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;
    let rafId: number;
    
    const handleScrollDetection = () => {
      // Calculate navigation offset
      const clientNavbar = document.querySelector('.client-navbar');
      const stickyNav = document.querySelector('[data-sticky-nav]');
      
      let detectionOffset = 100; // Base offset for section detection
      
      if (clientNavbar) {
        detectionOffset += clientNavbar.getBoundingClientRect().height;
      }
      if (stickyNav && stickyNav !== clientNavbar) {
        detectionOffset += stickyNav.getBoundingClientRect().height;
      }
      
      const sections = navigationSections.map(section => section.id);
      const viewportHeight = window.innerHeight;
      
      // Simple and reliable section detection
      let detectedSection = sections[0]; // Default fallback
      
      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (!element) continue;
        
        const rect = element.getBoundingClientRect();
        const elementTop = rect.top;
        const elementBottom = rect.bottom;
        
        // Check if section header is in the detection zone
        if (elementTop <= detectionOffset && elementBottom > detectionOffset) {
          detectedSection = sectionId;
          break;
        }
        
        // Fallback: check if section is currently visible
        if (elementTop < viewportHeight * 0.3 && elementBottom > detectionOffset) {
          detectedSection = sectionId;
        }
      }
      
      // Update active section if changed
      if (detectedSection !== activeSection) {
        console.log('📍 About Us - Section detection:', {
          previousSection: activeSection,
          newSection: detectedSection
        });
        
        setActiveSection(detectedSection);
      }
    };
    
    // Optimized scroll event handler
    const handleScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      
      rafId = requestAnimationFrame(() => {
        if (scrollTimeout) clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(handleScrollDetection, 50); // Faster response
      });
    };
    
    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial detection
    setTimeout(handleScrollDetection, 100);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [activeSection, navigationSections]);

  // Simplified navigation effect
  useEffect(() => {
    if (currentSection) {
      console.log('🚀 About Us - Navigation effect triggered:', currentSection);
      
      // Section mapping with aliases
      const sectionMap: { [key: string]: string } = {
        'overview': 'overview',
        'csu-identity': 'csu-identity',
        'pmo-mission': 'pmo-mission',
        'personnel': 'personnel',
        'contact': 'contact',
        'personnel-org-chart': 'personnel',
        'office-objectives': 'pmo-mission',
        'pmo-contact-details': 'contact',
        'csu-values': 'csu-identity',
        'pmo-values': 'pmo-mission',
        'objectives': 'pmo-mission',
        'about-us': 'overview',
        'values': 'csu-identity',
        'client-about-us': 'overview'
      };
      
      const targetSection = sectionMap[currentSection] || 'overview';
      
      console.log('🎯 About Us - Navigating to section:', targetSection);
      
      // Simple navigation execution
      setTimeout(() => {
        setActiveSection(targetSection);
        scrollToSection(targetSection, false);
      }, 100);
    }
  }, [currentSection]);

  // Remove the isNavigationReady state as it's not needed anymore


  // Icon mapping for dynamic use
  const iconMap: { [key: string]: any } = {
    GraduationCap, Handshake, Shield, CheckCircle, Lightbulb, Users, UserCheck, Globe,
    Mail, Phone, MapPin, Eye, Building2, Compass, Contact, Target, Award, Calendar
  };

  // Color mapping for badges and accents
  const colorMap: { [key: string]: string } = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    green: 'bg-green-50 text-green-700 border-green-200'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      {/* Enhanced Client Navbar */}
      <ClientNavbar 
        onNavigate={onNavigate}
        onSignIn={onSignIn}
        onSignOut={onSignOut}
        onNavigateToDashboard={onNavigateToDashboard}
        userRole={userRole}
        userProfile={userProfile}
        requireAuth={requireAuth}
        onAuthModalSignIn={onAuthModalSignIn}
        demoMode={demoMode}
      />

      {/* Enhanced Hero Section with Professional Design */}
      <section className="relative pt-16 pb-20 bg-gradient-to-br from-emerald-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-72 h-72 bg-emerald-100 dark:bg-emerald-900/20 rounded-full opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-100 dark:bg-amber-900/20 rounded-full opacity-20 translate-x-1/3 translate-y-1/3"></div>
        </div>
        <div className="absolute inset-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            {/* Enhanced Logo Section with better alignment */}
            <div className="flex flex-col items-center gap-6 mb-12">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-600 to-amber-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <Building2 className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center">
                  <Award className="h-3 w-3 text-white" />
                </div>
              </div>
              
              <div className="text-center space-y-3">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                  About {csuInfo.name}
                  {isAdmin && (
                    <Button
                      onClick={() => handleEdit(csuInfo, 'csu-info')}
                      variant="ghost"
                      size="sm"
                      className="ml-3 text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                    >
                      <Edit className="h-5 w-5" />
                    </Button>
                  )}
                </h1>
                <h2 className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 font-medium">
                  Project Management Office
                </h2>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="h-4 w-4" />
                  <span>Established {pmoInfo.established}</span>
                </div>
              </div>
            </div>
            
            {/* Enhanced description with better typography */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-8 md:p-12 mb-16">
                <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-200 leading-relaxed mb-6">
                  Supporting CSU's transformative mission through excellent project management and transparency 
                  in university development.
                </p>
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  Our commitment to excellence drives infrastructure development, academic program enhancement, 
                  and institutional advancement initiatives that align with CSU's Vision 2028.
                </p>
                
                {/* Call-to-action buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                  <Button 
                    onClick={() => scrollToSection('personnel', true)}
                    className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Users className="h-5 w-5 mr-2" />
                    Meet Our Team
                  </Button>
                  <Button 
                    onClick={() => scrollToSection('contact', true)}
                    variant="outline"
                    className="border-emerald-600 dark:border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 px-6 py-3 rounded-xl"
                  >
                    <Contact className="h-5 w-5 mr-2" />
                    Get in Touch
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Quick Stats with improved design */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="group relative overflow-hidden bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 hover:border-emerald-200 dark:hover:border-emerald-700 transition-all duration-500 hover:transform hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-amber-50/50 dark:from-emerald-900/20 dark:to-amber-900/20 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                  <CardContent className="relative p-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-amber-500 dark:from-emerald-600 dark:to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">{stat.value}</p>
                    <p className="text-base font-medium text-gray-600 dark:text-gray-300">{stat.label}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Enhanced Sticky Navigation - Professional Design */}
      <div className="sticky top-16 z-30 bg-white/98 dark:bg-gray-900/98 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm" data-sticky-nav>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-6 overflow-x-auto">
            <div className="flex space-x-3">
              {navigationSections.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "default" : "outline"}
                    size="lg"
                    onClick={(e) => {
                      e.preventDefault();
                      console.log('🔘 About Us - Navigation button clicked:', item.id);
                      scrollToSection(item.id, true);
                    }}
                    data-active={isActive}
                    className={`
                      nav-section-button min-w-fit whitespace-nowrap transition-all duration-300 px-6 py-3 rounded-xl font-medium
                      ${isActive 
                        ? 'active bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-500 dark:to-teal-500 text-white hover:from-emerald-700 hover:to-teal-700 dark:hover:from-emerald-600 dark:hover:to-teal-600 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/50 transform scale-105' 
                        : 'text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 dark:hover:from-emerald-900/20 dark:hover:to-teal-900/20 border-gray-300 dark:border-gray-600 hover:border-emerald-200 dark:hover:border-emerald-700 hover:shadow-md'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5 mr-2" />
                    {item.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Optimized for better navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        
        {/* 1. OVERVIEW SECTION - Enhanced Design */}
        <section id="overview" className="scroll-mt-32">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Eye className="h-4 w-4" />
              System Overview
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">PMO Dashboard Overview</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Comprehensive project management services supporting CSU's transformative mission through 
              innovation, transparency, and excellence.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            <Card className="group relative overflow-hidden bg-gradient-to-br from-white to-emerald-50/30 dark:from-gray-800 dark:to-emerald-900/10 border-emerald-100 dark:border-emerald-800 hover:border-emerald-200 dark:hover:border-emerald-700 transition-all duration-500 hover:shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100 dark:bg-emerald-900/30 rounded-full opacity-20 transform translate-x-16 -translate-y-16"></div>
              <CardHeader className="pb-6 relative">
                <CardTitle className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <Building2 className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">About This System</h3>
                    <p className="text-emerald-600 dark:text-emerald-400 font-medium">Transparency & Excellence</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg mb-6">
                  The PMO Monitoring & Evaluation Dashboard provides comprehensive visibility into university development projects. 
                  This system prioritizes transparency by allowing public access to project data while maintaining professional 
                  project management standards aligned with CSU's Vision 2028.
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                    <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <span className="font-medium text-gray-800 dark:text-gray-200">Transparency First Approach</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                    <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <span className="font-medium text-gray-800 dark:text-gray-200">Professional Standards</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                    <Target className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <span className="font-medium text-gray-800 dark:text-gray-200">Vision 2028 Alignment</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden bg-gradient-to-br from-white to-amber-50/30 dark:from-gray-800 dark:to-amber-900/10 border-amber-100 dark:border-amber-800 hover:border-amber-200 dark:hover:border-amber-700 transition-all duration-500 hover:shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100 dark:bg-amber-900/30 rounded-full opacity-20 transform translate-x-16 -translate-y-16"></div>
              <CardHeader className="pb-6 relative">
                <CardTitle className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <Compass className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Our Purpose</h3>
                    <p className="text-amber-600 dark:text-amber-400 font-medium">Strategic Excellence</p>
                    {isAdmin && (
                      <Button
                        onClick={() => handleEdit(pmoInfo, 'pmo-info')}
                        variant="ghost"
                        size="sm"
                        className="absolute top-0 right-0 opacity-70 hover:opacity-100"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg mb-6">
                  {pmoInfo.purpose}
                </p>
                
                <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-sm border border-amber-100 dark:border-amber-800">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/50 rounded-lg flex items-center justify-center">
                      <Target className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-gray-100">Scope of Services</h4>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{pmoInfo.scope}</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Mission and Vision Cards */}
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-blue-900 dark:text-blue-300">
                  <div className="w-12 h-12 bg-blue-500 dark:bg-blue-600 rounded-xl flex items-center justify-center">
                    <Eye className="h-6 w-6 text-white" />
                  </div>
                  PMO Vision
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-800 dark:text-blue-200 leading-relaxed text-lg">{pmoInfo.vision}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-purple-900 dark:text-purple-300">
                  <div className="w-12 h-12 bg-purple-500 dark:bg-purple-600 rounded-xl flex items-center justify-center">
                    <Compass className="h-6 w-6 text-white" />
                  </div>
                  PMO Mission
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-purple-800 dark:text-purple-200 leading-relaxed text-lg">{pmoInfo.mission}</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 2. CSU IDENTITY SECTION (Combined: CSU Info + CSU Values) */}
        <section id="csu-identity" className="scroll-mt-32 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 py-20">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Building2 className="h-4 w-4" />
              University Identity
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">About Caraga State University</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Our foundation, mission, vision, and core values that guide every action toward 
              transformative education and sustainable development.
            </p>
          </div>

          {/* CSU Institution Information - Enhanced Design */}
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            <Card className="lg:col-span-3 relative overflow-hidden dark:bg-gray-800 dark:border-gray-700">
              {/* Background accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-50 to-amber-50 dark:from-emerald-900/20 dark:to-amber-900/20 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
              
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl dark:text-gray-100">About Our Institution</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Foundation, mission, and guiding principles</p>
                  </div>
                  {isAdmin && (
                    <Button
                      onClick={() => handleEdit(csuInfo, 'csu-info')}
                      variant="ghost"
                      size="sm"
                      className="opacity-70 hover:opacity-100"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                        <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        Vision 2028
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                        {csuInfo.vision}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                        <Compass className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        Mission
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                        {csuInfo.mission}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                        <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        Quality Policy
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                        {csuInfo.qualityPolicy}
                      </p>
                    </div>
                    
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Institution Details</h5>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Established {csuInfo.establishedYear}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          <span>{csuInfo.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <ExternalLink className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          <a href={csuInfo.website} target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">
                            Visit Official Website
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CSU Core Values */}
          <div className="mb-8">
            <div className="flex flex-col items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center mb-3">CSU Core Values</h3>
              {isAdmin && (
                <Button
                  onClick={() => handleEdit(null, 'value', true)}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Value
                </Button>
              )}
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {csuCoreValues.map((value) => {
                const Icon = value.icon;
                return (
                  <Card key={value.id} className="relative group hover:shadow-lg transition-all duration-300 dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 dark:text-gray-100">
                        <div className={`p-2 rounded-lg ${colorMap[value.color] || 'bg-gray-50 text-gray-700'}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        {value.title}
                        {isAdmin && (
                          <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <Button
                              onClick={() => handleEdit(value, 'value')}
                              variant="ghost"
                              size="sm"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              onClick={() => handleDelete(value.id, 'value')}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{value.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* 3. PMO MISSION & VALUES SECTION (Combined: PMO Mission/Vision + Objectives + PMO Values) */}
        <section id="pmo-mission" className="scroll-mt-32 bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 dark:from-indigo-950/30 dark:via-blue-950/30 dark:to-cyan-950/30 py-20">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Compass className="h-4 w-4" />
              Mission & Values
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">PMO Mission & Values</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Our mission, strategic objectives, and operational values that drive project excellence 
              and transformative outcomes.
            </p>
          </div>

          {/* PMO Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                  <Compass className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Our Mission
                  {isAdmin && (
                    <Button
                      onClick={() => handleEdit(pmoInfo, 'pmo-info')}
                      variant="ghost"
                      size="sm"
                      className="ml-auto"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-center">
                  {pmoInfo.mission}
                </p>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                  <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  Our Vision
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-center">
                  {pmoInfo.vision}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Objectives */}
          <div className="mb-12">
            <div className="flex flex-col items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center mb-3">Strategic Objectives</h3>
              {isAdmin && (
                <Button
                  onClick={() => handleEdit(null, 'objective', true)}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Objective
                </Button>
              )}
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {objectives.map((objective) => (
                <Card key={objective.id} className="relative group hover:shadow-lg transition-all duration-300 dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Badge 
                          variant="outline" 
                          className={`mb-2 ${objective.category === 'strategic' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'}`}
                        >
                          {objective.category === 'strategic' ? 'Strategic' : 'Performance'}
                        </Badge>
                        <CardTitle className="text-lg dark:text-gray-100">{objective.title}</CardTitle>
                      </div>
                      {isAdmin && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <Button
                            onClick={() => handleEdit(objective, 'objective')}
                            variant="ghost"
                            size="sm"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(objective.id, 'objective')}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-3">{objective.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Target:</span>
                      <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                        {objective.target}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* PMO Values - Enhanced Design */}
          <div>
            <div className="flex flex-col items-center text-center mb-12 gap-6">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">PMO Operational Values</h3>
                <p className="text-lg text-gray-600 dark:text-gray-300">Core principles that guide our project management approach</p>
              </div>
              {isAdmin && (
                <Button
                  onClick={() => handleEdit(null, 'value', true)}
                  className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 shadow-lg"
                  size="lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Value
                </Button>
              )}
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mx-4">
              {pmoCoreValues.map((value, index) => {
                const Icon = value.icon;
                
                // Enhanced color mapping for better visual hierarchy
                const enhancedColorMap = {
                  'blue': { bg: 'from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30', icon: 'bg-blue-500 dark:bg-blue-600', border: 'border-blue-200 dark:border-blue-700', text: 'text-blue-700 dark:text-blue-300' },
                  'emerald': { bg: 'from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30', icon: 'bg-emerald-500 dark:bg-emerald-600', border: 'border-emerald-200 dark:border-emerald-700', text: 'text-emerald-700 dark:text-emerald-300' },
                  'purple': { bg: 'from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30', icon: 'bg-purple-500 dark:bg-purple-600', border: 'border-purple-200 dark:border-purple-700', text: 'text-purple-700 dark:text-purple-300' },
                  'orange': { bg: 'from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30', icon: 'bg-orange-500 dark:bg-orange-600', border: 'border-orange-200 dark:border-orange-700', text: 'text-orange-700 dark:text-orange-300' },
                  'amber': { bg: 'from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30', icon: 'bg-amber-500 dark:bg-amber-600', border: 'border-amber-200 dark:border-amber-700', text: 'text-amber-700 dark:text-amber-300' },
                  'green': { bg: 'from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30', icon: 'bg-green-500 dark:bg-green-600', border: 'border-green-200 dark:border-green-700', text: 'text-green-700 dark:text-green-300' }
                };
                
                const colors = enhancedColorMap[value.color] || enhancedColorMap['blue'];
                
                return (
                  <Card key={value.id} className={`group relative overflow-hidden bg-gradient-to-br ${colors.bg} ${colors.border} hover:shadow-2xl transition-all duration-500 hover:transform hover:scale-105`}>
                    {/* Decorative background element */}
                    <div className="absolute top-0 right-0 w-28 h-28 bg-white/20 dark:bg-white/5 rounded-full transform translate-x-14 -translate-y-14"></div>
                    
                    <CardHeader className="pb-4 relative">
                      <CardTitle className="flex items-start gap-4">
                        <div className={`w-14 h-14 ${colors.icon} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 flex-shrink-0`}>
                          <Icon className="h-7 w-7 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">{value.title}</h3>
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colors.text} bg-white/80 dark:bg-gray-800/80`}>
                            <Star className="h-3 w-3" />
                            Core Value
                          </div>
                        </div>
                        {isAdmin && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <Button
                              onClick={() => handleEdit(value, 'value')}
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => handleDelete(value.id, 'value')}
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4">
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{value.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* 4. PERSONNEL & ORGANIZATION SECTION */}
        <section id="personnel" className="scroll-mt-32 bg-gradient-to-br from-slate-50 to-white dark:from-gray-800 dark:to-gray-900 py-20">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Users className="h-4 w-4" />
              Team & Organization
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">Personnel & Organization</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Meet our dedicated team of professionals committed to project excellence and 
              transformative university development.
            </p>
          </div>

          {/* PMO/GAD Organizational Chart - Redesigned */}
          <div className="mb-20">
            <Card className="relative overflow-hidden bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="relative p-6">
                {/* Organizational Chart Image with Full View Option */}
                <div className="relative group">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                    <img 
                      src={organizationChartImage} 
                      alt="PMO/GAD Organizational Structure"
                      className="w-full h-auto max-h-[600px] object-contain rounded-lg"
                      style={{ maxWidth: '900px', margin: '0 auto', display: 'block' }}
                    />
                  </div>
                  
                  {/* Full View Button */}
                  <div className="mt-4 text-center">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="border-emerald-600 dark:border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Full Size
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-[98vw] w-auto p-2 max-h-[98vh] dark:bg-gray-800">
                        <DialogHeader className="px-4 pt-2 pb-1">
                          <DialogTitle className="text-lg dark:text-gray-100">PMO/GAD Organizational Structure</DialogTitle>
                        </DialogHeader>
                        <div className="overflow-auto max-h-[calc(98vh-80px)] px-4 pb-4">
                          <img 
                            src={organizationChartImage} 
                            alt="PMO/GAD Organizational Structure - Full View"
                            className="w-auto h-auto max-w-none"
                            style={{ minWidth: '100%', objectFit: 'contain' }}
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>


        </section>

        {/* 5. CONTACT INFORMATION SECTION - Formal & Professional Design */}
        <section id="contact" className="scroll-mt-32 bg-white dark:bg-gray-900 py-24">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-5 py-3 rounded-xl font-semibold mb-6 border border-emerald-200 dark:border-emerald-700 shadow-sm">
                <Contact className="h-5 w-5" />
                Contact Information
              </div>
              <h2 className="text-4xl md:text-5xl text-gray-900 dark:text-gray-100 mb-6 font-bold">Get in Touch</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Contact our Project Management Office for inquiries and collaboration opportunities
              </p>
            </div>

            <div className="flex items-center justify-between mb-12">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Contact Details</h3>
                <p className="text-base text-gray-600 dark:text-gray-300">Professional communication channels for PMO and GAD offices</p>
              </div>
              {isAdmin && (
                <Button
                  onClick={() => handleEdit(null, 'contact', true)}
                  className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 shadow-md px-6 py-3"
                  size="default"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Contact
                </Button>
              )}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
            {contactInfo.map((contact) => {
              const Icon = contact.icon;
              
              // Define colors based on contact type - enhanced formal color scheme
              const colorMap = {
                'address': { 
                  iconBg: 'bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200', 
                  iconColor: 'text-emerald-700',
                  cardBg: 'from-emerald-50/50 via-white to-emerald-50/30'
                },
                'phone': { 
                  iconBg: 'bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200', 
                  iconColor: 'text-blue-700',
                  cardBg: 'from-blue-50/50 via-white to-blue-50/30'
                },
                'email': { 
                  iconBg: 'bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200', 
                  iconColor: 'text-indigo-700',
                  cardBg: 'from-indigo-50/50 via-white to-indigo-50/30'
                },
                'online': { 
                  iconBg: 'bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200', 
                  iconColor: 'text-purple-700',
                  cardBg: 'from-purple-50/50 via-white to-purple-50/30'
                },
                'hours': { 
                  iconBg: 'bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200', 
                  iconColor: 'text-amber-700',
                  cardBg: 'from-amber-50/50 via-white to-amber-50/30'
                }
              };
              
              const colors = colorMap[contact.type] || colorMap['email'];
              
              // Parse email and phone values for clickable links
              const renderContactValue = () => {
                const lines = contact.value.split('\n');
                
                if (contact.type === 'email') {
                  return (
                    <div className="space-y-3">
                      {lines.map((line, idx) => {
                        const emailMatch = line.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
                        if (emailMatch) {
                          const email = emailMatch[1];
                          const prefix = line.substring(0, line.indexOf(email));
                          return (
                            <div key={idx} className="flex flex-col space-y-1">
                              {prefix && <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">{prefix.trim()}</span>}
                              <a 
                                href={`mailto:${email}`}
                                className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline transition-colors font-semibold text-base inline-flex items-center gap-2"
                              >
                                <Mail className="h-4 w-4" />
                                {email}
                              </a>
                            </div>
                          );
                        }
                        return <div key={idx} className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">{line}</div>;
                      })}
                    </div>
                  );
                }
                
                if (contact.type === 'phone') {
                  return (
                    <div className="space-y-3">
                      {lines.map((line, idx) => {
                        const phoneMatch = line.match(/(\+?\d[\d\s-]+)/);
                        if (phoneMatch) {
                          const phone = phoneMatch[1];
                          const prefix = line.substring(0, line.indexOf(phone));
                          return (
                            <div key={idx} className="flex flex-col space-y-1">
                              {prefix && <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">{prefix.trim()}</span>}
                              <a 
                                href={`tel:${phone.replace(/\s/g, '')}`}
                                className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline transition-colors font-semibold text-base inline-flex items-center gap-2"
                              >
                                <Phone className="h-4 w-4" />
                                {phone}
                              </a>
                            </div>
                          );
                        }
                        return <div key={idx} className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">{line}</div>;
                      })}
                    </div>
                  );
                }
                
                if (contact.type === 'online') {
                  return (
                    <a 
                      href={`https://${contact.value}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors font-semibold text-base inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 px-4 py-3 rounded-lg border border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/50"
                    >
                      <Globe className="h-5 w-5" />
                      <span className="flex-1">{contact.value}</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  );
                }
                
                return (
                  <div className="text-gray-700 dark:text-gray-300 text-base leading-relaxed whitespace-pre-line space-y-2">
                    {contact.type === 'address' && <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400 inline mr-2" />}
                    {contact.type === 'hours' && <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400 inline mr-2" />}
                    {contact.value}
                  </div>
                );
              };
              
              return (
                <Card key={contact.id} className="group relative overflow-hidden bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 shadow-md hover:shadow-xl transition-all duration-500 hover:transform hover:-translate-y-1">
                  {/* Enhanced gradient overlay with formal design */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${colors.cardBg} dark:from-transparent dark:to-transparent pointer-events-none`} />
                  
                  <CardHeader className="pb-5 relative z-10">
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 ${colors.iconBg} dark:bg-opacity-20 dark:border-opacity-30 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                        <Icon className={`h-7 w-7 ${colors.iconColor} dark:opacity-90`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 leading-tight">
                          {contact.label}
                        </CardTitle>
                        <div className="inline-flex items-center gap-2">
                          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-600 shadow-sm">
                            {contact.type}
                          </span>
                        </div>
                      </div>
                      {isAdmin && (
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Button
                            onClick={() => handleEdit(contact, 'contact')}
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 p-0 hover:bg-white/80 dark:hover:bg-gray-700/80 rounded-xl border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(contact.id, 'contact')}
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 p-0 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl border border-transparent hover:border-red-200 dark:hover:border-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0 relative z-10">
                    <div className="bg-white/90 dark:bg-gray-700/50 backdrop-blur-sm rounded-xl p-5 border border-gray-100 dark:border-gray-600 shadow-sm">
                      {renderContactValue()}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          {/* Call-to-Action Section */}
          <div className="text-center mt-16">
            <Card className="inline-block bg-white border-2 border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-500">
              <CardContent className="p-10">
                <div className="flex flex-col items-center text-center gap-6 mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg">
                    <Handshake className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-3">Ready to Collaborate?</h3>
                    <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed">Let's work together on transformative projects that drive university excellence</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                    onClick={() => window.location.href = 'mailto:pmo@carsu.edu.ph'}
                  >
                    <Mail className="h-5 w-5 mr-3" />
                    Send Email
                  </Button>
                  <Button 
                    variant="outline"
                    className="border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-10 py-4 rounded-xl font-semibold transition-all duration-300"
                    onClick={() => window.location.href = 'tel:+6385342555'}
                  >
                    <Phone className="h-5 w-5 mr-3" />
                    Call Us
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        </section>
      </div>

      {/* Enhanced Edit Modal */}
      <Dialog open={editModal.isOpen} onOpenChange={(open) => !open && setEditModal(prev => ({ ...prev, isOpen: false }))}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editModal.isNew ? 'Add New' : 'Edit'} {
                editModal.editingType === 'csu-info' ? 'CSU Information' :
                editModal.editingType === 'pmo-info' ? 'PMO Information' :
                editModal.editingType === 'value' ? 'Value' :
                editModal.editingType === 'objective' ? 'Objective' :
                editModal.editingType === 'personnel' ? 'Team Member' :
                editModal.editingType === 'contact' ? 'Contact Information' : 'Item'
              }
            </DialogTitle>
            <DialogDescription>
              {editModal.isNew ? 'Add a new item to the collection.' : 'Make changes to the selected item.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {editModal.editingType === 'csu-info' && (
              <>
                <div>
                  <Label htmlFor="name">University Name</Label>
                  <Input
                    id="name"
                    value={editModal.editingItem?.name || ''}
                    onChange={(e) => setEditModal(prev => ({
                      ...prev,
                      editingItem: { ...prev.editingItem, name: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="vision">Vision</Label>
                  <Textarea
                    id="vision"
                    value={editModal.editingItem?.vision || ''}
                    onChange={(e) => setEditModal(prev => ({
                      ...prev,
                      editingItem: { ...prev.editingItem, vision: e.target.value }
                    }))}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="mission">Mission</Label>
                  <Textarea
                    id="mission"
                    value={editModal.editingItem?.mission || ''}
                    onChange={(e) => setEditModal(prev => ({
                      ...prev,
                      editingItem: { ...prev.editingItem, mission: e.target.value }
                    }))}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="qualityPolicy">Quality Policy</Label>
                  <Textarea
                    id="qualityPolicy"
                    value={editModal.editingItem?.qualityPolicy || ''}
                    onChange={(e) => setEditModal(prev => ({
                      ...prev,
                      editingItem: { ...prev.editingItem, qualityPolicy: e.target.value }
                    }))}
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="establishedYear">Established Year</Label>
                    <Input
                      id="establishedYear"
                      value={editModal.editingItem?.establishedYear || ''}
                      onChange={(e) => setEditModal(prev => ({
                        ...prev,
                        editingItem: { ...prev.editingItem, establishedYear: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={editModal.editingItem?.website || ''}
                      onChange={(e) => setEditModal(prev => ({
                        ...prev,
                        editingItem: { ...prev.editingItem, website: e.target.value }
                      }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={editModal.editingItem?.location || ''}
                    onChange={(e) => setEditModal(prev => ({
                      ...prev,
                      editingItem: { ...prev.editingItem, location: e.target.value }
                    }))}
                  />
                </div>
              </>
            )}

            {editModal.editingType === 'pmo-info' && (
              <>
                <div>
                  <Label htmlFor="purpose">Purpose</Label>
                  <Textarea
                    id="purpose"
                    value={editModal.editingItem?.purpose || ''}
                    onChange={(e) => setEditModal(prev => ({
                      ...prev,
                      editingItem: { ...prev.editingItem, purpose: e.target.value }
                    }))}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="scope">Scope</Label>
                  <Textarea
                    id="scope"
                    value={editModal.editingItem?.scope || ''}
                    onChange={(e) => setEditModal(prev => ({
                      ...prev,
                      editingItem: { ...prev.editingItem, scope: e.target.value }
                    }))}
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="mission">Mission</Label>
                  <Textarea
                    id="mission"
                    value={editModal.editingItem?.mission || ''}
                    onChange={(e) => setEditModal(prev => ({
                      ...prev,
                      editingItem: { ...prev.editingItem, mission: e.target.value }
                    }))}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="vision">Vision</Label>
                  <Textarea
                    id="vision"
                    value={editModal.editingItem?.vision || ''}
                    onChange={(e) => setEditModal(prev => ({
                      ...prev,
                      editingItem: { ...prev.editingItem, vision: e.target.value }
                    }))}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="established">Established Year</Label>
                  <Input
                    id="established"
                    value={editModal.editingItem?.established || ''}
                    onChange={(e) => setEditModal(prev => ({
                      ...prev,
                      editingItem: { ...prev.editingItem, established: e.target.value }
                    }))}
                  />
                </div>
              </>
            )}

            {editModal.editingType === 'value' && (
              <>
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={editModal.editingItem?.title || ''}
                    onChange={(e) => setEditModal(prev => ({
                      ...prev,
                      editingItem: { ...prev.editingItem, title: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={editModal.editingItem?.description || ''}
                    onChange={(e) => setEditModal(prev => ({
                      ...prev,
                      editingItem: { ...prev.editingItem, description: e.target.value }
                    }))}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="color">Color Theme</Label>
                  <Select
                    value={editModal.editingItem?.color || 'emerald'}
                    onValueChange={(value) => setEditModal(prev => ({
                      ...prev,
                      editingItem: { ...prev.editingItem, color: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="emerald">Emerald</SelectItem>
                      <SelectItem value="amber">Amber</SelectItem>
                      <SelectItem value="blue">Blue</SelectItem>
                      <SelectItem value="purple">Purple</SelectItem>
                      <SelectItem value="orange">Orange</SelectItem>
                      <SelectItem value="green">Green</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {editModal.editingType === 'objective' && (
              <>
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={editModal.editingItem?.title || ''}
                    onChange={(e) => setEditModal(prev => ({
                      ...prev,
                      editingItem: { ...prev.editingItem, title: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={editModal.editingItem?.description || ''}
                    onChange={(e) => setEditModal(prev => ({
                      ...prev,
                      editingItem: { ...prev.editingItem, description: e.target.value }
                    }))}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={editModal.editingItem?.category || 'strategic'}
                      onValueChange={(value) => setEditModal(prev => ({
                        ...prev,
                        editingItem: { ...prev.editingItem, category: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="strategic">Strategic</SelectItem>
                        <SelectItem value="performance">Performance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="target">Target</Label>
                    <Input
                      id="target"
                      value={editModal.editingItem?.target || ''}
                      onChange={(e) => setEditModal(prev => ({
                        ...prev,
                        editingItem: { ...prev.editingItem, target: e.target.value }
                      }))}
                    />
                  </div>
                </div>
              </>
            )}

            {editModal.editingType === 'personnel' && (
              <>
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={editModal.editingItem?.name || ''}
                    onChange={(e) => setEditModal(prev => ({
                      ...prev,
                      editingItem: { ...prev.editingItem, name: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    value={editModal.editingItem?.position || ''}
                    onChange={(e) => setEditModal(prev => ({
                      ...prev,
                      editingItem: { ...prev.editingItem, position: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={editModal.editingItem?.department || ''}
                    onChange={(e) => setEditModal(prev => ({
                      ...prev,
                      editingItem: { ...prev.editingItem, department: e.target.value }
                    }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editModal.editingItem?.email || ''}
                      onChange={(e) => setEditModal(prev => ({
                        ...prev,
                        editingItem: { ...prev.editingItem, email: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={editModal.editingItem?.phone || ''}
                      onChange={(e) => setEditModal(prev => ({
                        ...prev,
                        editingItem: { ...prev.editingItem, phone: e.target.value }
                      }))}
                    />
                  </div>
                </div>
              </>
            )}

            {editModal.editingType === 'contact' && (
              <>
                <div>
                  <Label htmlFor="label">Label</Label>
                  <Input
                    id="label"
                    value={editModal.editingItem?.label || ''}
                    onChange={(e) => setEditModal(prev => ({
                      ...prev,
                      editingItem: { ...prev.editingItem, label: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="value">Contact Information</Label>
                  <Textarea
                    id="value"
                    value={editModal.editingItem?.value || ''}
                    onChange={(e) => setEditModal(prev => ({
                      ...prev,
                      editingItem: { ...prev.editingItem, value: e.target.value }
                    }))}
                    rows={3}
                    placeholder="Enter contact details (use line breaks for multiple items)"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Contact Type</Label>
                  <Select
                    value={editModal.editingItem?.type || 'email'}
                    onValueChange={(value) => setEditModal(prev => ({
                      ...prev,
                      editingItem: { 
                        ...prev.editingItem, 
                        type: value,
                        icon: value === 'email' ? Mail : value === 'phone' ? Phone : value === 'address' ? MapPin : Mail
                      }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="address">Address</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditModal({ isOpen: false, editingItem: null, editingType: 'section', isNew: false })}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              {editModal.isNew ? 'Add' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}