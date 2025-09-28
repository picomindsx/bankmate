"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Bell,
  Users,
  FileText,
  Edit,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Building2,
  Phone,
  Mail,
  CreditCard,
  MapPin,
  Briefcase,
  UserPlus,
  Building,
  User,
  Calendar,
  Target,
  Search,
  Download,
  TrendingUp,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { FileStatusTracker } from "@/components/file-status-tracker";
import { BackButton } from "@/components/ui/back-button";
import { getBranches } from "@/services/branch-service";
import {
  getLeads,
  assignLeadToStaff,
  updateLead,
  getBranchLeads,
  deleteLead,
  getAllLeads,
} from "@/services/lead-service";
import { getStaff } from "@/services/staff-service";
import { Branch, Lead, LeadForm } from "@/types/common";
import { getDocumentCompletionStatus } from "@/services/document-service";
import LeadDetailView from "@/components/lead-detail-view";
import { getStatusColor } from "@/lib/utils";
import {
  AlertDialogHeader,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@radix-ui/react-alert-dialog";
import AssignReassign from "@/components/assign-reassign";

export default function LeadManagementPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const params = useParams();
  const branchId = params.branchId as string;

  const [leads, setLeads] = useState<LeadForm[]>([]);
  const [branch, setBranch] = useState<Branch | null>(null);
  const [staff, setStaff] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [documentFilter, setDocumentFilter] = useState("all");
  const [assignmentFilter, setAssignmentFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState<LeadForm | null>(null);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showFileTracker, setShowFileTracker] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [customBanks, setCustomBanks] = useState<string[]>([]);
  const [showCustomBankDialog, setShowCustomBankDialog] = useState(false);
  const [newCustomBank, setNewCustomBank] = useState("");
  const [showCustomStaffDialog, setShowCustomStaffDialog] = useState(false);
  const [newCustomStaff, setNewCustomStaff] = useState({
    name: "",
    designation: "",
    contact: "",
    email: "",
  });
  const [showAddDialog, setShowAddDialog] = useState(false);

  const [showReassignDialog, setShowReassignDialog] = useState(false);
  const [showDocumentDialog, setShowDocumentDialog] = useState(false);
  const [showBankDialog, setShowBankDialog] = useState(false);
  const [selectedStaffForReassign, setSelectedStaffForReassign] = useState("");
  const [selectedBankForChange, setSelectedBankForChange] = useState("");

  const [showCustomBankDialogInChange, setShowCustomBankDialogInChange] =
    useState(false);
  const [newCustomBankName, setNewCustomBankName] = useState("");

  // State for edit form
  const [editFormData, setEditFormData] = useState<Partial<LeadForm>>({});

  const banks = [
    "State Bank of India (SBI)",
    "HDFC Bank",
    "ICICI Bank",
    "Canara Bank",
    "Punjab National Bank",
    "Bank of Baroda",
    "Axis Bank",
    "Kotak Mahindra Bank",
  ];

  const allBanks = [
    ...banks,
    ...customBanks,
    "Add Custom Bank...", // Special option to trigger custom bank dialog
  ];

  useEffect(() => {
    getBranches().then((branches) => {
      const currentBranch = branches.find((b) => b.id === branchId);
      if (currentBranch) {
        setBranch(currentBranch);
        getBranchLeads(branchId).then((branchLeads) => setLeads(branchLeads));

        getStaff().then((staffList) => {
          setStaff(staffList.filter((s) => s.isActive));
        });
      }
    });
  }, [user, router, branchId]);

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.clientName!.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.contactNumber!.includes(searchTerm) ||
      lead.email!.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.leadName &&
        lead.leadName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDate =
      !dateFilter ||
      new Date(lead.createdAt!).toDateString() ===
        new Date(dateFilter).toDateString();
    const matchesStatus =
      statusFilter === "all" || lead.applicationStatus === statusFilter;

    const matchesAssignment =
      assignmentFilter === "all" ||
      (assignmentFilter === "assigned" && lead.assignedStaff) ||
      (assignmentFilter === "unassigned" && !lead.assignedStaff);
    return matchesSearch && matchesDate && matchesStatus && matchesAssignment;
  });

  const unassignedLeads = leads.filter(
    (lead) => !lead.assignedStaff || lead.assignedStaff === ""
  );

  const handleAssignLead = () => {
    if (!selectedLead || !selectedStaffId || !user) return;

    const success = assignLeadToStaff(
      selectedLead.id!,
      selectedStaffId,
      user,
      selectedBank
    );
    if (success) {
      getBranchLeads(branchId).then((branchLeads) => setLeads(branchLeads));
      setShowAssignDialog(false);
      setSelectedLead(null);
      setSelectedStaffId("");
      setSelectedBank("");
    }
  };

  const handleAddCustomBank = () => {
    if (newCustomBank.trim() && !allBanks.includes(newCustomBank.trim())) {
      setCustomBanks((prev) => [...prev, newCustomBank.trim()]);
      setNewCustomBank("");
      setShowCustomBankDialog(false);
      // Auto-select the newly added bank
      setSelectedBank(newCustomBank.trim());
    }
  };

  const handleAddCustomStaff = () => {
    if (newCustomStaff.name.trim() && newCustomStaff.designation.trim()) {
      const customStaffMember = {
        id: `custom-${Date.now()}`,
        name: newCustomStaff.name,
        designation: newCustomStaff.designation,
        contact: newCustomStaff.contact,
        email: newCustomStaff.email,
        branchId: branchId,
        isActive: true,
        isCustom: true,
      };
      setStaff((prev) => [...prev, customStaffMember]);
      setNewCustomStaff({ name: "", designation: "", contact: "", email: "" });
      setShowCustomStaffDialog(false);
      // Auto-select the newly added staff
      setSelectedStaffId(customStaffMember.id);
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    const success = await deleteLead(leadId);
    if (success) {
      getAllLeads().then((leadList) => setLeads(leadList));
    }
  };

  if (!user || user.type !== "official" || !branch) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-50">
      <header className="backdrop-blur-xl bg-white/80 border-b border-gray-200/50 shadow-xl">
        <div className="flex h-20 items-center justify-between px-8">
          <div className="flex items-center gap-6">
            <BackButton href="/dashboard" label="Back to Dashboard" />
            <div className="relative">
              <Image
                src="/images/bankmate-logo.png"
                alt="Bankmate Solutions Logo"
                width={50}
                height={50}
                className="rounded-xl shadow-lg transform hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-gray-400/20 to-slate-400/20 animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-black to-gray-700 bg-clip-text text-transparent">
                {branch?.name || "Branch"} - Lead Pipeline
              </h1>
              <p className="text-black font-medium">
                Full Pipeline View by Loan Type • {leads.length} Total Leads
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="sm"
              className="relative backdrop-blur-sm bg-white/10 hover:bg-white/20 border border-white/20 text-white"
            >
              <Bell className="h-5 w-5" />
              {unassignedLeads.length > 0 && (
                <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 text-xs bg-gradient-to-r from-red-500 to-pink-500 animate-bounce">
                  {unassignedLeads.length}
                </Badge>
              )}
            </Button>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-black font-semibold block">
                  {user.name}
                </span>
                <span className="text-gray-700/70 text-sm">
                  {user.role} Access
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="backdrop-blur-sm bg-red-500/20 hover:bg-red-500/30 border-red-400/50 text-black hover:text-black"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <AssignReassign
        lead={selectedLead}
        setLead={setSelectedLead}
        open={showAssignDialog}
        setOpen={setShowAssignDialog}
      />

      <Dialog
        open={showCustomBankDialog}
        onOpenChange={setShowCustomBankDialog}
      >
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Add Custom Bank</DialogTitle>
            <DialogDescription className="text-gray-300">
              Add a new bank that's not in the standard list
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="customBank" className="text-white">
                Bank Name
              </Label>
              <Input
                id="customBank"
                value={newCustomBank}
                onChange={(e) => setNewCustomBank(e.target.value)}
                placeholder="Enter bank name (e.g., Local Cooperative Bank)"
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAddCustomBank}
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={!newCustomBank.trim()}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Bank
              </Button>
              <Button
                onClick={() => {
                  setShowCustomBankDialog(false);
                  setNewCustomBank("");
                }}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showCustomStaffDialog}
        onOpenChange={setShowCustomStaffDialog}
      >
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">
              Add Custom Staff Member
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              Add a temporary staff member for lead assignment
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="staffName" className="text-white">
                  Staff Name *
                </Label>
                <Input
                  id="staffName"
                  value={newCustomStaff.name}
                  onChange={(e) =>
                    setNewCustomStaff((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="Enter staff name"
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
              <div>
                <Label htmlFor="staffDesignation" className="text-white">
                  Designation *
                </Label>
                <Input
                  id="staffDesignation"
                  value={newCustomStaff.designation}
                  onChange={(e) =>
                    setNewCustomStaff((prev) => ({
                      ...prev,
                      designation: e.target.value,
                    }))
                  }
                  placeholder="e.g., Loan Officer"
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="staffContact" className="text-white">
                  Contact Number
                </Label>
                <Input
                  id="staffContact"
                  value={newCustomStaff.contact}
                  onChange={(e) =>
                    setNewCustomStaff((prev) => ({
                      ...prev,
                      contact: e.target.value,
                    }))
                  }
                  placeholder="Enter contact number"
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
              <div>
                <Label htmlFor="staffEmail" className="text-white">
                  Email
                </Label>
                <Input
                  id="staffEmail"
                  value={newCustomStaff.email}
                  onChange={(e) =>
                    setNewCustomStaff((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  placeholder="Enter email address"
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAddCustomStaff}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={
                  !newCustomStaff.name.trim() ||
                  !newCustomStaff.designation.trim()
                }
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Add Staff Member
              </Button>
              <Button
                onClick={() => {
                  setShowCustomStaffDialog(false);
                  setNewCustomStaff({
                    name: "",
                    designation: "",
                    contact: "",
                    email: "",
                  });
                }}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modals */}
      {selectedLead && !showFileTracker && (
        <LeadDetailView
          lead={selectedLead}
          setLeads={setLeads}
          setSelectedLead={setSelectedLead}
        />
      )}

      {showCustomBankDialogInChange && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Add Custom Bank</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Bank Name
                </label>
                <Input
                  placeholder="Enter custom bank name"
                  value={newCustomBankName}
                  onChange={(e) => setNewCustomBankName(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    if (newCustomBankName.trim()) {
                      const newBank = newCustomBankName.trim();
                      setCustomBanks((prev) => [...prev, newBank]);
                      setSelectedBankForChange(newBank);
                      setNewCustomBankName("");
                      setShowCustomBankDialogInChange(false);
                    }
                  }}
                  className="flex-1"
                >
                  Add Bank
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCustomBankDialogInChange(false);
                    setNewCustomBankName("");
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 p-8">
        {/* Enhanced Filters */}
        <Card className="backdrop-blur-xl bg-white/10 border-white/20 mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 placeholder:text-gray-400"
                />
              </div>
              {/* <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-white/10 border-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="sanctioned">Sanctioned</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select> */}
              {/* <Select
                value={assignmentFilter}
                onValueChange={setAssignmentFilter}
              >
                <SelectTrigger className="bg-white/10 border-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Leads</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                </SelectContent>
              </Select> */}
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-white/10 border-white/20 mr-2"
              />
              <Button
                onClick={() => router.push(`/dashboard/leads/${branchId}/add`)}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white col-start-5"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Lead
              </Button>
              {/* <Button
                variant="outline"
                onClick={exportToCSV}
                className="bg-white/10 border-white/20 hover:bg-white/20"
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button> */}
            </div>
          </CardContent>
        </Card>
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-teal-700 bg-clip-text text-transparent">
              Lead Pipeline by Loan Type
            </h2>
          </div>

          {(() => {
            const leadsByType = filteredLeads.reduce((acc, lead) => {
              const type = lead.leadType || "Other";
              if (!acc[type]) acc[type] = [];
              acc[type].push(lead);
              return acc;
            }, {} as Record<string, LeadForm[]>);

            return (
              <div className="space-y-8">
                {Object.entries(leadsByType).map(([loanType, typeLeads]) => (
                  <Card
                    key={loanType}
                    className="backdrop-blur-xl bg-white/70 border-slate-200/50 shadow-xl"
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl text-slate-800 flex items-center gap-2">
                          <Briefcase className="h-5 w-5 text-teal-600" />
                          {loanType} ({typeLeads.length} leads)
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* New Leads Column */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                            <AlertCircle className="h-4 w-4 text-orange-600" />
                            <h4 className="font-semibold text-orange-800">
                              New Leads
                            </h4>
                            <Badge className="bg-orange-500 text-white">
                              {typeLeads.filter((l) => !l.assignedStaff).length}
                            </Badge>
                          </div>
                          <div className="space-y-2 max-h-96 overflow-y-auto">
                            {typeLeads
                              .filter((l) => !l.assignedStaff)
                              .map((lead) => (
                                <Card
                                  key={lead.id}
                                  className="p-3 bg-white border border-orange-200 hover:shadow-md transition-shadow cursor-pointer"
                                  onClick={() => {
                                    setSelectedLead(lead);
                                    setEditFormData(lead);
                                  }}
                                >
                                  <div className="space-y-1">
                                    <h5 className="font-medium text-sm text-gray-900">
                                      {lead.clientName}
                                    </h5>
                                    <p className="text-xs text-gray-600">
                                      {lead.contactNumber}
                                    </p>
                                    <div className="flex items-center gap-1">
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {lead.leadSource === "staff_created"
                                          ? "Staff Created"
                                          : lead.leadSource === "owner_created"
                                          ? "Owner Created"
                                          : lead.leadSource || "Unknown"}
                                      </Badge>
                                    </div>
                                  </div>

                                  <div className="flex gap-1">
                                    <Button
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedLead(lead);
                                        // setEditFormData(lead);
                                      }}
                                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 h-6"
                                    >
                                      <Eye className="h-3 w-3 mr-1" />
                                      View
                                    </Button>
                                    {[
                                      `owner`,
                                      `manager`,
                                      `branch_head`,
                                    ].includes(user?.role || "") &&
                                      !lead.assignedStaff && (
                                        <Button
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedLead(lead);
                                            setShowAssignDialog(true);
                                            // onAssign(lead);
                                          }}
                                          className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 h-6"
                                        >
                                          <UserPlus className="h-3 w-3 mr-1" />
                                          Assign
                                        </Button>
                                      )}

                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          size="sm"
                                          variant={"destructive"}
                                          className="text-xs px-2 py-1 h-6"
                                        >
                                          <Trash2 className="h-4 w-4 mr-1" />
                                          Delete
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>
                                            Are you sure you want to delete this
                                            Lead?
                                          </AlertDialogTitle>
                                          <AlertDialogDescription>
                                            This will permanently delete the
                                            Lead's account, revoke their access
                                            to all systems, and remove any data
                                            or files associated only with their
                                            user profile.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>
                                            Cancel
                                          </AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() =>
                                              handleDeleteLead(lead.id || "")
                                            }
                                          >
                                            Continue
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </Card>
                              ))}
                          </div>
                        </div>

                        {/* Assigned Leads Column */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <User className="h-4 w-4 text-blue-600" />
                            <h4 className="font-semibold text-blue-800">
                              Assigned Leads
                            </h4>
                            <Badge className="bg-blue-500 text-white">
                              {typeLeads.filter((l) => l.assignedStaff).length}
                            </Badge>
                          </div>
                          <div className="space-y-2 max-h-96 overflow-y-auto">
                            {typeLeads
                              .filter((l) => l.assignedStaff)
                              .map((lead) => (
                                <Card
                                  key={lead.id}
                                  className="p-3 bg-white border border-blue-200 hover:shadow-md transition-shadow cursor-pointer"
                                  onClick={() => {
                                    setSelectedLead(lead);
                                    setEditFormData(lead);
                                  }}
                                >
                                  <div className="space-y-1">
                                    <h5 className="font-medium text-sm text-gray-900">
                                      {lead.clientName}
                                      {lead.leadName
                                        ? ` (${lead.leadName})`
                                        : ""}
                                    </h5>
                                    <p className="text-xs text-gray-600">
                                      {lead.contactNumber}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      Bank:{" "}
                                      {lead.bankSelection || "Not assigned"}
                                    </p>
                                    <div className="flex gap-1">
                                      <Button
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedLead(lead);
                                        }}
                                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 h-6"
                                      >
                                        <Eye className="h-3 w-3 mr-1" />
                                        View
                                      </Button>

                                      <Button
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedLead(lead);
                                          setShowAssignDialog(true);
                                        }}
                                        className="bg-orange-600 hover:bg-orange-700 text-white text-xs px-2 py-1 h-6"
                                      >
                                        <UserPlus className="h-3 w-3 mr-1" />
                                        Reassign
                                      </Button>

                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <Button
                                            size="sm"
                                            variant={"destructive"}
                                            className="text-xs px-2 py-1 h-6"
                                          >
                                            <Trash2 className="h-4 w-4 mr-1" />
                                            Delete
                                          </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>
                                              Are you sure you want to delete
                                              this Lead?
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                              This will permanently delete the
                                              Lead's account, revoke their
                                              access to all systems, and remove
                                              any data or files associated only
                                              with their user profile.
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel>
                                              Cancel
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                              onClick={() =>
                                                handleDeleteLead(lead.id || "")
                                              }
                                            >
                                              Continue
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    </div>
                                  </div>
                                </Card>
                              ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            );
          })()}
        </div>

        {/* Lead List */}
        {/* <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredLeads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </div> */}

        {filteredLeads.length === 0 && (
          <Card className="backdrop-blur-xl bg-white/10 border-white/20">
            <CardContent className="p-12 text-center">
              <TrendingUp className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No leads found
              </h3>
              <p className="text-gray-300 mb-6">
                {searchTerm ||
                statusFilter !== "all" ||
                assignmentFilter !== "all"
                  ? "Try adjusting your filters to see more results."
                  : "Get started by creating your first lead."}
              </p>
              <Button
                onClick={() => router.push(`/dashboard/leads/${branchId}/add`)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create First Lead
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
