import { ROLE_PERMISSIONS, ALL_PERMISSIONS, staff } from "@/lib/consts";
import { supabase } from "@/lib/supabase";
import { User } from "@/types/common";
import { toast } from "sonner";

export const addStaff = async (
  staffData: Omit<
    User,
    "id" | "type" | "permissions" | "isActive" | "createdAt"
  >
): Promise<User | null> => {
  // Insert new user
  const { data: insertedUser, error: userError } = await supabase
    .from("users")
    .insert({
      username: staffData.username,
      password: staffData.password, // ⚠️ hash before saving in real use
      name: staffData.name,
      phone: staffData.phone,
      email: staffData.email,
      designation: staffData.designation,
      photo: staffData.photo || null,
      branch_id: staffData.branchId || null,
      role: "staff",
      type: "employee",
      is_active: true,
      created_at: new Date().toISOString(),
      can_access_employer_login: staffData.canAccessEmployerLogin || false,
    })
    .select()
    .single();

  if (userError) {
    toast.error("Error adding staff");
    console.error(userError);
    return null;
  }

  // Fetch role-based permissions
  const { data: rolePerms, error: roleError } = await supabase
    .from("role_permissions")
    .select("permission_id")
    .eq("role", staffData.role);

  if (roleError) {
    console.error("Error fetching role permissions:", roleError);
    return insertedUser as User; // User still created
  }

  // Attach role permissions (if needed for local object, not DB)
  const { data: allPerms } = await supabase
    .from("permissions")
    .select("*")
    .in("id", rolePerms?.map((rp) => rp.permission_id) || []);

  const finalUser: User = {
    ...insertedUser,
    permissions: allPerms || [],
  };

  toast.success("Added new staff");
  return finalUser;
};

export const getStaff = async (): Promise<User[]> => {
  const { data: staffList, error } = await supabase
    .from("users")
    .select("*")
    .eq("type", "employee")
    .eq("role", "staff");

  if (error) {
    console.error("Error fetching staff:", error);
    return [];
  }
  return staffList as User[];
};

export const getStaffById = async (id: string): Promise<User | null> => {
  const { data: staff, error } = await supabase
    .from("users")
    .select("*")
    .eq("type", "employee")
    .eq("role", "staff")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching staff:", error);
    return null;
  }
  return staff as User;
};

export const updateStaff = async (
  staffId: string,
  updates: Partial<User>
): Promise<Boolean> => {
  console.log(staffId, updates);

  const { data: updatedUser, error: userError } = await supabase
    .from("users")
    .update({
      username: updates.username,
      password: updates.password, // ⚠️ hash before saving in real use
      name: updates.name,
      phone: updates.phone,
      email: updates.email,
      designation: updates.designation,
      photo: updates.photo || null,
      branch_id: updates.branchId || null,
      role: "staff",
      type: "employee",
      is_active: true,
      created_at: new Date().toISOString(),
      can_access_employer_login: updates.canAccessEmployerLogin || false,
    })
    .eq("id", staffId)
    .select()
    .single();

  if (userError) {
    toast.error("Error updating staff");
    console.error(userError);
    return false;
  }

  if (updatedUser) {
    toast.success("Staff updated");
    return true;
  }

  return false;
};

export const deleteStaff = async (staffId: string): Promise<Boolean> => {
  const { error } = await supabase.from("users").delete().eq("id", staffId);

  if (error) {
    toast.error("Error deleting staff");
    console.error(error);
    return false;
  }

  toast.success("Staff deleted");
  return true;
};

export const updateStaffPassword = (
  staffId: string,
  newPassword: string,
  updatedBy: string
): boolean => {
  const staffIndex = staff.findIndex((s) => s.id === staffId);
  if (staffIndex !== -1) {
    staff[staffIndex].password = newPassword;
    // In a real app, you'd log this password change
    return true;
  }
  return false;
};

export const updateStaffRole = (
  staffId: string,
  newRole: User["role"],
  updatedBy: string
): boolean => {
  const staffIndex = staff.findIndex((s) => s.id === staffId);
  if (staffIndex !== -1) {
    const rolePermissions = ROLE_PERMISSIONS.find((rp) => rp.role === newRole);
    const permissions = rolePermissions
      ? ALL_PERMISSIONS.filter((p) =>
          rolePermissions.permissions.includes(p.id)
        )
      : [];

    staff[staffIndex].role = newRole;
    staff[staffIndex].permissions = permissions;
    return true;
  }
  return false;
};

export const deactivateStaff = (
  staffId: string,
  deactivatedBy: string
): boolean => {
  const staffIndex = staff.findIndex((s) => s.id === staffId);
  if (staffIndex !== -1) {
    staff[staffIndex].isActive = false;
    return true;
  }
  return false;
};

export const activateStaff = (
  staffId: string,
  activatedBy: string
): boolean => {
  const staffIndex = staff.findIndex((s) => s.id === staffId);
  if (staffIndex !== -1) {
    staff[staffIndex].isActive = true;
    return true;
  }
  return false;
};
