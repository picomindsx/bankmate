import {
  APPLICATION_STATUS,
  BANK_STATUS,
  DOCUMENT_STATUS,
  GENDER_OPTIONS,
  INCOME_CATEGORY,
  LOAN_DOCUMENTS,
} from "@/lib/consts";

export interface User {
  id: string;
  username: string;
  type: "official" | "employee";
  role: "owner" | "branch_head" | "manager" | "admin" | "staff";
  name?: string;
  phone?: string;
  email?: string;
  designation?: string;
  photo?: string;
  branchId?: string;
  permissions?: Permission[];
  isActive?: boolean;
  createdAt?: string;
  lastLogin?: string;
  password?: string;
  canAccessEmployerLogin?: boolean; // Added employer login capability
}

export interface Branch {
  id: string;
  name: string;
  editable: boolean;
  // Enhanced branch organization fields
  code: string; // Branch code (e.g., "MUM001", "DEL002")
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  contact: {
    phone: string;
    email: string;
    fax?: string;
  };
  manager: {
    id?: string;
    name: string;
    phone: string;
    email: string;
  };
  region: string; // Regional grouping (e.g., "North", "South", "West", "East")
  zone: string; // Zone grouping (e.g., "Metro", "Urban", "Rural")
  type: "main" | "sub" | "service"; // Branch hierarchy
  parentBranchId?: string; // For sub-branches
  establishedDate: string;
  isActive: boolean;
  operatingHours: {
    weekdays: { open: string; close: string };
    saturday: { open: string; close: string };
    sunday: { open: string; close: string };
  };
  services: string[]; // Services offered at this branch
  targetMetrics: {
    monthlyLeadTarget: number;
    monthlyRevenueTarget: number;
    conversionRateTarget: number;
  };
  performance: {
    currentMonthLeads: number;
    currentMonthRevenue: number;
    conversionRate: number;
    lastUpdated: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DocumentStatus {
  requirementId: string;
  status: "pending" | "provided" | "verified";
  files: File[];
  uploadedAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  notes?: string;
}

export interface Lead {
  id: string;

  // Basic Lead Information
  leadName?: string;
  clientName: string;
  contactNumber: string;
  email: string;
  dateOfBirth?: string;
  address: string;
  currentAddress?: string; // ✅ newly added

  // Personal Information
  gender?: string; // ✅ newly added

  // Lead Details
  leadType: string; // Product Type (Home Loan, Personal Loan, etc.)
  leadSource: string; // Social Media, Walk-in, etc.
  assignedBranch?: string;
  assignedStaff?: string;
  ownerManagerAssignment?: string;

  // Financial Information
  cost: number;
  cibilScore: number;
  annualIncome?: string;
  incomeCategory?: string; // ✅ newly added
  loanAmount?: string;
  loanTenure?: number; // ✅ newly added
  purpose?: string;

  // Application Status with color coding
  applicationStatus: "login" | "pending" | "sanctioned" | "rejected";
  urgencyLevel?: string; // ✅ newly added

  // Bank Assignment
  selectedBank?: string;
  bankBranch?: string;
  bankStaff?: string;
  bankDocuments?: File[];

  // Enhanced Document Tracking with loan-specific requirements
  documents?: DocumentStatus[];
  documentCompletionStatus?: "pending" | "partial" | "complete";

  // Additional Information
  additionalInfo: string;
  notes?: string;
  remarks?: string;

  // Timestamps and tracking
  createdAt: string;
  updatedAt: string;
  branchId: string;
  documentsSubmittedAt?: string;
  bankAssignedAt?: string;
  statusUpdatedAt?: string;

  // Legacy fields for backward compatibility
  assignedAgent?: string;
  status?: string;

  // New fields for lead assignment workflow
  isVisibleToStaff?: boolean;
  assignmentStatus?: string;
  assignedAt?: string;
  createdByStaff?: boolean;
  createdBy?: string;

  // Timeline & History
  timeline?: {
    date: string;
    status: string;
    description: string;
    updatedBy: string;
  }[];

  editHistory?: {
    editedBy: string;
    editedAt: string;
    changes: string[];
    previousValues?: Record<string, any>;
  }[];
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  category:
    | "leads"
    | "staff"
    | "documents"
    | "reports"
    | "settings"
    | "branches";
}

export interface RolePermissions {
  role: "owner" | "branch_head" | "manager" | "admin" | "staff";
  permissions: string[];
}

// StaffMember interface remains unchanged
export interface StaffMember extends User {
  dateOfJoining?: string;
  salary?: number;
  department?: string;
  reportingManager?: string;
  permissions?: Permission[];
  isActive: boolean;
}
export interface LeadApplication {
  // 1. Basic Personal Details
  fullName: string;
  mobileNumber: string;
  email?: string;
  dateOfBirth?: string;
  gender?: "Male" | "Female" | "Other" | string;
  permanentAddress?: string;
  currentAddress?: string;

  // 2. Loan Type (multi-select)
  loanTypes: string[]; // e.g., ["Home Loan", "Car Loan"]

  // 3. Income Category
  incomeCategory:
    | "Salaried"
    | "Self-Employed"
    | "Business Owner"
    | "NRI"
    | "Retired";

  // 4. Loan Requirement Details
  loanAmount?: number;
  loanTenure?: number; // months
  preferredBank?: string;
  urgencyLevel?: "Low" | "Medium" | "High" | "Immediate";
  purposeOfLoan?: string;

  // 5. Additional Notes
  notes?: string;
}

export interface LeadForm {
  id?: string;
  // 🔹 Core Required Fields
  leadName?: string; // maps to lead_name
  clientName?: string; // maps to client_name
  contactNumber?: string; // maps to contact_number
  email?: string; // maps to email
  dateOfBirth?: string; // maps to date_of_birth (ISO string)
  leadType?: string;

  // 🔹 Customer Information
  customerName?: string;
  gender?: IGender;
  permanentAddress?: string;
  currentAddress?: string;
  completeAddress?: string;

  // 🔹 Loan Information
  loanTypes?: string[];
  incomeCategory?: IIncomeCategory;
  loanAmount?: string;
  loanTenure?: number; // months
  urgencyLevel?: IUrgencyLevel;
  purposeOfLoan?: string;
  annualIncome?: string;

  // 🔹 Lead Assignment
  leadSource?: string;
  assignedBranch?: string; // UUID ref
  assignedStaff?: string; // UUID ref
  ownerManagerAssignment?: string; // UUID ref

  // 🔹 Bank Assignment
  bankSelection?: string;
  bankBranch?: string;
  bankStaffMember?: string;
  bankDocuments?: any; // JSONB (can refine later)

  // 🔹 Financial & Scoring
  cibilScore?: number;
  estimatedCost?: number;

  // 🔹 Application Workflow
  applicationStatus?: IApplicationStatus;
  documentsSubmittedAt?: string;
  bankAssignedAt?: string;
  statusUpdatedAt?: string;
  assignedAt?: string;

  // 🔹 Notes & Additional Info
  notes?: string;
  statusRemarks?: string;
  additionalInformation?: string;

  // 🔹 Tracking
  createdAt?: string;
  updatedAt?: string;
  branchId?: string; // UUID ref
  createdBy?: string; // UUID ref

  // 🔹 Salaried
  employerName?: string;
  designation?: string;
  officeAddress?: string;
  monthlyGrossSalary?: string; // or number
  yearsOfExperience?: string; // or number

  // 🔹 Self-Employed / Business Owner
  businessName?: string;
  businessType?: string;
  businessAddress?: string;
  annualTurnover?: string; // or number
  yearsInBusiness?: string; // or number

  // 🔹 NRI
  countryOfResidence?: string;
  jobTypeNRI?: string;
  annualIncomeFC?: string; // or number

  // 🔹 Property Details (Home Loan / LAP)
  propertyType?: "residential" | "commercial"; // --?
  propertyValue?: number; // --?
  propertyLocation?: string; // --?

  assignmentStatus?: string;
  assignedStaffName?: string;
  ownerManagerAssignmentName?: string;
  documents?: ILoanDocument[];
  documentStatus?: IDocumentStatus;
  bankStatus?: IBankStatus;
}

export type IGender = (typeof GENDER_OPTIONS)[number];
export type IIncomeCategory = (typeof INCOME_CATEGORY)[number];
export type IApplicationStatus = (typeof APPLICATION_STATUS)[number];
export type IUrgencyLevel = "Low" | "Medium" | "High" | "Immediate";
export type ILoanDocument = (typeof LOAN_DOCUMENTS)[number];
export type IDocumentStatus = (typeof DOCUMENT_STATUS)[number];
export type IBankStatus = (typeof BANK_STATUS)[number];

export interface IBank {
  id?: string;
  name: string;
}
