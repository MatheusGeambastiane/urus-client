export type PasswordStrength = {
  score: number;
  label: string;
};

export const getPasswordStrength = (value: string): PasswordStrength => {
  let score = 0;

  if (value.length >= 8) score += 1;
  if (/[A-Z]/.test(value)) score += 1;
  if (/[0-9]/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;

  const labels = ["Fraca", "Ok", "Boa", "Forte", "Excelente"];
  return {
    score,
    label: labels[score] ?? "Fraca",
  };
};
