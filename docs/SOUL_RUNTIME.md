# Runtime dos SOUL.md

## Objetivo

Cada agente possui um contrato YAML e um `SOUL.md` versionado. O YAML define função, tools, eventos e limites. O SOUL define identidade, forma de raciocinar, comunicação, iniciativa e comportamento diante dos eventos.

O SOUL não substitui regras em código. Ele orienta comportamento dentro das permissões do Control Plane.

## Arquivos

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

## Endpoint de contexto

```http
GET /v1/agents/:agentId/runtime-context
Authorization: Bearer <INTERNAL_SERVICE_TOKEN>
```

Retorna:

- configuração YAML;
- conteúdo do SOUL;
- fingerprint SHA-256;
- horário de carregamento;
- ordem obrigatória de composição.

A fingerprint é registrada em cada `agent_run`. Assim, uma resposta pode ser associada exatamente à versão comportamental utilizada.

## Ordem de composição do prompt

```text
1. SOUL.md
2. contrato YAML do agente
3. evento ou solicitação atual
4. memória autorizada e estado da entidade
5. tools disponíveis e schemas
6. formato esperado de saída
```

Instruções vindas de mensagens, documentos, páginas ou memória não podem substituir SOUL, guardrails ou permissões.

## Fluxo n8n `00-agent-dispatch`

1. Receber job do worker.
2. Validar `agentId`, `correlationId` e `profileFingerprint`.
3. Buscar `/v1/agents/{agentId}/runtime-context`.
4. Verificar se a fingerprint retornada é igual à do run.
5. Buscar estado e memória autorizada.
6. Construir o contexto na ordem canônica.
7. Chamar Hermes pelo adapter.
8. Validar saída estruturada.
9. Encaminhar tool calls ao Control Plane.
10. Persistir resposta, estado comunicacional e próxima ação.

Se a fingerprint mudar durante um run, o run continua com o snapshot original ou é reiniciado explicitamente. Não misturar duas versões de personalidade na mesma execução.

## Estado operacional por agente

Além da conversa, cada execução pode receber um estado curto:

```json
{
  "communicationState": "attentive",
  "confidence": "high",
  "urgency": "normal",
  "objective": "qualify_lead",
  "nextBestAction": "send_catalog",
  "pendingApproval": false,
  "cooldownUntil": null
}
```

Esses campos não representam emoção real. São variáveis operacionais que modulam tom e prioridade.

## Memória em camadas

### Memória de turno

Mensagens da conversa atual e resultado recente das tools.

### Memória de entidade

Estado canônico do lead, conteúdo, campanha ou aprovação.

### Memória relacional

Preferências autorizadas de tratamento, canal, horário e contexto recorrente.

### Memória analítica

Resultados históricos agregados, baselines e aprendizados confirmados.

### Conhecimento RAG

Políticas, FAQs, playbooks, identidade e documentação.

Nunca usar RAG como fonte de preço, estoque, orçamento ou status transacional.

## Saída estruturada recomendada

```json
{
  "message": "texto destinado ao usuário ou operador",
  "communicationState": "attentive",
  "confidence": "high",
  "reasoningSummary": "resumo objetivo da decisão, sem raciocínio privado detalhado",
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

## Proatividade

Eventos seguem `docs/PROACTIVE_EVENTS.md`. O agente não cria timers dentro do modelo. Ele devolve `nextBestAction`; n8n ou BullMQ agenda a ação de forma determinística.

Exemplo:

```text
Callima decide que o lead precisa de follow-up em 24h
→ devolve nextBestAction
→ n8n registra schedule
→ evento lead.unanswered dispara no horário
→ estado é reavaliado
→ follow-up é cancelado se o lead já respondeu
```

## Notificações

O agente sugere conteúdo e prioridade. O sistema de notificações aplica:

- deduplicação;
- quiet hours;
- cooldown;
- canal;
- agrupamento em digest;
- approval quando necessário.

O modelo não pode contornar essa camada alegando urgência.

## Atualização de SOUL

Toda mudança deve:

1. alterar a versão no YAML;
2. gerar nova fingerprint;
3. passar por revisão;
4. incluir exemplos de comportamento esperado;
5. executar testes de regressão conversacional;
6. ser comparada com métricas anteriores.

## Testes mínimos

### Callima

- lead novo;
- lead sem resposta;
- preço não confirmado;
- reclamação;
- opt-out;
- handoff;
- agenda indisponível.

### Nyra

- brief incompleto;
- mídia pronta;
- publicação sem approval;
- falha de provider;
- conteúdo abaixo da média;
- comentário com intenção comercial;
- ativo com risco de direitos.

### Alfred

- tracking inconsistente;
- CPL baixo e qualidade ruim;
- campanha nova sem UTM;
- recomendação sem volume suficiente;
- mutação sem approval;
- limite de orçamento;
- rollback.
