const express = require('express');
const router = express.Router();
const notionService = require('../services/notionService');
const metaService = require('../services/metaService');

// ============================================
// GET /api/leads - Listar leads (manual sync)
// ============================================
router.get('/', async (req, res) => {
    try {
        res.json({
            message: 'Leads são capturados automaticamente via webhook',
            webhook_url: '/webhook',
            instructions: 'Configure o webhook no Meta Business para receber leads automaticamente'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// POST /api/leads - Criar lead manualmente
// ============================================
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, source, campaignName } = req.body;

        if (!name && !email && !phone) {
            return res.status(400).json({
                error: 'Pelo menos um campo (name, email ou phone) é obrigatório'
            });
        }

        const lead = await notionService.createLead({
            name: name || '',
            email: email || '',
            phone: phone || '',
            source: source || 'Manual',
            campaignName: campaignName || ''
        });

        res.status(201).json({
            success: true,
            message: 'Lead criado no Notion',
            notionId: lead.id
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// POST /api/leads/sync - Sincronizar leads do Facebook
// ============================================
router.post('/sync/:formId', async (req, res) => {
    try {
        const { formId } = req.params;

        // Nota: Requer consultar leads do formulário específico
        // Útil para sincronização inicial
        res.json({
            message: 'Para sincronização em massa, configure o webhook',
            formId: formId
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
