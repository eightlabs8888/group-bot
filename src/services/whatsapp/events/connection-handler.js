const qrcode = require('qrcode-terminal');
const { DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const logger = require('../../../utils/logger');
const config = require('../../../config');
const { clearAuthState, forceDeleteAuth } = require('../auth');

let reconnectTimeout = null;
let isShuttingDown = false;

function clearReconnectTimeout() {
    if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
    }
}

function setReconnectTimeout(timeout) {
    clearReconnectTimeout();
    reconnectTimeout = timeout;
}

function setShuttingDown(value) {
    isShuttingDown = value;
}

function registerConnectionEvents(sock, saveCreds, reconnect) {
    
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            console.log(`\n${config.QR_CODE_MESSAGE}`);
            qrcode.generate(qr, { small: true });
            console.log(`\n${config.QR_CODE_VALIDITY_MESSAGE}\n`);
            logger.info('📱 New QR code generated');
        }
        
        if (connection === 'open') {
            clearReconnectTimeout();
            
            const userJid = sock.user?.id || 'Unknown';
            const connectedNumber = userJid.split(':')[0].split('@')[0];
            
            if (connectedNumber !== config.BOT_NUMBER) {
                console.log(`\n❌ [${new Date().toLocaleTimeString()}] UNAUTHORIZED CONNECTION DETECTED\n`);
                console.log(`Expected bot number: ${config.BOT_NUMBER}`);
                console.log(`Connected number: ${connectedNumber}`);
                console.log(`\n🚫 This number is not authorized to run this bot.`);
                console.log(`🗑️ Clearing authentication data and exiting...\n`);
                logger.error(`❌ Unauthorized connection attempt from ${connectedNumber}`);
                await forceDeleteAuth();
                process.exit(1);
            }
            
            console.log(`\n✅ [${new Date().toLocaleTimeString()}] Connected as: ${userJid}\n`);
            console.log(`🤖 Bot Name: ${config.BOT_NAME}`);
            console.log(`📱 Phone: ${config.BOT_NUMBER}`);
            console.log(`📍 Group Mode Only\n`);
            logger.info(`✅ Connected: ${userJid} (authorized)`);
        }
        
        if (connection === 'close') {
            if (isShuttingDown) return;
            
            const statusCode = new Boom(lastDisconnect?.error)?.output?.statusCode;
            logger.warn(`⚠️ Connection closed (Status: ${statusCode})`);
            
            if (statusCode === config.DISCONNECT_LOGGED_OUT) {
                console.log('\n❌ Logged out. Clearing session...\n');
                logger.warn('❌ Logged out, clearing auth');
                await clearAuthState();
                clearReconnectTimeout();
                setReconnectTimeout(setTimeout(() => reconnect(), config.RECONNECT_DELAY_LOGGED_OUT));
                
            } else if (statusCode === config.DISCONNECT_RESTART_REQUIRED) {
                logger.info('🔄 Stream restart required...');
                clearReconnectTimeout();
                setReconnectTimeout(setTimeout(() => reconnect(), config.RECONNECT_DELAY_RESTART));
                
            } else if (statusCode === config.DISCONNECT_BAD_SESSION) {
                logger.warn('⚠️ Bad session, restarting...');
                await clearAuthState();
                clearReconnectTimeout();
                setReconnectTimeout(setTimeout(() => reconnect(), config.RECONNECT_DELAY_BAD_SESSION));
                
            } else if (statusCode === config.DISCONNECT_CONNECTION_CLOSED) {
                logger.info('🔌 Connection closed normally');
                clearReconnectTimeout();
                setReconnectTimeout(setTimeout(() => reconnect(), config.RECONNECT_DELAY_CLOSED));
                
            } else {
                console.log(`\n⚠️ [${new Date().toLocaleTimeString()}] Connection lost. Reconnecting in ${config.RECONNECT_DELAY_LOST/1000}s...\n`);
                clearReconnectTimeout();
                setReconnectTimeout(setTimeout(() => reconnect(), config.RECONNECT_DELAY_LOST));
            }
        }
    });
    
    sock.ev.on('creds.update', saveCreds);
    logger.info('🔌 Connection event handlers registered');
}

module.exports = { registerConnectionEvents, clearReconnectTimeout, setReconnectTimeout, setShuttingDown };
