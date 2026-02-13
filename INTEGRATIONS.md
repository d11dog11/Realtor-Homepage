# Email & Calendar Integrations

This application supports three major email and calendar providers through OAuth 2.0:

- **Gmail (Google)** - Full access to Gmail, Google Calendar, and Google Contacts
- **Outlook (Microsoft Exchange)** - Full access to Outlook/Exchange Email, Calendar, and Contacts
- **Yahoo Mail** - Full access to Yahoo Mail, Calendar, and Contacts

## Features

### Email Capabilities
- ✉️ Send emails directly from your connected account
- 📥 Read emails (with filtering)
- 📧 Automated email campaigns
- 🔄 Automatic token refresh

### Calendar Capabilities
- 📅 Create calendar events
- 📋 List upcoming events
- 👥 Add attendees to events
- ⏰ Set event times and descriptions

### Contacts Capabilities
- 📇 Import contacts from your email provider
- 🔄 Sync contact information
- 📊 Merge with CRM data

## How It Works

### 1. Authentication Flow
1. User clicks "Connect" for a provider in `/admin/integrations`
2. OAuth flow redirects to the provider's login page
3. User grants permissions
4. Application receives access and refresh tokens
5. Tokens are stored securely in the database

### 2. Token Management
- Access tokens are automatically refreshed when they expire
- Refresh tokens are stored for long-term access
- Each provider has its own token lifecycle

### 3. API Structure

```
lib/
├── gmail-client.ts          # Google/Gmail API wrapper
├── microsoft-client.ts      # Microsoft Graph API wrapper
├── yahoo-client.ts          # Yahoo API wrapper
└── email-service.ts         # Unified email service (auto-selects provider)

app/api/
├── auth/
│   ├── google/              # Google OAuth routes
│   ├── microsoft/           # Microsoft OAuth routes
│   └── yahoo/               # Yahoo OAuth routes
├── google/send-email/       # Send email via Gmail
├── microsoft/send-email/    # Send email via Microsoft
└── yahoo/send-email/        # Send email via Yahoo
```

## Setup Instructions

See [OAUTH_SETUP.md](./OAUTH_SETUP.md) for detailed setup instructions for each provider.

### Quick Start

1. **Copy environment template:**
   ```bash
   cp .env.local.example .env.local
   ```

2. **Configure at least one provider** in `.env.local`:
   ```
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

3. **Restart the development server:**
   ```bash
   npm run dev
   ```

4. **Navigate to integrations:**
   ```
   http://localhost:3001/admin/integrations
   ```

5. **Click "Connect"** on your configured provider

## Usage Examples

### Sending Emails

#### Using the unified service (recommended):
```typescript
import { sendEmail } from "@/lib/email-service";

// Automatically uses the first available provider
await sendEmail(
  "recipient@example.com",
  "Hello!",
  "<h1>Welcome</h1><p>This is a test email.</p>"
);

// Or specify a provider
await sendEmail(
  "recipient@example.com",
  "Hello!",
  "<h1>Welcome</h1>",
  "google" // or "microsoft" or "yahoo"
);
```

#### Using a specific provider:
```typescript
import { sendGmailEmail } from "@/lib/gmail-client";

await sendGmailEmail(
  "recipient@example.com",
  "Subject",
  "<p>HTML body</p>"
);
```

### Creating Calendar Events

#### Google Calendar:
```typescript
import { createGoogleCalendarEvent } from "@/lib/gmail-client";

await createGoogleCalendarEvent(
  "Team Meeting",
  new Date("2026-03-01T10:00:00"),
  new Date("2026-03-01T11:00:00"),
  "Discuss Q1 plans",
  ["attendee1@example.com", "attendee2@example.com"]
);
```

#### Microsoft Calendar:
```typescript
import { createMicrosoftCalendarEvent } from "@/lib/microsoft-client";

await createMicrosoftCalendarEvent(
  "Client Call",
  new Date("2026-03-01T14:00:00"),
  new Date("2026-03-01T15:00:00"),
  "Follow-up discussion"
);
```

### Importing Contacts

#### Google Contacts:
```typescript
import { importGoogleContacts } from "@/lib/gmail-client";

const contacts = await importGoogleContacts();
// Returns array of contacts with firstName, lastName, email, phone, birthdate
```

#### Microsoft Contacts:
```typescript
import { importMicrosoftContacts } from "@/lib/microsoft-client";

const contacts = await importMicrosoftContacts();
```

## API Endpoints

### Authentication
- `GET /api/auth/google/login` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback
- `GET /api/auth/google/logout` - Disconnect Google

- `GET /api/auth/microsoft/login` - Initiate Microsoft OAuth
- `GET /api/auth/microsoft/callback` - Microsoft OAuth callback
- `GET /api/auth/microsoft/logout` - Disconnect Microsoft

- `GET /api/auth/yahoo/login` - Initiate Yahoo OAuth
- `GET /api/auth/yahoo/callback` - Yahoo OAuth callback
- `GET /api/auth/yahoo/logout` - Disconnect Yahoo

### Operations
- `POST /api/google/send-email` - Send email via Gmail
- `POST /api/microsoft/send-email` - Send email via Microsoft
- `POST /api/yahoo/send-email` - Send email via Yahoo

### Admin
- `GET /api/admin/integrations` - List all integration statuses

## Security Considerations

1. **Environment Variables**: Never commit `.env.local` to version control
2. **Token Storage**: Tokens are stored in the database with expiration times
3. **Automatic Refresh**: Expired tokens are automatically refreshed
4. **OAuth Scopes**: Request only the minimum required scopes
5. **HTTPS**: Always use HTTPS in production for OAuth callbacks

## Troubleshooting

### Common Issues

**"No email provider configured"**
- Solution: Connect at least one provider in `/admin/integrations`

**"Token expired" errors**
- Solution: The token should auto-refresh. If it doesn't, try disconnecting and reconnecting the provider.

**"Redirect URI mismatch"**
- Solution: Ensure the redirect URI in your OAuth app matches exactly: `http://localhost:3001/api/auth/{provider}/callback`

**"Insufficient permissions"**
- Solution: Check that all required API scopes are enabled in your OAuth app configuration

## Provider-Specific Notes

### Google (Gmail)
- Requires enabling Gmail API, Calendar API, and People API in Google Cloud Console
- Refresh tokens are only provided on first authorization with `prompt=consent`
- Subject to Google's API quotas

### Microsoft (Exchange)
- Works with both Office 365 and Exchange Online
- Requires Azure AD app registration
- May require admin consent for some permissions in organizational accounts
- `MS_TENANT_ID=common` allows personal and organizational accounts

### Yahoo
- Calendar API has limited REST support (uses CalDAV)
- Contacts API uses the Social Directory API
- OAuth token endpoint requires Basic Auth with client credentials

## Next Steps

1. **Email Campaigns**: Use the unified `sendEmail()` function in your campaign routes
2. **Contact Sync**: Implement periodic sync jobs to import new contacts
3. **Calendar Integration**: Add calendar event creation when scheduling follow-ups
4. **Multi-Provider**: Allow users to connect multiple providers for redundancy

## Support

For detailed setup instructions, see: [OAUTH_SETUP.md](./OAUTH_SETUP.md)

For API documentation, see the individual client files in `lib/`:
- `gmail-client.ts`
- `microsoft-client.ts`
- `yahoo-client.ts`
