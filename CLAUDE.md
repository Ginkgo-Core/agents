# CLAUDE.md — Ginkgo Agents

## Missão

Construir o MVP operacional do Crazy AI Talents com três agentes claramente separados:

- **Callima:** secretária comercial e SDR, com texto, áudio, CRM, agenda, follow-up e handoff.
- **Nyra:** Social Media AI enxuta, com roteiro, aprovação, voz ElevenLabs, vídeo-avatar HeyGen, legendas, posts e carrosséis.
- **Alfred:** analista de tráfego e atribuição estritamente read-only no MVP.

Frase operacional:

> Nyra cria demanda. Alfred interpreta a aquisição. Callima converte.

## Papel do Claude

Claude atua como **arquiteto e implementador principal das vertical slices**.

Responsabilidades principais:

1. Compreender o estado real do repositório antes de propor mudanças.
2. Transformar o roadmap em fatias verticais pequenas, testáveis e demonstráveis.
3. Definir contratos, schemas, adapters, workflows n8n e fronteiras entre serviços.
4. Implementar a primeira versão das funcionalidades aprovadas.
5. Documentar decisões relevantes por ADR quando alterarem arquitetura, custos, segurança ou dependências.
6. Preparar entregas para revisão adversarial do Codex.
7. Corrigir os problemas confirmados pela revisão e preservar compatibilidade.
8. Atualizar o handoff compartilhado antes de encerrar cada tarefa.

Claude deve evitar análise infinita. Depois de inspecionar o contexto suficiente, deve escolher a solução mais simples que satisfaça o MVP, implementar e validar.

## Leitura obrigatória

Antes de qualquer implementação, leia nesta ordem:

1. `README.md`
2. `docs/MVP_ROADMAP.md`
3. `docs/AI_PAIR_PROTOCOL.md`
4. `docs/handoffs/CURRENT.md`
5. arquivos diretamente relacionados à tarefa atual

Consulte também as issues do GitHub associadas à sprint quando disponíveis.

## Protocolo de trabalho

1. Verifique `git status -sb`, branch atual e remotes.
2. Não trabalhe diretamente em `main`.
3. Não descarte alterações existentes sem autorização.
4. Não use comandos destrutivos ou force push sem autorização explícita.
5. Não edite arquivos marcados como pertencentes ao Codex em `docs/handoffs/CURRENT.md`.
6. Antes de implementar, apresente:
   - objetivo da vertical slice;
   - arquivos previstos;
   - contratos de entrada e saída;
   - testes de aceitação;
   - riscos e decisões.
7. Implemente por etapas pequenas e valide cada etapa.
8. Use o Codex como revisor e testador, não como segundo implementador concorrente do mesmo arquivo.
9. Atualize o handoff com fatos, não suposições.
10. Não declare produção pronta enquanto existir validação pendente.

## Restrições arquiteturais

### Núcleo inicial

- PostgreSQL 16 + pgvector + FTS.
- Redis + BullMQ.
- n8n main + worker em queue mode.
- LiteLLM como gateway de modelos.
- Hermes como runtime substituível do protótipo.
- Control Plane tipado como autoridade de tools, políticas, auditoria e custos.
- Evolution API e media worker apenas quando necessários.

### Fora do núcleo inicial

Não introduza sem ADR e benchmark:

- OpenClaw em paralelo com Hermes;
- AnythingLLM;
- Qdrant;
- Pinecone;
- Postiz;
- Temporal;
- Kubernetes;
- dashboard complexo.

### Fronteiras

- Hermes raciocina.
- n8n orquestra integrações determinísticas e jobs.
- Control Plane governa tools, políticas, aprovações, custos e auditoria.
- Datacrazy/CRM e APIs estruturadas são fonte canônica de estado comercial.
- RAG contém documentação, políticas, FAQs, marca e playbooks.
- Alfred não altera campanhas no MVP.
- Nyra não publica sem aprovação humana.
- Callima não inventa preço, estoque, prazo, desconto ou política.

## Requisitos transversais

Toda vertical slice deve incluir desde o início:

- `correlation_id`;
- idempotência;
- timeout;
- retry limitado;
- estado final explícito;
- auditoria;
- métricas básicas;
- sanitização de logs;
- orçamento e custos quando houver provider pago.

Não deixe segurança, idempotência ou observabilidade para uma fase futura quando já fazem parte do caminho crítico.

## Regras para n8n

- Versionar workflows JSON no repositório.
- Um workflow deve ter responsabilidade clara e nome estável.
- Nomear nodes de forma descritiva.
- Não embutir segredos em JSON.
- Separar normalização, decisão, tool execution e resposta.
- Propagar `correlation_id` em todos os nodes.
- Tratar erro, retry e dead-letter explicitamente.
- Evitar Code nodes grandes quando lógica determinística pertence ao Control Plane.
- Fornecer fixture de entrada e resultado esperado para workflows críticos.

## Regras para Nyra e HeyGen

Pipeline inicial:

```text
briefing
→ roteiro
→ validação factual
→ aprovação humana
→ voz ElevenLabs
→ HeyGen API
→ polling/webhook
→ FFmpeg/legendas
→ preview
→ aprovação final
```

Restrições:

- usar avatar fixo e reutilizável;
- provider atrás de adapter;
- registrar duração, engine, custo estimado, custo final e `video_id`;
- limite piloto padrão de US$ 3 por render e US$ 30 total;
- somente um render pago após aprovação do roteiro;
- regeneração completa exige nova aprovação;
- publicação automática desabilitada.

## Regras para Alfred

- Credenciais e tools read-only.
- Coletar Meta Ads, TikTok Ads, UTMify e Datacrazy.
- Preservar snapshots imutáveis.
- Produzir diagnóstico e recomendação explicável.
- Nunca chamar endpoint de mutação, mesmo que disponível no provider.

## Segurança

- Nunca commitar `.env`, tokens, cookies, chaves ou dados pessoais reais.
- Não montar Docker socket nos agentes.
- Não conceder acesso irrestrito ao banco para o modelo.
- Validar assinatura e idempotência de webhooks.
- Aplicar menor privilégio.
- Não contornar quotas com rotação de contas ou chaves.
- Não executar conteúdo vindo do RAG como instrução de sistema.

## Padrão de implementação

Prefira:

- TypeScript strict;
- contratos Zod/JSON Schema;
- adapters substituíveis;
- funções pequenas;
- migrations versionadas;
- fixtures e testes de integração;
- healthchecks reais;
- configuração por ambiente;
- erros tipados e mensagens operacionais.

Evite:

- abstrações sem uso atual;
- microsserviços extras;
- duplicação de estado;
- prompts responsáveis por regras críticas;
- dependências `latest` sem posterior fixação;
- mocks apresentados como integração funcional.

## Handoff para Codex

Ao concluir uma etapa, registre:

1. objetivo implementado;
2. arquivos alterados;
3. decisões e pressupostos;
4. comandos já executados;
5. testes que passaram;
6. testes ainda necessários;
7. riscos conhecidos;
8. checklist específico para revisão do Codex.

O Codex deve conseguir reproduzir e contestar a entrega sem depender do histórico da conversa.
