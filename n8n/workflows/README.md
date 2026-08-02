# Workflows n8n

Os JSON exportados devem ser versionados nesta pasta sem credenciais.

## Núcleo

- `00-agent-dispatch.json` — recebe `agent.run`, carrega contexto e chama Hermes.
- `01-tool-dispatch.json` — roteia tools autorizadas para adapters.
- `02-rag-ingest.json` — normaliza, faz chunking, embedding e grava documentos.
- `03-rag-search.json` — embedding da consulta + `agents.hybrid_search`.
- `90-approval-notifier.json` — envia approvals pendentes ao operador.
- `91-dead-letter-handler.json` — registra e alerta jobs esgotados.
- `92-daily-scorecard.json` — consolida KPIs do evento.
- `93-budget-guard.json` — verifica custos e quotas autorizadas.

## Callima

- `10-callima-whatsapp-inbound.json`
- `11-callima-followup-scheduler.json`
- `12-callima-calendar-tool.json`
- `13-callima-elevenlabs-events.json`
- `14-callima-datacrazy-sync.json`

## Nyra

- `20-nyra-editorial-planner.json`
- `21-nyra-content-generator.json`
- `22-nyra-media-generator.json`
- `23-nyra-approval-publisher.json`
- `24-nyra-performance-collector.json`
- `25-nyra-lead-signal.json`

## Alfred

- `30-alfred-meta-snapshot.json`
- `31-alfred-tiktok-snapshot.json`
- `32-alfred-utmify-attribution.json`
- `33-alfred-diagnostic.json`
- `34-alfred-approved-mutation.json`
- `35-alfred-rollback.json`

## Convenções

Todo workflow deve:

1. validar Bearer token interno;
2. exigir `correlationId` e `idempotencyKey`;
3. responder rápido a webhooks;
4. não carregar mídia grande em base64;
5. limitar retries;
6. registrar status e erro estruturado;
7. não conter credenciais exportadas.
