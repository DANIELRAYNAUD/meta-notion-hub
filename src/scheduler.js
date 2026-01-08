const cron = require('node-cron');
const notionService = require('./services/notionService');
const metaService = require('./services/metaService');

class Scheduler {
    constructor() {
        this.jobs = [];
    }

    // ============================================
    // INICIAR TODOS OS JOBS
    // ============================================
    start() {
        console.log('⏰ Iniciando agendador de tarefas...');

        // Processar posts agendados a cada 5 minutos
        this.schedulePostProcessor();

        // Sincronizar métricas diariamente às 8h
        this.scheduleMetricsSync();

        console.log('✅ Agendador iniciado com sucesso');
    }

    // ============================================
    // PROCESSAR POSTS AGENDADOS
    // Roda a cada 5 minutos
    // ============================================
    schedulePostProcessor() {
        const job = cron.schedule('*/5 * * * *', async () => {
            console.log('🔄 Verificando posts agendados...');

            try {
                const posts = await notionService.getScheduledPosts();

                for (const post of posts) {
                    try {
                        const content = notionService.extractText(post.properties['Conteúdo']);
                        const imageUrl = post.properties['Imagem']?.url || null;
                        const platform = notionService.extractText(post.properties['Plataforma']);

                        if (!content) {
                            console.log('⚠️ Post sem conteúdo, pulando:', post.id);
                            continue;
                        }

                        let result;
                        if (platform.toLowerCase() === 'instagram' && imageUrl) {
                            result = await metaService.publishToInstagram(imageUrl, content);
                        } else {
                            result = await metaService.publishPost(content, imageUrl);
                        }

                        await notionService.updatePostStatus(post.id, 'Publicado', result.id);
                        console.log('✅ Post publicado:', post.id);
                    } catch (postError) {
                        console.error('❌ Erro ao publicar post:', postError.message);
                        await notionService.updatePostStatus(post.id, 'Erro');
                    }
                }
            } catch (error) {
                console.error('❌ Erro no processador de posts:', error.message);
            }
        });

        this.jobs.push(job);
    }

    // ============================================
    // SINCRONIZAR MÉTRICAS
    // Roda diariamente às 8h
    // ============================================
    scheduleMetricsSync() {
        const job = cron.schedule('0 8 * * *', async () => {
            console.log('📊 Sincronizando métricas do dia anterior...');

            try {
                const metrics = await metaService.getAdAccountInsights('yesterday');

                if (metrics) {
                    await notionService.saveMetrics(metrics);
                    console.log('✅ Métricas sincronizadas');
                }
            } catch (error) {
                console.error('❌ Erro ao sincronizar métricas:', error.message);
            }
        });

        this.jobs.push(job);
    }

    // ============================================
    // PARAR TODOS OS JOBS
    // ============================================
    stop() {
        this.jobs.forEach(job => job.stop());
        console.log('⏹️ Agendador parado');
    }
}

module.exports = new Scheduler();
