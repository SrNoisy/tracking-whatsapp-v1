# Passo 3: Criar Workflow no N8N

## Visão geral

O workflow tem 3 Code nodes em série:

```
Webhook → [1. Parse & Route] → [2. Fetch Kommo Data] → [3. Send to Meta CAPI]
```

Cada nó é independente — se um falhar, os posteriores não executam e o erro aparece no nó específico.

## 3.1 Criar o workflow

1. N8N → Workflows → Add Workflow
2. Nome: `[Cliente] - CTWA Meta CAPI (Kommo)`
3. Adicionar **Webhook node**:

| Configuração | Valor |
|-------------|-------|
| HTTP Method | `POST` |
| Path | `[cliente]-capi` (ex: `revinte-capi`) |
| Response Mode | `onReceived` |

## 3.2 Nó 1 — Parse & Route (Code node)

Tipo: `n8n-nodes-base.code` (TypeVersion 2)

```javascript
const input = $input.first().json;
const rawBody = input.body || input;

let leadId, statusId;
if (rawBody.leads?.status?.[0]) {
  statusId = String(rawBody.leads.status[0].status_id);
  leadId = String(rawBody.leads.status[0].id);
} else if (rawBody['leads[status][0][id]']) {
  leadId = rawBody['leads[status][0][id]'];
  statusId = String(rawBody['leads[status][0][status_id]']);
} else {
  throw new Error('Payload invalido');
}

let eventName;
if (statusId === '[STATUS_LEAD_ID]') eventName = 'Lead';
else if (statusId === '142') eventName = 'Purchase';
else return [{ json: { skipped: true, status_id: statusId } }];

return [{ json: { leadId, statusId, eventName } }];
```

**O que faz:**
- Extrai `leadId` e `statusId` do payload (form-urlencoded ou JSON)
- Mapeia `statusId` para `Lead` ou `Purchase`
- Retorna `skipped: true` se for outro estágio (o workflow para aqui)

## 3.3 Nó 2 — Fetch Kommo Data (Code node)

```javascript
const data = $input.first().json;
const leadId = data.leadId;

const leadResponse = await this.helpers.httpRequest({
  method: 'GET',
  url: `https://[cliente].kommo.com/api/v4/leads/${leadId}`,
  headers: { 'Authorization': `Bearer [SEU_KOMOO_TOKEN]` }
});

const linksResponse = await this.helpers.httpRequest({
  method: 'GET',
  url: `https://[cliente].kommo.com/api/v4/leads/${leadId}/links`,
  headers: { 'Authorization': `Bearer [SEU_KOMOO_TOKEN]` }
});

const links = linksResponse?._embedded?.links || [];
const contactLink = links.find(l => l.to_entity_type === 'contacts');
if (!contactLink) throw new Error(`Nenhum contato vinculado ao lead ${leadId}`);

const contactId = contactLink.to_entity_id;

const contactResponse = await this.helpers.httpRequest({
  method: 'GET',
  url: `https://[cliente].kommo.com/api/v4/contacts/${contactId}`,
  headers: { 'Authorization': `Bearer [SEU_KOMOO_TOKEN]` }
});

const customFields = contactResponse.custom_fields_values || [];
const phoneField = customFields.find(f => f.field_id === [PHONE_FIELD_ID]);
if (!phoneField?.values?.length) throw new Error(`Telefone nao encontrado no contato ${contactId}`);

const phone = phoneField.values[0].value;

return [{
  json: {
    leadId: data.leadId,
    eventName: data.eventName,
    price: leadResponse.price || 0,
    phone,
    contactId
  }
}];
```

**O que faz:**
- Busca o lead na API Kommo (pra pegar `price`)
- Busca os links do lead (pra encontrar o `contactId`)
- Busca o contato (pra extrair o telefone do campo `[PHONE_FIELD_ID]`)
- Passa `phone`, `price`, `eventName` pro próximo nó

## 3.4 Nó 3 — Send to Meta CAPI (Code node)

```javascript
const crypto = require('crypto');
const data = $input.first().json;

const cleanPhone = data.phone.replace(/[^0-9]/g, '');
const phoneHash = crypto.createHash('sha256').update(cleanPhone).digest('hex');

const capiPayload = {
  data: [{
    event_name: data.eventName,
    event_time: Math.floor(Date.now() / 1000),
    action_source: 'phone_call',
    user_data: { ph: [phoneHash] }
  }],
  access_token: '[SEU_SYSTEM_TOKEN]'
};

if (data.eventName === 'Purchase') {
  capiPayload.data[0].custom_data = {
    value: data.price,
    currency: 'BRL'
  };
}

const metaResponse = await this.helpers.httpRequest({
  method: 'POST',
  url: `https://graph.facebook.com/v21.0/[SEU_PIXEL_ID]/events`,
  headers: { 'Content-Type': 'application/json' },
  body: capiPayload,
  json: true
});

return [{
  json: {
    success: true,
    event: data.eventName,
    lead_id: data.leadId,
    contact_id: data.contactId,
    phone_hash: phoneHash,
    meta_response: metaResponse
  }
}];
```

**O que faz:**
- Limpa o telefone (remove não-dígitos)
- Gera SHA-256 hash
- Monta payload CAPI com `action_source: phone_call`
- Envia pro Pixel via Graph API
- Inclui `value` + `currency` se for Purchase

## 3.5 Conectar os nós

As conexões devem ser:

```
webhook-01 → main[0] → parse-01
parse-01   → main[0] → fetch-01
fetch-01   → main[0] → send-01
```

## 3.6 Ativar o workflow

1. Clique em **Save** (salvar)
2. Clique em **Active** (ativar)
3. Anote a **Webhook URL** gerada:
   `https://[seu-n8n]/webhook/[cliente]-capi`

## Troubleshooting

| Erro | Causa provável | Solução |
|------|---------------|---------|
| Nó 1 falha | Payload inesperado | Verificar se o Kommo está enviando form-urlencoded |
| Nó 2: `Nenhum contato` | Lead sem contato vinculado | O lead precisa ter um contato com telefone |
| Nó 2: `Telefone nao encontrado` | Field ID errado | Conferir field_id do telefone no Kommo |
| Nó 3: HTTP 400 | Token inválido | Regenerar System Token no Meta Business |
| Nó 3: HTTP 401 | Token expirado | System Token expira a cada ~60 dias |
