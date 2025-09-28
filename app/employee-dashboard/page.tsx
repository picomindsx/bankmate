"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { FileStatusTracker } from "@/components/file-status-tracker";
import { BackButton } from "@/components/ui/back-button";
import {
  Bell,
  TrendingUp,
  Users,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Building,
  User,
  Phone,
  Mail,
  Briefcase,
  CreditCard,
  MapPin,
  Eye,
  Plus,
  X,
  Edit,
} from "lucide-react";
import Image from "next/image";
import { getBranches } from "@/services/branch-service";
import {
  getDocumentCompletionStatus,
  updateDocumentStatus,
} from "@/services/document-service";
import {
  addLead,
  addNewLead,
  assignLeadToStaff,
  getAssignedLeads,
  getStaffAssignedLeads,
  updateLead,
} from "@/services/lead-service";
import { getStaff } from "@/services/staff-service";
import {
  IGender,
  IIncomeCategory,
  IUrgencyLevel,
  Lead,
  LeadForm,
} from "@/types/common";
import {
  emptyLeadForm,
  GENDER_OPTIONS,
  INCOME_CATEGORY,
  LOAN_TYPES,
} from "@/lib/consts";
import LeadDetailView from "@/components/lead-detail-view";

interface CustomOption {
  id: string;
  value: string;
  type: "gender" | "loanType" | "incomeCategory";
}

