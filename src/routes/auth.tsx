import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [
    { title: "Entrar ou criar conta — Circular" },
    { name: "description", content: "Acesse a Circular com e-mail, Google ou Lovable." },
    { property: "og:title", content: "Entrar ou criar conta — Circular" },
    { property: "og:description", content: "Acesse a Circular com e-mail, Google ou Lovable." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: AuthPage,
});

type Mode = "entrar" | "cadastrar" | "esqueci";

const GoogleLogo = () => <svg aria-hidden="true" width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>;

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("entrar");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { if (data.user) navigate({ to: "/conta", replace: true }); });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) navigate({ to: "/conta", replace: true });
    });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email")).trim();
    const password = String(f.get("password") ?? "");
    setBusy(true); setMsg("");
    try {
      if (mode === "entrar") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setMsg("E-mail ou senha incorretos, ou e-mail ainda não confirmado.");
      } else if (mode === "cadastrar") {
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin, data: { full_name: String(f.get("name")).trim() } } });
        setMsg(error ? "Não foi possível criar a conta. Confira os dados." : "Conta criada! Abra o link que enviamos para seu e-mail para confirmar.");
      } else {
        await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
        setMsg("Se o e-mail estiver cadastrado, você receberá um link para criar nova senha.");
      }
    } finally { setBusy(false); }
  }

  async function social(provider: "google" | "lovable") {
    setMsg("");
    const r = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin });
    if (r.error) { setMsg("Não foi possível entrar agora. Tente novamente."); return; }
    if (r.redirected) return;
    navigate({ to: "/conta", replace: true });
  }

  return <main className="container" style={{ padding: "64px 0", maxWidth: 420 }}>
    <h1 className="text-3xl font-bold">{mode === "cadastrar" ? "Criar conta" : mode === "esqueci" ? "Recuperar senha" : "Entrar"}</h1>
    <p className="mt-2 text-muted-foreground">Acesse a Circular para acompanhar seus lotes e propostas.</p>
    {mode !== "esqueci" && <div className="mt-6 grid gap-3">
      <button type="button" onClick={() => social("google")} className="inline-flex h-11 w-full items-center justify-center gap-[10px] rounded-md border px-3 text-sm font-medium" style={{ background: "#FFFFFF", borderColor: "#747775", color: "#1F1F1F" }}><GoogleLogo />Continuar com Google</button>
      <Button type="button" variant="outline" className="h-11 w-full" onClick={() => social("lovable")}>Continuar com Lovable</Button>
      <p className="text-center text-xs text-muted-foreground">ou com e-mail</p>
    </div>}
    <form onSubmit={submit} className="contact-form mt-3">
      {mode === "cadastrar" && <label>Nome<input name="name" required minLength={2} maxLength={100} /></label>}
      <label>E-mail<input name="email" type="email" required maxLength={254} /></label>
      {mode !== "esqueci" && <label>Senha<input name="password" type="password" required minLength={8} maxLength={72} /></label>}
      {msg && <p role="status" className="text-sm">{msg}</p>}
      <Button type="submit" disabled={busy} className="h-11 w-full">{busy ? "Aguarde…" : mode === "cadastrar" ? "Criar conta" : mode === "esqueci" ? "Enviar link" : "Entrar"}</Button>
    </form>
    <div className="mt-4 flex flex-wrap justify-between gap-2 text-sm">
      {mode !== "entrar" && <button className="underline" onClick={() => { setMode("entrar"); setMsg(""); }}>Já tenho conta</button>}
      {mode !== "cadastrar" && <button className="underline" onClick={() => { setMode("cadastrar"); setMsg(""); }}>Criar conta</button>}
      {mode === "entrar" && <button className="underline" onClick={() => { setMode("esqueci"); setMsg(""); }}>Esqueci a senha</button>}
    </div>
  </main>;
}
