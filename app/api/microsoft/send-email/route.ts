import { NextResponse } from "next/server";
import { sendMicrosoftEmail } from "@/lib/microsoft-client";

export async function POST(req: Request) {
    try {
        const { to, subject, html } = await req.json();

        if (!to || !subject || !html) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        await sendMicrosoftEmail(to, subject, html);

        return NextResponse.json({ success: true, message: "Email sent successfully via Microsoft" });
    } catch (error: any) {
        console.error("Failed to send Microsoft email:", error);
        return new NextResponse(`Error: ${error.message}`, { status: 500 });
    }
}
