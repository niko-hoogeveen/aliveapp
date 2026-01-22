import { useState } from 'react';
import { Heart, Check, HelpCircle, Settings } from 'lucide-react';
import { motion } from 'motion/react';

export function DependentHome() {
  const [lastCheckIn, setLastCheckIn] = useState<Date | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleCheckIn = () => {
    setIsAnimating(true);
    setLastCheckIn(new Date());
    setTimeout(() => setIsAnimating(false), 2000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-[#E8F5E9] to-[#F5F5F5] p-6 relative">
      {/* Top Section */}
      <div className="flex-shrink-0 pt-12 pb-6">
        <div className="flex items-center justify-center mb-4">
          <Heart className="w-8 h-8 fill-[#4CAF50] stroke-[#4CAF50]" />
        </div>
        <h1 className="text-center text-[#212121] text-3xl mb-2">I'm Okay</h1>
        {lastCheckIn && (
          <p className="text-center text-[#757575] text-base">
            Last check-in: {formatTime(lastCheckIn)}
          </p>
        )}
      </div>

      {/* Main Check-in Button */}
      <div className="flex-1 flex items-center justify-center">
        <motion.button
          onClick={handleCheckIn}
          className="relative w-64 h-64 rounded-full bg-[#4CAF50] shadow-2xl flex flex-col items-center justify-center group active:scale-95 transition-transform"
          whileTap={{ scale: 0.95 }}
          animate={isAnimating ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.5 }}
        >
          {/* Ripple effect when pressed */}
          {isAnimating && (
            <motion.div
              className="absolute inset-0 rounded-full bg-white opacity-30"
              initial={{ scale: 0, opacity: 0.6 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 1 }}
            />
          )}
          
          {isAnimating ? (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Check className="w-24 h-24 stroke-white stroke-[3px]" />
            </motion.div>
          ) : (
            <div className="flex flex-col items-center">
              <Heart className="w-20 h-20 fill-white stroke-white mb-3" />
              <span className="text-white text-2xl">I'm Okay</span>
            </div>
          )}
        </motion.button>
      </div>

      {/* Bottom Info */}
      <div className="flex-shrink-0 pb-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm">
          <p className="text-center text-[#757575] text-sm leading-relaxed">
            Tap the button to let your guardians know you're doing well
          </p>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex-shrink-0 flex gap-3 pb-6">
        <button className="flex-1 bg-white rounded-xl p-4 shadow-sm flex items-center justify-center gap-2 min-h-[56px] active:bg-gray-50 transition-colors">
          <HelpCircle className="w-5 h-5 stroke-[#7fbff2]" />
          <span className="text-[#212121]">Help</span>
        </button>
        <button className="flex-1 bg-white rounded-xl p-4 shadow-sm flex items-center justify-center gap-2 min-h-[56px] active:bg-gray-50 transition-colors">
          <Settings className="w-5 h-5 stroke-[#757575]" />
          <span className="text-[#212121]">Settings</span>
        </button>
      </div>
    </div>
  );
}
