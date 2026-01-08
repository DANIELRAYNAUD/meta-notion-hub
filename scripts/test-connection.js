/**
 * Script para testar a conexão com o Notion
 */
require('dotenv').config();
const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_API_KEY });

async function testConnection() {
    console.log('🔄 Testando conexão com o Notion...\n');

    const databases = [
        { name: 'Leads', id: process.env.NOTION_LEADS_DB },
        { name: 'Posts', id: process.env.NOTION_POSTS_DB },
        { name: 'Métricas', id: process.env.NOTION_METRICS_DB },
        { name: 'Mensagens', id: process.env.NOTION_MESSAGES_DB }
    ];

    for (const db of databases) {
        try {
            const response = await notion.databases.retrieve({ database_id: db.id });
            const title = response.title[0]?.plain_text || 'Sem título';
            console.log(`✅ ${db.name}: Conectado! (${title})`);
        } catch (error) {
            console.log(`❌ ${db.name}: Erro - ${error.message}`);
        }
    }

    console.log('\n🎉 Teste de conexão concluído!');
}

testConnection();
