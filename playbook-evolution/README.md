# Playbook — Tracking WhatsApp via Evolution API + N8N

**Versão:** v1.0 🟡 Esqueleto  
**Última atualização:** 2026-06-09  
**Escopo:** CTWA direto (anúncio Meta → WhatsApp, sem LP intermediária) — sem CRM  
**Tipo:** Playbook genérico (reutilizável, parametrizável por cliente)  
**Stack:** Evolution API (Baileys) + N8N + Meta CAPI

---

## Objetivo

Enviar eventos de Lead e Purchase para o Pixel da Meta via CAPI sem depender de CRM. A Evolution API monitora as conversas do WhatsApp e, ao identificar mensagens específicas via webhook, o N8N dispara os eventos.

## Por que Evolution API + N8N?

Diferente dos playbooks com Datacrazy ou Kommo, esta abordagem **não usa CRM algum**:

- **Zero dependência de CRM** — ideal para quem não tem ou não quer pagar CRM
- **Flexibilidade total** — qualquer mensagem/texto vira gatilho de evento
- **Stack open source** — Evolution API é gratuita (Apache 2.0), N8N tem plano free
- **Baixo custo** — só precisa de um VPS (ou Docker local)

## Arquitetura

```
Anúncio Meta (CTA: Enviar mensagem)
        │
        ▼
   WhatsApp (usuário conversa)
        │
        ▼
   Evolution API (Baileys) ← self-hosted
        │
        ▼
   Webhook MESSAGES_UPSERT → N8N
        │
        ▼
   Classificador (match de texto)
        │
        ├─ Lead identificado → Meta CAPI (action_source: phone_call)
        └─ Purchase identificado → Meta CAPI + value
```

### Eventos cobertos

| Evento | Gatilho | O que envia |
|--------|---------|-------------|
| `Lead` | Mensagem de lead identificada | Hash do telefone + `phone_call` |
| `Purchase` | Mensagem de confirmação/pagamento | Hash do telefone + `value` (R$) |

### Limitações (vs CRM)

- Sem `ctwa_clid` — atribuição por hash de telefone apenas (`action_source: phone_call`)
- Risco de blocking — Baileys não é via oficial Meta
- Sem estado de lead — o N8N precisa gerenciar estado manualmente

## Pipeline de passos

| # | Passo | Arquivo | Status |
|---|-------|---------|--------|
| 1 | Cenário e arquitetura | [01-cenario-e-arquitetura.md](01-cenario-e-arquitetura.md) | 🟡 Esqueleto |
| 2 | Deploy da Evolution API | [02-deploy-evolution-api.md](02-deploy-evolution-api.md) | 🟡 Esqueleto |
| 3 | Webhook + N8N | [03-webhook-e-n8n.md](03-webhook-e-n8n.md) | 🟡 Esqueleto |
| 4 | Classificador de mensagens | [04-classificador-mensagens.md](04-classificador-mensagens.md) | 🟡 Esqueleto |
| 5 | Conexão CAPI + testes | [05-capi-e-testes.md](05-capi-e-testes.md) | 🟡 Esqueleto |

**Tempo total estimado:** ~2-3h (depende da familiaridade com Docker/VPS)

## Pré-requisitos

| Requisito | Por quê |
|-----------|---------|
| Servidor/VPS com Docker | Para rodar Evolution API + Redis + PostgreSQL |
| Número WhatsApp ativo | Será pareado via QR Code (WhatsApp Web) |
| Conta Meta Business Manager | Onde o Pixel e o System Token residem |
| Pixel do cliente criado | Events Manager > Configurações |
| N8N (self-hosted ou cloud) | Middleware de webhook, classificação e CAPI |

## Validação

🟡 Este playbook é **esqueleto teórico** — não foi testado em produção. O piloto está pendente.
