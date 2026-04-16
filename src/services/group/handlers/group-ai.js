const { isBotTagged, getSenderName, getMessageText, sendWithRetry } = require('../utils');
const { saveMessage, getLastMessages } = require('../database/group-db');
const { buildHistory } = require('../history/builder');
const { callGroupAI } = require('../ai/github');

async function handleGroupAI(sock, msg, groupJid) {
    const senderJid = msg.key.participant || groupJid;
    const senderName = getSenderName(msg);
    const messageText = getMessageText(msg);
    const isTagged = isBotTagged(msg);

    if (!messageText) return;

    // Store every message
    await saveMessage(groupJid, senderJid, senderName, messageText, 'user', isTagged ? 1 : 0);

    // Only respond if tagged
    if (!isTagged) return;

    const question = messageText.replace(/@[\d]+/g, '').trim();
    if (!question) return;

    // Get history and build prompt
    const lastMessages = await getLastMessages(groupJid, 30);
    const history = buildHistory(lastMessages);

    const aiAnswer = await callGroupAI(question, history);
    const replyText = `@${senderName}\n${aiAnswer}`;

    // Store AI response
    await saveMessage(groupJid, 'bot', 'Bot', aiAnswer, 'ai', 0);

    await sendWithRetry(sock, groupJid, replyText);
}

module.exports = { handleGroupAI };
