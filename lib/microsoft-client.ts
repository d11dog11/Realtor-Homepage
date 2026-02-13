import { prisma } from "./db";
import { Client } from "@microsoft/microsoft-graph-client";
import { ConfidentialClientApplication } from "@azure/msal-node";

const MS_CLIENT_ID = process.env.MS_CLIENT_ID!;
const MS_CLIENT_SECRET = process.env.MS_CLIENT_SECRET!;
const MS_TENANT_ID = process.env.MS_TENANT_ID || "common"; // "common" for multi-tenant
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
const REDIRECT_URI = `${APP_URL}/api/auth/microsoft/callback`;

// Microsoft Graph scopes
const SCOPES = [
    "openid",
    "profile",
    "email",
    "offline_access",
    "Mail.Send",
    "Mail.Read",
    "Calendars.ReadWrite",
    "Contacts.ReadWrite",
    "User.Read",
];

const msalConfig = {
    auth: {
        clientId: MS_CLIENT_ID,
        authority: `https://login.microsoftonline.com/${MS_TENANT_ID}`,
        clientSecret: MS_CLIENT_SECRET,
    },
};

export const getMicrosoftAuthUrl = () => {
    const cca = new ConfidentialClientApplication(msalConfig);

    const authCodeUrlParameters = {
        scopes: SCOPES,
        redirectUri: REDIRECT_URI,
    };

    return cca.getAuthCodeUrl(authCodeUrlParameters);
};

export const handleMicrosoftCallback = async (code: string) => {
    const cca = new ConfidentialClientApplication(msalConfig);

    const tokenRequest = {
        code,
        scopes: SCOPES,
        redirectUri: REDIRECT_URI,
    };

    const response = await cca.acquireTokenByCode(tokenRequest);

    if (!response) {
        throw new Error("Failed to acquire token");
    }

    const { accessToken, refreshToken, expiresOn, account } = response as any;
    const email = account?.username || null;

    // Save/Update in DB
    await prisma.oAuthIntegration.upsert({
        where: { provider: "microsoft" },
        update: {
            accessToken: accessToken,
            refreshToken: refreshToken || "",
            expiresAt: expiresOn || new Date(Date.now() + 3600 * 1000),
            providerEmail: email,
        },
        create: {
            provider: "microsoft",
            accessToken: accessToken,
            refreshToken: refreshToken || "",
            expiresAt: expiresOn || new Date(Date.now() + 3600 * 1000),
            providerEmail: email,
        },
    });

    return email;
};

export const getMicrosoftIntegration = async () => {
    const integration = await prisma.oAuthIntegration.findUnique({
        where: { provider: "microsoft" },
    });

    if (!integration) {
        throw new Error("Microsoft integration not configured");
    }

    // Refresh if expired (with 5 min buffer)
    if (new Date() > new Date(integration.expiresAt.getTime() - 5 * 60 * 1000)) {
        return await refreshMicrosoftToken(integration);
    }

    return integration;
};

const refreshMicrosoftToken = async (integration: any) => {
    try {
        const cca = new ConfidentialClientApplication(msalConfig);

        const tokenRequest = {
            refreshToken: integration.refreshToken,
            scopes: SCOPES,
        };

        const response = await cca.acquireTokenByRefreshToken(tokenRequest) as any;

        if (!response) {
            throw new Error("Failed to refresh token");
        }

        const updated = await prisma.oAuthIntegration.update({
            where: { provider: "microsoft" },
            data: {
                accessToken: response.accessToken,
                refreshToken: response.refreshToken || integration.refreshToken,
                expiresAt: response.expiresOn || new Date(Date.now() + 3600 * 1000),
            },
        });

        return updated;
    } catch (error) {
        console.error("Failed to refresh Microsoft token", error);
        throw new Error("Failed to refresh Microsoft token");
    }
};

const getGraphClient = async () => {
    const integration = await getMicrosoftIntegration();

    const client = Client.init({
        authProvider: (done) => {
            done(null, integration.accessToken);
        },
    });

    return client;
};

// --- Email Capabilities ---

export const sendMicrosoftEmail = async (to: string, subject: string, html: string) => {
    const client = await getGraphClient();

    const sendMail = {
        message: {
            subject: subject,
            body: {
                contentType: "HTML",
                content: html,
            },
            toRecipients: [
                {
                    emailAddress: {
                        address: to,
                    },
                },
            ],
        },
        saveToSentItems: "true",
    };

    await client.api("/me/sendMail").post(sendMail);
};

// --- Calendar Capabilities ---

export const createMicrosoftCalendarEvent = async (
    title: string,
    startDate: Date,
    endDate: Date,
    description?: string,
    attendees?: string[]
) => {
    const client = await getGraphClient();

    const event = {
        subject: title,
        body: {
            contentType: "HTML",
            content: description || "",
        },
        start: {
            dateTime: startDate.toISOString(),
            timeZone: "Eastern Standard Time",
        },
        end: {
            dateTime: endDate.toISOString(),
            timeZone: "Eastern Standard Time",
        },
        attendees: attendees?.map(email => ({
            emailAddress: {
                address: email,
            },
            type: "required",
        })) || [],
    };

    const response = await client.api("/me/calendar/events").post(event);

    return response;
};

export const listMicrosoftCalendarEvents = async (maxResults: number = 10) => {
    const client = await getGraphClient();

    const response = await client
        .api("/me/calendar/events")
        .top(maxResults)
        .orderby("start/dateTime")
        .get();

    return response.value || [];
};

// --- Contacts Capabilities ---

export const importMicrosoftContacts = async () => {
    const client = await getGraphClient();

    const response = await client
        .api("/me/contacts")
        .top(100)
        .select("givenName,surname,emailAddresses,mobilePhone,birthday")
        .get();

    const contacts = (response.value || []).map((contact: any) => {
        const email = contact.emailAddresses?.[0]?.address;
        const phone = contact.mobilePhone || "";
        const birthdate = contact.birthday ? new Date(contact.birthday) : null;

        return {
            firstName: contact.givenName || "",
            lastName: contact.surname || "",
            email: email || "",
            phone: phone,
            birthdate: birthdate,
        };
    }).filter((c: any) => c.email); // Only keep contacts with email

    return contacts;
};

export const getMicrosoftEmails = async (maxResults: number = 10, filter?: string) => {
    const client = await getGraphClient();

    let query = client.api("/me/messages").top(maxResults).orderby("receivedDateTime DESC");

    if (filter) {
        query = query.filter(filter);
    }

    const response = await query.get();

    return response.value || [];
};

// --- Additional Helper Functions ---

export const getMicrosoftUserProfile = async () => {
    const client = await getGraphClient();
    const profile = await client.api("/me").get();
    return profile;
};

export const createMicrosoftContact = async (contact: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
}) => {
    const client = await getGraphClient();

    const newContact = {
        givenName: contact.firstName,
        surname: contact.lastName,
        emailAddresses: [
            {
                address: contact.email,
                name: `${contact.firstName} ${contact.lastName}`,
            },
        ],
        mobilePhone: contact.phone,
    };

    const response = await client.api("/me/contacts").post(newContact);
    return response;
};
