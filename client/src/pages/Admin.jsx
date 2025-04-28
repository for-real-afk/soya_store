import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch"; // Import the Switch component
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/utils";
import OrderStatus from "@/components/OrderStatus";
import {
  Package,
  ShoppingBag,
  Users,
  BarChart3,
  Sliders,
  Search,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Truck,
  FileCheck,
} from "lucide-react";

export default function Admin() {
  const { toast } = useToast();
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  
  // Fetch products
  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['/api/products'],
  });
  
  // Fetch orders
  const { data: orders = [], isLoading: isLoadingOrders } = useQuery({
    queryKey: ['/api/orders'],
  });
  
  // Mutation for updating order status
  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, status }) => {
      const response = await apiRequest("PUT", `/api/orders/${orderId}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      toast({
        title: "Order status updated",
        description: "The order status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Failed to update order status. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Handle status change
  const handleStatusChange = (orderId, status) => {
    updateOrderStatus.mutate({ orderId, status });
  };
  
  // Filter orders by status
  const filteredOrders = orderStatusFilter === "all" 
    ? orders 
    : orders.filter(order => order.status === orderStatusFilter);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-header font-bold">Admin Dashboard</h1>
        <Badge variant="outline" className="bg-warning text-white">Admin Mode</Badge>
      </div>
      
      <Tabs defaultValue="dashboard">
        <TabsList className="grid grid-cols-5 mb-8">
          <TabsTrigger value="dashboard">
            <BarChart3 size={16} className="mr-2" /> Dashboard
          </TabsTrigger>
          <TabsTrigger value="orders">
            <ShoppingBag size={16} className="mr-2" /> Orders
          </TabsTrigger>
          <TabsTrigger value="products">
            <Package size={16} className="mr-2" /> Products
          </TabsTrigger>
          <TabsTrigger value="customers">
            <Users size={16} className="mr-2" /> Customers
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Sliders size={16} className="mr-2" /> Settings
          </TabsTrigger>
        </TabsList>
        
        {/* Dashboard Tab */}
        <TabsContent value="dashboard">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(orders.reduce((total, order) => total + order.total, 0))}</div>
                <p className="text-xs text-muted-foreground">+12.5% from last month</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{orders.length}</div>
                <p className="text-xs text-muted-foreground">+8.1% from last month</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{products.length}</div>
                <p className="text-xs text-muted-foreground">+2 new this month</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(products.reduce((total, product) => total + (product.price * product.stock), 0))}
                </div>
                <p className="text-xs text-muted-foreground">+5.2% from last month</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest 5 orders</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingOrders ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse flex justify-between items-center py-2">
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 5).map(order => (
                      <div key={order.id} className="flex justify-between items-center py-2 border-b last:border-0">
                        <div>
                          <div className="font-semibold">Order #{order.id}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center">
                          <OrderStatus status={order.status} />
                          <span className="ml-2 font-semibold">{formatCurrency(order.total)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Inventory Status</CardTitle>
                <CardDescription>Products with low stock</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingProducts ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse flex justify-between items-center py-2">
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {products
                      .filter(product => product.stock < 20)
                      .slice(0, 5)
                      .map(product => (
                        <div key={product.id} className="flex justify-between items-center py-2 border-b last:border-0">
                          <div className="font-semibold">{product.name}</div>
                          <div>
                            <Badge variant={product.stock < 10 ? "destructive" : "outline"}>
                              Stock: {product.stock}
                            </Badge>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Orders Tab */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Orders Management</CardTitle>
              <CardDescription>Manage and track all customer orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-6">
                <div className="flex gap-4">
                  <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Orders</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <Input className="pl-8" placeholder="Search orders..." />
                  </div>
                </div>
                
                <div className="text-sm text-gray-500">
                  Showing {filteredOrders.length} of {orders.length} orders
                </div>
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingOrders ? (
                      [...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                          <TableCell colSpan={6}>
                            <div className="animate-pulse h-4 bg-gray-200 rounded"></div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : filteredOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          No orders found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredOrders.map(order => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">#{order.id}</TableCell>
                          <TableCell>User #{order.userId}</TableCell>
                          <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <OrderStatus status={order.status} />
                          </TableCell>
                          <TableCell>{formatCurrency(order.total)}</TableCell>
                          <TableCell className="text-right">
                            <Select
                              value={order.status}
                              onValueChange={(status) => handleStatusChange(order.id, status)}
                            >
                              <SelectTrigger className="w-[130px]">
                                <SelectValue placeholder="Update status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="processing">Processing</SelectItem>
                                <SelectItem value="shipped">Shipped</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Products Tab */}
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Products Management</CardTitle>
                  <CardDescription>Manage your product catalog</CardDescription>
                </div>
                <Button>
                  <Plus size={16} className="mr-2" /> Add Product
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-6">
                <div className="flex gap-4">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="seeds">Seeds</SelectItem>
                      <SelectItem value="products">Products</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <Input className="pl-8" placeholder="Search products..." />
                  </div>
                </div>
                
                <div className="text-sm text-gray-500">
                  Showing {products.length} products
                </div>
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingProducts ? (
                      [...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                          <TableCell colSpan={6}>
                            <div className="animate-pulse h-4 bg-gray-200 rounded"></div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      products.map(product => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">#{product.id}</TableCell>
                          <TableCell>{product.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {product.category}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatCurrency(product.price)}</TableCell>
                          <TableCell>
                            <Badge variant={product.stock < 10 ? "destructive" : product.stock < 20 ? "warning" : "outline"}>
                              {product.stock}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button size="sm" variant="outline">
                                <Edit size={14} />
                              </Button>
                              <Button size="sm" variant="outline" className="text-destructive">
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Customers Tab */}
        <TabsContent value="customers">
          <Card>
            <CardHeader>
              <CardTitle>Customers Management</CardTitle>
              <CardDescription>View and manage customer accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <div className="mb-4">
                  <Users size={48} className="mx-auto text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Customer Management Coming Soon</h3>
                <p>This feature is currently under development.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Admin Settings</CardTitle>
              <CardDescription>Configure admin dashboard settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Notifications</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">New Order Alerts</h4>
                      <p className="text-sm text-gray-500">Receive notifications when new orders are placed</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">Low Stock Alerts</h4>
                      <p className="text-sm text-gray-500">Get notified when product stock falls below threshold</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">Abandoned Cart Notifications</h4>
                      <p className="text-sm text-gray-500">Alerts for abandoned shopping carts</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Security</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Session Timeout</h4>
                    <Select defaultValue="60">
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select timeout" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Admin Activity Logs</h4>
                    <p className="text-sm text-gray-500">Maintain detailed logs of admin actions</p>
                    <div className="mt-2">
                      <Button variant="outline" size="sm">
                        View Logs
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex justify-end">
                <Button className="mr-2" variant="outline">Cancel</Button>
                <Button>Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}