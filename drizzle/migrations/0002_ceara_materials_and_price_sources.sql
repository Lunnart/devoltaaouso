ALTER TABLE public.material_prices
  ADD COLUMN IF NOT EXISTS currency char(3) NOT NULL DEFAULT 'BRL',
  ADD COLUMN IF NOT EXISTS city text NOT NULL DEFAULT 'Fortaleza',
  ADD COLUMN IF NOT EXISTS state char(2) NOT NULL DEFAULT 'CE',
  ADD COLUMN IF NOT EXISTS source_name text,
  ADD COLUMN IF NOT EXISTS source_url text,
  ADD COLUMN IF NOT EXISTS source_item text,
  ADD COLUMN IF NOT EXISTS consulted_at date,
  ADD COLUMN IF NOT EXISTS reference_date date,
  ADD COLUMN IF NOT EXISTS price_type text NOT NULL DEFAULT 'media_referencia',
  ADD COLUMN IF NOT EXISTS verification_status text NOT NULL DEFAULT 'nao_verificado',
  ADD COLUMN IF NOT EXISTS notes text;

ALTER TABLE public.material_prices
  ADD CONSTRAINT material_prices_state_ce CHECK (state = 'CE'),
  ADD CONSTRAINT material_prices_currency_brl CHECK (currency = 'BRL'),
  ADD CONSTRAINT material_prices_price_type_chk CHECK (price_type IN ('anunciado','media_referencia','cotacao_confirmada')),
  ADD CONSTRAINT material_prices_verification_chk CHECK (verification_status IN ('verificado','nao_verificado','expirado')),
  ADD CONSTRAINT material_prices_non_negative CHECK (buy_price_per_kg >= 0);

COMMENT ON COLUMN public.material_prices.price_type IS 'anunciado = valor publicado por comprador; media_referencia = média de mercado; cotacao_confirmada = confirmada com comprador';

-- Materiais não autorizados: desativados, nunca excluídos (preserva histórico)
UPDATE public.materials SET active = false WHERE code IN ('PEAD','MADEIRA','TEXTIL');

UPDATE public.materials SET name = 'Alumínio (sucata geral)', category = 'Alumínio' WHERE code = 'ALUMINIO';
UPDATE public.materials SET name = 'Aço', category = 'Ferro e Aço' WHERE code = 'ACO';
UPDATE public.materials SET name = 'Papelão', category = 'Papel e Papelão' WHERE code = 'PAPELAO';
UPDATE public.materials SET name = 'Plástico PET', category = 'Plástico PET' WHERE code = 'PET';
UPDATE public.materials SET name = 'Vidro (embalagens inteiras)', category = 'Vidro' WHERE code = 'VIDRO';
UPDATE public.materials SET name = 'Resíduos eletroeletrônicos', category = 'Eletroeletrônicos' WHERE code = 'ELETRONICO';

INSERT INTO public.materials (code, name, category, unit)
SELECT v.code, v.name, v.category, 'kg' FROM (VALUES
  ('ALUMINIO_LATA','Latinhas de alumínio','Alumínio'),
  ('FERRO','Ferro','Ferro e Aço'),
  ('BATERIA','Baterias e pilhas','Eletroeletrônicos')
) AS v(code, name, category)
WHERE NOT EXISTS (SELECT 1 FROM public.materials m WHERE m.code = v.code);

-- Preços com fonte verificável (SucataFinder Fortaleza, média dos últimos 30 dias, consultada em 10/11/2026)
INSERT INTO public.material_prices (material_id, hub_id, buy_price_per_kg, valid_from, source_name, source_url, source_item, consulted_at, reference_date, price_type, verification_status, notes)
SELECT m.id, h.id, v.price, '2026-11-10'::timestamptz, 'SucataFinder — Preço da sucata em Fortaleza', 'https://sucatafinder.com/cidade/preco-da-sucata-fortaleza/', v.item, '2026-11-10', '2026-11-10', 'media_referencia', 'verificado', v.notes
FROM (VALUES
  ('ALUMINIO_LATA', 10.70::numeric(12,2), 'Latinha de alumínio solta', 'Latas soltas, sem impurezas.'),
  ('ALUMINIO', 10.39, 'Perfil de alumínio Natural Limpo', 'Perfil limpo; panela, bloco e peças com impureza valem menos.'),
  ('FERRO', 0.50, 'Ferro miúdo', 'Ferro chaparia também R$ 0,50/kg; ferro fundido automotivo R$ 1,40/kg.'),
  ('ACO', 4.00, 'Inox não ferroso - 304', 'Refere-se a aço inox 304; inox 430/410/201 R$ 0,60/kg.'),
  ('PAPELAO', 0.60, 'Papelão solto', 'Papelão prensado em fardos: R$ 0,55/kg.'),
  ('PAPEL', 0.10, 'Arquivo branco', 'Papel branco de arquivo, seco e separado.'),
  ('ELETRONICO', 0.70, 'REEE - Linha Branca Montado', 'Placas eletrônicas têm preços próprios (R$ 3 a R$ 16/kg).'),
  ('BATERIA', 2.00, 'Bateria Notebook / Bateria Celular', 'Bateria de chumbo: R$ 3,50/kg. Pilhas comuns sem cotação na fonte.')
) AS v(code, price, item, notes)
JOIN public.materials m ON m.code = v.code
CROSS JOIN (SELECT id FROM public.hubs WHERE code = 'HUB-PILOTO') h;