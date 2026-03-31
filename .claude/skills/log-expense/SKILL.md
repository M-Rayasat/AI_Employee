---
name: log-expense
description: Log business expenses in Odoo accounting system
version: 1.0.0
---

# Log Expense Skill

This skill logs business expenses in the Odoo accounting system for tracking and financial reporting.

## Trigger

This skill is triggered when:
- Email receipt received
- Manual expense logging request
- Bank transaction detected (expense category)
- End of day expense review

## Workflow

1. **Read Expense Info**: Extract description, amount, category, date
2. **Validate Expense**: Check amount is valid, category exists
3. **Log Expense**: Use Odoo MCP to create expense record
4. **Categorize**: Assign to appropriate expense category
5. **Log Action**: Record expense to Logs/
6. **Update Records**: Save expense details to vault/Accounting/Expenses/

## Instructions for Claude

When this skill is invoked with an expense:

### Step 1: Read Expense Information
```
Read expense from:
- vault/Needs_Action/EXPENSE_*.md (manual entry)
- vault/Needs_Action/EMAIL_*.md (receipt via email)
- vault/Needs_Action/TRANSACTION_*.md (bank transaction)

Extract:
- Description (what was purchased)
- Amount
- Category (office supplies, software, travel, etc.)
- Date (when expense occurred)
- Vendor/supplier (optional)
- Receipt/reference (optional)
```

### Step 2: Categorize Expense

**Common Categories:**
- **Office Supplies**: Stationery, equipment, furniture
- **Software/Subscriptions**: SaaS, licenses, tools
- **Marketing**: Ads, promotions, social media
- **Travel**: Transportation, accommodation, meals
- **Utilities**: Internet, electricity, phone
- **Professional Services**: Consulting, legal, accounting
- **Rent**: Office space, coworking
- **Salaries**: Employee payments, contractor fees
- **Miscellaneous**: Other business expenses

**Auto-categorization keywords:**
- "domain", "hosting", "server" → Software/Subscriptions
- "facebook ads", "google ads" → Marketing
- "flight", "hotel", "taxi" → Travel
- "internet", "electricity" → Utilities
- "office chair", "desk" → Office Supplies

### Step 3: Validate Expense

**Check Amount:**
- Must be positive number
- Reasonable amount (flag if > $10,000 for review)
- Format: 2 decimal places

**Check Description:**
- Not empty
- Clear and descriptive
- Max 500 characters

**Check Date:**
- Format: YYYY-MM-DD
- Not future date
- Default: today if not specified

**Check Category:**
- Valid category from list
- Default: Miscellaneous if unclear

### Step 4: Log Expense in Odoo

Use Odoo MCP server:
```
Tool: create_expense
Parameters:
  - description: {expense_description}
  - amount: {expense_amount}
  - category: {expense_category}
  - expense_date: {expense_date}
```

### Step 5: Generate Expense Summary

Create summary:
```
Expense logged successfully

Description: {description}
Amount: ${amount}
Category: {category}
Date: {expense_date}
Vendor: {vendor_if_available}

Expense ID: {odoo_expense_id}
Status: Recorded
```

### Step 6: Save Expense Record

Write to vault/Accounting/Expenses/{date}_{category}_{amount}.md:
```markdown
---
expense_id: {odoo_expense_id}
description: {description}
amount: {amount}
category: {category}
date: {expense_date}
vendor: {vendor}
created_at: {timestamp}
---

## Expense Details

**Description:** {description}
**Amount:** ${amount}
**Category:** {category}
**Date:** {expense_date}
**Vendor:** {vendor}

## Receipt/Reference

{receipt_info_or_reference}

## Odoo Link

http://localhost:8069/web#id={expense_id}&model=account.move

## Notes

{any_additional_notes}
```

### Step 7: Log and Complete

Write to vault/Logs/{today}.log:
```
[{timestamp}] Expense logged in Odoo
Expense ID: {expense_id}
Description: {description}
Amount: ${amount}
Category: {category}
Status: Success
---
```

- Move original request file from Needs_Action/ to Done/
- Update Dashboard.md: "Expense logged: ${amount} - {category}"

## Example Usage

### Example 1: Manual Expense Entry
```
File: vault/Needs_Action/EXPENSE_20260329.md

Log expense:
- Description: Adobe Creative Cloud subscription
- Amount: $54.99
- Category: Software
- Date: 2026-03-29
```

