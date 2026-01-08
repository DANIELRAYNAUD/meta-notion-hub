const express = require('express');
const router = express.Router();
const notionService = require('../services/notionService');
const metaService = require('../services/metaService');
const config = require('../config');
const { Client } = require('@notionhq/client');

// ============================================
// GET /api/leads - Listar leads do Notion
// ============================================
router.get('/', async (req, res) => {
    try {
        const notion = new Client({ auth: config.notion.token });
        const response = await notion.databases.query({
            database_id: config.notion.databases.leads,
            sorts: [{ property: 'Data', direction: 'descending' }],
            page_size: 50
        });

        const leads = response.results.map(page => ({
            id: page.id,
            name: page.properties['Nome']?.title?.[0]?.plain_text || 'N/A',
            email: page.properties['Email']?.email || 'N/A',
            phone: page.properties['Telefone']?.phone_number || 'N/A',
            source: page.properties['Origem']?.select?.name || 'Direto',
            createdAt: page.properties['Data']?.date?.start || page.created_time
        }));

        res.json({ leads, count: leads.length });
    } catch (error) {
        console.error('Erro ao buscar leads:', error.message);
        res.json({ leads: [], count: 0, error: error.message });
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
