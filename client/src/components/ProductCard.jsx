import { Link } from "wouter";
import { Star, StarHalf } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { formatCurrency } from "@/lib/utils";

export default function ProductCard({ product }) {
  const { addToCart } = useShop();

  // Generate star rating display
  const renderRating = () => {
    const rating = product.rating || 0;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center space-x-1 mt-2">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={i} className="text-accent text-sm fill-current" size={14} />
        ))}
        
        {hasHalfStar && <StarHalf className="text-accent text-sm fill-current" size={14} />}
        
        {[...Array(5 - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
          <Star key={i} className="text-accent text-sm" size={14} />
        ))}
        
        <span className="text-xs text-dark/60 ml-1">({product.reviews})</span>
      </div>
    );
  };

  return (
    <div className="group">
      <Link href={`/product/${product.id}`} className="block relative overflow-hidden rounded-lg">
        {product.isBestSeller && (
          <div className="absolute top-2 right-2 z-10 bg-accent text-dark py-1 px-2 rounded text-xs font-semibold">
            Best Seller
          </div>
        )}
        
        {product.isOnSale && (
          <div className="absolute top-2 right-2 z-10 bg-warning text-white py-1 px-2 rounded text-xs font-semibold">
            Sale
          </div>
        )}
        
        <div className="relative overflow-hidden aspect-square">
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        </div>
        
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button 
            className="bg-white text-primary hover:bg-light px-3 py-2 rounded-md font-semibold text-sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToCart(product);
            }}
          >
            Add to Cart
          </button>
        </div>
      </Link>
      
      <div className="pt-3">
        {product.isOnSale && product.originalPrice ? (
          <div className="flex items-center space-x-2">
            <div className="font-price text-primary font-semibold">{formatCurrency(product.price)}</div>
            <div className="font-price text-dark/60 text-sm line-through">{formatCurrency(product.originalPrice)}</div>
          </div>
        ) : (
          <div className="font-price text-primary font-semibold">{formatCurrency(product.price)}</div>
        )}
        
        <h3 className="font-semibold mt-1">{product.name}</h3>
        <p className="text-sm text-dark/70 mt-1">
          {product.description.length > 40 
            ? `${product.description.substring(0, 40)}...` 
            : product.description}
        </p>
        
        {renderRating()}
      </div>
    </div>
  );
}