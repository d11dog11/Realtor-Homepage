import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { firstName, lastName, phone, email } = body;

        if (!firstName || !lastName || !phone || !email) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const contact = await prisma.contact.create({
            data: {
                firstName,
                lastName,
                phone,
                email,
                status: "New",
            },
        });

        return NextResponse.json(contact);
    } catch (error) {
        console.error("[CONTACT_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
