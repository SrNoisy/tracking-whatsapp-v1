# Passo 4: Automação de Lead

## No Datacrazy

**Caminho:** Automações > Adicionar

### Configuração

| Campo | Valor |
|-------|-------|
| Nome | `CAPI - Lead CTWA` |
| Gatilho | Mensagem Recebida — instância do cliente |
| Condição | Lead existe |

### Bloco JavaScript

Adicionar bloco `<> JavaScript` com o conteúdo de `templates/capi-lead.js`.

**Antes de colar:** editar as constantes no topo do arquivo:

```javascript
const PIXEL_ID = "[SEU_PIXEL_ID]";
const TOKEN = "[SEU_TOKEN_AQUI]";
```

### Tag de controle

Depois do bloco JS, adicionar **Ação: Adicionar Tag** → tag `capi_lead`.

Isso evita que o evento seja reenviado em mensagens subsequentes do mesmo lead.

### Como funciona

1. Lead envia mensagem via CTWA
2. Datacrazy cria o lead com `sourceReferral.ctwaId`
3. Automação dispara → bloco JS lê `leadCtwaId`
4. Se `ctwaId` existe → envia `POST` com evento `Lead` pra CAPI
5. Adiciona tag `capi_lead` → bloqueia reenvio
6. Se `ctwaId` não existe (ex: lead orgânico) → apenas loga e sai
