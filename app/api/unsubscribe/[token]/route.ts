import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
    req: Request,
    context: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await context.params;

        const contact = await prisma.contact.findUnique({
            where: { unsubscribeToken: token },
        });

        if (!contact) {
            return new NextResponse("Invalid unsubscribe link", { status: 404 });
        }

        await prisma.contact.update({
            where: { id: contact.id },
            data: { optedOut: true },
        });

        return new NextResponse(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Unsubscribed</title>
                <style>
                    body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
                    h1 { color: #1e3a8a; }
                    p { color: #6b7280; line-height: 1.6; }
                </style>
            </head>
            <body>
                <h1>✓ Successfully Unsubscribed</h1>
                <p>You have been removed from our mailing list and will no longer receive emails from us.</p>
                <p>If this was a mistake, please contact us directly.</p>
            </body>
            </html>
        `, {
            headers: { "Content-Type": "text/html" }
        });
    } catch (error) {
        console.error("[UNSUBSCRIBE_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
