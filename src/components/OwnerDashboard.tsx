import React, { useState } from 'react';
import {
  Building2, 
  LayoutDashboard, 
  Users, 
  Settings, 
  FolderOpen, 
  Bell,
  LogOut,
  Edit3,
  Plus,
  Eye,
  UserMinus,
  Trash2,
  BarChart3,
  Target,
  DollarSign,
  UserCheck,
  Home,
  User,
  Briefcase,
  Car,
  GraduationCap,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Phone,
  Mail
} from 'lucide-react';
import { useNetlifyAuth } from '../contexts/NetlifyAuthContext';
import { useCloudData } from '../contexts/CloudDataContext';
import StaffManagement from './StaffManagement';
import BranchManagement from './BranchManagement';
import LeadManagement from './LeadManagement';
import SettingsPanel from './SettingsPanel';
import ReportsPanel from './ReportsPanel';
import FileManager from './FileManager';
import TotalLeadsManagement from './TotalLeadsManagement';
import AdminLeadGeneration from './AdminLeadGeneration';
import MetaLeadIntegration from './MetaLeadIntegration';
import BasicLeadPipeline from './BasicLeadPipeline';
import LeadAssignmentCenter from './LeadAssignmentCenter';
import BSLogo from './BSLogo';

interface LeadStageData {
  stage: string;
  count: number;
  color: string;
  icon: React.ReactNode;
  leads: any[];
}

interface LoanTypeData {
  type: string;
  icon: React.ReactNode;
  color: string;
  leads: any[];
  stages: {
    'Lead Created': any[];
    'Assigned': any[];
    'Document Collection': any[];
    'Bank Selection': any[];
    'Processing': any[];
    'Approved/Rejected': any[];
    'Disbursed': any[];
  };
}

