function buildHistory(messages) {
    if (!messages || messages.length === 0) return '';

    const lines = [];
    for (const msg of messages) {
        let sender = msg.sender_name;
        if (msg.from_type === 'ai') sender = 'Bot';
        lines.push(`${sender}: ${msg.message_text}`);
    }
    return lines.join('\n');
}

module.exports = { buildHistory };
