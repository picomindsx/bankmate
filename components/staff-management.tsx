"use client";

import { useState, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Shield,
  Key,
  UserPlus,
  Eye,
  EyeOff,
  Crown,
  Building,
  Users,
  UserCheck,
  Trash2,
} from "lucide-react";
import { hasPermission } from "@/services/auth-service";
import { getBranches } from "@/services/branch-service";
import {
  getStaff,
  addStaff,
  updateStaff,
  updateStaffPassword,
  updateStaffRole,
  deactivateStaff,
  activateStaff,
  deleteStaff,
} from "@/services/staff-service";
import { User as UserType } from "@/types/common";

interface StaffManagementProps {
  currentUser: UserType;
}

export default function StaffManagement({ currentUser }: StaffManagementProps) {
  const [staff, setStaff] = useState<UserType[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<UserType | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterBranch, setFilterBranch] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const [newStaff, setNewStaff] = useState({
    name: "",
    phone: "",
    email: "",
    role: "staff" as UserType["role"],
    branchId: "",
    designation: "",
  });

  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    setStaff(getStaff());
    setBranches(getBranches());
  }, []);

  const canManageStaff =
    hasPermission(currentUser, "staff.create") ||
    hasPermission(currentUser, "staff.edit");
  const canResetPasswords = hasPermission(currentUser, "staff.password_reset");
  const canDeleteStaff = hasPermission(currentUser, "staff.delete");

  const handleAddStaff = () => {
    if (!hasPermission(currentUser, "staff.create")) return;

    const staffMember = addStaff(newStaff);
    setStaff(getStaff());
    setNewStaff({
      name: "",
      phone: "",
      email: "",
      role: "staff",
      branchId: "",
      designation: "",
    });
    setIsAddDialogOpen(false);
  };

  const handleUpdateStaff = () => {
    if (!selectedStaff || !hasPermission(currentUser, "staff.edit")) return;

    updateStaff(selectedStaff.id, {
      name: selectedStaff.name,
      email: selectedStaff.email,
      designation: selectedStaff.designation,
      branchId: selectedStaff.branchId,
    });
    setStaff(getStaff());
    setIsEditDialogOpen(false);
    setSelectedStaff(null);
  };

  const handlePasswordReset = () => {
    if (!selectedStaff || !canResetPasswords) return;

    updateStaffPassword(selectedStaff.id, newPassword, currentUser.name || "");
    setStaff(getStaff());
    setNewPassword("");
    setIsPasswordDialogOpen(false);
    setSelectedStaff(null);
  };

  const handleRoleChange = (staffId: string, newRole: UserType["role"]) => {
    if (!hasPermission(currentUser, "staff.permissions")) return;

    updateStaffRole(staffId, newRole, currentUser.name || "");
    setStaff(getStaff());
  };

  const handleToggleActive = (staffId: string, isActive: boolean) => {
    if (!canDeleteStaff) return;

    if (isActive) {
      deactivateStaff(staffId, currentUser.name || "");
    } else {
      activateStaff(staffId, currentUser.name || "");
    }
    setStaff(getStaff());
  };

  const handleDeleteStaff = (staffId: string) => {
    if (!canDeleteStaff) return;

    const success = deleteStaff(staffId);
    if (success) {
      setStaff(getStaff());
    }
  };

  const filteredStaff = staff.filter((member) => {
    const matchesSearch =
      member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone?.includes(searchTerm) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || member.role === filterRole;
    const matchesBranch =
      filterBranch === "all" || member.branchId === filterBranch;
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && member.isActive) ||
      (filterStatus === "inactive" && !member.isActive);

    return matchesSearch && matchesRole && matchesBranch && matchesStatus;
  });

  const getRoleIcon = (role: UserType["role"]) => {
    switch (role) {
      case "owner":
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case "branch_head":
        return <Building className="h-4 w-4 text-purple-500" />;
      case "manager":
        return <Users className="h-4 w-4 text-blue-500" />;
      case "admin":
        return <Shield className="h-4 w-4 text-red-500" />;
      case "staff":
        return <User className="h-4 w-4 text-green-500" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadgeColor = (role: UserType["role"]) => {
    switch (role) {
      case "owner":
        return "bg-yellow-500";
      case "branch_head":
        return "bg-purple-500";
      case "manager":
        return "bg-blue-500";
      case "admin":
        return "bg-red-500";
      case "staff":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Staff Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Total Staff
            </CardTitle>
            <Users className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{staff.length}</div>
            {staff.length === 0 && (
              <p className="text-xs text-gray-400 mt-1">No staff members yet</p>
            )}
          </CardContent>
        </Card>
        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Active
            </CardTitle>
            <UserCheck className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {staff.filter((s) => s.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Branch Heads
            </CardTitle>
            <Building className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">
              {staff.filter((s) => s.role === "branch_head").length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Managers
            </CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">
              {staff.filter((s) => s.role === "manager").length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Admins
            </CardTitle>
            <Shield className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">
              {staff.filter((s) => s.role === "admin").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/10 backdrop-blur-xl border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Staff Management</CardTitle>
              <CardDescription className="text-gray-300">
                Manage staff members with employer login access and lead
                generation capabilities
              </CardDescription>
            </div>
            {canManageStaff && (
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Staff
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-gray-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">
                      Add New Staff Member
                    </DialogTitle>
                    <DialogDescription className="text-gray-300">
                      Create a new staff account with appropriate role and
                      permissions
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-white">
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        value={newStaff.name}
                        onChange={(e) =>
                          setNewStaff({ ...newStaff, name: e.target.value })
                        }
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-white">
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        value={newStaff.phone}
                        onChange={(e) =>
                          setNewStaff({ ...newStaff, phone: e.target.value })
                        }
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-white">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={newStaff.email}
                        onChange={(e) =>
                          setNewStaff({ ...newStaff, email: e.target.value })
                        }
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="role" className="text-white">
                        Role
                      </Label>
                      <Select
                        value={newStaff.role}
                        onValueChange={(value: UserType["role"]) =>
                          setNewStaff({ ...newStaff, role: value })
                        }
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="staff">Staff</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="branch_head">
                            Branch Head
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="branch" className="text-white">
                        Branch
                      </Label>
                      <Select
                        value={newStaff.branchId}
                        onValueChange={(value) =>
                          setNewStaff({ ...newStaff, branchId: value })
                        }
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue />
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
                    <div>
                      <Label htmlFor="designation" className="text-white">
                        Designation
                      </Label>
                      <Input
                        id="designation"
                        value={newStaff.designation}
                        onChange={(e) =>
                          setNewStaff({
                            ...newStaff,
                            designation: e.target.value,
                          })
                        }
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <Button
                      onClick={handleAddStaff}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600"
                    >
                      Add Staff Member
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Input
              placeholder="Search staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="branch_head">Branch Head</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterBranch} onValueChange={setFilterBranch}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue />
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
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Staff List */}
          <div className="space-y-3">
            {filteredStaff.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">
                  No Staff Members
                </h3>
                <p className="text-gray-400 mb-4">
                  All previous staff have been cleared. Add new staff members
                  who can access employer login and generate leads.
                </p>
                {canManageStaff && (
                  <Button
                    onClick={() => setIsAddDialogOpen(true)}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add First Staff Member
                  </Button>
                )}
              </div>
            )}
            {filteredStaff.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    {getRoleIcon(member.role)}
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{member.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <span>{member.phone}</span>
                      <span>•</span>
                      <span>{member.email}</span>
                      <span>•</span>
                      <span>{member.designation}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        className={`${getRoleBadgeColor(
                          member.role
                        )} text-white border-0`}
                      >
                        {member.role
                          ? member.role.replace(/_/g, " ").toUpperCase()
                          : "NO ROLE"}
                      </Badge>
                      <Badge
                        className={`${
                          member.isActive ? "bg-green-500" : "bg-red-500"
                        } text-white border-0`}
                      >
                        {member.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {hasPermission(currentUser, "staff.permissions") && (
                    <Select
                      value={member.role}
                      onValueChange={(value: UserType["role"]) =>
                        handleRoleChange(member.id, value)
                      }
                    >
                      <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="branch_head">Branch Head</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  {canResetPasswords && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedStaff(member);
                        setIsPasswordDialogOpen(true);
                      }}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <Key className="h-4 w-4" />
                    </Button>
                  )}
                  {canDeleteStaff && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleToggleActive(member.id, member.isActive || false)
                      }
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      {member.isActive ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                  {canDeleteStaff && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteStaff(member.id)}
                      className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Password Reset Dialog */}
      <Dialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
      >
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Reset Password</DialogTitle>
            <DialogDescription className="text-gray-300">
              Reset password for {selectedStaff?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newPassword" className="text-white">
                New Password
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <Button
              onClick={handlePasswordReset}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600"
            >
              Reset Password
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
