import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { User, Settings, Lock, Bell, CreditCard, Home } from "lucide-react";

// Profile schema
const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  username: z.string().min(3, "Username must be at least 3 characters"),
});

// Password schema
const passwordFormSchema = z.object({
  currentPassword: z.string().min(6, "Password must be at least 6 characters"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      username: user?.username || "",
    },
  });
  
  // Password form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  // Handle profile update
  const onProfileSubmit = async (data: ProfileFormValues) => {
    setIsSubmitting(true);
    try {
      // In a real app, this would send an API request to update the profile
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle password update
  const onPasswordSubmit = async (data: PasswordFormValues) => {
    setIsSubmitting(true);
    try {
      // In a real app, this would send an API request to update the password
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
      });
      
      passwordForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-header font-bold mb-6">My Account</h1>
      
      <Tabs defaultValue="profile" className="max-w-4xl mx-auto">
        <TabsList className="grid grid-cols-5 mb-8">
          <TabsTrigger value="profile">
            <User size={16} className="mr-2" /> Profile
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock size={16} className="mr-2" /> Security
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell size={16} className="mr-2" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="payment">
            <CreditCard size={16} className="mr-2" /> Payment
          </TabsTrigger>
          <TabsTrigger value="addresses">
            <Home size={16} className="mr-2" /> Addresses
          </TabsTrigger>
        </TabsList>
        
        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your account information</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                  <FormField
                    control={profileForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="john.doe@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={profileForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="johndoe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Updating..." : "Update Profile"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Change Password */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Change Password</h3>
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Updating..." : "Change Password"}
                    </Button>
                  </form>
                </Form>
              </div>
              
              <Separator />
              
              {/* Two-Factor Authentication */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-500">
                  Add an extra layer of security to your account by enabling two-factor authentication.
                </p>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="twoFactor">Enable Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-500">
                      Receive a verification code via email when signing in.
                    </p>
                  </div>
                  <Switch id="twoFactor" />
                </div>
              </div>
              
              <Separator />
              
              {/* Session Management */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Session Management</h3>
                <p className="text-sm text-gray-500">
                  Manage your active sessions across devices.
                </p>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h4 className="font-semibold">Current Session</h4>
                      <p className="text-sm text-gray-500">Chrome on Windows • {new Date().toLocaleDateString()}</p>
                    </div>
                    <span className="text-sm bg-success/10 text-success px-2 py-1 rounded">Active</span>
                  </div>
                </div>
                
                <Button variant="destructive">Sign Out All Devices</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage how we contact you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Email Notifications</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="orderUpdates">Order Updates</Label>
                      <p className="text-sm text-gray-500">Receive updates about your orders</p>
                    </div>
                    <Switch id="orderUpdates" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="newProducts">New Products</Label>
                      <p className="text-sm text-gray-500">Be notified about new product releases</p>
                    </div>
                    <Switch id="newProducts" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="promotions">Promotions</Label>
                      <p className="text-sm text-gray-500">Receive promotions, discounts, and sale notifications</p>
                    </div>
                    <Switch id="promotions" />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Newsletter</h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="newsletter">Weekly Newsletter</Label>
                    <p className="text-sm text-gray-500">Receive our weekly newsletter with farming tips and offers</p>
                  </div>
                  <Switch id="newsletter" defaultChecked />
                </div>
              </div>
              
              <Button className="mt-4">Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Payment Tab */}
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Manage your payment options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Saved Payment Methods</h3>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-10 h-6 bg-blue-600 rounded mr-3"></div>
                      <div>
                        <h4 className="font-semibold">Visa ending in 1234</h4>
                        <p className="text-sm text-gray-500">Expires 12/25</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="outline" size="sm">Remove</Button>
                    </div>
                  </div>
                </div>
                
                <Button className="w-full">Add New Payment Method</Button>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Billing Address</h3>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold">John Doe</h4>
                      <p className="text-sm text-gray-500">123 Main St, Apt 4B</p>
                      <p className="text-sm text-gray-500">New York, NY 10001</p>
                      <p className="text-sm text-gray-500">United States</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="outline" size="sm">Remove</Button>
                    </div>
                  </div>
                </div>
                
                <Button className="w-full">Add New Billing Address</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Addresses Tab */}
        <TabsContent value="addresses">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Addresses</CardTitle>
              <CardDescription>Manage your shipping addresses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Saved Addresses</h3>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold">Home</h4>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Default</span>
                      </div>
                      <p className="text-sm text-gray-500">John Doe</p>
                      <p className="text-sm text-gray-500">123 Main St, Apt 4B</p>
                      <p className="text-sm text-gray-500">New York, NY 10001</p>
                      <p className="text-sm text-gray-500">United States</p>
                      <p className="text-sm text-gray-500">(123) 456-7890</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="outline" size="sm">Remove</Button>
                    </div>
                  </div>
                </div>
                
                <Button className="w-full">Add New Address</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
