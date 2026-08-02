# Workflows n8n

## Regras gerais

- Todo workflow recebe e propaga `correlationId` e `idempotencyKey`.
- Webhooks externos validam assinatura antes de chamar o Control Plane.
- O n8n não chama APIs sensíveis diretamente quando existe tool governada.
- Ações médias ou altas passam por approval.
- Retries são limitados e idempotentes.
- Erros definitivos vão para dead-letter e alertam o operador.
- Antes de chamar Hermes, o workflow busca o runtime context autenticado do agente.
- Timers e follow-ups são agendados no n8n/BullMQ; o modelo apenas sugere `nextBestAction`.

## Ordem canônica de contexto

```text
SOUL.md
→ contrato YAML
→ evento atual
→ memória autorizada
→ tools disponíveis
→ formato de saída
```

O workflow `00-agent-dispatch` chama:

```http
GET /v1/agents/{agentId}/runtime-context
```

A fingerprint retornada deve ser igual à fingerprint registrada no run.

## Compartilhados

### `00-agent-dispatch`

Recebe `agent.run`, carrega SOUL + contrato, busca memória, chama o adapter Hermes e processa a saída estruturada.

### `01-tool-dispatch`

Executa somente tool calls previamente aceitas pelo Control Plane.

### `02-rag-ingest`

Extrai, normaliza, calcula checksum, divide, gera embeddings e persiste documentos.

### `03-rag-search`

Gera embedding, executa FTS + pgvector + RRF e retorna trechos com origem.

### `04-next-best-action-scheduler`

Recebe `nextBestAction`, valida cooldown, quiet hours, opt-out e condição de cancelamento, então agenda o evento futuro.

### `05-notification-router`

Aplica prioridade, deduplicação, digest, canal e quiet hours às notificações sugeridas pelos agentes.

### `90-approval-notifier`

Notifica approval pendente e disponibiliza decisão.

### `91-dead-letter-handler`

Agrupa falhas definitivas com contexto, impacto e ação recomendada.

### `92-daily-scorecard`

Gera scorecard dos três agentes.

### `93-budget-guard`

Controla limites de consumo de modelos, mídia e voz.

## Callima

### `10-callima-whatsapp-inbound`

Evolution webhook → assinatura → normalização → dedup → contato Datacrazy → agent run.

### `11-callima-followup-scheduler`

Eventos `lead.unanswered`, `lead.cooling` e `quote.sent`. Cancela a sequência ao receber resposta, outcome, handoff ou opt-out.

Defaults:

- primeiro contato após 2 horas úteis;
- segundo após 24 horas;
- último após 72 horas;
- orçamento de alta intenção após 4 horas úteis.

### `12-callima-calendar-tool`

Consulta disponibilidade, cria evento aprovado, confirma e registra.

### `13-callima-elevenlabs-events`

Valida webhook, persiste resultado, atualiza CRM e programa próxima ação.

### `14-callima-datacrazy-sync`

Sincroniza contato, oportunidade, estágio, timeline, origem e outcome.

### `15-callima-day-closing`

Às 19:00, resume conversas, oportunidades, reuniões, leads recuperados e pendências.

## Nyra

### `20-nyra-editorial-planner`

Transforma metas, sinais da Callima e dados do Alfred em calendário estruturado.

### `21-nyra-content-generator`

Gera copy e roteiro por plataforma.

### `22-nyra-media-generator`

Chama ComfyUI ou provider autorizado, acompanha status e registra metadata do ativo.

### `23-nyra-approval-publisher`

Cria approval e publica somente após decisão válida.

### `24-nyra-performance-collector`

Coleta métricas orgânicas e associa ao conteúdo.

### `25-nyra-lead-signal`

Detecta interação comercial e envia contexto à Callima.

### `26-nyra-notification-flow`

Eventos:

- `content.asset.ready`: preview e link de approval;
- `content.scheduled`: confirmação curta;
- `content.publish.failed`: alerta imediato;
- `content.approval.pending`: lembretes a 120 e 30 minutos;
- `day.closing`: posts, alcance, interações, sinais e aprendizados.

## Alfred

### `30-alfred-meta-snapshot`

Coleta contas, campanhas, conjuntos, anúncios, gasto e métricas.

### `31-alfred-tiktok-snapshot`

Coleta dados equivalentes pelo MCP/API autorizado.

### `32-alfred-utmify-attribution`

Ingere pedidos, UTMs e eventos deduplicados.

### `33-alfred-diagnostic`

Cruza mídia, atribuição e qualidade comercial.

### `34-alfred-approved-mutation`

Snapshot anterior → policy → approval → mutação → releitura → snapshot posterior.

### `35-alfred-rollback`

Executa rollback aprovado e verifica estado remoto.

### `36-alfred-proactive-monitor`

Eventos:

- `ads.campaign.created`: valida orçamento, tracking, UTMs e status;
- `ads.spend.threshold_reached`: compara consumo com resultado;
- `tracking.degraded`: suspende recomendações dependentes;
- `lead.quality.shift`: compara CPL com custo por oportunidade;
- `attribution.insight.ready`: explica origem e estratégia;
- `day.closing`: investimento, leads, oportunidades, receita e recomendações.

## Saída estruturada do agente

```json
{
  "message": "mensagem para usuário ou operador",
  "communicationState": "attentive",
  "confidence": "high",
  "reasoningSummary": "resumo objetivo da decisão",
  "toolRequests": [],
  "nextBestAction": {
    "type": "schedule_followup",
    "dueAt": "2026-08-03T10:00:00-03:00",
    "cancelOn": ["user_replied", "objective_completed", "opt_out"]
  },
  "memoryUpdates": [],
  "notification": null
}
```

## Tratamento de falhas

- 429 e 5xx: retry exponencial limitado;
- 400/401/403: sem retry automático;
- timeout: retry quando operação for idempotente;
- mídia: consulta de status em vez de manter execução aberta;
- falha final: dead letter + alerta.

## Critério de pronto

Cada workflow deve possuir:

- descrição;
- owner;
- input/output documentado;
- credenciais nomeadas;
- idempotência;
- timeout;
- retry;
- caminho de erro;
- exemplo de execução;
- teste de ponta a ponta;
- regra de auditoria;
- regra de cancelamento de eventos futuros.
