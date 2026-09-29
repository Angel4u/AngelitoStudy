import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Lock } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Acceso admin — AngelitoStudy" },
      { name: "description", content: "Acceso privado al panel de edición de AngelitoStudy." },
      { property: "og:title", content: "Acceso admin — AngelitoStudy" },
      { property: "og:description", content: "Panel privado de edición." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

const inputCls =
  "w-full rounded-lg border border-line bg-ink px-3 py-2.5 font-mono text-sm text-foreground outline-none transition-colors focus:border-halo/60";

function AuthPage() {
  const navigate = useNavigate();
  const [hasAdmin, setHasAdmin] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/admin", replace: true });
    });
    supabase.rpc("admin_exists").then(({ data }) => setHasAdmin(Boolean(data)));
  }, [navigate]);

  const isSetup = hasAdmin === false;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    if (isSetup) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/admin` },
      });
      setBusy(false);
      if (error) return setMessage(error.message);
      if (data.session) return navigate({ to: "/admin" });
      setMessage("Listo. Revisa tu correo y confirma la cuenta para entrar.");
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return setMessage("Correo o clave incorrectos.");
    navigate({ to: "/admin" });
  }

  return (
    <main className="flex min-h-[70dvh] items-center justify-center px-4 py-16">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-2xl border border-line bg-panel p-6 shadow-panel"
      >
        <span className="label-mono inline-flex items-center gap-2 text-gold">
          <Lock className="size-3" aria-hidden /> zona privada
        </span>
        <h1 className="mt-2 font-mono text-xl font-semibold text-foreground">
          {isSetup ? "crear cuenta admin" : "entrar al panel"}
        </h1>
        {isSetup && (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Aún no hay administrador. La primera cuenta que se cree será la única
            con permiso para editar.
          </p>
        )}
        <label className="mt-5 block">
          <span className="label-mono text-muted-foreground">correo</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`mt-1 ${inputCls}`}
          />
        </label>
        <label className="mt-4 block">
          <span className="label-mono text-muted-foreground">clave</span>
          <input
            type="password"
            required
            minLength={8}
            autoComplete={isSetup ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`mt-1 ${inputCls}`}
          />
        </label>
        {message && <p className="mt-4 text-sm text-gold">{message}</p>}
        <button
          type="submit"
          disabled={busy || hasAdmin === null}
          className="mt-6 w-full rounded-lg border border-halo/40 bg-halo/10 px-4 py-2.5 font-mono text-sm text-halo transition-colors hover:bg-halo/20 disabled:opacity-50"
        >
          {busy ? "..." : isSetup ? "crear cuenta" : "entrar"}
        </button>
      </form>
    </main>
  );
}
