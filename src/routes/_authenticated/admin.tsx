import { useEffect, useState, type ReactNode } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, LogOut, PlayCircle, Plus, Save, Trash2 } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import type { ResourceRow, SocialRow, SubjectRow, UnitRow } from "@/data/catalog";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Panel admin — AngelitoStudy" },
      { name: "description", content: "Edita la malla, unidades, videos, apuntes y redes de AngelitoStudy." },
      { property: "og:title", content: "Panel admin — AngelitoStudy" },
      { property: "og:description", content: "Panel privado de edición." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const input =
  "w-full min-w-0 rounded-lg border border-line bg-ink px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-halo/60";
const btn =
  "inline-flex items-center gap-2 rounded-lg border px-3 py-2 font-mono text-xs transition-colors disabled:opacity-50";
const btnHalo = `${btn} border-halo/40 bg-halo/10 text-halo hover:bg-halo/20`;
const btnDanger = `${btn} border-destructive/40 text-destructive hover:bg-destructive/10`;

function Field({ label, children, wide }: { label: string; children: ReactNode; wide?: boolean | undefined }) {
  return (
    <label className={`block min-w-0 ${wide ? "sm:col-span-2" : ""}`}>
      <span className="label-mono text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-panel p-5 shadow-panel">
      <h2 className="font-mono text-base font-semibold text-foreground">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

type Done = (error: { message: string } | null, ok: string) => Promise<void>;

function AdminPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"unidades" | "ramos" | "redes">("unidades");
  const [flash, setFlash] = useState<string | null>(null);

  const role = useQuery({
    queryKey: ["is-admin"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return false;
      const { data } = await supabase.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
      return Boolean(data);
    },
  });

  const admin = useQuery({
    queryKey: ["admin-data"],
    enabled: role.data === true,
    queryFn: async () => {
      const [s, st, so] = await Promise.all([
        supabase.from("subjects").select("*").order("level").order("sort_order"),
        supabase.from("site_settings").select("schedule_label").eq("id", 1).single(),
        supabase.from("social_links").select("*").order("sort_order"),
      ]);
      const err = s.error || st.error || so.error;
      if (err) throw err;
      return { subjects: s.data, schedule: st.data.schedule_label, socials: so.data };
    },
  });

  const done: Done = async (error, ok) => {
    if (error) {
      setFlash(`Error: ${error.message}`);
      return;
    }
    setFlash(ok);
    await Promise.all([
      qc.invalidateQueries({ queryKey: ["admin-data"] }),
      qc.invalidateQueries({ queryKey: ["admin-units"] }),
      qc.invalidateQueries({ queryKey: ["catalog"] }),
      qc.invalidateQueries({ queryKey: ["subject"] }),
    ]);
  };

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(null), 3000);
    return () => clearTimeout(t);
  }, [flash]);

  if (role.isLoading) return <main className="p-10 text-center font-mono text-sm text-muted-foreground">cargando...</main>;
  if (!role.data)
    return (
      <main className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="font-mono text-foreground">Esta cuenta no tiene permiso de edición.</p>
        <button onClick={signOut} className={`${btnHalo} mt-6`}>cerrar sesión</button>
      </main>
    );

  const d = admin.data;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="label-mono text-gold">// panel admin</span>
          <h1 className="font-mono text-2xl font-semibold text-foreground">editar contenido</h1>
        </div>
        <button onClick={signOut} className={btnHalo}>
          <LogOut className="size-3.5" /> salir
        </button>
      </div>

      <nav className="mt-6 flex flex-wrap gap-2">
        {(["unidades", "ramos", "redes"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`${btn} ${tab === t ? "border-halo/50 bg-halo/15 text-halo" : "border-line text-muted-foreground hover:text-foreground"}`}
          >
            ./{t}
          </button>
        ))}
      </nav>

      {flash && (
        <p role="status" className="mt-4 rounded-lg border border-line bg-panel px-3 py-2 font-mono text-xs text-gold">
          {flash}
        </p>
      )}

      <div className="mt-6 space-y-4">
        {!d ? (
          <p className="font-mono text-sm text-muted-foreground">cargando datos...</p>
        ) : tab === "unidades" ? (
          <UnitsEditor subjects={d.subjects} done={done} />
        ) : tab === "ramos" ? (
          <SubjectsEditor rows={d.subjects} done={done} />
        ) : (
          <>
            <ScheduleForm value={d.schedule} done={done} />
            {d.socials.map((r) => <SocialForm key={r.id} row={r} done={done} />)}
          </>
        )}
      </div>
    </main>
  );
}

/* ---------------- Unidades + recursos ---------------- */

type UnitWithRes = UnitRow & { unit_resources: ResourceRow[] };

