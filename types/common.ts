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

  // Lead Details
  leadType: string; // Product Type (Home Loan, Personal Loan, etc.)
  leadSource: string; // Social Media, Walk-in, etc.
  assignedBranch?: string;
  assignedStaff?: string;
  ownerManagerAssignment?: string;

  // Financial Information
  cost: number;
  cibilScore: number;

  // Application Status with color coding
  applicationStatus: "login" | "pending" | "sanctioned" | "rejected";

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
  annualIncome?: string;
  loanAmount?: string;
  purpose?: string;
  notes?: string;
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
