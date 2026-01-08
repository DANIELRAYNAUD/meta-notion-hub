# 🔧 Configuração do Meta Developer App

Guia passo a passo para criar e configurar seu aplicativo no Meta Developers.

## 📋 Pré-requisitos

- Conta pessoal do Facebook
- Página do Facebook (para publicar posts)
- Conta do Instagram Business (opcional, para Instagram)
- Meta Business Suite configurado

---

## 🚀 Passo 1: Criar App no Meta Developers

1. Acesse [developers.facebook.com](https://developers.facebook.com)
2. Clique em **Meus Apps** → **Criar App**
3. Selecione **Tipo: Business**
4. Preencha:
   - Nome do App: `Meta Notion Hub`
   - Email de contato: seu email
   - Conta Business: selecione sua conta
5. Clique em **Criar App**

---

## 🔐 Passo 2: Configurar Produtos

No painel do seu App, adicione os seguintes produtos:

### Facebook Login (para OAuth)
1. Clique em **Configurar** no Facebook Login
2. Em Configurações → URLs de redirecionamento OAuth válidos, adicione:
   - `https://seu-app.onrender.com/auth/callback`

### Webhooks
1. Clique em **Configurar** nos Webhooks
2. Clique em **Assinar Campos**
3. Configure:
   - URL de callback: `https://seu-app.onrender.com/webhook`
   - Token de verificação: mesmo valor do seu `.env` `WEBHOOK_VERIFY_TOKEN`
4. Assine os eventos:
   - **Page**: `leadgen`, `messages`, `feed`
   - **Instagram**: `messages`
   - **WhatsApp Business Account**: `messages`

### Marketing API (para métricas de anúncios)
1. Adicione o produto **Marketing API**
2. Em Ferramentas → Explorador da Graph API:
   - Selecione seu App
   - Gere um token com permissões:
     - `ads_read`
     - `read_insights`

### WhatsApp Business (opcional)
1. Adicione o produto **WhatsApp**
2. Siga o wizard para conectar seu número
3. Copie o **Phone Number ID** e **Business Account ID**

---

## 🔑 Passo 3: Obter Tokens de Acesso

### Token de Longa Duração (Page Access Token)

1. Vá para **Ferramentas** → **Explorador da Graph API**
2. Selecione seu App
3. Clique em **Gerar Token de Acesso**
4. Selecione sua Página
5. Marque as permissões:
   - `pages_show_list`
   - `pages_read_engagement`
   - `pages_manage_posts`
   - `pages_messaging`
   - `instagram_basic`
   - `instagram_content_publish`
   - `leads_retrieval`
6. Clique em **Gerar Token de Acesso**
7. O token gerado expira em ~1 hora. Para obter um de longa duração:

```bash
# Troque pelo seu token temporário
curl -X GET "https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=SEU_APP_ID&client_secret=SEU_APP_SECRET&fb_exchange_token=TOKEN_TEMPORARIO"
```

8. Copie o `access_token` retornado (dura ~60 dias)

### Para Token Permanente (Page Token)

```bash
curl -X GET "https://graph.facebook.com/v18.0/me/accounts?access_token=TOKEN_LONGA_DURACAO"
```

Copie o `access_token` da sua página - este não expira!

---

## 📝 Passo 4: Preencher o .env

```env
# Do passo 1
META_APP_ID=123456789
META_APP_SECRET=abcdef123456

# Do passo 3
META_ACCESS_TOKEN=EAAxxxxxx...

# Da URL da sua página (facebook.com/pageid)
META_PAGE_ID=123456789

# Do Gerenciador de Anúncios (act_xxxxx)
META_AD_ACCOUNT_ID=act_123456789

# Do WhatsApp Business (se configurado)
WHATSAPP_PHONE_NUMBER_ID=123456789
WHATSAPP_BUSINESS_ACCOUNT_ID=123456789

# Defina você mesmo
WEBHOOK_VERIFY_TOKEN=meu_token_secreto_123
```

---

## ✅ Passo 5: Verificar Configuração

1. Faça deploy do seu app no Render.com
2. No Meta Developers → Webhooks, clique **Testar**
3. Verifique se seu endpoint responde `200 OK`

### Testar Lead Ads

1. No Gerenciador de Anúncios, crie uma campanha de teste
2. Use a ferramenta de teste de leads:
   - Vá para **Ferramentas** → **Teste de Formulário de Leads**
   - Envie um lead de teste
3. Verifique se apareceu no Notion!

---

## 🔄 Renovação de Tokens

Tokens de longa duração expiram em ~60 dias. Para evitar problemas:

1. Configure um cron job para renovar automaticamente
2. Ou use o endpoint de renovação:

```bash
curl -X GET "https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=APP_ID&client_secret=APP_SECRET&fb_exchange_token=TOKEN_ATUAL"
```

---

## ❓ Problemas Comuns

| Erro | Solução |
|------|---------|
| Token expirado | Gere um novo token seguindo o Passo 3 |
| Webhook não verifica | Verifique se o WEBHOOK_VERIFY_TOKEN é igual |
| Leads não chegam | Assine o campo `leadgen` no webhook |
| Permissão negada | Revise as permissões do token |

---

## 📚 Links Úteis

- [Documentação Graph API](https://developers.facebook.com/docs/graph-api)
- [Documentação WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
- [Documentação Lead Ads](https://developers.facebook.com/docs/marketing-api/guides/lead-ads)
- [Explorador da Graph API](https://developers.facebook.com/tools/explorer)
