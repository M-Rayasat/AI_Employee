#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

class EmailMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'email-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.gmail = null;
    this.setupHandlers();
    this.setupErrorHandling();
  }

  async authenticate() {
    try {
      const credentialsPath = process.env.GMAIL_CREDENTIALS_PATH || '.credentials/gmail_credentials.json';
      const tokenPath = process.env.GMAIL_TOKEN_PATH || '.credentials/gmail_token.json';

      // Load credentials
      const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
      const token = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));

      const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
      const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

      oAuth2Client.setCredentials(token);

      this.gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

      return true;
    } catch (error) {
      console.error('Authentication failed:', error.message);
      return false;
    }
  }

  setupErrorHandling() {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'send_email',
          description: 'Send an email via Gmail',
          inputSchema: {
            type: 'object',
            properties: {
              to: {
                type: 'string',
                description: 'Recipient email address',
              },
              subject: {
                type: 'string',
                description: 'Email subject',
              },
              body: {
                type: 'string',
                description: 'Email body content (plain text or HTML)',
              },
              reply_to_id: {
                type: 'string',
                description: 'Optional: Gmail message ID to reply to (for threading)',
              },
            },
            required: ['to', 'subject', 'body'],
          },
        },
        {
          name: 'draft_email',
          description: 'Create a draft email in Gmail',
          inputSchema: {
            type: 'object',
            properties: {
              to: {
                type: 'string',
                description: 'Recipient email address',
              },
              subject: {
                type: 'string',
                description: 'Email subject',
              },
              body: {
                type: 'string',
                description: 'Email body content',
              },
            },
            required: ['to', 'subject', 'body'],
          },
        },
        {
          name: 'search_emails',
          description: 'Search emails in Gmail',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Gmail search query (e.g., "from:example@gmail.com is:unread")',
              },
              maxResults: {
                type: 'number',
                description: 'Maximum number of results (default: 10)',
              },
            },
            required: ['query'],
          },
        },
      ],
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      // Authenticate if not already done
      if (!this.gmail) {
        const authenticated = await this.authenticate();
        if (!authenticated) {
          return {
            content: [
              {
                type: 'text',
                text: 'Error: Gmail authentication failed. Please check credentials.',
              },
            ],
          };
        }
      }

      try {
        switch (name) {
          case 'send_email':
            return await this.sendEmail(args);
          case 'draft_email':
            return await this.draftEmail(args);
          case 'search_emails':
            return await this.searchEmails(args);
          default:
            return {
              content: [
                {
                  type: 'text',
                  text: `Unknown tool: ${name}`,
                },
              ],
              isError: true,
            };
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error executing ${name}: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async sendEmail(args) {
    const { to, subject, body, reply_to_id } = args;

    // Create email message
    const message = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: text/plain; charset=utf-8',
      '',
      body,
    ].join('\n');

    // Encode message in base64
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const requestBody = {
      raw: encodedMessage,
    };

    // Add threading if reply_to_id provided
    if (reply_to_id) {
      requestBody.threadId = reply_to_id;
    }

    const result = await this.gmail.users.messages.send({
      userId: 'me',
      requestBody,
    });

    return {
      content: [
        {
          type: 'text',
          text: `Email sent successfully!\nMessage ID: ${result.data.id}\nTo: ${to}\nSubject: ${subject}`,
        },
      ],
    };
  }

  async draftEmail(args) {
    const { to, subject, body } = args;

    const message = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: text/plain; charset=utf-8',
      '',
      body,
    ].join('\n');

    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const result = await this.gmail.users.drafts.create({
      userId: 'me',
      requestBody: {
        message: {
          raw: encodedMessage,
        },
      },
    });

    return {
      content: [
        {
          type: 'text',
          text: `Draft created successfully!\nDraft ID: ${result.data.id}\nTo: ${to}\nSubject: ${subject}`,
        },
      ],
    };
  }

  async searchEmails(args) {
    const { query, maxResults = 10 } = args;

    const result = await this.gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults,
    });

    const messages = result.data.messages || [];

    if (messages.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: 'No emails found matching the query.',
          },
        ],
      };
    }

    // Get details for each message
    const messageDetails = await Promise.all(
      messages.map(async (msg) => {
        const details = await this.gmail.users.messages.get({
          userId: 'me',
          id: msg.id,
          format: 'metadata',
          metadataHeaders: ['From', 'Subject', 'Date'],
        });

        const headers = details.data.payload.headers;
        const from = headers.find((h) => h.name === 'From')?.value || 'Unknown';
        const subject = headers.find((h) => h.name === 'Subject')?.value || 'No Subject';
        const date = headers.find((h) => h.name === 'Date')?.value || 'Unknown';

        return {
          id: msg.id,
          from,
          subject,
          date,
          snippet: details.data.snippet,
        };
      })
    );

    const resultText = messageDetails
      .map(
        (msg, idx) =>
          `${idx + 1}. From: ${msg.from}\n   Subject: ${msg.subject}\n   Date: ${msg.date}\n   Preview: ${msg.snippet}\n   ID: ${msg.id}`
      )
      .join('\n\n');

    return {
      content: [
        {
          type: 'text',
          text: `Found ${messages.length} email(s):\n\n${resultText}`,
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Email MCP server running on stdio');
  }
}

// Start server
const server = new EmailMCPServer();
server.run().catch(console.error);
