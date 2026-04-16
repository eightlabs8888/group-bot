require('dotenv').config();
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
        await whatsappClient.connect();
        
        process.on('SIGINT', async () => {
            logger.info('👋 Shutting down...');
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
    }
}

start();
