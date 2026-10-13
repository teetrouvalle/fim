
-- Fim Addis launch database: apply ONLY to a newly dedicated Fim Addis project.
-- No sales or playback can be enabled by this migration.
create extension if not exists pgcrypto;

create table if not exists public.profiles(
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text,
 preferred_language text not null default 'en' check(preferred_language in ('en','am')),
 preferred_currency text not null default 'ETB' check(preferred_currency in ('ETB','USD')),
 created_at timestamptz not null default now()
);
create table if not exists public.user_roles(
 user_id uuid primary key references auth.users(id) on delete cascade,
 role text not null default 'user' check(role in ('user','admin'))
);
create table if not exists public.membership_plans(
 id text primary key check(id in ('basic','plus','premium')),
 rank smallint not null unique check(rank between 1 and 3),
 price_etb_cents bigint check(price_etb_cents is null or price_etb_cents>=0),
 price_usd_cents bigint check(price_usd_cents is null or price_usd_cents>=0),
 duration_days integer not null default 30 check(duration_days between 1 and 366),
 active boolean not null default true
);
insert into public.membership_plans(id,rank,price_etb_cents,duration_days) values
 ('basic',1,null,30),('plus',2,50000,30),('premium',3,200000,30)
on conflict (id) do nothing;

create table if not exists public.videos(
 id uuid primary key default gen_random_uuid(),
 bunny_guid text unique not null,
 title_en text not null,
 title_am text,
 description_en text,
 description_am text,
 classification text not null default 'basic' check(classification in ('basic','plus','premium','purchase_only')),
 price_etb_cents bigint check(price_etb_cents is null or price_etb_cents >= 0),
 price_usd_cents bigint check(price_usd_cents is null or price_usd_cents >= 0),
 publication_status text not null default 'draft' check(publication_status in ('draft','review','published','archived')),
 rights_verified boolean not null default false,
 rating_reviewed boolean not null default false,
 playable boolean not null default false,
 created_at timestamptz not null default now()
);
create table if not exists public.orders(
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id),
 product_type text not null check(product_type in ('membership','video')),
 plan_id text references public.membership_plans(id),
 video_id uuid references public.videos(id),
 currency text not null check(currency in ('ETB','USD')),
 amount_cents bigint not null check(amount_cents>0),
 duration_days integer check(duration_days between 1 and 366),
 state text not null default 'awaiting_payment' check(state in ('awaiting_payment','pending_review','approved','rejected','cancelled')),
 created_at timestamptz not null default now(),
 reviewed_at timestamptz,
 constraint correct_product check(
  (product_type='membership' and plan_id is not null and video_id is null and duration_days is not null)
  or (product_type='video' and video_id is not null and plan_id is null and duration_days is null))
);
create table if not exists public.payment_submissions(
 id uuid primary key default gen_random_uuid(),
 order_id uuid not null references public.orders(id),
 user_id uuid not null references auth.users(id),
 transaction_reference text not null,
 receipt_path text not null,
 status text not null default 'pending_review' check(status in ('pending_review','approved','rejected')),
 reviewed_by uuid references auth.users(id),
 reviewed_at timestamptz,
 rejection_reason text,
 created_at timestamptz not null default now()
);
create unique index if not exists one_active_review_per_order on public.payment_submissions(order_id) where status in ('pending_review','approved');
create table if not exists public.subscriptions(
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id),
 plan_id text not null references public.membership_plans(id),
 source_order uuid not null unique references public.orders(id),
 starts_at timestamptz not null,
 ends_at timestamptz not null,
 check(ends_at>starts_at)
);
create index if not exists subscriptions_active on public.subscriptions(user_id,ends_at);
create table if not exists public.video_entitlements(
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id),
 video_id uuid not null references public.videos(id),
 source_order uuid not null unique references public.orders(id),
 granted_at timestamptz not null default now(),
 unique(user_id,video_id)
);
create table if not exists public.watch_progress(
 user_id uuid not null references auth.users(id),
 video_id uuid not null references public.videos(id),
 position_seconds integer not null default 0 check(position_seconds>=0),
 updated_at timestamptz not null default now(),
 primary key(user_id,video_id)
);
create table if not exists public.audit_logs(
 id bigint generated always as identity primary key,
 actor_id uuid references auth.users(id),
 action text not null,
 target_id uuid,
 occurred_at timestamptz not null default now()
);
create table if not exists public.site_settings(
 id boolean primary key default true check(id),
 sales_enabled boolean not null default false,
 playback_enabled boolean not null default false
);
insert into public.site_settings (id,sales_enabled,playback_enabled) values (true,false,false) on conflict(id) do nothing;

