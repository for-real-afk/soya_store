import React, { useState, useRef, useEffect } from 'react';
import { FaComments, FaTimes, FaPaperPlane } from 'react-icons/fa';
import { getChatbotResponse } from '../lib/chatbotService';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const Chatbot = () => {
  // Get authenticated user if available
  const { user } = useAuth();
  const { t } = useLanguage();
  
  // State
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [recommendations, setRecommendations] = useState([]);

  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to the bottom of the messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Add welcome message when the chat is first opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = {
        sender: 'bot',
        text: t('howCanIHelp'),
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
    if (isOpen) {
      // Focus on input when chat is opened
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, t]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Toggle chat window
  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  // Send a message
  const sendMessage = () => {
    if (input.trim() === '') return;

    // Add user message
    const userMessage = {
      sender: 'user',
      text: input,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    
    // Process input and get response
    const response = getChatbotResponse(input, user);
    
    // Set recommendations if any
    if (response.recommendations) {
      setRecommendations(response.recommendations);
    }

    // Add bot response with a small delay to mimic thinking
    setTimeout(() => {
      const botMessage = {
        sender: 'bot',
        text: response.message,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    }, 600);

    // Clear input
    setInput('');
  };

  // Handle input keypress
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  // Format timestamp
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Handle recommendation click
  const handleRecommendationClick = (product) => {
    // This would navigate to the product page in a real app
    const botMessage = {
      sender: 'bot',
      text: `You might like ${product.name}. Would you like more details?`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, botMessage]);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Chat toggle button */}
      <button
        onClick={toggleChat}
        className="bg-green-600 hover:bg-green-700 text-white rounded-full p-4 shadow-lg flex items-center justify-center"
        aria-label="Chat with us"
      >
        {isOpen ? <FaTimes size={20} /> : <FaComments size={20} />}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 sm:w-96 h-96 bg-white rounded-lg shadow-xl flex flex-col border border-gray-200">
          {/* Header */}
          <div className="bg-green-600 text-white p-3 rounded-t-lg">
            <h3 className="font-medium">{t('chatWithUs')}</h3>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-2 ${
                    message.sender === 'user'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p>{message.text}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender === 'user' ? 'text-green-100' : 'text-gray-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="p-2 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">{t('recommendations')}</p>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {recommendations.map(product => (
                  <button
                    key={product.id}
                    onClick={() => handleRecommendationClick(product)}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm whitespace-nowrap"
                  >
                    {product.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-gray-200 flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('typeMessage')}
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={sendMessage}
              className="ml-2 bg-green-600 hover:bg-green-700 text-white rounded-full p-2"
              aria-label="Send message"
            >
              <FaPaperPlane size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;