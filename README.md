# Ginkgo Agents

Laboratório operacional da Ginkgo AI Systems para agentes especializados, automações e integrações do Crazy AI Talents.

Este repositório é separado do produto comercial `ginkgo-workforce`.

## MVP do evento

O MVP possui três agentes com fronteiras simples:

- **Callima — Secretária e SDR:** conversa, qualifica, consulta informações autorizadas, atualiza CRM, agenda e realiza handoff.
- **Nyra — Social Media AI:** cria roteiros, voz, vídeos verticais com avatar, posts estáticos e carrosséis; tudo passa por aprovação antes da publicação.
- **Alfred — Analista de Tráfego:** coleta métricas, cruza atribuição e qualidade dos leads e gera recomendações. Não altera campanhas no MVP.

> Nyra cria demanda. Alfred interpreta a aquisição. Callima converte.

## Ordem de construção

1. Subir o núcleo Docker mínimo.
2. Migrar e estabilizar a Callima funcional do `ai-stack`.
3. Construir a Nyra em três pipelines: roteiro, vídeo-avatar e carrossel.
4. Conectar publicação somente após aprovação.
5. Implementar Alfred em modo estritamente read-only.
6. Unificar métricas e preparar a demonstração.

A especificação executável está em [`docs/MVP_ROADMAP.md`](docs/MVP_ROADMAP.md).
