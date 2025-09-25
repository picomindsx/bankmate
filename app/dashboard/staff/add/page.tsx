"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
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
import { getBranches } from "@/services/branch-service";
import { addStaff } from "@/services/staff-service";
import { Branch, User } from "@/types/common";

export default function AddStaffPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
    designation: "",
    email: "",
    photo: "",
    branchId: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const fetchBranches = async () => {
    const branchList = await getBranches();
    setBranches(branchList);
    if (branchList.length > 0) {
      setFormData((prev) => ({ ...prev, branchId: branchList[0].id }));
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      if (
        !formData.name ||
        !formData.phone ||
        !formData.password ||
        !formData.designation ||
        !formData.email
      ) {
        setError("Please fill in all required fields");
        return;
      }

      const newStaff = await addStaff({
        username: formData.phone, // Use phone as username for employee login
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        designation: formData.designation,
        photo: formData.photo,
        branchId: formData.branchId,
        password: formData.password,
      } as User);

      if (newStaff === null) {
        setError("Failed to add staff member. Please try again.");
        return;
      }

      setSuccess("Staff member added successfully!");
      setTimeout(() => {
        router.push("/dashboard/staff");
      }, 2000);
    } catch (err) {
      setError("Failed to add staff member. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

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
              <h1 className="text-xl font-semibold">Add New Staff</h1>
              <p className="text-sm text-muted-foreground">
                Register a new employee
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
              Staff Registration Form
            </CardTitle>
            <CardDescription>
              Fill in the details to add a new staff member
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
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password for employee login"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="branch">Branch Assignment</Label>
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="photo">Staff Photo (Optional)</Label>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Input
                      id="photo"
                      type="text"
                      placeholder="paste image URL here"
                      value={formData.photo}
                      onChange={(e) =>
                        handleInputChange("photo", e.target.value)
                      }
                    />
                  </div>
                  {formData.photo && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden border">
                      <Image
                        src={formData.photo || "/placeholder.svg"}
                        alt="Staff photo preview"
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Upload a photo for the staff member
                </p>
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
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? "Adding Staff..." : "Add Staff Member"}
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
