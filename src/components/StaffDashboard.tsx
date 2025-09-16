import React, { useState } from 'react';
import { 
  Building2, 
  Bell, 
  LogOut, 
  User, 
  FileText,
  MessageSquare,
  CheckCircle,
  Clock,
  AlertTriangle,
  Phone,
  Mail,
  DollarSign,
  UserCheck,
  Calendar,
  Target,
  Eye,
  Edit3
} from 'lucide-react';
import { useNetlifyAuth } from '../contexts/NetlifyAuthContext';
import { useCloudData } from '../contexts/CloudDataContext';
import DocumentManager from './DocumentManager';

export default function StaffDashboard() {
  const { user, logout } = useNetlifyAuth();
  const { 
    leads, 
    tasks, 
    notifications, 
    clearNotifications, 
    getAssignedLeadsByStaff,
    getTasksByStaff,
    updateLeadStatus,
    employees
  } = useCloudData();
  
  const [selectedLead, setSelectedLead] = useState<string | null>(null);
  const [remarksModal, setRemarksModal] = useState<{ leadId: string; isOpen: boolean }>({ leadId: '', isOpen: false });
  const [remarksText, setRemarksText] = useState('');

  // Get leads specifically assigned to this staff member
  const myAssignedLeads = getAssignedLeadsByStaff(user?.id || '');
  const myTasks = getTasksByStaff(user?.id || '');

  // If a lead is selected for document management, show DocumentManager
  if (selectedLead) {
    const lead = leads.find(l => l.id === selectedLead);
    return (
      <DocumentManager 
        leadId={selectedLead}
        leadName={lead?.fullName || ''}
        onBack={() => setSelectedLead(null)}
      />
    );
  }

  const openRemarksModal = (leadId: string) => {
    setRemarksModal({ leadId, isOpen: true });
  };

  const saveRemarks = () => {
    if (remarksText.trim()) {
      const { updateLead } = useData();
      const lead = leads.find(l => l.id === remarksModal.leadId);
      const existingRemarks = lead?.remarks || '';
      const newRemarks = existingRemarks ? `${existingRemarks}\n\n[${new Date().toLocaleString()}] ${remarksText}` : `[${new Date().toLocaleString()}] ${remarksText}`;
      
      updateLead(remarksModal.leadId, { remarks: newRemarks });
      setRemarksText('');
      setRemarksModal({ leadId: '', isOpen: false });
    }
  };

  const getAssignerInfo = (lead: any) => {
    const assignerMatch = lead.remarks?.match(/Assigned.*by\s+([^.\n]+)/);
    return assignerMatch ? assignerMatch[1] : 'Manager';
  };

  const getPendingDocuments = (lead: any) => {
    if (!lead.documents) return [];
    return Object.entries(lead.documents)
      .filter(([_, status]) => status === 'Pending')
      .map(([type, _]) => type);
  };

  const pendingTasks = myTasks.filter(task => task.status === 'Pending');
  const todayTasks = myTasks.filter(task => {
    const today = new Date().toDateString();
    return new Date(task.dueDate).toDateString() === today;
  });

  const followUpLeads = myAssignedLeads.filter(lead => {
    if (!lead.followUpDate) return false;
    const today = new Date().toDateString();
    return new Date(lead.followUpDate).toDateString() === today;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-600/10 rounded-full blur-3xl animate-spin" style={{ animationDuration: '20s' }}></div>
      </div>
      
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 backdrop-blur-xl relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center transform hover:rotate-12 transition-all duration-300">
                <Building2 className="w-6 h-6 text-white drop-shadow-md" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">🎬 Bankmate Solutions</h1>
                <p className="text-sm text-gray-300 font-medium">Staff Dashboard</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell 
                  className="w-7 h-7 text-gray-300 cursor-pointer hover:text-red-400 transform hover:scale-125 hover:rotate-12 transition-all duration-300 drop-shadow-lg" 
                  onClick={clearNotifications}
                />
                {notifications > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-bounce">
                    {notifications}
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-3">
                {user?.photo ? (
                  <img 
                    src={user.photo} 
                    alt={user.name} 
                    className="w-10 h-10 rounded-2xl object-cover transform hover:scale-110 transition-all duration-300 border-2 border-white/20"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center transform hover:rotate-12 transition-all duration-300">
                    <User className="w-6 h-6 text-white drop-shadow-md" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-bold text-white">{user?.name}</p>
                  <p className="text-xs text-gray-300">{user?.designation}</p>
                </div>
              </div>

              <button
                onClick={logout}
                className="p-2 text-gray-400 hover:text-red-400 transition-all duration-300 transform hover:scale-110 hover:rotate-12"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Welcome Section */}
        <div className="mb-6">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 bg-clip-text text-transparent mb-2 animate-pulse">
            Welcome back, {user?.name}!
          </h2>
          <p className="text-gray-700 text-lg font-medium">Here are your assigned leads and pending tasks</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 transform-gpu">
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-6 transform hover:scale-110 hover:rotate-1 transition-all duration-500 hover:shadow-blue-200/50 border border-blue-100">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl transform hover:rotate-12 transition-all duration-300">
                <Target className="w-8 h-8 text-white drop-shadow-md" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-bold text-blue-700 uppercase tracking-wide">My Assigned Leads</p>
                <p className="text-3xl font-black text-gray-900 drop-shadow-sm">{myAssignedLeads.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl p-6 transform hover:scale-110 hover:rotate-1 transition-all duration-500 hover:shadow-green-200/50 border border-green-100">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-700 rounded-xl transform hover:rotate-12 transition-all duration-300">
                <CheckCircle className="w-8 h-8 text-white drop-shadow-md" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-bold text-green-700 uppercase tracking-wide">Completed Today</p>
                <p className="text-3xl font-black text-gray-900 drop-shadow-sm">
                  {myAssignedLeads.filter(lead => 
                    ['Sanctioned', 'Disbursed'].includes(lead.status) &&
                    new Date(lead.lastUpdated).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-yellow-50 rounded-2xl p-6 transform hover:scale-110 hover:rotate-1 transition-all duration-500 hover:shadow-yellow-200/50 border border-yellow-100">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-xl transform hover:rotate-12 transition-all duration-300">
                <Clock className="w-8 h-8 text-white drop-shadow-md" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-bold text-yellow-700 uppercase tracking-wide">Pending Tasks</p>
                <p className="text-3xl font-black text-gray-900 drop-shadow-sm">{pendingTasks.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-red-50 rounded-2xl p-6 transform hover:scale-110 hover:rotate-1 transition-all duration-500 hover:shadow-red-200/50 border border-red-100">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-red-500 to-red-700 rounded-xl transform hover:rotate-12 transition-all duration-300">
                <AlertTriangle className="w-8 h-8 text-white drop-shadow-md" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-bold text-red-700 uppercase tracking-wide">Follow-ups Today</p>
                <p className="text-3xl font-black text-gray-900 drop-shadow-sm">{followUpLeads.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Task Reminders & Follow-ups */}
        {(todayTasks.length > 0 || followUpLeads.length > 0) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
              <h3 className="text-lg font-medium text-yellow-800">Today's Reminders</h3>
            </div>
            
            {todayTasks.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-yellow-800 mb-2">Pending Tasks ({todayTasks.length})</h4>
                <div className="space-y-2">
                  {todayTasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-800">{task.title}</div>
                        <div className="text-sm text-gray-600">{task.description}</div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        task.priority === 'High' ? 'bg-red-100 text-red-800' :
                        task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {followUpLeads.length > 0 && (
              <div>
                <h4 className="font-medium text-yellow-800 mb-2">Follow-up Required ({followUpLeads.length})</h4>
                <div className="space-y-2">
                  {followUpLeads.slice(0, 3).map((lead) => (
                    <div key={lead.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-800">{lead.fullName}</div>
                        <div className="text-sm text-gray-600">{lead.loanType} - ₹{lead.loanAmount.toLocaleString()}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{lead.phone}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* My Assigned Leads Section */}
        <div className="bg-gradient-to-br from-white via-gray-50 to-blue-50 rounded-3xl backdrop-blur-sm border border-blue-100 mb-8">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-3xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                📋 My Assigned Leads
              </h3>
              <span className="text-sm font-bold text-red-600 bg-red-100 px-3 py-1 rounded-full">
                Total: {myAssignedLeads.length}
              </span>
            </div>
          </div>
          
          <div className="p-6">
            {myAssignedLeads.length > 0 ? (
              <div className="space-y-4">
                {myAssignedLeads.map((lead) => {
                  const assignedBy = getAssignerInfo(lead);
                  const pendingDocs = getPendingDocuments(lead);
                  
                  return (
                    <div key={lead.id} className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-white to-gray-50">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800 text-lg">{lead.fullName}</h4>
                          <p className="text-sm font-medium text-blue-600">{lead.loanType} - ₹{lead.loanAmount.toLocaleString()}</p>
                          
                          {/* Assignment Information */}
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center space-x-2">
                              <UserCheck className="w-4 h-4 text-green-600" />
                              <span className="text-xs text-green-700 font-medium">
                                Assigned by: {assignedBy}
                              </span>
                            </div>
                            
                            {lead.assignedBank && (
                              <div className="flex items-center space-x-2">
                                <Building2 className="w-4 h-4 text-purple-600" />
                                <span className="text-xs text-purple-700 font-medium">
                                  Bank: {lead.assignedBank}
                                  {lead.assignedBankBranch && ` - ${lead.assignedBankBranch}`}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          lead.status === 'New' ? 'bg-blue-100 text-blue-800' :
                          lead.status === 'Contacted' ? 'bg-yellow-100 text-yellow-800' :
                          lead.status === 'Docs Pending' ? 'bg-orange-100 text-orange-800' :
                          lead.status === 'Sent to Bank' ? 'bg-purple-100 text-purple-800' :
                          lead.status === 'Sanctioned' ? 'bg-green-100 text-green-800' :
                          lead.status === 'Disbursed' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {lead.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-1">
                          <Phone className="w-4 h-4" />
                          <span>{lead.phone}</span>
                        </div>
                        {lead.email && (
                          <div className="flex items-center space-x-1">
                            <Mail className="w-4 h-4" />
                            <span>{lead.email}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>Assigned: {new Date(lead.lastUpdated).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      {/* Pending Documents Alert */}
                      {pendingDocs.length > 0 && (
                        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded">
                          <div className="flex items-center text-sm text-red-800">
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            <span>Pending Documents: {pendingDocs.join(', ')}</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedLead(lead.id)}
                          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-xl text-sm hover:from-blue-700 hover:to-blue-800 flex items-center space-x-1 transform hover:scale-105 transition-all duration-300"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Manage Documents</span>
                        </button>
                        
                        <button
                          onClick={() => openRemarksModal(lead.id)}
                          className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-xl text-sm hover:from-green-700 hover:to-green-800 flex items-center space-x-1 transform hover:scale-105 transition-all duration-300"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Add Note</span>
                        </button>
                        
                        <select
                          value={lead.status}
                          onChange={(e) => updateLeadStatus(lead.id, e.target.value, user?.name || 'Staff')}
                          className="text-xs border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Docs Pending">Docs Pending</option>
                          <option value="Sent to Bank">Sent to Bank</option>
                          <option value="Sanctioned">Sanctioned</option>
                          <option value="Disbursed">Disbursed</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No leads assigned to you yet</p>
                <p className="text-sm text-gray-400 mt-2">
                  Contact your manager or branch head for lead assignments
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="bg-gradient-to-br from-white via-gray-50 to-purple-50 rounded-3xl backdrop-blur-sm border border-purple-100">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-3xl">
            <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              📝 Recent Tasks
            </h3>
          </div>
          <div className="p-6">
            {myTasks.length > 0 ? (
              <div className="space-y-4">
                {myTasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-white to-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-gray-800 text-lg">{task.title}</h4>
                        <p className="text-sm font-medium text-purple-600">{task.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          task.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {task.status}
                        </span>
                        {task.status === 'Completed' && (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span className={`px-2 py-1 text-xs rounded ${
                        task.priority === 'High' ? 'bg-red-100 text-red-700' :
                        task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {task.priority} Priority
                      </span>
                      <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No tasks assigned yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Staff Access Information */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <User className="w-5 h-5 text-blue-600 mr-2" />
            <div>
              <h4 className="font-medium text-blue-800">Staff Dashboard Access</h4>
              <p className="text-sm text-blue-700">
                You can view and manage leads assigned to you by Owner/Manager/Branch Head. 
                All assignments include bank details and assigner information for full transparency.
              </p>
            </div>
          </div>
        </div>

        {/* Remarks Modal */}
        {remarksModal.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Remarks</h3>
              <textarea
                value={remarksText}
                onChange={(e) => setRemarksText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                placeholder="Enter your remarks..."
                rows={4}
              />
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => setRemarksModal({ leadId: '', isOpen: false })}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={saveRemarks}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  Save Remarks
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}