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
        <div style={{ padding: "1.5rem", background: "white", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "1rem", color: "#064e3b" }}>Yahoo Integration</h2>

            {!isConnected ? (
                <div>
                    <p style={{ marginBottom: "1rem", color: "#4b5563" }}>Connect your Yahoo account to enable email sending, calendar sync, and contact imports.</p>
                    <button
                        onClick={handleConnect}
                        style={{
                            backgroundColor: "#6001d2", // Yahoo Purple ish
                            color: "white",
                            padding: "0.5rem 1rem",
                            borderRadius: "4px",
                            fontWeight: "bold",
                            border: "none",
                            cursor: "pointer"
                        }}
                    >
                        Connect Yahoo Mail
                    </button>
                </div>
            ) : (
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                        <span style={{ height: "10px", width: "10px", backgroundColor: "#22c55e", borderRadius: "50%", display: "inline-block" }}></span>
                        <span style={{ fontWeight: "500", color: "#374151" }}>Connected as {providerEmail || "Yahoo User"}</span>
                    </div>

                    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                        <button
                            onClick={handleImportContacts}
                            disabled={loading}
                            className="btn btn-secondary"
                            style={{ fontSize: "0.9rem", padding: "0.5rem 1rem", opacity: loading ? 0.7 : 1 }}
                        >
                            {loading ? "Working..." : "Import Contacts"}
                        </button>
                        <button
                            onClick={handleTestEmail}
                            disabled={loading}
                            className="btn btn-primary"
                            style={{ fontSize: "0.9rem", padding: "0.5rem 1rem", opacity: loading ? 0.7 : 1 }}
                        >
                            {loading ? "Working..." : "Send Test Email"}
                        </button>
                    </div>

                    {message && (
                        <div style={{ marginTop: "1rem", padding: "0.75rem", backgroundColor: "#f3f4f6", borderRadius: "4px", fontSize: "0.9rem" }}>
                            {message}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
