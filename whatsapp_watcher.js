const { Client, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');
const path = require('path');
const { generateAIReply } = require('./whatsapp_ai_reply');

console.log('Starting WhatsApp Employee...');

// Keywords to monitor
const KEYWORDS = ['urgent', 'asap', 'invoice', 'payment', 'help', 'important'];

// Processed messages tracker
let processedMessages = new Set();
const processedFile = '.credentials/whatsapp_processed.json';

// Track AI-generated messages to avoid infinite loop
let aiGeneratedMessages = new Set();

// Load processed messages
if (fs.existsSync(processedFile)) {
    const data = JSON.parse(fs.readFileSync(processedFile, 'utf-8'));
    processedMessages = new Set(data.messages || []);
    console.log(`Loaded ${processedMessages.size} processed messages`);
}

// Save processed messages
function saveProcessedMessages() {
    fs.writeFileSync(processedFile, JSON.stringify({ messages: Array.from(processedMessages) }));
}

// Create task file
function createTaskFile(contact, message) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const contactName = contact.name || contact.pushname || contact.number;
    const direction = message.fromMe ? 'outgoing' : 'incoming';
    const directionLabel = message.fromMe ? 'Outgoing (You sent)' : 'Incoming (You received)';

    const content = `---
type: whatsapp_message
direction: ${direction}
contact: ${contactName}
phone: ${contact.number}
timestamp: ${new Date().toISOString()}
priority: high
status: pending
---

## Conversation Context

**Direction:** ${directionLabel}
**Contact:** ${contactName}
**Phone:** ${contact.number}
**Time:** ${new Date().toLocaleString()}

## Message Content

${message.body}

## Instructions for AI

${direction === 'incoming'
    ? '**This person sent YOU a message.** Draft an appropriate response to them.'
    : '**YOU sent this message to them.** Draft a follow-up reply that they might send back. This helps you prepare for the conversation.'}

## Suggested Actions
- [ ] Analyze message intent and context
- [ ] Draft appropriate reply
- [ ] Create approval request in Pending_Approval/
- [ ] Move to Done/ when processed
`;

    const filename = `WHATSAPP_${direction.toUpperCase()}_${contactName}_${timestamp}.md`;
    const filepath = path.join('vault', 'Needs_Action', filename);

    fs.writeFileSync(filepath, content, 'utf-8');
    console.log(`✅ Created task file: ${filename}`);
}

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

client.on('qr', (qr) => {
    console.log('⚠️ QR code needed - session expired');
});

client.on('authenticated', () => {
    console.log('✅ Authenticated');
});

client.on('ready', () => {
    console.log('✅ WhatsApp Employee is ready!');
    console.log(`📱 Monitoring keywords: ${KEYWORDS.join(', ')}`);
    console.log('🔄 Listening for messages...\n');
});

client.on('message_create', async (message) => {
    try {
        const contact = await message.getContact();
        const chat = await message.getChat();

        // Skip group messages only
        if (chat.isGroup) return;

        const messageId = `${contact.number}_${message.timestamp}`;

        if (!processedMessages.has(messageId)) {
            const direction = message.fromMe ? 'outgoing' : 'incoming';
            const directionLabel = message.fromMe ? 'OUTGOING' : 'INCOMING';
            const contactName = contact.name || contact.pushname || contact.number;

            // Skip AI-generated messages to avoid infinite loop
            if (aiGeneratedMessages.has(message.body)) {
                console.log(`⏭️ Skipping AI-generated message`);
                processedMessages.add(messageId);
                saveProcessedMessages();
                return;
            }

            console.log(`\n🔔 New message detected! [${directionLabel}]`);
            console.log(`Contact: ${contactName}`);
            console.log(`Message: ${message.body.substring(0, 50)}...`);

            // Only reply to INCOMING messages (not outgoing)
            if (direction === 'incoming') {
                // Generate AI reply
                const aiReply = generateAIReply(message, direction, contactName);
                console.log(`🤖 AI Reply: ${aiReply.substring(0, 50)}...`);

                // Track this AI reply to avoid processing it later
                aiGeneratedMessages.add(aiReply);

                // Send AI-generated reply automatically
                await message.reply(aiReply);
                console.log(`✅ Reply sent!`);
            }

            createTaskFile(contact, message);
            processedMessages.add(messageId);
            saveProcessedMessages();
        }
    } catch (error) {
        console.error('Error processing message:', error.message);
    }
});

client.on('disconnected', (reason) => {
    console.log('❌ Disconnected:', reason);
});

// Start the client
client.initialize();

// Monitor approved folder for replies to send
function monitorApprovedFolder() {
    const approvedDir = path.join('vault', 'Approved');

    setInterval(async () => {
        try {
            if (!fs.existsSync(approvedDir)) return;

            const files = fs.readdirSync(approvedDir);
            const whatsappFiles = files.filter(f => f.startsWith('WHATSAPP_REPLY_'));

            for (const filename of whatsappFiles) {
                const filepath = path.join(approvedDir, filename);
                await sendApprovedReply(filepath, filename);
            }
        } catch (error) {
            console.error('Error monitoring approved folder:', error.message);
        }
    }, 5000); // Check every 5 seconds
}

// Send approved reply
async function sendApprovedReply(filepath, filename) {
    try {
        const content = fs.readFileSync(filepath, 'utf-8');

        // Extract phone number
        const phoneMatch = content.match(/phone:\s*(\d+)/);
        if (!phoneMatch) {
            console.error('❌ No phone number in:', filename);
            return;
        }

        const phoneNumber = phoneMatch[1];

        // Extract reply text
        const replyMatch = content.match(/## Drafted Reply\s*\n\n([\s\S]*?)(?=\n##|\n---|\n\*\*|$)/);
        if (!replyMatch) {
            console.error('❌ No reply content in:', filename);
            return;
        }

        const replyText = replyMatch[1].trim();

        console.log(`\n📤 Sending approved reply to ${phoneNumber}...`);
        console.log(`Message: ${replyText.substring(0, 50)}...`);

        // Send message
        const chatId = `${phoneNumber}@c.us`;
        await client.sendMessage(chatId, replyText);

        console.log('✅ Reply sent successfully!');

        // Move to Done
        const doneDir = path.join('vault', 'Done');
        if (!fs.existsSync(doneDir)) fs.mkdirSync(doneDir, { recursive: true });

        const donePath = path.join(doneDir, filename);
        fs.renameSync(filepath, donePath);

        console.log(`✅ Moved to Done: ${filename}\n`);

    } catch (error) {
        console.error('❌ Error sending reply:', error.message);
    }
}

// Start monitoring when client is ready
client.on('ready', () => {
    monitorApprovedFolder();
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Stopping WhatsApp Employee...');
    saveProcessedMessages();
    client.destroy();
    process.exit(0);
});
