import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Search, SlidersHorizontal, X, MapPin, PackageSearch } from 'lucide-react'
import { categories, filterLots } from '@/lib/marketplace'
import { LotCard } from '@/components/marketplace'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/catalogo')({
  validateSearch: (search: Record<string, unknown>): { categoria?: string } => ({ categoria: typeof search['categoria'] === 'string' ? search['categoria'] : '' }),
  head: () => ({ meta: [{ title: 'Explorar resíduos | Circular' }, { name: 'description', content: 'Encontre lotes de materiais recicláveis no Brasil. Filtre por categoria e estado e descubra novas oportunidades circulares.' }, { property: 'og:title', content: 'Catálogo de resíduos | Circular' }, { property: 'og:description', content: 'Materiais com potencial para um novo ciclo. Explore oportunidades de reciclagem no Brasil.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  component: Catalog,
})
function Catalog() {
 const { categoria } = Route.useSearch()
 const [category, setCategory] = useState(categoria ?? '')
 const [state, setState] = useState('')
 const [search, setSearch] = useState('')
 const [sort, setSort] = useState('recent')
 const filtered = filterLots(search, category, state)
 const results = sort === 'price' ? [...filtered].sort((a,b) => (a.price ?? Infinity) - (b.price ?? Infinity)) : filtered
 function clear() { setCategory(''); setState(''); setSearch('') }
 return <main><section className="page-heading"><div className="container"><div className="eyebrow"><span />OPORTUNIDADES CIRCULARES</div><h1>O próximo ciclo começa aqui.</h1><p>Encontre o material certo. Conecte-se a quem gera. Transforme possibilidades.</p></div></section><section className="container catalog-section"><div className="catalog-filters"><div className="search-field"><Search size={20} /><input aria-label="Buscar resíduos" placeholder="Qual resíduo você procura?" value={search} onChange={e => setSearch(e.target.value)} /></div><label className="select-field"><SlidersHorizontal size={17} /><select aria-label="Categoria" value={category} onChange={e => setCategory(e.target.value)}><option value="">Todas as categorias</option>{categories.map(c => <option key={c}>{c}</option>)}</select></label><label className="select-field"><MapPin size={17} /><select aria-label="Estado" value={state} onChange={e => setState(e.target.value)}><option value="">Todos os estados</option>{['SP','MG','PR','SC','RS','RJ','ES','BA','PE','CE','GO','DF','MT','MS','PA','AM','AC','AL','AP','MA','PB','PI','RN','RO','RR','SE','TO'].sort().map(s => <option key={s}>{s}</option>)}</select></label></div><div className="results-toolbar"><p><strong>{results.length} lotes</strong> disponíveis <span className="demo-label">Demonstração</span></p><label>Ordenar por <select aria-label="Ordenar lotes" value={sort} onChange={e => setSort(e.target.value)}><option value="recent">Mais recentes</option><option value="price">Menor preço</option></select></label></div>{(category || state || search) && <div className="active-filters"><Button variant="ghost" size="sm" onClick={clear}><X size={14} />Limpar filtros</Button></div>}{results.length ? <div className="lots-grid catalog-grid">{results.map(lot => <LotCard key={lot.id} lot={lot} />)}</div> : <div className="empty-state"><PackageSearch size={42} /><h2>Ainda não encontramos esse material.</h2><p>Tente outra busca, categoria ou localização.</p><Button variant="outline" onClick={clear}>Limpar filtros</Button></div>}<p className="catalog-disclaimer">Lotes e valores ilustrativos. A disponibilidade, o frete e as condições são negociados entre as partes.</p></section></main>
}