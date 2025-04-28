import React, { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  getPersonalizedRecommendations,
  getRelatedProducts,
  getFrequentlyBoughtTogether 
} from '../lib/recommendationService';

const ProductRecommendations = ({ 
  products, 
  currentProduct = null, 
  type = 'personalized',
  limit = 4,
  className = '' 
}) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    if (!Array.isArray(products) || products.length === 0) {
      setRecommendations([]);
      return;
    }

    let recommendedProducts = [];

    switch (type) {
      case 'related':
        // For product detail pages - show related products
        if (currentProduct) {
          recommendedProducts = getRelatedProducts(products, currentProduct, limit);
        }
        break;
      case 'frequently-bought-together':
        // For product detail pages - show products often bought together
        if (currentProduct) {
          recommendedProducts = getFrequentlyBoughtTogether(products, currentProduct, limit);
        }
        break;
      case 'personalized':
      default:
        // For homepage or user account - show personalized recommendations
        recommendedProducts = getPersonalizedRecommendations(products, user, limit);
        break;
    }

    setRecommendations(recommendedProducts);
  }, [products, currentProduct, type, user, limit]);

  if (!recommendations.length) {
    return null;
  }

  const getTitle = () => {
    switch (type) {
      case 'related':
        return t('youMightAlsoLike');
      case 'frequently-bought-together':
        return t('frequentlyBoughtTogether');
      case 'personalized':
      default:
        return t('recommendations');
    }
  };

  return (
    <div className={`my-6 ${className}`}>
      <h3 className="text-lg font-medium mb-4">{getTitle()}</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {recommendations.map(product => (
          <div 
            key={product.id} 
            className="rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
          >
            <Link href={`/products/${product.id}`}>
              <a className="block">
                <div className="aspect-w-1 aspect-h-1 w-full">
                  <img 
                    src={product.image_url || '/placeholder-image.jpg'} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3">
                  <h4 className="font-medium text-sm line-clamp-2">{product.name}</h4>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-green-600 font-bold">
                      ${product.price?.toFixed(2)}
                    </span>
                    {product.rating && (
                      <div className="flex items-center text-xs text-gray-500">
                        <span className="text-yellow-500 mr-1">★</span>
                        <span>{product.rating}</span>
                      </div>
                    )}
                  </div>
                </div>
              </a>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductRecommendations;