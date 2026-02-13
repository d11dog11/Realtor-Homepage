import { NextResponse } from "next/server";
import { importYahooContacts } from "@/lib/yahoo-client";

export async function POST() {
    try {
        const contacts = await importYahooContacts();
        console.log("Contacts pulled from Yahoo:", contacts);
        // Here you would simplify and save to DB
        // For now, return the raw data just to confirm connection
        return NextResponse.json({ success: true, count: contacts ? contacts.length : 0, contacts });
    } catch (error: any) {
        console.error("Failed to import contacts", error);
        return new NextResponse(`Error: ${error.message}`, { status: 500 });
    }
}
