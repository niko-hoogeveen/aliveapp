import { Bell, Volume2, Moon, HelpCircle, LogOut } from 'lucide-react';
import { Switch } from '../ui/switch';
import { useState } from 'react';

export function DependentSettings() {
  const [notifications, setNotifications] = useState(true);
  const [sound, setSound] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="h-full bg-gradient-to-b from-[#E8F5E9] to-[#F5F5F5] p-6 overflow-y-auto">
      {/* Header */}
      <div className="pt-12 pb-6">
        <h1 className="text-center text-[#212121] text-3xl mb-2">Settings</h1>
        <p className="text-center text-[#757575] text-base">
          Customize your experience
        </p>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-[#4CAF50]/20 flex items-center justify-center">
            <span className="text-[#4CAF50] text-2xl">JD</span>
          </div>
          <div>
            <h2 className="text-[#212121] mb-1">John Doe</h2>
            <p className="text-[#757575] text-sm">john.doe@email.com</p>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="mb-6">
        <h2 className="text-[#212121] mb-4 px-1">Notifications</h2>
        <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100">
          <div className="p-5 flex items-center justify-between min-h-[72px]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#7fbff2]/20 flex items-center justify-center">
                <Bell className="w-5 h-5 stroke-[#7fbff2]" />
              </div>
              <div>
                <h3 className="text-[#212121] mb-0.5">Reminders</h3>
                <p className="text-[#757575] text-sm">Daily check-in notifications</p>
              </div>
            </div>
            <Switch
              checked={notifications}
              onCheckedChange={setNotifications}
              className="data-[state=checked]:bg-[#4CAF50]"
            />
          </div>

          <div className="p-5 flex items-center justify-between min-h-[72px]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#7fbff2]/20 flex items-center justify-center">
                <Volume2 className="w-5 h-5 stroke-[#7fbff2]" />
              </div>
              <div>
                <h3 className="text-[#212121] mb-0.5">Sound</h3>
                <p className="text-[#757575] text-sm">Play sound with reminders</p>
              </div>
            </div>
            <Switch
              checked={sound}
              onCheckedChange={setSound}
              className="data-[state=checked]:bg-[#4CAF50]"
            />
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="mb-6">
        <h2 className="text-[#212121] mb-4 px-1">Appearance</h2>
        <div className="bg-white rounded-2xl shadow-sm">
          <div className="p-5 flex items-center justify-between min-h-[72px]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#7fbff2]/20 flex items-center justify-center">
                <Moon className="w-5 h-5 stroke-[#7fbff2]" />
              </div>
              <div>
                <h3 className="text-[#212121] mb-0.5">Dark Mode</h3>
                <p className="text-[#757575] text-sm">Use dark color theme</p>
              </div>
            </div>
            <Switch
              checked={darkMode}
              onCheckedChange={setDarkMode}
              className="data-[state=checked]:bg-[#4CAF50]"
            />
          </div>
        </div>
      </div>

      {/* Support */}
      <div className="mb-6">
        <h2 className="text-[#212121] mb-4 px-1">Support</h2>
        <div className="bg-white rounded-2xl shadow-sm">
          <button className="w-full p-5 flex items-center gap-3 min-h-[72px] active:bg-gray-50 transition-colors rounded-2xl">
            <div className="w-10 h-10 rounded-full bg-[#7fbff2]/20 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 stroke-[#7fbff2]" />
            </div>
            <div className="text-left">
              <h3 className="text-[#212121] mb-0.5">Help & FAQ</h3>
              <p className="text-[#757575] text-sm">Get help using I'm Okay</p>
            </div>
          </button>
        </div>
      </div>

      {/* Account Actions */}
      <div className="mb-8">
        <button className="w-full bg-white rounded-2xl p-5 shadow-sm flex items-center justify-center gap-2 min-h-[64px] active:bg-gray-50 transition-colors">
          <LogOut className="w-5 h-5 stroke-[#E57373]" />
          <span className="text-[#E57373]">Sign Out</span>
        </button>
      </div>

      {/* App Info */}
      <div className="text-center pb-8">
        <p className="text-[#757575] text-sm mb-1">I'm Okay</p>
        <p className="text-[#757575] text-sm">Version 1.0.0</p>
      </div>
    </div>
  );
}