export default function OwnerDashboard() {
  const [activeMenu, setActiveMenu] = useState<'dashboard' | 'staff-management' | 'branch-management' | 'lead-management' | 'total-leads' | 'lead-assignment' | 'admin-lead-generation' | 'meta-integration' | 'basic-pipeline' | 'reports' | 'settings' | 'file-manager'>('dashboard');
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [selectedLoanType, setSelectedLoanType] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [stageLeads, setStageLeads] = useState<any[]>([]);

  const { user, logout } = useNetlifyAuth();
  const { branches, leads, employees, notifications, clearNotifications } = useCloudData();

  // Get lead stage data for interactive bars
  const getLeadStageData = (): LeadStageData[] => {
    return [
      {
        stage: 'New Leads',
        count: leads.filter(l => l.status === 'New').length,
        color: 'from-blue-500 to-blue-700',
        icon: <Plus className="w-6 h-6" />,
        leads: leads.filter(l => l.status === 'New')
      },
      {
        stage: 'In Progress',
        count: leads.filter(l => ['Contacted', 'Docs Pending'].includes(l.status)).length,
        color: 'from-yellow-500 to-yellow-700',
        icon: <Clock className="w-6 h-6" />,
        leads: leads.filter(l => ['Contacted', 'Docs Pending'].includes(l.status))
      },
      {
        stage: 'Bank Assigned',
        count: leads.filter(l => l.status === 'Sent to Bank').length,
        color: 'from-purple-500 to-purple-700',
        icon: <Building2 className="w-6 h-6" />,
        leads: leads.filter(l => l.status === 'Sent to Bank')
      },
      {
        stage: 'Approved / Rejected',
        count: leads.filter(l => ['Sanctioned', 'Closed'].includes(l.status)).length,
        color: 'from-green-500 to-green-700',
        icon: <CheckCircle className="w-6 h-6" />,
        leads: leads.filter(l => ['Sanctioned', 'Closed'].includes(l.status))
      },
      {
        stage: 'Disbursed / Closed',
        count: leads.filter(l => l.status === 'Disbursed').length,
        color: 'from-emerald-500 to-emerald-700',
        icon: <DollarSign className="w-6 h-6" />,
        leads: leads.filter(l => l.status === 'Disbursed')
      }
    ];
  };

  // Get loan type data for pipeline view
  const getLoanTypeData = (): LoanTypeData[] => {
    const loanTypes = ['Personal Loan', 'Home Loan', 'Business Loan', 'Mortgage Loan', 'Vehicle Loan', 'Education Loan'];
    
    return loanTypes.map(type => {
      const typeLeads = leads.filter(l => l.loanType === type);
      
      return {
        type,
        icon: type === 'Personal Loan' ? <User className="w-6 h-6" /> :
              type === 'Home Loan' ? <Home className="w-6 h-6" /> :
              type === 'Business Loan' ? <Briefcase className="w-6 h-6" /> :
              type === 'Mortgage Loan' ? <Building2 className="w-6 h-6" /> :
              type === 'Vehicle Loan' ? <Car className="w-6 h-6" /> :
              <GraduationCap className="w-6 h-6" />,
        color: type === 'Personal Loan' ? 'from-green-500 to-green-700' :
               type === 'Home Loan' ? 'from-red-500 to-red-700' :
               type === 'Business Loan' ? 'from-indigo-500 to-indigo-700' :
               type === 'Mortgage Loan' ? 'from-orange-500 to-orange-700' :
               type === 'Vehicle Loan' ? 'from-yellow-500 to-yellow-700' :
               'from-pink-500 to-pink-700',
        leads: typeLeads,
        stages: {
          'Lead Created': typeLeads.filter(l => l.status === 'New'),
          'Assigned': typeLeads.filter(l => l.assignedStaff && l.status === 'Contacted'),
          'Document Collection': typeLeads.filter(l => l.status === 'Docs Pending'),
          'Bank Selection': typeLeads.filter(l => l.assignedBank && !l.status.includes('Bank')),
          'Processing': typeLeads.filter(l => l.status === 'Sent to Bank'),
          'Approved/Rejected': typeLeads.filter(l => ['Sanctioned', 'Closed'].includes(l.status)),
          'Disbursed': typeLeads.filter(l => l.status === 'Disbursed')
        }
      };
    });
  };

  const handleStageClick = (stageData: LeadStageData) => {
    setSelectedStage(stageData.stage);
    setStageLeads(stageData.leads);
    setSelectedLoanType(null);
    setSelectedCustomer(null);
  };

  const handleLoanTypeClick = (loanTypeData: LoanTypeData) => {
    setSelectedLoanType(loanTypeData.type);
    setSelectedStage(null);
    setSelectedCustomer(null);
  };

  const handleCustomerClick = (customerId: string) => {
    setSelectedCustomer(customerId);
  };

  const renderContent = () => {
    // Customer Details View
    if (selectedCustomer) {
      const customer = leads.find(l => l.id === selectedCustomer);
      if (!customer) return null;

      const assignedEmployee = employees.find(emp => emp.id === customer.assignedStaff);
      const branch = branches.find(b => b.id === customer.branch);

      return (
        <div className="p-6">
          <div className="flex items-center mb-6">
            <button
              onClick={() => setSelectedCustomer(null)}
              className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowRight className="w-5 h-5 text-gray-600 transform rotate-180" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">📋 Full Loan Details & File Progress</h2>
              <p className="text-gray-600">{customer.fullName} - {customer.loanType}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Customer Information */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">👤 Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Full Name</label>
                    <p className="text-lg font-semibold text-gray-800">{customer.fullName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Phone Number</label>
                    <p className="text-lg font-semibold text-gray-800">{customer.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email Address</label>
                    <p className="text-lg font-semibold text-gray-800">{customer.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Lead Source</label>
                    <p className="text-lg font-semibold text-gray-800">{customer.leadSource}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">🏦 Loan Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Loan Type</label>
                    <p className="text-lg font-semibold text-gray-800">{customer.loanType}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Loan Amount</label>
                    <p className="text-lg font-semibold text-gray-800">₹{customer.loanAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Current Status</label>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                      customer.status === 'New' ? 'bg-blue-100 text-blue-800' :
                      customer.status === 'Contacted' ? 'bg-yellow-100 text-yellow-800' :
                      customer.status === 'Docs Pending' ? 'bg-orange-100 text-orange-800' :
                      customer.status === 'Sent to Bank' ? 'bg-purple-100 text-purple-800' :
                      customer.status === 'Sanctioned' ? 'bg-green-100 text-green-800' :
                      customer.status === 'Disbursed' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {customer.status}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Created Date</label>
                    <p className="text-lg font-semibold text-gray-800">{new Date(customer.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">👥 Assignment Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Assigned Staff</label>
                    <p className="text-lg font-semibold text-gray-800">
                      {assignedEmployee ? assignedEmployee.name : 'Not Assigned'}
                    </p>
                    {assignedEmployee && (
                      <p className="text-sm text-gray-500">{assignedEmployee.designation}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Branch</label>
                    <p className="text-lg font-semibold text-gray-800">{branch?.name || 'Not Assigned'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Assigned Bank</label>
                    <p className="text-lg font-semibold text-gray-800">{customer.assignedBank || 'Not Assigned'}</p>
                    {customer.assignedBankBranch && (
                      <p className="text-sm text-gray-500">{customer.assignedBankBranch}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Last Updated</label>
                    <p className="text-lg font-semibold text-gray-800">{new Date(customer.lastUpdated).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* File Progress Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">📄 File Progress</h3>
                
                {/* Document Status */}
                <div className="space-y-3">
                  {[
                    { name: 'KYC Documents', status: customer.documents?.kyc || 'Pending' },
                    { name: 'Income Proof', status: customer.documents?.income || 'Pending' },
                    { name: 'Legal Documents', status: customer.documents?.legal || 'Pending' },
                    { name: 'Additional Documents', status: customer.documents?.additional || 'Pending' }
                  ].map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">{doc.name}</span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        doc.status === 'Verified' ? 'bg-green-100 text-green-800' :
                        doc.status === 'Provided' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {doc.status}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Overall Progress */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Overall Progress</span>
                    <span className="font-bold text-gray-800">
                      {customer.documents ? 
                        Math.round((Object.values(customer.documents).filter(status => status === 'Verified').length / 4) * 100) : 0
                      }%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${customer.documents ? 
                          (Object.values(customer.documents).filter(status => status === 'Verified').length / 4) * 100 : 0
                        }%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">📝 Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">Lead Created</p>
                      <p className="text-xs text-gray-500">{new Date(customer.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  {customer.assignedStaff && (
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">Assigned to Staff</p>
                        <p className="text-xs text-gray-500">{assignedEmployee?.name}</p>
                      </div>
                    </div>
                  )}
                  {customer.assignedBank && (
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">Bank Assigned</p>
                        <p className="text-xs text-gray-500">{customer.assignedBank}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Stage Detail View
    if (selectedStage && stageLeads.length > 0) {
      return (
        <div className="p-6">
          <div className="flex items-center mb-6">
            <button
              onClick={() => {
                setSelectedStage(null);
                setStageLeads([]);
              }}
              className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowRight className="w-5 h-5 text-gray-600 transform rotate-180" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">📊 {selectedStage} Details</h2>
              <p className="text-gray-600">Showing {stageLeads.length} leads in this stage</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-2xl">
              <h3 className="text-lg font-semibold text-gray-800">{selectedStage} - Lead Details</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Loan Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned Staff / Branch
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stageLeads.map((lead) => {
                    const assignedEmployee = employees.find(emp => emp.id === lead.assignedStaff);
                    const branch = branches.find(b => b.id === lead.branch);
                    
                    return (
                      <tr key={lead.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {lead.loanType === 'Personal Loan' && <User className="w-5 h-5 text-green-600" />}
                            {lead.loanType === 'Home Loan' && <Home className="w-5 h-5 text-red-600" />}
                            {lead.loanType === 'Business Loan' && <Briefcase className="w-5 h-5 text-indigo-600" />}
                            {lead.loanType === 'Mortgage Loan' && <Building2 className="w-5 h-5 text-orange-600" />}
                            {lead.loanType === 'Vehicle Loan' && <Car className="w-5 h-5 text-yellow-600" />}
                            {lead.loanType === 'Education Loan' && <GraduationCap className="w-5 h-5 text-pink-600" />}
                            <span className="text-sm font-medium text-gray-900">{lead.loanType}</span>
                          </div>
                          <div className="text-sm text-gray-500">₹{lead.loanAmount.toLocaleString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{lead.fullName}</div>
                          <div className="text-sm text-gray-500">{lead.phone}</div>
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {assignedEmployee ? assignedEmployee.name : 'Unassigned'}
                          </div>
                          <div className="text-sm text-gray-500">{branch?.name || 'No Branch'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleCustomerClick(lead.id)}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    // Loan Type Pipeline View
    if (selectedLoanType) {
      const loanTypeData = getLoanTypeData().find(lt => lt.type === selectedLoanType);
      if (!loanTypeData) return null;

      return (
        <div className="p-6">
          <div className="flex items-center mb-6">
            <button
              onClick={() => setSelectedLoanType(null)}
              className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowRight className="w-5 h-5 text-gray-600 transform rotate-180" />
            </button>
            <div className="flex items-center space-x-3">
              <div className={`p-3 bg-gradient-to-br ${loanTypeData.color} rounded-xl text-white`}>
                {loanTypeData.icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{selectedLoanType} Pipeline</h2>
                <p className="text-gray-600">Track progress through all stages</p>
              </div>
            </div>
          </div>

          {/* Pipeline Stages */}
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
            {Object.entries(loanTypeData.stages).map(([stageName, stageLeads]) => (
              <div key={stageName} className="bg-white rounded-2xl shadow-xl p-4">
                <div className="text-center mb-4">
                  <h3 className="text-sm font-bold text-gray-800 mb-2">{stageName}</h3>
                  <div className="text-2xl font-black text-gray-900">{stageLeads.length}</div>
                </div>
                
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {stageLeads.map((lead) => (
                    <div 
                      key={lead.id}
                      onClick={() => handleCustomerClick(lead.id)}
                      className="bg-gray-50 rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="text-sm font-medium text-gray-800 mb-1">{lead.fullName}</div>
                      <div className="text-xs text-gray-600">₹{lead.loanAmount.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">{new Date(lead.createdAt).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
                
                {stageLeads.length === 0 && (
                  <div className="text-center py-4">
                    <div className="text-gray-400 text-sm">No leads</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Other menu items
    switch (activeMenu) {
      case 'staff-management':
        return <StaffManagement />;
      case 'branch-management':
        return <BranchManagement />;
      case 'total-leads':
        return <TotalLeadsManagement onBack={() => setActiveMenu('dashboard')} />;
      case 'lead-assignment':
        return <LeadAssignmentCenter />;
      case 'admin-lead-generation':
        return <AdminLeadGeneration />;
      case 'meta-integration':
        return <MetaLeadIntegration />;
      case 'basic-pipeline':
        return <BasicLeadPipeline />;
      case 'reports':
        return <ReportsPanel />;
      case 'settings':
        return <SettingsPanel />;
      case 'file-manager':
        return <FileManager />;
      default:
        // Main Dashboard View
        const stageData = getLeadStageData();
        const loanTypeData = getLoanTypeData();

        return (
          <div className="p-6">
            {/* Header Area */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <BSLogo size="lg" />
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-purple-600 bg-clip-text text-transparent">
                    Welcome, {user?.name}! 👋
                  </h1>
                  <p className="text-gray-600 text-lg">Owner Dashboard - Complete Business Overview</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Bell 
                    className="w-7 h-7 text-gray-600 cursor-pointer hover:text-red-600 transform hover:scale-110 transition-all duration-300" 
                    onClick={clearNotifications}
                  />
                  {notifications > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-bounce">
                      {notifications}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-3 bg-white rounded-2xl shadow-lg p-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center">
                    <span className="text-white text-lg font-bold">
                      {user?.name?.charAt(0) || 'A'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{user?.name}</p>
                    <p className="text-xs text-gray-600">Owner & CEO</p>
                  </div>
                  <button
                    onClick={logout}
                    className="p-2 text-gray-400 hover:text-red-600 transition-all duration-300 transform hover:scale-110"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Total Leads Interactive Bars */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 Total Leads Overview (Click to Explore)</h2>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {stageData.map((stage) => (
                  <div
                    key={stage.stage}
                    onClick={() => handleStageClick(stage)}
                    className={`bg-gradient-to-br ${stage.color} rounded-2xl shadow-2xl p-6 text-white cursor-pointer transform hover:scale-105 hover:rotate-1 transition-all duration-500 hover:shadow-2xl`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                        {stage.icon}
                      </div>
                      <div className="text-4xl font-black drop-shadow-lg">{stage.count}</div>
                    </div>
                    <h3 className="text-lg font-bold mb-2">{stage.stage}</h3>
                    <div className="flex items-center text-sm opacity-90">
                      <span>Click to view details</span>
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Loan Type Tracking Pipeline View */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">🏦 Loan Type Pipeline (Click to Track)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loanTypeData.map((loanType) => (
                  <div
                    key={loanType.type}
                    onClick={() => handleLoanTypeClick(loanType)}
                    className={`bg-gradient-to-br ${loanType.color} rounded-2xl shadow-2xl p-6 text-white cursor-pointer transform hover:scale-105 hover:rotate-1 transition-all duration-500 hover:shadow-2xl`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                        {loanType.icon}
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-black drop-shadow-lg">{loanType.leads.length}</div>
                        <div className="text-sm opacity-90">Total Files</div>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-bold mb-3">{loanType.type}</h3>
                    
                    {/* Mini Pipeline Preview */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="text-center">
                        <div className="text-lg font-bold">{loanType.stages['Lead Created'].length}</div>
                        <div className="text-xs opacity-75">New</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold">{loanType.stages['Processing'].length}</div>
                        <div className="text-xs opacity-75">Processing</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold">{loanType.stages['Disbursed'].length}</div>
                        <div className="text-xs opacity-75">Disbursed</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-sm opacity-90">
                      <span>Click to view pipeline</span>
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">🚀 Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setActiveMenu('admin-lead-generation')}
                    className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Generate New Lead</span>
                  </button>
                  <button
                    onClick={() => setActiveMenu('lead-assignment')}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <UserCheck className="w-5 h-5" />
                    <span>Assign Leads</span>
                  </button>
                  <button
                    onClick={() => setActiveMenu('staff-management')}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <Users className="w-5 h-5" />
                    <span>Manage Staff</span>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">📈 Today's Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">New Leads Today:</span>
                    <span className="font-bold text-blue-600">
                      {leads.filter(l => new Date(l.createdAt).toDateString() === new Date().toDateString()).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sanctioned Today:</span>
                    <span className="font-bold text-green-600">
                      {leads.filter(l => l.status === 'Sanctioned' && new Date(l.lastUpdated).toDateString() === new Date().toDateString()).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Disbursed Today:</span>
                    <span className="font-bold text-purple-600">
                      {leads.filter(l => l.status === 'Disbursed' && new Date(l.lastUpdated).toDateString() === new Date().toDateString()).length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">🏢 Branch Performance</h3>
                <div className="space-y-3">
                  {branches.slice(0, 3).map(branch => {
                    const branchLeads = leads.filter(l => l.branch === branch.id);
                    return (
                      <div key={branch.id} className="flex justify-between">
                        <span className="text-gray-600">{branch.name}:</span>
                        <span className="font-bold text-gray-800">{branchLeads.length} leads</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-blue-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-2xl">
        <div className="p-6 border-b bg-gradient-to-r from-red-50 to-purple-50">
          <div className="flex items-center space-x-3">
            <BSLogo size="md" />
            <div>
              <h1 className="font-bold text-gray-800">Bankmate Solutions</h1>
              <p className="text-sm text-gray-600">Owner Panel</p>
            </div>
          </div>
        </div>

        <nav className="mt-6">
          <div className="px-4 space-y-2">
            <button
              onClick={() => {
                setActiveMenu('dashboard');
                setSelectedBranch(null);
                setSelectedStage(null);
                setSelectedLoanType(null);
                setSelectedCustomer(null);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeMenu === 'dashboard' && !selectedBranch
                  ? 'bg-red-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => {
                setActiveMenu('total-leads');
                setSelectedBranch(null);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeMenu === 'total-leads'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Target className="w-5 h-5" />
              <span>Total Leads</span>
            </button>

            <button
              onClick={() => {
                setActiveMenu('staff-management');
                setSelectedBranch(null);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeMenu === 'staff-management'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Staff Management</span>
            </button>

            <button
              onClick={() => {
                setActiveMenu('branch-management');
                setSelectedBranch(null);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeMenu === 'branch-management'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Building2 className="w-5 h-5" />
              <span>Branch Management</span>
            </button>

            <button
              onClick={() => {
                setActiveMenu('admin-lead-generation');
                setSelectedBranch(null);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeMenu === 'admin-lead-generation'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Plus className="w-5 h-5" />
              <span>Lead Generation</span>
            </button>

            <button
              onClick={() => {
                setActiveMenu('lead-assignment');
                setSelectedBranch(null);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeMenu === 'lead-assignment'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <UserCheck className="w-5 h-5" />
              <span>Lead Assignment</span>
            </button>

            <button
              onClick={() => {
                setActiveMenu('meta-integration');
                setSelectedBranch(null);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeMenu === 'meta-integration'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Eye className="w-5 h-5" />
              <span>Meta Integration</span>
            </button>

            <button
              onClick={() => {
                setActiveMenu('basic-pipeline');
                setSelectedBranch(null);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeMenu === 'basic-pipeline'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span>Basic Pipeline</span>
            </button>

            <button
              onClick={() => {
                setActiveMenu('reports');
                setSelectedBranch(null);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeMenu === 'reports'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span>Reports</span>
            </button>

            <button
              onClick={() => {
                setActiveMenu('settings');
                setSelectedBranch(null);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeMenu === 'settings'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </button>

            <button
              onClick={() => {
                setActiveMenu('file-manager');
                setSelectedBranch(null);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeMenu === 'file-manager'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FolderOpen className="w-5 h-5" />
              <span>File Manager</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {renderContent()}
      </div>
    </div>
  );
}