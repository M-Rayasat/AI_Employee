---
name: record-payment
description: Record payments received for invoices in Odoo accounting system
version: 1.0.0
---

# Record Payment Skill

This skill records payments received from customers for invoices in the Odoo accounting system.

## Trigger

This skill is triggered when:
- Email notification about payment received
- Bank transaction detected (via finance watcher)
- Manual payment recording request
- WhatsApp message confirming payment

## Workflow

1. **Read Payment Info**: Extract invoice number, amount, payment date
2. **Validate Payment**: Check invoice exists, amount matches
3. **Record Payment**: Use Odoo MCP to record payment
4. **Update Invoice Status**: Mark invoice as paid
5. **Send Confirmation**: Create email/WhatsApp confirmation draft
6. **Log Action**: Record payment to Logs/
7. **Update Records**: Update invoice record in vault/

## Instructions for Claude

When this skill is invoked with a payment notification:

### Step 1: Read Payment Notification
```
Read notification from:
- vault/Needs_Action/EMAIL_*.md (payment confirmation email)
- vault/Needs_Action/WHATSAPP_*.md (WhatsApp payment notification)
- vault/Needs_Action/TRANSACTION_*.md (bank transaction)

Extract:
- Customer name or invoice number
- Payment amount
- Payment date
- Payment method (bank transfer, cash, etc.)
- Transaction reference (if available)
```

### Step 2: Identify Invoice

**If invoice number provided:**
- Use invoice number directly

**If only customer name provided:**
- Search for unpaid invoices for that customer
- If multiple unpaid invoices, match by amount
- If still ambiguous, request clarification

### Step 3: Validate Payment

**Check Invoice:**
- Invoice must exist in Odoo
- Invoice must be confirmed (not draft)
- Invoice must not be fully paid already

**Check Amount:**
- Payment amount should match invoice total (or be partial payment)
- If partial payment, note remaining balance
- If overpayment, flag for review

**Check Date:**
- Payment date should be valid (not future date)
- Default to today if not specified

### Step 4: Record Payment in Odoo

Use Odoo MCP server:
```
Tool: record_payment
Parameters:
  - invoice_id: {odoo_invoice_id}
  - amount: {payment_amount}
  - payment_date: {payment_date}
```

### Step 5: Generate Payment Confirmation

Create confirmation message:
```
Payment recorded successfully

Invoice: #{invoice_number}
Customer: {customer_name}
Amount Paid: ${payment_amount}
Payment Date: {payment_date}
Payment Method: {payment_method}

Invoice Status: {paid/partially_paid}
{if partial: Remaining Balance: ${remaining}}

Thank you for your payment!
```

### Step 6: Create Confirmation Email/Message Draft

**If payment notification came via email:**

Write to vault/Pending_Approval/EMAIL_REPLY_{customer}_{timestamp}.md:
```markdown
---
type: approval_request
action: send_email
to: {customer_email}
subject: Payment Received - Invoice #{invoice_number}
created: {timestamp}
status: pending
priority: medium
---

## Email Draft

Dear {customer_name},

Thank you! We have received your payment.

**Payment Details:**
- Invoice Number: #{invoice_number}
- Amount Received: ${payment_amount}
- Payment Date: {payment_date}
- Payment Method: {payment_method}

**Invoice Status:** {Paid in Full / Partially Paid}
{if partial: **Remaining Balance:** ${remaining}}

Your payment has been recorded in our system. If you need a receipt, please let me know.

Thank you for your business!

Best regards,
[Your Company]

---

## To Approve
Move this file to vault/Approved/ folder.
```

**If payment notification came via WhatsApp:**

Write to vault/Pending_Approval/WHATSAPP_REPLY_{customer}_{timestamp}.md:
```markdown
---
type: approval_request
action: send_whatsapp_message
contact_name: {customer_name}
created: {timestamp}
status: pending
priority: high
---

## Proposed Response

Thank you! Payment received for Invoice #{invoice_number} - ${payment_amount}. Your invoice is now {paid/partially paid}. 🙏

---

## To Approve
Move this file to vault/Approved/ folder.
```

### Step 7: Update Invoice Record

Update vault/Accounting/Invoices/{invoice_id}_{customer}_{date}.md:
```markdown
## Status

- Created: {original_timestamp}
- Confirmed: {confirmation_timestamp}
- Paid: {payment_timestamp} ✓

## Payment History

- {payment_date}: ${payment_amount} via {payment_method} (Ref: {reference})
{if partial: - Remaining: ${remaining}}
```

