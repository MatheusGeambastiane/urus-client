"use client";

import type { DateOption } from "../utils/date";

type DateCarouselProps = {
  options: DateOption[];
  selected: string;
  onSelect: (value: string) => void;
};

export const DateCarousel = ({
  options,
  selected,
  onSelect,
}: DateCarouselProps) => {
  return (
    <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
      {options.map((option) => {
        const isActive = option.key === selected;
        return (
          <button
            key={option.key}
            type="button"
            onClick={() => onSelect(option.key)}
            className={`min-w-[90px] rounded-3xl px-4 py-3 text-left text-sm transition ${
              isActive
                ? "bg-ink-900 text-white"
                : "bg-white text-ink-700"
            } shadow-soft`}
          >
            <span className="block text-xs uppercase tracking-[0.2em] opacity-70">
              {option.weekday}
            </span>
            <span className="block text-base font-semibold">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
};
