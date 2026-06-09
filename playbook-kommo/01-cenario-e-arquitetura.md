# Passo 1: Cenário e Arquitetura

## Cenário coberto

**CTWA Direto** — o anúncio da Meta tem CTA "Enviar mensagem" que abre o WhatsApp direto. O lead chega no Kommo via API de integração (ex: n8n, Zendesk, Ekyte). O telefone do contato é preenchido no campo customizado `720572` (Telefone).

```
Anúncio Meta (CTA: Enviar mensagem)
         │
         ▼
   WhatsApp → Kommo (CRM via API)
         │
         ▼
   Digital Pipeline Webhook → N8N
         │
         ▼
   Meta CAPI → Pixel
```

## Por que N8N + Kommo?

O Kommo não executa JavaScript nativo como o Datacrazy. Para enviar eventos à Meta CAPI, é necessário um middleware. Opções:

| Opção | Prós | Contras |
|-------|------|---------|
| **N8N** (escolhido) | Já existe na infra, flexível, barato | Depende de manter N8N rodando |
| Cloud Run / Stape | Serverless | Mais caro, mais setup |
| Zapier / Make | Sem código | Custo por execução, limites de taxa |

## Estratégia de atribuição

Sem `ctwa_clid`: o Kommo (via integração indireta) não recebe o identificador do clique. A alternativa é usar **hash de telefone**:

```
Telefone do contato → SHA-256 → ph (hash)
```

Com `action_source: phone_call`, a Meta consegue fazer o matching mesmo sem o `ctwa_clid`, desde que o usuário tenha compartilhado o telefone em algum lugar do ecossistema Meta (WhatsApp, Instagram, Facebook).

## O que NÃO está no escopo

- Landing Page intermediária antes do WhatsApp (Cenário B)
- Google Ads com `gclid`
- Eventos orgânicos ou de indicação
- Eventos de meio de funil — apenas Lead e Purchase
- `event_id` dedup (monitorar, não implementado ainda)

## Decisões arquiteturais

| Decisão | Escolha | Justificativa |
|---------|---------|---------------|
| Middleware | N8N (3 Code nodes) | Infra existente, debug visual por nó |
| Formato do payload | Form-urlencoded + JSON | Kommo envia urlencoded nativamente |
| `action_source` | `phone_call` | Único compatível sem `ctwa_clid` |
| Identidade | SHA-256 do telefone | Meta faz matching mesmo sem click ID |
| Token | System Token (hardcoded) | Ambiente privado N8N, risco aceitável |
| Nós do workflow | 3 separados | Cada etapa isolada pra debug |

## Níveis de maturidade

| Nível | Descrição | Este playbook cobre? |
|-------|-----------|---------------------|
| N1 | Enviar evento Lead pra CAPI | ✅ |
| N2 | Enviar Purchase com value | ✅ |
| N3 | Dedup com `event_id` | 🟡 Pendente (monitorar) |
