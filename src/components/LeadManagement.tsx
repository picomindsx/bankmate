import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  BarChart3, 
  Trash2, 
  UserX, 
  Zap, 
  Facebook, 
  Search, 
  Download, 
  Upload,
  Eye,
  Calendar,
  Filter,
  FileText,
  Settings
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import DocumentManager from './DocumentManager';

interface LeadManagementProps {
  branchId: string;
  branchName: string;
  onBack: () => void;
}

export default function LeadManagement({ branchId, branchName, onBack }: LeadManagementProps) {
  const [activeTab, setActiveTab] = useState<'add' | 'view' | 'import' | 'deleted' | 'unassigned'>('add');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedLead, setSelectedLead] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    leadType: 'Hot Lead',
    assignedAgent: '',
    cost: 0,
    cibilScore: 0,
    address: '',
    source: 'Manual',
    additionalInfo: ''
  });

  const { leads, employees, addLead, updateLead, deleteLead } = useData();

  const branchLeads = leads.filter(lead => lead.branch === branchId);
  const deletedLeads = branchLeads.filter(lead => lead.status === 'deleted');
  const unassignedLeads = branchLeads.filter(lead => lead.status === 'unassigned');
  const activeLeads = branchLeads.filter(lead => lead.status !== 'deleted');

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
  // Filter leads based on search and date
  const filteredLeads = activeLeads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.phone.includes(searchTerm) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = !dateFilter || 
                       new Date(lead.createdAt).toDateString() === new Date(dateFilter).toDateString();
    
    return matchesSearch && matchesDate;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addLead({
      ...formData,
      status: 'New',
      branch: branchId
    });
    setFormData({
      name: '',
      phone: '',
      email: '',
      leadType: 'Hot Lead',
      assignedAgent: '',
      cost: 0,
      cibilScore: 0,
      address: '',
      source: 'Manual',
      additionalInfo: ''
    });
    // Lead added successfully - no alert needed, data persists
  };

  const handleAutoAssign = () => {
    if (employees.length === 0) {
      alert('No employees available for assignment');
      return;
    }

    const unassigned = unassignedLeads;
    unassigned.forEach((lead, index) => {
      const employeeIndex = index % employees.length;
      const employee = employees[employeeIndex];
      updateLead(lead.id, {
        status: 'assigned',
        assignedTo: employee.id
      });
    });

    alert(`${unassigned.length} leads have been auto-assigned to staff members`);
  };

  const exportToCSV = () => {
    const csvData = filteredLeads.map(lead => ({
      Name: lead.name,
      Phone: lead.phone,
      Email: lead.email,
      'Lead Type': lead.leadType,
      'Assigned Agent': employees.find(emp => emp.id === lead.assignedTo)?.name || 'Unassigned',
      Cost: lead.cost,
      'CIBIL Score': lead.cibilScore,
      Address: lead.address,
      Source: lead.source,
      Status: lead.status,
      'Created Date': new Date(lead.createdAt).toLocaleDateString(),
      'Additional Info': lead.additionalInfo
    }));

    const csvContent = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${branchName}_leads_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const connectToFacebook = () => {
    alert('Redirecting to Facebook Settings to connect your account...');
  };

  const renderAddLeads = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Add New Lead</h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter client name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Number *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter contact number"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email ID *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter email address"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lead Type
              </label>
              <select
                value={formData.leadType}
                onChange={(e) => setFormData(prev => ({ ...prev, leadType: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="Hot Lead">Hot Lead</option>
                <option value="Warm Lead">Warm Lead</option>
                <option value="Cold Lead">Cold Lead</option>
                <option value="Qualified Lead">Qualified Lead</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign Agent
              </label>
              <select
                value={formData.assignedAgent}
                onChange={(e) => setFormData(prev => ({ ...prev, assignedAgent: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">Select Agent</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cost
              </label>
              <input
                type="number"
                value={formData.cost}
                onChange={(e) => setFormData(prev => ({ ...prev, cost: Number(e.target.value) }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter cost"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CIBIL Score
              </label>
              <input
                type="number"
                value={formData.cibilScore}
                onChange={(e) => setFormData(prev => ({ ...prev, cibilScore: Number(e.target.value) }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter CIBIL score"
                min="300"
                max="900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lead Source
              </label>
              <select
                value={formData.source}
                onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="Manual">Manual Entry</option>
                <option value="Facebook">Facebook</option>
                <option value="Website">Website</option>
                <option value="Referral">Referral</option>
                <option value="Cold Call">Cold Call</option>
                <option value="Walk-in">Walk-in</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter complete address"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Information
            </label>
            <textarea
              value={formData.additionalInfo}
              onChange={(e) => setFormData(prev => ({ ...prev, additionalInfo: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter any additional information, notes, or special requirements"
              rows={4}
            />
          </div>

          <button
            type="submit"
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Lead</span>
          </button>
        </form>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Auto Assign Leads to Staff</h3>
            <p className="text-blue-100">Stay ahead of the game with automatic lead distribution</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={connectToFacebook}
              className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-2"
            >
              <Facebook className="w-4 h-4" />
              <span>Connect Facebook</span>
            </button>
            <button
              onClick={handleAutoAssign}
              className="bg-blue-800 text-white px-4 py-2 rounded-lg hover:bg-blue-900 transition-colors flex items-center space-x-2"
            >
              <Zap className="w-4 h-4" />
              <span>Auto Assign</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderViewLeads = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">View Leads</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={exportToCSV}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
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
                  Client Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lead Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Financial
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assignment
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
                const assignedEmployee = employees.find(emp => emp.id === lead.assignedTo);
                return (
                  <tr key={lead.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                      <div className="text-sm text-gray-500">{lead.leadType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{lead.phone}</div>
                      <div className="text-sm text-gray-500">{lead.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">Source: {lead.source}</div>
                      <div className="text-sm text-gray-500">
                        Status: <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          lead.status === 'assigned' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {lead.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">Cost: ₹{lead.cost}</div>
                      <div className="text-sm text-gray-500">CIBIL: {lead.cibilScore}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {assignedEmployee ? assignedEmployee.name : 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedLead(lead.id)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Manage Documents"
                        >
                          <FileText className="w-4 h-4" />
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
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No leads found</p>
        </div>
      )}
    </div>
  );

  const renderImportLeads = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">Import Leads</h3>
      
      <div className="space-y-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-800 mb-2">Upload CSV File</h4>
          <p className="text-gray-600 mb-4">
            Upload a CSV file with lead data. Make sure your file includes columns for name, phone, email, etc.
          </p>
          <input
            type="file"
            accept=".csv"
            className="hidden"
            id="csv-upload"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                alert(`File "${file.name}" selected. Import functionality will be implemented.`);
              }
            }}
          />
          <label
            htmlFor="csv-upload"
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors cursor-pointer inline-flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>Choose File</span>
          </label>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">CSV Format Requirements</h4>
          <p className="text-sm text-blue-700 mb-2">Your CSV file should include these columns:</p>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Name (required)</li>
            <li>• Phone (required)</li>
            <li>• Email (required)</li>
            <li>• Lead Type</li>
            <li>• Cost</li>
            <li>• CIBIL Score</li>
            <li>• Address</li>
            <li>• Source</li>
            <li>• Additional Information</li>
          </ul>
        </div>
      </div>
    </div>
  );

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
          <h2 className="text-2xl font-bold text-gray-800">Lead Management</h2>
          <p className="text-gray-600">{branchName}</p>
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
          <span>Add Leads</span>
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
          <span>View Leads</span>
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
          onClick={() => setActiveTab('deleted')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'deleted'
              ? 'bg-white text-red-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Trash2 className="w-4 h-4" />
          <span>Deleted Leads ({deletedLeads.length})</span>
        </button>
        
        <button
          onClick={() => setActiveTab('unassigned')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'unassigned'
              ? 'bg-white text-red-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <UserX className="w-4 h-4" />
          <span>Unassigned Leads ({unassignedLeads.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'add' && renderAddLeads()}
      {activeTab === 'view' && renderViewLeads()}
      {activeTab === 'import' && renderImportLeads()}
      {activeTab === 'deleted' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Deleted Leads</h3>
          {deletedLeads.length > 0 ? (
            <div className="space-y-4">
              {deletedLeads.map((lead) => (
                <div key={lead.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-800">{lead.name}</h4>
                      <p className="text-sm text-gray-600">{lead.phone} • {lead.email}</p>
                      <p className="text-xs text-gray-500">Type: {lead.leadType} • Source: {lead.source}</p>
                    </div>
                    <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                      Deleted
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No deleted leads</p>
          )}
        </div>
      )}
      {activeTab === 'unassigned' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Unassigned Leads</h3>
            {unassignedLeads.length > 0 && (
              <button
                onClick={handleAutoAssign}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <Zap className="w-4 h-4" />
                <span>Auto Assign All</span>
              </button>
            )}
          </div>
          
          {unassignedLeads.length > 0 ? (
            <div className="space-y-4">
              {unassignedLeads.map((lead) => (
                <div key={lead.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-800">{lead.name}</h4>
                      <p className="text-sm text-gray-600">{lead.phone} • {lead.email}</p>
                      <p className="text-xs text-gray-500">Type: {lead.leadType} • Source: {lead.source}</p>
                    </div>
                    <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                      Unassigned
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No unassigned leads</p>
          )}
        </div>
      )}
    </div>
  );
}