-- The Node server is the authorization boundary. No browser/anon table access.
create table public.strata_workspaces (
  tenant text primary key check (tenant in ('atlas','harbor')),
  version bigint not null default 1,
  state jsonb not null,
  updated_at timestamptz not null default now()
);
create table public.strata_ai_proposals (
  id uuid primary key,
  tenant text not null references public.strata_workspaces(tenant),
  actor text not null,
  scenario_id text not null,
  target text not null,
  base_digest text not null,
  base_version integer not null,
  request text not null,
  model text not null,
  content jsonb not null,
  usage jsonb not null default '{}',
  status text not null default 'generating' check (status in ('generating','failed','proposed','accepted','rejected')),
  created_at timestamptz not null default now()
);
alter table public.strata_workspaces enable row level security;
alter table public.strata_ai_proposals enable row level security;
revoke all on public.strata_workspaces, public.strata_ai_proposals from anon, authenticated;
grant all on public.strata_workspaces, public.strata_ai_proposals to service_role;

-- Atomic workspace commit + optional proposal disposition. CAS prevents lost updates.
create function public.strata_commit(p_tenant text, p_version bigint, p_state jsonb,
  p_proposal uuid default null, p_disposition text default null)
returns boolean language plpgsql security invoker set search_path = public as $$
begin
  update strata_workspaces set state = p_state, version = version + 1, updated_at = now()
    where tenant = p_tenant and version = p_version;
  if not found then return false; end if;
  if p_proposal is not null then
    update strata_ai_proposals set status = p_disposition
      where id = p_proposal and tenant = p_tenant and status = 'proposed';
    if not found then raise exception 'Proposal no longer pending'; end if;
  end if;
  return true;
end;
$$;
revoke all on function public.strata_commit(text,bigint,jsonb,uuid,text) from public, anon, authenticated;
grant execute on function public.strata_commit(text,bigint,jsonb,uuid,text) to service_role;
