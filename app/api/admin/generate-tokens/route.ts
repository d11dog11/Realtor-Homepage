import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST() {
    try {
        // Get all contacts without unsubscribe tokens
        const contacts = await prisma.contact.findMany({
            where: {
                unsubscribeToken: null,
            },
        });

        let updated = 0;
        for (const contact of contacts) {
            await prisma.contact.update({
                where: { id: contact.id },
                data: { unsubscribeToken: crypto.randomUUID() },
            });
            updated++;
        }

        return NextResponse.json({
            success: true,
            message: `Generated tokens for ${updated} contacts`,
        });
    } catch (error) {
        console.error("[GENERATE_TOKENS]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
