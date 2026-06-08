# tracking-whatsapp-v1

Playbooks para tracking de campanhas Meta + Google Ads quando o lead vai pro WhatsApp em vez de um formulário.

---

## Problema

Quando o anúncio manda o lead pro WhatsApp (CTWA direto ou via LP com botão), a cadeia de identidade entre o clique no anúncio e a venda fechada quebra. Sem identidade, a plataforma de mídia não recebe sinal de qualidade, a otimização degrada e o CPL sobe.

## Stack cobertas

### Datacrazy + Meta CAPI (JavaScript blocks)

Playbook replicável pra quem usa **Datacrazy** como CRM com WhatsApp Cloud API. Usa automações nativas do Datacrazy com blocos JavaScript pra enviar eventos `Lead` e `Purchase` direto pro Pixel da Meta — **sem N8N, sem webhooks, sem infra extra**.

Pasta [`playbook-datacrazy/`](/playbook-datacrazy/) — ver [README do playbook](/playbook-datacrazy/README.md).

| Passo | Arquivo | Status |
|-------|---------|--------|
| 1. Cenário e arquitetura | [01-cenario-e-arquitetura.md](/playbook-datacrazy/01-cenario-e-arquitetura.md) | ✅ Documentado |
| 2. Coletar IDs e tokens | [02-coletar-ids-e-tokens.md](/playbook-datacrazy/02-coletar-ids-e-tokens.md) | ✅ Documentado |
| 3. Setup Meta App + WABA Dataset | [03-setup-meta-app-e-waba.md](/playbook-datacrazy/03-setup-meta-app-e-waba.md) | ✅ Documentado |
| 4. Automação Lead no Datacrazy | [04-automacao-lead.md](/playbook-datacrazy/04-automacao-lead.md) | ✅ Documentado |
| 5. Automação Purchase (opcional) | [05-automacao-purchase.md](/playbook-datacrazy/05-automacao-purchase.md) | ✅ Documentado |
| 6. Testes e verificação | [06-testes-e-verificacao.md](/playbook-datacrazy/06-testes-e-verificacao.md) | ✅ Documentado |

### Kommo CRM

Playbook para tracking CTWA via Kommo CRM. Cobre CAPI nativo (trilha A) e híbrido com N8N (trilha B). Pasta [`playbook-kommo/`](/playbook-kommo/).

### Zendesk Sunshine + N8N

Playbook para tracking CTWA via Zendesk Sunshine + RD Station + N8N. Pasta [`playbook-zendesk-sunshine/`](/playbook-zendesk-sunshine/).

---

## Convenções

- pt-BR
- Markdown puro, sem build, sem CI
- Status: ✅ = documentado · 🟡 = esqueleto, incompleto
- IDs sensíveis sempre como `[SEU_ID]` — cada implementador preenche seu `capi-config.json`

## Status geral

- **Datacrazy:** ✅ Passos 1 a 6 documentados e testados em produção (ACMAX, Junho 2026)
- **Kommo:** Trilha A documentada, Trilha B com 1 dependência a validar
- **Zendesk:** Passos 1-2 executáveis, 3-4 em esqueleto
