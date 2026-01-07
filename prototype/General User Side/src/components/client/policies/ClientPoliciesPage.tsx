import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../../ui/pagination';
import { 
  FileText, 
  FileSignature, 
  Search, 
  Calendar, 
  Download,
  Eye,
  Building2,
  Users,
  CheckCircle,
  Clock,
  Filter,
  ArrowRight,
  Shield,
  Globe,
  BookOpen,
  TrendingUp,
  Target,
  Activity,
  Zap
} from 'lucide-react';
import { ClientNavbar } from '../components/ClientNavbar';
import { NavigationProps } from '../types';
import { toast } from 'sonner@2.0.3';
import { 
  SAMPLE_POLICIES_DATA, 
  POLICIES_STATISTICS, 
  PolicyDocument
} from './policiesData';

interface ClientPoliciesPageProps extends NavigationProps {
  currentSection?: string;
}

export function ClientPoliciesPage({ 
  onNavigate,
  onSignIn,
  onSignOut,
  onNavigateToDashboard,
  onAuthModalSignIn,
  userRole = 'Client',
  userProfile,
  requireAuth,
  currentSection,
  demoMode = false 
}: ClientPoliciesPageProps) {
  
  const [activeSection, setActiveSection] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Navigation sections
  const navigationSections = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'memorandum-agreements', label: 'MOA Documents', icon: FileSignature },
    { id: 'memorandum-understanding', label: 'MOU Documents', icon: FileText },
    { id: 'policies', label: 'University Policies', icon: Shield },
    { id: 'agreements', label: 'Other Agreements', icon: Globe }
  ];

  const scrollToSection = (sectionId: string, fromButton = false) => {
    console.log('🎯 Policies - Enhanced scrolling to section:', sectionId, fromButton ? '(from button)' : '(from navigation)');
    
    // Immediate visual feedback for better UX
    if (fromButton) {
      setActiveSection(sectionId);
    }
    
    // Enhanced scroll function
    const performEnhancedScroll = () => {
      const element = document.getElementById(sectionId);
      
      if (!element) {
        console.warn('❌ Policies - Target element not found:', sectionId);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setActiveSection('overview');
        return;
      }
      
      console.log('✅ Policies - Target element found:', sectionId);
      
      // Get all sticky navigation elements with more precision
      const clientNavbar = document.querySelector('.client-navbar') || 
                          document.querySelector('[class*="client-navbar"]');
      const stickyNav = document.querySelector('[data-sticky-nav]') || 
                       document.querySelector('.sticky.top-16') ||
                       document.querySelector('[class*="sticky"]');
      
      // Dynamic offset calculation with safety margins
      let totalOffset = 30; // Base padding for better visual spacing
      
      if (clientNavbar) {
        const navHeight = clientNavbar.getBoundingClientRect().height;
        totalOffset += navHeight;
        console.log('📏 Policies - Client navbar height:', navHeight);
      }
      
      if (stickyNav && stickyNav !== clientNavbar) {
        const stickyHeight = stickyNav.getBoundingClientRect().height;
        totalOffset += stickyHeight;
        console.log('📏 Policies - Sticky nav height:', stickyHeight);
      }
      
      // Get accurate element position
      const elementRect = element.getBoundingClientRect();
      const elementPosition = elementRect.top + window.pageYOffset;
      const targetPosition = Math.max(0, elementPosition - totalOffset);
      
      console.log('📍 Policies - Enhanced scroll calculation:', {
        sectionId,
        elementPosition,
        totalOffset,
        targetPosition,
        currentScroll: window.pageYOffset,
        viewportHeight: window.innerHeight
      });
      
      // Perform scroll with enhanced monitoring
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
      
      // Multi-level verification system
      const verifyScrollPosition = (attempt = 1, maxAttempts = 3) => {
        setTimeout(() => {
          const currentScroll = window.pageYOffset;
          const scrollDifference = Math.abs(currentScroll - targetPosition);
          const tolerance = 75; // Increased tolerance for better reliability
          
          console.log(`🔍 Policies - Scroll verification attempt ${attempt}:`, {
            currentScroll,
            targetPosition,
            difference: scrollDifference,
            tolerance
          });
          
          if (scrollDifference > tolerance && attempt < maxAttempts) {
            console.log(`🔄 Policies - Adjusting scroll position (attempt ${attempt})...`);
            
            // More aggressive scroll correction
            window.scrollTo({
              top: targetPosition,
              behavior: attempt === maxAttempts - 1 ? 'auto' : 'smooth'
            });
            
            verifyScrollPosition(attempt + 1, maxAttempts);
          } else {
            console.log(`✅ Policies - Scroll completed for section: ${sectionId}`);
            
            // Visual feedback for successful navigation
            setTimeout(() => {
              element.classList.add('section-highlight');
              setTimeout(() => {
                element.classList.remove('section-highlight');
              }, 1000);
            }, 200);
          }
        }, 800);
      };
      
      verifyScrollPosition();
    };
    
    // Execute with proper timing
    if (fromButton) {
      performEnhancedScroll();
    } else {
      // Small delay for non-button navigation to ensure DOM is ready
      setTimeout(performEnhancedScroll, 100);
    }
  };

  // Enhanced scroll position detection
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const clientNavbar = document.querySelector('.client-navbar');
      const navbarHeight = clientNavbar ? clientNavbar.getBoundingClientRect().height : 64;
      const stickyNavHeight = 56;
      const totalOffset = navbarHeight + stickyNavHeight + 50;
      
      const sections = navigationSections.map(section => {
        const element = document.getElementById(section.id);
        if (!element) return { id: section.id, visibility: 0, distance: Infinity };
        
        const rect = element.getBoundingClientRect();
        const elementTop = rect.top;
        const elementBottom = rect.bottom;
        const elementHeight = rect.height;
        
        let visibilityScore = 0;
        
        if (elementTop <= totalOffset && elementBottom >= totalOffset) {
          if (elementHeight > 0) {
            const visibleHeight = Math.min(elementBottom, window.innerHeight) - Math.max(elementTop, totalOffset);
            visibilityScore = Math.max(0, visibleHeight / elementHeight);
          }
        }
        
        const idealViewingPosition = totalOffset + 100;
        const elementCenter = elementTop + (elementHeight / 2);
        const distance = Math.abs(elementCenter - idealViewingPosition);
        
        return {
          id: section.id,
          visibility: visibilityScore,
          distance: distance
        };
      });
      
      const bestSection = sections.reduce((best, current) => {
        if (current.visibility > best.visibility) return current;
        if (current.visibility < best.visibility) return best;
        if (current.distance < best.distance) return current;
        return best;
      });
      
      if (bestSection.visibility > 0.1 && activeSection !== bestSection.id) {
        setActiveSection(bestSection.id);
      }
    };

    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
    };
  }, [activeSection, navigationSections]);

  // Filter documents based on search and filters
  const filteredDocuments = SAMPLE_POLICIES_DATA.filter(doc => {
    const matchesSearch = searchTerm === '' || 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.entity.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'all' || doc.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Get documents by type for sections
  const getDocumentsByType = (type: string) => {
    return filteredDocuments.filter(doc => doc.type === type);
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDocuments = filteredDocuments.slice(startIndex, endIndex);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter, statusFilter, itemsPerPage]);

  const handleDownload = (doc: PolicyDocument) => {
    toast.success(`Downloading ${doc.title}...`);
    console.log('Downloading document:', doc.id);
  };

  const handlePreview = (doc: PolicyDocument) => {
    toast.info(`Opening preview for ${doc.title}...`);
    console.log('Previewing document:', doc.id);
  };

  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (startPage > 1) {
      items.push(
        <PaginationItem key="first">
          <PaginationLink onClick={() => setCurrentPage(1)}>1</PaginationLink>
        </PaginationItem>
      );
      if (startPage > 2) {
        items.push(<PaginationEllipsis key="start-ellipsis" />);
      }
    }

    for (let page = startPage; page <= endPage; page++) {
      items.push(
        <PaginationItem key={page}>
          <PaginationLink 
            onClick={() => setCurrentPage(page)}
            isActive={currentPage === page}
          >
            {page}
          </PaginationLink>
        </PaginationItem>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(<PaginationEllipsis key="end-ellipsis" />);
      }
      items.push(
        <PaginationItem key="last">
          <PaginationLink onClick={() => setCurrentPage(totalPages)}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  const renderDocumentCard = (doc: PolicyDocument) => (
    <Card key={doc.id} className="border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md transition-shadow client-card-hover">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2 line-clamp-2 dark:text-white">
              {doc.title}
            </CardTitle>
            <div className="flex items-center gap-2 mb-2">
              <Badge 
                variant={doc.type === 'MOA' ? 'default' : doc.type === 'MOU' ? 'secondary' : 'outline'}
                className="text-xs"
              >
                {doc.type}
              </Badge>
              <Badge 
                variant={doc.status === 'Active' ? 'default' : doc.status === 'Under Review' ? 'secondary' : 'outline'}
                className="text-xs"
              >
                {doc.status}
              </Badge>
              <Badge 
                variant={doc.priority === 'High' ? 'destructive' : doc.priority === 'Medium' ? 'secondary' : 'outline'}
                className="text-xs"
              >
                {doc.priority}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-slate-600 text-sm mb-4 line-clamp-3">
          {doc.description}
        </p>
        
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Building2 className="h-4 w-4" />
            <span className="truncate">{doc.entity}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Calendar className="h-4 w-4" />
            <span>Updated: {new Date(doc.lastUpdated).toLocaleDateString()}</span>
          </div>
          
          {doc.expiryDate && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Clock className="h-4 w-4" />
              <span>Expires: {new Date(doc.expiryDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>
        
        <div className="flex gap-2 mt-4">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => handlePreview(doc)}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button 
            size="sm" 
            onClick={() => handleDownload(doc)}
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const DocumentSection = ({ documents, title }: { documents: PolicyDocument[], title: string }) => (
    <div className="space-y-6">
      {documents.length === 0 ? (
        <Card className="border-slate-200 dark:border-gray-700 dark:bg-gray-800">
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-slate-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="font-medium text-slate-900 dark:text-white mb-2">No documents found</h3>
            <p className="text-slate-500 dark:text-gray-400">Try adjusting your search criteria or filters.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map(renderDocumentCard)}
            </div>
          ) : (
            <Card className="border-slate-200">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium line-clamp-1">{doc.title}</div>
                            <div className="text-sm text-slate-500 line-clamp-2">{doc.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{doc.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={doc.status === 'Active' ? 'default' : 'secondary'}
                          >
                            {doc.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{doc.entity}</TableCell>
                        <TableCell>{new Date(doc.lastUpdated).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handlePreview(doc)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              onClick={() => handleDownload(doc)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination-container">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="pagination-info text-sm text-slate-600">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredDocuments.length)} of {filteredDocuments.length} results
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="pagination-per-page flex items-center gap-2">
                    <span className="text-sm text-slate-600">Items per page:</span>
                    <Select 
                      value={itemsPerPage.toString()} 
                      onValueChange={(value) => setItemsPerPage(parseInt(value))}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6">6</SelectItem>
                        <SelectItem value="12">12</SelectItem>
                        <SelectItem value="24">24</SelectItem>
                        <SelectItem value="48">48</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Pagination className="pagination-controls">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>
                      
                      {renderPaginationItems()}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  // Policies overview data
  const policiesOverviewData = {
    totalDocuments: filteredDocuments.length,
    activePolicies: getDocumentsByType('MOA').concat(getDocumentsByType('MOU')).filter(doc => doc.status === 'Active').length,
    recentUpdates: POLICIES_STATISTICS.recentUpdates,
    totalCategories: POLICIES_STATISTICS.categoriesCount
  };

  return (
    <div className="min-h-screen bg-background client-page">
      <ClientNavbar 
        onNavigate={onNavigate} 
        onSignIn={onSignIn}
        onSignOut={onSignOut}
        onNavigateToDashboard={onNavigateToDashboard}
        onAuthModalSignIn={onAuthModalSignIn}
        userProfile={userProfile}
        demoMode={demoMode}
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-blue-700 bg-clip-text text-transparent dark:from-emerald-400 dark:via-blue-400 dark:to-blue-500 mb-4">
              Policies & Agreements
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 dark:text-gray-300 mb-6">
              Governance Documents & Partnerships
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed">
              Access and download official memoranda of agreement (MOA), memoranda of understanding (MOU), university policies, and partnership agreements that establish frameworks for collaboration and governance.
            </p>
          </div>

          {/* Performance Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                label: 'Total Documents', 
                value: POLICIES_STATISTICS.totalDocuments, 
                icon: Target,
                description: 'Available documents',
                trend: `${POLICIES_STATISTICS.activeDocuments} active`
              },
              { 
                label: 'MOA Documents', 
                value: POLICIES_STATISTICS.moaCount, 
                icon: FileSignature,
                description: 'Memorandum of Agreement',
                trend: 'Partnership agreements'
              },
              { 
                label: 'MOU Documents', 
                value: POLICIES_STATISTICS.mouCount, 
                icon: FileText,
                description: 'Memorandum of Understanding',
                trend: 'Collaboration frameworks'
              },
              { 
                label: 'Recent Updates', 
                value: POLICIES_STATISTICS.recentUpdates, 
                icon: Activity,
                description: 'Last 30 days',
                trend: 'Latest changes'
              }
            ].map((item, index) => (
              <Card key={index} className="border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{item.value}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{item.trend}</div>
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white mb-1">{item.label}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{item.description}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Summary Impact Section */}
          <div className="mt-12">
            <Card className="border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 dark:text-white">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  Policies & Agreements Impact Summary
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                  Comprehensive overview of governance documents and partnership frameworks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Active Partnerships</div>
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">MOA Agreements</div>
                        <div className="text-lg font-bold text-emerald-600">{POLICIES_STATISTICS.moaCount}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Success Rate</div>
                        <div className="text-lg font-bold text-emerald-600">94.2%</div>
                      </div>
                      <div className="flex items-center justify-center gap-1">
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-medium text-emerald-600">Active</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-600 mb-2">Collaboration Framework</div>
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">MOU Documents</div>
                        <div className="text-lg font-bold text-blue-600">{POLICIES_STATISTICS.mouCount}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Implementation Rate</div>
                        <div className="text-lg font-bold text-blue-600">87.5%</div>
                      </div>
                      <div className="flex items-center justify-center gap-1">
                        <Activity className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-600">Effective</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-600 mb-2">Governance Excellence</div>
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Policy Documents</div>
                        <div className="text-lg font-bold text-amber-600">{POLICIES_STATISTICS.policyCount}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Compliance Rate</div>
                        <div className="text-lg font-bold text-amber-600">96.3%</div>
                      </div>
                      <div className="flex items-center justify-center gap-1">
                        <Zap className="w-4 h-4 text-amber-600" />
                        <span className="text-sm font-medium text-amber-600">Excellent</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-600 mb-2">Overall Management</div>
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Total Documents</div>
                        <div className="text-lg font-bold text-purple-600">{POLICIES_STATISTICS.totalDocuments}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Update Frequency</div>
                        <div className="text-lg font-bold text-purple-600">Monthly</div>
                      </div>
                      <div className="flex items-center justify-center gap-1">
                        <CheckCircle className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-600">Up-to-date</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Navigation Menu */}
      <section 
        className="py-6 px-4 bg-white border-b border-gray-200 sticky top-16 z-30" 
        data-sticky-nav="policies"
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-3 justify-center">
            {navigationSections.map((item) => (
              <Button
                key={item.id}
                variant={activeSection === item.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  console.log('🖱️ Policies - Enhanced navigation button clicked:', item.id);
                  
                  // Immediate visual feedback for responsiveness
                  setActiveSection(item.id);
                  
                  // Enhanced scroll execution
                  const executeButtonScroll = () => {
                    scrollToSection(item.id, true);
                  };
                  
                  // Execute with proper timing
                  requestAnimationFrame(() => {
                    setTimeout(executeButtonScroll, 16);
                  });
                }}
                className={`transition-all duration-200 ${
                  activeSection === item.id
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                    : 'border-gray-200 hover:bg-emerald-50 hover:border-emerald-200 text-gray-700'
                }`}
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section id="overview" className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Overview</h2>
            <p className="text-lg text-gray-600">
              Comprehensive collection of governance documents, partnership agreements, and policy frameworks
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  Our Mission
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  To maintain transparent governance through well-documented policies and foster meaningful partnerships 
                  that advance educational excellence and community development through strategic collaborations.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  Partnership Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  Our strategic partnerships with government agencies, private institutions, and international organizations 
                  create valuable opportunities for research collaboration, student exchange, and community engagement.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter Section */}
          <div className="mt-12">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-emerald-600" />
                  Search & Filter Documents
                </CardTitle>
                <CardDescription>
                  Find specific policies, agreements, or memoranda using the search and filter options below.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search documents..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Document type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="MOA">MOA</SelectItem>
                      <SelectItem value="MOU">MOU</SelectItem>
                      <SelectItem value="Policy">Policy</SelectItem>
                      <SelectItem value="Agreement">Agreement</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Under Review">Under Review</SelectItem>
                      <SelectItem value="Approved">Approved</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={viewMode} onValueChange={(value: 'cards' | 'table') => setViewMode(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="View mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cards">Card View</SelectItem>
                      <SelectItem value="table">Table View</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm text-gray-600">
                    {filteredDocuments.length} documents found
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* MOA Documents Section */}
      <section id="memorandum-agreements" className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Memorandum of Agreement (MOA)</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Official agreements establishing partnerships, collaborations, and formal relationships with external entities.
            </p>
            {getDocumentsByType('MOA').length > 0 && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm mt-4">
                <FileSignature className="h-4 w-4" />
                {getDocumentsByType('MOA').length} documents available
              </div>
            )}
          </div>
          <DocumentSection documents={getDocumentsByType('MOA')} title="MOA Documents" />
        </div>
      </section>

      {/* MOU Documents Section */}
      <section id="memorandum-understanding" className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Memorandum of Understanding (MOU)</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Understanding documents that outline intentions, frameworks, and cooperative arrangements between parties.
            </p>
            {getDocumentsByType('MOU').length > 0 && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm mt-4">
                <FileText className="h-4 w-4" />
                {getDocumentsByType('MOU').length} documents available
              </div>
            )}
          </div>
          <DocumentSection documents={getDocumentsByType('MOU')} title="MOU Documents" />
        </div>
      </section>

      {/* University Policies Section */}
      <section id="policies" className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">University Policies</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Comprehensive policies governing academic standards, research conduct, and institutional operations.
            </p>
            {getDocumentsByType('Policy').length > 0 && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm mt-4">
                <Shield className="h-4 w-4" />
                {getDocumentsByType('Policy').length} policies available
              </div>
            )}
          </div>
          <DocumentSection documents={getDocumentsByType('Policy')} title="University Policies" />
        </div>
      </section>

      {/* Other Agreements Section */}
      <section id="agreements" className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Other Agreements</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Various partnership agreements and collaborative frameworks supporting university operations and community engagement.
            </p>
            {getDocumentsByType('Agreement').length > 0 && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm mt-4">
                <Globe className="h-4 w-4" />
                {getDocumentsByType('Agreement').length} agreements available
              </div>
            )}
          </div>
          <DocumentSection documents={getDocumentsByType('Agreement')} title="Other Agreements" />
        </div>
      </section>
    </div>
  );
}

export default ClientPoliciesPage;