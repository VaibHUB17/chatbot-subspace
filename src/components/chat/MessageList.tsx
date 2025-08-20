import React, { useEffect, useRef, useMemo, useState } from 'react';
import { useSubscription } from '@apollo/client';
import { Bot, User, Copy, ThumbsUp, ThumbsDown, ArrowDown } from 'lucide-react';
import { MESSAGES_SUBSCRIPTION } from '../../graphql/subscriptions';
import { Message } from '../../types';

interface MessageListProps {
  chatId: string;
  userMessages?: Message[];
  botIsReplying?: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({ chatId, userMessages = [], botIsReplying = false }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [likedMessages, setLikedMessages] = useState<Record<string, boolean>>({});
  const [dislikedMessages, setDislikedMessages] = useState<Record<string, boolean>>({});
  const { data, loading } = useSubscription(MESSAGES_SUBSCRIPTION, {
    variables: { chatId },
  });

  // Combine bot messages from subscription with user messages from props
  const messages: Message[] = useMemo(() => {
    const botMessages = data?.messages || [];
    // Combine and sort all messages by creation time
    return [...botMessages, ...userMessages].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }, [data?.messages, userMessages]);

  // Check if we should show the scroll button
  useEffect(() => {
    const checkScrollPosition = () => {
      const container = scrollContainerRef.current;
      if (!container) return;
      
      const { scrollTop, scrollHeight, clientHeight } = container;
      // If we're more than 100px away from the bottom, show the scroll button
      const isNotAtBottom = scrollHeight - scrollTop - clientHeight > 100;
      setShowScrollButton(isNotAtBottom);
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      // Initial check
      checkScrollPosition();
      
      return () => container.removeEventListener('scroll', checkScrollPosition);
    }
  }, []);

  // Scroll to bottom on initial load
  useEffect(() => {
    if (messagesEndRef.current && messages.length > 0) {
      // Force immediate scroll on first load
      messagesEndRef.current.scrollIntoView();
    }
  }, [messages.length]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && messages.length > 0) {
      const container = scrollContainerRef.current;
      if (!container) return;
      
      // Check if we're already at the bottom before the new message
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
      
      // If we're at the bottom or it's the bot's message, auto-scroll
      const isLastMessageFromBot = messages.length > 0 && messages[messages.length - 1].is_bot;
      
      if (isAtBottom || isLastMessageFromBot) {
        // Use a small timeout to ensure DOM has updated before scrolling
        const timeoutId = setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          setShowScrollButton(false);
        }, 100);
        
        return () => clearTimeout(timeoutId);
      }
    }
  }, [messages]);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleLike = (messageId: string) => {
    setLikedMessages(prev => {
      const newState = { ...prev };
      newState[messageId] = !prev[messageId];
      
      // Remove dislike if it exists
      if (newState[messageId] && dislikedMessages[messageId]) {
        setDislikedMessages(prev => {
          const newDisliked = { ...prev };
          delete newDisliked[messageId];
          return newDisliked;
        });
      }
      
      return newState;
    });
  };

  const handleDislike = (messageId: string) => {
    setDislikedMessages(prev => {
      const newState = { ...prev };
      newState[messageId] = !prev[messageId];
      
      // Remove like if it exists
      if (newState[messageId] && likedMessages[messageId]) {
        setLikedMessages(prev => {
          const newLiked = { ...prev };
          delete newLiked[messageId];
          return newLiked;
        });
      }
      
      return newState;
    });
  };

  const scrollToBottom = () => {
    const container = scrollContainerRef.current;
    if (container) {
      // Smooth scroll to the bottom
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
      setShowScrollButton(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500 border-t-transparent"></div>
          <p className="text-slate-500">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-white scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent relative" ref={scrollContainerRef}>
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-sm mx-auto p-8">
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Bot className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Start the conversation!</h3>
            <p className="text-slate-500 text-sm">This is an AI Assistant for the Tech Related Question</p>
            <p className="text-slate-500 text-sm">Send a message with the AI assistant.</p>
          </div>
        </div>
      ) : (
        <div className="p-6 pb-2 space-y-6 min-h-full">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex items-start ${message.is_bot ? 'justify-start' : 'justify-end'} animate-fade-in`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Bot Message */}
              {message.is_bot && (
                <div className="flex items-start space-x-4 max-w-xs lg:max-w-md">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full flex items-center justify-center shadow-lg bg-gradient-to-r from-blue-500 to-purple-600">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  
                  {/* Message Content */}
                  <div className="group text-left">
                    <div className="relative px-6 py-4 rounded-2xl shadow-sm bg-slate-100 text-slate-900">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      
                      {/* Message Actions */}
                      <div className="absolute -bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1">
                        <button
                          onClick={() => copyToClipboard(message.content)}
                          className="p-1 bg-white rounded-full shadow-md hover:bg-slate-50 transition-colors"
                          title="Copy message"
                        >
                          <Copy className="h-3 w-3 text-slate-600" />
                        </button>
                        <button 
                          onClick={() => handleLike(message.id)} 
                          className={`p-1 ${likedMessages[message.id] ? 'bg-green-100' : 'bg-white'} rounded-full shadow-md hover:bg-green-50 transition-colors`}
                        >
                          <ThumbsUp className={`h-3 w-3 ${likedMessages[message.id] ? 'text-green-600' : 'text-slate-600 hover:text-green-600'}`} />
                        </button>
                        <button 
                          onClick={() => handleDislike(message.id)} 
                          className={`p-1 ${dislikedMessages[message.id] ? 'bg-red-100' : 'bg-white'} rounded-full shadow-md hover:bg-red-50 transition-colors`}
                        >
                          <ThumbsDown className={`h-3 w-3 ${dislikedMessages[message.id] ? 'text-red-600' : 'text-slate-600 hover:text-red-600'}`} />
                        </button>
                      </div>
                    </div>
                    
                    {/* Timestamp */}
                    <p className="text-xs mt-2 text-slate-500">
                      {formatTime(message.created_at)}
                    </p>
                  </div>
                </div>
              )}
              
              {/* User Message */}
              {!message.is_bot && (
                <div className="flex items-start flex-row-reverse space-x-4 space-x-reverse max-w-xs lg:max-w-md">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full flex items-center justify-center shadow-lg bg-gradient-to-r from-slate-600 to-slate-700">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  
                  {/* Message Content */}
                  <div className="group text-right">
                    <div className="relative px-6 py-4 rounded-2xl shadow-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    </div>
                    
                    {/* Timestamp */}
                    <p className="text-xs mt-2 text-slate-400">
                      {formatTime(message.created_at)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {/* Bot Typing Indicator */}
          {botIsReplying && (
            <div className="flex items-start justify-start animate-fade-in">
              <div className="flex items-start space-x-4 max-w-xs lg:max-w-md">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center shadow-lg bg-gradient-to-r from-blue-500 to-purple-600">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                </div>
                
                {/* Typing Indicator */}
                <div className="text-left">
                  <div className="relative px-6 py-4 rounded-2xl shadow-sm bg-slate-100 text-slate-900">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "300ms" }}></div>
                    </div>
                  </div>
                  
                  {/* "Bot is typing" text */}
                  <p className="text-xs mt-2 text-slate-500">
                    Bot is typing...
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      )}
      
      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-2 right-4 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 animate-bounce-soft"
          aria-label="Scroll to bottom"
        >
          <ArrowDown className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};