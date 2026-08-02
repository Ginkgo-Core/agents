# Ginkgo Agents

Laboratório operacional da Ginkgo AI Systems para o Crazy AI Talents.

O repositório implementa três agentes especializados conectados ao mesmo ciclo de crescimento:

- **Callima** — secretária comercial e SDR;
- **Nyra** — social media e content operations;
- **Alfred** — tráfego, atribuição e otimização de mídia.

> Nyra cria demanda. Alfred distribui e otimiza. Callima atende e converte.

## Fronteira obrigatória

Este projeto é isolado do produto comercial `ginkgo-workforce`.

- não compartilha banco;
- não importa código em runtime;
- não altera schemas, deploys ou contratos do Workforce;
- integrações futuras ocorrerão somente por APIs versionadas.

## Stack mínima

- PostgreSQL 16 + pgvector + full-text search;
- Redis + BullMQ;
- n8n em queue mode;
- Control Plane TypeScript/Fastify;
- LiteLLM como gateway de modelos;
- Hermes Agent como runtime substituível do evento;
- Evolution API em profile opcional para WhatsApp;
- ElevenLabs, ComfyUI, Meta, TikTok, UTMify e Datacrazy por adapters externos;
- MinIO opcional para artefatos de mídia.

## Identidade dos agentes

Cada funcionário digital possui um contrato executável e um `SOUL.md` versionado:

```text
agents/
├── callima/SOUL.md
├── nyra/SOUL.md
└── alfred/SOUL.md

config/agents/
├── callima.yaml
├── nyra.yaml
└── alfred.yaml
```

Os SOULs definem identidade, comunicação, iniciativa, memória, estados comunicacionais simulados, eventos proativos e critérios de sucesso. Os contratos YAML definem tools, canais, risco, horários, relatórios e limites de autonomia.

O Control Plane carrega ambos, calcula uma fingerprint SHA-256 e registra a versão usada em cada run.

```http
GET /v1/agents/callima/runtime-context
Authorization: Bearer <INTERNAL_SERVICE_TOKEN>
```

Consulte:

- `agents/callima/SOUL.md`;
- `agents/nyra/SOUL.md`;
- `agents/alfred/SOUL.md`;
- `docs/SOUL_RUNTIME.md`;
- `docs/PROACTIVE_EVENTS.md`.

## Início rápido

```bash
cp .env.example .env
make secrets
make validate
make up
```

Serviços locais:

| Serviço | URL |
|---|---|
| n8n | `http://localhost:5678` |
| Control Plane | `http://localhost:8088` |
| LiteLLM | `http://localhost:4000` |
| Hermes API | `http://localhost:8642` |
| Hermes Dashboard | `http://localhost:9119` |

Para WhatsApp:

```bash
docker compose --profile channels up -d
```

Para MinIO:

```bash
docker compose --profile media up -d
```

## Ordem de implementação

1. Subir e validar o núcleo.
2. Migrar seletivamente os fluxos funcionais da Callima existentes em `ai-stack`.
3. Construir os workflows compartilhados do n8n.
4. Conectar Callima ao Datacrazy, Evolution e ElevenLabs.
5. Construir Nyra com ComfyUI/Gemini e aprovação humana.
6. Conectar Alfred em modo somente leitura.
7. Liberar mutações de anúncios apenas após approval, snapshot e rollback.
8. Registrar métricas e evidências do evento.

Consulte `docs/PRD.md` e `docs/ARCHITECTURE.md` antes de implementar.