const EmployeeDashboard = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [myLeads, setMyLeads] = useState<LeadForm[]>([]);
  const [selectedLead, setSelectedLead] = useState<LeadForm | null>(null);
  const [showLeadDetail, setShowLeadDetail] = useState(false);
  const [showFileTracker, setShowFileTracker] = useState(false);
  const [showAddLead, setShowAddLead] = useState(false);
  const [branches, setBranches] = useState<any[]>([]);

  const [dateFilter, setDateFilter] = useState<
    "all" | "today" | "week" | "month"
  >("all");
  const [monthFilter, setMonthFilter] = useState<string>("");

  const [showLeadDetails, setShowLeadDetails] = useState(false);
  const [showDocumentStatus, setShowDocumentStatus] = useState(false);
  const [showPipelineStatus, setShowPipelineStatus] = useState(false);

  // State for assignment dialog
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");
  const [selectedBank, setSelectedBank] = useState<string>("");

  // State for document management dialog
  const [showDocumentDialog, setShowDocumentDialog] = useState(false);

  const [newLead, setNewLead] = useState<Partial<LeadForm>>(emptyLeadForm);

  const [customGender, setCustomGender] = useState("");
  const [customLoanType, setCustomLoanType] = useState("");
  const [customIncomeCategory, setCustomIncomeCategory] = useState("");
  const [showCustomGender, setShowCustomGender] = useState(false);
  const [showCustomLoanType, setShowCustomLoanType] = useState(false);
  const [showCustomIncomeCategory, setShowCustomIncomeCategory] =
    useState(false);

  const loanTypeOptions = [
    "Home Loan",
    "Personal Loan",
    "Business Loan",
    "Car Loan",
    "Education Loan",
  ];
  const incomeCategoryOptions = [
    "Salaried",
    "Self-Employed",
    "Business Owner",
    "NRI",
  ];

  const myCreatedLeads = myLeads.filter(
    (lead) => lead.createdBy === "Current Staff Member"
  );
  // const pendingDocumentsCount = myCreatedLeads.filter((lead) =>
  //   Object.values(lead.documents || {}).some((status) => !status)
  // ).length;
  const completedLeadsCount = myCreatedLeads.filter(
    (lead) => lead.applicationStatus === "sanctioned"
  ).length;
  const notificationsCount = myCreatedLeads.filter(
    (lead) => lead.applicationStatus === "login"
  ).length;

  const getFilteredLeads = () => {
    let filtered = myCreatedLeads;

    if (dateFilter === "today") {
      const today = new Date().toDateString();
      filtered = filtered.filter(
        (lead) => new Date(lead.createdAt!).toDateString() === today
      );
    } else if (dateFilter === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(
        (lead) => new Date(lead.createdAt!) >= weekAgo
      );
    } else if (dateFilter === "month") {
      if (monthFilter) {
        filtered = filtered.filter((lead) => {
          const leadDate = new Date(lead.createdAt!);
          return leadDate.getMonth() === Number.parseInt(monthFilter) - 1;
        });
      }
    }

    return filtered;
  };

  const handleAddLead = () => {
    const leadId = Date.now().toString();
    const lead: LeadForm = {
      ...(newLead as LeadForm),
      createdAt: new Date().toISOString(),
      createdBy: user!.id,
      branchId: user!.branchId,
      // documents: {
      //   "PAN Card": false,
      //   "Aadhar Card": false,
      //   "Income Proof": false,
      //   "Bank Statements": false,
      // },
    };

    addNewLead(lead);

    setMyLeads((prev) => [...prev, lead]);
    setNewLead({
      ...emptyLeadForm,
      createdBy: user?.id,
    });
    setShowAddLead(false);
  };

  const viewLeadDetails = (lead: LeadForm) => {
    setSelectedLead(lead);
    setShowLeadDetails(true);
  };

  const documentChecklistInitial = [
    {
      id: "pan_card",
      name: "PAN Card",
      required: true,
      checked: false,
      custom: false,
    },
    {
      id: "aadhar_card",
      name: "Aadhar Card",
      required: true,
      checked: false,
      custom: false,
    },
    {
      id: "salary_slips",
      name: "Salary Slips (3 months)",
      required: true,
      checked: false,
      custom: false,
    },
    {
      id: "bank_statements",
      name: "Bank Statements (6 months)",
      required: true,
      checked: false,
      custom: false,
    },
    {
      id: "form16",
      name: "Form 16",
      required: false,
      checked: false,
      custom: false,
    },
    {
      id: "property_documents",
      name: "Property Documents",
      required: true,
      checked: false,
      custom: false,
    },
  ];
  const [documentChecklist, setDocumentChecklist] = useState(
    documentChecklistInitial
  );
  const [customDocumentName, setCustomDocumentName] = useState("");
  const [showAddCustomDoc, setShowAddCustomDoc] = useState(false);

  const allBanks = [
    "State Bank of India (SBI)",
    "HDFC Bank",
    "ICICI Bank",
    "Canara Bank",
    "Punjab National Bank",
    "Bank of Baroda",
    "Axis Bank",
    "Kotak Mahindra Bank",
  ];

  const allIncomeCategories = [
    "salaried",
    "self_employed",
    "business_owner",
    "housewife",
    "retired",
    "student",
    "other",
  ];

  const handleDocumentCheck = (docId: string, checked: boolean) => {
    setDocumentChecklist((prev) =>
      prev.map((doc) => (doc.id === docId ? { ...doc, checked } : doc))
    );
  };

  const addCustomDocument = () => {
    if (customDocumentName.trim()) {
      const newDoc = {
        id: `custom_${Date.now()}`,
        name: customDocumentName.trim(),
        required: false,
        checked: false,
        custom: true,
      };
      setDocumentChecklist((prev) => [...prev, newDoc]);
      setCustomDocumentName("");
      setShowAddCustomDoc(false);
    }
  };

  const removeCustomDocument = (docId: string) => {
    setDocumentChecklist((prev) => prev.filter((doc) => doc.id !== docId));
  };

  const [newCustomOption, setNewCustomOption] = useState("");
  const [showCustomOptionDialog, setShowCustomOptionDialog] = useState(false);
  const [customOptionType, setCustomOptionType] = useState<
    "bank" | "loanType" | "incomeCategory" | null
  >(null);
  const [customBanks, setCustomBanks] = useState<string[]>([]);
  const [customLoanTypes, setCustomLoanTypes] = useState<string[]>([]);
  const [customIncomeCategories, setCustomIncomeCategories] = useState<
    string[]
  >([]);

  const refetchLeads = () => {
    if (!user) return false;
    getStaffAssignedLeads(user.id).then((leads) => {
      setMyLeads(leads);
    });
  };

  const handleAssignLead = (
    leadId: string,
    staffId: string,
    selectedBank?: string
  ) => {
    if (!user) return false;

    const success = assignLeadToStaff(leadId, staffId, user, selectedBank);
    if (success) {
      refetchLeads();

      return true;
    }
    return false;
  };

  // const handleReassignLead = async (leadId: string, newStaffId: string) => {
  //   const lead = myLeads.find((l) => l.id === leadId);
  //   if (lead && user) {
  //     const staffList = await getStaff();
  //     const updatedLead: Partial<Lead> = {
  //       ...lead,
  //       assignedStaff: staffList.find((s) => s.id === newStaffId)?.name || "",
  //       ownerManagerAssignment: `${user.name} (${user.role})`,
  //       updatedAt: new Date().toISOString(),
  //       editHistory: [
  //         ...(lead.editHistory || []),
  //         {
  //           editedBy: user.name!,
  //           editedAt: new Date().toISOString(),
  //           changes: ["Staff Reassignment"],
  //         },
  //       ],
  //     };

  //     const success = updateLead(leadId, updatedLead, user.name);
  //     if (success) {
  //       setMyLeads(getAssignedLeads(user.id));
  //     }
  //   }
  // };

  const handleDocumentManagement = (
    leadId: string,
    documentType: string,
    status: "pending" | "provided" | "verified"
  ) => {
    const success = updateDocumentStatus(
      leadId,
      documentType,
      status,
      user?.name
    );
    if (success && user) {
      refetchLeads();
    }
  };

  useEffect(() => {
    if (user) {
      refetchLeads();
      getBranches().then((branchList) => setBranches(branchList));
    }
  }, [user]);

  const handleLoanTypeChange = (loanType: string, checked: boolean) => {
    if (checked) {
      setNewLead({
        ...newLead,
        loanTypes: [...(newLead.loanTypes || []), loanType],
      });
    } else {
      setNewLead({
        ...newLead,
        loanTypes: (newLead.loanTypes || []).filter(
          (type) => type !== loanType
        ),
      });
    }
  };

  if (!user || user.type !== "employee") {
    return <div>Loading...</div>;
  }

  // These variables were redeclared and are now removed to avoid linting errors.
  // The counts are now derived from myCreatedLeads or myLeads as appropriate.
  // const notifications = myLeads.filter((lead) => !lead.documentsSubmittedAt).length // Leads without documents
  // const pendingDocuments = myLeads.reduce(
  //   (acc, lead) => acc + (lead.documents?.filter((doc) => doc.status === "pending").length || 0),
  //   0,
  // )
  // const completedLeads = myLeads.filter((lead) => lead.applicationStatus === "sanctioned").length

  const getStatusColor = (status: string) => {
    switch (status) {
      case "login":
        return "bg-blue-500";
      case "pending":
        return "bg-orange-500";
      case "sanctioned":
        return "bg-green-500";
      case "rejected":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getDocumentStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-500";
      case "provided":
        return "bg-orange-500";
      case "pending":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  // const getDocumentCompletionStatus = (lead: Lead) => {
  //   if (!lead || !lead.documents) return "No Documents";
  //   const documents = Array.isArray(lead.documents) ? lead.documents : [];
  //   if (documents.length === 0) return "No Documents";

  //   const totalDocs = documents.length;
  //   const verifiedDocs = documents.filter(
  //     (doc) => doc && doc.status === "verified"
  //   ).length;
  //   const providedDocs = documents.filter(
  //     (doc) => doc && doc.status === "provided"
  //   ).length;

  //   if (verifiedDocs === totalDocs) return "Complete";
  //   if (providedDocs + verifiedDocs === totalDocs) return "Under Review";
  //   return "Pending";
  // };

  const LeadDetailModal = ({ lead }: { lead: LeadForm }) => (
    <Dialog open={showLeadDetail} onOpenChange={setShowLeadDetail}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {lead.clientName} - Lead Details
          </DialogTitle>
          <DialogDescription>
            Assigned by: {lead.ownerManagerAssignment || "System"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lead Information */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">Name:</span>
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
                  <span className="font-medium">Product:</span>
                  <span>{lead.leadType}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">CIBIL Score:</span>
                  <span>{lead.cibilScore || "Not provided"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-red-500" />
                  <span className="font-medium">Address:</span>
                  <span className="text-sm">
                    {lead.currentAddress || lead.permanentAddress}
                  </span>
                </div>
                {lead.bankSelection && (
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-indigo-500" />
                    <span className="font-medium">Assigned Bank:</span>
                    <Badge className="bg-blue-500/20 text-blue-700 border-blue-300">
                      {lead.bankSelection}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Assignment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Assignment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">Assigned by:</span>
                  <Badge className="bg-green-500/20 text-green-700 border-green-300">
                    {lead.ownerManagerAssignment || "System"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Created:</span>
                  <span>{new Date(lead.createdAt!).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                  <span className="font-medium">Status:</span>
                  <Badge
                    className={`${getStatusColor(
                      lead.applicationStatus || ""
                    )} text-white border-0`}
                  >
                    {lead.applicationStatus}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Document Management Pipeline */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Document Management Pipeline
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <BackButton href="/dashboard" label="Back to Dashboard" />
            <Image
              src="/images/bankmate-logo.png"
              alt="Bankmate Solutions Logo"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <div>
              <h1 className="text-xl font-semibold">Bankmate Solutions</h1>
              <p className="text-black font-medium">
                Staff Dashboard - {user.designation || user.role}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              {notificationsCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                  {notificationsCount}
                </Badge>
              )}
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{user.name}</span>
              <Button variant="outline" size="sm" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome, {user.name}</h2>
              <p className="text-muted-foreground">
                Manage your assigned leads and document workflows. Leads will
                appear here only after being assigned by your manager. This
                includes leads you created, leads from social media, and leads
                assigned by management.
              </p>
            </div>
            <Button
              onClick={() => setShowAddLead(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Generate Lead
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                My Assigned Leads
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myLeads.length}</div>
              <p className="text-xs text-muted-foreground">
                Total assigned to you
              </p>
            </CardContent>
          </Card>
          {/* <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Documents
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingDocumentsCount}</div>
              <p className="text-xs text-muted-foreground">
                Documents to upload
              </p>
            </CardContent>
          </Card> */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Completed Leads
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedLeadsCount}</div>
              <p className="text-xs text-muted-foreground">
                Successfully sanctioned
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Notifications
              </CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{notificationsCount}</div>
              <p className="text-xs text-muted-foreground">
                Requires attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* My Asides (Assigned Leads) */}
        <Tabs defaultValue="assigned" className="w-full">
          <TabsList>
            <TabsTrigger value="assigned">
              My Asides (Assigned Leads)
            </TabsTrigger>
            {/* <TabsTrigger value="documents">Document Pipeline</TabsTrigger> */}
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="assigned" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  My Assigned Leads ({myLeads.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {myLeads.length > 0 ? (
                  <div className="space-y-4">
                    {myLeads.map((lead) => (
                      <Card
                        key={lead.id}
                        className="hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold">
                                  {lead.clientName}
                                </h4>
                                <Badge
                                  className={`${getStatusColor(
                                    lead.applicationStatus || ""
                                  )} text-white border-0`}
                                >
                                  {lead.applicationStatus}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {lead.leadType}
                                </Badge>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground mb-3">
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4" />
                                  {lead.contactNumber}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Mail className="h-4 w-4" />
                                  {lead.email}
                                </div>
                                {lead.bankSelection && (
                                  <div className="flex items-center gap-2">
                                    <Building className="h-4 w-4" />
                                    {lead.bankSelection}
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4" />
                                  {new Date(
                                    lead.createdAt || ""
                                  ).toLocaleDateString()}
                                </div>
                              </div>

                              {/* Assignment Information */}
                              {lead.ownerManagerAssignment && (
                                <div className="flex items-center gap-2 mb-2">
                                  <User className="h-4 w-4 text-blue-500" />
                                  <span className="text-sm">
                                    <span className="font-medium">
                                      Assigned by:
                                    </span>{" "}
                                    {lead.ownerManagerAssignment}
                                  </span>
                                </div>
                              )}

                              {/* Document Status */}
                              {/* <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-purple-500" />
                                <span className="text-sm">
                                  <span className="font-medium">
                                    Documents:
                                  </span>{" "}
                                  {getDocumentCompletionStatus(lead)}
                                </span>
                                {lead.documents &&
                                  Array.isArray(lead.documents) &&
                                  lead.documents.length > 0 && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {
                                        lead.documents.filter(
                                          (doc) =>
                                            doc && doc.status === "verified"
                                        ).length
                                      }
                                      /{lead.documents.length} verified
                                    </Badge>
                                  )}
                              </div> */}
                            </div>

                            <div className="flex flex-col gap-2">
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedLead(lead);
                                  setShowLeadDetail(true);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View Details
                              </Button>
                              {/* <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedLead(lead);
                                  setShowFileTracker(true);
                                }}
                              >
                                <FileText className="h-4 w-4 mr-1" />
                                File Status
                              </Button> */}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No leads assigned yet
                    </h3>
                    <p className="text-muted-foreground">
                      Your assigned leads will appear here once a manager
                      assigns them to you. This includes leads you created,
                      leads from social media, and leads assigned by management.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Document Pipeline Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {myLeads
                    .filter(
                      (lead) =>
                        lead &&
                        lead.documents &&
                        Array.isArray(lead.documents) &&
                        lead.documents.length > 0
                    )
                    .map((lead) => (
                      <Card
                        key={lead.id}
                        className="border-l-4 border-l-blue-500"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold">
                              {lead.clientName || "Unknown Client"}
                            </h4>
                            <Badge
                              className={`${
                                getDocumentCompletionStatus(lead) === "Complete"
                                  ? "bg-green-500/20 text-green-700 border-green-300"
                                  : "bg-orange-500/20 text-orange-700 border-orange-300"
                              }`}
                            >
                              {getDocumentCompletionStatus(lead)}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>
                                {lead.documents && Array.isArray(lead.documents)
                                  ? lead.documents.filter(
                                      (doc) => doc && doc.status === "verified"
                                    ).length
                                  : 0}{" "}
                                Verified
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-orange-500" />
                              <span>
                                {lead.documents && Array.isArray(lead.documents)
                                  ? lead.documents.filter(
                                      (doc) => doc && doc.status === "provided"
                                    ).length
                                  : 0}{" "}
                                Under Review
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 text-red-500" />
                              <span>
                                {lead.documents && Array.isArray(lead.documents)
                                  ? lead.documents.filter(
                                      (doc) => doc && doc.status === "pending"
                                    ).length
                                  : 0}{" "}
                                Pending
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                  {myLeads.filter(
                    (lead) =>
                      lead &&
                      lead.documents &&
                      Array.isArray(lead.documents) &&
                      lead.documents.length > 0
                  ).length === 0 && (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        No document workflows active
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent> */}

          <TabsContent value="completed" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Completed Leads
                </CardTitle>
              </CardHeader>
              <CardContent>
                {myLeads.filter(
                  (lead) => lead.applicationStatus === "sanctioned"
                ).length > 0 ? (
                  <div className="space-y-4">
                    {myLeads
                      .filter((lead) => lead.applicationStatus === "sanctioned")
                      .map((lead) => (
                        <Card
                          key={lead.id}
                          className="border-l-4 border-l-green-500"
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-semibold">
                                  {lead.clientName}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {lead.leadType}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Completed:{" "}
                                  {lead.statusUpdatedAt
                                    ? new Date(
                                        lead.statusUpdatedAt
                                      ).toLocaleDateString()
                                    : "Recently"}
                                </p>
                              </div>
                              <Badge className="bg-green-500 text-white">
                                Sanctioned
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      No completed leads yet
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Lead Generation Dialog */}
      <Dialog open={showAddLead} onOpenChange={setShowAddLead}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Generate New Lead
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Create a comprehensive lead profile. Document collection will be
              managed after assignment by owner/manager.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                1️⃣ Basic Personal Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="clientName"
                    className="text-sm font-medium text-gray-700"
                  >
                    Full Name *
                  </Label>
                  <Input
                    id="clientName"
                    value={newLead.clientName}
                    onChange={(e) =>
                      setNewLead({ ...newLead, clientName: e.target.value })
                    }
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="contactNumber"
                    className="text-sm font-medium text-gray-700"
                  >
                    Mobile Number *
                  </Label>
                  <Input
                    id="contactNumber"
                    value={newLead.contactNumber}
                    onChange={(e) =>
                      setNewLead({ ...newLead, contactNumber: e.target.value })
                    }
                    placeholder="Enter mobile number"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700"
                  >
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={newLead.email}
                    onChange={(e) =>
                      setNewLead({ ...newLead, email: e.target.value })
                    }
                    placeholder="Enter email address"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="dateOfBirth"
                    className="text-sm font-medium text-gray-700"
                  >
                    Date of Birth
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={newLead.dateOfBirth}
                    onChange={(e) =>
                      setNewLead({ ...newLead, dateOfBirth: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Gender
                  </Label>
                  <div className="flex gap-2">
                    <Select
                      value={newLead.gender}
                      onValueChange={(value) => {
                        setNewLead({ ...newLead, gender: value as IGender });
                      }}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        {GENDER_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label
                    htmlFor="permanentAddress"
                    className="text-sm font-medium text-gray-700"
                  >
                    Permanent Address
                  </Label>
                  <Textarea
                    id="permanentAddress"
                    value={newLead.permanentAddress}
                    onChange={(e) =>
                      setNewLead({
                        ...newLead,
                        permanentAddress: e.target.value,
                      })
                    }
                    placeholder="Enter permanent address"
                    rows={2}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label
                    htmlFor="currentAddress"
                    className="text-sm font-medium text-gray-700"
                  >
                    Current Address
                  </Label>
                  <Textarea
                    id="currentAddress"
                    value={newLead.currentAddress}
                    onChange={(e) =>
                      setNewLead({ ...newLead, currentAddress: e.target.value })
                    }
                    placeholder="Enter current address (if different from permanent)"
                    rows={2}
                  />
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                2️⃣ Loan Type (Select one or more) *
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {LOAN_TYPES.map((loanType) => (
                  <div key={loanType} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={loanType}
                      checked={(newLead.loanTypes || []).includes(loanType)}
                      onChange={(e) =>
                        handleLoanTypeChange(loanType, e.target.checked)
                      }
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor={loanType} className="text-sm">
                      {loanType}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                3️⃣ Income Category *
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {INCOME_CATEGORY.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id={category}
                      name="incomeCategory"
                      checked={newLead.incomeCategory === category}
                      onChange={() =>
                        setNewLead({
                          ...newLead,
                          incomeCategory: category as IIncomeCategory,
                        })
                      }
                      className="border-gray-300"
                    />
                    <Label htmlFor={category} className="text-sm">
                      {category}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {newLead.incomeCategory && (
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">
                  4️⃣ Employment Details
                </h3>

                {newLead.incomeCategory === "Salaried" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Employer Name
                      </Label>
                      <Input
                        value={newLead.employerName}
                        onChange={(e) =>
                          setNewLead({
                            ...newLead,
                            employerName: e.target.value,
                          })
                        }
                        placeholder="Enter employer name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Designation
                      </Label>
                      <Input
                        value={newLead.designation}
                        onChange={(e) =>
                          setNewLead({
                            ...newLead,
                            designation: e.target.value,
                          })
                        }
                        placeholder="Enter designation"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Office Address
                      </Label>
                      <Textarea
                        value={newLead.officeAddress}
                        onChange={(e) =>
                          setNewLead({
                            ...newLead,
                            officeAddress: e.target.value,
                          })
                        }
                        placeholder="Enter office address"
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Monthly Gross Salary
                      </Label>
                      <Input
                        value={newLead.monthlyGrossSalary}
                        onChange={(e) =>
                          setNewLead({
                            ...newLead,
                            monthlyGrossSalary: e.target.value,
                          })
                        }
                        placeholder="Enter monthly salary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Years of Experience
                      </Label>
                      <Input
                        value={newLead.yearsOfExperience}
                        onChange={(e) =>
                          setNewLead({
                            ...newLead,
                            yearsOfExperience: e.target.value,
                          })
                        }
                        placeholder="Enter years of experience"
                      />
                    </div>
                  </div>
                )}

                {(newLead.incomeCategory === "Self-Employed" ||
                  newLead.incomeCategory === "Business Owner") && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Business Name
                      </Label>
                      <Input
                        value={newLead.businessName}
                        onChange={(e) =>
                          setNewLead({
                            ...newLead,
                            businessName: e.target.value,
                          })
                        }
                        placeholder="Enter business name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Type of Business
                      </Label>
                      <Input
                        value={newLead.businessType}
                        onChange={(e) =>
                          setNewLead({
                            ...newLead,
                            businessType: e.target.value,
                          })
                        }
                        placeholder="Enter business type"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Business Address
                      </Label>
                      <Textarea
                        value={newLead.businessAddress}
                        onChange={(e) =>
                          setNewLead({
                            ...newLead,
                            businessAddress: e.target.value,
                          })
                        }
                        placeholder="Enter business address"
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Annual Turnover
                      </Label>
                      <Input
                        value={newLead.annualTurnover}
                        onChange={(e) =>
                          setNewLead({
                            ...newLead,
                            annualTurnover: e.target.value,
                          })
                        }
                        placeholder="Enter annual turnover"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Years in Business
                      </Label>
                      <Input
                        value={newLead.yearsInBusiness}
                        onChange={(e) =>
                          setNewLead({
                            ...newLead,
                            yearsInBusiness: e.target.value,
                          })
                        }
                        placeholder="Enter years in business"
                      />
                    </div>
                  </div>
                )}

                {newLead.incomeCategory === "NRI" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Country of Residence
                      </Label>
                      <Input
                        value={newLead.countryOfResidence}
                        onChange={(e) =>
                          setNewLead({
                            ...newLead,
                            countryOfResidence: e.target.value,
                          })
                        }
                        placeholder="Enter country of residence"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Job/Business Type
                      </Label>
                      <Input
                        value={newLead.jobTypeNRI}
                        onChange={(e) =>
                          setNewLead({ ...newLead, jobTypeNRI: e.target.value })
                        }
                        placeholder="Enter job or business type"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Annual Income (Foreign Currency)
                      </Label>
                      <Input
                        value={newLead.annualIncomeFC}
                        onChange={(e) =>
                          setNewLead({
                            ...newLead,
                            annualIncomeFC: e.target.value,
                          })
                        }
                        placeholder="Enter annual income in foreign currency"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                5️⃣ Loan Requirement Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Loan Amount Required
                  </Label>
                  <Input
                    value={newLead.loanAmount}
                    onChange={(e) =>
                      setNewLead({ ...newLead, loanAmount: e.target.value })
                    }
                    placeholder="Enter loan amount"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Loan Tenure (Months)
                  </Label>
                  <Input
                    value={newLead.loanTenure}
                    onChange={(e) =>
                      setNewLead({
                        ...newLead,
                        loanTenure: parseFloat(e.target.value),
                      })
                    }
                    placeholder="Enter loan tenure in months"
                    type="number"
                  />
                </div>
                {/* TODO: <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Preferred Bank/NBFC
                  </Label>
                  <Select
                    value={newLead.}
                    onValueChange={(value) =>
                      setNewLead({ ...newLead, preferredBank: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select preferred bank" />
                    </SelectTrigger>
                    <SelectContent>
                      {allBanks.map((bank) => (
                        <SelectItem key={bank} value={bank}>
                          {bank}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div> */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Urgency Level
                  </Label>
                  <Select
                    value={newLead.urgencyLevel}
                    onValueChange={(value) =>
                      setNewLead({
                        ...newLead,
                        urgencyLevel: value as IUrgencyLevel,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select urgency level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="within_1_month">
                        Within 1 Month
                      </SelectItem>
                      <SelectItem value="flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Purpose of Loan
                  </Label>
                  <Textarea
                    value={newLead.purposeOfLoan}
                    onChange={(e) =>
                      setNewLead({ ...newLead, purposeOfLoan: e.target.value })
                    }
                    placeholder="Enter purpose of loan"
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {((newLead.loanTypes || []).includes("Home Loan") ||
              (newLead.loanTypes || []).includes(
                "Loan Against Property (LAP)"
              )) && (
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">
                  6️⃣ Property Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Property Type
                    </Label>
                    <Select
                      value={newLead.propertyType}
                      onValueChange={(value) =>
                        setNewLead({ ...newLead, propertyType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="residential">Residential</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Property Value (Market Rate)
                    </Label>
                    <Input
                      value={newLead.propertyValue}
                      onChange={(e) =>
                        setNewLead({
                          ...newLead,
                          propertyValue: parseInt(e.target.value, 10) || 0,
                        })
                      }
                      placeholder="Enter property value"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Property Location
                    </Label>
                    <Textarea
                      value={newLead.propertyLocation}
                      onChange={(e) =>
                        setNewLead({
                          ...newLead,
                          propertyLocation: e.target.value,
                        })
                      }
                      placeholder="Enter property location"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                7️⃣ Additional Notes / Special Instructions
              </h3>
              <Textarea
                value={newLead.notes}
                onChange={(e) =>
                  setNewLead({ ...newLead, notes: e.target.value })
                }
                placeholder="Enter any additional notes or special instructions"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowAddLead(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddLead}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={
                !newLead.clientName ||
                !newLead.contactNumber ||
                (newLead.loanTypes || []).length === 0
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              Generate Lead
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <LeadDetailView
          lead={selectedLead}
          setLeads={() => {}}
          setSelectedLead={setSelectedLead}
          disableEdit
        />
      )}
    </div>
  );
};

export default EmployeeDashboard;
