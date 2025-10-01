import { supabase } from "@/lib/supabase";
import { mapDbList, mapDbRow, mapFormRow } from "@/lib/utils";
import { Branch, IBank } from "@/types/common";
import { toast } from "sonner";

// Branch management
export const getBanks = async (): Promise<IBank[]> => {
  const { data, error } = await supabase.from("banks").select("*");
  if (error) {
    console.error("Error fetching branches:", error);
    return [];
  }
  return mapDbList(data);
};

export const addBank = async (name: string): Promise<IBank | null> => {
  const { data, error } = await supabase
    .from("banks")
    .insert(mapDbRow({ name }))
    .select()
    .single();
  if (error) {
    console.error("Error adding bank:", error);
    return null;
  }
  toast.success("Bank Added successfully, please select from menu!");
  return mapFormRow<IBank>(data);
};
