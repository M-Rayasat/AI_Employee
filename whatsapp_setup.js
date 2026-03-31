const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

console.log('Starting WhatsApp setup...');

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: '.credentials/whatsapp_session'
    }),
    puppeteer: {
        headless: false,
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    console.log('\n========================================');
    console.log('QR CODE - Scan this with WhatsApp:');
    console.log('========================================\n');
    qrcode.generate(qr, {small: true});
    console.log('\n========================================');
    console.log('Steps:');
    console.log('1. Open WhatsApp on your phone');
    console.log('2. Go to Settings > Linked Devices');
    console.log('3. Tap "Link a Device"');
    console.log('4. Scan the QR code above');
    console.log('========================================\n');
});

client.on('authenticated', () => {
    console.log('✅ Authentication successful!');
});

client.on('ready', () => {
    console.log('✅ WhatsApp is ready!');
    console.log('✅ Session saved to .credentials/whatsapp_session');
    console.log('\nYou can now close this and run the watcher.');
    console.log('Press Ctrl+C to exit.');
});

client.on('auth_failure', (msg) => {
    console.error('❌ Authentication failed:', msg);
});

client.on('disconnected', (reason) => {
    console.log('Disconnected:', reason);
});

client.initialize();
