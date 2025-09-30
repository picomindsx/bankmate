"use client";

import { Plus, Badge, UserPlus } from "lucide-react";
import React, { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LeadForm, User } from "@/types/common";

import { Label } from "@/components/ui/label";
import {
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Select,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { getStaff } from "@/services/staff-service";
import { updateLead } from "@/services/lead-service";
import { useBank } from "@/hooks/use-bank";
import { CustomList } from "./custom-list";
import { addBank } from "@/services/bank-service";

const AssignReassign = ({
  lead,
  open,
  setOpen,
  setLead,
}: {
  lead: LeadForm | null;
  open: boolean;
  setOpen: (open: boolean) => void;
  setLead: (lead: LeadForm) => void;
}) => {
  const [staff, setStaff] = useState<User[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string>();
  const [selectedBank, setSelectedBank] = useState<string>();

  const { banks: BANKS, fetchBanks } = useBank();

  const handleAssignLead = async () => {
    await updateLead(lead?.id || "", {
      ...lead,
      assignedStaff: selectedStaff,
      bankSelection: selectedBank,
    }).finally(() => {
      setOpen(false);
      setLead({
        ...lead,
        assignedStaff: selectedStaff,
        bankSelection: selectedBank,
      });
    });
  };

  useEffect(() => {
    getStaff().then((staffList) => setStaff(staffList));
    if (lead) {
      setSelectedStaff(lead?.assignedStaff);
      setSelectedBank(lead?.bankSelection);
    }
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white">
            Assign Lead to Staff & Select Bank
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            Assign {lead?.clientName} to a staff member and select a bank.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="staff" className="text-white">
                Select Staff Member
              </Label>
            </div>
            <Select value={selectedStaff} onValueChange={setSelectedStaff}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Choose staff member" />
              </SelectTrigger>
              <SelectContent>
                {staff.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name} - {member.designation}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="bank" className="text-white">
                Select Bank
              </Label>
            </div>
            {/* <Select
              value={selectedBank}
              onValueChange={(value) => {
                setSelectedBank(value);
              }}
            >
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Choose bank" />
              </SelectTrigger>
              <SelectContent>
                {BANKS?.map((bank) => (
                  <SelectItem key={bank.id} value={bank.name}>
                    {bank.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select> */}
            <CustomList
              value={selectedBank || ""}
              items={
                BANKS
                  ? BANKS?.map((bank) => ({
                      label: bank.name,
                      value: bank.name,
                    }))
                  : []
              }
              type="bank"
              onChange={(val) => setSelectedBank(val)}
              onCustomAdd={async (val) => {
                const bank = await addBank(val);
                if (bank) {
                  fetchBanks && fetchBanks();
                }
              }}
            />
          </div>

          <Button
            onClick={handleAssignLead}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Assign Lead & Make Visible to Staff
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignReassign;
