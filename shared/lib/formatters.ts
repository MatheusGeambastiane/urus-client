export const formatCurrency = (value: string) => {
  const numberValue = Number(value);

  if (Number.isNaN(numberValue)) {
    return value;
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numberValue);
};

export const formatDuration = (duration: string) => {
  const [hours, minutes] = duration.split(":").map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return duration;
  }

  const parts = [];

  if (hours > 0) {
    parts.push(`${hours}h`);
  }

  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }

  return parts.join(" ") || "0m";
};

export const formatAppointmentDate = (dateTime: string) => {
  const parsed = new Date(dateTime);

  if (Number.isNaN(parsed.getTime())) {
    return { date: dateTime, time: "" };
  }

  return {
    date: parsed.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    }),
    time: parsed.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
};
