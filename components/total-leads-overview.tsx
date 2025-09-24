"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  Users,
  Target,
  Calendar,
  Filter,
  Search,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Building2,
  Phone,
  Mail,
  DollarSign,
  Percent,
} from "lucide-react"
import { getLeads, getBranches, getStaff, type Lead } from "@/lib/auth"

interface LeadAnalytics {
  totalLeads: number
  newLeads: number
  conversionRate: number
  averageValue: number
  topPerformingBranch: string
  leadsByStatus: Record<string, number>
  leadsByType: Record<string, number>
  leadsBySource: Record<string, number>
  monthlyTrend: Array<{ month: string; leads: number; conversions: number }>
  recentActivity: Array<{ id: string; action: string; timestamp: string; lead: string }>
}

export function TotalLeadsOverview() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBranch, setSelectedBranch] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [dateRange, setDateRange] = useState("30")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const branches = getBranches()
  const staff = getStaff()
  const allLeads = getLeads()

  const analytics: LeadAnalytics = useMemo(() => {
    const filteredLeads = allLeads.filter((lead) => {
      const matchesSearch =
        lead.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.contactNumber.includes(searchTerm) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesBranch = selectedBranch === "all" || lead.branchId === selectedBranch
      const matchesStatus = selectedStatus === "all" || lead.applicationStatus === selectedStatus
      const matchesType = selectedType === "all" || lead.leadType === selectedType

      const leadDate = new Date(lead.createdAt)
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - Number.parseInt(dateRange))
      const matchesDate = leadDate >= cutoffDate

      return matchesSearch && matchesBranch && matchesStatus && matchesType && matchesDate
    })

    const totalLeads = filteredLeads.length
    const newLeads = filteredLeads.filter((lead) => {
      const leadDate = new Date(lead.createdAt)
      const today = new Date()
      return leadDate.toDateString() === today.toDateString()
    }).length

    const sanctionedLeads = filteredLeads.filter((lead) => lead.applicationStatus === "sanctioned").length
    const conversionRate = totalLeads > 0 ? (sanctionedLeads / totalLeads) * 100 : 0

    const averageValue = filteredLeads.reduce((sum, lead) => sum + lead.cost, 0) / (totalLeads || 1)

    // Branch performance
    const branchLeadCounts = branches.map((branch) => ({
      name: branch.name,
      count: filteredLeads.filter((lead) => lead.branchId === branch.id).length,
    }))
    const topPerformingBranch = branchLeadCounts.reduce((max, branch) => (branch.count > max.count ? branch : max), {
      name: "None",
      count: 0,
    }).name

    // Status distribution
    const leadsByStatus = filteredLeads.reduce(
      (acc, lead) => {
        acc[lead.applicationStatus] = (acc[lead.applicationStatus] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Type distribution
    const leadsByType = filteredLeads.reduce(
      (acc, lead) => {
        acc[lead.leadType] = (acc[lead.leadType] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Source distribution
    const leadsBySource = filteredLeads.reduce(
      (acc, lead) => {
        acc[lead.leadSource] = (acc[lead.leadSource] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Monthly trend (last 6 months)
    const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthName = date.toLocaleDateString("en-US", { month: "short" })

      const monthLeads = allLeads.filter((lead) => {
        const leadDate = new Date(lead.createdAt)
        return leadDate.getMonth() === date.getMonth() && leadDate.getFullYear() === date.getFullYear()
      })

      return {
        month: monthName,
        leads: monthLeads.length,
        conversions: monthLeads.filter((lead) => lead.applicationStatus === "sanctioned").length,
      }
    }).reverse()

    // Recent activity
    const recentActivity = filteredLeads
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 10)
      .map((lead) => ({
        id: lead.id,
        action: `Lead ${lead.applicationStatus}`,
        timestamp: lead.updatedAt,
        lead: lead.clientName,
      }))

    return {
      totalLeads,
      newLeads,
      conversionRate,
      averageValue,
      topPerformingBranch,
      leadsByStatus,
      leadsByType,
      leadsBySource,
      monthlyTrend,
      recentActivity,
    }
  }, [allLeads, branches, searchTerm, selectedBranch, selectedStatus, selectedType, dateRange])

  const filteredAndSortedLeads = useMemo(() => {
    const filtered = allLeads.filter((lead) => {
      const matchesSearch =
        lead.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.contactNumber.includes(searchTerm) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesBranch = selectedBranch === "all" || lead.branchId === selectedBranch
      const matchesStatus = selectedStatus === "all" || lead.applicationStatus === selectedStatus
      const matchesType = selectedType === "all" || lead.leadType === selectedType

      const leadDate = new Date(lead.createdAt)
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - Number.parseInt(dateRange))
      const matchesDate = leadDate >= cutoffDate

      return matchesSearch && matchesBranch && matchesStatus && matchesType && matchesDate
    })

    // Sort leads
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Lead]
      let bValue: any = b[sortBy as keyof Lead]

      if (sortBy === "createdAt" || sortBy === "updatedAt") {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      }

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [allLeads, searchTerm, selectedBranch, selectedStatus, selectedType, dateRange, sortBy, sortOrder])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sanctioned":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-orange-600" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "login":
        return <AlertCircle className="h-4 w-4 text-blue-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sanctioned":
        return "bg-green-500 text-white"
      case "pending":
        return "bg-orange-500 text-white"
      case "rejected":
        return "bg-red-500 text-white"
      case "login":
        return "bg-blue-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const exportData = () => {
    const csvContent = [
      ["Name", "Phone", "Email", "Type", "Status", "Branch", "Created", "Value"].join(","),
      ...filteredAndSortedLeads.map((lead) =>
        [
          lead.clientName,
          lead.contactNumber,
          lead.email,
          lead.leadType,
          lead.applicationStatus,
          branches.find((b) => b.id === lead.branchId)?.name || "Unknown",
          new Date(lead.createdAt).toLocaleDateString(),
          lead.cost.toString(),
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `leads-export-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="backdrop-blur-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-400/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-100">Total Leads</p>
                <p className="text-3xl font-bold text-white">{analytics.totalLeads}</p>
                <p className="text-xs text-blue-200 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />+{analytics.newLeads} today
                </p>
              </div>
              <Target className="h-12 w-12 text-blue-300" />
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-400/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-100">Conversion Rate</p>
                <p className="text-3xl font-bold text-white">{analytics.conversionRate.toFixed(1)}%</p>
                <p className="text-xs text-green-200 flex items-center gap-1">
                  <Percent className="h-3 w-3" />
                  Success rate
                </p>
              </div>
              <TrendingUp className="h-12 w-12 text-green-300" />
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-400/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-100">Average Value</p>
                <p className="text-3xl font-bold text-white">₹{(analytics.averageValue / 100000).toFixed(1)}L</p>
                <p className="text-xs text-purple-200 flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Per lead
                </p>
              </div>
              <BarChart3 className="h-12 w-12 text-purple-300" />
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-400/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-100">Top Branch</p>
                <p className="text-xl font-bold text-white">{analytics.topPerformingBranch}</p>
                <p className="text-xs text-orange-200 flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  Best performer
                </p>
              </div>
              <Activity className="h-12 w-12 text-orange-300" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card className="backdrop-blur-xl bg-white/10 border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Branch</label>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white"
              >
                <option value="all">All Branches</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white"
              >
                <option value="all">All Statuses</option>
                <option value="login">Login</option>
                <option value="pending">Pending</option>
                <option value="sanctioned">Sanctioned</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={exportData}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white/10 border-white/20">
          <TabsTrigger value="overview" className="text-white data-[state=active]:bg-white/20">
            Overview
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-white data-[state=active]:bg-white/20">
            Analytics
          </TabsTrigger>
          <TabsTrigger value="details" className="text-white data-[state=active]:bg-white/20">
            Lead Details
          </TabsTrigger>
          <TabsTrigger value="activity" className="text-white data-[state=active]:bg-white/20">
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Status Distribution */}
            <Card className="backdrop-blur-xl bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(analytics.leadsByStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(status)}
                      <span className="text-white capitalize">{status}</span>
                    </div>
                    <Badge className={getStatusColor(status)}>{count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Lead Types */}
            <Card className="backdrop-blur-xl bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Lead Types
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(analytics.leadsByType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-white">{type}</span>
                    <Badge variant="outline" className="border-white/20 text-white">
                      {count}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Lead Sources */}
            <Card className="backdrop-blur-xl bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Lead Sources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(analytics.leadsBySource).map(([source, count]) => (
                  <div key={source} className="flex items-center justify-between">
                    <span className="text-white">{source}</span>
                    <Badge variant="outline" className="border-white/20 text-white">
                      {count}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card className="backdrop-blur-xl bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Monthly Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.monthlyTrend.map((month, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-blue-300" />
                      <span className="text-white font-medium">{month.month}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-white font-semibold">{month.leads} leads</div>
                        <div className="text-green-300 text-sm">{month.conversions} conversions</div>
                      </div>
                      <div className="w-20 bg-white/10 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                          style={{ width: `${month.leads > 0 ? (month.conversions / month.leads) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          <Card className="backdrop-blur-xl bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Lead Details ({filteredAndSortedLeads.length})
                </div>
                <div className="flex gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                  >
                    <option value="createdAt">Created Date</option>
                    <option value="clientName">Name</option>
                    <option value="applicationStatus">Status</option>
                    <option value="cost">Value</option>
                  </select>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    {sortOrder === "asc" ? "↑" : "↓"}
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredAndSortedLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-white">{lead.clientName}</h4>
                        <Badge className={getStatusColor(lead.applicationStatus)}>{lead.applicationStatus}</Badge>
                        <Badge variant="outline" className="border-white/20 text-white">
                          {lead.leadType}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-white/70">
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {lead.contactNumber}
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {lead.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {branches.find((b) => b.id === lead.branchId)?.name}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-semibold">₹{(lead.cost / 100000).toFixed(1)}L</div>
                      <div className="text-white/70 text-sm">{new Date(lead.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card className="backdrop-blur-xl bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                    <div className="flex-1">
                      <div className="text-white font-medium">{activity.action}</div>
                      <div className="text-white/70 text-sm">{activity.lead}</div>
                    </div>
                    <div className="text-white/70 text-sm">{new Date(activity.timestamp).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
