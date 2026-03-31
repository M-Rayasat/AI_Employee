#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { chromium } from 'playwright';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const WHATSAPP_SESSION_PATH = process.env.WHATSAPP_SESSION_PATH || '.credentials/whatsapp_session';

let browser = null;
let context = null;
let page = null;

async function initWhatsApp() {
  if (!browser) {
    browser = await chromium.launchPersistentContext(WHATSAPP_SESSION_PATH, {
      headless: false, // WhatsApp Web requires visible browser for QR scan
      args: ['--no-sandbox'],
    });

    page = browser.pages()[0] || await browser.newPage();
    await page.goto('https://web.whatsapp.com');

    // Wait for WhatsApp to load
    try {
      await page.waitForSelector('[data-testid="chat-list"]', { timeout: 60000 });
      console.error('WhatsApp Web loaded successfully');
    } catch (error) {
      console.error('Please scan QR code to authenticate WhatsApp Web');
      await page.waitForSelector('[data-testid="chat-list"]', { timeout: 120000 });
    }
  }
  return page;
}

const server = new Server(
  {
    name: 'whatsapp-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;

  try {
    const page = await initWhatsApp();

    if (name === 'send_message') {
      const { contact_name, message } = args;

      if (!contact_name || !message) {
        throw new Error('contact_name and message are required');
      }

      // Search for contact
      const searchBox = await page.waitForSelector('[data-testid="chat-list-search"]');
      await searchBox.click();
      await searchBox.fill(contact_name);
      await page.waitForTimeout(1000);

      // Click on first result
      const firstChat = await page.waitForSelector('[data-testid="cell-frame-container"]');
      await firstChat.click();
      await page.waitForTimeout(500);

      // Type and send message
      const messageBox = await page.waitForSelector('[data-testid="conversation-compose-box-input"]');
      await messageBox.click();
      await messageBox.fill(message);

      const sendButton = await page.waitForSelector('[data-testid="send"]');
      await sendButton.click();

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              contact: contact_name,
              message: message,
              sent_at: new Date().toISOString(),
            }, null, 2),
          },
        ],
      };
    }

    if (name === 'get_chats') {
      const { max_results = 10 } = args;

      // Get chat list
      const chats = await page.$$('[data-testid="cell-frame-container"]');
      const chatData = [];

      for (let i = 0; i < Math.min(chats.length, max_results); i++) {
        try {
          const chat = chats[i];
          const nameElement = await chat.$('[data-testid="cell-frame-title"]');
          const messageElement = await chat.$('[data-testid="last-msg"]');

          const name = nameElement ? await nameElement.textContent() : 'Unknown';
          const lastMessage = messageElement ? await messageElement.textContent() : '';

          chatData.push({
            index: i,
            name: name.trim(),
            last_message: lastMessage.trim(),
          });
        } catch (error) {
          console.error(`Error reading chat ${i}:`, error.message);
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              count: chatData.length,
              chats: chatData,
            }, null, 2),
          },
        ],
      };
    }

    if (name === 'get_messages') {
      const { contact_name, max_results = 10 } = args;

      if (!contact_name) {
        throw new Error('contact_name is required');
      }

      // Search and open chat
      const searchBox = await page.waitForSelector('[data-testid="chat-list-search"]');
      await searchBox.click();
      await searchBox.fill(contact_name);
      await page.waitForTimeout(1000);

      const firstChat = await page.waitForSelector('[data-testid="cell-frame-container"]');
      await firstChat.click();
      await page.waitForTimeout(1000);

      // Get messages
      const messages = await page.$$('[data-testid="msg-container"]');
      const messageData = [];

      for (let i = Math.max(0, messages.length - max_results); i < messages.length; i++) {
        try {
          const msg = messages[i];
          const textElement = await msg.$('.copyable-text');
          const text = textElement ? await textElement.textContent() : '';

          const isOutgoing = await msg.evaluate(el =>
            el.classList.contains('message-out')
          );

          messageData.push({
            text: text.trim(),
            direction: isOutgoing ? 'outgoing' : 'incoming',
          });
        } catch (error) {
          console.error(`Error reading message ${i}:`, error.message);
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              contact: contact_name,
              count: messageData.length,
              messages: messageData,
            }, null, 2),
          },
        ],
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error.message,
          }, null, 2),
        },
      ],
      isError: true,
    };
  }
});

server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      {
        name: 'send_message',
        description: 'Send a WhatsApp message to a contact',
        inputSchema: {
          type: 'object',
          properties: {
            contact_name: {
              type: 'string',
              description: 'Name of the contact to send message to',
            },
            message: {
              type: 'string',
              description: 'Message text to send',
            },
          },
          required: ['contact_name', 'message'],
        },
      },
      {
        name: 'get_chats',
        description: 'Get list of recent WhatsApp chats',
        inputSchema: {
          type: 'object',
          properties: {
            max_results: {
              type: 'number',
              description: 'Maximum number of chats to retrieve (default: 10)',
            },
          },
        },
      },
      {
        name: 'get_messages',
        description: 'Get recent messages from a specific contact',
        inputSchema: {
          type: 'object',
          properties: {
            contact_name: {
              type: 'string',
              description: 'Name of the contact',
            },
            max_results: {
              type: 'number',
              description: 'Maximum number of messages to retrieve (default: 10)',
            },
          },
          required: ['contact_name'],
        },
      },
    ],
  };
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('WhatsApp MCP server running on stdio');
}

process.on('SIGINT', async () => {
  if (browser) {
    await browser.close();
  }
  process.exit(0);
});

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
