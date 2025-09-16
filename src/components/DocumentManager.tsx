import React, { useState } from 'react';
import {
  FileText, 
  CheckCircle, 
  X,
  Filter,
  Search,
  User,
  Building2,
  Calendar,
  Save,
  Plus,
  Edit3,
  Trash2,
  Award,
  UserCheck
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

interface DocumentManagerProps {
  leadId: string;
  leadName: string;
  onBack: () => void;
}

interface DocumentItem {
  id: string;
  sNo: number;
  loanType: string;
  documentName: string;
  submitted: 'Yes' | 'No';
  statusColor: 'green' | 'red';
  remarks?: string;
}

export default function DocumentManager({ leadId, leadName, onBack }: DocumentManagerProps) {
  const { leads, employees, branches, updateLead, getAssignedLeadsByStaff } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Yes' | 'No'>('All');
  const [filterLoanType, setFilterLoanType] = useState('All');

  const lead = leads.find(l => l.id === leadId);
  if (!lead) return null;

  // Get assignment information
  const getAssignerInfo = (lead: any) => {
    const assignerMatch = lead.remarks?.match(/Assigned.*by\s+([^.\n]+)/);
    return assignerMatch ? assignerMatch[1] : 'Manager';
  };

  // Document checklist based on loan type
  const getDocumentChecklist = (loanType: string): DocumentItem[] => {
    const baseDocuments: DocumentItem[] = [];
    let sNo = 1;

    // KYC Documents (Common for all loan types)
    const kycDocuments = [
      'Identity Proof (Aadhar/Passport/Voter ID/DL)',
      'Address Proof (Aadhar/Passport/Utility Bill/Ration Card)',
      'Passport-sized Photos',
      'PAN Card',
      'Signature Verification'
    ];

    kycDocuments.forEach(docName => {
      baseDocuments.push({
        id: sNo.toString(),
        sNo: sNo++,
        loanType: 'KYC',
        documentName: docName,
        submitted: 'No',
        statusColor: 'red'
      });
    });

    // Income Documents (Common for all loan types)
    const incomeDocuments = [
      'Salary Slips (Last 3 Months)',
      'Bank Statement (Last 6 Months)',
      'Form 16',
      'ITR (Last 2 Years)',
      'Employment Certificate',
      'Salary Certificate'
    ];

    incomeDocuments.forEach(docName => {
      baseDocuments.push({
        id: sNo.toString(),
        sNo: sNo++,
        loanType: 'Income',
        documentName: docName,
        submitted: 'No',
        statusColor: 'red'
      });
    });

    // Add co-applicant documents if applicable
    if (lead.hasCoApplicant) {
      baseDocuments.push({
        id: sNo.toString(), sNo: sNo++, loanType: 'Co-Applicant', documentName: 'Co-Applicant Identity Proof', submitted: 'No', statusColor: 'red'
      });
      baseDocuments.push({
        id: sNo.toString(), sNo: sNo++, loanType: 'Co-Applicant', documentName: 'Co-Applicant Address Proof', submitted: 'No', statusColor: 'red'
      });
      baseDocuments.push({
        id: sNo.toString(), sNo: sNo++, loanType: 'Co-Applicant', documentName: 'Co-Applicant Income Proof', submitted: 'No', statusColor: 'red'
      });
      baseDocuments.push({
        id: sNo.toString(), sNo: sNo++, loanType: 'Co-Applicant', documentName: 'Co-Applicant PAN Card', submitted: 'No', statusColor: 'red'
      });
      baseDocuments.push({
        id: sNo.toString(), sNo: sNo++, loanType: 'Co-Applicant', documentName: 'Co-Applicant Bank Statement', submitted: 'No', statusColor: 'red'
      });
    }

    // Add additional loan-specific documents
    switch (loanType) {
      case 'Home Loan':
        baseDocuments.push(
          { id: sNo.toString(), sNo: sNo++, loanType: 'Property', documentName: 'Sale Deed / Agreement to Sale', submitted: 'No', statusColor: 'red' },
          { id: sNo.toString(), sNo: sNo++, loanType: 'Property', documentName: 'Title Deed', submitted: 'No', statusColor: 'red' },
          { id: sNo.toString(), sNo: sNo++, loanType: 'Property', documentName: 'Possession Certificate', submitted: 'No', statusColor: 'red' },
          { id: sNo.toString(), sNo: sNo++, loanType: 'Property', documentName: 'Non-Attachment Certificate', submitted: 'No', statusColor: 'red' },
          { id: sNo.toString(), sNo: sNo++, loanType: 'Property', documentName: 'Encumbrance Certificate', submitted: 'No', statusColor: 'red' },
          { id: sNo.toString(), sNo: sNo++, loanType: 'Property', documentName: 'Location Sketch', submitted: 'No', statusColor: 'red' },
          { id: sNo.toString(), sNo: sNo++, loanType: 'Property', documentName: 'Property Valuation Report', submitted: 'No', statusColor: 'red' },
          { id: sNo.toString(), sNo: sNo++, loanType: 'Property', documentName: 'NOC from Builder/Society', submitted: 'No', statusColor: 'red' },
          { id: sNo.toString(), sNo: sNo++, loanType: 'Property', documentName: 'Approved Building Plan', submitted: 'No', statusColor: 'red' },
          { id: sNo.toString(), sNo: sNo++, loanType: 'Property', documentName: 'Property Tax Receipt', submitted: 'No', statusColor: 'red' },
          { id: sNo.toString(), sNo: sNo++, loanType: 'Property', documentName: 'Mutation Certificate', submitted: 'No', statusColor: 'red' }
        );
        break;
      case 'Vehicle Loan':
        baseDocuments.push(
          { id: sNo.toString(), sNo: sNo++, loanType: 'Vehicle', documentName: 'Vehicle Quotation/Proforma', submitted: 'No', statusColor: 'red' },
          { id: sNo.toString(), sNo: sNo++, loanType: 'Vehicle', documentName: 'Vehicle Insurance', submitted: 'No', statusColor: 'red' },
          { id: sNo.toString(), sNo: sNo++, loanType: 'Vehicle', documentName: 'RC Book (if existing vehicle)', submitted: 'No', statusColor: 'red' },
          { id: sNo.toString(), sNo: sNo++, loanType: 'Vehicle', documentName: 'Driving License', submitted: 'No', statusColor: 'red' },
          { id: sNo.toString(), sNo: sNo++, loanType: 'Vehicle', documentName: 'Vehicle Registration Certificate', submitted: 'No', statusColor: 'red' }
        );
        break;
      case 'Business Loan':
        baseDocuments.push(
          { id: sNo.toString(), sNo: sNo++, loanType: 'Business', documentName: 'Business Registration (GST/MSME/Incorp Certificate)', submitted: 'No', statusColor: 'red' },
          { id: sNo.toString(), sNo: sNo++, loanType: 'Business', documentName: 'Partnership Deed / MOA / AOA', submitted: 'No', statusColor: 'red' },
          { id: sNo.toString(), sNo: sNo++, loanType: 'Business', documentName: 'Profit & Loss Statement & Balance Sheet', submitted: 'No', statusColor: 'red' },
          { id: sNo.toString(), sNo: sNo++, loanType: 'Business', documentName: 'Sales Invoices', submitted: 'No', statusColor: 'red' },
          { id: sNo.toString(), sNo: sNo++, loanType: 'Business', documentName: 'Business License', submitted: 'No', statusColor: 'red' },
          { id: sNo.toString(), sNo: sNo++, loanType: 'Business', documentName: 'Rent Agreement (If Office Rented)', submitted: 'No', statusColor: 'red' },
          { id: sNo.toString(), sNo: sNo++, loanType: 'Business', documentName: 'Business Plan', submitted: 'No', statusColor: 'red' },
          { id: sNo.toString(), sNo: sNo++, loanType: 'Business', documentName: 'Cash Flow Projections', submitted: 'No', statusColor: 'red' },
          { id: sNo.toString(), sNo: sNo++, loanType: 'Business', documentName: 'Collateral Documents', submitted: 'No', statusColor: 'red' },
          { id: sNo.toString(), sNo: sNo++, loanType: 'Business', documentName: 'Trade License', submitted: 'No', statusColor: 'red' }
        );
        break;
      case 'Gold Loan':
        baseDocuments.push(
          { id: sNo.toString(), sNo: sNo++, loanType: 'Gold', documentName: 'Gold Valuation Report', submitted: 'No', statusColor: 'red' },
          { id: sNo.toString(), sNo: sNo++, loanType: 'Gold', documentName: 'Gold Purchase Receipt', submitted: 'No', statusColor: 'red' },
          { id: sNo.toString(), sNo: sNo++, loanType: 'Gold', documentName: 'Gold Purity Certificate', submitted: 'No', statusColor: 'red' },
          { id: sNo.toString(), sNo: sNo++, loanType: 'Gold', documentName: 'Gold Ornament Photos', submitted: 'No', statusColor: 'red' }
        );
        break;
      case 'Education Loan':
        baseDocuments.push(
          { id: sNo.toString(), sNo: sNo++, loanType: 'Education', documentName: 'Fee Structure (for Education)', submitted: 'No', statusColor: 'red' },
          { id: sNo.toString(), sNo: sNo++, loanType: 'Education', documentName: 'Admission Letter', submitted: 'No', statusColor: 'red' },
          { id: sNo.toString(), sNo: sNo++, loanType: 'Education', documentName: 'Academic Records', submitted: 'No', statusColor: 'red' },
          { id: sNo.toString(), sNo: sNo++, loanType: 'Education', documentName: 'Course Details', submitted: 'No', statusColor: 'red' },
          { id: sNo.toString(), sNo: sNo++, loanType: 'Education', documentName: 'Scholarship Details (if any)', submitted: 'No', statusColor: 'red' }
        );
        break;
      case 'Personal Loan':
        baseDocuments.push(
          { id: sNo.toString(), sNo: sNo++, loanType: 'Personal', documentName: 'Purpose of Loan Declaration', submitted: 'No', statusColor: 'red' },
          { id: sNo.toString(), sNo: sNo++, loanType: 'Personal', documentName: 'Guarantor Documents (if required)', submitted: 'No', statusColor: 'red' },
          { id: sNo.toString(), sNo: sNo++, loanType: 'Personal', documentName: 'Credit Score Report', submitted: 'No', statusColor: 'red' }
        );
        break;
    }

    // Add common legal documents for all loan types
    const commonLegalDocs = [
      'Family Membership Certificate',
      'Income Certificate',
      'Thandaper Certificate'
    ];

    commonLegalDocs.forEach(docName => {
      baseDocuments.push({
        id: sNo.toString(),
        sNo: sNo++,
        loanType: 'Legal',
        documentName: docName,
        submitted: 'No',
        statusColor: 'red'
      });
    });

    return baseDocuments;
  };

  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    const saved = localStorage.getItem(`documents_${leadId}`);
    if (saved) {
      return JSON.parse(saved);
    }
    return getDocumentChecklist(lead.loanType);
  });

  const handleStatusChange = (docId: string, newStatus: 'Yes' | 'No') => {
    const updatedDocs = documents.map(doc => 
      doc.id === docId 
        ? { ...doc, submitted: newStatus, statusColor: newStatus === 'Yes' ? 'green' as const : 'red' as const }
        : doc
    );
    setDocuments(updatedDocs);
    localStorage.setItem(`documents_${leadId}`, JSON.stringify(updatedDocs));
  };

  const handleRemarksChange = (docId: string, remarks: string) => {
    const updatedDocs = documents.map(doc => 
      doc.id === docId ? { ...doc, remarks } : doc
    );
    setDocuments(updatedDocs);
    localStorage.setItem(`documents_${leadId}`, JSON.stringify(updatedDocs));
  };

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.documentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || doc.submitted === filterStatus;
    const matchesLoanType = filterLoanType === 'All' || doc.loanType === filterLoanType;
    return matchesSearch && matchesStatus && matchesLoanType;
  });

  const completedDocs = documents.filter(doc => doc.submitted === 'Yes').length;
  const totalDocs = documents.length;
  const completionPercentage = totalDocs > 0 ? Math.round((completedDocs / totalDocs) * 100) : 0;
  const isDocumentComplete = completionPercentage === 100;

  const loanTypes = [...new Set(documents.map(doc => doc.loanType))];

  const handleSaveAll = () => {
    // Update lead with document completion status
    updateLead(leadId, {
      documentCompletion: completionPercentage,
      lastDocumentUpdate: new Date()
    });
    alert('Document status saved successfully!');
  };

  const getLoanTypeColor = (loanType: string) => {
    switch (loanType) {
      case 'KYC': return 'bg-blue-100 text-blue-800';
      case 'Income': return 'bg-green-100 text-green-800';
      case 'Legal': return 'bg-purple-100 text-purple-800';
      case 'Co-Applicant': return 'bg-orange-100 text-orange-800';
      case 'Property': return 'bg-red-100 text-red-800';
      case 'Vehicle': return 'bg-yellow-100 text-yellow-800';
      case 'Business': return 'bg-indigo-100 text-indigo-800';
      case 'Gold': return 'bg-yellow-100 text-yellow-800';
      case 'Education': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const addCustomDocument = () => {
    const docName = prompt('Enter custom document name:');
    if (docName && docName.trim()) {
      const docType = prompt('Enter document type (KYC/Income/Legal/Property/Vehicle/Business/Gold/Education/Personal/Co-Applicant):') || lead.loanType;
      const newDoc: DocumentItem = {
        id: Date.now().toString(),
        sNo: documents.length + 1,
        loanType: docType,
        documentName: docName.trim(),
        submitted: 'No',
        statusColor: 'red'
      };
      const updatedDocs = [...documents, newDoc];
      setDocuments(updatedDocs);
      localStorage.setItem(`documents_${leadId}`, JSON.stringify(updatedDocs));
    }
  };

  const editDocument = (docId: string) => {
    const doc = documents.find(d => d.id === docId);
    if (doc) {
      const newName = prompt('Edit document name:', doc.documentName);
      if (newName && newName.trim()) {
        const updatedDocs = documents.map(d => 
          d.id === docId ? { ...d, documentName: newName.trim() } : d
        );
        setDocuments(updatedDocs);
        localStorage.setItem(`documents_${leadId}`, JSON.stringify(updatedDocs));
      }
    }
  };

  const deleteDocument = (docId: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      const updatedDocs = documents.filter(d => d.id !== docId);
      setDocuments(updatedDocs);
      localStorage.setItem(`documents_${leadId}`, JSON.stringify(updatedDocs));
    }
  };
  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Document Checklist</h2>
          <p className="text-gray-600">{leadName} - {lead.loanType}</p>
          
          {/* Assignment Information */}
          <div className="mt-2 flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-green-600" />
              <span className="text-green-700 font-medium">
                Assigned by: {getAssignerInfo(lead)}
              </span>
            </div>
            
            {lead.assignedBank && (
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-purple-600" />
                <span className="text-purple-700 font-medium">
                  Bank: {lead.assignedBank}
                  {lead.assignedBankBranch && ` - ${lead.assignedBankBranch}`}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Summary */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Document Completion Status</h3>
          <div className="text-right flex items-center space-x-4">
            <div>
              <div className="text-2xl font-bold text-gray-800">{completedDocs}/{totalDocs}</div>
              <div className="text-sm text-gray-600">Documents Completed</div>
            </div>
            {isDocumentComplete && (
              <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
                <Award className="w-5 h-5" />
                <span className="font-bold">DOCUMENT COMPLETE</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${
              completionPercentage === 100 ? 'bg-green-600 animate-pulse' : 
              completionPercentage >= 50 ? 'bg-yellow-600' : 'bg-red-600'
            }`}
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
        
        <div className="flex items-center justify-between text-sm mb-4">
          <span className={`font-medium ${isDocumentComplete ? 'text-green-600' : 'text-gray-600'}`}>
            {completionPercentage}% Complete {isDocumentComplete && '🎉'}
          </span>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              <span className="text-gray-600">Submitted ({documents.filter(d => d.submitted === 'Yes').length})</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-600 rounded-full"></div>
              <span className="text-gray-600">Pending ({documents.filter(d => d.submitted === 'No').length})</span>
            </div>
          </div>
        </div>
        
        {isDocumentComplete && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-green-800">
              <Award className="w-5 h-5" />
              <span className="font-bold">All documents have been submitted successfully!</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              This lead is ready for final processing and bank submission.
            </p>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'All' | 'Yes' | 'No')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
          >
            <option value="All">All Status</option>
            <option value="Yes">✅ Submitted</option>
            <option value="No">❌ Pending</option>
          </select>
          
          <select
            value={filterLoanType}
            onChange={(e) => setFilterLoanType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
          >
            <option value="All">All Loan Types</option>
            {loanTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          
          <button
            onClick={addCustomDocument}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <FileText className="w-4 h-4" />
            <span>Add Custom</span>
          </button>
        </div>
      </div>

      {/* Document Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Document Checklist</h3>
            <button
              onClick={handleSaveAll}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save All Changes</span>
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  🔢 S.No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  🏦 Loan Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  📋 Document Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ✅ Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  🎨 Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  📝 Remarks
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDocuments.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {doc.sNo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLoanTypeColor(doc.loanType)}`}>
                      {doc.loanType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span>{doc.documentName}</span>
                      <button
                        onClick={() => editDocument(doc.id)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Edit Document Name"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={doc.submitted}
                      onChange={(e) => handleStatusChange(doc.id, e.target.value as 'Yes' | 'No')}
                      className={`px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-red-500 ${
                        doc.submitted === 'Yes' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                      }`}
                    >
                      <option value="No">❌ No</option>
                      <option value="Yes">✅ Yes</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      doc.statusColor === 'green' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {doc.statusColor === 'green' ? '🟢 Submitted' : '🔴 Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={doc.remarks || ''}
                        onChange={(e) => handleRemarksChange(doc.id, e.target.value)}
                        placeholder="Add remarks..."
                        className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-red-500"
                      />
                      <button
                        onClick={() => deleteDocument(doc.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete Document"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredDocuments.length === 0 && (
          <div className="p-6 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No documents found matching your filters</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 bg-blue-50 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">Quick Actions</h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              const updatedDocs = documents.map(doc => ({ ...doc, submitted: 'Yes' as const, statusColor: 'green' as const }));
              setDocuments(updatedDocs);
              localStorage.setItem(`documents_${leadId}`, JSON.stringify(updatedDocs));
            }}
            className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition-colors"
          >
            ✅ Mark All as Submitted
          </button>
          <button
            onClick={() => {
              const updatedDocs = documents.map(doc => ({ ...doc, submitted: 'No' as const, statusColor: 'red' as const }));
              setDocuments(updatedDocs);
              localStorage.setItem(`documents_${leadId}`, JSON.stringify(updatedDocs));
            }}
            className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 transition-colors"
          >
            ❌ Mark All as Pending
          </button>
          <button
            onClick={() => {
              const pendingDocs = documents.filter(doc => doc.submitted === 'No');
              if (pendingDocs.length > 0) {
                alert(`Pending Documents:\n${pendingDocs.map(doc => `• ${doc.documentName}`).join('\n')}`);
              } else {
                alert('🎉 All documents are submitted!');
              }
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
          >
            📋 Show Pending List
          </button>
          <button
            onClick={addCustomDocument}
            className="bg-purple-600 text-white px-4 py-2 rounded text-sm hover:bg-purple-700 transition-colors"
          >
            ➕ Add Custom Document
          </button>
          {isDocumentComplete && (
            <button
              onClick={() => {
                alert('🎉 Document Complete Status: All documents have been successfully submitted!\n\nThis lead is now ready for:\n• Final verification\n• Bank submission\n• Loan processing');
              }}
              className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition-colors animate-pulse"
            >
              🏆 Document Complete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}