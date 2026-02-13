import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { formatPhoneNumber } from "@/lib/utils";

export async function GET(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const contact = await prisma.contact.findUnique({
            where: { id: parseInt(id) },
        });

        if (!contact) {
            return new NextResponse("Contact not found", { status: 404 });
        }

        return NextResponse.json(contact);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PUT(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const body = await req.json();
        const { firstName, lastName, email, phone, status, birthdate, notes, optedOut } = body;

        const formattedPhone = formatPhoneNumber(phone);

        const contact = await prisma.contact.update({
            where: { id: parseInt(id) },
            data: {
                firstName,
                lastName,
                email,
                phone: formattedPhone,
                status,
                notes,
                birthdate: birthdate ? new Date(birthdate) : null,
                optedOut: optedOut || false,
            },
        });

        return NextResponse.json(contact);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        await prisma.contact.delete({
            where: { id: parseInt(id) },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}
