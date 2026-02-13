import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { importGoogleContacts } from "@/lib/gmail-client";
import { importMicrosoftContacts } from "@/lib/microsoft-client";
import { importYahooContacts } from "@/lib/yahoo-client";

export async function POST(req: Request) {
    try {
        const { provider } = await req.json();

        if (!provider) {
            return new NextResponse("Provider is required", { status: 400 });
        }

        let contacts: any[] = [];

        // Import contacts from the specified provider
        switch (provider) {
            case "google":
                contacts = await importGoogleContacts();
                break;
            case "microsoft":
                contacts = await importMicrosoftContacts();
                break;
            case "yahoo":
                contacts = await importYahooContacts();
                break;
            default:
                return new NextResponse("Invalid provider", { status: 400 });
        }

        // Filter out contacts without email (required field)
        const validContacts = contacts.filter(c => c.email);

        // Import contacts to database
        let importedCount = 0;
        let skippedCount = 0;
        let updatedCount = 0;

        for (const contact of validContacts) {
            try {
                // Check if contact already exists by email
                const existing = await prisma.contact.findFirst({
                    where: { email: contact.email },
                });

                if (existing) {
                    // Update existing contact if data is different
                    if (
                        existing.firstName !== contact.firstName ||
                        existing.lastName !== contact.lastName ||
                        existing.phone !== contact.phone
                    ) {
                        await prisma.contact.update({
                            where: { id: existing.id },
                            data: {
                                firstName: contact.firstName || existing.firstName,
                                lastName: contact.lastName || existing.lastName,
                                phone: contact.phone || existing.phone,
                                birthdate: contact.birthdate || existing.birthdate,
                            },
                        });
                        updatedCount++;
                    } else {
                        skippedCount++;
                    }
                } else {
                    // Create new contact
                    await prisma.contact.create({
                        data: {
                            firstName: contact.firstName || "Unknown",
                            lastName: contact.lastName || "",
                            email: contact.email,
                            phone: contact.phone || "",
                            birthdate: contact.birthdate,
                            status: "New",
                        },
                    });
                    importedCount++;
                }
            } catch (error) {
                console.error(`Failed to import contact ${contact.email}:`, error);
                skippedCount++;
            }
        }

        return NextResponse.json({
            success: true,
            message: `Import complete from ${provider}`,
            imported: importedCount,
            updated: updatedCount,
            skipped: skippedCount,
            total: validContacts.length,
        });
    } catch (error: any) {
        console.error("Contact import error:", error);
        return new NextResponse(`Error: ${error.message}`, { status: 500 });
    }
}

// Get import status
export async function GET() {
    try {
        const integrations = await prisma.oAuthIntegration.findMany({
            where: {
                provider: {
                    in: ["google", "microsoft", "yahoo"],
                },
            },
            select: {
                provider: true,
                providerEmail: true,
            },
        });

        return NextResponse.json({
            availableProviders: integrations.map(i => ({
                provider: i.provider,
                email: i.providerEmail,
            })),
        });
    } catch (error: any) {
        console.error("Failed to get import status:", error);
        return new NextResponse(`Error: ${error.message}`, { status: 500 });
    }
}
