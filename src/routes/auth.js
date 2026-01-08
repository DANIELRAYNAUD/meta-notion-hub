/**
 * Rotas de autenticação OAuth para Facebook/Instagram
 */
const express = require('express');
const router = express.Router();

const META_APP_ID = process.env.META_APP_ID;
const META_APP_SECRET = process.env.META_APP_SECRET;
const REDIRECT_URI = process.env.OAUTH_REDIRECT_URI || 'http://localhost:3000/auth/callback';

// Armazenamento temporário de tokens (em produção, usar banco de dados)
let tokenStore = {
  userToken: null,
  pageTokens: {},
  instagramAccounts: {}
};

// Permissões - usar apenas as disponíveis em desenvolvimento
// Em produção, adicionar mais permissões após App Review
const SCOPES = 'pages_show_list';

/**
 * GET /auth/facebook
 * Inicia o fluxo OAuth redirecionando para o Facebook
 */
router.get('/facebook', (req, res) => {
  const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
    `client_id=${META_APP_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&scope=${encodeURIComponent(SCOPES)}` +
    `&response_type=code`;

  console.log('🔄 Redirecionando para Facebook OAuth...');
  res.redirect(authUrl);
});

/**
 * GET /auth/callback
 * Callback do OAuth - recebe o código e troca por token
 */
router.get('/callback', async (req, res) => {
  const { code, error } = req.query;

  if (error) {
    console.error('❌ Erro no OAuth:', error);
    return res.send(`
      <html>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h1>❌ Erro na autenticação</h1>
          <p>${error}</p>
          <a href="/auth/facebook">Tentar novamente</a>
        </body>
      </html>
    `);
  }

  if (!code) {
    return res.send('Código não recebido');
  }

  try {
    // Trocar código por access token
    const tokenUrl = `https://graph.facebook.com/v18.0/oauth/access_token?` +
      `client_id=${META_APP_ID}` +
      `&client_secret=${META_APP_SECRET}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&code=${code}`;

    const tokenResponse = await fetch(tokenUrl);
    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      throw new Error(tokenData.error.message);
    }

    tokenStore.userToken = tokenData.access_token;
    console.log('✅ User Token obtido!');

    // Buscar páginas do usuário
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${tokenData.access_token}`
    );
    const pagesData = await pagesResponse.json();

    if (pagesData.data && pagesData.data.length > 0) {
      for (const page of pagesData.data) {
        tokenStore.pageTokens[page.id] = {
          name: page.name,
          token: page.access_token
        };
        console.log(`✅ Page Token obtido para: ${page.name} (${page.id})`);

        // Buscar conta do Instagram vinculada
        const igResponse = await fetch(
          `https://graph.facebook.com/v18.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`
        );
        const igData = await igResponse.json();

        if (igData.instagram_business_account) {
          tokenStore.instagramAccounts[page.id] = igData.instagram_business_account.id;
          console.log(`✅ Instagram conectado: ${igData.instagram_business_account.id}`);
        }
      }
    }

    // Redirecionar para página de sucesso
    res.redirect('/auth/success');

  } catch (error) {
    console.error('❌ Erro ao processar callback:', error);
    res.send(`
      <html>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h1>❌ Erro ao processar autenticação</h1>
          <p>${error.message}</p>
          <a href="/auth/facebook">Tentar novamente</a>
        </body>
      </html>
    `);
  }
});

/**
 * GET /auth/success
 * Página de sucesso após autenticação
 */
router.get('/success', (req, res) => {
  const pages = Object.entries(tokenStore.pageTokens).map(([id, data]) => ({
    id,
    name: data.name,
    hasInstagram: !!tokenStore.instagramAccounts[id]
  }));

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>CRMJA Hub - Conectado!</title>
      <style>
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 0;
        }
        .card {
          background: white;
          border-radius: 20px;
          padding: 40px;
          max-width: 500px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 { color: #22c55e; margin-bottom: 10px; }
        .page-item {
          background: #f3f4f6;
          padding: 15px;
          border-radius: 10px;
          margin: 10px 0;
        }
        .page-name { font-weight: bold; color: #1f2937; }
        .page-id { color: #6b7280; font-size: 12px; }
        .instagram-badge {
          background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888);
          color: white;
          padding: 3px 8px;
          border-radius: 5px;
          font-size: 11px;
          margin-left: 10px;
        }
        .btn {
          display: inline-block;
          background: #3b82f6;
          color: white;
          padding: 12px 25px;
          border-radius: 10px;
          text-decoration: none;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>✅ Conectado com sucesso!</h1>
        <p>Suas páginas e contas do Instagram estão prontas para uso.</p>
        
        <h3>📄 Páginas conectadas:</h3>
        ${pages.length > 0 ? pages.map(p => `
          <div class="page-item">
            <span class="page-name">${p.name}</span>
            ${p.hasInstagram ? '<span class="instagram-badge">📸 Instagram</span>' : ''}
            <div class="page-id">ID: ${p.id}</div>
          </div>
        `).join('') : '<p>Nenhuma página encontrada</p>'}
        
        <a href="/auth/status" class="btn">Ver Status Completo</a>
      </div>
    </body>
    </html>
  `);
});

/**
 * GET /auth/status
 * Retorna o status atual dos tokens
 */
router.get('/status', (req, res) => {
  res.json({
    connected: !!tokenStore.userToken,
    pages: Object.entries(tokenStore.pageTokens).map(([id, data]) => ({
      id,
      name: data.name,
      hasToken: !!data.token,
      instagramId: tokenStore.instagramAccounts[id] || null
    }))
  });
});

/**
 * GET /auth/tokens
 * Retorna os tokens (apenas para desenvolvimento)
 */
router.get('/tokens', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Não disponível em produção' });
  }

  res.json({
    userToken: tokenStore.userToken ? tokenStore.userToken.substring(0, 50) + '...' : null,
    pageTokens: Object.entries(tokenStore.pageTokens).map(([id, data]) => ({
      id,
      name: data.name,
      tokenPreview: data.token ? data.token.substring(0, 50) + '...' : null
    })),
    instagramAccounts: tokenStore.instagramAccounts
  });
});

// Exportar tokenStore para uso em outros módulos
router.getTokenStore = () => tokenStore;

module.exports = router;
