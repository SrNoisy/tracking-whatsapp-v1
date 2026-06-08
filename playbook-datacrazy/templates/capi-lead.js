const PIXEL_ID = "[SEU_PIXEL_ID]";
const TOKEN = "[SEU_TOKEN_AQUI]";

const ctwaId = await session.getValue("leadCtwaId");
const leadId = await session.getValue("leadId");

if (!ctwaId) {
  console.log("Sem ctwaId — nao enviado");
  return { sent: false };
}

const payload = {
  data: [{
    event_name: "Lead",
    event_time: Math.floor(Date.now() / 1000),
    action_source: "phone_call",
    event_id: `lead_${leadId}`,
    user_data: {
      ctwa_clid: ctwaId
    }
  }]
};

const res = await fetch(
  `https://graph.facebook.com/v22.0/${PIXEL_ID}/events?access_token=${TOKEN}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }
);
const result = await res.json();
console.log("CAPI:", JSON.stringify(result));
return { sent: true, result };
