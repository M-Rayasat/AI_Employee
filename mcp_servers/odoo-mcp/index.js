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

const ODOO_URL = process.env.ODOO_URL || 'http://localhost:8069';
const ODOO_DB = process.env.ODOO_DB || 'ai_employee_accounting';
const ODOO_USERNAME = process.env.ODOO_USERNAME;
const ODOO_PASSWORD = process.env.ODOO_PASSWORD;

if (!ODOO_USERNAME || !ODOO_PASSWORD) {
  console.error('Error: ODOO_USERNAME and ODOO_PASSWORD must be set in .env');
  process.exit(1);
}

let uid = null;

// Authenticate with Odoo
async function authenticate() {
  if (uid) return uid;

  try {
    const response = await axios.post(`${ODOO_URL}/web/session/authenticate`, {
      jsonrpc: '2.0',
      params: {
        db: ODOO_DB,
        login: ODOO_USERNAME,
        password: ODOO_PASSWORD,
      },
    });

    if (response.data.result && response.data.result.uid) {
      uid = response.data.result.uid;
      console.error('Authenticated with Odoo successfully');
      return uid;
    } else {
      throw new Error('Authentication failed');
    }
  } catch (error) {
    throw new Error(`Odoo authentication error: ${error.message}`);
  }
}

// Execute Odoo RPC call
async function odooCall(model, method, args = [], kwargs = {}) {
  await authenticate();

  const response = await axios.post(`${ODOO_URL}/web/dataset/call_kw`, {
    jsonrpc: '2.0',
    params: {
      model,
      method,
      args,
      kwargs,
    },
  });

  if (response.data.error) {
    throw new Error(response.data.error.data.message || 'Odoo RPC error');
  }

  return response.data.result;
}

