# Passo 6: Testes e Verificação

## 1. Teste manual via curl

```bash
curl -X POST "https://graph.facebook.com/v22.0/[SEU_PIXEL_ID]/events?access_token=[SEU_TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{
    "data": [{
      "event_name": "Lead",
      "event_time": '"$(date +%s)"',
      "action_source": "phone_call",
      "event_id": "test_manual_'"$(date +%s)"'",
      "user_data": {
        "ctwa_clid": "test_clid_12345"
      }
    }],
    "test_event_code": "TEST12345"
  }'
```

**Resposta esperada:**
```json
{ "events_received": 1, "messages": [] }
```

> ⚠️ `test_event_code` funciona apenas em ambiente de teste. Remova em produção ou o evento não contará.

## 2. Verificar no Meta Events Manager

1. Meta Events Manager > Pixel do cliente
2. Aba **Eventos de Servidor (CAPI)**
3. Deve aparecer `Lead` (e `Purchase` se configurado) com status **Ativo**

## 3. Testar com clique real de CTWA

1. Publique ou ative um anúncio CTWA
2. Clique no anúncio e envie uma mensagem
3. Aguarde ~1-2 minutos
4. Verifique no Events Manager se o evento apareceu

## 4. Verificar log no Datacrazy

1. Datacrazy > Automações > Histórico de Execuções
2. Encontre a execução da automação `CAPI - Lead CTWA`
3. Verifique o `console.log` — deve mostrar:
   - Em caso de sucesso: `CAPI: {"events_received": 1}`
   - Se sem `ctwaId`: `Sem ctwaId — não enviado`

## 5. Verificar dedup

Envie duas mensagens do mesmo lead CTWA. Apenas a primeira deve gerar evento `Lead` — a tag `capi_lead` bloqueia a segunda.

## Problemas comuns

| Sintoma | Causa | Solução |
|---------|-------|---------|
| `events_received: 0` | Token sem permissão ou Pixel errado | Verificar permissões do System Token |
| `Sem ctwaId` | Conexão não é Cloud API | Verificar tipo de conexão no Datacrazy |
| Erro `400` no JS | Payload mal formatado | Verificar JSON do bloco JS |
| Evento aparece como `Teste` | `test_event_code` ainda no payload | Remover o campo no JS de produção |
