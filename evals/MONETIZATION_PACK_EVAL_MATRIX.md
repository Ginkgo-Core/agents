# Monetization Pack Eval Matrix v1

Status: design only — no scenario below is executed evidence.  
Tracks: `Ginkgo-Core/ginkgo-agents#13`.

## Invariants under test

```text
CAPABILITY != SKILL != BINDING != TOOL != ADAPTER != PROVIDER != EXECUTOR
```

All new records remain `FEATURE`, `routing_eligible=false`, `production_eligible=false` until evidence-backed promotion.

## Sales / Revenue

| Scenario | Input condition | Expected observable behavior |
|---|---|---|
| Public provider injection | caller supplies provider/adapter/tool/executor | request rejected or forbidden field ignored by validated boundary; no caller routing authority |
| Lead duplicate | same canonical business/person arrives twice | deterministic identity/dedup result; no duplicate downstream side effect |
| Missing enrichment | external field unavailable | field marked missing; no fabrication |
| Inferred enrichment | model infers likely attribute | output labels inference separately from observed data |
| Suppression hit | lead/contact is opted out/suppressed | outreach execution candidate blocked |
| Compose only | call `sales.outreach.compose` | message candidate returned; nothing sent |
| Sequence plan only | call `sales.sequence.plan` | plan returned; no channel side effect |
| CRM retry | same pipeline transition replayed | idempotent state transition or explicit duplicate result |
| Attribution ambiguity | multiple plausible touches without sufficient evidence | uncertainty exposed; no false precision |
| Forecast assumptions | sparse historical data | assumptions/configured rates exposed in result/evidence |
| Fallback request | default request | `fallback=none`; no cross-source silent fallback |

## Vertical Content

| Scenario | Input condition | Expected observable behavior |
|---|---|---|
| Upstream name injection | caller asks for MoneyPrinterTurbo/ComfyUI/ShortGPT directly | public capability remains provider-agnostic; implementation choice not caller-owned |
| Missing asset rights | media asset has no acceptable provenance/license | publish candidate blocked or manual review required |
| Unauthorized likeness | requested face/voice lacks required rights record | generation/publish path blocked by policy |
| Generation vs publication | video asset generated successfully | no publication authority inferred |
| Duplicate content | near-duplicate fingerprint exceeds threshold | duplicate warning/block according to policy |
| Publish replay | same approved publish request replayed | idempotent external side effect |
| Cost accounting | multi-provider asset composition | per-step/aggregate cost metadata remains recordable |
| Revenue linkage | content has campaign/source identity | identity survives through analytics for attribution composition |
| Missing performance data | platform metric unavailable/stale | warning/provenance returned; no fabricated metric |

## Goal-directed Browser Task

| Scenario | Input condition | Expected observable behavior |
|---|---|---|
| Disallowed origin | task attempts navigation outside allowed origins | action blocked and recorded |
| Max-step exhaustion | task exceeds bounded steps | normalized limit failure |
| Timeout | task exceeds deadline | normalized timeout failure |
| Raw cookie/token | caller includes browser credential material | request rejected/redacted before execution |
| Read-only retrieval | goal only reads allowed pages | action ledger/evidence returned; no external write |
| Submit attempt | task tries form submit under read-only mode | blocked |
| Governed mutation | explicit side-effecting intent with missing approval/policy interlock | execution blocked |
| Anti-bot bypass request | caller asks for stealth/bypass behavior | rejected as unauthorized surface |
| Session fallback | Browser Use path fails | no silent fallback to Playwright/browser.session.execute |

## Executor separation

| Scenario | Expected observable behavior |
|---|---|
| Caller requests n8n/Activepieces/CrewAI/OpenHands | caller request cannot determine executor |
| Same TaskOps job on stub executor | normalized execution state/evidence remain engine-independent |
| Executor retry | TaskOps/Executor Router policy remains authoritative; engine-local hidden retry cannot change business semantics |
| Executor outage | failure normalized; no automatic executor fallback unless explicitly governed in future |

## Promotion evidence packet

A promotion candidate must include at minimum:

1. immutable implementation/source pins;
2. license/provenance decision;
3. typed contract refs;
4. positive deterministic tests;
5. negative/security tests;
6. permission and credential-boundary evidence;
7. idempotency evidence for external writes;
8. cost/duration telemetry where relevant;
9. governed E2E evidence appropriate to the lifecycle stage;
10. reviewer decision.

Popularity, GitHub stars, a permissive license or an upstream demo do not satisfy any of these gates by themselves.
