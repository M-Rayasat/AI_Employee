# Odoo Community Setup Guide

This guide walks you through installing and configuring Odoo Community Edition for the AI Employee accounting integration.

## Prerequisites

- Windows 10/11 or Linux
- Python 3.8+ (for Odoo)
- PostgreSQL 12+ (database)
- Node.js 18+ (for MCP server)
- At least 4GB RAM
- 10GB free disk space

## Installation Methods

### Method 1: Docker (Recommended - Easiest)

**Step 1: Install Docker Desktop**
- Download from https://www.docker.com/products/docker-desktop
- Install and start Docker Desktop

**Step 2: Run Odoo Container**
```bash
# Create a network
docker network create odoo-network

# Run PostgreSQL
docker run -d \
  --name odoo-db \
  --network odoo-network \
  -e POSTGRES_USER=odoo \
  -e POSTGRES_PASSWORD=odoo \
  -e POSTGRES_DB=postgres \
  -v odoo-db-data:/var/lib/postgresql/data \
  postgres:13

# Run Odoo
docker run -d \
  --name odoo \
  --network odoo-network \
  -p 8069:8069 \
  -e HOST=odoo-db \
  -e USER=odoo \
  -e PASSWORD=odoo \
  -v odoo-data:/var/lib/odoo \
  odoo:17
```

**Step 3: Access Odoo**
- Open browser: http://localhost:8069
- Create database: `ai_employee_accounting`
- Set master password (save it!)
- Email: admin@example.com
- Password: admin (change later)

### Method 2: Windows Installation

**Step 1: Install PostgreSQL**
- Download from https://www.postgresql.org/download/windows/
- Install with default settings
- Remember the postgres password

**Step 2: Download Odoo**
- Go to https://www.odoo.com/page/download
- Download Odoo Community Edition for Windows
- Run the installer

**Step 3: Configure Odoo**
- During installation, provide PostgreSQL password
- Choose installation directory
- Complete installation

**Step 4: Start Odoo**
- Odoo should start automatically
- Access: http://localhost:8069

### Method 3: Linux Installation (Ubuntu/Debian)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install PostgreSQL
sudo apt install postgresql -y

# Create Odoo user
sudo useradd -m -d /opt/odoo -U -r -s /bin/bash odoo

# Install dependencies
sudo apt install python3-pip python3-dev libxml2-dev libxslt1-dev \
  libldap2-dev libsasl2-dev libtiff5-dev libjpeg8-dev libopenjp2-7-dev \
  zlib1g-dev libfreetype6-dev liblcms2-dev libwebp-dev libharfbuzz-dev \
  libfribidi-dev libxcb1-dev libpq-dev -y

# Install wkhtmltopdf
wget https://github.com/wkhtmltopdf/packaging/releases/download/0.12.6-1/wkhtmltox_0.12.6-1.bionic_amd64.deb
sudo dpkg -i wkhtmltox_0.12.6-1.bionic_amd64.deb
sudo apt install -f -y

# Clone Odoo
sudo su - odoo
git clone https://www.github.com/odoo/odoo --depth 1 --branch 17.0 /opt/odoo/odoo17
cd /opt/odoo/odoo17

# Install Python dependencies
pip3 install -r requirements.txt

# Create PostgreSQL user
sudo -u postgres createuser -s odoo

