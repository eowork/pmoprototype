import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Separator } from '../../ui/separator';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { toast } from 'sonner@2.0.3';
import { 
  FileText, 
  Download, 
  Search,
  Filter,
  Eye,
  CheckCircle,
  FileCheck,
  Users,
  Building2,
  Activity,
  FolderOpen,
  ExternalLink,
  Plus,
  Edit,
  Trash2,
  Upload,
  X
} from 'lucide-react';
import { ClientNavbar } from '../components/ClientNavbar';
import { NavigationProps } from '../types';

interface ClientDownloadableFormsPageProps extends NavigationProps {
  currentSection?: string;
}

interface FormItem {
  id: string;
  title: string;
  category: string;
  downloads: number;
  fileSize: string;
  status: 'active' | 'draft' | 'archived';
  lastUpdated: string;
  uploadedDate: string;
  department: string;
  uploadedBy: string;
  description: string;
  purpose: string;
  audience: string;
  difficulty: 'Basic' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  fileUrl?: string;
}

// Client-specific forms data with enhanced descriptions
const CLIENT_FORMS_DATA = {
  formsList: [
    {
      id: 'hgdg-16',
      title: 'HGDG-16 Sectoral Forms',
      category: 'GAD Reporting',
      downloads: 324,
      fileSize: '2.1 MB',
      status: 'active' as const,
      lastUpdated: '2024-01-15',
      uploadedDate: '2024-01-15',
      department: 'Planning and Development Office',
      uploadedBy: 'Maria Santos',
      description: 'Comprehensive sectoral reporting forms for gender and development activities across university programs',
      purpose: 'Track gender parity initiatives and sectoral development progress',
      audience: 'Department heads, GAD coordinators, and program managers',
      difficulty: 'Intermediate' as const,
      estimatedTime: '30-45 minutes',
      icon: Users,
      color: 'purple'
    },
    {
      id: 'pimme-checklist',
      title: 'PIMME Checklist',
      category: 'Project Monitoring',
      downloads: 287,
      fileSize: '1.8 MB',
      status: 'active' as const,
      lastUpdated: '2024-01-10',
      uploadedDate: '2024-01-10',
      department: 'Project Management Office',
      uploadedBy: 'John Dela Cruz',
      description: 'Project implementation monitoring and evaluation checklist for systematic project tracking',
      purpose: 'Ensure systematic monitoring of project implementation phases',
      audience: 'Project managers, coordinators, and implementation teams',
      difficulty: 'Intermediate' as const,
      estimatedTime: '20-30 minutes',
      icon: CheckCircle,
      color: 'emerald'
    },
    {
      id: 'pmo-monthly',
      title: 'PMO Monthly Accomplishment Form',
      category: 'Progress Reporting',
      downloads: 245,
      fileSize: '1.5 MB',
      status: 'active' as const,
      lastUpdated: '2024-01-05',
      uploadedDate: '2024-01-05',
      department: 'Project Management Office',
      uploadedBy: 'Anna Garcia',
      description: 'Monthly progress reporting forms for documenting PMO activities and achievements',
      purpose: 'Document monthly progress and accomplishments systematically',
      audience: 'PMO staff, project coordinators, and reporting officers',
      difficulty: 'Basic' as const,
      estimatedTime: '15-25 minutes',
      icon: Activity,
      color: 'blue'
    },
    {
      id: 'evaluation-plan',
      title: 'Evaluation Plan Template',
      category: 'Evaluation',
      downloads: 198,
      fileSize: '2.3 MB',
      status: 'active' as const,
      lastUpdated: '2023-12-20',
      uploadedDate: '2023-12-20',
      department: 'Planning and Development Office',
      uploadedBy: 'Robert Cruz',
      description: 'Comprehensive template for developing project evaluation plans and assessment frameworks',
      purpose: 'Structure evaluation processes and assessment methodologies',
      audience: 'Evaluation specialists, researchers, and planning officers',
      difficulty: 'Advanced' as const,
      estimatedTime: '45-60 minutes',
      icon: CheckCircle,
      color: 'orange'
    },
    {
      id: 'monitoring-plan',
      title: 'Monitoring Plan Template',
      category: 'Monitoring',
      downloads: 123,
      fileSize: '2.0 MB',
      status: 'active' as const,
      lastUpdated: '2023-12-18',
      uploadedDate: '2023-12-18',
      department: 'Project Management Office',
      uploadedBy: 'Lisa Wong',
      description: 'Structured template for creating comprehensive project monitoring plans and tracking systems',
      purpose: 'Establish systematic monitoring frameworks for projects',
      audience: 'Monitoring officers, project managers, and planning teams',
      difficulty: 'Advanced' as const,
      estimatedTime: '40-55 minutes',
      icon: Activity,
      color: 'indigo'
    },
    {
      id: 'csu-me-plan',
      title: 'CSU M&E Plan Framework',
      category: 'M&E Framework',
      downloads: 170,
      fileSize: '3.2 MB',
      status: 'active' as const,
      lastUpdated: '2023-12-15',
      uploadedDate: '2023-12-15',
      department: 'Planning and Development Office',
      uploadedBy: 'Dr. Patricia Reyes',
      description: 'Comprehensive monitoring and evaluation plan framework for Caraga State University operations',
      purpose: 'Guide institutional M&E practices and standardize evaluation approaches',
      audience: 'Senior administrators, planning officers, and institutional researchers',
      difficulty: 'Advanced' as const,
      estimatedTime: '60-90 minutes',
      icon: Building2,
      color: 'violet'
    }
  ],

  categories: [
    { name: 'All Forms', count: 6, color: 'gray' },
    { name: 'GAD Reporting', count: 1, color: 'purple' },
    { name: 'Project Monitoring', count: 1, color: 'emerald' },
    { name: 'Progress Reporting', count: 1, color: 'blue' },
    { name: 'Evaluation', count: 1, color: 'orange' },
    { name: 'Monitoring', count: 1, color: 'indigo' },
    { name: 'M&E Framework', count: 1, color: 'violet' }
  ]
};

