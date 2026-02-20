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
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 100 }}>
            <div style={{ background: "#064e3b", padding: "2.5rem", borderRadius: "1.25rem", width: "100%", maxWidth: "550px", maxHeight: "90vh", overflowY: "auto", border: "1px solid rgba(16, 185, 129, 0.2)", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                    <h3 style={{ fontSize: "1.5rem", fontWeight: "700", color: "#f0fdf4", margin: 0, letterSpacing: "-0.01em" }}>Edit Contact</h3>
                    <button onClick={onClose} style={{ background: "rgba(0, 0, 0, 0.2)", border: "none", width: "2.5rem", height: "2.5rem", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "1.25rem", cursor: "pointer", color: "#d1fae5", transition: "all 0.2s" }}>&times;</button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#d1fae5", marginBottom: "0.5rem" }}>First Name</label>
                            <input name="firstName" defaultValue={contact.firstName} required style={{ width: "100%", padding: "0.75rem", background: "rgba(0, 0, 0, 0.2)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "0.5rem", color: "#ffffff", outline: "none" }} />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#d1fae5", marginBottom: "0.5rem" }}>Last Name</label>
                            <input name="lastName" defaultValue={contact.lastName} required style={{ width: "100%", padding: "0.75rem", background: "rgba(0, 0, 0, 0.2)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "0.5rem", color: "#ffffff", outline: "none" }} />
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#d1fae5", marginBottom: "0.5rem" }}>Email</label>
                            <input name="email" type="email" defaultValue={contact.email} required style={{ width: "100%", padding: "0.75rem", background: "rgba(0, 0, 0, 0.2)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "0.5rem", color: "#ffffff", outline: "none" }} />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#d1fae5", marginBottom: "0.5rem" }}>Phone</label>
                            <input
                                name="phone"
                                type="tel"
                                required
                                value={phone}
                                onChange={handlePhoneChange}
                                placeholder="(xxx) xxx-xxxx"
                                style={{ width: "100%", padding: "0.75rem", background: "rgba(0, 0, 0, 0.2)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "0.5rem", color: "#ffffff", outline: "none" }}
                            />
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#d1fae5", marginBottom: "0.5rem" }}>Status</label>
                            <select name="status" defaultValue={contact.status} style={{ width: "100%", padding: "0.75rem", background: "rgba(0, 0, 0, 0.2)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "0.5rem", color: "#ffffff", outline: "none", appearance: "none" }}>
                                <option value="New" style={{ background: "#064e3b" }}>New</option>
                                <option value="Contacted" style={{ background: "#064e3b" }}>Contacted</option>
                                <option value="FollowUp" style={{ background: "#064e3b" }}>Follow Up</option>
                                <option value="Closed" style={{ background: "#064e3b" }}>Closed</option>
                                <option value="Archived" style={{ background: "#064e3b" }}>Archived</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#d1fae5", marginBottom: "0.5rem" }}>Birthdate</label>
                            <input name="birthdate" type="date" defaultValue={formattedBirthdate} style={{ width: "100%", padding: "0.75rem", background: "rgba(0, 0, 0, 0.2)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "0.5rem", color: "#ffffff", outline: "none" }} />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#d1fae5", marginBottom: "0.5rem" }}>Notes</label>
                        <textarea name="notes" defaultValue={contact.notes || ""} rows={4} style={{ width: "100%", padding: "0.75rem", background: "rgba(0, 0, 0, 0.2)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "0.5rem", color: "#ffffff", outline: "none", resize: "none" }} />
                    </div>

                    <div>
                        <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }}>
                            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                                <input
                                    type="checkbox"
                                    name="optedOut"
                                    defaultChecked={contact.optedOut}
                                    style={{
                                        width: "1.25rem",
                                        height: "1.25rem",
                                        appearance: "none",
                                        background: "rgba(0, 0, 0, 0.2)",
                                        border: "1px solid rgba(16, 185, 129, 0.3)",
                                        borderRadius: "0.25rem",
                                        cursor: "pointer",
                                        position: "relative"
                                    }}
                                />
                            </div>
                            <span style={{ fontSize: "0.875rem", fontWeight: "600", color: "#d1fae5" }}>
                                Opted out of emails
                            </span>
                        </label>
                    </div>

                    {error && <p style={{ color: "#ef4444", fontSize: "0.875rem", fontWeight: "600", margin: 0 }}>{error}</p>}

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem" }}>
                        <button
                            type="button"
                            onClick={handleDelete}
                            style={{ padding: "0.75rem 1.25rem", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "0.5rem", cursor: "pointer", fontWeight: "700", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.025em" }}
                            disabled={loading}
                        >
                            Delete Contact
                        </button>
                        <div style={{ display: "flex", gap: "1rem" }}>
                            <button
                                type="button"
                                onClick={onClose}
                                style={{ padding: "0.75rem 1.5rem", border: "1px solid rgba(16, 185, 129, 0.3)", background: "transparent", color: "#d1fae5", borderRadius: "0.5rem", cursor: "pointer", fontWeight: "600" }}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ padding: "0.75rem 1.5rem", fontWeight: "700" }}
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
