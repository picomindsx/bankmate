import { branches } from "@/lib/consts";
import { supabase } from "@/lib/supabase";
import { Branch } from "@/types/common";

// Branch management
export const getBranches = async (): Promise<Branch[]> => {
  const branchList = await supabase.from("branches").select("*");
  if (branchList.error) {
    console.error("Error fetching branches:", branchList.error);
    return [];
  }
  return branchList.data as Branch[];
};

export const updateBranchName = (
  branchId: string,
  newName: string
): boolean => {
  const branchIndex = branches.findIndex((b) => b.id === branchId);
  if (branchIndex !== -1) {
    branches[branchIndex].name = newName;
    return true;
  }
  return false;
};

export const getBranchById = (branchId: string): Branch | undefined => {
  return branches.find((b) => b.id === branchId);
};

export const getBranchesByRegion = (region: string): Branch[] => {
  return branches.filter((b) => b.region === region && b.isActive);
};

export const getBranchesByZone = (zone: string): Branch[] => {
  return branches.filter((b) => b.zone === zone && b.isActive);
};

export const getBranchesByType = (type: Branch["type"]): Branch[] => {
  return branches.filter((b) => b.type === type && b.isActive);
};

export const getSubBranches = (parentBranchId: string): Branch[] => {
  return branches.filter(
    (b) => b.parentBranchId === parentBranchId && b.isActive
  );
};

export const updateBranchPerformance = (
  branchId: string,
  performance: Partial<Branch["performance"]>
): boolean => {
  const branchIndex = branches.findIndex((b) => b.id === branchId);
  if (branchIndex !== -1) {
    branches[branchIndex].performance = {
      ...branches[branchIndex].performance,
      ...performance,
      lastUpdated: new Date().toISOString(),
    };
    branches[branchIndex].updatedAt = new Date().toISOString();
    return true;
  }
  return false;
};

export const addBranch = (
  branchData: Omit<Branch, "id" | "createdAt" | "updatedAt">
): Branch => {
  const newBranch: Branch = {
    ...branchData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  branches.push(newBranch);
  return newBranch;
};

export const updateBranch = (
  branchId: string,
  updates: Partial<Branch>
): boolean => {
  const branchIndex = branches.findIndex((b) => b.id === branchId);
  if (branchIndex !== -1) {
    branches[branchIndex] = {
      ...branches[branchIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return true;
  }
  return false;
};

export const deactivateBranch = (branchId: string): boolean => {
  const branchIndex = branches.findIndex((b) => b.id === branchId);
  if (branchIndex !== -1) {
    branches[branchIndex].isActive = false;
    branches[branchIndex].updatedAt = new Date().toISOString();
    return true;
  }
  return false;
};

export const getBranchStatistics = () => {
  const activeBranches = branches.filter((b) => b.isActive);
  const regions = [...new Set(activeBranches.map((b) => b.region))];
  const zones = [...new Set(activeBranches.map((b) => b.zone))];

  return {
    total: activeBranches.length,
    inactive: branches.length - activeBranches.length,
    byRegion: regions.map((region) => ({
      region,
      count: activeBranches.filter((b) => b.region === region).length,
    })),
    byZone: zones.map((zone) => ({
      zone,
      count: activeBranches.filter((b) => b.zone === zone).length,
    })),
    byType: {
      main: activeBranches.filter((b) => b.type === "main").length,
      sub: activeBranches.filter((b) => b.type === "sub").length,
      service: activeBranches.filter((b) => b.type === "service").length,
    },
    totalTargetLeads: activeBranches.reduce(
      (sum, b) => sum + b.targetMetrics.monthlyLeadTarget,
      0
    ),
    totalCurrentLeads: activeBranches.reduce(
      (sum, b) => sum + b.performance.currentMonthLeads,
      0
    ),
    totalTargetRevenue: activeBranches.reduce(
      (sum, b) => sum + b.targetMetrics.monthlyRevenueTarget,
      0
    ),
    totalCurrentRevenue: activeBranches.reduce(
      (sum, b) => sum + b.performance.currentMonthRevenue,
      0
    ),
    averageConversionRate:
      activeBranches.reduce((sum, b) => sum + b.performance.conversionRate, 0) /
      activeBranches.length,
  };
};
