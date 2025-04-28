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
      // Placeholder response when API key is not available
      response = {
        role: 'assistant',
        content: "Hello! I'm Bean Buddy, your friendly soybean assistant. I'm here to help with any questions about our organic products, orders, or growing advice. How can I assist you today? (Note: This is a placeholder response until the OpenAI API key is configured.)"
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