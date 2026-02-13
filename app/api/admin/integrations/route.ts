import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
    try {
        const integrations = await prisma.oAuthIntegration.findMany({
            select: {
                provider: true,
                providerEmail: true,
            },
        });

        const providers = ["google", "microsoft", "yahoo"];
        const result = providers.map((provider) => {
            const integration = integrations.find((i) => i.provider === provider);
            return {
                provider,
                providerEmail: integration?.providerEmail || null,
                connected: !!integration,
            };
        });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Failed to fetch integrations:", error);
        return new NextResponse(`Error: ${error.message}`, { status: 500 });
    }
}