function UnitsEditor({ subjects, done }: { subjects: SubjectRow[]; done: Done }) {
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? "");
  const [newTitle, setNewTitle] = useState("");

  const units = useQuery({
    queryKey: ["admin-units", subjectId],
    enabled: Boolean(subjectId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("units")
        .select("*, unit_resources(*)")
        .eq("subject_id", subjectId)
        .order("sort_order");
      if (error) throw error;
      return (data as UnitWithRes[]).map((u) => ({
        ...u,
        unit_resources: [...u.unit_resources].sort((a, b) => a.sort_order - b.sort_order),
      }));
    },
  });

  async function addUnit() {
    if (!newTitle.trim()) return;
    const { error } = await supabase
      .from("units")
      .insert({ subject_id: subjectId, title: newTitle.trim(), sort_order: (units.data?.length ?? 0) + 1 });
    if (!error) setNewTitle("");
    await done(error, "Unidad agregada");
  }

  return (
    <>
      <Card title="ramo">
        <select className={input} value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              Nivel {s.level} · {s.code} · {s.title}
            </option>
          ))}
        </select>
        <div className="mt-3 flex gap-2">
          <input
            className={input}
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Nombre de la nueva unidad (ej. Unidad 1: Recursividad)"
          />
          <button className={btnHalo} onClick={addUnit}><Plus className="size-3.5" /> unidad</button>
        </div>
      </Card>

      {units.isLoading && <p className="font-mono text-sm text-muted-foreground">cargando unidades...</p>}
      {units.data?.length === 0 && <p className="font-mono text-sm text-muted-foreground">Este ramo aún no tiene unidades.</p>}
      {units.data?.map((u) => <UnitCard key={u.id} unit={u} done={done} />)}
    </>
  );
}

