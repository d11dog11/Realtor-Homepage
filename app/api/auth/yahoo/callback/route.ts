import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import axios from "axios";

// This callback handles the return from Yahoo with 'code'
const YAHOO_CLIENT_ID = process.env.YAHOO_CLIENT_ID!;
const YAHOO_CLIENT_SECRET = process.env.YAHOO_CLIENT_SECRET!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
const REDIRECT_URI = `${APP_URL}/api/auth/yahoo/callback`;

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
        return new NextResponse("Missing authorization code", { status: 400 });
    }

    try {
        // Exchange code for tokens
        const tokenUrl = "https://api.login.yahoo.com/oauth2/get_token";
        const body = new URLSearchParams({
            grant_type: "authorization_code",
            redirect_uri: REDIRECT_URI,
            code,
        });

        // Basic Auth header
        const authHeader = Buffer.from(`${YAHOO_CLIENT_ID}:${YAHOO_CLIENT_SECRET}`).toString("base64");

        const tokenRes = await axios.post(tokenUrl, body, {
            headers: {
                "Authorization": `Basic ${authHeader}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });

        const { access_token, refresh_token, expires_in, id_token } = tokenRes.data;

        // Decode ID Token to get email if possible, or fetch UserInfo
        let email = null;
        if (id_token) {
            try {
                const payload = JSON.parse(Buffer.from(id_token.split('.')[1], 'base64').toString());
                email = payload.email;
            } catch (e) {
                console.error("Failed to decode ID token", e);
            }
        }

        if (!email) {
            // Fetch UserInfo if email not in ID token
            try {
                const userInfoRes = await axios.get("https://api.login.yahoo.com/openid/v1/userinfo", {
                    headers: { Authorization: `Bearer ${access_token}` },
                });
                email = userInfoRes.data.email;
            } catch (e) {
                console.error("Failed to fetch user info", e);
            }
        }

        // Save to DB
        await prisma.oAuthIntegration.upsert({
            where: { provider: "yahoo" },
            update: {
                accessToken: access_token,
                refreshToken: refresh_token,
                expiresAt: new Date(Date.now() + expires_in * 1000),
                providerEmail: email,
            },
            create: {
                provider: "yahoo",
                accessToken: access_token,
                refreshToken: refresh_token,
                expiresAt: new Date(Date.now() + expires_in * 1000),
                providerEmail: email,
            },
        });

        // Redirect back to Admin Console with success message
        return NextResponse.redirect(`${APP_URL}/admin?yahoo_connected=true`);
    } catch (error: any) {
        console.error("Yahoo OAuth specific error:", error.response?.data || error.message);
        return new NextResponse(`Yahoo Authentication Failed. Details: ${JSON.stringify(error.response?.data || error.message)}`, { status: 500 });
    }
}
