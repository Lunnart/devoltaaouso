import { describe, it, expect } from 'vitest'
import { categories, filterLots } from '@/lib/marketplace'

describe('Marketplace catalog filters', () => {
  it('offers all seven requested material categories', () => {
    expect(categories).toEqual(['Plásticos', 'Papel e Papelão', 'Sucata Metálica', 'Madeira e Paletes', 'Eletrônicos', 'Têxtil', 'Vidro'])
  })
  it('filters plastic materials independently of other categories', () => {
    expect(filterLots('', 'Plásticos', '').map(lot => lot.id)).toEqual(['pet-prensado', 'pead-pos-industrial'])
  })
  it('combines category and Brazilian state filters', () => {
    expect(filterLots('', 'Plásticos', 'SP').map(lot => lot.id)).toEqual(['pet-prensado'])
  })
  it('finds cardboard without requiring Portuguese accents', () => {
    expect(filterLots('papelao', '', '').map(lot => lot.id)).toEqual(['papelao-ondulado'])
  })
  it('does not return unrelated lots for a missing search', () => {
    expect(filterLots('material inexistente', '', '')).toEqual([])
  })
})