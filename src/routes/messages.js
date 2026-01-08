const express = require('express');
const router = express.Router();
const notionService = require('../services/notionService');
const metaService = require('../services/metaService');
const whatsappService = require('../services/whatsappService');

// ============================================
// GET /api/messages - Info sobre mensagens
// ============================================
router.get('/', async (req, res) => {
    try {
        res.json({
            message: 'Mensagens são recebidas automaticamente via webhook',
            webhook_url: '/webhook',
            platforms: ['WhatsApp', 'Messenger', 'Instagram DM'],
            send_endpoints: {
                whatsapp: 'POST /api/messages/whatsapp',
                messenger: 'POST /api/messages/messenger'
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// POST /api/messages/whatsapp - Enviar WhatsApp
// ============================================
router.post('/whatsapp', async (req, res) => {
    try {
        const { to, text, type, templateName, imageUrl, caption } = req.body;

        if (!to) {
            return res.status(400).json({ error: 'to (número) é obrigatório' });
        }

        let result;

        if (type === 'template' && templateName) {
            result = await whatsappService.sendTemplate(to, templateName);
        } else if (type === 'image' && imageUrl) {
            result = await whatsappService.sendImage(to, imageUrl, caption);
        } else if (text) {
            result = await whatsappService.sendTextMessage(to, text);
        } else {
            return res.status(400).json({
                error: 'Forneça text, ou type=template com templateName, ou type=image com imageUrl'
            });
        }

        res.json({
            success: true,
            message: 'Mensagem enviada via WhatsApp',
            result
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// POST /api/messages/messenger - Enviar Messenger
// ============================================
router.post('/messenger', async (req, res) => {
    try {
        const { recipientId, text } = req.body;

        if (!recipientId || !text) {
            return res.status(400).json({
                error: 'recipientId e text são obrigatórios'
            });
        }

        const result = await metaService.sendMessengerMessage(recipientId, text);

        res.json({
            success: true,
            message: 'Mensagem enviada via Messenger',
            result
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// POST /api/messages/log - Salvar mensagem manualmente
// ============================================
router.post('/log', async (req, res) => {
    try {
        const { from, text, platform } = req.body;

        if (!from || !text) {
            return res.status(400).json({
                error: 'from e text são obrigatórios'
            });
        }

        const result = await notionService.saveMessage({
            from,
            text,
            platform: platform || 'Manual'
        });

        res.json({
            success: true,
            message: 'Mensagem salva no Notion',
            notionId: result.id
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
