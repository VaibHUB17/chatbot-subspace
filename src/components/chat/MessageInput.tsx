import React, { useState, useRef, useEffect } from 'react';
import { useMutation, useSubscription } from '@apollo/client';
import { Send, Loader2, Paperclip, Smile, Mic, AlertCircle } from 'lucide-react';
import { SEND_MESSAGE } from '../../graphql/mutations';
import { MESSAGES_SUBSCRIPTION } from '../../graphql/subscriptions';

interface MessageInputProps {
  chatId: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({ chatId }) => {
  const [message, setMessage] = useState('');
  const [sendMessage, { loading: sending }] = useMutation(SEND_MESSAGE);
  const [botIsReplying, setBotIsReplying] = useState(false);
  const [showRateLimit, setShowRateLimit] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Listen to new messages via subscription
  const { data: messagesData } = useSubscription(MESSAGES_SUBSCRIPTION, {
    variables: { chatId },
  });
  
  // Track when bot has replied to the message
  useEffect(() => {
    if (messagesData?.messages) {
      const messages = messagesData.messages;
      if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage.is_bot) {
          // Bot has replied, hide rate limit message and set bot is not replying
          setShowRateLimit(false);
          setBotIsReplying(false);
          
          // Clear any pending timeouts
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
        }
      }
    }
  }, [messagesData]);
  
  // Clean up all timeouts on component unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sending) return;

    const messageContent = message.trim();
    
    // Clear message immediately for better UX
    setMessage('');
    
    // Reset rate limit message
    setShowRateLimit(false);
    
    // Set bot is replying
    setBotIsReplying(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    try {
      await sendMessage({
        variables: {
          chatId,
          content: messageContent,
        },
      });
      
      // Set up a timeout to check if bot replied
      // If bot hasn't replied after 10 seconds, show the rate limit message
      timeoutRef.current = setTimeout(() => {
        if (botIsReplying) {
          setBotIsReplying(false);
          setShowRateLimit(true);
        }
      }, 10000);
      
    } catch (error) {
      console.error('Failed to send message:', error);
      // Restore message on error
      setMessage(messageContent);
      setBotIsReplying(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  return (
    <div className="border-t border-slate-200 bg-white p-4 flex-shrink-0">
      {/* Bot status messages */}
      {botIsReplying && (
        <div className="mb-2 text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs">
            <Loader2 className="h-3 w-3 mr-2 animate-spin" />
            Bot is replying...
          </div>
        </div>
      )}
      
      {/* Show rate limit message only when the bot didn't reply after action is complete */}
      {showRateLimit && (
        <div className="mb-2 text-center animate-fade-in">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-xs">
            <AlertCircle className="h-3 w-3 mr-2" />
            Chatbot hit rate limit. Please try again later.
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        {/* Additional Actions */}
        <div className="flex space-x-1">
          <button
            type="button"
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all duration-200"
            title="Attach file"
          >
            <Paperclip className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all duration-200"
            title="Add emoji"
          >
            <Smile className="h-5 w-5" />
          </button>
        </div>

        {/* Message Input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={sending}
            rows={1}
            className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none transition-all duration-200 text-sm"
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />
          
          {/* Voice Input Button */}
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-slate-400 hover:text-blue-600 transition-colors"
            title="Voice input"
          >
            <Mic className="h-4 w-4" />
          </button>
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!message.trim() || sending}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white p-3 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl flex items-center justify-center min-w-[48px]"
        >
          {sending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      </form>

      {/* Quick Actions */}
      <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
        <div className="flex space-x-4">
          <button className="hover:text-blue-600 transition-colors">Ask about...</button>
          <button className="hover:text-blue-600 transition-colors">Summarize</button>
          <button className="hover:text-blue-600 transition-colors">Explain</button>
        </div>
        <div className="flex items-center space-x-2">
          <span>Press Enter to send</span>
          <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
          <span>Shift + Enter for new line</span>
        </div>
      </div>
    </div>
  );
};