### Step 8: Log and Complete

Write to vault/Logs/{today}.log:
```
[{timestamp}] Payment recorded in Odoo
Invoice ID: {invoice_id}
Customer: {customer_name}
Amount: ${payment_amount}
Status: {paid/partial}
---
```

- Move original notification file from Needs_Action/ to Done/
- Update Dashboard.md: "Payment received: ${amount} from {customer}"

## Example Usage

### Example 1: Email Payment Notification
```
Email from: client@example.com
Subject: Payment Made

Hi,

I've transferred $1000 for Invoice #INV/2026/0001.
Transaction reference: TXN123456

Thanks!
```

**AI Action:**
1. Extract: Invoice #INV/2026/0001, Amount $1000
2. Validate invoice exists and matches amount
3. Record payment in Odoo
4. Draft confirmation email
5. Update invoice record
6. Log action

### Example 2: WhatsApp Payment Notification
```
WhatsApp from: Client ABC
Message: "Payment done for invoice. $500 transferred today."
```

**AI Action:**
1. Search for unpaid invoice for Client ABC
2. Match by amount ($500)
3. Record payment in Odoo
4. Draft WhatsApp confirmation
5. Update invoice record
6. Log action

### Example 3: Bank Transaction
```
File: vault/Needs_Action/TRANSACTION_20260329.md

Bank transfer received:
From: Oppo Tech
Amount: $2500
Date: 2026-03-29
Reference: Invoice payment
```

**AI Action:**
1. Search for unpaid invoice for Oppo Tech
2. Match by amount ($2500)
3. Record payment in Odoo
4. Update invoice record
5. Log action
6. No confirmation needed (bank transaction)

## Error Handling

**Invoice not found:**
- Search by customer name
- If still not found, request invoice number from user
- Don't record payment without valid invoice

**Amount mismatch:**
- If close match (within 5%), flag for review
- If significant difference, request clarification
- Allow partial payments

**Invoice already paid:**
- Check if duplicate notification
- Alert user about already paid status
- Don't record duplicate payment

**Odoo connection error:**
- Retry once
- If still fails, alert user
- Save payment info for manual entry

## Validation Rules

**Invoice ID:**
- Must exist in Odoo
- Must be in confirmed state (not draft)
- Must not be cancelled

**Payment Amount:**
- Must be positive number
- Can be less than invoice total (partial payment)
- If more than invoice total, flag for review

**Payment Date:**
- Format: YYYY-MM-DD
- Must not be future date
- Default: today

**Payment Method:**
- Bank transfer, cash, check, online, etc.
- Optional field

## Payment Scenarios

**Full Payment:**
- Amount = Invoice total
- Mark invoice as "Paid"
- Send confirmation

**Partial Payment:**
- Amount < Invoice total
- Mark invoice as "Partially Paid"
- Note remaining balance in confirmation

**Overpayment:**
- Amount > Invoice total
- Flag for manual review
- Don't auto-record (needs human decision)

**Multiple Invoices:**
- If customer has multiple unpaid invoices
- Match by amount first
- If ambiguous, request clarification

## Success Criteria

- Payment recorded in Odoo successfully
- Payment ID received
- Invoice status updated
- Invoice record updated in vault/
- Confirmation draft created (if applicable)
- Action logged
- Dashboard updated
- Original notification moved to Done/

## Notes

- Always verify invoice exists before recording payment
- Partial payments are allowed and tracked
- Overpayments require manual review
- Save transaction reference for audit trail
- Update invoice record immediately after payment
- Send confirmation to customer (after approval)
- Payment recording is immediate (no draft state in Odoo)
- Multiple payments can be recorded for same invoice (partial payments)

## Integration with Other Skills

**Triggered by:**
- process-email skill → detects payment notification → triggers this skill
- process-whatsapp-message skill → detects payment confirmation → triggers this skill
- finance watcher → detects bank transaction → triggers this skill

**Triggers:**
- This skill → creates confirmation draft → triggers send-email or send-whatsapp skill

**Related:**
- create-invoice skill: Creates invoices that receive payments
- financial-summary skill: Includes payment data in reports
- business-audit skill: Reviews payment metrics and cash flow
