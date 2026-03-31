import os
from playwright.sync_api import sync_playwright
import time
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Read approved post
with open('vault/Approved/LINKEDIN_POST_20260330_012045.md', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract post content (between "## LinkedIn Post Content" and "---")
lines = content.split('\n')
post_lines = []
capture = False
for line in lines:
    if '## LinkedIn Post Content' in line:
        capture = True
        continue
    if capture and line.strip() == '---':
        break
    if capture and line.strip():
        post_lines.append(line)

post_content = '\n'.join(post_lines)

# Get credentials
email = os.getenv('LINKEDIN_EMAIL')
password = os.getenv('LINKEDIN_PASSWORD')

print("Starting LinkedIn automation...")
print(f"Email: {email}")

with sync_playwright() as p:
    # Launch browser (visible so you can see what's happening)
    browser = p.chromium.launch(headless=False)
    context = browser.new_context()
    page = context.new_page()
    
    try:
        # Navigate to LinkedIn login
        print("Navigating to LinkedIn...")
        page.goto('https://www.linkedin.com/login', timeout=30000)
        time.sleep(2)
        
        # Login
        print("Logging in...")
        page.fill('input#username', email)
        page.fill('input#password', password)
        page.click('button[type="submit"]')
        time.sleep(5)
        
        # Check if 2FA or verification needed
        if 'checkpoint' in page.url or 'challenge' in page.url:
            print("⚠️ Verification required! Please complete it in the browser...")
            print("Waiting 60 seconds for you to complete verification...")
            time.sleep(60)
        
        # Navigate to feed
        print("Navigating to feed...")
        page.goto('https://www.linkedin.com/feed/', timeout=30000)
        time.sleep(3)
        
        # Click "Start a post"
        print("Clicking 'Start a post'...")
        page.click('button:has-text("Start a post")')
        time.sleep(2)
        
        # Fill post content
        print("Filling post content...")
        editor = page.locator('div[role="textbox"][contenteditable="true"]').first
        editor.click()
        editor.fill(post_content)
        time.sleep(2)
        
        # Click Post button
        print("Clicking 'Post' button...")
        page.click('button:has-text("Post"):not([disabled])')
        time.sleep(5)
        
        print("✅ Post published successfully!")
        
        # Move file to Done
        os.rename('vault/Approved/LINKEDIN_POST_20260330_012045.md', 
                  'vault/Done/LINKEDIN_POST_20260330_012045.md')
        
        # Log action
        with open('vault/Logs/2026-03-30.log', 'a', encoding='utf-8') as log:
            log.write(f"\n[{time.strftime('%Y-%m-%d %H:%M:%S')}]\n")
            log.write("Action: LinkedIn Post Published\n")
            log.write("File: LINKEDIN_POST_20260330_012045.md\n")
            log.write("Status: Success\n")
            log.write("---\n")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        
    finally:
        print("Keeping browser open for 10 seconds...")
        time.sleep(10)
        browser.close()

print("Done!")
