"use client"

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Send, Loader2, Sparkles, Heart, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getChatHistory, createChatSession } from '@/lib/firestore';

interface Message {
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export default function ChatPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      content: "Hey love! 💚 I'm Sisi, your wellness companion. I'm here to support you through your PCOS journey. Whether you need meal advice, a pep talk, or just someone to listen - I've got you. What's on your mind?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [ventingMode, setVentingMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history and ensure a session for continuity
  useEffect(() => {
    const init = async () => {
      if (!user) return;
      try {
        // Load recent history (most recent 50 messages)
        const history = await getChatHistory(user.id, 50);
        if (history.length > 0) {
          setMessages(
            history.map((m) => ({
              role: m.role === 'assistant' ? 'ai' : 'user',
              content: m.content,
              timestamp: m.timestamp || new Date(),
            }))
          );
        }

        // Ensure a session exists for better threading
        if (!sessionId) {
          const id = await createChatSession(user.id);
          setSessionId(id);
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
      } finally {
        setLoadingHistory(false);
      }
    };

    init();
  }, [user, sessionId]);

  const sendMessage = async () => {
    if (!input.trim() || !user) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          userId: user.id,
          ventingMode,
          sessionId,
        }),
      });

      if (!response.ok) {
        // Parse error details from the API response
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('API returned error:', errorData);
        throw new Error(errorData.error || 'Failed to get response');
      }

      const data = await response.json();

      const aiMessage: Message = {
        role: 'ai',
        content: data.message,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Show more specific error message if available
      const errorText = error instanceof Error ? error.message : 'Unknown error';
      const isConfigError = errorText.includes('GEMINI_API_KEY') || errorText.includes('not configured');
      
      const errorMessage: Message = {
        role: 'ai',
        content: isConfigError 
          ? "Sorry dear, I need to be configured first. Please check that GEMINI_API_KEY is set in the environment. 🔧"
          : "Sorry dear, I'm having trouble connecting right now. Please try again in a moment. 💚",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickPrompts = [
    "Can I eat this?",
    "I'm craving junk food",
    "What should I eat today?",
    "I'm feeling bloated",
    "Give me a recipe",
  ];

  return (
    <div 
      className="h-screen flex flex-col"
      style={{
        background: 'linear-gradient(135deg, #f0f4f0 0%, #e8dff5 50%, #fff9f0 100%)',
      }}
    >
      {/* Header */}
      <div 
        className="sticky top-0 z-10 px-4 py-4 backdrop-blur-md"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Sisi Coach</h1>
              <p className="text-xs text-gray-600">Your AI wellness companion</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setVentingMode(!ventingMode)}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-all
                ${ventingMode 
                  ? 'bg-pink-500 text-white shadow-md' 
                  : 'bg-white/60 text-gray-700 hover:bg-white/80'
                }
              `}
            >
              <Heart className={`w-4 h-4 inline mr-1 ${ventingMode ? 'fill-white' : ''}`} />
              {ventingMode ? 'Listening' : 'Just Listen'}
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-10 h-10 rounded-full bg-white/60 hover:bg-white/80 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 pb-32">
        <div className="max-w-4xl mx-auto space-y-4">
          {loadingHistory && (
            <div className="flex justify-center text-gray-600 text-sm">Loading your past chats...</div>
          )}
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`
                  max-w-[80%] rounded-3xl px-5 py-3 shadow-md
                  ${message.role === 'user'
                    ? 'bg-emerald-500 text-white rounded-br-md'
                    : 'bg-white text-gray-900 rounded-bl-md'
                  }
                `}
                style={{
                  backdropFilter: 'blur(10px)',
                }}
              >
                {message.role === 'ai' && (
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <span className="text-xs font-semibold text-purple-600">Sisi</span>
                  </div>
                )}
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
                <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-emerald-100' : 'text-gray-500'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-3xl rounded-bl-md px-5 py-3 shadow-md">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                  <span className="text-sm text-gray-600">Sisi is typing...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Prompts */}
      {messages.length === 1 && (
        <div className="px-4 pb-2">
          <div className="max-w-4xl mx-auto">
            <p className="text-xs text-gray-600 mb-2 text-center">Quick prompts:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {quickPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => setInput(prompt)}
                  className="px-4 py-2 rounded-full bg-white/60 hover:bg-white/80 text-sm text-gray-700 transition-colors backdrop-blur-sm"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div 
        className="fixed bottom-0 lg:bottom-4 left-0 right-0 px-4 py-4 backdrop-blur-md"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          boxShadow: '0 -1px 3px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={ventingMode ? "I'm listening... tell me everything 💜" : "Ask Sisi anything..."}
              disabled={loading}
              className="flex-1 px-5 py-4 rounded-full bg-white border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all disabled:opacity-50"
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50 flex items-center justify-center shrink-0"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
