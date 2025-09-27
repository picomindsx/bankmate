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
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  Calendar,
  Users,
  TrendingUp,
  ArrowLeft,
  Bell,
  Building2,
  Award,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getBranches } from "@/services/branch-service";
import { getLeads } from "@/services/lead-service";
import { getStaff } from "@/services/staff-service";
import { Branch, User } from "@/types/common";

export default function ReportsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const leads = getLeads();

  const [branches, setBranches] = useState([] as Branch[]);
  const [staff, setStaff] = useState([] as User[]);

  useEffect(() => {
    getBranches().then((branchList) => setBranches(branchList));
    getStaff().then((staffList) => setStaff(staffList));
  }, []);

  const getStaffPerformance = (
    staffId: string,
    month: number,
    year: number
  ) => {
    const staffLeads = leads.filter((lead) => {
      const leadDate = new Date(lead.createdAt);
      return (
        lead.assignedStaff === staffId &&
        leadDate.getMonth() === month &&
        leadDate.getFullYear() === year
      );
    });

    const createdLeads = leads.filter((lead) => {
      const leadDate = new Date(lead.createdAt);
      return (
        lead.createdByStaff === staffId &&
        leadDate.getMonth() === month &&
        leadDate.getFullYear() === year
      );
    });

    return {
      leadsCreated: createdLeads.length,
      filesAssigned: staffLeads.length,
      filesSanctioned: staffLeads.filter(
        (lead) => lead.applicationStatus === "sanctioned"
      ).length,
      filesRejected: staffLeads.filter(
        (lead) => lead.applicationStatus === "rejected"
      ).length,
      conversionRate:
        staffLeads.length > 0
          ? (staffLeads.filter(
              (lead) => lead.applicationStatus === "sanctioned"
            ).length /
              staffLeads.length) *
            100
          : 0,
    };
  };

  const getBranchPerformance = (
    branchId: string,
    month: number,
    year: number
  ) => {
    const branchLeads = leads.filter((lead) => {
      const leadDate = new Date(lead.createdAt);
      return (
        lead.branchId === branchId &&
        leadDate.getMonth() === month &&
        leadDate.getFullYear() === year
      );
    });

    const newLeads = branchLeads.filter(
      (lead) => !lead.assignedStaff || lead.assignedStaff === ""
    );
    const assignedLeads = branchLeads.filter(
      (lead) => lead.assignedStaff && lead.assignedStaff !== ""
    );
    const sanctionedLeads = branchLeads.filter(
      (lead) => lead.applicationStatus === "sanctioned"
    );
    const rejectedLeads = branchLeads.filter(
      (lead) => lead.applicationStatus === "rejected"
    );

    const sanctionRate =
      branchLeads.length > 0
        ? (sanctionedLeads.length / branchLeads.length) * 100
        : 0;
    const rejectionRate =
      branchLeads.length > 0
        ? (rejectedLeads.length / branchLeads.length) * 100
        : 0;

    return {
      totalLeads: branchLeads.length,
      newLeads: newLeads.length,
      assignedLeads: assignedLeads.length,
      sanctionedLeads: sanctionedLeads.length,
      rejectedLeads: rejectedLeads.length,
      sanctionRate,
      rejectionRate,
    };
  };

  // Calculate report data
  const totalLeads = leads.length;
  const newLeads = leads.filter(
    (lead) => !lead.assignedStaff || lead.assignedStaff === ""
  ).length;
  const assignedLeads = leads.filter(
    (lead) => lead.assignedStaff && lead.assignedStaff !== ""
  ).length;
  const sanctionedLeads = leads.filter(
    (lead) => lead.applicationStatus === "sanctioned"
  ).length;
  const rejectedLeads = leads.filter(
    (lead) => lead.applicationStatus === "rejected"
  ).length;
  const pendingLeads = leads.filter(
    (lead) => lead.applicationStatus === "pending"
  ).length;

  const generateReport = (reportType: string) => {
    let reportData: any[] = [];
    let filename = "";

    switch (reportType) {
      case "staff_performance":
        reportData = staff.map((member) => {
          const performance = getStaffPerformance(
            member.id,
            selectedMonth,
            selectedYear
          );
          return {
            Name: member.name,
            Designation: member.designation,
            Branch:
              branches.find((b) => b.id === member.branchId)?.name || "Unknown",
            "Leads Created": performance.leadsCreated,
            "Files Assigned": performance.filesAssigned,
            "Files Sanctioned": performance.filesSanctioned,
            "Files Rejected": performance.filesRejected,
            "Conversion Rate %": performance.conversionRate.toFixed(2),
          };
        });
        filename = `staff-performance-${selectedMonth + 1}-${selectedYear}`;
        break;
      case "branch_performance":
        reportData = branches.map((branch) => {
          const performance = getBranchPerformance(
            branch.id,
            selectedMonth,
            selectedYear
          );
          return {
            "Branch Name": branch.name,
            "Total Leads": performance.totalLeads,
            "New Leads": performance.newLeads,
            "Assigned Leads": performance.assignedLeads,
            "Sanctioned Leads": performance.sanctionedLeads,
            "Rejected Leads": performance.rejectedLeads,
            "Sanction Rate %": performance.sanctionRate.toFixed(2),
            "Rejection Rate %": performance.rejectionRate.toFixed(2),
          };
        });
        filename = `branch-performance-${selectedMonth + 1}-${selectedYear}`;
        break;
      case "staff":
        reportData = staff.map((member) => ({
          Name: member.name,
          Designation: member.designation,
          Email: member.email,
          Phone: member.phone,
          "Assigned Leads": leads.filter(
            (lead) => lead.assignedStaff === member.name
          ).length,
        }));
        filename = "staff-report";
        break;
      case "total":
        reportData = leads.map((lead) => ({
          "Client Name": lead.clientName,
          "Contact Number": lead.contactNumber,
          "Lead Type": lead.leadType,
          "Assigned Staff": lead.assignedStaff || "Unassigned",
          Status: lead.applicationStatus,
          "Created Date": new Date(lead.createdAt).toLocaleDateString(),
          Branch:
            branches.find((b) => b.id === lead.branchId)?.name || "Unknown",
        }));
        filename = "total-leads-report";
        break;
      case "sanctioned":
        reportData = leads
          .filter((lead) => lead.applicationStatus === "sanctioned")
          .map((lead) => ({
            "Client Name": lead.clientName,
            "Contact Number": lead.contactNumber,
            "Lead Type": lead.leadType,
            "Assigned Staff": lead.assignedStaff || "Unassigned",
            "Sanction Date": lead.sanctionDate
              ? new Date(lead.sanctionDate).toLocaleDateString()
              : "N/A",
            "Sanction Amount": lead.sanctionAmount || "N/A",
            Branch:
              branches.find((b) => b.id === lead.branchId)?.name || "Unknown",
          }));
        filename = "sanctioned-leads-report";
        break;
      case "rejected":
        reportData = leads
          .filter((lead) => lead.applicationStatus === "rejected")
          .map((lead) => ({
            "Client Name": lead.clientName,
            "Contact Number": lead.contactNumber,
            "Lead Type": lead.leadType,
            "Assigned Staff": lead.assignedStaff || "Unassigned",
            "Rejection Date": lead.statusUpdatedAt
              ? new Date(lead.statusUpdatedAt).toLocaleDateString()
              : "N/A",
            "Rejection Reason": lead.rejectionReason || "N/A",
            Branch:
              branches.find((b) => b.id === lead.branchId)?.name || "Unknown",
          }));
        filename = "rejected-leads-report";
        break;
      case "daily":
        const today = new Date().toDateString();
        reportData = leads
          .filter((lead) => new Date(lead.createdAt).toDateString() === today)
          .map((lead) => ({
            "Client Name": lead.clientName,
            "Contact Number": lead.contactNumber,
            "Lead Type": lead.leadType,
            "Assigned Staff": lead.assignedStaff || "Unassigned",
            Status: lead.applicationStatus,
            Time: new Date(lead.createdAt).toLocaleTimeString(),
            Branch:
              branches.find((b) => b.id === lead.branchId)?.name || "Unknown",
          }));
        filename = "daily-report";
        break;
    }

    // Generate CSV
    if (reportData.length > 0) {
      const headers = Object.keys(reportData[0]);
      const csvContent = [
        headers.join(","),
        ...reportData.map((row) =>
          headers.map((header) => row[header] || "").join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
    }
  };

  if (!user || user.type !== "official") {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-50">
      {/* Header */}
      <header className="backdrop-blur-xl bg-white/80 border-b border-gray-200/50 shadow-xl">
        <div className="flex h-20 items-center justify-between px-8">
          <div className="flex items-center gap-6">
            <Link href="/dashboard">
              <Button
                variant="ghost"
                className="text-slate-700 hover:bg-slate-100"
              >
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
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-blue-700 bg-clip-text text-transparent">
                Performance & Reports Dashboard
              </h1>
              <p className="text-slate-600">
                Comprehensive business analytics and insights
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="sm"
              className="relative text-slate-700"
            >
              <Bell className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-slate-800 font-semibold block">
                  {user.name}
                </span>
                <span className="text-slate-600/70 text-sm">Owner Access</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="bg-red-50/80 hover:bg-red-100/80 border-red-300/50 text-red-700"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="p-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <Card className="backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-300/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">
                Total Leads
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">
                {totalLeads}
              </div>
            </CardContent>
          </Card>
          <Card className="backdrop-blur-xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-300/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-700">
                New Leads
              </CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">
                {newLeads}
              </div>
            </CardContent>
          </Card>
          <Card className="backdrop-blur-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-300/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">
                Assigned
              </CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">
                {assignedLeads}
              </div>
            </CardContent>
          </Card>
          <Card className="backdrop-blur-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-300/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-700">
                Sanctioned
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">
                {sanctionedLeads}
              </div>
            </CardContent>
          </Card>
          <Card className="backdrop-blur-xl bg-gradient-to-br from-red-500/10 to-pink-500/10 border-red-300/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-700">
                Rejected
              </CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">
                {rejectedLeads}
              </div>
            </CardContent>
          </Card>
          <Card className="backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-violet-500/10 border-purple-300/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">
                Branches
              </CardTitle>
              <Building2 className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">
                {branches.length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="staff_performance" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="staff_performance">
              Staff Performance
            </TabsTrigger>
            <TabsTrigger value="branch_performance">
              Branch Performance
            </TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sanctioned">Sanctioned</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="daily">Daily Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="staff_performance" className="space-y-6">
            <Card className="backdrop-blur-xl bg-white/70 border-slate-200/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-blue-600" />
                      Staff Performance Dashboard (Per Month)
                    </CardTitle>
                    <CardDescription>
                      Individual staff member performance metrics and analytics
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <Select
                      value={selectedMonth.toString()}
                      onValueChange={(value) =>
                        setSelectedMonth(Number.parseInt(value))
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => (
                          <SelectItem key={i} value={i.toString()}>
                            {new Date(0, i).toLocaleString("default", {
                              month: "long",
                            })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={selectedYear.toString()}
                      onValueChange={(value) =>
                        setSelectedYear(Number.parseInt(value))
                      }
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 5 }, (_, i) => (
                          <SelectItem
                            key={i}
                            value={(
                              new Date().getFullYear() -
                              2 +
                              i
                            ).toString()}
                          >
                            {new Date().getFullYear() - 2 + i}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={() => generateReport("staff_performance")}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export CSV
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {staff.map((member) => {
                    const performance = getStaffPerformance(
                      member.id,
                      selectedMonth,
                      selectedYear
                    );
                    return (
                      <div
                        key={member.id}
                        className="p-6 border rounded-lg bg-white/50 backdrop-blur-sm"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-lg text-slate-800">
                              {member.name}
                            </h4>
                            <p className="text-sm text-slate-600">
                              {member.designation} -{" "}
                              {
                                branches.find((b) => b.id === member.branchId)
                                  ?.name
                              }
                            </p>
                          </div>
                          <Badge
                            className={`${
                              performance.conversionRate > 50
                                ? "bg-green-500"
                                : performance.conversionRate > 25
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            } text-white`}
                          >
                            {performance.conversionRate.toFixed(1)}% Conversion
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">
                              {performance.leadsCreated}
                            </div>
                            <div className="text-sm text-blue-700">
                              Leads Created
                            </div>
                          </div>
                          <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">
                              {performance.filesAssigned}
                            </div>
                            <div className="text-sm text-purple-700">
                              Files Assigned
                            </div>
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                              {performance.filesSanctioned}
                            </div>
                            <div className="text-sm text-green-700">
                              Files Sanctioned
                            </div>
                          </div>
                          <div className="text-center p-3 bg-red-50 rounded-lg">
                            <div className="text-2xl font-bold text-red-600">
                              {performance.filesRejected}
                            </div>
                            <div className="text-sm text-red-700">
                              Files Rejected
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Performance Score</span>
                            <span>
                              {performance.conversionRate.toFixed(1)}%
                            </span>
                          </div>
                          <Progress
                            value={performance.conversionRate}
                            className="h-2"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="branch_performance" className="space-y-6">
            <Card className="backdrop-blur-xl bg-white/70 border-slate-200/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-green-600" />
                      Branch Performance Dashboard
                    </CardTitle>
                    <CardDescription>
                      Branch-wise performance metrics and conversion rates
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <Select
                      value={selectedMonth.toString()}
                      onValueChange={(value) =>
                        setSelectedMonth(Number.parseInt(value))
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => (
                          <SelectItem key={i} value={i.toString()}>
                            {new Date(0, i).toLocaleString("default", {
                              month: "long",
                            })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={selectedYear.toString()}
                      onValueChange={(value) =>
                        setSelectedYear(Number.parseInt(value))
                      }
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 5 }, (_, i) => (
                          <SelectItem
                            key={i}
                            value={(
                              new Date().getFullYear() -
                              2 +
                              i
                            ).toString()}
                          >
                            {new Date().getFullYear() - 2 + i}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={() => generateReport("branch_performance")}
                      className="bg-gradient-to-r from-green-600 to-emerald-600"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export CSV
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {branches.map((branch) => {
                    const performance = getBranchPerformance(
                      branch.id,
                      selectedMonth,
                      selectedYear
                    );
                    return (
                      <div
                        key={branch.id}
                        className="p-6 border rounded-lg bg-white/50 backdrop-blur-sm"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-lg text-slate-800">
                              {branch.name}
                            </h4>
                            <p className="text-sm text-slate-600">
                              Branch Performance Metrics
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge className="bg-blue-500 text-white mb-1">
                              {performance.totalLeads} Total
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="text-center p-3 bg-orange-50 rounded-lg">
                            <div className="text-xl font-bold text-orange-600">
                              {performance.newLeads}
                            </div>
                            <div className="text-xs text-orange-700">
                              New Leads
                            </div>
                          </div>
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="text-xl font-bold text-blue-600">
                              {performance.assignedLeads}
                            </div>
                            <div className="text-xs text-blue-700">
                              Assigned
                            </div>
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="text-xl font-bold text-green-600">
                              {performance.sanctionedLeads}
                            </div>
                            <div className="text-xs text-green-700">
                              Sanctioned
                            </div>
                          </div>
                          <div className="text-center p-3 bg-red-50 rounded-lg">
                            <div className="text-xl font-bold text-red-600">
                              {performance.rejectedLeads}
                            </div>
                            <div className="text-xs text-red-700">Rejected</div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-green-700">
                                Sanction Rate
                              </span>
                              <span className="font-medium">
                                {performance.sanctionRate.toFixed(1)}%
                              </span>
                            </div>
                            <Progress
                              value={performance.sanctionRate}
                              className="h-2"
                            />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-red-700">
                                Rejection Rate
                              </span>
                              <span className="font-medium">
                                {performance.rejectionRate.toFixed(1)}%
                              </span>
                            </div>
                            <Progress
                              value={performance.rejectionRate}
                              className="h-2 bg-red-100"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="backdrop-blur-xl bg-white/70 border-slate-200/50">
                <CardHeader>
                  <CardTitle>Lead Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>New Leads</span>
                      <Badge variant="outline">{newLeads}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Assigned Leads</span>
                      <Badge variant="outline">{assignedLeads}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Pending Leads</span>
                      <Badge variant="outline">{pendingLeads}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Sanctioned Leads</span>
                      <Badge className="bg-green-500 text-white">
                        {sanctionedLeads}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Rejected Leads</span>
                      <Badge className="bg-red-500 text-white">
                        {rejectedLeads}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-xl bg-white/70 border-slate-200/50">
                <CardHeader>
                  <CardTitle>Overall Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Overall Conversion Rate</span>
                        <span>
                          {totalLeads > 0
                            ? ((sanctionedLeads / totalLeads) * 100).toFixed(1)
                            : 0}
                          %
                        </span>
                      </div>
                      <Progress
                        value={
                          totalLeads > 0
                            ? (sanctionedLeads / totalLeads) * 100
                            : 0
                        }
                        className="h-3"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Assignment Rate</span>
                        <span>
                          {totalLeads > 0
                            ? ((assignedLeads / totalLeads) * 100).toFixed(1)
                            : 0}
                          %
                        </span>
                      </div>
                      <Progress
                        value={
                          totalLeads > 0
                            ? (assignedLeads / totalLeads) * 100
                            : 0
                        }
                        className="h-3"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Rejection Rate</span>
                        <span>
                          {totalLeads > 0
                            ? ((rejectedLeads / totalLeads) * 100).toFixed(1)
                            : 0}
                          %
                        </span>
                      </div>
                      <Progress
                        value={
                          totalLeads > 0
                            ? (rejectedLeads / totalLeads) * 100
                            : 0
                        }
                        className="h-3 bg-red-100"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sanctioned" className="space-y-6">
            <Card className="backdrop-blur-xl bg-white/70 border-slate-200/50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Sanctioned Leads Report
                  </span>
                  <Button
                    onClick={() => generateReport("sanctioned")}
                    className="bg-gradient-to-r from-green-600 to-emerald-600"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                  </Button>
                </CardTitle>
                <CardDescription>
                  All approved and sanctioned loan applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 mx-auto text-green-600 mb-4" />
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {sanctionedLeads}
                  </div>
                  <p className="text-slate-600">
                    Successfully sanctioned leads
                  </p>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-700">
                        {totalLeads > 0
                          ? ((sanctionedLeads / totalLeads) * 100).toFixed(1)
                          : 0}
                        %
                      </div>
                      <div className="text-sm text-green-600">Success Rate</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-700">
                        ₹
                        {leads
                          .filter(
                            (l) =>
                              l.applicationStatus === "sanctioned" &&
                              l.sanctionAmount
                          )
                          .reduce(
                            (sum, l) =>
                              sum + Number.parseFloat(l.sanctionAmount || "0"),
                            0
                          )
                          .toLocaleString()}
                      </div>
                      <div className="text-sm text-blue-600">Total Amount</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-lg font-bold text-purple-700">
                        {
                          leads.filter(
                            (l) =>
                              l.applicationStatus === "sanctioned" &&
                              l.disbursementStatus === "disbursed"
                          ).length
                        }
                      </div>
                      <div className="text-sm text-purple-600">Disbursed</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rejected" className="space-y-6">
            <Card className="backdrop-blur-xl bg-white/70 border-slate-200/50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-red-600" />
                    Rejected Leads Report
                  </span>
                  <Button
                    onClick={() => generateReport("rejected")}
                    className="bg-gradient-to-r from-red-600 to-pink-600"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                  </Button>
                </CardTitle>
                <CardDescription>
                  All rejected loan applications with reasons
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <XCircle className="h-12 w-12 mx-auto text-red-600 mb-4" />
                  <div className="text-3xl font-bold text-red-600 mb-2">
                    {rejectedLeads}
                  </div>
                  <p className="text-slate-600">Rejected applications</p>
                  <div className="mt-4">
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-lg font-bold text-red-700">
                        {totalLeads > 0
                          ? ((rejectedLeads / totalLeads) * 100).toFixed(1)
                          : 0}
                        %
                      </div>
                      <div className="text-sm text-red-600">Rejection Rate</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="daily" className="space-y-6">
            <Card className="backdrop-blur-xl bg-white/70 border-slate-200/50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    Daily Activity Reports
                  </span>
                  <Button
                    onClick={() => generateReport("daily")}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export Today's Report
                  </Button>
                </CardTitle>
                <CardDescription>
                  Daily lead generation and activity tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <Input
                      type="date"
                      value={dateRange.from}
                      onChange={(e) =>
                        setDateRange({ ...dateRange, from: e.target.value })
                      }
                    />
                    <Input
                      type="date"
                      value={dateRange.to}
                      onChange={(e) =>
                        setDateRange({ ...dateRange, to: e.target.value })
                      }
                    />
                    <Button variant="outline">Filter</Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {
                          leads.filter(
                            (lead) =>
                              new Date(lead.createdAt).toDateString() ===
                              new Date().toDateString()
                          ).length
                        }
                      </div>
                      <div className="text-sm text-blue-700">Today's Leads</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {
                          leads.filter((lead) => {
                            const leadDate = new Date(lead.createdAt);
                            const yesterday = new Date();
                            yesterday.setDate(yesterday.getDate() - 1);
                            return (
                              leadDate.toDateString() ===
                              yesterday.toDateString()
                            );
                          }).length
                        }
                      </div>
                      <div className="text-sm text-green-700">
                        Yesterday's Leads
                      </div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {
                          leads.filter((lead) => {
                            const leadDate = new Date(lead.createdAt);
                            const weekAgo = new Date();
                            weekAgo.setDate(weekAgo.getDate() - 7);
                            return leadDate >= weekAgo;
                          }).length
                        }
                      </div>
                      <div className="text-sm text-purple-700">This Week</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
