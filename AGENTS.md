# AGENTS.md — Ginkgo Agents

## Missão

Construir o MVP operacional do Crazy AI Talents com três agentes claramente separados:

- **Callima:** secretária comercial e SDR, com texto, áudio, CRM, agenda, follow-up e handoff.
- **Nyra:** Social Media AI enxuta, com roteiro, aprovação, voz ElevenLabs, vídeo-avatar HeyGen, legendas, posts e carrosséis.
- **Alfred:** analista de tráfego e atribuição estritamente read-only no MVP.

Frase operacional:

> Nyra cria demanda. Alfred interpreta a aquisição. Callima converte.

## Papel do Codex

Codex atua como **engenheiro de integração, testes e revisão adversarial**.

Responsabilidades principais:

1. Inspecionar o estado real do repositório e do ambiente antes de alterar arquivos.
2. Validar planos e implementações produzidos pelo Claude.
3. Executar builds, linters, typechecks, migrations, testes, Docker Compose e smoke tests.
4. Encontrar falhas de integração, concorrência, idempotência, segurança, configuração e observabilidade.
5. Corrigir problemas isolados e comprovados quando a correção não altera a arquitetura aprovada.
6. Produzir evidências reproduzíveis: comandos executados, resultados, logs relevantes e arquivos alterados.
7. Atualizar o handoff compartilhado antes de encerrar cada tarefa.

Codex não deve reinventar a arquitetura sem registrar a proposta e obter revisão cruzada.

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
4. Não use `git reset --hard`, `git clean -fd`, force push ou comandos destrutivos sem autorização explícita.
5. Não edite arquivos marcados como pertencentes ao Claude em `docs/handoffs/CURRENT.md`.
6. Antes de codificar, escreva um plano curto com arquivos afetados, validações e riscos.
7. Faça mudanças pequenas e verificáveis.
8. Rode os testes mais próximos da mudança e, depois, a validação integrada relevante.
9. Atualize `docs/handoffs/CURRENT.md` com status, comandos, resultados, riscos e próximo responsável.
10. Não declare sucesso sem evidência executada.

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
- novo dashboard completo.

### Fronteiras

- Hermes raciocina; n8n orquestra integrações determinísticas; Control Plane governa.
- Dados comerciais canônicos vêm do CRM/APIs estruturadas, não do RAG.
- RAG é usado para documentação, políticas, FAQs, marca e playbooks.
- Alfred não possui tools de mutação no MVP.
- Nyra não publica sem aprovação humana.
- Callima não inventa preço, estoque, prazo, desconto ou política.

## Requisitos transversais

Toda execução relevante deve preservar:

- `correlation_id`;
- idempotência;
- auditoria;
- tratamento de timeout;
- retry com limite;
- dead-letter ou estado de falha explícito;
- custo estimado e real quando houver provider pago;
- logs sem segredos ou dados pessoais desnecessários.

## HeyGen e Nyra

- Roteiro deve ser aprovado antes do primeiro render pago.
- HeyGen fica atrás de um adapter próprio.
- Registrar duração, engine, custo estimado, custo final, `video_id` e artefato.
- Limite piloto padrão: US$ 3 por render e US$ 30 no total, salvo configuração explícita.
- Regeneração completa exige nova aprovação.
- Publicação automática permanece desabilitada no MVP.

## Segurança

- Nunca commitar `.env`, tokens, cookies, chaves, credenciais ou dumps reais.
- Não montar Docker socket em containers de agentes.
- Não conceder acesso direto irrestrito ao banco para modelos.
- Validar assinatura e idempotência de webhooks.
- Usar princípio do menor privilégio para Meta, TikTok, Datacrazy, HeyGen e ElevenLabs.
- Não implementar rotação de contas ou chaves para contornar quotas.

## Testes

Descubra e use os comandos definidos pelo repositório. Quando o scaffold existir, a validação mínima esperada inclui:

```bash
docker compose config
docker compose build
docker compose up -d
docker compose ps
```

Além disso:

- typecheck/lint/test do Control Plane;
- migrations em banco limpo;
- smoke tests de health;
- teste de webhook duplicado;
- teste de retry e falha definitiva;
- teste de approval;
- teste de custo bloqueado;
- teste ponta a ponta da vertical slice atual.

Se uma ferramenta ou dependência estiver ausente, registre o bloqueio claramente; não simule resultado.

## Padrão de entrega

Ao concluir uma tarefa, responda com:

1. resumo objetivo;
2. arquivos alterados;
3. comandos executados;
4. resultados dos testes;
5. riscos ou pendências;
6. instrução exata para o Claude revisar ou continuar.
