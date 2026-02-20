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
        <div style={{ padding: "2rem", backgroundColor: "#064e3b", borderRadius: "1rem", border: "1px solid rgba(16, 185, 129, 0.2)", height: "100%", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.4)" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "700", marginTop: 0, marginBottom: "1rem", color: "#f0fdf4" }}>
                📇 Import Contacts
            </h3>

            <p style={{ fontSize: "0.875rem", color: "#d1fae5", marginBottom: "1.5rem", opacity: "0.8" }}>
                Import contacts from your connected email providers into your CRM.
            </p>

            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <button
                    onClick={() => handleImport("google")}
                    disabled={loading}
                    style={{
                        padding: "0.75rem 1.25rem",
                        backgroundColor: loading ? "rgba(156, 163, 175, 0.2)" : "#DB4437",
                        color: "white",
                        border: "none",
                        borderRadius: "0.5rem",
                        cursor: loading ? "not-allowed" : "pointer",
                        fontWeight: "700",
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.025em"
                    }}
                >
                    {loading ? "Importing..." : "Gmail"}
                </button>

                <button
                    onClick={() => handleImport("microsoft")}
                    disabled={loading}
                    style={{
                        padding: "0.75rem 1.25rem",
                        backgroundColor: loading ? "rgba(156, 163, 175, 0.2)" : "#0078D4",
                        color: "white",
                        border: "none",
                        borderRadius: "0.5rem",
                        cursor: loading ? "not-allowed" : "pointer",
                        fontWeight: "700",
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.025em"
                    }}
                >
                    {loading ? "Importing..." : "Outlook"}
                </button>

                <button
                    onClick={() => handleImport("yahoo")}
                    disabled={loading}
                    style={{
                        padding: "0.75rem 1.25rem",
                        backgroundColor: loading ? "rgba(156, 163, 175, 0.2)" : "#6001D2",
                        color: "white",
                        border: "none",
                        borderRadius: "0.5rem",
                        cursor: loading ? "not-allowed" : "pointer",
                        fontWeight: "700",
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.025em"
                    }}
                >
                    {loading ? "Importing..." : "Yahoo"}
                </button>
            </div>

            {result && (
                <div style={{
                    marginTop: "1.5rem",
                    padding: "1.25rem",
                    backgroundColor: "rgba(16, 185, 129, 0.1)",
                    borderRadius: "0.75rem",
                    border: "1px solid rgba(16, 185, 129, 0.2)"
                }}>
                    <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: "700", color: "#10b981" }}>
                        ✅ {result.message}
                    </p>
                    <ul style={{ margin: "0.75rem 0 0 0", paddingLeft: "1.25rem", fontSize: "0.875rem", color: "#d1fae5", lineHeight: "1.6" }}>
                        <li>New contacts imported: <span style={{ fontWeight: "700", color: "#f0fdf4" }}>{result.imported}</span></li>
                        <li>Existing contacts updated: <span style={{ fontWeight: "700", color: "#f0fdf4" }}>{result.updated}</span></li>
                        <li>Skipped (duplicates): <span style={{ fontWeight: "700", color: "#f0fdf4" }}>{result.skipped}</span></li>
                        <li>Total processed: <span style={{ fontWeight: "700", color: "#f0fdf4" }}>{result.total}</span></li>
                    </ul>
                </div>
            )}

            {error && (
                <div style={{
                    marginTop: "1.5rem",
                    padding: "1.25rem",
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                    borderRadius: "0.75rem",
                    border: "1px solid rgba(239, 68, 68, 0.2)"
                }}>
                    <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: "700", color: "#ef4444" }}>
                        ❌ Error: {error}
                    </p>
                    <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.75rem", color: "#d1fae5", opacity: "0.7" }}>
                        Make sure the provider is connected in the Integrations section.
                    </p>
                </div>
            )}
        </div>
    );
}
