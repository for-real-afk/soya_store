import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import ImageUpload from '@/components/ImageUpload';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { apiRequest, queryClient } from '@/lib/queryClient';

// Form validation schema
const productSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.preprocess(
    (val) => parseFloat(val),
    z.number().positive('Price must be positive')
  ),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  stock: z.preprocess(
    (val) => parseInt(val),
    z.number().int().nonnegative('Stock must be a non-negative integer')
  ),
  rating: z.preprocess(
    (val) => val === '' ? null : parseFloat(val),
    z.number().min(0).max(5).nullable().optional()
  ),
  is_featured: z.boolean().default(false),
  is_best_seller: z.boolean().default(false),
  is_on_sale: z.boolean().default(false),
  original_price: z.preprocess(
    (val) => val === '' ? null : parseFloat(val),
    z.number().positive('Original price must be positive').nullable().optional()
  ),
});

const AddProductForm = ({ onSuccess }) => {
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  const { t } = useLanguage();
  const [imageData, setImageData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with default values
  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: '',
      category: '',
      subcategory: '',
      stock: '0',
      rating: '',
      is_featured: false,
      is_best_seller: false,
      is_on_sale: false,
      original_price: '',
    },
  });

  // Handle image data from ImageUpload component
  const handleImageChange = (data) => {
    setImageData(data);
  };

  // Convert image to base64 for storage
  const convertImageToBase64 = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle form submission
  const onSubmit = async (data) => {
    // Only allow admin users
    if (!isAdmin) {
      toast({
        title: 'Permission Denied',
        description: 'You do not have permission to add products.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Process image if available
      let imageUrl = '';
      if (imageData && imageData.file) {
        // In a real app, you would upload to a server or cloud storage
        // For now, we convert to base64 as a demo
        imageUrl = await convertImageToBase64(imageData.file);
      }

      // Prepare product data
      const productData = {
        ...data,
        image_url: imageUrl || '/placeholder-image.jpg',
      };

      // Send to server
      const response = await apiRequest('POST', '/api/products', productData);
      
      if (!response.ok) {
        throw new Error('Failed to create product');
      }

      const newProduct = await response.json();

      // Invalidate products cache to refresh lists
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      
      toast({
        title: 'Product Created',
        description: `${newProduct.name} has been added to inventory.`,
      });

      // Reset form
      form.reset();
      setImageData(null);

      // Notify parent component
      if (onSuccess) {
        onSuccess(newProduct);
      }
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: 'Error',
        description: 'Failed to create product. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">{t('addProduct')}</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              {/* Product Image */}
              <div>
                <FormLabel>{t('productImage')}</FormLabel>
                <ImageUpload
                  initialImage=""
                  onImageChange={handleImageChange}
                />
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Basic Info */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('productName')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Organic Soybean Seeds" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('price')} ($)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" min="0" placeholder="29.99" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('stock')}</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" min="0" placeholder="100" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('category')}</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="seeds">Seeds</SelectItem>
                          <SelectItem value="oil">Soybean Oil</SelectItem>
                          <SelectItem value="tofu">Tofu & Tempeh</SelectItem>
                          <SelectItem value="milk">Soy Milk</SelectItem>
                          <SelectItem value="flour">Soy Flour</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="subcategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('subcategory')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Organic" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('initialRating')} (0-5)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.1" min="0" max="5" placeholder="4.5" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('description')}</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    placeholder="Describe your product..." 
                    className="h-32"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Product Flags */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="is_featured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      {t('featured')}
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="is_best_seller"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      {t('bestSeller')}
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="is_on_sale"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      {t('onSale')}
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(value) => {
                        field.onChange(value);
                        // If turning off sale, clear original price
                        if (!value) {
                          form.setValue('original_price', '');
                        }
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          
          {/* Original Price (only shown if is_on_sale is true) */}
          {form.watch('is_on_sale') && (
            <FormField
              control={form.control}
              name="original_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('originalPrice')} ($)</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" step="0.01" min="0" placeholder="39.99" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          <Button 
            type="submit" 
            className="w-full md:w-auto"
            disabled={isSubmitting}
          >
            {isSubmitting ? `${t('saving')}...` : t('addProduct')}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default AddProductForm;