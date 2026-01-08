module.exports = {
    notion: {
        token: process.env.NOTION_TOKEN,
        databases: {
            leads: process.env.NOTION_LEADS_DB,
            posts: process.env.NOTION_POSTS_DB,
            metrics: process.env.NOTION_METRICS_DB,
            messages: process.env.NOTION_MESSAGES_DB
        }
    },
    meta: {
        appId: process.env.META_APP_ID,
        appSecret: process.env.META_APP_SECRET,
        accessToken: process.env.META_ACCESS_TOKEN,
        pageId: process.env.META_PAGE_ID,
        adAccountId: process.env.META_AD_ACCOUNT_ID
    },
    whatsapp: {
        phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
        businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID
    },
    webhook: {
        verifyToken: process.env.WEBHOOK_VERIFY_TOKEN
    },
    server: {
        port: process.env.PORT || 3000,
        nodeEnv: process.env.NODE_ENV || 'development'
    }
};
