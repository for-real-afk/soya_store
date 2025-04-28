// Basic chatbot service with predefined responses and recommendations

// Predefined responses by category
const responses = {
  greetings: [
    "Hello! How can I help you today?",
    "Hi there! Welcome to Organic Beans. How may I assist you?",
    "Greetings! What can I help you with today?"
  ],
  orderStatus: [
    "I can help you check your order status. If you're logged in, I can see your recent orders. Otherwise, please provide your order number.",
    "To check your order status, I'll need your order number if you're not logged in.",
    "Let me look up your order for you. What's your order number?"
  ],
  products: [
    "We have a wide variety of organic soybean products. Is there something specific you're looking for?",
    "Our most popular products are our organic soybean seeds and soy milk products. Would you like more information?",
    "Our products are 100% organic and sustainably sourced. Would you like to see our featured items?"
  ],
  shipping: [
    "We typically ship orders within 1-2 business days. Delivery times vary by location.",
    "For domestic orders, shipping usually takes 3-5 business days. International shipping can take 1-2 weeks.",
    "Free shipping is available on orders over $50."
  ],
  returns: [
    "We have a 30-day return policy for unopened products.",
    "If you're not satisfied with your purchase, you can return it within 30 days for a full refund.",
    "To initiate a return, please go to your order history and select the 'Return' option."
  ],
  payments: [
    "We accept all major credit cards, PayPal, and bank transfers.",
    "Payment information is securely processed and we never store your full credit card details.",
    "If you're having issues with payment, please try refreshing the page or using a different payment method."
  ],
  contact: [
    "You can reach our customer service team at support@organicbeans.com or call us at 1-800-555-BEAN.",
    "Our customer service hours are Monday to Friday, 9am to 5pm EST.",
    "Would you like me to connect you with a human representative?"
  ],
  default: [
    "I'm not sure I understand. Could you please rephrase that?",
    "I'm still learning! Could you try asking in a different way?",
    "I don't have information on that topic yet. Would you like to ask something else?"
  ]
};

// Product recommendation data - in a real app, this would come from user behavior and purchase history
const productRecommendations = {
  seeds: [
    { id: 1, name: "Organic Soybean Seeds - Premium", category: "seeds" },
    { id: 2, name: "Non-GMO Edamame Seeds", category: "seeds" },
    { id: 3, name: "Black Soybean Seeds", category: "seeds" }
  ],
  milk: [
    { id: 4, name: "Organic Soy Milk - Unsweetened", category: "milk" },
    { id: 5, name: "Vanilla Soy Milk", category: "milk" },
    { id: 6, name: "Chocolate Soy Milk", category: "milk" }
  ],
  tofu: [
    { id: 7, name: "Extra Firm Tofu", category: "tofu" },
    { id: 8, name: "Silken Tofu", category: "tofu" },
    { id: 9, name: "Smoked Tofu", category: "tofu" }
  ],
  // Add other categories as needed
  popular: [
    { id: 1, name: "Organic Soybean Seeds - Premium", category: "seeds" },
    { id: 4, name: "Organic Soy Milk - Unsweetened", category: "milk" },
    { id: 7, name: "Extra Firm Tofu", category: "tofu" }
  ]
};

// Keywords to determine response category
const keywords = {
  greetings: ["hello", "hi", "hey", "greetings", "good morning", "good afternoon", "good evening"],
  orderStatus: ["order", "status", "tracking", "shipped", "delivery", "package", "where is"],
  products: ["product", "item", "soybean", "soymilk", "seed", "tofu", "tempeh", "edamame"],
  shipping: ["shipping", "ship", "delivery", "how long", "when will", "arrive"],
  returns: ["return", "refund", "exchange", "money back", "cancel"],
  payments: ["payment", "pay", "credit card", "paypal", "bank", "transaction"],
  contact: ["contact", "phone", "email", "talk to", "human", "representative", "help"]
};

// Helper function to get a random response from an array
const getRandomResponse = (array) => {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
};

// Process user input and determine response category
const categorizeInput = (input) => {
  const lowercaseInput = input.toLowerCase();
  
  // Check each category for matching keywords
  for (const [category, categoryKeywords] of Object.entries(keywords)) {
    for (const keyword of categoryKeywords) {
      if (lowercaseInput.includes(keyword)) {
        return category;
      }
    }
  }
  
  // If no categories match, return default
  return "default";
};

// Generate recommendations based on user input and/or browsing history
const generateRecommendations = (input, userHistory = null) => {
  const lowercaseInput = input.toLowerCase();
  
  // Check for category-specific keywords
  if (lowercaseInput.includes("seed") || lowercaseInput.includes("soybean")) {
    return productRecommendations.seeds;
  }
  if (lowercaseInput.includes("milk") || lowercaseInput.includes("drink")) {
    return productRecommendations.milk;
  }
  if (lowercaseInput.includes("tofu") || lowercaseInput.includes("protein")) {
    return productRecommendations.tofu;
  }
  
  // If no specific category is mentioned, return popular products
  return productRecommendations.popular;
};

// Get order status info - in a real app, this would check a real database
const getOrderStatus = (orderNumber, user = null) => {
  // Mock data for demonstration
  const mockOrders = {
    "ORD12345": { status: "shipped", estimatedDelivery: "April 30, 2025" },
    "ORD23456": { status: "processing", estimatedDelivery: "May 3, 2025" },
    "ORD34567": { status: "delivered", deliveryDate: "April 25, 2025" }
  };
  
  // Check if user is logged in
  if (user) {
    // In a real app, this would fetch the user's orders from the database
    return { 
      message: `Your most recent order is currently ${user.orders?.[0]?.status || 'being processed'}. 
                You have ${user.orders?.length || 0} orders in our system.` 
    };
  }
  
  // Check if order exists
  if (orderNumber && mockOrders[orderNumber]) {
    const order = mockOrders[orderNumber];
    if (order.status === "delivered") {
      return { 
        message: `Your order ${orderNumber} has been delivered on ${order.deliveryDate}.` 
      };
    } else {
      return { 
        message: `Your order ${orderNumber} is currently ${order.status}. 
                  Estimated delivery: ${order.estimatedDelivery}.` 
      };
    }
  }
  
  return { 
    message: "I couldn't find that order number. Please check and try again." 
  };
};

// Main function to get chatbot response
export const getChatbotResponse = (input, user = null) => {
  // Process order status requests with order number
  if (input.toLowerCase().includes("order") && input.toLowerCase().includes("status")) {
    // Extract potential order number (assuming format ORD followed by digits)
    const orderNumberMatch = input.match(/ORD\d+/i);
    if (orderNumberMatch) {
      const orderNumber = orderNumberMatch[0].toUpperCase();
      return getOrderStatus(orderNumber, user);
    }
    
    // If user is logged in but no order number provided
    if (user) {
      return getOrderStatus(null, user);
    }
    
    // If neither order number nor logged-in user
    return { 
      message: getRandomResponse(responses.orderStatus) 
    };
  }
  
  // Get response category
  const category = categorizeInput(input);
  
  // Get recommendations if input is product-related
  const recommendations = category === "products" ? generateRecommendations(input, user) : null;
  
  return {
    message: getRandomResponse(responses[category]),
    recommendations: recommendations
  };
};

// Export more functions if needed for specific features