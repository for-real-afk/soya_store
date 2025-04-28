import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency } from '@/lib/utils';
import OrderStatus from '@/components/OrderStatus';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function CustomerDetails({ 
  open, 
  onOpenChange,
  customer
}) {
  // Fetch customer orders
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['/api/users', customer?.id, 'orders'],
    queryFn: async () => {
      if (!customer?.id) return [];
      return apiRequest('GET', `/api/users/${customer.id}/orders`);
    },
    enabled: !!customer?.id,
  });
  
  // Get initials for avatar
  const getInitials = () => {
    if (!customer) return 'U';
    if (customer.name) {
      return customer.name.split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase();
    }
    return customer.username[0].toUpperCase();
  };
  
  // Calculate total spent
  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
  
  // Count orders by status
  const ordersByStatus = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});
  
  if (!customer) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customer Details</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-6">
          {/* Customer Overview */}
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold">
                {customer.name || customer.username}
                {customer.isAdmin && (
                  <Badge variant="outline" className="ml-2 bg-warning text-warning-foreground">
                    Admin
                  </Badge>
                )}
              </h3>
              <p className="text-sm text-muted-foreground">{customer.email}</p>
              <p className="text-sm mt-1">Username: {customer.username}</p>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{orders.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total Spent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  {orders.length > 0 ? (
                    <span>
                      Last order: {new Date(orders[0].createdAt).toLocaleDateString()}
                    </span>
                  ) : (
                    <span>No orders yet</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Order Status Counts */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>Customer order status breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {Object.entries(ordersByStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center gap-1">
                    <Badge variant={getBadgeVariant(status)}>
                      {status}: {count}
                    </Badge>
                  </div>
                ))}
                {Object.keys(ordersByStatus).length === 0 && (
                  <p className="text-muted-foreground text-sm">No orders found</p>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Order History */}
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
              <CardDescription>Complete order history for this customer</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">Loading orders...</div>
              ) : orders.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No order history found for this customer
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map(order => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">#{order.id}</TableCell>
                          <TableCell>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <OrderStatus status={order.status} />
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(order.total)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to get badge variant based on status
function getBadgeVariant(status) {
  switch (status) {
    case 'pending':
      return 'secondary';
    case 'processing':
      return 'default';
    case 'shipped':
      return 'outline';
    case 'delivered':
      return 'success';
    case 'cancelled':
      return 'destructive';
    default:
      return 'outline';
  }
}