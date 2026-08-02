# Handoff atual — Ginkgo Agents

## Estado do projeto

- Repositório: `ginkgoai/ginkgo-agents`
- Branch-base do MVP: `agent/mvp-callima-nyra-alfred-readonly`
- Sprint ativa: Sprint 1 — núcleo Docker e Callima
- Issue principal: `#3`
- Próxima sprint planejada: Sprint 2 — Nyra com HeyGen API e controle de custo (`#5`)

## Tarefa ativa

### S1-AUDIT-001 — Auditoria inicial e plano executável

- Status: `ready_to_start`
- Builder: Claude
- Reviewer: Codex
- Branch Builder: `claude/s1-audit-plan`
- Branch Reviewer: `codex/s1-audit-review`
- Arquivos reservados pelo Builder:
  - `docs/plans/SPRINT1_IMPLEMENTATION.md`
  - possíveis ADRs novos, somente após justificar
- Arquivos reservados pelo Reviewer:
  - `docs/reviews/SPRINT1_BASELINE_REVIEW.md`

### Objetivo

Auditar o estado real do repositório e transformar a Sprint 1 em um plano executável, com stack mínima, contratos, estrutura de diretórios, critérios de aceitação, comandos de teste e sequência de migração da Callima a partir do `ai-stack`.

### Entrega esperada do Claude

1. Inventário do repositório atual.
2. Inventário seletivo do `ginkgoai/ai-stack` relevante para a Callima.
3. Arquitetura mínima confirmada.
4. Estrutura de arquivos proposta.
5. Vertical slices da Sprint 1.
6. Critérios de aceitação por slice.
7. Plano de testes.
8. Riscos e decisões pendentes.
9. Documento `docs/plans/SPRINT1_IMPLEMENTATION.md`.

### Entrega esperada do Codex

1. Auditoria independente do ambiente local e repositório.
2. Verificação de Git, Docker, Compose, Node/package manager e portas.
3. Revisão adversarial do plano do Claude.
4. Identificação de dependências ausentes, conflitos e riscos.
5. Documento `docs/reviews/SPRINT1_BASELINE_REVIEW.md`.
6. Veredito: `approved`, `changes_requested` ou `blocked`.

### Restrições

- Não implementar o stack completo durante a auditoria.
- Não alterar `main`.
- Não copiar integralmente o `ai-stack`.
- Não introduzir OpenClaw, AnythingLLM, Qdrant, Pinecone, Postiz ou Temporal.
- Não adicionar credenciais reais.
- Não executar Claude e Codex no mesmo working tree.

## Próximo gate

A implementação de Docker/Control Plane começa somente depois que:

- o plano do Claude existir;
- o Codex revisar o plano;
- bloqueios de ambiente estiverem registrados;
- a estrutura mínima estiver aprovada.
