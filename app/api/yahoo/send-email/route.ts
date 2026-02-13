import { NextResponse } from "next/server";
import { sendYahooEmail } from "@/lib/yahoo-client";

export async function POST(req: Request) {
    try {
        const { to, subject, html } = await req.json();

        if (!to || !subject || !html) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        await sendYahooEmail(to, subject, html);

        return NextResponse.json({ success: true, message: "Email sent successfully" });
    } catch (error: any) {
        console.error("Failed to send email", error);
        return new NextResponse(`Error: ${error.message}`, { status: 500 });
    }
}
