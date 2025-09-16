import React, { useState } from 'react';
import { 
  Plus, 
  Eye, 
  Upload, 
  Download, 
  Search, 
  Filter, 
  Calendar,
  Building2,
  User,
  Phone,
  Mail,
  DollarSign,
  FileText,
  Target,
  Zap,
  Facebook,
  Globe,
  Users,
  BarChart3,
  Trash2,
  Edit3,
  Settings
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import DocumentManager from './DocumentManager';

export default function AdminLeadGeneration() {
  const [activeTab, setActiveTab] = useState<'add' | 'view' | 'import' | 'analytics'>('add');
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedLead, setSelectedLead] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    loanType: 'Home Loan' as 'Home Loan' | 'Personal Loan' | 'Business Loan' | 'Education Loan' | 'Vehicle Loan' | 'Mortgage Loan',
    loanAmount: 0,
    branch: '',
    leadSource: 'Website' as 'Meta Ads' | 'Website' | 'Referral' | 'Walk-in' | 'WhatsApp' | 'Others',
    assignedStaff: '',
    remarks: ''
  });

  const { leads, branches, employees, addLead, updateLead, deleteLead } = useData();

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
  // Filter leads based on search criteria
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.phone.includes(searchTerm) ||
                         (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesBranch = !branchFilter || lead.branch === branchFilter;
    const matchesStatus = !statusFilter || lead.status === statusFilter;
    const matchesDate = !dateFilter || 
                       new Date(lead.createdAt).toDateString() === new Date(dateFilter).toDateString();
    
    return matchesSearch && matchesBranch && matchesStatus && matchesDate;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addLead({
      ...formData,
      status: 'New'
    });
    
    // Show success message instead of clearing form
    alert('Lead generated successfully! Form data preserved for easy duplicate entry.');
  };

  const exportLeads = () => {
    const csvData = filteredLeads.map(lead => ({
      'Full Name': lead.fullName,
      'Phone': lead.phone,
      'Email': lead.email || '',
      'Loan Type': lead.loanType,
      'Loan Amount': lead.loanAmount,
      'Branch': branches.find(b => b.id === lead.branch)?.name || '',
      'Lead Source': lead.leadSource,
      'Assigned Staff': employees.find(emp => emp.id === lead.assignedStaff)?.name || 'Unassigned',
      'Status': lead.status,
      'Created Date': new Date(lead.createdAt).toLocaleDateString(),
      'Remarks': lead.remarks || ''
    }));

    const csvContent = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `all_leads_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const renderAddLead = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">New Lead Detailed Capture Form</h3>
          <div className="text-sm text-gray-600">
            Complete Lead Generation System
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
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
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
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
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
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
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter email address"
                />
              </div>
            </div>
          </div>

          {/* 2. Loan Type */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-green-800 mb-4">2️⃣ Loan Type (Select one or more)</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {['Home Loan', 'Personal Loan', 'Business Loan', 'Mortgage Loan', 'Vehicle Loan', 'Education Loan', 'Gold Loan', 'Loan Against Property (LAP)', 'NRI Loan'].map((loanType) => (
                <label key={loanType} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="loanType"
                    value={loanType}
                    checked={formData.loanType === loanType}
                    onChange={(e) => setFormData(prev => ({ ...prev, loanType: e.target.value as any }))}
                    className="border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700">{loanType}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 3. Loan Amount & Branch */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-yellow-800 mb-4">3️⃣ Loan Requirements</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loan Amount *
                </label>
                <input
                  type="number"
                  value={formData.loanAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, loanAmount: Number(e.target.value) }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter loan amount"
                  min="0"
                  required
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
                  Lead Source *
                </label>
                <select
                  value={formData.leadSource}
                  onChange={(e) => setFormData(prev => ({ ...prev, leadSource: e.target.value as any }))}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign to Staff
                </label>
                <select
                  value={formData.assignedStaff}
                  onChange={(e) => setFormData(prev => ({ ...prev, assignedStaff: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Select Staff Member</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} - {emp.designation}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 4. Additional Information */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-purple-800 mb-4">4️⃣ Additional Information</h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Remarks / Notes
              </label>
              <textarea
                value={formData.remarks}
                onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter any additional notes, requirements, or special instructions"
                rows={4}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="submit"
              className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 text-lg font-medium"
            >
              <Plus className="w-5 h-5" />
              <span>Generate Lead</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderViewLeads = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">All Leads Management</h3>
          <button
            onClick={exportLeads}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export All</span>
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
            <option value="Contacted">Contacted</option>
            <option value="Docs Pending">Docs Pending</option>
            <option value="Sent to Bank">Sent to Bank</option>
            <option value="Sanctioned">Sanctioned</option>
            <option value="Disbursed">Disbursed</option>
            <option value="Closed">Closed</option>
          </select>
          
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
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
                  Branch & Staff
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLeads.map((lead) => {
                const branch = branches.find(b => b.id === lead.branch);
                const assignedEmployee = employees.find(emp => emp.id === lead.assignedStaff);
                
                return (
                  <tr key={lead.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{lead.fullName}</div>
                      <div className="text-sm text-gray-500">{lead.leadSource}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{lead.phone}</div>
                      <div className="text-sm text-gray-500">{lead.email || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{lead.loanType}</div>
                      <div className="text-sm text-gray-500">₹{lead.loanAmount.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{branch?.name || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{assignedEmployee?.name || 'Unassigned'}</div>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedLead(lead.id)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Manage Documents & Status"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteLead(lead.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Delete Lead"
                        >
                          <Trash2 className="w-4 h-4" />
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
          <p className="text-gray-500">No leads found matching your criteria</p>
        </div>
      )}
    </div>
  );

  const renderImportLeads = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">Bulk Lead Import</h3>
      
      <div className="space-y-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-800 mb-2">Upload Lead Data</h4>
          <p className="text-gray-600 mb-4">
            Upload CSV file with lead information for bulk processing
          </p>
          <input
            type="file"
            accept=".csv"
            className="hidden"
            id="bulk-upload"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                alert(`File "${file.name}" selected. Bulk import functionality will be implemented.`);
              }
            }}
          />
          <label
            htmlFor="bulk-upload"
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors cursor-pointer inline-flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>Choose CSV File</span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">CSV Format Requirements</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Full Name (required)</li>
              <li>• Phone Number (required)</li>
              <li>• Email Address</li>
              <li>• Loan Type (required)</li>
              <li>• Loan Amount (required)</li>
              <li>• Branch ID (required)</li>
              <li>• Lead Source</li>
              <li>• Remarks</li>
            </ul>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">Integration Options</h4>
            <div className="space-y-3">
              <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                <Facebook className="w-4 h-4" />
                <span>Connect Facebook Leads</span>
              </button>
              <button className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2">
                <Globe className="w-4 h-4" />
                <span>Website Integration</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => {
    const totalLeads = leads.length;
    const newLeads = leads.filter(lead => lead.status === 'New').length;
    const contactedLeads = leads.filter(lead => lead.status === 'Contacted').length;
    const sanctionedLeads = leads.filter(lead => lead.status === 'Sanctioned').length;
    const disbursedLeads = leads.filter(lead => lead.status === 'Disbursed').length;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold text-gray-900">{totalLeads}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Plus className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">New Leads</p>
                <p className="text-2xl font-bold text-gray-900">{newLeads}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Phone className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Contacted</p>
                <p className="text-2xl font-bold text-gray-900">{contactedLeads}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sanctioned</p>
                <p className="text-2xl font-bold text-gray-900">{sanctionedLeads}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Disbursed</p>
                <p className="text-2xl font-bold text-gray-900">{disbursedLeads}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Branch Performance</h3>
            <div className="space-y-4">
              {branches.map(branch => {
                const branchLeads = leads.filter(lead => lead.branch === branch.id);
                const branchConversion = branchLeads.filter(lead => ['Sanctioned', 'Disbursed'].includes(lead.status)).length;
                const conversionRate = branchLeads.length > 0 ? Math.round((branchConversion / branchLeads.length) * 100) : 0;

                return (
                  <div key={branch.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-gray-800">{branch.name}</h4>
                      <span className="text-sm text-gray-600">{conversionRate}% conversion</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-semibold text-blue-600">{branchLeads.length}</div>
                        <div className="text-gray-600">Total</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-yellow-600">{branchLeads.filter(l => l.status === 'New').length}</div>
                        <div className="text-gray-600">New</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-green-600">{branchConversion}</div>
                        <div className="text-gray-600">Converted</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Lead Sources</h3>
            <div className="space-y-3">
              {['Meta Ads', 'Website', 'Referral', 'Walk-in', 'WhatsApp', 'Others'].map(source => {
                const sourceLeads = leads.filter(lead => lead.leadSource === source).length;
                const percentage = totalLeads > 0 ? Math.round((sourceLeads / totalLeads) * 100) : 0;

                return (
                  <div key={source} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{source}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-600 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-800">{sourceLeads}</span>
                    </div>
                  </div>
                );
              })}
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
          <h2 className="text-2xl font-bold text-gray-800">Lead Generation Center</h2>
          <p className="text-gray-600">Centralized lead management across all branches</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            Total Leads: {leads.length}
          </div>
        </div>
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
          <span>Generate Lead</span>
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
          <span>View All Leads</span>
        </button>

        <button
          onClick={() => setActiveTab('import')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'import'
              ? 'bg-white text-red-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Import Leads</span>
        </button>
        
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'analytics'
              ? 'bg-white text-red-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Analytics</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'add' && renderAddLead()}
      {activeTab === 'view' && renderViewLeads()}
      {activeTab === 'import' && renderImportLeads()}
      {activeTab === 'analytics' && renderAnalytics()}
    </div>
  );
}