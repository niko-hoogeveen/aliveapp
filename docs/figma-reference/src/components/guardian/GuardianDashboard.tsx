import { UserPlus, CheckCircle2, AlertCircle, Clock, ChevronRight } from 'lucide-react';

interface Dependent {
  id: string;
  name: string;
  initials: string;
  status: 'ok' | 'pending' | 'missed';
  lastCheckIn: string;
  nextCheckIn: string;
  relationship: string;
}

const mockDependents: Dependent[] = [
  {
    id: '1',
    name: 'Margaret Smith',
    initials: 'MS',
    status: 'ok',
    lastCheckIn: '2 hours ago',
    nextCheckIn: 'Tomorrow at 9:00 AM',
    relationship: 'Mother',
  },
  {
    id: '2',
    name: 'Robert Johnson',
    initials: 'RJ',
    status: 'pending',
    lastCheckIn: '23 hours ago',
    nextCheckIn: 'Today at 2:00 PM',
    relationship: 'Father',
  },
  {
    id: '3',
    name: 'Emma Davis',
    initials: 'ED',
    status: 'missed',
    lastCheckIn: '2 days ago',
    nextCheckIn: 'Yesterday at 10:00 AM',
    relationship: 'Aunt',
  },
];

interface GuardianDashboardProps {
  onViewDependent: (id: string) => void;
}

export function GuardianDashboard({ onViewDependent }: GuardianDashboardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok':
        return 'bg-[#4CAF50]';
      case 'pending':
        return 'bg-[#7fbff2]';
      case 'missed':
        return 'bg-[#E57373]';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok':
        return <CheckCircle2 className="w-5 h-5 stroke-white" />;
      case 'pending':
        return <Clock className="w-5 h-5 stroke-white" />;
      case 'missed':
        return <AlertCircle className="w-5 h-5 stroke-white" />;
    }
  };

  const okCount = mockDependents.filter((d) => d.status === 'ok').length;
  const pendingCount = mockDependents.filter((d) => d.status === 'pending').length;
  const missedCount = mockDependents.filter((d) => d.status === 'missed').length;

  return (
    <div className="h-full bg-[#F5F5F5] overflow-y-auto">
      {/* Header */}
      <div className="bg-gradient-to-b from-white to-[#F5F5F5] px-6 pt-14 pb-6">
        <h1 className="text-[#212121] text-3xl mb-2">Guardian Dashboard</h1>
        <p className="text-[#757575] text-base">Monitor your loved ones</p>
      </div>

      {/* Status Summary */}
      <div className="px-6 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="text-[#212121] mb-4">Status Overview</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-[#4CAF50]/20 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-6 h-6 stroke-[#4CAF50]" />
              </div>
              <div className="text-2xl text-[#212121] mb-1">{okCount}</div>
              <div className="text-xs text-[#757575]">All Good</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-[#7fbff2]/20 flex items-center justify-center mx-auto mb-2">
                <Clock className="w-6 h-6 stroke-[#7fbff2]" />
              </div>
              <div className="text-2xl text-[#212121] mb-1">{pendingCount}</div>
              <div className="text-xs text-[#757575]">Pending</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-[#E57373]/20 flex items-center justify-center mx-auto mb-2">
                <AlertCircle className="w-6 h-6 stroke-[#E57373]" />
              </div>
              <div className="text-2xl text-[#212121] mb-1">{missedCount}</div>
              <div className="text-xs text-[#757575]">Missed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Dependents List */}
      <div className="px-6 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[#212121]">Your Circle</h2>
          <button className="flex items-center gap-1 text-[#7fbff2] min-h-[40px]">
            <UserPlus className="w-5 h-5" />
            <span className="text-sm">Add</span>
          </button>
        </div>

        <div className="space-y-3">
          {mockDependents.map((dependent) => (
            <button
              key={dependent.id}
              onClick={() => onViewDependent(dependent.id)}
              className="w-full bg-white rounded-2xl p-4 shadow-sm active:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                {/* Avatar with Status */}
                <div className="relative flex-shrink-0">
                  <div className="w-14 h-14 rounded-full bg-[#4CAF50]/20 flex items-center justify-center">
                    <span className="text-[#4CAF50] text-lg">{dependent.initials}</span>
                  </div>
                  <div
                    className={`absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full ${getStatusColor(
                      dependent.status
                    )} flex items-center justify-center border-2 border-white`}
                  >
                    {getStatusIcon(dependent.status)}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 text-left">
                  <h3 className="text-[#212121] mb-0.5">{dependent.name}</h3>
                  <p className="text-[#757575] text-sm mb-1">{dependent.relationship}</p>
                  <div className="flex items-center gap-2 text-xs text-[#757575]">
                    <span>Last: {dependent.lastCheckIn}</span>
                    {dependent.status !== 'missed' && (
                      <>
                        <span>•</span>
                        <span>Next: {dependent.nextCheckIn}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Chevron */}
                <ChevronRight className="w-5 h-5 stroke-[#757575] flex-shrink-0" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 pb-8">
        <div className="bg-gradient-to-r from-[#4CAF50]/10 to-[#7fbff2]/10 rounded-2xl p-5 border border-[#4CAF50]/20">
          <h3 className="text-[#212121] mb-2">Need Help?</h3>
          <p className="text-[#757575] text-sm mb-4 leading-relaxed">
            Contact support or learn more about setting up check-in schedules
          </p>
          <button className="bg-white text-[#4CAF50] rounded-xl px-4 py-3 text-sm min-h-[48px] active:bg-gray-50 transition-colors">
            Get Support
          </button>
        </div>
      </div>
    </div>
  );
}
