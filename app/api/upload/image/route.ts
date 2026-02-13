import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const fileType = formData.get("type") as string; // 'image' or 'pdf'

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Validate file type based on upload type
        let allowedTypes: string[];
        let subDir: string;

        if (fileType === "pdf") {
            allowedTypes = ["application/pdf"];
            subDir = "pdfs";
        } else {
            allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
            subDir = "email-templates";
        }

        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({
                error: `Invalid file type. Expected ${fileType === "pdf" ? "PDF" : "image"}.`
            }, { status: 400 });
        }

        // Validate file size (10MB max for PDFs, 5MB for images)
        const maxSize = fileType === "pdf" ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json({
                error: `File size too large. Max ${fileType === "pdf" ? "10MB" : "5MB"}.`
            }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create unique filename
        const timestamp = Date.now();
        const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const filename = `${timestamp}-${originalName}`;

        // Create upload directory if it doesn't exist
        const uploadDir = path.join(process.cwd(), "public", "uploads", subDir);
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        // Write file
        const filepath = path.join(uploadDir, filename);
        await writeFile(filepath, buffer);

        // Return public URL
        const publicUrl = `/uploads/${subDir}/${filename}`;

        return NextResponse.json({
            success: true,
            url: publicUrl,
            filename: filename,
            fileType: fileType
        });
    } catch (error) {
        console.error("[UPLOAD_FILE]", error);
        return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
    }
}
