import { describe, it, expect } from 'vitest'
import { categories, filterLots, lots } from '@/lib/marketplace'

describe('Marketplace catalog filters', () => {
  it('offers only the authorized material categories', () => {
    expect(categories).toEqual(['Alumínio', 'Ferro e Aço', 'Papel e Papelão', 'Plástico PET', 'Vidro', 'Eletroeletrônicos'])
  })
  it('never lists forbidden materials or glass shards', () => {
    const text = lots.map(l => `${l.title} ${l.description}`.toLowerCase()).join(' ')
    for (const banned of ['cobre', 'pead', 'papel misto', 'madeira', 'têxtil', 'cacos de vidro']) expect(text).not.toContain(banned)
  })
  it('keeps every lot in Ceará', () => {
    expect(lots.every(l => l.state === 'CE')).toBe(true)
  })
  it('does not show invented lot prices', () => {
    expect(lots.every(l => l.price === null)).toBe(true)
  })
  it('combines category and city filters', () => {
    expect(filterLots('', 'Alumínio', 'Caucaia').map(l => l.id)).toEqual(['latinhas-aluminio'])
  })
  it('finds cardboard without requiring accents', () => {
    expect(filterLots('papelao', '', '').map(l => l.id)).toEqual(['papelao-ondulado'])
  })
  it('finds batteries under electronics', () => {
    expect(filterLots('pilhas', 'Eletroeletrônicos', '').map(l => l.id)).toEqual(['baterias-pilhas'])
  })
})
