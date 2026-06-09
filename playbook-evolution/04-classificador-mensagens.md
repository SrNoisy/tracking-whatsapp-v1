# Passo 4: Classificador de Mensagens

🟡 **Esqueleto** — lógica de classificação, pendente de calibragem.

## Lógica

No Nó **Function** do N8N (ou nó Code), aplicar:

```javascript
const text = $input.first().json.data.message.conversation || '';
const remoteJid = $input.first().json.data.key.remoteJid;

// Normalizar
const normalized = text.toLowerCase().trim();

// Rules
const LEAD_KEYWORDS = [
  'quero', 'orçamento', 'preço', 'valor', 'quanto custa',
  'gostaria', 'tenho interesse', 'informação', 'info'
];

const PURCHASE_KEYWORDS = [
  'confirma', 'pedido', 'pago', 'comprovante', 'pagamento',
  'finalizei', 'concluído', 'obrigado', 'fechado'
];

if (PURCHASE_KEYWORDS.some(kw => normalized.includes(kw))) {
  return { action: 'purchase', phone: remoteJid, text };
}
if (LEAD_KEYWORDS.some(kw => normalized.includes(kw))) {
  return { action: 'lead', phone: remoteJid, text };
}
return { action: 'ignore' };
```

## Estado da conversa

Para evitar re-trigger na mesma conversa, usar Redis ou nó **n8n Cache**:

```javascript
// Verificar se já processamos este remoteJid nesta "sessão"
const cacheKey = `conversa:${phone}:lead_sent`;
const alreadySent = await redis.get(cacheKey);
if (alreadySent) return { action: 'ignore' };

// Se for lead, marcar como já processado por 30 min
await redis.set(cacheKey, '1', 'EX', 1800);
```

---

> ⚠️ **Pendências:**
> - Precisa de corpus real de conversas pra calibrar as keywords
> - Validar falso positivo (ex: "obrigado" pode ser só cortesia, não compra)
> - Decidir: classificação no N8N ou em serviço separado (FastAPI)?
> - Adicionar suporte a mensagens com mídia (imagem de comprovante?)
