import React from 'react';
import { Cloud, CloudOff, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useCloudData } from '../contexts/CloudDataContext';
import { useNetlifyAuth } from '../contexts/NetlifyAuthContext';

export default function CloudSyncIndicator() {
  const { isOnline, lastSync, syncData } = useCloudData();
  const { user } = useNetlifyAuth();

  if (!user) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`flex items-center space-x-2 px-4 py-2 rounded-full shadow-lg backdrop-blur-sm border ${
        isOnline 
          ? 'bg-green-50/90 border-green-200 text-green-800' 
          : 'bg-red-50/90 border-red-200 text-red-800'
      }`}>
        {isOnline ? (
          <>
            <Cloud className="w-4 h-4" />
            <span className="text-sm font-medium">Cloud Connected</span>
          </>
        ) : (
          <>
            <CloudOff className="w-4 h-4" />
            <span className="text-sm font-medium">Offline Mode</span>
          </>
        )}
        
        {lastSync && (
          <div className="text-xs text-gray-600 border-l border-gray-300 pl-2">
            Last sync: {lastSync.toLocaleTimeString()}
          </div>
        )}
        
        {isOnline && (
          <button
            onClick={syncData}
            className="p-1 hover:bg-white/50 rounded-full transition-colors"
            title="Manual sync"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}