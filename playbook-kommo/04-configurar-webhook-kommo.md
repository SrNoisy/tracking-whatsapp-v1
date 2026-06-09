# Passo 4: Configurar Webhook no Digital Pipeline

## Onde configurar

Kommo → **Leads** → **Automate** (ícone de raio no canto superior direito)

## Passo a passo

### 4.1 Selecionar o estágio

1. Na lista de Digital Pipeline stages, clique no estágio que deve disparar o evento **Lead** (ex: "Etapa de leads de entrada")
2. Clique em **Add** → **API: Send webhook**

### 4.2 Configurar o webhook

| Campo | Valor |
|-------|-------|
| URL | `https://[seu-n8n]/webhook/[cliente]-capi` |
| Event | **Changing a stage** (mudança de estágio) |

### 4.3 Repetir para Purchase

Repita os passos 4.1-4.2 para o estágio **"Fechado - ganho"** (mesma URL).

### 4.4 Verificar

Ambos os estágios devem aparecer com um ícone de engrenagem indicando o webhook configurado:

```
✅ Etapa de leads de entrada  ⚙️ (API: Send webhook)
✅ Fechado - ganho            ⚙️ (API: Send webhook)
```

## Formato do payload que o Kommo envia

O Kommo envia `Content-Type: application/x-www-form-urlencoded` com campos no formato:

```
leads[status][0][id]=[LEAD_ID]
leads[status][0][status_id]=[STATUS_ID]
leads[status][0][pipeline_id]=[PIPELINE_ID]
leads[status][0][old_status_id]=[OLD_STATUS_ID]
account[id]=[ACCOUNT_ID]
account[subdomain]=[SUBDOMAIN]
```

**Exemplo real:**

```
leads[status][0][id]=59701943
leads[status][0][status_id]=142
leads[status][0][pipeline_id]=12290547
leads[status][0][old_status_id]=95526143
account[id]=35438587
account[subdomain]=revintepisos
```

> O Code node "Parse & Route" já trata esse formato automaticamente.

## Teste rápido no Kommo

1. Na automação, clique em **Test**
2. Selecione um lead de teste
3. Verifique no N8N se o workflow executou com sucesso

## Alternativa: Salesbot

Se preferir, o Kommo também oferece **Salesbot** como alternativa ao Digital Pipeline webhook. No entanto:

| Aspecto | Digital Pipeline Webhook | Salesbot |
|---------|------------------------|----------|
| Complexidade | Simples (1 clique) | Requer configurar bot |
| Manutenção | Nenhuma | Regras do bot precisam ser mantidas |
| Latência | Instantâneo | Pode ter delay |
| **Escolha** | **✅ Recomendado** | Apenas se Digital Pipeline não estiver disponível |
