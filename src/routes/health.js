const express = require('express');
const router = express.Router();
const config = require('../config');

// ============================================
// GET /health - Health check endpoint
// ============================================
router.get('/', (req, res) => {
    const healthCheck = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.server.nodeEnv,
        services: {
            notion: !!config.notion.token,
            meta: !!config.meta.accessToken,
            whatsapp: !!config.whatsapp.phoneNumberId
        }
    };

    res.json(healthCheck);
});

module.exports = router;
