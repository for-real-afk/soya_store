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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/utils";
import OrderStatus from "@/components/OrderStatus";
import ProductEditDialog from "@/components/ProductEditDialog";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";
import CustomerDetails from "@/components/CustomerDetails";
// Import Chart.js components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
  Filler
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';

import {
  Package,
  ShoppingBag,
  Users,
  UsersRound,
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
  ChevronRight
} from "lucide-react";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  ChartLegend,
  Filler
);

export default function Admin() {
  const { toast } = useToast();
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // State for dialogs
  const [activeProductDialog, setActiveProductDialog] = useState({ isOpen: false, product: null, isNew: false });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  // Fetch products
  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['/api/products'],
  });
  
  // Fetch orders
  const { data: orders = [], isLoading: isLoadingOrders } = useQuery({
    queryKey: ['/api/orders'],
  });
  
  // Fetch users
  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['/api/users'],
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

  // Handle dialog open/close
  const handleProductDialogChange = (open) => {
    setActiveProductDialog(prev => ({ ...prev, isOpen: open }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-header font-bold">Admin Dashboard</h1>
        <Badge variant="outline" className="bg-warning text-white">Admin Mode</Badge>
      </div>
      
      {/* Product Edit Dialog */}
      <ProductEditDialog
        open={activeProductDialog.isOpen}
        onOpenChange={handleProductDialogChange}
        product={activeProductDialog.product}
        isNew={activeProductDialog.isNew}
      />
      
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        entityId={productToDelete?.id}
        entityName={productToDelete?.name}
        entityType="product"
      />
      
      <Tabs 
        defaultValue="dashboard" 
        value={activeTab}
        onValueChange={value => setActiveTab(value)}
      >
        {/* Custom tabs display for mobile - scrollable horizontal tabs */}
        <div className="md:hidden overflow-x-auto pb-2 mb-4">
          <TabsList className="flex w-auto min-w-max space-x-1">
            <TabsTrigger value="dashboard" className="flex-shrink-0">
              <BarChart3 size={16} />
              <span className="ml-1">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex-shrink-0">
              <ShoppingBag size={16} />
              <span className="ml-1">Orders</span>
            </TabsTrigger>
            <TabsTrigger value="recent_orders" className="flex-shrink-0">
              <Clock size={16} />
              <span className="ml-1">Recent</span>
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex-shrink-0">
              <Package size={16} />
              <span className="ml-1">Inventory</span>
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex-shrink-0">
              <Users size={16} />
              <span className="ml-1">Customers</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex-shrink-0">
              <Sliders size={16} />
              <span className="ml-1">Settings</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex-shrink-0">
              <UsersRound size={16} />
              <span className="ml-1">Users</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        {/* Desktop tabs - Grid based layout */}
        <TabsList className="hidden md:grid grid-cols-7 mb-8">
          <TabsTrigger value="dashboard">
            <BarChart3 size={16} className="mr-2" /> Dashboard
          </TabsTrigger>
          <TabsTrigger value="orders">
            <ShoppingBag size={16} className="mr-2" /> Orders
          </TabsTrigger>
          <TabsTrigger value="recent_orders">
            <Clock size={16} className="mr-2" /> Recent Orders
          </TabsTrigger>
          <TabsTrigger value="inventory">
            <Package size={16} className="mr-2" /> Inventory
          </TabsTrigger>
          <TabsTrigger value="customers">
            <Users size={16} className="mr-2" /> Customers
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Sliders size={16} className="mr-2" /> Settings
          </TabsTrigger>
          <TabsTrigger value="users">
            <UsersRound size={16} className="mr-2" /> Users
          </TabsTrigger>
        </TabsList>
        
        {/* Dashboard Tab */}
        <TabsContent value="dashboard">
          {/* Mobile optimized stat cards in a 2-column grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="overflow-hidden">
              <CardHeader className="pb-1 p-3 md:p-4">
                <CardTitle className="text-xs sm:text-sm font-medium">Total Sales</CardTitle>
              </CardHeader>
              <CardContent className="p-3 md:p-4 pt-0">
                <div className="text-lg md:text-2xl font-bold">{formatCurrency(orders.reduce((total, order) => total + order.total, 0))}</div>
                <p className="text-[10px] md:text-xs text-muted-foreground">+12.5% from last month</p>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden">
              <CardHeader className="pb-1 p-3 md:p-4">
                <CardTitle className="text-xs sm:text-sm font-medium">Orders</CardTitle>
              </CardHeader>
              <CardContent className="p-3 md:p-4 pt-0">
                <div className="text-lg md:text-2xl font-bold">{orders.length}</div>
                <p className="text-[10px] md:text-xs text-muted-foreground">+8.1% from last month</p>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden">
              <CardHeader className="pb-1 p-3 md:p-4">
                <CardTitle className="text-xs sm:text-sm font-medium">Products</CardTitle>
              </CardHeader>
              <CardContent className="p-3 md:p-4 pt-0">
                <div className="text-lg md:text-2xl font-bold">{products.length}</div>
                <p className="text-[10px] md:text-xs text-muted-foreground">+2 new this month</p>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden">
              <CardHeader className="pb-1 p-3 md:p-4">
                <CardTitle className="text-xs sm:text-sm font-medium">Inventory Value</CardTitle>
              </CardHeader>
              <CardContent className="p-3 md:p-4 pt-0">
                <div className="text-lg md:text-2xl font-bold">
                  {formatCurrency(products.reduce((total, product) => total + (product.price * product.stock), 0))}
                </div>
                <p className="text-[10px] md:text-xs text-muted-foreground">+5.2% from last month</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Sales Analytics Chart - Mobile optimized */}
          <div className="grid grid-cols-1 gap-6 mb-8">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-sm sm:text-base md:text-lg">Sales Analytics</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Monthly sales performance</CardDescription>
              </CardHeader>
              <CardContent className="p-2 sm:p-6 pt-0">
                <div className="h-[250px] sm:h-[300px]">
                  <Line 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                          labels: {
                            boxWidth: 12,
                            font: {
                              size: window.innerWidth < 768 ? 10 : 12
                            }
                          }
                        },
                        title: {
                          display: false,
                        },
                        tooltip: {
                          bodyFont: {
                            size: window.innerWidth < 768 ? 10 : 12
                          },
                          titleFont: {
                            size: window.innerWidth < 768 ? 10 : 12
                          },
                          callbacks: {
                            label: function(context) {
                              let label = context.dataset.label || '';
                              if (label) {
                                label += ': ';
                              }
                              if (context.parsed.y !== null) {
                                label += formatCurrency(context.parsed.y);
                              }
                              return label;
                            }
                          }
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            font: {
                              size: window.innerWidth < 768 ? 8 : 11
                            },
                            callback: function(value) {
                              return formatCurrency(value);
                            }
                          }
                        },
                        x: {
                          ticks: {
                            font: {
                              size: window.innerWidth < 768 ? 8 : 11
                            },
                            maxRotation: window.innerWidth < 768 ? 45 : 0
                          }
                        }
                      }
                    }}
                    data={{
                      // Use abbreviated month names on mobile
                      labels: window.innerWidth < 768 
                        ? ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']
                        : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                      datasets: [
                        {
                          label: 'Monthly Sales',
                          data: [4000, 3000, 5000, 2780, 1890, 2390, 3490, 2000, 2500, 6000, 7000, 5500],
                          borderColor: '#10b981',
                          backgroundColor: 'rgba(16, 185, 129, 0.1)',
                          fill: true,
                          tension: 0.4
                        }
                      ],
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Product Category & Inventory Charts - Mobile Optimized */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-sm sm:text-base md:text-lg">Product Categories</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Breakdown by category</CardDescription>
              </CardHeader>
              <CardContent className="p-2 sm:p-6 pt-0">
                <div className="h-[200px] sm:h-[250px] flex items-center justify-center">
                  <Doughnut
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: window.innerWidth < 640 ? 'right' : 'bottom',
                          labels: {
                            boxWidth: window.innerWidth < 640 ? 8 : 12,
                            font: {
                              size: window.innerWidth < 640 ? 10 : 12
                            },
                            padding: window.innerWidth < 640 ? 8 : 10
                          }
                        }
                      },
                      cutout: '60%'
                    }}
                    data={{
                      labels: ['Seeds', 'Products'],
                      datasets: [
                        {
                          data: [
                            products.filter(p => p.category === 'seeds').length,
                            products.filter(p => p.category === 'products').length
                          ],
                          backgroundColor: [
                            '#10b981', // green
                            '#6366f1'  // blue
                          ],
                          borderColor: 'white',
                          borderWidth: 2,
                        },
                      ],
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-sm sm:text-base md:text-lg">Inventory Status</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Product stock levels</CardDescription>
              </CardHeader>
              <CardContent className="p-2 sm:p-6 pt-0">
                <div className="h-[200px] sm:h-[250px]">
                  <Bar
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false
                        },
                        tooltip: {
                          bodyFont: {
                            size: window.innerWidth < 640 ? 10 : 12
                          },
                          titleFont: {
                            size: window.innerWidth < 640 ? 10 : 12
                          }
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: window.innerWidth >= 640,
                            text: 'Number of Products',
                            font: {
                              size: 10
                            }
                          },
                          ticks: {
                            font: {
                              size: window.innerWidth < 640 ? 8 : 10
                            }
                          }
                        },
                        x: {
                          ticks: {
                            font: {
                              size: window.innerWidth < 640 ? 8 : 10
                            }
                          }
                        }
                      }
                    }}
                    data={{
                      // Use shorter labels on mobile
                      labels: window.innerWidth < 640 
                        ? ['Low', 'Medium', 'Good', 'High']
                        : ['Low Stock (<10)', 'Medium (10-30)', 'Good (30-70)', 'High (70+)'],
                      datasets: [
                        {
                          label: 'Products',
                          data: [
                            products.filter(p => p.stock < 10).length,
                            products.filter(p => p.stock >= 10 && p.stock < 30).length,
                            products.filter(p => p.stock >= 30 && p.stock < 70).length,
                            products.filter(p => p.stock >= 70).length
                          ],
                          backgroundColor: [
                            '#ef4444', // red
                            '#f59e0b', // amber
                            '#10b981', // green
                            '#3b82f6'  // blue
                          ]
                        }
                      ],
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders & Low Stock Products - Mobile Optimized */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-sm sm:text-base md:text-lg">Recent Orders</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Latest 5 orders</CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                {isLoadingOrders ? (
                  <div className="space-y-2 sm:space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse flex justify-between items-center py-2">
                        <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2 sm:space-y-3">
                    {orders.slice(0, 5).map(order => (
                      <div key={order.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b last:border-0">
                        <div className="flex justify-between items-center sm:block mb-1 sm:mb-0">
                          <div className="text-xs sm:text-sm font-semibold">Order #{order.id}</div>
                          <div className="text-xs text-gray-500 sm:mt-0.5">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end mt-1 sm:mt-0">
                          <div className="sm:order-2 ml-0 sm:ml-2">
                            <span className="text-xs sm:text-sm font-semibold">{formatCurrency(order.total)}</span>
                          </div>
                          <div className="sm:order-1">
                            <OrderStatus status={order.status} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-4 text-right">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs sm:text-sm text-primary font-medium" 
                    onClick={() => setActiveTab('orders')}
                  >
                    View all orders <ChevronRight size={14} className="ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-sm sm:text-base md:text-lg">Inventory Status</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Products with low stock</CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                {isLoadingProducts ? (
                  <div className="space-y-2 sm:space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse flex justify-between items-center py-2">
                        <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/6"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2 sm:space-y-3">
                    {products
                      .filter(product => product.stock < 20)
                      .slice(0, 5)
                      .map(product => (
                        <div key={product.id} className="flex items-center justify-between py-2 border-b last:border-0">
                          <div className="text-xs sm:text-sm font-medium line-clamp-1 max-w-[70%]">{product.name}</div>
                          <div>
                            <Badge 
                              variant={product.stock < 10 ? "destructive" : "outline"} 
                              className="text-[10px] sm:text-xs px-1.5 sm:px-2"
                            >
                              Stock: {product.stock}
                            </Badge>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
                <div className="mt-4 text-right">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs sm:text-sm text-primary font-medium" 
                    onClick={() => setActiveTab('inventory')}
                  >
                    View inventory <ChevronRight size={14} className="ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Recent Orders Tab */}
        <TabsContent value="recent_orders">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Monitor and manage your latest orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{orders.length}</div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{orders.filter(o => o.status === 'pending').length}</div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Processing</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{orders.filter(o => o.status === 'processing').length}</div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Completed</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{orders.filter(o => o.status === 'delivered').length}</div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {isLoadingOrders ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <Card key={i}>
                          <CardContent className="p-4">
                            <div className="animate-pulse space-y-2">
                              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : orders.length === 0 ? (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <div className="mb-4 flex justify-center">
                          <ShoppingBag className="h-12 w-12 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium">No Orders Yet</h3>
                        <p className="text-sm text-gray-500 mt-2">
                          When customers place orders, they will appear here.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {orders.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10).map(order => (
                        <Card key={order.id} className="overflow-hidden">
                          <CardContent className="p-0">
                            <div className="p-4 border-b">
                              <div className="flex justify-between items-center">
                                <div>
                                  <h3 className="font-semibold">Order #{order.id}</h3>
                                  <p className="text-sm text-gray-500">
                                    Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                                  </p>
                                </div>
                                <div className="flex items-center">
                                  <OrderStatus status={order.status} />
                                  <span className="ml-3 font-bold text-lg">{formatCurrency(order.total)}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="p-4 bg-gray-50">
                              <div className="flex justify-between mb-2">
                                <div className="text-gray-500 text-sm">Customer</div>
                                <div className="font-medium">User #{order.userId}</div>
                              </div>
                              <div className="flex justify-between">
                                <div className="text-gray-500 text-sm">Shipping Address</div>
                                <div className="font-medium text-right">
                                  {order.shippingAddress ? (
                                    <div>
                                      <div>{order.shippingAddress.street}</div>
                                      <div>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</div>
                                    </div>
                                  ) : (
                                    "No address provided"
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="p-4 flex justify-between items-center border-t">
                              <div>
                                <Select
                                  value={order.status}
                                  onValueChange={(status) => handleStatusChange(order.id, status)}
                                >
                                  <SelectTrigger className="w-[180px]">
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
                              </div>
                              <div>
                                <Button variant="outline" size="sm" className="mr-2">
                                  <FileCheck className="h-4 w-4 mr-1" /> Details
                                </Button>
                                <Button size="sm">
                                  <Truck className="h-4 w-4 mr-1" /> Process
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order Status Distribution</CardTitle>
                  <CardDescription>Overview of orders by status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <Pie
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'right',
                          }
                        }
                      }}
                      data={{
                        labels: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
                        datasets: [
                          {
                            data: [
                              orders.filter(o => o.status === 'pending').length,
                              orders.filter(o => o.status === 'processing').length,
                              orders.filter(o => o.status === 'shipped').length,
                              orders.filter(o => o.status === 'delivered').length,
                              orders.filter(o => o.status === 'cancelled').length
                            ],
                            backgroundColor: [
                              '#f59e0b', // amber (pending)
                              '#3b82f6', // blue (processing)
                              '#8b5cf6', // purple (shipped)
                              '#10b981', // green (delivered)
                              '#ef4444'  // red (cancelled)
                            ],
                            borderWidth: 1,
                            borderColor: '#fff',
                          },
                        ],
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        {/* Inventory Tab */}
        <TabsContent value="inventory">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Management</CardTitle>
                <CardDescription>Monitor and manage your product inventory</CardDescription>
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
                  
                  <Button onClick={() => setActiveProductDialog({ isOpen: true, product: null, isNew: true })}>
                    <Plus size={16} className="mr-2" /> Add Product
                  </Button>
                </div>
                
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Current Stock</TableHead>
                        <TableHead>Stock Status</TableHead>
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
                      ) : products.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                            No products found
                          </TableCell>
                        </TableRow>
                      ) : (
                        products.map(product => (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell className="capitalize">{product.category}</TableCell>
                            <TableCell>{formatCurrency(product.price)}</TableCell>
                            <TableCell>{product.stock}</TableCell>
                            <TableCell>
                              <Badge variant={
                                product.stock < 10 ? "destructive" : 
                                product.stock < 30 ? "warning" : 
                                "outline"
                              }>
                                {product.stock < 10 ? "Low" : 
                                product.stock < 30 ? "Medium" : 
                                product.stock < 70 ? "Good" : "High"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="outline" 
                                  size="icon"
                                  onClick={() => setActiveProductDialog({ isOpen: true, product, isNew: false })}
                                >
                                  <Edit size={16} />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="icon" 
                                  className="text-destructive"
                                  onClick={() => {
                                    setProductToDelete(product);
                                    setDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 size={16} />
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Low Stock Alert</CardTitle>
                  <CardDescription>Products that need reordering</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {products
                      .filter(product => product.stock < 10)
                      .map(product => (
                        <div key={product.id} className="flex justify-between items-center py-2 border-b last:border-0">
                          <div>
                            <div className="font-semibold">{product.name}</div>
                            <div className="text-sm text-gray-500">
                              {formatCurrency(product.price)} | Category: {product.category}
                            </div>
                          </div>
                          <div>
                            <Badge variant="destructive">
                              Stock: {product.stock}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    {products.filter(product => product.stock < 10).length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        No products with low stock
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Inventory Overview</CardTitle>
                  <CardDescription>Distribution by stock status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[220px]">
                    <Pie
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'right',
                          }
                        }
                      }}
                      data={{
                        labels: ['Low Stock', 'Medium Stock', 'Good Stock', 'High Stock'],
                        datasets: [
                          {
                            data: [
                              products.filter(p => p.stock < 10).length,
                              products.filter(p => p.stock >= 10 && p.stock < 30).length,
                              products.filter(p => p.stock >= 30 && p.stock < 70).length,
                              products.filter(p => p.stock >= 70).length
                            ],
                            backgroundColor: [
                              '#ef4444', // red
                              '#f59e0b', // amber
                              '#10b981', // green
                              '#3b82f6'  // blue
                            ],
                            borderWidth: 1,
                            borderColor: '#fff',
                          },
                        ],
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
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
              <div className="flex justify-between items-center mb-6">
                <div className="flex gap-4">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <Input className="pl-8" placeholder="Search users..." />
                  </div>
                </div>
                
                <div className="text-sm text-gray-500">
                  Showing {users.length} users
                </div>
              </div>
              
              {isLoadingUsers ? (
                <div className="space-y-4">
                  <div className="animate-pulse h-12 bg-gray-200 rounded"></div>
                  <div className="animate-pulse h-12 bg-gray-200 rounded"></div>
                  <div className="animate-pulse h-12 bg-gray-200 rounded"></div>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="mb-4">
                    <Users size={48} className="mx-auto text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No Customers Found</h3>
                  <p>There are no registered users in the system yet.</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map(user => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">#{user.id}</TableCell>
                          <TableCell>{user.username}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.name || '-'}</TableCell>
                          <TableCell>
                            {user.isAdmin ? (
                              <Badge>Admin</Badge>
                            ) : (
                              <Badge variant="outline">Customer</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedCustomer(user);
                                setCustomerDialogOpen(true);
                              }}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Customer Details Dialog */}
          <CustomerDetails
            open={customerDialogOpen}
            onOpenChange={setCustomerDialogOpen}
            customer={selectedCustomer}
          />
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