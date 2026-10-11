create table public.strata_ai_tasks (
 id uuid primary key, tenant text not null references strata_workspaces(tenant), actor text not null,
 operation text not null, resource text not null, request text not null, status text not null,
 result jsonb not null default '{}', model text not null default '', usage jsonb not null default '{}',
 created_at timestamptz not null default now()
);
create table public.strata_ai_runs (
 id uuid primary key, tenant text not null references strata_workspaces(tenant), session_id text not null,
 actor text not null, status text not null, policy jsonb not null, turns integer not null default 0,
 reserved_tokens integer not null default 0, lease uuid, next_at timestamptz not null default now(),
 reason text not null default '', created_at timestamptz not null default now()
);
create unique index strata_one_active_ai_run on strata_ai_runs(tenant,session_id) where status='running';
alter table strata_ai_tasks enable row level security;
alter table strata_ai_runs enable row level security;
revoke all on strata_ai_tasks,strata_ai_runs from anon,authenticated;
grant all on strata_ai_tasks,strata_ai_runs to service_role;

-- Reserve a whole worst-case turn BEFORE contacting the provider. No retry refunds.
create function strata_ai_claim(p_id uuid,p_lease uuid,p_tokens integer) returns jsonb
language plpgsql security invoker set search_path=public as $$
declare r strata_ai_runs;
begin
 update strata_ai_runs set lease=p_lease,turns=turns+1,reserved_tokens=reserved_tokens+p_tokens
 where id=p_id and status='running' and lease is null and next_at<=now()
 and turns<(policy->>'maxTurns')::integer
 and reserved_tokens+p_tokens<=(policy->>'maxTokens')::integer returning * into r;
 if not found then return null; end if;
 return to_jsonb(r);
end $$;

-- Stop invalidates the lease. A late response cannot change any workspace bytes.
create function strata_ai_finish(p_tenant text,p_version bigint,p_state jsonb,p_task uuid,
 p_result jsonb,p_model text,p_usage jsonb,p_run uuid default null,p_lease uuid default null)
 returns boolean language plpgsql security invoker set search_path=public as $$
begin
 if p_run is not null then
  perform 1 from strata_ai_runs where id=p_run and tenant=p_tenant and status='running' and lease=p_lease for update;
  if not found then return false; end if;
 end if;
 perform 1 from strata_ai_tasks where id=p_task and tenant=p_tenant and status='running' for update;
 if not found then return false; end if;
 update strata_workspaces set state=p_state,version=version+1,updated_at=now() where tenant=p_tenant and version=p_version;
 if not found then return false; end if;
 update strata_ai_tasks set status='complete',result=p_result,model=p_model,usage=p_usage where id=p_task;
 if p_run is not null then
  update strata_ai_runs set lease=null,next_at=now()+((policy->>'intervalSeconds')::integer*interval '1 second') where id=p_run;
 end if;
 return true;
end $$;
revoke all on function strata_ai_claim(uuid,uuid,integer),strata_ai_finish(text,bigint,jsonb,uuid,jsonb,text,jsonb,uuid,uuid) from public,anon,authenticated;
grant execute on function strata_ai_claim(uuid,uuid,integer),strata_ai_finish(text,bigint,jsonb,uuid,jsonb,text,jsonb,uuid,uuid) to service_role;