function UnitCard({ unit, done }: { unit: UnitWithRes; done: Done }) {
  const [title, setTitle] = useState(unit.title);
  const [order, setOrder] = useState(unit.sort_order);
  const [kind, setKind] = useState<"video" | "pdf">("video");
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");

  async function saveUnit() {
    const { error } = await supabase.from("units").update({ title: title.trim(), sort_order: order }).eq("id", unit.id);
    await done(error, "Unidad guardada");
  }
  async function removeUnit() {
    if (!confirm(`¿Borrar "${unit.title}" con todos sus videos y PDFs?`)) return;
    const { error } = await supabase.from("units").delete().eq("id", unit.id);
    await done(error, "Unidad borrada");
  }
  async function addRes() {
    if (!label.trim() || !/^https?:\/\//.test(url.trim()))
      return done({ message: "Pon un nombre y un link que empiece con https://" }, "");
    const { error } = await supabase.from("unit_resources").insert({
      unit_id: unit.id,
      kind,
      label: label.trim(),
      url: url.trim(),
      sort_order: unit.unit_resources.length + 1,
    });
    if (!error) { setLabel(""); setUrl(""); }
    await done(error, kind === "pdf" ? "PDF agregado" : "Video agregado");
  }

  return (
    <Card title={unit.title}>
      <div className="grid gap-3 sm:grid-cols-[1fr_6rem]">
        <Field label="nombre de la unidad"><input className={input} value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
        <Field label="orden"><input type="number" className={input} value={order} onChange={(e) => setOrder(Number(e.target.value))} /></Field>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button className={btnHalo} onClick={saveUnit}><Save className="size-3.5" /> guardar unidad</button>
        <button className={btnDanger} onClick={removeUnit}><Trash2 className="size-3.5" /> borrar unidad</button>
      </div>

      <div className="mt-5 space-y-2 border-t border-line pt-4">
        <span className="label-mono text-muted-foreground">videos y pdfs</span>
        {unit.unit_resources.map((r) => <ResourceRowForm key={r.id} row={r} done={done} />)}
        <div className="grid gap-2 rounded-lg border border-dashed border-line p-3 sm:grid-cols-[7rem_1fr_1fr_auto]">
          <select className={input} value={kind} onChange={(e) => setKind(e.target.value as "video" | "pdf")}>
            <option value="video">video</option>
            <option value="pdf">pdf</option>
          </select>
          <input className={input} value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Nombre que se verá" />
          <input className={input} value={url} onChange={(e) => setUrl(e.target.value)} placeholder={kind === "pdf" ? "https://drive.google.com/..." : "https://youtube.com/..."} />
          <button className={btnHalo} onClick={addRes}><Plus className="size-3.5" /> agregar</button>
        </div>
      </div>
    </Card>
  );
}

function ResourceRowForm({ row, done }: { row: ResourceRow; done: Done }) {
  const [label, setLabel] = useState(row.label);
  const [url, setUrl] = useState(row.url);
  async function save() {
    const { error } = await supabase.from("unit_resources").update({ label: label.trim(), url: url.trim() }).eq("id", row.id);
    await done(error, "Guardado");
  }
  async function remove() {
    if (!confirm(`¿Borrar "${row.label}"?`)) return;
    const { error } = await supabase.from("unit_resources").delete().eq("id", row.id);
    await done(error, "Borrado");
  }
  return (
    <div className="grid items-center gap-2 sm:grid-cols-[1.5rem_1fr_1fr_auto_auto]">
      {row.kind === "pdf" ? <FileText className="size-4 text-gold" /> : <PlayCircle className="size-4 text-halo" />}
      <input className={input} value={label} onChange={(e) => setLabel(e.target.value)} />
      <input className={input} value={url} onChange={(e) => setUrl(e.target.value)} />
      <button className={btnHalo} onClick={save} aria-label="guardar"><Save className="size-3.5" /></button>
      <button className={btnDanger} onClick={remove} aria-label="borrar"><Trash2 className="size-3.5" /></button>
    </div>
  );
}

/* ---------------- Ramos (malla) ---------------- */

function SubjectsEditor({ rows, done }: { rows: SubjectRow[]; done: Done }) {
  const [adding, setAdding] = useState(false);
  const blank = { id: "", code: "", title: "", level: 1, accent: "none", sort_order: rows.length + 1 } as SubjectRow;
  return (
    <>
      <button className={btnHalo} onClick={() => setAdding((v) => !v)}>
        <Plus className="size-3.5" /> {adding ? "cancelar" : "agregar ramo"}
      </button>
      {adding && (
        <SubjectForm row={blank} isNew done={async (e, m) => { await done(e, m); if (!e) setAdding(false); }} />
      )}
      {rows.map((r) => <SubjectForm key={r.id} row={r} done={done} />)}
    </>
  );
}

function SubjectForm({ row, isNew, done }: { row: SubjectRow; isNew?: boolean; done: Done }) {
  const [f, setF] = useState(row);
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof SubjectRow>(k: K, v: SubjectRow[K]) => setF((p) => ({ ...p, [k]: v }));

  async function save() {
    if (!f.title.trim() || !f.code.trim()) return done({ message: "Nombre y código son obligatorios" }, "");
    setBusy(true);
    const payload = {
      code: f.code.trim(),
      title: f.title.trim(),
      level: Number(f.level) || 1,
      accent: f.accent,
      sort_order: Number(f.sort_order) || 0,
    };
    const { error } = isNew
      ? await supabase.from("subjects").insert({ ...payload, id: f.code.trim() })
      : await supabase.from("subjects").update(payload).eq("id", row.id);
    setBusy(false);
    await done(error, isNew ? "Ramo agregado" : "Ramo guardado");
  }

  async function remove() {
    if (!confirm(`¿Borrar "${row.title}" con todas sus unidades?`)) return;
    const { error } = await supabase.from("subjects").delete().eq("id", row.id);
    await done(error, "Ramo borrado");
  }

  return (
    <Card title={isNew ? "nuevo ramo" : `${row.code} · ${row.title}`}>
      <div className="grid gap-3 sm:grid-cols-5">
        <Field label="nombre" wide><input className={input} value={f.title} onChange={(e) => set("title", e.target.value)} /></Field>
        <Field label="código"><input className={input} value={f.code} onChange={(e) => set("code", e.target.value)} /></Field>
        <Field label="nivel"><input type="number" min={1} className={input} value={f.level} onChange={(e) => set("level", Number(e.target.value))} /></Field>
        <Field label="posición"><input type="number" className={input} value={f.sort_order} onChange={(e) => set("sort_order", Number(e.target.value))} /></Field>
        <Field label="color">
          <select className={input} value={f.accent} onChange={(e) => set("accent", e.target.value)}>
            <option value="halo">celeste</option>
            <option value="gold">dorado</option>
            <option value="none">neutro</option>
          </select>
        </Field>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button className={btnHalo} disabled={busy} onClick={save}><Save className="size-3.5" /> guardar</button>
        {!isNew && <button className={btnDanger} onClick={remove}><Trash2 className="size-3.5" /> borrar</button>}
      </div>
    </Card>
  );
}

/* ---------------- Horario + redes ---------------- */

function ScheduleForm({ value, done }: { value: string; done: Done }) {
  const [v, setV] = useState(value);
  async function save() {
    const { error } = await supabase.from("site_settings").update({ schedule_label: v }).eq("id", 1);
    await done(error, "Horario guardado");
  }
  return (
    <Card title="horario de subida">
      <input className={input} value={v} onChange={(e) => setV(e.target.value)} placeholder="viernes 21:00" />
      <button className={`${btnHalo} mt-4`} onClick={save}><Save className="size-3.5" /> guardar</button>
    </Card>
  );
}

function SocialForm({ row, done }: { row: SocialRow; done: Done }) {
  const [f, setF] = useState(row);
  async function save() {
    const { error } = await supabase
      .from("social_links")
      .update({ label: f.label, handle: f.handle, href: f.href })
      .eq("id", row.id);
    await done(error, `${f.label} guardado`);
  }
  return (
    <Card title={row.label}>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="nombre"><input className={input} value={f.label} onChange={(e) => setF({ ...f, label: e.target.value })} /></Field>
        <Field label="usuario visible"><input className={input} value={f.handle} onChange={(e) => setF({ ...f, handle: e.target.value })} /></Field>
        <Field label={row.id === "email" ? "link (mailto:...)" : "link"}><input className={input} value={f.href} onChange={(e) => setF({ ...f, href: e.target.value })} /></Field>
      </div>
      <button className={`${btnHalo} mt-4`} onClick={save}><Save className="size-3.5" /> guardar</button>
    </Card>
  );
}
