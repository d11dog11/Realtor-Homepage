import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const { password } = await req.json();
        const setting = await prisma.adminSetting.findUnique({
            where: { key: "admin_password" },
        });

        const currentPassword = setting?.value || "1234";

        if (password === currentPassword) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ success: false }, { status: 401 });
        }
    } catch (error) {
        console.error(error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
