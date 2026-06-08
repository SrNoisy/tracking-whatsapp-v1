# Passo 5: Automação de Purchase (opcional)

Recomendado pra campanhas que otimizam por **compra** em vez de lead. Envia o valor do negócio (`businessTotal`) como `value` na CAPI, alimentando ROAS e value-based bidding.

## No Datacrazy

**Caminho:** Automações > Adicionar

### Configuração

| Campo | Valor |
|-------|-------|
| Nome | `CAPI - Venda Concluída` |
| Gatilho | Negócio movido |
| Condição | Etapa destino = `[Etapa de Pagamento 1]` OU `[Etapa de Pagamento 2]` |

### Bloco JavaScript

Adicionar bloco `<> JavaScript` com o conteúdo de `templates/capi-purchase.js`.

**Antes de colar:** editar as constantes:

```javascript
const PIXEL_ID = "[SEU_PIXEL_ID]";
const TOKEN = "[SEU_TOKEN_AQUI]";
```

### Tag de controle

Adicionar **Ação: Adicionar Tag** → tag `capi_purchase`.

### Como funciona

1. Lead é movido pra etapa de pagamento no pipeline
2. Automação dispara → bloco JS lê `leadCtwaId`, `leadId`, `businessTotal`
3. Envia evento `Purchase` com `value` pro Pixel
4. Adiciona tag `capi_purchase`

### Sobre o value

```javascript
custom_data: {
  currency: "BRL",
  value: parseFloat(businessValue) || 0
}
```

- `businessTotal` vem do campo Valor do Negócio no Datacrazy
- Se estiver vazio, envia 0 (Meta aceita, mas não otimiza por valor)
- Ajuste `event_id` se quiser um prefixo diferente de `purchase_`
