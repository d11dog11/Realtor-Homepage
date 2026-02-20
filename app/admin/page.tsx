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
        <div style={{ padding: "0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                    <h1 style={{ fontSize: "2rem", fontWeight: "700", color: "#f0fdf4", margin: 0, letterSpacing: "-0.025em" }}>Contacts</h1>
                    <Link
                        href="/admin/settings#contacts"
                        style={{
                            fontSize: "0.875rem",
                            color: "#d1fae5",
                            textDecoration: "none",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            padding: "0.5rem 1rem",
                            borderRadius: "0.5rem",
                            background: "rgba(16, 185, 129, 0.1)",
                            border: "1px solid rgba(16, 185, 129, 0.3)",
                            transition: "all 0.3s ease",
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
