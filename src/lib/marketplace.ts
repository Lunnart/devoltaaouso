import plasticos from '@/assets/plasticos.jpg'
import papel from '@/assets/papel.jpg'
import metal from '@/assets/metal.jpg'
import eletronicos from '@/assets/eletronicos.jpg'
import vidro from '@/assets/vidro.jpg'
import baterias from '@/assets/baterias.jpg'
import latinhas from '@/assets/latinhas.jpg'

export const categories = ['Alumínio', 'Ferro e Aço', 'Papel e Papelão', 'Plástico PET', 'Vidro', 'Eletroeletrônicos'] as const
export const cities = ['Fortaleza', 'Caucaia', 'Maracanaú'] as const
export const lots = [
  { id: 'pet-prensado', title: 'Garrafas PET prensadas', category: 'Plástico PET', image: plasticos, city: 'Fortaleza', state: 'CE', weight: '5 toneladas/mês', recurring: true, price: null as number | null, unit: '', company: 'Gerador demonstrativo A', description: 'Garrafas PET pós-consumo, transparentes e azul-claro, separadas e prensadas em fardos. Material seco, armazenado em galpão coberto.' },
  { id: 'papelao-ondulado', title: 'Papelão ondulado enfardado', category: 'Papel e Papelão', image: papel, city: 'Maracanaú', state: 'CE', weight: '8 toneladas/mês', recurring: true, price: null as number | null, unit: '', company: 'Gerador demonstrativo B', description: 'Papelão ondulado de centro de distribuição, sem umidade e separado na origem. Fardos de aproximadamente 300 kg.' },
  { id: 'aluminio-industrial', title: 'Sucata de alumínio industrial', category: 'Alumínio', image: metal, city: 'Fortaleza', state: 'CE', weight: '2,5 toneladas', recurring: false, price: null as number | null, unit: '', company: 'Gerador demonstrativo C', description: 'Retalhos e perfis de alumínio de usinagem, segregados e sem mistura com metais ferrosos. Lote único.' },
  { id: 'latinhas-aluminio', title: 'Latinhas de alumínio', category: 'Alumínio', image: latinhas, city: 'Caucaia', state: 'CE', weight: '800 kg/mês', recurring: true, price: null as number | null, unit: '', company: 'Gerador demonstrativo D', description: 'Latas de bebida pós-consumo, separadas e sem outros resíduos. Coleta mensal a combinar.' },
  { id: 'ferro-chaparia', title: 'Ferro e chaparia de manutenção', category: 'Ferro e Aço', image: metal, city: 'Maracanaú', state: 'CE', weight: '4 toneladas', recurring: false, price: null as number | null, unit: '', company: 'Gerador demonstrativo E', description: 'Chapas, perfis e peças de ferro de manutenção industrial. Lote único, retirada com caminhão.' },
  { id: 'placas-eletronicas', title: 'Placas e componentes eletrônicos', category: 'Eletroeletrônicos', image: eletronicos, city: 'Fortaleza', state: 'CE', weight: '600 kg', recurring: false, price: null as number | null, unit: '', company: 'Gerador demonstrativo F', description: 'Placas e componentes de equipamentos desativados. Destinação somente a recicladores habilitados.' },
  { id: 'baterias-pilhas', title: 'Baterias e pilhas usadas', category: 'Eletroeletrônicos', image: baterias, city: 'Fortaleza', state: 'CE', weight: '150 kg', recurring: false, price: null as number | null, unit: '', company: 'Gerador demonstrativo G', description: 'Baterias de celular e notebook e pilhas comuns, acondicionadas em recipiente fechado. Destinação a recicladores habilitados.' },
  { id: 'garrafas-vidro', title: 'Garrafas de vidro inteiras', category: 'Vidro', image: vidro, city: 'Fortaleza', state: 'CE', weight: '2 toneladas/mês', recurring: true, price: null as number | null, unit: '', company: 'Gerador demonstrativo H', description: 'Garrafas de vidro inteiras de bares e restaurantes, separadas por cor. Não inclui cacos.' },
]
export type Lot = typeof lots[number]
export function filterLots(search: string, category: string, city: string) {
  const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  const term = normalize(search.trim())
  return lots.filter(lot => (!term || normalize(`${lot.title} ${lot.category} ${lot.city} ${lot.company}`).includes(term)) && (!category || lot.category === category) && (!city || lot.city === city))
}
export const formatPrice = (price: number | null) => price === null ? 'A combinar' : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(price)
