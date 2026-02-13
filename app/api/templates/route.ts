import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
    try {
        const templates = await prisma.emailTemplate.findMany({
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(templates);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, subject, body: content } = body;

        const template = await prisma.emailTemplate.create({
            data: {
                name,
                subject,
                body: content,
            },
        });
        return NextResponse.json(template);
    } catch (error) {
        console.error(error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
