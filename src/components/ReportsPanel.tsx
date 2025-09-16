import React, { useState } from 'react';
import { 
  BarChart3, 
  Users, 
  ArrowRightLeft, 
  Calendar, 
  XCircle, 
  FileText,
  Download,
  Filter,
  TrendingUp
} from 'lucide-react';
import { useData } from '../contexts/DataContext';

export default function ReportsPanel() {
  const [activeReport, setActiveReport] = useState<'staff' | 'transfer' | 'total' | 'reschedule' | 'rejected' | 'daily'>('staff');
  const [dateRange, setDateRange] = useState({
    from: '',
    to: ''
  });

  const { employees, leads, branches } = useData();

  const generateStaffReport = () => {
    return employees.map(employee => {
      const employeeLeads = leads.filter(lead => lead.assignedTo === employee.id);
      return {
        name: employee.name,
        designation: employee.designation,
        totalLeads: employeeLeads.length,
        assignedLeads: employeeLeads.filter(lead => lead.status === 'assigned').length,
        convertedLeads: 0, // This would be calculated based on actual conversions
        phone: employee.phone,
        email: employee.email
      };
    });
  };

  const generateTotalReport = () => {
    const totalLeads = leads.length;
    const newLeads = leads.filter(lead => {
      const today = new Date();
      const leadDate = new Date(lead.createdAt);
      const diffTime = Math.abs(today.getTime() - leadDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7; // New leads from last 7 days
    }).length;
    
    const assignedLeads = leads.filter(lead => lead.status === 'assigned').length;
    const unassignedLeads = leads.filter(lead => lead.status === 'unassigned').length;
    const deletedLeads = leads.filter(lead => lead.status === 'deleted').length;

    return {
      totalLeads,
      newLeads,
      assignedLeads,
      unassignedLeads,
      deletedLeads,
      conversionRate: '0%' // This would be calculated based on actual conversions
    };
  };

  const exportReport = (reportType: string, data: any) => {
    let csvContent = '';
    let filename = '';

    switch (reportType) {
      case 'staff':
        csvContent = [
          'Name,Designation,Total Leads,Assigned Leads,Converted Leads,Phone,Email',
          ...data.map((row: any) => 
            `"${row.name}","${row.designation}",${row.totalLeads},${row.assignedLeads},${row.convertedLeads},"${row.phone}","${row.email}"`
          )
        ].join('\n');
        filename = 'staff_report.csv';
        break;
      case 'total':
        csvContent = [
          'Metric,Count',
          `Total Leads,${data.totalLeads}`,
          `New Leads,${data.newLeads}`,
          `Assigned Leads,${data.assignedLeads}`,
          `Unassigned Leads,${data.unassignedLeads}`,
          `Deleted Leads,${data.deletedLeads}`,
          `Conversion Rate,${data.conversionRate}`
        ].join('\n');
        filename = 'total_report.csv';
        break;
      default:
        csvContent = 'No data available';
        filename = 'report.csv';
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const renderStaffReport = () => {
    const staffData = generateStaffReport();
    
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Staff Report</h3>
          <button
            onClick={() => exportReport('staff', staffData)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Staff Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Designation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Leads
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned Leads
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Converted Leads
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {staffData.map((staff, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{staff.name}</div>
                    <div className="text-sm text-gray-500">{staff.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {staff.designation}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {staff.totalLeads}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {staff.assignedLeads}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {staff.convertedLeads}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${Math.min((staff.assignedLeads / Math.max(staff.totalLeads, 1)) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">
                        {staff.totalLeads > 0 ? Math.round((staff.assignedLeads / staff.totalLeads) * 100) : 0}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderTotalReport = () => {
    const totalData = generateTotalReport();
    
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Total Leads Report</h3>
            <button
              onClick={() => exportReport('total', totalData)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Leads</p>
                    <p className="text-2xl font-bold text-gray-900">{totalData.totalLeads}</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">New Leads</p>
                    <p className="text-2xl font-bold text-gray-900">{totalData.newLeads}</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Users className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Assigned Leads</p>
                    <p className="text-2xl font-bold text-gray-900">{totalData.assignedLeads}</p>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Unassigned Leads</p>
                    <p className="text-2xl font-bold text-gray-900">{totalData.unassignedLeads}</p>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Deleted Leads</p>
                    <p className="text-2xl font-bold text-gray-900">{totalData.deletedLeads}</p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{totalData.conversionRate}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Branch-wise breakdown */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Branch-wise Lead Distribution</h3>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {branches.map(branch => {
                const branchLeads = leads.filter(lead => lead.branch === branch.id);
                const newLeads = branchLeads.filter(lead => {
                  const today = new Date();
                  const leadDate = new Date(lead.createdAt);
                  const diffTime = Math.abs(today.getTime() - leadDate.getTime());
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  return diffDays <= 7;
                }).length;
                const assignedLeads = branchLeads.filter(lead => lead.status === 'assigned').length;

                return (
                  <div key={branch.id} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-800 mb-3">{branch.name}</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Leads:</span>
                        <span className="text-sm font-medium">{branchLeads.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">New Leads:</span>
                        <span className="text-sm font-medium text-green-600">{newLeads}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Assigned:</span>
                        <span className="text-sm font-medium text-blue-600">{assignedLeads}</span>
                      </div>
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

  const renderComingSoon = (title: string) => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="text-center py-8">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">This report will be available soon...</p>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Reports</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg overflow-x-auto">
        <button
          onClick={() => setActiveReport('staff')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
            activeReport === 'staff'
              ? 'bg-white text-red-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Staff Report</span>
        </button>
        
        <button
          onClick={() => setActiveReport('transfer')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
            activeReport === 'transfer'
              ? 'bg-white text-red-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>Transfer Leads</span>
        </button>
        
        <button
          onClick={() => setActiveReport('total')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
            activeReport === 'total'
              ? 'bg-white text-red-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Total Report</span>
        </button>
        
        <button
          onClick={() => setActiveReport('reschedule')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
            activeReport === 'reschedule'
              ? 'bg-white text-red-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Reschedule Leads</span>
        </button>
        
        <button
          onClick={() => setActiveReport('rejected')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
            activeReport === 'rejected'
              ? 'bg-white text-red-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <XCircle className="w-4 h-4" />
          <span>Rejected Leads</span>
        </button>
        
        <button
          onClick={() => setActiveReport('daily')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
            activeReport === 'daily'
              ? 'bg-white text-red-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Day to Day</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeReport === 'staff' && renderStaffReport()}
      {activeReport === 'total' && renderTotalReport()}
      {activeReport === 'transfer' && renderComingSoon('Transfer Leads Report')}
      {activeReport === 'reschedule' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Reschedule Leads Report</h3>
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No rescheduled leads found</p>
          </div>
        </div>
      )}
      {activeReport === 'rejected' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Rejected Leads Report</h3>
          <div className="text-center py-8">
            <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No rejected leads found</p>
          </div>
        </div>
      )}
      {activeReport === 'daily' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Activity Reports</h3>
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No daily reports available</p>
          </div>
        </div>
      )}
    </div>
  );
}