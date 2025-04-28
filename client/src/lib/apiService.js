import { getApiUrl, API_ENDPOINTS } from './apiConfig';

// Generic API request function
const apiRequest = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies for session authentication
    });

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      
      // If the API returns an error message
      if (!response.ok) {
        throw new Error(data.message || 'An error occurred');
      }
      
      return data;
    } else {
      // For non-JSON responses
      if (!response.ok) {
        throw new Error('An error occurred');
      }
      
      return response.text();
    }
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// Product API methods
export const productApi = {
  // Get all products
  getProducts: () => {
    return apiRequest(getApiUrl(API_ENDPOINTS.products.list));
  },
  
  // Get a specific product by ID
  getProduct: (id) => {
    return apiRequest(getApiUrl(API_ENDPOINTS.products.details(id)));
  },
  
  // Get featured products
  getFeaturedProducts: () => {
    return apiRequest(getApiUrl(API_ENDPOINTS.products.featured));
  },
  
  // Get best selling products
  getBestSellerProducts: () => {
    return apiRequest(getApiUrl(API_ENDPOINTS.products.bestSellers));
  },
  
  // Get products by category
  getProductsByCategory: (category) => {
    return apiRequest(getApiUrl(API_ENDPOINTS.products.byCategory(category)));
  },
  
  // Search products
  searchProducts: (query) => {
    return apiRequest(getApiUrl(API_ENDPOINTS.products.search(query)));
  },
  
  // Create a new product (admin only)
  createProduct: (productData) => {
    return apiRequest(getApiUrl(API_ENDPOINTS.products.list), {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  },
  
  // Update a product (admin only)
  updateProduct: (id, productData) => {
    return apiRequest(getApiUrl(API_ENDPOINTS.products.details(id)), {
      method: 'PATCH',
      body: JSON.stringify(productData),
    });
  },
  
  // Delete a product (admin only)
  deleteProduct: (id) => {
    return apiRequest(getApiUrl(API_ENDPOINTS.products.details(id)), {
      method: 'DELETE',
    });
  },
};

// User/Auth API methods
export const authApi = {
  // Login user
  login: (credentials) => {
    return apiRequest(getApiUrl(API_ENDPOINTS.auth.login), {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },
  
  // Register new user
  register: (userData) => {
    return apiRequest(getApiUrl(API_ENDPOINTS.auth.register), {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
  
  // Logout user
  logout: () => {
    return apiRequest(getApiUrl(API_ENDPOINTS.auth.logout), {
      method: 'POST',
    });
  },
  
  // Get current user info
  getCurrentUser: () => {
    return apiRequest(getApiUrl(API_ENDPOINTS.auth.me));
  },
};

// Order API methods
export const orderApi = {
  // Get all orders (admin only)
  getOrders: () => {
    return apiRequest(getApiUrl(API_ENDPOINTS.orders.list));
  },
  
  // Get a specific order
  getOrder: (id) => {
    return apiRequest(getApiUrl(API_ENDPOINTS.orders.details(id)));
  },
  
  // Get current user's orders
  getMyOrders: () => {
    return apiRequest(getApiUrl(API_ENDPOINTS.orders.myOrders));
  },
  
  // Create a new order
  createOrder: (orderData) => {
    return apiRequest(getApiUrl(API_ENDPOINTS.orders.create), {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },
  
  // Update order status (admin only)
  updateOrderStatus: (id, status) => {
    return apiRequest(getApiUrl(API_ENDPOINTS.orders.updateStatus(id, status)), {
      method: 'PATCH',
    });
  },
};

// Notification API methods
export const notificationApi = {
  // Get all notifications for current user
  getNotifications: () => {
    return apiRequest(getApiUrl(API_ENDPOINTS.notifications.list));
  },
  
  // Get unread notification count
  getUnreadCount: () => {
    return apiRequest(getApiUrl(API_ENDPOINTS.notifications.unreadCount));
  },
  
  // Mark notifications as read
  markAsRead: (notificationIds) => {
    return apiRequest(getApiUrl(API_ENDPOINTS.notifications.markRead), {
      method: 'POST',
      body: JSON.stringify({ ids: notificationIds }),
    });
  },
};

export default {
  products: productApi,
  auth: authApi,
  orders: orderApi,
  notifications: notificationApi,
};