const { Client } = require('@notionhq/client');
const config = require('../config');

class NotionService {
    constructor() {
        this.client = new Client({ auth: config.notion.token });
    }

    // ============================================
    // LEADS - Criar lead no Notion
    // ============================================
    async createLead(leadData) {
        try {
            const response = await this.client.pages.create({
                parent: { database_id: config.notion.databases.leads },
                properties: {
                    'Nome': {
                        title: [{ text: { content: leadData.name || 'Sem nome' } }]
                    },
                    'Email': {
                        email: leadData.email || null
                    },
                    'Telefone': {
                        phone_number: leadData.phone || null
                    },
                    'Origem': {
                        select: { name: leadData.source || 'Facebook Ads' }
                    },
                    'Campanha': {
                        rich_text: [{ text: { content: leadData.campaignName || '' } }]
                    },
                    'Data': {
                        date: { start: new Date().toISOString() }
                    },
                    'Status': {
                        select: { name: 'Novo' }
                    }
                }
            });
            console.log('✅ Lead criado no Notion:', response.id);
            return response;
        } catch (error) {
            console.error('❌ Erro ao criar lead:', error.message);
            throw error;
        }
    }

    // ============================================
    // POSTS - Buscar posts agendados
    // ============================================
    async getScheduledPosts() {
        try {
            const response = await this.client.databases.query({
                database_id: config.notion.databases.posts,
                filter: {
                    and: [
                        {
                            property: 'Status',
                            select: { equals: 'Agendado' }
                        },
                        {
                            property: 'Data Publicação',
                            date: { on_or_before: new Date().toISOString() }
                        }
                    ]
                }
            });
            return response.results;
        } catch (error) {
            console.error('❌ Erro ao buscar posts:', error.message);
            throw error;
        }
    }

    async updatePostStatus(pageId, status, postId = null) {
        try {
            const properties = {
                'Status': { status: { name: status } }
            };

            if (postId) {
                properties['ID do Post'] = {
                    rich_text: [{ text: { content: postId } }]
                };
            }

            await this.client.pages.update({
                page_id: pageId,
                properties
            });
            console.log('✅ Status do post atualizado:', status);
        } catch (error) {
            console.error('❌ Erro ao atualizar status:', error.message);
            throw error;
        }
    }

    // ============================================
    // POSTS - Criar post agendado
    // ============================================
    async createScheduledPost(postData) {
        try {
            const response = await this.client.pages.create({
                parent: { database_id: config.notion.databases.posts },
                properties: {
                    'Conteudo': {
                        title: [{ text: { content: postData.content || '' } }]
                    },
                    'Plataforma': {
                        select: { name: postData.platform || 'Instagram' }
                    },
                    'DataPublicacao': {
                        date: { start: postData.publishDate || new Date().toISOString() }
                    },
                    'Status': {
                        status: { name: 'Agendado' }
                    }
                }
            });

            // Adicionar URL da imagem se fornecida
            if (postData.imageUrl) {
                await this.client.pages.update({
                    page_id: response.id,
                    properties: {
                        'Imagem': {
                            url: postData.imageUrl
                        }
                    }
                });
            }

            console.log('✅ Post agendado criado no Notion:', response.id);
            return response;
        } catch (error) {
            console.error('❌ Erro ao criar post agendado:', error.message);
            throw error;
        }
    }

    // ============================================
    // METRICS - Salvar métricas
    // ============================================
    async saveMetrics(metricsData) {
        try {
            const response = await this.client.pages.create({
                parent: { database_id: config.notion.databases.metrics },
                properties: {
                    'Data': {
                        title: [{ text: { content: new Date().toLocaleDateString('pt-BR') } }]
                    },
                    'Impressões': {
                        number: metricsData.impressions || 0
                    },
                    'Alcance': {
                        number: metricsData.reach || 0
                    },
                    'Cliques': {
                        number: metricsData.clicks || 0
                    },
                    'Gastos (R$)': {
                        number: metricsData.spend || 0
                    },
                    'CPM': {
                        number: metricsData.cpm || 0
                    },
                    'CPC': {
                        number: metricsData.cpc || 0
                    },
                    'Plataforma': {
                        select: { name: metricsData.platform || 'Facebook' }
                    }
                }
            });
            console.log('✅ Métricas salvas no Notion');
            return response;
        } catch (error) {
            console.error('❌ Erro ao salvar métricas:', error.message);
            throw error;
        }
    }

    // ============================================
    // MESSAGES - Salvar mensagem
    // ============================================
    async saveMessage(messageData) {
        try {
            const response = await this.client.pages.create({
                parent: { database_id: config.notion.databases.messages },
                properties: {
                    'Contato': {
                        title: [{ text: { content: messageData.from || 'Desconhecido' } }]
                    },
                    'Mensagem': {
                        rich_text: [{ text: { content: messageData.text || '' } }]
                    },
                    'Plataforma': {
                        select: { name: messageData.platform || 'WhatsApp' }
                    },
                    'Data': {
                        date: { start: new Date().toISOString() }
                    },
                    'Status': {
                        select: { name: 'Não lida' }
                    }
                }
            });
            console.log('✅ Mensagem salva no Notion');
            return response;
        } catch (error) {
            console.error('❌ Erro ao salvar mensagem:', error.message);
            throw error;
        }
    }

    // ============================================
    // UTILITY - Extrair texto de propriedade
    // ============================================
    extractText(property) {
        if (!property) return '';

        if (property.title && property.title.length > 0) {
            return property.title[0].plain_text;
        }
        if (property.rich_text && property.rich_text.length > 0) {
            return property.rich_text[0].plain_text;
        }
        if (property.select) {
            return property.select.name;
        }
        return '';
    }
}

module.exports = new NotionService();
