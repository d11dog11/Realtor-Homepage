import { prisma } from "./db";
import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
const REDIRECT_URI = `${APP_URL}/api/auth/google/callback`;

// OAuth2 scopes for Gmail, Calendar, and Contacts
const SCOPES = [
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/contacts.readonly",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
];

export const getGoogleAuthUrl = () => {
    const oauth2Client = new OAuth2Client(
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        REDIRECT_URI
    );

    const authUrl = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: SCOPES,
        prompt: "consent", // Force consent to get refresh token
    });

    return authUrl;
};

export const handleGoogleCallback = async (code: string) => {
    const oauth2Client = new OAuth2Client(
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        REDIRECT_URI
    );

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user email
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    const email = userInfo.data.email || null;

    // Calculate expiry
    const expiresIn = tokens.expiry_date
        ? new Date(tokens.expiry_date)
        : new Date(Date.now() + 3600 * 1000);

    // Save/Update in DB
    await prisma.oAuthIntegration.upsert({
        where: { provider: "google" },
        update: {
            accessToken: tokens.access_token!,
            refreshToken: tokens.refresh_token || "",
            expiresAt: expiresIn,
            providerEmail: email,
        },
        create: {
            provider: "google",
            accessToken: tokens.access_token!,
            refreshToken: tokens.refresh_token || "",
            expiresAt: expiresIn,
            providerEmail: email,
        },
    });

    return email;
};

export const getGoogleIntegration = async () => {
    const integration = await prisma.oAuthIntegration.findUnique({
        where: { provider: "google" },
    });

    if (!integration) {
        throw new Error("Google integration not configured");
    }

    // Refresh if expired (with 5 min buffer)
    if (new Date() > new Date(integration.expiresAt.getTime() - 5 * 60 * 1000)) {
        return await refreshGoogleToken(integration);
    }

    return integration;
};

const refreshGoogleToken = async (integration: any) => {
    try {
        const oauth2Client = new OAuth2Client(
            GOOGLE_CLIENT_ID,
            GOOGLE_CLIENT_SECRET,
            REDIRECT_URI
        );

        oauth2Client.setCredentials({
            refresh_token: integration.refreshToken,
        });

        const { credentials } = await oauth2Client.refreshAccessToken();

        const updated = await prisma.oAuthIntegration.update({
            where: { provider: "google" },
            data: {
                accessToken: credentials.access_token!,
                refreshToken: credentials.refresh_token || integration.refreshToken,
                expiresAt: credentials.expiry_date
                    ? new Date(credentials.expiry_date)
                    : new Date(Date.now() + 3600 * 1000),
            },
        });

        return updated;
    } catch (error) {
        console.error("Failed to refresh Google token", error);
        throw new Error("Failed to refresh Google token");
    }
};

const getAuthClient = async () => {
    const integration = await getGoogleIntegration();

    const oauth2Client = new OAuth2Client(
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        REDIRECT_URI
    );

    oauth2Client.setCredentials({
        access_token: integration.accessToken,
        refresh_token: integration.refreshToken,
    });

    return oauth2Client;
};

// --- Email Capabilities ---

export const sendGmailEmail = async (to: string, subject: string, html: string) => {
    const auth = await getAuthClient();
    const gmail = google.gmail({ version: "v1", auth });

    // Create email in RFC 2822 format
    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString("base64")}?=`;
    const messageParts = [
        `To: ${to}`,
        "Content-Type: text/html; charset=utf-8",
        "MIME-Version: 1.0",
        `Subject: ${utf8Subject}`,
        "",
        html,
    ];
    const message = messageParts.join("\n");

    // Base64url encode the message
    const encodedMessage = Buffer.from(message)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

    await gmail.users.messages.send({
        userId: "me",
        requestBody: {
            raw: encodedMessage,
        },
    });
};

// --- Calendar Capabilities ---

export const createGoogleCalendarEvent = async (
    title: string,
    startDate: Date,
    endDate: Date,
    description?: string,
    attendees?: string[]
) => {
    const auth = await getAuthClient();
    const calendar = google.calendar({ version: "v3", auth });

    const event = {
        summary: title,
        description: description || "",
        start: {
            dateTime: startDate.toISOString(),
            timeZone: "America/New_York", // Adjust as needed
        },
        end: {
            dateTime: endDate.toISOString(),
            timeZone: "America/New_York",
        },
        attendees: attendees?.map(email => ({ email })) || [],
    };

    const response = await calendar.events.insert({
        calendarId: "primary",
        requestBody: event,
    });

    return response.data;
};

export const listGoogleCalendarEvents = async (
    maxResults: number = 10,
    timeMin?: Date
) => {
    const auth = await getAuthClient();
    const calendar = google.calendar({ version: "v3", auth });

    const response = await calendar.events.list({
        calendarId: "primary",
        timeMin: (timeMin || new Date()).toISOString(),
        maxResults,
        singleEvents: true,
        orderBy: "startTime",
    });

    return response.data.items || [];
};

// --- Contacts Capabilities ---

export const importGoogleContacts = async () => {
    const auth = await getAuthClient();
    const people = google.people({ version: "v1", auth });

    const response = await people.people.connections.list({
        resourceName: "people/me",
        pageSize: 100,
        personFields: "names,emailAddresses,phoneNumbers,birthdays",
    });

    const connections = response.data.connections || [];

    // Map to our contact format
    const contacts = connections.map((person: any) => {
        const name = person.names?.[0];
        const email = person.emailAddresses?.[0]?.value;
        const phone = person.phoneNumbers?.[0]?.value;
        const birthday = person.birthdays?.[0]?.date;

        return {
            firstName: name?.givenName || "",
            lastName: name?.familyName || "",
            email: email || "",
            phone: phone || "",
            birthdate: birthday
                ? new Date(birthday.year || 1900, (birthday.month || 1) - 1, birthday.day || 1)
                : null,
        };
    }).filter(c => c.email); // Only keep contacts with email

    return contacts;
};

export const getGoogleEmails = async (maxResults: number = 10, query?: string) => {
    const auth = await getAuthClient();
    const gmail = google.gmail({ version: "v1", auth });

    const response = await gmail.users.messages.list({
        userId: "me",
        maxResults,
        q: query || "is:unread",
    });

    const messages = response.data.messages || [];

    // Fetch full message details
    const fullMessages = await Promise.all(
        messages.map(async (msg) => {
            const details = await gmail.users.messages.get({
                userId: "me",
                id: msg.id!,
                format: "full",
            });
            return details.data;
        })
    );

    return fullMessages;
};
