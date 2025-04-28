import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/utils";
import { Product, Order, User } from "@shared/schema";
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
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");
  
  // Fetch products
  const { data: products = [], isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });
  
  // Fetch orders
  const { data: orders = [], isLoading: isLoadingOrders } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
  });
  
  // Mutation for updating order status
  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number, status: string }) => {
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
  const handleStatusChange = (orderId: number, status: string) => {
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
                          <TableCell>
                            <div className="flex items-center">
                              <img 
                                src={product.imageUrl} 
                                alt={product.name} 
                                className="w-10 h-10 object-cover rounded mr-3" 
                              />
                              <div>
                                <div className="font-semibold">{product.name}</div>
                                <div className="text-xs text-gray-500 truncate max-w-xs">
                                  {product.description.substring(0, 30)}...
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {product.category}
                              {product.subcategory && `/${product.subcategory}`}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatCurrency(product.price)}</TableCell>
                          <TableCell>
                            <Badge variant={product.stock < 10 ? "destructive" : product.stock < 20 ? "warning" : "outline"}>
                              {product.stock}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm">
                                <Edit size={14} className="mr-1" /> Edit
                              </Button>
                              <Button variant="destructive" size="sm">
                                <Trash2 size={14} className="mr-1" /> Delete
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
              <CardTitle>Customer Management</CardTitle>
              <CardDescription>View and manage customer accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-6">
                <div className="relative w-72">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <Input className="pl-8" placeholder="Search customers..." />
                </div>
                
                <div className="text-sm text-gray-500">
                  Showing 5 customers
                </div>
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Admin</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">#1</TableCell>
                      <TableCell>
                        <div className="font-semibold">Admin User</div>
                      </TableCell>
                      <TableCell>admin@organicbeans.com</TableCell>
                      <TableCell>0</TableCell>
                      <TableCell>
                        <Badge variant="success">
                          <CheckCircle2 size={14} className="mr-1" /> Yes
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm">
                            <Edit size={14} className="mr-1" /> Edit
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    
                    {/* Sample customer rows */}
                    {[...Array(4)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">#{i + 2}</TableCell>
                        <TableCell>
                          <div className="font-semibold">Customer {i + 1}</div>
                        </TableCell>
                        <TableCell>customer{i+1}@example.com</TableCell>
                        <TableCell>{Math.floor(Math.random() * 5)}</TableCell>
                        <TableCell>
                          <Badge variant="destructive">
                            <XCircle size={14} className="mr-1" /> No
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm">
                              <Edit size={14} className="mr-1" /> Edit
                            </Button>
                            <Button variant="destructive" size="sm">
                              <Trash2 size={14} className="mr-1" /> Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Store Settings</CardTitle>
              <CardDescription>Manage your store configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">General Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Store Name</label>
                    <Input value="OrganicBeans" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Contact Email</label>
                    <Input value="contact@organicbeans.com" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Currency</label>
                    <Select defaultValue="usd">
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="usd">USD ($)</SelectItem>
                        <SelectItem value="eur">EUR (€)</SelectItem>
                        <SelectItem value="gbp">GBP (£)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Default Language</label>
                    <Select defaultValue="en">
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="zh">Chinese</SelectItem>
                        <SelectItem value="ja">Japanese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Shipping Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Free Shipping Minimum</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2">$</span>
                      <Input className="pl-8" value="50" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Standard Shipping Rate</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2">$</span>
                      <Input className="pl-8" value="4.99" />
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Notification Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Order Confirmation Emails</label>
                      <p className="text-xs text-gray-500">Send confirmation emails to customers when they place an order</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Low Stock Alerts</label>
                      <p className="text-xs text-gray-500">Receive notifications when product stock is low</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">New Order Notifications</label>
                      <p className="text-xs text-gray-500">Receive notifications when a new order is placed</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <Button>Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
