# Realty Michigan Homepage

Professional realtor homepage for Drew Wodarski, built with Next.js with integrated CRM features.

## Getting Started

1.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    # or
    bun install
    ```

2.  Run the development server:
    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    # or
    bun dev
    ```

3.  Open [http://localhost:3001](http://localhost:3001) with your browser to see the result.

## Database Setup

This project uses a local SQLite database to store contacts.

1.  Initialize the database:
    ```bash
    npx prisma db push
    ```

2.  (Optional) View the database in your browser:
    ```bash
    npx prisma studio
    ```

## Admin Console

Access the admin console at `/admin` to manage contacts, email campaigns, and integrations.

**Access**: There is a hidden "Admin" link at the very bottom of the main page footer. Click it and enter the password `1234` to access the console.

## Email & Calendar Integrations

This application supports **three major email providers** with full OAuth 2.0 integration:

### Supported Providers:
- 📧 **Gmail (Google)** - Gmail, Google Calendar, Google Contacts
- 📮 **Outlook (Microsoft Exchange)** - Outlook/Exchange Email, Calendar, Contacts  
- 📬 **Yahoo Mail** - Yahoo Email, Calendar, Contacts

### Features:
- ✉️ Send emails from your own email account
- 📅 Create and manage calendar events
- 📇 Import and sync contacts from your email provider
- 🔄 Automatic token refresh
- 🎯 Multi-provider support with automatic failover

### Quick Setup:

1. **Choose a provider** and get OAuth credentials:
   - **Gmail**: https://console.cloud.google.com/
   - **Microsoft**: https://portal.azure.com/
   - **Yahoo**: https://developer.yahoo.com/

2. **Add credentials** to `.env.local`:
   ```bash
   # For Gmail
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   
   # For Microsoft
   MS_CLIENT_ID=your_client_id
   MS_CLIENT_SECRET=your_client_secret
   MS_TENANT_ID=common
   
   # For Yahoo
   YAHOO_CLIENT_ID=your_client_id
   YAHOO_CLIENT_SECRET=your_client_secret
   ```

3. **Connect** in the Admin Console:
   - Go to `/admin/integrations`
   - Click "Connect" on your chosen provider
   - Grant permissions

### Documentation:
- 🚀 **[Quick Start Guide](./QUICK_START.md)** - Get up and running in 5 minutes
- 📖 **[Full Integration Docs](./INTEGRATIONS.md)** - Complete feature documentation
- 🔧 **[OAuth Setup Guide](./OAUTH_SETUP.md)** - Detailed OAuth configuration
- 📋 **[Implementation Summary](./IMPLEMENTATION_SUMMARY.md)** - Technical details

## Features

- **Contact Management**: Full CRM with contact tracking and status management
- **Email Campaigns**: Automated email campaigns with template management
- **OAuth Integrations**: Connect Gmail, Microsoft, or Yahoo accounts
- **Contact Import**: Import contacts from your email provider
- **Calendar Integration**: Create events and manage schedules
- **Opt-out Management**: Automated unsubscribe handling
- **File Uploads**: Support for images and PDFs in email templates

## Customization

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Tech Stack

- **Framework**: Next.js 16 with React 19
- **Database**: SQLite with Prisma ORM
- **Styling**: Tailwind CSS
- **Email APIs**: Gmail API, Microsoft Graph API, Yahoo Mail API
- **Authentication**: OAuth 2.0 with automatic token refresh

