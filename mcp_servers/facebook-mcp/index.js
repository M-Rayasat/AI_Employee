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
const PAGE_ID = process.env.FACEBOOK_PAGE_ID;
const GRAPH_API_VERSION = 'v18.0';
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

if (!PAGE_ACCESS_TOKEN || !PAGE_ID) {
  console.error('Error: FACEBOOK_PAGE_ACCESS_TOKEN and FACEBOOK_PAGE_ID must be set in .env');
  process.exit(1);
}

const server = new Server(
  {
    name: 'facebook-mcp',
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
    if (name === 'post_to_page') {
      const { message, link, image_url } = args;

      if (!message) {
        throw new Error('message is required');
      }

      const postData = {
        message,
        access_token: PAGE_ACCESS_TOKEN,
      };

      if (link) {
        postData.link = link;
      }

      if (image_url) {
        postData.url = image_url;
      }

      const endpoint = image_url
        ? `${GRAPH_API_BASE}/${PAGE_ID}/photos`
        : `${GRAPH_API_BASE}/${PAGE_ID}/feed`;

      const response = await axios.post(endpoint, postData);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              post_id: response.data.id,
              message: message,
              posted_at: new Date().toISOString(),
            }, null, 2),
          },
        ],
      };
    }

    if (name === 'reply_to_comment') {
      const { comment_id, message } = args;

      if (!comment_id || !message) {
        throw new Error('comment_id and message are required');
      }

      const response = await axios.post(
        `${GRAPH_API_BASE}/${comment_id}/comments`,
        {
          message,
          access_token: PAGE_ACCESS_TOKEN,
        }
      );

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              reply_id: response.data.id,
              comment_id: comment_id,
              message: message,
              replied_at: new Date().toISOString(),
            }, null, 2),
          },
        ],
      };
    }

    if (name === 'get_page_insights') {
      const { metric = 'page_impressions,page_engaged_users', period = 'day' } = args;

      const response = await axios.get(
        `${GRAPH_API_BASE}/${PAGE_ID}/insights`,
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
              page_id: PAGE_ID,
              period: period,
              insights: insights,
              retrieved_at: new Date().toISOString(),
            }, null, 2),
          },
        ],
      };
    }

    if (name === 'get_recent_posts') {
      const { limit = 10 } = args;

      const response = await axios.get(
        `${GRAPH_API_BASE}/${PAGE_ID}/posts`,
        {
          params: {
            fields: 'id,message,created_time,likes.summary(true),comments.summary(true),shares',
            limit,
            access_token: PAGE_ACCESS_TOKEN,
          },
        }
      );

      const posts = response.data.data.map(post => ({
        id: post.id,
        message: post.message || 'No message',
        created_time: post.created_time,
        likes: post.likes?.summary?.total_count || 0,
        comments: post.comments?.summary?.total_count || 0,
        shares: post.shares?.count || 0,
      }));

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              count: posts.length,
              posts: posts,
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
        name: 'post_to_page',
        description: 'Post a message to Facebook page',
        inputSchema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Message text to post',
            },
            link: {
              type: 'string',
              description: 'Optional URL to include in post',
            },
            image_url: {
              type: 'string',
              description: 'Optional image URL to post',
            },
          },
          required: ['message'],
        },
      },
      {
        name: 'reply_to_comment',
        description: 'Reply to a comment on a Facebook post',
        inputSchema: {
          type: 'object',
          properties: {
            comment_id: {
              type: 'string',
              description: 'ID of the comment to reply to',
            },
            message: {
              type: 'string',
              description: 'Reply message text',
            },
          },
          required: ['comment_id', 'message'],
        },
      },
      {
        name: 'get_page_insights',
        description: 'Get Facebook page insights and analytics',
        inputSchema: {
          type: 'object',
          properties: {
            metric: {
              type: 'string',
              description: 'Comma-separated metrics (default: page_impressions,page_engaged_users)',
            },
            period: {
              type: 'string',
              description: 'Time period: day, week, days_28 (default: day)',
            },
          },
        },
      },
      {
        name: 'get_recent_posts',
        description: 'Get recent posts from the Facebook page',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Maximum number of posts to retrieve (default: 10)',
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
  console.error('Facebook MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
