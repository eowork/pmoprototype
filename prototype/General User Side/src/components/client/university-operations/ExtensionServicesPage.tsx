import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { ClientNavbar } from '../components/ClientNavbar';
import { ArrowLeft, Users, Heart, Lightbulb, MapPin, Calendar, Award, TrendingUp, HandHeart, Globe } from 'lucide-react';

interface ExtensionServicesPageProps {
  onNavigate?: (page: string) => void;
  onSignIn?: () => void;
  userRole?: string;
  requireAuth?: (action: string) => boolean;
}

export function ExtensionServicesPage({ onNavigate, onSignIn, userRole = 'Client' }: ExtensionServicesPageProps) {
  const serviceAreas = [
    {
      title: 'Community Development',
      description: 'Capacity building and community empowerment programs',
      programs: 15,
      beneficiaries: '2,340',
      focus: ['Leadership Training', 'Livelihood Programs', 'Skills Development', 'Community Planning'],
      icon: Users,
      color: 'emerald'
    },
    {
      title: 'Agricultural Extension',
      description: 'Farmer education and agricultural technology transfer',
      programs: 12,
      beneficiaries: '1,890',
      focus: ['Crop Management', 'Livestock Production', 'Sustainable Farming', 'Market Linkage'],
      icon: Lightbulb,
      color: 'blue'
    },
    {
      title: 'Health & Wellness',
      description: 'Public health education and healthcare services',
      programs: 8,
      beneficiaries: '3,120',
      focus: ['Health Education', 'Medical Missions', 'Nutrition Programs', 'Mental Health'],
      icon: Heart,
      color: 'red'
    },
    {
      title: 'Technology Transfer',
      description: 'Innovation dissemination and technical assistance',
      programs: 10,
      beneficiaries: '1,560',
      focus: ['Digital Literacy', 'Technology Training', 'Innovation Support', 'Business Development'],
      icon: Globe,
      color: 'purple'
    }
  ];

  const metrics = [
    {
      title: 'Active Programs',
      value: '45',
      change: '+28%',
      description: 'Community extension programs',
      icon: HandHeart,
      color: 'text-emerald-600'
    },
    {
      title: 'Beneficiaries',
      value: '8,910',
      change: '+42%',
      description: 'Community members served',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Partner Communities',
      value: '67',
      change: '+18%',
      description: 'Barangays and municipalities',
      icon: MapPin,
      color: 'text-amber-600'
    },
    {
      title: 'Extension Hours',
      value: '12,450',
      change: '+35%',
      description: 'Service hours delivered',
      icon: TrendingUp,
      color: 'text-purple-600'
    }
  ];

  const majorPrograms = [
    {
      title: 'Sustainable Agriculture Training Program',
      description: 'Comprehensive training on modern farming techniques and sustainable practices',
      location: 'Agusan del Norte & Agusan del Sur',
      duration: '2024-2026',
      beneficiaries: '500 farmers',
      status: 'Ongoing',
      impact: 'High',
      category: 'Agriculture'
    },
    {
      title: 'Digital Literacy for Seniors',
      description: 'Technology education program for elderly community members',
      location: 'Butuan City and surrounding areas',
      duration: '2024-2025',
      beneficiaries: '300 seniors',
      status: 'Ongoing',
      impact: 'Medium',
      category: 'Technology'
    },
    {
      title: 'Community Health Workers Training',
      description: 'Healthcare education and skills development for community volunteers',
      location: 'Caraga Region',
      duration: '2023-2025',
      beneficiaries: '150 health workers',
      status: 'Phase 2',
      impact: 'High',
      category: 'Health'
    },
    {
      title: 'Youth Leadership Development',
      description: 'Leadership skills and civic engagement program for young people',
      location: 'Regional scope',
      duration: '2024-2027',
      beneficiaries: '800 youth',
      status: 'New',
      impact: 'High',
      category: 'Leadership'
    }
  ];

  const partnerships = [
    {
      partner: 'Local Government Units',
      type: 'Government',
      programs: 28,
      description: 'Collaboration with municipalities and barangays'
    },
    {
      partner: 'Non-Government Organizations',
      type: 'NGO',
      programs: 12,
      description: 'Partnership with civil society organizations'
    },
    {
      partner: 'Private Sector',
      type: 'Industry',
      programs: 8,
      description: 'Corporate social responsibility partnerships'
    },
    {
      partner: 'International Organizations',
      type: 'International',
      programs: 5,
      description: 'Global development partnerships'
    }
  ];

  const achievements = [
    {
      title: 'Outstanding Extension Program Award',
      description: 'CHED recognition for excellence in community extension services',
      date: 'October 2024',
      category: 'Award'
    },
    {
      title: 'Regional Health Partnership Expanded',
      description: 'New collaboration with DOH for rural health improvement',
      date: 'September 2024',
      category: 'Partnership'
    },
    {
      title: 'Technology Hub Established',
      description: 'Community technology center opened in remote barangay',
      date: 'August 2024',
      category: 'Infrastructure'
    },
    {
      title: 'Farmer Cooperative Formed',
      description: '200 farmers organized into sustainable agriculture cooperative',
      date: 'July 2024',
      category: 'Community'
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
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Technical Advisory & Extension Services</h1>
            <p className="text-lg text-gray-600 max-w-3xl">
              Community-focused programs that extend university knowledge and resources to empower local communities and drive regional development.
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

          {/* Service Areas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {serviceAreas.map((area, index) => (
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
                          {area.programs} Programs • {area.beneficiaries} Beneficiaries
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{area.description}</p>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Focus Areas</h4>
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

          {/* Major Programs */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <HandHeart className="mr-2 h-5 w-5 text-emerald-600" />
                Major Extension Programs
              </CardTitle>
              <CardDescription>
                Flagship community programs with significant impact and reach
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {majorPrograms.map((program, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{program.title}</h4>
                        <p className="text-gray-600 text-sm mb-2">{program.description}</p>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <Badge 
                          variant={program.status === 'New' ? 'default' : 
                                 program.status === 'Ongoing' ? 'secondary' : 'outline'}
                          className="text-xs"
                        >
                          {program.status}
                        </Badge>
                        <Badge 
                          variant={program.impact === 'High' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {program.impact} Impact
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Location:</span>
                        <div className="font-medium text-gray-900">{program.location}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Duration:</span>
                        <div className="font-medium text-gray-900">{program.duration}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Beneficiaries:</span>
                        <div className="font-medium text-emerald-600">{program.beneficiaries}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Category:</span>
                        <div className="font-medium text-gray-900">{program.category}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Partnerships */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="mr-2 h-5 w-5 text-blue-600" />
                Strategic Partnerships
              </CardTitle>
              <CardDescription>
                Collaborative relationships that enhance extension service delivery
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {partnerships.map((partnership, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{partnership.partner}</h4>
                      <Badge variant="outline" className="text-xs">
                        {partnership.type}
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{partnership.description}</p>
                    <div className="text-sm text-emerald-600 font-medium">
                      {partnership.programs} Active Programs
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
                Recent Achievements & Milestones
              </CardTitle>
              <CardDescription>
                Latest accomplishments and recognition in extension services
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

          {/* Community Impact */}
          <Card>
            <CardHeader>
              <CardTitle>Community Impact & Outcomes</CardTitle>
              <CardDescription>
                Measurable results and transformation in partner communities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Lives Improved</h4>
                  <div className="text-2xl font-bold text-emerald-600 mb-1">8,910</div>
                  <p className="text-sm text-gray-600">Direct beneficiaries reached</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="h-8 w-8" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Communities Served</h4>
                  <div className="text-2xl font-bold text-blue-600 mb-1">67</div>
                  <p className="text-sm text-gray-600">Barangays and municipalities</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-8 w-8" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Success Rate</h4>
                  <div className="text-2xl font-bold text-amber-600 mb-1">94%</div>
                  <p className="text-sm text-gray-600">Program completion rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}