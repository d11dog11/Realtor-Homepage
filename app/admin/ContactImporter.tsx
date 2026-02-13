"use client";

import { useState } from "react";

export default function ContactImporter() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleImport = async (provider: string) => {
        if (!confirm(`Import contacts from ${provider}? This may take a few moments.`)) {
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch("/api/admin/import-contacts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ provider }),
            });

            if (!response.ok) {
                throw new Error(`Failed to import contacts: ${response.statusText}`);
            }

            const data = await response.json();
            setResult(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ marginTop: "2rem", padding: "1.5rem", backgroundColor: "#f9fafb", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginTop: 0, marginBottom: "1rem" }}>
                📇 Import Contacts
            </h3>

            <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "1rem" }}>
                Import contacts from your connected email providers into your CRM.
            </p>

            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <button
                    onClick={() => handleImport("google")}
                    disabled={loading}
                    style={{
                        padding: "0.75rem 1.5rem",
                        backgroundColor: loading ? "#9ca3af" : "#4285F4",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: loading ? "not-allowed" : "pointer",
                        fontWeight: "500",
                        fontSize: "0.875rem",
                    }}
                >
                    {loading ? "Importing..." : "Import from Gmail"}
                </button>

                <button
                    onClick={() => handleImport("microsoft")}
                    disabled={loading}
                    style={{
                        padding: "0.75rem 1.5rem",
                        backgroundColor: loading ? "#9ca3af" : "#0078D4",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: loading ? "not-allowed" : "pointer",
                        fontWeight: "500",
                        fontSize: "0.875rem",
                    }}
                >
                    {loading ? "Importing..." : "Import from Outlook"}
                </button>

                <button
                    onClick={() => handleImport("yahoo")}
                    disabled={loading}
                    style={{
                        padding: "0.75rem 1.5rem",
                        backgroundColor: loading ? "#9ca3af" : "#6001D2",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: loading ? "not-allowed" : "pointer",
                        fontWeight: "500",
                        fontSize: "0.875rem",
                    }}
                >
                    {loading ? "Importing..." : "Import from Yahoo"}
                </button>
            </div>

            {result && (
                <div style={{
                    marginTop: "1rem",
                    padding: "1rem",
                    backgroundColor: "#d1fae5",
                    borderRadius: "6px",
                    border: "1px solid #6ee7b7"
                }}>
                    <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: "600", color: "#065f46" }}>
                        ✅ {result.message}
                    </p>
                    <ul style={{ margin: "0.5rem 0 0 0", paddingLeft: "1.5rem", fontSize: "0.875rem", color: "#047857" }}>
                        <li>New contacts imported: {result.imported}</li>
                        <li>Existing contacts updated: {result.updated}</li>
                        <li>Skipped (duplicates): {result.skipped}</li>
                        <li>Total processed: {result.total}</li>
                    </ul>
                </div>
            )}

            {error && (
                <div style={{
                    marginTop: "1rem",
                    padding: "1rem",
                    backgroundColor: "#fee2e2",
                    borderRadius: "6px",
                    border: "1px solid #fca5a5"
                }}>
                    <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: "600", color: "#991b1b" }}>
                        ❌ Error: {error}
                    </p>
                    <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.75rem", color: "#b91c1c" }}>
                        Make sure the provider is connected in the Integrations section.
                    </p>
                </div>
            )}
        </div>
    );
}
