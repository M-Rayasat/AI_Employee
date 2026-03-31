const { chromium } = require('playwright');
const fs = require('fs');

async function postToLinkedIn() {
    // Read approved post
    const content = fs.readFileSync('vault/Approved/LINKEDIN_POST_20260330_012045.md', 'utf-8');
    
    // Extract post content
    const lines = content.split('\n');
    let postLines = [];
    let capture = false;
    
    for (const line of lines) {
        if (line.includes('## LinkedIn Post Content')) {
            capture = true;
            continue;
        }
        if (capture && line.trim() === '---') {
            break;
        }
        if (capture && line.trim()) {
            postLines.push(line);
        }
    }
    
    const postContent = postLines.join('\n');
    
    console.log('Starting LinkedIn automation...');
    console.log('Post content length:', postContent.length);
    
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
        // Navigate to LinkedIn
        console.log('Navigating to LinkedIn...');
        await page.goto('https://www.linkedin.com/login');
        await page.waitForTimeout(2000);
        
        // Login
        console.log('Logging in...');
        await page.fill('input#username', 'onlinee723@gmail.com');
        await page.fill('input#password', 'Rayasat786@#_');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(5000);
        
        // Check for verification
        if (page.url().includes('checkpoint') || page.url().includes('challenge')) {
            console.log('⚠️ Verification required! Please complete it in the browser...');
            console.log('Waiting 60 seconds...');
            await page.waitForTimeout(60000);
        }
        
        // Navigate to feed
        console.log('Navigating to feed...');
        await page.goto('https://www.linkedin.com/feed/');
        await page.waitForTimeout(3000);
        
        // Click "Start a post"
        console.log('Clicking Start a post...');
        await page.click('button:has-text("Start a post")');
        await page.waitForTimeout(2000);
        
        // Fill post content
        console.log('Filling post content...');
        const editor = page.locator('div[role="textbox"][contenteditable="true"]').first();
        await editor.click();
        await editor.fill(postContent);
        await page.waitForTimeout(2000);
        
        // Click Post button
        console.log('Clicking Post button...');
        await page.click('button:has-text("Post"):not([disabled])');
        await page.waitForTimeout(5000);
        
        console.log('✅ Post published successfully!');
        
        // Move file to Done
        fs.renameSync(
            'vault/Approved/LINKEDIN_POST_20260330_012045.md',
            'vault/Done/LINKEDIN_POST_20260330_012045.md'
        );
        
        // Log action
        const logEntry = `\n[${new Date().toISOString()}]\nAction: LinkedIn Post Published\nFile: LINKEDIN_POST_20260330_012045.md\nStatus: Success\n---\n`;
        fs.appendFileSync('vault/Logs/2026-03-30.log', logEntry);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        console.log('Keeping browser open for 10 seconds...');
        await page.waitForTimeout(10000);
        await browser.close();
    }
}

postToLinkedIn();
