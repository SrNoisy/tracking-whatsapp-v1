// ===============================
// Nó 2 — Fetch Kommo Data
// Busca lead, links e contato na API Kommo
// Extrai telefone e price
// ===============================

const data = $input.first().json;
const leadId = data.leadId;

// Fetch lead (pra pegar o price)
const leadResponse = await this.helpers.httpRequest({
  method: 'GET',
  url: `https://[cliente].kommo.com/api/v4/leads/${leadId}`,
  headers: { 'Authorization': `Bearer [SEU_KOMOO_TOKEN]` }
});

// Fetch links pra encontrar o contato
const linksResponse = await this.helpers.httpRequest({
  method: 'GET',
  url: `https://[cliente].kommo.com/api/v4/leads/${leadId}/links`,
  headers: { 'Authorization': `Bearer [SEU_KOMOO_TOKEN]` }
});

const links = linksResponse?._embedded?.links || [];
const contactLink = links.find(l => l.to_entity_type === 'contacts');
if (!contactLink) throw new Error(`Nenhum contato vinculado ao lead ${leadId}`);

const contactId = contactLink.to_entity_id;

// Fetch contato pra extrair telefone
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
