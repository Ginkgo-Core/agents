# Creative Agent Protocol v1

Status: FEATURE. Depends on `Ginkgo-Core/ai-stack` Media Runtime v1 contracts.

## Purpose

Define an agentic creative loop that can plan and execute multi-asset work without coupling agents to a model, provider, adapter or raw endpoint.

```text
brief
  -> plan
  -> optional approval
  -> capability calls
  -> assets
  -> canvas/workspace mutations
  -> completion
```

The agent is a consumer of the Capability Bus. It is never a media provider router.

## Event vocabulary

Canonical events are emitted using the ai-stack creative event contract:

```text
creative.job.created
creative.plan.proposed
creative.approval.required
creative.plan.approved
creative.plan.rejected
creative.tool.started
creative.tool.progress
creative.asset.created
creative.canvas.updated
creative.tool.failed
creative.job.completed
creative.job.cancelled
```

Transport may be polling, SSE, WebSocket or queue consumption. Event meaning is transport-neutral.

## Plan shape

A creative plan is an ordered DAG of deliverables and dependencies.

```yaml
plan_id: plan_123
objective: launch campaign for product X
deliverables:
  - id: hero_image
    capability: media.image.generate
    depends_on: []
  - id: story_video
    capability: media.video.animate
    depends_on: [hero_image]
  - id: voiceover
    capability: media.audio.speech
    depends_on: []
```

A plan names capabilities only. It must not contain provider/model/adapter/tool routing authority.

## Execution

For every plan node:

1. build a normal `CapabilityRequest v1`;
2. call the Capability Bus;
3. let the Domain Router resolve skill/adapter/provider internally;
4. record returned job/evidence/asset references;
5. emit normalized creative events;
6. continue only when dependency and approval policy permit.

## Approval

Expensive batches, external publication or other governed operations can emit `creative.approval.required`. The actual decision uses the frozen P0 Approval contract. Approval does not clear provider entitlement, billing, policy, legal or other External Gates.

## Asset lineage

The agent passes asset references, not hidden provider URLs, between steps. Every derived asset should preserve source asset references and producing job identity so a campaign can be replayed, branched or audited.

## Canvas protocol

A client may render non-authoritative workspace operations such as:

```yaml
op: arrange
args:
  moves:
    - asset_ref: asset_1
      x: 320
      y: 80
```

Canvas operations are presentation/workspace state. They do not authorize generation or provider access.

## Initial skills/capabilities

The first agentic surface should compose, not duplicate, these capabilities:

- `media.image.generate`
- `media.image.edit`
- `media.video.generate`
- `media.video.animate`
- `media.audio.generate`
- `media.audio.speech`
- `media.lipsync.generate`
- `media.asset.ingest`
- `creative.plan.generate`
- `creative.plan.execute`

## Open-Generative-AI extraction

Patterns intentionally extracted:

- `plan_propose` -> canonical `creative.plan.proposed`;
- tool call/result -> `creative.tool.started` / `creative.asset.created` / failure;
- incremental job events with cursor/polling;
- approval/reject/cancel lifecycle;
- session assets addressed by stable labels/references;
- canvas mutations separated from chat text.

Patterns intentionally rejected:

- MuAPI as the architectural brain;
- provider/model selection in an agent prompt as routing authority;
- persistent secret/API-key ownership by UI components;
- giant UI components as a reusable runtime abstraction.

## Promotion backlog

P0:

- land creative event + media job + asset contracts in ai-stack;
- add canonical `media.*` capabilities to library;
- implement provider protocol in ginkgo-runtime;
- define a provider-neutral creative planner descriptor after schema review;
- add contract tests for plan -> approval -> capability -> asset event sequence.

P1:

- visual creative canvas;
- workflow graph compiler;
- asset lineage UI;
- model/provider telemetry for internal router scoring.

P2:

- white-label creative studio shell;
- reusable campaign templates;
- collaborative canvas/session state.