export default function ClientDownloadableFormsPage({
  onNavigate,
  onSignIn,
  onSignOut,
  onNavigateToDashboard,
  userRole = 'Client',
  userProfile,
  requireAuth,
  onAuthModalSignIn,
  demoMode = false,
  currentSection = 'overview'
}: ClientDownloadableFormsPageProps) {
  const [activeSection, setActiveSection] = useState(currentSection);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Forms');
  const [sortBy, setSortBy] = useState('downloads');
  const [filteredForms, setFilteredForms] = useState<FormItem[]>(CLIENT_FORMS_DATA.formsList);
  const [isNavigating, setIsNavigating] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingForm, setEditingForm] = useState<FormItem | null>(null);
  const [forms, setForms] = useState<FormItem[]>(CLIENT_FORMS_DATA.formsList);

  // Form state for CRUD operations
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    purpose: '',
    audience: '',
    difficulty: 'Basic' as const,
    estimatedTime: '',
    department: '',
    file: null as File | null
  });

  // Navigation sections
  const navigationSections = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'forms-catalog', label: 'Forms Catalog', icon: FolderOpen },
    { id: 'categories', label: 'Categories', icon: Filter }
  ];

  // Check if user has admin access
  const hasAdminAccess = userProfile && ['Admin', 'Staff'].includes(userProfile.role);

  // Enhanced scroll function consistent with other client pages
  const scrollToSection = (sectionId: string, fromButton = false) => {
    // Validate section before attempting to scroll
    const validSections = navigationSections.map(section => section.id);
    
    if (!validSections.includes(sectionId)) {
      console.warn('⚠️ Client Forms - Invalid section for scrolling:', sectionId, 'Available sections:', validSections);
      console.log('🎯 Client Forms - Redirecting to overview section');
      sectionId = 'overview';
    }
    
    console.log('🎯 Client Forms - Enhanced scrolling to section:', sectionId, fromButton ? '(from button)' : '(from navigation)');
    
    if (fromButton) {
      setIsNavigating(true);
      setActiveSection(sectionId);
    }
    
    const performEnhancedScroll = () => {
      const element = document.getElementById(sectionId);
      
      if (!element) {
        console.warn('❌ Client Forms - Target element not found:', sectionId);
        // Fall back to overview if the target element still doesn't exist
        const overviewElement = document.getElementById('overview');
        if (overviewElement) {
          sectionId = 'overview';
          setActiveSection('overview');
          // Re-assign element to overview
          const finalElement = overviewElement;
          
          const clientNavbar = document.querySelector('.client-navbar');
          const stickyNav = document.querySelector('[data-sticky-nav]');
          
          let totalOffset = 30;
          
          if (clientNavbar) {
            totalOffset += clientNavbar.getBoundingClientRect().height;
          }
          
          if (stickyNav && stickyNav !== clientNavbar) {
            totalOffset += stickyNav.getBoundingClientRect().height;
          }
          
          const elementRect = finalElement.getBoundingClientRect();
          const elementPosition = elementRect.top + window.pageYOffset;
          const targetPosition = Math.max(0, elementPosition - totalOffset);
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
          
          setTimeout(() => {
            if (!fromButton) {
              setActiveSection(sectionId);
            }
            
            finalElement.classList.add('section-highlight');
            setTimeout(() => {
              finalElement.classList.remove('section-highlight');
            }, 1500);
            
            if (fromButton) {
              setIsNavigating(false);
            }
          }, 500);
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          setActiveSection('overview');
          if (fromButton) {
            setIsNavigating(false);
          }
        }
        return;
      }
      
      const clientNavbar = document.querySelector('.client-navbar');
      const stickyNav = document.querySelector('[data-sticky-nav]');
      
      let totalOffset = 30;
      
      if (clientNavbar) {
        totalOffset += clientNavbar.getBoundingClientRect().height;
      }
      
      if (stickyNav && stickyNav !== clientNavbar) {
        totalOffset += stickyNav.getBoundingClientRect().height;
      }
      
      const elementRect = element.getBoundingClientRect();
      const elementPosition = elementRect.top + window.pageYOffset;
      const targetPosition = Math.max(0, elementPosition - totalOffset);
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
      
      setTimeout(() => {
        if (!fromButton) {
          setActiveSection(sectionId);
        }
        
        element.classList.add('section-highlight');
        setTimeout(() => {
          element.classList.remove('section-highlight');
        }, 1500);
        
        if (fromButton) {
          setIsNavigating(false);
        }
      }, 500);
    };
    
    requestAnimationFrame(() => {
      setTimeout(performEnhancedScroll, 50);
    });
  };

  // Scroll detection
  useEffect(() => {
    let isScrolling = false;
    let scrollTimer: NodeJS.Timeout;
    
    const handleScrollDetection = () => {
      if (isScrolling || isNavigating) return;
      
      const clientNavbar = document.querySelector('.client-navbar');
      const stickyNav = document.querySelector('[data-sticky-nav]');
      
      let offset = 150;
      
      if (clientNavbar) {
        offset += clientNavbar.getBoundingClientRect().height;
      }
      
      if (stickyNav) {
        offset += stickyNav.getBoundingClientRect().height;
      }
      
      let currentSection = 'overview';
      
      for (const section of navigationSections) {
        const element = document.getElementById(section.id);
        if (!element) continue;
        
        const rect = element.getBoundingClientRect();
        
        if (rect.top <= offset && rect.bottom > offset) {
          currentSection = section.id;
          break;
        }
      }
      
      if (currentSection !== activeSection) {
        console.log('📍 Client Forms - Section changed via scroll:', currentSection);
        setActiveSection(currentSection);
      }
    };
    
    const handleScroll = () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(handleScrollDetection, 100);
    };
    
    const markScrolling = () => {
      isScrolling = true;
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        isScrolling = false;
      }, 300);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('wheel', markScrolling, { passive: true });
    window.addEventListener('touchmove', markScrolling, { passive: true });
    
    setTimeout(handleScrollDetection, 300);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', markScrolling);
      window.removeEventListener('touchmove', markScrolling);
      clearTimeout(scrollTimer);
    };
  }, [activeSection, navigationSections, isNavigating]);

  // Handle deep linking with improved validation
  useEffect(() => {
    if (currentSection && currentSection !== activeSection) {
      const validSections = navigationSections.map(section => section.id);
      
      // Check if the current section is valid, if not default to overview
      if (validSections.includes(currentSection)) {
        console.log('🎯 Client Forms - Deep linking to valid section:', currentSection);
        setTimeout(() => {
          setActiveSection(currentSection);
          scrollToSection(currentSection, false);
        }, 300);
      } else {
        console.warn('⚠️ Client Forms - Invalid section requested:', currentSection, 'Available sections:', validSections);
        console.log('🎯 Client Forms - Defaulting to overview section');
        setTimeout(() => {
          setActiveSection('overview');
          scrollToSection('overview', false);
        }, 300);
      }
    }
  }, [currentSection, navigationSections]);

  const handleSectionChange = (section: string) => {
    const validSections = navigationSections.map(s => s.id);
    
    if (!validSections.includes(section)) {
      console.warn('⚠️ Client Forms - Invalid section change requested:', section, 'Available sections:', validSections);
      section = 'overview';
    }
    
    console.log('🎯 Client Forms - Section change requested:', section);
    scrollToSection(section, true);
    onNavigate?.('client-forms', section);
  };

  // Filter and sort forms
  useEffect(() => {
    let filtered = forms;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(form =>
        form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        form.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        form.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'All Forms') {
      filtered = filtered.filter(form => form.category === selectedCategory);
    }

    // Sort forms
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'downloads':
          return b.downloads - a.downloads;
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        case 'recent':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

    setFilteredForms(filtered);
  }, [searchQuery, selectedCategory, sortBy, forms]);

  // CRUD Functions
  const handleAddForm = () => {
    if (!hasAdminAccess) {
      toast.error('You need admin access to add forms');
      return;
    }
    
    if (!formData.title || !formData.category || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newForm: FormItem = {
      id: `form-${Date.now()}`,
      title: formData.title,
      category: formData.category,
      description: formData.description,
      purpose: formData.purpose,
      audience: formData.audience,
      difficulty: formData.difficulty,
      estimatedTime: formData.estimatedTime,
      department: formData.department || userProfile?.department || 'Unknown',
      downloads: 0,
      fileSize: formData.file ? `${(formData.file.size / (1024 * 1024)).toFixed(1)} MB` : '0 MB',
      status: 'active',
      lastUpdated: new Date().toISOString().split('T')[0],
      uploadedDate: new Date().toISOString().split('T')[0],
      uploadedBy: userProfile?.name || 'Unknown',
      icon: FileText,
      color: 'blue'
    };

    setForms([...forms, newForm]);
    setShowAddForm(false);
    setFormData({
      title: '',
      category: '',
      description: '',
      purpose: '',
      audience: '',
      difficulty: 'Basic',
      estimatedTime: '',
      department: '',
      file: null
    });
    toast.success('Form added successfully');
  };

  const handleEditForm = (form: FormItem) => {
    if (!hasAdminAccess) {
      toast.error('You need admin access to edit forms');
      return;
    }
    
    setEditingForm(form);
    setFormData({
      title: form.title,
      category: form.category,
      description: form.description,
      purpose: form.purpose,
      audience: form.audience,
      difficulty: form.difficulty,
      estimatedTime: form.estimatedTime,
      department: form.department,
      file: null
    });
    setShowEditForm(true);
  };

  const handleUpdateForm = () => {
    if (!editingForm) return;

    const updatedForm: FormItem = {
      ...editingForm,
      title: formData.title,
      category: formData.category,
      description: formData.description,
      purpose: formData.purpose,
      audience: formData.audience,
      difficulty: formData.difficulty,
      estimatedTime: formData.estimatedTime,
      department: formData.department,
      lastUpdated: new Date().toISOString().split('T')[0],
      fileSize: formData.file ? `${(formData.file.size / (1024 * 1024)).toFixed(1)} MB` : editingForm.fileSize
    };

    setForms(forms.map(form => form.id === editingForm.id ? updatedForm : form));
    setShowEditForm(false);
    setEditingForm(null);
    setFormData({
      title: '',
      category: '',
      description: '',
      purpose: '',
      audience: '',
      difficulty: 'Basic',
      estimatedTime: '',
      department: '',
      file: null
    });
    toast.success('Form updated successfully');
  };

  const handleDeleteForm = (formId: string) => {
    if (!hasAdminAccess) {
      toast.error('You need admin access to delete forms');
      return;
    }
    
    setForms(forms.filter(form => form.id !== formId));
    toast.success('Form deleted successfully');
  };

  // Utility functions
  const handleDownload = (formId: string, formTitle: string) => {
    // Simulate download
    toast.success(`Downloading ${formTitle}...`);
    console.log(`Download started for form: ${formId}`);
    
    // Update download count
    setForms(forms.map(form => 
      form.id === formId 
        ? { ...form, downloads: form.downloads + 1 }
        : form
    ));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Basic':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Advanced':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getColorClasses = (color: string) => {
    const colors = {
      purple: 'from-purple-500 to-purple-600',
      emerald: 'from-emerald-500 to-emerald-600',
      blue: 'from-blue-500 to-blue-600',
      orange: 'from-orange-500 to-orange-600',
      indigo: 'from-indigo-500 to-indigo-600',
      violet: 'from-violet-500 to-violet-600'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, file });
    }
  };

  return (
    <div className="min-h-screen bg-background client-page">
      <ClientNavbar 
        onNavigate={onNavigate} 
        onSignIn={onSignIn}
        onSignOut={onSignOut}
        onNavigateToDashboard={onNavigateToDashboard}
        userProfile={userProfile}
        onAuthModalSignIn={onAuthModalSignIn}
        demoMode={demoMode}
      />
      
      {/* Hero Section - Simplified and consistent with other client pages */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="w-16 h-16 bg-blue-600 dark:bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-6">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Downloadable Forms
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Access essential forms and templates for project management, monitoring, evaluation, and reporting across Caraga State University operations.
          </p>
        </div>
      </section>

      {/* Navigation Menu */}
      <section className="py-6 px-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-16 z-30" data-sticky-nav>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-3 justify-center">
            {navigationSections.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeSection === item.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleSectionChange(item.id)}
                  className={`transition-all duration-200 ${
                    activeSection === item.id
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md dark:bg-blue-500 dark:hover:bg-blue-600'
                      : 'border-gray-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section id="overview" className="py-16 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Forms Overview</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Essential forms and templates for university project management
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <Card className="border-gray-200 dark:border-gray-700 dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 dark:text-white">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <FileCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  Purpose & Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  Our downloadable forms collection provides standardized templates and documentation tools for effective project management, monitoring, and evaluation across Caraga State University.
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Standardized reporting formats</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Monitoring and evaluation templates</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Progress tracking documentation</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-gray-200 dark:border-gray-700 dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 dark:text-white">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  Who Can Use These Forms
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  These forms are designed for various stakeholders in the university community involved in project management and institutional development.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Building2 className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                    <div className="font-semibold text-blue-900 dark:text-blue-300 text-sm">Department Heads</div>
                    <div className="text-xs text-blue-700 dark:text-blue-400">Administrative leaders</div>
                  </div>
                  <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
                    <div className="font-semibold text-emerald-900 dark:text-emerald-300 text-sm">Project Managers</div>
                    <div className="text-xs text-emerald-700 dark:text-emerald-400">Implementation teams</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <Activity className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                    <div className="font-semibold text-purple-900 dark:text-purple-300 text-sm">M&E Officers</div>
                    <div className="text-xs text-purple-700 dark:text-purple-400">Evaluation specialists</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <Users className="w-8 h-8 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
                    <div className="font-semibold text-orange-900 dark:text-orange-300 text-sm">Planning Officers</div>
                    <div className="text-xs text-orange-700 dark:text-orange-400">Strategic planners</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Forms Catalog Section */}
      <section id="forms-catalog" className="py-16 px-4 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Forms Catalog</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">Browse and download official CSU forms</p>
            </div>
            {hasAdminAccess && (
              <Button onClick={() => setShowAddForm(true)} className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
                <Plus className="w-4 h-4 mr-2" />
                Add Form
              </Button>
            )}
          </div>

          {/* Search and Filter Controls */}
          <div className="mb-8 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
              <Input
                placeholder="Search forms by title, description, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {CLIENT_FORMS_DATA.categories.map((category) => (
                  <SelectItem key={category.name} value={category.name}>
                    {category.name} ({category.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="downloads">Most Downloaded</SelectItem>
                <SelectItem value="alphabetical">Alphabetical</SelectItem>
                <SelectItem value="recent">Recently Updated</SelectItem>
                <SelectItem value="category">Category</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Forms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredForms.map((form) => {
              const Icon = form.icon;
              
              return (
                <Card key={form.id} className="client-card-hover border-gray-200 dark:border-gray-700 dark:bg-gray-800 h-full flex flex-col">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-12 h-12 bg-gradient-to-r ${getColorClasses(form.color)} rounded-xl flex items-center justify-center`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">
                          {form.category}
                        </Badge>
                        {hasAdminAccess && (
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditForm(form)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteForm(form.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    <CardTitle className="text-lg leading-tight dark:text-white">{form.title}</CardTitle>
                    <CardDescription className="text-sm dark:text-gray-400">{form.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Purpose:</span>
                        <span className="text-gray-900 dark:text-gray-100 text-right text-xs max-w-32 truncate" title={form.purpose}>
                          {form.purpose}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Estimated time:</span>
                        <span className="text-gray-900 dark:text-gray-100">{form.estimatedTime}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Difficulty:</span>
                        <Badge className={getDifficultyColor(form.difficulty)} variant="outline">
                          {form.difficulty}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">File size:</span>
                        <span className="text-gray-900 dark:text-gray-100">{form.fileSize}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Downloads:</span>
                        <span className="text-gray-900 dark:text-gray-100">{form.downloads.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Last updated:</span>
                        <span className="text-gray-900 dark:text-gray-100">{formatDate(form.lastUpdated)}</span>
                      </div>
                    </div>

                    <div className="mt-auto space-y-3">
                      <Separator className="dark:bg-gray-700" />
                      <div className="flex items-center gap-2">
                        <Button 
                          onClick={() => handleDownload(form.id, form.title)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                        Provided by {form.department}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredForms.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No forms found</h3>
              <p className="text-gray-600 dark:text-gray-400">Try adjusting your search criteria or filters.</p>
            </div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="py-16 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Filter className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Form Categories</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">Organized collections of forms by functional area</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CLIENT_FORMS_DATA.categories.slice(1).map((category) => { // Skip "All Forms"
              const form = forms.find(f => f.category === category.name);
              const Icon = form?.icon || FileText;
              
              return (
                <Card key={category.name} className="client-card-hover border-gray-200 dark:border-gray-700 dark:bg-gray-800 cursor-pointer" 
                      onClick={() => setSelectedCategory(category.name)}>
                  <CardHeader className="text-center">
                    <div className={`w-12 h-12 bg-gradient-to-r ${form ? getColorClasses(form.color) : 'from-gray-500 to-gray-600'} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg dark:text-white">{category.name}</CardTitle>
                    <CardDescription className="dark:text-gray-400">
                      {category.count} form{category.count !== 1 ? 's' : ''} available
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Button 
                      variant="outline" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCategory(category.name);
                        scrollToSection('forms-catalog', true);
                      }}
                      className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      Browse Forms
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Add Form Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Form</DialogTitle>
            <DialogDescription>
              Upload a new form template for university operations.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter form title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GAD Reporting">GAD Reporting</SelectItem>
                  <SelectItem value="Project Monitoring">Project Monitoring</SelectItem>
                  <SelectItem value="Progress Reporting">Progress Reporting</SelectItem>
                  <SelectItem value="Evaluation">Evaluation</SelectItem>
                  <SelectItem value="Monitoring">Monitoring</SelectItem>
                  <SelectItem value="M&E Framework">M&E Framework</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter form description"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="purpose">Purpose</Label>
              <Input
                id="purpose"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                placeholder="Enter form purpose"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="audience">Target Audience</Label>
              <Input
                id="audience"
                value={formData.audience}
                onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                placeholder="Enter target audience"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select value={formData.difficulty} onValueChange={(value: 'Basic' | 'Intermediate' | 'Advanced') => setFormData({ ...formData, difficulty: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Basic">Basic</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="estimatedTime">Estimated Time</Label>
                <Input
                  id="estimatedTime"
                  value={formData.estimatedTime}
                  onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                  placeholder="e.g., 15-30 minutes"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="Enter department name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="file">Upload File</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  className="flex-1"
                />
                <Upload className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-xs text-gray-500">
                Supported formats: PDF, DOC, DOCX, XLS, XLSX
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddForm}>Add Form</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Form Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Form</DialogTitle>
            <DialogDescription>
              Update the form information and file.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter form title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GAD Reporting">GAD Reporting</SelectItem>
                  <SelectItem value="Project Monitoring">Project Monitoring</SelectItem>
                  <SelectItem value="Progress Reporting">Progress Reporting</SelectItem>
                  <SelectItem value="Evaluation">Evaluation</SelectItem>
                  <SelectItem value="Monitoring">Monitoring</SelectItem>
                  <SelectItem value="M&E Framework">M&E Framework</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description *</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter form description"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-purpose">Purpose</Label>
              <Input
                id="edit-purpose"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                placeholder="Enter form purpose"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-audience">Target Audience</Label>
              <Input
                id="edit-audience"
                value={formData.audience}
                onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                placeholder="Enter target audience"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-difficulty">Difficulty</Label>
                <Select value={formData.difficulty} onValueChange={(value: 'Basic' | 'Intermediate' | 'Advanced') => setFormData({ ...formData, difficulty: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Basic">Basic</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-estimatedTime">Estimated Time</Label>
                <Input
                  id="edit-estimatedTime"
                  value={formData.estimatedTime}
                  onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                  placeholder="e.g., 15-30 minutes"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-department">Department</Label>
              <Input
                id="edit-department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="Enter department name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-file">Update File (Optional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="edit-file"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  className="flex-1"
                />
                <Upload className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-xs text-gray-500">
                Leave empty to keep current file. Supported formats: PDF, DOC, DOCX, XLS, XLSX
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditForm(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateForm}>Update Form</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}