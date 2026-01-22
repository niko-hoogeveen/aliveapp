import { ArrowLeft, Phone, MessageCircle, CheckCircle2, Calendar, Clock, Bell } from 'lucide-react';
import { Switch } from '../ui/switch';
import { useState } from 'react';

interface CheckInHistory {
  date: string;
  time: string;
  status: 'completed' | 'missed';
}

const mockHistory: CheckInHistory[] = [
  { date: 'Today', time: '9:00 AM', status: 'completed' },
  { date: 'Yesterday', time: '9:15 AM', status: 'completed' },
  { date: 'Jan 20', time: '8:45 AM', status: 'completed' },
  { date: 'Jan 19', time: '—', status: 'missed' },
  { date: 'Jan 18', time: '9:30 AM', status: 'completed' },
  { date: 'Jan 17', time: '9:10 AM', status: 'completed' },
];

interface GuardianDependentDetailProps {
  dependentId: string;
  onBack: () => void;
}

export function GuardianDependentDetail({ dependentId, onBack }: GuardianDependentDetailProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <div className="h-full bg-[#F5F5F5] overflow-y-auto">
      {/* Header with Back Button */}
      <div className="bg-gradient-to-b from-white to-[#F5F5F5] px-6 pt-14 pb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#7fbff2] mb-4 min-h-[40px] -ml-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        {/* Profile */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-20 h-20 rounded-full bg-[#4CAF50]/20 flex items-center justify-center relative">
            <span className="text-[#4CAF50] text-2xl">MS</span>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#4CAF50] flex items-center justify-center border-2 border-white">
              <CheckCircle2 className="w-4 h-4 stroke-white" />
            </div>
          </div>
          <div>
            <h1 className="text-[#212121] text-2xl mb-1">Margaret Smith</h1>
            <p className="text-[#757575] text-sm mb-2">Mother</p>
            <div className="flex gap-2">
              <a
                href="tel:+15551234567"
                className="bg-[#4CAF50] text-white rounded-lg px-3 py-1.5 flex items-center gap-1.5 text-sm min-h-[36px]"
              >
                <Phone className="w-4 h-4" />
                <span>Call</span>
              </a>
              <a
                href="sms:+15551234567"
                className="bg-[#7fbff2] text-white rounded-lg px-3 py-1.5 flex items-center gap-1.5 text-sm min-h-[36px]"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Message</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Status Card */}
      <div className="px-6 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[#212121]">Current Status</h2>
            <div className="bg-[#4CAF50]/20 text-[#4CAF50] px-3 py-1 rounded-full text-sm">
              All Good
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 stroke-[#757575]" />
                <span className="text-[#757575] text-sm">Last Check-in</span>
              </div>
              <span className="text-[#212121] text-sm">2 hours ago</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 stroke-[#757575]" />
                <span className="text-[#757575] text-sm">Next Expected</span>
              </div>
              <span className="text-[#212121] text-sm">Tomorrow at 9:00 AM</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 stroke-[#757575]" />
                <span className="text-[#757575] text-sm">Alert Me</span>
              </div>
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
                className="data-[state=checked]:bg-[#4CAF50]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Settings */}
      <div className="px-6 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="text-[#212121] mb-4">Check-in Schedule</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-[#757575] text-sm">Frequency</span>
              <span className="text-[#212121] text-sm">Daily</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-[#757575] text-sm">Preferred Time</span>
              <span className="text-[#212121] text-sm">9:00 AM</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-[#757575] text-sm">Reminder Window</span>
              <span className="text-[#212121] text-sm">2 hours</span>
            </div>
          </div>
          <button className="w-full bg-[#7fbff2]/10 text-[#7fbff2] rounded-xl px-4 py-3 mt-4 text-sm min-h-[48px] active:bg-[#7fbff2]/20 transition-colors">
            Edit Schedule
          </button>
        </div>
      </div>

      {/* Check-in History */}
      <div className="px-6 pb-8">
        <h2 className="text-[#212121] mb-4">Recent Check-ins</h2>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {mockHistory.map((item, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-4 ${
                index !== mockHistory.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                {item.status === 'completed' ? (
                  <div className="w-8 h-8 rounded-full bg-[#4CAF50]/20 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 stroke-[#4CAF50]" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#E57373]/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-[#E57373]" />
                  </div>
                )}
                <div>
                  <div className="text-[#212121] text-sm mb-0.5">{item.date}</div>
                  <div className="text-[#757575] text-xs">{item.time}</div>
                </div>
              </div>
              {item.status === 'completed' ? (
                <span className="text-[#4CAF50] text-xs">Completed</span>
              ) : (
                <span className="text-[#E57373] text-xs">Missed</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
