// API Configuration Settings
// This file provides a central place to configure API endpoints

// Set this to true to use the Django backend, false to use the original Express backend
export const USE_DJANGO_API = false;

// Base API paths
export const EXPRESS_API_BASE = '/api';
export const DJANGO_API_BASE = '/api/django';

// Get the appropriate API base based on the current configuration
export const getApiBase = () => {
  return USE_DJANGO_API ? DJANGO_API_BASE : EXPRESS_API_BASE;
};

// Helper function to get the full API path for a given endpoint
export const getApiPath = (endpoint) => {
  return `${getApiBase()}${endpoint}`;
};

// API endpoints configuration
// Different endpoints for Express and Django
export const EXPRESS_ENDPOINTS = {
  // Auth endpoints
  auth: {
    login: '/users/login',
    register: '/users/register',
    logout: '/users/logout',
    me: '/users/me',
  },
  
  // Product endpoints
  products: {
    list: '/products',
    details: (id) => `/products/${id}`,
    featured: '/products/featured',
    bestSellers: '/products/bestsellers',
    byCategory: (category) => `/products/category?category=${category}`,
    search: (query) => `/products/search?q=${query}`,
  },
  
  // Order endpoints
  orders: {
    list: '/orders',
    details: (id) => `/orders/${id}`,
    myOrders: '/orders/user',
    create: '/orders',
    updateStatus: (id, status) => `/orders/${id}/status/${status}`,
  },
  
  // Notification endpoints
  notifications: {
    list: '/notifications',
    unreadCount: '/notifications/unread-count',
    markRead: '/notifications/mark-read',
  },
};

export const DJANGO_ENDPOINTS = {
  // Auth endpoints
  auth: {
    login: '/api/auth/login/',
    register: '/api/auth/register/',
    logout: '/api/auth/logout/',
    me: '/api/users/me/',
  },
  
  // Product endpoints
  products: {
    list: '/api/products/',
    details: (id) => `/api/products/${id}/`,
    featured: '/api/products/featured/',
    bestSellers: '/api/products/bestsellers/',
    byCategory: (category) => `/api/products/category/?category=${category}`,
    search: (query) => `/api/products/search/?q=${query}`,
  },
  
  // Order endpoints
  orders: {
    list: '/api/orders/',
    details: (id) => `/api/orders/${id}/`,
    myOrders: '/api/orders/my/',
    create: '/api/orders/',
    updateStatus: (id) => `/api/orders/${id}/status/`,
  },
  
  // Notification endpoints
  notifications: {
    list: '/api/notifications/',
    unreadCount: '/api/notifications/unread-count/',
    markRead: '/api/notifications/mark-read/',
  },
};

// Use the appropriate endpoints based on configuration
export const API_ENDPOINTS = USE_DJANGO_API ? DJANGO_ENDPOINTS : EXPRESS_ENDPOINTS;

// Helper function to get the full API URL for a specific endpoint
export const getApiUrl = (endpointPath) => {
  // For Django endpoints, they already include the /api/ prefix
  if (USE_DJANGO_API) {
    return `${DJANGO_API_BASE}${endpointPath}`;
  } else {
    return `${EXPRESS_API_BASE}${endpointPath}`;
  }
};

// Example usage:
// import { getApiUrl, API_ENDPOINTS } from '@/lib/apiConfig';
// 
// const loginUrl = getApiUrl(API_ENDPOINTS.auth.login);
// const productDetailsUrl = getApiUrl(API_ENDPOINTS.products.details(123));