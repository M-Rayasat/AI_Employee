---
name: create-invoice
description: Create customer invoice in Odoo from email requests or manual triggers
version: 1.0.0
---

# Create Invoice Skill

This skill creates customer invoices in Odoo accounting system based on email requests or manual triggers.

## Trigger

This skill is triggered when:
- Email contains invoice request (detected by email watcher)
- Manual task file in Needs_Action/ requesting invoice creation
- Approval for invoice creation is given

## Workflow

1. **Read Request**: Extract customer name, items, amounts from request
2. **Validate Data**: Check customer exists, amounts are valid
3. **Create Invoice**: Use Odoo MCP to create invoice
4. **Generate Summary**: Create invoice summary for email/notification
5. **Log Action**: Record invoice creation to Logs/
6. **Update Records**: Save invoice details to vault/Accounting/Invoices/

## Instructions for Claude

When this skill is invoked with an invoice request:

### Step 1: Read Invoice Request
```
Read request from:
- vault/Needs_Action/EMAIL_*.md (if from email)
- vault/Needs_Action/INVOICE_REQUEST_*.md (if manual)

Extract:
- Customer name
- Invoice items (description, quantity, price)
- Due date (if specified)
- Special notes
```

### Step 2: Validate Data

**Check Customer:**
- Customer name must be provided
- Customer should exist in Odoo (or create approval request to add)

**Check Invoice Items:**
- At least one item required
- Each item needs: description, price
- Quantity defaults to 1 if not specified
- Prices must be positive numbers

**Check Due Date:**
- If not specified, use default (30 days from today)
- Format: YYYY-MM-DD

### Step 3: Create Invoice in Odoo

Use Odoo MCP server:
```
Tool: create_invoice
Parameters:
  - partner_name: {customer_name}
  - invoice_lines: [
      {
        description: {item_description},
        quantity: {quantity},
        price: {unit_price}
      },
      ...
    ]
  - due_date: {due_date}
```

### Step 4: Generate Invoice Summary

Create human-readable summary:
```
Invoice #{invoice_id} created successfully

Customer: {customer_name}
Date: {today}
Due Date: {due_date}

Items:
- {item_1_description} x {qty} @ ${price} = ${total}
- {item_2_description} x {qty} @ ${price} = ${total}

Subtotal: ${subtotal}
Tax: ${tax}
Total: ${total}

Status: Draft (needs confirmation in Odoo)
```

### Step 5: Create Email Draft (if from email request)

If invoice was requested via email, create email reply draft:

Write to vault/Pending_Approval/EMAIL_REPLY_{customer}_{timestamp}.md:
```markdown
---
type: approval_request
action: send_email
to: {customer_email}
subject: Invoice #{invoice_id} - {customer_name}
created: {timestamp}
status: pending
priority: high
---

## Email Draft

Dear {customer_name},

Thank you for your business! Please find your invoice details below:

**Invoice Number:** #{invoice_id}
**Date:** {today}
**Due Date:** {due_date}

**Items:**
{invoice_items_formatted}

**Total Amount:** ${total}

You can view and download your invoice from our Odoo portal at:
http://localhost:8069

Payment can be made via [payment methods].

Please let me know if you have any questions.

Best regards,
[Your Company]

---

## To Approve
Move this file to vault/Approved/ folder.

## To Reject
Move this file to vault/Rejected/ folder.
```

### Step 6: Save Invoice Record

Write to vault/Accounting/Invoices/{invoice_id}_{customer}_{date}.md:
```markdown
---
invoice_id: {odoo_invoice_id}
customer: {customer_name}
date: {invoice_date}
due_date: {due_date}
total: {total_amount}
status: draft
created_at: {timestamp}
---

## Invoice Details

**Invoice Number:** #{invoice_id}
**Customer:** {customer_name}
**Date:** {invoice_date}
**Due Date:** {due_date}

## Items

| Description | Quantity | Unit Price | Total |
|-------------|----------|------------|-------|
{invoice_items_table}

**Subtotal:** ${subtotal}
**Tax:** ${tax}
**Total:** ${total}

## Status

- Created: {timestamp}
- Confirmed: Pending
- Paid: Pending

## Odoo Link

http://localhost:8069/web#id={invoice_id}&model=account.move

## Notes

{any_special_notes}
```

### Step 7: Log and Complete

Write to vault/Logs/{today}.log:
```
[{timestamp}] Invoice created in Odoo
Invoice ID: {invoice_id}
Customer: {customer_name}
Total: ${total}
Status: Success
---
```

- Move original request file from Needs_Action/ to Done/
- Update Dashboard.md: "Invoice #{invoice_id} created for {customer_name}"

## Example Usage

### Example 1: Email Request
```
Email from: client@example.com
Subject: Invoice Request

Hi, please send me an invoice for the web development work:
- Homepage design: $500
- Contact form: $200
- SEO optimization: $300

Total: $1000
Due in 30 days.

Thanks!
```

**AI Action:**
1. Extract: Customer = "Client ABC", Items = 3, Total = $1000
2. Create invoice in Odoo
3. Draft email reply with invoice details
4. Save invoice record
5. Log action

### Example 2: Manual Request
```
File: vault/Needs_Action/INVOICE_REQUEST_20260329.md

Create invoice for Oppo Tech:
- Mobile app development: $2000
- Testing and deployment: $500
Due: 2026-04-30
```

**AI Action:**
1. Parse request
2. Create invoice in Odoo
3. Save invoice record
4. Log action
5. No email needed (manual request)

## Error Handling

**Customer not found:**
- Create approval request to add customer to Odoo first
- Provide customer details needed
- Pause invoice creation until customer added

**Invalid amount:**
- Alert user about invalid amount
- Request clarification
- Don't create invoice

**Odoo connection error:**
- Retry once
- If still fails, alert user
- Log error details

**Missing required data:**
- Request missing information from user
- Don't create incomplete invoice

## Validation Rules

**Customer Name:**
- Must not be empty
- Should match existing Odoo customer (case-insensitive)

**Invoice Items:**
- Minimum 1 item required
- Description: Not empty, max 500 chars
- Quantity: Positive number, default 1
- Price: Positive number, max 2 decimal places

**Due Date:**
- Format: YYYY-MM-DD
- Must be future date
- Default: 30 days from today

**Total Amount:**
- Must be positive
- Calculated automatically from items

## Success Criteria

- Invoice created in Odoo successfully
- Invoice ID received
- Invoice record saved to vault/Accounting/Invoices/
- Email draft created (if from email request)
- Action logged
- Dashboard updated
- Original request moved to Done/

## Notes

- Invoices are created in "Draft" status in Odoo
- User must confirm invoice in Odoo UI before sending to customer
- Invoice can be edited in Odoo before confirmation
- Once confirmed, invoice number is finalized
- Payment tracking happens separately (record-payment skill)
- Always save invoice ID for future reference
- Include Odoo link in all invoice records for easy access

## Integration with Other Skills

**Triggers:**
- process-email skill → detects invoice request → triggers this skill

**Triggered by this:**
- This skill → creates email draft → triggers send-email skill (after approval)

**Related:**
- record-payment skill: Records payments for invoices
- financial-summary skill: Includes invoice data in reports
- business-audit skill: Reviews invoice metrics
