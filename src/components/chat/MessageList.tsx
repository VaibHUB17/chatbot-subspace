import React, { useEffect, useRef, useMemo } from 'react';
import { useSubscription } from '@apollo/client';
import { Bot, User, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import { MESSAGES_SUBSCRIPTION } from '../../graphql/subscriptions';
import { Message } from '../../types';

interface MessageListProps {
  chatId: string;
}

export const MessageList: React.FC<MessageListProps> = ({ chatId }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data, loading } = useSubscription(MESSAGES_SUBSCRIPTION, {
    variables: { chatId },
  });

  const messages: Message[] = useMemo(() => {
    return data?.messages || [];
  }, [data?.messages]);

  useEffect(() => {
    if (messagesEndRef.current) {
      // Use a small timeout to ensure DOM has updated before scrolling
      const timeoutId = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    <div className="flex-1 overflow-y-auto bg-white scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-sm mx-auto p-8">
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Bot className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Start the conversation!</h3>
            <p className="text-slate-500 text-sm">Send a message to begin chatting with the AI assistant.</p>
          </div>
        </div>
      ) : (
        <div className="p-6 space-y-6 min-h-full">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex items-start space-x-4 ${
                message.is_bot ? 'justify-start' : 'justify-end flex-row-reverse space-x-reverse'
              } animate-fade-in`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center shadow-lg ${
                  message.is_bot 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
                    : 'bg-gradient-to-r from-slate-600 to-slate-700'
                }`}>
                  {message.is_bot ? (
                    <Bot className="h-5 w-5 text-white" />
                  ) : (
                    <User className="h-5 w-5 text-white" />
                  )}
                </div>
              </div>
              
              {/* Message Content */}
              <div className={`group max-w-xs lg:max-w-md ${
                message.is_bot ? 'text-left' : 'text-right'
              }`}>
                <div className={`relative px-6 py-4 rounded-2xl shadow-sm ${
                  message.is_bot
                    ? 'bg-slate-100 text-slate-900'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  
                  {/* Message Actions */}
                  {message.is_bot && (
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
                  )}
                </div>
                
                {/* Timestamp */}
                <p className={`text-xs mt-2 ${
                  message.is_bot ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  {formatTime(message.created_at)}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
};