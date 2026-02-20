"use client";

import { useState, useEffect } from "react";

interface Integration {
    provider: string;
    providerEmail: string | null;
    connected: boolean;
}

const PROVIDERS = [
    { id: "google", name: "Gmail (Google)", icon: "📧", color: "#DB4437" },
    { id: "microsoft", name: "Outlook (Microsoft)", icon: "📮", color: "#0078D4" },
    { id: "yahoo", name: "Yahoo Mail", icon: "📬", color: "#6001D2" },
];

export default function IntegrationsManager() {
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchIntegrations();
    }, []);

    const fetchIntegrations = async () => {
        try {
            const response = await fetch("/api/admin/integrations");
            const data = await response.json();
            setIntegrations(data);
        } catch (error) {
            console.error("Failed to fetch integrations:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = (provider: string) => {
        window.location.href = `/api/auth/${provider}/login`;
    };

    const handleDisconnect = async (provider: string) => {
        if (!confirm(`Are you sure you want to disconnect ${provider}?`)) {
            return;
        }
        window.location.href = `/api/auth/${provider}/logout`;
    };

    if (loading) {
        return (
            <div style={{ padding: "0", textAlign: "center" }}>
                <p>Loading integrations...</p>
            </div>
        );
    }

    return (
        <div style={{ padding: "0" }}>
            <h1 style={{ fontSize: "2rem", fontWeight: "700", color: "#f0fdf4", margin: 0, marginBottom: "3rem", letterSpacing: "-0.025em" }}>
                Email & Calendar Integrations
            </h1>

            <div style={{ display: "grid", gap: "1.5rem", maxWidth: "850px" }}>
                {PROVIDERS.map((provider) => {
                    const integration = integrations.find((i) => i.provider === provider.id);
                    const isConnected = integration?.connected || false;

                    return (
                        <div
                            key={provider.id}
                            style={{
                                border: "1px solid rgba(16, 185, 129, 0.2)",
                                borderRadius: "1rem",
                                padding: "2rem",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                backgroundColor: isConnected ? "rgba(16, 185, 129, 0.1)" : "#064e3b",
                                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.4)",
                                transition: "all 0.3s ease"
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                                <div style={{
                                    width: "3.5rem",
                                    height: "3.5rem",
                                    borderRadius: "1rem",
                                    background: "rgba(0, 0, 0, 0.2)",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    fontSize: "1.75rem"
                                }}>
                                    {provider.icon}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: "1.25rem", fontWeight: "700", margin: 0, color: "#f0fdf4" }}>
                                        {provider.name}
                                    </h3>
                                    {isConnected && integration?.providerEmail && (
                                        <p style={{ fontSize: "0.875rem", color: "#d1fae5", margin: "0.5rem 0 0 0", fontWeight: "500" }}>
                                            Connected as: <span style={{ color: "#10b981" }}>{integration.providerEmail}</span>
                                        </p>
                                    )}
                                    {!isConnected && (
                                        <p style={{ fontSize: "0.875rem", color: "#d1fae5", margin: "0.5rem 0 0 0", opacity: "0.6" }}>
                                            Not connected
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                {isConnected ? (
                                    <button
                                        onClick={() => handleDisconnect(provider.id)}
                                        style={{
                                            padding: "0.75rem 1.5rem",
                                            backgroundColor: "rgba(239, 68, 68, 0.1)",
                                            color: "#ef4444",
                                            border: "1px solid rgba(239, 68, 68, 0.2)",
                                            borderRadius: "0.5rem",
                                            cursor: "pointer",
                                            fontWeight: "700",
                                            fontSize: "0.75rem",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.025em"
                                        }}
                                    >
                                        Disconnect
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleConnect(provider.id)}
                                        style={{
                                            padding: "0.75rem 1.5rem",
                                            backgroundColor: provider.color,
                                            color: "white",
                                            border: "none",
                                            borderRadius: "0.5rem",
                                            cursor: "pointer",
                                            fontWeight: "700",
                                            fontSize: "0.75rem",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.025em",
                                            boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
                                        }}
                                    >
                                        Connect
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div style={{ marginTop: "3rem", padding: "2rem", backgroundColor: "rgba(16, 185, 129, 0.05)", borderRadius: "1rem", border: "1px solid rgba(16, 185, 129, 0.1)", maxWidth: "850px" }}>
                <h4 style={{ fontSize: "1.125rem", fontWeight: "700", marginTop: 0, color: "#10b981", marginBottom: "1rem" }}>
                    📋 Integration Features
                </h4>
                <ul style={{ fontSize: "0.875rem", color: "#d1fae5", lineHeight: "1.8", margin: 0, paddingLeft: "1.5rem" }}>
                    <li><strong>Email:</strong> Send emails directly from your connected account</li>
                    <li><strong>Calendar:</strong> Create and manage calendar events</li>
                    <li><strong>Contacts:</strong> Import and sync contacts from your email provider</li>
                </ul>
            </div>
        </div>
    );
}
