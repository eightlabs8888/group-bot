const config = require('../../config');

function isBotTagged(msg) {
    try {
        // First check if message starts with dot - if yes, ignore completely
        const messageText = getMessageText(msg);
        if (messageText.startsWith('.')) {
            return false;
        }
        
        const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
        if (!contextInfo) return false;
        
        const mentionedJids = contextInfo.mentionedJid;
        if (!mentionedJids || !Array.isArray(mentionedJids)) return false;
        
        const botJid = config.BOT_NUMBER_JID;
        const botLidJid = config.BOT_LID_JID;
        
        const isBotMentioned = mentionedJids.some(jid => 
            jid === botJid || 
            jid === botLidJid ||
            jid.includes(config.BOT_LID)
        );
        
        if (!isBotMentioned) return false;
        
        // Check if tag is at the beginning of the message
        const botTagPlain = `@${config.BOT_NUMBER}`;
        const botTagLid = `@${config.BOT_LID}`;
        
        // Remove leading spaces and check if message starts with @botnumber or @botlid
        const trimmedStart = messageText.trimStart();
        const startsWithBotTag = trimmedStart.startsWith(botTagPlain) || 
                                  trimmedStart.startsWith(botTagLid);
        
        return startsWithBotTag;
        
    } catch (err) {
        return false;
    }
}

function getSenderName(msg) {
    return msg.pushName || 'User';
}

function getMessageText(msg) {
    const text = msg.message?.conversation ||
                 msg.message?.extendedTextMessage?.text || '';
    return text;
}

async function sendWithRetry(sock, jid, replyText, maxRetries = 5, delayMs = 3000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            await sock.sendMessage(jid, { text: replyText });
            return true;
        } catch (err) {
            if (attempt === maxRetries) return false;
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }
    return false;
}

function shouldIgnoreMessage(msg) {
    const messageText = getMessageText(msg);
    return messageText.startsWith('.');
}

module.exports = { isBotTagged, getSenderName, getMessageText, sendWithRetry, shouldIgnoreMessage };
