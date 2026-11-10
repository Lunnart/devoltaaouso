import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { ExternalLink, Info } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'

export const PRICE_DISCLAIMER = 'Os preços dos materiais recicláveis podem variar conforme a qualidade, quantidade, limpeza, localização e condições comerciais. Consulte a fonte e confirme a cotação diretamente com o comprador antes de realizar uma negociação.'

const typeLabel: Record<string, string> = { anunciado: 'Preço anunciado', media_referencia: 'Média de referência', cotacao_confirmada: 'Cotação confirmada' }

export const Route = createFileRoute('/precos')({
  head: () => ({ meta: [
    { title: 'Preços de recicláveis em Fortaleza | Circular' },
    { name: 'description', content: 'Preços de referência por kg dos materiais recicláveis em Fortaleza–CE, com fonte e data de cada cotação.' },
    { property: 'og:title', content: 'Preços de recicláveis em Fortaleza–CE' },
    { property: 'og:description', content: 'Referências por kg com fonte, data e nível de confirmação.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' },
  ] }),
  component: Prices,
})

async function loadPrices() {
  const [{ data: materials, error: e1 }, { data: prices, error: e2 }] = await Promise.all([
    supabase.from('materials').select('id, code, name, category, unit').eq('active', true).order('category'),
    supabase.from('material_prices').select('*').is('valid_to', null).eq('state', 'CE'),
  ])
  if (e1 || e2) throw e1 ?? e2
  return (materials ?? []).map(m => ({ ...m, price: (prices ?? []).find(p => p.material_id === m.id) ?? null }))
}

const brl = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
const date = (d: string | null) => d ? new Date(d + 'T12:00:00').toLocaleDateString('pt-BR') : '—'

function Prices() {
  const { data, isLoading, error } = useQuery({ queryKey: ['prices-ce'], queryFn: loadPrices })
  const [cat, setCat] = useState('')
  const rows = (data ?? []).filter(r => !cat || r.category === cat)
  const cats = [...new Set((data ?? []).map(r => r.category))]
  return <main><section className="page-heading"><div className="container"><div className="eyebrow"><span />REFERÊNCIA · FORTALEZA–CE</div><h1>Preços de recicláveis</h1><p>Valores por kg com fonte, data e nível de confirmação. Sem cotação verificável, mostramos “cotação pendente”.</p></div></section>
  <section className="container catalog-section">
    <p className="price-note"><Info size={16} />{PRICE_DISCLAIMER}</p>
    <label className="select-field price-filter"><select aria-label="Material" value={cat} onChange={e => setCat(e.target.value)}><option value="">Todos os materiais</option>{cats.map(c => <option key={c}>{c}</option>)}</select></label>
    {isLoading ? <p>Carregando preços…</p> : error ? <p>Não foi possível carregar os preços agora.</p> :
    <div className="price-table-wrap"><table className="price-table"><thead><tr><th>Material</th><th>Preço</th><th>Cidade</th><th>Fonte</th><th>Data</th><th>Confirmação</th></tr></thead><tbody>
      {rows.map(r => <tr key={r.id}><td><strong>{r.name}</strong><span>{r.category}{r.price?.source_item ? ` · ${r.price.source_item}` : ''}</span></td>
        <td>{r.price ? <strong>{brl(Number(r.price.buy_price_per_kg))}/{r.unit}</strong> : <em>Cotação pendente</em>}</td>
        <td>{r.price ? `${r.price.city}–${r.price.state}` : 'Fortaleza–CE'}</td>
        <td>{r.price?.source_url ? <a href={r.price.source_url} target="_blank" rel="noopener noreferrer">{r.price.source_name}<ExternalLink size={12} /></a> : '—'}</td>
        <td>{date(r.price?.reference_date ?? null)}</td>
        <td>{r.price ? <span className="price-badge">{typeLabel[r.price.price_type] ?? r.price.price_type}</span> : <span className="price-badge pending">Sem fonte</span>}{r.price?.notes && <span>{r.price.notes}</span>}</td></tr>)}
    </tbody></table></div>}
  </section></main>
}
