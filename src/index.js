require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

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

// Security middleware
app.use(helmet());
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

// Routes
app.use('/webhook', webhookRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/health', healthRoutes);
app.use('/auth', authRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Meta Notion Hub',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      auth: '/auth/facebook',
      authStatus: '/auth/status',
      webhook: '/webhook',
      leads: '/api/leads',
      posts: '/api/posts',
      metrics: '/api/metrics',
      messages: '/api/messages'
    }
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
