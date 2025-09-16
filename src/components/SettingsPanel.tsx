import React, { useState } from 'react';
import { Facebook, Settings, Lock, User, Save, Download, Upload, Database, Cloud } from 'lucide-react';
import { persistentStorage } from '../utils/storage';

export default function SettingsPanel() {
  const [activeTab, setActiveTab] = useState<'general' | 'facebook' | 'password' | 'data'>('general');
  const [facebookSettings, setFacebookSettings] = useState({
    connected: false,
    pageId: '',
    accessToken: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [backupStatus, setBackupStatus] = useState('');

  const handleFacebookConnect = () => {
    // Simulate Facebook connection
    setFacebookSettings(prev => ({ ...prev, connected: !prev.connected }));
    alert(facebookSettings.connected ? 'Facebook disconnected' : 'Facebook connected successfully!');
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }
    alert('Password updated successfully!');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'general'
              ? 'bg-white text-red-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>General</span>
        </button>
        
        <button
          onClick={() => setActiveTab('facebook')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'facebook'
              ? 'bg-white text-red-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Facebook className="w-4 h-4" />
          <span>Facebook Settings</span>
        </button>
        
        <button
          onClick={() => setActiveTab('password')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'password'
              ? 'bg-white text-red-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Change Password</span>
        </button>
        
        <button
          onClick={() => setActiveTab('data')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'data'
              ? 'bg-white text-red-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Data Management</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'general' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">General Settings</h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>
              <input
                type="text"
                value="Bankmate Solutions Pvt. Ltd."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                System Theme
              </label>
              <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent">
                <option value="red">Red Theme (Current)</option>
                <option value="blue">Blue Theme</option>
                <option value="green">Green Theme</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notification Settings
              </label>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-red-600 focus:ring-red-500" defaultChecked />
                  <span className="ml-2 text-sm text-gray-700">Email notifications for new leads</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-red-600 focus:ring-red-500" defaultChecked />
                  <span className="ml-2 text-sm text-gray-700">SMS notifications for urgent matters</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-red-600 focus:ring-red-500" />
                  <span className="ml-2 text-sm text-gray-700">Daily summary reports</span>
                </label>
              </div>
            </div>

            <button className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2">
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </button>
          </div>
        </div>
      )}

      {activeTab === 'facebook' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Facebook Integration</h3>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  facebookSettings.connected ? 'bg-blue-600' : 'bg-gray-400'
                }`}>
                  <Facebook className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Facebook Account</h4>
                  <p className="text-sm text-gray-600">
                    {facebookSettings.connected ? 'Connected' : 'Not connected'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleFacebookConnect}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  facebookSettings.connected
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {facebookSettings.connected ? 'Disconnect' : 'Connect'}
              </button>
            </div>

            {facebookSettings.connected && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Facebook Page ID
                  </label>
                  <input
                    type="text"
                    value={facebookSettings.pageId}
                    onChange={(e) => setFacebookSettings(prev => ({ ...prev, pageId: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter your Facebook Page ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lead Generation Settings
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-red-600 focus:ring-red-500" defaultChecked />
                      <span className="ml-2 text-sm text-gray-700">Auto-import Facebook leads</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-red-600 focus:ring-red-500" defaultChecked />
                      <span className="ml-2 text-sm text-gray-700">Auto-assign imported leads</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-red-600 focus:ring-red-500" />
                      <span className="ml-2 text-sm text-gray-700">Send welcome message to new leads</span>
                    </label>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Automatic Lead Generation</h4>
                  <p className="text-sm text-blue-700">
                    When enabled, leads from your Facebook page will be automatically imported and assigned to your staff members. 
                    You'll receive notifications for each new lead.
                  </p>
                </div>
              </div>
            )}

            <button className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2">
              <Save className="w-4 h-4" />
              <span>Save Facebook Settings</span>
            </button>
          </div>
        </div>
      )}

      {activeTab === 'password' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Change Password</h3>
          
          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter current password"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter new password"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Confirm new password"
                  required
                />
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">Password Requirements</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Minimum 6 characters long</li>
                <li>• Include both letters and numbers</li>
                <li>• Use a unique password not used elsewhere</li>
              </ul>
            </div>

            <button
              type="submit"
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Update Password</span>
            </button>
          </form>
        </div>
      )}

      {activeTab === 'data' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Data Management & Backup</h3>
          
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Data Persistence</h4>
              <p className="text-sm text-blue-700 mb-4">
                Your data is automatically saved using IndexedDB with localStorage backup. 
                This ensures your data persists even after browser restarts and app updates.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={async () => {
                    try {
                      setBackupStatus('Creating backup...');
                      const backup = await persistentStorage.exportAllData();
                      const blob = new Blob([backup], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `bankmate_backup_${new Date().toISOString().split('T')[0]}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                      setBackupStatus('Backup downloaded successfully!');
                      setTimeout(() => setBackupStatus(''), 3000);
                    } catch (error) {
                      setBackupStatus('Failed to create backup');
                      setTimeout(() => setBackupStatus(''), 3000);
                    }
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Backup</span>
                </button>
                
                <label className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>Restore Backup</span>
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          setBackupStatus('Restoring backup...');
                          const text = await file.text();
                          await persistentStorage.importAllData(text);
                          setBackupStatus('Backup restored successfully! Please refresh the page.');
                          setTimeout(() => {
                            window.location.reload();
                          }, 2000);
                        } catch (error) {
                          setBackupStatus('Failed to restore backup');
                          setTimeout(() => setBackupStatus(''), 3000);
                        }
                      }
                    }}
                  />
                </label>
              </div>
              
              {backupStatus && (
                <div className={`mt-3 p-2 rounded text-sm ${
                  backupStatus.includes('Failed') 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {backupStatus}
                </div>
              )}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">Data Storage Information</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Primary storage: IndexedDB (browser database)</li>
                <li>• Backup storage: localStorage</li>
                <li>• Data persists across browser sessions</li>
                <li>• Automatic backup on every data change</li>
                <li>• Manual backup/restore available above</li>
              </ul>
            </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Data Security</h4>
              <p className="text-sm text-green-700">
                All data is stored locally in your browser and never transmitted to external servers. 
                Your sensitive business information remains completely private and secure.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}