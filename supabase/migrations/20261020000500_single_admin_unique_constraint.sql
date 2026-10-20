-- Enforce single administrator atomically to prevent concurrent bootstrap race conditions (CWE-362)
with ranked_admins as (
  select id, row_number() over (order by id) as rn
  from public.user_roles
  where role = 'admin'
)
delete from public.user_roles
where id in (select id from ranked_admins where rn > 1);

create unique index if not exists user_roles_single_admin_idx
  on public.user_roles (role)
  where role = 'admin';

create or replace function public.claim_first_admin()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.user_roles (user_id, role)
  values (new.id, 'admin')
  on conflict (role) where (role = 'admin') do nothing;
  return new;
end $$;
revoke execute on function public.claim_first_admin() from public, anon, authenticated;
