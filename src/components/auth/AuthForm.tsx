import React, { useState } from 'react';
import { Mail, Lock, Loader2, MessageSquare, Sparkles } from 'lucide-react';
import { nhost } from '../../lib/nhost';

export const AuthForm: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<'success' | 'error' | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [authError, setAuthError] = useState<{ message: string; error?: string } | null>(null);
  
  const isLoading = isSigningIn || isSigningUp || isResendingVerification;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationMessage('');
    setVerificationStatus(null);
    setAuthError(null);
    
    if (isSignUp) {
      setIsSigningUp(true);
      try {
        // Sign up the user with Nhost auth API
        const { error } = await nhost.auth.signUp({
          email,
          password,
        });
        
        if (error) {
          setAuthError({ message: error.message, error: String(error.status) });
          setVerificationMessage(`Error: ${error.message}`);
          setVerificationStatus('error');
        } else {
          // On successful signup, show verification message
          setVerificationMessage('Account created! A verification email has been sent to your email address. Please check your inbox and verify your account before signing in.');
          setVerificationStatus('success');
          // Switch to sign-in mode after successful registration
          setIsSignUp(false);
        }
      } catch (err) {
        console.error('Signup error:', err);
        setAuthError({ message: err instanceof Error ? err.message : 'An unexpected error occurred' });
        setVerificationMessage('An unexpected error occurred during sign up. Please try again.');
        setVerificationStatus('error');
      } finally {
        setIsSigningUp(false);
      }
    } else {
      // Handle sign in
      setIsSigningIn(true);
      try {
        const { error } = await nhost.auth.signIn({
          email,
          password,
        });
        
        if (error) {
          console.error('Sign in error:', error);
          setAuthError({ message: error.message, error: String(error.status) });
          if (error.status === 401) {
            setVerificationMessage('Please verify your email before signing in.');
            setVerificationStatus('error');
          }
        }
      } catch (err) {
        console.error('Sign in error:', err);
        setAuthError({ message: err instanceof Error ? err.message : 'An unexpected error occurred' });
      } finally {
        setIsSigningIn(false);
      }
    }
  };

  const handleResendVerification = async () => {
    if (email) {
      setIsResendingVerification(true);
      setVerificationMessage('');
      try {
        const { error } = await nhost.auth.sendVerificationEmail({
          email
        });
        
        if (error) {
          setVerificationMessage(`Error: ${error.message}`);
          setVerificationStatus('error');
        } else {
          setVerificationMessage('Verification email has been sent. Please check your inbox.');
          setVerificationStatus('success');
        }
      } catch (err) {
        console.error('Error resending verification:', err);
        setVerificationMessage('An unexpected error occurred. Please try again.');
        setVerificationStatus('error');
      } finally {
        setIsResendingVerification(false);
      }
    }
  };
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-2xl">
            <MessageSquare className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome to <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">ChatBot AI</span>
          </h1>
          <p className="text-slate-300 text-lg">
            {isSignUp ? 'Create your account to get started' : 'Sign in to continue your conversations'}
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="group">
                <label htmlFor="email" className="block text-sm font-medium text-slate-200 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-slate-400 transition-all duration-200"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              
              <div className="group">
                <label htmlFor="password" className="block text-sm font-medium text-slate-200 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-slate-400 transition-all duration-200"
                    placeholder="Enter your password"
                  />
                </div>
              </div>
            </div>

            {authError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-red-300 text-sm">{authError.message}</p>
                {authError.error === 'unverified-user' && (
                  <div className="mt-2">
                    <p className="text-red-300 text-sm mb-2">Please verify your email before signing in.</p>
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={isResendingVerification}
                      className="text-blue-400 hover:text-blue-300 text-sm flex items-center"
                    >
                      {isResendingVerification ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          Sending...
                        </>
                      ) : (
                        'Resend verification email'
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {verificationMessage && !authError && (
              <div className={`${verificationStatus === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-300' : 'bg-green-500/10 border-green-500/20 text-green-300'} border rounded-xl p-4 backdrop-blur-sm`}>
                <p className="text-sm">{verificationMessage}</p>
                {verificationStatus === 'success' && !isSignUp && (
                  <p className="text-sm mt-2">Once verified, you can sign in with your credentials.</p>
                )}
                {verificationStatus === 'error' && (
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={isResendingVerification}
                    className="text-blue-400 hover:text-blue-300 text-sm flex items-center mt-2"
                  >
                    {isResendingVerification ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        Sending...
                      </>
                    ) : (
                      'Try resending verification email'
                    )}
                  </button>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
              <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
              {!isLoading && <Sparkles className="h-5 w-5" />}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-slate-300 hover:text-white transition-colors text-sm"
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
              </button>
            </div>
          </form>
        </div>

        {/* Features */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center space-x-6 text-slate-400">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm">AI-Powered</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse animation-delay-1000"></div>
              <span className="text-sm">Real-time</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse animation-delay-2000"></div>
              <span className="text-sm">Secure</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};