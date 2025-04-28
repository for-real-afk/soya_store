import { useState } from "react";
import { useLocation } from "wouter";
import { 
  Breadcrumb, 
  BreadcrumbList, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useShop } from "@/context/ShopContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { addressSchema } from "@shared/schema";
import { formatCurrency, sanitizeInput } from "@/lib/utils";
import { Home, CreditCard, DollarSign, FileText, ChevronRight, Check } from "lucide-react";
import PaymentUpload from "../components/PaymentUpload";
import TwoFactorAuth from "../components/TwoFactorAuth";

const checkoutFormSchema = addressSchema.extend({
  saveAddress: z.boolean().default(false),
  notes: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export default function Checkout() {
  const [location, setLocation] = useLocation();
  const { cart, cartTotal, checkout, clearCart } = useShop();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<string>("creditCard");
  const [showTwoFactorAuth, setShowTwoFactorAuth] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);

  // Calculate order summary
  const shipping = 4.99; // Fixed shipping cost
  const total = cartTotal + shipping;

  // Default form values
  const defaultValues: CheckoutFormValues = {
    fullName: user?.name || "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
    phone: "",
    saveAddress: false,
    notes: "",
  };

  // Form setup
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues,
  });

  // Redirect to home if cart is empty
  if (cart.length === 0 && !orderPlaced) {
    toast({
      title: "Your cart is empty",
      description: "Please add some items to your cart before proceeding to checkout.",
    });
    setLocation("/");
    return null;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated && !orderPlaced) {
    toast({
      title: "Please sign in",
      description: "You need to be signed in to complete your purchase.",
    });
    setLocation("/login?redirect=/checkout");
    return null;
  }

  // Handle form submission for shipping info
  const onSubmitShippingInfo = (data: CheckoutFormValues) => {
    // Sanitize input
    Object.keys(data).forEach(key => {
      if (typeof data[key as keyof CheckoutFormValues] === 'string') {
        data[key as keyof CheckoutFormValues] = sanitizeInput(data[key as keyof CheckoutFormValues] as string) as any;
      }
    });
    
    // Move to payment step
    setCheckoutStep(2);
    
    // In a real app, we would save the shipping info here
    toast({
      title: "Shipping information saved",
      description: "Please proceed to payment.",
    });
  };

  // Handle form submission for payment
  const onSubmitPayment = async () => {
    if (!user) return;
    
    // For credit card payment, show 2FA verification
    if (paymentMethod === "creditCard") {
      setShowTwoFactorAuth(true);
      return;
    }
    
    // For other payment methods, complete checkout
    completeCheckout();
  };

  // Handle 2FA verification success
  const handleTwoFactorSuccess = () => {
    setShowTwoFactorAuth(false);
    completeCheckout();
  };

  // Complete checkout process
  const completeCheckout = async () => {
    if (!user) return;
    
    try {
      const shippingInfo = form.getValues();
      const orderId = await checkout(
        user.id,
        {
          fullName: shippingInfo.fullName,
          addressLine1: shippingInfo.addressLine1,
          addressLine2: shippingInfo.addressLine2 || "",
          city: shippingInfo.city,
          state: shippingInfo.state,
          postalCode: shippingInfo.postalCode,
          country: shippingInfo.country,
          phone: shippingInfo.phone,
        },
        paymentMethod
      );
      
      if (orderId) {
        setOrderId(orderId);
        setOrderPlaced(true);
        setCheckoutStep(3);
        
        toast({
          title: "Order placed successfully!",
          description: `Your order #${orderId} has been placed.`,
        });
      }
    } catch (error) {
      toast({
        title: "Checkout failed",
        description: "There was an error processing your order. Please try again.",
        variant: "destructive",
      });
    }
  };

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
            <BreadcrumbLink href="/checkout">Checkout</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-2xl md:text-3xl font-header font-bold mb-6">Checkout</h1>

      {orderPlaced ? (
        // Order confirmation
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center bg-primary/10 border-b">
              <div className="mx-auto w-12 h-12 bg-success rounded-full flex items-center justify-center mb-2">
                <Check className="text-white" size={24} />
              </div>
              <CardTitle className="text-2xl">Order Confirmed!</CardTitle>
              <CardDescription>Your order has been placed successfully.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="font-semibold">Order Number:</span>
                  <span>#{orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Order Date:</span>
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Order Total:</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Payment Method:</span>
                  <span className="capitalize">{paymentMethod.replace(/([A-Z])/g, ' $1').trim()}</span>
                </div>

                <Separator />

                <div className="text-center space-y-4 py-4">
                  <p>
                    A confirmation email has been sent to <span className="font-semibold">{user?.email}</span>.
                  </p>
                  <p className="text-sm text-gray-500">
                    Your order will be processed within 24 hours. You can track your order status in the orders section.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button 
                    className="flex-1"
                    onClick={() => setLocation("/orders")}
                  >
                    View Order
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setLocation("/")}
                  >
                    Continue Shopping
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        // Checkout process
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Steps */}
          <div className="lg:col-span-2">
            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${checkoutStep >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'}`}>
                  1
                </div>
                <div className={`flex-1 h-1 mx-2 ${checkoutStep >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${checkoutStep >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'}`}>
                  2
                </div>
                <div className={`flex-1 h-1 mx-2 ${checkoutStep >= 3 ? 'bg-primary' : 'bg-gray-200'}`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${checkoutStep >= 3 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'}`}>
                  3
                </div>
              </div>
              <div className="flex justify-between mt-2">
                <span className={`text-xs ${checkoutStep >= 1 ? 'text-primary font-semibold' : 'text-gray-500'}`}>Shipping</span>
                <span className={`text-xs ${checkoutStep >= 2 ? 'text-primary font-semibold' : 'text-gray-500'}`}>Payment</span>
                <span className={`text-xs ${checkoutStep >= 3 ? 'text-primary font-semibold' : 'text-gray-500'}`}>Confirmation</span>
              </div>
            </div>

            {/* Step 1: Shipping Information */}
            {checkoutStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Information</CardTitle>
                  <CardDescription>Enter your shipping details</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmitShippingInfo)} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name*</FormLabel>
                              <FormControl>
                                <Input placeholder="John Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number*</FormLabel>
                              <FormControl>
                                <Input placeholder="(123) 456-7890" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="addressLine1"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address Line 1*</FormLabel>
                            <FormControl>
                              <Input placeholder="123 Main St" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="addressLine2"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address Line 2</FormLabel>
                            <FormControl>
                              <Input placeholder="Apt 4B" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City*</FormLabel>
                              <FormControl>
                                <Input placeholder="New York" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State/Province*</FormLabel>
                              <FormControl>
                                <Input placeholder="NY" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="postalCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Postal Code*</FormLabel>
                              <FormControl>
                                <Input placeholder="10001" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country*</FormLabel>
                            <FormControl>
                              <Input placeholder="United States" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Order Notes</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Special instructions for delivery" 
                                {...field}
                                className="min-h-[100px]" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="saveAddress"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Save this address for future orders
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      <div className="pt-4">
                        <Button 
                          type="submit" 
                          className="w-full sm:w-auto"
                        >
                          Continue to Payment <ChevronRight size={16} className="ml-2" />
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Payment */}
            {checkoutStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                  <CardDescription>Select your preferred payment method</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="creditCard" onValueChange={setPaymentMethod}>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="creditCard">
                        <CreditCard size={16} className="mr-2" /> Credit Card
                      </TabsTrigger>
                      <TabsTrigger value="bankTransfer">
                        <DollarSign size={16} className="mr-2" /> Bank Transfer
                      </TabsTrigger>
                      <TabsTrigger value="paymentSlip">
                        <FileText size={16} className="mr-2" /> Payment Slip
                      </TabsTrigger>
                    </TabsList>
                    
                    {/* Credit Card Payment Form */}
                    <TabsContent value="creditCard" className="pt-6">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="cardNumber">Card Number</Label>
                            <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cardName">Name on Card</Label>
                            <Input id="cardName" placeholder="John Doe" />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="expiryDate">Expiry Date</Label>
                            <Input id="expiryDate" placeholder="MM/YY" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cvv">CVV</Label>
                            <Input id="cvv" placeholder="123" />
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3 pt-4">
                          <Checkbox id="saveCard" />
                          <div className="grid gap-1.5 leading-none">
                            <Label htmlFor="saveCard">
                              Save card for future purchases
                            </Label>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    {/* Bank Transfer Instructions */}
                    <TabsContent value="bankTransfer" className="pt-6">
                      <div className="space-y-4">
                        <p>Please transfer the total amount to our bank account using the following details:</p>
                        
                        <div className="bg-primary/5 p-4 rounded-md space-y-2">
                          <div className="flex justify-between">
                            <span className="font-semibold">Bank Name:</span>
                            <span>Organic Bank</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-semibold">Account Name:</span>
                            <span>OrganicBeans Inc.</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-semibold">Account Number:</span>
                            <span>1234567890</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-semibold">Routing Number:</span>
                            <span>987654321</span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-500">
                          Please include your order number in the transfer description. 
                          Your order will be processed once payment is verified.
                        </p>
                      </div>
                    </TabsContent>
                    
                    {/* Payment Slip Upload */}
                    <TabsContent value="paymentSlip" className="pt-6">
                      <PaymentUpload />
                    </TabsContent>
                  </Tabs>
                  
                  <div className="flex flex-col sm:flex-row gap-4 mt-8">
                    <Button 
                      variant="outline" 
                      onClick={() => setCheckoutStep(1)}
                      className="flex-1"
                    >
                      Back to Shipping
                    </Button>
                    <Button 
                      onClick={onSubmitPayment}
                      className="flex-1"
                    >
                      Place Order
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.productId} className="flex justify-between">
                      <div className="flex">
                        <span className="font-semibold">{item.quantity}x</span>
                        <span className="ml-2 flex-1">{item.name}</span>
                      </div>
                      <span>{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  
                  <Separator />
                  
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{formatCurrency(shipping)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="mt-6 bg-primary/5 p-4 rounded-md">
              <h3 className="font-semibold mb-2">Secure Checkout</h3>
              <p className="text-sm text-gray-600">
                All transactions are encrypted and secure. Your personal information is protected by SSL technology.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Two Factor Authentication Modal */}
      {showTwoFactorAuth && (
        <TwoFactorAuth 
          onSuccess={handleTwoFactorSuccess}
          onCancel={() => setShowTwoFactorAuth(false)}
        />
      )}
    </div>
  );
}
