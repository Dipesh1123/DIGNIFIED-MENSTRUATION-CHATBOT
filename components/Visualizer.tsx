import React from 'react';

interface VisualizerProps {
  isActive: boolean;
  isSpeaking: boolean;
  isModelSpeaking: boolean;
}

const Visualizer: React.FC<VisualizerProps> = ({ isActive, isModelSpeaking }) => {
  if (!isActive) return null;

  return (
    <div className="flex items-center justify-center gap-2 h-20">
      {/* 5 Bars for visualization - White to contrast inside the Rose orb */}
      {[0, 100, 200, 300, 400].map((delay, i) => (
        <div 
          key={i}
          className={`w-1.5 rounded-full bg-white/90 shadow-sm transition-all duration-200 ease-in-out ${
            isModelSpeaking 
              ? 'h-12 animate-[bounce_0.8s_infinite]' 
              : 'h-2 animate-[pulse_2s_infinite]'
          }`} 
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  );
};

export default Visualizer;