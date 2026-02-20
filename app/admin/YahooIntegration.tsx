"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface YahooIntegrationProps {
    isConnected: boolean;
    providerEmail: string | null;
}

export default function YahooIntegration({ isConnected, providerEmail }: YahooIntegrationProps) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const router = useRouter();

    const handleConnect = () => {
        // Redirect to login route
        window.location.href = "/api/auth/yahoo/login";
    };

    const handleImportContacts = async () => {
        setLoading(true);
        setMessage("");
        try {
            const res = await fetch("/api/yahoo/contacts/import", { method: "POST" });
            const data = await res.json();
            if (res.ok) {
                setMessage(`Success! Found ${data.count} contacts.`);
            } else {
                setMessage(`Error: ${data.message || "Failed to import"}`);
            }
        } catch (err: any) {
            setMessage(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleTestEmail = async () => {
        setLoading(true);
        setMessage("");
        // Send to self or a placeholder
        const emailTo = providerEmail || "test@example.com";

        try {
            const res = await fetch("/api/yahoo/send-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    to: emailTo,
                    subject: "Test Email from Realtor CRM",
                    html: "<p>This is a test email sent via Yahoo OAuth!</p>"
                })
            });

            if (res.ok) {
                setMessage(`Email sent to ${emailTo}!Check your Sent folder too.`);
            } else {
                const text = await res.text();
                setMessage(`Error Sending: ${text}`);
            }
        } catch (err: any) {
            setMessage(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ background: "#064e3b", padding: "2rem", borderRadius: "1rem", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.4)", marginBottom: "2rem", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "1.5rem", color: "#f0fdf4", letterSpacing: "-0.01em" }}>Yahoo Integration</h2>

            {!isConnected ? (
                <div>
                    <p style={{ marginBottom: "2rem", color: "#d1fae5", lineHeight: "1.6" }}>Connect your Yahoo account to enable email sending, calendar sync, and contact imports.</p>
                    <button
                        onClick={handleConnect}
                        style={{
                            backgroundColor: "#6001d2",
                            color: "white",
                            padding: "0.875rem 1.75rem",
                            borderRadius: "0.5rem",
                            fontWeight: "700",
                            border: "none",
                            cursor: "pointer",
                            boxShadow: "0 4px 14px rgba(96, 1, 210, 0.4)",
                            transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        Connect Yahoo Mail
                    </button>
                </div>
            ) : (
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem", padding: "1rem", background: "rgba(0, 0, 0, 0.2)", borderRadius: "0.75rem", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                        <span style={{ height: "10px", width: "10px", backgroundColor: "#10b981", borderRadius: "50%", display: "inline-block", boxShadow: "0 0 10px #10b981" }}></span>
                        <span style={{ fontWeight: "600", color: "#f0fdf4" }}>Connected as <span style={{ color: "#10b981" }}>{providerEmail || "Yahoo User"}</span></span>
                    </div>

                    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                        <button
                            onClick={handleImportContacts}
                            disabled={loading}
                            className="btn btn-secondary"
                            style={{ padding: "0.75rem 1.5rem", fontWeight: "700", fontSize: "0.875rem" }}
                        >
                            {loading ? "Working..." : "Import Contacts"}
                        </button>
                        <button
                            onClick={handleTestEmail}
                            disabled={loading}
                            className="btn btn-primary"
                            style={{ padding: "0.75rem 1.5rem", fontWeight: "700", fontSize: "0.875rem" }}
                        >
                            {loading ? "Working..." : "Send Test Email"}
                        </button>
                    </div>

                    {message && (
                        <div style={{ marginTop: "1.5rem", padding: "1rem", background: message.includes("Error") ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)", border: `1px solid ${message.includes("Error") ? "rgba(239, 68, 68, 0.2)" : "rgba(16, 185, 129, 0.2)"}`, color: message.includes("Error") ? "#ef4444" : "#10b981", borderRadius: "0.5rem", fontSize: "0.875rem", fontWeight: "600" }}>
                            {message}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
