/**
 * AngelitoStudy content catalog.
 *
 * Content lives in the database and is edited from /admin. This module keeps
 * the typed shapes the UI renders and the shared queries used by every page.
 */
import { queryOptions } from "@tanstack/react-query";

import type { Database } from "@/integrations/supabase/types";
import { getCatalog, getSubject } from "@/lib/catalog.functions";

type Tables = Database["public"]["Tables"];
export type SubjectRow = Tables["subjects"]["Row"];
export type UnitRow = Tables["units"]["Row"];
export type ResourceRow = Tables["unit_resources"]["Row"];
export type SettingsRow = Tables["site_settings"]["Row"];
export type SocialRow = Tables["social_links"]["Row"];

export type Accent = "halo" | "gold" | "none";
export type SocialId = "youtube" | "github" | "twitch" | "email";
export type ResourceKind = "video" | "pdf";

export interface Subject {
  id: string;
  code: string;
  title: string;
  level: number;
  accent: Accent;
}

export interface Resource {
  id: string;
  kind: ResourceKind;
  label: string;
  url: string;
}

export interface Unit {
  id: string;
  title: string;
  resources: Resource[];
}

export interface SubjectDetail extends Subject {
  units: Unit[];
}

export interface SocialLink {
  id: SocialId;
  label: string;
  handle: string;
  href: string;
}

export interface Catalog {
  subjects: Subject[];
  scheduleLabel: string;
  socialLinks: SocialLink[];
}

export function toAccent(v: string): Accent {
  return v === "gold" ? "gold" : v === "halo" ? "halo" : "none";
}

export function mapSubject(s: SubjectRow): Subject {
  return { id: s.id, code: s.code, title: s.title, level: s.level, accent: toAccent(s.accent) };
}

export const catalogQuery = () =>
  queryOptions({ queryKey: ["catalog"], queryFn: () => getCatalog() });

export const subjectQuery = (id: string) =>
  queryOptions({ queryKey: ["subject", id], queryFn: () => getSubject({ data: { id } }) });
