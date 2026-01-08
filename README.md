# 🔗 Meta Notion Hub

Sistema próprio para integrar **Meta Business Suite** (Facebook, Instagram, WhatsApp) com o **Notion**.

## ✨ Funcionalidades

- 📥 **Captura de Leads** - Leads do Facebook/Instagram Ads vão direto para o Notion
- 📅 **Agendador de Posts** - Agende posts no Notion e publique automaticamente
- 📊 **Métricas** - Sincronize métricas de anúncios para o Notion
- 💬 **Hub de Mensagens** - Receba mensagens do WhatsApp/Messenger no Notion

## 🚀 Quick Start

### 1. Instalar dependências

```bash
cd meta-notion-hub
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
# Edite o arquivo .env com suas credenciais
```

### 3. Rodar localmente

```bash
npm run dev
```

### 4. Deploy no Render.com

1. Faça push do código para o GitHub
2. Conecte o repositório no [render.com](https://render.com)
3. Configure as variáveis de ambiente
4. Deploy!

## 📡 Endpoints da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/health` | Status do servidor |
| GET | `/webhook` | Verificação do Meta |
| POST | `/webhook` | Recebe eventos do Meta |
| POST | `/api/leads` | Criar lead manualmente |
| GET | `/api/posts` | Listar posts agendados |
| POST | `/api/posts/publish` | Publicar post |
| GET | `/api/metrics` | Buscar métricas |
| POST | `/api/metrics/sync` | Sincronizar para Notion |
| POST | `/api/messages/whatsapp` | Enviar WhatsApp |
| POST | `/api/messages/messenger` | Enviar Messenger |

## 🗄️ Databases do Notion

Crie as seguintes databases no Notion:

### 📥 Leads
| Propriedade | Tipo |
|-------------|------|
| Nome | Title |
| Email | Email |
| Telefone | Phone |
| Origem | Select |
| Campanha | Text |
| Data | Date |
| Status | Select |

### 📅 Posts
| Propriedade | Tipo |
|-------------|------|
| Título | Title |
| Conteúdo | Text |
| Imagem | URL |
| Plataforma | Select (Facebook/Instagram) |
| Data Publicação | Date |
| Status | Select (Rascunho/Agendado/Publicado/Erro) |
| ID do Post | Text |

### 📊 Métricas
| Propriedade | Tipo |
|-------------|------|
| Data | Title |
| Impressões | Number |
| Alcance | Number |
| Cliques | Number |
| Gastos (R$) | Number |
| CPM | Number |
| CPC | Number |
| Plataforma | Select |

### 💬 Mensagens
| Propriedade | Tipo |
|-------------|------|
| Contato | Title |
| Mensagem | Text |
| Plataforma | Select (WhatsApp/Messenger/Instagram DM) |
| Data | Date |
| Status | Select (Não lida/Lida/Respondida) |

## 🔐 Configuração do Meta Developer App

Veja o guia completo em `SETUP_META.md`.

## 📄 Licença

MIT
