
import React, { useState } from 'react';
import ChatInterface from './components/ChatInterface';
import DignityVoiceAgent from './components/DignityVoiceAgent';

type Mode = 'chat' | 'voice';

const App: React.FC = () => {
  const [mode, setMode] = useState<Mode>('chat');

  return (
    <div className="h-[100dvh] bg-slate-100 flex justify-center selection:bg-rose-100 selection:text-rose-900">
      {/* App Shell */}
      <div className="w-full max-w-md h-full bg-white shadow-2xl overflow-hidden flex flex-col relative border-x border-slate-200">
        
        {/* Header */}
        <header className="absolute top-0 left-0 right-0 z-50 bg-white border-b border-slate-100">
          <div className="px-4 h-16 flex items-center justify-between">
            {/* Branding */}
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-rose-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                DM
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-bold text-slate-800 text-sm tracking-tight">DM Assistant</span>
                <span className="text-[10px] font-bold text-rose-500 tracking-wider uppercase opacity-80">GSCDM</span>
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="flex bg-slate-100 p-1 rounded-full border border-slate-200 scale-90 sm:scale-100 origin-right">
              {(['chat', 'voice'] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-bold capitalize transition-all duration-200 ${
                    mode === m
                      ? 'bg-white text-rose-600 shadow-sm'
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
          {mode === 'chat' && (
            <div className="h-full animate-fade-in">
              <ChatInterface />
            </div>
          )}
          {mode === 'voice' && (
            <div className="h-full animate-fade-in">
              <DignityVoiceAgent />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
