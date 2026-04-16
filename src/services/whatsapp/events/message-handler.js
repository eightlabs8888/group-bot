const logger = require('../../../utils/logger');
const config = require('../../../config');
const { handleGroupAI } = require('../../group/handlers/group-ai');

async function handleIncomingMessage(sock, msg) {
    try {
        const sender = msg.key.remoteJid;
        
        // Ignore one-to-one messages
        if (!sender.endsWith('@g.us')) {
            return;
        }
        
        // Only process allowed group
        if (sender !== config.ALLOWED_GROUP_JID) {
            logger.debug(`🚫 Blocked group message from: ${sender}`);
            return;
        }
        
        // Ignore bot's own messages
        if (msg.key.fromMe) return;
        
        await handleGroupAI(sock, msg, sender);
        
    } catch (error) {
        logger.error('Error handling message:', error);
    }
}

function registerMessageEvents(sock) {
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type === 'notify') {
            for (const msg of messages) {
                await handleIncomingMessage(sock, msg);
            }
        }
    });
    logger.info('💬 Message event handlers registered');
}

module.exports = { registerMessageEvents };
