// Grava linhas na planilha da equipe via Lovable connector gateway (somente servidor).
const GATEWAY_URL = 'https://connector-gateway.lovable.dev/google_sheets/v4'
export const SPREADSHEET_ID = '12HfyTSelJ_Pumnj8sh4iwaJOmN_jzJWTQyMrIMixoDI'

export type SheetTab = 'Propostas' | 'Anúncios' | 'Dúvidas'

export function nowInSaoPaulo() {
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' }).format(new Date())
}

export async function appendRow(tab: SheetTab, row: string[]) {
  const lovableKey = process.env['LOVABLE_API_KEY']
  const sheetsKey = process.env['GOOGLE_SHEETS_API_KEY']
  if (!lovableKey || !sheetsKey) throw new Error('Google Sheets não está configurado.')
  // RAW impede que o texto do visitante seja interpretado como fórmula.
  const url = `${GATEWAY_URL}/spreadsheets/${SPREADSHEET_ID}/values/'${tab}'!A1:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${lovableKey}`, 'X-Connection-Api-Key': sheetsKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ values: [row] }),
  })
  if (!res.ok) {
    const body = await res.text()
    console.error(`Sheets append failed [${res.status}]: ${body}`)
    throw new Error(`Sheets append failed [${res.status}]`)
  }
}
