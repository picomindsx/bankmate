import React, { useState, useEffect } from 'react';
import { NetlifyAuthProvider, useNetlifyAuth } from './contexts/NetlifyAuthContext';
import { CloudDataProvider } from './contexts/CloudDataContext';
import LoginPage from './components/LoginPage';
import OwnerDashboard from './components/OwnerDashboard';
import EmployeeDashboard from './components/EmployeeDashboard';
import StaffDashboard from './components/StaffDashboard';
import CloudSyncIndicator from './components/CloudSyncIndicator';

function AppContent() {
  const { user, loading } = useNetlifyAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <div className="text-gray-800 text-xl font-medium">Loading Bankmate Solutions...</div>
          <div className="text-gray-600 text-sm mt-2">Connecting to cloud storage</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  // Determine which dashboard to show based on user role
  if (user.role === 'owner') {
    return (
      <>
        <CloudSyncIndicator />
        <OwnerDashboard />
      </>
    );
  } else if (user.role === 'manager' || user.designation === 'Branch Head' || user.designation === 'Admin') {
    return (
      <>
        <CloudSyncIndicator />
        <EmployeeDashboard />
      </>
    );
  } else {
    return (
      <>
        <CloudSyncIndicator />
        <StaffDashboard />
      </>
    );
  }
}

function App() {
  return (
    <NetlifyAuthProvider>
      <CloudDataProvider>
        <AppContent />
      </CloudDataProvider>
    </NetlifyAuthProvider>
  );
}

export default App;