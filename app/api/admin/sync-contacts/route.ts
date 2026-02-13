import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createGoogleContact, importGoogleContacts } from "@/lib/gmail-client";
import { createMicrosoftContact, importMicrosoftContacts } from "@/lib/microsoft-client";
import { createYahooContact, importYahooContacts } from "@/lib/yahoo-client";

export async function POST(req: Request) {
    try {
        const { provider } = await req.json();

        if (!provider) {
            return new NextResponse("Provider is required", { status: 400 });
        }

        // 1. Get all local contacts
        const localContacts = await prisma.contact.findMany();

        if (localContacts.length === 0) {
            return NextResponse.json({ message: "No local contacts to sync", syncedCount: 0 });
        }

        // 2. Fetch remote contacts to avoid duplicates
        let remoteContacts: any[] = [];
        try {
            if (provider === "google") {
                remoteContacts = await importGoogleContacts();
            } else if (provider === "microsoft") {
                remoteContacts = await importMicrosoftContacts();
            } else if (provider === "yahoo") {
                remoteContacts = await importYahooContacts();
            } else {
                return new NextResponse("Invalid provider", { status: 400 });
            }
        } catch (error) {
            console.error(`Failed to fetch remote contacts from ${provider}`, error);
            return NextResponse.json({
                success: false,
                message: `Failed to connect to ${provider} to check for duplicates. Please ensure the integration is connected.`
            }, { status: 500 });
        }

        const remoteEmails = new Set(remoteContacts.map((c: any) => c.email?.toLowerCase()));

        let syncedCount = 0;
        let errors = 0;

        // 3. Sync contacts that don't exist remotely
        for (const contact of localContacts) {
            if (!contact.email) continue;

            // Skip if already exists remotely
            if (remoteEmails.has(contact.email.toLowerCase())) {
                continue;
            }

            try {
                if (provider === "google") {
                    await createGoogleContact(contact);
                } else if (provider === "microsoft") {
                    await createMicrosoftContact(contact);
                } else if (provider === "yahoo") {
                    await createYahooContact(contact);
                }
                syncedCount++;
            } catch (error) {
                console.error(`Failed to sync contact ${contact.email} to ${provider}`, error);
                errors++;
            }
        }

        return NextResponse.json({
            success: true,
            message: `Synced ${syncedCount} new contacts to ${provider}`,
            syncedCount,
            errors,
            totalLocal: localContacts.length
        });

    } catch (error: any) {
        console.error("Sync failed:", error);
        return new NextResponse(`Sync failed: ${error.message}`, { status: 500 });
    }
}
