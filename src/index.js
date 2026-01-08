require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Import routes
const webhookRoutes = require('./routes/webhooks');
const leadsRoutes = require('./routes/leads');
const postsRoutes = require('./routes/posts');
const metricsRoutes = require('./routes/metrics');
const messagesRoutes = require('./routes/messages');
const healthRoutes = require('./routes/health');
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const insightsRoutes = require('./routes/insights');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware - CSP desabilitado para permitir onclick inline do dashboard
app.use(helmet({
  contentSecurityPolicy: false // Desabilitado para permitir onclick inline
}));
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Serve static files (Dashboard)
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/webhook', webhookRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/insights', insightsRoutes);
app.use('/health', healthRoutes);
app.use('/auth', authRoutes);

// Dashboard route (serve index.html)
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Root redirect to dashboard
app.get('/', (req, res) => {
  res.redirect('/dashboard');
});

// Privacy Policy page (required by Meta)
app.get('/privacy', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Política de Privacidade - CRMJA Hub</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; line-height: 1.6; }
        h1 { color: #1a1a2e; }
      </style>
    </head>
    <body>
      <h1>Política de Privacidade</h1>
      <p>Última atualização: Janeiro 2026</p>
      <h2>Coleta de Dados</h2>
      <p>O CRMJA Hub coleta dados de leads, mensagens e métricas de suas contas do Facebook e Instagram para gerenciamento e análise.</p>
      <h2>Uso dos Dados</h2>
      <p>Os dados são usados exclusivamente para:</p>
      <ul>
        <li>Gerenciar leads recebidos</li>
        <li>Agendar e publicar posts</li>
        <li>Analisar métricas de engajamento</li>
      </ul>
      <h2>Contato</h2>
      <p>Para questões sobre privacidade, entre em contato pelo email: contato@crmja.com.br</p>
    </body>
    </html>
  `);
});

// Data Deletion callback (required by Meta)
app.get('/data-deletion', (req, res) => {
  res.json({
    url: 'https://meta-notion-hub.onrender.com/data-deletion',
    confirmation_code: 'CRMJA_' + Date.now()
  });
});

app.post('/data-deletion', (req, res) => {
  console.log('📋 Solicitação de exclusão de dados recebida:', req.body);
  res.json({
    url: 'https://meta-notion-hub.onrender.com/data-deletion',
    confirmation_code: 'CRMJA_DEL_' + Date.now()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 Meta Notion Hub running on port ${PORT}`);
  console.log('='.repeat(50));
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔑 Facebook Auth: http://localhost:${PORT}/auth/facebook`);
  console.log(`📋 Auth Status: http://localhost:${PORT}/auth/status`);
  console.log('='.repeat(50));

  // Start scheduler for automated tasks
  const scheduler = require('./scheduler');
  scheduler.start();
});

module.exports = app;
