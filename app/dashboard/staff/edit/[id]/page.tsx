"use client";

import type React from "react";

import { useState, useEffect } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Users, Bell } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getStaff, getStaffById, updateStaff } from "@/services/staff-service";
import { Branch, User } from "@/types/common";
import { getBranches } from "@/services/branch-service";

export default function EditStaffPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const params = useParams();
  const staffId = params.id as string;

  const [staffMember, setStaffMember] = useState<User | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    designation: "",
    email: "",
    photo: "",
    branchId: "1",
  });

  const [customInputs, setCustomInputs] = useState({
    branchId: "",
    designation: "",
  });

  const [showCustomInput, setShowCustomInput] = useState({
    branchId: false,
    designation: false,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user || user.type !== "official") {
      router.push("/");
      return;
    }

    getStaffById(staffId).then((member) => {
      if (member) {
        setStaffMember(member);
        console.log({ member });
        setFormData({
          name: member.name || "",
          phone: member.phone || "",
          designation: member.designation || "",
          email: member.email || "",
          photo: member.photo || "",
          branchId: member.branch_id || null,
        });
      } else {
        setError("Staff member not found");
      }
    });

    getBranches().then((branchList) => setBranches(branchList));
  }, [user, router, staffId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      if (
        !formData.name ||
        !formData.phone ||
        !formData.designation ||
        !formData.email
      ) {
        setError("Please fill in all required fields");
        return;
      }

      console.log("first");

      console.log(formData);

      const updated = await updateStaff(staffId, {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        designation: formData.designation,
        photo: formData.photo,
        branchId: formData.branchId,
      });
      console.log(updated);
      if (updated) {
        setSuccess("Staff member updated successfully!");
        setFormData({
          name: "",
          phone: "",
          designation: "",
          email: "",
          photo: "",
          branchId: "",
        });
        setTimeout(() => {
          router.push("/dashboard/staff");
        }, 2000);
      } else {
        setError("Failed to update staff member");
      }
    } catch (err) {
      setError("Failed to update staff member. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCustomSelection = (field: string, value: string) => {
    if (value === "custom") {
      setShowCustomInput((prev) => ({ ...prev, [field]: true }));
    } else {
      setShowCustomInput((prev) => ({ ...prev, [field]: false }));
      handleInputChange(field, value);
    }
  };

  const handleCustomInputSubmit = (field: string) => {
    const customValue = customInputs[field as keyof typeof customInputs];
    if (customValue.trim()) {
      handleInputChange(field, customValue);
      setShowCustomInput((prev) => ({ ...prev, [field]: false }));
      setCustomInputs((prev) => ({ ...prev, [field]: "" }));
    }
  };

  if (!user || user.type !== "official") {
    return <div>Loading...</div>;
  }

  if (!staffMember) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              {error || "Loading staff member..."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/staff">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Staff
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
              <h1 className="text-xl font-semibold">Edit Staff Member</h1>
              <p className="text-sm text-muted-foreground">
                Update employee information
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

      <div className="p-6 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Edit Staff Information
            </CardTitle>
            <CardDescription>
              Update the details for {staffMember.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="designation">Designation *</Label>
                  <Input
                    id="designation"
                    type="text"
                    placeholder="Enter designation"
                    value={formData.designation}
                    onChange={(e) =>
                      handleInputChange("designation", e.target.value)
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="branch">Branch Assignment</Label>
                {showCustomInput.branchId ? (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter custom branch name"
                      value={customInputs.branchId}
                      onChange={(e) =>
                        setCustomInputs((prev) => ({
                          ...prev,
                          branchId: e.target.value,
                        }))
                      }
                    />
                    <Button
                      type="button"
                      onClick={() => handleCustomInputSubmit("branchId")}
                      size="sm"
                    >
                      Add
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setShowCustomInput((prev) => ({
                          ...prev,
                          branchId: false,
                        }))
                      }
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <select
                    id="branch"
                    value={formData.branchId}
                    onChange={(e) =>
                      handleInputChange("branchId", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  >
                    {branches?.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="photo">Staff Photo URL (Optional)</Label>
                <Input
                  id="photo"
                  type="url"
                  placeholder="Enter photo URL"
                  value={formData.photo}
                  onChange={(e) => handleInputChange("photo", e.target.value)}
                />
              </div>

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
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1"
                  onClick={handleSubmit}
                >
                  {isLoading ? "Updating..." : "Update Staff Member"}
                </Button>
                <Link href="/dashboard/staff">
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
