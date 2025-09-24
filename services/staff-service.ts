import { ROLE_PERMISSIONS, ALL_PERMISSIONS, staff } from "@/lib/consts";
import { User } from "@/types/common";

export const addStaff = (
  staffData: Omit<
    User,
    "id" | "type" | "permissions" | "isActive" | "createdAt"
  >
): User => {
  const rolePermissions = ROLE_PERMISSIONS.find(
    (rp) => rp.role === staffData.role
  );
  const permissions = rolePermissions
    ? ALL_PERMISSIONS.filter((p) => rolePermissions.permissions.includes(p.id))
    : [];

  const newStaff: User = {
    ...staffData,
    id: Date.now().toString(),
    type: "employee",
    permissions,
    isActive: true,
    createdAt: new Date().toISOString(),
    password: staffData.phone || "default123",
  };
  staff.push(newStaff);

  console.log("[v0] Staff created:", {
    phone: newStaff.phone,
    password: newStaff.password,
  });

  return newStaff;
};

export const getStaff = (): User[] => staff;

export const updateStaff = (
  staffId: string,
  updates: Partial<User>
): boolean => {
  const staffIndex = staff.findIndex((s) => s.id === staffId);
  if (staffIndex !== -1) {
    staff[staffIndex] = { ...staff[staffIndex], ...updates };
    return true;
  }
  return false;
};

export const deleteStaff = (staffId: string): boolean => {
  const staffIndex = staff.findIndex((s) => s.id === staffId);
  if (staffIndex !== -1) {
    staff.splice(staffIndex, 1);
    return true;
  }
  return false;
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
