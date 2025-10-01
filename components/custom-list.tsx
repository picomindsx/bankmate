"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "./ui/input";

export function CustomList({
  items,
  onChange,
  type,
  value,
  onCustomAdd,
}: {
  value: string;
  items: { label: string; value: string }[];
  onChange?: (val: string) => void;
  onCustomAdd?: (val: string) => void;
  type?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [selectedValue, setSelectedValue] = React.useState(value || "");

  React.useEffect(() => {
    onChange && onChange(selectedValue);
  }, [selectedValue]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="min-w-[200px] justify-between"
          type="button"
        >
          {selectedValue
            ? items.find((item) => item.value === selectedValue)?.label
            : `Select ${type || "value"}...`}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0 z-[9999999]">
        <Command>
          <CommandInput
            placeholder={`Search ${type || "value"}...`}
            className="h-9"
            onValueChange={(search) => setSearch(search)}
          />
          <CommandList>
            <CommandEmpty>
              <Button
                onClick={() => {
                  onCustomAdd && onCustomAdd(search);
                }}
              >
                <Plus /> Add custom {type || "value"}
              </Button>
              <p>No {type || "value"} found.</p>
            </CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  onSelect={(currentValue) => {
                    setSelectedValue(
                      currentValue === selectedValue ? "" : currentValue
                    );
                    setOpen(false);
                  }}
                >
                  {item.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      selectedValue === item.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
