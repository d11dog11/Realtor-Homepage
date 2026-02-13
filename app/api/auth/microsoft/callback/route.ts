import { NextResponse } from "next/server";
import { handleMicrosoftCallback } from "@/lib/microsoft-client";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    if (error) {
        console.error("Microsoft OAuth error:", error, errorDescription);
        return NextResponse.redirect(`${APP_URL}/admin?microsoft_error=${error}`);
    }

    if (!code) {
        return new NextResponse("Missing authorization code", { status: 400 });
    }

    try {
        const email = await handleMicrosoftCallback(code);
        return NextResponse.redirect(`${APP_URL}/admin?microsoft_connected=true&email=${email}`);
    } catch (error: any) {
        console.error("Microsoft callback error:", error);
        return NextResponse.redirect(`${APP_URL}/admin?microsoft_error=${encodeURIComponent(error.message)}`);
    }
}
