# Passo 2: Deploy da Evolution API

🟡 **Esqueleto** — instruções genéricas; validar versão e compatibilidade.

## Opção A: Docker Compose (recomendado)

```yaml
version: '3.8'

services:
  evolution-api:
    image: evoapicloud/evolution-api:latest
    container_name: evolution-api
    ports:
      - "8080:8080"
    environment:
      AUTHENTICATION_API_KEY: sua-api-key-aqui
      DATABASE_ENABLED: "true"
      DATABASE_PROVIDER: postgresql
      DATABASE_CONNECTION_URI: postgresql://user:pass@postgres:5432/evolution
      CACHE_REDIS_ENABLED: "true"
      CACHE_REDIS_URI: redis://redis:6379
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: evolution

  redis:
    image: redis:7-alpine
```

## Opção B: Coolify / VPS manual

1. Clone o repositório: `git clone https://github.com/EvolutionAPI/evolution-api.git`
2. Configure `.env` (baseado no `.env.example`)
3. Rode `docker compose up -d`
4. Acesse a API em `http://seu-servidor:8080`

## Criar instância WhatsApp

```bash
curl -X POST http://localhost:8080/instance/create \
  -H "apikey: sua-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "instanceName": "tracking-cliente-x",
    "qrcode": true
  }'
```

Escaneie o QR code exibido com o WhatsApp do número que será monitorado.

## Configurar Webhook

```bash
curl -X POST http://localhost:8080/webhook/set/tracking-cliente-x \
  -H "apikey: sua-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": true,
    "url": "https://seu-n8n.com/webhook/whatsapp-message",
    "events": ["MESSAGES_UPSERT"]
  }'
```

---

> ⚠️ **Pendências:**
> - Testar persistência de sessão (contêiner reinicia, perde o QR?)
> - Qual a versão estável atual?
> - Precisa de proxy reverso? (Nginx + SSL)
