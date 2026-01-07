import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { ClientNavbar } from '../components/ClientNavbar';
import { ArrowLeft, GraduationCap, Users, BookOpen, Award, Globe, Calendar, Star, TrendingUp } from 'lucide-react';

interface AdvancedEducationPageProps {
  onNavigate?: (page: string) => void;
  onSignIn?: () => void;
  userRole?: string;
  requireAuth?: (action: string) => boolean;
}

export function AdvancedEducationPage({ onNavigate, onSignIn, userRole = 'Client' }: AdvancedEducationPageProps) {
  const programs = [
    {
      title: 'Doctoral Programs (Ph.D.)',
      description: 'Advanced research-based doctoral programs for academic and research leadership',
      count: 12,
      specializations: [
        'Ph.D. in Education',
        'Ph.D. in Agriculture',
        'Ph.D. in Engineering',
        'Ph.D. in Management',
        'Ph.D. in Environmental Science',
        'Ph.D. in Information Technology'
      ],
      highlights: ['Research Excellence', 'International Standards', 'Publication Required', 'Industry Collaboration']
    },
    {
      title: 'Professional Doctorate',
      description: 'Practice-oriented doctoral programs for professional advancement',
      count: 6,
      specializations: [
        'Doctor of Education (Ed.D.)',
        'Doctor of Business Administration (DBA)',
        'Doctor of Engineering (D.Eng.)',
        'Doctor of Public Administration (DPA)'
      ],
      highlights: ['Professional Practice', 'Applied Research', 'Executive Format', 'Industry Integration']
    },
    {
      title: 'Master\'s Degree Programs',
      description: 'Advanced master\'s programs for specialized professional development',
      count: 22,
      specializations: [
        'MBA - Executive Program',
        'M.S. in Data Science',
        'M.S. in Renewable Energy',
        'Master in Public Health',
        'M.S. in Environmental Management',
        'Master in Educational Leadership'
      ],
      highlights: ['Flexible Schedule', 'Industry Focus', 'Research Component', 'International Exchange']
    }
  ];

  const metrics = [
    {
      title: 'Advanced Students',
      value: '1,247',
      change: '+18%',
      description: 'Post-graduate students enrolled',
      icon: Users,
      color: 'text-emerald-600'
    },
    {
      title: 'Ph.D. Graduates',
      value: '89',
      change: '+25%',
      description: 'Doctoral graduates this year',
      icon: GraduationCap,
      color: 'text-blue-600'
    },
    {
      title: 'Research Output',
      value: '156',
      change: '+32%',
      description: 'Published research papers',
      icon: BookOpen,
      color: 'text-amber-600'
    },
    {
      title: 'International Partners',
      value: '24',
      change: '+4',
      description: 'Global university partnerships',
      icon: Globe,
      color: 'text-purple-600'
    }
  ];

  const features = [
    {
      title: 'Research Excellence Centers',
      description: 'State-of-the-art research facilities and specialized laboratories for advanced studies.',
      icon: Star,
      achievements: ['6 Research Centers', '12 Specialized Labs', '50+ Active Projects']
    },
    {
      title: 'International Collaboration',
      description: 'Global partnerships providing exchange opportunities and joint research programs.',
      icon: Globe,
      achievements: ['24 Partner Universities', '15 Countries', '45 Exchange Students']
    },
    {
      title: 'Faculty Excellence',
      description: 'Highly qualified faculty with advanced degrees and extensive research experience.',
      icon: Award,
      achievements: ['95% Ph.D. Faculty', '200+ Publications', '50+ Awards']
    },
    {
      title: 'Innovation & Technology',
      description: 'Cutting-edge technology integration and innovation-driven curriculum.',
      icon: TrendingUp,
      achievements: ['Digital Learning', 'AI Integration', 'Industry 4.0 Focus']
    }
  ];

  const recentAchievements = [
    {
      title: 'New Doctoral Program in Data Science',
      description: 'First Ph.D. program in Data Science in the region, approved by CHED',
      date: 'November 2024',
      status: 'New',
      impact: 'High'
    },
    {
      title: 'International Research Grant Awarded',
      description: '$2.5M grant for renewable energy research collaboration',
      date: 'October 2024',
      status: 'Active',
      impact: 'High'
    },
    {
      title: 'Joint Degree Program with European University',
      description: 'Dual Ph.D. program in Environmental Engineering launched',
      date: 'September 2024',
      status: 'Active',
      impact: 'Medium'
    },
    {
      title: 'Advanced Research Laboratory Inaugurated',
      description: 'New biotechnology research facility officially opened',
      date: 'August 2024',
      status: 'Completed',
      impact: 'High'
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
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Advanced Education Programs</h1>
            <p className="text-lg text-gray-600 max-w-3xl">
              Post-graduate and specialized programs designed for research excellence, professional development, and academic leadership.
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

          {/* Program Categories */}
          <div className="space-y-6 mb-8">
            {programs.map((program, index) => (
              <Card key={index} className="client-card-hover">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">{program.title}</CardTitle>
                      <CardDescription className="text-gray-600 mt-2">
                        {program.description}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                      {program.count} Programs
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Available Specializations</h4>
                      <div className="space-y-2">
                        {program.specializations.map((spec, specIndex) => (
                          <div key={specIndex} className="text-sm text-gray-600 flex items-center">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                            {spec}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Program Highlights</h4>
                      <div className="flex flex-wrap gap-2">
                        {program.highlights.map((highlight, hIndex) => (
                          <Badge key={hIndex} variant="secondary" className="text-xs">
                            {highlight}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Key Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {features.map((feature, index) => (
              <Card key={index} className="client-card-hover">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <feature.icon className="mr-2 h-5 w-5 text-emerald-600" />
                    {feature.title}
                  </CardTitle>
                  <CardDescription>
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {feature.achievements.map((achievement, achIndex) => (
                      <div key={achIndex} className="flex items-center text-sm">
                        <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                        <span className="text-gray-600">{achievement}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Achievements */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-emerald-600" />
                Recent Achievements & Developments
              </CardTitle>
              <CardDescription>
                Latest milestones and progress in advanced education programs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAchievements.map((achievement, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={achievement.impact === 'High' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {achievement.impact} Impact
                        </Badge>
                        <Badge 
                          variant={achievement.status === 'New' ? 'default' : 
                                 achievement.status === 'Active' ? 'secondary' : 'outline'}
                          className="text-xs"
                        >
                          {achievement.status}
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

          {/* Admission & Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Admission Requirements & Process</CardTitle>
              <CardDescription>
                General requirements for advanced education programs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Master's Programs</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      Bachelor's degree with honors
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      GPA of 2.5 or higher
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      Entrance examination
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      Research proposal (thesis track)
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Doctoral Programs</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                      Master's degree in related field
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                      GPA of 1.75 or higher
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                      Comprehensive examination
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                      Dissertation proposal
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Application Process</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                      Online application submission
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                      Document verification
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                      Interview and assessment
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                      Enrollment confirmation
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}