import {
  IApplicationStatus,
  IBankStatus,
  IDocumentStatus,
} from "@/types/common";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function camelToSnake(key: string): string {
  return key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function snakeToCamel(key: string): string {
  return key.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
}

// Convert a DB row (snake_case) → camelCase object
export function mapDbRow<T = any>(dbRow: Record<string, any>): T {
  const mapped: any = {};
  for (const [key, value] of Object.entries(dbRow)) {
    mapped[snakeToCamel(key)] = value;
  }
  return mapped as T;
}

// Convert a camelCase form object → snake_case for DB
export function mapFormRow<T = any>(formRow: Record<string, any>): T {
  const mapped: any = {};
  for (const [key, value] of Object.entries(formRow)) {
    mapped[camelToSnake(key)] = value;
  }
  return mapped as T;
}

export function mapDbList<T = any>(rows: Record<string, any>[]): T[] {
  return rows.map(mapDbRow);
}

export function mapFormList<T = any>(rows: Record<string, any>[]): T[] {
  return rows.map(mapFormRow);
}

export const getStatusColor = (status: IApplicationStatus) => {
  switch (status) {
    case "login":
      return "bg-blue-500";
    case "pending":
      return "bg-orange-500";
    case "sanctioned":
      return "bg-green-500";
    case "rejected":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};

export const getDocumentStatusColor = (status: IDocumentStatus) => {
  switch (status) {
    case "collected":
      return "bg-blue-500";
    case "pending":
      return "bg-gray-500";
    case "submitted":
      return "bg-green-500";
    default:
      return "bg-gray-500";
  }
};

export const getBankStatusColor = (status: IBankStatus) => {
  switch (status) {
    case "pending":
      return "bg-gray-500";
    case "assigned":
      return "bg-green-500";
    default:
      return "bg-gray-500";
  }
};
