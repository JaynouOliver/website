"use client";

import * as Select from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";

// Pill-shaped select in the site's design language (Radix primitive under the hood).
export default function PillSelect({
  value,
  onValueChange,
  allLabel,
  options,
}: {
  value: string; // "" means "all"
  onValueChange: (v: string) => void;
  allLabel: string;
  options: { value: string; label: string }[];
}) {
  return (
    <Select.Root value={value || "__all__"} onValueChange={(v) => onValueChange(v === "__all__" ? "" : v)}>
      <Select.Trigger className="pf-select-trigger" aria-label={allLabel}>
        <Select.Value />
        <Select.Icon>
          <ChevronDown size={14} style={{ color: "var(--faint)" }} />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="pf-select-content" position="popper" sideOffset={6} align="end">
          <Select.Viewport>
            <Select.Item value="__all__" className="pf-select-item">
              <Select.ItemText>{allLabel}</Select.ItemText>
              <Select.ItemIndicator className="pf-select-check">
                <Check size={13} />
              </Select.ItemIndicator>
            </Select.Item>
            {options.map((o) => (
              <Select.Item key={o.value} value={o.value} className="pf-select-item">
                <Select.ItemText>{o.label}</Select.ItemText>
                <Select.ItemIndicator className="pf-select-check">
                  <Check size={13} />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
