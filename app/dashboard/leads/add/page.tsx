"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { addLead, getBranches, getStaff } from "@/lib/auth"
import { useAuth } from "@/hooks/use-auth"
import { ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"

export default function AddLeadPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    clientName: "",
    contactNumber: "",
    email: "",
    address: "",
    leadType: "Home Loan",
    leadSource: "Social Media",
    cost: "",
    cibilScore: "",
    additionalInfo: "",
    branchId: "",
    assignedStaff: "unassigned",
  })

  const [customInputs, setCustomInputs] = useState({
    leadType: "",
    leadSource: "",
    branchId: "",
    assignedStaff: "",
  })

  const [showCustomInput, setShowCustomInput] = useState({
    leadType: false,
    leadSource: false,
    branchId: false,
    assignedStaff: false,
  })

  const branches = getBranches()
  const staffMembers = getStaff().filter((s) => s.isActive)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSubmitting(true)

    try {
      const leadData = {
        ...formData,
        cost: Number.parseFloat(formData.cost) || 0,
        cibilScore: Number.parseInt(formData.cibilScore) || 0,
        applicationStatus: "login" as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        branchId: formData.branchId || branches[0]?.id || "1",
        assignedStaff: formData.assignedStaff === "unassigned" ? "" : formData.assignedStaff,
      }

      addLead(leadData)
      router.push("/dashboard/total-leads")
    } catch (error) {
      console.error("Error adding lead:", error)
    } finally {
      setIsSubmitting(false)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-emerald-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-slate-800">Add New Lead</h1>
        </div>

        <Card className="backdrop-blur-xl bg-white/80 border-teal-200/50 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-teal-700">
              <Plus className="h-5 w-5" />
              Lead Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="clientName">Client Name *</Label>
                  <Input
                    id="clientName"
                    value={formData.clientName}
                    onChange={(e) => handleInputChange("clientName", e.target.value)}
                    required
                    className="bg-white/80 border-teal-300/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactNumber">Contact Number *</Label>
                  <Input
                    id="contactNumber"
                    value={formData.contactNumber}
                    onChange={(e) => handleInputChange("contactNumber", e.target.value)}
                    required
                    className="bg-white/80 border-teal-300/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="bg-white/80 border-teal-300/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="leadType">Lead Type *</Label>
                  {showCustomInput.leadType ? (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter custom lead type"
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
                    <Select
                      value={formData.leadType}
                      onValueChange={(value) => handleCustomSelection("leadType", value)}
                    >
                      <SelectTrigger className="bg-white/80 border-teal-300/50">
                        <SelectValue placeholder="Select lead type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Home Loan">Home Loan</SelectItem>
                        <SelectItem value="Personal Loan">Personal Loan</SelectItem>
                        <SelectItem value="Business Loan">Business Loan</SelectItem>
                        <SelectItem value="Car Loan">Car Loan</SelectItem>
                        <SelectItem value="Education Loan">Education Loan</SelectItem>
                        <SelectItem value="Medical Loan">Medical Loan</SelectItem>
                        <SelectItem value="Travel Loan">Travel Loan</SelectItem>
                        <SelectItem value="Credit Card">Credit Card</SelectItem>
                        <SelectItem value="custom">+ Add Custom Lead Type</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="leadSource">Lead Source</Label>
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
                    <Select
                      value={formData.leadSource}
                      onValueChange={(value) => handleCustomSelection("leadSource", value)}
                    >
                      <SelectTrigger className="bg-white/80 border-teal-300/50">
                        <SelectValue placeholder="Select lead source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Social Media">Social Media</SelectItem>
                        <SelectItem value="Walk-in">Walk-in</SelectItem>
                        <SelectItem value="Referral">Referral</SelectItem>
                        <SelectItem value="Website">Website</SelectItem>
                        <SelectItem value="Phone Call">Phone Call</SelectItem>
                        <SelectItem value="Email">Email</SelectItem>
                        <SelectItem value="custom">+ Add Custom Lead Source</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cost">Loan Amount</Label>
                  <Input
                    id="cost"
                    type="number"
                    value={formData.cost}
                    onChange={(e) => handleInputChange("cost", e.target.value)}
                    className="bg-white/80 border-teal-300/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cibilScore">CIBIL Score</Label>
                  <Input
                    id="cibilScore"
                    type="number"
                    min="300"
                    max="900"
                    value={formData.cibilScore}
                    onChange={(e) => handleInputChange("cibilScore", e.target.value)}
                    className="bg-white/80 border-teal-300/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="branchId">Branch</Label>
                  {showCustomInput.branchId ? (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter custom branch name"
                        value={customInputs.branchId}
                        onChange={(e) => setCustomInputs((prev) => ({ ...prev, branchId: e.target.value }))}
                      />
                      <Button type="button" onClick={() => handleCustomInputSubmit("branchId")} size="sm">
                        Add
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowCustomInput((prev) => ({ ...prev, branchId: false }))}
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Select
                      value={formData.branchId}
                      onValueChange={(value) => handleCustomSelection("branchId", value)}
                    >
                      <SelectTrigger className="bg-white/80 border-teal-300/50">
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map((branch) => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.name}
                          </SelectItem>
                        ))}
                        <SelectItem value="custom">+ Add Custom Branch</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assignedStaff">Assign to Staff (Optional)</Label>
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
                    <Select
                      value={formData.assignedStaff}
                      onValueChange={(value) => handleCustomSelection("assignedStaff", value)}
                    >
                      <SelectTrigger className="bg-white/80 border-teal-300/50">
                        <SelectValue placeholder="Select staff member" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {staffMembers.map((staff) => (
                          <SelectItem key={staff.id} value={staff.name || staff.username}>
                            {staff.name || staff.username} - {staff.designation}
                          </SelectItem>
                        ))}
                        <SelectItem value="custom">+ Add Custom Staff Member</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className="bg-white/80 border-teal-300/50"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalInfo">Additional Information</Label>
                <Textarea
                  id="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={(e) => handleInputChange("additionalInfo", e.target.value)}
                  className="bg-white/80 border-teal-300/50"
                  rows={3}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700"
                >
                  {isSubmitting ? "Adding Lead..." : "Add Lead"}
                </Button>
                <Link href="/dashboard">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
