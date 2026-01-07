import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { ClientNavbar } from '../components/ClientNavbar';
import { ArrowLeft, Beaker, Users, BookOpen, Award, Globe, TrendingUp, Calendar, Star, Lightbulb } from 'lucide-react';

interface ResearchProgramPageProps {
  onNavigate?: (page: string) => void;
  onSignIn?: () => void;
  userRole?: string;
  requireAuth?: (action: string) => boolean;
}

export function ResearchProgramPage({ onNavigate, onSignIn, userRole = 'Client' }: ResearchProgramPageProps) {
  const researchAreas = [
    {
      title: 'Agricultural Innovation',
      description: 'Sustainable farming, crop development, and agricultural technology research',
      projects: 18,
      budget: '₱15.2M',
      focus: ['Sustainable Agriculture', 'Crop Genetics', 'Precision Farming', 'Climate Adaptation'],
      icon: Beaker,
      color: 'emerald'
    },
    {
      title: 'Environmental Science',
      description: 'Environmental protection, renewable energy, and climate change studies',
      projects: 14,
      budget: '₱12.8M',
      focus: ['Renewable Energy', 'Biodiversity', 'Water Quality', 'Environmental Monitoring'],
      icon: Globe,
      color: 'blue'
    },
    {
      title: 'Engineering & Technology',
      description: 'Infrastructure development, smart systems, and technological innovation',
      projects: 22,
      budget: '₱18.5M',
      focus: ['Smart Infrastructure', 'IoT Systems', 'Materials Science', 'Automation'],
      icon: Award,
      color: 'purple'
    },
    {
      title: 'Health & Life Sciences',
      description: 'Medical research, public health, and biotechnology advancement',
      projects: 12,
      budget: '₱9.7M',
      focus: ['Public Health', 'Medical Technology', 'Biotechnology', 'Health Systems'],
      icon: Star,
      color: 'amber'
    }
  ];

  const metrics = [
    {
      title: 'Active Projects',
      value: '66',
      change: '+22%',
      description: 'Ongoing research initiatives',
      icon: Beaker,
      color: 'text-emerald-600'
    },
    {
      title: 'Research Budget',
      value: '₱56.2M',
      change: '+35%',
      description: 'Total annual research funding',
      icon: TrendingUp,
      color: 'text-blue-600'
    },
    {
      title: 'Publications',
      value: '189',
      change: '+28%',
      description: 'Research papers published',
      icon: BookOpen,
      color: 'text-amber-600'
    },
    {
      title: 'Research Fellows',
      value: '234',
      change: '+15%',
      description: 'Faculty and student researchers',
      icon: Users,
      color: 'text-purple-600'
    }
  ];

  const majorProjects = [
    {
      title: 'Sustainable Rice Production System',
      description: 'Development of climate-resilient rice varieties for improved food security',
      status: 'Ongoing',
      duration: '2022-2025',
      funding: '₱8.5M',
      partner: 'Department of Agriculture',
      impact: 'High',
      category: 'Agriculture'
    },
    {
      title: 'Smart Campus Initiative',
      description: 'IoT-based smart systems for energy management and campus automation',
      status: 'Phase 2',
      duration: '2023-2026',
      funding: '₱12.3M',
      partner: 'DOST-PCAARRD',
      impact: 'High',
      category: 'Technology'
    },
    {
      title: 'Coastal Ecosystem Restoration',
      description: 'Mangrove restoration and marine biodiversity conservation program',
      status: 'Ongoing',
      duration: '2023-2025',
      funding: '₱6.8M',
      partner: 'DENR-BMB',
      impact: 'Medium',
      category: 'Environment'
    },
    {
      title: 'Community Health Information System',
      description: 'Digital health platform for rural community health management',
      status: 'New',
      duration: '2024-2027',
      funding: '₱5.4M',
      partner: 'DOH-CHO',
      impact: 'High',
      category: 'Health'
    }
  ];

  const achievements = [
    {
      title: 'Best Research University Award',
      description: 'Recognized as top research institution in Mindanao for 2024',
      date: 'November 2024',
      category: 'Award'
    },
    {
      title: 'International Research Collaboration',
      description: 'Partnership with 5 ASEAN universities for joint research program',
      date: 'October 2024',
      category: 'Partnership'
    },
    {
      title: 'Patent Applications Filed',
      description: '12 new patent applications for innovative technologies',
      date: 'September 2024',
      category: 'Innovation'
    },
    {
      title: 'Research Excellence Grant',
      description: '₱25M funding from CHED for research infrastructure',
      date: 'August 2024',
      category: 'Funding'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <ClientNavbar onNavigate={onNavigate} onSignIn={onSignIn} />
      
      <div className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => onNavigate?.('university-operations')}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to University Operations
            </Button>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Research Programs</h1>
            <p className="text-lg text-gray-600 max-w-3xl">
              Cutting-edge research initiatives driving innovation, knowledge creation, and technological advancement for societal impact.
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {metrics.map((metric, index) => (
              <Card key={index} className="client-card-hover">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 ${metric.color} bg-gray-50 rounded-lg flex items-center justify-center`}>
                      <metric.icon className="h-6 w-6" />
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      {metric.change}
                    </Badge>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</h3>
                  <p className="font-medium text-gray-900 mb-1">{metric.title}</p>
                  <p className="text-sm text-gray-600">{metric.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Research Areas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {researchAreas.map((area, index) => (
              <Card key={index} className="client-card-hover">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 bg-${area.color}-100 text-${area.color}-600 rounded-lg flex items-center justify-center`}>
                        <area.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{area.title}</CardTitle>
                        <CardDescription className="text-sm">
                          {area.projects} Projects • {area.budget} Budget
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{area.description}</p>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Research Focus Areas</h4>
                    <div className="flex flex-wrap gap-2">
                      {area.focus.map((focus, fIndex) => (
                        <Badge key={fIndex} variant="secondary" className="text-xs">
                          {focus}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Major Research Projects */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lightbulb className="mr-2 h-5 w-5 text-emerald-600" />
                Major Research Projects
              </CardTitle>
              <CardDescription>
                Flagship research initiatives with significant impact and funding
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {majorProjects.map((project, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{project.title}</h4>
                        <p className="text-gray-600 text-sm mb-2">{project.description}</p>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <Badge 
                          variant={project.status === 'New' ? 'default' : 
                                 project.status === 'Ongoing' ? 'secondary' : 'outline'}
                          className="text-xs"
                        >
                          {project.status}
                        </Badge>
                        <Badge 
                          variant={project.impact === 'High' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {project.impact} Impact
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Duration:</span>
                        <div className="font-medium text-gray-900">{project.duration}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Funding:</span>
                        <div className="font-medium text-emerald-600">{project.funding}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Partner:</span>
                        <div className="font-medium text-gray-900">{project.partner}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Category:</span>
                        <div className="font-medium text-gray-900">{project.category}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="mr-2 h-5 w-5 text-amber-600" />
                Recent Achievements & Recognition
              </CardTitle>
              <CardDescription>
                Latest milestones and recognition in research excellence
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {achievement.category}
                        </Badge>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {achievement.date}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm">{achievement.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Research Support & Facilities */}
          <Card>
            <CardHeader>
              <CardTitle>Research Support & Facilities</CardTitle>
              <CardDescription>
                Infrastructure and support systems for research excellence
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Beaker className="h-8 w-8" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Research Laboratories</h4>
                  <p className="text-sm text-gray-600">25 specialized labs with modern equipment</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-8 w-8" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Digital Library</h4>
                  <p className="text-sm text-gray-600">Extensive research databases and publications</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="h-8 w-8" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Research Grants</h4>
                  <p className="text-sm text-gray-600">Competitive funding opportunities available</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}