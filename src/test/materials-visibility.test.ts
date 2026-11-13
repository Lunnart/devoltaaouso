import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

// Live checks against the backend's access rules for materials.
const URL = process.env.VITE_SUPABASE_URL
const KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY
const SESSION = join(homedir(), '.cache/lovable-auth/session.json')
const RETIRED = ['PEAD', 'MADEIRA', 'TEXTIL']

async function listMaterials(token?: string) {
  const res = await fetch(`${URL}/rest/v1/materials?select=code,active`, {
    headers: { apikey: KEY!, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  })
  expect(res.ok).toBe(true)
  return (await res.json()) as { code: string; active: boolean }[]
}

describe.skipIf(!URL || !KEY)('materials visibility', () => {
  it('visitors see only active materials', async () => {
    const rows = await listMaterials()
    expect(rows.length).toBeGreaterThan(0)
    expect(rows.every(r => r.active)).toBe(true)
    for (const code of RETIRED) expect(rows.map(r => r.code)).not.toContain(code)
  })

  it.skipIf(!existsSync(SESSION))('administrators also see retired materials', async () => {
    const token = JSON.parse(readFileSync(SESSION, 'utf8')).session.access_token
    const rows = await listMaterials(token)
    for (const code of RETIRED) expect(rows.find(r => r.code === code)?.active).toBe(false)
    expect(rows.some(r => r.active)).toBe(true)
  })
})