const server = new Server(
  {
    name: 'odoo-mcp',
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
    if (name === 'create_invoice') {
      const { partner_name, invoice_lines, due_date } = args;

      if (!partner_name || !invoice_lines || invoice_lines.length === 0) {
        throw new Error('partner_name and invoice_lines are required');
      }

      // Search for partner (customer)
      const partners = await odooCall('res.partner', 'search_read', [
        [['name', 'ilike', partner_name]],
        ['id', 'name'],
      ]);

      if (partners.length === 0) {
        throw new Error(`Customer '${partner_name}' not found. Please create customer in Odoo first.`);
      }

      const partnerId = partners[0].id;

      // Prepare invoice lines
      const lines = invoice_lines.map(line => [0, 0, {
        name: line.description,
        quantity: line.quantity || 1,
        price_unit: line.price,
      }]);

      // Create invoice
      const invoiceData = {
        partner_id: partnerId,
        move_type: 'out_invoice',
        invoice_line_ids: lines,
      };

      if (due_date) {
        invoiceData.invoice_date_due = due_date;
      }

      const invoiceId = await odooCall('account.move', 'create', [invoiceData]);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              invoice_id: invoiceId,
              partner_name: partners[0].name,
              created_at: new Date().toISOString(),
            }, null, 2),
          },
        ],
      };
    }

    if (name === 'record_payment') {
      const { invoice_id, amount, payment_date } = args;

      if (!invoice_id || !amount) {
        throw new Error('invoice_id and amount are required');
      }

      // Register payment
      const paymentData = {
        amount,
        payment_type: 'inbound',
        partner_type: 'customer',
        date: payment_date || new Date().toISOString().split('T')[0],
      };

      const paymentId = await odooCall('account.payment', 'create', [paymentData]);

      // Link payment to invoice
      await odooCall('account.payment', 'action_post', [[paymentId]]);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              payment_id: paymentId,
              invoice_id,
              amount,
              recorded_at: new Date().toISOString(),
            }, null, 2),
          },
        ],
      };
    }

    if (name === 'create_expense') {
      const { description, amount, category, expense_date } = args;

      if (!description || !amount) {
        throw new Error('description and amount are required');
      }

      // Create expense (as vendor bill)
      const expenseData = {
        move_type: 'in_invoice',
        invoice_date: expense_date || new Date().toISOString().split('T')[0],
        invoice_line_ids: [[0, 0, {
          name: description,
          quantity: 1,
          price_unit: amount,
        }]],
      };

      const expenseId = await odooCall('account.move', 'create', [expenseData]);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              expense_id: expenseId,
              description,
              amount,
              created_at: new Date().toISOString(),
            }, null, 2),
          },
        ],
      };
    }

    if (name === 'get_balance_sheet') {
      // Get account balances
      const accounts = await odooCall('account.account', 'search_read', [
        [],
        ['code', 'name', 'current_balance'],
      ]);

      const assets = accounts.filter(a => a.code.startsWith('1'));
      const liabilities = accounts.filter(a => a.code.startsWith('2'));
      const equity = accounts.filter(a => a.code.startsWith('3'));

      const totalAssets = assets.reduce((sum, a) => sum + a.current_balance, 0);
      const totalLiabilities = liabilities.reduce((sum, a) => sum + a.current_balance, 0);
      const totalEquity = equity.reduce((sum, a) => sum + a.current_balance, 0);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              balance_sheet: {
                assets: totalAssets,
                liabilities: totalLiabilities,
                equity: totalEquity,
              },
              retrieved_at: new Date().toISOString(),
            }, null, 2),
          },
        ],
      };
    }

    if (name === 'get_profit_loss') {
      const { start_date, end_date } = args;

      // Get income and expense accounts
      const domain = [];
      if (start_date) domain.push(['date', '>=', start_date]);
      if (end_date) domain.push(['date', '<=', end_date]);

      const moves = await odooCall('account.move.line', 'search_read', [
        domain,
        ['account_id', 'debit', 'credit'],
      ]);

      let revenue = 0;
      let expenses = 0;

      for (const move of moves) {
        // Revenue accounts (4xxxx)
        if (move.account_id[1].startsWith('4')) {
          revenue += move.credit - move.debit;
        }
        // Expense accounts (6xxxx)
        if (move.account_id[1].startsWith('6')) {
          expenses += move.debit - move.credit;
        }
      }

      const profit = revenue - expenses;

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              profit_loss: {
                revenue,
                expenses,
                profit,
              },
              period: {
                start_date: start_date || 'beginning',
                end_date: end_date || 'today',
              },
              retrieved_at: new Date().toISOString(),
            }, null, 2),
          },
        ],
      };
    }

    if (name === 'get_overdue_invoices') {
      const today = new Date().toISOString().split('T')[0];

      const invoices = await odooCall('account.move', 'search_read', [
        [
          ['move_type', '=', 'out_invoice'],
          ['state', '=', 'posted'],
          ['payment_state', '!=', 'paid'],
          ['invoice_date_due', '<', today],
        ],
        ['name', 'partner_id', 'amount_total', 'invoice_date_due'],
      ]);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              count: invoices.length,
              overdue_invoices: invoices.map(inv => ({
                invoice_number: inv.name,
                customer: inv.partner_id[1],
                amount: inv.amount_total,
                due_date: inv.invoice_date_due,
              })),
              retrieved_at: new Date().toISOString(),
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
        name: 'create_invoice',
        description: 'Create a customer invoice in Odoo',
        inputSchema: {
          type: 'object',
          properties: {
            partner_name: {
              type: 'string',
              description: 'Customer name (must exist in Odoo)',
            },
            invoice_lines: {
              type: 'array',
              description: 'Array of invoice line items',
              items: {
                type: 'object',
                properties: {
                  description: { type: 'string' },
                  quantity: { type: 'number' },
                  price: { type: 'number' },
                },
              },
            },
            due_date: {
              type: 'string',
              description: 'Due date (YYYY-MM-DD format)',
            },
          },
          required: ['partner_name', 'invoice_lines'],
        },
      },
      {
        name: 'record_payment',
        description: 'Record a payment received for an invoice',
        inputSchema: {
          type: 'object',
          properties: {
            invoice_id: {
              type: 'number',
              description: 'Invoice ID',
            },
            amount: {
              type: 'number',
              description: 'Payment amount',
            },
            payment_date: {
              type: 'string',
              description: 'Payment date (YYYY-MM-DD format)',
            },
          },
          required: ['invoice_id', 'amount'],
        },
      },
      {
        name: 'create_expense',
        description: 'Log a business expense',
        inputSchema: {
          type: 'object',
          properties: {
            description: {
              type: 'string',
              description: 'Expense description',
            },
            amount: {
              type: 'number',
              description: 'Expense amount',
            },
            category: {
              type: 'string',
              description: 'Expense category',
            },
            expense_date: {
              type: 'string',
              description: 'Expense date (YYYY-MM-DD format)',
            },
          },
          required: ['description', 'amount'],
        },
      },
      {
        name: 'get_balance_sheet',
        description: 'Get current balance sheet summary',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_profit_loss',
        description: 'Get profit and loss statement',
        inputSchema: {
          type: 'object',
          properties: {
            start_date: {
              type: 'string',
              description: 'Start date (YYYY-MM-DD format)',
            },
            end_date: {
              type: 'string',
              description: 'End date (YYYY-MM-DD format)',
            },
          },
        },
      },
      {
        name: 'get_overdue_invoices',
        description: 'Get list of overdue invoices',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Odoo MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
