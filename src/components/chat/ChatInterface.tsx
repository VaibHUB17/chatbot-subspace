import React, { useState } from 'react';
import { useSignOut, useUserData } from '@nhost/react';
import { LogOut, Menu, X, Settings, Plus, Search } from 'lucide-react';
import { ChatList } from './ChatList';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';

export const ChatInterface: React.FC = () => {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { signOut } = useSignOut();
  const user = useUserData();
  
  // Set vh custom property for mobile browsers
  React.useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setVh();
    window.addEventListener('resize', setVh);
    
    return () => window.removeEventListener('resize', setVh);
  }, []);

  const handleChatSelect = (chatId: string) => {
    setSelectedChatId(chatId);
    setSidebarOpen(false);
  };

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden" style={{ height: 'calc(var(--vh, 1vh) * 100)' }}>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-2xl transform transition-all duration-300 ease-out
        md:relative md:translate-x-0 border-r border-slate-200 flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-purple-50 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">AI</span>
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-lg">ChatBot AI</h1>
              <p className="text-xs text-slate-500 truncate max-w-32">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={signOut}
              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg md:hidden transition-all duration-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <ChatList
            selectedChatId={selectedChatId || undefined}
            onChatSelect={handleChatSelect}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg md:hidden transition-all duration-200"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                {selectedChatId ? 'Chat Conversation' : 'Welcome Back!'}
              </h2>
              <p className="text-sm text-slate-500">
                {selectedChatId ? 'AI-powered conversation' : 'Select a chat to get started'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all duration-200">
              <Search className="h-5 w-5" />
            </button>
            <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all duration-200">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Chat area */}
        {selectedChatId ? (
          <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
            <div className="flex-1 overflow-hidden">
              <MessageList chatId={selectedChatId} />
            </div>
            <MessageInput chatId={selectedChatId} />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
            <div className="text-center max-w-md mx-auto p-8">
              <div className="h-24 w-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <span className="text-white font-bold text-2xl">AI</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Ready to Chat?</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                THIS is an AI Assistant for the Tech Related Question
                Select an existing conversation from the sidebar or create a new chat to start talking with our AI assistant.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg">
                  <Plus className="h-4 w-4 inline mr-2" />
                  New Chat
                </button>
                <button className="bg-white text-slate-700 px-6 py-3 rounded-xl font-medium hover:bg-slate-50 transition-all duration-200 border border-slate-200 shadow-sm">
                  Browse Chats
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};