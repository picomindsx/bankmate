"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  User,
  Building,
  Phone,
  Mail,
  CreditCard,
  Briefcase,
  X,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  Building2,
  Users,
  DollarSign,
  Calendar,
  FileCheck,
  Upload,
  Eye,
} from "lucide-react";
import { Lead } from "@/types/common";

interface FileStatusTrackerProps {
  lead: Lead;
  onClose: () => void;
  onUpdate: (leadId: string, updates: Partial<Lead>) => void;
}

interface DocumentRequirement {
  id: string;
  name: string;
  loanType: string;
  category: "identity" | "income" | "property" | "bank" | "other";
  required: boolean;
}

interface PipelineStage {
  id: string;
  name: string;
  description: string;
  status: "pending" | "in_progress" | "completed" | "rejected";
  icon: any;
  color: string;
}

const DOCUMENT_REQUIREMENTS: DocumentRequirement[] = [
  // Home Loan Documents
  {
    id: "home_applicant_kyc",
    name: "Applicant KYC",
    loanType: "Home Loan",
    category: "identity",
    required: true,
  },
  {
    id: "home_co_applicant_kyc",
    name: "Co-Applicant KYC",
    loanType: "Home Loan",
    category: "identity",
    required: false,
  },
  {
    id: "home_income_proof",
    name: "Income Proof (Salary Slip)",
    loanType: "Home Loan",
    category: "income",
    required: true,
  },
  {
    id: "home_legal_docs",
    name: "Legal Documents (Title Deed etc.)",
    loanType: "Home Loan",
    category: "property",
    required: true,
  },

  // Personal Loan Documents
  {
    id: "personal_applicant_kyc",
    name: "Applicant KYC",
    loanType: "Personal Loan",
    category: "identity",
    required: true,
  },
  {
    id: "personal_income_proof",
    name: "Income Proof (Bank Statement)",
    loanType: "Personal Loan",
    category: "income",
    required: true,
  },

  // Vehicle Loan Documents
  {
    id: "vehicle_applicant_kyc",
    name: "Applicant KYC",
    loanType: "Vehicle Loan",
    category: "identity",
    required: true,
  },
  {
    id: "vehicle_rc_book",
    name: "RC Book Copy",
    loanType: "Vehicle Loan",
    category: "other",
    required: true,
  },
  {
    id: "vehicle_income_proof",
    name: "Income Proof",
    loanType: "Vehicle Loan",
    category: "income",
    required: true,
  },

  // Business Loan Documents
  {
    id: "business_applicant_kyc",
    name: "Applicant KYC",
    loanType: "Business Loan",
    category: "identity",
    required: true,
  },
  {
    id: "business_registration",
    name: "Business Registration Document",
    loanType: "Business Loan",
    category: "other",
    required: true,
  },
  {
    id: "business_financial",
    name: "Financial Statements",
    loanType: "Business Loan",
    category: "income",
    required: true,
  },

  // NRI Loan Documents
  {
    id: "nri_passport",
    name: "Passport Copy",
    loanType: "NRI Loan",
    category: "identity",
    required: true,
  },
  {
    id: "nri_visa",
    name: "Visa Copy",
    loanType: "NRI Loan",
    category: "identity",
    required: true,
  },
  {
    id: "nri_income_proof",
    name: "Overseas Income Proof",
    loanType: "NRI Loan",
    category: "income",
    required: true,
  },

  // Gold Loan Documents
  {
    id: "gold_applicant_kyc",
    name: "Applicant KYC",
    loanType: "Gold Loan",
    category: "identity",
    required: true,
  },
  {
    id: "gold_valuation",
    name: "Gold Valuation Report",
    loanType: "Gold Loan",
    category: "other",
    required: true,
  },

  // Education Loan Documents
  {
    id: "education_applicant_kyc",
    name: "Applicant KYC",
    loanType: "Education Loan",
    category: "identity",
    required: true,
  },
  {
    id: "education_admission",
    name: "Admission Letter",
    loanType: "Education Loan",
    category: "other",
    required: true,
  },
  {
    id: "education_fee_structure",
    name: "Fee Structure",
    loanType: "Education Loan",
    category: "other",
    required: true,
  },

  // Mortgage Loan Documents
  {
    id: "mortgage_applicant_kyc",
    name: "Applicant KYC",
    loanType: "Mortgage Loan",
    category: "identity",
    required: true,
  },
  {
    id: "mortgage_property_docs",
    name: "Property Documents",
    loanType: "Mortgage Loan",
    category: "property",
    required: true,
  },
  {
    id: "mortgage_valuation",
    name: "Property Valuation",
    loanType: "Mortgage Loan",
    category: "property",
    required: true,
  },
];

