import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { 
  Breadcrumb, 
  BreadcrumbList, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Slider
} from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import ProductCard from "@/components/ProductCard";
import { filterProducts, sortProducts } from "@/lib/utils";
import { Home, Filter, SearchIcon } from "lucide-react";

export default function Seeds() {
  const [_, params] = useRoute("/seeds");
  const [__, setLocation] = useLocation();
  const queryParams = new URLSearchParams(window.location.search);
  const initialSubcategory = queryParams.get("subcategory") || "";

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([0, 50]);
  const [selectedSubcategories, setSelectedSubcategories] = useState(
    initialSubcategory ? [initialSubcategory] : []
  );
  const [sortOption, setSortOption] = useState('price_asc');

  // Fetch products
  const { data: allProducts = [], isLoading } = useQuery({
    queryKey: ['/api/products/category/seeds'],
  });

  // Filter products based on filters
  const filteredProducts = filterProducts(allProducts, {
    search: searchQuery,
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
    category: 'seeds',
    ...(selectedSubcategories.length > 0 && {
      subcategory: selectedSubcategories.length === 1 ? selectedSubcategories[0] : undefined
    })
  });

  // Sort filtered products
  const sortedProducts = sortProducts(filteredProducts, sortOption);

  // Update URL when subcategory changes
  useEffect(() => {
    if (selectedSubcategories.length === 1) {
      setLocation(`/seeds?subcategory=${selectedSubcategories[0]}`, { replace: true });
    } else {
      setLocation('/seeds', { replace: true });
    }
  }, [selectedSubcategories, setLocation]);

  // Handler for subcategory checkbox
  const handleSubcategoryChange = (subcategory, checked) => {
    if (checked) {
      setSelectedSubcategories(prev => [...prev, subcategory]);
    } else {
      setSelectedSubcategories(prev => prev.filter(s => s !== subcategory));
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
            <BreadcrumbLink href="/seeds">Soybean Seeds</BreadcrumbLink>
          </BreadcrumbItem>
          {initialSubcategory && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/seeds?subcategory=${initialSubcategory}`}>
                  {initialSubcategory.charAt(0).toUpperCase() + initialSubcategory.slice(1)}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="w-full md:w-64">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Filter size={18} className="mr-2" /> Filters
            </h2>

            {/* Search Filter */}
            <div className="mb-6">
              <label htmlFor="search" className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Input
                  id="search"
                  type="text"
                  placeholder="Search seeds..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
                <SearchIcon size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Price Range Filter */}
            <Accordion type="single" collapsible defaultValue="price">
              <AccordionItem value="price">
                <AccordionTrigger className="text-sm font-medium">Price Range</AccordionTrigger>
                <AccordionContent>
                  <div className="pt-2">
                    <Slider
                      defaultValue={[0, 50]}
                      max={50}
                      step={1}
                      value={priceRange}
                      onValueChange={setPriceRange}
                      className="mb-4"
                    />
                    <div className="flex justify-between text-sm">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Subcategory Filter */}
            <Accordion type="single" collapsible defaultValue="subcategory">
              <AccordionItem value="subcategory">
                <AccordionTrigger className="text-sm font-medium">Type</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="organic"
                        checked={selectedSubcategories.includes('organic')}
                        onCheckedChange={(checked) => 
                          handleSubcategoryChange('organic', checked)
                        }
                      />
                      <label htmlFor="organic" className="text-sm">Organic</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="non-gmo"
                        checked={selectedSubcategories.includes('non-gmo')}
                        onCheckedChange={(checked) => 
                          handleSubcategoryChange('non-gmo', checked)
                        }
                      />
                      <label htmlFor="non-gmo" className="text-sm">Non-GMO</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="heirloom"
                        checked={selectedSubcategories.includes('heirloom')}
                        onCheckedChange={(checked) => 
                          handleSubcategoryChange('heirloom', checked)
                        }
                      />
                      <label htmlFor="heirloom" className="text-sm">Heirloom</label>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-2xl font-header font-bold">Soybean Seeds</h1>
            
            {/* Sort Options */}
            <div className="flex items-center">
              <span className="mr-2 text-sm text-gray-500">Sort by:</span>
              <Select
                value={sortOption}
                onValueChange={(value) => setSortOption(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price_asc">Price: Low to High</SelectItem>
                  <SelectItem value="price_desc">Price: High to Low</SelectItem>
                  <SelectItem value="name_asc">Name: A to Z</SelectItem>
                  <SelectItem value="name_desc">Name: Z to A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results count */}
          <p className="text-sm text-gray-500 mb-6">
            Showing {sortedProducts.length} products
          </p>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 aspect-square rounded-lg"></div>
                  <div className="mt-3 h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="mt-2 h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="mt-2 h-3 bg-gray-200 rounded w-2/4"></div>
                  <div className="mt-2 h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">No products found</h3>
              <p className="text-gray-500">Try adjusting your filters or search query.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}