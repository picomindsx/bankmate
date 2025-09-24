"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
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
} from "lucide-react"
import { getLeads, getBranches, getStaff, assignLeadToStaff, updateLead, type Lead, type Branch } from "@/lib/auth"
import Image from "next/image"
import { FileStatusTracker } from "@/components/file-status-tracker"
import { BackButton } from "@/components/ui/back-button"

export default function LeadManagementPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const params = useParams()
  const branchId = params.branchId as string

  const [leads, setLeads] = useState<Lead[]>([])
  const [branch, setBranch] = useState<Branch | null>(null)
  const [staff, setStaff] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [documentFilter, setDocumentFilter] = useState("all")
  const [assignmentFilter, setAssignmentFilter] = useState("all")
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [showPipelineView, setShowPipelineView] = useState(false)
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [showFileTracker, setShowFileTracker] = useState(false)
  const [selectedStaffId, setSelectedStaffId] = useState("")
  const [selectedBank, setSelectedBank] = useState("")
  const [customBanks, setCustomBanks] = useState<string[]>([])
  const [showCustomBankDialog, setShowCustomBankDialog] = useState(false)
  const [newCustomBank, setNewCustomBank] = useState("")
  const [showCustomStaffDialog, setShowCustomStaffDialog] = useState(false)
  const [newCustomStaff, setNewCustomStaff] = useState({
    name: "",
    designation: "",
    contact: "",
    email: "",
  })
  const [showAddDialog, setShowAddDialog] = useState(false)

  const [showReassignDialog, setShowReassignDialog] = useState(false)
  const [showDocumentDialog, setShowDocumentDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showBankDialog, setShowBankDialog] = useState(false)
  const [selectedStaffForReassign, setSelectedStaffForReassign] = useState("")
  const [selectedBankForChange, setSelectedBankForChange] = useState("")

  const [showCustomBankDialogInChange, setShowCustomBankDialogInChange] = useState(false)
  const [newCustomBankName, setNewCustomBankName] = useState("")

  // State for edit form
  const [editFormData, setEditFormData] = useState<Partial<Lead>>({})

  const banks = [
    "State Bank of India (SBI)",
    "HDFC Bank",
    "ICICI Bank",
    "Canara Bank",
    "Punjab National Bank",
    "Bank of Baroda",
    "Axis Bank",
    "Kotak Mahindra Bank",
  ]

  const allBanks = [
    ...banks,
    ...customBanks,
    "Add Custom Bank...", // Special option to trigger custom bank dialog
  ]

  useEffect(() => {
    if (!user || user.type !== "official") {
      router.push("/")
      return
    }

    const branches = getBranches()
    const currentBranch = branches.find((b) => b.id === branchId)
    if (currentBranch) {
      setBranch(currentBranch)
      setLeads(getLeads(branchId))
      setStaff(getStaff().filter((s) => s.branchId === branchId && s.isActive))
    }
  }, [user, router, branchId])

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.contactNumber.includes(searchTerm) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.leadName && lead.leadName.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesDate = !dateFilter || new Date(lead.createdAt).toDateString() === new Date(dateFilter).toDateString()
    const matchesStatus = statusFilter === "all" || lead.applicationStatus === statusFilter
    const matchesDocument =
      documentFilter === "all" || (lead.documents && lead.documents.some((doc) => doc.status === documentFilter))
    const matchesAssignment =
      assignmentFilter === "all" ||
      (assignmentFilter === "assigned" && lead.assignedStaff && lead.isVisibleToStaff) ||
      (assignmentFilter === "unassigned" && (!lead.assignedStaff || !lead.isVisibleToStaff))
    return matchesSearch && matchesDate && matchesStatus && matchesDocument && matchesAssignment
  })

  const loginLeads = leads.filter((lead) => lead.applicationStatus === "login")
  const pendingLeads = leads.filter((lead) => lead.applicationStatus === "pending")
  const sanctionedLeads = leads.filter((lead) => lead.applicationStatus === "sanctioned")
  const rejectedLeads = leads.filter((lead) => lead.applicationStatus === "rejected")
  const assignedLeads = leads.filter((lead) => lead.assignedStaff && lead.assignedStaff !== "")
  const unassignedLeads = leads.filter((lead) => !lead.assignedStaff || lead.assignedStaff === "")

  const handleAssignLead = () => {
    if (!selectedLead || !selectedStaffId || !user) return

    const success = assignLeadToStaff(selectedLead.id, selectedStaffId, user, selectedBank)
    if (success) {
      setLeads(getLeads(branchId))
      setShowAssignDialog(false)
      setSelectedLead(null)
      setSelectedStaffId("")
      setSelectedBank("")
    }
  }

  const handleAddCustomBank = () => {
    if (newCustomBank.trim() && !allBanks.includes(newCustomBank.trim())) {
      setCustomBanks((prev) => [...prev, newCustomBank.trim()])
      setNewCustomBank("")
      setShowCustomBankDialog(false)
      // Auto-select the newly added bank
      setSelectedBank(newCustomBank.trim())
    }
  }

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
      }
      setStaff((prev) => [...prev, customStaffMember])
      setNewCustomStaff({ name: "", designation: "", contact: "", email: "" })
      setShowCustomStaffDialog(false)
      // Auto-select the newly added staff
      setSelectedStaffId(customStaffMember.id)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "login":
        return "bg-blue-500"
      case "pending":
        return "bg-orange-500"
      case "sanctioned":
        return "bg-green-500"
      case "rejected":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getDocumentStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-red-500"
      case "Provided":
        return "bg-orange-500"
      case "Verified":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const exportToCSV = () => {
    const csvContent = [
      [
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
      ...filteredLeads.map((lead) =>
        [
          lead.leadName || "",
          lead.clientName,
          lead.contactNumber,
          lead.email,
          lead.leadType,
          lead.assignedStaff,
          lead.applicationStatus,
          lead.selectedBank || "",
          new Date(lead.createdAt).toLocaleDateString(),
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `leads-${branch?.name}-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  const getDocumentCompletionStatus = (lead: Lead) => {
    if (!lead.documents || lead.documents.length === 0) return "No Documents"
    const totalDocs = lead.documents.length
    const verifiedDocs = lead.documents.filter((doc) => doc.status === "verified").length
    const providedDocs = lead.documents.filter((doc) => doc.status === "provided").length
    const pendingDocs = lead.documents.filter((doc) => doc.status === "pending").length

    if (verifiedDocs === totalDocs) return "Document Complete"
    if (providedDocs + verifiedDocs === totalDocs) return "Under Review"
    return `${pendingDocs} Pending`
  }

  const getLeadTimeline = (lead: Lead) => {
    const timeline = [
      {
        stage: "Lead Created",
        date: lead.createdAt,
        status: "completed",
        icon: Plus,
      },
      {
        stage: "Documents Submitted",
        date: lead.documentsSubmittedAt || null,
        status: lead.documents?.some((doc) => doc.status !== "pending") ? "completed" : "pending",
        icon: FileText,
      },
      {
        stage: "Bank Assignment",
        date: lead.bankAssignedAt || null,
        status: lead.selectedBank ? "completed" : "pending",
        icon: Building2,
      },
      {
        stage: "Application Status",
        date: lead.statusUpdatedAt || null,
        status: lead.applicationStatus === "pending" ? "pending" : "completed",
        icon: CheckCircle,
      },
    ]
    return timeline
  }

  const PipelineView = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 max-w-7xl w-full max-h-[95vh] overflow-y-auto border border-white/20 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-white">Detailed Pipeline View</h2>
          <Button onClick={() => setShowPipelineView(false)} variant="ghost" className="text-white hover:bg-white/10">
            <XCircle className="h-6 w-6" />
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {["login", "pending", "sanctioned", "rejected"].map((status) => {
            const statusLeads = leads.filter((lead) => lead.applicationStatus === status)
            const statusConfig = {
              login: { color: "blue", icon: Clock, label: "Login" },
              pending: { color: "orange", icon: AlertCircle, label: "Pending" },
              sanctioned: { color: "green", icon: CheckCircle, label: "Sanctioned" },
              rejected: { color: "red", icon: XCircle, label: "Rejected" },
            }[status]

            return (
              <div key={status} className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <statusConfig.icon className={`h-5 w-5 text-${statusConfig.color}-400`} />
                  <h3 className="text-xl font-semibold text-white">{statusConfig.label}</h3>
                  <Badge
                    className={`bg-${statusConfig.color}-500/20 text-${statusConfig.color}-300 border-${statusConfig.color}-400/30`}
                  >
                    {statusLeads.length}
                  </Badge>
                </div>

                <div className="space-y-3 max-h-[70vh] overflow-y-auto">
                  {statusLeads.map((lead) => (
                    <Card
                      key={lead.id}
                      className="backdrop-blur-xl bg-white/10 border-white/20 hover:bg-white/15 transition-all duration-300 cursor-pointer"
                      onClick={() => setSelectedLead(lead)}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-white text-sm">{lead.leadName || lead.clientName}</h4>
                          <div className="flex items-center gap-2 text-xs text-gray-300">
                            <Phone className="h-3 w-3" />
                            {lead.contactNumber}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-300">
                            <Briefcase className="h-3 w-3" />
                            {lead.leadType}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-300">
                            <User className="h-3 w-3" />
                            {lead.assignedStaff || "Unassigned"}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-300">
                            <Building2 className="h-3 w-3" />
                            {lead.selectedBank || "No Bank"}
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              getDocumentCompletionStatus(lead) === "Document Complete"
                                ? "bg-green-500/20 text-green-300 border-green-400/30"
                                : "bg-orange-500/20 text-orange-300 border-orange-400/30"
                            }`}
                          >
                            {getDocumentCompletionStatus(lead)}
                          </Badge>
                          <div className="text-xs text-gray-400">
                            Created: {new Date(lead.createdAt).toLocaleDateString()}
                          </div>
                          {lead.statusUpdatedAt && (
                            <div className="text-xs text-gray-400">
                              Updated: {new Date(lead.statusUpdatedAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )

  const LeadDetailView = ({ lead }: { lead: Lead }) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 max-w-4xl w-full max-h-[95vh] overflow-y-auto border border-white/20 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">{lead.leadName || lead.clientName}</h2>
          <Button onClick={() => setSelectedLead(null)} variant="ghost" className="text-white hover:bg-white/10">
            <XCircle className="h-6 w-6" />
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Lead Information */}
          <div className="space-y-6">
            <Card className="backdrop-blur-xl bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Lead Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-white">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-300" />
                  <span className="text-sm">Client: {lead.clientName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-green-300" />
                  <span className="text-sm">Phone: {lead.contactNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-purple-300" />
                  <span className="text-sm">Email: {lead.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-orange-300" />
                  <span className="text-sm">Product: {lead.leadType}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-yellow-300" />
                  <span className="text-sm">CIBIL: {lead.cibilScore}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-red-300" />
                  <span className="text-sm">Address: {lead.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-indigo-300" />
                  <span className="text-sm">Bank: {lead.selectedBank || "Not assigned"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-teal-300" />
                  <span className="text-sm">Staff: {lead.assignedStaff || "Unassigned"}</span>
                </div>
              </CardContent>
            </Card>

            {/* Document Status */}
            <Card className="backdrop-blur-xl bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Document Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {lead.documents && lead.documents.length > 0 ? (
                  <div className="space-y-3">
                    {lead.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              doc.status === "verified"
                                ? "bg-green-500"
                                : doc.status === "provided"
                                  ? "bg-orange-500"
                                  : "bg-red-500"
                            }`}
                          ></div>
                          <span className="text-white text-sm">{doc.type}</span>
                        </div>
                        <Badge
                          className={`${
                            doc.status === "verified"
                              ? "bg-green-500/20 text-green-300 border-green-400/30"
                              : doc.status === "provided"
                                ? "bg-orange-500/20 text-orange-300 border-orange-400/30"
                                : "bg-red-500/20 text-red-300 border-red-400/30"
                          }`}
                        >
                          {doc.status}
                        </Badge>
                      </div>
                    ))}
                    <div className="mt-4 p-3 rounded-lg bg-white/5">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium">Overall Status:</span>
                        <Badge
                          className={`${
                            getDocumentCompletionStatus(lead) === "Document Complete"
                              ? "bg-green-500/20 text-green-300 border-green-400/30"
                              : "bg-orange-500/20 text-orange-300 border-orange-400/30"
                          }`}
                        >
                          {getDocumentCompletionStatus(lead)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-4">No documents uploaded</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Timeline */}
          <div className="space-y-6">
            <Card className="backdrop-blur-xl bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Lead Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getLeadTimeline(lead).map((item, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div
                        className={`p-2 rounded-full ${
                          item.status === "completed"
                            ? "bg-green-500/20 text-green-300"
                            : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-medium text-sm">{item.stage}</h4>
                        <p className="text-gray-400 text-xs">
                          {item.date ? new Date(item.date).toLocaleString() : "Pending"}
                        </p>
                      </div>
                      <Badge
                        className={`${
                          item.status === "completed"
                            ? "bg-green-500/20 text-green-300 border-green-400/30"
                            : "bg-gray-500/20 text-gray-400 border-gray-400/30"
                        }`}
                      >
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="backdrop-blur-xl bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => {
                    setSelectedLead(lead) // Ensure selectedLead is set
                    setEditFormData({
                      clientName: lead.clientName,
                      contactNumber: lead.contactNumber,
                      email: lead.email,
                      leadType: lead.leadType,
                      annualIncome: lead.annualIncome,
                      loanAmount: lead.loanAmount,
                      address: lead.address,
                      purpose: lead.purpose,
                      notes: lead.notes,
                    })
                    setShowEditDialog(true)
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Lead Details
                </Button>
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => setShowDocumentDialog(true)}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Manage Documents
                </Button>
                <Button
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={() => setShowReassignDialog(true)}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Reassign Staff
                </Button>
                <Button
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                  onClick={() => setShowBankDialog(true)}
                >
                  <Building2 className="mr-2 h-4 w-4" />
                  Change Bank
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )

  const LeadCard = ({ lead }: { lead: Lead }) => (
    <Card className="backdrop-blur-xl bg-white/10 border-white/20 hover:bg-white/15 transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-white">{lead.clientName}</h3>
              <Badge className={`${getStatusColor(lead.applicationStatus)} text-white border-0`}>
                {lead.applicationStatus}
              </Badge>
              {lead.assignedStaff && lead.isVisibleToStaff ? (
                <Badge className="bg-green-500/20 text-green-300 border-green-400/30">Assigned & Visible</Badge>
              ) : lead.assignedStaff && !lead.isVisibleToStaff ? (
                <Badge className="bg-orange-500/20 text-orange-300 border-orange-400/30">Assigned (Pending)</Badge>
              ) : (
                <Badge className="bg-red-500/20 text-red-300 border-red-400/30">Unassigned</Badge>
              )}
              {lead.createdByStaff && (
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30">Staff Created</Badge>
              )}
            </div>
            <div className="space-y-1 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>{lead.contactNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{lead.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                <span>{lead.leadType}</span>
              </div>
              {lead.selectedBank && (
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  <span>{lead.selectedBank}</span>
                </div>
              )}
              {lead.assignedStaff && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Assigned to: {lead.assignedStaff}</span>
                </div>
              )}
              {lead.ownerManagerAssignment && (
                <div className="flex items-center gap-2 text-blue-300">
                  <UserPlus className="h-4 w-4" />
                  <span>Assigned by: {lead.ownerManagerAssignment}</span>
                </div>
              )}
              {lead.assignedAt && (
                <div className="flex items-center gap-2 text-gray-300 text-sm">
                  <Calendar className="h-4 w-4" />
                  <span>Assigned: {new Date(lead.assignedAt).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              size="sm"
              onClick={() => {
                setSelectedLead(lead)
                setEditFormData({
                  clientName: lead.clientName,
                  contactNumber: lead.contactNumber,
                  email: lead.email,
                  leadType: lead.leadType,
                  annualIncome: lead.annualIncome,
                  loanAmount: lead.loanAmount,
                  address: lead.address,
                  purpose: lead.purpose,
                  notes: lead.notes,
                })
                setShowEditDialog(true)
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Eye className="h-4 w-4 mr-1" />
              View/Edit
            </Button>
            {lead.selectedBank && lead.assignedStaff && lead.isVisibleToStaff && (
              <Button
                size="sm"
                onClick={() => {
                  setSelectedLead(lead)
                  setShowFileTracker(true)
                }}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <FileText className="h-4 w-4 mr-1" />
                File Status
              </Button>
            )}
            {[`owner`, `manager`, `branch_head`].includes(user?.role || "") &&
              (!lead.assignedStaff || !lead.isVisibleToStaff) && (
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedLead(lead)
                    setShowAssignDialog(true)
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <UserPlus className="h-4 w-4 mr-1" />
                  Assign & Select Bank
                </Button>
              )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const getStaffMembers = () => {
    return staff
  }

  const documentTypes = ["Aadhar Card", "PAN Card", "Salary Slips", "Bank Statements"]

  if (!user || user.type !== "official" || !branch) {
    return <div>Loading...</div>
  }

  const handleEditLead = () => {
    if (!selectedLead || !user) return

    const changes = []
    if (editFormData.clientName !== selectedLead.clientName) changes.push("Client Name")
    if (editFormData.contactNumber !== selectedLead.contactNumber) changes.push("Contact Number")
    if (editFormData.email !== selectedLead.email) changes.push("Email")
    if (editFormData.leadType !== selectedLead.leadType) changes.push("Lead Type")
    if (editFormData.annualIncome !== selectedLead.annualIncome) changes.push("Annual Income")
    if (editFormData.loanAmount !== selectedLead.loanAmount) changes.push("Loan Amount")
    if (editFormData.address !== selectedLead.address) changes.push("Address")
    if (editFormData.purpose !== selectedLead.purpose) changes.push("Purpose")
    if (editFormData.notes !== selectedLead.notes) changes.push("Notes")

    const updatedLead = {
      ...selectedLead,
      ...editFormData,
      editHistory: [
        ...(selectedLead.editHistory || []),
        {
          editedBy: user.name,
          editedAt: new Date().toISOString(),
          changes: changes.length > 0 ? changes : ["General Update"],
        },
      ],
      statusUpdatedAt: new Date().toISOString(), // Update statusUpdatedAt on any edit
    }

    const success = updateLead(updatedLead.id, updatedLead)
    if (success) {
      setLeads(getLeads(branchId)) // Refresh leads
      setShowEditDialog(false)
      setSelectedLead(null)
      setEditFormData({})
    } else {
      // Handle error if updateLead fails
      console.error("Failed to update lead")
    }
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
              <p className="text-black font-medium">Full Pipeline View by Loan Type • {leads.length} Total Leads</p>
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
                <span className="text-black font-semibold block">{user.name}</span>
                <span className="text-gray-700/70 text-sm">{user.role} Access</span>
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

      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Assign Lead to Staff & Select Bank</DialogTitle>
            <DialogDescription className="text-gray-300">
              Assign {selectedLead?.clientName} to a staff member and select a bank. Document management will be
              available after assignment.
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
              <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Choose staff member" />
                </SelectTrigger>
                <SelectContent>
                  {staff.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name} - {member.designation}
                      {member.isCustom && <Badge className="ml-2 bg-blue-500 text-white">Custom</Badge>}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="bank" className="text-white">
                  Select Bank (Required for Document Management)
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
                value={selectedBank}
                onValueChange={(value) => {
                  if (value === "Add Custom Bank...") {
                    setShowCustomBankDialog(true)
                  } else {
                    setSelectedBank(value)
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
                      {customBanks.includes(bank) && <Badge className="ml-2 bg-green-500 text-white">Custom</Badge>}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/30">
              <h4 className="text-white font-medium mb-2">Assignment Summary</h4>
              <div className="space-y-2 text-sm text-gray-300">
                <div>
                  Lead: <span className="text-white">{selectedLead?.clientName}</span>
                </div>
                <div>
                  Product: <span className="text-white">{selectedLead?.leadType}</span>
                </div>
                <div>
                  Branch: <span className="text-white">{branch?.name}</span>
                </div>
                <div>
                  Staff:{" "}
                  <span className="text-white">
                    {staff.find((s) => s.id === selectedStaffId)?.name || "Not selected"}
                  </span>
                </div>
                <div>
                  Bank: <span className="text-white">{selectedBank || "Not selected"}</span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleAssignLead}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600"
              disabled={!selectedStaffId || !selectedBank}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Assign Lead & Make Visible to Staff
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCustomBankDialog} onOpenChange={setShowCustomBankDialog}>
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
                  setShowCustomBankDialog(false)
                  setNewCustomBank("")
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

      <Dialog open={showCustomStaffDialog} onOpenChange={setShowCustomStaffDialog}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Add Custom Staff Member</DialogTitle>
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
                  onChange={(e) => setNewCustomStaff((prev) => ({ ...prev, name: e.target.value }))}
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
                  onChange={(e) => setNewCustomStaff((prev) => ({ ...prev, designation: e.target.value }))}
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
                  onChange={(e) => setNewCustomStaff((prev) => ({ ...prev, contact: e.target.value }))}
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
                  onChange={(e) => setNewCustomStaff((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAddCustomStaff}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={!newCustomStaff.name.trim() || !newCustomStaff.designation.trim()}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Add Staff Member
              </Button>
              <Button
                onClick={() => {
                  setShowCustomStaffDialog(false)
                  setNewCustomStaff({ name: "", designation: "", contact: "", email: "" })
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
      {showPipelineView && <PipelineView />}
      {selectedLead && !showFileTracker && <LeadDetailView lead={selectedLead} />}
      {selectedLead && showFileTracker && selectedLead.selectedBank && selectedLead.assignedStaff && (
        <FileStatusTracker
          lead={selectedLead}
          onClose={() => {
            setShowFileTracker(false)
            setSelectedLead(null)
          }}
          onUpdate={(leadId, updates) => {
            updateLead(leadId, updates)
          }}
        />
      )}

      {/* Reassign Staff Dialog */}
      {showReassignDialog && selectedLead && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Reassign Staff</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select Staff Member</label>
                <select
                  value={selectedStaffForReassign}
                  onChange={(e) => setSelectedStaffForReassign(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select staff member...</option>
                  {getStaffMembers().map((staff) => (
                    <option key={staff.id} value={staff.name}>
                      {staff.name} - {staff.designation}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    if (selectedStaffForReassign && selectedLead) {
                      const updatedLeads = leads.map((lead) =>
                        lead.id === selectedLead.id ? { ...lead, assignedStaff: selectedStaffForReassign } : lead,
                      )
                      setLeads(updatedLeads)
                      setSelectedStaffForReassign("")
                      setShowReassignDialog(false)
                    }
                  }}
                  className="flex-1"
                >
                  Reassign
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowReassignDialog(false)
                    setSelectedStaffForReassign("")
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

      {/* Change Bank Dialog */}
      {showBankDialog && selectedLead && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Change Bank</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select Bank</label>
                <select
                  value={selectedBankForChange}
                  onChange={(e) => {
                    if (e.target.value === "add-custom") {
                      setShowCustomBankDialogInChange(true)
                    } else {
                      setSelectedBankForChange(e.target.value)
                    }
                  }}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select bank...</option>
                  <option value="State Bank of India">State Bank of India</option>
                  <option value="HDFC Bank">HDFC Bank</option>
                  <option value="ICICI Bank">ICICI Bank</option>
                  <option value="Axis Bank">Axis Bank</option>
                  <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                  <option value="Punjab National Bank">Punjab National Bank</option>
                  {customBanks.map((bank) => (
                    <option key={bank} value={bank}>
                      {bank} (Custom)
                    </option>
                  ))}
                  <option value="add-custom">+ Add Custom Bank</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    if (selectedBankForChange && selectedLead) {
                      const updatedLeads = leads.map((lead) =>
                        lead.id === selectedLead.id ? { ...lead, selectedBank: selectedBankForChange } : lead,
                      )
                      setLeads(updatedLeads)
                      setSelectedBankForChange("")
                      setShowBankDialog(false)
                    }
                  }}
                  className="flex-1"
                >
                  Change Bank
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowBankDialog(false)
                    setSelectedBankForChange("")
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

      {showCustomBankDialogInChange && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Add Custom Bank</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Bank Name</label>
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
                      const newBank = newCustomBankName.trim()
                      setCustomBanks((prev) => [...prev, newBank])
                      setSelectedBankForChange(newBank)
                      setNewCustomBankName("")
                      setShowCustomBankDialogInChange(false)
                    }
                  }}
                  className="flex-1"
                >
                  Add Bank
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCustomBankDialogInChange(false)
                    setNewCustomBankName("")
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

      {/* Document Management Dialog */}
      {showDocumentDialog && selectedLead && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Manage Documents</h3>
            <div className="space-y-4">
              {documentTypes.map((docType) => {
                const existingDoc = selectedLead.documents?.find((d) => d.type === docType)
                return (
                  <div key={docType} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">{docType}</span>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={
                          existingDoc?.status === "verified"
                            ? "bg-green-100 text-green-800"
                            : existingDoc?.status === "provided"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-red-100 text-red-800"
                        }
                      >
                        {existingDoc?.status || "pending"}
                      </Badge>
                      <Button size="sm" variant="outline">
                        {existingDoc ? "Update" : "Upload"}
                      </Button>
                    </div>
                  </div>
                )
              })}
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setShowDocumentDialog(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Lead Dialog */}
      {showEditDialog && selectedLead && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Edit Lead Details</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Client Name</label>
                  <input
                    type="text"
                    value={editFormData.clientName || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, clientName: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Contact Number</label>
                  <input
                    type="text"
                    value={editFormData.contactNumber || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, contactNumber: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={editFormData.email || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Lead Type</label>
                  <select
                    value={editFormData.leadType || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, leadType: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select lead type...</option>
                    <option value="Home Loan">Home Loan</option>
                    <option value="Personal Loan">Personal Loan</option>
                    <option value="Business Loan">Business Loan</option>
                    <option value="Car Loan">Car Loan</option>
                    <option value="Education Loan">Education Loan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Annual Income</label>
                  <input
                    type="text"
                    value={editFormData.annualIncome || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, annualIncome: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Loan Amount</label>
                  <input
                    type="text"
                    value={editFormData.loanAmount || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, loanAmount: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Address</label>
                <textarea
                  value={editFormData.address || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  className="w-full p-2 border rounded-md"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Purpose</label>
                <input
                  type="text"
                  value={editFormData.purpose || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, purpose: e.target.value })}
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Notes</label>
                <textarea
                  value={editFormData.notes || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                  className="w-full p-2 border rounded-md"
                  rows={3}
                />
              </div>

              {/* Edit History */}
              {selectedLead.editHistory && selectedLead.editHistory.length > 0 && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Edit History</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {selectedLead.editHistory.map((edit, index) => (
                      <div key={index} className="text-sm text-gray-600">
                        <span className="font-medium">{edit.editedBy}</span> edited on{" "}
                        {new Date(edit.editedAt).toLocaleDateString()} at {new Date(edit.editedAt).toLocaleTimeString()}
                        {edit.changes && (
                          <div className="text-xs text-gray-500 ml-2">Changes: {edit.changes.join(", ")}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <Button onClick={handleEditLead} className="bg-blue-600 hover:bg-blue-700 text-white">
                Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditDialog(false)
                  setEditFormData({})
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-teal-700 bg-clip-text text-transparent">
              Lead Pipeline by Loan Type
            </h2>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowPipelineView(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              >
                <Target className="mr-2 h-4 w-4" />
                Detailed Pipeline View
              </Button>

              <Button
                onClick={() => router.push(`/dashboard/leads/${branchId}/add`)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Lead
              </Button>
            </div>
          </div>

          {(() => {
            const leadsByType = filteredLeads.reduce(
              (acc, lead) => {
                const type = lead.leadType || "Other"
                if (!acc[type]) acc[type] = []
                acc[type].push(lead)
                return acc
              },
              {} as Record<string, Lead[]>,
            )

            return (
              <div className="space-y-8">
                {Object.entries(leadsByType).map(([loanType, typeLeads]) => (
                  <Card key={loanType} className="backdrop-blur-xl bg-white/70 border-slate-200/50 shadow-xl">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl text-slate-800 flex items-center gap-2">
                          <Briefcase className="h-5 w-5 text-teal-600" />
                          {loanType} ({typeLeads.length} leads)
                        </CardTitle>
                        <div className="flex gap-2">
                          <Badge className="bg-blue-500 text-white">
                            New: {typeLeads.filter((l) => !l.assignedStaff).length}
                          </Badge>
                          <Badge className="bg-green-500 text-white">
                            Sanctioned: {typeLeads.filter((l) => l.applicationStatus === "sanctioned").length}
                          </Badge>
                          <Badge className="bg-red-500 text-white">
                            Rejected: {typeLeads.filter((l) => l.applicationStatus === "rejected").length}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                        {/* New Leads Column */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                            <AlertCircle className="h-4 w-4 text-orange-600" />
                            <h4 className="font-semibold text-orange-800">New Leads</h4>
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
                                    setSelectedLead(lead)
                                    setEditFormData({
                                      clientName: lead.clientName,
                                      contactNumber: lead.contactNumber,
                                      email: lead.email,
                                      leadType: lead.leadType,
                                      annualIncome: lead.annualIncome,
                                      loanAmount: lead.loanAmount,
                                      address: lead.address,
                                      purpose: lead.purpose,
                                      notes: lead.notes,
                                    })
                                    setShowEditDialog(true)
                                  }}
                                >
                                  <div className="space-y-1">
                                    <h5 className="font-medium text-sm text-gray-900">{lead.clientName}</h5>
                                    <p className="text-xs text-gray-600">{lead.contactNumber}</p>
                                    <div className="flex items-center gap-1">
                                      <Badge variant="outline" className="text-xs">
                                        {lead.leadSource === "staff_created"
                                          ? "Staff Created"
                                          : lead.leadSource === "owner_created"
                                            ? "Owner Created"
                                            : lead.leadSource || "Unknown"}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                      {new Date(lead.createdAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                </Card>
                              ))}
                          </div>
                        </div>

                        {/* Assigned Leads Column */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <User className="h-4 w-4 text-blue-600" />
                            <h4 className="font-semibold text-blue-800">Assigned Leads</h4>
                            <Badge className="bg-blue-500 text-white">
                              {typeLeads.filter((l) => l.assignedStaff && l.applicationStatus === "pending").length}
                            </Badge>
                          </div>
                          <div className="space-y-2 max-h-96 overflow-y-auto">
                            {typeLeads
                              .filter((l) => l.assignedStaff && l.applicationStatus === "pending")
                              .map((lead) => (
                                <Card
                                  key={lead.id}
                                  className="p-3 bg-white border border-blue-200 hover:shadow-md transition-shadow cursor-pointer"
                                  onClick={() => {
                                    setSelectedLead(lead)
                                    setEditFormData({
                                      clientName: lead.clientName,
                                      contactNumber: lead.contactNumber,
                                      email: lead.email,
                                      leadType: lead.leadType,
                                      annualIncome: lead.annualIncome,
                                      loanAmount: lead.loanAmount,
                                      address: lead.address,
                                      purpose: lead.purpose,
                                      notes: lead.notes,
                                    })
                                    setShowEditDialog(true)
                                  }}
                                >
                                  <div className="space-y-1">
                                    <h5 className="font-medium text-sm text-gray-900">{lead.clientName}</h5>
                                    <p className="text-xs text-gray-600">{lead.contactNumber}</p>
                                    <div className="flex items-center gap-1">
                                      <Badge variant="outline" className="text-xs">
                                        {lead.assignedStaff}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-gray-500">Bank: {lead.selectedBank || "Not assigned"}</p>
                                  </div>
                                </Card>
                              ))}
                          </div>
                        </div>

                        {/* Processing Column */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <Clock className="h-4 w-4 text-yellow-600" />
                            <h4 className="font-semibold text-yellow-800">Processing</h4>
                            <Badge className="bg-yellow-500 text-white">
                              {
                                typeLeads.filter(
                                  (l) =>
                                    l.applicationStatus === "login" ||
                                    (l.applicationStatus === "pending" && l.selectedBank),
                                ).length
                              }
                            </Badge>
                          </div>
                          <div className="space-y-2 max-h-96 overflow-y-auto">
                            {typeLeads
                              .filter(
                                (l) =>
                                  l.applicationStatus === "login" ||
                                  (l.applicationStatus === "pending" && l.selectedBank),
                              )
                              .map((lead) => (
                                <Card
                                  key={lead.id}
                                  className="p-3 bg-white border border-yellow-200 hover:shadow-md transition-shadow cursor-pointer"
                                  onClick={() => {
                                    setSelectedLead(lead)
                                    setEditFormData({
                                      clientName: lead.clientName,
                                      contactNumber: lead.contactNumber,
                                      email: lead.email,
                                      leadType: lead.leadType,
                                      annualIncome: lead.annualIncome,
                                      loanAmount: lead.loanAmount,
                                      address: lead.address,
                                      purpose: lead.purpose,
                                      notes: lead.notes,
                                    })
                                    setShowEditDialog(true)
                                  }}
                                >
                                  <div className="space-y-1">
                                    <h5 className="font-medium text-sm text-gray-900">{lead.clientName}</h5>
                                    <p className="text-xs text-gray-600">{lead.contactNumber}</p>
                                    <div className="flex items-center gap-1">
                                      <Badge variant="outline" className="text-xs">
                                        {lead.selectedBank}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-gray-500">Status: {lead.applicationStatus}</p>
                                  </div>
                                </Card>
                              ))}
                          </div>
                        </div>

                        {/* Sanctioned Column */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <h4 className="font-semibold text-green-800">Sanctioned</h4>
                            <Badge className="bg-green-500 text-white">
                              {typeLeads.filter((l) => l.applicationStatus === "sanctioned").length}
                            </Badge>
                          </div>
                          <div className="space-y-2 max-h-96 overflow-y-auto">
                            {typeLeads
                              .filter((l) => l.applicationStatus === "sanctioned")
                              .map((lead) => (
                                <Card
                                  key={lead.id}
                                  className="p-3 bg-white border border-green-200 hover:shadow-md transition-shadow cursor-pointer"
                                  onClick={() => {
                                    setSelectedLead(lead)
                                    setEditFormData({
                                      clientName: lead.clientName,
                                      contactNumber: lead.contactNumber,
                                      email: lead.email,
                                      leadType: lead.leadType,
                                      annualIncome: lead.annualIncome,
                                      loanAmount: lead.loanAmount,
                                      address: lead.address,
                                      purpose: lead.purpose,
                                      notes: lead.notes,
                                    })
                                    setShowEditDialog(true)
                                  }}
                                >
                                  <div className="space-y-1">
                                    <h5 className="font-medium text-sm text-gray-900">{lead.clientName}</h5>
                                    <p className="text-xs text-gray-600">{lead.contactNumber}</p>
                                    <div className="flex items-center gap-1">
                                      <Badge variant="outline" className="text-xs">
                                        {lead.selectedBank}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-green-600 font-medium">✓ Sanctioned</p>
                                  </div>
                                </Card>
                              ))}
                          </div>
                        </div>

                        {/* Rejected Column */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
                            <XCircle className="h-4 w-4 text-red-600" />
                            <h4 className="font-semibold text-red-800">Rejected</h4>
                            <Badge className="bg-red-500 text-white">
                              {typeLeads.filter((l) => l.applicationStatus === "rejected").length}
                            </Badge>
                          </div>
                          <div className="space-y-2 max-h-96 overflow-y-auto">
                            {typeLeads
                              .filter((l) => l.applicationStatus === "rejected")
                              .map((lead) => (
                                <Card
                                  key={lead.id}
                                  className="p-3 bg-white border border-red-200 hover:shadow-md transition-shadow cursor-pointer"
                                  onClick={() => {
                                    setSelectedLead(lead)
                                    setEditFormData({
                                      clientName: lead.clientName,
                                      contactNumber: lead.contactNumber,
                                      email: lead.email,
                                      leadType: lead.leadType,
                                      annualIncome: lead.annualIncome,
                                      loanAmount: lead.loanAmount,
                                      address: lead.address,
                                      purpose: lead.purpose,
                                      notes: lead.notes,
                                    })
                                    setShowEditDialog(true)
                                  }}
                                >
                                  <div className="space-y-1">
                                    <h5 className="font-medium text-sm text-gray-900">{lead.clientName}</h5>
                                    <p className="text-xs text-gray-600">{lead.contactNumber}</p>
                                    <div className="flex items-center gap-1">
                                      <Badge variant="outline" className="text-xs">
                                        {lead.selectedBank}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-red-600 font-medium">✗ Rejected</p>
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
            )
          })()}
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-10">
          <Card className="backdrop-blur-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-400/30 hover:from-blue-500/30 hover:to-cyan-500/30 transition-all duration-300 transform hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">Login</CardTitle>
              <div className="w-4 h-4 rounded-full bg-blue-500 animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{loginLeads.length}</div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-gradient-to-br from-orange-500/20 to-yellow-500/20 border-orange-400/30 hover:from-orange-500/30 hover:to-yellow-500/30 transition-all duration-300 transform hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-100">Pending</CardTitle>
              <div className="w-4 h-4 rounded-full bg-orange-500 animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{pendingLeads.length}</div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-400/30 hover:from-green-500/30 hover:to-emerald-500/30 transition-all duration-300 transform hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-100">Sanctioned</CardTitle>
              <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{sanctionedLeads.length}</div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-gradient-to-br from-red-500/20 to-pink-500/20 border-red-400/30 hover:from-red-500/30 hover:to-pink-500/30 transition-all duration-300 transform hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-100">Rejected</CardTitle>
              <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{rejectedLeads.length}</div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 border-purple-400/30 hover:from-purple-500/30 hover:to-violet-500/30 transition-all duration-300 transform hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-100">Assigned</CardTitle>
              <Users className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{assignedLeads.length}</div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-gradient-to-br from-gray-500/20 to-slate-500/20 border-gray-400/30 hover:from-gray-500/30 hover:to-slate-500/30 transition-all duration-300 transform hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-100">Unassigned</CardTitle>
              <AlertCircle className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{unassignedLeads.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Filters */}
        <Card className="backdrop-blur-xl bg-white/10 border-white/20 mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="sanctioned">Sanctioned</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={assignmentFilter} onValueChange={setAssignmentFilter}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Leads</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-white/10 border-white/20 text-white"
              />
              <Button
                onClick={() => router.push(`/dashboard/leads/${branchId}/add`)}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Lead
              </Button>
              <Button
                variant="outline"
                onClick={exportToCSV}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lead List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredLeads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </div>

        {filteredLeads.length === 0 && (
          <Card className="backdrop-blur-xl bg-white/10 border-white/20">
            <CardContent className="p-12 text-center">
              <TrendingUp className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No leads found</h3>
              <p className="text-gray-300 mb-6">
                {searchTerm || statusFilter !== "all" || assignmentFilter !== "all"
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
  )
}
