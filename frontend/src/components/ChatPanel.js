import React, { useState, useRef, useEffect } from 'react';
import './ChatPanel.css';

const ChatPanel = ({ messages, onSendMessage }) => {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      onSendMessage(inputMessage);
      setInputMessage('');
    }
  };

  const formatMessage = (message) => {
    switch (message.type) {
      case 'chat':
        return { className: 'chat-message', prefix: '💬' };
      case 'system':
        return { className: 'system-message', prefix: '🔔' };
      default:
        return { className: 'info-message', prefix: 'ℹ️' };
    }
  };

  return (
    <div className="chat-panel">
      <h3>消息面板</h3>
      
      <div className="messages-container">
        {messages.map((message) => {
          const { className, prefix } = formatMessage(message);
          return (
            <div key={message.id} className={`message ${className}`}>
              <span className="message-time">{message.timestamp}</span>
              <span className="message-prefix">{prefix}</span>
              <span className="message-text">{message.text}</span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="message-input-form">
        <div className="input-group">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="输入聊天信息..."
            maxLength={200}
          />
          <button type="submit" disabled={!inputMessage.trim()}>
            发送
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPanel;
