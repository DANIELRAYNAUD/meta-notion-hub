const axios = require('axios');
const config = require('../config');

const GRAPH_API_BASE = 'https://graph.facebook.com/v18.0';

class WhatsAppService {
    constructor() {
        this.phoneNumberId = config.whatsapp.phoneNumberId;
        this.accessToken = config.meta.accessToken;
    }

    // ============================================
    // ENVIAR MENSAGEM DE TEXTO
    // ============================================
    async sendTextMessage(to, text) {
        try {
            const response = await axios.post(
                `${GRAPH_API_BASE}/${this.phoneNumberId}/messages`,
                {
                    messaging_product: 'whatsapp',
                    recipient_type: 'individual',
                    to: to,
                    type: 'text',
                    text: { body: text }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            console.log('✅ WhatsApp mensagem enviada para:', to);
            return response.data;
        } catch (error) {
            console.error('❌ Erro ao enviar WhatsApp:', error.response?.data || error.message);
            throw error;
        }
    }

    // ============================================
    // ENVIAR TEMPLATE (para iniciar conversas)
    // ============================================
    async sendTemplate(to, templateName, languageCode = 'pt_BR', components = []) {
        try {
            const response = await axios.post(
                `${GRAPH_API_BASE}/${this.phoneNumberId}/messages`,
                {
                    messaging_product: 'whatsapp',
                    to: to,
                    type: 'template',
                    template: {
                        name: templateName,
                        language: { code: languageCode },
                        components: components
                    }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            console.log('✅ Template WhatsApp enviado para:', to);
            return response.data;
        } catch (error) {
            console.error('❌ Erro ao enviar template:', error.response?.data || error.message);
            throw error;
        }
    }

    // ============================================
    // ENVIAR IMAGEM
    // ============================================
    async sendImage(to, imageUrl, caption = '') {
        try {
            const response = await axios.post(
                `${GRAPH_API_BASE}/${this.phoneNumberId}/messages`,
                {
                    messaging_product: 'whatsapp',
                    recipient_type: 'individual',
                    to: to,
                    type: 'image',
                    image: {
                        link: imageUrl,
                        caption: caption
                    }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            console.log('✅ Imagem WhatsApp enviada para:', to);
            return response.data;
        } catch (error) {
            console.error('❌ Erro ao enviar imagem:', error.response?.data || error.message);
            throw error;
        }
    }

    // ============================================
    // MARCAR COMO LIDA
    // ============================================
    async markAsRead(messageId) {
        try {
            await axios.post(
                `${GRAPH_API_BASE}/${this.phoneNumberId}/messages`,
                {
                    messaging_product: 'whatsapp',
                    status: 'read',
                    message_id: messageId
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            console.log('✅ Mensagem marcada como lida');
        } catch (error) {
            console.error('❌ Erro ao marcar como lida:', error.message);
        }
    }

    // ============================================
    // PROCESSAR WEBHOOK DE MENSAGEM RECEBIDA
    // ============================================
    parseIncomingMessage(webhookBody) {
        try {
            const entry = webhookBody.entry?.[0];
            const changes = entry?.changes?.[0];
            const value = changes?.value;

            if (value?.messages?.[0]) {
                const message = value.messages[0];
                const contact = value.contacts?.[0];

                return {
                    messageId: message.id,
                    from: message.from,
                    contactName: contact?.profile?.name || message.from,
                    timestamp: message.timestamp,
                    type: message.type,
                    text: message.text?.body || '',
                    platform: 'WhatsApp'
                };
            }
            return null;
        } catch (error) {
            console.error('❌ Erro ao parsear mensagem:', error.message);
            return null;
        }
    }
}

module.exports = new WhatsAppService();
