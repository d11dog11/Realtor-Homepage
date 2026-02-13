# Quick Start Guide - Email & Calendar Integrations

## 🚀 Getting Started in 5 Minutes

### Step 1: Choose Your Provider

Pick at least one email provider to integrate:
- **Gmail** (Recommended for Google Workspace users)
- **Microsoft/Outlook** (Recommended for Office 365 users)
- **Yahoo Mail** (Already partially configured)

### Step 2: Get OAuth Credentials

#### For Gmail (Google):
1. Go to: https://console.cloud.google.com/
2. Create a new project
3. Enable these APIs:
   - Gmail API
   - Google Calendar API
   - Google People API
4. Create OAuth 2.0 credentials:
   - Type: Web application
   - Redirect URI: `http://localhost:3001/api/auth/google/callback`
5. Copy Client ID and Client Secret

#### For Microsoft (Outlook/Exchange):
1. Go to: https://portal.azure.com/
2. Navigate to: Azure Active Directory → App registrations
3. Click "New registration"
4. Name your app, choose "Multi-tenant"
5. Add redirect URI: `http://localhost:3001/api/auth/microsoft/callback`
6. Go to "Certificates & secrets" → Create new secret
7. Go to "API permissions" → Add these:
   - Mail.Send
   - Mail.Read
   - Calendars.ReadWrite
   - Contacts.Read
   - User.Read
   - offline_access
8. Copy Client ID and Client Secret

### Step 3: Add to Environment

Create or edit `.env.local` file in the project root:

```bash
# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3001

# Gmail (Google) - if using
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here

# Microsoft (Outlook) - if using
MS_CLIENT_ID=your_client_id_here
MS_CLIENT_SECRET=your_client_secret_here
MS_TENANT_ID=common
```

### Step 4: Restart Server

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

### Step 5: Connect Your Account

1. Open: http://localhost:3001/admin/integrations
2. Click **"Connect"** on your configured provider
3. Sign in and grant permissions
4. You'll be redirected back - you should see "Connected as: your@email.com"

### Step 6: Test It

#### Send a Test Email:
```typescript
import { sendEmail } from "@/lib/email-service";

await sendEmail(
  "test@example.com",
  "Test Email",
  "<h1>It works!</h1>"
);
```

#### Import Contacts:
1. Go to: http://localhost:3001/admin
2. Scroll down to "Import Contacts"
3. Click "Import from Gmail" (or your provider)
4. Wait for import to complete

#### Create Calendar Event:
```typescript
import { createGoogleCalendarEvent } from "@/lib/gmail-client";

await createGoogleCalendarEvent(
  "Meeting",
  new Date("2026-03-01T10:00:00"),
  new Date("2026-03-01T11:00:00"),
  "Discuss project"
);
```

## 📱 Common Use Cases

### Use Case 1: Automated Email Campaigns
Your existing campaign system can now use any connected provider:

```typescript
// In your campaign sending logic
import { sendEmail } from "@/lib/email-service";

for (const contact of recipients) {
  await sendEmail(contact.email, subject, htmlBody);
}
```

### Use Case 2: Contact Sync
Keep your CRM in sync with your email contacts:

```typescript
// Import from Google
import { importGoogleContacts } from "@/lib/gmail-client";
const contacts = await importGoogleContacts();

// Save to database
for (const contact of contacts) {
  await prisma.contact.create({ data: contact });
}
```

### Use Case 3: Follow-up Reminders
Create calendar events for scheduled follow-ups:

```typescript
import { createGoogleCalendarEvent } from "@/lib/gmail-client";

await createGoogleCalendarEvent(
  `Follow up with ${contact.firstName}`,
  followUpDate,
  followUpDate,
  `Contact: ${contact.email}`
);
```

## ⚡ Quick Tips

1. **Priority**: If multiple providers are connected, emails will be sent using Google → Microsoft → Yahoo (in that order)

2. **Specify Provider**: You can force a specific provider:
   ```typescript
   await sendEmail(to, subject, html, "microsoft");
   ```

3. **Check Status**: See which providers are connected:
   ```typescript
   import { getConfiguredProviders } from "@/lib/email-service";
   const providers = await getConfiguredProviders();
   ```

4. **Auto-refresh**: Tokens automatically refresh - no manual intervention needed

5. **Error Handling**: Always wrap in try-catch:
   ```typescript
   try {
     await sendEmail(to, subject, html);
   } catch (error) {
     console.error("Failed to send:", error);
   }
   ```

## 🔧 Troubleshooting

### "No email provider configured"
→ Connect at least one provider in `/admin/integrations`

### "Failed to refresh token"
→ Disconnect and reconnect the provider

### "Redirect URI mismatch"
→ Check that redirect URI in OAuth app exactly matches:
   - Dev: `http://localhost:3001/api/auth/{provider}/callback`
   - Prod: `https://yourdomain.com/api/auth/{provider}/callback`

### "Insufficient permissions"
→ Make sure all required API scopes are enabled in your OAuth app

### Import shows 0 contacts
→ Provider may not have contacts, or permissions not granted

## 📚 More Information

- Full documentation: `INTEGRATIONS.md`
- OAuth setup guide: `OAUTH_SETUP.md`
- Implementation details: `IMPLEMENTATION_SUMMARY.md`

## 🎉 You're All Set!

You now have:
- ✅ Email sending from your own account
- ✅ Calendar event creation
- ✅ Contact import and sync capability
- ✅ Automatic token management
- ✅ Multi-provider support

Start building amazing features! 🚀
