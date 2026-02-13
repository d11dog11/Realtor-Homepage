import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import nodemailer from "nodemailer";

async function getEmailTransporter() {
    const integration = await prisma.oAuthIntegration.findUnique({
        where: { provider: "yahoo" },
    });

    if (!integration) {
        throw new Error("No email integration found");
    }

    return nodemailer.createTransport({
        host: "smtp.mail.yahoo.com",
        port: 465,
        secure: true,
        auth: {
            type: "OAuth2",
            user: integration.providerEmail!,
            accessToken: integration.accessToken,
            refreshToken: integration.refreshToken,
        },
    });
}

export async function POST(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const campaignId = parseInt(id);

        const campaign = await prisma.emailCampaign.findUnique({
            where: { id: campaignId },
        });

        if (!campaign) {
            return new NextResponse("Campaign not found", { status: 404 });
        }

        const template = await prisma.emailTemplate.findUnique({
            where: { id: campaign.templateId },
        });

        if (!template) {
            return new NextResponse("Template not found", { status: 404 });
        }

        // Get contacts based on filter
        let contacts;
        if (campaign.recipientFilter === "birthday") {
            const today = new Date();
            const month = today.getMonth() + 1;
            const day = today.getDate();

            // Get all contacts and filter in JavaScript since SQLite doesn't support MONTH/DAY functions
            const allContacts = await prisma.contact.findMany({
                where: {
                    optedOut: false,
                    birthdate: { not: null },
                },
            });

            contacts = allContacts.filter(contact => {
                if (!contact.birthdate) return false;
                const bd = new Date(contact.birthdate);
                return bd.getMonth() + 1 === month && bd.getDate() === day;
            });
        } else {
            contacts = await prisma.contact.findMany({
                where: { optedOut: false },
            });
        }

        const transporter = await getEmailTransporter();
        let sentCount = 0;

        // Update campaign status
        await prisma.emailCampaign.update({
            where: { id: campaignId },
            data: { status: "Sending" },
        });

        for (const contact of contacts) {
            try {
                // Generate unsubscribe token if not exists
                if (!contact.unsubscribeToken) {
                    const token = crypto.randomUUID();
                    await prisma.contact.update({
                        where: { id: contact.id },
                        data: { unsubscribeToken: token },
                    });
                    contact.unsubscribeToken = token;
                }

                const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/unsubscribe/${contact.unsubscribeToken}`;

                // Replace variables in template
                let emailBody = template.body
                    .replace(/\{\{firstName\}\}/g, contact.firstName)
                    .replace(/\{\{lastName\}\}/g, contact.lastName)
                    .replace(/\{\{email\}\}/g, contact.email);

                // Add unsubscribe link at the bottom
                emailBody += `
                    <hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;">
                    <p style="font-size: 12px; color: #666; text-align: center;">
                        If you no longer wish to receive these emails, 
                        <a href="${unsubscribeUrl}" style="color: #666; text-decoration: underline;">click here to unsubscribe</a>.
                    </p>
                `;

                await transporter.sendMail({
                    from: process.env.YAHOO_EMAIL,
                    to: contact.email,
                    subject: template.subject
                        .replace(/\{\{firstName\}\}/g, contact.firstName)
                        .replace(/\{\{lastName\}\}/g, contact.lastName),
                    html: emailBody,
                });

                // Log successful send
                await prisma.emailLog.create({
                    data: {
                        contactId: contact.id,
                        campaignId: campaignId,
                        subject: template.subject,
                        success: true,
                    },
                });

                sentCount++;
            } catch (error: any) {
                console.error(`Failed to send to ${contact.email}:`, error);

                // Log failed send
                await prisma.emailLog.create({
                    data: {
                        contactId: contact.id,
                        campaignId: campaignId,
                        subject: template.subject,
                        success: false,
                        errorMessage: error.message,
                    },
                });
            }
        }

        // Update campaign as sent
        await prisma.emailCampaign.update({
            where: { id: campaignId },
            data: {
                status: "Sent",
                sentCount,
            },
        });

        return NextResponse.json({
            success: true,
            sentCount,
            totalContacts: contacts.length,
        });
    } catch (error: any) {
        console.error("[CAMPAIGN_SEND]", error);

        // Update campaign as failed
        const { id } = await context.params;
        await prisma.emailCampaign.update({
            where: { id: parseInt(id) },
            data: { status: "Failed" },
        });

        return new NextResponse(error.message || "Internal Error", { status: 500 });
    }
}
