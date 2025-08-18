import React, { useEffect, useRef, useMemo, useState } from 'react';
import { useSubscription } from '@apollo/client';
import { Bot, User, Copy, ThumbsUp, ThumbsDown, ArrowDown } from 'lucide-react';
import { MESSAGES_SUBSCRIPTION } from '../../graphql/subscriptions';
import { Message } from '../../types';

interface MessageListProps {
  chatId: string;
}

export const MessageList: React.FC<MessageListProps> = ({ chatId }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const { data, loading } = useSubscription(MESSAGES_SUBSCRIPTION, {
    variables: { chatId },
  });

  const messages: Message[] = useMemo(() => {
    return data?.messages || [];
  }, [data?.messages]);

  // Check if we should show the scroll button
  useEffect(() => {
    const checkScrollPosition = () => {
      const container = scrollContainerRef.current;
      if (!container) return;
      
      const { scrollTop, scrollHeight, clientHeight } = container;
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

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      // Use a small timeout to ensure DOM has updated before scrolling
      const timeoutId = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        setShowScrollButton(false);
      }, 100);
      
      return () => clearTimeout(timeoutId);
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollButton(false);
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
        <div className="p-6 space-y-6 min-h-full">
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
                        <button className="p-1 bg-white rounded-full shadow-md hover:bg-green-50 transition-colors">
                          <ThumbsUp className="h-3 w-3 text-slate-600 hover:text-green-600" />
                        </button>
                        <button className="p-1 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors">
                          <ThumbsDown className="h-3 w-3 text-slate-600 hover:text-red-600" />
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
          <div ref={messagesEndRef} />
        </div>
      )}
      
      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-8 right-8 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Scroll to bottom"
        >
          <ArrowDown className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};