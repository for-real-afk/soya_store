import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CartItem, Product, Address } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type ShopContextType = {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateCartItemQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartItemCount: number;
  isCartOpen: boolean;
  toggleCart: () => void;
  closeCart: () => void;
  checkout: (userId: number, shippingAddress: Address, paymentMethod: string) => Promise<number | null>;
};

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { toast } = useToast();

  // Initialize cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error("Failed to parse saved cart", error);
        localStorage.removeItem("cart");
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product, quantity = 1) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => item.productId === product.id);
      
      if (existingItemIndex >= 0) {
        // Item already in cart, update quantity
        const newCart = [...prevCart];
        newCart[existingItemIndex].quantity += quantity;
        return newCart;
      } else {
        // Add new item to cart
        return [...prevCart, {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity,
          imageUrl: product.imageUrl
        }];
      }
    });
    
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prevCart => prevCart.filter(item => item.productId !== productId));
  };

  const updateCartItemQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prevCart => 
      prevCart.map(item => 
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const cartItemCount = cart.reduce(
    (count, item) => count + item.quantity,
    0
  );

  const toggleCart = () => {
    setIsCartOpen(prev => !prev);
  };

  const closeCart = () => {
    setIsCartOpen(false);
  };

  const checkout = async (userId: number, shippingAddress: Address, paymentMethod: string): Promise<number | null> => {
    try {
      const response = await apiRequest("POST", "/api/orders", {
        userId,
        status: "pending",
        total: cartTotal,
        items: cart,
        shippingAddress,
        paymentMethod
      });
      
      const order = await response.json();
      clearCart();
      return order.id;
    } catch (error) {
      console.error("Checkout failed", error);
      toast({
        title: "Checkout failed",
        description: "There was an error processing your order. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    cartTotal,
    cartItemCount,
    isCartOpen,
    toggleCart,
    closeCart,
    checkout
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const context = useContext(ShopContext);
  if (context === undefined) {
    throw new Error("useShop must be used within a ShopProvider");
  }
  return context;
}
