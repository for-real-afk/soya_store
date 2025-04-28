import { 
  users, type User, type InsertUser,
  products, type Product, type InsertProduct,
  orders, type Order, type InsertOrder
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private orders: Map<number, Order>;
  currentUserId: number;
  currentProductId: number;
  currentOrderId: number;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.currentUserId = 1;
    this.currentProductId = 1;
    this.currentOrderId = 1;
    this.seedData();
  }

  private seedData() {
    // Add an admin user
    this.createUser({
      username: "admin",
      password: "admin123",
      email: "admin@organicbeans.com",
      name: "Admin User"
    }).then(user => {
      // Update the admin status
      const adminUser = { ...user, isAdmin: true };
      this.users.set(user.id, adminUser);
    });

    // Seed products
    const productSeedData: InsertProduct[] = [
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
        stock: 75
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
        stock: 120
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
        stock: 65
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
        stock: 45
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
        stock: 30
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
        stock: 50
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
        stock: 80
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
        stock: 35
      }
    ];

    // Add all products
    productSeedData.forEach(product => {
      this.createProduct(product);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id, isAdmin: false };
    this.users.set(id, user);
    return user;
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProductById(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.category === category
    );
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.isFeatured
    );
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const newProduct: Product = { 
      ...product, 
      id,
      rating: Math.random() * 2 + 3, // Random rating between 3 and 5
      reviews: Math.floor(Math.random() * 50) + 5 // Random number of reviews
    };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<Product>): Promise<Product | undefined> {
    const existingProduct = this.products.get(id);
    if (!existingProduct) return undefined;
    
    const updatedProduct = { ...existingProduct, ...product };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  // Order methods
  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async getOrderById(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrdersByUserId(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.userId === userId
    );
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.currentOrderId++;
    const newOrder: Order = { 
      ...order, 
      id,
      createdAt: new Date() 
    };
    this.orders.set(id, newOrder);
    return newOrder;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const existingOrder = this.orders.get(id);
    if (!existingOrder) return undefined;
    
    const updatedOrder = { ...existingOrder, status };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }
}

export const storage = new MemStorage();
