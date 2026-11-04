import { Link } from '@tanstack/react-router'
import { useState, type FormEvent } from 'react'
import { ArrowDownLeft, ArrowUpRight, ArrowRight, Recycle, Menu, X, MapPin, Weight, Repeat2, Package, Check, Leaf, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { formatPrice, type Lot } from '@/lib/marketplace'
import { useServerFn } from '@tanstack/react-start'
import { submitContact } from '@/lib/contact.functions'
import { LIMITS } from '@/lib/contact'

export function ActionDialog({ open, onOpenChange, lot }: { open: boolean; onOpenChange: (value: boolean) => void; lot?: Lot }) {
  const send = useServerFn(submitContact)
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (sending) return
    const f = new FormData(event.currentTarget)
    const get = (k: string) => String(f.get(k) ?? '')
    setSending(true); setError('')
    try {
      const res = await send({ data: { lotId: lot?.id, name: get('name'), email: get('email'), company: get('company'), message: get('message'), consent: f.get('consent') === 'on', website: get('website') } })
      if (res.ok) setSent(true); else setError(res.error ?? 'Não foi possível enviar agora.')
    } catch { setError('Confira os campos e tente novamente.') }
    finally { setSending(false) }
  }
  return <Dialog open={open} onOpenChange={value => { onOpenChange(value); setSent(false); setError('') }}><DialogContent className="max-h-[90dvh] overflow-y-auto rounded-lg"><div className="dialog-icon"><Leaf size={25} /></div><DialogTitle>{sent ? 'Tudo pronto para um novo ciclo.' : lot ? 'Vamos conectar essa oportunidade?' : 'Dê um novo destino aos seus resíduos.'}</DialogTitle><DialogDescription>{sent ? (lot ? 'Proposta recebida! Nossa equipe vai analisar e entrar em contato pelo e-mail informado.' : 'Anúncio recebido! Nossa equipe vai revisar o material e entrar em contato pelo e-mail informado.') : lot ? `Interesse no lote: ${lot.title}` : 'Conte um pouco sobre sua empresa e o material que deseja anunciar.'}</DialogDescription>{!sent ? <form onSubmit={submit} className="contact-form"><label>Seu nome<input required minLength={2} maxLength={LIMITS.name} name="name" placeholder="Nome e sobrenome" /></label><label>E-mail profissional<input required type="email" maxLength={LIMITS.email} name="email" placeholder="voce@empresa.com.br" /></label><label>Empresa ou cooperativa<input required minLength={2} maxLength={LIMITS.company} name="company" placeholder="Nome da organização" /></label><label>{lot ? 'Sua proposta' : 'Sobre o material'}<textarea required minLength={5} maxLength={LIMITS.message} rows={3} name="message" placeholder={lot ? 'Conte o volume desejado, valor e condições de coleta…' : 'Tipo de resíduo, quantidade e cidade…'} /></label><input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1 }} /><label style={{ flexDirection: 'row', alignItems: 'flex-start', fontWeight: 400 }}><input required type="checkbox" name="consent" style={{ marginTop: 3 }} />Autorizo a Circular a guardar estes dados para responder ao meu contato.</label><p className="demo-note">Os lotes exibidos ainda são demonstrativos. Seu contato é recebido pela equipe Circular.</p>{error && <p role="alert" className="text-destructive" style={{ fontSize: 12 }}>{error}</p>}<Button type="submit" disabled={sending} className="h-11 w-full"><Send size={16} />{sending ? 'Enviando…' : lot ? 'Enviar proposta' : 'Enviar anúncio'}</Button></form> : <><div className="success-check"><Check size={32} /></div><Button onClick={() => onOpenChange(false)}>Concluir</Button></>}</DialogContent></Dialog>
}

export function Header() {
  const [menu, setMenu] = useState(false)
  const [announce, setAnnounce] = useState(false)
  return <><header className="site-header"><div className="container header-inner"><Link to="/" className="brand" aria-label="Circular — início"><span className="brand-mark"><ArrowUpRight /><ArrowDownLeft /></span>circular<span className="brand-dot">.</span></Link><nav className={menu ? 'main-nav is-open' : 'main-nav'} aria-label="Navegação principal"><Link to="/" activeOptions={{ exact: true }} activeProps={{ className: 'active' }} onClick={() => setMenu(false)}>Início</Link><Link to="/catalogo" activeProps={{ className: 'active' }} onClick={() => setMenu(false)}>Explorar resíduos</Link><Link to="/como-funciona" activeProps={{ className: 'active' }} onClick={() => setMenu(false)}>Como funciona</Link><Link to="/duvidas" activeProps={{ className: 'active' }} onClick={() => setMenu(false)}>Dúvidas</Link></nav><div className="header-actions"><span className="header-tag"><span />Um novo ciclo começa aqui</span><Button className="announce-button" onClick={() => setAnnounce(true)}>Anunciar resíduo <ArrowUpRight size={16} /></Button><Button variant="ghost" size="icon" className="mobile-menu" aria-label={menu ? 'Fechar menu' : 'Abrir menu'} onClick={() => setMenu(!menu)}>{menu ? <X /> : <Menu />}</Button></div></div></header><ActionDialog open={announce} onOpenChange={setAnnounce} /></>
}

export function Footer() {
 return <footer className="site-footer"><div className="container footer-inner"><Link to="/" className="brand"><span className="brand-mark"><ArrowUpRight /><ArrowDownLeft /></span>circular<span className="brand-dot">.</span></Link><p>O que sobra para um, transforma o futuro de outro.</p><span>Feito para um Brasil mais circular <Leaf size={15} /></span></div><div className="container footer-bottom"><span>© 2026 Circular. Todos os direitos reservados.</span><span>Plataforma demonstrativa · Empresas, lotes e indicadores fictícios.</span></div></footer>
}

export function LotCard({ lot }: { lot: Lot }) {
 return <article className="lot-card"><Link to="/lotes/$id" params={{ id: lot.id }} className="lot-image-link" aria-label={`Ver ${lot.title}`}><img src={lot.image} alt={lot.title} width={500} height={500} loading="lazy" /><span className="material-badge">{lot.category}</span></Link><div className="lot-body"><div className="lot-location"><MapPin size={13} />{lot.city}, {lot.state}<span className="available-dot" title="Disponível" /></div><Link to="/lotes/$id" params={{ id: lot.id }} className="lot-title">{lot.title}</Link><div className="lot-meta"><span><Weight size={14} />{lot.weight}</span><span>{lot.recurring ? <Repeat2 size={14} /> : <Package size={14} />}{lot.recurring ? 'Recorrente' : 'Lote único'}</span></div><div className="lot-bottom"><div><strong>{formatPrice(lot.price)}</strong><span>{lot.unit || 'Negocie com o gerador'}</span></div><Button asChild variant="outline" size="icon" className="lot-arrow"><Link to="/lotes/$id" params={{ id: lot.id }} aria-label={`Detalhes de ${lot.title}`}><ArrowUpRight /></Link></Button></div></div></article>
}

export function SectionLink({ children }: { children: React.ReactNode }) { return <Button asChild variant="link" className="section-link"><Link to="/catalogo">{children}<ArrowRight size={17} /></Link></Button> }