import { createFileRoute } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useState } from 'react'
import { Send, Mail, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { askAssistant, type AssistantReply } from '@/lib/assistant.functions'
import { approvedFaq, TEAM_EMAIL } from '@/lib/faq'

export const Route = createFileRoute('/duvidas')({
  head: () => ({ meta: [
    { title: 'Dúvidas | Circular' },
    { name: 'description', content: 'Tire suas dúvidas sobre o marketplace Circular com nosso assistente.' },
    { property: 'og:title', content: 'Tire suas dúvidas | Circular' },
    { property: 'og:description', content: 'Assistente que responde com base no conteúdo aprovado da Circular.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] }),
  component: Duvidas,
})

function Duvidas() {
  const ask = useServerFn(askAssistant)
  const [question, setQuestion] = useState('')
  const [asked, setAsked] = useState('')
  const [reply, setReply] = useState<AssistantReply | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (question.trim().length < 3 || loading) return
    setLoading(true); setReply(null); setAsked(question.trim())
    try { setReply(await ask({ data: { question: question.trim() } })) }
    catch { setReply({ answered: false, answer: '', error: 'Não foi possível consultar o assistente.' }) }
    finally { setLoading(false) }
  }

  const mailto = `mailto:${TEAM_EMAIL}?subject=${encodeURIComponent('Dúvida sobre a Circular')}&body=${encodeURIComponent(asked)}`

  return <main>
    <section className="page-heading"><div className="container"><div className="eyebrow"><span />ESTAMOS AQUI PARA AJUDAR</div><h1>Tire suas dúvidas</h1><p>Nosso assistente responde com base apenas no conteúdo aprovado pela equipe.</p></div></section>
    <section className="container" style={{ maxWidth: 760, paddingBottom: 64 }}>
      <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
        <label htmlFor="q" style={{ fontWeight: 600 }}>Descreva sua dúvida</label>
        <textarea id="q" value={question} onChange={(e) => setQuestion(e.target.value)} maxLength={500} rows={4} placeholder="Ex.: Como envio uma proposta para um lote?" className="rounded-md border border-input bg-background p-3" />
        <small className="text-muted-foreground">Não inclua dados pessoais. Perguntas sem resposta ficam registradas para a equipe responder.</small>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><small className="text-muted-foreground">{question.length}/500</small><Button type="submit" disabled={loading || question.trim().length < 3}>{loading ? 'Pensando…' : 'Perguntar'} <Send size={16} /></Button></div>
      </form>
      {reply && <div className="rounded-md border border-border bg-card p-5" style={{ marginTop: 24 }} aria-live="polite">
        {reply.answered ? <><p style={{ display: 'flex', gap: 8, fontWeight: 600 }}><Bot size={20} /> Resposta</p><p style={{ marginTop: 8 }}>{reply.answer}</p></> : <>
          <p style={{ fontWeight: 600 }}>{reply.error ?? 'Ainda não temos uma resposta aprovada para essa pergunta.'}</p>
          <p className="text-muted-foreground" style={{ marginTop: 8 }}>{reply.forwarded ? 'Sua pergunta foi registrada e encaminhada para a nossa equipe. Se quiser receber a resposta, envie também por e-mail — sua pergunta já vai preenchida.' : 'Encaminhe sua dúvida para a nossa equipe — sua pergunta já vai preenchida no e-mail.'}</p>
          <Button asChild variant="outline" style={{ marginTop: 12 }}><a href={mailto}>{reply.forwarded ? 'Receber resposta por e-mail' : 'Enviar para a equipe'} <Mail size={16} /></a></Button>
        </>}
      </div>}
      <h2 style={{ marginTop: 48, fontSize: 22, fontWeight: 700 }}>Perguntas frequentes</h2>
      <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>{approvedFaq.map((f) => <details key={f.q} className="rounded-md border border-border p-4"><summary style={{ fontWeight: 600, cursor: 'pointer' }}>{f.q}</summary><p style={{ marginTop: 8 }}>{f.a}</p></details>)}</div>
    </section>
  </main>
}
