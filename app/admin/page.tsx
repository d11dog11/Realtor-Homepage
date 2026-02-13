import { prisma } from "@/lib/db";
import NewContactForm from "./NewContactForm";
import ContactList from "./ContactList";
import ContactImporter from "./ContactImporter";

export const dynamic = 'force-dynamic';

export default async function AdminContactsPage() {
    const contacts = await prisma.contact.findMany({
        orderBy: { createdAt: "desc" },
    });

    return (
        <div style={{ padding: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "1.875rem", fontWeight: "bold", color: "#1e3a8a", margin: 0 }}>Contacts</h1>
                <NewContactForm />
            </div>

            <ContactList contacts={contacts} />
            <ContactImporter />
        </div>
    );
}
