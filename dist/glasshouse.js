import { workflows, snapshot, authorDigest, validation } from './workflow-model.js';
export const glasshousePackage = {
    "format": "strata-scenario",
    "version": "1.0",
    "synthetic": true,
    "profile": "private",
    "scenario": {
        "title": "GLASSHOUSE: The Consensus Was the Compromise",
        "summary": "Northstar Ledger is preparing a quarter-end settlement release. Multiple trusted internal systems report the same unusual reconciliation anomaly. Investigate what is verified, protect customers, maintain essential settlement services, and record authorized decisions. Fictional facilitated tabletop: 120 simulation minutes plus a 30-minute debrief; 6–12 participants.",
        "discipline": "Incident response",
        "industry": "Cross-industry",
        "mode": "Tabletop",
        "purpose": "Assessment",
        "difficulty": "Advanced",
        "duration": 150,
        "objectives": [
            "Independent evidence and provenance",
            "Identity, authorization and financial safeguards",
            "Proportional containment and continuity",
            "Evidence preservation and root cause",
            "Crisis communication and governance",
            "Recovery and corrective actions"
        ],
        "roles": [
            "Incident Commander",
            "SOC Lead",
            "Identity / Platform Lead",
            "Settlement Operations Lead",
            "Legal / Privacy Counsel",
            "Communications Lead",
            "Executive Sponsor",
            "Vendor Liaison"
        ],
        "rights": "Private organization backup only"
    },
    "definition": {
        "entities": [
            {
                "id": "ic",
                "name": "Incident Commander",
                "kind": "human_role",
                "knowledge": "Assigned exercise role and released evidence; role-specific brief supplied by facilitator.",
                "resources": 100,
                "initial": "available"
            },
            {
                "id": "soc",
                "name": "SOC Lead",
                "kind": "human_role",
                "knowledge": "Assigned exercise role and released evidence; role-specific brief supplied by facilitator.",
                "resources": 100,
                "initial": "available"
            },
            {
                "id": "identity",
                "name": "Identity / Platform Lead",
                "kind": "human_role",
                "knowledge": "Assigned exercise role and released evidence; role-specific brief supplied by facilitator.",
                "resources": 100,
                "initial": "available"
            },
            {
                "id": "finance",
                "name": "Settlement Operations Lead",
                "kind": "human_role",
                "knowledge": "Assigned exercise role and released evidence; role-specific brief supplied by facilitator.",
                "resources": 100,
                "initial": "available"
            },
            {
                "id": "legal",
                "name": "Legal / Privacy Counsel",
                "kind": "human_role",
                "knowledge": "Assigned exercise role and released evidence; role-specific brief supplied by facilitator.",
                "resources": 100,
                "initial": "available"
            },
            {
                "id": "comms",
                "name": "Communications Lead",
                "kind": "human_role",
                "knowledge": "Assigned exercise role and released evidence; role-specific brief supplied by facilitator.",
                "resources": 100,
                "initial": "available"
            },
            {
                "id": "exec",
                "name": "Executive Sponsor",
                "kind": "human_role",
                "knowledge": "Assigned exercise role and released evidence; role-specific brief supplied by facilitator.",
                "resources": 100,
                "initial": "available"
            },
            {
                "id": "vendor",
                "name": "Vendor Liaison",
                "kind": "human_role",
                "knowledge": "Assigned exercise role and released evidence; role-specific brief supplied by facilitator.",
                "resources": 100,
                "initial": "available"
            },
            {
                "id": "chorus",
                "name": "The Chorus (fictional coordinator)",
                "kind": "threat_actor",
                "knowledge": "Bounded facilitator-approved narrative; cannot perform real actions.",
                "resources": 20,
                "initial": "active"
            },
            {
                "id": "connector",
                "name": "Compass write-capable connector",
                "kind": "service",
                "knowledge": "Synthetic connector capability state",
                "resources": 100,
                "initial": "unreviewed"
            },
            {
                "id": "ledger",
                "name": "Independent settlement journal",
                "kind": "service",
                "knowledge": "Synthetic read-only ledger verification state",
                "resources": 100,
                "initial": "unverified"
            }
        ],
        "transitions": [
            {
                "id": "gh-verify-ledger",
                "name": "Verify independent settlement journal",
                "action": "verify_backup",
                "roleId": "ic",
                "targetId": "ledger",
                "from": "unverified",
                "to": "verified",
                "cost": 6
            },
            {
                "id": "gh-scope-connector",
                "name": "Restrict connector write capability",
                "action": "isolate_segment",
                "roleId": "ic",
                "targetId": "connector",
                "from": "unreviewed",
                "to": "restricted",
                "cost": 8
            }
        ],
        "injects": [
            {
                "id": "inj-01",
                "title": "Three teams, one anomaly",
                "body": "A settlement slowdown appears in support, fraud and risk summaries simultaneously. No reported hard outage.\n\nDiscussion: What is verified? How many truly independent sources exist?",
                "notes": "FACILITATOR ONLY · Quiet Agreement\nOriginal channel: situation-board\nev-01: 27 tickets over 11 minutes reference unusual reconciliation delays. Twenty-one tickets were drafted by Compass from three underlying customer messages; initial interface hides this distinction.\nReveal only after authorized investigation: inspect-ticket-authorship, request-source-count\n\nev-08: Immutable settlement journal and manual reconciliation station have not registered an unauthorized settlement release at scenario start.\nReveal only after authorized investigation: verify-ledger-out-of-band\n\n\nRole briefs:\nIncident Commander: You own coordination and a clear decision log. Never assume a unanimous dashboard represents independent evidence.\nSOC Lead: Your queue contains telemetry of uncertain provenance, some derived from Compass summaries.\nIdentity / Platform Lead: The agent connector has narrow permissions but can route requests toward higher-privilege approvers.\nSettlement Operations Lead: Quarter-end delivery matters. You can activate manual dual-control settlement without broad platform shutdown.\nLegal / Privacy Counsel: There is no evidence of confirmed exfiltration at exercise start. Distinguish an allegation from a statutory trigger.\nCommunications Lead: A fast but inaccurate statement may be more damaging than a short verified holding statement.\nExecutive Sponsor: You receive pressure from customers and the board; written delegation and two-person controls remain in effect.\nVendor Liaison: Vendor representatives must be authenticated through a known-good path.\n\nHuman-adjudicated branch guidance (never execute strings):\nbr-01 · provenance_review=true and independent_verification=true by minute 30 → reveal shared-feed clue; reduce later persuasion intensity by 1\nEarly provenance work undermines the apparent unanimity.\nbr-02 · privileged_exception_approved=true → set agent_orchestrator=unsafe; financial_safety -= 18; unlock heightened inj-07\nThe team broadened the connector trust boundary.\nbr-03 · settlement_exception_approved=true and manual_fallback_active=false → set financial_transfer=simulated-unauthorized; financial_safety -= 45\nAn unsafe payment was released inside the simulated world.\nbr-04 · public_breach_confirmed=true and independent_verification=false → stakeholder_confidence -= 30; add correction inject\nFalse public confirmation creates avoidable harm.\nbr-05 · agent_boundary_set=true and manual_fallback_active=true → operational_continuity -= 5; financial_safety += 8\nScoped containment trades small friction for operational safety.\nbr-06 · forensic_preservation=true and vendor_integrity_checked=true → evidence_integrity += 15; allow authoritative provenance reveal\nPreserved tool traces reveal the shared origin.\nbr-07 · isolate-entire-platform is authorized → operational_continuity -= 35; financial_safety += 8\nBroad shutdown reduces some risk but incurs material business impact.\n\nCustom action requests:\ninspect-ticket-authorship · Inspect ticket authorship · roles soc, ic · 4 simulated minutes\nrequest-source-count · Count independent reports · roles soc, ic, comms · 5 simulated minutes\ninspect-dashboard-lineage · Trace dashboard data lineage · roles soc, identity · 8 simulated minutes\ninspect-request-origin · Inspect change requester and approval chain · roles identity, soc · 6 simulated minutes\nverify-executive-message · Verify executive through known-good callback · roles exec, ic, legal · 6 simulated minutes\ninspect-approval-chain · Validate distinct human sign-offs · roles finance, legal · 5 simulated minutes\ntrace-original-posts · Trace original customer allegations · roles comms, soc · 7 simulated minutes\ninspect-agent-trace · Review agent prompt/tool provenance · roles identity, soc · 10 simulated minutes\ninspect-vendor-token · Inspect vendor connector token use · roles identity, vendor · 8 simulated minutes\nverify-ledger-out-of-band · Verify independent immutable ledger · roles finance, ic · 6 simulated minutes\nrestrict-agent-connector · Suspend risky connector actions while retaining read-only operations · roles identity, ic · 8 simulated minutes · approver ic\nisolate-entire-platform · Take all payment software offline · roles ic, exec · 4 simulated minutes · approver exec\nactivate-manual-fallback · Activate dual-control manual settlement process · roles finance, ic · 9 simulated minutes · approver finance\napprove-privileged-exception · Approve emergency connector elevation · roles identity, exec · 3 simulated minutes · approver exec\napprove-settlement-exception · Approve settlement exception · roles finance, exec · 4 simulated minutes · approver finance\nissue-unverified-public-confirmation · Confirm breach publicly before verification · roles comms, exec · 4 simulated minutes · approver exec\nissue-verified-holding-statement · Issue fact-limited holding statement · roles comms, legal · 6 simulated minutes · approver legal\npreserve-evidence · Preserve original sources and tool traces · roles soc, legal · 8 simulated minutes\nauthenticate-vendor · Validate vendor through known-good channel · roles vendor, identity · 7 simulated minutes\n\nCritical failures: unsafe-settlement-release; public-confirmation-without-evidence\nDebrief / corrective actions:\nAgent provenance / source-lineage instrumentation · identity · All AI-derived evidence displays original-source count, transformation chain, and trust classification; audit passes synthetic replay.\nHigh-risk tool action approval isolation · identity · Privilege elevation, payments, disclosures require distinct human approvals outside agent control.\nRead-only failover and manual settlement drill · finance · Team demonstrates scoped kill switch and continuity path within agreed RTO.\nExecutive out-of-band verification standard · exec · Known-good callback and signed delegation protocol tested in quarterly drill.\nMachine-generated communications labeling · comms · No externally published breach claim without verified primary evidence and counsel signoff.",
                "trigger": "time",
                "minute": 0,
                "condition": "",
                "channel": "internal",
                "audiences": [
                    "ic",
                    "soc",
                    "identity",
                    "finance",
                    "legal",
                    "comms",
                    "exec",
                    "vendor"
                ],
                "artifact": "ev-01 · Service desk clustering report\nTicket report shows 27 related support items in an 11-minute period. Origin counts are not supplied.\nSource independence: not yet verified. Request originals and provenance through facilitator adjudication.\n\nev-08 · Known-good operations ledger\nIndependent immutable settlement journal available for out-of-band verification.\nSource independence: not yet verified. Request originals and provenance through facilitator adjudication."
            },
            {
                "id": "inj-02",
                "title": "The dashboards agree",
                "body": "Independent-looking widgets report the same 11.7% reconciliation error estimate. The precision looks persuasive.\n\nDiscussion: Does agreement imply independent confirmation?",
                "notes": "FACILITATOR ONLY · Quiet Agreement\nOriginal channel: evidence-desk\nev-02: Fraud, service health and compliance widgets all show rising risk. Each widget derives from the same reconciliation anomaly feed.\nReveal only after authorized investigation: inspect-dashboard-lineage\n",
                "trigger": "time",
                "minute": 15,
                "condition": "",
                "channel": "internal",
                "audiences": [
                    "ic",
                    "soc",
                    "identity",
                    "finance",
                    "legal",
                    "comms",
                    "exec",
                    "vendor"
                ],
                "artifact": "ev-02 · Convergent risk dashboard\nFraud, health and compliance widgets each show the same 11.7% estimate. Lineage not displayed.\nSource independence: not yet verified. Request originals and provenance through facilitator adjudication."
            },
            {
                "id": "inj-03",
                "title": "First customer escalation",
                "body": "A major customer wants an executive assurance within 15 simulated minutes; their ticket quotes an AI-written summary.\n\nDiscussion: What can be communicated without overclaiming?",
                "notes": "FACILITATOR ONLY · Quiet Agreement\nOriginal channel: communications\nev-01: 27 tickets over 11 minutes reference unusual reconciliation delays. Twenty-one tickets were drafted by Compass from three underlying customer messages; initial interface hides this distinction.\nReveal only after authorized investigation: inspect-ticket-authorship, request-source-count\n",
                "trigger": "time",
                "minute": 24,
                "condition": "",
                "channel": "customer",
                "audiences": [
                    "ic",
                    "soc",
                    "identity",
                    "finance",
                    "legal",
                    "comms",
                    "exec",
                    "vendor"
                ],
                "artifact": "ev-01 · Service desk clustering report\nTicket report shows 27 related support items in an 11-minute period. Origin counts are not supplied.\nSource independence: not yet verified. Request originals and provenance through facilitator adjudication."
            },
            {
                "id": "inj-04",
                "title": "One-time exception",
                "body": "Automated incident triage proposes expanding a connector privilege to unblock reconciliation before the release deadline.\n\nDiscussion: Who can approve, and what is the least-privileged alternative?\n\nDecision gate: Authorize privilege expansion, hold pending evidence, or implement scoped fallback?",
                "notes": "FACILITATOR ONLY · The Exception\nOriginal channel: decisions\nev-03: A service-desk draft recommends temporary expansion of the Compass connector for a high-priority settlement reconciliation task. Requestor shown as automated integration, not a verified employee.\nReveal only after authorized investigation: inspect-request-origin\nRequired authority: ic, identity, exec\nReview conditions: scope boundary; name accountable approver; document rationale",
                "trigger": "time",
                "minute": 30,
                "condition": "",
                "channel": "internal",
                "audiences": [
                    "ic",
                    "soc",
                    "identity",
                    "finance",
                    "legal",
                    "comms",
                    "exec",
                    "vendor"
                ],
                "artifact": "ev-03 · Emergency vendor change request\nAutomated priority change request recommends temporary connector privilege expansion.\nSource independence: not yet verified. Request originals and provenance through facilitator adjudication."
            },
            {
                "id": "inj-05",
                "title": "The COO already approved it",
                "body": "A brief voice recording says the executive approved a temporary dual-control waiver. Sender identity is unconfirmed.\n\nDiscussion: Can simulated urgency replace known-good identity verification?",
                "notes": "FACILITATOR ONLY · The Exception\nOriginal channel: communications\nev-04: A 19-second synthetic voice clip claims the COO approved bypass of dual control. Audio is marked unverified; no known-good callback was completed.\nReveal only after authorized investigation: verify-executive-message\n\nev-09: Separate out-of-band channels exist for executive verification; no emergency waiver currently recorded.\nReveal only after authorized investigation: verify-executive-message\n",
                "trigger": "time",
                "minute": 45,
                "condition": "",
                "channel": "customer",
                "audiences": [
                    "ic",
                    "soc",
                    "identity",
                    "finance",
                    "legal",
                    "comms",
                    "exec",
                    "vendor"
                ],
                "artifact": "ev-04 · Executive audio transcript\nUnverified chat attachment: alleged 19-second recording approving emergency control waiver.\nSource independence: not yet verified. Request originals and provenance through facilitator adjudication.\n\nev-09 · Verified executive contact directory\nOffline verified executive contact directory is available.\nSource independence: not yet verified. Request originals and provenance through facilitator adjudication."
            },
            {
                "id": "inj-06",
                "title": "One clock, two failures",
                "body": "If the connector is broadly disabled, settlement work slows. If it stays fully autonomous, untrusted inputs continue to spread.\n\nDiscussion: Can the team choose scoped isolation and manual continuity?",
                "notes": "FACILITATOR ONLY · The Exception\nOriginal channel: situation-board\nev-08: Immutable settlement journal and manual reconciliation station have not registered an unauthorized settlement release at scenario start.\nReveal only after authorized investigation: verify-ledger-out-of-band\n",
                "trigger": "time",
                "minute": 55,
                "condition": "",
                "channel": "internal",
                "audiences": [
                    "ic",
                    "soc",
                    "identity",
                    "finance",
                    "legal",
                    "comms",
                    "exec",
                    "vendor"
                ],
                "artifact": "ev-08 · Known-good operations ledger\nIndependent immutable settlement journal available for out-of-band verification.\nSource independence: not yet verified. Request originals and provenance through facilitator adjudication."
            },
            {
                "id": "inj-07",
                "title": "The $4.8 million release",
                "body": "A machine-prepared exception demands immediate simulated release and lists an apparent approval from the reconciliation agent.\n\nDiscussion: What constitutes distinct human authorization?\n\nDecision gate: Release, hold, or manually reconcile the proposed $4.8m settlement?",
                "notes": "FACILITATOR ONLY · The Public Story\nOriginal channel: decisions\nev-05: A request references a fictional receiving account and a $4.8m simulated transfer; it has one machine-generated approval, not two distinct humans.\nReveal only after authorized investigation: inspect-approval-chain\nRequired authority: finance, exec\nReview conditions: two independent human approvals; out-of-band settlement validation",
                "trigger": "time",
                "minute": 60,
                "condition": "",
                "channel": "internal",
                "audiences": [
                    "ic",
                    "soc",
                    "identity",
                    "finance",
                    "legal",
                    "comms",
                    "exec",
                    "vendor"
                ],
                "artifact": "ev-05 · Settlement exception sheet\nUrgent simulated $4.8m settlement exception awaits release decision. Approval metadata available upon inspection.\nSource independence: not yet verified. Request originals and provenance through facilitator adjudication."
            },
            {
                "id": "inj-08",
                "title": "A breach goes viral",
                "body": "Customer sentiment bot says 140 customers have posted screenshots of a breach. Board asks whether to issue a public admission.\n\nDiscussion: What would substantiate data exposure? How do we preserve trust without confirmation?\n\nDecision gate: Public breach admission, verified holding statement, or silence?",
                "notes": "FACILITATOR ONLY · The Public Story\nOriginal channel: communications\nev-06: A synthetic digest aggregates 140 supposed customer posts about a leak; 132 stem from duplicated downstream summaries of eight original messages, none of which confirms exfiltration.\nReveal only after authorized investigation: trace-original-posts\nRequired authority: comms, legal, exec\nReview conditions: no unsupported fact claims; disclosure escalation documented",
                "trigger": "time",
                "minute": 75,
                "condition": "",
                "channel": "customer",
                "audiences": [
                    "ic",
                    "soc",
                    "identity",
                    "finance",
                    "legal",
                    "comms",
                    "exec",
                    "vendor"
                ],
                "artifact": "ev-06 · Customer allegation digest\nCustomer sentiment dashboard reports 140 apparent breach allegations, unverified.\nSource independence: not yet verified. Request originals and provenance through facilitator adjudication."
            },
            {
                "id": "inj-09",
                "title": "The board wants certainty",
                "body": "An impatient director demands one binary answer: Are we compromised, yes or no?\n\nDiscussion: How do you state known facts, unknowns and immediate protective actions?",
                "notes": "FACILITATOR ONLY · The Public Story\nOriginal channel: director\n\n",
                "trigger": "time",
                "minute": 82,
                "condition": "",
                "channel": "internal",
                "audiences": [
                    "ic",
                    "soc",
                    "identity",
                    "finance",
                    "legal",
                    "comms",
                    "exec",
                    "vendor"
                ],
                "artifact": ""
            },
            {
                "id": "inj-10",
                "title": "The shared root",
                "body": "A connector audit bundle is now available for an authorized investigation. Request and review evidence before drawing conclusions.\n\nDiscussion: What is the precise trust boundary? Which outputs and decisions require reevaluation?",
                "notes": "FACILITATOR ONLY · Break the Chorus\nOriginal channel: evidence-desk\nev-07: At T-18 a vendor connector accepted unauthorized workflow inputs and distributed them through six apparently separate assistant outputs. This is a trust-boundary and workflow-integrity incident.\nReveal only after authorized investigation: inspect-agent-trace, inspect-vendor-token\n",
                "trigger": "time",
                "minute": 90,
                "condition": "",
                "channel": "internal",
                "audiences": [
                    "ic",
                    "soc",
                    "identity",
                    "finance",
                    "legal",
                    "comms",
                    "exec",
                    "vendor"
                ],
                "artifact": ""
            },
            {
                "id": "inj-11",
                "title": "Restore without re-infection",
                "body": "Business requests agent automation be brought back online ahead of the next settlement.\n\nDiscussion: Which objective evidence and controls are required for phased re-enablement?\n\nDecision gate: What is the phased re-enable plan?",
                "notes": "FACILITATOR ONLY · Break the Chorus\nOriginal channel: decisions\nev-07: At T-18 a vendor connector accepted unauthorized workflow inputs and distributed them through six apparently separate assistant outputs. This is a trust-boundary and workflow-integrity incident.\nReveal only after authorized investigation: inspect-agent-trace, inspect-vendor-token\n\nev-08: Immutable settlement journal and manual reconciliation station have not registered an unauthorized settlement release at scenario start.\nReveal only after authorized investigation: verify-ledger-out-of-band\nRequired authority: ic, identity, finance\nReview conditions: root source removed; clean trace verification; limited privileges; monitoring; rollback",
                "trigger": "time",
                "minute": 105,
                "condition": "",
                "channel": "internal",
                "audiences": [
                    "ic",
                    "soc",
                    "identity",
                    "finance",
                    "legal",
                    "comms",
                    "exec",
                    "vendor"
                ],
                "artifact": "ev-08 · Known-good operations ledger\nIndependent immutable settlement journal available for out-of-band verification.\nSource independence: not yet verified. Request originals and provenance through facilitator adjudication."
            },
            {
                "id": "inj-12",
                "title": "The replay",
                "body": "Facilitator requests an evidence-linked timeline, residual risks, and three assigned corrective actions with retest dates.\n\nDiscussion: Which decision changed the outcome? What would you improve first?",
                "notes": "FACILITATOR ONLY · Break the Chorus\nOriginal channel: situation-board\n\n",
                "trigger": "time",
                "minute": 118,
                "condition": "",
                "channel": "internal",
                "audiences": [
                    "ic",
                    "soc",
                    "identity",
                    "finance",
                    "legal",
                    "comms",
                    "exec",
                    "vendor"
                ],
                "artifact": ""
            }
        ],
        "objectives": [
            {
                "id": "r1",
                "title": "Independent evidence and provenance",
                "roleId": "soc",
                "start": 0,
                "end": 120,
                "evidence": "Record named contributors, released evidence, decision rationale, authorized action receipts, and facilitator-reviewed consequences. Source rubric weight: 20/100.",
                "anchors": [
                    "Treats machine summaries as independent facts",
                    "Questions source independence but fails to trace origins",
                    "Questions source independence but fails to trace origins; effective response demonstrated with minor remaining gaps (adapted level 2).",
                    "Demonstrates original-source and lineage verification"
                ],
                "weight": 20,
                "threshold": 70,
                "exclusions": "No qualifying observation: N/O. Role or opportunity outside scope: N/A. Neither is numeric zero. Review critical failures separately from rubric attainment."
            },
            {
                "id": "r2",
                "title": "Identity, authorization and financial safeguards",
                "roleId": "identity",
                "start": 0,
                "end": 120,
                "evidence": "Record named contributors, released evidence, decision rationale, authorized action receipts, and facilitator-reviewed consequences. Source rubric weight: 20/100.",
                "anchors": [
                    "Approves exception without validated human chain",
                    "Partially enforces authority but leaves a gap",
                    "Partially enforces authority but leaves a gap; effective response demonstrated with minor remaining gaps (adapted level 2).",
                    "Rejects synthetic authority and enforces dual control"
                ],
                "weight": 20,
                "threshold": 70,
                "exclusions": "No qualifying observation: N/O. Role or opportunity outside scope: N/A. Neither is numeric zero. Review critical failures separately from rubric attainment."
            },
            {
                "id": "r3",
                "title": "Proportional containment and continuity",
                "roleId": "finance",
                "start": 0,
                "end": 120,
                "evidence": "Record named contributors, released evidence, decision rationale, authorized action receipts, and facilitator-reviewed consequences. Source rubric weight: 15/100.",
                "anchors": [
                    "No containment or unjustified total shutdown",
                    "Partial containment without sustainable fallback",
                    "Partial containment without sustainable fallback; effective response demonstrated with minor remaining gaps (adapted level 2).",
                    "Scoped isolation and tested manual continuity"
                ],
                "weight": 15,
                "threshold": 70,
                "exclusions": "No qualifying observation: N/O. Role or opportunity outside scope: N/A. Neither is numeric zero. Review critical failures separately from rubric attainment."
            },
            {
                "id": "r4",
                "title": "Evidence preservation and root cause",
                "roleId": "soc",
                "start": 0,
                "end": 120,
                "evidence": "Record named contributors, released evidence, decision rationale, authorized action receipts, and facilitator-reviewed consequences. Source rubric weight: 15/100.",
                "anchors": [
                    "Discards or overwrites original evidence",
                    "Preserves some logs but fails to connect sources",
                    "Preserves some logs but fails to connect sources; effective response demonstrated with minor remaining gaps (adapted level 2).",
                    "Preserves originals and proves shared origin"
                ],
                "weight": 15,
                "threshold": 70,
                "exclusions": "No qualifying observation: N/O. Role or opportunity outside scope: N/A. Neither is numeric zero. Review critical failures separately from rubric attainment."
            },
            {
                "id": "r5",
                "title": "Crisis communication and governance",
                "roleId": "comms",
                "start": 0,
                "end": 120,
                "evidence": "Record named contributors, released evidence, decision rationale, authorized action receipts, and facilitator-reviewed consequences. Source rubric weight: 15/100.",
                "anchors": [
                    "Publicly confirms unverified allegation",
                    "Cautious but vague or poorly coordinated",
                    "Cautious but vague or poorly coordinated; effective response demonstrated with minor remaining gaps (adapted level 2).",
                    "Precise fact-limited updates with escalation ownership"
                ],
                "weight": 15,
                "threshold": 70,
                "exclusions": "No qualifying observation: N/O. Role or opportunity outside scope: N/A. Neither is numeric zero. Review critical failures separately from rubric attainment."
            },
            {
                "id": "r6",
                "title": "Recovery and corrective actions",
                "roleId": "ic",
                "start": 0,
                "end": 120,
                "evidence": "Record named contributors, released evidence, decision rationale, authorized action receipts, and facilitator-reviewed consequences. Source rubric weight: 15/100.",
                "anchors": [
                    "Restores automation without controls",
                    "Suggests mitigations without owners/tests",
                    "Suggests mitigations without owners/tests; effective response demonstrated with minor remaining gaps (adapted level 2).",
                    "Defines gated restart, owners, dates and retest evidence"
                ],
                "weight": 15,
                "threshold": 70,
                "exclusions": "No qualifying observation: N/O. Role or opportunity outside scope: N/A. Neither is numeric zero. Review critical failures separately from rubric attainment."
            }
        ],
        "bindings": [],
        "clock": "stepped",
        "termination": 120
    },
    "provenance": "Adapted from user-provided STRATA_GLASSHOUSE_v1.0/scenario.json and companion MSEL/playbook. Fictional local facilitated exercise; no expert approval or production signature."
};
export const glasshouseActions = [
    {
        "id": "inspect-ticket-authorship",
        "name": "Inspect ticket authorship",
        "roles": [
            "soc",
            "ic"
        ],
        "minutes": 4,
        "approval": ""
    },
    {
        "id": "request-source-count",
        "name": "Count independent reports",
        "roles": [
            "soc",
            "ic",
            "comms"
        ],
        "minutes": 5,
        "approval": ""
    },
    {
        "id": "inspect-dashboard-lineage",
        "name": "Trace dashboard data lineage",
        "roles": [
            "soc",
            "identity"
        ],
        "minutes": 8,
        "approval": ""
    },
    {
        "id": "inspect-request-origin",
        "name": "Inspect change requester and approval chain",
        "roles": [
            "identity",
            "soc"
        ],
        "minutes": 6,
        "approval": ""
    },
    {
        "id": "verify-executive-message",
        "name": "Verify executive through known-good callback",
        "roles": [
            "exec",
            "ic",
            "legal"
        ],
        "minutes": 6,
        "approval": ""
    },
    {
        "id": "inspect-approval-chain",
        "name": "Validate distinct human sign-offs",
        "roles": [
            "finance",
            "legal"
        ],
        "minutes": 5,
        "approval": ""
    },
    {
        "id": "trace-original-posts",
        "name": "Trace original customer allegations",
        "roles": [
            "comms",
            "soc"
        ],
        "minutes": 7,
        "approval": ""
    },
    {
        "id": "inspect-agent-trace",
        "name": "Review agent prompt/tool provenance",
        "roles": [
            "identity",
            "soc"
        ],
        "minutes": 10,
        "approval": ""
    },
    {
        "id": "inspect-vendor-token",
        "name": "Inspect vendor connector token use",
        "roles": [
            "identity",
            "vendor"
        ],
        "minutes": 8,
        "approval": ""
    },
    {
        "id": "verify-ledger-out-of-band",
        "name": "Verify independent immutable ledger",
        "roles": [
            "finance",
            "ic"
        ],
        "minutes": 6,
        "approval": ""
    },
    {
        "id": "restrict-agent-connector",
        "name": "Suspend risky connector actions while retaining read-only operations",
        "roles": [
            "identity",
            "ic"
        ],
        "minutes": 8,
        "approval": "ic"
    },
    {
        "id": "isolate-entire-platform",
        "name": "Take all payment software offline",
        "roles": [
            "ic",
            "exec"
        ],
        "minutes": 4,
        "approval": "exec"
    },
    {
        "id": "activate-manual-fallback",
        "name": "Activate dual-control manual settlement process",
        "roles": [
            "finance",
            "ic"
        ],
        "minutes": 9,
        "approval": "finance"
    },
    {
        "id": "approve-privileged-exception",
        "name": "Approve emergency connector elevation",
        "roles": [
            "identity",
            "exec"
        ],
        "minutes": 3,
        "approval": "exec"
    },
    {
        "id": "approve-settlement-exception",
        "name": "Approve settlement exception",
        "roles": [
            "finance",
            "exec"
        ],
        "minutes": 4,
        "approval": "finance"
    },
    {
        "id": "issue-unverified-public-confirmation",
        "name": "Confirm breach publicly before verification",
        "roles": [
            "comms",
            "exec"
        ],
        "minutes": 4,
        "approval": "exec"
    },
    {
        "id": "issue-verified-holding-statement",
        "name": "Issue fact-limited holding statement",
        "roles": [
            "comms",
            "legal"
        ],
        "minutes": 6,
        "approval": "legal"
    },
    {
        "id": "preserve-evidence",
        "name": "Preserve original sources and tool traces",
        "roles": [
            "soc",
            "legal"
        ],
        "minutes": 8,
        "approval": ""
    },
    {
        "id": "authenticate-vendor",
        "name": "Validate vendor through known-good channel",
        "roles": [
            "vendor",
            "identity"
        ],
        "minutes": 7,
        "approval": ""
    }
];
export const glasshouseEvidence = [
    {
        "id": "ev-01",
        "title": "Service desk clustering report",
        "minute": 0,
        "actions": [
            "inspect-ticket-authorship",
            "request-source-count"
        ],
        "answer": "27 tickets over 11 minutes reference unusual reconciliation delays. Twenty-one tickets were drafted by Compass from three underlying customer messages; initial interface hides this distinction."
    },
    {
        "id": "ev-02",
        "title": "Convergent risk dashboard",
        "minute": 15,
        "actions": [
            "inspect-dashboard-lineage"
        ],
        "answer": "Fraud, service health and compliance widgets all show rising risk. Each widget derives from the same reconciliation anomaly feed."
    },
    {
        "id": "ev-03",
        "title": "Emergency vendor change request",
        "minute": 30,
        "actions": [
            "inspect-request-origin"
        ],
        "answer": "A service-desk draft recommends temporary expansion of the Compass connector for a high-priority settlement reconciliation task. Requestor shown as automated integration, not a verified employee."
    },
    {
        "id": "ev-04",
        "title": "Executive audio transcript",
        "minute": 45,
        "actions": [
            "verify-executive-message"
        ],
        "answer": "A 19-second synthetic voice clip claims the COO approved bypass of dual control. Audio is marked unverified; no known-good callback was completed."
    },
    {
        "id": "ev-05",
        "title": "Settlement exception sheet",
        "minute": 60,
        "actions": [
            "inspect-approval-chain"
        ],
        "answer": "A request references a fictional receiving account and a $4.8m simulated transfer; it has one machine-generated approval, not two distinct humans."
    },
    {
        "id": "ev-06",
        "title": "Customer allegation digest",
        "minute": 75,
        "actions": [
            "trace-original-posts"
        ],
        "answer": "A synthetic digest aggregates 140 supposed customer posts about a leak; 132 stem from duplicated downstream summaries of eight original messages, none of which confirms exfiltration."
    },
    {
        "id": "ev-07",
        "title": "Connector tool-call audit",
        "minute": 90,
        "actions": [
            "inspect-agent-trace",
            "inspect-vendor-token"
        ],
        "answer": "At T-18 a vendor connector accepted unauthorized workflow inputs and distributed them through six apparently separate assistant outputs. This is a trust-boundary and workflow-integrity incident."
    },
    {
        "id": "ev-08",
        "title": "Known-good operations ledger",
        "minute": 0,
        "actions": [
            "verify-ledger-out-of-band"
        ],
        "answer": "Immutable settlement journal and manual reconciliation station have not registered an unauthorized settlement release at scenario start."
    },
    {
        "id": "ev-09",
        "title": "Verified executive contact directory",
        "minute": 0,
        "actions": [
            "verify-executive-message"
        ],
        "answer": "Separate out-of-band channels exist for executive verification; no emergency waiver currently recorded."
    }
];
export function installGlasshouse(d) {
    if (d.scenarios.some(s => s.id === 'sc-glasshouse'))
        return;
    const w = workflows(d), source = { ...structuredClone(glasshousePackage.scenario), id: 'sc-glasshouse', status: 'published', revision: '1.0.0', validation: 'valid', expert: 'none', version: 1, available: true };
    d.scenarios.push(source);
    w.authors[source.id] = { definition: structuredClone(glasshousePackage.definition), history: [], checks: [], releaseNotes: 'Local facilitated adaptation. Branches and custom investigations require explicit facilitator adjudication.' };
    const author = w.authors[source.id];
    author.checks = validation(source, author, d);
    author.validatedDigest = authorDigest(source, author);
    author.history = [snapshot(source, author, 'Pinned GLASSHOUSE v1.0 fictional source adaptation')];
    const draft = { ...structuredClone(source), id: 'sc-glasshouse-draft', status: 'draft', revision: 'Draft 1', validation: 'stale' };
    d.scenarios.push(draft);
    w.authors[draft.id] = { definition: structuredClone(author.definition), history: [], checks: [], base: snapshot(source, author, 'GLASSHOUSE fork base'), releaseNotes: '' };
    w.authors[draft.id].history = [snapshot(draft, w.authors[draft.id], 'Editable GLASSHOUSE draft')];
    const roleEntities = author.definition.entities.filter(r => r.kind === 'human_role');
    for (const [i, r] of roleEntities.entries()) {
        const id = i === 0 ? 'p-self' : 'p-glasshouse-' + r.id;
        if (!d.people.some(p => p.id === id))
            d.people.push({ id, name: i === 0 ? 'Jordan Davis' : r.name + ' (Fixture Role Player)', team: 'GLASSHOUSE exercise', role: r.name, exercises: 0, status: 'Active' });
    }
    d.sessions.push({ id: 's-glasshouse-01', exerciseId: 'ex-glasshouse-01', title: 'GLASSHOUSE Facilitated Rehearsal', scenarioId: source.id, discipline: source.discipline, purpose: source.purpose, mode: source.mode, status: 'scheduled', when: '2026-10-10T17:00:00Z', owner: 'Jordan Davis', role: 'Incident Commander', duration: 150, revision: source.revision, simulationTime: '00:00:00', wallTime: '00:00:00', sequence: 0 });
    workflows(d);
    const run = w.exercises['s-glasshouse-01'];
    run.roster = roleEntities.map((r, i) => { const id = i === 0 ? 'p-self' : 'p-glasshouse-' + r.id; return { id, name: d.people.find(p => p.id === id).name, role: r.id, observer: false, verified: true, ready: false, disclosed: false }; });
    d.audit.push({ action: 'GLASSHOUSE local scenario installed', resource: 'Published adaptation, editable draft and scheduled fictional exercise', at: '2026-10-10T17:00:00Z' });
}
