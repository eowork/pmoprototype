import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { CheckCircle, TrendingUp, Target, Plus, Edit, Trash2, Shield, AlertCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { universityOperationsRBACService } from '../services/RBACService';

interface InsightItem {
  id: string;
  content: string;
  year: string;
  type: 'achievement' | 'improvement' | 'recommendation';
  status: 'published' | 'pending';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface InsightsManagerProps {
  userRole: string;
  userEmail?: string;
  selectedYear: string;
  insights: {
    achievements: string[];
    improvements: string[];
    recommendations: string[];
  };
  onInsightsUpdate?: (insights: any) => void;
}

export function InsightsManager({
  userRole,
  userEmail = 'user@carsu.edu.ph',
  selectedYear,
  insights,
  onInsightsUpdate
}: InsightsManagerProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<InsightItem | null>(null);
  const [formData, setFormData] = useState({
    content: '',
    type: 'achievement' as 'achievement' | 'improvement' | 'recommendation',
    year: selectedYear,
    status: 'pending' as 'published' | 'pending'
  });

  // RBAC permissions
  const category = 'university-operations';
  const userPermissions = universityOperationsRBACService.getUserPermissions(userEmail, userRole, category);
  const canPerformCRUD = universityOperationsRBACService.canPerformCRUD(userEmail, userRole, category);
  const canEdit = canPerformCRUD && userPermissions.canEdit;
  const canAdd = canPerformCRUD && userPermissions.canAdd;
  const canDelete = canPerformCRUD && userPermissions.canDelete;
  const canApprove = userRole === 'Admin';

  // Convert insights array to InsightItem format
  const convertToInsightItems = (): InsightItem[] => {
    const items: InsightItem[] = [];
    
    insights.achievements.forEach((content, index) => {
      items.push({
        id: `achievement-${selectedYear}-${index}`,
        content,
        year: selectedYear,
        type: 'achievement',
        status: 'published',
        createdBy: 'admin@carsu.edu.ph',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    });

    insights.improvements.forEach((content, index) => {
      items.push({
        id: `improvement-${selectedYear}-${index}`,
        content,
        year: selectedYear,
        type: 'improvement',
        status: 'published',
        createdBy: 'admin@carsu.edu.ph',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    });

    insights.recommendations.forEach((content, index) => {
      items.push({
        id: `recommendation-${selectedYear}-${index}`,
        content,
        year: selectedYear,
        type: 'recommendation',
        status: 'published',
        createdBy: 'admin@carsu.edu.ph',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    });

    return items;
  };

  const [insightItems, setInsightItems] = useState<InsightItem[]>(convertToInsightItems());

  const handleAdd = () => {
    if (!canAdd) {
      toast.error('You do not have permission to add insights');
      return;
    }

    if (!formData.content.trim()) {
      toast.error('Please enter insight content');
      return;
    }

    const newInsight: InsightItem = {
      id: `${formData.type}-${formData.year}-${Date.now()}`,
      content: formData.content,
      year: formData.year,
      type: formData.type,
      status: userRole === 'Admin' ? 'published' : 'pending',
      createdBy: userEmail,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setInsightItems([...insightItems, newInsight]);
    setIsAddDialogOpen(false);
    setFormData({
      content: '',
      type: 'achievement',
      year: selectedYear,
      status: 'pending'
    });

    if (userRole === 'Admin') {
      toast.success('Insight added and published successfully');
    } else {
      toast.success('Insight submitted for admin approval');
    }
  };

  const handleEdit = () => {
    if (!canEdit || !selectedInsight) {
      toast.error('You do not have permission to edit insights');
      return;
    }

    if (!formData.content.trim()) {
      toast.error('Please enter insight content');
      return;
    }

    const updatedItems = insightItems.map(item =>
      item.id === selectedInsight.id
        ? {
            ...item,
            content: formData.content,
            type: formData.type,
            year: formData.year,
            status: userRole === 'Admin' ? 'published' : 'pending',
            updatedAt: new Date().toISOString()
          }
        : item
    );

    setInsightItems(updatedItems);
    setIsEditDialogOpen(false);
    setSelectedInsight(null);

    if (userRole === 'Admin') {
      toast.success('Insight updated and published successfully');
    } else {
      toast.success('Insight changes submitted for admin approval');
    }
  };

  const handleDelete = () => {
    if (!canDelete || !selectedInsight) {
      toast.error('You do not have permission to delete insights');
      return;
    }

    const updatedItems = insightItems.filter(item => item.id !== selectedInsight.id);
    setInsightItems(updatedItems);
    setIsDeleteDialogOpen(false);
    setSelectedInsight(null);
    toast.success('Insight deleted successfully');
  };

  const handleApprove = (insightId: string) => {
    if (!canApprove) {
      toast.error('Only admins can approve insights');
      return;
    }

    const updatedItems = insightItems.map(item =>
      item.id === insightId
        ? { ...item, status: 'published' as const, updatedAt: new Date().toISOString() }
        : item
    );

    setInsightItems(updatedItems);
    toast.success('Insight approved and published');
  };

  const openEditDialog = (insight: InsightItem) => {
    setSelectedInsight(insight);
    setFormData({
      content: insight.content,
      type: insight.type,
      year: insight.year,
      status: insight.status
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (insight: InsightItem) => {
    setSelectedInsight(insight);
    setIsDeleteDialogOpen(true);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'improvement':
        return <TrendingUp className="w-4 h-4 text-amber-600" />;
      case 'recommendation':
        return <Target className="w-4 h-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'achievement':
        return 'bg-green-50 border-green-200';
      case 'improvement':
        return 'bg-amber-50 border-amber-200';
      case 'recommendation':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const filteredItems = insightItems.filter(item => 
    item.year === selectedYear && (userRole === 'Admin' || item.status === 'published')
  );

  const pendingItems = insightItems.filter(item => 
    item.year === selectedYear && item.status === 'pending'
  );

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      {canAdd && (
        <div className="flex justify-end">
          <Button onClick={() => setIsAddDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Insight
          </Button>
        </div>
      )}

      {/* Pending Approval Section - Admin Only */}
      {canApprove && pendingItems.length > 0 && (
        <Card className="admin-card border-0 bg-amber-50/50">
          <CardHeader className="border-b border-amber-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Shield className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <CardTitle className="text-gray-900 text-lg">Pending Approval</CardTitle>
                <CardDescription className="text-sm mt-1">
                  {pendingItems.length} insight{pendingItems.length !== 1 ? 's' : ''} awaiting admin review
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            {pendingItems.map((item) => (
              <div
                key={item.id}
                className={`flex items-start justify-between gap-3 p-4 rounded-lg border ${getTypeColor(item.type)}`}
              >
                <div className="flex items-start gap-3 flex-1">
                  {getTypeIcon(item.type)}
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 mb-2">{item.content}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Badge variant="outline" className="bg-white">
                        {item.type}
                      </Badge>
                      <span>Submitted by: {item.createdBy}</span>
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleApprove(item.id)}
                  className="bg-green-600 hover:bg-green-700 h-8"
                >
                  Approve
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Achievements */}
      <Card className="admin-card border-0">
        <CardHeader className="border-b border-gray-200 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-gray-900 text-lg">Key Achievements - {selectedYear}</CardTitle>
                <CardDescription className="text-sm mt-1">
                  Major accomplishments and performance highlights for {selectedYear}
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-3">
          {filteredItems.filter(item => item.type === 'achievement').length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-sm">No achievements recorded for {selectedYear}</p>
            </div>
          ) : (
            filteredItems
              .filter(item => item.type === 'achievement')
              .map((item) => (
                <div
                  key={item.id}
                  className={`flex items-start justify-between gap-3 p-4 rounded-lg border ${getTypeColor(item.type)}`}
                >
                  <div className="flex items-start gap-3 flex-1">
                    {getTypeIcon(item.type)}
                    <p className="text-sm text-gray-700">{item.content}</p>
                  </div>
                  {(canEdit || canDelete) && (
                    <div className="flex gap-2">
                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(item)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(item)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))
          )}
        </CardContent>
      </Card>

      {/* Areas for Improvement */}
      <Card className="admin-card border-0">
        <CardHeader className="border-b border-gray-200 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <CardTitle className="text-gray-900 text-lg">Areas for Improvement - {selectedYear}</CardTitle>
                <CardDescription className="text-sm mt-1">
                  Focus areas and enhancement opportunities identified for {selectedYear}
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-3">
          {filteredItems.filter(item => item.type === 'improvement').length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-sm">No improvement areas recorded for {selectedYear}</p>
            </div>
          ) : (
            filteredItems
              .filter(item => item.type === 'improvement')
              .map((item) => (
                <div
                  key={item.id}
                  className={`flex items-start justify-between gap-3 p-4 rounded-lg border ${getTypeColor(item.type)}`}
                >
                  <div className="flex items-start gap-3 flex-1">
                    {getTypeIcon(item.type)}
                    <p className="text-sm text-gray-700">{item.content}</p>
                  </div>
                  {(canEdit || canDelete) && (
                    <div className="flex gap-2">
                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(item)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(item)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))
          )}
        </CardContent>
      </Card>

      {/* Strategic Recommendations */}
      <Card className="admin-card border-0">
        <CardHeader className="border-b border-gray-200 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-gray-900 text-lg">Strategic Recommendations - {selectedYear}</CardTitle>
                <CardDescription className="text-sm mt-1">
                  Long-term strategic initiatives and recommendations based on {selectedYear} performance
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {filteredItems.filter(item => item.type === 'recommendation').length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-sm">No recommendations recorded for {selectedYear}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems
                .filter(item => item.type === 'recommendation')
                .map((item) => (
                  <div
                    key={item.id}
                    className={`flex flex-col gap-3 p-4 rounded-lg border ${getTypeColor(item.type)}`}
                  >
                    <div className="flex items-start gap-3 flex-1">
                      {getTypeIcon(item.type)}
                      <p className="text-sm text-gray-700">{item.content}</p>
                    </div>
                    {(canEdit || canDelete) && (
                      <div className="flex gap-2 justify-end pt-2 border-t border-blue-100">
                        {canEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(item)}
                            className="h-8"
                          >
                            <Edit className="w-4 h-4 mr-1.5" />
                            <span className="text-xs">Edit</span>
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(item)}
                            className="h-8 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4 mr-1.5" />
                            <span className="text-xs">Delete</span>
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Add New Insight</DialogTitle>
            <DialogDescription>
              Create a new insight for the selected year. {userRole !== 'Admin' && 'Insights require admin approval before publication.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="type">Insight Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: any) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="achievement">Key Achievement</SelectItem>
                  <SelectItem value="improvement">Area for Improvement</SelectItem>
                  <SelectItem value="recommendation">Strategic Recommendation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Select
                value={formData.year}
                onValueChange={(value) => setFormData({ ...formData, year: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2022">2022</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Insight Content</Label>
              <Textarea
                id="content"
                placeholder="Enter insight content..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={5}
                className="resize-none"
              />
              <p className="text-sm text-gray-500">{formData.content.length} characters</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700">
              {userRole === 'Admin' ? 'Add & Publish' : 'Submit for Approval'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Edit Insight</DialogTitle>
            <DialogDescription>
              Modify the insight content. {userRole !== 'Admin' && 'Changes require admin approval before publication.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-type">Insight Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: any) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="achievement">Key Achievement</SelectItem>
                  <SelectItem value="improvement">Area for Improvement</SelectItem>
                  <SelectItem value="recommendation">Strategic Recommendation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-year">Year</Label>
              <Select
                value={formData.year}
                onValueChange={(value) => setFormData({ ...formData, year: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2022">2022</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-content">Insight Content</Label>
              <Textarea
                id="edit-content"
                placeholder="Enter insight content..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={5}
                className="resize-none"
              />
              <p className="text-sm text-gray-500">{formData.content.length} characters</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} className="bg-blue-600 hover:bg-blue-700">
              {userRole === 'Admin' ? 'Update & Publish' : 'Submit Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this insight? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedInsight && (
            <div className="py-4">
              <div className={`p-4 rounded-lg border ${getTypeColor(selectedInsight.type)}`}>
                <div className="flex items-start gap-3">
                  {getTypeIcon(selectedInsight.type)}
                  <p className="text-sm text-gray-700">{selectedInsight.content}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleDelete} variant="destructive">
              Delete Insight
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* RBAC Info Card */}
      {userRole !== 'Admin' && (
        <Card className="admin-card border-0 bg-blue-50/50">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-blue-100 rounded-lg">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-base text-gray-900 mb-2">Access Control Information</h4>
                <p className="text-sm text-gray-600 leading-relaxed mb-3">
                  Only assigned personnel can add, edit, or delete insights. 
                  Staff submissions require admin approval before being published.
                </p>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>• <strong>Staff/Editor:</strong> Can submit insights as "Pending" status</p>
                  <p>• <strong>Admin:</strong> Can approve and publish all submissions</p>
                  <p>• <strong>Client:</strong> Can view approved insights only</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
