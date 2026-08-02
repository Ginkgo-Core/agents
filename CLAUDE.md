# Claude Code — Ginkgo Agents

Leia nesta ordem:

1. `docs/PRD.md`
2. `docs/ARCHITECTURE.md`
3. `docs/N8N_WORKFLOWS.md`
4. `docs/INTEGRATIONS.md`
5. `docs/SECURITY.md`
6. `AGENTS.md`

## Missão

Implementar o trio Callima, Nyra e Alfred como um sistema rastreável de aquisição e conversão para o AI Talents.

## Restrições

- Não tocar em `ginkgo-workforce`.
- Não duplicar Control Plane no n8n ou Hermes.
- Não colocar regras críticas apenas em prompts.
- Não criar tools genéricas do tipo `execute_anything`.
- Não liberar publicação ou ads mutation sem approval.
- Não salvar segredos no Git, prompts, logs ou banco de auditoria.
- Não alegar que uma integração está funcional sem teste real.

## Padrão de implementação

- TypeScript strict;
- Zod nos limites de entrada;
- SQL explícito e migrations idempotentes;
- logs JSON com `correlation_id`;
- erros tipados;
- timeout em chamadas externas;
- retries apenas em falhas transitórias;
- payloads grandes de mídia por URL, nunca atravessando a fila em base64.

## Próxima tarefa recomendada

Subir o núcleo, validar migrations e implementar os workflows n8n `00-agent-dispatch`, `01-tool-dispatch` e `90-approval-notifier` antes de migrar a Callima.
