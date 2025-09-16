import React, { useState } from 'react';
import { 
  Facebook, 
  Instagram, 
  MessageSquare, 
  Plus, 
  Eye, 
  CheckCircle, 
  Clock, 
  Download,
  Upload,
  Settings,
  Zap,
  Users,
  BarChart3,
  Filter,
  Search,
  Calendar,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { useData } from '../contexts/DataContext';

export default function MetaLeadIntegration() {
  const [activeTab, setActiveTab] = useState<'setup' | 'leads' | 'campaigns' | 'analytics'>('setup');
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState<'All' | 'Facebook' | 'Instagram' | 'WhatsApp Business'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Processed' | 'Pending'>('All');
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState({
    facebook: false,
    instagram: false,
    whatsapp: false
  });

  const { metaLeads, addMetaLead, convertMetaLeadToLead, branches } = useData();

  // Sample Meta leads for demonstration
  const sampleMetaLeads = [
    {
      id: '1',
      platform: 'Facebook' as const,
      campaignName: 'Home Loan Campaign Q4',
      adSetName: 'Mumbai Home Loans',
      formName: 'Home Loan Interest Form',
      leadData: {
        fullName: 'Rajesh Kumar',
        phone: '9876543210',
        email: 'rajesh.kumar@email.com',
        city: 'Mumbai',
        loanType: 'Home Loan',
        loanAmount: 5000000,
        customFields: {
          propertyType: 'Apartment',
          budget: '50-75 Lakhs'
        }
      },
      receivedAt: new Date('2024-01-15T10:30:00'),
      processed: false,
      source: 'Meta Ads' as const
    },
    {
      id: '2',
      platform: 'Instagram' as const,
      campaignName: 'Personal Loan Stories',
      adSetName: 'Young Professionals',
      formName: 'Quick Personal Loan',
      leadData: {
        fullName: 'Priya Sharma',
        phone: '9123456789',
        email: 'priya.sharma@email.com',
        city: 'Delhi',
        loanType: 'Personal Loan',
        loanAmount: 300000,
        customFields: {
          purpose: 'Wedding',
          employment: 'Salaried'
        }
      },
      receivedAt: new Date('2024-01-15T14:45:00'),
      processed: true,
      convertedToLead: 'lead_123',
      source: 'Instagram Ads' as const
    }
  ];

  const handleConnect = (platform: 'facebook' | 'instagram' | 'whatsapp') => {
    // Redirect to actual platform connection pages
    let connectionUrl = '';
    
    switch (platform) {
      case 'facebook':
        connectionUrl = 'https://developers.facebook.com/apps/';
        break;
      case 'instagram':
        connectionUrl = 'https://business.instagram.com/';
        break;
      case 'whatsapp':
        connectionUrl = 'https://business.whatsapp.com/';
        break;
    }
    
    // Open connection page in new tab
    window.open(connectionUrl, '_blank');
    
    // Show instructions to user
    alert(`Please complete the ${platform} connection process in the new tab. Once connected, return here to manage your leads.`);
  };

  const handleConvertLead = (metaLeadId: string, branchId: string) => {
    convertMetaLeadToLead(metaLeadId, { branch: branchId });
    alert('Lead converted successfully and added to the pipeline!');
  };

  const filteredMetaLeads = [...metaLeads, ...sampleMetaLeads].filter(lead => {
    const matchesSearch = lead.leadData.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.leadData.phone.includes(searchTerm) ||
                         (lead.leadData.email && lead.leadData.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesPlatform = platformFilter === 'All' || lead.platform === platformFilter;
    const matchesStatus = statusFilter === 'All' || 
                         (statusFilter === 'Processed' && lead.processed) ||
                         (statusFilter === 'Pending' && !lead.processed);
    
    return matchesSearch && matchesPlatform && matchesStatus;
  });

  const renderSetup = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">🔗 Connect Your Meta Platforms</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Facebook Connection */}
          <div className="border border-gray-200 rounded-lg p-6 text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              connectionStatus.facebook ? 'bg-blue-600' : 'bg-gray-400'
            }`}>
              <Facebook className="w-8 h-8 text-white" />
            </div>
            <h4 className="font-semibold text-gray-800 mb-2">Facebook Ads</h4>
            <p className="text-sm text-gray-600 mb-4">
              Connect your Facebook Ads account to automatically import leads from your campaigns.
            </p>
            <div className="mb-4">
              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                connectionStatus.facebook 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {connectionStatus.facebook ? '✅ Connected' : '❌ Not Connected'}
              </span>
            </div>
            <button
              onClick={() => handleConnect('facebook')}
              className={`w-full px-4 py-2 rounded-lg transition-colors ${
                connectionStatus.facebook
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <ExternalLink className="w-4 h-4" />
                <span>Connect Facebook</span>
              </div>
            </button>
          </div>

          {/* Instagram Connection */}
          <div className="border border-gray-200 rounded-lg p-6 text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              connectionStatus.instagram ? 'bg-pink-600' : 'bg-gray-400'
            }`}>
              <Instagram className="w-8 h-8 text-white" />
            </div>
            <h4 className="font-semibold text-gray-800 mb-2">Instagram Ads</h4>
            <p className="text-sm text-gray-600 mb-4">
              Connect your Instagram Business account to capture leads from Stories and Feed ads.
            </p>
            <div className="mb-4">
              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                connectionStatus.instagram 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {connectionStatus.instagram ? '✅ Connected' : '❌ Not Connected'}
              </span>
            </div>
            <button
              onClick={() => handleConnect('instagram')}
              className={`w-full px-4 py-2 rounded-lg transition-colors ${
                connectionStatus.instagram
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-pink-600 text-white hover:bg-pink-700'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <ExternalLink className="w-4 h-4" />
                <span>Connect Instagram</span>
              </div>
            </button>
          </div>

          {/* WhatsApp Business Connection */}
          <div className="border border-gray-200 rounded-lg p-6 text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              connectionStatus.whatsapp ? 'bg-green-600' : 'bg-gray-400'
            }`}>
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <h4 className="font-semibold text-gray-800 mb-2">WhatsApp Business</h4>
            <p className="text-sm text-gray-600 mb-4">
              Connect WhatsApp Business API to capture leads from click-to-WhatsApp ads.
            </p>
            <div className="mb-4">
              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                connectionStatus.whatsapp 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {connectionStatus.whatsapp ? '✅ Connected' : '❌ Not Connected'}
              </span>
            </div>
            <button
              onClick={() => handleConnect('whatsapp')}
              className={`w-full px-4 py-2 rounded-lg transition-colors ${
                connectionStatus.whatsapp
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <ExternalLink className="w-4 h-4" />
                <span>Connect WhatsApp</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Setup Instructions */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h4 className="font-semibold text-blue-800 mb-4">🚀 Setup Instructions</h4>
        <div className="space-y-3 text-sm text-blue-700">
          <div className="flex items-start space-x-2">
            <span className="font-bold">1.</span>
            <span>Click "Connect" on any platform above to open the official connection page in a new tab</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="font-bold">2.</span>
            <span>Log in to your Facebook/Instagram/WhatsApp Business account</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="font-bold">3.</span>
            <span>Grant necessary permissions for lead access and campaign management</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="font-bold">4.</span>
            <span>Configure webhook URLs for real-time lead notifications</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="font-bold">5.</span>
            <span>Return to this page to manage your imported leads</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="font-bold">6.</span>
            <span>Set up automatic lead assignment rules and branch mapping</span>
          </div>
        </div>
      </div>

      {/* Manual Lead Addition for Testing */}
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="font-semibold text-gray-800 mb-4">🧪 Test Meta Lead Integration</h4>
        <p className="text-sm text-gray-600 mb-4">
          Add sample Meta leads to test the integration workflow before connecting your actual accounts.
        </p>
        <div className="flex space-x-3">
          <button
            onClick={() => {
              addMetaLead({
                platform: 'Facebook',
                campaignName: 'Test Home Loan Campaign',
                adSetName: 'Test Ad Set',
                formName: 'Test Lead Form',
                leadData: {
                  fullName: 'Test Customer',
                  phone: '9999999999',
                  email: 'test@example.com',
                  city: 'Mumbai',
                  loanType: 'Home Loan',
                  loanAmount: 5000000
                },
                processed: false,
                source: 'Meta Ads'
              });
              alert('Test Facebook lead added successfully!');
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Facebook className="w-4 h-4" />
            <span>Add Test Facebook Lead</span>
          </button>
          
          <button
            onClick={() => {
              addMetaLead({
                platform: 'Instagram',
                campaignName: 'Test Personal Loan Stories',
                adSetName: 'Test Instagram Ad',
                formName: 'Quick Loan Form',
                leadData: {
                  fullName: 'Instagram Test User',
                  phone: '8888888888',
                  email: 'instagram@example.com',
                  city: 'Delhi',
                  loanType: 'Personal Loan',
                  loanAmount: 300000
                },
                processed: false,
                source: 'Instagram Ads'
              });
              alert('Test Instagram lead added successfully!');
            }}
            className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors flex items-center space-x-2"
          >
            <Instagram className="w-4 h-4" />
            <span>Add Test Instagram Lead</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderLeads = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            />
          </div>
          
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
          >
            <option value="All">All Platforms</option>
            <option value="Facebook">Facebook</option>
            <option value="Instagram">Instagram</option>
            <option value="WhatsApp Business">WhatsApp Business</option>
          </select>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Processed">Processed</option>
          </select>
          
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">📱 Meta Platform Leads</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Platform</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lead Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campaign Info</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loan Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Received</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMetaLeads.map((lead) => (
                <tr key={lead.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {lead.platform === 'Facebook' && <Facebook className="w-5 h-5 text-blue-600 mr-2" />}
                      {lead.platform === 'Instagram' && <Instagram className="w-5 h-5 text-pink-600 mr-2" />}
                      {lead.platform === 'WhatsApp Business' && <MessageSquare className="w-5 h-5 text-green-600 mr-2" />}
                      <span className="text-sm font-medium text-gray-900">{lead.platform}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{lead.leadData.fullName}</div>
                    <div className="text-sm text-gray-500">{lead.leadData.phone}</div>
                    <div className="text-sm text-gray-500">{lead.leadData.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{lead.campaignName}</div>
                    <div className="text-sm text-gray-500">{lead.adSetName}</div>
                    <div className="text-sm text-gray-500">{lead.formName}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{lead.leadData.loanType}</div>
                    <div className="text-sm text-gray-500">₹{lead.leadData.loanAmount?.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">{lead.leadData.city}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(lead.receivedAt).toLocaleDateString()}
                    <br />
                    {new Date(lead.receivedAt).toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      lead.processed 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {lead.processed ? '✅ Processed' : '⏳ Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {!lead.processed ? (
                      <div className="flex space-x-2">
                        <select
                          onChange={(e) => e.target.value && handleConvertLead(lead.id, e.target.value)}
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                          defaultValue=""
                        >
                          <option value="">Convert to Lead</option>
                          {branches.map(branch => (
                            <option key={branch.id} value={branch.id}>{branch.name}</option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        <span className="text-xs">Converted</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Meta Leads</p>
              <p className="text-2xl font-bold text-gray-900">{filteredMetaLeads.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Converted</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredMetaLeads.filter(lead => lead.processed).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredMetaLeads.filter(lead => !lead.processed).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredMetaLeads.length > 0 
                  ? Math.round((filteredMetaLeads.filter(lead => lead.processed).length / filteredMetaLeads.length) * 100)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Platform Performance</h3>
        <div className="space-y-4">
          {['Facebook', 'Instagram', 'WhatsApp Business'].map(platform => {
            const platformLeads = filteredMetaLeads.filter(lead => lead.platform === platform);
            const converted = platformLeads.filter(lead => lead.processed).length;
            const conversionRate = platformLeads.length > 0 ? Math.round((converted / platformLeads.length) * 100) : 0;

            return (
              <div key={platform} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-gray-800">{platform}</h4>
                  <span className="text-sm text-gray-600">{conversionRate}% conversion</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-blue-600">{platformLeads.length}</div>
                    <div className="text-gray-600">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-yellow-600">{platformLeads.length - converted}</div>
                    <div className="text-gray-600">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-green-600">{converted}</div>
                    <div className="text-gray-600">Converted</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">📱 Meta Lead Integration</h2>
          <p className="text-gray-600">Connect Facebook, Instagram & WhatsApp Business for automated lead capture</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('setup')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'setup'
              ? 'bg-white text-red-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Setup & Connect</span>
        </button>
        
        <button
          onClick={() => setActiveTab('leads')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'leads'
              ? 'bg-white text-red-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Manage Leads ({filteredMetaLeads.length})</span>
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
      {activeTab === 'setup' && renderSetup()}
      {activeTab === 'leads' && renderLeads()}
      {activeTab === 'analytics' && renderAnalytics()}
    </div>
  );
}