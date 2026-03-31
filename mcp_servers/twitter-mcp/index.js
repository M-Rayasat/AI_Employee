#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { TwitterApi } from 'twitter-api-v2';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

const TWITTER_API_KEY = process.env.TWITTER_API_KEY;
const TWITTER_API_SECRET = process.env.TWITTER_API_SECRET;
const TWITTER_ACCESS_TOKEN = process.env.TWITTER_ACCESS_TOKEN;
const TWITTER_ACCESS_TOKEN_SECRET = process.env.TWITTER_ACCESS_TOKEN_SECRET;

// Initialize Twitter client
const twitterClient = new TwitterApi({
  appKey: TWITTER_API_KEY,
  appSecret: TWITTER_API_SECRET,
  accessToken: TWITTER_ACCESS_TOKEN,
  accessSecret: TWITTER_ACCESS_TOKEN_SECRET,
});

const rwClient = twitterClient.readWrite;

const server = new Server(
  {
    name: 'twitter-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool: Post Tweet
server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === 'post_tweet') {
      const { text, reply_to_id } = args;

      if (!text) {
        throw new Error('Tweet text is required');
      }

      // Check character limit
      if (text.length > 280) {
        throw new Error(`Tweet exceeds 280 characters (${text.length} chars)`);
      }

      const tweetOptions = { text };
      if (reply_to_id) {
        tweetOptions.reply = { in_reply_to_tweet_id: reply_to_id };
      }

      const tweet = await rwClient.v2.tweet(tweetOptions);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              tweet_id: tweet.data.id,
              text: tweet.data.text,
              url: `https://twitter.com/user/status/${tweet.data.id}`,
            }, null, 2),
          },
        ],
      };
    }

    if (name === 'get_mentions') {
      const { max_results = 10 } = args;

      const mentions = await rwClient.v2.mentionTimeline({
        max_results: Math.min(max_results, 100),
        'tweet.fields': ['created_at', 'author_id', 'conversation_id'],
      });

      const tweets = mentions.data.data || [];

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              count: tweets.length,
              mentions: tweets.map(t => ({
                id: t.id,
                text: t.text,
                author_id: t.author_id,
                created_at: t.created_at,
              })),
            }, null, 2),
          },
        ],
      };
    }

    if (name === 'reply_to_tweet') {
      const { tweet_id, text } = args;

      if (!tweet_id || !text) {
        throw new Error('tweet_id and text are required');
      }

      if (text.length > 280) {
        throw new Error(`Reply exceeds 280 characters (${text.length} chars)`);
      }

      const reply = await rwClient.v2.tweet({
        text,
        reply: { in_reply_to_tweet_id: tweet_id },
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              tweet_id: reply.data.id,
              text: reply.data.text,
            }, null, 2),
          },
        ],
      };
    }

    if (name === 'get_timeline') {
      const { max_results = 10 } = args;

      const timeline = await rwClient.v2.homeTimeline({
        max_results: Math.min(max_results, 100),
        'tweet.fields': ['created_at', 'author_id'],
      });

      const tweets = timeline.data.data || [];

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              count: tweets.length,
              tweets: tweets.map(t => ({
                id: t.id,
                text: t.text,
                author_id: t.author_id,
                created_at: t.created_at,
              })),
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

// List available tools
server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      {
        name: 'post_tweet',
        description: 'Post a tweet to Twitter/X (max 280 characters)',
        inputSchema: {
          type: 'object',
          properties: {
            text: {
              type: 'string',
              description: 'Tweet text (max 280 characters)',
            },
            reply_to_id: {
              type: 'string',
              description: 'Optional: Tweet ID to reply to',
            },
          },
          required: ['text'],
        },
      },
      {
        name: 'reply_to_tweet',
        description: 'Reply to a specific tweet',
        inputSchema: {
          type: 'object',
          properties: {
            tweet_id: {
              type: 'string',
              description: 'ID of the tweet to reply to',
            },
            text: {
              type: 'string',
              description: 'Reply text (max 280 characters)',
            },
          },
          required: ['tweet_id', 'text'],
        },
      },
      {
        name: 'get_mentions',
        description: 'Get recent mentions of your account',
        inputSchema: {
          type: 'object',
          properties: {
            max_results: {
              type: 'number',
              description: 'Maximum number of mentions to retrieve (default: 10, max: 100)',
            },
          },
        },
      },
      {
        name: 'get_timeline',
        description: 'Get your home timeline tweets',
        inputSchema: {
          type: 'object',
          properties: {
            max_results: {
              type: 'number',
              description: 'Maximum number of tweets to retrieve (default: 10, max: 100)',
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
  console.error('Twitter MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
