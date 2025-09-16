import React, { useState } from 'react';
import { 
  UserCheck, 
  Building2, 
  Users, 
  Eye, 
  Search, 
  Filter,
  Calendar,
  Phone,
  Mail,
  DollarSign,
  FileText,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertTriangle,
  User,
  Briefcase
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

export default function LeadAssignmentCenter() {
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showAssignModal, setShowAssignModal] = useState<{ isOpen: boolean; leadId: string; leadName: string }>({ 
    isOpen: false, 
    leadId: '', 
    leadName: '' 
  });
  const [assignmentData, setAssignmentData] = useState({
    staffId: '',
    bankName: '',
    bankBranch: '',
    remarks: ''
  });

  const { leads, branches, employees, updateLeadAssignment } = useData();
  const { user } = useAuth();

  // Get unassigned leads (leads without staff assignment)
  const getUnassignedLeads = () => {
    return leads.filter(lead => 
      !lead.assignedStaff && 
      lead.status === 'New' &&
      (!selectedBranch || lead.branch === selectedBranch)
    );
  };

  // Get all leads for assignment overview
  const getAllLeadsForAssignment = () => {
    let filteredLeads = leads.filter(lead => 
      !selectedBranch || lead.branch === selectedBranch
    );

    if (statusFilter) {
      if (statusFilter === 'unassigned') {
        filteredLeads = filteredLeads.filter(lead => !lead.assignedStaff);
      } else if (statusFilter === 'assigned') {
        filteredLeads = filteredLeads.filter(lead => lead.assignedStaff);
      } else {
        filteredLeads = filteredLeads.filter(lead => lead.status === statusFilter);
      }
    }

    if (searchTerm) {
      filteredLeads = filteredLeads.filter(lead => 
        lead.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone.includes(searchTerm) ||
        (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return filteredLeads;
  };

  const handleAssignLead = () => {
    if (!assignmentData.staffId || !assignmentData.bankName) {
      alert('Please select both staff member and bank');
      return;
    }

    const staff = employees.find(emp => emp.id === assignmentData.staffId);
    if (!staff) return;

    updateLeadAssignment(
      showAssignModal.leadId,
      assignmentData.staffId,
      assignmentData.bankName,
      assignmentData.bankBranch,
      user?.name
    );

    setShowAssignModal({ isOpen: false, leadId: '', leadName: '' });
    setAssignmentData({ staffId: '', bankName: '', bankBranch: '', remarks: '' });
    alert(`Lead successfully assigned to ${staff.name}!`);
  };

  const openAssignModal = (leadId: string, leadName: string) => {
    setShowAssignModal({ isOpen: true, leadId, leadName });
    setAssignmentData({ staffId: '', bankName: '', bankBranch: '', remarks: '' });
  };

  const unassignedLeads = getUnassignedLeads();
  const allLeads = getAllLeadsForAssignment();
  const assignedLeads = allLeads.filter(lead => lead.assignedStaff);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">🎯 Lead Assignment Center</h2>
          <p className="text-gray-600">Assign leads to staff members and banks for processing</p>
        </div>
        <div className="text-sm text-gray-600">
          Unassigned: {unassignedLeads.length} | Assigned: {assignedLeads.length}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Unassigned Leads</p>
              <p className="text-2xl font-bold text-gray-900">{unassignedLeads.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Assigned Leads</p>
              <p className="text-2xl font-bold text-gray-900">{assignedLeads.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Staff</p>
              <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Building2 className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Branches</p>
              <p className="text-2xl font-bold text-gray-900">{branches.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Branch Filter</label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Branches</option>
              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Status</option>
              <option value="unassigned">Unassigned</option>
              <option value="assigned">Assigned</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Docs Pending">Docs Pending</option>
              <option value="Sent to Bank">Sent to Bank</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Leads</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                // Auto-assign unassigned leads
                const unassigned = getUnassignedLeads();
                if (unassigned.length === 0) {
                  alert('No unassigned leads to auto-assign');
                  return;
                }
                
                const availableStaff = employees.filter(emp => 
                  !selectedBranch || emp.assignedBranch === selectedBranch
                );
                
                if (availableStaff.length === 0) {
                  alert('No staff available for assignment');
                  return;
                }

                unassigned.forEach((lead, index) => {
                  const staffIndex = index % availableStaff.length;
                  const staff = availableStaff[staffIndex];
                  updateLeadAssignment(
                    lead.id,
                    staff.id,
                    'State Bank of India', // Default bank
                    '',
                    user?.name
                  );
                });

                alert(`${unassigned.length} leads auto-assigned successfully!`);
              }}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>Auto Assign</span>
            </button>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              📋 Lead Assignment Management
            </h3>
            <div className="text-sm text-gray-600">
              Showing {allLeads.length} leads
            </div>
          </div>
        </div>
        
        {allLeads.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lead Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loan Requirements
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Branch
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assignment Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allLeads.map((lead) => {
                  const branch = branches.find(b => b.id === lead.branch);
                  const assignedStaff = employees.find(emp => emp.id === lead.assignedStaff);
                  const isAssigned = !!lead.assignedStaff && !!lead.assignedBank;
                  
                  return (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{lead.fullName}</div>
                            <div className="text-sm text-gray-500">
                              Created: {new Date(lead.createdAt).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-400">
                              Source: {lead.leadSource}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1 text-sm text-gray-900">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{lead.phone}</span>
                        </div>
                        {lead.email && (
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span>{lead.email}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{lead.loanType}</div>
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span>₹{lead.loanAmount.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1 text-sm text-gray-900">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <span>{branch?.name || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isAssigned ? (
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-medium text-green-800">Assigned</span>
                            </div>
                            <div className="text-xs text-gray-600">
                              Staff: {assignedStaff?.name}
                            </div>
                            <div className="text-xs text-gray-600">
                              Bank: {lead.assignedBank}
                            </div>
                            {lead.assignedBankBranch && (
                              <div className="text-xs text-gray-500">
                                Branch: {lead.assignedBankBranch}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                            <span className="text-sm font-medium text-red-800">Unassigned</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {!isAssigned ? (
                          <button
                            onClick={() => openAssignModal(lead.id, lead.fullName)}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                          >
                            <UserCheck className="w-4 h-4" />
                            <span>Assign</span>
                          </button>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              lead.status === 'New' ? 'bg-blue-100 text-blue-800' :
                              lead.status === 'Contacted' ? 'bg-yellow-100 text-yellow-800' :
                              lead.status === 'Docs Pending' ? 'bg-orange-100 text-orange-800' :
                              lead.status === 'Sent to Bank' ? 'bg-purple-100 text-purple-800' :
                              lead.status === 'Sanctioned' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {lead.status}
                            </span>
                            <button
                              onClick={() => openAssignModal(lead.id, lead.fullName)}
                              className="text-blue-600 hover:text-blue-800 text-xs underline"
                            >
                              Reassign
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center">
            <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No leads found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Assignment Modal */}
      {showAssignModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-2xl">
            <h3 className="text-xl font-bold text-gray-800 mb-6">
              🎯 Assign Lead: {showAssignModal.leadName}
            </h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    {employees
                      .filter(emp => !selectedBranch || emp.assignedBranch === selectedBranch)
                      .map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name} - {emp.designation}
                        </option>
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
                    <option value="IDFC First Bank">IDFC First Bank</option>
                    <option value="Yes Bank">Yes Bank</option>
                    <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                    <option value="IndusInd Bank">IndusInd Bank</option>
                    <option value="Federal Bank">Federal Bank</option>
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
                    placeholder="Enter specific bank branch"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assignment Notes
                  </label>
                  <textarea
                    value={assignmentData.remarks}
                    onChange={(e) => setAssignmentData(prev => ({ ...prev, remarks: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="Add assignment notes or special instructions"
                    rows={3}
                  />
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">📋 Assignment Process</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Lead will be assigned to the selected staff member</li>
                  <li>• Bank assignment will be recorded for processing</li>
                  <li>• Staff will see this lead in their "My Assigned Leads" section</li>
                  <li>• Lead status will automatically change to "Contacted"</li>
                  <li>• Assignment history will be tracked with your name</li>
                  <li>• Staff will see who assigned the lead (you)</li>
                </ul>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowAssignModal({ isOpen: false, leadId: '', leadName: '' })}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignLead}
                  className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                >
                  <UserCheck className="w-5 h-5" />
                  <span>Assign Lead</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Summary */}
      <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <h4 className="font-medium text-gray-800 mb-4">📊 Assignment Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {branches.map(branch => {
            const branchLeads = leads.filter(lead => lead.branch === branch.id);
            const assignedInBranch = branchLeads.filter(lead => lead.assignedStaff).length;
            const unassignedInBranch = branchLeads.filter(lead => !lead.assignedStaff).length;
            
            return (
              <div key={branch.id} className="bg-white rounded-lg p-4">
                <h5 className="font-medium text-gray-800 mb-3">{branch.name}</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Leads:</span>
                    <span className="font-medium">{branchLeads.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-600">Assigned:</span>
                    <span className="font-medium text-green-600">{assignedInBranch}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-600">Unassigned:</span>
                    <span className="font-medium text-red-600">{unassignedInBranch}</span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${branchLeads.length > 0 ? (assignedInBranch / branchLeads.length) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}