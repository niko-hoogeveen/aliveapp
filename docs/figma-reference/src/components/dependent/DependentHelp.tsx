import { Phone, MessageCircle, Heart, AlertCircle } from 'lucide-react';

export function DependentHelp() {
  const emergencyContacts = [
    { name: 'Sarah Johnson', relation: 'Guardian', phone: '(555) 123-4567' },
    { name: 'Emergency Services', relation: '911', phone: '911' },
  ];

  return (
    <div className="h-full bg-gradient-to-b from-[#E8F5E9] to-[#F5F5F5] p-6 overflow-y-auto">
      {/* Header */}
      <div className="pt-12 pb-6">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-[#7fbff2]/20 flex items-center justify-center">
            <Heart className="w-8 h-8 stroke-[#7fbff2]" />
          </div>
        </div>
        <h1 className="text-center text-[#212121] text-3xl mb-2">Help & Support</h1>
        <p className="text-center text-[#757575] text-base">
          We're here if you need us
        </p>
      </div>

      {/* Emergency Notice */}
      <div className="bg-[#E57373]/10 border-2 border-[#E57373]/30 rounded-2xl p-4 mb-6 flex gap-3">
        <AlertCircle className="w-6 h-6 stroke-[#E57373] flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-[#E57373] mb-1">Emergency?</h3>
          <p className="text-[#757575] text-sm leading-relaxed">
            In case of immediate danger or medical emergency, call 911 or your local emergency number.
          </p>
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="mb-6">
        <h2 className="text-[#212121] mb-4">Emergency Contacts</h2>
        <div className="space-y-3">
          {emergencyContacts.map((contact, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-4 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-[#212121] mb-1">{contact.name}</h3>
                  <p className="text-[#757575] text-sm">{contact.relation}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <a
                  href={`tel:${contact.phone}`}
                  className="flex-1 bg-[#4CAF50] text-white rounded-xl p-4 flex items-center justify-center gap-2 min-h-[56px] active:bg-[#45a049] transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  <span>Call</span>
                </a>
                {contact.phone !== '911' && (
                  <a
                    href={`sms:${contact.phone}`}
                    className="flex-1 bg-[#7fbff2] text-white rounded-xl p-4 flex items-center justify-center gap-2 min-h-[56px] active:bg-[#6aabdd] transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Message</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
        <h2 className="text-[#212121] mb-4">How to Use I'm Okay</h2>
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-[#4CAF50]/20 flex items-center justify-center flex-shrink-0">
              <span className="text-[#4CAF50]">1</span>
            </div>
            <div>
              <p className="text-[#212121] text-sm leading-relaxed">
                Tap the green "I'm Okay" button each day to check in
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-[#4CAF50]/20 flex items-center justify-center flex-shrink-0">
              <span className="text-[#4CAF50]">2</span>
            </div>
            <div>
              <p className="text-[#212121] text-sm leading-relaxed">
                Your guardians will be notified that you're safe
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-[#4CAF50]/20 flex items-center justify-center flex-shrink-0">
              <span className="text-[#4CAF50]">3</span>
            </div>
            <div>
              <p className="text-[#212121] text-sm leading-relaxed">
                Use this Help page to contact someone if you need assistance
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
