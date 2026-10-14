import plasticos from '@/assets/plasticos.jpg'
import papel from '@/assets/papel.jpg'
import metal from '@/assets/metal.jpg'
import madeira from '@/assets/madeira.jpg'
import eletronicos from '@/assets/eletronicos.jpg'
import textil from '@/assets/textil.jpg'

export const categories = ['Plásticos', 'Papel e Papelão', 'Sucata Metálica', 'Madeira e Paletes', 'Eletrônicos', 'Têxtil', 'Vidro'] as const
export const lots = [
  { id: 'pet-prensado', title: 'PET transparente prensado', category: 'Plásticos', image: plasticos, city: 'Campinas', state: 'SP', weight: '5 toneladas/mês', recurring: true, price: 2300, unit: '/ tonelada', company: 'Bebidas Vale Verde', description: 'Garrafas PET pós-consumo, transparentes e azul-claro, separadas e prensadas em fardos. Material seco, armazenado em galpão coberto. Disponibilidade recorrente e carregamento com empilhadeira.' },
  { id: 'papelao-ondulado', title: 'Papelão ondulado enfardado', category: 'Papel e Papelão', image: papel, city: 'Guarulhos', state: 'SP', weight: '8 toneladas/mês', recurring: true, price: 650, unit: '/ tonelada', company: 'Logística Horizonte', description: 'Papelão ondulado proveniente de centro de distribuição, livre de umidade e separado na origem. Fardos de aproximadamente 300 kg. Coleta a combinar em dias úteis.' },
  { id: 'aluminio-industrial', title: 'Sucata de alumínio industrial', category: 'Sucata Metálica', image: metal, city: 'Contagem', state: 'MG', weight: '2,5 toneladas', recurring: false, price: 6800, unit: '/ tonelada', company: 'Metalúrgica Novo Ciclo', description: 'Retalhos e aparas de alumínio provenientes de usinagem industrial. Material segregado, sem mistura com metais ferrosos. Disponível para retirada em lote único.' },
  { id: 'paletes-madeira', title: 'Paletes de madeira reutilizáveis', category: 'Madeira e Paletes', image: madeira, city: 'Curitiba', state: 'PR', weight: '120 unidades · 2,4 t', recurring: false, price: 25, unit: '/ unidade', company: 'Distribuidora Araucária', description: 'Paletes de pinus em bom estado para reutilização, com dimensões variadas e predominância do padrão PBR. Inspeção e retirada mediante agendamento. Peso total estimado.' },
  { id: 'placas-eletronicas', title: 'Placas e componentes eletrônicos', category: 'Eletrônicos', image: eletronicos, city: 'São Paulo', state: 'SP', weight: '600 kg', recurring: false, price: null, unit: '', company: 'Renova Tecnologia', description: 'Placas eletrônicas e componentes de equipamentos desativados, sem baterias. Destinação exclusiva a recicladores habilitados. Documentação ambiental solicitada na negociação.' },
  { id: 'retalhos-algodao', title: 'Retalhos de algodão separados', category: 'Têxtil', image: textil, city: 'Blumenau', state: 'SC', weight: '1,2 tonelada/mês', recurring: true, price: 900, unit: '/ tonelada', company: 'Confecções Trama', description: 'Retalhos de malha de algodão de corte industrial, separados por tonalidade e acondicionados em sacos. Material limpo e seco para desfibragem ou reaproveitamento criativo.' },
  { id: 'pead-pos-industrial', title: 'PEAD pós-industrial para moagem', category: 'Plásticos', image: plasticos, city: 'Caxias do Sul', state: 'RS', weight: '3 toneladas/mês', recurring: true, price: 1800, unit: '/ tonelada', company: 'Indústria Serra Circular', description: 'Sobras de produção de embalagens em PEAD, segregadas na origem. Volume mensal estimado. Condições e frequência de coleta negociadas diretamente com o gerador.' },
]
export type Lot = typeof lots[number]
export function filterLots(search: string, category: string, state: string) {
  const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  const term = normalize(search.trim())
  return lots.filter(lot => (!term || normalize(`${lot.title} ${lot.category} ${lot.city} ${lot.company}`).includes(term)) && (!category || lot.category === category) && (!state || lot.state === state))
}
export const formatPrice = (price: number | null) => price === null ? 'A combinar' : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(price)