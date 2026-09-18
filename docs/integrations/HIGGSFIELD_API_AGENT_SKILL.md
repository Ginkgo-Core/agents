# Higgsfield API as a governed AI Employee skill/binding

Status: architecture decision / implementation specification  
Lifecycle target: FEATURE -> PROTOTYPE -> VALIDATED -> INTEGRATED -> PRODUCTION

## Decision

Higgsfield API is integrated as an **internal provider binding behind provider-agnostic creative capabilities**.

AI Employees MUST NOT call Higgsfield directly and MUST NOT choose provider, model endpoint, credential or raw workflow.

Canonical public capabilities remain:

- `creative.image.cloud`
- `creative.video.cloud`

Internal implementation candidates may include:

- `higgsfield-api.image.generate`
- `higgsfield-api.video.generate`

These are internal bindings, not public capabilities.

## Canonical flow

```text
LEAF AI Employee / Agent Room
  -> CapabilityRequest v1
  -> Capability Bus
  -> Domain Router
  -> skill/version
  -> provider binding: higgsfield-api.*
  -> policy + lifecycle + budget admission
  -> RuntimeExecutionRequest
  -> Executor Router
  -> n8n
  -> governed Higgsfield adapter
  -> Higgsfield API
  -> normalized execution result
  -> CapabilityResult v1 + Evidence + usage/cost
  -> AI Employee / Agent Room
```

The architectural split is mandatory:

```text
AI Employee = caller
Runtime = authority
Domain Router = implementation selection
n8n = executor/orchestrator
Higgsfield API = provider
LEAF = product/control plane + operational memory
```

n8n does not become the source of truth, provider router or policy authority.

## Why this design

Higgsfield should behave like a replaceable engine behind the Ginkgo Runtime.

The value owned by Ginkgo is not the raw generation endpoint. It is the governed system around it:

- AI Employee intent and permissions;
- capability contracts;
- organization policy;
- budget and credits;
- routing;
- reusable workflows;
- brand context;
- campaign context;
- evidence;
- observability;
- retries/idempotency;
- asset provenance;
- distribution and feedback loops.

This also allows fal, ComfyUI/local, Gemini image, future video providers and other engines to coexist without changing the caller contract.

## Agent-facing contract

Agents request outcomes, not providers.

Example intent:

```text
Generate a 9:16 product ad using the approved brand kit,
10 seconds maximum, Portuguese voice, under the organization's
creative budget.
```

Allowed request dimensions may include:

- objective;
- channel;
- duration;
- aspect ratio;
- quality tier;
- references/assets;
- brand constraints;
- campaign metadata;
- maximum cost class where policy allows it.

Forbidden caller-controlled fields include:

- provider;
- provider endpoint;
- Higgsfield model ID;
- API key;
- credential ID/value;
- n8n workflow ID;
- internal adapter ID;
- fallback provider.

The Domain Router owns implementation resolution.

## Proposed internal bindings

### higgsfield-api.image.generate

Purpose: generate cloud images through the Higgsfield API when an eligible creative image capability route resolves to Higgsfield.

Initial lifecycle: `FEATURE`.

### higgsfield-api.video.generate

Purpose: generate cloud video through the Higgsfield API when an eligible creative video capability route resolves to Higgsfield.

Initial lifecycle: `FEATURE`.

Both bindings must remain `routing_eligible: false` and `production_eligible: false` until live validation evidence exists.

## n8n execution layer

Proposed workflows:

- `creative-image-cloud-v1`
- `creative-video-cloud-v1`

n8n responsibilities:

1. receive an already-authorized RuntimeExecutionRequest;
2. validate required normalized fields;
3. resolve only credential references available to the execution boundary;
4. call the governed Higgsfield adapter;
5. poll asynchronous provider jobs when required;
6. normalize provider status;
7. persist asset/job metadata through approved boundaries;
8. return only normalized output;
9. emit evidence/telemetry references.

n8n MUST NOT:

- choose Higgsfield because it is "preferred";
- silently fallback to another provider;
- expose API keys or raw provider errors;
- return raw provider payloads to callers;
- hold authoritative runtime state;
- bypass budget/policy/lifecycle gates.

