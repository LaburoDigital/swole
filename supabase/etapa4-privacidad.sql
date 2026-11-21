-- Etapa 4 (2026-11-21): bloquear, denunciar, límite a probar códigos, ayudantes de RLS fuera de la API.
-- Aplicada en el proyecto swole como migración "etapa4_privacidad".

-- 1) Ayudantes de RLS en un esquema que la API no expone (antes eran /rpc/ públicas).
create schema if not exists swole_rls;
grant usage on schema swole_rls to authenticated;

create table public.swole_block(
  user_id uuid not null references auth.users(id) on delete cascade,
  blocked_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(user_id, blocked_id),
  check (user_id <> blocked_id)
);
alter table public.swole_block enable row level security;
create policy swole_block_select on public.swole_block for select to authenticated using (user_id = (select auth.uid()));
create index swole_block_blocked on public.swole_block(blocked_id);

create or replace function swole_rls.sees(p_user uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select p_user = auth.uid() or exists (select 1 from public.swole_friends where user_id = auth.uid() and friend_id = p_user);
$$;
create or replace function swole_rls.post_owner(p_post uuid) returns uuid
language sql stable security definer set search_path = '' as $$
  select user_id from public.swole_post where id = p_post;
$$;
create or replace function swole_rls.in_comp(p_comp uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.swole_comp_member where comp_id = p_comp and user_id = auth.uid());
$$;
create or replace function swole_rls.blocked(p_user uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.swole_block where (user_id = auth.uid() and blocked_id = p_user) or (user_id = p_user and blocked_id = auth.uid()));
$$;
revoke all on all functions in schema swole_rls from public, anon;
grant execute on all functions in schema swole_rls to authenticated;

drop policy swole_comment_delete on public.swole_comment;
drop policy swole_comment_insert on public.swole_comment;
drop policy swole_comment_select on public.swole_comment;
create policy swole_comment_select on public.swole_comment for select to authenticated
  using (swole_rls.sees(swole_rls.post_owner(post_id)) and not swole_rls.blocked(user_id));
create policy swole_comment_insert on public.swole_comment for insert to authenticated
  with check (user_id = (select auth.uid()) and swole_rls.sees(swole_rls.post_owner(post_id)) and not swole_rls.blocked(swole_rls.post_owner(post_id)));
create policy swole_comment_delete on public.swole_comment for delete to authenticated
  using (user_id = (select auth.uid()) or swole_rls.post_owner(post_id) = (select auth.uid()));

drop policy swole_like_insert on public.swole_like;
drop policy swole_like_select on public.swole_like;
create policy swole_like_select on public.swole_like for select to authenticated
  using (swole_rls.sees(swole_rls.post_owner(post_id)) and not swole_rls.blocked(user_id));
create policy swole_like_insert on public.swole_like for insert to authenticated
  with check (user_id = (select auth.uid()) and swole_rls.sees(swole_rls.post_owner(post_id)));

drop policy swole_post_select on public.swole_post;
create policy swole_post_select on public.swole_post for select to authenticated using (swole_rls.sees(user_id));

drop policy swole_comp_select on public.swole_comp;
create policy swole_comp_select on public.swole_comp for select to authenticated using (swole_rls.in_comp(id));
drop policy swole_comp_member_select on public.swole_comp_member;
create policy swole_comp_member_select on public.swole_comp_member for select to authenticated using (swole_rls.in_comp(comp_id));

drop function public.swole_sees(uuid);
drop function public.swole_post_owner(uuid);
drop function public.swole_in_comp(uuid);

-- 2) Límite a probar códigos: 15 códigos inexistentes por día y por usuario.
create table swole_priv.code_try(user_id uuid not null references auth.users(id) on delete cascade, day date not null default current_date, n int not null default 0, primary key(user_id, day));

create or replace function public.swole_add_friend(p_code text) returns text
language plpgsql security definer set search_path = '' as $$
declare me uuid := auth.uid(); other uuid; tries int;
begin
  if me is null then raise exception 'not_authenticated'; end if;
  if not exists (select 1 from public.swole_public where user_id = me) then raise exception 'no_profile'; end if;
  select n into tries from swole_priv.code_try where user_id = me and day = current_date;
  if coalesce(tries,0) >= 15 then raise exception 'too_many_tries'; end if;
  select user_id into other from public.swole_public where code = upper(trim(p_code));
  if other is null then
    insert into swole_priv.code_try(user_id, day, n) values (me, current_date, 1)
      on conflict (user_id, day) do update set n = swole_priv.code_try.n + 1;
    raise exception 'code_not_found';
  end if;
  if other = me then raise exception 'own_code'; end if;
  -- bloqueado (en cualquier sentido): parece enviada, pero no pasa nada
  if exists (select 1 from public.swole_block where (user_id = me and blocked_id = other) or (user_id = other and blocked_id = me)) then return 'sent'; end if;
  if exists (select 1 from public.swole_friends where user_id = me and friend_id = other) then return 'already'; end if;
  if (select count(*) from public.swole_friends where user_id = me) >= 100 then raise exception 'too_many'; end if;
  if exists (select 1 from public.swole_freq where from_id = other and to_id = me) then
    insert into public.swole_friends(user_id, friend_id) values (me, other), (other, me) on conflict do nothing;
    delete from public.swole_freq where (from_id = other and to_id = me) or (from_id = me and to_id = other);
    return 'friends';
  end if;
  if (select count(*) from public.swole_freq where from_id = me) >= 30 then raise exception 'too_many_req'; end if;
  insert into public.swole_freq(from_id, to_id) values (me, other) on conflict do nothing;
  return 'sent';
