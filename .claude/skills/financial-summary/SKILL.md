---
name: financial-summary
description: Generate financial reports and summaries from Odoo accounting data
version: 1.0.0
---

# Financial Summary Skill

This skill generates comprehensive financial reports and summaries using data from Odoo accounting system.

## Trigger

This skill is triggered when:
- Scheduled weekly/monthly report generation
- Manual request for financial summary
- Business audit requires financial data
- End of period reporting

## Workflow

1. **Gather Data**: Pull financial data from Odoo (revenue, expenses, balance)
2. **Calculate Metrics**: Compute profit/loss, cash flow, growth rates
3. **Identify Trends**: Analyze patterns and anomalies
4. **Generate Report**: Create comprehensive financial summary
5. **Create Visualizations**: Format data for easy understanding
6. **Save Report**: Store report in vault/Accounting/Reports/
7. **Log Action**: Record report generation

## Instructions for Claude

When this skill is invoked:

### Step 1: Define Report Period

**Default Periods:**
- **Weekly**: Last 7 days
- **Monthly**: Current month (1st to today)
- **Quarterly**: Last 3 months
- **Yearly**: Current year (Jan 1 to today)
- **Custom**: User-specified date range

**Date Format:** YYYY-MM-DD

### Step 2: Gather Financial Data from Odoo

Use Odoo MCP server tools:

**Get Profit & Loss:**
```
Tool: get_profit_loss
Parameters:
  - start_date: {period_start}
  - end_date: {period_end}

Returns:
  - revenue: Total income
  - expenses: Total expenses
  - profit: Net profit/loss
```

**Get Balance Sheet:**
```
Tool: get_balance_sheet

Returns:
  - assets: Total assets
  - liabilities: Total liabilities
  - equity: Total equity
```

**Get Overdue Invoices:**
```
Tool: get_overdue_invoices

Returns:
  - count: Number of overdue invoices
  - overdue_invoices: List with details
```

### Step 3: Calculate Key Metrics

**Profitability Metrics:**
- **Net Profit Margin**: (Profit / Revenue) × 100
- **Gross Profit**: Revenue - Direct Costs
- **Operating Profit**: Gross Profit - Operating Expenses

**Cash Flow Metrics:**
- **Cash Inflow**: Total payments received
- **Cash Outflow**: Total expenses paid
- **Net Cash Flow**: Inflow - Outflow

**Growth Metrics:**
- **Revenue Growth**: Compare to previous period
- **Expense Growth**: Compare to previous period
- **Profit Growth**: Compare to previous period

**Health Indicators:**
- **Current Ratio**: Assets / Liabilities
- **Debt-to-Equity**: Liabilities / Equity
- **Days Sales Outstanding**: Average collection period

### Step 4: Analyze Trends

**Revenue Analysis:**
- Identify top revenue sources
- Compare to previous period
- Identify growth/decline patterns

**Expense Analysis:**
- Identify top expense categories
- Compare to budget (if available)
- Flag unusual expenses

**Cash Flow Analysis:**
- Identify cash flow patterns
- Flag potential cash flow issues
- Predict future cash needs

**Invoice Analysis:**
- Count overdue invoices
- Calculate total overdue amount
- Identify problematic customers

### Step 5: Generate Financial Report

Create comprehensive report:

```markdown
# Financial Summary Report
**Period:** {start_date} to {end_date}
**Generated:** {timestamp}

---

## Executive Summary

**Revenue:** ${revenue}
**Expenses:** ${expenses}
**Net Profit:** ${profit} ({profit_margin}%)

**Status:** {Profitable / Loss / Break-even}
**Trend:** {Growing / Declining / Stable}

---

## Income Statement

### Revenue
- Total Revenue: ${revenue}
- Average per day: ${avg_daily_revenue}
- Growth vs previous period: {+/- percentage}

**Top Revenue Sources:**
1. {source_1}: ${amount}
2. {source_2}: ${amount}
3. {source_3}: ${amount}

### Expenses
- Total Expenses: ${expenses}
- Average per day: ${avg_daily_expenses}
- Growth vs previous period: {+/- percentage}

**Expense Breakdown by Category:**
- Software/Subscriptions: ${software_expenses} ({percentage}%)
- Marketing: ${marketing_expenses} ({percentage}%)
- Travel: ${travel_expenses} ({percentage}%)
- Utilities: ${utilities_expenses} ({percentage}%)
- Other: ${other_expenses} ({percentage}%)

### Net Profit/Loss
- Net Profit: ${profit}
- Profit Margin: {profit_margin}%
- Growth vs previous period: {+/- percentage}

---

## Balance Sheet

**Assets:** ${assets}
**Liabilities:** ${liabilities}
**Equity:** ${equity}

**Financial Health:**
- Current Ratio: {current_ratio}
- Debt-to-Equity: {debt_to_equity}

---

## Cash Flow

**Cash Inflow:** ${cash_inflow}
**Cash Outflow:** ${cash_outflow}
**Net Cash Flow:** ${net_cash_flow}

**Status:** {Positive / Negative}

---

## Accounts Receivable

**Outstanding Invoices:** {count}
**Total Outstanding:** ${total_outstanding}

**Overdue Invoices:** {overdue_count}
**Total Overdue:** ${total_overdue}

**Overdue Details:**
{if overdue_invoices:}
| Customer | Invoice | Amount | Days Overdue |
|----------|---------|--------|--------------|
{overdue_list}

**Action Required:** {Follow up with customers / None}

---

## Key Insights

✅ **Positive Indicators:**
- {positive_insight_1}
- {positive_insight_2}

⚠️ **Areas of Concern:**
- {concern_1}
- {concern_2}

💡 **Recommendations:**
- {recommendation_1}
- {recommendation_2}

---

## Period Comparison

**This Period vs Previous Period:**
- Revenue: {current} vs {previous} ({+/- percentage})
- Expenses: {current} vs {previous} ({+/- percentage})
- Profit: {current} vs {previous} ({+/- percentage})

**Trend:** {Improving / Declining / Stable}

---

## Forecast

**Next Period Projection:**
- Expected Revenue: ${projected_revenue}
- Expected Expenses: ${projected_expenses}
- Expected Profit: ${projected_profit}

**Assumptions:** Based on current trends and historical data

---

## Action Items

1. {action_item_1}
2. {action_item_2}
3. {action_item_3}

---

**Report Generated by AI Employee**
**Data Source:** Odoo Accounting System
**Next Report:** {next_report_date}
```

