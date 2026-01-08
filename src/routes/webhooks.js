const express = require('express');
const router = express.Router();
const config = require('../config');
const notionService = require('../services/notionService');
const metaService = require('../services/metaService');
const whatsappService = require('../services/whatsappService');

// ============================================
// VERIFICAÇÃO DO WEBHOOK (GET)
// Meta envia GET para verificar o endpoint
// ============================================
router.get('/', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === config.webhook.verifyToken) {
        console.log('✅ Webhook verificado com sucesso');
        res.status(200).send(challenge);
    } else {
        console.log('❌ Falha na verificação do webhook');
        res.sendStatus(403);
    }
});

// ============================================
// RECEBER EVENTOS DO WEBHOOK (POST)
// ============================================
router.post('/', async (req, res) => {
    const body = req.body;

    // Responde imediatamente para não dar timeout
    res.sendStatus(200);

    try {
        // Identificar tipo de evento
        if (body.object === 'page') {
            // Eventos do Facebook (Lead Ads, Messenger)
            await handlePageEvent(body);
        } else if (body.object === 'whatsapp_business_account') {
            // Eventos do WhatsApp
            await handleWhatsAppEvent(body);
        } else if (body.object === 'instagram') {
            // Eventos do Instagram
            await handleInstagramEvent(body);
        }
    } catch (error) {
        console.error('❌ Erro no webhook:', error.message);
    }
});

// ============================================
// HANDLERS POR TIPO DE EVENTO
// ============================================

async function handlePageEvent(body) {
    for (const entry of body.entry) {
        // Lead Ads - Novo lead
        if (entry.changes) {
            for (const change of entry.changes) {
                if (change.field === 'leadgen') {
                    console.log('📥 Novo lead recebido:', change.value.leadgen_id);

                    // Buscar dados completos do lead
                    const leadData = await metaService.getLeadFormData(change.value.leadgen_id);
                    leadData.source = 'Facebook Ads';
                    leadData.campaignName = change.value.ad_id || 'Campanha';

                    // Salvar no Notion
                    await notionService.createLead(leadData);
                }
            }
        }

        // Messenger - Nova mensagem
        if (entry.messaging) {
            for (const event of entry.messaging) {
                if (event.message && !event.message.is_echo) {
                    console.log('💬 Nova mensagem Messenger de:', event.sender.id);

                    await notionService.saveMessage({
                        from: event.sender.id,
                        text: event.message.text,
                        platform: 'Messenger'
                    });
                }
            }
        }
    }
}

async function handleWhatsAppEvent(body) {
    const messageData = whatsappService.parseIncomingMessage(body);

    if (messageData) {
        console.log('💬 Nova mensagem WhatsApp de:', messageData.contactName);

        // Marcar como lida
        await whatsappService.markAsRead(messageData.messageId);

        // Salvar no Notion
        await notionService.saveMessage(messageData);
    }
}

async function handleInstagramEvent(body) {
    for (const entry of body.entry) {
        if (entry.messaging) {
            for (const event of entry.messaging) {
                if (event.message && !event.message.is_echo) {
                    console.log('💬 Nova mensagem Instagram de:', event.sender.id);

                    await notionService.saveMessage({
                        from: event.sender.id,
                        text: event.message.text,
                        platform: 'Instagram DM'
                    });
                }
            }
        }
    }
}

module.exports = router;
