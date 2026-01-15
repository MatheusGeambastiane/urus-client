import { z } from "zod";

export const serviceSearchSchema = z
  .string()
  .trim()
  .max(40, "Use no maximo 40 caracteres.");
