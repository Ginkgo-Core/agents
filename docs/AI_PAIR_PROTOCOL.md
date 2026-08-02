# Protocolo Claude × Codex

## Objetivo

Usar Claude e Codex como uma dupla de engenharia complementar, com revisão cruzada e evidências reproduzíveis, sem concorrência destrutiva no mesmo working tree.

## Regra principal

> Um agente constrói uma unidade de trabalho; o outro tenta provar que ela está errada.

Os agentes não devem implementar simultaneamente o mesmo escopo ou editar os mesmos arquivos.

## Ambientes

Use dois git worktrees separados:

- Claude: branch `claude/<sprint>-<scope>`
- Codex: branch `codex/<sprint>-<scope>`

Cada worktree possui arquivos e branch próprios, ligados ao mesmo repositório Git.

## Papéis

### Claude

- arquitetura;
- decomposição em vertical slices;
- contratos e schemas;
- implementação inicial;
- workflows n8n;
- documentação de decisões;
- correção dos problemas arquiteturais confirmados.

### Codex

- auditoria independente;
- revisão adversarial;
- execução de builds e testes;
- Docker e integração local;
- análise de logs;
- casos extremos;
- correções isoladas e não arquiteturais;
- prova de que critérios de aceitação foram atingidos.

Os papéis podem ser invertidos em uma tarefa específica, mas o handoff deve registrar quem é Builder e quem é Reviewer.

## Ciclo de trabalho

### 1. Claim

Antes de começar, o agente atualiza `docs/handoffs/CURRENT.md` com:

- ID da tarefa;
- papel: Builder ou Reviewer;
- branch;
- arquivos reservados;
- objetivo;
- critérios de conclusão.

### 2. Plano

O Builder registra:

- contexto inspecionado;
- arquivos previstos;
- contratos afetados;
- comandos de teste;
- riscos;
- itens explicitamente fora do escopo.

### 3. Implementação

O Builder implementa uma vertical slice pequena, preferencialmente demonstrável ponta a ponta.

Não misturar refactors amplos com uma feature, salvo necessidade comprovada.

### 4. Handoff

O Builder commita, publica a branch e atualiza o handoff com:

- commit SHA;
- resumo;
- arquivos;
- decisões;
- testes executados;
- testes pendentes;
- checklist para o Reviewer.

### 5. Revisão adversarial

O Reviewer:

1. lê o handoff e o diff;
2. reproduz os testes;
3. executa testes adicionais;
4. busca falhas de contrato, segurança, idempotência, concorrência, custos e observabilidade;
5. classifica achados:
   - bloqueante;
   - importante;
   - melhoria;
6. registra evidências e reprodução.

### 6. Correção

- Problemas arquiteturais ou mudanças amplas retornam ao Builder.
- Correções pequenas, isoladas e evidentes podem ser feitas pelo Reviewer em commit próprio.
- Não corrigir silenciosamente algo que altera contrato ou escopo.

### 7. Gate

Uma tarefa só é concluída quando:

- critérios de aceitação passaram;
- não há achado bloqueante aberto;
- testes e comandos foram registrados;
- documentação foi atualizada;
- o próximo passo está explícito.

## Regra de sincronização

Nunca copie e cole todo o histórico de uma conversa como fonte de verdade.

A fonte de verdade é:

1. código no Git;
2. migrations e workflows versionados;
3. documentação do repositório;
4. `docs/handoffs/CURRENT.md`;
5. issues e pull requests.

## Convenção de branches

Exemplos:

```text
claude/s1-control-plane
codex/s1-control-plane-review
claude/s2-nyra-heygen
codex/s2-nyra-heygen-review
```

## Convenção de commits

```text
feat: implement callima inbound normalization
fix: make webhook ingestion idempotent
test: add duplicate webhook integration coverage
docs: record heygen cost guard decision
chore: pin validated container images
```

## Formato de handoff

```markdown
## TASK-ID — título

- Status: in_progress | ready_for_review | changes_requested | approved | blocked
- Builder:
- Reviewer:
- Branch:
- Commit:
- Arquivos reservados:

### Objetivo

### Implementado

### Decisões

### Comandos executados

### Resultados

### Riscos e pendências

### Checklist para o próximo agente
```

## Matriz de responsabilidade inicial

| Fase | Builder | Reviewer |
|---|---|---|
| Auditoria e plano da Sprint 1 | Claude | Codex |
| Docker e boot inicial | Claude | Codex |
| Testes e endurecimento do Docker | Codex | Claude |
| Migração funcional da Callima | Claude | Codex |
| Adapter HeyGen e cost guard | Claude | Codex |
| Testes de falha/polling HeyGen | Codex | Claude |
| Alfred read-only | Claude | Codex |
| Roteiro final de demonstração | Claude | Codex |

## Regras de qualidade

- Não aceitar “deve funcionar” como teste.
- Não aceitar mocks como prova de integração real.
- Não aceitar logs sem correlação.
- Não aceitar provider pago sem cost guard.
- Não aceitar webhook sem idempotência.
- Não aceitar ferramenta sensível sem autorização e auditoria.
- Não aceitar dependência extra sem justificativa no MVP.
