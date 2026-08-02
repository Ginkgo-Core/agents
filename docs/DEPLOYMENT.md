# Implantação

## Desenvolvimento

```bash
cp .env.example .env
make secrets
make validate
make up
```

Depois:

1. abrir n8n e criar owner;
2. configurar credenciais manualmente;
3. executar setup inicial do Hermes no volume;
4. criar profiles `callima`, `nyra` e `alfred`;
5. importar workflows sem credenciais;
6. conectar Datacrazy e canais;
7. habilitar Evolution com profile `channels`.

## Produção

- Linux/VPS via SSH;
- HTTPS e reverse proxy;
- portas internas não expostas publicamente;
- imagens fixadas por versão/digest;
- backups de PostgreSQL e volumes;
- secrets manager ou Docker secrets;
- rotação de tokens;
- monitoramento de disco e filas;
- n8n main, worker e runners na mesma versão;
- MinIO/S3 para mídia;
- políticas de retenção.

## Ordem de boot

1. PostgreSQL e Redis;
2. LiteLLM;
3. n8n e worker;
4. Control Plane e worker;
5. Hermes;
6. channels/media opcionais.

## Smoke tests

```bash
curl -fsS http://localhost:8088/health
curl -fsS http://localhost:4000/health/liveliness
curl -fsS -H "Authorization: Bearer $INTERNAL_SERVICE_TOKEN" http://localhost:8088/v1/agents
```

## Rollback

- infraestrutura: reverter tag do compose;
- workflows: importar versão anterior;
- agentes: desabilitar no banco;
- Alfred: desligar `ALFRED_MUTATIONS_ENABLED`;
- canais: pausar profile ou instância;
- incidentes: preservar audit log e snapshots.
