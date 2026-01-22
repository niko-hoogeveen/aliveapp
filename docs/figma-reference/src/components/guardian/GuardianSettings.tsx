import { Bell, Shield, HelpCircle, FileText, LogOut, ChevronRight, User, CreditCard } from 'lucide-react';

export function GuardianSettings() {
  return (
    <div className="h-full bg-[#F5F5F5] overflow-y-auto">
      {/* Header */}
      <div className="bg-gradient-to-b from-white to-[#F5F5F5] px-6 pt-14 pb-6">
        <h1 className="text-[#212121] text-3xl mb-2">Settings</h1>
        <p className="text-[#757575] text-base">Manage your account</p>
      </div>

      {/* Profile Section */}
      <div className="px-6 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#7fbff2]/20 flex items-center justify-center">
              <span className="text-[#7fbff2] text-2xl">SJ</span>
            </div>
            <div className="flex-1">
              <h2 className="text-[#212121] mb-1">Sarah Johnson</h2>
              <p className="text-[#757575] text-sm">sarah.j@email.com</p>
            </div>
            <button className="text-[#7fbff2] text-sm min-h-[40px]">Edit</button>
          </div>
        </div>
      </div>

      {/* Account Settings */}
      <div className="px-6 mb-6">
        <h2 className="text-[#212121] mb-4 px-1">Account</h2>
        <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100">
          <button className="w-full p-5 flex items-center gap-3 min-h-[64px] active:bg-gray-50 transition-colors">
            <div className="w-10 h-10 rounded-full bg-[#7fbff2]/20 flex items-center justify-center">
              <User className="w-5 h-5 stroke-[#7fbff2]" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-[#212121] mb-0.5">Profile Information</h3>
              <p className="text-[#757575] text-sm">Update your personal details</p>
            </div>
            <ChevronRight className="w-5 h-5 stroke-[#757575]" />
          </button>

          <button className="w-full p-5 flex items-center gap-3 min-h-[64px] active:bg-gray-50 transition-colors">
            <div className="w-10 h-10 rounded-full bg-[#7fbff2]/20 flex items-center justify-center">
              <CreditCard className="w-5 h-5 stroke-[#7fbff2]" />
            </div>
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="text-[#212121]">Subscription</h3>
                <span className="bg-[#4CAF50] text-white text-xs px-2 py-0.5 rounded-full">
                  Premium
                </span>
              </div>
              <p className="text-[#757575] text-sm">Manage billing and plan</p>
            </div>
            <ChevronRight className="w-5 h-5 stroke-[#757575]" />
          </button>

          <button className="w-full p-5 flex items-center gap-3 min-h-[64px] active:bg-gray-50 transition-colors">
            <div className="w-10 h-10 rounded-full bg-[#7fbff2]/20 flex items-center justify-center">
              <Shield className="w-5 h-5 stroke-[#7fbff2]" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-[#212121] mb-0.5">Privacy & Security</h3>
              <p className="text-[#757575] text-sm">Password and data settings</p>
            </div>
            <ChevronRight className="w-5 h-5 stroke-[#757575]" />
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="px-6 mb-6">
        <h2 className="text-[#212121] mb-4 px-1">Notifications</h2>
        <div className="bg-white rounded-2xl shadow-sm">
          <button className="w-full p-5 flex items-center gap-3 min-h-[64px] active:bg-gray-50 transition-colors rounded-2xl">
            <div className="w-10 h-10 rounded-full bg-[#7fbff2]/20 flex items-center justify-center">
              <Bell className="w-5 h-5 stroke-[#7fbff2]" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-[#212121] mb-0.5">Alert Preferences</h3>
              <p className="text-[#757575] text-sm">Customize notification settings</p>
            </div>
            <ChevronRight className="w-5 h-5 stroke-[#757575]" />
          </button>
        </div>
      </div>

      {/* Support & Legal */}
      <div className="px-6 mb-6">
        <h2 className="text-[#212121] mb-4 px-1">Support & Legal</h2>
        <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100">
          <button className="w-full p-5 flex items-center gap-3 min-h-[64px] active:bg-gray-50 transition-colors">
            <div className="w-10 h-10 rounded-full bg-[#7fbff2]/20 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 stroke-[#7fbff2]" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-[#212121] mb-0.5">Help Center</h3>
              <p className="text-[#757575] text-sm">FAQs and support</p>
            </div>
            <ChevronRight className="w-5 h-5 stroke-[#757575]" />
          </button>

          <button className="w-full p-5 flex items-center gap-3 min-h-[64px] active:bg-gray-50 transition-colors">
            <div className="w-10 h-10 rounded-full bg-[#7fbff2]/20 flex items-center justify-center">
              <FileText className="w-5 h-5 stroke-[#7fbff2]" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-[#212121] mb-0.5">Terms & Privacy</h3>
              <p className="text-[#757575] text-sm">Legal information</p>
            </div>
            <ChevronRight className="w-5 h-5 stroke-[#757575]" />
          </button>
        </div>
      </div>

      {/* Sign Out */}
      <div className="px-6 pb-8">
        <button className="w-full bg-white rounded-2xl p-5 shadow-sm flex items-center justify-center gap-2 min-h-[64px] active:bg-gray-50 transition-colors">
          <LogOut className="w-5 h-5 stroke-[#E57373]" />
          <span className="text-[#E57373]">Sign Out</span>
        </button>
      </div>

      {/* App Version */}
      <div className="text-center pb-8">
        <p className="text-[#757575] text-sm mb-1">I'm Okay Guardian</p>
        <p className="text-[#757575] text-sm">Version 1.0.0</p>
      </div>
    </div>
  );
}
