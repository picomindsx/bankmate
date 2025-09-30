"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter, useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, TrendingUp, Bell, FileText, Calendar } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getBranches } from "@/services/branch-service";
import { addNewLead } from "@/services/lead-service";
import { getAllStaff, getStaff } from "@/services/staff-service";
import { Branch, LeadForm, User } from "@/types/common";
import {
  APPLICATION_STATUS,
  BANKS,
  emptyLeadForm,
  LEAD_SOURCES,
} from "@/lib/consts";
import { getStatusColor } from "@/lib/utils";

export default function AddLeadPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const params = useParams();
  const branchId = params.branchId as string;

  const [formData, setFormData] = useState<LeadForm>(emptyLeadForm);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [branch, setBranch] = useState<Branch>();
  const [staff, setStaff] = useState<User[]>([]);

  const productTypes = [
    "Home Loan",
    "Personal Loan",
    "Business Loan",
    "Car Loan",
    "Education Loan",
    "Credit Card",
    "Insurance",
    "Investment Products",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      if (
        !formData.leadName ||
        !formData.clientName ||
        !formData.contactNumber ||
        !formData.leadType
      ) {
        setError("Please fill in all required fields");
        return;
      }

      const newLeadAdded = await addNewLead({
        ...formData,
        assignedBranch: branchId || user?.branchId,
      });

      setSuccess(
        "Lead created successfully with loan-specific document tracking!"
      );
      setTimeout(() => {
        router.push(`/dashboard/leads/${branchId}`);
      }, 2000);
    } catch (err) {
      setError("Failed to create lead. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    getBranches().then((branches) => {
      const currentBranch: Branch | undefined = branches.find(
        (b) => b.id === branchId
      );
      setBranch(currentBranch);
    });
    getAllStaff().then((staffList) => setStaff(staffList));
  }, []);

  if (!user || user.type !== "official" || !branch) {
    return <div>Loading...</div>;
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
              <h1 className="text-xl font-semibold">
                Create New Lead - {branch.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                Comprehensive lead creation with document tracking
              </p>
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
              <CardDescription>
                Basic lead information and assignment
              </CardDescription>
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
                    onChange={(e) =>
                      handleInputChange("leadName", e.target.value)
                    }
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
                    onChange={(e) =>
                      handleInputChange("contactNumber", e.target.value)
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="leadSource">Source *</Label>

                  <select
                    id="leadSource"
                    value={formData.leadSource}
                    onChange={(e) =>
                      handleInputChange("leadSource", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    required
                  >
                    <option value="">Select lead source</option>
                    {LEAD_SOURCES.map((source) => (
                      <option key={source} value={source}>
                        {source}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="leadType">Product Type *</Label>

                  <select
                    id="leadType"
                    value={formData.leadType}
                    onChange={(e) =>
                      handleInputChange("leadType", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    required
                  >
                    <option value="">Select product type</option>
                    {productTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="assignedStaff">Assigned Staff</Label>

                  <select
                    id="assignedStaff"
                    value={formData.assignedStaff}
                    onChange={(e) =>
                      handleInputChange("assignedStaff", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  >
                    <option value="">Select staff member</option>
                    {staff
                      .filter(
                        (member) =>
                          member.type === "employee" && member.role === "staff"
                      )
                      .map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name} - {member.designation}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ownerManagerAssignment">
                    Owner/Manager Assignment
                  </Label>

                  <select
                    id="ownerManagerAssignment"
                    value={formData.ownerManagerAssignment}
                    onChange={(e) =>
                      handleInputChange(
                        "ownerManagerAssignment",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  >
                    <option value="">Select owner/manager</option>
                    {staff
                      .filter(
                        (member) =>
                          member.type === "official" &&
                          ["owner", "manager", "branch_head"].includes(
                            member.role
                          )
                      )
                      .map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name} - {member.designation}
                        </option>
                      ))}
                  </select>
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
              <CardDescription>
                Detailed customer information and documents
              </CardDescription>
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
                    onChange={(e) =>
                      handleInputChange("clientName", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      handleInputChange("dateOfBirth", e.target.value)
                    }
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
                    onChange={(e) =>
                      handleInputChange("cibilScore", e.target.value)
                    }
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
                  value={formData.permanentAddress}
                  onChange={(e) =>
                    handleInputChange("permanentAddress", e.target.value)
                  }
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* 3. Enhanced Document Management with Loan Types
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                3️⃣ Document Requirements -{" "}
                {formData.leadType || "Select Loan Type"}
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
                  <p>
                    Select a loan type above to see specific document
                    requirements
                  </p>
                </div>
              )}
            </CardContent>
          </Card> */}

          {/* 4. Bank & Branch Assignment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                3️⃣ Bank & Branch Assignment
              </CardTitle>
              <CardDescription>
                Assign to specific bank and upload bank-specific documents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="selectedBank">Bank Selection</Label>

                  <select
                    id="selectedBank"
                    value={formData.bankSelection}
                    onChange={(e) =>
                      handleInputChange("bankSelection", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  >
                    <option value="">Select bank</option>
                    {BANKS.map((bank) => (
                      <option key={bank} value={bank}>
                        {bank}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bankBranch">Bank Branch</Label>
                  <Input
                    id="bankBranch"
                    type="text"
                    placeholder="Enter bank branch name"
                    value={formData.bankBranch}
                    onChange={(e) =>
                      handleInputChange("bankBranch", e.target.value)
                    }
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
                    value={formData.bankStaffMember}
                    onChange={(e) =>
                      handleInputChange("bankStaffMember", e.target.value)
                    }
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
              <CardDescription>
                Set initial application status with color coding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {APPLICATION_STATUS.map((status) => (
                  <div
                    key={status}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.applicationStatus === status
                        ? "border-primary bg-primary/10"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() =>
                      handleInputChange("applicationStatus", status)
                    }
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${getStatusColor(
                          status
                        )}`}
                      ></div>
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
                  value={formData.statusRemarks}
                  onChange={(e) =>
                    handleInputChange("statusRemarks", e.target.value)
                  }
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
                  value={formData.estimatedCost}
                  onChange={(e) =>
                    handleInputChange("estimatedCost", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="additionalInfo">Additional Information</Label>
                <Textarea
                  id="additionalInfo"
                  placeholder="Enter any additional information about the lead"
                  value={formData.additionalInformation}
                  onChange={(e) =>
                    handleInputChange("additionalInformation", e.target.value)
                  }
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
              {isLoading
                ? "Creating Lead..."
                : "Create Lead with Loan-Specific Documents"}
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
  );
}
