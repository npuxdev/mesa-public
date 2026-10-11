-- Additive upgrade for stacks initialized before generation reservations were added.
alter table public.strata_ai_proposals drop constraint strata_ai_proposals_status_check;
alter table public.strata_ai_proposals add constraint strata_ai_proposals_status_check
  check (status in ('generating','failed','proposed','accepted','rejected'));
