# Passo 3: Webhook + N8N

🟡 **Esqueleto** — fluxo básico do N8N, pendente de validação.

## Fluxo no N8N

```
[Webhook (POST)] → [Set: extrair dados] → [Function: classificar] → [Switch: Lead / Purchase / ignorar]
                                                                    │
                                           ┌────────────────────────┴──────────────┐
                                           ▼                                       ▼
                                   [HTTP Request: Meta CAPI Lead]          [HTTP Request: Meta CAPI Purchase]
```

## Payload do Evolution API (MESSAGES_UPSERT)

```json
{
  "event": "messages.upsert",
  "instance": "tracking-cliente-x",
  "data": {
    "key": {
      "remoteJid": "556699999999@s.whatsapp.net",
      "fromMe": false
    },
    "pushName": "João",
    "message": {
      "conversation": "Opa, confirmei meu pedido, já paguei"
    },
    "messageType": "conversation"
  }
}
```

## Extrair dados para CAPI

No N8N, usar nó **Set** para mapear:

| Campo | Origem |
|-------|--------|
| `phone` | `$json.data.key.remoteJid` (remover `@s.whatsapp.net`) |
| `phone_hash` | SHA-256 do phone (nó Code function) |
| `text` | `$json.data.message.conversation` |
| `timestamp` | `$json.data.messageTimestamp` |

---

> ⚠️ **Pendências:**
> - Validar todos os `messageType` possíveis (extendedTextMessage, imageMessage, etc.)
> - Testar dedup no N8N — mesma mensagem não pode gerar 2 eventos
> - Definir timeout e retry do webhook no Evolution API
> - Incluir template JSON exportável do workflow N8N
