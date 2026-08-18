# Promotion Record — media.image.generate.local

```yaml
promoted_to: media.image.generate.local
version: 1.0.0
status: promoted
from: F3/VALIDATED
to: S2/INTEGRATED        # manifest + evidência + integração agentic (Sylvia→n8n→Pyre→runtime)
not_yet: S3/PRODUCTION   # requer janela operacional real com observabilidade contínua
evidence:
  - wave7: Ginkgo-Seeds/ginkgo-pyre#3 (router provider-neutral, 12/12 testes, E2E)
  - wave8: Ginkgo-Core/ai-stack#12 (n8n handoff E2E; proof zero internals; warm 6x)
  - wave9: Ginkgo-Seeds/ginkgo-pyre#4 (persistência, idempotência, lifecycle, restart; 26/26)
evals: skills/media/image/generate.local/evals/validation.yaml
promoted_at: 2026-08-18
owner: pyre
reviewer: founder (merge dos PRs de evidência)
```

Provenance preservada: a feature nasceu no lab local do Pyre (Wave 2, `labs/local-media`),
foi prototipada nas Waves 5–6 (runtime + primeiro modelo) e validada nas Waves 7–9.
