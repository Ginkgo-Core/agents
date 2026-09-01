# Ginkgo Skill Model v1

Status: **PROPOSED / FEATURE-SPEC**  
Architecture authority proposal: `Ginkgo-Core/ai-stack#96`.

## Official definition

A **Ginkgo Skill** is a reusable, agent-facing unit of operational competence that describes how to achieve a defined outcome using authorized capabilities under explicit contracts, policies, permissions, quality constraints and evidence requirements.

A Skill teaches operational competence. It does **not** grant tenant authorization by itself.

## Five principles

1. Skills are outcome-oriented, not interface-oriented.
2. Skills are provider-agnostic whenever semantics permit.
3. Credentials, tenant bindings and authorization belong to runtime/tenant configuration, never to the Skill.
4. Relevant executions return normalized result plus Evidence.
5. A Skill never owns Domain Routing, Executor Routing, Policy or lifecycle promotion.

## Normative glossary

| Term | Meaning |
|---|---|
| Intent | User/business outcome expressed by a caller |
| Capability | Semantic statement of what can be done |
| Skill | Reusable operational competence describing how to achieve an outcome using capabilities |
| Playbook | Larger composition of Skills/capabilities toward a business outcome |
| Binding | Environment/tenant-specific mapping to an available implementation |
| Tool | Callable technical mechanism |
| Adapter | Contract translation between Ginkgo and an implementation |
| Provider | Service/product supplying an implementation |
| Executor | Runtime actor/engine performing the work |
| Endpoint | Specific technical action/interface |
| Policy | Authorization/constraints for execution |
| Evidence | Verifiable record of execution and outcome |

Invariant:

```text
CAPABILITY != SKILL != BINDING != TOOL != ADAPTER != PROVIDER != EXECUTOR != ENDPOINT
```

## Mental model

```text
User Intent
-> AI Employee
-> Skill
-> CapabilityRequest
-> Capability Bus
-> Domain Router
-> Policy / Approval / External Gates
-> Executor Router
-> Executor
-> Tool / Adapter
-> Provider / Software / Service
-> Normalized Result + State/Events + Evidence
```

The caller requests semantic work. It never selects provider, adapter, tool, executor, endpoint, raw workflow id or credential.

## Capability vs Skill vs Playbook

```text
Capability
media.image.generate

Skill
marketing.creative.generate-ad-set

Playbook
marketing.launch.campaign
```

A Skill should be independently testable and promotable. A Playbook may compose multiple Skills and approvals.

## What is not a Skill

Not a Skill:

```text
canva.generate-image
stripe.POST./v1/payment_links
n8n.workflow.123
click-button
```

Those describe implementations, tools or endpoints.

A valid Skill describes work:

```text
customer.collect-payment
marketing.creative.generate-ad-set
sales.lead.qualify
website.launch
```

## Provider neutrality

Wrong:

```yaml
providers:
  preferred: [canva, meta]
```

inside a Skill definition.

Correct:

```yaml
requires:
  capabilities:
    - media.image.generate
    - social.publish
```

Tenant/runtime resolution may later bind:

```text
media.image.generate -> Canva
social.publish -> Meta
```

or another semantically compatible implementation without changing the Skill.

## Skill contract example

```yaml
schema_version: ginkgo.skill.v1
id: marketing.creative.generate-ad-set
lifecycle_status: FEATURE

outcome:
  type: marketing_asset_set
  description: Produce an ad-ready creative set for an approved campaign brief.

requires:
  capabilities:
    - content.generate
    - media.image.generate

permissions_required:
  - brand_assets.read
  - content.create

constraints:
  approval_before_external_publish: true

result_contract: MarketingAssetSetResult.v1

evidence:
  required: true

fallback_policy:
  mode: same_semantics_only

routing_eligible: false
production_eligible: false
```

## Forbidden authority inside Skills

A Skill MUST NOT:

- contain raw credentials or secret values;
- select a provider based on hidden business logic;
- choose executor identity;
- embed provider routing;
- mutate lifecycle state by itself;
- treat approval as equivalent to an external gate;
- silently change semantic outcome on fallback;
- make an interface/tool implementation part of its public semantic ID;
- expose caller-selectable endpoint, credential, workflow id, node id, adapter or provider controls.

## Human/SaaS/AI equivalence

A capability may have several implementation classes:

```text
design.logo.create
|- AI implementation
|- SaaS-backed implementation
`- Human service implementation
```

The public Skill semantics remain stable. Evidence records the actual execution class and implementation reference.

## Skill lifecycle

Reachable integration != validated Skill.

A Skill begins as FEATURE/specification and follows the canonical Runtime lifecycle. Promotion requires reproducible evidence appropriate to risk and side effects.

Manual success or vendor availability does not promote lifecycle state.

## Authoring test

Before accepting a candidate as a Skill, ask:

1. Does the ID describe an outcome/competence rather than a vendor/interface?
2. Can the Skill survive replacing the provider with a semantically compatible implementation?
3. Are credentials/bindings absent from the definition?
4. Are permission requirements explicit but authorization external?
5. Can its result be normalized and evidenced?
6. Can it be independently tested and promoted?
7. Does it avoid owning routing, policy, lifecycle or executor choice?

If any answer is no, the candidate is probably a Tool, Binding, Adapter, Playbook or implementation artifact rather than a Skill.
