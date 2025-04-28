import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertOrderSchema, addressSchema, cartItemSchema } from "@shared/schema";
import express from "express";
import { z } from "zod";
import DOMPurify from "isomorphic-dompurify";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // GET products
  app.get("/api/products", async (_req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  // GET featured products
  app.get("/api/products/featured", async (_req, res) => {
    try {
      const products = await storage.getFeaturedProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured products" });
    }
  });

  // GET products by category
  app.get("/api/products/category/:category", async (req, res) => {
    try {
      const category = DOMPurify.sanitize(req.params.category);
      const products = await storage.getProductsByCategory(category);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products by category" });
    }
  });

  // GET product by ID
  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const product = await storage.getProductById(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // POST create a new user
  app.post("/api/users/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const sanitizedUser = {
        ...userData,
        username: DOMPurify.sanitize(userData.username),
        email: DOMPurify.sanitize(userData.email),
        name: userData.name ? DOMPurify.sanitize(userData.name) : undefined
      };
      
      const newUser = await storage.createUser(sanitizedUser);
      
      // Don't return the password
      const { password, ...userWithoutPassword } = newUser;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // POST login a user
  app.post("/api/users/login", async (req, res) => {
    try {
      const loginSchema = z.object({
        username: z.string(),
        password: z.string()
      });
      
      const loginData = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(loginData.username);
      if (!user || user.password !== loginData.password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Don't return the password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid login data", errors: error.errors });
      }
      res.status(500).json({ message: "Login failed" });
    }
  });

  // POST create a new order
  app.post("/api/orders", async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      
      // Validate address
      const addressValidation = addressSchema.safeParse(orderData.shippingAddress);
      if (!addressValidation.success) {
        return res.status(400).json({ 
          message: "Invalid shipping address", 
          errors: addressValidation.error.errors 
        });
      }
      
      // Validate cart items
      const cartItems = z.array(cartItemSchema).safeParse(orderData.items);
      if (!cartItems.success) {
        return res.status(400).json({ 
          message: "Invalid cart items", 
          errors: cartItems.error.errors 
        });
      }
      
      const newOrder = await storage.createOrder(orderData);
      res.status(201).json(newOrder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid order data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  // GET orders by user ID
  app.get("/api/users/:userId/orders", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const orders = await storage.getOrdersByUserId(userId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });
  
  // GET orders for current user (simplified route)
  app.get("/api/orders/user", async (req, res) => {
    try {
      // In a real app, we'd get the user ID from the JWT token
      // For now, we'll use a default user for testing
      const userId = 1; // Assume admin user for testing
      
      const orders = await storage.getOrdersByUserId(userId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user orders" });
    }
  });

  // GET all orders (admin only)
  app.get("/api/orders", async (req, res) => {
    try {
      // In a real app, we'd check if the user is an admin
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // PUT update order status (admin only)
  app.put("/api/orders/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }
      
      const statusSchema = z.object({
        status: z.string()
      });
      
      const { status } = statusSchema.parse(req.body);
      
      const updatedOrder = await storage.updateOrderStatus(id, status);
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(updatedOrder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid status data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update order status" });
    }
  });
  
  // PUT update product (admin only)
  app.put("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const productData = req.body;
      // Add sanitization for text fields
      if (productData.name) {
        productData.name = DOMPurify.sanitize(productData.name);
      }
      if (productData.description) {
        productData.description = DOMPurify.sanitize(productData.description);
      }
      if (productData.category) {
        productData.category = DOMPurify.sanitize(productData.category);
      }
      if (productData.subcategory) {
        productData.subcategory = DOMPurify.sanitize(productData.subcategory);
      }
      
      const updatedProduct = await storage.updateProduct(id, productData);
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(updatedProduct);
    } catch (error) {
      res.status(500).json({ message: "Failed to update product" });
    }
  });
  
  // DELETE product (admin only)
  app.delete("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const success = await storage.deleteProduct(id);
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });
  
  // GET all users (admin only)
  app.get("/api/users", async (_req, res) => {
    try {
      // In a real app, we'd check if the user is an admin
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
