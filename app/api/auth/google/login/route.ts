import { NextResponse } from "next/server";
import { getGoogleAuthUrl } from "@/lib/gmail-client";

export async function GET() {
    try {
        const authUrl = getGoogleAuthUrl();
        return NextResponse.redirect(authUrl);
    } catch (error: any) {
        console.error("Google OAuth error:", error);
        return new NextResponse(`Error: ${error.message}`, { status: 500 });
    }
}
