"use client";

import { useEffect, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  UserMinus,
  Bell,
  ArrowLeft,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getStaff, deleteStaff } from "@/services/staff-service";
import { User } from "@/types/common";

export default function StaffManagementPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [staff, setStaff] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDesignation, setSelectedDesignation] = useState("all");

  useEffect(() => {
    if (!user || user.type !== "official") {
      router.push("/");
      return;
    }

    setStaff(getStaff());
  }, [user, router]);

  const handleDeleteStaff = (staffId: string) => {
    if (confirm("Are you sure you want to delete this staff member?")) {
      if (deleteStaff(staffId)) {
        setStaff(getStaff());
      }
    }
  };

  const filteredStaff = staff.filter((member) => {
    const matchesSearch =
      member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone?.includes(searchTerm) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDesignation =
      selectedDesignation === "all" ||
      member.designation === selectedDesignation;
    return matchesSearch && matchesDesignation;
  });

  const designations = [
    ...new Set(staff.map((s) => s.designation).filter(Boolean)),
  ];

  if (!user || user.type !== "official") {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
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
              <h1 className="text-xl font-semibold">Staff Management</h1>
              <p className="text-sm text-muted-foreground">
                Manage your team members
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

      <div className="p-6">
        <Tabs defaultValue="view" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="view">View Staff</TabsTrigger>
            <TabsTrigger value="add">Add Staff</TabsTrigger>
            <TabsTrigger value="resignation">Resignation</TabsTrigger>
            <TabsTrigger value="delete">Delete Staff</TabsTrigger>
          </TabsList>

          <TabsContent value="view" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Staff Directory
                </CardTitle>
                <CardDescription>
                  View and manage all staff members
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Search and Filter */}
                <div className="flex gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, phone, or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <select
                    value={selectedDesignation}
                    onChange={(e) => setSelectedDesignation(e.target.value)}
                    className="px-3 py-2 border rounded-md bg-background"
                  >
                    <option value="all">All Designations</option>
                    {designations.map((designation) => (
                      <option key={designation} value={designation}>
                        {designation}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Staff List */}
                <div className="space-y-4">
                  {filteredStaff.length > 0 ? (
                    filteredStaff.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            {member.photo ? (
                              <Image
                                src={member.photo || "/placeholder.svg"}
                                alt={member.name || "Staff"}
                                width={48}
                                height={48}
                                className="rounded-full"
                              />
                            ) : (
                              <Users className="h-6 w-6 text-primary" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium">{member.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {member.email}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {member.phone}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{member.designation}</Badge>
                          <Link href={`/dashboard/staff/edit/${member.id}`}>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        No staff members found
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="add">
            <Link href="/dashboard/staff/add">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-8 text-center">
                  <Plus className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-xl font-semibold mb-2">
                    Add New Staff Member
                  </h3>
                  <p className="text-muted-foreground">
                    Click here to register a new employee
                  </p>
                </CardContent>
              </Card>
            </Link>
          </TabsContent>

          <TabsContent value="resignation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserMinus className="h-5 w-5" />
                  Staff Resignations
                </CardTitle>
                <CardDescription>
                  Manage resignation requests and process departures
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <UserMinus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No resignation requests at this time
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="delete" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trash2 className="h-5 w-5 text-destructive" />
                  Delete Staff Members
                </CardTitle>
                <CardDescription>
                  Permanently remove staff members from the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {staff.length > 0 ? (
                    staff.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <Users className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">{member.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {member.designation}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteStaff(member.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        No staff members to delete
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
