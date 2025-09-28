import {
  Permission,
  RolePermissions,
  User,
  Branch,
  Lead,
  LeadApplication,
  LeadForm,
  IGender,
  IIncomeCategory,
  IApplicationStatus,
} from "@/types/common";

export const ALL_PERMISSIONS: Permission[] = [
  // Lead Management
  {
    id: "leads.view",
    name: "View Leads",
    description: "View lead information",
    category: "leads",
  },
  {
    id: "leads.create",
    name: "Create Leads",
    description: "Create new leads",
    category: "leads",
  },
  {
    id: "leads.edit",
    name: "Edit Leads",
    description: "Edit lead information",
    category: "leads",
  },
  {
    id: "leads.delete",
    name: "Delete Leads",
    description: "Delete leads",
    category: "leads",
  },
  {
    id: "leads.assign",
    name: "Assign Leads",
    description: "Assign leads to staff",
    category: "leads",
  },
  {
    id: "leads.reassign",
    name: "Reassign Leads",
    description: "Reassign leads between staff",
    category: "leads",
  },
  {
    id: "leads.status_update",
    name: "Update Lead Status",
    description: "Update lead application status",
    category: "leads",
  },

  // Staff Management
  {
    id: "staff.view",
    name: "View Staff",
    description: "View staff information",
    category: "staff",
  },
  {
    id: "staff.create",
    name: "Create Staff",
    description: "Add new staff members",
    category: "staff",
  },
  {
    id: "staff.edit",
    name: "Edit Staff",
    description: "Edit staff information",
    category: "staff",
  },
  {
    id: "staff.delete",
    name: "Delete Staff",
    description: "Remove staff members",
    category: "staff",
  },
  {
    id: "staff.password_reset",
    name: "Reset Staff Password",
    description: "Reset staff passwords",
    category: "staff",
  },
  {
    id: "staff.permissions",
    name: "Manage Staff Permissions",
    description: "Manage staff permissions",
    category: "staff",
  },

  // Document Management
  {
    id: "documents.view",
    name: "View Documents",
    description: "View document information",
    category: "documents",
  },
  {
    id: "documents.upload",
    name: "Upload Documents",
    description: "Upload documents",
    category: "documents",
  },
  {
    id: "documents.verify",
    name: "Verify Documents",
    description: "Verify document authenticity",
    category: "documents",
  },
  {
    id: "documents.delete",
    name: "Delete Documents",
    description: "Delete documents",
    category: "documents",
  },

  // Reports
  {
    id: "reports.view",
    name: "View Reports",
    description: "View system reports",
    category: "reports",
  },
  {
    id: "reports.export",
    name: "Export Reports",
    description: "Export reports to files",
    category: "reports",
  },
  {
    id: "reports.analytics",
    name: "View Analytics",
    description: "View detailed analytics",
    category: "reports",
  },

  // Settings
  {
    id: "settings.system",
    name: "System Settings",
    description: "Manage system settings",
    category: "settings",
  },
  {
    id: "settings.integrations",
    name: "Manage Integrations",
    description: "Manage third-party integrations",
    category: "settings",
  },
  {
    id: "settings.backup",
    name: "Backup Management",
    description: "Manage system backups",
    category: "settings",
  },

  // Branch Management
  {
    id: "branches.view",
    name: "View Branches",
    description: "View branch information",
    category: "branches",
  },
  {
    id: "branches.create",
    name: "Create Branches",
    description: "Create new branches",
    category: "branches",
  },
  {
    id: "branches.edit",
    name: "Edit Branches",
    description: "Edit branch information",
    category: "branches",
  },
  {
    id: "branches.delete",
    name: "Delete Branches",
    description: "Delete branches",
    category: "branches",
  },
];

