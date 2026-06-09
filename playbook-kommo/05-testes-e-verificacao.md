# Passo 5: Testar e Verificar

## 5.1 Teste manual via N8N (simular Kommo)

Enquanto não chega um lead real, teste com `curl` simulando o payload exato do Kommo:

```bash
curl -X POST "https://[seu-n8n]/webhook/[cliente]-capi" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "leads[status][0][id]=[LEAD_ID]&leads[status][0][status_id]=[STATUS_LEAD_ID]&leads[status][0][pipeline_id]=[PIPELINE_ID]&leads[status][0][old_status_id]=[OLD_STATUS]&account[id]=[ACCOUNT_ID]&account[subdomain]=[SUBDOMAIN]"
```

**Resposta esperada:**
```json
{"message":"Workflow was started"}
```

## 5.2 Verificar execução no N8N

1. N8N → Workflows → [seu workflow]
2. Aba **Executions**
3. A execução mais recente deve mostrar:

```
✅ Webhook           (200, POST)
✅ 1. Parse & Route  (output: { eventName, leadId, ... })
✅ 2. Fetch Kommo    (output: { phone, price, ... })
✅ 3. Send to CAPI   (output: { success: true, meta_response: { events_received: 1 } })
```

Se algum nó estiver vermelho, clicar nele mostra o erro.

## 5.3 Verificar no Meta Events Manager

1. [Business.facebook.com/events_manager](https://business.facebook.com/events_manager)
2. Selecione o Pixel do cliente
3. Aba **Diagnostics** ou **Activity**
4. Filtre por **Event Name = Lead** ou **Purchase**
5. Confirme que o evento aparece com `events_received: 1`

## 5.4 Teste com lead real

Quando um lead real entrar via CTWA:

1. Aguarde o lead cair no estágio configurado
2. Verifique a execução no N8N
3. Verifique o evento no Meta Events Manager (pode levar alguns minutos)

## 5.5 Métricas de sucesso

| Indicador | Meta | Como medir |
|-----------|------|------------|
| Eventos recebidos | `events_received: 1` | Response da Meta CAPI no nó 3 |
| Latência | < 2s do webhook ao CAPI | N8N execution timestamps |
| Taxa de acerto | 100% dos leads com telefone | Nenhum erro "Telefone nao encontrado" |
| Atribuição | Lead/Purchase aparecendo no Pixel | Meta Events Manager |

## 5.6 Problemas comuns

### "Malformed access token"

System Token inválido ou corrompido.

**Solução:** Regenerar token no Meta Business Settings > System Users.

### Nó 2: "Nenhum contato vinculado"

O lead não tem um contato associado.

**Verificação:**
```bash
curl -s "https://[cliente].kommo.com/api/v4/leads/[LEAD_ID]/links" \
  -H "Authorization: Bearer [TOKEN]"
```

**Solução:** Verificar se a integração que cria leads no Kommo também cria/víncula um contato com telefone.

### Nó 2: "Telefone nao encontrado"

O contato existe mas o campo de telefone não foi preenchido.

**Verificação:**
```bash
curl -s "https://[cliente].kommo.com/api/v4/contacts/[CONTACT_ID]" \
  -H "Authorization: Bearer [TOKEN]"
```

**Solução:** Verificar field_id do telefone e se o contato tem o campo preenchido.

### Nó 3: HTTP 400 no Meta CAPI

Payload inválido para a Meta.

**Causas comuns:**
- Token mal formatado
- `ph` array vazio
- `event_time` muito antigo (> 7 dias do passado ou > 1 hora no futuro)

## 5.7 Checklist de Go-Live

- [ ] Workflow ativo no N8N
- [ ] Webhook configurado no Digital Pipeline (Lead + Purchase)
- [ ] Teste manual com `curl` passou nos 3 nós
- [ ] Meta Events Manager mostra evento recebido
- [ ] Lead real testado no ambiente de produção
- [ ] Phone hash SHA-256 confirmado (formato hexadecimal de 64 caracteres)
- [ ] Token do Meta não expira nos próximos 30 dias
