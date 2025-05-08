"use client";
import React, { useState, useEffect } from 'react';
import { useTheme } from '../actions/DarkMode';
import Image from 'next/image';
import VoiceButton from './VoiceButton';
import type { SpeechRecognition } from '../types/speech-recognition';

export default function AiChatSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { darkMode } = useTheme();
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);  useEffect(() => {
    const savedSessionId = localStorage.getItem('chatSessionId');
    const newSessionId = savedSessionId || crypto.randomUUID();
    setSessionId(newSessionId);
    
    if (!savedSessionId) {
      localStorage.setItem('chatSessionId', newSessionId);
    }

    try {
      const savedHistory = localStorage.getItem('chatHistory');
      if (savedHistory) {
        setChatHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      localStorage.removeItem('chatHistory'); 
    }    
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript as string)
          .join('');
        setMessage(transcript);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognition);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  }, [chatHistory]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message;
    setMessage('');
    
    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userMessage,
          sessionId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      
      setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: data.response
      }]);
    } catch (error) {
      console.error('Error:', error);
      setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: "I apologize, but I encountered an error. Please try again later."
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  const clearHistory = () => {
    setChatHistory([]);
    localStorage.removeItem('chatHistory');
    const newSessionId = crypto.randomUUID();
    setSessionId(newSessionId);
    localStorage.setItem('chatSessionId', newSessionId);
  };

  const toggleVoice = () => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0  bg-opacity-50 backdrop-blur-sm transition-opacity z-40"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed inset-y-0 right-0 w-80 bg-${darkMode ? 'gray-900' : 'white'} shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
            <div className="flex items-center space-x-2">
              <Image src="/gemini.png" alt="Gemini" width={24} height={24} />
              <h2 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Blogify Assistant</h2>
            </div>            <div className="flex items-center space-x-2">
              <button
                onClick={clearHistory}
                className={`p-2 rounded-full hover:bg-${darkMode ? 'gray-800' : 'gray-100'}`}
                title="Clear chat history"
              >
                <svg className="w-5 h-5" fill="none" stroke={darkMode ? "white" : "currentColor"} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <button
                onClick={onClose}
                className={`p-2 rounded-full hover:bg-${darkMode ? 'gray-800' : 'gray-100'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke={darkMode ? "white" : "currentColor"} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className={`flex-1 overflow-y-auto p-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
            {chatHistory.length === 0 && (
              <div className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-4`}>
                <p>👋 Hi! I'm your Blogify assistant.</p>
                <p className="mt-2">Ask me anything about the platform!</p>
              </div>
            )}
            {chatHistory.map((msg, idx) => (
              <div
                key={idx}
                className={`mb-4 ${
                  msg.role === 'user' ? 'ml-auto text-right' : 'mr-auto'
                }`}
              >
                <div
                  className={`inline-block p-3 rounded-lg ${
                    msg.role === 'user'
                      ? `bg-blue-500 text-white`
                      : darkMode
                      ? 'bg-gray-800'
                      : 'bg-gray-100'
                  } max-w-[80%`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center space-x-2 text-gray-500">
                <div className="animate-bounce">●</div>
                <div className="animate-bounce delay-100">●</div>
                <div className="animate-bounce delay-200">●</div>
              </div>
            )}
          </div>          <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex space-x-2">
              <div className="flex-1 relative">                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask me anything..."
                  className={`w-full p-2 pr-10 rounded-lg border ${
                    darkMode
                      ? 'bg-gray-800 border-gray-700 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  suppressHydrationWarning
                /><div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  {
                    <VoiceButton
                      isListening={isListening}
                      onClick={toggleVoice}
                      darkMode={darkMode}
                    />
                  }
                </div>
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!message.trim() || isLoading}
                className={`p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
