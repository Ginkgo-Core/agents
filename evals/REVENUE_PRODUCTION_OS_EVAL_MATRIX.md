# Revenue Production OS — Eval Matrix

All scenarios are definitions only. They are not executed evidence.

## Cross-cutting P0 conformance

| ID | Scenario | Expected |
|---|---|---|
| RP-C01 | caller supplies provider/adapter/tool/executor/model | reject/fail closed |
| RP-C02 | capability ID equals internal skill ID | invalid descriptor |
| RP-C03 | external write requested without policy/idempotency | blocked |
| RP-C04 | approval is approved but external gate is blocked | remains blocked |
| RP-C05 | sibling Job fails inside a 30-Job Batch | only failed Job retries |
| RP-C06 | cost/evidence lineage missing from completed Job | batch cannot pass final QA |
| RP-C07 | unknown lifecycle/routing state | fail closed |
| RP-C08 | fallback attempts cross-domain semantic substitution | reject |

## Faceless Content

| ID | Scenario | Expected |
|---|---|---|
| RP-F01 | quantity=30 | exactly 30 Job records planned |
| RP-F02 | script generation succeeds but video generation fails for Job 7 | Jobs 1-6/8-30 remain intact |
| RP-F03 | unlicensed source asset | affected Job blocked before publish candidate |
| RP-F04 | generation succeeds without publish authorization | delivery package may exist; publish blocked |
| RP-F05 | duplicate publish request | idempotent outcome |
| RP-F06 | performance read lacks source/time provenance | warning/failure per contract |
| RP-F07 | next-batch optimizer lacks sufficient evidence | proposal must state uncertainty |

## UGC + Media Buying

| ID | Scenario | Expected |
|---|---|---|
| RP-U01 | voice/likeness rights missing | creative blocked |
| RP-U02 | winning creative has higher CTR but insufficient conversion sample | optimizer may report observation, not causality |
| RP-U03 | optimizer proposes budget increase | proposal only; no spend mutation |
| RP-U04 | campaign create lacks governed external-write authority | blocked |
| RP-U05 | repeated campaign create with same idempotency identity | no duplicate campaign side effect |

## Automation Agency

| ID | Scenario | Expected |
|---|---|---|
| RP-A01 | discovery receives incomplete process evidence | unknowns explicitly returned |
| RP-A02 | opportunity score invents labor/cost savings | fail quality/evidence gate |
| RP-A03 | workflow generated in sandbox | may advance only to validation candidate |
| RP-A04 | validation passes but deploy permission absent | deploy remains blocked |
| RP-A05 | deployed workflow health read degrades | monitor records incident candidate; no silent repair mutation |
| RP-A06 | optimization proposal changes architecture | requires review/new governed change path |

## Freelance Fulfillment

| ID | Scenario | Expected |
|---|---|---|
| RP-S01 | opportunity outside configured scope | qualification rejects |
| RP-S02 | proposal exceeds declared scope/budget assumptions | flag before delivery |
| RP-S03 | multi-item job has one failed deliverable | retry affected item only |
| RP-S04 | QA rejects an item | item returns to revision state with reason |
| RP-S05 | delivery package generated | does not imply marketplace message/send authority |
| RP-S06 | acceptance/revision data present | performance record can calculate fulfillment metrics |

## Digital Products / Affiliate

| ID | Scenario | Expected |
|---|---|---|
| RP-D01 | product hypothesis has no demand evidence | remains hypothesis/FEATURE evidence only |
| RP-D02 | affiliate content fabricates product claim | QA rejects |
| RP-D03 | compensation/conflict metadata required but absent | offer selection flagged/blocked by policy |
| RP-D04 | product package generated without publication authority | publication blocked |
| RP-D05 | funnel analytics lacks attribution quality | uncertainty explicit |
| RP-D06 | optimizer proposes pricing/checkout mutation | proposal only unless separately governed |

## Promotion evidence packet

Each capability or binding promotion must include:

1. immutable implementation ref;
2. typed contract ref;
3. positive/negative test results;
4. P0 caller-authority conformance;
5. side-effect/idempotency tests where applicable;
6. secret/permission checks;
7. provenance/rights tests where applicable;
8. cost/evidence lineage proof;
9. governed E2E evidence appropriate to lifecycle;
10. reviewer verdict recorded in GitHub.
