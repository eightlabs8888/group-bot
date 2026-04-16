const logger = require('../../utils/logger');
const config = require('../../config');
const { useMongoDBAuthState, clearMongoDBAuthState, closeMongoDB } = require('./mongo-auth-state');

async function loadAuthState() {
    try {
        logger.info(`🔐 Loading auth state from MongoDB`);
        const { state, saveCreds } = await useMongoDBAuthState();
        logger.info('✅ Auth state loaded from MongoDB');
        return { state, saveCreds };
    } catch (error) {
        logger.error('❌ Failed to load auth state from MongoDB:', error);
        throw error;
    }
}

async function clearAuthState() {
    try {
        logger.warn('🧹 Clearing auth state from MongoDB...');
        await clearMongoDBAuthState();
        logger.info('✅ Auth state cleared from MongoDB');
    } catch (error) {
        logger.error('❌ Failed to clear auth state:', error);
    }
}

async function forceDeleteAuth() {
    try {
        logger.warn('🔥 Force deleting auth state from MongoDB...');
        await clearMongoDBAuthState();
        logger.info('✅ Auth state forcefully deleted from MongoDB');
    } catch (error) {
        logger.error('❌ Failed to force delete auth state:', error);
    }
}

async function closeAuth() {
    await closeMongoDB();
}

module.exports = { loadAuthState, clearAuthState, forceDeleteAuth, closeAuth };
