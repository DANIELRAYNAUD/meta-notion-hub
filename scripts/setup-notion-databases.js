/**
 * Script para criar as databases do Meta Notion Hub no Notion
 * Cria: Posts, Métricas, Mensagens
 */

require('dotenv').config();
const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_API_KEY });

// ID da página pai (Meta Notion Hub)
const PARENT_PAGE_ID = process.env.NOTION_PAGE_ID;

async function createPostsDatabase() {
    console.log('Criando database Posts...');

    const response = await notion.databases.create({
        parent: { page_id: PARENT_PAGE_ID },
        title: [{ type: 'text', text: { content: 'Posts' } }],
        properties: {
            'Conteudo': { title: {} },
            'Plataforma': {
                select: {
                    options: [
                        { name: 'Instagram', color: 'pink' },
                        { name: 'Facebook', color: 'blue' },
                        { name: 'WhatsApp', color: 'green' }
                    ]
                }
            },
            'DataPublicacao': { date: {} },
            'Status': {
                status: {
                    options: [
                        { name: 'Rascunho', color: 'gray' },
                        { name: 'Agendado', color: 'yellow' },
                        { name: 'Publicado', color: 'green' },
                        { name: 'Erro', color: 'red' }
                    ]
                }
            },
            'IDdoPost': { rich_text: {} },
            'ImagemURL': { url: {} }
        }
    });

    console.log('✅ Database Posts criada:', response.id);
    return response.id;
}

async function createMetricasDatabase() {
    console.log('Criando database Métricas...');

    const response = await notion.databases.create({
        parent: { page_id: PARENT_PAGE_ID },
        title: [{ type: 'text', text: { content: 'Métricas' } }],
        properties: {
            'Campanha': { title: {} },
            'Impressoes': { number: { format: 'number' } },
            'Alcance': { number: { format: 'number' } },
            'Cliques': { number: { format: 'number' } },
            'Gastos': { number: { format: 'dollar' } },
            'CPM': { number: { format: 'dollar' } },
            'CPC': { number: { format: 'dollar' } },
            'CTR': { number: { format: 'percent' } },
            'Plataforma': {
                select: {
                    options: [
                        { name: 'Instagram', color: 'pink' },
                        { name: 'Facebook', color: 'blue' },
                        { name: 'Meta Ads', color: 'purple' }
                    ]
                }
            },
            'DataColeta': { date: {} }
        }
    });

    console.log('✅ Database Métricas criada:', response.id);
    return response.id;
}

async function createMensagensDatabase() {
    console.log('Criando database Mensagens...');

    const response = await notion.databases.create({
        parent: { page_id: PARENT_PAGE_ID },
        title: [{ type: 'text', text: { content: 'Mensagens' } }],
        properties: {
            'Mensagem': { title: {} },
            'Remetente': { rich_text: {} },
            'Plataforma': {
                select: {
                    options: [
                        { name: 'Instagram', color: 'pink' },
                        { name: 'Facebook', color: 'blue' },
                        { name: 'WhatsApp', color: 'green' },
                        { name: 'Messenger', color: 'purple' }
                    ]
                }
            },
            'Data': { date: {} },
            'Status': {
                status: {
                    options: [
                        { name: 'Não lida', color: 'red' },
                        { name: 'Lida', color: 'yellow' },
                        { name: 'Respondida', color: 'green' }
                    ]
                }
            },
            'ConversaID': { rich_text: {} }
        }
    });

    console.log('✅ Database Mensagens criada:', response.id);
    return response.id;
}

async function main() {
    console.log('='.repeat(50));
    console.log('Setup das Databases do Meta Notion Hub');
    console.log('='.repeat(50));

    if (!PARENT_PAGE_ID) {
        console.error('❌ NOTION_PAGE_ID não definido no .env');
        console.log('Por favor, adicione o ID da página "Meta Notion Hub" ao arquivo .env');
        process.exit(1);
    }

    try {
        const postsId = await createPostsDatabase();
        const metricasId = await createMetricasDatabase();
        const mensagensId = await createMensagensDatabase();

        console.log('\n' + '='.repeat(50));
        console.log('✅ Todas as databases foram criadas!');
        console.log('='.repeat(50));
        console.log('\nAdicione estes IDs ao seu .env:');
        console.log(`NOTION_DB_POSTS=${postsId}`);
        console.log(`NOTION_DB_METRICAS=${metricasId}`);
        console.log(`NOTION_DB_MENSAGENS=${mensagensId}`);

    } catch (error) {
        console.error('❌ Erro ao criar databases:', error.message);
        if (error.body) {
            console.error('Detalhes:', JSON.stringify(error.body, null, 2));
        }
        process.exit(1);
    }
}

main();
