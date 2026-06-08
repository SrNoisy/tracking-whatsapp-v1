# Passo 2: Coletar IDs e Gerar Token

Use o template `templates/capi-config-template.json` pra registrar os IDs.

## O que coletar

| ID | Onde encontrar | Exemplo |
|----|----------------|---------|
| **Pixel ID** | Meta Events Manager > Pixel > Configurações | `123456789012345` |
| **WABA ID** | Meta Business > WhatsApp > Contas | `987654321098765` |
| **Phone Number ID** | `curl` (ver abaixo) | `1099862076538796` |
| **Phone** | WhatsApp > números | `+55 11 99999-9999` |
| **Business ID** | Meta Business > Informações | `688438061940796` |
| **Business Manager ID** | URL do Business Manager | `123456789012345` |
| **Page ID** | Meta Business > Páginas | `101725835851667` |
| **Ad Account ID** | Ads Manager > Configurações | `act_123456789` |
| **Pipeline ID** | Datacrazy > Pipeline > URL (`/pipeline/{id}`) | `uuid` |
| **Stage IDs** | API Datacrazy | `uuid` |
| **Connection ID** | Datacrazy > Conexões > API | `69c7dc03...` |

## Phone Number ID via curl

```bash
curl -X GET "https://graph.facebook.com/v22.0/[SEU_WABA_ID]/phone_numbers?access_token=[SEU_TOKEN]"
```

Resposta:
```json
{
  "data": [{
    "id": "1099862076538796",
    "display_phone_number": "+5511999999999"
  }]
}
```

## Pipeline IDs via Datacrazy API

```bash
curl -X GET "https://api.g1.datacrazy.io/api/v1/pipelines" \
  -H "Authorization: Bearer [SEU_DATACRAZY_TOKEN]"
```

Ou pelo navegador: a URL do pipeline no Datacrazy contém o ID.

## Gerar Token de Sistema (Meta)

1. Meta Business Manager > **Usuários do Sistema** > **Adicionar**
2. Nome: `[Cliente] CAPI Token` — Papel: **Admin**
3. Gerar token com permissões:
   - `ads_read`, `ads_management`
   - `business_management`
   - `whatsapp_business_management`, `whatsapp_business_manage_events`
   - `read_insights`
   - `pages_read_engagement`, `pages_show_list`, `pages_read_user_content`

> ⚠️ O token expira em ~60 dias. Crie um lembrete no calendário pra renovar.

## Preencher template

Copie `templates/capi-config-template.json` para `capi-config.json` (não versionar) e preencha todos os campos.
