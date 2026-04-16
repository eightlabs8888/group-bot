const { makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const { MongoClient, Binary } = require('mongodb');
const logger = require('../../utils/logger');
const config = require('../../config');

const MONGO_URI = config.MONGO_URI;
const DB_NAME = 'whatsapp_bot';
const CREDS_COLLECTION = 'auth_creds';
const KEYS_COLLECTION = 'auth_keys';

let client = null;
let db = null;

async function getDb() {
    if (!client) {
        client = new MongoClient(MONGO_URI);
        await client.connect();
        db = client.db(DB_NAME);
        logger.info('✅ MongoDB connected for auth state');
    }
    return db;
}

function serializeWithBuffers(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Buffer.isBuffer(obj)) return { __type: 'Buffer', data: obj.toString('base64') };
    const res = Array.isArray(obj) ? [] : {};
    for (const key in obj) res[key] = serializeWithBuffers(obj[key]);
    return res;
}

function deserializeWithBuffers(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj.__type === 'Buffer') return Buffer.from(obj.data, 'base64');
    const res = Array.isArray(obj) ? [] : {};
    for (const key in obj) res[key] = deserializeWithBuffers(obj[key]);
    return res;
}

async function loadCreds() {
    const db = await getDb();
    const doc = await db.collection(CREDS_COLLECTION).findOne({ _id: 'creds' });
    return doc ? deserializeWithBuffers(doc.credsDataSerialized) : null;
}

async function saveCreds(creds) {
    const db = await getDb();
    await db.collection(CREDS_COLLECTION).updateOne(
        { _id: 'creds' },
        { $set: { credsDataSerialized: serializeWithBuffers(creds) } },
        { upsert: true }
    );
}

async function setKey(keyId, keyData) {
    const db = await getDb();
    await db.collection(KEYS_COLLECTION).updateOne(
        { _id: keyId },
        { $set: { keyDataSerialized: serializeWithBuffers(keyData) } },
        { upsert: true }
    );
}

async function getKey(keyId) {
    const db = await getDb();
    const doc = await db.collection(KEYS_COLLECTION).findOne({ _id: keyId });
    return doc ? deserializeWithBuffers(doc.keyDataSerialized) : null;
}

async function deleteKey(keyId) {
    const db = await getDb();
    await db.collection(KEYS_COLLECTION).deleteOne({ _id: keyId });
}

// ─── THE FIX IS HERE ─────────────────────────────────────
async function useMongoDBAuthState() {
    const creds = (await loadCreds()) || require('@whiskeysockets/baileys').initAuthCreds();
    
    return {
        state: {
            creds,
            keys: makeCacheableSignalKeyStore({
                get: async (type, ids) => {
                    const data = {};
                    await Promise.all(
                        ids.map(async (id) => {
                            let value = await getKey(`${type}-${id}`);
                            if (type === 'app-state-sync-key' && value) value = require('@whiskeysockets/baileys').proto.Message.AppStateSyncKeyData.fromObject(value);
                            data[id] = value;
                        })
                    );
                    return data;
                },
                set: async (data) => {
                    for (const type in data) {
                        for (const id in data[type]) {
                            const value = data[type][id];
                            const name = `${type}-${id}`;
                            if (value) await setKey(name, value);
                            else await deleteKey(name);
                        }
                    }
                }
            }, logger)
        },
        saveCreds: async () => {
            await saveCreds(creds);
        }
    };
}

async function clearMongoDBAuthState() {
    const db = await getDb();
    await db.collection(CREDS_COLLECTION).deleteMany({});
    await db.collection(KEYS_COLLECTION).deleteMany({});
    logger.info('🗑️ MongoDB auth state cleared');
}

async function closeMongoDB() {
    if (client) {
        await client.close();
        client = null;
        db = null;
        logger.info('🔌 MongoDB connection closed');
    }
}

module.exports = { useMongoDBAuthState, clearMongoDBAuthState, closeMongoDB };
