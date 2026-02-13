import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Get all campaigns
export async function GET() {
    try {
        const campaigns = await prisma.emailCampaign.findMany({
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(campaigns);
    } catch (error) {
        console.error("[CAMPAIGNS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// Create new campaign
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, templateId, scheduledFor, recipientFilter } = body;

        const campaign = await prisma.emailCampaign.create({
            data: {
                name,
                templateId: parseInt(templateId),
                scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
                recipientFilter: recipientFilter || "all",
                status: scheduledFor ? "Scheduled" : "Draft",
            },
        });

        return NextResponse.json(campaign);
    } catch (error) {
        console.error("[CAMPAIGNS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