export const ROLE_PERMISSIONS: RolePermissions[] = [
  {
    role: "owner",
    permissions: ALL_PERMISSIONS.map((p) => p.id), // Owner has all permissions
  },
  {
    role: "branch_head",
    permissions: [
      "leads.view",
      "leads.create",
      "leads.edit",
      "leads.assign",
      "leads.reassign",
      "leads.status_update",
      "staff.view",
      "staff.create",
      "staff.edit",
      "staff.password_reset",
      "documents.view",
      "documents.upload",
      "documents.verify",
      "reports.view",
      "reports.export",
      "reports.analytics",
    ],
  },
  {
    role: "manager",
    permissions: [
      "leads.view",
      "leads.create",
      "leads.edit",
      "leads.assign",
      "leads.status_update",
      "staff.view",
      "staff.edit",
      "documents.view",
      "documents.upload",
      "documents.verify",
      "reports.view",
      "reports.export",
    ],
  },
  {
    role: "admin",
    permissions: [
      "leads.view",
      "leads.create",
      "leads.edit",
      "leads.delete",
      "leads.assign",
      "leads.reassign",
      "leads.status_update",
      "staff.view",
      "staff.create",
      "staff.edit",
      "staff.delete",
      "staff.password_reset",
      "staff.permissions",
      "documents.view",
      "documents.upload",
      "documents.verify",
      "documents.delete",
      "reports.view",
      "reports.export",
      "reports.analytics",
      "settings.system",
      "settings.integrations",
      "branches.view",
      "branches.create",
      "branches.edit",
    ],
  },
  {
    role: "staff",
    permissions: [
      "leads.view",
      "leads.create",
      "leads.edit", // Staff can now edit leads
      "leads.assign", // Staff can assign leads
      "leads.reassign", // Staff can reassign leads
      "leads.status_update",
      "documents.view",
      "documents.upload",
      "documents.verify", // Staff can verify documents
      "documents.delete", // Staff can delete documents
      "staff.create", // Added ability to create other staff (employer functionality)
      "staff.view", // Added ability to view staff
      "reports.view", // Added reporting access
    ],
  },
];

// Mock data storage (in a real app, this would be a database)
export const users: User[] = [
  {
    id: "1",
    username: "Ajith6235",
    type: "official",
    role: "owner",
    name: "Ajith Balachandran",
    email: "ajith@bankmate.com",
    phone: "9876543210",
    permissions: ALL_PERMISSIONS,
    isActive: true,
    createdAt: new Date().toISOString(),
    password: "Ajith@6235",
  },
];

