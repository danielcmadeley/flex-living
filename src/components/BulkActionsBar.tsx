'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Check,
  X,
  Clock,
  FileText,
  ChevronDown,
  Trash2,
  Archive,
  Eye,
  EyeOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BulkActionsBarProps {
  selectedCount: number;
  isPerformingAction: boolean;
  onClearSelection: () => void;
  onBulkStatusChange: (status: 'published' | 'pending' | 'draft') => Promise<void>;
  onBulkDelete?: () => Promise<void>;
  onBulkArchive?: () => Promise<void>;
  className?: string;
}

export function BulkActionsBar({
  selectedCount,
  isPerformingAction,
  onClearSelection,
  onBulkStatusChange,
  onBulkDelete,
  onBulkArchive,
  className,
}: BulkActionsBarProps) {
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = React.useState(false);
  const [actionProgress, setActionProgress] = React.useState(0);

  // Simulate progress for better UX
  React.useEffect(() => {
    if (isPerformingAction) {
      setActionProgress(0);
      const interval = setInterval(() => {
        setActionProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 20;
        });
      }, 200);

      return () => clearInterval(interval);
    } else {
      setActionProgress(100);
      setTimeout(() => setActionProgress(0), 500);
    }
  }, [isPerformingAction]);

  const handleBulkAction = async (action: () => Promise<void>) => {
    try {
      await action();
    } catch (error) {
      console.error('Bulk action failed:', error);
    }
  };

  const statusActions = [
    {
      label: 'Publish',
      value: 'published' as const,
      icon: Check,
      color: 'text-green-600',
      bgColor: 'hover:bg-green-50',
      borderColor: 'border-green-200',
      description: 'Make reviews visible to public',
    },
    {
      label: 'Set to Pending',
      value: 'pending' as const,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'hover:bg-yellow-50',
      borderColor: 'border-yellow-200',
      description: 'Mark for review approval',
    },
    {
      label: 'Move to Draft',
      value: 'draft' as const,
      icon: FileText,
      color: 'text-gray-600',
      bgColor: 'hover:bg-gray-50',
      borderColor: 'border-gray-200',
      description: 'Hide from public view',
    },
  ];

  if (selectedCount === 0) return null;

  return (
    <>
      <div
        className={cn(
          'flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200 shadow-sm',
          'animate-in slide-in-from-top-2 duration-300',
          className
        )}
      >
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {selectedCount} selected
          </Badge>
          <span className="text-sm text-blue-700">
            {selectedCount === 1 ? '1 review' : `${selectedCount} reviews`} selected
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
            disabled={isPerformingAction}
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Status Actions */}
          {statusActions.map((action) => (
            <Button
              key={action.value}
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction(() => onBulkStatusChange(action.value))}
              disabled={isPerformingAction}
              className={cn(
                action.color,
                action.borderColor,
                action.bgColor,
                'border transition-colors'
              )}
              title={action.description}
            >
              <action.icon className="h-4 w-4 mr-1" />
              {action.label}
            </Button>
          ))}

          {/* More Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={isPerformingAction}
                className="border-gray-300"
              >
                More
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setShowArchiveDialog(true)}
                disabled={!onBulkArchive}
              >
                <Archive className="h-4 w-4 mr-2" />
                Archive Selected
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  // Bulk hide from public view
                  handleBulkAction(() => onBulkStatusChange('draft'));
                }}
              >
                <EyeOff className="h-4 w-4 mr-2" />
                Hide from Public
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  // Bulk show in public view
                  handleBulkAction(() => onBulkStatusChange('published'));
                }}
              >
                <Eye className="h-4 w-4 mr-2" />
                Show in Public
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                disabled={!onBulkDelete}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Progress Bar */}
      {isPerformingAction && (
        <div className="mt-2">
          <Progress value={actionProgress} className="h-2" />
          <p className="text-xs text-gray-500 mt-1">
            Updating {selectedCount} review{selectedCount !== 1 ? 's' : ''}...
          </p>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Reviews</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedCount} review
              {selectedCount !== 1 ? 's' : ''}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (onBulkDelete) {
                  handleBulkAction(onBulkDelete);
                }
                setShowDeleteDialog(false);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete {selectedCount} Review{selectedCount !== 1 ? 's' : ''}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Archive Confirmation Dialog */}
      <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Reviews</AlertDialogTitle>
            <AlertDialogDescription>
              Archive {selectedCount} review{selectedCount !== 1 ? 's' : ''}?
              Archived reviews will be hidden from the dashboard but can be restored later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (onBulkArchive) {
                  handleBulkAction(onBulkArchive);
                }
                setShowArchiveDialog(false);
              }}
            >
              Archive {selectedCount} Review{selectedCount !== 1 ? 's' : ''}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Keyboard shortcuts hook for bulk actions
export function useBulkActionShortcuts(
  selectedCount: number,
  actions: {
    onPublish: () => void;
    onPending: () => void;
    onDraft: () => void;
    onClear: () => void;
  }
) {
  React.useEffect(() => {
    if (selectedCount === 0) return;

    const handleKeydown = (event: KeyboardEvent) => {
      // Only handle shortcuts when reviews are selected
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'p':
            event.preventDefault();
            actions.onPublish();
            break;
          case 'w':
            event.preventDefault();
            actions.onPending();
            break;
          case 'd':
            event.preventDefault();
            actions.onDraft();
            break;
          case 'Escape':
            event.preventDefault();
            actions.onClear();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [selectedCount, actions]);
}
