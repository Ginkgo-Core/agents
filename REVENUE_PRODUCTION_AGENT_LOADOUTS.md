# Revenue Production OS — Agent Loadouts

Status: FEATURE/F1 design only. No loadout is production-authorized.

## Principle

Agents are governed role/loadout compositions. Skills remain reusable and provider-neutral. The role does not own routing authority.

```text
Agent Role
-> capability intent
-> CapabilityRequest
-> Capability Bus
-> Domain Router
-> internal skill/binding
-> CapabilityResult
```

Task execution remains:

```text
TaskOps -> Executor Router -> eligible executor
```

## Shared roles

### Scout

Purpose: find opportunities, trends, topics, leads, offers or operational friction.

Default authority: read-only.

Typical capability families:
- research/search;
- `sales.lead.discover`;
- `services.opportunity.discover`;
- `commerce.digital-product.research`;
- trend/content research.

### Research

Purpose: acquire evidence and context before generation.

Default authority: read-only.

Required behavior:
- preserve source/provenance;
- distinguish observation from inference;
- expose missing/uncertain data;
- never fabricate evidence.

### Strategist

Purpose: choose business angles, plans, segmentation, batch composition and packaging.

Default authority: analysis/generate only.

May propose:
- content angles;
- creative hypotheses;
- process automation candidates;
- scope/package options;
- product/funnel hypotheses.

May not activate campaigns, publish, deploy or send by implication.

### Writer

Purpose: scripts, hooks, captions, proposals, product copy and follow-up drafts.

Default authority: generate only.

### Creative

Purpose: media specifications, derivatives and asset generation.

Default authority: asset generation only.

Requires rights/provenance metadata for voice, likeness, music, images, footage and templates where applicable.

### Builder

Purpose: generate workflows, fulfillment outputs and product packages.

Default authority: sandbox/generate.

Deployment or external mutation is always a separate capability/permission boundary.

### QA

Purpose: verify contract, quality, evidence, provenance, originality and policy requirements.

Default authority: read/decision proposal.

QA failure blocks the affected Job, not successful sibling Jobs.

### Publisher / Delivery

Purpose: perform explicit delivery/publication/deployment/send operations.

Default authority: governed external write.

Requirements:
- policy/approval interlock when applicable;
- idempotency;
- action evidence;
- halt/cancel path;
- destination scope.

### Analytics

Purpose: read normalized performance and produce evidence-backed findings.

Default authority: read/analysis only.

### Optimizer

Purpose: propose changes for the next batch based on performance evidence.

Default authority: proposal-only.

A proposal never mutates budget, provider routing, workflow deployment or publication configuration by itself.

### Sales / Account

Purpose: intake, packaging, proposal support, expansion and retention.

Default authority: read/generate. External CRM/message writes are separately governed.

---

# Engine loadouts

## 1. Faceless Content Factory

```text
Scout
-> Research
-> Strategist
-> Writer
-> Creative
-> QA
-> Publisher/Delivery
-> Analytics
-> Optimizer
```

Primary capabilities:
- `content.batch.plan`;
- `content.batch.produce`;
- existing content/media capabilities;
- `content.batch.evaluate`.

Canonical batch example:

```text
30 requested videos
-> 30 Jobs
-> each Job independently progresses
-> accepted Assets
-> batch delivery/publication
-> performance evidence
-> next-batch proposal
```

## 2. UGC Creative + Media Buying

```text
Research
-> Strategist
-> Writer
-> Creative
-> QA
-> governed Media Buying action
-> Analytics
-> Optimizer
```

The Creative Factory and Performance Engine are separate. Performance evidence can generate the next creative hypothesis, but cannot silently mutate spend.

## 3. Automation Agency

```text
Research / Discovery
-> Process Analyst
-> Solution Architect
-> Builder
-> QA
-> governed Deployment
-> Monitoring
-> Incident Diagnosis
-> Optimizer
-> Account
```

Mapped shared roles:
- Process Analyst = Research + Strategist loadout;
- Solution Architect = Strategist + Builder-planning loadout;
- Monitoring = Analytics with operational signals;
- Incident Diagnosis = Research + Analytics.

Commercial outcome is a maintained automation service, not a one-off workflow export.

## 4. Freelance Fulfillment

```text
Scout
-> Sales/Account
-> Strategist
-> Builder/Creative/Writer as required
-> QA
-> Delivery
-> acceptance/revision evidence
```

The unit of sale is a standardized deliverable or batch rather than time worked.

## 5. Digital Products + Affiliate Distribution

```text
Scout
-> Research
-> Strategist
-> Writer/Creative/Builder
-> QA
-> governed Publication
-> Distribution
-> Analytics
-> Optimizer
```

One validated problem may yield multiple product surfaces, but each published product/offer remains separately traceable and measurable.

## Promotion rule

No role or loadout becomes executable merely because all referenced capabilities exist as FEATURE records. Promotion requires validated capability implementations, policy, evidence, executor eligibility and governed E2E proof.
