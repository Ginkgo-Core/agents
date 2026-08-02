# Arquitetura

## Princípio central

O modelo propõe; o Control Plane autoriza; n8n integra; os sistemas externos executam.

```text
Canais / Webhooks / Schedules
             │
             ▼
       Control Plane
 política · tools · approval · audit
             │
       Redis / BullMQ
             │
             ▼
           n8n
             │
   ┌─────────┼──────────┐
   ▼         ▼          ▼
Hermes     APIs       Bancos
   │
LiteLLM → provedores autorizados
```

## Responsabilidades

### Control Plane

- autenticação service-to-service;
- catálogo de agentes e tools;
- risk level;
- approvals;
- idempotência;
- auditoria;
- feature flags;
- limites financeiros;
- kill-switch.

### Hermes

- raciocínio e planejamento;
- escolha de tools permitidas;
- síntese de respostas;
- perfis separados para Callima, Nyra e Alfred.

Hermes é substituível e nunca é fonte canônica de CRM, campanha ou aprovação.

### n8n

- normalização de webhooks;
- integração com APIs;
- ETL;
- schedulers;
- notificações;
- workflows longos e periféricos.

n8n não deve decidir políticas críticas nem intermediar tools de voz que exijam latência muito baixa.

### PostgreSQL

- estado operacional;
- runs e tool calls;
- approvals;
- auditoria;
- usage ledger;
- snapshots;
- RAG híbrido.

### Redis/BullMQ

- filas;
- retries;
- locks;
- deduplicação temporária;
- rate limiting.

## Isolamento dos agentes

Cada agente possui:

- profile Hermes;
- SOUL/config próprio;
- namespace RAG próprio;
- lista própria de tools;
- credenciais com escopo mínimo;
- KPIs próprios.

## Comunicação entre agentes

Agentes não chamam uns aos outros diretamente. Eles publicam eventos tipados:

- `lead.signal.created`;
- `content.published`;
- `campaign.snapshot.created`;
- `opportunity.qualified`;
- `revenue.attributed`;
- `approval.requested`;
- `approval.decided`.

O Control Plane e n8n roteiam esses eventos.

## Mídia

Artefatos são armazenados em filesystem local no desenvolvimento e MinIO/S3 em produção. Filas transportam apenas URL, checksum, MIME type e metadata.

## Model routing

LiteLLM expõe aliases estáveis:

- `agents-fast`;
- `agents-reasoning`;
- `agents-embedding`.

Fallback é permitido apenas entre provedores/chaves autorizados. Quotas geram backoff ou degradação, nunca rotação destinada a contornar limites.
