"use client";

import * as Select from "@radix-ui/react-select";
import { ChevronDownIcon, CheckCircleIcon } from "@/components/icons";

export type SelectOption = { value: string; label: string };

export function FilterSelect({
  label,
  value,
  onValueChange,
  options,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
}) {
  return (
    <Select.Root value={value} onValueChange={onValueChange}>
      <label className="mb-1.5 block font-mono text-sm uppercase sm:text-xs tracking-wider text-fg-subtle">
        {label}
      </label>
      <Select.Trigger
        aria-label={label}
        className="flex h-12 w-full items-center justify-between gap-2 rounded-xl border border-border-strong bg-bg-elevated px-4 text-sm text-fg outline-none transition-colors hover:border-accent data-[state=open]:border-accent"
      >
        <Select.Value />
        <Select.Icon>
          <ChevronDownIcon className="h-4 w-4 text-fg-muted" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={6}
          className="z-50 overflow-hidden rounded-xl border border-border-strong bg-bg-elevated-2 shadow-2xl"
        >
          <Select.Viewport className="p-1">
            {options.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                className="relative flex cursor-pointer select-none items-center justify-between rounded-lg px-3 py-2.5 text-sm text-fg outline-none data-[highlighted]:bg-accent-soft data-[highlighted]:text-accent"
              >
                <Select.ItemText>{option.label}</Select.ItemText>
                <Select.ItemIndicator>
                  <CheckCircleIcon className="h-4 w-4" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
