# Gmail API Setup - Urdu Guide

## Step 1: Google Cloud Console

1. **Browser mein jao:** https://console.cloud.google.com
2. **Naya project banao:**
   - "Select a project" pe click karo
   - "New Project" pe click karo
   - Project name: **AI-Employee**
   - "Create" pe click karo
   - Wait karo 30 seconds

## Step 2: Gmail API Enable Karo

1. **APIs & Services** pe jao (left menu mein)
2. **"Library"** pe click karo
3. Search box mein type karo: **Gmail API**
4. **Gmail API** pe click karo
5. **"Enable"** button pe click karo

## Step 3: OAuth Consent Screen Setup

1. **APIs & Services** → **OAuth consent screen** pe jao
2. **"External"** select karo
3. **"Create"** pe click karo
4. Form fill karo:
   - App name: **AI Employee**
   - User support email: **apna email**
   - Developer contact email: **apna email**
5. **"Save and Continue"** pe click karo
6. **Scopes page** pe:
   - "Add or Remove Scopes" pe click karo
   - Search karo aur add karo:
     - `gmail.readonly`
     - `gmail.send`
     - `gmail.modify`
   - "Update" pe click karo
   - "Save and Continue" pe click karo
7. **Test users page** pe:
   - "Add Users" pe click karo
   - Apna Gmail address add karo
   - "Save and Continue" pe click karo

## Step 4: OAuth Credentials Banao

1. **APIs & Services** → **Credentials** pe jao
2. **"Create Credentials"** pe click karo
3. **"OAuth client ID"** select karo
4. Application type: **"Desktop app"** select karo
5. Name: **AI Employee Desktop**
6. **"Create"** pe click karo
7. **Download JSON** button pe click karo
8. Downloaded file ko save karo as:
   ```
   D:\My-Project\AI_Employee\.credentials\gmail_credentials.json
   ```

## Step 5: First Authentication

Jab aap pehli baar Gmail watcher chalao ge:

```bash
cd D:\My-Project\AI_Employee
python watchers/gmail_watcher.py
```

**Kya hoga:**
1. Browser automatically khulega
2. "Google hasn't verified this app" warning aayegi
3. "Advanced" pe click karo
4. "Go to AI Employee (unsafe)" pe click karo
5. Apne Google account se sign in karo
6. "Allow" pe click karo permissions dene ke liye
7. Browser mein "Authentication complete" dikhega
8. Token save ho jayega: `.credentials/gmail_token.json`

## Important Notes

- ⚠️ Credentials aur token files ko kabhi git pe upload na karo
- ⚠️ Testing mode mein token 7 days baad expire hota hai
- ✅ Token ek baar save hone ke baad dubara authentication ki zaroorat nahi

## Agar Problem Aaye

**"Access blocked" error:**
- OAuth consent screen mein apna email test user ke tor pe add karo

**"invalid_grant" error:**
- `.credentials/gmail_token.json` delete karo
- Dubara authentication karo

**Browser nahi khulta:**
- Terminal se URL copy karo aur manually browser mein paste karo

---

**Next Step:** Dependencies install hone ke baad Gmail API setup karo!
