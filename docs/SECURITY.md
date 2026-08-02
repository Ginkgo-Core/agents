# Segurança e governança

## Modelo de ameaça

Principais riscos:

- prompt injection em documentos e mensagens;
- tool call indevida;
- vazamento de token;
- duplicação de publicação ou gasto;
- webhook falso;
- campanha alterada fora dos limites;
- mídia maliciosa;
- acesso cruzado entre agentes.

## Controles obrigatórios

- autenticação interna por bearer token;
- assinatura/segredo nos webhooks;
- allowlist de tools por agente;
- schema validation;
- approval em risco médio/alto;
- idempotency key;
- rate limits;
- timeouts;
- auditoria imutável por correlação;
- feature flags;
- kill-switch por agente e tool;
- segredos fora do Git.

## Alfred

- read-only por padrão;
- `ALFRED_MUTATIONS_ENABLED=false` no bootstrap;
- limite máximo de variação diária;
- snapshot antes e depois;
- campanhas novas pausadas;
- sem exclusão automática;
- targeting, orçamento e publicação exigem approval;
- releitura do objeto após mutação.

## Nyra

- aprovação antes de publicar;
- validação de MIME e tamanho;
- artefatos com checksum;
- sem uso de material protegido sem licença;
- sem automação de navegador para contornar políticas.

## Callima

- minimização de dados pessoais;
- handoff em temas sensíveis ou exceções;
- dados comerciais estruturados prevalecem sobre RAG;
- opt-out e consentimento registrados;
- sem ações financeiras autônomas.

## Hermes

- sem Docker socket;
- sem acesso direto ao banco externo;
- sem credenciais administrativas;
- hard stop para loops deve ser ativado no profile;
- profiles e diretórios de estado separados quando necessário.
