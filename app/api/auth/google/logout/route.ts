import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

export async function GET() {
    try {
        await prisma.oAuthIntegration.delete({
            where: { provider: "google" },
        });

        return NextResponse.redirect(`${APP_URL}/admin?google_disconnected=true`);
    } catch (error: any) {
        console.error("Google logout error:", error);
        return NextResponse.redirect(`${APP_URL}/admin?google_error=${encodeURIComponent(error.message)}`);
    }
}
