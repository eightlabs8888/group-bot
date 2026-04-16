require('dotenv').config();
const http = require('http');
const whatsappClient = require('./src/services/whatsapp/client');
const logger = require('./src/utils/logger');

async function start() {
    console.log(`
╔════════════════════════════════╗
║       GROUP BOT - NOEL         ║
║                                ║
║  Bot Name: ${process.env.BOT_NAME || 'Noel'}                ║
║  Bot Number: ${process.env.BOT_NUMBER || 'Unknown'}            ║
║  Status: Group Mode Only       ║
╚════════════════════════════════╝
    `);

    try {
        logger.info('🚀 Starting Group Bot...');
        
        // Start WhatsApp client
        await whatsappClient.connect();
        
        // Create a simple HTTP server for Railway to keep the process alive
        const PORT = process.env.PORT || 3000;
        const server = http.createServer((req, res) => {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('WhatsApp Group Bot is running');
        });
        
        server.listen(PORT, () => {
            logger.info(`🌐 HTTP server listening on port ${PORT} (for Railway keep-alive)`);
            
            // Self-ping every 4 minutes to prevent idle shutdown
            setInterval(() => {
                http.get(`http://localhost:${PORT}`, (res) => {
                    logger.debug(`🔄 Self-ping successful: ${res.statusCode}`);
                    res.resume(); // Consume response data to free up memory
                }).on('error', (err) => {
                    logger.warn(`⚠️ Self-ping failed: ${err.message}`);
                });
            }, 4 * 60 * 1000); // 4 minutes
        });
        
        process.on('SIGINT', async () => {
            logger.info('👋 Shutting down...');
            server.close();
            await whatsappClient.disconnect();
            process.exit(0);
        });
        
        process.on('uncaughtException', (error) => {
            logger.error('💥 Uncaught Exception:', error);
        });
        
        process.on('unhandledRejection', (error) => {
            logger.error('💥 Unhandled Rejection:', error);
        });
    } catch (err) {
        logger.error('❌ Initialization failed:', err.message);
        process.exit(1);
    }
}

start();
