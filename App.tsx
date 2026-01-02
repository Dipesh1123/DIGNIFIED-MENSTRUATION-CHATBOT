import React, { useState } from 'react';
import ChatInterface from './components/ChatInterface';
import DignityVoiceAgent from './components/DignityVoiceAgent';

type Mode = 'chat' | 'voice';

const App: React.FC = () => {
  const [mode, setMode] = useState<Mode>('chat');

  return (
    <div className="h-[100dvh] bg-slate-50 flex justify-center selection:bg-rose-100 selection:text-rose-900">
      {/* App Shell - Limits width on desktop for a mobile-app feel */}
      <div className="w-full max-w-md h-full bg-white shadow-2xl overflow-hidden flex flex-col relative border-x border-slate-200/60">
        
        {/* Header - Glassmorphism style */}
        <header className="absolute top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-rose-100/50">
          <div className="px-4 h-16 flex items-center justify-between">
            {/* Branding */}
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-rose-600 to-rose-800 flex items-center justify-center text-white font-bold text-[11px] shadow-md ring-2 ring-rose-50 animate-pulse-slow">
                DM
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-bold text-slate-800 text-sm tracking-tight">DM Assistant</span>
                <span className="text-[10px] font-bold text-rose-600 tracking-wider uppercase opacity-80">GSCDM AI</span>
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="flex bg-slate-100/80 p-1 rounded-full border border-slate-200/50 scale-95 sm:scale-100 origin-right shadow-inner">
              {(['chat', 'voice'] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-5 py-1.5 rounded-full text-xs font-bold capitalize transition-all duration-300 ${
                    mode === m
                      ? 'bg-white text-rose-700 shadow-sm ring-1 ring-black/5'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 relative pt-16 flex flex-col h-full overflow-hidden">
          {mode === 'chat' ? (
            <div className="h-full animate-in fade-in slide-in-from-bottom-2 duration-500">
              <ChatInterface />
            </div>
          ) : (
            <div className="h-full animate-in fade-in zoom-in-95 duration-500">
              <DignityVoiceAgent />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;