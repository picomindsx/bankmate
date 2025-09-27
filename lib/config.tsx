import { LeadForm } from "@/types/common";
import {
  Briefcase,
  Building2,
  Circle,
  CreditCard,
  Info,
  LucideIcon,
  Mail,
  MapPin,
  Phone,
  User,
  Users,
} from "lucide-react";

const COMMON_ICON = Info;

export const LeadFormDetailsConfig: {
  [key in keyof LeadForm]?: {
    icon: LucideIcon;
    label: string;
    iconClassName?: string;
    valueKeys?: string[];
  };
} = {
  leadName: {
    icon: User,
    label: "Lead Name",
    iconClassName: "text-blue-300",
    valueKeys: ["leadName", "clientName"],
  },
  leadSource: {
    icon: COMMON_ICON,
    label: "Lead Source",
    iconClassName: "text-gray-500",
  },
  assignedStaffName: {
    icon: User,
    label: "Assigned Staff",
    iconClassName: "text-teal-300",
  },
  contactNumber: {
    icon: Phone,
    label: "Contact Number",
    iconClassName: "text-green-300",
  },
  email: { icon: Mail, label: "Email", iconClassName: "text-purple-300" },
  dateOfBirth: {
    icon: COMMON_ICON,
    label: "Date of Birth",
    iconClassName: "text-gray-500",
  },
  leadType: {
    icon: Briefcase,
    label: "Product",
    iconClassName: "text-orange-300",
  },
  gender: {
    icon: COMMON_ICON,
    label: "Gender",
    iconClassName: "text-gray-500",
  },
  permanentAddress: {
    icon: MapPin,
    label: "Permanent Address",
    iconClassName: "text-red-300",
  },
  currentAddress: {
    icon: MapPin,
    label: "Current Address",
    iconClassName: "text-red-300",
  },
  loanTypes: {
    icon: COMMON_ICON,
    label: "Loan Types",
    iconClassName: "text-gray-500",
  },
  incomeCategory: {
    icon: COMMON_ICON,
    label: "Income Category",
    iconClassName: "text-gray-500",
  },
  estimatedCost: {
    icon: COMMON_ICON,
    label: "Estimated Cost",
    iconClassName: "text-gray-500",
  },
  cibilScore: {
    icon: CreditCard,
    label: "Cibil",
    iconClassName: "text-yellow-300",
  },
  bankSelection: {
    icon: Building2,
    label: "Bank Selection",
    iconClassName: "text-indigo-300",
  },
  bankBranch: {
    icon: COMMON_ICON,
    label: "Bank Branch",
    iconClassName: "text-gray-500",
  },
  bankStaffMember: {
    icon: COMMON_ICON,
    label: "Bank Staff Member",
    iconClassName: "text-gray-500",
  },
  ownerManagerAssignmentName: {
    icon: Users,
    label: "Owner/Manager",
    iconClassName: "text-gray-500",
  },
  loanAmount: {
    icon: COMMON_ICON,
    label: "Loan Amount",
    iconClassName: "text-gray-500",
  },
  loanTenure: {
    icon: COMMON_ICON,
    label: "Loan Tenure",
    iconClassName: "text-gray-500",
  },
  urgencyLevel: {
    icon: COMMON_ICON,
    label: "Urgency Level",
    iconClassName: "text-gray-500",
  },
  purposeOfLoan: {
    icon: COMMON_ICON,
    label: "Purpose Of Loan",
    iconClassName: "text-gray-500",
  },
  annualIncome: {
    icon: COMMON_ICON,
    label: "Annual Income",
    iconClassName: "text-gray-500",
  },
  applicationStatus: {
    icon: COMMON_ICON,
    label: "Application Status",
    iconClassName: "text-gray-500",
  },
  additionalInformation: {
    icon: COMMON_ICON,
    label: "Additional Information",
    iconClassName: "text-gray-500",
  },
  employerName: {
    icon: COMMON_ICON,
    label: "Empoyer Name",
    iconClassName: "text-gray-500",
  },
  designation: {
    icon: COMMON_ICON,
    label: "Designation",
    iconClassName: "text-gray-500",
  },
  officeAddress: {
    icon: COMMON_ICON,
    label: "Office Address",
    iconClassName: "text-gray-500",
  },
  monthlyGrossSalary: {
    icon: COMMON_ICON,
    label: "Monthly Gross Salary",
    iconClassName: "text-gray-500",
  },
  yearsOfExperience: {
    icon: COMMON_ICON,
    label: "Years OF Experience",
    iconClassName: "text-gray-500",
  },
  businessName: {
    icon: COMMON_ICON,
    label: "Buisiness Name",
    iconClassName: "text-gray-500",
  },
  businessType: {
    icon: COMMON_ICON,
    label: "Buisiness Type",
    iconClassName: "text-gray-500",
  },
  businessAddress: {
    icon: COMMON_ICON,
    label: "Buisiness Address",
    iconClassName: "text-gray-500",
  },
  annualTurnover: {
    icon: COMMON_ICON,
    label: "Annual Income",
    iconClassName: "text-gray-500",
  }, // or number
  yearsInBusiness: {
    icon: COMMON_ICON,
    label: "Years In Buisiness",
    iconClassName: "text-gray-500",
  }, // or number
  countryOfResidence: {
    icon: COMMON_ICON,
    label: "Country Of Residence",
    iconClassName: "text-gray-500",
  },
  jobTypeNRI: {
    icon: COMMON_ICON,
    label: "Job Type",
    iconClassName: "text-gray-500",
  },
};
