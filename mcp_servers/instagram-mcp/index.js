#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const PAGE_ACCESS_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
const INSTAGRAM_ACCOUNT_ID = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
const GRAPH_API_VERSION = 'v18.0';
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

if (!PAGE_ACCESS_TOKEN || !INSTAGRAM_ACCOUNT_ID) {
  console.error('Error: FACEBOOK_PAGE_ACCESS_TOKEN and INSTAGRAM_BUSINESS_ACCOUNT_ID must be set in .env');
  process.exit(1);
}

const server = new Server(
  {
    name: 'instagram-mcp',
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
    if (name === 'post_to_instagram') {
      const { image_url, caption } = args;

      if (!image_url || !caption) {
        throw new Error('image_url and caption are required');
      }

      // Step 1: Create media container
      const containerResponse = await axios.post(
        `${GRAPH_API_BASE}/${INSTAGRAM_ACCOUNT_ID}/media`,
        {
          image_url,
          caption,
          access_token: PAGE_ACCESS_TOKEN,
        }
      );

      const creationId = containerResponse.data.id;

      // Step 2: Publish the media container
      const publishResponse = await axios.post(
        `${GRAPH_API_BASE}/${INSTAGRAM_ACCOUNT_ID}/media_publish`,
        {
          creation_id: creationId,
          access_token: PAGE_ACCESS_TOKEN,
        }
      );

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              media_id: publishResponse.data.id,
              caption: caption,
              image_url: image_url,
              posted_at: new Date().toISOString(),
            }, null, 2),
          },
        ],
      };
    }

    if (name === 'get_instagram_insights') {
      const { metric = 'impressions,reach,engagement', period = 'day' } = args;

      const response = await axios.get(
        `${GRAPH_API_BASE}/${INSTAGRAM_ACCOUNT_ID}/insights`,
        {
          params: {
            metric,
            period,
            access_token: PAGE_ACCESS_TOKEN,
          },
        }
      );

      const insights = {};
      if (response.data.data) {
        response.data.data.forEach(item => {
          insights[item.name] = {
            title: item.title,
            description: item.description,
            values: item.values,
          };
        });
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              account_id: INSTAGRAM_ACCOUNT_ID,
              period: period,
              insights: insights,
              retrieved_at: new Date().toISOString(),
            }, null, 2),
          },
        ],
      };
    }

    if (name === 'get_recent_media') {
      const { limit = 10 } = args;

      const response = await axios.get(
        `${GRAPH_API_BASE}/${INSTAGRAM_ACCOUNT_ID}/media`,
        {
          params: {
            fields: 'id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count',
            limit,
            access_token: PAGE_ACCESS_TOKEN,
          },
        }
      );

      const media = response.data.data.map(item => ({
        id: item.id,
        caption: item.caption || 'No caption',
        media_type: item.media_type,
        permalink: item.permalink,
        timestamp: item.timestamp,
        likes: item.like_count || 0,
        comments: item.comments_count || 0,
      }));

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              count: media.length,
              media: media,
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
            error: error.response?.data?.error?.message || error.message,
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
        name: 'post_to_instagram',
        description: 'Post an image to Instagram Business account',
        inputSchema: {
          type: 'object',
          properties: {
            image_url: {
              type: 'string',
              description: 'Public URL of the image to post (must be accessible)',
            },
            caption: {
              type: 'string',
              description: 'Caption text for the Instagram post',
            },
          },
          required: ['image_url', 'caption'],
        },
      },
      {
        name: 'get_instagram_insights',
        description: 'Get Instagram account insights and analytics',
        inputSchema: {
          type: 'object',
          properties: {
            metric: {
              type: 'string',
              description: 'Comma-separated metrics (default: impressions,reach,engagement)',
            },
            period: {
              type: 'string',
              description: 'Time period: day, week, days_28 (default: day)',
            },
          },
        },
      },
      {
        name: 'get_recent_media',
        description: 'Get recent media posts from Instagram account',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Maximum number of media items to retrieve (default: 10)',
            },
          },
        },
      },
    ],
  };
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Instagram MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
