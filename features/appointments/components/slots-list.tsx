"use client";

import type { SlotGroup } from "../utils/group-slots";

type SlotsListProps = {
  groups: SlotGroup[];
  selected?: string;
  onSelect: (slot: string) => void;
};

export const SlotsList = ({ groups, selected, onSelect }: SlotsListProps) => {
  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <section key={group.label} className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-ink-500">
              {group.label}
            </h3>
            <span className="text-xs text-ink-400">
              {group.slots.length} horarios
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {group.slots.map((slot) => {
              const isActive = slot === selected;
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => onSelect(slot)}
                  className={`rounded-2xl px-3 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "bg-ink-900 text-white"
                      : "bg-white text-ink-700"
                  } shadow-soft`}
                >
                  {slot}
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
};
