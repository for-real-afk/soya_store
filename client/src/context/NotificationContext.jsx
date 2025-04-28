import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Fetch user's orders to check for notifications
  const { data: orders = [], isSuccess } = useQuery({
    queryKey: ['/api/orders/user', user?.id],
    enabled: !!user,
    refetchInterval: 30000, // Poll every 30 seconds for updates
  });
  
  // Check for order status changes and create notifications
  useEffect(() => {
    if (isSuccess && user) {
      const unreadNotifications = [];
      
      // Check if there are any orders with updates
      // In a real app, we'd store the last viewed status and compare with current
      orders.forEach(order => {
        // Create status-specific notification text
        let statusDescription = '';
        let statusTitle = '';
        
        switch(order.status) {
          case 'pending':
            statusTitle = 'Order Received';
            statusDescription = 'Your order has been received and is awaiting processing.';
            break;
          case 'processing':
            statusTitle = 'Order Processing';
            statusDescription = 'Your order is being processed! We\'ll let you know when it ships.';
            break;
          case 'shipped':
            statusTitle = 'Order Shipped';
            statusDescription = 'Great news! Your order is on its way to you.';
            break;
          case 'delivered':
            statusTitle = 'Order Delivered';
            statusDescription = 'Your order has been delivered! Enjoy your products.';
            break;
          case 'cancelled':
            statusTitle = 'Order Cancelled';
            statusDescription = 'Your order has been cancelled. Please contact us for any questions.';
            break;
          default:
            statusTitle = 'Order Update';
            statusDescription = `Your order status has been updated to ${order.status}`;
        }
        
        const notification = {
          id: `order-${order.id}-${order.status}`,
          title: `${statusTitle} - Order #${order.id}`,
          description: statusDescription,
          timestamp: new Date(order.updatedAt || order.createdAt),
          read: false,
          type: 'order_update',
          orderId: order.id,
          status: order.status
        };
        
        unreadNotifications.push(notification);
      });
      
      if (unreadNotifications.length > 0) {
        setNotifications(prev => {
          // Merge with existing notifications, avoiding duplicates by ID
          const existingIds = new Set(prev.map(n => n.id));
          const newNotifications = unreadNotifications.filter(n => !existingIds.has(n.id));
          
          // Show toast for new notifications
          newNotifications.forEach(notification => {
            toast({
              title: notification.title,
              description: notification.description,
              duration: 5000,
            });
          });
          
          return [...newNotifications, ...prev];
        });
      }
    }
  }, [isSuccess, orders, user, toast]);
  
  // Update unread count whenever notifications change
  useEffect(() => {
    const count = notifications.filter(n => !n.read).length;
    setUnreadCount(count);
  }, [notifications]);
  
  // Mark notification as read
  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };
  
  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };
  
  // Clear a notification
  const removeNotification = (notificationId) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
  };
  
  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
  };
  
  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications
  };
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}