export function FileStatusTracker({
  lead,
  onClose,
  onUpdate,
}: FileStatusTrackerProps) {
  const [activeTab, setActiveTab] = useState("pipeline");
  const [documentStatuses, setDocumentStatuses] = useState<
    Record<string, "Yes" | "No">
  >(lead.documentStatuses || {});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loanTypeFilter, setLoanTypeFilter] = useState("all");
  const [remarks, setRemarks] = useState<Record<string, string>>(
    lead.documentRemarks || {}
  );

  const [pipelineData, setPipelineData] = useState({
    fileStatus: lead.fileStatus || "pending",
    bankStaffName: lead.bankStaffName || "",
    bankStaffContact: lead.bankStaffContact || "",
    bankBranch: lead.bankBranch || "",
    legalReportStatus: lead.legalReportStatus || "pending",
    valuationStatus: lead.valuationStatus || "pending",
    fileSubmissionStatus: lead.fileSubmissionStatus || "not_submitted",
    finalSubmissionStatus: lead.finalSubmissionStatus || "pending",
    sanctionStatus: lead.sanctionStatus || "in_progress",
    disbursementStatus: lead.disbursementStatus || "pending",
    rejectionReason: lead.rejectionReason || "",
    sanctionAmount: lead.sanctionAmount || "",
    sanctionDate: lead.sanctionDate || "",
    disbursementDate: lead.disbursementDate || "",
  });

  const pipelineStages: PipelineStage[] = [
    {
      id: "file_status",
      name: "File Status",
      description: "Overall file processing status",
      status: pipelineData.fileStatus as any,
      icon: FileText,
      color: "blue",
    },
    {
      id: "bank_assignment",
      name: "Bank Assignment",
      description: "Bank and staff assignment",
      status:
        lead.selectedBank && pipelineData.bankStaffName
          ? "completed"
          : "pending",
      icon: Building2,
      color: "indigo",
    },
    {
      id: "documents",
      name: "Documents Collection",
      description: "KYC, Income, and Legal documents",
      status: calculateDocumentStatus(),
      icon: FileCheck,
      color: "green",
    },
    {
      id: "legal_report",
      name: "Legal Report",
      description: "Legal verification and report status",
      status: pipelineData.legalReportStatus as any,
      icon: Eye,
      color: "purple",
    },
    {
      id: "valuation",
      name: "Property Valuation",
      description: "Property valuation completion",
      status: pipelineData.valuationStatus as any,
      icon: DollarSign,
      color: "orange",
    },
    {
      id: "file_submission",
      name: "File Submission",
      description: "Initial file submission to bank",
      status:
        pipelineData.fileSubmissionStatus === "submitted"
          ? "completed"
          : "pending",
      icon: Upload,
      color: "teal",
    },
    {
      id: "final_submission",
      name: "Final Submission",
      description: "Final documentation submission",
      status:
        pipelineData.finalSubmissionStatus === "submitted"
          ? "completed"
          : "pending",
      icon: FileText,
      color: "cyan",
    },
    {
      id: "sanction",
      name: "Sanction Status",
      description: "Bank approval/rejection decision",
      status: pipelineData.sanctionStatus as any,
      icon: CheckCircle,
      color: "emerald",
    },
    {
      id: "disbursement",
      name: "Disbursement",
      description: "Loan amount disbursement",
      status: pipelineData.disbursementStatus as any,
      icon: DollarSign,
      color: "yellow",
    },
    {
      id: "completion",
      name: "File Completion",
      description: "Overall file completion status",
      status: calculateOverallStatus(),
      icon: CheckCircle,
      color: "green",
    },
  ];

  function calculateDocumentStatus():
    | "pending"
    | "in_progress"
    | "completed"
    | "rejected" {
    const relevantDocs = DOCUMENT_REQUIREMENTS.filter(
      (doc) => doc.loanType === lead.leadType
    );
    const requiredDocs = relevantDocs.filter((doc) => doc.required);
    const submittedDocs = requiredDocs.filter(
      (doc) => documentStatuses[doc.id] === "Yes"
    );

    if (submittedDocs.length === 0) return "pending";
    if (submittedDocs.length === requiredDocs.length) return "completed";
    return "in_progress";
  }

  function calculateOverallStatus():
    | "pending"
    | "in_progress"
    | "completed"
    | "rejected" {
    if (pipelineData.sanctionStatus === "declined") return "rejected";
    if (pipelineData.disbursementStatus === "disbursed") return "completed";
    if (pipelineData.sanctionStatus === "approved") return "in_progress";
    return "pending";
  }

  const relevantDocuments = DOCUMENT_REQUIREMENTS.filter(
    (doc) => doc.loanType === lead.leadType || doc.loanType === "All Loans"
  );

  const filteredDocuments = relevantDocuments.filter((doc) => {
    const matchesSearch = doc.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "submitted" && documentStatuses[doc.id] === "Yes") ||
      (statusFilter === "missing" && documentStatuses[doc.id] !== "Yes");
    const matchesLoanType =
      loanTypeFilter === "all" || doc.loanType === loanTypeFilter;

    return matchesSearch && matchesStatus && matchesLoanType;
  });

  const updateDocumentStatus = (docId: string, status: "Yes" | "No") => {
    const newStatuses = { ...documentStatuses, [docId]: status };
    setDocumentStatuses(newStatuses);

    onUpdate(lead.id, {
      documentStatuses: newStatuses,
      documentRemarks: remarks,
      updatedAt: new Date().toISOString(),
    });
  };

  const updateRemark = (docId: string, remark: string) => {
    const newRemarks = { ...remarks, [docId]: remark };
    setRemarks(newRemarks);

    onUpdate(lead.id, {
      documentStatuses: documentStatuses,
      documentRemarks: newRemarks,
      updatedAt: new Date().toISOString(),
    });
  };

  const updatePipelineData = (field: string, value: string) => {
    const newPipelineData = { ...pipelineData, [field]: value };
    setPipelineData(newPipelineData);

    onUpdate(lead.id, {
      ...newPipelineData,
      updatedAt: new Date().toISOString(),
    });
  };

  const getStatusColor = (status: "Yes" | "No" | undefined) => {
    switch (status) {
      case "Yes":
        return "bg-green-500";
      case "No":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  const getStatusBadgeColor = (status: "Yes" | "No" | undefined) => {
    switch (status) {
      case "Yes":
        return "bg-green-500/20 text-green-700 border-green-300";
      case "No":
        return "bg-red-500/20 text-red-700 border-red-300";
      default:
        return "bg-gray-500/20 text-gray-700 border-gray-300";
    }
  };

  const getPipelineStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-700 border-green-300";
      case "in_progress":
        return "bg-blue-500/20 text-blue-700 border-blue-300";
      case "rejected":
      case "declined":
        return "bg-red-500/20 text-red-700 border-red-300";
      default:
        return "bg-yellow-500/20 text-yellow-700 border-yellow-300";
    }
  };

  const calculateProgress = () => {
    const requiredDocs = relevantDocuments.filter((doc) => doc.required);
    const submittedDocs = requiredDocs.filter(
      (doc) => documentStatuses[doc.id] === "Yes"
    );
    return requiredDocs.length > 0
      ? (submittedDocs.length / requiredDocs.length) * 100
      : 0;
  };

  const calculatePipelineProgress = () => {
    const completedStages = pipelineStages.filter(
      (stage) => stage.status === "completed"
    ).length;
    return (completedStages / pipelineStages.length) * 100;
  };

  const getSubmittedCount = () =>
    relevantDocuments.filter((doc) => documentStatuses[doc.id] === "Yes")
      .length;
  const getMissingCount = () =>
    relevantDocuments.filter((doc) => documentStatuses[doc.id] !== "Yes")
      .length;
  const getRequiredCount = () =>
    relevantDocuments.filter((doc) => doc.required).length;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-7xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">
              Detailed File Pipeline Tracker
            </h2>
            <p className="text-muted-foreground">
              {lead.clientName} - {lead.leadType} - {lead.selectedBank}
            </p>
          </div>
          <Button onClick={onClose} variant="ghost" size="sm">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Overall Pipeline Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Pipeline Completion</span>
                  <span>{Math.round(calculatePipelineProgress())}%</span>
                </div>
                <Progress value={calculatePipelineProgress()} className="h-3" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {
                      pipelineStages.filter((s) => s.status === "completed")
                        .length
                    }
                  </div>
                  <div className="text-sm text-green-700">Completed</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {
                      pipelineStages.filter((s) => s.status === "in_progress")
                        .length
                    }
                  </div>
                  <div className="text-sm text-blue-700">In Progress</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {
                      pipelineStages.filter((s) => s.status === "pending")
                        .length
                    }
                  </div>
                  <div className="text-sm text-yellow-700">Pending</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {
                      pipelineStages.filter((s) => s.status === "rejected")
                        .length
                    }
                  </div>
                  <div className="text-sm text-red-700">Rejected</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pipeline">Pipeline Stages</TabsTrigger>
            <TabsTrigger value="documents">Document Status</TabsTrigger>
            <TabsTrigger value="summary">Lead Summary</TabsTrigger>
          </TabsList>

          <TabsContent value="pipeline" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>File Pipeline Stages</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Track the complete journey of the loan file through all
                  processing stages
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {pipelineStages.map((stage, index) => {
                    const Icon = stage.icon;
                    return (
                      <div
                        key={stage.id}
                        className="flex items-start gap-4 p-4 border rounded-lg"
                      >
                        <div className="flex flex-col items-center">
                          <div
                            className={`p-2 rounded-full ${
                              stage.status === "completed"
                                ? "bg-green-100 text-green-600"
                                : stage.status === "in_progress"
                                ? "bg-blue-100 text-blue-600"
                                : stage.status === "rejected"
                                ? "bg-red-100 text-red-600"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          {index < pipelineStages.length - 1 && (
                            <div
                              className={`w-0.5 h-8 mt-2 ${
                                stage.status === "completed"
                                  ? "bg-green-300"
                                  : "bg-gray-300"
                              }`}
                            />
                          )}
                        </div>

                        <div className="flex-1 space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold">{stage.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {stage.description}
                              </p>
                            </div>
                            <Badge
                              className={getPipelineStatusColor(stage.status)}
                            >
                              {stage.status === "completed"
                                ? "✅ Completed"
                                : stage.status === "in_progress"
                                ? "🔄 In Progress"
                                : stage.status === "rejected"
                                ? "❌ Rejected"
                                : "⏳ Pending"}
                            </Badge>
                          </div>

                          {/* Stage-specific controls */}
                          {stage.id === "file_status" && (
                            <Select
                              value={pipelineData.fileStatus}
                              onValueChange={(value) =>
                                updatePipelineData("fileStatus", value)
                              }
                            >
                              <SelectTrigger className="w-48">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="in_progress">
                                  In Progress
                                </SelectItem>
                                <SelectItem value="completed">
                                  Completed
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          )}

                          {stage.id === "bank_assignment" && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div>
                                <Label className="text-xs">
                                  Bank Staff Name
                                </Label>
                                <Input
                                  value={pipelineData.bankStaffName}
                                  onChange={(e) =>
                                    updatePipelineData(
                                      "bankStaffName",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Enter staff name"
                                  className="text-sm"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">
                                  Contact Number
                                </Label>
                                <Input
                                  value={pipelineData.bankStaffContact}
                                  onChange={(e) =>
                                    updatePipelineData(
                                      "bankStaffContact",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Enter contact"
                                  className="text-sm"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Bank Branch</Label>
                                <Input
                                  value={pipelineData.bankBranch}
                                  onChange={(e) =>
                                    updatePipelineData(
                                      "bankBranch",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Enter branch"
                                  className="text-sm"
                                />
                              </div>
                            </div>
                          )}

                          {stage.id === "legal_report" && (
                            <Select
                              value={pipelineData.legalReportStatus}
                              onValueChange={(value) =>
                                updatePipelineData("legalReportStatus", value)
                              }
                            >
                              <SelectTrigger className="w-48">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="verified">
                                  Verified
                                </SelectItem>
                                <SelectItem value="completed">
                                  Completed
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          )}

                          {stage.id === "valuation" && (
                            <Select
                              value={pipelineData.valuationStatus}
                              onValueChange={(value) =>
                                updatePipelineData("valuationStatus", value)
                              }
                            >
                              <SelectTrigger className="w-48">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="done">Done</SelectItem>
                              </SelectContent>
                            </Select>
                          )}

                          {stage.id === "file_submission" && (
                            <Select
                              value={pipelineData.fileSubmissionStatus}
                              onValueChange={(value) =>
                                updatePipelineData(
                                  "fileSubmissionStatus",
                                  value
                                )
                              }
                            >
                              <SelectTrigger className="w-48">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="not_submitted">
                                  Not Submitted
                                </SelectItem>
                                <SelectItem value="submitted">
                                  Submitted
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          )}

                          {stage.id === "final_submission" && (
                            <Select
                              value={pipelineData.finalSubmissionStatus}
                              onValueChange={(value) =>
                                updatePipelineData(
                                  "finalSubmissionStatus",
                                  value
                                )
                              }
                            >
                              <SelectTrigger className="w-48">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="submitted">
                                  Submitted
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          )}

                          {stage.id === "sanction" && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div>
                                <Label className="text-xs">
                                  Sanction Status
                                </Label>
                                <Select
                                  value={pipelineData.sanctionStatus}
                                  onValueChange={(value) =>
                                    updatePipelineData("sanctionStatus", value)
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="in_progress">
                                      In Progress
                                    </SelectItem>
                                    <SelectItem value="approved">
                                      Approved
                                    </SelectItem>
                                    <SelectItem value="declined">
                                      Declined
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="text-xs">
                                  Sanction Amount
                                </Label>
                                <Input
                                  value={pipelineData.sanctionAmount}
                                  onChange={(e) =>
                                    updatePipelineData(
                                      "sanctionAmount",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Enter amount"
                                  className="text-sm"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Sanction Date</Label>
                                <Input
                                  type="date"
                                  value={pipelineData.sanctionDate}
                                  onChange={(e) =>
                                    updatePipelineData(
                                      "sanctionDate",
                                      e.target.value
                                    )
                                  }
                                  className="text-sm"
                                />
                              </div>
                            </div>
                          )}

                          {stage.id === "disbursement" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs">
                                  Disbursement Status
                                </Label>
                                <Select
                                  value={pipelineData.disbursementStatus}
                                  onValueChange={(value) =>
                                    updatePipelineData(
                                      "disbursementStatus",
                                      value
                                    )
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">
                                      Pending
                                    </SelectItem>
                                    <SelectItem value="disbursed">
                                      Disbursed
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="text-xs">
                                  Disbursement Date
                                </Label>
                                <Input
                                  type="date"
                                  value={pipelineData.disbursementDate}
                                  onChange={(e) =>
                                    updatePipelineData(
                                      "disbursementDate",
                                      e.target.value
                                    )
                                  }
                                  className="text-sm"
                                />
                              </div>
                            </div>
                          )}

                          {pipelineData.sanctionStatus === "declined" && (
                            <div>
                              <Label className="text-xs">
                                Rejection Reason
                              </Label>
                              <Textarea
                                value={pipelineData.rejectionReason}
                                onChange={(e) =>
                                  updatePipelineData(
                                    "rejectionReason",
                                    e.target.value
                                  )
                                }
                                placeholder="Enter rejection reason..."
                                className="text-sm"
                                rows={2}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            {/* Progress Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Document Completion Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Document Progress</span>
                      <span>{Math.round(calculateProgress())}%</span>
                    </div>
                    <Progress value={calculateProgress()} className="h-3" />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {getSubmittedCount()}
                      </div>
                      <div className="text-sm text-green-700">Submitted</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {getMissingCount()}
                      </div>
                      <div className="text-sm text-red-700">Missing</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {getRequiredCount()}
                      </div>
                      <div className="text-sm text-blue-700">Required</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {relevantDocuments.length}
                      </div>
                      <div className="text-sm text-purple-700">Total</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="search">Search Documents</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="search"
                        placeholder="Search by document name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="status-filter">Filter by Status</Label>
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="submitted">
                          Submitted (Yes)
                        </SelectItem>
                        <SelectItem value="missing">Missing (No)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="loan-filter">Filter by Loan Type</Label>
                    <Select
                      value={loanTypeFilter}
                      onValueChange={setLoanTypeFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Loan Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Loan Types</SelectItem>
                        {Array.from(
                          new Set(
                            DOCUMENT_REQUIREMENTS.map((doc) => doc.loanType)
                          )
                        ).map((loanType) => (
                          <SelectItem key={loanType} value={loanType}>
                            {loanType}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm("");
                        setStatusFilter("all");
                        setLoanTypeFilter("all");
                      }}
                      className="w-full"
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Document Status Table */}
            <Card>
              <CardHeader>
                <CardTitle>Document Status Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-semibold">S.No</th>
                        <th className="text-left p-3 font-semibold">
                          Loan Type
                        </th>
                        <th className="text-left p-3 font-semibold">
                          Document Name
                        </th>
                        <th className="text-left p-3 font-semibold">
                          Required
                        </th>
                        <th className="text-left p-3 font-semibold">
                          Submitted
                        </th>
                        <th className="text-left p-3 font-semibold">Status</th>
                        <th className="text-left p-3 font-semibold">Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDocuments.map((doc, index) => {
                        const status = documentStatuses[doc.id];
                        return (
                          <tr
                            key={doc.id}
                            className="border-b hover:bg-gray-50"
                          >
                            <td className="p-3">{index + 1}</td>
                            <td className="p-3">
                              <Badge variant="outline" className="text-xs">
                                {doc.loanType}
                              </Badge>
                            </td>
                            <td className="p-3 font-medium">{doc.name}</td>
                            <td className="p-3">
                              {doc.required ? (
                                <Badge className="bg-orange-500/20 text-orange-700 border-orange-300">
                                  Required
                                </Badge>
                              ) : (
                                <Badge variant="outline">Optional</Badge>
                              )}
                            </td>
                            <td className="p-3">
                              <Select
                                value={status || ""}
                                onValueChange={(value) =>
                                  updateDocumentStatus(
                                    doc.id,
                                    value as "Yes" | "No"
                                  )
                                }
                              >
                                <SelectTrigger className="w-24">
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Yes">Yes</SelectItem>
                                  <SelectItem value="No">No</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-3 h-3 rounded-full ${getStatusColor(
                                    status
                                  )}`}
                                ></div>
                                <Badge className={getStatusBadgeColor(status)}>
                                  {status === "Yes"
                                    ? "✅ Submitted"
                                    : status === "No"
                                    ? "❌ Missing"
                                    : "⏳ Pending"}
                                </Badge>
                              </div>
                            </td>
                            <td className="p-3">
                              <Input
                                placeholder="Add remarks..."
                                value={remarks[doc.id] || ""}
                                onChange={(e) =>
                                  updateRemark(doc.id, e.target.value)
                                }
                                className="w-40 text-xs"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {filteredDocuments.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No documents found matching your filters
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summary">
            {/* Lead Information Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Lead Information Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">Client:</span>
                    <span>{lead.clientName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Phone:</span>
                    <span>{lead.contactNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-purple-500" />
                    <span className="font-medium">Email:</span>
                    <span>{lead.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-orange-500" />
                    <span className="font-medium">Loan Type:</span>
                    <span>{lead.leadType}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-indigo-500" />
                    <span className="font-medium">Bank:</span>
                    <span>{lead.selectedBank}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium">Staff:</span>
                    <span>{lead.assignedStaff}</span>
                  </div>
                  {pipelineData.sanctionAmount && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      <span className="font-medium">Sanction Amount:</span>
                      <span>₹{pipelineData.sanctionAmount}</span>
                    </div>
                  )}
                  {pipelineData.sanctionDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">Sanction Date:</span>
                      <span>
                        {new Date(
                          pipelineData.sanctionDate
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {pipelineData.disbursementDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-green-500" />
                      <span className="font-medium">Disbursement Date:</span>
                      <span>
                        {new Date(
                          pipelineData.disbursementDate
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {(pipelineData.bankStaffName ||
              pipelineData.bankStaffContact ||
              pipelineData.bankBranch) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Bank Staff Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {pipelineData.bankStaffName && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">Staff Name:</span>
                        <span>{pipelineData.bankStaffName}</span>
                      </div>
                    )}
                    {pipelineData.bankStaffContact && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-green-500" />
                        <span className="font-medium">Contact:</span>
                        <span>{pipelineData.bankStaffContact}</span>
                      </div>
                    )}
                    {pipelineData.bankBranch && (
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-purple-500" />
                        <span className="font-medium">Branch:</span>
                        <span>{pipelineData.bankBranch}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {pipelineData.rejectionReason && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <XCircle className="h-5 w-5" />
                    Rejection Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-red-700">{pipelineData.rejectionReason}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
