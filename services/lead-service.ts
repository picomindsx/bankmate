import { leads } from "@/lib/consts";
import { supabase } from "@/lib/supabase";
import { mapDbList, mapFormRow } from "@/lib/utils";
import { Lead, LeadForm, User } from "@/types/common";
import { toast } from "sonner";

export const addNewLead = async (
  leadData: Partial<LeadForm>
): Promise<boolean> => {
  // Map camelCase -> snake_case for Supabase

  const { data, error } = await supabase
    .from("leads")
    .insert(mapFormRow({ ...leadData, applicationStatus: "login" } as LeadForm))
    .select()
    .single();

  if (error) {
    console.error("Error inserting lead into Supabase:", error);
    toast.error("Failed to add lead. Please try again.", {
      description: error.message,
    });
    return false;
  }

  toast.success("Lead added successfully!");
  return true;
};

export const assignLeadToStaff = (
  leadId: string,
  staffId: string,
  assignedBy: User,
  selectedBank?: string
): boolean => {
  // Only Owner, Manager, and Branch Head can assign leads
  // if (!["owner", "manager", "branch_head"].includes(assignedBy.role)) {
  //   return false;
  // }

  // const lead = leads.find((l) => l.id === leadId);
  // const staffMember = staff.find((s) => s.id === staffId && s.isActive);

  // if (lead && staffMember) {
  //   lead.assignedStaff = staffMember.name;
  //   lead.ownerManagerAssignment = `${assignedBy.name} (${assignedBy.role})`;
  //   lead.isVisibleToStaff = true; // Make lead visible to staff after assignment
  //   lead.assignmentStatus = "assigned";
  //   lead.assignedAt = new Date().toISOString();

  //   if (selectedBank) {
  //     lead.selectedBank = selectedBank;
  //     lead.bankAssignedAt = new Date().toISOString();
  //   }

  //   lead.updatedAt = new Date().toISOString();

  //   console.log(
  //     `[v0] Lead ${leadId} assigned to ${staffMember.name} by ${assignedBy.name}`
  //   );
  //   return true;
  // }
  return false;
};

export const getStaffAssignedLeads = async (
  staffId: string
): Promise<LeadForm[]> => {
  // Staff can see:
  // 1. Leads they personally created (even if not assigned back to them yet)
  // TODO: 2. Leads assigned to them by Owner/Manager/Branch Head
  // TODO: 3. Leads assigned from external sources
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    // .eq("created_by", staffId)
    .or(`created_by.eq.${staffId},assigned_staff.eq.${staffId})`);

  if (error) {
    console.error("Error fetching leads from Supabase:", error);
    toast.error("Failed to fetch leads. Please try again.", {
      description: error.message,
    });
    return [];
  }

  return mapDbList<LeadForm>(data) || [];
};

export const getBranchLeads = async (branchId: string): Promise<LeadForm[]> => {
  // Staff can see:
  // 1. Leads they personally created (even if not assigned back to them yet)
  // TODO: 2. Leads assigned to them by Owner/Manager/Branch Head
  // TODO: 3. Leads assigned from external sources
  const { data, error } = await supabase
    .from("branch_leads_view")
    .select("*")
    .eq("assigned_branch", branchId);

  if (error) {
    console.error("Error fetching leads from Supabase:", error);
    toast.error("Failed to fetch leads. Please try again.", {
      description: error.message,
    });
    return [];
  }

  return mapDbList<LeadForm>(data) || [];
};

export const getAllLeads = async (): Promise<LeadForm[]> => {
  // Staff can see:
  // 1. Leads they personally created (even if not assigned back to them yet)
  // TODO: 2. Leads assigned to them by Owner/Manager/Branch Head
  // TODO: 3. Leads assigned from external sources
  const { data, error } = await supabase.from("branch_leads_view").select("*");

  if (error) {
    console.error("Error fetching leads from Supabase:", error);
    toast.error("Failed to fetch leads. Please try again.", {
      description: error.message,
    });
    return [];
  }

  return mapDbList<LeadForm>(data) || [];
};

export const getAssignedLeads = (staffId: string): Lead[] => {
  // const staffMember = staff.find((s) => s.id === staffId);
  // if (!staffMember) return [];

  // // Staff can see:
  // // 1. Leads they personally created (even if not assigned back to them yet)
  // // 2. Leads assigned to them by Owner/Manager/Branch Head
  // // 3. Leads assigned from external sources
  // return leads.filter(
  //   (lead) =>
  //     (lead.createdBy === staffMember.name && lead.createdByStaff === true) || // Their own created leads
  //     (lead.assignedStaff === staffMember.name &&
  //       lead.isVisibleToStaff === true &&
  //       lead.assignmentStatus === "assigned") // Assigned leads
  // );
  return [];
};

export const getStaffCreatedLeads = (): Lead[] => {
  return leads.filter((lead) => lead.createdByStaff === true);
};

export const getLeadsByLoanType = (
  loanType: string,
  branchId?: string
): Lead[] => {
  const filteredLeads = branchId
    ? leads.filter((lead) => lead.branchId === branchId)
    : leads;
  return filteredLeads.filter((lead) => lead.leadType === loanType);
};

export const getLeads = (branchId?: string): Lead[] => {
  if (branchId) {
    return leads.filter((l) => l.branchId === branchId);
  }
  return leads;
};

export const updateLead = async (
  leadId: string,
  updates: Partial<LeadForm>
): Promise<Boolean> => {
  const newUpdates = { ...updates };
  delete newUpdates.assignedStaffName;
  delete newUpdates.ownerManagerAssignmentName;

  const { data, error } = await supabase
    .from("leads")
    .update(mapFormRow(newUpdates))
    .eq("id", leadId)
    .select()
    .single();

  if (error) {
    console.error("Error updating lead into Supabase:", error);
    toast.error("Failed to update lead. Please try again.", {
      description: error.message,
    });
    return false;
  }

  toast.success("Lead updated successfully!");
  return true;
};

export const deleteLead = (leadId: string): boolean => {
  const leadIndex = leads.findIndex((l) => l.id === leadId);
  if (leadIndex !== -1) {
    leads.splice(leadIndex, 1);
    return true;
  }
  return false;
};
