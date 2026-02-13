import { prisma } from "./db";
import axios from "axios";
import nodemailer from "nodemailer";

const YAHOO_CLIENT_ID = process.env.YAHOO_CLIENT_ID!;
const YAHOO_CLIENT_SECRET = process.env.YAHOO_CLIENT_SECRET!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
const REDIRECT_URI = `${APP_URL}/api/auth/yahoo/callback`;

// Scopes: OpenID for identity, Mail for sending, Social for Contacts
// Yahoo Scopes are often tied to the specific API keys in the dashboard, but we ask for them explicitly if needed.
// 'sdct-w': Calendar Write
// 'sdcw-w': Contacts Write
const SCOPES = ["openid", "sdct-w", "sdcw-w", "mail-w"];

export const getYahooAuthUrl = () => {
    const params = new URLSearchParams({
        client_id: YAHOO_CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        response_type: "code",
        scope: SCOPES.join(" "),
        nonce: Math.random().toString(36).substring(7), // efficient nonce
    });
    return `https://api.login.yahoo.com/oauth2/request_auth?${params.toString()}`;
};

async function getTokens(code: string) {
    const tokenUrl = "https://api.login.yahoo.com/oauth2/get_token";
    const body = new URLSearchParams({
        grant_type: "authorization_code",
        redirect_uri: REDIRECT_URI,
        code,
    });

    // Yahoo expects Basic Auth with Client ID:Success
    const authHeader = Buffer.from(`${YAHOO_CLIENT_ID}:${YAHOO_CLIENT_SECRET}`).toString("base64");

    const response = await axios.post(tokenUrl, body, {
        headers: {
            "Authorization": `Basic ${authHeader}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
    });

    return response.data; // access_token, refresh_token, expires_in, xoauth_yahoo_guid
}

async function getUserInfo(accessToken: string) {
    // Get basic profile info (email)
    const response = await axios.get("https://api.login.yahoo.com/openid/v1/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data; // email, sub (guid), etc.
}

export const handleYahooCallback = async (code: string) => {
    const tokens = await getTokens(code);
    const userInfo = await getUserInfo(tokens.access_token);

    // Default 1 hour expiry if not provided
    const expiresIn = tokens.expires_in || 3600;
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    const email = userInfo.email || tokens.id_token ? JSON.parse(Buffer.from(tokens.id_token.split('.')[1], 'base64').toString()).email : null;

    // Save/Update in DB
    await prisma.oAuthIntegration.upsert({
        where: { provider: "yahoo" },
        update: {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresAt,
            providerEmail: email,
        },
        create: {
            provider: "yahoo",
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresAt,
            providerEmail: email,
        },
    });

    return email;
};

export const getYahooIntegration = async () => {
    const integration = await prisma.oAuthIntegration.findUnique({
        where: { provider: "yahoo" },
    });

    if (!integration) {
        throw new Error("Yahoo integration not configured");
    }

    // Refresh if expired (with buffer)
    if (new Date() > new Date(integration.expiresAt.getTime() - 5 * 60 * 1000)) {
        return await refreshYahooToken(integration);
    }

    return integration;
};

const refreshYahooToken = async (integration: any) => {
    try {
        const tokenUrl = "https://api.login.yahoo.com/oauth2/get_token";
        const body = new URLSearchParams({
            grant_type: "refresh_token",
            redirect_uri: REDIRECT_URI,
            refresh_token: integration.refreshToken,
        });

        const authHeader = Buffer.from(`${YAHOO_CLIENT_ID}:${YAHOO_CLIENT_SECRET}`).toString("base64");

        const response = await axios.post(tokenUrl, body, {
            headers: {
                "Authorization": `Basic ${authHeader}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });

        const { access_token, refresh_token, expires_in } = response.data;

        const updated = await prisma.oAuthIntegration.update({
            where: { provider: "yahoo" },
            data: {
                accessToken: access_token,
                refreshToken: refresh_token || integration.refreshToken,
                expiresAt: new Date(Date.now() + (expires_in || 3600) * 1000),
            },
        });

        return updated;
    } catch (error) {
        console.error("Failed to refresh Yahoo token", error);
        throw new Error("Failed to refresh Yahoo token");
    }
};

// --- Capabilities ---

// 1. Send Email
export const sendYahooEmail = async (to: string, subject: string, html: string) => {
    const integration = await getYahooIntegration();
    if (!integration.providerEmail) throw new Error("No Yahoo email associated");

    const transporter = nodemailer.createTransport({
        service: "yahoo", // Nodemailer has built-in Yahoo service config
        auth: {
            type: "OAuth2",
            user: integration.providerEmail,
            clientId: YAHOO_CLIENT_ID,
            clientSecret: YAHOO_CLIENT_SECRET,
            accessToken: integration.accessToken,
            refreshToken: integration.refreshToken,
        },
    });

    await transporter.sendMail({
        from: integration.providerEmail,
        to,
        subject,
        html,
    });
};

// 2. Fetch Contacts (Import)
export const importYahooContacts = async () => {
    const integration = await getYahooIntegration();
    // Yahoo Social API for Contacts
    // Note: 'me' alias works if scope is correct
    const url = `https://social.yahooapis.com/v1/user/me/contacts?format=json&count=100`;

    const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${integration.accessToken}` },
    });

    const yahooContacts = response.data.contacts.contact;

    const importedCount = 0;
    // Process and save to DB
    // This is a simplified mapping
    /*
    for (const c of yahooContacts) {
       // logic to extract name, email, phone and prisma.contact.create()
    }
    */
    return yahooContacts; // Returned for now to inspect structure
};

// 3. Create Calendar Event
export const createYahooCalendarEvent = async (title: string, startDate: Date, endDate: Date, description?: string) => {
    // Yahoo Calendar API is complex (CalDAV). Detailed REST documentation is scarce on modern endpoints.
    // However, if we simply want to "Create" an event, we might be able to use a simpler method or fallback to sending an ICS invite.
    // Given the constraints, I will leave this as a placeholder or implement if a clear REST endpoint is available.
    // There isn't a simple "POST /events" standard endpoint like Google.

    // Alternative: Use Microsoft Graph if the user's Yahoo account is migrated? Unlikely.

    console.warn("Yahoo Calendar REST API is not fully standard. Detailed implementation requires specific XML/JSON payload analysis.");
    return false;
};
