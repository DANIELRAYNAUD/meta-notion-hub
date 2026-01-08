/**
 * Script para obter o Page Access Token a partir do User Token
 */
require('dotenv').config();

async function getPageToken() {
    console.log('🔄 Buscando Page Access Token...\n');

    const userToken = process.env.META_ACCESS_TOKEN;

    try {
        // Listar todas as páginas que o usuário administra
        const response = await fetch(
            `https://graph.facebook.com/v18.0/me/accounts?access_token=${userToken}`
        );
        const data = await response.json();

        if (data.error) {
            console.log('❌ Erro:', data.error.message);
            console.log('\n📋 Você precisa adicionar a permissão "pages_manage_posts" no Graph API Explorer');
            return;
        }

        if (!data.data || data.data.length === 0) {
            console.log('❌ Nenhuma página encontrada.');
            console.log('📋 Certifique-se de que você é administrador da página e tem as permissões corretas.');
            return;
        }

        console.log('📄 Páginas encontradas:\n');

        for (const page of data.data) {
            console.log(`  📌 ${page.name}`);
            console.log(`     ID: ${page.id}`);
            console.log(`     Token: ${page.access_token.substring(0, 50)}...`);
            console.log('');
        }

        // Encontrar a página específica
        const targetPage = data.data.find(p => p.id === process.env.META_PAGE_ID);

        if (targetPage) {
            console.log('✅ Page Token para sua página encontrado!');
            console.log('\n📋 Adicione este token ao seu .env como META_PAGE_TOKEN:');
            console.log(`\nMETA_PAGE_TOKEN=${targetPage.access_token}`);
        } else {
            console.log(`⚠️ Página com ID ${process.env.META_PAGE_ID} não encontrada.`);
            console.log('Use um dos IDs listados acima.');
        }

    } catch (error) {
        console.log('❌ Erro:', error.message);
    }
}

getPageToken();
