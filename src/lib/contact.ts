import { z } from 'zod'

// Limites dos campos do formulário de proposta/anúncio (usados no navegador e no servidor).
export const LIMITS = { name: 100, email: 254, company: 120, message: 1000 } as const

export const contactSchema = z.object({
  lotId: z.string().max(80).optional(),
  name: z.string().trim().min(2).max(LIMITS.name),
  email: z.string().trim().email().max(LIMITS.email),
  company: z.string().trim().min(2).max(LIMITS.company),
  message: z.string().trim().min(5).max(LIMITS.message),
  consent: z.literal(true),
  website: z.string().max(0).optional(), // campo invisível contra robôs: deve vir vazio
})
export type ContactInput = z.infer<typeof contactSchema>
