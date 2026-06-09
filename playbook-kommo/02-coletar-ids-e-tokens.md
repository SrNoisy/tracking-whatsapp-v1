# Passo 2: Coletar IDs e Tokens

Antes de criar o workflow, colete os seguintes dados do cliente.

## Meta Business Manager

| Item | Onde encontrar | Placeholder |
|------|---------------|-------------|
| **Pixel ID** | Events Manager → Configurações | `[SEU_PIXEL_ID]` |
| **System Token** | Business Settings → System Users → [seu user] → Generate Token | `[SEU_SYSTEM_TOKEN]` |
| **Meta API Version** | Docs da Meta | `v21.0` |

## Kommo

### API Token (Bearer)

1. Kommo → Settings → API → API Keys → Generate
2. Escopo mínimo: `crm`, `files`, `notifications`
3. Copie o token JWT gerado

| Item | Placeholder |
|------|-------------|
| **API Token** | `[SEU_KOMOO_TOKEN]` |
| **Subdomain** | `[cliente].kommo.com` |
| **API Domain** | `api-g.kommo.com` (ou `api-h` se Europa) |

### Pipeline e estágios

Identifique os estágios que disparam eventos:

```
Pipeline: Funil de vendas (ID: [PIPELINE_ID])
  ├── [STATUS_LEAD_ID] — Etapa de leads de entrada → evento Lead
  ├── ...
  └── 142 — Fechado - ganho → evento Purchase
```

Use a API para listar:

```bash
curl -s "https://[cliente].kommo.com/api/v4/leads/pipelines/[PIPELINE_ID]" \
  -H "Authorization: Bearer [SEU_KOMOO_TOKEN]"
```

### Campos customizados do Contato

Identifique o field_id do telefone comercial:

```bash
curl -s "https://[cliente].kommo.com/api/v4/contacts/custom_fields" \
  -H "Authorization: Bearer [SEU_KOMOO_TOKEN]"
```

| Campo esperado | Field ID | Enum |
|----------------|----------|------|
| Telefone | `720572` | `WORK` (comercial) |

### `price` como valor da venda

No Kommo, o valor da venda é o campo nativo `price` do lead — **não** é um campo customizado. O campo `price` já vem em todas as respostas de `GET /api/v4/leads/{id}`.

## N8N

| Item | Onde encontrar |
|------|---------------|
| **Webhook URL** | Será gerado ao criar o workflow |
| **API Key** | N8N Settings → API → Generate |

## Template de config

Crie um arquivo `capi-config.json` na raiz do projeto do cliente:

```json
{
  "pixel_id": "[SEU_PIXEL_ID]",
  "kommo_subdomain": "[cliente].kommo.com",
  "kommo_api_domain": "api-g.kommo.com",
  "kommo_pipeline_id": "[PIPELINE_ID]",
  "kommo_status_lead_id": "[STATUS_LEAD_ID]",
  "kommo_status_purchase_id": "142",
  "kommo_phone_field_id": "[PHONE_FIELD_ID]",
  "meta_api_version": "v21.0",
  "n8n_webhook_path": "[caminho-para-webhook]",
  "action_source": "phone_call"
}
```

> **⚠️ ATENÇÃO:** Tokens (Kommo e Meta) são sensíveis — não commitar. O template acima NÃO inclui tokens.
