# Observabilidade e scorecard

## Identificadores

- `correlation_id`: jornada ponta a ponta;
- `idempotency_key`: operação única;
- `run_id`: execução de agente;
- `tool_call_id`: chamada de ferramenta;
- `approval_id`: decisão humana;
- ids externos: mensagem, campanha, conteúdo, chamada e oportunidade.

## Logs

Formato JSON com:

- timestamp;
- level;
- service;
- agent_id;
- correlation_id;
- event_type;
- duration_ms;
- outcome;
- error_class.

Nunca registrar tokens, áudio bruto, conteúdo privado completo ou headers de autenticação.

## Métricas compartilhadas

- runs por agente;
- taxa de sucesso;
- latência p50/p95;
- retries;
- approvals pendentes e expiradas;
- custo por provider;
- jobs em dead letter;
- disponibilidade dos adapters.

## Callima

- tempo de primeira resposta;
- taxa de qualificação;
- oportunidades qualificadas;
- reuniões marcadas;
- recuperação de lead;
- conversão por origem.

## Nyra

- ciclo briefing-publicação;
- taxa de aprovação;
- conteúdos publicados;
- alcance qualificado;
- conversas e leads orgânicos;
- custo por ativo.

## Alfred

- gasto monitorado;
- desperdício detectado;
- custo por oportunidade qualificada;
- pipeline/revenue ROAS;
- recomendações aceitas;
- ganho após realocação;
- rollback rate.

## Evidência do evento

O scorecard diário deve guardar snapshot, não apenas dashboard mutável. Cada resultado precisa apontar para runs e eventos auditáveis.
