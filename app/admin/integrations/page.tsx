import { prisma } from "@/lib/db";
import YahooIntegration from "../YahooIntegration";

export const dynamic = 'force-dynamic';

export default async function IntegrationsPage() {
    const yahooIntegration = await prisma.oAuthIntegration.findUnique({
        where: { provider: "yahoo" },
    });

    return (
        <div style={{ padding: "2rem" }}>
            <h1 style={{ fontSize: "1.875rem", fontWeight: "bold", color: "#1e3a8a", marginBottom: "2rem" }}>Integrations</h1>
            <YahooIntegration
                isConnected={!!yahooIntegration}
                providerEmail={yahooIntegration?.providerEmail || null}
            />
        </div>
    );
}
