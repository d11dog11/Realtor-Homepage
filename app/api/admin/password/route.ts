import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { oldPassword, newPassword } = body;

        const setting = await prisma.adminSetting.findUnique({
            where: { key: "admin_password" },
        });

        const currentPassword = setting?.value || "1234";

        if (oldPassword !== currentPassword) {
            return NextResponse.json({ message: "Incorrect current password" }, { status: 401 });
        }

        await prisma.adminSetting.upsert({
            where: { key: "admin_password" },
            update: { value: newPassword },
            create: { key: "admin_password", value: newPassword },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
