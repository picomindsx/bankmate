import React, { useState } from 'react';
import { Plus, Eye, UserMinus, Trash2, Edit, Save, X, User, Phone, Mail, Briefcase, Camera, Key } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { Building2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function StaffManagement() {
  const [activeTab, setActiveTab] = useState<'add' | 'view' | 'branch-view' | 'resignation' | 'delete'>('add');
  const [editingEmployee, setEditingEmployee] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [passwordModal, setPasswordModal] = useState<{ isOpen: boolean; employeeId: string; employeeName: string }>({ isOpen: false, employeeId: '', employeeName: '' });
  const [newPassword, setNewPassword] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    designation: '',
    email: '',
    photo: '',
    assignedBranch: ''
  });

  const { employees, branches, addEmployee, updateEmployee, deleteEmployee, updateEmployeePassword } = useData();
  const { user } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEmployee) {
      updateEmployee(editingEmployee, formData);
      setEditingEmployee(null);
    } else {
      addEmployee(formData);
    }
    setFormData({
      name: '',
      phone: '',
      password: '',
      designation: '',
      email: '',
      photo: '',
      assignedBranch: ''
    });
  };

  const handleEdit = (employee: any) => {
    setFormData({
      name: employee.name,
      phone: employee.phone,
      password: employee.password,
      designation: employee.designation,
      email: employee.email,
      photo: employee.photo || '',
      assignedBranch: employee.assignedBranch || ''
    });
    setEditingEmployee(employee.id);
    setActiveTab('add');
  };

  const handleDelete = (id: string) => {
    // Only owner can delete staff
    if (user?.role !== 'owner') {
      alert('Only the owner can delete staff members.');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this employee?')) {
      deleteEmployee(id);
    }
  };

  const openPasswordModal = (employeeId: string, employeeName: string) => {
    setPasswordModal({ isOpen: true, employeeId, employeeName });
    setNewPassword('');
  };

  const handlePasswordUpdate = () => {
    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }
    
    updateEmployeePassword(passwordModal.employeeId, newPassword);
    setPasswordModal({ isOpen: false, employeeId: '', employeeName: '' });
    setNewPassword('');
    alert('Password updated successfully!');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, photo: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const renderAddStaff = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">
        {editingEmployee ? 'Edit Staff Member' : 'Add New Staff Member'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Staff Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter staff name"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter phone number"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter password"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Designation *
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={formData.designation}
                onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              >
                <option value="">Select Designation</option>
                <option value="Branch Head">Branch Head</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
                <option value="Executive">Executive</option>
                <option value="Telecaller">Telecaller</option>
                <option value="Assistant">Assistant</option>
                <option value="Trainee">Trainee</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email ID *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter email address"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assigned Branch *
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={formData.assignedBranch}
                onChange={(e) => setFormData(prev => ({ ...prev, assignedBranch: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              >
                <option value="">Select Branch</option>
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>{branch.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Staff Photo
            </label>
            <div className="flex items-center space-x-4">
              {formData.photo && (
                <img 
                  src={formData.photo} 
                  alt="Staff" 
                  className="w-16 h-16 rounded-full object-cover"
                />
              )}
              <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                <Camera className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">Upload Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{editingEmployee ? 'Update Staff' : 'Add Staff'}</span>
          </button>
          
          {editingEmployee && (
            <button
              type="button"
              onClick={() => {
                setEditingEmployee(null);
                setFormData({
                  name: '',
                  phone: '',
                  password: '',
                  designation: '',
                  email: '',
                  photo: '',
                  assignedBranch: ''
                });
              }}
              className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );

  const renderViewStaff = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Staff Directory</h3>
          <p className="text-sm text-gray-600">
            Only official users can view, edit, and delete staff members
          </p>
        </div>
      </div>
      
      {employees.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Staff
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Designation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Branch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.map((employee) => (
                <tr key={employee.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {employee.photo ? (
                        <img 
                          src={employee.photo} 
                          alt={employee.name} 
                          className="w-10 h-10 rounded-full object-cover mr-4"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center mr-4">
                          <span className="text-white text-sm font-medium">
                            {employee.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                        <div className="text-sm text-gray-500">{employee.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {employee.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {employee.designation}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {branches.find(b => b.id === employee.assignedBranch)?.name || 'Not Assigned'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(employee)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {user?.role === 'owner' && (
                        <button
                          onClick={() => openPasswordModal(employee.id, employee.name)}
                          className="text-green-600 hover:text-green-900 p-1"
                          title="Change Password (Owner Only)"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                      )}
                      {user?.role === 'owner' && (
                        <button
                          onClick={() => handleDelete(employee.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Delete Staff (Owner Only)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-6 text-center">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No staff members added yet</p>
        </div>
      )}
    </div>
  );

  const renderBranchWiseView = () => (
    <div className="space-y-6">
      {/* Branch Filter */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Branch-wise Staff View</h3>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">All Branches</option>
            {branches.map(branch => (
              <option key={branch.id} value={branch.id}>{branch.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Branch Staff Cards */}
      {branches
        .filter(branch => !selectedBranch || branch.id === selectedBranch)
        .map(branch => {
          const branchStaff = employees.filter(emp => emp.assignedBranch === branch.id);
          const manager = employees.find(emp => emp.id === branch.manager);
          
          return (
            <div key={branch.id} className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Building2 className="w-6 h-6 text-red-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{branch.name}</h3>
                      <p className="text-sm text-gray-600">{branch.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-800">
                      {branchStaff.length} Staff Members
                    </div>
                    {manager && (
                      <div className="text-sm text-gray-600">
                        Manager: {manager.name}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {branchStaff.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {branchStaff.map(employee => (
                      <div key={employee.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-3 mb-3">
                          {employee.photo ? (
                            <img 
                              src={employee.photo} 
                              alt={employee.name} 
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium">
                                {employee.name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div>
                            <h4 className="font-medium text-gray-800">{employee.name}</h4>
                            <p className="text-sm text-gray-600">{employee.designation}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4" />
                            <span>{employee.phone}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4" />
                            <span>{employee.email}</span>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex space-x-2">
                          <button
                            onClick={() => handleEdit(employee)}
                            className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
                          >
                            <Edit className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          {user?.role === 'owner' && (
                            <button
                              onClick={() => handleDelete(employee.id)}
                              className="flex-1 bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 transition-colors flex items-center justify-center space-x-1"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Delete</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No staff assigned to this branch</p>
                    <button
                      onClick={() => setActiveTab('add')}
                      className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Add Staff Member
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
    </div>
  );

  return (
    <>
      <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Staff Management</h2>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('add')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'add'
              ? 'bg-white text-red-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff</span>
        </button>
        
        <button
          onClick={() => setActiveTab('view')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'view'
              ? 'bg-white text-red-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>View Staff</span>
        </button>
        
        <button
          onClick={() => setActiveTab('branch-view')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'branch-view'
              ? 'bg-white text-red-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Branch-wise View</span>
        </button>
        
        <button
          onClick={() => setActiveTab('resignation')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'resignation'
              ? 'bg-white text-red-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <UserMinus className="w-4 h-4" />
          <span>Resignation</span>
        </button>
        
        <button
          onClick={() => setActiveTab('delete')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'delete'
              ? 'bg-white text-red-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete Staff</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'add' && renderAddStaff()}
      {activeTab === 'view' && renderViewStaff()}
      {activeTab === 'branch-view' && renderBranchWiseView()}
      {activeTab === 'resignation' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Submit Resignation</h3>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Staff Member *
                  </label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" required>
                    <option value="">Select Staff Member</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name} - {emp.designation}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resignation Date *
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Working Day *
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Resignation *
                  </label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" required>
                    <option value="">Select Reason</option>
                    <option value="Better Opportunity">Better Opportunity</option>
                    <option value="Personal Reasons">Personal Reasons</option>
                    <option value="Health Issues">Health Issues</option>
                    <option value="Relocation">Relocation</option>
                    <option value="Career Change">Career Change</option>
                    <option value="Family Reasons">Family Reasons</option>
                    <option value="Higher Studies">Higher Studies</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Detailed Reason / Comments
                </label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Please provide detailed reason for resignation..."
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notice Period
                </label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent">
                  <option value="30">30 Days</option>
                  <option value="15">15 Days</option>
                  <option value="7">7 Days</option>
                  <option value="immediate">Immediate</option>
                </select>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">Important Notes</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• All pending leads will be reassigned to other staff members</li>
                  <li>• Complete handover documentation is required</li>
                  <li>• Final settlement will be processed after clearance</li>
                  <li>• Company assets must be returned before last working day</li>
                </ul>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                >
                  <UserMinus className="w-4 h-4" />
                  <span>Submit Resignation</span>
                </button>
                
                <button
                  type="button"
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Pending Resignations</h3>
            </div>
            
            <div className="p-6">
              <div className="text-center py-8">
                <UserMinus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No pending resignations</p>
              </div>
            </div>
          </div>
        </div>
      )}
      {activeTab === 'delete' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Delete Staff</h3>
          <p className="text-gray-600">Use the View Staff tab to delete individual staff members.</p>
        </div>
      )}
      </div>

      {/* Password Update Modal */}
      {passwordModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Change Password for {passwordModal.employeeName}
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter new password (min 6 characters)"
                minLength={6}
              />
            </div>

            <div className="bg-yellow-50 p-3 rounded-lg mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> The employee will need to use this new password for their next login.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setPasswordModal({ isOpen: false, employeeId: '', employeeName: '' })}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordUpdate}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <Key className="w-4 h-4" />
                <span>Update Password</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}