import { pgTable, text, serial, integer, boolean, timestamp, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User roles enum
export const USER_ROLES = {
  ADMIN: "admin",
  SEED_MANAGER: "seed_manager",
  PRODUCT_MANAGER: "product_manager",
  CUSTOMER: "customer"
} as const;

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  name: text("name"),
  isAdmin: boolean("is_admin").default(false),
  role: text("role").notNull().default(USER_ROLES.CUSTOMER),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: real("price").notNull(),
  category: text("category").notNull(),
  subcategory: text("subcategory"),
  imageUrl: text("image_url").notNull(),
  rating: real("rating"),
  reviews: integer("reviews").default(0),
  isFeatured: boolean("is_featured").default(false),
  isBestSeller: boolean("is_best_seller").default(false),
  isOnSale: boolean("is_on_sale").default(false),
  originalPrice: real("original_price"),
  stock: integer("stock").default(0),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  status: text("status").notNull(),
  total: real("total").notNull(),
  items: jsonb("items").notNull(),
  shippingAddress: jsonb("shipping_address").notNull(),
  paymentMethod: text("payment_method").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  name: true,
  role: true,
});

export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  description: true,
  price: true,
  category: true,
  subcategory: true,
  imageUrl: true,
  isFeatured: true,
  isBestSeller: true,
  isOnSale: true,
  originalPrice: true,
  stock: true,
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  userId: true,
  status: true,
  total: true,
  items: true,
  shippingAddress: true,
  paymentMethod: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

// Address schema for order
export const addressSchema = z.object({
  fullName: z.string().min(3, "Full name is required"),
  addressLine1: z.string().min(5, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  postalCode: z.string().min(5, "Postal code is required"),
  country: z.string().min(2, "Country is required"),
  phone: z.string().min(10, "Phone number is required"),
});

export type Address = z.infer<typeof addressSchema>;

// Cart item schema
export const cartItemSchema = z.object({
  productId: z.number(),
  quantity: z.number().min(1),
  name: z.string(),
  price: z.number(),
  imageUrl: z.string(),
});

export type CartItem = z.infer<typeof cartItemSchema>;
