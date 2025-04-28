import React, { useEffect, useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  Breadcrumb, 
  BreadcrumbList, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useShop } from "@/context/ShopContext";
import { formatCurrency } from "@/lib/utils";
import { 
  Home, 
  Star, 
  StarHalf, 
  Minus, 
  Plus, 
  ShoppingCart, 
  ChevronRight 
} from "lucide-react";
import ProductCard from "@/components/ProductCard";
import ProductRecommendations from "@/components/ProductRecommendations";

export default function ProductDetail() {
  const [match, params] = useRoute("/product/:id");
  const id = match ? parseInt(params.id) : null;
  const { addToCart } = useShop();
  const [quantity, setQuantity] = useState(1);

  // Fetch product details
  const { data: product, isLoading: isProductLoading } = useQuery({
    queryKey: [`/api/products/${id}`],
    enabled: !!id,
  });

  // Fetch related products (same category)
  const { data: relatedProducts = [], isLoading: isRelatedLoading } = useQuery({
    queryKey: [`/api/products/category/${product?.category}`],
    enabled: !!product,
  });

  // Filter out the current product from related products
  const filteredRelatedProducts = relatedProducts.filter(p => p.id !== id).slice(0, 4);

  useEffect(() => {
    // Scroll to top when product changes
    window.scrollTo(0, 0);
  }, [id]);

  // Quantity handlers
  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => prev > 1 ? prev - 1 : 1);

  // Generate star rating display
  const renderRating = (rating = 0, reviewCount = 0) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center">
        <div className="flex">
          {[...Array(fullStars)].map((_, i) => (
            <Star key={i} className="text-accent fill-current" size={18} />
          ))}
          
          {hasHalfStar && <StarHalf className="text-accent fill-current" size={18} />}
          
          {[...Array(5 - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
            <Star key={i} className="text-accent" size={18} />
          ))}
        </div>
        <span className="ml-2 text-sm text-gray-600">({reviewCount} reviews)</span>
      </div>
    );
  };

  // Loading state
  if (isProductLoading || !product) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="aspect-square bg-gray-200 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-8">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">
              <Home className="h-4 w-4" />
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/${product.category}`}>
              {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/product/${product.id}`}>
              {product.name}
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Product Image */}
        <div className="overflow-hidden rounded-lg">
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-auto object-cover"
          />
        </div>

        {/* Product Details */}
        <div>
          {/* Tags */}
          <div className="mb-2">
            {product.isBestSeller && (
              <span className="inline-block bg-accent text-dark py-1 px-3 rounded-full text-xs font-semibold mr-2">
                Best Seller
              </span>
            )}
            {product.isOnSale && (
              <span className="inline-block bg-warning text-white py-1 px-3 rounded-full text-xs font-semibold">
                Sale
              </span>
            )}
          </div>

          {/* Product Name */}
          <h1 className="font-header text-2xl md:text-3xl font-bold mb-2">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="mb-4">
            {renderRating(product.rating, product.reviews)}
          </div>

          {/* Price */}
          <div className="mb-6">
            {product.isOnSale && product.originalPrice ? (
              <div className="flex items-center space-x-2">
                <span className="font-price text-2xl font-semibold text-primary">
                  {formatCurrency(product.price)}
                </span>
                <span className="font-price text-lg text-dark/60 line-through">
                  {formatCurrency(product.originalPrice)}
                </span>
                <span className="text-sm bg-warning/10 text-warning px-2 py-1 rounded">
                  Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                </span>
              </div>
            ) : (
              <span className="font-price text-2xl font-semibold text-primary">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-dark/80 mb-6 leading-relaxed">
            {product.description}
          </p>

          {/* Category & Stock */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <span className="text-sm text-dark/60">Category: </span>
              <Link href={`/${product.category}`} className="text-sm text-primary hover:underline">
                {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
              </Link>
              {product.subcategory && (
                <>
                  <span className="text-sm text-dark/60"> / </span>
                  <Link 
                    href={`/${product.category}?subcategory=${product.subcategory}`} 
                    className="text-sm text-primary hover:underline"
                  >
                    {product.subcategory.charAt(0).toUpperCase() + product.subcategory.slice(1)}
                  </Link>
                </>
              )}
            </div>
            <div>
              <span className="text-sm text-dark/60">Availability: </span>
              {product.stock > 0 ? (
                <span className="text-sm text-success font-semibold">In Stock ({product.stock})</span>
              ) : (
                <span className="text-sm text-destructive font-semibold">Out of Stock</span>
              )}
            </div>
          </div>

          {/* Quantity and Add to Cart */}
          <div className="flex flex-wrap items-center space-x-4 mb-8">
            <div className="flex items-center border rounded-md overflow-hidden">
              <button 
                onClick={decrementQuantity}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200"
                aria-label="Decrease quantity"
              >
                <Minus size={16} />
              </button>
              <span className="px-4 py-2 min-w-[40px] text-center">{quantity}</span>
              <button 
                onClick={incrementQuantity}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200"
                aria-label="Increase quantity"
              >
                <Plus size={16} />
              </button>
            </div>
            <Button 
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white"
              onClick={() => addToCart(product, quantity)}
              disabled={product.stock <= 0}
            >
              <ShoppingCart size={18} className="mr-2" />
              Add to Cart
            </Button>
          </div>

          {/* Secure Checkout & Shipping info */}
          <div className="bg-light/80 border border-gray-200 rounded-md p-4 mb-6">
            <div className="flex items-center mb-2">
              <div className="text-success mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-semibold">Secure Checkout</span>
            </div>
            <p className="text-sm text-dark/70">
              Free shipping on orders over $50. Orders ship within 24 hours.
            </p>
          </div>
        </div>
      </div>

      {/* Product Tabs */}
      <div className="mb-16">
        <Tabs defaultValue="details">
          <TabsList className="w-full border-b">
            <TabsTrigger value="details">Product Details</TabsTrigger>
            <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({product.reviews})</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="py-6">
            <div className="prose max-w-none">
              <h3>Product Description</h3>
              <p>{product.description}</p>
              <h3>Product Features</h3>
              <ul>
                <li>100% organic and non-GMO</li>
                <li>Sustainably grown and harvested</li>
                <li>High quality for optimal results</li>
                <li>Expertly processed and packaged for freshness</li>
              </ul>
            </div>
          </TabsContent>
          <TabsContent value="shipping" className="py-6">
            <div className="prose max-w-none">
              <h3>Shipping Policy</h3>
              <p>All orders are processed and shipped within 24 hours during business days.</p>
              <ul>
                <li>Free shipping on all orders over $50</li>
                <li>Standard shipping: 3-5 business days ($4.99)</li>
                <li>Express shipping: 1-2 business days ($9.99)</li>
              </ul>
              
              <h3>Return Policy</h3>
              <p>We accept returns within 30 days of delivery for most products. Please contact our customer service team to initiate a return.</p>
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="py-6">
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="text-4xl font-bold text-primary">{product.rating?.toFixed(1)}</div>
                <div>
                  {renderRating(product.rating, product.reviews)}
                  <p className="text-sm text-dark/60">Based on {product.reviews} reviews</p>
                </div>
              </div>
              
              <Separator />
              
              {/* Sample reviews - in real app, these would be fetched from an API */}
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold mr-2">
                        JD
                      </div>
                      <span className="font-semibold">John D.</span>
                    </div>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="text-accent fill-current" size={14} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm">This product exceeds expectations. The quality is exceptional and delivery was prompt.</p>
                </div>
                
                <div className="border-b pb-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold mr-2">
                        ML
                      </div>
                      <span className="font-semibold">Maria L.</span>
                    </div>
                    <div className="flex">
                      {[...Array(4)].map((_, i) => (
                        <Star key={i} className="text-accent fill-current" size={14} />
                      ))}
                      <Star className="text-accent" size={14} />
                    </div>
                  </div>
                  <p className="text-sm">Good product overall. Shipping was faster than expected. Would recommend.</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Smart Recommendations */}
      <div className="mb-12">
        <ProductRecommendations 
          title="You May Also Like" 
          category={product.category}
          limit={4}
        />
      </div>
    </div>
  );
}