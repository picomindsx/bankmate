"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Bell,
  Users,
  TrendingUp,
  Settings,
  Edit2,
  Check,
  X,
  BarChart3,
  Target,
  Building2,
  Phone,
  Filter,
  CalendarIcon,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { getBranches, updateBranchName } from "@/services/branch-service";
import { getLeads } from "@/services/lead-service";
import { Branch, Lead } from "@/types/common";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [editingBranch, setEditingBranch] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [notifications, setNotifications] = useState<Lead[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showTotalLeads, setShowTotalLeads] = useState(false);

  const [dateRange, setDateRange] = useState<
    "today" | "weekly" | "monthly" | "custom"
  >("today");
  const [customDateFrom, setCustomDateFrom] = useState<Date>();
  const [customDateTo, setCustomDateTo] = useState<Date>();
  const [staffFilter, setStaffFilter] = useState<string>("all");
  const [leadSourceFilter, setLeadSourceFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    getBranches().then((branchList) => setBranches(branchList));

    const recentLeads = getLeads().filter(
      (lead) =>
        new Date(lead.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000 // Last 24 hours
    );
    setNotifications(recentLeads);
  }, [user, router]);

  const getFilteredLeads = (branchId?: string) => {
    let leads = branchId ? getLeads(branchId) : getLeads();

    // Apply date filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (dateRange) {
      case "today":
        leads = leads.filter((lead) => {
          const leadDate = new Date(lead.createdAt);
          return leadDate >= today;
        });
        break;
      case "weekly":
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        leads = leads.filter((lead) => new Date(lead.createdAt) >= weekAgo);
        break;
      case "monthly":
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        leads = leads.filter((lead) => new Date(lead.createdAt) >= monthAgo);
        break;
      case "custom":
        if (customDateFrom && customDateTo) {
          leads = leads.filter((lead) => {
            const leadDate = new Date(lead.createdAt);
            return leadDate >= customDateFrom && leadDate <= customDateTo;
          });
        }
        break;
    }

    // Apply staff filter
    if (staffFilter !== "all") {
      leads = leads.filter((lead) => lead.assignedAgent === staffFilter);
    }

    // Apply lead source filter
    if (leadSourceFilter !== "all") {
      leads = leads.filter((lead) => lead.leadSource === leadSourceFilter);
    }

    return leads;
  };

  const getBranchStats = (branchId: string) => {
    const branchLeads = getFilteredLeads(branchId);
    return {
      total: branchLeads.length,
      newLeads: branchLeads.filter((lead) => !lead.assignedAgent).length,
      assignedLeads: branchLeads.filter(
        (lead) => lead.assignedAgent && lead.applicationStatus === "pending"
      ).length,
      sanctioned: branchLeads.filter(
        (lead) => lead.applicationStatus === "sanctioned"
      ).length,
      rejected: branchLeads.filter(
        (lead) => lead.applicationStatus === "rejected"
      ).length,
      processing: branchLeads.filter(
        (lead) => lead.applicationStatus === "pending"
      ).length,
    };
  };

  const handleEditBranch = (branchId: string, currentName: string) => {
    setEditingBranch(branchId);
    setEditName(currentName);
  };

  const handleSaveBranch = (branchId: string) => {
    if (updateBranchName(branchId, editName)) {
      getBranches().then((branchList) => setBranches(branchList));
      setEditingBranch(null);
      setEditName("");
    }
  };

  const handleCancelEdit = () => {
    setEditingBranch(null);
    setEditName("");
  };

  const totalFilteredLeads = getFilteredLeads().length;
  const newFilteredLeads = getFilteredLeads().filter(
    (lead) => !lead.assignedAgent
  ).length;

  if (!user || user.type !== "official") {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-50">
      <header className="backdrop-blur-xl bg-white/80 border-b border-gray-200/50 shadow-xl">
        <div className="flex h-20 items-center justify-between px-8">
          <div className="flex items-center gap-6">
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
                Bankmate Solutions
              </h1>
              <p className="text-black font-medium">Owner Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="backdrop-blur-sm bg-blue-50/80 hover:bg-blue-100/80 border-blue-300/50 text-blue-700"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>

            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative backdrop-blur-sm bg-gray-100/50 hover:bg-gray-200/50 border border-gray-300/50 text-gray-700"
              >
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 text-xs bg-gradient-to-r from-orange-500 to-red-500 animate-bounce">
                    {notifications.length}
                  </Badge>
                )}
              </Button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">
                      Recent Leads ({notifications.length})
                    </h3>
                  </div>
                  {notifications.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {notifications.map((lead) => (
                        <div
                          key={lead.id}
                          className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() =>
                            router.push(`/dashboard/leads/${lead.branchId}`)
                          }
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">
                                {lead.clientName}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {lead.leadType}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Phone className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-500">
                                  {lead.contactNumber}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant="outline" className="text-xs">
                                {branches.find((b) => b.id === lead.branchId)
                                  ?.name || "Unknown"}
                              </Badge>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(lead.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p>No recent leads</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-slate-800 font-semibold block">
                  {user.name}
                </span>
                <span className="text-gray-600/70 text-sm">Owner Access</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="backdrop-blur-sm bg-red-50/80 hover:bg-red-100/80 border-red-300/50 text-red-700 hover:text-red-800 transform hover:scale-105 transition-all duration-200"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="border-t border-gray-200/50 bg-white/90 backdrop-blur-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Date Range
                </label>
                <Select
                  value={dateRange}
                  onValueChange={(value: any) => setDateRange(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {dateRange === "custom" && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      From Date
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "justify-start text-left font-normal",
                            !customDateFrom && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {customDateFrom
                            ? format(customDateFrom, "PPP")
                            : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={customDateFrom}
                          onSelect={setCustomDateFrom}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      To Date
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "justify-start text-left font-normal",
                            !customDateTo && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {customDateTo
                            ? format(customDateTo, "PPP")
                            : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={customDateTo}
                          onSelect={setCustomDateTo}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Staff Filter
                </label>
                <Select value={staffFilter} onValueChange={setStaffFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Staff</SelectItem>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    <SelectItem value="john_doe">John Doe</SelectItem>
                    <SelectItem value="jane_smith">Jane Smith</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Lead Source
                </label>
                <Select
                  value={leadSourceFilter}
                  onValueChange={setLeadSourceFilter}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="social_media">Social Media</SelectItem>
                    <SelectItem value="walk_in">Walk-in</SelectItem>
                    <SelectItem value="data_sheet">Data Sheet</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-72 backdrop-blur-xl bg-white/60 border-r border-gray-200/50 min-h-[calc(100vh-5rem)] shadow-xl">
          <nav className="p-6 space-y-3">
            <Link href="/dashboard">
              <Button
                variant="ghost"
                className="w-full justify-start h-12 backdrop-blur-sm bg-gray-100/80 hover:bg-gray-200/80 border border-gray-300/50 text-gray-800 hover:text-gray-900 transform hover:scale-105 transition-all duration-200"
              >
                <BarChart3 className="mr-3 h-5 w-5" />
                Dashboard Overview
              </Button>
            </Link>
            <Link href="/dashboard/lead-pipeline">
              <Button
                variant="ghost"
                className="w-full justify-start h-12 backdrop-blur-sm bg-white/50 hover:bg-gray-50/80 border border-slate-200/50 text-slate-700 hover:text-gray-800 transform hover:scale-105 transition-all duration-200"
              >
                <Target className="mr-3 h-5 w-5" />
                Lead Management
              </Button>
            </Link>
            <Link href="/dashboard/staff">
              <Button
                variant="ghost"
                className="w-full justify-start h-12 backdrop-blur-sm bg-white/50 hover:bg-gray-50/80 border border-slate-200/50 text-slate-700 hover:text-gray-800 transform hover:scale-105 transition-all duration-200"
              >
                <Users className="mr-3 h-5 w-5" />
                Staff Management
              </Button>
            </Link>
            <Link href="/dashboard/reports">
              <Button
                variant="ghost"
                className="w-full justify-start h-12 backdrop-blur-sm bg-white/50 hover:bg-gray-50/80 border border-slate-200/50 text-slate-700 hover:text-gray-800 transform hover:scale-105 transition-all duration-200"
              >
                <TrendingUp className="mr-3 h-5 w-5" />
                Performance & Reports
              </Button>
            </Link>
            <Link href="/dashboard/settings">
              <Button
                variant="ghost"
                className="w-full justify-start h-12 backdrop-blur-sm bg-white/50 hover:bg-gray-50/80 border border-slate-200/50 text-slate-700 hover:text-gray-800 transform hover:scale-105 transition-all duration-200"
              >
                <Settings className="mr-3 h-5 w-5" />
                Settings & Integration
              </Button>
            </Link>
          </nav>
        </aside>

        <main className="flex-1 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <Card className="backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-300/30 hover:from-blue-500/20 hover:to-indigo-500/20 transition-all duration-300 transform hover:scale-105 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-700">
                  Total Leads
                </CardTitle>
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-800">
                  {totalFilteredLeads}
                </div>
                <p className="text-xs text-blue-600">Filtered results</p>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-300/30 hover:from-orange-500/20 hover:to-red-500/20 transition-all duration-300 transform hover:scale-105 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-orange-700">
                  New Leads
                </CardTitle>
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-800">
                  {newFilteredLeads}
                </div>
                <p className="text-xs text-orange-600">Awaiting assignment</p>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-300/30 hover:from-green-500/20 hover:to-emerald-500/20 transition-all duration-300 transform hover:scale-105 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-700">
                  Active Branches
                </CardTitle>
                <Building2 className="h-6 w-6 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-800">
                  {branches.length}
                </div>
                <p className="text-xs text-green-600">Operational units</p>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-violet-500/10 border-purple-300/30 hover:from-purple-500/20 hover:to-violet-500/20 transition-all duration-300 transform hover:scale-105 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-700">
                  Notifications
                </CardTitle>
                <Bell className="h-6 w-6 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-800">
                  {notifications.length}
                </div>
                <p className="text-xs text-purple-600">Recent activity</p>
              </CardContent>
            </Card>
          </div>

          <div className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-teal-700 bg-clip-text text-transparent">
                Branch Management ({branches.length} Branches)
              </h2>
              <div className="flex gap-3">
                <Button
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  onClick={() => setShowTotalLeads(!showTotalLeads)}
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Total Leads Overview
                </Button>
              </div>
            </div>

            {showTotalLeads && (
              <Card className="mb-6 backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-300/30">
                <CardHeader>
                  <CardTitle className="text-purple-700 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Total Leads Overview - All Branches
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 rounded-lg bg-blue-50 border border-blue-200">
                      <div className="text-2xl font-bold text-blue-700">
                        {totalFilteredLeads}
                      </div>
                      <div className="text-sm text-blue-600">Total Leads</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-green-50 border border-green-200">
                      <div className="text-2xl font-bold text-green-700">
                        {
                          getFilteredLeads().filter(
                            (lead) => lead.applicationStatus === "sanctioned"
                          ).length
                        }
                      </div>
                      <div className="text-sm text-green-600">Sanctioned</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                      <div className="text-2xl font-bold text-yellow-700">
                        {
                          getFilteredLeads().filter(
                            (lead) => lead.applicationStatus === "pending"
                          ).length
                        }
                      </div>
                      <div className="text-sm text-yellow-600">Processing</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-purple-50 border border-purple-200">
                      <div className="text-2xl font-bold text-purple-700">
                        {
                          getFilteredLeads().filter(
                            (lead) => lead.applicationStatus === "disbursed"
                          ).length
                        }
                      </div>
                      <div className="text-sm text-purple-600">Disbursed</div>
                    </div>
                  </div>

                  {/* Branch-wise breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {branches.map((branch) => {
                      const stats = getBranchStats(branch.id);
                      return (
                        <div
                          key={branch.id}
                          className="p-4 bg-white/50 rounded-lg border border-purple-200"
                        >
                          <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            {branch.name}
                          </h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Total:</span>
                              <span className="font-medium text-blue-700">
                                {stats.total}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Sanctioned:</span>
                              <span className="font-medium text-green-700">
                                {stats.sanctioned}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Processing:</span>
                              <span className="font-medium text-yellow-700">
                                {stats.processing}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">New Leads:</span>
                              <span className="font-medium text-orange-700">
                                {stats.newLeads}
                              </span>
                            </div>
                          </div>
                          <Link href={`/dashboard/leads/${branch.id}`}>
                            <Button
                              size="sm"
                              className="w-full mt-3 bg-purple-600 hover:bg-purple-700 text-white"
                            >
                              View Details
                            </Button>
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {branches.map((branch, index) => {
                const stats = getBranchStats(branch.id);
                const branchLeads = getFilteredLeads(branch.id);

                // Group leads by loan type
                const leadsByType = branchLeads.reduce((acc, lead) => {
                  const type = lead.leadType || "other";
                  acc[type] = (acc[type] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>);

                return (
                  <Card
                    key={branch.id}
                    className="backdrop-blur-xl bg-white/70 border-slate-200/50 hover:bg-white/80 transition-all duration-500 transform hover:scale-105 shadow-xl relative"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {stats.newLeads > 0 && (
                      <Badge className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white animate-pulse">
                        {stats.newLeads} New
                      </Badge>
                    )}
                    {stats.assignedLeads > 0 && (
                      <Badge className="absolute -top-2 -left-2 bg-blue-500 hover:bg-blue-600 text-white">
                        {stats.assignedLeads} Assigned
                      </Badge>
                    )}

                    <CardHeader>
                      <div className="flex items-center justify-between">
                        {editingBranch === branch.id ? (
                          <div className="flex items-center gap-2 flex-1">
                            <Input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="flex-1 bg-white/80 border-teal-300/50 text-slate-800 placeholder:text-slate-500"
                              autoFocus
                            />
                            <Button
                              size="sm"
                              onClick={() => handleSaveBranch(branch.id)}
                              className="bg-emerald-600 hover:bg-emerald-700"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancelEdit}
                              className="border-slate-300 text-slate-700 hover:bg-slate-100 bg-transparent"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <CardTitle className="text-xl text-slate-800 flex items-center gap-2">
                              <Building2 className="h-5 w-5 text-teal-600" />
                              {branch.name}
                            </CardTitle>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                handleEditBranch(branch.id, branch.name)
                              }
                              className="text-slate-600 hover:bg-slate-100"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-center p-2 rounded-lg bg-blue-50 border border-blue-200">
                            <div className="text-sm font-bold text-blue-700">
                              {stats.total}
                            </div>
                            <div className="text-xs text-blue-600">Total</div>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-orange-50 border border-orange-200">
                            <div className="text-sm font-bold text-orange-700">
                              {stats.newLeads}
                            </div>
                            <div className="text-xs text-orange-600">
                              New Leads
                            </div>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-green-50 border border-green-200">
                            <div className="text-sm font-bold text-green-700">
                              {stats.sanctioned}
                            </div>
                            <div className="text-xs text-green-600">
                              Sanctioned
                            </div>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-red-50 border border-red-200">
                            <div className="text-sm font-bold text-red-700">
                              {stats.rejected}
                            </div>
                            <div className="text-xs text-red-600">Rejected</div>
                          </div>
                        </div>

                        {Object.keys(leadsByType).length > 0 && (
                          <div className="border-t pt-3">
                            <h5 className="text-xs font-medium text-gray-600 mb-2">
                              Loan Categories:
                            </h5>
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(leadsByType).map(
                                ([type, count]) => (
                                  <Badge
                                    key={type}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {type.replace("_", " ")}: {count}
                                  </Badge>
                                )
                              )}
                            </div>
                          </div>
                        )}

                        <Link href={`/dashboard/leads/${branch.id}`}>
                          <Button className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white transform hover:scale-105 transition-all duration-200">
                            <Target className="mr-2 h-4 w-4" />
                            Manage Branch Leads
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
