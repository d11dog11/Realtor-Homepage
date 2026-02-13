import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function DELETE(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        await prisma.emailTemplate.delete({
            where: { id: parseInt(id) },
        });
        return NextResponse.json({ success: true });
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
        const { name, subject, body: content } = body;

        const template = await prisma.emailTemplate.update({
            where: { id: parseInt(id) },
            data: {
                name,
                subject,
                body: content,
            },
        });
        return NextResponse.json(template);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}
