import { describe, it, expect } from 'vitest'
import { contactSchema } from '@/lib/contact'

const base = { name: 'Ana Souza', email: 'ana@empresa.com.br', company: 'Coop Recomeço', message: 'Quero 5 toneladas', consent: true as const }

describe('contactSchema', () => {
  it('aceita um contato válido', () => expect(contactSchema.safeParse(base).success).toBe(true))
  it('recusa nome acima de 100 caracteres', () => expect(contactSchema.safeParse({ ...base, name: 'a'.repeat(101) }).success).toBe(false))
  it('recusa mensagem acima de 1.000 caracteres', () => expect(contactSchema.safeParse({ ...base, message: 'a'.repeat(1001) }).success).toBe(false))
  it('exige autorização de uso dos dados', () => expect(contactSchema.safeParse({ ...base, consent: false }).success).toBe(false))
  it('recusa envio com o campo anti-robô preenchido', () => expect(contactSchema.safeParse({ ...base, website: 'spam' }).success).toBe(false))
})
