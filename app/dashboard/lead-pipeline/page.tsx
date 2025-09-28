"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
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
  ArrowLeft,
  Bell,
  Users,
  FileText,
  Edit,
  Eye,
  CheckCircle,
  XCircle,
  Building2,
  Phone,
  Mail,
  Briefcase,
  UserPlus,
  User,
  Plus,
  Search,
  Download,
  Clock,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FileStatusTracker } from "@/components/file-status-tracker";
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getBranches } from "@/services/branch-service";
import {
  getLeads,
  updateLead,
  assignLeadToStaff,
  getAllLeads,
  getBranchLeads,
} from "@/services/lead-service";
import { getStaff } from "@/services/staff-service";
import { Lead, Branch, LeadForm } from "@/types/common";
import LeadDetailView from "@/components/lead-detail-view";

// Sortable Lead Card Component
function SortableLeadCard({
  lead,
  onView,
  onAssign,
  onFileTracker,
  user,
}: {
  lead: LeadForm;
  onView: (lead: LeadForm) => void;
  onAssign: (lead: LeadForm) => void;
  onFileTracker: (lead: LeadForm) => void;
  user: any;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id! });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getDocumentCompletionStatus = (lead: Lead) => {
    if (!lead.documents || lead.documents.length === 0) return "No Documents";
    const totalDocs = lead.documents.length;
    const verifiedDocs = lead.documents.filter(
      (doc) => doc.status === "verified"
    ).length;
    const providedDocs = lead.documents.filter(
      (doc) => doc.status === "provided"
    ).length;
    const pendingDocs = lead.documents.filter(
      (doc) => doc.status === "pending"
    ).length;

    if (verifiedDocs === totalDocs) return "Document Complete";
    if (providedDocs + verifiedDocs === totalDocs) return "Under Review";
    return `${pendingDocs} Pending`;
  };

  const getSourceBadge = (lead: LeadForm) => {
    if (lead.leadSource === "website")
      return {
        label: "Website",
        color:
          "bg-green-500/20 text-green-300 border-green-400/30 hover:bg-green-500/30",
      };
    if (lead.leadSource === "social_media")
      return {
        label: "Social Media",
        color:
          "bg-purple-500/20 text-purple-300 border-purple-400/30 hover:bg-purple-500/30",
      };
    if (lead.leadSource === "walk_in")
      return {
        label: "Walk-in",
        color:
          "bg-orange-500/20 text-orange-300 border-orange-400/30 hover:bg-orange-500/30",
      };
    if (lead.leadSource === "data_sheet")
      return {
        label: "Data Sheet",
        color:
          "bg-yellow-500/20 text-yellow-300 border-yellow-400/30 hover:bg-yellow-500/30",
      };
    return {
      label: "Owner/Staff Created",
      color:
        "bg-indigo-500/20 text-indigo-300 border-indigo-400/30 hover:bg-indigo-500/30",
    };
  };

  const sourceBadge = getSourceBadge(lead);

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="backdrop-blur-xl bg-white/75 border-white/20 hover:bg-white transition-all duration-300 cursor-grab active:cursor-grabbing"
    >
      <CardContent className="p-3">
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h4 className="font-semibold text-black text-sm">
              {lead.leadName || lead.clientName}
            </h4>
            <Badge className={sourceBadge.color}>{sourceBadge.label}</Badge>
          </div>

          <div className=" text-xs text-shadow-black pb-1">
            <div className="flex items-center gap-2">
              <Briefcase className="h-3 w-3" />
              <span>{lead.leadType}</span>
            </div>
          </div>

          {!lead.assignedStaff && (
            <div className="flex flex-wrap gap-1 pb-0">
              <Badge className="bg-red-500/20 text-red-300 border-red-400/30 text-xs">
                Unassigned
              </Badge>
            </div>
          )}

          <div className="flex gap-1">
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onView(lead);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 h-6"
            >
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
            {/* {lead.bankSelection && lead.assignedStaff && (
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onFileTracker(lead);
                }}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs px-2 py-1 h-6"
              >
                <FileText className="h-3 w-3 mr-1" />
                File
              </Button>
            )} */}
            {[`owner`, `manager`, `branch_head`].includes(user?.role || "") &&
              !lead.assignedStaff && (
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAssign(lead);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 h-6"
                >
                  <UserPlus className="h-3 w-3 mr-1" />
                  Assign
                </Button>
              )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Droppable Column Component
function DroppableColumn({
  id,
  title,
  leads,
  color,
  icon: Icon,
  onView,
  onAssign,
  onFileTracker,
  user,
}: {
  id: string;
  title: string;
  leads: LeadForm[];
  color: string;
  icon: any;
  onView: (lead: LeadForm) => void;
  onAssign: (lead: LeadForm) => void;
  onFileTracker: (lead: LeadForm) => void;
  user: any;
}) {
  return (
    <div className="flex flex-col h-full">
      <div
        className={`p-4 rounded-t-lg bg-gradient-to-r ${color} border-b border-white/20`}
      >
        <div className="flex items-center gap-2 mb-2">
          <Icon className="h-5 w-5 text-white" />
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <Badge className="bg-white/20 text-white border-white/30">
            {leads.length}
          </Badge>
        </div>
      </div>

      <div className="flex-1 p-4 bg-gray-300 rounded-b-lg min-h-[600px] overflow-y-auto">
        <SortableContext
          items={leads.map((lead) => lead.id!)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {leads.map((lead) => (
              <SortableLeadCard
                key={lead.id}
                lead={lead}
                onView={onView}
                onAssign={onAssign}
                onFileTracker={onFileTracker}
                user={user}
              />
            ))}
            {leads.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Icon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No leads in this column</p>
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}

export default function LeadPipelinePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [leads, setLeads] = useState<LeadForm[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState<LeadForm | null>(null);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showFileTracker, setShowFileTracker] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [bankSelection, setSelectedBank] = useState("");
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
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

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

  const allBanks = [...banks, ...customBanks, "Add Custom Bank..."];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    getBranches().then((branchList) => setBranches(branchList));
    getAllLeads().then((leadList) => setLeads(leadList));

    getStaff().then((staffList) =>
      setStaff(staffList.filter((s) => s.isActive))
    );
  }, [user, router]);

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.clientName!.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.contactNumber!.includes(searchTerm) ||
      lead.email!.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.leadName &&
        lead.leadName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesBranch =
      branchFilter === "all" || lead.branchId === branchFilter;
    return matchesSearch && matchesBranch;
  });

  const newLeads = filteredLeads.filter(
    (lead) =>
      lead.applicationStatus === "login" &&
      (!lead.assignedStaff || lead.assignedStaff === "")
  );
  const assignedLeads = filteredLeads.filter(
    (lead) => lead.assignedStaff && lead.assignedStaff !== ""
    // lead.applicationStatus === "pending"
  );
  const sanctionedLeads = filteredLeads.filter(
    (lead) => lead.applicationStatus === "sanctioned"
  );
  const rejectedLeads = filteredLeads.filter(
    (lead) => lead.applicationStatus === "rejected"
  );
  const unassignedLeads = filteredLeads.filter(
    (lead) =>
      (!lead.assignedStaff || lead.assignedStaff === "") &&
      lead.applicationStatus !== "login"
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const leadId = active.id as string;
    const newColumn = over.id as string;

    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;

    let updates: Partial<Lead> = {};

    switch (newColumn) {
      case "new":
        updates = {
          applicationStatus: "login",
          assignedStaff: "",
          isVisibleToStaff: false,
        };
        break;
      case "assigned":
        if (lead.assignedStaff) {
          updates = {
            applicationStatus: "pending",
            isVisibleToStaff: true,
          };
        }
        break;
      case "sanctioned":
        updates = { applicationStatus: "sanctioned" };
        break;
      case "rejected":
        updates = { applicationStatus: "rejected" };
        break;
      case "unassigned":
        updates = {
          assignedStaff: "",
          isVisibleToStaff: false,
        };
        break;
    }

    if (Object.keys(updates).length > 0) {
      updateLead(leadId, updates);
      getAllLeads().then((leadList) => setLeads(leadList));
    }
  };

  const handleAssignLead = () => {
    if (!selectedLead || !selectedStaffId || !user) return;

    const success = assignLeadToStaff(
      selectedLead.id!,
      selectedStaffId,
      user,
      bankSelection
    );
    if (success) {
      getAllLeads().then((leadList) => setLeads(leadList));
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
        branchId: "all",
        isActive: true,
        isCustom: true,
      };
      setStaff((prev) => [...prev, customStaffMember]);
      setNewCustomStaff({ name: "", designation: "", contact: "", email: "" });
      setShowCustomStaffDialog(false);
      setSelectedStaffId(customStaffMember.id);
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      [
        "Column",
        "Lead Name",
        "Client Name",
        "Contact",
        "Email",
        "Product Type",
        "Assigned Staff",
        "Application Status",
        "Bank",
        "Created Date",
      ].join(","),
      ...newLeads.map((lead) =>
        [
          "New Leads",
          lead.leadName || "",
          lead.clientName,
          lead.contactNumber,
          lead.email,
          lead.leadType,
          lead.assignedStaff || "",
          lead.applicationStatus,
          lead.bankSelection || "",
          new Date(lead.createdAt!).toLocaleDateString(),
        ].join(",")
      ),
      ...assignedLeads.map((lead) =>
        [
          "Assigned Leads",
          lead.leadName || "",
          lead.clientName,
          lead.contactNumber,
          lead.email,
          lead.leadType,
          lead.assignedStaff || "",
          lead.applicationStatus,
          lead.bankSelection || "",
          new Date(lead.createdAt!).toLocaleDateString(),
        ].join(",")
      ),
      ...sanctionedLeads.map((lead) =>
        [
          "Sanctioned Leads",
          lead.leadName || "",
          lead.clientName,
          lead.contactNumber,
          lead.email,
          lead.leadType,
          lead.assignedStaff || "",
          lead.applicationStatus,
          lead.bankSelection || "",
          new Date(lead.createdAt!).toLocaleDateString(),
        ].join(",")
      ),
      ...rejectedLeads.map((lead) =>
        [
          "Rejected Leads",
          lead.leadName || "",
          lead.clientName,
          lead.contactNumber,
          lead.email,
          lead.leadType,
          lead.assignedStaff || "",
          lead.applicationStatus,
          lead.bankSelection || "",
          new Date(lead.createdAt!).toLocaleDateString(),
        ].join(",")
      ),
      ...unassignedLeads.map((lead) =>
        [
          "Unassigned Leads",
          lead.leadName || "",
          lead.clientName,
          lead.contactNumber,
          lead.email,
          lead.leadType,
          lead.assignedStaff || "",
          lead.applicationStatus,
          lead.bankSelection || "",
          new Date(lead.createdAt!).toLocaleDateString(),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lead-pipeline-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  if (!user || user.type !== "official") {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <header className="backdrop-blur-xl bg-white/10 border-b border-white/20 shadow-2xl">
        <div className="flex h-20 items-center justify-between px-8">
          <div className="flex items-center gap-6">
            <Link href="/dashboard">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="relative">
              <Image
                src="/images/bankmate-logo.png"
                alt="Bankmate Solutions Logo"
                width={50}
                height={50}
                className="rounded-xl shadow-lg"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Lead Pipeline
              </h1>
              <p className="text-gray-600 mt-1">
                Drag & drop lead management system
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Button
              onClick={exportToCSV}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
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
                <span className="text-white font-semibold block">
                  {user.name}
                </span>
                <span className="text-blue-200/80 text-sm">
                  {user.role} Access
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="backdrop-blur-sm bg-red-500/20 hover:bg-red-500/30 border-red-400/50 text-white hover:text-white"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="p-6 border-b border-white/10">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-white" />
            <Input
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 bg-white/10 border-white/20 placeholder:text-gray-400"
            />
          </div>
          <Select value={branchFilter} onValueChange={setBranchFilter}>
            <SelectTrigger className="w-48 bg-white/10 border-white/20">
              <SelectValue placeholder="Filter by branch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Branches</SelectItem>
              {branches.map((branch) => (
                <SelectItem key={branch.id} value={branch.id}>
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card className="backdrop-blur-xl bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">
                New Leads
              </CardTitle>
              <Plus className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-800">
                {newLeads.length}
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">
                Assigned
              </CardTitle>
              <UserPlus className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-800">
                {assignedLeads.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Kanban Board */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DroppableColumn
              id="new"
              title="New Leads"
              leads={newLeads}
              color="from-blue-600 to-cyan-600"
              icon={Plus}
              onView={setSelectedLead}
              onAssign={(lead) => {
                setSelectedLead(lead);
                setShowAssignDialog(true);
              }}
              onFileTracker={(lead) => {
                setSelectedLead(lead);
                setShowFileTracker(true);
              }}
              user={user}
            />

            <DroppableColumn
              id="assigned"
              title="Assigned Leads"
              leads={assignedLeads}
              color="from-green-600 to-emerald-600"
              icon={UserPlus}
              onView={setSelectedLead}
              onAssign={(lead) => {
                setSelectedLead(lead);
                setShowAssignDialog(true);
              }}
              onFileTracker={(lead) => {
                setSelectedLead(lead);
                setShowFileTracker(true);
              }}
              user={user}
            />
          </div>

          <DragOverlay>
            {activeId ? (
              <div className="transform rotate-5 opacity-90">
                <SortableLeadCard
                  lead={leads.find((l) => l.id === activeId)!}
                  onView={() => {}}
                  onAssign={() => {}}
                  onFileTracker={() => {}}
                  user={user}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Dialogs */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">
              Assign Lead to Staff & Select Bank
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              Assign {selectedLead?.clientName} to a staff member and select a
              bank.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="staff" className="text-white">
                  Select Staff Member
                </Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowCustomStaffDialog(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white border-blue-500"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Custom Staff
                </Button>
              </div>
              <Select
                value={selectedStaffId}
                onValueChange={setSelectedStaffId}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Choose staff member" />
                </SelectTrigger>
                <SelectContent>
                  {staff.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name} - {member.designation}
                      {member.isCustom && (
                        <Badge className="ml-2 bg-blue-500 text-white">
                          Custom
                        </Badge>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="bank" className="text-white">
                  Select Bank
                </Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowCustomBankDialog(true)}
                  className="bg-green-600 hover:bg-green-700 text-white border-green-500"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Custom Bank
                </Button>
              </div>
              <Select
                value={bankSelection}
                onValueChange={(value) => {
                  if (value === "Add Custom Bank...") {
                    setShowCustomBankDialog(true);
                  } else {
                    setSelectedBank(value);
                  }
                }}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Choose bank" />
                </SelectTrigger>
                <SelectContent>
                  {allBanks.map((bank) => (
                    <SelectItem key={bank} value={bank}>
                      {bank}
                      {customBanks.includes(bank) && (
                        <Badge className="ml-2 bg-green-500 text-white">
                          Custom
                        </Badge>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleAssignLead}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600"
              disabled={!selectedStaffId || !bankSelection}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Assign Lead & Make Visible to Staff
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
                placeholder="Enter bank name"
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

      {/* Add Lead Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Lead</DialogTitle>
          </DialogHeader>

          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 max-w-4xl w-full max-h-[95vh] overflow-y-auto border border-gray-200 shadow-2xl">
            {/* Add Lead Form Here */}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modals */}
      {selectedLead && !showFileTracker && (
        <LeadDetailView lead={selectedLead} setSelectedLead={setSelectedLead} />
      )}
    </div>
  );
}