end $$;

-- 3) Bloquear: corta amistad, solicitudes y torneos compartidos que creó el otro.
create or replace function public.swole_block_user(p_user uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare me uuid := auth.uid();
begin
  if me is null then raise exception 'not_authenticated'; end if;
  if p_user is null or p_user = me then raise exception 'bad_user'; end if;
  if (select count(*) from public.swole_block where user_id = me) >= 500 then raise exception 'too_many'; end if;
  insert into public.swole_block(user_id, blocked_id) values (me, p_user) on conflict do nothing;
  delete from public.swole_friends where (user_id = me and friend_id = p_user) or (user_id = p_user and friend_id = me);
  delete from public.swole_freq where (from_id = me and to_id = p_user) or (from_id = p_user and to_id = me);
  delete from public.swole_comp_member m using public.swole_comp c
   where m.comp_id = c.id and ((c.owner = p_user and m.user_id = me) or (c.owner = me and m.user_id = p_user));
end $$;

create or replace function public.swole_unblock_user(p_user uuid) returns void
language sql security definer set search_path = '' as $$
  delete from public.swole_block where user_id = auth.uid() and blocked_id = p_user;
$$;

-- Lista de bloqueados con su apodo (el apodo ya no se ve por RLS al dejar de ser amigos).
create or replace function public.swole_blocked_list() returns table(user_id uuid, nick text, created_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select b.blocked_id, coalesce(p.nick,'Atleta'), b.created_at from public.swole_block b
  left join public.swole_public p on p.user_id = b.blocked_id where b.user_id = auth.uid() order by 3 desc;
$$;

-- 4) Denuncias: solo se insertan con la función; nadie las lee desde la app (se revisan en Supabase).
create table public.swole_report(
  id uuid primary key default gen_random_uuid(),
  reporter uuid references auth.users(id) on delete set null,
  target uuid references auth.users(id) on delete set null,
  kind text not null check (kind in ('user','post','comment','comp','other')),
  ref uuid,
  reason text not null check (reason in ('acoso','sexual','odio','spam','menor','peligro','otro')),
  note text check (char_length(note) <= 500),
  snapshot jsonb,
  status text not null default 'nueva' check (status in ('nueva','vista','resuelta')),
  created_at timestamptz not null default now()
);
alter table public.swole_report enable row level security; -- sin políticas: la app no lee ni escribe directo

create or replace function public.swole_report_add(p_target uuid, p_kind text, p_ref uuid, p_reason text, p_note text) returns void
language plpgsql security definer set search_path = '' as $$
declare me uuid := auth.uid(); snap jsonb;
begin
  if me is null then raise exception 'not_authenticated'; end if;
  if (select count(*) from public.swole_report where reporter = me and created_at > now() - interval '1 day') >= 10 then raise exception 'too_many_reports'; end if;
  -- copia de lo denunciado, por si el otro lo borra
  if p_kind = 'comment' then select to_jsonb(c) into snap from public.swole_comment c where c.id = p_ref;
  elsif p_kind = 'post' then select to_jsonb(p) into snap from public.swole_post p where p.id = p_ref;
  elsif p_kind = 'comp' then select to_jsonb(c) into snap from public.swole_comp c where c.id = p_ref;
  end if;
  if p_target is not null then
    snap := coalesce(snap,'{}'::jsonb) || jsonb_build_object('perfil', (select jsonb_build_object('nick',nick,'code',code) from public.swole_public where user_id = p_target));
  end if;
  insert into public.swole_report(reporter, target, kind, ref, reason, note, snapshot)
    values (me, p_target, p_kind, p_ref, p_reason, left(nullif(trim(p_note),''),500), snap);
end $$;

revoke all on function public.swole_block_user(uuid), public.swole_unblock_user(uuid), public.swole_blocked_list(), public.swole_report_add(uuid,text,uuid,text,text) from public, anon;
grant execute on function public.swole_block_user(uuid), public.swole_unblock_user(uuid), public.swole_blocked_list(), public.swole_report_add(uuid,text,uuid,text,text) to authenticated;

-- 5) Migración "etapa4_avisos_post_owner": los avisos de fuego y comentarios usaban public.swole_post_owner
--    (la prueba con usuarios de mentira lo detectó). Ahora usan swole_rls.post_owner.
--    (swole_priv.on_like y swole_priv.on_comment: mismo cuerpo, solo cambia esa llamada.)

-- 6) Migración "etapa4_codigo_no_encontrado": swole_add_friend devuelve 'not_found' en vez de lanzar
--    'code_not_found', porque el error deshacía el contador de swole_priv.code_try (el límite no frenaba).

-- 7) Migración "etapa4_indices_report": índices en swole_report(reporter, created_at) y (target).
