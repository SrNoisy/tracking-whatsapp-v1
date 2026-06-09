// ===============================
// Nó 1 — Parse & Route
// Extrai leadId, statusId do webhook
// Decide se envia Lead, Purchase ou skip
// ===============================

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
