export const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(date.getDate() + days);
  return next;
};

export type DateOption = {
  key: string;
  label: string;
  weekday: string;
};

export const buildDateOptions = (days = 7) => {
  const today = new Date();
  return Array.from({ length: days }, (_, index) => {
    const value = addDays(today, index);
    return {
      key: formatDateKey(value),
      label: value.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
      }),
      weekday: value.toLocaleDateString("pt-BR", {
        weekday: "short",
      }),
    } as DateOption;
  });
};
