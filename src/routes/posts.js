const express = require('express');
const router = express.Router();
const notionService = require('../services/notionService');
const metaService = require('../services/metaService');

// ============================================
// GET /api/posts - Listar posts agendados
// ============================================
router.get('/', async (req, res) => {
    try {
        const posts = await notionService.getScheduledPosts();
        res.json({
            count: posts.length,
            posts: posts.map(post => ({
                id: post.id,
                properties: post.properties
            }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// POST /api/posts/publish - Publicar post agora
// ============================================
router.post('/publish', async (req, res) => {
    try {
        const { content, imageUrl, platform } = req.body;

        if (!content) {
            return res.status(400).json({ error: 'content é obrigatório' });
        }

        let result;

        if (platform === 'instagram' && imageUrl) {
            result = await metaService.publishToInstagram(imageUrl, content);
        } else {
            result = await metaService.publishPost(content, imageUrl);
        }

        res.json({
            success: true,
            postId: result.id,
            message: `Post publicado no ${platform || 'Facebook'}`
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// POST /api/posts/process - Processar posts agendados
// Este endpoint pode ser chamado por um cron job
// ============================================
router.post('/process', async (req, res) => {
    try {
        const scheduledPosts = await notionService.getScheduledPosts();
        const results = [];

        for (const post of scheduledPosts) {
            try {
                const content = notionService.extractText(post.properties['Conteúdo']);
                const imageUrl = post.properties['Imagem']?.url || null;
                const platform = notionService.extractText(post.properties['Plataforma']);

                let result;
                if (platform.toLowerCase() === 'instagram' && imageUrl) {
                    result = await metaService.publishToInstagram(imageUrl, content);
                } else {
                    result = await metaService.publishPost(content, imageUrl);
                }

                // Atualizar status no Notion
                await notionService.updatePostStatus(post.id, 'Publicado', result.id);

                results.push({
                    notionId: post.id,
                    postId: result.id,
                    status: 'success'
                });
            } catch (postError) {
                await notionService.updatePostStatus(post.id, 'Erro');
                results.push({
                    notionId: post.id,
                    status: 'error',
                    error: postError.message
                });
            }
        }

        res.json({
            processed: results.length,
            results
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
