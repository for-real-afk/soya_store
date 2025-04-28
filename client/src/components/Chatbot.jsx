import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getChatbotInfo, sendMessage, getRecommendations } from '@/lib/chatbotService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, X, Send, ThumbsUp, ThumbsDown, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Chatbot = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [conversation, setConversation] = useState([]);
  const [chatbotInfo, setChatbotInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch chatbot info on component mount
  useEffect(() => {
    const fetchChatbotInfo = async () => {
      try {
        const info = await getChatbotInfo();
        setChatbotInfo(info);
        
        // Add welcome message
        setConversation([{
          sender: 'bot',
          message: `Hi there! I'm ${info.name}, your friendly assistant. How can I help you today?`,
          timestamp: new Date().toISOString()
        }]);
      } catch (error) {
        console.error('Error fetching chatbot info:', error);
        toast({
          variant: 'destructive',
          title: 'Chatbot Error',
          description: 'Could not connect to the chatbot service. Please try again later.'
        });
      }
    };
    
    fetchChatbotInfo();
  }, [toast]);

  // Scroll to bottom whenever conversation updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle sending a message
  const handleSendMessage = async () => {
    // Don't send empty messages
    if (!inputMessage.trim()) return;
    
    // Add user message to conversation
    const userMessage = {
      sender: 'user',
      message: inputMessage,
      timestamp: new Date().toISOString()
    };
    
    setConversation(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    
    try {
      // Send message to API
      const response = await sendMessage(
        inputMessage, 
        user?.id || null,
        null // orderId not needed for general conversations
      );
      
      // Add bot response to conversation
      const botResponse = {
        sender: 'bot',
        message: response.message,
        timestamp: response.timestamp || new Date().toISOString()
      };
      
      setConversation(prev => [...prev, botResponse]);
      
      // Get recommendations if the conversation is about products
      if (inputMessage.toLowerCase().includes('product') || 
          inputMessage.toLowerCase().includes('recommend') ||
          inputMessage.toLowerCase().includes('seed') ||
          inputMessage.toLowerCase().includes('soy')) {
        try {
          const recs = await getRecommendations({
            userId: user?.id,
            limit: 3
          });
          setRecommendations(recs);
        } catch (error) {
          console.error('Error fetching recommendations:', error);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message to conversation
      const errorMessage = {
        sender: 'bot',
        message: "I'm having some trouble connecting right now. Please try again later or contact our support team if you need immediate assistance.",
        timestamp: new Date().toISOString(),
        isError: true
      };
      
      setConversation(prev => [...prev, errorMessage]);
      
      toast({
        variant: 'destructive',
        title: 'Message Error',
        description: 'Could not send your message. Please try again later.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Render each message in the conversation
  const renderMessage = (msg, index) => {
    const isBot = msg.sender === 'bot';
    
    return (
      <div 
        key={index} 
        className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-3`}
      >
        <div 
          className={`px-4 py-2 rounded-lg max-w-[80%] ${
            isBot 
              ? 'bg-gray-100 text-gray-800 rounded-tl-none' 
              : 'bg-primary text-primary-foreground rounded-tr-none'
          } ${msg.isError ? 'border-red-300 border' : ''}`}
        >
          {msg.message}
          {isBot && (
            <div className="flex mt-1 text-xs text-gray-500 justify-end">
              <Button variant="ghost" size="icon" className="h-5 w-5">
                <ThumbsUp className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="icon" className="h-5 w-5">
                <ThumbsDown className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render recommendations if available
  const renderRecommendations = () => {
    if (!recommendations || recommendations.length === 0) return null;
    
    return (
      <div className="mt-2 mb-4">
        <div className="text-sm font-medium mb-2">You might be interested in:</div>
        <div className="flex flex-col space-y-2">
          {recommendations.map((item, i) => (
            <a 
              key={i} 
              href={`/products/${item.id}`} 
              className="flex items-center px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <span className="flex-1">{item.name}</span>
              <ExternalLink className="h-4 w-4 text-gray-400" />
            </a>
          ))}
        </div>
      </div>
    );
  };

  if (!chatbotInfo) return null;
  
  return (
    <>
      {/* Chat toggle button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 rounded-full p-3 shadow-lg z-50"
        size="icon"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>
      
      {/* Chat window */}
      {isOpen && (
        <Card className="fixed bottom-20 right-4 w-80 sm:w-96 shadow-xl z-40 overflow-hidden border-primary border-t-4">
          {/* Chat header */}
          <div className="bg-primary text-primary-foreground p-3 flex justify-between items-center">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full overflow-hidden mr-2">
                <img 
                  src={chatbotInfo.avatar} 
                  alt={chatbotInfo.name} 
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <div className="font-medium">{chatbotInfo.name}</div>
                <div className="text-xs opacity-90">
                  {chatbotInfo.isAvailable ? 'Online' : 'Offline'}
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-primary-foreground hover:bg-primary/90"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Chat messages */}
          <ScrollArea className="h-80">
            <CardContent className="p-3">
              {conversation.map(renderMessage)}
              {renderRecommendations()}
              <div ref={messagesEndRef} />
              
              {/* Typing indicator */}
              {isLoading && (
                <div className="flex justify-start mb-3">
                  <div className="px-4 py-2 bg-gray-100 rounded-lg rounded-tl-none">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" 
                           style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" 
                           style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" 
                           style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </ScrollArea>
          
          {/* Chat input */}
          <div className="p-3 border-t">
            <div className="flex space-x-2">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                disabled={isLoading}
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={!inputMessage.trim() || isLoading}
                variant="outline"
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-xs text-gray-500 mt-1 text-center">
              Powered by AI - Responses may not always be accurate
            </div>
          </div>
        </Card>
      )}
    </>
  );
};

export default Chatbot;