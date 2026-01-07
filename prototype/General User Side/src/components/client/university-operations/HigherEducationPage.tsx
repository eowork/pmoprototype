import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { ClientNavbar } from '../components/ClientNavbar';
import { ArrowLeft, GraduationCap, Users, BookOpen, Award, TrendingUp, Calendar } from 'lucide-react';

interface HigherEducationPageProps {
  onNavigate?: (page: string) => void;
  onSignIn?: () => void;
  userRole?: string;
  requireAuth?: (action: string) => boolean;
}

export function HigherEducationPage({ onNavigate, onSignIn, userRole = 'Client' }: HigherEducationPageProps) {
  const programs = [
    {
      level: 'Undergraduate Programs',
      description: 'Bachelor\'s degree programs across various disciplines',
      count: 45,
      departments: [
        'College of Engineering and Information Technology',
        'College of Agriculture and Natural Resources',
        'College of Education',
        'College of Arts and Sciences',
        'College of Management and Economics',
        'College of Nursing and Allied Health Sciences'
      ],
      highlights: [
        'CHED Accredited Programs',
        'Industry-Aligned Curriculum',
        'Research Integration',
        'Community Extension'
      ]
    },
    {
      level: 'Graduate Programs',
      description: 'Master\'s and Doctoral degree programs for advanced studies',
      count: 28,
      departments: [
        'Graduate School',
        'Professional Schools',
        'Research Institutes'
      ],
      highlights: [
        'Research-Based Learning',
        'International Collaboration',
        'Faculty Development',
        'Industry Partnerships'
      ]
    }
  ];

  const achievements = [
    {
      title: 'Student Enrollment',
      value: '15,432',
      change: '+12%',
      description: 'Total students across all programs',
      icon: Users,
      color: 'text-emerald-600'
    },
    {
      title: 'Graduation Rate',
      value: '92%',
      change: '+3%',
      description: 'Students completing their programs',
      icon: GraduationCap,
      color: 'text-blue-600'
    },
    {
      title: 'Programs Offered',
      value: '73',
      change: '+5',
      description: 'Undergraduate and graduate programs',
      icon: BookOpen,
      color: 'text-amber-600'
    },
    {
      title: 'Faculty Members',
      value: '847',
      change: '+15',
      description: 'Qualified teaching and research faculty',
      icon: Award,
      color: 'text-purple-600'
    }
  ];

  const recentDevelopments = [
    {
      title: 'New Engineering Program Launched',
      description: 'Bachelor of Science in Renewable Energy Engineering approved by CHED',
      date: 'October 2024',
      status: 'New'
    },
    {
      title: 'Research Collaboration Expanded',
      description: 'Partnership with international universities for joint research programs',
      date: 'September 2024',
      status: 'Active'
    },
    {
      title: 'Digital Learning Platform Enhanced',
      description: 'Upgraded online learning systems with AI-powered features',
      date: 'August 2024',
      status: 'Completed'
    },
    {
      title: 'Faculty Development Program',
      description: 'Advanced training for 150+ faculty members in modern pedagogy',
      date: 'July 2024',
      status: 'Ongoing'
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
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Higher Education Programs</h1>
            <p className="text-lg text-gray-600 max-w-3xl">
              Comprehensive undergraduate and graduate programs designed to produce competent professionals and leaders in various fields.
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {achievements.map((achievement, index) => (
              <Card key={index} className="client-card-hover">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 ${achievement.color} bg-gray-50 rounded-lg flex items-center justify-center`}>
                      <achievement.icon className="h-6 w-6" />
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      {achievement.change}
                    </Badge>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{achievement.value}</h3>
                  <p className="font-medium text-gray-900 mb-1">{achievement.title}</p>
                  <p className="text-sm text-gray-600">{achievement.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Program Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {programs.map((program, index) => (
              <Card key={index} className="client-card-hover">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{program.level}</CardTitle>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                      {program.count} Programs
                    </Badge>
                  </div>
                  <CardDescription className="text-gray-600">
                    {program.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Academic Units</h4>
                      <div className="space-y-1">
                        {program.departments.map((dept, deptIndex) => (
                          <div key={deptIndex} className="text-sm text-gray-600 flex items-center">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                            {dept}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Key Features</h4>
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

          {/* Recent Developments */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-emerald-600" />
                Recent Developments
              </CardTitle>
              <CardDescription>
                Latest updates and improvements in our higher education programs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentDevelopments.map((development, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{development.title}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={development.status === 'New' ? 'default' : 
                                 development.status === 'Active' ? 'secondary' : 
                                 development.status === 'Ongoing' ? 'outline' : 'secondary'}
                          className="text-xs"
                        >
                          {development.status}
                        </Badge>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {development.date}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm">{development.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quality Assurance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="mr-2 h-5 w-5 text-amber-600" />
                Quality Assurance & Accreditation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="h-8 w-8" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">CHED Accredited</h4>
                  <p className="text-sm text-gray-600">All programs meet national education standards</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-8 w-8" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">ISO Certified</h4>
                  <p className="text-sm text-gray-600">Quality management system certification</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Industry Partners</h4>
                  <p className="text-sm text-gray-600">Strong partnerships with industry leaders</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}