### Step 6: Save Report

Write to vault/Accounting/Reports/Financial_Summary_{period}_{date}.md

Also create summary for Dashboard:
```
## Financial Snapshot ({period})

💰 Revenue: ${revenue}
💸 Expenses: ${expenses}
📈 Profit: ${profit} ({profit_margin}%)
⚠️ Overdue: {overdue_count} invoices (${overdue_amount})

Status: {Profitable/Loss} | Trend: {Growing/Declining}
```

### Step 7: Log and Complete

Write to vault/Logs/{today}.log:
```
[{timestamp}] Financial summary generated
Period: {start_date} to {end_date}
Revenue: ${revenue}
Expenses: ${expenses}
Profit: ${profit}
Status: Success
---
```

- Update Dashboard.md with financial snapshot
- If triggered by task file, move to Done/

## Report Types

### Weekly Report
- Period: Last 7 days
- Focus: Short-term cash flow, recent transactions
- Frequency: Every Monday

### Monthly Report
- Period: Current month
- Focus: Monthly performance, budget comparison
- Frequency: 1st of each month

### Quarterly Report
- Period: Last 3 months
- Focus: Trends, growth analysis, strategic insights
- Frequency: End of quarter

### Annual Report
- Period: Full year
- Focus: Yearly performance, tax preparation, strategic planning
- Frequency: End of year

### Custom Report
- Period: User-specified
- Focus: Specific analysis needs
- Frequency: On-demand

## Key Performance Indicators (KPIs)

**Revenue KPIs:**
- Total Revenue
- Average Revenue per Customer
- Revenue Growth Rate
- Revenue per Product/Service

**Expense KPIs:**
- Total Expenses
- Expense-to-Revenue Ratio
- Expense Growth Rate
- Cost per Category

**Profitability KPIs:**
- Net Profit
- Profit Margin
- Gross Profit Margin
- Operating Profit Margin

**Cash Flow KPIs:**
- Net Cash Flow
- Cash Flow Forecast
- Days Cash on Hand
- Burn Rate

**Receivables KPIs:**
- Days Sales Outstanding (DSO)
- Overdue Invoice Count
- Collection Rate
- Bad Debt Ratio

## Insights and Recommendations

**Positive Indicators:**
- Revenue growth > 10%
- Profit margin > 20%
- Positive cash flow
- Low overdue invoices

**Warning Signs:**
- Revenue decline > 5%
- Negative profit margin
- Negative cash flow
- High overdue invoices (> 30 days)

**Recommendations:**
- If cash flow negative: Reduce expenses, accelerate collections
- If profit margin low: Increase prices, reduce costs
- If overdue high: Follow up with customers, tighten credit terms
- If revenue declining: Increase marketing, improve services

## Error Handling

**Odoo connection error:**
- Retry once
- If still fails, alert user
- Generate partial report from cached data

**Missing data:**
- Note data gaps in report
- Use available data
- Flag incomplete sections

**Calculation errors:**
- Validate all calculations
- Flag suspicious numbers
- Request manual review

## Success Criteria

- Financial data retrieved from Odoo successfully
- All metrics calculated correctly
- Report generated and saved
- Dashboard updated with snapshot
- Action logged
- Insights and recommendations provided

## Notes

- All amounts in USD (or configured currency)
- Percentages rounded to 2 decimal places
- Comparisons require previous period data
- Forecasts are estimates based on trends
- Reports should be reviewed by human for accuracy
- Use reports for decision-making, not just record-keeping
- Archive old reports (keep last 12 months easily accessible)

## Integration with Other Skills

**Uses data from:**
- create-invoice skill: Revenue data
- record-payment skill: Cash inflow data
- log-expense skill: Expense data

**Triggered by:**
- business-audit skill: Requires financial summary
- Scheduler: Weekly/monthly automatic generation

**Triggers:**
- May create action items for follow-up
- May trigger alerts for concerning metrics

## Automation

**Scheduled Reports:**
- Weekly: Every Monday 9 AM
- Monthly: 1st of month 9 AM
- Quarterly: End of quarter
- Annual: January 1st

**Auto-alerts:**
- Negative cash flow
- Profit margin < 10%
- Overdue invoices > $5000
- Revenue decline > 10%
