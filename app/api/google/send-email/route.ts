import { NextResponse } from "next/server";
import { sendGmailEmail } from "@/lib/gmail-client";

export async function POST(req: Request) {
    try {
        const { to, subject, html } = await req.json();

        if (!to || !subject || !html) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        await sendGmailEmail(to, subject, html);

        return NextResponse.json({ success: true, message: "Email sent successfully via Gmail" });
    } catch (error: any) {
        console.error("Failed to send Gmail email:", error);
        return new NextResponse(`Error: ${error.message}`, { status: 500 });
    }
}
