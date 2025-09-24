import { users, staff, ALL_PERMISSIONS, ROLE_PERMISSIONS } from "@/lib/consts";
import { supabase } from "@/lib/supabase";
import { Permission, User } from "@/types/common";
import { toast } from "sonner";

const getUser = async (username: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .single();

  if (error) {
    toast.error(
      "An error occurred while trying to get User. Please try again."
    );
    return null;
  }

  if (!data) {
    toast.error("User not found");
    return null;
  }
  return data as User;
};

export const authenticateUser = async (
  username: string,
  password: string
): Promise<User | null> => {
  const data = await getUser(username);

  if (data) {
    if (data.password === password) {
      const user: User = { ...data } as User;
      user.lastLogin = new Date().toISOString();
      console.log("[v0] User authenticated:", user.name || "official owner");
      return user;
    } else {
      toast.error("Invalid password");
      return null;
    }
  }

  return null;
};

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const verifyOTP = (otp: string, expectedOTP: string): boolean => {
  return otp === expectedOTP;
};

export const resetPassword = async (
  username: string,
  newPassword: string
): Promise<Boolean> => {
  const updated = await supabase
    .from("users")
    .update({ password: newPassword })
    .eq("username", username);

  if (updated.error) {
    console.error("Error updating password:", updated.error);
    return false;
  }

  toast.success("Password updated successfully");
  return true;
};

export const hasPermission = (user: User, permissionId: string): boolean => {
  if (user.role === "owner") return true;

  const rolePermissions = ROLE_PERMISSIONS.find((rp) => rp.role === user.role);
  return rolePermissions?.permissions.includes(permissionId) || false;
};

export const getUserPermissions = (user: User): Permission[] => {
  if (user.role === "owner") return ALL_PERMISSIONS;

  const rolePermissions = ROLE_PERMISSIONS.find((rp) => rp.role === user.role);
  if (!rolePermissions) return [];

  return ALL_PERMISSIONS.filter((p) =>
    rolePermissions.permissions.includes(p.id)
  );
};

export const canAccessResource = (
  user: User,
  resource: string,
  action: string
): boolean => {
  const permissionId = `${resource}.${action}`;
  return hasPermission(user, permissionId);
};

export const getUserStatistics = () => {
  const activeStaff = staff.filter((s) => s.isActive);

  return {
    totalUsers: users.length + staff.length,
    activeStaff: activeStaff.length,
    inactiveStaff: staff.length - activeStaff.length,
    owners:
      users.filter((u) => u.role === "owner").length +
      activeStaff.filter((s) => s.role === "owner").length,
    branchHeads: activeStaff.filter((s) => s.role === "branch_head").length,
    managers: activeStaff.filter((s) => s.role === "manager").length,
    admins: activeStaff.filter((s) => s.role === "admin").length,
    staff: activeStaff.filter((s) => s.role === "staff").length,
  };
};
