import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

export interface EditHistory {
  id: string;
  field: string;
  oldValue: any;
  newValue: any;
  changedBy: string;
  changedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: Date;
}

interface EditApprovalDialogProps {
  open: boolean;
  onClose: () => void;
  editHistory: EditHistory[];
  onApprove: () => void;
  onReject: () => void;
  isAdmin: boolean;
}

export function EditApprovalDialog({
  open,
  onClose,
  editHistory,
  onApprove,
  onReject,
  isAdmin
}: EditApprovalDialogProps) {
  const pendingChanges = editHistory.filter(h => h.status === 'pending');

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { className: string; icon: React.ReactNode }> = {
      'pending': {
        className: 'bg-amber-100 text-amber-700 border-amber-300',
        icon: <AlertCircle className="h-3 w-3" />
      },
      'approved': {
        className: 'bg-emerald-100 text-emerald-700 border-emerald-300',
        icon: <CheckCircle className="h-3 w-3" />
      },
      'rejected': {
        className: 'bg-red-100 text-red-700 border-red-300',
        icon: <XCircle className="h-3 w-3" />
      }
    };
    const variant = variants[status] || variants['pending'];
    return (
      <Badge className={`${variant.className} flex items-center gap-1`}>
        {variant.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            Review Changes
          </DialogTitle>
          <DialogDescription>
            {pendingChanges.length > 0 
              ? `${pendingChanges.length} pending ${pendingChanges.length === 1 ? 'change' : 'changes'} require approval`
              : 'No pending changes'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {editHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No edit history available</p>
            </div>
          ) : (
            editHistory.map((edit) => (
              <div key={edit.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="font-medium text-gray-900">{edit.field}</p>
                    <p className="text-sm text-gray-500">
                      Changed by {edit.changedBy} on {edit.changedAt.toLocaleDateString()}
                    </p>
                  </div>
                  {getStatusBadge(edit.status)}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-gray-500">Old Value</p>
                    <div className="p-2 bg-red-50 border border-red-200 rounded">
                      <p className="text-red-700 line-through">{formatValue(edit.oldValue)}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-500">New Value</p>
                    <div className="p-2 bg-emerald-50 border border-emerald-200 rounded">
                      <p className="text-emerald-700">{formatValue(edit.newValue)}</p>
                    </div>
                  </div>
                </div>

                {edit.status !== 'pending' && edit.reviewedBy && (
                  <div className="text-sm text-gray-500 pt-2 border-t border-gray-200">
                    {edit.status === 'approved' ? 'Approved' : 'Rejected'} by {edit.reviewedBy} on{' '}
                    {edit.reviewedAt?.toLocaleDateString()}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {isAdmin && pendingChanges.length > 0 && (
            <>
              <Button
                variant="outline"
                onClick={onReject}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject Changes
              </Button>
              <Button onClick={onApprove} className="bg-emerald-600 hover:bg-emerald-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve & Publish
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
