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
            <div style={{ overflowX: "auto", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)", borderRadius: "0.5rem", background: "white" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead style={{ background: "#f3f4f6", borderBottom: "2px solid #e5e7eb" }}>
                        <tr>
                            <th style={{ padding: "1rem" }}>Name</th>
                            <th style={{ padding: "1rem" }}>Email</th>
                            <th style={{ padding: "1rem" }}>Phone</th>
                            <th style={{ padding: "1rem" }}>Status</th>
                            <th style={{ padding: "1rem" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contacts.map((contact) => (
                            <tr key={contact.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                                <td style={{ padding: "1rem" }}>{contact.firstName} {contact.lastName}</td>
                                <td style={{ padding: "1rem" }}>
                                    <a href={`mailto:${contact.email}`} style={{ color: "#2563eb" }}>{contact.email}</a>
                                </td>
                                <td style={{ padding: "1rem" }}>
                                    <a href={`tel:${contact.phone}`} style={{ color: "#374151" }}>{contact.phone}</a>
                                </td>
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
                                <td style={{ padding: "1rem" }}>
                                    <button
                                        onClick={() => handleEdit(contact)}
                                        style={{ color: "#4f46e5", background: "none", border: "none", cursor: "pointer", fontWeight: "600" }}
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
