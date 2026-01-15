export type SlotGroup = {
  label: string;
  slots: string[];
};

const getPeriodLabel = (hour: number) => {
  if (hour < 12) return "Manha";
  if (hour < 18) return "Tarde";
  return "Noite";
};

export const groupSlotsByPeriod = (slots: string[]): SlotGroup[] => {
  const groups = new Map<string, string[]>();

  slots.forEach((slot) => {
    const [hourPart] = slot.split(":");
    const hour = Number(hourPart);
    const label = Number.isNaN(hour) ? "Outros" : getPeriodLabel(hour);
    const current = groups.get(label) ?? [];
    current.push(slot);
    groups.set(label, current);
  });

  return Array.from(groups.entries()).map(([label, groupSlots]) => ({
    label,
    slots: groupSlots,
  }));
};
