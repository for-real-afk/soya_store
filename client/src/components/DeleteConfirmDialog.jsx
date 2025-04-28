import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

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

export default function DeleteConfirmDialog({ 
  open, 
  onOpenChange,
  entityId,
  entityName,
  entityType = 'product',
  onSuccess
}) {
  const { toast } = useToast();
  
  // Delete mutation
  const mutation = useMutation({
    mutationFn: async () => {
      return apiRequest('DELETE', `${getEndpoint()}/${entityId}`);
    },
    onSuccess: () => {
      // Invalidate relevant queries
      if (entityType === 'product') {
        queryClient.invalidateQueries({ queryKey: ['/api/products'] });
        queryClient.invalidateQueries({ queryKey: ['/api/products/featured'] });
      } else if (entityType === 'user') {
        queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      } else if (entityType === 'order') {
        queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      }
      
      // Show success message
      toast({
        title: `${capitalize(entityType)} deleted`,
        description: `${entityName} has been deleted successfully.`,
      });
      
      // Close dialog
      onOpenChange(false);
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete ${entityType}: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Helper to get the appropriate API endpoint
  function getEndpoint() {
    switch (entityType) {
      case 'product':
        return '/api/products';
      case 'user':
        return '/api/users';
      case 'order':
        return '/api/orders';
      default:
        return '/api/products';
    }
  }
  
  // Helper to capitalize the first letter
  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  
  // Handle delete confirmation
  const handleDelete = () => {
    mutation.mutate();
  };
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete <strong>{entityName}</strong>. 
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}