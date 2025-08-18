import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Plus, MessageCircle, Calendar, Sparkles, Trash2, Edit3 } from 'lucide-react';
import { GET_CHATS } from '../../graphql/queries';
import { CREATE_CHAT } from '../../graphql/mutations';
import { Chat } from '../../types';
import { nhost } from '../../lib/nhost';

interface ChatListProps {
  selectedChatId?: string;
  onChatSelect: (chatId: string) => void;
}

export const ChatList: React.FC<ChatListProps> = ({ selectedChatId, onChatSelect }) => {
  const [newChatTitle, setNewChatTitle] = useState('');
  const [showNewChatForm, setShowNewChatForm] = useState(false);

  const { data, loading } = useQuery(GET_CHATS);
  const [createChat, { loading: creating }] = useMutation(CREATE_CHAT, {
    refetchQueries: [{ query: GET_CHATS }],
  });

  const handleCreateChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatTitle.trim()) return;

    try {
      const userId = nhost.auth.getUser()?.id;
      
      if (!userId) {
        console.error('No user ID found. User might not be authenticated.');
        return;
      }

      const result = await createChat({
        variables: { 
          title: newChatTitle.trim(),
          userId: userId
        }
      });
      
      if (result.data?.insert_chats_one) {
        onChatSelect(result.data.insert_chats_one.id);
        setNewChatTitle('');
        setShowNewChatForm(false);
      }
    } catch (error) {
      console.error('Failed to create chat:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
          <p className="text-slate-500 text-sm">Loading chats...</p>
        </div>
      </div>
    );
  }

  const chats: Chat[] = data?.chats || [];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* New Chat Section */}
      <div className="p-4 border-b border-slate-200 flex-shrink-0">
        {!showNewChatForm ? (
          <button
            onClick={() => setShowNewChatForm(true)}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02] shadow-lg flex items-center justify-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Chat</span>
            <Sparkles className="h-4 w-4" />
          </button>
        ) : (
          <form onSubmit={handleCreateChat} className="space-y-3">
            <input
              type="text"
              value={newChatTitle}
              onChange={(e) => setNewChatTitle(e.target.value)}
              placeholder="Enter chat title..."
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200"
              autoFocus
            />
            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={creating || !newChatTitle.trim()}
                className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowNewChatForm(false);
                  setNewChatTitle('');
                }}
                className="flex-1 bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-300 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
        {chats.length === 0 ? (
          <div className="p-6 text-center">
            <div className="bg-slate-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <MessageCircle className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="font-medium text-slate-900 mb-2">No chats yet</h3>
            <p className="text-sm text-slate-500">Create your first chat to get started</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={`group relative rounded-xl transition-all duration-200 ${
                  selectedChatId === chat.id
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500 shadow-sm'
                    : 'hover:bg-slate-50'
                }`}
              >
                <button
                  onClick={() => onChatSelect(chat.id)}
                  className="w-full p-4 text-left"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className={`w-2 h-2 rounded-full ${
                          selectedChatId === chat.id ? 'bg-blue-500' : 'bg-slate-300'
                        }`}></div>
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {chat.title}
                        </p>
                      </div>
                      <div className="flex items-center text-xs text-slate-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(chat.created_at)}
                      </div>
                    </div>
                  </div>
                </button>
                
                {/* Chat Actions */}
                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1">
                  <button className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                    <Edit3 className="h-3 w-3" />
                  </button>
                  <button className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};