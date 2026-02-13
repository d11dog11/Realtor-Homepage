import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

export async function GET() {
    try {
        await prisma.oAuthIntegration.delete({
            where: { provider: "microsoft" },
        });

        return NextResponse.redirect(`${APP_URL}/admin?microsoft_disconnected=true`);
    } catch (error: any) {
        console.error("Microsoft logout error:", error);
        return NextResponse.redirect(`${APP_URL}/admin?microsoft_error=${encodeURIComponent(error.message)}`);
    }
}
