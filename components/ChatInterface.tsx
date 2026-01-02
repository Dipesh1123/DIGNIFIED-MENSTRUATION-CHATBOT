import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { GSCDM_SYSTEM_INSTRUCTION } from '../constants';
import { marked } from 'marked';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const API_KEY = process.env.API_KEY || '';

const SUGGESTED_QUESTIONS = [
  "What is Dignified Menstruation?",
  "Is menstrual blood dirty?",
  "What is the 4D Strategy?",
  "Tell me about Dr. Radha Paudel.",
];

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Namaste! I am the Dignified Menstruation Assistant. I am here to help you understand Menstrual Dignity, debunk myths, and provide information about our global movement. How may I assist you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Initialize AI client
  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage = text;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: GSCDM_SYSTEM_INSTRUCTION,
        },
        history: messages.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        })),
      });

      const result = await chat.sendMessageStream({ message: userMessage });
      
      let fullResponse = '';
      setMessages(prev => [...prev, { role: 'model', text: '' }]);

      for await (const chunk of result) {
        const text = (chunk as GenerateContentResponse).text;
        if (text) {
          fullResponse += text;
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1].text = fullResponse;
            return newMessages;
          });
        }
      }
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: 'I apologize, but I encountered an error. Please check your connection and try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const renderMarkdown = (text: string) => {
    return { __html: marked.parse(text) as string };
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth pb-24 no-scrollbar">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'model' && (
               <div className="flex-shrink-0 w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-[10px] font-bold ring-1 ring-rose-200 mb-1">
                  DM
               </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-5 py-3.5 shadow-sm text-sm leading-relaxed transition-all duration-300 ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-rose-600 to-rose-700 text-white rounded-br-none'
                  : 'bg-white text-slate-700 rounded-bl-none border border-slate-100'
              }`}
            >
              {msg.role === 'model' ? (
                <div 
                  className="prose prose-sm max-w-none prose-p:leading-relaxed prose-headings:text-rose-800 prose-headings:font-bold prose-a:text-rose-600 prose-strong:text-rose-900 prose-ul:marker:text-rose-400"
                  dangerouslySetInnerHTML={renderMarkdown(msg.text)} 
                />
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}
        
        {/* Loading Bubble */}
        {isLoading && (
          <div className="flex justify-start items-center gap-2">
             <div className="flex-shrink-0 w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-[10px] font-bold ring-1 ring-rose-200">
                  DM
             </div>
            <div className="bg-white rounded-2xl rounded-bl-none px-4 py-3 border border-slate-100 shadow-sm flex items-center space-x-1">
              <div className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        
        {/* Suggestion Chips (Only show if few messages) */}
        {messages.length < 3 && !isLoading && (
          <div className="grid grid-cols-1 gap-2 mt-4 px-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-1">Suggested Questions</p>
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button 
                key={i}
                onClick={() => sendMessage(q)}
                className="text-left bg-white border border-rose-100 hover:border-rose-300 hover:bg-rose-50 text-slate-700 px-4 py-3 rounded-xl text-sm transition-all shadow-sm active:scale-[0.98]"
              >
                {q}
              </button>
            ))}
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-white/0 pt-10">
        <form onSubmit={handleSend} className="relative flex items-center gap-2 shadow-lg rounded-full bg-white ring-1 ring-slate-200">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question..."
            className="w-full bg-transparent border-none py-3.5 pl-5 pr-14 text-slate-800 placeholder:text-slate-400 focus:ring-0 text-base"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-1.5 p-2 bg-rose-600 text-white rounded-full hover:bg-rose-700 disabled:bg-slate-200 disabled:text-slate-400 transition-all active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;