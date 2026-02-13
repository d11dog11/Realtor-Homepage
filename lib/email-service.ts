import { prisma } from "./db";
import { sendYahooEmail } from "./yahoo-client";
import { sendGmailEmail } from "./gmail-client";
import { sendMicrosoftEmail } from "./microsoft-client";

/**
 * Gets the active email integration provider
 * Priority: Google > Microsoft > Yahoo
 */
export async function getActiveEmailProvider(): Promise<string | null> {
    const integrations = await prisma.oAuthIntegration.findMany({
        where: {
            provider: {
                in: ["google", "microsoft", "yahoo"],
            },
        },
        select: {
            provider: true,
        },
    });

    // Priority order: Google, Microsoft, Yahoo
    const priority = ["google", "microsoft", "yahoo"];

    for (const provider of priority) {
        if (integrations.some(i => i.provider === provider)) {
            return provider;
        }
    }

    return null;
}

/**
 * Send email using the first available provider
 * @param to - Recipient email address
 * @param subject - Email subject
 * @param html - Email body (HTML)
 * @param provider - Optional: specify which provider to use
 */
export async function sendEmail(
    to: string,
    subject: string,
    html: string,
    provider?: string
): Promise<{ success: boolean; provider: string; error?: string }> {
    try {
        // Determine which provider to use
        const selectedProvider = provider || await getActiveEmailProvider();

        if (!selectedProvider) {
            throw new Error("No email provider configured. Please connect an email account in Settings.");
        }

        // Send using the selected provider
        switch (selectedProvider) {
            case "google":
                await sendGmailEmail(to, subject, html);
                break;
            case "microsoft":
                await sendMicrosoftEmail(to, subject, html);
                break;
            case "yahoo":
                await sendYahooEmail(to, subject, html);
                break;
            default:
                throw new Error(`Unknown provider: ${selectedProvider}`);
        }

        return { success: true, provider: selectedProvider };
    } catch (error: any) {
        console.error(`Failed to send email:`, error);
        return {
            success: false,
            provider: provider || "unknown",
            error: error.message
        };
    }
}

/**
 * Get list of all configured email providers
 */
export async function getConfiguredProviders(): Promise<{
    provider: string;
    email: string | null;
}[]> {
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

    return integrations.map(i => ({
        provider: i.provider,
        email: i.providerEmail,
    }));
}

/**
 * Test email integration
 */
export async function testEmailIntegration(provider: string): Promise<boolean> {
    try {
        const integration = await prisma.oAuthIntegration.findUnique({
            where: { provider },
        });

        if (!integration || !integration.providerEmail) {
            return false;
        }

        // Send a test email to the provider's own email
        const result = await sendEmail(
            integration.providerEmail,
            "Test Email Integration",
            "<h1>Success!</h1><p>Your email integration is working correctly.</p>",
            provider
        );

        return result.success;
    } catch (error) {
        console.error(`Test email failed for ${provider}:`, error);
        return false;
    }
}
