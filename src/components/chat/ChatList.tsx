import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Plus, MessageCircle, Calendar, Sparkles, Trash2, Edit3, Loader2, AlertCircle, X } from 'lucide-react';
import { GET_CHATS } from '../../graphql/queries';
import { CREATE_CHAT, UPDATE_CHAT_TITLE, DELETE_CHAT } from '../../graphql/mutations';
import { Chat } from '../../types';
import { nhost } from '../../lib/nhost';

interface ChatListProps {
  selectedChatId?: string;
  onChatSelect: (chatId: string) => void;
}

export const ChatList: React.FC<ChatListProps> = ({ selectedChatId, onChatSelect }) => {
  const [newChatTitle, setNewChatTitle] = useState('');
  const [showNewChatForm, setShowNewChatForm] = useState(false);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editedChatTitle, setEditedChatTitle] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState<{show: boolean; chatId: string; title: string} | null>(null);

  const { data, loading } = useQuery(GET_CHATS);
  const [createChat, { loading: creating }] = useMutation(CREATE_CHAT, {
    refetchQueries: [{ query: GET_CHATS }],
  });
  const [updateChatTitle, { loading: updating }] = useMutation(UPDATE_CHAT_TITLE, {
    refetchQueries: [{ query: GET_CHATS }],
  });
  const [deleteChat, { loading: deleting }] = useMutation(DELETE_CHAT, {
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

  const handleEditChatTitle = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editedChatTitle.trim() || !editingChatId) return;

    try {
      const result = await updateChatTitle({
        variables: {
          id: editingChatId,
          title: editedChatTitle.trim()
        }
      });

      if (result.data?.update_chats_by_pk) {
        setEditingChatId(null);
        setEditedChatTitle('');
      }
    } catch (error) {
      console.error('Failed to update chat title:', error);
    }
  };

  const handleStartEditing = (chat: Chat, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditedChatTitle(chat.title);
  };

  const handleCancelEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(null);
    setEditedChatTitle('');
  };

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const chatToDelete = chats.find(chat => chat.id === chatId);
    if (chatToDelete) {
      setDeleteConfirmation({
        show: true,
        chatId: chatToDelete.id,
        title: chatToDelete.title
      });
    }
  };

  const confirmDeleteChat = async () => {
    if (!deleteConfirmation) return;
    
    try {
      await deleteChat({
        variables: { id: deleteConfirmation.chatId }
      });
      
      // If the deleted chat was selected, clear the selection
      if (selectedChatId === deleteConfirmation.chatId) {
        onChatSelect('');
      }
      
      // Close the confirmation dialog
      setDeleteConfirmation(null);
    } catch (error) {
      console.error('Failed to delete chat:', error);
    }
  };

  const cancelDeleteChat = () => {
    setDeleteConfirmation(null);
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
                {editingChatId === chat.id ? (
                  <form onSubmit={handleEditChatTitle} className="p-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={editedChatTitle}
                        onChange={(e) => setEditedChatTitle(e.target.value)}
                        className="flex-1 px-2 py-1 text-sm border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                      <button
                        type="submit"
                        className="p-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                        disabled={updating || !editedChatTitle.trim()}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditChatTitle();
                        }}
                      >
                        {updating ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Save'}
                      </button>
                      <button
                        type="button"
                        className="p-1 text-xs bg-slate-200 text-slate-700 rounded hover:bg-slate-300"
                        onClick={handleCancelEditing}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
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
                      <button 
                        className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                        onClick={(e) => handleStartEditing(chat, e)}
                      >
                        <Edit3 className="h-3 w-3" />
                      </button>
                      <button 
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                        onClick={(e) => handleDeleteChat(chat.id, e)}
                        disabled={deleting}
                      >
                        {deleting && selectedChatId === chat.id ? (
                          <Loader2 className="h-3 w-3 animate-spin text-red-500" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Delete Confirmation Dialog */}
      {deleteConfirmation && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={cancelDeleteChat}
        >
          <div 
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-fade-in"
            onClick={(e) => e.stopPropagation()} // Prevent clicks inside the modal from closing it
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">Delete Chat</h3>
              <button 
                onClick={cancelDeleteChat}
                className="ml-auto p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <p className="text-slate-600 mb-5">
              Are you sure you want to delete "<span className="font-medium">{deleteConfirmation.title}</span>"? 
              This action cannot be undone.
            </p>
            
            <div className="flex space-x-3 justify-end">
              <button
                onClick={cancelDeleteChat}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteChat}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-sm"
              >
                {deleting ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </div>
                ) : (
                  'Delete Chat'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};