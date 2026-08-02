# Roadmap do MVP — Callima, Nyra e Alfred

## Resultado final do MVP

A demonstração deve provar um ciclo simples:

```text
Nyra cria conteúdo
→ conteúdo gera conversa ou lead
→ Callima atende e qualifica
→ CRM registra a oportunidade
→ Alfred identifica origem, custo e qualidade
→ equipe recebe recomendação
```

Nenhum agente precisa executar tudo. O objetivo é demonstrar funções claras, integração e resultado mensurável.

---

## Fase 0 — Preparação do repositório

### Objetivo

Criar uma base executável sem adicionar serviços desnecessários.

### Núcleo Docker

- PostgreSQL 16 com pgvector.
- Redis.
- n8n main.
- n8n worker em queue mode.
- LiteLLM como gateway de modelos.
- Um Control Plane pequeno em TypeScript/Fastify.
- Evolution API apenas quando o canal WhatsApp for ativado.

### Fora do núcleo

- ComfyUI roda como serviço externo e é chamado por API.
- ElevenLabs é acessado por API.
- Provedor de avatar é acessado por adapter.
- Meta, TikTok, Datacrazy e UTMify são integrações externas.
- Nada de AnythingLLM, Qdrant, Pinecone, Postiz ou Temporal no MVP.

### Entregáveis

- `docker-compose.yml`.
- `.env.example`.
- healthchecks.
- migration inicial.
- fila BullMQ.
- logs com `correlation_id`.

### Critério de conclusão

Todos os serviços obrigatórios sobem e os endpoints de saúde respondem.

---

## Fase 1 — Callima primeiro

### Motivo

Callima já possui fluxo funcional no `ai-stack`. Ela será a referência para validar Docker, n8n, CRM, voz e canais antes de construir agentes novos.

### Passos

1. Inventariar workflows existentes no `ai-stack`.
2. Separar entrada, normalização, raciocínio, tools e saída.
3. Migrar somente os fluxos necessários.
4. Conectar Datacrazy como CRM do evento.
5. Conectar Evolution API para WhatsApp.
6. Implementar transcrição e resposta por voz com ElevenLabs.
7. Implementar RAG comercial.
8. Registrar qualificação, origem, status e handoff.
9. Criar testes com mensagens repetidas, áudio, erro de ferramenta e indisponibilidade do modelo.

### Fluxos n8n mínimos

- `10-callima-inbound`
- `11-callima-normalize`
- `12-callima-agent-run`
- `13-callima-tool-dispatch`
- `14-callima-outbound`
- `15-callima-followup`

### Critério de conclusão

Uma conversa real entra pelo WhatsApp, é qualificada, registrada no Datacrazy e recebe resposta em texto ou voz sem duplicação.

---

## Fase 2 — Nyra enxuta

### Escopo

Nyra não será uma agência autônoma completa. Ela terá três produtos de conteúdo:

1. vídeo vertical com avatar;
2. post estático;
3. carrossel.

A publicação só ocorre após aprovação humana.

### Pipeline A — Vídeo vertical com avatar

```text
briefing
→ pesquisa/RAG da marca
→ ângulo e gancho
→ roteiro de 45–60 segundos
→ revisão factual
→ ElevenLabs TTS
→ geração do avatar
→ composição 9:16
→ legendas
→ preview
→ aprovação
→ publicação
```

#### Regras do roteiro

- Uma ideia central.
- Gancho nos primeiros segundos.
- Entre 90 e 150 palavras, ajustado à velocidade da voz.
- Linguagem natural, sem parágrafos longos.
- Uma chamada para ação.
- Sem afirmações não verificadas sobre produto, preço ou resultado.

#### Provedor de avatar

O MVP usa um adapter único:

```text
POST /media/avatar-video
```

Entrada:

- `script`;
- `audio_url`;
- `avatar_id`;
- `background`;
- `aspect_ratio=9:16`;
- `duration_target`;
- `correlation_id`.

Saída:

- `job_id`;
- `status`;
- `video_url`;
- `provider`;
- `cost`;
- `metadata`.

O primeiro provider deve ser o mais rápido e estável disponível. ComfyUI pode substituir o provider posteriormente sem mudar o workflow principal.

### Pipeline B — Post estático

```text
briefing
→ copy curta
→ prompt visual
→ imagem pelo ComfyUI/API
→ aplicação de template e identidade
→ legenda e CTA
→ preview
→ aprovação
```

### Pipeline C — Carrossel

```text
briefing
→ estrutura de 5–8 páginas
→ copy por página
→ geração de imagens/elementos
→ renderização em template fixo
→ validação de texto e margens
→ preview PDF/PNG
→ aprovação
```

### Fluxos n8n mínimos

