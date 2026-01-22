import { useState } from 'react';
import { GuardianDashboard } from './guardian/GuardianDashboard';
import { GuardianDependentDetail } from './guardian/GuardianDependentDetail';
import { GuardianAlerts } from './guardian/GuardianAlerts';
import { GuardianSettings } from './guardian/GuardianSettings';
import { Users, Bell, Settings, Home } from 'lucide-react';

export type GuardianScreen = 'dashboard' | 'detail' | 'alerts' | 'settings';

export function GuardianApp() {
  const [currentScreen, setCurrentScreen] = useState<GuardianScreen>('dashboard');
  const [selectedDependentId, setSelectedDependentId] = useState<string | null>(null);

  const handleViewDependent = (id: string) => {
    setSelectedDependentId(id);
    setCurrentScreen('detail');
  };

  return (
    <div className="h-full flex flex-col bg-[#F5F5F5]">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {currentScreen === 'dashboard' && (
          <GuardianDashboard onViewDependent={handleViewDependent} />
        )}
        {currentScreen === 'detail' && selectedDependentId && (
          <GuardianDependentDetail
            dependentId={selectedDependentId}
            onBack={() => setCurrentScreen('dashboard')}
          />
        )}
        {currentScreen === 'alerts' && <GuardianAlerts />}
        {currentScreen === 'settings' && <GuardianSettings />}
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white border-t border-gray-200 px-6 py-4 safe-area-inset-bottom">
        <div className="flex justify-around items-center">
          <button
            onClick={() => setCurrentScreen('dashboard')}
            className="flex flex-col items-center gap-1 min-w-[48px] min-h-[48px] justify-center"
          >
            <Home className={`w-6 h-6 ${currentScreen === 'dashboard' ? 'stroke-[#4CAF50]' : 'stroke-[#757575]'}`} />
            <span className={`text-xs ${currentScreen === 'dashboard' ? 'text-[#4CAF50]' : 'text-[#757575]'}`}>
              Home
            </span>
          </button>
          <button
            onClick={() => setCurrentScreen('alerts')}
            className="flex flex-col items-center gap-1 min-w-[48px] min-h-[48px] justify-center relative"
          >
            <div className="relative">
              <Bell className={`w-6 h-6 ${currentScreen === 'alerts' ? 'stroke-[#4CAF50]' : 'stroke-[#757575]'}`} />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#E57373] rounded-full border-2 border-white" />
            </div>
            <span className={`text-xs ${currentScreen === 'alerts' ? 'text-[#4CAF50]' : 'text-[#757575]'}`}>
              Alerts
            </span>
          </button>
          <button
            onClick={() => setCurrentScreen('settings')}
            className="flex flex-col items-center gap-1 min-w-[48px] min-h-[48px] justify-center"
          >
            <Settings className={`w-6 h-6 ${currentScreen === 'settings' ? 'stroke-[#4CAF50]' : 'stroke-[#757575]'}`} />
            <span className={`text-xs ${currentScreen === 'settings' ? 'text-[#4CAF50]' : 'text-[#757575]'}`}>
              Settings
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
