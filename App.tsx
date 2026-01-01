import React, { useState } from 'react';
import ChatInterface from './components/ChatInterface';
import DignityVoiceAgent from './components/DignityVoiceAgent';

type Mode = 'chat' | 'voice';

const App: React.FC = () => {
  const [mode, setMode] = useState<Mode>('chat');

  return (
    <div className="h-[100dvh] bg-slate-50 flex justify-center">
      {/* App Shell - Limits width on desktop for a mobile-app feel */}
      <div className="w-full max-w-md h-full bg-white shadow-2xl overflow-hidden flex flex-col relative border-x border-slate-200">
        
        {/* Header - Glassmorphism */}
        <header className="absolute top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-rose-100/50">
          <div className="px-4 h-16 flex items-center justify-between">
            {/* Branding */}
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-rose-600 to-rose-800 flex items-center justify-center text-white font-bold text-xs shadow-md ring-2 ring-rose-100">
                DM
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-bold text-slate-800 text-sm">DM Assistant</span>
                <span className="text-[10px] font-medium text-rose-600 tracking-wide uppercase">AI Support</span>
              </div>
            </div>

            {/* Segmented Control */}
            <div className="flex bg-slate-100 p-1 rounded-full border border-slate-200">
              <button
                onClick={() => setMode('chat')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                  mode === 'chat'
                    ? 'bg-white text-rose-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Chat
              </button>
              <button
                onClick={() => setMode('voice')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                  mode === 'voice'
                    ? 'bg-white text-rose-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Voice
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 relative pt-16 flex flex-col h-full">
          {mode === 'chat' ? (
            <ChatInterface />
          ) : (
            <DignityVoiceAgent />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;