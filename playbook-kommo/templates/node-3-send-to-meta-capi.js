// ===============================
// Nó 3 — Send to Meta CAPI
// SHA-256 hash do telefone
// Envia evento Lead/Purchase pro Pixel
// ===============================

const crypto = require('crypto');
const data = $input.first().json;

// Limpar e hashear telefone
const cleanPhone = data.phone.replace(/[^0-9]/g, '');
const phoneHash = crypto.createHash('sha256').update(cleanPhone).digest('hex');

// Montar payload CAPI
const capiPayload = {
  data: [{
    event_name: data.eventName,
    event_time: Math.floor(Date.now() / 1000),
    action_source: 'phone_call',
    user_data: { ph: [phoneHash] }
  }],
  access_token: '[SEU_SYSTEM_TOKEN]'
};

// Se for Purchase, incluir valor
if (data.eventName === 'Purchase') {
  capiPayload.data[0].custom_data = {
    value: data.price,
    currency: 'BRL'
  };
}

// Enviar pra Meta
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
