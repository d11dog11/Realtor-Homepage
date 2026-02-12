import { prisma } from "@/lib/db";
import Link from "next/link";

// Ensure this page is always dynamic so we see new contacts immediately
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
    const contacts = await prisma.contact.findMany({
        orderBy: { createdAt: "desc" },
    });

    return (
        <main className="container" style={{ padding: "4rem 1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <h1 style={{ margin: 0 }}>Admin Console</h1>
                <Link href="/" className="btn btn-secondary" style={{ textDecoration: "none" }}>Back to Site</Link>
            </div>

            <div style={{ overflowX: "auto", boxShadow: "var(--shadow-md)", borderRadius: "var(--border-radius)", background: "white" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead style={{ background: "var(--color-bg-alt)", borderBottom: "2px solid var(--color-border)" }}>
                        <tr>
                            <th style={{ padding: "1rem" }}>Name</th>
                            <th style={{ padding: "1rem" }}>Email</th>
                            <th style={{ padding: "1rem" }}>Phone</th>
                            <th style={{ padding: "1rem" }}>Date</th>
                            <th style={{ padding: "1rem" }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contacts.map((contact) => (
                            <tr key={contact.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                                <td style={{ padding: "1rem" }}>{contact.firstName} {contact.lastName}</td>
                                <td style={{ padding: "1rem" }}>
                                    <a href={`mailto:${contact.email}`} style={{ color: "var(--color-primary)" }}>{contact.email}</a>
                                </td>
                                <td style={{ padding: "1rem" }}>
                                    <a href={`tel:${contact.phone}`} style={{ color: "var(--color-text)" }}>{contact.phone}</a>
                                </td>
                                <td style={{ padding: "1rem" }}>{new Date(contact.createdAt).toLocaleDateString()}</td>
                                <td style={{ padding: "1rem" }}>
                                    <span style={{
                                        padding: "0.25rem 0.5rem",
                                        borderRadius: "4px",
                                        fontSize: "0.85rem",
                                        background: contact.status === 'New' ? '#dcfce7' : '#f3f4f6',
                                        color: contact.status === 'New' ? '#166534' : '#374151',
                                        fontWeight: 600
                                    }}>
                                        {contact.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {contacts.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-light)" }}>No contacts yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </main>
    );
}
