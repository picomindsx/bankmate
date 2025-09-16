import React, { useState } from 'react';
import { 
  Plus, 
  Eye, 
  CheckCircle, 
  XCircle, 
  User, 
  Phone, 
  Mail, 
  Building2,
  DollarSign,
  Calendar,
  MessageSquare,
  ArrowRight,
  Filter,
  Search,
  Download,
  Edit3,
  Trash2,
  UserCheck,
  Clock
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

interface BasicLead {
  id: string;
  leadId: string;
  dateCreated: Date;
  customerName: string;
  mobileNumber: string;
  emailId?: string;
  branch: string;
  loanType: 'Home Loan' | 'Business Loan' | 'Personal Loan' | 'Vehicle Loan' | 'Education Loan' | 'Others';
  loanAmountExpected: number;
  customerType: 'Salaried' | 'Self-employed' | 'Business' | 'NRI';
  leadStatus: 'New' | 'Submitted' | 'Verified by Manager' | 'Assigned to Staff';
  managerVerified: boolean;
  assignedStaffName?: string;
  assignedDate?: Date;
  remarks?: string;
  createdBy: string;
  verifiedBy?: string;
  assignedBy?: string;
}

export default function BasicLeadPipeline() {
  const [activeTab, setActiveTab] = useState<'capture' | 'manage' | 'verify' | 'assign'>('capture');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [basicLeads, setBasicLeads] = useState<BasicLead[]>([]);
  
  const [formData, setFormData] = useState({
    customerName: '',
    mobileNumber: '',
    emailId: '',
    branch: '',
    loanType: 'Home Loan' as BasicLead['loanType'],
    loanAmountExpected: 0,
    customerType: 'Salaried' as BasicLead['customerType'],
    remarks: ''
  });

  const { branches, employees, addLead } = useData();
  const { user } = useAuth();

  const generateLeadId = () => {
    const today = new Date();
    const year = today.getFullYear().toString().slice(-2);
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const sequence = (basicLeads.length + 1).toString().padStart(3, '0');
    return `BL${year}${month}${day}${sequence}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newLead: BasicLead = {
      id: Date.now().toString(),
      leadId: generateLeadId(),
      dateCreated: new Date(),
      customerName: formData.customerName,
      mobileNumber: formData.mobileNumber,
      emailId: formData.emailId || undefined,
      branch: formData.branch,
      loanType: formData.loanType,
      loanAmountExpected: formData.loanAmountExpected,
      customerType: formData.customerType,
      leadStatus: 'New',
      managerVerified: false,
      remarks: formData.remarks,
      createdBy: user?.name || 'Unknown'
    };

    setBasicLeads(prev => [...prev, newLead]);
    
    // Clear form but keep branch and loan type for faster entry
    setFormData(prev => ({
      ...prev,
      customerName: '',
      mobileNumber: '',
      emailId: '',
      loanAmountExpected: 0,
      remarks: ''
    }));

    alert('✅ Lead captured successfully!');
  };

  const handleManagerVerification = (leadId: string, verified: boolean, remarks?: string) => {
    setBasicLeads(prev => prev.map(lead => 
      lead.id === leadId ? {
        ...lead,
        managerVerified: verified,
        leadStatus: verified ? 'Verified by Manager' : 'Submitted',
        verifiedBy: user?.name || 'Manager',
        remarks: remarks || lead.remarks
      } : lead
    ));
  };

  const handleStaffAssignment = (leadId: string, staffId: string) => {
    const staff = employees.find(emp => emp.id === staffId);
    if (!staff) return;

    setBasicLeads(prev => prev.map(lead => 
      lead.id === leadId ? {
        ...lead,
        assignedStaffName: staff.name,
        assignedDate: new Date(),
        leadStatus: 'Assigned to Staff',
        assignedBy: user?.name || 'Manager'
      } : lead
    ));

    // Transfer to detailed pipeline
    const lead = basicLeads.find(l => l.id === leadId);
    if (lead) {
      addLead({
        fullName: lead.customerName,
        phone: lead.mobileNumber,
        email: lead.emailId,
        loanType: lead.loanType,
        loanAmount: lead.loanAmountExpected,
        branch: lead.branch,
        leadSource: 'Staff Generated',
        assignedStaff: staffId,
        status: 'New',
        remarks: `Transferred from Basic Pipeline. Lead ID: ${lead.leadId}. ${lead.remarks || ''}`
      });
    }

    alert('✅ Lead assigned to staff and transferred to detailed pipeline!');
  };

  const filteredLeads = basicLeads.filter(lead => {
    const matchesSearch = lead.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.mobileNumber.includes(searchTerm) ||
                         lead.leadId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || lead.leadStatus === statusFilter;
    const matchesBranch = !branchFilter || lead.branch === branchFilter;
    
    return matchesSearch && matchesStatus && matchesBranch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800';
      case 'Submitted': return 'bg-yellow-100 text-yellow-800';
      case 'Verified by Manager': return 'bg-green-100 text-green-800';
      case 'Assigned to Staff': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLoanTypeColor = (loanType: string) => {
    switch (loanType) {
      case 'Home Loan': return 'bg-red-100 text-red-800';
      case 'Business Loan': return 'bg-indigo-100 text-indigo-800';
      case 'Personal Loan': return 'bg-green-100 text-green-800';
      case 'Vehicle Loan': return 'bg-yellow-100 text-yellow-800';
      case 'Education Loan': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const exportLeads = () => {
    const csvData = filteredLeads.map(lead => ({
      'Lead ID': lead.leadId,
      'Date Created': lead.dateCreated.toLocaleDateString(),
      'Customer Name': lead.customerName,
      'Mobile Number': lead.mobileNumber,
      'Email ID': lead.emailId || '',
      'Branch': branches.find(b => b.id === lead.branch)?.name || '',
      'Loan Type': lead.loanType,
      'Loan Amount Expected': lead.loanAmountExpected,
      'Customer Type': lead.customerType,
      'Lead Status': lead.leadStatus,
      'Manager Verified': lead.managerVerified ? 'Yes' : 'No',
      'Assigned Staff Name': lead.assignedStaffName || '',
      'Assigned Date': lead.assignedDate ? lead.assignedDate.toLocaleDateString() : '',
      'Remarks': lead.remarks || '',
      'Created By': lead.createdBy
    }));

    const csvContent = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `basic_leads_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const renderLeadCapture = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800">🎯 Basic Lead Capture</h3>
        <div className="text-sm text-gray-600">
          Fast & Simple Lead Entry
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Name *
            </label>
            <input
              type="text"
              value={formData.customerName}
              onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
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
              value={formData.mobileNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, mobileNumber: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter mobile number"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email ID (Optional)
            </label>
            <input
              type="email"
              value={formData.emailId}
              onChange={(e) => setFormData(prev => ({ ...prev, emailId: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter email address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Branch *
            </label>
            <select
              value={formData.branch}
              onChange={(e) => setFormData(prev => ({ ...prev, branch: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            >
              <option value="">Select Branch</option>
              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loan Type *
            </label>
            <select
              value={formData.loanType}
              onChange={(e) => setFormData(prev => ({ ...prev, loanType: e.target.value as BasicLead['loanType'] }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            >
              <option value="Home Loan">Home Loan</option>
              <option value="Business Loan">Business Loan</option>
              <option value="Personal Loan">Personal Loan</option>
              <option value="Vehicle Loan">Vehicle Loan</option>
              <option value="Education Loan">Education Loan</option>
              <option value="Others">Others</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loan Amount Expected *
            </label>
            <input
              type="number"
              value={formData.loanAmountExpected}
              onChange={(e) => setFormData(prev => ({ ...prev, loanAmountExpected: Number(e.target.value) }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter loan amount"
              min="0"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Type *
            </label>
            <select
              value={formData.customerType}
              onChange={(e) => setFormData(prev => ({ ...prev, customerType: e.target.value as BasicLead['customerType'] }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            >
              <option value="Salaried">Salaried</option>
              <option value="Self-employed">Self-employed</option>
              <option value="Business">Business</option>
              <option value="NRI">NRI</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Remarks / Comments
          </label>
          <textarea
            value={formData.remarks}
            onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Any additional remarks or comments"
            rows={3}
          />
        </div>

        <button
          type="submit"
          className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 text-lg font-medium"
        >
          <Plus className="w-5 h-5" />
          <span>Capture Lead</span>
        </button>
      </form>
    </div>
  );

  const renderLeadManagement = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">📊 Basic Lead Pipeline Management</h3>
          <button
            onClick={exportLeads}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">All Branches</option>
            {branches.map(branch => (
              <option key={branch.id} value={branch.id}>{branch.name}</option>
            ))}
          </select>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="New">New</option>
            <option value="Submitted">Submitted</option>
            <option value="Verified by Manager">Verified by Manager</option>
            <option value="Assigned to Staff">Assigned to Staff</option>
          </select>
          
          <div className="text-sm text-gray-600 flex items-center">
            Total Leads: {filteredLeads.length}
          </div>
        </div>
      </div>
      
      {filteredLeads.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lead ID & Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loan Information
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status & Verification
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assignment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLeads.map((lead) => {
                const branch = branches.find(b => b.id === lead.branch);
                
                return (
                  <tr key={lead.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{lead.leadId}</div>
                      <div className="text-sm text-gray-500">{lead.dateCreated.toLocaleDateString()}</div>
                      <div className="text-xs text-gray-400">By: {lead.createdBy}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{lead.customerName}</div>
                      <div className="text-sm text-gray-500">{lead.mobileNumber}</div>
                      <div className="text-sm text-gray-500">{lead.emailId || 'No email'}</div>
                      <div className="text-xs">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {lead.customerType}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLoanTypeColor(lead.loanType)}`}>
                          {lead.loanType}
                        </span>
                      </div>
                      <div className="text-sm text-gray-900">₹{lead.loanAmountExpected.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">{branch?.name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="mb-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(lead.leadStatus)}`}>
                          {lead.leadStatus}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Manager Verified:</span>
                        {lead.managerVerified ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      {lead.verifiedBy && (
                        <div className="text-xs text-gray-400">By: {lead.verifiedBy}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{lead.assignedStaffName || 'Not Assigned'}</div>
                      {lead.assignedDate && (
                        <div className="text-sm text-gray-500">{lead.assignedDate.toLocaleDateString()}</div>
                      )}
                      {lead.assignedBy && (
                        <div className="text-xs text-gray-400">By: {lead.assignedBy}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-col space-y-2">
                        {!lead.managerVerified && (
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleManagerVerification(lead.id, true)}
                              className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 flex items-center space-x-1"
                            >
                              <CheckCircle className="w-3 h-3" />
                              <span>Verify</span>
                            </button>
                            <button
                              onClick={() => handleManagerVerification(lead.id, false)}
                              className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700 flex items-center space-x-1"
                            >
                              <XCircle className="w-3 h-3" />
                              <span>Reject</span>
                            </button>
                          </div>
                        )}
                        
                        {lead.managerVerified && !lead.assignedStaffName && (
                          <select
                            onChange={(e) => e.target.value && handleStaffAssignment(lead.id, e.target.value)}
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                            defaultValue=""
                          >
                            <option value="">Assign Staff</option>
                            {employees.map(emp => (
                              <option key={emp.id} value={emp.id}>{emp.name}</option>
                            ))}
                          </select>
                        )}
                        
                        {lead.assignedStaffName && (
                          <div className="flex items-center space-x-1 text-green-600">
                            <ArrowRight className="w-3 h-3" />
                            <span className="text-xs">Transferred</span>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-6 text-center">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No leads found matching your criteria</p>
        </div>
      )}
    </div>
  );

  const renderStats = () => {
    const stats = {
      total: basicLeads.length,
      new: basicLeads.filter(l => l.leadStatus === 'New').length,
      submitted: basicLeads.filter(l => l.leadStatus === 'Submitted').length,
      verified: basicLeads.filter(l => l.leadStatus === 'Verified by Manager').length,
      assigned: basicLeads.filter(l => l.leadStatus === 'Assigned to Staff').length
    };

    return (
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Leads</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Plus className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">New</p>
              <p className="text-2xl font-bold text-gray-900">{stats.new}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Submitted</p>
              <p className="text-2xl font-bold text-gray-900">{stats.submitted}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Verified</p>
              <p className="text-2xl font-bold text-gray-900">{stats.verified}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <UserCheck className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Assigned</p>
              <p className="text-2xl font-bold text-gray-900">{stats.assigned}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">🎯 Basic Loan Lead Generation Pipeline</h2>
          <p className="text-gray-600">Simple → Manager Review → Staff Assignment → Detailed Pipeline</p>
        </div>
      </div>

      {renderStats()}

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('capture')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'capture'
              ? 'bg-white text-red-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Lead Capture</span>
        </button>
        
        <button
          onClick={() => setActiveTab('manage')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'manage'
              ? 'bg-white text-red-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>Manage Pipeline</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'capture' && renderLeadCapture()}
      {activeTab === 'manage' && renderLeadManagement()}

      {/* Pipeline Flow Info */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-medium text-blue-800 mb-4">✅ Pipeline Flow</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-white font-bold">1</span>
            </div>
            <h5 className="font-medium text-blue-800">New Lead Captured</h5>
            <p className="text-sm text-blue-700">Basic details entered by lead generator</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-white font-bold">2</span>
            </div>
            <h5 className="font-medium text-blue-800">Manager Verification</h5>
            <p className="text-sm text-blue-700">Manager verifies and approves for assignment</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-white font-bold">3</span>
            </div>
            <h5 className="font-medium text-blue-800">Staff Assignment</h5>
            <p className="text-sm text-blue-700">Lead assigned to staff for processing</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-white font-bold">4</span>
            </div>
            <h5 className="font-medium text-blue-800">Detailed Pipeline</h5>
            <p className="text-sm text-blue-700">Automatic transfer to file status pipeline</p>
          </div>
        </div>
      </div>
    </div>
  );
}