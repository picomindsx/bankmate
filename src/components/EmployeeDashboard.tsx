import React, { useState } from 'react';
import {
  Building2, 
  Bell, 
  LogOut, 
  User, 
  BarChart3, 
  Calendar, 
  MessageSquare,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Phone,
  Mail,
  Edit3,
  Plus,
  Target,
  DollarSign,
  UserCheck
} from 'lucide-react';
import { useNetlifyAuth } from '../contexts/NetlifyAuthContext';
import { useCloudData } from '../contexts/CloudDataContext';
import DocumentManager from './DocumentManager';

export default function EmployeeDashboard() {
  const { user, logout } = useNetlifyAuth();
  const {
    leads, 
    tasks, 
    notifications, 
    clearNotifications, 
    getLeadsByStaff, 
    getTasksByStaff, 
    addLead, 
    branches,
    hasPermission,
    getUserRole,
    assignLead,
    updateLeadStatus
  } = useCloudData();
  
  const [selectedLead, setSelectedLead] = useState<string | null>(null);
  const [remarksModal, setRemarksModal] = useState<{ leadId: string; isOpen: boolean }>({ leadId: '', isOpen: false });
  const [remarksText, setRemarksText] = useState('');
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadFormData, setLeadFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: '',
    permanentAddress: '',
    currentAddress: '',
    panNumber: '',
    aadharNumber: '',
    phone: '',
    email: '',
    loanTypes: [] as string[],
    otherLoanType: '',
    incomeCategory: '',
    otherIncomeCategory: '',
    hasCoApplicant: false,
    coApplicantName: '',
    coApplicantMobile: '',
    coApplicantEmail: '',
    coApplicantDob: '',
    coApplicantGender: '',
    coApplicantRelationship: '',
    coApplicantPan: '',
    coApplicantAadhar: '',
    coApplicantAddress: '',
    coApplicantIncomeType: '',
    coApplicantMonthlyIncome: '',
    coApplicantEmployer: '',
    // Employment Details
    employerName: '',
    designation: '',
    officeAddress: '',
    monthlyGrossSalary: 0,
    yearsOfExperience: 0,
    employmentType: '',
    businessName: '',
    typeOfBusiness: '',
    businessAddress: '',
    annualTurnover: 0,
    yearsInBusiness: 0,
    businessRegistrationType: '',
    countryOfResidence: '',
    jobType: '',
    annualIncomeFC: 0,
    nriDocumentsProvided: false,
    // Loan Requirements
    loanAmount: 0,
    purposeOfLoan: '',
    preferredBank: '',
    loanTenure: 0,
    preferredRateType: '',
    urgencyLevel: '',
    // Property Details
    propertyType: '',
    propertyLocation: '',
    propertyValue: 0,
    propertyDocumentsAvailable: false,
    // Document Status
    aadharStatus: 'Not Provided',
    panStatus: 'Not Provided',
    incomeProofStatus: 'Not Provided',
    bankStatementsStatus: 'Not Provided',
    businessDocumentsStatus: 'Not Provided',
    nriDocumentsStatus: 'Not Provided',
    propertyDocumentsStatus: 'Not Provided',
    otherDocuments: '',
    // Lead Source
    leadSource: 'Staff Generated' as 'Walk-in' | 'Call Inquiry' | 'Online Form' | 'Referral' | 'Social Media' | 'Staff Generated' | 'Other',
    otherLeadSource: '',
    // Additional Notes
    remarks: '',
    specialInstructions: ''
  });

  const myLeads = getLeadsByStaff(user?.id || '');
  const myTasks = getTasksByStaff(user?.id || '');
  const userBranch = user?.assignedBranch;
  
  // Get leads assigned to this staff member
  const myAssignedLeads = leads.filter(lead => 
    lead.assignedStaff === user?.id && 
    lead.assignedBank // Must have bank assignment
  );
  
  const canViewAllLeads = user && hasPermission(user.id, 'canViewAllLeads');
  
  // For managers/branch heads, show all leads in their branch
  const branchLeads = userBranch && (user?.role === 'manager' || user?.designation === 'Branch Head') 
    ? leads.filter(lead => lead.branch === userBranch) 
    : [];
  
  // Staff can only see leads that are:
  // 1. Assigned to them by owner/manager/branch head
  // 2. Have both staff assignment AND bank assignment
  // 3. Are not in 'New' status (must be processed)
  const displayLeads = myLeads.filter(lead => 
    lead.assignedStaff === user?.id && 
    lead.assignedBank && 
    lead.status !== 'New'
  );
  
  const pendingTasks = myTasks.filter(task => task.status === 'Pending');
  const todayTasks = myTasks.filter(task => {
    const today = new Date().toDateString();
    return new Date(task.dueDate).toDateString() === today;
  });

  const todayLeads = myLeads.filter(lead => {
    const today = new Date().toDateString();
    return new Date(lead.createdAt).toDateString() === today;
  });

  const followUpLeads = myLeads.filter(lead => {
    if (!lead.followUpDate) return false;
    const today = new Date().toDateString();
    return new Date(lead.followUpDate).toDateString() === today;
  });

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

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addLead({
      ...leadFormData,
      loanType: leadFormData.loanTypes.join(', ') || 'Not Specified',
      status: 'New',
      branch: user?.assignedBranch || '',
      assignedStaff: user?.id || '',
      leadSource: 'Staff Generated',
      documents: {
        kyc: leadFormData.aadharStatus === 'Provided' && leadFormData.panStatus === 'Provided' ? 'Provided' : 'Pending',
        income: leadFormData.incomeProofStatus,
        legal: leadFormData.propertyDocumentsStatus,
        additional: 'Pending'
      }
    });
  };

  const getPendingDocuments = (lead: any) => {
    if (!lead.documents) return [];
    return Object.entries(lead.documents)
      .filter(([_, status]) => status === 'Pending')
      .map(([type, _]) => type);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-600/10 rounded-full blur-3xl animate-spin" style={{ animationDuration: '20s' }}></div>
      </div>
      
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 shadow-2xl border-b border-gray-700 backdrop-blur-xl relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center shadow-lg transform hover:rotate-12 transition-all duration-300">
                <Building2 className="w-6 h-6 text-white drop-shadow-md" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">🎬 Bankmate Solutions</h1>
                <p className="text-sm text-gray-300 font-medium">
                  {user?.role === 'manager' ? 'Branch Manager Dashboard' : 'Staff Dashboard'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell 
                  className="w-7 h-7 text-gray-300 cursor-pointer hover:text-red-400 transform hover:scale-125 hover:rotate-12 transition-all duration-300 drop-shadow-lg" 
                  onClick={clearNotifications}
                />
                {notifications > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-bounce shadow-lg">
                    {notifications}
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-3">
                {user?.photo ? (
                  <img 
                    src={user.photo} 
                    alt={user.name} 
                    className="w-10 h-10 rounded-2xl object-cover shadow-lg transform hover:scale-110 transition-all duration-300 border-2 border-white/20"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center shadow-lg transform hover:rotate-12 transition-all duration-300">
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
        {/* Quick Actions */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 bg-clip-text text-transparent mb-2 animate-pulse">
              Welcome back, {user?.name}!
            </h2>
            <p className="text-gray-700 text-lg font-medium">Here's your dashboard overview and pending tasks</p>
          </div>
          <button
            onClick={() => setShowLeadForm(true)}
            className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-4 rounded-2xl hover:from-red-700 hover:to-red-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-red-300/50 flex items-center space-x-2 font-bold text-lg"
          >
            <Plus className="w-6 h-6" />
            <span>🚀 Generate Lead</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 transform-gpu">
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-2xl p-6 transform hover:scale-110 hover:rotate-1 transition-all duration-500 hover:shadow-blue-200/50 border border-blue-100">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl shadow-lg transform hover:rotate-12 transition-all duration-300">
                <BarChart3 className="w-8 h-8 text-white drop-shadow-md" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-bold text-blue-700 uppercase tracking-wide">My Leads</p>
                <p className="text-3xl font-black text-gray-900 drop-shadow-sm">{myAssignedLeads.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-2xl p-6 transform hover:scale-110 hover:rotate-1 transition-all duration-500 hover:shadow-green-200/50 border border-green-100">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-700 rounded-xl shadow-lg transform hover:rotate-12 transition-all duration-300">
                <Calendar className="w-8 h-8 text-white drop-shadow-md" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-bold text-green-700 uppercase tracking-wide">Today's Leads</p>
                <p className="text-3xl font-black text-gray-900 drop-shadow-sm">{myAssignedLeads.filter(lead => new Date(lead.createdAt).toDateString() === new Date().toDateString()).length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-yellow-50 rounded-2xl shadow-2xl p-6 transform hover:scale-110 hover:rotate-1 transition-all duration-500 hover:shadow-yellow-200/50 border border-yellow-100">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-xl shadow-lg transform hover:rotate-12 transition-all duration-300">
                <Clock className="w-8 h-8 text-white drop-shadow-md" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-bold text-yellow-700 uppercase tracking-wide">Pending Tasks</p>
                <p className="text-3xl font-black text-gray-900 drop-shadow-sm">{pendingTasks.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-red-50 rounded-2xl shadow-2xl p-6 transform hover:scale-110 hover:rotate-1 transition-all duration-500 hover:shadow-red-200/50 border border-red-100">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-red-500 to-red-700 rounded-xl shadow-lg transform hover:rotate-12 transition-all duration-300">
                <AlertTriangle className="w-8 h-8 text-white drop-shadow-md" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-bold text-red-700 uppercase tracking-wide">Follow-ups Today</p>
                <p className="text-3xl font-black text-gray-900 drop-shadow-sm">{myAssignedLeads.filter(lead => lead.followUpDate && new Date(lead.followUpDate).toDateString() === new Date().toDateString()).length}</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Assigned Leads - Staff View */}
          <div className="bg-gradient-to-br from-white via-gray-50 to-blue-50 rounded-3xl shadow-2xl backdrop-blur-sm border border-blue-100">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">📋 My Assigned Leads</h3>
                <span className="text-sm font-bold text-red-600 bg-red-100 px-3 py-1 rounded-full">Pending Documents: {myLeads.filter(lead => getPendingDocuments(lead).length > 0).length}</span>
              </div>
            </div>
            <div className="p-6">
              {myAssignedLeads.length > 0 ? (
                <div className="space-y-4">
                  {myAssignedLeads.slice(0, 5).map((lead) => {
                    const assignedBy = lead.remarks?.match(/Assigned.*by\s+([^.\n]+)/)?.[1] || 'Manager';
                    
                    return (
                    <div key={lead.id} className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-white to-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-gray-800 text-lg">{lead.fullName}</h4>
                          <p className="text-sm font-medium text-blue-600">{lead.loanType} - ₹{lead.loanAmount.toLocaleString()}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <UserCheck className="w-4 h-4 text-green-600" />
                            <span className="text-xs text-green-700 font-medium">
                              Assigned by: {assignedBy}
                            </span>
                          </div>
                          {lead.assignedBank && (
                            <div className="text-xs text-purple-700 font-medium mt-1">
                              🏦 Bank: {lead.assignedBank}
                              {lead.assignedBankBranch && ` - ${lead.assignedBankBranch}`}
                            </div>
                          )}
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
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
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
                      </div>
                      
                      {/* Pending Documents Alert */}
                      {getPendingDocuments(lead).length > 0 && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                          <div className="flex items-center text-sm text-red-800">
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            <span>Pending: {getPendingDocuments(lead).join(', ')}</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Action Buttons */}
                      <div className="mt-3 flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedLead(lead.id)}
                          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-xl text-sm hover:from-blue-700 hover:to-blue-800 flex items-center space-x-1 transform hover:scale-105 transition-all duration-300 shadow-lg"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Documents</span>
                        </button>
                        <button
                          onClick={() => openRemarksModal(lead.id)}
                          className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-xl text-sm hover:from-green-700 hover:to-green-800 flex items-center space-x-1 transform hover:scale-105 transition-all duration-300 shadow-lg"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Add Note</span>
                        </button>
                        {user && hasPermission(user.id, 'canUpdateStatus') && (
                          <select
                            value={lead.status}
                            onChange={(e) => updateLeadStatus(lead.id, e.target.value, user.name || 'Staff')}
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
                        )}
                      </div>
                      
                      <div className="mt-2 text-xs text-gray-500">
                        Last updated: {new Date(lead.lastUpdated).toLocaleDateString()}
                      </div>
                    </div>
                    );
                  })}
                  {myAssignedLeads.length > 5 && (
                    <div className="text-center">
                      <span className="text-sm text-gray-500">
                        And {myAssignedLeads.length - 5} more leads...
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No leads assigned to you yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Tasks */}
          <div className="bg-gradient-to-br from-white via-gray-50 to-purple-50 rounded-3xl shadow-2xl backdrop-blur-sm border border-purple-100">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-3xl">
              <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">📝 Recent Tasks</h3>
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
        </div>

        {/* Role-based Access Information */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <User className="w-5 h-5 text-blue-600 mr-2" />
            <div className="flex items-center">
              <div>
                <h4 className="font-medium text-blue-800">Dashboard Access Level</h4>
                <p className="text-sm text-blue-700">
                  {user?.role === 'staff' 
                    ? 'You can view and manage leads assigned to you by Owner/Manager/Branch Head. All assignments include bank details and assigner information.'
                    : 'You have management access to assign leads, manage staff, and oversee branch operations.'
                  }
                </p>
              </div>
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

        {/* Lead Generation Modal */}
        {showLeadForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">New Lead Detailed Capture Form</h3>
                <button
                  onClick={() => setShowLeadForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleLeadSubmit} className="space-y-6">
                {/* 1. Basic Personal Details */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-blue-800 mb-4">1️⃣ Basic Personal Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={leadFormData.fullName}
                        onChange={(e) => setLeadFormData(prev => ({ ...prev, fullName: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Enter full name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mobile Number *
                      </label>
                      <input
                        type="tel"
                        value={leadFormData.phone}
                        onChange={(e) => setLeadFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Enter mobile number"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={leadFormData.email}
                        onChange={(e) => setLeadFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Enter email address"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={leadFormData.dateOfBirth}
                        onChange={(e) => setLeadFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender
                      </label>
                      <select
                        value={leadFormData.gender}
                        onChange={(e) => setLeadFormData(prev => ({ ...prev, gender: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        PAN Number
                      </label>
                      <input
                        type="text"
                        value={leadFormData.panNumber}
                        onChange={(e) => setLeadFormData(prev => ({ ...prev, panNumber: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Enter PAN number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Aadhar Number
                      </label>
                      <input
                        type="text"
                        value={leadFormData.aadharNumber}
                        onChange={(e) => setLeadFormData(prev => ({ ...prev, aadharNumber: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Enter Aadhar number"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Permanent Address
                      </label>
                      <textarea
                        value={leadFormData.permanentAddress}
                        onChange={(e) => setLeadFormData(prev => ({ ...prev, permanentAddress: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Enter permanent address"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Address
                      </label>
                      <textarea
                        value={leadFormData.currentAddress}
                        onChange={(e) => setLeadFormData(prev => ({ ...prev, currentAddress: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Enter current address"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Loan Type */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-green-800 mb-4">2️⃣ Loan Type (Select one or more)</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['Home Loan', 'Personal Loan', 'Business Loan', 'Car Loan', 'Two-Wheeler Loan', 'Gold Loan', 'Loan Against Property (LAP)', 'NRI Loan', 'Education Loan'].map((loanType) => (
                      <label key={loanType} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={leadFormData.loanTypes.includes(loanType)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setLeadFormData(prev => ({ ...prev, loanTypes: [...prev.loanTypes, loanType] }));
                            } else {
                              setLeadFormData(prev => ({ ...prev, loanTypes: prev.loanTypes.filter(t => t !== loanType) }));
                            }
                          }}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                        <span className="text-sm text-gray-700">{loanType}</span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-3">
                    <input
                      type="text"
                      value={leadFormData.otherLoanType}
                      onChange={(e) => setLeadFormData(prev => ({ ...prev, otherLoanType: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Others (Specify)"
                    />
                  </div>
                </div>

                {/* 3. Income Category */}
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-yellow-800 mb-4">3️⃣ Income Category (Select one)</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['Salaried', 'Self-Employed', 'Business Owner', 'NRI', 'Retired'].map((category) => (
                      <label key={category} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="incomeCategory"
                          value={category}
                          checked={leadFormData.incomeCategory === category}
                          onChange={(e) => setLeadFormData(prev => ({ ...prev, incomeCategory: e.target.value }))}
                          className="border-gray-300 text-red-600 focus:ring-red-500"
                        />
                        <span className="text-sm text-gray-700">{category}</span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-3">
                    <input
                      type="text"
                      value={leadFormData.otherIncomeCategory}
                      onChange={(e) => setLeadFormData(prev => ({ ...prev, otherIncomeCategory: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Others (Specify)"
                    />
                  </div>
                </div>

                {/* Co-applicant Details */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-md font-semibold text-gray-800">Co-applicant Details (Optional)</h4>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={leadFormData.hasCoApplicant}
                        onChange={(e) => setLeadFormData(prev => ({ ...prev, hasCoApplicant: e.target.checked }))}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Add Co-applicant</span>
                    </label>
                  </div>

                  {leadFormData.hasCoApplicant && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Co-applicant Full Name *
                        </label>
                        <input
                          type="text"
                          value={leadFormData.coApplicantName}
                          onChange={(e) => setLeadFormData(prev => ({ ...prev, coApplicantName: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                          placeholder="Enter co-applicant full name"
                          required={leadFormData.hasCoApplicant}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Co-applicant Mobile Number *
                        </label>
                        <input
                          type="tel"
                          value={leadFormData.coApplicantMobile}
                          onChange={(e) => setLeadFormData(prev => ({ ...prev, coApplicantMobile: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                          placeholder="Enter co-applicant mobile number"
                          required={leadFormData.hasCoApplicant}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Co-applicant Email Address
                        </label>
                        <input
                          type="email"
                          value={leadFormData.coApplicantEmail}
                          onChange={(e) => setLeadFormData(prev => ({ ...prev, coApplicantEmail: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                          placeholder="Enter co-applicant email address"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Co-applicant Date of Birth
                        </label>
                        <input
                          type="date"
                          value={leadFormData.coApplicantDob}
                          onChange={(e) => setLeadFormData(prev => ({ ...prev, coApplicantDob: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Co-applicant Gender
                        </label>
                        <select
                          value={leadFormData.coApplicantGender}
                          onChange={(e) => setLeadFormData(prev => ({ ...prev, coApplicantGender: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Relationship with Applicant
                        </label>
                        <select
                          value={leadFormData.coApplicantRelationship}
                          onChange={(e) => setLeadFormData(prev => ({ ...prev, coApplicantRelationship: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                        >
                          <option value="">Select Relationship</option>
                          <option value="Spouse">Spouse</option>
                          <option value="Father">Father</option>
                          <option value="Mother">Mother</option>
                          <option value="Son">Son</option>
                          <option value="Daughter">Daughter</option>
                          <option value="Brother">Brother</option>
                          <option value="Sister">Sister</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowLeadForm(false)}
                    className="px-6 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
                  >
                    Generate Lead
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}