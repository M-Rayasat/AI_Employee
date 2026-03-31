const { Client, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');
const path = require('path');

console.log('Starting WhatsApp Reply Sender...');

// Initialize WhatsApp client
const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: '.credentials/whatsapp_session'
    }),
    puppeteer: {
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('ready', () => {
    console.log('✅ WhatsApp Reply Sender is ready!');
    console.log('🔄 Monitoring vault/Approved/ for WhatsApp replies...\n');
    
    // Start monitoring approved folder
    monitorApprovedFolder();
});

client.on('authenticated', () => {
    console.log('✅ Authenticated');
});

client.on('qr', (qr) => {
    console.log('⚠️ QR code needed - session expired');
});

// Monitor approved folder for WhatsApp replies
function monitorApprovedFolder() {
    const approvedDir = path.join('vault', 'Approved');
    
    setInterval(() => {
        try {
            const files = fs.readdirSync(approvedDir);
            const whatsappFiles = files.filter(f => f.startsWith('WHATSAPP_REPLY_'));
            
            whatsappFiles.forEach(async (filename) => {
                const filepath = path.join(approvedDir, filename);
                await processApprovedReply(filepath, filename);
            });
        } catch (error) {
            console.error('Error monitoring folder:', error.message);
        }
    }, 5000); // Check every 5 seconds
}

// Process approved reply and send
async function processApprovedReply(filepath, filename) {
    try {
        const content = fs.readFileSync(filepath, 'utf-8');
        
        // Extract phone number from frontmatter
        const phoneMatch = content.match(/phone:\s*(\d+)/);
        if (!phoneMatch) {
            console.error('❌ No phone number found in:', filename);
            return;
        }
        
        const phoneNumber = phoneMatch[1];
        
        // Extract drafted reply
        const replyMatch = content.match(/## Drafted Reply\s*\n\n([\s\S]*?)(?=\n##|\n---|\n\*\*|$)/);
        if (!replyMatch) {
            console.error('❌ No reply content found in:', filename);
            return;
        }
        
        const replyText = replyMatch[1].trim();
        
        console.log(`\n📤 Sending reply to ${phoneNumber}...`);
        console.log(`Message: ${replyText.substring(0, 50)}...`);
        
        // Send message
        const chatId = `${phoneNumber}@c.us`;
        await client.sendMessage(chatId, replyText);
        
        console.log('✅ Reply sent successfully!');
        
        // Move to Done
        const doneDir = path.join('vault', 'Done');
        const donePath = path.join(doneDir, filename);
        fs.renameSync(filepath, donePath);
        
        console.log(`✅ Moved to Done: ${filename}`);
        
        // Log action
        const logEntry = `\n[${new Date().toISOString()}]\nAction: WhatsApp Reply Sent\nTo: ${phoneNumber}\nFile: ${filename}\nStatus: Success\n---\n`;
        fs.appendFileSync(path.join('vault', 'Logs', new Date().toISOString().split('T')[0] + '.log'), logEntry);
        
    } catch (error) {
        console.error('❌ Error sending reply:', error.message);
    }
}

// Start the client
client.initialize();

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Stopping WhatsApp Reply Sender...');
    client.destroy();
    process.exit(0);
});