## Adapter boundary

A Higgsfield adapter should translate Ginkgo's normalized creative contract into provider-specific requests and translate provider responses back into normalized results.

Provider-specific model IDs, endpoint paths and payload formats remain inside the adapter/binding layer.

This keeps:

```text
CAPABILITY != SKILL != BINDING != TOOL != ADAPTER != PROVIDER != EXECUTOR
```

## Cost and usage governance

Every cost-bearing generation should produce metering data:

- organization_id;
- workspace_id;
- agent_id;
- capability;
- internal binding reference;
- provider;
- model/provider SKU internally;
- estimated cost before execution when available;
- actual provider cost when available;
- Ginkgo credit debit;
- generated asset reference;
- request_id / execution_id;
- timestamps;
- success/failure category.

LEAF Ledger remains the product-side usage/credit authority.

Provider subscription access must never be inferred from a consumer subscription.

## Policy examples

The Runtime may consider internally:

- lifecycle eligibility;
- organization plan;
- credits/budget;
- quality requirement;
- image vs video;
- duration/resolution;
- latency requirements;
- reference-image support;
- audio requirements;
- privacy restrictions;
- provider availability;
- explicit organization allow/deny policy.

No agent or workflow receives authority to override these gates.

## Fallback

Default: `none`.

If fallback is later permitted, it must be explicit, same-semantics-only and policy-owned.

Example:

```text
creative.video.cloud
  -> route A: higgsfield-api.video.generate
  -> provider failure
  -> NO silent switch
  -> Runtime decides whether an approved same-semantics route may be retried
```

## OpenHiggsfield

The public OpenHiggsfield project is useful as:

- UI/UX reference;
- model catalog reference;
- provider parameter mapping reference;
- workflow inspiration.

It should not become a dependency or be copied into Ginkgo production until its licensing and reuse terms are explicitly verified.

The Ginkgo implementation should remain an independent governed integration around the official API.

## AI Employee examples

### Marketing Employee

Allowed capabilities:

- `creative.image.cloud`
- `creative.video.cloud`

Typical tasks:

- ad variants;
- Reels/TikTok assets;
- product shots;
- B-roll;
- campaign adaptations.

### Social Media Employee

May combine creative capabilities with publishing capabilities, but generation and publishing remain separate governed actions.

### Sales / SDR Employee

May request a personalized creative asset for an approved prospect/campaign without gaining direct access to the media provider.

## Promotion gates

### FEATURE

- contracts documented;
- no production execution;
- credential strategy defined;
- adapter interface defined.

### PROTOTYPE

- sandbox/dev API call succeeds;
- normalized request/response fixtures captured;
- cost metadata verified;
- failure mapping implemented.

### VALIDATED

- repeatable E2E tests;
- idempotency proven;
- timeout/polling behavior proven;
- secret leakage tests pass;
- cost accounting reconciles;
- provider errors normalized.

### INTEGRATED

- Runtime route decision resolves binding;
- n8n executor executes only authorized binding;
- Evidence emitted;
- LEAF usage ledger receives metering;
- agent permissions enforced.

### PRODUCTION

- real tenant isolation validated;
- quotas/kill switch operational;
- observability and alerts active;
- retry/fallback policy proven;
- billing reconciliation proven;
- security review complete.

## Implementation backlog

1. Define provider-binding manifests for image/video.
2. Define normalized creative request/result schema deltas if required.
3. Implement Higgsfield adapter.
4. Create n8n workflows for image/video execution.
5. Wire credential references through the governed secret boundary.
6. Add cost estimator and usage reconciliation.
7. Add Runtime routing/lifecycle tests.
8. Add LEAF AI Employee capability allowlists.
9. Add asset persistence/provenance.
10. Run E2E promotion evidence before enabling production routing.

## Non-goals

- cloning the Higgsfield product;
- exposing Higgsfield as a caller-facing provider selector;
- storing provider credentials in agent prompts;
- putting provider selection logic inside n8n;
- treating OpenHiggsfield as proof of licensing or production readiness.
