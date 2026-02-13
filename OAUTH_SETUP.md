# Environment Variables for OAuth Integrations

This file documents the environment variables required for the email and calendar integrations.

## Yahoo Mail Integration

```
YAHOO_CLIENT_ID=your_yahoo_client_id
YAHOO_CLIENT_SECRET=your_yahoo_client_secret
```

**Setup Instructions:**
1. Go to https://developer.yahoo.com/
2. Create a new app
3. Add redirect URI: `http://localhost:3001/api/auth/yahoo/callback` (for development)
4. Add redirect URI: `https://yourdomain.com/api/auth/yahoo/callback` (for production)
5. Enable OAuth scopes: OpenID, Mail, Calendar (sdct-w), Contacts (sdcw-w)

## Gmail (Google) Integration

```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

**Setup Instructions:**
1. Go to https://console.cloud.google.com/
2. Create a new project or select existing
3. Enable APIs: Gmail API, Google Calendar API, Google People API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Application type: Web application
6. Add authorized redirect URI: `http://localhost:3001/api/auth/google/callback` (for development)
7. Add authorized redirect URI: `https://yourdomain.com/api/auth/google/callback` (for production)

## Microsoft Exchange (Office 365) Integration

```
MS_CLIENT_ID=your_microsoft_client_id
MS_CLIENT_SECRET=your_microsoft_client_secret
MS_TENANT_ID=common
```

**Setup Instructions:**
1. Go to https://portal.azure.com/
2. Navigate to "Azure Active Directory" → "App registrations"
3. Click "New registration"
4. Name your app and select "Accounts in any organizational directory and personal Microsoft accounts"
5. Add redirect URI (Web): `http://localhost:3001/api/auth/microsoft/callback` (for development)
6. Add redirect URI (Web): `https://yourdomain.com/api/auth/microsoft/callback` (for production)
7. Go to "Certificates & secrets" → "New client secret" → Copy the value
8. Go to "API permissions" → "Add a permission" → "Microsoft Graph" → "Delegated permissions"
9. Add these permissions:
   - Mail.Send
   - Mail.Read
   - Calendars.ReadWrite
   - Contacts.Read
   - User.Read
   - offline_access
10. Click "Grant admin consent" if you have admin rights

## Application URL

```
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

For production, set this to your actual domain:
```
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Complete .env.local Example

```
# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3001

# Yahoo Integration
YAHOO_CLIENT_ID=your_yahoo_client_id
YAHOO_CLIENT_SECRET=your_yahoo_client_secret

# Google Integration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Microsoft Integration
MS_CLIENT_ID=your_microsoft_client_id
MS_CLIENT_SECRET=your_microsoft_client_secret
MS_TENANT_ID=common
```

## Testing the Integration

After adding the environment variables:

1. Restart your development server
2. Navigate to `/admin/integrations`
3. Click "Connect" on any provider
4. Complete the OAuth flow
5. You should be redirected back with a success message

## Troubleshooting

### "Redirect URI mismatch" Error
- Ensure the redirect URI in your OAuth app settings exactly matches the one used in the application
- Check that `NEXT_PUBLIC_APP_URL` is set correctly

### "Invalid credentials" Error
- Double-check your client ID and secret
- Ensure the environment variables are properly loaded (restart the server after adding them)

### "Insufficient permissions" Error
- Make sure all required API scopes are enabled in your OAuth app
- For Microsoft, ensure you've granted admin consent for the permissions
