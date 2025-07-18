// Webhook server configuration
const webhookConfig = {
  port: process.env.WEBHOOK_PORT || 8080,
  secret: process.env.WEBHOOK_SECRET || 'your-secret-key',
  deployScriptPath: process.env.DEPLOY_SCRIPT_PATH || './deploy.sh',
  endpoint: '/deploy',
};

module.exports = webhookConfig;
