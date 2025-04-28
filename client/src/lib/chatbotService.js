import { apiRequest } from './queryClient';

// Function to get chatbot information (name, avatar, etc.)
export const getChatbotInfo = async () => {
  try {
    const response = await fetch('/api/chatbot/info');
    if (!response.ok) {
      throw new Error('Failed to fetch chatbot info');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching chatbot info:', error);
    // Return fallback info if API call fails
    return {
      name: "Bean Buddy",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=bean-buddy&backgroundColor=b6e3f4",
      isAvailable: true,
      description: "Your friendly soybean product assistant"
    };
  }
};

// Function to send a message to the chatbot and get a response
export const sendMessage = async (message, userId = null, orderId = null) => {
  try {
    const payload = {
      message,
      ...(userId ? { userId } : {}),
      ...(orderId ? { orderId } : {})
    };

    const response = await apiRequest('POST', '/api/chatbot/message', payload);
    const data = await response.json();
    
    return {
      message: data.response,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error sending message to chatbot:', error);
    
    // Fallback response if the API call fails
    return {
      message: "I'm having trouble connecting to my knowledge base right now. Please try again later or contact customer support for immediate assistance.",
      timestamp: new Date().toISOString(),
      error: true
    };
  }
};

// Function to get product recommendations
export const getRecommendations = async (options = {}) => {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (options.userId) queryParams.append('userId', options.userId);
    if (options.category) queryParams.append('category', options.category);
    if (options.limit) queryParams.append('limit', options.limit);
    
    const queryString = queryParams.toString();
    const url = `/api/recommendations${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch recommendations');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    // Return an empty array if API call fails
    return [];
  }
};