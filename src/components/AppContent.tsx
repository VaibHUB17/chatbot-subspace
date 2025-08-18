import React from 'react';
import { useAuthenticationStatus } from '@nhost/react';
import { AuthForm } from './auth/AuthForm';
import { ChatInterface } from './chat/ChatInterface';

export const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuthenticationStatus();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return isAuthenticated ? <ChatInterface /> : <AuthForm />;
};