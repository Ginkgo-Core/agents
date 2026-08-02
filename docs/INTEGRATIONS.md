# Matriz de integrações

## Compartilhadas

| Sistema | Uso | Método | Autoridade |
|---|---|---|---|
| Datacrazy | CRM, pipeline e resultados | REST/webhook/MCP quando disponível | Callima/Control Plane |
| ElevenLabs | texto-voz, voz e post-call | API, webhook e MCP/webhook tools | adapter de voz |
| LiteLLM | gateway de modelos | OpenAI-compatible API | Control Plane |
| ComfyUI | geração de imagem/vídeo | HTTP queue, history e WebSocket | Nyra adapter |
| PostgreSQL | estado e RAG | SQL | Control Plane |
| Redis/BullMQ | filas e locks | Redis | workers |

## Callima

- Evolution API: WhatsApp inbound/outbound;
- Datacrazy: contato, oportunidade, estágio e timeline;
- Google Calendar: disponibilidade e agendamento;
- ElevenLabs: voz, tools e webhooks pós-chamada;
- catálogo/ERP: dados comerciais estruturados.

## Nyra

- ComfyUI: workflows versionados de imagem e vídeo;
- Gemini image/video APIs: alternativa autorizada;
- Meta Graph API: Instagram e Facebook orgânico;
- TikTok Content Posting API quando aprovada;
- YouTube Data API;
- LinkedIn API quando aprovada;
- storage local/MinIO.

O MVP não automatiza Google Flow por navegador. O caminho confiável é API oficial ou ComfyUI.

## Alfred

- Meta Marketing API: campanhas, conjuntos, anúncios e insights;
- Meta Conversions API: eventos server-side quando aplicável;
- TikTok for Business MCP/API: relatórios e operações autorizadas;
- TikTok Events API;
- UTMify: pedidos, UTMs e atribuição;
- Datacrazy: qualidade do lead e outcome comercial.

## Credenciais

- nunca versionar tokens;
- separar leitura e escrita quando o provedor permitir;
- preferir tokens de sistema/serviço;
- usar escopo mínimo;
- registrar expiração e owner;
- renovar antes de produção;
- mascarar headers e payloads sensíveis nos logs.

## Contrato de adapter

Todo adapter deve implementar:

```ts
interface Adapter<I, O> {
  execute(input: I, context: {
    correlationId: string;
    idempotencyKey: string;
    timeoutMs: number;
  }): Promise<O>;
}
```

Além disso, deve classificar erros em `transient`, `permanent`, `auth`, `rate_limit` ou `policy`.
