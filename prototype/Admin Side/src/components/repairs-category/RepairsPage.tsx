import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { 
  Building2, 
  MapPin, 
  Wrench, 
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  GraduationCap,
  ArrowRight
} from 'lucide-react';
import { ClassroomsRepairsPage } from './ClassroomsRepairsPage';
import { AdministrativeOfficesRepairsPage } from './AdministrativeOfficesRepairsPage';
import { RepairProjectDetail } from './RepairProjectDetail';
import { RepairProject } from './types/RepairTypes';
import { toast } from 'sonner@2.0.3';

interface RepairsPageProps {
  category: string;
  onProjectSelect: (project: RepairProject) => void;
  userRole: string;
  userEmail?: string;
  userDepartment?: string;
  filterData?: any;
  requireAuth: (action: string) => boolean;
  onClearFilters: () => void;
}

export function RepairsPage({
  category,
  onProjectSelect,
  userRole,
  userEmail = 'user@carsu.edu.ph',
  userDepartment = 'General',
  filterData,
  requireAuth,
  onClearFilters
}: RepairsPageProps) {
  const [selectedProject, setSelectedProject] = useState<RepairProject | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);

  const handleProjectSelect = (project: RepairProject) => {
    setSelectedProject(project);
    onProjectSelect(project);
  };

  const handleBackToList = () => {
    setSelectedProject(null);
  };

  const handleBackToMain = () => {
    setSelectedSubcategory(null);
    setSelectedProject(null);
  };

  // If a project is selected, show the detail view
  if (selectedProject) {
    return (
      <RepairProjectDetail
        project={selectedProject}
        onBack={handleBackToList}
        onNavigate={(page) => {}}
        userRole={userRole}
        requireAuth={requireAuth}
        onEdit={(project) => {
          // Handle edit functionality
          toast.info('Edit functionality would open the project edit dialog');
        }}
        onDelete={(projectId) => {
          // Handle delete functionality
          if (window.confirm('Are you sure you want to delete this repair project?')) {
            toast.success('Repair project deleted successfully');
            setSelectedProject(null);
          }
        }}
      />
    );
  }

  // Route to specific subcategories based on category parameter
  if (category === 'classrooms-csu-cc-bxu' || selectedSubcategory === 'classrooms') {
    return (
      <div className="space-y-4">
        {!category.includes('classrooms') && (
          <Button variant="outline" onClick={handleBackToMain} className="gap-2">
            <ArrowRight className="w-4 h-4 rotate-180" />
            Back to Repairs Overview
          </Button>
        )}
        <ClassroomsRepairsPage
          category={category}
          onProjectSelect={handleProjectSelect}
          userRole={userRole}
          userEmail={userEmail}
          userDepartment={userDepartment}
          filterData={filterData}
          requireAuth={requireAuth}
          onClearFilters={onClearFilters}
        />
      </div>
    );
  }

  if (category === 'administrative-offices-csu-cc-bxu' || selectedSubcategory === 'administrative') {
    return (
      <div className="space-y-4">
        {!category.includes('administrative') && (
          <Button variant="outline" onClick={handleBackToMain} className="gap-2">
            <ArrowRight className="w-4 h-4 rotate-180" />
            Back to Repairs Overview
          </Button>
        )}
        <AdministrativeOfficesRepairsPage
          category={category}
          onProjectSelect={handleProjectSelect}
          userRole={userRole}
          userEmail={userEmail}
          userDepartment={userDepartment}
          filterData={filterData}
          requireAuth={requireAuth}
          onClearFilters={onClearFilters}
        />
      </div>
    );
  }

  // Default: Show subcategory selection interface
  return (
    <div className="h-full overflow-auto bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg text-white">
              <Wrench className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Campus Repairs & Maintenance</h1>
              <p className="text-muted-foreground text-lg">
                Comprehensive facility maintenance management across CSU Main and CSU CC campuses
              </p>
            </div>
          </div>
        </div>

        {/* Subcategory Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Classrooms Repair Category */}
          <Card 
            className="border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
            onClick={() => setSelectedSubcategory('classrooms')}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <GraduationCap className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Classroom Repairs</CardTitle>
                    <p className="text-muted-foreground">Educational facility maintenance</p>
                  </div>
                </div>
                <ArrowRight className="w-6 h-6 text-muted-foreground group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Manage repair and maintenance projects for classrooms, laboratories, libraries, 
                and other educational spaces across both CSU Main and CSU CC campuses.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">CSU Main</div>
                  <div className="text-xs text-muted-foreground">Engineering, Science, Library</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">CSU CC</div>
                  <div className="text-xs text-muted-foreground">Academic, IT, Lecture Halls</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Features:</span>
                <Badge variant="outline" className="text-xs">Campus Filtering</Badge>
              </div>
              
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Air conditioning and HVAC systems</li>
                <li>• Electrical and lighting systems</li>
                <li>• Structural repairs and maintenance</li>
                <li>• Flooring and interior improvements</li>
              </ul>
            </CardContent>
          </Card>

          {/* Administrative Offices Repair Category */}
          <Card 
            className="border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
            onClick={() => setSelectedSubcategory('administrative')}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                    <Building2 className="w-8 h-8 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Administrative Office Repairs</CardTitle>
                    <p className="text-muted-foreground">Administrative facility maintenance</p>
                  </div>
                </div>
                <ArrowRight className="w-6 h-6 text-muted-foreground group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Handle repair and maintenance projects for administrative offices, support services, 
                and management facilities across both CSU Main and CSU CC campuses.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">CSU Main</div>
                  <div className="text-xs text-muted-foreground">Registrar, Finance, HR</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">CSU CC</div>
                  <div className="text-xs text-muted-foreground">Director, Student Services</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Features:</span>
                <Badge variant="outline" className="text-xs">Campus Filtering</Badge>
              </div>
              
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• HVAC and climate control systems</li>
                <li>• Network and communication infrastructure</li>
                <li>• Security and access control systems</li>
                <li>• Office renovations and upgrades</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Features Overview */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              System Features & Capabilities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  Campus-Based Filtering
                </h4>
                <p className="text-sm text-muted-foreground">
                  Filter and manage projects specifically by CSU Main or CSU CC campus locations 
                  for precise project tracking and resource allocation.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-green-500" />
                  Data Analytics Dashboard
                </h4>
                <p className="text-sm text-muted-foreground">
                  Comprehensive analytics with interactive charts, budget tracking, 
                  and project status visualization for informed decision-making.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-500" />
                  Project Management
                </h4>
                <p className="text-sm text-muted-foreground">
                  Complete project lifecycle management with CRUD operations, 
                  timeline tracking, and detailed project documentation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Access Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2"
                onClick={() => setSelectedSubcategory('classrooms')}
              >
                <GraduationCap className="w-4 h-4" />
                Browse Classroom Repairs
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2"
                onClick={() => setSelectedSubcategory('administrative')}
              >
                <Building2 className="w-4 h-4" />
                Browse Office Repairs
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Campus Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                <span className="text-sm font-medium">CSU Main Campus</span>
                <Badge variant="outline" className="bg-blue-100">Primary</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                <span className="text-sm font-medium">CSU CC (Cabadbaran)</span>
                <Badge variant="outline" className="bg-green-100">Extension</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}