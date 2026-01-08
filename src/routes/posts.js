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
// POST /api/posts - Criar/Agendar um novo post
// ============================================
router.post('/', async (req, res) => {
    try {
        const { content, imageUrl, platform, publishDate } = req.body;

        if (!content) {
            return res.status(400).json({ error: 'content é obrigatório' });
        }

        const result = await notionService.createScheduledPost({
            content,
            imageUrl,
            platform: platform || 'Instagram',
            publishDate: publishDate || new Date().toISOString()
        });

        res.json({
            success: true,
            postId: result.id,
            message: 'Post agendado com sucesso'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// POST /api/posts/batch - Agendar MÚLTIPLOS posts de uma vez
// ============================================
router.post('/batch', async (req, res) => {
    try {
        const { posts } = req.body;

        if (!posts || !Array.isArray(posts) || posts.length === 0) {
            return res.status(400).json({ error: 'posts deve ser um array com pelo menos 1 item' });
        }

        const results = [];

        for (const post of posts) {
            try {
                const result = await notionService.createScheduledPost({
                    content: post.content,
                    imageUrl: post.imageUrl,
                    platform: post.platform || 'Instagram',
                    publishDate: post.publishDate || new Date().toISOString()
                });

                results.push({
                    success: true,
                    postId: result.id,
                    content: post.content.substring(0, 50) + '...',
                    publishDate: post.publishDate
                });
            } catch (postError) {
                results.push({
                    success: false,
                    error: postError.message,
                    content: post.content.substring(0, 50) + '...'
                });
            }
        }

        const successCount = results.filter(r => r.success).length;
        const errorCount = results.filter(r => !r.success).length;

        res.json({
            message: `${successCount} posts agendados, ${errorCount} erros`,
            total: posts.length,
            success: successCount,
            errors: errorCount,
            results
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
