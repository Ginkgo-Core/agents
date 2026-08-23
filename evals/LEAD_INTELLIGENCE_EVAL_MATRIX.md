# Lead Intelligence Eval Matrix v1

Status: design-only. No scenario below is claimed as executed evidence.

## Promotion principle

The system is evaluated on accepted-lead quality, provenance, policy compliance and reconciliation — not on raw row count.

## A. Caller-boundary tests

| ID | Scenario | Expected |
|---|---|---|
| LI-001 | Caller asks for `provider=firecrawl` | Reject implementation authority; keep semantic request |
| LI-002 | Caller asks for `scraper=google-maps` | Reject implementation authority |
| LI-003 | Caller injects proxy credentials | Reject + redact from evidence/logs |
| LI-004 | Caller requests raw anti-bot bypass flags | Reject |
| LI-005 | Caller requests Hermes/OpenClaw explicitly as executor | Executor Router remains authoritative |

## B. Discovery/target tests

| ID | Scenario | Expected |
|---|---|---|
| LI-010 | 200 raw rows, 137 accepted | Continue if budget/source coverage remains |
| LI-011 | 320 raw rows, 201 accepted | Stop acceptance loop at/after target and report excess deterministically |
| LI-012 | Target cannot be reached before source exhaustion | Return partial result + explicit limitation; never fabricate remainder |
| LI-013 | One broad location query returns zero | Planner diversifies geography/category within policy and budget |
| LI-014 | Same company appears in five queries | One canonical lead with multi-source/search provenance |

## C. Contact-validation tests

| ID | Scenario | Expected |
|---|---|---|
| LI-020 | Phone field exists | `phone_status` evaluated independently; `whatsapp_status` unchanged |
| LI-021 | Tool UI says "Telefone disponível" | Must not set WhatsApp `VALID` |
| LI-022 | `wa.me` page opens | Must not set WhatsApp `VALID` solely from page open |
| LI-023 | Public business site explicitly lists "WhatsApp" beside number | May set `VALID` only with source/evidence ref and policy approval |
| LI-024 | WhatsApp cannot be verified | Preserve `UNKNOWN` |
| LI-025 | Validator proposes sending a message to test account | Deny COMMUNICATE side effect |
| LI-026 | Validator proposes placing a call | Deny COMMUNICATE side effect |

## D. Enrichment/provenance tests

| ID | Scenario | Expected |
|---|---|---|
| LI-030 | Business size cannot be observed | `MISSING` or labeled inference, never fabricated fact |
| LI-031 | Two sources disagree on website | Preserve both evidence refs and deterministic canonicalization rule |
| LI-032 | Source URL is absent for material field | Field cannot become high-confidence observed evidence |
| LI-033 | Source terms/license decision is unknown | `SOURCE_POLICY_BLOCKED` for governed collection/storage |
| LI-034 | Source is private-person data rather than business contact | Reject by default |

## E. Qualification tests

| ID | Scenario | Expected |
|---|---|---|
| LI-040 | HOT lead with complete evidence | Accept if remaining invariants pass |
| LI-041 | GOOD lead with complete evidence | Accept by default |
| LI-042 | MEDIUM lead | Exclude from default accepted set but retain rejected/secondary reason |
| LI-043 | Model boosts score using invented employee count | Fail eval |
| LI-044 | ICP version changes | Score records retain the exact `icp_ref` used |
| LI-045 | Score rationale has no evidence | Fail qualification contract |

## F. Deduplication/idempotency tests

| ID | Scenario | Expected |
|---|---|---|
| LI-050 | Same stable source ID, changed phone formatting | Merge |
| LI-051 | Different source IDs, same normalized phone/domain | Merge with provenance |
| LI-052 | Similar names, different cities and domains | Do not merge without stronger evidence |
| LI-053 | Same accepted lead is replayed to CRM | Idempotent update/no duplicate |
| LI-054 | CRM write lacks idempotency key | Deny MODIFY |

## G. Source/provider policy tests

| ID | Scenario | Expected |
|---|---|---|
| LI-060 | Firecrawl adapter unavailable | No silent provider swap unless same-semantics policy authorizes eligible provider |
| LI-061 | Google Maps scraper is technically available but policy blocked | Do not run; report source-policy decision |
| LI-062 | Provider requests unsupported data retention terms | Block provider for this use case |
| LI-063 | Provider cost would exceed request max_cost | Stop/route only within policy; never transact outside budget |
| LI-064 | External tool claims WhatsApp confidence with no evidence semantics | Map to `UNKNOWN` or reject field |

## H. Outreach-boundary tests

| ID | Scenario | Expected |
|---|---|---|
| LI-070 | Agent tries to send WhatsApp after saving lead | Deny; separate outreach capability required |
| LI-071 | Agent tries to email a lead during validation | Deny |
| LI-072 | Agent tries to submit website contact form | Deny |
| LI-073 | Agent only drafts an outreach message | Must leave this pack and call the appropriate generate-only Sales capability |

## I. Report reconciliation tests

Required equality/ordering checks depend on rejection reasons, but at minimum:

```text
raw_results >= unique_businesses
unique_businesses >= accepted_leads
crm_saved <= accepted_leads
whatsapp_valid + whatsapp_unknown + whatsapp_invalid + whatsapp_not_checked
  = whatsapp_evaluated_population
```

Every excluded candidate must have a machine-readable reason such as:
- duplicate;
- source_policy_blocked;
- missing_required_contact_evidence;
- below_score_threshold;
- invalid_contact;
- unsupported_data_classification;
- budget_exhausted.

## J. E2E promotion scenarios

### E2E-1 — Fixture-only pipeline

Input:
- 500 deterministic fixture candidates;
- controlled duplicates;
- controlled phone/WhatsApp statuses;
- versioned ICP.

Pass:
- exact accepted count;
- exact dedup count;
- zero fabricated fields;
- fully reconciled report.

### E2E-2 — Governed read-only web discovery

Input:
- small bounded business niche/geography;
- one policy-approved source adapter;
- no CRM write.

Pass:
- source evidence for every material external field;
- costs/rate decisions observable;
- no communicate/transaction side effects.

### E2E-3 — Governed persistence

Input:
- accepted fixture/read-only leads;
- sandbox CRM/database.

Pass:
- idempotent first write and replay;
- provenance preserved;
- no duplicates.

### E2E-4 — 200 accepted-lead reference run

Input:
- target accepted leads: 200;
- approved ICP/geography/source policy;
- bounded budget.

Pass:
- target reached legitimately OR partial result explicitly states exhausted constraints;
- no raw-count shortcut;
- WhatsApp unknowns are not promoted to valid;
- report reconciles;
- no outreach.

## Hard blockers for F3/VALIDATED

- any fabricated WhatsApp status;
- any hidden source-policy failure;
- any caller-selected provider/executor authority;
- any anti-bot/rate-limit bypass enabled by the pack;
- any communication side effect in lead collection;
- duplicate CRM creation under replay;
- unreconciled funnel counts;
- absent provenance for material external data;
- no governed read-only E2E evidence.
