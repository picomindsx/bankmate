"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { getBranches } from "@/services/branch-service";
import { getStaff } from "@/services/staff-service";
import { Branch, LeadForm, User } from "@/types/common";
import { emptyLeadForm } from "@/lib/consts";
import { addNewLead } from "@/services/lead-service";

export default function AddLeadPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<Partial<LeadForm>>(emptyLeadForm);

  const [branches, setBranches] = useState([] as Branch[]);
  const [staffMembers, setStaffMembers] = useState([] as User[]);

  useEffect(() => {
    getBranches().then((branchList) => setBranches(branchList));
    getStaff().then((staffList) =>
      setStaffMembers(staffList.filter((s) => s.isActive))
    );
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);

    try {
      const leadData: LeadForm = {
        ...formData,
        updatedAt: new Date().toISOString(),
        assignedBranch: formData.branchId || branches[0]?.id || "1",
      };

      addNewLead(leadData);
      router.push("/dashboard/total-leads");
    } catch (error) {
      console.error("Error adding lead:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

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
                    onChange={(e) =>
                      handleInputChange("clientName", e.target.value)
                    }
                    required
                    className="bg-white/80 border-teal-300/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactNumber">Contact Number *</Label>
                  <Input
                    id="contactNumber"
                    type="tel"
                    value={formData.contactNumber}
                    onChange={(e) =>
                      handleInputChange("contactNumber", e.target.value)
                    }
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

                  <Select
                    value={formData.leadType}
                    onValueChange={(value) =>
                      handleInputChange("leadType", value)
                    }
                  >
                    <SelectTrigger className="bg-white/80 border-teal-300/50">
                      <SelectValue placeholder="Select lead type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Home Loan">Home Loan</SelectItem>
                      <SelectItem value="Personal Loan">
                        Personal Loan
                      </SelectItem>
                      <SelectItem value="Business Loan">
                        Business Loan
                      </SelectItem>
                      <SelectItem value="Car Loan">Car Loan</SelectItem>
                      <SelectItem value="Education Loan">
                        Education Loan
                      </SelectItem>
                      <SelectItem value="Medical Loan">Medical Loan</SelectItem>
                      <SelectItem value="Travel Loan">Travel Loan</SelectItem>
                      <SelectItem value="Credit Card">Credit Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="leadSource">Lead Source</Label>

                  <Select
                    value={formData.leadSource}
                    onValueChange={(value) =>
                      handleInputChange("leadSource", value)
                    }
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
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cost">Loan Amount</Label>
                  <Input
                    id="cost"
                    type="number"
                    value={formData.estimatedCost}
                    onChange={(e) =>
                      handleInputChange("estimatedCost", e.target.value)
                    }
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
                    onChange={(e) =>
                      handleInputChange("cibilScore", e.target.value)
                    }
                    className="bg-white/80 border-teal-300/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="branchId">Branch</Label>

                  <Select
                    value={formData.branchId}
                    onValueChange={(value) =>
                      handleInputChange("branchId", value)
                    }
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
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assignedStaff">
                    Assign to Staff (Optional)
                  </Label>

                  <Select
                    value={formData.assignedStaff}
                    onValueChange={(value) =>
                      handleInputChange("assignedStaff", value)
                    }
                  >
                    <SelectTrigger className="bg-white/80 border-teal-300/50">
                      <SelectValue placeholder="Select staff member" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {staffMembers.map((staff) => (
                        <SelectItem
                          key={staff.id}
                          value={staff.name || staff.username}
                        >
                          {staff.name || staff.username} - {staff.designation}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.permanentAddress}
                  onChange={(e) =>
                    handleInputChange("permanentAddress", e.target.value)
                  }
                  className="bg-white/80 border-teal-300/50"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalInfo">Additional Information</Label>
                <Textarea
                  id="additionalInfo"
                  value={formData.additionalInformation}
                  onChange={(e) =>
                    handleInputChange("additionalInformation", e.target.value)
                  }
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
  );
}
