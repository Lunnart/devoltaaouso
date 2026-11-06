import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const ROLE_LABEL: Record<string, string> = { admin: "Administradora(or)", gestor_hub: "Gestor de hub", operador: "Operador", participante: "Participante", empresa: "Empresa" };

export const Route = createFileRoute("/_authenticated/conta")({
  head: () => ({ meta: [
    { title: "Minha conta — Circular" },
    { name: "description", content: "Seus dados e perfil de acesso na Circular." },
    { property: "og:title", content: "Minha conta — Circular" },
    { property: "og:description", content: "Seus dados e perfil de acesso na Circular." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Conta,
});

function Conta() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const roles = useQuery({ queryKey: ["roles", user.id], queryFn: async () => {
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
    return (data ?? []).map(r => r.role);
  } });
  async function sair() {
    await qc.cancelQueries(); qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }
  return <main className="container" style={{ padding: "64px 0", maxWidth: 560 }}>
    <h1 className="text-3xl font-bold">Minha conta</h1>
    <p className="mt-2 text-muted-foreground">{user.email}</p>
    <div className="mt-6 rounded-lg border p-5">
      <p className="text-sm font-semibold">Perfil de acesso</p>
      <p className="mt-1">{roles.isLoading ? "Carregando…" : (roles.data ?? []).map(r => ROLE_LABEL[r] ?? r).join(", ") || "—"}</p>
    </div>
    <Button variant="outline" className="mt-6" onClick={sair}>Sair</Button>
  </main>;
}