export const branches: Branch[] = [
  {
    id: "1",
    name: "Mumbai Central Branch",
    editable: true,
    code: "MUM001",
    address: {
      street: "123 Business District, Nariman Point",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      country: "India",
    },
    contact: {
      phone: "+91-22-2266-7788",
      email: "mumbai.central@bankmate.com",
      fax: "+91-22-2266-7789",
    },
    manager: {
      name: "Rajesh Sharma",
      phone: "+91-98765-43210",
      email: "rajesh.sharma@bankmate.com",
    },
    region: "West",
    zone: "Metro",
    type: "main",
    parentBranchId: undefined,
    establishedDate: "2020-01-15",
    isActive: true,
    operatingHours: {
      weekdays: { open: "09:00", close: "18:00" },
      saturday: { open: "09:00", close: "14:00" },
      sunday: { open: "10:00", close: "13:00" },
    },
    services: [
      "Home Loans",
      "Personal Loans",
      "Business Loans",
      "Car Loans",
      "Credit Cards",
      "Insurance",
    ],
    targetMetrics: {
      monthlyLeadTarget: 150,
      monthlyRevenueTarget: 50000000,
      conversionRateTarget: 25,
    },
    performance: {
      currentMonthLeads: 120,
      currentMonthRevenue: 42000000,
      conversionRate: 22.5,
      lastUpdated: new Date().toISOString(),
    },
    createdAt: "2020-01-15T00:00:00.000Z",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Delhi North Branch",
    editable: true,
    code: "DEL002",
    address: {
      street: "456 Commercial Complex, Connaught Place",
      city: "New Delhi",
      state: "Delhi",
      pincode: "110001",
      country: "India",
    },
    contact: {
      phone: "+91-11-4155-6677",
      email: "delhi.north@bankmate.com",
      fax: "+91-11-4155-6678",
    },
    manager: {
      name: "Priya Gupta",
      phone: "+91-98765-43211",
      email: "priya.gupta@bankmate.com",
    },
    region: "North",
    zone: "Metro",
    type: "main",
    parentBranchId: undefined,
    establishedDate: "2020-03-20",
    isActive: true,
    operatingHours: {
      weekdays: { open: "09:30", close: "17:30" },
      saturday: { open: "09:30", close: "13:30" },
      sunday: { open: "10:00", close: "13:00" },
    },
    services: [
      "Home Loans",
      "Personal Loans",
      "Business Loans",
      "Education Loans",
      "Credit Cards",
    ],
    targetMetrics: {
      monthlyLeadTarget: 130,
      monthlyRevenueTarget: 45000000,
      conversionRateTarget: 23,
    },
    performance: {
      currentMonthLeads: 110,
      currentMonthRevenue: 38000000,
      conversionRate: 21.8,
      lastUpdated: new Date().toISOString(),
    },
    createdAt: "2020-03-20T00:00:00.000Z",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Bangalore South Branch",
    editable: true,
    code: "BLR003",
    address: {
      street: "789 Tech Park, Electronic City",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560100",
      country: "India",
    },
    contact: {
      phone: "+91-80-4033-5566",
      email: "bangalore.south@bankmate.com",
      fax: "+91-80-4033-5567",
    },
    manager: {
      name: "Vikash Kumar",
      phone: "+91-98765-43212",
      email: "vikash.kumar@bankmate.com",
    },
    region: "South",
    zone: "Metro",
    type: "main",
    parentBranchId: undefined,
    establishedDate: "2020-06-10",
    isActive: true,
    operatingHours: {
      weekdays: { open: "09:00", close: "18:30" },
      saturday: { open: "09:00", close: "15:00" },
      sunday: { open: "10:00", close: "14:00" },
    },
    services: [
      "Home Loans",
      "Personal Loans",
      "Business Loans",
      "Car Loans",
      "Education Loans",
      "Investment Products",
    ],
    targetMetrics: {
      monthlyLeadTarget: 140,
      monthlyRevenueTarget: 48000000,
      conversionRateTarget: 26,
    },
    performance: {
      currentMonthLeads: 125,
      currentMonthRevenue: 44000000,
      conversionRate: 24.2,
      lastUpdated: new Date().toISOString(),
    },
    createdAt: "2020-06-10T00:00:00.000Z",
    updatedAt: new Date().toISOString(),
  },
];

export const leads: Lead[] = [
  // Leads data will be stored here
];

export const emptyLead: Lead = {
  id: "",
  // Basic Lead Information
  leadName: "",
  clientName: "",
  contactNumber: "",
  email: "",
  dateOfBirth: "",
  gender: "", // ✅ new field
  address: "",
  currentAddress: "", // ✅ new field

  // Lead Details
  leadType: "",
  leadSource: "",
  assignedBranch: "",
  assignedStaff: "",
  ownerManagerAssignment: "",

  // Financial Information
  cost: 0,
  cibilScore: 0,
  annualIncome: "",
  incomeCategory: "", // ✅ new field
  loanAmount: "",
  loanTenure: 0, // ✅ new field
  purpose: "",

  // Application Status with color coding
  applicationStatus: "pending",
  urgencyLevel: "", // ✅ new field

  // Bank Assignment
  selectedBank: "",
  bankBranch: "",
  bankStaff: "",
  bankDocuments: [],

  // Enhanced Document Tracking
  documents: [],
  documentCompletionStatus: "pending",

  // Additional Information
  additionalInfo: "",
  notes: "",
  remarks: "",

  // Timestamps
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  branchId: "",
  documentsSubmittedAt: "",
  bankAssignedAt: "",
  statusUpdatedAt: "",

  // Legacy
  assignedAgent: "",
  status: "",

  // Lead assignment workflow
  isVisibleToStaff: false,
  assignmentStatus: "",
  assignedAt: "",
  createdByStaff: false,
  createdBy: "",

  // Tracking
  timeline: [],
  editHistory: [],
};

