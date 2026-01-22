import { AlertCircle, CheckCircle2, Clock, Bell, BellOff } from 'lucide-react';

interface Alert {
  id: string;
  type: 'missed' | 'late' | 'completed';
  dependent: string;
  initials: string;
  message: string;
  time: string;
  isNew: boolean;
}

const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'missed',
    dependent: 'Emma Davis',
    initials: 'ED',
    message: 'Missed check-in - expected yesterday at 10:00 AM',
    time: '1 day ago',
    isNew: true,
  },
  {
    id: '2',
    type: 'late',
    dependent: 'Robert Johnson',
    initials: 'RJ',
    message: 'Check-in overdue by 45 minutes',
    time: '45 min ago',
    isNew: true,
  },
  {
    id: '3',
    type: 'completed',
    dependent: 'Margaret Smith',
    initials: 'MS',
    message: 'Daily check-in completed',
    time: '2 hours ago',
    isNew: false,
  },
  {
    id: '4',
    type: 'completed',
    dependent: 'Robert Johnson',
    initials: 'RJ',
    message: 'Daily check-in completed',
    time: 'Yesterday',
    isNew: false,
  },
];

export function GuardianAlerts() {
  const getAlertStyle = (type: string) => {
    switch (type) {
      case 'missed':
        return {
          bg: 'bg-[#E57373]/10',
          border: 'border-[#E57373]/20',
          icon: <AlertCircle className="w-5 h-5 stroke-[#E57373]" />,
          iconBg: 'bg-[#E57373]/20',
        };
      case 'late':
        return {
          bg: 'bg-[#7fbff2]/10',
          border: 'border-[#7fbff2]/20',
          icon: <Clock className="w-5 h-5 stroke-[#7fbff2]" />,
          iconBg: 'bg-[#7fbff2]/20',
        };
      case 'completed':
        return {
          bg: 'bg-white',
          border: 'border-gray-100',
          icon: <CheckCircle2 className="w-5 h-5 stroke-[#4CAF50]" />,
          iconBg: 'bg-[#4CAF50]/20',
        };
      default:
        return {
          bg: 'bg-white',
          border: 'border-gray-100',
          icon: <Bell className="w-5 h-5 stroke-[#757575]" />,
          iconBg: 'bg-gray-100',
        };
    }
  };

  const newAlertsCount = mockAlerts.filter((a) => a.isNew).length;
  const hasAlerts = mockAlerts.length > 0;

  return (
    <div className="h-full bg-[#F5F5F5] overflow-y-auto">
      {/* Header */}
      <div className="bg-gradient-to-b from-white to-[#F5F5F5] px-6 pt-14 pb-6">
        <h1 className="text-[#212121] text-3xl mb-2">Alerts</h1>
        <p className="text-[#757575] text-base">
          {newAlertsCount > 0
            ? `${newAlertsCount} new notification${newAlertsCount > 1 ? 's' : ''}`
            : 'All caught up'}
        </p>
      </div>

      {/* Quick Actions */}
      {hasAlerts && (
        <div className="px-6 mb-6">
          <div className="flex gap-3">
            <button className="flex-1 bg-white rounded-xl px-4 py-3 shadow-sm flex items-center justify-center gap-2 text-sm min-h-[48px] active:bg-gray-50 transition-colors">
              <CheckCircle2 className="w-4 h-4 stroke-[#4CAF50]" />
              <span className="text-[#212121]">Mark All Read</span>
            </button>
            <button className="bg-white rounded-xl px-4 py-3 shadow-sm flex items-center justify-center min-w-[48px] active:bg-gray-50 transition-colors">
              <BellOff className="w-5 h-5 stroke-[#757575]" />
            </button>
          </div>
        </div>
      )}

      {/* Alerts List */}
      <div className="px-6 pb-8">
        {hasAlerts ? (
          <div className="space-y-3">
            {mockAlerts.map((alert) => {
              const style = getAlertStyle(alert.type);
              return (
                <div
                  key={alert.id}
                  className={`${style.bg} rounded-2xl p-4 border-2 ${style.border} relative ${
                    alert.isNew ? 'shadow-sm' : ''
                  }`}
                >
                  {alert.isNew && (
                    <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#4CAF50]" />
                  )}
                  <div className="flex gap-3">
                    <div className={`w-10 h-10 rounded-full ${style.iconBg} flex items-center justify-center flex-shrink-0`}>
                      {style.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="text-[#212121]">{alert.dependent}</h3>
                      </div>
                      <p className="text-[#757575] text-sm leading-relaxed mb-2">
                        {alert.message}
                      </p>
                      <p className="text-[#757575] text-xs">{alert.time}</p>
                    </div>
                  </div>

                  {/* Action Buttons for Critical Alerts */}
                  {(alert.type === 'missed' || alert.type === 'late') && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                      <a
                        href="tel:+1234567890"
                        className="flex-1 bg-white text-[#212121] rounded-lg px-3 py-2 text-sm text-center min-h-[40px] flex items-center justify-center active:bg-gray-50 transition-colors"
                      >
                        Call Now
                      </a>
                      <button className="flex-1 bg-[#7fbff2] text-white rounded-lg px-3 py-2 text-sm min-h-[40px] active:bg-[#6aabdd] transition-colors">
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-20 h-20 rounded-full bg-[#4CAF50]/20 flex items-center justify-center mb-4">
              <Bell className="w-10 h-10 stroke-[#4CAF50]" />
            </div>
            <h3 className="text-[#212121] mb-2">No Alerts</h3>
            <p className="text-[#757575] text-sm text-center max-w-[250px] leading-relaxed">
              You'll be notified here when a check-in is missed or completed
            </p>
          </div>
        )}
      </div>

      {/* Alert Preferences */}
      <div className="px-6 pb-8">
        <div className="bg-gradient-to-r from-[#4CAF50]/10 to-[#7fbff2]/10 rounded-2xl p-5 border border-[#4CAF50]/20">
          <h3 className="text-[#212121] mb-2">Alert Settings</h3>
          <p className="text-[#757575] text-sm mb-4 leading-relaxed">
            Customize when and how you receive notifications
          </p>
          <button className="bg-white text-[#4CAF50] rounded-xl px-4 py-3 text-sm min-h-[48px] active:bg-gray-50 transition-colors">
            Manage Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
