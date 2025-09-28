"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FileText, Upload, Check, AlertCircle, Plus } from "lucide-react"

export interface DocumentRequirement {
  id: string
  name: string
  required: boolean
  description: string
  acceptedFormats: string[]
  maxSize: string
  category: "kyc" | "income" | "legal" | "property" | "business" | "additional"
}

export interface LoanTypeDocuments {
  [key: string]: DocumentRequirement[]
}

export const LOAN_TYPE_DOCUMENTS: LoanTypeDocuments = {
  "Home Loan": [
    {
      id: "hl_aadhar",
      name: "Aadhar Card",
      required: true,
      description: "Government issued identity proof",
      acceptedFormats: ["PDF", "JPG", "PNG"],
      maxSize: "5MB",
      category: "kyc",
    },
    {
      id: "hl_pan",
      name: "PAN Card",
      required: true,
      description: "Permanent Account Number card",
      acceptedFormats: ["PDF", "JPG", "PNG"],
      maxSize: "5MB",
      category: "kyc",
    },
    {
      id: "hl_salary_slip",
      name: "Salary Slips (3 months)",
      required: true,
      description: "Latest 3 months salary slips",
      acceptedFormats: ["PDF"],
      maxSize: "10MB",
      category: "income",
    },
    {
      id: "hl_bank_statement",
      name: "Bank Statements (6 months)",
      required: true,
      description: "Latest 6 months bank statements",
      acceptedFormats: ["PDF"],
      maxSize: "15MB",
      category: "income",
    },
    {
      id: "hl_property_docs",
      name: "Property Documents",
      required: true,
      description: "Sale deed, title documents, NOC",
      acceptedFormats: ["PDF"],
      maxSize: "20MB",
      category: "property",
    },
    {
      id: "hl_valuation_report",
      name: "Property Valuation Report",
      required: true,
      description: "Bank approved valuation report",
      acceptedFormats: ["PDF"],
      maxSize: "10MB",
      category: "property",
    },
    {
      id: "hl_employment_cert",
      name: "Employment Certificate",
      required: false,
      description: "Letter from employer",
      acceptedFormats: ["PDF"],
      maxSize: "5MB",
      category: "income",
    },
  ],
  "Personal Loan": [
    {
      id: "pl_aadhar",
      name: "Aadhar Card",
      required: true,
      description: "Government issued identity proof",
      acceptedFormats: ["PDF", "JPG", "PNG"],
      maxSize: "5MB",
      category: "kyc",
    },
    {
      id: "pl_pan",
      name: "PAN Card",
      required: true,
      description: "Permanent Account Number card",
      acceptedFormats: ["PDF", "JPG", "PNG"],
      maxSize: "5MB",
      category: "kyc",
    },
    {
      id: "pl_salary_slip",
      name: "Salary Slips (3 months)",
      required: true,
      description: "Latest 3 months salary slips",
      acceptedFormats: ["PDF"],
      maxSize: "10MB",
      category: "income",
    },
    {
      id: "pl_bank_statement",
      name: "Bank Statements (3 months)",
      required: true,
      description: "Latest 3 months bank statements",
      acceptedFormats: ["PDF"],
      maxSize: "10MB",
      category: "income",
    },
    {
      id: "pl_employment_cert",
      name: "Employment Certificate",
      required: false,
      description: "Letter from employer",
      acceptedFormats: ["PDF"],
      maxSize: "5MB",
      category: "income",
    },
  ],
  "Business Loan": [
    {
      id: "bl_aadhar",
      name: "Aadhar Card",
      required: true,
      description: "Government issued identity proof",
      acceptedFormats: ["PDF", "JPG", "PNG"],
      maxSize: "5MB",
      category: "kyc",
    },
    {
      id: "bl_pan",
      name: "PAN Card",
      required: true,
      description: "Permanent Account Number card",
      acceptedFormats: ["PDF", "JPG", "PNG"],
      maxSize: "5MB",
      category: "kyc",
    },
    {
      id: "bl_business_reg",
      name: "Business Registration",
      required: true,
      description: "Certificate of incorporation/partnership deed",
      acceptedFormats: ["PDF"],
      maxSize: "10MB",
      category: "business",
    },
    {
      id: "bl_gst_returns",
      name: "GST Returns (12 months)",
      required: true,
      description: "Latest 12 months GST returns",
      acceptedFormats: ["PDF"],
      maxSize: "15MB",
      category: "business",
    },
    {
      id: "bl_financial_statements",
      name: "Financial Statements (2 years)",
      required: true,
      description: "Audited financial statements",
      acceptedFormats: ["PDF"],
      maxSize: "20MB",
      category: "business",
    },
    {
      id: "bl_bank_statement",
      name: "Business Bank Statements (12 months)",
      required: true,
      description: "Latest 12 months business bank statements",
      acceptedFormats: ["PDF"],
      maxSize: "25MB",
      category: "business",
    },
    {
      id: "bl_itr",
      name: "Income Tax Returns (3 years)",
      required: true,
      description: "Latest 3 years ITR with computation",
      acceptedFormats: ["PDF"],
      maxSize: "15MB",
      category: "business",
    },
  ],
  "Car Loan": [
    {
      id: "cl_aadhar",
      name: "Aadhar Card",
      required: true,
      description: "Government issued identity proof",
      acceptedFormats: ["PDF", "JPG", "PNG"],
      maxSize: "5MB",
      category: "kyc",
    },
    {
      id: "cl_pan",
      name: "PAN Card",
      required: true,
      description: "Permanent Account Number card",
      acceptedFormats: ["PDF", "JPG", "PNG"],
      maxSize: "5MB",
      category: "kyc",
    },
    {
      id: "cl_salary_slip",
      name: "Salary Slips (3 months)",
      required: true,
      description: "Latest 3 months salary slips",
      acceptedFormats: ["PDF"],
      maxSize: "10MB",
      category: "income",
    },
    {
      id: "cl_bank_statement",
      name: "Bank Statements (6 months)",
      required: true,
      description: "Latest 6 months bank statements",
      acceptedFormats: ["PDF"],
      maxSize: "15MB",
      category: "income",
    },
    {
      id: "cl_quotation",
      name: "Vehicle Quotation",
      required: true,
      description: "Proforma invoice from dealer",
      acceptedFormats: ["PDF", "JPG", "PNG"],
      maxSize: "5MB",
      category: "additional",
    },
    {
      id: "cl_driving_license",
      name: "Driving License",
      required: false,
      description: "Valid driving license",
      acceptedFormats: ["PDF", "JPG", "PNG"],
      maxSize: "5MB",
      category: "additional",
    },
  ],
  "Education Loan": [
    {
      id: "el_aadhar",
      name: "Aadhar Card (Student & Co-applicant)",
      required: true,
      description: "Government issued identity proof",
      acceptedFormats: ["PDF", "JPG", "PNG"],
      maxSize: "5MB",
      category: "kyc",
    },
    {
      id: "el_pan",
      name: "PAN Card (Co-applicant)",
      required: true,
      description: "Permanent Account Number card",
      acceptedFormats: ["PDF", "JPG", "PNG"],
      maxSize: "5MB",
      category: "kyc",
    },
    {
      id: "el_admission_letter",
      name: "Admission Letter",
      required: true,
      description: "Official admission letter from institution",
      acceptedFormats: ["PDF"],
      maxSize: "10MB",
      category: "additional",
    },
    {
      id: "el_fee_structure",
      name: "Fee Structure",
      required: true,
      description: "Detailed fee structure from institution",
      acceptedFormats: ["PDF"],
      maxSize: "10MB",
      category: "additional",
    },
    {
      id: "el_academic_records",
      name: "Academic Records",
      required: true,
      description: "Previous academic certificates and mark sheets",
      acceptedFormats: ["PDF"],
      maxSize: "15MB",
      category: "additional",
    },
    {
      id: "el_income_proof",
      name: "Co-applicant Income Proof",
      required: true,
      description: "Salary slips, ITR, bank statements",
      acceptedFormats: ["PDF"],
      maxSize: "15MB",
      category: "income",
    },
  ],
  "Credit Card": [
    {
      id: "cc_aadhar",
      name: "Aadhar Card",
      required: true,
      description: "Government issued identity proof",
      acceptedFormats: ["PDF", "JPG", "PNG"],
      maxSize: "5MB",
      category: "kyc",
    },
    {
      id: "cc_pan",
      name: "PAN Card",
      required: true,
      description: "Permanent Account Number card",
      acceptedFormats: ["PDF", "JPG", "PNG"],
      maxSize: "5MB",
      category: "kyc",
    },
    {
      id: "cc_salary_slip",
      name: "Salary Slips (2 months)",
      required: true,
      description: "Latest 2 months salary slips",
      acceptedFormats: ["PDF"],
      maxSize: "5MB",
      category: "income",
    },
    {
      id: "cc_bank_statement",
      name: "Bank Statements (3 months)",
      required: true,
      description: "Latest 3 months bank statements",
      acceptedFormats: ["PDF"],
      maxSize: "10MB",
      category: "income",
    },
  ],
}

