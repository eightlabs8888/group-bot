const { MongoClient } = require('mongodb');
const logger = require('../../../utils/logger');

// Reuse your existing connection string
const MONGO_URI = 'mongodb://noelmarko80_db_user:RNDiIqTlY1UCmHP8@ac-nqrlw8n-shard-00-00.oyx2r3j.mongodb.net:27017,ac-nqrlw8n-shard-00-01.oyx2r3j.mongodb.net:27017,ac-nqrlw8n-shard-00-02.oyx2r3j.mongodb.net:27017/?ssl=true&replicaSet=atlas-mg5t14-shard-0&authSource=admin&appName=Cluster01';
const DB_NAME = 'whatsapp_bot';
const HISTORY_COLLECTION = 'group_history';

let client = null;
let db = null;

async function getDb() {
    if (!client) {
        client = new MongoClient(MONGO_URI);
        await client.connect();
        db = client.db(DB_NAME);
        logger.info('✅ MongoDB connected for message history');
    }
    return db;
}

async function saveMessage(groupJid, senderJid, senderName, messageText, fromType, isTagged = 0) {
    try {
        const database = await getDb();
        const collection = database.collection(HISTORY_COLLECTION);
        
        await collection.insertOne({
            group_jid: groupJid,
            sender_jid: senderJid,
            sender_name: senderName,
            message_text: messageText,
            from_type: fromType,
            timestamp: Date.now(),
            is_tagged: isTagged
        });
    } catch (err) {
        logger.error('❌ Error saving message to MongoDB:', err);
    }
}

async function getLastMessages(groupJid, limit = 30) {
    try {
        const database = await getDb();
        const collection = database.collection(HISTORY_COLLECTION);
        
        const rows = await collection
            .find({ group_jid: groupJid })
            .sort({ timestamp: -1 })
            .limit(limit)
            .toArray();
            
        // Reverse to return oldest to newest for the AI builder
        return rows.reverse();
    } catch (err) {
        logger.error('❌ Error retrieving messages from MongoDB:', err);
        return [];
    }
}

module.exports = { saveMessage, getLastMessages };
