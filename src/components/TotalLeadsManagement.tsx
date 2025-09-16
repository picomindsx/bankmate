import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Building2, 
  Users, 
  CheckCircle, 
  Clock, 
  DollarSign,
  Plus,
  Eye,
  Filter,
  Search,
  Download,
  FileText,
  User,
  Phone,
  Mail,
  Calendar,
  Target,
  Briefcase,
  Home,
  Car,
  GraduationCap,
  Coins,
  TrendingUp,
  AlertCircle,
  UserCheck,
  Settings,
  ArrowRight
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import DetailedPipelineView from './DetailedPipelineView';

interface TotalLeadsManagementProps {
  onBack: () => void;
}

export default function TotalLeadsManagement({ onBack }: TotalLeadsManagementProps) {
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'overview' | 'new' | 'sanctioned' | 'processing' | 'disbursed' | 'pipeline'>('overview');
  const [selectedLoanType, setSelectedLoanType] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState<{ isOpen: boolean; leadId: string }>({ isOpen: false, leadId: '' });
  const [assignmentData, setAssignmentData] = useState({
    staffId: '',
    bankName: '',
    bankBranch: '',
    remarks: ''
  });

  const { leads, branches, employees, updateLead, assignLead, addLead } = useData();
  const { user } = useAuth();

  // If viewing detailed pipeline, show that component
  if (selectedLead) {
    const lead = leads.find(l => l.id === selectedLead);
    return (
      <DetailedPipelineView 
        leadId={selectedLead}
        leadName={lead?.fullName || ''}
        onBack={() => setSelectedLead(null)}
      />
    );
  }

  const getBranchStats = (branchId: string) => {
    const branchLeads = leads.filter(lead => lead.branch === branchId);
    return {
      total: branchLeads.length,
      new: branchLeads.filter(lead => lead.status === 'New').length,
      sanctioned: branchLeads.filter(lead => lead.status === 'Sanctioned').length,
      processing: branchLeads.filter(lead => ['Contacted', 'Docs Pending', 'Sent to Bank'].includes(lead.status)).length,
      disbursed: branchLeads.filter(lead => lead.status === 'Disbursed').length
    };
  };

  const getLoanTypeIcon = (loanType: string) => {
    switch (loanType) {
      case 'Home Loan': return <Home className="w-5 h-5" />;
      case 'Vehicle Loan': return <Car className="w-5 h-5" />;
      case 'Education Loan': return <GraduationCap className="w-5 h-5" />;
      case 'Business Loan': return <Briefcase className="w-5 h-5" />;
      case 'Personal Loan': return <User className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getLoanTypeColor = (loanType: string) => {
    switch (loanType) {
      case 'Home Loan': return 'bg-red-100 text-red-800';
      case 'Vehicle Loan': return 'bg-yellow-100 text-yellow-800';
      case 'Education Loan': return 'bg-pink-100 text-pink-800';
      case 'Business Loan': return 'bg-indigo-100 text-indigo-800';
      case 'Personal Loan': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAssignLead = () => {
    if (!assignmentData.staffId || !assignmentData.bankName) {
      alert('Please select staff member and bank');
      return;
    }

    const staff = employees.find(emp => emp.id === assignmentData.staffId);
    if (!staff) return;

    updateLead(showAssignModal.leadId, {
      assignedStaff: assignmentData.staffId,
      assignedBank: assignmentData.bankName,
      assignedBankBranch: assignmentData.bankBranch,
      status: 'Contacted',
      remarks: (leads.find(l => l.id === showAssignModal.leadId)?.remarks || '') + 
               `\n[${new Date().toLocaleString()}] Assigned to ${staff.name} by ${user?.name}. Bank: ${assignmentData.bankName}${assignmentData.bankBranch ? ` - ${assignmentData.bankBranch}` : ''}. ${assignmentData.remarks}`
    });

    setShowAssignModal({ isOpen: false, leadId: '' });
    setAssignmentData({ staffId: '', bankName: '', bankBranch: '', remarks: '' });
    alert('Lead assigned successfully!');
  };

  const getFilteredLeads = (status?: string) => {
    if (!selectedBranch) return [];
    
    let branchLeads = leads.filter(lead => lead.branch === selectedBranch);
    
    if (status) {
      if (status === 'processing') {
        branchLeads = branchLeads.filter(lead => ['Contacted', 'Docs Pending', 'Sent to Bank'].includes(lead.status));
      } else {
        branchLeads = branchLeads.filter(lead => 
          status === 'new' ? lead.status === 'New' :
          status === 'sanctioned' ? lead.status === 'Sanctioned' :
          status === 'disbursed' ? lead.status === 'Disbursed' :
          lead.status === status
        );
      }
    }

    if (selectedLoanType !== 'All') {
      branchLeads = branchLeads.filter(lead => lead.loanType === selectedLoanType);
    }

    if (searchTerm) {
      branchLeads = branchLeads.filter(lead => 
        lead.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone.includes(searchTerm) ||
        (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return branchLeads;
  };

  const renderBranchOverview = () => {
    if (!selectedBranch) return null;
    
    const branch = branches.find(b => b.id === selectedBranch);
    const stats = getBranchStats(selectedBranch);
    
    return (
      <div className="space-y-6">
        {/* Branch Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl shadow-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">{branch?.name}</h3>
                <p className="text-red-100">{branch?.location}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{stats.total}</div>
              <div className="text-red-100">Total Leads</div>
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <button
            onClick={() => setActiveView('new')}
            className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-2xl p-6 text-white transform hover:scale-105 hover:rotate-1 transition-all duration-300 hover:shadow-blue-300/50"
          >
            <div className="flex items-center justify-between mb-4">
              <Plus className="w-8 h-8" />
              <span className="text-3xl font-bold">{stats.new}</span>
            </div>
            <h4 className="text-lg font-semibold">New Leads</h4>
            <p className="text-blue-100 text-sm">Unprocessed leads</p>
          </button>

          <button
            onClick={() => setActiveView('processing')}
            className="bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-2xl shadow-2xl p-6 text-white transform hover:scale-105 hover:rotate-1 transition-all duration-300 hover:shadow-yellow-300/50"
          >
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-8 h-8" />
              <span className="text-3xl font-bold">{stats.processing}</span>
            </div>
            <h4 className="text-lg font-semibold">Processing</h4>
            <p className="text-yellow-100 text-sm">In progress</p>
          </button>

          <button
            onClick={() => setActiveView('sanctioned')}
            className="bg-gradient-to-br from-green-500 to-green-700 rounded-2xl shadow-2xl p-6 text-white transform hover:scale-105 hover:rotate-1 transition-all duration-300 hover:shadow-green-300/50"
          >
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="w-8 h-8" />
              <span className="text-3xl font-bold">{stats.sanctioned}</span>
            </div>
            <h4 className="text-lg font-semibold">Sanctioned</h4>
            <p className="text-green-100 text-sm">Approved loans</p>
          </button>

          <button
            onClick={() => setActiveView('disbursed')}
            className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl shadow-2xl p-6 text-white transform hover:scale-105 hover:rotate-1 transition-all duration-300 hover:shadow-purple-300/50"
          >
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8" />
              <span className="text-3xl font-bold">{stats.disbursed}</span>
            </div>
            <h4 className="text-lg font-semibold">Disbursed</h4>
            <p className="text-purple-100 text-sm">Completed loans</p>
          </button>
        </div>

        {/* Loan Type Filter */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-800">📊 File Tracking by Loan Type</h4>
            <div className="flex items-center space-x-4">
              <select
                value={selectedLoanType}
                onChange={(e) => setSelectedLoanType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              >
                <option value="All">All Loan Types</option>
                <option value="Home Loan">Home Loan</option>
                <option value="Personal Loan">Personal Loan</option>
                <option value="Business Loan">Business Loan</option>
                <option value="Vehicle Loan">Vehicle Loan</option>
                <option value="Education Loan">Education Loan</option>
              </select>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
          </div>

          {/* Loan Type Categories */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {['Home Loan', 'Personal Loan', 'Business Loan', 'Vehicle Loan', 'Education Loan'].map((loanType) => {
              const typeLeads = leads.filter(lead => lead.branch === selectedBranch && lead.loanType === loanType);
              return (
                <div key={loanType} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className={`p-2 rounded-lg ${getLoanTypeColor(loanType)}`}>
                      {getLoanTypeIcon(loanType)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-800">{loanType}</div>
                      <div className="text-xs text-gray-600">{typeLeads.length} files</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-center">
                      <div className="font-semibold text-blue-600">{typeLeads.filter(l => l.status === 'New').length}</div>
                      <div className="text-gray-600">New</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-green-600">{typeLeads.filter(l => ['Sanctioned', 'Disbursed'].includes(l.status)).length}</div>
                      <div className="text-gray-600">Success</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderLeadsList = (status?: string) => {
    const filteredLeads = getFilteredLeads(status);
    const statusTitle = status === 'new' ? 'New Leads' :
                      status === 'processing' ? 'Processing Leads' :
                      status === 'sanctioned' ? 'Sanctioned Leads' :
                      status === 'disbursed' ? 'Disbursed Leads' : 'All Leads';

    return (
      <div className="bg-white rounded-2xl shadow-xl">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-800">{statusTitle}</h3>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Total: {filteredLeads.length}</span>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
        
        {filteredLeads.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lead Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loan Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assignment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLeads.map((lead) => {
                  const assignedEmployee = employees.find(emp => emp.id === lead.assignedStaff);
                  const isAssigned = !!lead.assignedStaff && !!lead.assignedBank;
                  
                  return (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${getLoanTypeColor(lead.loanType)}`}>
                            {getLoanTypeIcon(lead.loanType)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{lead.fullName}</div>
                            <div className="text-sm text-gray-500">{lead.leadSource}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{lead.phone}</div>
                        <div className="text-sm text-gray-500">{lead.email || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{lead.loanType}</div>
                        <div className="text-sm text-gray-500">₹{lead.loanAmount.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {assignedEmployee ? assignedEmployee.name : 'Unassigned'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {lead.assignedBank || 'No bank assigned'}
                        </div>
                        {!isAssigned && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            Needs Assignment
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
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
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {!isAssigned && (
                            <button
                              onClick={() => setShowAssignModal({ isOpen: true, leadId: lead.id })}
                              className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition-colors flex items-center space-x-1"
                            >
                              <UserCheck className="w-3 h-3" />
                              <span>Assign</span>
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedLead(lead.id)}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors flex items-center space-x-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Pipeline</span>
                          </button>
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
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No leads found for this category</p>
          </div>
        )}
      </div>
    );
  };

  const renderNewLeadForm = () => {
    const [newLeadData, setNewLeadData] = useState({
      fullName: '',
      phone: '',
      email: '',
      loanType: 'Home Loan' as 'Home Loan' | 'Personal Loan' | 'Business Loan' | 'Education Loan' | 'Vehicle Loan',
      loanAmount: 0,
      leadSource: 'Walk-in' as 'Meta Ads' | 'Website' | 'Referral' | 'Walk-in' | 'WhatsApp' | 'Others',
      remarks: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      addLead({
        ...newLeadData,
        branch: selectedBranch!,
        status: 'New'
      });
      setNewLeadData({
        fullName: '',
        phone: '',
        email: '',
        loanType: 'Home Loan',
        loanAmount: 0,
        leadSource: 'Walk-in',
        remarks: ''
      });
      alert('New lead added successfully!');
    };

    return (
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6">➕ Add New Lead</h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={newLeadData.fullName}
                onChange={(e) => setNewLeadData(prev => ({ ...prev, fullName: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                value={newLeadData.phone}
                onChange={(e) => setNewLeadData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter phone number"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={newLeadData.email}
                onChange={(e) => setNewLeadData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter email address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loan Type *
              </label>
              <select
                value={newLeadData.loanType}
                onChange={(e) => setNewLeadData(prev => ({ ...prev, loanType: e.target.value as any }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              >
                <option value="Home Loan">Home Loan</option>
                <option value="Personal Loan">Personal Loan</option>
                <option value="Business Loan">Business Loan</option>
                <option value="Vehicle Loan">Vehicle Loan</option>
                <option value="Education Loan">Education Loan</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loan Amount *
              </label>
              <input
                type="number"
                value={newLeadData.loanAmount}
                onChange={(e) => setNewLeadData(prev => ({ ...prev, loanAmount: Number(e.target.value) }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter loan amount"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lead Source *
              </label>
              <select
                value={newLeadData.leadSource}
                onChange={(e) => setNewLeadData(prev => ({ ...prev, leadSource: e.target.value as any }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              >
                <option value="Meta Ads">Meta Ads</option>
                <option value="Website">Website</option>
                <option value="Referral">Referral</option>
                <option value="Walk-in">Walk-in</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Others">Others</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remarks
            </label>
            <textarea
              value={newLeadData.remarks}
              onChange={(e) => setNewLeadData(prev => ({ ...prev, remarks: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter any additional remarks"
              rows={3}
            />
          </div>

          <button
            type="submit"
            className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-3 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2 font-medium"
          >
            <Plus className="w-5 h-5" />
            <span>Add New Lead</span>
          </button>
        </form>
      </div>
    );
  };

  // Main render - Branch selection view
  if (!selectedBranch) {
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-purple-600 bg-clip-text text-transparent">
              🎯 Total Leads Management
            </h2>
            <p className="text-gray-600">Select a branch to view and manage leads</p>
          </div>
        </div>

        {/* Branch Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {branches.map((branch) => {
            const stats = getBranchStats(branch.id);
            const manager = employees.find(emp => emp.id === branch.manager);
            
            return (
              <div
                key={branch.id}
                onClick={() => setSelectedBranch(branch.id)}
                className="bg-gradient-to-br from-white via-gray-50 to-blue-50 rounded-3xl shadow-2xl p-8 cursor-pointer transform hover:scale-105 hover:rotate-1 transition-all duration-500 hover:shadow-blue-200/50 border border-blue-100 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center shadow-lg transform hover:rotate-12 transition-all duration-300">
                    <Building2 className="w-8 h-8 text-white drop-shadow-md" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black bg-gradient-to-r from-red-600 to-purple-600 bg-clip-text text-transparent">
                      {stats.total}
                    </div>
                    <div className="text-sm font-bold text-gray-600">Total Leads</div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{branch.name}</h3>
                  <p className="text-gray-600 flex items-center">
                    <Building2 className="w-4 h-4 mr-1" />
                    {branch.location}
                  </p>
                  {manager && (
                    <p className="text-sm text-gray-500 mt-1">
                      Manager: {manager.name}
                    </p>
                  )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl p-4 text-center transform hover:scale-110 transition-all duration-300">
                    <div className="text-2xl font-bold text-blue-700">{stats.new}</div>
                    <div className="text-xs font-medium text-blue-600">New</div>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl p-4 text-center transform hover:scale-110 transition-all duration-300">
                    <div className="text-2xl font-bold text-yellow-700">{stats.processing}</div>
                    <div className="text-xs font-medium text-yellow-600">Processing</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-xl p-4 text-center transform hover:scale-110 transition-all duration-300">
                    <div className="text-2xl font-bold text-green-700">{stats.sanctioned}</div>
                    <div className="text-xs font-medium text-green-600">Sanctioned</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl p-4 text-center transform hover:scale-110 transition-all duration-300">
                    <div className="text-2xl font-bold text-purple-700">{stats.disbursed}</div>
                    <div className="text-xs font-medium text-purple-600">Disbursed</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Conversion Rate</span>
                    <span className="font-bold text-gray-800">
                      {stats.total > 0 ? Math.round(((stats.sanctioned + stats.disbursed) / stats.total) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${stats.total > 0 ? ((stats.sanctioned + stats.disbursed) / stats.total) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center justify-center text-red-600 font-medium">
                  <span>Click to Manage</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Overall Stats */}
        <div className="mt-12 bg-gradient-to-r from-gray-900 via-gray-800 to-blue-900 rounded-3xl shadow-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-6 text-center">📊 Overall Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl font-black mb-2">{leads.length}</div>
              <div className="text-gray-300">Total Leads</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black mb-2 text-green-400">
                {leads.filter(l => ['Sanctioned', 'Disbursed'].includes(l.status)).length}
              </div>
              <div className="text-gray-300">Successful</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black mb-2 text-yellow-400">
                {leads.filter(l => ['Contacted', 'Docs Pending', 'Sent to Bank'].includes(l.status)).length}
              </div>
              <div className="text-gray-300">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black mb-2 text-blue-400">
                {Math.round((leads.filter(l => ['Sanctioned', 'Disbursed'].includes(l.status)).length / Math.max(leads.length, 1)) * 100)}%
              </div>
              <div className="text-gray-300">Success Rate</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Branch-specific view
  const branch = branches.find(b => b.id === selectedBranch);
  
  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button
          onClick={() => setSelectedBranch(null)}
          className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{branch?.name} - Lead Management</h2>
          <p className="text-gray-600">Manage leads, assignments, and file tracking</p>
        </div>
      </div>

      {/* View Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveView('overview')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeView === 'overview'
              ? 'bg-white text-red-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>Overview</span>
        </button>
        
        <button
          onClick={() => setActiveView('new')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeView === 'new'
              ? 'bg-white text-red-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Add New Lead</span>
        </button>
      </div>

      {/* Content */}
      {activeView === 'overview' && renderBranchOverview()}
      {activeView === 'new' && renderNewLeadForm()}
      {['new', 'processing', 'sanctioned', 'disbursed'].includes(activeView) && activeView !== 'new' && renderLeadsList(activeView)}

      {/* Assignment Modal */}
      {showAssignModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-2xl">
            <h3 className="text-xl font-bold text-gray-800 mb-6">🎯 Assign Lead to Staff & Bank</h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assign to Staff Member *
                  </label>
                  <select
                    value={assignmentData.staffId}
                    onChange={(e) => setAssignmentData(prev => ({ ...prev, staffId: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    required
                  >
                    <option value="">Select Staff Member</option>
                    {employees.filter(emp => emp.assignedBranch === selectedBranch).map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name} - {emp.designation}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assign to Bank *
                  </label>
                  <select
                    value={assignmentData.bankName}
                    onChange={(e) => setAssignmentData(prev => ({ ...prev, bankName: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    required
                  >
                    <option value="">Select Bank</option>
                    <option value="State Bank of India">State Bank of India</option>
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="Axis Bank">Axis Bank</option>
                    <option value="Punjab National Bank">Punjab National Bank</option>
                    <option value="Bank of Baroda">Bank of Baroda</option>
                    <option value="Canara Bank">Canara Bank</option>
                    <option value="Union Bank">Union Bank</option>
                    <option value="Indian Bank">Indian Bank</option>
                    <option value="Central Bank of India">Central Bank of India</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bank Branch (Optional)
                  </label>
                  <input
                    type="text"
                    value={assignmentData.bankBranch}
                    onChange={(e) => setAssignmentData(prev => ({ ...prev, bankBranch: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="Enter bank branch"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assignment Remarks
                  </label>
                  <textarea
                    value={assignmentData.remarks}
                    onChange={(e) => setAssignmentData(prev => ({ ...prev, remarks: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="Enter assignment notes"
                    rows={3}
                  />
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">📋 Assignment Process</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Lead will be assigned to selected staff member</li>
                  <li>• Bank assignment will be recorded for processing</li>
                  <li>• Staff will see this lead in their dashboard</li>
                  <li>• Lead status will change to "Contacted"</li>
                  <li>• Assignment history will be tracked</li>
                </ul>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowAssignModal({ isOpen: false, leadId: '' })}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignLead}
                  className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-3 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2"
                >
                  <UserCheck className="w-5 h-5" />
                  <span>Assign Lead</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}