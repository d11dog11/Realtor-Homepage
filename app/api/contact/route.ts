import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { formatPhoneNumber } from "@/lib/utils";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { firstName, lastName, phone, email, birthdate, notes } = body;

        if (!firstName || !lastName || !phone || !email) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const formattedPhone = formatPhoneNumber(phone);

        const contact = await prisma.contact.create({
            data: {
                firstName,
                lastName,
                phone: formattedPhone,
                email,
                status: "New",
                birthdate: birthdate ? new Date(birthdate) : null,
                notes,
            },
        });

        return NextResponse.json(contact);
    } catch (error) {
        console.error("[CONTACT_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
