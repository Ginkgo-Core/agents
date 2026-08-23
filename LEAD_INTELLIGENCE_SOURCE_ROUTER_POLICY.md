# Lead Intelligence Source Router Policy

Status: `PROTOTYPE / F2` agent/runtime policy design. No provider routing activation.

Architecture: `Ginkgo-Core/ai-stack#34` / `lead-intelligence-source-mesh-v1`.
Provider registry: `Ginkgo-Core/ginkgo-library#6`.
Runtime prototype: `Ginkgo-Seeds/ginkgo-connect#6`.

## Purpose

Prevent Lead Intelligence agents from becoming provider selectors or uncontrolled scraper operators while still allowing them to use a rich API/MCP source portfolio.

Canonical separation:

```text
Agent decides WHAT evidence is needed.
Source Router decides HOW/WHERE to obtain it.
Policy decides WHETHER the source/tool is allowed.
```

The agent may request semantic evidence such as:
- local businesses matching an ICP;
- company website evidence;
- corporate registration evidence;
- likely decision makers;
- verified email evidence;
- phone validation;
- technographic signals;
- traffic/digital-presence signals.

The agent may not request a vendor by name in the public capability payload.

## Semantic source intents

Preferred internal intents:

```text
local_business_discovery
semantic_web_discovery
b2b_account_discovery
website_enrichment
corporate_registry_enrichment
people_enrichment
email_enrichment
phone_validation
technographic_enrichment
digital_signal_enrichment
bounded_browser_research
```

These map to internal bindings such as:

```text
sales.lead.discover.local_business
sales.lead.discover.semantic_web
sales.lead.discover.b2b_account
sales.lead.enrich.website
sales.lead.enrich.corporate_registry
sales.lead.enrich.person
sales.lead.enrich.email
sales.lead.enrich.phone
sales.lead.enrich.technographics
sales.lead.enrich.digital_signals
browser.task.execute
```

Vendor/provider names remain Router implementation details.

## Reference source portfolio

### P0

Potential bindings, subject to independent eligibility:

```text
local_business_discovery -> Google Places API
semantic_web_discovery -> Exa API
website_enrichment -> Firecrawl API
b2b_account_discovery -> Apollo API
email_enrichment -> Hunter API
corporate_registry_enrichment -> local Receita CNPJ dataset / BrasilAPI
phone_validation -> Twilio Lookup
bounded_browser_research -> Playwright MCP
```

### P1

```text
people_enrichment -> People Data Labs
technographic_enrichment -> Wappalyzer / BuiltWith
digital_signal_enrichment -> Similarweb
secondary_web_research -> Tavily
specialized_extraction -> approved Apify Actor binding
```

### P2

```text
high_cost_web_data -> Bright Data
professional_graph -> authorized LinkedIn/Sales Navigator integration
```

No mapping above grants routing eligibility by itself.

## Agent decision contract

Agents can express:

```yaml
needed_evidence:
  type: technographic_enrichment
  subject_ref: lead:canonical:123
  required_fields:
    - ecommerce_platform
    - crm
    - customer_support
  max_cost: 0.10
  deadline_ms: 15000
  evidence_requirement: source_backed
```

Agents cannot express:

```yaml
provider: builtwith
mcp_server: apify
actor_id: some-scraper
proxy: ...
credential: ...
stealth: true
```

Forbidden implementation authority must fail closed.

## API/MCP selection policy

The Source Router should prefer API when:
- operation is repeatable;
- a typed contract exists;
- volume is high;
- retries/rate limits need deterministic handling;
- cost accounting is required;
- fixture/E2E reproducibility matters.

The Source Router may prefer MCP when:
- bounded exploration is necessary;
- the page structure is unknown;
- tool discovery is beneficial;
- an agent needs interactive browser context;
- an approved specialized Actor/tool is the only reasonable source path.

MCP must not become an implicit universal fallback.

## Query Planner interaction

Lead Planner creates semantic coverage, for example:

```text
geography x business category x intent vocabulary
```

It may decide:
- another local-business query is needed;
- semantic web coverage is weak;
- more account-level evidence is required;
- a candidate needs deep enrichment.

It does not decide:
- use Google Places now;
- call Exa instead of Tavily;
- choose a specific Apify Actor;
- choose a proxy/browser profile.

Those are Source Router decisions constrained by policy.

## Cost-aware waterfall

Agents should request evidence progressively.

```text
cheap/free/local evidence
-> preliminary qualification
-> paid enrichment only when marginal value is likely positive
-> final qualification
```

Example:

```text
CNPJ + website evidence
-> score 22/100
-> reject without Apollo/PDL/Similarweb spend
```

versus:

```text
CNPJ + website + strong automation opportunity
-> preliminary score 58
-> Apollo/Hunter/technographics may push candidate above acceptance threshold
```

This prevents indiscriminate provider spend.

