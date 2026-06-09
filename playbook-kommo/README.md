# Playbook — Tracking WhatsApp via Kommo + N8N + Meta CAPI

**Versão:** v1.0  
**Última atualização:** 2026-06-08  
**Escopo:** CTWA direto com Kommo CRM + Digital Pipeline + N8N  
**Tipo:** Playbook genérico (reutilizável, parametrizável por cliente)  
**Stack:** Kommo (CRM) + N8N (middleware) + Meta CAPI (Pixel)

---

## Objetivo

Enviar eventos de Lead e Purchase do Kommo para o Pixel da Meta via CAPI, garantindo atribuição correta de conversões de anúncios Click-to-WhatsApp quando não há `ctwa_clid` disponível (atribuição via hash de telefone com `action_source: phone_call`).

## Por que Kommo + N8N?

Diferente de CRMs como Datacrazy que permitem JavaScript nativo, o Kommo exige um middleware para fazer chamadas HTTP externas complexas. O N8N preenche esse gap:

- **Digital Pipeline nativo** — webhooks por etapa, sem Salesbot
- **Form-urlencoded** — Kommo envia dados no formato `leads[status][0][id]`
- **N8N como middleware** — recebe o webhook, busca dados na API Kommo, monta e envia o payload CAPI
- **Custo zero de infra adicional** — N8N já existente na V4

## Arquitetura

```
CTWA Ad → WhatsApp → Kommo (via API)
                              │
                Digital Pipeline Webhook
                              │
                              ▼
                      N8N Webhook Node
                              │
                              ▼
                    1. Parse & Route
                    (extrai leadId, statusId, decide evento)
                              │
                              ▼
                    2. Fetch Kommo Data
                    (GET /leads/{id}, /links, /contacts/{id})
                              │
                              ▼
                    3. Send to Meta CAPI
                    (hash phone, POST /pixel_id/events)
                              │
                              ▼
                      Meta CAPI → Pixel do cliente
```

### Eventos cobertos

| Evento | Gatilho (status_id) | O que envia |
|--------|---------------------|-------------|
| `Lead` | Etapa de leads de entrada | `ph` (SHA-256 do telefone) |
| `Purchase` | Fechado - ganho | `ph` + `value` (price do lead) |

### Diferenciais da abordagem

- **3 Code nodes separados** — cada etapa isolada pra debug visual no N8N
- **Form-urlencoded + JSON** — suporte dual ao formato que o Kommo envia
- **Phone hash** — SHA-256 do telefone do contato (field `720572`)
- **Sem Salesbot** — usa Digital Pipeline webhooks nativos
- **Sem `ctwa_clid`** — usa `action_source: phone_call` com hash de telefone

## Pipeline de passos

| # | Passo | Arquivo | Tempo |
|---|-------|---------|-------|
| 1 | Entender cenário e arquitetura | [01-cenario-e-arquitetura.md](01-cenario-e-arquitetura.md) | 5 min |
| 2 | Coletar IDs e gerar tokens | [02-coletar-ids-e-tokens.md](02-coletar-ids-e-tokens.md) | 15 min |
| 3 | Criar workflow no N8N | [03-criar-workflow-n8n.md](03-criar-workflow-n8n.md) | 20 min |
| 4 | Configurar webhook no Digital Pipeline | [04-configurar-webhook-kommo.md](04-configurar-webhook-kommo.md) | 10 min |
| 5 | Testar e verificar | [05-testes-e-verificacao.md](05-testes-e-verificacao.md) | 10 min |

**Tempo total estimado:** ~60 min

## Templates

Na pasta [`templates/`](templates/):

| Arquivo | Uso |
|---------|-----|
| `capi-config-template.json` | Preencher com IDs do cliente |
| `node-1-parse-and-route.js` | Código do nó "Parse & Route" |
| `node-2-fetch-kommo-data.js` | Código do nó "Fetch Kommo Data" |
| `node-3-send-to-meta-capi.js` | Código do nó "Send to Meta CAPI" |

## Pré-requisitos do cliente

| Requisito | Por quê |
|-----------|---------|
| Kommo com Digital Pipeline ativo | O webhook por etapa só existe no Digital Pipeline |
| N8N (self-hosted ou cloud) | Middleware entre Kommo e Meta CAPI |
| Conta Meta Business Manager | Onde o Pixel e o System Token residem |
| Pixel do cliente criado | Events Manager > Configurações |
| Anúncios CTWA ativos | Necessário pra gerar leads com telefone |
| Contato com Telefone preenchido | O workflow busca phone no campo `720572` |

## Validação

Este playbook foi **testado e validado em produção** (Revinte Pisos, Junho 2026). O piloto confirmou:

- Captura correta do webhook form-urlencoded do Kommo
- Parsing do payload com suporte dual (form-urlencoded e JSON)
- Extração de lead + contato + telefone via API Kommo
- Hash SHA-256 do telefone e envio bem-sucedido ao Meta CAPI
- 3 nós separados para debug visual de cada etapa
