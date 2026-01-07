import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { 
  Building2, 
  GraduationCap, 
  Wrench, 
  Users, 
  BarChart3, 
  Download, 
  Shield,
  ArrowRight,
  TrendingUp,
  Award,
  MapPin,
  Phone,
  Mail,
  ExternalLink
} from 'lucide-react';
import { ClientNavbar } from './components/ClientNavbar';
import { HeroSection } from './components/HeroSection';

interface LandingPageProps {
  onNavigate?: (page: string) => void;
  onSignIn?: () => void;
}

export function LandingPage({ onNavigate, onSignIn }: LandingPageProps) {
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState(null);

  useEffect(() => {
    // Simulate loading stats from the admin dashboard data
    const loadStats = async () => {
      try {
        // This would normally fetch from the same data sources as admin dashboard
        const mockStats = {
          totalProjects: 127,
          activeProjects: 23,
          completedProjects: 94,
          budgetUtilization: 87.3,
          categories: {
            construction: 45,
            operations: 32,
            repairs: 28,
            research: 22
          }
        };
        
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading
        setStatsData(mockStats);
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const quickStats = [
    {
      title: "Active Projects",
      value: "127",
      description: "Ongoing infrastructure and development projects",
      icon: Building2,
      color: "text-emerald-600"
    },
    {
      title: "Facility Improvements",
      value: "156",
      description: "Classroom and administrative facility enhancements",
      icon: Wrench,
      color: "text-amber-600"
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
    }
  ];

  const featuredCategories = [
    {
      id: 'construction-of-infrastructure',
      title: 'Construction & Infrastructure',
      description: 'Major infrastructure development projects funded through GAA, local funds, and special partnerships.',
      icon: Building2,
      stats: { active: 15, completed: 45, budget: '₱2.8B' },
      color: 'emerald',
      subcategories: [
        'GAA-Funded Projects',
        'Locally-Funded Projects', 
        'Special Grants & Partnerships'
      ]
    },
    {
      id: 'university-operations',
      title: 'University Operations',
      description: 'Academic programs, research initiatives, and extension services that drive educational excellence.',
      icon: GraduationCap,
      stats: { programs: 32, students: '15,000+', research: 22 },
      color: 'amber',
      subcategories: [
        'Higher Education Program',
        'Advanced Education Program',
        'Research Program',
        'Technical Advisory Extension'
      ]
    },
    {
      id: 'repairs',
      title: 'Repairs & Maintenance',
      description: 'Systematic maintenance and improvement of campus facilities across both Main and Cabadbaran campuses.',
      icon: Wrench,
      stats: { facilities: 28, campuses: 2, priority: 'High' },
      color: 'emerald',
      subcategories: [
        'Classroom Repairs (CSU CC & BXU)',
        'Administrative Offices (CSU CC & BXU)'
      ]
    },
    {
      id: 'gad-parity-knowledge-management',
      title: 'GAD Parity & Knowledge Management',
      description: 'Gender and Development programs ensuring equitable access and comprehensive data management.',
      icon: Users,
      stats: { parity: '52%', programs: 12, budget: '₱45M' },
      color: 'amber',
      subcategories: [
        'Gender Parity - Admission Rate',
        'Gender Parity - Graduation Rate',
        'GPB Accomplishment',
        'GAD Budget Plans'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-emerald-50/30">
      <ClientNavbar onSignIn={onSignIn} onNavigate={onNavigate} />
      
      {/* Hero Section */}
      <HeroSection onNavigate={onNavigate} onSignIn={onSignIn} />
      
      {/* Quick Stats Overview */}
      <section className="py-16 bg-white border-t border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Project Management Performance
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Real-time insights into Caraga State University's project management operations, 
              ensuring transparency and accountability in all initiatives.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickStats.map((stat, index) => (
              <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-lg bg-gray-50 ${stat.color}`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Updated
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="font-medium text-gray-700">{stat.title}</p>
                    <p className="text-sm text-gray-500 leading-relaxed">{stat.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 bg-gradient-to-b from-emerald-50/30 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              PMO Management Categories
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Comprehensive oversight across all university operations, from infrastructure development 
              to academic programs and gender equity initiatives.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {featuredCategories.map((category, index) => (
              <Card key={index} className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer bg-gradient-to-br from-white overflow-hidden ${
                category.color === 'emerald' ? 'to-emerald-50/20' :
                category.color === 'amber' ? 'to-amber-50/20' :
                category.color === 'blue' ? 'to-blue-50/20' : 'to-purple-50/20'
              }`}
                    onClick={() => onNavigate?.(category.id)}>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-xl group-hover:scale-110 transition-transform duration-300 ${
                      category.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
                      category.color === 'amber' ? 'bg-amber-100 text-amber-600' :
                      category.color === 'blue' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                    }`}>
                      <category.icon className="h-8 w-8" />
                    </div>
                    <Button variant="ghost" size="sm" className="group-hover:bg-gray-100">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardTitle className="text-xl text-gray-900 group-hover:text-emerald-700 transition-colors">
                    {category.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {category.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Quick Stats */}
                  <div className="flex flex-wrap gap-4 text-sm">
                    {Object.entries(category.stats).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-1">
                        <span className="font-medium text-gray-700 capitalize">{key}:</span>
                        <span className={`font-bold ${
                          category.color === 'emerald' ? 'text-emerald-600' :
                          category.color === 'amber' ? 'text-amber-600' :
                          category.color === 'blue' ? 'text-blue-600' : 'text-purple-600'
                        }`}>{value}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Separator />
                  
                  {/* Sub-categories */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Sub-categories:</p>
                    <div className="flex flex-wrap gap-2">
                      {category.subcategories.map((sub, subIndex) => (
                        <Badge key={subIndex} variant="outline" className="text-xs">
                          {sub}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Categories Grid */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Additional PMO Services
            </h2>
            <p className="text-lg text-gray-600">
              Supporting services and resources for comprehensive project management
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Classroom & Administrative Offices',
                description: 'Assessment and management of campus facilities',
                icon: Building2,
                page: 'classroom-administrative-offices'
              },
              {
                title: 'Policies & Governance',
                description: 'MOAs, MOUs, and regulatory frameworks',
                icon: Shield,
                page: 'policies'
              },
              {
                title: 'Downloadable Forms',
                description: 'HGDG forms, checklists, and monitoring tools',
                icon: Download,
                page: 'forms'
              },
              {
                title: 'About PMO',
                description: 'Personnel, objectives, and contact information',
                icon: Users,
                page: 'about-us'
              }
            ].map((item, index) => (
              <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-all duration-300 group cursor-pointer"
                    onClick={() => onNavigate?.(item.page)}>
                <CardContent className="p-6 text-center">
                  <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-emerald-200 transition-colors">
                    <item.icon className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 group-hover:text-emerald-700 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-emerald-600 to-amber-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Explore PMO Data?
          </h2>
          <p className="text-xl mb-8 text-emerald-50">
            Access comprehensive project data, analytics, and reports. 
            Sign in for administrative features or continue browsing as a visitor.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => onSignIn?.()}
              className="bg-white text-emerald-600 hover:bg-gray-50"
            >
              <Users className="mr-2 h-5 w-5" />
              Sign In for Admin Access
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => onNavigate?.('overview')}
              className="border-white text-white hover:bg-white hover:text-emerald-600"
            >
              <BarChart3 className="mr-2 h-5 w-5" />
              View Dashboard
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4 text-amber-400">Caraga State University</h3>
              <p className="text-gray-300 mb-4">
                Project Management Office - Monitoring & Evaluation Dashboard
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                <MapPin className="h-4 w-4" />
                <span>Ampayon, Butuan City, Agusan del Norte</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                <Phone className="h-4 w-4" />
                <span>(085) 342-5661</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Mail className="h-4 w-4" />
                <span>info@carsu.edu.ph</span>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-4 text-amber-400">Quick Links</h4>
              <div className="space-y-2 text-sm">
                <button onClick={() => onNavigate?.('construction-of-infrastructure')} 
                        className="block text-gray-300 hover:text-white transition-colors">
                  Construction Projects
                </button>
                <button onClick={() => onNavigate?.('university-operations')} 
                        className="block text-gray-300 hover:text-white transition-colors">
                  University Operations
                </button>
                <button onClick={() => onNavigate?.('forms')} 
                        className="block text-gray-300 hover:text-white transition-colors">
                  Downloadable Forms
                </button>
                <button onClick={() => onNavigate?.('about-us')} 
                        className="block text-gray-300 hover:text-white transition-colors">
                  About PMO
                </button>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-4 text-amber-400">Official Links</h4>
              <div className="space-y-2 text-sm">
                <a href="https://www.carsu.edu.ph" target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
                  <ExternalLink className="h-4 w-4" />
                  CSU Official Website
                </a>
                <a href="https://www.carsu.edu.ph/transparency" target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
                  <ExternalLink className="h-4 w-4" />
                  Transparency Seal
                </a>
              </div>
            </div>
          </div>
          
          <Separator className="my-8 bg-gray-700" />
          
          <div className="text-center text-sm text-gray-400">
            <p>© 2024 Caraga State University. All rights reserved.</p>
            <p className="mt-2">PMO Monitoring & Evaluation Dashboard - Ensuring Transparency and Accountability</p>
          </div>
        </div>
      </footer>
    </div>
  );
}