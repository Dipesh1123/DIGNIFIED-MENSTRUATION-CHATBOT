
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { GSCDM_SYSTEM_INSTRUCTION } from '../constants';
import { createBlob, decode, decodeAudioData } from '../utils/audioUtils';
import Visualizer from './Visualizer';

const DignityVoiceAgent: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  const [statusText, setStatusText] = useState("Ready");

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
    
    setTimeout(() => setStatusText("Ready"), 1500);
  };

  const startSession = async () => {
    // Guideline: Always use process.env.API_KEY directly and assume it is valid.
    if (!process.env.API_KEY) return setError("API Key not found.");
    setError(null);
    setIsActive(true);
    setStatusText("Connecting...");

    try {
      // Guideline: Initialize GoogleGenAI right before making an API call.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      // Important for browser autoplay policies
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
            setStatusText("Listening");
            if (!inputAudioContextRef.current) return;
            const source = inputAudioContextRef.current.createMediaStreamSource(stream);
            sourceNodeRef.current = source;
            const scriptProcessor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = scriptProcessor;
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              // Guideline: Use the session promise to send realtime input to avoid race conditions.
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
                // Guideline: Implement custom PCM decoding and gapless scheduling using nextStartTime.
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
            setError("Connection error."); 
            stopSession(); 
          }
        }
      });
    } catch (err) {
      console.error(err);
      setError("Microphone access failed.");
      setIsActive(false);
      setStatusText("Error");
    }
  };

  useEffect(() => {
    return () => { stopSession(); };
  }, []);

  return (
    <div className="h-full flex flex-col items-center justify-between p-8 bg-white">
      <div className="w-full flex justify-center pt-8">
        <div className={`px-4 py-2 rounded-full border flex items-center gap-2 transition-all duration-300 ${isActive ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-100'}`}>
          <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-rose-500 animate-pulse' : 'bg-slate-400'}`}></div>
          <span className={`text-xs font-semibold tracking-wide uppercase ${isActive ? 'text-rose-700' : 'text-slate-500'}`}>{statusText}</span>
        </div>
      </div>

      <div className="relative flex-1 w-full flex items-center justify-center">
        <div className={`relative transition-all duration-700 ease-in-out ${isActive ? 'w-64 h-64 md:w-80 md:h-80' : 'w-48 h-48'}`}>
          <div className={`absolute inset-0 bg-rose-200 blur-3xl rounded-full transition-opacity duration-1000 ${isActive ? 'opacity-60' : 'opacity-0'}`}></div>
          <div className={`w-full h-full bg-gradient-to-br from-rose-500 to-rose-700 shadow-xl flex items-center justify-center text-white transition-all duration-500 overflow-hidden relative z-10
            ${isActive ? 'animate-morph' : 'rounded-full scale-90'}
            ${isModelSpeaking ? 'animate-morph-fast scale-110' : ''}
          `}>
             {isActive ? (
               <div className="scale-150 opacity-80 mix-blend-overlay">
                  <Visualizer isActive={isActive} isSpeaking={!isModelSpeaking} isModelSpeaking={isModelSpeaking} />
               </div>
             ) : (
               <span className="text-4xl font-bold tracking-tighter opacity-90">DM</span>
             )}
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col items-center gap-6 pb-8">
        {error && <p className="text-red-500 text-sm font-medium bg-red-50 px-3 py-1 rounded-md mb-2">{error}</p>}
        
        {!isActive ? (
          <button
            onClick={startSession}
            className="group relative px-8 py-4 bg-slate-900 text-white rounded-full font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all w-full max-w-xs overflow-hidden"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-rose-600 to-rose-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative flex items-center justify-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                 <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
                 <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z" />
              </svg>
              Start Conversation
            </span>
          </button>
        ) : (
           <button
            onClick={stopSession}
            className="h-16 w-16 bg-white border border-rose-100 rounded-full flex items-center justify-center text-rose-600 hover:bg-rose-50 hover:scale-105 hover:text-rose-700 transition-all shadow-md group"
          >
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 group-active:scale-90 transition-transform">
                <path fillRule="evenodd" d="M4.5 7.5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-9Z" clipRule="evenodd" />
             </svg>
          </button>
        )}
        
        <p className="text-slate-400 text-xs font-medium text-center max-w-xs">
          {isActive ? "Tap the red square to end session" : "Experience our AI voice assistant"}
        </p>
      </div>
    </div>
  );
};

export default DignityVoiceAgent;