- `20-nyra-brief-ingest`
- `21-nyra-script-generator`
- `22-nyra-elevenlabs-tts`
- `23-nyra-avatar-video`
- `24-nyra-static-post`
- `25-nyra-carousel`
- `26-nyra-approval`
- `27-nyra-publish`
- `28-nyra-metrics`

### Critério de conclusão

A partir de um briefing simples, Nyra entrega um vídeo vertical, um post ou um carrossel pronto para aprovação, preservando identidade e registrando custo, duração e status.

---

## Fase 3 — Publicação controlada

### Regra

Nyra nunca publica diretamente após gerar.

Estados:

```text
draft
→ generated
→ review_required
→ approved | rejected | changes_requested
→ scheduled
→ published
→ measured
```

### Primeiro canal

Escolher apenas um canal para o primeiro teste. Após estabilidade, replicar o mesmo contrato para os demais.

### Critério de conclusão

Um conteúdo aprovado é publicado uma única vez, com URL e ID remoto registrados.

---

## Fase 4 — Alfred estritamente read-only

### Escopo

Alfred não pausa, cria, edita ou aumenta orçamento.

Ele apenas:

- coleta dados de Meta Ads;
- coleta dados de TikTok Ads;
- recebe pedidos e UTMs da UTMify;
- consulta origem e qualidade dos leads no Datacrazy;
- normaliza métricas;
- calcula indicadores;
- produz diagnóstico e recomendação.

### Fluxos n8n mínimos

- `30-alfred-meta-read`
- `31-alfred-tiktok-read`
- `32-alfred-utmify-ingest`
- `33-alfred-crm-quality`
- `34-alfred-attribution-join`
- `35-alfred-daily-analysis`
- `36-alfred-report`

### Relatório mínimo

- investimento;
- impressões;
- cliques;
- CTR;
- CPM;
- CPC;
- leads;
- oportunidades qualificadas;
- vendas atribuídas;
- CPL;
- custo por oportunidade qualificada;
- receita atribuída;
- recomendação textual;
- confiança e limitações dos dados.

### Critério de conclusão

Alfred gera um relatório diário reproduzível e não possui nenhuma credencial com permissão de escrita.

---

## Fase 5 — Integração entre os três

### Contrato comum

Todo evento relevante usa:

- `correlation_id`;
- `agent_id`;
- `source`;
- `campaign_id` quando existir;
- `content_id` quando existir;
- `contact_id`;
- `created_at`;
- `metadata`.

### Integrações

- Nyra envia `content_id` e UTMs para publicação.
- Callima registra a origem do contato e o conteúdo/campanha relacionado.
- Alfred relaciona investimento e conteúdo com lead qualificado e venda.

### Critério de conclusão

É possível responder: qual conteúdo ou campanha gerou uma conversa, uma oportunidade qualificada e uma venda.

---

## Fase 6 — Demonstração do evento

### Roteiro

1. Criar briefing de um produto.
2. Nyra gera roteiro e vídeo vertical.
3. Aprovar e publicar ou simular publicação controlada.
4. Simular ou receber uma conversa originada pelo conteúdo.
5. Callima qualifica o lead e atualiza o Datacrazy.
6. Alfred lê os dados e mostra a qualidade da origem.
7. Exibir timeline com IDs, custos, decisões e resultados.

### Scorecard

#### Callima

- tempo de resposta;
- taxa de qualificação;
- reuniões/handoffs;
- erros factuais;
- oportunidades geradas.

#### Nyra

- tempo até preview;
- taxa de aprovação;
- custo por peça;
- conteúdos produzidos;
- conversas/leads associados.

#### Alfred

- fontes conectadas;
- completude de atribuição;
- custo por oportunidade;
- recomendações úteis;
- divergências identificadas.

---

## Ordem prática de execução

### Bloco 1

- Docker mínimo.
- PostgreSQL, Redis e n8n.
- Migração da Callima.

### Bloco 2

- Datacrazy.
- Evolution.
- ElevenLabs.
- Teste ponta a ponta da Callima.

### Bloco 3

- Nyra: somente roteiro + TTS + avatar.
- Preview manual.
- Sem publicação automática ainda.

### Bloco 4

- Posts e carrosséis com templates fixos.
- Aprovação.
- Um canal de publicação.

### Bloco 5

- Alfred read-only.
- Meta primeiro.
- UTMify e Datacrazy depois.
- TikTok por último.

### Bloco 6

- Integração dos IDs.
- Métricas.
- Demo e documentação.

## Itens explicitamente adiados

- Alfred executando alterações.
- Otimização autônoma de orçamento.
- Criação automática de campanhas.
- Vídeos longos.
- Vários avatares.
- Treinamento de modelos.
- Publicação sem aprovação.
- Rotação de contas para contornar limites.
- Orquestração simultânea Hermes + OpenClaw.
