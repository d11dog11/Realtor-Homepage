import { prisma } from "@/lib/db";
import NewContactForm from "./NewContactForm";
import ContactList from "./ContactList";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function AdminContactsPage() {
    const contacts = await prisma.contact.findMany({
        orderBy: { createdAt: "desc" },
    });

    return (
        <div style={{ padding: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <h1 style={{ fontSize: "1.875rem", fontWeight: "bold", color: "#064e3b", margin: 0 }}>Contacts</h1>
                    <Link
                        href="/admin/settings#contacts"
                        style={{
                            fontSize: "0.875rem",
                            color: "#6b7280",
                            textDecoration: "none",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.25rem",
                            padding: "0.25rem 0.5rem",
                            borderRadius: "0.375rem",
                            background: "#f3f4f6",
                            transition: "all 0.2s"
                        }}
                    >
                        ⚙️ Settings
                    </Link>
                </div>
                <NewContactForm />
            </div>

            <ContactList contacts={contacts} />
        </div>
    );
}
