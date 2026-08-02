# Desenho dos workflows n8n

## 00 — Agent Dispatch

Entrada: `agent.run`.

1. validar token interno;
2. validar contrato;
3. carregar agente e run;
4. recuperar memória/RAG quando necessário;
5. chamar profile Hermes correto;
6. receber resposta e tool calls;
7. enviar tools ao Control Plane;
8. persistir output e consumo;
9. retornar status.

## 01 — Tool Dispatch

Entrada: tool aprovada ou low-risk.

1. verificar tool/agent;
2. selecionar adapter;
3. executar com timeout;
4. normalizar resposta;
5. gravar status;
6. emitir evento de domínio;
7. responder sem vazar credenciais.

## 02/03 — RAG

Ingestão:

```text
fonte → sanitização → checksum → chunking → embedding → PostgreSQL
```

Busca:

```text
consulta → embedding → FTS + pgvector → RRF → reranker opcional → citações
```

## 10 — Callima WhatsApp Inbound

1. receber Evolution webhook;
2. verificar assinatura/chave e deduplicar message id;
3. normalizar texto, áudio, imagem ou documento;
4. transcrever áudio;
5. resolver contato no Datacrazy;
6. criar run da Callima;
7. enviar resposta por Evolution;
8. anexar timeline e outcome.

## 13 — ElevenLabs Events

- validar assinatura;
- persistir evento bruto sanitizado;
- processar post-call de forma assíncrona;
- atualizar contato, oportunidade, resumo, custo e próxima ação.

## 20–25 — Nyra

Planner gera briefs estruturados. Generator cria copy e roteiro. Media generator envia workflow versionado ao ComfyUI/API. Approval publisher cria approval e só publica após decisão. Collector lê métricas. Lead signal identifica interação comercial e envia à Callima.

## 30–35 — Alfred

Snapshots leem Meta/TikTok. Attribution cruza UTMify, Datacrazy e gastos. Diagnostic gera recomendação estruturada. Mutation exige flag + approval + snapshot. Rollback restaura campos autorizados.

## Tratamento de falhas

- 429 e 5xx: retry exponencial limitado;
- 400/401/403: sem retry automático;
- timeout: retry quando operação for idempotente;
- mídia: consulta de status em vez de manter execução aberta;
- falha final: dead letter + alerta.
