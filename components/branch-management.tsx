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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Building2,
  MapPin,
  Phone,
  Mail,
  Clock,
  Target,
  TrendingUp,
  Users,
  Plus,
  Edit,
  Eye,
  BarChart3,
  Search,
  Filter,
  Download,
  RefreshCw,
} from "lucide-react";
import {
  getBranches,
  getBranchStatistics,
  addBranch,
} from "@/services/branch-service";
import { Branch } from "@/types/common";

interface BranchManagementProps {
  currentUser: any;
}

export default function BranchManagement({
  currentUser,
}: BranchManagementProps) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [filteredBranches, setFilteredBranches] = useState<Branch[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedZone, setSelectedZone] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const [newBranch, setNewBranch] = useState({
    name: "",
    code: "",
    address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
    },
    contact: {
      phone: "",
      email: "",
      fax: "",
    },
    manager: {
      name: "",
      phone: "",
      email: "",
    },
    region: "",
    zone: "",
    type: "main" as Branch["type"],
    parentBranchId: "",
    establishedDate: "",
    operatingHours: {
      weekdays: { open: "09:00", close: "18:00" },
      saturday: { open: "09:00", close: "14:00" },
      sunday: { open: "10:00", close: "13:00" },
    },
    services: [] as string[],
    targetMetrics: {
      monthlyLeadTarget: 100,
      monthlyRevenueTarget: 30000000,
      conversionRateTarget: 20,
    },
  });

  useEffect(() => {
    const branchData = getBranches();
    setBranches(branchData);
    setFilteredBranches(branchData);
  }, []);

  useEffect(() => {
    const filtered = branches.filter((branch) => {
      const matchesSearch =
        branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.address.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.manager.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRegion =
        selectedRegion === "all" || branch.region === selectedRegion;
      const matchesZone =
        selectedZone === "all" || branch.zone === selectedZone;
      const matchesType =
        selectedType === "all" || branch.type === selectedType;

      return matchesSearch && matchesRegion && matchesZone && matchesType;
    });

    setFilteredBranches(filtered);
  }, [branches, searchTerm, selectedRegion, selectedZone, selectedType]);

  const statistics = getBranchStatistics();
  const regions = [...new Set(branches.map((b) => b.region))];
  const zones = [...new Set(branches.map((b) => b.zone))];

  const handleAddBranch = () => {
    const branchData = {
      ...newBranch,
      editable: true,
      isActive: true,
      performance: {
        currentMonthLeads: 0,
        currentMonthRevenue: 0,
        conversionRate: 0,
        lastUpdated: new Date().toISOString(),
      },
    };

    const createdBranch = addBranch(branchData);
    setBranches(getBranches());
    setIsAddDialogOpen(false);
    // Reset form
    setNewBranch({
      name: "",
      code: "",
      address: {
        street: "",
        city: "",
        state: "",
        pincode: "",
        country: "India",
      },
      contact: { phone: "", email: "", fax: "" },
      manager: { name: "", phone: "", email: "" },
      region: "",
      zone: "",
      type: "main",
      parentBranchId: "",
      establishedDate: "",
      operatingHours: {
        weekdays: { open: "09:00", close: "18:00" },
        saturday: { open: "09:00", close: "14:00" },
        sunday: { open: "10:00", close: "13:00" },
      },
      services: [],
      targetMetrics: {
        monthlyLeadTarget: 100,
        monthlyRevenueTarget: 30000000,
        conversionRateTarget: 20,
      },
    });
  };

  const getTypeColor = (type: Branch["type"]) => {
    switch (type) {
      case "main":
        return "bg-blue-500";
      case "sub":
        return "bg-green-500";
      case "service":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPerformanceColor = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 90) return "text-green-500";
    if (percentage >= 70) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="space-y-6">
      {/* Branch Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="backdrop-blur-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-400/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-100">
                  Total Branches
                </p>
                <p className="text-3xl font-bold text-white">
                  {statistics.total}
                </p>
                <p className="text-xs text-blue-200">Active branches</p>
              </div>
              <Building2 className="h-12 w-12 text-blue-300" />
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-400/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-100">
                  Target Achievement
                </p>
                <p className="text-3xl font-bold text-white">
                  {(
                    (statistics.totalCurrentLeads /
                      statistics.totalTargetLeads) *
                    100
                  ).toFixed(1)}
                  %
                </p>
                <p className="text-xs text-green-200">Lead targets</p>
              </div>
              <Target className="h-12 w-12 text-green-300" />
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-400/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-100">
                  Revenue Progress
                </p>
                <p className="text-3xl font-bold text-white">
                  ₹{(statistics.totalCurrentRevenue / 10000000).toFixed(1)}Cr
                </p>
                <p className="text-xs text-purple-200">Current month</p>
              </div>
              <TrendingUp className="h-12 w-12 text-purple-300" />
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-400/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-100">
                  Avg Conversion
                </p>
                <p className="text-3xl font-bold text-white">
                  {statistics.averageConversionRate.toFixed(1)}%
                </p>
                <p className="text-xs text-orange-200">Across all branches</p>
              </div>
              <BarChart3 className="h-12 w-12 text-orange-300" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card className="backdrop-blur-xl bg-white/10 border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Branch Filters & Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search branches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>

            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white"
            >
              <option value="all">All Regions</option>
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>

            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white"
            >
              <option value="all">All Zones</option>
              {zones.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white"
            >
              <option value="all">All Types</option>
              <option value="main">Main Branch</option>
              <option value="sub">Sub Branch</option>
              <option value="service">Service Branch</option>
            </select>
          </div>

          <div className="flex gap-2">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Branch
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-gray-700 max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    Add New Branch
                  </DialogTitle>
                  <DialogDescription className="text-gray-300">
                    Create a new branch with comprehensive details and settings
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-white">Branch Name</Label>
                      <Input
                        value={newBranch.name}
                        onChange={(e) =>
                          setNewBranch({ ...newBranch, name: e.target.value })
                        }
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-white">Branch Code</Label>
                      <Input
                        value={newBranch.code}
                        onChange={(e) =>
                          setNewBranch({ ...newBranch, code: e.target.value })
                        }
                        className="bg-white/10 border-white/20 text-white"
                        placeholder="e.g., MUM001"
                      />
                    </div>
                    <div>
                      <Label className="text-white">Region</Label>
                      <select
                        value={newBranch.region}
                        onChange={(e) =>
                          setNewBranch({ ...newBranch, region: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white"
                      >
                        <option value="">Select Region</option>
                        <option value="North">North</option>
                        <option value="South">South</option>
                        <option value="East">East</option>
                        <option value="West">West</option>
                        <option value="Central">Central</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-white">Zone</Label>
                      <select
                        value={newBranch.zone}
                        onChange={(e) =>
                          setNewBranch({ ...newBranch, zone: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white"
                      >
                        <option value="">Select Zone</option>
                        <option value="Metro">Metro</option>
                        <option value="Urban">Urban</option>
                        <option value="Rural">Rural</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-white">Branch Type</Label>
                      <select
                        value={newBranch.type}
                        onChange={(e) =>
                          setNewBranch({
                            ...newBranch,
                            type: e.target.value as Branch["type"],
                          })
                        }
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white"
                      >
                        <option value="main">Main Branch</option>
                        <option value="sub">Sub Branch</option>
                        <option value="service">Service Branch</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-white">Manager Name</Label>
                      <Input
                        value={newBranch.manager.name}
                        onChange={(e) =>
                          setNewBranch({
                            ...newBranch,
                            manager: {
                              ...newBranch.manager,
                              name: e.target.value,
                            },
                          })
                        }
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-white">Manager Phone</Label>
                      <Input
                        value={newBranch.manager.phone}
                        onChange={(e) =>
                          setNewBranch({
                            ...newBranch,
                            manager: {
                              ...newBranch.manager,
                              phone: e.target.value,
                            },
                          })
                        }
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-white">Manager Email</Label>
                      <Input
                        value={newBranch.manager.email}
                        onChange={(e) =>
                          setNewBranch({
                            ...newBranch,
                            manager: {
                              ...newBranch.manager,
                              email: e.target.value,
                            },
                          })
                        }
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-white">Branch Phone</Label>
                      <Input
                        value={newBranch.contact.phone}
                        onChange={(e) =>
                          setNewBranch({
                            ...newBranch,
                            contact: {
                              ...newBranch.contact,
                              phone: e.target.value,
                            },
                          })
                        }
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-white">Branch Email</Label>
                      <Input
                        value={newBranch.contact.email}
                        onChange={(e) =>
                          setNewBranch({
                            ...newBranch,
                            contact: {
                              ...newBranch.contact,
                              email: e.target.value,
                            },
                          })
                        }
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <Label className="text-white">Address</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <Input
                      placeholder="Street Address"
                      value={newBranch.address.street}
                      onChange={(e) =>
                        setNewBranch({
                          ...newBranch,
                          address: {
                            ...newBranch.address,
                            street: e.target.value,
                          },
                        })
                      }
                      className="bg-white/10 border-white/20 text-white"
                    />
                    <Input
                      placeholder="City"
                      value={newBranch.address.city}
                      onChange={(e) =>
                        setNewBranch({
                          ...newBranch,
                          address: {
                            ...newBranch.address,
                            city: e.target.value,
                          },
                        })
                      }
                      className="bg-white/10 border-white/20 text-white"
                    />
                    <Input
                      placeholder="State"
                      value={newBranch.address.state}
                      onChange={(e) =>
                        setNewBranch({
                          ...newBranch,
                          address: {
                            ...newBranch.address,
                            state: e.target.value,
                          },
                        })
                      }
                      className="bg-white/10 border-white/20 text-white"
                    />
                    <Input
                      placeholder="Pincode"
                      value={newBranch.address.pincode}
                      onChange={(e) =>
                        setNewBranch({
                          ...newBranch,
                          address: {
                            ...newBranch.address,
                            pincode: e.target.value,
                          },
                        })
                      }
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleAddBranch}
                  className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-600"
                >
                  Create Branch
                </Button>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Branch List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBranches.map((branch) => (
          <Card
            key={branch.id}
            className="backdrop-blur-xl bg-white/10 border-white/20 hover:bg-white/15 transition-all duration-300"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    {branch.name}
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    {branch.code} • {branch.region} Region
                  </CardDescription>
                </div>
                <Badge
                  className={`${getTypeColor(branch.type)} text-white border-0`}
                >
                  {branch.type.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <MapPin className="h-4 w-4" />
                  {branch.address.city}, {branch.address.state}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Phone className="h-4 w-4" />
                  {branch.contact.phone}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Users className="h-4 w-4" />
                  {branch.manager.name}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-2 rounded bg-white/5">
                  <div
                    className={`text-lg font-bold ${getPerformanceColor(
                      branch.performance.currentMonthLeads,
                      branch.targetMetrics.monthlyLeadTarget
                    )}`}
                  >
                    {branch.performance.currentMonthLeads}
                  </div>
                  <div className="text-xs text-gray-400">
                    Leads ({branch.targetMetrics.monthlyLeadTarget})
                  </div>
                </div>
                <div className="text-center p-2 rounded bg-white/5">
                  <div
                    className={`text-lg font-bold ${getPerformanceColor(
                      branch.performance.conversionRate,
                      branch.targetMetrics.conversionRateTarget
                    )}`}
                  >
                    {branch.performance.conversionRate.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-400">Conversion</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedBranch(branch);
                    setIsViewDialogOpen(true);
                  }}
                  className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedBranch(branch);
                    setIsEditDialogOpen(true);
                  }}
                  className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View Branch Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {selectedBranch?.name}
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              Complete branch information and performance metrics
            </DialogDescription>
          </DialogHeader>

          {selectedBranch && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-white/10">
                <TabsTrigger
                  value="overview"
                  className="text-white data-[state=active]:bg-white/20"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="performance"
                  className="text-white data-[state=active]:bg-white/20"
                >
                  Performance
                </TabsTrigger>
                <TabsTrigger
                  value="contact"
                  className="text-white data-[state=active]:bg-white/20"
                >
                  Contact
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="text-white data-[state=active]:bg-white/20"
                >
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white text-sm">
                        Branch Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Code:</span>
                        <span className="text-white">
                          {selectedBranch.code}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Type:</span>
                        <Badge
                          className={`${getTypeColor(
                            selectedBranch.type
                          )} text-white border-0 text-xs`}
                        >
                          {selectedBranch.type.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Region:</span>
                        <span className="text-white">
                          {selectedBranch.region}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Zone:</span>
                        <span className="text-white">
                          {selectedBranch.zone}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Established:</span>
                        <span className="text-white">
                          {new Date(
                            selectedBranch.establishedDate
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white text-sm">
                        Address
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-white">
                      <div>{selectedBranch.address.street}</div>
                      <div>
                        {selectedBranch.address.city},{" "}
                        {selectedBranch.address.state}
                      </div>
                      <div>
                        {selectedBranch.address.pincode},{" "}
                        {selectedBranch.address.country}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">
                      Services Offered
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedBranch.services.map((service, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="border-white/20 text-white"
                        >
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="performance" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white text-sm flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Lead Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-white mb-2">
                        {selectedBranch.performance.currentMonthLeads}
                      </div>
                      <div className="text-sm text-gray-400">
                        Target: {selectedBranch.targetMetrics.monthlyLeadTarget}
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                          style={{
                            width: `${Math.min(
                              (selectedBranch.performance.currentMonthLeads /
                                selectedBranch.targetMetrics
                                  .monthlyLeadTarget) *
                                100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white text-sm flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Revenue Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-white mb-2">
                        ₹
                        {(
                          selectedBranch.performance.currentMonthRevenue /
                          10000000
                        ).toFixed(1)}
                        Cr
                      </div>
                      <div className="text-sm text-gray-400">
                        Target: ₹
                        {(
                          selectedBranch.targetMetrics.monthlyRevenueTarget /
                          10000000
                        ).toFixed(1)}
                        Cr
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                          style={{
                            width: `${Math.min(
                              (selectedBranch.performance.currentMonthRevenue /
                                selectedBranch.targetMetrics
                                  .monthlyRevenueTarget) *
                                100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white text-sm flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Conversion Rate
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-white mb-2">
                        {selectedBranch.performance.conversionRate.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-400">
                        Target:{" "}
                        {selectedBranch.targetMetrics.conversionRateTarget}%
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                        <div
                          className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full"
                          style={{
                            width: `${Math.min(
                              (selectedBranch.performance.conversionRate /
                                selectedBranch.targetMetrics
                                  .conversionRateTarget) *
                                100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="contact" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white text-sm">
                        Branch Contact
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-white">
                          {selectedBranch.contact.phone}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-white">
                          {selectedBranch.contact.email}
                        </span>
                      </div>
                      {selectedBranch.contact.fax && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-white">
                            Fax: {selectedBranch.contact.fax}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white text-sm">
                        Branch Manager
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-white">
                          {selectedBranch.manager.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-white">
                          {selectedBranch.manager.phone}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-white">
                          {selectedBranch.manager.email}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Operating Hours
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Weekdays:</span>
                      <span className="text-white">
                        {selectedBranch.operatingHours.weekdays.open} -{" "}
                        {selectedBranch.operatingHours.weekdays.close}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Saturday:</span>
                      <span className="text-white">
                        {selectedBranch.operatingHours.saturday.open} -{" "}
                        {selectedBranch.operatingHours.saturday.close}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Sunday:</span>
                      <span className="text-white">
                        {selectedBranch.operatingHours.sunday.open} -{" "}
                        {selectedBranch.operatingHours.sunday.close}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">
                      Branch Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge
                      className={
                        selectedBranch.isActive ? "bg-green-500" : "bg-red-500"
                      }
                    >
                      {selectedBranch.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