export const emptyLeadForm: LeadForm = {
  // Core Required
  leadName: "",
  clientName: "",
  contactNumber: "",
  email: "",
  dateOfBirth: "",
  leadType: "",

  // Customer Info
  customerName: "",
  gender: undefined,
  permanentAddress: "",
  currentAddress: "",
  completeAddress: "",

  // Loan Info
  loanTypes: [],
  incomeCategory: undefined,
  loanAmount: undefined,
  loanTenure: undefined,
  urgencyLevel: undefined,
  purposeOfLoan: "",
  annualIncome: "",

  // Lead Assignment
  leadSource: "",
  assignedBranch: undefined,
  assignedStaff: undefined,
  ownerManagerAssignment: undefined,

  // Bank Assignment
  bankSelection: "",
  bankBranch: "",
  bankStaffMember: "",
  bankDocuments: undefined,

  // Financial & Scoring
  cibilScore: undefined,
  estimatedCost: undefined,

  // Application Workflow
  applicationStatus: undefined,
  documentsSubmittedAt: undefined,
  bankAssignedAt: undefined,
  statusUpdatedAt: undefined,
  assignedAt: undefined,

  // Notes & Info
  notes: "",
  statusRemarks: "",
  additionalInformation: "",

  // Tracking
  createdAt: undefined,
  updatedAt: undefined,
  branchId: undefined,
  createdBy: undefined,
};

export const GENDER_OPTIONS = ["Male", "Female", "Other"] as const;

export const LOAN_TYPES = [
  "Home Loan",
  "Personal Loan",
  "Business Loan",
  "Car Loan",
  "Two-Wheeler Loan",
  "Gold Loan",
  "Loan Against Property (LAP)",
  "NRI Loan",
  "Education Loan",
];

export const INCOME_CATEGORY = [
  "Salaried",
  "Self-Employed",
  "Business Owner",
  "NRI",
  "Retired",
] as const;

export const LEAD_SOURCES = [
  "Social Media",
  "Facebook",
  "Instagram",
  "Google Ads",
  "Walk-in",
  "Referral",
  "Website",
  "Cold Call",
  "Email Campaign",
];

export const BANKS = [
  "State Bank of India (SBI)",
  "HDFC Bank",
  "ICICI Bank",
  "Canara Bank",
  "Punjab National Bank",
  "Bank of Baroda",
  "Axis Bank",
  "Kotak Mahindra Bank",
];

export const APPLICATION_STATUS = [
  "login",
  "pending",
  "sanctioned",
  "rejected",
] as const;

export const LOAN_DOCUMENTS = [
  // KYC Documents
  "Aadhaar Card",
  "Passport",
  "Voter ID Card",
  "Driving License",
  "PAN Card",
  "Utility Bill",
  "Ration Card",
  "Bank Statement (as Address Proof)",
  "Rent Agreement (as Address Proof)",
  "Passport-sized Photos",
  "Business Registration (GST / MSME / Incorporation Certificate)",
  "Partnership Deed",
  "MOA (Memorandum of Association)",
  "AOA (Articles of Association)",

  // Income Documents
  "Salary Slips (Last 3 Months)",
  "Bank Statement (Last 6 Months)",
  "Form 16",
  "ITR (Last 2 Years)",
  "Profit & Loss Statement",
  "Balance Sheet",
  "Sales Invoices",

  // Legal Documents
  "Sale Deed / Agreement to Sale",
  "Title Deed",
  "Possession Certificate",
  "Non-Attachment Certificate",
  "Encumbrance Certificate",
  "Location Sketch",
  "Family Membership Certificate",
  "Income Certificate",
  "Thandaper Certificate",
  "Business License",
  "Rent Agreement (If Office Rented)",
  "Fee Structure (for Education Loans)",
  "Admission Letter (for Education Loans)",
] as const;

export const DOCUMENT_STATUS = ["pending", "collected", "submitted"] as const;

export const BANK_STATUS = ["pending", "assigned"] as const;
