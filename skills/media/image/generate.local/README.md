# SKILL — media.image.generate.local

**PURPOSE**
Gerar imagens localmente com execução reproduzível (seed/preset pinados, proveniência completa).

**WHEN TO USE**
- privacidade (prompt/asset nunca saem da máquina)
- custo de API indesejado (billing US$0)
- controle/reprodutibilidade de workflow

**DON'T USE**
- GPU local indisponível ou RAM livre < 2 GiB
- latência interativa com runtime frio (cold ≈ 61–85s; warm ≈ 10s)

**INPUT**
`request_id`, `prompt`, `negative_prompt?`, `width?`, `height?` (256–1024, múltiplos de 8), `seed?`, `preset?` (default `sdxl-local-standard` 768×768)

**OUTPUT**
`creative-asset` (contrato normalizado do Pyre: provider, asset, generation, cost, provenance, errors)

**EXECUTION**
Sylvia → n8n `creative-image-local-v1` → Pyre `/v1/creative/jobs` → ComfyUIProvider → ComfyUI (on-demand, lifecycle com gate de RAM)

**AUTONOMY** A2 · **LEVEL** L1 · **RISK** LOW

**STATUS** S2 / INTEGRATED

**EVIDENCE** Waves 7 (router E2E), 8 (n8n E2E), 9 (persistência/idempotência/lifecycle/restart) — ver `evals/validation.yaml`
