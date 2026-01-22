import { useState } from 'react';
import { DependentApp } from './components/DependentApp';
import { GuardianApp } from './components/GuardianApp';

export default function App() {
  const [mode, setMode] = useState<'dependent' | 'guardian'>('dependent');

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center p-4">
      {/* Mode Switcher - For Demo Purposes */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-white rounded-full shadow-lg p-1 flex gap-1">
        <button
          onClick={() => setMode('dependent')}
          className={`px-4 py-2 rounded-full transition-all ${
            mode === 'dependent'
              ? 'bg-[#4CAF50] text-white'
              : 'bg-transparent text-[#757575] hover:bg-gray-100'
          }`}
        >
          Dependent View
        </button>
        <button
          onClick={() => setMode('guardian')}
          className={`px-4 py-2 rounded-full transition-all ${
            mode === 'guardian'
              ? 'bg-[#4CAF50] text-white'
              : 'bg-transparent text-[#757575] hover:bg-gray-100'
          }`}
        >
          Guardian View
        </button>
      </div>

      {/* Mobile Frame Container */}
      <div className="w-full max-w-[375px] h-[812px] bg-white rounded-[40px] shadow-2xl overflow-hidden relative">
        {mode === 'dependent' ? <DependentApp /> : <GuardianApp />}
      </div>
    </div>
  );
}
