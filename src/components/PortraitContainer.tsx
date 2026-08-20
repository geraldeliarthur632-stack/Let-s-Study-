import React from 'react';
import { Smartphone, Tablet, Monitor } from 'lucide-react';

export type DisplayMode = 'phone' | 'tablet' | 'desktop';

interface PortraitContainerProps {
  children: React.ReactNode;
  themeClass?: string;
  displayMode?: DisplayMode;
  onToggleDisplayMode?: (mode: DisplayMode) => void;
}

export const PortraitContainer: React.FC<PortraitContainerProps> = ({
  children,
  themeClass = 'theme-blue',
  displayMode = 'phone',
  onToggleDisplayMode,
}) => {
  // Determine width based on display mode
  const getContainerWidth = () => {
    switch (displayMode) {
      case 'tablet':
        return 'w-full max-w-2xl sm:min-h-[880px] sm:max-h-[940px]';
      case 'desktop':
        return 'w-full max-w-4xl sm:min-h-[900px] sm:max-h-[960px]';
      case 'phone':
      default:
        return 'w-full max-w-md sm:min-h-[860px] sm:max-h-[920px]';
    }
  };

  return (
    <div className={`min-h-screen bg-slate-200/90 flex flex-col justify-center items-center text-slate-900 ${themeClass} py-2 px-1`}>
      {/* Top Device Mode Switcher bar on wider screens */}
      {onToggleDisplayMode && (
        <div className="hidden sm:flex items-center gap-1 bg-white/90 backdrop-blur-xs border border-slate-300 px-2 py-1 rounded-full shadow-xs mb-2 text-xs font-semibold text-slate-700">
          <span className="text-[10px] text-slate-400 mr-1.5 uppercase font-bold tracking-wider">Modo de Tela:</span>
          
          <button
            onClick={() => onToggleDisplayMode('phone')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition ${
              displayMode === 'phone'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Visualização Celular (App Mobile)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Celular</span>
          </button>

          <button
            onClick={() => onToggleDisplayMode('tablet')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition ${
              displayMode === 'tablet'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Visualização Tablet (iPad/Tablet)"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>Tablet</span>
          </button>

          <button
            onClick={() => onToggleDisplayMode('desktop')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition ${
              displayMode === 'desktop'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Visualização Computador / Tela Cheia"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Computador</span>
          </button>
        </div>
      )}

      {/* Main App Container */}
      <div
        className={`${getContainerWidth()} min-h-screen sm:my-2 sm:rounded-3xl bg-slate-50 border border-slate-300/80 shadow-2xl flex flex-col relative overflow-hidden text-slate-900 transition-all duration-300`}
      >
        {/* Mobile top status notch bar simulation for portrait look */}
        {displayMode === 'phone' && (
          <div className="hidden sm:flex justify-between items-center px-6 py-2 bg-slate-100 border-b border-slate-200 text-[11px] text-slate-500 font-mono select-none">
            <span>09:41</span>
            <div className="w-20 h-4 bg-slate-300 rounded-full mx-auto" />
            <div className="flex items-center gap-1.5 font-bold">
              <span>5G</span>
              <span>100%</span>
            </div>
          </div>
        )}

        {/* Inner Content Area */}
        <div className="flex-1 flex flex-col overflow-y-auto relative scrollbar-thin scrollbar-thumb-slate-300">
          {children}
        </div>
      </div>
    </div>
  );
};
