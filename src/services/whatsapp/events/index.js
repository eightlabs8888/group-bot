const logger = require('../../../utils/logger');
const { registerConnectionEvents } = require('./connection-handler');
const { registerMessageEvents } = require('./message-handler');
const { clearReconnectTimeout, setReconnectTimeout, setShuttingDown } = require('./connection-handler');

function registerAllEvents(sock, saveCreds, reconnect) {
    logger.info('🎯 Registering all event handlers');
    
    registerConnectionEvents(sock, saveCreds, reconnect);
    registerMessageEvents(sock);
}

module.exports = { 
    registerAllEvents,
    clearReconnectTimeout,
    setReconnectTimeout, 
    setShuttingDown 
};
