CREATE TYPE public.app_role AS ENUM ('admin','gestor_hub','operador','participante','empresa');

CREATE TABLE public.hubs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  city text NOT NULL,
  state char(2) NOT NULL,
  address text,
  status text NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo','inativo')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  document text,
  hub_id uuid REFERENCES public.hubs(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  hub_id uuid REFERENCES public.hubs(id) ON DELETE CASCADE,
  UNIQUE (user_id, role)
);

CREATE TABLE public.materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  category text NOT NULL,
  unit text NOT NULL DEFAULT 'kg',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.material_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id uuid NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  hub_id uuid NOT NULL REFERENCES public.hubs(id) ON DELETE CASCADE,
  buy_price_per_kg numeric(12,2) NOT NULL CHECK (buy_price_per_kg >= 0),
  valid_from timestamptz NOT NULL DEFAULT now(),
  valid_to timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.material_prices (hub_id, material_id, valid_from DESC);
CREATE INDEX ON public.profiles (hub_id);
CREATE INDEX ON public.user_roles (user_id);

GRANT SELECT ON public.hubs, public.materials, public.material_prices TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hubs, public.materials, public.material_prices, public.profiles TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.hubs, public.materials, public.material_prices, public.profiles, public.user_roles TO service_role;

ALTER TABLE public.hubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_prices ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.manages_hub(_user_id uuid, _hub_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'gestor_hub' AND hub_id = _hub_id)
$$;

-- hubs
CREATE POLICY "Hubs ativos são públicos" ON public.hubs FOR SELECT TO anon, authenticated USING (status = 'ativo' OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admin gerencia hubs" ON public.hubs FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Gestor edita seu hub" ON public.hubs FOR UPDATE TO authenticated USING (public.manages_hub(auth.uid(), id)) WITH CHECK (public.manages_hub(auth.uid(), id));

-- materials
CREATE POLICY "Materiais são públicos" ON public.materials FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin gerencia materiais" ON public.materials FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- prices
CREATE POLICY "Preços são públicos" ON public.material_prices FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin gerencia preços" ON public.material_prices FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Gestor define preços do hub" ON public.material_prices FOR INSERT TO authenticated WITH CHECK (public.manages_hub(auth.uid(), hub_id));
CREATE POLICY "Gestor atualiza preços do hub" ON public.material_prices FOR UPDATE TO authenticated USING (public.manages_hub(auth.uid(), hub_id)) WITH CHECK (public.manages_hub(auth.uid(), hub_id));

-- profiles
CREATE POLICY "Ver o próprio perfil" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id OR public.has_role(auth.uid(),'admin') OR (hub_id IS NOT NULL AND public.manages_hub(auth.uid(), hub_id)));
CREATE POLICY "Editar o próprio perfil" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Admin gerencia perfis" ON public.profiles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- user_roles (only admin writes, via service role or admin)
CREATE POLICY "Ver os próprios papéis" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

-- prevent users from moving themselves to another hub
CREATE OR REPLACE FUNCTION public.protect_profile_hub()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.hub_id IS DISTINCT FROM OLD.hub_id AND NOT public.has_role(auth.uid(),'admin') THEN
    NEW.hub_id := OLD.hub_id;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $$;
CREATE TRIGGER profiles_protect BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.protect_profile_hub();

-- new user: profile + participant role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name) VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'participante');
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- seed
INSERT INTO public.materials (code, name, category) VALUES
 ('PET','PET (garrafas)','Plásticos'),
 ('PEAD','PEAD (embalagens rígidas)','Plásticos'),
 ('PAPELAO','Papelão ondulado','Papel e Papelão'),
 ('PAPEL','Papel branco','Papel e Papelão'),
 ('ALUMINIO','Alumínio (latas)','Sucata Metálica'),
 ('ACO','Sucata de aço','Sucata Metálica'),
 ('MADEIRA','Madeira e paletes','Madeira e Paletes'),
 ('ELETRONICO','Eletrônicos','Eletrônicos'),
 ('TEXTIL','Têxtil','Têxtil'),
 ('VIDRO','Vidro','Vidro');

INSERT INTO public.hubs (code, name, city, state, address) VALUES
 ('HUB-PILOTO','Hub Piloto (demonstração)','Fortaleza','CE','Endereço a definir');