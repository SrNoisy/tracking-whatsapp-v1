# Passo 1: Cenário e Arquitetura

🟡 **Esqueleto** — conteúdo preliminar, pendente de validação empírica.

## Cenário coberto

**CTWA Direto (sem CRM)** — o anúncio da Meta tem CTA "Enviar mensagem" que abre o WhatsApp direto. Não há Landing Page nem CRM intermediário.

```
Anúncio Meta (CTA: Enviar mensagem)
        │
        ▼
   WhatsApp (conversa direta)
        │
        ▼
   Evolution API (monitora via Baileys)
        │
        ▼
   Webhook MESSAGES_UPSERT
        │
        ▼
   N8N (classifica + envia CAPI)
        │
        ▼
   Meta CAPI → Pixel do cliente
```

## Por que isso funciona

1. Evolution API mantém uma sessão ativa do WhatsApp Web via Baileys
2. Toda mensagem nova (`MESSAGES_UPSERT`) é enviada como webhook para o N8N
3. O N8N classifica o conteúdo da mensagem contra padrões predefinidos
4. Ao encontrar match (ex: "comprovante", "confirmação", "pago"), dispara o evento via CAPI
5. Meta recebe o evento com hash do telefone e atribui ao anúncio

## O que NÃO está no escopo

- [`ctwa_clid`] capturado via Cloud API — não temos acesso via Baileys
- Landing Page intermediária antes do WhatsApp (Cenário B)
- Google Ads com `gclid`
- Eventos orgânicos ou de indicação
- Eventos intermediários (MQL/SQL)

## Decisões arquiteturais

| Decisão | Escolha | Justificativa |
|---------|---------|---------------|
| Conexão WhatsApp | Baileys (Evolution API) | Gratuito, self-hosted, sem aprovação Meta |
| `action_source` | `phone_call` | Único válido sem clique web |
| Dedup | `event_id` + SHA-256 do telefone | Evita reenvio do mesmo evento |
| Estado da conversa | Redis + N8N | N8N gerencia por `remoteJid` |
| Classificação | Regex + keywords no N8N | Simples, sem ML, sem custo |

## Níveis de maturidade

| Nível | Descrição | Este playbook cobre? |
|-------|-----------|---------------------|
| N1 | Enviar evento Lead pra CAPI | 🟡 Pendente |
| N2 | Enviar Purchase com value | 🟡 Pendente |
| N3 | Eventos intermediários + EMQ ≥ 7,0 | ❌ Fora de escopo |

---

> ⚠️ **Pendências para validar:**
> - Como o Baileys lida com `remoteJid` de números que não estão na agenda?
> - A session do Evolution API sobrevive a restart do container?
> - Precisamos de um rate limit entre mensagens duplicadas?