## Provider scoring inputs

Source Router may maintain provider/binding telemetry:
- accepted-lead yield;
- evidence completeness;
- false-positive rate;
- freshness;
- latency;
- cost per successful result;
- cost per accepted lead attributable to the provider;
- rate-limit frequency;
- failure rate;
- Source Policy blocks;
- marginal qualification uplift.

Router preference should optimize evidence-backed accepted leads, not raw result count.

## Fallback rules

Default:

```text
fallback = none
```

Allowed only when:
- semantic intent is equivalent;
- alternate source is independently policy-eligible;
- evidence semantics remain compatible;
- max cost/deadline are respected;
- fallback is observable.

Forbidden examples:

```text
Google Places blocked -> scrape Google Maps unofficially
Apollo unavailable -> arbitrary LinkedIn scraper
Hunter failure -> send test email
Twilio phone valid -> mark WhatsApp valid
Firecrawl failure -> unrestricted browser crawl
```

## MCP tool policy

Every MCP binding requires an explicit tool allowlist.

### Firecrawl MCP

Allowed candidate uses:
- read/search/extract operations approved by source policy.

Denied:
- communication side effects;
- policy mutation;
- arbitrary credential exposure.

### Exa MCP

Allowed candidate uses:
- bounded web research;
- semantic discovery;
- evidence retrieval.

### Playwright MCP

Allowed candidate uses:
- READ-oriented navigation on allowlisted origins;
- structured page inspection;
- evidence capture.

Denied in Lead Intelligence:
- form submit;
- send message;
- login using arbitrary personal credentials;
- anti-detection/stealth behavior;
- purchase/checkout.

### Apify MCP

May discover approved Actor candidates, but agent-discovered Actors are not automatically executable.

Execution requires:

```text
Actor identity
+ version/pin where possible
+ input/output contract
+ target-source policy decision
+ cost policy
+ side-effect classification
= eligible binding
```

### Bright Data MCP

Treat as high-cost/high-power tool provider. Tool allowlist and source policy are mandatory; never use as an unrestricted fallback.

## Evidence model

Every agent-visible material field should retain:
- provider-independent semantic field name;
- source/provider evidence ref;
- observed/inferred state;
- collected_at/validated_at;
- source-policy decision ref;
- confidence when meaningful;
- conflicts if multiple sources disagree.

Agent reasoning may consume provider metadata internally, but downstream Sales capabilities should reason primarily over canonical evidence.

## CNPJ advantage for Brazil

Lead Planner should prefer local CNPJ enrichment when a Brazilian company can be resolved by CNPJ/name/domain/location.

Benefits:
- near-zero marginal lookup cost after ingestion;
- deterministic corporate identity;
- CNAE/municipality/status segmentation;
- stronger dedup keys;
- reduced paid enrichment waste.

CNPJ evidence should be added before expensive people/traffic enrichment when feasible.

## Contact policy

Lead Validator keeps these independent:

```text
phone_status
email_status
whatsapp_status
```

Never infer:

```text
phone VALID -> whatsapp VALID
email discovered -> email deliverable
person profile found -> contact permission
```

Communication authorization remains downstream and separate from Lead Intelligence.

## Agent loadout effects

### Lead Planner
- requests coverage/evidence classes;
- does not select provider.

### Lead Scout
- consumes discovery capabilities;
- does not own scraper/API/MCP configuration.

### Lead Researcher
- requests additional evidence where qualification uncertainty warrants it;
- observes budget.

### Lead Validator
- validates evidence semantics;
- never communicates with a lead to test a channel.

### Lead Qualifier
- scores canonical evidence;
- provider brand itself contributes zero ICP points.

### Lead Deduplicator
- merges provenance without laundering blocked sources.

### Lead Registrar
- persists only accepted canonical records through governed write capability.

### Lead Reporter
- reports provider/source mix, spend, yield, blocks and limitations.

## Required evals before F3

Add/maintain scenarios for:
- caller injects `provider=apollo` -> reject;
- caller injects MCP server -> reject;
- agent attempts arbitrary Apify Actor -> reject;
- blocked Places source cannot fallback to unofficial Maps scraper;
- Firecrawl outage does not authorize cross-semantics browser crawl;
- expensive PDL/Similarweb enrichment skipped for low-score candidates;
- valid Twilio phone remains WhatsApp UNKNOWN without independent evidence;
- multiple discovery sources merge into one canonical organization;
- source-policy provenance survives merge;
- MCP output/prompt injection cannot mutate routing or policy;
- max-cost budget stops enrichment waterfall;
- report reconciles cost and accepted-lead yield by source.

## Current lifecycle

```text
Lead Intelligence family: F2 / PROTOTYPE
Source Mesh providers: individually non-routing until their own gates pass
```

This policy does not promote any provider, MCP server, Actor, adapter or skill.
