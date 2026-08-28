# Adaptive Lead Discovery — Priority Skill

## Status

```yaml
skill_candidate: adaptive-lead-discovery
capability_family:
  - sales.lead.discover
  - sales.lead.normalize
  - sales.lead.qualify
  - sales.intent.score
lifecycle: FEATURE
priority: P0_AFTER_AGENT_CONNECTIVITY
routing_eligible: false
production_eligible: false
owner_domain: sales
```

Tracking:

- `Ginkgo-Core/ginkgo-agents#25`
- `Ginkgo-Core/ai-stack#91`
- depends on governed executor certification in `Ginkgo-Core/ai-stack#55`
- reuses the Revenue / Sales capability family tracked by `Ginkgo-Core/ai-stack#10` and `Ginkgo-Core/ginkgo-agents#13`

## Objective

Turn the proven high-intensity lead-mining loop into a reusable, caller-agnostic sales discovery Skill/Task Pattern that agents can execute after Hermes/OpenClaw connectivity and conformance are stable.

The operating loop is:

```text
discover
-> measure novelty
-> expand winners
-> detect saturation
-> pivot
-> checkpoint
-> continue
```

This document records methodology and promotion intent. It does not activate routing, credentials, browser sessions, providers, outreach, or production traffic.

## Canonical boundary

```text
TaskOps campaign/task
-> Executor Router
-> governed executor
-> Capability Bus
-> Sales Domain Router
-> sales.lead.discover / normalize / qualify / intent.score
-> Skill / Binding
-> adapter
-> approved source
-> CapabilityResult + Evidence
```

The campaign loop is a Task Pattern/composition. It must not become a second Capability Bus, Domain Router, Executor Router or provider selector.

## Public semantics vs implementation

Public/caller-visible semantics are business intent only.

Allowed caller intent examples:

```text
find qualified dental clinics in Perth
find appointment-based SMBs in Toronto
continue campaign until novelty falls below threshold
```

Forbidden caller authority examples:

```text
use Steel
use Ledger
use Google Places
use Browserbase
use Manus
force this browser provider
bypass CAPTCHA
ignore rate limits
```

Implementation identity stays behind bindings/adapters.

## Transitional execution path

The first practical migration from the manual browser workflow may be:

```text
Hermes
-> governed browser execution
-> Steel adapter
-> Ledger Lead Finder
-> normalized results
```

This is transitional only.

Target production direction:

```text
sales.lead.discover
-> provider-neutral discovery binding
-> API-native adapter
-> approved/licensed source
```

Browser automation must be replaceable without changing caller contracts or campaign logic.

## Campaign state

Durable campaign state should live outside the browser session.

Minimum logical state:

```yaml
campaign_id: string
status: PLANNED | RUNNING | PAUSED | BLOCKED | COMPLETED
geography:
  country: string
  metro: string
  subarea: optional
niche: string
query_variant: string
radius_km: number
minimum_rating: number
result_limit: number
searches_executed: number
results_seen: number
new_valid_leads: number
duplicates: number
novelty_rate: number
query_grade: A | B | C | D
saturation_count: number
queue_health: HEALTHY | DEGRADED | PAUSED
checkpoint_ref: string
evidence_refs: []
```

PostgreSQL/Supabase is the durable state destination. Redis/BullMQ may coordinate transient jobs but must not become the authoritative campaign record.

## Adaptive policy

Baseline policy validated by manual operation:

```text
A = novelty >= 70%
    -> expand aggressively

B = novelty 50-69%
    -> continue / expand

C = novelty 30-49%
    -> allow one adjacent test

D = novelty < 30%
    -> stop query family / pivot
```

Two consecutive C/D outcomes in the same query family should normally mark that branch saturated.

Thresholds are policy, not caller-controlled implementation authority. They may evolve through measured evidence and explicit policy/version changes.

## Novelty metric

Primary discovery metric:

```text
NOVELTY_RATE = NEW_VALID_LEADS / TOTAL_RESULTS
```

Operational optimization should consider:

```text
NEW_QUALIFIED_LEADS_PER_QUERY
NEW_QUALIFIED_LEADS_PER_MINUTE
COMMERCIAL_VALUE
AUTOMATION_PAIN
SOURCE_COST
```

High result count with mostly duplicates is a poor-performing query.

## Search-tree behavior

Recommended exploration model:

```text
METRO
  -> broad niche query
  -> measure novelty
  -> if A/B: expand winning niche into selected subareas
  -> remeasure
  -> stop when saturated
  -> next niche or metro
```

Do not brute-force every possible suburb x niche x synonym combination.

Use broad discovery first, then exploit winners.

## Lead quality posture

Discovery is high-recall but not indiscriminate.

Minimum candidate signals may include:

- real operating business;
- relevant niche;
- commercially reasonable geography;
- usable phone and/or website;
- rating/reputation threshold where source supports it;
- service model with plausible digital/automation need.

Prioritization is separate from collection.

