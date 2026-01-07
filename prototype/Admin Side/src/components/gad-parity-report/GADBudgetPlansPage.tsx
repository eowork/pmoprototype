import React from 'react';
import { Button } from '../ui/button';
import { 
  Download,
  Upload,
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { GADBudgetPlansManager } from './admin/GADBudgetPlansManager';

interface GADBudgetPlansPageProps {
  category: string;
  onProjectSelect?: (project: any) => void;
  userRole: string;
  userEmail?: string;
  userName?: string;
  filterData?: any;
  requireAuth: (action: string) => boolean;
  onClearFilters?: () => void;
}

export function GADBudgetPlansPage({
  category,
  userRole,
  userEmail = 'user@carsu.edu.ph',
  userName = 'User',
  requireAuth
}: GADBudgetPlansPageProps) {

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
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-lg border border-green-200">
                <DollarSign className="h-7 w-7 text-green-700" />
              </div>
              <div>
                <h1 className="text-gray-900">GAD Budget Plans</h1>
                <p className="text-gray-600 mt-2">
                  Gender and Development budget planning and management with strategic activity integration
                </p>
              </div>
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

        {/* Data Manager Component */}
        <GADBudgetPlansManager 
          userRole={userRole}
          userEmail={userEmail}
          userName={userName}
        />
      </div>
    </div>
  );
}
