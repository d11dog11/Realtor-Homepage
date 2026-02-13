import { NextResponse } from "next/server";
import { handleGoogleCallback } from "@/lib/gmail-client";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
        console.error("Google OAuth error:", error);
        return NextResponse.redirect(`${APP_URL}/admin?google_error=${error}`);
    }

    if (!code) {
        return new NextResponse("Missing authorization code", { status: 400 });
    }

    try {
        const email = await handleGoogleCallback(code);
        return NextResponse.redirect(`${APP_URL}/admin?google_connected=true&email=${email}`);
    } catch (error: any) {
        console.error("Google callback error:", error);
        return NextResponse.redirect(`${APP_URL}/admin?google_error=${encodeURIComponent(error.message)}`);
    }
}
