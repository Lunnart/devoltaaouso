import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [
    { title: "Nova senha — Circular" },
    { name: "description", content: "Defina uma nova senha para sua conta Circular." },
    { property: "og:title", content: "Nova senha — Circular" },
    { property: "og:description", content: "Defina uma nova senha para sua conta Circular." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Reset,
});

function Reset() {
  const navigate = useNavigate();
  const [msg, setMsg] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const password = String(new FormData(e.currentTarget).get("password"));
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setMsg("Não foi possível trocar a senha. Abra novamente o link do e-mail.");
    else navigate({ to: "/conta" });
  }
  return <main className="container" style={{ padding: "64px 0", maxWidth: 420 }}>
    <h1 className="text-3xl font-bold">Criar nova senha</h1>
    <form onSubmit={submit} className="contact-form mt-6">
      <label>Nova senha<input name="password" type="password" required minLength={8} maxLength={72} /></label>
      {msg && <p role="alert" className="text-destructive text-sm">{msg}</p>}
      <Button type="submit" className="h-11 w-full">Salvar senha</Button>
    </form>
  </main>;
}
