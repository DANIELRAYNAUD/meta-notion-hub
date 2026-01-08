# Deploy do Meta Notion Hub no Render.com

## 🚀 Passos para Deploy

### 1. Criar conta no Render
- Acesse: https://render.com
- Faça login com GitHub

### 2. Criar novo Web Service
1. Clique em **"New +"** → **"Web Service"**
2. Conecte seu repositório GitHub (ou use "Deploy from Git URL")
3. Configure:
   - **Name:** `meta-notion-hub`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free

### 3. Configurar Variáveis de Ambiente
No painel do Render, vá em **Environment** e adicione:

| Variável | Descrição |
|----------|-----------|
| `NODE_ENV` | `production` |
| `NOTION_API_KEY` | Sua chave API do Notion |
| `NOTION_PAGE_ID` | ID da página pai do Notion |
| `NOTION_LEADS_DB` | ID da database de Leads |
| `NOTION_POSTS_DB` | ID da database de Posts |
| `NOTION_METRICS_DB` | ID da database de Métricas |
| `NOTION_MESSAGES_DB` | ID da database de Mensagens |
| `META_APP_ID` | ID do seu Meta App |
| `META_APP_SECRET` | Secret do seu Meta App |
| `META_ACCESS_TOKEN` | Token do System User |
| `META_PAGE_ID` | ID da sua página do Facebook |
| `INSTAGRAM_ACCOUNT_ID` | ID da conta do Instagram |
| `WEBHOOK_VERIFY_TOKEN` | Token secreto para verificar webhooks |

> 📋 Copie os valores do seu arquivo `.env` local

### 4. Deploy
- Clique em **"Create Web Service"**
- Aguarde o build completar
- A URL será algo como: `https://meta-notion-hub.onrender.com`

### 5. Configurar Webhooks no Meta
Após o deploy, configure os webhooks no Meta Developer:

1. Acesse sua página de webhooks no Meta Developer
2. Em **"Webhooks"**, adicione:
   - **URL de callback:** `https://SEU-APP.onrender.com/webhook`
   - **Token de verificação:** O valor de WEBHOOK_VERIFY_TOKEN
3. Assine os eventos:
   - `leadgen` (para leads)
   - `messages` (para mensagens)
   - `feed` (para comentários)

### 6. Atualizar OAuth Redirect
No Meta App, atualize a URL de redirect:
- Adicione: `https://SEU-APP.onrender.com/auth/callback`

---

## ✅ Pronto!
Seu Meta Notion Hub estará funcionando em produção!
