# Gmail API - Access Blocked Error Fix

## Problem
"Access blocked: This app's request is invalid" error aa raha hai.

## Solution: Test User Add Karo

### Step 1: OAuth Consent Screen pe jao

1. Google Cloud Console kholo: https://console.cloud.google.com
2. Apna project "AI-Employee" select karo
3. Left menu → **APIs & Services** → **OAuth consent screen**

### Step 2: Test Users Add Karo

1. **"Test users"** section mein jao (page ke neeche)
2. **"+ ADD USERS"** button pe click karo
3. **Apna Gmail address** type karo (jis se sign in kar rahe ho)
4. **"Save"** pe click karo

### Step 3: Verify Scopes

OAuth consent screen pe check karo:
- Scopes section mein ye scopes hone chahiye:
  - `https://www.googleapis.com/auth/gmail.readonly`
  - `https://www.googleapis.com/auth/gmail.modify`

Agar nahi hain to:
1. **"EDIT APP"** pe click karo
2. **"Scopes"** page pe jao
3. **"Add or Remove Scopes"** pe click karo
4. Search karke ye scopes add karo
5. **"Update"** → **"Save and Continue"**

### Step 4: Dubara Try Karo

```bash
cd D:\My-Project
source venv/bin/activate
cd AI_Employee
python watchers/gmail_watcher.py
```

## Important Notes

- **Test user** wo email address hona chahiye jis se aap sign in kar rahe ho
- Multiple email addresses add kar sakte ho
- Testing mode mein sirf test users hi access kar sakte hain

---

**Test user add karne ke baad mujhe batao!**
