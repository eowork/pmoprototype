import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Textarea } from '../../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../ui/tooltip';
import { DocumentItem } from '../../types/ProjectDetailTypes';
import { MEFilter } from '../../types/METypes';
import { formatDate } from '../../utils/analyticsHelpers';
import { getFilterImpactMessage } from '../../utils/projectDetailHelpers';
import { toast } from 'sonner@2.0.3';
import { TableIcon, Grid3x3, Upload, FileText, FilePlus, ArrowUpDown, Edit, Eye, Download, Trash2 } from 'lucide-react';
import { getDefaultDocumentsData } from '../data/sampleGalleryDocumentsData';

interface DocumentsTabProps {
  documentItems: DocumentItem[];
  filteredDocumentItems: DocumentItem[];
  globalMEFilter: MEFilter;
  onFilterChange: (filter: MEFilter) => void;
  onClearFilter: () => void;
  projectId: string;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  onAddDocument: (documentData: {
    file: File;
    name: string;
    documentType: string;
    dateOfEntry: string;
    description: string;
    category?: 'report' | 'form' | 'assessment' | 'other';
  }) => void;
  onDeleteDocument: (id: string) => void;
}

export function DocumentsTab({
  documentItems,
  filteredDocumentItems,
  globalMEFilter,
  onFilterChange,
  onClearFilter,
  projectId,
  canAdd,
  canEdit,
  canDelete,
  onAddDocument,
  onDeleteDocument
}: DocumentsTabProps) {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [sampleDocumentItems, setSampleDocumentItems] = useState<any[]>([]);
  const [editingDocument, setEditingDocument] = useState<any | null>(null);
  const [viewingDocument, setViewingDocument] = useState<any | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: 'dateOfEntry' | 'name' | 'type' | 'category';
    direction: 'asc' | 'desc';
  }>({ key: 'dateOfEntry', direction: 'desc' });
  
  const [uploadForm, setUploadForm] = useState({
    file: null as File | null,
    name: '',
    documentType: 'PDF',
    dateOfEntry: new Date().toISOString().split('T')[0],
    description: '',
    category: 'other' as 'report' | 'form' | 'assessment' | 'other'
  });

  const [editForm, setEditForm] = useState({
    file: null as File | null,
    name: '',
    documentType: 'PDF',
    dateOfEntry: '',
    description: '',
    category: 'other' as 'report' | 'form' | 'assessment' | 'other'
  });

  // Load enhanced sample data with Date of Entry
  useEffect(() => {
    if (!documentItems || documentItems.length === 0) {
      const enhancedSampleData = [
        {
          id: 'doc-001',
          name: 'Project Charter and Scope Document',
          filename: 'project_charter_v1.2.pdf',
          type: 'PDF',
          fileType: 'PDF',
          category: 'report',
          documentCategory: 'report',
          size: '2.3 MB',
          fileSize: '2.3 MB',
          dateOfEntry: '2024-01-10',
          uploadedAt: '2024-01-10',
          dateUploaded: '2024-01-10',
          uploadedBy: 'Project Manager',
          relatedPeriod: 'Planning Phase',
          description: 'Comprehensive project charter including scope, objectives, and stakeholder requirements',
          remarks: 'Comprehensive project charter including scope, objectives, and stakeholder requirements',
          url: '#',
          meRelevant: true
        },
        {
          id: 'doc-002',
          name: 'Environmental Impact Assessment',
          filename: 'eia_report_final.pdf',
          type: 'PDF',
          fileType: 'PDF',
          category: 'assessment',
          documentCategory: 'assessment',
          size: '8.7 MB',
          fileSize: '8.7 MB',
          dateOfEntry: '2024-01-15',
          uploadedAt: '2024-01-15',
          dateUploaded: '2024-01-15',
          uploadedBy: 'Environmental Consultant',
          relatedPeriod: 'Pre-construction',
          description: 'Detailed environmental impact assessment and mitigation measures',
          remarks: 'Detailed environmental impact assessment and mitigation measures',
          url: '#',
          meRelevant: true
        },
        {
          id: 'doc-003',
          name: 'Construction Permit Application',
          filename: 'construction_permit_app.pdf',
          type: 'PDF',
          fileType: 'PDF',
          category: 'form',
          documentCategory: 'form',
          size: '1.8 MB',
          fileSize: '1.8 MB',
          dateOfEntry: '2024-01-20',
          uploadedAt: '2024-01-20',
          dateUploaded: '2024-01-20',
          uploadedBy: 'Legal Compliance Officer',
          relatedPeriod: 'Pre-construction',
          description: 'Official construction permit application submitted to local authorities',
          remarks: 'Official construction permit application submitted to local authorities',
          url: '#',
          meRelevant: false
        },
        {
          id: 'doc-004',
          name: 'Material Procurement Specifications',
          filename: 'material_specs_v2.1.xlsx',
          type: 'XLSX',
          fileType: 'XLSX',
          category: 'other',
          documentCategory: 'other',
          size: '890 KB',
          fileSize: '890 KB',
          dateOfEntry: '2024-02-01',
          uploadedAt: '2024-02-01',
          dateUploaded: '2024-02-01',
          uploadedBy: 'Procurement Specialist',
          relatedPeriod: 'Pre-construction',
          description: 'Detailed specifications for all construction materials and quality standards',
          remarks: 'Detailed specifications for all construction materials and quality standards',
          url: '#',
          meRelevant: true
        },
        {
          id: 'doc-005',
          name: 'Monthly Progress Report - February',
          filename: 'progress_report_feb_2024.docx',
          type: 'DOCX',
          fileType: 'DOCX',
          category: 'report',
          documentCategory: 'report',
          size: '3.2 MB',
          fileSize: '3.2 MB',
          dateOfEntry: '2024-03-01',
          uploadedAt: '2024-03-01',
          dateUploaded: '2024-03-01',
          uploadedBy: 'Project Coordinator',
          relatedPeriod: 'Month 2',
          description: 'Comprehensive monthly progress report including financial and physical accomplishments',
          remarks: 'Comprehensive monthly progress report including financial and physical accomplishments',
          url: '#',
          meRelevant: true
        },
        {
          id: 'doc-006',
          name: 'Safety Protocol and Emergency Procedures',
          filename: 'safety_protocols_v1.0.pdf',
          type: 'PDF',
          fileType: 'PDF',
          category: 'other',
          documentCategory: 'other',
          size: '4.1 MB',
          fileSize: '4.1 MB',
          dateOfEntry: '2024-03-05',
          uploadedAt: '2024-03-05',
          dateUploaded: '2024-03-05',
          uploadedBy: 'Safety Officer',
          relatedPeriod: 'Ongoing',
          description: 'Comprehensive safety protocols and emergency response procedures for the construction site',
          remarks: 'Comprehensive safety protocols and emergency response procedures for the construction site',
          url: '#',
          meRelevant: false
        },
        {
          id: 'doc-007',
          name: 'Quality Assurance Checklist',
          filename: 'qa_checklist_march.xlsx',
          type: 'XLSX',
          fileType: 'XLSX',
          category: 'form',
          documentCategory: 'form',
          size: '567 KB',
          fileSize: '567 KB',
          dateOfEntry: '2024-03-15',
          uploadedAt: '2024-03-15',
          dateUploaded: '2024-03-15',
          uploadedBy: 'Quality Control Manager',
          relatedPeriod: 'Month 3',
          description: 'Monthly quality assurance checklist and inspection results',
          remarks: 'Monthly quality assurance checklist and inspection results',
          url: '#',
          meRelevant: true
        },
        {
          id: 'doc-008',
          name: 'Financial Disbursement Report Q1',
          filename: 'financial_report_q1_2024.pdf',
          type: 'PDF',
          fileType: 'PDF',
          category: 'report',
          documentCategory: 'report',
          size: '2.9 MB',
          fileSize: '2.9 MB',
          dateOfEntry: '2024-04-01',
          uploadedAt: '2024-04-01',
          dateUploaded: '2024-04-01',
          uploadedBy: 'Finance Manager',
          relatedPeriod: 'Q1 2024',
          description: 'Quarterly financial report showing budget utilization and disbursements',
          remarks: 'Quarterly financial report showing budget utilization and disbursements',
          url: '#',
          meRelevant: true
        },
        {
          id: 'doc-009',
          name: 'Contractor Performance Evaluation',
          filename: 'contractor_eval_april.docx',
          type: 'DOCX',
          fileType: 'DOCX',
          category: 'assessment',
          documentCategory: 'assessment',
          size: '1.5 MB',
          fileSize: '1.5 MB',
          dateOfEntry: '2024-04-15',
          uploadedAt: '2024-04-15',
          dateUploaded: '2024-04-15',
          uploadedBy: 'Project Supervisor',
          relatedPeriod: 'Month 4',
          description: 'Performance evaluation of main contractor including recommendations',
          remarks: 'Performance evaluation of main contractor including recommendations',
          url: '#',
          meRelevant: true
        },
        {
          id: 'doc-010',
          name: 'Change Order Request - Foundation Modifications',
          filename: 'change_order_foundation_v1.pdf',
          type: 'PDF',
          fileType: 'PDF',
          category: 'form',
          documentCategory: 'form',
          size: '2.1 MB',
          fileSize: '2.1 MB',
          dateOfEntry: '2024-05-01',
          uploadedAt: '2024-05-01',
          dateUploaded: '2024-05-01',
          uploadedBy: 'Design Engineer',
          relatedPeriod: 'Month 5',
          description: 'Change order request for foundation modifications due to soil conditions',
          remarks: 'Change order request for foundation modifications due to soil conditions',
          url: '#',
          meRelevant: true
        },
        {
          id: 'doc-011',
          name: 'Material Testing Results - May',
          filename: 'material_tests_may_2024.xlsx',
          type: 'XLSX',
          fileType: 'XLSX',
          category: 'assessment',
          documentCategory: 'assessment',
          size: '1.2 MB',
          fileSize: '1.2 MB',
          dateOfEntry: '2024-05-10',
          uploadedAt: '2024-05-10',
          dateUploaded: '2024-05-10',
          uploadedBy: 'Materials Engineer',
          relatedPeriod: 'Month 5',
          description: 'Comprehensive material testing results for concrete and steel components',
          remarks: 'Comprehensive material testing results for concrete and steel components',
          url: '#',
          meRelevant: true
        },
        {
          id: 'doc-012',
          name: 'Environmental Monitoring Report',
          filename: 'env_monitoring_q2.pdf',
          type: 'PDF',
          fileType: 'PDF',
          category: 'report',
          documentCategory: 'report',
          size: '3.8 MB',
          fileSize: '3.8 MB',
          dateOfEntry: '2024-05-15',
          uploadedAt: '2024-05-15',
          dateUploaded: '2024-05-15',
          uploadedBy: 'Environmental Officer',
          relatedPeriod: 'Q2 2024',
          description: 'Quarterly environmental monitoring report with compliance status',
          remarks: 'Quarterly environmental monitoring report with compliance status',
          url: '#',
          meRelevant: false
        }
      ];

      setSampleDocumentItems(enhancedSampleData);
    }
  }, [projectId, documentItems?.length]);

  // Get display items and apply sorting
  const getDisplayItems = () => {
    const items = (documentItems && documentItems.length > 0) ? filteredDocumentItems : sampleDocumentItems;
    
    return [...items].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortConfig.key) {
        case 'dateOfEntry':
          aValue = new Date(a.dateOfEntry || a.uploadedAt || a.dateUploaded || '');
          bValue = new Date(b.dateOfEntry || b.uploadedAt || b.dateUploaded || '');
          break;
        case 'name':
          aValue = (a.name || a.filename || '').toLowerCase();
          bValue = (b.name || b.filename || '').toLowerCase();
          break;
        case 'type':
          aValue = (a.type || a.fileType || '').toLowerCase();
          bValue = (b.type || b.fileType || '').toLowerCase();
          break;
        case 'category':
          aValue = (a.category || a.documentCategory || '').toLowerCase();
          bValue = (b.category || b.documentCategory || '').toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const displayItems = getDisplayItems();

  const handleSort = (key: typeof sortConfig.key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="w-3 h-3 text-gray-400" />;
    return <ArrowUpDown className={`w-3 h-3 ${sortConfig.direction === 'asc' ? 'text-blue-600' : 'text-blue-600 rotate-180'}`} />;
  };

  const filterImpactMessage = getFilterImpactMessage(
    displayItems.length,
    (documentItems && documentItems.length > 0) ? documentItems.length : sampleDocumentItems.length,
    globalMEFilter
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (50MB max)
      if (file.size > 50 * 1024 * 1024) {
        toast.error('File size must be less than 50MB');
        return;
      }
      
      // Auto-fill name from filename
      const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, '');
      const extension = file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN';
      
      setUploadForm(prev => ({ 
        ...prev, 
        file,
        name: prev.name || nameWithoutExtension,
        documentType: extension
      }));
    }
  };

  const handleUploadSubmit = () => {
    if (!uploadForm.file || !uploadForm.name.trim() || !uploadForm.dateOfEntry || !uploadForm.description.trim()) {
      toast.error('Please fill in all required fields: file, name, date of entry, and description');
      return;
    }

    onAddDocument({
      file: uploadForm.file,
      name: uploadForm.name,
      documentType: uploadForm.documentType,
      dateOfEntry: uploadForm.dateOfEntry,
      description: uploadForm.description,
      category: uploadForm.category
    });

    // Reset form
    setUploadForm({
      file: null,
      name: '',
      documentType: 'PDF',
      dateOfEntry: new Date().toISOString().split('T')[0],
      description: '',
      category: 'other'
    });
    setIsUploadDialogOpen(false);
  };

  const handleDeleteDocument = (id: string, filename: string) => {
    if (confirm(`Are you sure you want to delete "${filename}"?`)) {
      onDeleteDocument(id);
      
      // Also remove from sample data if using it
      if (!documentItems || documentItems.length === 0) {
        setSampleDocumentItems(prev => prev.filter(item => item.id !== id));
      }
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'xls':
      case 'xlsx':
        return '📊';
      case 'ppt':
      case 'pptx':
        return '📋';
      default:
        return '📁';
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'report':
        return 'bg-blue-100 text-blue-800';
      case 'form':
        return 'bg-green-100 text-green-800';
      case 'assessment':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="border border-gray-200 shadow-sm bg-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Documents & Forms
          </CardTitle>
          <CardDescription className="text-gray-600">
            Project documentation with date-based filtering and sorting capabilities
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <TooltipProvider>
            <div className="flex items-center gap-1 bg-gray-100 rounded-md p-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                    className="px-2 py-1"
                    aria-label="Table view"
                  >
                    <TableIcon className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Table View - Sortable columns</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === 'cards' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('cards')}
                    className="px-2 py-1"
                    aria-label="Card view"
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Card View - Document cards</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>

          {canAdd && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={() => setIsUploadDialogOpen(true)} 
                    size="sm"
                    className="gap-1"
                    aria-label="Upload document"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Document
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Upload new project document</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Show filter impact message */}
        {filterImpactMessage && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">{filterImpactMessage}</p>
          </div>
        )}

        {/* Sample data notice */}
        {(!documentItems || documentItems.length === 0) && sampleDocumentItems.length > 0 && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>Sample Data:</strong> Showing sample documents with Date of Entry for demonstration. 
              Upload actual project documents to replace this data.
            </p>
          </div>
        )}

        {viewMode === 'table' ? (
          <div className="w-full overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Document</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50" 
                    onClick={() => handleSort('type')}
                  >
                    <div className="flex items-center gap-1 font-semibold">
                      Type {getSortIcon('type')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="hidden md:table-cell cursor-pointer hover:bg-gray-50" 
                    onClick={() => handleSort('category')}
                  >
                    <div className="flex items-center gap-1 font-semibold">
                      Category {getSortIcon('category')}
                    </div>
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">Size</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50" 
                    onClick={() => handleSort('dateOfEntry')}
                  >
                    <div className="flex items-center gap-1 font-semibold whitespace-nowrap">
                      Date {getSortIcon('dateOfEntry')}
                    </div>
                  </TableHead>
                  <TableHead className="hidden xl:table-cell">Uploaded By</TableHead>
                  <TableHead className="hidden xl:table-cell">Related Period</TableHead>
                  <TableHead className="hidden 2xl:table-cell">Description</TableHead>
                  {canDelete && documentItems && documentItems.length > 0 && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="min-w-[200px]">
                      <div className="flex items-center gap-2">
                        <span className="text-lg flex-shrink-0">{getFileIcon(item.type || item.fileType)}</span>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm truncate">{item.name || item.filename}</div>
                          <a 
                            href={item.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline whitespace-nowrap"
                          >
                            View Document
                          </a>
                          {/* Mobile-only: Show additional info */}
                          <div className="md:hidden mt-1 space-y-0.5">
                            {(item.category || item.documentCategory) && (
                              <div>
                                <Badge className={`text-[10px] ${getCategoryColor(item.category || item.documentCategory)}`}>
                                  {item.category || item.documentCategory}
                                </Badge>
                              </div>
                            )}
                            <div className="text-xs text-gray-500">{item.size || item.fileSize}</div>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs whitespace-nowrap">
                        {item.type || item.fileType}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {(item.category || item.documentCategory) && (
                        <Badge className={`text-xs whitespace-nowrap ${getCategoryColor(item.category || item.documentCategory)}`}>
                          {item.category || item.documentCategory}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-gray-600 whitespace-nowrap">{item.size || item.fileSize}</TableCell>
                    <TableCell className="text-sm font-medium whitespace-nowrap">
                      {formatDate(item.dateOfEntry || item.uploadedAt || item.dateUploaded)}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell text-sm text-gray-600 whitespace-nowrap">{item.uploadedBy}</TableCell>
                    <TableCell className="hidden xl:table-cell">
                      {item.relatedPeriod && (
                        <Badge variant="secondary" className="text-xs whitespace-nowrap">
                          {item.relatedPeriod}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="hidden 2xl:table-cell max-w-xs">
                      <div className="truncate text-sm text-gray-600" title={item.description || item.remarks}>
                        {item.description || item.remarks}
                      </div>
                    </TableCell>
                    {canDelete && documentItems.length > 0 && (
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteDocument(item.id, item.name || item.filename)}
                          className="text-xs"
                        >
                          Delete
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayItems.map((item) => (
              <Card key={item.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl flex-shrink-0">{getFileIcon(item.type || item.fileType)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-medium text-sm text-gray-900 line-clamp-2">{item.name || item.filename}</h4>
                        {canDelete && documentItems.length > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteDocument(item.id, item.name || item.filename)}
                            className="text-xs"
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {item.type || item.fileType}
                          </Badge>
                          {(item.category || item.documentCategory) && (
                            <Badge className={`text-xs ${getCategoryColor(item.category || item.documentCategory)}`}>
                              {item.category || item.documentCategory}
                            </Badge>
                          )}
                          <span className="text-xs text-gray-500">{item.size || item.fileSize}</span>
                        </div>
                        
                        <p className="text-xs text-gray-600 line-clamp-3">{item.description || item.remarks}</p>
                        
                        <div className="space-y-1 text-xs text-gray-500">
                          <div>Date of Entry: {formatDate(item.dateOfEntry || item.uploadedAt || item.dateUploaded)}</div>
                          <div>By: {item.uploadedBy}</div>
                          {item.relatedPeriod && (
                            <div>Period: {item.relatedPeriod}</div>
                          )}
                        </div>
                        
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block text-xs text-blue-600 hover:underline"
                        >
                          View Document
                        </a>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {displayItems.length === 0 && (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <FileText className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
            <p className="text-gray-500 mb-4">
              No documents have been uploaded for this project yet.
            </p>
            <div className="flex items-center justify-center gap-3">
              {canAdd && (
                <Button onClick={() => setIsUploadDialogOpen(true)}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload First Document
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Add a new document or form related to the project
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="document-file">Document File *</Label>
              <Input
                id="document-file"
                type="file"
                onChange={handleFileChange}
                className="cursor-pointer"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
              />
              <p className="text-xs text-gray-500">
                Maximum file size: 50MB. Supported formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="document-name">Document Name *</Label>
              <Input
                id="document-name"
                value={uploadForm.name}
                onChange={(e) => setUploadForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Auto-filled from filename (editable)"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="document-type">Document Type</Label>
                <Select
                  value={uploadForm.documentType}
                  onValueChange={(value) => setUploadForm(prev => ({ ...prev, documentType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PDF">PDF</SelectItem>
                    <SelectItem value="DOC">DOC</SelectItem>
                    <SelectItem value="DOCX">DOCX</SelectItem>
                    <SelectItem value="XLS">XLS</SelectItem>
                    <SelectItem value="XLSX">XLSX</SelectItem>
                    <SelectItem value="PPT">PPT</SelectItem>
                    <SelectItem value="PPTX">PPTX</SelectItem>
                    <SelectItem value="TXT">TXT</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="document-category">Category</Label>
                <Select
                  value={uploadForm.category}
                  onValueChange={(value: 'report' | 'form' | 'assessment' | 'other') => 
                    setUploadForm(prev => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="report">Progress Report</SelectItem>
                    <SelectItem value="form">Form</SelectItem>
                    <SelectItem value="assessment">Assessment</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-of-entry">Date of Entry *</Label>
              <Input
                id="date-of-entry"
                type="date"
                value={uploadForm.dateOfEntry}
                onChange={(e) => setUploadForm(prev => ({ ...prev, dateOfEntry: e.target.value }))}
              />
              <p className="text-xs text-gray-500">Auto-filled to today but editable for filtering/sorting</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="document-description">Brief Description *</Label>
              <Textarea
                id="document-description"
                value={uploadForm.description}
                onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the document content and purpose"
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUploadSubmit}>
              Upload Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}