"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  FileText,
  Upload,
  Download,
  Folder,
  Search,
  ArrowLeft,
  Bell,
  File,
  User,
  CreditCard,
  Home,
  Briefcase,
  Car,
  GraduationCap,
  Heart,
  Plane,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface FileItem {
  id: string
  name: string
  type: "file" | "folder"
  size?: string
  uploadDate: Date
  uploadedBy: string
  category: string
  loanType?: string
  leadId?: string
  status: "pending" | "approved" | "rejected" | "processing"
  branch?: string
  assignedTo?: string
}

const loanTypes = [
  { id: "home", name: "Home Loan", icon: Home, color: "bg-blue-500" },
  { id: "personal", name: "Personal Loan", icon: User, color: "bg-green-500" },
  { id: "business", name: "Business Loan", icon: Briefcase, color: "bg-purple-500" },
  { id: "car", name: "Car Loan", icon: Car, color: "bg-red-500" },
  { id: "education", name: "Education Loan", icon: GraduationCap, color: "bg-yellow-500" },
  { id: "medical", name: "Medical Loan", icon: Heart, color: "bg-pink-500" },
  { id: "travel", name: "Travel Loan", icon: Plane, color: "bg-indigo-500" },
  { id: "credit-card", name: "Credit Card", icon: CreditCard, color: "bg-orange-500" },
]

