const axios = require('axios');
const config = require('../config');

const GRAPH_API_BASE = 'https://graph.facebook.com/v18.0';

class MetaService {
    constructor() {
        this.accessToken = config.meta.accessToken;
        this.pageId = config.meta.pageId;
        this.adAccountId = config.meta.adAccountId;
        this.instagramAccountId = config.meta.instagramAccountId;
        this.pageToken = null;
    }

    // Buscar Page Token a partir do System User Token
    async getPageToken() {
        if (this.pageToken) return this.pageToken;

        try {
            const response = await axios.get(`${GRAPH_API_BASE}/me/accounts`, {
                params: { access_token: this.accessToken }
            });

            if (response.data.data && response.data.data.length > 0) {
                const page = response.data.data.find(p => p.id === this.pageId) || response.data.data[0];
                this.pageToken = page.access_token;
                this.pageId = page.id;
                console.log('✅ Page Token obtido para:', page.name);
                return this.pageToken;
            }
        } catch (error) {
            console.error('❌ Erro ao buscar Page Token:', error.message);
        }
        return this.accessToken;
    }

    // ============================================
    // POSTS - Publicar no Facebook/Instagram
    // ============================================
    async publishPost(content, imageUrl = null) {
        try {
            let endpoint = `${GRAPH_API_BASE}/${this.pageId}/feed`;
            let data = {
                message: content,
                access_token: this.accessToken
            };

            // Se tiver imagem, usar endpoint de photos
            if (imageUrl) {
                endpoint = `${GRAPH_API_BASE}/${this.pageId}/photos`;
                data.url = imageUrl;
                data.caption = content;
                delete data.message;
            }

            const response = await axios.post(endpoint, data);
            console.log('✅ Post publicado no Facebook:', response.data.id);
            return response.data;
        } catch (error) {
            console.error('❌ Erro ao publicar:', error.response?.data || error.message);
            throw error;
        }
    }

    async publishToInstagram(imageUrl, caption) {
        try {
            // Step 1: Create container
            const containerResponse = await axios.post(
                `${GRAPH_API_BASE}/${this.pageId}/media`,
                {
                    image_url: imageUrl,
                    caption: caption,
                    access_token: this.accessToken
                }
            );

            const containerId = containerResponse.data.id;

            // Step 2: Publish container
            const publishResponse = await axios.post(
                `${GRAPH_API_BASE}/${this.pageId}/media_publish`,
                {
                    creation_id: containerId,
                    access_token: this.accessToken
                }
            );

            console.log('✅ Post publicado no Instagram:', publishResponse.data.id);
            return publishResponse.data;
        } catch (error) {
            console.error('❌ Erro ao publicar no Instagram:', error.response?.data || error.message);
            throw error;
        }
    }

    // ============================================
    // LEADS - Buscar leads do Lead Ads
    // ============================================
    async getLeadFormData(leadgenId) {
        try {
            const response = await axios.get(
                `${GRAPH_API_BASE}/${leadgenId}`,
                {
                    params: {
                        access_token: this.accessToken
                    }
                }
            );
            return this.parseLeadData(response.data);
        } catch (error) {
            console.error('❌ Erro ao buscar lead:', error.response?.data || error.message);
            throw error;
        }
    }

    parseLeadData(leadData) {
        const parsed = {
            id: leadData.id,
            createdTime: leadData.created_time,
            name: '',
            email: '',
            phone: ''
        };

        if (leadData.field_data) {
            leadData.field_data.forEach(field => {
                const name = field.name.toLowerCase();
                const value = field.values[0];

                if (name.includes('name') || name.includes('nome')) {
                    parsed.name = value;
                } else if (name.includes('email')) {
                    parsed.email = value;
                } else if (name.includes('phone') || name.includes('telefone')) {
                    parsed.phone = value;
                }
            });
        }

        return parsed;
    }

    // ============================================
    // METRICS - Buscar métricas de anúncios
    // ============================================
    async getAdAccountInsights(dateRange = 'last_7d') {
        try {
            const response = await axios.get(
                `${GRAPH_API_BASE}/${this.adAccountId}/insights`,
                {
                    params: {
                        fields: 'impressions,reach,clicks,spend,cpm,cpc,actions',
                        date_preset: dateRange,
                        access_token: this.accessToken
                    }
                }
            );

            if (response.data.data && response.data.data.length > 0) {
                const data = response.data.data[0];
                return {
                    impressions: parseInt(data.impressions) || 0,
                    reach: parseInt(data.reach) || 0,
                    clicks: parseInt(data.clicks) || 0,
                    spend: parseFloat(data.spend) || 0,
                    cpm: parseFloat(data.cpm) || 0,
                    cpc: parseFloat(data.cpc) || 0,
                    platform: 'Facebook Ads'
                };
            }
            return null;
        } catch (error) {
            console.error('❌ Erro ao buscar métricas:', error.response?.data || error.message);
            throw error;
        }
    }

    async getPageInsights() {
        try {
            const response = await axios.get(
                `${GRAPH_API_BASE}/${this.pageId}/insights`,
                {
                    params: {
                        metric: 'page_impressions,page_engaged_users,page_fans',
                        period: 'day',
                        access_token: this.accessToken
                    }
                }
            );
            return response.data.data;
        } catch (error) {
            console.error('❌ Erro ao buscar insights da página:', error.response?.data || error.message);
            throw error;
        }
    }

    // ============================================
    // MESSAGES - Enviar mensagem pelo Messenger
    // ============================================
    async sendMessengerMessage(recipientId, text) {
        try {
            const response = await axios.post(
                `${GRAPH_API_BASE}/me/messages`,
                {
                    recipient: { id: recipientId },
                    message: { text },
                    access_token: this.accessToken
                }
            );
            console.log('✅ Mensagem enviada via Messenger');
            return response.data;
        } catch (error) {
            console.error('❌ Erro ao enviar mensagem:', error.response?.data || error.message);
            throw error;
        }
    }
}

module.exports = new MetaService();
