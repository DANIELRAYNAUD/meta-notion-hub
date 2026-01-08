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

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware - configurado para permitir scripts inline do dashboard
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"]
    }
  }
}));
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (Dashboard)
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/webhook', webhookRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/messages', messagesRoutes);
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
