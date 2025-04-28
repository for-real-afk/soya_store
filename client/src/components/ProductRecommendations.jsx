import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import { getRecommendations } from '@/lib/chatbotService';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingCart, Sparkles } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useShop } from '@/context/ShopContext';

const ProductRecommendations = ({ 
  title = 'Recommended For You', 
  category = null,
  limit = 4,
  showTitle = true
}) => {
  const { user } = useAuth();
  const { addToCart } = useShop();
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoading(true);
      try {
        const options = {
          userId: user?.id,
          limit
        };
        
        if (category) {
          options.category = category;
        }
        
        const data = await getRecommendations(options);
        setRecommendations(data);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRecommendations();
  }, [user, category, limit]);

  // Handle adding item to cart
  const handleAddToCart = (product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.imageUrl,
      category: product.category
    });
  };

  if (isLoading) {
    return (
      <div className="mt-8">
        {showTitle && <h2 className="text-2xl font-semibold mb-4">{title}</h2>}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array(limit).fill(0).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-square w-full relative bg-gray-100">
                <Skeleton className="h-full w-full" />
              </div>
              <CardHeader className="p-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardFooter className="p-4 pt-0 flex justify-between">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      {showTitle && (
        <div className="flex items-center mb-4">
          <Sparkles className="text-amber-500 mr-2 h-5 w-5" />
          <h2 className="text-2xl font-semibold">{title}</h2>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {recommendations.map((product) => (
          <Card key={product.id} className="overflow-hidden group hover:shadow-md transition-shadow">
            <Link href={`/product/${product.id}`}>
              <div className="cursor-pointer">
                <div className="aspect-square w-full relative bg-gray-50 overflow-hidden">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name}
                    className="object-cover h-full w-full group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.isOnSale && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                      SALE
                    </div>
                  )}
                  {product.isBestSeller && (
                    <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded">
                      BEST SELLER
                    </div>
                  )}
                </div>
                <CardHeader className="p-4">
                  <CardTitle className="text-lg font-medium line-clamp-1">{product.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{product.description}</CardDescription>
                </CardHeader>
              </div>
            </Link>
            <CardFooter className="p-4 pt-0 flex justify-between items-center">
              <div>
                {product.isOnSale ? (
                  <div className="flex flex-col">
                    <span className="font-bold text-primary">{formatCurrency(product.price)}</span>
                    <span className="text-gray-500 text-sm line-through">{formatCurrency(product.originalPrice)}</span>
                  </div>
                ) : (
                  <span className="font-bold text-primary">{formatCurrency(product.price)}</span>
                )}
              </div>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => handleAddToCart(product)}
                title="Add to cart"
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProductRecommendations;