# SKILL — media.image.generate (genérica)

**PURPOSE**
Gerar uma imagem com o melhor provider **VALIDADO** compatível com as constraints. O caller nunca conhece provider/tool/modelo.

**IMPORTANTE**
Esta skill genérica **não** significa que cloud está validado — hoje o único provider VALIDATED é `comfyui-local`; `google-gemini-image` é EXPERIMENTAL e nunca é selecionado fora de eval mode explícito. Zero fallback silencioso.

**INPUT**
`request_id`, `prompt` + `constraints{privacy, latency, quality, max_cost_usd, residency}` + `generation{width,height,seed,preset}` + `metadata`.
**Proibidos**: `provider`, `tool`, `model` (rejeitados com INVALID_REQUEST).

**OUTPUT** `creative-asset` · **erro novo**: `NO_VALIDATED_PROVIDER` quando nenhuma opção VALIDATED satisfaz.

**EXECUTION** Sylvia (constraints) → n8n `creative-image-generate-v1` → Pyre Routing V3 → provider elegível

**AUTONOMY** A2 · **LEVEL** L1 · **STATUS** S1/SKILL · **EVIDENCE** Wave 10 (E2E genérico + testes A–E)
