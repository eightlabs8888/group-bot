const axios = require('axios');
const config = require('../../../config');

async function callGroupAI(question, history = '') {
    const systemPrompt = `You are Noel, a helpful WhatsApp group assistant. Answer briefly and naturally. No markdown. No emojis.

Conversation history (oldest to newest):
${history}

Continue naturally based on the conversation above.`;

    try {
        const response = await axios.post(
            config.GITHUB_GROUP_ENDPOINT,
            {
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: question }
                ],
                model: 'gpt-4o',
                temperature: 0.7,
                max_tokens: 500
            },
            {
                headers: {
                    'Authorization': `Bearer ${config.GROUP_AI_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );

        return response.data.choices[0].message.content.trim();
    } catch (error) {
        console.error('Group AI error:', error.message);
        return 'Sorry bro, something went wrong. Try again.';
    }
}

module.exports = { callGroupAI };
