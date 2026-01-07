import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Separator } from '../../ui/separator';
import { 
  Building2, 
  GraduationCap, 
  Wrench, 
  Users, 
  BarChart3, 
  Download, 
  Shield,
  ArrowRight,
  Award,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  Edit3,
  Save,
  X
} from 'lucide-react';
import { ClientNavbar } from '../components/ClientNavbar';
import { HeroSection } from '../components/HeroSection';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { toast } from 'sonner@2.0.3';

interface HomePageProps {
  onNavigate?: (page: string) => void;
  onSignIn?: () => void;
  userRole?: string;
  requireAuth?: (action: string) => boolean;
}

interface EditableSection {
  id: string;
  title: string;
  content: string;
  editable: boolean;
}

export function HomePage({ onNavigate, onSignIn, userRole = 'Client', requireAuth }: HomePageProps) {
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editableSections, setEditableSections] = useState<EditableSection[]>([
    {
      id: 'hero-title',
      title: 'Hero Title',
      content: 'CSU Project Management Office',
      editable: true
    },
    {
      id: 'hero-subtitle',
      title: 'Hero Subtitle',
      content: 'Monitoring & Evaluation Dashboard',
      editable: true
    },
    {
      id: 'hero-description',
      title: 'Hero Description',
      content: 'Comprehensive project management system for Caraga State University\'s infrastructure development, academic programs, and institutional advancement initiatives.',
      editable: true
    }
  ]);

  const isAdmin = userRole === 'Admin' || userRole === 'Moderator';

  useEffect(() => {
    const loadStats = async () => {
      try {
        const mockStats = {
          totalProjects: 127,
          activeProjects: 23,
          completedProjects: 94,
          categories: {
            construction: 45,
            operations: 32,
            repairs: 28,
            research: 22
          }
        };
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStatsData(mockStats);
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const handleEditSection = (sectionId: string) => {
    if (!requireAuth?.('edit content')) return;
    setEditingSection(sectionId);
  };

  const handleSaveSection = (sectionId: string, newContent: string) => {
    setEditableSections(prev => 
      prev.map(section => 
        section.id === sectionId ? { ...section, content: newContent } : section
      )
    );
    setEditingSection(null);
    toast.success('Content updated successfully');
  };

  const getEditableContent = (sectionId: string) => {
    return editableSections.find(section => section.id === sectionId)?.content || '';
  };

  const quickStats = [
    {
      title: "Active Projects",
      value: "127",
      description: "Ongoing infrastructure and development projects",
      icon: Building2,
      color: "text-emerald-600"
    },
    {
      title: "Completed Programs", 
      value: "94",
      description: "Successfully delivered academic and infrastructure programs",
      icon: Award,
      color: "text-emerald-600"
    },
    {
      title: "Research Projects",
      value: "22", 
      description: "Active research and extension programs",
      icon: GraduationCap,
      color: "text-amber-600"
    },
    {
      title: "Facility Improvements",
      value: "156",
      description: "Classroom and administrative facility enhancements",
      icon: Wrench,
      color: "text-amber-600"
    }
  ];

  const featuredCategories = [
    {
      id: 'university-operations',
      title: 'University Operations',
      description: 'Academic programs, research initiatives, and extension services supporting the university mission.',
      icon: GraduationCap,
      stats: { projects: 32, status: 'Active' },
      color: 'emerald'
    },
    {
      id: 'construction-of-infrastructure',
      title: 'Construction & Infrastructure',
      description: 'Major infrastructure development projects funded through various sources and partnerships.',
      icon: Building2,
      stats: { projects: 45, status: 'Ongoing' },
      color: 'blue'
    },
    {
      id: 'repairs',
      title: 'Repairs & Maintenance',
      description: 'Facility repairs, maintenance projects, and infrastructure improvements across all campuses.',
      icon: Wrench,
      stats: { projects: 28, status: 'Active' },
      color: 'orange'
    },
    {
      id: 'gad-parity-knowledge-management',
      title: 'GAD Parity Reporting',
      description: 'Gender equity analysis, reporting, and data management for institutional compliance.',
      icon: Users,
      stats: { reports: 12, status: 'Updated' },
      color: 'purple'
    },
    {
      id: 'policies',
      title: 'Policies & Forms',
      description: 'Governance frameworks, institutional agreements, and downloadable administrative forms.',
      icon: Shield,
      stats: { documents: 89, status: 'Available' },
      color: 'amber'
    }
  ];

  const EditableText = ({ sectionId, children, className = "" }: { sectionId: string; children: React.ReactNode; className?: string }) => {
    const [tempContent, setTempContent] = useState('');
    const isEditing = editingSection === sectionId;
    const content = getEditableContent(sectionId);

    useEffect(() => {
      if (isEditing) {
        setTempContent(content);
      }
    }, [isEditing, content]);

    if (!isAdmin) {
      return <div className={className}>{children}</div>;
    }

    return (
      <div className={`relative group ${className}`}>
        {isEditing ? (
          <div className="space-y-2">
            {sectionId.includes('description') ? (
              <Textarea
                value={tempContent}
                onChange={(e) => setTempContent(e.target.value)}
                className="w-full"
                rows={3}
              />
            ) : (
              <Input
                value={tempContent}
                onChange={(e) => setTempContent(e.target.value)}
                className="w-full"
              />
            )}
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleSaveSection(sectionId, tempContent)}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Save className="h-3 w-3 mr-1" />
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditingSection(null)}
              >
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            {children}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleEditSection(sectionId)}
              className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm border"
            >
              <Edit3 className="h-3 w-3" />
            </Button>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <ClientNavbar onNavigate={onNavigate} onSignIn={onSignIn} />
      
      {/* Hero Section - Editable */}
      <section className="bg-gradient-to-br from-emerald-50 via-white to-amber-50 py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <EditableText sectionId="hero-title" className="mb-4">
            <h1 className="client-hero-title font-bold text-gray-900 mb-4">
              {getEditableContent('hero-title')}
            </h1>
          </EditableText>
          
          <EditableText sectionId="hero-subtitle" className="mb-6">
            <h2 className="client-hero-subtitle text-gray-700 mb-6">
              {getEditableContent('hero-subtitle')}
            </h2>
          </EditableText>
          
          <EditableText sectionId="hero-description" className="mb-8">
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
              {getEditableContent('hero-description')}
            </p>
          </EditableText>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => onNavigate?.('about-us')} 
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3"
            >
              Learn More About PMO
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              onClick={() => onNavigate?.('university-operations')} 
              variant="outline" 
              size="lg"
              className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-8 py-3"
            >
              Explore Projects
              <BarChart3 className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              onClick={() => onNavigate?.('client-gender-parity')} 
              variant="outline" 
              size="lg"
              className="border-purple-600 text-purple-600 hover:bg-purple-50 px-8 py-3"
            >
              Gender Parity Analysis
              <Users className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">PMO at a Glance</h2>
            <p className="text-lg text-gray-600">Key metrics and achievements across our project portfolio</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickStats.map((stat, index) => (
              <Card key={index} className="client-card-hover border-gray-200">
                <CardContent className="p-6 text-center">
                  <div className={`w-12 h-12 ${stat.color} bg-gray-50 rounded-lg flex items-center justify-center mx-auto mb-4`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                  <p className="font-medium text-gray-900 mb-1">{stat.title}</p>
                  <p className="text-sm text-gray-600">{stat.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Explore Our Categories</h2>
            <p className="text-lg text-gray-600">Discover the different areas of PMO operations and services</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuredCategories.map((category) => (
              <Card key={category.id} className="client-card-hover border-gray-200 cursor-pointer" onClick={() => onNavigate?.(category.id)}>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 bg-${category.color}-100 text-${category.color}-600 rounded-lg flex items-center justify-center`}>
                      <category.icon className="h-6 w-6" />
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {category.stats.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{category.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 mb-4 leading-relaxed">
                    {category.description}
                  </CardDescription>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {Object.keys(category.stats)[0] === 'projects' && `${category.stats.projects} Projects`}
                      {Object.keys(category.stats)[0] === 'reports' && `${category.stats.reports} Reports`}
                      {Object.keys(category.stats)[0] === 'documents' && `${category.stats.documents} Documents`}
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Get in Touch</h2>
            <p className="text-lg text-gray-600">Contact us for inquiries about projects, partnerships, or services</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mx-auto">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-gray-900">Visit Us</h3>
              <p className="text-gray-600">
                Caraga State University<br />
                Ampayon, Butuan City<br />
                Agusan del Norte, Philippines
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center mx-auto">
                <Phone className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-gray-900">Call Us</h3>
              <p className="text-gray-600">
                +63 (85) 341-3832<br />
                +63 (85) 341-3833
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mx-auto">
                <Mail className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-gray-900">Email Us</h3>
              <p className="text-gray-600">
                pmo@carsu.edu.ph<br />
                info@carsu.edu.ph
              </p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Button 
              onClick={() => window.open('https://www.carsu.edu.ph/', '_blank')}
              variant="outline"
              className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
            >
              Visit CSU Website
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}