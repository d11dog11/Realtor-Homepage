import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Get single campaign
export async function GET(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const campaign = await prisma.emailCampaign.findUnique({
            where: { id: parseInt(id) },
        });

        if (!campaign) {
            return new NextResponse("Campaign not found", { status: 404 });
        }

        return NextResponse.json(campaign);
    } catch (error) {
        console.error("[CAMPAIGN_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// Update campaign
export async function PUT(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const body = await req.json();
        const { name, templateId, scheduledFor, recipientFilter, status } = body;

        const campaign = await prisma.emailCampaign.update({
            where: { id: parseInt(id) },
            data: {
                name,
                templateId: templateId ? parseInt(templateId) : undefined,
                scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
                recipientFilter: recipientFilter || "all",
                status: status || undefined,
            },
        });

        return NextResponse.json(campaign);
    } catch (error) {
        console.error("[CAMPAIGN_PUT]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// Delete campaign
export async function DELETE(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

        // Check if campaign has been sent
        const campaign = await prisma.emailCampaign.findUnique({
            where: { id: parseInt(id) },
        });

        if (campaign?.status === "Sent" || campaign?.status === "Sending") {
            return new NextResponse("Cannot delete a campaign that has been sent or is currently sending", { status: 400 });
        }

        // Delete associated email logs first
        await prisma.emailLog.deleteMany({
            where: { campaignId: parseInt(id) },
        });

        // Delete campaign
        await prisma.emailCampaign.delete({
            where: { id: parseInt(id) },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[CAMPAIGN_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
