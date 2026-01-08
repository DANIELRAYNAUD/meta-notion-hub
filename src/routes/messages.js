const express = require('express');
const router = express.Router();
const notionService = require('../services/notionService');
const metaService = require('../services/metaService');
const whatsappService = require('../services/whatsappService');
const config = require('../config');
const { Client } = require('@notionhq/client');

// ============================================
// GET /api/messages - Listar mensagens do Notion
// ============================================
router.get('/', async (req, res) => {
    try {
        const notion = new Client({ auth: config.notion.token });
        const response = await notion.databases.query({
            database_id: config.notion.databases.messages,
            sorts: [{ property: 'Data', direction: 'descending' }],
            page_size: 50
        });

        const messages = response.results.map(page => ({
            id: page.id,
            from: page.properties['Contato']?.title?.[0]?.plain_text || 'Desconhecido',
            text: page.properties['Mensagem']?.rich_text?.[0]?.plain_text || '',
            platform: page.properties['Plataforma']?.select?.name || 'Direto',
            createdAt: page.properties['Data']?.date?.start || page.created_time
        }));

        res.json({ messages, count: messages.length });
    } catch (error) {
        console.error('Erro ao buscar mensagens:', error.message);
        res.json({ messages: [], count: 0, error: error.message });
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
