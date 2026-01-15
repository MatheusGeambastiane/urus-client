import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email invalido."),
  password: z.string().min(6, "Senha muito curta."),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Informe o nome."),
    email: z.string().email("Email invalido."),
    phone: z.string().min(8, "Informe o telefone."),
    date_of_birth: z.string().min(1, "Informe a data de nascimento."),
    password: z.string().min(8, "Minimo 8 caracteres."),
    confirmPassword: z.string().min(8, "Confirme a senha."),
    autoLogin: z.boolean().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas nao conferem.",
    path: ["confirmPassword"],
  });
