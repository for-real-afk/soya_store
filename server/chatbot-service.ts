import { Request, Response } from 'express';
import OpenAI from 'openai';
import { storage } from './storage';

// Initialize OpenAI API with the key from environment variables
// Note: The key will be added later
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-api-key-placeholder',
});

// System context for the chatbot
const SYSTEM_PROMPT = `
You are a helpful customer service assistant for an organic soybean e-commerce store called "Organic Beans".
Your name is "Bean Buddy" and your personality is friendly, helpful, and knowledgeable about organic soybeans and related products.

Be concise in your responses while being helpful. Focus on answering customer questions about:
1. Product information and recommendations for soybean seeds and products
2. Order status and shipping
3. Return policies (we accept returns within 30 days)
4. Growing advice for soybean seeds
5. Benefits of organic soybeans
6. Common issues with online orders

If asked about specific order details, you can access that information in the provided order data.
If you don't know something specific, be honest and suggest contacting human customer service at support@organicbeans.com.

Keep responses under 150 words unless detailed information is specifically requested.
`;

/**
 * Generate fallback responses without needing the OpenAI API
 * This provides a reasonable chatbot experience even without API key
 */
function generateFallbackResponse(message: string, userId?: number, contextData?: string): string {
  const lowerCaseMessage = message.toLowerCase();
  
  // Welcome / greeting messages
  if (lowerCaseMessage.includes('hello') || 
      lowerCaseMessage.includes('hi') || 
      lowerCaseMessage.includes('hey') ||
      lowerCaseMessage === '' ||
      lowerCaseMessage.includes('start')) {
    return "Hello! I'm Bean Buddy, your friendly soybean assistant. I'm here to help with any questions about our organic products, orders, or growing advice. How can I assist you today?";
  }
  
  // Order status questions
  if (lowerCaseMessage.includes('order') && 
      (lowerCaseMessage.includes('status') || lowerCaseMessage.includes('where') || lowerCaseMessage.includes('track'))) {
    if (userId) {
      return "I can see your order in our system. Your most recent order is currently being processed, and you should receive a shipping confirmation email within 2-3 business days. If you need immediate assistance, please contact our support team at support@organicbeans.com.";
    } else {
      return "To check your order status, please log in to your account or provide your order number. You can also contact our customer service team at support@organicbeans.com for assistance with tracking your order.";
    }
  }
  
  // Product recommendations
  if (lowerCaseMessage.includes('recommend') || 
      lowerCaseMessage.includes('suggest') ||
      lowerCaseMessage.includes('best') ||
      (lowerCaseMessage.includes('which') && lowerCaseMessage.includes('seed'))) {
    return "I'd recommend our Organic Soybean Seeds Premium Mix for beginners - they have excellent germination rates and are perfect for most growing conditions. For more experienced growers, our Heirloom Variety Pack offers unique flavors and higher yields. Check out our featured products section for customer favorites!";
  }
  
  // Growing advice
  if (lowerCaseMessage.includes('grow') || 
      lowerCaseMessage.includes('plant') ||
      lowerCaseMessage.includes('garden') ||
      lowerCaseMessage.includes('farm') ||
      lowerCaseMessage.includes('soil') ||
      lowerCaseMessage.includes('water')) {
    return "For growing soybeans, ensure you plant after the last frost in well-drained soil with plenty of sun. Space seeds about 2-4 inches apart in rows 24-30 inches apart. Water regularly but avoid waterlogging. Soybeans typically take 45-65 days to mature. We have detailed growing guides available on our website under the Resources section.";
  }
  
  // Return policy
  if (lowerCaseMessage.includes('return') || 
      lowerCaseMessage.includes('refund') || 
      lowerCaseMessage.includes('exchange') || 
      lowerCaseMessage.includes('money back')) {
    return "We offer a 30-day return policy on all unopened products. If you're not satisfied with your purchase, contact customer service at support@organicbeans.com to initiate the return process. Please note that shipping costs are non-refundable, and opened seed packages cannot be returned for food safety regulations.";
  }
  
  // Shipping information
  if (lowerCaseMessage.includes('shipping') || 
      lowerCaseMessage.includes('delivery') || 
      lowerCaseMessage.includes('arrive')) {
    return "We typically process orders within 1-2 business days. Standard shipping takes 3-5 business days within the continental US. We also offer expedited shipping options at checkout. International orders may take 7-14 business days depending on the destination. You'll receive tracking information via email once your order ships.";
  }
  
  // About organic benefits
  if (lowerCaseMessage.includes('organic') || 
      lowerCaseMessage.includes('benefits') ||
      lowerCaseMessage.includes('why') ||
      lowerCaseMessage.includes('better')) {
    return "Organic soybeans offer several benefits: they're grown without synthetic pesticides or fertilizers, have no GMOs, and are often higher in certain nutrients. Our organic farming practices support soil health, biodiversity, and sustainable agriculture. Many customers report better flavor and peace of mind knowing they're supporting environmentally responsible farming.";
  }
  
  // Contact info
  if (lowerCaseMessage.includes('contact') || 
      lowerCaseMessage.includes('speak') || 
      lowerCaseMessage.includes('human') ||
      lowerCaseMessage.includes('phone') ||
      lowerCaseMessage.includes('email')) {
    return "You can contact our customer service team at support@organicbeans.com or call us at (555) 123-4567 during business hours (Monday-Friday, 9am-5pm EST). We typically respond to emails within 24 hours on business days.";
  }
  
  // Pricing questions
  if (lowerCaseMessage.includes('price') || 
      lowerCaseMessage.includes('cost') || 
      lowerCaseMessage.includes('discount') ||
      lowerCaseMessage.includes('sale') ||
      lowerCaseMessage.includes('coupon')) {
    return "Our product prices range from $5.99 for small seed packets to $89.99 for bulk organic seeds. We regularly offer seasonal discounts and have a loyalty program that gives you 10% off after your third purchase. Sign up for our newsletter to receive special offers and promotions!";
  }
  
  // Default response if no patterns match
  return "Thanks for your message! I'm Bean Buddy, your friendly soybean assistant. I can help with product recommendations, growing tips, order status, and more. Could you please provide more details about what you're looking for so I can better assist you? Or you can contact our customer service team at support@organicbeans.com for specialized help.";
}

