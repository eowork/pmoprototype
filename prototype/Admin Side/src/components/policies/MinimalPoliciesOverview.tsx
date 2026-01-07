/**
 * Formal Policies Overview Page - Redesigned with Functional Stats
 * Professional, clean, and highly intuitive design
 * Strictly formal UI following CSU and industry standards
 * Now with real-time statistics from policy data
 */
import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { 
  FileText, FileSignature, ArrowRight, CheckCircle2, 
  Clock, FileCheck, Info, Building2, Shield, TrendingUp
} from 'lucide-react';
import { calculatePolicyStats } from './data/policiesData';

interface MinimalPoliciesOverviewProps {
  userRole: string;
  requireAuth: (action: string) => boolean;
  onNavigate: (page: string) => void;
}

export function MinimalPoliciesOverview({ 
  userRole, 
  requireAuth, 
  onNavigate 
}: MinimalPoliciesOverviewProps) {

  // Calculate real stats from policy data
  const stats = useMemo(() => calculatePolicyStats(), []);

  const handleNavigateToMOA = () => {
    onNavigate('memorandum-of-agreements');
  };
  
  const handleNavigateToMOU = () => {
    onNavigate('memorandum-of-understanding');
  };

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-gray-50 to-white">
      {/* Executive Header - Formal and Professional */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="flex items-start gap-6">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-green-700 flex items-center justify-center shadow-lg flex-shrink-0">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-gray-900">Institutional Policies Management</h1>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 px-3 py-1">
                  Caraga State University
                </Badge>
              </div>
              <p className="text-gray-600 max-w-3xl leading-relaxed">
                Comprehensive management and monitoring system for Memorandums of Agreement (MOA) and Memorandums of Understanding (MOU). 
                This system ensures transparency, accountability, and effective partnership management across all institutional collaborations.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-10">
        {/* Executive Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="border-2 border-gray-200 bg-white hover:shadow-lg transition-all group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                </div>
                <Badge variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50">
                  Active
                </Badge>
              </div>
              <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">Currently Effective</p>
              <div className="flex items-baseline gap-2">
                <p className="text-gray-900">{stats.moa.active + stats.mou.active}</p>
                <span className="text-sm text-gray-500">active documents</span>
              </div>
              <div className="mt-3 flex items-center gap-1 text-emerald-600">
                <TrendingUp className="h-3.5 w-3.5" />
                <span className="text-xs">Compliant</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200 bg-white hover:shadow-lg transition-all group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Clock className="h-7 w-7 text-amber-600" />
                </div>
                <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50">
                  Alert
                </Badge>
              </div>
              <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">Expiring Soon</p>
              <div className="flex items-baseline gap-2">
                <p className="text-gray-900">{stats.moa.expiring + stats.mou.expiring}</p>
                <span className="text-sm text-gray-500">requires renewal</span>
              </div>
              <div className="mt-3 flex items-center gap-1 text-amber-600">
                <Clock className="h-3.5 w-3.5" />
                <span className="text-xs">Action Required</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200 bg-white hover:shadow-lg transition-all group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileCheck className="h-7 w-7 text-blue-600" />
                </div>
                <Badge variant="outline" className="text-blue-700 border-blue-200 bg-blue-50">
                  Review
                </Badge>
              </div>
              <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">Pending Approval</p>
              <div className="flex items-baseline gap-2">
                <p className="text-gray-900">{stats.moa.draft + stats.moa.underReview + stats.mou.draft + stats.mou.underReview}</p>
                <span className="text-sm text-gray-500">awaiting approval</span>
              </div>
              <div className="mt-3 flex items-center gap-1 text-blue-600">
                <FileCheck className="h-3.5 w-3.5" />
                <span className="text-xs">In Queue</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200 bg-white hover:shadow-lg transition-all group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="h-7 w-7 text-purple-600" />
                </div>
                <Badge variant="outline" className="text-purple-700 border-purple-200 bg-purple-50">
                  Total
                </Badge>
              </div>
              <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">All Documents</p>
              <div className="flex items-baseline gap-2">
                <p className="text-gray-900">{stats.moa.total + stats.mou.total}</p>
                <span className="text-sm text-gray-500">institutional records</span>
              </div>
              <div className="mt-3 flex items-center gap-1 text-purple-600">
                <Building2 className="h-3.5 w-3.5" />
                <span className="text-xs">Complete Archive</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Document Categories Section - Professional Layout */}
        <div className="mb-12">
          <div className="text-center mb-10">
            <h2 className="text-gray-900 mb-3">Document Management Categories</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Select a document category to view, manage, and monitor institutional partnerships and collaborative agreements
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* MOA Card - Professional Blue Theme */}
            <Card className="border-2 border-blue-200/60 bg-white hover:border-blue-400 hover:shadow-2xl transition-all duration-300 group overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-transparent opacity-50 rounded-full -mr-32 -mt-32" />
              <CardHeader className="border-b border-blue-100 bg-gradient-to-br from-blue-50/80 via-white to-white pb-8 relative">
                <div className="flex items-start gap-5">
                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-xl flex-shrink-0 group-hover:scale-105 transition-transform">
                    <FileText className="h-10 w-10 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <CardTitle className="text-gray-900 text-xl">Memorandum of Agreements</CardTitle>
                    </div>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1 mb-3">
                      MOA · Formal Binding Agreements
                    </Badge>
                    <CardDescription className="text-gray-600 leading-relaxed">
                      Legally binding documents establishing specific obligations, financial commitments, and measurable deliverables 
                      between Caraga State University and partner organizations.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-8 pb-8 relative">
                {/* Statistics Grid */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                  <div className="text-center p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 shadow-sm">
                    <p className="text-gray-900 mb-1">{stats.moa.total}</p>
                    <p className="text-xs text-gray-600">Total</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-200 shadow-sm">
                    <p className="text-emerald-900 mb-1">{stats.moa.active}</p>
                    <p className="text-xs text-emerald-700">Active</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-gradient-to-br from-amber-50 to-white border border-amber-200 shadow-sm">
                    <p className="text-amber-900 mb-1">{stats.moa.expiring}</p>
                    <p className="text-xs text-amber-700">Expiring</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-white border border-blue-200 shadow-sm">
                    <p className="text-blue-900 mb-1">{stats.moa.pending}</p>
                    <p className="text-xs text-blue-700">Pending</p>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50/50 border border-blue-100">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">Formal legal obligations and financial agreements</p>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50/50 border border-blue-100">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">Specific deliverables and performance metrics</p>
                  </div>
                </div>

                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 shadow-lg group-hover:shadow-xl transition-all"
                  onClick={handleNavigateToMOA}
                >
                  <span>Access MOA Management</span>
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>

            {/* MOU Card - Professional Green Theme */}
            <Card className="border-2 border-green-200/60 bg-white hover:border-green-400 hover:shadow-2xl transition-all duration-300 group overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-50 to-transparent opacity-50 rounded-full -mr-32 -mt-32" />
              <CardHeader className="border-b border-green-100 bg-gradient-to-br from-green-50/80 via-white to-white pb-8 relative">
                <div className="flex items-start gap-5">
                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center shadow-xl flex-shrink-0 group-hover:scale-105 transition-transform">
                    <FileSignature className="h-10 w-10 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <CardTitle className="text-gray-900 text-xl">Memorandum of Understanding</CardTitle>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-3 py-1 mb-3">
                      MOU · Collaborative Frameworks
                    </Badge>
                    <CardDescription className="text-gray-600 leading-relaxed">
                      Non-binding collaborative documents outlining general intentions, cooperative frameworks, and mutual understanding 
                      for institutional partnerships and knowledge exchange.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-8 pb-8 relative">
                {/* Statistics Grid */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                  <div className="text-center p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 shadow-sm">
                    <p className="text-gray-900 mb-1">{stats.mou.total}</p>
                    <p className="text-xs text-gray-600">Total</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-200 shadow-sm">
                    <p className="text-emerald-900 mb-1">{stats.mou.active}</p>
                    <p className="text-xs text-emerald-700">Active</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-gradient-to-br from-amber-50 to-white border border-amber-200 shadow-sm">
                    <p className="text-amber-900 mb-1">{stats.mou.expiring}</p>
                    <p className="text-xs text-amber-700">Expiring</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-gradient-to-br from-green-50 to-white border border-green-200 shadow-sm">
                    <p className="text-green-900 mb-1">{stats.mou.pending}</p>
                    <p className="text-xs text-green-700">Pending</p>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50/50 border border-green-100">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">Cooperative frameworks and mutual intentions</p>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50/50 border border-green-100">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">Knowledge sharing and institutional collaboration</p>
                  </div>
                </div>

                <Button 
                  className="w-full bg-green-600 hover:bg-green-700 text-white h-12 shadow-lg group-hover:shadow-xl transition-all"
                  onClick={handleNavigateToMOU}
                >
                  <span>Access MOU Management</span>
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Professional Guidelines Panel */}
        <Card className="border-2 border-gray-200 bg-white shadow-lg">
          <CardContent className="p-10">
            <div className="flex items-start gap-6">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center flex-shrink-0">
                <Info className="h-7 w-7 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-gray-900 mb-6">Document Management Protocols & Guidelines</h3>
                
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-white border border-blue-100">
                      <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900 text-sm mb-2">Memorandum of Agreement (MOA)</p>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          Legally binding agreements establishing specific obligations, financial commitments, and measurable 
                          deliverables between CSU and partner organizations requiring formal execution and compliance monitoring.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-green-50 to-white border border-green-100">
                      <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <FileSignature className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900 text-sm mb-2">Memorandum of Understanding (MOU)</p>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          Non-binding collaborative documents outlining general intentions, cooperative frameworks, and mutual 
                          understanding between institutions for knowledge sharing and partnership development.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="my-8" />

                <div className="bg-gradient-to-br from-emerald-50 to-white border-2 border-emerald-200 rounded-xl p-6">
                  <h4 className="text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-emerald-600" />
                    Institutional Requirements & Best Practices
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">All documents require administrative verification before publication</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">Means of Verification (MOV) files must be uploaded for each document</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">Staff-created documents default to draft status requiring approval</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">Expiration monitoring and timely renewal processes are mandatory</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
