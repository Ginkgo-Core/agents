# Instruções para agentes de código

## Escopo

Este repositório é exclusivamente o laboratório `ginkgo-agents`.

Nunca modificar, importar diretamente ou migrar automaticamente arquivos do `ginkgo-workforce`.
Componentes do `ai-stack` podem ser consultados e migrados seletivamente, com revisão explícita.

## Autoridade arquitetural

1. `apps/control-plane` decide políticas, tools, approvals, idempotência e auditoria.
2. n8n executa integrações determinísticas e workflows periféricos.
3. Hermes raciocina, mas não é fonte de verdade.
4. PostgreSQL guarda estado canônico e memória recuperável.
5. Redis/BullMQ transporta jobs, locks e retentativas.
6. Datacrazy é o CRM operacional do evento.

## Regras

- Nenhum agente recebe Docker socket.
- Nenhum agente acessa diretamente credenciais de outro agente.
- Ações de risco médio ou alto exigem approval.
- Alfred inicia somente leitura; mutações ficam atrás de feature flag.
- Nyra nunca publica sem approval no MVP.
- Callima não inventa preço, estoque, prazo, agenda ou desconto.
- Toda execução leva `correlation_id` e `idempotency_key`.
- Toda integração externa deve ter timeout, retry limitado e circuit breaker.
- Não implementar rotação de contas/chaves para contornar quotas gratuitas.
- Fallbacks de modelos usam provedores e chaves autorizados, com orçamento explícito.

## Fluxo de mudança

1. Ler PRD, arquitetura e documento do agente.
2. Criar ou atualizar contrato antes do código.
3. Implementar menor mudança completa.
4. Adicionar validação e observabilidade.
5. Executar `make validate`.
6. Registrar limitações reais no PR.
