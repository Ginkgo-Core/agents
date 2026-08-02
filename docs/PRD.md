# PRD — Ginkgo Agents AI Talents

## Produto

Protótipo operacional de uma linha multiagente de aquisição e conversão.

```text
Nyra gera atenção e demanda
        ↓
Alfred distribui, mede e otimiza
        ↓
Callima atende, qualifica e converte
        ↓
CRM devolve resultado e qualidade
        ↺
```

## Objetivo do evento

Provar, com operação real e métricas auditáveis, que agentes especializados podem cooperar para gerar oportunidades comerciais sem depender de um chatbot monolítico.

## Usuários

- operador da Ginkgo;
- equipe comercial;
- gestor de conteúdo;
- gestor de tráfego;
- avaliadores do evento;
- leads atendidos pela Callima.

## Escopo do MVP

### Callima

- WhatsApp texto, áudio e imagem;
- atendimento e qualificação;
- consulta de base comercial;
- agendamento;
- CRM Datacrazy;
- follow-up;
- handoff humano;
- voz ElevenLabs;
- registro de outcome.

### Nyra

- calendário editorial;
- pesquisa e briefing;
- copy por plataforma;
- geração de imagem e vídeo;
- armazenamento de artefatos;
- aprovação humana;
- publicação por APIs autorizadas;
- coleta de métricas;
- criação de lead signal para Callima.

### Alfred

- ingestão Meta Ads, TikTok Ads e UTMify;
- vínculo entre campanha, lead, oportunidade e receita;
- snapshots imutáveis;
- diagnóstico e recomendação;
- mutações governadas após aprovação;
- rollback;
- resumo por texto e voz.

## Não objetivos

- construir CRM próprio;
- substituir `ginkgo-workforce`;
- criar modelo de IA próprio;
- automatizar navegador para burlar limitações de APIs;
- rotacionar contas gratuitas para contornar quotas;
- permitir autonomia financeira irrestrita;
- publicar ou alterar campanhas sem auditoria.

## Critérios de sucesso

1. Uma interação gerada pela Nyra ou Alfred chega à Callima com origem rastreável.
2. Callima cria ou atualiza oportunidade no Datacrazy.
3. A qualidade comercial volta a Alfred e Nyra.
4. Toda a jornada compartilha `correlation_id`.
5. Ações sensíveis possuem approval, autor e timestamp.
6. O scorecard diário mostra impacto e custo.

## Prioridade

P0: núcleo, Callima e rastreamento.
P1: Nyra com aprovação e publicação.
P1: Alfred read-only.
P2: Alfred com mutações governadas.
P2: voz completa para Nyra e Alfred.
