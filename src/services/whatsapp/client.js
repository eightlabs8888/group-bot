const { 
    default: makeWASocket, 
    fetchLatestBaileysVersion,
    Browsers
} = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal'); // Added this
const logger = require('../../utils/logger');
const auth = require('./auth');
const events = require('./events');
const config = require('../../config');

let sock = null;

async function connect() {
    try {
        const { state, saveCreds } = await auth.loadAuthState();
        const { version } = await fetchLatestBaileysVersion();
        
        sock = makeWASocket({
            version,
            auth: state, // This now contains both creds and keys correctly
            printQRInTerminal: true,
            logger: logger,
            browser: Browsers.ubuntu('Chrome'),
        });

        // Listen for QR code
        sock.ev.on('connection.update', (update) => {
            const { qr } = update;
            if (qr) {
                qrcode.generate(qr, { small: true });
            }
        });

        events.registerAllEvents(sock, saveCreds, connect);
        return sock;
    } catch (error) {
        logger.error('❌ Failed to create WhatsApp client:', error.message);
        setTimeout(connect, 5000);
    }
}

module.exports = { connect, getSocket: () => sock, disconnect: async () => {
    if (sock) sock.end();
    await auth.closeAuth();
}};
