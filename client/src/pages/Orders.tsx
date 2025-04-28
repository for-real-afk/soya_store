import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Order } from "@shared/schema";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Eye, Home, Package, ShoppingBag } from "lucide-react";
import OrderStatus from "@/components/OrderStatus";

export default function Orders() {
  const { user } = useAuth();
  
  // Fetch user orders
  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['/api/orders/user', user?.id],
    enabled: !!user,
  });

  // Group orders by status for summary
  const ordersByStatus = orders.reduce((acc: Record<string, number>, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">
              <Home className="h-4 w-4" />
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/profile">My Account</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/orders">My Orders</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid gap-6">
        {/* Order summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center">
                <ShoppingBag className="mr-2 h-4 w-4 text-muted-foreground" />
                {isLoading ? (
                  <div className="h-7 w-16 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  orders.length
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center">
                <Package className="mr-2 h-4 w-4 text-amber-500" />
                {isLoading ? (
                  <div className="h-7 w-16 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  ordersByStatus['pending'] || 0
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center">
                <Package className="mr-2 h-4 w-4 text-blue-500" />
                {isLoading ? (
                  <div className="h-7 w-16 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  ordersByStatus['processing'] || 0
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center">
                <Package className="mr-2 h-4 w-4 text-green-500" />
                {isLoading ? (
                  <div className="h-7 w-16 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  (ordersByStatus['delivered'] || 0) + (ordersByStatus['shipped'] || 0)
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders table */}
        <Card>
          <CardHeader>
            <CardTitle>Order History</CardTitle>
            <CardDescription>View and track all your orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    [...Array(3)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <div className="animate-pulse h-4 w-16 bg-gray-200 rounded"></div>
                        </TableCell>
                        <TableCell>
                          <div className="animate-pulse h-4 w-24 bg-gray-200 rounded"></div>
                        </TableCell>
                        <TableCell>
                          <div className="animate-pulse h-4 w-20 bg-gray-200 rounded"></div>
                        </TableCell>
                        <TableCell>
                          <div className="animate-pulse h-4 w-16 bg-gray-200 rounded"></div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="animate-pulse h-8 w-20 bg-gray-200 rounded float-right"></div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                          <p>You haven't placed any orders yet</p>
                          <Button variant="outline" asChild>
                            <a href="/products">Browse Products</a>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map(order => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id}</TableCell>
                        <TableCell>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>
                          <OrderStatus status={order.status} />
                        </TableCell>
                        <TableCell>{formatCurrency(order.total)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <a href={`/order/${order.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              Details
                            </a>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}