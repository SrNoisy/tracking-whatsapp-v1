# Playbook — Tracking WhatsApp via Datacrazy + Meta CAPI

**Versão:** v1.0  
**Última atualização:** 2026-06-08  
**Escopo:** CTWA direto (anúncio Meta → WhatsApp, sem LP intermediária)  
**Tipo:** Playbook genérico (reutilizável, parametrizável por cliente)  
**Stack:** Datacrazy (CRM) + Meta CAPI (Pixel) — sem N8N, sem webhooks externos

---

## Objetivo

Enviar eventos de Lead e Purchase do Datacrazy para o Pixel da Meta via CAPI (Conversions API), garantindo atribuição correta de conversões de anúncios Click-to-WhatsApp (CTWA).

## Por que Datacrazy + JavaScript blocks?

Diferente de outros CRMs que exigem N8N ou webhooks externos pra fazer CAPI, o Datacrazy permite executar JavaScript (`fetch()`) diretamente nas automações. Isso significa:

- **Sem infra extra** — não precisa de N8N, Cloud Run, Stape ou nenhum middleware
- **Latência mínima** — o evento sai direto do Datacrazy pra Meta
- **Custo zero de infra** — já incluso no plano Essential+
- **Acesso nativo ao `ctwa_clid`** — o Datacrazy salva automaticamente o `sourceReferral.ctwaId` ao receber uma mensagem CTWA via Cloud API

## Arquitetura

```
CTWA Ad → WhatsApp → Meta Cloud API → Datacrazy
                                         │
                              Automação (Mensagem Recebida)
                                         │
                              Bloco JavaScript (fetch)
                                         │
                              Meta CAPI → Pixel do cliente
```

### Eventos cobertos

| Evento | Gatilho | O que envia |
|--------|---------|-------------|
| `Lead` | Mensagem Recebida (com `ctwaId`) | `ctwa_clid` apenas |
| `Purchase` | Negócio movido para etapa de pagamento | `ctwa_clid` + `value` (R$) |

### Diferencial competitivo

Recurso | Datacrazy | Kommo (nativo) | Zendesk + N8N
--------|-----------|----------------|---------------
Envio CAPI direto | ✅ Nativo (JS block) | ✅ Nativo | ❌ Precisa N8N
`ctwa_clid` exposto | ✅ `session.getValue("leadCtwaId")` | ⚠️ Só interno | ✅ Webhook
Eventos custom | ✅ Total (qualquer payload) | ❌ Só Lead/Purchase | ✅ Total
Infra extra | ❌ Nenhuma | ❌ Nenhuma | ❌ N8N + Sheets
Custo mensal extra | R$ 0 | R$ 0 | R$ ~50-200 (N8N)
Dedup `event_id` | ✅ Manual | ✅ Automático | ✅ Manual

## Pipeline de passos

| # | Passo | Arquivo | Tempo |
|---|-------|---------|-------|
| 1 | Entender cenário e arquitetura | [01-cenario-e-arquitetura.md](01-cenario-e-arquitetura.md) | 5 min |
| 2 | Coletar IDs e gerar tokens | [02-coletar-ids-e-tokens.md](02-coletar-ids-e-tokens.md) | 15 min |
| 3 | Setup Meta App + WABA Dataset | [03-setup-meta-app-e-waba.md](03-setup-meta-app-e-waba.md) | 10 min |
| 4 | Criar automação de Lead | [04-automacao-lead.md](04-automacao-lead.md) | 10 min |
| 5 | Criar automação de Purchase (opcional) | [05-automacao-purchase.md](05-automacao-purchase.md) | 10 min |
| 6 | Testar e verificar | [06-testes-e-verificacao.md](06-testes-e-verificacao.md) | 10 min |

**Tempo total estimado:** ~45-60 min

## Templates

Na pasta [`templates/`](templates/):

| Arquivo | Uso |
|---------|-----|
| `capi-config-template.json` | Preencher com IDs do cliente |
| `capi-lead.js` | Bloco JavaScript — copiar e colar no Datacrazy |
| `capi-purchase.js` | Bloco JavaScript — copiar e colar no Datacrazy |

## Pré-requisitos do cliente

| Requisito | Por quê |
|-----------|---------|
| Datacrazy plano Essential+ | Automações com JavaScript block exigem Essential ou superior |
| WhatsApp Cloud API conectado no Datacrazy | A conexão oficial Cloud API carrega o `ctwa_clid` automaticamente |
| Conta Meta Business Manager | Onde o Pixel e o System Token residem |
| Pixel do cliente criado | Events Manager > Configurações |
| Anúncios CTWA ativos | Sem CTWA não há `ctwa_clid` pra capturar |

## Validação

Este playbook foi **testado e validado em produção** (ACMAX, Junho 2026). O piloto confirmou:
- Captura automática do `ctwa_clid` pelo Datacrazy via Cloud API
- Envio bem-sucedido do evento Lead via CAPI (`events_received: 1`)
- Deduplicação funcional via `event_id` + tag `capi_lead`
- Purchase com `businessTotal` como `value`
