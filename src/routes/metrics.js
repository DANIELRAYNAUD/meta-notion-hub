const express = require('express');
const router = express.Router();
const notionService = require('../services/notionService');
const metaService = require('../services/metaService');

// ============================================
// GET /api/metrics - Buscar métricas atuais
// ============================================
router.get('/', async (req, res) => {
    try {
        const { range } = req.query;
        const dateRange = range || 'last_7d';

        const metrics = await metaService.getAdAccountInsights(dateRange);

        if (metrics) {
            res.json({
                dateRange,
                metrics
            });
        } else {
            res.json({
                dateRange,
                metrics: null,
                message: 'Nenhuma métrica encontrada para o período'
            });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// GET /api/metrics/page - Métricas da página
// ============================================
router.get('/page', async (req, res) => {
    try {
        const insights = await metaService.getPageInsights();
        res.json({ insights });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// POST /api/metrics/sync - Sincronizar métricas para Notion
// ============================================
router.post('/sync', async (req, res) => {
    try {
        const { range } = req.body;
        const dateRange = range || 'last_7d';

        // Buscar métricas do Meta
        const metrics = await metaService.getAdAccountInsights(dateRange);

        if (!metrics) {
            return res.json({
                success: false,
                message: 'Nenhuma métrica para sincronizar'
            });
        }

        // Salvar no Notion
        const notionPage = await notionService.saveMetrics(metrics);

        res.json({
            success: true,
            message: 'Métricas sincronizadas para o Notion',
            notionId: notionPage.id,
            metrics
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// Opções de date_preset do Meta para referência:
// today, yesterday, this_month, last_month,
// this_quarter, maximum, data_maximum,
// last_3d, last_7d, last_14d, last_28d, last_30d,
// last_90d, last_week_mon_sun, last_week_sun_sat,
// last_quarter, last_year, this_week_mon_today,
// this_week_sun_today, this_year
// ============================================

module.exports = router;
