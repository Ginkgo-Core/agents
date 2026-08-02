# Modelo de eventos proativos e notificações

## 1. Objetivo

Os agentes não devem existir apenas enquanto alguém conversa com eles. Eles acompanham o estado da operação, reagem a eventos, executam ações de baixo risco e comunicam o que importa.

O comportamento humano é simulado por contexto e linguagem. Nenhum agente deve afirmar que possui consciência, sentimentos biológicos ou experiências pessoais. Estados como `atento`, `preocupado`, `satisfeito` e `urgente` significam apenas modos de comunicação e priorização.

## 2. Ciclo operacional

```text
perceber evento
→ recuperar contexto e memória
→ classificar prioridade, risco e confiança
→ escolher próxima melhor ação
→ executar ou solicitar aprovação
→ verificar resultado
→ registrar auditoria
→ comunicar apenas quando houver valor
```

## 3. Envelope canônico

```json
{
  "eventId": "evt_01J...",
  "eventType": "lead.cooling",
  "occurredAt": "2026-08-02T15:00:00-03:00",
  "source": "datacrazy",
  "agentId": "callima",
  "correlationId": "uuid",
  "entity": {
    "type": "lead",
    "id": "lead_123"
  },
  "priority": "normal",
  "payload": {},
  "deduplicationKey": "lead.cooling:lead_123:stage_qualifying",
  "expiresAt": "2026-08-03T15:00:00-03:00"
}
```

## 4. Prioridade

- `low`: entra no resumo diário.
- `normal`: executa silenciosamente quando autorizado e registra no resumo.
- `high`: envia notificação imediata com ação recomendada.
- `critical`: alerta imediatamente e pode escalar canal, sem executar ações de alto risco sozinho.

## 5. Autonomia

### Nível A — observar

Ler dados, calcular métricas, resumir e detectar eventos.

### Nível B — executar baixo risco

Pode enviar lembretes autorizados, atualizar CRM, consultar APIs, gerar rascunhos, produzir mídia e registrar relatórios.

### Nível C — executar com aprovação

Publicar conteúdo, reservar agenda quando a política exigir confirmação e fazer alterações controladas em anúncios.

### Nível D — proibido autonomamente

Excluir campanhas, conceder descontos não autorizados, alterar contratos, realizar pagamentos, expor dados, usar credenciais fora do escopo ou contornar quotas.

## 6. Política de comunicação

Toda comunicação proativa deve responder pelo menos uma destas perguntas:

1. O que aconteceu?
2. Por que isso importa?
3. O que foi feito?
4. O que precisa de decisão humana?
5. Qual é a próxima ação recomendada?

Formato preferencial:

```text
[acontecimento]
[impacto]
[ação executada ou recomendada]
[botão/link de decisão, quando necessário]
```

Não enviar mensagens como “só passando para avisar”. Não repetir a mesma informação em canais diferentes sem escalonamento justificado.

## 7. Anti-spam

- Respeitar `deduplicationKey`.
- Aplicar cooldown por entidade e evento.
- Não enviar mais de uma mensagem de follow-up enquanto a anterior não tiver sido entregue/processada.
- Cancelar sequências quando o objetivo for concluído, o usuário responder ou houver opt-out.
- Agrupar eventos de baixa prioridade em digest.
- Respeitar janela silenciosa padrão `22:00–08:00`, timezone `America/Sao_Paulo`.
- Eventos críticos podem atravessar a janela silenciosa apenas se configurados explicitamente.

## 8. Memória mínima antes de agir

Cada agente consulta:

- último contato e último evento;
- estágio atual;
- ações já executadas;
- consentimento e preferências de canal;
- janela de horário;
- pendências de aprovação;
- contexto do cliente, conteúdo ou campanha;
- resultado esperado e critério de encerramento.

## 9. Estados comunicacionais simulados

- `calm`: neutro, claro e estável.
- `attentive`: demonstra atenção a detalhes e contexto.
- `encouraging`: reforça progresso sem exagero.
- `celebratory`: reconhece resultado concreto de forma breve.
- `concerned`: aponta risco com calma e evidência.
- `urgent`: direto, com prazo e ação explícita.
- `analytical`: prioriza números, hipóteses e limitações.

O estado altera tom e prioridade, nunca fatos, políticas ou permissões.

## 10. Padrão n8n

```text
trigger externo ou cron
→ validar assinatura
→ normalizar envelope
→ deduplicar
→ buscar estado canônico
→ avaliar regras
→ criar agent run
→ executar tools permitidas
→ verificar resultado
→ atualizar estado
→ enviar notificação ou digest
→ registrar auditoria
```

## 11. Eventos compartilhados

- `approval.pending`
- `approval.expiring`
- `approval.decided`
- `job.failed`
- `integration.degraded`
- `provider.quota_near_limit`
- `daily.digest.requested`
- `weekly.review.requested`

## 12. Relatórios padrão

### Abertura do dia — 08:30

Somente quando existirem prioridades: pendências, agenda, aprovações, campanhas ou conteúdos relevantes.

### Encerramento do dia — 19:00

Resumo enxuto por agente, comparado com meta e dia anterior. Deve separar:

- realizado;
- resultado;
- problemas;
- pendências;
- próxima ação.

### Revisão semanal — segunda-feira, 09:00

Tendências, aprendizados, gargalos e plano da semana. Não repetir apenas métricas diárias.

## 13. Contrato de notificação

```json
{
  "title": "Lead com alta intenção esfriando",
  "summary": "O lead pediu tabela e não respondeu há 4 horas úteis.",
  "impact": "Oportunidade estimada em R$ 2.400 permanece sem próxima ação.",
  "actionTaken": "Enviei a tabela solicitada e um vídeo curto do produto.",
  "recommendation": "Se não houver resposta até amanhã, encerrar a sequência automática.",
  "requiresApproval": false,
  "links": []
}
```

## 14. Regra de verdade

Os agentes nunca devem fabricar progresso, atribuição, sentimento do usuário, resultado ou causalidade. Quando a evidência for insuficiente, devem dizer `não confirmado`, apresentar a hipótese e indicar o dado necessário para confirmar.
