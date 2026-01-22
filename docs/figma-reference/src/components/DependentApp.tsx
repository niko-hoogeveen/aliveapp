import { useState } from 'react';
import { DependentHome } from './dependent/DependentHome';
import { DependentHelp } from './dependent/DependentHelp';
import { DependentSettings } from './dependent/DependentSettings';
import { Heart, HelpCircle, Settings } from 'lucide-react';

export type DependentScreen = 'home' | 'help' | 'settings';

export function DependentApp() {
  const [currentScreen, setCurrentScreen] = useState<DependentScreen>('home');

  return (
    <div className="h-full flex flex-col bg-[#F5F5F5]">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {currentScreen === 'home' && <DependentHome />}
        {currentScreen === 'help' && <DependentHelp />}
        {currentScreen === 'settings' && <DependentSettings />}
      </div>

      {/* Bottom Navigation - Only show on non-home screens */}
      {currentScreen !== 'home' && (
        <div className="bg-white border-t border-gray-200 px-6 py-4 safe-area-inset-bottom">
          <div className="flex justify-around items-center">
            <button
              onClick={() => setCurrentScreen('home')}
              className="flex flex-col items-center gap-1 min-w-[48px] min-h-[48px] justify-center"
            >
              <Heart className={`w-6 h-6 ${currentScreen === 'home' ? 'fill-[#4CAF50] stroke-[#4CAF50]' : 'stroke-[#757575]'}`} />
              <span className={`text-xs ${currentScreen === 'home' ? 'text-[#4CAF50]' : 'text-[#757575]'}`}>Home</span>
            </button>
            <button
              onClick={() => setCurrentScreen('help')}
              className="flex flex-col items-center gap-1 min-w-[48px] min-h-[48px] justify-center"
            >
              <HelpCircle className={`w-6 h-6 ${currentScreen === 'help' ? 'stroke-[#4CAF50]' : 'stroke-[#757575]'}`} />
              <span className={`text-xs ${currentScreen === 'help' ? 'text-[#4CAF50]' : 'text-[#757575]'}`}>Help</span>
            </button>
            <button
              onClick={() => setCurrentScreen('settings')}
              className="flex flex-col items-center gap-1 min-w-[48px] min-h-[48px] justify-center"
            >
              <Settings className={`w-6 h-6 ${currentScreen === 'settings' ? 'stroke-[#4CAF50]' : 'stroke-[#757575]'}`} />
              <span className={`text-xs ${currentScreen === 'settings' ? 'text-[#4CAF50]' : 'text-[#757575]'}`}>Settings</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
