import React, { useEffect } from 'react';
import { Shield, ShieldOff } from 'lucide-react';
import { usePrivacyStore } from '../store/privacyStore';

export function PrivacyToggle() {
  const { isPrivacyMode, togglePrivacyMode, setPrivacyMode } = usePrivacyStore();

  // Reset privacy mode when on main site
  useEffect(() => {
    if (!window.location.pathname.includes('/no-js/')) {
      setPrivacyMode(false);
    }
  }, [setPrivacyMode]);

  return (
    <button
      onClick={togglePrivacyMode}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
      title={isPrivacyMode ? 'Disable No-JS Mode' : 'Enable No-JS Mode'}
    >
      {isPrivacyMode ? (
        <>
          <Shield className="h-4 w-4 text-green-400" />
          <span className="text-sm text-green-400">No-JS Mode</span>
        </>
      ) : (
        <>
          <ShieldOff className="h-4 w-4 text-gray-400" />
          <span className="text-sm">No-JS Mode</span>
        </>
      )}
    </button>
  );
}