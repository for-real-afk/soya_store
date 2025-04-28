import { Minus, Plus, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useShop } from "@/context/ShopContext";
import { formatCurrency } from "@/lib/utils";
import { Link } from "wouter";

export default function CartSidebar() {
  const { 
    cart, 
    isCartOpen, 
    closeCart, 
    removeFromCart, 
    updateCartItemQuantity,
    cartTotal
  } = useShop();

  const shipping = 4.99; // Fixed shipping cost
  const total = cartTotal + shipping;

  return (
    <div className={`fixed right-0 top-0 h-full w-full md:w-96 bg-white shadow-xl z-50 transform transition-transform duration-300 ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex flex-col h-full">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-header text-lg font-bold">Your Cart ({cart.length})</h2>
          <button 
            onClick={closeCart}
            className="text-dark hover:text-primary"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-grow overflow-auto p-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="text-gray-400 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="font-medium text-lg mb-1">Your cart is empty</h3>
              <p className="text-gray-500 mb-6">Looks like you haven't added any items to your cart yet.</p>
              <Button variant="outline" onClick={closeCart}>
                Continue Shopping
              </Button>
            </div>
          ) : (
            /* Cart items */
            cart.map((item) => (
              <div key={item.productId} className="flex items-center space-x-4 mb-6 pb-6 border-b">
                <img 
                  src={item.imageUrl} 
                  alt={item.name} 
                  className="w-16 h-16 object-cover rounded-md"
                />
                <div className="flex-grow">
                  <h3 className="font-semibold text-sm">{item.name}</h3>
                  <div className="flex justify-between mt-1">
                    <div className="font-price text-sm font-semibold">{formatCurrency(item.price)}</div>
                    <div className="flex items-center space-x-2">
                      <button 
                        className="w-5 h-5 flex items-center justify-center bg-light rounded"
                        onClick={() => updateCartItemQuantity(item.productId, item.quantity - 1)}
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-sm">{item.quantity}</span>
                      <button 
                        className="w-5 h-5 flex items-center justify-center bg-light rounded"
                        onClick={() => updateCartItemQuantity(item.productId, item.quantity + 1)}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>
                <button 
                  className="text-dark hover:text-red-500"
                  onClick={() => removeFromCart(item.productId)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
        
        {cart.length > 0 && (
          <div className="p-4 border-t">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-price font-semibold">{formatCurrency(cartTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-price">{formatCurrency(shipping)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-primary font-semibold">
                <span>Total</span>
                <span className="font-price">{formatCurrency(total)}</span>
              </div>
            </div>
            
            <Link href="/checkout">
              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold"
                onClick={closeCart}
              >
                Checkout
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              className="w-full text-primary mt-2"
              onClick={closeCart}
            >
              Continue Shopping
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
