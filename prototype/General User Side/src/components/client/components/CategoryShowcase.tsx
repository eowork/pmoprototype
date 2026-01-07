import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import { 
  Building2, 
  GraduationCap, 
  Wrench, 
  Users, 
  ArrowRight,
  TrendingUp,
  Calendar,
  DollarSign
} from 'lucide-react';

interface CategoryShowcaseProps {
  onNavigate?: (page: string) => void;
}

export function CategoryShowcase({ onNavigate }: CategoryShowcaseProps) {
  const showcaseCategories = [
    {
      id: 'construction-of-infrastructure',
      title: 'Construction & Infrastructure',
      description: 'Major infrastructure development projects ensuring modern facilities for academic excellence.',
      icon: Building2,
      color: 'emerald',
      stats: {
        active: 15,
        completed: 45, 
        budget: '₱2.8B',
        progress: 78
      },
      highlights: [
        'New Science Building Complex',
        'Multi-Purpose Sports Facility',
        'Student Learning Commons'
      ],
      recentActivity: 'New library construction milestone reached'
    },
    {
      id: 'university-operations',
      title: 'University Operations',
      description: 'Comprehensive academic programs, research initiatives, and community extension services.',
      icon: GraduationCap,
      color: 'amber',
      stats: {
        programs: 32,
        students: '15,000+',
        research: 22,
        progress: 85
      },
      highlights: [
        'Higher Education Programs',
        'Research & Development',
        'Community Extension'
      ],
      recentActivity: 'New research grant approved for sustainable development'
    },
    {
      id: 'repairs',
      title: 'Repairs & Maintenance',
      description: 'Systematic maintenance ensuring safe and conducive learning environments across all campuses.',
      icon: Wrench,
      color: 'blue',
      stats: {
        facilities: 28,
        completed: 156,
        pending: 12,
        progress: 92
      },
      highlights: [
        'Classroom Renovations',
        'HVAC System Upgrades',
        'Safety Improvements'
      ],
      recentActivity: 'Major electrical system upgrade completed'
    },
    {
      id: 'gad-parity-knowledge-management',
      title: 'GAD Parity & Knowledge Management',
      description: 'Promoting gender equity and managing institutional knowledge for inclusive development.',
      icon: Users,
      color: 'purple',
      stats: {
        parity: '52%',
        programs: 12,
        budget: '₱45M',
        progress: 88
      },
      highlights: [
        'Gender Parity Monitoring',
        'Inclusive Program Design',
        'Knowledge Documentation'
      ],
      recentActivity: 'Gender equity report published for Q1 2024'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          PMO Category Overview
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Comprehensive project management across diverse categories ensuring 
          transparency, efficiency, and quality in all university operations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {showcaseCategories.map((category, index) => (
          <Card key={index} className={`border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group cursor-pointer bg-gradient-to-br from-white ${
              category.color === 'emerald' ? 'to-emerald-50/20' :
              category.color === 'amber' ? 'to-amber-50/20' :
              category.color === 'blue' ? 'to-blue-50/20' : 'to-purple-50/20'
            } overflow-hidden`}
                onClick={() => onNavigate?.(category.id)}>
            
            {/* Header with Icon and Title */}
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className={`p-4 rounded-xl group-hover:scale-110 transition-transform duration-300 ${
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
            
            <CardContent className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(category.stats).filter(([key]) => key !== 'progress').map(([key, value]) => (
                  <div key={key} className="text-center p-3 bg-white/80 rounded-lg border">
                    <div className={`text-lg font-bold mb-1 ${
                      category.color === 'emerald' ? 'text-emerald-600' :
                      category.color === 'amber' ? 'text-amber-600' :
                      category.color === 'blue' ? 'text-blue-600' : 'text-purple-600'
                    }`}>
                      {value}
                    </div>
                    <div className="text-xs text-gray-600 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                  <span className={`text-sm font-bold ${
                    category.color === 'emerald' ? 'text-emerald-600' :
                    category.color === 'amber' ? 'text-amber-600' :
                    category.color === 'blue' ? 'text-blue-600' : 'text-purple-600'
                  }`}>
                    {category.stats.progress}%
                  </span>
                </div>
                <Progress value={category.stats.progress} className="h-2" />
              </div>

              {/* Key Highlights */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Key Highlights</h4>
                <div className="space-y-2">
                  {category.highlights.map((highlight, hIndex) => (
                    <div key={hIndex} className="flex items-center gap-2 text-sm">
                      <div className={`w-2 h-2 rounded-full ${
                        category.color === 'emerald' ? 'bg-emerald-500' :
                        category.color === 'amber' ? 'bg-amber-500' :
                        category.color === 'blue' ? 'bg-blue-500' : 'bg-purple-500'
                      }`}></div>
                      <span className="text-gray-700">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-1">Recent Activity</p>
                    <p className="text-sm text-gray-600">{category.recentActivity}</p>
                  </div>
                </div>
              </div>

              {/* View Details Button */}
              <Button 
                className={`w-full text-white ${
                  category.color === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-700' :
                  category.color === 'amber' ? 'bg-amber-600 hover:bg-amber-700' :
                  category.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate?.(category.id);
                }}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                View Detailed Analytics
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
        {[
          {
            title: 'Classroom & Administrative Offices',
            page: 'classroom-administrative-offices',
            icon: Building2,
            description: 'Facility assessments and management'
          },
          {
            title: 'Policies & Governance',
            page: 'policies',
            icon: Users,
            description: 'MOAs, MOUs, and frameworks'
          },
          {
            title: 'Downloadable Forms',
            page: 'forms',
            icon: Calendar,
            description: 'Official forms and checklists'
          },
          {
            title: 'About PMO',
            page: 'about-us',
            icon: Users,
            description: 'Personnel and contact information'
          }
        ].map((item, index) => (
          <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-all duration-300 group cursor-pointer"
                onClick={() => onNavigate?.(item.page)}>
            <CardContent className="p-6 text-center">
              <div className="mx-auto w-12 h-12 bg-gradient-to-br from-emerald-100 to-amber-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
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
  );
}