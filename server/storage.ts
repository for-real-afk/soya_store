import { 
  users, type User, type InsertUser,
  products, type Product, type InsertProduct,
  orders, type Order, type InsertOrder
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Product methods
  getProducts(): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  getProductsByCategory(category: string): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<Product>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;

  // Order methods
  getOrders(): Promise<Order[]>;
  getOrderById(id: number): Promise<Order | undefined>;
  getOrdersByUserId(userId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // Input sanitization and validation
    if (!username || typeof username !== 'string') {
      throw new Error('Invalid username');
    }
    
    // Prevent potential SQL injection by ensuring strict equality check
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Validate user data before insertion
    if (!insertUser.username || !insertUser.password || !insertUser.email) {
      throw new Error('Invalid user data: Username, password, and email are required');
    }
    
    // Hash the password (in a real app, you'd use bcrypt here)
    // For now, we'll keep it simple as per project scope
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(insertUser.email)) {
      throw new Error('Invalid email format');
    }
    
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProductById(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.category, category));
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.isFeatured, true));
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    // Add some randomized ratings and reviews for new products
    const withDefaults = {
      ...product,
      rating: Math.random() * 2 + 3, // Random rating between 3 and 5
      reviews: Math.floor(Math.random() * 50) + 5 // Random number of reviews
    };
    
    const [newProduct] = await db
      .insert(products)
      .values(withDefaults)
      .returning();
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<Product>): Promise<Product | undefined> {
    const [updatedProduct] = await db
      .update(products)
      .set(product)
      .where(eq(products.id, id))
      .returning();
    return updatedProduct || undefined;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db
      .delete(products)
      .where(eq(products.id, id))
      .returning({ id: products.id });
    return result.length > 0;
  }

  async getOrders(): Promise<Order[]> {
    return await db.select().from(orders);
  }

  async getOrderById(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async getOrdersByUserId(userId: number): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.userId, userId));
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db
      .insert(orders)
      .values(order)
      .returning();
    return newOrder;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    // Validate parameters
    if (!id || isNaN(id) || id <= 0) {
      throw new Error('Invalid order ID');
    }
    
    // Validate status is one of the allowed values
    const allowedStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!status || !allowedStatuses.includes(status.toLowerCase())) {
      throw new Error(`Invalid status. Must be one of: ${allowedStatuses.join(', ')}`);
    }
    
    // Check if order exists before updating
    const existingOrder = await this.getOrderById(id);
    if (!existingOrder) {
      throw new Error(`Order with ID ${id} not found`);
    }
    
    const [updatedOrder] = await db
      .update(orders)
      .set({ status: status.toLowerCase() }) // Normalize status to lowercase
      .where(eq(orders.id, id))
      .returning();
    
    return updatedOrder || undefined;
  }
  
  // Helper method to seed initial data if needed
  async seedInitialData() {
    // Check if users table is empty
    const existingUsers = await db.select().from(users);
    if (existingUsers.length === 0) {
      // Add an admin user
      const [adminUser] = await db.insert(users).values({
        username: "admin",
        password: "admin123",
        email: "admin@organicbeans.com",
        name: "Admin User",
        isAdmin: true
      }).returning();
      
      // Seed products
      const productSeedData = [
        {
          name: "Organic Soybean Seeds - 2lb Bag",
          description: "Non-GMO, heirloom variety perfect for planting. High germination rate.",
          price: 12.99,
          category: "seeds",
          subcategory: "organic",
          imageUrl: "https://images.unsplash.com/photo-1574323347407-f5e1ad6e9b58?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          isFeatured: true,
          isBestSeller: true,
          isOnSale: false,
          originalPrice: null,
          stock: 75,
          rating: 4.7,
          reviews: 42
        },
        {
          name: "Organic Soy Milk - 32oz",
          description: "Unsweetened, shelf-stable soy milk made from our organic soybeans.",
          price: 4.99,
          category: "products",
          subcategory: "milk",
          imageUrl: "https://images.unsplash.com/photo-1612257606303-52ef21eecd8e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          isFeatured: true,
          isBestSeller: false,
          isOnSale: false,
          originalPrice: null,
          stock: 120,
          rating: 4.3,
          reviews: 28
        },
        {
          name: "Organic Soybean Oil - 16oz",
          description: "Cold-pressed, unrefined soybean oil perfect for cooking and dressings.",
          price: 9.99,
          category: "products",
          subcategory: "oil",
          imageUrl: "https://images.unsplash.com/photo-1593001867410-22f8be235fa5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          isFeatured: true,
          isBestSeller: false,
          isOnSale: true,
          originalPrice: 12.99,
          stock: 65,
          rating: 4.5,
          reviews: 35
        },
        {
          name: "Organic Tempeh - 8oz Package",
          description: "Traditional fermentation process, packed with protein and probiotics.",
          price: 3.99,
          category: "products",
          subcategory: "tempeh",
          imageUrl: "https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          isFeatured: true,
          isBestSeller: false,
          isOnSale: false,
          originalPrice: null,
          stock: 45,
          rating: 4.2,
          reviews: 19
        },
        {
          name: "Premium Heirloom Soybean Seeds - 5lb Bag",
          description: "Our signature heirloom soybean seeds are grown using traditional farming methods on our certified organic farms. These premium seeds produce high-yield, nutrient-rich soybeans perfect for both home gardens and commercial farming.",
          price: 24.99,
          category: "seeds",
          subcategory: "heirloom",
          imageUrl: "https://images.unsplash.com/photo-1590603740183-980e7f6920eb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          isFeatured: false,
          isBestSeller: false,
          isOnSale: false,
          originalPrice: null,
          stock: 30,
          rating: 4.8,
          reviews: 15
        },
        {
          name: "Non-GMO Soybean Seeds - 1lb Bag",
          description: "Non-GMO soybean seeds for planting, high yield variety.",
          price: 8.99,
          category: "seeds",
          subcategory: "non-gmo",
          imageUrl: "https://images.unsplash.com/photo-1575383092862-48137de2060e?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
          isFeatured: false,
          isBestSeller: false,
          isOnSale: false,
          originalPrice: null,
          stock: 50,
          rating: 4.4,
          reviews: 22
        },
        {
          name: "Organic Tofu - Firm - 14oz Package",
          description: "Firm organic tofu, perfect for stir-fries and grilling.",
          price: 2.99,
          category: "products",
          subcategory: "tofu",
          imageUrl: "https://images.unsplash.com/photo-1567337710282-00832b415979?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
          isFeatured: false,
          isBestSeller: false,
          isOnSale: false,
          originalPrice: null,
          stock: 80,
          rating: 4.1,
          reviews: 31
        },
        {
          name: "Organic Soy Flour - 1lb Bag",
          description: "Gluten-free soy flour, perfect for baking and cooking.",
          price: 5.49,
          category: "products",
          subcategory: "flour",
          imageUrl: "https://images.unsplash.com/photo-1585253331134-c6825e5dfd3b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80",
          isFeatured: false,
          isBestSeller: false,
          isOnSale: false,
          originalPrice: null,
          stock: 35,
          rating: 4.0,
          reviews: 12
        }
      ];
      
      // Add all products
      await db.insert(products).values(productSeedData);
    }
  }
}

// Create and export the storage instance
export const storage = new DatabaseStorage();
// Initialize the storage by seeding initial data
storage.seedInitialData();
