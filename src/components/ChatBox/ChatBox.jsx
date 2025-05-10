import React, { useState, useEffect, useRef } from 'react';
import axiosClient from '../../apis/axiosClient';
import { FaComment, FaTimes, FaPaperPlane } from 'react-icons/fa';
import './ChatBox.css';

const ChatBox = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]); // State for suggestions
  const messagesEndRef = useRef(null);
  const [userId, setUserId] = useState(null); // User ID to track conversations

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  // Generate a unique user ID on initial load
  useEffect(() => {
    const newUserId = Math.random().toString(36).substring(2, 15); // Simple random ID
    setUserId(newUserId);
  }, []);

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && chatHistory.length === 0) {
      setChatHistory([
        {
          sender: 'bot',
          text: 'Xin chào! Tôi có thể giúp bạn tìm kiếm sản phẩm hoặc kiểm tra đơn hàng. Bạn cần hỗ trợ gì hôm nay?',
          type: 'text',
        },
      ]);
      setSuggestions(['Tìm sản phẩm', 'Kiểm tra đơn hàng', 'Đặt hàng']); // Initial suggestions
    }
  }, [isOpen]);

  const handleSendMessage = async (selectedMessage) => {
    const userMessageText = selectedMessage || message;
    if (!userMessageText.trim() || isLoading || !userId) return;

    const userMessage = { sender: 'user', text: userMessageText, type: 'text' };
    setChatHistory((prev) => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      // Send message to backend AI service
      const response = await axiosClient.post('/chat', {
        message: userMessageText,
        userId: userId, // Include the user ID
      });

      // Process AI response
      if (response.intent === 'find_product' && response.data?.products) {
        const productList = response.data.products
          .map(
            (product) =>
              `<div class='product-item'>
            <img src='${product.image}' alt='${product.name}' class='product-image my-2'/>
            <div class='product-details'>
              <h4>${product.name}</h4>
              <p>Giá: ${product.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</p>
            </div>
          </div>`
          )
          .join('');

        setChatHistory((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: `Tôi tìm thấy các sản phẩm sau phù hợp:<br/>${productList}`,
            type: 'html',
          },
        ]);
      } else {
        setChatHistory((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: response.message,
            type: 'text',
          },
        ]);
      }

      // Update suggestions if provided in the response
      if (response.suggestions) {
        setSuggestions(response.suggestions);
      } else {
        setSuggestions([]); // Clear suggestions if none provided
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setChatHistory((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'Xin lỗi, đã xảy ra lỗi. Vui lòng thử lại sau.',
          type: 'text',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Floating chat button */}
      {!isOpen && (
        <button className="chat-toggle-button" onClick={toggleChat}>
          <FaComment className="chat-icon" />
        </button>
      )}

      {/* Chat container */}
      {isOpen && (
        <div className="chat-container">
          <div className="chat-header">
            <h3>IUH Store Assistant</h3>
            <button className="close-button" onClick={toggleChat}>
              <FaTimes />
            </button>
          </div>

          <div className="chat-content">
            <div className="chat-history">
              {chatHistory.map((chat, index) => (
                <React.Fragment key={index}>
                  {chat.type === 'text' && <div className={`chat-message ${chat.sender}`}>{chat.text}</div>}
                  {chat.type === 'html' && (
                    <div
                      className={`chat-message ${chat.sender}`}
                      dangerouslySetInnerHTML={{ __html: chat.text }}
                    ></div>
                  )}
                </React.Fragment>
              ))}
              {isLoading && (
                <div className="chat-message bot">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="chat-suggestions">
                {suggestions.map((suggestion, index) => (
                  <button key={index} className="suggestion-button" onClick={() => handleSendMessage(suggestion)}>
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            <div className="chat-input-container">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Hỏi về sản phẩm hoặc kiểm tra đơn hàng..."
                className="chat-input"
                disabled={isLoading}
              />
              <button onClick={() => handleSendMessage()} className="send-button" disabled={isLoading}>
                <FaPaperPlane className="send-icon" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBox;