interface DocumentManagerProps {
  loanType: string
  onDocumentsChange: (documents: any[]) => void
  initialDocuments?: any[]
}

export function DocumentManager({ loanType, onDocumentsChange, initialDocuments = [] }: DocumentManagerProps) {
  const [documents, setDocuments] = useState<any[]>(initialDocuments)
  const [customDocuments, setCustomDocuments] = useState<DocumentRequirement[]>([])
  const [showAddCustom, setShowAddCustom] = useState(false)
  const [newCustomDoc, setNewCustomDoc] = useState({
    name: "",
    description: "",
    required: false,
    category: "additional" as const,
  })

  const requirements = LOAN_TYPE_DOCUMENTS[loanType] || []
  const allRequirements = [...requirements, ...customDocuments]

  const getDocumentStatus = (docId: string) => {
    const doc = documents.find((d) => d.requirementId === docId)
    if (!doc) return "pending"
    if (doc.verified) return "verified"
    if (doc.files && doc.files.length > 0) return "provided"
    return "pending"
  }

  const updateDocumentStatus = (requirementId: string, status: "pending" | "provided" | "verified", files?: File[]) => {
    const updatedDocs = documents.filter((d) => d.requirementId !== requirementId)
    if (status !== "pending" || files) {
      updatedDocs.push({
        requirementId,
        status,
        files: files || [],
        uploadedAt: new Date().toISOString(),
        verified: status === "verified",
      })
    }
    setDocuments(updatedDocs)
    onDocumentsChange(updatedDocs)
  }

  const addCustomDocument = () => {
    if (!newCustomDoc.name.trim()) return

    const customDoc: DocumentRequirement = {
      id: `custom_${Date.now()}`,
      name: newCustomDoc.name,
      description: newCustomDoc.description,
      required: newCustomDoc.required,
      acceptedFormats: ["PDF", "JPG", "PNG"],
      maxSize: "10MB",
      category: newCustomDoc.category,
    }

    setCustomDocuments([...customDocuments, customDoc])
    setNewCustomDoc({ name: "", description: "", required: false, category: "additional" })
    setShowAddCustom(false)
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "kyc":
        return "bg-blue-500/20 text-blue-700 border-blue-300"
      case "income":
        return "bg-green-500/20 text-green-700 border-green-300"
      case "legal":
        return "bg-purple-500/20 text-purple-700 border-purple-300"
      case "property":
        return "bg-orange-500/20 text-orange-700 border-orange-300"
      case "business":
        return "bg-indigo-500/20 text-indigo-700 border-indigo-300"
      case "additional":
        return "bg-gray-500/20 text-gray-700 border-gray-300"
      default:
        return "bg-gray-500/20 text-gray-700 border-gray-300"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <Check className="h-4 w-4 text-green-600" />
      case "provided":
        return <Upload className="h-4 w-4 text-orange-600" />
      case "pending":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const getCompletionStats = () => {
    const total = allRequirements.length
    const completed = allRequirements.filter((req) => getDocumentStatus(req.id) === "verified").length
    const provided = allRequirements.filter((req) => getDocumentStatus(req.id) === "provided").length
    const pending = total - completed - provided

    return { total, completed, provided, pending }
  }

  const stats = getCompletionStats()

  return (
    <div className="space-y-6">
      {/* Document Completion Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Requirements - {loanType}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 rounded-lg bg-blue-50 border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-blue-700">Total Required</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-green-50 border border-green-200">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-green-700">Verified</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-orange-50 border border-orange-200">
              <div className="text-2xl font-bold text-orange-600">{stats.provided}</div>
              <div className="text-sm text-orange-700">Under Review</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-red-50 border border-red-200">
              <div className="text-2xl font-bold text-red-600">{stats.pending}</div>
              <div className="text-sm text-red-700">Pending</div>
            </div>
          </div>

          {stats.completed === stats.total && stats.total > 0 && (
            <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-center">
              <Check className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <div className="text-lg font-semibold text-green-800">Document Complete</div>
              <div className="text-sm text-green-700">All required documents have been verified</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Requirements List */}
      <div className="space-y-4">
        {allRequirements.map((requirement) => {
          const status = getDocumentStatus(requirement.id)
          const doc = documents.find((d) => d.requirementId === requirement.id)

          return (
            <Card key={requirement.id} className="relative">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(status)}
                      <h3 className="font-semibold text-lg">{requirement.name}</h3>
                      {requirement.required && (
                        <Badge variant="destructive" className="text-xs">
                          Required
                        </Badge>
                      )}
                      <Badge className={getCategoryColor(requirement.category)}>
                        {requirement.category.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{requirement.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Formats: {requirement.acceptedFormats.join(", ")}</span>
                      <span>Max Size: {requirement.maxSize}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      className={
                        status === "verified"
                          ? "bg-green-500 text-white"
                          : status === "provided"
                            ? "bg-orange-500 text-white"
                            : "bg-red-500 text-white"
                      }
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Input
                      type="file"
                      multiple
                      accept={requirement.acceptedFormats.map((f) => `.${f.toLowerCase()}`).join(",")}
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          updateDocumentStatus(requirement.id, "provided", Array.from(e.target.files))
                        }
                      }}
                      className="flex-1"
                    />
                    {status === "provided" && (
                      <Button
                        size="sm"
                        onClick={() => updateDocumentStatus(requirement.id, "verified")}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Mark Verified
                      </Button>
                    )}
                    {status === "verified" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateDocumentStatus(requirement.id, "provided", doc?.files)}
                      >
                        Unverify
                      </Button>
                    )}
                  </div>

                  {doc?.files && doc.files.length > 0 && (
                    <div className="text-sm text-gray-600">
                      <strong>Uploaded files:</strong> {doc.files.map((f: File) => f.name).join(", ")}
                      <div className="text-xs text-gray-500 mt-1">
                        Uploaded: {new Date(doc.uploadedAt).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Add Custom Document */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Custom Documents</span>
            <Button size="sm" onClick={() => setShowAddCustom(!showAddCustom)} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Custom Document
            </Button>
          </CardTitle>
        </CardHeader>
        {showAddCustom && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Document Name</Label>
                <Input
                  value={newCustomDoc.name}
                  onChange={(e) => setNewCustomDoc({ ...newCustomDoc, name: e.target.value })}
                  placeholder="Enter document name"
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <select
                  value={newCustomDoc.category}
                  onChange={(e) => setNewCustomDoc({ ...newCustomDoc, category: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="additional">Additional</option>
                  <option value="kyc">KYC</option>
                  <option value="income">Income</option>
                  <option value="legal">Legal</option>
                  <option value="property">Property</option>
                  <option value="business">Business</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={newCustomDoc.description}
                onChange={(e) => setNewCustomDoc({ ...newCustomDoc, description: e.target.value })}
                placeholder="Enter document description"
                rows={2}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="required"
                checked={newCustomDoc.required}
                onChange={(e) => setNewCustomDoc({ ...newCustomDoc, required: e.target.checked })}
              />
              <Label htmlFor="required">Required Document</Label>
            </div>
            <div className="flex gap-2">
              <Button onClick={addCustomDocument} size="sm">
                Add Document
              </Button>
              <Button onClick={() => setShowAddCustom(false)} variant="outline" size="sm">
                Cancel
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
