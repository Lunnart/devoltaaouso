import { createServerFn } from '@tanstack/react-start'
import { contactSchema } from './contact'
import { lots } from './marketplace'

export const submitContact = createServerFn({ method: 'POST' })
  .inputValidator((d) => contactSchema.parse(d))
  .handler(async ({ data }): Promise<{ ok: boolean; error?: string }> => {
    const lot = data.lotId ? lots.find((l) => l.id === data.lotId) : undefined
    if (data.lotId && !lot) return { ok: false, error: 'Lote não encontrado.' }
    const { appendRow, nowInSaoPaulo } = await import('./sheets.server')
    try {
      if (lot) await appendRow('Propostas', [nowInSaoPaulo(), lot.title, data.name, data.email, data.company, data.message, 'Nova'])
      else await appendRow('Anúncios', [nowInSaoPaulo(), data.name, data.email, data.company, data.message, 'Novo'])
      return { ok: true }
    } catch (e) {
      console.error('submitContact error', e)
      return { ok: false, error: 'Não foi possível enviar agora. Tente novamente em alguns minutos.' }
    }
  })
