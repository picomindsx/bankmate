import React, { useState } from 'react';
import { 
  Building2, 
  LayoutDashboard, 
  Users, 
  Settings, 
  FolderOpen, 
  Bell,
  LogOut,
  Edit3,
  Plus,
  Eye,
  UserMinus,
  Trash2,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import StaffManagement from './StaffManagement';
import LeadManagement from './LeadManagement';
import SettingsPanel from './SettingsPanel';
import ReportsPanel from './ReportsPanel';
import FileManager from './FileManager';

export default function OfficialDashboard() {
  const [activeMenu, setActiveMenu] = useState<'dashboard' | 'staff-management' | 'reports' | 'settings' | 'file-manager'>('dashboard');
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [editingBranch, setEditingBranch] = useState<string | null>(null);
  const [branchName, setBranchName] = useState('');

  const { user, logout } = useAuth();
  const { branches, updateBranch, notifications, clearNotifications } = useData();

  const handleEditBranch = (branchId: string, currentName: string) => {
    setEditingBranch(branchId);
    setBranchName(currentName);
  };

  const handleSaveBranch = (branchId: string) => {
    if (branchName.trim()) {
      updateBranch(branchId, branchName.trim());
      setEditingBranch(null);
      setBranchName('');
    }
  };

  const handleBranchClick = (branchId: string) => {
    setSelectedBranch(branchId);
    setActiveMenu('lead-management');
  };

  const renderContent = () => {
    if (activeMenu === 'lead-management' && selectedBranch) {
      const branch = branches.find(b => b.id === selectedBranch);
      return (
        <LeadManagement 
          branchId={selectedBranch} 
          branchName={branch?.name || ''} 
          onBack={() => {
            setSelectedBranch(null);
            setActiveMenu('dashboard');
          }}
        />
      );
    }

    switch (activeMenu) {
      case 'staff-management':
        return <StaffManagement />;
      case 'reports':
        return <ReportsPanel />;
      case 'settings':
        return <SettingsPanel />;
      case 'file-manager':
        return <FileManager />;
      default:
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Bell 
                    className="w-6 h-6 text-gray-600 cursor-pointer hover:text-red-600" 
                    onClick={clearNotifications}
                  />
                  {notifications > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {notifications}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {branches.map((branch) => (
                <div key={branch.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    {editingBranch === branch.id ? (
                      <div className="flex items-center space-x-2 flex-1">
                        <input
                          type="text"
                          value={branchName}
                          onChange={(e) => setBranchName(e.target.value)}
                          className="flex-1 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          onKeyPress={(e) => e.key === 'Enter' && handleSaveBranch(branch.id)}
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveBranch(branch.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-lg font-semibold text-gray-800">{branch.name}</h3>
                        <button
                          onClick={() => handleEditBranch(branch.id, branch.name)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <button
                      onClick={() => handleBranchClick(branch.id)}
                      className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Lead Management
                    </button>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-gray-50 p-2 rounded text-center">
                        <div className="font-semibold text-gray-800">Active Leads</div>
                        <div className="text-red-600">0</div>
                      </div>
                      <div className="bg-gray-50 p-2 rounded text-center">
                        <div className="font-semibold text-gray-800">Converted</div>
                        <div className="text-green-600">0</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-800">Bankmate Solutions</h1>
              <p className="text-sm text-gray-600">Official Panel</p>
            </div>
          </div>
        </div>

        <nav className="mt-6">
          <div className="px-4 space-y-2">
            <button
              onClick={() => {
                setActiveMenu('dashboard');
                setSelectedBranch(null);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeMenu === 'dashboard' && !selectedBranch
                  ? 'bg-red-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => {
                setActiveMenu('staff-management');
                setSelectedBranch(null);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeMenu === 'staff-management'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Staff Management</span>
            </button>

            <button
              onClick={() => {
                setActiveMenu('reports');
                setSelectedBranch(null);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeMenu === 'reports'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span>Reports</span>
            </button>

            <button
              onClick={() => {
                setActiveMenu('settings');
                setSelectedBranch(null);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeMenu === 'settings'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </button>

            <button
              onClick={() => {
                setActiveMenu('file-manager');
                setSelectedBranch(null);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeMenu === 'file-manager'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FolderOpen className="w-5 h-5" />
              <span>File Manager</span>
            </button>
          </div>
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.name?.charAt(0) || 'A'}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                <p className="text-xs text-gray-600">Administrator</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {renderContent()}
      </div>
    </div>
  );
}