**AI Action:**
1. Parse expense details
2. Categorize as Software/Subscriptions
3. Log in Odoo
4. Save expense record
5. Log action

### Example 2: Email Receipt
```
Email from: receipts@aws.amazon.com
Subject: Your AWS Invoice

AWS Services
Amount: $127.50
Date: March 29, 2026
```

**AI Action:**
1. Extract: AWS Services, $127.50
2. Auto-categorize as Software/Subscriptions
3. Log in Odoo
4. Save expense record
5. Log action

### Example 3: Bank Transaction
```
File: vault/Needs_Action/TRANSACTION_20260329.md

Debit transaction:
To: Starbucks
Amount: $15.00
Date: 2026-03-29
```

**AI Action:**
1. Categorize as Travel/Meals (or Miscellaneous)
2. Description: "Coffee meeting at Starbucks"
3. Log in Odoo
4. Save expense record
5. Log action

## Error Handling

**Invalid amount:**
- Alert user about invalid amount
- Request correction
- Don't log expense

**Missing description:**
- Request description from user
- Don't log without description

**Odoo connection error:**
- Retry once
- If still fails, alert user
- Save expense info for manual entry

**Large expense (> $10,000):**
- Flag for manual review
- Create approval request
- Don't auto-log without approval

## Validation Rules

**Description:**
- Required field
- Min 5 characters
- Max 500 characters
- Should be clear and specific

**Amount:**
- Required field
- Positive number
- Max 2 decimal places
- Flag if > $10,000

**Category:**
- Must be valid category
- Default: Miscellaneous
- Can be auto-detected from description

**Date:**
- Format: YYYY-MM-DD
- Must not be future date
- Default: today

**Vendor:**
- Optional field
- Helpful for tracking

## Expense Categories

**Office Supplies** (6100):
- Stationery, pens, paper
- Office equipment
- Furniture

**Software/Subscriptions** (6200):
- SaaS subscriptions
- Software licenses
- Cloud services
- Domain/hosting

**Marketing** (6300):
- Advertising (Google, Facebook)
- Promotional materials
- Social media campaigns

**Travel** (6400):
- Transportation
- Accommodation
- Meals during travel

**Utilities** (6500):
- Internet
- Electricity
- Phone/mobile

**Professional Services** (6600):
- Consulting fees
- Legal services
- Accounting services

**Rent** (6700):
- Office rent
- Coworking space

**Salaries** (6800):
- Employee salaries
- Contractor payments

**Miscellaneous** (6900):
- Other business expenses

## Monthly Expense Tracking

At end of month, generate summary:
```
Monthly Expense Report - {Month} {Year}

Total Expenses: ${total}

By Category:
- Software: ${software_total}
- Marketing: ${marketing_total}
- Travel: ${travel_total}
- Utilities: ${utilities_total}
- Other: ${other_total}

Top 5 Expenses:
1. {description} - ${amount}
2. {description} - ${amount}
...

Compared to last month: {+/- percentage}
```

## Success Criteria

- Expense logged in Odoo successfully
- Expense ID received
- Expense record saved to vault/Accounting/Expenses/
- Action logged
- Dashboard updated
- Original request moved to Done/

## Notes

- All business expenses should be logged for accurate financial tracking
- Keep receipts/references for audit purposes
- Categorize consistently for better reporting
- Review expenses monthly for budget tracking
- Large expenses (> $10,000) require approval
- Personal expenses should NOT be logged
- Expense date is when expense occurred, not when logged
- Expenses are recorded as vendor bills in Odoo

## Integration with Other Skills

**Triggered by:**
- process-email skill → detects receipt email → triggers this skill
- finance watcher → detects expense transaction → triggers this skill

**Related:**
- financial-summary skill: Includes expense data in reports
- business-audit skill: Reviews expense patterns and budget
- create-invoice skill: Revenue side of accounting

## Tax Considerations

**Deductible Expenses:**
- Most business expenses are tax-deductible
- Keep proper documentation
- Categorize correctly for tax reporting

**Non-Deductible:**
- Personal expenses
- Entertainment (limited deductibility)
- Fines and penalties

**Consult accountant for:**
- Large capital expenses
- Vehicle expenses
- Home office deductions
- International expenses