export default function FileManagerPage() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const [files, setFiles] = useState<FileItem[]>([
    {
      id: "1",
      name: "Aadhar Card - Rajesh Kumar.pdf",
      type: "file",
      size: "2.1 MB",
      uploadDate: new Date("2024-01-15"),
      uploadedBy: "Rajesh Kumar",
      category: "Identity Documents",
      loanType: "home",
      leadId: "LD001",
      status: "approved",
      branch: "Mumbai Central",
      assignedTo: "Priya Sharma",
    },
    {
      id: "2",
      name: "Salary Slips - Q4 2023",
      type: "folder",
      uploadDate: new Date("2024-01-10"),
      uploadedBy: "Amit Singh",
      category: "Income Documents",
      loanType: "personal",
      leadId: "LD002",
      status: "processing",
      branch: "Delhi North",
      assignedTo: "Rahul Gupta",
    },
    {
      id: "3",
      name: "Business Registration Certificate.pdf",
      type: "file",
      size: "1.8 MB",
      uploadDate: new Date("2024-01-12"),
      uploadedBy: "Sunita Patel",
      category: "Business Documents",
      loanType: "business",
      leadId: "LD003",
      status: "pending",
      branch: "Pune West",
      assignedTo: "Vikash Kumar",
    },
    {
      id: "4",
      name: "Vehicle RC - Honda City.pdf",
      type: "file",
      size: "0.9 MB",
      uploadDate: new Date("2024-01-14"),
      uploadedBy: "Deepak Joshi",
      category: "Vehicle Documents",
      loanType: "car",
      leadId: "LD004",
      status: "approved",
      branch: "Bangalore South",
      assignedTo: "Neha Agarwal",
    },
    {
      id: "5",
      name: "Medical Reports - Apollo Hospital",
      type: "folder",
      uploadDate: new Date("2024-01-13"),
      uploadedBy: "Kavita Reddy",
      category: "Medical Documents",
      loanType: "medical",
      leadId: "LD005",
      status: "processing",
      branch: "Hyderabad East",
      assignedTo: "Suresh Babu",
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedLoanType, setSelectedLoanType] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedBranch, setSelectedBranch] = useState("all")

  useEffect(() => {
    if (!user || user.type !== "official") {
      router.push("/")
      return
    }
  }, [user, router])

  const filteredFiles = files.filter((file) => {
    const matchesSearch =
      file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (file.leadId && file.leadId.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === "all" || file.category === selectedCategory
    const matchesLoanType = selectedLoanType === "all" || file.loanType === selectedLoanType
    const matchesStatus = selectedStatus === "all" || file.status === selectedStatus
    const matchesBranch = selectedBranch === "all" || file.branch === selectedBranch

    return matchesSearch && matchesCategory && matchesLoanType && matchesStatus && matchesBranch
  })

  const categories = [...new Set(files.map((file) => file.category))]
  const branches = [...new Set(files.map((file) => file.branch).filter(Boolean))]

  const getStatsByLoanType = () => {
    return loanTypes.map((loanType) => {
      const loanFiles = files.filter((f) => f.loanType === loanType.id)
      return {
        ...loanType,
        total: loanFiles.length,
        pending: loanFiles.filter((f) => f.status === "pending").length,
        approved: loanFiles.filter((f) => f.status === "approved").length,
        processing: loanFiles.filter((f) => f.status === "processing").length,
        rejected: loanFiles.filter((f) => f.status === "rejected").length,
      }
    })
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files
    if (uploadedFiles) {
      Array.from(uploadedFiles).forEach((file) => {
        const newFile: FileItem = {
          id: Date.now().toString() + Math.random().toString(),
          name: file.name,
          type: "file",
          size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
          uploadDate: new Date(),
          uploadedBy: user?.name || "Unknown",
          category: "Uploads",
          loanType: "home", // Default loan type
          leadId: "LD001", // Default lead ID
          status: "pending", // Default status
          branch: "Mumbai Central", // Default branch
          assignedTo: "Priya Sharma", // Default assigned to
        }
        setFiles((prev) => [...prev, newFile])
      })
    }
  }

  const handleDeleteFile = (fileId: string) => {
    if (confirm("Are you sure you want to delete this file?")) {
      setFiles((prev) => prev.filter((file) => file.id !== fileId))
    }
  }

  const handleStatusUpdate = (fileId: string, newStatus: "pending" | "approved" | "rejected" | "processing") => {
    setFiles((prev) => prev.map((file) => (file.id === fileId ? { ...file, status: newStatus } : file)))
  }

  if (!user || user.type !== "official") {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b bg-black/20 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <Image
              src="/bankmate-logo.jpg"
              alt="Bankmate Solutions Logo"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <div>
              <h1 className="text-xl font-semibold text-white">File Tracking System</h1>
              <p className="text-sm text-gray-300">Loan-based document management</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="relative text-white hover:bg-white/10">
              <Bell className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">{user.name}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="border-white/20 text-white hover:bg-white/10 bg-transparent"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Loan Type Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {getStatsByLoanType()
            .slice(0, 4)
            .map((loanType) => (
              <Card key={loanType.id} className="bg-white/10 backdrop-blur-xl border-white/20 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{loanType.name}</CardTitle>
                  <div className={`p-2 rounded-lg ${loanType.color}`}>
                    <loanType.icon className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loanType.total}</div>
                  <div className="flex gap-2 mt-2 text-xs">
                    <span className="text-green-400">{loanType.approved} Approved</span>
                    <span className="text-yellow-400">{loanType.processing} Processing</span>
                    <span className="text-red-400">{loanType.pending} Pending</span>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>

        <Tabs defaultValue="files" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-xl">
            <TabsTrigger value="files" className="text-white data-[state=active]:bg-white/20">
              File Browser
            </TabsTrigger>
            <TabsTrigger value="tracking" className="text-white data-[state=active]:bg-white/20">
              Loan Tracking
            </TabsTrigger>
            <TabsTrigger value="upload" className="text-white data-[state=active]:bg-white/20">
              Upload Files
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-white data-[state=active]:bg-white/20">
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="files" className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-xl border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Document Browser</CardTitle>
                <CardDescription className="text-gray-300">Browse and manage loan documents by type</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Enhanced Search and Filter */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search files, leads, customers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>
                  <select
                    value={selectedLoanType}
                    onChange={(e) => setSelectedLoanType(e.target.value)}
                    className="px-3 py-2 border rounded-md bg-white/10 border-white/20 text-white"
                  >
                    <option value="all">All Loan Types</option>
                    {loanTypes.map((type) => (
                      <option key={type.id} value={type.id} className="text-black">
                        {type.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-3 py-2 border rounded-md bg-white/10 border-white/20 text-white"
                  >
                    <option value="all">All Status</option>
                    <option value="pending" className="text-black">
                      Pending
                    </option>
                    <option value="processing" className="text-black">
                      Processing
                    </option>
                    <option value="approved" className="text-black">
                      Approved
                    </option>
                    <option value="rejected" className="text-black">
                      Rejected
                    </option>
                  </select>
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="px-3 py-2 border rounded-md bg-white/10 border-white/20 text-white"
                  >
                    <option value="all">All Branches</option>
                    {branches.map((branch) => (
                      <option key={branch} value={branch} className="text-black">
                        {branch}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border rounded-md bg-white/10 border-white/20 text-white"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category} className="text-black">
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Enhanced File List */}
                <div className="space-y-3">
                  {filteredFiles.length > 0 ? (
                    filteredFiles.map((file) => {
                      const loanType = loanTypes.find((lt) => lt.id === file.loanType)
                      return (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all duration-300"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                              {file.type === "folder" ? (
                                <Folder className="h-6 w-6 text-white" />
                              ) : (
                                <File className="h-6 w-6 text-white" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-white">{file.name}</h4>
                              <div className="flex items-center gap-3 text-sm text-gray-300 mt-1">
                                <span>Lead: {file.leadId}</span>
                                <span>•</span>
                                <span>{file.uploadedBy}</span>
                                <span>•</span>
                                <span>{file.uploadDate.toLocaleDateString()}</span>
                                {file.size && (
                                  <>
                                    <span>•</span>
                                    <span>{file.size}</span>
                                  </>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                {loanType && (
                                  <Badge className={`${loanType.color} text-white border-0`}>{loanType.name}</Badge>
                                )}
                                <Badge variant="outline" className="border-white/20 text-white">
                                  {file.category}
                                </Badge>
                                <Badge
                                  className={`border-0 ${
                                    file.status === "approved"
                                      ? "bg-green-500"
                                      : file.status === "processing"
                                        ? "bg-yellow-500"
                                        : file.status === "rejected"
                                          ? "bg-red-500"
                                          : "bg-gray-500"
                                  } text-white`}
                                >
                                  {file.status.charAt(0).toUpperCase() + file.status.slice(1)}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <select
                              value={file.status}
                              onChange={(e) => handleStatusUpdate(file.id, e.target.value as any)}
                              className="px-2 py-1 text-xs border rounded bg-white/10 border-white/20 text-white"
                            >
                              <option value="pending" className="text-black">
                                Pending
                              </option>
                              <option value="processing" className="text-black">
                                Processing
                              </option>
                              <option value="approved" className="text-black">
                                Approved
                              </option>
                              <option value="rejected" className="text-black">
                                Rejected
                              </option>
                            </select>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteFile(file.id)}
                              className="border-white/20 text-white hover:bg-white/10"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-400">No files found matching your criteria</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tracking" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {getStatsByLoanType().map((loanType) => (
                <Card key={loanType.id} className="bg-white/10 backdrop-blur-xl border-white/20 text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className={`p-2 rounded-lg ${loanType.color}`}>
                        <loanType.icon className="h-5 w-5 text-white" />
                      </div>
                      {loanType.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Total Files:</span>
                        <span className="font-semibold">{loanType.total}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-400">Approved:</span>
                        <span className="font-semibold">{loanType.approved}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-yellow-400">Processing:</span>
                        <span className="font-semibold">{loanType.processing}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-red-400">Pending:</span>
                        <span className="font-semibold">{loanType.pending}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Rejected:</span>
                        <span className="font-semibold">{loanType.rejected}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Files
                </CardTitle>
                <CardDescription>Upload documents, images, and other files to cloud storage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Upload Files</h3>
                    <p className="text-muted-foreground mb-4">Drag and drop files here or click to browse</p>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                    />
                    <label htmlFor="file-upload">
                      <Button className="cursor-pointer">
                        <Upload className="mr-2 h-4 w-4" />
                        Choose Files
                      </Button>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Supported Formats</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div>Documents: PDF, DOC, DOCX</div>
                          <div>Spreadsheets: XLS, XLSX</div>
                          <div>Images: JPG, JPEG, PNG, GIF</div>
                          <div>Max file size: 50 MB</div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Quick Actions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Button variant="outline" className="w-full justify-start bg-transparent">
                          <Folder className="mr-2 h-4 w-4" />
                          Create New Folder
                        </Button>
                        <Button variant="outline" className="w-full justify-start bg-transparent">
                          <Download className="mr-2 h-4 w-4" />
                          Import from CSV
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-xl border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Document Analytics</CardTitle>
                <CardDescription className="text-gray-300">Track document processing performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">{files.length}</div>
                    <div className="text-gray-300">Total Documents</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400 mb-2">
                      {files.filter((f) => f.status === "approved").length}
                    </div>
                    <div className="text-gray-300">Approved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-400 mb-2">
                      {files.filter((f) => f.status === "processing").length}
                    </div>
                    <div className="text-gray-300">Processing</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
