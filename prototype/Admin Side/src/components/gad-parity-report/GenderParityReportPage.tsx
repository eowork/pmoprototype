import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  GraduationCap, 
  Users, 
  Briefcase, 
  Accessibility, 
  Globe,
  Plus,
  Download,
  Upload
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { StudentParityDataManager } from './admin/StudentParityDataManager';
import { FacultyParityDataManager } from './admin/FacultyParityDataManager';
import { StaffParityDataManager } from './admin/StaffParityDataManager';
import { PWDParityDataManager } from './admin/PWDParityDataManager';
import { IndigenousParityDataManager } from './admin/IndigenousParityDataManager';

interface GenderParityReportPageProps {
  category: string;
  onProjectSelect?: (project: any) => void;
  userRole: string;
  userEmail?: string;
  userName?: string;
  filterData?: any;
  requireAuth: (action: string) => boolean;
  onClearFilters?: () => void;
}

export function GenderParityReportPage({
  category,
  userRole,
  userEmail = 'user@carsu.edu.ph',
  userName = 'User',
  requireAuth
}: GenderParityReportPageProps) {
  const [activeTab, setActiveTab] = useState('students');

  const handleExportData = () => {
    if (!requireAuth('export data')) return;
    toast.success('Data export initiated');
  };

  const handleImportData = () => {
    if (!requireAuth('import data')) return;
    toast.success('Data import dialog opened');
  };

  const canEdit = userRole === 'Admin' || userRole === 'Staff';

  return (
    <div className="h-full overflow-auto admin-page-bg">
      <div className="max-w-7xl mx-auto p-8 space-y-6">
        {/* Header - Minimal and Formal */}
        <div className="admin-header rounded-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-gray-900">Gender Parity & Knowledge Management System</h1>
              <p className="text-gray-600 mt-2">
                Data Analytics and Collection for Inclusive Education Monitoring
              </p>
            </div>
            {canEdit && (
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={handleImportData}
                  className="gap-2 border-gray-300 hover:bg-gray-100"
                >
                  <Upload className="h-4 w-4" />
                  Import
                </Button>
                <Button
                  variant="outline"
                  onClick={handleExportData}
                  className="gap-2 border-gray-300 hover:bg-gray-100"
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs - Minimal Design */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 gap-1 bg-white p-1 rounded-lg border border-gray-200">
            <TabsTrigger 
              value="students" 
              className="flex items-center justify-center gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white rounded-md transition-all"
            >
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline">Students</span>
            </TabsTrigger>
            <TabsTrigger 
              value="faculty" 
              className="flex items-center justify-center gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white rounded-md transition-all"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Faculty</span>
            </TabsTrigger>
            <TabsTrigger 
              value="staff" 
              className="flex items-center justify-center gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white rounded-md transition-all"
            >
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">Staff</span>
            </TabsTrigger>
            <TabsTrigger 
              value="pwd" 
              className="flex items-center justify-center gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white rounded-md transition-all"
            >
              <Accessibility className="h-4 w-4" />
              <span className="hidden sm:inline">PWD</span>
            </TabsTrigger>
            <TabsTrigger 
              value="indigenous" 
              className="flex items-center justify-center gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white rounded-md transition-all"
            >
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Indigenous</span>
            </TabsTrigger>
          </TabsList>

          {/* Students Tab */}
          <TabsContent value="students" className="mt-6">
            <StudentParityDataManager 
              userRole={userRole}
              userEmail={userEmail}
              userName={userName}
            />
          </TabsContent>

          {/* Faculty Tab */}
          <TabsContent value="faculty" className="mt-6">
            <FacultyParityDataManager 
              userRole={userRole}
              userEmail={userEmail}
              userName={userName}
            />
          </TabsContent>

          {/* Staff Tab */}
          <TabsContent value="staff" className="mt-6">
            <StaffParityDataManager 
              userRole={userRole}
              userEmail={userEmail}
              userName={userName}
            />
          </TabsContent>

          {/* PWD Tab */}
          <TabsContent value="pwd" className="mt-6">
            <PWDParityDataManager 
              userRole={userRole}
              userEmail={userEmail}
              userName={userName}
            />
          </TabsContent>

          {/* Indigenous Tab */}
          <TabsContent value="indigenous" className="mt-6">
            <IndigenousParityDataManager 
              userRole={userRole}
              userEmail={userEmail}
              userName={userName}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
