const path = require('path');

module.exports = {
    // ─── BOT IDENTITY ─────────────────────────────────────────
    BOT_NAME: process.env.BOT_NAME,
    BOT_NUMBER: process.env.BOT_NUMBER,
    AUTH_DIR: path.resolve(process.cwd(), process.env.AUTH_DIR),

    // ─── BROWSER & CONNECTION ─────────────────────────────────
    BROWSER_PLATFORM: process.env.BROWSER_PLATFORM,
    BROWSER_NAME: process.env.BROWSER_NAME,
    BROWSER_VERSION: process.env.BROWSER_VERSION,
    RECONNECT_INTERVAL: parseInt(process.env.RECONNECT_INTERVAL),
    QR_RETRY_INTERVAL: parseInt(process.env.QR_RETRY_INTERVAL),
    MAX_RECONNECT_ATTEMPTS: parseInt(process.env.MAX_RECONNECT_ATTEMPTS),
    RECONNECT_BACKOFF_BASE: parseInt(process.env.RECONNECT_BACKOFF_BASE),
    RECONNECT_MAX_DELAY: parseInt(process.env.RECONNECT_MAX_DELAY),
    CONNECTION_CLEANUP_DELAY: parseInt(process.env.CONNECTION_CLEANUP_DELAY),
    CONNECT_TIMEOUT: parseInt(process.env.CONNECT_TIMEOUT),
    KEEP_ALIVE_INTERVAL: parseInt(process.env.KEEP_ALIVE_INTERVAL),
    QUERY_TIMEOUT: parseInt(process.env.QUERY_TIMEOUT),
    RETRY_REQUEST_DELAY: parseInt(process.env.RETRY_REQUEST_DELAY),
    MAX_MS_FOR_NEXT_CONNECTION: parseInt(process.env.MAX_MS_FOR_NEXT_CONNECTION),

    // ─── DISCONNECT RECOVERY ─────────────────────────────────
    DISCONNECT_LOGGED_OUT: parseInt(process.env.DISCONNECT_LOGGED_OUT),
    DISCONNECT_RESTART_REQUIRED: parseInt(process.env.DISCONNECT_RESTART_REQUIRED),
    DISCONNECT_BAD_SESSION: parseInt(process.env.DISCONNECT_BAD_SESSION),
    DISCONNECT_CONNECTION_CLOSED: parseInt(process.env.DISCONNECT_CONNECTION_CLOSED),
    RECONNECT_DELAY_LOGGED_OUT: parseInt(process.env.RECONNECT_DELAY_LOGGED_OUT),
    RECONNECT_DELAY_RESTART: parseInt(process.env.RECONNECT_DELAY_RESTART),
    RECONNECT_DELAY_BAD_SESSION: parseInt(process.env.RECONNECT_DELAY_BAD_SESSION),
    RECONNECT_DELAY_CLOSED: parseInt(process.env.RECONNECT_DELAY_CLOSED),
    RECONNECT_DELAY_LOST: parseInt(process.env.RECONNECT_DELAY_LOST),

    // ─── GROUP SETTINGS ──────────────────────────────────────
    ALLOWED_GROUP_JID: process.env.ALLOWED_GROUP_JID,
    BOT_LID: process.env.BOT_LID,
    BOT_LID_JID: `${process.env.BOT_LID}@lid`,
    BOT_NUMBER_JID: `${process.env.BOT_NUMBER}@s.whatsapp.net`,

    // ─── GROUP AI ────────────────────────────────────────────
    GROUP_AI_KEY: process.env.GROUP_AI_KEY,
    GITHUB_GROUP_ENDPOINT: process.env.GITHUB_GROUP_ENDPOINT,

    // ─── LOGGING ─────────────────────────────────────────────
    LOG_LEVEL: process.env.LOG_LEVEL,
    QR_CODE_MESSAGE: process.env.QR_CODE_MESSAGE || '🔐 SCAN THIS QR CODE WITH YOUR WHATSAPP:',
    QR_CODE_VALIDITY_MESSAGE: process.env.QR_CODE_VALIDITY_MESSAGE || '⏳ QR Code valid for 60 seconds...',

    // ─── MONGODB ─────────────────────────────────────────────
    MONGO_URI: process.env.MONGO_URI,
};
