# Passo 3: Setup Meta App + WABA Dataset

## Meta App

**Só é necessário se ainda não existir um App da Meta vinculado ao cliente.**

1. Acessar [developers.facebook.com](https://developers.facebook.com)
2. Criar App > **Business** > Nome: `[Cliente] Tracking CTWA`
3. Adicionar casos de uso:
   - `ads_management`
   - `ads_read`
   - `business_management`
   - `whatsapp_business_management`
   - `whatsapp_business_manage_events`
   - `read_insights`
4. **Publicar o App** — preencher URLs de Política de Privacidade e Termos de Serviço (pode ser qualquer URL válida)
5. Gerar **Token de Sistema** (já feito no Passo 2)

> O System Token do App precisa de permissão no Business Manager do cliente. Adicione o System User como funcionário no BM com as permissões necessárias.

## WABA Dataset

Dataset é obrigatório para enviar eventos com `ctwa_clid` via CAPI.

### Verificar se já existe

```bash
curl -X GET "https://graph.facebook.com/v22.0/[SEU_WABA_ID]/datasets?access_token=[SEU_TOKEN]"
```

### Criar se não existir

```bash
curl -X POST "https://graph.facebook.com/v22.0/[SEU_WABA_ID]/datasets" \
  -H "Content-Type: application/json" \
  -d '{"name": "[Cliente] CAPI Dataset"}' \
  --header "Authorization: Bearer [SEU_TOKEN]"
```

Resposta esperada:
```json
{
  "id": "1687650028937694",
  "name": "[Cliente] CAPI Dataset"
}
```

Salvar o `id` do dataset no `capi-config.json`.
