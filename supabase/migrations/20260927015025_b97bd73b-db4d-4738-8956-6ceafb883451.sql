-- Roles
create type public.app_role as enum ('admin');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "Users read own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

-- Public: is there already an admin? (drives whether the setup form is shown)
create or replace function public.admin_exists()
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where role = 'admin') $$;
grant execute on function public.admin_exists() to anon, authenticated;

-- First account ever created becomes the only admin
create or replace function public.claim_first_admin()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  end if;
  return new;
end $$;
create trigger on_auth_user_created_claim_admin
after insert on auth.users for each row execute function public.claim_first_admin();

-- Subjects
create table public.subjects (
  id text primary key,
  code text not null,
  title text not null,
  category text not null default '',
  blurb text not null default '',
  term text not null default '',
  videos integer not null default 0,
  notes integer not null default 0,
  accent text not null default 'halo' check (accent in ('halo','gold')),
  tags text[] not null default '{}',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.subjects to anon, authenticated;
grant insert, update, delete on public.subjects to authenticated;
grant all on public.subjects to service_role;
alter table public.subjects enable row level security;
create policy "Anyone reads subjects" on public.subjects for select to anon, authenticated using (true);
create policy "Admins write subjects" on public.subjects for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Notes (PDF links)
create table public.notes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subject_id text not null references public.subjects(id) on update cascade on delete cascade,
  kind text not null default 'Apuntes' check (kind in ('Guía','Apuntes','Resumen','Ayudantía')),
  pages integer not null default 0,
  size_kb integer not null default 0,
  updated date not null default current_date,
  href text not null,
  created_at timestamptz not null default now()
);
grant select on public.notes to anon, authenticated;
grant insert, update, delete on public.notes to authenticated;
grant all on public.notes to service_role;
alter table public.notes enable row level security;
create policy "Anyone reads notes" on public.notes for select to anon, authenticated using (true);
create policy "Admins write notes" on public.notes for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Single-row site settings (featured video + schedule)
create table public.site_settings (
  id integer primary key default 1 check (id = 1),
  schedule_label text not null default 'viernes 21:00',
  video_eyebrow text not null default 'Última clase subida',
  video_title text not null default '',
  video_series text not null default '',
  video_duration text not null default '',
  video_published text not null default '',
  video_url text not null default '',
  video_poster text not null default ''
);
grant select on public.site_settings to anon, authenticated;
grant update on public.site_settings to authenticated;
grant all on public.site_settings to service_role;
alter table public.site_settings enable row level security;
create policy "Anyone reads settings" on public.site_settings for select to anon, authenticated using (true);
create policy "Admins update settings" on public.site_settings for update to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Social links
create table public.social_links (
  id text primary key check (id in ('youtube','github','twitch','email')),
  label text not null,
  handle text not null default '',
  href text not null default '',
  sort_order integer not null default 0
);
grant select on public.social_links to anon, authenticated;
grant update on public.social_links to authenticated;
grant all on public.social_links to service_role;
alter table public.social_links enable row level security;
create policy "Anyone reads social links" on public.social_links for select to anon, authenticated using (true);
create policy "Admins update social links" on public.social_links for update to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Seed with current content
insert into public.subjects (id, code, title, category, blurb, term, videos, notes, accent, tags, sort_order) values
('calculo-multivariable','MAT-201','Cálculo Multivariable','Matemáticas','Derivadas parciales, gradientes, multiplicadores de Lagrange y las integrales triples que aprueban o hunden el semestre.','2º semestre',18,7,'halo','{gradiente,jacobiano,campos,"integrales triples"}',1),
('fisica','FIS-102','Física','Ciencias básicas','Mecánica y electromagnetismo resueltos en la pizarra: diagrama de cuerpo libre, ley de Gauss y circuitos sin sustos.','1º semestre',24,11,'gold','{mecánica,electricidad,magnetismo,ondas}',2),
('estructuras-de-datos','ICC-204','Estructuras de Datos','Programación','Árboles, heaps, tablas de hash y grafos implementados línea a línea, con su análisis de complejidad en voz alta.','3º semestre',21,9,'halo','{árboles,heaps,hash,grafos,big-o}',3),
('programacion-dinamica','ICC-305','Programación Dinámica (C / C++)','Programación','Del caso base a la tabla: cómo detectar subproblemas superpuestos y escribir la recurrencia en C/C++ sin memoria de más.','4º semestre',14,6,'gold','{recurrencia,memoización,mochila,punteros}',4),
('desarrollo-web','WEB-210','Desarrollo Web (React)','Desarrollo web','Componentes, estado, hooks y despliegue. Construir interfaces que no se caigan cuando el profesor las abre en vivo.','5º semestre',16,5,'halo','{hooks,estado,routing,accesibilidad}',5);

insert into public.notes (title, subject_id, kind, pages, size_kb, updated, href) values
('Resolución Guía 3 — Recursividad','programacion-dinamica','Guía',22,1840,'2026-09-21','/downloads/resolucion-guia-3-recursividad.pdf'),
('Apuntes — Multiplicadores de Lagrange','calculo-multivariable','Apuntes',14,1120,'2026-09-18','/downloads/apuntes-lagrange.pdf'),
('Ayudantía — Ley de Gauss paso a paso','fisica','Ayudantía',9,760,'2026-09-14','/downloads/ayudantia-ley-de-gauss.pdf'),
('Resumen — Árboles B y B+','estructuras-de-datos','Resumen',7,540,'2026-09-09','/downloads/resumen-arboles-b.pdf'),
('Resolución Guía 1 — Problema de la Mochila','programacion-dinamica','Guía',16,1310,'2026-09-02','/downloads/resolucion-guia-1-mochila.pdf'),
('Apuntes — Hooks y renderizado en React','desarrollo-web','Apuntes',12,980,'2026-08-27','/downloads/apuntes-hooks-react.pdf');

insert into public.site_settings (id, schedule_label, video_eyebrow, video_title, video_series, video_duration, video_published, video_url, video_poster) values
(1,'viernes 21:00','Última clase subida','Cálculo Multivariable · Integrales triples con cambios de orden','Serie: Sobreviviendo a MAT-201','48:12','hace 2 días','https://www.youtube.com/watch?v=REPLACE_WITH_REAL_VIDEO_ID','');

insert into public.social_links (id, label, handle, href, sort_order) values
('youtube','YouTube','@angelitostudy','https://www.youtube.com/@angelitostudy',1),
('github','GitHub','/angelitostudy','https://github.com/angelitostudy',2),
('twitch','Twitch','/angelitostudy','https://www.twitch.tv/angelitostudy',3),
('email','Correo','hola@angelitostudy.dev','mailto:hola@angelitostudy.dev',4);