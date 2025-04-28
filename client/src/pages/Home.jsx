import { useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProductCard from "@/components/ProductCard";
import ProductRecommendations from "@/components/ProductRecommendations";
import { 
  Leaf, 
  Truck, 
  Sprout,
  Star,
  StarHalf,
  ChevronRight
} from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { addToCart } = useShop();
  const { login, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  // Auto login for testing purposes (remove in production)
  useEffect(() => {
    const autoLogin = async () => {
      if (!isAuthenticated) {
        try {
          // Try to login with admin account first
          const success = await login("admin", "admin123");
          if (success) {
            toast({
              title: "Auto Login Successful",
              description: "Logged in as admin for testing purposes",
            });
          } else {
            // If admin login fails, try auto-registering first in backend
          }
        } catch (error) {
          console.error("Auto login failed:", error);
        }
      }
    };
    
    autoLogin();
  }, [isAuthenticated, login, toast]);

  const { data: featuredProducts = [], isLoading } = useQuery({
    queryKey: ['/api/products/featured'],
  });

  const featuredProduct = featuredProducts.find(p => p.name.includes("Premium Heirloom"));

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[500px] md:h-[600px] overflow-hidden">
        <div className="absolute inset-0 bg-black/30 z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1585253331134-c6825e5dfd3b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80" 
          alt="Organic soybean farm" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        <div className="relative z-20 container mx-auto px-4 h-full flex flex-col justify-center">
          <h1 className="text-white font-header text-3xl md:text-5xl font-bold max-w-2xl">
            Premium Organic Soybean Products
          </h1>
          <p className="text-white/90 mt-4 max-w-xl text-lg">
            Sustainably grown and harvested soybeans for healthier living.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/seeds">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
                Shop Seeds
              </Button>
            </Link>
            <Link href="/products">
              <Button size="lg" variant="outline" className="bg-white hover:bg-light text-primary">
                Explore Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-light">
        <div className="container mx-auto px-4">
          <h2 className="text-center font-header text-2xl md:text-3xl font-bold mb-12">
            Shop by Category
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Category 1 */}
            <Link href="/seeds" className="group">
              <div className="relative overflow-hidden rounded-lg h-64">
                <img 
                  src="https://images.unsplash.com/photo-1575383092862-48137de2060e?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" 
                  alt="Soybean Seeds" 
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                  <div className="p-6">
                    <h3 className="text-white font-header text-xl font-semibold">Soybean Seeds</h3>
                    <p className="text-white/80 mt-1">Premium organic varieties</p>
                  </div>
                </div>
              </div>
            </Link>
            
            {/* Category 2 */}
            <Link href="/products?subcategory=tofu" className="group">
              <div className="relative overflow-hidden rounded-lg h-64">
                <img 
                  src="https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" 
                  alt="Soybean Food Products" 
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                  <div className="p-6">
                    <h3 className="text-white font-header text-xl font-semibold">Soybean Food</h3>
                    <p className="text-white/80 mt-1">Tofu, tempeh, and more</p>
                  </div>
                </div>
              </div>
            </Link>
            
            {/* Category 3 */}
            <Link href="/products?subcategory=oil" className="group">
              <div className="relative overflow-hidden rounded-lg h-64">
                <img 
                  src="https://images.unsplash.com/photo-1567337710282-00832b415979?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" 
                  alt="Soybean Oil Products" 
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                  <div className="p-6">
                    <h3 className="text-white font-header text-xl font-semibold">Soybean Oils</h3>
                    <p className="text-white/80 mt-1">Cold-pressed and unrefined</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-header text-2xl md:text-3xl font-bold">Featured Products</h2>
            <Link href="/products" className="text-primary hover:underline font-semibold flex items-center">
              View All <ChevronRight size={16} className="ml-1" />
            </Link>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 aspect-square rounded-lg"></div>
                  <div className="mt-3 h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="mt-2 h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="mt-2 h-3 bg-gray-200 rounded w-2/4"></div>
                  <div className="mt-2 h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Product Highlight */}
      {featuredProduct && (
        <section className="py-16 bg-primary/5">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="order-2 md:order-1">
                <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold mb-4">
                  Featured Product
                </span>
                <h2 className="font-header text-2xl md:text-4xl font-bold">
                  {featuredProduct.name}
                </h2>
                <p className="text-dark/80 mt-4">
                  {featuredProduct.description}
                </p>
                
                <div className="mt-6 space-y-3">
                  <div className="flex items-start">
                    <div className="text-success mt-1 mr-3">
                      <Star size={16} className="fill-current" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Non-GMO Certified</h3>
                      <p className="text-sm text-dark/70">100% natural genetics, no modifications</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="text-success mt-1 mr-3">
                      <Star size={16} className="fill-current" />
                    </div>
                    <div>
                      <h3 className="font-semibold">High Germination Rate</h3>
                      <p className="text-sm text-dark/70">95%+ germination success in optimal conditions</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="text-success mt-1 mr-3">
                      <Star size={16} className="fill-current" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Drought Resistant</h3>
                      <p className="text-sm text-dark/70">Specially selected for climate adaptability</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex items-center space-x-4">
                  <div className="font-price text-xl font-semibold text-primary">
                    ${featuredProduct.price.toFixed(2)}
                  </div>
                  <Button 
                    onClick={() => addToCart(featuredProduct)}
                    className="bg-primary hover:bg-primary/90 text-white"
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
              
              <div className="order-1 md:order-2">
                <div className="relative rounded-lg overflow-hidden">
                  <img 
                    src={featuredProduct.imageUrl} 
                    alt={featuredProduct.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="text-primary text-xl" size={24} />
              </div>
              <h3 className="font-header font-semibold text-lg mb-2">100% Organic</h3>
              <p className="text-dark/70">
                All our products are certified organic, grown without synthetic pesticides or fertilizers.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="text-primary text-xl" size={24} />
              </div>
              <h3 className="font-header font-semibold text-lg mb-2">Fast Shipping</h3>
              <p className="text-dark/70">
                Orders ship within 24 hours and arrive in 2-5 business days with tracking included.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sprout className="text-primary text-xl" size={24} />
              </div>
              <h3 className="font-header font-semibold text-lg mb-2">Sustainability</h3>
              <p className="text-dark/70">
                Our farming practices prioritize soil health, biodiversity, and environmental stewardship.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Personalized Recommendations Section */}
      <section className="py-16 border-t">
        <div className="container mx-auto px-4">
          <ProductRecommendations 
            title="Recommended For You" 
            limit={4}
          />
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-secondary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-header text-2xl md:text-3xl font-bold mb-4">Join Our Community</h2>
            <p className="text-dark/70 mb-6">
              Sign up for our newsletter to receive updates, growing tips, and exclusive offers.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-grow"
              />
              <Button className="bg-primary hover:bg-primary/90 text-white whitespace-nowrap">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}