/**
 * Process a chat message and generate a response
 */
export async function processMessage(req: Request, res: Response) {
  try {
    const { message, userId, orderId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Context enrichment - gather relevant information based on the user's query
    let contextData = '';
    
    // If userId is provided, get user's orders
    if (userId) {
      try {
        const userOrders = await storage.getOrdersByUserId(Number(userId));
        if (userOrders && userOrders.length > 0) {
          contextData += `\nUser Order Information:\n${JSON.stringify(userOrders)}\n`;
        }
      } catch (error) {
        console.error('Error fetching user orders:', error);
      }
    }

    // If orderId is provided, get specific order details
    if (orderId) {
      try {
        const order = await storage.getOrderById(Number(orderId));
        if (order) {
          contextData += `\nSpecific Order Details:\n${JSON.stringify(order)}\n`;
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
      }
    }

    // Get featured products to provide product information
    try {
      const featuredProducts = await storage.getFeaturedProducts();
      if (featuredProducts && featuredProducts.length > 0) {
        contextData += `\nFeatured Products:\n${JSON.stringify(featuredProducts.slice(0, 5))}\n`;
      }
    } catch (error) {
      console.error('Error fetching featured products:', error);
    }

    // Create messages array for OpenAI
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT + contextData },
      { role: 'user', content: message }
    ];

    // When API key is added later, this will work
    // For now, return a placeholder response
    let response;
    
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-api-key-placeholder') {
      // Fallback response system when OpenAI API key is not available
      response = {
        role: 'assistant',
        content: generateFallbackResponse(message, userId, contextData)
      };
    } else {
      // Call OpenAI API when key is available
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o",  // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
          messages: messages as any,
          temperature: 0.7,
          max_tokens: 500,
        });
        
        response = completion.choices[0].message;
      } catch (error: any) {
        console.error('OpenAI API error:', error);
        return res.status(500).json({ error: `AI service error: ${error.message || 'Unknown error'}` });
      }
    }

    return res.status(200).json({ response: response.content });
  } catch (error: any) {
    console.error('Chat processing error:', error);
    return res.status(500).json({ error: `Server error: ${error.message || 'Unknown error'}` });
  }
}

/**
 * Get chatbot information
 */
export function getChatbotInfo(req: Request, res: Response) {
  return res.status(200).json({
    name: "Bean Buddy",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=bean-buddy&backgroundColor=b6e3f4",
    isAvailable: true,
    description: "Your friendly soybean product assistant"
  });
}