const config = require('../../config');

function isBotTagged(msg) {
    try {
        const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
        if (!contextInfo) return false;
        
        const mentionedJids = contextInfo.mentionedJid;
        if (!mentionedJids || !Array.isArray(mentionedJids)) return false;
        
        const botJid = config.BOT_NUMBER_JID;
        const botLidJid = config.BOT_LID_JID;
        
        return mentionedJids.some(jid => 
            jid === botJid || 
            jid === botLidJid ||
            jid.includes(config.BOT_LID)
        );
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
    return text.trim();
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

module.exports = { isBotTagged, getSenderName, getMessageText, sendWithRetry };
