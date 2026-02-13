"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewContactForm() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [phone, setPhone] = useState("");

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
            phone: phone, // Use the state value
            email: formData.get("email"),
            birthdate: formData.get("birthdate"),
            notes: formData.get("notes"),
        };

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                body: JSON.stringify(data),
                headers: { "Content-Type": "application/json" },
            });

            if (!res.ok) throw new Error("Failed to create contact");

            setIsOpen(false);
            setPhone(""); // Reset phone
            router.refresh(); // Reloads the server component to show new data
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="btn btn-primary"
                style={{ fontSize: "0.875rem", padding: "0.5rem 1rem" }}
            >
                + New Contact
            </button>
        );
    }

    return (
        <div style={{
            background: "white",
            padding: "1.5rem",
            borderRadius: "0.5rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            marginBottom: "2rem",
            border: "1px solid #e5e7eb"
        }}>
            <h3 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "1rem", color: "#1f2937" }}>
                New Contact Details
            </h3>

            <form onSubmit={handleSubmit}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                    <div>
                        <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "#374151" }}>First Name</label>
                        <input name="firstName" required style={{ width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "0.375rem" }} />
                    </div>
                    <div>
                        <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "#374151" }}>Last Name</label>
                        <input name="lastName" required style={{ width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "0.375rem" }} />
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                    <div>
                        <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "#374151" }}>Email</label>
                        <input name="email" type="email" required style={{ width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "0.375rem" }} />
                    </div>
                    <div>
                        <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "#374151" }}>Phone</label>
                        <input
                            name="phone"
                            type="tel"
                            required
                            value={phone}
                            onChange={handlePhoneChange}
                            placeholder="(xxx) xxx-xxxx"
                            style={{ width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "0.375rem" }}
                        />
                    </div>
                </div>

                <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "#374151" }}>Birthdate (Optional)</label>
                    <input name="birthdate" type="date" style={{ width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "0.375rem" }} />
                </div>

                <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "#374151" }}>Notes (Optional)</label>
                    <textarea name="notes" rows={3} style={{ width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "0.375rem" }} />
                </div>

                {error && <p style={{ color: "#dc2626", fontSize: "0.875rem", marginBottom: "1rem" }}>{error}</p>}

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        style={{ padding: "0.5rem 1rem", border: "1px solid #d1d5db", background: "white", borderRadius: "0.375rem", cursor: "pointer" }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                        style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}
                    >
                        {loading ? "Saving..." : "Save Contact"}
                    </button>
                </div>
            </form>
        </div>
    );
}
