import { NextResponse } from "next/server";
import { getMicrosoftAuthUrl } from "@/lib/microsoft-client";

export async function GET() {
    try {
        const authUrl = await getMicrosoftAuthUrl();
        return NextResponse.redirect(authUrl);
    } catch (error: any) {
        console.error("Microsoft OAuth error:", error);
        return new NextResponse(`Error: ${error.message}`, { status: 500 });
    }
}
