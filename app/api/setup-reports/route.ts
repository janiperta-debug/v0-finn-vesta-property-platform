/**
 * One-time setup endpoint – creates the saved_reports table and related
 * objects. Only works when called with the SUPABASE_SERVICE_ROLE_KEY set in
 * the environment (never exposed to the browser).
 *
 * Call once: GET /api/setup-reports
 * Remove or protect this route in production.
 */
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

const DDL = `
create table if not exists public.saved_reports (
  id            uuid primary key default gen_random_uuid(),
  report_id     text not null unique,
  org_id        int4 not null,
  created_by    text not null,
  title         text not null,
  property_names text[] not null default '{}',
  building_ids  int4[] not null default '{}',
  report_type   text not null default 'custom',
  language      text not null default 'fi',
  version       int4 not null default 1,
  status        text not null default 'generated' check (status in ('draft','generated','archived')),
  config        jsonb not null,
  generated_at  timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create sequence if not exists public.saved_reports_seq;

alter table public.saved_reports enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'saved_reports' and policyname = 'saved_reports_select_own_org'
  ) then
    create policy "saved_reports_select_own_org"
      on public.saved_reports for select
      using (
        org_id in (
          select org_id from public.org_users where user_id = auth.uid()
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where tablename = 'saved_reports' and policyname = 'saved_reports_insert_own'
  ) then
    create policy "saved_reports_insert_own"
      on public.saved_reports for insert
      with check (created_by = auth.uid()::text);
  end if;

  if not exists (
    select 1 from pg_policies
    where tablename = 'saved_reports' and policyname = 'saved_reports_update_own'
  ) then
    create policy "saved_reports_update_own"
      on public.saved_reports for update
      using (created_by = auth.uid()::text);
  end if;

  if not exists (
    select 1 from pg_policies
    where tablename = 'saved_reports' and policyname = 'saved_reports_delete_own'
  ) then
    create policy "saved_reports_delete_own"
      on public.saved_reports for delete
      using (created_by = auth.uid()::text);
  end if;
end $$;

create or replace function public.next_report_id()
returns text
language sql
security definer
set search_path = ''
as $$
  select 'FVR-' || extract(year from now())::text || '-' ||
         lpad(nextval('public.saved_reports_seq')::text, 6, '0')
$$;
`

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json(
      {
        error: "SUPABASE_SERVICE_ROLE_KEY is required. Add it in the Vars section of project settings.",
        sql: DDL,
      },
      { status: 400 },
    )
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(supabaseUrl, serviceKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: () => {},
    },
  })

  const { error } = await supabase.rpc("exec_sql", { query: DDL })
  if (error) {
    // exec_sql RPC might not exist — return SQL for manual run
    return NextResponse.json({ error: error.message, sql: DDL }, { status: 500 })
  }

  return NextResponse.json({ ok: true, message: "saved_reports table ready." })
}
