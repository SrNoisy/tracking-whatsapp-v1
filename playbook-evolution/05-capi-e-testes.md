# Passo 5: Conexão CAPI + Testes

🟡 **Esqueleto** — estrutura do payload CAPI, pendente de validação empírica.

## Payload Meta CAPI — Evento Lead

```json
{
  "data": [
    {
      "event_name": "Lead",
      "event_time": "[TIMESTAMP]",
      "action_source": "phone_call",
      "event_id": "[SHA256_PHONE]_lead_[TIMESTAMP]",
      "user_data": {
        "ph": "[SHA256_PHONE]"
      }
    }
  ]
}
```

## Payload Meta CAPI — Evento Purchase

```json
{
  "data": [
    {
      "event_name": "Purchase",
      "event_time": "[TIMESTAMP]",
      "action_source": "phone_call",
      "event_id": "[SHA256_PHONE]_purchase_[TIMESTAMP]",
      "user_data": {
        "ph": "[SHA256_PHONE]"
      },
      "custom_data": {
        "currency": "BRL",
        "value": 0
      }
    }
  ]
}
```

## Envio via N8N (HTTP Request)

| Campo | Valor |
|-------|-------|
| URL | `https://graph.facebook.com/v21.0/[PIXEL_ID]/events` |
| Method | POST |
| Headers | `Authorization: Bearer [TOKEN]` |
| Body | JSON acima |

## Testes

### Testar webhook do Evolution

Enviar mensagem para o número monitorado e verificar se chega no N8N:

```bash
# No Evolution API
GET http://localhost:8080/webhook/find/tracking-cliente-x
```

### Testar CAPI com Meta Test Events

1. Acessar Events Manager > Pixel > "Test Events" (ou "Diagnóstico")
2. Enviar mensagem de teste no WhatsApp
3. Verificar se o evento aparece como "Recebido" no Meta

### Verificar dedup

Enviar 2x o mesmo texto — apenas 1 evento deve aparecer no Meta.

---

> ⚠️ **Pendências:**
> - Validar qual versão da Graph API usar (v21.0?)
> - Testar se o Meta aceita `phone_call` sem `ctwa_clid`
> - Validar dedup com `event_id` no Meta
> - Definir `value` do Purchase — como extrair de forma confiável?
> - Escrever script de teste automatizado
