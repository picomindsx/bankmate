import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  MapPin,
  Users,
  BarChart3
} from 'lucide-react';
import { useData } from '../contexts/DataContext';

export default function BranchManagement() {
  const [activeTab, setActiveTab] = useState<'manage' | 'add'>('manage');
  const [editingBranch, setEditingBranch] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    manager: ''
  });

  const { branches, employees, leads, addBranch, updateBranch, deleteBranch, getLeadsByBranch } = useData();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBranch) {
      updateBranch(editingBranch, formData);
      setEditingBranch(null);
    } else {
      addBranch(formData);
    }
    setFormData({ name: '', location: '', manager: '' });
    setActiveTab('manage');
  };

  const handleEdit = (branch: any) => {
    setFormData({
      name: branch.name,
      location: branch.location,
      manager: branch.manager || ''
    });
    setEditingBranch(branch.id);
    setActiveTab('add');
  };

  const handleDelete = (id: string) => {
    const branch = branches.find(b => b.id === id);
    const branchLeads = getLeadsByBranch(id);
    const branchStaff = employees.filter(emp => emp.assignedBranch === id);
    
    if (branchLeads.length > 0 || branchStaff.length > 0) {
      const confirmMessage = `This branch has ${branchLeads.length} leads and ${branchStaff.length} staff members. Deleting will remove all associated data. Are you sure?`;
      if (!window.confirm(confirmMessage)) return;
    } else {
      if (!window.confirm(`Are you sure you want to delete ${branch?.name}?`)) return;
    }
    
    deleteBranch(id);
  };

  const renderManageBranches = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Branch Directory</h3>
            <button
              onClick={() => setActiveTab('add')}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Branch</span>
            </button>
          </div>
        </div>
        
        {branches.length > 0 ? (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {branches.map((branch) => {
                const branchLeads = getLeadsByBranch(branch.id);
                const branchStaff = employees.filter(emp => emp.assignedBranch === branch.id);
                const manager = employees.find(emp => emp.id === branch.manager);
                
                return (
                  <div key={branch.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800">{branch.name}</h4>
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span>{branch.location}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(branch)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(branch.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Manager:</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{manager?.name || 'Not Assigned'}</span>
                          {!manager && (
                            <button
                              onClick={() => handleEdit(branch)}
                              className="text-blue-600 hover:text-blue-800 text-xs"
                            >
                              Assign Manager
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Contact:</span>
                        <span className="font-medium">{manager?.phone || 'N/A'}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-blue-50 p-3 rounded-lg text-center">
                          <div className="flex items-center justify-center mb-1">
                            <BarChart3 className="w-4 h-4 text-blue-600 mr-1" />
                            <span className="font-semibold text-blue-800">Leads</span>
                          </div>
                          <div className="text-xl font-bold text-blue-600">{branchLeads.length}</div>
                        </div>
                        
                        <div className="bg-green-50 p-3 rounded-lg text-center">
                          <div className="flex items-center justify-center mb-1">
                            <Users className="w-4 h-4 text-green-600 mr-1" />
                            <span className="font-semibold text-green-800">Staff</span>
                          </div>
                          <div className="text-xl font-bold text-green-600">{branchStaff.length}</div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-gray-200">
                        <div className="text-xs text-gray-500 space-y-1">
                          <div>New Leads: {branchLeads.filter(lead => lead.status === 'New').length}</div>
                          <div>Active: {branchLeads.filter(lead => !['Closed', 'Disbursed'].includes(lead.status)).length}</div>
                          <div>Completed: {branchLeads.filter(lead => ['Disbursed', 'Closed'].includes(lead.status)).length}</div>
                        </div>
                      </div>

                      {manager && (
                        <div className="pt-3 border-t border-gray-200">
                          <div className="bg-blue-50 p-2 rounded text-center">
                            <div className="text-xs font-medium text-blue-800">Manager Performance</div>
                            <div className="text-xs text-blue-600">
                              {branchLeads.filter(lead => lead.assignedStaff === manager.id).length} leads managed
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-6 text-center">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No branches added yet</p>
          </div>
        )}
      </div>

      {/* Manager Assignment Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Manager Assignment Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {branches.filter(branch => branch.manager).length}
              </div>
              <div className="text-sm text-green-800">Branches with Managers</div>
            </div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {branches.filter(branch => !branch.manager).length}
              </div>
              <div className="text-sm text-orange-800">Branches without Managers</div>
            </div>
          </div>
        </div>
        
        {branches.filter(branch => !branch.manager).length > 0 && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-2">Branches Needing Manager Assignment:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              {branches.filter(branch => !branch.manager).map(branch => (
                <li key={branch.id} className="flex items-center justify-between">
                  <span>• {branch.name} ({branch.location})</span>
                  <button
                    onClick={() => handleEdit(branch)}
                    className="text-blue-600 hover:text-blue-800 text-xs underline"
                  >
                    Assign Manager
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );

  const renderAddBranch = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">
        {editingBranch ? 'Edit Branch' : 'Add New Branch'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Branch Name *
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter branch name"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter branch location"
                required
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Branch Manager
            </label>
            <select
              value={formData.manager}
              onChange={(e) => setFormData(prev => ({ ...prev, manager: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">Select Manager</option>
              {employees.filter(emp => 
                emp.role === 'manager' || 
                emp.designation.toLowerCase().includes('manager') ||
                emp.designation === 'Branch Head'
              ).map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name} - {emp.designation}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{editingBranch ? 'Update Branch' : 'Add Branch'}</span>
          </button>
          
          <button
            type="button"
            onClick={() => {
              setActiveTab('manage');
              setEditingBranch(null);
              setFormData({ name: '', location: '', manager: '' });
            }}
            className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
          >
            <X className="w-4 h-4" />
            <span>Cancel</span>
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Branch Management</h2>
        <div className="text-sm text-gray-600">
          Total Branches: {branches.length}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('manage')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'manage'
              ? 'bg-white text-red-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Manage Branches</span>
        </button>
        
        <button
          onClick={() => setActiveTab('add')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'add'
              ? 'bg-white text-red-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>{editingBranch ? 'Edit Branch' : 'Add Branch'}</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'manage' && renderManageBranches()}
      {activeTab === 'add' && renderAddBranch()}
    </div>
  );
}