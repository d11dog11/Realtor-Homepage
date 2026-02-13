import { NextResponse } from "next/server";

const YAHOO_CLIENT_ID = process.env.YAHOO_CLIENT_ID;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
const REDIRECT_URI = `${APP_URL}/api/auth/yahoo/callback`;

export async function GET() {
    if (!YAHOO_CLIENT_ID) {
        return new NextResponse("Yahoo Client ID not configured", { status: 500 });
    }

    const scopes = ["openid", "sdct-w", "sdcw-w", "mail-w"];

    // Yahoo specific params
    const params = new URLSearchParams({
        client_id: YAHOO_CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        response_type: "code",
        scope: scopes.join(" "),
        nonce: Math.random().toString(36).substring(7),
    });

    return NextResponse.redirect(`https://api.login.yahoo.com/oauth2/request_auth?${params.toString()}`);
}
