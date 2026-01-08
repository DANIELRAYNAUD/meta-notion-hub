# 📋 Templates das Databases do Notion

Este arquivo contém os templates das databases que você precisa criar no Notion.
Copie e cole estes templates para criar cada database.

---

## 📥 Database: Leads

### Propriedades
| Nome | Tipo | Opções |
|------|------|--------|
| Nome | Title | - |
| Email | Email | - |
| Telefone | Phone | - |
| Origem | Select | Facebook Ads, Instagram Ads, Google Ads, Site, Manual |
| Campanha | Text | - |
| Data | Date | - |
| Status | Select | Novo, Contatado, Qualificado, Convertido, Perdido |
| Valor Potencial | Number | R$ |
| Observações | Text | - |

### Visualizações Sugeridas
1. **Kanban por Status** - Arraste leads entre colunas
2. **Tabela Completa** - Todos os dados
3. **Calendário por Data** - Quando chegaram

---

## 📅 Database: Posts

### Propriedades
| Nome | Tipo | Opções |
|------|------|--------|
| Título | Title | - |
| Conteúdo | Text | Texto do post |
| Imagem | URL | Link da imagem (público) |
| Plataforma | Select | Facebook, Instagram, Ambos |
| Data Publicação | Date | Com hora |
| Status | Select | Rascunho, Agendado, Publicado, Erro |
| ID do Post | Text | Preenchido automaticamente |
| Hashtags | Multi-select | Suas hashtags |

### Como Usar
1. Crie um novo item com status **Rascunho**
2. Preencha Conteúdo e Imagem
3. Defina Data Publicação
4. Mude status para **Agendado**
5. O sistema publicará automaticamente!

### Visualizações Sugeridas
1. **Calendário** - Visualize posts por data
2. **Kanban por Status** - Fluxo de aprovação
3. **Galeria** - Preview visual

---

## 📊 Database: Métricas

### Propriedades
| Nome | Tipo | Opções |
|------|------|--------|
| Data | Title | DD/MM/AAAA |
| Impressões | Number | - |
| Alcance | Number | - |
| Cliques | Number | - |
| Gastos (R$) | Number | Formato moeda |
| CPM | Number | - |
| CPC | Number | - |
| CTR | Formula | `Cliques / Impressões * 100` |
| Plataforma | Select | Facebook Ads, Instagram Ads |
| Campanha | Text | - |

### Visualizações Sugeridas
1. **Tabela** - Dados diários
2. **Gráfico** - Evolução ao longo do tempo
3. **Resumo Mensal** - Agrupado por mês

---

## 💬 Database: Mensagens

### Propriedades
| Nome | Tipo | Opções |
|------|------|--------|
| Contato | Title | Nome ou número |
| Mensagem | Text | Conteúdo da mensagem |
| Plataforma | Select | WhatsApp, Messenger, Instagram DM |
| Data | Date | Com hora |
| Status | Select | Não lida, Lida, Respondida, Arquivada |
| Prioridade | Select | Alta, Média, Baixa |
| Responsável | Person | Quem vai responder |

### Visualizações Sugeridas
1. **Kanban por Status** - Fluxo de atendimento
2. **Tabela por Plataforma** - Filtrado
3. **Não lidas** - Apenas pendentes

---

## 🔗 Como Obter o ID da Database

1. Abra a database no Notion
2. Copie a URL do navegador
3. O ID está entre o nome do workspace e o `?`:
   ```
   https://notion.so/workspace/ESTE-É-O-ID?v=xxx
   ```
4. Remova os hífens se houver
5. Cole no seu `.env`

---

## 🔌 Conectar Integração

1. Para cada database, clique em `...` (três pontos)
2. Vá em **Connections** / **Conexões**
3. Clique em **Add connections**
4. Selecione sua integração (Meta Notion Hub)
5. Confirme

⚠️ **Importante**: Sem essa conexão, o sistema não consegue acessar a database!
