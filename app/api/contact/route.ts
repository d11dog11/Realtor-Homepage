import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { formatPhoneNumber } from "@/lib/utils";
import { createGoogleContact } from "@/lib/gmail-client";
import { createMicrosoftContact } from "@/lib/microsoft-client";
import { createYahooContact } from "@/lib/yahoo-client";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { firstName, lastName, phone, email, birthdate, notes } = body;

        if (!firstName || !lastName || !phone || !email) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const formattedPhone = formatPhoneNumber(phone);

        const contact = await prisma.contact.create({
            data: {
                firstName,
                lastName,
                phone: formattedPhone,
                email,
                status: "New",
                birthdate: birthdate ? new Date(birthdate) : null,
                notes,
            },
        });

        // --- Auto-Sync Logic ---
        try {
            const autoSyncSetting = await prisma.adminSetting.findUnique({
                where: { key: "autoSyncContacts" },
            });

            if (autoSyncSetting?.value === "true") {
                const integrations = await prisma.oAuthIntegration.findMany();

                for (const integration of integrations) {
                    try {
                        console.log(`Auto-syncing contact to ${integration.provider}...`);
                        if (integration.provider === "google") {
                            await createGoogleContact(contact);
                        } else if (integration.provider === "microsoft") {
                            await createMicrosoftContact(contact);
                        } else if (integration.provider === "yahoo") {
                            await createYahooContact(contact);
                        }
                    } catch (syncError) {
                        console.error(`Auto-sync failed for ${integration.provider}:`, syncError);
                        // Continue to other integrations even if one fails
                    }
                }
            }
        } catch (settingError) {
            console.error("Failed to check auto-sync settings:", settingError);
        }
        // -----------------------

        return NextResponse.json(contact);
    } catch (error) {
        console.error("[CONTACT_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
