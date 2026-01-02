
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { GSCDM_SYSTEM_INSTRUCTION } from '../constants';
import { createBlob, decode, decodeAudioData } from '../utils/audioUtils';
import Visualizer from './Visualizer';

const DignityVoiceAgent: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  const [statusText, setStatusText] = useState("Tap to start");

  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const sessionRef = useRef<any>(null); 
  const nextStartTimeRef = useRef<number>(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const stopSession = async () => {
    setIsActive(false);
    setIsModelSpeaking(false);
    setStatusText("Ended");

    if (sessionRef.current) {
      try { await sessionRef.current.close(); } catch (e) {}
      sessionRef.current = null;
      sessionPromiseRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    if (sourceNodeRef.current) sourceNodeRef.current.disconnect();
    if (scriptProcessorRef.current) scriptProcessorRef.current.disconnect();

    audioSourcesRef.current.forEach(source => { try { source.stop(); } catch (e) {} });
    audioSourcesRef.current.clear();
    nextStartTimeRef.current = 0;

    if (inputAudioContextRef.current) {
      inputAudioContextRef.current.close().catch(() => {});
      inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close().catch(() => {});
      outputAudioContextRef.current = null;
    }
    
    setTimeout(() => setStatusText("Tap to start"), 1500);
  };

  const startSession = async () => {
    if (!process.env.API_KEY) return setError("API Key not found.");
    setError(null);
    setIsActive(true);
    setStatusText("Connecting...");

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      if (inputAudioContextRef.current.state === 'suspended') await inputAudioContextRef.current.resume();
      if (outputAudioContextRef.current.state === 'suspended') await outputAudioContextRef.current.resume();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
          systemInstruction: GSCDM_SYSTEM_INSTRUCTION,
        },
        callbacks: {
          onopen: () => {
            setStatusText("I'm listening");
            if (!inputAudioContextRef.current) return;
            const source = inputAudioContextRef.current.createMediaStreamSource(stream);
            sourceNodeRef.current = source;
            const scriptProcessor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = scriptProcessor;
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              sessionPromiseRef.current?.then((session) => {
                   sessionRef.current = session;
                   session.sendRealtimeInput({ media: createBlob(inputData) });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const outputCtx = outputAudioContextRef.current;
            if (!outputCtx) return;

            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
              setIsModelSpeaking(true);
              setStatusText("Speaking");
              try {
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
                const audioBuffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
                const source = outputCtx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputCtx.destination);
                source.addEventListener('ended', () => {
                  audioSourcesRef.current.delete(source);
                  if (audioSourcesRef.current.size === 0) {
                    setIsModelSpeaking(false);
                    setStatusText("Listening");
                  }
                });
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                audioSourcesRef.current.add(source);
              } catch (err) { console.error("Audio playback error:", err); }
            }
            if (message.serverContent?.interrupted) {
              audioSourcesRef.current.forEach(source => { try { source.stop(); } catch (e) {} });
              audioSourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setIsModelSpeaking(false);
              setStatusText("Listening");
            }
          },
          onclose: stopSession,
          onerror: (e) => { 
            console.error("Live API Error:", e);
            setError("Connection lost."); 
            stopSession(); 
          }
        }
      });
    } catch (err) {
      console.error(err);
      setError("Microphone access denied.");
      setIsActive(false);
      setStatusText("Tap to start");
    }
  };

  useEffect(() => {
    return () => { stopSession(); };
  }, []);

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 bg-slate-50">
      
      {/* Voice Visualization Circle */}
      <div className="relative flex items-center justify-center mb-12">
        <div className={`absolute w-48 h-48 rounded-full border-2 border-rose-200 transition-all duration-700 ${isActive ? 'animate-ping opacity-20' : 'opacity-0'}`}></div>
        <div className={`absolute w-64 h-64 rounded-full border border-rose-100 transition-all duration-1000 ${isActive ? 'animate-ping opacity-10' : 'opacity-0'}`}></div>
        
        <div className={`w-40 h-40 rounded-full flex flex-col items-center justify-center shadow-xl transition-all duration-500 ${
          isActive ? 'bg-rose-600 scale-110 shadow-rose-200' : 'bg-slate-200 scale-100 shadow-slate-100'
        }`}>
          {isActive ? (
            <Visualizer isActive={isActive} isSpeaking={!isModelSpeaking} isModelSpeaking={isModelSpeaking} />
          ) : (
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 text-slate-400">
               <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
               <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z" />
             </svg>
          )}
        </div>
      </div>

      <div className="text-center space-y-2 mb-12">
        <h2 className={`text-xl font-bold transition-colors ${isActive ? 'text-rose-700' : 'text-slate-700'}`}>
          {statusText}
        </h2>
        <p className="text-slate-400 text-sm max-w-xs mx-auto">
          {isActive ? "I am listening to you. Speak freely." : "Start a real-time voice conversation about menstrual dignity."}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-xs mb-6 border border-red-100">
          {error}
        </div>
      )}

      <button
        onClick={isActive ? stopSession : startSession}
        className={`px-10 py-4 rounded-full font-bold shadow-lg transition-all active:scale-95 ${
          isActive 
            ? 'bg-slate-800 text-white hover:bg-slate-900' 
            : 'bg-rose-600 text-white hover:bg-rose-700'
        }`}
      >
        {isActive ? 'Stop Conversation' : 'Start Talking'}
      </button>

      <p className="mt-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        Powered by GSCDM
      </p>
    </div>
  );
};

export default DignityVoiceAgent;
