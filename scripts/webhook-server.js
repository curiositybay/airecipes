#!/usr/bin/env node

/**
 * Simple webhook server for deployment triggers
 * This server listens for POST requests and triggers deployment scripts
 */

const http = require('http');
const { spawn } = require('child_process');
const path = require('path');
const webhookConfig = require('./config');

// Validate webhook request
function validateWebhook(req, body) {
  // Add your validation logic here
  // For example, check for a secret token in headers
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${webhookConfig.secret}`) {
    return false;
  }

  // Validate payload structure
  try {
    const payload = JSON.parse(body);
    return payload.image && payload.tag;
  } catch (error) {
    return false;
  }
}

// Execute deployment script
function executeDeployment(image, tag) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, webhookConfig.deployScriptPath);
    const args = [image, tag];

    console.log(`Executing deployment: ${scriptPath} ${args.join(' ')}`);

    const child = spawn(scriptPath, args, {
      stdio: 'pipe',
      shell: true,
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', data => {
      stdout += data.toString();
      console.log(`[DEPLOY] ${data.toString().trim()}`);
    });

    child.stderr.on('data', data => {
      stderr += data.toString();
      console.error(`[DEPLOY ERROR] ${data.toString().trim()}`);
    });

    child.on('close', code => {
      if (code === 0) {
        console.log('Deployment completed successfully');
        resolve({ success: true, stdout, stderr });
      } else {
        console.error(`Deployment failed with code ${code}`);
        reject(new Error(`Deployment failed with code ${code}: ${stderr}`));
      }
    });

    child.on('error', error => {
      console.error('Failed to start deployment script:', error);
      reject(error);
    });
  });
}

// Create HTTP server
const server = http.createServer((req, res) => {
  // Only handle POST requests
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  // Only handle /deploy endpoint
  if (req.url !== webhookConfig.endpoint) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Endpoint not found' }));
    return;
  }

  let body = '';

  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', async () => {
    try {
      // Validate webhook
      if (!validateWebhook(req, body)) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Unauthorized' }));
        return;
      }

      const payload = JSON.parse(body);
      const { image, tag } = payload;

      console.log(`Received deployment request for ${image}:${tag}`);

      // Execute deployment
      const result = await executeDeployment(image, tag);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          success: true,
          message: 'Deployment triggered successfully',
          image,
          tag,
          timestamp: new Date().toISOString(),
        })
      );
    } catch (error) {
      console.error('Webhook processing error:', error);

      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          error: 'Internal server error',
          message: error.message,
        })
      );
    }
  });
});

// Start server
server.listen(webhookConfig.port, () => {
  console.log(`Webhook server listening on port ${webhookConfig.port}`);
  console.log(
    `Deploy endpoint: http://localhost:${webhookConfig.port}${webhookConfig.endpoint}`
  );
  console.log(`Secret: ${webhookConfig.secret}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
