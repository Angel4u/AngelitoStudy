import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

import type { Database } from "@/integrations/supabase/types";
import type { Catalog, SocialId, SubjectDetail } from "@/data/catalog";
import { mapSubject } from "@/data/catalog";

function publicDb() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      // Public anonymous read: never forward any bearer token.
      fetch: (input, init) => {
        const h = new Headers(input instanceof Request ? input.headers : undefined);
        if (init?.headers) new Headers(init.headers).forEach((v, k) => h.set(k, v));
        h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

/** Public read of the malla, schedule and social links. */
export const getCatalog = createServerFn({ method: "GET" }).handler(async (): Promise<Catalog> => {
  const db = publicDb();
  const [subjects, settings, socials] = await Promise.all([
    db.from("subjects").select("*").order("level").order("sort_order"),
    db.from("site_settings").select("schedule_label").eq("id", 1).maybeSingle(),
    db.from("social_links").select("*").order("sort_order"),
  ]);
  const err = subjects.error || settings.error || socials.error;
  if (err) {
    console.error("getCatalog", err);
    throw new Error("No se pudo cargar el contenido");
  }
  return {
    subjects: subjects.data.map(mapSubject),
    scheduleLabel: settings.data?.schedule_label ?? "",
    socialLinks: socials.data.map((r) => ({ id: r.id as SocialId, label: r.label, handle: r.handle, href: r.href })),
  };
});

/** Public read of one ramo with its units and resources. */
export const getSubject = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ id: z.string().min(1).max(64) }).parse(d))
  .handler(async ({ data }): Promise<SubjectDetail | null> => {
    const db = publicDb();
    const { data: s, error } = await db.from("subjects").select("*").eq("id", data.id).maybeSingle();
    if (error) throw new Error("No se pudo cargar el ramo");
    if (!s) return null;
    const { data: units, error: e2 } = await db
      .from("units")
      .select("id,title,sort_order,unit_resources(id,kind,label,url,sort_order)")
      .eq("subject_id", s.id)
      .order("sort_order");
    if (e2) throw new Error("No se pudo cargar el ramo");
    return {
      ...mapSubject(s),
      units: (units ?? []).map((u) => ({
        id: u.id,
        title: u.title,
        resources: [...(u.unit_resources ?? [])]
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((r) => ({ id: r.id, kind: r.kind === "pdf" ? "pdf" : "video", label: r.label, url: r.url })),
      })),
    };
  });