# Start Odoo
python3 odoo-bin -d ai_employee_accounting -i base --db_host=localhost --db_user=odoo --db_password=odoo
```

## Initial Configuration

### Step 1: Create Database

1. Open http://localhost:8069
2. Click "Create Database"
3. Fill in:
   - **Master Password**: Choose a strong password (save it!)
   - **Database Name**: `ai_employee_accounting`
   - **Email**: admin@example.com
   - **Password**: admin (change later)
   - **Language**: English
   - **Country**: Pakistan (or your country)
   - **Demo Data**: Uncheck (we want clean data)
4. Click "Create Database"

### Step 2: Install Accounting Module

1. After database creation, you'll see the Apps menu
2. Search for "Accounting"
3. Click "Install" on "Accounting" module
4. Wait for installation (2-3 minutes)

### Step 3: Configure Company

1. Go to **Settings** (gear icon)
2. Click **General Settings**
3. Under **Companies**, click "Update Info"
4. Fill in:
   - **Company Name**: Your business name
   - **Address**: Your business address
   - **Phone**: Your phone number
   - **Email**: Your business email
   - **Website**: Your website (optional)
5. Click "Save"

### Step 4: Configure Chart of Accounts

1. Go to **Accounting** → **Configuration** → **Chart of Accounts**
2. Odoo will suggest a chart based on your country
3. Click "Configure" and select appropriate chart
4. For Pakistan: Select "Pakistan - Chart of Accounts"
5. Click "Apply"

### Step 5: Create Customers

1. Go to **Accounting** → **Customers** → **Customers**
2. Click "Create"
3. Add your customers:
   - **Name**: Customer name
   - **Email**: Customer email
   - **Phone**: Customer phone
   - **Address**: Customer address
4. Click "Save"

**Example Customers:**
- Oppo Tech
- Client ABC
- Test Customer

### Step 6: Create Products/Services

1. Go to **Accounting** → **Customers** → **Products**
2. Click "Create"
3. Add your services:
   - **Product Name**: e.g., "Web Development"
   - **Product Type**: Service
   - **Sales Price**: Your rate
   - **Cost**: Your cost (optional)
4. Click "Save"

**Example Services:**
- Web Development - $1000
- Mobile App Development - $2000
- Consulting - $100/hour

### Step 7: Configure Taxes (Optional)

1. Go to **Accounting** → **Configuration** → **Taxes**
2. Create taxes if applicable:
   - **Tax Name**: e.g., "Sales Tax 17%"
   - **Tax Type**: Sales
   - **Tax Computation**: Percentage of Price
   - **Amount**: 17%
3. Click "Save"

## API Access Configuration

### Step 1: Enable API Access

1. Go to **Settings** → **Users & Companies** → **Users**
2. Click on "Administrator"
3. Go to **Access Rights** tab
4. Ensure "Technical Features" is checked
5. Click "Save"

### Step 2: Get API Credentials

For the MCP server, you'll need:
- **URL**: http://localhost:8069
- **Database**: ai_employee_accounting
- **Username**: admin
- **Password**: admin (or what you set)

### Step 3: Update .env File

```bash
# Odoo Configuration
ODOO_URL=http://localhost:8069
ODOO_DB=ai_employee_accounting
ODOO_USERNAME=admin
ODOO_PASSWORD=admin
```

## Testing the Integration

### Test 1: Create Invoice via MCP

```bash
# Navigate to MCP server directory
cd mcp_servers/odoo-mcp

# Install dependencies
npm install

# Test the server
node index.js
```

### Test 2: Create Test Invoice in Odoo UI

1. Go to **Accounting** → **Customers** → **Invoices**
2. Click "Create"
3. Select customer
4. Add invoice line:
   - **Product**: Web Development
   - **Quantity**: 1
   - **Price**: 1000
5. Click "Confirm"
6. Note the invoice number

### Test 3: Verify MCP Connection

The AI Employee will use the MCP server to:
- Create invoices automatically from emails
- Record payments
- Log expenses
- Generate financial reports

## Troubleshooting

### Issue: Can't access http://localhost:8069

**Solution:**
- Check if Odoo is running: `docker ps` (for Docker)
- Check if port 8069 is in use: `netstat -ano | findstr 8069`
- Restart Odoo service

### Issue: Database creation fails

**Solution:**
- Check PostgreSQL is running
- Verify PostgreSQL credentials
- Check disk space

### Issue: MCP server authentication fails

**Solution:**
- Verify ODOO_USERNAME and ODOO_PASSWORD in .env
- Check if user has API access rights
- Ensure database name is correct

### Issue: "Module not found" error

**Solution:**
- Install missing Odoo modules from Apps menu
- Update module list: **Apps** → **Update Apps List**

## Security Best Practices

1. **Change default password**: Don't use "admin" in production
2. **Use strong master password**: This protects your database
3. **Limit API access**: Create separate user for API with limited rights
4. **Enable HTTPS**: Use reverse proxy (nginx) for production
5. **Regular backups**: Backup database regularly
6. **Update regularly**: Keep Odoo updated for security patches

## Backup and Restore

### Backup Database

**Via Odoo UI:**
1. Go to http://localhost:8069/web/database/manager
2. Enter master password
3. Click "Backup" next to your database
4. Download the backup file

**Via Command Line:**
```bash
pg_dump -U odoo ai_employee_accounting > backup.sql
```

### Restore Database

**Via Odoo UI:**
1. Go to http://localhost:8069/web/database/manager
2. Click "Restore Database"
3. Upload backup file
4. Enter new database name
5. Click "Restore"

## Next Steps

After Odoo is set up:

1. ✅ Odoo installed and running
2. ✅ Database created
3. ✅ Accounting module installed
4. ✅ Company configured
5. ✅ Customers added
6. ✅ Products/services created
7. ✅ API credentials configured
8. ⏳ Test MCP server connection
9. ⏳ Create test invoice via AI Employee
10. ⏳ Verify financial reports

## Resources

- **Odoo Documentation**: https://www.odoo.com/documentation/17.0/
- **Odoo Community Forum**: https://www.odoo.com/forum
- **Odoo GitHub**: https://github.com/odoo/odoo
- **Accounting Guide**: https://www.odoo.com/documentation/17.0/applications/finance/accounting.html

## Support

If you encounter issues:
1. Check Odoo logs: `/var/log/odoo/` (Linux) or Odoo installation directory (Windows)
2. Check MCP server logs: `mcp_servers/odoo-mcp/`
3. Verify .env configuration
4. Test Odoo API manually using Postman or curl

---

**Installation complete! Your Odoo accounting system is ready for AI Employee integration.**