create schema if not exists private;
create or replace function private.is_admin(u uuid) returns boolean
 language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.user_roles where user_id=u and role='admin');
 $$;
revoke all on function private.is_admin(uuid) from public;
grant usage on schema private to authenticated;
grant execute on function private.is_admin(uuid) to authenticated;

create or replace function public.create_membership_order(p_plan_id text, p_currency text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_plan public.membership_plans%rowtype; v_price bigint; v_id uuid;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 if not exists(select 1 from public.site_settings where id and sales_enabled) then raise exception 'Checkout is not enabled'; end if;
 select * into v_plan from public.membership_plans where id=p_plan_id and active=true;
 if not found then raise exception 'Plan unavailable'; end if;
 if p_currency not in ('ETB','USD') then raise exception 'Unsupported currency'; end if;
 v_price := case p_currency when 'ETB' then v_plan.price_etb_cents else v_plan.price_usd_cents end;
 if v_price is null or v_price <= 0 then raise exception 'Price unavailable'; end if;
 insert into public.orders(user_id,product_type,plan_id,currency,amount_cents,duration_days)
 values (auth.uid(),'membership',v_plan.id,p_currency,v_price,v_plan.duration_days) returning id into v_id;
 return v_id;
end;$$;
revoke all on function public.create_membership_order(text,text) from public;
grant execute on function public.create_membership_order(text,text) to authenticated;

create or replace function public.submit_payment_proof(p_order uuid,p_reference text,p_receipt text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_order public.orders%rowtype; v_id uuid;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 select * into v_order from public.orders where id=p_order and user_id=auth.uid() for update;
 if not found or v_order.state not in ('awaiting_payment','rejected') then raise exception 'Order not awaiting payment'; end if;
 if length(trim(p_reference)) not between 5 and 120 then raise exception 'Invalid reference'; end if;
 if p_receipt not like (auth.uid()::text || '/' || p_order::text || '/%') then raise exception 'Invalid receipt path'; end if;
 insert into public.payment_submissions(order_id,user_id,transaction_reference,receipt_path)
 values(p_order,auth.uid(),trim(p_reference),p_receipt) returning id into v_id;
 update public.orders set state='pending_review' where id=p_order;
 return v_id;
end;$$;
revoke all on function public.submit_payment_proof(uuid,text,text) from public;
grant execute on function public.submit_payment_proof(uuid,text,text) to authenticated;

create or replace function public.review_payment(p_submission_id uuid,p_approve boolean,p_reason text default null)
returns boolean language plpgsql security definer set search_path = '' as $$
declare v_pay public.payment_submissions%rowtype; v_order public.orders%rowtype;
v_from timestamptz;v_until timestamptz;v_days int;
begin
 if auth.uid() is null or not private.is_admin(auth.uid()) then raise exception 'Admin required'; end if;
 select * into v_pay from public.payment_submissions where id=p_submission_id for update;
 if not found then raise exception 'Submission not found'; end if;
 if v_pay.status='approved' then return true; end if;
 if v_pay.status='rejected' then return false; end if;
 if v_pay.status!='pending_review' then raise exception 'Invalid review state'; end if;
 select * into v_order from public.orders where id=v_pay.order_id for update;
 if v_order.state!='pending_review' then raise exception 'Order is not pending review'; end if;
 if p_approve then
  update public.payment_submissions set status='approved',reviewed_by=auth.uid(),reviewed_at=now() where id=p_submission_id;
  update public.orders set state='approved',reviewed_at=now() where id=v_order.id;
  if v_order.product_type='membership' then
   select greatest(now(),coalesce(max(s.ends_at),now())) into v_from
     from public.subscriptions s where s.user_id=v_order.user_id and s.plan_id=v_order.plan_id;
   v_days:=v_order.duration_days;
   v_until:=v_from + make_interval(days => v_days);
   insert into public.subscriptions(user_id,plan_id,source_order,starts_at,ends_at)
   values(v_order.user_id,v_order.plan_id,v_order.id,now(),v_until);
  else
   insert into public.video_entitlements(user_id,video_id,source_order)
   values(v_order.user_id,v_order.video_id,v_order.id)
   on conflict (user_id,video_id) do nothing;
  end if;
 else
  update public.payment_submissions set status='rejected', reviewed_by=auth.uid(),
   reviewed_at=now(),rejection_reason=coalesce(nullif(trim(p_reason),''),'Payment could not be verified')
   where id=p_submission_id;
  update public.orders set state='rejected',reviewed_at=now() where id=v_order.id;
 end if;
 insert into public.audit_logs(actor_id,action,target_id)
 values(auth.uid(),case when p_approve then 'payment_approved' else 'payment_rejected' end,p_submission_id);
 return p_approve;
end;$$;
revoke all on function public.review_payment(uuid,boolean,text) from public;
grant execute on function public.review_payment(uuid,boolean,text) to authenticated;

create or replace function public.can_watch_video(p_video_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
select coalesce((
 select (select playback_enabled from public.site_settings where id)
  and v.publication_status='published' and v.rights_verified and v.rating_reviewed and v.playable
  and auth.uid() is not null and
  (
   exists(select 1 from public.video_entitlements e where e.user_id=auth.uid() and e.video_id=v.id)
   or
   (v.classification <> 'purchase_only' and exists(
    select 1 from public.subscriptions s join public.membership_plans p on s.plan_id=p.id
    where s.user_id=auth.uid() and s.ends_at>now() and p.rank>=
      (case v.classification when 'basic' then 1 when 'plus' then 2 else 3 end)
   ))
  )
 from public.videos v where v.id=p_video_id
),false);
$$;
revoke all on function public.can_watch_video(uuid) from public;
grant execute on function public.can_watch_video(uuid) to authenticated;

do $$ declare t text; begin
 foreach t in array array['profiles','user_roles','membership_plans','videos','orders','payment_submissions','subscriptions','video_entitlements','watch_progress','audit_logs','site_settings']
 loop execute format('alter table public.%I enable row level security',t); end loop;
end $$;
create policy profile_self on public.profiles for select to authenticated using (id=auth.uid());
create policy profile_update_self on public.profiles for update to authenticated using (id=auth.uid()) with check(id=auth.uid());
create policy roles_self on public.user_roles for select to authenticated using(user_id=auth.uid());
create policy plans_public on public.membership_plans for select to anon,authenticated using(active);
create policy videos_public on public.videos for select to anon,authenticated using(publication_status='published' and rights_verified and rating_reviewed);
create policy orders_self on public.orders for select to authenticated using(user_id=auth.uid());
create policy payments_self on public.payment_submissions for select to authenticated using(user_id=auth.uid());
create policy subs_self on public.subscriptions for select to authenticated using(user_id=auth.uid());
create policy entitlements_self on public.video_entitlements for select to authenticated using(user_id=auth.uid());
create policy watch_self on public.watch_progress for select to authenticated using(user_id=auth.uid());
create policy watch_insert on public.watch_progress for insert to authenticated with check(user_id=auth.uid());
create policy watch_update on public.watch_progress for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
-- Sensitive tables (audit_logs, site_settings) are not directly exposed to clients.
-- Admin reads and writes must go through privileged, audited operations in a future controlled API.

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values('fim-receipts','fim-receipts',false,10485760,array['image/jpeg','image/png','application/pdf'])
 on conflict(id) do nothing;
create policy "receipt owner uploads" on storage.objects for insert to authenticated
 with check(bucket_id='fim-receipts' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "receipt owner reads" on storage.objects for select to authenticated
 using(bucket_id='fim-receipts' and (storage.foldername(name))[1]=auth.uid()::text);
-- Owner files are write-once; no UPDATE, DELETE or public SELECT.
