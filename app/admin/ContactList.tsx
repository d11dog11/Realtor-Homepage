"use client";

import { useState } from "react";
import EditContactModal from "./EditContactModal";

interface Contact {
    id: number;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    status: string;
    birthdate?: Date | string | null;
    notes?: string | null;
    createdAt: Date;
}

export default function ContactList({ contacts }: { contacts: Contact[] }) {
    const [editingContact, setEditingContact] = useState<Contact | null>(null);

    const handleEdit = (contact: Contact) => {
        setEditingContact(contact);
    };

    const handleClose = () => {
        setEditingContact(null);
    };

    return (
        <div style={{ padding: "0" }}>
            <div style={{ overflowX: "auto", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.4)", borderRadius: "1rem", background: "#064e3b", border: "1px solid #10b981" }}>
                <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0", textAlign: "left" }}>
                    <thead style={{ background: "rgba(16, 185, 129, 0.1)" }}>
                        <tr>
                            <th style={{ padding: "1.25rem", color: "#d1fae5", fontWeight: "700", textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.05em" }}>Name</th>
                            <th style={{ padding: "1.25rem", color: "#d1fae5", fontWeight: "700", textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.05em" }}>Email</th>
                            <th style={{ padding: "1.25rem", color: "#d1fae5", fontWeight: "700", textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.05em" }}>Phone</th>
                            <th style={{ padding: "1.25rem", color: "#d1fae5", fontWeight: "700", textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.05em" }}>Status</th>
                            <th style={{ padding: "1.25rem", color: "#d1fae5", fontWeight: "700", textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.05em" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contacts.map((contact, idx) => (
                            <tr key={contact.id} style={{ borderTop: "1px solid rgba(16, 185, 129, 0.1)", background: idx % 2 === 0 ? "transparent" : "rgba(0, 0, 0, 0.1)" }}>
                                <td style={{ padding: "1.25rem", color: "#f0fdf4", fontWeight: "500" }}>{contact.firstName} {contact.lastName}</td>
                                <td style={{ padding: "1.25rem" }}>
                                    <a href={`mailto:${contact.email}`} style={{ color: "#34d399", textDecoration: "none" }}>{contact.email}</a>
                                </td>
                                <td style={{ padding: "1.25rem" }}>
                                    <a href={`tel:${contact.phone}`} style={{ color: "#d1fae5", textDecoration: "none", opacity: "0.9" }}>{contact.phone}</a>
                                </td>
                                <td style={{ padding: "1.25rem" }}>
                                    <span style={{
                                        padding: "0.375rem 0.75rem",
                                        borderRadius: "2rem",
                                        fontSize: "0.75rem",
                                        background: contact.status === 'New' ? '#10b981' : 'rgba(16, 185, 129, 0.1)',
                                        color: contact.status === 'New' ? '#022c22' : '#d1fae5',
                                        fontWeight: 700,
                                        border: contact.status === 'New' ? 'none' : '1px solid rgba(16, 185, 129, 0.2)'
                                    }}>
                                        {contact.status}
                                    </span>
                                </td>
                                <td style={{ padding: "1.25rem" }}>
                                    <button
                                        onClick={() => handleEdit(contact)}
                                        style={{ color: "#34d399", background: "none", border: "none", cursor: "pointer", fontWeight: "700", fontSize: "0.875rem" }}
                                    >
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {editingContact && (
                <EditContactModal
                    contact={editingContact}
                    onClose={handleClose}
                />
            )}
        </div>
    );
}
