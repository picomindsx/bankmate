"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, TrendingUp, Bell, Upload, FileText, Calendar } from "lucide-react"
import { addLead, getBranches, getStaff } from "@/lib/auth"
import Image from "next/image"
import Link from "next/link"
import { DocumentManager } from "@/components/document-requirements"

interface DocumentStatus {
  type: string
  status: "Pending" | "Provided" | "Verified"
  files: File[]
  additionalFiles: File[]
  notes: string
}

export default function AddLeadPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const params = useParams()
  const branchId = params.branchId as string

  const [formData, setFormData] = useState({
    // Basic Lead Information
    leadName: "",
    clientName: "",
    contactNumber: "",
    email: "",
    dateOfBirth: "",
    address: "",

    // Lead Details
    leadType: "", // Product Type (Home Loan, Personal Loan, etc.)
    leadSource: "", // Social Media, Walk-in, etc.
    assignedBranch: branchId,
    assignedStaff: "",
    ownerManagerAssignment: "",

    // Financial Information
    cost: "",
    cibilScore: "",

    // Application Status
    applicationStatus: "Login" as "Login" | "Pending" | "Sanctioned" | "Rejected",

    // Bank Assignment
    selectedBank: "",
    bankBranch: "",
    bankStaff: "",

    // Additional Information
    additionalInfo: "",
    remarks: "",
  })

  const [customInputs, setCustomInputs] = useState({
    leadSource: "",
    leadType: "",
    selectedBank: "",
    assignedStaff: "",
    ownerManagerAssignment: "",
  })

  const [showCustomInput, setShowCustomInput] = useState({
    leadSource: false,
    leadType: false,
    selectedBank: false,
    assignedStaff: false,
    ownerManagerAssignment: false,
  })

  const [bankDocuments, setBankDocuments] = useState<File[]>([])
  const [loanDocuments, setLoanDocuments] = useState<any[]>([])
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const branches = getBranches()
  const branch = branches.find((b) => b.id === branchId)
  const staff = getStaff()

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

  const productTypes = [
    "Home Loan",
    "Personal Loan",
    "Business Loan",
    "Car Loan",
    "Education Loan",
    "Credit Card",
    "Insurance",
    "Investment Products",
  ]

  const leadSources = [
    "Social Media",
    "Facebook",
    "Instagram",
    "Google Ads",
    "Walk-in",
    "Referral",
    "Website",
    "Cold Call",
    "Email Campaign",
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Login":
        return "bg-blue-500"
      case "Pending":
        return "bg-orange-500"
      case "Sanctioned":
        return "bg-green-500"
      case "Rejected":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      if (!formData.leadName || !formData.clientName || !formData.contactNumber || !formData.leadType) {
        setError("Please fill in all required fields")
        return
      }

      const newLead = addLead({
        ...formData,
        cost: Number.parseFloat(formData.cost) || 0,
        cibilScore: Number.parseInt(formData.cibilScore) || 0,
        branchId,
        documents: loanDocuments, // Use loan-specific documents instead of generic ones
        bankDocuments: bankDocuments,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      setSuccess("Lead created successfully with loan-specific document tracking!")
      setTimeout(() => {
        router.push(`/dashboard/leads/${branchId}`)
      }, 2000)
    } catch (err) {
      setError("Failed to create lead. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCustomSelection = (field: string, value: string) => {
    if (value === "custom") {
      setShowCustomInput((prev) => ({ ...prev, [field]: true }))
    } else {
      setShowCustomInput((prev) => ({ ...prev, [field]: false }))
      handleInputChange(field, value)
    }
  }

  const handleCustomInputSubmit = (field: string) => {
    const customValue = customInputs[field as keyof typeof customInputs]
    if (customValue.trim()) {
      handleInputChange(field, customValue)
      setShowCustomInput((prev) => ({ ...prev, [field]: false }))
      setCustomInputs((prev) => ({ ...prev, [field]: "" }))
    }
  }

  if (!user || user.type !== "official" || !branch) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/leads/${branchId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Leads
              </Button>
            </Link>
            <Image
              src="/images/bankmate-logo.png"
              alt="Bankmate Solutions Logo"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <div>
              <h1 className="text-xl font-semibold">Create New Lead - {branch.name}</h1>
              <p className="text-sm text-muted-foreground">Comprehensive lead creation with document tracking</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
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

      <div className="p-6 max-w-6xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 1. New Lead Creation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                1️⃣ New Lead Creation
              </CardTitle>
              <CardDescription>Basic lead information and assignment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="leadName">Lead Name *</Label>
                  <Input
                    id="leadName"
                    type="text"
                    placeholder="Enter lead name/reference"
                    value={formData.leadName}
                    onChange={(e) => handleInputChange("leadName", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactNumber">Contact Number *</Label>
                  <Input
                    id="contactNumber"
                    type="tel"
                    placeholder="Enter contact number"
                    value={formData.contactNumber}
                    onChange={(e) => handleInputChange("contactNumber", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="leadSource">Source *</Label>
                  {showCustomInput.leadSource ? (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter custom lead source"
                        value={customInputs.leadSource}
                        onChange={(e) => setCustomInputs((prev) => ({ ...prev, leadSource: e.target.value }))}
                      />
                      <Button type="button" onClick={() => handleCustomInputSubmit("leadSource")} size="sm">
                        Add
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowCustomInput((prev) => ({ ...prev, leadSource: false }))}
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <select
                      id="leadSource"
                      value={formData.leadSource}
                      onChange={(e) => handleCustomSelection("leadSource", e.target.value)}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                      required
                    >
                      <option value="">Select lead source</option>
                      {leadSources.map((source) => (
                        <option key={source} value={source}>
                          {source}
                        </option>
                      ))}
                      <option value="custom">+ Add Custom Source</option>
                    </select>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="leadType">Product Type *</Label>
                  {showCustomInput.leadType ? (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter custom product type"
                        value={customInputs.leadType}
                        onChange={(e) => setCustomInputs((prev) => ({ ...prev, leadType: e.target.value }))}
                      />
                      <Button type="button" onClick={() => handleCustomInputSubmit("leadType")} size="sm">
                        Add
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowCustomInput((prev) => ({ ...prev, leadType: false }))}
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <select
                      id="leadType"
                      value={formData.leadType}
                      onChange={(e) => handleCustomSelection("leadType", e.target.value)}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                      required
                    >
                      <option value="">Select product type</option>
                      {productTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                      <option value="custom">+ Add Custom Product Type</option>
                    </select>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="assignedStaff">Assigned Staff</Label>
                  {showCustomInput.assignedStaff ? (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter custom staff member"
                        value={customInputs.assignedStaff}
                        onChange={(e) => setCustomInputs((prev) => ({ ...prev, assignedStaff: e.target.value }))}
                      />
                      <Button type="button" onClick={() => handleCustomInputSubmit("assignedStaff")} size="sm">
                        Add
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowCustomInput((prev) => ({ ...prev, assignedStaff: false }))}
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <select
                      id="assignedStaff"
                      value={formData.assignedStaff}
                      onChange={(e) => handleCustomSelection("assignedStaff", e.target.value)}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                    >
                      <option value="">Select staff member</option>
                      {staff.map((member) => (
                        <option key={member.id} value={member.name}>
                          {member.name} - {member.designation}
                        </option>
                      ))}
                      <option value="custom">+ Add Custom Staff Member</option>
                    </select>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ownerManagerAssignment">Owner/Manager Assignment</Label>
                  {showCustomInput.ownerManagerAssignment ? (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter custom owner/manager"
                        value={customInputs.ownerManagerAssignment}
                        onChange={(e) =>
                          setCustomInputs((prev) => ({ ...prev, ownerManagerAssignment: e.target.value }))
                        }
                      />
                      <Button type="button" onClick={() => handleCustomInputSubmit("ownerManagerAssignment")} size="sm">
                        Add
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowCustomInput((prev) => ({ ...prev, ownerManagerAssignment: false }))}
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <select
                      id="ownerManagerAssignment"
                      value={formData.ownerManagerAssignment}
                      onChange={(e) => handleCustomSelection("ownerManagerAssignment", e.target.value)}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                    >
                      <option value="">Select owner/manager</option>
                      {staff
                        .filter(
                          (member) => member.designation.includes("Manager") || member.designation.includes("Owner"),
                        )
                        .map((member) => (
                          <option key={member.id} value={member.name}>
                            {member.name} - {member.designation}
                          </option>
                        ))}
                      <option value="custom">+ Add Custom Owner/Manager</option>
                    </select>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. Required Details Entry */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                2️⃣ Customer Basic Information
              </CardTitle>
              <CardDescription>Detailed customer information and documents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName">Customer Name *</Label>
                  <Input
                    id="clientName"
                    type="text"
                    placeholder="Enter customer full name"
                    value={formData.clientName}
                    onChange={(e) => handleInputChange("clientName", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cibilScore">CIBIL Score</Label>
                  <Input
                    id="cibilScore"
                    type="number"
                    placeholder="Enter CIBIL score"
                    value={formData.cibilScore}
                    onChange={(e) => handleInputChange("cibilScore", e.target.value)}
                    min="300"
                    max="900"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Complete Address</Label>
                <Textarea
                  id="address"
                  placeholder="Enter complete address with pincode"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* 3. Enhanced Document Management with Loan Types */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                3️⃣ Document Requirements - {formData.leadType || "Select Loan Type"}
              </CardTitle>
              <CardDescription>
                {formData.leadType
                  ? `Specific document requirements for ${formData.leadType}`
                  : "Please select a loan type to see specific document requirements"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {formData.leadType ? (
                <DocumentManager
                  loanType={formData.leadType}
                  onDocumentsChange={setLoanDocuments}
                  initialDocuments={loanDocuments}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4" />
                  <p>Select a loan type above to see specific document requirements</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 4. Bank & Branch Assignment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                4️⃣ Bank & Branch Assignment
              </CardTitle>
              <CardDescription>Assign to specific bank and upload bank-specific documents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="selectedBank">Bank Selection</Label>
                  {showCustomInput.selectedBank ? (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter custom bank name"
                        value={customInputs.selectedBank}
                        onChange={(e) => setCustomInputs((prev) => ({ ...prev, selectedBank: e.target.value }))}
                      />
                      <Button type="button" onClick={() => handleCustomInputSubmit("selectedBank")} size="sm">
                        Add
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowCustomInput((prev) => ({ ...prev, selectedBank: false }))}
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <select
                      id="selectedBank"
                      value={formData.selectedBank}
                      onChange={(e) => handleCustomSelection("selectedBank", e.target.value)}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                    >
                      <option value="">Select bank</option>
                      {banks.map((bank) => (
                        <option key={bank} value={bank}>
                          {bank}
                        </option>
                      ))}
                      <option value="custom">+ Add Custom Bank</option>
                    </select>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bankBranch">Bank Branch</Label>
                  <Input
                    id="bankBranch"
                    type="text"
                    placeholder="Enter bank branch name"
                    value={formData.bankBranch}
                    onChange={(e) => handleInputChange("bankBranch", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bankStaff">Bank Staff Member</Label>
                  <Input
                    id="bankStaff"
                    type="text"
                    placeholder="Enter bank staff contact person"
                    value={formData.bankStaff}
                    onChange={(e) => handleInputChange("bankStaff", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bank-Specific Documents</Label>
                  <Input
                    type="file"
                    multiple
                    onChange={(e) => setBankDocuments(e.target.files ? Array.from(e.target.files) : [])}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-accent-foreground hover:file:bg-accent/80"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 5. Application Status Flow */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                5️⃣ Application Status Flow
              </CardTitle>
              <CardDescription>Set initial application status with color coding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {["Login", "Pending", "Sanctioned", "Rejected"].map((status) => (
                  <div
                    key={status}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.applicationStatus === status
                        ? "border-primary bg-primary/10"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => handleInputChange("applicationStatus", status as any)}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`}></div>
                      <span className="font-medium">{status}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="remarks">Status Remarks/Notes</Label>
                <Textarea
                  id="remarks"
                  placeholder="Add remarks about the current status..."
                  value={formData.remarks}
                  onChange={(e) => handleInputChange("remarks", e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cost">Estimated Cost</Label>
                <Input
                  id="cost"
                  type="number"
                  placeholder="Enter estimated cost"
                  value={formData.cost}
                  onChange={(e) => handleInputChange("cost", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="additionalInfo">Additional Information</Label>
                <Textarea
                  id="additionalInfo"
                  placeholder="Enter any additional information about the lead"
                  value={formData.additionalInfo}
                  onChange={(e) => handleInputChange("additionalInfo", e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Creating Lead..." : "Create Lead with Loan-Specific Documents"}
            </Button>
            <Link href={`/dashboard/leads/${branchId}`}>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