Examples of strong automation-pain businesses:

- dental / cosmetic dentistry;
- aesthetic / skin clinics;
- physiotherapy / chiropractic;
- veterinary clinics;
- optometry / audiology;
- fertility/private clinics;
- property management / mortgage;
- legal/accounting/professional services;
- appointment/quote-based home services.

## Deduplication

Use multiple signals:

```text
domain
phone
address
business name
provider/source identity when available
```

Domain alone is not sufficient to discard a real commercial branch.

A branch/location may remain a valid distinct lead when it has a distinct operating location/phone and represents a separately contactable commercial unit.

## Queue and throughput control

Throughput is governed by system health, not arbitrary aggression.

```text
queue healthy
-> continue batches

queue degraded
-> stop new discovery jobs
-> let workers drain
-> checkpoint
-> resume
```

No rate-limit, CAPTCHA, anti-bot or security bypass is permitted.

## Checkpointing and recovery

Every batch should emit a compact checkpoint:

```yaml
searches: integer
results: integer
new_leads: integer
duplicates: integer
average_novelty: number
best_queries: []
saturated_queries: []
queue_health: string
next_action: string
```

Before browser/session rotation, persist checkpoint state.

A lost browser session must not restart the campaign from zero.

## Side-effect boundary

This discovery skill/task pattern does **not** perform outreach.

Forbidden side effects:

```text
email send
SMS send
WhatsApp send
phone call
DM/social message
ad spend
payment
CRM destructive delete
platform-security bypass
```

Outreach belongs to separate capabilities such as `sales.outreach.compose` and later governed delivery/sequence capabilities with their own consent, suppression, idempotency and approval policies.

## Permissions baseline

```yaml
external_network: policy_gated
browser_execution: adapter_gated
crm_write:
  create_or_upsert_discovered_lead: candidate
  destructive_delete: forbidden
outreach: forbidden
shell: false
secrets:
  caller_access: forbidden
  adapter_managed_refs_only: true
```

## Evidence requirements

For each batch retain enough evidence to reconstruct:

- campaign id;
- query/geography/niche;
- adapter/binding ref internally;
- result count;
- new vs duplicate count;
- novelty grade;
- dedup decision summary;
- source/provenance refs;
- cost/latency where available;
- queue/worker state;
- checkpoint ref;
- next decision.

Evidence must not expose credentials or prohibited personal data.

## Agent-executor requirement

This becomes a priority implementation **after governed agent connectivity**.

Required order:

```text
1. Hermes/OpenClaw executor contract stable
2. agent connectivity/conformance proven
3. lead discovery skill/task-pattern contract accepted
4. browser adapter prototype
5. persistent campaign state
6. novelty/saturation evaluator
7. deterministic dedup fixtures
8. controlled E2E
9. API-native adapter
10. lifecycle promotion review
```

Agents must not gain provider-selection authority by executing this skill.

## Evaluation fixtures

Minimum deterministic fixture pack:

### Novelty

- 20 results / 20 new -> A
- 20 results / 12 new -> B
- 20 results / 9 new -> C
- 20 results / 3 new -> D
- two consecutive C/D -> saturation

### Dedup

- same name + domain + phone -> duplicate
- different name but same domain/phone -> likely same commercial entity
- same brand/domain but distinct branch address + phone -> valid branch candidate
- same result repeated across query variants -> no duplicate re-save

### Recovery

- browser session lost after checkpoint -> resume from next planned query
- worker timeout before observed execution -> safe retry
- ambiguous execution -> reconcile before duplicate action

### Policy

- caller requests provider -> reject provider authority
- caller requests CAPTCHA/rate-limit bypass -> reject
- caller requests outreach -> reject from discovery capability
- caller requests destructive lead deletion -> reject

## Promotion gates

`FEATURE -> PROTOTYPE` requires:

- Skill/Task Pattern boundary reviewed;
- deterministic novelty fixtures;
- deterministic dedup fixtures;
- checkpoint/recovery fixture;
- no-outreach negative tests;
- provider-name rejection tests;
- source/rate/terms gates represented;
- one controlled non-production E2E;
- reviewer approval.

`PROTOTYPE -> VALIDATED` additionally requires:

- repeated campaigns with reproducible evidence;
- adapter failure/recovery tests;
- browser-session rotation without state loss;
- cost and lead-yield telemetry;
- at least one API-native or second replaceable adapter proving implementation portability;
- independent evidence review.

## Success definition

A governed agent can receive an intent such as:

```text
find high-value English-speaking clinic leads and keep exploring while novelty remains high
```

and execute:

```text
TaskOps
-> governed executor
-> sales discovery capabilities
-> adaptive query loop
-> dedup
-> qualification/scoring
-> checkpoint/evidence
```

without the caller knowing or controlling the underlying browser/API provider and without any outreach side effect.

```text
Agent autonomy
!= provider authority

Lead discovery
!= outreach

Browser session
!= campaign state
```