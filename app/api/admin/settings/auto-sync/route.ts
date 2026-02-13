import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
    try {
        const setting = await prisma.adminSetting.findUnique({
            where: { key: "autoSyncContacts" },
        });

        // Default to false if not set
        const autoSync = setting?.value === "true";

        return NextResponse.json({ autoSync });
    } catch (error) {
        console.error("Failed to fetch setting", error);
        return new NextResponse("Failed to fetch setting", { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { autoSync } = await req.json();

        await prisma.adminSetting.upsert({
            where: { key: "autoSyncContacts" },
            update: { value: String(autoSync) },
            create: { key: "autoSyncContacts", value: String(autoSync) },
        });

        return NextResponse.json({ success: true, autoSync });
    } catch (error) {
        console.error("Failed to save setting", error);
        return new NextResponse("Failed to save setting", { status: 500 });
    }
}
