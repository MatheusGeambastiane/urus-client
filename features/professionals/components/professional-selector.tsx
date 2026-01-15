"use client";

import type { ProfessionalProfile } from "../types/professional-profile";

type ProfessionalSelectorProps = {
  professionals: ProfessionalProfile[];
  selectedId?: number;
  onSelect: (professional: ProfessionalProfile) => void;
};

export const ProfessionalSelector = ({
  professionals,
  selectedId,
  onSelect,
}: ProfessionalSelectorProps) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      {professionals.map((professional) => {
        const isActive = professional.id === selectedId;
        return (
          <button
            key={professional.id}
            type="button"
            onClick={() => onSelect(professional)}
            className={`flex flex-col items-center gap-2 rounded-3xl px-3 py-4 text-center transition ${
              isActive
                ? "bg-ink-900 text-white"
                : "bg-white text-ink-700"
            } shadow-soft`}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-ink-100 text-sm font-semibold text-ink-700">
              {professional.user_profile_pic ? (
                <img
                  src={professional.user_profile_pic}
                  alt={professional.user_name}
                  className="h-full w-full rounded-full object-cover"
                  loading="lazy"
                />
              ) : (
                professional.user_name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
              )}
            </div>
            <span className="text-xs font-semibold">{professional.user_name}</span>
          </button>
        );
      })}
    </div>
  );
};
