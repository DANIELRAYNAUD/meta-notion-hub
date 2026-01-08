const express = require('express');
const router = express.Router();
const metaService = require('../services/metaService');

// ============================================
// GET /api/insights/best-times - Melhores horários de postagem
// ============================================
router.get('/best-times', async (req, res) => {
    try {
        const analysis = await metaService.getBestPostingTimes();
        res.json(analysis);
    } catch (error) {
        console.error('Erro ao analisar horários:', error.message);
        res.json({
            analyzedPosts: 0,
            bestHours: [],
            bestDays: [],
            recommendation: 'Erro ao analisar dados',
            error: error.message
        });
    }
});

// ============================================
// GET /api/insights/scheduled - Posts agendados no Meta
// ============================================
router.get('/scheduled', async (req, res) => {
    try {
        const scheduled = await metaService.getScheduledFromMeta();
        res.json({
            count: scheduled.length,
            posts: scheduled
        });
    } catch (error) {
        console.error('Erro ao buscar agendados:', error.message);
        res.json({ count: 0, posts: [], error: error.message });
    }
});

// ============================================
// GET /api/insights/summary - Resumo de insights
// ============================================
router.get('/summary', async (req, res) => {
    try {
        const [bestTimes, scheduled] = await Promise.all([
            metaService.getBestPostingTimes(),
            metaService.getScheduledFromMeta()
        ]);

        res.json({
            scheduledCount: scheduled.length,
            bestHours: bestTimes.bestHours.slice(0, 3),
            bestDays: bestTimes.bestDays.slice(0, 2),
            recommendation: bestTimes.recommendation,
            analyzedPosts: bestTimes.analyzedPosts
        });
    } catch (error) {
        console.error('Erro ao gerar resumo:', error.message);
        res.json({ error: error.message });
    }
});

module.exports = router;
