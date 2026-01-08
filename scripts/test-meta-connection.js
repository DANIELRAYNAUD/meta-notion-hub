/**
 * Script para testar a conexão com a API do Meta usando Page Token
 */
require('dotenv').config();

async function testPageConnection() {
    console.log('🔄 Testando conexão com a Página e Instagram...\n');

    const accessToken = process.env.META_ACCESS_TOKEN;
    const pageId = process.env.META_PAGE_ID;
    const instagramId = process.env.INSTAGRAM_ACCOUNT_ID;

    // Testar acesso direto à página como page token
    console.log('1️⃣ Testando Page Token...');
    try {
        const meResponse = await fetch(
            `https://graph.facebook.com/v18.0/me?access_token=${accessToken}`
        );
        const meData = await meResponse.json();

        if (meData.error) {
            console.log('❌ Erro no token:', meData.error.message);
            return;
        }

        console.log(`✅ Token válido para: ${meData.name} (ID: ${meData.id})`);

        // Verificar se é um Page Token (terá category)
        if (meData.category) {
            console.log(`   📄 Tipo: Page Token (Categoria: ${meData.category})`);
        } else {
            console.log('   👤 Tipo: User Token');
        }
    } catch (error) {
        console.log('❌ Erro:', error.message);
        return;
    }

    // Testar feed da página
    console.log('\n2️⃣ Testando acesso ao feed da página...');
    try {
        const feedResponse = await fetch(
            `https://graph.facebook.com/v18.0/${pageId}/feed?limit=1&access_token=${accessToken}`
        );
        const feedData = await feedResponse.json();

        if (feedData.error) {
            console.log('❌ Feed:', feedData.error.message);
        } else {
            console.log(`✅ Feed acessível! ${feedData.data?.length || 0} posts encontrados`);
        }
    } catch (error) {
        console.log('❌ Erro:', error.message);
    }

    // Testar Instagram
    console.log('\n3️⃣ Testando acesso ao Instagram...');
    try {
        const igResponse = await fetch(
            `https://graph.facebook.com/v18.0/${instagramId}?fields=id,username,name,profile_picture_url,followers_count,media_count&access_token=${accessToken}`
        );
        const igData = await igResponse.json();

        if (igData.error) {
            console.log('❌ Instagram:', igData.error.message);
        } else {
            console.log(`✅ Instagram conectado!`);
            console.log(`   @${igData.username || igData.name}`);
            console.log(`   ${igData.followers_count || 0} seguidores`);
            console.log(`   ${igData.media_count || 0} posts`);
        }
    } catch (error) {
        console.log('❌ Erro:', error.message);
    }

    console.log('\n🎉 Teste concluído!');
}

testPageConnection();
