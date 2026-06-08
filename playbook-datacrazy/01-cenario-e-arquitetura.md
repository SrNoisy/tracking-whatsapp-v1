# Passo 1: Cenário e Arquitetura

## Cenário coberto

**CTWA Direto** — o anúncio da Meta tem CTA "Enviar mensagem" que abre o WhatsApp direto. Não há Landing Page intermediária.

```
Anúncio Meta (CTA: Enviar mensagem)
        │
        ▼
  WhatsApp Cloud API
        │
        ▼
  Datacrazy (CRM)
        │
        ▼
  Bloco JavaScript → Meta CAPI → Pixel
```

## Por que isso funciona

1. Meta Cloud API entrega a mensagem **com o `ctwa_clid`** (identificador do clique) junto com o payload
2. Datacrazy, ao receber via Cloud API oficial, **salva esse ID automaticamente** no campo `sourceReferral.ctwaId` do lead
3. A automação do Datacrazy acessa esse valor via `session.getValue("leadCtwaId")`
4. O bloco JavaScript envia o `ctwa_clid` de volta pra Meta CAPI
5. **Meta consegue ligar o evento de conversão ao anúncio exato que gerou aquele clique**

## O que NÃO está no escopo

- Landing Page intermediária antes do WhatsApp (Cenário B)
- Google Ads com `gclid`
- Eventos orgânicos ou de indicação
- Eventos de meio de funil (MQL/SQL) — apenas Lead e Purchase

## Decisões arquiteturais

| Decisão | Escolha | Justificativa |
|---------|---------|---------------|
| Envio CAPI | Bloco JavaScript nativo | Sem N8N, sem infra extra, sem custo |
| `action_source` | `phone_call` | Obrigatório pra CTWA (não usar `website`) |
| Dedup | `event_id` + tag no lead | Evita reenvio do mesmo evento |
| Eventos | Só Lead e Purchase | Binário suficiente pra CTWA; Purchase liga value-based bidding |
| Token | System Token (no JS block) | Expira em ~60 dias, mas não expõe segredo do cliente |

## Níveis de maturidade

| Nível | Descrição | Este playbook cobre? |
|-------|-----------|---------------------|
| N1 | Enviar evento Lead pra CAPI | ✅ |
| N2 | Enviar Purchase com value | ✅ |
| N3 | Eventos intermediários + EMQ ≥ 7,0 | ❌ (fora de escopo) |
