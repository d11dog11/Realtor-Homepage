"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Contact {
    id: number;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    status: string;
    birthdate?: Date | string | null;
    notes?: string | null;
    optedOut?: boolean;
    createdAt: Date;
}

interface EditContactModalProps {
    contact: Contact;
    onClose: () => void;
}

export default function EditContactModal({ contact, onClose }: EditContactModalProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Format birthdate for input (YYYY-MM-DD)
    const formattedBirthdate = contact.birthdate
        ? new Date(contact.birthdate).toISOString().split('T')[0]
        : '';

    const [phone, setPhone] = useState(contact.phone);

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length > 10) value = value.slice(0, 10);

        // Match (xxx) xxx-xxxx
        const match = value.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
        if (match) {
            let formatted = "";
            if (match[1]) formatted += "(" + match[1];
            if (match[1].length === 3) formatted += ") ";
            if (match[2]) formatted += match[2];
            if (match[2].length === 3) formatted += "-";
            if (match[3]) formatted += match[3];
            setPhone(formatted);
        } else {
            setPhone(value);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const data = {
            firstName: formData.get("firstName"),
            lastName: formData.get("lastName"),
            phone: phone, // Use formatted state
            email: formData.get("email"),
            status: formData.get("status"),
            birthdate: formData.get("birthdate"),
            notes: formData.get("notes"),
            optedOut: formData.get("optedOut") === "on",
        };

        try {
            const res = await fetch(`/api/contact/${contact.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error("Failed to update contact");

            router.refresh();
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this contact?")) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/contact/${contact.id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to delete contact");
            router.refresh(); // Refresh page list
            onClose();
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 50 }}>
            <div style={{ background: "white", padding: "1.5rem", borderRadius: "0.5rem", width: "100%", maxWidth: "500px", maxHeight: "90vh", overflowY: "auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#1f2937" }}>Edit Contact</h3>
                    <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}>&times;</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                        <div>
                            <label className="label">First Name</label>
                            <input name="firstName" defaultValue={contact.firstName} required className="input" />
                        </div>
                        <div>
                            <label className="label">Last Name</label>
                            <input name="lastName" defaultValue={contact.lastName} required className="input" />
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                        <div>
                            <label className="label">Email</label>
                            <input name="email" type="email" defaultValue={contact.email} required className="input" />
                        </div>
                        <div>
                            <label className="label">Phone</label>
                            <input
                                name="phone"
                                type="tel"
                                required
                                value={phone}
                                onChange={handlePhoneChange}
                                placeholder="(xxx) xxx-xxxx"
                                className="input"
                            />
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                        <div>
                            <label className="label">Status</label>
                            <select name="status" defaultValue={contact.status} className="input">
                                <option value="New">New</option>
                                <option value="Contacted">Contacted</option>
                                <option value="FollowUp">Follow Up</option>
                                <option value="Closed">Closed</option>
                                <option value="Archived">Archived</option>
                            </select>
                        </div>
                        <div>
                            <label className="label">Birthdate</label>
                            <input name="birthdate" type="date" defaultValue={formattedBirthdate} className="input" />
                        </div>
                    </div>

                    <div style={{ marginBottom: "1rem" }}>
                        <label className="label">Notes</label>
                        <textarea name="notes" defaultValue={contact.notes || ""} rows={4} className="input" />
                    </div>

                    <div style={{ marginBottom: "1rem" }}>
                        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                            <input
                                type="checkbox"
                                name="optedOut"
                                defaultChecked={contact.optedOut}
                                style={{ width: "auto" }}
                            />
                            <span style={{ fontSize: "0.875rem", fontWeight: "500", color: "#374151" }}>
                                Opted out of emails
                            </span>
                        </label>
                    </div>

                    {error && <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>}

                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1.5rem" }}>
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="btn"
                            style={{ background: "#fee2e2", color: "#991b1b", border: "none" }}
                            disabled={loading}
                        >
                            Delete Contact
                        </button>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button
                                type="button"
                                onClick={onClose}
                                className="btn btn-secondary"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
